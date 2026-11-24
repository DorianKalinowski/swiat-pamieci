const fs = require('fs');
const path = require('path');
const i18n = require('../js/i18n.js');

const games = [
  'names', 'palace', 'digits', 'major', 'cards',
  'link', 'calendar', 'acrostic', 'words', 'mindmap'
];

let totalStrings = 0;
let missingStrings = [];

for (const g of games) {
  const trainPath = path.join(__dirname, '..', 'js', 'games', g, 'train.js');
  if (!fs.existsSync(trainPath)) continue;
  
  const content = fs.readFileSync(trainPath, 'utf8');

  // Extract all string literals
  const stringRegex = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match;
  while ((match = stringRegex.exec(content)) !== null) {
    let str = match[2];
    if (!str || !str.trim()) continue;
    if (str.length < 2) continue;
    if (!/[ąćęłńóśźż]/i.test(str) && !/\b(Szkolenie|Lekcja|Runda|Poziom|Punkty|Czas|Błędy|Komnata|Zamiast|Elitarny|Błyskawiczne|Duże|Daty|Wróć|Zagraj|Rozpocznij|Kontynuuj|Powtórz|Koniec|Zapisz|Wybierz|Kto|Znajdź|Zamknij|Dalej|Poprawne|Brawo|Świetnie|Sekund|Szanse|Menu|Klasyczny|Start|Cześć|Hau|Miau|Plusk|Uhuhu|Kraaa|Brawo)\b/i.test(str)) {
      continue;
    }
    
    // clean
    const cleaned = str.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    // evaluate template
    const testStr = cleaned
      .replace(/\$\{doneCount\}/g, '2')
      .replace(/\$\{LESSONS\.length\}/g, '6')
      .replace(/\$\{LESSONS\.length \* 3\}/g, '18')
      .replace(/\$\{totalStars\}/g, '6')
      .replace(/\$\{stars\}/g, '3')
      .replace(/\$\{idx \+ 1\}/g, '1')
      .replace(/\$\{index \+ 1\}/g, '1')
      .replace(/\$\{currentRoomIdx \+ 1\}/g, '1')
      .replace(/\$\{lesson\.loci\.length\}/g, '5')
      .replace(/\$\{room\.name\}/g, 'Hol')
      .replace(/\$\{loc\.story\}/g, 'Banan')
      .replace(/\$\{les\.subtitle\}/g, 'Wstęp')
      .replace(/\$\{score\}/g, '120');

    totalStrings++;
    const res = i18n.translateEn(testStr);
    if (res === testStr || /[ąćęłńóśźż]/i.test(res)) {
      missingStrings.push({ game: g, raw: cleaned, evaluated: testStr, result: res });
    }
  }
}

console.log(`Checked ${totalStrings} train strings across 10 games.`);
console.log(`Missing translations: ${missingStrings.length}`);

missingStrings.forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.game}] "${m.evaluated}" -> "${m.result}"`);
});

fs.writeFileSync(path.join(__dirname, 'missing_train_strings.json'), JSON.stringify(missingStrings, null, 2), 'utf8');
