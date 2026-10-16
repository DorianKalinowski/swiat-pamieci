import { PHONETIC_MAP, PEG_WORDS_2DIGIT } from './codes.js';

export const LESSONS = [
  {
    id: 'major-1',
    title: 'Cyfry 0 i 1 (S/Z oraz T/D)',
    subtitle: 'Pierwsze litery alfabetu pamięci',
    desc: 'Poznaj sekret, dzięki któremu mistrzowie świata zapamiętują tysiące cyfr.',
    theory: [
      'System Major zamienia cyfry na spółgłoski, a samogłoski służą jako klej do tworzenia słów.',
      '• 0 = S, Z (Zero zaczyna się na Z, syczący dźwięk).',
      '• 1 = T, D (Litera T oraz D mają JEDNĄ pionową kreskę, dokładnie jak cyfra 1).',
      'Przykład: Słowo „KOT” – ma T na końcu (1). Słowo „SOS” ma S (0).'
    ],
    task: {
      prompt: 'Która spółgłoska odpowiada cyfrze 1 w systemie Major?',
      options: ['T oraz D (jedna pionowa kreska)', 'M (trzy nóżki)', 'R (cztery)', 'F oraz W'],
      correct: 0,
      hint: 'Pomyśl o jednej pionowej kresce w literach T i D!'
    }
  },
  {
    id: 'major-2',
    title: 'Cyfry 2 i 3 (N oraz M)',
    subtitle: 'Nóżki liter',
    desc: 'Spójrz na litery N i M – ich kształt mówi sam za siebie!',
    theory: [
      '• 2 = N (małe „n” ma DWA brzuszki / dwie nóżki opierające się o linię).',
      '• 3 = M (małe „m” ma TRZY nóżki).',
      'To najprostsza zasada wizualna w całym systemie!',
      'Gdy widzisz 2 → myślisz N (np. Nos, Nóż).',
      'Gdy widzisz 3 → myślisz M (np. Mysz, Młot).'
    ],
    task: {
      prompt: 'Dlaczego cyfrze 3 przypisana jest litera M?',
      options: ['Ponieważ litera „m” ma 3 nóżki', 'Bo 3 to magiczna liczba', 'Bo M to pierwsza litera słowa Major', 'Przez przypadek'],
      correct: 0,
      hint: 'Policz nóżki w literze m: raz, dwa, trzy!'
    }
  },
  {
    id: 'major-3',
    title: 'Cyfry 4 i 5 (R oraz L)',
    subtitle: 'CzteRy oraz rzymskie L',
    desc: 'Jak zapamiętać 4 i 5 bez wysiłku?',
    theory: [
      '• 4 = R (Słowo „czteRy” ma bardzo wyraźne, dźwięczne R na końcu).',
      '• 5 = L (Rzymska liczba L oznacza 50; dłoń z rozpostartym kciukiem i palcem wskazującym tworzy literę L i ma 5 palców).',
      'Przykład: 4 to Rura lub Ryba, 5 to Liść lub Lama.'
    ],
    task: {
      prompt: 'Jaki dźwięk odpowiada cyfrze 4?',
      options: ['R (z dominującego R w słowie „czteRy”)', 'K i G', 'S i Z', 'P i B'],
      correct: 0,
      hint: 'Wsłuchaj się w słowo „czteRy”!'
    }
  },
  {
    id: 'major-4',
    title: 'Cyfry 6 i 7 (J/SZ/CZ oraz K/G)',
    subtitle: 'Szóstka i kanciaste K',
    desc: 'Połowa alfabetu za nami! Poznaj szeleszczące dźwięki i siódemkę.',
    theory: [
      '• 6 = J, SZ, CZ (Sześć brzmi szeleszcząco, litera J to 6. spółgłoska alfabetu).',
      '• 7 = K, G (Wyobraź sobie dwie siódemki 7 odwrócone do siebie – tworzą ramiona litery K).',
      'Przykłady: 6 = Jeż, Szal. 7 = Koc, Kot, Kura.'
    ],
    task: {
      prompt: 'Która para spółgłosek odpowiada cyfrze 7?',
      options: ['K oraz G', 'F oraz W', 'T oraz D', 'N oraz M'],
      correct: 0,
      hint: 'Dwie siódemki tworzą literę K!'
    }
  },
  {
    id: 'major-5',
    title: 'Cyfry 8 i 9 (F/W oraz P/B)',
    subtitle: 'Pętelki i lustrzane odbicia',
    desc: 'Ostatnie dwie cyfry domykające alfabet Majora.',
    theory: [
      '• 8 = F, W (Pisane małe „f” ma dwie pętelki, dokładnie jak cyfra 8).',
      '• 9 = P, B (Cyfra 9 w lustrze to litera P; a obrócona do góry nogami to małe b).',
      'Gratulacje! Znasz już całe 0-9:',
      '0: S/Z | 1: T/D | 2: N | 3: M | 4: R | 5: L | 6: J/SZ | 7: K/G | 8: F/W | 9: P/B.'
    ],
    task: {
      prompt: 'Dlaczego cyfra 9 to P oraz B?',
      options: ['Bo lustrzane odbicie 9 to P, a obrócona to b', 'Bo 9 to ostatnia cyfra', 'Bo pies ma 9 żyć', 'Bo brzmi jak B'],
      correct: 0,
      hint: 'Obróć cyfrę 9 w wyobraźni!'
    }
  },
  {
    id: 'major-6',
    title: 'Samogłoski jako klej',
    subtitle: 'Budowanie słów z samogłosek A, E, I, O, U, Y',
    desc: 'Samogłoski NIE MAJĄ wartości liczbowej. Służą tylko do lepienia słów!',
    theory: [
      'W systemie Major litery A, E, I, O, U, Y oraz H nie oznaczają żadnej cyfry.',
      'Dzięki temu możesz wstawić DOWOLNE samogłoski między spółgłoski, by utworzyć sensowne słowo!',
      'Spójrz na liczbę 71:',
      '• 7 = K, 1 = T.',
      '• Dodajemy samogłoskę „O” w środek → powstaje KOT!',
      '• Albo dodajemy „A” → KAT! Albo „I” → KIT!'
    ],
    task: {
      prompt: 'Jaką liczbę koduje słowo „NOS” (N=2, S=0)?',
      options: ['20', '31', '71', '40'],
      correct: 0,
      hint: 'N to 2 nóżki, O to klej, S to zero (20)!'
    }
  },
  {
    id: 'major-7',
    title: '2-cyfrowe obrazy (kołki pamięciowe)',
    subtitle: 'TOR, RAK, FALA, BUT',
    desc: 'Przekształcaj pary liczb w konkretne, trójwymiarowe przedmioty.',
    theory: [
      'Zamiast pamiętać nudne liczby, pamiętasz obrazy:',
      '• 14 = T(1) + R(4) = TOR kolejowy 🚂',
      '• 47 = R(4) + K(7) = RAK ze szczypcami 🦞',
      '• 71 = K(7) + T(1) = KOT 🐱',
      '• 91 = B(9) + T(1) = skórzany BUT 👞',
      'Widzisz obraz → od razu wiesz, jaka to liczba!'
    ],
    task: {
      prompt: 'Które słowo poprawnie koduje liczbę 14 (1=T, 4=R)?',
      options: ['TOR', 'NOS', 'RAK', 'DOM'],
      correct: 0,
      hint: '1 to T, 4 to R → T + O + R = TOR!'
    }
  },
  {
    id: 'major-8',
    title: 'Egzamin Profesora: Kod PIN',
    subtitle: 'Praktyczne zapamiętanie 4-cyfrowego kodu',
    desc: 'Wykorzystaj 2 obrazy, aby zapamiętać PIN 71-14 na zawsze.',
    theory: [
      'Twój nowy kod do sejfu to: 7114.',
      'Dzielimy go na dwa 2-cyfrowe kołki:',
      '• 71 = KOT 🐱',
      '• 14 = TOR kolejowy 🚂',
      'Łączymy je w żywą scenę: Gigantyczny KOT leży na TORACH i łapą zatrzymuje pociąg!',
      'Gdy stoisz przed bankomatem, widzisz Kota na Torach: Kot(71) + Tor(14) = 7114!'
    ],
    task: {
      prompt: 'Jaki PIN ukryty jest w historii o KOCIE (71) na TORACH (14)?',
      options: ['7114', '1471', '2047', '9125'],
      correct: 0,
      hint: 'Kot to 71, Tor to 14 → 7114!'
    }
  }
];
