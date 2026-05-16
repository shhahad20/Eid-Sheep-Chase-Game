export class AudioEngine {
  constructor() {
    this._actx = null;
    this._ok   = true;
    const wake = () => {
      if (this._actx && this._actx.state === 'suspended') this._actx.resume().catch(()=>{});
    };
    window.addEventListener('keydown',    wake, { passive: true });
    window.addEventListener('pointerdown',wake, { passive: true });
  }

  _ctx() {
    if (!this._ok) return null;
    if (!this._actx) {
      try { this._actx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e) { this._ok = false; return null; }
    }
    return this._actx;
  }

  _osc(ctx, type, freq, t, dur, vol = 0.22, freqEnd) {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd != null) osc.frequency.linearRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + dur + 0.01);
  }

  _noise(ctx, t, dur, vol = 0.1, cf = 200) {
    const sr  = ctx.sampleRate;
    const len = Math.ceil(sr * dur);
    const buf = ctx.createBuffer(1, len, sr);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src  = ctx.createBufferSource();
    const filt = ctx.createBiquadFilter();
    const g    = ctx.createGain();
    filt.type = 'bandpass'; filt.frequency.value = cf; filt.Q.value = 1.4;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.buffer = buf;
    src.connect(filt); filt.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + dur + 0.01);
  }

  play(name) {
    if (!this._ok) return;
    const ctx = this._ctx();
    if (!ctx) return;
    if (ctx.state === 'suspended') { ctx.resume().catch(()=>{}); return; }
    const t = ctx.currentTime;
    try {
      switch (name) {
        case 'coin':
          this._osc(ctx,'sine', 880, t,       0.09, 0.22);
          this._osc(ctx,'sine',1320, t + 0.05, 0.09, 0.10);
          break;
        case 'star':
          [523,659,784,1047].forEach((f,i) => this._osc(ctx,'sine',f, t+i*0.07, 0.12, 0.2));
          break;
        case 'catch':
          this._osc(ctx,'sine', 523, t,       0.08, 0.26);
          this._osc(ctx,'sine', 659, t+0.07,  0.11, 0.26);
          this._osc(ctx,'sine', 784, t+0.14,  0.19, 0.30);
          break;
        case 'sheep_caught':
          this._osc(ctx,'sawtooth', 370, t,       0.10, 0.20, 270);
          this._osc(ctx,'sawtooth', 270, t+0.10,  0.09, 0.08, 360);
          this._osc(ctx,'sine',     155, t,        0.18, 0.06);
          this._osc(ctx,'sine', 523, t+0.22, 0.08, 0.24);
          this._osc(ctx,'sine', 659, t+0.30, 0.11, 0.24);
          this._osc(ctx,'sine', 784, t+0.38, 0.19, 0.28);
          break;
        case 'victory':
          this._osc(ctx,'sine', 523, t,       0.06, 0.28);
          this._osc(ctx,'sine', 659, t+0.07,  0.10, 0.28);
          this._osc(ctx,'sine', 784, t+0.14,  0.15, 0.30);
          this._osc(ctx,'sine',1047, t+0.21,  0.22, 0.42);
          this._osc(ctx,'sine',1568, t+0.28,  0.27, 0.55);
          break;
        case 'game_over':
          [392,330,262,196].forEach((f,i) =>
            this._osc(ctx,'sawtooth',f, t+i*0.22, 0.25, 0.18));
          break;
        case 'powerup':
          for(let i=0;i<8;i++) this._osc(ctx,'sine',280+i*80, t+i*0.045, 0.09, 0.16);
          break;
        case 'level_start':
          [261,329,392,523,659].forEach((f,i) =>
            this._osc(ctx,'sine',f, t+i*0.09, 0.14, 0.25));
          break;
        case 'footstep':
          this._noise(ctx, t, 0.04, 0.09, 220);
          break;
        case 'bleat':
          this._osc(ctx,'sawtooth', 310, t,      0.18, 0.18, 275);
          this._osc(ctx,'sawtooth', 275, t+0.18, 0.20, 0.15, 320);
          this._osc(ctx,'sine',     155, t,      0.36, 0.06);
          break;
      }
    } catch(e) {}
  }
}

export const audio = new AudioEngine();
