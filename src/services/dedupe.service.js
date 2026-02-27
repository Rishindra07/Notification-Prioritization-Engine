const crypto = require("crypto");
const NotificationEvent = require("../models/NotificationEvent");

exports.checkDuplicate = async (event) => {

  const hash = crypto
    .createHash("sha256")
    .update(event.user_id + event.message + event.event_type)
    .digest("hex");

  const existing = await NotificationEvent.findOne({
    dedupe_key: hash,
    createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) }
  });

  event.dedupe_key = hash;

  return !!existing;
};