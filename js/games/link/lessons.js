import { LINK_ITEMS, SHOPPING_CHAIN } from './chains.js';

export const LESSONS = [
  {
    id: 'link-1',
    title: 'Efekt domina i siła akcji',
    subtitle: 'Nigdy nie stawiaj rzeczy obok siebie',
    desc: 'Najczęstszy błąd: wyobrażenie sobie parasola leżącego obok arbuza. To nie zadziała!',
    theory: [
      'Nasz mózg ignoruje statyczne, nudne obrazy. Aby coś zapamiętać, potrzebujesz DYNAMICZNEJ AKCJI!',
      'Gdy łączysz PARASOL ☂️ z ARBUZEM 🍉:',
      'NIE wyobrażaj sobie parasola opartego o arbuza.',
      'Zobacz, jak parasol otwiera się z potężnym hukiem i z impetem PRZEBIJA wielkiego arbuza, z którego tryska fontanna lepkiego soku!',
      'Akcja, zderzenie i emocje sprawiają, że połączenie staje się nierozerwalne!'
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
    theory: [
      'Sekret metody łańcuchowej tkwi w jej nazwie: to ŁAŃCUCH ogniw.',
      'Gdy łączysz Parasol z Arbuzem, zapominasz o reszcie świata.',
      'Gdy łączysz Arbuz z Rowerem (sok z arbuza tworzy kałużę, na której ślizga się rower), myślisz TYLKO o Arbuzie i Rowerze!',
      'Każde ogniwo pociąga kolejne. Twój mózg skupia się tylko na JEDNEJ parze naraz.'
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
    theory: [
      'Najsilniejsze skojarzenia angażują co najmniej 3 zmysły:',
      '1. RUCH – przedmioty wirują, spadają, eksplodują.',
      '2. DŹWIĘK – usłysz brzęk, pisk opon, krzyk, huk dzwonka zegara.',
      '3. PRZESADA – wyobraź sobie nie mały zegarek, ale ZEGAR wielkości wieżowca, który uderza w rower!',
      'Im bardziej absurdalny i komiczny obraz, tym łatwiej go przywołać.'
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
    theory: [
      'Budujemy łańcuch zakupów:',
      '1. CHLEB 🍞 → olbrzymi bochenek służy jako trampolina dla...',
      '2. POMIDORÓW 🍅 → które toczą się i wskakują do kartonu...',
      '3. MLEKA 🥛 → mleko wytryskuje prosto na ziarenka...',
      '4. KAWY ☕ → tańczące ziarenka kawy wpadają do słoika...',
      '5. MIODU 🍯 → złocisty, lepki miód oblepia wszystko!',
      'Idziesz do sklepu i odtwarzasz historię krok po kroku!'
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
    theory: [
      'Spróbujmy cofnąć listę zakupów od końca:',
      '• MIÓD 🍯 → co oblepił? Ziarenka KAWY ☕!',
      '• KAWA ☕ → skąd wyleciała? Z kartonu MLEKA 🥛!',
      '• MLEKO 🥛 → na co trysnęło? Na czerwone POMIDORY 🍅!',
      '• POMIDORY 🍅 → po czym się toczyły? Po bochenku CHLEBA 🍞!',
      'To dowód, że Twoje powiązania są żelazne i trwałe.'
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
    theory: [
      'Opanowałeś wszystkie prawa łańcucha skojarzeń:',
      '• Parasol → Arbuz → Rower → Zegar → Balon → Kaktus → Gitara → Lody → Klucz → Latarka.',
      'Każdy przedmiot taranuje kolejny z dźwiękiem i ruchem.',
      'Basia jest zachwycona! Twoja spiżarnia pamięci jest pełna orzeszków! 🐿️'
    ],
    task: {
      prompt: 'Co przebija lecący w chmurach balon w naszej historii?',
      options: ['Kaktus z tysiącem złotych kolców', 'Parasol', 'Rower', 'Gitara'],
      correct: 0,
      hint: 'Balon wpada prosto na ostry kaktus!'
    }
  }
];
