const mongoose = require("mongoose");

/**
 * AuditLog Schema
 * - event_id: Related notification event (required)
 * - decision: NOW/LATER/NEVER (required)
 * - reason: Explanation for decision (required)
 * - score: Priority score (optional)
 */
const AuditSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: true
  },
  decision: {
    type: String,
    enum: ["NOW", "LATER", "NEVER"],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  score: Number
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", AuditSchema);