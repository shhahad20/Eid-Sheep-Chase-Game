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
- Online leaderboard via Supabase (top 10, score DESC) with automatic localStorage fallback
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

## Supabase Leaderboard Setup

The game ships with a **graceful fallback**: if Supabase is not configured, scores are stored in `localStorage` only. To enable the online leaderboard, follow these steps.

### 1 — Create the `high_scores` table

Run this SQL in your Supabase project's **SQL Editor**:

```sql
create table if not exists public.high_scores (
  id          uuid primary key default gen_random_uuid(),
  player_name text        not null check (char_length(player_name) <= 20),
  score       integer     not null default 0,
  level       integer     not null default 1,
  coins       integer     not null default 0,
  created_at  timestamptz not null default now()
);
```

### 2 — Enable Row Level Security

```sql
-- Enable RLS on the table
alter table public.high_scores enable row level security;

-- Anyone can read the leaderboard
create policy "public read"
  on public.high_scores
  for select
  using (true);

-- Anyone can submit a score
create policy "public insert"
  on public.high_scores
  for insert
  with check (true);
```

### 3 — Add your credentials

Open [src/config.js](src/config.js) and replace the placeholder values with your project's URL and anon key (found in **Project Settings → API** on supabase.com):

```js
export const SUPABASE_URL      = 'https://your-project-ref.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

> **Security note:** The anon key is designed to be public. It is safe to commit and expose in client-side code because all access is gated by the RLS policies above. **Never** use your `service_role` key in the browser.

### How it works

| Condition | Behaviour |
|-----------|-----------|
| Supabase configured | Scores submitted to the cloud; top-10 fetched from Supabase |
| Supabase unavailable / not configured | Scores saved to `localStorage`; leaderboard shows local scores |
| Fetch fails at runtime | Falls back to local scores; error notice displayed in the leaderboard screen |

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
    ├── input.js        # Keyboard state, mobile joystick, stuck-key fix
    ├── config.js       # Supabase credentials (replace with your own)
    ├── supabase.js     # Supabase client singleton (null when unconfigured)
    └── leaderboard.js  # submitScore + fetchTopScores with localStorage fallback
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
