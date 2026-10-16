import { h, rand, sleep } from './dom.js';
import { sfx } from './sound.js';

const FOX_SVG = `
<svg class="fox" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="56" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Ogon z białym pędzelkiem -->
    <g class="tail">
      <path d="M140 190 C 205 200, 215 120, 175 95" stroke="#ff6b35" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M175 95 C 168 90, 162 86, 155 82" stroke="#fff6ed" stroke-width="22" fill="none" stroke-linecap="round"/>
    </g>
    <!-- Ciało liska -->
    <g class="body">
      <ellipse cx="100" cy="170" rx="52" ry="48" fill="#ff6b35"/>
      <ellipse cx="100" cy="178" rx="28" ry="34" fill="#fff6ed"/>
    </g>
    <!-- Łapki w czarnych skarpetkach -->
    <path class="arm arm-l" d="M62 152 q-14 22 -6 44" stroke="#ff6b35" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M138 152 q14 22 6 44" stroke="#ff6b35" stroke-width="17" stroke-linecap="round" fill="none"/>
    <ellipse cx="78" cy="214" rx="17" ry="9" fill="#2b1b17"/>
    <ellipse cx="122" cy="214" rx="17" ry="9" fill="#2b1b17"/>
    <!-- Głowa liska -->
    <g class="head">
      <!-- Uszy ze spiczastymi czarnymi końcówkami -->
      <g class="ear ear-l">
        <path d="M42 74 L32 16 L84 48 Z" fill="#ff6b35"/>
        <path d="M38 42 L32 16 L54 32 Z" fill="#2b1b17"/>
        <path d="M48 64 L40 28 L72 48 Z" fill="#ff9db0"/>
      </g>
      <g class="ear ear-r">
        <path d="M158 74 L168 16 L116 48 Z" fill="#ff6b35"/>
        <path d="M162 42 L168 16 L146 32 Z" fill="#2b1b17"/>
        <path d="M152 64 L160 28 L128 48 Z" fill="#ff9db0"/>
      </g>
      <!-- Kształt głowy i puszyste policzki -->
      <ellipse cx="100" cy="92" rx="60" ry="50" fill="#ff6b35"/>
      <path d="M42 90 l-14 12 l14 4 l-10 12 l18 -4" fill="#ff6b35"/>
      <path d="M158 90 l14 12 l-14 4 l10 12 l-18 -4" fill="#ff6b35"/>
      <!-- Białe policzki i pyszczek -->
      <path d="M48 94 Q 100 70 152 94 Q 100 134 48 94 Z" fill="#fff6ed"/>
      <circle cx="64" cy="106" r="8" fill="#ff8fa3" opacity=".5"/>
      <circle cx="136" cy="106" r="8" fill="#ff8fa3" opacity=".5"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2" fill="#fff" opacity=".8"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2" fill="#fff" opacity=".8"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#2b1b17" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 78 88 94"/>
        <path d="M112 94 Q124 78 136 94"/>
      </g>
      <!-- Nosek i uśmiech -->
      <path d="M94 105 h12 l-6 7 z" fill="#2b1b17"/>
      <path class="mouth m-smile" d="M100 112 q-8 9 -16 3 M100 112 q8 9 16 3" stroke="#2b1b17" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M88 114 q12 20 24 0 z" fill="#2b1b17"/>
      <path class="mouth m-sad" d="M88 122 q12 -12 24 0" stroke="#2b1b17" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const POKE = [
  'Hau! Jestem Lisek Bystrzak 🦊 Każda twarz ma w sobie sekret!',
  'Zauważ ten mały pieprzyk albo okulary – to Twój pamięciowy haczyk! 🔍',
  'Mój puszysty ogon kręci się z zachwytu! Gotowy poznać nowych ludzi?',
  'Nigdy więcej nie powiesz: „Znam tę twarz, ale jak on miał na imię?”.',
  'Twój wzrok jest bystrzejszy niż myślisz! ✨'
];

export function createFox({ size = 'md', pokeLines = POKE } = {}) {
  const figure = h('button', {
    class: 'fox-figure',
    type: 'button',
    'aria-label': 'Lisek Bystrzak – kliknij, żeby pogłaskać',
    html: FOX_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `fox-wrap fox-${size}` }, figure, bubble);

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
    sfx.pop?.();
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
      const pick = rand(['ear-twitch', 'tail-fast', 'hop']);
      flash(pick, 800);
    }
  })();

  return {
    el,
    svg,
    say,
    setMood,
    spin,
    wave(ms = 1800) { flash('wave', ms); },
    hop() { flash('hop', 700); },
    destroy() {
      dead = true;
      typeId++;
      clearTimeout(revertT);
      removeEventListener('pointermove', onMove);
      el.remove();
    }
  };
}
