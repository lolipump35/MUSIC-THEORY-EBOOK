const User = require("../models/user");
const ModuleModel = require("../models/Module"); // Module.js qui stocke les modules admin
const mongoose = require("mongoose");

// Mise à jour du PlaybackID Mux
exports.updateModuleMuxPlayback = async (req, res) => {
  try {
    const { moduleId, playbackId } = req.body;

    if (!moduleId || !playbackId) {
      return res
        .status(400)
        .json({ message: "moduleId et playbackId requis." });
    }

    const module = await ModuleModel.findById(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module introuvable." });
    }

    module.muxPlaybackId = playbackId;
    await module.save();

    res.json({ message: "Playback ID Mux mis à jour avec succès !", module });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Assignation d’un module à des utilisateurs
exports.assignModuleToUsers = async (req, res) => {
  try {
    const { moduleId, userIds } = req.body;

    if (!moduleId || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Module et utilisateurs requis" });
    }

    const module = await ModuleModel.findById(moduleId);
    if (!module) return res.status(404).json({ message: "Module introuvable" });

    const updatedUsers = [];

    for (const userId of userIds) {
      const user = await User.findById(userId);
      if (!user) continue;

      const alreadyAssigned = user.assignedModules.some(
        (m) => m.moduleId.toString() === moduleId
      );

      if (!alreadyAssigned) {
        user.assignedModules.push({ moduleId, assignedAt: new Date() });
        await user.save();
      }

      updatedUsers.push(userId);
    }

    res
      .status(200)
      .json({ message: "Module assigné avec succès", users: updatedUsers });
  } catch (error) {
    console.error("Erreur assignation module :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Création d’un module admin
exports.createModule = async (req, res) => {
  try {
    const { title, objectives } = req.body;
    if (!title || !Array.isArray(objectives)) {
      return res.status(400).json({ message: "Titre et objectifs requis" });
    }

    const newModule = new ModuleModel({ title, objectives });
    await newModule.save();

    res
      .status(201)
      .json({ message: "Module créé avec succès", module: newModule });
  } catch (error) {
    console.error("Erreur création module :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer tous les modules admin
exports.getModules = async (req, res) => {
  try {
    const modules = await ModuleModel.find();
    res.json(modules);
  } catch (error) {
    console.error("Erreur récupération modules :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// récupère les modules admin assignés
exports.getAssignedModules = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "assignedModules.moduleId",
      "title type"
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const modules = user.assignedModules
      .filter((am) => am.moduleId)
      .map((am) => ({
        assignedId: am._id, // 🔥 ID de l'objet assigné
        moduleId: am.moduleId._id, // ID du module admin
        title: am.moduleId.title,
        type: am.moduleId.type,
      }));

    res.json(modules);
  } catch (error) {
    console.error("Erreur récupération modules assignés :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getModuleById = async (req, res) => {
  try {
    const module = await ModuleModel.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ message: "Module introuvable" });
    }
    res.json(module);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteAssignedModule = async (req, res) => {
  try {
    console.log("🧪 req.user.userId =", req.user.userId);
    console.log("🧪 assignedModuleId =", req.params.assignedModuleId);

    const userId = req.user.userId;
    const { assignedModuleId } = req.params;

    // 🔹 POINT 3
    const user = await User.findById(userId);

    console.log(
      "📌 AssignedModules AVANT pull :",
      user.assignedModules.map((am) => ({
        _id: am._id.toString(),
        moduleId: am.moduleId.toString(),
      }))
    );

    // 🔹 POINT 4
    const exists = user.assignedModules.some(
      (am) => am._id.toString() === assignedModuleId
    );

    console.log("🧪 AssignedModule existe ?", exists);

    // 🔹 $pull
    const result = await User.updateOne(
      { _id: userId },
      {
        $pull: {
          assignedModules: {
            _id: new mongoose.Types.ObjectId(assignedModuleId),
          },
        },
      }
    );

    // 🔹 POINT 5
    console.log("🧪 Résultat du pull :", result);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Erreur suppression module assigné :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
