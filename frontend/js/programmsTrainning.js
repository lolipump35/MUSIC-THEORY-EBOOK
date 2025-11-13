window.addEventListener("DOMContentLoaded", () => {
  console.clear();

  const container = document.getElementById("trainingResult");
  if (!container) {
    console.error("❌ trainingResult introuvable !");
    return;
  }

  const storedModules = JSON.parse(localStorage.getItem("trainingModules")) || {};
  container.innerHTML = ""; // nettoyage

  if (Object.keys(storedModules).length === 0) {
    container.innerHTML = "<p>Aucun module créé pour l'instant.</p>";
    return;
  }

  // Création des ModuleCards
  Object.entries(storedModules).forEach(([moduleId, moduleData]) => {
    const moduleCard = document.createElement("div");
    moduleCard.classList.add("moduleCard");
    moduleCard.dataset.moduleId = moduleId;

    moduleCard.innerHTML = `
      <h2>${moduleData.name}</h2>
      <p>${moduleData.programs.length} programme(s) enregistré(s)</p>
    `;

    // Clic sur la carte pour sélectionner le module
    moduleCard.addEventListener("click", () => {
      localStorage.setItem("currentModule", moduleId);
      console.log(`✅ Module sélectionné : ${moduleId}`);

      // Redirection vers le module program si nécessaire
      window.location.href = "/frontend/pages/programsTrainingModule/modulePrograms.html";
    });

    container.appendChild(moduleCard);
  });
});
