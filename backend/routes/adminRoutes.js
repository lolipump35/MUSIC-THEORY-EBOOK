const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

// Exemple route protégée
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Accès autorisé au dashboard admin" });
});

module.exports = router;
