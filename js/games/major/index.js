import { h } from '../../dom.js';
import { createOwl } from '../../owl.js';
import { store } from '../../store.js';
import { LESSONS } from './lessons.js';
import { MODES } from './modes.js';
import { mountMap, mountStep } from './train.js';
import { mountFree } from './free.js';

function mountMenu(root, { nav }) {
  const owl = createOwl({ size: 'md' });
  const prog = store.get('major.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', {
    class: 'big-card train-card',
    href: next === -1 ? '#/major/train' : `#/major/train/${next + 1}`
  },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🦉 Akademia Sówki Profesora'),
        h('h3', {}, done === 0 ? 'Rozpocznij naukę Majora' : done === LESSONS.length ? 'Powtórz akademię' : 'Kontynuuj akademię'),
        h('p', {}, `${LESSONS.length} lekcji · spółgłoski 0-9 · kołki pamięciowe · zapamiętywanie PIN`)
      ),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))
    ),
    h('div', { class: 'bc-foot' },
      h('span', {}, `⭐ ${stars}/${LESSONS.length * 3} gwiazdek`),
      h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶')
    )
  );

  const mapLink = h('a', { class: 'link center', href: '#/major/train' }, 'Zobacz wykaz wykładów →');

  const modeCards = MODES.map(m => {
    const best = store.get(`major.best.${m.id}`, 0);
    return h('a', {
      class: 'mode-card',
      href: `#/major/free/${m.id}`,
      style: `--c1:${m.color[0]};--c2:${m.color[1]}`
    },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' },
        h('h3', {}, m.name),
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
        h('h1', {}, '🦉 ', h('span', { class: 'grad' }, 'System Major')),
        h('p', { class: 'lead' }, 'Tajemny kod mistrzów pamięci: zamieniaj liczby na słowa i obrazy.')
      )
    ),
    owl.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard,
    mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, '4 warianty')),
    h('div', { class: 'mode-list' }, modeCards)
  );

  root.append(view);

  const greet = done === 0
    ? 'Uhuhu! Jestem Sówka Profesor 🦉 Nauczę Cię zamieniać nudne cyfry w fascynujące obrazy!'
    : done < LESSONS.length
      ? `Mamy za sobą ${done} z ${LESSONS.length} wykładów. Chodźmy dalej do biblioteki! 📚`
      : 'Ukończyłeś całą Akademię Majora! Sprawdź swój refleks w grze swobodnej! 🏆';

  setTimeout(() => { owl.say(greet, 'happy'); }, 300);
  return () => owl.destroy();
}

export default {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};
