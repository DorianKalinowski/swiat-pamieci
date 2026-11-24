const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const i18n = require(path.join(rootDir, 'js', 'i18n.js'));
const extracted = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_extracted_for_translation.json'), 'utf8'));

// Test translateEn on all categories
let totalChecked = 0;
let translatedCount = 0;
const untranslated = {};

for (const [cat, list] of Object.entries(extracted)) {
  untranslated[cat] = [];
  for (const raw of list) {
    totalChecked++;
    const item = raw.replace(/`/g, '').trim();
    // Simulate template evaluations
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
    if (res !== testStr) {
      translatedCount++;
    } else {
      // Check if it's already in english or digits/punctuation
      if (!/[ąćęłńóśźż]/i.test(item) && !/^(Szkolenie|Lekcja|Runda|Poziom|Punkty|Czas|Błędy|Komnata|Zamiast|Elitarny|Błyskawiczne|Duże|Daty)/i.test(item)) {
        // already english or neutral (like '50', '500', 'candle')
        translatedCount++;
      } else {
        untranslated[cat].push({ original: item, evaluated: testStr });
      }
    }
  }
}

console.log(`========================================`);
console.log(`TRANSLATION COVERAGE REPORT:`);
console.log(`Total items checked: ${totalChecked}`);
console.log(`Translated / Neutral: ${translatedCount} (${(translatedCount / totalChecked * 100).toFixed(1)}%)`);
console.log(`========================================`);

let fail = false;
for (const [cat, list] of Object.entries(untranslated)) {
  if (list.length > 0) {
    console.log(`⚠️ Category "${cat}" has ${list.length} untranslated items:`);
    list.slice(0, 5).forEach((u, i) => console.log(`   ${i + 1}. [${u.original}]`));
    fail = true;
  }
}

if (!fail) {
  console.log(`🎉 100% OF EXTRACTED UI STRINGS ARE TRANSLATED!`);
}
