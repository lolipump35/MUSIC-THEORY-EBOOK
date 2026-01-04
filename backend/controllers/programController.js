const User = require("../models/user");
const Module = require("../models/module");

// 🔹 Récupérer tous les programmes de l'utilisateur
exports.getPrograms = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json({
      assignedModules: user.assignedModules,
      userCreatedModules: user.userCreatedModules,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUserProgram = async (req, res) => {
  try {
    console.log("🔥 createUserProgram CALLED 🔥");

    const { moduleKey, programData } = req.body;
    const userId = req.user.userId || req.user._id;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    console.log("👤 USER MONGOOSE OK :", user._id);

    // Création du sous-document
    const createdModule = user.userCreatedModules.create({
      moduleKey, // temporaire
      programData,
      type: "user",
    });

    // ⚡ Mettre à jour moduleKey avec l'ID Mongo généré
    createdModule.moduleKey = createdModule._id.toString();

    console.log("🧱 SOUS-DOC AVANT PUSH :", createdModule._id);
    console.log("🔹 moduleKey mis à jour :", createdModule.moduleKey);

    user.userCreatedModules.push(createdModule);
    await user.save();

    console.log("💾 USER SAUVÉ");
    console.log("🆔 MODULE ID FINAL :", createdModule._id);

    return res.status(201).json({
      message: "Programme créé ✅",
      moduleId: createdModule._id.toString(), // ID Mongo
    });
  } catch (err) {
    console.error("❌ createUserProgram ERROR :", err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Assigner un programme admin à un utilisateur
exports.assignAdminProgram = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ message: "Module non trouvé" });

    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const newProgram = {
      moduleId,
      type: "admin",
      programData: module.programData || { trainingDays: [] },
    };

    user.assignedModules.push(newProgram);
    await user.save();

    res.status(201).json(newProgram);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Récupérer un module utilisateur par moduleKey
exports.getUserModuleByKey = async (req, res) => {
  try {
    const { moduleKey } = req.params;
    console.log("moduleKey demandé :", moduleKey); // ✅ vérifie ce que tu reçois

    const user = await User.findById(req.user._id);
    console.log(
      "Modules utilisateur :",
      user.userCreatedModules.map((m) => m.moduleKey)
    ); // ✅ voir tous les moduleKey disponibles

    const module = user.userCreatedModules.find(
      (m) => m.moduleKey === moduleKey
    );
    if (!module) {
      console.warn("Module introuvable pour cet utilisateur !");
      return res.status(404).json({ message: "Module introuvable" });
    }

    res.json(module.programData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Supprimer un programme
exports.deleteProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const user = await User.findById(req.user._id);

    let removed = false;
    if (user.userCreatedModules.id(programId)) {
      user.userCreatedModules.id(programId).remove();
      removed = true;
    } else if (user.assignedModules.id(programId)) {
      user.assignedModules.id(programId).remove();
      removed = true;
    }

    if (!removed)
      return res.status(404).json({ message: "Programme non trouvé" });

    await user.save();
    res.json({ message: "Programme supprimé ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const recalculateDayObjectivesTime = require("../utils/recalculateDayObjectivesTime");

exports.commitProgramTimes = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const { moduleKey } = req.params;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const module = user.userCreatedModules.find(
      (m) => m.moduleKey === moduleKey
    );
    if (!module) return res.status(404).json({ message: "Module introuvable" });

    const programData = module.programData;
    const totalDays = programData.trainingDays.length;

    programData.trainingDays.forEach((day) => {
      recalculateDayObjectivesTime({
        trainingDay: day,
        timePerWeek: programData.timePerWeek,
        totalDays,
      });
    });

    await user.save();

    res.json({ message: "Temps initialisés ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// MET A JOUR
// ------------------------------
// CONTROLLERS TIMER / PROGRESSION PATCH
// ------------------------------
exports.startObjective = async (req, res) => {
  try {
    const { moduleKey, dayNumber, objectiveId } = req.params;
    const userId = req.user._id || req.user.userId;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const module = user.userCreatedModules.find(
      (m) => m.moduleKey === moduleKey
    );
    if (!module) return res.status(404).json({ message: "Module introuvable" });

    const day = module.programData.trainingDays.find(
      (d) => d.dayNumber === parseInt(dayNumber, 10)
    );
    if (!day) return res.status(404).json({ message: "Jour introuvable" });

    const objective = day.objectives.find((o) => o.objectiveId === objectiveId);
    if (!objective)
      return res.status(404).json({ message: "Objectif introuvable" });

    // 🔹 Si timer était déjà en pause, on le reprend avec remainingSeconds
    objective.isRunning = true;
    objective.lastStartTimestamp = new Date();

    await user.save();

    res.json({ message: "Objectif démarré ✅", objective });
  } catch (err) {
    console.error("Erreur startObjective :", err);
    res.status(500).json({ message: err.message });
  }
};

exports.pauseObjective = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const { moduleKey, dayNumber, objectiveId } = req.params;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    const module = user.userCreatedModules.find(
      (m) => m.moduleKey === moduleKey
    );
    const day = module.programData.trainingDays.find(
      (d) => d.dayNumber === parseInt(dayNumber)
    );
    const objective = day.objectives.find((o) => o.objectiveId === objectiveId);

    if (!objective.isRunning || !objective.lastStartTimestamp) {
      return res.json({ message: "Timer déjà en pause" });
    }

    // 🧠 CALCUL BACKEND (règle d’or respectée)
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(objective.lastStartTimestamp).getTime()) / 1000
    );

    objective.remainingSeconds = Math.max(
      objective.remainingSeconds - elapsedSeconds,
      0
    );

    objective.isRunning = false;
    objective.lastStartTimestamp = null;

    await user.save();

    res.json({
      message: "⏸ Timer mis en pause",
      remainingSeconds: objective.remainingSeconds,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.completeObjective = async (req, res) => {
  try {
    const { moduleKey, dayNumber, objectiveId } = req.params;
    const userId = req.user._id || req.user.userId;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const module = user.userCreatedModules.find(
      (m) => m.moduleKey === moduleKey
    );
    if (!module) return res.status(404).json({ message: "Module introuvable" });

    const day = module.programData.trainingDays.find(
      (d) => d.dayNumber === parseInt(dayNumber, 10)
    );
    if (!day) return res.status(404).json({ message: "Jour introuvable" });

    const objective = day.objectives.find((o) => o.objectiveId === objectiveId);
    if (!objective)
      return res.status(404).json({ message: "Objectif introuvable" });

    objective.isRunning = false;
    objective.remainingSeconds = 0;
    objective.lastStartTimestamp = null;
    objective.isCompleted = true;

    await user.save();

    res.json({ message: "Objectif complété ✅", objective });
  } catch (err) {
    console.error("Erreur completeObjective :", err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// CONTROLLERS DIFFICULTY
// ------------------------------
exports.updateObjectiveDifficulty = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const { moduleKey, dayNumber, objectiveId } = req.params;
    const { difficultyLevel } = req.body;

    if (typeof difficultyLevel !== "number") {
      return res.status(400).json({ message: "difficultyLevel invalide" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const module = user.userCreatedModules.find(
      (m) => m.moduleKey === moduleKey
    );
    if (!module) return res.status(404).json({ message: "Module introuvable" });

    const programData = module.programData;
    const trainingDay = programData.trainingDays.find(
      (d) => d.dayNumber === Number(dayNumber)
    );

    if (!trainingDay)
      return res.status(404).json({ message: "Jour introuvable" });

    const objective = trainingDay.objectives.find(
      (o) => o.objectiveId === objectiveId
    );

    if (!objective)
      return res.status(404).json({ message: "Objectif introuvable" });

    // 🔹 Update difficulty
    objective.difficultyLevel = difficultyLevel;

    // 🔹 Recalcul du jour UNIQUEMENT
    const updatedObjectives = recalculateDayObjectivesTime({
      trainingDay,
      timePerWeek: programData.timePerWeek,
      totalDays: programData.trainingDays.length,
    });

    await user.save();

    res.json({
      day: trainingDay.dayNumber,
      objectives: updatedObjectives.map((o) => ({
        objectiveId: o.objectiveId,
        difficultyLevel: o.difficultyLevel,
        baseEstimatedSeconds: o.baseEstimatedSeconds,
        estimatedSeconds: o.estimatedSeconds,
        remainingSeconds: o.remainingSeconds,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// CONTROLLER TEMPS / TIMER
// ------------------------------
exports.updateObjectiveTime = async (req, res) => {
  try {
    const { moduleKey, dayNumber, objectiveId } = req.params;
    const { totalTimeForWeek } = req.body;

    const userId = req.user._id || req.user.userId;
    const user = await User.findById(userId);

    console.log("user trouvé :", user ? true : false);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const module = user.userCreatedModules.find(
      (m) => m.moduleKey === moduleKey
    );
    if (!module) return res.status(404).json({ message: "Module introuvable" });

    const day = module.programData.trainingDays.find(
      (d) => d.dayNumber === parseInt(dayNumber)
    );
    if (!day) return res.status(404).json({ message: "Jour introuvable" });

    const objectives = day.objectives;
    if (!objectives || objectives.length === 0)
      return res.status(404).json({ message: "Pas d'objectifs pour ce jour" });

    const totalMinutes =
      totalTimeForWeek !== undefined
        ? totalTimeForWeek
        : module.programData.timePerWeek;
    const daysPerWeek =
      module.programData.daysPerWeek || module.programData.trainingDays.length;
    const minutesPerDay = totalMinutes / daysPerWeek;

    const processedObjectives = objectives.map((o) => {
      const difficultyFactor = 1 + ((difficulty - 1) / 6) * 2;

      const weight = (o.coef || 1) * difficultyFactor;
      return { ...o.toObject(), poidsFinal: weight };
    });

    const totalWeight = processedObjectives.reduce(
      (sum, o) => sum + o.poidsFinal,
      0
    );

    processedObjectives.forEach((o) => {
      const obj = objectives.find((x) => x.objectiveId === o.objectiveId);
      if (!obj) return;
      const percent = o.poidsFinal / totalWeight;
      const newTimeMinutes = Math.round(percent * minutesPerDay);
      obj.plannedMinutes = newTimeMinutes;
      obj.remainingSeconds = newTimeMinutes * 60;
    });

    await user.save();
    res.json({ message: "Temps recalculé ✅", day });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET AFTER REFRESH // ------------------------------
exports.getObjective = async (req, res) => {
  try {
    const { moduleKey, dayNumber, objectiveId } = req.params;
    const userId = req.user._id || req.user.userId;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    const module = user.userCreatedModules.find(
      (m) => m.moduleKey === moduleKey
    );
    if (!module) return res.status(404).json({ message: "Module introuvable" });

    const day = module.programData.trainingDays.find(
      (d) => d.dayNumber === parseInt(dayNumber, 10)
    );
    if (!day) return res.status(404).json({ message: "Jour introuvable" });

    const objective = day.objectives.find((o) => o.objectiveId === objectiveId);
    if (!objective)
      return res.status(404).json({ message: "Objectif introuvable" });

    // 🔹 Calcul du remaining réel si timer en cours
    let remaining = objective.remainingSeconds || 0;
    if (objective.isRunning && objective.lastStartTimestamp) {
      const elapsed = Math.floor(
        (Date.now() - new Date(objective.lastStartTimestamp).getTime()) / 1000
      );
      remaining = Math.max(remaining - elapsed, 0);
    }

    res.json({
      objective: {
        ...objective.toObject(),
        remainingSeconds: remaining,
      },
    });
  } catch (err) {
    console.error("Erreur getObjective :", err);
    res.status(500).json({ message: err.message });
  }
};
