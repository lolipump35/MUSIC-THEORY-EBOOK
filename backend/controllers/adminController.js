exports.updateModuleMuxPlayback = async (req, res) => {
  try {
    const { moduleId, playbackId } = req.body;

    if (!moduleId || !playbackId) {
      return res
        .status(400)
        .json({ message: "moduleId et playbackId requis." });
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module introuvable." });
    }

    // Mise à jour du PlaybackID Mux
    module.muxPlaybackId = playbackId;
    await module.save();

    res.json({ message: "Playback ID Mux mis à jour avec succès !", module });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
