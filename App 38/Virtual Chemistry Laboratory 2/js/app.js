/* ============================================================
   VIRTUAL CHEMISTRY LABORATORY — Core App Engine
   Created by Dr. Mateen Yousuf, School Education Department, Kashmir
   ============================================================ */

const STORAGE_KEY = 'vcl_progress_v1';

const SIM_REGISTRY = [
  { id:'thermo',      name:'ThermoQuest',        sub:'Energy in Chemistry',        domain:'Thermochemistry',   icon:'🌡️', color:'#E53935', desc:'Measure heat transfer with a virtual calorimeter.' },
  { id:'kinetics',     name:'Reaction Race',      sub:'Chemistry in Motion',        domain:'Kinetics',          icon:'⏱️', color:'#FB8C00', desc:'Investigate what makes reactions speed up or slow down.' },
  { id:'equilibrium',  name:'Equilibrium Shift',  sub:'Find the Balance',           domain:'Equilibrium',       icon:'⚖️', color:'#8E24AA', desc:'Explore dynamic equilibrium and Le Chatelier\'s principle.' },
  { id:'gaslab',       name:'GasLab',             sub:'The Invisible World',        domain:'Gas Laws',          icon:'💨', color:'#1976D2', desc:'Manipulate pressure, volume and temperature of a gas.' },
  { id:'solution',     name:'Solution Studio',    sub:'Concentration Master',       domain:'Solutions',         icon:'🧪', color:'#26C6DA', desc:'Prepare solutions to a target concentration.' },
  { id:'solubility',   name:'Solubility Explorer',sub:'Saturation Station',         domain:'Solubility',        icon:'💧', color:'#00897B', desc:'Discover how temperature affects how much can dissolve.' },
  { id:'spectrum',     name:'Spectrum Lab',       sub:'Read the Light',             domain:'Spectroscopy',      icon:'🌈', color:'#5E35B1', desc:'Analyse spectra to identify unknown samples.' },
  { id:'nuclear',      name:'Nuclear Lab',        sub:'Inside the Nucleus',         domain:'Nuclear Chemistry', icon:'☢️', color:'#43A047', desc:'Watch radioactive decay and measure half-life.' },
  { id:'crystal',      name:'Crystal Architect',  sub:'Build the Solid',            domain:'Crystallography',   icon:'💎', color:'#3949AB', desc:'Construct 3D unit cells and explore crystal lattices.' },
  { id:'atmosphere',   name:'Atmosphere Lab',     sub:'Chemistry of Our Planet',    domain:'Atmospheric Chem.', icon:'🌍', color:'#00ACC1', desc:'Explore Earth\'s atmosphere as a chemical system.' },
];

const ACHIEVEMENT_DEFS = [
  { id:'first_steps', name:'First Steps', desc:'Complete your first experiment', icon:'🔬' },
  { id:'all_rounder', name:'All-Rounder', desc:'Try every simulation at least once', icon:'🧭' },
  { id:'perfectionist', name:'Perfectionist', desc:'Score 100% accuracy on any challenge', icon:'🎯' },
  { id:'streak_3', name:'Consistent Investigator', desc:'Complete experiments 3 days in a row', icon:'🔥' },
  { id:'xp_500', name:'Rising Chemist', desc:'Earn 500 XP', icon:'⭐' },
  { id:'xp_2000', name:'Master Chemist', desc:'Earn 2000 XP', icon:'🏆' },
  { id:'fastest_investigator', name:'Fastest Investigator', desc:'Find the fastest reaction condition', icon:'🚀' },
  { id:'equilibrium_master', name:'Equilibrium Master', desc:'Correctly predict 5 equilibrium shifts', icon:'🧘' },
  { id:'spectroscopy_expert', name:'Spectroscopy Expert', desc:'Correctly identify 5 unknown spectra', icon:'🔭' },
  { id:'decay_detective', name:'Decay Detective', desc:'Estimate half-life within 5% accuracy', icon:'🧬' },
];

const state = {
  progress: null,
  currentSim: null,
  navHistory: ['home'],
};

/* ---------------- Storage ---------------- */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) { console.warn('progress load failed', e); }
  return {
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    achievements: [],
    sims: {}, // id -> {completed, bestAccuracy, attempts, timeSpent}
    challengeStats: { correctPredictions:0, correctSpectra:0 },
  };
}
function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); }
  catch(e) { console.warn('progress save failed', e); }
}
function getSimProgress(id) {
  if (!state.progress.sims[id]) {
    state.progress.sims[id] = { completed:0, attempts:0, bestAccuracy:0, xp:0, visited:false };
  }
  return state.progress.sims[id];
}

/* ---------------- XP / Level / Streak ---------------- */
function xpForLevel(level) { return level * 200; }

function addXP(amount, reason) {
  state.progress.xp += amount;
  showToast(`+${amount} XP — ${reason}`, 'xp');
  let leveled = false;
  while (state.progress.xp >= xpForLevel(state.progress.level)) {
    state.progress.xp -= 0; // keep cumulative; level just tracks thresholds
    state.progress.level += 1;
    leveled = true;
    break; // recompute against cumulative below instead
  }
  // Recompute level from cumulative XP total stored separately
  recomputeLevel();
  if (leveled) showToast(`Level up! You're now Level ${state.progress.level}`, 'achieve');
  checkAchievements();
  saveProgress();
  renderXPPill();
}
function recomputeLevel() {
  // total xp based leveling: level n requires sum(200*i) ... simplified: level = floor(xp/300)+1
  state.progress.level = Math.floor(state.progress.xp / 300) + 1;
}
function touchStreak() {
  const today = new Date().toDateString();
  if (state.progress.lastActiveDate === today) return;
  const y = new Date(); y.setDate(y.getDate()-1);
  if (state.progress.lastActiveDate === y.toDateString()) {
    state.progress.streak += 1;
  } else {
    state.progress.streak = 1;
  }
  state.progress.lastActiveDate = today;
  if (state.progress.streak >= 3) unlockAchievement('streak_3');
  saveProgress();
}
function unlockAchievement(id) {
  if (state.progress.achievements.includes(id)) return;
  state.progress.achievements.push(id);
  const def = ACHIEVEMENT_DEFS.find(a=>a.id===id);
  if (def) showToast(`Achievement unlocked: ${def.name} ${def.icon}`, 'achieve');
  saveProgress();
}
function checkAchievements() {
  if (state.progress.xp >= 500) unlockAchievement('xp_500');
  if (state.progress.xp >= 2000) unlockAchievement('xp_2000');
  const visitedAll = SIM_REGISTRY.every(s => state.progress.sims[s.id] && state.progress.sims[s.id].visited);
  if (visitedAll) unlockAchievement('all_rounder');
  const anyCompleted = Object.values(state.progress.sims).some(s => s.completed > 0);
  if (anyCompleted) unlockAchievement('first_steps');
}
function recordCompletion(simId, accuracyPct) {
  const sp = getSimProgress(simId);
  sp.completed += 1;
  sp.bestAccuracy = Math.max(sp.bestAccuracy, accuracyPct || 0);
  if (accuracyPct === 100) unlockAchievement('perfectionist');
  touchStreak();
  checkAchievements();
  saveProgress();
}
function recordAttempt(simId) {
  const sp = getSimProgress(simId);
  sp.attempts += 1;
  sp.visited = true;
  saveProgress();
}

/* ---------------- Toasts ---------------- */
function showToast(msg, type='') {
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' '+type : '');
  el.innerHTML = `<span>${type==='xp' ? '⚡' : type==='achieve' ? '🏅' : 'ℹ️'}</span><span>${msg}</span>`;
  stack.appendChild(el);
  setTimeout(()=>el.remove(), 3000);
}

/* ---------------- Navigation ---------------- */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo(0,0);
}
function goHome() {
  state.currentSim = null;
  renderHome();
  showScreen('screenHome');
  setActiveNav('home');
}
function goSimList() {
  renderSimList();
  showScreen('screenSimList');
  setActiveNav('sims');
}
function goFavorites() { renderFavorites(); showScreen('screenFavorites'); setActiveNav('favorites'); }
function goProfile() { renderProfile(); showScreen('screenProfile'); setActiveNav('profile'); }
function setActiveNav(key) {
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active', b.dataset.nav===key));
}

function openSimulation(id) {
  const def = SIM_REGISTRY.find(s=>s.id===id);
  if (!def) return;
  state.currentSim = id;
  window.__currentSimId = id;
  recordAttempt(id);
  document.getElementById('simTitle').textContent = def.name;
  const favBtn = document.getElementById('favToggleBtn');
  if (favBtn) favBtn.textContent = isFavorite(id) ? '★' : '⭐';
  const container = document.getElementById('simContainer');
  container.innerHTML = '';
  showScreen('screenSim');
  const mod = window.SIMULATIONS && window.SIMULATIONS[id];
  if (mod && typeof mod.mount === 'function') {
    mod.mount(container, { addXP, unlockAchievement, recordCompletion, showToast, def, Chart: ChartHelper, progress: state.progress });
  } else {
    container.innerHTML = `<div class="empty-state"><div class="ic">🚧</div><p>This simulation module failed to load.</p></div>`;
  }
  renderXPPill();
}
function closeSimulation() {
  const mod = window.SIMULATIONS && state.currentSim && window.SIMULATIONS[state.currentSim];
  if (mod && typeof mod.unmount === 'function') { try { mod.unmount(); } catch(e){} }
  goHome();
}

/* ---------------- Favorites ---------------- */
function toggleFavorite(id) {
  if (!state.progress.favorites) state.progress.favorites = [];
  const idx = state.progress.favorites.indexOf(id);
  if (idx>=0) state.progress.favorites.splice(idx,1); else state.progress.favorites.push(id);
  saveProgress();
}
function isFavorite(id) { return (state.progress.favorites||[]).includes(id); }
function toggleFavoriteCurrentSim() {
  if (!window.__currentSimId) return;
  toggleFavorite(window.__currentSimId);
  const favBtn = document.getElementById('favToggleBtn');
  if (favBtn) favBtn.textContent = isFavorite(window.__currentSimId) ? '★' : '⭐';
  showToast(isFavorite(window.__currentSimId) ? 'Added to favorites' : 'Removed from favorites');
}

/* ---------------- Renderers ---------------- */
function iconChip(sim) {
  return `<div class="sim-icon" style="background:${sim.color}">${sim.icon}</div>`;
}
function renderHome() {
  const totalCompleted = Object.values(state.progress.sims).reduce((a,s)=>a+s.completed,0);
  const visitedCount = Object.values(state.progress.sims).filter(s=>s.visited).length;
  const el = document.getElementById('homeContent');
  el.innerHTML = `
    <div class="home-hero">
      <img src="assets/mateen-photo.jpg" alt="Dr. Mateen Yousuf">
      <div class="hero-text">
        <h2>Virtual Chemistry Laboratory</h2>
        <p>Created by Dr. Mateen Yousuf · School Education Department, Kashmir</p>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat-card"><div class="stat-num">${state.progress.xp}</div><div class="stat-label">XP</div></div>
      <div class="stat-card"><div class="stat-num">${state.progress.level}</div><div class="stat-label">Level</div></div>
      <div class="stat-card"><div class="stat-num">${state.progress.streak}</div><div class="stat-label">Streak</div></div>
      <div class="stat-card"><div class="stat-num">${visitedCount}/10</div><div class="stat-label">Explored</div></div>
    </div>
    <div class="section-label"><h3>Continue exploring</h3><button class="link-btn" onclick="goSimList()">See all →</button></div>
    <div class="grid-2" id="homeSimGrid"></div>
    <div class="section-label"><h3>Recent achievements</h3><button class="link-btn" onclick="goProfile()">View all →</button></div>
    <div id="homeAchievements" class="flex gap-8" style="flex-wrap:wrap;"></div>
  `;
  const grid = document.getElementById('homeSimGrid');
  SIM_REGISTRY.slice(0,4).forEach(sim => grid.appendChild(simCard(sim)));
  const ach = document.getElementById('homeAchievements');
  const unlocked = state.progress.achievements.slice(-4);
  if (unlocked.length === 0) {
    ach.innerHTML = `<p class="muted" style="font-size:.82rem;">Complete an experiment to earn your first badge.</p>`;
  } else {
    unlocked.forEach(id => {
      const def = ACHIEVEMENT_DEFS.find(a=>a.id===id);
      if (def) {
        const b = document.createElement('div'); b.className='badge amber';
        b.innerHTML = `${def.icon} ${def.name}`;
        ach.appendChild(b);
      }
    });
  }
}
function simCard(sim) {
  const sp = getSimProgress(sim.id);
  const card = document.createElement('button');
  card.className = 'sim-card';
  card.setAttribute('aria-label', `Open ${sim.name}`);
  card.onclick = () => openSimulation(sim.id);
  const pct = Math.min(100, sp.completed * 20);
  card.innerHTML = `
    ${iconChip(sim)}
    <div class="sim-domain">${sim.domain}</div>
    <h4>${sim.name}</h4>
    <p class="sim-desc">${sim.desc}</p>
    <div class="sim-progress-bar"><div class="sim-progress-fill" style="width:${pct}%"></div></div>
  `;
  return card;
}
function renderSimList() {
  const el = document.getElementById('simListContent');
  el.innerHTML = `<div id="simListGrid"></div>`;
  const grid = document.getElementById('simListGrid');
  SIM_REGISTRY.forEach(sim => {
    const sp = getSimProgress(sim.id);
    const row = document.createElement('div');
    row.className = 'list-row';
    row.onclick = () => openSimulation(sim.id);
    row.innerHTML = `
      <div class="sim-icon" style="background:${sim.color}">${sim.icon}</div>
      <div class="row-text">
        <h4>${sim.name}</h4>
        <p>${sim.domain} · ${sp.completed>0 ? sp.completed+' experiment'+(sp.completed>1?'s':'')+' completed' : 'Not started'}</p>
      </div>
      <div class="chevron">›</div>
    `;
    grid.appendChild(row);
  });
}
function renderFavorites() {
  const el = document.getElementById('favContent');
  const favs = (state.progress.favorites||[]);
  if (favs.length===0) {
    el.innerHTML = `<div class="empty-state"><div class="ic">⭐</div><p>No favorites yet.<br>Tap the star inside a simulation to save it here.</p></div>`;
    return;
  }
  el.innerHTML = `<div class="grid-2" id="favGrid"></div>`;
  const grid = document.getElementById('favGrid');
  favs.forEach(id => {
    const sim = SIM_REGISTRY.find(s=>s.id===id);
    if (sim) grid.appendChild(simCard(sim));
  });
}
function renderProfile() {
  const el = document.getElementById('profileContent');
  const totalCompleted = Object.values(state.progress.sims).reduce((a,s)=>a+s.completed,0);
  el.innerHTML = `
    <div class="home-hero">
      <img src="assets/mateen-photo.jpg" alt="Dr. Mateen Yousuf">
      <div class="hero-text">
        <h2>Level ${state.progress.level} Chemist</h2>
        <p>${state.progress.xp} XP earned · ${state.progress.streak} day streak</p>
      </div>
    </div>
    <div class="stat-row">
      <div class="stat-card"><div class="stat-num">${totalCompleted}</div><div class="stat-label">Experiments</div></div>
      <div class="stat-card"><div class="stat-num">${state.progress.achievements.length}</div><div class="stat-label">Badges</div></div>
      <div class="stat-card"><div class="stat-num">${Object.values(state.progress.sims).filter(s=>s.visited).length}</div><div class="stat-label">Modules</div></div>
      <div class="stat-card"><div class="stat-num">${Math.max(0,...Object.values(state.progress.sims).map(s=>s.bestAccuracy||0))}%</div><div class="stat-label">Best Acc.</div></div>
    </div>
    <h3>Achievements</h3>
    <div class="grid-2" id="achGrid"></div>
    <div class="section-label"><h3>App</h3></div>
    <div class="card">
      <div class="flex justify-between items-center" style="margin-bottom:10px;">
        <span>Offline mode</span><span class="badge green">Always on</span>
      </div>
      <div class="flex justify-between items-center" style="margin-bottom:10px;">
        <span>Install app</span><button class="btn btn-secondary btn-sm" id="installBtn2">Install</button>
      </div>
      <div class="flex justify-between items-center">
        <span>Reset all progress</span><button class="btn btn-danger btn-sm" onclick="resetProgress()">Reset</button>
      </div>
    </div>
    <p class="muted text-center" style="font-size:.75rem; margin-top:20px;">Virtual Chemistry Laboratory · Developed by Dr. Mateen Yousuf<br>Teacher, School Education Department, Kashmir</p>
  `;
  const grid = document.getElementById('achGrid');
  ACHIEVEMENT_DEFS.forEach(def => {
    const unlocked = state.progress.achievements.includes(def.id);
    const card = document.createElement('div');
    card.className = 'card';
    card.style.opacity = unlocked ? '1' : '.45';
    card.style.padding = '12px';
    card.innerHTML = `<div style="font-size:1.6rem;">${def.icon}</div><h4 style="margin:6px 0 2px;font-size:.85rem;">${def.name}</h4><p style="font-size:.7rem;color:#778;margin:0;">${def.desc}</p>`;
    grid.appendChild(card);
  });
  const installBtn2 = document.getElementById('installBtn2');
  if (installBtn2) installBtn2.onclick = triggerInstall;
}
function resetProgress() {
  if (!confirm('This will erase all XP, achievements and experiment history on this device. Continue?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state.progress = loadProgress();
  renderXPPill();
  renderProfile();
  showToast('Progress reset', '');
}
function renderXPPill() {
  const pill = document.getElementById('xpPill');
  if (pill) pill.textContent = `⚡ ${state.progress.xp} XP · Lv.${state.progress.level}`;
}

/* ---------------- Chart Helper (lightweight canvas line/bar charts) ---------------- */
const ChartHelper = {
  line(canvas, series, opts={}) {
    // series: [{label, color, points:[{x,y}]}], opts: {xLabel,yLabel,yMin,yMax,xMin,xMax}
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 300, cssH = canvas.clientHeight || 180;
    canvas.width = cssW*dpr; canvas.height = cssH*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);
    const pad = {l:38,r:14,t:12,b:26};
    const w = cssW-pad.l-pad.r, h = cssH-pad.t-pad.b;
    let allX = [], allY = [];
    series.forEach(s=>s.points.forEach(p=>{allX.push(p.x); allY.push(p.y);}));
    if (allX.length===0) return;
    const xMin = opts.xMin ?? Math.min(...allX), xMax = opts.xMax ?? Math.max(...allX, xMin+1);
    const yMin = opts.yMin ?? Math.min(0,...allY), yMax = opts.yMax ?? Math.max(...allY, yMin+1);
    const X = x => pad.l + (x-xMin)/(xMax-xMin||1) * w;
    const Y = y => pad.t + h - (y-yMin)/(yMax-yMin||1) * h;
    // grid
    ctx.strokeStyle = '#EEF1F6'; ctx.lineWidth=1; ctx.font = '10px sans-serif'; ctx.fillStyle='#8894a8';
    for (let i=0;i<=4;i++) {
      const gy = pad.t + h*i/4;
      ctx.beginPath(); ctx.moveTo(pad.l,gy); ctx.lineTo(pad.l+w,gy); ctx.stroke();
      const val = yMax - (yMax-yMin)*i/4;
      ctx.fillText(val.toFixed(val<10&&val>-10?1:0), 2, gy+3);
    }
    ctx.strokeStyle = '#c7cedb';
    ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+h); ctx.lineTo(pad.l+w,pad.t+h); ctx.stroke();
    // series
    series.forEach(s => {
      if (s.points.length===0) return;
      ctx.strokeStyle = s.color; ctx.lineWidth = 2.4; ctx.beginPath();
      s.points.forEach((p,i)=>{ const x=X(p.x), y=Y(p.y); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
      ctx.stroke();
      if (s.fill) {
        ctx.lineTo(X(s.points[s.points.length-1].x), Y(yMin));
        ctx.lineTo(X(s.points[0].x), Y(yMin));
        ctx.closePath();
        ctx.fillStyle = s.color + '22';
        ctx.fill();
      }
      if (s.dots) {
        ctx.fillStyle = s.color;
        s.points.forEach(p=>{ ctx.beginPath(); ctx.arc(X(p.x),Y(p.y),3,0,7); ctx.fill(); });
      }
    });
    // x axis labels (min/max)
    ctx.fillStyle = '#8894a8'; ctx.font='10px sans-serif';
    ctx.fillText(xMin.toFixed(1), pad.l, cssH-6);
    const maxLabel = xMax.toFixed(1);
    ctx.fillText(maxLabel, pad.l+w-ctx.measureText(maxLabel).width, cssH-6);
  },
  bar(canvas, bars, opts={}) {
    // bars: [{label, value, color}]
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 300, cssH = canvas.clientHeight || 180;
    canvas.width = cssW*dpr; canvas.height = cssH*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);
    const pad = {l:32,r:10,t:14,b:30};
    const w = cssW-pad.l-pad.r, h = cssH-pad.t-pad.b;
    const maxV = opts.yMax ?? Math.max(...bars.map(b=>b.value), 1);
    const bw = w/bars.length*0.6;
    const gap = w/bars.length;
    ctx.strokeStyle='#c7cedb'; ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,pad.t+h); ctx.lineTo(pad.l+w,pad.t+h); ctx.stroke();
    bars.forEach((b,i) => {
      const bh = (b.value/maxV)*h;
      const x = pad.l + gap*i + (gap-bw)/2;
      const y = pad.t+h-bh;
      ctx.fillStyle = b.color || '#1976D2';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x,y,bw,bh,[4,4,0,0]) : ctx.rect(x,y,bw,bh);
      ctx.fill();
      ctx.fillStyle = '#556'; ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText(b.label, x+bw/2, pad.t+h+14);
      ctx.fillStyle='#334'; ctx.fillText(b.value.toFixed(1), x+bw/2, y-4);
      ctx.textAlign='left';
    });
  }
};

/* ---------------- Modal helper ---------------- */
function openModal(html) {
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalBody').innerHTML = html;
  overlay.classList.add('active');
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }

/* ---------------- PWA install ---------------- */
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('installBtn');
  if (btn) btn.style.display = 'flex';
});
function triggerInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(()=>{ deferredInstallPrompt=null; });
  } else {
    showToast('Use your browser menu → "Add to Home Screen" / "Install App"', '');
  }
}

/* ---------------- Boot sequence ---------------- */
function boot() {
  state.progress = loadProgress();
  touchStreak();
  renderXPPill();
  const fill = document.getElementById('splashProgressFill');
  let p = 0;
  const iv = setInterval(()=>{
    p += 12 + Math.random()*10;
    if (p>=100) { p=100; clearInterval(iv); setTimeout(finishBoot, 260); }
    if (fill) fill.style.width = p+'%';
  }, 130);

  document.getElementById('navHome').onclick = goHome;
  document.getElementById('navSims').onclick = goSimList;
  document.getElementById('navFav').onclick = goFavorites;
  document.getElementById('navProfile').onclick = goProfile;
  document.getElementById('backFromSim').onclick = closeSimulation;
  document.getElementById('backFromList').onclick = goHome;
  document.getElementById('backFromFav').onclick = goHome;
  document.getElementById('backFromProfile').onclick = goHome;
  document.getElementById('modalOverlay').onclick = (e)=>{ if(e.target.id==='modalOverlay') closeModal(); };
  const installBtn = document.getElementById('installBtn');
  if (installBtn) installBtn.onclick = triggerInstall;
}
function finishBoot() {
  renderHome();
  showScreen('screenHome');
  setActiveNav('home');
}

document.addEventListener('DOMContentLoaded', boot);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW registration failed', err));
  });
}
