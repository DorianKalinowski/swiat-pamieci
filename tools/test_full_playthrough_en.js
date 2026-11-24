const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const baseDir = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(baseDir, 'js', 'bundle.js'), 'utf8');

const polishCharRe = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
// Common Polish words that might appear without diacritics (false-negative guard)
const polishWordsRe = /\b(lekcj[aie]|komnat[ay]?|poziom|runda|wynik|rekord|gwiazdek|szanse|szans|podpowied[zź]|wskaz[oó]wk|rozpocznij|kontynuuj|powt[oó]rz|sprawdź|następna|poprzednia|wybierz|wszystkie|koniec|zobacz|pamiętasz|zapamiętaj|wspak|odwrotnie|zgadnij|brak|ukrywa|znajdował|znajduje|wybrano|prawidłowa|błąd|pomyłka|brawo|świetnie|super|dalej|start|wróć|zapisz|zamknij|zawód|ramię|zdanie|język|wymowa|kotwica|wyobrażenie|ogniwo|dzień|miesiąca|krok|przystanek|wybierz)\b/i;

function isUntranslated(txt) {
  if (!txt || typeof txt !== 'string') return false;
  const s = txt.trim();
  if (!s) return false;
  // Exclude intentional Polish language examples inside Cards / Foreign Vocabulary lessons ONLY if noted,
  // Actually let's log everything that matches polishCharRe OR key Polish UI words so we can inspect 100%!
  if (polishCharRe.test(s)) return true;
  // Check standalone Polish UI words if sentence is short or clearly Polish
  if (/\b(Komnata|Poziom|Runda|Krok|Przystanek|Podpowiedź|Wskazówka|Zawód|Most|Ogniwo|Ramię|Wynik|Rekord|Szanse|Pozostało|Zostały|Wybierz|Dalej|Jeszcze raz|Mapa lekcji|Gra swobodna)\b/.test(s)) {
    return true;
  }
  return false;
}

const findings = [];
function record(where, str) {
  const s = String(str).trim();
  if (!s) return;
  // Ignore language switcher PL button text and footer/copyright name if just "PL"
  if (s === 'PL' || s === 'US' || s === '🇵🇱 PL' || s === '🇺🇸 US') return;
  if (isUntranslated(s)) {
    findings.push({ where, text: s });
  }
}

function scanSubtree(root, where) {
  if (!root) return;
  const walker = root.ownerDocument.createTreeWalker(root, 4 /* TEXT_NODE */);
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) continue;
    if (parent && parent.closest && parent.closest('.lang-switcher')) continue;
    record(where, node.nodeValue);
  }
  const els = root.querySelectorAll ? root.querySelectorAll('[title], [aria-label], [placeholder]') : [];
  for (const el of els) {
    if (el.closest && el.closest('.lang-switcher')) continue;
    for (const attr of ['title', 'aria-label', 'placeholder']) {
      const val = el.getAttribute(attr);
      if (val) record(`${where} [${attr}]`, val);
    }
  }
}

function createApp(initialLang = 'en', storedData = {}) {
  const dom = new JSDOM(html.replace('<script src="js/bundle.js"></script>', ''), {
    url: 'http://localhost:8000/#/',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  const { window } = dom;

  window.localStorage.setItem('swiat-pamieci:v1', JSON.stringify({
    lang: initialLang,
    ...storedData
  }));

  window.AudioContext = class {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return { connect() {} }; }, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } }; }
  };
  window.webkitAudioContext = window.AudioContext;
  window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} }); // reducedMotion = true speeds up timers!
  window.scrollTo = () => {};
  window.requestAnimationFrame = cb => setTimeout(cb, 0);
  window.Element.prototype.animate = () => ({ finished: Promise.resolve(), cancel: () => {}, play: () => {}, pause: () => {} });
  if (!window.HTMLDialogElement.prototype.showModal) {
    window.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
    window.HTMLDialogElement.prototype.close = function() { this.open = false; };
  }

  // Track every live bubble message set on .sr-only
  const capturedBubbles = new Set();
  const origDesc = Object.getOwnPropertyDescriptor(window.Node.prototype, 'textContent');
  Object.defineProperty(window.Node.prototype, 'textContent', {
    get: origDesc.get,
    set(val) {
      if (this.classList && this.classList.contains('sr-only') && val) {
        capturedBubbles.add(String(val));
      }
      return origDesc.set.call(this, val);
    }
  });

  window.eval(js);
  return { dom, window, capturedBubbles };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function goto(window, hash) {
  window.location.hash = hash;
  await sleep(15);
}

async function run() {
  const { window, capturedBubbles } = createApp('en', { streak: { count: 3, last: new Date().toISOString().slice(0, 10) } });
  const doc = window.document;
  await sleep(30);

  // 1. Check Document title, topbar, footer, home, and modals
  record('document.title', doc.title);
  scanSubtree(doc.querySelector('.topbar'), 'topbar');
  scanSubtree(doc.querySelector('.footer'), 'footer');
  scanSubtree(doc.querySelector('#app'), 'home');
  for (const dlgId of ['#about', '#guide', '#installModal']) {
    scanSubtree(doc.querySelector(dlgId), `dialog ${dlgId}`);
  }

  const GAMES = [
    { id: 'digits', lessons: 15, modes: ['classic', 'flash', 'reverse', 'groups', 'melody', 'shapes'] },
    { id: 'palace', lessons: 9, modes: ['classic', 'speed', 'reverse', 'guardian', 'marathon'] },
    { id: 'names', lessons: 6, modes: ['who', 'find', 'sprint', 'cocktail'] },
    { id: 'major', lessons: 8, modes: ['consonants', 'words', 'numbers', 'pin_blitz'] },
    { id: 'words', lessons: 7, modes: ['bridge', 'flashcards', 'reverse', 'sprint'] },
    { id: 'cards', lessons: 6, modes: ['sequence', 'pao_match', 'missing', 'speed_deck'] },
    { id: 'link', lessons: 6, modes: ['next', 'prev', 'story_gap', 'speed_chain'] },
    { id: 'calendar', lessons: 6, modes: ['weekday', 'anchor', 'doomsday', 'speed_cal'] },
    { id: 'acrostic', lessons: 11, modes: ['decode', 'order', 'missing', 'speed_dog'] },
    { id: 'mindmap', lessons: 10, modes: ['missing_branch', 'assign', 'intruder', 'speed_map'] }
  ];

  for (const g of GAMES) {
    console.log('Testing game:', g.id);
    capturedBubbles.clear();

    // Menu (with 0 progress, then partial progress)
    await goto(window, `#/${g.id}`);
    scanSubtree(doc.querySelector('#app'), `${g.id} menu`);

    // Lesson Map
    await goto(window, `#/${g.id}/train`);
    scanSubtree(doc.querySelector('#app'), `${g.id} train-map`);

    // Every Lesson
    for (let li = 1; li <= g.lessons; li++) {
      await goto(window, `#/${g.id}/train/${li}`);
      await sleep(15);
      scanSubtree(doc.querySelector('#app'), `${g.id} lesson ${li} initial`);

      // Click through intro buttons / theory buttons / hint buttons if present
      for (let clickStep = 0; clickStep < 14; clickStep++) {
        const btns = [...doc.querySelectorAll('#app button')].filter(b => !b.disabled);
        const hintBtn = btns.find(b => /Podpowiedź|Hint/i.test(b.textContent));
        if (hintBtn && clickStep === 0) {
          hintBtn.click();
          await sleep(10);
          scanSubtree(doc.querySelector('#app'), `${g.id} lesson ${li} after hint`);
        }
        const nextBtn = btns.find(b => /Next|Dalej|Rozumiem|Got it|Check memory|Sprawdź pamięć|Kolejna komnata|Next room|Skip|Już pamiętam|I remember|Start|Zacznij|Przejdź|Kontynuuj/i.test(b.textContent));
        if (nextBtn) {
          const prevHash = window.location.hash;
          nextBtn.click();
          await sleep(15);
          scanSubtree(doc.querySelector('#app'), `${g.id} lesson ${li} step ${clickStep}`);
          if (window.location.hash !== prevHash) break;
        } else {
          // Try clicking option buttons (1st one, which might trigger wrong/right feedback!)
          const optBtn = btns.find(b => b.classList.contains('opt-btn') || b.classList.contains('btn-opt') || b.classList.contains('loci-opt') || b.classList.contains('choice-btn') || b.classList.contains('quiz-opt'));
          if (optBtn) {
            optBtn.click();
            await sleep(15);
            scanSubtree(doc.querySelector('#app'), `${g.id} lesson ${li} after opt click`);
            const btns2 = [...doc.querySelectorAll('#app button')].filter(b => !b.disabled && (b.classList.contains('opt-btn') || b.classList.contains('btn-opt') || b.classList.contains('loci-opt') || b.classList.contains('choice-btn') || b.classList.contains('quiz-opt')));
            if (btns2.length > 1) {
              btns2[1].click();
              await sleep(15);
              scanSubtree(doc.querySelector('#app'), `${g.id} lesson ${li} after opt2 click`);
            }
          } else {
            break;
          }
        }
      }
    }

    // Free Play Modes
    for (const m of g.modes) {
      await goto(window, `#/${g.id}/free/${m}`);
      await sleep(20);
      scanSubtree(doc.querySelector('#app'), `${g.id} free ${m} start`);

      // Simulate advancing through memorize / skip -> recall -> clicking options (to trigger wrong + right feedback + game over)
      for (let step = 0; step < 12; step++) {
        const btns = [...doc.querySelectorAll('#app button')].filter(b => !b.disabled);
        const skipOrNext = btns.find(b => /Skip|Już pamiętam|I remember|Check memory|Sprawdź pamięć|Kolejna komnata|Next room|Next|Dalej/i.test(b.textContent));
        if (skipOrNext) {
          skipOrNext.click();
          await sleep(15);
          scanSubtree(doc.querySelector('#app'), `${g.id} free ${m} step ${step}`);
          continue;
        }
        const optBtns = btns.filter(b => b.classList.contains('btn-opt') || b.classList.contains('opt-btn') || b.classList.contains('loci-opt') || b.classList.contains('face-card') || b.classList.contains('card-choice-btn') || b.classList.contains('quiz-opt') || b.classList.contains('branch-btn') || b.classList.contains('choice-btn'));
        if (optBtns.length > 0) {
          optBtns[step % optBtns.length].click();
          await sleep(15);
          scanSubtree(doc.querySelector('#app'), `${g.id} free ${m} opt ${step}`);
          continue;
        }
        break;
      }
    }

    // Check captured mascot bubbles for this game
    for (const msg of capturedBubbles) {
      record(`${g.id} mascot.say`, msg);
    }
  }

  // Deduplicate findings
  const byText = new Map();
  for (const f of findings) {
    if (!byText.has(f.text)) byText.set(f.text, []);
    byText.get(f.text).push(f.where);
  }

  console.log(`\n=======================================================`);
  console.log(`FULL PLAYTHROUGH AUDIT RESULTS (EN / USA MODE)`);
  console.log(`Total untranslated unique strings caught live: ${byText.size}`);
  console.log(`=======================================================\n`);

  let i = 1;
  for (const [text, wheres] of byText.entries()) {
    console.log(`${i++}. [${wheres[0]}${wheres.length > 1 ? ` +${wheres.length - 1} more` : ''}]`);
    console.log(`   "${text}"`);
  }

  fs.writeFileSync(
    path.join(__dirname, 'playthrough_findings.json'),
    JSON.stringify([...byText.entries()].map(([text, wheres]) => ({ text, wheres })), null, 2),
    'utf8'
  );
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
