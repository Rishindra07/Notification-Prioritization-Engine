const mongoose = require("mongoose");

const AuditSchema = new mongoose.Schema({
  event_id: String,
  decision: String,
  reason: String,
  score: Number
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", AuditSchema);