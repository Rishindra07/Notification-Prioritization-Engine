const Rule = require("../models/Rule.js");
const dedupeService = require("./dedupe.service.js");
const fatigueService = require("./fatigue.service.js");
const scoringService = require("./scoring.service.js");

exports.evaluate = async (event) => {

  // 1. Expiry Check
  if (event.expires_at && new Date() > new Date(event.expires_at)) {
    return { decision: "NEVER", reason: "Notification expired" };
  }

  // 2. Duplicate Check
  const isDuplicate = await dedupeService.checkDuplicate(event);
  if (isDuplicate) {
    return { decision: "NEVER", reason: "Duplicate detected" };
  }

  // 3. Custom Rule Check
  const rule = await Rule.findOne({
    event_type: event.event_type,
    is_active: true
  });

  if (rule) {
    return { decision: rule.decision, reason: "Matched custom rule" };
  }

  // 4. Fatigue Check
  const fatigue = await fatigueService.checkFatigue(event.user_id);
  if (fatigue) return fatigue;

  // 5. Score Based Decision
  const score = scoringService.calculateScore(event);

  if (score >= 80)
    return { decision: "NOW", reason: "High priority score", score };

  if (score >= 40)
    return { decision: "LATER", reason: "Medium priority score", score };

  return { decision: "NEVER", reason: "Low priority score", score };
};