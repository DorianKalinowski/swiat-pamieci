const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'js', 'bundle.js');
const original = fs.readFileSync(bundlePath, 'utf8');

function readMod(subPath) {
  return fs.readFileSync(path.join(__dirname, '..', 'js', subPath), 'utf8');
}

function cleanMascot(content, mascotName) {
  const pokeConst = `${mascotName.toUpperCase()}_POKE`;
  return content
    .replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?/g, '')
    .replace(/export\s+function/g, 'function')
    .replace(/export\s+const/g, 'const')
    .replace(/\bconst POKE =/g, `const ${pokeConst} =`)
    .replace(/pokeLines = POKE/g, `pokeLines = ${pokeConst}`)
    .replace(
      /live\.textContent = msg;\s*text\.textContent = '';\s*for \(let i = 1; i <= msg\.length; i\+\+\) \{(\s*if \(id !== typeId\) return;\s*text\.textContent = )msg\.slice\(0, i\);/g,
      'const finalMsg = typeof t === "function" ? t(msg) : msg;\n    live.textContent = finalMsg;\n    text.textContent = "";\n    for (let i = 1; i <= finalMsg.length; i++) {$1finalMsg.slice(0, i);'
    );
}

const foxCode = cleanMascot(readMod('fox.js'), 'fox');
const owlCode = cleanMascot(readMod('owl.js'), 'owl');
const parrotCode = cleanMascot(readMod('parrot.js'), 'parrot');
const raccoonCode = cleanMascot(readMod('raccoon.js'), 'raccoon');
const squirrelCode = cleanMascot(readMod('squirrel.js'), 'squirrel');
const turtleCode = cleanMascot(readMod('turtle.js'), 'turtle');
const dogCode = cleanMascot(readMod('dog.js'), 'dog');
const octopusCode = cleanMascot(readMod('octopus.js'), 'octopus');

function buildGameModule(gameId, files) {
  const parts = files.map(f => {
    return fs.readFileSync(path.join(__dirname, '..', 'js', 'games', gameId, f), 'utf8')
      .replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?/g, '')
      .replace(/export\s+default\s+\{/g, 'return {')
      .replace(/export\s+const\s+/g, 'const ')
      .replace(/export\s+function\s+/g, 'function ');
  });

  return `
  /* --- ${gameId.toUpperCase()} GAME MODULE --- */
  const ${gameId}Game = (function() {
    ${parts.join('\n\n')}
  })();
  `;
}

const namesGameCode = buildGameModule('names', ['faces.js', 'modes.js', 'lessons.js', 'train.js', 'free.js', 'index.js']);
const majorGameCode = buildGameModule('major', ['codes.js', 'modes.js', 'lessons.js', 'train.js', 'free.js', 'index.js']);
const wordsGameCode = buildGameModule('words', ['vocab.js', 'modes.js', 'lessons.js', 'train.js', 'free.js', 'index.js']);
const cardsGameCode = buildGameModule('cards', ['deck.js', 'modes.js', 'lessons.js', 'train.js', 'free.js', 'index.js']);
const linkGameCode = buildGameModule('link', ['chains.js', 'modes.js', 'lessons.js', 'train.js', 'free.js', 'index.js']);
const calendarGameCode = buildGameModule('calendar', ['logic.js', 'modes.js', 'lessons.js', 'train.js', 'free.js', 'index.js']);
const acrosticGameCode = buildGameModule('acrostic', ['acrostics.js', 'modes.js', 'lessons.js', 'train.js', 'free.js', 'index.js']);
const mindmapGameCode = buildGameModule('mindmap', ['mindmaps.js', 'modes.js', 'lessons.js', 'train.js', 'free.js', 'index.js']);

// Split bundle after palaceGame
const splitMarker = 'mountPalaceMenu(root, ctx);\n    }\n  };';
const markerIdx = original.indexOf(splitMarker);
if (markerIdx === -1) {
  console.error('Failed to locate palaceGame ending in bundle.js');
  process.exit(1);
}

const beforePart = original.slice(0, markerIdx + splitMarker.length);

const i18nRaw = fs.readFileSync(path.join(__dirname, '..', 'js', 'i18n.js'), 'utf8')
  .replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?/g, '')
  .replace(/export\s+function/g, 'function')
  .replace(/export\s+const/g, 'const');

const i18nCode = `
  /* ==========================================================================
     2B. INTERNATIONALIZATION (i18n) – POLSKI 🇵🇱 & AMERICAN ENGLISH 🇺🇸
     ========================================================================== */
  ${i18nRaw}
`;

let updatedBeforePart = beforePart;

// 1. Update function h to translate title, aria-label, placeholder and text kids
const newHFunc = `function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = (typeof v === 'string' && !v.trim().startsWith('<svg') && typeof t === 'function' ? t(v) : v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else if (k === 'title' || k === 'aria-label' || k === 'placeholder') el.setAttribute(k, typeof t === 'function' ? t(v) : v);
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      const val = typeof kid === 'string' && typeof t === 'function' ? t(kid) : kid;
      el.append(val.nodeType ? val : document.createTextNode(val));
    }
    return el;
  }`;

updatedBeforePart = updatedBeforePart.replace(
  /function h\(tag, attrs = \{\}, \.\.\.kids\) \{[\s\S]*?return el;\s*\}/,
  newHFunc
);

// 2. Insert i18nCode right before Section 3 (after stripping any previous 2B block)
const i18nBlockRegex = /\/\*\s*={10,}\s*\n\s*2B\. INTERNATIONALIZATION[\s\S]*?(?=\/\*\s*={10,}\s*\n\s*3\. SOUND)/;
if (i18nBlockRegex.test(updatedBeforePart)) {
  updatedBeforePart = updatedBeforePart.replace(i18nBlockRegex, '');
}

const sec3Header = '/* ==========================================================================\n     3. SOUND (WEB AUDIO API & HARMONIC PENTATONIC TONES)';
if (updatedBeforePart.includes(sec3Header)) {
  updatedBeforePart = updatedBeforePart.replace(sec3Header, i18nCode + '\n  ' + sec3Header);
}

// 3. Update Cat and Tiger say(...) in beforePart
updatedBeforePart = updatedBeforePart.replace(
  /live\.textContent = msg;\s*text\.textContent = '';\s*for \(let i = 1; i <= msg\.length; i\+\+\) \{(\s*if \(id !== typeId\) return;\s*text\.textContent = )msg\.slice\(0, i\);/g,
  'const finalMsg = typeof t === "function" ? t(msg) : msg;\n    live.textContent = finalMsg;\n    text.textContent = "";\n    for (let i = 1; i <= finalMsg.length; i++) {$1finalMsg.slice(0, i);'
);

// 3B. Ensure Digits present() shapeHint and Major mcard words translate
updatedBeforePart = updatedBeforePart
  .replace(
    /shapeHint\.textContent = `\$\{SHAPE_PEGS\[d\]\.emoji\} \$\{SHAPE_PEGS\[d\]\.name\}`;/g,
    'shapeHint.textContent = `${SHAPE_PEGS[d].emoji} ${typeof t === "function" ? t(SHAPE_PEGS[d].name) : SHAPE_PEGS[d].name}`;'
  )
  .replace(
    /\[\.\.\.c\.word\]\.map\(/g,
    '[...(typeof t === "function" ? t(c.word) : c.word)].map('
  );

// Find where Section 15 begins
const gamesEndTarget = '/* ==========================================================================\n     15. APP ROUTING & CORE INIT\n     ========================================================================== */';
const sec15Idx = original.indexOf(gamesEndTarget);
if (sec15Idx === -1) {
  console.error('Failed to locate Section 15 in bundle.js');
  process.exit(1);
}

const restOfBundle = original.slice(sec15Idx + gamesEndTarget.length);

// New 10-games registry
const newGamesRegistry = `
  /* ==========================================================================
     14. GAMES REGISTRY (10 PEŁNYCH SYSTEMÓW PAMIĘCIOWYCH)
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
      accent: ['#16a34a', '#22c55e'], tags: ['Żółwik Zenon 🐢', '6 lekcji', '4 warianty'],
      load: () => Promise.resolve(calendarGame)
    },
    {
      id: 'acrostic', title: 'Akrostychy i rymy', emoji: '🐶', status: 'ready',
      tagline: 'Złap trop pierwszych liter! Planety, tęcza, rzymskie cyfry i reguły szkolne z Pieskiem Łatkiem.',
      accent: ['#f59e0b', '#d97706'], tags: ['Piesek Łatek 🐶', '10 lekcji', '4 warianty'],
      load: () => Promise.resolve(acrosticGame)
    },
    {
      id: 'mindmap', title: 'Mapy myśli', emoji: '🐙', status: 'ready',
      tagline: 'Ogarnij chaos wiedzy! Promieniste gałęzie, słowa-klucze i kolorowe notatki z Ośmiornicą Inką.',
      accent: ['#d946ef', '#8b5cf6'], tags: ['Ośmiornica Inka 🐙', '10 lekcji', '4 warianty'],
      load: () => Promise.resolve(mindmapGame)
    }
  ];
`;

// Update Hub star counter and clean up tournament leftovers
let updatedRest = restOfBundle;

// Replace star counter to include acrostic.train and mindmap.train
const starPattern = /const trainStars =[\s\S]*?store\.get\('(?:calendar|acrostic|mindmap)\.train', \{\}\)\)\.reduce\(\(a, b\) => a \+ b, 0\);/;
if (starPattern.test(updatedRest)) {
  updatedRest = updatedRest.replace(
    starPattern,
    `const trainStars =
      Object.values(store.get('digits.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('palace.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('names.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('major.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('words.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('cards.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('link.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('calendar.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('acrostic.train', {})).reduce((a, b) => a + b, 0) +
      Object.values(store.get('mindmap.train', {})).reduce((a, b) => a + b, 0);`
  );
}

// Remove tournament filter if present
updatedRest = updatedRest.replace(
  "const cards = GAMES.filter(g => g.id !== 'tournament').map(g => {",
  "const cards = GAMES.map(g => {"
);

// Restore standard stat block
updatedRest = updatedRest.replace(
  /h\('div', \{ class: 'stat' \}, h\('b', \{\}, `🎮 \$\{GAMES\.filter\(g => g\.status === 'ready'(?: && g\.id !== 'tournament')?\)\.length\}(?: gier|\/\$\{GAMES\.length\})`\), h\('span', \{\}, '(?:systemów pamięci|gier gotowych)'\)\)/,
  "h('div', { class: 'stat' }, h('b', {}, `🎮 ${GAMES.filter(g => g.status === 'ready').length}/${GAMES.length}`), h('span', {}, 'gier gotowych'))"
);

// Remove tournament banner if present
const bannerTarget = `h('a', {
        class: 'hub-tournament-banner',
        href: '#/tournament'
      },
        h('div', { class: 'htb-left' },
          h('span', { class: 'htb-trophy' }, '🏆'),
          h('div', { class: 'htb-body' },
            h('div', { class: 'htb-tag' }, '★ Nowość V1.1 · Olimpiada Umysłu ★'),
            h('h3', {}, 'Wielobój Pamięciowy'),
            h('p', {}, 'Podejmij 9 wyzwań od wszystkich zwierzątek i zdobądź Puchar Mistrza Pamięci!')
          )
        ),
        h('span', { class: 'htb-btn' }, 'Rozpocznij Turniej ▶')
      ),
      h('h2', { class: 'section-title' }, 'Wybierz grę'),`;

if (updatedRest.includes(bannerTarget)) {
  updatedRest = updatedRest.replace(bannerTarget, "h('h2', { class: 'section-title' }, 'Wybierz grę'),");
}

updatedRest = updatedRest
  .replace(
    /Kotek Mruczek i Tygrysek Leon czekają na trening!/,
    'Twoje urocze zwierzątka czekają na trening!'
  )
  .replace(
    /(?:8|9) potężnych systemów pamięciowych czeka na Ciebie! 🐾/,
    '10 potężnych systemów pamięciowych czeka na Ciebie! 🐾'
  )
  .replace(
    /(?:8|9) genialnych modułów pamięciowych czeka na Ciebie 💪/,
    '10 genialnych modułów pamięciowych czeka na Ciebie 💪'
  );

const langWiring = `
  /* ---------- Język (PL / USA) ---------- */
  const langPlBtn = $('#langPlBtn');
  const langEnBtn = $('#langEnBtn');
  const paintLang = () => {
    const cur = typeof getLang === 'function' ? getLang() : 'pl';
    if (langPlBtn) {
      langPlBtn.classList.toggle('active', cur === 'pl');
      langPlBtn.setAttribute('aria-pressed', String(cur === 'pl'));
    }
    if (langEnBtn) {
      langEnBtn.classList.toggle('active', cur === 'en');
      langEnBtn.setAttribute('aria-pressed', String(cur === 'en'));
    }
  };
  langPlBtn?.addEventListener('click', () => {
    if (typeof getLang === 'function' && getLang() === 'pl') return;
    if (typeof setLang === 'function') setLang('pl');
    paintLang();
    sfx.pop();
    route();
  });
  langEnBtn?.addEventListener('click', () => {
    if (typeof getLang === 'function' && getLang() === 'en') return;
    if (typeof setLang === 'function') setLang('en');
    paintLang();
    sfx.pop();
    route();
  });
  paintLang();
  if (typeof applyLangToDOM === 'function') {
    applyLangToDOM(typeof getLang === 'function' ? getLang() : 'pl');
  }
`;

// Clean any previously injected langWiring in updatedRest
const langBlockRegex = /\/\*\s*-{10}\s*Język \(PL \/ USA\)[\s\S]*?(?=\/\*\s*-{10}\s*Ściągawka|const guide =)/;
if (langBlockRegex.test(updatedRest)) {
  updatedRest = updatedRest.replace(langBlockRegex, '');
}
// Restore soundBtn click listener if corrupted
updatedRest = updatedRest.replace(
  /soundBtn\?\.addEventListener\('click',\s*\(\)\s*=>\s*\{\s*sound\.toggle\(\);\s*paintSound\(\);[\s\S]*?sfx\.pop\(\);\s*\}\);/,
  "soundBtn?.addEventListener('click', () => { sound.toggle(); paintSound(); sfx.pop(); });"
);

// Insert langWiring right before guideBtn setup
const guideTarget = "const guide = $('#guide');";
if (updatedRest.includes(guideTarget) && !updatedRest.includes("langPlBtn")) {
  updatedRest = updatedRest.replace(guideTarget, langWiring + "\n  " + guideTarget);
}

// Ensure route updates DOM on navigation
if (updatedRest.includes("async function route() {") && !updatedRest.includes("applyLangToDOM")) {
  updatedRest = updatedRest.replace(
    "async function route() {",
    "async function route() {\n    if (typeof applyLangToDOM === 'function') applyLangToDOM(typeof getLang === 'function' ? getLang() : 'pl');"
  );
}

// Build assembled bundle
const assembled = [
  updatedBeforePart,
  '\n  /* ==========================================================================\n     NOWE MASKOTKI (LIS, SÓWKA, PAPUGA, SZOP, WIEWIÓRKA, ŻÓŁWIK, PIESEK, OŚMIORNICA)\n     ========================================================================== */\n',
  foxCode,
  owlCode,
  parrotCode,
  raccoonCode,
  squirrelCode,
  turtleCode,
  dogCode,
  octopusCode,
  namesGameCode,
  majorGameCode,
  wordsGameCode,
  cardsGameCode,
  linkGameCode,
  calendarGameCode,
  acrosticGameCode,
  mindmapGameCode,
  newGamesRegistry,
  '  /* ==========================================================================\n     15. APP ROUTING & CORE INIT\n     ========================================================================== */',
  updatedRest
].join('\n\n');

fs.writeFileSync(bundlePath, assembled, 'utf8');
console.log('Successfully bundled all 10 games and mascots into js/bundle.js! File size:', assembled.length, 'bytes');
