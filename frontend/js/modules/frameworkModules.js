document.addEventListener("DOMContentLoaded", async () => {
  const muxPlayer = document.getElementById("muxPlayer1");
  const underContainer = document.getElementById("undervideoContainer1");

  // ----- TIME CODE -----
  const timeCodeContainer = underContainer.querySelector(".timeCodeContainer");
  const timeCodeButton = underContainer.querySelector(".tittletimecode");
  const visibleChapters = underContainer.querySelector(".visiblechapters");
  const leftBtn = underContainer.querySelector(".leftBtn");
  const rightBtn = underContainer.querySelector(".rightBtn");
  const chapterButtons = visibleChapters.querySelectorAll("button");

  // ----- MUSIC PLATFORM -----
  const musicWrapper = underContainer.querySelector(".musicPlatformContainer");
  const musicButton = underContainer.querySelector(
    "#musicPlatformContainerButton"
  );
  const musicContainer = underContainer.querySelector("#musicContainer");

  // ----- LINK CONTAINER -----
  const linkContainer = underContainer.querySelector(".linkContainer");
  const linkButton = underContainer.querySelector("#linkButton");
  const linkList = underContainer.querySelector("#linkList");

  const scrollAmount = 150;

  // -------------------- Précharge MusicPlatform --------------------
  try {
    const token = localStorage.getItem("token");
    console.log("JWT Token récupéré :", token);
    if (!token) {
      alert("Pas de token trouvé ! Connecte-toi d'abord.");
      return;
    }

    const res = await fetch("http://localhost:5000/api/user/platform", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();
    const platform = data.platform;

    if (platform === "spotify") {
      musicContainer.innerHTML = `<iframe src="https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    } else if (platform === "deezer") {
      musicContainer.innerHTML = `<iframe title="deezer-widget" src="https://widget.deezer.com/widget/dark/track/3135556" width="100%" height="100" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    } else if (platform === "applemusic") {
      musicContainer.innerHTML = `<iframe src="https://embed.music.apple.com/fr/album/shape-of-you/1193701079?i=1193701359" width="100%" height="150" frameborder="0" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"></iframe>`;
    } else {
      musicContainer.innerHTML = "<p>Aucune plateforme choisie.</p>";
    }
  } catch (err) {
    console.error(err);
    musicContainer.innerHTML = "<p>Impossible de charger le widget.</p>";
  }

  // -------------------- TIME CODE --------------------
  chapterButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      muxPlayer.currentTime = parseFloat(btn.dataset.time);
      muxPlayer.play();
      chapterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  muxPlayer.addEventListener("timeupdate", () => {
    const current = muxPlayer.currentTime;
    let activeIndex = 0;
    chapterButtons.forEach((btn, index) => {
      const nextBtn = chapterButtons[index + 1];
      const start = parseFloat(btn.dataset.time);
      const end = nextBtn
        ? parseFloat(nextBtn.dataset.time)
        : muxPlayer.duration;
      if (current >= start && current < end) activeIndex = index;
    });
    chapterButtons.forEach((b, i) =>
      b.classList.toggle("active", i === activeIndex)
    );
  });

  // -------------------- LINK CONTAINER --------------------
  const links = [
    { label: "YouTube", url: "https://www.youtube.com/" },
    { label: "Site web", url: "https://www.example.com/" },
    { label: "Spotify", url: "https://www.spotify.com/" },
  ];

  links.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.textContent = link.label;
    linkList.appendChild(a);
  });

  // -------------------- FONCTIONS COMMUNES --------------------
  const closeAll = () => {
    if (timeCodeContainer.classList.contains("open")) {
      timeCodeContainer.classList.remove("open");
      visibleChapters.scrollTo({ left: 0, behavior: "smooth" });
    }
    if (musicWrapper.classList.contains("open")) {
      musicWrapper.classList.remove("open");
      setTimeout(() => musicWrapper.classList.remove("expand-horizontal"), 400);
    }
    if (linkContainer.classList.contains("open")) {
      linkContainer.classList.remove("open");
      setTimeout(
        () => linkContainer.classList.remove("expand-horizontal"),
        400
      );
    }
  };

  // -------------------- GESTION DES CLICS --------------------
  timeCodeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = timeCodeContainer.classList.contains("open");
    closeAll();
    if (!isOpen) timeCodeContainer.classList.add("open");
  });

  leftBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    visibleChapters.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  rightBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    visibleChapters.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  musicButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = musicWrapper.classList.contains("open");
    closeAll();
    if (!isOpen) {
      musicWrapper.classList.add("expand-horizontal");
      setTimeout(() => musicWrapper.classList.add("open"), 300);
    }
  });

  linkButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = linkContainer.classList.contains("open");
    closeAll();
    if (!isOpen) {
      linkContainer.classList.add("expand-horizontal");
      setTimeout(() => linkContainer.classList.add("open"), 300);
    }
  });

  // -------------------- CLIC HORS CONTAINERS --------------------
  document.addEventListener("click", (e) => {
    if (
      !timeCodeContainer.contains(e.target) &&
      !musicWrapper.contains(e.target) &&
      !linkContainer.contains(e.target)
    ) {
      closeAll();
    }
  });
});

// #region IMPORTANT POINT CONTANER

const allGoodPoint = document.querySelectorAll(".doIt .allpoints");

allGoodPoint.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    el.classList.add("greenLight");
  });
  el.addEventListener("mouseleave", () => {
    el.classList.remove("greenLight");
  });
});

const allBadPoint = document.querySelectorAll(".dontDoIt .allpoints");

allBadPoint.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    el.classList.add("redLight");
  });
  el.addEventListener("mouseleave", () => {
    el.classList.remove("redLight");
  });
});
// #endregion IMPORTANT POINT CONTANER

// #region TRAINNING PROGRAM
function collectExercisesForObjective(objectiveId) {
  const exercises = document.querySelectorAll(
    `.exercice[data-objective="${objectiveId}"]`
  );

  return Array.from(exercises).map((ex) => ex.outerHTML);
}

window.addEventListener("DOMContentLoaded", () => {
  const currentModuleId = localStorage.getItem("currentModule");
  console.log("Module courant récupéré :", currentModuleId);
  if (!currentModuleId) {
    alert("Aucun module sélectionné !");
    return;
  }

  const objectifs = document.querySelectorAll(".objectifContainer li");
  const infoContainer = document.querySelector(".infoContainer");

  objectifs.forEach((li, index) => {
    const objectiveId = `objective-${index + 1}`;
    li.setAttribute("id", objectiveId);
    const text = li.textContent.trim();

    const block = document.createElement("div");
    block.classList.add("difficultyItem");
    block.dataset.objectiveId = objectiveId;

    block.innerHTML = `
      <h3>${text}</h3>
      <div class="scale">
        <span>Difficile</span>
        ${createScaleButtons()}
        <span>Facile</span>
      </div>
    `;

    infoContainer.appendChild(block);

    const buttons = block.querySelectorAll(".scale-button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });
  });

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

  const howTimeInput = document.getElementById("trainingTime");
  const howDayInput = document.getElementById("trainingDays");
  const validBtn = document.getElementById("validPrograms");

  validBtn.addEventListener("click", () => {
    const token = localStorage.getItem("token");
    console.log("Token récupéré au moment du click :", token);
    const allSelected = [];
    const howTime = parseInt(howTimeInput.value) || 0;
    const howDay = parseInt(howDayInput.value) || 0;

    // Vérification des inputs
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
    document.querySelectorAll(".difficultyItem").forEach((block, index) => {
      const objectiveId = block.dataset.objectiveId;
      const title = block.querySelector("h3").textContent.trim();
      const selected = block.querySelector(".scale-button.selected");
      const coef =
        parseFloat(document.getElementById(objectiveId)?.dataset.coef) || 1;
      const difficultyLevel = selected
        ? Array.from(selected.parentNode.children).indexOf(selected)
        : 0;
      const assignedDays = Array.from({ length: howDay }, (_, i) => i + 1);

      if (!selected) {
        block.querySelector("h3").classList.add("error-highlight");
        allSelected.push(false);
      } else {
        block.querySelector("h3").classList.remove("error-highlight");
        allSelected.push(true);
      }

      assignedDays.forEach((day) => {
        if (!objectivesByDay[day]) objectivesByDay[day] = [];
        objectivesByDay[day].push({
          objectiveId,
          objectiveTitle: title, 
          difficultyLevel, 
          coef,
          isCompleted: false,
          timerProgress: 0,
          exercises: collectExercisesForObjective(objectiveId),
        });
      });
    });

    if (!allSelected.every((v) => v)) return;

    // Création de l'objet module complet
    const trainingDays = Object.keys(objectivesByDay).map((dayNum) => ({
      dayNumber: parseInt(dayNum),
      objectives: objectivesByDay[dayNum],
    }));

    const moduleData = {
      moduleKey: currentModuleId,
      type: "user",
      programData: {
        name: `Module ${currentModuleId}`,
        trainingDays,
        timePerWeek: howTime,
        daysPerWeek: howDay,
      },
    };

    // Envoi au backend
    fetch("http://localhost:5000/api/me/user-created-modules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(moduleData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Module envoyé avec succès :", data);
        window.location.href = "/frontend/pages/programmsTrainning.html";
      })
      .catch((err) => {
        console.error("Erreur lors de l'envoi du module :", err);
      });
  });
});

// AJOUT DE L EXERCICEHTML

// #endregion TRAINNING PROGRAM
