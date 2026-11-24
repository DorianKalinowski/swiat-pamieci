const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const gamesDir = path.join(rootDir, 'js', 'games');

const data = {
  theories: [],
  options: []
};

for (const g of fs.readdirSync(gamesDir)) {
  const lesP = path.join(gamesDir, g, 'lessons.js');
  if (fs.existsSync(lesP)) {
    const c = fs.readFileSync(lesP, 'utf8');

    // theories
    const thMatches = c.match(/theory:\s*\[([\s\S]*?)\]\s*,\s*(?:diagram|task)/g) || [];
    for (const tm of thMatches) {
      const pMatches = tm.match(/['"`]([\s\S]*?)['"`]\s*(?:,|$)/g) || [];
      for (const pm of pMatches) {
        const clean = pm.replace(/^['"`]/, '').replace(/['"`]\s*,?$/, '').replace(/\\'/g, "'").replace(/\\"/g, '"').trim();
        if (clean && !data.theories.includes(clean)) data.theories.push(clean);
      }
    }

    // options
    const optMatches = c.match(/options:\s*\[([\s\S]*?)\]/g) || [];
    for (const om of optMatches) {
      const opts = om.match(/['"]([^'"]+)['"]/g) || [];
      for (const o of opts) {
        const clean = o.slice(1, -1).trim();
        if (clean && !data.options.includes(clean)) data.options.push(clean);
      }
    }
  }
}

// Add digits and palace intros
const digitsP = path.join(gamesDir, 'digits', 'lessons.js');
const palaceP = path.join(gamesDir, 'palace', 'lessons.js');
const acrosticP = path.join(gamesDir, 'acrostic', 'lessons.js');

function extractArr(filePath, key) {
  const c = fs.readFileSync(filePath, 'utf8');
  const re = new RegExp(key + ':\\s*\\[([\\s\\S]*?)\\]', 'g');
  const res = [];
  let m;
  while ((m = re.exec(c)) !== null) {
    const lines = m[1].match(/'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"/g) || [];
    for (const l of lines) {
      const clean = l.slice(1, -1).trim();
      if (clean && !res.includes(clean)) res.push(clean);
    }
  }
  return res;
}

const digitsIntros = extractArr(digitsP, 'intro');
const palaceIntros = extractArr(palaceP, 'intro');
const acrosticTheories = extractArr(acrosticP, 'theory');

for (const t of digitsIntros) if (!data.theories.includes(t)) data.theories.push(t);
for (const t of palaceIntros) if (!data.theories.includes(t)) data.theories.push(t);
for (const t of acrosticTheories) if (!data.theories.includes(t)) data.theories.push(t);

fs.writeFileSync(path.join(__dirname, 'all_theories_and_options_to_translate.json'), JSON.stringify(data, null, 2), 'utf8');
console.log('Total theories & intros:', data.theories.length);
console.log('Total options:', data.options.length);
