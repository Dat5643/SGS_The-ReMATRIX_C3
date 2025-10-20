# 🎮 Boss Dialogue System - Quick Reference

## 📋 Tổng quan hệ thống

### ✅ Đã implement đầy đủ:

1. **Intro Dialogue** - Modal khi bắt đầu boss fight
2. **Reaction Toast** - Random comment trong lúc chơi (30% chance)
3. **Ending Dialogue** - Modal khi kết thúc (victory/defeat)

---

## 🎯 Boss Dialogue Types:

| Type          | When                   | Format                | Examples                           |
| ------------- | ---------------------- | --------------------- | ---------------------------------- |
| **intro**     | Khi bắt đầu boss fight | Modal (3 lines)       | "Think you can spot my creations?" |
| **onWrong**   | Khi trả lời sai        | Toast (random 1 line) | "HAH! Too easy!"                   |
| **onCorrect** | Khi trả lời đúng       | Toast (random 1 line) | "Lucky guess..."                   |
| **victory**   | Thắng boss (10/10)     | Modal (3 lines)       | "IMPOSSIBLE!"                      |
| **defeat**    | Thua boss (<10)        | Modal (3 lines)       | "AHAHAHAHA!"                       |

---

## 🔊 Dialogue Lines:

### AI Scam Boss:

**Intro:**

```
"So... another human thinks they can spot my creations?"
"My AI-generated faces are FLAWLESS. Indistinguishable from reality."
"You'll never catch them all. Let's see how long you last..."
```

**On Wrong:**

```
"HAH! Too easy!"
"My fakes are perfection!"
"You fell right into my trap!"
"Can't tell the difference, can you?"
```

**On Correct:**

```
"Lucky guess..."
"That was just a warm-up."
"You won't get the next one."
"Hmph... beginner's luck."
```

**Victory:**

```
"IMPOSSIBLE!"
"How... how did you see through ALL of them?!"
"You've beaten me... for now. But I'll return with better fakes!"
```

**Defeat:**

```
"AHAHAHAHA!"
"As expected! Humans are NO match for my AI mastery!"
"Better luck next time... if you dare to challenge me again!"
```

---

## 🎨 Visual Elements:

### Modal Dialogue:

- Boss portrait (180x180px)
- Cyber green border with glow
- Name tag (uppercase, green)
- Dialogue text with left border accent

### Toast Notification:

- Bottom-right corner
- Slide-in animation
- 3 second duration
- 30% chance to appear
- Shows boss name + message

---

## 🛠️ Code Structure:

### Main Functions:

```javascript
// Show modal dialogue
showBossDialogue(bossId, type, callback);

// Get random line for toast
getRandomDialogue(bossId, type);
```

### Integration Points:

```javascript
// 1. Intro - in startBossAI()
showBossDialogue("AIboss", "intro", () => {
  state.screen = "quiz";
  render();
});

// 2. Reactions - in onGuessSingle() and onGuessPair()
if (state.boss && Math.random() <= 1) {
  const reaction = getRandomDialogue(
    state.boss,
    correct ? "onCorrect" : "onWrong"
  );
  // Show toast...
}

// 3. Ending - in toResults()
showBossDialogue(state.boss, win ? "victory" : "defeat", () => {
  state.screen = "results";
  render();
});
```

---

## 🎯 Settings:

| Setting        | Value        | Location                           |
| -------------- | ------------ | ---------------------------------- |
| Toast chance   | 30%          | `onGuessSingle()`, `onGuessPair()` |
| Toast duration | 3000ms       | Toast setTimeout                   |
| Toast delay    | 800ms        | Before showing toast               |
| Animation      | cubic-bezier | CSS `.boss-toast`                  |

---

## 📱 Responsive:

- Desktop: Toast bottom-right (30px from edges)
- Mobile: Toast full width (20px from edges)
- Portrait size: 180px desktop, 140px mobile

---

## 🚀 Easy Extension:

Để thêm boss mới, chỉ cần:

1. Add to `bossDialogues` object:

```javascript
newboss: {
  name: "New Boss Name",
  intro: ["line1", "line2", "line3"],
  onWrong: ["taunt1", "taunt2", "taunt3", "taunt4"],
  onCorrect: ["reaction1", "reaction2", "reaction3", "reaction4"],
  victory: ["defeat1", "defeat2", "defeat3"],
  defeat: ["win1", "win2", "win3"]
}
```

2. Call `startBoss("newboss")` when selected

That's it! System tự động xử lý tất cả! ✨
