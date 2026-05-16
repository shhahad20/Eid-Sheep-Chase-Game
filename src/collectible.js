import { COLORS } from './constants.js';

export class Collectible {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.type = type;
    this.r = 12;
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

export function _drawCoin(ctx, x, y) {
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
