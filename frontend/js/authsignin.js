document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const signInButton = document.getElementById("signInButton");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ✅ Base URL dynamique
  const BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5000"
    : "https://music-theory-ebook.onrender.com";

  console.log("BASE_URL =", BASE_URL);

  // Message handler
  function showMessage(text, type = "error") {
    const messageEl = document.getElementById("message");
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
  }

  // ✅ Un seul event listener global pour le clic
  signInButton.addEventListener("click", async () => {
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    // Logs utiles pour débogage
    console.log("Email envoyé (frontend - nettoyé):", emailValue);
    console.log("Mot de passe envoyé (frontend - nettoyé):", passwordValue);

    // Validation email
    if (emailValue === "" || !emailRegex.test(emailValue)) {
      emailInput.classList.add("input-error");
      emailInput.value = "";
      emailInput.placeholder = "Please enter a valid email!";
      return;
    }

    // Validation password
    if (passwordValue === "") {
      passwordInput.classList.add("input-error");
      passwordInput.value = "";
      passwordInput.placeholder = "Please enter a valid password!";
      return;
    }

    // Envoi au backend
    signInButton.disabled = true;
    showMessage("Envoi de la requête...", "info");

    const requestBody = { email: emailValue, password: passwordValue };
    console.log("Request body sign in:", requestBody);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  // Nettoyage des champs au focus
  emailInput.addEventListener("focus", () => {
    emailInput.classList.remove("input-error");
    emailInput.placeholder = "Email";
  });

  passwordInput.addEventListener("focus", () => {
    passwordInput.classList.remove("input-error");
    passwordInput.placeholder = "Password";
  });
});
