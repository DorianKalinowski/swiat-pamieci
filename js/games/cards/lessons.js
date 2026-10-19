import { CARDS_PAO, SUITS } from './deck.js';

export const LESSONS = [
  {
    id: 'cards-1',
    title: 'Cztery żywioły talii',
    subtitle: 'Pik, Kier, Karo i Trefl',
    desc: 'Poznaj cztery kolory talii i ich wizualne motywy przewodnie.',
    speech: 'Abrakadabra! Cześć, jestem Szop Magik! 🦝 Czy wiesz, jak iluzjoniści pamiętają całą talię kart w kilkadziesiąt sekund? Zamieniają nudne figury w superbohaterów i kręcą z nich bajkowy film! Pokażę Ci, jak to zrobić!',
    theory: [
      'Po co uczyć się zapamiętywania kart? To nie tylko wspaniała sztuczka, którą zachwycisz kolegów w szkole i rodzinę przy stole!',
      'System PAO (karty i sekwencje) to najpotężniejsza technika do zapamiętywania długich ciągów kolejnych kroków, przepisów, procedur i list!',
      'Zaczynamy od 4 magicznych żywiołów talii:',
      '• PIK (♠) – tajemniczy, czarny świat magów, iluzjonistów i nocy.',
      '• KIER (♥) – czerwone serca, dzielni rycerze, królowie, ogień i przygoda.',
      '• KARO (♦) – diamenty, złoto, bogactwo, skrzynie skarbów i piraci.',
      '• TREFL (♣) – zielone liście, las, natura, druidzi i leśni łucznicy.',
      'Gdy widzisz kolor, od razu wiesz, do jakiego świata należy karta!'
    ],
    task: {
      prompt: 'Jaki motyw wizualny odpowiada kolorowi KARO (♦)?',
      options: ['Diamenty, złoto i skarby', 'Noc i cienie', 'Las i koniczyna', 'Śnieg i lód'],
      correct: 0,
      hint: 'Karo to kształt diamentu – kojarzy się z bogactwem i skarbami!'
    }
  },
  {
    id: 'cards-2',
    title: 'Karty dworskie',
    subtitle: 'Walet, Dama i Król',
    desc: 'Figury to najpotężniejsze persony w talii. Każda ma swoją osobowość.',
    speech: 'Oto nasi bohaterowie! Każda figura zamienia się w żywą postać z bajki!',
    theory: [
      'Karty dworskie najłatwiej zamienić na wyrazistych bohaterów:',
      '• Król Kier (K♥) → Król Artur w złotej koronie ze świecącym mieczem Excalibur 👑',
      '• Dama Karo (Q♦) → Królowa Kleopatra rzucająca lśniącym błękitnym diamentem 💎',
      '• Walet Trefl (J♣) → Robin Hood strzelający z potężnego dębowego łuku 🏹',
      '• As Pik (A♠) → Szop Magik wyciągający lśniący cylinder z kapelusza 🦝',
      'Zamiast płaskiego kartonika widzisz żywą postać jak z komiksu!'
    ],
    task: {
      prompt: 'Kim jest Król Kier (K♥) w naszym systemie kart?',
      options: ['Król Artur ze złotym mieczem Excalibur', 'Szop Magik z cylindrem', 'Robin Hood z łukiem', 'Batman z batarangiem'],
      correct: 0,
      hint: 'Kier to czerwone serce i rycerski Król Artur!'
    }
  },
  {
    id: 'cards-3',
    title: 'Filozofia PAO',
    subtitle: 'Postać, Akcja i Obiekt',
    desc: 'Metoda stosowana przez rekordzistów Guinnessa do zapamiętania 52 kart w 20 sekund!',
    speech: 'Sekret rekordzistów Guinnessa: formuła PAO! Trzy karty zamieniamy w jedną bajkę!',
    theory: [
      'System PAO (Person - Action - Object) przypisuje do każdej karty:',
      '1. POSTAĆ (kto to jest?)',
      '2. AKCJĘ (co robi?)',
      '3. OBIEKT (czym się bawi lub czym rzuca?)',
      'Dzięki temu jedna karta daje postać, druga jej akcję, a trzecia przedmiot.',
      'To pozwala skompresować aż 3 karty w JEDEN zabawny, filmowy kadr w głowie!'
    ],
    task: {
      prompt: 'Co oznacza skrót metody PAO?',
      options: ['Person – Action – Object (Postać – Akcja – Obiekt)', 'Play – Ace – Over', 'Power – Agility – Order', 'Pakiet – Atut – Opcja'],
      correct: 0,
      hint: 'Pamiętasz: Postać wykonuje Akcję z Obiektem!'
    }
  },
  {
    id: 'cards-4',
    title: 'Łączenie 2 kart w 1 scenę',
    subtitle: 'Fuzja Króla Artura i Kleopatry',
    desc: 'Jak zapamiętać parę kart w ułamku sekundy?',
    speech: 'Połączmy dwie karty w jedną scenę! Król Artur i Kleopatra robią coś szalonego!',
    theory: [
      'Wyobraź sobie parę kart: pierwsza to Król Kier (K♥), a druga to Dama Karo (Q♦).',
      'Bierzemy POSTAĆ z pierwszej karty: Król Artur 👑',
      'I bierzemy AKCJĘ + OBIEKT z drugiej karty: rzuca błękitnym diamentem 💎!',
      'Scena w głowie: Król Artur bierze zamach i z całej siły ciska wielkim diamentem w dal!',
      'Gdy widzisz tę scenę przed oczami, natychmiast odczytujesz: K♥ oraz Q♦!'
    ],
    task: {
      prompt: 'Jakie karty koduje scena: „Król Artur rzuca wielkim błękitnym diamentem”?',
      options: ['Król Kier (K♥) + Dama Karo (Q♦)', 'As Pik + Walet Trefl', '10 Pik + 7 Kier', 'Dama Karo + Król Trefl'],
      correct: 0,
      hint: 'Król Artur (K♥) wykonuje akcję diamentu Kleopatry (Q♦)!'
    }
  },
  {
    id: 'cards-5',
    title: 'Praktyka: Rozdanie pokerowe',
    subtitle: 'Zapamiętaj 3 karty na stole',
    desc: 'Sprawdź swoje umiejętności na stole do gry.',
    speech: 'Prawdziwe rozdanie na stole! Trzy karty zapamiętane w 3 sekundy!',
    theory: [
      'Na stole lądują 3 karty: As Pik (A♠), Walet Trefl (J♣) i 7 Kier (7♥).',
      '• A♠ = Szop Magik (Postać)',
      '• J♣ = napina i strzela z dębowego łuku (Akcja)',
      '• 7♥ = kieliszek złotego napoju (Obiekt)',
      'Zobacz to: Szop Magik bierze wielki łuk i z uśmiechem wystrzeliwuje z niego kieliszek niczym strzałę!',
      'Śmieszne, wyraziste i nie do zapomnienia!'
    ],
    task: {
      prompt: 'Kto strzelał z łuku w naszej scenie (reprezentując Asa Pik)?',
      options: ['Szop Magik', 'Batman', 'Król Artur', 'Druid'],
      correct: 0,
      hint: 'As Pik to nasz uroczy Szop Magik!'
    }
  },
  {
    id: 'cards-6',
    title: 'Egzamin Iluzjonisty',
    subtitle: 'Ostateczny test Szopa Magika',
    desc: 'Opanowałeś tajniki talii kart. Czas na certyfikat iluzjonisty!',
    speech: 'Wielki egzamin iluzjonisty! Twoja pamięć jest teraz szybsza niż zręczne dłonie magika!',
    theory: [
      'Brawo! Znasz już sekrety pamięciowych iluzjonistów:',
      '1. 4 żywioły kolorów talii.',
      '2. Postacie dworskie.',
      '3. Formuła PAO (Postać - Akcja - Obiekt).',
      'Teraz jesteś gotowy na każdą rozgrywkę z przyjaciółmi i grę swobodną!'
    ],
    task: {
      prompt: 'Co wyciąga Szop Magik z cylindra na karcie As Pik?',
      options: ['Świecący cylinder / magiczny rekwizyt', 'Pocisk armatni', 'Kawałek pizzy', 'Szklaną kulę'],
      correct: 0,
      hint: 'Magik zawsze żongluje cylindrem!'
    }
  }
];
