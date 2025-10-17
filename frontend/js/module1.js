// #region NAVBARE
// navbar dynamique
const navbar = document.querySelector(".navbar");
const menuNavbar = document.querySelector(".menuNavbar");

let lastScroll = window.scrollY;

window.addEventListener("scroll", () => {
  let currentScroll = window.scrollY;

  if (currentScroll > lastScroll + 60) {
    navbar.style.transform = "translateY(-100%)";
    navbar.style.pointerEvents = "none";
    menuNavbar.classList.remove("visible");
    lastScroll = currentScroll;
  } else if (currentScroll < lastScroll - 1) {
    navbar.style.transform = "translateY(0)";
    navbar.style.pointerEvents = "auto";
    lastScroll = currentScroll;
  }
});
// #region menuButton
// menu dynamique
const menuButton = document.getElementById("menuButton");

function showSelection() {
  if (
    navbar.style.transform === "translateY(0px)" ||
    navbar.style.transform === ""
  ) {
    menuNavbar.classList.add("visible");
  }
}

function hideSelection(event) {
  if (
    !menuButton.contains(event.relatedTarget) &&
    !menuNavbar.contains(event.relatedTarget)
  ) {
    menuNavbar.classList.remove("visible");
  }
}

menuButton.addEventListener("mouseenter", showSelection);
menuButton.addEventListener("mouseleave", hideSelection);
menuNavbar.addEventListener("mouseenter", showSelection);
menuNavbar.addEventListener("mouseleave", hideSelection);

// #endregion menuButton

// #region homeButton

const homeButton = document.getElementById("homeButton");

homeButton.addEventListener("click", () => {
  window.location.href = "/frontend/pages/home.html";
});
// #endregion homeButton

// #region signInButton

const signInButton = document.getElementById("signInButton");

signInButton.addEventListener("click", () => {
  window.location.href = "/frontend/pages/signIn.html";
});

// #endregion signInButton

// #endregion NAVBARE

// ===============================
// 🎬 Configuration
// ===============================
const API_URL = "http://localhost:5000/api/videos"; // ton backend
const token = localStorage.getItem("token");

// Liste des vidéos à afficher (id = vidéo dans le backend)
const videos = [
  { id: "video1", containerId: "muxVideo1Container" },
  { id: "video2", containerId: "muxVideo2Container" },
];

// ===============================
// 🎥 Fonction pour charger une vidéo
// ===============================
async function loadVideo(videoId, containerId) {
  try {
    console.log(`\n🔹 Chargement de la vidéo ${videoId}...`);

    // Appel backend pour obtenir le playbackId et le token Mux
    console.log(`🌐 Requête envoyée à : ${API_URL}/${videoId}`);
    console.log("🪪 Token d’authentification frontend :", token ? token.substring(0, 20) + "..." : "❌ Aucun token envoyé");

    const response = await fetch(`${API_URL}/${videoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`📡 Statut réponse backend : ${response.status}`);

    if (!response.ok) throw new Error(`Erreur serveur : ${response.status}`);

    const data = await response.json();
    console.log(`✅ Données reçues pour ${videoId} :`, data);

    // Vérification des champs reçus
    if (!data.playbackId) {
      console.error("❌ Aucun playbackId reçu du backend !");
      return;
    }
    if (!data.token) {
      console.error("❌ Aucun token reçu du backend !");
      return;
    }

    console.log("🎬 Playback ID transmis :", data.playbackId);
    console.log("🔐 Token transmis (début) :", data.token.substring(0, 60) + "...");

    // Sélection du container HTML
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container introuvable : ${containerId}`);

    // Nettoyage avant affichage
    container.innerHTML = "";
    console.log("🧹 Container nettoyé :", containerId);

    // Création du lecteur MUX
    const player = document.createElement("mux-player");
    player.setAttribute("style", "width: 100%; border-radius: 12px; margin-bottom: 20px;");
    player.setAttribute("stream-type", "on-demand");
    player.setAttribute("playsinline", "");
    player.setAttribute("autoPlay", "false");
    player.setAttribute("controls", "");
    player.setAttribute("preload", "metadata");

    // 🔐 Application des attributs sécurisés Mux
    player.setAttribute("playback-id", data.playbackId);
    player.setAttribute("playback-token", data.token);

    console.log("🧩 Attributs appliqués au player :");
    console.log("   • stream-type:", player.getAttribute("stream-type"));
    console.log("   • playback-id:", player.getAttribute("playback-id"));
    console.log("   • playback-token (début):", player.getAttribute("playback-token").substring(0, 60) + "...");

    // Ajout dans le DOM
    container.appendChild(player);
    console.log(`🎉 Vidéo ${videoId} affichée avec succès dans #${containerId}`);
  } catch (error) {
    console.error(`❌ Erreur lors du chargement de ${videoId} :`, error);
  }
}


// ===============================
// 🚀 Chargement automatique de toutes les vidéos
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  videos.forEach((video) => loadVideo(video.id, video.containerId));
});
