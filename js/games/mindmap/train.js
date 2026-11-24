import { h } from '../../dom.js';
import { sfx } from '../../sound.js';
import { store } from '../../store.js';
import { createOctopus } from '../../octopus.js';
import { LESSONS, CHAPTERS } from './lessons.js';

export function mountMap(root, { nav }) {
  const octopus = createOctopus({ size: 'md' });
  const prog = store.get('mindmap.train', {});
  const doneCount = LESSONS.filter(l => prog[l.id]).length;

  const chaptersElements = CHAPTERS.map((ch, ci) => {
    const chapterLessons = LESSONS.map((les, idx) => ({ les, idx }))
      .filter(item => item.les.ch === ci);

    const lessonNodes = chapterLessons.map(({ les, idx }) => {
      const stars = prog[les.id] || 0;
      const isLocked = idx > 0 && !prog[LESSONS[idx - 1].id] && !prog[les.id];
      const state = stars ? 'done' : isLocked ? 'locked' : 'current';

      return h('div', { class: `map-node step-node lesson ${state}` },
        h('div', { class: 'mn-idx ln' }, isLocked ? '🔒' : stars ? '✓' : `${idx + 1}`),
        h('div', { class: 'mn-body lt' },
          h('h3', {}, les.title),
          h('p', {}, les.subtitle),
          h('div', { class: 'mn-stars' }, '⭐'.repeat(stars) || '☆☆☆')
        ),
        isLocked
          ? h('span', { class: 'mn-lock' }, '🔒')
          : h('a', { class: 'btn btn-sm btn-sub', href: `#/mindmap/train/${idx + 1}` }, stars ? 'Powtórz' : 'Start ▶')
      );
    });

    return h('div', { class: 'chapter' },
      h('h3', {},
        h('span', {}, ch.emoji), ' ', ch.title,
        h('small', {}, ch.desc)
      ),
      h('div', { class: 'chapter-lessons' }, lessonNodes)
    );
  });

  const whyCard = h('div', { class: 'why-card' },
    h('span', { class: 'why-icon' }, '🎯'),
    h('div', { class: 'why-content' },
      h('b', {}, 'Po co Ci ta technika w codziennym życiu?'),
      h('p', {}, 'Zamiast gubić się w nudnych, ciągnących się notatkach linijka po linijce, zamieniasz całą wiedzę w barwne drzewo skojarzeń. Niezbędna do nauki całych działów do egzaminu, przygotowywania wystąpień publicznych bez kartki oraz planowania złożonych projektów!')
    )
  );

  const view = h('section', { class: 'screen train-map' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/mindmap', class: 'back' }, '← Menu gry')),
    h('h1', {}, '🐙 ', h('span', { class: 'grad' }, 'Mapy Myśli z Ośmiornicą Inką')),
    h('p', { class: 'lead' }, 'Opanuj sztukę nielinearnych notatek, rozgałęziaj myśli w 8 stron i zapamiętuj całe książki na jednej kartce.'),
    octopus.el,
    whyCard,
    h('div', { class: 'bar-progress', style: `--p:${(doneCount / LESSONS.length) * 100}%` }, h('i')),
    h('div', { class: 'map-list' }, chaptersElements)
  );

  root.append(view);
  setTimeout(() => {
    octopus.say(
      doneCount === 0
        ? 'Plusk! Jestem Ośmiornica Inka 🐙 Rozciągnijmy macki wyobraźni i stwórzmy Twoją pierwszą mapę myśli!'
        : `Świetnie! Masz zaliczone ${doneCount}/${LESSONS.length} lekcji kartografii umysłu! Płyniemy dalej? 🌊`,
      'happy'
    );
  }, 200);

  return () => octopus.destroy();
}

export function mountStep(root, { nav, index }) {
  const les = LESSONS[index] || LESSONS[0];
  const octopus = createOctopus({ size: 'md' });
  let answered = false;

  let diagramVisual = null;
  if (les.diagram) {
    if (les.diagram.type === 'comparison') {
      diagramVisual = h('div', { class: 'mm-compare-box' },
        h('div', { class: 'mm-compare-bad' },
          h('b', {}, les.diagram.bad.title),
          h('p', {}, les.diagram.bad.desc)
        ),
        h('div', { class: 'mm-compare-good' },
          h('b', {}, les.diagram.good.title),
          h('p', {}, les.diagram.good.desc)
        )
      );
    } else if (les.diagram.type === 'mindmap') {
      diagramVisual = h('div', { class: 'mm-lesson-diagram' },
        h('div', { class: 'mm-diag-center' }, les.diagram.center),
        h('div', { class: 'mm-diag-branches-grid' },
          les.diagram.branches.map(br =>
            h('div', { class: 'mm-diag-branch-card', style: `--bcolor:${br.color}` },
              h('b', {}, `${br.icon} ${br.name}`),
              h('span', {}, br.note)
            )
          )
        )
      );
    }
  }

  const theoryBox = h('div', { class: 'theory-card theory-box' },
    h('h3', {}, '🐙 Pędzel Inki: ', les.title),
    diagramVisual,
    h('div', { class: 'theory-text' }, les.theory.map(p => h('p', {}, p)))
  );

  const optContainer = h('div', { class: 'opt-grid' });
  const hintBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, '🐙 Podpowiedź Inki');
  hintBtn.addEventListener('click', () => {
    octopus.say(les.task.hint, 'think', { revert: 4000 });
  });

  const dots = h('div', { class: 'step-dots' }, LESSONS.map((_, i) => h('i', { class: i < index ? 'done' : i === index ? 'now' : '' })));

  const view = h('section', { class: 'screen train-step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/mindmap/train', class: 'back' }, '← Mapa szkolenia')),
    h('div', { class: 'step-head' },
      dots,
      h('span', { class: 'badge' }, `Lekcja ${index + 1} z ${LESSONS.length}`),
      h('h2', {}, les.title)
    ),
    octopus.el,
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
      octopus.setMood('cheer', 2500);
      octopus.say('Brawo! Trafiłeś w samo sedno mapy myśli! Moje macki biją brawo! 🐙✨', 'cheer');

      const prog = store.get('mindmap.train', {});
      prog[les.id] = 3;
      store.set('mindmap.train', prog);

      const nextIdx = index + 1;
      const nextBtn = h('button', { class: 'btn btn-primary btn-lg mt-3' },
        nextIdx < LESSONS.length ? 'Następna lekcja ▶' : 'Ukończono szkolenie Kartografa! 🎉'
      );
      nextBtn.addEventListener('click', () => {
        if (nextIdx < LESSONS.length) {
          window.location.hash = `#/mindmap/train/${nextIdx + 1}`;
        } else {
          window.location.hash = '#/mindmap';
        }
      });
      view.querySelector('.task-box').append(nextBtn);
    } else {
      btn.classList.add('wrong');
      sfx.wrong();
      octopus.setMood('sad', 1800);
      octopus.say(les.task.hint, 'think', { revert: 3500 });
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
    octopus.say(les.speech || `Plusk! Lekcja ${index + 1}: ${les.subtitle}. Zbudujmy tę gałąź!`, 'happy');
  }, 250);

  return () => octopus.destroy();
}
