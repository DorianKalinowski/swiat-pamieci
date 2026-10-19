import { MONTH_ANCHORS, DAYS_OF_WEEK } from './logic.js';

export const LESSONS = [
  {
    id: 'cal-1',
    title: 'Sekret kalendarza w głowie',
    subtitle: 'Dni tygodnia to liczby 0 do 6',
    desc: 'Odkryj tajemnicę geniusza Johna Conwaya – kalendarz w pamięci.',
    speech: 'Cześć! Jestem Żółwik Zenon 🐢. Nigdy się nie spieszę, bo znam sekret czasu! Czy wiesz, że możesz w 2 sekundy odgadnąć, w jaki dzień tygodnia wypadną Twoje urodziny, Boże Narodzenie czy początek wakacji? Pokażę Ci tę niezwykłą sztuczkę!',
    theory: [
      'Po co nam ta technika? Wyobraź sobie miny znajomych w szkole lub w pracy, gdy ktoś rzuci datę, a Ty po 2 sekundach w pamięci odpowiesz: „To będzie sobota!”. Poczujesz się jak chodzący ludzki kalkulator!',
      'Tydzień ma 7 dni i kręci się w kółko jak karuzela. Ponumerujmy dni tygodnia od 0 do 6:',
      '• 1 = Poniedziałek 🌙 | 2 = Wtorek 🔥 | 3 = Środa 💧 | 4 = Czwartek ⚡ | 5 = Piątek 🎉 | 6 = Sobota 🪐',
      '• 0 = Niedziela ☀️ (dzień relaksu i odpoczynku, okrągłe zero pracy!)',
      'W roku 2026 dniem kotwicznym (magiczną bazą) jest SOBOTA (6). Zapamiętajmy tę liczbę!'
    ],
    task: {
      prompt: 'Jaki dzień tygodnia odpowiada liczbie 5 w systemie kalendarzowym?',
      options: ['Piątek (5. dzień)', 'Poniedziałek (1)', 'Niedziela (0)', 'Środa (3)'],
      correct: 0,
      hint: 'Poniedziałek to 1, Wtorek 2, Środa 3, Czwartek 4, Piątek to 5!'
    }
  },
  {
    id: 'cal-2',
    title: 'Bliźniacze daty parzyste',
    subtitle: '4.04, 6.06, 8.08, 10.10, 12.12',
    desc: 'Wszystkie parzyste miesiące mają kotwicę w dniu równym numerowi miesiąca!',
    speech: 'Oto najłatwiejsza reguła na świecie: daty parzyste to lustrzane bliźniaki!',
    theory: [
      'Spójrz, jak genialnie zbudowany jest kalendarz:',
      'W każdym parzystym miesiącu numer miesiąca to dokładnie ten sam dzień kotwiczny:',
      '• 4 kwietnia (4.04)',
      '• 6 czerwca (6.06)',
      '• 8 sierpnia (8.08)',
      '• 10 października (10.10)',
      '• 12 grudnia (12.12)',
      'W roku 2026 każda z tych 5 dat to dokładnie ten sam dzień: SOBOTA!'
    ],
    task: {
      prompt: 'Która data jest kotwicą Doomsday dla sierpnia (8. miesiąc)?',
      options: ['8 sierpnia (8.08)', '1 sierpnia', '15 sierpnia', '31 sierpnia'],
      correct: 0,
      hint: 'Miesiąc parzysty: numer miesiąca = numer dnia (8.08)!'
    }
  },
  {
    id: 'cal-3',
    title: 'Miesiące nieparzyste',
    subtitle: 'Praca 9 do 5 na stacji 7/11',
    desc: 'Jak zapamiętać kotwice dla maja, lipca, września i listopada?',
    speech: 'A co z miesiącami nieparzystymi? Mamy na nie wesołą rymowankę o stacji benzynowej!',
    theory: [
      'Dla miesięcy nieparzystych mamy łatwe powiedzonko:',
      '„Pracuję od 9 do 5 na stacji 7/11”:',
      '• 9 maja (9.05) oraz 5 września (5.09) → zamieniamy 9 i 5!',
      '• 11 lipca (11.07) oraz 7 listopada (7.11) → zamieniamy 7 i 11!',
      'Te 4 daty to w 2026 roku również ta sama nasza kotwica: SOBOTA!'
    ],
    task: {
      prompt: 'Jaki dzień maja (5. miesiąc) jest kotwicą w regule „od 9 do 5”?',
      options: ['9 maja (9.05)', '1 maja', '15 maja', '31 maja'],
      correct: 0,
      hint: 'Od 9 do 5: 9. dzień 5. miesiąca = 9 maja!'
    }
  },
  {
    id: 'cal-4',
    title: 'Obliczanie daty w 3 krokach',
    subtitle: 'Przykład: 15 sierpnia 2026',
    desc: 'Jak policzyć dzień tygodnia dla dowolnego dnia w miesiącu?',
    speech: 'Teraz połączymy kropki! Zobacz, jak w 3 prostych krokach policzyć dowolną datę!',
    theory: [
      'Chcesz wiedzieć, jaki dzień tygodnia to np. 15 sierpnia 2026:',
      '1. Znasz kotwicę sierpnia: to bliźniak 8 sierpnia (8.08).',
      '2. Wiesz, że w 2026 roku kotwica to SOBOTA (6).',
      '3. Liczymy różnicę dni: 15 - 8 = 7 dni. Pełne 7 dni to dokładnie tydzień, więc 15 sierpnia to również SOBOTA!',
      'Gdyby to był 17 sierpnia? 8 sierpnia + 9 dni (czyli tydzień + 2 dni): sobota + 2 dni = poniedziałek!'
    ],
    task: {
      prompt: 'Jeśli 8 sierpnia to Sobota, jaki dzień tygodnia to 10 sierpnia (8 + 2 dni)?',
      options: ['Poniedziałek (Sobota + 2 dni)', 'Niedziela', 'Wtorek', 'Czwartek'],
      correct: 0,
      hint: 'Sobota + 1 dzień = Niedziela; Sobota + 2 dni = Poniedziałek!'
    }
  },
  {
    id: 'cal-5',
    title: 'Marzec i Dzień Liczby Pi',
    subtitle: '14 marca oraz luty',
    desc: 'Ostatnie elementy układanki.',
    speech: 'Marzec i luty! Poznaj dzień liczby Pi oraz ostatni dzień zimy!',
    theory: [
      'Dwa ostatnie miesiące do kompletu:',
      '• Marzec (3. miesiąc): kotwicą jest 14 marca (3.14 to słynny Dzień Liczby Pi!).',
      '• Luty: kotwicą jest ZAWSZE OSTATNI DZIEŃ LUTEGO (28 lutego, a w przestępnym 29 lutego).',
      'Teraz znasz magiczną kotwicę dla każdego miesiąca w całym roku kalendarzowym!'
    ],
    task: {
      prompt: 'Który dzień marca jest kotwicą Doomsday (związaną z liczbą Pi 3.14)?',
      options: ['14 marca', '1 marca', '21 marca', '31 marca'],
      correct: 0,
      hint: 'Liczba Pi to 3,14 → 14 marca!'
    }
  },
  {
    id: 'cal-6',
    title: 'Egzamin Żółwika Zegarowego',
    subtitle: 'Certyfikat mistrza kalendarza',
    desc: 'Żółwik zadaje finałowe pytanie! Wykorzystaj kotwice i modulo 7.',
    speech: 'Wielki finał u Żółwika Zenona! Znasz już tajemnicę wiecznego kalendarza w głowie!',
    theory: [
      'Brawo! Opanowałeś legendarny algorytm kalendarzowy Johna Conwaya:',
      '• Parzyste: 4.04, 6.06, 8.08, 10.10, 12.12.',
      '• Nieparzyste: 9.05, 5.09, 11.07, 7.11.',
      '• Marzec: 14.03 (Dzień Pi).',
      '• Luty: 28.02.',
      'Nawet najszybszy komputer nie zrobi tego z takim wdziękiem i spokojem jak Ty! 🐢'
    ],
    task: {
      prompt: 'Jaki dzień tygodnia to 12 grudnia 2026 roku (pamiętając, że kotwica 2026 to Sobota)?',
      options: ['Sobota (bo 12.12 to bezpośrednia kotwica Doomsday!)', 'Niedziela', 'Piątek', 'Środa'],
      correct: 0,
      hint: '12.12 to parzysty bliźniak – dokładnie dzień kotwicy (Sobota)!'
    }
  }
];
