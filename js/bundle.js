// Świat pamięci – Kompletny, zintegrowany pakiet aplikacji (obsługuje bezpośrednie otwarcie file:/// oraz serwery http:// i PWA)
(function() {
  'use strict';

  /* ==========================================================================
     1. DOM UTILS
     ========================================================================== */
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(kid));
    }
    return el;
  }

  const $ = (s, r = document) => r.querySelector(s);
  const rand = (a, b) => (b === undefined ? (Array.isArray(a) ? a[Math.floor(Math.random() * a.length)] : Math.floor(Math.random() * a)) : Math.floor(Math.random() * (b - a + 1)) + a);

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sleep(ms, signal) {
    return new Promise(res => {
      if (signal?.aborted) return res(false);
      const t = setTimeout(() => res(true), ms);
      signal?.addEventListener('abort', () => { clearTimeout(t); res(false); }, { once: true });
    });
  }

  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     2. STORE & STREAK
     ========================================================================== */
  const KEY = 'swiat-pamieci:v1';
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { state = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* tryb incognito */ } };

  const store = {
    get(k, d) { return k in state ? state[k] : d; },
    set(k, v) { state[k] = v; save(); },
    update(k, fn, d) { this.set(k, fn(this.get(k, d))); }
  };

  function getDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getDayDifference(dateStrA, dateStrB) {
    if (!dateStrA || !dateStrB) return Infinity;
    const partsA = dateStrA.split('-').map(Number);
    const partsB = dateStrB.split('-').map(Number);
    if (partsA.length !== 3 || partsB.length !== 3) return Infinity;
    const utc1 = Date.UTC(partsA[0], partsA[1] - 1, partsA[2]);
    const utc2 = Date.UTC(partsB[0], partsB[1] - 1, partsB[2]);
    return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
  }

  function touchStreak() {
    const today = getDateString();
    const last = store.get('lastDay', null);
    if (last === today) {
      return Math.max(1, store.get('streak', 1));
    }
    const diff = last ? getDayDifference(last, today) : Infinity;
    let newStreak = 1;
    if (diff === 1) {
      newStreak = Math.max(0, store.get('streak', 0)) + 1;
    } else {
      newStreak = 1;
    }
    store.set('streak', newStreak);
    store.set('lastDay', today);
    return newStreak;
  }

  function currentStreak() {
    const today = getDateString();
    const last = store.get('lastDay', null);
    if (!last) return 0;
    const diff = getDayDifference(last, today);
    if (diff === 0) {
      return store.get('streak', 1);
    } else if (diff === 1) {
      return store.get('streak', 0);
    } else {
      if (store.get('streak', 0) !== 0) {
        store.set('streak', 0);
      }
      return 0;
    }
  }

  /* ==========================================================================
     3. SOUND (WEB AUDIO API & HARMONIC PENTATONIC TONES)
     ========================================================================== */
  let ctx;
  let audioEnabled = store.get('sound', true);

  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(f, d = .12, type = 'sine', v = .06, delay = 0, slideTo) {
    if (!audioEnabled) return;
    const c = ac();
    if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + d + .02);
  }

  const DIGIT_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

  const sfx = {
    key(n = 1) { tone(520 + n * 18, .05, 'triangle', .05); },
    digit(d) {
      const idx = parseInt(d, 10);
      const f = isNaN(idx) ? 440 : (DIGIT_NOTES[idx % 10] || 440);
      tone(f, .14, 'triangle', .08);
    },
    tick() { tone(880, .05, 'sine', .04); },
    pop() { tone(700, .08, 'sine', .05, 0, 1000); },
    good() { [523, 659, 784].forEach((f, i) => tone(f, .18, 'triangle', .07, i * .08)); },
    win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'triangle', .07, i * .09)); },
    bad() { tone(300, .35, 'sawtooth', .035, 0, 140); },
    meow() { tone(520, .28, 'sine', .07, 0, 900); tone(900, .25, 'sine', .05, .2, 420); },
    roar() {
      tone(260, .28, 'sawtooth', .04, 0, 190);
      tone(380, .24, 'triangle', .05, .04, 220);
      tone(520, .28, 'sine', .06, .1, 640);
    },
    sparkle() { [784, 987, 1174, 1568].forEach((f, i) => tone(f, .12, 'sine', .04, i * .05)); },
    success() { [523, 659, 784].forEach((f, i) => tone(f, .18, 'triangle', .07, i * .08)); },
    wrong() { tone(300, .35, 'sawtooth', .035, 0, 140); },
    fanfare() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'triangle', .07, i * .09)); },
    purr() { tone(700, .08, 'sine', .05, 0, 1000); }
  };

  const buzz = p => { if (audioEnabled) navigator.vibrate?.(p); };

  const sound = {
    get on() { return audioEnabled; },
    toggle() { audioEnabled = !audioEnabled; store.set('sound', audioEnabled); return audioEnabled; }
  };

  /* ==========================================================================
     4. CONFETTI FX
     ========================================================================== */
  function confetti(count = 120) {
    if (reducedMotion()) return;
    const c = document.createElement('canvas');
    const gctx = c.getContext ? c.getContext('2d') : null;
    if (!gctx) return;
    c.className = 'confetti';
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = c.width = innerWidth * dpr;
    const H = c.height = innerHeight * dpr;
    document.body.append(c);
    const colors = ['#7c5cff', '#ff6bd6', '#3ef0c0', '#ffc857', '#ffffff'];
    const ps = Array.from({ length: count }, () => ({
      x: W / 2 + (Math.random() - .5) * W * .3,
      y: H * .55,
      vx: (Math.random() - .5) * 16 * dpr,
      vy: (-Math.random() * 18 - 6) * dpr,
      s: (4 + Math.random() * 6) * dpr,
      r: Math.random() * 6.28,
      vr: (Math.random() - .5) * .4,
      c: colors[Math.floor(Math.random() * colors.length)]
    }));
    const t0 = performance.now();
    (function frame(t) {
      const k = (t - t0) / 2400;
      gctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.vy += .45 * dpr; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= .99;
        gctx.save();
        gctx.globalAlpha = Math.max(0, 1 - k);
        gctx.translate(p.x, p.y); gctx.rotate(p.r);
        gctx.fillStyle = p.c;
        gctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6);
        gctx.restore();
      }
      if (k < 1) requestAnimationFrame(frame); else c.remove();
    })(t0);
  }

  /* ==========================================================================
     5. KOT MRUCZEK (MASCOT)
     ========================================================================== */
  const CAT_SVG = `
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
        <circle cx="64" cy="106" r="9" fill="#ff708f" opacity=".6"/><circle cx="136" cy="106" r="9" fill="#ff708f" opacity=".6"/>
        <ellipse cx="94" cy="110" rx="8" ry="5" fill="#fff8ef" opacity=".7"/><ellipse cx="106" cy="110" rx="8" ry="5" fill="#fff8ef" opacity=".7"/>
        <g class="eyes">
          <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b2140"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
          <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b2140"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
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
    'Miau! Łaskoczesz mnie! 😸',
    'Mrrrau! Kręcę się z radości! 🐾',
    'Hej! Wracamy do ćwiczeń? Razem pobijemy rekord! ✨',
    'Wiesz, że koty śpią 16 godzin? Ty ćwicz pamięć!',
    'Mruuu… ale fajnie! Twój mózg jest niesamowity! 🧠',
    'Głaszcz, głaszcz! Każde głaskanie to +10 do koncentracji! 🐱'
  ];

  function createCat({ size = 'md', pokeLines = POKE } = {}) {
    const figure = h('button', { class: 'cat-figure', type: 'button', 'aria-label': 'Kot Mruczek – kliknij, żeby pogłaskać', html: CAT_SVG });
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

  /* ==========================================================================
     5B. TYGRYSEK LEON (MASCOT FOR PALACE)
     ========================================================================== */
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
        <!-- Paski na czole -->
        <path d="M100 42 v18" stroke="#281a17" stroke-width="5" stroke-linecap="round"/>
        <path d="M88 47 h24" stroke="#281a17" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M92 56 h16" stroke="#281a17" stroke-width="4" stroke-linecap="round"/>
        <path d="M74 54 l10 8" stroke="#281a17" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M126 54 l-10 8" stroke="#281a17" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Paski na policzkach -->
        <path d="M48 84 l14 4 M46 94 l16 2" stroke="#281a17" stroke-width="4" stroke-linecap="round"/>
        <path d="M152 84 l-14 4 M154 94 l-16 2" stroke="#281a17" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="100" cy="112" rx="34" ry="22" fill="#fff5ea"/>
        <circle cx="66" cy="108" r="9" fill="#ff708f" opacity=".6"/>
        <circle cx="134" cy="108" r="9" fill="#ff708f" opacity=".6"/>
        <g class="eyes">
          <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#281a17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
          <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#281a17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
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

  const TIGER_POKE = [
    'Rawrr! Jestem Leon – Twój przewodnik po Pałacu Pamięci! 🐯',
    'Wiesz, że starożytni mówcy pamiętali wielogodzinne mowy dzięki loci?',
    'Im bardziej absurdalny i żywy obraz stworzysz, tym trwalej go zapamiętasz! ⚡',
    'Grr! Zobacz, jak macham ogonem – zwiedźmy kolejną komnatę! 🏰',
    'Twój mózg to zamek z nieograniczoną liczbą pokoi. Wykorzystaj go! ✨',
    'Tygrysia pamięć nigdy nie zawodzi! Leon trzyma za Ciebie kciuki! 🐾'
  ];

  function createTiger({ size = 'md', pokeLines = TIGER_POKE } = {}) {
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

    let typeId = 0, revertT, dead = false, wasConnected = false, born = Date.now();

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
        await sleep(4500 + Math.random() * 4500);
        if (el.isConnected) wasConnected = true;
        else if (wasConnected || Date.now() - born > 30000) break;
        else continue;
        const pick = rand(['ear-twitch', 'tail-fast', 'hop']);
        flash(pick, 900);
      }
      removeEventListener('pointermove', onMove);
    })();

    return {
      el, svg, say, setMood, spin, roar,
      wave(ms = 1800) { flash('wave', ms); },
      hop() { flash('hop', 700); },
      hide() { bubble.classList.remove('show'); typeId++; },
      destroy() { dead = true; typeId++; clearTimeout(revertT); removeEventListener('pointermove', onMove); }
    };
  }

  /* ==========================================================================
     6. DIGITS GAME UTILITIES
     ========================================================================== */
  function splitGroups(str, group = 0) {
    if (!group) return [str];
    const out = [];
    let i = 0;
    if (Array.isArray(group)) {
      for (const g of group) { if (i >= str.length) break; out.push(str.slice(i, i + g)); i += g; }
      if (i < str.length) out.push(str.slice(i));
      return out;
    }
    for (; i < str.length; i += group) out.push(str.slice(i, i + group));
    return out;
  }

  function smartGroups(len, size = 3) {
    if (len <= size + 1) return [len];
    const groups = Array(Math.floor(len / size)).fill(size);
    const r = len % size;
    if (r === 1) groups[groups.length - 1] += 1; else if (r > 1) groups.push(r);
    return groups;
  }

  function randomDigits(n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      let d;
      do { d = Math.floor(Math.random() * 10); }
      while (s.length >= 2 && s.at(-1) === String(d) && s.at(-2) === String(d));
      s += d;
    }
    return s;
  }

  const reverse = s => [...s].reverse().join('');

  function compareView(expected, value, group = 0) {
    const row = (label, str, mark) => h('div', { class: 'cmp-row' },
      h('span', { class: 'cmp-label' }, label),
      h('div', { class: 'cmp-digits' }, splitGroups(str, group).map((g, gi) => {
        const offset = splitGroups(str, group).slice(0, gi).join('').length;
        return h('span', { class: 'cmp-group' }, [...g].map((d, i) => {
          const ok = expected[offset + i] === d;
          return h('span', { class: mark ? (ok ? 'ok' : 'bad') : 'plain' }, d);
        }));
      })));
    return h('div', { class: 'compare' }, row('Poprawnie', expected, false), row('Ty', value, true));
  }

  const starsEl = (n, total = 3) =>
    h('div', { class: 'stars', 'aria-label': `${n} z ${total} gwiazdek` },
      Array.from({ length: total }, (_, i) => h('span', { class: i < n ? 'on' : '', style: `--i:${i}` }, '★')));

  /* ==========================================================================
     7. DIGITS PRESENTATION & SHAPE PEGS
     ========================================================================== */
  const SHAPE_PEGS = {
    '0': { emoji: '🥚', name: 'Jajko' },
    '1': { emoji: '🕯️', name: 'Świeca' },
    '2': { emoji: '🦢', name: 'Łabędź' },
    '3': { emoji: '❤️', name: 'Serce' },
    '4': { emoji: '⛵', name: 'Żaglówka' },
    '5': { emoji: '🪝', name: 'Hak' },
    '6': { emoji: '🐌', name: 'Ślimak' },
    '7': { emoji: '🪓', name: 'Kosa' },
    '8': { emoji: '☃️', name: 'Bałwan' },
    '9': { emoji: '🎈', name: 'Balon' }
  };

  const VOWELS = 'aeiouyąęóAEIOUYĄĘÓ';

  function present(host, { digits, mode = 'all', group = 0, time = 4000, interval = 700, cards = null, showShapes = false, signal, label } = {}) {
    return new Promise(resolve => {
      const timers = new Set();
      let finished = false;
      const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
      const end = why => { if (finished) return; finished = true; timers.forEach(clearTimeout); resolve(why); };
      signal?.addEventListener('abort', () => end('abort'), { once: true });

      const wrap = h('div', { class: 'present' });
      host.replaceChildren(wrap);
      if (label) wrap.append(h('div', { class: 'present-label' }, label));

      if (mode === 'seq') {
        const big = h('div', { class: 'seq-digit', 'aria-hidden': 'true' });
        const shapeHint = h('div', { class: 'seq-shape', 'aria-hidden': 'true' });
        const dots = h('div', { class: 'seq-dots' }, [...digits].map(() => h('i')));
        wrap.append(big, showShapes ? shapeHint : null, dots, h('div', { class: 'sr-only', 'aria-live': 'polite' }, `Cyfry: ${[...digits].join(', ')}`));
        let step = 0, c = 0;
        const pop = () => { big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop'); };
        const showNext = () => {
          if (step >= digits.length) return later(() => end('done'), 300);
          big.className = 'seq-digit';
          const d = digits[step];
          big.textContent = d;
          if (showShapes && SHAPE_PEGS[d]) {
            shapeHint.textContent = `${SHAPE_PEGS[d].emoji} ${SHAPE_PEGS[d].name}`;
          }
          pop();
          dots.children[step].classList.add('on');
          sfx.digit(d);
          step++;
          later(() => {
            big.textContent = '';
            if (showShapes) shapeHint.textContent = '';
            later(showNext, 130);
          }, interval - 130);
        };
        const countdown = () => {
          if (c < 3) {
            big.className = 'seq-digit count';
            big.textContent = 3 - c;
            pop(); sfx.tick(); c++;
            later(countdown, 520);
          } else { big.textContent = ''; later(showNext, 220); }
        };
        countdown();
        return;
      }

      let n = 0;
      const body = cards
        ? h('div', { class: 'cards' }, cards.map((c, i) =>
            h('div', { class: 'mcard', style: `--i:${i}` },
              h('div', { class: 'mcard-num' }, c.d),
              h('div', { class: 'mcard-emoji' }, c.emoji),
              h('div', { class: 'mcard-word' }, [...c.word].map(ch => h('span', { class: VOWELS.includes(ch) ? 'v' : 'c' }, ch))))))
        : h('div', { class: `digit-groups${showShapes ? ' with-shapes' : ''}`, 'aria-label': [...digits].join(' ') },
            splitGroups(digits, group).map(g =>
              h('div', { class: 'digit-group' }, [...g].map(d => {
                const peg = showShapes && SHAPE_PEGS[d];
                return h('div', { class: 'digit-box', style: `--i:${n++}` },
                  h('span', { class: 'digit' }, d),
                  peg ? h('span', { class: 'digit-peg', title: peg.name }, peg.emoji) : null
                );
              }))));

      const bar = h('i');
      wrap.append(
        body,
        h('div', { class: 'timebar', role: 'presentation' }, bar),
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => end('skip') }, 'Już pamiętam ✓')
      );
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = `transform ${time}ms linear`;
        bar.style.transform = 'scaleX(0)';
      }));
      later(() => end('time'), time);
    });
  }

  /* ==========================================================================
     8. DIGITS RECALL & KEYPAD
     ========================================================================== */
  function createRecall({ length, group = 0, onSubmit }) {
    let value = '', locked = false, destroyed = false;

    const slots = [];
    const slotsEl = h('div', { class: 'slots', role: 'group', 'aria-label': `Wpisz ${length} cyfr` },
      splitGroups('x'.repeat(length), group).map(g =>
        h('div', { class: 'slot-group' }, [...g].map(() => { const s = h('span', { class: 'slot' }); slots.push(s); return s; }))));

    const ok = h('button', { class: 'key key-ok', type: 'button', 'aria-label': 'Sprawdź', disabled: true, onclick: send }, '✓');
    const back = h('button', { class: 'key key-fn', type: 'button', 'aria-label': 'Usuń ostatnią cyfrę', onclick: del }, '⌫');
    const digitKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d =>
      h('button', { class: 'key', type: 'button', onclick: () => add(String(d)) }, d));
    const pad = h('div', { class: 'keypad' }, ...digitKeys.slice(0, 9), back, digitKeys[9], ok);
    const el = h('div', { class: 'recall' }, slotsEl, pad);

    function render() {
      slots.forEach((s, i) => {
        const c = value[i];
        s.textContent = c ?? '';
        s.classList.toggle('filled', c != null);
        s.classList.toggle('cur', !locked && i === value.length);
      });
      ok.disabled = locked || value.length !== length;
    }
    function add(d) {
      if (locked || value.length >= length) return;
      value += d; sfx.digit(d); buzz(8); render();
      slots[value.length - 1]?.animate?.([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 160 });
    }
    function del() { if (locked || !value) return; value = value.slice(0, -1); render(); }
    function send() { if (locked || value.length !== length) return; locked = true; render(); onSubmit(value); }

    function onKey(e) {
      if (destroyed || !el.isConnected || locked || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('dialog[open]')) return;
      if (/^[0-9]$/.test(e.key)) { add(e.key); e.preventDefault(); }
      else if (e.key === 'Backspace') { del(); e.preventDefault(); }
      else if (e.key === 'Enter') { send(); e.preventDefault(); }
    }
    addEventListener('keydown', onKey);
    render();

    return {
      el,
      get value() { return value; },
      get typed() { return value.length; },
      lock() { locked = true; render(); },
      reveal(n, expected) {
        slots.slice(0, n).forEach((s, i) => { s.dataset.ghost = expected[i]; s.classList.add('ghost'); });
      },
      mark(expected) {
        locked = true; render();
        slots.forEach((s, i) => { s.classList.remove('cur'); s.classList.add(expected[i] === value[i] ? 'ok' : 'bad'); });
      },
      shake() { slotsEl.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(0)' }], { duration: 320 }); },
      destroy() { destroyed = true; removeEventListener('keydown', onKey); }
    };
  }

  /* ==========================================================================
     9. LESSONS & CHAPTERS
     ========================================================================== */
  const CHAPTERS = [
    { title: 'Kształty Cyfr i Pierwsze Kroki', emoji: '🐾', desc: 'Od 1 cyfry do pierwszej żywej historyjki' },
    { title: 'Grupowanie w Życiu (Chunking)', emoji: '✂️', desc: 'PIN do karty, kod pocztowy i płatność BLIK' },
    { title: 'Granica Millera i Telefon', emoji: '📱', desc: '7 cyfr, daty i pełny 9-cyfrowy numer telefonu!' },
    { title: 'Główny System Pamięciowy (Major)', emoji: '🖼️', desc: 'Zamiana cyfr w słowa – sekret arcymistrzów' },
    { title: 'Arcymistrzostwo', emoji: '🏆', desc: '10, 11 i 12 cyfr – poziom zawodów pamięciowych' }
  ];

  const majorPanel = `
  <div class="major">
    <p class="panel-title">Alfabet cyfr (System Major)</p>
    <div class="major-grid">
      <div><b>0</b><span>S Z C</span></div><div><b>1</b><span>T D</span></div><div><b>2</b><span>N</span></div>
      <div><b>3</b><span>M</span></div><div><b>4</b><span>R</span></div><div><b>5</b><span>L</span></div>
      <div><b>6</b><span>SZ CZ Ż</span></div><div><b>7</b><span>K G</span></div><div><b>8</b><span>F W</span></div>
      <div><b>9</b><span>P B</span></div>
    </div>
    <p class="panel-note">Samogłoski (A E I O U Y) są „za darmo” – wstawiasz je, żeby powstało słowo. <b>TOR</b> → T=1, R=4 → <b>14</b>.</p>
  </div>`;

  const LESSONS = [
    // ───────── Rozdział 0: Kształty Cyfr i Pierwsze Kroki ─────────
    {
      id: 'l1', ch: 0, title: 'Jedna cyfra i jej kształt',
      intro: [
        'Miau! Cześć! Jestem kotek Mruczek 🐾 i nauczę Cię niezwykłej supermocy!',
        'Po co uczyć się cyfr? Wyobraź sobie, że w 3 sekundy zapamiętujesz kod BLIK, PIN do telefonu, kod do domofonu czy numer do rodziców w nagłej sytuacji – bez paniki i bez kartki!',
        'Sekret jest prosty: nasz mózg gubi się w nudnych cyfrach, ale uwielbia bajki i kolorowe obrazy! 🖼️',
        'Zobacz: cyfra 2 wygląda dokładnie jak dumny łabędź płynący po stawie 🦢. Spójrz na ekran i zapamiętaj łabędzia!'
      ],
      digits: '2', time: 4500, showShapes: true,
      hints: ['Cyfra 2 wygląda jak wygięta szyja łabędzia 🦢', 'Wpisz cyfrę 2!']
    },
    {
      id: 'l2', ch: 0, title: 'Dwie cyfry – pierwsza historyjka',
      intro: [
        'Świetnie! A teraz połączmy dwie cyfry: 2 (Łabędź 🦢) i 8 (Bałwan ☃️).',
        'Sekret nr 2: połącz je w absurdalną scenę w wyobraźni!',
        'Wyobraź sobie, jak Łabędź podpływa do brzegu i nakłada szalik Bałwanowi 🦢🧣☃️.'
      ],
      digits: '28', time: 5500, showShapes: true,
      hints: ['Pamiętasz scenę na śniegu? Łabędź (2) i Bałwan (8)!', 'Pierwsza cyfra to 2, druga to 8.']
    },
    {
      id: 'l3', ch: 0, title: 'Trzy cyfry – melodia obrazów',
      intro: [
        'Trzy cyfry! Użyjemy trzech kształtów: 4 (Żaglówka ⛵), 8 (Bałwan ☃️) i 2 (Łabędź 🦢).',
        'Scena: Bałwan płynie Żaglówką ciągniętą przez wielkiego Łabędzia!',
        'Możesz też powtórzyć w myślach rytm: cztery-osiem-dwa 🎵'
      ],
      digits: '482', time: 6000, showShapes: true,
      hints: ['Żaglówka (4), Bałwan (8), Łabędź (2). Ucho pomaga oku! 👂', 'Zacznij od 4 – żaglówki!']
    },

    // ───────── Rozdział 1: Grupowanie w Życiu (Chunking) ─────────
    {
      id: 'l4', ch: 1, title: 'Cztery cyfry – Twój kod PIN',
      intro: [
        'Pora na najważniejszą technikę codzienności: GRUPOWANIE (Chunking) ✂️',
        'Pamięć robocza nie lubi 4 osobnych cyfr. Zamiast 7-1-5-9 podziel je na dwie pary: 71 i 59!',
        'Dokładnie tak, jak zapamiętujesz kod PIN do karty bankomatowej.'
      ],
      digits: '7159', group: 2, time: 6500,
      hints: ['Dwie paczki: siedemdziesiąt jeden (71) i pięćdziesiąt dziewięć (59).', 'Pierwsza para to 71, druga to 59.']
    },
    {
      id: 'l5', ch: 1, title: 'Pięć cyfr – Kod pocztowy',
      intro: [
        'Pięć cyfr z rzędu bez techniki to dla większości ludzi chaos.',
        'Ale podziel je na 30 i 694 – i nagle to tylko DWA proste elementy!',
        'Zupełnie jak kod pocztowy Twojego ulubionego miasta 📮'
      ],
      digits: '30694', group: [2, 3], time: 7000,
      hints: ['Dwie paczki: 30 i 694. Dwa kawałki zamiast pięciu!', 'Zacznij od 30, potem 694.']
    },
    {
      id: 'l6', ch: 1, title: 'Sześć cyfr – Kod BLIK w 3 sekundy!',
      intro: [
        'Płacisz w internecie kodem BLIK? Kod ma 6 cyfr podzielonych 3 + 3.',
        'Zobacz: 528 i 913. Przeczytaj je jak dwie liczby: „pięćset dwadzieścia osiem” i „dziewięćset trzynaście”.',
        'Mruczek czeka na zakupy! 🛍️'
      ],
      digits: '528913', group: 3, time: 7500,
      hints: ['Dwie paczki: 528 oraz 913.', 'Pierwsza paczka: 528.']
    },

    // ───────── Rozdział 2: Granica Millera i Telefon ─────────
    {
      id: 'l7', ch: 2, title: 'Siedem cyfr – Liczba Millera',
      intro: [
        'Sławny psycholog George Miller udowodnił, że ludzka pamięć mieści 7 ± 2 elementy.',
        'Większość ludzi tu odpada. Ty podziel te 7 cyfr na 3 paczki: 730 · 52 · 91.',
        'Rytm w głowie czyni cuda!'
      ],
      digits: '7305291', group: [3, 2, 2], time: 8000,
      hints: ['Trzy paczki: 730 · 52 · 91.', 'Pierwsza paczka to 730.']
    },
    {
      id: 'l8', ch: 2, title: 'Osiem cyfr – Znane daty',
      intro: [
        'Najlepsze paczki pamięciowe to te, które już znasz!',
        'Zobaczysz 8 cyfr złożonych z dwóch słynnych dat z historii Polski 📜',
        'Mózg od razu je rozpozna!'
      ],
      digits: '14101939', group: 4, time: 8000,
      hints: ['Bitwa pod Grunwaldem (1410) i początek II wojny (1939).', '1410 i 1939.']
    },
    {
      id: 'l9', ch: 2, title: 'Dziewięć cyfr – Cały numer telefonu! 📱',
      intro: [
        'OTO ŚWIĘTY GRAAL SZKOLENIA: PEŁNE 9 CYFR! 📱',
        'Wyobraź sobie, że ktoś dyktuje Ci swój numer: 604 · 281 · 937.',
        'Trzy paczki po 3 cyfry. Powtórz je w myślach jak refren hitu z radia!'
      ],
      digits: '604281937', group: 3, time: 9500,
      hints: ['Trzy paczki: 604 · 281 · 937. Rytmicznie jak refren piosenki.', 'Pierwsza paczka: 604.']
    },

    // ───────── Rozdział 3: Główny System Pamięciowy (Major) ─────────
    {
      id: 'l10', ch: 3, title: 'Cyfry mają literki',
      panel: majorPanel,
      intro: [
        'Teraz magia arcymistrzów! ✨ System Major zamienia cyfry w SPÓŁGŁOSKI.',
        'Samogłoski (A E I O U Y) wstawiasz dowolnie, tworząc słowa!',
        'Np. 14 = T-R → „TOR” 🛤️ oraz 31 = M-T → „MATA” 🧘. Zapamiętaj obrazy!'
      ],
      digits: '1431', group: 2, time: 9000,
      cards: [{ d: '14', emoji: '🛤️', word: 'TOR' }, { d: '31', emoji: '🧘', word: 'MATA' }],
      hints: ['Tor i mata. Mata rozłożona na torze – dziwne = zapamiętane!', 'TOR = 14, MATA = 31.']
    },
    {
      id: 'l11', ch: 3, title: 'Trzy obrazy = sześć cyfr',
      panel: majorPanel,
      intro: [
        'Trzy obrazy dają aż 6 cyfr na raz! Połącz je w krótką historyjkę.',
        'Im śmieszniejsza, tym lepiej – mózg kocha absurd 🤪'
      ],
      digits: '149207', group: 2, time: 10500,
      cards: [{ d: '14', emoji: '🛤️', word: 'TOR' }, { d: '92', emoji: '🎩', word: 'PAN' }, { d: '07', emoji: '🧃', word: 'SOK' }],
      hints: ['Historyjka: PAN w cylindrze stoi na TORZE i pije SOK. 🎩🛤️🧃', 'TOR 14 → PAN 92 → SOK 07.']
    },
    {
      id: 'l12', ch: 3, title: 'Łańcuch czterech obrazów',
      panel: majorPanel,
      intro: [
        'Cztery obrazy – aż 8 cyfr! Każdy kolejny obraz wpinaj jak wagonik pociągu.',
        'FALA 🌊 uderza w NOS 👃, który trzyma LINĘ 🪢 przywiązaną do MATY 🧘!'
      ],
      digits: '85205231', group: 2, time: 13000,
      cards: [{ d: '85', emoji: '🌊', word: 'FALA' }, { d: '20', emoji: '👃', word: 'NOS' }, { d: '52', emoji: '🪢', word: 'LINA' }, { d: '31', emoji: '🧘', word: 'MATA' }],
      hints: ['FALA uderza w NOS, trzymający LINĘ przy MATIE. 🌊👃🪢🧘', 'FALA 85 · NOS 20 · LINA 52 · MATA 31.']
    },

    // ───────── Rozdział 4: Arcymistrzostwo ─────────
    {
      id: 'l13', ch: 4, title: 'Dziesięć cyfr – Pięć par',
      intro: [
        'Czas sprawdzić swoje siły bez podpowiedzi obrazkowych!',
        '10 cyfr! Zastosuj podział na 5 par: 48 · 26 · 15 · 09 · 37.'
      ],
      digits: '4826150937', group: 2, time: 11000,
      hints: ['Pięć par: 48 · 26 · 15 · 09 · 37.', 'Zaczyna się od 48.']
    },
    {
      id: 'l14', ch: 4, title: 'Numer z kierunkowym kraju (+48)',
      intro: [
        'Pełny numer z kierunkowym to aż 11 cyfr!',
        'Pierwsze dwie znasz bez mrugnięcia okiem: 48 to Polska 🇵🇱! Zostały tylko 3 paczki telefonu.'
      ],
      digits: '48602713958', group: [2, 3, 3, 3], time: 11500,
      hints: ['48 (Polska), a potem 602 · 713 · 958.', 'Polska 48, potem 602.']
    },
    {
      id: 'l15', ch: 4, title: 'Wielki Finał – 12 cyfr!',
      intro: [
        'To jest ten moment! Finałowa lekcja szkolenia: aż 12 cyfr w 4 paczkach.',
        'Połącz wszystko: kształty, rytm i grupowanie. Wierzę w Ciebie! 🌟'
      ],
      digits: '951730482615', group: 3, time: 14000,
      hints: ['Cztery paczki po trzy: 951 · 730 · 482 · 615.', '951, potem 730.']
    }
  ];

  const PRAISE_PERFECT = [
    'Mrrr! Perfekcyjnie! Bez żadnej podpowiedzi! 🌟', 'Mistrz pamięci! Aż mi się ogon zakręcił! 🏆', 'Idealnie! Twój mózg to superkomputer!'
  ];
  const PRAISE_OK = [
    'Miau! Dobra robota, tak trzymaj! 😸', 'Brawo! Pamięć rośnie w siłę! 💪', 'Tak jest! Jedziemy dalej!'
  ];
  const ENCOURAGE = [
    'Prawie! Pamięć to mięsień – trenuj, a urośnie 💪', 'Nic nie szkodzi! Spróbujmy jeszcze raz, tym razem spokojniej.', 'Miau… tym razem się nie udało. Ale Ty dasz radę! 🐾'
  ];
  const NUDGES = [
    'Hej, tu Mruczek! Potrzebujesz podpowiedzi? Przycisk 💡 czeka!', 'Nie spiesz się… ale mruczę z niecierpliwości 😸', 'Spróbuj odtworzyć cyfry „w głowie”, jakbyś je słyszał.'
  ];

  /* ==========================================================================
     10. MODES (FREE PLAY)
     ========================================================================== */
  const MODES = [
    {
      id: 'classic', name: 'Klasyk', emoji: '🧠', color: ['#7c5cff', '#a678ff'],
      desc: 'Wszystkie cyfry naraz. Czysta pamięć – czas skraca się z poziomem.',
      reverse: false,
      round: (level, len) => ({ mode: 'all', time: len * Math.max(520, 900 - level * 22) + 900 })
    },
    {
      id: 'flash', name: 'Błysk', emoji: '⚡', color: ['#ffc857', '#ff8a5c'],
      desc: 'Cyfry mrugają po jednej. Nie zdążysz drugi raz – skup się!',
      reverse: false,
      round: level => ({ mode: 'seq', interval: Math.max(380, 820 - level * 20) })
    },
    {
      id: 'reverse', name: 'Odwrotnie', emoji: '🔄', color: ['#3ef0c0', '#4aa8ff'],
      desc: 'Zapamiętaj, a potem wpisz od końca. Mózg na wysokich obrotach.',
      reverse: true,
      round: (level, len) => ({ mode: 'all', time: len * Math.max(560, 950 - level * 22) + 1000 })
    },
    {
      id: 'groups', name: 'Paczki', emoji: '📱', color: ['#ff6bd6', '#ff8a5c'],
      desc: 'Cyfry w grupkach jak numer telefonu – ćwiczysz technikę grupowania.',
      reverse: false,
      round: (level, len) => ({ mode: 'all', group: smartGroups(len, 3), time: len * Math.max(480, 820 - level * 20) + 800 })
    },
    {
      id: 'melody', name: 'Melodia', emoji: '🎵', color: ['#12b5a0', '#3ef0c0'],
      desc: 'Każda cyfra to unikalny ton muzyczny. Zapamiętujesz rytm i melodię!',
      reverse: false,
      round: level => ({ mode: 'seq', interval: Math.max(420, 800 - level * 18) })
    },
    {
      id: 'shapes', name: 'Kształty', emoji: '🎨', color: ['#ff9966', '#ff5e62'],
      desc: 'Cyfry z podpowiedziami kształtów (np. 🦢, ☃️). Twórz w głowie szalone historie!',
      reverse: false,
      round: (level, len) => ({ mode: 'all', showShapes: true, time: len * Math.max(600, 1000 - level * 20) + 1200 })
    }
  ];

  const getMode = id => MODES.find(m => m.id === id);

  /* ==========================================================================
     11. TRAINING SCREEN (MAP & STEP)
     ========================================================================== */
  const progress = () => store.get('digits.train', {});

  function mountMap(root) {
    const cat = createCat({ size: 'sm' });
    const prog = progress();
    const firstOpen = LESSONS.findIndex(l => !prog[l.id]);
    const done = LESSONS.filter(l => prog[l.id]).length;

    const chapters = CHAPTERS.map((ch, ci) =>
      h('div', { class: 'chapter' },
        h('h3', {}, h('span', {}, ch.emoji), ' ', ch.title, h('small', {}, ch.desc)),
        LESSONS.map((l, i) => ({ l, i })).filter(x => x.l.ch === ci).map(({ l, i }) => {
          const stars = prog[l.id] || 0;
          const locked = firstOpen !== -1 && i > firstOpen;
          const state = stars ? 'done' : locked ? 'locked' : 'current';
          return h(locked ? 'div' : 'a', {
            class: `lesson ${state}`, href: locked ? null : `#/digits/train/${i + 1}`,
            'aria-disabled': locked ? 'true' : null
          },
            h('span', { class: 'ln' }, locked ? '🔒' : stars ? '✓' : i + 1),
            h('span', { class: 'lt' }, h('b', {}, l.title), h('small', {}, `${l.digits.length} cyfr${l.cards ? ' · obrazy' : l.showShapes ? ' · kształty' : ''}`)),
            starsEl(stars));
        })));

    const whyCard = h('div', { class: 'why-card' },
      h('span', { class: 'why-icon' }, '🎯'),
      h('div', { class: 'why-content' },
        h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
        h('p', {}, 'Kody BLIK na zakupach (zanim znikną z ekranu!), PIN-y do kart, kody do domofonów i numery telefonów bliskich w nagłych wypadkach – zapamiętasz je w 3 sekundy bez panicznego szukania komórki!')
      )
    );

    root.append(h('section', { class: 'screen' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/digits', class: 'back' }, '← Cyfry')),
      h('div', { class: 'game-head' }, h('h1', {}, 'Mapa ', h('span', { class: 'grad' }, 'szkolenia'))),
      cat.el,
      whyCard,
      h('div', { class: 'bar-progress', style: `--p:${done / LESSONS.length * 100}%` }, h('i')),
      ...chapters));
    setTimeout(() => cat.say(done === LESSONS.length ? 'Wszystko zaliczone! Możesz wracać do dowolnej lekcji, żeby zdobyć brakujące gwiazdki ⭐' : done ? 'Wybierz lekcję. Świecąca czeka na Ciebie! ✨' : 'Zaczynamy od pierwszej lekcji. Kliknij ją! 🐾', 'happy'), 250);
    return () => cat.destroy();
  }

  function mountStep(root, { index, nav }) {
    const lesson = LESSONS[index];
    if (!lesson) { nav('digits/train'); return () => {}; }

    const ctrl = new AbortController();
    const { signal } = ctrl;
    const cat = createCat({ size: 'sm' });
    const panel = h('div', { class: 'panel', html: lesson.panel || '' });
    const stage = h('div', { class: 'stage' });
    const controls = h('div', { class: 'controls' });
    let recall = null;
    let penalties = 0, hintLevel = 0, replayed = false;

    const dots = h('div', { class: 'step-dots' }, LESSONS.map((_, i) => h('i', { class: i < index ? 'done' : i === index ? 'now' : '' })));
    root.append(h('section', { class: 'screen step' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/digits/train', class: 'back' }, '← Mapa'), h('span', { class: 'crumb-title' }, `Lekcja ${index + 1}/${LESSONS.length}: ${lesson.title}`)),
      dots, cat.el, lesson.panel ? panel : null, stage, controls));

    const button = (label, cls, onclick) => h('button', { class: `btn ${cls}`, type: 'button', onclick }, label);
    const waitClick = (label, cls = 'btn-primary') => new Promise(res => {
      controls.replaceChildren(button(label, cls, () => { controls.replaceChildren(); res(); }));
    });

    async function run() {
      stage.replaceChildren(h('div', { class: 'intro-art' }, h('span', {}, lesson.cards ? '🖼️' : lesson.showShapes ? '🦢' : lesson.group ? '✂️' : '🔢')));
      for (let i = 0; i < lesson.intro.length; i++) {
        if (i === 0) cat.wave();
        await cat.say(lesson.intro[i], i === lesson.intro.length - 1 ? 'think' : 'happy');
        await waitClick(i < lesson.intro.length - 1 ? 'Dalej' : 'Zaczynamy! ▶');
        if (signal.aborted) return;
      }

      for (;;) {
        cat.say(hintLevel || replayed ? 'Patrz uważnie jeszcze raz! 👀' : 'Patrz uważnie! 👀 Pasek pokazuje, ile masz czasu.', 'think');
        controls.replaceChildren();
        await present(stage, { digits: lesson.digits, group: lesson.group, time: lesson.time, cards: lesson.cards, showShapes: lesson.showShapes, signal });
        if (signal.aborted) return;
        await sleep(200, signal);

        let result = await recallPhase();
        if (signal.aborted) return;
        if (result === 'replay') { penalties++; replayed = true; continue; }

        recall.mark(lesson.digits);
        recall.el.classList.add('finished');
        recall.destroy();
        controls.replaceChildren();
        if (result === lesson.digits) {
          const stars = Math.max(1, 3 - penalties);
          store.update('digits.train', t => ({ ...(t || {}), [lesson.id]: Math.max((t && t[lesson.id]) || 0, stars) }), {});
          sfx.good(); buzz([30, 40, 30]);
          const last = index === LESSONS.length - 1;
          confetti(last ? 260 : 90);
          if (last) sfx.win();
          stage.append(starsEl(stars));
          cat.spin();
          await cat.say(last ? 'WSZYSTKIE LEKCJE ZALICZONE! 🏆 Jesteś mistrzem cyfr! Czas na grę swobodną!' : stars === 3 ? rand(PRAISE_PERFECT) : rand(PRAISE_OK), 'cheer');
          controls.replaceChildren(
            last ? button('Do gry swobodnej 🚀', 'btn-primary', () => nav('digits')) : button('Następna lekcja ▶', 'btn-primary', () => nav(`digits/train/${index + 2}`)),
            button('Mapa', 'btn-ghost', () => nav('digits/train')),
            button('Jeszcze raz', 'btn-ghost', () => nav(`digits/train/${index + 1}`)));
          return;
        }
        penalties++;
        sfx.bad(); buzz(120);
        stage.append(compareView(lesson.digits, result, lesson.group));
        cat.say(rand(ENCOURAGE), 'sad');
        await waitClick('Spróbuj jeszcze raz ↻');
        if (signal.aborted) return;
      }
    }

    function recallPhase() {
      return new Promise(resolve => {
        let nudge = null;
        recall = createRecall({ length: lesson.digits.length, group: lesson.group, onSubmit: v => { if (nudge) clearInterval(nudge); resolve(v); } });
        const label = h('div', { class: 'present-label' }, 'Wpisz z pamięci');
        stage.replaceChildren(label, recall.el);
        cat.say('Teraz Twoja kolej! Wpisz cyfry z pamięci. 🧠', 'think');

        const hintBtn = button('💡 Podpowiedź', 'btn-ghost', () => {
          const text = lesson.hints[Math.min(hintLevel, lesson.hints.length - 1)];
          if (hintLevel === 0) penalties++;
          hintLevel++;
          recall.reveal(Math.min(lesson.digits.length, hintLevel * (hintLevel > 1 ? 2 : 1)), lesson.digits);
          cat.say(text, 'think'); cat.hop(); sfx.pop();
          hintBtn.classList.add('used');
        });
        const replayBtn = button('👁 Pokaż jeszcze raz', 'btn-ghost', () => { recall.destroy(); if (nudge) clearInterval(nudge); resolve('replay'); });
        if (replayed) replayBtn.disabled = true;
        controls.replaceChildren(hintBtn, replayBtn);

        let lastTyped = 0, idle = 0;
        nudge = setInterval(() => {
          if (signal.aborted) { if (nudge) clearInterval(nudge); return; }
          if (recall.typed !== lastTyped) { lastTyped = recall.typed; idle = 0; return; }
          if (++idle >= 3) { idle = 0; cat.say(rand(NUDGES), 'think'); cat.hop(); }
        }, 4000);
        signal.addEventListener('abort', () => { if (nudge) clearInterval(nudge); recall.destroy(); }, { once: true });
      });
    }

    run().catch(console.error);
    return () => { ctrl.abort(); cat.destroy(); recall?.destroy(); };
  }

  /* ==========================================================================
     12. FREE PLAY (ENDLESS SURVIVAL)
     ========================================================================== */
  const MILESTONES = {
    3: 'Rozgrzewka za nami! Teraz robi się ciekawie 😼',
    5: 'Pięć cyfr! Większość ludzi odpada właśnie tutaj.',
    7: 'Siedem cyfr – magiczna liczba pamięci! ✨',
    9: 'Dziewięć cyfr = cały numer telefonu! 📱',
    10: 'DZIESIĘĆ! Mruczek jest pod wrażeniem 🙀',
    12: 'Dwanaście cyfr?! Jesteś mistrzem! 🏆',
    15: 'Piętnaście! To poziom zawodów pamięciowych 🤯'
  };
  const CHEERS = [
    'Tak! Kotek mruczy z zachwytu! 😸✨',
    'Mrrr, bezbłędnie w punkt! 🐾',
    'Kocia precyzja! Pamięć jak u rysia! 🐈💨',
    'Pazurki w górę! Fenomenalnie! 😻⭐',
    'Bez pudła! Cyfry wchodzą gładko! 🎯',
    'Miau! Kolejny poziom zdobyty! 🌟🚀',
    'Czysty geniusz! Mruczek bije brawo! 👏😸'
  ];

  function mountFree(root, { modeId, nav }) {
    const mode = getMode(modeId);
    if (!mode) { nav('digits'); return () => {}; }

    const ctrl = new AbortController();
    const { signal } = ctrl;
    const cat = createCat({ size: 'sm' });
    const bestKey = `digits.best.${mode.id}`;
    let best = store.get(bestKey, 0);
    let level = 1, shield = 0, recall = null, startBest = best;

    const levelEl = h('b', {}, '1');
    const shieldEl = h('span', { class: 'hud-shield', title: 'Tarcza chroni przed jedną pomyłką' }, '🛡️');
    const bestEl = h('b', {}, best || '–');
    const hud = h('div', { class: 'hud' },
      h('div', {}, h('small', {}, 'Poziom'), levelEl),
      h('div', { class: 'hud-mid' }, shieldEl),
      h('div', {}, h('small', {}, 'Rekord'), bestEl));
    const stage = h('div', { class: 'stage' });
    const controls = h('div', { class: 'controls' });

    root.append(h('section', { class: 'screen step' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/digits', class: 'back' }, '← Cyfry'), h('span', { class: 'crumb-title' }, `${mode.emoji} ${mode.name}`)),
      hud, cat.el, stage, controls));

    const paintHud = () => {
      levelEl.textContent = level;
      shieldEl.classList.toggle('on', shield > 0);
      shieldEl.hidden = false;
      bestEl.textContent = best || '–';
    };
    const button = (label, cls, onclick) => h('button', { class: `btn ${cls}`, type: 'button', onclick }, label);

    function ask(expected, group) {
      return new Promise(resolve => {
        recall = createRecall({ length: expected.length, group, onSubmit: resolve });
        stage.replaceChildren(
          h('div', { class: 'present-label' }, mode.reverse ? 'Wpisz od KOŃCA 🔄' : 'Wpisz z pamięci'),
          recall.el);
        signal.addEventListener('abort', () => recall.destroy(), { once: true });
      });
    }

    async function play() {
      level = 1; shield = 0; startBest = best; paintHud();
      controls.replaceChildren();
      store.update('digits.plays', n => n + 1, 0);
      await cat.say(mode.reverse ? 'Odwrotnie! Zapamiętaj, a potem wpisz od końca. 🔄' : mode.id === 'flash' ? 'Błysk! Cyfry pojawią się po jednej – nie mrugaj! ⚡' : mode.id === 'melody' ? 'Słuchaj uważnie! Każda cyfra gra swoją nutę 🎵' : mode.id === 'shapes' ? 'Kojarz cyfry z obrazami! Zobacz kształty 🦢⛵' : 'Do pierwszej pomyłki! Powodzenia! 🐾', 'happy');

      while (!signal.aborted) {
        const len = level + 2;
        const cfg = mode.round(level, len);
        const digits = randomDigits(len);
        const expected = mode.reverse ? reverse(digits) : digits;

        stage.replaceChildren(h('div', { class: 'banner' }, h('small', {}, `Poziom ${level}`), h('b', {}, `${len} cyfr`)));
        paintHud();
        if (!(await sleep(850, signal))) return;

        cat.say(MILESTONES[len] && level > 1 ? MILESTONES[len] : '👀', 'think', { speed: 8 });
        await present(stage, { digits, signal, ...cfg });
        if (signal.aborted) return;
        await sleep(180, signal);

        cat.say(mode.reverse ? 'Od końca! 🔄' : 'Teraz Ty! 🧠', 'think', { speed: 8 });
        const answer = await ask(expected, mode.reverse ? 0 : cfg.group);
        if (signal.aborted) return;
        recall.mark(expected);
        recall.el.classList.add('finished');
        recall.destroy();

        if (answer === expected) {
          sfx.good(); buzz(25);
          best = Math.max(best, len); store.set(bestKey, best);
          if (level % 5 === 0 && shield < 1) {
            shield = 1;
            cat.spin();
            confetti(70);
            cat.say('Zdobyłeś 🛡️ tarczę! Mruczek kręci piruet z radości!', 'cheer', { revert: 2200 });
          } else {
            cat.hop();
            cat.say(rand(CHEERS), 'cheer', { revert: 1200 });
          }
          level++;
          if (!(await sleep(1250, signal))) return;
          continue;
        }

        sfx.bad(); buzz(120);
        if (shield > 0) {
          shield = 0; paintHud();
          stage.append(compareView(expected, answer, mode.reverse ? 0 : cfg.group));
          cat.say('Ojej! Ale 🛡️ tarcza Cię uratowała! Próbujemy jeszcze raz ten poziom.', 'sad');
          if (!(await sleep(2800, signal))) return;
          continue;
        }
        return gameOver(expected, answer, cfg.group, len);
      }
    }

    function gameOver(expected, answer, group, len) {
      const reached = Math.max(0, len - 1);
      const record = reached > 0 && reached > startBest;
      if (record) { confetti(200); sfx.win(); }
      const text = reached === 0 ? 'Rozgrzewka się nie udała… ale to tylko trening! 🐾'
        : record ? `NOWY REKORD: ${reached} cyfr! 🏆🎉` : reached >= 9 ? 'Imponujące! Prawie jak mistrz pamięci! 🌟' : 'Dobra próba! Każdy rekord zaczyna się od porażki 💪';
      cat.say(text, record ? 'cheer' : 'sad');
      stage.replaceChildren(
        h('div', { class: 'gameover' },
          h('small', {}, 'Koniec gry'),
          h('div', { class: 'go-score' }, h('b', {}, reached), h('span', {}, reached === 1 ? 'cyfra' : 'cyfr')),
          h('div', { class: 'go-best' }, record ? '🏆 Nowy rekord!' : `Rekord: ${best || 0}`),
          compareView(expected, answer, mode.reverse ? 0 : group)));
      controls.replaceChildren(
        button('Jeszcze raz ↻', 'btn-primary', () => { paintHud(); play(); }),
        h('a', { class: 'btn btn-ghost', href: '#/digits' }, 'Inny tryb'));
    }

    play().catch(console.error);
    return () => { ctrl.abort(); cat.destroy(); recall?.destroy(); };
  }

  /* ==========================================================================
     13. DIGITS GAME ROOT
     ========================================================================== */
  function mountMenu(root, { nav }) {
    const cat = createCat({ size: 'md' });
    const prog = store.get('digits.train', {});
    const done = LESSONS.filter(l => prog[l.id]).length;
    const stars = Object.values(prog).reduce((a, b) => a + b, 0);
    const pct = Math.round(done / LESSONS.length * 100);
    const next = LESSONS.findIndex(l => !prog[l.id]);

    const trainCard = h('a', { class: 'big-card train-card', href: next === -1 ? '#/digits/train' : `#/digits/train/${next + 1}` },
      h('div', { class: 'bc-top' },
        h('div', {},
          h('span', { class: 'bc-kicker' }, '🎓 Szkolenie z kotem'),
          h('h3', {}, done === 0 ? 'Zacznij naukę' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
          h('p', {}, `${LESSONS.length} lekcji · od 1 do 12 cyfr · podpowiedzi Mruczka`)),
        h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))),
      h('div', { class: 'bc-foot' }, h('span', {}, `⭐ ${stars}/${LESSONS.length * 3}`), h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶'))
    );
    const mapLink = h('a', { class: 'link center', href: '#/digits/train' }, 'Zobacz mapę lekcji →');

    const modeCards = MODES.map(m => {
      const best = store.get(`digits.best.${m.id}`, 0);
      return h('a', { class: 'mode-card', href: `#/digits/free/${m.id}`, style: `--c1:${m.color[0]};--c2:${m.color[1]}` },
        h('div', { class: 'mc-emoji' }, m.emoji),
        h('div', { class: 'mc-body' }, h('h3', {}, m.name), h('p', {}, m.desc)),
        h('div', { class: 'mc-best' }, h('b', {}, best || '–'), h('span', {}, best ? 'rekord' : 'brak')));
    });

    const view = h('section', { class: 'screen' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
      h('div', { class: 'game-head' },
        h('div', {}, h('h1', {}, '🔢 ', h('span', { class: 'grad' }, 'Cyfry')), h('p', { class: 'lead' }, 'Naucz się zapamiętywać liczby – krok po kroku.')),
      ),
      cat.el,
      h('h2', { class: 'section-title' }, 'Szkolenie'),
      trainCard, mapLink,
      h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, 'do pierwszej pomyłki')),
      h('div', { class: 'mode-list' }, modeCards)
    );
    root.append(view);

    const greet = done === 0
      ? 'Miau! Jestem Mruczek 🐾 Zacznij od szkolenia – nauczę Cię sztuczek, a potem sprawdź się w grze swobodnej!'
      : done < LESSONS.length
        ? `Wróciłeś! Masz za sobą ${done} z ${LESSONS.length} lekcji. Kontynuujemy? 😸`
        : 'Ukończyłeś szkolenie! 🏆 Czas pobić rekordy w grze swobodnej!';
    setTimeout(() => { cat.wave(); cat.say(greet, 'happy'); }, 300);
    return () => cat.destroy();
  }

  const digitsGame = {
    mount(root, ctx) {
      const [a, b] = ctx.params;
      if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
      if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
      return mountMenu(root, ctx);
    }
  };

  /* ==========================================================================
     13B. PAŁAC PAMIĘCI (MEMORY PALACE MODULE)
     ========================================================================== */
  const PALACE_ROOMS = [
    { id: 'gate', name: 'Złota Brama', emoji: '🚪', desc: 'Wielka kuta brama ze złotymi lwami przy wejściu do pałacu.', color: ['#f6d365', '#fda085'] },
    { id: 'hall', name: 'Marmurowy Hol', emoji: '🏛️', desc: 'Lśniąca posadzka w szachownicę i olbrzymi kryształowy żyrandol.', color: ['#a18cd1', '#fbc2eb'] },
    { id: 'fireplace', name: 'Sala Kominkowa', emoji: '🔥', desc: 'Trzaskające płomienie w wielkim kamiennym kominku i miękki dywan.', color: ['#ff9a9e', '#fecfef'] },
    { id: 'library', name: 'Królewska Biblioteka', emoji: '📚', desc: 'Wysokie dębowe regały z drabinami, pachnące starym pergaminem.', color: ['#4facfe', '#00f2fe'] },
    { id: 'wintergarden', name: 'Ogród Zimowy', emoji: '🌿', desc: 'Szklana kopuła, egzotyczne palmy, kwitnące orchidee i śpiew kanarka.', color: ['#43e97b', '#38f9d7'] },
    { id: 'mirrors', name: 'Gabinet Luster', emoji: '🪞', desc: 'Dziesiątki ozdobnych luster odbijających światło setek świec.', color: ['#fa709a', '#fee140'] },
    { id: 'kitchen', name: 'Zamkowa Kuchnia', emoji: '🍳', desc: 'Wielki piec chlebowy, miedziane patelnie i zapach świeżych wypieków.', color: ['#f6d365', '#fda085'] },
    { id: 'treasury', name: 'Skarbiec', emoji: '💎', desc: 'Ciężkie okute skrzynie ze złotem, rubinami i drogocennymi pucharami.', color: ['#a8edea', '#fed6e3'] },
    { id: 'tower', name: 'Wieża Astronomiczna', emoji: '🔭', desc: 'Potężny mosiężny teleskop i mapa gwiazd na sklepieniu wieży.', color: ['#667eea', '#764ba2'] },
    { id: 'balcony', name: 'Balkon Widokowy', emoji: '🌅', desc: 'Kamienna balustrada z widokiem na góry o zachodzie słońca.', color: ['#ff0844', '#ffb199'] },
    { id: 'armory', name: 'Zbrojownia', emoji: '🛡️', desc: 'Błyszczące zbroje rycerskie, herby rodowe i skrzyżowane miecze.', color: ['#6a11cb', '#2575fc'] },
    { id: 'alchemy', name: 'Pracownia Alchemika', emoji: '🧪', desc: 'Bulgoczące retorty z neonowymi miksturami i kłęby fioletowego dymu.', color: ['#b3ffab', '#12fff7'] },
    { id: 'ballroom', name: 'Sala Balowa', emoji: '🎭', desc: 'Błyszczący parkiet, złocone sztukaterie i lewitujące maski weneckie.', color: ['#f093fb', '#f5576c'] },
    { id: 'grotto', name: 'Kryształowa Grota', emoji: '💧', desc: 'Podziemna jaskinia z turkusowym źródełkiem i świecącymi minerałami.', color: ['#30cfd0', '#330867'] },
    { id: 'pantry', name: 'Spiżarnia Cukiernika', emoji: '🧁', desc: 'Półki pełne słoików z miodem, piramid z makaroników i fontanna kakao.', color: ['#ffecd2', '#fcb69f'] },
    { id: 'roof', name: 'Dach Pałacu', emoji: '🏰', desc: 'Wietrzny szczyt z powiewającymi sztandarami i widokiem na całe królestwo.', color: ['#48c6ef', '#6f86d6'] }
  ];

  const PALACE_ITEMS = [
    { id: 'banana', name: 'Świecący Banan', emoji: '🍌', action: 'wisi i świeci jaskrawym neonowym światłem', hint: 'Coś żółtego i owocowego, co emituje neonowe światło!' },
    { id: 'hat', name: 'Kapelusz Magika', emoji: '🎩', action: 'lewituje i wyskakują z niego kolorowe gołębie', hint: 'Czarne nakrycie głowy iluzjonisty z gołębiami!' },
    { id: 'elephant', name: 'Słoń na Wrotkach', emoji: '🐘', action: 'robi piruety w różowych wrotkach', hint: 'Olbrzymie szare zwierzę w różowych wrotkach!' },
    { id: 'pizza', name: 'Płonąca Pizza', emoji: '🍕', action: 'kręci się w powietrzu jak ogniste frisbee', hint: 'Włoski przysmak kręcący się w płomieniach!' },
    { id: 'guitar', name: 'Gitara Elektryczna', emoji: '🎸', action: 'sama gra głośne rockowe solo', hint: 'Instrument rockowy robiący mnóstwo hałasu!' },
    { id: 'rocket', name: 'Rakieta Kosmiczna', emoji: '🚀', action: 'startuje z hukiem, zostawiając obłok dymu', hint: 'Pojazd kosmiczny buchający białym dymem!' },
    { id: 'crown', name: 'Korona Królewska', emoji: '👑', action: 'lśni złotem i jest wysadzana rubinami', hint: 'Złoty symbol władcy ze świecącymi klejnotami!' },
    { id: 'frog', name: 'Żaba w Okularach', emoji: '🐸', action: 'czyta gazetę i głośno rechocze', hint: 'Zielony płaz w okularach czytający wiadomości!' },
    { id: 'diamond', name: 'Błękitny Diament', emoji: '💎', action: 'strzela promieniami błękitnego lasera', hint: 'Twardy, niebieski kryształ świecący laserem!' },
    { id: 'avocado', name: 'Rapujące Awokado', emoji: '🥑', action: 'trzyma mikrofon i rymuje w rytm hip-hopu', hint: 'Zielony owoc z wielką pestką, który nawija rymy!' },
    { id: 'milk', name: 'Mleczny Gejzer', emoji: '🥛', action: 'bucha strumieniem spienionego mleka aż po sufit', hint: 'Biały napój wytryskujący w górę!' },
    { id: 'baguette', name: 'Ogromna Bagietka', emoji: '🥖', action: 'służy jako szpada i głośno chrupie', hint: 'Długie francuskie pieczywo z chrupiącą skórką!' },
    { id: 'cheese', name: 'Ser na Sprężynach', emoji: '🧀', action: 'skacze po meblach i pachnie serem gouda', hint: 'Żółty przysmak z dziurami skaczący jak piłka!' },
    { id: 'apple', name: 'Złote Jabłko', emoji: '🍎', action: 'podskakuje i śpiewa operowym głosem', hint: 'Owoc znany z mitologii, który ma operowy głos!' },
    { id: 'unicorn', name: 'Jednorożec', emoji: '🦄', action: 'pije herbatkę z porcelanowej filiżanki', hint: 'Magiczny koń z rogiem popijający herbatę!' },
    { id: 'balloon', name: 'Kosmiczny Balon', emoji: '🎈', action: 'pulsuje wszystkimi kolorami tęczy', hint: 'Lekki nadmuchiwany przedmiot prosto z kosmosu!' },
    { id: 'sushi', name: 'Lewitujące Sushi', emoji: '🍣', action: 'pływa w powietrzu jak mała rybka', hint: 'Japońska przekąska z łososiem latająca w powietrzu!' },
    { id: 'bicycle', name: 'Cytrynowy Rower', emoji: '🚲', action: 'jeździ sam na kołach z plastrów cytryny', hint: 'Pojazd dwukołowy z kołami z kwaśnych cytrusów!' },
    { id: 'drum', name: 'Złoty Bębenek', emoji: '🥁', action: 'sam wybija żywiołowy rytm karnawału', hint: 'Instrument perkusyjny grający sambę!' },
    { id: 'flamingo', name: 'Różowy Flaming', emoji: '🦩', action: 'stoi na jednej nodze w wielkich kaloszach', hint: 'Długonogi różowy ptak w żółtych kaloszach!' },
    { id: 'icecream', name: 'Góra Lodowa z Wanilii', emoji: '🍦', action: 'nigdy się nie topi i pachnie wanilią', hint: 'Zimny letni deser wielkości małej góry!' },
    { id: 'duck', name: 'Kaczuszka Wikinga', emoji: '🦆', action: 'nosi rogaty hełm i macha miniaturowym toporkiem', hint: 'Żółta gumowa kaczka gotowa do morskiej wyprawy!' },
    { id: 'cactus', name: 'Tańczący Kaktus', emoji: '🌵', action: 'wije się w tańcu z marakasami w dłoniach', hint: 'Pustynna roślina z kolcami grająca na marakasach!' },
    { id: 'clock', name: 'Tykanie z Kukułką', emoji: '⏰', action: 'budzik dzwoni i wyrzuca małą złotą kukułkę', hint: 'Głośne urządzenie odmierzające czas o poranku!' }
  ];

  function getPalaceRoomById(id) {
    return PALACE_ROOMS.find(r => r.id === id) || PALACE_ROOMS[0];
  }

  function getPalaceItemById(id) {
    return PALACE_ITEMS.find(i => i.id === id) || PALACE_ITEMS[0];
  }

  const PALACE_LESSONS = [
    {
      id: 1, title: 'Pierwsze dwa kroki', kicker: 'Lekcja 1 · Czym jest Pałac Pamięci?',
      desc: 'Odkryj tajemnicę starożytnych oratorów. Twój mózg myśli przestrzenią, a nie suchymi słowami!',
      intro: [
        'Rawrr! Cześć! Jestem Tygrysek Leon 🐯 i zabiorę Cię do Twojego własnego Pałacu Pamięci.',
        'Po co Ci ta technika? Dzięki niej wygłosisz prezentację w szkole lub w pracy bez żadnej ściągawki, zapamiętasz wierszyk, trudne fakty na klasówkę z historii albo całą listę zadań na dany dzień!',
        'Czy wiesz, że Twój mózg pamięta drogę do domu nawet po latach, ale zapomina listę zakupów w 5 minut? Mamy w głowie genialny GPS!',
        'Metoda Loci polega na tym, że zamiast nudnego wkuwania, wchodzimy do wyobrażonego pałacu i zostawiamy w pokojach śmieszne przedmioty.',
        'Zacznijmy powoli od zaledwie 2 komnat: Złotej Bramy i Marmurowego Holu. Zobacz, jakie to proste i przyjemne!'
      ],
      loci: [
        { roomId: 'gate', itemId: 'banana', story: 'Na szczycie Złotej Bramy wisi olbrzymi Świecący Banan 🍌. Jest tak jasny, że oślepia strażników!', hint: 'Spójrz w górę bramy – co tam świeci żółtym blaskiem?' },
        { roomId: 'hall', itemId: 'hat', story: 'Wchodzisz do Holu, a tam na środku lewituje czarny Kapelusz Magika 🎩, z którego bez przerwy wylatują białe gołębie!', hint: 'Co krąży w powietrzu nad marmurową posadzką?' }
      ],
      review: 'Zapamiętałeś: Złota Brama ➡️ Świecący Banan, Marmurowy Hol ➡️ Kapelusz Magika.',
      tigerCongrats: 'Genialnie! Właśnie przeszedłeś przez swoje pierwsze 2 loci w Pałacu Pamięci! 🏆'
    },
    {
      id: 2, title: 'Moc Absurdu i Ruchu', kicker: 'Lekcja 2 · 3 komnaty',
      desc: 'Nasz mózg błyskawicznie zapomina nudne rzeczy, ale uwielbia humor, ruch i komizm.',
      intro: [
        'Wspaniale Ci poszło! Czas na najważniejszą zasadę zapamiętywania: ZASADĘ ABSURDU ⚡',
        'Gdybyś wyobraził sobie zwykły ołówek leżący na stole – zapomnisz go za godzinę. Ale gdy ten ołówek skacze na jednej nodze i krzyczy – zostanie w głowie na zawsze!',
        'Im obraz jest bardziej komiczny, przerysowany i dynamiczny, tym mocniej angażuje neurony.',
        'Odwiedzimy 3 komnaty: Salę Kominkową, Kuchnię i Spiżarnię. Wyobrażaj sobie te sceny bardzo wyraźnie!'
      ],
      loci: [
        { roomId: 'fireplace', itemId: 'elephant', story: 'W Sali Kominkowej na wielkiej kanapie Słoń na Różowych Wrotkach 🐘 kręci piruety i gasi kominek lemoniadą!', hint: 'Kto robił piruety na kanapie przy kominku?' },
        { roomId: 'kitchen', itemId: 'pizza', story: 'W Kuchni z pieca wylatuje Płonąca Pizza 🍕 i wiruje w powietrzu jak ogniste UFO!', hint: 'Jaka gorąca włoska potrawa fruwa po kuchni?' },
        { roomId: 'pantry', itemId: 'guitar', story: 'W Spiżarni na półce z dżemami stoi Gitara Elektryczna 🎸 i sama rzęzi głośne rockowe solo!', hint: 'Jaki instrument hałasuje między słoikami w spiżarni?' }
      ],
      review: 'Kominek ➡️ Słoń na wrotkach, Kuchnia ➡️ Płonąca pizza, Spiżarnia ➡️ Gitara rockowa.',
      tigerCongrats: 'Brawo! Zasada absurdu działa cuda – widzisz te obrazy jak na filmie! 🎬'
    },
    {
      id: 3, title: 'Zawsze Ta Sama Ścieżka', kicker: 'Lekcja 3 · 4 komnaty',
      desc: 'W Pałacu Pamięci kluczowy jest stały kierunek. Zawsze poruszaj się w tę samą stronę!',
      intro: [
        'Rozwijasz skrzydła! Dziś poznasz ZASADĘ ŚCIEŻKI 🧭',
        'Wyobraź sobie, że wchodzisz do pokoju. Zawsze omiataj go wzrokiem w stałym porządku – na przykład zgodnie z ruchem wskazówek zegara: od lewej do prawej.',
        'Dzięki temu nigdy nie pominiesz żadnego przedmiotu ani nie pomylisz ich kolejności.',
        'Przejdźmy trasę przez 4 kolejne komnaty pałacu: Bibliotekę, Ogród Zimowy, Gabinet Luster i Balkon.'
      ],
      loci: [
        { roomId: 'library', itemId: 'rocket', story: 'W Bibliotece między starymi książkami startuje mała Rakieta Kosmiczna 🚀, zostawiając chmurę białego dymu!', hint: 'Co wystrzeliło z hukiem z regału z książkami?' },
        { roomId: 'wintergarden', itemId: 'frog', story: 'W Ogrodzie Zimowym na liściu wielkiej palmy siedzi Żaba w Okularach 🐸 i z powagą czyta poranne wiadomości!', hint: 'Kto czyta gazetę w egzotycznym ogrodzie?' },
        { roomId: 'mirrors', itemId: 'diamond', story: 'W Gabinecie Luster na postumencie leży wielki Błękitny Diament 💎 i strzela laserami we wszystkie lustra naraz!', hint: 'Jaki drogocenny niebieski kamień odbija się w lustrach?' },
        { roomId: 'balcony', itemId: 'balloon', story: 'Wychodzisz na Balkon Widokowy, a nad nim unosi się gigantyczny Tęczowy Balon 🎈 oświetlony zachodem słońca!', hint: 'Co szybuje w powietrzu nad pałacowym balkonem?' }
      ],
      review: 'Biblioteka ➡️ Rakieta, Ogród ➡️ Żaba w okularach, Lustra ➡️ Diament, Balkon ➡️ Balon.',
      tigerCongrats: 'Świetnie zachowana kolejność! Zbudowałeś solidną 4-punktową ścieżkę pamięciową! 🌟'
    },
    {
      id: 4, title: 'Lista Zakupów bez Kartki', kicker: 'Lekcja 4 · 5 komnat w praktyce',
      desc: 'Czas na praktyczny życiowy test! Zapamiętasz 5 produktów ze sklepu bez zapisywania.',
      intro: [
        'Czy zdarzyło Ci się pójść do sklepu, zapomnieć kartki i wrócić bez połowy zakupów? Od dziś to przeszłość! 🛒',
        'Teraz wykorzystamy Pałac Pamięci do czegoś w 100% praktycznego: 5-elementowej listy zakupów.',
        'Nasze produkty to: Awokado, Mleko, Bagietka, Żółty Ser i Soczyste Jabłka.',
        'Umieścimy je w 5 komnatach, wplatając w każdą z nich zabawną akcję. Chodźmy!'
      ],
      loci: [
        { roomId: 'gate', itemId: 'avocado', story: 'Przy Złotej Bramie stoi Rapujące Awokado 🥑 z mikrofonem i wielkim złotym łańcuchem na szyi!', hint: 'Jaki zielony owoc rymuje przy bramie wejściowej?' },
        { roomId: 'hall', itemId: 'milk', story: 'W Marmurowym Holu nagle wybucha fontanna – to Mleczny Gejzer 🥛 chlapiący na kryształowy żyrandol!', hint: 'Jaki biały napój tryska w holu jak gejzer?' },
        { roomId: 'fireplace', itemId: 'baguette', story: 'W Sali Kominkowej zamiast polan drewna w kominku leży ogromna chrupiąca Bagietka 🥖 i pachnie świeżym chlebem!', hint: 'Jakie francuskie pieczywo grzeje się w kominku?' },
        { roomId: 'kitchen', itemId: 'cheese', story: 'W Kuchni wielki kawałek Żółtego Sera 🧀 na sprężynach skacze po miedzianych patelniach!', hint: 'Co żółtego i dziurawego skacze po kuchennym blacie?' },
        { roomId: 'treasury', itemId: 'apple', story: 'W Skarbcu w otwartej skrzyni ze złotem leży Złote Jabłko 🍎 i śpiewa czystym operowym głosem!', hint: 'Jaki owoc śpiewa w skarbcu pełnym kosztowności?' }
      ],
      review: 'Brama ➡️ Awokado, Hol ➡️ Mleko, Kominek ➡️ Bagietka, Kuchnia ➡️ Ser, Skarbiec ➡️ Jabłko.',
      tigerCongrats: 'Zakupy zrobione bez ani jednej notatki! Widzisz, jakie to praktyczne? 🛍️'
    },
    {
      id: 5, title: 'Zaangażuj Wszystkie Zmysły', kicker: 'Lekcja 5 · 6 komnat',
      desc: 'Najpotężniejsza pamięć to ta, która czuje zapach, słyszy dźwięk i dotyka faktury.',
      intro: [
        'Wiesz, dlaczego zapach ciasta u babci przypomina Ci dzieciństwo w ułamku sekundy? Węch i słuch to autostrady do pamięci emocjonalnej! 👃👂',
        'W tej lekcji dodamy do każdego obrazu bodziec zmysłowy: chłód lodu, zapach wanilii, dźwięk dzwonków czy ciężar złota.',
        'Odwiedzimy 6 komnat Pałacu Pamięci. Zamykaj na chwilę oczy i naprawdę POCZUJ każdy przedmiot!'
      ],
      loci: [
        { roomId: 'gate', itemId: 'crown', story: 'Złota Brama zwieńczona jest ciężką Koroną Królewską 👑. Poczuj chłód metalu i dotknij ostrych rubinów!', hint: 'Co ciężkiego, lśniącego i królewskiego spoczywa na bramie?' },
        { roomId: 'hall', itemId: 'bicycle', story: 'Przez Hol pędzi Cytrynowy Rower 🚲 na kołach z cytryn. Poczuj intensywny, kwaskowaty zapach owoców i usłysz terkot łańcucha!', hint: 'Jaki cytrusowy pojazd pachnie świeżą cytryną?' },
        { roomId: 'library', itemId: 'drum', story: 'W Bibliotece Złoty Bębenek 🥁 sam dudni energetycznym rytmem. Poczuj wibracje w podłodze i powietrzu!', hint: 'Jaki instrument wibruje i dudni między książkami?' },
        { roomId: 'wintergarden', itemId: 'flamingo', story: 'W Ogrodzie Zimowym stoi Różowy Flaming 🦩 w wielkich żółtych kaloszach i pluszcze w fontannie!', hint: 'Jaki różowy ptak stoi w wodzie w kaloszach?' },
        { roomId: 'mirrors', itemId: 'icecream', story: 'W Gabinecie Luster stoi Góra Lodowa z Wanilii 🍦. Poczuj lodowaty powiew i słodki aromat wanilii!', hint: 'Jaki olbrzymi, mroźny deser chłodzi salę luster?' },
        { roomId: 'tower', itemId: 'clock', story: 'W Wieży Astronomicznej bije stary zegar z Tykaniem i Kukułką ⏰. Słyszysz głośne: TIK-TAK, TIK-TAK i kukanie ptaszka!', hint: 'Jakie urządzenie głośno tyka i kuka na wieży?' }
      ],
      review: 'Brama ➡️ Korona, Hol ➡️ Rower, Biblioteka ➡️ Bębenek, Ogród ➡️ Flaming, Lustra ➡️ Lody, Wieża ➡️ Zegar.',
      tigerCongrats: 'Prawdziwy multisensoryczny majstersztyk! Twój pałac tętni dźwiękami i zapachami! 🎨'
    },
    {
      id: 6, title: 'Sztuka Przemawiania (7 punktów)', kicker: 'Lekcja 6 · 7 komnat jak Cyceron',
      desc: 'Opanuj metodę rzymskich mówców. Wygłoś 7-punktowe wystąpienie bez ani jednej kartki w dłoni.',
      intro: [
        'W starożytnym Rzymie Cyceron wygłaszał wielogodzinne mowy przed senatem bez żadnych notatek. Jak to robił? 🏛️',
        'Przed przemową spacerował po swoim pałacu, umieszczając kluczowe argumenty w kolejnych pokojach. Gdy mówił, po prostu szedł tą ścieżką w myślach!',
        'Teraz zrobimy to samo dla 7-punktowej mowy. 7 komnat, 7 wyrazistych kotwic.',
        'Skup się i idź spokojnie krok za krokiem. Jestem z Ciebie dumny!'
      ],
      loci: [
        { roomId: 'gate', itemId: 'hat', story: 'Punkt 1 (Wstęp): Przy Złotej Bramie kłania się Kapelusz Magika 🎩 – symbol zaskakującego początku wystąpienia!', hint: 'Co symbolizuje magiczny wstęp przy bramie?' },
        { roomId: 'hall', itemId: 'rocket', story: 'Punkt 2 (Wielka Wizja): W Holu startuje Rakieta 🚀 ku niebu – pokazujesz słuchaczom ambitny cel!', hint: 'Jaki kosmiczny obiekt wyznacza wielki cel w holu?' },
        { roomId: 'fireplace', itemId: 'pizza', story: 'Punkt 3 (Problem/Płomień): W Sali Kominkowej płonie Pizza 🍕 – mówisz o palącym problemie do rozwiązania!', hint: 'Jaka ognista potrawa symbolizuje problem w kominku?' },
        { roomId: 'library', itemId: 'frog', story: 'Punkt 4 (Dane i Fakty): W Bibliotece mądra Żaba w Okularach 🐸 przedstawia twarde dowody z książek!', hint: 'Kto analizuje dane w okularach wśród książek?' },
        { roomId: 'wintergarden', itemId: 'avocado', story: 'Punkt 5 (Zdrowie i Rozwój): W Ogrodzie Rapujące Awokado 🥑 głosi odnowę i dobrą energię!', hint: 'Jaki owoc rapuje o rozwoju w ogrodzie?' },
        { roomId: 'treasury', itemId: 'diamond', story: 'Punkt 6 (Wartość/Zysk): W Skarbcu lśni Diament 💎 – dowód, ile zyskają słuchacze!', hint: 'Co cennego i błyszczącego leży w skarbcu?' },
        { roomId: 'balcony', itemId: 'unicorn', story: 'Punkt 7 (Zakończenie z klasą): Na Balkonie stoi Jednorożec 🦄 z herbatą – spektakularny, niezapomniany finał!', hint: 'Jakie mityczne zwierzę pije herbatę na balkonie na pożegnanie?' }
      ],
      review: '7 punktów przemowy: Kapelusz ➡️ Rakieta ➡️ Pizza ➡️ Żaba ➡️ Awokado ➡️ Diament ➡️ Jednorożec.',
      tigerCongrats: 'Rzymski Senat wstałby do owacji na stojąco! Jesteś gotowy na każdą prezentację! 🎓'
    },
    {
      id: 7, title: 'Wielka Trasa 8 Komnat', kicker: 'Lekcja 7 · 8 komnat',
      desc: 'Wydłużamy ścieżkę do 8 komnat. Płynny spacer, pewność i automatyzm skojarzeń.',
      intro: [
        'Twoja pamięć przestrzenna jest już niesamowicie wytrenowana! 🔥',
        'Teraz sprawdzimy, jak radzisz sobie z dłuższą trasą 8 komnat. Zwróć uwagę, jak naturalnie jedna komnata prowadzi do drugiej.',
        'Gdy wychodzisz z Biblioteki, przed sobą masz Ogród; za Ogrodem wchodzisz do Skarbca... Twój mózg tworzy spójną mapę 3D!',
        'Gotowy na 8 przystanków? Weź głęboki oddech i ruszamy!'
      ],
      loci: [
        { roomId: 'gate', itemId: 'banana', story: 'Złota Brama rozświetlona jest przez wielki Świecący Banan 🍌.', hint: 'Co świeci jasno przy wejściu?' },
        { roomId: 'hall', itemId: 'drum', story: 'W Marmurowym Holu stoi Złoty Bębenek 🥁 i wygrywa wesoły marsz na powitanie.', hint: 'Jaki instrument bębni w holu?' },
        { roomId: 'fireplace', itemId: 'elephant', story: 'W Sali Kominkowej tańczy Słoń na Różowych Wrotkach 🐘.', hint: 'Kto jeździ na wrotkach przy kominku?' },
        { roomId: 'library', itemId: 'guitar', story: 'W Bibliotece rockowa Gitara 🎸 brzęczy na drewnianym pulpicie.', hint: 'Co gra rocka na pulpicie bibliotecznym?' },
        { roomId: 'kitchen', itemId: 'cheese', story: 'W Kuchni sprężynujący Ser Żółty 🧀 odbija się od sufitu.', hint: 'Co sprężynuje w kuchni pod sufitem?' },
        { roomId: 'treasury', itemId: 'crown', story: 'W Skarbcu na aksamitnej poduszce błyszczy rubinowa Korona 👑.', hint: 'Co królewskiego spoczywa na poduszce w skarbcu?' },
        { roomId: 'tower', itemId: 'rocket', story: 'Z Wieży Astronomicznej w stronę gwiazd leci Rakieta 🚀.', hint: 'Co leci w stronę gwiazd z wieży?' },
        { roomId: 'roof', itemId: 'duck', story: 'Na szczycie Dachu stoi dumna Kaczuszka Wikinga 🦆 w rogatym hełmie i patrzy na horyzont!', hint: 'Kto w hełmie wikinga pilnuje dachu pałacu?' }
      ],
      review: 'Brama ➡️ Banan, Hol ➡️ Bębenek, Kominek ➡️ Słoń, Biblioteka ➡️ Gitara, Kuchnia ➡️ Ser, Skarbiec ➡️ Korona, Wieża ➡️ Rakieta, Dach ➡️ Kaczka.',
      tigerCongrats: '8 komnat pokonane bez zadyszki! Twoja mentalna mapa jest krystalicznie czysta! 🗺️'
    },
    {
      id: 8, title: 'Egzamin Mistrzowski (10 Komnat)', kicker: 'Lekcja 8 · Wielki Finał Szkolenia',
      desc: 'Kompletna trasa przez cały Pałac Królewski! 10 komnat, 10 niezwykłych obiektów, tytuł Mistrza Loci.',
      intro: [
        'Oto nadszedł wielki moment – Egzamin Mistrza Pałacu Pamięci! 👑',
        'Przejdziesz kompletną, 10-punktową trasę od Złotej Bramy aż po sam Szczyt Pałacu.',
        'Po ukończeniu tej lekcji będziesz potrafił zapamiętać dowolną listę 10 rzeczy w ułamku chwili – numery, zadania, przemówienia, daty!',
        'Zaufaj swojej wyobraźni. Spaceruj spokojnie. Tygrysek Leon kibicuje z całych sił! 🐯✨'
      ],
      loci: [
        { roomId: 'gate', itemId: 'banana', story: 'Locus 1 (Brama): Świecący neonowy Banan 🍌.', hint: 'Locus 1: Co rozświetla bramę wejściową?' },
        { roomId: 'hall', itemId: 'hat', story: 'Locus 2 (Hol): Lewitujący Kapelusz Magika 🎩 z gołębiami.', hint: 'Locus 2: Co lewituje w marmurowym holu?' },
        { roomId: 'fireplace', itemId: 'elephant', story: 'Locus 3 (Kominek): Słoń na Różowych Wrotkach 🐘 kręci piruety.', hint: 'Locus 3: Kto tańczy przy kominku?' },
        { roomId: 'library', itemId: 'frog', story: 'Locus 4 (Biblioteka): Żaba w Okularach 🐸 czyta encyklopedię.', hint: 'Locus 4: Kto czyta w okularach w bibliotece?' },
        { roomId: 'wintergarden', itemId: 'flamingo', story: 'Locus 5 (Ogród Zimowy): Różowy Flaming 🦩 w kaloszach.', hint: 'Locus 5: Jaki ptak stoi w ogrodzie w kaloszach?' },
        { roomId: 'mirrors', itemId: 'diamond', story: 'Locus 6 (Gabinet Luster): Błękitny Diament 💎 strzelający laserem.', hint: 'Locus 6: Co błyszczy w lustrach?' },
        { roomId: 'kitchen', itemId: 'pizza', story: 'Locus 7 (Kuchnia): Wirująca w ogniu Płonąca Pizza 🍕.', hint: 'Locus 7: Co fruwa w kuchni?' },
        { roomId: 'treasury', itemId: 'crown', story: 'Locus 8 (Skarbiec): Złota Korona 👑 z rubinami.', hint: 'Locus 8: Co leży w skarbcu na poduszce?' },
        { roomId: 'tower', itemId: 'rocket', story: 'Locus 9 (Wieża): Startująca ku gwiazdom Rakieta 🚀.', hint: 'Locus 9: Co leci ku gwiazdom z wieży?' },
        { roomId: 'roof', itemId: 'unicorn', story: 'Locus 10 (Dach): Magiczny Jednorożec 🦄 pijący herbatkę z widokiem na królestwo.', hint: 'Locus 10: Jakie magiczne stworzenie czeka na szczycie dachu?' }
      ],
      review: '10 Loci Mistrza: Banan ➡️ Kapelusz ➡️ Słoń ➡️ Żaba ➡️ Flaming ➡️ Diament ➡️ Pizza ➡️ Korona ➡️ Rakieta ➡️ Jednorożec.',
      tigerCongrats: 'MISTRZ PAŁACU PAMIĘCI! Zdobyłeś najwyższy laur oratorski! Leon ryczy z dumy i zachwytu! 🐯🏆👑'
    }
  ];

  const PALACE_MODES = [
    { id: 'walk', name: 'Wędrówka Odkrywcy', emoji: '🧭', desc: 'Klasyczna wędrówka przez komnaty. Z każdym poziomem trasa wydłuża się o jedno miejsce!', color: ['#ff9233', '#ffc857'], tag: 'Klasyczny Loci' },
    { id: 'speed', name: 'Błyskawiczny Pałac', emoji: '⚡', desc: 'Spacer na czas! Komnaty zmieniają się automatycznie co 3 sekundy. Twórz skojarzenia w ułamku oka!', color: ['#ff5376', '#ff8a5c'], tag: 'Na czas' },
    { id: 'reverse', name: 'Spacer w Tył', emoji: '🔄', desc: 'Prawdziwy test mistrza: zapamiętaj trasę od wejścia, a potem odtwórz ją od końca do początku!', color: ['#a678ff', '#ff6bd6'], tag: 'Odwrotna kolejność' },
    { id: 'quiz', name: 'Strażnik Komnat', emoji: '🎯', desc: 'Losowe wyzwanie! Tygrysek pyta wyrywkowo: „Gdzie ukrył się jednorożec?” lub „Co zostawiłeś w Wieży?”.', color: ['#3ef0c0', '#4aa8ff'], tag: 'Dostęp bezpośredni' },
    { id: 'survival', name: 'Nieskończona Wędrówka', emoji: '🏆', desc: 'Zaczynasz od 3 komnat. Z każdą rundą dochodzi kolejna, aż do pierwszej pomyłki. Jaki jest Twój rekord?', color: ['#ffd166', '#ef476f'], tag: 'Survival' }
  ];

  function getPalaceMode(id) {
    return PALACE_MODES.find(m => m.id === id) || PALACE_MODES[0];
  }

  function mountPalaceMap(root, { nav }) {
    const tiger = createTiger({ size: 'md' });
    const prog = store.get('palace.train', {});
    const totalStars = Object.values(prog).reduce((a, b) => a + b, 0);
    const doneCount = PALACE_LESSONS.filter(l => prog[l.id]).length;

    const cards = PALACE_LESSONS.map((les, idx) => {
      const stars = prog[les.id] || 0;
      const unlocked = idx === 0 || !!prog[PALACE_LESSONS[idx - 1].id];
      const isNext = unlocked && !prog[les.id];

      return h(unlocked ? 'a' : 'div', {
        class: `lesson-card${unlocked ? '' : ' locked'}${isNext ? ' pulse-next' : ''}`,
        href: unlocked ? `#/palace/train/${les.id}` : null,
        'aria-disabled': unlocked ? null : 'true'
      },
        h('div', { class: 'lc-num' }, unlocked ? (stars ? '✓' : idx + 1) : '🔒'),
        h('div', { class: 'lc-body' },
          h('span', { class: 'lc-kicker' }, les.kicker),
          h('h3', {}, les.title),
          h('p', {}, les.desc),
          h('div', { class: 'lc-loci-preview' },
            les.loci.map(loc => {
              const room = getPalaceRoomById(loc.roomId);
              const item = getPalaceItemById(loc.itemId);
              return h('span', { class: 'locus-chip', title: `${room.name}: ${item.name}` }, `${room.emoji} ${item.emoji}`);
            })
          )
        ),
        h('div', { class: 'lc-stars' },
          [0, 1, 2].map(i => h('span', { class: i < stars ? 'on' : 'off' }, '★'))
        )
      );
    });

    const whyCard = h('div', { class: 'why-card' },
      h('span', { class: 'why-icon' }, '🎯'),
      h('div', { class: 'why-content' },
        h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
        h('p', {}, 'Wygłaszanie przemówień i prezentacji bez ani jednej kartki, bezstresowe zdawanie egzaminów i lista 20 zadań w głowie – Twój mózg myśli przestrzenią, a pałac to Twój wewnętrzny segregator wiedzy!')
      )
    );

    const view = h('section', { class: 'screen' },
      h('div', { class: 'crumbs' },
        h('a', { href: '#/palace', class: 'back' }, '← Pałac pamięci')
      ),
      h('div', { class: 'game-head' },
        h('div', {},
          h('h1', {}, '🏰 Mapa szkolenia Loci'),
          h('p', { class: 'lead' }, `Zdobyto ${totalStars} z ${PALACE_LESSONS.length * 3} gwiazdek · Ukończono ${doneCount}/${PALACE_LESSONS.length} lekcji`)
        )
      ),
      tiger.el,
      whyCard,
      h('div', { class: 'lesson-list' }, cards)
    );

    root.append(view);

    const hello = doneCount === 0
      ? 'Rawrr! Witaj na mapie szkolenia! Wybierz lekcję 1, a powoli oprowadzę Cię po pałacu 🐯'
      : doneCount === PALACE_LESSONS.length
        ? 'Jesteś niesamowity! Ukończyłeś wszystkie lekcje z 10 komnatami! Czas pobić rekordy w grze swobodnej! 🏆'
        : `Świetne postępy! Masz już ${doneCount} z ${PALACE_LESSONS.length} lekcji. Wybierz kolejną komnatę! 🏰`;

    setTimeout(() => { tiger.wave(); tiger.say(hello, 'happy'); }, 250);
    return () => tiger.destroy();
  }

  function mountPalaceStep(root, { nav, index }) {
    const lesson = PALACE_LESSONS[index];
    if (!lesson) { nav('palace/train'); return () => {}; }

    const tiger = createTiger({ size: 'md' });
    const prog = store.get('palace.train', {});
    let penalties = 0;
    let hintLevel = 0;
    let currentRoomIdx = 0;
    let recallIdx = 0;
    let cleanedUp = false;

    const head = h('div', { class: 'game-head' },
      h('div', {},
        h('div', { class: 'crumbs' },
          h('a', { href: '#/palace/train', class: 'back' }, '← Mapa szkolenia'),
          h('span', { class: 'badge' }, lesson.kicker)
        ),
        h('h1', {}, lesson.title),
        h('p', { class: 'lead' }, lesson.desc)
      )
    );

    const stage = h('div', { class: 'palace-stage' });
    const controls = h('div', { class: 'controls' });

    const view = h('section', { class: 'screen palace-screen' }, head, tiger.el, stage, controls);
    root.append(view);

    function renderPathTracker(activeIdx, maxIdx, completedIdx = -1) {
      const chips = lesson.loci.map((loc, i) => {
        const room = getPalaceRoomById(loc.roomId);
        const isDone = i < completedIdx;
        const isCur = i === activeIdx;
        return h('div', {
          class: `path-step${isCur ? ' current' : ''}${isDone ? ' done' : ''}`,
          title: `${i + 1}. ${room.name}`
        },
          h('span', { class: 'ps-num' }, isDone ? '✓' : i + 1),
          h('span', { class: 'ps-icon' }, room.emoji)
        );
      });
      return h('div', { class: 'path-tracker' }, chips);
    }

    let introIdx = 0;
    function showIntro() {
      stage.replaceChildren();
      controls.replaceChildren();

      const introBox = h('div', { class: 'intro-box' },
        h('div', { class: 'intro-icon' }, '🏰'),
        h('p', { class: 'intro-text' }, lesson.intro[introIdx]),
        h('div', { class: 'intro-dots' },
          lesson.intro.map((_, i) => h('span', { class: i === introIdx ? 'dot on' : 'dot' }))
        )
      );
      stage.append(introBox);

      const isLast = introIdx >= lesson.intro.length - 1;
      const nextBtn = h('button', { class: 'btn btn-primary', type: 'button' }, isLast ? 'Zaczynamy spacer! ▶' : 'Dalej ▶');
      nextBtn.onclick = () => {
        sfx.pop();
        if (isLast) {
          startPresentation();
        } else {
          introIdx++;
          showIntro();
        }
      };
      controls.append(nextBtn);
      tiger.say(lesson.intro[introIdx], isLast ? 'cheer' : 'happy');
    }

    function startPresentation() {
      currentRoomIdx = 0;
      renderRoomPresentation();
    }

    function renderRoomPresentation() {
      stage.replaceChildren();
      controls.replaceChildren();

      const loc = lesson.loci[currentRoomIdx];
      const room = getPalaceRoomById(loc.roomId);
      const item = getPalaceItemById(loc.itemId);

      const tracker = renderPathTracker(currentRoomIdx, lesson.loci.length);

      const roomCard = h('div', {
        class: 'palace-room-card',
        style: `background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(0,0,0,0.3)), linear-gradient(135deg, ${room.color[0]}22, ${room.color[1]}33); border-color: ${room.color[0]}55`
      },
        h('div', { class: 'room-header' },
          h('span', { class: 'room-badge' }, `Komnata ${currentRoomIdx + 1} z ${lesson.loci.length}`),
          h('h2', { class: 'room-name' }, `${room.emoji} ${room.name}`),
          h('p', { class: 'room-desc' }, room.desc)
        ),
        h('div', { class: 'room-scene' },
          h('div', { class: 'room-locus-visual' },
            h('span', { class: 'item-emoji pulse-item' }, item.emoji),
            h('span', { class: 'item-name' }, item.name)
          ),
          h('div', { class: 'story-bubble' },
            h('span', { class: 'story-quote' }, `„${loc.story}”`),
            h('small', { class: 'story-tip' }, '💡 Zamknij na moment oczy i zobacz ten obraz w swojej głowie!')
          )
        )
      );

      stage.append(tracker, roomCard);

      const prevBtn = h('button', { class: 'btn btn-ghost', type: 'button', disabled: currentRoomIdx === 0 }, '← Poprzednia');
      prevBtn.onclick = () => {
        if (currentRoomIdx > 0) {
          currentRoomIdx--;
          sfx.pop();
          renderRoomPresentation();
        }
      };

      const isLastRoom = currentRoomIdx === lesson.loci.length - 1;
      const nextBtn = h('button', { class: 'btn btn-primary', type: 'button' },
        isLastRoom ? 'Sprawdź pamięć! 🎯' : 'Kolejna komnata →'
      );
      nextBtn.onclick = () => {
        sfx.pop();
        if (isLastRoom) {
          startRecallPhase();
        } else {
          currentRoomIdx++;
          renderRoomPresentation();
        }
      };

      controls.append(prevBtn, nextBtn);
      tiger.say(`Komnata ${currentRoomIdx + 1}: ${room.name}. Zobacz: ${loc.story}`, 'think');
    }

    function startRecallPhase() {
      recallIdx = 0;
      renderRecallStep();
    }

    function renderRecallStep() {
      stage.replaceChildren();
      controls.replaceChildren();

      const loc = lesson.loci[recallIdx];
      const room = getPalaceRoomById(loc.roomId);
      const correctItem = getPalaceItemById(loc.itemId);

      const tracker = renderPathTracker(recallIdx, lesson.loci.length, recallIdx);

      const recallCard = h('div', {
        class: 'palace-recall-card',
        style: `border-color: ${room.color[0]}66`
      },
        h('div', { class: 'recall-prompt' },
          h('span', { class: 'room-badge' }, `Krok ${recallIdx + 1} z ${lesson.loci.length}`),
          h('h2', { class: 'recall-room-title' }, `${room.emoji} ${room.name}`),
          h('p', { class: 'recall-question' }, 'Co umieściłeś w tej komnacie?')
        ),
        h('div', { class: 'recall-target-slot' },
          h('span', { class: 'slot-question' }, '?')
        )
      );

      const distractors = shuffle(PALACE_ITEMS.filter(it => it.id !== correctItem.id)).slice(0, 3);
      const choices = shuffle([correctItem, ...distractors]);

      const choiceGrid = h('div', { class: 'choice-grid' },
        choices.map(choice => {
          const btn = h('button', { class: 'choice-btn', type: 'button' },
            h('span', { class: 'cb-emoji' }, choice.emoji),
            h('span', { class: 'cb-name' }, choice.name)
          );

          btn.onclick = () => {
            if (btn.disabled) return;
            if (choice.id === correctItem.id) {
              btn.classList.add('correct');
              sfx.good();
              tiger.roar();
              tiger.say(`Tak jest! ${correctItem.emoji} ${correctItem.name}! Świetna pamięć!`, 'cheer');

              choiceGrid.querySelectorAll('button').forEach(b => { b.disabled = true; });

              setTimeout(() => {
                if (cleanedUp) return;
                if (recallIdx + 1 < lesson.loci.length) {
                  recallIdx++;
                  renderRecallStep();
                } else {
                  finishLesson();
                }
              }, 800);
            } else {
              btn.classList.add('wrong');
              btn.disabled = true;
              penalties++;
              sfx.bad();
              tiger.setMood('think', 1500);
              tiger.say(`Ups! To nie to. Spokojnie, rozejrzyj się po komnacie ${room.name} jeszcze raz!`, 'think');
            }
          };
          return btn;
        })
      );

      stage.append(tracker, recallCard, choiceGrid);

      const hintBtn = h('button', { class: 'btn btn-ghost', type: 'button' }, '💡 Podpowiedź Leona');
      hintBtn.onclick = () => {
        hintLevel++;
        penalties += 0.5;
        sfx.pop();
        tiger.say(`Podpowiedź: ${loc.hint}`, 'think');
        hintBtn.disabled = true;
      };
      controls.append(hintBtn);

      tiger.say(`Przystanek ${recallIdx + 1}: ${room.name}. Pamiętasz, co tu zostawiliśmy?`, 'happy');
    }

    function finishLesson() {
      stage.replaceChildren();
      controls.replaceChildren();

      const stars = penalties === 0 ? 3 : penalties <= 1.5 ? 2 : 1;
      prog[lesson.id] = Math.max(prog[lesson.id] || 0, stars);
      store.set('palace.train', prog);

      sfx.win();
      confetti();
      tiger.roar();

      const starsRow = h('div', { class: 'stars-finish' },
        [0, 1, 2].map(i => h('span', { class: i < stars ? 'on pop-star' : 'off', style: `--delay: ${i * 0.2}s` }, '★'))
      );

      const summaryCard = h('div', { class: 'palace-finish-card' },
        h('h2', {}, '🎉 Komnaty Opanowane!'),
        starsRow,
        h('p', { class: 'finish-review' }, lesson.review),
        h('p', { class: 'finish-congrats' }, lesson.tigerCongrats)
      );

      stage.append(summaryCard);

      const replayBtn = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Powtórz ↺');
      replayBtn.onclick = () => {
        sfx.pop();
        penalties = 0;
        hintLevel = 0;
        startPresentation();
      };

      const hasNext = index + 1 < PALACE_LESSONS.length;
      const nextBtn = h('button', { class: 'btn btn-primary', type: 'button' },
        hasNext ? 'Następna lekcja ▶' : 'Mapa lekcji 🗺️'
      );
      nextBtn.onclick = () => {
        sfx.pop();
        nav(hasNext ? `palace/train/${index + 2}` : 'palace/train');
      };

      controls.append(replayBtn, nextBtn);
      tiger.say(lesson.tigerCongrats, 'cheer');
    }

    showIntro();

    return () => {
      cleanedUp = true;
      tiger.destroy();
    };
  }

  function mountPalaceFree(root, { nav, modeId }) {
    const mode = getPalaceMode(modeId);
    const tiger = createTiger({ size: 'md' });
    let cleanedUp = false;
    let timerId = null;

    let level = 1;
    let score = 0;
    let best = store.get(`palace.best.${mode.id}`, 0);

    const head = h('div', { class: 'game-head' },
      h('div', {},
        h('div', { class: 'crumbs' },
          h('a', { href: '#/palace', class: 'back' }, '← Pałac pamięci'),
          h('span', { class: 'badge', style: `background: linear-gradient(135deg, ${mode.color[0]}, ${mode.color[1]}); color: #15172e` }, mode.tag)
        ),
        h('h1', {}, `${mode.emoji} ${mode.name}`),
        h('p', { class: 'lead' }, mode.desc)
      )
    );

    const statsBar = h('div', { class: 'free-stats' },
      h('div', { class: 'stat-pill' }, h('span', {}, 'Poziom:'), h('b', { id: 'statLevel' }, '1')),
      h('div', { class: 'stat-pill' }, h('span', {}, 'Rekord:'), h('b', { id: 'statBest' }, String(best)))
    );

    const stage = h('div', { class: 'palace-stage' });
    const controls = h('div', { class: 'controls' });

    const view = h('section', { class: 'screen palace-screen' }, head, statsBar, tiger.el, stage, controls);
    root.append(view);

    function generateLoci(count) {
      const pickedRooms = shuffle([...PALACE_ROOMS]).slice(0, count);
      const pickedItems = shuffle([...PALACE_ITEMS]).slice(0, count);
      return pickedRooms.map((r, i) => ({
        room: r,
        item: pickedItems[i]
      }));
    }

    function startRound() {
      clearTimeout(timerId);
      statsBar.querySelector('#statLevel').textContent = String(level);

      let count = 3;
      if (mode.id === 'walk') count = Math.min(3 + level - 1, 12);
      else if (mode.id === 'speed') count = Math.min(3 + Math.floor(level / 2), 8);
      else if (mode.id === 'reverse') count = Math.min(3 + level - 1, 9);
      else if (mode.id === 'quiz') count = Math.min(3 + level - 1, 8);
      else if (mode.id === 'survival') count = 2 + level;

      const loci = generateLoci(count);
      runPresentation(loci);
    }

    function runPresentation(loci) {
      let curIdx = 0;

      function renderCurrent() {
        if (cleanedUp) return;
        stage.replaceChildren();
        controls.replaceChildren();

        const pair = loci[curIdx];
        const tracker = h('div', { class: 'path-tracker' },
          loci.map((_, i) => h('div', { class: `path-step${i === curIdx ? ' current' : i < curIdx ? ' done' : ''}` },
            h('span', { class: 'ps-num' }, i + 1)
          ))
        );

        const roomCard = h('div', {
          class: 'palace-room-card',
          style: `background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(0,0,0,0.3)), linear-gradient(135deg, ${pair.room.color[0]}22, ${pair.room.color[1]}33); border-color: ${pair.room.color[0]}55`
        },
          h('div', { class: 'room-header' },
            h('span', { class: 'room-badge' }, `Komnata ${curIdx + 1} z ${loci.length}`),
            h('h2', { class: 'room-name' }, `${pair.room.emoji} ${pair.room.name}`)
          ),
          h('div', { class: 'room-scene' },
            h('div', { class: 'room-locus-visual' },
              h('span', { class: 'item-emoji pulse-item' }, pair.item.emoji),
              h('span', { class: 'item-name' }, pair.item.name)
            ),
            h('div', { class: 'story-bubble' },
              h('span', { class: 'story-quote' }, `W komnacie ${pair.room.name} znajduje się ${pair.item.name}! ${pair.item.action}.`),
              h('small', { class: 'story-tip' }, '⚡ Stwórz żywy, dynamiczny obraz w wyobraźni!')
            )
          )
        );

        stage.append(tracker, roomCard);

        if (mode.id === 'speed') {
          const timerBar = h('div', { class: 'speed-timer-bar', style: 'animation: shrink 3.2s linear forwards' });
          stage.append(timerBar);

          timerId = setTimeout(() => {
            if (curIdx + 1 < loci.length) {
              curIdx++;
              renderCurrent();
            } else {
              startRecall(loci);
            }
          }, 3200);

          tiger.say(`Komnata ${curIdx + 1}: ${pair.item.name}! Szybko zapamiętaj!`, 'think');
        } else {
          const isLast = curIdx === loci.length - 1;
          const nextBtn = h('button', { class: 'btn btn-primary', type: 'button' },
            isLast ? 'Sprawdź pamięć! 🎯' : 'Kolejna komnata →'
          );
          nextBtn.onclick = () => {
            sfx.pop();
            if (isLast) {
              startRecall(loci);
            } else {
              curIdx++;
              renderCurrent();
            }
          };

          const prevBtn = h('button', { class: 'btn btn-ghost', type: 'button', disabled: curIdx === 0 }, '← Poprzednia');
          prevBtn.onclick = () => {
            if (curIdx > 0) {
              curIdx--;
              sfx.pop();
              renderCurrent();
            }
          };

          controls.append(prevBtn, nextBtn);
          tiger.say(`Komnata ${curIdx + 1}: ${pair.room.name} ➡️ ${pair.item.name}`, 'happy');
        }
      }

      renderCurrent();
    }

    function startRecall(loci) {
      if (mode.id === 'reverse') {
        const reversedLoci = [...loci].reverse();
        runStepByStepRecall(reversedLoci, true);
      } else if (mode.id === 'quiz') {
        runQuizRecall(loci);
      } else {
        runStepByStepRecall(loci, false);
      }
    }

    function runStepByStepRecall(lociList, isReverse = false) {
      let recallIdx = 0;

      function renderStep() {
        if (cleanedUp) return;
        stage.replaceChildren();
        controls.replaceChildren();

        const pair = lociList[recallIdx];
        const correctItem = pair.item;

        const tracker = h('div', { class: 'path-tracker' },
          lociList.map((_, i) => h('div', { class: `path-step${i === recallIdx ? ' current' : i < recallIdx ? ' done' : ''}` },
            h('span', { class: 'ps-num' }, isReverse ? lociList.length - i : i + 1)
          ))
        );

        const recallCard = h('div', { class: 'palace-recall-card' },
          h('div', { class: 'recall-prompt' },
            h('span', { class: 'room-badge' }, isReverse ? `Krok ${recallIdx + 1} (W TYŁ)` : `Krok ${recallIdx + 1} z ${lociList.length}`),
            h('h2', { class: 'recall-room-title' }, `${pair.room.emoji} ${pair.room.name}`),
            h('p', { class: 'recall-question' }, isReverse ? 'Co znajdowało się w tej komnacie przed wyjściem?' : 'Co umieściłeś w tej komnacie?')
          )
        );

        const distractors = shuffle(PALACE_ITEMS.filter(it => it.id !== correctItem.id)).slice(0, 3);
        const choices = shuffle([correctItem, ...distractors]);

        const choiceGrid = h('div', { class: 'choice-grid' },
          choices.map(choice => {
            const btn = h('button', { class: 'choice-btn', type: 'button' },
              h('span', { class: 'cb-emoji' }, choice.emoji),
              h('span', { class: 'cb-name' }, choice.name)
            );

            btn.onclick = () => {
              if (btn.disabled) return;
              if (choice.id === correctItem.id) {
                btn.classList.add('correct');
                sfx.good();
                tiger.roar();
                choiceGrid.querySelectorAll('button').forEach(b => { b.disabled = true; });

                setTimeout(() => {
                  if (cleanedUp) return;
                  if (recallIdx + 1 < lociList.length) {
                    recallIdx++;
                    renderStep();
                  } else {
                    handleRoundWin();
                  }
                }, 700);
              } else {
                btn.classList.add('wrong');
                sfx.bad();
                handleGameOver(pair, correctItem, choice);
              }
            };
            return btn;
          })
        );

        stage.append(tracker, recallCard, choiceGrid);
        tiger.say(isReverse ? `Cofamy się! Komnata: ${pair.room.name}. Co tam było?` : `Co ukrywa ${pair.room.name}?`, 'think');
      }

      renderStep();
    }

    function runQuizRecall(lociList) {
      let questionIdx = 0;
      const questions = shuffle([...lociList]);

      function renderQuizStep() {
        if (cleanedUp) return;
        stage.replaceChildren();
        controls.replaceChildren();

        const target = questions[questionIdx];
        const askItem = Math.random() > 0.5;

        const promptCard = h('div', { class: 'palace-recall-card' },
          h('div', { class: 'recall-prompt' },
            h('span', { class: 'room-badge' }, `Pytanie ${questionIdx + 1} z ${questions.length}`),
            h('h2', { class: 'recall-room-title' }, askItem ? `${target.room.emoji} ${target.room.name}` : `${target.item.emoji} ${target.item.name}`),
            h('p', { class: 'recall-question' }, askItem ? 'Jaki przedmiot znajdował się w tej komnacie?' : 'W której komnacie znajdował się ten przedmiot?')
          )
        );

        let choiceGrid;
        if (askItem) {
          const distractors = shuffle(PALACE_ITEMS.filter(i => i.id !== target.item.id)).slice(0, 3);
          const choices = shuffle([target.item, ...distractors]);
          choiceGrid = h('div', { class: 'choice-grid' },
            choices.map(c => {
              const btn = h('button', { class: 'choice-btn', type: 'button' },
                h('span', { class: 'cb-emoji' }, c.emoji),
                h('span', { class: 'cb-name' }, c.name)
              );
              btn.onclick = () => {
                if (c.id === target.item.id) {
                  btn.classList.add('correct');
                  sfx.good();
                  nextQuiz();
                } else {
                  btn.classList.add('wrong');
                  sfx.bad();
                  handleGameOver(target, target.item, c);
                }
              };
              return btn;
            })
          );
        } else {
          const distractors = shuffle(PALACE_ROOMS.filter(r => r.id !== target.room.id)).slice(0, 3);
          const choices = shuffle([target.room, ...distractors]);
          choiceGrid = h('div', { class: 'choice-grid' },
            choices.map(c => {
              const btn = h('button', { class: 'choice-btn', type: 'button' },
                h('span', { class: 'cb-emoji' }, c.emoji),
                h('span', { class: 'cb-name' }, c.name)
              );
              btn.onclick = () => {
                if (c.id === target.room.id) {
                  btn.classList.add('correct');
                  sfx.good();
                  nextQuiz();
                } else {
                  btn.classList.add('wrong');
                  sfx.bad();
                  handleGameOver(target, target.room, c);
                }
              };
              return btn;
            })
          );
        }

        function nextQuiz() {
          choiceGrid.querySelectorAll('button').forEach(b => { b.disabled = true; });
          setTimeout(() => {
            if (cleanedUp) return;
            if (questionIdx + 1 < questions.length) {
              questionIdx++;
              renderQuizStep();
            } else {
              handleRoundWin();
            }
          }, 700);
        }

        stage.append(promptCard, choiceGrid);
        tiger.say('Strażnik Komnat pyta! Sprawdźmy Twój bezpośredni dostęp do loci! 🎯', 'think');
      }

      renderQuizStep();
    }

    function handleRoundWin() {
      score = level;
      if (score > best) {
        best = score;
        store.set(`palace.best.${mode.id}`, best);
        statsBar.querySelector('#statBest').textContent = String(best);
      }

      sfx.win();
      confetti(90);
      tiger.roar();
      tiger.hop();

      stage.replaceChildren();
      controls.replaceChildren();

      const makeNext = (cls = 'btn btn-primary btn-lg pulse-next') => {
        const b = h('button', { class: cls, type: 'button' }, `Kolejny poziom ${level + 1} ▶`);
        b.onclick = () => {
          sfx.pop();
          level++;
          startRound();
        };
        return b;
      };

      const makeMenu = (cls = 'btn btn-ghost') => {
        const b = h('button', { class: cls, type: 'button' }, 'Menu pałacu');
        b.onclick = () => {
          sfx.pop();
          nav('palace');
        };
        return b;
      };

      const winCard = h('div', { class: 'palace-finish-card' },
        h('h2', {}, `🎉 Poziom ${level} zaliczony!`),
        h('p', { class: 'finish-congrats' }, `Genialnie! Twój pałac rośnie w siłę! Wynik: ${score} ${score === 1 ? 'komnata' : score < 5 ? 'komnaty' : 'komnat'}.`),
        h('div', { class: 'finish-actions mt-3', style: 'display:flex; gap:12px; flex-wrap:wrap; justify-content:center;' },
          makeNext(),
          makeMenu()
        )
      );
      stage.append(winCard);

      controls.append(
        makeNext('btn btn-primary'),
        makeMenu('btn btn-ghost')
      );

      const TIGER_CHEERS = [
        `Poziom ${level} w kieszeni! Pokaż pazur w kolejnej komnacie! 🐯🔥`,
        `Potężny skok! Komnaty pałacu stoją przed Tobą otworem! 🏰✨`,
        `Rrr! Niezrównana pamięć! Leon skacze z dumy! 🐾🎉`,
        `Genialna wędrówka! Twój pałac pamięci lśni czystym złotem! 🏛️💎`,
        `Mistrzowskie przejście! Loci w głowie poukładane jak w skarbcu! 🗝️⭐`,
        `Rawrr! Ani jednej pomyłki! Następny poziom czeka! 🚀🔥`
      ];
      tiger.say(rand(TIGER_CHEERS), 'cheer');
    }

    function handleGameOver(pair, expected, picked) {
      if (score > best) {
        best = score;
        store.set(`palace.best.${mode.id}`, best);
        statsBar.querySelector('#statBest').textContent = String(best);
      }

      stage.replaceChildren();
      controls.replaceChildren();

      const overCard = h('div', { class: 'gameover' },
        h('small', {}, 'Koniec gry'),
        h('div', { class: 'go-score' }, h('b', {}, String(score)), h('span', {}, 'poziom')),
        h('p', { class: 'go-best' }, `🏆 Rekord: ${best}`),
        h('p', { class: 'muted' }, `W komnacie ${pair.room?.name || 'pałacu'} znajdował się: ${expected.name || expected}, a wybrano: ${picked.name || picked}.`)
      );
      stage.append(overCard);

      const retryBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↺');
      retryBtn.onclick = () => {
        sfx.pop();
        level = 1;
        score = 0;
        startRound();
      };

      const menuBtn = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Menu pałacu');
      menuBtn.onclick = () => {
        sfx.pop();
        nav('palace');
      };

      controls.append(retryBtn, menuBtn);
      tiger.setMood('sad', 2500);
      tiger.say('Nie przejmuj się! Każdy mistrz czasem zgubi ścieżkę. Spróbujmy jeszcze raz! 🐾', 'sad');
    }

    startRound();

    return () => {
      cleanedUp = true;
      clearTimeout(timerId);
      tiger.destroy();
    };
  }

  function mountPalaceMenu(root, { nav }) {
    const tiger = createTiger({ size: 'md' });
    const prog = store.get('palace.train', {});
    const done = PALACE_LESSONS.filter(l => prog[l.id]).length;
    const stars = Object.values(prog).reduce((a, b) => a + b, 0);
    const pct = Math.round(done / PALACE_LESSONS.length * 100);
    const next = PALACE_LESSONS.findIndex(l => !prog[l.id]);

    const trainCard = h('a', {
      class: 'big-card train-card',
      href: next === -1 ? '#/palace/train' : `#/palace/train/${next + 1}`
    },
      h('div', { class: 'bc-top' },
        h('div', {},
          h('span', { class: 'bc-kicker' }, '🐯 Szkolenie z Tygryskiem Leonem'),
          h('h3', {}, done === 0 ? 'Rozpocznij naukę Loci' : done === PALACE_LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
          h('p', {}, `${PALACE_LESSONS.length} lekcji · od 2 do 10 komnat · spokojne wskazówki Leona`)
        ),
        h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${PALACE_LESSONS.length}`))
      ),
      h('div', { class: 'bc-foot' },
        h('span', {}, `⭐ ${stars}/${PALACE_LESSONS.length * 3} gwiazdek`),
        h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
      )
    );

    const mapLink = h('a', { class: 'link center', href: '#/palace/train' }, 'Zobacz mapę komnat i lekcji →');

    const modeCards = PALACE_MODES.map(m => {
      const best = store.get(`palace.best.${m.id}`, 0);
      return h('a', {
        class: 'mode-card',
        href: `#/palace/free/${m.id}`,
        style: `--c1:${m.color[0]};--c2:${m.color[1]}`
      },
        h('div', { class: 'mc-emoji' }, m.emoji),
        h('div', { class: 'mc-body' },
          h('h3', {}, m.name),
          h('p', {}, m.desc)
        ),
        h('div', { class: 'mc-best' },
          h('b', {}, best ? `${best}` : '–'),
          h('span', {}, best ? 'rekord' : 'brak')
        )
      );
    });

    const view = h('section', { class: 'screen' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
      h('div', { class: 'game-head' },
        h('div', {},
          h('h1', {}, '🏰 ', h('span', { class: 'grad' }, 'Pałac pamięci')),
          h('p', { class: 'lead' }, 'Poznaj najstarszą i najpotężniejszą technikę pamięciową świata – metodę Loci.')
        )
      ),
      tiger.el,
      h('h2', { class: 'section-title' }, 'Szkolenie'),
      trainCard,
      mapLink,
      h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '5 unikalnych wariantów')),
      h('div', { class: 'mode-list' }, modeCards)
    );

    root.append(view);

    const greet = done === 0
      ? 'Rawrr! Jestem Leon 🐯 Nauczę Cię metody Loci bez pośpiechu. Zaczynamy od szkolenia!'
      : done < PALACE_LESSONS.length
        ? `Witaj z powrotem w pałacu! Mamy za sobą ${done} z ${PALACE_LESSONS.length} lekcji. Idziemy dalej? 🏰`
        : 'Opanowałeś cały pałac! 🏆 Sprawdź swoje siły w 5 wariantach gry swobodnej!';

    setTimeout(() => { tiger.wave(); tiger.say(greet, 'happy'); }, 300);
    return () => tiger.destroy();
  }

  const palaceGame = {
    mount(root, ctx) {
      const [a, b] = ctx.params;
      if (a === 'train') return b ? mountPalaceStep(root, { ...ctx, index: Number(b) - 1 }) : mountPalaceMap(root, ctx);
      if (a === 'free' && b) return mountPalaceFree(root, { ...ctx, modeId: b });
      return mountPalaceMenu(root, ctx);
    }
  };


  /* ==========================================================================
     NOWE MASKOTKI (LIS, SÓWKA, PAPUGA, SZOP, WIEWIÓRKA, ŻÓŁWIK)
     ========================================================================== */





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
      <circle cx="64" cy="106" r="9" fill="#ff708f" opacity=".6"/>
      <circle cx="136" cy="106" r="9" fill="#ff708f" opacity=".6"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
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

const FOX_POKE = [
  'Hau! Jestem Lisek Bystrzak 🦊 Każda twarz ma w sobie sekret!',
  'Zauważ ten mały pieprzyk albo okulary – to Twój pamięciowy haczyk! 🔍',
  'Mój puszysty ogon kręci się z zachwytu! Gotowy poznać nowych ludzi? 🐾',
  'Nigdy więcej nie powiesz: „Znam tę twarz, ale jak on miał na imię?”. ✨',
  'Twój wzrok jest bystrzejszy niż myślisz! Złapiesz każdą twarz w sekundę! 🎯',
  'Lisi spryt to potężna broń – łącz imię z charakterystyczną cechą! ⚓'
];

function createFox({ size = 'md', pokeLines = FOX_POKE } = {}) {
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

const OWL_POKE = [
  'Huu-huu! Jestem Sówka Profesor 🦉 Zamienię każdą liczbę w słowo!',
  'Litery to klucze do pamięci. Dźwięk rodzi obraz, a obraz zostaje na zawsze! 📜',
  'Mój dziób klaszcze z podziwu! Gotowy na kolejną zagadkę Majora? ✨',
  'Starożytni uczeni nie mieli smartfonów – mieli genialny System Major! 💡',
  'Mądrość to po prostu dobra technika skojarzeń! 🎓',
  'Huu! Pamięć to najpotężniejszy mięsień Twojego umysłu! 🌟'
];

function createOwl({ size = 'md', pokeLines = OWL_POKE } = {}) {
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
      <circle cx="56" cy="106" r="8" fill="#ff5964" opacity=".55"/>
      <circle cx="144" cy="106" r="8" fill="#ff5964" opacity=".55"/>
      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#2b1b17"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
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

const PARROT_POKE = [
  'Kraa! Jestem Papużka Pola 🦜 Znam słówka ze wszystkich zakątków świata!',
  'Most fonetyczny to magia: nietoperz z baseballowym batem i już pamiętasz bat! ⚾',
  'Moje piórka mienią się jak tęcza! Gotowy na kolejną porcję słówek? 🌈',
  'Mów do mnie w dowolnym języku – zamienię go w zabawny obrazek! 🌴',
  'Kra-kra! Twój mózg to najszybszy tłumacz na świecie! ✨',
  'Każde nowe słówko to jak kolorowe piórko w Twojej koronie wiedzy! 👑'
];

function createParrot({ size = 'md', pokeLines = PARROT_POKE } = {}) {
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

const RACCOON_POKE = [
  'Szast-prast! Jestem Szop Magik 🦝 Talia 52 kart nie ma przede mną tajemnic!',
  'System PAO: Osoba, Akcja, Obiekt. Trzy karty to jedna niezapomniana scena! 🃏',
  'Mój pręgowany ogon faluje z ekscytacji! Gotowy na karcianą sztuczkę? ✨',
  'Nie musisz być magikiem – wystarczy, że dasz kartom twarze swoich bohaterów! 🎩',
  'Wybierz kartę, dowolną kartę... a ja powiem Ci, która to była! 🪄',
  'Abrakadabra! Twój mózg tasuje obrazy szybciej niż krupier w Vegas! ♠️'
];

function createRaccoon({ size = 'md', pokeLines = RACCOON_POKE } = {}) {
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

const SQUIRREL_POKE = [
  'Cześć! Jestem Wiewiórka Basia 🐿️ Łączę myśli jak żołędzie w łańcuch!',
  'Im bardziej szalona akcja między dwoma rzeczami, tym trwalej zapamiętasz! 💥',
  'Wyobraź sobie, że parasol wystrzeliwuje w niebo jak rakieta! Widzisz to? 🚀',
  'Jeden element pociąga za sobą kolejny – efekt domina w Twojej pamięci! 🔗',
  'Chrup, chrup! Każde żywe skojarzenie to kolejny orzeszek na zimę! 🌰',
  'Skaczę po gałęziach wyobraźni! Lista 20 zakupów to dla nas pestka! ✨'
];

function createSquirrel({ size = 'md', pokeLines = SQUIRREL_POKE } = {}) {
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

function createSquirrelAvatar(mood = 'happy', size = 56) {
  const wrap = h('div', {
    class: 'squirrel-avatar',
    style: `width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;`,
    html: SQUIRREL_SVG
  });
  const svg = wrap.querySelector('svg');
  svg.dataset.mood = mood;
  return wrap;
}





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
      <circle cx="66" cy="104" r="9" fill="#ff708f" opacity=".6"/>
      <circle cx="134" cy="104" r="9" fill="#ff708f" opacity=".6"/>
      <!-- Mały kapelusik lub czapeczka studencka z cyferblatem -->
      <ellipse cx="100" cy="50" rx="18" ry="4" fill="#d4ac0d"/>
      <path d="M92 49 L94 38 L106 38 L108 49 Z" fill="#b7950b"/>
      <circle cx="100" cy="38" r="3" fill="#f9e79f"/>

      <!-- Oczy w bezpiecznych slotach -->
      <g class="eyes">
        <g class="eye-slot" transform="translate(76 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#145a32"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
        <g class="eye-slot" transform="translate(124 90)"><g class="eye"><ellipse rx="11" ry="14" fill="#145a32"/><g class="pupil"><circle cx="3" cy="-5" r="4.6" fill="#fff"/><circle cx="-3" cy="4" r="2.2" fill="#fff" opacity=".85"/><circle cx="0" cy="1" r="1.3" fill="#fff" opacity=".9"/></g></g></g>
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

const TURTLE_POKE = [
  'Tik-tak! Jestem Żółwik Zegarowy 🐢 Znam dzień tygodnia każdej daty w historii!',
  'Nie spiesz się! Kalendarz to tylko prosty rytm: 4.04, 6.06, 8.08, 10.10, 12.12! ⏱️',
  'Nawet żółw potrafi obliczyć dzień tygodnia w 3 sekundy. Nauczę Cię tego krok po kroku! ⏳',
  'Dzień Sądu (Doomsday) brzmi groźnie, ale to po prostu nasza niezawodna kotwica w czasie! ⚓',
  'Pamięć i czas to najlepsi przyjaciele! Sprawdźmy dowolny rok i dzień! 📅',
  'Spokojnie, precyzyjnie i bez stresu – Twój mózg to najdokładniejszy zegar! 🕰️'
];

function createTurtle({ size = 'md', pokeLines = TURTLE_POKE } = {}) {
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

function createTurtleAvatar(mood = 'happy', size = 56) {
  const wrap = h('div', {
    class: 'turtle-avatar',
    style: `width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;`,
    html: TURTLE_SVG
  });
  const svg = wrap.querySelector('svg');
  svg.dataset.mood = mood;
  return wrap;
}



  /* --- NAMES GAME MODULE --- */
  const namesGame = (function() {
    const FACES = [
  {
    id: 'f1',
    name: 'Marek',
    feature: 'Wielkie okrągłe okulary w złotej oprawce',
    hook: 'Marek ma MARKER i maluje nim wielkie okulary!',
    job: 'Architekt',
    color: '#3498db',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="m-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fed7aa"/><stop offset="100%" stop-color="#fbcfe8"/></linearGradient>
        <linearGradient id="m-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
        <linearGradient id="m-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#451a03"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient>
      </defs>
      <!-- Ramiona / koszula architekta -->
      <path d="M22 96 C22 80 32 76 50 76 C68 76 78 80 78 96 Z" fill="#3b82f6"/>
      <path d="M42 76 L50 86 L58 76 Z" fill="#ffffff"/>
      <path d="M46 76 L50 82 L54 76 Z" fill="#93c5fd"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v14 h-16 z" fill="#fbcfe8"/>
      <circle cx="21" cy="50" r="7" fill="#fed7aa"/>
      <circle cx="79" cy="50" r="7" fill="#fed7aa"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="48" rx="30" ry="32" fill="url(#m-skin)"/>
      <!-- Włosy stylowe -->
      <path d="M20 40 C18 20 32 10 50 10 C68 10 82 20 80 40 C75 24 65 18 50 18 C35 18 25 24 20 40 Z" fill="url(#m-hair)"/>
      <path d="M24 34 C30 22 45 20 54 26 C46 22 32 26 28 36 Z" fill="#78350f" opacity="0.6"/>
      <!-- Oczy i brwi -->
      <path d="M30 38 Q36 34 42 38" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M58 38 Q64 34 70 38" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="37.5" cy="46.5" r="1.2" fill="#ffffff"/>
      <circle cx="64" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="65.5" cy="46.5" r="1.2" fill="#ffffff"/>
      <!-- Nos i uśmiech -->
      <path d="M48 48 Q50 54 53 54" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M40 62 Q50 70 60 62" stroke="#b45309" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <!-- Róż na policzkach -->
      <circle cx="28" cy="56" r="4.5" fill="#f43f5e" opacity="0.25"/>
      <circle cx="72" cy="56" r="4.5" fill="#f43f5e" opacity="0.25"/>
      <!-- SYGNOWANA CECHA: WIELKIE OKRĄGŁE OKULARY W ZŁOTEJ OPRAWCE -->
      <circle cx="36" cy="48" r="14.5" fill="none" stroke="url(#m-gold)" stroke-width="3.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"/>
      <circle cx="64" cy="48" r="14.5" fill="none" stroke="url(#m-gold)" stroke-width="3.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"/>
      <path d="M50.5 48 H50" stroke="url(#m-gold)" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="21.5" y1="46" x2="16" y2="44" stroke="url(#m-gold)" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="78.5" y1="46" x2="84" y2="44" stroke="url(#m-gold)" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Odblask w szkłach okularów -->
      <path d="M26 42 Q32 37 40 40" stroke="#ffffff" stroke-width="1.8" fill="none" opacity="0.75" stroke-linecap="round"/>
      <path d="M54 42 Q60 37 68 40" stroke="#ffffff" stroke-width="1.8" fill="none" opacity="0.75" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'f2',
    name: 'Basia',
    feature: 'Wysoki rudy kok i piegi na policzkach',
    hook: 'Basia gra na BASIE, a jej rudy kok podskakuje w rytm!',
    job: 'Muzyczka',
    color: '#e67e22',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="b-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff1f2"/><stop offset="100%" stop-color="#fecdd3"/></linearGradient>
        <linearGradient id="b-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f97316"/><stop offset="50%" stop-color="#ea580c"/><stop offset="100%" stop-color="#c2410c"/></linearGradient>
      </defs>
      <!-- SYGNOWANA CECHA 1: WYSOKI RUDY KOK -->
      <circle cx="50" cy="14" r="15" fill="url(#b-hair)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.2))"/>
      <circle cx="50" cy="14" r="11" fill="none" stroke="#fdba74" stroke-width="2" opacity="0.6"/>
      <!-- Gumka do koka z perełką -->
      <rect x="42" y="24" width="16" height="5" rx="2.5" fill="#4f46e5"/>
      <circle cx="50" cy="26.5" r="2.5" fill="#facc15"/>
      <!-- Ramiona / dekolt z naszyjnikiem -->
      <path d="M20 96 C20 78 32 74 50 74 C68 74 80 78 80 96 Z" fill="#ec4899"/>
      <path d="M42 74 Q50 82 58 74" stroke="#fbbf24" stroke-width="2" fill="none"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fecdd3"/>
      <circle cx="21" cy="52" r="6.5" fill="#ffe4e6"/>
      <circle cx="79" cy="52" r="6.5" fill="#ffe4e6"/>
      <!-- Kolczyki nutki -->
      <circle cx="21" cy="59" r="2" fill="#fbbf24"/>
      <circle cx="79" cy="59" r="2" fill="#fbbf24"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="50" rx="29" ry="30" fill="url(#b-skin)"/>
      <!-- Grzywka i pasma włosów -->
      <path d="M21 44 C20 30 34 26 50 26 C66 26 80 30 79 44 C72 32 60 30 50 34 C40 30 28 32 21 44 Z" fill="url(#b-hair)"/>
      <!-- Pasemka spadające po bokach -->
      <path d="M20 44 Q17 56 21 64" stroke="url(#b-hair)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M80 44 Q83 56 79 64" stroke="url(#b-hair)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Oczy z rzęsami i brwi -->
      <path d="M31 40 Q37 36 43 40" stroke="#9a3412" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M57 40 Q63 36 69 40" stroke="#9a3412" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="48" r="3.5" fill="#047857"/>
      <circle cx="38" cy="46.5" r="1.3" fill="#ffffff"/>
      <path d="M33 46 L31 44 M41 46 L43 44" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="63" cy="48" r="3.5" fill="#047857"/>
      <circle cx="64" cy="46.5" r="1.3" fill="#ffffff"/>
      <path d="M59 46 L57 44 M67 46 L69 44" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Nosek i radosny uśmiech -->
      <path d="M48 49 Q50 53 52 50" stroke="#ea580c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M41 62 Q50 72 59 62" stroke="#e11d48" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="56" r="5" fill="#fb7185" opacity="0.3"/>
      <circle cx="72" cy="56" r="5" fill="#fb7185" opacity="0.3"/>
      <!-- SYGNOWANA CECHA 2: PIEGI NA POLICZKACH I NOSIE -->
      <circle cx="26" cy="54" r="1.5" fill="#c2410c"/>
      <circle cx="29" cy="58" r="1.6" fill="#9a3412"/>
      <circle cx="33" cy="54" r="1.4" fill="#c2410c"/>
      <circle cx="31" cy="62" r="1.3" fill="#9a3412"/>
      <circle cx="47" cy="54" r="1.2" fill="#c2410c"/>
      <circle cx="53" cy="54" r="1.2" fill="#c2410c"/>
      <circle cx="67" cy="54" r="1.4" fill="#c2410c"/>
      <circle cx="71" cy="58" r="1.6" fill="#9a3412"/>
      <circle cx="74" cy="54" r="1.5" fill="#c2410c"/>
      <circle cx="69" cy="62" r="1.3" fill="#9a3412"/>
    </svg>`
  },
  {
    id: 'f3',
    name: 'Krzysztof',
    feature: 'Bujna, gęsta czarna broda drwala',
    hook: 'KRZACZASTY Krzysztof gubi w brodzie Krzyżacki miecz!',
    job: 'Programista',
    color: '#10b981',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="k-beard" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#27272a"/><stop offset="50%" stop-color="#18181b"/><stop offset="100%" stop-color="#09090b"/></linearGradient>
        <linearGradient id="k-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
      </defs>
      <!-- Koszula w kratę drwala -->
      <path d="M18 96 C18 78 30 74 50 74 C70 74 82 78 82 96 Z" fill="#dc2626"/>
      <line x1="30" y1="76" x2="30" y2="96" stroke="#991b1b" stroke-width="2"/>
      <line x1="70" y1="76" x2="70" y2="96" stroke="#991b1b" stroke-width="2"/>
      <line x1="18" y1="86" x2="82" y2="86" stroke="#991b1b" stroke-width="2"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fed7aa"/>
      <circle cx="20" cy="48" r="7" fill="#fde68a"/>
      <circle cx="80" cy="48" r="7" fill="#fde68a"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="46" rx="30" ry="31" fill="url(#k-skin)"/>
      <!-- Włosy -->
      <path d="M20 38 C20 16 34 12 50 12 C66 12 80 16 80 38 C74 24 62 20 50 20 C38 20 26 24 20 38 Z" fill="url(#k-beard)"/>
      <path d="M22 36 C25 28 35 24 45 23" stroke="#3f3f46" stroke-width="2" fill="none"/>
      <!-- Gęste brwi i oczy programisty -->
      <path d="M28 38 L43 38" stroke="#18181b" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M57 38 L72 38" stroke="#18181b" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="36" cy="45" r="3.6" fill="#18181b"/>
      <circle cx="37.5" cy="43.5" r="1.3" fill="#ffffff"/>
      <circle cx="64" cy="45" r="3.6" fill="#18181b"/>
      <circle cx="65.5" cy="43.5" r="1.3" fill="#ffffff"/>
      <!-- Nos -->
      <path d="M47 44 Q50 51 53 51" stroke="#d97706" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA: BUJNA, GĘSTA CZARNA BRODA DRWALA -->
      <path d="M20 48 C20 85, 32 96, 50 96 C68 96, 80 85, 80 48 C76 52, 70 56, 62 55 C56 54, 52 58, 50 58 C48 58, 44 54, 38 55 C30 56, 24 52, 20 48 Z" fill="url(#k-beard)" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.35))"/>
      <!-- Wąsy drwala -->
      <path d="M32 55 Q50 63 68 55 Q50 52 32 55 Z" fill="#27272a"/>
      <!-- Uśmiech widoczny pod wąsem -->
      <path d="M43 62 Q50 67 57 62" stroke="#fef08a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Pasma faktury brody -->
      <path d="M35 70 Q50 88 50 94" stroke="#3f3f46" stroke-width="1.8" fill="none" opacity="0.6"/>
      <path d="M65 70 Q50 88 50 94" stroke="#3f3f46" stroke-width="1.8" fill="none" opacity="0.6"/>
    </svg>`
  },
  {
    id: 'f4',
    name: 'Kasia',
    feature: 'Lśniące fioletowe włosy i kolczyk w nosie',
    hook: 'Kasia pije KAKAO z fioletowego kubka, a kolczyk brzęczy!',
    job: 'Projektantka UX',
    color: '#8b5cf6',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ka-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c084fc"/><stop offset="40%" stop-color="#9333ea"/><stop offset="100%" stop-color="#581c87"/></linearGradient>
        <linearGradient id="ka-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
      </defs>
      <!-- Ramiona / czarny golf UX designerki -->
      <path d="M22 96 C22 80 32 76 50 76 C68 76 78 80 78 96 Z" fill="#18181b"/>
      <rect x="42" y="70" width="16" height="8" rx="3" fill="#27272a"/>
      <!-- Szyja i uszy -->
      <path d="M42 64 h16 v10 h-16 z" fill="#fed7aa"/>
      <circle cx="22" cy="50" r="6.5" fill="#fde68a"/>
      <circle cx="78" cy="50" r="6.5" fill="#fde68a"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="48" rx="28" ry="30" fill="url(#ka-skin)"/>
      <!-- SYGNOWANA CECHA 1: LŚNIĄCE FIOLETOWE WŁOSY (Asymetryczny styl) -->
      <path d="M16 48 C12 24 30 10 50 10 C70 10 86 22 84 52 C78 28 66 20 50 20 C32 20 18 32 16 48 Z" fill="url(#ka-hair)"/>
      <path d="M16 48 C14 68 24 82 28 86 C24 72 20 58 22 46 Z" fill="url(#ka-hair)"/>
      <path d="M84 48 C86 64 80 74 76 80 C78 68 82 58 80 46 Z" fill="url(#ka-hair)"/>
      <!-- Błyszczące pasmo fioletowe -->
      <path d="M28 22 Q42 16 56 22 Q40 20 30 30 Z" fill="#e9d5ff" opacity="0.8"/>
      <!-- Oczy i staranne brwi -->
      <path d="M31 38 Q37 34 43 38" stroke="#581c87" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M57 38 Q63 34 69 38" stroke="#581c87" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="46" r="3.5" fill="#312e81"/>
      <circle cx="38" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M32 44 L30 42 M42 44 L44 42" stroke="#312e81" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="63" cy="46" r="3.5" fill="#312e81"/>
      <circle cx="64" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M58 44 L56 42 M68 44 L70 42" stroke="#312e81" stroke-width="1.3" stroke-linecap="round"/>
      <!-- Nos -->
      <path d="M48 46 Q50 54 52 53" stroke="#b45309" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: ZŁOTY KOLCZYK W NOSIE (NOSE RING) -->
      <circle cx="55" cy="53" r="3" fill="none" stroke="#f59e0b" stroke-width="2.2" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.3))"/>
      <circle cx="56.5" cy="52" r="0.8" fill="#ffffff"/>
      <!-- Usta z modną szminką -->
      <path d="M41 64 Q50 72 59 64" stroke="#9333ea" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="55" r="4.5" fill="#c084fc" opacity="0.3"/>
      <circle cx="72" cy="55" r="4.5" fill="#c084fc" opacity="0.3"/>
    </svg>`
  },
  {
    id: 'f5',
    name: 'Tomasz',
    feature: 'Szeroki, hollywoodzki uśmiech i elegancka muszka',
    hook: 'Tomasz to mistrz TOMU wierszy – kłania się w muszce i błyszczy zębami!',
    job: 'Prezenter TV',
    color: '#f43f5e',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="t-suit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
        <linearGradient id="t-bow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#991b1b"/></linearGradient>
      </defs>
      <!-- Garnitur prezentera TV -->
      <path d="M18 96 C18 78 30 74 50 74 C70 74 82 78 82 96 Z" fill="url(#t-suit)"/>
      <!-- Biała koszula ze stójką -->
      <path d="M40 74 L50 86 L60 74 Z" fill="#ffffff"/>
      <!-- SYGNOWANA CECHA 1: ELEGANCKA CZERWONA MUSZKA -->
      <path d="M40 84 L48 87 L40 90 Z" fill="url(#t-bow)"/>
      <path d="M60 84 L52 87 L60 90 Z" fill="url(#t-bow)"/>
      <circle cx="50" cy="87" r="3" fill="#b91c1c" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v10 h-16 z" fill="#fed7aa"/>
      <circle cx="21" cy="48" r="6.5" fill="#ffedd5"/>
      <circle cx="79" cy="48" r="6.5" fill="#ffedd5"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="46" rx="29" ry="30" fill="#ffedd5"/>
      <!-- Fryzura prezentera z przedziałkiem -->
      <path d="M21 38 C20 16 35 10 50 10 C66 10 80 16 79 38 C75 22 62 18 48 18 C34 18 25 24 21 38 Z" fill="#78350f"/>
      <path d="M30 22 Q48 16 68 22" stroke="#b45309" stroke-width="2" fill="none" opacity="0.6"/>
      <!-- Brwi i błyszczące oczy -->
      <path d="M31 36 Q37 32 43 36" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M57 36 Q63 32 69 36" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="44" r="3.5" fill="#1e293b"/>
      <circle cx="38.5" cy="42.5" r="1.3" fill="#ffffff"/>
      <circle cx="63" cy="44" r="3.5" fill="#1e293b"/>
      <circle cx="64.5" cy="42.5" r="1.3" fill="#ffffff"/>
      <!-- Nos -->
      <path d="M48 45 Q50 51 53 51" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: SZEROKI, HOLLYWOODZKI UŚMIECH Z ZĘBAMI -->
      <path d="M30 58 Q50 78 70 58 Q50 54 30 58 Z" fill="#1e293b" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
      <path d="M33 58 Q50 63 67 58 C64 68 36 68 33 58 Z" fill="#ffffff"/>
      <line x1="50" y1="58" x2="50" y2="65" stroke="#e2e8f0" stroke-width="1.2"/>
      <!-- Błysk w zębach (Hollywood sparkle) -->
      <path d="M36 59 L38 59 M37 58 L37 60" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'f6',
    name: 'Ola',
    feature: 'Dwa zawadiackie kucyki i zielona opaska na czole',
    hook: 'Ola krzyczy OLE! na meczu i macha kucykami!',
    job: 'Trenerka fitness',
    color: '#06b6d4',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="o-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#b45309"/><stop offset="50%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
      </defs>
      <!-- SYGNOWANA CECHA 1: DWA ZAWADIACKIE KUCYKI (Lewy i Prawy) -->
      <ellipse cx="14" cy="34" rx="11" ry="14" fill="url(#o-hair)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"/>
      <circle cx="21" cy="36" r="4" fill="#ec4899"/>
      <ellipse cx="86" cy="34" rx="11" ry="14" fill="url(#o-hair)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"/>
      <circle cx="79" cy="36" r="4" fill="#ec4899"/>
      <!-- Ramiona / koszulka sportowa fitness -->
      <path d="M22 96 C22 78 32 74 50 74 C68 74 78 78 78 96 Z" fill="#06b6d4"/>
      <path d="M38 74 L50 86 L62 74 Z" fill="#fed7aa"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fed7aa"/>
      <circle cx="22" cy="52" r="6" fill="#fed7aa"/>
      <circle cx="78" cy="52" r="6" fill="#fed7aa"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="50" rx="28" ry="30" fill="#fed7aa"/>
      <!-- Włosy na głowie -->
      <path d="M22 40 C22 20 34 16 50 16 C66 16 78 20 78 40 C74 26 62 22 50 22 C38 22 26 26 22 40 Z" fill="url(#o-hair)"/>
      <!-- SYGNOWANA CECHA 2: ZIELONA OPASKA SPORTOWA NA CZOLE -->
      <rect x="20" y="30" width="60" height="9" rx="4.5" fill="#10b981" stroke="#059669" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
      <line x1="25" y1="34.5" x2="75" y2="34.5" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.8"/>
      <!-- Oczy i wesołe mrugnięcie -->
      <circle cx="36" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="37" cy="46.5" r="1.3" fill="#ffffff"/>
      <!-- Drugie oko mrugające zawadiacko! -->
      <path d="M60 48 Q64 43 68 48" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Brwi -->
      <path d="M30 41 L40 40" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M60 40 L70 41" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Nos i uśmiech sportowca -->
      <path d="M48 49 Q50 53 52 50" stroke="#b45309" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M40 61 Q50 71 60 61" stroke="#dc2626" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="56" r="4.5" fill="#fb7185" opacity="0.35"/>
      <circle cx="72" cy="56" r="4.5" fill="#fb7185" opacity="0.35"/>
    </svg>`
  },
  {
    id: 'f7',
    name: 'Piotr',
    feature: 'Czarne wąsy a la Poirot i elegancki monokl',
    hook: 'Piotr pisze gęsim PIÓREM przez swój złoty monokl!',
    job: 'Detektyw',
    color: '#6366f1',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#eab308"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient>
      </defs>
      <!-- Płaszcz detektywa z klapami -->
      <path d="M18 96 C18 78 30 74 50 74 C70 74 82 78 82 96 Z" fill="#334155"/>
      <path d="M42 74 L50 86 L58 74 Z" fill="#ffffff"/>
      <path d="M47 74 L50 82 L53 74 Z" fill="#475569"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#ffedd5"/>
      <circle cx="21" cy="48" r="6.5" fill="#ffedd5"/>
      <circle cx="79" cy="48" r="6.5" fill="#ffedd5"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="46" rx="29" ry="30" fill="#ffedd5"/>
      <!-- Ulizana fryzura a la Poirot -->
      <path d="M21 38 C20 16 35 12 50 12 C65 12 80 16 79 38 C74 24 62 20 50 20 C38 20 26 24 21 38 Z" fill="#18181b"/>
      <!-- Lewe oko i brew -->
      <path d="M30 36 Q36 32 42 36" stroke="#18181b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="44" r="3.2" fill="#1e293b"/>
      <circle cx="37.2" cy="42.8" r="1.1" fill="#ffffff"/>
      <!-- Prawe oko (pod monoklem) -->
      <path d="M58 35 Q64 30 70 35" stroke="#18181b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="64" cy="44" r="3.5" fill="#1e293b"/>
      <circle cx="65.5" cy="42.5" r="1.3" fill="#ffffff"/>
      <!-- SYGNOWANA CECHA 1: ZŁOTY MONOKL Z ŁAŃCUSZKIEM -->
      <circle cx="64" cy="44" r="12" fill="none" stroke="url(#p-gold)" stroke-width="2.8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <path d="M57 38 Q64 34 71 37" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="0.75" stroke-linecap="round"/>
      <!-- Łańcuszek biegnący od monokla do klapy płaszcza -->
      <path d="M74 48 C80 58 78 72 70 82" stroke="url(#p-gold)" stroke-width="1.8" fill="none" stroke-dasharray="2 1.5"/>
      <!-- Nos detektywa -->
      <path d="M47 43 Q50 51 53 51" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: ZAKRĘCONY WĄS A LA POIROT -->
      <path d="M26 56 C34 50 44 58 50 57 C56 58 66 50 74 56 C78 58 78 63 73 60 C66 56 56 65 50 60 C44 65 34 56 27 60 C22 63 22 58 26 56 Z" fill="#18181b" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <!-- Lekki dyskretny uśmieszek pod wąsem -->
      <path d="M44 66 Q50 70 56 66" stroke="#b45309" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'f8',
    name: 'Ania',
    feature: 'Uroczy pieprzyk nad ustami i srebrne kolczyki koła',
    hook: 'Ania je soczystego ANANASA, a sok skapuje na pieprzyk!',
    job: 'Fotografka',
    color: '#ec4899',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="an-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
        <linearGradient id="an-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#262626"/><stop offset="100%" stop-color="#171717"/></linearGradient>
      </defs>
      <!-- Ramiona / stylowa koszulka fotografki z paskiem aparatu -->
      <path d="M20 96 C20 78 32 74 50 74 C68 74 80 78 80 96 Z" fill="#475569"/>
      <path d="M26 96 L60 74 L66 76 L32 96 Z" fill="#1e293b"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fef08a"/>
      <circle cx="22" cy="50" r="6.5" fill="#fef08a"/>
      <circle cx="78" cy="50" r="6.5" fill="#fef08a"/>
      <!-- SYGNOWANA CECHA 1: SREBRNE KOLCZYKI KOŁA (HOOP EARRINGS) -->
      <circle cx="19" cy="54" r="8" fill="none" stroke="url(#an-silver)" stroke-width="2.6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <circle cx="81" cy="54" r="8" fill="none" stroke="url(#an-silver)" stroke-width="2.6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="48" rx="28" ry="30" fill="#fef08a"/>
      <!-- Fryzura: Stylowy ciemny bob z grzywką -->
      <path d="M18 46 C16 22 30 12 50 12 C70 12 84 22 82 46 C86 64 78 72 74 74 C78 56 80 40 76 34 C68 24 58 24 50 24 C42 24 32 24 24 34 C20 40 22 56 26 74 C22 72 14 64 18 46 Z" fill="url(#an-hair)"/>
      <path d="M26 30 Q50 20 74 30 Q50 26 26 30 Z" fill="#404040"/>
      <!-- Oczy z ładnymi rzęsami i brwi -->
      <path d="M32 38 Q37 34 43 38" stroke="#171717" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M57 38 Q63 34 69 38" stroke="#171717" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="46" r="3.5" fill="#451a03"/>
      <circle cx="38" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M33 44 L31 42 M41 44 L43 42" stroke="#171717" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="63" cy="46" r="3.5" fill="#451a03"/>
      <circle cx="64" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M59 44 L57 42 M67 44 L69 42" stroke="#171717" stroke-width="1.3" stroke-linecap="round"/>
      <!-- Nos -->
      <path d="M48 47 Q50 52 52 50" stroke="#d97706" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <!-- Usta z malinową szminką -->
      <path d="M41 62 Q50 71 59 62" stroke="#e11d48" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: UROCZY PIEPRZYK NAD USTAMI (BEAUTY MARK) -->
      <circle cx="43" cy="57" r="2.2" fill="#171717" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"/>
      <circle cx="28" cy="54" r="4.5" fill="#fb7185" opacity="0.3"/>
      <circle cx="72" cy="54" r="4.5" fill="#fb7185" opacity="0.3"/>
    </svg>`
  }
];


const MODES = [
  {
    id: 'who',
    name: 'Kto to jest?',
    emoji: '👤',
    desc: 'Spójrz na twarz, znajdź kotwicę i wybierz właściwe imię z 4 propozycji.',
    color: ['#38ef7d', '#11998e'],
    badge: 'Klasyczny'
  },
  {
    id: 'find',
    name: 'Znajdź osobę',
    emoji: '🔍',
    desc: 'Lisek wymienia gościa. Znajdź go błyskawicznie w tłumie na podstawie cech!',
    color: ['#4facfe', '#00f2fe'],
    badge: 'Spostrzegawczość'
  },
  {
    id: 'speed',
    name: 'Sprint imion',
    emoji: '⚡',
    desc: '30 sekund na zegarze! Ile twarzy zdołasz bezbłędnie przywitać?',
    color: ['#f093fb', '#f5576c'],
    badge: 'Na czas'
  },
  {
    id: 'cocktail',
    name: 'Koktajl Party',
    emoji: '🍸',
    desc: 'Poznajesz kolejnych gości na bankiecie. Sprawdzian co rundę, aż do pierwszej pomyłki!',
    color: ['#fa709a', '#fee140'],
    badge: 'Nieskończony'
  }
];




const LESSONS = [
  {
    id: 'names-1',
    title: 'Kotwica twarzy',
    subtitle: 'Zauważ to, co unikalne',
    desc: 'Dlaczego zapominamy imiona? Bo mózg traktuje twarz jako całość. Naucz się szukać jednego wyrazistego elementu!',
    faces: [FACES[0], FACES[2]], // Marek (okulary), Krzysztof (broda)
    speech: 'Cześć, tu sprytny Lisek! 🦊 Czy zdarzyło Ci się poznać kogoś w klasie lub na urodzinach i od razu zapomnieć jego imię? Pokażę Ci detektywistyczny trik z kotwicą – zapamiętasz każdego kolegę i koleżankę od pierwszego wejrzenia!',
    theory: [
      'Po co nam ta umiejętność? Ile razy ktoś przedstawił Ci się w nowej klasie, na placu zabaw albo na uroczystości, a Ty po 5 sekundach miałeś pustkę w głowie? To przydarza się każdemu!',
      'Sekret mistrzów pamięci: nasz mózg nie potrafi utrzymać samego dźwięku imienia. Musimy je „przyczepić” do twarzy jak kolorową naklejkę!',
      'KROK 1 – ZNAJDŹ KOTWICĘ DETEKTYWA:',
      'Gdy na kogoś patrzysz, poszukaj jednej charakterystycznej rzeczy: wielkie okulary, bujna broda, zabawna fryzura czy wielki uśmiech.',
      'Spójrz na Marka poniżej: widzisz te wielkie okrągłe złote okulary? To nasza idealna kotwica!'
    ],
    task: {
      type: 'feature-pick',
      prompt: 'Co jest najsilniejszą kotwicą Marka?',
      face: FACES[0],
      options: ['Ogromne okrągłe okulary w złotej oprawce', 'Zielony krawat w kropki', 'Zegarek ze stoperem', 'Czapka z daszkiem'],
      correct: 0,
      hint: 'Spójrz w oczy Marka – złote oprawki dominują jego twarz!'
    }
  },
  {
    id: 'names-2',
    title: 'Most fonetyczny',
    subtitle: 'Zamieniaj abstrakcyjne imiona w obrazy',
    desc: 'Imię to tylko dźwięk. Aby je pamiętać, zamień je w konkretny, dotykalny przedmiot.',
    faces: [FACES[1], FACES[3]], // Basia (kontrabas), Kasia (kakao)
    speech: 'Krok drugi to most fonetyczny! Zamieniamy każde imię w zabawną rzecz, którą można dotknąć!',
    theory: [
      'Imię samo w sobie jest ulotnym dźwiękiem. Trudno „zobaczyć” słowo Basia czy Marek.',
      'Dlatego budujemy MOST FONETYCZNY – szukamy przedmiotu, który brzmi prawie tak samo:',
      '• Basia → wielki KONTRA-BAS 🎻',
      '• Kasia → kubek pachnącego KAKAO ☕',
      '• Marek → gruby jaskrawy MARKER 🖊️',
      'Gdy usłyszysz imię, Twój umysł od razu widzi ten przedmiot przed oczami!'
    ],
    task: {
      type: 'bridge-pick',
      prompt: 'Jaki most fonetyczny najlepiej pasuje do imienia Basia?',
      face: FACES[1],
      options: ['Wielki kontrabas grający jazz', 'Słoik z dżemem', 'Biały żaglowiec na morzu', 'Złota moneta'],
      correct: 0,
      hint: 'Basia brzmi dokładnie jak BAS / Kontrabas!'
    }
  },
  {
    id: 'names-3',
    title: 'Wybuchowe połączenie',
    subtitle: 'Połącz kotwicę twarzy z mostem fonetycznym',
    desc: 'Sekret mistrzów pamięci: spraw, by przedmiot wszedł w żywą interakcję z twarzą!',
    faces: [FACES[0], FACES[1]],
    speech: 'A teraz najfajniejsza część: robimy wybuchowy film w głowie! Zobacz, jak to działa!',
    theory: [
      'Mamy już kotwicę (okulary Marka) i most fonetyczny (MARKER).',
      'Teraz najważniejszy krok: połączmy je w śmieszną, dynamiczną akcję!',
      'Nie wyobrażaj sobie po prostu markera leżącego obok Marka.',
      'Zobacz, jak Marek wyciąga neonowy MARKER i z uśmiechem zamalowuje nim swoje własne OKULARY, aż nic przez nie nie widzi!',
      'Im bardziej szalona i dynamiczna akcja, tym mocniej zostaje w pamięci!'
    ],
    task: {
      type: 'action-pick',
      prompt: 'Basia ma rudy kok i gra na basie. Jakie połączenie najsilniej zadziała w pamięci?',
      face: FACES[1],
      options: [
        'Jej rudy kok podskakuje i uderza w wielki kontrabas wydając potężne basowe dźwięki! 🎶',
        'Basia stoi spokojnie na przystanku autobusowym',
        'Basia czyta książkę o historii muzyki',
        'Basia ma na sobie zwykły płaszcz'
      ],
      correct: 0,
      hint: 'Wybierz najbardziej dynamiczną, żywą i dźwięczną akcję!'
    }
  },
  {
    id: 'names-4',
    title: 'Spotkanie w trójkę',
    subtitle: 'Zastosuj technikę dla 3 osób',
    desc: 'Czas na praktykę! Poznaj Marka, Basię i Krzysztofa, a potem bezbłędnie ich rozpoznaj.',
    faces: [FACES[0], FACES[1], FACES[2]],
    speech: 'Pora na małe przyjęcie! Przedstawię Ci troje znajomych – połączmy ich kotwice w żywe scenki!',
    theory: [
      'Ćwiczymy całą pętlę pamięciową dla 3 gości:',
      '1. Marek → złote okulary → MARKER zamalowuje szkła!',
      '2. Basia → rudy kok → BAS podskakuje w rytm muzyki!',
      '3. Krzysztof → czarna broda drwala → KRZAK albo KRZYŻACY gubią miecz w jego brodzie!'
    ],
    task: {
      type: 'test-multiple',
      prompt: 'Kto ukrył krzyżacki miecz w swojej wielkiej czarnej brodzie?',
      options: ['Krzysztof (czarna broda)', 'Marek (złote okulary)', 'Basia (rudy kok)', 'Tomasz (muszka)'],
      correct: 0,
      hint: 'Przypomnij sobie kotwicę brody i krzaczastego Krzysztofa!'
    }
  },
  {
    id: 'names-5',
    title: 'Rozszerzona galeria (5 osób)',
    subtitle: 'Dodajemy Kasię i Tomasza',
    desc: 'Podnosimy poprzeczkę: 5 osób z różnymi stylami, fryzurami i rekwizytami.',
    faces: [FACES[0], FACES[1], FACES[2], FACES[3], FACES[4]],
    speech: 'Idzie Ci wyśmienicie! Powiększamy grono do 5 osób – Kasia i Tomasz dołączają do zabawy!',
    theory: [
      'Wchodzimy do większego salonu! Poznaj kolejne dwie wspaniałe osoby:',
      '• Kasia (projektantka) → fioletowe włosy & kolczyk w nosie → pije gorące KAKAO, a kolczyk brzęczy!',
      '• Tomasz (prezenter) → lśniący uśmiech & muszka → czyta wielki, opasły TOM encyklopedii!'
    ],
    task: {
      type: 'identify-face',
      target: FACES[3],
      prompt: 'Jak ma na imię ta osoba z fioletowymi włosami i kolczykiem?',
      options: ['Kasia', 'Basia', 'Ola', 'Ania'],
      correct: 0,
      hint: 'Pamiętasz gorące KAKAO i fioletowe włosy?'
    }
  },
  {
    id: 'names-6',
    title: 'Egzamin mistrza przyjęć',
    subtitle: '7 gości na bankiecie',
    desc: 'Ostateczny sprawdzian szkolenia! Przetestuj technikę na pełnej grupie gości z losowymi pytaniami.',
    faces: FACES.slice(0, 7),
    speech: 'Wielki finał u Liska! Znasz już całą technikę mistrzów – żaden bankiet ani nowa klasa Cię nie zaskoczy!',
    theory: [
      'Brawo! Znasz już kompletną metodę zapamiętywania każdego człowieka:',
      '1. Zauważ kotwicę (okulary, broda, monokl, opaska, muszka).',
      '2. Zamień imię na most fonetyczny (Basia=Bas, Marek=Marker, Piotr=Pióro).',
      '3. Zobacz szaloną interakcję kotwicy z mostem w swojej wyobraźni.',
      'Jesteś w 100% gotowy na każdy bankiet, klasę i grę swobodną!'
    ],
    task: {
      type: 'final-exam',
      target: FACES[6], // Piotr z monoklem
      prompt: 'Kto nosi złoty monokl, wąsy i pisze gęsim PIÓREM?',
      options: ['Piotr', 'Tomasz', 'Marek', 'Krzysztof'],
      correct: 0,
      hint: 'PIÓRO to most fonetyczny dla Piotra!'
    }
  }
];








function mountMap(root, { nav }) {
  const fox = createFox({ size: 'md' });
  const prog = store.get('names.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/names/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Pewność siebie w nowej pracy, w szkole i na spotkaniach towarzyskich! Gdy zwrócisz się do nowo poznanej osoby po imieniu już po pierwszej rozmowie, zrobisz oszałamiające wrażenie i od razu zyskasz jej sympatię!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/names', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦊 ', h('span', { class: 'grad' }, 'Szkolenie: Imiona i twarze')),
    h('p', { class: 'lead' }, 'Krok po kroku naucz się zapamiętywać każdą twarz i imię na całe życie.'),
    fox.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    fox.say(
      doneCount === 0
        ? 'Cześć! Jestem Lisek Bystrzak 🦊 Przejdźmy razem 6 kroków do mistrzowskiej pamięci twarzy!'
        : `Świetnie! Masz zaliczone ${doneCount}/${LESSONS.length} lekcji! Kontynuujmy!`,
      'happy'
    );
  }, 200);

  return () => fox.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const fox = createFox({ size: 'md' });
  let answered = false;

  const facesRow = h('div', { class: 'train-faces-row' },
    (les.faces || []).map(f => h('div', { class: 'face-card' },
      h('div', { class: 'fc-avatar', html: f.svg }),
      h('div', { class: 'fc-name' }, f.name),
      h('div', { class: 'fc-job' }, f.job),
      h('div', { class: 'fc-feature' }, '🔍 ', f.feature),
      h('div', { class: 'fc-hook' }, '💡 ', f.hook)
    ))
  );

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🦊 Wskazówka Liska: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '💡 Podpowiedź Liska');
  hintBtn.addEventListener('click', () => {
    fox.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/names/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    fox.el,
    theoryBox,
    facesRow,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      fox.setMood('cheer', 2500);
      fox.say('Brawo! Dokładnie o to chodzi! Znakomita pamięć!', 'cheer');

      const prog = store.get('names.train', {});
      prog[les.id] = 3;
      store.set('names.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/names/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/names';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      fox.setMood('sad', 1800);
      fox.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    fox.say(les.speech || `Lekcja ${index + 1}: ${les.subtitle}! Sprawdź moją sprytną wskazówkę.`, 'happy');
  }, 250);

  return () => fox.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const fox = createFox({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'speed' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const pool = [...FACES];
  let cocktailPool = [FACES[0], FACES[1], FACES[2]];
  let currentTarget = null;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = (modeId === 'who' || modeId === 'find') ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'speed' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/names', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    fox.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Lisi spryt w akcji! Twarz zapamiętana! 🦊✨',
    'Kotwica zadziałała bezbłędnie! ⚓🎯',
    'Oko detektywa! Nikt się przed Tobą nie ukryje! 🔍⭐',
    'Brawo! Twoja pamięć do twarzy imponuje! 🌟',
    'Hau! Celne trafienie prosto w dziesiątkę! 🎯🦊',
    'Genialnie! Kojarzenie na poziomie mistrza! 🧠💡',
    'Lisek skacze z radości! Jesteś nie do zatrzymania! 🐾🎉'
  ];
  function cheerFox(c) {
    if (c % 5 === 0 && c > 0) {
      fox.say(`Niewiarygodne combo x${c}! Jesteś legendą bankietu! 🦊🏆✨`, 'cheer', { revert: 1800 });
      fox.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      fox.say(`Combo x${c}! Twoje oko wyłapie każdy detal! 🦊✨`, 'cheer', { revert: 1400 });
      fox.hop?.();
    } else {
      fox.hop?.();
      fox.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`names.best.${modeId}`, 0);
    if (score > prev) {
      store.set(`names.best.${modeId}`, score);
    }
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    cocktailPool = [FACES[0], FACES[1], FACES[2]];
    timeLeft = modeId === 'speed' ? 30 : 0;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timerInterval) clearInterval(timerInterval);
    if (modeId === 'speed') startTimer();
    fox.setMood('happy');
    fox.say('Zaczynamy od nowa! Pokaż lisi spryt! 🦊✨', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    fox.setMood('cheer', 3000);
    fox.say(`Koniec gry! Twój wynik: ${score} pkt! Wspaniała spostrzegawczość! 🦊`, 'cheer');

    const best = store.get(`names.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/names' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Świetna gra!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Twój rekord: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'who') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const others = pool.filter(f => f.id !== currentTarget.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([currentTarget, ...wrong]);

      // W pierwszych 3 rundach dajemy podpowiedź cechy, potem gracz musi rozpoznać sam!
      const clueText = round <= 3
        ? `Podpowiedź cechy: ${currentTarget.feature}`
        : 'Rozpoznaj twarz z własnej pamięci!';

      const card = h('div', { class: 'who-target-card' },
        h('div', { class: 'who-avatar', html: currentTarget.svg }),
        h('div', { class: 'who-clue' }, clueText)
      );

      const opts = h('div', { class: 'who-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt-face', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === currentTarget.id) {
            sfx.success();
            score += 10 + combo * 2;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerFox(combo);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            lives--;
            updateLives();
            btn.classList.add('wrong');
            if (lives <= 0) {
              gameOver();
            } else {
              fox.setMood('sad', 1200);
              fox.say(`To ${currentTarget.name}! Kotwica: ${currentTarget.feature} ⚓ Masz jeszcze ${lives} szanse. 🦊`, 'think', { revert: 2600 });
              setTimeout(nextRound, 1200);
            }
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);
    } else if (modeId === 'find') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const count = Math.min(pool.length, round <= 2 ? 4 : round <= 5 ? 6 : 8);
      const others = pool.filter(f => f.id !== currentTarget.id);
      const displayed = shuffle([currentTarget, ...shuffle(others).slice(0, count - 1)]);

      const question = h('div', { class: 'find-question' },
        h('h3', {}, `Znajdź: `, h('span', { class: 'grad' }, currentTarget.name)),
        h('p', {}, `Zawód: ${currentTarget.job}`)
      );

      const grid = h('div', { class: 'faces-selection-grid' });
      displayed.forEach(f => {
        const btn = h('button', { class: 'face-tile-btn', type: 'button', html: f.svg });
        btn.addEventListener('click', () => {
          if (f.id === currentTarget.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerFox(combo);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            lives--;
            updateLives();
            btn.classList.add('wrong');
            if (lives <= 0) {
              gameOver();
            } else {
              fox.setMood('sad', 1000);
              fox.say(`To nie ta osoba! Przypomnij sobie jej cechę 🔍 Pozostało szans: ${lives}`, 'think', { revert: 2200 });
            }
          }
        });
        grid.append(btn);
      });

      playArea.append(question, grid);
    } else if (modeId === 'speed') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const others = pool.filter(f => f.id !== currentTarget.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([currentTarget, ...wrong]);

      const card = h('div', { class: 'who-target-card' },
        h('div', { class: 'who-avatar', html: currentTarget.svg })
      );

      const opts = h('div', { class: 'who-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt-face', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === currentTarget.id) {
            sfx.pop();
            score += 10;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            nextRound();
          } else {
            sfx.wrong();
            btn.classList.add('wrong');
            setTimeout(nextRound, 300);
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);
    } else if (modeId === 'cocktail') {
      // Cocktail party endless mode
      if (round > cocktailPool.length && cocktailPool.length < pool.length) {
        cocktailPool.push(pool[cocktailPool.length]);
      }
      currentTarget = cocktailPool[rand(0, cocktailPool.length - 1)];
      const choices = shuffle(cocktailPool);

      const card = h('div', { class: 'who-target-card' },
        h('div', { class: 'who-avatar', html: currentTarget.svg }),
        h('div', { class: 'who-clue' }, `Gość na bankiecie (${cocktailPool.length} osób w sali)`)
      );

      const opts = h('div', { class: 'who-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt-face', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === currentTarget.id) {
            sfx.success();
            score += 20 + cocktailPool.length * 5;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${cocktailPool.length}`;
            fox.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            gameOver();
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);
    }
  }

  if (modeId === 'speed') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    fox.destroy();
  };
}










function mountMenu(root, { nav }) {
  const fox = createFox({ size: 'md' });
  const prog = store.get('names.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/names/train' : `#/names/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦊 Szkolenie z Liskiem Bystrzakiem'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę twarzy' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} interaktywnych lekcji · kotwice cech · mosty fonetyczne`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/names/train' }, 'Zobacz mapę lekcji →');

  const modeCards = MODES.map(m => {
    const best = store.get(`names.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/names/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🦊 ', h('span', { class: 'grad' }, 'Imiona i twarze')),
        h('p', { class: 'lead' }, 'Nigdy więcej „znam tę twarz, ale jak on miał na imię?”. Opanuj technikę kotwic i mostów fonetycznych.')
      )
    ),
    fox.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Hau! Jestem Lisek Bystrzak 🦊 Każda twarz ma w sobie sekret. Nauczę Cię go czytać!'
    : done < LESSONS.length
      ? `Mamy opanowane ${done} z ${LESSONS.length} lekcji. Dokończmy szkolenie! 🦊`
      : 'Twoja pamięć twarzy jest bystra jak lis! Wybierz tryb gry swobodnej! 🏆';

  setTimeout(() => { fox.say(greet, 'happy'); }, 300);
  return () => fox.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- MAJOR GAME MODULE --- */
  const majorGame = (function() {
    const PHONETIC_MAP = [
  { digit: 0, sounds: 'S, Z', rule: 'Zero zaczyna się na Z, syczący dźwięk', pegs: ['SOS', 'Ser', 'Ząb', 'Waza'] },
  { digit: 1, sounds: 'T, D', rule: 'Litera T i D mają jedną pionową kreskę (jak 1)', pegs: ['Troll', 'Dom', 'Dach', 'Kot'] },
  { digit: 2, sounds: 'N', rule: 'Małe „n” ma dwie nóżki', pegs: ['Nóż', 'Nos', 'Noc', 'Koń'] },
  { digit: 3, sounds: 'M', rule: 'Małe „m” ma trzy nóżki', pegs: ['Mysz', 'Miecz', 'Mama', 'Młot'] },
  { digit: 4, sounds: 'R', rule: 'Słowo czteRy ma dominujące R', pegs: ['Rura', 'Rak', 'Rower', 'Ryba'] },
  { digit: 5, sounds: 'L', rule: 'Rzymskie L to 50; dłoń z 5 palcami tworzy kąt L', pegs: ['Liść', 'Lama', 'Las', 'Lupa'] },
  { digit: 6, sounds: 'J, SZ, CZ', rule: 'Szóstka brzmi jak „sz”, jota jest 6. spółgłoską', pegs: ['Jajko', 'Jeż', 'Szal', 'Czajnik'] },
  { digit: 7, sounds: 'K, G', rule: 'Dwie cyfry 7 połączone brzuszkami tworzą literę K', pegs: ['Koc', 'Kura', 'Kot', 'Gitara'] },
  { digit: 8, sounds: 'F, W', rule: 'Pisana mała litera f ma dwie pętelki jak ósemka', pegs: ['Fala', 'Wino', 'Waga', 'Foka'] },
  { digit: 9, sounds: 'P, B', rule: 'Lustrzane odbicie 9 to P, odwrócona 9 to b', pegs: ['Pies', 'But', 'Balon', 'Bomba'] }
];

const PEG_WORDS_2DIGIT = [
  { num: '10', word: 'TOS', code: 'T(1) + S(0)', img: 'Toster', hint: 'T(1) + S(0)' },
  { num: '14', word: 'TOR', code: 'T(1) + R(4)', img: 'Tor kolejowy', hint: 'T(1) + R(4)' },
  { num: '20', word: 'NOS', code: 'N(2) + S(0)', img: 'Nos klauna', hint: 'N(2) + S(0)' },
  { num: '25', word: 'NIL', code: 'N(2) + L(5)', img: 'Rzeka Nil', hint: 'N(2) + L(5)' },
  { num: '31', word: 'Młot', code: 'M(3) + T(1)', img: 'Ciężki młot', hint: 'M(3) + T(1)' },
  { num: '40', word: 'Róża', code: 'R(4) + Z(0)', img: 'Czerwona róża', hint: 'R(4) + Z(0)' },
  { num: '47', word: 'RAK', code: 'R(4) + K(7)', img: 'Szczypiący rak', hint: 'R(4) + K(7)' },
  { num: '52', word: 'LIN', code: 'L(5) + N(2)', img: 'Gruba lina', hint: 'L(5) + N(2)' },
  { num: '71', word: 'KOT', code: 'K(7) + T(1)', img: 'Czarny kot', hint: 'K(7) + T(1)' },
  { num: '85', word: 'FALA', code: 'F(8) + L(5)', img: 'Morska fala', hint: 'F(8) + L(5)' },
  { num: '91', word: 'BUT', code: 'B(9) + T(1)', img: 'Skórzany but', hint: 'B(9) + T(1)' },
  { num: '94', word: 'BAR', code: 'B(9) + R(4)', img: 'Neonowy bar', hint: 'B(9) + R(4)' }
];


const MODES = [
  {
    id: 'peg',
    name: 'Kołki 0-9',
    emoji: '🦉',
    desc: 'Opanuj alfabet fonetyczny do perfekcji: błyskawicznie łącz cyfry 0-9 z ich dźwiękami.',
    color: ['#ff758c', '#ff7eb3'],
    badge: 'Podstawy'
  },
  {
    id: 'decode',
    name: 'Dekoder słów',
    emoji: '🔍',
    desc: 'Widzisz słowo (np. KOT, BALON, NOS). Jakie cyfry kryją się w jego spółgłoskach?',
    color: ['#a18cd1', '#fbc2eb'],
    badge: 'Odszyfruj'
  },
  {
    id: 'encode',
    name: 'Szybki szyfrant',
    emoji: '⚡',
    desc: 'Widzisz liczbę (np. 14, 52, 91). Wybierz słowo, które poprawnie koduje te cyfry!',
    color: ['#fad0c4', '#ffd1ff'],
    badge: 'Kodowanie'
  },
  {
    id: 'pin',
    name: 'Trening PIN',
    emoji: '💳',
    desc: 'Prawdziwe wyzwanie! Zapamiętuj 4-cyfrowe kody PIN zamieniając je w 2 żywe obrazy.',
    color: ['#43e97b', '#38f9d7'],
    badge: 'Praktyka'
  }
];




const LESSONS = [
  {
    id: 'major-1',
    title: 'Cyfry 0 i 1 (S/Z oraz T/D)',
    subtitle: 'Pierwsze litery alfabetu pamięci',
    desc: 'Poznaj sekret, dzięki któremu mistrzowie świata zapamiętują tysiące cyfr.',
    speech: 'Uhuhu! Cześć! Jestem Sówka 🦉 Zastanawiasz się, po co uczyć się tej techniki? Pokażę Ci sekretny kod, dzięki któremu łatwo zapamiętasz numer PIN, PESEL czy ważne daty w szkole – bez nudnego wkuwania!',
    theory: [
      'Po co nam ta technika? Nasz mózg gubi się w suchych, nudnych cyfrach, ale uwielbia słowa i kolorowe obrazy!',
      'System Major zamienia cyfry na dźwięki spółgłosek. Dzięki temu z dowolnego numeru ułożysz śmieszne słowo, które od razu zapamiętasz!',
      'Poznajmy dwie pierwsze cyfry kodu:',
      '• 0 = S oraz Z – słowo „Zero” zaczyna się na literę Z, a zero syczy cichutko jak wąż: sss!',
      '• 1 = T oraz D – spójrz na literę T oraz D: obie mają JEDNĄ prostą pionową kreskę, dokładnie jak cyfra 1!',
      'To bardzo proste! Zobacz: słowo „KOT” ma T na końcu (1), a słowo „SOS” ma S (0).'
    ],
    task: {
      prompt: 'Która spółgłoska odpowiada cyfrze 1 w systemie Major?',
      options: ['T oraz D (jedna pionowa kreska)', 'M (trzy nóżki)', 'R (cztery)', 'F oraz W'],
      correct: 0,
      hint: 'Pomyśl o jednej pionowej kresce w literach T i D!'
    }
  },
  {
    id: 'major-2',
    title: 'Cyfry 2 i 3 (N oraz M)',
    subtitle: 'Nóżki liter',
    desc: 'Spójrz na litery N i M – ich kształt mówi sam za siebie!',
    speech: 'Świetnie Ci poszło! Zobacz, cyfry 2 i 3 mają swoje ukryte nóżki – dzieci i dorośli zapamiętują je w sekundę!',
    theory: [
      'Kolejne dwie cyfry to najprostsza zabawa w skojarzenia kształtów:',
      '• 2 = N – małe „n” ma DWA brzuszki / dwie nóżki stojące na ziemi.',
      '• 3 = M – małe „m” ma TRZY nóżki (raz, dwa, trzy!).',
      'To najprostsza zasada wizualna w całym systemie!',
      'Gdy w numerze telefonu lub dacie widzisz 2 → myślisz o N (np. Nos, Nóż).',
      'Gdy widzisz 3 → myślisz o M (np. Mysz, Młot).'
    ],
    task: {
      prompt: 'Dlaczego cyfrze 3 przypisana jest litera M?',
      options: ['Ponieważ litera „m” ma 3 nóżki', 'Bo 3 to magiczna liczba', 'Bo M to pierwsza litera słowa Major', 'Przez przypadek'],
      correct: 0,
      hint: 'Policz nóżki w literze m: raz, dwa, trzy!'
    }
  },
  {
    id: 'major-3',
    title: 'Cyfry 4 i 5 (R oraz L)',
    subtitle: 'CzteRy oraz rzymskie L',
    desc: 'Jak zapamiętać 4 i 5 bez wysiłku?',
    speech: 'Uhuhu! Pora na cyfry 4 i 5. Wsłuchaj się w dźwięki i spójrz na dłoń!',
    theory: [
      'Dlaczego 4 to R, a 5 to L? To sprytne skojarzenia:',
      '• 4 = R – powiedz głośno słowo „czteRy” – słyszysz to mocne, dźwięczne R na końcu?',
      '• 5 = L – spójrz na dłoń: kciuk i palec wskazujący tworzą kształt litery L, a cała dłoń ma 5 palców! (Rzymskie L to też 50).',
      'Przykłady ze świata: 4 to Rura lub Ryba, a 5 to Liść lub Lama.'
    ],
    task: {
      prompt: 'Jaki dźwięk odpowiada cyfrze 4?',
      options: ['R (z dominującego R w słowie „czteRy”)', 'K i G', 'S i Z', 'P i B'],
      correct: 0,
      hint: 'Wsłuchaj się w słowo „czteRy”!'
    }
  },
  {
    id: 'major-4',
    title: 'Cyfry 6 i 7 (J/SZ/CZ oraz K/G)',
    subtitle: 'Szóstka i kanciaste K',
    desc: 'Połowa alfabetu za nami! Poznaj szeleszczące dźwięki i siódemkę.',
    speech: 'Jesteśmy już w połowie drogi! Szeleszcząca szóstka i kanciaste K czekają na Ciebie!',
    theory: [
      'Poznajemy szóstkę i siódemkę:',
      '• 6 = J, SZ, CZ – powiedz „Sześć” – to najbardziej szeleszcząca cyfra w języku polskim! (A litera J to 6. spółgłoska alfabetu).',
      '• 7 = K, G – wyobraź sobie dwie cyfry 7 przytknięte do siebie plecami – tworzą ostre ramiona litery K!',
      'Z tych literek powstaną fantastyczne słowa: 6 to Jeż lub Szal, a 7 to Koc, Kot lub Kura.'
    ],
    task: {
      prompt: 'Która para spółgłosek odpowiada cyfrze 7?',
      options: ['K oraz G', 'F oraz W', 'T oraz D', 'N oraz M'],
      correct: 0,
      hint: 'Dwie siódemki tworzą literę K!'
    }
  },
  {
    id: 'major-5',
    title: 'Cyfry 8 i 9 (F/W oraz P/B)',
    subtitle: 'Pętelki i lustrzane odbicia',
    desc: 'Ostatnie dwie cyfry domykające alfabet Majora.',
    speech: 'Ostatni krok alfabetu! Dwie pętelki i obrócona dziewiątka – i cały kod 0-9 masz w małym palcu!',
    theory: [
      'Domykamy cały alfabet cyfr:',
      '• 8 = F, W – pisana mała literka „f” ma dwie pętelki na górze i na dole, dokładnie jak cyfra 8.',
      '• 9 = P, B – cyfra 9 w lustrze wygląda jak litera P, a gdy obróci się ją do góry nogami – jak małe b!',
      'Gratulacje! Znasz już całe 0 do 9:',
      '0: S/Z | 1: T/D | 2: N | 3: M | 4: R | 5: L | 6: J/SZ | 7: K/G | 8: F/W | 9: P/B.'
    ],
    task: {
      prompt: 'Dlaczego cyfra 9 to P oraz B?',
      options: ['Bo lustrzane odbicie 9 to P, a obrócona to b', 'Bo 9 to ostatnia cyfra', 'Bo pies ma 9 żyć', 'Bo brzmi jak B'],
      correct: 0,
      hint: 'Obróć cyfrę 9 w wyobraźni!'
    }
  },
  {
    id: 'major-6',
    title: 'Samogłoski jako klej',
    subtitle: 'Budowanie słów z samogłosek A, E, I, O, U, Y',
    desc: 'Samogłoski NIE MAJĄ wartości liczbowej. Służą tylko do lepienia słów!',
    speech: 'Teraz dzieje się magia! Użyjemy samogłosek jak plasteliny do lepienia całych słów!',
    theory: [
      'Po co nam samogłoski (A, E, I, O, U, Y)?',
      'W systemie Major samogłoski NIE MAJĄ żadnej cyfry – są jak darmowy klej albo plastelina!',
      'Dzięki temu możesz wstawić DOWOLNE samogłoski między spółgłoski, by utworzyć sensowne, barwne słowo!',
      'Spójrz na liczbę 71:',
      '• 7 = K, 1 = T.',
      '• Wkładasz samogłoskę „O” w środek → powstaje puszysty KOT!',
      '• Albo dodajesz „A” → KAT! Albo „I” → KIT!'
    ],
    task: {
      prompt: 'Jaką liczbę koduje słowo „NOS” (N=2, S=0)?',
      options: ['20', '31', '71', '40'],
      correct: 0,
      hint: 'N to 2 nóżki, O to klej, S to zero (20)!'
    }
  },
  {
    id: 'major-7',
    title: '2-cyfrowe obrazy (kołki pamięciowe)',
    subtitle: 'TOR, RAK, FALA, BUT',
    desc: 'Przekształcaj pary liczb w konkretne, trójwymiarowe przedmioty.',
    speech: 'Uhuhu! Popatrz, jak liczby zamieniają się w trójwymiarowe zabawki w Twojej głowie!',
    theory: [
      'Zamiast pamiętać nudne liczby, pamiętasz wyraziste obrazy (kołki pamięciowe):',
      '• 14 = T(1) + R(4) = kolejowy TOR 🚂',
      '• 47 = R(4) + K(7) = szczypiący RAK 🦞',
      '• 71 = K(7) + T(1) = puszysty KOT 🐱',
      '• 91 = B(9) + T(1) = skórzany BUT 👞',
      'Gdy widzisz obraz przed oczami → od razu wiesz, jaka to liczba!'
    ],
    task: {
      prompt: 'Które słowo poprawnie koduje liczbę 14 (1=T, 4=R)?',
      options: ['TOR', 'NOS', 'RAK', 'DOM'],
      correct: 0,
      hint: '1 to T, 4 to R → T + O + R = TOR!'
    }
  },
  {
    id: 'major-8',
    title: 'Egzamin Profesora: Kod PIN',
    subtitle: 'Praktyczne zapamiętanie 4-cyfrowego kodu',
    desc: 'Wykorzystaj 2 obrazy, aby zapamiętać PIN 71-14 na zawsze.',
    speech: 'Pora na wielki finał! Zobacz, jak w 3 sekundy zapamiętasz 4-cyfrowy PIN do bankomatu lub telefonu na zawsze!',
    theory: [
      'Twój nowy kod PIN do telefonu lub karty to: 7114.',
      'Dzielimy go na dwa 2-cyfrowe kołki:',
      '• 71 = KOT 🐱 (K=7, T=1)',
      '• 14 = TOR kolejowy 🚂 (T=1, R=4)',
      'Łączymy je w żywą scenę: Gigantyczny KOT leży na TORACH i łapą zatrzymuje pociąg!',
      'Gdy stoisz przed bankomatem, widzisz Kota na Torach: Kot(71) + Tor(14) = 7114!'
    ],
    task: {
      prompt: 'Jaki PIN ukryty jest w historii o KOCIE (71) na TORACH (14)?',
      options: ['7114', '1471', '2047', '9125'],
      correct: 0,
      hint: 'Kot to 71, Tor to 14 → 7114!'
    }
  }
];









function mountMap(root, { nav }) {
  const owl = createOwl({ size: 'md' });
  const prog = store.get('major.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/major/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Daty historyczne, rocznice, numery kont, statystyki i kody dostępowe. Zamiast męczących liczb pamiętasz żywe obrazy i filmy, które zostają w głowie na całe lata!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/major', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦉 ', h('span', { class: 'grad' }, 'Akademia Majora ze Sówką')),
    h('p', { class: 'lead' }, '8 fundamentalnych lekcji, od dźwięków 0-9 po swobodne zapamiętywanie kodów PIN i PESEL.'),
    owl.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    owl.say(
      doneCount === 0
        ? 'Uhuhu! Jestem Sówka Profesor 🦉 Znam tajemny kod zamieniający nudne cyfry w barwne obrazy!'
        : `Świetny postęp! Masz już ${doneCount}/${LESSONS.length} wykładów zaliczonych!`,
      'happy'
    );
  }, 200);

  return () => owl.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const owl = createOwl({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🦉 Tajnik Sówki: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🦉 Podpowiedź Sówki');
  hintBtn.addEventListener('click', () => {
    owl.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/major/train', class: 'back' }, '← Wykaz lekcji')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    owl.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      owl.setMood('cheer', 2500);
      owl.say('Znakomicie! Doskonałe zrozumienie zasad systemu Major!', 'cheer');

      const prog = store.get('major.train', {});
      prog[les.id] = 3;
      store.set('major.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono Akademię! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/major/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/major';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      owl.setMood('sad', 1800);
      owl.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    owl.say(les.speech || `Uhuhu! Lekcja ${index + 1}: ${les.subtitle}. Spójrz na podpowiedź poniżej!`, 'happy');
  }, 250);

  return () => owl.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const owl = createOwl({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = h('span', { class: 'hud-lives' }, '❤️❤️❤️');
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/major', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl)
    ),
    owl.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Huuu-hu! Fenomenalnie! Kod złamany! 🦉✨',
    'Spółgłoski opanowane do perfekcji! 📖🔐',
    'Geniusz fonetyczny! Sówka bije skrzydłami! 💡🎉',
    'Świetny strzał! Cyfry zamieniają się w magię! 🎯🦉',
    'Uhuhu! Błyskawiczny umysł profesora! ⚡🧠',
    'Arcydzieło pamięci! Twój kod działa bez pudła! 🌟📚',
    'Prawdziwy erudyta! Lecimy po kolejny rekord! 🚀🦉'
  ];
  function cheerOwl(c) {
    if (c % 5 === 0 && c > 0) {
      owl.say(`Mega combo x${c}! Tytuł Wielkiego Mistrza Majora jest Twój! 🦉🏆🌟`, 'cheer', { revert: 1800 });
      owl.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      owl.say(`Combo x${c}! Twój mózg zamienia liczby w arcydzieła! 🦉✨`, 'cheer', { revert: 1400 });
      owl.hop?.();
    } else {
      owl.hop?.();
      owl.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
  }

  function saveBest() {
    const prev = store.get(`major.best.${modeId}`, 0);
    if (score > prev) store.set(`major.best.${modeId}`, score);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    owl.setMood('happy');
    owl.say('Zaczynamy od nowa! Spółgłoski czekają! 🦉📚', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    saveBest();
    sfx.fanfare();
    owl.setMood('cheer', 3000);
    owl.say(`Koniec sesji! Osiągnięty wynik: ${score} pkt! Wiedza godna profesora! 🦉`, 'cheer');

    const best = store.get(`major.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/major' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎓 Wspaniała runda!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function handleWrong(solutionText) {
    sfx.wrong();
    combo = 0;
    lives--;
    updateLives();
    if (lives <= 0) {
      gameOver();
    } else {
      owl.setMood('sad', 1200);
      owl.say(`${solutionText} Pozostało szans: ${lives} 🦉`, 'think', { revert: 2600 });
      setTimeout(nextRound, 1200);
    }
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'peg') {
      const target = PHONETIC_MAP[rand(0, PHONETIC_MAP.length - 1)];
      const others = PHONETIC_MAP.filter(m => m.digit !== target.digit);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([target, ...wrong]);

      const card = h('div', { class: 'major-card' },
        h('span', { class: 'major-big-num' }, `${target.digit}`),
        h('p', {}, 'Jakie dźwięki odpowiadają tej cyfrze?')
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.sounds);
        btn.addEventListener('click', () => {
          if (c.digit === target.digit) {
            sfx.success();
            score += 10 + combo * 2;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerOwl(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Cyfra ${target.digit} to: ${target.sounds}! (${target.rule})`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'decode') {
      const target = PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)];
      const others = PEG_WORDS_2DIGIT.filter(p => p.num !== target.num);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([target, ...wrong]);

      const card = h('div', { class: 'major-card' },
        h('span', { class: 'major-word-target' }, target.word),
        h('p', {}, `Wyobrażenie: ${target.img}`)
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.num);
        btn.addEventListener('click', () => {
          if (c.num === target.num) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerOwl(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`${target.word} koduje liczbę ${target.num} (${target.code})`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'encode') {
      const target = PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)];
      const others = PEG_WORDS_2DIGIT.filter(p => p.num !== target.num);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([target, ...wrong]);

      const card = h('div', { class: 'major-card' },
        h('span', { class: 'major-big-num' }, target.num),
        h('p', {}, 'Wybierz słowo o spółgłoskach kodujących tę liczbę:')
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.word);
        btn.addEventListener('click', () => {
          if (c.num === target.num) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerOwl(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Dla liczby ${target.num} poprawny jest ${target.word} (${target.code})`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'pin') {
      // 4-digit PIN training (or 6-digit in later rounds)
      const is6Digit = round >= 7;
      const p1 = PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)];
      const p2 = PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)];
      const p3 = is6Digit ? PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)] : null;
      const pinCode = is6Digit ? `${p1.num}${p2.num}${p3.num}` : `${p1.num}${p2.num}`;

      // Podpowiedzi w pierwszych 3 rundach, potem pamięć własna!
      const storyContent = round <= 3
        ? h('div', { class: 'pin-story' },
            h('p', {}, `Obraz 1: `, h('b', {}, p1.word), ` (${p1.img})`),
            h('p', {}, `Obraz 2: `, h('b', {}, p2.word), ` (${p2.img})`),
            h('p', { class: 'muted' }, `Wyobraź sobie akcję łączącą oba przedmioty!`)
          )
        : h('div', { class: 'pin-story' },
            h('p', { class: 'muted' }, is6Digit ? 'Zaawansowany PIN 6-cyfrowy! Zakoduj 3 obrazy w myślach.' : 'Zakoduj obie liczby w słowa i stwórz własną scenkę w głowie!')
          );

      const card = h('div', { class: 'major-card' },
        h('h3', {}, is6Digit ? '💳 Zapamiętaj 6-cyfrowy PIN:' : '💳 Zapamiętaj PIN:'),
        h('span', { class: 'pin-display' }, pinCode),
        storyContent
      );

      const checkBtn = h('button', { class: 'btn btn-primary mt-2', type: 'button' }, 'Zapamiętane! Sprawdź mnie ▶');
      checkBtn.addEventListener('click', () => {
        playArea.innerHTML = '';
        const quizCard = h('div', { class: 'major-card' },
          h('h3', {}, 'Jaki był kod PIN?')
        );

        const wrongPins = is6Digit
          ? [
              `${p2.num}${p1.num}${p3.num}`,
              `${p1.num}${p3.num}${p2.num}`,
              `${p3.num}${p2.num}${p1.num}`
            ].filter(p => p !== pinCode)
          : [
              `${p2.num}${p1.num}`,
              `${p1.num}${PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)].num}`,
              `${PEG_WORDS_2DIGIT[rand(0, PEG_WORDS_2DIGIT.length - 1)].num}${p2.num}`
            ].filter(p => p !== pinCode);

        const pinChoices = shuffle([pinCode, ...wrongPins]).slice(0, 4);
        const pinOpts = h('div', { class: 'opt-grid' });
        pinChoices.forEach(pinOpt => {
          const btn = h('button', { class: 'btn-opt', type: 'button' }, pinOpt);
          btn.addEventListener('click', () => {
            if (pinOpt === pinCode) {
              sfx.fanfare();
              score += (is6Digit ? 35 : 25) + combo * 5;
              combo++;
              round++;
              scoreEl.textContent = `${score}`;
              roundEl.textContent = `${round}`;
              cheerOwl(combo);
              setTimeout(nextRound, 1200);
            } else {
              btn.classList.add('wrong');
              handleWrong(`Prawidłowy PIN to ${pinCode}.`);
            }
          });
          pinOpts.append(btn);
        });

        playArea.append(quizCard, pinOpts);
      });

      playArea.append(card, checkBtn);
    }
  }

  nextRound();
  return () => owl.destroy();
}










function mountMenu(root, { nav }) {
  const owl = createOwl({ size: 'md' });
  const prog = store.get('major.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/major/train' : `#/major/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦉 Akademia Sówki Profesora'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę Majora' : done === LESSONS.length ? 'Powtórz akademię' : 'Kontynuuj akademię'),
        h('p', {}, `${LESSONS.length} lekcji · spółgłoski 0-9 · kołki pamięciowe · zapamiętywanie PIN`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/major/train' }, 'Zobacz wykaz wykładów →');

  const modeCards = MODES.map(m => {
    const best = store.get(`major.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/major/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🦉 ', h('span', { class: 'grad' }, 'System Major')),
        h('p', { class: 'lead' }, 'Tajemny kod mistrzów pamięci: zamieniaj liczby na słowa i obrazy.')
      )
    ),
    owl.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Uhuhu! Jestem Sówka Profesor 🦉 Nauczę Cię zamieniać nudne cyfry w fascynujące obrazy!'
    : done < LESSONS.length
      ? `Mamy za sobą ${done} z ${LESSONS.length} wykładów. Chodźmy dalej do biblioteki! 📚`
      : 'Ukończyłeś całą Akademię Majora! Sprawdź swój refleks w grze swobodnej! 🏆';

  setTimeout(() => { owl.say(greet, 'happy'); }, 300);
  return () => owl.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- WORDS GAME MODULE --- */
  const wordsGame = (function() {
    const VOCAB = [
  { id: 'w1', foreign: 'mushroom', lang: 'angielski', meaning: 'grzyb', bridge: 'MASZ RUM', story: 'Wielki leśny borowik wyciąga rękę i krzyczy pirackim głosem: „MASZ RUM w butelce?!”', emoji: '🍄' },
  { id: 'w2', foreign: 'candle', lang: 'angielski', meaning: 'świeca', bridge: 'KUNDEL', story: 'Wesoły KUNDELEK biegnie przez pokój, niosąc na czubku ogona płonącą, woskową ŚWIECĘ!', emoji: '🕯️' },
  { id: 'w3', foreign: 'feather', lang: 'angielski', meaning: 'pióro', bridge: 'SWETER', story: 'Zakładasz wełniany SWETER, a z każdego oczka wyrasta wielkie, łaskoczące gęsie PIÓRO!', emoji: '🪶' },
  { id: 'w4', foreign: 'pillow', lang: 'angielski', meaning: 'poduszka', bridge: 'PIŁA', story: 'Chcesz uciąć deskę, ale zamiast PIŁY trzymasz miękką puchową PODUSZKĘ, z której lecą pióra!', emoji: '🛏️' },
  { id: 'w5', foreign: 'shark', lang: 'angielski', meaning: 'rekin', bridge: 'SZARIK', story: 'Groźny żarłacz REKIN macha przyjaźnie ogonem i szczeka jak wierny pies SZARIK!', emoji: '🦈' },
  { id: 'w6', foreign: 'beetle', lang: 'angielski', meaning: 'chrząszcz', bridge: 'BITELSI', story: 'Cztery CHRZĄSZCZE w czarnych garniturach grają na gitarach na scenie jak The BEATLES!', emoji: '🪲' },
  { id: 'w7', foreign: 'fork', lang: 'angielski', meaning: 'widelec', bridge: 'FOKA', story: 'Wesoła FOKA na plaży żongluje na nosie wielkim, srebrnym WIDELCEM!', emoji: '🍴' },
  { id: 'w8', foreign: 'bat', lang: 'angielski', meaning: 'nietoperz', bridge: 'BAT', story: 'Czarny NIETOPERZ w masce Zorro lata pod sufitem i strzela z długiego skórzanego BATA!', emoji: '🦇' },
  { id: 'w9', foreign: 'ship', lang: 'angielski', meaning: 'statek', bridge: 'SZYP', story: 'Potężny STATEK oceaniczny ma zamiast masztów wielkie kolczaste SZYPUŁKI dzikiej róży!', emoji: '🚢' },
  { id: 'w10', foreign: 'cloud', lang: 'angielski', meaning: 'chmura', bridge: 'KLAUN', story: 'Wesoły KLAUN z czerwonym nosem skacze jak na trampolinie po puszystej białej CHMURZE!', emoji: '☁️' },
  { id: 'w11', foreign: 'bread', lang: 'angielski', meaning: 'chleb', bridge: 'BRUD', story: 'Chcesz zjeść chrupiący CHLEB, ale ma na skórce wielki napis BRUD zrobiony z czekolady!', emoji: '🍞' },
  { id: 'w12', foreign: 'horse', lang: 'angielski', meaning: 'koń', bridge: 'HOSSA', story: 'Biały KOŃ zakłada garnitur maklera i krzyczy na giełdzie: „Idzie HOSSA, kupujemy siano!”', emoji: '🐴' },
  { id: 'w13', foreign: 'snake', lang: 'angielski', meaning: 'wąż', bridge: 'ŚNIEG', story: 'Długi zielony WĄŻ w ciepłej czapce lepi wesołego bałwana ze ŚNIEGU na mrozie!', emoji: '🐍' },
  { id: 'w14', foreign: 'coat', lang: 'angielski', meaning: 'płaszcz', bridge: 'KOT', story: 'Rudy KOT spaceruje dumnie w długim, ciepłym zimowym PŁASZCZU z paskiem!', emoji: '🧥' },
  { id: 'w15', foreign: 'mirror', lang: 'angielski', meaning: 'lustro', bridge: 'MURAWA', story: 'Spoglądasz w LUSTRO, a zamiast Twojej twarzy rośnie w nim zielona MURAWA piłkarska!', emoji: '🪞' },
  { id: 'w16', foreign: 'spoon', lang: 'angielski', meaning: 'łyżka', bridge: 'SZPIEG', story: 'Błyszcząca ŁYŻKA w ciemnych okularach udaje SZPIEGA i nurkuje w talerzu z rosołem!', emoji: '🥄' },
  { id: 'w17', foreign: 'plate', lang: 'angielski', meaning: 'talerz', bridge: 'PŁETWA', story: 'Płetwonurek kładzie wielką gumową PŁETWĘ prosto na płaski TALERZ obiadowy!', emoji: '🍽️' },
  { id: 'w18', foreign: 'cup', lang: 'angielski', meaning: 'kubek', bridge: 'KAP', story: 'Z kranu robi głośne KAP, KAP, KAP wprost do kolorowego KUBKA z herbatą!', emoji: '☕' },
  { id: 'w19', foreign: 'boot', lang: 'angielski', meaning: 'but', bridge: 'BUTLA', story: 'Kowbojski skórzany BUT ma zamiast obcasa wielką metalową BUTLĘ z gazem!', emoji: '👢' },
  { id: 'w20', foreign: 'ring', lang: 'angielski', meaning: 'pierścień', bridge: 'RING', story: 'Na środku bokserskiego RINGU lśni gigantyczny złoty PIERŚCIEŃ z diamentem!', emoji: '💍' },
  { id: 'w21', foreign: 'bell', lang: 'angielski', meaning: 'dzwon', bridge: 'BELKA', story: 'Pod dachem wisi drewniana BELKA, na której zawieszony jest wielki mosiężny DZWON!', emoji: '🔔' },
  { id: 'w22', foreign: 'key', lang: 'angielski', meaning: 'klucz', bridge: 'KIJ', story: 'Wielki złoty KLUCZ do sejfu służy hokeiście jako zakrzywiony KIJ do gry!', emoji: '🔑' },
  { id: 'w23', foreign: 'lock', lang: 'angielski', meaning: 'zamek', bridge: 'LOK', story: 'Fryzjerka robi lokówką wielki, sprężysty LOK z metalowego ZAMKA w drzwiach!', emoji: '🔒' },
  { id: 'w24', foreign: 'rope', lang: 'angielski', meaning: 'lina', bridge: 'ROPA', story: 'Chcesz wspiąć się po LINIE, ale jest cała oblepiona czarną, śliską ROPĄ naftową!', emoji: '🪢' },
  { id: 'w25', foreign: 'leaf', lang: 'angielski', meaning: 'liść', bridge: 'LIFT', story: 'Zielony dębowy LIŚĆ wsiada do windy (LIFTU) i wjeżdża na sam czubek drzewa!', emoji: '🍃' },
  { id: 'w26', foreign: 'tree', lang: 'angielski', meaning: 'drzewo', bridge: 'TRIO', story: 'W koronie rozłożystego DRZEWA wesołe TRIO wiewiórek śpiewa operową arię!', emoji: '🌳' },
  { id: 'w27', foreign: 'bridge', lang: 'angielski', meaning: 'most', bridge: 'BRYDŻ', story: 'Kierowcy stoją na wielkim MOŚCIE i z nudów grają na maskach aut w BRYDŻA!', emoji: '🌉' },
  { id: 'w28', foreign: 'lake', lang: 'angielski', meaning: 'jezioro', bridge: 'LEK', story: 'Wrzucasz do czystego JEZIORA musujący LEK witaminowy i cała woda buzuje bąbelkami!', emoji: '🌊' },
  { id: 'w29', foreign: 'peach', lang: 'angielski', meaning: 'brzoskwinia', bridge: 'PISZCZY', story: 'Gryziesz soczystą, miękką BRZOSKWINIĘ, a ona głośno PISZCZY ze śmiechu!', emoji: '🍑' },
  { id: 'w30', foreign: 'frog', lang: 'angielski', meaning: 'żaba', bridge: 'FROK', story: 'Zielona ŻABA zakłada balowy elegancki FRAK (frok) i tańczy walca na liściu lilii!', emoji: '🐸' },
  { id: 'w31', foreign: 'duck', lang: 'angielski', meaning: 'kaczka', bridge: 'DAKTYL', story: 'Żółta KACZKA pływa po stawie i zamiast chleba zajada słodkie DAKTYLE!', emoji: '🦆' },
  { id: 'w32', foreign: 'bear', lang: 'angielski', meaning: 'niedźwiedź', bridge: 'BERŁO', story: 'Brunatny NIEDŹWIEDŹ w koronie trzyma w łapie złote królewskie BERŁO i je miód!', emoji: '🐻' },
  { id: 'w33', foreign: 'wolf', lang: 'angielski', meaning: 'wilk', bridge: 'WULKAN', story: 'Szary WILK wyje do księżyca stojąc na samym szczycie dymiącego WULKANU!', emoji: '🐺' },
  { id: 'w34', foreign: 'fox', lang: 'angielski', meaning: 'lis', bridge: 'FOKS', story: 'Rudy LIS zakłada smoking i tańczy po lesie eleganckiego FOKSTROTA!', emoji: '🦊' },
  { id: 'w35', foreign: 'deer', lang: 'angielski', meaning: 'jeleń', bridge: 'DYREKTOR', story: 'Dumny JELEŃ z wielkim porożem siada za biurkiem jako nowy DYREKTOR korporacji!', emoji: '🦌' },
  { id: 'w36', foreign: 'goat', lang: 'angielski', meaning: 'koza', bridge: 'GOT', story: 'Biała rogata KOZA ubiera się na czarno i słucha mrocznej muzyki jak prawdziwy GOT!', emoji: '🐐' },
  { id: 'w37', foreign: 'pig', lang: 'angielski', meaning: 'świnia', bridge: 'PIGUŁKA', story: 'Różowa ŚWINIA w fartuchu lekarskim przepisuje na katar wielką różową PIGUŁKĘ!', emoji: '🐷' },
  { id: 'w38', foreign: 'cow', lang: 'angielski', meaning: 'krowa', bridge: 'KAWA', story: 'Łaciata KROWA na pastwisku pije z filiżanki gorącą KAWĘ z pianką z własnego mleka!', emoji: '🐮' },
  { id: 'w39', foreign: 'sheep', lang: 'angielski', meaning: 'owca', bridge: 'SZYBA', story: 'Puchata biała OWCA biegnie przez łąkę i z impetem myje językiem wielką SZYBĘ!', emoji: '🐑' },
  { id: 'w40', foreign: 'mouse', lang: 'angielski', meaning: 'mysz', bridge: 'MAJTEK', story: 'Mała polna MYSZ w marynarskich pasiastych MAJTKACH steruje żaglówką!', emoji: '🐭' },
  { id: 'w41', foreign: 'bird', lang: 'angielski', meaning: 'ptak', bridge: 'BURDA', story: 'Kolorowy PTAK na gałęzi krzyczy i wywołuje na podwórku wielką awanturę i BURDĘ!', emoji: '🐦' },
  { id: 'w42', foreign: 'owl', lang: 'angielski', meaning: 'sowa', bridge: 'AUL', story: 'Mądra SOWA w birecie profesorskim prowadzi wykład w wielkiej uniwersyteckiej AULI!', emoji: '🦉' },
  { id: 'w43', foreign: 'eagle', lang: 'angielski', meaning: 'orzeł', bridge: 'IGŁA', story: 'Wielki górski ORZEŁ trzyma w szponach zamiast gałązki cienką krawiecką IGŁĘ z nitką!', emoji: '🦅' },
  { id: 'w44', foreign: 'spider', lang: 'angielski', meaning: 'pająk', bridge: 'SPAJDI', story: 'Wielki włochaty PAJĄK zakłada kostium Spider-Mana (SPAJDI) i wspina się po ścianie!', emoji: '🕷️' },
  { id: 'w45', foreign: 'bee', lang: 'angielski', meaning: 'pszczoła', bridge: 'BIEG', story: 'Pracowita PSZCZOŁA zakłada buty z kolcami i bierze udział w BIEGU sprinterskim na 100m!', emoji: '🐝' },
  { id: 'w46', foreign: 'ant', lang: 'angielski', meaning: 'mrówka', bridge: 'ANTENA', story: 'Mała pracowita MRÓWKA niesie na plecach olbrzymią telewizyjną ANTENĘ satelitarną!', emoji: '🐜' },
  { id: 'w47', foreign: 'crab', lang: 'angielski', meaning: 'krab', bridge: 'KRA', story: 'Czerwony morski KRAB szczypcami rozłupuje wielką lodową KRĘ na biegunie!', emoji: '🦀' },
  { id: 'w48', foreign: 'whale', lang: 'angielski', meaning: 'wieloryb', bridge: 'WELUR', story: 'Olbrzymi błękitny WIELORYB nosi na grzbiecie elegancki smoking uszyty z WELURU!', emoji: '🐋' },
  { id: 'w49', foreign: 'seal', lang: 'angielski', meaning: 'foka', bridge: 'SILNIK', story: 'Zwinna FOKA pływa w oceanie z doczepionym do ogona motorowodnym SILNIKIEM turbo!', emoji: '🦭' },
  { id: 'w50', foreign: 'lion', lang: 'angielski', meaning: 'lew', bridge: 'LAJON', story: 'Król zwierząt LEW przed polowaniem zajada chrupiący batonik LION!', emoji: '🦁' },
  { id: 'w51', foreign: 'tiger', lang: 'angielski', meaning: 'tygrys', bridge: 'TAJGA', story: 'Pasiasty TYGRYS w futrzanej czapce biega po syberyjskiej TAJDZE i szuka ciepła!', emoji: '🐯' },
  { id: 'w52', foreign: 'monkey', lang: 'angielski', meaning: 'małpa', bridge: 'MANKIET', story: 'Wesoła MAŁPKA kradnie w sklepie elegancką koszulę i zapina złoty spinek w MANKIECIE!', emoji: '🐵' },
  { id: 'w53', foreign: 'apple', lang: 'angielski', meaning: 'jabłko', bridge: 'APEL', story: 'Dyrektor szkoły staje na środku boiska i ogłasza APEL, rzucając w uczniów JABŁKAMI!', emoji: '🍎' },
  { id: 'w54', foreign: 'pear', lang: 'angielski', meaning: 'gruszka', bridge: 'PERŁA', story: 'Rozkrawasz żółtą słodką GRUSZKĘ, a w środku lśni wielka biała morska PERŁA!', emoji: '🍐' },
  { id: 'w55', foreign: 'plum', lang: 'angielski', meaning: 'śliwka', bridge: 'PLAMA', story: 'Fioletowa soczysta ŚLIWKA spada na biały obrus i zostawia wielką atramentową PLAMĘ!', emoji: '🫐' },
  { id: 'w56', foreign: 'cherry', lang: 'angielski', meaning: 'wiśnia', bridge: 'CZERWIEŃ', story: 'Dojrzała czerwona WIŚNIA świeci w nocy intensywną, neonową CZERWIENIĄ!', emoji: '🍒' },
  { id: 'w57', foreign: 'nut', lang: 'angielski', meaning: 'orzech', bridge: 'NUTA', story: 'Rozłupujesz twardy ORZECH włoski, a ze środka wylatuje złota, śpiewająca NUTA muzyczna!', emoji: '🥜' },
  { id: 'w58', foreign: 'carrot', lang: 'angielski', meaning: 'marchew', bridge: 'KARETA', story: 'Królewska pomarańczowa MARCHEW jedzie do pałacu w złotej KARECIE zaprzężonej w konie!', emoji: '🥕' },
  { id: 'w59', foreign: 'onion', lang: 'angielski', meaning: 'cebula', bridge: 'ANIOŁ', story: 'Kroisz ostrą CEBULĘ i płaczesz, a biały ANIOŁ podaje Ci chusteczkę do nosa!', emoji: '🧅' },
  { id: 'w60', foreign: 'garlic', lang: 'angielski', meaning: 'czosnek', bridge: 'GARLIK / GAR', story: 'Biały ząbek CZOSNKU wskakuje do wielkiego GARA z gorącą zupą i odstrasza wampiry!', emoji: '🧄' },
  { id: 'w61', foreign: 'milk', lang: 'angielski', meaning: 'mleko', bridge: 'MILK / MILION', story: 'Karton białego MLEKA wygrywa na loterii MILION złotych i oblewa wszystkich ze szczęścia!', emoji: '🥛' },
  { id: 'w62', foreign: 'cheese', lang: 'angielski', meaning: 'ser', bridge: 'CZYSTY', story: 'Żółty szwajcarski SER z dziurami bierze kąpiel w wannie, bo lubi być pachnący i CZYSTY!', emoji: '🧀' },
  { id: 'w63', foreign: 'butter', lang: 'angielski', meaning: 'masło', bridge: 'BATERIA', story: 'Smarujesz kanapkę żółtym MASŁEM, a kromka zaczyna świecić, bo masło to BATERIA!', emoji: '🧈' },
  { id: 'w64', foreign: 'meat', lang: 'angielski', meaning: 'mięso', bridge: 'MIT', story: 'Wikingowie siadają przy ognisku, pieką soczyste MIĘSO i opowiadają prastary grecki MIT!', emoji: '🥩' },
  { id: 'w65', foreign: 'fish', lang: 'angielski', meaning: 'ryba', bridge: 'FISZKA', story: 'Srebrna RYBA wyskakuje z wody i uczy się słówek, zapisując je na papierowej FISZCE!', emoji: '🐟' },
  { id: 'w66', foreign: 'soup', lang: 'angielski', meaning: 'zupa', bridge: 'SĘP', story: 'Głodny leśny SĘP przylatuje do kuchni i z apetytem zajada gorącą pomidorową ZUPĘ!', emoji: '🍲' },
  { id: 'w67', foreign: 'salt', lang: 'angielski', meaning: 'sól', bridge: 'SALTO', story: 'Solniczka z białą SOLĄ wyskakuje w powietrze i robi potrójne akrobatyczne SALTO!', emoji: '🧂' },
  { id: 'w68', foreign: 'sugar', lang: 'angielski', meaning: 'cukier', bridge: 'SZUR', story: 'Biały słodki CUKIER wsypuje się do szklanki z głośnym SZUR, SZUR po dnie!', emoji: '🍬' },
  { id: 'w69', foreign: 'honey', lang: 'angielski', meaning: 'miód', bridge: 'HANI', story: 'Mała dziewczynka HANIA smaruje pajdę chleba słodkim, lejącym się MIODEM!', emoji: '🍯' },
  { id: 'w70', foreign: 'cake', lang: 'angielski', meaning: 'ciasto', bridge: 'KEKS', story: 'Kucharz piecze urodzinowe CIASTO, ale przez pomyłkę wychodzi mu bakaliowy KEKS!', emoji: '🍰' },
  { id: 'w71', foreign: 'house', lang: 'angielski', meaning: 'dom', bridge: 'HAŁAS', story: 'Wielki piętrowy DOM trzęsie się w posadach, bo dzieci robią w nim potworny HAŁAS!', emoji: '🏠' },
  { id: 'w72', foreign: 'room', lang: 'angielski', meaning: 'pokój', bridge: 'RUMOR', story: 'Otwierasz drzwi do POKOJU, a tam meble tańczą i robią ogromny RUMOR!', emoji: '🚪' },
  { id: 'w73', foreign: 'door', lang: 'angielski', meaning: 'drzwi', bridge: 'DÓR', story: 'Pukasz w drewniane DRZWI, a one grają głośny, wesoły akord w tonacji C-DUR!', emoji: '🚪' },
  { id: 'w74', foreign: 'window', lang: 'angielski', meaning: 'okno', bridge: 'WINDA', story: 'Zamiast otwierać OKNO, wciskasz guzik i całe okno zjeżdża w dół jak WINDA!', emoji: '🪟' },
  { id: 'w75', foreign: 'floor', lang: 'angielski', meaning: 'podłoga', bridge: 'FLOR / FLORYDA', story: 'Myjesz PODŁOGĘ mopem, a deski zamieniają się w piaszczystą plażę na FLORYDZIE!', emoji: '🪵' },
  { id: 'w76', foreign: 'roof', lang: 'angielski', meaning: 'dach', bridge: 'RUFA', story: 'Na spadzisty DACH domu spada z nieba wielka drewniana RUFA statku piratów!', emoji: '🏠' },
  { id: 'w77', foreign: 'wall', lang: 'angielski', meaning: 'ściana', bridge: 'WAŁ', story: 'Biała ŚCIANA w pokoju pęka i zamienia się w wysoki ziemny WAŁ przeciwpowodziowy!', emoji: '🧱' },
  { id: 'w78', foreign: 'table', lang: 'angielski', meaning: 'stół', bridge: 'TABLICA', story: 'Drewniany STÓŁ jadalny zamienia się nagle w szkolną TABLICĘ ze wzorami matematycznymi!', emoji: '🪵' },
  { id: 'w79', foreign: 'chair', lang: 'angielski', meaning: 'krzesło', bridge: 'CZERW', story: 'Wygodne biurowe KRZESŁO zaczyna świecić na jaskrawy CZERWONY kolor!', emoji: '🪑' },
  { id: 'w80', foreign: 'bed', lang: 'angielski', meaning: 'łóżko', bridge: 'BEDUIN', story: 'Pustynny BEDUIN rozbija namiot na piasku i kładzie się spać w wielkim miękkim ŁÓŻKU!', emoji: '🛏️' },
  { id: 'w81', foreign: 'clock', lang: 'angielski', meaning: 'zegar', bridge: 'KLOC', story: 'Ścienny ZEGAR tyka głośno, a z kukułki zamiast ptaka wylatuje ciężki drewniany KLOC!', emoji: '⏰' },
  { id: 'w82', foreign: 'book', lang: 'angielski', meaning: 'książka', bridge: 'BUK', story: 'W wielkiej starej KSIĄŻCE zamiast papieru są liście potężnego BUKU!', emoji: '📖' },
  { id: 'w83', foreign: 'pen', lang: 'angielski', meaning: 'długopis', bridge: 'PIENIĄDZ', story: 'Piszesz sprawdzian DŁUGOPISEM, a z wkładu zamiast tuszu wylatują złote PIENIĄDZE!', emoji: '🖊️' },
  { id: 'w84', foreign: 'bag', lang: 'angielski', meaning: 'torba', bridge: 'BAGNO', story: 'Wrzucasz zakupy do płóciennej TORBY, a w środku bulgocze zielone, pachnące BAGNO!', emoji: '🛍️' },
  { id: 'w85', foreign: 'box', lang: 'angielski', meaning: 'pudełko', bridge: 'BOKSER', story: 'Otwierasz kartonowe PUDEŁKO z paczką, a ze środka wyskakuje BOKSER w rękawicach!', emoji: '📦' },
  { id: 'w86', foreign: 'car', lang: 'angielski', meaning: 'samochód', bridge: 'KARA', story: 'Szybki sportowy SAMOCHÓD parkuje na zakazie i kierowcę spotyka surowa KARA!', emoji: '🚗' },
  { id: 'w87', foreign: 'bus', lang: 'angielski', meaning: 'autobus', bridge: 'BUSOLA', story: 'Żółty szkolny AUTOBUS gubi drogę we mgle i kierowca nawiguje wielką mosiężną BUSOLĄ!', emoji: '🚌' },
  { id: 'w88', foreign: 'train', lang: 'angielski', meaning: 'pociąg', bridge: 'TRENER', story: 'Długi POCIĄG towarowy zatrzymuje się na stacji, a maszynistą jest surowy TRENER fitness!', emoji: '🚆' },
  { id: 'w89', foreign: 'plane', lang: 'angielski', meaning: 'samolot', bridge: 'PLAN', story: 'Wielki pasażerski SAMOLOT rozkłada w locie gigantyczny papierowy PLAN miasta!', emoji: '✈️' },
  { id: 'w90', foreign: 'bike', lang: 'angielski', meaning: 'rower', bridge: 'BAJKA', story: 'Czerwony dziecięcy ROWER sam kręci pedałami i przenosi Cię wprost w środek BAJKI!', emoji: '🚲' },
  { id: 'w91', foreign: 'road', lang: 'angielski', meaning: 'droga', bridge: 'RÓD', story: 'Szeroka asfaltowa DROGA prowadzi prosto do zamku, w którym mieszka królewski RÓD!', emoji: '🛣️' },
  { id: 'w92', foreign: 'sun', lang: 'angielski', meaning: 'słońce', bridge: 'SANIE', story: 'Gorące żółte SŁOŃCE zakłada okulary przeciwsłoneczne i jeździ po chmurach w SANIACH!', emoji: '☀️' },
  { id: 'w93', foreign: 'moon', lang: 'angielski', meaning: 'księżyc', bridge: 'MUNDUR', story: 'Srebrny KSIĘŻYC w pełni zakłada wojskowy MUNDUR i salutuje gwiazdom na niebie!', emoji: '🌙' },
  { id: 'w94', foreign: 'star', lang: 'angielski', meaning: 'gwiazda', bridge: 'STARA', story: 'Jasna lśniąca GWIAZDA na niebie mruga okiem i mówi, że jest już bardzo STARA!', emoji: '⭐' },
  { id: 'w95', foreign: 'rain', lang: 'angielski', meaning: 'deszcz', bridge: 'REIN / RENIFER', story: 'Z nieba leje ulewny DESZCZ, a renifery Świętego Mikołaja tańczą w kałużach!', emoji: '🌧️' },
  { id: 'w96', foreign: 'snow', lang: 'angielski', meaning: 'śnieg', bridge: 'SNOPEK', story: 'Zimą na pole spada biały puchaty ŚNIEG i przykrywa wysoki SNOPEK siana!', emoji: '❄️' },
  { id: 'w97', foreign: 'wind', lang: 'angielski', meaning: 'wiatr', bridge: 'WINDA', story: 'Za oknem wieje potężny WIATR, który porywa zewnętrzną szklaną WINDĘ wieżowca!', emoji: '💨' },
  { id: 'w98', foreign: 'fire', lang: 'angielski', meaning: 'ogień', bridge: 'FAJERWERKI', story: 'W kominku płonie wesoły OGIEŃ, z którego strzelają kolorowe sylwestrowe FAJERWERKI!', emoji: '🔥' },
  { id: 'w99', foreign: 'water', lang: 'angielski', meaning: 'woda', bridge: 'WATA', story: 'Odkręcasz kran z czystą WODĄ, a ze zlewu zamiast kropel wylatuje słodka WATA cukrowa!', emoji: '💧' },
  { id: 'w100', foreign: 'sea', lang: 'angielski', meaning: 'morze', bridge: 'SIERŚĆ', story: 'Błękitne wzburzone MORZE wyrzuca na brzeg falę, która jest miękka jak kocia SIERŚĆ!', emoji: '🌊' },
  { id: 'w101', foreign: 'sand', lang: 'angielski', meaning: 'piasek', bridge: 'SANDAŁ', story: 'Chodzisz po gorącej plaży, a żółty drobny PIASEK sam wskakuje Ci w skórzany SANDAŁ!', emoji: '🏖️' },
  { id: 'w102', foreign: 'rock', lang: 'angielski', meaning: 'skała', bridge: 'ROK', story: 'Stroma twarda SKAŁA w górach ma na szczycie wielki napis: „Szczęśliwego Nowego ROKU!”', emoji: '🪨' },
  { id: 'w103', foreign: 'coin', lang: 'angielski', meaning: 'moneta', bridge: 'KOŃ', story: 'Wrzucasz do skarbonki błyszczącą MONETĘ, a ze środka słychać, jak rży mały KOŃ!', emoji: '🪙' },
  { id: 'w104', foreign: 'sword', lang: 'angielski', meaning: 'miecz', bridge: 'SWĄD', story: 'Rycerz wyciąga ze skały ostry MIECZ, a w powietrzu unosi się zapach spalenizny i SWĄD!', emoji: '⚔️' },
  { id: 'w105', foreign: 'crown', lang: 'angielski', meaning: 'korona', bridge: 'KRAN', story: 'Królewska złota KORONA z diamentami leży w łazience i zatyka cieknący KRAN!', emoji: '👑' }
];


const MODES = [
  {
    id: 'translate',
    name: 'Błyskawiczny tłumacz',
    emoji: '🦜',
    desc: 'Spójrz na angielskie słowo i błyskawicznie wskaż polskie znaczenie.',
    color: ['#00b09b', '#96c93d'],
    badge: 'Klasyczny'
  },
  {
    id: 'bridge',
    name: 'Mosty Poli',
    emoji: '🌉',
    desc: 'Wskaż genialne polskie skojarzenie brzmieniowe (most), które łączy słowo ze znaczeniem.',
    color: ['#ff9966', '#ff5e62'],
    badge: 'Mnemotechnika'
  },
  {
    id: 'sprint',
    name: 'Sprint papugi',
    emoji: '⚡',
    desc: '30 sekund na zegarze! Ile słówek zdołasz przetłumaczyć w locie?',
    color: ['#f857a6', '#ff5858'],
    badge: 'Na czas'
  },
  {
    id: 'polyglot',
    name: 'Nieskończony poliglota',
    emoji: '🌎',
    desc: 'Gra aż do pierwszej pomyłki. Każda poprawna odpowiedź zwiększa mnożnik punktów!',
    color: ['#8e2de2', '#4a00e0'],
    badge: 'Nieskończony'
  }
];




const LESSONS = [
  {
    id: 'words-1',
    title: 'Metoda słów-kluczy',
    subtitle: 'Koniec z nudnym wkuwaniem słówek',
    desc: 'Odkryj metodę badaczy Atkinsona i Raugha, która zwiększa tempo nauki angielskiego trzykrotnie!',
    speech: 'Cześć, tu Papużka Pola! 🦜 Marzysz o swobodnych podróżach po świecie i piątkach z angielskiego? Pokażę Ci czarodziejski trik ze słowami-kluczami – zapamiętasz każde angielskie słówko w kilka sekund, bez nudnego wkuwania!',
    theory: [
      'Po co nam ta metoda? Zwykłe powtarzanie angielskich słówek po 50 razy w zeszycie jest nudne, męczące i szybko ulatuje z głowy.',
      'Metoda słów-kluczy (Keyword Method) to sekret poliglotów i mistrzów pamięci na całym świecie!',
      'Składa się z 2 prostych, zabawnych kroków:',
      '1. Znajdź polskie słowo, które brzmi podobnie do angielskiego wyrazu (to nasz Most Fonetyczny).',
      '2. Połącz ten dźwięk ze znaczeniem słówka w śmieszną, bajkową scenkę w wyobraźni!',
      'Gdy usłyszysz angielskie słowo, Twój mózg natychmiast przypomni sobie śmieszną scenkę i od razu znasz znaczenie!'
    ],
    task: {
      prompt: 'Z jakich dwóch kroków składa się metoda słów-kluczy w nauce angielskiego?',
      options: [
        'Most fonetyczny (brzmienie) + żywa scenka ze znaczeniem',
        'Przepisywanie słówka 100 razy w zeszycie',
        'Czekanie, aż słówko samo wejdzie do głowy',
        'Słuchanie nagrań przez sen'
      ],
      correct: 0,
      hint: 'Dźwiękowy most i wyobraźnia to klucz do sukcesu!'
    }
  },
  {
    id: 'words-2',
    title: 'Dźwiękowy bliźniak',
    subtitle: 'Jak brzmi angielskie „mushroom”?',
    desc: 'Uczymy się szukać polskich słów brzmiących jak angielski wyraz.',
    speech: 'Posłuchaj dźwięków! Każde angielskie słówko ma w języku polskim swojego śmiesznego bliźniaka!',
    theory: [
      'Krok 1 w praktyce: szukamy dźwiękowego bliźniaka.',
      'Spójrz na angielskie słówko „mushroom” (grzyb).',
      'Powiedz je na głos: „masz-rum”.',
      'Brzmi dokładnie jak polskie pytanie: „MASZ RUM?!” 🏴‍☠️',
      'Dźwiękowy bliźniak nie musi być w 100% idealny – wystarczy, że da Twojemu umysłowi wesoły punkt zaczepienia!'
    ],
    task: {
      prompt: 'Jaki polski zwrot brzmi niemal identycznie jak angielskie słówko „mushroom”?',
      options: ['MASZ RUM', 'MASZ SER', 'MYSZ W DOMU', 'MISKA ZUPY'],
      correct: 0,
      hint: 'Powiedz mushroom szybko na głos: masz-rum!'
    }
  },
  {
    id: 'words-3',
    title: 'Wybuchowa scenka',
    subtitle: 'Łączenie mostu ze znaczeniem',
    desc: 'Sam dźwięk nie wystarczy – musisz połączyć go z tym, co dane słówko oznacza.',
    speech: 'A teraz łączymy dźwięk ze znaczeniem! Zobacz tego pirackiego prawdziwka w swojej wyobraźni!',
    theory: [
      'Mamy już most „MASZ RUM” i wiemy, że mushroom oznacza GRZYB.',
      'Teraz najważniejszy moment – zrób z tego film przed oczami:',
      'Wielki leśny prawdziwek z wąsami i w trójkątnym kapeluszu pirata staje przed Tobą, uderza pięścią w stół i groźnie krzyczy: „MASZ RUM W BUTELCE?!”',
      'Poczuj zapach lasu i zobacz tego śmiesznego grzyba.',
      'Teraz już nigdy w życiu nie zapomnisz słowa mushroom!'
    ],
    task: {
      prompt: 'Co oznacza angielskie słówko „mushroom”?',
      options: ['Grzyb', 'Rum', 'Pirat', 'Butelka'],
      correct: 0,
      hint: 'Pamiętasz wielkiego leśnego prawdziwka żądającego rumu?'
    }
  },
  {
    id: 'words-4',
    title: 'Angielski w mig',
    subtitle: 'Candle, Feather, Pillow',
    desc: 'Trzy nowe angielskie słówka zapamiętane w minutę.',
    speech: 'Kraaa! Zobacz, jak w minutę zapamiętasz trzy angielskie słówka na klasówkę z angielskiego!',
    theory: [
      'Ćwiczymy kolejne angielskie mosty dźwiękowe:',
      '• CANDLE (świeca) → KUNDEL: wesoły kundelek biegnie z płonącą świecą na ogonie! 🕯️',
      '• FEATHER (pióro) → SWETER: z wełnianego swetra nagle wyrastają wielkie gęsie pióra! 🪶',
      '• PILLOW (poduszka) → PIŁA: drwal próbuje ściąć wielkie drzewo miękką puchową poduszką! 🛏️'
    ],
    task: {
      prompt: 'KUNDEL niosący świecę na ogonie pomaga zapamiętać słówko:',
      options: ['candle (świeca)', 'feather (pióro)', 'pillow (poduszka)', 'mushroom (grzyb)'],
      correct: 0,
      hint: 'Kundel = Candle!'
    }
  },
  {
    id: 'words-5',
    title: 'Kolejne perełki: Shark, Beetle, Fork',
    subtitle: 'Rekin Szarik, Chrząszcze The Beatles i Foka z widelcem',
    desc: 'Błyskawiczne skojarzenia dla rekinów, chrząszczy i widelców po angielsku!',
    speech: 'Zobacz, jak wesołe są angielskie skojarzenia! Każde słówko to gotowa historyjka!',
    theory: [
      'Poznajemy kolejne 3 angielskie perełki z naszej bogatej puli ponad 100 wyrazów:',
      '• SHARK (rekin) → SZARIK: groźny rekin w wodzie macha przyjaźnie ogonem i szczeka jak pies Szarik! 🦈',
      '• BEETLE (chrząszcz) → BITELSI: cztery chrząszcze w garniturach grają rocka jak zespół The Beatles! 🪲',
      '• FORK (widelec) → FOKA: cyrkowa foka na plaży żongluje na czubku nosa wielkim widelcem! 🍴'
    ],
    task: {
      prompt: 'FOKA żonglująca na nosie widelcem pomaga zapamiętać angielskie słowo:',
      options: ['fork (widelec)', 'shark (rekin)', 'beetle (chrząszcz)', 'candle (świeca)'],
      correct: 0,
      hint: 'Foka żongluje widelcem = fork!'
    }
  },
  {
    id: 'words-6',
    title: 'Egzamin Poligloty',
    subtitle: 'Wielki sprawdzian angielskich mostów',
    desc: 'Czas na ostateczny test u Papużki Poli! Błyskawiczne tłumaczenie z angielskiego.',
    speech: 'Wielki finał u Papużki Poli! Z tą techniką masz w pamięci ponad 100 angielskich słówek!',
    theory: [
      'Brawo! Masz w ręku najpotężniejsze narzędzie do nauki języka angielskiego na świecie.',
      'Gdy w szkole, filmie czy w podróży spotkasz nowe angielskie słówko:',
      '1. Usłysz jego dźwięk i znajdź polskiego bliźniaka.',
      '2. Stwórz wyrazistą, zabawną scenkę.',
      '3. Ciesz się swobodną znajomością angielskiego bez stresu i zakuwania! 🦜🇬🇧'
    ],
    task: {
      prompt: 'Co oznacza angielskie słówko „shark” (most: pies SZARIK machający ogonem w płetwie rekina)?',
      options: ['Rekin', 'Pies', 'Statek', 'Woda'],
      correct: 0,
      hint: 'Szarik jako rekin w oceanie!'
    }
  }
];








function mountMap(root, { nav }) {
  const parrot = createParrot({ size: 'md' });
  const prog = store.get('words.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/words/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, '3x szybsza nauka słówek z języka angielskiego! Zamiast wkuwać 50 razy, tworzysz jeden polski most dźwiękowy i pamiętasz znaczenie od razu!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/words', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦜 ', h('span', { class: 'grad' }, 'Szkoła Językowa Papużki Poli')),
    h('p', { class: 'lead' }, 'Poznaj metodę słów-kluczy i zapamiętuj obce słówka w locie bez zakuwania.'),
    parrot.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    parrot.say(
      doneCount === 0
        ? 'A kysz, nudne powtórki! Jestem Papużka Pola 🦜 Pokażę Ci, jak zapamiętywać słówka w ułamku sekundy!'
        : `Brawo! ${doneCount}/${LESSONS.length} lekcji za nami! Lećmy dalej!`,
      'happy'
    );
  }, 200);

  return () => parrot.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const parrot = createParrot({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🦜 Papuzie odkrycie: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🦜 Podpowiedź Poli');
  hintBtn.addEventListener('click', () => {
    parrot.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/words/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    parrot.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      parrot.setMood('cheer', 2500);
      parrot.say('Kraaa! Dokładnie tak! Twoja wyobraźnia działa cuda!', 'cheer');

      const prog = store.get('words.train', {});
      prog[les.id] = 3;
      store.set('words.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono kurs! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/words/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/words';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      parrot.setMood('sad', 1800);
      parrot.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    parrot.say(les.speech || `Lekcja ${index + 1}: ${les.subtitle}. Posłuchaj tego słówka!`, 'happy');
  }, 250);

  return () => parrot.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const parrot = createParrot({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'sprint' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = (modeId === 'translate' || modeId === 'bridge') ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'sprint' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/words', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    parrot.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Kraaa! Poliglota w pełnej krasie! 🦜✨',
    'Most fonetyczny połączył słowa idealnie! 🌉⭐',
    'Mówisz jak rodowity mieszkaniec! 🗣️🎉',
    'Słowo wyryte w pamięci na zawsze! 📖💎',
    'Bez pudła! Języki świata stoją przed Tobą otworem! 🌍🎯',
    'Pola śpiewa z zachwytu! Co za słuch i pamięć! 🎶🦜',
    'Genialne skojarzenie! Pędzimy do kolejnych słówek! 🚀💡'
  ];
  function cheerParrot(c) {
    if (c % 5 === 0 && c > 0) {
      parrot.say(`Niewiarygodne combo x${c}! Pola bije skrzydłami w piruecie! 🦜👑✨`, 'cheer', { revert: 1800 });
      parrot.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      parrot.say(`Combo x${c}! Twój słownik pęka w szwach! 🦜🎶`, 'cheer', { revert: 1400 });
      parrot.hop?.();
    } else {
      parrot.hop?.();
      parrot.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`words.best.${modeId}`, 0);
    if (score > prev) store.set(`words.best.${modeId}`, score);
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    timeLeft = modeId === 'sprint' ? 30 : 0;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timerInterval) clearInterval(timerInterval);
    if (modeId === 'sprint') startTimer();
    parrot.setMood('happy');
    parrot.say('Zaczynamy od nowa! Poliglotyczna przygoda trwa! 🦜✨', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    parrot.setMood('cheer', 3000);
    parrot.say(`Koniec gry! Twój wynik: ${score} pkt! Pola jest z Ciebie dumna! 🦜`, 'cheer');

    const best = store.get(`words.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/words' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Rewelacyjny wynik!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function handleWrong(solutionText) {
    sfx.wrong();
    combo = 0;
    if (modeId === 'polyglot') {
      gameOver();
      return;
    }
    lives--;
    updateLives();
    if (lives <= 0) {
      gameOver();
    } else {
      parrot.setMood('sad', 1200);
      parrot.say(`${solutionText} Pozostało szans: ${lives} 🦜`, 'think', { revert: 2600 });
      setTimeout(nextRound, 1200);
    }
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    const target = VOCAB[rand(0, VOCAB.length - 1)];
    const others = VOCAB.filter(v => v.id !== target.id);
    const wrong = shuffle(others).slice(0, 3);

    if (modeId === 'translate' || modeId === 'sprint' || modeId === 'polyglot') {
      const choices = shuffle([target, ...wrong]);
      const card = h('div', { class: 'vocab-card' },
        h('span', { class: 'vocab-emoji' }, target.emoji),
        h('h2', { class: 'vocab-word' }, target.foreign),
        h('span', { class: 'vocab-lang' }, `Język: ${target.lang}`),
        round <= 2 && modeId === 'translate' ? h('p', { class: 'muted' }, `Wymowa zbliżona do: „${target.bridge}”`) : null
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.meaning);
        btn.addEventListener('click', () => {
          if (c.id === target.id) {
            sfx.success();
            score += 10 + combo * 2;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerParrot(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            if (modeId === 'sprint') {
              sfx.wrong();
              setTimeout(nextRound, 300);
            } else {
              handleWrong(`${target.foreign} to ${target.meaning} (most: ${target.bridge})!`);
            }
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'bridge') {
      const choices = shuffle([target, ...wrong]);
      const card = h('div', { class: 'vocab-card' },
        h('span', { class: 'vocab-emoji' }, target.emoji),
        h('h2', { class: 'vocab-word' }, target.foreign),
        h('p', {}, `Znaczenie: `, h('b', {}, target.meaning)),
        h('p', { class: 'muted' }, 'Jaki jest polski most fonetyczny (brzmieniowy) dla tego słowa?')
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.bridge);
        btn.addEventListener('click', () => {
          if (c.id === target.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerParrot(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Mostem dla ${target.foreign} jest: ${target.bridge}!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  if (modeId === 'sprint') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    parrot.destroy();
  };
}










function mountMenu(root, { nav }) {
  const parrot = createParrot({ size: 'md' });
  const prog = store.get('words.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/words/train' : `#/words/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦜 Szkolenie z Papużką Polą'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę słówek' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · metoda słów-kluczy · ponad 100 angielskich słówek w locie`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/words/train' }, 'Zobacz mapę lekcji →');

  const modeCards = MODES.map(m => {
    const best = store.get(`words.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/words/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🦜 ', h('span', { class: 'grad' }, 'Słówka i języki obce')),
        h('p', { class: 'lead' }, 'Naucz się obcych języków bez zkuwania. Twórz dźwiękowe mosty i żywe sceny!')
      )
    ),
    parrot.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Kraaa! Jestem Papużka Pola 🦜 Pokażę Ci, jak zapamiętywać słówka w 3 sekundy!'
    : done < LESSONS.length
      ? `Zrobiliśmy ${done} z ${LESSONS.length} lekcji! Lecimy dalej z językami?`
      : 'Znasz już metodę słów-kluczy jak prawdziwy poliglota! Wybierz tryb gry! 🏆';

  setTimeout(() => { parrot.say(greet, 'happy'); }, 300);
  return () => parrot.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- CARDS GAME MODULE --- */
  const cardsGame = (function() {
    const SUITS = [
  { id: 'spades', symbol: '♠', name: 'Pik', color: '#1e293b', theme: 'Noc / Cień / Iluzja' },
  { id: 'hearts', symbol: '♥', name: 'Kier', color: '#e11d48', theme: 'Ogień / Pasja / Rycerze' },
  { id: 'diamonds', symbol: '♦', name: 'Karo', color: '#ea580c', theme: 'Złoto / Klejnoty / Bogactwo' },
  { id: 'clubs', symbol: '♣', name: 'Trefl', color: '#16a34a', theme: 'Natura / Las / Tajemnica' }
];

const CARDS_PAO = [
  {
    id: 'as_spades',
    rank: 'A',
    suit: 'spades',
    name: 'As Pik',
    person: 'Szop Magik 🦝',
    action: 'wyciąga z cylindra',
    object: 'świecący cylinder 🎩',
    full: 'As Pik to Szop Magik wyciągający lśniący cylinder!'
  },
  {
    id: 'k_hearts',
    rank: 'K',
    suit: 'hearts',
    name: 'Król Kier',
    person: 'Król Artur 👑',
    action: 'wyciąga ze skały',
    object: 'złoty miecz Excalibur ⚔️',
    full: 'Król Kier to Król Artur wyciągający złoty miecz Excalibur!'
  },
  {
    id: 'q_diamonds',
    rank: 'Q',
    suit: 'diamonds',
    name: 'Dama Karo',
    person: 'Królowa Kleopatra 👸',
    action: 'rzuca w dal',
    object: 'ogromny błękitny diament 💎',
    full: 'Dama Karo to Kleopatra rzucająca ogromnym błękitnym diamentem!'
  },
  {
    id: 'j_clubs',
    rank: 'J',
    suit: 'clubs',
    name: 'Walet Trefl',
    person: 'Robin Hood 🏹',
    action: 'napina i wystrzeliwuje',
    object: 'dębowy łuk ze strzałą 🎯',
    full: 'Walet Trefl to Robin Hood strzelający z dębowego łuku!'
  },
  {
    id: '10_spades',
    rank: '10',
    suit: 'spades',
    name: '10 Pik',
    person: 'Mroczny Batman 🦇',
    action: 'szybuje i rzuca',
    object: 'czarny batarang ⚡',
    full: '10 Pik to Batman rzucający czarny batarang!'
  },
  {
    id: '7_hearts',
    rank: '7',
    suit: 'hearts',
    name: '7 Kier',
    person: 'Agent 007 🍸',
    action: 'wznosi toast',
    object: 'kieliszek złotego martini 🍸',
    full: '7 Kier to James Bond wznoszący toast kieliszkiem martini!'
  },
  {
    id: '8_diamonds',
    rank: '8',
    suit: 'diamonds',
    name: '8 Karo',
    person: 'Pirat z Karaibów 🏴‍☠️',
    action: 'otwiera z hukiem',
    object: 'skrzynia ze złotymi dukatami 🪙',
    full: '8 Karo to Pirat otwierający skrzynię ze złotymi dukatami!'
  },
  {
    id: '9_clubs',
    rank: '9',
    suit: 'clubs',
    name: '9 Trefl',
    person: 'Mądry Druid 🧙',
    action: 'uderza o ziemię',
    object: 'magiczna laska z kryształem 🪄',
    full: '9 Trefl to Druid uderzający o ziemię magiczną laską!'
  }
];

function getCardSvg(card) {
  const suitMeta = SUITS.find(s => s.id === card.suit) || SUITS[0];
  return `
  <div class="playing-card" style="color: ${suitMeta.color};">
    <div class="pc-corner top-left">
      <span class="pc-rank">${card.rank}</span>
      <span class="pc-suit">${suitMeta.symbol}</span>
    </div>
    <div class="pc-center">
      <span class="pc-big-symbol">${suitMeta.symbol}</span>
    </div>
    <div class="pc-corner bottom-right">
      <span class="pc-rank">${card.rank}</span>
      <span class="pc-suit">${suitMeta.symbol}</span>
    </div>
  </div>`;
}


const MODES = [
  {
    id: 'sequence',
    name: 'Sekwencja magika',
    emoji: '🎴',
    desc: 'Szop Magik tasuje i odkrywa karty. Zapamiętaj ich kolejność i odtwórz bezbłędnie!',
    color: ['#ff416c', '#ff4b2b'],
    badge: 'Pamięć'
  },
  {
    id: 'pao',
    name: 'Rozpoznaj PAO',
    emoji: '🎭',
    desc: 'Spójrz na kartę i wskaż jej postać, unikalną akcję lub rekwizyt.',
    color: ['#7f00ff', '#e100ff'],
    badge: 'Kojarzenie'
  },
  {
    id: 'missing',
    name: 'Zaginiona karta',
    emoji: '❓',
    desc: 'Cztery karty leżą na stole. Szop zakrywa jedną z nich – zgadniesz, która zniknęła?',
    color: ['#00c6ff', '#0072ff'],
    badge: 'Koncentracja'
  },
  {
    id: 'deck_rush',
    name: 'Gorączka talii',
    emoji: '⚡',
    desc: '30 sekund! Błyskawiczne odczytywanie kart i ich znaczeń w zawrotnym tempie.',
    color: ['#f7971e', '#ffd200'],
    badge: 'Na czas'
  }
];




const LESSONS = [
  {
    id: 'cards-1',
    title: 'Cztery żywioły talii',
    subtitle: 'Pik, Kier, Karo i Trefl',
    desc: 'Poznaj cztery kolory talii i ich wizualne motywy przewodnie.',
    speech: 'Abrakadabra! Cześć, jestem Szop Magik! 🦝 Czy wiesz, jak iluzjoniści pamiętają całą talię kart w kilkadziesiąt sekund? Zamieniają nudne figury w superbohaterów i kręcą z nich bajkowy film! Pokażę Ci, jak to zrobić!',
    theory: [
      'Po co uczyć się zapamiętywania kart? To nie tylko wspaniała sztuczka, którą zachwycisz kolegów w szkole i rodzinę przy stole!',
      'System PAO (karty i sekwencje) to najpotężniejsza technika do zapamiętywania długich ciągów kolejnych kroków, przepisów, procedur i list!',
      'Zaczynamy od 4 magicznych żywiołów talii:',
      '• PIK (♠) – tajemniczy, czarny świat magów, iluzjonistów i nocy.',
      '• KIER (♥) – czerwone serca, dzielni rycerze, królowie, ogień i przygoda.',
      '• KARO (♦) – diamenty, złoto, bogactwo, skrzynie skarbów i piraci.',
      '• TREFL (♣) – zielone liście, las, natura, druidzi i leśni łucznicy.',
      'Gdy widzisz kolor, od razu wiesz, do jakiego świata należy karta!'
    ],
    task: {
      prompt: 'Jaki motyw wizualny odpowiada kolorowi KARO (♦)?',
      options: ['Diamenty, złoto i skarby', 'Noc i cienie', 'Las i koniczyna', 'Śnieg i lód'],
      correct: 0,
      hint: 'Karo to kształt diamentu – kojarzy się z bogactwem i skarbami!'
    }
  },
  {
    id: 'cards-2',
    title: 'Karty dworskie',
    subtitle: 'Walet, Dama i Król',
    desc: 'Figury to najpotężniejsze persony w talii. Każda ma swoją osobowość.',
    speech: 'Oto nasi bohaterowie! Każda figura zamienia się w żywą postać z bajki!',
    theory: [
      'Karty dworskie najłatwiej zamienić na wyrazistych bohaterów:',
      '• Król Kier (K♥) → Król Artur w złotej koronie ze świecącym mieczem Excalibur 👑',
      '• Dama Karo (Q♦) → Królowa Kleopatra rzucająca lśniącym błękitnym diamentem 💎',
      '• Walet Trefl (J♣) → Robin Hood strzelający z potężnego dębowego łuku 🏹',
      '• As Pik (A♠) → Szop Magik wyciągający lśniący cylinder z kapelusza 🦝',
      'Zamiast płaskiego kartonika widzisz żywą postać jak z komiksu!'
    ],
    task: {
      prompt: 'Kim jest Król Kier (K♥) w naszym systemie kart?',
      options: ['Król Artur ze złotym mieczem Excalibur', 'Szop Magik z cylindrem', 'Robin Hood z łukiem', 'Batman z batarangiem'],
      correct: 0,
      hint: 'Kier to czerwone serce i rycerski Król Artur!'
    }
  },
  {
    id: 'cards-3',
    title: 'Filozofia PAO',
    subtitle: 'Postać, Akcja i Obiekt',
    desc: 'Metoda stosowana przez rekordzistów Guinnessa do zapamiętania 52 kart w 20 sekund!',
    speech: 'Sekret rekordzistów Guinnessa: formuła PAO! Trzy karty zamieniamy w jedną bajkę!',
    theory: [
      'System PAO (Person - Action - Object) przypisuje do każdej karty:',
      '1. POSTAĆ (kto to jest?)',
      '2. AKCJĘ (co robi?)',
      '3. OBIEKT (czym się bawi lub czym rzuca?)',
      'Dzięki temu jedna karta daje postać, druga jej akcję, a trzecia przedmiot.',
      'To pozwala skompresować aż 3 karty w JEDEN zabawny, filmowy kadr w głowie!'
    ],
    task: {
      prompt: 'Co oznacza skrót metody PAO?',
      options: ['Person – Action – Object (Postać – Akcja – Obiekt)', 'Play – Ace – Over', 'Power – Agility – Order', 'Pakiet – Atut – Opcja'],
      correct: 0,
      hint: 'Pamiętasz: Postać wykonuje Akcję z Obiektem!'
    }
  },
  {
    id: 'cards-4',
    title: 'Łączenie 2 kart w 1 scenę',
    subtitle: 'Fuzja Króla Artura i Kleopatry',
    desc: 'Jak zapamiętać parę kart w ułamku sekundy?',
    speech: 'Połączmy dwie karty w jedną scenę! Król Artur i Kleopatra robią coś szalonego!',
    theory: [
      'Wyobraź sobie parę kart: pierwsza to Król Kier (K♥), a druga to Dama Karo (Q♦).',
      'Bierzemy POSTAĆ z pierwszej karty: Król Artur 👑',
      'I bierzemy AKCJĘ + OBIEKT z drugiej karty: rzuca błękitnym diamentem 💎!',
      'Scena w głowie: Król Artur bierze zamach i z całej siły ciska wielkim diamentem w dal!',
      'Gdy widzisz tę scenę przed oczami, natychmiast odczytujesz: K♥ oraz Q♦!'
    ],
    task: {
      prompt: 'Jakie karty koduje scena: „Król Artur rzuca wielkim błękitnym diamentem”?',
      options: ['Król Kier (K♥) + Dama Karo (Q♦)', 'As Pik + Walet Trefl', '10 Pik + 7 Kier', 'Dama Karo + Król Trefl'],
      correct: 0,
      hint: 'Król Artur (K♥) wykonuje akcję diamentu Kleopatry (Q♦)!'
    }
  },
  {
    id: 'cards-5',
    title: 'Praktyka: Rozdanie pokerowe',
    subtitle: 'Zapamiętaj 3 karty na stole',
    desc: 'Sprawdź swoje umiejętności na stole do gry.',
    speech: 'Prawdziwe rozdanie na stole! Trzy karty zapamiętane w 3 sekundy!',
    theory: [
      'Na stole lądują 3 karty: As Pik (A♠), Walet Trefl (J♣) i 7 Kier (7♥).',
      '• A♠ = Szop Magik (Postać)',
      '• J♣ = napina i strzela z dębowego łuku (Akcja)',
      '• 7♥ = kieliszek złotego napoju (Obiekt)',
      'Zobacz to: Szop Magik bierze wielki łuk i z uśmiechem wystrzeliwuje z niego kieliszek niczym strzałę!',
      'Śmieszne, wyraziste i nie do zapomnienia!'
    ],
    task: {
      prompt: 'Kto strzelał z łuku w naszej scenie (reprezentując Asa Pik)?',
      options: ['Szop Magik', 'Batman', 'Król Artur', 'Druid'],
      correct: 0,
      hint: 'As Pik to nasz uroczy Szop Magik!'
    }
  },
  {
    id: 'cards-6',
    title: 'Egzamin Iluzjonisty',
    subtitle: 'Ostateczny test Szopa Magika',
    desc: 'Opanowałeś tajniki talii kart. Czas na certyfikat iluzjonisty!',
    speech: 'Wielki egzamin iluzjonisty! Twoja pamięć jest teraz szybsza niż zręczne dłonie magika!',
    theory: [
      'Brawo! Znasz już sekrety pamięciowych iluzjonistów:',
      '1. 4 żywioły kolorów talii.',
      '2. Postacie dworskie.',
      '3. Formuła PAO (Postać - Akcja - Obiekt).',
      'Teraz jesteś gotowy na każdą rozgrywkę z przyjaciółmi i grę swobodną!'
    ],
    task: {
      prompt: 'Co wyciąga Szop Magik z cylindra na karcie As Pik?',
      options: ['Świecący cylinder / magiczny rekwizyt', 'Pocisk armatni', 'Kawałek pizzy', 'Szklaną kulę'],
      correct: 0,
      hint: 'Magik zawsze żongluje cylindrem!'
    }
  }
];








function mountMap(root, { nav }) {
  const raccoon = createRaccoon({ size: 'md' });
  const prog = store.get('cards.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/cards/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Elitarny trening skupienia, uwagi i pamięci roboczej stosowany przez arcymistrzów. Zwiększa koncentrację przy nauce, pozwala dominować w grach karcianych i uczy kodowania złożonych procedur!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/cards', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦝 ', h('span', { class: 'grad' }, 'Szkoła Magii Kart')),
    h('p', { class: 'lead' }, 'Poznaj technikę PAO i zapamiętuj całe talie kart z Szopem Magikiem.'),
    raccoon.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    raccoon.say(
      doneCount === 0
        ? 'Tadaam! Jestem Szop Magik 🦝 Talia 52 kart w głowie to żaden problem, to czysta iluzja!'
        : `Świetny postęp! ${doneCount}/${LESSONS.length} lekcji za nami! Tasujemy dalej!`,
      'happy'
    );
  }, 200);

  return () => raccoon.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const raccoon = createRaccoon({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🦝 Magiczna sztuczka Szopa: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🦝 Podpowiedź Szopa');
  hintBtn.addEventListener('click', () => {
    raccoon.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/cards/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    raccoon.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      raccoon.setMood('cheer', 2500);
      raccoon.say('Brawo! Prawdziwy mistrz iluzji!', 'cheer');

      const prog = store.get('cards.train', {});
      prog[les.id] = 3;
      store.set('cards.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkołę magii! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/cards/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/cards';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      raccoon.setMood('sad', 1800);
      raccoon.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    raccoon.say(les.speech || `Abrakadabra! Lekcja ${index + 1}: ${les.subtitle}. Spójrz na magiczną sztuczkę!`, 'happy');
  }, 250);

  return () => raccoon.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const raccoon = createRaccoon({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'deck_rush' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = (modeId === 'pao' || modeId === 'missing') ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'deck_rush' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/cards', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    raccoon.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Abrakadabra! Czysta iluzja pamięci! 🦝✨',
    'Karta w garści! As wyciągnięty z rękawa! ♠️🎩',
    'Magia PAO działa bezbłędnie! Postać i akcja w punkt! 🪄⭐',
    'Oklaski na sali! Szop Magik kłania się z kapeluszem! 👏🃏',
    'Talia kart nie ma przed Tobą tajemnic! 👑💎',
    'Niezwykły pokaz zręczności umysłu! Płyniemy dalej! 🚀🦝'
  ];
  function cheerRaccoon(c) {
    if (c % 5 === 0 && c > 0) {
      raccoon.say(`Potężne combo x${c}! Szop kręci cylinder w piruecie! 🦝🎩✨`, 'cheer', { revert: 1800 });
      raccoon.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      raccoon.say(`Combo x${c}! Cała talia drży przed Twoją pamięcią! 🦝🪄`, 'cheer', { revert: 1400 });
      raccoon.hop?.();
    } else {
      raccoon.hop?.();
      raccoon.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`cards.best.${modeId}`, 0);
    if (score > prev) store.set(`cards.best.${modeId}`, score);
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    timeLeft = modeId === 'deck_rush' ? 30 : 0;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timerInterval) clearInterval(timerInterval);
    if (modeId === 'deck_rush') startTimer();
    raccoon.setMood('happy');
    raccoon.say('Zaczynamy od nowa! Pokaż mistrzowską pamięć! 🦝✨', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    raccoon.setMood('cheer', 3000);
    raccoon.say(`Brawo! Koniec pokazu magii! Twój wynik: ${score} pkt! 🦝`, 'cheer');

    const best = store.get(`cards.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/cards' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Pokaz zakończony sukcesem!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  async function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'sequence') {
      const seqLen = Math.min(10, 2 + Math.floor(round / 2));
      const sequence = shuffle([...CARDS_PAO]).slice(0, seqLen);

      const previewBox = h('div', { class: 'cards-preview-box' },
        h('h3', {}, `Zapamiętaj kolejność ${seqLen} kart!`),
        h('div', { class: 'cards-row' }, sequence.map(c => h('div', { html: getCardSvg(c) })))
      );
      playArea.append(previewBox);

      await sleep(1800 + seqLen * 500);
      if (isGameOver) return;
      playArea.innerHTML = '';

      let pickedIndex = 0;
      const pickState = h('div', { class: 'pick-state' },
        h('h3', {}, `Wybierz kartę nr `, h('span', { class: 'grad' }, `${pickedIndex + 1}`), ` z ${seqLen}:`),
        h('div', { class: 'selected-cards-row' })
      );

      const allChoices = shuffle([...sequence]);
      const choicesGrid = h('div', { class: 'cards-choices-grid' });
      allChoices.forEach(card => {
        const btn = h('button', { class: 'card-choice-btn', type: 'button', html: getCardSvg(card) });
        btn.addEventListener('click', () => {
          if (card.id === sequence[pickedIndex].id) {
            sfx.pop();
            btn.disabled = true;
            btn.style.opacity = '0.3';
            pickState.querySelector('.selected-cards-row').append(h('div', { html: getCardSvg(card) }));
            pickedIndex++;
            if (pickedIndex >= seqLen) {
              sfx.success();
              score += seqLen * 10 + combo * 2;
              combo++;
              round++;
              scoreEl.textContent = `${score}`;
              roundEl.textContent = `${round}`;
              cheerRaccoon(combo);
              nextRound();
            } else {
              pickState.querySelector('span.grad').textContent = `${pickedIndex + 1}`;
            }
          } else {
            sfx.wrong();
            gameOver();
          }
        });
        choicesGrid.append(btn);
      });

      playArea.append(pickState, choicesGrid);

    } else if (modeId === 'pao') {
      const target = CARDS_PAO[rand(0, CARDS_PAO.length - 1)];
      const others = CARDS_PAO.filter(c => c.id !== target.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([target, ...wrong]);

      const card = h('div', { class: 'cards-pao-card' },
        h('div', { class: 'target-card-wrap', html: getCardSvg(target) }),
        h('p', {}, `Jaka postać i akcja odpowiada tej karcie?`)
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.person} – ${c.action}`);
        btn.addEventListener('click', () => {
          if (c.id === target.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerRaccoon(combo);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            lives--;
            updateLives();
            btn.classList.add('wrong');
            if (lives <= 0) {
              gameOver();
            } else {
              raccoon.setMood('sad', 1200);
              raccoon.say(`Ojej! ${target.name} to: ${target.person} (${target.action})! Masz jeszcze ${lives} szanse. 🦝`, 'think', { revert: 2600 });
              setTimeout(nextRound, 1200);
            }
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);

    } else if (modeId === 'missing') {
      const cardCount = Math.min(6, 3 + Math.floor(round / 3));
      const poolCards = shuffle([...CARDS_PAO]).slice(0, cardCount);
      const hiddenIdx = rand(0, poolCards.length - 1);
      const hiddenCard = poolCards[hiddenIdx];

      const previewBox = h('div', { class: 'cards-preview-box' },
        h('h3', {}, `Zapamiętaj te ${cardCount} karty!`),
        h('div', { class: 'cards-row' }, poolCards.map(c => h('div', { html: getCardSvg(c) })))
      );
      playArea.append(previewBox);

      await sleep(1800 + cardCount * 400);
      if (isGameOver) return;
      playArea.innerHTML = '';

      const coveredRow = h('div', { class: 'cards-row' },
        poolCards.map((c, i) => i === hiddenIdx
          ? h('div', { class: 'playing-card card-back' }, '❓')
          : h('div', { html: getCardSvg(c) })
        )
      );

      const question = h('div', { class: 'missing-q' },
        h('h3', {}, 'Która karta została zakryta?'),
        coveredRow
      );

      const others = CARDS_PAO.filter(c => c.id !== hiddenCard.id);
      const choices = shuffle([hiddenCard, ...shuffle(others).slice(0, 3)]);
      const opts = h('div', { class: 'opt-grid' });

      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.name} (${c.person})`);
        btn.addEventListener('click', () => {
          if (c.id === hiddenCard.id) {
            sfx.success();
            score += 20 + combo * 4;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerRaccoon(combo);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            lives--;
            updateLives();
            btn.classList.add('wrong');
            if (lives <= 0) {
              gameOver();
            } else {
              raccoon.setMood('sad', 1200);
              raccoon.say(`Zakrytą kartą był ${hiddenCard.name}! Zostały Ci ${lives} szanse. 🦝`, 'think', { revert: 2600 });
              setTimeout(nextRound, 1200);
            }
          }
        });
        opts.append(btn);
      });

      playArea.append(question, opts);

    } else if (modeId === 'deck_rush') {
      const target = CARDS_PAO[rand(0, CARDS_PAO.length - 1)];
      const others = CARDS_PAO.filter(c => c.id !== target.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([target, ...wrong]);

      const card = h('div', { class: 'cards-pao-card' },
        h('div', { class: 'target-card-wrap', html: getCardSvg(target) })
      );

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === target.id) {
            sfx.pop();
            score += 10;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            nextRound();
          } else {
            sfx.wrong();
            btn.classList.add('wrong');
            setTimeout(nextRound, 300);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  if (modeId === 'deck_rush') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    raccoon.destroy();
  };
}










function mountMenu(root, { nav }) {
  const raccoon = createRaccoon({ size: 'md' });
  const prog = store.get('cards.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/cards/train' : `#/cards/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦝 Szkoła Magii Szopa Magika'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę kart' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · żywioły talii · metoda PAO · zapamiętywanie rozdań`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/cards/train' }, 'Zobacz mapę lekcji magii →');

  const modeCards = MODES.map(m => {
    const best = store.get(`cards.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/cards/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🦝 ', h('span', { class: 'grad' }, 'Karty do gry')),
        h('p', { class: 'lead' }, 'Cała talia 52 kart w głowie! Poznaj system PAO stosowany przez mistrzów iluzji i pamięci.')
      )
    ),
    raccoon.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Tadaam! Jestem Szop Magik 🦝 Pokażę Ci, jak zapamiętać dowolny układ kart!'
    : done < LESSONS.length
      ? `Masz za sobą ${done} z ${LESSONS.length} lekcji. Dokończmy szkolenie iluzji!`
      : 'Twoja pamięć kart jest magiczna! Czas na grę swobodną! 🏆';

  setTimeout(() => { raccoon.say(greet, 'happy'); }, 300);
  return () => raccoon.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- LINK GAME MODULE --- */
  const linkGame = (function() {
    const LINK_ITEMS = [
  { id: 'li1', name: 'Parasol', emoji: '☂️', storyAction: 'otwiera się z hukiem i z impetem taranuje soczystego...' },
  { id: 'li2', name: 'Arbuz', emoji: '🍉', storyAction: 'eksploduje fontanną słodkiego soku, na którym ślizga się...' },
  { id: 'li3', name: 'Rower', emoji: '🚲', storyAction: 'trąbi jak szalony i z łomotem wpada na gigantyczny...' },
  { id: 'li4', name: 'Zegar', emoji: '⏰', storyAction: 'bije na alarm i porywa go wysoko w chmury kolorowy...' },
  { id: 'li5', name: 'Balon', emoji: '🎈', storyAction: 'unosi się w powietrzu i przebija go ostry pustynny...' },
  { id: 'li6', name: 'Kaktus', emoji: '🌵', storyAction: 'w który z głośnym brzękiem uderza grająca rocka...' },
  { id: 'li7', name: 'Gitara', emoji: '🎸', storyAction: 'na której struny skapują z góry zimne, pyszne...' },
  { id: 'li8', name: 'Lody', emoji: '🍦', storyAction: 'w których zamrożony jest wielki, złoty...' },
  { id: 'li9', name: 'Klucz', emoji: '🔑', storyAction: 'który z błyskiem rozświetla silna kieszonkowa...' },
  { id: 'li10', name: 'Latarka', emoji: '🔦', storyAction: 'której snop światła pada na lśniący, drogocenny...' },
  { id: 'li11', name: 'Skarb', emoji: '💎', storyAction: 'którego w jaskini pilnuje potężny, ziejący ogniem...' },
  { id: 'li12', name: 'Smok', emoji: '🐉', storyAction: 'który ryczy i odpala wielką, srebrną...' },
  { id: 'li13', name: 'Rakieta', emoji: '🚀', storyAction: 'która z prędkością światła ląduje na srebrzystym...' },
  { id: 'li14', name: 'Księżyc', emoji: '🌙', storyAction: 'który okazuje się w całości zrobiony z żółtego...' },
  { id: 'li15', name: 'Ser', emoji: '🧀', storyAction: 'w którym wielkie dziury wygryza mała, zwinna...' },
  { id: 'li16', name: 'Mysz', emoji: '🐭', storyAction: 'która ucieka i z impetem skacze na sprężystą...' },
  { id: 'li17', name: 'Trampolina', emoji: '🎪', storyAction: 'która wystrzeliwuje mysz wprost w wielki czekoladowy...' },
  { id: 'li18', name: 'Tort', emoji: '🎂', storyAction: 'na którego samym szczycie płonie woskowa...' },
  { id: 'li19', name: 'Świeca', emoji: '🕯️', storyAction: 'której rozgrzany wosk zastyga w magiczny, błyszczący...' },
  { id: 'li20', name: 'Kryształ', emoji: '🔮', storyAction: 'który w środku odbija cały ten 20-elementowy świat skojarzeń!' }
];


const MODES = [
  {
    id: 'forward',
    name: 'Łańcuch w przód',
    emoji: '⏩',
    desc: 'Podążaj za akcją historii! Wskaż przedmiot, który następuje bezpośrednio po obecnym.',
    color: ['#f83600', '#fe8c00'],
    badge: 'Klasyczny'
  },
  {
    id: 'reverse',
    name: 'Spacer w tył',
    emoji: '⏪',
    desc: 'Prawdziwy test siły Twoich skojarzeń: czy potrafisz cofnąć taśmę filmu w tył?',
    color: ['#b224ef', '#7579ff'],
    badge: 'Pod prąd'
  },
  {
    id: 'missing_link',
    name: 'Brakujące ogniwo',
    emoji: '🔗',
    desc: 'Element A i element C są na ekranie. Jaki przedmiot łączy je pośrodku?',
    color: ['#11998e', '#38ef7d'],
    badge: 'Dedukcja'
  },
  {
    id: 'endless_chain',
    name: 'Nieskończone domino',
    emoji: '🌰',
    desc: 'Wiewiórka Basia dokłada kolejne orzeszki-ogniwa. Jak długi łańcuch zdołasz zbudować?',
    color: ['#ff0844', '#ffb199'],
    badge: 'Nieskończony'
  }
];




const LESSONS = [
  {
    id: 'link-1',
    title: 'Efekt domina: Pierwsze 4 ogniwa',
    subtitle: 'Parasol ☂️ → Arbuz 🍉 → Rower 🚲 → Zegar ⏰',
    desc: 'Odkryj zasadę dynamicznej akcji i zapamiętaj pierwsze 4 ogniwa wielkiego łańcucha.',
    speech: 'Chrup, chrup! Cześć! Jestem Wiewiórka Basia 🐿️ Zawsze wiem, gdzie schowałam każdy orzeszek! Nauczę Cię metody łańcucha skojarzeń – dzięki niej zapamiętasz całą listę aż 20 rzeczy bez ani jednej kartki papieru!',
    theory: [
      'Po co nam ta technika? Ile razy zdarzyło Ci się zapomnieć rzeczy do szkoły, listy zakupów czy punktów prezentacji?',
      'Metoda łańcuchowa łączy myśli w głowie jak klocki domina: gdy popchniesz pierwszy klocek, cała reszta sama wskakuje do pamięci!',
      'ZASADA NR 1: PRAWIDŁO DYNAMICZNEJ AKCJI:',
      'Nasz mózg natychmiast zapomina nudne, spokojne obrazki. Aby coś zapamiętać na zawsze, potrzebujesz ruchu, dźwięku i zderzenia!',
      'Poznajmy pierwsze 4 ogniwa naszego wielkiego łańcucha:',
      '1. PARASOL ☂️ → otwiera się z potężnym hukiem i z impetem taranuje wielkiego soczystego...',
      '2. ARBUZA 🍉 → który eksploduje fontanną słodkiego czerwonego soku, na którym ślizga się...',
      '3. ROWER 🚲 → który trąbi klaksonem i z łomotem wpada na gigantyczny...',
      '4. ZEGAR ⏰ → który dzwoni jak oszalały!'
    ],
    task: {
      prompt: 'W jaki sposób PARASOL łączy się w wyobraźni z ARBUZEM?',
      options: [
        'Parasol wystrzeliwuje i z impetem taranuje arbuza, rozbryzgując czerwony sok!',
        'Parasol leży spokojnie na stole obok arbuza',
        'Parasol i arbuz są czarno-białe',
        'Parasol wisi na wieszaku w sklepie'
      ],
      correct: 0,
      hint: 'Wybierz najbardziej wybuchową, dynamiczną akcję!'
    }
  },
  {
    id: 'link-2',
    title: 'Zmysły i przesada: Ogniwa 4 do 8',
    subtitle: 'Zegar ⏰ → Balon 🎈 → Kaktus 🌵 → Gitara 🎸 → Lody 🍦',
    desc: 'Włączamy dźwięk, dotyk i gigantyczne rozmiary w kolejnych 4 ogniwach.',
    speech: 'Włączamy zmysły! Zobacz, jak zegar porywa balon na kaktus, a gitara gra rocka w lodach!',
    theory: [
      'Aby łańcuch trzymał jak ze stali, używaj zmysłów: dźwięku, dotyku i komicznej przesady!',
      'Dołączamy kolejne 4 ogniwa do naszego pociągu (mamy już 8!):',
      '4. ZEGAR ⏰ → dzwoni na alarm, a z jego tarczy wyskakuje kolorowy...',
      '5. BALON 🎈 → który unosi się wysoko w niebo i z hukiem pęka, bo nabija się na kolczasty...',
      '6. KAKTUS 🌵 → w który z głośnym brzękiem uderza spadająca z nieba elektryczna...',
      '7. GITARA 🎸 → grająca ostre rockowe solo, na której struny z góry skapują wielkie truskawkowe...',
      '8. LODY 🍦 → które zalewają gryf gitary słodkim kremem!'
    ],
    task: {
      prompt: 'Co dzieje się z GITARĄ 🎸 po zderzeniu z kaktusem?',
      options: [
        'Gra rockowe solo, a na jej struny skapują z góry truskawkowe lody 🍦',
        'Zostaje schowana do futerału',
        'Leży cicho w szafie',
        'Zamienia się w drewno'
      ],
      correct: 0,
      hint: 'Gitara gra rocka, a lody skapują na jej struny!'
    }
  },
  {
    id: 'link-3',
    title: 'Zagadka w jaskini: Ogniwa 8 do 12',
    subtitle: 'Lody 🍦 → Klucz 🔑 → Latarka 🔦 → Skarb 💎 → Smok 🐉',
    desc: 'Odkryj tajemnicę klucza, latarki, skarbu i smoka – już 12 ogniw!',
    speech: 'Mamy już 12 ogniw! W lodach tkwi klucz, latarka rozświetla skarb, a w jaskini czuwa smok!',
    theory: [
      'Wielka zaleta łańcucha: skupiasz się ZAWSZE tylko na bieżącej parze ogniw (A i B). Reszta przyjdzie sama!',
      'Budujemy kolejne 4 fascynujące ogniwa:',
      '8. LODY 🍦 → wgryzasz się w lody i nagle zgrzytasz zębami o zamrożony w środku złoty...',
      '9. KLUCZ 🔑 → wyjmujesz klucz, a w ciemności rozświetla go silnym laserowym snopem potężna...',
      '10. LATARKA 🔦 → promień latarki pada w głąb jaskini i ukazuje olbrzymi, błyszczący...',
      '11. SKARB 💎 → pełen diamentów i złota, którego z groźnym rykiem pilnuje zielony...',
      '12. SMOK 🐉 → ziejący kłębami ognia!'
    ],
    task: {
      prompt: 'W jaki sposób KLUCZ 🔑 łączy się w łańcuchu z LATARKĄ 🔦?',
      options: [
        'Złoty klucz rozświetla w ciemności silny snop światła z latarki',
        'Klucz leży w szufladzie, a latarka na biurku',
        'Latarka ma wyjęte baterie',
        'Klucz jest z plastiku'
      ],
      correct: 0,
      hint: 'Latarka oświetla klucz jaskrawym promieniem!'
    }
  },
  {
    id: 'link-4',
    title: 'Kosmiczny lot: Ogniwa 12 do 16',
    subtitle: 'Smok 🐉 → Rakieta 🚀 → Księżyc 🌙 → Ser 🧀 → Mysz 🐭',
    desc: 'Smok odpala rakietę i leci na serowy księżyc! Opanowane aż 16 ogniw.',
    speech: 'Kosmiczny lot u Basi! Smok odpala rakietę i ląduje na księżycu z sera! To już 16 ogniw!',
    theory: [
      'Mózg uwielbia opowieści z rozmachem – im bardziej fantastyczne, tym silniejszy ślad pamięciowy!',
      'Łączymy kolejne 4 ogniwa kosmicznej podróży:',
      '12. SMOK 🐉 → macha skrzydłami, zieje ogniem i z rykiem odpala kosmiczną...',
      '13. RAKIETĘ 🚀 → która z rykiem silników leci prosto w kosmos i ląduje na srebrzystym...',
      '14. KSIĘŻYCU 🌙 → który po wbiciu flagi okazuje się w całości zrobiony ze smakowitego, żółtego...',
      '15. SERA 🧀 → z wielkimi dziurami, w których biega i wygryza kawałki wesoła polna...',
      '16. MYSZ 🐭 → z długim ogonkiem!'
    ],
    task: {
      prompt: 'Co okazuje się po wylądowaniu rakiety na KSIĘŻYCU 🌙?',
      options: [
        'Księżyc jest w całości zrobiony z żółtego sera 🧀, w którym biega mysz!',
        'Księżyc jest zimną skałą bez niczego',
        'Rakieta zawraca na Ziemię',
        'Księżyc gaśnie i znika'
      ],
      correct: 0,
      hint: 'Księżyc z żółtego sera!'
    }
  },
  {
    id: 'link-5',
    title: 'Finałowa piątka i bieg w tył: 16 do 20',
    subtitle: 'Mysz 🐭 → Trampolina 🎪 → Tort 🎂 → Świeca 🕯️ → Kryształ 🔮',
    desc: 'Ostatnie 4 ogniwa i niezwykła umiejętność odtwarzania całego łańcucha od końca!',
    speech: 'Mamy komplet 20 ogniw! A teraz najfajniejsza supermoc: odtworzymy wszystko od tyłu!',
    theory: [
      'Dopinamy ostatnie ogniwa do pełnej liczby DWUDZIESTU:',
      '16. MYSZ 🐭 → wystraszona ucieka i z impetem skacze wysoko na sprężystą...',
      '17. TRAMPOLINĘ 🎪 → która wystrzeliwuje mysz jak z procy prosto w wielki czekoladowy...',
      '18. TORT 🎂 → na którego samym szczycie płonie woskowa...',
      '19. ŚWIECA 🕯️ → której gorący wosk zastyga w magiczny, lśniący...',
      '20. KRYSZTAŁ 🔮 → odbijający w środku całą naszą niesamowitą przygodę!',
      'SUPERMOC: Ten łańcuch działa w obie strony! Cofnij się od końca:',
      'Kryształ ← Świeca ← Tort ← Trampolina ← Mysz... i tak aż do Parasola!'
    ],
    task: {
      prompt: 'Co zastyga z wosku płonącej ŚWIECY 🕯️ na torcie, kończąc 20-elementowy łańcuch?',
      options: [
        'Magiczny, lśniący KRYSZTAŁ 🔮',
        'Zwykły szary kamień',
        'Kawałek drewna',
        'Kropla wody'
      ],
      correct: 0,
      hint: 'Wosk zamienia się w błyszczący kryształ!'
    }
  },
  {
    id: 'link-6',
    title: 'Egzamin Mistrza: Cały łańcuch 20 ogniw!',
    subtitle: 'Kompletna lista 20 skarbów pamięci',
    desc: 'Wielki sprawdzian u Wiewiórki Basi. Sprawdź, jak bez wysiłku znasz całe 20 wyrazów po kolei!',
    speech: 'Wielki Finał u Wiewiórki Basi! Właśnie nauczyłeś się listy 20 wyrazów w idealnym porządku! Jesteś prawdziwym Mistrzem Skojarzeń! 🐿️🏆',
    theory: [
      'Spójrz na to, czego dokonałeś bez ani jednej kartki papieru:',
      '1. Parasol ☂️ → 2. Arbuz 🍉 → 3. Rower 🚲 → 4. Zegar ⏰ → 5. Balon 🎈 →',
      '6. Kaktus 🌵 → 7. Gitara 🎸 → 8. Lody 🍦 → 9. Klucz 🔑 → 10. Latarka 🔦 →',
      '11. Skarb 💎 → 12. Smok 🐉 → 13. Rakieta 🚀 → 14. Księżyc 🌙 → 15. Ser 🧀 →',
      '16. Mysz 🐭 → 17. Trampolina 🎪 → 18. Tort 🎂 → 19. Świeca 🕯️ → 20. Kryształ 🔮.',
      'Każde ogniwo nieuchronnie pociąga kolejne. Możesz w ten sposób zapamiętać przemówienie, procedurę czy 20 sprawunków na zakupy!',
      'Wiewiórka Basia kręci z radości piruety i wręcza Ci Złotego Orzeszka Pamięci! 🌰✨'
    ],
    task: {
      prompt: 'Co znajduje się bezpośrednio po SKARBIE (11), a przed RAKIETĄ (13)?',
      options: [
        'Smok 🐉 (strzegący skarbu i odpalający rakietę)',
        'Gitara 🎸',
        'Zegar ⏰',
        'Tort 🎂'
      ],
      correct: 0,
      hint: 'Skarbu pilnował ziejący ogniem smok, który wsiadł do rakiety!'
    }
  }
];








function mountMap(root, { nav }) {
  const squirrel = createSquirrel({ size: 'md' });
  const prog = store.get('link.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/link/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Duże zakupy w markecie bez spoglądania w telefon, kolejność punktów wystąpienia czy procedury krok po kroku – dzięki efektowi domina jedno ogniwo samo pociąga kolejne!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/link', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🐿️ ', h('span', { class: 'grad' }, 'Łańcuch Skojarzeń z Basią')),
    h('p', { class: 'lead' }, 'Poznaj metodę łączenia myśli jak domino i nigdy więcej nie zgub wątku.'),
    squirrel.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    squirrel.say(
      doneCount === 0
        ? 'Cześć! Jestem Wiewiórka Basia 🐿️ Nauczę Cię łączyć myśli w żelazny łańcuch!'
        : `Chrup! ${doneCount}/${LESSONS.length} lekcji za nami! Zbieramy kolejne orzeszki!`,
      'happy'
    );
  }, 200);

  return () => squirrel.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const squirrel = createSquirrel({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🐿️ Sprytny trik Basi: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🐿️ Podpowiedź Basi');
  hintBtn.addEventListener('click', () => {
    squirrel.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/link/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    squirrel.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      squirrel.setMood('cheer', 2500);
      squirrel.say('Brawo! To skojarzenie jest nierozerwalne jak stalowy łańcuch!', 'cheer');

      const prog = store.get('link.train', {});
      prog[les.id] = 3;
      store.set('link.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie łańcucha! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/link/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/link';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      squirrel.setMood('sad', 1800);
      squirrel.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    squirrel.say(les.speech || `Chrup, chrup! Lekcja ${index + 1}: ${les.subtitle}. Zobacz, jak połączymy te rzeczy!`, 'happy');
  }, 250);

  return () => squirrel.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const squirrel = createSquirrel({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = (modeId === 'forward' || modeId === 'reverse') ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/link', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null
    ),
    squirrel.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Chrup, chrup! Łańcuch trzyma jak ze stali! 🐿️✨',
    'Efekt domina w akcji! Myśli przeskakują same! 💥🔗',
    'Kolejne ogniwo połączone mistrzowską historią! 📖⭐',
    'Wyobraźnia na 200%! Basia skacze z gałęzi z radości! 🌰🎉',
    'Ani jedno ogniwo nie pękło! Żelazna pamięć! 🛡️🐿️',
    'Spiżarnia pełna skojarzeń! Budujemy dalej! 🏰🥜'
  ];
  function cheerSquirrel(c) {
    if (c % 5 === 0 && c > 0) {
      squirrel.say(`Cudowne combo x${c}! Wiewiórcza opowieść wszech czasów! 🐿️🏆🌰`, 'cheer', { revert: 1800 });
      squirrel.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      squirrel.say(`Combo x${c}! Twoja opowieść jest nierozerwalna! 🐿️🌰`, 'cheer', { revert: 1400 });
      squirrel.hop?.();
    } else {
      squirrel.hop?.();
      squirrel.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`link.best.${modeId}`, 0);
    if (score > prev) store.set(`link.best.${modeId}`, score);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    squirrel.setMood('happy');
    squirrel.say('Zaczynamy od nowa! Połączmy wszystkie ogniwa! 🐿️🌰', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    saveBest();
    sfx.fanfare();
    squirrel.setMood('cheer', 3000);
    squirrel.say(`Koniec gry! Twój wynik: ${score} pkt! Łańcuch trzymał się dzielnie! 🐿️`, 'cheer');

    const best = store.get(`link.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/link' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Świetny łańcuch myśli!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function handleWrong(solutionText) {
    sfx.wrong();
    combo = 0;
    if (modeId === 'missing_link' || modeId === 'endless_chain') {
      gameOver();
      return;
    }
    lives--;
    updateLives();
    if (lives <= 0) {
      gameOver();
    } else {
      squirrel.setMood('sad', 1200);
      squirrel.say(`${solutionText} Masz jeszcze ${lives} szanse. 🐿️`, 'think', { revert: 2600 });
      setTimeout(nextRound, 1200);
    }
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'forward') {
      const idx = rand(0, LINK_ITEMS.length - 2);
      const curr = LINK_ITEMS[idx];
      const nextItem = LINK_ITEMS[idx + 1];

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, curr.emoji),
        h('h2', {}, curr.name),
        round <= 3 ? h('p', { class: 'link-action-hint' }, `Akcja: ${curr.storyAction}`) : null,
        h('p', { class: 'muted' }, 'Co jest kolejnym ogniwem w tym łańcuchu?')
      );

      const others = LINK_ITEMS.filter(it => it.id !== nextItem.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([nextItem, ...wrong]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === nextItem.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerSquirrel(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Po ${curr.name} następuje ${nextItem.name}!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'reverse') {
      const idx = rand(1, LINK_ITEMS.length - 1);
      const curr = LINK_ITEMS[idx];
      const prevItem = LINK_ITEMS[idx - 1];

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, curr.emoji),
        h('h2', {}, curr.name),
        h('p', { class: 'muted' }, 'Cofamy taśmę! Jaki przedmiot znajdował się bezpośrednio przed nim?')
      );

      const others = LINK_ITEMS.filter(it => it.id !== prevItem.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([prevItem, ...wrong]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === prevItem.id) {
            sfx.success();
            score += 20 + combo * 4;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerSquirrel(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Przed ${curr.name} znajdował się: ${prevItem.name}!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'missing_link') {
      const idx = rand(0, LINK_ITEMS.length - 3);
      const first = LINK_ITEMS[idx];
      const middle = LINK_ITEMS[idx + 1];
      const last = LINK_ITEMS[idx + 2];

      const card = h('div', { class: 'link-card' },
        h('div', { class: 'missing-chain-row' },
          h('span', { class: 'mc-item' }, `${first.emoji} ${first.name}`),
          h('span', { class: 'mc-arrow' }, '➡️'),
          h('span', { class: 'mc-item unknown' }, '❓ [?]'),
          h('span', { class: 'mc-arrow' }, '➡️'),
          h('span', { class: 'mc-item' }, `${last.emoji} ${last.name}`)
        ),
        h('p', { class: 'muted' }, 'Jakie ogniwo łączy te dwa przedmioty w historii?')
      );

      const others = LINK_ITEMS.filter(it => it.id !== middle.id);
      const choices = shuffle([middle, ...shuffle(others).slice(0, 3)]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === middle.id) {
            sfx.success();
            score += 20 + combo * 4;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerSquirrel(combo);
            nextRound();
          } else {
            sfx.wrong();
            gameOver();
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'endless_chain') {
      const idx = rand(0, LINK_ITEMS.length - 2);
      const curr = LINK_ITEMS[idx];
      const nextItem = LINK_ITEMS[idx + 1];

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, curr.emoji),
        h('h2', {}, curr.name),
        h('p', {}, `Ogniwo #${round} w łańcuchu domina.`),
        h('p', { class: 'muted' }, 'Wskaż natychmiast kolejne powiązanie:')
      );

      const others = LINK_ITEMS.filter(it => it.id !== nextItem.id);
      const choices = shuffle([nextItem, ...shuffle(others).slice(0, 3)]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === nextItem.id) {
            sfx.success();
            score += 25 + round * 5;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            squirrel.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            gameOver();
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  nextRound();
  return () => squirrel.destroy();
}










function mountMenu(root, { nav }) {
  const squirrel = createSquirrel({ size: 'md' });
  const prog = store.get('link.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/link/train' : `#/link/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🐿️ Szkolenie z Wiewiórką Basią'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę łańcucha' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · efekt domina · cały łańcuch 20 ogniw bez kartki`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/link/train' }, 'Zobacz mapę lekcji skojarzeń →');

  const modeCards = MODES.map(m => {
    const best = store.get(`link.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/link/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🐿️ ', h('span', { class: 'grad' }, 'Łańcuch skojarzeń')),
        h('p', { class: 'lead' }, 'Łącz myśli jak kostki domina. Zapamiętuj listy zakupów, przemówienia i procedury bez kartki papieru.')
      )
    ),
    squirrel.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Chrup! Jestem Wiewiórka Basia 🐿️ Zbudujemy razem łańcuch myśli, który nigdy się nie zerwie!'
    : done < LESSONS.length
      ? `Mamy ${done} z ${LESSONS.length} lekcji! Dokończmy spiżarnię skojarzeń!`
      : 'Opanowałeś metodę łańcuchową po mistrzowsku! Wybierz tryb gry swobodnej! 🏆';

  setTimeout(() => { squirrel.say(greet, 'happy'); }, 300);
  return () => squirrel.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* --- CALENDAR GAME MODULE --- */
  const calendarGame = (function() {
    const DAYS_OF_WEEK = [
  { id: 0, name: 'Niedziela', short: 'Nd', emoji: '☀️' },
  { id: 1, name: 'Poniedziałek', short: 'Pn', emoji: '🌙' },
  { id: 2, name: 'Wtorek', short: 'Wt', emoji: '🔥' },
  { id: 3, name: 'Środa', short: 'Śr', emoji: '💧' },
  { id: 4, name: 'Czwartek', short: 'Cz', emoji: '⚡' },
  { id: 5, name: 'Piątek', short: 'Pt', emoji: '🎉' },
  { id: 6, name: 'Sobota', short: 'Sb', emoji: '🪐' }
];

const MONTH_ANCHORS = [
  { month: 1, name: 'Styczeń', anchorDay: 3, rule: '3 stycznia (lub 4 w przestępnym)' },
  { month: 2, name: 'Luty', anchorDay: 28, rule: 'Ostatni dzień lutego (28 lub 29)' },
  { month: 3, name: 'Marzec', anchorDay: 14, rule: '14 marca (Dzień liczby Pi: 3.14)' },
  { month: 4, name: 'Kwiecień', anchorDay: 4, rule: '4 kwietnia (parzysty: 4.04)' },
  { month: 5, name: 'Maj', anchorDay: 9, rule: '9 maja („praca 9 do 5” -> 9.05)' },
  { month: 6, name: 'Czerwiec', anchorDay: 6, rule: '6 czerwca (parzysty: 6.06)' },
  { month: 7, name: 'Lipiec', anchorDay: 11, rule: '11 lipca („stacja 7/11” -> 11.07)' },
  { month: 8, name: 'Sierpień', anchorDay: 8, rule: '8 sierpnia (parzysty: 8.08)' },
  { month: 9, name: 'Wrzesień', anchorDay: 5, rule: '5 września („praca 9 do 5” -> 5.09)' },
  { month: 10, name: 'Październik', anchorDay: 10, rule: '10 października (parzysty: 10.10)' },
  { month: 11, name: 'Listopad', anchorDay: 7, rule: '7 listopada („stacja 7/11” -> 7.11)' },
  { month: 12, name: 'Grudzień', anchorDay: 12, rule: '12 grudnia (parzysty: 12.12)' }
];

function getDoomsdayOfYear(year) {
  // Doomsday algorithm anchor for years
  // 2024: 4 (Czwartek), 2025: 5 (Piątek), 2026: 6 (Sobota)
  const d = new Date(year, 3, 4); // 4th April is always Doomsday
  return d.getDay();
}

function calculateWeekday(year, month, day) {
  const d = new Date(year, month - 1, day);
  return d.getDay();
}


const MODES = [
  {
    id: 'weekday',
    name: 'Jaki to dzień tygodnia?',
    emoji: '📅',
    desc: 'Widzisz datę w bieżącym roku. Oblicz w głowie jej dzień tygodnia w kilka sekund!',
    color: ['#11998e', '#38ef7d'],
    badge: 'Klasyczny'
  },
  {
    id: 'anchors',
    name: 'Kotwice miesięcy',
    emoji: '⚓',
    desc: 'Przetestuj znajomość magicznych dat bazowych (4.04, 6.06, 9.05, 11.07 itp.).',
    color: ['#4facfe', '#00f2fe'],
    badge: 'Fundament'
  },
  {
    id: 'clock_beat',
    name: 'Wyścig z żółwikiem',
    emoji: '⚡',
    desc: '30 sekund na zegarze! Ile dni tygodnia zdołasz błyskawicznie obliczyć?',
    color: ['#f093fb', '#f5576c'],
    badge: 'Na czas'
  },
  {
    id: 'time_travel',
    name: 'Podróżnik w czasie',
    emoji: '⏳',
    desc: 'Dowolne daty z historii i przyszłości (1970–2040). Czy potrafisz obliczyć dzień swoich urodzin?',
    color: ['#fa709a', '#fee140'],
    badge: 'Wyzwanie'
  }
];




const LESSONS = [
  {
    id: 'cal-1',
    title: 'Sekret kalendarza i Kotwica Roku',
    subtitle: 'Dni tygodnia 0-6 oraz fundament Doomsday',
    desc: 'Odkryj tajemnicę geniusza Johna Conwaya – kalendarz w pamięci.',
    speech: 'Cześć! Jestem Żółwik Zenon 🐢. Nigdy się nie spieszę, bo znam sekret czasu! Czy wiesz, że możesz w 2 sekundy odgadnąć, w jaki dzień tygodnia wypadną Twoje urodziny, Boże Narodzenie w 2026, a nawet data w 2035 roku? Pokażę Ci tę niezwykłą sztuczkę!',
    theory: [
      'Po co nam ta technika? Wyobraź sobie miny znajomych w szkole lub w pracy, gdy ktoś rzuci datę, a Ty po 2 sekundach w pamięci odpowiesz: „To będzie sobota!”. Poczujesz się jak chodzący ludzki kalkulator!',
      'Tydzień ma 7 dni i kręci się w kółko jak karuzela. Ponumerujmy dni tygodnia od 0 do 6:',
      '• 1 = Poniedziałek 🌙 | 2 = Wtorek 🔥 | 3 = Środa 💧 | 4 = Czwartek ⚡ | 5 = Piątek 🎉 | 6 = Sobota 🪐',
      '• 0 = Niedziela ☀️ (dzień relaksu i odpoczynku, okrągłe zero pracy!)',
      'CZYM JEST KOTWICA ROKU?',
      'W każdym roku istnieje jeden magiczny dzień tygodnia, zwany Kotwicą Roku (Doomsday).',
      'W roku 2026 dniem kotwicznym jest SOBOTA (6). Zapamiętajmy tę liczbę!'
    ],
    task: {
      prompt: 'Jaki dzień tygodnia odpowiada liczbie 5 w systemie kalendarzowym?',
      options: ['Piątek (5. dzień)', 'Poniedziałek (1)', 'Niedziela (0)', 'Środa (3)'],
      correct: 0,
      hint: 'Poniedziałek to 1, Wtorek 2, Środa 3, Czwartek 4, Piątek to 5!'
    }
  },
  {
    id: 'cal-2',
    title: 'Bliźniacze daty parzyste',
    subtitle: '4.04, 6.06, 8.08, 10.10, 12.12',
    desc: 'Wszystkie parzyste miesiące mają kotwicę w dniu równym numerowi miesiąca!',
    speech: 'Oto najłatwiejsza reguła na świecie: daty parzyste to lustrzane bliźniaki w każdym roku!',
    theory: [
      'Spójrz, jak genialnie zbudowany jest kalendarz:',
      'W każdym parzystym miesiącu numer miesiąca to dokładnie ten sam dzień kotwiczny:',
      '• 4 kwietnia (4.04)',
      '• 6 czerwca (6.06)',
      '• 8 sierpnia (8.08)',
      '• 10 października (10.10)',
      '• 12 grudnia (12.12)',
      'Te 5 dat ZAWSZE wypada w ten sam dzień tygodnia w danym roku! W 2026 roku każda z nich to dokładnie SOBOTA!'
    ],
    task: {
      prompt: 'Która data jest kotwicą Doomsday dla sierpnia (8. miesiąc)?',
      options: ['8 sierpnia (8.08)', '1 sierpnia', '15 sierpnia', '31 sierpnia'],
      correct: 0,
      hint: 'Miesiąc parzysty: numer miesiąca = numer dnia (8.08)!'
    }
  },
  {
    id: 'cal-3',
    title: 'Miesiące nieparzyste i Dzień Pi',
    subtitle: 'Praca 9 do 5 na stacji 7/11, Dzień Pi (14.03) i luty',
    desc: 'Komplet kotwic dla wszystkich 12 miesięcy w roku.',
    speech: 'A co z miesiącami nieparzystymi? Mamy na nie wesołą rymowankę o stacji benzynowej i liczbie Pi!',
    theory: [
      'Dla miesięcy nieparzystych mamy łatwe powiedzonko:',
      '„Pracuję od 9 do 5 na stacji 7/11”:',
      '• 9 maja (9.05) oraz 5 września (5.09) → zamieniamy 9 i 5!',
      '• 11 lipca (11.07) oraz 7 listopada (7.11) → zamieniamy 7 i 11!',
      'Do tego dochodzą pierwsze trzy miesiące roku:',
      '• Styczeń: 3 stycznia (3.01) w zwykłym roku (lub 4.01 w przestępnym) – pamiętamy: 3 dni odpoczynku po sylwestrze!',
      '• Luty: ZAWSZE OSTATNI DZIEŃ LUTEGO (28.02, a w przestępnym 29.02).',
      '• Marzec: 14 marca (3.14 to słynny Dzień Liczby Pi!).',
      'Wszystkie te daty to w 2026 roku również ta sama nasza kotwica: SOBOTA!'
    ],
    task: {
      prompt: 'Jaki dzień maja (5. miesiąc) jest kotwicą w regule „od 9 do 5”?',
      options: ['9 maja (9.05)', '1 maja', '15 maja', '31 maja'],
      correct: 0,
      hint: 'Od 9 do 5: 9. dzień 5. miesiąca = 9 maja!'
    }
  },
  {
    id: 'cal-4',
    title: 'Obliczanie daty w 3 krokach',
    subtitle: 'Przykład: 15 sierpnia 2026',
    desc: 'Jak policzyć dzień tygodnia dla dowolnego dnia w miesiącu?',
    speech: 'Teraz połączymy kropki! Zobacz, jak w 3 prostych krokach policzyć dowolną datę w roku!',
    theory: [
      'Chcesz wiedzieć, jaki dzień tygodnia to np. 15 sierpnia 2026:',
      '1. Znasz kotwicę sierpnia: to bliźniak 8 sierpnia (8.08).',
      '2. Wiesz, że w 2026 roku kotwica to SOBOTA (6).',
      '3. Liczymy różnicę dni: 15 - 8 = 7 dni. Pełne 7 dni to dokładnie tydzień, więc 15 sierpnia to również SOBOTA!',
      'Gdyby to był 10 sierpnia? 8 sierpnia + 2 dni: Sobota + 2 dni = Poniedziałek!'
    ],
    task: {
      prompt: 'Jeśli 8 sierpnia to Sobota, jaki dzień tygodnia to 10 sierpnia (8 + 2 dni)?',
      options: ['Poniedziałek (Sobota + 2 dni)', 'Niedziela', 'Wtorek', 'Czwartek'],
      correct: 0,
      hint: 'Sobota + 1 dzień = Niedziela; Sobota + 2 dni = Poniedziałek!'
    }
  },
  {
    id: 'cal-5',
    title: 'Podróżnik w czasie: Inne lata!',
    subtitle: 'Jak znaleźć kotwicę dla 2027, 2028 czy 2035 roku?',
    desc: 'Sekret przenoszenia kotwicy w przyszłość i przeszłość.',
    speech: 'A teraz prawdziwa magia: Podróżnik w czasie! Nauczę Cię błyskawicznie znajdować kotwicę dla dowolnego innego roku!',
    theory: [
      'Dlaczego to działa w każdym roku?',
      'Zwykły rok ma 365 dni = 52 pełne tygodnie + 1 dzień zapasu. Dlatego każdy zwykły rok przesuwa kotwicę o dokładnie +1 dzień!',
      'Rok przestępny (ma 29 lutego) przesuwa kotwicę o +2 dni!',
      'JAK TO LICZYĆ W PAMIĘCI?',
      'Naszą domową bazą jest rok 2026 = SOBOTA (6):',
      '• Rok 2027: (+1 rok) → Sobota + 1 = NIEDZIELA (0)! Wszystkie kotwice (4.04, 8.08, 12.12) w 2027 to Niedziela!',
      '• Rok 2028: (przestępny! +2 dni) → Niedziela + 2 = WTOREK (2)!',
      '• Rok 2025: (-1 rok w tył) → Sobota - 1 = PIĄTEK (5)!',
      '• Rok 2035: różnica 9 lat + 2 lata przestępne (2028, 2032) = 11 dni przesunięcia. 11 mod 7 = 4 dni w przód od Soboty = ŚRODA (3)!',
      'KOTWICE STULECI:',
      '• Wiek XXI (lata 2000–2099): baza stulecia to WTOREK (2, łatwo zapamiętać: rok 2000 ma dwójkę na początku)!',
      '• Wiek XX (lata 1900–1999): baza stulecia to ŚRODA (3, 3 sylaby: „dzie-więć-set”)!'
    ],
    task: {
      prompt: 'Jeśli w 2026 roku kotwicą jest Sobota, jaka będzie kotwica roku 2027 (zwykły rok, +1 dzień)?',
      options: ['Niedziela (Sobota + 1 dzień)', 'Poniedziałek', 'Piątek', 'Wtorek'],
      correct: 0,
      hint: 'Każdy normalny rok przesuwa kotwicę o 1 dzień w przód: Sobota + 1 = Niedziela!'
    }
  },
  {
    id: 'cal-6',
    title: 'Egzamin Władcy Czasu',
    subtitle: 'Sprawdzian dat w przeszłości i przyszłości',
    desc: 'Wielki finał u Żółwika Zenona! Oblicz dzień tygodnia w innym roku.',
    speech: 'Wielki Finał u Żółwika Zenona! Jesteś gotów na dowolny rok – przeszły, teraźniejszy i przyszły! 🐢⏳',
    theory: [
      'Brawo! Masz w głowie kompletny, wieczysty kalendarz na dowolny rok:',
      '1. Znasz kotwice miesięcy: 4.04, 6.06, 8.08, 10.10, 12.12, 9.05, 5.09, 11.07, 7.11, 14.03, 28.02.',
      '2. Znasz bazę 2026 (Sobota) i potrafisz przesunąć kotwicę na dowolny rok (+1 na rok, +2 na przestępny).',
      '3. Dodajesz lub odejmujesz różnicę dni do najbliższej kotwicy!',
      'Możesz teraz śmiało wejść w tryb „Podróżnik w czasie” i błyskawicznie podać dzień tygodnia dla dowolnej daty w historii i przyszłości! 🐢🪐'
    ],
    task: {
      prompt: 'Jaki dzień tygodnia to 4 kwietnia 2027 roku (pamiętając, że kotwica 2027 to Niedziela)?',
      options: ['Niedziela (bo 4.04 to bezpośrednia kotwica Doomsday!)', 'Sobota', 'Poniedziałek', 'Środa'],
      correct: 0,
      hint: '4.04 to kwietniowa kotwica – w 2027 roku przypada dokładnie w dzień kotwicy: Niedzielę!'
    }
  }
];








function mountMap(root, { nav }) {
  const turtle = createTurtle({ size: 'md' });
  const prog = store.get('calendar.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/calendar/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Błyskawiczne planowanie spotkań, terminów i wyjazdów bez sięgania po smartfon. Zrobisz też genialny popis na imprezie, podając dzień tygodnia urodzin każdego ze znajomych!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/calendar', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🐢 ', h('span', { class: 'grad' }, 'Kalendarz w głowie z Żółwikiem')),
    h('p', { class: 'lead' }, 'Poznaj algorytm Doomsday i naucz się podawać dzień tygodnia każdej daty w kilka sekund.'),
    turtle.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    turtle.say(
      doneCount === 0
        ? 'Tik-tak! Jestem Żółwik Zegarowy 🐢 Nauczę Cię czytać czas w pamięci bez pośpiechu!'
        : `Świetnie! Mamy ${doneCount}/${LESSONS.length} lekcji czasu za sobą! Idziemy dalej?`,
      'happy'
    );
  }, 200);

  return () => turtle.destroy();
}

function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const turtle = createTurtle({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🐢 Mądrość Żółwika: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🐢 Podpowiedź Żółwika');
  hintBtn.addEventListener('click', () => {
    turtle.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/calendar/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    turtle.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      turtle.setMood('cheer', 2500);
      turtle.say('Perfekcyjnie! Czas nie ma przed Tobą żadnych tajemnic!', 'cheer');

      const prog = store.get('calendar.train', {});
      prog[les.id] = 3;
      store.set('calendar.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie czasu! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/calendar/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/calendar';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      turtle.setMood('sad', 1800);
      turtle.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    turtle.say(les.speech || `Cześć! Lekcja ${index + 1}: ${les.subtitle}. Spokojnie zbadajmy daty!`, 'happy');
  }, 250);

  return () => turtle.destroy();
}









function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const turtle = createTurtle({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'clock_beat' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = modeId !== 'clock_beat' ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'clock_beat' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/calendar', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    turtle.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Dzień obliczony w ułamku sekundy! 🐢⚡',
    'Prawdziwy władca czasu i kalendarza! 📅✨',
    'Algorytm Conwaya opanowany po mistrzowsku! 🧠⏱️',
    'Bez pudła! Żółwik kłania się w uznaniu! 🎯🐢',
    'Zegarmistrzowska precyzja! Nic Cię nie zaskoczy! ⏰⭐',
    'Spokój i geniusz! Kalendarz w Twojej głowie lśni! 🪐🗓️'
  ];
  function cheerTurtle(c) {
    if (c % 5 === 0 && c > 0) {
      turtle.say(`Absolutne mistrzostwo x${c}! Żółwik Zenon bije brawo z zachwytu! 🐢🏆⏱️`, 'cheer', { revert: 1800 });
      turtle.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      turtle.say(`Combo x${c}! Twój zegar biologiczny wyprzedza komputery! 🐢✨`, 'cheer', { revert: 1400 });
      turtle.hop?.();
    } else {
      turtle.hop?.();
      turtle.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`calendar.best.${modeId}`, 0);
    if (score > prev) store.set(`calendar.best.${modeId}`, score);
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    timeLeft = modeId === 'clock_beat' ? 30 : 0;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timerInterval) clearInterval(timerInterval);
    if (modeId === 'clock_beat') startTimer();
    turtle.setMood('happy');
    turtle.say('Zaczynamy od nowa! Kalendarz w Twojej głowie! 🐢🗓️', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    turtle.setMood('cheer', 3000);
    turtle.say(`Koniec gry! Twój wynik: ${score} pkt! Prawdziwy władca kalendarza! 🐢`, 'cheer');

    const best = store.get(`calendar.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/calendar' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Mistrzowski wynik!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function handleWrong(solutionText) {
    sfx.wrong();
    combo = 0;
    lives--;
    updateLives();
    if (lives <= 0) {
      gameOver();
    } else {
      turtle.setMood('sad', 1200);
      turtle.say(`${solutionText} Pozostało szans: ${lives} 🐢`, 'think', { revert: 2600 });
      setTimeout(nextRound, 1200);
    }
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'weekday' || modeId === 'clock_beat' || modeId === 'time_travel') {
      let year;
      if (modeId === 'time_travel') {
        if (round <= 3) {
          // Rundy 1-3: bliskie lata (2024-2028), gracz utrwala przesunięcie od 2026 (-2 do +2)
          year = rand(2024, 2028);
        } else if (round <= 7) {
          // Rundy 4-7: lata 2020-2032
          year = rand(2020, 2032);
        } else {
          // Rundy 8+: szersza podróż w czasie (1990-2035)
          year = rand(1990, 2035);
        }
      } else {
        year = 2026;
      }

      const mIdx = rand(0, MONTH_ANCHORS.length - 1);
      const mInfo = MONTH_ANCHORS[mIdx];
      const maxDays = [1, 3, 5, 7, 8, 10, 12].includes(mInfo.month) ? 31 : mInfo.month === 2 ? 28 : 30;
      const day = rand(1, maxDays);
      const correctDayIdx = calculateWeekday(year, mInfo.month, day);
      const correctDay = DAYS_OF_WEEK[correctDayIdx];

      const mAnchorText = `${mInfo.anchorDay}.${mInfo.month < 10 ? '0' + mInfo.month : mInfo.month}`;
      const yearAnchor = DAYS_OF_WEEK[getDoomsdayOfYear(year)];

      let hintText = null;
      if (modeId === 'weekday' && round <= 3) {
        hintText = `Wskazówka: kotwica miesiąca to ${mAnchorText} (w 2026 to Sobota)`;
      } else if (modeId === 'time_travel') {
        if (round <= 4) {
          hintText = `Wskazówka: kotwica roku ${year} to ${yearAnchor.name} ⏳ (kotwica miesiąca: ${mAnchorText})`;
        } else if (round <= 8) {
          hintText = `Wskazówka: kotwica ${mInfo.name.toLowerCase()} to ${mAnchorText}`;
        }
      }

      const card = h('div', { class: 'calendar-card' },
        h('div', { class: 'cal-date-badge' }, `${day} ${mInfo.name.toLowerCase()} ${year}`),
        h('h2', {}, 'Jaki to dzień tygodnia?'),
        hintText ? h('p', { class: 'muted' }, hintText) : null
      );

      const opts = h('div', { class: 'opt-grid' });
      DAYS_OF_WEEK.forEach(d => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${d.emoji} ${d.name}`);
        btn.addEventListener('click', () => {
          if (d.id === correctDayIdx) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerTurtle(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            if (modeId === 'clock_beat') {
              sfx.wrong();
              setTimeout(nextRound, 300);
            } else {
              handleWrong(`${day} ${mInfo.name} ${year} to ${correctDay.name}!`);
            }
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'anchors') {
      const target = MONTH_ANCHORS[rand(0, MONTH_ANCHORS.length - 1)];
      const card = h('div', { class: 'calendar-card' },
        h('h2', {}, `Miesiąc: `, h('span', { class: 'grad' }, target.name)),
        h('p', { class: 'muted' }, 'Który dzień tego miesiąca jest kotwicą Doomsday?')
      );

      const others = MONTH_ANCHORS.filter(m => m.anchorDay !== target.anchorDay);
      const wrong = shuffle(others).map(m => m.anchorDay).slice(0, 3);
      const choices = shuffle([target.anchorDay, ...wrong]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(dayChoice => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${dayChoice}. dzień miesiąca`);
        btn.addEventListener('click', () => {
          if (dayChoice === target.anchorDay) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerTurtle(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Dla ${target.name} kotwicą jest ${target.anchorDay}. dzień (${target.rule})!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  if (modeId === 'clock_beat') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    turtle.destroy();
  };
}










function mountMenu(root, { nav }) {
  const turtle = createTurtle({ size: 'md' });
  const prog = store.get('calendar.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/calendar/train' : `#/calendar/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🐢 Szkolenie z Żółwikiem Zegarowym'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę kalendarza' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · algorytm Doomsday · kotwice miesięcy · dni tygodnia w pamięci`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/calendar/train' }, 'Zobacz mapę lekcji kalendarza →');

  const modeCards = MODES.map(m => {
    const best = store.get(`calendar.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/calendar/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🐢 ', h('span', { class: 'grad' }, 'Kalendarz w głowie')),
        h('p', { class: 'lead' }, 'Opanuj algorytm Doomsday. Podaj dzień tygodnia dowolnej daty w historii w kilka sekund.')
      )
    ),
    turtle.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Tik-tak! Jestem Żółwik Zegarowy 🐢 Nie spiesz się – kalendarz to prosty rytm, nauczę Cię go!'
    : done < LESSONS.length
      ? `Zrobiłeś ${done} z ${LESSONS.length} lekcji czasu! Chodźmy dalej!`
      : 'Znasz kalendarz w głowie lepiej niż zegarmistrz! Zagraj w trybie swobodnym! 🏆';

  setTimeout(() => { turtle.say(greet, 'happy'); }, 300);
  return () => turtle.destroy();
}

return {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};

  })();
  


  /* ==========================================================================
     14. GAMES REGISTRY (8 PEŁNYCH SYSTEMÓW PAMIĘCIOWYCH)
     ========================================================================== */
  const GAMES = [
    {
      id: 'digits', title: 'Cyfry', emoji: '🐱', status: 'ready',
      tagline: 'Zapamiętuj numery telefonów, PIN i ciągi cyfr. Szkolenie z Kotkiem Mruczkiem + 6 trybów gry.',
      accent: ['#7c5cff', '#ff6bd6'], tags: ['Kotek Mruczek 🐱', '9 lekcji', '6 trybów'],
      load: () => Promise.resolve(digitsGame)
    },
    {
      id: 'palace', title: 'Pałac pamięci', emoji: '🐯', status: 'ready',
      tagline: 'Metoda Loci i spacer po komnatach. Szkolenie z Tygryskiem Leonem + 5 wariantów gry.',
      accent: ['#ff9233', '#ffc857'], tags: ['Tygrysek Leon 🐯', '8 lekcji', '5 wariantów'],
      load: () => Promise.resolve(palaceGame)
    },
    {
      id: 'names', title: 'Imiona i twarze', emoji: '🦊', status: 'ready',
      tagline: 'Nigdy więcej „znam tę twarz, ale jak on miał na imię?”. Kotwice cech i mosty fonetyczne z Liskiem.',
      accent: ['#ff6b35', '#f7971e'], tags: ['Lisek Bystrzak 🦊', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(namesGame)
    },
    {
      id: 'major', title: 'System Major', emoji: '🦉', status: 'ready',
      tagline: 'Tajemny kod mistrzów: zamieniaj cyfry 0-9 na spółgłoski, słowa i żywe obrazy ze Sówką Profesorem.',
      accent: ['#8a2be2', '#da70d6'], tags: ['Sówka Profesor 🦉', '8 wykładów', '4 warianty'],
      load: () => Promise.resolve(majorGame)
    },
    {
      id: 'words', title: 'Słówka i języki', emoji: '🦜', status: 'ready',
      tagline: 'Angielski i hiszpański w mig! Metoda słów-kluczy (Keyword Method) z Papużką Polą.',
      accent: ['#00b09b', '#96c93d'], tags: ['Papużka Pola 🦜', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(wordsGame)
    },
    {
      id: 'cards', title: 'Karty do gry', emoji: '🦝', status: 'ready',
      tagline: 'Cała talia 52 kart w głowie! System PAO (Postać - Akcja - Obiekt) z Szopem Magikiem.',
      accent: ['#e11d48', '#fb7185'], tags: ['Szop Magik 🦝', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(cardsGame)
    },
    {
      id: 'link', title: 'Łańcuch skojarzeń', emoji: '🐿️', status: 'ready',
      tagline: 'Efekt domina w pamięci! Listy zakupów, przemówienia i procedury z Wiewiórką Basią.',
      accent: ['#d35400', '#f39c12'], tags: ['Wiewiórka Basia 🐿️', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(linkGame)
    },
    {
      id: 'calendar', title: 'Kalendarz w głowie', emoji: '🐢', status: 'ready',
      tagline: 'Dzień tygodnia dowolnej daty w historii w 3 sekundy. Genialny algorytm Doomsday z Żółwikiem.',
      accent: ['#16a34a', '#22c55e'], tags: ['Żółwik Zegarowy 🐢', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(calendarGame)
    }
  ];


  /* ==========================================================================
     15. APP ROUTING & CORE INIT
     ========================================================================== */






















  const app = $('#app');
  let cleanup = null;
  let routeId = 0;

  const nav = path => { location.hash = '#/' + path; };

  function renderHub() {
    const cat = createCat({ size: 'lg' });
    const trainStars =
      Object.values(store.get('digits.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('palace.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('names.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('major.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('words.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('cards.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('link.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('calendar.train', {})).reduce((a, b) => a + b, 0);
    const streak = currentStreak();

    const cards = GAMES.map(g => {
      const ready = g.status === 'ready';
      const el = h(ready ? 'a' : 'div', {
        class: `game-card${ready ? '' : ' soon'}`,
        style: `--c1:${g.accent[0]};--c2:${g.accent[1]}`,
        href: ready ? `#/${g.id}` : null,
        'aria-disabled': ready ? null : 'true'
      },
        h('div', { class: 'gc-emoji' }, g.emoji),
        h('h3', {}, g.title),
        h('p', {}, g.tagline),
        ready
          ? h('div', { class: 'gc-tags' }, g.tags.map(t => h('span', {}, t)))
          : h('div', { class: 'gc-tags' }, h('span', { class: 'soon-badge' }, 'Wkrótce')),
        ready && h('span', { class: 'gc-play' }, 'Graj ▶')
      );
      return el;
    });

    const view = h('section', { class: 'screen hub' },
      h('div', { class: 'hero' },
        cat.el,
        h('h1', {}, 'Świat ', h('span', { class: 'grad' }, 'pamięci')),
        h('p', { class: 'lead' }, 'Mini-gry, w których uczysz się technik pamięciowych używanych przez mistrzów. Zapamiętasz numer telefonu i całe listy w kilka chwil!')
      ),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', {}, `🔥 ${streak}`), h('span', {}, streak === 1 ? 'dzień z rzędu' : 'dni z rzędu')),
        h('div', { class: 'stat' }, h('b', {}, `⭐ ${trainStars}`), h('span', {}, 'gwiazdek')),
        h('div', { class: 'stat' }, h('b', {}, `🎮 ${GAMES.filter(g => g.status === 'ready').length}/${GAMES.length}`), h('span', {}, 'gier gotowych'))
      ),
      h('h2', { class: 'section-title' }, 'Wybierz grę'),
      h('div', { class: 'game-grid' }, cards)
    );
    app.append(view);

    const hello = streak > 1
      ? `Miau! ${streak} dni z rzędu – świetna passa! 🔥 Twoje urocze zwierzątka czekają na trening!`
      : rand(['Miau! 8 potężnych systemów pamięciowych czeka na Ciebie! 🐾', 'Cześć! 8 genialnych modułów pamięciowych czeka na Ciebie 💪', 'Gotowy na trening pamięci? Wybierz grę! ✨']);
    setTimeout(() => { cat.wave(); cat.say(hello, 'happy'); }, 350);
    return () => cat.destroy();
  }

  async function route() {
    const id = ++routeId;
    cleanup?.(); cleanup = null;
    app.replaceChildren();
    window.scrollTo(0, 0);

    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    const game = GAMES.find(g => g.id === parts[0] && g.load);
    if (document.body) document.body.dataset.game = game ? game.id : 'hub';

    if (!game) { cleanup = renderHub(); return; }
    try {
      const mod = await game.load();
      if (id !== routeId) return;
      touchStreak();
      cleanup = mod.mount(app, { params: parts.slice(1), nav });
    } catch (err) {
      console.error(err);
      if (id === routeId) app.append(h('p', { class: 'screen' }, 'Ups, coś poszło nie tak. Odśwież stronę.'));
    }
  }

  addEventListener('hashchange', route);
  route();

  /* ==========================================================================
     16. GLOBAL UI LISTENERS & DIALOGS
     ========================================================================== */
  const soundBtn = $('#soundBtn');
  const paintSound = () => {
    if (!soundBtn) return;
    soundBtn.textContent = sound.on ? '🔊' : '🔇';
    soundBtn.setAttribute('aria-pressed', String(sound.on));
  };
  soundBtn?.addEventListener('click', () => { sound.toggle(); paintSound(); sfx.pop(); });
  paintSound();

  const guide = $('#guide');
  const openGuide = () => { guide?.showModal(); sfx.pop(); };
  $('#guideBtn')?.addEventListener('click', openGuide);

  const about = $('#about');
  const openAbout = () => { about?.showModal(); sfx.pop(); };
  $('#authorBtn')?.addEventListener('click', openAbout);
  $('#authorLink')?.addEventListener('click', openAbout);
  document.querySelectorAll('dialog').forEach(d =>
    d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  const installBtn = $('#installBtn');
  const installModal = $('#installModal');
  const directInstallBtn = $('#directInstallBtn');
  let deferred = null;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;

  if (standalone && installBtn) {
    installBtn.hidden = true;
  }

  addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e;
    if (directInstallBtn) directInstallBtn.hidden = false;
  });

  addEventListener('appinstalled', () => {
    if (installBtn) installBtn.hidden = true;
    installModal?.close();
    deferred = null;
  });

  const triggerInstall = async () => {
    if (deferred) {
      deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === 'accepted') {
        deferred = null;
        if (installBtn) installBtn.hidden = true;
        installModal?.close();
      }
    } else {
      installModal?.showModal();
    }
  };

  installBtn?.addEventListener('click', triggerInstall);
  directInstallBtn?.addEventListener('click', triggerInstall);

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(console.warn));
  }
})();
