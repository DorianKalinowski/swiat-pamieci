const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('C:/Users/Dorian/.gemini/antigravity/scratch/swiat-pamieci/index.html', 'utf8')
  .replace('<script src="js/bundle.js"></script>', '');
const bundle = fs.readFileSync('C:/Users/Dorian/.gemini/antigravity/scratch/swiat-pamieci/js/bundle.js', 'utf8');

function setupDom(initialHash = '#/', initialStorage = {}) {
  const dom = new JSDOM(html, {
    url: 'http://localhost:8080/' + initialHash,
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  const { window } = dom;

  if (Object.keys(initialStorage).length > 0) {
    window.localStorage.setItem('swiat-pamieci:v1', JSON.stringify(initialStorage));
  }

  window.AudioContext = class {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; }, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } }; }
  };
  window.webkitAudioContext = window.AudioContext;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.scrollTo = () => {};

  window.HTMLDialogElement.prototype.showModal = function() { this.setAttribute('open', ''); };
  window.HTMLDialogElement.prototype.close = function() { this.removeAttribute('open'); };

  window.addEventListener('error', e => {
    console.error('  [DOM ERROR]:', e.error?.stack || e.error || e.message);
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
        // wait
      } else {
        return val;
      }
    }
    await new Promise(r => setTimeout(r, 40));
  }
  throw new Error(`Timeout waiting for: ${desc}`);
}

async function runExtendedTests() {
  console.log('====================================================');
  console.log('🧪 PAKIET ROZSZERZONYCH TESTÓW POKRYCIA (EXTENDED)');
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
  // TEST A: INTERAKCJA Z MASKOTKAMI (POKE & SPEECH)
  // ----------------------------------------------------
  console.log('▶ TEST A: Kliknięcie i głaskanie maskotek');
  {
    const dom = setupDom('#/');
    const doc = dom.window.document;

    const catFigure = await waitFor(doc, () => doc.querySelector('.cat-figure'), 'kotek figure');
    catFigure.click();
    assert(catFigure.classList.contains('spin'), 'Kotek kręci piruet (.spin) po kliknięciu');

    const catBubble = doc.querySelector('.bubble-text');
    await new Promise(r => setTimeout(r, 200));
    assert(catBubble.textContent.length > 0, `Kotek mówi w dymku: „${catBubble.textContent}”`);
  }

  // ----------------------------------------------------
  // TEST B: DIALOGI TOPBAR (AUTOR, ŚCIĄGAWKA, DŹWIĘK)
  // ----------------------------------------------------
  console.log('\n▶ TEST B: Przyciski paska górnego i okna modalne');
  {
    const dom = setupDom('#/');
    const doc = dom.window.document;

    const soundBtn = doc.querySelector('#soundBtn');
    assert(soundBtn.getAttribute('aria-pressed') === 'true', 'Dźwięk domyślnie włączony');
    soundBtn.click();
    assert(soundBtn.getAttribute('aria-pressed') === 'false', 'Przełącznik wycisza dźwięk');
    soundBtn.click();
    assert(soundBtn.getAttribute('aria-pressed') === 'true', 'Przełącznik ponownie włącza dźwięk');

    const guideBtn = doc.querySelector('#guideBtn');
    const guideDialog = doc.querySelector('#guide');
    guideBtn.click();
    assert(guideDialog.hasAttribute('open'), 'Kliknięcie 💡 otwiera ściągawkę technik pamięciowych');
    assert(guideDialog.textContent.includes('Pałac Pamięci (Metoda Loci)'), 'Ściągawka zawiera sekcję o Pałacu Pamięci');

    const authorBtn = doc.querySelector('#authorBtn');
    const aboutDialog = doc.querySelector('#about');
    authorBtn.click();
    assert(aboutDialog.hasAttribute('open'), 'Kliknięcie awatara otwiera okno o autorze (Dorian Kalinowski)');
    assert(aboutDialog.textContent.includes('Dorian Kalinowski'), 'Okno zawiera nazwisko autora');
  }

  // ----------------------------------------------------
  // TEST C: PAŁAC PAMIĘCI - LEKCJA 2 (3 KOMNATY: SŁOŃ, PIZZA, GITARA)
  // ----------------------------------------------------
  console.log('\n▶ TEST C: Pałac pamięci – Ukończenie lekcji 2 (3 loci)');
  {
    const dom = setupDom('#/palace/train/2', {
      'palace.train': { 1: 3 } // lekcja 1 już zaliczona
    });
    const doc = dom.window.document;

    // Przejdź intro
    for (let i = 0; i < 4; i++) {
      const btn = await waitFor(doc, () => doc.querySelector('.controls .btn-primary'), `intro 2 step ${i}`);
      btn.click();
      await new Promise(r => setTimeout(r, 50));
    }

    // 3 komnaty w spacerze
    for (let c = 0; c < 3; c++) {
      const nextBtn = await waitFor(doc, () => doc.querySelector('.controls .btn-primary'), `room step ${c}`);
      nextBtn.click();
      await new Promise(r => setTimeout(r, 50));
    }

    // Sprawdzian 1: Sala kominkowa (Słoń)
    const btnElephant = await waitFor(doc, () => {
      const btns = Array.from(doc.querySelectorAll('.choice-btn'));
      return btns.find(b => b.textContent.includes('Słoń'));
    }, 'wybór Słoń');
    btnElephant.click();
    await new Promise(r => setTimeout(r, 850));

    // Sprawdzian 2: Kuchnia (Pizza)
    const btnPizza = await waitFor(doc, () => {
      const btns = Array.from(doc.querySelectorAll('.choice-btn'));
      return btns.find(b => b.textContent.includes('Pizza'));
    }, 'wybór Pizza');
    btnPizza.click();
    await new Promise(r => setTimeout(r, 850));

    // Sprawdzian 3: Spiżarnia (Gitara)
    const btnGuitar = await waitFor(doc, () => {
      const btns = Array.from(doc.querySelectorAll('.choice-btn'));
      return btns.find(b => b.textContent.includes('Gitara'));
    }, 'wybór Gitara');
    btnGuitar.click();
    await new Promise(r => setTimeout(r, 850));

    const finishCard = await waitFor(doc, () => doc.querySelector('.palace-finish-card'), 'karta zakończenia lekcji 2');
    assert(!!finishCard, 'Lekcja 2 ukończona pomyślnie ze wszystkimi 3 komnatami!');
  }

  // ----------------------------------------------------
  // TEST D: PAŁAC PAMIĘCI - TRYB GRA SWOBODNA: BŁYSKAWICZNY PAŁAC (SPEED)
  // ----------------------------------------------------
  console.log('\n▶ TEST D: Pałac pamięci – Tryb „Błyskawiczny Pałac”');
  {
    const dom = setupDom('#/palace/free/speed');
    const doc = dom.window.document;

    const timerBar = await waitFor(doc, () => doc.querySelector('.speed-timer-bar'), 'pasek czasu');
    assert(!!timerBar, 'Tryb na czas posiada aktywny pasek odliczania');
  }

  // ----------------------------------------------------
  // TEST E: PAŁAC PAMIĘCI - TRYB GRA SWOBODNA: SPACER W TYŁ (REVERSE)
  // ----------------------------------------------------
  console.log('\n▶ TEST E: Pałac pamięci – Tryb „Spacer w Tył”');
  {
    const dom = setupDom('#/palace/free/reverse');
    const doc = dom.window.document;

    // Przejdź 3 komnaty
    for (let i = 0; i < 3; i++) {
      const btn = await waitFor(doc, () => doc.querySelector('.controls .btn-primary'), `reverse step ${i}`);
      btn.click();
      await new Promise(r => setTimeout(r, 50));
    }

    const badge = await waitFor(doc, () => doc.querySelector('.room-badge'), 'odznaka kroku');
    assert(badge.textContent.includes('W TYŁ'), 'Faza odtwarzania wyraźnie wskazuje spacer w odwrotnej kolejności');
  }

  // ----------------------------------------------------
  // TEST F: PAŁAC PAMIĘCI - TRYB GRA SWOBODNA: STRAŻNIK KOMNAT (QUIZ)
  // ----------------------------------------------------
  console.log('\n▶ TEST F: Pałac pamięci – Tryb „Strażnik Komnat”');
  {
    const dom = setupDom('#/palace/free/quiz');
    const doc = dom.window.document;

    // Przejdź komnaty
    for (let i = 0; i < 3; i++) {
      const btn = await waitFor(doc, () => doc.querySelector('.controls .btn-primary'), `quiz step ${i}`);
      btn.click();
      await new Promise(r => setTimeout(r, 50));
    }

    const qPrompt = await waitFor(doc, () => doc.querySelector('.recall-question'), 'pytanie strażnika');
    assert(qPrompt.textContent.includes('przedmiot'), 'Strażnik Komnat zadaje losowe pytania quizowe o loci');
  }

  // ----------------------------------------------------
  // TEST G: TRWAŁOŚĆ LOCALSTORAGE (POSTĘP I PASSA)
  // ----------------------------------------------------
  console.log('\n▶ TEST G: Trwałość LocalStorage (Postęp, gwiazdki i passa)');
  {
    const dom = setupDom('#/', {
      'digits.train': { 1: 3, 2: 3 },
      'palace.train': { 1: 3, 2: 3, 3: 3 },
      streak: 5,
      lastDay: new Date().toLocaleDateString('sv')
    });
    const doc = dom.window.document;

    const stats = Array.from(doc.querySelectorAll('.stat'));
    const streakStat = stats.find(s => s.textContent.includes('dni z rzędu'));
    const starsStat = stats.find(s => s.textContent.includes('gwiazdek'));

    assert(streakStat.textContent.includes('5'), 'Zapisana passa (5 dni) jest poprawnie odczytywana');
    assert(starsStat.textContent.includes('15'), 'Suma gwiazdek z obu gier (6 + 9 = 15) jest poprawnie wyliczona i wyświetlona na Hubie');
  }

  // ----------------------------------------------------
  // TEST H: BRAK PRZYCISKU "UDOSTĘPNIJ" PO ZAKOŃCZENIU GRY SWOBODNEJ
  // ----------------------------------------------------
  console.log('\n▶ TEST H: Weryfikacja braku przycisku „Udostępnij” po zakończeniu gry');
  {
    const dom = setupDom('#/digits/free/classic');
    const doc = dom.window.document;

    // Poczekaj na fazę wprowadzania
    const keypad = await waitFor(doc, () => doc.querySelector('.keypad'), 'klawiatura gry swobodnej', 6000);
    // Wpisz błędną cyfrę (np. '0' zamiast właściwej liczby)
    const keys = Array.from(keypad.querySelectorAll('.key'));
    const key0 = keys.find(k => k.textContent.trim() === '0');
    const keyOk = keys.find(k => k.textContent.trim() === '✓');

    // Wpisz 3 cyfry żeby zapełnić sloty poziomu 1 (3 cyfry)
    key0.click();
    key0.click();
    key0.click();
    keyOk.click();

    // Poczekaj na game over
    const gameover = await waitFor(doc, () => doc.querySelector('.gameover'), 'ekran gameover', 4000);
    assert(!!gameover, 'Ekran końca gry wyświetla się poprawnie');

    const allButtons = Array.from(doc.querySelectorAll('.controls button, .controls a'));
    const shareBtn = allButtons.find(b => b.textContent.toLowerCase().includes('udostępnij') || b.textContent.toLowerCase().includes('share'));
    assert(!shareBtn, 'Przycisk „Udostępnij” został całkowicie usunięty z ekranu końca gry');

    const retryBtn = allButtons.find(b => b.textContent.includes('Jeszcze raz'));
    const exitBtn = allButtons.find(b => b.textContent.includes('Inny tryb'));
    assert(!!retryBtn, 'Przycisk „Jeszcze raz” jest dostępny');
    assert(!!exitBtn, 'Przycisk „Inny tryb” jest dostępny');
  }

  // ----------------------------------------------------
  // TEST I: MODAL POBIERZ/INSTALACJA - TYLKO ANDROID I IOS (BRAK KOMPUTERA)
  // ----------------------------------------------------
  console.log('\n▶ TEST I: Weryfikacja okna pobierania (tylko Android i iOS)');
  {
    const dom = setupDom('#/');
    const doc = dom.window.document;

    const installBtn = doc.querySelector('#installBtn');
    const installModal = doc.querySelector('#installModal');
    assert(!!installBtn, 'Przycisk Pobierz/Zainstaluj istnieje w nagłówku');
    assert(!!installModal, 'Modal instalacji istnieje w DOM');

    installBtn.click();
    assert(installModal.hasAttribute('open'), 'Kliknięcie pobierz otwiera modal instalacji');

    const modalText = installModal.textContent;
    assert(modalText.includes('Android'), 'Instrukcja zawiera informacje o systemie Android');
    assert(modalText.includes('iPhone') || modalText.includes('iOS'), 'Instrukcja zawiera informacje o systemie iPhone / iPad');
    assert(!modalText.toLowerCase().includes('komputer'), 'Informacje o pobraniu na komputer zostały całkowicie usunięte');
    assert(!modalText.toLowerCase().includes('komputerze'), 'Brak jakichkolwiek wzmianek o instalacji na komputerze');
  }

  // ----------------------------------------------------
  // PODSUMOWANIE
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`🏁 ROZSZERZONE WYNIKI TESTÓW: ${passed} ZDANYCH, ${failed} NIEZDANYCH`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runExtendedTests().catch(err => {
  console.error('KRYTYCZNY BŁĄD TESTU:', err);
  process.exit(1);
});
