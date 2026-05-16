import { CONFIG } from './constants.js';
import { clamp, rectOverlap } from './utils.js';

export class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 24; this.h = 32;
    this.vx = 0; this.vy = 0;
    this.dir = 'down';
    this.frame = 0; this.frameT = 0;
    this.moving = false;
    this.sprinting = false;
    this.stamina = CONFIG.STAMINA_MAX;
    this.dustT = 0;

    this.ropeTtl = 0;
    this.shoesTtl = 0;
    this.magnetTtl = 0;
    this.magnetR = 125;
  }

  get hasRope()   { return this.ropeTtl > 0; }
  get hasShoes()  { return this.shoesTtl > 0; }
  get hasMagnet() { return this.magnetTtl > 0; }

  activatePowerUp(type) {
    if (type === 'rope')   this.ropeTtl   = 5;
    if (type === 'shoes')  this.shoesTtl  = 8;
    if (type === 'magnet') this.magnetTtl = 10;
  }

  collRect() { return { x: this.x-11, y: this.y-6, w: 22, h: 22 }; }

  update(dt, keys, mobile, obstacles) {
    let dx = 0, dy = 0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
    if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= 1;
    if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += 1;
    if (mobile.dx) { dx += mobile.dx; }
    if (mobile.dy) { dy += mobile.dy; }

    const inputMag = Math.sqrt(dx*dx + dy*dy);
    if (inputMag > 1) { dx /= inputMag; dy /= inputMag; }

    const wantSprint = (keys[' '] || keys['Shift'] || mobile.sprint) && this.stamina > 0;

    if (wantSprint && inputMag > 0.1) {
      this.sprinting = true;
      this.stamina = Math.max(0, this.stamina - CONFIG.STAMINA_DRAIN * dt);
    } else {
      this.sprinting = false;
      this.stamina = Math.min(CONFIG.STAMINA_MAX, this.stamina + CONFIG.STAMINA_REGEN * dt);
    }

    if (this.ropeTtl   > 0) this.ropeTtl   -= dt;
    if (this.shoesTtl  > 0) this.shoesTtl  -= dt;
    if (this.magnetTtl > 0) this.magnetTtl -= dt;

    let spd = this.sprinting ? CONFIG.PLAYER_SPRINT_SPEED : CONFIG.PLAYER_SPEED;
    if (this.hasShoes) spd *= 1.45;

    this.vx = dx * spd;
    this.vy = dy * spd;
    this.moving = inputMag > 0.05;

    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx < -0.1) this.dir = 'left';
      else if (dx > 0.1) this.dir = 'right';
    } else {
      if (dy < -0.1) this.dir = 'up';
      else if (dy > 0.1) this.dir = 'down';
    }

    this._tryMove(this.x + this.vx * dt, this.y, obstacles);
    this._tryMove(this.x, this.y + this.vy * dt, obstacles);

    if (this.moving) {
      this.frameT += dt;
      const spd2 = this.sprinting ? 0.1 : 0.16;
      if (this.frameT >= spd2) { this.frameT = 0; this.frame = (this.frame + 1) % 4; }
    } else {
      this.frame = 0;
    }
  }

  _tryMove(nx, ny, obstacles) {
    nx = clamp(nx, 14, CONFIG.WORLD_W - 14);
    ny = clamp(ny, 14, CONFIG.WORLD_H - 14);
    const tr = { x: nx-11, y: ny-6, w: 22, h: 22 };
    for (const o of obstacles) {
      if (o.slippery) continue;
      if (rectOverlap(tr.x, tr.y, tr.w, tr.h, o.x, o.y, o.w, o.h)) return;
    }
    this.x = nx; this.y = ny;
  }

  draw(ctx, ox, oy) {
    const x = Math.round(this.x + ox);
    const y = Math.round(this.y + oy);
    const fr = this.frame;
    const dir = this.dir;
    const walk = this.moving ? Math.sin(fr * Math.PI / 2) : 0;

    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x-11, y+14, 22, 7);

    const armSwing = this.moving ? walk * 3 : 0;
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(x-16, y+2+armSwing, 7, 14);
    ctx.fillRect(x+9,  y+2-armSwing, 7, 14);
    ctx.fillStyle = '#f5cba7';
    ctx.fillRect(x-16, y+14+armSwing, 7, 6);
    ctx.fillRect(x+9,  y+14-armSwing, 7, 6);

    ctx.fillStyle = '#f0efea';
    ctx.fillRect(x-11, y-2, 22, 30);
    ctx.fillStyle = '#d8d4c8';
    ctx.fillRect(x-1, y-2, 2, 30);
    ctx.fillStyle = '#c8c4b0';
    ctx.fillRect(x-11, y+26, 22, 4);

    const footA = this.moving ? walk * 3 : 0;
    ctx.fillStyle = '#c0b89a';
    ctx.fillRect(x-9, y+28+footA, 9, 5);
    ctx.fillRect(x,   y+28-footA, 9, 5);

    ctx.fillStyle = '#f5cba7';
    ctx.fillRect(x-7, y-19, 14, 15);

    ctx.fillStyle = '#1a1a2e';
    if (dir === 'left') {
      ctx.fillRect(x-5, y-14, 3, 3);
      ctx.fillStyle = '#c07060'; ctx.fillRect(x-4, y-9, 5, 2);
    } else if (dir === 'right') {
      ctx.fillRect(x+2, y-14, 3, 3);
      ctx.fillStyle = '#c07060'; ctx.fillRect(x-1, y-9, 5, 2);
    } else if (dir !== 'up') {
      ctx.fillRect(x-4, y-14, 3, 3); ctx.fillRect(x+1, y-14, 3, 3);
      ctx.fillStyle = '#c07060'; ctx.fillRect(x-2, y-9, 5, 2);
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x-9, y-24, 18, 8);
    ctx.fillStyle = '#cc1111';
    for (let ci = 0; ci < 3; ci++) {
      ctx.fillRect(x-9+ci*6, y-24, 3, 4);
      ctx.fillRect(x-9+ci*6+3, y-20, 3, 4);
    }
    const drapeX = dir === 'left' ? x+5 : x-13;
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(drapeX, y-22, 8, 20);
    ctx.fillStyle = '#cc1111';
    ctx.fillRect(drapeX, y-22, 4, 5);
    ctx.fillRect(drapeX+4, y-17, 4, 5);
    ctx.fillRect(drapeX, y-12, 4, 5);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x-9, y-17, 18, 3);

    if (this.sprinting || this.hasShoes) {
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#ffdd44';
      ctx.fillRect(x-14, y-24, 28, 58);
      ctx.globalAlpha = 1;
    }

    if (this.hasMagnet) {
      const pulse = 0.25 + Math.sin(Date.now() * 0.004) * 0.12;
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - this.magnetR, y - this.magnetR, this.magnetR*2, this.magnetR*2);
      ctx.globalAlpha = 1;
    }
  }
}
