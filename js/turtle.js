import { h, rand, sleep } from './dom.js';
import { sfx } from './sound.js';

const TURTLE_SVG = `
<svg class="turtle" viewBox="0 0 200 230" data-mood="happy" aria-hidden="true">
  <ellipse cx="100" cy="222" rx="58" ry="6" fill="#000" opacity=".25"/>
  <g class="all">
    <!-- Płetwy / łapki tylne -->
    <ellipse cx="50" cy="195" rx="20" ry="12" fill="#229954" transform="rotate(-20 50 195)"/>
    <ellipse cx="150" cy="195" rx="20" ry="12" fill="#229954" transform="rotate(20 150 195)"/>
    <ellipse cx="40" cy="197" rx="4" ry="3" fill="#145a32"/>
    <ellipse cx="160" cy="197" rx="4" ry="3" fill="#145a32"/>

    <!-- Skorupa żółwia z motywem zegara -->
    <g class="shell">
      <!-- Główny pancerz -->
      <ellipse cx="100" cy="165" rx="64" ry="52" fill="#196f3d"/>
      <ellipse cx="100" cy="165" rx="56" ry="44" fill="#27ae60"/>
      <!-- Tarcza zegarowa na skorupie -->
      <circle cx="100" cy="165" r="34" fill="#fcf3cf" stroke="#b7950b" stroke-width="3"/>
      <!-- Oznaczenia godzin 12, 3, 6, 9 -->
      <rect x="99" y="135" width="2" height="6" fill="#7d6608"/>
      <rect x="99" y="189" width="2" height="6" fill="#7d6608"/>
      <rect x="70" y="164" width="6" height="2" fill="#7d6608"/>
      <rect x="124" y="164" width="6" height="2" fill="#7d6608"/>
      <!-- Wskazówki zegara -->
      <line x1="100" y1="165" x2="100" y2="145" stroke="#7d6608" stroke-width="3" stroke-linecap="round"/>
      <line x1="100" y1="165" x2="116" y2="165" stroke="#9a7d0a" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="100" cy="165" r="3.5" fill="#d4ac0d"/>
      <!-- Płytki skorupy dookoła tarczy -->
      <path d="M50 150 Q70 142 80 152" stroke="#196f3d" stroke-width="2.5" fill="none"/>
      <path d="M150 150 Q130 142 120 152" stroke="#196f3d" stroke-width="2.5" fill="none"/>
      <path d="M52 180 Q70 186 82 178" stroke="#196f3d" stroke-width="2.5" fill="none"/>
      <path d="M148 180 Q130 186 118 178" stroke="#196f3d" stroke-width="2.5" fill="none"/>
    </g>

    <!-- Płetwy / łapki przednie machające -->
    <path class="arm arm-l" d="M46 142 q-22 18 -10 38" stroke="#2ecc71" stroke-width="16" stroke-linecap="round" fill="none"/>
    <path class="arm arm-r" d="M154 142 q22 18 10 38" stroke="#2ecc71" stroke-width="16" stroke-linecap="round" fill="none"/>
    <ellipse cx="78" cy="216" rx="15" ry="8" fill="#1e8449"/>
    <ellipse cx="122" cy="216" rx="15" ry="8" fill="#1e8449"/>

    <!-- Głowa żółwika -->
    <g class="head">
      <ellipse cx="100" cy="92" rx="54" ry="46" fill="#2ecc71"/>
      <ellipse cx="100" cy="106" rx="36" ry="24" fill="#a9dfbf" opacity=".6"/>
      <!-- Różowe policzki -->
      <circle cx="66" cy="104" r="8" fill="#f1948a" opacity=".5"/>
      <circle cx="134" cy="104" r="8" fill="#f1948a" opacity=".5"/>
      <!-- Mały kapelusik lub czapeczka studencka z cyferblatem -->
      <ellipse cx="100" cy="50" rx="18" ry="4" fill="#d4ac0d"/>
      <path d="M92 49 L94 38 L106 38 L108 49 Z" fill="#b7950b"/>
      <circle cx="100" cy="38" r="3" fill="#f9e79f"/>

      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#145a32"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2" fill="#fff" opacity=".8"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#145a32"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2" fill="#fff" opacity=".8"/></g></g></g>
      </g>
      <g class="eyes-closed" fill="none" stroke="#145a32" stroke-width="5" stroke-linecap="round">
        <path d="M64 94 Q76 78 88 94"/>
        <path d="M112 94 Q124 78 136 94"/>
      </g>
      <!-- Nozdrza i uśmiech -->
      <circle cx="96" cy="105" r="1.5" fill="#145a32"/>
      <circle cx="104" cy="105" r="1.5" fill="#145a32"/>
      <path class="mouth m-smile" d="M100 110 q-9 8 -16 2 M100 110 q9 8 16 2" stroke="#145a32" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="mouth m-open" d="M88 112 q12 18 24 0 z" fill="#145a32"/>
      <path class="mouth m-sad" d="M88 120 q12 -12 24 0" stroke="#145a32" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="tear" d="M62 104 q-5 9 0 12 q5 -3 0 -12z" fill="#7fd6ff"/>
    </g>
  </g>
</svg>`;

const POKE = [
  'Tik-tak! Jestem Żółwik Zegarowy 🐢 Znam dzień tygodnia każdej daty w historii!',
  'Nie spiesz się! Kalendarz to tylko prosty rytm: 4.04, 6.06, 8.08, 10.10, 12.12! ⏱️',
  'Nawet żółw potrafi obliczyć dzień tygodnia w 3 sekundy. Nauczę Cię tego krok po kroku!',
  'Dzień Sądu (Doomsday) brzmi groźnie, ale to po prostu nasza niezawodna kotwica w czasie! ⚓',
  'Pamięć i czas to najlepsi przyjaciele! Sprawdźmy dowolny rok i dzień! 📅'
];

export function createTurtle({ size = 'md', pokeLines = POKE } = {}) {
  const figure = h('button', {
    class: 'turtle-figure',
    type: 'button',
    'aria-label': 'Żółwik Zegarowy – kliknij, żeby pogłaskać',
    html: TURTLE_SVG
  });
  const svg = figure.querySelector('svg');
  const text = h('span', { class: 'bubble-text' });
  const live = h('span', { class: 'sr-only', 'aria-live': 'polite' });
  const bubble = h('div', { class: 'bubble' }, text, live);
  const el = h('div', { class: `turtle-wrap turtle-${size}` }, figure, bubble);

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

export function createTurtleAvatar(mood = 'happy', size = 56) {
  const wrap = h('div', {
    class: 'turtle-avatar',
    style: `width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;`,
    html: TURTLE_SVG
  });
  const svg = wrap.querySelector('svg');
  svg.dataset.mood = mood;
  return wrap;
}
