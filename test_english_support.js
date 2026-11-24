const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const baseDir = __dirname;
const html = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(baseDir, 'js/bundle.js'), 'utf8');

function setupDom(initialHash = '#/', initialLang = null) {
  const dom = new JSDOM(html.replace('<script src="js/bundle.js"></script>', ''), {
    url: `http://localhost:8000/${initialHash}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  const { window } = dom;

  if (initialLang) {
    window.localStorage.setItem('swiat-pamieci:v1', JSON.stringify({ lang: initialLang }));
  }

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
console.log('🇺🇸🇵🇱 TEST WSPARCIA JĘZYKA ANGIELSKIEGO (AMERICAN ENGLISH)');
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
  // TEST 1: PRZEŁĄCZNIK JĘZYKA W NAGŁÓWKU
  // ----------------------------------------------------
  console.log('▶ TEST 1: Przełącznik języka w pasku górnym obok awatara');
  {
    const dom = setupDom('#/');
    const doc = dom.window.document;

    const switcher = doc.querySelector('.lang-switcher');
    assert(!!switcher, 'Przełącznik .lang-switcher istnieje w DOM');

    const plBtn = doc.querySelector('#langPlBtn');
    const enBtn = doc.querySelector('#langEnBtn');
    assert(!!plBtn && !!enBtn, 'Oba przyciski #langPlBtn (🇵🇱 PL) i #langEnBtn (🇺🇸 US) są obecne');

    assert(plBtn.classList.contains('active'), 'Domyślnie aktywny jest język polski (PL)');
    assert(!enBtn.classList.contains('active'), 'Język angielski nie jest domyślnie aktywny');

    const authorBtn = doc.querySelector('#authorBtn');
    assert(!!authorBtn, 'Przycisk ze zdjęciem autora istnieje');
  }

  // ----------------------------------------------------
  // TEST 2: PRZEŁĄCZENIE NA WIDOK USA (AMERICAN ENGLISH) NA ŻYWO
  // ----------------------------------------------------
  console.log('\n▶ TEST 2: Kliknięcie w flagę USA (🇺🇸) – dynamiczna zmiana języka całej strony');
  {
    const dom = setupDom('#/');
    const doc = dom.window.document;

    const enBtn = doc.querySelector('#langEnBtn');
    const plBtn = doc.querySelector('#langPlBtn');

    // Klikamy przycisk USA!
    enBtn.click();

    await waitFor(doc, () => enBtn.classList.contains('active'), 'enBtn active');
    assert(enBtn.classList.contains('active'), 'Przycisk US ma teraz klasę .active');
    assert(!plBtn.classList.contains('active'), 'Przycisk PL nie ma klasy .active');
    assert(doc.documentElement.lang === 'en', 'Atrybut lang dokumentu to "en"');

    // Weryfikacja statycznych elementów w nagłówku i stopce
    assert(doc.title.includes('World of Memory'), `Tytuł karty w przeglądarce to: "${doc.title}"`);
    assert(doc.querySelector('.brand span').textContent === 'World of Memory', 'Brand w nagłówku to "World of Memory"');
    assert(doc.querySelector('#installBtn span').textContent === 'Install', 'Przycisk instalacji to "Install"');
    assert(doc.querySelector('#authorLink').textContent.includes('Created by Dorian Kalinowski'), 'Stopka to "Created by Dorian Kalinowski"');
    assert(doc.querySelector('.footer span').textContent.includes('All rights reserved'), 'Prawa autorskie w języku angielskim');

    // Weryfikacja Hub (Strona Główna)
    const heroH1 = doc.querySelector('.hero h1');
    assert(heroH1 && heroH1.textContent.includes('World of') && heroH1.textContent.includes('Memory'), `Nagłówek Hero to: "${heroH1.textContent.trim()}"`);

    const leadP = doc.querySelector('.hero p.lead');
    assert(leadP && leadP.textContent.includes('Mini-games teaching you memory techniques'), 'Opis Hero przetłumaczony na American English');

    const sectionTitle = doc.querySelector('.section-title');
    assert(sectionTitle && sectionTitle.textContent === 'Choose a Game', `Tytuł sekcji gier to: "${sectionTitle.textContent}"`);

    const stats = doc.querySelectorAll('.stats .stat span');
    assert(stats.length >= 3, 'Statystyki są widoczne');
    assert(stats[0].textContent.includes('streak'), `Statystyka serii to: "${stats[0].textContent}"`);
    assert(stats[1].textContent.includes('stars'), `Statystyka gwiazdek to: "${stats[1].textContent}"`);
    assert(stats[2].textContent.includes('games ready'), `Statystyka gier to: "${stats[2].textContent}"`);

    // Weryfikacja kart gier na Hubie
    const playBtns = doc.querySelectorAll('.game-grid .gc-play');
    assert(playBtns.length === 10, 'Wszystkie 10 gier posiada przycisk');
    assert(playBtns[0].textContent === 'Play ▶', `Przycisk karty gry to "Play ▶" (znaleziono: "${playBtns[0].textContent}")`);

    const cardTitles = Array.from(doc.querySelectorAll('.game-grid .game-card h3')).map(h => h.textContent);
    assert(cardTitles.includes('Digits'), 'Karta Cyfr to "Digits"');
    assert(cardTitles.includes('Memory Palace'), 'Karta Pałacu to "Memory Palace"');
    assert(cardTitles.includes('Names & Faces'), 'Karta Imion to "Names & Faces"');
    assert(cardTitles.includes('Major System'), 'Karta Majora to "Major System"');
    assert(cardTitles.includes('Playing Cards'), 'Karta Kart to "Playing Cards"');
    assert(cardTitles.includes('Link System'), 'Karta Łańcucha to "Link System"');
    assert(cardTitles.includes('Mental Calendar'), 'Karta Kalendarza to "Mental Calendar"');
    assert(cardTitles.includes('Acrostics & Rhymes'), 'Karta Akrostychów to "Acrostics & Rhymes"');
    assert(cardTitles.includes('Mind Maps'), 'Karta Map Myśli to "Mind Maps"');
  }

  // ----------------------------------------------------
  // TEST 3: MODAL AUTORA & ŚCIĄGAWKA TECHNIK W JĘZYKU ANGIELSKIM
  // ----------------------------------------------------
  console.log('\n▶ TEST 3: Modale autora i ściągawki technik po przełączeniu na USA');
  {
    const dom = setupDom('#/', 'en');
    const doc = dom.window.document;

    // Modal o autorze
    const aboutRole = doc.querySelector('.about-role');
    assert(aboutRole && aboutRole.textContent.includes('Creator of "World of Memory"'), `Rola autora: "${aboutRole.textContent}"`);

    const missionQuote = doc.querySelector('.mission-quote');
    assert(missionQuote && missionQuote.textContent.includes('My mission is to empower everyone'), 'Cytat misji w języku angielskim');

    const roadmapPreview = doc.querySelector('.roadmap-preview');
    assert(roadmapPreview && roadmapPreview.textContent.includes('10 memory systems and their animal teachers'), 'Lista systemów w oknie autora po angielsku');
    assert(roadmapPreview.textContent.includes('Whiskers the Cat') && roadmapPreview.textContent.includes('Inky the Octopus'), 'Angielskie imiona maskotek w spisie');

    // Modal ściągawki technik pamięciowych
    const guideTitle = doc.querySelector('#guideTitle');
    assert(guideTitle && guideTitle.textContent.includes('10 Memory Techniques in a Nutshell'), `Tytuł ściągawki to: "${guideTitle.textContent}"`);

    const guideCards = doc.querySelectorAll('.guide-scroll .guide-card');
    assert(guideCards.length === 10, 'Ściągawka zawiera 10 kart technik w języku angielskim');
    assert(guideCards[0].textContent.includes('Digits – Number Shapes (Whiskers the Cat 🐱)'), 'Karta 1 w języku angielskim');
    assert(guideCards[1].textContent.includes('Memory Palace (Method of Loci) – Leo the Tiger 🐯'), 'Karta 2 w języku angielskim');
    assert(guideCards[9].textContent.includes('Mind Maps (Inky the Octopus 🐙)'), 'Karta 10 w języku angielskim');
  }

  // ----------------------------------------------------
  // TEST 4: EKRANY GIER W WIDOKU USA (TRENINGI, MENU I LEKCJE)
  // ----------------------------------------------------
  console.log('\n▶ TEST 4: Ekrany gier i szkolenia w języku angielskim');
  {
    // Menu gry Cyfry
    const domDigits = setupDom('#/digits', 'en');
    const docDigits = domDigits.window.document;
    const trainCard = await waitFor(docDigits, () => docDigits.querySelector('#app .train-card'), 'digits train card');
    assert(trainCard.textContent.includes('Training') || trainCard.textContent.includes('Start') || trainCard.textContent.includes('Digits'), 'Karta treningu w języku angielskim');

    const sections = docDigits.querySelectorAll('#app .section-title');
    assert(sections.length >= 2, 'Sekcje menu są widoczne');
    assert(sections[0].textContent.includes('Training'), `Sekcja 1 to: "${sections[0].textContent.trim()}"`);
    assert(sections[1].textContent.includes('Free Play'), `Sekcja 2 to: "${sections[1].textContent.trim()}"`);

    const backLink = docDigits.querySelector('.crumbs a.back');
    assert(backLink && (backLink.textContent.includes('All Games') || backLink.textContent.includes('Home')), `Link powrotu to: "${backLink.textContent.trim()}"`);

    // Mapa szkoleniowa Ośmiornicy Inki (Mind Maps)
    const domOcto = setupDom('#/mindmap/train', 'en');
    const docOcto = domOcto.window.document;
    const whyCard = await waitFor(docOcto, () => docOcto.querySelector('.why-card'), 'octo why card');
    assert(whyCard.textContent.includes('Why do you need this technique in everyday life?'), 'Nagłówek celu w języku angielskim');
    assert(whyCard.textContent.includes('Instead of getting lost in boring, line-by-line notes'), 'Treść celu w języku angielskim');

    const octoTitle = docOcto.querySelector('h1');
    assert(octoTitle.textContent.includes('Mind Maps with Inky the Octopus'), `Tytuł szkolenia: "${octoTitle.textContent.trim()}"`);

    // Lekcja Pieska Łatka (Acrostics)
    const domDog = setupDom('#/acrostic/train/1', 'en');
    const docDog = domDog.window.document;
    const dogBadge = await waitFor(docDog, () => docDog.querySelector('.badge'), 'dog badge');
    assert(dogBadge.textContent.includes('Lesson 1 of 10'), `Odznaka lekcji to: "${dogBadge.textContent}"`);

    const dogHint = docDog.querySelector('.task-foot button');
    assert(dogHint.textContent.includes("Patch's Hint"), `Przycisk podpowiedzi to: "${dogHint.textContent.trim()}"`);
  }

  // ----------------------------------------------------
  // TEST 5: POWRÓT DO JĘZYKA POLSKIEGO (PEŁNA ZGODNOŚĆ 100%)
  // ----------------------------------------------------
  console.log('\n▶ TEST 5: Kliknięcie we flagę Polski (🇵🇱) – natychmiastowy i bezbłędny powrót do PL');
  {
    const dom = setupDom('#/', 'en');
    const doc = dom.window.document;

    const plBtn = doc.querySelector('#langPlBtn');
    plBtn.click();

    await waitFor(doc, () => plBtn.classList.contains('active'), 'plBtn active');
    assert(plBtn.classList.contains('active'), 'Przycisk PL jest ponownie aktywny');
    assert(doc.documentElement.lang === 'pl', 'Atrybut lang dokumentu to ponownie "pl"');
    assert(doc.title.includes('Świat pamięci'), `Tytuł dokumentu wrócił do polskiego: "${doc.title}"`);
    assert(doc.querySelector('.brand span').textContent === 'Świat pamięci', 'Brand to ponownie "Świat pamięci"');
    assert(doc.querySelector('.section-title').textContent === 'Wybierz grę', 'Tytuł sekcji to ponownie "Wybierz grę"');
    assert(doc.querySelector('.gc-play').textContent === 'Graj ▶', 'Przycisk gry to ponownie "Graj ▶"');
  }

  console.log('\n====================================================');
  console.log(`🏁 WYNIKI TESTÓW JĘZYKOWYCH: ${passed} ZDANYCH, ${failed} NIEZDANYCH`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch(err => {
  console.error('BŁĄD W TRAKCIE TESTÓW:', err);
  process.exit(1);
});
