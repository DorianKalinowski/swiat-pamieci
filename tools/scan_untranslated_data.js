const fs = require('fs');
const path = require('path');

(async () => {
  const i18n = await import('../js/i18n.js');
  i18n.setLang('en');
  const t = i18n.t;

  const polishRe = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
  const checkFiles = [
    'js/games/mindmap/lessons.js',
    'js/games/mindmap/mindmaps.js',
    'js/games/acrostic/lessons.js',
    'js/games/acrostic/acrostics.js',
    'js/games/palace/rooms.js',
    'js/games/palace/lessons.js',
    'js/games/digits/lessons.js',
    'js/games/digits/present.js',
    'js/games/calendar/logic.js',
    'js/games/cards/deck.js',
    'js/games/link/chains.js',
    'js/games/major/codes.js',
    'js/games/names/faces.js',
    'js/games/words/vocab.js',
    'js/cat.js',
    'js/tiger.js',
    'js/fox.js',
    'js/owl.js',
    'js/parrot.js',
    'js/raccoon.js',
    'js/squirrel.js',
    'js/turtle.js',
    'js/dog.js',
    'js/octopus.js'
  ];

  const missing = new Map();
  for (const rel of checkFiles) {
    const full = path.join(__dirname, '..', rel);
    const code = fs.readFileSync(full, 'utf8');
    // Match single-quoted or double-quoted strings (skipping comments)
    const cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const re = /(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g;
    let m;
    while ((m = re.exec(cleanCode))) {
      const val = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n');
      if (!val || val.length < 2) continue;
      if (polishRe.test(val) || /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(\s+[a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ]+){1,}$/.test(val)) {
        const res = t(val);
        if (res === val || polishRe.test(res)) {
          if (!missing.has(val)) missing.set(val, []);
          missing.get(val).push(rel);
        }
      }
    }
  }

  console.log('Total missing/Polish-char data strings across all data/mascot files:', missing.size);
  const out = [...missing.entries()].map(([str, files]) => ({ str, files: [...new Set(files)] }));
  fs.writeFileSync(path.join(__dirname, 'missing_data_strings.json'), JSON.stringify(out, null, 2), 'utf8');
  out.slice(0, 60).forEach((x, i) => console.log(`${i + 1}. [${x.files[0]}] ${x.str}`));
})();
