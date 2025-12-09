const mongoose = require("mongoose");

const ObjectiveSchema = new mongoose.Schema({
  title: { type: String, required: true },
  coef: { type: Number, required: true },
  extra: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  muxPlaybackId: { type: String, default: "" },
});

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  objectives: [ObjectiveSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Module", ModuleSchema);
