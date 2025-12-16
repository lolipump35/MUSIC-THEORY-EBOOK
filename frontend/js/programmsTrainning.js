window.addEventListener("DOMContentLoaded", () => {
  console.clear();

  const container = document.getElementById("trainingResult");
  if (!container) {
    console.error("❌ trainingResult introuvable !");
    return;
  }

  container.innerHTML = ""; // nettoyage

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("❌ Pas de token trouvé !");
    container.innerHTML = "<p>Connectez-vous pour voir vos modules.</p>";
    return;
  }

  // Fetch des modules depuis le backend
  fetch("http://localhost:5000/api/me/user-created-modules", {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    }
  })
    .then(res => res.json())
    .then(modules => {
      if (!modules || modules.length === 0) {
        container.innerHTML = "<p>Aucun module créé pour l'instant.</p>";
        return;
      }

      modules.forEach(mod => {
        const moduleCard = document.createElement("div");
        moduleCard.classList.add("moduleCard");
        moduleCard.dataset.moduleId = mod.moduleKey;

        // Calcul du nombre total d'objectifs
        const totalObjectives = mod.programData.trainingDays?.reduce(
          (sum, day) => sum + (day.objectives?.length || 0),
          0
        ) || 0;

        moduleCard.innerHTML = `
          <h2>${mod.moduleKey}</h2>
          <p>${totalObjectives} objectif(s) dans ce module</p>
        `;

        // Clic sur la carte pour sélectionner le module
        moduleCard.addEventListener("click", () => {
          localStorage.setItem("currentModule", mod.moduleKey);
          console.log(`✅ Module sélectionné : ${mod.moduleKey}`);

          // Redirection vers la page modulePrograms
          window.location.href = "/frontend/pages/programsTrainingModule/modulePrograms.html";
        });

        container.appendChild(moduleCard);
      });
    })
    .catch(err => {
      console.error("Erreur lors de la récupération des modules :", err);
      container.innerHTML = "<p>Erreur lors de la récupération des modules.</p>";
    });
});
