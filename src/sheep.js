import { CONFIG } from './constants.js';
import { clamp, rectOverlap } from './utils.js';
import { audio } from './audio.js';

export class Sheep {
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

  collRect() { return { x: this.x-14, y: this.y-6, w: 28, h: 20 }; }

  update(dt, px, py, obstacles) {
    if (this.slowTtl > 0) this.slowTtl -= dt;
    const effSpd = this.slowTtl > 0 ? this.speed * 0.28 : this.speed;

    const dist2p = Math.sqrt((this.x-px)**2 + (this.y-py)**2);
    const fleeDist = CONFIG.SHEEP_FLEE_DIST * (1 + this.level * 0.15);
    this.fleeing = dist2p < fleeDist;

    this.thinkT -= dt;
    this.dashT  -= dt;

    if (this.fleeing) {
      const fx = this.x - px, fy = this.y - py;
      const fm = Math.sqrt(fx*fx + fy*fy) || 1;
      const nx = this.x + (fx/fm) * 220;
      const ny = this.y + (fy/fm) * 220;
      if (this.dashT <= 0 && Math.random() < 0.008 * this.level) {
        this.dashT = 2.5 + Math.random() * 2;
        this.targetX = this.x + (fx/fm) * 480;
        this.targetY = this.y + (fy/fm) * 480;
      } else if (this.thinkT <= 0) {
        this.thinkT = 0.3 + Math.random() * 0.5;
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

    this.frameT += dt;
    const animSpd = this.fleeing ? 0.1 : 0.18;
    if (this.frameT >= animSpd) { this.frameT = 0; this.frame = (this.frame + 1) % 4; }

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

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x-13, y+14, 26, 6);

    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(x-10, y+12+legAnim, 7, 9);
    ctx.fillRect(x+ 3, y+12-legAnim, 7, 9);
    ctx.fillRect(x- 4, y+12-legAnim, 7, 8);
    ctx.fillRect(x+ 9, y+12+legAnim, 7, 8);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x-10, y+19+legAnim, 7, 4);
    ctx.fillRect(x+ 3, y+19-legAnim, 7, 4);
    ctx.fillRect(x- 4, y+19-legAnim, 7, 4);
    ctx.fillRect(x+ 9, y+19+legAnim, 7, 4);

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(x-14, y-1+bounce, 28, 16);
    ctx.fillStyle = '#dcdcdc';
    ctx.fillRect(x-14, y-1+bounce, 9, 7);
    ctx.fillRect(x-3,  y-6+bounce, 9, 7);
    ctx.fillRect(x+7,  y-1+bounce, 9, 7);
    ctx.fillRect(x-10, y+5+bounce, 8, 7);
    ctx.fillRect(x+ 2, y+5+bounce, 8, 7);
    ctx.fillRect(x+11, y+5+bounce, 5, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x-12, y-1+bounce, 6, 4);
    ctx.fillRect(x- 1, y-6+bounce, 6, 4);

    ctx.fillStyle = '#eaeaea';
    ctx.fillRect(x-20, y+1+bounce, 8, 8);

    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(x+10, y-13+bounce, 16, 16);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x+20, y-7+bounce, 9, 9);
    ctx.fillStyle = '#ff9999';
    ctx.fillRect(x+21, y-5+bounce, 3, 2);
    ctx.fillRect(x+25, y-5+bounce, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x+12, y-11+bounce, 5, 5);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x+13, y-10+bounce, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x+15, y-10+bounce, 1, 1);
    ctx.fillStyle = '#ff9999';
    ctx.fillRect(x+10, y-17+bounce, 8, 7);
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(x+10, y-17+bounce, 8, 4);

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
