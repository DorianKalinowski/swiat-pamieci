import { h, sleep } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createFox } from '../../fox.js';
import { LESSONS } from './lessons.js';

export function mountMap(root, { nav }) {
  const fox = createFox({ size: 'md' });
  const prog = store.get('names.train', {});
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
        : h('a', { class: 'btn btn-sm btn-sub', href: `#/names/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
    );
  });

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/names', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🦊 ', h('span', { class: 'grad' }, 'Szkolenie: Imiona i twarze')),
    h('p', { class: 'lead' }, 'Krok po kroku naucz się zapamiętywać każdą twarz i imię na całe życie.'),
    fox.el,
    h('div', { class: 'map-list' }, items)
  );

  root.append(view);
  setTimeout(() => {
    fox.say(
      doneCount === 0
        ? 'Cześć! Jestem Lisek Bystrzak 🦊 Przejdźmy razem 6 kroków do mistrzowskiej pamięci twarzy!'
        : `Świetnie! Masz zaliczone ${doneCount}/${LESSONS.length} lekcji! Kontynuujmy!`,
      'happy'
    );
  }, 200);

  return () => fox.destroy();
}

export function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const fox = createFox({ size: 'md' });
  let answered = false;

  const facesRow = h('div', { class: 'train-faces-row' },
    (les.faces || []).map(f => h('div', { class: 'face-card' },
      h('div', { class: 'fc-avatar', html: f.svg }),
      h('div', { class: 'fc-name' }, f.name),
      h('div', { class: 'fc-job' }, f.job),
      h('div', { class: 'fc-feature' }, '🔍 ', f.feature),
      h('div', { class: 'fc-hook' }, '💡 ', f.hook)
    ))
  );

  const theoryBox = h('div', { class: 'theory-card' },
    h('h3', {}, '📖 Lekcja: ', les.title),
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '💡 Podpowiedź Liska');
  hintBtn.addEventListener('click', () => {
    fox.say(les.task.hint, 'think', { revert: 4000 });
  });

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/names/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    fox.el,
    theoryBox,
    facesRow,
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
      fox.setMood('cheer', 2500);
      fox.say('Brawo! Dokładnie o to chodzi! Znakomita pamięć!', 'cheer');

      const prog = store.get('names.train', {});
      prog[les.id] = 3;
      store.set('names.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/names/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/names';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      fox.setMood('sad', 1800);
      fox.say(les.task.hint, 'think', { revert: 3500 });
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
    fox.say(`Lekcja ${index + 1}: ${les.subtitle}! Przeczytaj teorię i spróbuj odpowiedzieć.`, 'happy');
  }, 250);

  return () => fox.destroy();
}
