// Render functions
import { MAX_QUESTIONS } from "./config.js";
import { el, qs, scoreClass, progressPercent } from "./utils.js";
import { state } from "./state.js";
import { openModal, closeModal } from "./modal.js";
import { playSound } from "./sound.js";
import { loadHistory, clearHistory, loadBossProgress } from "./storage.js";

export function renderLanding(app, onEnter, onHow, onCredits) {
  app.innerHTML = "";
  const sec = el("section", "landing");
  sec.innerHTML = `
    <div class="landing-bg" aria-hidden="true"></div>
    <div class="landing-inner">
      <div class="brand brand-lg"><span class="dot"></span> CyberQuest</div>
      <h1 class="landing-title">🎮 Scam Detection Training Game</h1>
      <p class="landing-sub">Battle through 4 challenging bosses and learn to identify phishing websites, fake emails, deepfake videos, and AI-generated images. Protect yourself from online scams!</p>
      <div class="landing-actions">
        <button id="btn-enter" class="btn btn-primary">🎯 Start Adventure</button>
        <button id="btn-how" class="btn btn-outline">📖 How to Play</button>
      </div>
      <div class="landing-features">
        <span class="pill">🏆 4 Boss Battles</span>
        <span class="pill">⚡ Fast-paced gameplay</span>
        <span class="pill">🎓 Learn cybersecurity</span>
      </div>
    </div>
    <footer class="landing-footer">
      <button id="btn-credits-landing" class="btn btn-ghost">Credits</button>
    </footer>
  `;
  app.appendChild(sec);

  sec.querySelector("#btn-enter")?.addEventListener("click", onEnter);
  sec.querySelector("#btn-how")?.addEventListener("click", onHow);
  sec
    .querySelector("#btn-credits-landing")
    ?.addEventListener("click", onCredits);
}

export function renderBossMenu(app, onBossSelect, onBack) {
  const prog = loadBossProgress();
  app.innerHTML = "";
  const card = el("section", "card");

  // All bosses are now unlocked from the start
  const clearedCount =
    (prog.webBoss ? 1 : 0) +
    (prog.smsboss ? 1 : 0) +
    (prog.videoboss ? 1 : 0) +
    (prog.AIboss ? 1 : 0);

  const allCleared = clearedCount === 4;
  const headerSubtitle = allCleared
    ? '<div class="pill pill-victory">🎉 Congratulations! All Bosses Defeated! 🎉</div>'
    : '<div class="pill">Challenge any boss you want!</div>';

  card.innerHTML = `
    <header class="card-header">
      <div class="brand"><span class="dot"></span> Boss Select</div>
      ${headerSubtitle}
    </header>
    <div class="card-body" style="display:grid; gap:16px;">
      <div class="hero ${allCleared ? "hero-victory" : ""}">
        <h1>${allCleared ? "👑 Master Scam Hunter 👑" : "Choose Your Boss"}</h1>
        <p>${
          allCleared
            ? "You have conquered all scam bosses! You are now a true cybersecurity expert!"
            : "Select any boss to test your skills!"
        }</p>
      </div>
      <div class="boss-grid">
        <button class="boss-card ${
          prog.webBoss ? "cleared" : ""
        }" id="boss-webBoss" aria-label="Website Phishing Boss">
          <img src="assets/boss/webBoss.webp" alt="Website Phishing Boss"/>
          <div class="boss-name">Website Phishing Boss</div>
          ${prog.webBoss ? '<div class="cleared-badge">✓ Cleared</div>' : ""}
        </button>
        <button class="boss-card ${
          prog.smsboss ? "cleared" : ""
        }" id="boss-smsboss" aria-label="SMS/Email Scam Boss">
          <img src="assets/boss/smsboss.webp" alt="SMS/Email Scam Boss"/>
          <div class="boss-name">SMS/Email Scam Boss</div>
          ${prog.smsboss ? '<div class="cleared-badge">✓ Cleared</div>' : ""}
        </button>
        <button class="boss-card ${
          prog.videoboss ? "cleared" : ""
        }" id="boss-videoboss" aria-label="Video Deepfake Boss">
          <img src="assets/boss/videoboss.webp" alt="Video Deepfake Boss"/>
          <div class="boss-name">Video Deepfake Boss</div>
          ${prog.videoboss ? '<div class="cleared-badge">✓ Cleared</div>' : ""}
        </button>
        <button class="boss-card ${
          prog.AIboss ? "cleared" : ""
        }" id="boss-AIboss" aria-label="AI Image Boss">
          <img src="assets/boss/AIboss.webp" alt="AI Image Boss"/>
          <div class="boss-name">AI Image Boss</div>
          ${prog.AIboss ? '<div class="cleared-badge">✓ Cleared</div>' : ""}
        </button>
      </div>
    </div>
    <footer class="card-footer">
      <button id="btn-back" class="btn btn-ghost">Back to Home</button>
      <div class="pill">Progress: ${clearedCount}/4 cleared</div>
    </footer>
  `;
  app.appendChild(card);

  // Wire bosses - all are now clickable
  const webel = qs("#boss-webBoss", card);
  const smsel = qs("#boss-smsboss", card);
  const videl = qs("#boss-videoboss", card);
  const aiel = qs("#boss-AIboss", card);

  if (webel)
    webel.addEventListener("click", () => {
      playSound("click");
      onBossSelect("webBoss", true);
    });

  if (smsel)
    smsel.addEventListener("click", () => {
      playSound("click");
      onBossSelect("smsboss", true);
    });

  if (videl)
    videl.addEventListener("click", () => {
      playSound("click");
      onBossSelect("videoboss", true);
    });

  if (aiel)
    aiel.addEventListener("click", () => {
      playSound("click");
      onBossSelect("AIboss", true);
    });

  qs("#btn-back", card)?.addEventListener("click", onBack);
}

export function renderQuiz(app, onGuessSingle, onGuessPair, onExit) {
  const q = state.questions[state.index];
  const total = state.questions.length;
  const prog = Math.min(100, Math.round((state.index / total) * 100));

  app.innerHTML = "";
  const card = el("section", "card");
  const headerHTML = `
    <header class="card-header">
      <div class="brand"><span class="dot"></span> CyberQuest</div>
      <div class="pill">Q ${state.index + 1} / ${total}</div>
    </header>
  `;
  let bodyHTML = "";
  if (q.type === "single") {
    const item = q.item;
    const media =
      item.media_type === "video"
        ? `<video controls playsinline preload="metadata" muted src="${item.url}"></video>`
        : `<img src="${item.url}" alt="Question ${
            state.index + 1
          }" referrerpolicy="no-referrer"/>`;
    bodyHTML = `
      <div class="card-body">
        <div class="image-wrap" aria-label="Quiz media">
          ${media}
        </div>
        <div class="row">
          <div class="progress" style="flex:1"><div class="bar" style="width:${prog}%"></div></div>
          <div class="pill">Score: ${state.score}</div>
        </div>
        <div class="controls">
          <button id="btn-real" class="btn btn-good">Real</button>
          <button id="btn-fake" class="btn btn-bad">Fake</button>
        </div>
      </div>
    `;
  } else if (q.type === "pair") {
    const task = q.target === "fake" ? "Select the FAKE" : "Select the REAL";
    const leftMedia =
      q.left.media_type === "video"
        ? `<video controls playsinline preload="metadata" muted src="${q.left.url}"></video>`
        : `<img src="${q.left.url}" alt="Left image" referrerpolicy="no-referrer"/>`;
    const rightMedia =
      q.right.media_type === "video"
        ? `<video controls playsinline preload="metadata" muted src="${q.right.url}"></video>`
        : `<img src="${q.right.url}" alt="Right image" referrerpolicy="no-referrer"/>`;
    bodyHTML = `
      <div class="card-body">
        <div class="prompt">${task}</div>
        <div class="pair-grid">
          <button id="btn-left" class="choose-card" aria-label="Choose left image">
            <span class="choose-badge">Left</span>
            ${leftMedia}
          </button>
          <button id="btn-right" class="choose-card" aria-label="Choose right image">
            <span class="choose-badge">Right</span>
            ${rightMedia}
          </button>
        </div>
        <div class="row">
          <div class="progress" style="flex:1"><div class="bar" style="width:${prog}%"></div></div>
          <div class="pill">Score: ${state.score}</div>
        </div>
      </div>
    `;
  }
  const footerHTML = `
    <footer class="card-footer">
      <button id="btn-exit" class="btn btn-ghost">Exit</button>
      <div class="pill">Shortcuts: <span class="kbd">R</span> Real • <span class="kbd">F</span> Fake • <span class="kbd">1/2</span> Left/Right</div>
    </footer>
  `;

  card.innerHTML = headerHTML + bodyHTML + footerHTML;
  app.appendChild(card);

  if (q.type === "single") {
    qs("#btn-real", card)?.addEventListener("click", () =>
      onGuessSingle("real")
    );
    qs("#btn-fake", card)?.addEventListener("click", () =>
      onGuessSingle("fake")
    );
  } else {
    qs("#btn-left", card)?.addEventListener("click", () => onGuessPair(0));
    qs("#btn-right", card)?.addEventListener("click", () => onGuessPair(1));

    // If both images are wide, stack vertically
    const grid = qs(".pair-grid", card);
    const mediaEls = grid ? grid.querySelectorAll("img, video") : [];
    const checkLayout = () => {
      if (!grid || mediaEls.length < 2) return;
      const dim = (el) => {
        if (el.tagName === "VIDEO") {
          const w = el.videoWidth || 0;
          const h = el.videoHeight || 0;
          return [w, h];
        }
        const w = el.naturalWidth || 0;
        const h = el.naturalHeight || 0;
        return [w, h];
      };
      const [w1, h1] = dim(mediaEls[0]);
      const [w2, h2] = dim(mediaEls[1]);
      const r1 = h1 ? w1 / h1 : 1;
      const r2 = h2 ? w2 / h2 : 1;
      const wide1 = r1 >= 1.25;
      const wide2 = r2 >= 1.25;
      grid.classList.toggle("vertical", wide1 && wide2);
    };
    if (mediaEls.length === 2) {
      mediaEls.forEach((el) => {
        if (el.tagName === "VIDEO") {
          if (el.readyState >= 1) setTimeout(checkLayout, 0);
          else
            el.addEventListener("loadedmetadata", checkLayout, { once: true });
        } else {
          if (el.complete) setTimeout(checkLayout, 0);
          else {
            el.addEventListener("load", checkLayout, { once: true });
            el.addEventListener("error", checkLayout, { once: true });
          }
        }
      });
    }
  }
  qs("#btn-exit", card)?.addEventListener("click", onExit);
}

export function renderResults(app, onMenu, onShare, onHistory) {
  const s = state.score;
  const cls = scoreClass(s);
  const totalQ = state.questions.length;
  const correct = state.answers.filter((a) => a.correct).length;

  let resultText = `You got ${correct}/${totalQ} correct.`;
  if (state.boss) {
    const requiredCorrect =
      totalQ < MAX_QUESTIONS ? Math.max(1, totalQ - 2) : 8;
    const passed = correct >= requiredCorrect;

    if (correct === totalQ) {
      resultText = `🎯 PERFECT! ${correct}/${totalQ} correct!`;
    } else if (passed) {
      resultText = `You got ${correct}/${totalQ} correct. (Required: ${requiredCorrect})`;
    } else {
      resultText = `You got ${correct}/${totalQ} correct. (Required: ${requiredCorrect}) ❌`;
    }
  }

  app.innerHTML = "";
  const card = el("section", "card");
  card.innerHTML = `
    <header class="card-header">
      <div class="brand"><span class="dot"></span> Results</div>
      <div class="pill">${totalQ} questions</div>
    </header>
    <div class="card-body">
      <div class="hero">
        <div class="score ${cls}">${s} / 100</div>
        <p>${resultText}</p>
      </div>
      <div class="stack">
        <button id="btn-share" class="btn btn-outline">Share</button>
        <button id="btn-history" class="btn btn-outline">History</button>
      </div>
    </div>
    <footer class="card-footer">
      <button id="btn-menu" class="btn btn-ghost">Back to menu</button>
    </footer>
  `;
  app.appendChild(card);

  qs("#btn-menu", card)?.addEventListener("click", onMenu);
  qs("#btn-share", card)?.addEventListener("click", onShare);
  qs("#btn-history", card)?.addEventListener("click", onHistory);
}

export function historyContent() {
  const hist = loadHistory();
  const fmt = (ms) => new Date(ms).toLocaleString();
  if (!hist.length) return "<p>No game history yet.</p>";
  return (
    '<div class="history-list">' +
    hist
      .map((h, i) => {
        const dur = `${Math.floor((h.durationSec || 0) / 60)}m ${
          (h.durationSec || 0) % 60
        }s`;
        const corr =
          typeof h.correct === "number"
            ? `${h.correct}/${h.total} correct • `
            : "";
        return `
      <div class="row" style="justify-content:space-between;gap:.75rem">
        <div>
          <div><strong>#${i + 1}</strong> • ${fmt(
          h.startedAt || h.endedAt || Date.now()
        )}</div>
          <div class="pill">${corr}${dur}</div>
        </div>
        <div class="pill ${scoreClass(h.score || 0)}">${h.score || 0}/100</div>
      </div>
    `;
      })
      .join("") +
    "</div>"
  );
}

export function showHistory() {
  openModal("Play History", historyContent(), [
    { label: "Close", variant: "primary", onClick: closeModal },
    {
      label: "Clear History",
      variant: "outline",
      onClick: () => {
        clearHistory();
        closeModal();
      },
    },
  ]);
}
