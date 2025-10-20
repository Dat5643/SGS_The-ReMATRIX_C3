(() => {
  const MAX_QUESTIONS = 10;
  const app = document.getElementById("app");

  // Data set: real portraits from RandomUser vs AI faces from ThisPersonDoesNotExist
  // Note: Replace or extend with your curated set for your theme.
  const DATA = [
    { id: "r1", url: "https://randomuser.me/api/portraits/men/11.jpg", label: "real", source: "randomuser.me", explain: "This is a real portrait from RandomUser's public dataset." },
    { id: "f1", url: "https://thispersondoesnotexist.com/image?seed=f1", label: "fake", source: "thispersondoesnotexist.com", explain: "AI-generated face. Look for subtle asymmetry, warped backgrounds, and odd earrings." },
    { id: "r2", url: "https://randomuser.me/api/portraits/women/31.jpg", label: "real", source: "randomuser.me", explain: "Genuine photograph; you’ll often see consistent background and natural skin texture." },
    { id: "f2", url: "https://thispersondoesnotexist.com/image?seed=f2", label: "fake", source: "thispersondoesnotexist.com", explain: "GAN artifacts may appear in hair, glasses, or patterned clothing." },
    { id: "r3", url: "https://randomuser.me/api/portraits/men/21.jpg", label: "real", source: "randomuser.me", explain: "Real person. Lighting and reflections tend to be consistent across features." },
    { id: "f3", url: "https://thispersondoesnotexist.com/image?seed=f3", label: "fake", source: "thispersondoesnotexist.com", explain: "Backgrounds can be smeared; jewelry may not match between ears." },
    { id: "r4", url: "https://randomuser.me/api/portraits/women/12.jpg", label: "real", source: "randomuser.me", explain: "A real portrait from a stock-like dataset used for demos." },
    { id: "f4", url: "https://thispersondoesnotexist.com/image?seed=f4", label: "fake", source: "thispersondoesnotexist.com", explain: "Teeth spacing and text on clothing can look unnatural in AI images." },
    { id: "r5", url: "https://randomuser.me/api/portraits/men/45.jpg", label: "real", source: "randomuser.me", explain: "Real image: shadows align with light direction; eyes reflect consistent shapes." },
    { id: "f5", url: "https://thispersondoesnotexist.com/image?seed=f5", label: "fake", source: "thispersondoesnotexist.com", explain: "Try spotting mismatched earrings, distorted hands, or melting textures." },
    { id: "r6", url: "https://randomuser.me/api/portraits/women/55.jpg", label: "real", source: "randomuser.me", explain: "Genuine photograph with natural hair edges and realistic skin details." },
    { id: "f6", url: "https://thispersondoesnotexist.com/image?seed=f6", label: "fake", source: "thispersondoesnotexist.com", explain: "AI faces sometimes show glass frames blending into skin or floating artifacts." },
  ];

  // State
  const state = {
    screen: "menu", // menu | quiz | results
    questions: [], // shuffled sample of DATA
    index: 0,
    score: 0, // 0..100
    answers: [], // { id, guess, correct }
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

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

  function parseCSV(text) {
    const rows = [];
    let i = 0, val = '', row = [], inQuotes = false;
    const pushVal = () => { row.push(val); val = ''; };
    const pushRow = () => { rows.push(row); row = []; };
    while (i < text.length) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          const next = text[i + 1];
          if (next === '"') { val += '"'; i += 2; continue; }
          inQuotes = false; i++; continue;
        } else { val += ch; i++; continue; }
      } else {
        if (ch === '"') { inQuotes = true; i++; continue; }
        if (ch === ',') { pushVal(); i++; continue; }
        if (ch === '\n') { pushVal(); pushRow(); i++; continue; }
        if (ch === '\r') { i++; continue; }
        val += ch; i++;
      }
    }
    if (val.length || row.length) { pushVal(); pushRow(); }
    const headers = rows.shift().map(h => h.trim());
    return rows.filter(r => r.length && r.some(c => c.trim() !== '')).map(r => {
      const o = {};
      headers.forEach((h, idx) => { o[h] = (r[idx] ?? '').trim(); });
      return o;
    });
  }

  async function loadData() {
    if (dataCache.loaded) return dataCache;
    const [itemsRes, pairsRes] = await Promise.all([
      fetch('assets/data/items_rows.csv'),
      fetch('assets/data/item_pairs_rows.csv')
    ]);
    const [itemsText, pairsText] = await Promise.all([itemsRes.text(), pairsRes.text()]);
    const itemsRaw = parseCSV(itemsText);
    const pairsRaw = parseCSV(pairsText);
    const items = itemsRaw.map(x => ({
      id: Number(x.id),
      type: x.type,
      media_type: x.media_type,
      url: x.media_url,
      is_fake: String(x.is_fake).toLowerCase() === 'true',
      explanation: x.explanation || '',
      source: x.source || ''
    })).filter(x => x.media_type === 'image' && x.url);
    const itemsMap = new Map(items.map(it => [it.id, it]));
    const pairItemIds = new Set();
    const pairs = pairsRaw.map(p => {
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
      let target = 'fake';
      if (numFake === 1) target = 'fake';
      else {
        const numReal = (left.is_fake ? 0 : 1) + (right.is_fake ? 0 : 1);
        target = numReal === 1 ? 'real' : 'fake';
      }
      let correctIndex = 0;
      if (target === 'fake') correctIndex = left.is_fake ? 0 : 1;
      else correctIndex = left.is_fake ? 1 : 0;
      return { type: 'pair', id, left, right, target, correctIndex };
    }).filter(Boolean);
    const singles = items.filter(x => !pairItemIds.has(x.id)).map(it => ({ type: 'single', item: it }));
    dataCache.loaded = true;
    dataCache.items = singles;
    dataCache.pairs = pairs;
    return dataCache;
  }

  function safeHost(urlStr) {
    try { return new URL(urlStr).host; } catch { return ''; }
  }

  async function startGame() {
    const data = await loadData();
    const all = shuffle([...data.pairs, ...data.items]);
    state.questions = all.slice(0, MAX_QUESTIONS);
    state.index = 0;
    state.score = 0;
    state.answers = [];
    state.screen = "quiz";
    render();
  }

  function toMenu() {
    state.screen = "menu";
    render();
  }

  function toResults() {
    state.screen = "results";
    render();
  }

  // Guess handlers
  function onGuessSingle(guess) {
    const q = state.questions[state.index];
    const item = q.item;
    const correctLabel = item.is_fake ? 'fake' : 'real';
    const correct = correctLabel === guess;
    if (correct) state.score += Math.floor(100 / MAX_QUESTIONS);
    state.answers.push({ kind: 'single', id: item.id, guess, correct });

    const realBtn = qs('#btn-real');
    const fakeBtn = qs('#btn-fake');
    const nextBtn = qs('#btn-next');
    if (realBtn) realBtn.disabled = true;
    if (fakeBtn) fakeBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = false;

    const fb = qs('#feedback');
    const labelUp = correctLabel.toUpperCase();
    const text = correct
      ? `<div class="good"><strong>Correct!</strong> This image is ${labelUp}.</div>`
      : `<div class="bad"><strong>Not quite.</strong> This image is actually ${labelUp}.</div>`;
    const explain = !correct && item.explanation ? `<div class="explain">${item.explanation}</div>` : '';
    fb.innerHTML = `<div class="feedback">${text}${explain}</div>`;
  }

  function onGuessPair(choiceIndex) {
    const q = state.questions[state.index];
    const correct = choiceIndex === q.correctIndex;
    if (correct) state.score += Math.floor(100 / MAX_QUESTIONS);
    state.answers.push({ kind: 'pair', id: q.id, choiceIndex, correct });

    const leftBtn = qs('#btn-left');
    const rightBtn = qs('#btn-right');
    const nextBtn = qs('#btn-next');
    if (leftBtn) leftBtn.disabled = true;
    if (rightBtn) rightBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = false;
    if (leftBtn && rightBtn) {
      leftBtn.classList.remove('correct','incorrect');
      rightBtn.classList.remove('correct','incorrect');
      (q.correctIndex === 0 ? leftBtn : rightBtn).classList.add('correct');
      (q.correctIndex === 0 ? rightBtn : leftBtn).classList.add('incorrect');
    }

    const fb = qs('#feedback');
    const targetUp = q.target.toUpperCase();
    const correctSide = q.correctIndex === 0 ? 'left' : 'right';
    const text = correct
      ? `<div class="good"><strong>Correct!</strong> The ${correctSide} image is ${targetUp}.</div>`
      : `<div class="bad"><strong>Not quite.</strong> The ${correctSide} image is ${targetUp}.</div>`;
    const correctItem = q.correctIndex === 0 ? q.left : q.right;
    const explain = !correct && correctItem.explanation ? `<div class="explain">${correctItem.explanation}</div>` : '';
    fb.innerHTML = `<div class="feedback">${text}${explain}</div>`;
  }

  function onGuess(guess) {
    const q = state.questions[state.index];
    const correct = q.label === guess;
    if (correct) state.score += Math.floor(100 / MAX_QUESTIONS);
    state.answers.push({ id: q.id, guess, correct });

    // lock buttons, show feedback, then enable next
    const realBtn = qs('#btn-real');
    const fakeBtn = qs('#btn-fake');
    const nextBtn = qs('#btn-next');
    realBtn.disabled = true;
    fakeBtn.disabled = true;
    nextBtn.disabled = false;

    const fb = qs('#feedback');
    const text = correct
      ? `<div class="good"><strong>Correct!</strong> This image is ${q.label.toUpperCase()}.</div>`
      : `<div class="bad"><strong>Not quite.</strong> This image is actually ${q.label.toUpperCase()}.</div>`;
    const explain = !correct ? `<div class="explain">${q.explain}</div>` : '';
    fb.innerHTML = `<div class="feedback">${text}${explain}</div>`;
  }

  function onNext() {
    state.index += 1;
    if (state.index >= state.questions.length) {
      // finalize score to 100 if all correct and rounding left 90
      if (state.answers.every(a => a.correct)) state.score = 100;
      toResults();
    } else {
      renderQuiz();
    }
  }

  function progressPercent() {
    const cur = state.index;
    const total = state.questions.length;
    return Math.round(((cur) / total) * 100);
  }

  function scoreClass(score) {
    if (score >= 80) return 'good';
    if (score >= 50) return 'ok';
    return 'bad';
  }

  function renderMenu() {
    app.innerHTML = '';
    const card = el('section', 'card');
    card.innerHTML = `
      <header class="card-header">
        <div class="brand"><span class="dot"></span> Real or Fake?</div>
      </header>
      <div class="card-body">
        <div class="hero">
          <h1>Spot the Fake — Image Authenticity Quiz</h1>
          <p>Decide if each image is a real capture or a fake. Learn quick cues to avoid scams.</p>
        </div>
        <div class="progress" aria-hidden="true"><div class="bar" style="width:0%"></div></div>
        <div class="stack">
          <button id="btn-play" class="btn btn-primary">Start</button>
          <button id="btn-about" class="btn btn-outline">About</button>
        </div>
        <div class="pill" style="justify-self:center">Shortcuts: <span class="kbd">R</span> Real • <span class="kbd">F</span> Fake • <span class="kbd">1/2</span> Left/Right</div>
      </div>
      <footer class="card-footer">
        <div class="source">Theme: Media literacy & misinformation awareness</div>
        <button id="btn-credits" class="btn btn-ghost">Credits</button>
      </footer>
    `;
    app.appendChild(card);

    qs('#btn-play', card).addEventListener('click', startGame);
    qs('#btn-about', card).addEventListener('click', () => {
      alert('This quiz helps you practice spotting fakes and common red flags. All data runs locally in your browser.');
    });
    qs('#btn-credits', card).addEventListener('click', () => {
      alert('Images are loaded from CSV files in assets/data/. You can update/replace them anytime.');
    });
  }

  function renderQuiz() {
    const q = state.questions[state.index];
    const total = state.questions.length;
    const prog = Math.min(100, Math.round(((state.index) / total) * 100));

    app.innerHTML = '';
    const card = el('section', 'card');
    const headerHTML = `
      <header class="card-header">
        <div class="brand"><span class="dot"></span> Real or Fake?</div>
        <div class="pill">Q ${state.index + 1} / ${total}</div>
      </header>
    `;
    let bodyHTML = '';
    if (q.type === 'single') {
      const item = q.item;
      bodyHTML = `
        <div class="card-body">
          <div class="image-wrap" role="img" aria-label="Quiz image">
            <img src="${item.url}" alt="Question ${state.index + 1}" referrerpolicy="no-referrer"/>
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
    } else if (q.type === 'pair') {
      const task = q.target === 'fake' ? 'Select the FAKE' : 'Select the REAL';
      bodyHTML = `
        <div class="card-body">
          <div class="prompt">${task}</div>
          <div class="pair-grid">
            <button id="btn-left" class="choose-card" aria-label="Choose left image">
              <span class="choose-badge">Left</span>
              <img src="${q.left.url}" alt="Left image" referrerpolicy="no-referrer"/>
            </button>
            <button id="btn-right" class="choose-card" aria-label="Choose right image">
              <span class="choose-badge">Right</span>
              <img src="${q.right.url}" alt="Right image" referrerpolicy="no-referrer"/>
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

    if (q.type === 'single') {
      qs('#btn-real', card).addEventListener('click', () => onGuessSingle('real'));
      qs('#btn-fake', card).addEventListener('click', () => onGuessSingle('fake'));
    } else {
      qs('#btn-left', card).addEventListener('click', () => onGuessPair(0));
      qs('#btn-right', card).addEventListener('click', () => onGuessPair(1));
    }
    qs('#btn-next', card).addEventListener('click', onNext);
    qs('#btn-exit', card).addEventListener('click', toMenu);
  }

  function renderResults() {
    const s = state.score;
    const cls = scoreClass(s);
    app.innerHTML = '';
    const card = el('section', 'card');
    card.innerHTML = `
      <header class="card-header">
        <div class="brand"><span class="dot"></span> Results</div>
        <div class="pill">${state.questions.length} questions</div>
      </header>
      <div class="card-body">
        <div class="hero">
          <div class="score ${cls}">${s} / 100</div>
          <p>You got ${state.answers.filter(a => a.correct).length} correct.</p>
        </div>
        <div class="stack">
          <button id="btn-retry" class="btn btn-primary">Play again</button>
          <button id="btn-share" class="btn btn-outline">Share</button>
        </div>
      </div>
      <footer class="card-footer">
        <div class="source">Tip: Update CSV data in <code>assets/data/</code>.</div>
        <button id="btn-menu" class="btn btn-ghost">Back to menu</button>
      </footer>
    `;
    app.appendChild(card);

    qs('#btn-retry', card).addEventListener('click', startGame);
    qs('#btn-menu', card).addEventListener('click', toMenu);
    qs('#btn-share', card).addEventListener('click', async () => {
      const text = `I scored ${s}/100 on Real or Fake? Can you beat me?`;
      try {
        if (navigator.share) {
          await navigator.share({ title: 'Real or Fake — Image Quiz', text, url: location.href });
        } else {
          await navigator.clipboard.writeText(`${text} ${location.href}`);
          alert('Share text copied to clipboard!');
        }
      } catch (_) {}
    });
  }

  function render() {
    if (state.screen === 'menu') return renderMenu();
    if (state.screen === 'quiz') return renderQuiz();
    if (state.screen === 'results') return renderResults();
  }

  // Shortcuts
  window.addEventListener('keydown', (e) => {
    if (state.screen !== 'quiz') return;
    const nextBtn = qs('#btn-next');
    const q = state.questions[state.index];
    if (q) {
      if (q.type === 'single') {
        const realBtn = qs('#btn-real');
        const fakeBtn = qs('#btn-fake');
        if (e.key.toLowerCase() === 'r' && realBtn && !realBtn.disabled) onGuessSingle('real');
        if (e.key.toLowerCase() === 'f' && fakeBtn && !fakeBtn.disabled) onGuessSingle('fake');
      } else if (q.type === 'pair') {
        const leftBtn = qs('#btn-left');
        const rightBtn = qs('#btn-right');
        if (e.key === '1' && leftBtn && !leftBtn.disabled) onGuessPair(0);
        if (e.key === '2' && rightBtn && !rightBtn.disabled) onGuessPair(1);
      }
    }
    if ((e.key === 'Enter' || e.key === ' ') && nextBtn && !nextBtn.disabled) onNext();
  });

  // Init
  render();
})();
