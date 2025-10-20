// Game configuration and constants
export const MAX_QUESTIONS = 10;
export const BOSS_WIN_MIN_CORRECT = 8; // must get 8/10 to clear a boss

// Data set: real portraits from RandomUser vs AI faces from ThisPersonDoesNotExist
export const DATA = [
  {
    id: "r1",
    url: "https://randomuser.me/api/portraits/men/11.jpg",
    label: "real",
    source: "randomuser.me",
    explain: "This is a real portrait from RandomUser's public dataset.",
  },
  {
    id: "f1",
    url: "https://thispersondoesnotexist.com/image?seed=f1",
    label: "fake",
    source: "thispersondoesnotexist.com",
    explain:
      "AI-generated face. Look for subtle asymmetry, warped backgrounds, and odd earrings.",
  },
  {
    id: "r2",
    url: "https://randomuser.me/api/portraits/women/31.jpg",
    label: "real",
    source: "randomuser.me",
    explain:
      "Genuine photograph; you'll often see consistent background and natural skin texture.",
  },
  {
    id: "f2",
    url: "https://thispersondoesnotexist.com/image?seed=f2",
    label: "fake",
    source: "thispersondoesnotexist.com",
    explain:
      "GAN artifacts may appear in hair, glasses, or patterned clothing.",
  },
  {
    id: "r3",
    url: "https://randomuser.me/api/portraits/men/21.jpg",
    label: "real",
    source: "randomuser.me",
    explain:
      "Real person. Lighting and reflections tend to be consistent across features.",
  },
  {
    id: "f3",
    url: "https://thispersondoesnotexist.com/image?seed=f3",
    label: "fake",
    source: "thispersondoesnotexist.com",
    explain: "Backgrounds can be smeared; jewelry may not match between ears.",
  },
  {
    id: "r4",
    url: "https://randomuser.me/api/portraits/women/12.jpg",
    label: "real",
    source: "randomuser.me",
    explain: "A real portrait from a stock-like dataset used for demos.",
  },
  {
    id: "f4",
    url: "https://thispersondoesnotexist.com/image?seed=f4",
    label: "fake",
    source: "thispersondoesnotexist.com",
    explain:
      "Teeth spacing and text on clothing can look unnatural in AI images.",
  },
  {
    id: "r5",
    url: "https://randomuser.me/api/portraits/men/45.jpg",
    label: "real",
    source: "randomuser.me",
    explain:
      "Real image: shadows align with light direction; eyes reflect consistent shapes.",
  },
  {
    id: "f5",
    url: "https://thispersondoesnotexist.com/image?seed=f5",
    label: "fake",
    source: "thispersondoesnotexist.com",
    explain:
      "Try spotting mismatched earrings, distorted hands, or melting textures.",
  },
  {
    id: "r6",
    url: "https://randomuser.me/api/portraits/women/55.jpg",
    label: "real",
    source: "randomuser.me",
    explain:
      "Genuine photograph with natural hair edges and realistic skin details.",
  },
  {
    id: "f6",
    url: "https://thispersondoesnotexist.com/image?seed=f6",
    label: "fake",
    source: "thispersondoesnotexist.com",
    explain:
      "AI faces sometimes show glass frames blending into skin or floating artifacts.",
  },
];
