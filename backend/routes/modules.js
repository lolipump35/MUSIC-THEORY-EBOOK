const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");

// POST → créer un module
router.post("/", moduleController.createModule);




// GET → récupérer tous les modules
router.get("/", moduleController.getModules);



// Route GET simplifiée currentModuleId +title
router.get("/simple", moduleController.getModulesSimple);

// Route GET complète
router.get("/full", moduleController.getModulesFull);

// Routes GET pour recuperer toutes les données d un programme par rapport a son currentmoduleid 
router.get("/:id", moduleController.getModuleById);


// suppression module dans le back apres utilisation de modal dans trainningprogrammes.js 
router.delete("/:id", moduleController.deleteModule);

module.exports = router;
