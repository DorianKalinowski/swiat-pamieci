import { MONTH_ANCHORS, DAYS_OF_WEEK } from './logic.js';

export const LESSONS = [
  {
    id: 'cal-1',
    title: 'Sekret kalendarza i Kotwica Roku',
    subtitle: 'Dni tygodnia 0-6 oraz fundament Doomsday',
    desc: 'Odkryj tajemnicę geniusza Johna Conwaya – kalendarz w pamięci.',
    speech: 'Cześć! Jestem Żółwik Zenon 🐢. Nigdy się nie spieszę, bo znam sekret czasu! Czy wiesz, że możesz w 2 sekundy odgadnąć, w jaki dzień tygodnia wypadną Twoje urodziny, Boże Narodzenie w 2026, a nawet data w 2035 roku? Pokażę Ci tę niezwykłą sztuczkę!',
    theory: [
      'Po co nam ta technika? Wyobraź sobie miny znajomych w szkole lub w pracy, gdy ktoś rzuci datę, a Ty po 2 sekundach w pamięci odpowiesz: „To będzie sobota!”. Poczujesz się jak chodzący ludzki kalkulator!',
      'Tydzień ma 7 dni i kręci się w kółko jak karuzela. Ponumerujmy dni tygodnia od 0 do 6:',
      '• 1 = Poniedziałek 🌙 | 2 = Wtorek 🔥 | 3 = Środa 💧 | 4 = Czwartek ⚡ | 5 = Piątek 🎉 | 6 = Sobota 🪐',
      '• 0 = Niedziela ☀️ (dzień relaksu i odpoczynku, okrągłe zero pracy!)',
      'CZYM JEST KOTWICA ROKU?',
      'W każdym roku istnieje jeden magiczny dzień tygodnia, zwany Kotwicą Roku (Doomsday).',
      'W roku 2026 dniem kotwicznym jest SOBOTA (6). Zapamiętajmy tę liczbę!'
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
    speech: 'Oto najłatwiejsza reguła na świecie: daty parzyste to lustrzane bliźniaki w każdym roku!',
    theory: [
      'Spójrz, jak genialnie zbudowany jest kalendarz:',
      'W każdym parzystym miesiącu numer miesiąca to dokładnie ten sam dzień kotwiczny:',
      '• 4 kwietnia (4.04)',
      '• 6 czerwca (6.06)',
      '• 8 sierpnia (8.08)',
      '• 10 października (10.10)',
      '• 12 grudnia (12.12)',
      'Te 5 dat ZAWSZE wypada w ten sam dzień tygodnia w danym roku! W 2026 roku każda z nich to dokładnie SOBOTA!'
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
    title: 'Miesiące nieparzyste i Dzień Pi',
    subtitle: 'Praca 9 do 5 na stacji 7/11, Dzień Pi (14.03) i luty',
    desc: 'Komplet kotwic dla wszystkich 12 miesięcy w roku.',
    speech: 'A co z miesiącami nieparzystymi? Mamy na nie wesołą rymowankę o stacji benzynowej i liczbie Pi!',
    theory: [
      'Dla miesięcy nieparzystych mamy łatwe powiedzonko:',
      '„Pracuję od 9 do 5 na stacji 7/11”:',
      '• 9 maja (9.05) oraz 5 września (5.09) → zamieniamy 9 i 5!',
      '• 11 lipca (11.07) oraz 7 listopada (7.11) → zamieniamy 7 i 11!',
      'Do tego dochodzą pierwsze trzy miesiące roku:',
      '• Styczeń: 3 stycznia (3.01) w zwykłym roku (lub 4.01 w przestępnym) – pamiętamy: 3 dni odpoczynku po sylwestrze!',
      '• Luty: ZAWSZE OSTATNI DZIEŃ LUTEGO (28.02, a w przestępnym 29.02).',
      '• Marzec: 14 marca (3.14 to słynny Dzień Liczby Pi!).',
      'Wszystkie te daty to w 2026 roku również ta sama nasza kotwica: SOBOTA!'
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
    speech: 'Teraz połączymy kropki! Zobacz, jak w 3 prostych krokach policzyć dowolną datę w roku!',
    theory: [
      'Chcesz wiedzieć, jaki dzień tygodnia to np. 15 sierpnia 2026:',
      '1. Znasz kotwicę sierpnia: to bliźniak 8 sierpnia (8.08).',
      '2. Wiesz, że w 2026 roku kotwica to SOBOTA (6).',
      '3. Liczymy różnicę dni: 15 - 8 = 7 dni. Pełne 7 dni to dokładnie tydzień, więc 15 sierpnia to również SOBOTA!',
      'Gdyby to był 10 sierpnia? 8 sierpnia + 2 dni: Sobota + 2 dni = Poniedziałek!'
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
    title: 'Podróżnik w czasie: Inne lata!',
    subtitle: 'Jak znaleźć kotwicę dla 2027, 2028 czy 2035 roku?',
    desc: 'Sekret przenoszenia kotwicy w przyszłość i przeszłość.',
    speech: 'A teraz prawdziwa magia: Podróżnik w czasie! Nauczę Cię błyskawicznie znajdować kotwicę dla dowolnego innego roku!',
    theory: [
      'Dlaczego to działa w każdym roku?',
      'Zwykły rok ma 365 dni = 52 pełne tygodnie + 1 dzień zapasu. Dlatego każdy zwykły rok przesuwa kotwicę o dokładnie +1 dzień!',
      'Rok przestępny (ma 29 lutego) przesuwa kotwicę o +2 dni!',
      'JAK TO LICZYĆ W PAMIĘCI?',
      'Naszą domową bazą jest rok 2026 = SOBOTA (6):',
      '• Rok 2027: (+1 rok) → Sobota + 1 = NIEDZIELA (0)! Wszystkie kotwice (4.04, 8.08, 12.12) w 2027 to Niedziela!',
      '• Rok 2028: (przestępny! +2 dni) → Niedziela + 2 = WTOREK (2)!',
      '• Rok 2025: (-1 rok w tył) → Sobota - 1 = PIĄTEK (5)!',
      '• Rok 2035: różnica 9 lat + 2 lata przestępne (2028, 2032) = 11 dni przesunięcia. 11 mod 7 = 4 dni w przód od Soboty = ŚRODA (3)!',
      'KOTWICE STULECI:',
      '• Wiek XXI (lata 2000–2099): baza stulecia to WTOREK (2, łatwo zapamiętać: rok 2000 ma dwójkę na początku)!',
      '• Wiek XX (lata 1900–1999): baza stulecia to ŚRODA (3, 3 sylaby: „dzie-więć-set”)!'
    ],
    task: {
      prompt: 'Jeśli w 2026 roku kotwicą jest Sobota, jaka będzie kotwica roku 2027 (zwykły rok, +1 dzień)?',
      options: ['Niedziela (Sobota + 1 dzień)', 'Poniedziałek', 'Piątek', 'Wtorek'],
      correct: 0,
      hint: 'Każdy normalny rok przesuwa kotwicę o 1 dzień w przód: Sobota + 1 = Niedziela!'
    }
  },
  {
    id: 'cal-6',
    title: 'Egzamin Władcy Czasu',
    subtitle: 'Sprawdzian dat w przeszłości i przyszłości',
    desc: 'Wielki finał u Żółwika Zenona! Oblicz dzień tygodnia w innym roku.',
    speech: 'Wielki Finał u Żółwika Zenona! Jesteś gotów na dowolny rok – przeszły, teraźniejszy i przyszły! 🐢⏳',
    theory: [
      'Brawo! Masz w głowie kompletny, wieczysty kalendarz na dowolny rok:',
      '1. Znasz kotwice miesięcy: 4.04, 6.06, 8.08, 10.10, 12.12, 9.05, 5.09, 11.07, 7.11, 14.03, 28.02.',
      '2. Znasz bazę 2026 (Sobota) i potrafisz przesunąć kotwicę na dowolny rok (+1 na rok, +2 na przestępny).',
      '3. Dodajesz lub odejmujesz różnicę dni do najbliższej kotwicy!',
      'Możesz teraz śmiało wejść w tryb „Podróżnik w czasie” i błyskawicznie podać dzień tygodnia dla dowolnej daty w historii i przyszłości! 🐢🪐'
    ],
    task: {
      prompt: 'Jaki dzień tygodnia to 4 kwietnia 2027 roku (pamiętając, że kotwica 2027 to Niedziela)?',
      options: ['Niedziela (bo 4.04 to bezpośrednia kotwica Doomsday!)', 'Sobota', 'Poniedziałek', 'Środa'],
      correct: 0,
      hint: '4.04 to kwietniowa kotwica – w 2027 roku przypada dokładnie w dzień kotwicy: Niedzielę!'
    }
  }
];
