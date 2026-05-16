import { CONFIG, COLORS } from './constants.js';

export class GameMap {
  constructor() {
    this.W = CONFIG.WORLD_W;
    this.H = CONFIG.WORLD_H;
    this.decs = [];
    this._buildDecorations();
  }

  _buildDecorations() {
    const rng = (min, max) => min + Math.random() * (max - min);
    for (let i = 0; i < 35; i++)
      this.decs.push({ t: 'palm', x: rng(80, this.W-80), y: rng(80, this.H-80) });
    for (let i = 0; i < 22; i++)
      this.decs.push({ t: 'lantern', x: rng(120, this.W-120), y: rng(120, this.H-120), ph: Math.random()*Math.PI*2 });
    for (let i = 0; i < 18; i++)
      this.decs.push({ t: 'banner', x: rng(150, this.W-280), y: rng(80, this.H-80) });
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

    ctx.fillStyle = COLORS.sand;
    ctx.fillRect(ox, oy, this.W, this.H);

    ctx.fillStyle = 'rgba(180,140,80,0.15)';
    const ts = 64;
    const startTX = Math.floor(cam.x / ts) * ts;
    const startTY = Math.floor(cam.y / ts) * ts;
    for (let tx = startTX; tx < cam.x + cam.w + ts; tx += ts)
      for (let ty = startTY; ty < cam.y + cam.h + ts; ty += ts)
        ctx.fillRect(tx + ox, ty + oy, 1, ts);

    for (let ry = 280; ry < this.H; ry += 500) {
      ctx.fillStyle = COLORS.road;
      ctx.fillRect(ox, ry + oy, this.W, 150);
      ctx.fillStyle = '#e8d020';
      for (let rx = 0; rx < this.W; rx += 80)
        ctx.fillRect(rx + ox, ry + 68 + oy, 50, 8);
      ctx.fillStyle = COLORS.sidewalk;
      ctx.fillRect(ox, ry - 18 + oy, this.W, 18);
      ctx.fillRect(ox, ry + 150 + oy, this.W, 18);
    }

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
    ctx.fillStyle = '#7a5510';
    ctx.fillRect(x - 4, y - 55, 8, 55);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#5a3e0c'; ctx.fillRect(x-4, y-10-i*10, 8, 3); }
    const fronds = [[-24,-58,22,7],[-38,-46,22,7],[18,-58,22,7],[32,-46,22,7],[-4,-66,8,22],[-14,-52,12,7],[6,-52,12,7]];
    fronds.forEach(([fx,fy,fw,fh]) => {
      ctx.fillStyle = COLORS.olive;
      ctx.fillRect(x+fx, y+fy, fw, fh);
    });
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(x-4, y-56, 5, 5);
    ctx.fillRect(x+1, y-54, 5, 5);
  }

  _lantern(ctx, x, y, t) {
    const glow = 0.55 + Math.sin(t * 2.5) * 0.35;
    ctx.fillStyle = '#666';
    ctx.fillRect(x - 1, y - 55, 2, 36);
    ctx.globalAlpha = glow * 0.25;
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(x - 20, y - 22, 40, 40);
    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.burgundy;
    ctx.fillRect(x - 9, y - 20, 18, 26);
    ctx.globalAlpha = glow;
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(x - 6, y - 17, 12, 20);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#5a1428';
    ctx.fillRect(x - 1, y - 17, 2, 20);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x - 12, y - 24, 24, 6);
    ctx.fillRect(x - 10, y + 6, 20, 5);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x - 2, y + 12, 4, 10);
    ctx.fillRect(x - 4, y + 14, 8, 3);
  }

  _banner(ctx, x, y) {
    const w = 130;
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(x, y, w, 2);
    const fc = [COLORS.burgundy, COLORS.deepBlue, COLORS.olive, COLORS.gold, '#e67e22'];
    for (let i = 0; i < 6; i++) {
      const fx = x + i * 22;
      ctx.fillStyle = fc[i % fc.length];
      for (let row = 0; row < 16; row++) {
        const w2 = Math.round((row / 16) * 10);
        ctx.fillRect(fx + 5 - w2/2, y + row, w2 + 1, 1);
      }
    }
    const mx = x + w / 2;
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(mx - 7, y - 16, 14, 14);
    ctx.fillStyle = COLORS.deepBlue;
    ctx.fillRect(mx - 4, y - 18, 14, 14);
  }

  _house(ctx, x, y) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 6, y + 6, 120, 110);
    ctx.fillStyle = '#e8d4ae';
    ctx.fillRect(x, y, 120, 105);
    ctx.fillStyle = 'rgba(160,120,70,0.2)';
    for (let r = 0; r < 8; r++) ctx.fillRect(x, y + r*13, 120, 2);
    ctx.fillStyle = COLORS.burgundy;
    ctx.fillRect(x - 8, y - 32, 136, 36);
    ctx.fillStyle = '#5a1428';
    ctx.fillRect(x - 8, y - 32, 136, 6);
    ctx.fillStyle = '#a03050';
    ctx.fillRect(x - 8, y - 26, 136, 4);
    ctx.fillStyle = '#7a4820';
    ctx.fillRect(x + 44, y + 54, 32, 51);
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(x + 44, y + 54, 32, 5);
    ctx.fillStyle = '#c08040';
    ctx.fillRect(x + 45, y + 46, 30, 12);
    ctx.fillRect(x + 50, y + 42, 20, 8);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(x + 72, y + 77, 4, 4);
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
