# Hidden Leaf Village Explorer

This project is a browser-playable 3D Konoha-inspired street prototype using Three.js. It keeps the original simple project structure while adding a more polished street, better player movement, a third-person camera, and a more anime-inspired humanoid placeholder.

## Run locally

1. Install dependencies:
   npm install
2. Start the dev server:
   npm run dev
3. Open the local URL shown in the terminal (typically http://localhost:5173)

## Controls

- W A S D: move
- Shift: sprint
- Space: jump
- Mouse: look / camera orbit
- Click the message overlay to capture pointer lock

## Recommended free asset sources

These are the best free sources I found for a realistic next step if you want to replace the placeholder shinobi model and environment props with actual rigged / modular assets:

- Cinevva – free 3D character models: https://app.cinevva.com/game-assets/free-3d-character-models
  - Good CC0 / permissive starting point for anime-style characters.
- Meshy – anime / manga models: https://meshy.ai/category/anime-manga
  - Good source for rigged anime humanoid models and GLB exports.
- Poly Pizza – environment props and Japanese-inspired assets: https://poly.pizza/
  - Search for "japanese house", "pagoda", "lantern", "roof", "temple".
- AutoSprite – free 3D game models: https://autosprite.io/free-3d-models
  - Good props / lightweight environment files.
- KayKit adventure packs: https://kaylousberg.itch.io/kaykit-character-pack-adventurers
  - Not anime-specific but very clean and easy to use in games.

## Asset integration note

The current project intentionally includes a procedural anime-style humanoid fallback so the scene runs immediately without requiring external downloads. The recommended asset links above are for a later upgrade when you want a rigged GLB character and modular Japanese village props.

## What changed

- Kept the original project structure and simple scene setup.
- Added a more believable Konoha-inspired street layout.
- Swapped the box player for a stylized humanoid placeholder with body proportions and limb animation.
- Added third-person camera follow, walking/running movement, jump, gravity, and simple obstacle blocking.
- Added a lightweight collision system to keep the player from walking through buildings.
- Added Vite for local development and a clean project setup.

## Known limitations

- The player is a handcrafted placeholder rather than a final rigged external model.
- Environment props are modular and stylized rather than a full free asset pack integration yet.
- Camera and collision are intentionally simple and stable for the first milestone.
