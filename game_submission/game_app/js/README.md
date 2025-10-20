# CyberQuest - Refactored Code Structure

## 📁 File Organization

Code đã được tách từ 1 file `main.js` lớn thành nhiều module nhỏ để dễ quản lý:

### Core Modules

- **config.js** - Constants và game configuration

  - `MAX_QUESTIONS`, `BOSS_WIN_MIN_CORRECT`
  - `DATA` array (legacy, sẽ được CSV thay thế)

- **utils.js** - Utility functions

  - `qs()` - Query selector shorthand
  - `el()` - Create element helper
  - `shuffle()` - Array shuffling
  - `scoreClass()` - Score styling helper
  - `safeHost()` - URL parsing

- **state.js** - Game state management

  - `state` object (screen, questions, score, etc.)
  - `resetState()` - Reset game state

- **sound.js** - Sound system
  - `playSound()` - Play audio effects
  - Preload all sounds

### Data & Storage

- **data.js** - Data loading và CSV parsing

  - `parseCSV()` - Parse CSV files
  - `loadData()` - Load items and pairs from CSV
  - Data caching

- **storage.js** - LocalStorage helpers
  - `loadHistory()`, `saveHistory()`, `addHistory()`, `clearHistory()`
  - `loadBossProgress()`, `saveBossProgress()`

### UI Components

- **modal.js** - Modal system

  - `openModal()` - Show modal dialogs
  - `closeModal()` - Close active modal
  - Keyboard accessibility (ESC key)

- **bosses.js** - Boss dialogue system

  - `bossDialogues` - All boss dialogues
  - `showBossDialogue()` - Display boss dialogue
  - `getRandomDialogue()` - Random boss reactions

- **renders.js** - All render functions
  - `renderLanding()` - Landing page
  - `renderBossMenu()` - Boss selection
  - `renderQuiz()` - Quiz gameplay
  - `renderResults()` - Results screen
  - `showHistory()` - History modal

### Main Entry Point

- **main-new.js** - Game logic và orchestration
  - Import tất cả modules
  - Boss battle starters
  - Guess handlers
  - Main render router
  - Keyboard shortcuts
  - Initialize game

## 🔄 How It Works

1. **HTML** loads `main-new.js` as ES6 module (`type="module"`)
2. **main-new.js** imports các modules cần thiết
3. Mỗi module export functions/objects mà nó quản lý
4. Code được tổ chức theo chức năng thay vì tất cả trong 1 file

## ✅ Benefits

- **Dễ đọc**: Mỗi file có 1 trách nhiệm cụ thể
- **Dễ maintain**: Sửa bug chỉ cần vào đúng module
- **Dễ test**: Có thể test từng module riêng
- **Dễ scale**: Thêm features mới không làm file quá dài
- **Reusability**: Các utility functions có thể dùng lại

## 🚀 Usage

Để sử dụng code mới:

1. File `index.html` đã được update để load `main-new.js`
2. Browser sẽ tự động load tất cả dependencies
3. No build step required - native ES6 modules!

## 📝 Notes

- File `main.js` cũ vẫn còn để tham khảo
- Có thể xóa `main.js` sau khi test `main-new.js` hoạt động tốt
- Tất cả các modules sử dụng ES6 `import/export` syntax
