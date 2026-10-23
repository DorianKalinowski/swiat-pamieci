import { h, rand, shuffle, sleep } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createFox } from '../../fox.js';
import { FACES } from './faces.js';
import { MODES } from './modes.js';

export function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const fox = createFox({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'speed' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const pool = [...FACES];
  let cocktailPool = [FACES[0], FACES[1], FACES[2]];
  let currentTarget = null;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = (modeId === 'who' || modeId === 'find') ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'speed' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/names', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    fox.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Lisi spryt w akcji! Twarz zapamiętana! 🦊✨',
    'Kotwica zadziałała bezbłędnie! ⚓🎯',
    'Oko detektywa! Nikt się przed Tobą nie ukryje! 🔍⭐',
    'Brawo! Twoja pamięć do twarzy imponuje! 🌟',
    'Hau! Celne trafienie prosto w dziesiątkę! 🎯🦊',
    'Genialnie! Kojarzenie na poziomie mistrza! 🧠💡',
    'Lisek skacze z radości! Jesteś nie do zatrzymania! 🐾🎉'
  ];
  function cheerFox(c) {
    if (c % 5 === 0 && c > 0) {
      fox.say(`Niewiarygodne combo x${c}! Jesteś legendą bankietu! 🦊🏆✨`, 'cheer', { revert: 1800 });
      fox.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      fox.say(`Combo x${c}! Twoje oko wyłapie każdy detal! 🦊✨`, 'cheer', { revert: 1400 });
      fox.hop?.();
    } else {
      fox.hop?.();
      fox.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`names.best.${modeId}`, 0);
    if (score > prev) {
      store.set(`names.best.${modeId}`, score);
    }
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  function restartGame() {
    isGameOver = false;
    score = 0;
    round = 1;
    combo = 0;
    lives = 3;
    cocktailPool = [FACES[0], FACES[1], FACES[2]];
    timeLeft = modeId === 'speed' ? 30 : 0;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timerInterval) clearInterval(timerInterval);
    if (modeId === 'speed') startTimer();
    fox.setMood('happy');
    fox.say('Zaczynamy od nowa! Pokaż lisi spryt! 🦊✨', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    fox.setMood('cheer', 3000);
    fox.say(`Koniec gry! Twój wynik: ${score} pkt! Wspaniała spostrzegawczość! 🦊`, 'cheer');

    const best = store.get(`names.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/names' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Świetna gra!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Twój rekord: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'who') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const others = pool.filter(f => f.id !== currentTarget.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([currentTarget, ...wrong]);

      // W pierwszych 3 rundach dajemy podpowiedź cechy, potem gracz musi rozpoznać sam!
      const clueText = round <= 3
        ? `Podpowiedź cechy: ${currentTarget.feature}`
        : 'Rozpoznaj twarz z własnej pamięci!';

      const card = h('div', { class: 'who-target-card' },
        h('div', { class: 'who-avatar', html: currentTarget.svg }),
        h('div', { class: 'who-clue' }, clueText)
      );

      const opts = h('div', { class: 'who-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt-face', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === currentTarget.id) {
            sfx.success();
            score += 10 + combo * 2;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerFox(combo);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            lives--;
            updateLives();
            btn.classList.add('wrong');
            if (lives <= 0) {
              gameOver();
            } else {
              fox.setMood('sad', 1200);
              fox.say(`To ${currentTarget.name}! Kotwica: ${currentTarget.feature} ⚓ Masz jeszcze ${lives} szanse. 🦊`, 'think', { revert: 2600 });
              setTimeout(nextRound, 1200);
            }
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);
    } else if (modeId === 'find') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const count = Math.min(pool.length, round <= 2 ? 4 : round <= 5 ? 6 : 8);
      const others = pool.filter(f => f.id !== currentTarget.id);
      const displayed = shuffle([currentTarget, ...shuffle(others).slice(0, count - 1)]);

      const question = h('div', { class: 'find-question' },
        h('h3', {}, `Znajdź: `, h('span', { class: 'grad' }, currentTarget.name)),
        h('p', {}, `Zawód: ${currentTarget.job}`)
      );

      const grid = h('div', { class: 'faces-selection-grid' });
      displayed.forEach(f => {
        const btn = h('button', { class: 'face-tile-btn', type: 'button', html: f.svg });
        btn.addEventListener('click', () => {
          if (f.id === currentTarget.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerFox(combo);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            lives--;
            updateLives();
            btn.classList.add('wrong');
            if (lives <= 0) {
              gameOver();
            } else {
              fox.setMood('sad', 1000);
              fox.say(`To nie ta osoba! Przypomnij sobie jej cechę 🔍 Pozostało szans: ${lives}`, 'think', { revert: 2200 });
            }
          }
        });
        grid.append(btn);
      });

      playArea.append(question, grid);
    } else if (modeId === 'speed') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const others = pool.filter(f => f.id !== currentTarget.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([currentTarget, ...wrong]);

      const card = h('div', { class: 'who-target-card' },
        h('div', { class: 'who-avatar', html: currentTarget.svg })
      );

      const opts = h('div', { class: 'who-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt-face', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === currentTarget.id) {
            sfx.pop();
            score += 10;
            timeLeft += 2; // bonus czasowy
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
            nextRound();
          } else {
            sfx.wrong();
            timeLeft = Math.max(1, timeLeft - 2);
            if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
            btn.classList.add('wrong');
            setTimeout(nextRound, 300);
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);
    } else if (modeId === 'cocktail') {
      // Cocktail party endless mode
      if (round > cocktailPool.length && cocktailPool.length < pool.length) {
        cocktailPool.push(pool[cocktailPool.length]);
      }
      currentTarget = cocktailPool[rand(0, cocktailPool.length - 1)];
      const choices = shuffle(cocktailPool);

      const card = h('div', { class: 'who-target-card' },
        h('div', { class: 'who-avatar', html: currentTarget.svg }),
        h('div', { class: 'who-clue' }, `Gość na bankiecie (${cocktailPool.length} osób w sali)`)
      );

      const opts = h('div', { class: 'who-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt-face', type: 'button' }, c.name);
        btn.addEventListener('click', () => {
          if (c.id === currentTarget.id) {
            sfx.success();
            score += 20 + cocktailPool.length * 5;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${cocktailPool.length}`;
            fox.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            gameOver();
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);
    }
  }

  if (modeId === 'speed') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    fox.destroy();
  };
}
