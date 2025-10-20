# Game Submission

Real or Fake? — Image Authenticity Quiz

## Overview (Mô tả tổng quan)
- A fast, 2D web quiz that shows an image and asks you to decide: Real photograph or AI-generated? It raises awareness of visual misinformation and teaches quick heuristics for spotting fakes.
- Target: General audience in Vietnam/Australia; media literacy for students and communities.

## How To Run (Cách chạy)
- Option A: Double‑click `game_app/index.html` to open in a modern browser (Chrome, Edge, Firefox, Safari).
- Option B: Serve the `game_app/` folder with any static server (e.g., `npx serve game_submission/game_app`).

## Gameplay (Mô tả gameplay)
- Menu → Play up to 10 questions → Results screen with score out of 100.
- Controls: Click buttons or use keyboard shortcuts: `R` = Real, `F` = Fake, `Enter` = Next.
- When you answer incorrectly, the game shows a short explanation with cues to look for (e.g., warped backgrounds, mismatched earrings, odd text).

## Tech Stack (Công nghệ)
- Web: HTML, CSS, JavaScript (no backend).
- Assets: Demo dataset uses RandomUser (real portraits) and ThisPersonDoesNotExist (AI).

## Customize Dataset (Tuỳ chỉnh dữ liệu)
- Edit `game_app/js/main.js` and update the `DATA` array with your curated images. Example object:
  ```js
  { id: "my1", url: "assets/images/my_photo.jpg", label: "real", source: "your-source.com", explain: "Why this is real/fake" }
  ```
- Keep up to 10 questions (config `MAX_QUESTIONS`) and ensure each object has:
  - `id` – unique string
  - `url` – image URL (local or remote)
  - `label` – `"real"` or `"fake"`
  - `source` – short credit/domain
  - `explain` – a short explanation for wrong answers

## Reflection (Bài học & cải tiến)
- Future ideas: add timed rounds, difficulty tiers, multi‑topic packs (climate, scams, deepfakes), and a review mode with side‑by‑side comparisons and annotations.
