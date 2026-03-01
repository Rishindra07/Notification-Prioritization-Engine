const DeadLetterEvent = require("../models/DeadLetterEvent");

async function preserveUnprocessedEvent(eventPayload, reason, processingStage = "UNKNOWN", retries = 0) {
  await DeadLetterEvent.create({
    event_payload: eventPayload,
    reason,
    processing_stage: processingStage,
    retries
  });
}

module.exports = { preserveUnprocessedEvent };
