import { h, rand, shuffle } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createSquirrel } from '../../squirrel.js';
import { LINK_ITEMS } from './chains.js';
import { MODES } from './modes.js';

export function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const squirrel = createSquirrel({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/link', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Ogniwo'), roundEl)
    ),
    squirrel.el,
    playArea
  );

  root.append(view);

  function saveBest() {
    const prev = store.get(`link.best.${modeId}`, 0);
    if (score > prev) store.set(`link.best.${modeId}`, score);
  }

  function gameOver() {
    isGameOver = true;
    saveBest();
    sfx.fanfare();
    squirrel.setMood('cheer', 3000);
    squirrel.say(`Koniec gry! Twój wynik: ${score} pkt! Łańcuch trzymał się dzielnie! 🐿️`, 'cheer');

    const best = store.get(`link.best.${modeId}`, score);
    playArea.innerHTML = '';
    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Świetny łańcuch myśli!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
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

    if (modeId === 'forward') {
      const idx = rand(0, LINK_ITEMS.length - 2);
      const curr = LINK_ITEMS[idx];
      const nextItem = LINK_ITEMS[idx + 1];

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, curr.emoji),
        h('h2', {}, curr.name),
        h('p', { class: 'link-action-hint' }, `Akcja: ${curr.storyAction}`),
        h('p', { class: 'text-muted' }, 'Co jest kolejnym ogniwem w tym łańcuchu?')
      );

      const others = LINK_ITEMS.filter(it => it.id !== nextItem.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([nextItem, ...wrong]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === nextItem.id) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            squirrel.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            squirrel.setMood('sad', 1200);
            squirrel.say(`Po ${curr.name} następuje ${nextItem.name}!`, 'think', { revert: 2800 });
            btn.classList.add('wrong');
            setTimeout(nextRound, 1200);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'reverse') {
      const idx = rand(1, LINK_ITEMS.length - 1);
      const curr = LINK_ITEMS[idx];
      const prevItem = LINK_ITEMS[idx - 1];

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, curr.emoji),
        h('h2', {}, curr.name),
        h('p', { class: 'text-muted' }, 'Cofamy taśmę! Jaki przedmiot znajdował się bezpośrednio przed nim?')
      );

      const others = LINK_ITEMS.filter(it => it.id !== prevItem.id);
      const wrong = shuffle(others).slice(0, 3);
      const choices = shuffle([prevItem, ...wrong]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === prevItem.id) {
            sfx.success();
            score += 20 + combo * 4;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            squirrel.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            squirrel.setMood('sad', 1200);
            squirrel.say(`Przed ${curr.name} był ${prevItem.name}!`, 'think', { revert: 2800 });
            btn.classList.add('wrong');
            setTimeout(nextRound, 1200);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'missing_link') {
      const idx = rand(0, LINK_ITEMS.length - 3);
      const first = LINK_ITEMS[idx];
      const middle = LINK_ITEMS[idx + 1];
      const last = LINK_ITEMS[idx + 2];

      const card = h('div', { class: 'link-card' },
        h('div', { class: 'missing-chain-row' },
          h('span', { class: 'mc-item' }, `${first.emoji} ${first.name}`),
          h('span', { class: 'mc-arrow' }, '➡️'),
          h('span', { class: 'mc-item unknown' }, '❓ [?]'),
          h('span', { class: 'mc-arrow' }, '➡️'),
          h('span', { class: 'mc-item' }, `${last.emoji} ${last.name}`)
        ),
        h('p', { class: 'text-muted' }, 'Jakie ogniwo łączy te dwa przedmioty w historii?')
      );

      const others = LINK_ITEMS.filter(it => it.id !== middle.id);
      const choices = shuffle([middle, ...shuffle(others).slice(0, 3)]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === middle.id) {
            sfx.success();
            score += 20 + combo * 4;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            squirrel.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            gameOver();
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'endless_chain') {
      const idx = rand(0, LINK_ITEMS.length - 2);
      const curr = LINK_ITEMS[idx];
      const nextItem = LINK_ITEMS[idx + 1];

      const card = h('div', { class: 'link-card' },
        h('span', { class: 'link-emoji' }, curr.emoji),
        h('h2', {}, curr.name),
        h('p', {}, `Ogniwo #${round} w łańcuchu domina.`),
        h('p', { class: 'text-muted' }, 'Wskaż natychmiast kolejne powiązanie:')
      );

      const others = LINK_ITEMS.filter(it => it.id !== nextItem.id);
      const choices = shuffle([nextItem, ...shuffle(others).slice(0, 3)]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(c => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${c.emoji} ${c.name}`);
        btn.addEventListener('click', () => {
          if (c.id === nextItem.id) {
            sfx.success();
            score += 25 + round * 5;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            squirrel.setMood('cheer', 1000);
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

  nextRound();
  return () => squirrel.destroy();
}
