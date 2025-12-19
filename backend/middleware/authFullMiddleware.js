
const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function authFullMiddleware(req, res, next) {
  try {
    console.log("===== authFullMiddleware =====");

    // 🔹 Récupération du header Authorization
    const authHeader = req.headers["authorization"];
    console.log("Header Authorization :", authHeader);

    if (!authHeader) {
      console.log("❌ Aucun header Authorization reçu");
      return res.status(401).json({ message: "Accès refusé : token manquant" });
    }

    // 🔹 Extraction du token
    const token = authHeader.split(" ")[1];
    console.log("Token extrait :", token);

    if (!token) {
      console.log("❌ Token manquant après split");
      return res.status(401).json({ message: "Accès refusé : token manquant" });
    }

    // 🔹 Vérification du JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("JWT décodé :", decoded);
    } catch (err) {
      console.log("❌ JWT invalide ou expiré :", err.message);
      return res.status(403).json({ message: "Token invalide ou expiré" });
    }

    // 🔹 Récupération de l'utilisateur complet
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log("❌ Utilisateur introuvable pour ID :", decoded.userId);
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    console.log("✅ Utilisateur trouvé :", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    // 🔹 Injection de l'utilisateur dans req
    req.user = user;
    console.log("Utilisateur authentifié :", req.user);


    next();
  } catch (err) {
    console.error("Erreur authFullMiddleware :", err);
    res.status(500).json({ message: "Erreur serveur dans authFullMiddleware" });
  }
}

module.exports = authFullMiddleware;

