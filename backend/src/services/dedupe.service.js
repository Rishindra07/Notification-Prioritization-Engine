const crypto = require("crypto");
const NotificationEvent = require("../models/NotificationEvent.js");

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jaccardSimilarity(a, b) {
  const aSet = new Set(normalizeText(a).split(" ").filter(Boolean));
  const bSet = new Set(normalizeText(b).split(" ").filter(Boolean));
  if (!aSet.size || !bSet.size) return 0;

  let intersection = 0;
  for (const token of aSet) {
    if (bSet.has(token)) intersection += 1;
  }

  const union = new Set([...aSet, ...bSet]).size;
  return intersection / union;
}

function buildExactHash(event) {
  const payload = [
    event.user_id || "",
    event.event_type || "",
    event.source || "",
    event.channel || "",
    event.title || "",
    event.message || ""
  ].join("|");

  return crypto.createHash("sha256").update(payload).digest("hex");
}

async function checkDuplicate(event) {
  const exactHash = event.dedupe_key || buildExactHash(event);
  const normalizedHash = crypto
    .createHash("sha256")
    .update(normalizeText(`${event.title || ""} ${event.message || ""}`))
    .digest("hex");

  event.dedupe_key = exactHash;
  event.normalized_hash = normalizedHash;

  const recentWindowStart = new Date(Date.now() - 10 * 60 * 1000);

  const exact = await NotificationEvent.findOne({
    is_deleted: false,
    createdAt: { $gte: recentWindowStart },
    $or: [{ dedupe_key: exactHash }, { normalized_hash: normalizedHash }]
  });

  if (exact) {
    return { isDuplicate: true, reason: "Exact duplicate detected", similarity: 1 };
  }

  const nearby = await NotificationEvent.find({
    is_deleted: false,
    user_id: event.user_id,
    event_type: event.event_type,
    createdAt: { $gte: recentWindowStart }
  })
    .select("title message dedupe_key")
    .limit(25)
    .lean();

  let bestSimilarity = 0;
  for (const item of nearby) {
    const similarity = jaccardSimilarity(`${event.title || ""} ${event.message || ""}`, `${item.title || ""} ${item.message || ""}`);
    bestSimilarity = Math.max(bestSimilarity, similarity);
  }

  if (bestSimilarity >= 0.8) {
    return {
      isDuplicate: true,
      reason: "Near duplicate detected",
      similarity: Number(bestSimilarity.toFixed(2))
    };
  }

  return { isDuplicate: false, reason: null, similarity: Number(bestSimilarity.toFixed(2)) };
}

module.exports = { checkDuplicate, buildExactHash };
