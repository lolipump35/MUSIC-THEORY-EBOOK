export const BASE_URL =
  window.API_BASE_URL ||
  (["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5000"
    : "https://music-theory-ebook.onrender.com");
