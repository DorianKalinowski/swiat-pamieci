import { h } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createTurtle } from '../../turtle.js';
import { LESSONS } from './lessons.js';

export function mountMap(root, { nav }) {
  const turtle = createTurtle({ size: 'md' });
  const prog = store.get('calendar.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const items = LESSONS.map((les, idx) => {
    const stars = prog[les.id] || 0;
    const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
    return h('div', { class: `map-node ${stars ? 'done' : ''} ${isLocked ? 'locked' : ''}` },
      h('div', { class: 'mn-idx' }, `${idx + 1}`),
      h('div', { class: 'mn-body' },
        h('h3', {}, les.title),
        h('p', {}, les.subtitle),
        h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
      ),
      isLocked
        ? h('span', { class: 'mn-lock' }, '🔒')
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/calendar/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Błyskawiczne planowanie spotkań, terminów i wyjazdów bez sięgania po smartfon. Zrobisz też genialny popis na imprezie, podając dzień tygodnia urodzin każdego ze znajomych!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/calendar', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🐢 ', h('span', { class: 'grad' }, 'Kalendarz w głowie z Żółwikiem')),
    h('p', { class: 'lead' }, 'Poznaj algorytm Doomsday i naucz się podawać dzień tygodnia każdej daty w kilka sekund.'),
    turtle.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    turtle.say(
      doneCount === 0
        ? 'Tik-tak! Jestem Żółwik Zegarowy 🐢 Nauczę Cię czytać czas w pamięci bez pośpiechu!'
        : `Świetnie! Mamy ${doneCount}/${LESSONS.length} lekcji czasu za sobą! Idziemy dalej?`,
      'happy'
    );
  }, 200);

  return () => turtle.destroy();
}

export function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const turtle = createTurtle({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🐢 Mądrość Żółwika: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🐢 Podpowiedź Żółwika');
  hintBtn.addEventListener('click', () => {
    turtle.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/calendar/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    turtle.el,
    theoryBox,
    h('div', { class: 'task-box' },
      h('h3', { class: 'task-prompt' }, les.task.prompt),
      optContainer,
      h('div', { class: 'task-foot' }, hintBtn)
    )
  );

  function pick(idx, btn) {
    if (answered) return;
    const isOk = idx === les.task.correct;
    if (isOk) {
      answered = true;
      btn.classList.add('correct');
      sfx.success();
      turtle.setMood('cheer', 2500);
      turtle.say('Perfekcyjnie! Czas nie ma przed Tobą żadnych tajemnic!', 'cheer');

      const prog = store.get('calendar.train', {});
      prog[les.id] = 3;
      store.set('calendar.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie czasu! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/calendar/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/calendar';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      turtle.setMood('sad', 1800);
      turtle.say(les.task.hint, 'think', { revert: 3500 });
      setTimeout(() => btn.classList.remove('wrong'), 800);
    }
  }

  (les.task.options || []).forEach((opt, idx) => {
    const btn = h('button', { class: 'btn-opt', type: 'button' }, opt);
    btn.addEventListener('click', () => pick(idx, btn));
    optContainer.append(btn);
  });

  root.append(view);
  setTimeout(() => {
    turtle.say(les.speech || `Cześć! Lekcja ${index + 1}: ${les.subtitle}. Spokojnie zbadajmy daty!`, 'happy');
  }, 250);

  return () => turtle.destroy();
}
