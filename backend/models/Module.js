const mongoose = require("mongoose");

const ObjectiveSchema = new mongoose.Schema({
  title: { type: String, required: true },
  coef: { type: String, required: true }, // <--- STRING maintenant
  extra: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  muxPlaybackId: { type: String, default: "" },
});

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },

  type: {
    type: String,
    enum: ["admin", "user"],
    default: "admin", // 🔥 module créé par admin
  },

  objectives: [ObjectiveSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Module || mongoose.model("Module", ModuleSchema);
