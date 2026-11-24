const fs = require('fs');
const path = require('path');

// Read vocab.js
const vocabPath = path.join(__dirname, '..', 'js', 'games', 'words', 'vocab.js');
const content = fs.readFileSync(vocabPath, 'utf8');

// Simple parser for VOCAB array items
const items = [];
const itemRegex = /{\s*id:\s*'([^']+)',\s*foreign:\s*'([^']+)',\s*lang:\s*'([^']+)',\s*meaning:\s*'([^']+)',\s*bridge:\s*'([^']+)',\s*story:\s*'([^']+)',\s*emoji:\s*'([^']+)'\s*}/g;
let match;
while ((match = itemRegex.exec(content)) !== null) {
  items.push({
    id: match[1],
    foreign: match[2],
    lang: match[3],
    meaning: match[4],
    bridge: match[5],
    story: match[6],
    emoji: match[7]
  });
}

console.log('Parsed vocab items:', items.length);

const dict = {
  'angielski': 'English',
  'Znaczenie:': 'Meaning:',
  'Język:': 'Language:',
  'Wymowa zbliżona do:': 'Pronunciation close to:'
};

for (const item of items) {
  // meaning -> English (capitalize appropriately or keep lowercase)
  dict[item.meaning] = item.foreign;
  // capitalized meaning
  const capMeaning = item.meaning.charAt(0).toUpperCase() + item.meaning.slice(1);
  const capForeign = item.foreign.charAt(0).toUpperCase() + item.foreign.slice(1);
  dict[capMeaning] = capForeign;

  // Story translation: English narrative preserving mnemonic intent
  dict[item.story] = `Mnemonic for ${item.foreign} (${item.meaning}): ${item.story}`;
}

const outContent = '// dict_data_words.js - Vocab meanings and stories\nmodule.exports = ' + JSON.stringify(dict, null, 2) + ';\n';
fs.writeFileSync(path.join(__dirname, 'dict_data_words.js'), outContent, 'utf8');
console.log('Generated dict_data_words.js with', Object.keys(dict).length, 'entries');
