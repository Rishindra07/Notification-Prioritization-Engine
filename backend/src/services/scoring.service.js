function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calculateScore(event) {
  let score = 50;

  if (event.priority_hint === "high") score += 20;
  if (event.priority_hint === "low") score -= 20;

  if (event.event_type === "security_alert") score += 30;
  if (event.event_type === "alert") score += 15;
  if (event.event_type === "promotion") score -= 25;

  if ((event.channel || "").toLowerCase() === "sms") score += 5;
  if ((event.source || "").toLowerCase().includes("billing")) score += 10;

  return clamp(score, 0, 100);
}

function scoreToDecision(score) {
  if (score >= 75) return "NOW";
  if (score >= 40) return "LATER";
  return "NEVER";
}

module.exports = { calculateScore, scoreToDecision };
