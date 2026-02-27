const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema({
  rule_name: String,
  event_type: String,
  decision: String, // NOW / LATER / NEVER
  priority_override: Boolean,
  is_active: Boolean
});

module.exports = mongoose.model("Rule", RuleSchema);