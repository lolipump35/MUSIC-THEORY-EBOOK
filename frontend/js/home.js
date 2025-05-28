
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

// #region LANDDINGPAGE

const offerButton = document.getElementById("offerButton");

offerButton.addEventListener("mouseenter", () => {
  console.log("offerButton survolé");
  offerButton.classList.add("offerButtonHover");
})
offerButton.addEventListener("mouseleave", () => {
  console.log("offerButton survolé");
  offerButton.classList.remove("offerButtonHover");
})

// #endregion LANDDINGPAGE


// #region OFFER

const offer1 = document.querySelector(".offer1");
const imgBackOffer1 = document.querySelector(".imgBack1");
const textOffer1 = document.querySelector(".text1");

offer1.addEventListener("mouseenter", () => {
  console.log("Survol de offer1");
  offer1.classList.add("offerHover");
  imgBackOffer1.classList.add("imgBackOfferHover");
  textOffer1.classList.add("textOfferHover");
});
offer1.addEventListener("mouseleave", () => {
  console.log("Survol de offer1");
  offer1.classList.remove("offerHover");
  imgBackOffer1.classList.remove("imgBackOfferHover");
  textOffer1.classList.remove("textOfferHover");
});

const offer2 = document.querySelector(".offer2");
const imgBackOffer2 = document.querySelector(".imgBack2");
const textOffer2 = document.querySelector(".text2");

offer2.addEventListener("mouseenter", () => {
  console.log("Survol de offer2");
  offer2.classList.add("offerHover");
  imgBackOffer2.classList.add("imgBackOfferHover");
  textOffer2.classList.add("textOfferHover");
});
offer2.addEventListener("mouseleave", () => {
  console.log("Survol de offer1");
  offer2.classList.remove("offerHover");
  imgBackOffer2.classList.remove("imgBackOfferHover");
  textOffer2.classList.remove("textOfferHover");
});

const offer3 = document.querySelector(".offer3");
const imgBackOffer3 = document.querySelector(".imgBack3");
const textOffer3 = document.querySelector(".text3");

offer3.addEventListener("mouseenter", () => {
  console.log("Survol de offer3");
  offer3.classList.add("offerHover");
  imgBackOffer3.classList.add("imgBackOfferHover");
  textOffer3.classList.add("textOfferHover");
});
offer3.addEventListener("mouseleave", () => {
  console.log("Survol de offer1");
  offer3.classList.remove("offerHover");
  imgBackOffer3.classList.remove("imgBackOfferHover");
  textOffer3.classList.remove("textOfferHover");
});

// #endregion OFFER






