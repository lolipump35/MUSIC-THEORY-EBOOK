const express = require('express');
const router = express.Router();

// Importer les sous-routes
const authRoutes = require('./authRoutes');

// Utiliser les routes d'authentification sous le chemin /auth
router.use('/auth', authRoutes);

// Tu pourras ajouter d'autres routes ici plus tard, comme :
// const userRoutes = require('./userRoutes');
// router.use('/users', userRoutes);

module.exports = router;
