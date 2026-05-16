export const PU_COLORS = { rope: '#a07820', shoes: '#c0392b', magnet: '#8e44ad' };

export class PowerUp {
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
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x-13, y-13, 26, 26);
    ctx.fillStyle = PU_COLORS[this.type];
    ctx.fillRect(x-11, y-11, 22, 22);
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
