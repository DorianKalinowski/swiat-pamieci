import { MONTH_ANCHORS, DAYS_OF_WEEK } from './logic.js';

export const LESSONS = [
  {
    id: 'cal-1',
    title: 'Sekret kalendarza w głowie',
    subtitle: 'Dni tygodnia to liczby modulo 7',
    desc: 'Odkryj matematyczną tajemnicę geniusza Johna Conwaya – algorytm Doomsday.',
    theory: [
      'Każdy tydzień ma 7 dni. Zamiast zapamiętywać 365 dat, wystarczy liczyć reszty z dzielenia przez 7 (modulo 7).',
      'Przypisujemy liczbom dni tygodnia:',
      '• 0 = Niedziela (Non-day) ☀️',
      '• 1 = Poniedziałek 🌙',
      '• 2 = Wtorek 🔥',
      '• 3 = Środa 💧',
      '• 4 = Czwartek ⚡',
      '• 5 = Piątek 🎉',
      '• 6 = Sobota 🪐',
      'W roku 2026 dzień kotwiczny (Doomsday) to PIĄTEK (5).'
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
    theory: [
      'To najbardziej elegancka reguła kalendarza na świecie:',
      'W DOWOLNYM ROKU następujące daty wypadają w DOKŁADNIE TEN SAM DZIEŃ TYGODNIA:',
      '• 4 kwietnia (4.04)',
      '• 6 czerwca (6.06)',
      '• 8 sierpnia (8.08)',
      '• 10 października (10.10)',
      '• 12 grudnia (12.12)',
      'W roku 2026 każda z tych dat to PIĄTEK! Zapamiętaj tę piątkę parzystych dat!'
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
    theory: [
      'Dla miesięcy nieparzystych mamy łatwe do zapamiętania powiedzonko:',
      '„Pracuję od 9 do 5 na stacji 7/11”:',
      '• 9 maja (9.05) oraz 5 września (5.09) → zamiana 9 i 5!',
      '• 11 lipca (11.07) oraz 7 listopada (7.11) → zamiana 7 i 11!',
      'Te 4 daty również wypadają w ten sam dzień tygodnia co parzyste bliźniaki!'
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
    theory: [
      'Chcesz wiedzieć, jaki dzień tygodnia to 15 sierpnia 2026:',
      '1. Znasz kotwicę sierpnia: 8 sierpnia (8.08).',
      '2. Wiesz, że w 2026 roku kotwica to PIĄTEK (5).',
      '3. Różnica: 15 - 8 = 7 dni. Ponieważ 7 dni to pełny tydzień (7 mod 7 = 0), 15 sierpnia to DOKŁADNIE TEN SAM DZIEŃ: PIĄTEK!',
      'Gdyby to był 16 sierpnia → piątek + 1 dzień = sobota!'
    ],
    task: {
      prompt: 'Jeśli 8 sierpnia to Piątek, jaki dzień tygodnia to 10 sierpnia (8 + 2 dni)?',
      options: ['Niedziela (Piątek + 2 dni)', 'Sobota', 'Poniedziałek', 'Czwartek'],
      correct: 0,
      hint: 'Piątek + 1 dzień = Sobota; Piątek + 2 dni = Niedziela!'
    }
  },
  {
    id: 'cal-5',
    title: 'Marzec i Dzień Liczby Pi',
    subtitle: '14 marca oraz luty',
    desc: 'Ostatnie elementy układanki.',
    theory: [
      '• Marzec (3. miesiąc): kotwicą jest 14 marca (3.14 to Dzień Liczby Pi!).',
      '• Luty: kotwicą jest ZAWSZE OSTATNI DZIEŃ LUTEGO (28 lutego, a w przestępnym 29 lutego).',
      'Teraz znasz kotwicę dla każdego miesiąca w całym roku kalendarzowym!'
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
    theory: [
      'Brawo! Znasz już potężny algorytm Conwaya:',
      '• Parzyste: 4.04, 6.06, 8.08, 10.10, 12.12.',
      '• Nieparzyste: 9.05, 5.09, 11.07, 7.11.',
      '• Marzec: 14.03 (Pi).',
      '• Luty: 28.02.',
      'Nawet najszybszy komputer nie zrobi tego z takim wdziękiem jak Ty! 🐢'
    ],
    task: {
      prompt: 'Jaki dzień tygodnia to 12 grudnia 2026 roku (pamiętając, że kotwica 2026 to Piątek)?',
      options: ['Piątek (bo 12.12 to bezpośrednia kotwica Doomsday!)', 'Sobota', 'Niedziela', 'Środa'],
      correct: 0,
      hint: '12.12 to parzysty bliźniak – dokładnie dzień kotwicy (Piątek)!'
    }
  }
];
