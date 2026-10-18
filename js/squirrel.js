import { h, rand, sleep } from './dom.js';
import { sfx } from './sound.js';

const SQUIRREL_SVG = `
<svg class="squirrel" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="58" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Ogromny puszysty ogon wiewiórki z tyłu -->
    <g class="tail">
      <path d="M130 195 C 220 210, 230 100, 185 55 C 160 25, 125 35, 120 55 C 115 75, 145 95, 160 120 C 175 145, 165 185, 130 195 Z" fill="#d35400"/>
      <path d="M140 180 C 205 195, 210 110, 175 70 C 158 48, 136 52, 132 65 C 128 80, 150 100, 160 125 C 170 148, 160 172, 140 180 Z" fill="#e67e22"/>
      <path d="M148 165 C 190 175, 195 120, 170 85 C 155 70, 145 80, 150 95 C 155 115, 150 145, 148 165 Z" fill="#fdf2e9" opacity=".4"/>
    </g>
    <!-- Ciało wiewiórki -->
    <g class="body">
      <ellipse cx="100" cy="168" rx="50" ry="46" fill="#d35400"/>
      <ellipse cx="100" cy="174" rx="28" ry="32" fill="#fdf2e9"/>
    </g>
    <!-- Trzymany żołądź -->
    <g class="acorn" transform="translate(85, 158)">
      <ellipse cx="15" cy="16" rx="14" ry="17" fill="#d4ac0d"/>
      <path d="M1 9 Q 15 -2 29 9 L 27 12 Q 15 3 3 12 Z" fill="#6e2c00"/>
      <rect x="13" y="-5" width="4" height="6" rx="2" fill="#4a235a"/>
    </g>
    <!-- Łapki trzymające orzeszek -->
    <path class="arm arm-l" d="M66 156 q12 8 20 12" stroke="#d35400" stroke-width="14" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M134 156 q-12 8 -20 12" stroke="#d35400" stroke-width="14" stroke-linecap="round" fill="none"/>
    <ellipse cx="74" cy="214" rx="18" ry="9" fill="#ba4a00"/>
    <ellipse cx="126" cy="214" rx="18" ry="9" fill="#ba4a00"/>
    <!-- Głowa wiewiórki -->
    <g class="head">
      <!-- Pędzelkowate uszka -->
      <g class="ear ear-l">
        <path d="M46 70 L34 18 L78 46 Z" fill="#d35400"/>
        <path d="M42 22 L34 18 L32 10 L44 14 Z" fill="#ba4a00"/>
        <path d="M50 62 L42 28 L70 46 Z" fill="#f5b7b1"/>
      </g>
      <g class="ear ear-r">
        <path d="M154 70 L166 18 L122 46 Z" fill="#d35400"/>
        <path d="M158 22 L166 18 L168 10 L156 14 Z" fill="#ba4a00"/>
        <path d="M150 62 L158 28 L130 46 Z" fill="#f5b7b1"/>
      </g>
      <!-- Policzki i pyszczek -->
      <ellipse cx="100" cy="94" rx="58" ry="48" fill="#d35400"/>
      <!-- Puszyste jasne policzki -->
      <circle cx="68" cy="106" r="24" fill="#fdf2e9"/>
      <circle cx="132" cy="106" r="24" fill="#fdf2e9"/>
      <ellipse cx="100" cy="112" rx="18" ry="14" fill="#fdf2e9"/>
      <circle cx="60" cy="108" r="9" fill="#ff708f" opacity=".65"/>
      <circle cx="140" cy="108" r="9" fill="#ff708f" opacity=".65"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#2b1b17" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 78 88 94"/>
        <path d="M112 94 Q124 78 136 94"/>
      </g>
      <!-- Nosek i ząbki / uśmiech -->
      <polygon points="95,104 105,104 100,109" fill="#2b1b17"/>
      <!-- Ząbek wiewiórki -->
      <rect x="97" y="114" width="6" height="5" rx="1" fill="#fff" stroke="#2b1b17" stroke-width="1"/>
      <path class="mouth m-smile" d="M100 110 q-8 7 -14 2 M100 110 q8 7 14 2" stroke="#2b1b17" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M88 113 q12 18 24 0 z" fill="#2b1b17"/>
      <path class="mouth m-sad" d="M88 122 q12 -12 24 0" stroke="#2b1b17" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const POKE = [
  'Cześć! Jestem Wiewiórka Basia 🐿️ Łączę myśli jak żołędzie w łańcuch!',
  'Im bardziej szalona akcja między dwoma rzeczami, tym trwalej zapamiętasz! 💥',
  'Wyobraź sobie, że parasol wystrzeliwuje w niebo jak rakieta! Widzisz to? 🚀',
  'Jeden element pociąga za sobą kolejny – efekt domina w Twojej pamięci! 🔗',
  'Chrup, chrup! Każde żywe skojarzenie to kolejny orzeszek na zimę! 🌰',
  'Skaczę po gałęziach wyobraźni! Lista 20 zakupów to dla nas pestka! ✨'
];

export function createSquirrel({ size = 'md', pokeLines = POKE } = {}) {
  const figure = h('button', {
    class: 'squirrel-figure',
    type: 'button',
    'aria-label': 'Wiewiórka Basia – kliknij, żeby pogłaskać',
    html: SQUIRREL_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `squirrel-wrap squirrel-${size}` }, figure, bubble);

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
      if (i % 3 === 0) sfx.purr();
      await sleep(speed);
    }
    if (revert) {
      clearTimeout(revertT);
      revertT = setTimeout(() => {
        if (id === typeId) {
          bubble.classList.remove('show');
          svg.dataset.mood = 'happy';
        }
      }, revert);
    }
  }

  function hideBubble() {
    typeId++;
    bubble.classList.remove('show');
  }

  function poke() {
    sfx.meow();
    setMood('cheer', 1500);
    const line = pokeLines[rand(0, pokeLines.length - 1)];
    say(line, 'cheer', { revert: 3200 });
  }
  figure.addEventListener('click', poke);

  function lookAt(x, y) {
    if (svg.dataset.mood === 'sleep') return;
    const r = figure.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.4;
    const dx = Math.max(-1, Math.min(1, (x - cx) / (window.innerWidth / 2 || 1)));
    const dy = Math.max(-1, Math.min(1, (y - cy) / (window.innerHeight / 2 || 1)));
    const pupils = figure.querySelectorAll('.pupil');
    pupils.forEach(p => {
      p.setAttribute('transform', `translate(${(dx * 4).toFixed(1)} ${(dy * 3).toFixed(1)})`);
    });
  }

  const onMove = e => lookAt(e.clientX, e.clientY);
  window.addEventListener('pointermove', onMove, { passive: true });

  return {
    el,
    svg,
    setMood,
    say,
    hideBubble,
    poke,
    lookAt,
    destroy() {
      dead = true;
      clearTimeout(revertT);
      window.removeEventListener('pointermove', onMove);
    }
  };
}

export function createSquirrelAvatar(mood = 'happy', size = 56) {
  const wrap = h('div', {
    class: 'squirrel-avatar',
    style: `width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;`,
    html: SQUIRREL_SVG
  });
  const svg = wrap.querySelector('svg');
  svg.dataset.mood = mood;
  return wrap;
}
