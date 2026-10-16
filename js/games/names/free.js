import { h, rand, shuffle } from '../../dom.js';
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
  let timeLeft = modeId === 'speed' ? 30 : 0;
  let timerInterval = null;
  let pool = [...FACES];
  let cocktailPool = [FACES[0], FACES[1]];
  let currentTarget = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const timerEl = modeId === 'speed' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;

  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/names', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, modeId === 'cocktail' ? 'Goście' : 'Runda'), roundEl),
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    fox.el,
    playArea
  );

  root.append(view);

  function saveBest() {
    const prev = store.get(`names.best.${modeId}`, 0);
    if (score > prev) {
      store.set(`names.best.${modeId}`, score);
    }
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
    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Świetna gra!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Twój rekord: ${best}`),
        h('div', { class: 'go-actions' },
          h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie 🔄')
        )
      )
    );
    playArea.querySelector('.go-actions button').addEventListener('click', () => {
      mountFree(root, { modeId, nav });
    });
  }

  function nextRound() {
    if (isGameOver) return;
    playArea.innerHTML = '';

    if (modeId === 'who') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const others = pool.filter(f => f.id !== currentTarget.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([currentTarget, ...wrong]);

      const card = h('div', { class: 'who-target-card' },
        h('div', { class: 'who-avatar', html: currentTarget.svg }),
        h('div', { class: 'who-clue' }, 'Podpowiedź: ', currentTarget.feature)
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
            fox.setMood('cheer', 1200);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            fox.setMood('sad', 1200);
            fox.say(`To ${currentTarget.name}! Pamiętasz kotwicę: ${currentTarget.feature}?`, 'think', { revert: 2500 });
            btn.classList.add('wrong');
            setTimeout(nextRound, 1200);
          }
        });
        opts.append(btn);
      });

      playArea.append(card, opts);
    } else if (modeId === 'find') {
      currentTarget = pool[rand(0, pool.length - 1)];
      const displayed = shuffle(pool).slice(0, 6);
      if (!displayed.some(f => f.id === currentTarget.id)) {
        displayed[0] = currentTarget;
      }
      const shuffled = shuffle(displayed);

      const question = h('div', { class: 'find-question' },
        h('h3', {}, `Znajdź: `, h('span', { class: 'grad' }, currentTarget.name)),
        h('p', {}, `Zawód: ${currentTarget.job}`)
      );

      const grid = h('div', { class: 'faces-selection-grid' });
      shuffled.forEach(f => {
        const btn = h('button', { class: 'face-tile-btn', type: 'button', html: f.svg });
        btn.addEventListener('click', () => {
          if (f.id === currentTarget.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            fox.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            fox.setMood('sad', 1000);
            btn.classList.add('wrong');
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
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            nextRound();
          } else {
            sfx.wrong();
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
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
      }
    }, 1000);
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    fox.destroy();
  };
}
