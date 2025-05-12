const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

  const hashedPassword = await bcrypt.hash(password, 10);

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

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Utilisateur introuvable.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect.' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Liste des utilisateurs
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // On exclut le mot de passe
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
