// Import modules
import { MAX_QUESTIONS, BOSS_WIN_MIN_CORRECT } from "./config.js";
import { qs, el, shuffle } from "./utils.js";
import { state, resetState } from "./state.js";
import { playSound } from "./sound.js";
import { loadData } from "./data.js";
import { openModal, closeModal } from "./modal.js";
import {
  showBossDialogue,
  getRandomDialogue,
  bossDialogues,
} from "./bosses.js";
import { addHistory, loadBossProgress, saveBossProgress } from "./storage.js";
import {
  renderLanding,
  renderBossMenu,
  renderQuiz,
  renderResults,
  showHistory,
} from "./renders.js";

(() => {
  const app = document.getElementById("app");

  // Build boss questions for specific types
  function buildBossQuestionsForTypes(allowedTypes, data) {
    const pairs = data.pairs.filter(
      (p) =>
        allowedTypes.includes(p.left.type) &&
        allowedTypes.includes(p.right.type)
    );
    const singles = data.items.filter((s) =>
      allowedTypes.includes(s.item.type)
    );
    const all = shuffle([...pairs, ...singles]);
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

  // Start boss battles
  async function startBossWeb() {
    const data = await loadData();
    const questions = buildBossQuestionsForTypes(["web"], data);
    if (questions.length === 0) {
      openModal(
        "No Questions Available",
        `<p>No website scam questions found in the data files.</p><p>Please add items with type "web" to the CSV files.</p>`
      );
      return;
    }
    state.questions = questions.slice(0, MAX_QUESTIONS);
    state.index = 0;
    state.score = 0;
    state.answers = [];
    state.startTime = Date.now();
    state.boss = "webBoss";
    showBossDialogue("webBoss", "intro", () => {
      state.screen = "quiz";
      render();
    });
  }

  async function startBossSMS() {
    const data = await loadData();
    const questions = buildBossQuestionsForTypes(
      ["sms", "email", "text"],
      data
    );
    if (questions.length === 0) {
      openModal(
        "No Questions Available",
        `<p>No SMS/Email scam questions found in the data files.</p><p>Please add items with type "sms", "email", or "text" to the CSV files.</p>`
      );
      return;
    }
    state.questions = questions.slice(0, MAX_QUESTIONS);
    state.index = 0;
    state.score = 0;
    state.answers = [];
    state.startTime = Date.now();
    state.boss = "smsboss";
    showBossDialogue("smsboss", "intro", () => {
      state.screen = "quiz";
      render();
    });
  }

  async function startBossVideo() {
    const data = await loadData();
    const questions = buildBossQuestionsForTypes(["video", "deepfake"], data);
    if (questions.length === 0) {
      openModal(
        "No Questions Available",
        `<p>No video deepfake questions found in the data files.</p><p>Please add items with type "video" or "deepfake" to the CSV files.</p>`
      );
      return;
    }
    state.questions = questions.slice(0, MAX_QUESTIONS);
    state.index = 0;
    state.score = 0;
    state.answers = [];
    state.startTime = Date.now();
    state.boss = "videoboss";
    showBossDialogue("videoboss", "intro", () => {
      state.screen = "quiz";
      render();
    });
  }

  async function startBossAI() {
    const data = await loadData();
    const questions = buildBossQuestionsForTypes(["image"], data);
    if (questions.length === 0) {
      openModal(
        "No Questions Available",
        `<p>No AI image questions found in the data files.</p><p>Please add items with type "image" to the CSV files.</p>`
      );
      return;
    }
    state.questions = questions.slice(0, MAX_QUESTIONS);
    state.index = 0;
    state.score = 0;
    state.answers = [];
    state.startTime = Date.now();
    state.boss = "AIboss";
    showBossDialogue("AIboss", "intro", () => {
      state.screen = "quiz";
      render();
    });
  }

  function startBoss(id) {
    if (id === "webBoss") return startBossWeb();
    if (id === "smsboss") return startBossSMS();
    if (id === "videoboss") return startBossVideo();
    if (id === "AIboss") return startBossAI();
    openModal(
      "Coming Soon",
      `<p>This boss is coming soon. Defeat previous bosses to unlock it when available.</p>`
    );
  }

  function toMenu() {
    state.screen = "bossMenu";
    state.boss = null;
    render();
  }

  function toResults() {
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

    if (state.boss) {
      const requiredCorrect =
        totalQ < MAX_QUESTIONS ? Math.max(1, totalQ - 2) : BOSS_WIN_MIN_CORRECT;
      const win = correct >= requiredCorrect;
      if (win) {
        const prog = loadBossProgress();
        if (!prog[state.boss]) {
          prog[state.boss] = true;
          saveBossProgress(prog);
        }
      }
      showBossDialogue(state.boss, win ? "victory" : "defeat", () => {
        state.screen = "results";
        render();
      });
      return;
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

    if (state.boss) {
      const showReaction = correct ? Math.random() < 0.3 : true;
      if (showReaction) {
        playSound(correct ? "correct" : "wrong");
        const reaction = getRandomDialogue(
          state.boss,
          correct ? "onCorrect" : "onWrong"
        );
        if (reaction) {
          setTimeout(() => {
            const toast = el(
              "div",
              `boss-toast ${correct ? "correct" : "wrong"}`,
              `<strong>${bossDialogues[state.boss].name}:</strong> ${reaction}`
            );
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add("show"), 10);
            setTimeout(() => {
              toast.classList.remove("show");
              setTimeout(() => toast.remove(), 300);
            }, 3000);
          }, 800);
        }
      }
    } else {
      playSound(correct ? "correct" : "wrong");
    }

    try {
      if (window.fx) {
        correct ? window.fx.correct() : window.fx.incorrect();
      }
    } catch (_) {}
    if (correct) state.score += Math.floor(100 / state.questions.length);
    state.answers.push({ kind: "single", id: item.id, guess, correct });

    const realBtn = qs("#btn-real");
    const fakeBtn = qs("#btn-fake");
    if (realBtn) realBtn.disabled = true;
    if (fakeBtn) fakeBtn.disabled = true;

    const labelUp = correctLabel.toUpperCase();
    const title = correct ? "✅ Correct!" : "❌ Wrong!";
    const statusText = correct
      ? `<p>This image is <strong>${labelUp}</strong>.</p>`
      : `<p>This image is actually <strong>${labelUp}</strong>.</p>`;
    const explanation = item.explanation
      ? `<p class="explain">${item.explanation}</p>`
      : "";
    const message = statusText + explanation;

    openModal(title, message, [
      {
        label: "Next Question",
        variant: "primary",
        onClick: () => {
          closeModal();
          onNext();
        },
      },
    ]);
  }

  function onGuessPair(choiceIndex) {
    const q = state.questions[state.index];
    const correct = choiceIndex === q.correctIndex;

    if (state.boss) {
      const showReaction = correct ? Math.random() < 0.3 : true;
      if (showReaction) {
        playSound(correct ? "correct" : "wrong");
        const reaction = getRandomDialogue(
          state.boss,
          correct ? "onCorrect" : "onWrong"
        );
        if (reaction) {
          setTimeout(() => {
            const toast = el(
              "div",
              `boss-toast ${correct ? "correct" : "wrong"}`,
              `<strong>${bossDialogues[state.boss].name}:</strong> ${reaction}`
            );
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add("show"), 10);
            setTimeout(() => {
              toast.classList.remove("show");
              setTimeout(() => toast.remove(), 300);
            }, 3000);
          }, 800);
        }
      }
    } else {
      playSound(correct ? "correct" : "wrong");
    }

    try {
      if (window.fx) {
        correct ? window.fx.correct() : window.fx.incorrect();
      }
    } catch (_) {}
    if (correct) state.score += Math.floor(100 / state.questions.length);
    state.answers.push({ kind: "pair", id: q.id, choiceIndex, correct });

    const leftBtn = qs("#btn-left");
    const rightBtn = qs("#btn-right");
    if (leftBtn) leftBtn.disabled = true;
    if (rightBtn) rightBtn.disabled = true;

    const targetUp = q.target.toUpperCase();
    const correctSide = q.correctIndex === 0 ? "left" : "right";
    const title = correct ? "✅ Correct!" : "❌ Wrong!";
    const correctItem = q.correctIndex === 0 ? q.left : q.right;
    const statusText = correct
      ? `<p>The <strong>${correctSide}</strong> image is <strong>${targetUp}</strong>.</p>`
      : `<p>The <strong>${correctSide}</strong> image is actually <strong>${targetUp}</strong>.</p>`;
    const explanation = correctItem.explanation
      ? `<p class="explain">${correctItem.explanation}</p>`
      : "";
    const message = statusText + explanation;

    openModal(title, message, [
      {
        label: "Next Question",
        variant: "primary",
        onClick: () => {
          closeModal();
          onNext();
        },
      },
    ]);
  }

  function onNext() {
    state.index += 1;
    if (state.index >= state.questions.length) {
      if (state.answers.every((a) => a.correct)) state.score = 100;
      toResults();
    } else {
      render();
    }
  }

  // Main render router
  function render() {
    if (state.screen === "landing") {
      renderLanding(
        app,
        () => {
          playSound("click");
          state.screen = "bossMenu";
          render();
        },
        () => {
          playSound("click");
          openModal(
            "How to Play",
            `
            <h3>🎮 Game Overview</h3>
            <p>You are a cybersecurity trainee fighting against 4 powerful scam bosses. Each boss specializes in a different type of online threat</p>
            <ul>
              <li><strong>🌐 Website Phishing Boss</strong> - Fake websites and phishing pages</li>
              <li><strong>📧 SMS/Email Scam Boss</strong> - Fraudulent messages and emails</li>
              <li><strong>🎥 Video Deepfake Boss</strong> - Manipulated and fake videos</li>
              <li><strong>🤖 AI Image Boss</strong> - AI-generated fake images</li>
            </ul>
            
            <h3>⚔️ How to Battle</h3>
            <p>Each boss will test you with their scam content. You must identify what's <strong>REAL</strong> and what's <strong>FAKE</strong>.</p>
            
            <h3>🏆 Victory Rewards</h3>
            <p>Challenge any boss in any order! Beat all 4 bosses to become a <strong>Master Scam Hunter</strong>! 👑</p>
          `,
            [
              {
                label: "Start Playing!",
                variant: "primary",
                onClick: () => {
                  closeModal();
                  state.screen = "bossMenu";
                  render();
                },
              },
              { label: "Close", variant: "outline", onClick: closeModal },
            ]
          );
        },
        () => {
          playSound("click");
          openModal(
            "Credits & Information",
            `
            <h3>🎮 CyberQuest - Scam Detection Training Game</h3>
            <p>An educational game designed to help you identify online scams, phishing attempts, deepfakes, and AI-generated content.</p>
            
            <h3>🎯 Educational Purpose</h3>
            <p>This game trains you to recognize:</p>
            <ul>
              <li>Fake websites and phishing pages</li>
              <li>Fraudulent emails and SMS messages</li>
              <li>Deepfake videos and manipulated media</li>
              <li>AI-generated fake images</li>
            </ul>
            
            <h3>🛡️ Privacy & Data</h3>
            <p>All game data is loaded locally from CSV files. No tracking, no data collection. Your learning stays private.</p>
          `
          );
        }
      );
    } else if (state.screen === "bossMenu") {
      renderBossMenu(
        app,
        (bossId, unlocked) => {
          // All bosses are now unlocked, no need to check
          startBoss(bossId);
        },
        () => {
          playSound("click");
          state.screen = "landing";
          render();
        }
      );
    } else if (state.screen === "quiz") {
      renderQuiz(app, onGuessSingle, onGuessPair, () => {
        playSound("click");
        toMenu();
      });
    } else if (state.screen === "results") {
      renderResults(
        app,
        () => {
          playSound("click");
          toMenu();
        },
        async () => {
          playSound("click");
          const text = `I scored ${state.score}/100 on CyberQuest! Can you beat me?`;
          try {
            if (navigator.share) {
              await navigator.share({
                title: "CyberQuest — Image Quiz",
                text,
                url: location.href,
              });
            } else {
              await navigator.clipboard.writeText(`${text} ${location.href}`);
              openModal("Share", "<p>Share text copied to clipboard!</p>");
            }
          } catch (_) {}
        },
        () => {
          playSound("click");
          showHistory();
        }
      );
    }
  }

  // Keyboard shortcuts
  window.addEventListener("keydown", (e) => {
    if (state.screen === "landing") {
      if (e.key === "Enter") {
        state.screen = "bossMenu";
        render();
      }
      return;
    }
    if (state.screen !== "quiz") return;
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
  });

  // Initialize
  render();
})();
