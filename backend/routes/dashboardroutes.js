const express = require("express");
const router = express.Router();

// ⚠️ IMPORT MANQUANT DANS TON FICHIER — OBLIGATOIRE
const User = require("../models/user"); 

const { registerUser, loginUser, getUsers } = require("../controller/authcontroller");
const authMiddleware = require("../middleware/authMiddleware");

// Inscription
router.post("/register", registerUser);

// Connexion
router.post("/login", loginUser);

// Liste des utilisateurs (protégée)
router.get("/users", authMiddleware, getUsers);

// Dashboard protégé
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    console.log("🔥 Dashboard route appelée. Utilisateur :", req.user);

    const user = await User.findById(req.user.userId).select("name email role");
    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log("✅ Dashboard renvoie :", user);

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

  } catch (err) {
    console.error("💥 Erreur dashboard :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
