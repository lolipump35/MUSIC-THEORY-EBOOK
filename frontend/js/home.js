document.addEventListener("DOMContentLoaded", function () {
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
});
