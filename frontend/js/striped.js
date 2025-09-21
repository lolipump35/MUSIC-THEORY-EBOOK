// #region stripe

    // Initialise Stripe avec ta clé publique
const stripe = Stripe ('pk_test_51RYS7qQr4BGbM3NUgolVTu74BSzvcNJdQ9uklMUiKzCCF2fx1GszkRPWdcFwhDvcCSo9pg4EJJ7nG02m6blyLk9I00mePJTzRH'); // remplace par ta clé publique

document.getElementById("buyButtonFormation").addEventListener("click", () => {
  fetch("http://localhost:5000/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then(res => res.json())
  .then(data => {
  console.log("Session data:", data);
  window.location.href = data.url; // redirection vers Stripe
})
  .then(result => {
    if (result.error) {
      console.error(result.error.message);
    }
  })
  .catch(err => console.error("Erreur Stripe :", err));
});

// #endregion stripe