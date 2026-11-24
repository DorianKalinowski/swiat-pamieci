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

async function waitFor(doc, fn, desc, timeout = 7000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const val = fn();
    if (val !== null && val !== undefined) {
      if (typeof val === 'boolean') {
        if (val) return true;
      } else if (typeof val === 'object' && 'length' in val && val.length === 0) {
        // wait
      } else {
        return val;
      }
    }
    await new Promise(r => setTimeout(r, 40));
  }
  throw new Error(`Timeout waiting for: ${desc}`);
}

console.log('====================================================');
console.log('🐙🐶 TESTY V1.1: PIESEK ŁATEK & OŚMIORNICA INKA (MAPY MYŚLI)');
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

async function runTests() {
  // ----------------------------------------------------
  // TEST 1: PIESEK ŁATEK - MASKOTKA SVG, BEZPIECZNE OCZY I ANIMACJE
  // ----------------------------------------------------
  console.log('▶ TEST 1: Piesek Łatek 🐶 – Struktura SVG i sloty oczu');
  {
    const dom = setupDom('#/acrostic');
    const doc = dom.window.document;
    const dogEl = await waitFor(doc, () => doc.querySelector('.dog'), 'dog SVG');
    assert(!!dogEl, 'Piesek Łatek jest poprawnie renderowany w widoku gry');

    const eyeSlots = doc.querySelectorAll('.dog .eye-slot');
    assert(eyeSlots.length === 2, `Piesek posiada dokładnie 2 bezpieczne sloty oczu (znaleziono: ${eyeSlots.length})`);
    assert(eyeSlots[0].getAttribute('transform') === 'translate(76 90)', 'Lewe oko psa ma transform translate(76 90)');
    assert(eyeSlots[1].getAttribute('transform') === 'translate(124 90)', 'Prawe oko psa ma transform translate(124 90)');

    const earEl = doc.querySelector('.dog .ear-l');
    assert(!!earEl, 'Piesek posiada oklapnięte uszka (.ear-l)');

    const tailEl = doc.querySelector('.dog .tail');
    assert(!!tailEl, 'Piesek posiada merdający ogonek (.tail)');

    const modeCards = doc.querySelectorAll('.mode-list .mode-card');
    assert(modeCards.length === 4, `Piesek posiada 4 tryby gry swobodnej (znaleziono: ${modeCards.length})`);
  }

  // ----------------------------------------------------
  // TEST 1B: PIESEK ŁATEK - 10 MISTRZOWSKICH LEKCJI SZKOLENIOWYCH
  // ----------------------------------------------------
  console.log('\n▶ TEST 1B: Piesek Łatek 🐶 – Wszystkie 10 lekcji akrostychów i rymów');
  {
    const dom = setupDom('#/acrostic/train');
    const doc = dom.window.document;

    const whyCard = await waitFor(doc, () => doc.querySelector('.why-card'), 'why-card pieska');
    assert(!!whyCard, 'Karta celu życiowego (.why-card) istnieje na mapie lekcji Akrostychów');
    assert(whyCard.textContent.includes('Po co Ci ta technika w codziennym życiu?'), 'Karta ma właściwy nagłówek celu');

    const stepNodes = doc.querySelectorAll('.step-node');
    assert(stepNodes.length === 10, `Znaleziono dokładnie 10 węzłów lekcji Akrostychów (znaleziono: ${stepNodes.length})`);

    const chapters = doc.querySelectorAll('.chapter');
    assert(chapters.length === 4, `Lekcje Pieska są podzielone na 4 rozdziały (znaleziono: ${chapters.length})`);

    // Sprawdzenie każdej lekcji Pieska z osobna
    for (let l = 1; l <= 10; l++) {
      dom.window.location.hash = `#/acrostic/train/${l}`;
      const titleEl = await waitFor(doc, () => doc.querySelector('.step-head h2'), `lekcja ${l} psa title`);
      assert(!!titleEl, `Lekcja ${l} Pieska Łatka załadowana poprawnie`);

      const theoryBox = doc.querySelector('.theory-box');
      assert(!!theoryBox && theoryBox.textContent.length > 80, `Lekcja ${l} Pieska posiada obszerną, zrozumiałą teorię`);

      const options = doc.querySelectorAll('.task-box .btn-opt');
      assert(options.length >= 3, `Lekcja ${l} Pieska zawiera pytania sprawdzające (znaleziono opcji: ${options.length})`);

      // Klikamy poprawną odpowiedź (indeks 0 we wszystkich lekcjach)
      options[0].click();
      await waitFor(doc, () => doc.querySelector('.btn-opt.correct'), `lekcja ${l} psa correct`);
      assert(!!doc.querySelector('.btn-opt.correct'), `Lekcja ${l} Pieska: poprawna odpowiedź została zaliczona z wyróżnieniem`);
    }
  }

  // ----------------------------------------------------
  // TEST 2: OŚMIORNICA INKA - MASKOTKA SVG, 8 MACEK, BERET, PĘDZEL I OCZY
  // ----------------------------------------------------
  console.log('\n▶ TEST 2: Ośmiornica Inka 🐙 – Struktura SVG, 8 macek, beret i sloty oczu');
  {
    const dom = setupDom('#/mindmap');
    const doc = dom.window.document;
    const octoEl = await waitFor(doc, () => doc.querySelector('.octopus'), 'octopus SVG');
    assert(!!octoEl, 'Ośmiornica Inka jest poprawnie renderowana w widoku gry');

    const eyeSlots = doc.querySelectorAll('.octopus .eye-slot');
    assert(eyeSlots.length === 2, `Ośmiornica posiada dokładnie 2 bezpieczne sloty oczu (znaleziono: ${eyeSlots.length})`);
    assert(eyeSlots[0].getAttribute('transform') === 'translate(76 90)', 'Lewe oko Inki ma transform translate(76 90)');
    assert(eyeSlots[1].getAttribute('transform') === 'translate(124 90)', 'Prawe oko Inki ma transform translate(124 90)');

    const backTentacles = doc.querySelectorAll('.octopus .tentacles-back path');
    const frontTentacles = doc.querySelectorAll('.octopus .tentacles-front path');
    const totalTentacles = backTentacles.length + frontTentacles.length;
    assert(totalTentacles === 8, `Ośmiornica Inka posiada dokładnie 8 promieniście ułożonych macek (znaleziono: ${totalTentacles})`);

    const beret = doc.querySelector('.octopus .beret');
    assert(!!beret, 'Ośmiornica nosi artystyczny turkusowy beret myślicielki');

    const brush = doc.querySelector('.octopus .octo-brush');
    assert(!!brush, 'Ośmiornica trzyma w macce pędzel / pióro atramentowe');

    const modeCards = doc.querySelectorAll('.mode-list .mode-card');
    assert(modeCards.length === 4, `Ośmiornica posiada 4 tryby gry swobodnej (znaleziono: ${modeCards.length})`);
  }

  // ----------------------------------------------------
  // TEST 3: HUB GŁÓWNY - 10 GIER, BRAK WIELOBOJU
  // ----------------------------------------------------
  console.log('\n▶ TEST 3: Hub Główny – 10 kart zwierzątek i brak banera Wieloboju');
  {
    const dom = setupDom('#/');
    const doc = dom.window.document;

    const gameCards = await waitFor(doc, () => {
      const c = doc.querySelectorAll('.game-grid .game-card');
      return c.length > 0 ? c : null;
    }, 'game cards on hub');
    assert(gameCards.length === 10, `Na Hubie znajduje się dokładnie 10 kart gier zwierzątek (znaleziono: ${gameCards.length})`);

    const banner = doc.querySelector('.hub-tournament-banner');
    assert(!banner, 'Baner Wieloboju Pamięciowego NIE istnieje na Hubie (usunięty zgodnie z życzeniem)');

    const octoCard = doc.querySelector('.game-card[href="#/mindmap"]');
    assert(!!octoCard, 'Karta Map Myśli z Ośmiornicą Inką jest widoczna na Hubie');
    assert(octoCard.textContent.includes('Mapy myśli'), 'Karta ma tytuł Mapy myśli');
    assert(octoCard.textContent.includes('🐙'), 'Karta posiada emoji ośmiornicy');

    const dogCard = doc.querySelector('.game-card[href="#/acrostic"]');
    assert(!!dogCard, 'Karta Akrostychów z Pieskiem Łatkiem jest widoczna na Hubie');
  }

  // ----------------------------------------------------
  // TEST 4: OŚMIORNICA INKA - 10 KOMPLEKSOWYCH LEKCJI SZKOLENIOWYCH
  // ----------------------------------------------------
  console.log('\n▶ TEST 4: Ośmiornica Inka 🐙 – Wszystkie 10 lekcji szkoleniowych');
  {
    const dom = setupDom('#/mindmap/train');
    const doc = dom.window.document;

    const whyCard = await waitFor(doc, () => doc.querySelector('.why-card'), 'why-card');
    assert(!!whyCard, 'Karta celu życiowego (.why-card) istnieje na mapie lekcji Map Myśli');
    assert(whyCard.textContent.includes('Po co Ci ta technika w codziennym życiu?'), 'Karta ma właściwy nagłówek celu');
    assert(whyCard.textContent.toLowerCase().includes('notatk'), 'Wyjaśnia przewagę nad tradycyjnymi notatkami');

    const stepNodes = doc.querySelectorAll('.step-node');
    assert(stepNodes.length === 10, `Znaleziono dokładnie 10 węzłów lekcji Map Myśli (znaleziono: ${stepNodes.length})`);

    const chapters = doc.querySelectorAll('.chapter');
    assert(chapters.length === 4, `Lekcje Ośmiornicy są podzielone na 4 rozdziały (znaleziono: ${chapters.length})`);

    // Sprawdzenie każdej lekcji z osobna
    for (let l = 1; l <= 10; l++) {
      dom.window.location.hash = `#/mindmap/train/${l}`;
      const titleEl = await waitFor(doc, () => doc.querySelector('.step-head h2'), `lekcja ${l} title`);
      assert(!!titleEl, `Lekcja ${l} Map Myśli załadowana poprawnie`);

      const theoryBox = doc.querySelector('.theory-box');
      assert(!!theoryBox && theoryBox.textContent.length > 80, `Lekcja ${l} posiada obszerną, zrozumiałą teorię`);

      const options = doc.querySelectorAll('.task-box .btn-opt');
      assert(options.length >= 3, `Lekcja ${l} zawiera pytania sprawdzające (znaleziono opcji: ${options.length})`);

      // Klikamy poprawną odpowiedź (indeks 0 we wszystkich lekcjach testowych)
      options[0].click();
      await waitFor(doc, () => doc.querySelector('.btn-opt.correct'), `lekcja ${l} correct`);
      assert(!!doc.querySelector('.btn-opt.correct'), `Lekcja ${l}: poprawna odpowiedź została zaliczona z wyróżnieniem`);
    }
  }

  // ----------------------------------------------------
  // TEST 5: OŚMIORNICA INKA - 4 TRYBY GRY SWOBODNEJ
  // ----------------------------------------------------
  console.log('\n▶ TEST 5: Ośmiornica Inka 🐙 – 4 tryby gry swobodnej i brak cheatu czasowego');
  {
    const modes = [
      { id: 'missing_branch', title: 'Brakująca gałąź' },
      { id: 'categorize', title: 'Przypisz do gałęzi' },
      { id: 'find_intruder', title: 'Znajdź intruza' },
      { id: 'speed_map', title: 'Szybka mapa' }
    ];

    for (const m of modes) {
      const dom = setupDom(`#/mindmap/free/${m.id}`);
      const doc = dom.window.document;

      const hud = await waitFor(doc, () => doc.querySelector('.hud'), `tryb ${m.id} hud`);
      assert(!!hud, `Tryb gry swobodnej "${m.title}" (#/mindmap/free/${m.id}) startuje poprawnie`);

      const card = doc.querySelector('.mindmap-card');
      assert(!!card, `Tryb "${m.title}" renderuje interaktywną mapę myśli (.mindmap-card)`);

      const choiceBtns = doc.querySelectorAll('.choice-grid button');
      assert(choiceBtns.length >= 2, `Tryb "${m.title}" posiada przyciski wyboru (znaleziono: ${choiceBtns.length})`);
    }

    // Weryfikacja czystego timera 30s w speed_map (brak manipulacji czasem)
    const domSpeed = setupDom('#/mindmap/free/speed_map');
    const docSpeed = domSpeed.window.document;
    await waitFor(docSpeed, () => docSpeed.querySelector('.hud'), 'speed map hud');
    const timerVal = docSpeed.querySelector('.hud-timer b');
    assert(timerVal && timerVal.textContent === '30s', 'Szybka mapa startuje od dokładnie 30 sekund');
  }

  // ----------------------------------------------------
  // TEST 6: POTWIERDZENIE BRAKU WIELOBOJU W APLIKACJI
  // ----------------------------------------------------
  console.log('\n▶ TEST 6: Weryfikacja całkowitego usunięcia Wieloboju Pamięciowego');
  {
    const dom = setupDom('#/tournament');
    const doc = dom.window.document;

    // Ponieważ Wielobój został usunięty, router nie znajduje gry o id tournament i przekierowuje/renderuje Hub!
    const cat = await waitFor(doc, () => doc.querySelector('.cat'), 'hub cat fallback');
    assert(!!cat, 'Adres #/tournament nie uruchamia turnieju, lecz bezpiecznie odsyła na stronę główną');
    assert(!doc.querySelector('.tournament-timeline'), 'Brak osi czasu turnieju (.tournament-timeline)');
    assert(!doc.querySelector('.tournament-podium-card'), 'Brak podium turnieju (.tournament-podium-card)');
  }

  console.log('\n====================================================');
  console.log(`🏁 WYNIKI V1.1: ${passed} ZDANYCH, ${failed} NIEZDANYCH`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch(err => {
  console.error('BŁĄD W TRAKCIE TESTÓW:', err);
  process.exit(1);
});
