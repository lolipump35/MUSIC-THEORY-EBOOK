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

// 🔹 Créer un programme utilisateur
exports.createUserProgram = async (req, res) => {
  try {
    const user = req.user;
    const { moduleKey, programData } = req.body;

    if (!programData || !programData.trainingDays)
      return res
        .status(400)
        .json({ message: "Données du programme manquantes" });

    const newProgram = {
      moduleKey,
      programData,
      type: "user",
    };

    user.userCreatedModules.push(newProgram);
    await user.save();

    res.status(201).json(newProgram);
  } catch (err) {
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

// 🔹 Mettre à jour un objectif (difficultyLevel ou autre)
exports.updateObjective = async (req, res) => {
  try {
    const { programId, dayNumber, objectiveId } = req.params;
    const { isCompleted, timerProgress, difficulty } = req.body;

    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const program =
      user.userCreatedModules.id(programId) ||
      user.assignedModules.id(programId);

    if (!program)
      return res.status(404).json({ message: "Programme non trouvé" });

    const day = program.programData.trainingDays.find(
      (d) => d.dayNumber === parseInt(dayNumber)
    );
    if (!day) return res.status(404).json({ message: "Jour non trouvé" });

    const objective = day.objectives.find((o) => o.objectiveId === objectiveId);
    if (!objective)
      return res.status(404).json({ message: "Objectif non trouvé" });

    if (isCompleted !== undefined) objective.isCompleted = isCompleted;
    if (timerProgress !== undefined) objective.timerProgress = timerProgress;
    if (difficulty !== undefined) objective.difficultyLevel = difficulty;

    await user.save();
    res.json(objective);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Mettre à jour timerProgress / isCompleted (PATCH périodique)
exports.updateObjectiveTimer = async (req, res) => {
  try {
    const { moduleKey, dayNumber, objectiveId } = req.params;
    const { timerProgress, completed } = req.body;

    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    const module = user.userCreatedModules.find(
      (m) => m.moduleKey === moduleKey
    );
    if (!module) return res.status(404).json({ message: "Module introuvable" });

    const dayNum = parseInt(dayNumber, 10);
    const day = module.programData.trainingDays.find(
      (d) => d.dayNumber === dayNum
    );
    if (!day) return res.status(404).json({ message: "Jour introuvable" });

    const objective = day.objectives.find((o) => o.objectiveId === objectiveId);
    if (!objective)
      return res.status(404).json({ message: "Objectif introuvable" });

    objective.timerProgress = timerProgress;
    objective.isCompleted = completed;

    await user.save();
    res.json({ message: "Objectif mis à jour ✅", objective });
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
