const fs = require('fs');
const path = require('path');
const i18n = require('../js/i18n.js');

// We test every game's LESSONS and MODES directly from the source and bundle
const games = ['digits', 'palace', 'names', 'major', 'words', 'cards', 'link', 'calendar', 'acrostic', 'mindmap'];

const polishCharRegex = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;

const findings = [];

function checkText(context, text) {
  if (!text || typeof text !== 'string') return;
  const str = text.trim();
  if (!str) return;

  const translated = i18n.translateEn(str);
  if (polishCharRegex.test(translated)) {
    findings.push({
      context,
      pl: str,
      en: translated
    });
  }
}

for (const g of games) {
  // Check lessons
  const lessonsPath = path.join(__dirname, '..', 'js', 'games', g, 'lessons.js');
  if (fs.existsSync(lessonsPath)) {
    const mod = require(lessonsPath);
    if (mod.LESSONS) {
      mod.LESSONS.forEach((les, idx) => {
        checkText(`${g} lesson[${idx + 1}].title`, les.title);
        checkText(`${g} lesson[${idx + 1}].subtitle`, les.subtitle);
        checkText(`${g} lesson[${idx + 1}].speech`, les.speech);
        checkText(`${g} lesson[${idx + 1}].prompt`, les.prompt);
        checkText(`${g} lesson[${idx + 1}].hint`, les.hint);
        if (les.intro) {
          (Array.isArray(les.intro) ? les.intro : [les.intro]).forEach((p, i) => {
            checkText(`${g} lesson[${idx + 1}].intro[${i}]`, p);
          });
        }
        if (les.theory) {
          (Array.isArray(les.theory) ? les.theory : [les.theory]).forEach((p, i) => {
            checkText(`${g} lesson[${idx + 1}].theory[${i}]`, p);
          });
        }
        if (les.options) {
          les.options.forEach((opt, i) => {
            checkText(`${g} lesson[${idx + 1}].options[${i}]`, opt);
          });
        }
      });
    }
  }

  // Check modes
  const modesPath = path.join(__dirname, '..', 'js', 'games', g, 'modes.js');
  if (fs.existsSync(modesPath)) {
    const mod = require(modesPath);
    if (mod.MODES) {
      mod.MODES.forEach((m, idx) => {
        checkText(`${g} mode[${m.id}].name`, m.name);
        checkText(`${g} mode[${m.id}].desc`, m.desc);
        checkText(`${g} mode[${m.id}].badge`, m.badge);
      });
    }
  }
}

// Check train subtitles and kickers
const trainSubtitles = [
  '15 lekcji · od 1 do 12 cyfr · podpowiedzi Mruczka',
  '15 lekcji · od 3 do 12 cyfr · podpowiedzi Mruczka',
  '10 lekcji · od 2 do 10 komnat · spokojne wskazówki Leona',
  '6 interaktywnych lekcji · kotwice cech · mosty fonetyczne',
  '8 lekcji · spółgłoski 0-9 · kołki pamięciowe · zapamiętywanie PIN',
  '6 lekcji · metoda słów-kluczy · ponad 100 angielskich słówek w locie',
  '6 lekcji · żywioły talii · metoda PAO · zapamiętywanie rozdań',
  '6 lekcji · efekt domina · cały łańcuch 20 ogniw bez kartki',
  '6 lekcji · algorytm Doomsday · kotwice miesięcy · dni tygodnia w pamięci',
  '6 lekcji · haczyki pierwszych liter · całe listy wiedzy w jednym zdaniu',
  '10 lekcji · promieniście od centrum · nielinearne notatki i gałęzie wiedzy'
];

trainSubtitles.forEach(sub => checkText('trainSubtitle', sub));

console.log(`========================================`);
console.log(`TOTAL UNTRANSLATED ITEMS FOUND: ${findings.length}`);
console.log(`========================================`);

const uniqueFindings = [];
const seen = new Set();
for (const f of findings) {
  if (!seen.has(f.pl)) {
    seen.add(f.pl);
    uniqueFindings.push(f);
  }
}

console.log(`UNIQUE UNTRANSLATED STRINGS: ${uniqueFindings.length}`);
uniqueFindings.slice(0, 30).forEach((f, i) => {
  console.log(`${i + 1}. [${f.context}]`);
  console.log(`   PL: ${f.pl.length > 80 ? f.pl.slice(0, 80) + '...' : f.pl}`);
  console.log(`   EN (failed): ${f.en.length > 80 ? f.en.slice(0, 80) + '...' : f.en}`);
});

fs.writeFileSync(path.join(__dirname, 'walkthrough_untranslated.json'), JSON.stringify(uniqueFindings, null, 2), 'utf8');
