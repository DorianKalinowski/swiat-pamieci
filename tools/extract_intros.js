const fs = require('fs');

const digits = fs.readFileSync('js/games/digits/lessons.js', 'utf8');
const palace = fs.readFileSync('js/games/palace/lessons.js', 'utf8');
const acrostic = fs.readFileSync('js/games/acrostic/lessons.js', 'utf8');

function extractArray(c, key) {
  const re = new RegExp(key + ':\\s*\\[([\\s\\S]*?)\\]', 'g');
  const res = [];
  let m;
  while ((m = re.exec(c)) !== null) {
    const lines = m[1].match(/'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"/g) || [];
    for (const l of lines) res.push(l.slice(1, -1));
  }
  return res;
}

console.log('digits intros:', extractArray(digits, 'intro').length);
console.log('palace intros:', extractArray(palace, 'intro').length);
console.log('acrostic theories:', extractArray(acrostic, 'theory').length);
