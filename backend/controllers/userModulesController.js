const User = require("../models/user");

/**
 * Retourne les modules créés par l'utilisateur connecté
 */
exports.getUserCreatedModules = async (req, res) => {
  try {
    const userId = req.user.userId;
    // défini par le middleware auth

    const user = await User.findById(userId).select("userCreatedModules");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json(user.userCreatedModules);
  } catch (error) {
    console.error("Erreur getUserCreatedModules:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Ajouter un nouveau module créé par l'utilisateur
 */
exports.addUserCreatedModule = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    console.log("Utilisateur qui envoie le module :", userId);
    console.log("Body reçu :", req.body); // <- LOG important
    const newModule = req.body; // on attend tout le module dans le body

    if (!newModule || Object.keys(newModule).length === 0) {
      return res.status(400).json({ message: "Module vide" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Ajouter le module au tableau userCreatedModules
    user.userCreatedModules.push(newModule);
    await user.save({ validateBeforeSave: false });

    res
      .status(201)
      .json({ message: "Module ajouté avec succès", module: newModule });
  } catch (error) {
    console.error("Erreur addUserCreatedModule:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
