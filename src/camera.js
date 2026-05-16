import { CONFIG } from './constants.js';
import { clamp } from './utils.js';

export class Camera {
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
