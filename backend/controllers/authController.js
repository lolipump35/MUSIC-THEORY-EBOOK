const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// #region Inscription
const registerUser = async (req, res) => {
  const { name, firstName, phone, email, password } = req.body;

  if (!name || !firstName || !phone || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  // Vérifie si un utilisateur avec cet email existe déjà
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Cet email est déjà utilisé." });
  }

  // Génération du hash
  const salt = await bcrypt.genSalt(10);
  const trimmedPassword = password.trim(); // pour éviter de le refaire plusieurs fois
  const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

  // Logs de contrôle
  console.log("🔐 [INSCRIPTION]");
  console.log("✅ Mot de passe brut reçu :", password);
  console.log("✅ Mot de passe après .trim() :", trimmedPassword);
  console.log("✅ Hash généré :", hashedPassword);

  // Création de l'utilisateur
  const newUser = new User({
    name,
    firstName,
    phone,
    email,
    password: hashedPassword, // ✅ on stocke bien le hash
  });

  await newUser.save();

  // Vérifie ce qui est vraiment stocké en DB
  const savedUser = await User.findOne({ email });
  console.log("✅ Hash réellement enregistré en DB :", savedUser.password);

  res.status(201).json({ message: "Utilisateur créé avec succès !" });
};
// #endregion Inscription

// #region Connexion
const loginUser = async (req, res) => {
  console.log("✅ Route /login bien atteinte !");
  const { email, password } = req.body;
  const cleanPassword = password.trim();

  console.log("✅ Email reçu:", email);
  console.log("✅ Password reçu:", password);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Utilisateur introuvable");
      return res.status(400).json({ message: "Utilisateur introuvable." });
    }

    console.log("✅ Utilisateur trouvé:", user.email);
    console.log("✅ Mot de passe hashé en DB:", user.password);

    console.log("Longueur du mot de passe reçu:", password.length);

    // Comparaison
    console.log("Buffer du mot de passe reçu :", Buffer.from(cleanPassword));

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    console.log("Résultat de bcrypt.compare:", isMatch);


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


// #endregion Connexion