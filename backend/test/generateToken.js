const jwt = require("jsonwebtoken");

// === Tes infos Mux ===
const tokenId = "211332ea-2de5-4fcd-9edc-9ff5ee3c0c05"; // ton Token ID
const tokenSecret = "/LGViGv+boWtlFjvqcSM9PIakt4UUwMvtNt2PwANBactKW13I1032up1RloRKC4WzNoIe28ynVm"; // ton Token Secret

// Playback ID de la vidéo que tu veux tester
const playbackId = "0102xPDezZGIo6H6bJrXhH4XMjAY2HhscaV5801LBVc00qE";

// Payload du JWT
const payload = {
  sub: playbackId,
  aud: "mux",
  exp: Math.floor(Date.now() / 1000) + 60 * 60, // expire dans 1h
};

// Options du JWT
const options = {
  algorithm: "HS256", // pour Token Secret Mux
  keyid: tokenId
};

// Génération du token
const token = jwt.sign(payload, tokenSecret, options);

console.log("✅ JWT généré :", token);
console.log("\n📌 URL testable dans le navigateur :");
console.log(`https://stream.mux.com/${playbackId}.m3u8?token=${token}`);
