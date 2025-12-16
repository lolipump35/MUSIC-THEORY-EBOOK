const Module = require("../models/module");

// Créer un nouveau module
exports.createModule = async (req, res) => {
  try {
    const { title, objectives, trainingDays, trainingTime, source, currentModuleId } = req.body;

    // Créer l'objet Module
    const newModule = new Module({
      title,
      objectives,         // tableau d'objectifs complet
      trainingDays,
      trainingTime,
      source: source || "user",  // default fallback
      currentModuleId: currentModuleId || null
    });

    await newModule.save();

    res.status(201).json({
      message: "Module créé avec succès",
      module: newModule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};





// Récupérer tous les modules
exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find();
    res.status(200).json(modules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};




// Récupération simplifiée (ID complet + currentModuleId + title)
exports.getModulesSimple = async (req, res) => {
  try {
    // On récupère _id, currentModuleId et title
    const modules = await Module.find({}, { _id: 1, currentModuleId: 1, title: 1 });
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Récupération complète (tous les champs)
exports.getModulesFull = async (req, res) => {
  try {
    const modules = await Module.find(); // sans projection → tout
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// recuperation du programme lie a un module id 
exports.getModuleById = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const moduleData = await Module.findById(moduleId);

    if (!moduleData) {
      return res.status(404).json({ error: "Module introuvable" });
    }

    res.status(200).json(moduleData);
  } catch (error) {
    console.error("Erreur récupération module :", error);
    res.status(500).json({ error: error.message });
  }
};


// suppression module dans le back apres utilisation de modal dans trainningprogrammes.js 
exports.deleteModule = async (req, res) => {
  console.log("🔥 DELETE /modules/:id appelé");
  console.log("ID reçu :", req.params.id);

  try {
    const deleted = await Module.findByIdAndDelete(req.params.id);

    if (!deleted) {
      console.log("❌ Aucun module trouvé avec cet ID");
      return res.status(404).json({ message: "Module introuvable" });
    }

    console.log("✅ Module supprimé en base :", deleted._id);
    res.status(200).json({ message: "Module supprimé" });

  } catch (err) {
    console.error("❌ Erreur suppression module :", err);
    res.status(500).json({ error: err.message });
  }
};
