const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

router.get('/:videoId', videoController.getVideoToken);

module.exports = router;
