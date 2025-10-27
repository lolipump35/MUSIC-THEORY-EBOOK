const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('./keys/private_key.pem');


// Remplace par un playbackId réel
const playbackId = "5dp2TMVZQ1bSE5aerhH01NsvzTF2nUoWo02hyXCba4dn4";

const payload = {
  sub: playbackId,
  aud: "mux",
  exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 heure
};

const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });

console.log("Token généré :", token);
