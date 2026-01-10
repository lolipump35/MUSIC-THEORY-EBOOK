window.addEventListener("DOMContentLoaded", async () => {
  console.clear();

  const container = document.getElementById("trainingResult");
  if (!container) {
    console.error("❌ trainingResult introuvable !");
    return;
  }

  container.innerHTML = ""; // nettoyage UNE SEULE FOIS

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("❌ Pas de token trouvé !");
    container.innerHTML = "<p>Connectez-vous pour voir vos modules.</p>";
    return;
  }

  try {
    // ===============================
    // 1️⃣ FETCH DES MODULES USER
    // ===============================
    const resUser = await fetch(
      "http://localhost:5000/api/me/user-created-modules",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!resUser.ok) throw new Error(`HTTP error ${resUser.status}`);

    const userModules = await resUser.json();

    if (Array.isArray(userModules) && userModules.length > 0) {
      userModules.forEach((mod) => {
        const moduleCard = document.createElement("div");
        moduleCard.classList.add("moduleCard");
        moduleCard.dataset.moduleId = mod.moduleKey;
        moduleCard.dataset.type = "user";

        const displayName = mod.programData?.name || "Module sans nom";
        const totalObjectives =
          mod.programData?.trainingDays?.reduce(
            (sum, day) => sum + (day.objectives?.length || 0),
            0
          ) || 0;

        moduleCard.innerHTML = `
          <h2>${displayName}</h2>
          <p>${totalObjectives} objectif(s)</p>
        `;

        moduleCard.addEventListener("click", () => {
          localStorage.setItem("currentModule", mod.moduleKey);
          window.location.href =
            "/frontend/pages/programsTrainingModule/modulePrograms.html";
        });

        container.appendChild(moduleCard);
      });
    }

    // ===============================
    // 2️⃣ FETCH DES MODULES ADMIN ASSIGNÉS
    // ===============================
    const resAdmin = await fetch(
      "http://localhost:5000/admin/assigned-modules",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!resAdmin.ok) throw new Error(`HTTP error ${resAdmin.status}`);

    const adminModules = await resAdmin.json();
    console.log("📥 Modules reçus côté frontend :", adminModules);

    if (Array.isArray(adminModules) && adminModules.length > 0) {
      adminModules.forEach((mod) => {
        const moduleCard = document.createElement("div");
        moduleCard.classList.add("moduleCard", "adminModule");
        moduleCard.dataset.moduleId = mod.moduleId; // ID Mongo
        moduleCard.dataset.type = mod.type;

        moduleCard.innerHTML = `
          <h2>${mod.title}</h2>
          <span class="badge admin">Admin</span>
        `;

        moduleCard.addEventListener("click", () => {
          localStorage.setItem("currentAdminModule", mod.moduleId);
          window.location.href =
            "/frontend/pages/modules/frameworkAdmin.html";
        });

        container.appendChild(moduleCard);
      });
    }
  } catch (err) {
    console.error("Erreur récupération modules :", err);
  }
});
