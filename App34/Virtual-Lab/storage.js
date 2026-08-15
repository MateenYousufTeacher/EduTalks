/* ============================================================
   STELLAR SPECTROSCOPE — Local Persistence Layer
   Wraps localStorage (with an in-memory fallback) so all
   progress, scores, and notebook entries work fully offline
   and survive app restarts / re-installs of the PWA.
   ============================================================ */

const STORE_KEY = 'stellarSpectroscope.v1';

const DEFAULT_STATE = {
  starsExplored: [],       // ids of stars viewed in the lab
  linesLogged: 0,          // total spectral lines clicked/identified
  challenges: [],          // {ts, starId, score, pass, guessed:[], actual:[]}
  guidedCompleted: false,
  notebook: []             // {ts, text, auto}
};

let memoryFallback = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredCloneSafe(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return Object.assign(structuredCloneSafe(DEFAULT_STATE), parsed);
  } catch (e) {
    if (!memoryFallback) memoryFallback = structuredCloneSafe(DEFAULT_STATE);
    return memoryFallback;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    memoryFallback = state;
  }
}

function structuredCloneSafe(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const DB = {
  get() { return loadState(); },

  markStarExplored(starId) {
    const s = loadState();
    if (!s.starsExplored.includes(starId)) s.starsExplored.push(starId);
    saveState(s);
    return s;
  },

  logLine() {
    const s = loadState();
    s.linesLogged += 1;
    saveState(s);
    return s;
  },

  addChallengeResult(result) {
    const s = loadState();
    s.challenges.unshift(result);
    s.challenges = s.challenges.slice(0, 50);
    saveState(s);
    return s;
  },

  setGuidedCompleted() {
    const s = loadState();
    s.guidedCompleted = true;
    saveState(s);
    return s;
  },

  addNotebookEntry(text, auto) {
    const s = loadState();
    s.notebook.unshift({ ts: Date.now(), text, auto: !!auto });
    saveState(s);
    return s;
  },

  removeNotebookEntry(ts) {
    const s = loadState();
    s.notebook = s.notebook.filter(e => e.ts !== ts);
    saveState(s);
    return s;
  },

  reset() {
    saveState(structuredCloneSafe(DEFAULT_STATE));
    return loadState();
  }
};
