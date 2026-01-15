window.addEventListener("DOMContentLoaded", () => {
  console.clear();

  const container = document.getElementById("trainingResult");
  if (!container) {
    console.error("❌ Aucun élément avec id='trainingResult' trouvé !");
    return;
  }

  const storedModules = {}; // Initialisation vide
  const currentModuleId = localStorage.getItem("currentModule");

  if (!currentModuleId) {
    container.innerHTML = "<p>Aucun module sélectionné.</p>";
    console.warn("⚠️ Aucun module sélectionné dans le localStorage.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    container.innerHTML = "<p>Connectez-vous pour voir vos modules.</p>";
    console.error("❌ Pas de token trouvé !");
    return;
  }

  // ================== 🔹 Fonctions utilitaires ==================

  function createScaleButtons(selectedLevel) {
    const buttons = [
      "big orange",
      "orange",
      "small orange",
      "grey",
      "small green",
      "green",
      "big green",
    ];
    return buttons
      .map((cls, index) => {
        const isSelected = index === selectedLevel ? "selected" : "";
        return `<div class="scale-button ${cls} ${isSelected}"></div>`;
      })
      .join("");
  }

  function markObjectiveAsCompleted(objectiveElement, day) {
    objectiveElement.classList.add("completed");

    const objectiveId = objectiveElement.dataset.objectiveId;
    const currentModuleId = localStorage.getItem("currentModule");
    if (!storedModules[currentModuleId]) return;

    storedModules[currentModuleId].programData.trainingDays.forEach(
      (dayObj) => {
        const obj = dayObj.objectives.find(
          (o) => o.objectiveId === objectiveId
        );
        if (obj && !obj.completedDays.includes(day)) {
          obj.completedDays.push(day);
        }
      }
    );
  }

  function initializeCloche(timerDiv, timeDiv, meta) {
    const { moduleKey, dayNumber, objectiveId, token } = meta;

    const circle = timerDiv.querySelector(".circle");
    const display = timerDiv.querySelector(".timerDisplay");

    let paused = true;
    let interval = null;

    // 🔹 Timer local pour gérer texte + cercle
    let remaining;

    if (timeDiv.dataset.remainingSeconds !== undefined) {
      remaining = parseInt(timeDiv.dataset.remainingSeconds, 10);
    } else {
      remaining = parseInt(timeDiv.dataset.estimatedSeconds, 10) || 0;
    }

    // 🔹 Hydrater le timer depuis le backend après un refresh
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/me/user-created-modules/${moduleKey}/training-days/${dayNumber}/objectives/${objectiveId}`,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );
        const data = await res.json();

        if (data.objective) {
          // Mettre à jour les datas du DOM
          timeDiv.dataset.remainingSeconds = data.objective.remainingSeconds;
          timeDiv.dataset.isRunning = data.objective.isRunning;
          timeDiv.dataset.lastStartTimestamp =
            data.objective.lastStartTimestamp;

          // Mettre à jour la variable locale `remaining`
          remaining =
            parseInt(timeDiv.dataset.remainingSeconds, 10) || remaining;

          // Mettre à jour l'affichage texte + cercle
          updateDisplay();
        }
      } catch (err) {
        console.error("Erreur hydrateTimer :", err);
      }
    })();

    const totalTime =
      parseInt(timeDiv.dataset.estimatedSeconds, 10) || remaining;

    // 🔹 Mise à jour UI texte + cercle
    function updateDisplay() {
      // Texte
      const mins = Math.floor(remaining / 60)
        .toString()
        .padStart(2, "0");
      const secs = (remaining % 60).toString().padStart(2, "0");
      display.textContent = `${mins}:${secs}`;

      // Cercle SVG
      const percent = totalTime > 0 ? (totalTime - remaining) / totalTime : 0;
      circle.setAttribute("stroke-dasharray", `${percent * 100}, 100`);
    }

    // 🔁 RÉHYDRATATION APRÈS REFRESH
    const isRunning = timeDiv.dataset.isRunning === "true";
    const lastStart = timeDiv.dataset.lastStartTimestamp
      ? new Date(timeDiv.dataset.lastStartTimestamp)
      : null;

    if (isRunning && lastStart) {
      if (interval) clearInterval(interval);

      const elapsed = Math.floor((Date.now() - lastStart.getTime()) / 1000);

      remaining = Math.max(remaining - elapsed, 0);
      timeDiv.dataset.remainingSeconds = remaining;
      console.log(timeDiv.dataset.remainingSeconds);

      paused = false;

      // 🔁 relancer le tick automatiquement
      interval = setInterval(() => {
        if (!paused) {
          remaining = Math.max(remaining - 1, 0);
          timeDiv.dataset.remainingSeconds = remaining;
          updateDisplay();

          if (remaining <= 0) {
            clearInterval(interval);
            paused = true;
            timeDiv.dataset.isRunning = "false";
          }
        }
      }, 1000);
    }

    updateDisplay();

    // 🔹 Click sur cloche
    timerDiv.querySelector(".cloche").addEventListener("click", async () => {
      console.log("🖱️ CLIC SUR LA CLOCHE", paused, remaining);

      if (paused) {
        // ▶️ START

        if (remaining <= 0) {
          console.log("⛔️ Timer déjà à 0, start bloqué");
          return;
        }

        console.log("▶️ START déclenché");
        paused = false;

        try {
          console.log(
            "PATCH URL :",
            `/api/me/user-created-modules/${moduleKey}/training-days/${dayNumber}/objectives/${objectiveId}/start`
          );
          console.log("TOKEN :", token); // vérifie qu’il n’est pas vide
          await fetch(
            `http://localhost:5000/api/me/user-created-modules/${moduleKey}/training-days/${dayNumber}/objectives/${objectiveId}/start`,
            {
              method: "PATCH",
              headers: { Authorization: "Bearer " + token },
            }
          );
          console.log("📤 START envoyé");
        } catch (err) {
          console.error("❌ Erreur fetch START :", err);
        }

        // 🔹 Intervalle local
        interval = setInterval(() => {
          if (!paused) {
            remaining = Math.max(remaining - 1, 0);
            timeDiv.dataset.remainingSeconds = remaining;
            updateDisplay();

            if (remaining <= 0) {
              console.log("⏱ TIMER TERMINÉ → COMPLETE");
              clearInterval(interval);
              paused = true;
              timeDiv.dataset.isRunning = "false";

              const objectiveItem = timerDiv.closest(".objectiveItem");
              if (objectiveItem)
                markObjectiveAsCompleted(objectiveItem, dayNumber);

              // PATCH COMPLETE
              fetch(
                `http://localhost:5000/api/me/user-created-modules/${moduleKey}/training-days/${dayNumber}/objectives/${objectiveId}/complete`,
                {
                  method: "PATCH",
                  headers: { Authorization: "Bearer " + token },
                }
              ).catch((err) =>
                console.error("❌ Erreur fetch COMPLETE :", err)
              );
            }
          }
        }, 1000);
      } else {
        // ⏸ PAUSE
        console.log("⏸ PAUSE déclenché");
        paused = true;
        clearInterval(interval);

        try {
          await fetch(
            `http://localhost:5000/api/me/user-created-modules/${moduleKey}/training-days/${dayNumber}/objectives/${objectiveId}/pause`,
            { method: "PATCH", headers: { Authorization: "Bearer " + token } }
          );
          console.log("📤 PAUSE envoyé");
        } catch (err) {
          console.error("❌ Erreur fetch PAUSE :", err);
        }
      }
    });

    // Expose updateDisplay pour usage externe
    timerDiv.updateDisplay = updateDisplay;
  }

  function renderObjectivesForDay(
    programDiv,
    objectives,
    day,
    programData,
    moduleKey
  ) {
    const list = programDiv.querySelector(".objectivesContainer");
    list.innerHTML = "";

    objectives.forEach((item, objIndex) => {
      item.id = item.id || `objective-${objIndex + 1}`;

      // ===== Container objectif =====
      const objectiveDiv = document.createElement("div");
      objectiveDiv.classList.add("objectiveItem");
      objectiveDiv.dataset.day = day;
      objectiveDiv.dataset.objectiveId = item.id;

      if (item.isCompleted || item.completedDays?.includes(day)) {
        objectiveDiv.classList.add("completed");
      }

      // ===== Texte objectif =====
      const textContainer = document.createElement("div");
      textContainer.classList.add("objectiveText");
      textContainer.innerHTML = `
      <div class="objectiveNumber">Objectif ${objIndex + 1}</div>
      <div class="objectiveTitle">${
        item.objectiveTitle || `Objectif ${objIndex + 1}`
      }</div>
    `;
      objectiveDiv.appendChild(textContainer);

      // ===== Difficulté =====
      const scaleDiv = document.createElement("div");
      scaleDiv.classList.add("scale");
      const difficultyIndex = (item.difficultyLevel || 4) - 1;
      scaleDiv.innerHTML = `<span>Difficile</span>${createScaleButtons(
        difficultyIndex
      )}<span>Facile</span>`;

      scaleDiv.querySelectorAll(".scale-button").forEach((btn, index) => {
        btn.addEventListener("click", async () => {
          scaleDiv
            .querySelectorAll(".scale-button")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
          item.difficultyLevel = index + 1;

          const timerDiv = objectiveDiv.querySelector(".objectiveTimer");
          const timeDiv = objectiveDiv.querySelector(".timeDisplay");

          try {
            const res = await fetch(
              `http://localhost:5000/api/me/user-created-modules/${moduleKey}/training-days/${day}/objectives/${item.id}/difficulty`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ difficultyLevel: Number(index + 1) }),
              }
            );

            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            // 🔹 Mise à jour de la source de vérité
            const dayToUpdate = programData.trainingDays.find(
              (d) => d.dayNumber === day
            );
            if (!dayToUpdate)
              return console.error("Jour introuvable dans programData");

            data.objectives.forEach((updatedObj) => {
              const localObj = dayToUpdate.objectives.find(
                (o) => o.id === updatedObj.objectiveId
              );
              if (!localObj) return;
              localObj.estimatedSeconds = updatedObj.estimatedSeconds;
              localObj.baseEstimatedSeconds = updatedObj.baseEstimatedSeconds;
              localObj.remainingSeconds = updatedObj.remainingSeconds;
              localObj.difficultyLevel = updatedObj.difficultyLevel;
              localObj.baseDifficultyLevel = updatedObj.baseDifficultyLevel;
            });

            renderObjectivesForDay(
              programDiv,
              dayToUpdate.objectives,
              day,
              programData,
              moduleKey
            );
          } catch (err) {
            console.error("Erreur mise à jour difficultyLevel :", err);
          }
        });
      });

      objectiveDiv.appendChild(scaleDiv);

      // ===== Temps estimé =====
      const timeDiv = document.createElement("div");
      timeDiv.classList.add("timeDisplay");
      const estimatedSeconds = item.estimatedSeconds ?? 0;
      timeDiv.dataset.baseEstimatedSeconds = estimatedSeconds;
      timeDiv.dataset.baseDifficultyLevel = item.difficultyLevel || 4;
      timeDiv.dataset.estimatedSeconds = estimatedSeconds;
      timeDiv.dataset.remainingSeconds = item.timerProgress ?? estimatedSeconds;
      objectiveDiv.appendChild(timeDiv);

      // ===== Timer cloche =====
      const timerDiv = document.createElement("div");
      timerDiv.classList.add("objectiveTimer");
      timerDiv.innerHTML = `
      <div class="cloche">
        <svg viewBox="0 0 36 36">
          <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          <path class="circle" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
        </svg>
        <span class="timerDisplay">00:00</span>
      </div>
    `;
      initializeCloche(timerDiv, timeDiv, {
        moduleKey,
        dayNumber: day,
        objectiveId: item.id,
        token: localStorage.getItem("token"),
      });
      objectiveDiv.appendChild(timerDiv);

      // ===== Toggle exercices =====
      // ===== Toggle exercices =====
      const toggleBtn = document.createElement("button");
      toggleBtn.classList.add("exerciseToggleBtn");
      toggleBtn.type = "button";
      toggleBtn.textContent = "Afficher l'exercice";

      const exerciseContainer = document.createElement("div");
      exerciseContainer.classList.add("exerciseContainer", "collapsed");

      // Vérification si des exercices existent
      if (Array.isArray(item.exercises) && item.exercises.length > 0) {
        exerciseContainer.innerHTML = item.exercises
          .map((ex) => {
            switch (ex.type) {
              case "text":
                return `<p class="exercise-text">${ex.value}</p>`;
              case "image":
                return `<div class="exercise-image"><img src="${ex.value}" alt="Image exercice"></div>`;
              case "video":
                return `
            <div class="exercise-video">
              <mux-player
                playback-id="${ex.value}"
                controls
                preload="metadata"
              ></mux-player>
            </div>
          `;
              case "html":
                return `<div class="exercise-html">${ex.value}</div>`;
              default:
                return "";
            }
          })
          .join("");
      } else {
        exerciseContainer.innerHTML = `<p class="noExercise">Aucun exercice associé.</p>`;
      }

      // Bouton toggle pour afficher / masquer
      toggleBtn.addEventListener("click", () => {
        const isCollapsed = exerciseContainer.classList.contains("collapsed");
        exerciseContainer.classList.toggle("collapsed");
        toggleBtn.textContent = isCollapsed
          ? "Masquer l'exercice"
          : "Afficher l'exercice";

        // Mettre en pause tous les mux-players si on masque
        if (!isCollapsed) {
          exerciseContainer
            .querySelectorAll("mux-player")
            .forEach((player) => player.pause());
        }
      });

      objectiveDiv.appendChild(toggleBtn);
      objectiveDiv.appendChild(exerciseContainer);

      list.appendChild(objectiveDiv);
    });
  }

  function renderModuleData(storedModules, currentModuleId) {
    const container = document.getElementById("trainingResult");
    if (!container) return;

    const moduleObj = storedModules[currentModuleId];
    if (!moduleObj || !moduleObj.programData) {
      container.innerHTML = "<p>Aucun programme disponible pour ce module.</p>";
      return;
    }

    const programData = moduleObj.programData;
    const moduleKey = moduleObj.moduleKey;

    container.innerHTML = "";

    // Titre du module
    const title = document.createElement("h2");
    title.textContent = programData.name;
    title.classList.add("moduleTitle");
    container.appendChild(title);

    const programDiv = document.createElement("div");
    programDiv.classList.add("programBlock");

    const programTitle = document.createElement("h3");
    programTitle.textContent = `Programme - ${programData.trainingDays.length} jour(s)`;
    programDiv.appendChild(programTitle);

    // Boutons jours
    const dayButtonsContainer = document.createElement("div");
    dayButtonsContainer.classList.add("programDays");

    programData.trainingDays.forEach((dayObj, index) => {
      const btn = document.createElement("button");
      btn.classList.add("dayProgramBtn");
      btn.textContent = `Jour ${dayObj.dayNumber}`;
      if (index === 0) btn.classList.add("selected");

      btn.addEventListener("click", () => {
        dayButtonsContainer
          .querySelectorAll(".dayProgramBtn")
          .forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        renderObjectivesForDay(
          programDiv,
          dayObj.objectives || [],
          dayObj.dayNumber,
          programData,
          moduleKey
        );
      });

      dayButtonsContainer.appendChild(btn);
    });

    programDiv.appendChild(dayButtonsContainer);

    // Container objectifs
    const objectivesContainer = document.createElement("div");
    objectivesContainer.classList.add("objectivesContainer");
    programDiv.appendChild(objectivesContainer);

    // Afficher premier jour
    if (programData.trainingDays.length > 0) {
      const firstDay = programData.trainingDays[0];
      renderObjectivesForDay(
        programDiv,
        firstDay.objectives || [],
        firstDay.dayNumber,
        programData,
        moduleKey
      );
    }

    container.appendChild(programDiv);
  }

  // ================== 🔹 Fetch backend ==================
  fetch("http://localhost:5000/api/me/user-created-modules", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((modules) => {
      const moduleData = modules.find((m) => m.moduleKey === currentModuleId);
      console.log("📦 Module complet récupéré :", moduleData);

      if (!moduleData) {
        container.innerHTML = "<p>Module introuvable.</p>";
        console.warn("⚠️ Aucun module correspondant trouvé dans le backend.");
        return;
      }

      const programData = moduleData.programData;
      programData.trainingDays.forEach((dayObj) => {
        console.log(`Jour ${dayObj.dayNumber}`, dayObj.objectives);
        dayObj.objectives.forEach((obj) => {
          console.log(
            "Objectif :",
            obj.id,
            obj.exercises,
            obj.extra,
            obj.imageUrl,
            obj.muxPlaybackId,
            obj.htmlExo
          );
        });
      });

      storedModules[currentModuleId] = moduleData;
      renderModuleData(storedModules, currentModuleId);
    })
    .catch((err) => {
      console.error("Erreur lors de la récupération du module :", err);
      container.innerHTML = "<p>Erreur lors de la récupération du module.</p>";
    });
});
