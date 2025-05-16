const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Inscription
const registerUser = async (req, res) => {
  const { name, firstName, phone, email, password } = req.body;

  if (!name || !firstName || !phone || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Cet email est déjà utilisé." });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password.trim(), salt);
  console.log("Mot de passe reçu :", password);
  console.log("Mot de passe hashé :", hashedPassword);

  const newUser = new User({
    name,
    firstName,
    phone,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  res.status(201).json({ message: "Utilisateur créé avec succès !" });
};

// ✅ Connexion
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const cleanPassword = password.trim();

  console.log("🔐 Email reçu:", email);
  console.log("🔐 Password reçu:", password);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Utilisateur introuvable");
      return res.status(400).json({ message: "Utilisateur introuvable." });
    }

    console.log("✅ Utilisateur trouvé:", user.email);
    console.log("🔒 Mot de passe hashé en DB:", user.password);

    console.log("Longueur du mot de passe reçu:", password.length);

    // Comparaison
    const isMatch = await bcrypt.compare(cleanPassword, user.password);

    if (!isMatch) {
      console.log("❌ Mot de passe incorrect !");
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    // Générer le token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("✅ Connexion réussie !");
    res.json({ token });
  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Liste des utilisateurs
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // On exclut le mot de passe
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Exporter les fonctions
module.exports = {
  registerUser,
  loginUser,
  getUsers,
};
