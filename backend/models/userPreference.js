const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  platform: { type: String, required: true }, // "spotify" | "deezer" | "applemusic"
});

const UserPreference = mongoose.model("UserPreference", userPreferenceSchema);
module.exports = UserPreference;
