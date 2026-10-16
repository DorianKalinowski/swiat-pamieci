export const PHONETIC_MAP = [
  { digit: 0, sounds: 'S, Z', rule: 'Zero zaczyna się na Z, syczący dźwięk', pegs: ['SOS', 'Ser', 'Ząb', 'Waza'] },
  { digit: 1, sounds: 'T, D', rule: 'Litera T i D mają jedną pionową kreskę (jak 1)', pegs: ['Troll', 'Dom', 'Dach', 'Kot'] },
  { digit: 2, sounds: 'N', rule: 'Małe „n” ma dwie nóżki', pegs: ['Nóż', 'Nos', 'Noc', 'Koń'] },
  { digit: 3, sounds: 'M', rule: 'Małe „m” ma trzy nóżki', pegs: ['Mysz', 'Miecz', 'Mama', 'Młot'] },
  { digit: 4, sounds: 'R', rule: 'Słowo czteRy ma dominujące R', pegs: ['Rura', 'Rak', 'Rower', 'Ryba'] },
  { digit: 5, sounds: 'L', rule: 'Rzymskie L to 50; dłoń z 5 palcami tworzy kąt L', pegs: ['Liść', 'Lama', 'Las', 'Lupa'] },
  { digit: 6, sounds: 'J, SZ, CZ', rule: 'Szóstka brzmi jak „sz”, jota jest 6. spółgłoską', pegs: ['Jajko', 'Jeż', 'Szal', 'Czajnik'] },
  { digit: 7, sounds: 'K, G', rule: 'Dwie cyfry 7 połączone brzuszkami tworzą literę K', pegs: ['Koc', 'Kura', 'Kot', 'Gitara'] },
  { digit: 8, sounds: 'F, W', rule: 'Pisana mała litera f ma dwie pętelki jak ósemka', pegs: ['Fala', 'Wino', 'Waga', 'Foka'] },
  { digit: 9, sounds: 'P, B', rule: 'Lustrzane odbicie 9 to P, odwrócona 9 to b', pegs: ['Pies', 'But', 'Balon', 'Bomba'] }
];

export const PEG_WORDS_2DIGIT = [
  { num: '10', word: 'TOS', code: 'T(1) + S(0)', img: 'Toster', hint: 'T(1) + S(0)' },
  { num: '14', word: 'TOR', code: 'T(1) + R(4)', img: 'Tor kolejowy', hint: 'T(1) + R(4)' },
  { num: '20', word: 'NOS', code: 'N(2) + S(0)', img: 'Nos klauna', hint: 'N(2) + S(0)' },
  { num: '25', word: 'NIL', code: 'N(2) + L(5)', img: 'Rzeka Nil', hint: 'N(2) + L(5)' },
  { num: '31', word: 'Młot', code: 'M(3) + T(1)', img: 'Ciężki młot', hint: 'M(3) + T(1)' },
  { num: '40', word: 'Róża', code: 'R(4) + Z(0)', img: 'Czerwona róża', hint: 'R(4) + Z(0)' },
  { num: '47', word: 'RAK', code: 'R(4) + K(7)', img: 'Szczypiący rak', hint: 'R(4) + K(7)' },
  { num: '52', word: 'LIN', code: 'L(5) + N(2)', img: 'Gruba lina', hint: 'L(5) + N(2)' },
  { num: '71', word: 'KOT', code: 'K(7) + T(1)', img: 'Czarny kot', hint: 'K(7) + T(1)' },
  { num: '85', word: 'FALA', code: 'F(8) + L(5)', img: 'Morska fala', hint: 'F(8) + L(5)' },
  { num: '91', word: 'BUT', code: 'B(9) + T(1)', img: 'Skórzany but', hint: 'B(9) + T(1)' },
  { num: '94', word: 'BAR', code: 'B(9) + R(4)', img: 'Neonowy bar', hint: 'B(9) + R(4)' }
];
