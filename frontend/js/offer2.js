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
console.log("buttonControl cliquer")

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
})
container.addEventListener("mouseleave", () => {
    controlButton.classList.remove("showButton");
})


// #endregion controlVideo
