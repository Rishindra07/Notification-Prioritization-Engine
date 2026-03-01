const mongoose = require("mongoose");

const EVENT_TYPE_ENUM = [
  "message",
  "reminder",
  "update",
  "alert",
  "promotion",
  "system_event",
  "security_alert"
];

const NotificationEventSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    event_type: { type: String, enum: EVENT_TYPE_ENUM, required: true, index: true },
    title: { type: String, default: "" },
    message: { type: String, required: true },
    source: { type: String, default: "unknown", index: true },
    priority_hint: { type: String, enum: ["low", "normal", "high"], default: "normal" },
    timestamp: { type: Date, default: Date.now, index: true },
    channel: { type: String, required: true, default: "push" },
    metadata: { type: Object, default: {} },
    dedupe_key: { type: String, index: true },
    normalized_hash: { type: String, index: true },
    expires_at: { type: Date, default: null },
    status: { type: String, enum: ["NOW", "LATER", "NEVER"], required: true, index: true },
    decision_reason: { type: String, required: true },
    decision_source: {
      type: String,
      enum: ["EXPIRY", "DEDUPE", "RULE", "FATIGUE", "SCORING", "AI", "FALLBACK"],
      required: true
    },
    queue_attempts: { type: Number, default: 0 },
    queue_last_error: { type: String, default: null },
    queue_next_retry_at: { type: Date, default: null, index: true },
    ai_status: { type: String, enum: ["PENDING", "DONE", "FAILED", "FALLBACK"], default: "PENDING" },
    ai_analysis: {
      model: { type: String, default: null },
      confidence: { type: Number, default: null },
      reason: { type: String, default: null },
      used_fallback: { type: Boolean, default: false },
      raw: { type: Object, default: null }
    },
    is_deleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

NotificationEventSchema.index({ user_id: 1, createdAt: -1 });
NotificationEventSchema.index({ status: 1, queue_next_retry_at: 1 });

module.exports = mongoose.model("NotificationEvent", NotificationEventSchema);
