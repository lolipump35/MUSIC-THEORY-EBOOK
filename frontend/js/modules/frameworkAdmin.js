/* =====================================================
   FRAMEWORK ADMIN — VERSION FINALE (TIMERS INIT)
===================================================== */

async function commitModuleTimes(moduleKey) {
  const token = localStorage.getItem("token");
  if (!token) return console.error("Pas de token trouvé");

  try {
    const res = await fetch(
      `http://localhost:5000/api/me/user-created-modules/${moduleKey}/commit-times`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erreur commit times: ${errorText}`);
    }

    const data = await res.json();
    console.log("✅ Temps initialisés :", data);
  } catch (err) {
    console.error(err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  console.clear();

  let adminModuleCache = null;

  /* ==========================
     1️⃣ Variables DOM / Sécurité
  ========================== */
  const token = localStorage.getItem("token");
  if (!token) return console.error("❌ Aucun token trouvé");

  const adminModuleId = localStorage.getItem("currentAdminModule");
  if (!adminModuleId) return console.error("❌ Aucun module admin sélectionné");

  const assignedModuleId = localStorage.getItem("currentAssignedModule");
  console.log("🧪 FRONT assignedModuleId (localStorage) =", assignedModuleId);

  if (assignedModuleId) {
    console.log(
      "🗑️ Module assigné à supprimer après création :",
      assignedModuleId
    );
  } else {
    console.log("ℹ️ Aucun module assigné (création libre)");
  }

  const infoContainer = document.querySelector(".infoContainer");
  const validBtn = document.getElementById("validPrograms");
  const howTimeInput = document.getElementById("trainingTime");
  const howDayInput = document.getElementById("trainingDays");

  if (!infoContainer || !validBtn || !howTimeInput || !howDayInput) {
    return console.error("❌ DOM manquant pour le framework admin");
  }

  console.log("🧩 Module admin ID :", adminModuleId);

  function afficherMessageErreur(msg) {
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
      adminModuleCache = adminModule; // ✅ stockage global
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

      // ✅ Stockage dans dataset pour réutilisation dans validBtn
      block.dataset.objectiveIndex = objectiveIndex;
      block.dataset.coef = objective.coef || 1;
      block.dataset.title = objective.title || `Objectif ${objectiveIndex}`;
      block.dataset.extra = objective.extra || "";
      block.dataset.imageUrl = objective.imageUrl || "";
      block.dataset.muxPlaybackId = objective.muxPlaybackId || "";

      block.innerHTML = `
      <h3>${objective.title}</h3>

      <button class="preview-toggle">
        Voir le contenu de l’objectif
      </button>

      <div class="objective-preview hidden">
        ${renderObjectivePreview(objective)}
      </div>

      <div class="scale">
        ${createScaleButtons()}
      </div>
    `;

      infoContainer.appendChild(block);

      // 🔹 Logique sélection de difficulté
      attachScaleLogic(block);

      // 🔹 Logique bouton prévisualisation
      attachPreviewToggle(block);
    });
  }

  function attachPreviewToggle(block) {
    const toggleBtn = block.querySelector(".preview-toggle");
    const preview = block.querySelector(".objective-preview");

    toggleBtn.addEventListener("click", () => {
      const isHidden = preview.classList.contains("hidden");

      if (isHidden) {
        // Ouverture → montrer le preview
        preview.classList.remove("hidden");
        toggleBtn.textContent = "Masquer le contenu de l’objectif";
      } else {
        // Fermeture → cacher le preview
        // et mettre en pause tous les mux-players
        preview.querySelectorAll("mux-player").forEach((player) => {
          player.pause();
        });

        preview.classList.add("hidden");
        toggleBtn.textContent = "Voir le contenu de l’objectif";
      }
    });
  }

  function renderObjectivePreview(objective) {
    let html = "";

    // Texte additionnel
    if (objective.extra) {
      html += `<p class="objective-extra">${objective.extra}</p>`;
    }

    // Image
    if (objective.imageUrl) {
      html += `
      <div class="objective-image">
        <img src="${objective.imageUrl}" alt="Image objectif">
      </div>
    `;
    }

    // Vidéo Mux avec <mux-player>
    if (objective.muxPlaybackId) {
      html += `
      <div class="objective-video">
        <mux-player
          playback-id="${objective.muxPlaybackId}"
          controls
          preload="metadata"
        ></mux-player>
      </div>
    `;
    }

    // Aucun contenu
    if (!html) {
      html = `<p class="objective-empty">Aucun contenu pour cet objectif.</p>`;
    }

    return html;
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

    // 🔹 SÉLECTION PAR DÉFAUT → difficulté 4
    const defaultBtn = block.querySelector('.scale-button[data-value="4"]');
    if (defaultBtn) {
      defaultBtn.classList.add("selected");
      block.dataset.selectedDifficulty = "4";
    }

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

    // Construction des objectifs par jour
    const objectivesByDay = {};
    document.querySelectorAll(".difficultyItem").forEach((block) => {
      const objectiveIndex = block.dataset.objectiveIndex;
      const objectiveId = `objective-${objectiveIndex}`;
      const title = block.dataset.title;
      const coef = parseFloat(block.dataset.coef) || 1;

      const difficultyLevel = parseInt(block.dataset.selectedDifficulty || "4");

      const assignedDays = Array.from({ length: howDay }, (_, i) => i + 1);

      assignedDays.forEach((day) => {
        if (!objectivesByDay[day]) objectivesByDay[day] = [];

        // 🔹 Récupérer tout le contenu lié à l'objectif
        const exercises = [];

        // Texte additionnel
        if (block.dataset.extra) {
          exercises.push({ type: "text", value: block.dataset.extra });
        }

        // Image
        if (block.dataset.imageUrl) {
          exercises.push({ type: "image", value: block.dataset.imageUrl });
        }

        // Vidéo Mux
        if (block.dataset.muxPlaybackId) {
          exercises.push({ type: "video", value: block.dataset.muxPlaybackId });
        }

        // HTML complet (optionnel)
        if (block.dataset.htmlExo) {
          exercises.push({ type: "html", value: block.dataset.htmlExo });
        }

        objectivesByDay[day].push({
          objectiveId,
          objectiveTitle: title,
          difficultyLevel,
          baseDifficultyLevel: difficultyLevel,
          coef,
          isCompleted: false,
          timerProgress: 0,
          exercises, // <- maintenant rempli correctement
        });
      });
    });

    const trainingDays = Object.keys(objectivesByDay).map((dayNum) => ({
      dayNumber: parseInt(dayNum),
      objectives: objectivesByDay[dayNum],
    }));

    const moduleData = {
      moduleKey: adminModuleId,
      type: "admin",
      programData: {
        name: adminModuleCache.title,
        trainingDays,
        timePerWeek: howTime,
        daysPerWeek: howDay,
      },
    };

    console.log("🧱 ModuleData prêt :", moduleData);

    try {
      const res = await fetch("http://localhost:5000/api/me/user-created", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleData),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la création du module");
      }

      const data = await res.json();
      console.log("✅ Module créé :", data);

      // 1️⃣ Stocker l’ID Mongo
      const mongoId = data.moduleId;
      localStorage.setItem("currentModule", mongoId);

      // 2️⃣ Commit timers (OBLIGATOIRE avant redirection)
      await commitModuleTimes(mongoId);

      if (assignedModuleId) {
        try {
          const deleteRes = await fetch(
            `http://localhost:5000/admin/api/me/assigned-modules/${assignedModuleId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!deleteRes.ok) {
            console.error("❌ Échec suppression du module assigné");
          } else {
            console.log("🗑️ Module assigné supprimé avec succès");
            localStorage.removeItem("currentAssignedModule");
          }
        } catch (err) {
          console.error(
            "❌ Erreur lors de la suppression du module assigné :",
            err
          );
        }
      }

      localStorage.removeItem("currentAdminModule");

      // 3️⃣ Redirection directe (sans aucun re-render)
      window.location.href = "/frontend/pages/programmsTrainning.html";
    } catch (err) {
      console.error("❌ Erreur création module :", err);
    }
  });
});
