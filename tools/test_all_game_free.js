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
  const freePath = path.join(__dirname, '..', 'js', 'games', g, 'free.js');
  if (!fs.existsSync(freePath)) continue;
  
  const content = fs.readFileSync(freePath, 'utf8');

  // Extract all string literals
  const stringRegex = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match;
  while ((match = stringRegex.exec(content)) !== null) {
    let str = match[2];
    if (!str || !str.trim()) continue;
    if (str.length < 2) continue;
    if (!/[ąćęłńóśźż]/i.test(str) && !/\b(Szkolenie|Lekcja|Runda|Poziom|Punkty|Czas|Błędy|Komnata|Zamiast|Elitarny|Błyskawiczne|Duże|Daty|Wróć|Zagraj|Rozpocznij|Kontynuuj|Powtórz|Koniec|Zapisz|Wybierz|Kto|Znajdź|Zamknij|Dalej|Poprawne|Brawo|Świetnie|Sekund|Szanse|Menu|Klasyczny|Start|Cześć|Hau|Miau|Plusk|Uhuhu|Kraaa|Brawo|Rekord|Wynik)\b/i.test(str)) {
      continue;
    }
    
    // clean
    const cleaned = str.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    // evaluate template
    const testStr = cleaned
      .replace(/\$\{score\}/g, '120')
      .replace(/\$\{lives\}/g, '3')
      .replace(/\$\{timeLeft\}/g, '30')
      .replace(/\$\{round\}/g, '2')
      .replace(/\$\{level\}/g, '2')
      .replace(/\$\{c\}/g, '5')
      .replace(/\$\{targetWord\}/g, 'Mama')
      .replace(/\$\{targetItem\}/g, 'Mianownik')
      .replace(/\$\{currentItem\}/g, 'Merkury')
      .replace(/\$\{nextItem\}/g, 'Wenus')
      .replace(/\$\{missingItem\}/g, 'Ziemia')
      .replace(/\$\{mAnchorText\}/g, 'Sobota')
      .replace(/\$\{mInfo\.name\.toLowerCase\(\)\}/g, 'maj')
      .replace(/\$\{mInfo\.name\}/g, 'Maj')
      .replace(/\$\{year\}/g, '2026')
      .replace(/\$\{yearAnchor\.name\}/g, 'Sobota')
      .replace(/\$\{target\.name\}/g, 'Maj')
      .replace(/\$\{target\.anchorDay\}/g, '9')
      .replace(/\$\{target\.rule\}/g, '9 do 5')
      .replace(/\$\{target\.digit\}/g, '3')
      .replace(/\$\{target\.sounds\}/g, 'M')
      .replace(/\$\{target\.word\}/g, 'Mysz')
      .replace(/\$\{target\.num\}/g, '30')
      .replace(/\$\{target\.code\}/g, 'M-S')
      .replace(/\$\{target\.lang\}/g, 'angielski')
      .replace(/\$\{target\.foreign\}/g, 'cat')
      .replace(/\$\{target\.meaning\}/g, 'kot')
      .replace(/\$\{target\.bridge\}/g, 'kat')
      .replace(/\$\{pinCode\}/g, '1234')
      .replace(/\$\{day\}/g, '15')
      .replace(/\$\{dayChoice\}/g, '9')
      .replace(/\$\{correctDay\.name\}/g, 'Sobota')
      .replace(/\$\{hiddenCard\.name\}/g, 'As Kier')
      .replace(/\$\{solutionText\}/g, 'Brak')
      .replace(/\$\{solution\}/g, 'Kot')
      .replace(/\$\{cocktailPool\.length\}/g, '5');

    totalStrings++;
    const res = i18n.translateEn(testStr);
    if (res === testStr || /[ąćęłńóśźż]/i.test(res)) {
      missingStrings.push({ game: g, raw: cleaned, evaluated: testStr, result: res });
    }
  }
}

console.log(`Checked ${totalStrings} free mode strings across 10 games.`);
console.log(`Missing translations: ${missingStrings.length}`);

missingStrings.forEach((m, idx) => {
  console.log(`${idx + 1}. [${m.game}] "${m.evaluated}" -> "${m.result}"`);
});

fs.writeFileSync(path.join(__dirname, 'missing_free_strings.json'), JSON.stringify(missingStrings, null, 2), 'utf8');
