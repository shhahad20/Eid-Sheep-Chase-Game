# Eid Sheep Chase 🐑

A fast-paced top-down browser game built entirely with vanilla JavaScript, HTML5 Canvas, and the Web Audio API — no external dependencies.

Chase and catch all the sheep before the timer runs out. Collect coins, power-ups, and dates along the way. Each level gets harder!

Bilingual: English / Arabic.

---

## Features

- Pixel-art style procedurally generated graphics (no image assets)
- Procedurally generated sound effects (Web Audio API, no audio files)
- 4+ levels with increasing difficulty and sheep count
- Collectibles: coins, dates (stamina restore), stars (bonus points)
- Power-ups: Rope (slows sheep), Sprint Shoes (speed boost), Magnet (attracts coins)
- AI Helper companion (summon with H key from Level 2+, costs 5 coins)
- Minimap, off-screen sheep arrows, screen shake, particle effects
- High-score leaderboard persisted in localStorage (top 10)
- Bilingual UI (Arabic / English toggle) with RTL text support
- Mobile-friendly: virtual joystick + sprint button for touch devices

---

## Controls

| Action        | Keys                        |
|---------------|-----------------------------|
| Move          | Arrow Keys or WASD          |
| Sprint        | Space / Shift (drains stamina) |
| Pause         | P or Escape                 |
| Call Helper   | H (Level 2+, costs 5 coins) |

---

## Installation & Running

No build step required. The game runs directly in any modern browser that supports ES Modules.

**Option 1 — VS Code Live Server (recommended)**
1. Open the `EidGame/` folder in VS Code.
2. Right-click `index.html` → **Open with Live Server**.

**Option 2 — Python HTTP server**
```bash
cd EidGame
python -m http.server 8080
# then open http://localhost:8080
```

**Option 3 — Node `serve`**
```bash
npx serve EidGame
```

> **Note:** ES Modules require a local HTTP server. Opening `index.html` directly as a `file://` URL will not work due to browser CORS restrictions.

---

## Project Structure

```
EidGame/
├── index.html          # Game shell — canvas, overlays, mobile controls
├── style.css           # Styling for canvas, HUD, mobile controls, overlays
├── game.js             # Original monolithic source (kept for reference)
└── src/                # Refactored modular source
    ├── main.js         # Entry point — boots the Game on window load
    ├── game.js         # Core game loop, state machine, level management
    ├── constants.js    # CONFIG, COLORS, STATE enums
    ├── language.js     # Bilingual strings (EN/AR), T() lookup, setLang()
    ├── audio.js        # Web Audio engine, procedural SFX, audio singleton
    ├── utils.js        # Vec2, rectOverlap, clamp, _dist, _darker helpers
    ├── camera.js       # Smooth-follow camera with screen-shake
    ├── particles.js    # Particle emitter (dust, coin, catch effects)
    ├── map.js          # Procedural world map — roads, decorations, houses
    ├── obstacle.js     # Cars, carts, puddles, barriers, wandering children
    ├── collectible.js  # Coins, dates, stars — pickup logic and drawing
    ├── powerup.js      # Rope, Sprint Shoes, Magnet — logic and drawing
    ├── player.js       # Player movement, stamina, collision, rendering
    ├── sheep.js        # Sheep AI — flee, wander, evasive dash, rope slow
    ├── helper.js       # AI companion — chases sheep, TTL bar
    ├── ui.js           # All screen drawing: HUD, menus, overlays, minimap
    ├── storage.js      # localStorage read/write for high-score table
    └── input.js        # Keyboard state, mobile joystick, stuck-key fix
```

---

## Gameplay

**Objective:** Catch every sheep before the timer expires.

| Level | Sheep | Time  |
|-------|-------|-------|
| 1     | 1     | 65 s  |
| 2     | 2     | 77 s  |
| 3     | 3     | 89 s  |
| 4+    | 4     | 101 s+|

**Scoring:**
- Catch sheep: 300 + level × 50 pts
- Helper catch: 150 + level × 25 pts
- Gold coin: 10 pts
- Star: 50 pts
- Power-up collected: 20 pts
- Level clear bonus: 200 + (seconds remaining × 8) + level × 100 pts

---

## Future Enhancements

- Additional levels with new obstacle types
- Day/night cycle with dynamic lighting
- Multiplayer (local or online)
- Sound toggle / volume control
- Animated sprite sheets for characters

---

## Credits

Developed by **Shahad Altharwa**
- GitHub: [github.com/shhahad20](https://github.com/shhahad20)
- LinkedIn: [linkedin.com/in/shahadaltharwa](https://www.linkedin.com/in/shahadaltharwa/)

© 2026
