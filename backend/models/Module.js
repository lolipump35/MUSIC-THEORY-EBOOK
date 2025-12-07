const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  coef: { type: Number, required: true },
  
  // texte supplémentaire
  extra: { type: String, default: "" },

  // images (stockées comme chemin ou URL)
  imageUrl: { type: String, default: "" },

  // PlaybackID MUX
  muxPlaybackId: { type: String, default: "" },

  // date de création
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Module", ModuleSchema);
