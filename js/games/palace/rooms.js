/**
 * Komnaty Pałacu Pamięci (Loci) i bank absurdalnych obiektów.
 */

export const ROOMS = [
  { id: 'gate', name: 'Złota Brama', emoji: '🚪', desc: 'Wielka kuta brama ze złotymi lwami przy wejściu do pałacu.', color: ['#f6d365', '#fda085'] },
  { id: 'hall', name: 'Marmurowy Hol', emoji: '🏛️', desc: 'Lśniąca posadzka w szachownicę i olbrzymi kryształowy żyrandol.', color: ['#a18cd1', '#fbc2eb'] },
  { id: 'fireplace', name: 'Sala Kominkowa', emoji: '🔥', desc: 'Trzaskające płomienie w wielkim kamiennym kominku i miękki dywan.', color: ['#ff9a9e', '#fecfef'] },
  { id: 'library', name: 'Królewska Biblioteka', emoji: '📚', desc: 'Wysokie dębowe regały z drabinami, pachnące starym pergaminem.', color: ['#4facfe', '#00f2fe'] },
  { id: 'wintergarden', name: 'Ogród Zimowy', emoji: '🌿', desc: 'Szklana kopuła, egzotyczne palmy, kwitnące orchidee i śpiew kanarka.', color: ['#43e97b', '#38f9d7'] },
  { id: 'mirrors', name: 'Gabinet Luster', emoji: '🪞', desc: 'Dziesiątki ozdobnych luster odbijających światło setek świec.', color: ['#fa709a', '#fee140'] },
  { id: 'kitchen', name: 'Zamkowa Kuchnia', emoji: '🍳', desc: 'Wielki piec chlebowy, miedziane patelnie i zapach świeżych wypieków.', color: ['#f6d365', '#fda085'] },
  { id: 'treasury', name: 'Skarbiec', emoji: '💎', desc: 'Ciężkie okute skrzynie ze złotem, rubinami i drogocennymi pucharami.', color: ['#a8edea', '#fed6e3'] },
  { id: 'tower', name: 'Wieża Astronomiczna', emoji: '🔭', desc: 'Potężny mosiężny teleskop i mapa gwiazd na sklepieniu wieży.', color: ['#667eea', '#764ba2'] },
  { id: 'balcony', name: 'Balkon Widokowy', emoji: '🌅', desc: 'Kamienna balustrada z widokiem na góry o zachodzie słońca.', color: ['#ff0844', '#ffb199'] },
  { id: 'armory', name: 'Zbrojownia', emoji: '🛡️', desc: 'Błyszczące zbroje rycerskie, herby rodowe i skrzyżowane miecze.', color: ['#6a11cb', '#2575fc'] },
  { id: 'alchemy', name: 'Pracownia Alchemika', emoji: '🧪', desc: 'Bulgoczące retorty z neonowymi miksturami i kłęby fioletowego dymu.', color: ['#b3ffab', '#12fff7'] },
  { id: 'ballroom', name: 'Sala Balowa', emoji: '🎭', desc: 'Błyszczący parkiet, złocone sztukaterie i lewitujące maski weneckie.', color: ['#f093fb', '#f5576c'] },
  { id: 'grotto', name: 'Kryształowa Grota', emoji: '💧', desc: 'Podziemna jaskinia z turkusowym źródełkiem i świecącymi minerałami.', color: ['#30cfd0', '#330867'] },
  { id: 'pantry', name: 'Spiżarnia Cukiernika', emoji: '🧁', desc: 'Półki pełne słoików z miodem, piramid z makaroników i fontanna kakao.', color: ['#ffecd2', '#fcb69f'] },
  { id: 'roof', name: 'Dach Pałacu', emoji: '🏰', desc: 'Wietrzny szczyt z powiewającymi sztandarami i widokiem na całe królestwo.', color: ['#48c6ef', '#6f86d6'] }
];

export const ITEMS = [
  { id: 'banana', name: 'Świecący Banan', emoji: '🍌', action: 'wisi i świeci jaskrawym neonowym światłem', hint: 'Coś żółtego i owocowego, co emituje neonowe światło!' },
  { id: 'hat', name: 'Kapelusz Magika', emoji: '🎩', action: 'lewituje i wyskakują z niego kolorowe gołębie', hint: 'Czarne nakrycie głowy iluzjonisty z gołębiami!' },
  { id: 'elephant', name: 'Słoń na Wrotkach', emoji: '🐘', action: 'robi piruety w różowych wrotkach', hint: 'Olbrzymie szare zwierzę w różowych wrotkach!' },
  { id: 'pizza', name: 'Płonąca Pizza', emoji: '🍕', action: 'kręci się w powietrzu jak ogniste frisbee', hint: 'Włoski przysmak kręcący się w płomieniach!' },
  { id: 'guitar', name: 'Gitara Elektryczna', emoji: '🎸', action: 'sama gra głośne rockowe solo', hint: 'Instrument rockowy robiący mnóstwo hałasu!' },
  { id: 'rocket', name: 'Rakieta Kosmiczna', emoji: '🚀', action: 'startuje z hukiem, zostawiając obłok dymu', hint: 'Pojazd kosmiczny buchający białym dymem!' },
  { id: 'crown', name: 'Korona Królewska', emoji: '👑', action: 'lśni złotem i jest wysadzana rubinami', hint: 'Złoty symbol władcy ze świecącymi klejnotami!' },
  { id: 'frog', name: 'Żaba w Okularach', emoji: '🐸', action: 'czyta gazetę i głośno rechocze', hint: 'Zielony płaz w okularach czytający wiadomości!' },
  { id: 'diamond', name: 'Błękitny Diament', emoji: '💎', action: 'strzela promieniami błękitnego lasera', hint: 'Twardy, niebieski kryształ świecący laserem!' },
  { id: 'avocado', name: 'Rapujące Awokado', emoji: '🥑', action: 'trzyma mikrofon i rymuje w rytm hip-hopu', hint: 'Zielony owoc z wielką pestką, który nawija rymy!' },
  { id: 'milk', name: 'Mleczny Gejzer', emoji: '🥛', action: 'bucha strumieniem spienionego mleka aż po sufit', hint: 'Biały napój wytryskujący w górę!' },
  { id: 'baguette', name: 'Ogromna Bagietka', emoji: '🥖', action: 'służy jako szpada i głośno chrupie', hint: 'Długie francuskie pieczywo z chrupiącą skórką!' },
  { id: 'cheese', name: 'Ser na Sprężynach', emoji: '🧀', action: 'skacze po meblach i pachnie serem gouda', hint: 'Żółty przysmak z dziurami skaczący jak piłka!' },
  { id: 'apple', name: 'Złote Jabłko', emoji: '🍎', action: 'podskakuje i śpiewa operowym głosem', hint: 'Owoc znany z mitologii, który ma operowy głos!' },
  { id: 'unicorn', name: 'Jednorożec', emoji: '🦄', action: 'pije herbatkę z porcelanowej filiżanki', hint: 'Magiczny koń z rogiem popijający herbatę!' },
  { id: 'balloon', name: 'Kosmiczny Balon', emoji: '🎈', action: 'pulsuje wszystkimi kolorami tęczy', hint: 'Lekki nadmuchiwany przedmiot prosto z kosmosu!' },
  { id: 'sushi', name: 'Lewitujące Sushi', emoji: '🍣', action: 'pływa w powietrzu jak mała rybka', hint: 'Japońska przekąska z łososiem latająca w powietrzu!' },
  { id: 'bicycle', name: 'Cytrynowy Rower', emoji: '🚲', action: 'jeździ sam na kołach z plastrów cytryny', hint: 'Pojazd dwukołowy z kołami z kwaśnych cytrusów!' },
  { id: 'drum', name: 'Złoty Bębenek', emoji: '🥁', action: 'sam wybija żywiołowy rytm karnawału', hint: 'Instrument perkusyjny grający sambę!' },
  { id: 'flamingo', name: 'Różowy Flaming', emoji: '🦩', action: 'stoi na jednej nodze w wielkich kaloszach', hint: 'Długonogi różowy ptak w żółtych kaloszach!' },
  { id: 'icecream', name: 'Góra Lodowa z Wanilii', emoji: '🍦', action: 'nigdy się nie topi i pachnie wanilią', hint: 'Zimny letni deser wielkości małej góry!' },
  { id: 'duck', name: 'Kaczuszka Wikinga', emoji: '🦆', action: 'nosi rogaty hełm i macha miniaturowym toporkiem', hint: 'Żółta gumowa kaczka gotowa do morskiej wyprawy!' },
  { id: 'cactus', name: 'Tańczący Kaktus', emoji: '🌵', action: 'wije się w tańcu z marakasami w dłoniach', hint: 'Pustynna roślina z kolcami grająca na marakasach!' },
  { id: 'clock', name: 'Tykanie z Kukułką', emoji: '⏰', action: 'budzik dzwoni i wyrzuca małą złotą kukułkę', hint: 'Głośne urządzenie odmierzające czas o poranku!' }
];

export function getRoomById(id) {
  return ROOMS.find(r => r.id === id) || ROOMS[0];
}

export function getItemById(id) {
  return ITEMS.find(i => i.id === id) || ITEMS[0];
}
