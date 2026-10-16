import { h } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createOwl } from '../../owl.js';
import { LESSONS } from './lessons.js';
import { PHONETIC_MAP } from './codes.js';

export function mountMap(root, { nav }) {
  const owl = createOwl({ size: 'md' });
  const prog = store.get('major.train', {});
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
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/major/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/major', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦉 ', h('span', { class: 'grad' }, 'Akademia Majora ze Sówką')),
    h('p', { class: 'lead' }, '8 fundamentalnych lekcji, od dźwięków 0-9 po swobodne zapamiętywanie kodów PIN i PESEL.'),
    owl.el,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    owl.say(
      doneCount === 0
        ? 'Uhuhu! Jestem Sówka Profesor 🦉 Znam tajemny kod zamieniający nudne cyfry w barwne obrazy!'
        : `Świetny postęp! Masz już ${doneCount}/${LESSONS.length} wykładów zaliczonych!`,
      'happy'
    );
  }, 200);

  return () => owl.destroy();
}

export function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const owl = createOwl({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🎓 Wykład: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🦉 Podpowiedź Sówki');
  hintBtn.addEventListener('click', () => {
    owl.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/major/train', class: 'back' }, '← Wykaz lekcji')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    owl.el,
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
      owl.setMood('cheer', 2500);
      owl.say('Znakomicie! Doskonałe zrozumienie zasad systemu Major!', 'cheer');

      const prog = store.get('major.train', {});
      prog[les.id] = 3;
      store.set('major.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono Akademię! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/major/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/major';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      owl.setMood('sad', 1800);
      owl.say(les.task.hint, 'think', { revert: 3500 });
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
    owl.say(`Wykład ${index + 1}: ${les.subtitle}. Przeczytaj uważnie zasady fonetyczne.`, 'happy');
  }, 250);

  return () => owl.destroy();
}
