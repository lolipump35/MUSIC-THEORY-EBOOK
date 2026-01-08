const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const AdminController = require("../controllers/adminController");
const User = require("../models/user"); // pour la route /users

// Dashboard admin
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Accès autorisé au dashboard admin" });
});

// Création d’un module
router.post("/modules", authMiddleware, AdminController.createModule); 
// 👈 tu devras créer `createModule` dans le controller

// Récupérer tous les modules
router.get("/modules", authMiddleware, AdminController.getModules); 
// 👈 tu devras créer `getModules` dans le controller

// Assignation d’un module à des users
router.post("/assign-module", authMiddleware, AdminController.assignModuleToUsers);

// Récupérer tous les users
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
