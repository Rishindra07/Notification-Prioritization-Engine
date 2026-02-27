const mongoose = require("mongoose");

const UserHistorySchema = new mongoose.Schema({
  user_id: String,
  sent_count_10min: Number,
  sent_count_24hr: Number,
  last_sent_at: Date
});

module.exports = mongoose.model("UserHistory", UserHistorySchema);