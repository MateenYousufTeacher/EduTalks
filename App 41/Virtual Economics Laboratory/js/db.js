/* ==========================================================================
   VECLAB.DB — localStorage-backed persistence (fully offline, no server)
   ========================================================================== */
const VECDB = (() => {
  const KEY = 'veclab_state_v1';
  const clone = (obj) => (typeof structuredClone === 'function') ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));

  const defaults = {
    theme: 'dark',
    seenSplash: false,
    xp: 0,
    level: 1,
    streak: 0,
    lastVisit: null,
    progress: {},        // { simId: 0-100 }
    quizScores: {},      // { simId: {score, total, date} }
    bookmarks: [],        // [simId]
    achievements: [],     // [achievementId]
    notes: {},            // { simId: "text" }
    settings: { sound: true, animations: true, mode: 'student' }
  };

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return clone(defaults);
      const parsed = JSON.parse(raw);
      return Object.assign(clone(defaults), parsed);
    }catch(e){
      console.warn('VECDB load failed, resetting', e);
      return clone(defaults);
    }
  }

  let state = load();

  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }
    catch(e){ console.warn('VECDB save failed', e); }
  }

  function get(){ return state; }

  function set(partial){
    state = Object.assign({}, state, partial);
    save();
    return state;
  }

  function addXP(amount){
    state.xp = (state.xp||0) + amount;
    const newLevel = 1 + Math.floor(state.xp / 250);
    const leveledUp = newLevel > state.level;
    state.level = newLevel;
    save();
    return { leveledUp, xp: state.xp, level: state.level };
  }

  function setProgress(simId, pct){
    state.progress[simId] = Math.max(state.progress[simId]||0, pct);
    save();
  }

  function recordQuiz(simId, score, total){
    state.quizScores[simId] = { score, total, date: new Date().toISOString() };
    save();
  }

  function toggleBookmark(simId){
    const i = state.bookmarks.indexOf(simId);
    if(i>-1) state.bookmarks.splice(i,1); else state.bookmarks.push(simId);
    save();
    return state.bookmarks.includes(simId);
  }

  function unlockAchievement(id){
    if(state.achievements.includes(id)) return false;
    state.achievements.push(id);
    save();
    return true;
  }

  function saveNote(simId, text){
    state.notes[simId] = text; save();
  }

  function touchStreak(){
    const today = new Date().toDateString();
    if(state.lastVisit !== today){
      const y = new Date(); y.setDate(y.getDate()-1);
      state.streak = (state.lastVisit === y.toDateString()) ? (state.streak+1) : 1;
      state.lastVisit = today;
      save();
    }
    return state.streak;
  }

  function resetAll(){
    state = clone(defaults);
    save();
  }

  function exportJSON(){
    return JSON.stringify(state, null, 2);
  }

  return { get, set, addXP, setProgress, recordQuiz, toggleBookmark, unlockAchievement, saveNote, touchStreak, resetAll, exportJSON, defaults };
})();
