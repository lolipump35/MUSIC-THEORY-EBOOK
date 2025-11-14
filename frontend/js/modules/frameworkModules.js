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
    if (!token) throw new Error("Utilisateur non connecté");

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
window.addEventListener("DOMContentLoaded", () => {
  // Récupération sûre du module courant
  const currentModuleId = localStorage.getItem("currentModule");
  console.log("Module courant avant push :", currentModuleId);

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
        // selectedLevel doit aller de 0 à 6
        const isSelected = index === selectedLevel ? "selected" : "";
        return `<div class="scale-button ${cls} ${isSelected}"></div>`;
      })
      .join("");
  }

  const validBtn = document.getElementById("validPrograms");

  function afficherMessageErreur(message) {
    let errorMsg = document.querySelector(".error-message");
    if (!errorMsg) {
      errorMsg = document.createElement("p");
      errorMsg.className = "error-message";
      validBtn.insertAdjacentElement("afterend", errorMsg);
    }
    errorMsg.textContent = message;
  }

  // ✅ Événement sur le bouton de validation
  validBtn.addEventListener("click", () => {
    const results = [];
    let allSelected = true;

    // Vérification de chaque objectif
    document.querySelectorAll(".difficultyItem").forEach((block) => {
  const objectiveId = block.dataset.objectiveId; // id du block
  const titleElement = block.querySelector("h3");
  const selected = block.querySelector(".scale-button.selected");

  // Récupération du <li> correspondant grâce à l'ID
  const originalLi = document.getElementById(objectiveId);
  const coef = originalLi ? parseFloat(originalLi.dataset.coef) : 1;

  if (!selected) {
    titleElement.classList.add("error-highlight");
    setTimeout(() => titleElement.classList.remove("error-highlight"), 1500);
  } else {
    titleElement.classList.remove("error-highlight");

    results.push({
      moduleId: currentModuleId,
      id: objectiveId,
      objectif: titleElement.textContent.trim(),
      difficultyLevel: Array.from(selected.parentNode.children).indexOf(selected),
      coef: coef // ✅ coef correctement récupéré
    });
  }
});

console.log(results);
      

    if (!allSelected) {
      console.warn(
        "⚠️ Certains objectifs n'ont pas de difficulté sélectionnée !"
      );
      afficherMessageErreur(
        "Merci de sélectionner une difficulté pour chaque objectif."
      );
      return;
    }

    // ✅ Récupération des inputs
    const howTimeInput = document.querySelector(".howtime input");
    const howDayInput = document.querySelector(".howday input");
    const howTime = parseInt(howTimeInput?.value) || 0;
    const howDay = parseInt(howDayInput?.value) || 0;

    if (howTime <= 0 || howDay <= 0) {
      afficherMessageErreur(
        "Merci de renseigner le temps et le nombre de jours."
      );
      return;
    }

    // ✅ Stockage dans le localStorage
    const storedModules =
      JSON.parse(localStorage.getItem("trainingModules")) || {};

    if (!storedModules[currentModuleId]) {
      storedModules[currentModuleId] = {
        name: `Module ${currentModuleId.replace("module-", "")}`,
        programs: [],
      };
    }

    storedModules[currentModuleId].programs.push({
      objectives: results,
      timePerWeek: howTime,
      daysPerWeek: howDay,
    });

    localStorage.setItem("trainingModules", JSON.stringify(storedModules));

    console.log(`✅ Nouveau programme ajouté dans ${currentModuleId}:`, {
      objectives: results,
      timePerWeek: howTime,
      daysPerWeek: howDay,
    });

    // ✅ Redirection vers la page des programmes
    window.location.href = "/frontend/pages/programmsTrainning.html";
  });
});

// #endregion TRAINNING PROGRAM
