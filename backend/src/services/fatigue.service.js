const UserHistory = require("../models/UserHistory");

exports.checkFatigue = async (user_id) => {

  const history = await UserHistory.findOne({ user_id });

  if (!history) return null;

  if (history.sent_count_10min >= process.env.RATE_LIMIT_10MIN) {
    return { decision: "LATER", reason: "Rate limit exceeded (10min cap)" };
  }

  if (history.sent_count_24hr >= process.env.DAILY_LIMIT) {
    return { decision: "NEVER", reason: "Daily notification cap exceeded" };
  }

  return null;
};