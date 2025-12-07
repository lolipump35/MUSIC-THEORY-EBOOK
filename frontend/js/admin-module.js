document.getElementById("saveModuleBtn").addEventListener("click", async () => {

  const title = document.getElementById("moduleTitle").value.trim();
  const coef = parseInt(document.getElementById("moduleCoef").value, 10);
  const extra = document.getElementById("moduleExtra").value.trim();

  // 🔥 On remplace "image file" par une URL
  const imageUrl = document.getElementById("moduleImageUrl").value.trim();

  // 🔥 playback-id MUX (champ texte)
  const playbackId = document.getElementById("modulePlaybackId").value.trim();

  const statusMsg = document.getElementById("statusMsg");

  if (!title || !coef) {
    statusMsg.textContent = "Titre et coefficient obligatoires.";
    return;
  }

  // ❗ On n’utilise PLUS FormData → tout passe en JSON
  const body = {
    title,
    coef,
    extra,
    imageUrl,
    playbackId
  };

  try {
    const res = await fetch("/api/admin/create-module", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    statusMsg.textContent = data.message || "Module enregistré !";

  } catch (err) {
    console.error(err);
    statusMsg.textContent = "Erreur lors de l'enregistrement.";
  }
});
