const mongoose = require("mongoose");

const UserHistorySchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true, index: true },
    sent_timestamps: { type: [Date], default: [] },
    last_sent_at: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserHistory", UserHistorySchema);
