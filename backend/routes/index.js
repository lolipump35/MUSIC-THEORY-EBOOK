const express = require("express");
const router = express.Router();

// ====================
// Routes existantes
// ====================
const authRoutes = require("./authRoutes");
const videoRoutes = require("./videoRoutes");
const userPreferenceRoutes = require("./userPreferenceRoutes");
const userModulesRoutes = require("./userModulesRoutes"); // notre route userCreatedModules

// ====================
// Montage des routes
// ====================
router.use("/auth", authRoutes);
router.use("/videos", videoRoutes);
router.use("/user", userPreferenceRoutes);
router.use("/", userModulesRoutes);





// ====================
// Export
// ====================
module.exports = router;
