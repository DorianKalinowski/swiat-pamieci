const path = require('path');
const i18n = require('../js/i18n.js');

const tests = [
  'Nigdy więcej "znam tę twarz, ale jak on miał na imię?". Opanuj technikę kotwic i mostów fonetycznych.',
  'Mamy opanowane 2 z 6 lekcji. Dokończmy szkolenie! 🦊',
  '🦊 SZKOLENIE Z LISKIEM BYSTRZAKIEM',
  '🦊 Szkolenie z Liskiem Bystrzakiem',
  '6 interaktywnych lekcji · kotwice cech · mosty fonetyczne',
  '⭐ 6/18 gwiazdek',
  'Kto to jest?',
  'Znajdź osobę',
  'Szybkie skojarzenie',
  'Maraton twarzy',
  'rekord',
  'brak',
  'Zobacz mapę lekcji →'
];

for (const t of tests) {
  console.log(`[PL] "${t}" -> [EN] "${i18n.translateEn(t)}"`);
}
