const decisionService = require("../services/decision.service");
const NotificationEvent = require("../models/NotificationEvent");
const AuditLog = require("../models/AuditLog");

exports.evaluateNotification = async (req, res) => {
  try {
    const event = req.body;
    const result = await decisionService.evaluate(event);
    const savedEvent = await NotificationEvent.create({
      ...event,
      status: result.decision
    });
    await AuditLog.create({
      event_id: savedEvent._id,
      decision: result.decision,
      reason: result.reason,
      score: result.score || null
    });
    res.json(result);
  } catch (error) {
    console.error('Error in evaluateNotification:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};