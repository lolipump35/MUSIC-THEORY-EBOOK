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
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  assignedModules: [
    {
      moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
      assignedAt: { type: Date, default: Date.now },
      programData: { type: Object, default: {} } // pour que l'élève ajuste ses jours / temps / difficulté
    }
  ]
});

const User = mongoose.model("User", userSchema);
module.exports = User;
