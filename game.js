'use strict';

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
  CANVAS_W: 800,
  CANVAS_H: 600,
  WORLD_W: 3200,
  WORLD_H: 2400,
  PLAYER_SPEED: 175,
  PLAYER_SPRINT_SPEED: 310,
  STAMINA_MAX: 100,
  STAMINA_DRAIN: 35,
  STAMINA_REGEN: 18,
  SHEEP_BASE_SPEED: 145,
  SHEEP_FLEE_DIST: 210,
  CATCH_DIST: 38,
  LEVEL_TIME: 65,
};

const COLORS = {
  beige:    '#f8e9d7',
  olive:    '#5b6c30',
  deepBlue: '#005c89',
  burgundy: '#7a1f3d',
  gold:     '#d4af37',
  sand:     '#e8c89a',
  road:     '#6e6e6e',
  sidewalk: '#c8b890',
  white:    '#ffffff',
  black:    '#1a1a2e',
};

const STATE = {
  MENU:         'MENU',
  PLAYING:      'PLAYING',
  PAUSED:       'PAUSED',
  GAME_OVER:    'GAME_OVER',
  VICTORY:      'VICTORY',
  INSTRUCTIONS: 'INSTRUCTIONS',
  HIGH_SCORES:  'HIGH_SCORES',
  CREDITS:      'CREDITS',
  NAME_ENTRY:   'NAME_ENTRY',
};

// ============================================================
// LANGUAGE
// ============================================================

let LANG = localStorage.getItem('eidSheepLang') || 'ar';

const STRINGS = {
  en: {
    title:'EID SHEEP CHASE', subtitle:'Chase the sheep before time runs out!',
    startGame:'START GAME', instructions:'INSTRUCTIONS', highScores:'HIGH SCORES',
    back:'BACK', resume:'RESUME', quitMenu:'QUIT TO MENU', mainMenu:'MAIN MENU',
    paused:'PAUSED', escaped:'THE SHEEP ESCAPED!', caughtAll:'SHEEP CAUGHT!',
    eidMubarak:'EID MUBARAK! ^_^', nextLevel:'NEXT LEVEL', tryAgain:'TRY AGAIN',
    score:'SCORE', level:'LVL', levelFull:'Level', sheep:'SHEEP', stamina:'STAMINA',
    rope:'ROPE', sprint:'SPRINT', magnet:'MAGNET',
    callHelp:'[H] CALL HELP', helpCost:'COSTS 5 COINS',
    best:'BEST', noScores:'No scores yet — go catch that sheep!',
    scoreLabel:'Score', coinsLabel:'Coins', levelLabel:'Level', lvl:'Lvl',
    langBtn:'عربي', credits:'CREDITS', creditsTitle:'CREDITS',
    devBy:'Developed by', devName:'Shahad Altharwa',
    copyright:'© 2026',
    enterName:'ENTER YOUR NAME', nameHint:'Leave blank for default',
    nameDefault:'Player', startBtn:'▶  START',
    nameCol:'NAME', scoreCol:'SCORE', instrTitle:'HOW TO PLAY',
    instrRows:[
      ['MOVE',          'Arrow Keys / WASD'],
      ['SPRINT',        'Space / Shift (drains stamina)'],
      ['PAUSE',         'P  or  Escape'],
      ['GOAL',          'Catch all the sheep before the timer!'],
      ['',''],
      ['COLLECTIBLES:', ''],
      ['  Gold Coin',   '+10 points'],
      ['  Dates',       'Restore stamina'],
      ['  Star',        '+50 bonus points'],
      ['',''],
      ['POWER-UPS:',    ''],
      ['  Rope',        'Slows all sheep for 5 seconds'],
      ['  Sprint Shoes','Speed boost for 8 seconds'],
      ['  Magnet',      'Pulls nearby coins towards you'],
      ['',''],
      ['HELPER:',       ''],
      ['  H key (Lv2+)','Call a helper — costs 5 coins'],
    ],
  },
  ar: {
    title:'مطاردة خروف العيد', subtitle:'!أمسك الخروف قبل نفاد الوقت',
    startGame:'العب', instructions:'كيف تلعب', highScores:'أعلى النتائج',
    back:'رجوع', resume:'استمر', quitMenu:'القائمة الرئيسية', mainMenu:'القائمة الرئيسية',
    paused:'متوقف', escaped:'!هرب الخروف', caughtAll:'!أمسكت الخروف',
    eidMubarak:'عيد مبارك ^_^', nextLevel:'المستوى التالي', tryAgain:'العب مجددًا',
    score:'النتيجة', level:'مستوى', levelFull:'المستوى', sheep:'خراف', stamina:'الطاقة',
    rope:'حبل', sprint:'سرعة', magnet:'مغناطيس',
    callHelp:'[H] استدعِ مساعدًا', helpCost:'تكلفة: 5 عملات',
    best:'أفضل', noScores:'!لا توجد نتائج بعد',
    scoreLabel:'النتيجة', coinsLabel:'العملات', levelLabel:'المستوى', lvl:'مستوى',
    langBtn:'English', credits:'الفريق', creditsTitle:'الفريق',
    devBy:'تطوير', devName:'شهد الثروه',
    copyright:'© 2026',
    enterName:'أدخل اسمك', nameHint:'اتركه فارغًا للاسم الافتراضي',
    nameDefault:'لاعب', startBtn:'ابدأ  ◀',
    nameCol:'الاسم', scoreCol:'النتيجة', instrTitle:'كيف تلعب',
    instrRows:[
      ['التحرك',         'مفاتيح الأسهم / WASD'],
      ['الجري السريع',   'Space / Shift (يستنزف الطاقة)'],
      ['الإيقاف المؤقت', 'P  أو  Escape'],
      ['الهدف',          '!أمسك جميع الخراف قبل انتهاء الوقت'],
      ['',''],
      [':المجمّعات',''],
      ['  عملة ذهبية',   'نقاط 10+'],
      ['  تمر',          'يعيد الطاقة'],
      ['  نجمة',         'نقاط مكافأة 50+'],
      ['',''],
      [':مقويات',''],
      ['  حبل',          'يبطئ الخراف لمدة 5 ثوانٍ'],
      ['  أحذية السرعة', 'تسريع لمدة 8 ثوانٍ'],
      ['  مغناطيس',      'يجذب العملات القريبة'],
      ['',''],
      [':مساعد',''],
      ['  مفتاح H (مستوى 2+)','استدعِ مساعدًا - تكلفة 5 عملات'],
    ],
  },
};

function T(key) {
  const s = STRINGS[LANG];
  return (s && s[key] !== undefined) ? s[key] : (STRINGS.en[key] ?? key);
}

// ============================================================
// AUDIO ENGINE  (Web Audio API — sound effects only, no music)
// ============================================================

class AudioEngine {
  constructor() {
    this._actx = null;
    this._ok   = true;
    const wake = () => {
      if (this._actx && this._actx.state === 'suspended') this._actx.resume().catch(()=>{});
    };
    window.addEventListener('keydown',    wake, { passive: true });
    window.addEventListener('pointerdown',wake, { passive: true });
  }

  _ctx() {
    if (!this._ok) return null;
    if (!this._actx) {
      try { this._actx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e) { this._ok = false; return null; }
    }
    return this._actx;
  }

  // Single oscillator note with optional frequency glide
  _osc(ctx, type, freq, t, dur, vol = 0.22, freqEnd) {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd != null) osc.frequency.linearRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + dur + 0.01);
  }

  // Short filtered noise burst (footstep / impact)
  _noise(ctx, t, dur, vol = 0.1, cf = 200) {
    const sr  = ctx.sampleRate;
    const len = Math.ceil(sr * dur);
    const buf = ctx.createBuffer(1, len, sr);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src  = ctx.createBufferSource();
    const filt = ctx.createBiquadFilter();
    const g    = ctx.createGain();
    filt.type = 'bandpass'; filt.frequency.value = cf; filt.Q.value = 1.4;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.buffer = buf;
    src.connect(filt); filt.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + dur + 0.01);
  }

  play(name) {
    if (!this._ok) return;
    const ctx = this._ctx();
    if (!ctx) return;
    if (ctx.state === 'suspended') { ctx.resume().catch(()=>{}); return; }
    const t = ctx.currentTime;
    try {
      switch (name) {
        case 'coin':
          this._osc(ctx,'sine', 880, t,       0.09, 0.22);
          this._osc(ctx,'sine',1320, t + 0.05, 0.09, 0.10);
          break;
        case 'star':
          [523,659,784,1047].forEach((f,i) => this._osc(ctx,'sine',f, t+i*0.07, 0.12, 0.2));
          break;
        case 'catch':                               // per-sheep catch: ascending 3-note
          this._osc(ctx,'sine', 523, t,       0.08, 0.26);
          this._osc(ctx,'sine', 659, t+0.07,  0.11, 0.26);
          this._osc(ctx,'sine', 784, t+0.14,  0.19, 0.30);
          break;
        case 'sheep_caught':                        // surprised bleat → catch fanfare
          this._osc(ctx,'sawtooth', 370, t,       0.10, 0.20, 270);
          this._osc(ctx,'sawtooth', 270, t+0.10,  0.09, 0.08, 360);
          this._osc(ctx,'sine',     155, t,        0.18, 0.06);
          this._osc(ctx,'sine', 523, t+0.22, 0.08, 0.24);
          this._osc(ctx,'sine', 659, t+0.30, 0.11, 0.24);
          this._osc(ctx,'sine', 784, t+0.38, 0.19, 0.28);
          break;
        case 'victory':                             // all sheep caught: 5-note fanfare
          this._osc(ctx,'sine', 523, t,       0.06, 0.28);
          this._osc(ctx,'sine', 659, t+0.07,  0.10, 0.28);
          this._osc(ctx,'sine', 784, t+0.14,  0.15, 0.30);
          this._osc(ctx,'sine',1047, t+0.21,  0.22, 0.42);
          this._osc(ctx,'sine',1568, t+0.28,  0.27, 0.55);
          break;
        case 'game_over':
          [392,330,262,196].forEach((f,i) =>
            this._osc(ctx,'sawtooth',f, t+i*0.22, 0.25, 0.18));
          break;
        case 'powerup':
          for(let i=0;i<8;i++) this._osc(ctx,'sine',280+i*80, t+i*0.045, 0.09, 0.16);
          break;
        case 'level_start':
          [261,329,392,523,659].forEach((f,i) =>
            this._osc(ctx,'sine',f, t+i*0.09, 0.14, 0.25));
          break;
        case 'footstep':
          this._noise(ctx, t, 0.04, 0.09, 220);
          break;
        case 'bleat':
          this._osc(ctx,'sawtooth', 310, t,      0.18, 0.18, 275);
          this._osc(ctx,'sawtooth', 275, t+0.18, 0.20, 0.15, 320);
          this._osc(ctx,'sine',     155, t,      0.36, 0.06);
          break;
      }
    } catch(e) {}
  }
}

const audio = new AudioEngine();

// ============================================================
// MATH HELPERS
// ============================================================

class Vec2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  add(v)  { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v)  { return new Vec2(this.x - v.x, this.y - v.y); }
  scale(s){ return new Vec2(this.x * s, this.y * s); }
  mag()   { return Math.sqrt(this.x * this.x + this.y * this.y); }
  norm()  { const m = this.mag(); return m ? new Vec2(this.x/m, this.y/m) : new Vec2(); }
  dist(v) { return this.sub(v).mag(); }
}

function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

// ============================================================
// CAMERA
// ============================================================

class Camera {
  constructor(w, h) {
    this.x = 0; this.y = 0;
    this.w = w; this.h = h;
    this.shakeAmt = 0;
    this.shakeTtl = 0;
  }

  follow(tx, ty) {
    const gx = tx - this.w / 2;
    const gy = ty - this.h / 2;
    this.x += (gx - this.x) * 0.12;
    this.y += (gy - this.y) * 0.12;
    this.x = clamp(this.x, 0, CONFIG.WORLD_W - this.w);
    this.y = clamp(this.y, 0, CONFIG.WORLD_H - this.h);
  }

  shake(amt, dur) { this.shakeAmt = amt; this.shakeTtl = dur; }

  update(dt) {
    if (this.shakeTtl > 0) {
      this.shakeTtl -= dt;
      if (this.shakeTtl <= 0) this.shakeAmt = 0;
    }
  }

  // Returns {ox, oy} — add to world coords to get screen coords
  offset() {
    const sx = this.shakeAmt > 0 ? (Math.random() - 0.5) * this.shakeAmt * 2 : 0;
    const sy = this.shakeAmt > 0 ? (Math.random() - 0.5) * this.shakeAmt * 2 : 0;
    return { ox: -this.x + sx, oy: -this.y + sy };
  }

  sees(wx, wy, ww, wh) {
    return wx + ww > this.x && wx < this.x + this.w &&
           wy + wh > this.y && wy < this.y + this.h;
  }
}

// ============================================================
// PARTICLES
// ============================================================

class Particle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.size = size;
    this.ttl = life;
    this.maxTtl = life;
    this.dead = false;
  }
  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.vy += 60 * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }
  draw(ctx, ox, oy) {
    const a = Math.max(0, this.ttl / this.maxTtl);
    const s = Math.max(1, this.size * a);
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.round(this.x + ox - s/2), Math.round(this.y + oy - s/2), Math.round(s), Math.round(s));
    ctx.globalAlpha = 1;
  }
}

class Particles {
  constructor() { this.list = []; }

  emit(x, y, color, n = 6, spd = 70, sz = 4, life = 0.5) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = spd * (0.4 + Math.random() * 0.6);
      this.list.push(new Particle(x, y, Math.cos(a)*s, Math.sin(a)*s - 20, color, sz, life*(0.5+Math.random()*0.5)));
    }
  }

  dust(x, y)  { this.emit(x, y, '#c8b080', 3, 28, 3, 0.28); }
  coin(x, y)  { this.emit(x, y, COLORS.gold, 9, 85, 5, 0.6); }
  catch(x, y) { this.emit(x, y, COLORS.gold, 22, 130, 8, 1.0); this.emit(x, y, '#fff', 14, 100, 6, 0.8); }

  update(dt) { this.list = this.list.filter(p => { p.update(dt); return !p.dead; }); }
  draw(ctx, ox, oy) { this.list.forEach(p => p.draw(ctx, ox, oy)); }
}

// ============================================================
// MAP
// ============================================================

class GameMap {
  constructor() {
    this.W = CONFIG.WORLD_W;
    this.H = CONFIG.WORLD_H;
    this.decs = [];
    this._buildDecorations();
  }

  _buildDecorations() {
    const rng = (min, max) => min + Math.random() * (max - min);
    // Palm trees
    for (let i = 0; i < 35; i++)
      this.decs.push({ t: 'palm', x: rng(80, this.W-80), y: rng(80, this.H-80) });
    // Lanterns
    for (let i = 0; i < 22; i++)
      this.decs.push({ t: 'lantern', x: rng(120, this.W-120), y: rng(120, this.H-120), ph: Math.random()*Math.PI*2 });
    // Banners
    for (let i = 0; i < 18; i++)
      this.decs.push({ t: 'banner', x: rng(150, this.W-280), y: rng(80, this.H-80) });
    // Houses along perimeter areas
    const housePositions = [
      [60,60],[260,60],[460,60],[660,60],[860,60],[1060,60],
      [60,220],[60,420],[60,620],
      [this.W-180,60],[this.W-180,260],[this.W-180,460],
      [60,this.H-160],[260,this.H-160],[460,this.H-160],
    ];
    housePositions.forEach(([x,y]) => this.decs.push({ t: 'house', x, y }));
  }

  draw(ctx, cam, time) {
    const { ox, oy } = cam.offset();

    // Base ground (sand/beige)
    ctx.fillStyle = COLORS.sand;
    ctx.fillRect(ox, oy, this.W, this.H);

    // Ground tile texture (subtle grid)
    ctx.fillStyle = 'rgba(180,140,80,0.15)';
    const ts = 64;
    const startTX = Math.floor(cam.x / ts) * ts;
    const startTY = Math.floor(cam.y / ts) * ts;
    for (let tx = startTX; tx < cam.x + cam.w + ts; tx += ts)
      for (let ty = startTY; ty < cam.y + cam.h + ts; ty += ts)
        ctx.fillRect(tx + ox, ty + oy, 1, ts);

    // Horizontal roads
    for (let ry = 280; ry < this.H; ry += 500) {
      ctx.fillStyle = COLORS.road;
      ctx.fillRect(ox, ry + oy, this.W, 150);
      // Center line
      ctx.fillStyle = '#e8d020';
      for (let rx = 0; rx < this.W; rx += 80)
        ctx.fillRect(rx + ox, ry + 68 + oy, 50, 8);
      // Sidewalk strips
      ctx.fillStyle = COLORS.sidewalk;
      ctx.fillRect(ox, ry - 18 + oy, this.W, 18);
      ctx.fillRect(ox, ry + 150 + oy, this.W, 18);
    }

    // Vertical roads
    for (let rx = 280; rx < this.W; rx += 500) {
      ctx.fillStyle = COLORS.road;
      ctx.fillRect(rx + ox, oy, 150, this.H);
      ctx.fillStyle = '#e8d020';
      for (let ry = 0; ry < this.H; ry += 80)
        ctx.fillRect(rx + 68 + ox, ry + oy, 8, 50);
      ctx.fillStyle = COLORS.sidewalk;
      ctx.fillRect(rx - 18 + ox, oy, 18, this.H);
      ctx.fillRect(rx + 150 + ox, oy, 18, this.H);
    }

    // Decorations (only draw visible ones)
    for (const d of this.decs) {
      if (!cam.sees(d.x - 100, d.y - 130, 260, 180)) continue;
      const dx = d.x + ox, dy = d.y + oy;
      switch (d.t) {
        case 'palm':    this._palm(ctx, dx, dy); break;
        case 'lantern': this._lantern(ctx, dx, dy, time + d.ph); break;
        case 'banner':  this._banner(ctx, dx, dy); break;
        case 'house':   this._house(ctx, dx, dy); break;
      }
    }
  }

  _palm(ctx, x, y) {
    // Trunk
    ctx.fillStyle = '#7a5510';
    ctx.fillRect(x - 4, y - 55, 8, 55);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#5a3e0c'; ctx.fillRect(x-4, y-10-i*10, 8, 3); }
    // Fronds
    const fronds = [[-24,-58,22,7],[-38,-46,22,7],[18,-58,22,7],[32,-46,22,7],[-4,-66,8,22],[-14,-52,12,7],[6,-52,12,7]];
    fronds.forEach(([fx,fy,fw,fh]) => {
      ctx.fillStyle = COLORS.olive;
      ctx.fillRect(x+fx, y+fy, fw, fh);
    });
    // Coconuts
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(x-4, y-56, 5, 5);
    ctx.fillRect(x+1, y-54, 5, 5);
  }

  _lantern(ctx, x, y, t) {
    const glow = 0.55 + Math.sin(t * 2.5) * 0.35;
    // Hanging wire
    ctx.fillStyle = '#666';
    ctx.fillRect(x - 1, y - 55, 2, 36);
    // Glow halo
    ctx.globalAlpha = glow * 0.25;
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(x - 20, y - 22, 40, 40);
    ctx.globalAlpha = 1;
    // Body
    ctx.fillStyle = COLORS.burgundy;
    ctx.fillRect(x - 9, y - 20, 18, 26);
    // Glass
    ctx.globalAlpha = glow;
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(x - 6, y - 17, 12, 20);
    ctx.globalAlpha = 1;
    // Frame lines
    ctx.fillStyle = '#5a1428';
    ctx.fillRect(x - 1, y - 17, 2, 20);
    // Caps
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x - 12, y - 24, 24, 6);
    ctx.fillRect(x - 10, y + 6, 20, 5);
    // Crescent moon charm
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x - 2, y + 12, 4, 10);
    ctx.fillRect(x - 4, y + 14, 8, 3);
  }

  _banner(ctx, x, y) {
    const w = 130;
    // String
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(x, y, w, 2);
    // Triangle flags
    const fc = [COLORS.burgundy, COLORS.deepBlue, COLORS.olive, COLORS.gold, '#e67e22'];
    for (let i = 0; i < 6; i++) {
      const fx = x + i * 22;
      ctx.fillStyle = fc[i % fc.length];
      // Triangle via staircase pixels
      for (let row = 0; row < 16; row++) {
        const w2 = Math.round((row / 16) * 10);
        ctx.fillRect(fx + 5 - w2/2, y + row, w2 + 1, 1);
      }
    }
    // Crescent at center
    const mx = x + w / 2;
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(mx - 7, y - 16, 14, 14);
    ctx.fillStyle = COLORS.deepBlue;
    ctx.fillRect(mx - 4, y - 18, 14, 14);
  }

  _house(ctx, x, y) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 6, y + 6, 120, 110);
    // Walls
    ctx.fillStyle = '#e8d4ae';
    ctx.fillRect(x, y, 120, 105);
    // Brick lines
    ctx.fillStyle = 'rgba(160,120,70,0.2)';
    for (let r = 0; r < 8; r++) ctx.fillRect(x, y + r*13, 120, 2);
    // Roof
    ctx.fillStyle = COLORS.burgundy;
    ctx.fillRect(x - 8, y - 32, 136, 36);
    ctx.fillStyle = '#5a1428';
    ctx.fillRect(x - 8, y - 32, 136, 6);
    // Roof highlights
    ctx.fillStyle = '#a03050';
    ctx.fillRect(x - 8, y - 26, 136, 4);
    // Door
    ctx.fillStyle = '#7a4820';
    ctx.fillRect(x + 44, y + 54, 32, 51);
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(x + 44, y + 54, 32, 5);
    // Door arch
    ctx.fillStyle = '#c08040';
    ctx.fillRect(x + 45, y + 46, 30, 12);
    ctx.fillRect(x + 50, y + 42, 20, 8);
    // Door handle
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x + 72, y + 77, 4, 4);
    // Windows
    [[14, 18],[80, 18]].forEach(([wx, wy]) => {
      ctx.fillStyle = '#aaddff';
      ctx.fillRect(x+wx, y+wy, 28, 28);
      ctx.fillStyle = '#88bbdd';
      ctx.fillRect(x+wx+1, y+wy+1, 12, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x+wx+3, y+wy+3, 6, 6);
      ctx.fillStyle = '#8b5e3c';
      ctx.fillRect(x+wx-2, y+wy-2, 32, 4);
      ctx.fillRect(x+wx-2, y+wy, 4, 28);
      ctx.fillRect(x+wx+26, y+wy, 4, 28);
      ctx.fillRect(x+wx-2, y+wy+26, 32, 4);
    });
  }
}

// ============================================================
// OBSTACLE
// ============================================================

const OBS_DIMS = {
  car:     [66, 34],
  cart:    [42, 34],
  puddle:  [52, 26],
  barrier: [52, 18],
  child:   [14, 20],
};

class Obstacle {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.type = type;
    [this.w, this.h] = OBS_DIMS[type] || [32, 32];
    this.slippery = (type === 'puddle');
    // Child wanders
    if (type === 'child') {
      this.vx = (Math.random() - 0.5) * 55;
      this.vy = (Math.random() - 0.5) * 55;
      this.thinkT = 0;
    }
  }

  update(dt) {
    if (this.type !== 'child') return;
    this.thinkT -= dt;
    if (this.thinkT <= 0) {
      this.thinkT = 1.5 + Math.random() * 2;
      this.vx = (Math.random() - 0.5) * 60;
      this.vy = (Math.random() - 0.5) * 60;
    }
    this.x = clamp(this.x + this.vx * dt, 20, CONFIG.WORLD_W - 40);
    this.y = clamp(this.y + this.vy * dt, 20, CONFIG.WORLD_H - 40);
  }

  draw(ctx, ox, oy) {
    const x = Math.round(this.x + ox);
    const y = Math.round(this.y + oy);
    switch (this.type) {
      case 'car':     _drawCar(ctx, x, y, this.x, this.y); break;
      case 'cart':    _drawCart(ctx, x, y); break;
      case 'puddle':  _drawPuddle(ctx, x, y); break;
      case 'barrier': _drawBarrier(ctx, x, y); break;
      case 'child':   _drawChild(ctx, x, y); break;
    }
  }
}

function _drawCar(ctx, x, y, wx, wy) {
  const palette = ['#c0392b','#2471a3','#1e8449','#d35400','#7d3c98','#17a589'];
  const col = palette[Math.abs(Math.floor(wx * 0.01 + wy * 0.017)) % palette.length];
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x+4, y+6, 66, 34);
  ctx.fillStyle = col; ctx.fillRect(x, y+6, 66, 28);
  ctx.fillStyle = _darker(col, 40); ctx.fillRect(x+8, y, 50, 18);
  ctx.fillStyle = '#aaddff'; ctx.fillRect(x+10, y+2, 18, 14); ctx.fillRect(x+38, y+2, 18, 14);
  ctx.fillStyle = '#88bbdd'; ctx.fillRect(x+10, y+2, 8, 14); ctx.fillRect(x+38, y+2, 8, 14);
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+5, y+24, 16, 12); ctx.fillRect(x+45, y+24, 16, 12);
  ctx.fillStyle = '#aaa'; ctx.fillRect(x+9, y+26, 8, 8); ctx.fillRect(x+49, y+26, 8, 8);
  ctx.fillStyle = '#fff'; ctx.fillRect(x+60, y+12, 6, 6); ctx.fillStyle = '#ff4'; ctx.fillRect(x, y+12, 6, 6);
}

function _darker(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n>>16)-amt, 0, 255);
  const g = clamp(((n>>8)&0xff)-amt, 0, 255);
  const b = clamp((n&0xff)-amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}

function _drawCart(ctx, x, y) {
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x+4, y+10, 42, 30);
  ctx.fillStyle = '#7a5510'; ctx.fillRect(x, y+10, 42, 24);
  ctx.fillStyle = COLORS.burgundy; ctx.fillRect(x-4, y+2, 50, 10);
  const stripes = [COLORS.gold, COLORS.burgundy];
  for (let i = 0; i < 6; i++) { ctx.fillStyle = stripes[i%2]; ctx.fillRect(x-4+i*8, y+2, 8, 10); }
  const fruits = ['#e74c3c','#f1c40f','#27ae60','#e67e22','#8e44ad'];
  for (let i = 0; i < 4; i++) { ctx.fillStyle = fruits[i]; ctx.fillRect(x+3+i*10, y+12, 9, 9); }
  ctx.fillStyle = '#2c2c2c';
  for (const cx2 of [x+10, x+32]) { ctx.fillRect(cx2-7, y+30, 14, 14); ctx.fillStyle = '#888'; ctx.fillRect(cx2-4, y+33, 8, 8); ctx.fillStyle='#2c2c2c'; }
}

function _drawPuddle(ctx, x, y) {
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = '#5599cc'; ctx.fillRect(x+6, y+6, 40, 14); ctx.fillRect(x, y+10, 52, 6);
  ctx.fillStyle = '#88bbee'; ctx.fillRect(x+10, y+10, 14, 4);
  ctx.globalAlpha = 1;
}

function _drawBarrier(ctx, x, y) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x+3, y+3, 52, 22);
  ctx.fillStyle = '#f39c12'; ctx.fillRect(x, y, 52, 18);
  ctx.fillStyle = '#1a1a2e';
  for (let i = 0; i < 4; i++) ctx.fillRect(x+i*13, y, 7, 18);
  ctx.fillStyle = '#95a5a6'; ctx.fillRect(x+2, y+14, 8, 22); ctx.fillRect(x+42, y+14, 8, 22);
  ctx.fillStyle = '#c0c0c0'; ctx.fillRect(x+3, y+15, 6, 20); ctx.fillRect(x+43, y+15, 6, 20);
}

function _drawChild(ctx, x, y) {
  const shirts = ['#e74c3c','#3498db','#f1c40f','#27ae60','#e67e22'];
  const col = shirts[Math.abs(Math.floor(x * 0.13)) % shirts.length];
  ctx.fillStyle = col; ctx.fillRect(x+2, y+8, 10, 10);
  ctx.fillStyle = '#f5cba7'; ctx.fillRect(x+3, y, 8, 8);
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+3, y, 8, 3);
  ctx.fillStyle = '#2980b9'; ctx.fillRect(x+2, y+16, 4, 6); ctx.fillRect(x+8, y+16, 4, 6);
  ctx.fillStyle = '#d35400'; ctx.fillRect(x+2, y+22, 4, 4); ctx.fillRect(x+8, y+22, 4, 4);
  ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x+5, y+4, 2, 2); ctx.fillRect(x+8, y+4, 2, 2);
}

// ============================================================
// COLLECTIBLE
// ============================================================

class Collectible {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.type = type;
    this.r = 12; // collection radius
    this.collected = false;
    this.t = Math.random() * Math.PI * 2;
    this.value = type === 'coin' ? 10 : type === 'star' ? 50 : 0;
  }
  update(dt) { this.t += dt * 2.8; }
  draw(ctx, ox, oy) {
    if (this.collected) return;
    const x = Math.round(this.x + ox);
    const y = Math.round(this.y + oy + Math.sin(this.t) * 3.5);
    switch (this.type) {
      case 'coin':  _drawCoin(ctx, x, y); break;
      case 'date':  _drawDate(ctx, x, y); break;
      case 'star':  _drawStar(ctx, x, y); break;
    }
  }
}

function _drawCoin(ctx, x, y) {
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x-8, y+8, 16, 5);
  ctx.fillStyle = '#c8960e'; ctx.fillRect(x-9, y-9, 18, 18);
  ctx.fillStyle = COLORS.gold; ctx.fillRect(x-7, y-7, 14, 14);
  ctx.fillStyle = '#f5d060'; ctx.fillRect(x-5, y-5, 10, 10);
  ctx.fillStyle = '#c8960e'; ctx.fillRect(x-1, y-5, 2, 10); ctx.fillRect(x-4, y-1, 8, 2);
}

function _drawDate(ctx, x, y) {
  ctx.fillStyle = '#5a2d0c'; ctx.fillRect(x-7, y-10, 14, 20);
  ctx.fillStyle = '#a0520c'; ctx.fillRect(x-5, y-8, 10, 16);
  ctx.fillStyle = '#d4840e'; ctx.fillRect(x-3, y-5, 6, 10);
  ctx.fillStyle = '#8b6914'; ctx.fillRect(x-1, y-14, 2, 6);
}

function _drawStar(ctx, x, y) {
  ctx.fillStyle = '#ffe000';
  ctx.fillRect(x-2, y-10, 4, 20);
  ctx.fillRect(x-10, y-2, 20, 4);
  ctx.fillRect(x-6, y-6, 5, 5);
  ctx.fillRect(x+1, y-6, 5, 5);
  ctx.fillRect(x-6, y+1, 5, 5);
  ctx.fillRect(x+1, y+1, 5, 5);
  ctx.fillStyle = '#fff380';
  ctx.fillRect(x-1, y-8, 2, 5);
}

// ============================================================
// POWER-UP
// ============================================================

const PU_COLORS = { rope: '#a07820', shoes: '#c0392b', magnet: '#8e44ad' };

class PowerUp {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.type = type;
    this.r = 18;
    this.collected = false;
    this.t = Math.random() * Math.PI * 2;
  }
  update(dt) { this.t += dt * 1.8; }
  draw(ctx, ox, oy) {
    if (this.collected) return;
    const x = Math.round(this.x + ox);
    const y = Math.round(this.y + oy + Math.sin(this.t) * 4);
    const glow = 0.25 + Math.sin(this.t * 2) * 0.15;
    ctx.globalAlpha = glow;
    ctx.fillStyle = PU_COLORS[this.type];
    ctx.fillRect(x-18, y-18, 36, 36);
    ctx.globalAlpha = 1;
    // Inner badge
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x-13, y-13, 26, 26);
    ctx.fillStyle = PU_COLORS[this.type];
    ctx.fillRect(x-11, y-11, 22, 22);
    // Icon
    switch (this.type) {
      case 'rope':   _drawRopeIcon(ctx, x, y); break;
      case 'shoes':  _drawShoesIcon(ctx, x, y); break;
      case 'magnet': _drawMagnetIcon(ctx, x, y); break;
    }
  }
  color() { return PU_COLORS[this.type]; }
}

function _drawRopeIcon(ctx, x, y) {
  ctx.fillStyle = '#f5dfa0';
  ctx.fillRect(x-8, y-7, 16, 4); ctx.fillRect(x-8, y-3, 4, 10); ctx.fillRect(x+4, y-3, 4, 10);
  ctx.fillRect(x-8, y+7, 16, 4); ctx.fillRect(x-3, y-3, 6, 6);
}

function _drawShoesIcon(ctx, x, y) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(x-9, y+2, 18, 8); ctx.fillRect(x-9, y-4, 12, 8);
  ctx.fillStyle = '#cc2222'; ctx.fillRect(x-7, y+4, 14, 4);
  ctx.fillStyle = '#888'; ctx.fillRect(x-6, y+4, 2, 4); ctx.fillRect(x, y+4, 2, 4); ctx.fillRect(x+6, y+4, 2, 4);
}

function _drawMagnetIcon(ctx, x, y) {
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(x-8, y-8, 6, 14); ctx.fillRect(x+2, y-8, 6, 14); ctx.fillRect(x-8, y-8, 18, 6);
  ctx.fillStyle = '#888'; ctx.fillRect(x-8, y+4, 6, 5);
  ctx.fillStyle = '#3498db'; ctx.fillRect(x+2, y+4, 6, 5);
}

// ============================================================
// PLAYER
// ============================================================

class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 24; this.h = 32;
    this.vx = 0; this.vy = 0;
    this.dir = 'down';
    this.frame = 0; this.frameT = 0;
    this.moving = false;
    this.sprinting = false;
    this.stamina = CONFIG.STAMINA_MAX;
    this.dustT = 0;

    // Power-up state
    this.ropeTtl = 0;
    this.shoesTtl = 0;
    this.magnetTtl = 0;
    this.magnetR = 125;
  }

  get hasRope()   { return this.ropeTtl > 0; }
  get hasShoes()  { return this.shoesTtl > 0; }
  get hasMagnet() { return this.magnetTtl > 0; }

  activatePowerUp(type) {
    if (type === 'rope')   this.ropeTtl   = 5;
    if (type === 'shoes')  this.shoesTtl  = 8;
    if (type === 'magnet') this.magnetTtl = 10;
  }

  // Returns rect for collision (feet area, top-down)
  collRect() { return { x: this.x-11, y: this.y-6, w: 22, h: 22 }; }

  update(dt, keys, mobile, obstacles) {
    // ---- Input ----
    let dx = 0, dy = 0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
    if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= 1;
    if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += 1;
    if (mobile.dx) { dx += mobile.dx; }
    if (mobile.dy) { dy += mobile.dy; }
    // clamp diagonal
    const inputMag = Math.sqrt(dx*dx + dy*dy);
    if (inputMag > 1) { dx /= inputMag; dy /= inputMag; }

    const wantSprint = (keys[' '] || keys['Shift'] || mobile.sprint) && this.stamina > 0;

    // ---- Stamina ----
    if (wantSprint && inputMag > 0.1) {
      this.sprinting = true;
      this.stamina = Math.max(0, this.stamina - CONFIG.STAMINA_DRAIN * dt);
    } else {
      this.sprinting = false;
      this.stamina = Math.min(CONFIG.STAMINA_MAX, this.stamina + CONFIG.STAMINA_REGEN * dt);
    }

    // ---- Power-up timers ----
    if (this.ropeTtl   > 0) this.ropeTtl   -= dt;
    if (this.shoesTtl  > 0) this.shoesTtl  -= dt;
    if (this.magnetTtl > 0) this.magnetTtl -= dt;

    // ---- Speed ----
    let spd = this.sprinting ? CONFIG.PLAYER_SPRINT_SPEED : CONFIG.PLAYER_SPEED;
    if (this.hasShoes) spd *= 1.45;

    this.vx = dx * spd;
    this.vy = dy * spd;
    this.moving = inputMag > 0.05;

    // ---- Direction ----
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx < -0.1) this.dir = 'left';
      else if (dx > 0.1) this.dir = 'right';
    } else {
      if (dy < -0.1) this.dir = 'up';
      else if (dy > 0.1) this.dir = 'down';
    }

    // ---- Move with collision ----
    this._tryMove(this.x + this.vx * dt, this.y, obstacles);
    this._tryMove(this.x, this.y + this.vy * dt, obstacles);

    // ---- Animation ----
    if (this.moving) {
      this.frameT += dt;
      const spd2 = this.sprinting ? 0.1 : 0.16;
      if (this.frameT >= spd2) { this.frameT = 0; this.frame = (this.frame + 1) % 4; }
    } else {
      this.frame = 0;
    }
  }

  _tryMove(nx, ny, obstacles) {
    nx = clamp(nx, 14, CONFIG.WORLD_W - 14);
    ny = clamp(ny, 14, CONFIG.WORLD_H - 14);
    const tr = { x: nx-11, y: ny-6, w: 22, h: 22 };
    for (const o of obstacles) {
      if (o.slippery) continue;
      if (rectOverlap(tr.x, tr.y, tr.w, tr.h, o.x, o.y, o.w, o.h)) return;
    }
    this.x = nx; this.y = ny;
  }

  draw(ctx, ox, oy) {
    const x = Math.round(this.x + ox);
    const y = Math.round(this.y + oy);
    const fr = this.frame;
    const dir = this.dir;
    const walk = this.moving ? Math.sin(fr * Math.PI / 2) : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x-11, y+14, 22, 7);

    // Arms
    const armSwing = this.moving ? walk * 3 : 0;
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(x-16, y+2+armSwing, 7, 14);
    ctx.fillRect(x+9,  y+2-armSwing, 7, 14);
    ctx.fillStyle = '#f5cba7';
    ctx.fillRect(x-16, y+14+armSwing, 7, 6);
    ctx.fillRect(x+9,  y+14-armSwing, 7, 6);

    // Thobe body
    ctx.fillStyle = '#f0efea';
    ctx.fillRect(x-11, y-2, 22, 30);
    // Thobe vertical seam
    ctx.fillStyle = '#d8d4c8';
    ctx.fillRect(x-1, y-2, 2, 30);
    // Bottom trim
    ctx.fillStyle = '#c8c4b0';
    ctx.fillRect(x-11, y+26, 22, 4);

    // Feet
    const footA = this.moving ? walk * 3 : 0;
    ctx.fillStyle = '#c0b89a';
    ctx.fillRect(x-9, y+28+footA, 9, 5);
    ctx.fillRect(x,   y+28-footA, 9, 5);

    // Head
    ctx.fillStyle = '#f5cba7';
    ctx.fillRect(x-7, y-19, 14, 15);

    // Face (eyes & mouth)
    ctx.fillStyle = '#1a1a2e';
    if (dir === 'left') {
      ctx.fillRect(x-5, y-14, 3, 3);
      ctx.fillStyle = '#c07060'; ctx.fillRect(x-4, y-9, 5, 2);
    } else if (dir === 'right') {
      ctx.fillRect(x+2, y-14, 3, 3);
      ctx.fillStyle = '#c07060'; ctx.fillRect(x-1, y-9, 5, 2);
    } else if (dir !== 'up') {
      ctx.fillRect(x-4, y-14, 3, 3); ctx.fillRect(x+1, y-14, 3, 3);
      ctx.fillStyle = '#c07060'; ctx.fillRect(x-2, y-9, 5, 2);
    }

    // Shemagh (headscarf) - white base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x-9, y-24, 18, 8);
    // Red checkered pattern
    ctx.fillStyle = '#cc1111';
    for (let ci = 0; ci < 3; ci++) {
      ctx.fillRect(x-9+ci*6, y-24, 3, 4);
      ctx.fillRect(x-9+ci*6+3, y-20, 3, 4);
    }
    // Side drape
    const drapeX = dir === 'left' ? x+5 : x-13;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(drapeX, y-22, 8, 20);
    ctx.fillStyle = '#cc1111';
    ctx.fillRect(drapeX, y-22, 4, 5);
    ctx.fillRect(drapeX+4, y-17, 4, 5);
    ctx.fillRect(drapeX, y-12, 4, 5);

    // Egal (black ring)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x-9, y-17, 18, 3);

    // Sprint glow
    if (this.sprinting || this.hasShoes) {
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#ffdd44';
      ctx.fillRect(x-14, y-24, 28, 58);
      ctx.globalAlpha = 1;
    }

    // Magnet ring
    if (this.hasMagnet) {
      const pulse = 0.25 + Math.sin(Date.now() * 0.004) * 0.12;
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - this.magnetR, y - this.magnetR, this.magnetR*2, this.magnetR*2);
      ctx.globalAlpha = 1;
    }
  }
}

// ============================================================
// SHEEP
// ============================================================

class Sheep {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 30; this.h = 22;
    this.speed = CONFIG.SHEEP_BASE_SPEED;
    this.dir = 'right';
    this.frame = 0; this.frameT = 0;
    this.fleeing = false;
    this.targetX = x; this.targetY = y;
    this.thinkT = 0;
    this.dashT = 0;
    this.slowTtl = 0;
    this.level = 1;
    this.caught = false;
    this.bleatT = 2 + Math.random() * 3;
  }

  setLevel(level) {
    this.level = level;
    this.speed = CONFIG.SHEEP_BASE_SPEED + (level - 1) * 32;
  }

  slow(dur) { this.slowTtl = dur; }

  // Collision rect
  collRect() { return { x: this.x-14, y: this.y-6, w: 28, h: 20 }; }

  update(dt, px, py, obstacles) {
    if (this.slowTtl > 0) this.slowTtl -= dt;
    const effSpd = this.slowTtl > 0 ? this.speed * 0.28 : this.speed;

    const dist2p = Math.sqrt((this.x-px)**2 + (this.y-py)**2);
    const fleeDist = CONFIG.SHEEP_FLEE_DIST * (1 + this.level * 0.15);
    this.fleeing = dist2p < fleeDist;

    this.thinkT -= dt;
    this.dashT   -= dt;

    if (this.fleeing) {
      const fx = this.x - px, fy = this.y - py;
      const fm = Math.sqrt(fx*fx + fy*fy) || 1;
      const nx = this.x + (fx/fm) * 220;
      const ny = this.y + (fy/fm) * 220;
      // Occasional evasive dash
      if (this.dashT <= 0 && Math.random() < 0.008 * this.level) {
        this.dashT = 2.5 + Math.random() * 2;
        this.targetX = this.x + (fx/fm) * 480;
        this.targetY = this.y + (fy/fm) * 480;
      } else if (this.thinkT <= 0) {
        this.thinkT = 0.3 + Math.random() * 0.5;
        // Add slight random perpendicular jitter for unpredictability
        const perp = Math.random() < 0.5 ? 1 : -1;
        this.targetX = nx + (-fy/fm) * 80 * perp;
        this.targetY = ny + (fx/fm) * 80 * perp;
      }
    } else {
      if (this.thinkT <= 0) {
        this.thinkT = 1.5 + Math.random() * 2.5;
        this.targetX = 120 + Math.random() * (CONFIG.WORLD_W - 240);
        this.targetY = 120 + Math.random() * (CONFIG.WORLD_H - 240);
      }
    }

    // Move toward target
    const tdx = this.targetX - this.x;
    const tdy = this.targetY - this.y;
    const td  = Math.sqrt(tdx*tdx + tdy*tdy);

    if (td > 8) {
      const spd = this.fleeing ? effSpd * 1.15 : effSpd * 0.55;
      const nx = this.x + (tdx/td) * spd * dt;
      const ny = this.y + (tdy/td) * spd * dt;
      this._tryMove(nx, this.y, obstacles);
      this._tryMove(this.x, ny, obstacles);
      if (Math.abs(tdx) > Math.abs(tdy)) this.dir = tdx > 0 ? 'right' : 'left';
      else this.dir = tdy > 0 ? 'down' : 'up';
    }

    // Animate
    this.frameT += dt;
    const animSpd = this.fleeing ? 0.1 : 0.18;
    if (this.frameT >= animSpd) { this.frameT = 0; this.frame = (this.frame + 1) % 4; }

    // Occasional bleat when fleeing
    this.bleatT -= dt;
    if (this.bleatT <= 0 && this.fleeing) {
      this.bleatT = 2.5 + Math.random() * 3.5;
      audio.play('bleat');
    } else if (this.bleatT <= 0) {
      this.bleatT = 2.5 + Math.random() * 3.5;
    }
  }

  _tryMove(nx, ny, obstacles) {
    nx = clamp(nx, 20, CONFIG.WORLD_W - 20);
    ny = clamp(ny, 20, CONFIG.WORLD_H - 20);
    const tr = { x: nx-14, y: ny-6, w: 28, h: 20 };
    for (const o of obstacles) {
      if (o.slippery) continue;
      if (rectOverlap(tr.x, tr.y, tr.w, tr.h, o.x, o.y, o.w, o.h)) {
        // Redirect on obstacle
        this.thinkT = 0;
        return;
      }
    }
    this.x = nx; this.y = ny;
  }

  draw(ctx, ox, oy) {
    const x = Math.round(this.x + ox);
    const y = Math.round(this.y + oy);
    const fr = this.frame;
    const flip = this.dir === 'left';
    const bounce = this.fleeing ? Math.sin(fr * Math.PI / 2) * 2.5 : 0;
    const legAnim = Math.sin(fr * Math.PI / 2) * 4;

    ctx.save();
    if (flip) { ctx.translate(x * 2, 0); ctx.scale(-1, 1); }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x-13, y+14, 26, 6);

    // Legs
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(x-10, y+12+legAnim, 7, 9);
    ctx.fillRect(x+ 3, y+12-legAnim, 7, 9);
    ctx.fillRect(x- 4, y+12-legAnim, 7, 8);
    ctx.fillRect(x+ 9, y+12+legAnim, 7, 8);
    // Hooves
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x-10, y+19+legAnim, 7, 4);
    ctx.fillRect(x+ 3, y+19-legAnim, 7, 4);
    ctx.fillRect(x- 4, y+19-legAnim, 7, 4);
    ctx.fillRect(x+ 9, y+19+legAnim, 7, 4);

    // Wool body
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(x-14, y-1+bounce, 28, 16);
    // Wool bumps (darker)
    ctx.fillStyle = '#dcdcdc';
    ctx.fillRect(x-14, y-1+bounce, 9, 7);
    ctx.fillRect(x-3,  y-6+bounce, 9, 7);
    ctx.fillRect(x+7,  y-1+bounce, 9, 7);
    ctx.fillRect(x-10, y+5+bounce, 8, 7);
    ctx.fillRect(x+ 2, y+5+bounce, 8, 7);
    ctx.fillRect(x+11, y+5+bounce, 5, 6);
    // Highlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x-12, y-1+bounce, 6, 4);
    ctx.fillRect(x- 1, y-6+bounce, 6, 4);

    // Tail (left side)
    ctx.fillStyle = '#eaeaea';
    ctx.fillRect(x-20, y+1+bounce, 8, 8);

    // Head (black/dark)
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(x+10, y-13+bounce, 16, 16);
    // Snout
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x+20, y-7+bounce, 9, 9);
    // Nostrils
    ctx.fillStyle = '#ff9999';
    ctx.fillRect(x+21, y-5+bounce, 3, 2);
    ctx.fillRect(x+25, y-5+bounce, 3, 2);
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x+12, y-11+bounce, 5, 5);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x+13, y-10+bounce, 3, 3);
    ctx.fillStyle = '#ffffff'; // eye shine
    ctx.fillRect(x+15, y-10+bounce, 1, 1);
    // Ear
    ctx.fillStyle = '#ff9999';
    ctx.fillRect(x+10, y-17+bounce, 8, 7);
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(x+10, y-17+bounce, 8, 4);

    // Rope effect when slowed
    if (this.slowTtl > 0) {
      ctx.strokeStyle = '#a07820';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x-14, y+8+bounce);
      ctx.lineTo(x-36, y+8+bounce);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
}

// ============================================================
// HELPER (AI companion purchased with coins)
// ============================================================

class Helper {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 20; this.h = 36;
    this.speed = 168;
    this.dir = 'right';
    this.frame = 0; this.frameT = 0;
    this.ttl = 18;
    this.maxTtl = 18;
    this.active = true;
  }

  update(dt, sheepList, obstacles) {
    this.ttl -= dt;
    if (this.ttl <= 0) { this.active = false; return; }

    // Find nearest uncaught sheep
    let nearest = null, nearestDist = Infinity;
    for (const s of sheepList) {
      if (s.caught) continue;
      const d = _dist(this.x, this.y, s.x, s.y);
      if (d < nearestDist) { nearestDist = d; nearest = s; }
    }
    if (!nearest) return;

    // Chase
    const dx = nearest.x - this.x, dy = nearest.y - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 6) {
      const spd = this.speed * dt;
      this._tryMove((dx / d) * spd, (dy / d) * spd, obstacles);
      this.dir = dx > 0 ? 'right' : 'left';
    }

    // Animate
    this.frameT += dt;
    if (this.frameT > 0.16) { this.frameT = 0; this.frame = (this.frame + 1) % 4; }
  }

  _tryMove(dx, dy, obstacles) {
    this.x += dx;
    for (const o of obstacles) {
      if (!o.solid) continue;
      const r = o.collRect();
      if (rectOverlap(this.x - 10, this.y - 8, 20, 20, r.x, r.y, r.w, r.h)) { this.x -= dx; break; }
    }
    this.y += dy;
    for (const o of obstacles) {
      if (!o.solid) continue;
      const r = o.collRect();
      if (rectOverlap(this.x - 10, this.y - 8, 20, 20, r.x, r.y, r.w, r.h)) { this.y -= dy; break; }
    }
    this.x = clamp(this.x, 30, CONFIG.WORLD_W - 30);
    this.y = clamp(this.y, 30, CONFIG.WORLD_H - 30);
  }

  draw(ctx, ox, oy) {
    const x = Math.round(this.x + ox);
    const y = Math.round(this.y + oy);
    const fr = this.frame;
    const flip = this.dir === 'left';

    if (flip) { ctx.save(); ctx.translate(x * 2, 0); ctx.scale(-1, 1); }

    // Expiry warning glow
    if (this.ttl < 5) {
      ctx.globalAlpha = 0.25 + Math.abs(Math.sin(this.ttl * 4)) * 0.3;
      ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.arc(x, y + 2, 22, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(x, y + 20, 11, 4, 0, 0, Math.PI * 2); ctx.fill();

    const legOff = Math.sin(fr * Math.PI / 2) * 4;
    const armSwing = Math.sin(fr * Math.PI / 2) * 5;

    // Legs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6, y + 8 + legOff, 8, 12);
    ctx.fillRect(x + 2, y + 8 - legOff, 8, 12);

    // Blue thobe body
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(x - 10, y - 10, 20, 24);

    // Arms
    ctx.fillRect(x - 16, y - 8 + armSwing, 8, 14);
    ctx.fillRect(x + 8,  y - 8 - armSwing, 8, 14);

    // Hands
    ctx.fillStyle = '#c8956c';
    ctx.fillRect(x - 17, y + 4 + armSwing, 7, 6);
    ctx.fillRect(x + 10, y + 4 - armSwing, 7, 6);

    // Head
    ctx.fillStyle = '#c8956c';
    ctx.fillRect(x - 7, y - 22, 14, 14);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 4, y - 17, 3, 3);
    ctx.fillRect(x + 2, y - 17, 3, 3);

    // White ghutra
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 8, y - 25, 16, 6);
    ctx.fillRect(x - 10, y - 20, 5, 10);
    ctx.fillRect(x + 5,  y - 20, 5, 10);

    // Black egal
    ctx.fillStyle = '#222';
    ctx.fillRect(x - 8, y - 21, 16, 3);

    if (flip) ctx.restore();

    // TTL bar above helper
    const barW = 32;
    const pct = clamp(this.ttl / this.maxTtl, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - barW / 2, y - 32, barW, 4);
    ctx.fillStyle = pct > 0.35 ? '#44ff88' : '#ff6633';
    ctx.fillRect(x - barW / 2, y - 32, barW * pct, 4);
  }
}

// ============================================================
// UI
// ============================================================

class UI {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.font = "'Courier New', monospace";
    this.arabicFont = "Tahoma, 'Simplified Arabic', 'Arabic UI Text', Arial, sans-serif";
  }

  get activeFont() { return LANG === 'ar' ? this.arabicFont : this.font; }

  // ---- HUD ----
  drawHUD(ctx, score, coins, timer, stamina, level, pw, sheepLeft, sheepTotal, canHelp) {
    // Background bar
    ctx.fillStyle = 'rgba(10,10,20,0.72)';
    ctx.fillRect(0, 0, this.w, 46);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(0, 44, this.w, 2);

    // Score
    this._text(ctx, `${T('score')}: ${score}`, 10, 29, COLORS.gold, 'bold 14px');

    // Coins icon + count
    _drawCoin(ctx, 132, 22);
    this._text(ctx, `x${coins}`, 146, 29, '#ffe840', 'bold 14px');

    // Timer (center)
    const tColor = timer <= 10 ? '#ff4444' : '#ffffff';
    const mm = String(Math.floor(timer / 60)).padStart(2, '0');
    const ss = String(Math.floor(timer % 60)).padStart(2, '0');
    this._text(ctx, `${mm}:${ss}`, this.w/2 - 22, 30, tColor, 'bold 18px', 'left');

    // Sheep remaining
    const sheepColor = sheepLeft === 1 ? '#ff9944' : '#ffdd88';
    this._text(ctx, `${T('sheep')}: ${sheepLeft}/${sheepTotal}`, this.w - 202, 29, sheepColor, 'bold 13px');

    // Level
    this._text(ctx, `${T('level')} ${level}`, this.w - 68, 29, '#88ff88', 'bold 14px');

    // Stamina bar
    const sx = this.w/2 + 56, sy = 8, sw = 130, sh = 14;
    ctx.fillStyle = '#333'; ctx.fillRect(sx, sy, sw, sh);
    const pct = clamp(stamina / CONFIG.STAMINA_MAX, 0, 1);
    ctx.fillStyle = pct > 0.3 ? '#22bb55' : '#dd3322';
    ctx.fillRect(sx, sy, sw * pct, sh);
    ctx.strokeStyle = '#666'; ctx.lineWidth = 1; ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(sx+2, sy+2, sw*pct - 4, 3);
    this._text(ctx, T('stamina'), sx+22, sy+11, '#fff', '10px');

    // Power-up indicators
    let ix = 10, iy = 50;
    if (pw.rope   > 0) ix = this._puTag(ctx, ix, iy, T('rope'),   pw.rope,   '#a07820');
    if (pw.shoes  > 0) ix = this._puTag(ctx, ix, iy, T('sprint'), pw.shoes,  '#c0392b');
    if (pw.magnet > 0) ix = this._puTag(ctx, ix, iy, T('magnet'), pw.magnet, '#8e44ad');

    // Helper hint (right side of second row)
    if (canHelp) {
      const pulse = 0.65 + Math.sin(Date.now() / 300) * 0.25;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#1a6fbb';
      ctx.fillRect(this.w - 138, 50, 130, 28);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(this.w - 138, 50, 130, 10);
      ctx.globalAlpha = 1;
      this._text(ctx, T('callHelp'), this.w - 134, 60, '#ffffff', '9px');
      this._text(ctx, T('helpCost'), this.w - 134, 74, '#ffe840', 'bold 10px');
    }
  }

  _puTag(ctx, x, y, label, ttl, color) {
    ctx.fillStyle = color; ctx.fillRect(x, y, 56, 28);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y, 56, 10);
    this._text(ctx, label, x+4, y+10, '#fff', '9px');
    this._text(ctx, Math.ceil(ttl)+'s', x+4, y+24, '#fff', 'bold 11px');
    return x + 62;
  }

  // ---- Main Menu ----
  drawMenu(ctx, best, time) {
    // Sky gradient (block style)
    ctx.fillStyle = '#001a33'; ctx.fillRect(0, 0, this.w, this.h);
    ctx.fillStyle = '#003366'; ctx.fillRect(0, this.h*0.4, this.w, this.h*0.6);

    // Stars
    for (let i = 0; i < 50; i++) {
      const sx = (i * 157 + 13) % this.w;
      const sy = (i * 97  + 7)  % (this.h * 0.45);
      const tw = i%5===0 ? 3 : 2;
      ctx.fillStyle = i%7===0 ? COLORS.gold : '#ffffff';
      ctx.fillRect(sx, sy, tw, tw);
    }
    // Twinkling stars (flicker 2 of them)
    const tw1 = Math.floor(time*3) % 2 === 0;
    ctx.fillStyle = tw1 ? COLORS.gold : '#ffffff';
    ctx.fillRect(60, 30, 4, 4); ctx.fillRect(58,28,8,2); ctx.fillRect(62,24,2,8);
    ctx.fillStyle = !tw1 ? COLORS.gold : '#ffffff';
    ctx.fillRect(700, 80, 4, 4);

    // Crescent moon
    // ctx.fillStyle = '#e8d060';
    // ctx.fillRect(this.w-120, 25, 55, 55);
    // ctx.fillStyle = '#001a33';
    // ctx.fillRect(this.w-106, 18, 55, 55);
    // ctx.fillStyle = '#e8d060'; ctx.fillRect(this.w-80, 38, 4, 4); ctx.fillRect(this.w-60, 28, 3, 3);

    // Ground
    ctx.fillStyle = COLORS.sand; ctx.fillRect(0, this.h-90, this.w, 90);
    ctx.fillStyle = COLORS.road; ctx.fillRect(0, this.h-65, this.w, 44);
    ctx.fillStyle = '#e8d020';
    for (let rx = 0; rx < this.w; rx += 80) ctx.fillRect(rx, this.h-46, 50, 8);
    ctx.fillStyle = COLORS.sidewalk;
    ctx.fillRect(0, this.h-90, this.w, 25); ctx.fillRect(0, this.h-21, this.w, 21);

    // Language toggle button (top-left)
    this._langToggleBtn(ctx, time);
    

    // Title panel
    ctx.fillStyle = 'rgba(0,20,50,0.78)';
    ctx.fillRect(this.w/2-230, 52, 460, 108);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(this.w/2-230, 52, 460, 4);
    ctx.fillRect(this.w/2-230, 156, 460, 4);
    ctx.fillStyle = COLORS.gold;
    const titleSize = LANG === 'ar' ? 30 : 38;
    ctx.font = `bold ${titleSize}px ` + this.activeFont;
    ctx.direction = LANG === 'ar' ? 'rtl' : 'ltr';
    ctx.textAlign = 'center';
    ctx.fillText(T('title'), this.w/2, 108);
    ctx.fillStyle = '#cccccc';
    ctx.font = '14px ' + this.activeFont;
    ctx.fillText(T('subtitle'), this.w/2, 140);
    ctx.textAlign = 'left';
    ctx.direction = 'ltr';

    // Buttons (4 items — tighter 52 px step)
    this._btn(ctx, this.w/2-105, 168, 210, 44, T('startGame'),    '#1e8449', '#27ae60');
    this._btn(ctx, this.w/2-105, 220, 210, 44, T('instructions'), COLORS.deepBlue, '#0080b3');
    this._btn(ctx, this.w/2-105, 272, 210, 44, T('highScores'),   COLORS.burgundy, '#a02855');
    this._btn(ctx, this.w/2-105, 324, 210, 44, T('credits'),      '#4a4a7a', '#6666aa');

    if (best > 0) {
      this._text(ctx, `${T('best')}: ${best}`, this.w/2, 390, COLORS.gold, '14px', 'center');
    }

    // Menu characters
    this._menuSheep(ctx, 55, this.h-105);
    this._menuPlayer(ctx, 165, this.h-98);

    // Eid lanterns
    this._lanternSmall(ctx, 30, 120, time);
    this._lanternSmall(ctx, this.w-50, 100, time+1.2);
    this._lanternSmall(ctx, this.w-90, 150, time+0.6);
  }

  _lanternSmall(ctx, x, y, t) {
    const g = 0.5+Math.sin(t*2.5)*0.35;
    ctx.fillStyle='#555'; ctx.fillRect(x-1,y-35,2,20);
    ctx.globalAlpha=g*0.3; ctx.fillStyle='#ffcc44'; ctx.fillRect(x-14,y-14,28,28); ctx.globalAlpha=1;
    ctx.fillStyle=COLORS.burgundy; ctx.fillRect(x-7,y-14,14,20);
    ctx.globalAlpha=g; ctx.fillStyle='#ffcc44'; ctx.fillRect(x-4,y-11,8,14); ctx.globalAlpha=1;
    ctx.fillStyle=COLORS.gold; ctx.fillRect(x-9,y-16,18,4); ctx.fillRect(x-8,y+6,16,4);
  }

  _menuSheep(ctx, x, y) {
    ctx.fillStyle='#2c2c2c'; ctx.fillRect(x+12,y-12,14,14);
    ctx.fillStyle='#f5f5f5'; ctx.fillRect(x-12,y,28,16);
    ctx.fillStyle='#dcdcdc'; ctx.fillRect(x-12,y,8,7); ctx.fillRect(x-2,y-5,8,7); ctx.fillRect(x+8,y,8,7);
    ctx.fillStyle='#2c2c2c'; ctx.fillRect(x-8,y+14,6,9); ctx.fillRect(x+4,y+14,6,9);
    ctx.fillStyle='#4a4a4a'; ctx.fillRect(x+22,y-7,8,8);
    ctx.fillStyle='#ff9999'; ctx.fillRect(x+23,y-5,3,2); ctx.fillRect(x+27,y-5,3,2);
    ctx.fillStyle='#fff'; ctx.fillRect(x+14,y-10,4,4); ctx.fillStyle='#1a1a2e'; ctx.fillRect(x+15,y-9,2,2);
  }

  _menuPlayer(ctx, x, y) {
    ctx.fillStyle='#f0efea'; ctx.fillRect(x-9,y,18,26);
    ctx.fillStyle='#f5cba7'; ctx.fillRect(x-6,y-16,12,14);
    ctx.fillStyle='#fff'; ctx.fillRect(x-8,y-22,16,8);
    ctx.fillStyle='#cc1111'; for(let i=0;i<3;i++){ctx.fillRect(x-8+i*6,y-22,3,4);ctx.fillRect(x-8+i*6+3,y-18,3,4);}
    ctx.fillStyle='#1a1a2e'; ctx.fillRect(x-8,y-15,16,3);
    ctx.fillRect(x-3,y-12,2,2); ctx.fillRect(x+2,y-12,2,2);
  }

  // ---- Pause ----
  drawPause(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, this.w, this.h);
    const bx = this.w/2-160, by = this.h/2-130, bw = 320, bh = 260;
    ctx.fillStyle = '#111a2e'; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw, bh);
    this._text(ctx, T('paused'), this.w/2, this.h/2-72, COLORS.gold, 'bold 30px', 'center');
    this._btn(ctx, this.w/2-95, this.h/2-28, 190, 46, T('resume'),  '#1e8449', '#27ae60');
    this._btn(ctx, this.w/2-95, this.h/2+34, 190, 46, T('quitMenu'),COLORS.burgundy, '#a02855');
  }

  // ---- Game Over ----
  drawGameOver(ctx, score, coins, level) {
    ctx.fillStyle = 'rgba(0,0,0,0.82)'; ctx.fillRect(0, 0, this.w, this.h);
    const bx = this.w/2-210, by = this.h/2-170, bw = 420, bh = 340;
    ctx.fillStyle = '#1a0808'; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 4; ctx.strokeRect(bx, by, bw, bh);
    this._text(ctx, T('escaped'),    this.w/2, by+55,  '#e74c3c', 'bold 26px', 'center');
    this._text(ctx, '( ._. )',       this.w/2, by+100, '#ffffff', '28px',      'center');
    this._text(ctx, `${T('scoreLabel')}: ${score}`, this.w/2, by+145, '#fff', '17px', 'center');
    this._text(ctx, `${T('coinsLabel')}: ${coins}`, this.w/2, by+172, '#fff', '17px', 'center');
    this._text(ctx, `${T('levelLabel')}: ${level}`, this.w/2, by+199, '#fff', '17px', 'center');
    this._btn(ctx, this.w/2-95, by+224, 190, 46, T('tryAgain'), '#1e8449',      '#27ae60');
    this._btn(ctx, this.w/2-95, by+282, 190, 46, T('mainMenu'), COLORS.deepBlue, '#0080b3');
  }

  // ---- Victory ----
  drawVictory(ctx, score, coins, level) {
    ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, 0, this.w, this.h);
    const bx = this.w/2-215, by = this.h/2-185, bw = 430, bh = 370;
    ctx.fillStyle = '#081a08'; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 4; ctx.strokeRect(bx, by, bw, bh);
    this._text(ctx, T('caughtAll'),   this.w/2, by+52,  COLORS.gold, 'bold 28px', 'center');
    this._text(ctx, T('eidMubarak'), this.w/2, by+94,  '#88ff88',   'bold 20px', 'center');
    this._text(ctx, `${T('scoreLabel')}: ${score}`, this.w/2, by+140, '#fff', '17px', 'center');
    this._text(ctx, `${T('coinsLabel')}: ${coins}`, this.w/2, by+166, '#fff', '17px', 'center');
    this._text(ctx, `${T('levelFull')} ${level}`,   this.w/2, by+196, COLORS.gold, 'bold 17px', 'center');
    this._btn(ctx, this.w/2-95, by+226, 190, 46, T('nextLevel'), '#1e8449',      '#27ae60');
    this._btn(ctx, this.w/2-95, by+288, 190, 46, T('mainMenu'),  COLORS.deepBlue, '#0080b3');
  }

  // ---- Instructions ----
  drawInstructions(ctx) {
    ctx.fillStyle = COLORS.deepBlue; ctx.fillRect(0, 0, this.w, this.h);
    ctx.fillStyle = '#0d0d22'; ctx.fillRect(30, 30, this.w-60, this.h-60);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3; ctx.strokeRect(30, 30, this.w-60, this.h-60);
    this._text(ctx, T('instrTitle'), this.w/2, 72, COLORS.gold, 'bold 22px', 'center');

    const isAr = LANG === 'ar';
    const rows = T('instrRows');
    const kx   = isAr ? this.w - 60 : 60;
    const vx   = isAr ? 60 : 290;
    const kAl  = isAr ? 'right' : 'left';

    rows.forEach(([k, v], i) => {
      const ry = 104 + i * 25;
      const isHeader = isAr ? k.startsWith(':') : k.endsWith(':');
      if (isHeader) {
        this._text(ctx, k, kx, ry, COLORS.gold, 'bold 13px', kAl);
      } else {
        this._text(ctx, k, kx, ry, '#aaaaaa', '13px', kAl);
        if (v) this._text(ctx, v, vx, ry, '#ffffff', '13px', isAr ? 'left' : 'left');
      }
    });

    this._btn(ctx, this.w/2-95, this.h-80, 190, 46, T('back'), COLORS.deepBlue, '#0080b3');
  }

  // ---- High Scores ----
  drawHighScores(ctx, scores) {
    ctx.fillStyle = COLORS.deepBlue; ctx.fillRect(0, 0, this.w, this.h);
    ctx.fillStyle = '#0d0d22'; ctx.fillRect(this.w/2-210, 30, 420, this.h-60);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3; ctx.strokeRect(this.w/2-210, 30, 420, this.h-60);
    this._text(ctx, T('highScores'), this.w/2, 72, COLORS.gold, 'bold 22px', 'center');

    if (scores.length === 0) {
      this._text(ctx, T('noScores'), this.w/2, 200, '#888', '15px', 'center');
    } else {
      // Column header
      this._text(ctx, `#  ${T('nameCol')}`, this.w/2-170, 100, '#666', '11px');
      this._text(ctx, T('scoreCol'), this.w/2+170, 100, '#666', '11px', 'right');

      scores.slice(0, 7).forEach((e, i) => {
        const ey  = 118 + i * 54;
        const col = i === 0 ? COLORS.gold : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#ffffff';
        ctx.fillStyle = i === 0 ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.04)';
        ctx.fillRect(this.w/2-185, ey-18, 370, 50);

        // Rank + Name (left)
        const nameDisplay = (e.name || 'Player').slice(0, 16);
        this._text(ctx, `${i+1}.  ${nameDisplay}`, this.w/2-170, ey+4, col, 'bold 14px');

        // Score (right-aligned)
        this._text(ctx, String(e.score).padStart(6,'0'), this.w/2+170, ey+4, col, 'bold 15px', 'right');

        // Sub-row: level + coins
        this._text(ctx, `${T('lvl')} ${e.level}  •  ${e.coins} ${T('coinsLabel')}`,
          this.w/2-170, ey+22, '#666', '11px');
      });
    }
    this._btn(ctx, this.w/2-95, this.h-80, 190, 46, T('back'), COLORS.deepBlue, '#0080b3');
  }

  // ---- Credits ----
  drawCredits(ctx, mx, my) {
    const W = this.w, H = this.h;

    // Background
    ctx.fillStyle = COLORS.deepBlue; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0a0a1e';       ctx.fillRect(40, 30, W-80, H-60);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3; ctx.strokeRect(40, 30, W-80, H-60);

    // Corner stars (pixel art)
    const starPts = [[56,46],[W-56,46],[56,H-46],[W-56,H-46]];
    starPts.forEach(([sx,sy]) => {
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(sx-4,sy-1,9,3); ctx.fillRect(sx-1,sy-4,3,9);
      ctx.fillRect(sx-3,sy-3,3,3); ctx.fillRect(sx+1,sy-3,3,3);
      ctx.fillRect(sx-3,sy+1,3,3); ctx.fillRect(sx+1,sy+1,3,3);
    });

    // Title
    this._text(ctx, T('creditsTitle'), W/2, 80, COLORS.gold, 'bold 26px', 'center');
    ctx.fillStyle = COLORS.gold; ctx.fillRect(W/2-80, 88, 160, 2);

    // Crescent decoration
    ctx.fillStyle = '#d4af37'; ctx.fillRect(W/2-16, 100, 32, 32);
    ctx.fillStyle = '#0a0a1e'; ctx.fillRect(W/2-8,  96,  32, 32);
    ctx.fillStyle = '#d4af37'; ctx.fillRect(W/2+6, 106, 4, 4); ctx.fillRect(W/2+12, 100, 3, 3);

    // Developer credit
    const isAr = LANG === 'ar';
    this._text(ctx, T('copyright') + '  ' + T('devBy'), W/2, 158, '#aaaaaa', '13px', 'center');
    this._text(ctx, T('devName'), W/2, 184, '#ffffff', 'bold 22px', 'center');

    // Divider
    ctx.fillStyle = 'rgba(212,175,55,0.35)'; ctx.fillRect(W/2-140, 196, 280, 1);

    // --- Link buttons ---
    const ghY  = H/2 + 10;
    const liY  = H/2 + 64;
    const bx   = W/2 - 130;
    const bw   = 260, bh = 42;

    // GitHub button
    const ghHover = this.hits(mx, my, bx, ghY, bw, bh);
    ctx.fillStyle = ghHover ? '#444' : '#24292e';
    ctx.fillRect(bx, ghY, bw, bh);
    ctx.strokeStyle = ghHover ? '#aaa' : '#555';
    ctx.lineWidth = 1; ctx.strokeRect(bx, ghY, bw, bh);
    // GitHub pixel icon
    this._ghIcon(ctx, bx + 18, ghY + 12);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px ' + this.activeFont;
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
    ctx.fillText('github.com/shhahad20', bx + 42, ghY + 27);
    if (ghHover) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(bx, ghY, bw, bh);
    }

    // LinkedIn button
    const liHover = this.hits(mx, my, bx, liY, bw, bh);
    ctx.fillStyle = liHover ? '#1a77b5' : '#0a66c2';
    ctx.fillRect(bx, liY, bw, bh);
    ctx.strokeStyle = liHover ? '#5ab4ff' : '#0a66c2';
    ctx.lineWidth = 1; ctx.strokeRect(bx, liY, bw, bh);
    // LinkedIn pixel icon
    this._liIcon(ctx, bx + 18, liY + 11);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px ' + this.activeFont;
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
    ctx.fillText('linkedin.com/in/shahadaltharwa', bx + 42, liY + 27);
    if (liHover) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(bx, liY, bw, bh);
    }

    ctx.textAlign = 'left'; ctx.direction = 'ltr';

    // "Click to open" hint
    this._text(ctx, isAr ? 'انقر للفتح في المتصفح' : 'Click to open in browser',
      W/2, liY + bh + 22, '#666666', '11px', 'center');

    // Eid lanterns flanking
    this._lanternSmall(ctx, 82, 160, 0);
    this._lanternSmall(ctx, W - 82, 160, 1.3);

    // Back button
    this._btn(ctx, W/2-95, H-80, 190, 46, T('back'), COLORS.deepBlue, '#0080b3');
  }

  // Small GitHub pixel-art cat icon (16×16)
  _ghIcon(ctx, x, y) {
    ctx.fillStyle = '#ffffff';
    // Body
    ctx.fillRect(x+2,y+4,12,10);
    ctx.fillRect(x,y+6,16,6);
    // Ears
    ctx.fillRect(x+2,y,3,5); ctx.fillRect(x+11,y,3,5);
    // Eyes
    ctx.fillStyle = '#24292e';
    ctx.fillRect(x+4,y+6,3,3); ctx.fillRect(x+9,y+6,3,3);
    // Nose
    ctx.fillRect(x+7,y+9,2,2);
    // Tail
    ctx.fillRect(x+14,y+10,3,4);
  }

  // Small LinkedIn pixel 'in' icon (18×18)
  _liIcon(ctx, x, y) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x,   y,   5,  5);   // top-left square
    ctx.fillRect(x,   y+7, 5,  12);  // left column
    ctx.fillRect(x+8, y+7, 5,  12);  // right column
    ctx.fillRect(x+8, y+11,10, 5);   // horizontal bridge
    ctx.fillRect(x+13,y+7, 5,  12);  // rightmost column
  }

  // ---- Minimap ----
  drawMinimap(ctx, px, py, sheepList, camX, camY, camW, camH) {
    const mw = 120, mh = 90;
    const mx = this.w - mw - 8, my = this.h - mh - 8;
    const scx = mw / CONFIG.WORLD_W, scy = mh / CONFIG.WORLD_H;
    ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 1; ctx.strokeRect(mx, my, mw, mh);
    // Camera view
    ctx.strokeStyle = 'rgba(255,255,80,0.45)';
    ctx.strokeRect(mx+camX*scx, my+camY*scy, camW*scx, camH*scy);
    // Player
    ctx.fillStyle = '#00ff66'; ctx.fillRect(mx+px*scx-2, my+py*scy-2, 5, 5);
    this._text(ctx, 'P', mx+px*scx+4, my+py*scy+3, '#00ff66', '8px');
    // All uncaught sheep
    sheepList.forEach(s => {
      if (s.caught) return;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(mx+s.x*scx-2, my+s.y*scy-2, 5, 5);
      this._text(ctx, 'S', mx+s.x*scx+4, my+s.y*scy+3, '#ffffff', '8px');
    });
  }

  // ---- Helpers ----
  _text(ctx, str, x, y, color, font, align = 'left') {
    ctx.fillStyle = color;
    ctx.font = font + ' ' + this.activeFont;
    ctx.direction = LANG === 'ar' ? 'rtl' : 'ltr';
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
    ctx.textAlign = 'left';
    ctx.direction = 'ltr';
  }

  _btn(ctx, x, y, w, h, label, dark, light) {
    ctx.fillStyle = '#000'; ctx.fillRect(x+4, y+4, w, h);
    ctx.fillStyle = light; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = dark;
    ctx.fillRect(x, y, w, 4); ctx.fillRect(x, y, 4, h);
    ctx.fillRect(x+w-4, y, 4, h); ctx.fillRect(x, y+h-4, w, 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, 4, 4); ctx.fillRect(x+w-4, y, 4, 4);
    ctx.fillRect(x, y+h-4, 4, 4); ctx.fillRect(x+w-4, y+h-4, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px ' + this.activeFont;
    ctx.direction = LANG === 'ar' ? 'rtl' : 'ltr';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w/2, y + h/2 + 5);
    ctx.textAlign = 'left';
    ctx.direction = 'ltr';
  }

  // Small language-toggle button (top-left corner of menu)
  _langToggleBtn(ctx, time) {
    const label = T('langBtn');
    const pulse = 0.75 + Math.sin(time * 1.8) * 0.15;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = COLORS.deepBlue; ctx.fillRect(8, 8, 78, 28);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 1; ctx.strokeRect(8, 8, 78, 28);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px ' + this.activeFont;
    ctx.direction = LANG === 'ar' ? 'rtl' : 'ltr';
    ctx.textAlign = 'center';
    ctx.fillText(label, 47, 27);
    ctx.textAlign = 'left';
    ctx.direction = 'ltr';

    // Copyright info and social media links beside the button
    // Copyright text
    ctx.font = '10px ' + this.activeFont;
    ctx.fillStyle = '#cccccc';
    ctx.textAlign = 'left';
    ctx.fillText('© 2026 Shahad Altharwa', 92, 22);

    // Social media names as links (drawn as underlined text)
    // GitHub
    ctx.font = 'bold 11px ' + this.activeFont;
    ctx.fillStyle = '#4078c0';
    ctx.textAlign = 'left';
    ctx.fillText('GitHub:', 92, 38);
    ctx.fillStyle = '#fff';
    ctx.fillText('shhahad20', 140, 38);
    // Underline username to indicate link
    const ghWidth = ctx.measureText('shhahad20').width;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(140, 40);
    ctx.lineTo(140 + ghWidth, 40);
    ctx.stroke();

    // LinkedIn
    ctx.font = 'bold 11px ' + this.activeFont;
    ctx.fillStyle = '#0a66c2';
    ctx.fillText('LinkedIn:', 200, 38);
    ctx.fillStyle = '#fff';
    ctx.fillText('shahadaltharwa', 265, 38);
    // Underline username to indicate link
    const liWidth = ctx.measureText('shahadaltharwa').width;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(265, 40);
    ctx.lineTo(265 + liWidth, 40);
    ctx.stroke();

    // Store clickable link regions for later use (for mouse events)
    if (!window._eidGameLinks) window._eidGameLinks = [];
    window._eidGameLinks[0] = { x: 140, y: 28, w: ghWidth, h: 14, url: 'https://github.com/shhahad20' };
    window._eidGameLinks[1] = { x: 265, y: 28, w: liWidth, h: 14, url: 'https://www.linkedin.com/in/shahadaltharwa' };
  }

  // Hit-test a button drawn by _btn
  hits(mx, my, x, y, w, h) { return mx>=x && mx<=x+w && my>=y && my<=y+h; }
}

// ============================================================
// MAIN GAME CLASS
// ============================================================

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx    = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.canvas.width  = CONFIG.CANVAS_W;
    this.canvas.height = CONFIG.CANVAS_H;
    const W = CONFIG.CANVAS_W, H = CONFIG.CANVAS_H;

    this.state     = STATE.MENU;
    this.level     = 1;
    this.score     = 0;
    this.coins     = 0;
    this.timer     = CONFIG.LEVEL_TIME;
    this.time      = 0;
    this.scores    = this._loadScores();

    this.camera    = new Camera(W, H);
    this.particles = new Particles();
    this.map       = new GameMap();
    this.ui        = new UI(W, H);

    this.player    = null;
    this.sheepList = [];
    this.helpers   = [];
    this.obstacles = [];
    this.items     = [];  // collectibles + power-ups share array
    this.lastTime  = 0;

    this.keys       = {};
    this.mobile     = { dx: 0, dy: 0, sprint: false };
    this.mouseX     = 0;
    this.mouseY     = 0;
    this.playerName = '';

    this._bindEvents();
    this._setupMobile();
    this._setupNameOverlay();
    requestAnimationFrame(t => this._loop(t));
  }

  // ============================================================
  // LEVEL SETUP
  // ============================================================

  _startGame(level = 1) {
    this.level = level;
    if (level === 1) { this.score = 0; this.coins = 0; }
    this.timer = CONFIG.LEVEL_TIME + (level - 1) * 12;

    const cx = CONFIG.WORLD_W / 2, cy = CONFIG.WORLD_H / 2;
    this.player    = new Player(cx, cy);
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
    audio.play('level_start');
  }

  _generateLevel(level) {
    this.obstacles = [];
    this.items     = [];
    const W = CONFIG.WORLD_W, H = CONFIG.WORLD_H;
    const cx = W/2, cy = H/2;
    const obsTypes = ['car','cart','puddle','barrier','child'];
    const maxType  = Math.min(level + 1, obsTypes.length);

    // Obstacles (more each level)
    const obsCount = 16 + level * 6;
    for (let i = 0; i < obsCount; i++) {
      const type = obsTypes[Math.floor(Math.random() * maxType)];
      let x, y, tries = 0;
      do {
        x = 80 + Math.random() * (W - 160);
        y = 80 + Math.random() * (H - 160);
        tries++;
      } while (_dist(x, y, cx, cy) < 180 && tries < 20);
      this.obstacles.push(new Obstacle(x, y, type));
    }

    // Coins
    const coinCount = 20 + level * 4;
    for (let i = 0; i < coinCount; i++)
      this.items.push(new Collectible(80+Math.random()*(W-160), 80+Math.random()*(H-160), 'coin'));

    // Dates
    for (let i = 0; i < 6; i++)
      this.items.push(new Collectible(80+Math.random()*(W-160), 80+Math.random()*(H-160), 'date'));

    // Stars
    for (let i = 0; i < 4; i++)
      this.items.push(new Collectible(80+Math.random()*(W-160), 80+Math.random()*(H-160), 'star'));

    // Power-ups
    const puTypes = ['rope','shoes','magnet','rope','shoes'];
    for (let i = 0; i < 3 + Math.min(level, 4); i++)
      this.items.push(new PowerUp(80+Math.random()*(W-160), 80+Math.random()*(H-160), puTypes[i%puTypes.length]));
  }

  // ============================================================
  // UPDATE
  // ============================================================

  _update(dt) {
    this.time += dt;                                // always tick for menu/overlay animations
    if (this.state !== STATE.PLAYING) return;
    this.timer -= dt;

    // Obstacles
    this.obstacles.forEach(o => o.update(dt));

    // Player
    this.player.update(dt, this.keys, this.mobile, this.obstacles);

    // Sheep
    this.sheepList.forEach(s => { if (!s.caught) s.update(dt, this.player.x, this.player.y, this.obstacles); });

    // Helpers
    this.helpers = this.helpers.filter(h => h.active);
    this.helpers.forEach(h => h.update(dt, this.sheepList, this.obstacles));

    // Items (collectibles & power-ups)
    this.items.forEach(item => item.update(dt));

    // Item pickup
    this._checkPickups();

    // Dust trail + footstep sound
    if (this.player.moving) {
      this.player.dustT -= dt;
      if (this.player.dustT <= 0) {
        this.player.dustT = this.player.sprinting ? 0.05 : 0.13;
        this.particles.dust(this.player.x, this.player.y + 18);
        audio.play('footstep');
      }
    }

    // Check catch (each sheep individually; all caught = victory)
    for (const s of this.sheepList) {
      if (!s.caught && _dist(this.player.x, this.player.y, s.x, s.y) < CONFIG.CATCH_DIST) {
        s.caught = true;
        this.score += 300 + this.level * 50;
        this.particles.catch(s.x, s.y);
        this.camera.shake(8, 0.4);
        if (this.sheepList.every(sh => sh.caught)) {
          const timeBonus = Math.floor(this.timer) * 8;
          this.score += 200 + timeBonus + this.level * 100;
          this._saveScore();
          this.camera.shake(14, 0.6);
          this.state = STATE.VICTORY;
          audio.play('victory');
        } else {
          audio.play('sheep_caught');
        }
      }
    }

    // Helper catches
    for (const h of this.helpers) {
      for (const s of this.sheepList) {
        if (!s.caught && _dist(h.x, h.y, s.x, s.y) < CONFIG.CATCH_DIST) {
          s.caught = true;
          this.score += 150 + this.level * 25;
          this.particles.catch(s.x, s.y);
          this.camera.shake(6, 0.3);
          if (this.sheepList.every(sh => sh.caught)) {
            const timeBonus = Math.floor(this.timer) * 8;
            this.score += 200 + timeBonus + this.level * 100;
            this._saveScore();
            this.camera.shake(14, 0.6);
            this.state = STATE.VICTORY;
            audio.play('victory');
          } else {
            audio.play('sheep_caught');
          }
        }
      }
    }

    // Timer expired
    if (this.timer <= 0) {
      this.timer = 0;
      this._saveScore();
      this.state = STATE.GAME_OVER;
      audio.play('game_over');
    }

    // Camera & particles
    this.camera.follow(this.player.x, this.player.y);
    this.camera.update(dt);
    this.particles.update(dt);
  }

  _checkPickups() {
    const px = this.player.x, py = this.player.y;

    for (const item of this.items) {
      if (item.collected) continue;

      let dx = item.x - px, dy = item.y - py;

      // Magnet pull
      if (item instanceof Collectible && this.player.hasMagnet) {
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < this.player.magnetR && d > 1) {
          const pull = 220;
          item.x -= (dx/d) * pull * (1/60);
          item.y -= (dy/d) * pull * (1/60);
          dx = item.x - px; dy = item.y - py;
        }
      }

      const dist = Math.sqrt(dx*dx + dy*dy);
      const pickR = item instanceof PowerUp ? 22 : 16;

      if (dist < pickR) {
        item.collected = true;
        if (item instanceof Collectible) {
          switch (item.type) {
            case 'coin':
              this.score += 10; this.coins++;
              this.particles.coin(item.x, item.y);
              audio.play('coin');
              break;
            case 'date':
              this.player.stamina = Math.min(CONFIG.STAMINA_MAX, this.player.stamina + 45);
              this.particles.emit(item.x, item.y, '#d2691e', 7, 60, 4, 0.4);
              break;
            case 'star':
              this.score += 50;
              this.particles.emit(item.x, item.y, '#ffe000', 12, 95, 6, 0.65);
              audio.play('star');
              break;
          }
        } else if (item instanceof PowerUp) {
          this.player.activatePowerUp(item.type);
          if (item.type === 'rope') this.sheepList.forEach(s => s.slow(5));
          this.particles.emit(item.x, item.y, item.color(), 10, 80, 5, 0.55);
          this.score += 20;
          audio.play('powerup');
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
    if (this.state === STATE.INSTRUCTIONS) { this.ui.drawInstructions(ctx); return; }
    if (this.state === STATE.HIGH_SCORES)  { this.ui.drawHighScores(ctx, this.scores); return; }
    if (this.state === STATE.CREDITS)      { this.ui.drawCredits(ctx, this.mouseX, this.mouseY); return; }

    // World rendering
    const { ox, oy } = this.camera.offset();

    this.map.draw(ctx, this.camera, this.time);

    // Obstacles
    for (const o of this.obstacles) {
      if (this.camera.sees(o.x, o.y, o.w, o.h)) o.draw(ctx, ox, oy);
    }

    // Items
    for (const item of this.items) {
      if (!item.collected && this.camera.sees(item.x-20, item.y-20, 40, 40))
        item.draw(ctx, ox, oy);
    }

    // Characters (draw sheep below player so player renders on top)
    this.sheepList.forEach(s => { if (!s.caught) s.draw(ctx, ox, oy); });
    this.helpers.forEach(h => h.draw(ctx, ox, oy));
    this.player.draw(ctx, ox, oy);

    // Particles
    this.particles.draw(ctx, ox, oy);

    // Minimap
    this.ui.drawMinimap(ctx,
      this.player.x, this.player.y,
      this.sheepList,
      this.camera.x, this.camera.y,
      CONFIG.CANVAS_W, CONFIG.CANVAS_H
    );

    // HUD
    const pw = {
      rope:   this.player.ropeTtl   > 0 ? this.player.ropeTtl   : 0,
      shoes:  this.player.shoesTtl  > 0 ? this.player.shoesTtl  : 0,
      magnet: this.player.magnetTtl > 0 ? this.player.magnetTtl : 0,
    };
    const sheepLeft = this.sheepList.filter(s => !s.caught).length;
    const canHelp = this.level >= 2 && this.coins >= 5 && this.helpers.length < 2;
    this.ui.drawHUD(ctx, this.score, this.coins, this.timer, this.player.stamina, this.level, pw, sheepLeft, this.sheepList.length, canHelp);

    // Arrow pointing toward sheep when off screen
    this._drawSheepArrow(ctx, ox, oy);

    // Overlays
    if (this.state === STATE.PAUSED)    this.ui.drawPause(ctx);
    if (this.state === STATE.GAME_OVER) this.ui.drawGameOver(ctx, this.score, this.coins, this.level);
    if (this.state === STATE.VICTORY)   this.ui.drawVictory(ctx, this.score, this.coins, this.level);
  }

  // Small directional arrow pointing at sheep when off-screen
  _drawSheepArrow(ctx, ox, oy) {
    const W = CONFIG.CANVAS_W, H = CONFIG.CANVAS_H;
    const margin = 56;
    const cxW = W / 2, cyW = H / 2;
    const R = Math.min(W, H) * 0.42;

    for (const s of this.sheepList) {
      if (s.caught) continue;
      const sx = s.x + ox, sy = s.y + oy;
      if (sx >= margin && sx <= W-margin && sy >= margin && sy <= H-margin) continue;

      const dx = s.x - this.player.x, dy = s.y - this.player.y;
      const ang = Math.atan2(dy, dx);
      const ax = cxW + Math.cos(ang) * R;
      const ay = cyW + Math.sin(ang) * R;

      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(ang);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.7 + Math.sin(this.time * 5) * 0.2;
      ctx.beginPath();
      ctx.moveTo(14, 0); ctx.lineTo(-8, -7); ctx.lineTo(-8, 7); ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // ============================================================
  // EVENTS
  // ============================================================

  _bindEvents() {
    window.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      this._onKey(e.key);
      if ([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys[e.key] = false; });

    this.canvas.addEventListener('click', e => {
      const r = this.canvas.getBoundingClientRect();
      const scX = CONFIG.CANVAS_W / r.width;
      const scY = CONFIG.CANVAS_H / r.height;
      this._onClick((e.clientX - r.left) * scX, (e.clientY - r.top) * scY);
    });

    this.canvas.addEventListener('mousemove', e => {
      const r = this.canvas.getBoundingClientRect();
      const scX = CONFIG.CANVAS_W / r.width;
      const scY = CONFIG.CANVAS_H / r.height;
      this.mouseX = (e.clientX - r.left) * scX;
      this.mouseY = (e.clientY - r.top) * scY;
      // Show pointer cursor when hovering over clickable links on credits screen
      if (this.state === STATE.CREDITS) {
        const W = CONFIG.CANVAS_W, H = CONFIG.CANVAS_H;
        const ui = this.ui;
        const over = ui.hits(this.mouseX,this.mouseY, W/2-130,H/2+10,260,42)
                  || ui.hits(this.mouseX,this.mouseY, W/2-130,H/2+64,260,42)
                  || ui.hits(this.mouseX,this.mouseY, W/2-95,H-80,190,46);
        this.canvas.style.cursor = over ? 'pointer' : 'default';
      } else {
        this.canvas.style.cursor = 'default';
      }
    });
  }

  _onKey(k) {
    if (this.state === STATE.PLAYING && (k==='p'||k==='P'||k==='Escape'))
      this.state = STATE.PAUSED;
    else if (this.state === STATE.PAUSED && (k==='p'||k==='P'||k==='Escape'))
      this.state = STATE.PLAYING;
    else if (this.state === STATE.PLAYING && (k==='h'||k==='H'))
      this._summonHelper();
  }

  _summonHelper() {
    if (this.level < 2) return;
    if (this.coins < 5) return;
    if (this.helpers.length >= 2) return;
    this.coins -= 5;
    const offset = this.helpers.length === 0 ? 50 : -50;
    this.helpers.push(new Helper(this.player.x + offset, this.player.y));
    this.particles.emit(this.player.x + offset, this.player.y, '#4488cc', 10, 75, 5, 0.5);
    audio.play('powerup');
  }

  _onClick(mx, my) {
    const ui = this.ui;
    const W = CONFIG.CANVAS_W, H = CONFIG.CANVAS_H;

    switch (this.state) {
      case STATE.MENU:
        if (ui.hits(mx,my, 8,8,78,28)) {
          LANG = LANG === 'ar' ? 'en' : 'ar';
          localStorage.setItem('eidSheepLang', LANG);
        }
        if (ui.hits(mx,my, W/2-105,168,210,44)) this._showNameOverlay();
        if (ui.hits(mx,my, W/2-105,220,210,44)) this.state = STATE.INSTRUCTIONS;
        if (ui.hits(mx,my, W/2-105,272,210,44)) this.state = STATE.HIGH_SCORES;
        if (ui.hits(mx,my, W/2-105,324,210,44)) this.state = STATE.CREDITS;
        break;
      case STATE.INSTRUCTIONS:
        if (ui.hits(mx,my, W/2-95,H-80,190,46)) this.state = STATE.MENU;
        break;
      case STATE.HIGH_SCORES:
        if (ui.hits(mx,my, W/2-95,H-80,190,46)) this.state = STATE.MENU;
        break;
      case STATE.CREDITS:
        if (ui.hits(mx,my, W/2-95,H-80,190,46)) this.state = STATE.MENU;
        // Link buttons — positions must match drawCredits
        if (ui.hits(mx,my, W/2-130,H/2+10,260,42)) window.open('https://github.com/shhahad20','_blank');
        if (ui.hits(mx,my, W/2-130,H/2+64,260,42)) window.open('https://www.linkedin.com/in/shahadaltharwa/','_blank');
        break;
      case STATE.PAUSED:
        if (ui.hits(mx,my, W/2-95,H/2-28,190,46)) this.state = STATE.PLAYING;
        if (ui.hits(mx,my, W/2-95,H/2+34,190,46)) { this.state = STATE.MENU; }
        break;
      case STATE.GAME_OVER:
        if (ui.hits(mx,my, W/2-95,H/2-170+224,190,46)) this._startGame(1);
        if (ui.hits(mx,my, W/2-95,H/2-170+282,190,46)) this.state = STATE.MENU;
        break;
      case STATE.VICTORY:
        if (ui.hits(mx,my, W/2-95,H/2-185+226,190,46)) this._startGame(this.level+1);
        if (ui.hits(mx,my, W/2-95,H/2-185+288,190,46)) this.state = STATE.MENU;
        break;
    }
  }

  // ============================================================
  // MOBILE JOYSTICK
  // ============================================================

  _setupMobile() {
    const jEl   = document.getElementById('joystick');
    const knob  = document.getElementById('joystickKnob');
    const btn   = document.getElementById('sprintBtn');
    const helpB = document.getElementById('helpBtn');
    const ctrl  = document.getElementById('mobileControls');
    if (!jEl) return;

    const isMobile = /Mobi|Android|iPhone|iPad|Touch/i.test(navigator.userAgent)
                  || window.matchMedia('(pointer:coarse)').matches;
    if (isMobile) ctrl.style.display = 'flex';

    let active = false, cX = 0, cY = 0;

    jEl.addEventListener('touchstart', e => {
      active = true;
      const r = jEl.getBoundingClientRect();
      cX = r.left + r.width/2; cY = r.top + r.height/2;
      e.preventDefault();
    }, { passive: false });

    jEl.addEventListener('touchmove', e => {
      if (!active) return;
      const t = e.touches[0];
      const dx = t.clientX - cX, dy = t.clientY - cY;
      const d  = Math.sqrt(dx*dx+dy*dy);
      const maxD = 34;
      const nd = Math.min(d, maxD);
      this.mobile.dx = d > 4 ? dx/d : 0;
      this.mobile.dy = d > 4 ? dy/d : 0;
      knob.style.transform = `translate(calc(-50% + ${(dx/d)*nd}px), calc(-50% + ${(dy/d)*nd}px))`;
      e.preventDefault();
    }, { passive: false });

    const endJ = () => {
      active = false;
      this.mobile.dx = 0; this.mobile.dy = 0;
      knob.style.transform = 'translate(-50%,-50%)';
    };
    jEl.addEventListener('touchend',    endJ);
    jEl.addEventListener('touchcancel', endJ);

    btn.addEventListener('touchstart', e => { this.mobile.sprint = true; e.preventDefault(); }, { passive: false });
    btn.addEventListener('touchend',   () => { this.mobile.sprint = false; });

    // Help button — only shown from level 2+
    if (helpB) {
      helpB.addEventListener('touchstart', e => {
        this._summonHelper();
        e.preventDefault();
      }, { passive: false });
      // Update disabled state each frame via the game loop
      this._helpBtn = helpB;
    }
  }

  _updateHelpBtn() {
    if (!this._helpBtn) return;
    const eligible = this.state === STATE.PLAYING && this.level >= 2 && this.coins >= 5 && this.helpers.length < 2;
    this._helpBtn.disabled = !eligible;
    this._helpBtn.style.display = this.level >= 2 ? '' : 'none';
  }

  // ============================================================
  // NAME ENTRY OVERLAY
  // ============================================================

  _setupNameOverlay() {
    const overlay = document.getElementById('nameOverlay');
    const input   = document.getElementById('nameInput');
    const submit  = document.getElementById('nameSubmit');
    if (!overlay) return;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); this._submitName(); }
    });
    submit.addEventListener('click', () => this._submitName());
  }

  _showNameOverlay() {
    this.state = STATE.NAME_ENTRY;
    const overlay = document.getElementById('nameOverlay');
    const input   = document.getElementById('nameInput');
    const title   = document.getElementById('nameOverlayTitle');
    const hint    = document.getElementById('nameOverlayHint');
    const submit  = document.getElementById('nameSubmit');
    if (!overlay) { this._startGame(1); return; }   // fallback if HTML not updated
    if (title)  title.textContent  = T('enterName');
    if (hint)   hint.textContent   = T('nameHint');
    if (submit) submit.textContent = T('startBtn');
    input.value       = '';
    input.placeholder = T('nameDefault');
    input.dir         = LANG === 'ar' ? 'rtl' : 'ltr';
    overlay.classList.add('active');
    input.focus();
  }

  _submitName() {
    const input = document.getElementById('nameInput');
    const overlay = document.getElementById('nameOverlay');
    const raw = input ? input.value.trim() : '';
    this.playerName = raw || T('nameDefault');
    if (overlay) overlay.classList.remove('active');
    this._startGame(1);
  }

  // ============================================================
  // SCORES
  // ============================================================

  _saveScore() {
    const name = this.playerName || 'Player';
    this.scores.push({ name, score: this.score, coins: this.coins, level: this.level });
    this.scores.sort((a, b) => b.score - a.score);
    this.scores = this.scores.slice(0, 10);
    try { localStorage.setItem('eidSheepChase_v2', JSON.stringify(this.scores)); } catch(e){}
  }

  _loadScores() {
    try {
      const raw = JSON.parse(localStorage.getItem('eidSheepChase_v2')) || [];
      // Backward-compat: old entries without name get a default
      return raw.map(e => ({ name: 'Player', ...e }));
    } catch(e) { return []; }
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
    requestAnimationFrame(t => this._loop(t));
  }
}

// ---- Utility ----
function _dist(ax, ay, bx, by) { return Math.sqrt((ax-bx)**2+(ay-by)**2); }

// ============================================================
// BOOT
// ============================================================
window.addEventListener('load', () => { new Game(); });
