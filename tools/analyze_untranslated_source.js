const fs = require('fs');
const path = require('path');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'untranslated_source_strings.json'), 'utf8'));

// Group by file
const byFile = {};
for (const item of list) {
  if (!byFile[item.file]) byFile[item.file] = [];
  byFile[item.file].push(item.raw);
}

for (const [f, strings] of Object.entries(byFile)) {
  const unique = Array.from(new Set(strings));
  console.log(`\nFile: ${f} (${unique.length} untranslated strings)`);
  unique.slice(0, 10).forEach(s => console.log('  -', s.length > 70 ? s.slice(0, 70) + '...' : s));
}
