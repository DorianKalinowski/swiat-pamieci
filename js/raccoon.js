import { h, rand, sleep } from './dom.js';
import { sfx } from './sound.js';

const RACCOON_SVG = `
<svg class="raccoon" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="54" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Pręgowany ogon szopa -->
    <g class="tail">
      <path d="M140 190 C 205 200, 215 125, 175 100" stroke="#8d99ae" stroke-width="24" fill="none" stroke-linecap="round"/>
      <path d="M152 188 l2 -12" stroke="#2b2d42" stroke-width="7" stroke-linecap="round"/>
      <path d="M174 172 l-6 -12" stroke="#2b2d42" stroke-width="7" stroke-linecap="round"/>
      <path d="M188 145 l-12 -6" stroke="#2b2d42" stroke-width="7" stroke-linecap="round"/>
      <path d="M182 120 l-10 6" stroke="#2b2d42" stroke-width="7" stroke-linecap="round"/>
      <path d="M175 100 C 170 94, 166 92, 162 90" stroke="#2b2d42" stroke-width="24" fill="none" stroke-linecap="round"/>
    </g>
    <!-- Ciało szopa -->
    <g class="body">
      <ellipse cx="100" cy="170" rx="54" ry="48" fill="#8d99ae"/>
      <ellipse cx="100" cy="180" rx="30" ry="34" fill="#edf2f4"/>
    </g>
    <!-- Łapki w ciemnych rękawiczkach -->
    <path class="arm arm-l" d="M62 152 q-14 22 -6 44" stroke="#8d99ae" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M138 152 q14 22 6 44" stroke="#8d99ae" stroke-width="17" stroke-linecap="round" fill="none"/>
    <ellipse cx="78" cy="214" rx="17" ry="9" fill="#2b2d42"/>
    <ellipse cx="122" cy="214" rx="17" ry="9" fill="#2b2d42"/>
    <!-- Czerwona muszka magika -->
    <g class="bowtie">
      <path d="M92 138 L84 130 L84 146 Z" fill="#e63946"/>
      <path d="M108 138 L116 130 L116 146 Z" fill="#e63946"/>
      <circle cx="100" cy="138" r="4.5" fill="#d90429"/>
    </g>
    <!-- Głowa szopa -->
    <g class="head">
      <!-- Zaokrąglone uszka z białym obrzeżem -->
      <g class="ear ear-l">
        <circle cx="50" cy="56" r="20" fill="#2b2d42"/>
        <circle cx="50" cy="56" r="14" fill="#edf2f4"/>
      </g>
      <g class="ear ear-r">
        <circle cx="150" cy="56" r="20" fill="#2b2d42"/>
        <circle cx="150" cy="56" r="14" fill="#edf2f4"/>
      </g>
      <ellipse cx="100" cy="92" rx="62" ry="50" fill="#8d99ae"/>
      <!-- Puszyste policzki -->
      <path d="M44 92 l-12 10 l12 4 l-8 10 l16 -2" fill="#8d99ae"/>
      <path d="M156 92 l12 10 l-12 4 l8 10 l-16 -2" fill="#8d99ae"/>
      <!-- Czarna maska rabusia / magika wokół oczu -->
      <path d="M52 92 C 52 74, 94 76, 100 88 C 106 76, 148 74, 148 92 C 148 108, 106 104, 100 102 C 94 104, 52 108, 52 92 Z" fill="#2b2d42"/>
      <path d="M98 42 v18" stroke="#edf2f4" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Biały pyszczek -->
      <ellipse cx="100" cy="112" rx="26" ry="18" fill="#edf2f4"/>
      <!-- Rumieńce -->
      <circle cx="60" cy="108" r="8" fill="#ff708f" opacity=".6"/>
      <circle cx="140" cy="108" r="8" fill="#ff708f" opacity=".6"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#1e2022"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#1e2022"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#edf2f4" stroke-width="5" stroke-linecap="round">
        <path d="M66 94 Q76 82 86 94"/>
        <path d="M114 94 Q124 82 134 94"/>
      </g>
      <!-- Nosek i uśmieszek -->
      <path d="M94 104 h12 l-6 7 z" fill="#1e2022"/>
      <path class="mouth m-smile" d="M100 112 q-8 8 -16 2 M100 112 q8 8 16 2" stroke="#2b2d42" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M88 114 q12 20 24 0 z" fill="#1e2022"/>
      <path class="mouth m-sad" d="M88 122 q12 -12 24 0" stroke="#2b2d42" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M58 108 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const POKE = [
  'Szast-prast! Jestem Szop Magik 🦝 Talia 52 kart nie ma przede mną tajemnic!',
  'System PAO: Osoba, Akcja, Obiekt. Trzy karty to jedna niezapomniana scena! 🃏',
  'Mój pręgowany ogon faluje z ekscytacji! Gotowy na karcianą sztuczkę? ✨',
  'Nie musisz być magikiem – wystarczy, że dasz kartom twarze swoich bohaterów! 🎩',
  'Wybierz kartę, dowolną kartę... a ja powiem Ci, która to była! 🪄',
  'Abrakadabra! Twój mózg tasuje obrazy szybciej niż krupier w Vegas! ♠️'
];

export function createRaccoon({ size = 'md', pokeLines = POKE } = {}) {
  const figure = h('button', {
    class: 'raccoon-figure',
    type: 'button',
    'aria-label': 'Szop Magik – kliknij, żeby pogłaskać',
    html: RACCOON_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `raccoon-wrap raccoon-${size}` }, figure, bubble);

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
