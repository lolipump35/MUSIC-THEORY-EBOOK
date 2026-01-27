import { BASE_URL } from "/config.js";


export function initControlBar() {
  /* ===============================
     ELEMENTS DOM
  =============================== */
  const settingsPanel = document.querySelector(".settings");
  const openButton = document.getElementById("setting");
  const closeButton = document.getElementById("closeSeting");
  const programsButton = document.getElementById("programsTrainning");
  const adminControl = document.getElementById("adminControl");
  const platformButtons = document.querySelectorAll(".platform-btn");

  /* ===============================
     SETTINGS PANEL
  =============================== */
  openButton?.addEventListener("click", () => {
    settingsPanel.style.display = "flex";
  });

  closeButton?.addEventListener("click", () => {
    settingsPanel.style.display = "none";
  });

  /* ===============================
     PROGRAMMES
  =============================== */
  programsButton?.addEventListener("click", () => {
    window.location.href = "/pages/programmsTrainning.html";
  });

  /* ===============================
     PLATEFORME MUSIQUE
  =============================== */
  async function setPlatform(platform) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/user/platform`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ platform }),
      });

      if (!res.ok) throw new Error(res.status);

      platformButtons.forEach((b) => b.classList.remove("selected"));
      const btn = document.querySelector(
        `.platform-btn[data-platform="${platform}"]`
      );
      btn?.classList.add("selected");
    } catch (err) {
      console.error("Erreur setPlatform :", err);
    }
  }

  async function loadPreference() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/user/platform`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.platform) {
        const btn = document.querySelector(
          `.platform-btn[data-platform="${data.platform}"]`
        );
        btn?.classList.add("selected");
      }
    } catch (err) {
      console.error("Erreur loadPreference :", err);
    }
  }

  platformButtons.forEach((btn) => {
    btn.addEventListener("click", () =>
      setPlatform(btn.dataset.platform)
    );
  });

  loadPreference();

  /* ===============================
     ADMIN ACCESS (NOUVEAU / CLEAN)
  =============================== */
  loadAdminAccess();

  async function loadAdminAccess() {
    try {
      const token = localStorage.getItem("token");
      if (!token || !adminControl) return;

      const res = await fetch(`${BASE_URL}/api/dashboard`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) return;

      const user = await res.json();

      if (user.role === "admin") {
        adminControl.style.display = "flex";

        adminControl.addEventListener("click", () => {
          window.location.href =
            "/pages/admin/dashboardAdmin.html";
        });
      }
    } catch (err) {
      console.error("Erreur admin control :", err);
    }
  }
}
  