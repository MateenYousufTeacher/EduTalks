/* ============================================================
   STORE — local-only persistence (no network, no backend)
   ============================================================ */
const VPSL_STORE = (() => {
  const KEY = 'vpsl_state_v1';

  function defaultState(){
    return {
      xp:0, level:1,
      simsOpened:[], simsCompleted:[], simProgress:{}, // {simId: 0-100}
      quizScores:{}, // {simId: {best, attempts}}
      quizzesPassed:0, perfectQuizzes:0,
      notes:[], bookmarks:[],
      streak:1, lastVisit: new Date().toDateString(),
      theme:'dark', teacherMode:false, sound:true, reduceMotion:false,
      glossaryVisited:false, constitutionVisited:false,
      earnedAchievements:[],
      history:[], // recently visited sim ids
    };
  }

  let state = load();

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    }catch(e){ return defaultState(); }
  }

  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){/* storage unavailable */}
  }

  function updateStreak(){
    const today = new Date().toDateString();
    if(state.lastVisit !== today){
      const last = new Date(state.lastVisit);
      const diff = Math.round((new Date(today) - last) / 86400000);
      state.streak = diff === 1 ? state.streak + 1 : 1;
      state.lastVisit = today;
      save();
    }
  }

  function addXP(amount){
    state.xp += amount;
    const newLevel = Math.min(6, Math.floor(state.xp / 150) + 1);
    const leveled = newLevel > state.level;
    state.level = newLevel;
    save();
    return leveled;
  }

  function openSim(id){
    if(!state.simsOpened.includes(id)){
      state.simsOpened.push(id);
      addXP(10);
    }
    if(!state.history.includes(id)) state.history.unshift(id);
    state.history = state.history.slice(0,5);
    save();
    checkAchievements();
  }

  function setProgress(id, pct){
    state.simProgress[id] = Math.max(state.simProgress[id]||0, pct);
    if(pct>=100 && !state.simsCompleted.includes(id)){
      state.simsCompleted.push(id);
      addXP(40);
    }
    save();
    checkAchievements();
  }

  function recordQuiz(id, scorePct){
    const prev = state.quizScores[id] || {best:0, attempts:0};
    prev.attempts += 1;
    prev.best = Math.max(prev.best, scorePct);
    state.quizScores[id] = prev;
    if(scorePct>=60) state.quizzesPassed += 1;
    if(scorePct===100) state.perfectQuizzes += 1;
    addXP(scorePct>=60 ? 25 : 8);
    save();
    checkAchievements();
  }

  function addNote(simId, text){
    state.notes.push({simId, text, ts:Date.now()});
    save();
    checkAchievements();
  }

  function toggleBookmark(simId){
    const i = state.bookmarks.indexOf(simId);
    if(i>-1) state.bookmarks.splice(i,1); else state.bookmarks.push(simId);
    save();
  }

  function checkAchievements(){
    let newly = [];
    VPSL_DATA.achievements.forEach(a=>{
      if(!state.earnedAchievements.includes(a.id) && a.check(state)){
        state.earnedAchievements.push(a.id);
        newly.push(a);
        addXP(20);
      }
    });
    save();
    return newly;
  }

  function markGlossaryVisited(){ state.glossaryVisited = true; save(); checkAchievements(); }
  function markConstitutionVisited(){ state.constitutionVisited = true; save(); checkAchievements(); }
  function setSetting(key, val){ state[key] = val; save(); }
  function resetAll(){ state = defaultState(); save(); }

  return {
    get state(){ return state; },
    save, updateStreak, addXP, openSim, setProgress, recordQuiz,
    addNote, toggleBookmark, checkAchievements,
    markGlossaryVisited, markConstitutionVisited, setSetting, resetAll,
  };
})();
