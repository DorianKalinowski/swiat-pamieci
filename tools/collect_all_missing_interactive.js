const fs = require('fs');
const path = require('path');

const mMenu = JSON.parse(fs.readFileSync(path.join(__dirname, 'missing_menu_strings.json'), 'utf8'));
const mTrain = JSON.parse(fs.readFileSync(path.join(__dirname, 'missing_train_strings.json'), 'utf8'));
const mFree = JSON.parse(fs.readFileSync(path.join(__dirname, 'missing_free_strings.json'), 'utf8'));

const allRaw = [];
[...mMenu, ...mTrain, ...mFree].forEach(item => {
  allRaw.push(item.raw);
});

const unique = Array.from(new Set(allRaw));
console.log('Total unique interactive strings missing:', unique.length);

fs.writeFileSync(path.join(__dirname, 'all_missing_interactive.json'), JSON.stringify(unique, null, 2), 'utf8');
