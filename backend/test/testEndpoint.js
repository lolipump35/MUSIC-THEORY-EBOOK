// testEndpoint.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// ⚠️ Remplace par tes valeurs réelles
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTQ1MWRmMWMyZTAxZDI0NDM1MGYxZTYiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2NzI4NDY1NSwiZXhwIjoxNzY3MzcxMDU1fQ.bTTLMRUO7mgvcC6zTNE6RNRS4ZWSZZtbxs3PlXUintI";
const moduleKey = "moduleTEST";
const dayNumber = 1;
const objectiveId = "objective-1";

(async () => {
  try {
    const url = `http://localhost:5000/api/me/user-created-modules/${moduleKey}/training-days/${dayNumber}/objectives/${objectiveId}`;
    console.log("⏳ Test GET :", url);

    const res = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    console.log("HTTP Status :", res.status);

    const data = await res.text(); // d'abord text pour voir si c'est du HTML ou du JSON
    try {
      const json = JSON.parse(data);
      console.log("JSON reçu :", json);
    } catch (err) {
      console.log("Réponse non JSON :", data.slice(0, 300), "..."); // montre les premiers caractères
    }
  } catch (err) {
    console.error("Erreur fetch :", err);
  }
})();
