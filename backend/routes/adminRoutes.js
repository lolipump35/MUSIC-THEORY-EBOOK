const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Module = require("../models/Module");
const User = require("../models/user"); // <- ajouté pour gérer l'attribution

// --- Route protégée d’accès au dashboard admin
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Accès autorisé au dashboard admin" });
});

// --- Route pour créer un nouveau module avec ses objectifs imbriqués
router.post("/modules", authMiddleware, async (req, res) => {
  try {
    const { title, objectives } = req.body;

    if (!title || !Array.isArray(objectives)) {
      return res
        .status(400)
        .json({ message: "Titre et liste d’objectifs requis." });
    }

    const newModule = new Module({
      title,
      objectives, // chaque objectif contient title, coef, extra, imageUrl, muxPlaybackId
    });

    await newModule.save();

    res
      .status(201)
      .json({ message: "Module créé avec succès", module: newModule });
  } catch (error) {
    console.error("Erreur création module :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// --- Route pour récupérer tous les modules (pour affichage ou édition)
router.get("/modules", authMiddleware, async (req, res) => {
  try {
    const modules = await Module.find();
    res.json(modules);
  } catch (error) {
    console.error("Erreur récupération modules :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// --- Route pour attribuer un module à des utilisateurs
router.post("/assign-module", authMiddleware, async (req, res) => {
  try {
    const { moduleId, userIds } = req.body; // userIds = array d'IDs utilisateurs

    if (!moduleId || !Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Module et liste d'utilisateurs requis." });
    }

    const moduleToAssign = await Module.findById(moduleId);
    if (!moduleToAssign) {
      return res.status(404).json({ message: "Module introuvable." });
    }

    // On parcourt chaque utilisateur et on lui ajoute le module
    const updatedUsers = [];
    for (const userId of userIds) {
      const user = await User.findById(userId);
      if (user) {
        // On évite les doublons
        if (!user.purchases.includes(moduleId)) {
          user.purchases.push(moduleId);
          await user.save();
        }
        updatedUsers.push(userId);
      }
    }

    res
      .status(200)
      .json({ message: "Module attribué avec succès", users: updatedUsers });
  } catch (error) {
    console.error("Erreur attribution module :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// --- Route pour récupérer tous les utilisateurs (admin)
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("firstName name email");
    res.json(users);
  } catch (error) {
    console.error("Erreur récupération utilisateurs :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
