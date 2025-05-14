document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const signInButton = document.getElementById("signInButton");

  // #region EMAIL

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  signInButton.addEventListener("click", () => {
    const emailValue = emailInput.value.trim();

    if (emailValue === "" || !emailRegex.test(emailValue)) {
      emailInput.classList.add("input-error");
      emailInput.value = "";
      emailInput.placeholder = "Please enter a valid email!";
    }
  });

  // Réinitialiser l’état par défaut en cas de clic
  emailInput.addEventListener("focus", () => {
    emailInput.classList.remove("input-error");
    emailInput.placeholder = "Email";
  });
  // #endregion EMAIL

  // #region PASSWORD

  signInButton.addEventListener("click", () => {
    const passwordValue = passwordInput.value;
    if (passwordValue === "") {
      passwordInput.classList.add("input-error");
      passwordInput.value = "";
      passwordInput.placeholder = "Please enter a valid password!";
    }
  });

    // Réinitialiser l’état par défaut en cas de clic
 passwordInput.addEventListener("focus", () => {
    passwordInput.classList.remove("input-error");
    passwordInput.placeholder = "Password";
  });

  // #endregion PASSWORD

  // #region SEND TO BACKEND

  // ✅ Base URL dynamique
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://music-theory-ebook.onrender.com";

// SIGN IN PAGE
function showMessage(text, type = "error") {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}


const signInBtn = document.getElementById("signInButton");
console.log(signInBtn); // Vérifie si l'élément est bien trouvé

if (signInBtn) {
  signInBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      showMessage("Merci de remplir tous les champs.");
      return;
    }

    signInBtn.disabled = true;  // Désactiver le bouton pour éviter plusieurs clics
    showMessage("Envoi de la requête...", "info");  // Message d'attente

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important pour inclure le cookie
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("Connexion réussie !", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html"; // Redirige après connexion
        }, 1000);
      } else {
        showMessage(data.message || "Erreur de connexion.");
      }
    } catch (err) {
      console.error("Erreur réseau : ", err);
      showMessage("Erreur de connexion au serveur.");
    } finally {
      signInBtn.disabled = false;  // Réactiver le bouton après la requête
    }
  });
}


  // #endregion SEND TO BACKEND
});
