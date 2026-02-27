exports.calculateScore = (event) => {

  let score = 50;

  if (event.priority_hint === "high") score += 30;
  if (event.priority_hint === "low") score -= 20;

  if (event.event_type === "security_alert") score += 40;
  if (event.event_type === "promotion") score -= 15;

  return score;
};