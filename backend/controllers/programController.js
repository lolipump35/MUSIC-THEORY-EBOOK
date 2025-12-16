const User = require("../models/user");
const Module = require("../models/module"); // si tu veux récupérer des infos de Module

// 🔹 Récupérer tous les programmes
exports.getPrograms = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // req.user ajouté via auth middleware
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json({
      assignedModules: user.assignedModules,
      userCreatedModules: user.userCreatedModules
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Créer un programme user
exports.createUserProgram = async (req, res) => {
  try {
    const user = req.user; // déjà récupéré par le middleware

    if (!req.body.programData || !req.body.programData.trainingDays) {
      return res.status(400).json({ message: "Données du programme manquantes" });
    }

    const newProgram = {
      type: "user",
      moduleId: req.body.moduleId || null,
      programData: req.body.programData
    };

    user.userCreatedModules.push(newProgram);
    await user.save();

    res.status(201).json(newProgram);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// 🔹 Assigner un programme admin
exports.assignAdminProgram = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ message: "Module non trouvé" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const newProgram = {
      moduleId,
      type: "admin",
      programData: module.programData || { trainingDays: [] }
    };

    user.assignedModules.push(newProgram);
    await user.save();
    res.status(201).json(newProgram);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Mettre à jour un objectif
exports.updateObjective = async (req, res) => {
  try {
    const { programId, dayNumber, objectiveId } = req.params;
    const { isCompleted, timerProgress, difficulty } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Chercher le programme dans les deux tableaux
    const program =
      user.userCreatedModules.id(programId) ||
      user.assignedModules.id(programId);

    if (!program) return res.status(404).json({ message: "Programme non trouvé" });

    const day = program.programData.trainingDays.find(d => d.dayNumber === parseInt(dayNumber));
    if (!day) return res.status(404).json({ message: "Jour non trouvé" });

    const objective = day.objectives.find(o => o.objectiveId === objectiveId);
    if (!objective) return res.status(404).json({ message: "Objectif non trouvé" });

    if (isCompleted !== undefined) objective.isCompleted = isCompleted;
    if (timerProgress !== undefined) objective.timerProgress = timerProgress;
    if (difficulty !== undefined) objective.difficulty = difficulty;

    await user.save();
    res.json(objective);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Supprimer un programme
exports.deleteProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    let removed = false;
    if (user.userCreatedModules.id(programId)) {
      user.userCreatedModules.id(programId).remove();
      removed = true;
    } else if (user.assignedModules.id(programId)) {
      user.assignedModules.id(programId).remove();
      removed = true;
    }

    if (!removed) return res.status(404).json({ message: "Programme non trouvé" });

    await user.save();
    res.json({ message: "Programme supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
