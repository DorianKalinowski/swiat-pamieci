import { h, rand, sleep } from '../../dom.js';
import { createCat } from '../../cat.js';
import { store } from '../../store.js';
import { sfx, buzz } from '../../sound.js';
import { confetti } from '../../fx.js';
import { present } from './present.js';
import { createRecall } from './recall.js';
import { compareView, randomDigits, reverse } from './util.js';
import { MODES, getMode } from './modes.js';

const MILESTONES = {
  3: 'Rozgrzewka za nami! Teraz robi się ciekawie 😼',
  5: 'Pięć cyfr! Większość ludzi odpada właśnie tutaj.',
  7: 'Siedem cyfr – magiczna liczba pamięci! ✨',
  9: 'Dziewięć cyfr = cały numer telefonu! 📱',
  10: 'DZIESIĘĆ! Mruczek jest pod wrażeniem 🙀',
  12: 'Dwanaście cyfr?! Jesteś mistrzem! 🏆',
  15: 'Piętnaście! To poziom zawodów pamięciowych 🤯'
};
const CHEERS = [
  'Tak! Kotek mruczy z zachwytu! 😸✨',
  'Mrrr, bezbłędnie w punkt! 🐾',
  'Kocia precyzja! Pamięć jak u rysia! 🐈💨',
  'Pazurki w górę! Fenomenalnie! 😻⭐',
  'Bez pudła! Cyfry wchodzą gładko! 🎯',
  'Miau! Kolejny poziom zdobyty! 🌟🚀',
  'Czysty geniusz! Mruczek bije brawo! 👏😸'
];

export function mountFree(root, { modeId, nav }) {
  const mode = getMode(modeId);
  if (!mode) { nav('digits'); return () => {}; }

  const ctrl = new AbortController();
  const { signal } = ctrl;
  const cat = createCat({ size: 'sm' });
  const bestKey = `digits.best.${mode.id}`;
  let best = store.get(bestKey, 0);
  let level = 1, shield = 0, recall = null, startBest = best;

  const levelEl = h('b', {}, '1');
  const shieldEl = h('span', { class: 'hud-shield', title: 'Tarcza chroni przed jedną pomyłką' }, '🛡️');
  const bestEl = h('b', {}, best || '–');
  const hud = h('div', { class: 'hud' },
    h('div', {}, h('small', {}, 'Poziom'), levelEl),
    h('div', { class: 'hud-mid' }, shieldEl),
    h('div', {}, h('small', {}, 'Rekord'), bestEl));
  const stage = h('div', { class: 'stage' });
  const controls = h('div', { class: 'controls' });

  root.append(h('section', { class: 'screen step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/digits', class: 'back' }, '← Cyfry'), h('span', { class: 'crumb-title' }, `${mode.emoji} ${mode.name}`)),
    hud, cat.el, stage, controls));

  const paintHud = () => {
    levelEl.textContent = level;
    shieldEl.classList.toggle('on', shield > 0);
    shieldEl.hidden = false;
    bestEl.textContent = best || '–';
  };
  const button = (label, cls, onclick) => h('button', { class: `btn ${cls}`, type: 'button', onclick }, label);

  function ask(expected, group) {
    return new Promise(resolve => {
      recall = createRecall({ length: expected.length, group, onSubmit: resolve });
      stage.replaceChildren(
        h('div', { class: 'present-label' }, mode.reverse ? 'Wpisz od KOŃCA 🔄' : 'Wpisz z pamięci'),
        recall.el);
      signal.addEventListener('abort', () => recall.destroy(), { once: true });
    });
  }

  async function play() {
    level = 1; shield = 0; startBest = best; paintHud();
    controls.replaceChildren();
    store.update('digits.plays', n => n + 1, 0);
    await cat.say(mode.reverse ? 'Odwrotnie! Zapamiętaj, a potem wpisz od końca. 🔄' : mode.id === 'flash' ? 'Błysk! Cyfry pojawią się po jednej – nie mrugaj! ⚡' : 'Do pierwszej pomyłki! Powodzenia! 🐾', 'happy');

    while (!signal.aborted) {
      const len = level + 2;
      const cfg = mode.round(level, len);
      const digits = randomDigits(len);
      const expected = mode.reverse ? reverse(digits) : digits;

      stage.replaceChildren(h('div', { class: 'banner' }, h('small', {}, `Poziom ${level}`), h('b', {}, `${len} cyfr`)));
      paintHud();
      if (!(await sleep(850, signal))) return;

      cat.say(MILESTONES[len] && level > 1 ? MILESTONES[len] : '👀', 'think', { speed: 8 });
      await present(stage, { digits, signal, ...cfg });
      if (signal.aborted) return;
      await sleep(180, signal);

      cat.say(mode.reverse ? 'Od końca! 🔄' : 'Teraz Ty! 🧠', 'think', { speed: 8 });
      const answer = await ask(expected, mode.reverse ? 0 : cfg.group);
      if (signal.aborted) return;
      recall.mark(expected);
      recall.el.classList.add('finished');
      recall.destroy();

      if (answer === expected) {
        sfx.good(); buzz(25);
        best = Math.max(best, len); store.set(bestKey, best);
        if (level % 5 === 0 && shield < 1) {
          shield = 1;
          cat.spin();
          confetti(70);
          cat.say('Zdobyłeś 🛡️ tarczę! Mruczek kręci piruet z radości!', 'cheer', { revert: 2200 });
        } else {
          cat.hop();
          cat.say(rand(CHEERS), 'cheer', { revert: 1200 });
        }
        level++;
        if (!(await sleep(1250, signal))) return;
        continue;
      }

      sfx.bad(); buzz(120);
      if (shield > 0) {
        shield = 0; paintHud();
        stage.append(compareView(expected, answer, mode.reverse ? 0 : cfg.group));
        cat.say('Ojej! Ale 🛡️ tarcza Cię uratowała! Próbujemy jeszcze raz ten poziom.', 'sad');
        if (!(await sleep(2800, signal))) return;
        continue;
      }
      return gameOver(expected, answer, cfg.group, len);
    }
  }

  function gameOver(expected, answer, group, len) {
    const reached = Math.max(0, len - 1); // najdłuższa poprawnie zapamiętana liczba
    const record = reached > 0 && reached > startBest;
    if (record) { confetti(200); sfx.win(); }
    const text = reached === 0 ? 'Rozgrzewka się nie udała… ale to tylko trening! 🐾'
      : record ? `NOWY REKORD: ${reached} cyfr! 🏆🎉` : reached >= 9 ? 'Imponujące! Prawie jak mistrz pamięci! 🌟' : 'Dobra próba! Każdy rekord zaczyna się od porażki 💪';
    cat.say(text, record ? 'cheer' : 'sad');
    stage.replaceChildren(
      h('div', { class: 'gameover' },
        h('small', {}, 'Koniec gry'),
        h('div', { class: 'go-score' }, h('b', {}, reached), h('span', {}, reached === 1 ? 'cyfra' : 'cyfr')),
        h('div', { class: 'go-best' }, record ? '🏆 Nowy rekord!' : `Rekord: ${best || 0}`),
        compareView(expected, answer, mode.reverse ? 0 : group)));
    controls.replaceChildren(
      button('Jeszcze raz ↻', 'btn-primary', () => { paintHud(); play(); }),
      h('a', { class: 'btn btn-ghost', href: '#/digits' }, 'Inny tryb'));
  }

  play().catch(console.error);
  return () => { ctrl.abort(); cat.destroy(); recall?.destroy(); };
}
