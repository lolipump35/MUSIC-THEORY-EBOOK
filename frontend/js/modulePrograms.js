window.addEventListener("DOMContentLoaded", () => {
  console.clear();

  const container = document.getElementById("trainingResult");
  if (!container) {
    console.error("❌ Aucun élément avec id='trainingResult' trouvé !");
    return;
  }

  const storedModules =
    JSON.parse(localStorage.getItem("trainingModules")) || {};
  const currentModuleId = localStorage.getItem("currentModule");

  if (!currentModuleId || !storedModules[currentModuleId]) {
    container.innerHTML = "<p>Aucun module sélectionné ou trouvé.</p>";
    console.warn("⚠️ Aucun module correspondant dans le localStorage.");
    return;
  }

  const moduleData = storedModules[currentModuleId];
  container.innerHTML = ""; // Nettoyage avant affichage

  // ====== 🔹 Fonctions utilitaires ======
  function saveModules() {
    localStorage.setItem("trainingModules", JSON.stringify(storedModules));
  }

  function markObjectiveAsCompleted(objectiveElement, day) {
    objectiveElement.classList.add("completed");

    const objectiveId = objectiveElement.dataset.objectiveId;
    const currentModuleId = localStorage.getItem("currentModule");
    const storedModules =
      JSON.parse(localStorage.getItem("trainingModules")) || {};

    if (!storedModules[currentModuleId]) return;

    // On parcourt tous les programmes du module
    storedModules[currentModuleId].programs.forEach((program) => {
      const obj = program.objectives.find((o) => o.id === objectiveId);
      if (obj && !obj.completedDays.includes(day)) {
        obj.completedDays.push(day); // <- on ajoute le jour courant
      }
    });

    // On sauvegarde immédiatement le localStorage
    localStorage.setItem("trainingModules", JSON.stringify(storedModules));
  }

  function getTimeForDifficulty(objectiveId, program) {
    const module = storedModules[currentModuleId];
    if (!module || !module.programs.length) return 0;

    const progData = module.programs[0];
    if (!progData.timePerWeek || !progData.daysPerWeek) return 0;

    const totalMinutes = progData.timePerWeek;
    const days = progData.daysPerWeek;
    const minutesPerDay = totalMinutes / days;

    const objectives = program.objectives || [];

    const processedObjectives = objectives.map((o) => {
      const facteurModere = 1 + ((7 - o.difficultyLevel) / 6) * 2; // entre 1 et 3
      const poidsFinal = facteurModere * (o.coef || 1);
      return { ...o, poidsFinal };
    });

    const totalWeight = processedObjectives.reduce(
      (sum, o) => sum + o.poidsFinal,
      0
    );
    const myObjective = processedObjectives.find((o) => o.id === objectiveId);
    if (!myObjective) return 0;

    const myPercentage = myObjective.poidsFinal / totalWeight;
    return Math.round(minutesPerDay * myPercentage);
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

  function initializeCloche(timerDiv, timeDiv) {
    const circle = timerDiv.querySelector(".circle");
    const display = timerDiv.querySelector(".timerDisplay");
    let paused = true;
    let interval = null;

    function getTime() {
      const text = timeDiv.textContent;
      const match = text.match(/(\d+)\s*min/);
      return match ? parseInt(match[1], 10) * 60 : 0;
    }

    let seconds = getTime();

    function updateDisplay() {
      const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
      const secs = String(seconds % 60).padStart(2, "0");
      display.textContent = `${mins}:${secs}`;

      const total = getTime();
      const percent = total > 0 ? (total - seconds) / total : 0;
      circle.setAttribute("stroke-dasharray", `${percent * 100}, 100`);

      if (seconds === 0) {
        const objectiveItem = timerDiv.closest(".objectiveItem");
        if (objectiveItem) {
          const day = parseInt(objectiveItem.dataset.day, 10);
          markObjectiveAsCompleted(objectiveItem, day);
        }
        clearInterval(interval);
        paused = true;
      }
    }

    updateDisplay();

    timerDiv.querySelector(".cloche").addEventListener("click", () => {
      if (paused) {
        paused = false;
        interval = setInterval(() => {
          if (seconds > 0) {
            seconds--;
            updateDisplay();
          }
        }, 1000);
      } else {
        paused = true;
        clearInterval(interval);
      }
    });

    timeDiv.addEventListener("change", () => {
      seconds = getTime();
      updateDisplay();
    });
  }

  function renderObjectivesForDay(programDiv, objectives, day, program) {
    const list = programDiv.querySelector(".objectivesContainer");
    list.innerHTML = "";

    console.log("Day sélectionné :", day);
    console.log("Objectifs reçus :", objectives);

    const filtered = objectives.filter((obj) =>
      obj.assignedDays?.includes(day)
    );

    console.log("Objectifs filtrés pour ce jour :", filtered);

    filtered.forEach((item, objIndex) => {
      item.id = item.id || `objective-${objIndex + 1}`;

      const objectiveDiv = document.createElement("div");
      objectiveDiv.classList.add("objectiveItem");

      objectiveDiv.dataset.day = day; // numéro du jour actuel
      objectiveDiv.dataset.objectiveId = item.id; // l’id de l’objectif

      if (item.completedDays?.includes(day))
  objectiveDiv.classList.add("completed");

      const textContainer = document.createElement("div");
      textContainer.classList.add("objectiveText");
      textContainer.innerHTML = `<h4>Objectif ${objIndex + 1}</h4><p>${
        item.objectif
      }</p>`;

      const timeDiv = document.createElement("div");
      timeDiv.classList.add("timeDisplay");
      timeDiv.textContent = `Temps estimé : ${getTimeForDifficulty(
        item.id,
        program
      )} min`;

      const scaleDiv = document.createElement("div");
      scaleDiv.classList.add("scale");
      scaleDiv.innerHTML = `<span>Difficile</span>${createScaleButtons(
        item.difficultyLevel - 1
      )}<span>Facile</span>`;

      scaleDiv.querySelectorAll(".scale-button").forEach((btn, index) => {
        btn.addEventListener("click", () => {
          scaleDiv
            .querySelectorAll(".scale-button")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
          item.difficultyLevel = index + 1;
          timeDiv.textContent = `Temps estimé : ${getTimeForDifficulty(
            item.id,
            program
          )} min`;
          timeDiv.dispatchEvent(new Event("change"));
          saveModules();
        });
      });

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
      initializeCloche(timerDiv, timeDiv);

      if (item.completedDays?.includes(day))
        objectiveDiv.classList.add("completed");

      objectiveDiv.appendChild(textContainer);
      objectiveDiv.appendChild(scaleDiv);
      objectiveDiv.appendChild(timeDiv);
      objectiveDiv.appendChild(timerDiv);

      list.appendChild(objectiveDiv);
    });
  }

  function createDayButtons(programDiv, daysPerWeek, objectives, program) {
    const container = document.createElement("div");
    container.classList.add("programDays");

    for (let i = 1; i <= daysPerWeek; i++) {
      const btn = document.createElement("button");
      btn.classList.add("dayProgramBtn");
      btn.textContent = `Jour ${i}`;
      if (i === 1) btn.classList.add("selected");

      btn.addEventListener("click", () => {
        container
          .querySelectorAll(".dayProgramBtn")
          .forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        renderObjectivesForDay(programDiv, objectives, i, program);
      });

      container.appendChild(btn);
    }

    programDiv.appendChild(container);

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
          localStorage.setItem(
            "trainingModules",
            JSON.stringify(storedModules)
          );
          block.remove();
          console.log(`✅ Programme ${index + 1} supprimé.`);
        }
      });

      block.appendChild(deleteBtn);
    });
  }

  // ====== 🔹 Affichage du titre du module ======
  const title = document.createElement("h2");
  title.textContent = moduleData.name;
  title.classList.add("moduleTitle");
  container.appendChild(title);

  // ====== 🔹 Affichage des programmes ======
  moduleData.programs.forEach((program, progIndex) => {
    const programDiv = document.createElement("div");
    programDiv.classList.add("programBlock");

    const programTitle = document.createElement("h3");
    programTitle.textContent = `Programme ${progIndex + 1}`;
    programDiv.appendChild(programTitle);

    createDayButtons(
      programDiv,
      program.daysPerWeek,
      program.objectives || [],
      program
    );
    container.appendChild(programDiv);
  });

  enableProgramDeletion(container, storedModules, currentModuleId);
});
