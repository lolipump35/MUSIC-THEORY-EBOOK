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

    program.forEach((item, objIndex) => {
      const objectiveDiv = document.createElement("div");
      objectiveDiv.classList.add("objectiveItem");

      // Contenu texte (titre + objectif)
      const textContainer = document.createElement("div");
      textContainer.classList.add("objectiveText");
      textContainer.innerHTML = `
        <h4>Objectif ${objIndex + 1}</h4>
        <p>${item.objectif}</p>
      `;

      // Div pour la difficulté
      const scaleDiv = document.createElement("div");
      scaleDiv.classList.add("scale");
      scaleDiv.innerHTML = `
        <span>Difficile</span>
        ${createScaleButtons(item.difficultyLevel)}
        <span>Facile</span>
      `;

      // Div pour le temps estimé
      const timeDiv = document.createElement("div");
      timeDiv.classList.add("timeDisplay");
      timeDiv.textContent = "Temps estimé : —";

      // ====== 🔹 Mise à jour initiale de TimeDisplay selon la difficulté stockée ======
      const initialDifficulty = item.difficultyLevel ?? 3; // 3 = valeur par défaut si non définie
      timeDiv.textContent = `Temps estimé : ${getTimeForDifficulty(
        initialDifficulty
      )} min`;

      // Déclenchement de l'événement pour que la cloche se mette à jour
      timeDiv.dispatchEvent(new Event("change"));

      // Gestion du clic sur une difficulté
      scaleDiv.querySelectorAll(".scale-button").forEach((btn, index) => {
        btn.addEventListener("click", () => {
          // Retire la sélection des autres boutons et sélectionne celui cliqué
          scaleDiv
            .querySelectorAll(".scale-button")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");

          // Mise à jour du temps estimé
          timeDiv.textContent = `Temps estimé : ${getTimeForDifficulty(
            index
          )} min`;

          // Déclencher un "change" pour informer la cloque
          timeDiv.dispatchEvent(new Event("change"));

          // Mise à jour dans le localStorage
          item.difficultyLevel = index;
          localStorage.setItem(
            "trainingModules",
            JSON.stringify(storedModules)
          );
        });
      });

      // Div pour le minuteur
      const timerDiv = document.createElement("div");
      timerDiv.classList.add("objectiveTimer");

      // Structure "cloque"
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

      // Initialisation de la cloque
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

  // ====== 🔹 Fonction utilitaire ======
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

  // (On fera évoluer cette logique ensuite)
  function getTimeForDifficulty(level) {
    const times = [15, 12, 10, 8, 6, 5, 4];
    return times[level] || 0;
  }

  //#region CLOCK
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
      const percent = (total - seconds) / total;
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

    // Mettre à jour le timer si la difficulté change
    timeDiv.addEventListener("change", () => {
      seconds = getTime();
      updateDisplay();
    });
  }

  //#endregion CLOCK

  function enableProgramDeletion(container, storedModules, currentModuleId) {
    // Sélectionne tous les blocs programme
    const programBlocks = container.querySelectorAll(".programBlock");

    programBlocks.forEach((block, index) => {
      // Crée un bouton "Supprimer"
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Supprimer";
      deleteBtn.classList.add("deleteProgramBtn");

      // Événement du clic
      deleteBtn.addEventListener("click", () => {
        if (confirm("Voulez-vous vraiment supprimer ce programme ?")) {
          // Supprimer le programme du localStorage
          storedModules[currentModuleId].programs.splice(index, 1);
          localStorage.setItem(
            "trainingModules",
            JSON.stringify(storedModules)
          );

          // Supprimer visuellement le bloc
          block.remove();

          console.log(`✅ Programme ${index + 1} supprimé.`);
        }
      });

      // Ajoute le bouton à la fin du bloc programme
      block.appendChild(deleteBtn);
    });
  }
  enableProgramDeletion(container, storedModules, currentModuleId);
});
