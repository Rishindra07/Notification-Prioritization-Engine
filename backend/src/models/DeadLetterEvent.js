const mongoose = require("mongoose");

const DeadLetterEventSchema = new mongoose.Schema(
  {
    event_payload: { type: Object, required: true },
    reason: { type: String, required: true },
    processing_stage: { type: String, required: true },
    retries: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeadLetterEvent", DeadLetterEventSchema);
