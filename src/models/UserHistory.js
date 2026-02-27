const mongoose = require("mongoose");

/**
 * UserHistory Schema
 * - user_id: User identifier (required)
 * - sent_count_10min: Notifications sent in last 10 min (default: 0)
 * - sent_count_24hr: Notifications sent in last 24 hr (default: 0)
 * - last_sent_at: Last notification sent timestamp (optional)
 */
const UserHistorySchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  sent_count_10min: {
    type: Number,
    default: 0
  },
  sent_count_24hr: {
    type: Number,
    default: 0
  },
  last_sent_at: Date
});

module.exports = mongoose.model("UserHistory", UserHistorySchema);