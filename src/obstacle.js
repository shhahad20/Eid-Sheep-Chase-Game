import { CONFIG, COLORS } from './constants.js';
import { clamp, _darker } from './utils.js';

const OBS_DIMS = {
  car:     [66, 34],
  cart:    [42, 34],
  puddle:  [52, 26],
  barrier: [52, 18],
  child:   [14, 20],
};

export class Obstacle {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.type = type;
    [this.w, this.h] = OBS_DIMS[type] || [32, 32];
    this.slippery = (type === 'puddle');
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
