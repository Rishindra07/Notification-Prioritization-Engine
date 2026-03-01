const NotificationEvent = require("../models/NotificationEvent");
const AuditLog = require("../models/AuditLog");
const decisionService = require("./decision.service");
const deadletterService = require("./deadletter.service");
const { getQueueSettings } = require("./settings.service");
const { publish } = require("./realtime.service");

let timer = null;
const queueHealth = {
  running: false,
  lastRunAt: null,
  lastError: null,
  processedInLastRun: 0
};

async function processLaterQueue() {
  queueHealth.running = true;
  queueHealth.lastRunAt = new Date().toISOString();
  queueHealth.processedInLastRun = 0;

  try {
    const settings = await getQueueSettings();
    const now = new Date();

    const events = await NotificationEvent.find({
      is_deleted: false,
      status: "LATER",
      $or: [{ queue_next_retry_at: null }, { queue_next_retry_at: { $lte: now } }]
    })
      .sort({ createdAt: 1 })
      .limit(50);

    for (const event of events) {
      try {
        const decision = await decisionService.evaluate(event.toObject(), { skipDedupe: true });

        if (decision.decision === "LATER") {
          event.queue_attempts += 1;
          const nextSeconds = Number(settings.retry_backoff_seconds) * Math.max(1, event.queue_attempts);
          event.queue_next_retry_at = new Date(Date.now() + nextSeconds * 1000);
          event.queue_last_error = decision.reason;

          if (event.queue_attempts >= Number(settings.max_retries)) {
            await deadletterService.preserveUnprocessedEvent(
              event.toObject(),
              "LATER queue retries exhausted",
              "later_queue",
              event.queue_attempts
            );
            event.status = "NEVER";
            event.decision_reason = "Moved to dead-letter after retry exhaustion";
            event.decision_source = "FALLBACK";
          }
        } else {
          event.status = decision.decision;
          event.decision_reason = decision.reason;
          event.decision_source = decision.decision_source;
          event.queue_last_error = null;
          event.queue_next_retry_at = null;
        }

        await event.save();
        queueHealth.processedInLastRun += 1;

        await AuditLog.create({
          event_id: event._id.toString(),
          user_id: event.user_id,
          event_type: event.event_type,
          decision: event.status,
          reason: event.decision_reason,
          decision_source: event.decision_source,
          metadata: { queue_attempts: event.queue_attempts }
        });

        publish("queue.processed", {
          event_id: event._id.toString(),
          status: event.status,
          attempts: event.queue_attempts
        });
      } catch (eventErr) {
        event.queue_attempts += 1;
        event.queue_last_error = eventErr.message;
        event.queue_next_retry_at = new Date(Date.now() + 60000);
        await event.save();
      }
    }
  } catch (err) {
    queueHealth.lastError = err.message;
  } finally {
    queueHealth.running = false;
  }
}

function startLaterQueueProcessor() {
  if (timer) return;
  const intervalSeconds = Number(process.env.LATER_QUEUE_INTERVAL_SECONDS || 30);
  timer = setInterval(processLaterQueue, intervalSeconds * 1000);
}

function getQueueHealth() {
  return queueHealth;
}

module.exports = {
  startLaterQueueProcessor,
  processLaterQueue,
  getQueueHealth
};
