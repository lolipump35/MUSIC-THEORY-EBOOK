const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  console.log("🔥 req.headers.authorization :", req.headers.authorization);

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Accès refusé : token manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token invalide ou expiré" });
  }
}

module.exports = authMiddleware;
