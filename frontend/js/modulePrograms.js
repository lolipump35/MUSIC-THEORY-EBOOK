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

    // ✅ Gérer le cas où "program" contient les objectifs dans une propriété "objectives"
    const objectives = Array.isArray(program)
      ? program
      : program.objectives || [];

    objectives.forEach((item, objIndex) => {
      const objectiveDiv = document.createElement("div");
      objectiveDiv.classList.add("objectiveItem");

      // Contenu texte
      const textContainer = document.createElement("div");
      textContainer.classList.add("objectiveText");
      textContainer.innerHTML = `
        <h4>Objectif ${objIndex + 1}</h4>
        <p>${item.objectif}</p>
      `;

      // Échelle de difficulté
      const scaleDiv = document.createElement("div");
      scaleDiv.classList.add("scale");
      scaleDiv.innerHTML = `
  <span>Difficile</span>
  ${createScaleButtons(item.difficultyLevel - 1)}
  <span>Facile</span>
`;

      // Temps estimé
      const timeDiv = document.createElement("div");
      timeDiv.classList.add("timeDisplay");

      const initialDifficulty = item.difficultyLevel ?? 3;
      timeDiv.textContent = `Temps estimé : ${getTimeForDifficulty(
        initialDifficulty,
        program
      )} min`;

      timeDiv.dispatchEvent(new Event("change"));

      // Gestion clic difficulté
      scaleDiv.querySelectorAll(".scale-button").forEach((btn, index) => {
        btn.addEventListener("click", () => {
          scaleDiv
            .querySelectorAll(".scale-button")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");

          timeDiv.textContent = `Temps estimé : ${getTimeForDifficulty(
            index,
            program
          )} min`;
          timeDiv.dispatchEvent(new Event("change"));
        });
      });

      // Cloque (minuteur)
      const timerDiv = document.createElement("div");
      timerDiv.classList.add("objectiveTimer");
      timerDiv.innerHTML = `
        <div class="cloche">
          <svg viewBox="0 0 36 36">
            <path class="circle-bg"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="circle"
                  stroke-dasharray="0, 100"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <span class="timerDisplay">00:00</span>
        </div>
      `;

      initializeCloche(timerDiv, timeDiv);

      // Structure finale
      objectiveDiv.appendChild(textContainer);
      objectiveDiv.appendChild(scaleDiv);
      objectiveDiv.appendChild(timeDiv);
      objectiveDiv.appendChild(timerDiv);

      programDiv.appendChild(objectiveDiv);
    });

    container.appendChild(programDiv);
  });

  // ====== 🔹 Fonctions utilitaires ======
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

  function getTimeForDifficulty(level, program) {
    const module = storedModules[currentModuleId];
    if (!module || !module.programs.length) return 0;

    const progData = module.programs[0];
    const totalMinutes = progData.timePerWeek || 120;
    const days = progData.daysPerWeek || 3;
    const minutesPerDay = totalMinutes / days;

    // Récupérer toutes les difficultés du programme
    const objectives = Array.isArray(program)
      ? program
      : program.objectives || [];

    // Échelle de poids linéaire (7 niveaux = 1 à 7)
    const weights = [1, 2, 3, 4, 5, 6, 7];
    const totalWeight = objectives.reduce(
      (sum, o) => sum + (weights[o.difficultyLevel] || 1),
      0
    );

    const myWeight = weights[level] || 1;
    const myPercentage = myWeight / totalWeight; // => entre 0 et 1
    const myMinutes = minutesPerDay * myPercentage;

    return Math.round(myMinutes);
  }

  // Cloque
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
    }

    updateDisplay();

    timerDiv.querySelector(".cloche").addEventListener("click", () => {
      if (paused) {
        paused = false;
        interval = setInterval(() => {
          if (seconds > 0) {
            seconds--;
            updateDisplay();
          } else {
            clearInterval(interval);
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

  // Supprimer un programme
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

  enableProgramDeletion(container, storedModules, currentModuleId);
});
