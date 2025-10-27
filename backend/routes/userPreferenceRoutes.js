const express = require("express");
const router = express.Router();
const UserPreference = require("../models/userPreference");
const authMiddleware = require("../middleware/authMiddleware");

// Enregistrer ou mettre à jour la préférence
router.post("/platform", authMiddleware, async (req, res) => {
  try {
    const { platform } = req.body;
    const userId = req.user.userId;

    console.log(`🔹 Utilisateur ${userId} a choisi la plateforme : ${platform}`);

    let pref = await UserPreference.findOne({ userId });
    if (pref) {
      pref.platform = platform;
      await pref.save();
    } else {
      pref = await UserPreference.create({ userId, platform });
    }

    res.json({ message: "Préférence enregistrée", platform: pref.platform });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer la préférence
router.get("/platform", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const pref = await UserPreference.findOne({ userId });

    if (!pref) return res.json({ platform: null });

    res.json({ platform: pref.platform });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
