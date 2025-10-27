const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  purchases: [{ type: String }],
  preferredPlatform: { type: String, default: "spotify" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
