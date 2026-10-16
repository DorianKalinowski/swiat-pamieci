import { h, rand, sleep } from './dom.js';
import { sfx } from './sound.js';

const TIGER_SVG = `
<svg class="tiger" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="56" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <g class="tail">
      <path d="M140 190 C 196 196, 202 128, 172 108" stroke="#ff8a2b" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M152 191 l2 -10" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
      <path d="M172 178 l-5 -10" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
      <path d="M184 152 l-11 -4" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
      <path d="M180 126 l-11 4" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
      <path d="M172 108 C 168 102, 166 100, 164 98" stroke="#fff5ea" stroke-width="18" fill="none" stroke-linecap="round"/>
    </g>
    <g class="body">
      <ellipse cx="100" cy="170" rx="54" ry="48" fill="#ff8a2b"/>
      <ellipse cx="100" cy="180" rx="32" ry="34" fill="#fff5ea"/>
      <path d="M52 156 l14 4 M48 172 l18 2 M52 188 l14 -2" stroke="#281a17" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M148 156 l-14 4 M152 172 l-18 2 M148 188 l-14 -2" stroke="#281a17" stroke-width="4.5" stroke-linecap="round"/>
    </g>
    <path class="arm arm-l" d="M62 152 q-14 22 -6 44" stroke="#ff8a2b" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M138 152 q14 22 6 44" stroke="#ff8a2b" stroke-width="17" stroke-linecap="round" fill="none"/>
    <ellipse cx="78" cy="214" rx="18" ry="9" fill="#ff8a2b"/>
    <ellipse cx="122" cy="214" rx="18" ry="9" fill="#ff8a2b"/>
    <ellipse cx="78" cy="213" rx="10" ry="5" fill="#fff5ea"/>
    <ellipse cx="122" cy="213" rx="10" ry="5" fill="#fff5ea"/>
    <g class="head">
      <g class="ear ear-l">
        <path d="M46 72 C 34 32, 74 24, 88 52 Z" fill="#ff8a2b"/>
        <path d="M54 62 C 48 38, 70 34, 78 50 Z" fill="#ff9db0"/>
        <path d="M48 42 C 54 36, 64 34, 70 36" stroke="#281a17" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      </g>
      <g class="ear ear-r">
        <path d="M154 72 C 166 32, 126 24, 112 52 Z" fill="#ff8a2b"/>
        <path d="M146 62 C 152 38, 130 34, 122 50 Z" fill="#ff9db0"/>
        <path d="M152 42 C 146 36, 136 34, 130 36" stroke="#281a17" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      </g>
      <ellipse cx="100" cy="92" rx="62" ry="52" fill="#ff8a2b"/>
      <path d="M40 92 l-8 8 l8 4 l-6 8 l10 0" fill="#ff8a2b"/>
      <path d="M160 92 l8 8 l-8 4 l6 8 l-10 0" fill="#ff8a2b"/>
      <!-- Forehead stripes -->
      <path d="M100 42 v18" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
      <path d="M88 47 h24" stroke="#281a17" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M92 56 h16" stroke="#281a17" stroke-width="4" stroke-linecap="round"/>
      <path d="M74 54 l10 8" stroke="#281a17" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M126 54 l-10 8" stroke="#281a17" stroke-width="3.5" stroke-linecap="round"/>
      <!-- Cheek stripes -->
      <path d="M48 84 l14 4 M46 94 l16 2" stroke="#281a17" stroke-width="4" stroke-linecap="round"/>
      <path d="M152 84 l-14 4 M154 94 l-16 2" stroke="#281a17" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="100" cy="112" rx="34" ry="22" fill="#fff5ea"/>
      <circle cx="66" cy="108" r="9" fill="#ff8fa3" opacity=".55"/>
      <circle cx="134" cy="108" r="9" fill="#ff8fa3" opacity=".55"/>
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#281a17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2" fill="#fff" opacity=".8"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#281a17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2" fill="#fff" opacity=".8"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#281a17" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 78 88 94"/>
        <path d="M112 94 Q124 78 136 94"/>
      </g>
      <path d="M92 104 h16 l-8 8 z" fill="#ff6f8c"/>
      <g stroke="#281a17" stroke-width="2.2" stroke-linecap="round" opacity=".6">
        <path d="M62 108 l-26 -3 M62 114 l-28 4 M62 120 l-24 10"/>
        <path d="M138 108 l26 -3 M138 114 l28 4 M138 120 l24 10"/>
      </g>
      <path class="mouth m-smile" d="M100 112 q-9 10 -18 3 M100 112 q9 10 18 3" stroke="#281a17" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <g class="mouth m-open">
        <path d="M84 114 q16 26 32 0 z" fill="#281a17"/>
        <path d="M89 114 l3 6 l3 -6 M105 114 l3 6 l3 -6" fill="#fff"/>
        <ellipse cx="100" cy="132" rx="8" ry="4" fill="#ff6f8c"/>
      </g>
      <path class="mouth m-sad" d="M86 123 q14 -13 28 0" stroke="#281a17" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const POKE = [
  'Rawrr! Jestem Leon – Twój przewodnik po Pałacu Pamięci! 🐯',
  'Wiesz, że starożytni mówcy pamiętali wielogodzinne mowy dzięki loci?',
  'Im bardziej absurdalny i żywy obraz stworzysz, tym trwalej go zapamiętasz! ⚡',
  'Grr! Zobacz, jak macham ogonem – zwiedźmy kolejną komnatę! 🏰',
  'Twój mózg to zamek z nieograniczoną liczbą pokoi. Wykorzystaj go! ✨'
];

export function createTiger({ size = 'md', pokeLines = POKE } = {}) {
  const figure = h('button', {
    class: 'tiger-figure',
    type: 'button',
    'aria-label': 'Tygrysek Leon – kliknij, żeby pogłaskać',
    html: TIGER_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `tiger-wrap tiger-${size}` }, figure, bubble);

  let typeId = 0, revertT, dead = false;

  function setMood(m, revertMs = 0) {
    svg.dataset.mood = m;
    clearTimeout(revertT);
    if (revertMs) revertT = setTimeout(() => { svg.dataset.mood = 'happy'; }, revertMs);
  }

  async function say(msg, mood = 'happy', { revert = 0, speed = 14 } = {}) {
    const id = ++typeId;
    setMood(mood, revert);
    bubble.classList.add('show');
    live.textContent = msg;
    text.textContent = '';
    for (let i = 1; i <= msg.length; i++) {
      if (id !== typeId) return;
      text.textContent = msg.slice(0, i);
      await sleep(speed);
    }
  }

  function flash(cls, ms) {
    svg.classList.add(cls);
    setTimeout(() => svg.classList.remove(cls), ms);
  }

  function spin() {
    figure.classList.remove('spin'); void figure.offsetWidth;
    figure.classList.add('spin');
    sfx.roar?.();
  }

  function roar() {
    setMood('roar', 1500);
    figure.classList.remove('hop'); void figure.offsetWidth;
    figure.classList.add('hop');
    sfx.roar?.();
  }

  figure.addEventListener('click', () => {
    spin();
    say(rand(pokeLines), 'cheer', { revert: 2000 });
  });

  function onMove(e) {
    if (!el.isConnected) return;
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height * .4);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 220);
    svg.style.setProperty('--px', (dx / d * k * 4).toFixed(2));
    svg.style.setProperty('--py', (dy / d * k * 4).toFixed(2));
  }
  addEventListener('pointermove', onMove, { passive: true });

  (async function idle() {
    while (!dead) {
      await sleep(rand([3500, 5000, 6500]));
      if (dead || !el.isConnected) continue;
      const pick = rand(['ear', 'tail', 'blink']);
      if (pick === 'ear') flash('ear-twitch', 600);
      else if (pick === 'tail') flash('tail-fast', 1100);
    }
  })();

  return {
    el,
    svg,
    say,
    setMood,
    spin,
    roar,
    wave() { flash('wave', 1500); },
    hop() { flash('hop', 600); },
    destroy() {
      dead = true;
      clearTimeout(revertT);
      removeEventListener('pointermove', onMove);
      el.remove();
    }
  };
}
