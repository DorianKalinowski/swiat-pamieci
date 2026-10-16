import { h, $, rand } from './dom.js';
import { GAMES } from './games/registry.js';
import { createCat } from './cat.js';
import { sound, sfx } from './sound.js';
import { store, touchStreak, currentStreak } from './store.js';

const app = $('#app');
let cleanup = null;
let routeId = 0;

const nav = path => { location.hash = '#/' + path; };

/* ---------- Strona główna ---------- */
function renderHub() {
  const cat = createCat({ size: 'lg' });
  const trainStars = Object.values(store.get('digits.train', {})).reduce((a, b) => a + b, 0);
  const streak = currentStreak();

  const cards = GAMES.map(g => {
    const ready = g.status === 'ready';
    const el = h(ready ? 'a' : 'div', {
      class: `game-card${ready ? '' : ' soon'}`,
      style: `--c1:${g.accent[0]};--c2:${g.accent[1]}`,
      href: ready ? `#/${g.id}` : null,
      'aria-disabled': ready ? null : 'true'
    },
      h('div', { class: 'gc-emoji' }, g.emoji),
      h('h3', {}, g.title),
      h('p', {}, g.tagline),
      ready
        ? h('div', { class: 'gc-tags' }, g.tags.map(t => h('span', {}, t)))
        : h('div', { class: 'gc-tags' }, h('span', { class: 'soon-badge' }, 'Wkrótce')),
      ready && h('span', { class: 'gc-play' }, 'Graj ▶')
    );
    return el;
  });

  const view = h('section', { class: 'screen hub' },
    h('div', { class: 'hero' },
      cat.el,
      h('h1', {}, 'Świat ', h('span', { class: 'grad' }, 'pamięci')),
      h('p', { class: 'lead' }, 'Mini-gry, w których uczysz się technik pamięciowych używanych przez mistrzów. Zapamiętasz numer telefonu po jednym spojrzeniu!')
    ),
    h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('b', {}, `🔥 ${streak}`), h('span', {}, streak === 1 ? 'dzień z rzędu' : 'dni z rzędu')),
      h('div', { class: 'stat' }, h('b', {}, `⭐ ${trainStars}`), h('span', {}, 'gwiazdek')),
      h('div', { class: 'stat' }, h('b', {}, `🎮 ${GAMES.filter(g => g.status === 'ready').length}/${GAMES.length}`), h('span', {}, 'gier gotowych'))
    ),
    h('h2', { class: 'section-title' }, 'Wybierz grę'),
    h('div', { class: 'game-grid' }, cards)
  );
  app.append(view);

  const hello = streak > 1
    ? `Miau! ${streak} dni z rzędu – świetna passa! 🔥 Zagramy?`
    : rand(['Miau! Jestem Mruczek 🐾 Zagramy w „Cyfry”?', 'Cześć! Pamięć czeka na trening 💪', 'Mrrr… gotowy na szybki trening?']);
  setTimeout(() => { cat.wave(); cat.say(hello, 'happy'); }, 350);
  return () => cat.destroy();
}

async function route() {
  const id = ++routeId;
  cleanup?.(); cleanup = null;
  app.replaceChildren();
  window.scrollTo(0, 0);

  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const game = GAMES.find(g => g.id === parts[0] && g.load);

  if (!game) { cleanup = renderHub(); return; }
  try {
    const mod = await game.load();
    if (id !== routeId) return;
    touchStreak();
    cleanup = mod.default.mount(app, { params: parts.slice(1), nav });
  } catch (err) {
    console.error(err);
    if (id === routeId) app.append(h('p', { class: 'screen' }, 'Ups, coś poszło nie tak. Sprawdź połączenie i odśwież stronę.'));
  }
}

addEventListener('hashchange', route);
route();

/* ---------- Dźwięk ---------- */
const soundBtn = $('#soundBtn');
const paintSound = () => {
  soundBtn.textContent = sound.on ? '🔊' : '🔇';
  soundBtn.setAttribute('aria-pressed', String(sound.on));
};
soundBtn.addEventListener('click', () => { sound.toggle(); paintSound(); sfx.pop(); });
paintSound();

/* ---------- Ściągawka Technik ---------- */
const guide = $('#guide');
const openGuide = () => { guide?.showModal(); sfx.pop(); };
$('#guideBtn')?.addEventListener('click', openGuide);

/* ---------- Autor ---------- */
const about = $('#about');
const openAbout = () => { about?.showModal(); sfx.pop(); };
$('#authorBtn')?.addEventListener('click', openAbout);
$('#authorLink')?.addEventListener('click', openAbout);
document.querySelectorAll('dialog').forEach(d =>
  d.addEventListener('click', e => { if (e.target === d) d.close(); }));

/* ---------- Instalacja PWA ---------- */
const installBtn = $('#installBtn');
const installModal = $('#installModal');
const directInstallBtn = $('#directInstallBtn');
let deferred = null;
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;

if (standalone) {
  if (installBtn) installBtn.hidden = true;
}

addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferred = e;
  if (directInstallBtn) directInstallBtn.hidden = false;
});

addEventListener('appinstalled', () => {
  if (installBtn) installBtn.hidden = true;
  installModal?.close();
  deferred = null;
});

const triggerInstall = async () => {
  if (deferred) {
    deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      deferred = null;
      if (installBtn) installBtn.hidden = true;
      installModal?.close();
    }
  } else {
    installModal?.showModal();
  }
};

installBtn?.addEventListener('click', triggerInstall);
directInstallBtn?.addEventListener('click', triggerInstall);

/* ---------- Service worker ---------- */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(console.warn));
}
