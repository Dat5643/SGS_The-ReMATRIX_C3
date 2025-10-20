(() => {
  const MAX_QUESTIONS = 10;
  const BOSS_WIN_MIN_CORRECT = 10; // must get 10/10 to clear a boss
  const app = document.getElementById("app");

  // Data set: real portraits from RandomUser vs AI faces from ThisPersonDoesNotExist
  // Note: Replace or extend with your curated set for your theme.
  const DATA = [
    {
      id: "r1",
      url: "https://randomuser.me/api/portraits/men/11.jpg",
      label: "real",
      source: "randomuser.me",
      explain: "This is a real portrait from RandomUser's public dataset.",
    },
    {
      id: "f1",
      url: "https://thispersondoesnotexist.com/image?seed=f1",
      label: "fake",
      source: "thispersondoesnotexist.com",
      explain:
        "AI-generated face. Look for subtle asymmetry, warped backgrounds, and odd earrings.",
    },
    {
      id: "r2",
      url: "https://randomuser.me/api/portraits/women/31.jpg",
      label: "real",
      source: "randomuser.me",
      explain:
        "Genuine photograph; you’ll often see consistent background and natural skin texture.",
    },
    {
      id: "f2",
      url: "https://thispersondoesnotexist.com/image?seed=f2",
      label: "fake",
      source: "thispersondoesnotexist.com",
      explain:
        "GAN artifacts may appear in hair, glasses, or patterned clothing.",
    },
    {
      id: "r3",
      url: "https://randomuser.me/api/portraits/men/21.jpg",
      label: "real",
      source: "randomuser.me",
      explain:
        "Real person. Lighting and reflections tend to be consistent across features.",
    },
    {
      id: "f3",
      url: "https://thispersondoesnotexist.com/image?seed=f3",
      label: "fake",
      source: "thispersondoesnotexist.com",
      explain:
        "Backgrounds can be smeared; jewelry may not match between ears.",
    },
    {
      id: "r4",
      url: "https://randomuser.me/api/portraits/women/12.jpg",
      label: "real",
      source: "randomuser.me",
      explain: "A real portrait from a stock-like dataset used for demos.",
    },
    {
      id: "f4",
      url: "https://thispersondoesnotexist.com/image?seed=f4",
      label: "fake",
      source: "thispersondoesnotexist.com",
      explain:
        "Teeth spacing and text on clothing can look unnatural in AI images.",
    },
    {
      id: "r5",
      url: "https://randomuser.me/api/portraits/men/45.jpg",
      label: "real",
      source: "randomuser.me",
      explain:
        "Real image: shadows align with light direction; eyes reflect consistent shapes.",
    },
    {
      id: "f5",
      url: "https://thispersondoesnotexist.com/image?seed=f5",
      label: "fake",
      source: "thispersondoesnotexist.com",
      explain:
        "Try spotting mismatched earrings, distorted hands, or melting textures.",
    },
    {
      id: "r6",
      url: "https://randomuser.me/api/portraits/women/55.jpg",
      label: "real",
      source: "randomuser.me",
      explain:
        "Genuine photograph with natural hair edges and realistic skin details.",
    },
    {
      id: "f6",
      url: "https://thispersondoesnotexist.com/image?seed=f6",
      label: "fake",
      source: "thispersondoesnotexist.com",
      explain:
        "AI faces sometimes show glass frames blending into skin or floating artifacts.",
    },
  ];

  // State
  const state = {
    screen: "landing", // landing | menu | bossMenu | quiz | results
    questions: [], // shuffled sample of DATA
    index: 0,
    score: 0, // 0..100
    answers: [], // { id, guess, correct }
    startTime: 0, // ms timestamp when a run starts
    boss: null, // null | 'AIboss'
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  // Sound system
  const sounds = {
    correct: new Audio("assets/sound/correct.mp3"),
    wrong: new Audio("assets/sound/wrong.mp3"),
    click: new Audio("assets/sound/correct.mp3"), // Reuse correct sound for clicks, or add a separate click.mp3
  };

  // Preload all sounds
  Object.values(sounds).forEach((audio) => {
    audio.preload = "auto";
    audio.volume = 0.5; // 50% volume
  });

  function playSound(name) {
    if (name == "click") {
      return;
    }
    try {
      const audio = sounds[name];
      if (audio) {
        audio.currentTime = 0; // Reset to start
        audio.play().catch((err) => console.warn("Audio play failed:", err));
      }
    } catch (err) {
      console.warn("Sound error:", err);
    }
  }

  // Minimal reusable modal (flat, accessible)
  let activeModal = null;
  let lastFocus = null;
  function closeModal() {
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
  function onEscClose(e) {
    if (e.key === "Escape") closeModal();
  }
  function openModal(
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

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // CSV parsing and data loading from assets/data/*.csv
  const dataCache = { loaded: false, items: [], pairs: [] };

  // LocalStorage helpers: keep a history of play sessions
  const LS_KEY_HISTORY = "rof_play_history";
  const LS_KEY_BOSS = "rof_boss_progress"; // { AIboss?: boolean, smsboss?: boolean, videoboss?: boolean, webBoss?: boolean } (migrates old winAIboss)
  function loadHistory() {
    try {
      const raw = localStorage.getItem(LS_KEY_HISTORY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  }
  function saveHistory(arr) {
    try {
      localStorage.setItem(LS_KEY_HISTORY, JSON.stringify(arr));
    } catch (_) {}
  }
  function addHistory(entry) {
    const arr = loadHistory();
    arr.unshift(entry);
    if (arr.length > 50) arr.length = 50; // cap size
    saveHistory(arr);
  }
  function clearHistory() {
    try {
      localStorage.removeItem(LS_KEY_HISTORY);
    } catch (_) {}
  }
  function historyContent() {
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
          <div class="pill ${scoreClass(h.score || 0)}">${
            h.score || 0
          }/100</div>
        </div>
      `;
        })
        .join("") +
      "</div>"
    );
  }
  function showHistory() {
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

  // Boss progress helpers
  function loadBossProgress() {
    try {
      const raw = localStorage.getItem(LS_KEY_BOSS);
      if (!raw)
        return {
          AIboss: false,
          smsboss: false,
          videoboss: false,
          webBoss: false,
        };
      const obj = JSON.parse(raw) || {};
      // migrate legacy shape { winAIboss: boolean }
      const migrated = {
        AIboss: !!(obj.AIboss ?? obj.winAIboss ?? false),
        smsboss: !!obj.smsboss,
        videoboss: !!obj.videoboss,
        webBoss: !!obj.webBoss,
      };
      return migrated;
    } catch (_) {
      return {
        AIboss: false,
        smsboss: false,
        videoboss: false,
        webBoss: false,
      };
    }
  }
  function saveBossProgress(p) {
    try {
      localStorage.setItem(LS_KEY_BOSS, JSON.stringify(p));
    } catch (_) {}
  }

  function parseCSV(text) {
    const rows = [];
    let i = 0,
      val = "",
      row = [],
      inQuotes = false;
    const pushVal = () => {
      row.push(val);
      val = "";
    };
    const pushRow = () => {
      rows.push(row);
      row = [];
    };
    while (i < text.length) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          const next = text[i + 1];
          if (next === '"') {
            val += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        } else {
          val += ch;
          i++;
          continue;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
          i++;
          continue;
        }
        if (ch === ",") {
          pushVal();
          i++;
          continue;
        }
        if (ch === "\n") {
          pushVal();
          pushRow();
          i++;
          continue;
        }
        if (ch === "\r") {
          i++;
          continue;
        }
        val += ch;
        i++;
      }
    }
    if (val.length || row.length) {
      pushVal();
      pushRow();
    }
    const headers = rows.shift().map((h) => h.trim());
    return rows
      .filter((r) => r.length && r.some((c) => c.trim() !== ""))
      .map((r) => {
        const o = {};
        headers.forEach((h, idx) => {
          o[h] = (r[idx] ?? "").trim();
        });
        return o;
      });
  }

  async function loadData() {
    if (dataCache.loaded) return dataCache;
    const [itemsRes, pairsRes] = await Promise.all([
      fetch("assets/data/items_rows.csv"),
      fetch("assets/data/item_pairs_rows.csv"),
    ]);
    const [itemsText, pairsText] = await Promise.all([
      itemsRes.text(),
      pairsRes.text(),
    ]);
    const itemsRaw = parseCSV(itemsText);
    const pairsRaw = parseCSV(pairsText);
    const items = itemsRaw
      .map((x) => ({
        id: Number(x.id),
        type: x.type,
        media_type: x.media_type,
        url: x.media_url,
        is_fake: String(x.is_fake).toLowerCase() === "true",
        explanation: x.explanation || "",
        source: x.source || "",
      }))
      .filter(
        (x) => (x.media_type === "image" || x.media_type === "video") && x.url
      );
    const itemsMap = new Map(items.map((it) => [it.id, it]));
    const pairItemIds = new Set();
    const pairs = pairsRaw
      .map((p) => {
        const id = Number(p.id);
        const a = itemsMap.get(Number(p.item_1_id));
        const b = itemsMap.get(Number(p.item_2_id));
        if (a) pairItemIds.add(a.id);
        if (b) pairItemIds.add(b.id);
        if (!a || !b) return null;
        const flip = Math.random() < 0.5;
        const left = flip ? b : a;
        const right = flip ? a : b;
        const numFake = (left.is_fake ? 1 : 0) + (right.is_fake ? 1 : 0);
        let target = "fake";
        if (numFake === 1) target = "fake";
        else {
          const numReal = (left.is_fake ? 0 : 1) + (right.is_fake ? 0 : 1);
          target = numReal === 1 ? "real" : "fake";
        }
        let correctIndex = 0;
        if (target === "fake") correctIndex = left.is_fake ? 0 : 1;
        else correctIndex = left.is_fake ? 1 : 0;
        return { type: "pair", id, left, right, target, correctIndex };
      })
      .filter(Boolean);
    const singles = items
      .filter((x) => !pairItemIds.has(x.id))
      .map((it) => ({ type: "single", item: it }));
    dataCache.loaded = true;
    dataCache.items = singles;
    dataCache.pairs = pairs;
    return dataCache;
  }

  function safeHost(urlStr) {
    try {
      return new URL(urlStr).host;
    } catch {
      return "";
    }
  }

  async function startGame() {
    const data = await loadData();
    const all = shuffle([...data.pairs, ...data.items]);
    // Deduplicate questions within a playthrough by content (not just id)
    const seen = new Set();
    const unique = [];
    for (const q of all) {
      const key =
        q.type === "single"
          ? `i:${q.item.id}`
          : `p:${[q.left.id, q.right.id].sort((a, b) => a - b).join("-")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(q);
    }
    state.questions = unique.slice(0, MAX_QUESTIONS);
    state.index = 0;
    state.score = 0;
    state.answers = [];
    state.startTime = Date.now();
    state.screen = "quiz";
    render();
  }

  function buildBossQuestionsForTypes(allowedTypes, data) {
    // Filter pairs where both items' type are in allowedTypes
    const pairs = data.pairs.filter(
      (p) =>
        allowedTypes.includes(p.left.type) &&
        allowedTypes.includes(p.right.type)
    );
    // Singles are items not in any pair; filter by item.type
    const singles = data.items.filter((s) =>
      allowedTypes.includes(s.item.type)
    );
    const all = shuffle([...pairs, ...singles]);
    // Dedup and limit to MAX_QUESTIONS
    const seen = new Set();
    const unique = [];
    for (const q of all) {
      const key =
        q.type === "single"
          ? `i:${q.item.id}`
          : `p:${[q.left.id, q.right.id].sort((a, b) => a - b).join("-")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(q);
      if (unique.length >= MAX_QUESTIONS) break;
    }
    return unique;
  }

  // Start AI Boss using type-based filter
  async function startBossAI() {
    const data = await loadData();
    const questions = buildBossQuestionsForTypes(["image"], data);
    state.questions = questions.slice(0, MAX_QUESTIONS);
    state.index = 0;
    state.score = 0;
    state.answers = [];
    state.startTime = Date.now();
    state.boss = "AIboss";
    state.screen = "quiz";
    render();
  }

  // Generic start function (future bosses TBD). For now only AIboss is playable.
  function startBoss(id) {
    if (id === "AIboss") return startBossAI();
    // Others are coming soon; show info
    openModal(
      "Coming Soon",
      `<p>This boss is coming soon. Defeat previous bosses to unlock it when available.</p>`
    );
  }

  function toMenu() {
    // Route any legacy 'menu' navigation to the Boss menu by default
    state.screen = "bossMenu";
    state.boss = null;
    render();
  }

  function toResults() {
    // Save a history entry for this playthrough
    const endedAt = Date.now();
    const startedAt = state.startTime || endedAt;
    const durationSec = Math.max(0, Math.round((endedAt - startedAt) / 1000));
    const totalQ = state.questions.length;
    const correct = state.answers.filter((a) => a.correct).length;
    addHistory({
      startedAt,
      endedAt,
      durationSec,
      score: state.score,
      total: totalQ,
      correct,
    });

    // Boss victory check: must get 10/10
    if (state.boss) {
      const win = correct >= BOSS_WIN_MIN_CORRECT;
      if (win) {
        const prog = loadBossProgress();
        if (!prog[state.boss]) {
          prog[state.boss] = true;
          saveBossProgress(prog);
        }
      }
    }

    state.screen = "results";
    render();
  }

  // Guess handlers
  function onGuessSingle(guess) {
    const q = state.questions[state.index];
    const item = q.item;
    const correctLabel = item.is_fake ? "fake" : "real";
    const correct = correctLabel === guess;

    // Play sound based on answer
    playSound(correct ? "correct" : "wrong");

    try {
      if (window.fx) {
        correct ? window.fx.correct() : window.fx.incorrect();
      }
    } catch (_) {}
    if (correct) state.score += Math.floor(100 / MAX_QUESTIONS);
    state.answers.push({ kind: "single", id: item.id, guess, correct });

    const realBtn = qs("#btn-real");
    const fakeBtn = qs("#btn-fake");
    const nextBtn = qs("#btn-next");
    if (realBtn) realBtn.disabled = true;
    if (fakeBtn) fakeBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = false;

    const fb = qs("#feedback");
    const labelUp = correctLabel.toUpperCase();
    const text = correct
      ? `<div class="good"><strong>Correct!</strong> This image is ${labelUp}.</div>`
      : `<div class="bad"><strong>Not quite.</strong> This image is actually ${labelUp}.</div>`;
    const explain =
      !correct && item.explanation
        ? `<div class="explain">${item.explanation}</div>`
        : "";
    fb.innerHTML = `<div class="feedback">${text}${explain}</div>`;
  }

  function onGuessPair(choiceIndex) {
    const q = state.questions[state.index];
    const correct = choiceIndex === q.correctIndex;

    // Play sound based on answer
    playSound(correct ? "correct" : "wrong");

    try {
      if (window.fx) {
        correct ? window.fx.correct() : window.fx.incorrect();
      }
    } catch (_) {}
    if (correct) state.score += Math.floor(100 / MAX_QUESTIONS);
    state.answers.push({ kind: "pair", id: q.id, choiceIndex, correct });

    const leftBtn = qs("#btn-left");
    const rightBtn = qs("#btn-right");
    const nextBtn = qs("#btn-next");
    if (leftBtn) leftBtn.disabled = true;
    if (rightBtn) rightBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = false;
    if (leftBtn && rightBtn) {
      leftBtn.classList.remove("correct", "incorrect");
      rightBtn.classList.remove("correct", "incorrect");
      (q.correctIndex === 0 ? leftBtn : rightBtn).classList.add("correct");
      (q.correctIndex === 0 ? rightBtn : leftBtn).classList.add("incorrect");
    }

    const fb = qs("#feedback");
    const targetUp = q.target.toUpperCase();
    const correctSide = q.correctIndex === 0 ? "left" : "right";
    const text = correct
      ? `<div class="good"><strong>Correct!</strong> The ${correctSide} image is ${targetUp}.</div>`
      : `<div class="bad"><strong>Not quite.</strong> The ${correctSide} image is ${targetUp}.</div>`;
    const correctItem = q.correctIndex === 0 ? q.left : q.right;
    const explain =
      !correct && correctItem.explanation
        ? `<div class="explain">${correctItem.explanation}</div>`
        : "";
    fb.innerHTML = `<div class="feedback">${text}${explain}</div>`;
  }

  function onGuess(guess) {
    const q = state.questions[state.index];
    const correct = q.label === guess;
    if (correct) state.score += Math.floor(100 / MAX_QUESTIONS);
    state.answers.push({ id: q.id, guess, correct });

    // lock buttons, show feedback, then enable next
    const realBtn = qs("#btn-real");
    const fakeBtn = qs("#btn-fake");
    const nextBtn = qs("#btn-next");
    realBtn.disabled = true;
    fakeBtn.disabled = true;
    nextBtn.disabled = false;

    const fb = qs("#feedback");
    const text = correct
      ? `<div class="good"><strong>Correct!</strong> This image is ${q.label.toUpperCase()}.</div>`
      : `<div class="bad"><strong>Not quite.</strong> This image is actually ${q.label.toUpperCase()}.</div>`;
    const explain = !correct ? `<div class="explain">${q.explain}</div>` : "";
    fb.innerHTML = `<div class="feedback">${text}${explain}</div>`;
  }

  function onNext() {
    state.index += 1;
    if (state.index >= state.questions.length) {
      // finalize score to 100 if all correct and rounding left 90
      if (state.answers.every((a) => a.correct)) state.score = 100;
      toResults();
    } else {
      renderQuiz();
    }
  }

  function progressPercent() {
    const cur = state.index;
    const total = state.questions.length;
    return Math.round((cur / total) * 100);
  }

  function scoreClass(score) {
    if (score >= 80) return "good";
    if (score >= 50) return "ok";
    return "bad";
  }

  function renderMenu() {
    app.innerHTML = "";
    const card = el("section", "card");
    card.innerHTML = `
      <header class="card-header">
        <div class="brand"><span class="dot"></span> CyberQuest</div>
      </header>
      <div class="card-body">
        <div class="hero">
          <h1>Spot the Fake — Image Authenticity Quiz</h1>
          <p>Decide if each image is a real capture or a fake. Learn quick cues to avoid scams.</p>
        </div>
        <div class="progress" aria-hidden="true"><div class="bar" style="width:0%"></div></div>
        <div class="stack"><button id="btn-boss" class="btn btn-primary">Boss Mode</button></div>
        <div class="pill" style="justify-self:center">Shortcuts: <span class="kbd">R</span> Real • <span class="kbd">F</span> Fake • <span class="kbd">1/2</span> Left/Right</div>
      </div>
      <footer class="card-footer">
        <button id="btn-landing" class="btn btn-ghost">Back to Home page</button>
        <button id="btn-credits" class="btn btn-ghost">Credits</button>
      </footer>
    `;
    app.appendChild(card);

    qs("#btn-boss", card).addEventListener("click", () => {
      playSound("click");
      state.screen = "bossMenu";
      render();
    });
    // Hide other modes/options for the boss-first flow
    qs("#btn-landing", card).addEventListener("click", () => {
      playSound("click");
      state.screen = "landing";
      render();
    });
  }

  function renderBossMenu() {
    const prog = loadBossProgress();
    app.innerHTML = "";
    const card = el("section", "card");
    // Determine unlock states (sequential)
    const unlockedAI = true;
    const unlockedSMS = !!prog.AIboss; // AI cleared unlocks SMS
    const unlockedVideo = !!prog.smsboss; // SMS cleared unlocks Video
    const unlockedWeb = !!prog.videoboss; // Video cleared unlocks Web
    const clearedCount =
      (prog.AIboss ? 1 : 0) +
      (prog.smsboss ? 1 : 0) +
      (prog.videoboss ? 1 : 0) +
      (prog.webBoss ? 1 : 0);

    card.innerHTML = `
      <header class="card-header">
        <div class="brand"><span class="dot"></span> Boss Select</div>
        <div class="pill">Beat each boss (10/10) to unlock the next</div>
      </header>
      <div class="card-body" style="display:grid; gap:16px;">
        <div class="hero">
          <h1>Choose Your Boss</h1>
          <p>Clear one to unlock the next.</p>
        </div>
        <div class="boss-grid">
          <button class="boss-card ${
            unlockedAI ? "" : "locked"
          }" id="boss-AIboss" aria-label="AI Scam Boss">
            <img src="assets/boss/AIboss.webp" alt="AI Scam Boss"/>
            <div class="boss-name">AI Scam Boss</div>
          </button>
          <button class="boss-card ${
            unlockedSMS ? "soon" : "locked"
          }" id="boss-smsboss" aria-label="SMS/Email Scam Boss" ${
      unlockedSMS ? "" : "disabled"
    }>
            <img src="assets/boss/smsboss.webp" alt="SMS Scam Boss"/>
            <div class="boss-name">SMS/Email Scam Boss</div>
          </button>
          <button class="boss-card ${
            unlockedVideo ? "soon" : "locked"
          }" id="boss-videoboss" aria-label="Video Scam Boss" ${
      unlockedVideo ? "" : "disabled"
    }>
            <img src="assets/boss/videoboss.webp" alt="Video Scam Boss"/>
            <div class="boss-name">Video Scam Boss</div>
          </button>
          <button class="boss-card ${
            unlockedWeb ? "soon" : "locked"
          }" id="boss-webBoss" aria-label="Website Scam Boss" ${
      unlockedWeb ? "" : "disabled"
    }>
            <img src="assets/boss/webBoss.webp" alt="Website Scam Boss"/>
            <div class="boss-name">Website Scam Boss</div>
          </button>
        </div>
      </div>
      <footer class="card-footer">
        <button id="btn-back" class="btn btn-ghost">Back to Home</button>
        <div class="pill">Progress: ${clearedCount}/4 cleared</div>
      </footer>
    `;
    app.appendChild(card);

    // Wire bosses (only AI playable; others show Coming Soon or Locked)
    qs("#boss-AIboss", card).addEventListener("click", () => {
      playSound("click");
      startBoss("AIboss");
    });
    const smsel = qs("#boss-smsboss", card);
    const videl = qs("#boss-videoboss", card);
    const webel = qs("#boss-webBoss", card);
    if (smsel)
      smsel.addEventListener("click", () => {
        playSound("click");
        if (!unlockedSMS)
          return openModal(
            "Locked",
            "<p>Defeat AI Boss (10/10) to unlock SMS Boss.</p>"
          );
        openModal("Coming Soon", "<p>SMS Boss will be available later.</p>");
      });
    if (videl)
      videl.addEventListener("click", () => {
        playSound("click");
        if (!unlockedVideo)
          return openModal(
            "Locked",
            "<p>Defeat SMS Boss to unlock Video Boss.</p>"
          );
        openModal("Coming Soon", "<p>Video Boss will be available later.</p>");
      });
    if (webel)
      webel.addEventListener("click", () => {
        playSound("click");
        if (!unlockedWeb)
          return openModal(
            "Locked",
            "<p>Defeat Video Boss to unlock Website Boss.</p>"
          );
        openModal(
          "Coming Soon",
          "<p>Website Boss will be available later.</p>"
        );
      });
    qs("#btn-back", card).addEventListener("click", () => {
      playSound("click");
      state.screen = "landing";
      render();
    });
  }

  function renderLanding() {
    app.innerHTML = "";
    const sec = el("section", "landing");
    sec.innerHTML = `
      <div class="landing-bg" aria-hidden="true"></div>
      <div class="landing-inner">
        <div class="brand brand-lg"><span class="dot"></span> CyberQuest</div>
        <h1 class="landing-title">Spot Deepfakes. Train Your Eye.</h1>
        <p class="landing-sub">A fast, privacy‑friendly quiz to practice detecting AI‑generated and manipulated media.</p>
        <div class="landing-actions">
          <button id="btn-enter" class="btn btn-primary">Play Now</button>
          <button id="btn-how" class="btn btn-outline">How It Works</button>
        </div>
        <div class="landing-features">
          <span class="pill">10 questions</span>
          <span class="pill">Shortcuts: <span class="kbd">R/F</span> <span class="kbd">1/2</span></span>
          <span class="pill">Local data, no tracking</span>
        </div>
      </div>
      <footer class="landing-footer">
        <button id="btn-credits-landing" class="btn btn-ghost">Credits</button>
      </footer>
    `;
    app.appendChild(sec);

    const goMenu = () => {
      playSound("click");
      state.screen = "bossMenu";
      render();
    };
    sec.querySelector("#btn-enter")?.addEventListener("click", goMenu);
    sec.querySelector("#btn-how")?.addEventListener("click", () => {
      playSound("click");
      openModal(
        "How It Works",
        `
        <p>You will see either a single image (decide CyberQuest?) or a pair of images (choose which one is CyberQuest? depending on the prompt).</p>
        <p>Use keyboard shortcuts to go faster: <span class="kbd">R</span>/<span class="kbd">F</span> for Real/Fake, and <span class="kbd">1</span>/<span class="kbd">2</span> for left/right.</p>
        <p>Data is loaded locally from <code>assets/data/</code>. Update the CSVs to customize the game.</p>
      `,
        [
          { label: "Play Now", variant: "primary", onClick: goMenu },
          { label: "Close", variant: "outline", onClick: closeModal },
        ]
      );
    });
    sec.querySelector("#btn-credits-landing")?.addEventListener("click", () => {
      playSound("click");
      openModal(
        "Credits",
        `
        <p>Media and questions come from CSV files in <code>assets/data/</code>. Replace them to tailor the experience.</p>
        <p>Built as a lightweight, client-only web quiz for media literacy.</p>
      `
      );
    });
  }

  function renderQuiz() {
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
          <div id="feedback"></div>
          <div class="row">
            <div style="visibility:hidden"></div>
            <button id="btn-next" class="btn btn-primary" disabled>Next</button>
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
          <div id="feedback"></div>
          <div class="row">
            <div style="visibility:hidden"></div>
            <button id="btn-next" class="btn btn-primary" disabled>Next</button>
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
      qs("#btn-real", card).addEventListener("click", () =>
        onGuessSingle("real")
      );
      qs("#btn-fake", card).addEventListener("click", () =>
        onGuessSingle("fake")
      );
    } else {
      qs("#btn-left", card).addEventListener("click", () => onGuessPair(0));
      qs("#btn-right", card).addEventListener("click", () => onGuessPair(1));

      // If both images are wide, stack vertically for better viewing
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
        const wide1 = r1 >= 1.25; // consider > 5:4 as wide
        const wide2 = r2 >= 1.25;
        grid.classList.toggle("vertical", wide1 && wide2);
      };
      if (mediaEls.length === 2) {
        mediaEls.forEach((el) => {
          if (el.tagName === "VIDEO") {
            if (el.readyState >= 1)
              setTimeout(checkLayout, 0); // metadata available
            else
              el.addEventListener("loadedmetadata", checkLayout, {
                once: true,
              });
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
    qs("#btn-next", card).addEventListener("click", () => {
      playSound("click");
      onNext();
    });
    qs("#btn-exit", card).addEventListener("click", () => {
      playSound("click");
      toMenu();
    });
  }

  function renderResults() {
    const s = state.score;
    const cls = scoreClass(s);
    app.innerHTML = "";
    const card = el("section", "card");
    card.innerHTML = `
      <header class="card-header">
        <div class="brand"><span class="dot"></span> Results</div>
        <div class="pill">${state.questions.length} questions</div>
      </header>
      <div class="card-body">
        <div class="hero">
          <div class="score ${cls}">${s} / 100</div>
          <p>You got ${
            state.answers.filter((a) => a.correct).length
          } correct.</p>
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

    qs("#btn-menu", card).addEventListener("click", () => {
      playSound("click");
      toMenu();
    });
    qs("#btn-share", card).addEventListener("click", async () => {
      playSound("click");
      const text = `I scored ${s}/100 on CyberQuest Can you beat me?`;
      try {
        if (navigator.share) {
          await navigator.share({
            title: "CyberQuest? — Image Quiz",
            text,
            url: location.href,
          });
        } else {
          await navigator.clipboard.writeText(`${text} ${location.href}`);
          openModal("Share", "<p>Share text copied to clipboard!</p>");
        }
      } catch (_) {}
    });
    qs("#btn-history", card).addEventListener("click", () => {
      playSound("click");
      showHistory();
    });
  }

  function render() {
    if (state.screen === "landing") return renderLanding();
    if (state.screen === "menu") return renderMenu();
    if (state.screen === "bossMenu") return renderBossMenu();
    if (state.screen === "quiz") return renderQuiz();
    if (state.screen === "results") return renderResults();
  }

  // Shortcuts
  window.addEventListener("keydown", (e) => {
    if (state.screen === "landing") {
      if (e.key === "Enter") {
        state.screen = "bossMenu";
        render();
      }
      return;
    }
    if (state.screen !== "quiz") return;
    const nextBtn = qs("#btn-next");
    const q = state.questions[state.index];
    if (q) {
      if (q.type === "single") {
        const realBtn = qs("#btn-real");
        const fakeBtn = qs("#btn-fake");
        if (e.key.toLowerCase() === "r" && realBtn && !realBtn.disabled)
          onGuessSingle("real");
        if (e.key.toLowerCase() === "f" && fakeBtn && !fakeBtn.disabled)
          onGuessSingle("fake");
      } else if (q.type === "pair") {
        const leftBtn = qs("#btn-left");
        const rightBtn = qs("#btn-right");
        if (e.key === "1" && leftBtn && !leftBtn.disabled) onGuessPair(0);
        if (e.key === "2" && rightBtn && !rightBtn.disabled) onGuessPair(1);
      }
    }
    if ((e.key === "Enter" || e.key === " ") && nextBtn && !nextBtn.disabled)
      onNext();
  });

  // Init
  render();
})();
