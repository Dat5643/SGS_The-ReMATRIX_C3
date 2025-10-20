// Boss dialogue system
import { openModal, closeModal } from "./modal.js";

export const bossDialogues = {
  AIboss: {
    name: "AI Image Boss",
    intro: [
      "So... another human thinks they can spot my creations?",
      "My AI-generated faces are FLAWLESS. Indistinguishable from reality.",
      "You'll never catch them all. Let's see how long you last...",
    ],
    onWrong: [
      "HAH! Too easy!",
      "My fakes are perfection!",
      "You fell right into my trap!",
      "Can't tell the difference, can you?",
    ],
    onCorrect: [
      "Lucky guess...",
      "That was just a warm-up.",
      "You won't get the next one.",
      "Hmph... beginner's luck.",
    ],
    victory: [
      "IMPOSSIBLE!",
      "How... how did you see through ALL of them?!",
      "You've beaten me... for now. But I'll return with better fakes!",
    ],
    defeat: [
      "AHAHAHAHA!",
      "As expected! Humans are NO match for my AI mastery!",
      "Better luck next time... if you dare to challenge me again!",
    ],
  },
  smsboss: {
    name: "SMS/Email Scam Boss",
    intro: [
      "Your bank account needs urgent verification!",
      "Click here to claim your prize!",
      "Wait... you think you can spot MY scams? Good luck with that.",
    ],
    onWrong: [
      "Gotcha!",
      "Hook, line, and sinker!",
      "Too tempting to resist?",
      "You clicked it, didn't you?",
    ],
    onCorrect: [
      "Tch... skeptical one.",
      "Fine, that was too obvious.",
      "Don't get cocky.",
      "Next one will get you.",
    ],
    victory: [
      "What?! Impossible!",
      "No one resists ALL my messages!",
      "You... you're too cautious! This isn't over!",
    ],
    defeat: [
      "HAHAHA! Another victim!",
      "My scams are irresistible!",
      "Better luck next time... if there is one!",
    ],
  },
  videoboss: {
    name: "Video Deepfake Boss",
    intro: [
      "Welcome to the age of deepfakes, mortal.",
      "Can you tell which videos are real... and which are my masterpieces?",
      "Every frame, every pixel... could be a lie.",
    ],
    onWrong: [
      "My deepfakes are flawless!",
      "You can't trust your eyes!",
      "Reality is what I make it!",
      "Fooled you completely!",
    ],
    onCorrect: [
      "A lucky catch...",
      "That one had a glitch.",
      "You won't spot them all.",
      "Hmph... just a fluke.",
    ],
    victory: [
      "NO! How did you see through them?!",
      "My deepfakes were perfect!",
      "This... this can't be! I'll return with better technology!",
    ],
    defeat: [
      "AHAHAHA! Can't tell reality from fiction!",
      "My deepfakes reign supreme!",
      "Welcome to MY reality!",
    ],
  },
  webBoss: {
    name: "Website Phishing Boss",
    intro: [
      "Welcome to my web... of DECEPTION!",
      "Every link, every page... could be a trap.",
      "One wrong click... and you're MINE!",
    ],
    onWrong: [
      "Trapped in my web!",
      "Too easy! You trusted that link?",
      "My fake sites are PERFECT!",
      "You fell for it!",
    ],
    onCorrect: [
      "Lucky guess.",
      "That one was too obvious.",
      "You won't catch them all.",
      "Tch... just wait.",
    ],
    victory: [
      "WHAT?! How did you avoid ALL my traps?!",
      "No one escapes my web so easily!",
      "You... you're too careful! This isn't the end!",
    ],
    defeat: [
      "HAHAHA! Another victim caught!",
      "My phishing sites are UNSTOPPABLE!",
      "Better check your URLs next time... if you dare!",
    ],
  },
};

export function showBossDialogue(bossId, type = "intro", callback = null) {
  const boss = bossDialogues[bossId];
  if (!boss || !boss[type]) return callback?.();

  const lines = boss[type];
  const dialogueHTML = `
    <div class="boss-dialogue">
      <div class="boss-portrait">
        <img src="assets/boss/${bossId}.webp" alt="${boss.name}"/>
      </div>
      <div class="dialogue-box">
        <div class="boss-name-tag">${boss.name}</div>
        <div class="dialogue-text">${lines
          .map((line) => `<p>${line}</p>`)
          .join("")}</div>
      </div>
    </div>
  `;

  openModal(`${boss.name} Appears!`, dialogueHTML, [
    {
      label: type === "intro" ? "Begin Battle!" : "Continue",
      variant: "primary",
      onClick: () => {
        closeModal();
        if (callback) setTimeout(callback, 100);
      },
    },
  ]);
}

export function getRandomDialogue(bossId, type) {
  const boss = bossDialogues[bossId];
  if (!boss || !boss[type] || !Array.isArray(boss[type])) return null;
  return boss[type][Math.floor(Math.random() * boss[type].length)];
}
