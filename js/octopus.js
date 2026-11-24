import { h, rand, sleep } from './dom.js';
import { sfx } from './sound.js';

const OCTOPUS_SVG = `
<svg class="octopus" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <defs>
    <radialGradient id="octo-head-g" cx="42%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="50%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#7e22ce"/>
    </radialGradient>
    <linearGradient id="octo-tentacle-g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#6b21a8"/>
    </linearGradient>
    <linearGradient id="octo-beret-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="100%" stop-color="#0f766e"/>
    </linearGradient>
  </defs>

  <!-- Miękki cień pod ośmiornicą -->
  <ellipse cx="100" cy="222" rx="58" ry="6" fill="#000" opacity=".22"/>

  <g class="all">
    <!-- 8 Macków Ośmiornicy Inki (promieniście jak gałęzie mapy myśli) -->
    <g class="tentacles">
      <!-- Tylne macki (ciemniejsze, rozłożone promieniście) -->
      <g class="tentacles-back" stroke="url(#octo-tentacle-g)" stroke-width="14" fill="none" stroke-linecap="round">
        <path class="tentacle-back-1" d="M68 135 C 32 145, 16 175, 24 204 C 28 216, 42 216, 48 206 C 52 198, 48 186, 62 172"/>
        <path class="tentacle-back-2" d="M132 135 C 168 145, 184 175, 176 204 C 172 216, 158 216, 152 206 C 148 198, 152 186, 138 172"/>
        <path class="tentacle-back-3" d="M60 120 C 18 118, 12 152, 28 168 C 40 178, 54 164, 52 152"/>
        <path class="tentacle-back-4" d="M140 120 C 182 118, 188 152, 172 168 C 160 178, 146 164, 148 152"/>
      </g>

      <!-- Pędzel artystki myśli w prawej macce -->
      <g class="octo-brush" transform="translate(162 138) rotate(35)">
        <rect x="-3" y="-18" width="6" height="32" rx="2" fill="#d97706"/>
        <path d="M-4 14 L0 26 L4 14 Z" fill="#7e22ce"/>
        <circle cx="0" cy="25" r="2.5" fill="#f43f5e"/>
      </g>

      <!-- Przednie macki z widocznymi przyssawkami -->
      <g class="tentacles-front">
        <path class="tentacle-front-1" d="M72 138 C 50 162, 45 196, 62 215 C 72 224, 84 212, 78 200 C 74 190, 80 180, 84 160" stroke="url(#octo-head-g)" stroke-width="15" fill="none" stroke-linecap="round"/>
        <circle cx="53" cy="180" r="3.2" fill="#fbcfe8"/>
        <circle cx="56" cy="198" r="3.2" fill="#fbcfe8"/>
        <circle cx="68" cy="212" r="3.2" fill="#fbcfe8"/>

        <path class="tentacle-front-2" d="M128 138 C 150 162, 155 196, 138 215 C 128 224, 116 212, 122 200 C 126 190, 120 180, 116 160" stroke="url(#octo-head-g)" stroke-width="15" fill="none" stroke-linecap="round"/>
        <circle cx="147" cy="180" r="3.2" fill="#fbcfe8"/>
        <circle cx="144" cy="198" r="3.2" fill="#fbcfe8"/>
        <circle cx="132" cy="212" r="3.2" fill="#fbcfe8"/>

        <path class="tentacle-front-3" d="M86 142 C 78 174, 86 205, 96 216 C 104 225, 108 214, 102 202 C 98 192, 94 175, 96 155" stroke="url(#octo-head-g)" stroke-width="14" fill="none" stroke-linecap="round"/>
        <circle cx="82" cy="185" r="2.8" fill="#fbcfe8"/>
        <circle cx="88" cy="204" r="2.8" fill="#fbcfe8"/>

        <path class="tentacle-front-4" d="M114 142 C 122 174, 114 205, 104 216 C 96 225, 92 214, 98 202 C 102 192, 106 175, 104 155" stroke="url(#octo-head-g)" stroke-width="14" fill="none" stroke-linecap="round"/>
        <circle cx="118" cy="185" r="2.8" fill="#fbcfe8"/>
        <circle cx="112" cy="204" r="2.8" fill="#fbcfe8"/>
      </g>
    </g>

    <!-- Głowa / kopuła ośmiorniczki -->
    <g class="head">
      <ellipse cx="100" cy="88" rx="58" ry="52" fill="url(#octo-head-g)"/>
      <ellipse cx="100" cy="120" rx="46" ry="24" fill="url(#octo-head-g)"/>

      <!-- Błysk światła na czubku głowy -->
      <ellipse cx="76" cy="54" rx="14" ry="7" fill="#ffffff" opacity=".35" transform="rotate(-25 76 54)"/>
      <circle cx="94" cy="50" r="3" fill="#ffffff" opacity=".4"/>

      <!-- Turkusowy beret artystki myśli -->
      <g class="beret" transform="translate(100 42) rotate(-14)">
        <ellipse cx="0" cy="0" rx="34" ry="14" fill="url(#octo-beret-g)"/>
        <ellipse cx="0" cy="2" rx="36" ry="5" fill="#0d9488"/>
        <circle cx="0" cy="-14" r="3.5" fill="#fef08a"/>
        <line x1="0" y1="-14" x2="0" y2="-6" stroke="#fef08a" stroke-width="2"/>
      </g>

      <!-- Zaróżowione rumieńce -->
      <circle cx="62" cy="107" r="9" fill="#ff4d6d" opacity=".5"/>
      <circle cx="138" cy="107" r="9" fill="#ff4d6d" opacity=".5"/>

      <!-- Bezpieczne standardowe sloty oczu -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#201526"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#201526"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>

      <!-- Oczy zamknięte (mruganie / radość) -->
      <g class="eyes-closed" fill="none" stroke="#201526" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 80 88 94"/>
        <path d="M112 94 Q124 80 136 94"/>
      </g>

      <!-- Uśmieszek Inki -->
      <path class="mouth m-smile" d="M92 112 Q100 121 108 112" stroke="#201526" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M89 112 q11 18 22 0 z" fill="#201526"/>
      <path class="mouth m-sad" d="M89 122 q11 -12 22 0" stroke="#201526" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const POKE = [
  'Plusk! Jestem Ośmiornica Inka 🐙 Moje 8 macek ogarnia każdy chaos!',
  'Zapomnij o nudnych notatkach linijka po linijce – narysujmy myśl promieniście! 💡',
  'Głowa to temat główny, a macki to gałęzie wiedzy! Proste i genialne, prawda? 🎨',
  'Mój atrament nigdy nie wysycha! Każda gałąź z osobnym kolorem to +50% do pamięci! ✨',
  'Jedno słowo-klucz i mały symbol wystarczą, by zapamiętać cały wykład! 🧠',
  'Twój mózg uwielbia rozgałęzienia tak samo jak ja pływanie w rafie koralowej! 🌊'
];

export function createOctopus({ size = 'md', pokeLines = POKE } = {}) {
  const figure = h('button', {
    class: 'octopus-figure',
    type: 'button',
    'aria-label': 'Ośmiornica Inka – kliknij, żeby pogłaskać',
    html: OCTOPUS_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `octopus-wrap octopus-${size}` }, figure, bubble);

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
      const pick = rand(['tentacle-wave', 'hop']);
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
