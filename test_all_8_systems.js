const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname);
const html = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8')
  .replace('<script src="js/bundle.js"></script>', '');
const bundle = fs.readFileSync(path.join(baseDir, 'js', 'bundle.js'), 'utf8');

function setupDom(initialHash = '#/') {
  const dom = new JSDOM(html, {
    url: 'http://localhost:8080/' + initialHash,
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  const { window } = dom;

  window.AudioContext = class {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; }, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } }; }
  };
  window.webkitAudioContext = window.AudioContext;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.scrollTo = () => {};

  window.addEventListener('error', e => {
    console.error('  [DOM RUNTIME ERROR]:', e.error?.stack || e.error || e.message);
  });

  window.eval(bundle);
  return dom;
}

async function waitFor(fn, desc, timeout = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const val = fn();
    if (val !== null && val !== undefined) {
      if (typeof val === 'object' && 'length' in val && val.length === 0) {
        // empty
      } else {
        return val;
      }
    }
    await new Promise(r => setTimeout(r, 40));
  }
  throw new Error(`Timeout waiting for: ${desc}`);
}

async function runMasterTest() {
  console.log('====================================================');
  console.log('👑 TEST MISTRZOWSKI: 8 SYSTEMÓW PAMIĘCIOWYCH & MASKOTEK');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. HUB & WSZYSTKIE 8 GIER
  console.log('▶ TEST 1: Weryfikacja Hubu głównego (8 gotowych gier)');
  const dom = setupDom('#/');
  const doc = dom.window.document;

  await waitFor(() => doc.querySelector('.game-grid .game-card'), 'Karty gier na hubie');
  const cards = doc.querySelectorAll('.game-grid .game-card');
  assert(cards.length === 8, `Dokładnie 8 kart gier w siatce (znaleziono: ${cards.length})`);

  const readyCards = doc.querySelectorAll('.game-grid .game-card:not(.soon)');
  assert(readyCards.length === 8, `Wszystkie 8 gier ma status 'ready' (znaleziono: ${readyCards.length})`);

  const expectedIds = ['digits', 'palace', 'names', 'major', 'words', 'cards', 'link', 'calendar'];
  expectedIds.forEach(id => {
    const card = doc.querySelector(`.game-card[href="#/${id}"]`);
    assert(card !== null, `Gra #${id} posiada aktywny link na hubie`);
  });

  // 2. WERYFIKACJA GEOMETRII OCZU MASKOTEK
  console.log('\n▶ TEST 2: Bezpieczne oczy i sloty SVG we wszystkich maskotkach');
  const mascots = [
    { selector: '.cat', name: 'Kotek Mruczek 🐱' },
    { selector: '.tiger', name: 'Tygrysek Leon 🐯' },
    { selector: '.fox', name: 'Lisek Bystrzak 🦊' },
    { selector: '.owl', name: 'Sówka Profesor 🦉' },
    { selector: '.parrot', name: 'Papużka Pola 🦜' },
    { selector: '.raccoon', name: 'Szop Magik 🦝' },
    { selector: '.squirrel', name: 'Wiewiórka Basia 🐿️' },
    { selector: '.turtle', name: 'Żółwik Zegarowy 🐢' }
  ];

  // Render home cat
  const catSvg = doc.querySelector('svg.cat');
  assert(catSvg !== null, 'Kotek Mruczek jest wyrenderowany na Hubie');
  const catEyeSlots = catSvg.querySelectorAll('.eye-slot');
  assert(catEyeSlots.length === 2, 'Kotek ma dokładnie 2 sloty na oczy');
  assert(catEyeSlots[0]?.getAttribute('transform') === 'translate(76 90)', 'Lewe oko kotka translate(76 90)');
  assert(catEyeSlots[1]?.getAttribute('transform') === 'translate(124 90)', 'Prawe oko kotka translate(124 90)');

  // 3. WERYFIKACJA MENU I MASKOTKI KAŻDEJ Z 8 GIER
  console.log('\n▶ TEST 3: Weryfikacja menu i maskotek dla każdej z 8 gier');
  for (const item of [
    { id: 'digits', mascotClass: 'cat', name: 'Kotek (Cyfry)', modes: 6, title: 'Cyfry' },
    { id: 'palace', mascotClass: 'tiger', name: 'Tygrysek (Pałac)', modes: 5, title: 'Pałac' },
    { id: 'names', mascotClass: 'fox', name: 'Lisek (Imiona)', modes: 4, title: 'Imiona' },
    { id: 'major', mascotClass: 'owl', name: 'Sówka (Major)', modes: 4, title: 'Major' },
    { id: 'words', mascotClass: 'parrot', name: 'Papużka (Słówka)', modes: 4, title: 'Słówka' },
    { id: 'cards', mascotClass: 'raccoon', name: 'Szop (Karty)', modes: 4, title: 'Karty' },
    { id: 'link', mascotClass: 'squirrel', name: 'Wiewiórka (Łańcuch)', modes: 4, title: 'Łańcuch' },
    { id: 'calendar', mascotClass: 'turtle', name: 'Żółwik (Kalendarz)', modes: 4, title: 'Kalendarz' }
  ]) {
    dom.window.location.hash = `#/${item.id}`;
    const svg = await waitFor(() => {
      const h1 = doc.querySelector('.game-head h1');
      const s = doc.querySelector(`svg.${item.mascotClass}`);
      return (h1 && h1.textContent.includes(item.title) && s) ? s : null;
    }, `Ekran menu i maskotka dla ${item.id}`);

    assert(svg !== null, `${item.name} renderuje się poprawnie w menu gry`);

    const slots = svg.querySelectorAll('.eye-slot');
    assert(slots.length === 2, `${item.name} posiada 2 bezpieczne sloty na oczy`);
    assert(slots[0]?.getAttribute('transform') === 'translate(76 90)', `${item.name} lewe oko translate(76 90)`);
    assert(slots[1]?.getAttribute('transform') === 'translate(124 90)', `${item.name} prawe oko translate(124 90)`);

    const modeCards = doc.querySelectorAll('.mode-list .mode-card');
    assert(modeCards.length === item.modes, `${item.id}: znaleziono dokładnie ${item.modes} wariantów gry swobodnej`);

    const trainCard = doc.querySelector('.train-card');
    assert(trainCard !== null, `${item.id}: karta szkolenia jest widoczna i aktywna`);
  }

  // 4. PRZEJŚCIE INTERAKTYWNEJ LEKCJI 1 W KAŻDEJ Z NOWYCH GIER
  console.log('\n▶ TEST 4: Przejście interaktywnej lekcji 1 w 6 nowych modułach');

  // 4a. NAMES (Lisek)
  dom.window.location.hash = '#/names/train/1';
  await waitFor(() => doc.querySelector('.step-head h2')?.textContent.includes('Kotwica twarzy'), 'Lekcja 1 w Names');
  assert(true, 'Lekcja 1 w Names załadowana');
  let btns = doc.querySelectorAll('.task-box .btn-opt');
  btns[0].click();
  await waitFor(() => doc.querySelector('.btn-opt.correct'), 'Poprawna odpowiedź Names');
  assert(doc.querySelector('.btn-opt.correct') !== null, 'Zaznaczono poprawną kotwicę Marka (okulary)');

  // 4b. MAJOR (Sówka)
  dom.window.location.hash = '#/major/train/1';
  await waitFor(() => doc.querySelector('.step-head h2')?.textContent.includes('Cyfry 0 i 1'), 'Lekcja 1 w Major');
  assert(true, 'Lekcja 1 w Major załadowana');
  btns = doc.querySelectorAll('.task-box .btn-opt');
  btns[0].click();
  await waitFor(() => doc.querySelector('.btn-opt.correct'), 'Poprawna odpowiedź Major');
  assert(doc.querySelector('.btn-opt.correct') !== null, 'Zaznaczono poprawną spółgłoskę dla 1 (T/D)');

  // 4c. WORDS (Papużka)
  dom.window.location.hash = '#/words/train/1';
  await waitFor(() => doc.querySelector('.step-head h2')?.textContent.includes('Metoda słów-kluczy'), 'Lekcja 1 w Words');
  assert(true, 'Lekcja 1 w Words załadowana');
  btns = doc.querySelectorAll('.task-box .btn-opt');
  btns[0].click();
  await waitFor(() => doc.querySelector('.btn-opt.correct'), 'Poprawna odpowiedź Words');
  assert(doc.querySelector('.btn-opt.correct') !== null, 'Zaznaczono poprawną definicję metody słów-kluczy');

  // 4d. CARDS (Szop)
  dom.window.location.hash = '#/cards/train/1';
  await waitFor(() => doc.querySelector('.step-head h2')?.textContent.includes('Cztery żywioły talii'), 'Lekcja 1 w Cards');
  assert(true, 'Lekcja 1 w Cards załadowana');
  btns = doc.querySelectorAll('.task-box .btn-opt');
  btns[0].click();
  await waitFor(() => doc.querySelector('.btn-opt.correct'), 'Poprawna odpowiedź Cards');
  assert(doc.querySelector('.btn-opt.correct') !== null, 'Zaznaczono poprawny motyw dla Karo (diamenty)');

  // 4e. LINK (Wiewiórka)
  dom.window.location.hash = '#/link/train/1';
  await waitFor(() => doc.querySelector('.step-head h2')?.textContent.includes('Efekt domina i siła akcji'), 'Lekcja 1 w Link');
  assert(true, 'Lekcja 1 w Link załadowana');
  btns = doc.querySelectorAll('.task-box .btn-opt');
  btns[0].click();
  await waitFor(() => doc.querySelector('.btn-opt.correct'), 'Poprawna odpowiedź Link');
  assert(doc.querySelector('.btn-opt.correct') !== null, 'Zaznaczono dynamiczną akcję dla parasola i arbuza');

  // 4f. CALENDAR (Żółwik)
  dom.window.location.hash = '#/calendar/train/1';
  await waitFor(() => doc.querySelector('.step-head h2')?.textContent.includes('Sekret kalendarza w głowie'), 'Lekcja 1 w Calendar');
  assert(true, 'Lekcja 1 w Calendar załadowana');
  btns = doc.querySelectorAll('.task-box .btn-opt');
  btns[0].click();
  await waitFor(() => doc.querySelector('.btn-opt.correct'), 'Poprawna odpowiedź Calendar');
  assert(doc.querySelector('.btn-opt.correct') !== null, 'Zaznaczono poprawny dzień dla 5 (Piątek)');

  // 5. TESTY GRY SWOBODNEJ & BRAKU PRZYCISKU UDOSTĘPNIJ
  console.log('\n▶ TEST 5: Gry swobodne i weryfikacja braku przycisku „Udostępnij”');
  const freeRoutes = [
    '#/digits/free/classic',
    '#/palace/free/explore',
    '#/names/free/who',
    '#/major/free/peg',
    '#/words/free/translate',
    '#/cards/free/pao',
    '#/link/free/forward',
    '#/calendar/free/weekday'
  ];

  for (const fRoute of freeRoutes) {
    dom.window.location.hash = fRoute;
    await waitFor(() => doc.querySelector('.hud'), `Gra swobodna ${fRoute}`);
    assert(doc.querySelector('.hud') !== null, `Trasa ${fRoute} uruchamia się prawidłowo`);
    const shareBtn = doc.querySelector('button.share-btn, button[aria-label*="Udostępnij"], button[aria-label*="share"]');
    assert(shareBtn === null, `Brak przycisku „Udostępnij” na trasie ${fRoute}`);
  }

  // 6. DIALOG POBIERZ (TYLKO ANDROID I IOS)
  console.log('\n▶ TEST 6: Modal instalacji (tylko Android i iOS, brak info o PC)');
  const installModal = doc.querySelector('#installModal');
  assert(installModal !== null, 'Modal instalacji istnieje w DOM');
  const installText = installModal.textContent;
  assert(installText.includes('Androidzie'), 'Zawiera instrukcję dla Androida');
  assert(installText.includes('iPhone / iPad'), 'Zawiera instrukcję dla iPhone / iPad');
  assert(!installText.toLowerCase().includes('komputer') && !installText.toLowerCase().includes('pulpit') && !installText.toLowerCase().includes('windows'),
    'Brak wzmianki o pobieraniu na komputer');

  // 7. ŚCIĄGAWKA TECHNIK (8 SYSTEMÓW)
  console.log('\n▶ TEST 7: Modal ściągawki technik (pełne 8 systemów)');
  const guide = doc.querySelector('#guide');
  assert(guide !== null, 'Modal ściągawki istnieje');
  const guideCards = guide.querySelectorAll('.guide-card');
  assert(guideCards.length === 8, `Dokładnie 8 kart technik w ściągawce (znaleziono: ${guideCards.length})`);

  console.log('\n====================================================');
  console.log(`🏁 WYNIKI KOŃCOWE: ${passed} ZDANYCH, ${failed} NIEZDANYCH`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runMasterTest().catch(err => {
  console.error('BŁĄD W TRAKCIE TESTÓW:', err);
  process.exit(1);
});
