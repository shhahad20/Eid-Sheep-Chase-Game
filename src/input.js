// Keys that should have their default browser action suppressed during gameplay
const PREVENT_KEYS = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

export class InputHandler {
  constructor() {
    this.keys   = {};
    this.mobile = { dx: 0, dy: 0, sprint: false };
    this._keyDownCallbacks = [];
    this._bindKeyboard();
  }

  _bindKeyboard() {
    window.addEventListener('keydown', e => {
      // Ignore key events originating from text inputs so name-entry typing
      // cannot leave movement keys stuck after the overlay closes.
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      this.keys[e.key] = true;
      this._keyDownCallbacks.forEach(fn => fn(e.key));
      if (PREVENT_KEYS.includes(e.key)) e.preventDefault();
    });

    window.addEventListener('keyup', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      this.keys[e.key] = false;
    });

    // Release all keys when the page loses focus to prevent stuck movement.
    window.addEventListener('blur', () => { this.keys = {}; });
  }

  setupMobile() {
    const jEl   = document.getElementById('joystick');
    const knob  = document.getElementById('joystickKnob');
    const btn   = document.getElementById('sprintBtn');
    const ctrl  = document.getElementById('mobileControls');
    if (!jEl) return null;

    const isMobile = /Mobi|Android|iPhone|iPad|Touch/i.test(navigator.userAgent)
                  || window.matchMedia('(pointer:coarse)').matches;
    if (isMobile) ctrl.style.display = 'flex';

    let active = false, cX = 0, cY = 0;

    jEl.addEventListener('touchstart', e => {
      active = true;
      const r = jEl.getBoundingClientRect();
      cX = r.left + r.width/2; cY = r.top + r.height/2;
      e.preventDefault();
    }, { passive: false });

    jEl.addEventListener('touchmove', e => {
      if (!active) return;
      const t = e.touches[0];
      const dx = t.clientX - cX, dy = t.clientY - cY;
      const d  = Math.sqrt(dx*dx+dy*dy);
      const maxD = 34;
      const nd = Math.min(d, maxD);
      this.mobile.dx = d > 4 ? dx/d : 0;
      this.mobile.dy = d > 4 ? dy/d : 0;
      knob.style.transform = `translate(calc(-50% + ${(dx/d)*nd}px), calc(-50% + ${(dy/d)*nd}px))`;
      e.preventDefault();
    }, { passive: false });

    const endJ = () => {
      active = false;
      this.mobile.dx = 0; this.mobile.dy = 0;
      knob.style.transform = 'translate(-50%,-50%)';
    };
    jEl.addEventListener('touchend',    endJ);
    jEl.addEventListener('touchcancel', endJ);

    btn.addEventListener('touchstart', e => { this.mobile.sprint = true; e.preventDefault(); }, { passive: false });
    btn.addEventListener('touchend',   () => { this.mobile.sprint = false; });

    // Return the help button element so Game can wire it up
    return document.getElementById('helpBtn');
  }

  onKeyDown(fn) { this._keyDownCallbacks.push(fn); }

  // Call when starting a new game to clear any keys that got stuck during menus
  clearKeys() { this.keys = {}; }
}
