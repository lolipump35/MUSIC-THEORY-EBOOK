const objectivesContainer = document.getElementById("objectivesContainer");
const addObjectiveBtn = document.getElementById("addObjectiveBtn");
const saveModuleBtn = document.getElementById("saveModuleBtn");

// ➕ Ajouter un objectif dynamiquement
addObjectiveBtn.addEventListener("click", () => {
  const objectiveIndex = objectivesContainer.children.length + 1;

  const objectiveDiv = document.createElement("div");
  objectiveDiv.classList.add("objective-block");
  objectiveDiv.innerHTML = `
    <hr>
    <h4>Objectif ${objectiveIndex}</h4>

    <label>Titre de l'objectif :</label>
    <input type="text" class="objectiveTitle" placeholder="Titre de l'objectif" />

    <label>Coefficient :</label>
    <input type="text" class="objectiveCoef" placeholder="Coef" />

    <label>Infos supplémentaires :</label>
    <input type="text" class="objectiveExtra" placeholder="Texte ou remarque..." />

    <label>Image (URL) :</label>
    <input type="text" class="objectiveImageUrl" placeholder="https://..." />

    <label>Playback ID (vidéo MUX) :</label>
    <input type="text" class="objectivePlaybackId" placeholder="Playback ID" />

    <button type="button" class="removeObjectiveBtn">Supprimer cet objectif</button>
  `;

  objectivesContainer.appendChild(objectiveDiv);

  // 🔥 Bouton de suppression
  objectiveDiv
    .querySelector(".removeObjectiveBtn")
    .addEventListener("click", () => {
      objectiveDiv.remove();
    });
});

// 💾 Sauvegarde du module complet via le backend
saveModuleBtn.addEventListener("click", async () => {
  const title = document.getElementById("moduleTitle").value.trim();
  const statusMsg = document.getElementById("statusMsg");

  if (!title) {
    statusMsg.textContent = "Le titre du module est obligatoire.";
    return;
  }

  // 🧠 Récupération de tous les objectifs
  const objectiveBlocks = document.querySelectorAll(".objective-block");
  const objectives = Array.from(objectiveBlocks).map((block) => ({
    title: block.querySelector(".objectiveTitle").value.trim(),
    coef: block.querySelector(".objectiveCoef").value,
    extra: block.querySelector(".objectiveExtra").value.trim(),
    imageUrl: block.querySelector(".objectiveImageUrl").value.trim(),
    muxPlaybackId: block.querySelector(".objectivePlaybackId").value.trim(),
  }));

  if (objectives.length === 0) {
    statusMsg.textContent = "Ajoutez au moins un objectif.";
    return;
  }

  const body = { title, objectives };

  try {
    const res = await fetch("http://localhost:5000/admin/modules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      statusMsg.textContent = data.message || "Module enregistré !";
      // Optionnel : réinitialiser le formulaire
      document.getElementById("moduleTitle").value = "";
      objectivesContainer.innerHTML = "";
    } else {
      statusMsg.textContent =
        data.message || "Erreur lors de l'enregistrement.";
    }
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "Erreur lors de l'enregistrement.";
  }
});
