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
  const indexPath = path.join(__dirname, '..', 'js', 'games', g, 'index.js');
  const modesPath = path.join(__dirname, '..', 'js', 'games', g, 'modes.js');
  
  const content = fs.readFileSync(indexPath, 'utf8') + '\n' + (fs.existsSync(modesPath) ? fs.readFileSync(modesPath, 'utf8') : '');

  // Extract all string literals
  const stringRegex = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match;
  while ((match = stringRegex.exec(content)) !== null) {
    let str = match[2];
    if (!str || !str.trim()) continue;
    if (str.length < 2) continue;
    if (!/[ąćęłńóśźż]/i.test(str) && !/\b(Szkolenie|Lekcja|Runda|Poziom|Punkty|Czas|Błędy|Komnata|Zamiast|Elitarny|Błyskawiczne|Duże|Daty|Wróć|Zagraj|Rozpocznij|Kontynuuj|Powtórz|Koniec|Zapisz|Wybierz|Kto|Znajdź|Zamknij|Dalej|Poprawne|Brawo|Świetnie|Sekund|Szanse|Menu|Klasyczny|Spostrzegawczość|Na czas|Nieskończony|Mistrz|Wyzwanie|Trening)\b/i.test(str)) {
      continue;
    }
    
    // clean
    const cleaned = str.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    // evaluate template
    const testStr = cleaned
      .replace(/\$\{done\}/g, '2')
      .replace(/\$\{LESSONS\.length\}/g, '6')
      .replace(/\$\{stars\}/g, '6')
      .replace(/\$\{MODES\.length\}/g, '4')
      .replace(/\$\{score\}/g, '120')
      .replace(/\$\{lives\}/g, '3');

    totalStrings++;
    const res = i18n.translateEn(testStr);
    if (res === testStr || /[ąćęłńóśźż]/i.test(res)) {
      missingStrings.push({ game: g, raw: cleaned, evaluated: testStr, result: res });
    }
  }
}

console.log(`Checked ${totalStrings} menu strings across 10 games.`);
console.log(`Missing translations: ${missingStrings.length}`);

missingStrings.forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.game}] "${m.evaluated}" -> "${m.result}"`);
});

fs.writeFileSync(path.join(__dirname, 'missing_menu_strings.json'), JSON.stringify(missingStrings, null, 2), 'utf8');
