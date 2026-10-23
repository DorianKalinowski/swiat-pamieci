import { h, rand, shuffle, sleep } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createTurtle } from '../../turtle.js';
import { MONTH_ANCHORS, DAYS_OF_WEEK, calculateWeekday } from './logic.js';
import { MODES } from './modes.js';

export function mountFree(root, { modeId, nav }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const turtle = createTurtle({ size: 'md' });

  let score = 0;
  let round = 1;
  let combo = 0;
  let lives = 3;
  let timeLeft = modeId === 'clock_beat' ? 30 : 0;
  let timerInterval = null;
  let isGameOver = false;

  const scoreEl = h('span', { class: 'hud-score' }, '0');
  const roundEl = h('span', { class: 'hud-round' }, '1');
  const livesEl = (modeId === 'weekday' || modeId === 'anchors') ? h('span', { class: 'hud-lives' }, '❤️❤️❤️') : null;
  const timerEl = modeId === 'clock_beat' ? h('span', { class: 'hud-timer' }, '⏱ 30s') : null;
  const playArea = h('div', { class: 'free-play-area' });

  const view = h('section', { class: 'screen free-screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/calendar', class: 'back' }, '← Wybór trybu')),
    h('div', { class: 'hud' },
      h('div', { class: 'hud-item' }, h('small', {}, 'Wynik'), scoreEl),
      h('div', { class: 'hud-item' }, h('small', {}, 'Runda'), roundEl),
      livesEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Szanse'), livesEl) : null,
      timerEl ? h('div', { class: 'hud-item' }, h('small', {}, 'Czas'), timerEl) : null
    ),
    turtle.el,
    playArea
  );

  root.append(view);

  const CHEERS = [
    'Dzień obliczony w ułamku sekundy! 🐢⚡',
    'Prawdziwy władca czasu i kalendarza! 📅✨',
    'Algorytm Conwaya opanowany po mistrzowsku! 🧠⏱️',
    'Bez pudła! Żółwik kłania się w uznaniu! 🎯🐢',
    'Zegarmistrzowska precyzja! Nic Cię nie zaskoczy! ⏰⭐',
    'Spokój i geniusz! Kalendarz w Twojej głowie lśni! 🪐🗓️'
  ];
  function cheerTurtle(c) {
    if (c % 5 === 0 && c > 0) {
      turtle.say(`Absolutne mistrzostwo x${c}! Żółwik Zenon bije brawo z zachwytu! 🐢🏆⏱️`, 'cheer', { revert: 1800 });
      turtle.spin?.();
    } else if (c % 2 === 0 && c > 0) {
      turtle.say(`Combo x${c}! Twój zegar biologiczny wyprzedza komputery! 🐢✨`, 'cheer', { revert: 1400 });
      turtle.hop?.();
    } else {
      turtle.hop?.();
      turtle.say(rand(CHEERS), 'cheer', { revert: 1100 });
    }
  }

  function updateLives() {
    if (livesEl) {
      livesEl.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    }
  }

  function saveBest() {
    const prev = store.get(`calendar.best.${modeId}`, 0);
    if (score > prev) store.set(`calendar.best.${modeId}`, score);
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
    timeLeft = modeId === 'clock_beat' ? 30 : 0;
    scoreEl.textContent = '0';
    roundEl.textContent = '1';
    updateLives();
    if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
    if (timerInterval) clearInterval(timerInterval);
    if (modeId === 'clock_beat') startTimer();
    turtle.setMood('happy');
    turtle.say('Zaczynamy od nowa! Kalendarz w Twojej głowie! 🐢🗓️', 'happy');
    nextRound();
  }

  function gameOver() {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    saveBest();
    sfx.fanfare();
    turtle.setMood('cheer', 3000);
    turtle.say(`Koniec gry! Twój wynik: ${score} pkt! Prawdziwy władca kalendarza! 🐢`, 'cheer');

    const best = store.get(`calendar.best.${modeId}`, score);
    playArea.innerHTML = '';

    const restartBtn = h('button', { class: 'btn btn-primary', type: 'button' }, 'Zagraj ponownie ↻');
    restartBtn.addEventListener('click', restartGame);
    const backBtn = h('a', { class: 'btn btn-ghost', href: '#/calendar' }, 'Inny tryb');

    playArea.append(
      h('div', { class: 'game-over-box' },
        h('h2', {}, '🎉 Mistrzowski wynik!'),
        h('div', { class: 'go-score' },
          h('b', {}, `${score}`),
          h('span', {}, 'punktów')
        ),
        h('div', { class: 'go-best' }, `🏆 Rekord w tym trybie: ${best}`),
        h('div', { class: 'go-actions' }, restartBtn, backBtn)
      )
    );
  }

  function handleWrong(solutionText) {
    sfx.wrong();
    combo = 0;
    if (modeId === 'time_travel') {
      gameOver();
      return;
    }
    lives--;
    updateLives();
    if (lives <= 0) {
      gameOver();
    } else {
      turtle.setMood('sad', 1200);
      turtle.say(`${solutionText} Pozostało szans: ${lives} 🐢`, 'think', { revert: 2600 });
      setTimeout(nextRound, 1200);
    }
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

      const hintText = round <= 3 && modeId === 'weekday'
        ? `Wskazówka: kotwica miesiąca to ${mInfo.anchorDay}.${mInfo.month < 10 ? '0' + mInfo.month : mInfo.month}`
        : null;

      const card = h('div', { class: 'calendar-card' },
        h('div', { class: 'cal-date-badge' }, `${day} ${mInfo.name.toLowerCase()} ${year}`),
        h('h2', {}, 'Jaki to dzień tygodnia?'),
        hintText ? h('p', { class: 'muted' }, hintText) : null
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
            if (modeId === 'clock_beat') {
              timeLeft += 2; // bonus czasowy
              if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
            }
            scoreEl.textContent = `${score}`;
            roundEl.textContent = `${round}`;
            cheerTurtle(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            if (modeId === 'clock_beat') {
              sfx.wrong();
              timeLeft = Math.max(1, timeLeft - 2);
              if (timerEl) timerEl.textContent = `⏱ ${timeLeft}s`;
              setTimeout(nextRound, 300);
            } else {
              handleWrong(`${day} ${mInfo.name} ${year} to ${correctDay.name}!`);
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
        h('p', { class: 'muted' }, 'Który dzień tego miesiąca jest kotwicą Doomsday?')
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
            cheerTurtle(combo);
            nextRound();
          } else {
            btn.classList.add('wrong');
            handleWrong(`Dla ${target.name} kotwicą jest ${target.anchorDay}. dzień (${target.rule})!`);
          }
        });
        opts.append(btn);
      });
      playArea.append(card, opts);
    }
  }

  if (modeId === 'clock_beat') {
    startTimer();
  }

  nextRound();

  return () => {
    if (timerInterval) clearInterval(timerInterval);
    turtle.destroy();
  };
}
