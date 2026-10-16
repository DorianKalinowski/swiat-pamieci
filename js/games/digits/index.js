import { h } from '../../dom.js';
import { createCat } from '../../cat.js';
import { store } from '../../store.js';
import { LESSONS } from './lessons.js';
import { MODES } from './modes.js';
import { mountMap, mountStep } from './train.js';
import { mountFree } from './free.js';

function mountMenu(root, { nav }) {
  const cat = createCat({ size: 'md' });
  const prog = store.get('digits.train', {});
  const done = LESSONS.filter(l => prog[l.id]).length;
  const stars = Object.values(prog).reduce((a, b) => a + b, 0);
  const pct = Math.round(done / LESSONS.length * 100);
  const next = LESSONS.findIndex(l => !prog[l.id]);

  const trainCard = h('a', { class: 'big-card train-card', href: next === -1 ? '#/digits/train' : `#/digits/train/${next + 1}` },
    h('div', { class: 'bc-top' },
      h('div', {},
        h('span', { class: 'bc-kicker' }, '🎓 Szkolenie z kotem'),
        h('h3', {}, done === 0 ? 'Zacznij naukę' : done === LESSONS.length ? 'Powtórz szkolenie' : 'Kontynuuj szkolenie'),
        h('p', {}, `${LESSONS.length} lekcji · od 3 do 12 cyfr · podpowiedzi Mruczka`)),
      h('div', { class: 'ring', style: `--p:${pct}` }, h('span', {}, `${done}/${LESSONS.length}`))),
    h('div', { class: 'bc-foot' }, h('span', {}, `⭐ ${stars}/${LESSONS.length * 3}`), h('span', { class: 'gc-play' }, done ? 'Dalej ▶' : 'Start ▶'))
  );
  const mapLink = h('a', { class: 'link center', href: '#/digits/train' }, 'Zobacz mapę lekcji →');

  const modeCards = MODES.map(m => {
    const best = store.get(`digits.best.${m.id}`, 0);
    return h('a', { class: 'mode-card', href: `#/digits/free/${m.id}`, style: `--c1:${m.color[0]};--c2:${m.color[1]}` },
      h('div', { class: 'mc-emoji' }, m.emoji),
      h('div', { class: 'mc-body' }, h('h3', {}, m.name), h('p', {}, m.desc)),
      h('div', { class: 'mc-best' }, h('b', {}, best || '–'), h('span', {}, best ? 'rekord' : 'brak')));
  });

  const view = h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/', class: 'back' }, '← Wszystkie gry')),
    h('div', { class: 'game-head' },
      h('div', {}, h('h1', {}, '🔢 ', h('span', { class: 'grad' }, 'Cyfry')), h('p', { class: 'lead' }, 'Naucz się zapamiętywać liczby – krok po kroku.')),
    ),
    cat.el,
    h('h2', { class: 'section-title' }, 'Szkolenie'),
    trainCard, mapLink,
    h('h2', { class: 'section-title' }, 'Gra swobodna ', h('small', {}, 'do pierwszej pomyłki')),
    h('div', { class: 'mode-list' }, modeCards)
  );
  root.append(view);

  const greet = done === 0
    ? 'Miau! Jestem Mruczek 🐾 Zacznij od szkolenia – nauczę Cię sztuczek, a potem sprawdź się w grze swobodnej!'
    : done < LESSONS.length
      ? `Wróciłeś! Masz za sobą ${done} z ${LESSONS.length} lekcji. Kontynuujemy? 😸`
      : 'Ukończyłeś szkolenie! 🏆 Czas pobić rekordy w grze swobodnej!';
  setTimeout(() => { cat.wave(); cat.say(greet, 'happy'); }, 300);
  return () => cat.destroy();
}

export default {
  mount(root, ctx) {
    const [a, b] = ctx.params;
    if (a === 'train') return b ? mountStep(root, { ...ctx, index: Number(b) - 1 }) : mountMap(root, ctx);
    if (a === 'free' && b) return mountFree(root, { ...ctx, modeId: b });
    return mountMenu(root, ctx);
  }
};
