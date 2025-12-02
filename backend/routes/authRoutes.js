const express = require('express');
const router = express.Router();

// ✅ Importation des fonctions depuis authController
const { registerUser, loginUser, loginGoogle } = require("../controllers/authController");

// ✅ Définir les routes POST pour /register et /login
router.post('/register', registerUser);  // Route pour inscription
router.post('/login', loginUser);        // Route pour connexion
router.post("/google-login", loginGoogle);

// ✅ Exporter les routes
module.exports = router;
