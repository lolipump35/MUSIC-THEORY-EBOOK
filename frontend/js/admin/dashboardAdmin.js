document.addEventListener("DOMContentLoaded", () => {
  const createModuleBtn = document.getElementById("createModuleBtn");
  const manageModuleBtn = document.getElementById("manageModuleBtn");

  // Redirection vers la page de création de module
  createModuleBtn.addEventListener("click", () => {
    window.location.href = "/pages/admin/admin-module.html";
  });

  // Redirection vers la page de gestion / attribution de modules
  manageModuleBtn.addEventListener("click", () => {
    window.location.href = "/pages/admin/assignModuleAdmin.html";
  });
});
