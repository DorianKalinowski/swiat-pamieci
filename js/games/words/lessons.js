import { VOCAB } from './vocab.js';

export const LESSONS = [
  {
    id: 'words-1',
    title: 'Metoda słów-kluczy',
    subtitle: 'Koniec z nudnym wkuwaniem słówek',
    desc: 'Odkryj metodę badaczy Atkinsona i Raugha, która zwiększa tempo nauki angielskiego trzykrotnie!',
    speech: 'Cześć, tu Papużka Pola! 🦜 Marzysz o swobodnych podróżach po świecie i piątkach z angielskiego? Pokażę Ci czarodziejski trik ze słowami-kluczami – zapamiętasz każde angielskie słówko w kilka sekund, bez nudnego wkuwania!',
    theory: [
      'Po co nam ta metoda? Zwykłe powtarzanie angielskich słówek po 50 razy w zeszycie jest nudne, męczące i szybko ulatuje z głowy.',
      'Metoda słów-kluczy (Keyword Method) to sekret poliglotów i mistrzów pamięci na całym świecie!',
      'Składa się z 2 prostych, zabawnych kroków:',
      '1. Znajdź polskie słowo, które brzmi podobnie do angielskiego wyrazu (to nasz Most Fonetyczny).',
      '2. Połącz ten dźwięk ze znaczeniem słówka w śmieszną, bajkową scenkę w wyobraźni!',
      'Gdy usłyszysz angielskie słowo, Twój mózg natychmiast przypomni sobie śmieszną scenkę i od razu znasz znaczenie!'
    ],
    task: {
      prompt: 'Z jakich dwóch kroków składa się metoda słów-kluczy w nauce angielskiego?',
      options: [
        'Most fonetyczny (brzmienie) + żywa scenka ze znaczeniem',
        'Przepisywanie słówka 100 razy w zeszycie',
        'Czekanie, aż słówko samo wejdzie do głowy',
        'Słuchanie nagrań przez sen'
      ],
      correct: 0,
      hint: 'Dźwiękowy most i wyobraźnia to klucz do sukcesu!'
    }
  },
  {
    id: 'words-2',
    title: 'Dźwiękowy bliźniak',
    subtitle: 'Jak brzmi angielskie „mushroom”?',
    desc: 'Uczymy się szukać polskich słów brzmiących jak angielski wyraz.',
    speech: 'Posłuchaj dźwięków! Każde angielskie słówko ma w języku polskim swojego śmiesznego bliźniaka!',
    theory: [
      'Krok 1 w praktyce: szukamy dźwiękowego bliźniaka.',
      'Spójrz na angielskie słówko „mushroom” (grzyb).',
      'Powiedz je na głos: „masz-rum”.',
      'Brzmi dokładnie jak polskie pytanie: „MASZ RUM?!” 🏴‍☠️',
      'Dźwiękowy bliźniak nie musi być w 100% idealny – wystarczy, że da Twojemu umysłowi wesoły punkt zaczepienia!'
    ],
    task: {
      prompt: 'Jaki polski zwrot brzmi niemal identycznie jak angielskie słówko „mushroom”?',
      options: ['MASZ RUM', 'MASZ SER', 'MYSZ W DOMU', 'MISKA ZUPY'],
      correct: 0,
      hint: 'Powiedz mushroom szybko na głos: masz-rum!'
    }
  },
  {
    id: 'words-3',
    title: 'Wybuchowa scenka',
    subtitle: 'Łączenie mostu ze znaczeniem',
    desc: 'Sam dźwięk nie wystarczy – musisz połączyć go z tym, co dane słówko oznacza.',
    speech: 'A teraz łączymy dźwięk ze znaczeniem! Zobacz tego pirackiego prawdziwka w swojej wyobraźni!',
    theory: [
      'Mamy już most „MASZ RUM” i wiemy, że mushroom oznacza GRZYB.',
      'Teraz najważniejszy moment – zrób z tego film przed oczami:',
      'Wielki leśny prawdziwek z wąsami i w trójkątnym kapeluszu pirata staje przed Tobą, uderza pięścią w stół i groźnie krzyczy: „MASZ RUM W BUTELCE?!”',
      'Poczuj zapach lasu i zobacz tego śmiesznego grzyba.',
      'Teraz już nigdy w życiu nie zapomnisz słowa mushroom!'
    ],
    task: {
      prompt: 'Co oznacza angielskie słówko „mushroom”?',
      options: ['Grzyb', 'Rum', 'Pirat', 'Butelka'],
      correct: 0,
      hint: 'Pamiętasz wielkiego leśnego prawdziwka żądającego rumu?'
    }
  },
  {
    id: 'words-4',
    title: 'Angielski w mig',
    subtitle: 'Candle, Feather, Pillow',
    desc: 'Trzy nowe angielskie słówka zapamiętane w minutę.',
    speech: 'Kraaa! Zobacz, jak w minutę zapamiętasz trzy angielskie słówka na klasówkę z angielskiego!',
    theory: [
      'Ćwiczymy kolejne angielskie mosty dźwiękowe:',
      '• CANDLE (świeca) → KUNDEL: wesoły kundelek biegnie z płonącą świecą na ogonie! 🕯️',
      '• FEATHER (pióro) → SWETER: z wełnianego swetra nagle wyrastają wielkie gęsie pióra! 🪶',
      '• PILLOW (poduszka) → PIŁA: drwal próbuje ściąć wielkie drzewo miękką puchową poduszką! 🛏️'
    ],
    task: {
      prompt: 'KUNDEL niosący świecę na ogonie pomaga zapamiętać słówko:',
      options: ['candle (świeca)', 'feather (pióro)', 'pillow (poduszka)', 'mushroom (grzyb)'],
      correct: 0,
      hint: 'Kundel = Candle!'
    }
  },
  {
    id: 'words-5',
    title: 'Kolejne perełki: Shark, Beetle, Fork',
    subtitle: 'Rekin Szarik, Chrząszcze The Beatles i Foka z widelcem',
    desc: 'Błyskawiczne skojarzenia dla rekinów, chrząszczy i widelców po angielsku!',
    speech: 'Zobacz, jak wesołe są angielskie skojarzenia! Każde słówko to gotowa historyjka!',
    theory: [
      'Poznajemy kolejne 3 angielskie perełki z naszej bogatej puli ponad 100 wyrazów:',
      '• SHARK (rekin) → SZARIK: groźny rekin w wodzie macha przyjaźnie ogonem i szczeka jak pies Szarik! 🦈',
      '• BEETLE (chrząszcz) → BITELSI: cztery chrząszcze w garniturach grają rocka jak zespół The Beatles! 🪲',
      '• FORK (widelec) → FOKA: cyrkowa foka na plaży żongluje na czubku nosa wielkim widelcem! 🍴'
    ],
    task: {
      prompt: 'FOKA żonglująca na nosie widelcem pomaga zapamiętać angielskie słowo:',
      options: ['fork (widelec)', 'shark (rekin)', 'beetle (chrząszcz)', 'candle (świeca)'],
      correct: 0,
      hint: 'Foka żongluje widelcem = fork!'
    }
  },
  {
    id: 'words-6',
    title: 'Egzamin Poligloty',
    subtitle: 'Wielki sprawdzian angielskich mostów',
    desc: 'Czas na ostateczny test u Papużki Poli! Błyskawiczne tłumaczenie z angielskiego.',
    speech: 'Wielki finał u Papużki Poli! Z tą techniką masz w pamięci ponad 100 angielskich słówek!',
    theory: [
      'Brawo! Masz w ręku najpotężniejsze narzędzie do nauki języka angielskiego na świecie.',
      'Gdy w szkole, filmie czy w podróży spotkasz nowe angielskie słówko:',
      '1. Usłysz jego dźwięk i znajdź polskiego bliźniaka.',
      '2. Stwórz wyrazistą, zabawną scenkę.',
      '3. Ciesz się swobodną znajomością angielskiego bez stresu i zakuwania! 🦜🇬🇧'
    ],
    task: {
      prompt: 'Co oznacza angielskie słówko „shark” (most: pies SZARIK machający ogonem w płetwie rekina)?',
      options: ['Rekin', 'Pies', 'Statek', 'Woda'],
      correct: 0,
      hint: 'Szarik jako rekin w oceanie!'
    }
  }
];
