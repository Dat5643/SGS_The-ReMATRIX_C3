# Sound Effects Guide

## Current Sound Files

- `correct.mp3` - Played when the player answers correctly
- `wrong.mp3` - Played when the player answers incorrectly

## Sound Implementation

### When Sounds Are Played:

1. **Correct Answer**: `correct.mp3` plays when player guesses correctly
2. **Wrong Answer**: `wrong.mp3` plays when player guesses incorrectly
3. **Menu Clicks**: `correct.mp3` is reused for button clicks (you can add a separate `click.mp3` for better effect)

### Adding a Custom Click Sound (Recommended):

If you want a different sound for button clicks:

1. Add a file named `click.mp3` to this folder
2. The code will automatically use it for all menu button clicks
3. Keep it short (< 0.5 seconds) for better UX

### Sound Settings:

- **Volume**: 50% (0.5) - can be adjusted in code
- **Preload**: All sounds are preloaded when the page loads
- **Format**: MP3 (supported by all modern browsers)

### Troubleshooting:

If sounds don't play:

- Check browser console for errors
- Make sure audio files are not corrupted
- Some browsers block autoplay - user interaction is required first
- File paths must be correct: `assets/sound/filename.mp3`

## Adding More Sounds

To add new sound effects:

1. Place the MP3 file in this folder
2. Add it to the `sounds` object in `main.js`:
   ```javascript
   const sounds = {
     correct: new Audio("assets/sound/correct.mp3"),
     wrong: new Audio("assets/sound/wrong.mp3"),
     click: new Audio("assets/sound/click.mp3"), // Add your new sound
     victory: new Audio("assets/sound/victory.mp3"), // Example
   };
   ```
3. Use `playSound("soundName")` to play it anywhere in the code
