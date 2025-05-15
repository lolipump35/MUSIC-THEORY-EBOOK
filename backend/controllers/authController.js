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

  // Log de ce qui est reçu
  console.log("Received data:", req.body);
  console.log("Tentative de connexion pour :", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Utilisateur introuvable"); // Ajoute un log ici
      return res.status(400).json({ message: 'Utilisateur introuvable.' });
    }

    console.log("Utilisateur trouvé :", user.email);
    console.log("Mot de passe entré :", password);
    console.log("Mot de passe hashé dans la DB :", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Mot de passe incorrect"); // Log pour mot de passe incorrect
      return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }

    console.log("Connexion réussie !");
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log("Token généré:", token); // Log du token généré

    res.json({ token });
  } catch (err) {
    console.error("Erreur serveur :", err.message);
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
