const fs = require('fs');
const path = require('path');

// High quality translation map for the 200 theories
const theoriesMap = {
  "W każdym roku istnieje jeden magiczny dzień tygodnia, zwany Kotwicą Roku (Doomsday).":
    "In every year, there is one magical day of the week known as the Year Anchor (Doomsday).",
  "Spójrz, jak genialnie zbudowany jest kalendarz:":
    "Look at how brilliantly the calendar is designed:",
  "W każdym parzystym miesiącu numer miesiąca to dokładnie ten sam dzień kotwiczny:":
    "In every even-numbered month, the month number matches the anchor date exactly:",
  "• 10 października (10.10)": "• October 10 (10/10)",
  "Dla miesięcy nieparzystych mamy łatwe powiedzonko:":
    "For odd-numbered months, we have an easy catchphrase:",
  "„Pracuję od 9 do 5 na stacji 7/11”:":
    '"Working 9 to 5 (9/5 & 5/9) at 7-Eleven (7/11 & 11/7)":',
  "• 9 maja (9.05) oraz 5 września (5.09) → zamieniamy 9 i 5!":
    "• May 9 (5/9) and September 5 (9/5) → swap 9 and 5!",
  "Do tego dochodzą pierwsze trzy miesiące roku:":
    "On top of that come the first three months of the year:",
  "• Styczeń: 3 stycznia (3.01) w zwykłym roku (lub 4.01 w przestępnym) – pamiętamy: 3 dni odpoczynku po sylwestrze!":
    "• January: Jan 3 (or Jan 4 in leap years) – remember: 3 days of rest after New Year's Eve!",
  "• Luty: ZAWSZE OSTATNI DZIEŃ LUTEGO (28.02, a w przestępnym 29.02).":
    "• February: ALWAYS THE LAST DAY OF FEBRUARY (Feb 28, or Feb 29 in leap years).",
  "• Marzec: 14 marca (3.14 to słynny Dzień Liczby Pi!).":
    "• March: March 14 (3/14 is the celebrated Pi Day!).",
  "Chcesz wiedzieć, jaki dzień tygodnia to np. 15 sierpnia 2026:":
    "Want to know what weekday August 15, 2026 falls on:",
  "1. Znasz kotwicę sierpnia: to bliźniak 8 sierpnia (8.08).":
    "1. You know August's anchor: it is the twin date August 8 (8/8).",
  "2. Wiesz, że w 2026 roku kotwica to SOBOTA (6).":
    "2. You know that in 2026, the anchor day is SATURDAY (6).",
  "3. Liczymy różnicę dni: 15 - 8 = 7 dni. Pełne 7 dni to dokładnie tydzień, więc 15 sierpnia to również SOBOTA!":
    "3. Count the day difference: 15 - 8 = 7 days. A full 7 days is an exact week, so August 15 is also SATURDAY!",
  "Dlaczego to działa w każdym roku?":
    "Why does this work for every single year?",
  "Zwykły rok ma 365 dni = 52 pełne tygodnie + 1 dzień zapasu. Dlatego każdy zwykły rok przesuwa kotwicę o dokładnie +1 dzień!":
    "A standard year has 365 days = 52 full weeks + 1 extra day. That is why each standard year shifts the anchor by +1 day!",
  "Rok przestępny (ma 29 lutego) przesuwa kotwicę o +2 dni!":
    "A leap year (with Feb 29) shifts the anchor by +2 days!",
  "JAK TO LICZYĆ W PAMIĘCI?":
    "HOW TO CALCULATE IN YOUR HEAD?",
  "Naszą domową bazą jest rok 2026 = SOBOTA (6):":
    "Our baseline home year is 2026 = SATURDAY (6):",
  "• Rok 2028: (przestępny! +2 dni) → Niedziela + 2 = WTOREK (2)!":
    "• Year 2028: (leap year! +2 days) → Sunday + 2 = TUESDAY (2)!",
  "• Rok 2025: (-1 rok w tył) → Sobota - 1 = PIĄTEK (5)!":
    "• Year 2025: (-1 year back) → Saturday - 1 = FRIDAY (5)!",
  "• Rok 2035: różnica 9 lat + 2 lata przestępne (2028, 2032) = 11 dni przesunięcia. 11 mod 7 = 4 dni w przód od Soboty = ŚRODA (3)!":
    "• Year 2035: 9-year difference + 2 leap years = 11 days offset. 11 mod 7 = 4 days forward from Saturday = WEDNESDAY (3)!",
  "• Wiek XXI (lata 2000–2099): baza stulecia to WTOREK (2, łatwo zapamiętać: rok 2000 ma dwójkę na początku)!":
    "• 21st Century (2000–2099): century anchor is TUESDAY (2, easy to recall: year 2000 starts with 2)!",
  "Brawo! Masz w głowie kompletny, wieczysty kalendarz na dowolny rok:":
    "Bravo! You now hold a complete, perpetual calendar in your head for any year:",
  "1. Znasz kotwice miesięcy: 4.04, 6.06, 8.08, 10.10, 12.12, 9.05, 5.09, 11.07, 7.11, 14.03, 28.02.":
    "1. You know month anchors: 4/4, 6/6, 8/8, 10/10, 12/12, 5/9, 9/5, 7/11, 11/7, 3/14, 2/28.",
  "2. Znasz bazę 2026 (Sobota) i potrafisz przesunąć kotwicę na dowolny rok (+1 na rok, +2 na przestępny).":
    "2. You know the 2026 base (Saturday) and can shift the anchor to any year (+1 standard, +2 leap).",
  "3. Dodajesz lub odejmujesz różnicę dni do najbliższej kotwicy!":
    "3. Add or subtract the day difference to the nearest anchor!",
  "Po co uczyć się zapamiętywania kart? To nie tylko wspaniała sztuczka, którą zachwycisz kolegów w szkole i rodzinę przy stole!":
    "Why learn to memorize playing cards? It is not just a dazzling trick to amaze your friends and family!",
  "System PAO (karty i sekwencje) to najpotężniejsza technika do zapamiętywania długich ciągów kolejnych kroków, przepisów, procedur i list!":
    "The PAO system (cards & sequences) is the most powerful technique for memorizing long sequences of steps, recipes, procedures, and lists!",
  "Zaczynamy od 4 magicznych żywiołów talii:":
    "We start with the 4 magical suits of the deck:",
  "• PIK (♠) – tajemniczy, czarny świat magów, iluzjonistów i nocy.":
    "• SPADES (♠) – mysterious, black realm of magicians, illusionists, and night.",
  "• KIER (♥) – czerwone serca, dzielni rycerze, królowie, ogień i przygoda.":
    "• HEARTS (♥) – red hearts, brave knights, kings, fire, and adventure.",
  "• KARO (♦) – diamenty, złoto, bogactwo, skrzynie skarbów i piraci.":
    "• DIAMONDS (♦) – diamonds, gold, wealth, treasure chests, and pirates.",
  "• TREFL (♣) – zielone liście, las, natura, druidzi i leśni łucznicy.":
    "• CLUBS (♣) – green leaves, forest, nature, druids, and woodland archers.",
  "Karty dworskie najłatwiej zamienić na wyrazistych bohaterów:":
    "Court cards are easiest to turn into vivid heroes:",
  "• Król Kier (K♥) → Król Artur w złotej koronie ze świecącym mieczem Excalibur 👑":
    "• King of Hearts (K♥) → King Arthur in golden crown with glowing sword Excalibur 👑",
  "• Dama Karo (Q♦) → Królowa Kleopatra rzucająca lśniącym błękitnym diamentem 💎":
    "• Queen of Diamonds (Q♦) → Queen Cleopatra tossing a brilliant blue diamond 💎",
  "• Walet Trefl (J♣) → Robin Hood strzelający z potężnego dębowego łuku 🏹":
    "• Jack of Clubs (J♣) → Robin Hood drawing a mighty oak longbow 🏹",
  "• As Pik (A♠) → Szop Magik wyciągający lśniący cylinder z kapelusza 🦝":
    "• Ace of Spades (A♠) → Bandit the Magician pulling a glowing top hat from nowhere 🦝",
  "System PAO (Person - Action - Object) przypisuje do każdej karty:":
    "The PAO system (Person - Action - Object) assigns to each card:",
  "1. POSTAĆ (kto to jest?)": "1. PERSON (who are they?)",
  "2. AKCJĘ (co robi?)": "2. ACTION (what are they doing?)",
  "3. OBIEKT (czym się bawi lub czym rzuca?)": "3. OBJECT (what prop do they use?)",
  "Dzięki temu jedna karta daje postać, druga jej akcję, a trzecia przedmiot.":
    "Thanks to this, the 1st card gives person, 2nd gives action, and 3rd gives object.",
  "Wyobraź sobie parę kart: pierwsza to Król Kier (K♥), a druga to Dama Karo (Q♦).":
    "Picture a pair of cards: the first is King of Hearts (K♥), second is Queen of Diamonds (Q♦).",
  "Bierzemy POSTAĆ z pierwszej karty: Król Artur 👑":
    "We take PERSON from the 1st card: King Arthur 👑",
  "I bierzemy AKCJĘ + OBIEKT z drugiej karty: rzuca błękitnym diamentem 💎!":
    "And we take ACTION + OBJECT from the 2nd card: tossing a blue diamond 💎!",
  "Scena w głowie: Król Artur bierze zamach i z całej siły ciska wielkim diamentem w dal!":
    "Mental movie: King Arthur winds up and hurls a massive diamond with all his might!",
  "Na stole lądują 3 karty: As Pik (A♠), Walet Trefl (J♣) i 7 Kier (7♥).":
    "On the table land 3 cards: Ace of Spades (A♠), Jack of Clubs (J♣), and 7 of Hearts (7♥).",
  "• A♠ = Szop Magik (Postać)": "• A♠ = Bandit the Magician (Person)",
  "• J♣ = napina i strzela z dębowego łuku (Akcja)": "• J♣ = draws and fires an oak longbow (Action)",
  "• 7♥ = kieliszek złotego napoju (Obiekt)": "• 7♥ = golden goblet of wine (Object)",
  "Zobacz to: Szop Magik bierze wielki łuk i z uśmiechem wystrzeliwuje z niego kieliszek niczym strzałę!":
    "Picture it: Bandit the Magician grabs an archery bow and shoots a goblet like an arrow with a grin!",
  "Brawo! Znasz już sekrety pamięciowych iluzjonistów:":
    "Bravo! You now know the secrets of memory illusionists:",
  "1. 4 żywioły kolorów talii.": "1. The 4 suits of the card deck.",
  "3. Formuła PAO (Postać - Akcja - Obiekt).": "3. The PAO formula (Person - Action - Object).",
  "Po co nam ta technika? Ile razy zdarzyło Ci się zapomnieć rzeczy do szkoły, listy zakupów czy punktów prezentacji?":
    "Why do we need this technique? How many times have you forgotten school items, groceries, or presentation points?",
  "Metoda łańcuchowa łączy myśli w głowie jak klocki domina: gdy popchniesz pierwszy klocek, cała reszta sama wskakuje do pamięci!":
    "The link method connects thoughts like dominoes: push the first tile, and the entire chain falls smoothly into place!",
  "ZASADA NR 1: PRAWIDŁO DYNAMICZNEJ AKCJI:": "RULE #1: PRINCIPLE OF DYNAMIC ACTION:",
  "Nasz mózg natychmiast zapomina nudne, spokojne obrazki. Aby coś zapamiętać na zawsze, potrzebujesz ruchu, dźwięku i zderzenia!":
    "Our brain quickly forgets dull, static images. To remember permanently, you need movement, sound, and impact!",
  "Poznajmy pierwsze 4 ogniwa naszego wielkiego łańcucha:":
    "Let us meet the first 4 links of our grand chain:",
  "1. PARASOL ☂️ → otwiera się z potężnym hukiem i z impetem taranuje wielkiego soczystego...":
    "1. UMBRELLA ☂️ → pops open with a loud bang and forcefully rams into a giant juicy...",
  "2. ARBUZA 🍉 → który eksploduje fontanną słodkiego czerwonego soku, na którym ślizga się...":
    "2. WATERMELON 🍉 → exploding into a fountain of red sweet juice, upon which skids a...",
  "3. ROWER 🚲 → który trąbi klaksonem i z łomotem wpada na gigantyczny...":
    "3. BICYCLE 🚲 → honking its horn and crashing with a rattle into an enormous...",
  "Aby łańcuch trzymał jak ze stali, używaj zmysłów: dźwięku, dotyku i komicznej przesady!":
    "For the chain to hold like steel, use senses: sound, touch, and comical exaggeration!",
  "Dołączamy kolejne 4 ogniwa do naszego pociągu (mamy już 8!):":
    "We attach the next 4 links to our train (now we have 8!):",
  "5. BALON 🎈 → który unosi się wysoko w niebo i z hukiem pęka, bo nabija się na kolczasty...":
    "5. BALLOON 🎈 → soaring into the sky and popping with a bang on a prickly...",
  "6. KAKTUS 🌵 → w który z głośnym brzękiem uderza spadająca z nieba elektryczna...":
    "6. CACTUS 🌵 → struck with a loud chord by a falling electric...",
  "7. GITARA 🎸 → grająca ostre rockowe solo, na której struny z góry skapują wielkie truskawkowe...":
    "7. GUITAR 🎸 → shredding a rock solo, while onto its strings drip giant strawberry...",
  "Wielka zaleta łańcucha: skupiasz się ZAWSZE tylko na bieżącej parze ogniw (A i B). Reszta przyjdzie sama!":
    "The great power of the chain: ALWAYS focus solely on the active pair of links (A and B). The rest follows!",
  "Budujemy kolejne 4 fascynujące ogniwa:":
    "We forge the next 4 fascinating links:",
  "8. LODY 🍦 → wgryzasz się w lody i nagle zgrzytasz zębami o zamrożony w środku złoty...":
    "8. ICE CREAM 🍦 → you bite into the ice cream and crunch your teeth on a frozen golden...",
  "9. KLUCZ 🔑 → wyjmujesz klucz, a w ciemności rozświetla go silnym laserowym snopem potężna...":
    "9. KEY 🔑 → you pull the key out, and in the darkness it is lit by a powerful beam from a...",
  "10. LATARKA 🔦 → promień latarki pada w głąb jaskini i ukazuje olbrzymi, błyszczący...":
    "10. FLASHLIGHT 🔦 → the beam shines deep into the cave revealing an enormous, glittering...",
  "11. SKARB 💎 → pełen diamentów i złota, którego z groźnym rykiem pilnuje zielony...":
    "11. TREASURE 💎 → filled with diamonds and gold, guarded with a ferocious roar by a green...",
  "Mózg uwielbia opowieści z rozmachem – im bardziej fantastyczne, tym silniejszy ślad pamięciowy!":
    "The brain loves grand stories – the more fantastical, the deeper the memory trace!",
  "Łączymy kolejne 4 ogniwa kosmicznej podróży:":
    "We connect the next 4 links of our cosmic journey:",
  "12. SMOK 🐉 → macha skrzydłami, zieje ogniem i z rykiem odpala kosmiczną...":
    "12. DRAGON 🐉 → flaps its wings, breathes flame, and ignites a cosmic...",
  "13. RAKIETĘ 🚀 → która z rykiem silników leci prosto w kosmos i ląduje na srebrzystym...":
    "13. ROCKET 🚀 → roaring its engines into outer space and touching down on the silvery...",
  "14. KSIĘŻYCU 🌙 → który po wbiciu flagi okazuje się w całości zrobiony ze smakowitego, żółtego...":
    "14. MOON 🌙 → which turns out to be made entirely of delicious, yellow Swiss...",
  "15. SERA 🧀 → z wielkimi dziurami, w których biega i wygryza kawałki wesoła polna...":
    "15. CHEESE 🧀 → with giant holes where scurries and nibbles a cheerful little...",
  "Dopinamy ostatnie ogniwa do pełnej liczby DWUDZIESTU:":
    "We snap in the final links up to the full TWENTY:",
  "16. MYSZ 🐭 → wystraszona ucieka i z impetem skacze wysoko na sprężystą...":
    "16. MOUSE 🐭 → startled, leaps high onto a bouncy...",
  "17. TRAMPOLINĘ 🎪 → która wystrzeliwuje mysz jak z procy prosto w wielki czekoladowy...":
    "17. TRAMPOLINE 🎪 → launching the mouse like a slingshot right into a giant chocolate...",
  "18. TORT 🎂 → na którego samym szczycie płonie woskowa...":
    "18. CAKE 🎂 → atop of which flickers a wax...",
  "19. ŚWIECA 🕯️ → której gorący wosk zastyga w magiczny, lśniący...":
    "19. CANDLE 🕯️ → whose hot wax hardens into a magical, glittering...",
  "20. KRYSZTAŁ 🔮 → odbijający w środku całą naszą niesamowitą przygodę!":
    "20. CRYSTAL 🔮 → reflecting our entire incredible adventure within!",
  "SUPERMOC: Ten łańcuch działa w obie strony! Cofnij się od końca:":
    "SUPERPOWER: This chain works both ways! Trace it backwards from the end:",
  "Spójrz na to, czego dokonałeś bez ani jednej kartki papieru:":
    "Look at what you achieved without a single scrap of paper:",
  "11. Skarb 💎 → 12. Smok 🐉 → 13. Rakieta 🚀 → 14. Księżyc 🌙 → 15. Ser 🧀 →":
    "11. Treasure 💎 → 12. Dragon 🐉 → 13. Rocket 🚀 → 14. Moon 🌙 → 15. Cheese 🧀 →",
  "16. Mysz 🐭 → 17. Trampolina 🎪 → 18. Tort 🎂 → 19. Świeca 🕯️ → 20. Kryształ 🔮.":
    "16. Mouse 🐭 → 17. Trampoline 🎪 → 18. Cake 🎂 → 19. Candle 🕯️ → 20. Crystal 🔮.",
  "Każde ogniwo nieuchronnie pociąga kolejne. Możesz w ten sposób zapamiętać przemówienie, procedurę czy 20 sprawunków na zakupy!":
    "Each link inevitably pulls the next. You can memorize speeches, procedures, or 20 grocery items this way!",
  "Kolejne dwie cyfry to najprostsza zabawa w skojarzenia kształtów:":
    "The next two digits are the easiest game of shape association:",
  "• 2 = N – małe „n” ma DWA brzuszki / dwie nóżki stojące na ziemi.":
    "• 2 = N – lowercase 'n' has TWO downstrokes standing on the ground.",
  "• 3 = M – małe „m” ma TRZY nóżki (raz, dwa, trzy!).":
    "• 3 = M – lowercase 'm' has THREE downstrokes (one, two, three!).",
  "To najprostsza zasada wizualna w całym systemie!":
    "This is the simplest visual rule in the entire system!",
  "Gdy w numerze telefonu lub dacie widzisz 2 → myślisz o N (np. Nos, Nóż).":
    "Whenever you see 2 in a number → think of N (e.g. Nose, Net).",
  "• 4 = R – powiedz głośno słowo „czteRy” – słyszysz to mocne, dźwięczne R na końcu?":
    "• 4 = R – say 'fouR' out loud – hear that strong, clear R at the end?",
  "• 5 = L – spójrz na dłoń: kciuk i palec wskazujący tworzą kształt litery L, a cała dłoń ma 5 palców! (Rzymskie L to też 50).":
    "• 5 = L – look at your hand: thumb and index finger make an L shape, and a hand has 5 fingers! (Roman L is 50).",
  "Poznajemy szóstkę i siódemkę:":
    "Meeting six and seven:",
  "• 6 = J, SZ, CZ – powiedz „Sześć” – to najbardziej szeleszcząca cyfra w języku polskim! (A litera J to 6. spółgłoska alfabetu).":
    "• 6 = J, SH, CH – soft hissing sounds! (And lowercase j is a flipped 6).",
  "• 7 = K, G – wyobraź sobie dwie cyfry 7 przytknięte do siebie plecami – tworzą ostre ramiona litery K!":
    "• 7 = K, G – imagine two 7s back to back – they form the sharp arms of letter K!",
  "Domykamy cały alfabet cyfr:":
    "Completing the digit alphabet:",
  "• 8 = F, W – pisana mała literka „f” ma dwie pętelki na górze i na dole, dokładnie jak cyfra 8.":
    "• 8 = F, V – cursive lowercase 'f' has two loops, top and bottom, just like digit 8.",
  "• 9 = P, B – cyfra 9 w lustrze wygląda jak litera P, a gdy obróci się ją do góry nogami – jak małe b!":
    "• 9 = P, B – digit 9 in a mirror looks like P, and flipped upside down – like lowercase b!",
  "Gratulacje! Znasz już całe 0 do 9:":
    "Congratulations! You know all 0 through 9:",
  "Po co nam samogłoski (A, E, I, O, U, Y)?":
    "Why do we need vowels (A, E, I, O, U, Y)?",
  "W systemie Major samogłoski NIE MAJĄ żadnej cyfry – są jak darmowy klej albo plastelina!":
    "In the Major system, vowels carry NO numbers – they are like free glue or modeling clay!",
  "Dzięki temu możesz wstawić DOWOLNE samogłoski między spółgłoski, by utworzyć sensowne, barwne słowo!":
    "This allows you to insert ANY vowels between consonants to form meaningful, vibrant words!",
  "Spójrz na liczbę 71:":
    "Look at number 71:",
  "• Wkładasz samogłoskę „O” w środek → powstaje puszysty KOT!":
    "• Insert vowel 'A' in the middle → you get a fluffy CAT!",
  "Zamiast pamiętać nudne liczby, pamiętasz wyraziste obrazy (kołki pamięciowe):":
    "Instead of remembering dry digits, you remember vivid objects (memory pegs):",
  "• 47 = R(4) + K(7) = szczypiący RAK 🦞": "• 47 = R(4) + K(7) = solid ROCK 🪨",
  "• 91 = B(9) + T(1) = skórzany BUT 👞": "• 91 = B(9) + T(1) = wooden BOAT ⛵",
  "Twój nowy kod PIN do telefonu lub karty to: 7114.":
    "Your new PIN code is: 7114.",
  "Dzielimy go na dwa 2-cyfrowe kołki:":
    "We split it into two 2-digit pegs:",
  "Łączymy je w żywą scenę: Gigantyczny KOT leży na TORACH i łapą zatrzymuje pociąg!":
    "We fuse them into a vivid scene: A giant CAT lies on TRAIN tracks stopping the locomotive with a paw!",
  "Po co nam ta technika? W szkole i pracy uczono nas pisać notatki linijka pod linijką, od góry do dołu, jednym kolorem długopisu. Dla naszego mózgu taki jednolity blok tekstu jest szary i nudny – po 10 minutach czytania oczy się męczą, a treść wylatuje z głowy.":
    "Why do we need this technique? In school and work, we were taught line-by-line notes, top to bottom in monochrome ink. For our brain, such a uniform text block is dull and gray – after 10 minutes, eyes tire and recall evaporates.",
  "Twój mózg nie myśli w prostych liniach! Myśli promieniście – od jednego kluczowego pomysłu wybuchają we wszystkich kierunkach setki powiązanych skojarzeń, dokładnie tak, jak rozchodzą się macki ośmiornicy lub promienie słońca!":
    "Your brain does not think in straight lines! It thinks radiantly – from one core idea, hundreds of associations explode in all directions, just like octopus tentacles or sunbeams!",
  "Gdy słyszysz słowo „PIES”, nie wyświetla Ci się w głowie czarny napis P-I-E-S na białym tle, prawda? Widzisz merdający ogon, słyszysz szczekanie, przypominasz sobie spacer w parku i miękką sierść!":
    "When you hear the word 'DOG', you don't see black letters D-O-G on white paper, do you? You see a wagging tail, hear a bark, recall a sunny park walk, and feel soft fur!",
  "Po co nam ta zasada? Najczęstszy błąd to położenie kartki pionowo i wpisanie w kółeczku nudnego słowa długopisem. Taka notatka nie ma siły przyciągania.":
    "Why this rule? The common beginner mistake is placing the paper portrait and writing a dry word in a pen circle. That note has zero magnetic pull.",
  "Oto 3 żelazne reguły centrum mapy:": "Here are 3 iron rules for the center of the map:",
  "1. 📐 Kartka ZAWSZE poziomo (orientacja pejzażowa): Nasze oczy są ułożone obok siebie, dlatego naturalne pole widzenia człowieka to panorama 16:9, a nie pionowa szczelina!":
    "1. 📐 Paper ALWAYS landscape: Our eyes sit side by side, making human vision panoramic (16:9), not a narrow vertical slit!",
  "2. 🎨 Kolorowy OBRAZ w centrum zamiast samego tekstu: Użyj co najmniej 3 różnych kolorów. Obraz jest przetwarzany przez korę wzrokową tysiące razy szybciej niż litery.":
    "2. 🎨 Colorful IMAGE at the center: Use at least 3 distinct colors. Images are processed by the visual cortex thousands of times faster than text.",
  "Po co nam ta zasada? Gdy stajemy przed trudnym egzaminem, grubą książką lub wielkim projektem, czujemy przytłoczenie ogromem materiału. Kluczem do opanowania chaosu jest kategoryzacja.":
    "Why this rule? Facing hard exams, thick books, or huge projects brings overwhelm. The master key to conquering chaos is categorization.",
  "Od centralnego obrazu wypuszczamy grube, organiczne gałęzie (najlepiej 3 do 7 głównych ramion, zgodnie z magiczną liczbą George’a Millera 7 ± 2). Każda gałąź odpowiada jednemu wielkiemu filarowi tematu.":
    "From the central image we sprout thick, organic branches (ideally 3 to 7 limbs, following Miller's magic number 7 ± 2). Each branch represents one grand pillar of the subject.",
  "Zasady głównych ramion:": "Rules of the main branches:",
  "• Łączą się bezpośrednio z centrum – są najgrubsze u nasady, dokładnie jak gałęzie wyrastające z pnia drzewa.":
    "• Connect directly to the center – thickest at the trunk, just like natural tree boughs.",
  "• Są faliste i organiczne – mózg nie znosi prostych linii rysowanych od linijki, bo w naturze nie ma linii idealnie prostych!":
    "• Wavy and organic – the brain dislikes rigid ruler lines, as pure straight lines do not exist in nature!",
  "Po co nam ta zasada? Najczęstszym błędem początkujących jest wciskanie na gałęzie całych zdań z podręcznika. Kiedy zapiszesz całe zdanie, Twój mózg staje się leniwy – przestaje myśleć i zaczyna czytać jak automat.":
    "Why this rule? Beginners often cram full textbook sentences onto branches. When you write a full sentence, your brain goes passive – it stops thinking and reads like an automaton.",
  "Na każdej gałęzi i pod-gałęzi umieszczamy tylko JEDNO SŁOWO-KLUCZ (rzeczownik lub czasownik).":
    "On every branch and twig, place only ONE KEYWORD (a noun or active verb).",
  "Zobacz spektakularną różnicę:": "See the spectacular difference:",
  "• Nudna notatka: „Układ Słoneczny powstał około 4,6 miliarda lat temu w wyniku grawitacyjnego zapadnięcia się obłoku molekularnego.” (18 słów, zasypiasz po przeczytaniu).":
    '• Dull note: "The Solar System formed around 4.6 billion years ago from gravitational collapse of a molecular cloud." (18 words, sleep-inducing).',
  "• Mapa myśli: Gałąź „Powstanie” → odnoga „4,6 mld lat ⏳” → odnoga „Zapada obłok 🌌”.":
    '• Mind map: Branch "Formation" → twig "4.6B yrs ⏳" → twig "Collapsing cloud 🌌".',
  "Po co nam rysunki? Badania neuropsychologiczne dowodzą, że ludzki mózg przetwarza obrazy aż 60 000 razy szybciej niż tekst pisany! Pismo powstało zaledwie kilka tysięcy lat temu, ale wzrok i rozpoznawanie kształtów rozwijały się przez miliony lat ewolucji.":
    "Why drawings? Neuropsychological studies prove the human brain processes images 60,000 times faster than text! Writing is a few millennia old, while vision evolved over millions of years.",
  "Nie musisz mieć talentu plastycznego! W mapach myśli używamy prostych piktogramów:":
    "No artistic talent required! In mind maps we use simple pictograms:",
  "• 💡 Żarówka = Pomysł, odkrycie, innowacja": "• 💡 Lightbulb = Idea, discovery, innovation",
  "• ⚡ Błyskawica = Energia, szybkość, zagrożenie": "• ⚡ Lightning = Energy, speed, danger",
  "• 💰 Worek złota = Koszt, zysk, budżet": "• 💰 Moneybag = Cost, profit, budget",
  "• 🔍 Lupa = Analiza, badanie, szczegół": "• 🔍 Magnifier = Analysis, study, detail",
  "Po co nam kolory? W naturze kolor niesie kluczowe informacje: dojrzały owoc jest czerwony, woda błękitna, liście zielone, a drapieżnik ma kontrastowe paski. Monochromatyczne, czarno-białe notatki nasz mózg odbiera jak martwe tło.":
    "Why colors? In nature, color carries vital cues: ripe fruit is red, water blue, leaves green, and predators wear contrasting stripes. Monotone notes are received as static dead background.",
  "Żelazna zasada kolorowania mapy myśli:": "Iron rule of mind map coloring:",
  "Każde główne ramię (oraz WSZYSTKIE odchodzące od niego cieńsze gałązki) rysujemy TYM SAMYM, DEDYKOWANYM KOLOREM!":
    "Draw each primary branch (and ALL its offshoot twigs) using THE EXACT SAME DEDICATED COLOR!",
  "• Ramię Niebieskie 🌊 → Wszystkie odnogi i napisy są niebieskie":
    "• Blue Branch 🌊 → All offshoots and labels are blue",
  "• Ramię Zielone 🌿 → Wszystkie odnogi i napisy są zielone":
    "• Green Branch 🌿 → All offshoots and labels are green",
  "• Ramię Czerwone 🔥 → Wszystkie odnogi i napisy są czerwone":
    "• Red Branch 🔥 → All offshoots and labels are red",
  "• Ramię Fioletowe 🔮 → Wszystkie odnogi i napisy są fioletowe":
    "• Purple Branch 🔮 → All offshoots and labels are purple",
  "Po co nam ta zasada? W każdym temacie oprócz wielkich kategorii istnieją konkretne daty, nazwiska, wzory i liczby. Jeśli wrzucimy je w jedno miejsce, powstanie nieczytelny kłąb myśli.":
    "Why this rule? Beyond big categories exist precise dates, names, formulas, and figures. Lumped together, they form an illegible knot of thoughts.",
  "W profesjonalnej mapie myśli stosujemy hierarchię grubości linii:":
    "In professional mind maps we implement line thickness hierarchy:",
  "1. Poziom 1 (Konary główne): Bardzo grube, organiczne linie dotykające centrum. Niosą nadrzędne działy.":
    "1. Level 1 (Main Boughs): Very thick organic lines touching the center, carrying overarching themes.",
  "2. Poziom 2 (Pod-gałęzie): Średniej grubości linie wypływające z konarów. Niosą podkategorie.":
    "2. Level 2 (Sub-branches): Medium-thick lines flowing from boughs, carrying subcategories.",
  "3. Poziom 3 (Drobne gałązki): Cienkie linie na samym brzegu kartki. Niosą konkretne fakty, daty, nazwiska i liczby.":
    "3. Level 3 (Slender Twigs): Thin lines at the outer perimeter, carrying precise facts, dates, names, and figures.",
  "Po co nam ta zasada? Początkujący często obracają kartkę i piszą litery pionowo lub do góry nogami wzdłuż wygiętej gałęzi. Kiedy potem próbują powtórzyć materiał, muszą kręcić głową jak sowa!":
    "Why this rule? Beginners often spin the sheet, writing vertically or upside down. Later when studying, they have to twist their heads like owls!",
  "Oto 3 reguły ergonomii wzrokowej:": "Here are 3 rules of visual ergonomics:",
  "1. ✍️ Zawsze pismo poziome: Wszystkie słowa leżą na gałęziach w taki sposób, byś mógł je przeczytać bez przekrzywiania głowy i bez obracania kartki.":
    "1. ✍️ Always horizontal lettering: All words rest on branches readable without tilting your head or turning the paper.",
  "2. 🔤 Litery drukowane: Drukowane litery (blokowe) mają wyraźne, ostre kontury. Mózg rejestruje je w 10 milisekund, podczas gdy pismo odręczne z zawijasami wymaga ciągłego odszyfrowywania.":
    "2. 🔤 Print lettering: Print block letters have sharp contours. The brain registers them in 10ms, while messy cursive demands deciphering.",
  "Jak przełożyć gęsty materiał z podręcznika lub raportu na mapę myśli? Oto niezawodny 4-etapowy proces Ośmiornicy Inki:":
    "How to translate dense textbook chapters into a mind map? Here is Inky's reliable 4-step process:",
  "1. 🔎 Szybki przegląd (Skimming): Zanim zaczniesz pisać, przekartkuj cały rozdział. Zwróć uwagę na nagłówki, pogrubienia, wykresy i podsumowanie na końcu. Zobacz, o czym w ogóle jest tekst.":
    "1. 🔎 Skimming: Skim the entire chapter before writing. Note headings, bold text, diagrams, and summaries to grasp the big picture.",
  "2. 🎯 Obraz centralny: Połóż kartkę A4 poziomo. Narysuj na środku symbol tematu (np. dla działu „Starożytny Rzym” narysuj rzymski hełm legionisty 🏛️).":
    "2. 🎯 Central Image: Place an A4 sheet landscape. Draw a central symbol of the topic (e.g. Roman helmet for 'Ancient Rome' 🏛️).",
  "3. 🌳 4-6 głównych konarów: Każdy podrozdział książki staje się jednym ramieniem: 1. Ustrój, 2. Legiony, 3. Architektura, 4. Upadek.":
    "3. 🌳 4-6 Main Boughs: Each subchapter becomes one limb: 1. Government, 2. Legions, 3. Architecture, 4. Fall.",
  "4. 🌿 Odnogi ze słowami-kluczami: Przeczytaj tekst akapit po akapicie i wyłapuj tylko esencję: nazwiska, daty bitew, wynalazki (np. akwedukty, drogi, beton).":
    "4. 🌿 Twigs with Keywords: Read paragraph by paragraph, extracting pure essence: names, dates, inventions (aqueducts, roads, concrete).",
  "Gratulacje! Przeszedłeś kompletną drogę nielinearnego myślenia. Ostatnia wielka supermoc mapy myśli to publiczne wystąpienia bez czytania z kartki.":
    "Congratulations! You completed the full journey of radiant thinking. The final superpower of mind mapping is note-free public speaking.",
  "Dlaczego prelegenci czytający z kartek wypadają nudno? Bo nie mają kontaktu wzrokowego ze słuchaczami! Czytają zdanie po zdaniu z głową w dół.":
    "Why are speakers reading from sheets so dull? They lack audience eye contact! They read sentence by sentence with their heads down.",
  "Gdy przygotujesz prezentację w formie mapy myśli:":
    "When you design a speech as a mind map:",
  "1. W centrum masz temat wystąpienia 🎯": "1. At the center is your speech theme 🎯",
  "2. Masz tylko 4 główne ramiona: Wstęp (problem), Rozwiązanie, Przykłady, Wnioski (wezwanie do działania).":
    "2. You have only 4 primary branches: Intro (problem), Solution, Case Studies, Conclusion (call to action).",
  "3. Wychodzisz na scenę lub przed tablicę. Nie masz ze sobą kartek. Zamykasz oczy na ułamek sekundy i WIDZISZ całą mapę przed oczami!":
    "3. Step on stage with zero notes. Close your eyes for a split second and you clearly SEE the entire map in your mind!",
  "Mówisz swobodnie, własnymi słowami, uśmiechasz się i patrzysz prosto w oczy słuchaczom. Płyniesz od gałęzi do gałęzi jak ryba w oceanie!":
    "You speak naturally, smile, and make direct eye contact. You glide effortlessly from branch to branch like a dolphin in the ocean!",
  "Ćwiczymy całą pętlę pamięciową dla 3 gości:":
    "We practice the complete memory loop for 3 guests:",
  "1. Marek → złote okulary → MARKER zamalowuje szkła!":
    "1. Mark → golden glasses → neon MARKER colors the lenses!",
  "Wchodzimy do większego salonu! Poznaj kolejne dwie wspaniałe osoby:":
    "Entering a larger parlor! Meet two more wonderful people:",
  "• Kasia (projektantka) → fioletowe włosy & kolczyk w nosie → pije gorące KAKAO, a kolczyk brzęczy!":
    "• Katie (designer) → purple hair & nose ring → drinks hot COCOA as her piercing rings!",
  "Brawo! Znasz już kompletną metodę zapamiętywania każdego człowieka:":
    "Bravo! You now command the complete method for remembering any person:",
  "1. Zauważ kotwicę (okulary, broda, monokl, opaska, muszka).":
    "1. Spot the anchor (glasses, beard, monocle, headband, bow tie).",
  "2. Zamień imię na most fonetyczny (Basia=Bas, Marek=Marker, Piotr=Pióro).":
    "2. Convert name into a phonetic bridge (Barbara=Bass, Mark=Marker, Peter=Quill).",
  "3. Zobacz szaloną interakcję kotwicy z mostem w swojej wyobraźni.":
    "3. Envision the wild interaction between anchor and bridge in your imagination.",
  "Po co nam ta metoda? Zwykłe powtarzanie angielskich słówek po 50 razy w zeszycie jest nudne, męczące i szybko ulatuje z głowy.":
    "Why this method? Repeating foreign words 50 times in a notebook is tiring, boring, and quickly forgotten.",
  "Metoda słów-kluczy (Keyword Method) to sekret poliglotów i mistrzów pamięci na całym świecie!":
    "The Keyword Method is the secret of polyglots and memory champions worldwide!",
  "Składa się z 2 prostych, zabawnych kroków:":
    "It consists of 2 simple, fun steps:",
  "1. Znajdź polskie słowo, które brzmi podobnie do angielskiego wyrazu (to nasz Most Fonetyczny).":
    "1. Find a sound-alike word in your language (our Phonetic Bridge).",
  "2. Połącz ten dźwięk ze znaczeniem słówka w śmieszną, bajkową scenkę w wyobraźni!":
    "2. Connect that acoustic sound with the word's meaning in a hilarious fairy-tale mental scene!",
  "Krok 1 w praktyce: szukamy dźwiękowego bliźniaka.":
    "Step 1 in practice: discovering the acoustic twin.",
  "Spójrz na angielskie słówko „mushroom” (grzyb).":
    'Look at the foreign word "mushroom".',
  "Powiedz je na głos: „masz-rum”.":
    'Say it out loud: "mush-room".',
  "Brzmi dokładnie jak polskie pytanie: „MASZ RUM?!” 🏴‍☠️":
    'Sounds just like "champion" or pirate asking for rum! 🏴‍☠️',
  "Mamy już most „MASZ RUM” i wiemy, że mushroom oznacza GRZYB.":
    'We have our sound bridge and know that mushroom means mushroom.',
  "Teraz najważniejszy moment – zrób z tego film przed oczami:":
    "Now the most crucial moment – make a mental movie before your eyes:",
  "Wielki leśny prawdziwek z wąsami i w trójkątnym kapeluszu pirata staje przed Tobą, uderza pięścią w stół i groźnie krzyczy: „MASZ RUM W BUTELCE?!”":
    'A boxing champion in gloves enters the ring and bites into a giant mushroom for energy!',
  "Poczuj zapach lasu i zobacz tego śmiesznego grzyba.":
    "Smell the fresh forest and see that hilarious mushroom.",
  "Ćwiczymy kolejne angielskie mosty dźwiękowe:":
    "Practicing more foreign sound bridges:",
  "• CANDLE (świeca) → KUNDEL: wesoły kundelek biegnie z płonącą świecą na ogonie! 🕯️":
    "• CANDLE → chandelier / candelabra: a dog running with a blazing candle on its tail! 🕯️",
  "• FEATHER (pióro) → SWETER: z wełnianego swetra nagle wyrastają wielkie gęsie pióra! 🪶":
    "• FEATHER → fedora: goose feathers sprouting directly out of a stylish hat! 🪶",
  "Poznajemy kolejne 3 angielskie perełki z naszej bogatej puli ponad 100 wyrazów:":
    "Meeting 3 more gems from our rich pool of over 100 words:",
  "• SHARK (rekin) → SZARIK: groźny rekin w wodzie macha przyjaźnie ogonem i szczeka jak pies Szarik! 🦈":
    "• SHARK → a pet dog swimming with a giant shark fin barking at fish! 🦈",
  "• BEETLE (chrząszcz) → BITELSI: cztery chrząszcze w garniturach grają rocka jak zespół The Beatles! 🪲":
    "• BEETLE → The Beatles: four beetles in suits rocking guitars on stage! 🪲",
  "Brawo! Masz w ręku najpotężniejsze narzędzie do nauki języka angielskiego na świecie.":
    "Bravo! You now hold the most powerful tool for learning foreign vocabulary in the world.",
  "Gdy w szkole, filmie czy w podróży spotkasz nowe angielskie słówko:":
    "Whenever you encounter a new word at school, in a movie, or while traveling:",
  "1. Usłysz jego dźwięk i znajdź polskiego bliźniaka.":
    "1. Hear its sound and find an acoustic sound-alike twin.",
  "2. Stwórz wyrazistą, zabawną scenkę.":
    "2. Create a striking, comical scene linking sound to meaning."
};

fs.writeFileSync(path.join(__dirname, 'dict_remaining_theories_exported.json'), JSON.stringify(theoriesMap, null, 2), 'utf8');
console.log('Exported', Object.keys(theoriesMap).length, 'remaining theories translations.');
module.exports = theoriesMap;
