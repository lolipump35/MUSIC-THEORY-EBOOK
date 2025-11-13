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

// IMPORTANT POINT CONTANER

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

// TRAINNING PROGRAM
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

  function createScaleButtons() {
    return `
      <div class="scale-button big orange"></div>
      <div class="scale-button orange"></div>
      <div class="scale-button small orange"></div>
      <div class="scale-button grey"></div>
      <div class="scale-button small green"></div>
      <div class="scale-button green"></div>
      <div class="scale-button big green"></div>
    `;
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

  // Ajout de l'événement click sur le bouton
 validBtn.addEventListener("click", () => {
  const results = [];
  let allSelected = true;

  document.querySelectorAll(".difficultyItem").forEach((block) => {
    const objectiveId = block.dataset.objectiveId;
    const titleElement = block.querySelector("h3");
    const selected = block.querySelector(".scale-button.selected");

    if (!selected) {
      allSelected = false;

      // effet visuel : rouge + shake
      titleElement.classList.add("error-highlight");

      // Retrait progressif de l’effet après 1,5 s
      setTimeout(() => {
        titleElement.classList.remove("error-highlight");
      }, 1500);
    } else {
      // Si bien rempli, on remet le style normal
      titleElement.classList.remove("error-highlight");

      results.push({
        moduleId: currentModuleId,
        id: objectiveId,
        objectif: titleElement.textContent,
        difficultyLevel: Array.from(selected.parentNode.children).indexOf(selected),
      });
    }
    document.querySelectorAll(".difficultyItem").forEach((block) => {
  const buttons = block.querySelectorAll(".scale-button");
  const selected = block.querySelector(".scale-button.selected");
  const title = block.querySelector("h3");

  // Si aucun bouton sélectionné
  if (!selected) {
    // Ajouter classe au texte pour le mettre en rouge
    title.classList.add("error");
    // Supprimer la classe après 3s pour fade-out
    setTimeout(() => title.classList.remove("error"), 3000);

    // Ajouter classe aux boutons pour clignoter
    buttons.forEach((btn) => btn.classList.add("error-blink"));
    // Supprimer la classe après 3s
    setTimeout(() => buttons.forEach((btn) => btn.classList.remove("error-blink")), 3000);
  }
});

  });

  if (!allSelected) {
    console.warn("⚠️ Certains objectifs n'ont pas de difficulté sélectionnée !");
    return;
  }

  // ✅ Si tout est bien rempli, on continue le processus
  const storedModules = JSON.parse(localStorage.getItem("trainingModules")) || {};

  if (!storedModules[currentModuleId]) {
    storedModules[currentModuleId] = {
      name: `Module ${currentModuleId.replace("module-", "")}`,
      programs: [],
    };
  }

  storedModules[currentModuleId].programs.push(results);
  localStorage.setItem("trainingModules", JSON.stringify(storedModules));

  console.log(`✅ Nouveau programme ajouté dans ${currentModuleId}:`, results);

  window.location.href = "/frontend/pages/programmsTrainning.html";
});

  // Charger ou initialiser les modules
  const storedModules =
    JSON.parse(localStorage.getItem("trainingModules")) || {};

  if (!storedModules[currentModuleId]) {
    storedModules[currentModuleId] = {
      name: `Module ${currentModuleId.replace("module-", "")}`,
      programs: [],
    };
  }

  storedModules[currentModuleId].programs.push(results);
  localStorage.setItem("trainingModules", JSON.stringify(storedModules));

  console.log(`✅ Nouveau programme ajouté dans ${currentModuleId}:`, results);

  // Redirection vers la page des programmes
  window.location.href = "/frontend/pages/programmsTrainning.html";
});
