export const FACES = [
  {
    id: 'f1',
    name: 'Marek',
    feature: 'Wielkie okrągłe okulary w złotej oprawce',
    hook: 'Marek ma MARKER i maluje nim wielkie okulary!',
    job: 'Architekt',
    color: '#3498db',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="m-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fed7aa"/><stop offset="100%" stop-color="#fbcfe8"/></linearGradient>
        <linearGradient id="m-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
        <linearGradient id="m-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#451a03"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient>
      </defs>
      <!-- Ramiona / koszula architekta -->
      <path d="M22 96 C22 80 32 76 50 76 C68 76 78 80 78 96 Z" fill="#3b82f6"/>
      <path d="M42 76 L50 86 L58 76 Z" fill="#ffffff"/>
      <path d="M46 76 L50 82 L54 76 Z" fill="#93c5fd"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v14 h-16 z" fill="#fbcfe8"/>
      <circle cx="21" cy="50" r="7" fill="#fed7aa"/>
      <circle cx="79" cy="50" r="7" fill="#fed7aa"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="48" rx="30" ry="32" fill="url(#m-skin)"/>
      <!-- Włosy stylowe -->
      <path d="M20 40 C18 20 32 10 50 10 C68 10 82 20 80 40 C75 24 65 18 50 18 C35 18 25 24 20 40 Z" fill="url(#m-hair)"/>
      <path d="M24 34 C30 22 45 20 54 26 C46 22 32 26 28 36 Z" fill="#78350f" opacity="0.6"/>
      <!-- Oczy i brwi -->
      <path d="M30 38 Q36 34 42 38" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M58 38 Q64 34 70 38" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="37.5" cy="46.5" r="1.2" fill="#ffffff"/>
      <circle cx="64" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="65.5" cy="46.5" r="1.2" fill="#ffffff"/>
      <!-- Nos i uśmiech -->
      <path d="M48 48 Q50 54 53 54" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M40 62 Q50 70 60 62" stroke="#b45309" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <!-- Róż na policzkach -->
      <circle cx="28" cy="56" r="4.5" fill="#f43f5e" opacity="0.25"/>
      <circle cx="72" cy="56" r="4.5" fill="#f43f5e" opacity="0.25"/>
      <!-- SYGNOWANA CECHA: WIELKIE OKRĄGŁE OKULARY W ZŁOTEJ OPRAWCE -->
      <circle cx="36" cy="48" r="14.5" fill="none" stroke="url(#m-gold)" stroke-width="3.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"/>
      <circle cx="64" cy="48" r="14.5" fill="none" stroke="url(#m-gold)" stroke-width="3.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"/>
      <path d="M50.5 48 H50" stroke="url(#m-gold)" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="21.5" y1="46" x2="16" y2="44" stroke="url(#m-gold)" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="78.5" y1="46" x2="84" y2="44" stroke="url(#m-gold)" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Odblask w szkłach okularów -->
      <path d="M26 42 Q32 37 40 40" stroke="#ffffff" stroke-width="1.8" fill="none" opacity="0.75" stroke-linecap="round"/>
      <path d="M54 42 Q60 37 68 40" stroke="#ffffff" stroke-width="1.8" fill="none" opacity="0.75" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'f2',
    name: 'Basia',
    feature: 'Wysoki rudy kok i piegi na policzkach',
    hook: 'Basia gra na BASIE, a jej rudy kok podskakuje w rytm!',
    job: 'Muzyczka',
    color: '#e67e22',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="b-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff1f2"/><stop offset="100%" stop-color="#fecdd3"/></linearGradient>
        <linearGradient id="b-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f97316"/><stop offset="50%" stop-color="#ea580c"/><stop offset="100%" stop-color="#c2410c"/></linearGradient>
      </defs>
      <!-- SYGNOWANA CECHA 1: WYSOKI RUDY KOK -->
      <circle cx="50" cy="14" r="15" fill="url(#b-hair)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.2))"/>
      <circle cx="50" cy="14" r="11" fill="none" stroke="#fdba74" stroke-width="2" opacity="0.6"/>
      <!-- Gumka do koka z perełką -->
      <rect x="42" y="24" width="16" height="5" rx="2.5" fill="#4f46e5"/>
      <circle cx="50" cy="26.5" r="2.5" fill="#facc15"/>
      <!-- Ramiona / dekolt z naszyjnikiem -->
      <path d="M20 96 C20 78 32 74 50 74 C68 74 80 78 80 96 Z" fill="#ec4899"/>
      <path d="M42 74 Q50 82 58 74" stroke="#fbbf24" stroke-width="2" fill="none"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fecdd3"/>
      <circle cx="21" cy="52" r="6.5" fill="#ffe4e6"/>
      <circle cx="79" cy="52" r="6.5" fill="#ffe4e6"/>
      <!-- Kolczyki nutki -->
      <circle cx="21" cy="59" r="2" fill="#fbbf24"/>
      <circle cx="79" cy="59" r="2" fill="#fbbf24"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="50" rx="29" ry="30" fill="url(#b-skin)"/>
      <!-- Grzywka i pasma włosów -->
      <path d="M21 44 C20 30 34 26 50 26 C66 26 80 30 79 44 C72 32 60 30 50 34 C40 30 28 32 21 44 Z" fill="url(#b-hair)"/>
      <!-- Pasemka spadające po bokach -->
      <path d="M20 44 Q17 56 21 64" stroke="url(#b-hair)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M80 44 Q83 56 79 64" stroke="url(#b-hair)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Oczy z rzęsami i brwi -->
      <path d="M31 40 Q37 36 43 40" stroke="#9a3412" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M57 40 Q63 36 69 40" stroke="#9a3412" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="48" r="3.5" fill="#047857"/>
      <circle cx="38" cy="46.5" r="1.3" fill="#ffffff"/>
      <path d="M33 46 L31 44 M41 46 L43 44" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="63" cy="48" r="3.5" fill="#047857"/>
      <circle cx="64" cy="46.5" r="1.3" fill="#ffffff"/>
      <path d="M59 46 L57 44 M67 46 L69 44" stroke="#1e293b" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Nosek i radosny uśmiech -->
      <path d="M48 49 Q50 53 52 50" stroke="#ea580c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M41 62 Q50 72 59 62" stroke="#e11d48" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="56" r="5" fill="#fb7185" opacity="0.3"/>
      <circle cx="72" cy="56" r="5" fill="#fb7185" opacity="0.3"/>
      <!-- SYGNOWANA CECHA 2: PIEGI NA POLICZKACH I NOSIE -->
      <circle cx="26" cy="54" r="1.5" fill="#c2410c"/>
      <circle cx="29" cy="58" r="1.6" fill="#9a3412"/>
      <circle cx="33" cy="54" r="1.4" fill="#c2410c"/>
      <circle cx="31" cy="62" r="1.3" fill="#9a3412"/>
      <circle cx="47" cy="54" r="1.2" fill="#c2410c"/>
      <circle cx="53" cy="54" r="1.2" fill="#c2410c"/>
      <circle cx="67" cy="54" r="1.4" fill="#c2410c"/>
      <circle cx="71" cy="58" r="1.6" fill="#9a3412"/>
      <circle cx="74" cy="54" r="1.5" fill="#c2410c"/>
      <circle cx="69" cy="62" r="1.3" fill="#9a3412"/>
    </svg>`
  },
  {
    id: 'f3',
    name: 'Krzysztof',
    feature: 'Bujna, gęsta czarna broda drwala',
    hook: 'KRZACZASTY Krzysztof gubi w brodzie Krzyżacki miecz!',
    job: 'Programista',
    color: '#10b981',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="k-beard" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#27272a"/><stop offset="50%" stop-color="#18181b"/><stop offset="100%" stop-color="#09090b"/></linearGradient>
        <linearGradient id="k-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
      </defs>
      <!-- Koszula w kratę drwala -->
      <path d="M18 96 C18 78 30 74 50 74 C70 74 82 78 82 96 Z" fill="#dc2626"/>
      <line x1="30" y1="76" x2="30" y2="96" stroke="#991b1b" stroke-width="2"/>
      <line x1="70" y1="76" x2="70" y2="96" stroke="#991b1b" stroke-width="2"/>
      <line x1="18" y1="86" x2="82" y2="86" stroke="#991b1b" stroke-width="2"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fed7aa"/>
      <circle cx="20" cy="48" r="7" fill="#fde68a"/>
      <circle cx="80" cy="48" r="7" fill="#fde68a"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="46" rx="30" ry="31" fill="url(#k-skin)"/>
      <!-- Włosy -->
      <path d="M20 38 C20 16 34 12 50 12 C66 12 80 16 80 38 C74 24 62 20 50 20 C38 20 26 24 20 38 Z" fill="url(#k-beard)"/>
      <path d="M22 36 C25 28 35 24 45 23" stroke="#3f3f46" stroke-width="2" fill="none"/>
      <!-- Gęste brwi i oczy programisty -->
      <path d="M28 38 L43 38" stroke="#18181b" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M57 38 L72 38" stroke="#18181b" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="36" cy="45" r="3.6" fill="#18181b"/>
      <circle cx="37.5" cy="43.5" r="1.3" fill="#ffffff"/>
      <circle cx="64" cy="45" r="3.6" fill="#18181b"/>
      <circle cx="65.5" cy="43.5" r="1.3" fill="#ffffff"/>
      <!-- Nos -->
      <path d="M47 44 Q50 51 53 51" stroke="#d97706" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA: BUJNA, GĘSTA CZARNA BRODA DRWALA -->
      <path d="M20 48 C20 85, 32 96, 50 96 C68 96, 80 85, 80 48 C76 52, 70 56, 62 55 C56 54, 52 58, 50 58 C48 58, 44 54, 38 55 C30 56, 24 52, 20 48 Z" fill="url(#k-beard)" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.35))"/>
      <!-- Wąsy drwala -->
      <path d="M32 55 Q50 63 68 55 Q50 52 32 55 Z" fill="#27272a"/>
      <!-- Uśmiech widoczny pod wąsem -->
      <path d="M43 62 Q50 67 57 62" stroke="#fef08a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Pasma faktury brody -->
      <path d="M35 70 Q50 88 50 94" stroke="#3f3f46" stroke-width="1.8" fill="none" opacity="0.6"/>
      <path d="M65 70 Q50 88 50 94" stroke="#3f3f46" stroke-width="1.8" fill="none" opacity="0.6"/>
    </svg>`
  },
  {
    id: 'f4',
    name: 'Kasia',
    feature: 'Lśniące fioletowe włosy i kolczyk w nosie',
    hook: 'Kasia pije KAKAO z fioletowego kubka, a kolczyk brzęczy!',
    job: 'Projektantka UX',
    color: '#8b5cf6',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ka-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c084fc"/><stop offset="40%" stop-color="#9333ea"/><stop offset="100%" stop-color="#581c87"/></linearGradient>
        <linearGradient id="ka-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
      </defs>
      <!-- Ramiona / czarny golf UX designerki -->
      <path d="M22 96 C22 80 32 76 50 76 C68 76 78 80 78 96 Z" fill="#18181b"/>
      <rect x="42" y="70" width="16" height="8" rx="3" fill="#27272a"/>
      <!-- Szyja i uszy -->
      <path d="M42 64 h16 v10 h-16 z" fill="#fed7aa"/>
      <circle cx="22" cy="50" r="6.5" fill="#fde68a"/>
      <circle cx="78" cy="50" r="6.5" fill="#fde68a"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="48" rx="28" ry="30" fill="url(#ka-skin)"/>
      <!-- SYGNOWANA CECHA 1: LŚNIĄCE FIOLETOWE WŁOSY (Asymetryczny styl) -->
      <path d="M16 48 C12 24 30 10 50 10 C70 10 86 22 84 52 C78 28 66 20 50 20 C32 20 18 32 16 48 Z" fill="url(#ka-hair)"/>
      <path d="M16 48 C14 68 24 82 28 86 C24 72 20 58 22 46 Z" fill="url(#ka-hair)"/>
      <path d="M84 48 C86 64 80 74 76 80 C78 68 82 58 80 46 Z" fill="url(#ka-hair)"/>
      <!-- Błyszczące pasmo fioletowe -->
      <path d="M28 22 Q42 16 56 22 Q40 20 30 30 Z" fill="#e9d5ff" opacity="0.8"/>
      <!-- Oczy i staranne brwi -->
      <path d="M31 38 Q37 34 43 38" stroke="#581c87" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M57 38 Q63 34 69 38" stroke="#581c87" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="46" r="3.5" fill="#312e81"/>
      <circle cx="38" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M32 44 L30 42 M42 44 L44 42" stroke="#312e81" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="63" cy="46" r="3.5" fill="#312e81"/>
      <circle cx="64" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M58 44 L56 42 M68 44 L70 42" stroke="#312e81" stroke-width="1.3" stroke-linecap="round"/>
      <!-- Nos -->
      <path d="M48 46 Q50 54 52 53" stroke="#b45309" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: ZŁOTY KOLCZYK W NOSIE (NOSE RING) -->
      <circle cx="55" cy="53" r="3" fill="none" stroke="#f59e0b" stroke-width="2.2" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.3))"/>
      <circle cx="56.5" cy="52" r="0.8" fill="#ffffff"/>
      <!-- Usta z modną szminką -->
      <path d="M41 64 Q50 72 59 64" stroke="#9333ea" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="55" r="4.5" fill="#c084fc" opacity="0.3"/>
      <circle cx="72" cy="55" r="4.5" fill="#c084fc" opacity="0.3"/>
    </svg>`
  },
  {
    id: 'f5',
    name: 'Tomasz',
    feature: 'Szeroki, hollywoodzki uśmiech i elegancka muszka',
    hook: 'Tomasz to mistrz TOMU wierszy – kłania się w muszce i błyszczy zębami!',
    job: 'Prezenter TV',
    color: '#f43f5e',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="t-suit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
        <linearGradient id="t-bow" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#991b1b"/></linearGradient>
      </defs>
      <!-- Garnitur prezentera TV -->
      <path d="M18 96 C18 78 30 74 50 74 C70 74 82 78 82 96 Z" fill="url(#t-suit)"/>
      <!-- Biała koszula ze stójką -->
      <path d="M40 74 L50 86 L60 74 Z" fill="#ffffff"/>
      <!-- SYGNOWANA CECHA 1: ELEGANCKA CZERWONA MUSZKA -->
      <path d="M40 84 L48 87 L40 90 Z" fill="url(#t-bow)"/>
      <path d="M60 84 L52 87 L60 90 Z" fill="url(#t-bow)"/>
      <circle cx="50" cy="87" r="3" fill="#b91c1c" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v10 h-16 z" fill="#fed7aa"/>
      <circle cx="21" cy="48" r="6.5" fill="#ffedd5"/>
      <circle cx="79" cy="48" r="6.5" fill="#ffedd5"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="46" rx="29" ry="30" fill="#ffedd5"/>
      <!-- Fryzura prezentera z przedziałkiem -->
      <path d="M21 38 C20 16 35 10 50 10 C66 10 80 16 79 38 C75 22 62 18 48 18 C34 18 25 24 21 38 Z" fill="#78350f"/>
      <path d="M30 22 Q48 16 68 22" stroke="#b45309" stroke-width="2" fill="none" opacity="0.6"/>
      <!-- Brwi i błyszczące oczy -->
      <path d="M31 36 Q37 32 43 36" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M57 36 Q63 32 69 36" stroke="#451a03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="44" r="3.5" fill="#1e293b"/>
      <circle cx="38.5" cy="42.5" r="1.3" fill="#ffffff"/>
      <circle cx="63" cy="44" r="3.5" fill="#1e293b"/>
      <circle cx="64.5" cy="42.5" r="1.3" fill="#ffffff"/>
      <!-- Nos -->
      <path d="M48 45 Q50 51 53 51" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: SZEROKI, HOLLYWOODZKI UŚMIECH Z ZĘBAMI -->
      <path d="M30 58 Q50 78 70 58 Q50 54 30 58 Z" fill="#1e293b" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
      <path d="M33 58 Q50 63 67 58 C64 68 36 68 33 58 Z" fill="#ffffff"/>
      <line x1="50" y1="58" x2="50" y2="65" stroke="#e2e8f0" stroke-width="1.2"/>
      <!-- Błysk w zębach (Hollywood sparkle) -->
      <path d="M36 59 L38 59 M37 58 L37 60" stroke="#facc15" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'f6',
    name: 'Ola',
    feature: 'Dwa zawadiackie kucyki i zielona opaska na czole',
    hook: 'Ola krzyczy OLE! na meczu i macha kucykami!',
    job: 'Trenerka fitness',
    color: '#06b6d4',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="o-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#b45309"/><stop offset="50%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
      </defs>
      <!-- SYGNOWANA CECHA 1: DWA ZAWADIACKIE KUCYKI (Lewy i Prawy) -->
      <ellipse cx="14" cy="34" rx="11" ry="14" fill="url(#o-hair)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"/>
      <circle cx="21" cy="36" r="4" fill="#ec4899"/>
      <ellipse cx="86" cy="34" rx="11" ry="14" fill="url(#o-hair)" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.25))"/>
      <circle cx="79" cy="36" r="4" fill="#ec4899"/>
      <!-- Ramiona / koszulka sportowa fitness -->
      <path d="M22 96 C22 78 32 74 50 74 C68 74 78 78 78 96 Z" fill="#06b6d4"/>
      <path d="M38 74 L50 86 L62 74 Z" fill="#fed7aa"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fed7aa"/>
      <circle cx="22" cy="52" r="6" fill="#fed7aa"/>
      <circle cx="78" cy="52" r="6" fill="#fed7aa"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="50" rx="28" ry="30" fill="#fed7aa"/>
      <!-- Włosy na głowie -->
      <path d="M22 40 C22 20 34 16 50 16 C66 16 78 20 78 40 C74 26 62 22 50 22 C38 22 26 26 22 40 Z" fill="url(#o-hair)"/>
      <!-- SYGNOWANA CECHA 2: ZIELONA OPASKA SPORTOWA NA CZOLE -->
      <rect x="20" y="30" width="60" height="9" rx="4.5" fill="#10b981" stroke="#059669" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
      <line x1="25" y1="34.5" x2="75" y2="34.5" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.8"/>
      <!-- Oczy i wesołe mrugnięcie -->
      <circle cx="36" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="37" cy="46.5" r="1.3" fill="#ffffff"/>
      <!-- Drugie oko mrugające zawadiacko! -->
      <path d="M60 48 Q64 43 68 48" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Brwi -->
      <path d="M30 41 L40 40" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M60 40 L70 41" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Nos i uśmiech sportowca -->
      <path d="M48 49 Q50 53 52 50" stroke="#b45309" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M40 61 Q50 71 60 61" stroke="#dc2626" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <circle cx="28" cy="56" r="4.5" fill="#fb7185" opacity="0.35"/>
      <circle cx="72" cy="56" r="4.5" fill="#fb7185" opacity="0.35"/>
    </svg>`
  },
  {
    id: 'f7',
    name: 'Piotr',
    feature: 'Czarne wąsy a la Poirot i elegancki monokl',
    hook: 'Piotr pisze gęsim PIÓREM przez swój złoty monokl!',
    job: 'Detektyw',
    color: '#6366f1',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#eab308"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient>
      </defs>
      <!-- Płaszcz detektywa z klapami -->
      <path d="M18 96 C18 78 30 74 50 74 C70 74 82 78 82 96 Z" fill="#334155"/>
      <path d="M42 74 L50 86 L58 74 Z" fill="#ffffff"/>
      <path d="M47 74 L50 82 L53 74 Z" fill="#475569"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#ffedd5"/>
      <circle cx="21" cy="48" r="6.5" fill="#ffedd5"/>
      <circle cx="79" cy="48" r="6.5" fill="#ffedd5"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="46" rx="29" ry="30" fill="#ffedd5"/>
      <!-- Ulizana fryzura a la Poirot -->
      <path d="M21 38 C20 16 35 12 50 12 C65 12 80 16 79 38 C74 24 62 20 50 20 C38 20 26 24 21 38 Z" fill="#18181b"/>
      <!-- Lewe oko i brew -->
      <path d="M30 36 Q36 32 42 36" stroke="#18181b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="44" r="3.2" fill="#1e293b"/>
      <circle cx="37.2" cy="42.8" r="1.1" fill="#ffffff"/>
      <!-- Prawe oko (pod monoklem) -->
      <path d="M58 35 Q64 30 70 35" stroke="#18181b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="64" cy="44" r="3.5" fill="#1e293b"/>
      <circle cx="65.5" cy="42.5" r="1.3" fill="#ffffff"/>
      <!-- SYGNOWANA CECHA 1: ZŁOTY MONOKL Z ŁAŃCUSZKIEM -->
      <circle cx="64" cy="44" r="12" fill="none" stroke="url(#p-gold)" stroke-width="2.8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <path d="M57 38 Q64 34 71 37" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="0.75" stroke-linecap="round"/>
      <!-- Łańcuszek biegnący od monokla do klapy płaszcza -->
      <path d="M74 48 C80 58 78 72 70 82" stroke="url(#p-gold)" stroke-width="1.8" fill="none" stroke-dasharray="2 1.5"/>
      <!-- Nos detektywa -->
      <path d="M47 43 Q50 51 53 51" stroke="#d97706" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: ZAKRĘCONY WĄS A LA POIROT -->
      <path d="M26 56 C34 50 44 58 50 57 C56 58 66 50 74 56 C78 58 78 63 73 60 C66 56 56 65 50 60 C44 65 34 56 27 60 C22 63 22 58 26 56 Z" fill="#18181b" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <!-- Lekki dyskretny uśmieszek pod wąsem -->
      <path d="M44 66 Q50 70 56 66" stroke="#b45309" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'f8',
    name: 'Ania',
    feature: 'Uroczy pieprzyk nad ustami i srebrne kolczyki koła',
    hook: 'Ania je soczystego ANANASA, a sok skapuje na pieprzyk!',
    job: 'Fotografka',
    color: '#ec4899',
    svg: `<svg viewBox="0 0 100 100" class="face-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="an-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
        <linearGradient id="an-hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#262626"/><stop offset="100%" stop-color="#171717"/></linearGradient>
      </defs>
      <!-- Ramiona / stylowa koszulka fotografki z paskiem aparatu -->
      <path d="M20 96 C20 78 32 74 50 74 C68 74 80 78 80 96 Z" fill="#475569"/>
      <path d="M26 96 L60 74 L66 76 L32 96 Z" fill="#1e293b"/>
      <!-- Szyja i uszy -->
      <path d="M42 66 h16 v12 h-16 z" fill="#fef08a"/>
      <circle cx="22" cy="50" r="6.5" fill="#fef08a"/>
      <circle cx="78" cy="50" r="6.5" fill="#fef08a"/>
      <!-- SYGNOWANA CECHA 1: SREBRNE KOLCZYKI KOŁA (HOOP EARRINGS) -->
      <circle cx="19" cy="54" r="8" fill="none" stroke="url(#an-silver)" stroke-width="2.6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <circle cx="81" cy="54" r="8" fill="none" stroke="url(#an-silver)" stroke-width="2.6" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <!-- Głowa -->
      <ellipse cx="50" cy="48" rx="28" ry="30" fill="#fef08a"/>
      <!-- Fryzura: Stylowy ciemny bob z grzywką -->
      <path d="M18 46 C16 22 30 12 50 12 C70 12 84 22 82 46 C86 64 78 72 74 74 C78 56 80 40 76 34 C68 24 58 24 50 24 C42 24 32 24 24 34 C20 40 22 56 26 74 C22 72 14 64 18 46 Z" fill="url(#an-hair)"/>
      <path d="M26 30 Q50 20 74 30 Q50 26 26 30 Z" fill="#404040"/>
      <!-- Oczy z ładnymi rzęsami i brwi -->
      <path d="M32 38 Q37 34 43 38" stroke="#171717" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M57 38 Q63 34 69 38" stroke="#171717" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="46" r="3.5" fill="#451a03"/>
      <circle cx="38" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M33 44 L31 42 M41 44 L43 42" stroke="#171717" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="63" cy="46" r="3.5" fill="#451a03"/>
      <circle cx="64" cy="44.5" r="1.3" fill="#ffffff"/>
      <path d="M59 44 L57 42 M67 44 L69 42" stroke="#171717" stroke-width="1.3" stroke-linecap="round"/>
      <!-- Nos -->
      <path d="M48 47 Q50 52 52 50" stroke="#d97706" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <!-- Usta z malinową szminką -->
      <path d="M41 62 Q50 71 59 62" stroke="#e11d48" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- SYGNOWANA CECHA 2: UROCZY PIEPRZYK NAD USTAMI (BEAUTY MARK) -->
      <circle cx="43" cy="57" r="2.2" fill="#171717" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"/>
      <circle cx="28" cy="54" r="4.5" fill="#fb7185" opacity="0.3"/>
      <circle cx="72" cy="54" r="4.5" fill="#fb7185" opacity="0.3"/>
    </svg>`
  }
];
