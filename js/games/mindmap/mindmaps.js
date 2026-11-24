/**
 * Baza map myśli dla Ośmiornicy Inki.
 * Każda mapa myśli posiada:
 * - temat centralny (centrum mapy / głowa ośmiornicy)
 * - 4 główne gałęzie tematyczne (macki), każda z kolorem i emotką
 * - listę pod-gałęzi / słów-kluczy dla każdej z odnóg
 */
export const MIND_MAPS = [
  {
    id: 'solar',
    title: 'Układ Słoneczny',
    emoji: '🪐',
    color: '#f59e0b',
    branches: [
      {
        name: 'Planety Skaliste',
        emoji: '🪨',
        color: '#ef4444',
        items: ['Merkury 🌑', 'Wenus 🌋', 'Ziemia 🌍', 'Mars 🔴']
      },
      {
        name: 'Gazowe Olbrzymy',
        emoji: '🌪️',
        color: '#8b5cf6',
        items: ['Jowisz 🌀', 'Saturn 🪐', 'Uran ❄️', 'Neptun 🌊']
      },
      {
        name: 'Małe Ciała',
        emoji: '☄️',
        color: '#06b6d4',
        items: ['Komety 🌠', 'Planetoidy 🪨', 'Pluton ❄️']
      },
      {
        name: 'Gwiazda Centralna',
        emoji: '☀️',
        color: '#facc15',
        items: ['Słońce 🔥', 'Ciepło i Światło ⚡', 'Grawitacja 🧲']
      }
    ]
  },
  {
    id: 'nature',
    title: 'Cztery Pory Roku',
    emoji: '🌳',
    color: '#10b981',
    branches: [
      {
        name: 'Wiosna',
        emoji: '🌸',
        color: '#ec4899',
        items: ['Przebiśniegi 🌼', 'Pąki liści 🌱', 'Powrót ptaków 🐦']
      },
      {
        name: 'Lato',
        emoji: '☀️',
        color: '#eab308',
        items: ['Upał 🏖️', 'Dojrzałe truskawki 🍓', 'Burza z piorunami ⛈️']
      },
      {
        name: 'Jesień',
        emoji: '🍂',
        color: '#f97316',
        items: ['Złote liście 🍁', 'Grzybobranie 🍄', 'Kasztany 🌰']
      },
      {
        name: 'Zima',
        emoji: '❄️',
        color: '#38bdf8',
        items: ['Śnieg i bałwan ⛄', 'Sen zimowy 🐻', 'Mróz na szybie 🧊']
      }
    ]
  },
  {
    id: 'energy',
    title: 'Supermoc Zdrowia',
    emoji: '⚡',
    color: '#06b6d4',
    branches: [
      {
        name: 'Sen i Regeneracja',
        emoji: '💤',
        color: '#6366f1',
        items: ['8 godzin snu 🛌', 'Ciemny pokój 🌑', 'Brak ekranów przed snem 📵']
      },
      {
        name: 'Dobre Paliwo',
        emoji: '🥗',
        color: '#22c55e',
        items: ['Woda mineralna 💧', 'Kolorowe warzywa 🥦', 'Świeże owoce 🍊']
      },
      {
        name: 'Ruch i Siła',
        emoji: '🏃',
        color: '#f59e0b',
        items: ['Szybki spacer 🚶', 'Rozciąganie 🧘', 'Sport z przyjaciółmi ⚽']
      },
      {
        name: 'Spokój Umysłu',
        emoji: '🧠',
        color: '#d946ef',
        items: ['Głęboki oddech 🌬️', 'Uśmiech i śmiech 😊', 'Odpoczynek na trawie 🌿']
      }
    ]
  },
  {
    id: 'ocean',
    title: 'Głębia Oceanu',
    emoji: '🌊',
    color: '#3b82f6',
    branches: [
      {
        name: 'Rafa Koralowa',
        emoji: '🪸',
        color: '#f43f5e',
        items: ['Błazenek Nemo 🐠', 'Kolorowe ukwały 🌸', 'Rozgwiazda ⭐']
      },
      {
        name: 'Ssaki Morskie',
        emoji: '🐋',
        color: '#0ea5e9',
        items: ['Wesoły delfin 🐬', 'Płetwal błękitny 🐳', 'Foka na krze 🦭']
      },
      {
        name: 'Szybcy Łowcy',
        emoji: '🦈',
        color: '#64748b',
        items: ['Rekin żarłacz 🦈', 'Drapieżna orka 🖤', 'Szybki miecznik 🗡️']
      },
      {
        name: 'Mieszkańcy Głębin',
        emoji: '🐙',
        color: '#a855f7',
        items: ['Ośmiornica Inka 🐙', 'Świecąca ryba głębinowa 💡', 'Wielka kałamarnica 🦑']
      }
    ]
  },
  {
    id: 'inventions',
    title: 'Wielkie Wynalazki',
    emoji: '💡',
    color: '#eab308',
    branches: [
      {
        name: 'Łączność i Wiedza',
        emoji: '📡',
        color: '#3b82f6',
        items: ['Pismo na papirusie 📜', 'Druk Gutenberga 📖', 'Globalny Internet 🌐']
      },
      {
        name: 'Podróże i Ruch',
        emoji: '🚀',
        color: '#ef4444',
        items: ['Okrągłe koło 🛞', 'Pociąg parowy 🚂', 'Szybki samolot ✈️']
      },
      {
        name: 'Moc i Światło',
        emoji: '⚡',
        color: '#f59e0b',
        items: ['Ogień w jaskini 🔥', 'Szklana żarówka 💡', 'Bateria elektryczna 🔋']
      },
      {
        name: 'Zdrowie i Życie',
        emoji: '🔬',
        color: '#10b981',
        items: ['Cudowna penicylina 💊', 'Precyzyjny mikroskop 🔬', 'Promienie rentgena 🩻']
      }
    ]
  },
  {
    id: 'music',
    title: 'Kraina Muzyki',
    emoji: '🎵',
    color: '#ec4899',
    branches: [
      {
        name: 'Strunowe Dźwięki',
        emoji: '🎻',
        color: '#8b5cf6',
        items: ['Skrzypce w orkiestrze 🎻', 'Gitara akustyczna 🎸', 'Czarne pianino 🎹']
      },
      {
        name: 'Dęta Energia',
        emoji: '🎺',
        color: '#f97316',
        items: ['Złota trąbka 🎺', 'Drewniany flet 🪈', 'Błyszczący saksofon 🎷']
      },
      {
        name: 'Rytmiczne Uderzenie',
        emoji: '🥁',
        color: '#ef4444',
        items: ['Mocny bęben 🥁', 'Dźwięczne talerze 🔔', 'Drewniane marakasy 🪇']
      },
      {
        name: 'Dusza Piosenki',
        emoji: '🎶',
        color: '#06b6d4',
        items: ['Równy rytm ⏱️', 'Wpadająca w ucho melodia 🎼', 'Ciepła harmonia 🎹']
      }
    ]
  },
  {
    id: 'productivity',
    title: 'Mistrzowski Dzień',
    emoji: '⏰',
    color: '#8b5cf6',
    branches: [
      {
        name: 'Poranny Start',
        emoji: '🌅',
        color: '#f59e0b',
        items: ['Szklanka zimnej wody 💧', 'Zasłane łóżko 🛏️', 'Plan 3 najważniejszych celów 📋']
      },
      {
        name: 'Głęboka Koncentracja',
        emoji: '🎯',
        color: '#ef4444',
        items: ['Praca nad jednym zadaniem 🎯', 'Blok 45 minut skupienia ⏳', 'Wyciszony telefon 🔕']
      },
      {
        name: 'Świeży Reset',
        emoji: '🌿',
        color: '#10b981',
        items: ['Krótki spacer 🚶', 'Głęboki oddech 🍃', 'Chrupiące jabłko 🍏']
      },
      {
        name: 'Wieczorny Spokój',
        emoji: '🌙',
        color: '#6366f1',
        items: ['Podsumowanie sukcesów ⭐', 'Dobra książka 📖', 'Ciepłe światło 🕯️']
      }
    ]
  },
  {
    id: 'cooking',
    title: 'Magia Gotowania',
    emoji: '🍳',
    color: '#f97316',
    branches: [
      {
        name: 'Pachnące Zioła',
        emoji: '🌿',
        color: '#10b981',
        items: ['Świeża bazylia 🍃', 'Aromatyczny czosnek 🧄', 'Pikantny pieprz 🧂']
      },
      {
        name: 'Baza i Energia',
        emoji: '🌾',
        color: '#f59e0b',
        items: ['Włoski makaron 🍝', 'Biały ryż 🍚', 'Chrupiąca bagietka 🥖']
      },
      {
        name: 'Kolorowe Warzywa',
        emoji: '🍅',
        color: '#ef4444',
        items: ['Soczysty pomidor 🍅', 'Słodka marchewka 🥕', 'Żółta papryka 🫑']
      },
      {
        name: 'Słodka Nagroda',
        emoji: '🍰',
        color: '#ec4899',
        items: ['Ciepła szarlotka 🥧', 'Gorzka czekolada 🍫', 'Kremowe lody 🍨']
      }
    ]
  }
];
