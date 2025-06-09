// permet de lire la video a l ouverture de la page
const video = document.getElementById("videoPresentation");
const playAllowed = sessionStorage.getItem("videoPlayAllowed");

if (playAllowed === "true") {
  video.muted = false;
  video.play();
}

// #region controlVideo
const container = document.querySelector(".videoContainer");
const controlButton = document.getElementById("videoControl");
console.log("buttonControl cliquer");

// État initial : masquer le bouton une fois que la vidéo joue automatiquement
video.addEventListener("play", () => {
  controlButton.innerHTML = "⏸";
});

video.addEventListener("pause", () => {
  controlButton.innerHTML = "▶";
});

container.addEventListener("click", () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
});

container.addEventListener("mouseenter", () => {
  controlButton.classList.add("showButton");
});
container.addEventListener("mouseleave", () => {
  controlButton.classList.remove("showButton");
});

// #endregion controlVideo

// splide
document.addEventListener("DOMContentLoaded", function () {
  var splide = new Splide(".splide", {
    type: "loop", // Pour un slider infini
    autoplay: true, // Active l'autoplay
    interval: 5000, // Slide toutes les 5 secondes
    pauseOnHover: true, // Ne pas mettre en pause au survol
    arrows: true, // Flèches de navigation visibles
    pagination: false, // Pas de points de pagination
  });

  splide.mount();
});

// #region style css

// #region interstDesireContainer

const interstContainer = document.querySelector(".interstContainer");
const toBoldinterst = document.querySelectorAll(".toBoldinterst");
console.log(toBoldinterst);

interstContainer.addEventListener("mouseenter", () => {
  console.log("interstContainer cliquer");

  toBoldinterst.forEach((elementToBold) => {
    elementToBold.classList.add("bold");
  });
  document.body.style.backgroundColor = "#6abf6994";
});
interstContainer.addEventListener("mouseleave", () => {
  console.log("interstContainer cliquer");

  toBoldinterst.forEach((elementToBold) => {
    elementToBold.classList.remove("bold");
  });
  document.body.style.backgroundColor = "";
});

const desireContainer = document.querySelector(".desireContainer");
const toBolddesir = document.querySelectorAll(".toBolddesire");
console.log(toBolddesir);

desireContainer.addEventListener("mouseenter", () => {
  console.log("desireContainer cliquer");

  toBolddesir.forEach((elementToBold) => {
    elementToBold.classList.add("bold");
  });
  document.body.style.backgroundColor = "#f5a523a2";
});
desireContainer.addEventListener("mouseleave", () => {
  console.log("desireContainer cliquer");

  toBolddesir.forEach((elementToBold) => {
    elementToBold.classList.remove("bold");
  });
  document.body.style.backgroundColor = "";
});
// #endregion interstDesireContainer

//#region strongPoint

const allGoodPoint = document.querySelectorAll(".goodPoint .allPoint");

allGoodPoint.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    el.classList.add("greenLight");
  });
  el.addEventListener("mouseleave", () => {
    el.classList.remove("greenLight");
  });
});

const allBadPoint = document.querySelectorAll(".badPoint .allPoint");

allBadPoint.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    el.classList.add("redLight");
  });
  el.addEventListener("mouseleave", () => {
    el.classList.remove("redLight");
  });
});

//#endregion strongPoint

//#region buyButton

const buyButton = document.getElementById("buyButtonFormation");

buyButton.addEventListener("mouseenter", () => {
  buyButton.style.backgroundColor = "green";
});
buyButton.addEventListener("mouseleave", () => {
  buyButton.style.backgroundColor = "";
});

//#endregion buyButton

// #endregion style css
