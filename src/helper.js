import { CONFIG } from './constants.js';
import { clamp, _dist, rectOverlap } from './utils.js';

export class Helper {
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

    let nearest = null, nearestDist = Infinity;
    for (const s of sheepList) {
      if (s.caught) continue;
      const d = _dist(this.x, this.y, s.x, s.y);
      if (d < nearestDist) { nearestDist = d; nearest = s; }
    }
    if (!nearest) return;

    const dx = nearest.x - this.x, dy = nearest.y - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 6) {
      const spd = this.speed * dt;
      this._tryMove((dx / d) * spd, (dy / d) * spd, obstacles);
      this.dir = dx > 0 ? 'right' : 'left';
    }

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

    if (this.ttl < 5) {
      ctx.globalAlpha = 0.25 + Math.abs(Math.sin(this.ttl * 4)) * 0.3;
      ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.arc(x, y + 2, 22, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(x, y + 20, 11, 4, 0, 0, Math.PI * 2); ctx.fill();

    const legOff = Math.sin(fr * Math.PI / 2) * 4;
    const armSwing = Math.sin(fr * Math.PI / 2) * 5;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6, y + 8 + legOff, 8, 12);
    ctx.fillRect(x + 2, y + 8 - legOff, 8, 12);

    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(x - 10, y - 10, 20, 24);

    ctx.fillRect(x - 16, y - 8 + armSwing, 8, 14);
    ctx.fillRect(x + 8,  y - 8 - armSwing, 8, 14);

    ctx.fillStyle = '#c8956c';
    ctx.fillRect(x - 17, y + 4 + armSwing, 7, 6);
    ctx.fillRect(x + 10, y + 4 - armSwing, 7, 6);

    ctx.fillStyle = '#c8956c';
    ctx.fillRect(x - 7, y - 22, 14, 14);

    ctx.fillStyle = '#000';
    ctx.fillRect(x - 4, y - 17, 3, 3);
    ctx.fillRect(x + 2, y - 17, 3, 3);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 8, y - 25, 16, 6);
    ctx.fillRect(x - 10, y - 20, 5, 10);
    ctx.fillRect(x + 5,  y - 20, 5, 10);

    ctx.fillStyle = '#222';
    ctx.fillRect(x - 8, y - 21, 16, 3);

    if (flip) ctx.restore();

    const barW = 32;
    const pct = clamp(this.ttl / this.maxTtl, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - barW / 2, y - 32, barW, 4);
    ctx.fillStyle = pct > 0.35 ? '#44ff88' : '#ff6633';
    ctx.fillRect(x - barW / 2, y - 32, barW * pct, 4);
  }
}
