import { h } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createSquirrel } from '../../squirrel.js';
import { LESSONS } from './lessons.js';

export function mountMap(root, { nav }) {
  const squirrel = createSquirrel({ size: 'md' });
  const prog = store.get('link.train', {});
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
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/link/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Duże zakupy w markecie bez spoglądania w telefon, kolejność punktów wystąpienia czy procedury krok po kroku – dzięki efektowi domina jedno ogniwo samo pociąga kolejne!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/link', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🐿️ ', h('span', { class: 'grad' }, 'Łańcuch Skojarzeń z Basią')),
    h('p', { class: 'lead' }, 'Poznaj metodę łączenia myśli jak domino i nigdy więcej nie zgub wątku.'),
    squirrel.el,
    whyCard,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    squirrel.say(
      doneCount === 0
        ? 'Cześć! Jestem Wiewiórka Basia 🐿️ Nauczę Cię łączyć myśli w żelazny łańcuch!'
        : `Chrup! ${doneCount}/${LESSONS.length} lekcji za nami! Zbieramy kolejne orzeszki!`,
      'happy'
    );
  }, 200);

  return () => squirrel.destroy();
}

export function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const squirrel = createSquirrel({ size: 'md' });
  let answered = false;

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '🐿️ Sprytny trik Basi: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🐿️ Podpowiedź Basi');
  hintBtn.addEventListener('click', () => {
    squirrel.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/link/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    squirrel.el,
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
      squirrel.setMood('cheer', 2500);
      squirrel.say('Brawo! To skojarzenie jest nierozerwalne jak stalowy łańcuch!', 'cheer');

      const prog = store.get('link.train', {});
      prog[les.id] = 3;
      store.set('link.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie łańcucha! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/link/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/link';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      squirrel.setMood('sad', 1800);
      squirrel.say(les.task.hint, 'think', { revert: 3500 });
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
    squirrel.say(les.speech || `Chrup, chrup! Lekcja ${index + 1}: ${les.subtitle}. Zobacz, jak połączymy te rzeczy!`, 'happy');
  }, 250);

  return () => squirrel.destroy();
}
