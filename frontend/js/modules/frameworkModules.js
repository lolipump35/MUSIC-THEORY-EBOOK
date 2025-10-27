// #region UNDERVIDEO CONTAINER 

   const muxPlayer = document.getElementById("muxPlayer1");

  // Sélection du conteneur sous la vidéo
  const underContainer = document.getElementById("undervideoContainer1");
  const buttons = underContainer.querySelectorAll(".chapters button");

  // Quand on clique sur un chapitre
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const time = parseFloat(btn.dataset.time);
      muxPlayer.currentTime = time;
      muxPlayer.play();

      // Mise à jour visuelle du chapitre actif
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Suivi automatique du chapitre actif pendant la lecture
  muxPlayer.addEventListener("timeupdate", () => {
    const current = muxPlayer.currentTime;
    let activeIndex = 0;

    buttons.forEach((btn, index) => {
      const nextBtn = buttons[index + 1];
      const start = parseFloat(btn.dataset.time);
      const end = nextBtn ? parseFloat(nextBtn.dataset.time) : muxPlayer.duration;
      if (current >= start && current < end) activeIndex = index;
    });

    buttons.forEach((b, i) => b.classList.toggle("active", i === activeIndex));
  });


// ANIMATION YIMECODE 

const timeCodeContainer = document.querySelector(".timeCodeContainer");
const titleButton = timeCodeContainer.querySelector(".tittletimecode");

// ✅ Toggle ouverture/fermeture du tiroir
titleButton.addEventListener("click", (event) => {
  event.stopPropagation(); // empêche le clic d'être capté par le document
  timeCodeContainer.classList.toggle("open");
});

// ✅ Ferme le tiroir quand on clique ailleurs
document.addEventListener("click", (event) => {
  // si le clic n'est PAS à l'intérieur du timeCodeContainer → on ferme
  if (!timeCodeContainer.contains(event.target)) {
    timeCodeContainer.classList.remove("open");
  }
});

// ANIMATION MUSICPLATFORM 

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".musicPlatformContainer");
  const button = document.getElementById("musicPlatformContainerButton");

  button.addEventListener("click", () => {
    if (!container.classList.contains("expand-horizontal")) {
      // Étape 1 : étirement horizontal
      container.classList.add("expand-horizontal");

      // Étape 2 : ouverture verticale après un petit délai
      setTimeout(() => {
        container.classList.add("open");
      }, 300); // correspond à la transition width
    } else {
      // Fermer verticalement puis horizontalement
      container.classList.remove("open");
      setTimeout(() => {
        container.classList.remove("expand-horizontal");
      }, 400); // correspond à la transition max-height
    }
  });
});










document.addEventListener("DOMContentLoaded", async () => {
  const musicContainer = document.getElementById("musicContainer");

  // On récupère la plateforme choisie depuis la DB
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Utilisateur non connecté");

    const res = await fetch("http://localhost:5000/api/user/platform", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    });

    if (!res.ok) throw new Error(`Erreur backend : ${res.status}`);
    const data = await res.json();
    const platform = data.platform;

    // Injecte le widget correspondant
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
});


// #endregion UNDERVIDEO CONTAINER  