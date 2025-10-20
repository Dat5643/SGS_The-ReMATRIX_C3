// Utility functions

// Query selector shorthand
export const qs = (sel, root = document) => root.querySelector(sel);

// Create element helper
export const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

// Shuffle array
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Safe URL host extraction
export function safeHost(urlStr) {
  try {
    return new URL(urlStr).host;
  } catch {
    return "";
  }
}

// Score class helper
export function scoreClass(score) {
  if (score >= 80) return "good";
  if (score >= 50) return "ok";
  return "bad";
}

// Progress percentage
export function progressPercent(index, total) {
  return Math.round((index / total) * 100);
}
