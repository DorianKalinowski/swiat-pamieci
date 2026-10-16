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
    .replace(/pokeLines = POKE/g, `pokeLines = ${pokeConst}`);
}

const foxCode = cleanMascot(readMod('fox.js'), 'fox');
const owlCode = cleanMascot(readMod('owl.js'), 'owl');
const parrotCode = cleanMascot(readMod('parrot.js'), 'parrot');
const raccoonCode = cleanMascot(readMod('raccoon.js'), 'raccoon');
const squirrelCode = cleanMascot(readMod('squirrel.js'), 'squirrel');
const turtleCode = cleanMascot(readMod('turtle.js'), 'turtle');

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

// Split bundle after palaceGame
const splitMarker = 'mountPalaceMenu(root, ctx);\n    }\n  };';
const markerIdx = original.indexOf(splitMarker);
if (markerIdx === -1) {
  console.error('Failed to locate palaceGame ending in bundle.js');
  process.exit(1);
}

const beforePart = original.slice(0, markerIdx + splitMarker.length);

// Find where Section 15 begins
const gamesEndTarget = '/* ==========================================================================\n     15. APP ROUTING & CORE INIT\n     ========================================================================== */';
const sec15Idx = original.indexOf(gamesEndTarget);
if (sec15Idx === -1) {
  console.error('Failed to locate Section 15 in bundle.js');
  process.exit(1);
}

const restOfBundle = original.slice(sec15Idx + gamesEndTarget.length);

// New 8-games registry
const newGamesRegistry = `
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
`;

// Update Hub star counter and greeting
let updatedRest = restOfBundle;
const starPattern = /const trainStars =[\s\S]*?store\.get\('palace\.train', \{\}\)\)\.reduce\(\(a, b\) => a \+ b, 0\);/;
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
      Object.values(store.get('calendar.train', {})).reduce((a, b) => a + b, 0);`
  );
}

updatedRest = updatedRest
  .replace(
    /Kotek Mruczek i Tygrysek Leon czekają na trening!/,
    'Twoje urocze zwierzątka czekają na trening!'
  )
  .replace(
    /Wybierz „Cyfry” z kotem lub „Pałac pamięci” z tygryskiem! 🐾/,
    '8 potężnych systemów pamięciowych czeka na Ciebie! 🐾'
  )
  .replace(
    /Dwa moduły pamięciowe czekają na Ciebie 💪/,
    '8 genialnych modułów pamięciowych czeka na Ciebie 💪'
  );

// Build assembled bundle
const assembled = [
  beforePart,
  '\n  /* ==========================================================================\n     NOWE MASKOTKI (LIS, SÓWKA, PAPUGA, SZOP, WIEWIÓRKA, ŻÓŁWIK)\n     ========================================================================== */\n',
  foxCode,
  owlCode,
  parrotCode,
  raccoonCode,
  squirrelCode,
  turtleCode,
  namesGameCode,
  majorGameCode,
  wordsGameCode,
  cardsGameCode,
  linkGameCode,
  calendarGameCode,
  newGamesRegistry,
  '  /* ==========================================================================\n     15. APP ROUTING & CORE INIT\n     ========================================================================== */',
  updatedRest
].join('\n\n');

fs.writeFileSync(bundlePath, assembled, 'utf8');
console.log('Successfully bundled all 8 games and mascots into js/bundle.js! File size:', assembled.length, 'bytes');
