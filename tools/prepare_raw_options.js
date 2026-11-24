const fs = require('fs');
const path = require('path');

const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_theories_and_options_to_translate.json'), 'utf8'));

console.log('Writing options mapping template...');
const optionsMap = {};
for (const opt of d.options) {
  optionsMap[opt] = ''; // to be filled
}

fs.writeFileSync(path.join(__dirname, 'raw_options.json'), JSON.stringify(optionsMap, null, 2), 'utf8');
console.log('Created raw_options.json with', Object.keys(optionsMap).length, 'keys.');
