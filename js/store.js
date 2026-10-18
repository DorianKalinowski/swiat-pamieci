const KEY = 'swiat-pamieci:v1';
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { state = {}; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* tryb prywatny */ } };

export const store = {
  get(k, d) { return k in state ? state[k] : d; },
  set(k, v) { state[k] = v; save(); },
  update(k, fn, d) { this.set(k, fn(this.get(k, d))); }
};

function getDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayDifference(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return Infinity;
  const partsA = dateStrA.split('-').map(Number);
  const partsB = dateStrB.split('-').map(Number);
  if (partsA.length !== 3 || partsB.length !== 3) return Infinity;
  const utc1 = Date.UTC(partsA[0], partsA[1] - 1, partsA[2]);
  const utc2 = Date.UTC(partsB[0], partsB[1] - 1, partsB[2]);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/** Dzienna seria: wywołaj, gdy użytkownik zaczyna grać lub trenować. */
export function touchStreak() {
  const today = getDateString();
  const last = store.get('lastDay', null);
  if (last === today) {
    return Math.max(1, store.get('streak', 1));
  }
  const diff = last ? getDayDifference(last, today) : Infinity;
  let newStreak = 1;
  if (diff === 1) {
    newStreak = Math.max(0, store.get('streak', 0)) + 1;
  } else {
    newStreak = 1;
  }
  store.set('streak', newStreak);
  store.set('lastDay', today);
  return newStreak;
}

export function currentStreak() {
  const today = getDateString();
  const last = store.get('lastDay', null);
  if (!last) return 0;
  const diff = getDayDifference(last, today);
  if (diff === 0) {
    return store.get('streak', 1);
  } else if (diff === 1) {
    return store.get('streak', 0);
  } else {
    if (store.get('streak', 0) !== 0) {
      store.set('streak', 0);
    }
    return 0;
  }
}
