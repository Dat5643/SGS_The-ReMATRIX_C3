// Sound system

const sounds = {
  correct: new Audio("assets/sound/correct.mp3"),
  wrong: new Audio("assets/sound/wrong.mp3"),
  click: new Audio("assets/sound/correct.mp3"), // Reuse correct sound for clicks
};

// Preload all sounds
Object.values(sounds).forEach((audio) => {
  audio.preload = "auto";
  audio.volume = 0.5; // 50% volume
});

export function playSound(name) {
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
