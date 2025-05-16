const bcrypt = require("bcryptjs");

const motDePasseSaisi = "Diabolo&cie091102"; // Le mot de passe en clair que tu entres
const hashDepuisMongo = "$2b$10$jZozv4s88RERqBrtR39Ac.TormReOhjLPIRwFQwiQ2PhULzjjyyDS"; // Copie exactement ce que tu as dans la DB

bcrypt.compare(motDePasseSaisi, hashDepuisMongo).then((isMatch) => {
  console.log("✅ Résultat de bcrypt.compare =", isMatch);
});
