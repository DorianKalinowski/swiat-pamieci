import { h, rand, sleep } from './dom.js';
import { sfx } from './sound.js';

const OWL_SVG = `
<svg class="owl" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="54" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Ciało sówki -->
    <g class="body">
      <ellipse cx="100" cy="155" rx="56" ry="58" fill="#8d5b32"/>
      <ellipse cx="100" cy="165" rx="36" ry="42" fill="#fff4e0"/>
      <!-- Piórka na brzuszku -->
      <path d="M90 148 q10 6 20 0 M84 162 q16 8 32 0 M88 176 q12 7 24 0" stroke="#c99763" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    </g>
    <!-- Skrzydła sówki -->
    <g class="wings">
      <ellipse class="arm arm-l" cx="50" cy="155" rx="14" ry="38" fill="#734520" transform="rotate(12 50 155)"/>
      <ellipse class="arm arm-r" cx="150" cy="155" rx="14" ry="38" fill="#734520" transform="rotate(-12 150 155)"/>
    </g>
    <!-- Pazurki -->
    <g fill="#f59e0b">
      <ellipse cx="80" cy="214" rx="14" ry="7"/><ellipse cx="120" cy="214" rx="14" ry="7"/>
      <circle cx="74" cy="215" r="4"/><circle cx="86" cy="215" r="4"/>
      <circle cx="114" cy="215" r="4"/><circle cx="126" cy="215" r="4"/>
    </g>
    <!-- Głowa sówki -->
    <g class="head">
      <!-- Piórowe uszka na czubku głowy -->
      <g class="ear ear-l">
        <path d="M52 64 L36 24 L76 46 Z" fill="#734520"/>
        <path d="M50 56 L40 32 L66 46 Z" fill="#ffd699"/>
      </g>
      <g class="ear ear-r">
        <path d="M148 64 L164 24 L124 46 Z" fill="#734520"/>
        <path d="M150 56 L160 32 L134 46 Z" fill="#ffd699"/>
      </g>
      <ellipse cx="100" cy="92" rx="60" ry="50" fill="#8d5b32"/>
      <!-- Jasna maska twarzowa -->
      <path d="M60 88 C 60 70, 96 70, 100 86 C 104 70, 140 70, 140 88 C 140 114, 100 128, 100 128 C 100 128, 60 114, 60 88 Z" fill="#fff4e0"/>
      <!-- Złote profesorskie okulary -->
      <circle cx="76" cy="90" r="22" stroke="#f59e0b" stroke-width="4.5" fill="none"/>
      <circle cx="124" cy="90" r="22" stroke="#f59e0b" stroke-width="4.5" fill="none"/>
      <path d="M98 90 h4" stroke="#f59e0b" stroke-width="4.5"/>
      <!-- Rumieńce -->
      <circle cx="58" cy="106" r="8" fill="#ff708f" opacity=".6"/>
      <circle cx="142" cy="106" r="8" fill="#ff708f" opacity=".6"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#2b1b17" stroke-width="5" stroke-linecap="round">
        <path d="M66 94 Q76 82 86 94"/>
        <path d="M114 94 Q124 82 134 94"/>
      </g>
      <!-- Dzióbek sówki -->
      <path d="M94 98 L106 98 L100 112 Z" fill="#f59e0b"/>
      <path class="mouth m-smile" d="M100 114 q0 4 0 4" stroke="#d97706" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M95 110 q5 12 10 0 z" fill="#734520"/>
      <path class="mouth m-sad" d="M95 114 q5 -8 10 0" stroke="#734520" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M60 108 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const POKE = [
  'Huu-huu! Jestem Sówka Profesor 🦉 Zamienię każdą liczbę w słowo!',
  'Litery to klucze do pamięci. Dźwięk rodzi obraz, a obraz zostaje na zawsze! 📜',
  'Mój dziób klaszcze z podziwu! Gotowy na kolejną zagadkę Majora? ✨',
  'Starożytni uczeni nie mieli smartfonów – mieli genialny System Major! 💡',
  'Mądrość to po prostu dobra technika skojarzeń! 🎓',
  'Huu! Pamięć to najpotężniejszy mięsień Twojego umysłu! 🌟'
];

export function createOwl({ size = 'md', pokeLines = POKE } = {}) {
  const figure = h('button', {
    class: 'owl-figure',
    type: 'button',
    'aria-label': 'Sówka Profesor – kliknij, żeby pogłaskać',
    html: OWL_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `owl-wrap owl-${size}` }, figure, bubble);

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
