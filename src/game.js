import { CONFIG, STATE } from "./constants.js";
import { LANG, T, setLang } from "./language.js";
import { audio } from "./audio.js";
import { _dist } from "./utils.js";
import { Camera } from "./camera.js";
import { Particles } from "./particles.js";
import { GameMap } from "./map.js";
import { Obstacle } from "./obstacle.js";
import { Collectible } from "./collectible.js";
import { PowerUp } from "./powerup.js";
import { Player } from "./player.js";
import { Sheep } from "./sheep.js";
import { Helper } from "./helper.js";
import { UI } from "./ui.js";
import { loadScores, saveScore } from "./storage.js";
import {
  submitScore,
  fetchTopScores,
  localScoresToEntries,
} from "./leaderboard.js";
import { InputHandler } from "./input.js";

export class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.canvas.width = CONFIG.CANVAS_W;
    this.canvas.height = CONFIG.CANVAS_H;
    const W = CONFIG.CANVAS_W,
      H = CONFIG.CANVAS_H;

    this.state = STATE.MENU;
    this.level = 1;
    this.score = 0;
    this.coins = 0;
    this.timer = CONFIG.LEVEL_TIME;
    this.time = 0;
    this.scores = loadScores();

    this.camera = new Camera(W, H);
    this.particles = new Particles();
    this.map = new GameMap();
    this.ui = new UI(W, H);

    this.player = null;
    this.sheepList = [];
    this.helpers = [];
    this.obstacles = [];
    this.items = [];
    this.lastTime = 0;

    this.input = new InputHandler();
    this.mouseX = 0;
    this.mouseY = 0;
    this.playerName = "";
    this._helpBtn = null;

    // Leaderboard state (Supabase + localStorage fallback)
    this.leaderboard = localScoresToEntries(loadScores());
    this.leaderboardLoading = false;
    this.leaderboardError = false;
    this.lastSubmittedName = "";
    this.lastSubmittedScore = -1;

    this.input.onKeyDown((key) => this._onKey(key));
    this._helpBtn = this.input.setupMobile();
    if (this._helpBtn) {
      this._helpBtn.addEventListener(
        "touchstart",
        (e) => {
          this._summonHelper();
          e.preventDefault();
        },
        { passive: false },
      );
    }

    this._bindCanvasEvents();
    this._setupNameOverlay();
    requestAnimationFrame((t) => this._loop(t));
  }

  // ============================================================
  // LEVEL SETUP
  // ============================================================

  _startGame(level = 1) {
    // Clear any keys left over from menu navigation / name-entry typing
    this.input.clearKeys();

    this.level = level;
    if (level === 1) {
      this.score = 0;
      this.coins = 0;
    }
    this.timer = CONFIG.LEVEL_TIME + (level - 1) * 12;

    const cx = CONFIG.WORLD_W / 2,
      cy = CONFIG.WORLD_H / 2;
    this.player = new Player(cx, cy);
    this.sheepList = [];
    const sheepCount = Math.min(level, 4);
    for (let i = 0; i < sheepCount; i++) {
      const angle = (i / sheepCount) * Math.PI * 2;
      const r = 280 + level * 20;
      const s = new Sheep(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      s.setLevel(level);
      this.sheepList.push(s);
    }

    this.camera.x = cx - CONFIG.CANVAS_W / 2;
    this.camera.y = cy - CONFIG.CANVAS_H / 2;

    this.helpers = [];
    this._generateLevel(level);
    this.particles = new Particles();
    this.state = STATE.PLAYING;
    audio.play("level_start");
  }

  _generateLevel(level) {
    this.obstacles = [];
    this.items = [];
    const W = CONFIG.WORLD_W,
      H = CONFIG.WORLD_H;
    const cx = W / 2,
      cy = H / 2;
    const obsTypes = ["car", "cart", "puddle", "barrier", "child"];
    const maxType = Math.min(level + 1, obsTypes.length);

    const obsCount = 16 + level * 6;
    for (let i = 0; i < obsCount; i++) {
      const type = obsTypes[Math.floor(Math.random() * maxType)];
      let x,
        y,
        tries = 0;
      do {
        x = 80 + Math.random() * (W - 160);
        y = 80 + Math.random() * (H - 160);
        tries++;
      } while (_dist(x, y, cx, cy) < 180 && tries < 20);
      this.obstacles.push(new Obstacle(x, y, type));
    }

    const coinCount = 20 + level * 4;
    for (let i = 0; i < coinCount; i++)
      this.items.push(
        new Collectible(
          80 + Math.random() * (W - 160),
          80 + Math.random() * (H - 160),
          "coin",
        ),
      );

    for (let i = 0; i < 6; i++)
      this.items.push(
        new Collectible(
          80 + Math.random() * (W - 160),
          80 + Math.random() * (H - 160),
          "date",
        ),
      );

    for (let i = 0; i < 4; i++)
      this.items.push(
        new Collectible(
          80 + Math.random() * (W - 160),
          80 + Math.random() * (H - 160),
          "star",
        ),
      );

    const puTypes = ["rope", "shoes", "magnet", "rope", "shoes"];
    for (let i = 0; i < 3 + Math.min(level, 4); i++)
      this.items.push(
        new PowerUp(
          80 + Math.random() * (W - 160),
          80 + Math.random() * (H - 160),
          puTypes[i % puTypes.length],
        ),
      );
  }

  // ============================================================
  // UPDATE
  // ============================================================

  _update(dt) {
    this.time += dt;
    if (this.state !== STATE.PLAYING) return;
    this.timer -= dt;

    this.obstacles.forEach((o) => o.update(dt));

    this.player.update(dt, this.input.keys, this.input.mobile, this.obstacles);

    this.sheepList.forEach((s) => {
      if (!s.caught) s.update(dt, this.player.x, this.player.y, this.obstacles);
    });

    this.helpers = this.helpers.filter((h) => h.active);
    this.helpers.forEach((h) => h.update(dt, this.sheepList, this.obstacles));

    this.items.forEach((item) => item.update(dt));

    this._checkPickups();

    if (this.player.moving) {
      this.player.dustT -= dt;
      if (this.player.dustT <= 0) {
        this.player.dustT = this.player.sprinting ? 0.05 : 0.13;
        this.particles.dust(this.player.x, this.player.y + 18);
        audio.play("footstep");
      }
    }

    for (const s of this.sheepList) {
      if (
        !s.caught &&
        _dist(this.player.x, this.player.y, s.x, s.y) < CONFIG.CATCH_DIST
      ) {
        s.caught = true;
        this.score += 300 + this.level * 50;
        this.particles.catch(s.x, s.y);
        this.camera.shake(8, 0.4);
        if (this.sheepList.every((sh) => sh.caught)) {
          const timeBonus = Math.floor(this.timer) * 8;
          this.score += 200 + timeBonus + this.level * 100;
          this.camera.shake(14, 0.6);
          audio.play("victory");
          // this._finalizeScore(STATE.VICTORY);
          this.state = STATE.VICTORY;
        } else {
          audio.play("sheep_caught");
        }
      }
    }

    for (const h of this.helpers) {
      for (const s of this.sheepList) {
        if (!s.caught && _dist(h.x, h.y, s.x, s.y) < CONFIG.CATCH_DIST) {
          s.caught = true;
          this.score += 150 + this.level * 25;
          this.particles.catch(s.x, s.y);
          this.camera.shake(6, 0.3);
          if (this.sheepList.every((sh) => sh.caught)) {
            const timeBonus = Math.floor(this.timer) * 8;
            this.score += 200 + timeBonus + this.level * 100;
            this.camera.shake(14, 0.6);
            audio.play("victory");
            // this._finalizeScore(STATE.VICTORY);
            this.state = STATE.VICTORY;
          } else {
            audio.play("sheep_caught");
          }
        }
      }
    }

    if (this.timer <= 0) {
      this.timer = 0;
      audio.play("game_over");
      this._finalizeScore(STATE.GAME_OVER);
    }

    this.camera.follow(this.player.x, this.player.y);
    this.camera.update(dt);
    this.particles.update(dt);
  }

  _checkPickups() {
    const px = this.player.x,
      py = this.player.y;

    for (const item of this.items) {
      if (item.collected) continue;

      let dx = item.x - px,
        dy = item.y - py;

      if (item instanceof Collectible && this.player.hasMagnet) {
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < this.player.magnetR && d > 1) {
          const pull = 220;
          item.x -= (dx / d) * pull * (1 / 60);
          item.y -= (dy / d) * pull * (1 / 60);
          dx = item.x - px;
          dy = item.y - py;
        }
      }

      const dist = Math.sqrt(dx * dx + dy * dy);
      const pickR = item instanceof PowerUp ? 22 : 16;

      if (dist < pickR) {
        item.collected = true;
        if (item instanceof Collectible) {
          switch (item.type) {
            case "coin":
              this.score += 10;
              this.coins++;
              this.particles.coin(item.x, item.y);
              audio.play("coin");
              break;
            case "date":
              this.player.stamina = Math.min(
                CONFIG.STAMINA_MAX,
                this.player.stamina + 45,
              );
              this.particles.emit(item.x, item.y, "#d2691e", 7, 60, 4, 0.4);
              break;
            case "star":
              this.score += 50;
              this.particles.emit(item.x, item.y, "#ffe000", 12, 95, 6, 0.65);
              audio.play("star");
              break;
          }
        } else if (item instanceof PowerUp) {
          this.player.activatePowerUp(item.type);
          if (item.type === "rope") this.sheepList.forEach((s) => s.slow(5));
          this.particles.emit(item.x, item.y, item.color(), 10, 80, 5, 0.55);
          this.score += 20;
          audio.play("powerup");
        }
      }
    }
  }

  // ============================================================
  // DRAW
  // ============================================================

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

    if (this.state === STATE.MENU || this.state === STATE.NAME_ENTRY) {
      const best = this.scores.length ? this.scores[0].score : 0;
      this.ui.drawMenu(ctx, best, this.time);
      return;
    }
    if (this.state === STATE.INSTRUCTIONS) {
      this.ui.drawInstructions(ctx);
      return;
    }
    if (this.state === STATE.HIGH_SCORES) {
      this.ui.drawHighScores(ctx, this.leaderboard, {
        loading: this.leaderboardLoading,
        error: this.leaderboardError,
        lastSubmittedName: this.lastSubmittedName,
        lastSubmittedScore: this.lastSubmittedScore,
      });
      return;
    }
    if (this.state === STATE.CREDITS) {
      this.ui.drawCredits(ctx, this.mouseX, this.mouseY);
      return;
    }

    const { ox, oy } = this.camera.offset();

    this.map.draw(ctx, this.camera, this.time);

    for (const o of this.obstacles) {
      if (this.camera.sees(o.x, o.y, o.w, o.h)) o.draw(ctx, ox, oy);
    }

    for (const item of this.items) {
      if (!item.collected && this.camera.sees(item.x - 20, item.y - 20, 40, 40))
        item.draw(ctx, ox, oy);
    }

    this.sheepList.forEach((s) => {
      if (!s.caught) s.draw(ctx, ox, oy);
    });
    this.helpers.forEach((h) => h.draw(ctx, ox, oy));
    this.player.draw(ctx, ox, oy);

    this.particles.draw(ctx, ox, oy);

    this.ui.drawMinimap(
      ctx,
      this.player.x,
      this.player.y,
      this.sheepList,
      this.camera.x,
      this.camera.y,
      CONFIG.CANVAS_W,
      CONFIG.CANVAS_H,
    );

    const pw = {
      rope: this.player.ropeTtl > 0 ? this.player.ropeTtl : 0,
      shoes: this.player.shoesTtl > 0 ? this.player.shoesTtl : 0,
      magnet: this.player.magnetTtl > 0 ? this.player.magnetTtl : 0,
    };
    const sheepLeft = this.sheepList.filter((s) => !s.caught).length;
    const canHelp =
      this.level >= 2 && this.coins >= 5 && this.helpers.length < 2;
    this.ui.drawHUD(
      ctx,
      this.score,
      this.coins,
      this.timer,
      this.player.stamina,
      this.level,
      pw,
      sheepLeft,
      this.sheepList.length,
      canHelp,
    );

    this._drawSheepArrow(ctx, ox, oy);

    if (this.state === STATE.PAUSED) this.ui.drawPause(ctx);
    if (this.state === STATE.GAME_OVER)
      this.ui.drawGameOver(ctx, this.score, this.coins, this.level);
    if (this.state === STATE.VICTORY)
      this.ui.drawVictory(ctx, this.score, this.coins, this.level);
  }

  _drawSheepArrow(ctx, ox, oy) {
    const W = CONFIG.CANVAS_W,
      H = CONFIG.CANVAS_H;
    const margin = 56;
    const cxW = W / 2,
      cyW = H / 2;
    const R = Math.min(W, H) * 0.42;

    for (const s of this.sheepList) {
      if (s.caught) continue;
      const sx = s.x + ox,
        sy = s.y + oy;
      if (sx >= margin && sx <= W - margin && sy >= margin && sy <= H - margin)
        continue;

      const dx = s.x - this.player.x,
        dy = s.y - this.player.y;
      const ang = Math.atan2(dy, dx);
      const ax = cxW + Math.cos(ang) * R;
      const ay = cyW + Math.sin(ang) * R;

      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(ang);
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 0.7 + Math.sin(this.time * 5) * 0.2;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-8, -7);
      ctx.lineTo(-8, 7);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // ============================================================
  // EVENTS
  // ============================================================

  _bindCanvasEvents() {
    this.canvas.addEventListener("click", (e) => {
      const r = this.canvas.getBoundingClientRect();
      const scX = CONFIG.CANVAS_W / r.width;
      const scY = CONFIG.CANVAS_H / r.height;
      this._onClick((e.clientX - r.left) * scX, (e.clientY - r.top) * scY);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const r = this.canvas.getBoundingClientRect();
      const scX = CONFIG.CANVAS_W / r.width;
      const scY = CONFIG.CANVAS_H / r.height;
      this.mouseX = (e.clientX - r.left) * scX;
      this.mouseY = (e.clientY - r.top) * scY;
      if (this.state === STATE.CREDITS) {
        const W = CONFIG.CANVAS_W,
          H = CONFIG.CANVAS_H;
        const ui = this.ui;
        const over =
          ui.hits(this.mouseX, this.mouseY, W / 2 - 130, H / 2 + 10, 260, 42) ||
          ui.hits(this.mouseX, this.mouseY, W / 2 - 130, H / 2 + 64, 260, 42) ||
          ui.hits(this.mouseX, this.mouseY, W / 2 - 95, H - 80, 190, 46);
        this.canvas.style.cursor = over ? "pointer" : "default";
      } else {
        this.canvas.style.cursor = "default";
      }
    });
  }

  _onKey(k) {
    if (
      this.state === STATE.PLAYING &&
      (k === "p" || k === "P" || k === "Escape")
    )
      this.state = STATE.PAUSED;
    else if (
      this.state === STATE.PAUSED &&
      (k === "p" || k === "P" || k === "Escape")
    )
      this.state = STATE.PLAYING;
    else if (this.state === STATE.PLAYING && (k === "h" || k === "H"))
      this._summonHelper();
  }

  _summonHelper() {
    if (this.level < 2) return;
    if (this.coins < 5) return;
    if (this.helpers.length >= 2) return;
    this.coins -= 5;
    const offset = this.helpers.length === 0 ? 50 : -50;
    this.helpers.push(new Helper(this.player.x + offset, this.player.y));
    this.particles.emit(
      this.player.x + offset,
      this.player.y,
      "#4488cc",
      10,
      75,
      5,
      0.5,
    );
    audio.play("powerup");
  }

  _onClick(mx, my) {
    const ui = this.ui;
    const W = CONFIG.CANVAS_W,
      H = CONFIG.CANVAS_H;

    switch (this.state) {
      case STATE.MENU:
        if (ui.hits(mx, my, 8, 8, 78, 28)) {
          setLang(LANG === "ar" ? "en" : "ar");
        }
        if (ui.hits(mx, my, W / 2 - 105, 168, 210, 44)) this._showNameOverlay();
        if (ui.hits(mx, my, W / 2 - 105, 220, 210, 44))
          this.state = STATE.INSTRUCTIONS;
        if (ui.hits(mx, my, W / 2 - 105, 272, 210, 44)) {
          this.state = STATE.HIGH_SCORES;
          this._fetchLeaderboard();
        }
        if (ui.hits(mx, my, W / 2 - 105, 324, 210, 44))
          this.state = STATE.CREDITS;
        break;
      case STATE.INSTRUCTIONS:
        if (ui.hits(mx, my, W / 2 - 95, H - 80, 190, 46))
          this.state = STATE.MENU;
        break;
      case STATE.HIGH_SCORES:
        if (ui.hits(mx, my, W / 2 - 95, H - 80, 190, 46))
          this.state = STATE.MENU;
        break;
      case STATE.CREDITS:
        if (ui.hits(mx, my, W / 2 - 95, H - 80, 190, 46))
          this.state = STATE.MENU;
        if (ui.hits(mx, my, W / 2 - 130, H / 2 + 10, 260, 42))
          window.open("https://github.com/shhahad20", "_blank");
        if (ui.hits(mx, my, W / 2 - 130, H / 2 + 64, 260, 42))
          window.open("https://www.linkedin.com/in/shahadaltharwa/", "_blank");
        break;
      case STATE.PAUSED:
        if (ui.hits(mx, my, W / 2 - 95, H / 2 - 28, 190, 46))
          this.state = STATE.PLAYING;
        if (ui.hits(mx, my, W / 2 - 95, H / 2 + 34, 190, 46))
          this.state = STATE.MENU;
        break;
      case STATE.GAME_OVER:
        if (ui.hits(mx, my, W / 2 - 95, H / 2 - 170 + 224, 190, 46))
          this._startGame(1);
        if (ui.hits(mx, my, W / 2 - 95, H / 2 - 170 + 282, 190, 46))
          this.state = STATE.MENU;
        break;
      case STATE.VICTORY:
        if (ui.hits(mx, my, W / 2 - 95, H / 2 - 185 + 226, 190, 46))
          this._startGame(this.level + 1);
        // if (ui.hits(mx,my, W/2-95,H/2-185+288,190,46)) this.state = STATE.MENU;
        if (ui.hits(mx, my, W / 2 - 95, H / 2 - 185 + 288, 190, 46))
          this._finalizeScore(STATE.MENU);

        break;
    }
  }

  // ============================================================
  // NAME ENTRY OVERLAY
  // ============================================================

  _setupNameOverlay() {
    const overlay = document.getElementById("nameOverlay");
    const input = document.getElementById("nameInput");
    const submit = document.getElementById("nameSubmit");
    if (!overlay) return;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this._submitName();
      }
    });
    submit.addEventListener("click", () => this._submitName());
  }

  _showNameOverlay() {
    this.state = STATE.NAME_ENTRY;
    const overlay = document.getElementById("nameOverlay");
    const input = document.getElementById("nameInput");
    const title = document.getElementById("nameOverlayTitle");
    const hint = document.getElementById("nameOverlayHint");
    const submit = document.getElementById("nameSubmit");
    if (!overlay) {
      this._startGame(1);
      return;
    }
    if (title) title.textContent = T("enterName");
    if (hint) hint.textContent = T("nameHint");
    if (submit) submit.textContent = T("startBtn");
    input.value = "";
    input.placeholder = T("nameDefault");
    input.dir = LANG === "ar" ? "rtl" : "ltr";
    overlay.classList.add("active");
    input.focus();
  }

  _submitName() {
    const input = document.getElementById("nameInput");
    const overlay = document.getElementById("nameOverlay");
    const raw = input ? input.value.trim() : "";
    this.playerName = raw || T("nameDefault");
    if (overlay) overlay.classList.remove("active");
    this._startGame(1);
  }

  // ============================================================
  // HELP BUTTON
  // ============================================================

  _updateHelpBtn() {
    if (!this._helpBtn) return;
    const eligible =
      this.state === STATE.PLAYING &&
      this.level >= 2 &&
      this.coins >= 5 &&
      this.helpers.length < 2;
    this._helpBtn.disabled = !eligible;
    this._helpBtn.style.display = this.level >= 2 ? "" : "none";
  }

  // ============================================================
  // LEADERBOARD
  // ============================================================

  _finalizeScore(finalState) {
    this.lastSubmittedName = this.playerName || T("nameDefault");
    this.lastSubmittedScore = this.score;
    this.scores = saveScore(this.scores, {
      name: this.lastSubmittedName,
      score: this.score,
      coins: this.coins,
      level: this.level,
    });
    submitScore({
      player_name: this.lastSubmittedName,
      score: this.score,
      level: this.level,
      coins: this.coins,
    }).then((r) => {
      if (!r.success) console.warn("[Leaderboard] Submit failed:", r.error);
    });
    this.state = finalState;
  }

  async _fetchLeaderboard() {
    this.leaderboardLoading = true;
    this.leaderboardError = false;
    try {
      const { data, error } = await fetchTopScores();
      this.leaderboard = data;
      this.leaderboardError = !!error;
    } catch {
      this.leaderboard = localScoresToEntries(this.scores);
      this.leaderboardError = true;
    } finally {
      this.leaderboardLoading = false;
    }
  }

  // ============================================================
  // LOOP
  // ============================================================

  _loop(ts) {
    const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
    this.lastTime = ts;
    this._update(dt);
    this._draw();
    this._updateHelpBtn();
    requestAnimationFrame((t) => this._loop(t));
  }
}
