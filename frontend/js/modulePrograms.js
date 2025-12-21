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

function saveModules() {
  const currentModuleId = localStorage.getItem("currentModule");
  if (!currentModuleId || !storedModules[currentModuleId]) return;

  const moduleToSave = storedModules[currentModuleId];

  // On fait un PATCH sur le module existant pour éviter les doublons
  fetch(`http://localhost:5000/api/me/user-created-modules/${currentModuleId}`, {
    method: "PATCH",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(moduleToSave),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((text) => {
          throw new Error(`Erreur backend: ${res.status} ${text}`);
        });
      }
      return res.json();
    })
    .then((data) => console.log("✅ Module mis à jour côté serveur :", data))
    .catch((err) => console.error("Erreur mise à jour module :", err));
}


  function markObjectiveAsCompleted(objectiveElement, day) {
    objectiveElement.classList.add("completed");

    const objectiveId = objectiveElement.dataset.objectiveId;
    if (!storedModules[currentModuleId]) return;

    storedModules[currentModuleId].programs.forEach((program) => {
      const obj = program.objectives.find((o) => o.id === objectiveId);
      if (obj && !obj.completedDays.includes(day)) {
        obj.completedDays.push(day);
      }
    });

    saveModules();
  }

  function getTimeForDifficulty(objectiveId, dayNumber) {
    const moduleData = storedModules[currentModuleId]?.programData;
    if (!moduleData || !moduleData.timePerWeek || !moduleData.trainingDays)
      return 0;

    const totalMinutes = moduleData.timePerWeek;
    const days = moduleData.trainingDays.length;
    if (days === 0) return 0;

    const minutesPerDay = totalMinutes / days;

    // On récupère les objectifs du jour correspondant
    const dayObj = moduleData.trainingDays.find(
      (d) => d.dayNumber === dayNumber
    );
    if (!dayObj || !dayObj.objectives) return 0;

    const objectives = dayObj.objectives;

    const processedObjectives = objectives.map((o) => {
      const facteurModere = 1 + ((7 - (o.difficultyLevel || 4)) / 6) * 2;
      const poidsFinal = facteurModere * (o.coef || 1);
      return { ...o, poidsFinal };
    });

    const totalWeight = processedObjectives.reduce(
      (sum, o) => sum + o.poidsFinal,
      0
    );
    if (totalWeight === 0) return 0;

    const myObjective = processedObjectives.find(
      (o) => o.objectiveId === objectiveId || o.id === objectiveId
    );
    if (!myObjective) return 0;

    const myPercentage = myObjective.poidsFinal / totalWeight;
    return Math.round(minutesPerDay * myPercentage);
  }

  function applyDifficultyToObjective(timeDiv, newDifficultyLevel) {
    const difficultyMultipliers = {
      1: 1.4,
      2: 1.25,
      3: 1.1,
      4: 1,
      5: 0.9,
      6: 0.75,
      7: 0.6,
    };

    const baseTime = parseInt(timeDiv.dataset.baseEstimatedSeconds, 10);
    const baseDifficulty = parseInt(timeDiv.dataset.baseDifficultyLevel, 10);
    const oldTotal = parseInt(timeDiv.dataset.estimatedSeconds, 10);
    const oldRemaining = parseInt(timeDiv.dataset.remainingSeconds, 10);

    if (!baseTime || !baseDifficulty || !oldTotal || !oldRemaining) return;

    // progression actuelle
    const elapsed = oldTotal - oldRemaining;
    const progress = elapsed / oldTotal;

    // rapport entre la nouvelle difficulté et la difficulté pivot
    const baseMultiplier = difficultyMultipliers[baseDifficulty];
    const newMultiplier = difficultyMultipliers[newDifficultyLevel];

    const relativeMultiplier = newMultiplier / baseMultiplier;

    const newTotal = Math.round((baseTime * relativeMultiplier) / 10) * 10;

    const newRemaining = Math.max(
      Math.round((newTotal * (1 - progress)) / 10) * 10,
      10
    );

    timeDiv.dataset.estimatedSeconds = newTotal;
    timeDiv.dataset.remainingSeconds = newRemaining;
  }

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

  function initializeCloche(timerDiv, timeDiv, meta) {
    const { moduleKey, dayNumber, objectiveId, token } = meta; // 🔹 récup depuis meta

    const circle = timerDiv.querySelector(".circle");
    const display = timerDiv.querySelector(".timerDisplay");

    function getRemaining() {
      return parseInt(timeDiv.dataset.remainingSeconds, 10);
    }

    let paused = true;
    let interval = null;

    function updateDisplay() {
      const seconds = getRemaining();
      const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      const secs = (seconds % 60).toString().padStart(2, "0");
      display.textContent = `${mins}:${secs}`;

      const total = parseInt(timeDiv.dataset.estimatedSeconds, 10);
      const percent = total > 0 ? (total - seconds) / total : 0;
      circle.setAttribute("stroke-dasharray", `${percent * 100}, 100`);
    }

    updateDisplay();

    // 🔹 Fetch en arrière-plan pour récupérer timerProgress depuis la DB
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/me/user-created-modules/${moduleKey}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
          }
        );
        const moduleData = await res.json();
        if (!moduleData) return;

        const day = moduleData.trainingDays?.find(
          (d) => d.dayNumber === dayNumber
        );
        if (!day) return;

        const objective = day.objectives?.find(
          (o) => o.objectiveId === objectiveId
        );
        if (!objective) return;

        // 🔹 Pivot : ne mettre à jour le timer que si l'objectif a déjà été commencé ou est terminé
        if (
          !(objective.isCompleted === false && objective.timerProgress === 0)
        ) {
          timeDiv.dataset.remainingSeconds = objective.timerProgress;
          updateDisplay();
        }
        // sinon, on garde le timer par défaut
      } catch (err) {
        console.error("Erreur fetch timerProgress initial :", err);
      }

      console.log("ModuleKey utilisé :", moduleKey);
      console.log("Token :", token);
    })();

    timerDiv.querySelector(".cloche").addEventListener("click", () => {
      if (paused) {
        paused = false;
        let lastSync = Date.now();

        interval = setInterval(async () => {
          let current = getRemaining();

          if (current > 0) {
            current--;
            timeDiv.dataset.remainingSeconds = current;
            updateDisplay();

            // Envoi périodique au backend toutes les 5 secondes
            if (current % 5 === 0) {
              try {
                console.log(
                  "Envoi timerProgress périodique :",
                  current,
                  moduleKey,
                  dayNumber,
                  objectiveId
                );
                await fetch(
                  `http://localhost:5000/api/me/user-created-modules/${moduleKey}/training-days/${dayNumber}/objectives/${objectiveId}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: "Bearer " + token,
                    },
                    body: JSON.stringify({
                      timerProgress: current,
                      completed: false,
                    }),
                  }
                );
              } catch (err) {
                console.error("Erreur fetch périodique :", err);
              }
            }
          } else {
            clearInterval(interval);
            paused = true;

            const objectiveItem = timerDiv.closest(".objectiveItem");
            if (objectiveItem) {
              markObjectiveAsCompleted(objectiveItem, dayNumber);

              try {
                console.log("Envoi timerProgress final + completed :", current);
                await fetch(
                  `http://localhost:5000/api/me/user-created-modules/${moduleKey}/training-days/${dayNumber}/objectives/${objectiveId}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: "Bearer " + token,
                    },
                    body: JSON.stringify({ timerProgress: 0, completed: true }),
                  }
                );
              } catch (err) {
                console.error("Erreur fetch final :", err);
              }
            }
          }
        }, 1000);
      } else {
        paused = true;
        clearInterval(interval);
      }
    });

    timerDiv.updateDisplay = updateDisplay;
  }

  function renderObjectivesForDay(
    programDiv,
    objectives,
    day,
    program,
    moduleKey
  ) {
    const list = programDiv.querySelector(".objectivesContainer");
    list.innerHTML = "";

    objectives.forEach((item, objIndex) => {
      // Assigner un id unique si nécessaire
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
      const objectiveTitle = item.objectiveTitle || `Objectif ${objIndex + 1}`;
      textContainer.innerHTML = `
      <div class="objectiveNumber">Objectif ${objIndex + 1}</div>
      <div class="objectiveTitle">${objectiveTitle}</div>
    `;
      objectiveDiv.appendChild(textContainer);

      // ===== Difficulté =====
      const scaleDiv = document.createElement("div");
      scaleDiv.classList.add("scale");

      // index de difficulté pour l'affichage (1-5)
      const difficultyIndex = (item.difficultyLevel || 4) - 1;

      scaleDiv.innerHTML = `<span>Difficile</span>${createScaleButtons(
        difficultyIndex
      )}<span>Facile</span>`;

      // Ajout des event listeners pour chaque bouton de difficulté
      scaleDiv.querySelectorAll(".scale-button").forEach((btn, index) => {
        btn.addEventListener("click", async () => {
          // 🔹 Mise à jour visuelle
          scaleDiv
            .querySelectorAll(".scale-button")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");

          // 🔹 Mise à jour de l'objet local
          item.difficultyLevel = index + 1;

          // 🔹 Application immédiate sur le timer
          applyDifficultyToObjective(timeDiv, item.difficultyLevel);
          const estimatedSeconds = parseInt(
            timeDiv.dataset.estimatedSeconds,
            10
          );
          timeDiv.textContent = `Temps estimé : ${Math.round(
            estimatedSeconds / 60
          )} min`;
          timerDiv.updateDisplay();

          // 🔹 PATCH backend pour difficultyLevel
          try {
            console.log("ModuleKey utilisé pour patch :", moduleKey);
            const res = await fetch(
              `http://localhost:5000/api/me/user-created-modules/${moduleKey}/training-days/${day}/objectives/${item.id}/difficulty`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ difficulty: item.difficultyLevel }),
              }
            );

            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`Erreur backend: ${res.status} ${errorText}`);
            }

            console.log(
              "✅ DifficultyLevel mis à jour côté serveur :",
              item.difficultyLevel
            );
          } catch (err) {
            console.error("Erreur mise à jour difficultyLevel :", err);
          }

          // 🔹 Sauvegarde locale
          saveModules();
        });
      });

      // Ajout du bloc difficulté à l'objectif
      objectiveDiv.appendChild(scaleDiv);

      // ===== Temps estimé =====
      const timeDiv = document.createElement("div");
      timeDiv.classList.add("timeDisplay");
      const estimatedMinutes = getTimeForDifficulty(item.objectiveId, day);
      const estimatedSeconds = estimatedMinutes * 60;
      const currentDifficulty = item.difficultyLevel || 4;

      if (!timeDiv.dataset.baseEstimatedSeconds) {
        timeDiv.dataset.baseEstimatedSeconds = estimatedSeconds;
        timeDiv.dataset.baseDifficultyLevel = currentDifficulty;
      }
      timeDiv.dataset.estimatedSeconds = estimatedSeconds;
      if (!timeDiv.dataset.remainingSeconds) {
        timeDiv.dataset.remainingSeconds = estimatedSeconds;
      }
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
        moduleKey: moduleKey, // 🔑 MAINTENANT TOUJOURS DÉFINI
        dayNumber: day,
        objectiveId: item.id,
        token: localStorage.getItem("token"),
      });

      objectiveDiv.appendChild(timerDiv);

      // ===== Toggle exercices =====
      const toggleBtn = document.createElement("button");
      toggleBtn.classList.add("exerciseToggleBtn");
      toggleBtn.type = "button";
      toggleBtn.textContent = "Afficher l'exercice";

      const exerciseContainer = document.createElement("div");
      exerciseContainer.classList.add("exerciseContainer", "collapsed");
      if (Array.isArray(item.exercises) && item.exercises.length > 0) {
        exerciseContainer.innerHTML = item.exercises
          .map((ex) => `<div class="exerciseItem">${ex}</div>`)
          .join("");
      } else {
        exerciseContainer.innerHTML = `<p class="noExercise">Aucun exercice associé.</p>`;
      }

      toggleBtn.addEventListener("click", () => {
        const isCollapsed = exerciseContainer.classList.contains("collapsed");
        exerciseContainer.classList.toggle("collapsed");
        toggleBtn.textContent = isCollapsed
          ? "Masquer l'exercice"
          : "Afficher l'exercice";
      });

      objectiveDiv.appendChild(toggleBtn);
      objectiveDiv.appendChild(exerciseContainer);

      list.appendChild(objectiveDiv);
    });
  }

  function createDayButtons(programDiv, daysPerWeek, objectives, program) {
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("programDays");

    for (let i = 1; i <= daysPerWeek; i++) {
      const btn = document.createElement("button");
      btn.classList.add("dayProgramBtn");
      btn.textContent = `Jour ${i}`;
      if (i === 1) btn.classList.add("selected");

      btn.addEventListener("click", () => {
        containerDiv
          .querySelectorAll(".dayProgramBtn")
          .forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        renderObjectivesForDay(programDiv, objectives, i, program);
      });

      containerDiv.appendChild(btn);
    }

    programDiv.appendChild(containerDiv);
    const objectivesContainer = document.createElement("div");
    objectivesContainer.classList.add("objectivesContainer");
    programDiv.appendChild(objectivesContainer);
    renderObjectivesForDay(programDiv, objectives, 1, program);
  }

  function enableProgramDeletion(container, storedModules, currentModuleId) {
    const programBlocks = container.querySelectorAll(".programBlock");
    programBlocks.forEach((block, index) => {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Supprimer";
      deleteBtn.classList.add("deleteProgramBtn");

      deleteBtn.addEventListener("click", () => {
        if (confirm("Voulez-vous vraiment supprimer ce programme ?")) {
          storedModules[currentModuleId].programs.splice(index, 1);
          saveModules(); // mise à jour côté serveur
          block.remove();
          console.log(`✅ Programme ${index + 1} supprimé.`);
        }
      });

      block.appendChild(deleteBtn);
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
    const moduleKey = moduleObj.moduleKey; // 🔑 IMPORTANT

    container.innerHTML = "";

    // ====== Titre du module ======
    const title = document.createElement("h2");
    title.textContent = programData.name;
    title.classList.add("moduleTitle");
    container.appendChild(title);

    // ====== Création des programmes ======
    // Ici on suppose 1 programme par module pour simplifier
    const programDiv = document.createElement("div");
    programDiv.classList.add("programBlock");

    // Programme titre
    const programTitle = document.createElement("h3");
    programTitle.textContent = `Programme - ${programData.trainingDays.length} jour(s)`;
    programDiv.appendChild(programTitle);

    // ====== Boutons pour sélectionner les jours ======
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
          programData
        );
      });

      dayButtonsContainer.appendChild(btn);
    });

    programDiv.appendChild(dayButtonsContainer);

    // Container pour les objectifs
    const objectivesContainer = document.createElement("div");
    objectivesContainer.classList.add("objectivesContainer");
    programDiv.appendChild(objectivesContainer);

    // Afficher les objectifs du premier jour par défaut
    // Afficher les objectifs du premier jour par défaut
    if (programData.trainingDays.length > 0) {
      const firstDay = programData.trainingDays[0]; // ✅ définir le premier jour
      renderObjectivesForDay(
        programDiv,
        firstDay.objectives || [],
        firstDay.dayNumber,
        programData,
        moduleKey // 🔑
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

      if (!moduleData) {
        container.innerHTML = "<p>Module introuvable.</p>";
        console.warn("⚠️ Aucun module correspondant trouvé dans le backend.");
        return;
      }

      storedModules[currentModuleId] = moduleData;
      renderModuleData(storedModules, currentModuleId);
    })
    .catch((err) => {
      console.error("Erreur lors de la récupération du module :", err);
      container.innerHTML = "<p>Erreur lors de la récupération du module.</p>";
    });
});
