import { h, rand, shuffle } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createTurtle } from '../../turtle.js';
import { DAYS_OF_WEEK, MONTH_ANCHORS, calculateWeekday } from './logic.js';
import { MODES } from './modes.js';

export function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const turtle = createTurtle({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let timeLeft = modeId === 'clock_beat' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const timerEl = modeId === 'clock_beat' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/calendar', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    turtle.el,
    playArea
  );

  root.append(view);

  function saveBest() {
    const prev = store.get(`calendar.best.${modeId}`, 0);
    if (score > prev) store.set(`calendar.best.${modeId}`, score);
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    turtle.setMood('cheer', 3000);
    turtle.say(`Koniec czasu! Twój wynik: ${score} pkt! Prawdziwy władca kalendarza! 🐢`, 'cheer');

    const best = store.get(`calendar.best.${modeId}`, score);
    playArea.innerHTML = '';
    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Mistrzowski wynik!'),
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

    if (modeId === 'weekday' || modeId === 'clock_beat' || modeId === 'time_travel') {
      const year = modeId === 'time_travel' ? rand(1975, 2035) : 2026;
      const mIdx = rand(0, MONTH_ANCHORS.length - 1);
      const mInfo = MONTH_ANCHORS[mIdx];
      const maxDays = [1, 3, 5, 7, 8, 10, 12].includes(mInfo.month) ? 31 : mInfo.month === 2 ? 28 : 30;
      const day = rand(1, maxDays);
      const correctDayIdx = calculateWeekday(year, mInfo.month, day);
      const correctDay = DAYS_OF_WEEK[correctDayIdx];

      const card = h('div', { class: 'calendar-card' },
        h('div', { class: 'cal-date-badge' }, `${day} ${mInfo.name.toLowerCase()} ${year}`),
        h('h2', {}, 'Jaki to dzień tygodnia?'),
        h('p', { class: 'text-muted' }, `Wskazówka: kotwica miesiąca to ${mInfo.anchorDay}.${mInfo.month < 10 ? '0' + mInfo.month : mInfo.month}`)
      );

      const opts = h('div', { class: 'opt-grid' });
      DAYS_OF_WEEK.forEach(d => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${d.emoji} ${d.name}`);
        btn.addEventListener('click', () => {
          if (d.id === correctDayIdx) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            turtle.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            if (modeId === 'time_travel') {
              gameOver();
            } else {
              combo = 0;
              turtle.setMood('sad', 1200);
              turtle.say(`${day} ${mInfo.name} ${year} to ${correctDay.name}!`, 'think', { revert: 2800 });
              btn.classList.add('wrong');
              setTimeout(nextRound, 1200);
            }
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);

    } else if (modeId === 'anchors') {
      const target = MONTH_ANCHORS[rand(0, MONTH_ANCHORS.length - 1)];
      const card = h('div', { class: 'calendar-card' },
        h('h2', {}, `Miesiąc: `, h('span', { class: 'grad' }, target.name)),
        h('p', { class: 'text-muted' }, 'Który dzień tego miesiąca jest kotwicą Doomsday?')
      );

      const others = MONTH_ANCHORS.filter(m => m.anchorDay !== target.anchorDay);
      const wrong = shuffle(others).map(m => m.anchorDay).slice(0, 3);
      const choices = shuffle([target.anchorDay, ...wrong]);

      const opts = h('div', { class: 'opt-grid' });
      choices.forEach(dayChoice => {
        const btn = h('button', { class: 'btn-opt', type: 'button' }, `${dayChoice}. dzień miesiąca`);
        btn.addEventListener('click', () => {
          if (dayChoice === target.anchorDay) {
            sfx.success();
            score += 15 + combo * 3;
            combo++;
            round++;
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            turtle.setMood('cheer', 1000);
            nextRound();
          } else {
            sfx.wrong();
            combo = 0;
            turtle.setMood('sad', 1200);
            turtle.say(`Dla ${target.name} kotwicą jest ${target.anchorDay}. dzień (${target.rule})!`, 'think', { revert: 2800 });
            btn.classList.add('wrong');
            setTimeout(nextRound, 1200);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  if (modeId === 'clock_beat') {
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
    turtle.destroy();
  };
}
