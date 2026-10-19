import { LINK_ITEMS, SHOPPING_CHAIN } from './chains.js';

export const LESSONS = [
  {
    id: 'link-1',
    title: 'Efekt domina i siła akcji',
    subtitle: 'Nigdy nie stawiaj rzeczy obok siebie',
    desc: 'Najczęstszy błąd: wyobrażenie sobie parasola leżącego obok arbuza. To nie zadziała!',
    speech: 'Chrup, chrup! Cześć! Jestem Wiewiórka Basia 🐿️ Zawsze wiem, gdzie schowałam orzeszki! Pokażę Ci metodę łańcucha skojarzeń – dzięki niej zapamiętasz listę zakupów, rzeczy do plecaka czy plan dnia bez żadnej kartki papieru!',
    theory: [
      'Po co nam ta technika? Ile razy zdarzyło Ci się pójść do sklepu i zapomnieć połowy rzeczy, albo pakować plecak do szkoły i zostawić strój na WF w domu?',
      'Metoda łańcuchowa łączy myśli w głowie jak klocki domina: gdy popchniesz pierwszy klocek, cała reszta sama wskakuje do głowy!',
      'ZASADA NR 1: PRAWIDŁO DYNAMICZNEJ AKCJI:',
      'Nasz mózg natychmiast zapomina nudne, spokojne obrazki. Aby coś zapamiętać, potrzebujesz ruchu i akcji!',
      'Gdy łączysz PARASOL ☂️ z ARBUZEM 🍉:',
      'NIE wyobrażaj sobie parasola opartego o arbuza!',
      'Zobacz, jak parasol otwiera się z potężnym hukiem i z impetem PRZEBIJA wielkiego arbuza, z którego na wszystkie strony tryska słodki, czerwony sok!'
    ],
    task: {
      prompt: 'Jakie połączenie parasola z arbuzem zapamiętasz najdłużej?',
      options: [
        'Parasol z hukiem wystrzeliwuje i taranuje arbuza, rozbryzgując czerwony sok!',
        'Parasol leży spokojnie na stole obok arbuza',
        'Parasol i arbuz są czarno-białe',
        'Zwykły parasol w sklepie'
      ],
      correct: 0,
      hint: 'Wybierz najbardziej dynamiczną, wybuchową akcję!'
    }
  },
  {
    id: 'link-2',
    title: 'Zasada dwóch ogniw',
    subtitle: 'Myśl tylko o A i B!',
    desc: 'Wielka ulga: nie musisz trzymać w głowie całej historii na raz.',
    speech: 'Wielka ulga: myślisz tylko o dwóch rzeczach naraz! Reszta świata może poczekać!',
    theory: [
      'Dlaczego to takie proste? Nie musisz trzymać w głowie całej długiej listy na raz!',
      'W łańcuchu liczy się tylko bieżąca para ogniw (A i B):',
      'Gdy łączysz Parasol z Arbuzem – myślisz tylko o nich.',
      'Gdy łączysz Arbuz z Rowerem (sok z arbuza tworzy lepką kałużę, na której ślizga się rower) – myślisz TYLKO o Arbuzie i Rowerze!',
      'Każde ogniwo pociąga za sobą kolejne jak wagoniki w pociągu!'
    ],
    task: {
      prompt: 'Gdy łączysz arbuz z rowerem, o czym powinieneś myśleć?',
      options: ['Tylko o żywej interakcji między arbuzem a rowerem', 'O wszystkich 100 rzeczach naraz', 'O pogodzie za oknem', 'O niczym'],
      correct: 0,
      hint: 'Zasada łańcucha: skupiasz się wyłącznie na bieżącej parze ogniw!'
    }
  },
  {
    id: 'link-3',
    title: 'Trzy zmysły pamięci',
    subtitle: 'Dźwięk, ruch i przesada',
    desc: 'Wzbogać swoje wyobrażenia o zmysły.',
    speech: 'Włączamy zmysły! Spraw, by przedmioty były gigantyczne, hałaśliwe i zabawne!',
    theory: [
      'Najsilniejsze skojarzenia angażują co najmniej 3 zmysły:',
      '1. RUCH – przedmioty wirują, skaczą, odbijają się jak piłki.',
      '2. DŹWIĘK – usłysz głośny pisk, dzwonienie budzika, plusk wody.',
      '3. PRZESADA – wyobraź sobie nie zwykły mały zegarek, ale ZEGAR wielki jak wieżowiec, który z łomotem uderza w rower!',
      'Im bardziej śmieszny i niezwykły obraz, tym łatwiej go przywołać!'
    ],
    task: {
      prompt: 'Rower wpada na ZEGAR. Jak wzmocnić to skojarzenie?',
      options: [
        'Zegar jest gigantyczny, głośno dzwoni i odbija się z hukiem od kierownicy roweru!',
        'Rower stoi w piwnicy bez ruchu',
        'Zegar ma wyjętą baterię i milczy',
        'Zwykły mały zegarek leży w kieszeni'
      ],
      correct: 0,
      hint: 'Włącz głośny dźwięk, ruch i olbrzymi rozmiar!'
    }
  },
  {
    id: 'link-4',
    title: 'Praktyka: Lista zakupów bez kartki',
    subtitle: '5 produktów w jednym łańcuchu',
    desc: 'Prawdziwy test życiowy: Chleb, Pomidory, Mleko, Kawa, Miód.',
    speech: 'Sprawdźmy to w prawdziwym życiu! 5 produktów ze sklepu zapamiętanych w mgnieniu oka!',
    theory: [
      'Budujemy łańcuch zakupów bez kartki:',
      '1. CHLEB 🍞 → olbrzymi chrupiący bochenek służy jako trampolina dla...',
      '2. POMIDORÓW 🍅 → które toczą się i z pluskiem wskakują do kartonu...',
      '3. MLEKA 🥛 → białe mleko wytryskuje jak gejzer na tańczące ziarenka...',
      '4. KAWY ☕ → które wpadają prosto do wielkiego słoika...',
      '5. MIODU 🍯 → złocisty, cieplutki miód oblepia wszystko dookoła!',
      'Wchodzisz do sklepu i z uśmiechem odtwarzasz film krok po kroku!'
    ],
    task: {
      prompt: 'Co działo się z pomidorami po zeskoczeniu z chleba?',
      options: ['Wskoczyły do wytryskującego kartonu mleka', 'Zostały w torbie', 'Zamieniły się w kamienie', 'Zjadł je pies'],
      correct: 0,
      hint: 'Pomidory wpadły do mleka!'
    }
  },
  {
    id: 'link-5',
    title: 'Spacer w tył',
    subtitle: 'Odtwarzanie sekwencji od końca',
    desc: 'Dlaczego metoda łańcuchowa jest tak potężna? Bo działa w obie strony!',
    speech: 'Czarodziejski spacer w tył! Ten łańcuch działa w obie strony jak po sznurku!',
    theory: [
      'Prawdziwa supermoc: cofamy listę zakupów od końca!',
      '• MIÓD 🍯 → co oblepił? Ziarenka KAWY ☕!',
      '• KAWA ☕ → skąd wyleciała? Z kartonu MLEKA 🥛!',
      '• MLEKO 🥛 → na co trysnęło? Na czerwone POMIDORY 🍅!',
      '• POMIDORY 🍅 → po czym skakały? Po bochenku CHLEBA 🍞!',
      'Twój mózg potrafi odtworzyć listę od początku i od końca bez ani jednego błędu!'
    ],
    task: {
      prompt: 'Jaki produkt znajdował się bezpośrednio przed kawą?',
      options: ['Mleko (mleko wytryskujące na kawę)', 'Chleb', 'Miód', 'Pomidory'],
      correct: 0,
      hint: 'Mleko zalało tańczącą kawę!'
    }
  },
  {
    id: 'link-6',
    title: 'Wiewiórcza spiżarnia: 10 ogniw',
    subtitle: 'Wielki finał metody łańcuchowej',
    desc: 'Zbuduj łańcuch 10 szalonych przedmiotów i zdobądź tytuł Mistrza Skojarzeń!',
    speech: 'Wielki finał u Basi! Aż 10 szalonych ogniw – Twoja spiżarnia pamięci jest pełna skarbów!',
    theory: [
      'Opanowałeś wszystkie prawa łańcucha skojarzeń:',
      '• Parasol → Arbuz → Rower → Zegar → Balon → Kaktus → Gitara → Lody → Klucz → Latarka.',
      'Każdy przedmiot taranuje kolejny z dźwiękiem i ruchem.',
      'Wiewiórka Basia bije Ci brawo! Możesz zapamiętać dowolną liczbę rzeczy na sprawdzian lub wycieczkę! 🐿️'
    ],
    task: {
      prompt: 'Co przebija lecący w chmurach balon w naszej historii?',
      options: ['Kaktus z tysiącem złotych kolców', 'Parasol', 'Rower', 'Gitara'],
      correct: 0,
      hint: 'Balon wpada prosto na ostry kaktus!'
    }
  }
];
