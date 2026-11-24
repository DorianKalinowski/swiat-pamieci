import { h, rand, sleep } from './dom.js';
import { sfx } from './sound.js';

const DOG_SVG = `
<svg class="dog" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <defs>
    <radialGradient id="dog-patch-g" cx="40%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </radialGradient>
    <linearGradient id="dog-coat-g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbb040"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="dog-ear-g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="dog-medal-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <!-- Miękki cień pod pieskiem -->
  <ellipse cx="100" cy="222" rx="58" ry="6" fill="#000" opacity=".22"/>

  <g class="all">
    <!-- Wesoły, merdający ogonek z puszystym jasnym pędzelkiem -->
    <g class="tail">
      <path d="M140 188 C 192 198, 212 126, 172 96" stroke="url(#dog-coat-g)" stroke-width="20" fill="none" stroke-linecap="round"/>
      <path d="M172 96 C 165 90, 156 85, 148 82" stroke="#fff8ee" stroke-width="16" fill="none" stroke-linecap="round"/>
    </g>

    <!-- Ciało pieska -->
    <g class="body">
      <ellipse cx="100" cy="170" rx="52" ry="48" fill="url(#dog-coat-g)"/>
      <!-- Puszysty jasny brzuszek -->
      <ellipse cx="100" cy="178" rx="30" ry="34" fill="#fff8ee"/>
      <!-- Urocza plamka/łatka na boku -->
      <ellipse cx="132" cy="160" rx="14" ry="18" fill="url(#dog-patch-g)" opacity=".85"/>
    </g>

    <!-- Przednie łapki oparte z boku -->
    <path class="arm arm-l" d="M62 152 Q48 174 58 196" stroke="url(#dog-coat-g)" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M138 152 Q152 174 142 196" stroke="url(#dog-coat-g)" stroke-width="17" stroke-linecap="round" fill="none"/>

    <!-- Tylne łapki z uroczymi poduszeczkami (paw pads) -->
    <ellipse cx="76" cy="214" rx="17" ry="10" fill="#b45309"/>
    <ellipse cx="124" cy="214" rx="17" ry="10" fill="#b45309"/>
    <ellipse cx="76" cy="213" rx="8" ry="5.5" fill="#fef3c7"/>
    <ellipse cx="124" cy="213" rx="8" ry="5.5" fill="#fef3c7"/>
    <circle cx="70" cy="207" r="2.2" fill="#fef3c7"/>
    <circle cx="76" cy="205" r="2.2" fill="#fef3c7"/>
    <circle cx="82" cy="207" r="2.2" fill="#fef3c7"/>
    <circle cx="118" cy="207" r="2.2" fill="#fef3c7"/>
    <circle cx="124" cy="205" r="2.2" fill="#fef3c7"/>
    <circle cx="130" cy="207" r="2.2" fill="#fef3c7"/>

    <!-- Czerwona elegancka obróżka z medalionem Tropiciela -->
    <path d="M66 135 Q 100 150 134 135" stroke="#ef4444" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M68 135 Q 100 150 132 135" stroke="#dc2626" stroke-width="4" fill="none" stroke-linecap="round"/>
    <!-- Złoty medalion tropiciela z odciskiem łapki -->
    <g transform="translate(100 146)">
      <circle cx="0" cy="0" r="9" fill="url(#dog-medal-g)" stroke="#b45309" stroke-width="1.8"/>
      <ellipse cx="0" cy="1.2" rx="3.5" ry="2.6" fill="#78350f"/>
      <circle cx="-3" cy="-2.2" r="1.1" fill="#78350f"/>
      <circle cx="0" cy="-3.6" r="1.1" fill="#78350f"/>
      <circle cx="3" cy="-2.2" r="1.1" fill="#78350f"/>
      <circle cx="-2.5" cy="-2.5" r="1" fill="#ffffff" opacity=".65"/>
    </g>

    <!-- Głowa pieska -->
    <g class="head">
      <!-- Oklapnięte, puszyste uszka z naturalnym zaokrągleniem -->
      <g class="ear ear-l">
        <path d="M52 56 C 18 62, 14 122, 44 126 C 60 128, 66 94, 62 60 Z" fill="url(#dog-ear-g)"/>
        <path d="M46 68 C 26 78, 24 114, 44 118 C 50 119, 54 100, 52 76 Z" fill="#f87171" opacity=".4"/>
      </g>
      <g class="ear ear-r">
        <path d="M148 56 C 182 62, 186 122, 156 126 C 140 128, 134 94, 138 60 Z" fill="url(#dog-ear-g)"/>
        <path d="M154 68 C 174 78, 176 114, 156 118 C 150 119, 146 100, 148 76 Z" fill="#f87171" opacity=".4"/>
      </g>

      <!-- Kształt główki z puchatymi policzkami -->
      <ellipse cx="100" cy="92" rx="59" ry="49" fill="url(#dog-coat-g)"/>

      <!-- Kosmyk / czuprynka na czubku główki -->
      <path d="M96 44 C 94 36, 102 33, 104 38 C 107 33, 114 36, 110 44 Z" fill="url(#dog-coat-g)"/>

      <!-- Ciemniejsza łatka wokół lewego oka -->
      <path d="M53 82 C 50 58, 93 54, 93 83 C 93 106, 55 106, 53 82 Z" fill="url(#dog-patch-g)"/>

      <!-- Kremowy pyszczek (podwójna miękka poduszka) -->
      <ellipse cx="88" cy="108" rx="19" ry="15" fill="#fff8ee"/>
      <ellipse cx="112" cy="108" rx="19" ry="15" fill="#fff8ee"/>
      <ellipse cx="100" cy="113" rx="17" ry="13" fill="#fff8ee"/>

      <!-- Kropeczki wąsików na pyszczku -->
      <circle cx="78" cy="109" r="1.3" fill="#92400e" opacity=".7"/>
      <circle cx="82" cy="112" r="1.3" fill="#92400e" opacity=".7"/>
      <circle cx="77" cy="115" r="1.3" fill="#92400e" opacity=".7"/>
      <circle cx="122" cy="109" r="1.3" fill="#92400e" opacity=".7"/>
      <circle cx="118" cy="112" r="1.3" fill="#92400e" opacity=".7"/>
      <circle cx="123" cy="115" r="1.3" fill="#92400e" opacity=".7"/>

      <!-- Zaróżowione rumieńce -->
      <circle cx="62" cy="107" r="9" fill="#ff4d6d" opacity=".45"/>
      <circle cx="138" cy="107" r="9" fill="#ff4d6d" opacity=".45"/>

      <!-- Bezpieczne sloty oczu -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#201526"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#201526"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
      </g>

      <!-- Oczy zamknięte (mruganie / radość) -->
      <g class="eyes-closed" fill="none" stroke="#201526" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 80 88 94"/>
        <path d="M112 94 Q124 80 136 94"/>
      </g>

      <!-- Błyszczący nosek trufelka z odblaskami światła -->
      <path d="M91 100 C 91 95, 109 95, 109 100 C 109 108, 91 108, 91 100 Z" fill="#1e1b4b"/>
      <ellipse cx="96" cy="98.5" rx="3" ry="1.4" fill="#ffffff" opacity=".85"/>
      <circle cx="103" cy="100" r="1" fill="#ffffff" opacity=".5"/>

      <!-- Wywieszony wesoły języczek z bruzdą -->
      <g class="tongue">
        <path d="M95 116 C 94 130, 106 130, 105 116 Z" fill="#fb7185" stroke="#e11d48" stroke-width="1.5"/>
        <line x1="100" y1="117" x2="100" y2="126" stroke="#e11d48" stroke-width="1.3" stroke-linecap="round"/>
      </g>

      <!-- Uśmiech pieska -->
      <path class="mouth m-smile" d="M100 108 L100 114 M100 114 Q91 122 83 115 M100 114 Q109 122 117 115" stroke="#201526" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M87 114 q13 22 26 0 z" fill="#201526"/>
      <path class="mouth m-sad" d="M87 124 q13 -14 26 0" stroke="#201526" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 106 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const POKE = [
  'Hau, hau! Jestem Piesek Łatek 🐶 Złapię każdy trop pamięciowy!',
  'Wystarczy pierwsza literka, a całe słowo samo wskakuje do głowy! 🐾',
  'Moje oklapnięte uszka nasłuchują nowych wierszyków i skrótów! ✨',
  '„Moja Wiecznie Zapracowana Mama...” – znasz już planety na pamięć? 🪐',
  'Merdam ogonkiem z radości! Twój mózg tropi wiedzę jak prawdziwy detektyw! 🦴',
  'Pierwsze litery to najwygodniejsze haczyki pamięciowe na świecie! 🎯'
];

export function createDog({ size = 'md', pokeLines = POKE } = {}) {
  const figure = h('button', {
    class: 'dog-figure',
    type: 'button',
    'aria-label': 'Piesek Łatek – kliknij, żeby pogłaskać',
    html: DOG_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `dog-wrap dog-${size}` }, figure, bubble);

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
