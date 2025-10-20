# ✅ Boss Dialogue System - Testing Checklist

## 🧪 Test Cases

### Test 1: Boss Intro Dialogue

- [ ] Open game
- [ ] Click "Play Now"
- [ ] Click "AI Scam Boss"
- [ ] **Expected**: Modal appears with boss portrait and 3 intro lines
- [ ] Click "Begin Battle!"
- [ ] **Expected**: Modal closes and quiz starts

### Test 2: Boss Reaction Toast (Wrong Answer)

- [ ] Play AI Boss mode
- [ ] Intentionally answer wrong
- [ ] **Expected**: 30% chance to see toast notification from bottom-right
- [ ] Toast shows: "AI Scam Boss: [random wrong message]"
- [ ] **Expected**: Toast disappears after 3 seconds
- [ ] Try 10 wrong answers, should see ~3 toasts

### Test 3: Boss Reaction Toast (Correct Answer)

- [ ] Play AI Boss mode
- [ ] Answer correctly
- [ ] **Expected**: 30% chance to see toast notification
- [ ] Toast shows: "AI Scam Boss: [random correct message]"
- [ ] **Expected**: Toast disappears after 3 seconds
- [ ] Try 10 correct answers, should see ~3 toasts

### Test 4: Boss Victory Dialogue

- [ ] Play AI Boss mode
- [ ] Get 10/10 correct (use cheat or be good!)
- [ ] **Expected**: Modal appears with boss defeat dialogue
- [ ] Shows 3 lines: "IMPOSSIBLE!", "How did you...", "You've beaten me..."
- [ ] Click "Continue"
- [ ] **Expected**: Goes to results screen

### Test 5: Boss Defeat Dialogue

- [ ] Play AI Boss mode
- [ ] Get less than 10 correct (e.g., 8/10)
- [ ] **Expected**: Modal appears with boss victory dialogue
- [ ] Shows 3 lines: "AHAHAHAHA!", "As expected!", "Better luck..."
- [ ] Click "Continue"
- [ ] **Expected**: Goes to results screen

### Test 6: Toast Animation

- [ ] Trigger a boss reaction
- [ ] **Expected**: Toast slides in from right with smooth animation
- [ ] **Expected**: Toast stays for exactly 3 seconds
- [ ] **Expected**: Toast slides out smoothly

### Test 7: Multiple Toasts (Edge Case)

- [ ] Play boss mode
- [ ] Answer quickly to trigger multiple toasts
- [ ] **Expected**: Toasts don't overlap
- [ ] **Expected**: Previous toast removed before new one appears

### Test 8: Mobile Responsiveness

- [ ] Resize browser to mobile size (<720px)
- [ ] Test intro dialogue
- [ ] **Expected**: Boss portrait smaller (140px)
- [ ] Test toast notification
- [ ] **Expected**: Toast full width at bottom

### Test 9: Sound Integration

- [ ] Play boss mode
- [ ] Answer correctly
- [ ] **Expected**: Correct sound plays + possible boss reaction
- [ ] Answer incorrectly
- [ ] **Expected**: Wrong sound plays + possible boss reaction
- [ ] **Expected**: No sound plays from toast itself

### Test 10: Boss Progress Unlock

- [ ] Complete boss with 10/10
- [ ] **Expected**: Victory dialogue shows
- [ ] Return to boss menu
- [ ] **Expected**: Next boss (SMS) shows as unlocked (or "coming soon")

---

## 🐛 Known Issues / Notes:

- [ ] Toast has 30% chance - may not appear every time (this is by design)
- [ ] Multiple rapid answers may cause toast overlap (handled with remove before add)
- [ ] Long boss messages may wrap on small screens (handled with max-width)

---

## 🎯 Performance Check:

- [ ] No console errors when boss dialogue appears
- [ ] No memory leaks from toast elements (auto-removed)
- [ ] Smooth 60fps animations
- [ ] Modal closes properly without lingering overlays

---

## 🎨 Visual Check:

- [ ] Boss portrait has green glow effect
- [ ] Dialogue text readable on dark background
- [ ] Toast has proper spacing and padding
- [ ] Animations smooth (cubic-bezier easing)
- [ ] Colors match theme (cyber green accent)

---

## 📱 Cross-browser Test:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

---

## ✨ Extra Features to Notice:

- Boss name in toast is uppercase with letter-spacing
- Boss portrait border glows with shadow
- Dialogue lines have left accent border
- Toast has entrance/exit animations
- Modal has backdrop blur effect
- Responsive design adapts to screen size

---

## 🚀 Quick Debug:

If dialogue not showing:

```javascript
// Check boss dialogue data loaded
console.log(bossDialogues);

// Force show intro
showBossDialogue("AIboss", "intro");

// Force show toast
const toast = el("div", "boss-toast", "<strong>TEST:</strong> This is a test");
document.body.appendChild(toast);
setTimeout(() => toast.classList.add("show"), 10);
```

If toast not animating:

- Check CSS `.boss-toast` and `.boss-toast.show` classes exist
- Check z-index: 100 (not covered by other elements)
- Check `transition` property in CSS

---

**Status**: All features implemented and ready for testing! 🎉
**Last Updated**: 2025-10-20
