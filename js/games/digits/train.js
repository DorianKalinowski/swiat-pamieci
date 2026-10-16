import { h, rand, sleep } from '../../dom.js';
import { createCat } from '../../cat.js';
import { store } from '../../store.js';
import { sfx, buzz } from '../../sound.js';
import { confetti } from '../../fx.js';
import { present } from './present.js';
import { createRecall } from './recall.js';
import { compareView, starsEl, reverse } from './util.js';
import { LESSONS, CHAPTERS, PRAISE_PERFECT, PRAISE_OK, ENCOURAGE, NUDGES } from './lessons.js';

const progress = () => store.get('digits.train', {});

/* ───────── Mapa lekcji ───────── */
export function mountMap(root) {
  const cat = createCat({ size: 'sm' });
  const prog = progress();
  const firstOpen = LESSONS.findIndex(l => !prog[l.id]);
  const done = LESSONS.filter(l => prog[l.id]).length;

  const chapters = CHAPTERS.map((ch, ci) =>
    h('div', { class: 'chapter' },
      h('h3', {}, h('span', {}, ch.emoji), ' ', ch.title, h('small', {}, ch.desc)),
      LESSONS.map((l, i) => ({ l, i })).filter(x => x.l.ch === ci).map(({ l, i }) => {
        const stars = prog[l.id] || 0;
        const locked = firstOpen !== -1 && i > firstOpen;
        const state = stars ? 'done' : locked ? 'locked' : 'current';
        return h(locked ? 'div' : 'a', {
          class: `lesson ${state}`, href: locked ? null : `#/digits/train/${i + 1}`,
          'aria-disabled': locked ? 'true' : null
        },
          h('span', { class: 'ln' }, locked ? '🔒' : stars ? '✓' : i + 1),
          h('span', { class: 'lt' }, h('b', {}, l.title), h('small', {}, `${l.digits.length} cyfr${l.cards ? ' · obrazy' : ''}`)),
          starsEl(stars));
      })));

  root.append(h('section', { class: 'screen' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/digits', class: 'back' }, '← Cyfry')),
    h('div', { class: 'game-head' }, h('h1', {}, 'Mapa ', h('span', { class: 'grad' }, 'szkolenia'))),
    cat.el,
    h('div', { class: 'bar-progress', style: `--p:${done / LESSONS.length * 100}%` }, h('i')),
    ...chapters));
  setTimeout(() => cat.say(done === LESSONS.length ? 'Wszystko zaliczone! Możesz wracać do dowolnej lekcji, żeby zdobyć brakujące gwiazdki ⭐' : done ? 'Wybierz lekcję. Świecąca czeka na Ciebie! ✨' : 'Zaczynamy od pierwszej lekcji. Kliknij ją! 🐾', 'happy'), 250);
  return () => cat.destroy();
}

/* ───────── Pojedyncza lekcja ───────── */
export function mountStep(root, { index, nav }) {
  const lesson = LESSONS[index];
  if (!lesson) { nav('digits/train'); return () => {}; }

  const ctrl = new AbortController();
  const { signal } = ctrl;
  const cat = createCat({ size: 'sm' });
  const panel = h('div', { class: 'panel', html: lesson.panel || '' });
  const stage = h('div', { class: 'stage' });
  const controls = h('div', { class: 'controls' });
  let recall = null;
  let penalties = 0, hintLevel = 0, replayed = false;

  const dots = h('div', { class: 'step-dots' }, LESSONS.map((_, i) => h('i', { class: i < index ? 'done' : i === index ? 'now' : '' })));
  root.append(h('section', { class: 'screen step' },
    h('div', { class: 'crumbs' }, h('a', { href: '#/digits/train', class: 'back' }, '← Mapa'), h('span', { class: 'crumb-title' }, `Lekcja ${index + 1}/${LESSONS.length}: ${lesson.title}`)),
    dots, cat.el, lesson.panel ? panel : null, stage, controls));

  const button = (label, cls, onclick) => h('button', { class: `btn ${cls}`, type: 'button', onclick }, label);
  const waitClick = (label, cls = 'btn-primary') => new Promise(res => {
    controls.replaceChildren(button(label, cls, () => { controls.replaceChildren(); res(); }));
  });

  async function run() {
    // 1. Wprowadzenie od kota
    stage.replaceChildren(h('div', { class: 'intro-art' }, h('span', {}, lesson.cards ? '🖼️' : lesson.showShapes ? '🦢' : lesson.group ? '✂️' : '🔢')));
    for (let i = 0; i < lesson.intro.length; i++) {
      if (i === 0) cat.wave();
      await cat.say(lesson.intro[i], i === lesson.intro.length - 1 ? 'think' : 'happy');
      await waitClick(i < lesson.intro.length - 1 ? 'Dalej' : 'Zaczynamy! ▶');
      if (signal.aborted) return;
    }

    for (;;) {
      // 2. Zapamiętywanie
      cat.say(hintLevel || replayed ? 'Patrz uważnie jeszcze raz! 👀' : 'Patrz uważnie! 👀 Pasek pokazuje, ile masz czasu.', 'think');
      controls.replaceChildren();
      await present(stage, { digits: lesson.digits, group: lesson.group, time: lesson.time, cards: lesson.cards, showShapes: lesson.showShapes, signal });
      if (signal.aborted) return;
      await sleep(200, signal);

      // 3. Odpowiedź
      let result = await recallPhase();
      if (signal.aborted) return;
      if (result === 'replay') { penalties++; replayed = true; continue; }

      recall.mark(lesson.digits);
      recall.el.classList.add('finished');
      recall.destroy();
      controls.replaceChildren();
      if (result === lesson.digits) {
        const stars = Math.max(1, 3 - penalties);
        store.update('digits.train', t => ({ ...(t || {}), [lesson.id]: Math.max((t && t[lesson.id]) || 0, stars) }), {});
        sfx.good(); buzz([30, 40, 30]);
        const last = index === LESSONS.length - 1;
        confetti(last ? 260 : 90);
        if (last) sfx.win();
        stage.append(starsEl(stars));
        cat.spin();
        await cat.say(last ? 'WSZYSTKIE LEKCJE ZALICZONE! 🏆 Jesteś mistrzem cyfr! Czas na grę swobodną!' : stars === 3 ? rand(PRAISE_PERFECT) : rand(PRAISE_OK), 'cheer');
        controls.replaceChildren(
          last ? button('Do gry swobodnej 🚀', 'btn-primary', () => nav('digits')) : button('Następna lekcja ▶', 'btn-primary', () => nav(`digits/train/${index + 2}`)),
          button('Mapa', 'btn-ghost', () => nav('digits/train')),
          button('Jeszcze raz', 'btn-ghost', () => nav(`digits/train/${index + 1}`)));
        return;
      }
      // pomyłka
      penalties++;
      sfx.bad(); buzz(120);
      stage.append(compareView(lesson.digits, result, lesson.group));
      cat.say(rand(ENCOURAGE), 'sad');
      await waitClick('Spróbuj jeszcze raz ↻');
      if (signal.aborted) return;
    }
  }

  function recallPhase() {
    return new Promise(resolve => {
      let nudge = null;
      const hintsLeft = () => hintLevel < lesson.hints.length;
      recall = createRecall({ length: lesson.digits.length, group: lesson.group, onSubmit: v => { if (nudge) clearInterval(nudge); resolve(v); } });
      const label = h('div', { class: 'present-label' }, 'Wpisz z pamięci');
      stage.replaceChildren(label, recall.el);
      cat.say('Teraz Twoja kolej! Wpisz cyfry z pamięci. 🧠', 'think');

      const hintBtn = button('💡 Podpowiedź', 'btn-ghost', () => {
        const text = lesson.hints[Math.min(hintLevel, lesson.hints.length - 1)];
        if (hintLevel === 0) penalties++;
        hintLevel++;
        recall.reveal(Math.min(lesson.digits.length, hintLevel * (hintLevel > 1 ? 2 : 1)), lesson.digits);
        cat.say(text, 'think'); cat.hop(); sfx.pop();
        hintBtn.classList.add('used');
      });
      const replayBtn = button('👁 Pokaż jeszcze raz', 'btn-ghost', () => { recall.destroy(); if (nudge) clearInterval(nudge); resolve('replay'); });
      if (replayed) replayBtn.disabled = true;
      controls.replaceChildren(hintBtn, replayBtn);

      let lastTyped = 0, idle = 0;
      nudge = setInterval(() => {
        if (signal.aborted) { if (nudge) clearInterval(nudge); return; }
        if (recall.typed !== lastTyped) { lastTyped = recall.typed; idle = 0; return; }
        if (++idle >= 3) { idle = 0; cat.say(rand(NUDGES), 'think'); cat.hop(); }
      }, 4000);
      signal.addEventListener('abort', () => { if (nudge) clearInterval(nudge); recall.destroy(); }, { once: true });
    });
  }

  run().catch(console.error);
  return () => { ctrl.abort(); cat.destroy(); recall?.destroy(); };
}
