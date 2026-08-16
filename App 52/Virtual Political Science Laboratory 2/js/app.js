/* ============================================================
   VIRTUAL POLITICAL SCIENCE LABORATORY — CORE APP
   Handles: state/progress storage, navigation, home dashboard,
   search, filters, achievements, settings, toast, PWA install.
   ============================================================ */

const Lab = (() => {
  const STORAGE_KEY = 'vpsl_progress_v1';
  const SETTINGS_KEY = 'vpsl_settings_v1';

  const SIMS = [];              // registered simulation definitions
  const simIndex = {};          // id -> definition

  let state = {
    progress: {},               // simId -> {status, stageIndex, quizScore, quizTotal, attempts}
    badges: {},                 // badgeId -> true
    lastActiveSim: null
  };

  let settings = {
    theme: 'dark',
    fontLarge: false
  };

  // ---------- persistence ----------
  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) state = Object.assign(state, JSON.parse(raw));
    }catch(e){ console.warn('Progress load failed', e); }
    try{
      const raw2 = localStorage.getItem(SETTINGS_KEY);
      if(raw2) settings = Object.assign(settings, JSON.parse(raw2));
    }catch(e){ console.warn('Settings load failed', e); }
  }
  function saveState(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
  }
  function saveSettings(){
    try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }catch(e){}
  }

  // ---------- registration ----------
  function registerSim(def){
    SIMS.push(def);
    simIndex[def.id] = def;
    if(!state.progress[def.id]){
      state.progress[def.id] = {status:'not-started', stageIndex:0, quizScore:0, quizTotal:0, attempts:0};
    }
  }
  function getSims(){ return SIMS.slice().sort((a,b)=>a.order-b.order); }
  function getSim(id){ return simIndex[id]; }
  function getProgress(id){ return state.progress[id] || {status:'not-started', stageIndex:0}; }
  function setProgress(id, patch){
    state.progress[id] = Object.assign(getProgress(id), patch);
    saveState();
    renderHomeBadgeCounts();
  }
  function unlockBadge(id){
    if(!state.badges[id]){
      state.badges[id] = true;
      saveState();
      showToast('🏅 Badge unlocked!');
    }
  }

  function overallStats(){
    const sims = getSims();
    const completed = sims.filter(s => getProgress(s.id).status === 'completed').length;
    const inProgress = sims.filter(s => getProgress(s.id).status === 'in-progress').length;
    return {completed, inProgress, total: sims.length};
  }

  // ---------- navigation ----------
  function showScreen(id){
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if(el) el.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.nav === id));
    window.scrollTo(0,0);
  }

  function goHome(){ renderHome(); showScreen('screen-home'); }

  function openSim(id){
    const def = simIndex[id];
    if(!def) return;
    state.lastActiveSim = id;
    const p = getProgress(id);
    if(p.status === 'not-started'){ setProgress(id, {status:'in-progress', stageIndex:0}); }
    SimEngine.render(def, p);
    showScreen('screen-sim');
  }

  // ---------- toast ----------
  let toastTimer;
  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> t.classList.remove('show'), 2200);
  }

  // ---------- home rendering ----------
  const ICONS = {
    democracy:'🗳️', election:'📮', parliament:'🏛️', executive:'⚖️', judiciary:'👨‍⚖️',
    constitution:'📜', federalism:'🗺️', local:'🏘️', policy:'📋', lawmaking:'✍️'
  };

  function statusLabel(s){
    return s==='completed' ? 'Completed' : s==='in-progress' ? 'In Progress' : 'Not Started';
  }

  let activeFilter = 'all';
  let searchTerm = '';

  function renderHome(){
    const stats = overallStats();
    document.getElementById('home-progress-text').textContent =
      `${stats.completed} of ${stats.total} simulations completed`;
    document.getElementById('home-progress-bar').style.width = (stats.completed/stats.total*100)+'%';

    // continue learning
    const cont = getSims().filter(s => getProgress(s.id).status === 'in-progress');
    const contWrap = document.getElementById('continue-row');
    const contSection = document.getElementById('continue-section');
    if(cont.length){
      contSection.style.display = '';
      contWrap.innerHTML = cont.map(s => {
        const p = getProgress(s.id);
        const pct = simProgressPct(s, p);
        return `<button class="continue-card" onclick="Lab.openSim('${s.id}')">
          <div class="tag">Continue</div>
          <h4>${s.title}</h4>
          <div class="mini-progress"><div style="width:${pct}%"></div></div>
        </button>`;
      }).join('');
    } else {
      contSection.style.display = 'none';
    }

    renderSimGrid();
  }

  function simProgressPct(def, p){
    if(p.status === 'completed') return 100;
    if(p.status === 'not-started') return 0;
    const totalStages = def.stages.length + 1; // +1 for quiz
    return Math.round((p.stageIndex||0) / totalStages * 100);
  }

  function renderSimGrid(){
    const grid = document.getElementById('sim-grid');
    let sims = getSims();

    if(activeFilter !== 'all'){
      sims = sims.filter(s => getProgress(s.id).status === activeFilter);
    }
    if(searchTerm.trim()){
      const t = searchTerm.trim().toLowerCase();
      sims = sims.filter(s =>
        s.title.toLowerCase().includes(t) ||
        s.shortDesc.toLowerCase().includes(t) ||
        (s.keywords||[]).some(k => k.toLowerCase().includes(t))
      );
    }

    if(!sims.length){
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <div class="em-icon">🔍</div>
        <div>No simulations match your search.</div>
      </div>`;
      return;
    }

    grid.innerHTML = sims.map(s => {
      const p = getProgress(s.id);
      return `<button class="sim-card" onclick="Lab.openSim('${s.id}')">
        <div class="sim-icon">${ICONS[s.id]||'📘'}</div>
        <h4>${s.title}</h4>
        <div class="desc">${s.shortDesc}</div>
        <span class="status-pill ${p.status}">${statusLabel(p.status)}</span>
      </button>`;
    }).join('');
  }

  function renderHomeBadgeCounts(){
    const el = document.getElementById('nav-badge-count');
    if(!el) return;
    const stats = overallStats();
    el.textContent = stats.completed > 0 ? stats.completed : '';
  }

  function setFilter(f){
    activeFilter = f;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.filter===f));
    renderSimGrid();
  }
  function onSearch(v){ searchTerm = v; renderSimGrid(); }

  // ---------- settings ----------
  function applyTheme(){
    document.body.classList.toggle('theme-light', settings.theme === 'light');
    const t = document.getElementById('theme-toggle');
    if(t) t.classList.toggle('on', settings.theme === 'light');
  }
  function toggleTheme(){
    settings.theme = settings.theme === 'light' ? 'dark' : 'light';
    saveSettings();
    applyTheme();
  }
  function resetProgress(){
    if(!confirm('Reset all simulation progress, quiz scores and badges? This cannot be undone.')) return;
    state.progress = {}; state.badges = {};
    getSims().forEach(s => state.progress[s.id] = {status:'not-started', stageIndex:0, quizScore:0, quizTotal:0, attempts:0});
    saveState();
    renderHome();
    Achievements.render();
    showToast('Progress reset');
  }

  function init(){
    loadState();
    applyTheme();
    renderHome();
    renderHomeBadgeCounts();
  }

  return {
    registerSim, getSims, getSim, getProgress, setProgress, unlockBadge,
    showScreen, goHome, openSim, showToast, renderHome, renderSimGrid,
    setFilter, onSearch, toggleTheme, resetProgress, init, overallStats, simProgressPct, ICONS
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Lab.init();

  // splash -> home
  setTimeout(() => {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  }, 1600);
  document.getElementById('splash').addEventListener('click', () => {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  });

  // service worker registration
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(()=>{});
    });
  }

  // offline banner
  function updateOnlineStatus(){
    const banner = document.getElementById('offline-banner');
    if(!banner) return;
    banner.style.display = navigator.onLine ? 'none' : 'flex';
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
});
