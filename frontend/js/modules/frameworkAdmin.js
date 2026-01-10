/* =====================================================
   FRAMEWORK ADMIN — VERSION FINALE
===================================================== */

window.addEventListener("DOMContentLoaded", () => {
  console.clear();

  /* ==========================
     1️⃣ Variables DOM / Sécurité
  ========================== */
  const token = localStorage.getItem("token");
  if (!token) return console.error("❌ Aucun token trouvé");

  const adminModuleId = localStorage.getItem("currentAdminModule");
  if (!adminModuleId) return console.error("❌ Aucun module admin sélectionné");

  const infoContainer = document.querySelector(".infoContainer");
  const validBtn = document.getElementById("validPrograms");
  const howTimeInput = document.getElementById("trainingTime");
  const howDayInput = document.getElementById("trainingDays");

  if (!infoContainer || !validBtn || !howTimeInput || !howDayInput) {
    return console.error("❌ DOM manquant pour le framework admin");
  }

  console.log("🧩 Module admin ID :", adminModuleId);

  function afficherMessageErreur(msg) {
    // Simple alert, peut être remplacé par un toast / div
    alert(msg);
  }

  /* ==========================
     2️⃣ Fetch du module admin
  ========================== */
  fetch(`http://localhost:5000/admin/modules/${adminModuleId}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return res.json();
    })
    .then((adminModule) => {
      console.log("📥 Module admin reçu :", adminModule);

      if (!adminModule || !Array.isArray(adminModule.objectives)) {
        return console.error("❌ Structure du module invalide");
      }

      renderModuleHeader(adminModule);
      renderObjectives(adminModule.objectives);
    })
    .catch((err) =>
      console.error("❌ Erreur récupération module admin :", err)
    );

  /* =====================================================
     3️⃣ Header Module (Titre)
  ===================================================== */
  function renderModuleHeader(module) {
    const titleElement = document.querySelector(".moduleTitle");
    if (titleElement) titleElement.textContent = module.title || "Module Admin";
  }

  /* =====================================================
     4️⃣ Render des objectifs
  ===================================================== */
  function renderObjectives(objectives) {
    infoContainer.innerHTML = "";

    objectives.forEach((objective, index) => {
      const objectiveIndex = index + 1;

      const block = document.createElement("div");
      block.classList.add("difficultyItem");
      block.dataset.objectiveIndex = objectiveIndex;

      block.innerHTML = `
        <h3>Objectif ${objectiveIndex} — ${objective.title}</h3>
        <div class="scale">
          ${createScaleButtons()}
        </div>
      `;

      infoContainer.appendChild(block);
      attachScaleLogic(block);
    });
  }

  /* =====================================================
     5️⃣ Boutons de difficulté
  ===================================================== */
  function createScaleButtons() {
    return `
      <span>Difficile</span>

      <div class="scale-button big orange" data-value="1"></div>
      <div class="scale-button orange" data-value="2"></div>
      <div class="scale-button small orange" data-value="3"></div>
      <div class="scale-button grey" data-value="4"></div>
      <div class="scale-button small green" data-value="5"></div>
      <div class="scale-button green" data-value="6"></div>
      <div class="scale-button big green" data-value="7"></div>

      <span>Facile</span>
    `;
  }

  /* =====================================================
     6️⃣ Logique de sélection des boutons
  ===================================================== */
  function attachScaleLogic(block) {
    const buttons = block.querySelectorAll(".scale-button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        block.dataset.selectedDifficulty = btn.dataset.value;

        console.log(
          `🎯 Objectif ${block.dataset.objectiveIndex} → difficulté ${btn.dataset.value}`
        );
      });
    });
  }

  /* =====================================================
     7️⃣ ValidButton — Création du module admin
  ===================================================== */
  validBtn.addEventListener("click", async () => {
    const allSelected = [];
    const howTime = parseInt(howTimeInput.value) || 0;
    const howDay = parseInt(howDayInput.value) || 0;

    // ✅ Vérification des inputs
    let inputsValid = true;

    if (howTime === 0) {
      inputsValid = false;
      howTimeInput.classList.add("error-border");
      setTimeout(() => howTimeInput.classList.remove("error-border"), 2000);
    }

    if (howDay === 0) {
      inputsValid = false;
      howDayInput.classList.add("error-border");
      setTimeout(() => howDayInput.classList.remove("error-border"), 2000);
    }

    if (!inputsValid) {
      afficherMessageErreur(
        "Merci de renseigner un temps et un nombre de jours valides."
      );
      return;
    }

    // ✅ Construction des objectifs par jour
    const objectivesByDay = {};

    document.querySelectorAll(".difficultyItem").forEach((block) => {
      const objectiveIndex = block.dataset.objectiveIndex;
      const objectiveId = `admin-${objectiveIndex}`;
      const title = block.querySelector("h3").textContent.trim();
      const selectedDifficulty = block.dataset.selectedDifficulty;

      if (!selectedDifficulty) {
        block.querySelector("h3").classList.add("error-highlight");
        allSelected.push(false);
        return;
      } else {
        block.querySelector("h3").classList.remove("error-highlight");
        allSelected.push(true);
      }

      const difficultyLevel = parseInt(selectedDifficulty);
      const assignedDays = Array.from({ length: howDay }, (_, i) => i + 1);

      assignedDays.forEach((day) => {
        if (!objectivesByDay[day]) objectivesByDay[day] = [];
        objectivesByDay[day].push({
          objectiveId,
          objectiveTitle: title,

          difficultyLevel,
          baseDifficultyLevel: difficultyLevel,
          coef: objective.coef || 1,
          isCompleted: false,
          timerProgress: 0,
          exercises: [], // Admin : pas encore d’exercices
        });
      });
    });

    if (!allSelected.every(Boolean)) return;

    // ✅ Création des trainingDays
    const trainingDays = Object.keys(objectivesByDay).map((dayNum) => ({
      dayNumber: parseInt(dayNum),
      objectives: objectivesByDay[dayNum],
    }));

    // ✅ Module final
    const moduleData = {
      moduleKey: adminModuleId,
      type: "admin",
      programData: {
        name: `Programme — ${adminModuleId}`,
        trainingDays,
        timePerWeek: howTime,
        daysPerWeek: howDay,
      },
    };

    console.log("🧱 ModuleData prêt :", moduleData);

    // ✅ Envoi au backend
    try {
      const res = await fetch("http://localhost:5000/api/me/user-created", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleData),
      });
      const data = await res.json();
      console.log("✅ Module créé :", data);

      // Stockage MongoID
      const mongoId = data.moduleId;
      localStorage.setItem("currentModule", mongoId);

      // Initialisation des temps
      if (typeof commitModuleTimes === "function") {
        await commitModuleTimes(mongoId);
      }

      // Redirection finale
      window.location.href = "/frontend/pages/programmsTrainning.html";
    } catch (err) {
      console.error("❌ Erreur création module :", err);
    }
  });
});
