// #region FIRST NAME et NAME

const nameInput = document.getElementById("name");
const firstNameInput = document.getElementById("firstName");

// Fonction pour réinitialiser un champ
function resetInput(input, defaultPlaceholder) {
  input.classList.remove("input-error");
  input.placeholder = defaultPlaceholder;
}

// Au clic sur le bouton Register
document.getElementById("registerMe").addEventListener("click", function (e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const firstName = firstNameInput.value.trim();

  let isValid = true;

  // Réinitialisation d'abord
  resetInput(nameInput, "Name");
  resetInput(firstNameInput, "First Name");

  // Vérifie les champs
  if (name === "") {
    nameInput.classList.add("input-error");
    nameInput.value = "";
    nameInput.placeholder = "Name is required!";
    isValid = false;
  }

  if (firstName === "") {
    firstNameInput.classList.add("input-error");
    firstNameInput.value = "";
    firstNameInput.placeholder = "First name is required!";
    isValid = false;
  }

  if (isValid) {
    console.log("Form is valid. You can proceed.");
  }
});

// Écouteurs de focus pour réinitialiser si l'utilisateur clique dans un champ
nameInput.addEventListener("focus", () => resetInput(nameInput, "Name"));
firstNameInput.addEventListener("focus", () =>
  resetInput(firstNameInput, "First Name")
);

// #endregion FIRST NAME et NAME

// #region PHONE NUMBER

const phoneInput = document.querySelector("#phoneNumber");
const iti = window.intlTelInput(phoneInput, {
  initialCountry: "fr",
  utilsScript:
    "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
});

const registerButton = document.querySelector("#registerMe");

registerButton.addEventListener("click", function (e) {
  e.preventDefault(); // Empêche la soumission par défaut du formulaire

  // Validation pour PhoneNumber
  if (!iti.isValidNumber()) {
    phoneInput.classList.add("input-error");
    phoneInput.placeholder = "Please enter a valid phone number!";
  } else {
    phoneInput.classList.remove("input-error");
  }
});

phoneInput.addEventListener("focus", () =>
  resetInput(phoneInput, "Phone Number")
);

// #endregion PHONE NUMBER

// #region EMAIL

const emailInput = document.querySelector("#email");

// Expression régulière de validation email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

registerButton.addEventListener("click", () => {
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

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const passwordStrengthBar = document.getElementById("passwordStrengthBar");
const strengthInnerBar = passwordStrengthBar.querySelector(".bar");

const minLength = document.getElementById("minLength");
const lowercase = document.getElementById("lowercase");
const uppercase = document.getElementById("uppercase");
const digit = document.getElementById("digit");

// Validation des critères de mot de passe
const validatePasswordCriteria = () => {
  const password = passwordInput.value;

  const isMinLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  toggleCriterion(minLength, isMinLength);
  toggleCriterion(lowercase, hasLowercase);
  toggleCriterion(uppercase, hasUppercase);
  toggleCriterion(digit, hasDigit);

  let strength = 0;
  if (isMinLength) strength++;
  if (hasLowercase) strength++;
  if (hasUppercase) strength++;
  if (hasDigit) strength++;

  const width = strength * 25;
  let color = "red";
  if (strength === 2) color = "orange";
  else if (strength === 3) color = "yellowgreen";
  else if (strength === 4) color = "green";

  strengthInnerBar.style.width = width + "%";
  strengthInnerBar.style.backgroundColor = color;
};

// Fonction pour activer/désactiver les classes valid/invalid
function toggleCriterion(element, isValid) {
  element.classList.toggle("valid", isValid);
  element.classList.toggle("invalid", !isValid);
  if (isValid) {
    element.classList.remove("show-error");
  }
}

// Fonction pour réinitialiser les erreurs
function resetInputStyles(input) {
  input.classList.remove("input-error");
  input.placeholder = input === passwordInput ? "Password" : "Confirm Password"; // Réinitialisation du placeholder
}

passwordInput.addEventListener("input", validatePasswordCriteria);

document.getElementById("registerMe").addEventListener("click", (e) => {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Vérification des critères du mot de passe
  if (password.length < 8) passwordInput.classList.add("input-error");
  if (!/[a-z]/.test(password)) passwordInput.classList.add("input-error");
  if (!/[A-Z]/.test(password)) passwordInput.classList.add("input-error");
  if (!/\d/.test(password)) passwordInput.classList.add("input-error");

  // Vérification de la correspondance entre Password et Confirm Password
  if (confirmPassword !== password) {
    confirmPasswordInput.classList.add("input-error");
    confirmPasswordInput.value = ""; // Efface le contenu de confirmPassword
    confirmPasswordInput.placeholder = "Passwords don't match"; // Affiche le message d'erreur dans le placeholder
  } else {
    confirmPasswordInput.classList.remove("input-error");
    confirmPasswordInput.placeholder = "Confirm Password"; // Réinitialisation du message
  }

  validatePasswordCriteria();

  // Empêche l'envoi du formulaire si les critères ne sont pas validés
  if (!passwordInput.checkValidity() || !confirmPasswordInput.checkValidity()) {
    e.preventDefault(); // Annule l'envoi du formulaire
    document.querySelector("form").reportValidity(); // Affiche tous les messages d'erreur
  }
});

// Gestion de l'affichage/masquage du mot de passe via l'icône de l'œil
document.querySelectorAll(".toggle-password").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = document.getElementById(toggle.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});

// Réinitialisation des styles lors du clic sur un champ de mot de passe
passwordInput.addEventListener("focus", () => {
  resetInputStyles(passwordInput);
});

confirmPasswordInput.addEventListener("focus", () => {
  resetInputStyles(confirmPasswordInput);
});

// #endregion PASSWORD

// #region CGU

document.addEventListener('DOMContentLoaded', () => {
  const termsCheckbox = document.getElementById("termsCheckbox");
  const termsContainer = document.getElementById("termsContainer"); // id ici
  const registerBtn = document.getElementById("registerMe");

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      let valid = true;

      // Reset CGU erreur au début
      termsContainer.classList.remove("input-error");

      // Vérifie si la checkbox est cochée
      if (!termsCheckbox.checked) {
        termsContainer.classList.add("input-error");
        valid = false;
      }

      if (valid) {
        console.log("Form ready to submit ✅");

        // Continue la soumission du formulaire
        // Tu peux appeler ici ta fonction d'envoi (fetch ou autre)
      } else {
        console.log("Form not valid");
      }
    });
  }
});



// Si l'utilisateur clique sur la case après erreur, on retire le rouge
termsCheckbox.addEventListener("change", () => {
  if (termsCheckbox.checked) {
    termsContainer.classList.remove("input-error");
  }
});

// #endregion CGU

// #region SEND TO BACKEND

// ✅ Base URL dynamique
const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://music-theory-ebook.onrender.com";

// UTILITY FUNCTION
function showMessage(text, type = "error") {
  const messageEl = document.getElementById("message");
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

// SIGN IN PAGE
const signInBtn = document.getElementById("signInButton");
if (signInBtn) {
  signInBtn.addEventListener("click", async () => {
    const email = document.getElementById("mailSignIn").value.trim();
    const password = document.getElementById("passwordSignIn").value.trim();

    if (!email || !password) {
      showMessage("Merci de remplir tous les champs.");
      return;
    }

    signInBtn.disabled = true;

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
      signInBtn.disabled = false;
    }
  });
}


// REGISTER PAGE
const registerBtn = document.getElementById("registerMe");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const firstName = document.getElementById("firstName").value.trim();
    const phone = document.getElementById("phoneNumber").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const termsAccepted = document.getElementById("termsCheckbox").checked;

    if (
      !name ||
      !firstName ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword ||
      !termsAccepted
    ) {
      showMessage("Merci de remplir tous les champs et accepter les CGU.");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    console.log("Données envoyées :", {
      name,
      firstName,
      phone,
      email,
      password,
    });

    registerBtn.disabled = true;

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          firstName,
          phone,
          email,
          password,
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("Inscription réussie !", "success");
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          window.location.href = "signin.html";
        }, 1000);
      } else {
        showMessage(data.message || "Erreur lors de l'inscription.");
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      showMessage("Erreur de communication avec le serveur.");
    } finally {
      registerBtn.disabled = false;
    }
  });
}

// #endregion SEND TO BACKEND