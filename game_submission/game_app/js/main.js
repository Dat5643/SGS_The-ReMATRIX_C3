window.addEventListener("load", () => {
  const app = document.getElementById("app");
  const el = document.createElement("div");
  el.textContent = "Game App Loaded";
  el.style.padding = "16px";
  el.style.border = "1px solid #333";
  el.style.borderRadius = "8px";
  app.appendChild(el);
});

