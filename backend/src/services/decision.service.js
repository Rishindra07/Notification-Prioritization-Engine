const Rule = require("../models/Rule");
const { checkDuplicate } = require("./dedupe.service");
const fatigueService = require("./fatigue.service");
const { calculateScore, scoreToDecision } = require("./scoring.service");
const deadletterService = require("./deadletter.service");

function matchesRule(rule, event) {
  const c = rule.conditions || {};
  const eventTypeMatch = c.event_type === "ANY" || c.event_type === event.event_type;
  const sourceMatch = c.source === "ANY" || c.source === (event.source || "");
  const channelMatch = c.channel === "ANY" || c.channel === (event.channel || "");
  const priorityMatch = c.priority_hint === "ANY" || c.priority_hint === (event.priority_hint || "normal");
  const keyword = (c.keyword_contains || "").trim().toLowerCase();
  const message = `${event.title || ""} ${event.message || ""}`.toLowerCase();
  const keywordMatch = !keyword || message.includes(keyword);

  return eventTypeMatch && sourceMatch && channelMatch && priorityMatch && keywordMatch;
}

async function evaluate(event, options = {}) {
  try {
    if (event.expires_at && new Date() > new Date(event.expires_at)) {
      return { decision: "NEVER", reason: "Notification expired", decision_source: "EXPIRY" };
    }

    if (!options.skipDedupe) {
      const duplicateCheck = await checkDuplicate(event);
      if (duplicateCheck.isDuplicate) {
        return {
          decision: "NEVER",
          reason: duplicateCheck.reason,
          decision_source: "DEDUPE",
          near_duplicate_score: duplicateCheck.similarity
        };
      }
    }

    const activeRules = await Rule.find({ is_active: true, is_deleted: false }).sort({ priority: 1 }).lean();
    for (const rule of activeRules) {
      if (matchesRule(rule, event)) {
        return {
          decision: rule.decision,
          reason: rule.reason_template || `Matched rule: ${rule.name}`,
          decision_source: "RULE",
          rule_id: rule._id.toString(),
          rule_name: rule.name
        };
      }
    }

    const fatigueDecision = await fatigueService.checkFatigue(event.user_id);
    if (fatigueDecision) {
      return {
        decision: fatigueDecision.decision,
        reason: fatigueDecision.reason,
        decision_source: "FATIGUE"
      };
    }

    const score = calculateScore(event);
    return {
      decision: scoreToDecision(score),
      reason: `Score-based classification (${score})`,
      decision_source: "SCORING",
      score
    };
  } catch (err) {
    await deadletterService.preserveUnprocessedEvent(event, err.message, "decision_pipeline");
    return {
      decision: "LATER",
      reason: `Pipeline failed, deferred safely: ${err.message}`,
      decision_source: "FALLBACK"
    };
  }
}

module.exports = { evaluate };
