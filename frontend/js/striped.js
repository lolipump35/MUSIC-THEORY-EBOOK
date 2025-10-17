// #region stripe

// Initialise Stripe avec ta clé publique
const stripe = Stripe(
  "pk_test_51RYS7qQr4BGbM3NUgolVTu74BSzvcNJdQ9uklMUiKzCCF2fx1GszkRPWdcFwhDvcCSo9pg4EJJ7nG02m6blyLk9I00mePJTzRH"
);

document.getElementById("buyButtonFormation").addEventListener("click", async () => {
  const backendUrl =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://mon-backend.onrender.com";

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  console.log("token:", localStorage.getItem("token"));
console.log("userId:", localStorage.getItem("userId"));


  if (!token || !userId) {
    alert("Vous devez être connecté pour acheter cette formation !");
    return;
  }

  try {
    const response = await fetch(`${backendUrl}/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ userId }), // on envoie l'utilisateur au backend
    });

    const data = await response.json();
    console.log("Session data:", data);

    if (data.url) {
      window.location.href = data.url; // redirection vers Stripe Checkout
    } else {
      console.error("❌ Pas d'URL renvoyée par le serveur :", data);
      alert("Impossible de créer la session Stripe. Réessayez plus tard.");
    }
  } catch (err) {
    console.error("Erreur Stripe :", err);
    alert("Erreur lors de la connexion à Stripe. Vérifiez la console.");
  }
});

// #endregion stripe
