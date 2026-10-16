const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('C:/Users/Dorian/.gemini/antigravity/scratch/swiat-pamieci/index.html', 'utf8')
  .replace('<script src="js/bundle.js"></script>', '');
const bundle = fs.readFileSync('C:/Users/Dorian/.gemini/antigravity/scratch/swiat-pamieci/js/bundle.js', 'utf8');

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

async function waitFor(doc, fn, desc, timeout = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const val = fn();
    if (val !== null && val !== undefined) {
      if (typeof val === 'object' && 'length' in val && val.length === 0) {
        // Empty array or NodeList, keep waiting
      } else {
        return val;
      }
    }
    await new Promise(r => setTimeout(r, 40));
  }
  throw new Error(`Timeout waiting for: ${desc}`);
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🚀 ROZPOCZYNAMY KOMPLEKSOWY PAKIET TESTÓW UI');
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

  // ----------------------------------------------------
  // TEST 1: HUB GŁÓWNY I KOTEK (OCZY I POPRAWNOŚĆ SVG)
  // ----------------------------------------------------
  console.log('▶ TEST 1: Weryfikacja Hubu głównego i oczu kotka');
  {
    const dom = setupDom('#/');
    const doc = dom.window.document;

    const catSvg = doc.querySelector('svg.cat');
    assert(!!catSvg, 'Kot Mruczek jest wyrenderowany na stronie głównej');

    const eyeSlots = catSvg.querySelectorAll('.eye-slot');
    assert(eyeSlots.length === 2, 'Kotek ma dokładnie 2 sloty na oczy (.eye-slot)');
    assert(eyeSlots[0].getAttribute('transform') === 'translate(76 90)', 'Lewe oko kotka ma pozycję translate(76 90)');
    assert(eyeSlots[1].getAttribute('transform') === 'translate(124 90)', 'Prawe oko kotka ma pozycję translate(124 90)');

    const eyes = catSvg.querySelectorAll('.eye');
    assert(eyes.length === 2, 'Wewnątrz slotów znajdują się 2 elementy .eye gotowe na animacje CSS');

    const gameCards = doc.querySelectorAll('.game-card');
    assert(gameCards.length >= 6, `Znaleziono ${gameCards.length} kart gier w rejestrze`);

    const readyCards = doc.querySelectorAll('.game-card:not(.soon)');
    assert(readyCards.length === 2, `Dokładnie 2 gry są gotowe do gry (status: ready)`);

    const digitsCard = doc.querySelector('.game-card[href="#/digits"]');
    const palaceCard = doc.querySelector('.game-card[href="#/palace"]');
    assert(!!digitsCard, 'Karta gry „Cyfry” jest aktywna i prowadzi do #/digits');
    assert(!!palaceCard, 'Karta gry „Pałac pamięci” jest aktywna i prowadzi do #/palace');
  }

  // ----------------------------------------------------
  // TEST 2: GRA CYFRY - SZKOLENIE Z KOTKIEM (LEKCJA 1 ZATWIERDZANIE)
  // ----------------------------------------------------
  console.log('\n▶ TEST 2: Gra „Cyfry” – Szkolenie lekcja 1 (przejście i sprawdzian przycisku ✓)');
  {
    const dom = setupDom('#/digits/train/1');
    const doc = dom.window.document;

    // Kliknij wprowadzenie
    for (let i = 0; i < 3; i++) {
      const btn = await waitFor(doc, () => doc.querySelector('.controls .btn-primary'), `intro button ${i}`);
      btn.click();
      await new Promise(r => setTimeout(r, 60));
    }

    // Faza prezentacji - pomiń
    const skipBtn = await waitFor(doc, () => doc.querySelector('.present .btn-ghost'), 'przycisk Już pamiętam ✓');
    assert(!!skipBtn, 'Faza prezentacji cyfry 2 wyświetla się poprawnie');
    skipBtn.click();

    // Faza recall - klawiatura
    const keypad = await waitFor(doc, () => doc.querySelector('.keypad'), 'klawiatura numeryczna');
    assert(!!keypad, 'Klawiatura numeryczna pojawiła się w fazie odtwarzania');

    const keys = Array.from(keypad.querySelectorAll('.key'));
    const key2 = keys.find(k => k.textContent.trim() === '2');
    const keyOk = keys.find(k => k.textContent.trim() === '✓');

    assert(keyOk.disabled === true, 'Przycisk „✓” jest zablokowany przed wpisaniem cyfry');
    key2.click();
    assert(keyOk.disabled === false, 'Przycisk „✓” odblokowuje się po wpisaniu cyfry');

    keyOk.click();
    const nextLessonBtn = await waitFor(doc, () => doc.querySelector('.controls .btn-primary'), 'przycisk Następna lekcja');
    assert(nextLessonBtn.textContent.includes('Następna lekcja'), 'Po zatwierdzeniu ✓ lekcja 1 kończy się sukcesem i pojawia się „Następna lekcja ▶”');

    const stars = doc.querySelectorAll('.stage .stars .on');
    assert(stars.length === 3, 'Zdobyto komplet 3 gwiazdek za bezbłędne odtworzenie cyfry');
  }

  // ----------------------------------------------------
  // TEST 3: GRA CYFRY - GRA SWOBODNA
  // ----------------------------------------------------
  console.log('\n▶ TEST 3: Gra „Cyfry” – Menu i gra swobodna');
  {
    const dom = setupDom('#/digits');
    const doc = dom.window.document;

    const trainCard = await waitFor(doc, () => doc.querySelector('.train-card'), 'karta szkolenia');
    assert(!!trainCard, 'Menu gry „Cyfry” posiada kartę szkolenia');

    const modeCards = doc.querySelectorAll('.mode-card');
    assert(modeCards.length >= 4, `Menu gry „Cyfry” zawiera ${modeCards.length} wariantów gry swobodnej`);
  }

  // ----------------------------------------------------
  // TEST 4: NOWA GRA „PAŁAC PAMIĘCI” - MENU I TYGRYSEK LEON
  // ----------------------------------------------------
  console.log('\n▶ TEST 4: Nowa gra „Pałac pamięci” – Menu i weryfikacja Tygryska');
  {
    const dom = setupDom('#/palace');
    const doc = dom.window.document;

    const tigerSvg = await waitFor(doc, () => doc.querySelector('svg.tiger'), 'Tygrysek Leon SVG');
    assert(!!tigerSvg, 'Tygrysek Leon jest nauczycielem i maskotką modułu „Pałac pamięci”');

    const tigerEyeSlots = tigerSvg.querySelectorAll('.eye-slot');
    assert(tigerEyeSlots.length === 2, 'Tygrysek posiada dokładnie 2 sloty na oczy (.eye-slot)');
    assert(tigerEyeSlots[0].getAttribute('transform') === 'translate(76 90)', 'Lewe oko tygryska translate(76 90)');
    assert(tigerEyeSlots[1].getAttribute('transform') === 'translate(124 90)', 'Prawe oko tygryska translate(124 90)');

    const trainCard = doc.querySelector('.train-card');
    assert(!!trainCard, 'Moduł posiada dedykowaną kartę szkolenia z tygryskiem');
    assert(trainCard.textContent.includes('Szkolenie z Tygryskiem Leonem'), 'Karta szkolenia zawiera podpis Tygryska Leona');

    const modeCards = doc.querySelectorAll('.mode-card');
    assert(modeCards.length === 5, `Pałac pamięci oferuje dokładnie 5 wariantów gry swobodnej (znaleziono: ${modeCards.length})`);

    const titles = Array.from(modeCards).map(m => m.querySelector('h3')?.textContent);
    assert(titles.includes('Wędrówka Odkrywcy'), 'Wariant 1: Wędrówka Odkrywcy');
    assert(titles.includes('Błyskawiczny Pałac'), 'Wariant 2: Błyskawiczny Pałac (na czas)');
    assert(titles.includes('Spacer w Tył'), 'Wariant 3: Spacer w Tył (odwrócony loci)');
    assert(titles.includes('Strażnik Komnat'), 'Wariant 4: Strażnik Komnat (losowy quiz)');
    assert(titles.includes('Nieskończona Wędrówka'), 'Wariant 5: Nieskończona Wędrówka (survival)');
  }

  // ----------------------------------------------------
  // TEST 5: PAŁAC PAMIĘCI - MAPA SZKOLENIA
  // ----------------------------------------------------
  console.log('\n▶ TEST 5: Pałac pamięci – Mapa 8 lekcji szkoleniowych');
  {
    const dom = setupDom('#/palace/train');
    const doc = dom.window.document;

    const lessonCards = await waitFor(doc, () => doc.querySelectorAll('.lesson-card'), 'lista lekcji');
    assert(lessonCards.length === 8, `Mapa szkolenia zawiera dokładnie 8 bogatych lekcji Loci (znaleziono: ${lessonCards.length})`);

    const firstCard = lessonCards[0];
    assert(!firstCard.classList.contains('locked'), 'Pierwsza lekcja jest odblokowana na start');
    assert(firstCard.getAttribute('href') === '#/palace/train/1', 'Pierwsza lekcja linkuje do #/palace/train/1');
  }

  // ----------------------------------------------------
  // TEST 6: PAŁAC PAMIĘCI - SZKOLENIE LEKCJA 1 END-TO-END
  // ----------------------------------------------------
  console.log('\n▶ TEST 6: Pałac pamięci – Przejście lekcji 1 end-to-end');
  {
    const dom = setupDom('#/palace/train/1');
    const doc = dom.window.document;

    // 1. Sprawdź Tygryska
    const tiger = await waitFor(doc, () => doc.querySelector('svg.tiger'), 'Tygrysek');
    assert(!!tiger, 'Tygrysek asystuje w trakcie lekcji');

    // 2. Wprowadzenie Tygryska (4 kroki dialogu)
    console.log('   Przechodzenie przez dialogi wprowadzenia Tygryska...');
    for (let step = 0; step < 4; step++) {
      const nextBtn = await waitFor(doc, () => doc.querySelector('.controls .btn-primary'), `dialog step ${step}`);
      nextBtn.click();
      await new Promise(r => setTimeout(r, 60));
    }

    // 3. Faza prezentacji pałacu (Spacer)
    console.log('   Faza 1 spaceru: Złota Brama...');
    const room1 = await waitFor(doc, () => doc.querySelector('.room-name'), 'karta komnaty 1');
    assert(room1.textContent.includes('Złota Brama'), 'Komnata 1 to Złota Brama');
    assert(doc.querySelector('.item-name')?.textContent.includes('Świecący Banan'), 'Obiekt 1 to Świecący Banan');

    const nextRoomBtn = doc.querySelector('.controls .btn-primary');
    assert(nextRoomBtn.textContent.includes('Kolejna komnata'), 'Przycisk prowadzi do kolejnej komnaty');
    nextRoomBtn.click();
    await new Promise(r => setTimeout(r, 60));

    console.log('   Faza 2 spaceru: Marmurowy Hol...');
    const room2 = await waitFor(doc, () => doc.querySelector('.room-name'), 'karta komnaty 2');
    assert(room2.textContent.includes('Marmurowy Hol'), 'Komnata 2 to Marmurowy Hol');
    assert(doc.querySelector('.item-name')?.textContent.includes('Kapelusz Magika'), 'Obiekt 2 to Kapelusz Magika');

    const testBtn = doc.querySelector('.controls .btn-primary');
    assert(testBtn.textContent.includes('Sprawdź pamięć'), 'Ostatnia komnata oferuje przycisk „Sprawdź pamięć! 🎯”');
    testBtn.click();
    await new Promise(r => setTimeout(r, 60));

    // 4. Faza odtwarzania (Recall)
    console.log('   Faza sprawdzania 1: Złota Brama...');
    const recallCard1 = await waitFor(doc, () => doc.querySelector('.recall-room-title'), 'tytuł recall 1');
    assert(recallCard1.textContent.includes('Złota Brama'), 'Pytanie dotyczy komnaty Złota Brama');

    const choiceBtns1 = Array.from(doc.querySelectorAll('.choice-btn'));
    assert(choiceBtns1.length === 4, 'Wyświetlono 4 opcje wyboru w siatce');
    const correctBtn1 = choiceBtns1.find(b => b.textContent.includes('Świecący Banan'));
    assert(!!correctBtn1, 'Wśród opcji znajduje się poprawna odpowiedź (Świecący Banan)');

    correctBtn1.click();
    await new Promise(r => setTimeout(r, 900));

    console.log('   Faza sprawdzania 2: Marmurowy Hol...');
    const recallCard2 = await waitFor(doc, () => doc.querySelector('.recall-room-title'), 'tytuł recall 2');
    assert(recallCard2.textContent.includes('Marmurowy Hol'), 'Pytanie dotyczy komnaty Marmurowy Hol');

    const choiceBtns2 = Array.from(doc.querySelectorAll('.choice-btn'));
    const correctBtn2 = choiceBtns2.find(b => b.textContent.includes('Kapelusz Magika'));
    assert(!!correctBtn2, 'Wśród opcji znajduje się poprawna odpowiedź (Kapelusz Magika)');

    correctBtn2.click();
    await new Promise(r => setTimeout(r, 900));

    // 5. Podsumowanie lekcji
    const finishCard = await waitFor(doc, () => doc.querySelector('.palace-finish-card'), 'karta podsumowania');
    assert(!!finishCard, 'Lekcja 1 Pałacu zakończona sukcesem!');

    const stars = doc.querySelectorAll('.stars-finish .on');
    assert(stars.length === 3, 'Zdobyto 3 gwiazdki za bezbłędny spacer');

    const nextLesBtn = doc.querySelector('.controls .btn-primary');
    assert(nextLesBtn.textContent.includes('Następna lekcja'), 'Przycisk prowadzi do następnej lekcji');
  }

  // ----------------------------------------------------
  // TEST 7: PAŁAC PAMIĘCI - GRA SWOBODNA (WĘDRÓWKA ODKRYWCY)
  // ----------------------------------------------------
  console.log('\n▶ TEST 7: Pałac pamięci – Gra swobodna (Wędrówka Odkrywcy)');
  {
    const dom = setupDom('#/palace/free/walk');
    const doc = dom.window.document;

    const levelStat = await waitFor(doc, () => doc.querySelector('#statLevel'), 'statystyka poziomu');
    assert(levelStat.textContent === '1', 'Początkowy poziom to 1');

    const roomCard = await waitFor(doc, () => doc.querySelector('.palace-room-card'), 'komnata poziomu 1');
    assert(!!roomCard, 'Pierwsza komnata trasy swobodnej wyświetla się prawidłowo');

    // Przejdź przez komnaty
    for (let r = 0; r < 2; r++) {
      const nextBtn = await waitFor(doc, () => doc.querySelector('.controls .btn-primary'), 'dalej');
      nextBtn.click();
      await new Promise(r => setTimeout(r, 60));
    }

    const checkBtn = await waitFor(doc, () => doc.querySelector('.controls .btn-primary'), 'sprawdź pamięć');
    assert(checkBtn.textContent.includes('Sprawdź pamięć'), 'Po obejrzeniu komnat pojawia się przycisk sprawdzianu');
  }

  // ----------------------------------------------------
  // PODSUMOWANIE
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`🏁 WYNIKI TESTÓW: ${passed} ZDANYCH, ${failed} NIEZDANYCH`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('KRYTYCZNY BŁĄD TESTU:', err);
  process.exit(1);
});
