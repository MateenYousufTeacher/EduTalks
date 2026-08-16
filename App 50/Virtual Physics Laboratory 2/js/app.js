/* ===========================================================
   VIRTUAL PHYSICS LABORATORY — APPLICATION CONTROLLER
   =========================================================== */

const SIM_ORDER = ['motion','newton','friction','gravity','energy','pressure','heat','optics','circuit','magnetism'];

const CATEGORY_COLORS = {
  'Mechanics':'#1976D2',
  'Force & Motion':'#0D47A1',
  'Gravitation':'#26C6DA',
  'Energy':'#FFB300',
  'Fluids':'#26C6DA',
  'Thermal':'#E4574C',
  'Optics':'#8E5CE0',
  'Electricity':'#43A047',
  'Magnetism':'#0D47A1'
};

const state = {
  current: 'splash',
  activeSim: null,
  simHandle: null,
  search: '',
  category: 'All',
  favorites: JSON.parse(localStorage.getItem('vpl_favorites') || '[]'),
  history: JSON.parse(localStorage.getItem('vpl_history') || '[]'),
  theme: localStorage.getItem('vpl_theme') || 'light',
  deferredInstallPrompt: null
};

function getSims(){
  return SIM_ORDER.map(id => window.Sims[id]).filter(Boolean);
}

/* ---------------- ROUTING ---------------- */
function showView(id){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  state.current = id;

  document.getElementById('bottomNav').style.display =
    (id === 'splash' || id === 'simscreen') ? 'none' : 'flex';

  document.querySelectorAll('.nav-btn').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.goto === id);
  });

  if (id !== 'simscreen' && state.simHandle){
    try{ state.simHandle.unmount && state.simHandle.unmount(); }catch(e){}
    state.simHandle = null;
    state.activeSim = null;
  }

  if (id === 'home') renderHome();
  if (id === 'simulations'){ searchList.value = state.search; renderSimList(); }
  if (id === 'favorites') renderFavorites();
  if (id === 'history') renderHistory();
  if (id === 'profile'){ openProfileModal(); showView(state.lastMainView || 'home'); return; }

  if (['home','simulations','favorites','history'].includes(id)) state.lastMainView = id;
  window.scrollTo(0,0);
}

document.addEventListener('click', (e) => {
  const gotoEl = e.target.closest('[data-goto]');
  if (gotoEl){ showView(gotoEl.dataset.goto); }
});

/* ---------------- THEME ---------------- */
function applyTheme(){
  document.documentElement.setAttribute('data-theme', state.theme === 'dark' ? 'dark' : 'light');
  document.body.setAttribute('data-theme', state.theme === 'dark' ? 'dark' : 'light');
  const icon = state.theme === 'dark' ? '☀️' : '🌙';
  ['btnDarkHome','btnDarkList'].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.textContent = icon;
  });
  const chk = document.getElementById('btnDarkProfile');
  if (chk) chk.checked = state.theme === 'dark';
}
function toggleTheme(){
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('vpl_theme', state.theme);
  applyTheme();
}
['btnDarkHome','btnDarkList'].forEach(id=>{
  document.getElementById(id).addEventListener('click', toggleTheme);
});
document.getElementById('btnDarkProfile').addEventListener('change', toggleTheme);

/* ---------------- CARD RENDERING ---------------- */
function simCard(sim){
  const isFav = state.favorites.includes(sim.id);
  return `
  <div class="sim-card" data-sim="${sim.id}">
    <div class="fav-btn" data-fav="${sim.id}">${isFav ? '❤️' : '🤍'}</div>
    <div class="thumb" style="background:linear-gradient(135deg, ${sim.color}, ${shade(sim.color)})">${sim.icon}</div>
    <div class="body">
      <span class="tag">${sim.category}</span>
      <b>${sim.name}</b>
      <small>${sim.desc}</small>
    </div>
  </div>`;
}
function shade(hex){
  // lighten a hex color slightly for gradient
  try{
    const c = hex.replace('#','');
    const num = parseInt(c,16);
    let r=(num>>16)+40, g=((num>>8)&0xff)+40, b=(num&0xff)+40;
    r=Math.min(255,r); g=Math.min(255,g); b=Math.min(255,b);
    return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;
  }catch(e){ return hex; }
}
function attachCardEvents(container){
  container.querySelectorAll('.sim-card').forEach(card=>{
    card.addEventListener('click', (e)=>{
      if (e.target.closest('.fav-btn')) return;
      openSim(card.dataset.sim);
    });
  });
  container.querySelectorAll('[data-fav]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      toggleFavorite(btn.dataset.fav);
      renderCurrentView();
    });
  });
}
function toggleFavorite(id){
  const idx = state.favorites.indexOf(id);
  if (idx>-1){ state.favorites.splice(idx,1); showToast('Removed from favorites'); }
  else { state.favorites.push(id); showToast('Added to favorites ❤️','success'); }
  localStorage.setItem('vpl_favorites', JSON.stringify(state.favorites));
}
function renderCurrentView(){
  if (state.current==='home') renderHome();
  if (state.current==='simulations') renderSimList();
  if (state.current==='favorites') renderFavorites();
  if (state.current==='history') renderHistory();
}

/* ---------------- HOME ---------------- */
function renderHome(){
  const sims = getSims();
  document.getElementById('homeSimGrid').innerHTML = sims.slice(0,6).map(simCard).join('');
  attachCardEvents(document.getElementById('homeSimGrid'));

  const cats = ['All', ...new Set(sims.map(s=>s.category))];
  document.getElementById('homeCategoryScroll').innerHTML = cats.map(c =>
    `<button class="chip ${c===state.category?'active':''}" data-cat="${c}">${c}</button>`
  ).join('');
  document.querySelectorAll('#homeCategoryScroll .chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{ state.category = chip.dataset.cat; showView('simulations'); });
  });

  const explored = new Set(state.history).size;
  document.getElementById('progressFill').style.width = `${(explored/10)*100}%`;
  document.getElementById('progressText').textContent = `${explored} of 10 simulations explored`;
}

/* ---------------- LIST ---------------- */
function renderSimList(){
  const sims = getSims();
  const cats = ['All', ...new Set(sims.map(s=>s.category))];
  document.getElementById('listCategoryScroll').innerHTML = cats.map(c =>
    `<button class="chip ${c===state.category?'active':''}" data-cat="${c}">${c}</button>`
  ).join('');
  document.querySelectorAll('#listCategoryScroll .chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{ state.category = chip.dataset.cat; renderSimList(); });
  });

  const q = state.search.trim().toLowerCase();
  const filtered = sims.filter(s=>{
    const catOk = state.category === 'All' || s.category === state.category;
    const qOk = !q || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
    return catOk && qOk;
  });

  document.getElementById('simCountLabel').textContent = `${filtered.length} experiment${filtered.length!==1?'s':''}`;
  const grid = document.getElementById('listSimGrid');
  grid.innerHTML = filtered.length ? filtered.map(simCard).join('') :
    `<div class="no-results" style="grid-column:1/-1">🔍<br>No simulations match your search.</div>`;
  attachCardEvents(grid);
}
const searchList = document.getElementById('searchList');
searchList.addEventListener('input', ()=>{ state.search = searchList.value; renderSimList(); });
searchList.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ renderSimList(); } });
const searchHome = document.getElementById('searchHome');
searchHome.addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){ state.search = searchHome.value; state.category='All'; showView('simulations'); }
});

/* ---------------- FAVORITES / HISTORY ---------------- */
function renderFavorites(){
  const sims = getSims().filter(s=>state.favorites.includes(s.id));
  const grid = document.getElementById('favSimGrid');
  grid.innerHTML = sims.length ? sims.map(simCard).join('') :
    `<div class="no-results" style="grid-column:1/-1">🤍<br>No favorites yet.<br><small>Tap the heart on any simulation to save it here.</small></div>`;
  attachCardEvents(grid);
}
function renderHistory(){
  const uniqueIds = [...new Set(state.history)].reverse();
  const sims = uniqueIds.map(id=>window.Sims[id]).filter(Boolean);
  const grid = document.getElementById('historySimGrid');
  grid.innerHTML = sims.length ? sims.map(simCard).join('') :
    `<div class="no-results" style="grid-column:1/-1">🕓<br>You haven't explored any simulations yet.</div>`;
  attachCardEvents(grid);
}

/* ---------------- SIMULATION SCREEN ---------------- */
function openSim(id){
  const sim = window.Sims[id];
  if (!sim) return;

  if (state.simHandle){ try{ state.simHandle.unmount && state.simHandle.unmount(); }catch(e){} }

  state.activeSim = id;
  state.history.push(id);
  localStorage.setItem('vpl_history', JSON.stringify(state.history.slice(-50)));

  document.getElementById('simTitle').textContent = sim.name;
  document.getElementById('simSubject').textContent = sim.category;
  document.getElementById('simTag').textContent = sim.category.toUpperCase();
  document.getElementById('simHeading').textContent = sim.name;
  document.getElementById('simDesc').textContent = sim.desc;
  document.getElementById('btnFavSim').textContent = state.favorites.includes(id) ? '★' : '☆';
  document.getElementById('btnFavSim').style.color = state.favorites.includes(id) ? 'var(--amber)' : 'inherit';

  const stage = document.getElementById('simStage');
  const controlsHost = document.getElementById('controlsHost');
  stage.innerHTML = '';
  controlsHost.innerHTML = '';
  document.getElementById('theoryHost').innerHTML = sim.theoryHTML || '';
  document.getElementById('instructionsHost').innerHTML = sim.instructionsHTML || '';

  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="experiment"]').classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-experiment').classList.add('active');

  showView('simscreen');

  try{
    state.simHandle = sim.mount(stage, controlsHost, { showToast });
  }catch(err){
    console.error('Simulation failed to load', sim.id, err);
    stage.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--text-muted)">
      ⚠️ This simulation hit a snag loading.<br><small>Try reopening it — your other experiments are unaffected.</small></div>`;
  }
}
document.getElementById('btnFavSim').addEventListener('click', ()=>{
  if (!state.activeSim) return;
  toggleFavorite(state.activeSim);
  const isFav = state.favorites.includes(state.activeSim);
  document.getElementById('btnFavSim').textContent = isFav ? '★' : '☆';
  document.getElementById('btnFavSim').style.color = isFav ? 'var(--amber)' : 'inherit';
});

document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
  });
});

/* ---------------- TOAST ---------------- */
let toastTimer;
function showToast(msg, type=''){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.classList.remove('show'), 2200);
}

/* ---------------- PROFILE MODAL ---------------- */
function openProfileModal(){ document.getElementById('profileModal').classList.add('show'); }
function closeProfileModal(){ document.getElementById('profileModal').classList.remove('show'); }
document.getElementById('btnCloseProfile').addEventListener('click', closeProfileModal);
document.getElementById('profileModal').addEventListener('click', (e)=>{
  if (e.target.id === 'profileModal') closeProfileModal();
});
document.getElementById('btnReset').addEventListener('click', ()=>{
  state.favorites = []; state.history = [];
  localStorage.removeItem('vpl_favorites'); localStorage.removeItem('vpl_history');
  showToast('Progress and favorites reset');
  renderCurrentView();
});
document.getElementById('btnInstall').addEventListener('click', async ()=>{
  if (state.deferredInstallPrompt){
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
  } else {
    showToast('Use your browser menu → "Add to Home Screen" to install');
  }
});
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  state.deferredInstallPrompt = e;
});

/* ---------------- SPLASH ---------------- */
document.getElementById('btnEnter').addEventListener('click', ()=> showView('home'));

/* ---------------- SERVICE WORKER ---------------- */
if ('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  });
}

window.addEventListener('vpl-toast', (e)=> showToast(e.detail));

/* ---------------- INIT ---------------- */
applyTheme();
renderHome();
