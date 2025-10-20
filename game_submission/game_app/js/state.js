// Game state management

export const state = {
  screen: "landing", // landing | menu | bossMenu | quiz | results
  questions: [], // shuffled sample of DATA
  index: 0,
  score: 0, // 0..100
  answers: [], // { id, guess, correct }
  startTime: 0, // ms timestamp when a run starts
  boss: null, // null | 'AIboss' | 'smsboss' | 'videoboss' | 'webBoss'
};

export function resetState() {
  state.questions = [];
  state.index = 0;
  state.score = 0;
  state.answers = [];
  state.startTime = Date.now();
}
