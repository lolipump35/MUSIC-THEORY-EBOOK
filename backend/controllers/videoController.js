// controllers/videoController.js
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// Chargement des variables d'environnement
const privateKeyPath = path.resolve(process.env.MUX_PRIVATE_KEY_PATH);
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const signingKeyId = process.env.MUX_SIGNING_KEY_ID;

const VIDEOS = {
  video1: "0102xPDezZGIo6H6bJrXhH4XMjAY2HhscaV5801LBVc00qE",
  video2: "0102xPDezZGIo6H6bJrXhH4XMjAY2HhscaV5801LBVc00qE",
};

exports.getVideoToken = (req, res) => {
  const videoId = req.params.videoId;
  const playbackId = VIDEOS[videoId];

  console.log("🔹 Requête reçue pour :", videoId);

  if (!playbackId) {
    console.warn("⚠️ Playback ID introuvable pour :", videoId);
    return res.status(404).json({ error: "Vidéo non trouvée" });
  }

  try {
    const payload = {
      sub: playbackId,
      aud: "mux",
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // expire dans 1h
    };

    console.log("📦 Payload JWT :", payload);

    const token = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      keyid: signingKeyId, // récupéré depuis .env
    });

    console.log("✅ Token généré avec succès !");
    console.log("▶️ Playback ID :", playbackId);
    console.log("🕒 Expiration :", new Date(payload.exp * 1000).toLocaleString());
    console.log("🔑 Token (début) :", token.substring(0, 50) + "...");

    res.json({ playbackId, token });
  } catch (err) {
    console.error("💥 Erreur lors de la génération du token :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
