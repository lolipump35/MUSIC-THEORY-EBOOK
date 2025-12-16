const express = require("express");
const router = express.Router();
const programController = require("../controllers/programController");
const authMiddleware = require("../middleware/auth"); // vérifie que req.user est défini

router.use(authMiddleware);

router.get("/", programController.getPrograms);
router.post("/user-created", programController.createUserProgram);
router.post("/assigned/:moduleId", programController.assignAdminProgram);
router.patch("/:programId/day/:dayNumber/objective/:objectiveId", programController.updateObjective);
router.delete("/:programId", programController.deleteProgram);

module.exports = router;
