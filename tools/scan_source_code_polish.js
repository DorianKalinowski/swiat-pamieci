const fs = require('fs');
const path = require('path');
const i18n = require('../js/i18n.js');

const jsDir = path.join(__dirname, '..', 'js');

function getAllJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getAllJsFiles(full));
    } else if (file.endsWith('.js') && file !== 'bundle.js' && file !== 'i18n.js') {
      results.push(full);
    }
  }
  return results;
}

const allFiles = getAllJsFiles(jsDir);
console.log('Scanning', allFiles.length, 'files...');

const untranslated = [];

for (const filePath of allFiles) {
  const relPath = path.relative(path.join(__dirname, '..'), filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Match string literals
  // Regex to extract single, double, and backtick strings
  const stringRegex = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match;
  while ((match = stringRegex.exec(content)) !== null) {
    const rawQuote = match[1];
    let str = match[2];

    // ignore empty or whitespace
    if (!str || !str.trim()) continue;

    // We only care about strings containing Polish diacritics OR key Polish keywords
    const hasDiacritics = /[ąćęłńóśźż]/i.test(str);
    const hasPolishWords = /\b(Szkolenie|Lekcja|Runda|Poziom|Punkty|Czas|Błędy|Komnata|Zamiast|Elitarny|Błyskawiczne|Duże|Daty|Wróć|Zagraj|Rozpocznij|Kontynuuj|Powtórz|Koniec|Zapisz|Wybierz|Kto|Znajdź|Zamknij|Dalej|Poprawne|Brawo|Świetnie|Sekund|Szanse)\b/i.test(str);

    if (!hasDiacritics && !hasPolishWords) continue;

    // Ignore comments or imports
    if (str.includes('import ') || str.includes('export ') || str.startsWith('./') || str.startsWith('../')) continue;

    // Clean escaped newlines if any
    const cleaned = str.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();

    // Check simulation with template replacements
    const evalStr = cleaned
      .replace(/\$\{done\}/g, '2')
      .replace(/\$\{LESSONS\.length\}/g, '6')
      .replace(/\$\{stars\}/g, '6')
      .replace(/\$\{c\}/g, '5')
      .replace(/\$\{score\}/g, '120')
      .replace(/\$\{lives\}/g, '3')
      .replace(/\$\{timeLeft\}/g, '30')
      .replace(/\$\{curIdx \+ 1\}/g, '1')
      .replace(/\$\{level\}/g, '2')
      .replace(/\$\{target\.digit\}/g, '3')
      .replace(/\$\{target\.sounds\}/g, 'M')
      .replace(/\$\{target\.rule\}/g, 'reguła')
      .replace(/\$\{hiddenCard\.name\}/g, 'As')
      .replace(/\$\{solutionText\}/g, 'To nie to!')
      .replace(/\$\{solution\}/g, 'Kot');

    const translated = i18n.translateEn(evalStr);

    if (translated === evalStr || /[ąćęłńóśźż]/.test(translated)) {
      untranslated.push({
        file: relPath,
        raw: cleaned,
        evalStr: evalStr,
        result: translated
      });
    }
  }
}

console.log('Total untranslated occurrences found in source code:', untranslated.length);
fs.writeFileSync(path.join(__dirname, 'untranslated_source_strings.json'), JSON.stringify(untranslated, null, 2), 'utf8');

const sample = untranslated.slice(0, 20);
sample.forEach((u, i) => {
  console.log(`${i + 1}. [${u.file}] "${u.raw}" -> "${u.result}"`);
});
