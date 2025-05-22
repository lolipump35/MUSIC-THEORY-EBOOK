document.addEventListener("DOMContentLoaded", () => {
  // Récupère les éléments, PAS leurs valeurs tout de suite
  const emailInput = document.getElementById("mailSignIn");
  const passwordInput = document.getElementById("passwordSignIn");
  const signInButton = document.getElementById("signInPageButton");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //  const BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  //   ? "http://localhost:5000"
  //   : "https://music-theory-ebook.onrender.com";

   const BASE_URL = "https://music-theory-ebook.onrender.com";
   
  console.log("BASE_URL =", BASE_URL);

  // Fonction pour afficher les messages
  function showMessage(text, type = "error") {
    const messageEl = document.getElementById("message");
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
  }

  signInButton.addEventListener("click", async () => {
    // Récupère la valeur au moment du clic (trim)
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    console.log("Email envoyé (frontend - nettoyé):", emailValue);
    console.log("Mot de passe envoyé (frontend - nettoyé):", passwordValue);

    if (emailValue === "" || !emailRegex.test(emailValue)) {
      emailInput.classList.add("input-error");
      emailInput.value = "";
      emailInput.placeholder = "Please enter a valid email!";
      return;
    }

    if (passwordValue === "") {
      passwordInput.classList.add("input-error");
      passwordInput.value = "";
      passwordInput.placeholder = "Please enter a valid password!";
      return;
    }

    signInButton.disabled = true;
    showMessage("Envoi de la requête...", "info");

    const requestBody = { email: emailValue, password: passwordValue };

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("Connexion réussie !", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        showMessage(data.message || "Erreur de connexion.");
      }
    } catch (err) {
      console.error("Erreur réseau : ", err);
      showMessage("Erreur de connexion au serveur.");
    } finally {
      signInButton.disabled = false;
    }
  });

  // Réinitialise styles & placeholder au focus
  emailInput.addEventListener("focus", () => {
    emailInput.classList.remove("input-error");
    emailInput.placeholder = "Email";
  });

  passwordInput.addEventListener("focus", () => {
    passwordInput.classList.remove("input-error");
    passwordInput.placeholder = "Password";
  });
});

 const creeUnCompte = document.getElementById("créeUnCompte");

  creeUnCompte.addEventListener("click", () => {
    window.location.href = "/frontend/pages/register.html";
  });

  console.log("button cliquer",creeUnCompte);