import { h, rand, shuffle } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createOctopus } from '../../octopus.js';
import { MIND_MAPS } from './mindmaps.js';
import { MODES } from './modes.js';

export function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const octopus = createOctopus({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'speed_map' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = modeId !== 'speed_map' ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'speed_map' ? h('span', { class: 'hud-timer' }, '⏱ ', h('b', {}, '30s')) : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/mindmap', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    octopus.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Plusk! Genialne połączenie na mapie myśli! 🐙💡',
    'Oto siła nielinearnych notatek! Masz to w głowie! 🎨✨',
    'Twoje macki myśli sięgają wszędzie! Pięknie! 🧠⚡',
    'Brakująca gałąź znaleziona w ułamku sekundy! 🗺️⭐',
    'Czysta kartografia umysłu! Inka bije brawo wszystkimi mackami! 🌊👏'
  ];

  function cheerInka(c) {
    if (c % 5 === 0 && c > 0) {
      octopus.say(`Niesamowita seria x${c}! Ośmiornica Inka kręci piruety z zachwytu! 🐙🏆✨`, 'cheer', { revert: 1800 });
      octopus.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      octopus.say(`Combo x${c}! Twoje neurony rozrastają się jak rafa koralowa! 🪸⚡`, 'cheer', { revert: 1400 });
      octopus.hop?.();
    } else {
      octopus.hop?.();
      octopus.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      if (isGameOver) return;
      timeLeft--;
      if (timerEl) {
        timerEl.replaceChildren('⏱ ', h('b', {}, `${timeLeft}s`));
      }
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    playArea.innerHTML = '';

    const bestKey = `mindmap.free.${modeId}.best`;
    const prevBest = store.get(bestKey, 0);
    const isNewRecord = score > prevBest;
    if (isNewRecord) store.set(bestKey, score);

    sfx.fanfare();
    octopus.setMood('happy');
    octopus.say(
      score > 60
        ? `Wspaniały wynik! Zdobywasz ${score} punktów! Ośmiornica Inka jest pod wielkim wrażeniem! 🐙🏆`
        : `Dobra runda! Zdobywasz ${score} punktów. Z każdą mapą myśli Twoja pamięć jest coraz silniejsza! 💡`,
      'happy'
    );

    const restartBtn = h('button', { class: 'btn btn-primary btn-lg', type: 'button' }, 'Zagraj ponownie 🔄');
    restartBtn.addEventListener('click', () => {
      score = 0;
      round = 1;
      combo = 0;
      lives = 3;
      timeLeft = modeId === 'speed_map' ? 30 : 0;
      isGameOver = false;
      scoreEl.textContent = '0';
      roundEl.textContent = '1';
      updateLives();
      if (timerEl) timerEl.textContent = '⏱ 30s';
      nextRound();
      if (modeId === 'speed_map') startTimer();
    });

    const goCard = h('div', { class: 'go-card' },
      h('div', { class: 'go-badge' }, 'Koniec gry! 🐙'),
      h('h2', {}, 'Świetny trening map myśli!'),
      h('div', { class: 'go-score' }, `${score} pkt`),
      isNewRecord ? h('p', { class: 'badge badge-gold mb-2' }, '⭐ NOWY REKORD! ⭐') : null,
      h('p', { class: 'text-muted mb-4' }, `Najlepszy wynik: ${Math.max(prevBest, score)} pkt`),
      h('div', { class: 'go-actions' },
        restartBtn,
        h('a', { class: 'btn btn-ghost btn-lg', href: '#/mindmap' }, '← Zmień tryb')
      )
    );

    playArea.append(goCard);
  }

  function handleWrong(solution) {
    sfx.wrong();
    combo = 0;
    if (modeId !== 'speed_map') {
      lives--;
      updateLives();
      if (lives <= 0) {
        octopus.setMood('sad', 1500);
        octopus.say(`Koniec szans! Prawidłowa odpowiedź to: ${solution}. Zobaczmy Twój wynik! 🐙`, 'think', { revert: 2200 });
        setTimeout(gameOver, 800);
        return;
      }
    }
    octopus.setMood('sad', 1200);
    octopus.say(`Oj, pomyłka! Prawidłowa odpowiedź: ${solution}. Walczymy dalej! 💡`, 'think', { revert: 2000 });
    round++;
    roundEl.textContent = `${round}`;
    setTimeout(nextRound, 700);
  }

  function handleCorrect(pts = 10) {
    sfx.pop();
    score += pts + combo * 2;
    combo++;
    scoreEl.textContent = `${score}`;
    cheerInka(combo);
    round++;
    roundEl.textContent = `${round}`;
    setTimeout(nextRound, 550);
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';
    let answered = false;

    const m = rand(MIND_MAPS);

    switch (modeId) {
      // 1. BRAKUJĄCA GAŁĄŹ: jedno z 4 ramion ma znak ?
      case 'missing_branch': {
        const targetBranch = rand(m.branches);
        const wrongBranches = MIND_MAPS.flatMap(mm => mm.branches)
          .filter(b => b.name !== targetBranch.name)
          .map(b => `${b.emoji} ${b.name}`);
        const choices = shuffle([`${targetBranch.emoji} ${targetBranch.name}`, ...shuffle(wrongBranches).slice(0, 3)]);

        const mapPreview = h('div', { class: 'mindmap-card' },
          h('div', { class: 'mm-center-badge' }, `${m.emoji} ${m.title}`),
          h('div', { class: 'mm-branches-preview' },
            m.branches.map(b => {
              const isTarget = b.name === targetBranch.name;
              return h('div', { class: `mm-branch-pill ${isTarget ? 'target' : ''}` },
                isTarget ? '❓ [Brakujące ramię]' : `${b.emoji} ${b.name}`
              );
            })
          ),
          h('p', { class: 'lead' }, `Jak nazywa się brakujące ramię w mapie myśli „${m.title}”?`)
        );

        const optGrid = h('div', { class: 'choice-grid opt-grid' });
        choices.forEach(c => {
          const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
          btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            if (c === `${targetBranch.emoji} ${targetBranch.name}`) {
              btn.classList.add('correct');
              handleCorrect(15);
            } else {
              btn.classList.add('wrong');
              handleWrong(`${targetBranch.emoji} ${targetBranch.name}`);
            }
          });
          optGrid.append(btn);
        });

        playArea.append(mapPreview, optGrid);
        break;
      }

      // 2. GDZIE PRZYPIĄĆ MACKĘ: do której gałęzi należy element?
      case 'categorize': {
        const branch = rand(m.branches);
        const item = rand(branch.items);
        const otherBranches = m.branches.filter(b => b.name !== branch.name);
        const choices = shuffle([`${branch.emoji} ${branch.name}`, ...otherBranches.map(b => `${b.emoji} ${b.name}`)]);

        const card = h('div', { class: 'mindmap-card' },
          h('div', { class: 'mm-center-badge' }, `${m.emoji} ${m.title}`),
          h('div', { class: 'mm-item-showcase' }, item),
          h('p', { class: 'lead' }, `Do którego ramienia mapy myśli „${m.title}” przypniesz element „${item}”?`)
        );

        const optGrid = h('div', { class: 'choice-grid opt-grid' });
        choices.forEach(c => {
          const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
          btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            if (c === `${branch.emoji} ${branch.name}`) {
              btn.classList.add('correct');
              handleCorrect(12);
            } else {
              btn.classList.add('wrong');
              handleWrong(`${branch.emoji} ${branch.name}`);
            }
          });
          optGrid.append(btn);
        });

        playArea.append(card, optGrid);
        break;
      }

      // 3. ZNAJDŹ INTRUZA: jeden element nie pasuje do gałęzi
      case 'find_intruder': {
        const branch = rand(m.branches);
        const legitimateItems = shuffle(branch.items).slice(0, 3);
        // Pobierz intruza z zupełnie innej mapy
        const otherMaps = MIND_MAPS.filter(mm => mm.id !== m.id);
        const randomOtherMap = rand(otherMaps);
        const intruder = rand(rand(randomOtherMap.branches).items);

        const choices = shuffle([...legitimateItems, intruder]);

        const card = h('div', { class: 'mindmap-card' },
          h('div', { class: 'mm-center-badge' }, `${m.emoji} ${m.title}`),
          h('div', { class: 'mm-branch-focus' }, `Ramię: ${branch.emoji} ${branch.name}`),
          h('p', { class: 'lead' }, `Który z poniższych elementów jest INTRUZEM i nie pasuje do tej gałęzi?`)
        );

        const optGrid = h('div', { class: 'choice-grid opt-grid' });
        choices.forEach(c => {
          const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
          btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            if (c === intruder) {
              btn.classList.add('correct');
              handleCorrect(15);
            } else {
              btn.classList.add('wrong');
              handleWrong(intruder);
            }
          });
          optGrid.append(btn);
        });

        playArea.append(card, optGrid);
        break;
      }

      // 4. WYŚCIG Z INKĄ (30 sekund)
      case 'speed_map': {
        const branch = rand(m.branches);
        const item = rand(branch.items);
        const wrongBranches = MIND_MAPS.flatMap(mm => mm.branches)
          .filter(b => b.name !== branch.name)
          .map(b => `${b.emoji} ${b.name}`);
        const choices = shuffle([`${branch.emoji} ${branch.name}`, ...shuffle(wrongBranches).slice(0, 3)]);

        const card = h('div', { class: 'mindmap-card' },
          h('div', { class: 'mm-center-badge' }, `${m.emoji} ${m.title}`),
          h('div', { class: 'mm-item-showcase speed' }, item),
          h('p', { class: 'lead' }, `Szybko! Do którego ramienia należy „${item}”?`)
        );

        const optGrid = h('div', { class: 'choice-grid opt-grid' });
        choices.forEach(c => {
          const btn = h('button', { class: 'btn-opt', type: 'button' }, c);
          btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            if (c === `${branch.emoji} ${branch.name}`) {
              btn.classList.add('correct');
              handleCorrect(15);
            } else {
              btn.classList.add('wrong');
              handleWrong(`${branch.emoji} ${branch.name}`);
            }
          });
          optGrid.append(btn);
        });

        playArea.append(card, optGrid);
        break;
      }
    }
  }

  nextRound();
  if (modeId === 'speed_map') startTimer();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    octopus.destroy();
  };
}
