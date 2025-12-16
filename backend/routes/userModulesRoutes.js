console.log("userModulesRoutes loaded"); // à mettre tout en haut du fichier

const express = require("express");
const router = express.Router();

const {
  getUserCreatedModules,
} = require("../controllers/userModulesController");

const {
  addUserCreatedModule,
} = require("../controllers/userModulesController");

// Middleware d'auth (déjà existant chez toi)
const authMiddleware = require("../middleware/authMiddleware");

// GET existant
router.get("/me/user-created-modules", authMiddleware, getUserCreatedModules);

// POST nouveau module
router.post("/me/user-created-modules", authMiddleware, addUserCreatedModule);



module.exports = router;
