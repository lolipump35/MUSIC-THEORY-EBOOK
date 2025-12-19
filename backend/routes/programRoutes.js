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
router.patch(
  "/:programId/day/:dayNumber/objective/:objectiveId",
  programController.updateObjective
);
router.delete("/:programId", programController.deleteProgram);

// Routes timerProgress indépendantes (PATCH périodique)
router.patch(
  "/user-created-modules/:moduleKey/training-days/:dayNumber/objectives/:objectiveId",
  authFullMiddleware,
  programController.updateObjectiveTimer
);

// Récupérer un module par clé
router.get(
  "/user-created-modules/:moduleKey",
  authFullMiddleware,
  programController.getUserModuleByKey
);

// PATCH spécifique pour mettre à jour la difficulté d'un objectif
router.patch(
  "/user-created-modules/:moduleKey/training-days/:dayNumber/objectives/:objectiveId/difficulty",
  authFullMiddleware,
  programController.updateObjectiveDifficulty
);

module.exports = router;
