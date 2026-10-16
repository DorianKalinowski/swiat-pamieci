import { h, rand, sleep } from './dom.js';
import { sfx } from './sound.js';

const SVG = `
<svg class="cat" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="56" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <g class="tail"><path d="M140 190 C 196 196, 202 128, 172 108" stroke="#f59a3c" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M172 108 C 168 102, 166 100, 164 98" stroke="#fff3e0" stroke-width="17" fill="none" stroke-linecap="round"/></g>
    <g class="body">
      <ellipse cx="100" cy="170" rx="52" ry="48" fill="#ffb35c"/>
      <ellipse cx="100" cy="180" rx="30" ry="34" fill="#ffe9cc"/>
    </g>
    <path class="arm arm-l" d="M62 152 q-14 22 -6 44" stroke="#ffb35c" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M138 152 q14 22 6 44" stroke="#ffb35c" stroke-width="17" stroke-linecap="round" fill="none"/>
    <ellipse cx="80" cy="214" rx="17" ry="9" fill="#ffb35c"/><ellipse cx="120" cy="214" rx="17" ry="9" fill="#ffb35c"/>
    <g class="head">
      <g class="ear ear-l"><path d="M48 76 L52 22 L96 54 Z" fill="#ffb35c"/><path d="M58 64 L60 38 L82 54 Z" fill="#ff9db0"/></g>
      <g class="ear ear-r"><path d="M152 76 L148 22 L104 54 Z" fill="#ffb35c"/><path d="M142 64 L140 38 L118 54 Z" fill="#ff9db0"/></g>
      <ellipse cx="100" cy="92" rx="60" ry="52" fill="#ffb35c"/>
      <path d="M100 42 v14 M86 45 l3 12 M114 45 l-3 12" stroke="#f08a2c" stroke-width="5" stroke-linecap="round"/>
      <circle cx="64" cy="106" r="9" fill="#ff8fa3" opacity=".55"/><circle cx="136" cy="106" r="9" fill="#ff8fa3" opacity=".55"/>
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b2140"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2" fill="#fff" opacity=".8"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b2140"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2" fill="#fff" opacity=".8"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#2b2140" stroke-width="5" stroke-linecap="round"><path d="M64 94 Q76 78 88 94"/><path d="M112 94 Q124 78 136 94"/></g>
      <path d="M94 104 h12 l-6 7 z" fill="#ff6f8c"/>
      <path class="mouth m-smile" d="M100 111 q-8 11 -17 4 M100 111 q8 11 17 4" stroke="#2b2140" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M86 114 q14 22 28 0 z" fill="#2b2140"/>
      <path class="mouth m-sad" d="M86 123 q14 -13 28 0" stroke="#2b2140" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
      <g stroke="#2b2140" stroke-width="2" stroke-linecap="round" opacity=".55"><path d="M52 108 l-24 -5 M52 114 l-24 5 M148 108 l24 -5 M148 114 l24 5"/></g>
    </g>
  </g>
</svg>`;

const POKE = [
  'Miau! Łaskoczesz mnie! 😸', 'Mrrrau! Kręcę się z radości!', 'Hej! Wracamy do ćwiczeń? 🐾',
  'Wiesz, że koty śpią 16 godzin? Ty ćwicz pamięć!', 'Mruuu… ale fajnie! ✨'
];

export function createCat({ size = 'md', pokeLines = POKE } = {}) {
  const figure = h('button', { class: 'cat-figure', type: 'button', 'aria-label': 'Kot Mruczek – kliknij, żeby pogłaskać', html: SVG });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `cat-wrap cat-${size}` }, figure, bubble);

  let typeId = 0, revertT, wasConnected = false, born = Date.now(), dead = false;

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
    sfx.meow();
  }

  figure.addEventListener('click', () => {
    spin();
    say(rand(pokeLines), 'cheer', { revert: 1800 });
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
      await sleep(4500 + Math.random() * 4500);
      if (el.isConnected) wasConnected = true;
      else if (wasConnected || Date.now() - born > 30000) break;
      else continue;
      flash(rand(['ear-twitch', 'tail-fast', 'hop']), 900);
    }
    removeEventListener('pointermove', onMove);
  })();

  return {
    el, say, setMood, spin,
    wave(ms = 1800) { flash('wave', ms); },
    hop() { flash('hop', 700); },
    hide() { bubble.classList.remove('show'); typeId++; },
    set pokeLines(l) { pokeLines = l; },
    destroy() { dead = true; typeId++; removeEventListener('pointermove', onMove); }
  };
}
