/* Virtual History Laboratory — local persistence layer (offline, localStorage only) */
const Store = (() => {
  const KEY = 'vhl_v1';
  const DEFAULTS = {
    settings: { theme: 'dark', mode: 'student', textSize: 'md' },
    progress: {},      // simId -> { visited, completed, bestScore, lastPane, updatedAt }
    notes: {},         // simId -> string (observation notes)
    bookmarks: [],      // list of {type:'sim'|'artifact'|'glossary', id}
    achievements: [],   // list of achievement ids unlocked
    xp: 0,
    streak: { count: 0, last: null },
    quizHistory: {}     // simId -> { score, total, date }
  };

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return structuredClone(DEFAULTS);
      const parsed = JSON.parse(raw);
      return Object.assign(structuredClone(DEFAULTS), parsed);
    }catch(e){ return structuredClone(DEFAULTS); }
  }
  let state = load();

  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){ /* storage full/unavailable */ }
  }

  function touchStreak(){
    const today = new Date().toISOString().slice(0,10);
    if(state.streak.last === today) return;
    const y = new Date(Date.now()-86400000).toISOString().slice(0,10);
    state.streak.count = (state.streak.last === y) ? state.streak.count + 1 : 1;
    state.streak.last = today;
    save();
  }

  function addXP(n){
    state.xp += n; save(); return state.xp;
  }

  function levelFromXP(xp){
    const levels = ['Novice Explorer','Junior Historian','Field Investigator','Site Archaeologist',
      'Heritage Analyst','Chronicle Keeper','Master Historian','Grand Curator'];
    const idx = Math.min(levels.length-1, Math.floor(xp/250));
    return { title: levels[idx], idx, next: (idx+1)*250, prev: idx*250 };
  }

  function markVisited(simId){
    state.progress[simId] = Object.assign({visited:true, completed:false, bestScore:0}, state.progress[simId], {visited:true, updatedAt:Date.now()});
    save(); touchStreak();
  }
  function markCompleted(simId, score, total){
    const p = state.progress[simId] = Object.assign({visited:true, completed:false, bestScore:0}, state.progress[simId]);
    p.completed = true;
    p.bestScore = Math.max(p.bestScore||0, score);
    p.updatedAt = Date.now();
    state.quizHistory[simId] = { score, total, date: Date.now() };
    save();
    addXP(40 + score*8);
    checkAchievements();
  }
  function saveNotes(simId, text){ state.notes[simId] = text; save(); }
  function getNotes(simId){ return state.notes[simId] || ''; }

  function toggleBookmark(type, id){
    const key = type+':'+id;
    const i = state.bookmarks.findIndex(b => (b.type+':'+b.id)===key);
    if(i>=0) state.bookmarks.splice(i,1); else state.bookmarks.push({type,id, at:Date.now()});
    save();
    return i<0;
  }
  function isBookmarked(type,id){ return state.bookmarks.some(b=>b.type===type && b.id===id); }

  const ACHV = [
    {id:'first-steps', name:'First Steps', desc:'Visit your first simulation', check: s => Object.keys(s.progress).length>=1},
    {id:'five-sites', name:'Field Veteran', desc:'Visit 5 different simulations', check: s => Object.keys(s.progress).length>=5},
    {id:'all-sites', name:'Master Curator', desc:'Visit all 10 simulations', check: s => Object.keys(s.progress).length>=10},
    {id:'quiz-ace', name:'Sharp Mind', desc:'Score full marks on a mini quiz', check: s => Object.values(s.quizHistory).some(q=>q.score===q.total)},
    {id:'three-complete', name:'Dedicated Scholar', desc:'Complete 3 simulations', check: s => Object.values(s.progress).filter(p=>p.completed).length>=3},
    {id:'streak-3', name:'Consistent Investigator', desc:'3-day learning streak', check: s => s.streak.count>=3},
    {id:'note-taker', name:'Meticulous Notes', desc:'Save observation notes in 3 simulations', check: s => Object.values(s.notes).filter(n=>n && n.trim().length>0).length>=3},
    {id:'bookworm', name:'Bookmark Collector', desc:'Bookmark 5 items', check: s => s.bookmarks.length>=5},
  ];
  function checkAchievements(){
    let unlocked = [];
    ACHV.forEach(a=>{
      if(!state.achievements.includes(a.id) && a.check(state)){
        state.achievements.push(a.id); unlocked.push(a);
      }
    });
    if(unlocked.length) save();
    return unlocked;
  }

  function setSetting(k,v){ state.settings[k]=v; save(); }

  return {
    get state(){ return state; },
    DEFAULTS, ACHV,
    markVisited, markCompleted, saveNotes, getNotes,
    toggleBookmark, isBookmarked,
    setSetting, addXP, levelFromXP, checkAchievements, touchStreak,
    reset(){ state = structuredClone(DEFAULTS); save(); }
  };
})();
