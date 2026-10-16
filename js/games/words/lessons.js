import { VOCAB } from './vocab.js';

export const LESSONS = [
  {
    id: 'words-1',
    title: 'Metoda słów-kluczy',
    subtitle: 'Koniec z nudnym wkuwaniem słówek',
    desc: 'Odkryj metodę badaczy Atkinsona i Raugha, która zwiększa tempo nauki języków trzykrotnie!',
    theory: [
      'Tradycyjne powtarzanie słówek po 50 razy jest męczące i szybko ulatuje z głowy.',
      'Metoda słów-kluczy (Keyword Method) opiera się na 2 prostych krokach:',
      '1. Znajdź polskie słowo, które brzmi podobnie do obcego wyrazu (Most Fonetyczny).',
      '2. Stwórz w wyobraźni krótką, zabawną scenkę łączącą ten most z prawdziwym znaczeniem!',
      'Gdy słyszysz obce słowo, Twój mózg natychmiast przywołuje scenkę i znasz tłumaczenie!'
    ],
    task: {
      prompt: 'Z jakich dwóch kroków składa się metoda słów-kluczy?',
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
    desc: 'Uczymy się szukać polskich słów brzmiących jak obcy wyraz.',
    theory: [
      'Spójrz na angielskie słowo „mushroom” (grzyb).',
      'Powiedz je na głos: „masz-rum”.',
      'Brzmi dokładnie jak polskie pytanie: „MASZ RUM?!” 🏴‍☠️',
      'Dźwiękowy bliźniak nie musi być w 100% idealny – wystarczy, że da Twojemu umysłowi wyraźny punkt zaczepienia.'
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
    theory: [
      'Mamy już most „MASZ RUM” i wiemy, że mushroom oznacza GRZYB.',
      'Teraz zamknij oczy i zobacz to:',
      'Wielki, leśny prawdziwek z wąsami i w czapce pirata staje przed Tobą, wali pięścią w stół i groźnie wrzeszczy: „MASZ RUM W BUTELCE?!”',
      'Poczuj zapach lasu i usłysz ten piracki krzyk.',
      'Teraz już nigdy nie zapomnisz, co to mushroom!'
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
    theory: [
      'Ćwiczymy kolejne angielskie mosty:',
      '• CANDLE (świeca) → KUNDEL: wesoły kundelek biegnie z płonącą świecą na ogonie! 🕯️',
      '• FEATHER (pióro) → SWETER: z wełnianego swetra wyrastają wielkie gęsie pióra! 🪶',
      '• PILLOW (poduszka) → PIŁA: tniesz deskę miękką puchową poduszką! 🛏️'
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
    title: 'Hiszpańska fiesta',
    subtitle: 'Gato, Perro, Cuchara',
    desc: 'Metoda działa w każdym języku świata – sprawdźmy hiszpański!',
    theory: [
      'Zobacz, jak bajecznie uczy się hiszpańskiego:',
      '• GATO (kot) → GATKI: rudy kot spaceruje w czerwonych gatkach w grochy! 🐱',
      '• PERRO (pies) → PERON: pies w czapce kolejarza szczeka na peronie! 🐶',
      '• CUCHARA (łyżka) → KUCHARZ: kucharz żongluje wielkimi złotymi łyżkami! 🥄'
    ],
    task: {
      prompt: 'Rudy kot w wielkich GATKACH to skojarzenie dla hiszpańskiego słówka:',
      options: ['gato (kot)', 'perro (pies)', 'cuchara (łyżka)', 'manzana (jabłko)'],
      correct: 0,
      hint: 'Gatki = Gato!'
    }
  },
  {
    id: 'words-6',
    title: 'Egzamin Poligloty',
    subtitle: 'Sprawdzian mistrzowskich mostów',
    desc: 'Czas na ostateczny test u Papużki Poli! Błyskawiczne tłumaczenie w obie strony.',
    theory: [
      'Znasz już najpotężniejsze narzędzie językowe świata.',
      'Niezależnie, czy uczysz się angielskiego, hiszpańskiego, niemieckiego czy japońskiego:',
      '1. Usłysz dźwięk i znajdź polski odpowiednik.',
      '2. Stwórz żywą, zabawną scenkę.',
      '3. Ciesz się setkami nowych słówek bez zakuwania!'
    ],
    task: {
      prompt: 'Co oznacza hiszpańskie słowo „cuchara” (most: KUCHARZ machający wielką łyżką)?',
      options: ['Łyżka', 'Widelec', 'Garnek', 'Kucharz'],
      correct: 0,
      hint: 'Kucharz machał wielką łyżką do zupy!'
    }
  }
];
