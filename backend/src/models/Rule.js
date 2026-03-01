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

const RuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    conditions: {
      event_type: { type: String, enum: [...EVENT_TYPE_ENUM, "ANY"], default: "ANY" },
      source: { type: String, default: "ANY" },
      channel: { type: String, default: "ANY" },
      priority_hint: { type: String, enum: ["low", "normal", "high", "ANY"], default: "ANY" },
      keyword_contains: { type: String, default: "" }
    },
    decision: { type: String, enum: ["NOW", "LATER", "NEVER"], required: true },
    reason_template: { type: String, required: true },
    priority: { type: Number, default: 100 },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

RuleSchema.index({ is_active: 1, is_deleted: 1, priority: 1 });

module.exports = mongoose.model("Rule", RuleSchema);
