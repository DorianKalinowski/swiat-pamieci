const fs = require('fs');
const path = require('path');
const i18n = require('../js/i18n.js');

const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'walkthrough_untranslated.json'), 'utf8'));

const polishCharRegex = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;

const stillFailing = [];
for (const item of list) {
  const trans = i18n.translateEn(item.pl);
  if (polishCharRegex.test(trans)) {
    stillFailing.push({
      context: item.context,
      pl: item.pl,
      en: trans
    });
  }
}

console.log('Still failing count:', stillFailing.length);
fs.writeFileSync(path.join(__dirname, 'still_failing_92.json'), JSON.stringify(stillFailing, null, 2), 'utf8');
