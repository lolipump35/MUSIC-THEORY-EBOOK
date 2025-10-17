const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUsers } = require("../controller/authcontroller");
const authMiddleware = require("../middleware/authMiddleware");

// Inscription
router.post("/register", registerUser);

// Connexion
router.post("/login", loginUser);

// Liste des utilisateurs (protégée)
router.get("/users", authMiddleware, getUsers);

// Exemple de dashboard protégé
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Bienvenue sur ton dashboard 🚀",
    userId: req.user.userId, // récupéré du token
  });
});

module.exports = router;
