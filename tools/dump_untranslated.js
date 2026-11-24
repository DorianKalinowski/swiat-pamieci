const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const i18n = require(path.join(rootDir, 'js', 'i18n.js'));
const extracted = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_extracted_for_translation.json'), 'utf8'));

const needed = [];

for (const [cat, list] of Object.entries(extracted)) {
  for (const raw of list) {
    const item = raw.replace(/`/g, '').trim();
    const testStr = item
      .replace(/\$\{done\}/g, '2')
      .replace(/\$\{LESSONS\.length\}/g, '6')
      .replace(/\$\{stars\}/g, '6')
      .replace(/\$\{c\}/g, '5')
      .replace(/\$\{score\}/g, '120')
      .replace(/\$\{lives\}/g, '3')
      .replace(/\$\{timeLeft\}/g, '30')
      .replace(/\$\{curIdx \+ 1\}/g, '1')
      .replace(/\$\{level\}/g, '2');

    const res = i18n.translateEn(testStr);
    if (res === testStr) {
      if (/[ąćęłńóśźż]/i.test(item) || /^(Szkolenie|Lekcja|Runda|Poziom|Punkty|Czas|Błędy|Komnata|Zamiast|Elitarny|Błyskawiczne|Duże|Daty)/i.test(item)) {
        if (!needed.some(n => n.original === item)) {
          needed.push({ cat, original: item, evaluated: testStr });
        }
      }
    }
  }
}

console.log('Total untranslated phrases to cover:', needed.length);
fs.writeFileSync(path.join(__dirname, 'untranslated_items.json'), JSON.stringify(needed, null, 2), 'utf8');
