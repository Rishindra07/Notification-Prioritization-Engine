const UserHistory = require("../models/UserHistory");
const { getFatigueSettings } = require("./settings.service");

async function checkFatigue(user_id) {
  const settings = await getFatigueSettings();
  const now = Date.now();
  const tenMinAgo = now - 10 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  let history = await UserHistory.findOne({ user_id });
  if (!history) {
    history = await UserHistory.create({ user_id, sent_timestamps: [] });
  }

  const cleaned = (history.sent_timestamps || []).filter((ts) => new Date(ts).getTime() >= oneDayAgo);
  const count10Min = cleaned.filter((ts) => new Date(ts).getTime() >= tenMinAgo).length;
  const count24h = cleaned.length;

  if (count10Min >= Number(settings.limit_10min)) {
    return { decision: "LATER", reason: "Rate limit exceeded (10min cap)" };
  }

  if (count24h >= Number(settings.limit_24h)) {
    return { decision: "NEVER", reason: "Daily notification cap exceeded" };
  }

  if (history.last_sent_at) {
    const gap = Math.floor((now - new Date(history.last_sent_at).getTime()) / 1000);
    if (gap < Number(settings.min_gap_seconds)) {
      return { decision: "LATER", reason: "Minimum gap not satisfied for user" };
    }
  }

  return null;
}

async function recordNotification(user_id) {
  const now = new Date();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  let history = await UserHistory.findOne({ user_id });
  if (!history) {
    history = await UserHistory.create({ user_id, sent_timestamps: [now], last_sent_at: now });
    return;
  }

  const cleaned = (history.sent_timestamps || []).filter((ts) => new Date(ts).getTime() >= oneDayAgo);
  cleaned.push(now);

  history.sent_timestamps = cleaned;
  history.last_sent_at = now;
  await history.save();
}

module.exports = { checkFatigue, recordNotification };
