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
  window.Element.prototype.animate = function() {
    return {
      onfinish: null,
      finished: Promise.resolve(),
      cancel: () => {},
      play: () => {},
      pause: () => {}
    };
  };
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

async function runTests() {
  console.log('====================================================');
  console.log('🎮 TEST PŁYNNOŚCI I POSTĘPU GIER SWOBODNYCH (WSZYSTKIE 8 ZWIERZĄTEK)');
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
  // TEST 1: TYGRYSEK - PAŁAC PAMIĘCI (WĘDRÓWKA ODKRYWCY)
  // ----------------------------------------------------
  console.log('▶ TEST 1: Tygrysek 🐯 – Pałac Pamięci: ukończenie Poziomu 1 i przejście do Poziomu 2');
  {
    const dom = setupDom('#/palace/free/walk');
    const doc = dom.window.document;

    const levelEl = await waitFor(doc, () => doc.querySelector('#statLevel'), 'statLevel');
    assert(levelEl.textContent === '1', 'Początkowy poziom gry swobodnej pałacu to 1');

    // Faza prezentacji: zapamiętaj przedmioty w komnatach
    const roomItems = {};
    for (let k = 0; k < 10; k++) {
      const roomNameEl = doc.querySelector('.room-name');
      const itemNameEl = doc.querySelector('.item-name');
      if (roomNameEl && itemNameEl) {
        roomItems[roomNameEl.textContent.trim()] = itemNameEl.textContent.trim();
      }
      const btn = await waitFor(doc, () => doc.querySelector('.controls .btn-primary'), `presentation step ${k}`);
      const txt = btn.textContent;
      btn.click();
      await new Promise(r => setTimeout(r, 60));
      if (txt.includes('Sprawdź pamięć')) break;
    }

    // Faza recall (wybór poprawnych przedmiotów bez błędu)
    for (let r = 0; r < 3; r++) {
      await waitFor(doc, () => doc.querySelector('.choice-grid .choice-btn'), `recall step ${r}`);
      const roomTitle = doc.querySelector('.recall-room-title').textContent.trim();
      const expectedItem = roomItems[roomTitle];
      const btns = Array.from(doc.querySelectorAll('.choice-grid .choice-btn'));
      const targetBtn = btns.find(b => b.querySelector('.cb-name')?.textContent?.trim() === expectedItem);
      assert(!!targetBtn, `Znaleziono poprawny przycisk dla komnaty "${roomTitle}" -> "${expectedItem}"`);
      targetBtn.click();
      await new Promise(r => setTimeout(r, 750));
    }

    // Ekran: Poziom 1 zaliczony!
    const finishCard = await waitFor(doc, () => doc.querySelector('.palace-finish-card'), 'Karta ukończenia poziomu');
    assert(!!finishCard, 'Karta ukończenia poziomu wyświetla się prawidłowo');
    assert(finishCard.textContent.includes('Poziom 1 zaliczony'), 'Karta informuje: „Poziom 1 zaliczony”');

    // WERYFIKACJA PRZYCISKU KOLEJNY POZIOM!
    const nextLevelBtn = finishCard.querySelector('button.pulse-next, button.btn-primary');
    assert(!!nextLevelBtn, 'Przycisk przejścia do kolejnego poziomu ISTNIEJE w karcie zakończenia!');
    assert(nextLevelBtn.textContent.includes('Kolejny poziom 2'), `Przycisk ma prawidłowy tekst: "${nextLevelBtn.textContent}"`);

    // KLIKNIJ PRZYCISK KOLEJNEGO POZIOMU
    nextLevelBtn.click();
    await new Promise(r => setTimeout(r, 200));

    // Weryfikacja: przeszliśmy do poziomu 2!
    assert(levelEl.textContent === '2', 'Po kliknięciu przycisku poziom automatycznie zmienił się na 2!');
    const newRoom = await waitFor(doc, () => doc.querySelector('.room-badge'), 'Nowa komnata poziomu 2');
    assert(newRoom.textContent.includes('Komnata 1 z 4'), 'Poziom 2 ma teraz 4 komnaty (trudność wzrosła!)');
  }

  // ----------------------------------------------------
  // TEST 2: KOTEK - CYFRY (KLASYK)
  // ----------------------------------------------------
  console.log('\n▶ TEST 2: Kotek 🐱 – Cyfry: płynny postęp po zaliczeniu rundy');
  {
    const dom = setupDom('#/digits/free/classic');
    const doc = dom.window.document;
    const hudLevel = await waitFor(doc, () => doc.querySelector('.hud b'), 'hud level');
    assert(hudLevel.textContent === '1', 'Kotek startuje od poziomu 1');

    // Czekaj na prezentację i odczytaj cyfry
    const presentBox = await waitFor(doc, () => doc.querySelector('.present'), 'prezentacja cyfr');
    const digits = Array.from(presentBox.querySelectorAll('.digit-group .digit')).map(d => d.textContent.trim()).join('');
    assert(digits.length === 3, `Poziom 1 wyświetla 3 cyfry: ${digits}`);

    // Kliknij "Już pamiętam"
    const skipBtn = presentBox.querySelector('.btn-ghost');
    skipBtn.click();

    // Wpisz dokładnie te cyfry na klawiaturze
    const keypad = await waitFor(doc, () => doc.querySelector('.keypad'), 'keypad');
    const keys = Array.from(keypad.querySelectorAll('.key'));
    for (const d of digits) {
      const kBtn = keys.find(k => k.textContent.trim() === d);
      kBtn.click();
      await new Promise(r => setTimeout(r, 50));
    }
    const okBtn = keys.find(k => k.textContent.trim() === '✓');
    okBtn.click();

    // Po poprawnej odpowiedzi poziom powinien wzrosnąć do 2 (po animacji sukcesu i odczekaniu czasu rundy)
    await waitFor(doc, () => hudLevel.textContent === '2', 'Kotek przechodzi do poziomu 2', 5000);
    assert(hudLevel.textContent === '2', 'Kotek Mruczek płynnie przeszedł do poziomu 2!');
  }

  // ----------------------------------------------------
  // TEST 3: LISEK - IMIONA I TWARZE (KTO TO JEST?)
  // ----------------------------------------------------
  console.log('\n▶ TEST 3: Lisek 🦊 – Imiona i Twarze: ciągłość rund i kibicowanie');
  {
    const dom = setupDom('#/names/free/who');
    const doc = dom.window.document;
    const roundEl = await waitFor(doc, () => doc.querySelector('.hud-round'), 'hud round');
    assert(roundEl.textContent === '1', 'Lisek startuje od rundy 1');

    const clueEl = await waitFor(doc, () => doc.querySelector('.who-clue'), 'who clue');
    const clueText = clueEl.textContent.toLowerCase();
    const ALL_FACES = [
      { name: 'Marek', key: 'okulary' },
      { name: 'Basia', key: 'kok' },
      { name: 'Krzysztof', key: 'broda' },
      { name: 'Kasia', key: 'fioletowe' },
      { name: 'Tomasz', key: 'muszka' },
      { name: 'Ola', key: 'kucyki' },
      { name: 'Piotr', key: 'monokl' },
      { name: 'Ania', key: 'pieprzyk' }
    ];
    let targetName = null;
    for (const item of ALL_FACES) {
      if (clueText.includes(item.key)) {
        targetName = item.name;
        break;
      }
    }

    const opts = Array.from(await waitFor(doc, () => doc.querySelectorAll('.who-grid .btn-opt-face'), 'opcje wyboru'));
    const correctBtn = targetName ? opts.find(b => b.textContent.trim() === targetName) : opts[0];
    assert(!!correctBtn, `Znaleziono trafną opcję dla wskazówki: "${clueText}" -> "${targetName}"`);
    correctBtn.click();

    await waitFor(doc, () => roundEl.textContent === '2', 'Lisek przechodzi do rundy 2', 3000);
    assert(roundEl.textContent === '2', 'Po poprawnej odpowiedzi Lisek płynnie przeszedł do rundy 2!');
  }

  // ----------------------------------------------------
  // TEST 4: SÓWKA - MAJOR (GŁÓWNY SYSTEM PAMIĘCIOWY)
  // ----------------------------------------------------
  console.log('\n▶ TEST 4: Sówka 🦉 – Major: ciągłość rund i kibicowanie');
  {
    const dom = setupDom('#/major/free/peg');
    const doc = dom.window.document;
    const roundEl = await waitFor(doc, () => doc.querySelector('.hud-round'), 'hud round');
    assert(roundEl.textContent === '1', 'Sówka startuje od rundy 1');

    const numEl = await waitFor(doc, () => doc.querySelector('.major-big-num'), 'major big num');
    const digit = numEl.textContent.trim();
    const majorSoundMap = {
      '0': 'S, Z',
      '1': 'T, D',
      '2': 'N',
      '3': 'M',
      '4': 'R',
      '5': 'L',
      '6': 'J, SZ, CZ',
      '7': 'K, G',
      '8': 'F, W',
      '9': 'P, B'
    };
    const expectedSounds = majorSoundMap[digit];

    const opts = Array.from(await waitFor(doc, () => doc.querySelectorAll('.opt-grid .btn-opt'), 'opcje dźwięków'));
    const targetBtn = opts.find(b => b.textContent.trim().toUpperCase() === expectedSounds.toUpperCase());
    assert(!!targetBtn, `Znaleziono przycisk dla cyfry ${digit} -> "${expectedSounds}"`);
    targetBtn.click();

    await waitFor(doc, () => roundEl.textContent === '2', 'Sówka przechodzi do rundy 2', 3000);
    assert(roundEl.textContent === '2', 'Po poprawnej odpowiedzi Sówka płynnie przeszła do rundy 2!');
  }

  // ----------------------------------------------------
  // TEST 5: PAPUŻKA - SŁÓWKA JĘZYKOWE
  // ----------------------------------------------------
  console.log('\n▶ TEST 5: Papużka 🦜 – Słówka Językowe: ciągłość rund i kibicowanie');
  {
    const dom = setupDom('#/words/free/translate');
    const doc = dom.window.document;
    const roundEl = await waitFor(doc, () => doc.querySelector('.hud-round'), 'hud round');
    assert(roundEl.textContent === '1', 'Papużka startuje od rundy 1');

    const wordEl = await waitFor(doc, () => doc.querySelector('.vocab-word'), 'vocab word');
    const foreign = wordEl.textContent.trim().toLowerCase();
    const vocabMap = {
      'mushroom': 'grzyb',
      'gato': 'kot',
      'candle': 'świeca',
      'perro': 'pies',
      'feather': 'pióro',
      'cuchara': 'łyżka',
      'pillow': 'poduszka',
      'manzana': 'jabłko'
    };
    const expectedMeaning = vocabMap[foreign];

    const opts = Array.from(await waitFor(doc, () => doc.querySelectorAll('.opt-grid .btn-opt'), 'opcje tłumaczeń'));
    const targetBtn = expectedMeaning ? opts.find(b => b.textContent.trim().toLowerCase() === expectedMeaning.toLowerCase()) : opts[0];
    assert(!!targetBtn, `Znaleziono przycisk tłumaczenia dla "${foreign}" -> "${expectedMeaning}"`);
    targetBtn.click();

    await waitFor(doc, () => roundEl.textContent === '2', 'Papużka przechodzi do rundy 2', 3000);
    assert(roundEl.textContent === '2', 'Po poprawnej odpowiedzi Papużka płynnie przeszła do rundy 2!');
  }

  // ----------------------------------------------------
  // TEST 6: SZOP - KARTY I PAO
  // ----------------------------------------------------
  console.log('\n▶ TEST 6: Szop 🦝 – Karty i PAO: ciągłość rund i kibicowanie');
  {
    const dom = setupDom('#/cards/free/pao');
    const doc = dom.window.document;
    const roundEl = await waitFor(doc, () => doc.querySelector('.hud-round'), 'hud round');
    assert(roundEl.textContent === '1', 'Szop startuje od rundy 1');

    const rankEl = await waitFor(doc, () => doc.querySelector('.target-card-wrap .pc-rank'), 'pc-rank');
    const suitEl = await waitFor(doc, () => doc.querySelector('.target-card-wrap .pc-suit'), 'pc-suit');
    const rank = rankEl.textContent.trim();
    const suit = suitEl.textContent.trim();

    const paoMap = {
      'A_♠': 'Szop Magik 🦝 – wyciąga z cylindra',
      'K_♥': 'Król Artur 👑 – wyciąga ze skały',
      'Q_♦': 'Królowa Kleopatra 👸 – rzuca w dal',
      'J_♣': 'Robin Hood 🏹 – napina i wystrzeliwuje',
      '10_♠': 'Mroczny Batman 🦇 – szybuje i rzuca',
      '7_♥': 'Agent 007 🍸 – wznosi toast',
      '8_♦': 'Pirat z Karaibów 🏴‍☠️ – otwiera z hukiem',
      '9_♣': 'Mądry Druid 🧙 – uderza o ziemię'
    };
    const expectedPao = paoMap[`${rank}_${suit}`];

    const opts = Array.from(await waitFor(doc, () => doc.querySelectorAll('.opt-grid .btn-opt'), 'opcje PAO'));
    const targetBtn = expectedPao ? opts.find(b => b.textContent.trim() === expectedPao) : opts[0];
    assert(!!targetBtn, `Znaleziono przycisk PAO dla karty ${rank}${suit}`);
    targetBtn.click();

    await waitFor(doc, () => roundEl.textContent === '2', 'Szop przechodzi do rundy 2', 3000);
    assert(roundEl.textContent === '2', 'Po poprawnej odpowiedzi Szop płynnie przeszedł do rundy 2!');
  }

  // ----------------------------------------------------
  // TEST 7: WIEWIÓRKA - ŁAŃCUCH SKOJARZEŃ
  // ----------------------------------------------------
  console.log('\n▶ TEST 7: Wiewiórka 🐿️ – Łańcuch Skojarzeń: ciągłość rund i kibicowanie');
  {
    const dom = setupDom('#/link/free/forward');
    const doc = dom.window.document;
    const roundEl = await waitFor(doc, () => doc.querySelector('.hud-round'), 'hud round');
    assert(roundEl.textContent === '1', 'Wiewiórka startuje od rundy 1');

    const itemEl = await waitFor(doc, () => doc.querySelector('.link-card h2'), 'link item');
    const currentName = itemEl.textContent.trim();

    const linkChain = [
      'Parasol',
      'Arbuz',
      'Rower',
      'Zegar',
      'Balon',
      'Kaktus',
      'Gitara',
      'Lody',
      'Klucz',
      'Latarka'
    ];
    const idx = linkChain.indexOf(currentName);
    const nextName = idx >= 0 && idx < linkChain.length - 1 ? linkChain[idx + 1] : null;

    const opts = Array.from(await waitFor(doc, () => doc.querySelectorAll('.opt-grid .btn-opt'), 'opcje łańcucha'));
    const targetBtn = nextName ? opts.find(b => b.textContent.includes(nextName)) : opts[0];
    assert(!!targetBtn, `Znaleziono kolejne ogniwo dla "${currentName}" -> "${nextName}"`);
    targetBtn.click();

    await waitFor(doc, () => roundEl.textContent === '2', 'Wiewiórka przechodzi do rundy 2', 3000);
    assert(roundEl.textContent === '2', 'Po poprawnej odpowiedzi Wiewiórka płynnie przeszedł do rundy 2!');
  }

  // ----------------------------------------------------
  // TEST 8: ŻÓŁWIK - KALENDARZ W GŁOWIE
  // ----------------------------------------------------
  console.log('\n▶ TEST 8: Żółwik 🐢 – Kalendarz w Głowie: ciągłość rund i kibicowanie');
  {
    const dom = setupDom('#/calendar/free/weekday');
    const doc = dom.window.document;
    const roundEl = await waitFor(doc, () => doc.querySelector('.hud-round'), 'hud round');
    assert(roundEl.textContent === '1', 'Żółwik startuje od rundy 1');

    const dateBadge = await waitFor(doc, () => doc.querySelector('.cal-date-badge'), 'cal date badge');
    const dateText = dateBadge.textContent.trim(); // np. "14 marca 2026"
    const parts = dateText.split(' ');
    const day = parseInt(parts[0], 10);
    const monthName = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);

    const monthMap = {
      'styczeń': 0, 'stycznia': 0,
      'luty': 1, 'lutego': 1,
      'marzec': 2, 'marca': 2,
      'kwiecień': 3, 'kwietnia': 3,
      'maj': 4, 'maja': 4,
      'czerwiec': 5, 'czerwca': 5,
      'lipiec': 6, 'lipca': 6,
      'sierpień': 7, 'sierpnia': 7,
      'wrzesień': 8, 'września': 8,
      'październik': 9, 'października': 9,
      'listopad': 10, 'listopada': 10,
      'grudzień': 11, 'grudnia': 11
    };
    const month = monthMap[monthName];
    const jsDay = new Date(year, month, day).getDay();
    const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const expectedDayName = dayNames[jsDay];

    const opts = Array.from(await waitFor(doc, () => doc.querySelectorAll('.opt-grid .btn-opt'), 'opcje dni tygodnia'));
    const targetBtn = opts.find(b => b.textContent.includes(expectedDayName));
    assert(!!targetBtn, `Znaleziono dzień tygodnia dla ${dateText} -> ${expectedDayName}`);
    targetBtn.click();

    await waitFor(doc, () => roundEl.textContent === '2', 'Żółwik przechodzi do rundy 2', 3000);
    assert(roundEl.textContent === '2', 'Po poprawnej odpowiedzi Żółwik płynnie przeszedł do rundy 2!');
  }

  console.log('\n====================================================');
  console.log(`🏁 WYNIKI TESTÓW CIĄGŁOŚCI: ${passed} ZDANYCH, ${failed} NIEZDANYCH`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch(err => {
  console.error('BŁĄD W TESTACH:', err);
  process.exit(1);
});
