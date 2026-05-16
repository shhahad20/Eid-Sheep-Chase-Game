export class Vec2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  add(v)  { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v)  { return new Vec2(this.x - v.x, this.y - v.y); }
  scale(s){ return new Vec2(this.x * s, this.y * s); }
  mag()   { return Math.sqrt(this.x * this.x + this.y * this.y); }
  norm()  { const m = this.mag(); return m ? new Vec2(this.x/m, this.y/m) : new Vec2(); }
  dist(v) { return this.sub(v).mag(); }
}

export function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

export function _dist(ax, ay, bx, by) { return Math.sqrt((ax-bx)**2+(ay-by)**2); }

export function _darker(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n>>16)-amt, 0, 255);
  const g = clamp(((n>>8)&0xff)-amt, 0, 255);
  const b = clamp((n&0xff)-amt, 0, 255);
  return `rgb(${r},${g},${b})`;
}
