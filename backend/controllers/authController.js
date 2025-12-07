const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// #region Inscription
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
  const trimmedPassword = password.trim();
  const hashedPassword = await bcrypt.hash(trimmedPassword, salt);

  const newUser = new User({
    name,
    firstName,
    phone,
    email,
    password: hashedPassword,
    role: "user", // <- par défaut
  });

  await newUser.save();
  res.status(201).json({ message: "Utilisateur créé avec succès !" });
};
// #endregion Inscription

// #region Connexion par email
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const cleanPassword = password.trim();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Utilisateur introuvable." });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    // 🟢 JWT avec rôle inclus
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      userId: user._id,
      role: user.role, // <- rôle renvoyé au frontend
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// #endregion Connexion

// #region Connexion Google
const loginGoogle = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential)
      return res.status(400).json({ message: "Token Google manquant." });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(403).json({
        message: "Aucun compte n'est lié à cet email. Merci de créer un compte d'abord.",
      });
    }

    // 🟢 JWT avec rôle inclus
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      userId: user._id,
      role: user.role, // <- rôle renvoyé au frontend
    });

  } catch (err) {
    console.error("Erreur Google :", err);
    res.status(500).json({ message: "Erreur lors de la connexion Google." });
  }
};
// #endregion Connexion Google

// #region Liste des utilisateurs
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// #endregion

module.exports = {
  registerUser,
  loginUser,
  loginGoogle,
  getUsers,
};
