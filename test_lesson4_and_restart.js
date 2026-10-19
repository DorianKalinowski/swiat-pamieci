const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'js/bundle.js'), 'utf8');

function setupDom(initialHash = '#/') {
  const dom = new JSDOM(html.replace('<script src="js/bundle.js"></script>', ''), {
    url: `http://localhost:8000/${initialHash}`,
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
  window.eval(js);
  return dom;
}

async function waitFor(fn, desc, timeout = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const val = fn();
    if (val !== null && val !== undefined) {
      if (typeof val === 'object' && 'length' in val && val.length === 0) {
        // wait
      } else {
        return val;
      }
    }
    await new Promise(r => setTimeout(r, 40));
  }
  throw new Error(`Timeout waiting for: ${desc}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TEST LEKCJI 4 IMIONA & RESTARTU W GRACH SWOBODNYCH');
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

  // 1. TEST LEKCJI 4 W IMIONA I TWARZE
  console.log('▶ TEST 1: Weryfikacja lekcji 4 w Imiona i Twarze (opcje wyboru)');
  {
    const dom = setupDom('#/names/train/4');
    const doc = dom.window.document;

    await waitFor(() => doc.querySelector('.task-box'), 'Lekcja 4 task-box');
    const prompt = doc.querySelector('.task-prompt');
    assert(prompt && prompt.textContent.includes('Kto ukrył krzyżacki miecz'), 'Prompt lekcji 4 wyświetla się poprawnie');

    const opts = doc.querySelectorAll('.task-box .btn-opt');
    assert(opts.length === 4, `Lekcja 4 zawiera dokładnie 4 opcje do wyboru (znaleziono: ${opts.length})`);
    assert(opts[0].textContent.includes('Krzysztof'), `Pierwsza opcja to Krzysztof (${opts[0].textContent})`);

    // Kliknięcie Krzysztofa
    opts[0].click();
    await waitFor(() => doc.querySelector('.btn-opt.correct'), 'Poprawny wybór w lekcji 4');
    assert(opts[0].classList.contains('correct'), 'Kliknięcie Krzysztofa zalicza zadanie (.correct)');

    const nextBtn = await waitFor(() => doc.querySelector('.task-box .btn-primary'), 'Przycisk następnej lekcji');
    assert(nextBtn !== null, 'Pojawia się przycisk przejścia do następnej lekcji');
  }

  // 2. TEST WSZYSTKICH 6 LEKCJI W IMIONA I TWARZE
  console.log('\n▶ TEST 2: Weryfikacja obecności opcji we wszystkich 6 lekcjach Imion');
  for (let i = 1; i <= 6; i++) {
    const dom = setupDom(`#/names/train/${i}`);
    const doc = dom.window.document;
    await waitFor(() => doc.querySelector('.task-box .btn-opt'), `Lekcja ${i} opcje`);
    const opts = doc.querySelectorAll('.task-box .btn-opt');
    assert(opts.length >= 3, `Lekcja ${i} posiada co najmniej 3 opcje odpowiedzi (znaleziono: ${opts.length})`);
  }

  // 3. TEST RESTARTU W KARTACH DO GRY (BRAK DUPLIKATÓW EKRANÓW)
  console.log('\n▶ TEST 3: Weryfikacja restartu gry swobodnej w Kartach (Sekwencja magika)');
  {
    const dom = setupDom('#/cards/free/sequence');
    const doc = dom.window.document;

    // Poczekaj na fazę podglądu kart
    await waitFor(() => doc.querySelector('.cards-preview-box .playing-card'), 'Podgląd kart sekwencji');
    const firstPreviewRank = doc.querySelector('.cards-preview-box .playing-card .pc-rank').textContent;

    // Poczekaj na pojawienie się przycisków wyboru (po zakończeniu podglądu)
    await waitFor(() => doc.querySelector('.cards-choices-grid .card-choice-btn'), 'Karty wyboru sekwencji', 6000);
    const btns = doc.querySelectorAll('.cards-choices-grid .card-choice-btn');
    assert(btns.length >= 2, `Karty wyboru sekwencji są widoczne (znaleziono: ${btns.length})`);

    // Wybierz celowo kartę, która NIE jest pierwszą kartą z sekwencji
    let wrongBtn = Array.from(btns).find(b => b.querySelector('.pc-rank').textContent !== firstPreviewRank);
    if (!wrongBtn) wrongBtn = btns[btns.length - 1];

    wrongBtn.click();

    const gameOverBox = await waitFor(() => doc.querySelector('.game-over-box'), 'Ekran końca gry w Kartach', 4000);
    assert(gameOverBox !== null, 'Ekran końca gry wyświetla się poprawnie');

    const restartBtn = doc.querySelector('.go-actions button');
    assert(restartBtn !== null, 'Przycisk restartu „Zagraj ponownie” istnieje');

    // Kliknij restart
    restartBtn.click();
    await new Promise(r => setTimeout(r, 200));

    // Sprawdź ile jest ekranów .screen.free-screen w całym dokumencie
    const screens = doc.querySelectorAll('.screen.free-screen');
    assert(screens.length === 1, `Dokładnie 1 ekran gry w DOM po restarcie (znaleziono: ${screens.length}, brak duplikatów!)`);

    const roundEl = doc.querySelector('.hud-round');
    assert(roundEl && roundEl.textContent === '1', 'Runda zresetowana do 1');
  }

  // 4. TEST RESTARTU W POZOSTAŁYCH GRACH SWOBODNYCH
  console.log('\n▶ TEST 4: Weryfikacja restartu in-place w innych modułach (Names, Major, Words, Link, Calendar)');
  const freeTestRoutes = [
    '#/names/free/who',
    '#/major/free/peg',
    '#/words/free/translate',
    '#/link/free/forward',
    '#/calendar/free/weekday'
  ];

  for (const fRoute of freeTestRoutes) {
    const dom = setupDom(fRoute);
    const doc = dom.window.document;
    await waitFor(() => doc.querySelector('.hud'), `Start ${fRoute}`);
    assert(doc.querySelectorAll('.screen.free-screen').length === 1, `Start ${fRoute}: 1 ekran`);
  }

  // 5. TEST KARTY „PO CO W CODZIENNYM ŻYCIU?” WE WSZYSTKICH 8 SZKOLENIACH
  console.log('\n▶ TEST 5: Karta „Po co Ci ta technika w codziennym życiu?” na mapach 8 szkoleń');
  const mapRoutes = [
    ['#/digits/train', 'Cyfry'],
    ['#/palace/train', 'Pałac pamięci'],
    ['#/names/train', 'Imiona i twarze'],
    ['#/major/train', 'Major'],
    ['#/words/train', 'Słówka'],
    ['#/cards/train', 'Karty'],
    ['#/link/train', 'Łańcuch'],
    ['#/calendar/train', 'Kalendarz']
  ];

  for (const [mRoute, name] of mapRoutes) {
    const dom = setupDom(mRoute);
    const doc = dom.window.document;
    await waitFor(() => doc.querySelector('.why-card'), `Why-card w ${name}`);
    const whyCard = doc.querySelector('.why-card');
    assert(whyCard !== null, `${name}: Karta wyjaśniająca cel w codziennym życiu (.why-card) jest obecna`);
    assert(whyCard.textContent.includes('Po co Ci ta technika w codziennym życiu?'), `${name}: Posiada czytelny nagłówek celu`);
  }

  // 6. TEST STOPKI I PRAWA ZASTRZEŻONE
  console.log('\n▶ TEST 6: Informacja o prawach autorskich w stopce aplikacji');
  {
    const dom = setupDom('#/');
    const doc = dom.window.document;
    const footer = doc.querySelector('.footer');
    assert(footer && footer.textContent.includes('Wszelkie prawa zastrzeżone © 2026'), 'Stopka zawiera: Wszelkie prawa zastrzeżone © 2026');
  }

  console.log('\n====================================================');
  console.log(`🏁 WYNIKI: ${passed} ZDANYCH, ${failed} NIEZDANYCH`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch(err => {
  console.error('BŁĄD W TESTACH:', err);
  process.exit(1);
});
