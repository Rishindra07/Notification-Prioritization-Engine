const mongoose = require("mongoose");

const AuditSchema = new mongoose.Schema(
  {
    event_id: { type: String, required: true, index: true },
    user_id: { type: String, required: true, index: true },
    event_type: { type: String, required: true, index: true },
    decision: { type: String, enum: ["NOW", "LATER", "NEVER"], required: true, index: true },
    reason: { type: String, required: true },
    decision_source: { type: String, required: true },
    rule_id: { type: String, default: null },
    rule_name: { type: String, default: null },
    near_duplicate_score: { type: Number, default: null },
    ai_model: { type: String, default: null },
    ai_confidence: { type: Number, default: null },
    ai_fallback_used: { type: Boolean, default: false },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

AuditSchema.pre("findOneAndUpdate", function denyUpdate(next) {
  return next(new Error("Audit logs are append-only"));
});

module.exports = mongoose.model("AuditLog", AuditSchema);
