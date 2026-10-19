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

async function runFriendlyTests() {
  console.log('====================================================');
  console.log('🌟 TEST PRZYJAZNYCH LEKCJI DLA DZIECI I DOROSŁYCH');
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

  // 1. SOWA (Major)
  console.log('▶ TEST 1: Sowa Profesor 🦉 (Major)');
  let dom = setupDom('#/major/train/1');
  let doc = dom.window.document;
  await waitFor(() => doc.querySelector('.theory-card h3'), 'Lekcja 1 Sowy');
  
  const owlHeader = doc.querySelector('.theory-card h3').textContent;
  assert(owlHeader.includes('Tajnik Sówki') && !owlHeader.includes('Wykład'), 'Brak sztywnego „Wykładu” – jest przyjazny „Tajnik Sówki”');
  
  const owlTheory = doc.querySelector('.theory-text').textContent;
  console.log('  [LOG owlTheory]:', owlTheory);
  assert(owlTheory.includes('Po co nam ta technika?') || owlTheory.includes('mózg'), 'Teoria Sowy zaczyna się od wyjaśnienia po co i co daje technika');

  await new Promise(r => setTimeout(r, 400));
  const owlBubble = doc.querySelector('.bubble-text')?.textContent || '';
  assert(owlBubble.includes('Uhuhu!') || owlBubble.includes('Sówka'), `Chmurka Sowy jest ciepła i zachęcająca: "${owlBubble.slice(0, 45)}..."`);

  // 2. LISEK (Imiona)
  console.log('\n▶ TEST 2: Lisek Bystrzak 🦊 (Imiona i Twarze)');
  dom = setupDom('#/names/train/1');
  doc = dom.window.document;
  await waitFor(() => doc.querySelector('.theory-card h3'), 'Lekcja 1 Liska');
  
  const foxHeader = doc.querySelector('.theory-card h3').textContent;
  assert(foxHeader.includes('Wskazówka Liska'), 'Nagłówek lekcji Liska to przyjazna „Wskazówka Liska”');
  
  const foxTheory = doc.querySelector('.theory-text').textContent;
  assert(foxTheory.includes('Po co nam ta umiejętność?') || foxTheory.includes('klasie'), 'Teoria Liska wyjaśnia życiowy cel (zapamiętanie imion)');

  await new Promise(r => setTimeout(r, 400));
  const foxBubble = doc.querySelector('.bubble-text')?.textContent || '';
  assert(foxBubble.includes('Lisek') || foxBubble.includes('Cześć'), `Chmurka Liska jest ciepła: "${foxBubble.slice(0, 45)}..."`);

  // 3. PAPUGA (Słówka)
  console.log('\n▶ TEST 3: Papużka Pola 🦜 (Słownictwo i Języki)');
  dom = setupDom('#/words/train/1');
  doc = dom.window.document;
  await waitFor(() => doc.querySelector('.theory-card h3'), 'Lekcja 1 Papużki');
  
  const parrotHeader = doc.querySelector('.theory-card h3').textContent;
  assert(parrotHeader.includes('Papuzie odkrycie'), 'Nagłówek lekcji Papugi to „Papuzie odkrycie”');
  
  const parrotTheory = doc.querySelector('.theory-text').textContent;
  assert(parrotTheory.includes('Po co nam ta metoda?') || parrotTheory.includes('podróżach'), 'Teoria Papużki wyjaśnia cel nauki języków obcych');

  await new Promise(r => setTimeout(r, 400));
  const parrotBubble = doc.querySelector('.bubble-text')?.textContent || '';
  assert(parrotBubble.includes('Pola') || parrotBubble.includes('Cześć'), `Chmurka Papużki jest radosna: "${parrotBubble.slice(0, 45)}..."`);

  // 4. SZOP (Karty)
  console.log('\n▶ TEST 4: Szop Magik 🦝 (Karty i PAO)');
  dom = setupDom('#/cards/train/1');
  doc = dom.window.document;
  await waitFor(() => doc.querySelector('.theory-card h3'), 'Lekcja 1 Szopa');
  
  const raccoonHeader = doc.querySelector('.theory-card h3').textContent;
  assert(raccoonHeader.includes('Magiczna sztuczka Szopa'), 'Nagłówek lekcji Szopa to „Magiczna sztuczka Szopa”');
  
  const raccoonTheory = doc.querySelector('.theory-text').textContent;
  assert(raccoonTheory.includes('Po co uczyć się zapamiętywania kart?') || raccoonTheory.includes('sekwencje'), 'Teoria Szopa wyjaśnia cel zapamiętywania sekwencji');

  await new Promise(r => setTimeout(r, 400));
  const raccoonBubble = doc.querySelector('.bubble-text')?.textContent || '';
  assert(raccoonBubble.includes('Abrakadabra') || raccoonBubble.includes('Szop'), `Chmurka Szopa jest magiczna: "${raccoonBubble.slice(0, 45)}..."`);

  // 5. WIEWIÓRKA (Łańcuch)
  console.log('\n▶ TEST 5: Wiewiórka Basia 🐿️ (Łańcuchowa Metoda Skojarzeń)');
  dom = setupDom('#/link/train/1');
  doc = dom.window.document;
  await waitFor(() => doc.querySelector('.theory-card h3'), 'Lekcja 1 Wiewiórki');
  
  const squirrelHeader = doc.querySelector('.theory-card h3').textContent;
  assert(squirrelHeader.includes('Sprytny trik Basi'), 'Nagłówek lekcji Wiewiórki to „Sprytny trik Basi”');
  
  const squirrelTheory = doc.querySelector('.theory-text').textContent;
  assert(squirrelTheory.includes('Po co nam ta technika?') || squirrelTheory.includes('zakupów'), 'Teoria Wiewiórki wyjaśnia zapamiętywanie list bez kartki');

  await new Promise(r => setTimeout(r, 400));
  const squirrelBubble = doc.querySelector('.bubble-text')?.textContent || '';
  assert(squirrelBubble.includes('Wiewiórka') || squirrelBubble.includes('Chrup'), `Chmurka Wiewiórki jest wesoła: "${squirrelBubble.slice(0, 45)}..."`);

  // 6. ŻÓŁW (Kalendarz)
  console.log('\n▶ TEST 6: Żółwik Zenon 🐢 (Kalendarz i Dni Tygodnia)');
  dom = setupDom('#/calendar/train/1');
  doc = dom.window.document;
  await waitFor(() => doc.querySelector('.theory-card h3'), 'Lekcja 1 Żółwika');
  
  const turtleHeader = doc.querySelector('.theory-card h3').textContent;
  assert(turtleHeader.includes('Mądrość Żółwika'), 'Nagłówek lekcji Żółwia to „Mądrość Żółwika”');
  
  const turtleTheory = doc.querySelector('.theory-text').textContent;
  assert(turtleTheory.includes('Po co nam ta technika?') || turtleTheory.includes('urodziny'), 'Teoria Żółwika wyjaśnia cel obliczania dnia tygodnia');

  await new Promise(r => setTimeout(r, 400));
  const turtleBubble = doc.querySelector('.bubble-text')?.textContent || '';
  console.log('  [LOG turtleBubble]:', turtleBubble);
  assert(!turtleBubble.includes('modulo 7') && (turtleBubble.includes('Zenon') || turtleBubble.includes('urodziny') || turtleBubble.includes('daty') || turtleBubble.includes('Cześć')), `Chmurka Żółwika bez suchego „modulo 7”: "${turtleBubble.slice(0, 45)}..."`);

  // 7. KOTEK (Cyfry)
  console.log('\n▶ TEST 7: Kotek Mruczek 🐱 (Cyfry)');
  dom = setupDom('#/digits/train/1');
  doc = dom.window.document;
  await waitFor(() => doc.querySelector('.screen.step'), 'Lekcja 1 Kotka');
  await new Promise(r => setTimeout(r, 400));
  const catBubble = doc.querySelector('.bubble-text')?.textContent || '';
  console.log('  [LOG catBubble]:', catBubble);
  assert(catBubble.includes('Mruczek') || catBubble.includes('supermocy') || catBubble.includes('trenerem') || catBubble.includes('Miau'), `Chmurka Kotka: "${catBubble.slice(0, 50)}..."`);

  // 8. TYGRYSEK (Pałac)
  console.log('\n▶ TEST 8: Tygrysek Leon 🐯 (Pałac Pamięci)');
  dom = setupDom('#/palace/train/1');
  doc = dom.window.document;
  await waitFor(() => doc.querySelector('.intro-box .intro-text'), 'Lekcja 1 Tygryska');
  const introP = doc.querySelector('.intro-box .intro-text')?.textContent || '';
  assert(introP.includes('Tygrysek Leon') && introP.includes('Rawrr'), `Intro Tygryska: "${introP.slice(0, 50)}..."`);

  console.log('\n====================================================');
  console.log(`🏁 WYNIKI PRZYJAZNYCH LEKCJI: ${passed} ZDANYCH, ${failed} NIEZDANYCH`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runFriendlyTests().catch(err => {
  console.error('BŁĄD TESTU:', err);
  process.exit(1);
});
