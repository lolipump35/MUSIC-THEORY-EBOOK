console.log("📌 ProgramRoute.js chargé !");
const express = require("express");
const router = express.Router();
const programController = require("../controllers/programController");
const authMiddleware = require("../middleware/authMiddleware");
const authFullMiddleware = require("../middleware/authFullMiddleware");

router.use(authMiddleware);

// Routes CRUD
router.get("/", programController.getPrograms);
router.post("/user-created", programController.createUserProgram);
router.post("/assigned/:moduleId", programController.assignAdminProgram);
router.delete("/:programId", programController.deleteProgram);

router.use((req, res, next) => {
  console.log("📥 ROUTE PROGRAM HIT :", req.method, req.originalUrl);
  next();
});

// ------------------------------
// ROUTES TIMER / PROGRESSION
// ------------------------------
router.patch(
  "/user-created-modules/:moduleKey/training-days/:dayNumber/objectives/:objectiveId/start",
  programController.startObjective
);

router.patch(
  "/user-created-modules/:moduleKey/training-days/:dayNumber/objectives/:objectiveId/pause",
  programController.pauseObjective
);

router.patch(
  "/user-created-modules/:moduleKey/training-days/:dayNumber/objectives/:objectiveId/complete",
  programController.completeObjective
);

// ------------------------------
// ROUTE DIFFICULTY
// ------------------------------
router.patch(
  "/user-created-modules/:moduleKey/training-days/:dayNumber/objectives/:objectiveId/difficulty",
  programController.updateObjectiveDifficulty
);


// Récupérer un module par clé
router.get(
  "/user-created-modules/:moduleKey",
  authFullMiddleware,
  programController.getUserModuleByKey
);

// 🔹 Initialiser les temps de référence pour un module utilisateur
router.post(
  "/user-created-modules/:moduleKey/commit-times",
  programController.commitProgramTimes
);

// GET AFTER REFRESH 
router.get(
  "/user-created-modules/:moduleKey/training-days/:dayNumber/objectives/:objectiveId",
  programController.getObjective
);

module.exports = router;
