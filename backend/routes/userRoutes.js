const express = require("express");
const router = express.Router();
const programController = require("../controllers/programController");
const authMiddleware = require("../Middleware/authMiddleware");


// Créer un programme user
router.post("/programs", authMiddleware, programController.createUserProgram);

module.exports = router;
