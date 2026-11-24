const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '..', 'js', 'bundle.js');
const b = fs.readFileSync(bundlePath, 'utf8');
const lines = b.split('\n');

// Identify line ranges: i18n is roughly lines 130 to 3480. Game code starts after ~3480.
const i18nEnd = lines.findIndex((l, idx) => idx > 3000 && l.includes('function applyLangToDOM')) + 180;
console.log('i18n ends around line:', i18nEnd);

const polishCharRe = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;

// Extract all string literals & template literals from non-i18n game code
const nonI18nLines = lines.slice(i18nEnd);

console.log('\n=== CHECKING DIRECT DOM MANIPULATIONS OUTSIDE h() IN BUNDLE.JS ===');
nonI18nLines.forEach((l, idx) => {
  const lineNo = i18nEnd + idx + 1;
  const trimmed = l.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
  if (/(\.textContent\s*=|\.innerHTML\s*=|\bhtml\s*:)/.test(l)) {
    if (polishCharRe.test(l) || /SHAPE_PEGS|c\.word|\.name|\.desc|\.hint|\.action|timeLeft|score|level/.test(l)) {
      if (!l.includes("textContent = ''") && !l.includes("innerHTML = ''") && !l.includes('textContent = ""')) {
        console.log(`Line ${lineNo}: ${trimmed.slice(0, 140)}`);
      }
    }
  }
});

// Check all `say(` and `h(` template strings that contain ${...} AND Polish text
console.log('\n=== CHECKING TEMPLATE LITERALS WITH ${...} OUTSIDE i18n ===');
const templateIssues = [];
nonI18nLines.forEach((l, idx) => {
  const lineNo = i18nEnd + idx + 1;
  const trimmed = l.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
  const m = l.match(/`([^`]*\$\{[^`]+)`/g);
  if (m) {
    for (const tpl of m) {
      if (/`#\//.test(tpl) || /store\.|--p:|transform|rotate|hsl|rgb|rgba|calc\(/.test(tpl)) continue;
      // check if template has letters outside ${}
      const staticPart = tpl.replace(/\$\{[^}]+\}/g, '');
      if (polishCharRe.test(staticPart) || /\b(Komnata|Poziom|Runda|Lekcja|Wynik|Rekord|Gwiazdek|Szanse|Pozostało|Zostały|Masz|Podpowiedź|Zawód|Most|Słowo|Język|Wymowa|Ramię|Wskazówka|Wyobrażenie|Ogniwo|Cyfra|Cyfry|Krok|Przystanek|Dzień|Kotwica)\b/i.test(staticPart)) {
        templateIssues.push({ lineNo, tpl: trimmed.slice(0, 150) });
      }
    }
  }
});
console.log(`Found ${templateIssues.length} UI template literals with dynamic interpolation:`);
templateIssues.forEach(x => console.log(`  L${x.lineNo}: ${x.tpl}`));
