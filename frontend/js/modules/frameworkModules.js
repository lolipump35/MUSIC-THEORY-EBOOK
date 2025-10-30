document.addEventListener("DOMContentLoaded", async () => {
  const muxPlayer = document.getElementById("muxPlayer1");
  const underContainer = document.getElementById("undervideoContainer1");

  const timeCodeContainer = underContainer.querySelector(".timeCodeContainer");
  const timeCodeButton = underContainer.querySelector(".tittletimecode");
  const visibleChapters = underContainer.querySelector(".visiblechapters");
  const leftBtn = underContainer.querySelector(".leftBtn");
  const rightBtn = underContainer.querySelector(".rightBtn");
  const chapterButtons = visibleChapters.querySelectorAll("button");

  const musicWrapper = underContainer.querySelector(".musicPlatformContainer");
  const musicButton = underContainer.querySelector("#musicPlatformContainerButton");
  const musicContainer = underContainer.querySelector("#musicContainer");

  const scrollAmount = 150;

  // --- Précharge du widget MusicPlatform ---
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Utilisateur non connecté");

    const res = await fetch("http://localhost:5000/api/user/platform", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) throw new Error(`Erreur backend : ${res.status}`);
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

  // --- Gestion TimeCode ---
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
      const end = nextBtn ? parseFloat(nextBtn.dataset.time) : muxPlayer.duration;
      if (current >= start && current < end) activeIndex = index;
    });

    chapterButtons.forEach((b, i) => b.classList.toggle("active", i === activeIndex));
  });

  // --- Fonctions pratiques ---
  const closeAll = () => {
    // Si le timecode est ouvert, on le referme et on reset le scroll
    if (timeCodeContainer.classList.contains("open")) {
      timeCodeContainer.classList.remove("open");
      visibleChapters.scrollTo({ left: 0, behavior: "smooth" }); // ✅ retour à l’origine
    }
    musicWrapper.classList.remove("open");
    musicWrapper.classList.remove("expand-horizontal");
  };

  // --- Bouton TimeCode ---
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

  // --- Bouton MusicPlatform ---
  musicButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = musicWrapper.classList.contains("open");
    closeAll();
    if (!isOpen) {
      musicWrapper.classList.add("expand-horizontal");
      setTimeout(() => musicWrapper.classList.add("open"), 300);
    }
  });

  // --- Clic hors des containers ---
  document.addEventListener("click", (e) => {
    if (
      !timeCodeContainer.contains(e.target) &&
      !musicWrapper.contains(e.target)
    ) {
      closeAll();
    }
  });
});
