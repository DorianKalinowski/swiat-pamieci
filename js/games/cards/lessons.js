import { CARDS_PAO, SUITS } from './deck.js';

export const LESSONS = [
  {
    id: 'cards-1',
    title: 'Cztery żywioły talii',
    subtitle: 'Pik, Kier, Karo i Trefl',
    desc: 'Poznaj cztery kolory talii i ich wizualne motywy przewodnie.',
    theory: [
      'W talii kart mamy 4 kolory, z których każdy ma swój niepowtarzalny nastrój:',
      '• PIK (♠) – ciemny, tajemniczy, magowie, iluzjoniści i noc.',
      '• KIER (♥) – czerwone serca, rycerze, królowie, ogień i pasja.',
      '• KARO (♦) – diamenty, złoto, bogactwo, skarby i piraci.',
      '• TREFL (♣) – zielone liście, las, natura, druidzi i łucznicy.',
      'Gdy widzisz kolor, natychmiast wiesz, do jakiego świata należy karta!'
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
    theory: [
      'Figury najłatwiej zamienić na wyraziste postacie:',
      '• Król Kier (K♥) → Król Artur ze złotym mieczem Excalibur 👑',
      '• Dama Karo (Q♦) → Królowa Kleopatra rzucająca błękitnym diamentem 💎',
      '• Walet Trefl (J♣) → Robin Hood strzelający z dębowego łuku 🏹',
      '• As Pik (A♠) → Szop Magik wyciągający lśniący cylinder 🦝',
      'Zamiast abstrakcyjnej figury, widzisz żywego bohatera!'
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
    theory: [
      'System PAO (Person - Action - Object) przypisuje do każdej karty:',
      '1. POSTAĆ (kto to jest?)',
      '2. AKCJĘ (co robi?)',
      '3. OBIEKT (czym manipuluje?)',
      'Dzięki temu jedna karta może być postacią, druga akcją, a trzecia obiektem.',
      'To pozwala skompresować aż 3 karty w JEDEN zabawny obraz!'
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
    theory: [
      'Wyobraź sobie, że pierwsza karta to Król Kier (K♥), a druga to Dama Karo (Q♦).',
      'Bierzemy POSTAĆ z pierwszej karty: Król Artur 👑',
      'I bierzemy AKCJĘ + OBIEKT z drugiej karty: rzuca błękitnym diamentem 💎!',
      'Scena w głowie: Król Artur z całej siły rzuca w dal wielkim błękitnym diamentem!',
      'Gdy widzisz tę scenę, natychmiast odczytujesz: K♥ oraz Q♦!'
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
    theory: [
      'Na stole lądują 3 karty: As Pik (A♠), Walet Trefl (J♣) i 7 Kier (7♥).',
      '• A♠ = Szop Magik',
      '• J♣ = napina i strzela z dębowego łuku',
      '• 7♥ = kieliszek złotego martini Jamesa Bonda',
      'Zobacz to: Szop Magik bierze wielki dębowy łuk i z uśmiechem wystrzeliwuje z niego kieliszek martini!',
      'Zapamiętane w 3 sekundy na całe życie!'
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
    theory: [
      'Brawo! Znasz już sekrety pamięciowych iluzji:',
      '1. 4 żywioły kolorów.',
      '2. Postacie dworskie.',
      '3. Formuła PAO (Postać - Akcja - Obiekt).',
      'Teraz jesteś gotowy na każdą rozgrywkę i grę swobodną!'
    ],
    task: {
      prompt: 'Co wyciąga Szop Magik z cylindra na karcie As Pik?',
      options: ['Świecący cylinder / magiczny rekwizyt', 'Pocisk armatni', 'Kawałek pizzy', 'Szklaną kulę'],
      correct: 0,
      hint: 'Magik zawsze żongluje cylindrem!'
    }
  }
];
