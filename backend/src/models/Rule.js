const mongoose = require("mongoose");



/**
 * Possible rule names for notification rules.
 * Extend this array as new rule types are added to the system.
 */
const RULE_NAME_ENUM = [
  "suppress_duplicates",
  "limit_promotions",
  "urgent_alerts",
  "quiet_hours",
  "custom_rule"
];

/**
 * Possible event types for notifications.
 * Extend this array as new event types are added to the system.
 */
const EVENT_TYPE_ENUM = [
  "message",
  "reminder",
  "update",
  "alert",
  "promotion",
  "system_event",
  "security_alert"
];

/**
 * Rule Schema
 * - rule_name: Name of the rule (required)
 * - event_type: Type of event this rule applies to (required, enum)
 * - decision: What to do (NOW/LATER/NEVER) (required)
 * - priority_override: If true, overrides normal priority (default: false)
 * - is_active: If rule is active (default: true)
 */
const RuleSchema = new mongoose.Schema({
  rule_name: {
    type: String,
    enum: RULE_NAME_ENUM,
    required: true
  },
  event_type: {
    type: String,
    enum: EVENT_TYPE_ENUM,
    required: true
  },
  decision: {
    type: String,
    enum: ["NOW", "LATER", "NEVER"],
    required: true
  },
  priority_override: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Rule", RuleSchema);