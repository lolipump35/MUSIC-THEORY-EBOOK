document.addEventListener("DOMContentLoaded", async () => {
  const moduleSelect = document.getElementById("moduleSelect");
  const usersContainer = document.getElementById("usersContainer");
  const assignBtn = document.getElementById("assignBtn");
  const statusMsg = document.getElementById("statusMsg");

  // --- Récupérer les modules depuis le backend ---
  try {
    const resModules = await fetch("http://localhost:5000/admin/modules", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    const modules = await resModules.json();

    modules.forEach(mod => {
      const option = document.createElement("option");
      option.value = mod._id;
      option.textContent = mod.title;
      moduleSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Erreur récupération modules :", err);
    statusMsg.textContent = "Erreur lors du chargement des modules.";
  }

  // --- Récupérer les utilisateurs ---
  try {
    const resUsers = await fetch("http://localhost:5000/admin/users", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    const users = await resUsers.json();

    users.forEach(user => {
      const div = document.createElement("div");
      div.classList.add("userItem");
      div.innerHTML = `
        <input type="checkbox" id="user_${user._id}" value="${user._id}" />
        <label for="user_${user._id}">${user.firstName} ${user.name} (${user.email})</label>
      `;
      usersContainer.appendChild(div);
    });
  } catch (err) {
    console.error("Erreur récupération utilisateurs :", err);
    statusMsg.textContent = "Erreur lors du chargement des utilisateurs.";
  }

  // --- Bouton d'attribution ---
  assignBtn.addEventListener("click", async () => {
    const moduleId = moduleSelect.value;
    const selectedUsers = Array.from(
      usersContainer.querySelectorAll("input[type=checkbox]:checked")
    ).map(input => input.value);

    if (!moduleId || selectedUsers.length === 0) {
      statusMsg.textContent = "Veuillez sélectionner un module et au moins un utilisateur.";
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/admin/assign-module", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ moduleId, userIds: selectedUsers })
      });

      const data = await res.json();
      statusMsg.textContent = data.message || "Module attribué !";

    } catch (err) {
      console.error("Erreur attribution module :", err);
      statusMsg.textContent = "Erreur lors de l'attribution.";
    }
  });
});
