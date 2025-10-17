// keys/generateMuxToken.js
import fs from "fs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🔧 Résout correctement le chemin du fichier
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charge les variables d'environnement depuis le .env à la racine
dotenv.config({ path: path.join(__dirname, "../.env") });

// Vérification de la clé privée
const privateKeyPath = process.env.MUX_PRIVATE_KEY_PATH;
if (!privateKeyPath) {
  throw new Error("❌ MUX_PRIVATE_KEY_PATH est manquant dans le fichier .env");
}

const fullKeyPath = path.resolve(__dirname, "../", privateKeyPath);
const privateKey = fs.readFileSync(fullKeyPath);

// 🔑 Récupération de la Signing Key ID
const signingKeyId = process.env.MUX_SIGNING_KEY_ID;
if (!signingKeyId) {
  throw new Error("❌ MUX_SIGNING_KEY_ID manquant dans le fichier .env");
}

// 🕒 Durée de validité du token (1 heure)
const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;

const token = jwt.sign(
  {
    sub: "0102xPDezZGIo6H6bJrXhH4XMjAY2HhscaV5801LBVc00qE", // ton playback_id ici
    aud: "mux",
    exp: expirationTime,
    iat: Math.floor(Date.now() / 1000),
  },
  privateKey,
  { algorithm: "RS256", keyid: signingKeyId }
);

console.log("✅ Token RS256 généré :\n", token);
console.log(
  "\n📌 URL testable dans le navigateur :\n" +
    `https://stream.mux.com/0102xPDezZGIo6H6bJrXhH4XMjAY2HhscaV5801LBVc00qE.m3u8?token=${token}`
);
