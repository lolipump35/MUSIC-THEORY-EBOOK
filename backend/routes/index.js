// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const videoRoutes = require('./videoRoutes'); // <-- ajout

router.use('/auth', authRoutes);
router.use('/videos', videoRoutes); // <-- ajout : toutes les routes MUX passent ici

module.exports = router;






