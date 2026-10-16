import { reducedMotion } from './dom.js';

export function confetti(count = 120) {
  if (reducedMotion()) return;
  const c = document.createElement('canvas');
  const ctx = c.getContext ? c.getContext('2d') : null;
  if (!ctx) return;
  c.className = 'confetti';
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = c.width = innerWidth * dpr;
  const H = c.height = innerHeight * dpr;
  document.body.append(c);
  const colors = ['#7c5cff', '#ff6bd6', '#3ef0c0', '#ffc857', '#ffffff'];
  const ps = Array.from({ length: count }, () => ({
    x: W / 2 + (Math.random() - .5) * W * .3,
    y: H * .55,
    vx: (Math.random() - .5) * 16 * dpr,
    vy: (-Math.random() * 18 - 6) * dpr,
    s: (4 + Math.random() * 6) * dpr,
    r: Math.random() * 6.28,
    vr: (Math.random() - .5) * .4,
    c: colors[Math.floor(Math.random() * colors.length)]
  }));
  const t0 = performance.now();
  (function frame(t) {
    const k = (t - t0) / 2400;
    ctx.clearRect(0, 0, W, H);
    for (const p of ps) {
      p.vy += .45 * dpr; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= .99;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - k);
      ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6);
      ctx.restore();
    }
    if (k < 1) requestAnimationFrame(frame); else c.remove();
  })(t0);
}
