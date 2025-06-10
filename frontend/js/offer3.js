// presentation 
const allModules = document.querySelectorAll(".presentation .allModules");
console.log(allModules);

allModules.forEach((module) => {
  module.addEventListener("mouseenter", () => {
    module.classList.add("zoom");
  });
  module.addEventListener("mouseleave", () => {
    module.classList.remove("zoom");
  });
});


// testimony
const video = document.getElementById("videoTestimony");
const container = document.querySelector(".videoContainer");
const controlButton = document.getElementById("videoControl");
console.log("buttonControl cliquer");


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



// howwork
const allModulesHowWork = document.querySelectorAll(".howWork .allModules");
console.log(allModulesHowWork);

allModulesHowWork.forEach((module) => {
  module.addEventListener("mouseenter", () => {
    module.classList.add("zoom");
  });
  module.addEventListener("mouseleave", () => {
    module.classList.remove("zoom");
  });
});
