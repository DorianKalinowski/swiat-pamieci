import { PHONETIC_MAP, PEG_WORDS_2DIGIT } from './codes.js';

export const LESSONS = [
  {
    id: 'major-1',
    title: 'Cyfry 0 i 1 (S/Z oraz T/D)',
    subtitle: 'Pierwsze litery alfabetu pamięci',
    desc: 'Poznaj sekret, dzięki któremu mistrzowie świata zapamiętują tysiące cyfr.',
    speech: 'Uhuhu! Cześć! Jestem Sówka 🦉 Zastanawiasz się, po co uczyć się tej techniki? Pokażę Ci sekretny kod, dzięki któremu łatwo zapamiętasz numer PIN, PESEL czy ważne daty w szkole – bez nudnego wkuwania!',
    theory: [
      'Po co nam ta technika? Nasz mózg gubi się w suchych, nudnych cyfrach, ale uwielbia słowa i kolorowe obrazy!',
      'System Major zamienia cyfry na dźwięki spółgłosek. Dzięki temu z dowolnego numeru ułożysz śmieszne słowo, które od razu zapamiętasz!',
      'Poznajmy dwie pierwsze cyfry kodu:',
      '• 0 = S oraz Z – słowo „Zero” zaczyna się na literę Z, a zero syczy cichutko jak wąż: sss!',
      '• 1 = T oraz D – spójrz na literę T oraz D: obie mają JEDNĄ prostą pionową kreskę, dokładnie jak cyfra 1!',
      'To bardzo proste! Zobacz: słowo „KOT” ma T na końcu (1), a słowo „SOS” ma S (0).'
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
    speech: 'Świetnie Ci poszło! Zobacz, cyfry 2 i 3 mają swoje ukryte nóżki – dzieci i dorośli zapamiętują je w sekundę!',
    theory: [
      'Kolejne dwie cyfry to najprostsza zabawa w skojarzenia kształtów:',
      '• 2 = N – małe „n” ma DWA brzuszki / dwie nóżki stojące na ziemi.',
      '• 3 = M – małe „m” ma TRZY nóżki (raz, dwa, trzy!).',
      'To najprostsza zasada wizualna w całym systemie!',
      'Gdy w numerze telefonu lub dacie widzisz 2 → myślisz o N (np. Nos, Nóż).',
      'Gdy widzisz 3 → myślisz o M (np. Mysz, Młot).'
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
    speech: 'Uhuhu! Pora na cyfry 4 i 5. Wsłuchaj się w dźwięki i spójrz na dłoń!',
    theory: [
      'Dlaczego 4 to R, a 5 to L? To sprytne skojarzenia:',
      '• 4 = R – powiedz głośno słowo „czteRy” – słyszysz to mocne, dźwięczne R na końcu?',
      '• 5 = L – spójrz na dłoń: kciuk i palec wskazujący tworzą kształt litery L, a cała dłoń ma 5 palców! (Rzymskie L to też 50).',
      'Przykłady ze świata: 4 to Rura lub Ryba, a 5 to Liść lub Lama.'
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
    speech: 'Jesteśmy już w połowie drogi! Szeleszcząca szóstka i kanciaste K czekają na Ciebie!',
    theory: [
      'Poznajemy szóstkę i siódemkę:',
      '• 6 = J, SZ, CZ – powiedz „Sześć” – to najbardziej szeleszcząca cyfra w języku polskim! (A litera J to 6. spółgłoska alfabetu).',
      '• 7 = K, G – wyobraź sobie dwie cyfry 7 przytknięte do siebie plecami – tworzą ostre ramiona litery K!',
      'Z tych literek powstaną fantastyczne słowa: 6 to Jeż lub Szal, a 7 to Koc, Kot lub Kura.'
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
    speech: 'Ostatni krok alfabetu! Dwie pętelki i obrócona dziewiątka – i cały kod 0-9 masz w małym palcu!',
    theory: [
      'Domykamy cały alfabet cyfr:',
      '• 8 = F, W – pisana mała literka „f” ma dwie pętelki na górze i na dole, dokładnie jak cyfra 8.',
      '• 9 = P, B – cyfra 9 w lustrze wygląda jak litera P, a gdy obróci się ją do góry nogami – jak małe b!',
      'Gratulacje! Znasz już całe 0 do 9:',
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
    speech: 'Teraz dzieje się magia! Użyjemy samogłosek jak plasteliny do lepienia całych słów!',
    theory: [
      'Po co nam samogłoski (A, E, I, O, U, Y)?',
      'W systemie Major samogłoski NIE MAJĄ żadnej cyfry – są jak darmowy klej albo plastelina!',
      'Dzięki temu możesz wstawić DOWOLNE samogłoski między spółgłoski, by utworzyć sensowne, barwne słowo!',
      'Spójrz na liczbę 71:',
      '• 7 = K, 1 = T.',
      '• Wkładasz samogłoskę „O” w środek → powstaje puszysty KOT!',
      '• Albo dodajesz „A” → KAT! Albo „I” → KIT!'
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
    speech: 'Uhuhu! Popatrz, jak liczby zamieniają się w trójwymiarowe zabawki w Twojej głowie!',
    theory: [
      'Zamiast pamiętać nudne liczby, pamiętasz wyraziste obrazy (kołki pamięciowe):',
      '• 14 = T(1) + R(4) = kolejowy TOR 🚂',
      '• 47 = R(4) + K(7) = szczypiący RAK 🦞',
      '• 71 = K(7) + T(1) = puszysty KOT 🐱',
      '• 91 = B(9) + T(1) = skórzany BUT 👞',
      'Gdy widzisz obraz przed oczami → od razu wiesz, jaka to liczba!'
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
    speech: 'Pora na wielki finał! Zobacz, jak w 3 sekundy zapamiętasz 4-cyfrowy PIN do bankomatu lub telefonu na zawsze!',
    theory: [
      'Twój nowy kod PIN do telefonu lub karty to: 7114.',
      'Dzielimy go na dwa 2-cyfrowe kołki:',
      '• 71 = KOT 🐱 (K=7, T=1)',
      '• 14 = TOR kolejowy 🚂 (T=1, R=4)',
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
