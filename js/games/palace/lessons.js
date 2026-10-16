/**
 * Lekcje szkoleniowe Pałacu Pamięci.
 * Tygrysek Leon uczy metody Loci krok po kroku, w spokojnym tempie i z humorem.
 */

export const LESSONS = [
  {
    id: 1,
    title: 'Pierwsze dwa kroki',
    kicker: 'Lekcja 1 · Czym jest Pałac Pamięci?',
    desc: 'Odkryj tajemnicę starożytnych oratorów. Twój mózg myśli przestrzenią, a nie suchymi słowami!',
    intro: [
      'Rawrr! Cześć! Jestem Tygrysek Leon 🐯 i zabiorę Cię do Twojego własnego Pałacu Pamięci.',
      'Czy wiesz, że Twój mózg pamięta drogę do domu nawet po latach, ale zapomina listę 5 zakupów w 5 minut? Mamy w głowie genialny GPS!',
      'Metoda Loci (z łaciny: „miejsca”) polega na tym, że zamiast wkuwać słowa, wchodzimy do pałacu i kładziemy w pokojach zabawne, niezwykłe przedmioty.',
      'Zacznijmy powoli od zaledwie 2 komnat: Złotej Bramy i Marmurowego Holu. Zobacz, jakie to proste i naturalne!'
    ],
    loci: [
      {
        roomId: 'gate',
        itemId: 'banana',
        story: 'Na szczycie Złotej Bramy wisi olbrzymi Świecący Banan 🍌. Jest tak jasny, że oślepia strażników!',
        hint: 'Spójrz w górę bramy – co tam świeci żółtym blaskiem?'
      },
      {
        roomId: 'hall',
        itemId: 'hat',
        story: 'Wchodzisz do Holu, a tam na środku lewituje czarny Kapelusz Magika 🎩, z którego bez przerwy wylatują białe gołębie!',
        hint: 'Co krąży w powietrzu nad marmurową posadzką?'
      }
    ],
    review: 'Zapamiętałeś: Złota Brama ➡️ Świecący Banan, Marmurowy Hol ➡️ Kapelusz Magika.',
    tigerCongrats: 'Genialnie! Właśnie przeszedłeś przez swoje pierwsze 2 loci w Pałacu Pamięci! 🏆'
  },
  {
    id: 2,
    title: 'Moc Absurdu i Ruchu',
    kicker: 'Lekcja 2 · 3 komnaty',
    desc: 'Nasz mózg błyskawicznie zapomina nudne rzeczy, ale uwielbia humor, ruch i komizm.',
    intro: [
      'Wspaniale Ci poszło! Czas na najważniejszą zasadę zapamiętywania: ZASADĘ ABSURDU ⚡',
      'Gdybyś wyobraził sobie zwykły ołówek leżący na stole – zapomnisz go za godzinę. Ale gdy ten ołówek skacze na jednej nodze i krzyczy – zostanie w głowie na zawsze!',
      'Im obraz jest bardziej komiczny, przerysowany i dynamiczny, tym mocniej angażuje neurony.',
      'Odwiedzimy 3 komnaty: Salę Kominkową, Kuchnię i Spiżarnię. Wyobrażaj sobie te sceny bardzo wyraźnie!'
    ],
    loci: [
      {
        roomId: 'fireplace',
        itemId: 'elephant',
        story: 'W Sali Kominkowej na wielkiej kanapie Słoń na Różowych Wrotkach 🐘 kręci piruety i gasi kominek lemoniadą!',
        hint: 'Kto robił piruety na kanapie przy kominku?'
      },
      {
        roomId: 'kitchen',
        itemId: 'pizza',
        story: 'W Kuchni z pieca wylatuje Płonąca Pizza 🍕 i wiruje w powietrzu jak ogniste UFO!',
        hint: 'Jaka gorąca włoska potrawa fruwa po kuchni?'
      },
      {
        roomId: 'pantry',
        itemId: 'guitar',
        story: 'W Spiżarni na półce z dżemami stoi Gitara Elektryczna 🎸 i sama rzęzi głośne rockowe solo!',
        hint: 'Jaki instrument hałasuje między słoikami w spiżarni?'
      }
    ],
    review: 'Kominek ➡️ Słoń na wrotkach, Kuchnia ➡️ Płonąca pizza, Spiżarnia ➡️ Gitara rockowa.',
    tigerCongrats: 'Brawo! Zasada absurdu działa cuda – widzisz te obrazy jak na filmie! 🎬'
  },
  {
    id: 3,
    title: 'Zawsze Ta Sama Ścieżka',
    kicker: 'Lekcja 3 · 4 komnaty',
    desc: 'W Pałacu Pamięci kluczowy jest stały kierunek. Zawsze poruszaj się w tę samą stronę!',
    intro: [
      'Rozwijasz skrzydła! Dziś poznasz ZASADĘ ŚCIEŻKI 🧭',
      'Wyobraź sobie, że wchodzisz do pokoju. Zawsze omiataj go wzrokiem w stałym porządku – na przykład zgodnie z ruchem wskazówek zegara: od lewej do prawej.',
      'Dzięki temu nigdy nie pominiesz żadnego przedmiotu ani nie pomylisz ich kolejności.',
      'Przejdźmy trasę przez 4 kolejne komnaty pałacu: Bibliotekę, Ogród Zimowy, Gabinet Luster i Balkon.'
    ],
    loci: [
      {
        roomId: 'library',
        itemId: 'rocket',
        story: 'W Bibliotece między starymi książkami startuje mała Rakieta Kosmiczna 🚀, zostawiając chmurę białego dymu!',
        hint: 'Co wystrzeliło z hukiem z regału z książkami?'
      },
      {
        roomId: 'wintergarden',
        itemId: 'frog',
        story: 'W Ogrodzie Zimowym na liściu wielkiej palmy siedzi Żaba w Okularach 🐸 i z powagą czyta poranne wiadomości!',
        hint: 'Kto czyta gazetę w egzotycznym ogrodzie?'
      },
      {
        roomId: 'mirrors',
        itemId: 'diamond',
        story: 'W Gabinecie Luster na postumencie leży wielki Błękitny Diament 💎 i strzela laserami we wszystkie lustra naraz!',
        hint: 'Jaki drogocenny niebieski kamień odbija się w lustrach?'
      },
      {
        roomId: 'balcony',
        itemId: 'balloon',
        story: 'Wychodzisz na Balkon Widokowy, a nad nim unosi się gigantyczny Tęczowy Balon 🎈 oświetlony zachodem słońca!',
        hint: 'Co szybuje w powietrzu nad pałacowym balkonem?'
      }
    ],
    review: 'Biblioteka ➡️ Rakieta, Ogród ➡️ Żaba w okularach, Lustra ➡️ Diament, Balkon ➡️ Balon.',
    tigerCongrats: 'Świetnie zachowana kolejność! Zbudowałeś solidną 4-punktową ścieżkę pamięciową! 🌟'
  },
  {
    id: 4,
    title: 'Lista Zakupów bez Kartki',
    kicker: 'Lekcja 4 · 5 komnat w praktyce',
    desc: 'Czas na praktyczny życiowy test! Zapamiętasz 5 produktów ze sklepu bez zapisywania.',
    intro: [
      'Czy zdarzyło Ci się pójść do sklepu, zapomnieć kartki i wrócić bez połowy zakupów? Od dziś to przeszłość! 🛒',
      'Teraz wykorzystamy Pałac Pamięci do czegoś w 100% praktycznego: 5-elementowej listy zakupów.',
      'Nasze produkty to: Awokado, Mleko, Bagietka, Żółty Ser i Soczyste Jabłka.',
      'Umieścimy je w 5 komnatach, wplatając w każdą z nich zabawną akcję. Chodźmy!'
    ],
    loci: [
      {
        roomId: 'gate',
        itemId: 'avocado',
        story: 'Przy Złotej Bramie stoi Rapujące Awokado 🥑 z mikrofonem i wielkim złotym łańcuchem na szyi!',
        hint: 'Jaki zielony owoc rymuje przy bramie wejściowej?'
      },
      {
        roomId: 'hall',
        itemId: 'milk',
        story: 'W Marmurowym Holu nagle wybucha fontanna – to Mleczny Gejzer 🥛 chlapiący na kryształowy żyrandol!',
        hint: 'Jaki biały napój tryska w holu jak gejzer?'
      },
      {
        roomId: 'fireplace',
        itemId: 'baguette',
        story: 'W Sali Kominkowej zamiast polan drewna w kominku leży ogromna chrupiąca Bagietka 🥖 i pachnie świeżym chlebem!',
        hint: 'Jakie francuskie pieczywo grzeje się w kominku?'
      },
      {
        roomId: 'kitchen',
        itemId: 'cheese',
        story: 'W Kuchni wielki kawałek Żółtego Sera 🧀 na sprężynach skacze po miedzianych patelniach!',
        hint: 'Co żółtego i dziurawego skacze po kuchennym blacie?'
      },
      {
        roomId: 'treasury',
        itemId: 'apple',
        story: 'W Skarbcu w otwartej skrzyni ze złotem leży Złote Jabłko 🍎 i śpiewa czystym operowym głosem!',
        hint: 'Jaki owoc śpiewa w skarbcu pełnym kosztowności?'
      }
    ],
    review: 'Brama ➡️ Awokado, Hol ➡️ Mleko, Kominek ➡️ Bagietka, Kuchnia ➡️ Ser, Skarbiec ➡️ Jabłko.',
    tigerCongrats: 'Zakupy zrobione bez ani jednej notatki! Widzisz, jakie to praktyczne? 🛍️'
  },
  {
    id: 5,
    title: 'Zaangażuj Wszystkie Zmysły',
    kicker: 'Lekcja 5 · 6 komnat',
    desc: 'Najpotężniejsza pamięć to ta, która czuje zapach, słyszy dźwięk i dotyka faktury.',
    intro: [
      'Wiesz, dlaczego zapach ciasta u babci przypomina Ci dzieciństwo w ułamku sekundy? Węch i słuch to autostrady do pamięci emocjonalnej! 👃👂',
      'W tej lekcji dodamy do każdego obrazu bodziec zmysłowy: chłód lodu, zapach wanilii, dźwięk dzwonków czy ciężar złota.',
      'Odwiedzimy 6 komnat Pałacu Pamięci. Zamykaj na chwilę oczy i naprawdę POCZUJ każdy przedmiot!'
    ],
    loci: [
      {
        roomId: 'gate',
        itemId: 'crown',
        story: 'Złota Brama zwieńczona jest ciężką Koroną Królewską 👑. Poczuj chłód metalu i dotknij ostrych rubinów!',
        hint: 'Co ciężkiego, lśniącego i królewskiego spoczywa na bramie?'
      },
      {
        roomId: 'hall',
        itemId: 'bicycle',
        story: 'Przez Hol pędzi Cytrynowy Rower 🚲 na kołach z cytryn. Poczuj intensywny, kwaskowaty zapach owoców i usłysz terkot łańcucha!',
        hint: 'Jaki cytrusowy pojazd pachnie świeżą cytryną?'
      },
      {
        roomId: 'library',
        itemId: 'drum',
        story: 'W Bibliotece Złoty Bębenek 🥁 sam dudni energetycznym rytmem. Poczuj wibracje w podłodze i powietrzu!',
        hint: 'Jaki instrument wibruje i dudni między książkami?'
      },
      {
        roomId: 'wintergarden',
        itemId: 'flamingo',
        story: 'W Ogrodzie Zimowym stoi Różowy Flaming 🦩 w wielkich żółtych kaloszach i pluszcze w fontannie!',
        hint: 'Jaki różowy ptak stoi w wodzie w kaloszach?'
      },
      {
        roomId: 'mirrors',
        itemId: 'icecream',
        story: 'W Gabinecie Luster stoi Góra Lodowa z Wanilii 🍦. Poczuj lodowaty powiew i słodki aromat wanilii!',
        hint: 'Jaki olbrzymi, mroźny deser chłodzi salę luster?'
      },
      {
        roomId: 'tower',
        itemId: 'clock',
        story: 'W Wieży Astronomicznej bije stary zegar z Tykaniem i Kukułką ⏰. Słyszysz głośne: TIK-TAK, TIK-TAK i kukanie ptaszka!',
        hint: 'Jakie urządzenie głośno tyka i kuka na wieży?'
      }
    ],
    review: 'Brama ➡️ Korona, Hol ➡️ Rower, Biblioteka ➡️ Bębenek, Ogród ➡️ Flaming, Lustra ➡️ Lody, Wieża ➡️ Zegar.',
    tigerCongrats: 'Prawdziwy multisensoryczny majstersztyk! Twój pałac tętni dźwiękami i zapachami! 🎨'
  },
  {
    id: 6,
    title: 'Sztuka Przemawiania (7 punktów)',
    kicker: 'Lekcja 6 · 7 komnat jak Cyceron',
    desc: 'Opanuj metodę rzymskich mówców. Wygłoś 7-punktowe wystąpienie bez ani jednej kartki w dłoni.',
    intro: [
      'W starożytnym Rzymie Cyceron wygłaszał wielogodzinne mowy przed senatem bez żadnych notatek. Jak to robił? 🏛️',
      'Przed przemową spacerował po swoim pałacu, umieszczając kluczowe argumenty w kolejnych pokojach. Gdy mówił, po prostu szedł tą ścieżką w myślach!',
      'Teraz zrobimy to samo dla 7-punktowej mowy. 7 komnat, 7 wyrazistych kotwic.',
      'Skup się i idź spokojnie krok za krokiem. Jestem z Ciebie dumny!'
    ],
    loci: [
      {
        roomId: 'gate',
        itemId: 'hat',
        story: 'Punkt 1 (Wstęp): Przy Złotej Bramie kłania się Kapelusz Magika 🎩 – symbol zaskakującego początku wystąpienia!',
        hint: 'Co symbolizuje magiczny wstęp przy bramie?'
      },
      {
        roomId: 'hall',
        itemId: 'rocket',
        story: 'Punkt 2 (Wielka Wizja): W Holu startuje Rakieta 🚀 ku niebu – pokazujesz słuchaczom ambitny cel!',
        hint: 'Jaki kosmiczny obiekt wyznacza wielki cel w holu?'
      },
      {
        roomId: 'fireplace',
        itemId: 'pizza',
        story: 'Punkt 3 (Problem/Płomień): W Sali Kominkowej płonie Pizza 🍕 – mówisz o palącym problemie do rozwiązania!',
        hint: 'Jaka ognista potrawa symbolizuje problem w kominku?'
      },
      {
        roomId: 'library',
        itemId: 'frog',
        story: 'Punkt 4 (Dane i Fakty): W Bibliotece mądra Żaba w Okularach 🐸 przedstawia twarde dowody z książek!',
        hint: 'Kto analizuje dane w okularach wśród książek?'
      },
      {
        roomId: 'wintergarden',
        itemId: 'avocado',
        story: 'Punkt 5 (Zdrowie i Rozwój): W Ogrodzie Rapujące Awokado 🥑 głosi odnowę i dobrą energię!',
        hint: 'Jaki owoc rapuje o rozwoju w ogrodzie?'
      },
      {
        roomId: 'treasury',
        itemId: 'diamond',
        story: 'Punkt 6 (Wartość/Zysk): W Skarbcu lśni Diament 💎 – dowód, ile zyskają słuchacze!',
        hint: 'Co cennego i błyszczącego leży w skarbcu?'
      },
      {
        roomId: 'balcony',
        itemId: 'unicorn',
        story: 'Punkt 7 (Zakończenie z klasą): Na Balkonie stoi Jednorożec 🦄 z herbatą – spektakularny, niezapomniany finał!',
        hint: 'Jakie mityczne zwierzę pije herbatę na balkonie na pożegnanie?'
      }
    ],
    review: '7 punktów przemowy: Kapelusz ➡️ Rakieta ➡️ Pizza ➡️ Żaba ➡️ Awokado ➡️ Diament ➡️ Jednorożec.',
    tigerCongrats: 'Rzymski Senat wstałby do owacji na stojąco! Jesteś gotowy na każdą prezentację! 🎓'
  },
  {
    id: 7,
    title: 'Wielka Trasa 8 Komnat',
    kicker: 'Lekcja 7 · 8 komnat',
    desc: 'Wydłużamy ścieżkę do 8 komnat. Płynny spacer, pewność i automatyzm skojarzeń.',
    intro: [
      'Twoja pamięć przestrzenna jest już niesamowicie wytrenowana! 🔥',
      'Teraz sprawdzimy, jak radzisz sobie z dłuższą trasą 8 komnat. Zwróć uwagę, jak naturalnie jedna komnata prowadzi do drugiej.',
      'Gdy wychodzisz z Biblioteki, przed sobą masz Ogród; za Ogrodem wchodzisz do Skarbca... Twój mózg tworzy spójną mapę 3D!',
      'Gotowy na 8 przystanków? Weź głęboki oddech i ruszamy!'
    ],
    loci: [
      {
        roomId: 'gate',
        itemId: 'banana',
        story: 'Złota Brama rozświetlona jest przez wielki Świecący Banan 🍌.',
        hint: 'Co świeci jasno przy wejściu?'
      },
      {
        roomId: 'hall',
        itemId: 'drum',
        story: 'W Marmurowym Holu stoi Złoty Bębenek 🥁 i wygrywa wesoły marsz na powitanie.',
        hint: 'Jaki instrument bębni w holu?'
      },
      {
        roomId: 'fireplace',
        itemId: 'elephant',
        story: 'W Sali Kominkowej tańczy Słoń na Różowych Wrotkach 🐘.',
        hint: 'Kto jeździ na wrotkach przy kominku?'
      },
      {
        roomId: 'library',
        itemId: 'guitar',
        story: 'W Bibliotece rockowa Gitara 🎸 brzęczy na drewnianym pulpicie.',
        hint: 'Co gra rocka na pulpicie bibliotecznym?'
      },
      {
        roomId: 'kitchen',
        itemId: 'cheese',
        story: 'W Kuchni sprężynujący Ser Żółty 🧀 odbija się od sufitu.',
        hint: 'Co sprężynuje w kuchni pod sufitem?'
      },
      {
        roomId: 'treasury',
        itemId: 'crown',
        story: 'W Skarbcu na aksamitnej poduszce błyszczy rubinowa Korona 👑.',
        hint: 'Co królewskiego spoczywa na poduszce w skarbcu?'
      },
      {
        roomId: 'tower',
        itemId: 'rocket',
        story: 'Z Wieży Astronomicznej w stronę gwiazd leci Rakieta 🚀.',
        hint: 'Co leci w stronę gwiazd z wieży?'
      },
      {
        roomId: 'roof',
        itemId: 'duck',
        story: 'Na szczycie Dachu stoi dumna Kaczuszka Wikinga 🦆 w rogatym hełmie i patrzy na horyzont!',
        hint: 'Kto w hełmie wikinga pilnuje dachu pałacu?'
      }
    ],
    review: 'Brama ➡️ Banan, Hol ➡️ Bębenek, Kominek ➡️ Słoń, Biblioteka ➡️ Gitara, Kuchnia ➡️ Ser, Skarbiec ➡️ Korona, Wieża ➡️ Rakieta, Dach ➡️ Kaczka.',
    tigerCongrats: '8 komnat pokonane bez zadyszki! Twoja mentalna mapa jest krystalicznie czysta! 🗺️'
  },
  {
    id: 8,
    title: 'Egzamin Mistrzowski (10 Komnat)',
    kicker: 'Lekcja 8 · Wielki Finał Szkolenia',
    desc: 'Kompletna trasa przez cały Pałac Królewski! 10 komnat, 10 niezwykłych obiektów, tytuł Mistrza Loci.',
    intro: [
      'Oto nadszedł wielki moment – Egzamin Mistrza Pałacu Pamięci! 👑',
      'Przejdziesz kompletną, 10-punktową trasę od Złotej Bramy aż po sam Szczyt Pałacu.',
      'Po ukończeniu tej lekcji będziesz potrafił zapamiętać dowolną listę 10 rzeczy w ułamku chwili – numery, zadania, przemówienia, daty!',
      'Zaufaj swojej wyobraźni. Spaceruj spokojnie. Tygrysek Leon kibicuje z całych sił! 🐯✨'
    ],
    loci: [
      {
        roomId: 'gate',
        itemId: 'banana',
        story: 'Locus 1 (Brama): Świecący neonowy Banan 🍌.',
        hint: 'Locus 1: Co rozświetla bramę wejściową?'
      },
      {
        roomId: 'hall',
        itemId: 'hat',
        story: 'Locus 2 (Hol): Lewitujący Kapelusz Magika 🎩 z gołębiami.',
        hint: 'Locus 2: Co lewituje w marmurowym holu?'
      },
      {
        roomId: 'fireplace',
        itemId: 'elephant',
        story: 'Locus 3 (Kominek): Słoń na Różowych Wrotkach 🐘 kręci piruety.',
        hint: 'Locus 3: Kto tańczy przy kominku?'
      },
      {
        roomId: 'library',
        itemId: 'frog',
        story: 'Locus 4 (Biblioteka): Żaba w Okularach 🐸 czyta encyklopedię.',
        hint: 'Locus 4: Kto czyta w okularach w bibliotece?'
      },
      {
        roomId: 'wintergarden',
        itemId: 'flamingo',
        story: 'Locus 5 (Ogród Zimowy): Różowy Flaming 🦩 w kaloszach.',
        hint: 'Locus 5: Jaki ptak stoi w ogrodzie w kaloszach?'
      },
      {
        roomId: 'mirrors',
        itemId: 'diamond',
        story: 'Locus 6 (Gabinet Luster): Błękitny Diament 💎 strzelający laserem.',
        hint: 'Locus 6: Co błyszczy w lustrach?'
      },
      {
        roomId: 'kitchen',
        itemId: 'pizza',
        story: 'Locus 7 (Kuchnia): Wirująca w ogniu Płonąca Pizza 🍕.',
        hint: 'Locus 7: Co fruwa w kuchni?'
      },
      {
        roomId: 'treasury',
        itemId: 'crown',
        story: 'Locus 8 (Skarbiec): Złota Korona 👑 z rubinami.',
        hint: 'Locus 8: Co leży w skarbcu na poduszce?'
      },
      {
        roomId: 'tower',
        itemId: 'rocket',
        story: 'Locus 9 (Wieża): Startująca ku gwiazdom Rakieta 🚀.',
        hint: 'Locus 9: Co leci ku gwiazdom z wieży?'
      },
      {
        roomId: 'roof',
        itemId: 'unicorn',
        story: 'Locus 10 (Dach): Magiczny Jednorożec 🦄 pijący herbatkę z widokiem na królestwo.',
        hint: 'Locus 10: Jakie magiczne stworzenie czeka na szczycie dachu?'
      }
    ],
    review: '10 Loci Mistrza: Banan ➡️ Kapelusz ➡️ Słoń ➡️ Żaba ➡️ Flaming ➡️ Diament ➡️ Pizza ➡️ Korona ➡️ Rakieta ➡️ Jednorożec.',
    tigerCongrats: 'MISTRZ PAŁACU PAMIĘCI! Zdobyłeś najwyższy laur oratorski! Leon ryczy z dumy i zachwytu! 🐯🏆👑'
  }
];
