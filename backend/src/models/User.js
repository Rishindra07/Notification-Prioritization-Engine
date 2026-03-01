const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ["admin", "operator"], required: true },
    is_deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
