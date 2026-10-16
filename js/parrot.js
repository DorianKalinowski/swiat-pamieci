import { h, rand, sleep } from './dom.js';
import { sfx } from './sound.js';

const PARROT_SVG = `
<svg class="parrot" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="54" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Kolorowy ogon papużki -->
    <g class="tail">
      <path d="M125 185 C 160 215, 175 160, 185 130" stroke="#00b4d8" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M115 190 C 145 220, 160 170, 172 145" stroke="#ffb703" stroke-width="12" fill="none" stroke-linecap="round"/>
    </g>
    <!-- Ciało papużki -->
    <g class="body">
      <ellipse cx="100" cy="162" rx="52" ry="52" fill="#2ec4b6"/>
      <ellipse cx="100" cy="170" rx="32" ry="38" fill="#ffb703"/>
    </g>
    <!-- Skrzydełka -->
    <g class="wings">
      <ellipse class="arm arm-l" cx="52" cy="158" rx="14" ry="36" fill="#00b4d8" transform="rotate(10 52 158)"/>
      <ellipse class="arm arm-r" cx="148" cy="158" rx="14" ry="36" fill="#00b4d8" transform="rotate(-10 148 158)"/>
    </g>
    <!-- Nóżki -->
    <g fill="#ff5964">
      <ellipse cx="80" cy="214" rx="15" ry="7"/><ellipse cx="120" cy="214" rx="15" ry="7"/>
    </g>
    <!-- Głowa z czubkiem z piórek -->
    <g class="head">
      <!-- Czubek na głowie (irokez) -->
      <g class="ear ear-l">
        <path d="M90 42 C 80 14, 94 8, 98 34" stroke="#ff5964" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M102 42 C 102 10, 114 8, 110 34" stroke="#ffb703" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M112 44 C 122 18, 130 16, 120 38" stroke="#00b4d8" stroke-width="6" fill="none" stroke-linecap="round"/>
      </g>
      <ellipse cx="100" cy="92" rx="58" ry="48" fill="#2ec4b6"/>
      <!-- Białe obwódki wokół oczu -->
      <ellipse cx="76" cy="90" rx="20" ry="22" fill="#fffef5"/>
      <ellipse cx="124" cy="90" rx="20" ry="22" fill="#fffef5"/>
      <circle cx="56" cy="106" r="7" fill="#ff5964" opacity=".4"/>
      <circle cx="144" cy="106" r="7" fill="#ff5964" opacity=".4"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2" fill="#fff" opacity=".8"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2" fill="#fff" opacity=".8"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#2b1b17" stroke-width="5" stroke-linecap="round">
        <path d="M66 94 Q76 82 86 94"/>
        <path d="M114 94 Q124 82 134 94"/>
      </g>
      <!-- Zakrzywiony słodki dzióbek -->
      <path d="M92 94 C 92 84, 108 84, 108 94 C 108 116, 100 120, 100 120 C 100 120, 92 116, 92 94 Z" fill="#ff5964"/>
      <path class="mouth m-smile" d="M96 112 q4 5 8 0" stroke="#b91c1c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M96 108 q4 14 8 0 z" fill="#b91c1c"/>
      <path class="mouth m-sad" d="M96 116 q4 -6 8 0" stroke="#b91c1c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M58 108 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const POKE = [
  'Kraa! Jestem Papużka Pola 🦜 Znam słówka ze wszystkich zakątków świata!',
  'Most fonetyczny to magia: nietoperz z baseballowym batem i już pamiętasz bat! ⚾',
  'Moje piórka mienią się jak tęcza! Gotowy na kolejną porcję słówek?',
  'Mów do mnie w dowolnym języku – zamienię go w zabawny obrazek! 🌴',
  'Kra-kra! Twój mózg to najszybszy tłumacz na świecie! ✨'
];

export function createParrot({ size = 'md', pokeLines = POKE } = {}) {
  const figure = h('button', {
    class: 'parrot-figure',
    type: 'button',
    'aria-label': 'Papużka Pola – kliknij, żeby pogłaskać',
    html: PARROT_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `parrot-wrap parrot-${size}` }, figure, bubble);

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
      const pick = rand(['ear-twitch', 'hop']);
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
