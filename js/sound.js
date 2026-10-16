import { store } from './store.js';

let ctx;
let enabled = store.get('sound', true);

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(f, d = .12, type = 'sine', v = .06, delay = 0, slideTo) {
  if (!enabled) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + d);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + .01);
  g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + d + .02);
}

// Pentatoniczna ciepła skala dla cyfr 0-9 (C4 do A5) – melodie zawsze brzmią harmonijnie!
const DIGIT_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

export const sfx = {
  key(n = 1) { tone(520 + n * 18, .05, 'triangle', .05); },
  digit(d) {
    const idx = parseInt(d, 10);
    const f = isNaN(idx) ? 440 : (DIGIT_NOTES[idx % 10] || 440);
    tone(f, .14, 'triangle', .08);
  },
  tick() { tone(880, .05, 'sine', .04); },
  pop() { tone(700, .08, 'sine', .05, 0, 1000); },
  good() { [523, 659, 784].forEach((f, i) => tone(f, .18, 'triangle', .07, i * .08)); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'triangle', .07, i * .09)); },
  bad() { tone(300, .35, 'sawtooth', .035, 0, 140); },
  meow() { tone(520, .28, 'sine', .07, 0, 900); tone(900, .25, 'sine', .05, .2, 420); },
  roar() {
    tone(260, .28, 'sawtooth', .04, 0, 190);
    tone(380, .24, 'triangle', .05, .04, 220);
    tone(520, .28, 'sine', .06, .1, 640);
  },
  sparkle() { [784, 987, 1174, 1568].forEach((f, i) => tone(f, .12, 'sine', .04, i * .05)); },
  success() { [523, 659, 784].forEach((f, i) => tone(f, .18, 'triangle', .07, i * .08)); },
  wrong() { tone(300, .35, 'sawtooth', .035, 0, 140); },
  fanfare() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'triangle', .07, i * .09)); },
  purr() { tone(700, .08, 'sine', .05, 0, 1000); }
};

export const buzz = p => { if (enabled) navigator.vibrate?.(p); };

export const sound = {
  get on() { return enabled; },
  toggle() { enabled = !enabled; store.set('sound', enabled); return enabled; }
};
