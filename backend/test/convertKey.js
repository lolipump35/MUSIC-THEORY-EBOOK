const fs = require("fs");
const path = require("path");

try {
  // chemin vers ton fichier private_key.pem dans le dossier keys
  const keyPath = path.join(__dirname, "keys", "private_key.pem");

  const key = fs.readFileSync(keyPath, "utf8").trim(); // supprime espaces début/fin
  const oneLineKey = key.replace(/\r?\n/g, "\\n"); // remplace retours à la ligne par \n

  console.log(`MUX_PRIVATE_KEY="${oneLineKey}"`);
} catch (err) {
  console.error("Erreur lecture fichier :", err);
}
