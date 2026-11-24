import { h } from '../../dom.js';
import { createOctopus } from '../../octopus.js';
import { store } from '../../store.js';
import { LESSONS } from './lessons.js';
import { MODES } from './modes.js';
import { mountMap, mountStep } from './train.js';
import { mountFree } from './free.js';

function mountMenu(root, { nav }) {
  const octopus = createOctopus({ size: 'md' });
  const prog = store.get('mindmap.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/mindmap/train' : `#/mindmap/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🐙 Szkolenie z Ośmiornicą Inką'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę Map Myśli' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · promieniście od centrum · nielinearne notatki i gałęzie wiedzy`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/mindmap/train' }, 'Zobacz mapę lekcji kartografii umysłu →');

  const modeCards = MODES.map(m => {
    const best = store.get(`mindmap.free.${m.id}.best`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/mindmap/free/${m.id}`,
      style: `--c1:${m.accent[0]};--c2:${m.accent[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.title),
        h('p', {}, m.desc)
      ),
      h('div', { class: 'mc-best' },
        h('b', {}, best ? `${best}` : '–'),
        h('span', {}, best ? 'rekord' : 'brak')
      )
    );
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {},
        h('h1', {}, '🐙 ', h('span', { class: 'grad' }, 'Mapy myśli')),
        h('p', { class: 'lead' }, 'Rozwiń 8 macek swojej wyobraźni! Twórz nielinearne notatki wizualne, zapamiętuj całe książki, projekty i wystąpienia na jednej kartce.')
      )
    ),
    octopus.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Plusk! Jestem Ośmiornica Inka 🐙 Rozrysujemy każdą wiedzę w barwne gałęzie myśli!'
    : done < LESSONS.length
      ? `Świetnie! Masz ${done} z ${LESSONS.length} lekcji! Ruszajmy po kolejne gwiazdki! 🌊`
      : 'Opanowałeś mapy myśli po mistrzowsku! Wybierz tryb gry swobodnej! 🏆';

  setTimeout(() => { octopus.say(greet, 'happy'); }, 300);
  return () => octopus.destroy();
}

export default {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};
