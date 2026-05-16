import { CONFIG, COLORS, STATE } from './constants.js';
import { LANG, T } from './language.js';
import { clamp } from './utils.js';
import { _drawCoin } from './collectible.js';

export class UI {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.font = "'Courier New', monospace";
    this.arabicFont = "Tahoma, 'Simplified Arabic', 'Arabic UI Text', Arial, sans-serif";
  }

  get activeFont() { return LANG === 'ar' ? this.arabicFont : this.font; }

  // ---- HUD ----
  drawHUD(ctx, score, coins, timer, stamina, level, pw, sheepLeft, sheepTotal, canHelp) {
    ctx.fillStyle = 'rgba(10,10,20,0.72)';
    ctx.fillRect(0, 0, this.w, 46);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(0, 44, this.w, 2);

    this._text(ctx, `${T('score')}: ${score}`, 10, 29, COLORS.gold, 'bold 14px');

    _drawCoin(ctx, 132, 22);
    this._text(ctx, `x${coins}`, 146, 29, '#ffe840', 'bold 14px');

    const tColor = timer <= 10 ? '#ff4444' : '#ffffff';
    const mm = String(Math.floor(timer / 60)).padStart(2, '0');
    const ss = String(Math.floor(timer % 60)).padStart(2, '0');
    this._text(ctx, `${mm}:${ss}`, this.w/2 - 22, 30, tColor, 'bold 18px', 'left');

    const sheepColor = sheepLeft === 1 ? '#ff9944' : '#ffdd88';
    this._text(ctx, `${T('sheep')}: ${sheepLeft}/${sheepTotal}`, this.w - 202, 29, sheepColor, 'bold 13px');

    this._text(ctx, `${T('level')} ${level}`, this.w - 68, 29, '#88ff88', 'bold 14px');

    const sx = this.w/2 + 56, sy = 8, sw = 130, sh = 14;
    ctx.fillStyle = '#333'; ctx.fillRect(sx, sy, sw, sh);
    const pct = clamp(stamina / CONFIG.STAMINA_MAX, 0, 1);
    ctx.fillStyle = pct > 0.3 ? '#22bb55' : '#dd3322';
    ctx.fillRect(sx, sy, sw * pct, sh);
    ctx.strokeStyle = '#666'; ctx.lineWidth = 1; ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(sx+2, sy+2, sw*pct - 4, 3);
    this._text(ctx, T('stamina'), sx+22, sy+11, '#fff', '10px');

    let ix = 10, iy = 50;
    if (pw.rope   > 0) ix = this._puTag(ctx, ix, iy, T('rope'),   pw.rope,   '#a07820');
    if (pw.shoes  > 0) ix = this._puTag(ctx, ix, iy, T('sprint'), pw.shoes,  '#c0392b');
    if (pw.magnet > 0) ix = this._puTag(ctx, ix, iy, T('magnet'), pw.magnet, '#8e44ad');

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
    ctx.fillStyle = '#001a33'; ctx.fillRect(0, 0, this.w, this.h);
    ctx.fillStyle = '#003366'; ctx.fillRect(0, this.h*0.4, this.w, this.h*0.6);

    for (let i = 0; i < 50; i++) {
      const sx = (i * 157 + 13) % this.w;
      const sy = (i * 97  + 7)  % (this.h * 0.45);
      const tw = i%5===0 ? 3 : 2;
      ctx.fillStyle = i%7===0 ? COLORS.gold : '#ffffff';
      ctx.fillRect(sx, sy, tw, tw);
    }
    const tw1 = Math.floor(time*3) % 2 === 0;
    ctx.fillStyle = tw1 ? COLORS.gold : '#ffffff';
    ctx.fillRect(60, 30, 4, 4); ctx.fillRect(58,28,8,2); ctx.fillRect(62,24,2,8);
    ctx.fillStyle = !tw1 ? COLORS.gold : '#ffffff';
    ctx.fillRect(700, 80, 4, 4);

    ctx.fillStyle = COLORS.sand; ctx.fillRect(0, this.h-90, this.w, 90);
    ctx.fillStyle = COLORS.road; ctx.fillRect(0, this.h-65, this.w, 44);
    ctx.fillStyle = '#e8d020';
    for (let rx = 0; rx < this.w; rx += 80) ctx.fillRect(rx, this.h-46, 50, 8);
    ctx.fillStyle = COLORS.sidewalk;
    ctx.fillRect(0, this.h-90, this.w, 25); ctx.fillRect(0, this.h-21, this.w, 21);

    this._langToggleBtn(ctx, time);

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

    this._btn(ctx, this.w/2-105, 168, 210, 44, T('startGame'),    '#1e8449', '#27ae60');
    this._btn(ctx, this.w/2-105, 220, 210, 44, T('instructions'), COLORS.deepBlue, '#0080b3');
    this._btn(ctx, this.w/2-105, 272, 210, 44, T('highScores'),   COLORS.burgundy, '#a02855');
    this._btn(ctx, this.w/2-105, 324, 210, 44, T('credits'),      '#4a4a7a', '#6666aa');

    if (best > 0) {
      this._text(ctx, `${T('best')}: ${best}`, this.w/2, 390, COLORS.gold, '14px', 'center');
    }

    this._menuSheep(ctx, 55, this.h-105);
    this._menuPlayer(ctx, 165, this.h-98);

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
      this._text(ctx, `#  ${T('nameCol')}`, this.w/2-170, 100, '#666', '11px');
      this._text(ctx, T('scoreCol'), this.w/2+170, 100, '#666', '11px', 'right');

      scores.slice(0, 7).forEach((e, i) => {
        const ey  = 118 + i * 54;
        const col = i === 0 ? COLORS.gold : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#ffffff';
        ctx.fillStyle = i === 0 ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.04)';
        ctx.fillRect(this.w/2-185, ey-18, 370, 50);

        const nameDisplay = (e.name || 'Player').slice(0, 16);
        this._text(ctx, `${i+1}.  ${nameDisplay}`, this.w/2-170, ey+4, col, 'bold 14px');
        this._text(ctx, String(e.score).padStart(6,'0'), this.w/2+170, ey+4, col, 'bold 15px', 'right');
        this._text(ctx, `${T('lvl')} ${e.level}  •  ${e.coins} ${T('coinsLabel')}`,
          this.w/2-170, ey+22, '#666', '11px');
      });
    }
    this._btn(ctx, this.w/2-95, this.h-80, 190, 46, T('back'), COLORS.deepBlue, '#0080b3');
  }

  // ---- Credits ----
  drawCredits(ctx, mx, my) {
    const W = this.w, H = this.h;

    ctx.fillStyle = COLORS.deepBlue; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0a0a1e';       ctx.fillRect(40, 30, W-80, H-60);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3; ctx.strokeRect(40, 30, W-80, H-60);

    const starPts = [[56,46],[W-56,46],[56,H-46],[W-56,H-46]];
    starPts.forEach(([sx,sy]) => {
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(sx-4,sy-1,9,3); ctx.fillRect(sx-1,sy-4,3,9);
      ctx.fillRect(sx-3,sy-3,3,3); ctx.fillRect(sx+1,sy-3,3,3);
      ctx.fillRect(sx-3,sy+1,3,3); ctx.fillRect(sx+1,sy+1,3,3);
    });

    this._text(ctx, T('creditsTitle'), W/2, 80, COLORS.gold, 'bold 26px', 'center');
    ctx.fillStyle = COLORS.gold; ctx.fillRect(W/2-80, 88, 160, 2);

    ctx.fillStyle = '#d4af37'; ctx.fillRect(W/2-16, 100, 32, 32);
    ctx.fillStyle = '#0a0a1e'; ctx.fillRect(W/2-8,  96,  32, 32);
    ctx.fillStyle = '#d4af37'; ctx.fillRect(W/2+6, 106, 4, 4); ctx.fillRect(W/2+12, 100, 3, 3);

    this._text(ctx, T('copyright') + '  ' + T('devBy'), W/2, 158, '#aaaaaa', '13px', 'center');
    this._text(ctx, T('devName'), W/2, 184, '#ffffff', 'bold 22px', 'center');

    ctx.fillStyle = 'rgba(212,175,55,0.35)'; ctx.fillRect(W/2-140, 196, 280, 1);

    const ghY  = H/2 + 10;
    const liY  = H/2 + 64;
    const bx   = W/2 - 130;
    const bw   = 260, bh = 42;

    const ghHover = this.hits(mx, my, bx, ghY, bw, bh);
    ctx.fillStyle = ghHover ? '#444' : '#24292e';
    ctx.fillRect(bx, ghY, bw, bh);
    ctx.strokeStyle = ghHover ? '#aaa' : '#555';
    ctx.lineWidth = 1; ctx.strokeRect(bx, ghY, bw, bh);
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

    const liHover = this.hits(mx, my, bx, liY, bw, bh);
    ctx.fillStyle = liHover ? '#1a77b5' : '#0a66c2';
    ctx.fillRect(bx, liY, bw, bh);
    ctx.strokeStyle = liHover ? '#5ab4ff' : '#0a66c2';
    ctx.lineWidth = 1; ctx.strokeRect(bx, liY, bw, bh);
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

    this._text(ctx, LANG === 'ar' ? 'انقر للفتح في المتصفح' : 'Click to open in browser',
      W/2, liY + bh + 22, '#666666', '11px', 'center');

    this._lanternSmall(ctx, 82, 160, 0);
    this._lanternSmall(ctx, W - 82, 160, 1.3);

    this._btn(ctx, W/2-95, H-80, 190, 46, T('back'), COLORS.deepBlue, '#0080b3');
  }

  _ghIcon(ctx, x, y) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x+2,y+4,12,10);
    ctx.fillRect(x,y+6,16,6);
    ctx.fillRect(x+2,y,3,5); ctx.fillRect(x+11,y,3,5);
    ctx.fillStyle = '#24292e';
    ctx.fillRect(x+4,y+6,3,3); ctx.fillRect(x+9,y+6,3,3);
    ctx.fillRect(x+7,y+9,2,2);
    ctx.fillRect(x+14,y+10,3,4);
  }

  _liIcon(ctx, x, y) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x,   y,   5,  5);
    ctx.fillRect(x,   y+7, 5,  12);
    ctx.fillRect(x+8, y+7, 5,  12);
    ctx.fillRect(x+8, y+11,10, 5);
    ctx.fillRect(x+13,y+7, 5,  12);
  }

  // ---- Minimap ----
  drawMinimap(ctx, px, py, sheepList, camX, camY, camW, camH) {
    const mw = 120, mh = 90;
    const mx = this.w - mw - 8, my = this.h - mh - 8;
    const scx = mw / CONFIG.WORLD_W, scy = mh / CONFIG.WORLD_H;
    ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 1; ctx.strokeRect(mx, my, mw, mh);
    ctx.strokeStyle = 'rgba(255,255,80,0.45)';
    ctx.strokeRect(mx+camX*scx, my+camY*scy, camW*scx, camH*scy);
    ctx.fillStyle = '#00ff66'; ctx.fillRect(mx+px*scx-2, my+py*scy-2, 5, 5);
    this._text(ctx, 'P', mx+px*scx+4, my+py*scy+3, '#00ff66', '8px');
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

    ctx.font = '10px ' + this.activeFont;
    ctx.fillStyle = '#cccccc';
    ctx.textAlign = 'left';
    ctx.fillText('© 2026 Shahad Altharwa', 92, 22);

    ctx.font = 'bold 11px ' + this.activeFont;
    ctx.fillStyle = '#4078c0';
    ctx.textAlign = 'left';
    ctx.fillText('GitHub:', 92, 38);
    ctx.fillStyle = '#fff';
    ctx.fillText('shhahad20', 140, 38);
    const ghWidth = ctx.measureText('shhahad20').width;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(140, 40);
    ctx.lineTo(140 + ghWidth, 40);
    ctx.stroke();

    ctx.font = 'bold 11px ' + this.activeFont;
    ctx.fillStyle = '#0a66c2';
    ctx.fillText('LinkedIn:', 200, 38);
    ctx.fillStyle = '#fff';
    ctx.fillText('shahadaltharwa', 265, 38);
    const liWidth = ctx.measureText('shahadaltharwa').width;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(265, 40);
    ctx.lineTo(265 + liWidth, 40);
    ctx.stroke();
  }

  hits(mx, my, x, y, w, h) { return mx>=x && mx<=x+w && my>=y && my<=y+h; }
}
