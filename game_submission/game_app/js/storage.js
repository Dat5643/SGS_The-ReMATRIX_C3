// LocalStorage helpers

const LS_KEY_HISTORY = "rof_play_history";
const LS_KEY_BOSS = "rof_boss_progress";

export function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_KEY_HISTORY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}

export function saveHistory(arr) {
  try {
    localStorage.setItem(LS_KEY_HISTORY, JSON.stringify(arr));
  } catch (_) {}
}

export function addHistory(entry) {
  const arr = loadHistory();
  arr.unshift(entry);
  if (arr.length > 50) arr.length = 50; // cap size
  saveHistory(arr);
}

export function clearHistory() {
  try {
    localStorage.removeItem(LS_KEY_HISTORY);
  } catch (_) {}
}

export function loadBossProgress() {
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

export function saveBossProgress(p) {
  try {
    localStorage.setItem(LS_KEY_BOSS, JSON.stringify(p));
  } catch (_) {}
}
