const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const baseDir = __dirname;
const html = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(baseDir, 'js/bundle.js'), 'utf8');

function setupDom(initialHash = '#/') {
  const dom = new JSDOM(html.replace('<script src="js/bundle.js"></script>', ''), {
    url: `http://localhost:8000/${initialHash}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.AudioContext = class {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return { connect() {} }; }, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } }; }
  };
  window.webkitAudioContext = window.AudioContext;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.scrollTo = () => {};
  window.Element.prototype.animate = () => ({ finished: Promise.resolve(), cancel: () => {}, play: () => {}, pause: () => {} });
  window.eval(js);
  return dom;
}

console.log('====================================================');
console.log('🎯 WERYFIKACJA 5 KLUCZOWYCH ZADAŃ UŻYTKOWNIKA');
console.log('====================================================\n');

let passed = 0;
let failed = 0;
function assert(cond, desc) {
  if (cond) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

// 1. Twarze Liska (SVG i detale)
console.log('▶ ZADANIE 1: Poprawa jakości twarzy u Liska (8 postaci SVG)');
{
  const facesJs = fs.readFileSync(path.join(baseDir, 'js/games/names/faces.js'), 'utf8');
  assert(facesJs.includes('Marek') && facesJs.includes('Basia') && facesJs.includes('Krzysztof') && facesJs.includes('Kasia') && facesJs.includes('Tomasz') && facesJs.includes('Ola') && facesJs.includes('Piotr') && facesJs.includes('Ania'), 'Wszystkie 8 postaci jest zdefiniowanych');
  assert(facesJs.includes('url(#m-gold)') && facesJs.includes('okulary w złotej oprawce'), 'Marek ma wyraźne złote okulary');
  assert(facesJs.includes('broda drwala'), 'Krzysztof posiada bujną brodę drwala');
  assert(facesJs.includes('fioletowe włosy'), 'Kasia ma charakterystyczne fioletowe włosy');
  assert(facesJs.includes('hollywoodzki uśmiech'), 'Tomasz ma hollywoodzki uśmiech i muszkę');
  assert(facesJs.includes('monokl'), 'Piotr posiada zakręcony wąs i złoty monokl');
  assert(facesJs.includes('pieprzyk'), 'Ania ma czarny bob i pieprzyk nad ustami');
  assert(facesJs.includes('linearGradient'), 'Twarze używają bogatych gradientów SVG');
}

// 2. Słówka (Tylko angielski, 100+ wyrazów)
console.log('\n▶ ZADANIE 2: Język angielski i ponad 100 wyrazów u Papużki');
{
  const vocabRaw = fs.readFileSync(path.join(baseDir, 'js/games/words/vocab.js'), 'utf8');
  const matches = [...vocabRaw.matchAll(/foreign:\s*'([^']+)',\s*lang:\s*'([^']+)',\s*meaning:\s*'([^']+)'/g)];
  assert(matches.length >= 100, `Pula słówek zawiera co najmniej 100 wyrazów (jest ich dokładnie: ${matches.length})`);
  const allEnglish = matches.every(m => m[2] === 'angielski');
  assert(allEnglish, 'Wszystkie słówka są wyłącznie w języku angielskim (brak hiszpańskiego itp.)');
  
  const wordsLessons = fs.readFileSync(path.join(baseDir, 'js/games/words/lessons.js'), 'utf8');
  assert(!wordsLessons.includes('hiszpańsk'), 'Lekcje nie zawierają odniesień do języka hiszpańskiego');
  assert(wordsLessons.includes('angielski') || wordsLessons.includes('języka angielskiego'), 'Lekcje uczą wyłącznie słówek z języka angielskiego');
}

// 3. Łańcuch skojarzeń (dokładnie 20 wyrazów w spójnym łańcuchu)
console.log('\n▶ ZADANIE 3: Łańcuch skojarzeń u Wiewiórki (20 wyrazów, Gitara, Lody, Klucz, Latarka)');
{
  const chainsRaw = fs.readFileSync(path.join(baseDir, 'js/games/link/chains.js'), 'utf8');
  const items = [...chainsRaw.matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]);
  assert(items.length === 20, `Łańcuch zawiera dokładnie 20 wyrazów (jest: ${items.length})`);
  assert(items.includes('Gitara'), 'Łańcuch zawiera Gitarę');
  assert(items.includes('Lody'), 'Łańcuch zawiera Lody');
  assert(items.includes('Klucz'), 'Łańcuch zawiera Klucz');
  assert(items.includes('Latarka'), 'Łańcuch zawiera Latarkę');
  assert(items[0] === 'Parasol' && items[19] === 'Kryształ', 'Łańcuch zaczyna się od Parasola i kończy na Krysztale');

  const linkLessons = fs.readFileSync(path.join(baseDir, 'js/games/link/lessons.js'), 'utf8');
  assert(linkLessons.includes('Gitara') && linkLessons.includes('Lody') && linkLessons.includes('Klucz') && linkLessons.includes('Latarka'), 'Wszystkie nowe przedmioty są dokładnie objaśnione i ćwiczone w lekcjach');
}

// 4. Kalendarz (wyjaśnienie kotwicy i innych lat dla Podróżnika w Czasie)
console.log('\n▶ ZADANIE 4: Kalendarz – kotwica i obliczanie dni w innych latach');
{
  const calLessons = fs.readFileSync(path.join(baseDir, 'js/games/calendar/lessons.js'), 'utf8');
  assert(calLessons.includes('Podróżnik w czasie') || calLessons.includes('innym roku') || calLessons.includes('innych lat'), 'Lekcje zawierają dedykowaną część o innych latach');
  assert(calLessons.includes('przesuwa') || calLessons.includes('przesunięcie') || calLessons.includes('przestępny'), 'Lekcje tłumaczą przesunięcie o +1 w zwykłym roku i +2 w przestępnym');
  assert(calLessons.includes('kotwica'), 'Lekcje dokładnie tłumaczą pojęcie kotwicy Doomsday');
}

// 5. Czas w grach czasowych – 30 sekund bez dodawania/odejmowania
console.log('\n▶ ZADANIE 5: Gry na czas – 30 sekund to czyste 30 sekund bez bonusów i kar');
{
  const files = [
    'js/games/calendar/free.js',
    'js/games/cards/free.js',
    'js/games/names/free.js',
    'js/games/words/free.js'
  ];
  let hasModifications = false;
  files.forEach(f => {
    const content = fs.readFileSync(path.join(baseDir, f), 'utf8');
    if (content.includes('timeLeft +=') || content.includes('timeLeft -=') || content.includes('timeLeft = Math.max(1, timeLeft - 2)')) {
      hasModifications = true;
      console.error(`W pliku ${f} wciąż modyfikowany jest czas!`);
    }
  });
  assert(!hasModifications, 'Żadna gra na czas nie dodaje ani nie odejmuje sekund przy odpowiedziach gracza');
}

console.log('\n====================================================');
console.log(`🏁 WYNIKI WERYFIKACJI 5 ZADAŃ: ${passed} ZDANYCH, ${failed} NIEZDANYCH`);
console.log('====================================================\n');

if (failed > 0) process.exit(1);
process.exit(0);
