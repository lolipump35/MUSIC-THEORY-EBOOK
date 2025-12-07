// -----------------------------------------------------
// --- Génération dynamique des objectifs --------------
// -----------------------------------------------------

let objectiveCount = 0;

// Fonction de création d’un objectif
function createObjective() {
  objectiveCount++;

  const container = document.getElementById("objectivesContainer");

  const block = document.createElement("div");
  block.classList.add("objective-block");
  block.dataset.index = objectiveCount;

  block.innerHTML = `
    <h4>Objectif ${objectiveCount}</h4>

    <label>Titre de l’objectif :</label>
    <input type="text" class="obj-title" placeholder="Titre de l’objectif">

    <label>Coefficient :</label>
    <input type="number" class="obj-coef" value="1" min="1" max="5">

    <label>URL de l'image :</label>
    <input type="text" class="obj-image" placeholder="https://...png">

    <label>Playback ID (MUX) :</label>
    <input type="text" class="obj-playback" placeholder="ID MUX">

    <label>Zone de texte :</label>
    <textarea class="obj-extra" placeholder="Notes / instructions"></textarea>

    <button class="removeObjBtn">Supprimer</button>
    <hr>
  `;

  // bouton supprimer
  block.querySelector(".removeObjBtn").addEventListener("click", () => {
    block.remove();
  });

  container.appendChild(block);
}

// -----------------------------------------------------
// --- Ajouter un objectif par défaut au chargement -----
// -----------------------------------------------------

window.addEventListener("DOMContentLoaded", () => {
  createObjective(); // objectif 1 automatiquement
});

// -----------------------------------------------------
// --- Bouton ajouter un objectif -----------------------
// -----------------------------------------------------

document.getElementById("addObjectiveBtn").addEventListener("click", () => {
  createObjective();
});

// -----------------------------------------------------
// --- Bouton SAVE module ------------------------------
// -----------------------------------------------------

document.getElementById("saveModuleBtn").addEventListener("click", async () => {
  const title = document.getElementById("moduleTitle").value.trim();
  const statusMsg = document.getElementById("statusMsg");

  if (!title) {
    statusMsg.textContent = "Le module doit avoir un titre.";
    return;
  }

  // ---- Récupération de tous les objectifs dynamiques ----
  const objectivesBlocks = document.querySelectorAll(".objective-block");
  const objectives = [];

  objectivesBlocks.forEach(block => {
    objectives.push({
      title: block.querySelector(".obj-title").value.trim(),
      coef: parseInt(block.querySelector(".obj-coef").value, 10),
      imageUrl: block.querySelector(".obj-image").value.trim(),
      playbackId: block.querySelector(".obj-playback").value.trim(),
      extra: block.querySelector(".obj-extra").value.trim()
    });
  });

  // ---- Construction du BODY envoyé au backend ----
  const body = {
    title,
    objectives
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

    console.log("📦 Module envoyé :", body); // log utile pour debug

  } catch (err) {
    console.error(err);
    statusMsg.textContent = "Erreur lors de l'enregistrement.";
  }
});
