import { COLORS } from './constants.js';

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

export class Particles {
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
