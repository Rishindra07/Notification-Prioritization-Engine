const NotificationEvent = require("../models/NotificationEvent");
const AuditLog = require("../models/AuditLog");
const decisionService = require("../services/decision.service");
const aiService = require("../services/ai.service");
const fatigueService = require("../services/fatigue.service");
const { publish, emitter } = require("../services/realtime.service");
const { processLaterQueue } = require("../services/laterQueue.service");

exports.evaluateNotification = async (req, res) => {
  try {
    const required = ["user_id", "event_type", "message", "channel"];
    for (const field of required) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const payload = {
      user_id: req.body.user_id,
      event_type: req.body.event_type,
      title: req.body.title || "",
      message: req.body.message,
      source: req.body.source || "simulator",
      priority_hint: req.body.priority_hint || "normal",
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
      channel: req.body.channel,
      metadata: req.body.metadata || {},
      dedupe_key: req.body.dedupe_key || null,
      expires_at: req.body.expires_at ? new Date(req.body.expires_at) : null
    };

    const decision = await decisionService.evaluate(payload);

    const saved = await NotificationEvent.create({
      ...payload,
      status: decision.decision,
      decision_reason: decision.reason,
      decision_source: decision.decision_source,
      queue_next_retry_at:
        decision.decision === "LATER"
          ? new Date(Date.now() + Number(process.env.LATER_QUEUE_INTERVAL_SECONDS || 30) * 1000)
          : null
    });

    await AuditLog.create({
      event_id: saved._id.toString(),
      user_id: saved.user_id,
      event_type: saved.event_type,
      decision: decision.decision,
      reason: decision.reason,
      decision_source: decision.decision_source,
      rule_id: decision.rule_id || null,
      rule_name: decision.rule_name || null,
      near_duplicate_score: decision.near_duplicate_score || null
    });

    if (decision.decision === "NOW") {
      await fatigueService.recordNotification(saved.user_id);
    }

    publish("event.created", {
      event_id: saved._id.toString(),
      status: saved.status,
      decision_source: saved.decision_source
    });

    void aiService
      .analyzeAndApply(saved)
      .catch(async (err) => {
        await NotificationEvent.findByIdAndUpdate(saved._id, { ai_status: "FAILED" });
      });

    return res.status(201).json({
      event_id: saved._id,
      decision: decision.decision,
      reason: decision.reason,
      decision_source: decision.decision_source
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { user_id, event_type, decision, source, q, start, end, limit = 100 } = req.query;
    const filter = {};
    if (user_id) filter.user_id = user_id;
    if (event_type) filter.event_type = event_type;
    if (decision) filter.decision = decision;
    if (source) filter.decision_source = source;
    if (q) filter.reason = { $regex: q, $options: "i" };
    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lte = new Date(end);
    }
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(Math.min(Number(limit), 200));
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const [totalEvents, nowCount, laterCount, neverCount, fallbackCount, aiFallbackCount] = await Promise.all([
      NotificationEvent.countDocuments({ is_deleted: false }),
      NotificationEvent.countDocuments({ is_deleted: false, status: "NOW" }),
      NotificationEvent.countDocuments({ is_deleted: false, status: "LATER" }),
      NotificationEvent.countDocuments({ is_deleted: false, status: "NEVER" }),
      NotificationEvent.countDocuments({ is_deleted: false, decision_source: "FALLBACK" }),
      AuditLog.countDocuments({ ai_fallback_used: true })
    ]);

    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = await NotificationEvent.countDocuments({ is_deleted: false, createdAt: { $gte: lastHour } });

    const trend = await NotificationEvent.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, is_deleted: false } },
      {
        $group: {
          _id: {
            hour: { $hour: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { "_id.hour": 1 } }
    ]);

    return res.json({
      totals: { totalEvents, nowCount, laterCount, neverCount, recentEvents, fallbackCount, aiFallbackCount },
      trend
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.getLaterQueue = async (req, res) => {
  try {
    const items = await NotificationEvent.find({ is_deleted: false, status: "LATER" })
      .sort({ queue_next_retry_at: 1, createdAt: 1 })
      .limit(200);
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.retryLaterQueueNow = async (req, res) => {
  await processLaterQueue();
  return res.json({ success: true });
};

exports.getEvents = async (req, res) => {
  const events = await NotificationEvent.find({ is_deleted: false }).sort({ createdAt: -1 }).limit(100);
  return res.json(events);
};

exports.stream = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const handler = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  emitter.on("all", handler);
  res.write(`data: ${JSON.stringify({ event: "connected", timestamp: new Date().toISOString() })}\n\n`);

  req.on("close", () => {
    emitter.off("all", handler);
    res.end();
  });
};
