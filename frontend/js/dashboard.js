// #region BACK
import { BASE_URL } from "/config.js";

window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  console.log(localStorage.getItem("token"));

  if (!token) {
    // Si pas de token → redirige vers la page de connexion
    window.location.href = "/pages/signin.html";
    return;
  }

  // Appel sécurisé vers le backend
  fetch(`${BASE_URL}/api/dashboard`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    })
    .then((data) => {
      console.log("✅ Dashboard :", data);

      // Exemple d'affichage simple dans l'UI
      const userInfo = document.getElementById("userInfo");
      const purchasesInfo = document.getElementById("purchasesInfo");

      if (userInfo) {
        userInfo.textContent = `Bienvenue, utilisateur #${data.userId}`;
      }

      if (purchasesInfo) {
        if (data.purchases && data.purchases.includes("formation_debutant")) {
          purchasesInfo.textContent = "🎸 Formation guitare achetée ✅";
        } else {
          purchasesInfo.textContent = "⚠️ Formation non achetée";
        }
      }
    })
    .catch((err) => {
      console.error("❌ Erreur :", err);
      // alert("Impossible de charger le dashboard");
    });
});
// #endregion BACK


// #region button

// #endregion button

//#region teaser

const teaserContainer = document.getElementById("teaser1");
const teaserImage = teaserContainer.querySelector(".cover img");
const teaserTitle = teaserContainer.querySelector(".tittle h1");
const teaserText = teaserContainer.querySelector(".text p");
const startButton = teaserContainer.querySelector(".button button");
const overlay = document.getElementById("overlay");

// --- Données de chaque module (1 à 20) ---
const modulesData = {
  moduleTEST: {
    title: "modulesTEST",
    text: "test .",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/frameworkModules.html",
  },

  module1: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module1.html",
  },
  module2: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module2.html",
  },
  module3: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module3.html",
  },
  module4: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module4.html",
  },
  module5: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module5.html",
  },
  module6: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module6.html",
  },
  module7: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module7.html",
  },
  module8: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module8.html",
  },
  module9: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module9.html",
  },
  module10: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module10.html",
  },
  module11: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module11.html",
  },
  module12: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module12.html",
  },
  module13: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module13.html",
  },
  module14: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module14.html",
  },
  module15: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module15.html",
  },
  module16: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module16.html",
  },
  module17: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module17.html",
  },
  module18: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module18.html",
  },
  module19: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module19.html",
  },
  module20: {
    title: "Les bases du rythme",
    text: "Découvre comment bien tenir ta guitare, placer tes doigts, et garder un rythme régulier dès les premiers accords.",
    image: "/frontend/img/dashboard/cours.png",
    link: "/frontend/pages/modules/module20.html",
  },
};

// --- Variable pour savoir quel module est actif ---
let activeModuleId = null;

// --- Fonction d’affichage ---
function afficherModule(moduleId) {
  const data = modulesData[moduleId];
  if (!data) return;

  teaserImage.src = data.image;
  teaserTitle.textContent = data.title;
  teaserText.textContent = data.text;

  activeModuleId = moduleId; // stocke le module actif

  teaserContainer.classList.remove("hidden");
  teaserContainer.classList.add("visible");
  overlay.classList.add("active");

  // effet apparition
  teaserContainer.style.opacity = "0";
  setTimeout(() => {
    teaserContainer.style.opacity = "1";
  }, 70);
}

// --- Fonction fermeture ---
function fermerTeaser() {
  teaserContainer.classList.remove("visible");
  teaserContainer.classList.add("hidden");
  overlay.classList.remove("active");
  activeModuleId = null;
}

// --- Écouteurs DOM ---
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".modules").forEach((module) => {
    module.addEventListener("click", () => {
      afficherModule(module.id);
    });
  });

  teaserContainer.addEventListener("mouseleave", () => {
    fermerTeaser();
  });

  // --- Bouton Commencer ---
  startButton.addEventListener("click", () => {
    if (!activeModuleId) {
      console.warn("Aucun module actif !");
      return;
    }
    const link = modulesData[activeModuleId].link;
    console.log("Redirection vers :", link);
    window.location.href = link;
  });
});

//#endregion teaser

// #region STOCKAGE CURRENT MODULEID

document.querySelectorAll(".modules").forEach((module) => {
  module.addEventListener("click", () => {
    localStorage.setItem("currentModule", module.id);
    console.log("Module cliqué :", module.id);
  });
});

// #endregion STOCKAGE CURRENT MODULEID

// #region ADMIN SECTION

// #endregion ADMIN SECTION
