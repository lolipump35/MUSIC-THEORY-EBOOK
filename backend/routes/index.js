const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const videoRoutes = require("./videoRoutes");
const userPreferenceRoutes = require("./userPreferenceRoutes"); // <-- ajouté

router.use("/auth", authRoutes);
router.use("/videos", videoRoutes);
router.use("/user", userPreferenceRoutes); // <-- toutes les routes /user/* passent ici

module.exports = router;