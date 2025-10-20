// Modal system
import { el } from "./utils.js";

let activeModal = null;
let lastFocus = null;

function onEscClose(e) {
  if (e.key === "Escape") closeModal();
}

export function closeModal() {
  if (!activeModal) return;
  const overlay = activeModal;
  overlay.remove();
  activeModal = null;
  if (lastFocus && typeof lastFocus.focus === "function") {
    lastFocus.focus();
  }
  lastFocus = null;
  window.removeEventListener("keydown", onEscClose);
}

export function openModal(
  title,
  contentHTML,
  actions = [{ label: "Close", variant: "primary", onClick: closeModal }]
) {
  if (activeModal) closeModal();
  lastFocus = document.activeElement;

  const overlay = el("div", "modal-overlay");
  const modal = el("div", "modal");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  const modalId = "modal-title-" + Math.random().toString(36).slice(2);
  modal.setAttribute("aria-labelledby", modalId);

  const header = el("div", "modal-header");
  header.innerHTML = `<h2 class="modal-title" id="${modalId}">${title}</h2>`;
  const closeBtn = el("button", "btn-close", "✕");
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.addEventListener("click", closeModal);
  header.appendChild(closeBtn);

  const body = el("div", "modal-body", contentHTML);
  const footer = el("div", "modal-footer");
  actions.forEach((a) => {
    const btn = el(
      "button",
      `btn ${
        a.variant === "primary"
          ? "btn-primary"
          : a.variant === "outline"
          ? "btn-outline"
          : "btn-ghost"
      }`
    );
    btn.textContent = a.label;
    btn.addEventListener("click", () => {
      try {
        a.onClick ? a.onClick() : closeModal();
      } catch (_) {}
    });
    footer.appendChild(btn);
  });

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  window.addEventListener("keydown", onEscClose);
  document.body.appendChild(overlay);

  // Focus first action or close button
  const firstAction = footer.querySelector("button") || closeBtn;
  setTimeout(() => firstAction.focus(), 0);

  activeModal = overlay;
  return { close: closeModal };
}
