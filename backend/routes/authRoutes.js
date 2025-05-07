const express = require('express');
const router = express.Router();

// ✅ Import de la fonction registerUser
const { registerUser } = require('../controllers/authcontroller');

// ✅ Route POST vers /api/auth/register
router.post('/register', registerUser);

module.exports = router;
