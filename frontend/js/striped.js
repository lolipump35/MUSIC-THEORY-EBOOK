// #region stripe

// Initialise Stripe avec ta clé publique
const stripe = Stripe(
  "pk_test_51RYS7qQr4BGbM3NUgolVTu74BSzvcNJdQ9uklMUiKzCCF2fx1GszkRPWdcFwhDvcCSo9pg4EJJ7nG02m6blyLk9I00mePJTzRH"
);

document.getElementById("buyButtonFormation").addEventListener("click", () => {
  const backendUrl =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://mon-backend.onrender.com";

  fetch(`${backendUrl}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Session data:", data);
      window.location.href = data.url; // redirection vers Stripe Checkout
    })
    .catch((err) => console.error("Erreur Stripe :", err));
});

// #endregion stripe
