/* ==========================================================================
   VIRTUAL ECONOMICS LABORATORY — APP CORE
   Routing · Home · Simulation Runtime Engine · Gamification · Handbook/Glossary
   ========================================================================== */

const SIM_ORDER = [
  'demand-supply','market-equilibrium','inflation','banking','gdp',
  'budget','taxation','trade','consumer','entrepreneurship'
];

let currentRoute = 'home';
let currentSimId = null;
let currentTab = 'overview';
let playTimer = null;
let compareRuns = {}; // in-memory per-session, per sim

/* ------------------------------------------------------------------ */
/* BOOTSTRAP                                                           */
/* ------------------------------------------------------------------ */
window.addEventListener('DOMContentLoaded', () => {
  applyTheme(VECDB.get().theme);
  initSplash();
  wireGlobalUI();
  buildHome();
  buildAllSimsGrid();
  buildQuizCentre();
  buildGlossary();
  buildHandbook();
  buildSettings();
  buildAchievements();
  updateTopbarStats();
  window.setTimeout(() => document.getElementById('appLoading').style.display = 'none', 350);

  window.addEventListener('online', () => document.getElementById('offlineBanner').classList.remove('show'));
  window.addEventListener('offline', () => document.getElementById('offlineBanner').classList.add('show'));
  if(!navigator.onLine) document.getElementById('offlineBanner').classList.add('show');

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  }
});

/* ------------------------------------------------------------------ */
/* SPLASH SCREEN                                                       */
/* ------------------------------------------------------------------ */
function initSplash(){
  const splash = document.getElementById('splash');
  const canvas = document.getElementById('splashCanvas');
  animateBackground(canvas, 46);

  const enter = () => {
    splash.style.transition = 'opacity .5s ease';
    splash.style.opacity = '0';
    setTimeout(() => { splash.style.display='none'; document.getElementById('app').hidden = false; VECDB.touchStreak(); updateTopbarStats(); }, 480);
  };
  document.getElementById('enterAppBtn').addEventListener('click', enter);
  if(VECDB.get().seenSplash){
    // still show splash briefly for ceremony, but allow quick skip via same button
  }
  VECDB.set({ seenSplash: true });
}

function animateBackground(canvas, count){
  const ctx = canvas.getContext('2d');
  let w,h;
  function resize(){ w=canvas.width=canvas.offsetWidth*devicePixelRatio; h=canvas.height=canvas.offsetHeight*devicePixelRatio; }
  resize(); window.addEventListener('resize', resize);

  const symbols = ['₹','$','€','£','%','↑','↓','📈'];
  const particles = Array.from({length:count}, () => ({
    x: Math.random()*w, y: Math.random()*h,
    vy: 0.15+Math.random()*0.4, vx: (Math.random()-0.5)*0.2,
    size: 12+Math.random()*20, sym: symbols[Math.floor(Math.random()*symbols.length)],
    alpha: 0.05+Math.random()*0.18
  }));
  // trend lines
  const lines = Array.from({length:4}, (_,i)=>({
    offset: Math.random()*1000, amp: 40+Math.random()*70, speed: 0.15+i*0.05, y: (h/5)*(i+1), hue: i%2===0?'46,204,143':'47,143,239'
  }));

  let raf;
  function frame(t){
    ctx.clearRect(0,0,w,h);
    lines.forEach(ln=>{
      ctx.beginPath();
      for(let x=0;x<=w;x+=8){
        const y = ln.y + Math.sin((x*0.01)+(t*0.0002*ln.speed)+ln.offset)*ln.amp*0.15;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle = `rgba(${ln.hue},0.12)`; ctx.lineWidth=1.5; ctx.stroke();
    });
    particles.forEach(p=>{
      p.y -= p.vy; p.x += p.vx;
      if(p.y < -20){ p.y = h+20; p.x = Math.random()*w; }
      ctx.font = `${p.size}px sans-serif`;
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.fillText(p.sym, p.x, p.y);
    });
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------ */
/* GLOBAL UI (sidebar, topbar, theme, search, routing)                 */
/* ------------------------------------------------------------------ */
function wireGlobalUI(){
  document.querySelectorAll('.nav-item[data-route]').forEach(btn=>{
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });
  document.querySelectorAll('[data-route]').forEach(el=>{
    if(!el.classList.contains('nav-item')) el.addEventListener('click', ()=>navigate(el.dataset.route));
  });
  document.getElementById('hamburgerBtn').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('themeSwitch').addEventListener('click', toggleTheme);
  document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
  document.querySelector('[data-action="continue-learning"]').addEventListener('click', () => {
    const last = mostRecentSim();
    navigate('sim', last);
  });
  document.getElementById('globalSearch').addEventListener('input', (e)=> globalSearch(e.target.value));
}

function applyTheme(theme){
  document.body.dataset.theme = theme;
  document.getElementById('themeLabel').textContent = theme==='dark' ? '🌙 Dark Mode' : '☀️ Light Mode';
}
function toggleTheme(){
  const cur = VECDB.get().theme;
  const next = cur==='dark' ? 'light' : 'dark';
  VECDB.set({ theme: next });
  applyTheme(next);
}
function toggleFullscreen(){
  if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function navigate(route, param){
  currentRoute = route;
  document.querySelectorAll('.view').forEach(v=>v.hidden = true);
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-route="${route==='sim'?'simulations':route}"]`);
  if(navBtn) navBtn.classList.add('active');
  document.getElementById('sidebar').classList.remove('open');

  if(route === 'sim'){
    document.getElementById('view-sim').hidden = false;
    renderSimulation(param);
  } else {
    const view = document.getElementById('view-'+route);
    if(view) view.hidden = false;
    if(route==='dashboard') refreshDashboard();
    if(route==='bookmarks') buildBookmarks();
    if(route==='achievements') buildAchievements();
    if(route==='home'){ buildHome(); }
  }
  window.scrollTo({top:0, behavior:'instant'});
}

function mostRecentSim(){
  const prog = VECDB.get().progress;
  const started = SIM_ORDER.filter(id => prog[id] > 0 && prog[id] < 100);
  return started[0] || SIM_ORDER[0];
}

function updateTopbarStats(){
  const s = VECDB.get();
  document.getElementById('streakStat').textContent = s.streak || 0;
  document.getElementById('xpStat').textContent = s.xp || 0;
  document.getElementById('levelStat').textContent = s.level || 1;
}

function showToast(title, body, icon){
  const t = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastBody').textContent = body;
  t.querySelector('.ic').textContent = icon||'🏆';
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 4200);
}

function globalSearch(q){
  q = q.trim().toLowerCase();
  if(!q) return;
  const hit = SIM_ORDER.find(id => {
    const s = window.VEC_SIMS[id];
    return s.title.toLowerCase().includes(q) || s.shortDesc.toLowerCase().includes(q) || (s.tag||'').toLowerCase().includes(q);
  });
  if(hit){ navigate('sim', hit); document.getElementById('globalSearch').value=''; }
}

/* ------------------------------------------------------------------ */
/* SIMULATION META HELPERS                                             */
/* ------------------------------------------------------------------ */
function simIcon(id){ return window.VEC_SIMS[id].icon; }

function simCardHTML(id, idx){
  const s = window.VEC_SIMS[id];
  const pct = VECDB.get().progress[id] || 0;
  return `
  <article class="sim-card" data-route="sim" data-sim="${id}" tabindex="0" role="button" aria-label="Open ${s.title}">
    <div class="flex items-center" style="justify-content:space-between;">
      <span class="sim-num">SIM ${String(idx+1).padStart(2,'0')}</span>
      <span class="tag ${s.tagClass}">${s.tag}</span>
    </div>
    <div class="sim-icon">${s.icon}</div>
    <h3>${s.title}</h3>
    <p>${s.shortDesc}</p>
    <div class="progress-bar"><i style="width:${pct}%"></i></div>
    <div class="sim-meta"><span>${pct}% complete</span><span>${s.duration}</span></div>
  </article>`;
}
function wireSimCards(container){
  container.querySelectorAll('[data-sim]').forEach(el=>{
    el.addEventListener('click', ()=> navigate('sim', el.dataset.sim));
    el.addEventListener('keypress', (e)=>{ if(e.key==='Enter') navigate('sim', el.dataset.sim); });
  });
}

/* ------------------------------------------------------------------ */
/* HOME VIEW                                                           */
/* ------------------------------------------------------------------ */
function buildHome(){
  animateHero();
  const s = VECDB.get();
  const completed = SIM_ORDER.filter(id=>(s.progress[id]||0)>=100).length;
  const avgProg = Math.round(SIM_ORDER.reduce((a,id)=>a+(s.progress[id]||0),0)/SIM_ORDER.length);
  const quizAvg = (() => {
    const scores = Object.values(s.quizScores);
    if(!scores.length) return '—';
    const pct = scores.reduce((a,q)=>a+(q.score/q.total),0)/scores.length*100;
    return Math.round(pct)+'%';
  })();

  document.getElementById('dashStats').innerHTML = `
    ${statCard('Labs Completed', `${completed}/10`, completed>0?`+${completed} finished`:'Get started below','up')}
    ${statCard('Overall Progress', `${avgProg}%`, 'Across all simulations','up')}
    ${statCard('Quiz Average', quizAvg, 'Across attempted quizzes','up')}
    ${statCard('Economist XP', `${s.xp}`, `Level ${s.level}`,'up')}
  `;

  const started = SIM_ORDER.filter(id=>(s.progress[id]||0)>0 && (s.progress[id]||0)<100);
  const continueIds = (started.length?started:SIM_ORDER).slice(0,3);
  document.getElementById('continueGrid').innerHTML = continueIds.map((id)=>simCardHTML(id, SIM_ORDER.indexOf(id))).join('');
  wireSimCards(document.getElementById('continueGrid'));

  document.getElementById('homeSimGrid').innerHTML = SIM_ORDER.map((id,i)=>simCardHTML(id,i)).join('');
  wireSimCards(document.getElementById('homeSimGrid'));
}

function statCard(label, value, delta, dir){
  return `<div class="stat-card"><div class="label">${label}</div><div class="value">${value}</div><div class="delta ${dir}">${delta}</div></div>`;
}

function animateHero(){
  const canvas = document.getElementById('heroCanvas');
  if(canvas._inited) return; canvas._inited = true;
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = canvas.offsetWidth*devicePixelRatio; canvas.height = canvas.offsetHeight*devicePixelRatio; }
  resize(); window.addEventListener('resize', resize);
  let pts = Array.from({length:40}, (_,i)=>({x:i, y: 50+Math.sin(i*0.4)*20+Math.random()*10}));
  function frame(t){
    const w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.beginPath();
    pts.forEach((p,i)=>{
      const x = (i/(pts.length-1))*w;
      const y = h*0.75 - (Math.sin(i*0.5 + t*0.0007)*h*0.12) - (i*h*0.006);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.strokeStyle='rgba(46,204,143,0.35)'; ctx.lineWidth=2; ctx.stroke();
    ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath();
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'rgba(46,204,143,0.18)'); grad.addColorStop(1,'rgba(46,204,143,0)');
    ctx.fillStyle=grad; ctx.fill();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function buildAllSimsGrid(){
  document.getElementById('allSimGrid').innerHTML = SIM_ORDER.map((id,i)=>simCardHTML(id,i)).join('');
  wireSimCards(document.getElementById('allSimGrid'));
}

/* ------------------------------------------------------------------ */
/* SIMULATION RUNTIME ENGINE                                           */
/* ------------------------------------------------------------------ */
function renderSimulation(id){
  currentSimId = id; currentTab = 'overview';
  stopPlay();
  const sim = window.VEC_SIMS[id];
  const root = document.getElementById('simRoot');
  const idx = SIM_ORDER.indexOf(id);
  const values = {}; sim.variables.forEach(v => values[v.key] = v.default);
  sim._state = { values, mode: VECDB.get().settings.mode || 'student', stepIndex: 0 };

  root.innerHTML = `
    <div class="sim-header">
      <div>
        <button class="back-link" data-route="simulations">← Back to all simulations</button>
        <div class="sim-title-row">
          <div class="sim-icon">${sim.icon}</div>
          <div>
            <h1>SIM ${String(idx+1).padStart(2,'0')} · ${sim.title}</h1>
            <div class="obj">${sim.shortDesc}</div>
          </div>
        </div>
      </div>
      <div class="sim-toolbar">
        <div class="mode-toggle" id="modeToggle">
          <button data-mode="student" class="${sim._state.mode==='student'?'active':''}">🎓 Student</button>
          <button data-mode="teacher" class="${sim._state.mode==='teacher'?'active':''}">🧑‍🏫 Teacher</button>
        </div>
        <button class="btn btn-secondary btn-sm btn-icon" id="bookmarkBtn" title="Bookmark">${VECDB.get().bookmarks.includes(id)?'🔖':'🏷️'}</button>
        <button class="btn btn-secondary btn-sm btn-icon" id="fsSimBtn" title="Full screen">⛶</button>
        <button class="btn btn-secondary btn-sm" id="screenshotBtn">📸 Screenshot</button>
        <button class="btn btn-secondary btn-sm" id="exportBtn">🖨️ Export Report</button>
      </div>
    </div>

    <div class="tabs" id="simTabs">
      <button class="tab-btn active" data-tab="overview">Overview</button>
      <button class="tab-btn" data-tab="simulate">Simulate</button>
      <button class="tab-btn" data-tab="data">Data &amp; Graphs</button>
      <button class="tab-btn" data-tab="quiz">Mini Quiz</button>
      <button class="tab-btn" data-tab="summary">Summary</button>
    </div>

    <div class="tab-panel" id="panel-overview"></div>
    <div class="tab-panel" id="panel-simulate" hidden></div>
    <div class="tab-panel" id="panel-data" hidden></div>
    <div class="tab-panel" id="panel-quiz" hidden></div>
    <div class="tab-panel" id="panel-summary" hidden></div>
  `;

  renderOverviewTab(sim);
  renderSimulateTab(sim);
  renderDataTab(sim);
  renderQuizTab(sim);
  renderSummaryTab(sim);

  root.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> switchSimTab(btn.dataset.tab));
  });
  root.querySelector('[data-route="simulations"]').addEventListener('click', ()=>navigate('simulations'));
  root.querySelectorAll('#modeToggle button').forEach(b=>{
    b.addEventListener('click', ()=>{
      sim._state.mode = b.dataset.mode;
      VECDB.set({ settings: Object.assign({}, VECDB.get().settings, {mode:b.dataset.mode}) });
      root.querySelectorAll('#modeToggle button').forEach(x=>x.classList.toggle('active', x===b));
      renderSimulateTab(sim);
    });
  });
  document.getElementById('bookmarkBtn').addEventListener('click', (e)=>{
    const active = VECDB.toggleBookmark(id);
    e.target.textContent = active ? '🔖' : '🏷️';
    showToast(active?'Bookmarked':'Removed', sim.title, '🔖');
  });
  document.getElementById('fsSimBtn').addEventListener('click', toggleFullscreen);
  document.getElementById('screenshotBtn').addEventListener('click', ()=>screenshotSim(sim));
  document.getElementById('exportBtn').addEventListener('click', ()=>window.print());

  VECDB.setProgress(id, Math.max(VECDB.get().progress[id]||0, 10));
  updateTopbarStats();
}

function switchSimTab(tab){
  currentTab = tab;
  document.querySelectorAll('#simTabs .tab-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  ['overview','simulate','data','quiz','summary'].forEach(t=>{
    document.getElementById('panel-'+t).hidden = (t!==tab);
  });
  if(tab==='simulate'){ VECDB.setProgress(currentSimId, 40); }
  if(tab==='data'){ VECDB.setProgress(currentSimId, 60); renderDataTab(window.VEC_SIMS[currentSimId]); }
  updateTopbarStats();
}

/* ---- Overview tab ---- */
function renderOverviewTab(sim){
  const p = document.getElementById('panel-overview');
  p.innerHTML = `
    <div class="sim-layout" style="grid-template-columns:1fr 320px;">
      <div class="glass-card">
        <h3>🎯 Learning Objectives</h3>
        <ul class="summary-list mt-16">${sim.objectives.map(o=>`<li>${o}</li>`).join('')}</ul>
        <h3 class="mt-24">📖 Concept Explanation</h3>
        <div class="mt-16" style="font-size:13.5px;line-height:1.75;color:var(--text-secondary);">
          ${sim.concept.map(par=>`<p style="margin-bottom:12px;">${par}</p>`).join('')}
        </div>
        <h3 class="mt-24">🌍 Real-World Applications</h3>
        <ul class="summary-list mt-16">${sim.realWorld.map(o=>`<li>${o}</li>`).join('')}</ul>
      </div>
      <div class="flex" style="flex-direction:column;gap:16px;">
        <div class="callout warn"><span class="ic">⚠️</span><div><b>Common Misconceptions</b><ul style="margin-top:8px;padding-left:16px;">${sim.misconceptions.map(m=>`<li style="margin-bottom:6px;">${m}</li>`).join('')}</ul></div></div>
        <div class="callout fact"><span class="ic">💡</span><div><b>Did You Know?</b><ul style="margin-top:8px;padding-left:16px;">${sim.facts.map(f=>`<li style="margin-bottom:6px;">${f}</li>`).join('')}</ul></div></div>
        <button class="btn btn-primary w-full" style="justify-content:center;" onclick="switchSimTab('simulate')">Start Experimenting →</button>
      </div>
    </div>`;
  p.querySelector('button').addEventListener('click', ()=>switchSimTab('simulate'));
}

/* ---- Simulate tab ---- */
function renderSimulateTab(sim){
  const p = document.getElementById('panel-simulate');
  const st = sim._state;
  p.innerHTML = `
    <div class="sim-layout">
      <div class="controls-panel">
        <div class="glass-card">
          <div class="flex items-center" style="justify-content:space-between;margin-bottom:14px;">
            <h4 style="font-size:14px;">🎛️ Adjustable Variables</h4>
            <span class="muted small">${sim.variables.length} controls</span>
          </div>
          <div id="varControls"></div>
          <div class="control-actions">
            <button class="btn btn-secondary btn-sm w-full" id="resetSimBtn">↺ Reset</button>
          </div>
          ${sim.presets ? `
          <div class="mt-16">
            <label style="font-size:11.5px;color:var(--text-muted);font-weight:700;">SCENARIO PRESETS</label>
            <select id="presetSelect" class="mt-8">
              <option value="">— Custom —</option>
              ${sim.presets.map((pr,i)=>`<option value="${i}">${pr.name}</option>`).join('')}
            </select>
          </div>` : ''}
          <div class="mt-16 flex gap-8">
            <button class="btn btn-tertiary btn-sm" id="stepBackBtn" title="Step back">⏮ Back</button>
            <button class="btn btn-primary btn-sm" id="playBtn" style="flex:1;justify-content:center;" title="Auto-play demo">▶ Play</button>
            <button class="btn btn-tertiary btn-sm" id="stepFwdBtn" title="Step forward">Fwd ⏭</button>
          </div>
        </div>
      </div>

      <div class="flex" style="flex-direction:column;gap:16px;">
        <div class="grid grid-4" id="metricRow"></div>
        <div class="grid" id="chartGrid" style="grid-template-columns:repeat(auto-fit,minmax(340px,1fr));"></div>
        <div class="glass-card" id="interpretationCard"></div>
        ${st.mode==='teacher' ? `<div class="callout info" id="teacherNote"><span class="ic">🧑‍🏫</span><div><b>Teaching Notes</b><div id="teacherNoteBody" class="mt-8"></div></div></div>` : ''}
      </div>
    </div>`;

  const controlsWrap = document.getElementById('varControls');
  sim.variables.forEach(v=>{
    const row = document.createElement('div');
    row.className = 'control-group mt-16';
    if(v.type==='select'){
      row.innerHTML = `<label>${v.label}</label>
        <select id="ctl-${v.key}">${v.options.map(o=>`<option value="${o.value}" ${st.values[v.key]==o.value?'selected':''}>${o.label}</option>`).join('')}</select>`;
      controlsWrap.appendChild(row);
      const input = row.querySelector('select');
      input.addEventListener('change', ()=>{
        st.values[v.key] = isNaN(+input.value) ? input.value : +input.value;
        document.getElementById('presetSelect') && (document.getElementById('presetSelect').value='');
        updateSimulateOutputs(sim);
        renderSimulateVisibility(sim);
      });
    } else {
      row.innerHTML = `<label>${v.label} <span class="v" id="vlbl-${v.key}"></span></label>
        <input type="range" id="ctl-${v.key}" min="${v.min}" max="${v.max}" step="${v.step}" value="${st.values[v.key]}">`;
      controlsWrap.appendChild(row);
      const input = row.querySelector('input');
      const lbl = row.querySelector(`#vlbl-${v.key}`);
      const fmt = () => lbl.textContent = v.format ? v.format(+input.value) : input.value;
      fmt();
      input.addEventListener('input', ()=>{
        st.values[v.key] = +input.value;
        fmt();
        document.getElementById('presetSelect') && (document.getElementById('presetSelect').value='');
        updateSimulateOutputs(sim);
      });
    }
    row.dataset.key = v.key;
    if(v.showIf && !v.showIf(st.values)) row.style.display = 'none';
  });

  document.getElementById('resetSimBtn').addEventListener('click', ()=>{
    sim.variables.forEach(v=> st.values[v.key]=v.default);
    renderSimulateTab(sim);
  });

  const presetSel = document.getElementById('presetSelect');
  if(presetSel){
    presetSel.addEventListener('change', ()=>{
      if(presetSel.value===''){ return; }
      const pr = sim.presets[+presetSel.value];
      Object.assign(st.values, pr.values);
      renderSimulateTab(sim);
    });
  }

  document.getElementById('stepFwdBtn').addEventListener('click', ()=>stepScenario(sim, 1));
  document.getElementById('stepBackBtn').addEventListener('click', ()=>stepScenario(sim, -1));
  document.getElementById('playBtn').addEventListener('click', ()=>togglePlay(sim));

  renderSimulateVisibility(sim);
  updateSimulateOutputs(sim);
}

function renderSimulateVisibility(sim){
  const st = sim._state;
  sim.variables.forEach(v=>{
    if(!v.showIf) return;
    const row = document.querySelector(`#varControls [data-key="${v.key}"]`);
    if(row) row.style.display = v.showIf(st.values) ? '' : 'none';
  });
}

function stepScenario(sim, dir){
  if(!sim.presets || !sim.presets.length) return;
  const st = sim._state;
  st.stepIndex = Math.min(sim.presets.length-1, Math.max(0, st.stepIndex+dir));
  Object.assign(st.values, sim.presets[st.stepIndex].values);
  renderSimulateTab(sim);
  const sel = document.getElementById('presetSelect'); if(sel) sel.value = st.stepIndex;
}

function togglePlay(sim){
  const btn = document.getElementById('playBtn');
  if(playTimer){ stopPlay(); btn.textContent='▶ Play'; return; }
  btn.textContent = '⏸ Pause';
  const driver = sim.variables[0];
  const start = sim._state.values[driver.key];
  const range = driver.max - driver.min;
  let t = 0;
  playTimer = setInterval(()=>{
    t += 0.02;
    if(t>1){ stopPlay(); const b=document.getElementById('playBtn'); if(b) b.textContent='▶ Play'; return; }
    const val = driver.min + range * (0.5 - 0.5*Math.cos(t*Math.PI)); // ease
    sim._state.values[driver.key] = Math.round(val/driver.step)*driver.step;
    const input = document.getElementById('ctl-'+driver.key);
    if(input){ input.value = sim._state.values[driver.key]; document.getElementById('vlbl-'+driver.key).textContent = driver.format? driver.format(sim._state.values[driver.key]) : sim._state.values[driver.key]; }
    updateSimulateOutputs(sim);
  }, 45);
}
function stopPlay(){ if(playTimer){ clearInterval(playTimer); playTimer=null; } }

function updateSimulateOutputs(sim){
  const out = sim.compute(sim._state.values);
  sim._lastOutput = out;

  document.getElementById('metricRow').innerHTML = out.metrics.map(m=>`
    <div class="stat-card">
      <div class="label">${m.label}</div>
      <div class="value">${m.value}</div>
      ${m.delta?`<div class="delta ${m.deltaDir||'up'}">${m.delta}</div>`:''}
    </div>`).join('');

  const chartGrid = document.getElementById('chartGrid');
  chartGrid.innerHTML = out.charts.map((c,i)=>`
    <div class="glass-card chart-card">
      <h4>${c.title}</h4>
      <div class="chart-sub">${c.sub||''}</div>
      <div class="canvas-wrap" style="height:240px;"><canvas id="chart-${i}"></canvas></div>
      ${c.legend?`<div class="legend-row">${c.legend.map(l=>`<span><i class="dot" style="background:${l.color}"></i>${l.label}</span>`).join('')}</div>`:''}
    </div>`).join('');

  out.charts.forEach((c,i)=>{
    const canvas = document.getElementById('chart-'+i);
    if(c.type==='curve') VCharts.curveChart(canvas, c.spec);
    else if(c.type==='line') VCharts.lineChart(canvas, c.spec);
    else if(c.type==='bar') VCharts.barChart(canvas, c.spec);
    else if(c.type==='donut') VCharts.donutChart(canvas, c.spec);
  });

  document.getElementById('interpretationCard').innerHTML = `
    <h4 style="font-size:13.5px;margin-bottom:8px;">📊 Economic Interpretation</h4>
    <p style="font-size:13.5px;line-height:1.7;color:var(--text-secondary);">${out.interpretation}</p>`;

  const tn = document.getElementById('teacherNoteBody');
  if(tn) tn.innerHTML = `<p style="font-size:12.8px;line-height:1.65;">${sim.teacherNote || 'Encourage learners to change one variable at a time and predict the outcome before revealing the chart.'}</p>`;
}

function screenshotSim(sim){
  const canvas = document.querySelector('#chartGrid canvas');
  if(!canvas){ showToast('Nothing to capture','Open the Simulate tab first','📸'); return; }
  const link = document.createElement('a');
  link.download = `${sim.id}-chart.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('Screenshot saved', sim.title, '📸');
}

/* ---- Data & Graphs tab ---- */
function renderDataTab(sim){
  const p = document.getElementById('panel-data');
  const out = sim._lastOutput || sim.compute(sim._state.values);
  p.innerHTML = `
    <div class="glass-card">
      <div class="flex items-center" style="justify-content:space-between;margin-bottom:14px;">
        <h4 style="font-size:14px;">📋 Live Data Table</h4>
        <button class="btn btn-secondary btn-sm" id="saveRunBtn">💾 Save this run for comparison</button>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr>${out.table.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${out.table.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
    <div class="glass-card mt-24" id="compareCard">
      <h4 style="font-size:14px;margin-bottom:14px;">🔁 Compare Runs</h4>
      <div id="compareBody" class="muted small">Save a run above to compare different scenarios side-by-side.</div>
    </div>`;

  document.getElementById('saveRunBtn').addEventListener('click', ()=>{
    compareRuns[sim.id] = compareRuns[sim.id] || [];
    compareRuns[sim.id].push({ label: `Run ${compareRuns[sim.id].length+1}`, metrics: out.metrics });
    if(compareRuns[sim.id].length>4) compareRuns[sim.id].shift();
    renderCompare(sim);
    showToast('Run saved', 'Added to comparison table', '💾');
  });
  renderCompare(sim);
}
function renderCompare(sim){
  const runs = compareRuns[sim.id];
  const box = document.getElementById('compareBody');
  if(!runs || !runs.length){ box.innerHTML = 'Save a run above to compare different scenarios side-by-side.'; return; }
  const labels = runs[0].metrics.map(m=>m.label);
  box.innerHTML = `<div class="table-scroll"><table class="data-table"><thead><tr><th>Metric</th>${runs.map(r=>`<th>${r.label}</th>`).join('')}</tr></thead>
    <tbody>${labels.map((lab,i)=>`<tr><td>${lab}</td>${runs.map(r=>`<td>${r.metrics[i].value}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

/* ---- Quiz tab ---- */
function renderQuizTab(sim){
  const p = document.getElementById('panel-quiz');
  const teacherMode = sim._state.mode==='teacher';
  let score = 0; let answered = 0;
  p.innerHTML = `<div class="glass-card"><h4 style="font-size:14px;margin-bottom:4px;">📝 Mini Quiz — ${sim.quiz.length} Questions</h4>
    <p class="muted small mt-8" style="margin-bottom:18px;">Answer honestly — hints appear if you pick a wrong option.</p>
    <div id="quizBody"></div>
    <div id="quizResult"></div>
  </div>`;
  const body = document.getElementById('quizBody');
  sim.quiz.forEach((q, qi)=>{
    const block = document.createElement('div');
    block.className = 'quiz-q';
    block.innerHTML = `<div class="qtext">${qi+1}. ${q.q}</div>
      ${q.options.map((opt,oi)=>`<button class="quiz-opt" data-oi="${oi}">${opt}</button>`).join('')}
      <div class="quiz-explain ${teacherMode?'show':''}" id="explain-${qi}">💡 ${q.explain}</div>`;
    body.appendChild(block);
    block.querySelectorAll('.quiz-opt').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if(block.dataset.done) return;
        block.dataset.done = '1'; answered++;
        const oi = +btn.dataset.oi;
        block.querySelectorAll('.quiz-opt').forEach((b2,i2)=>{
          if(i2===q.correct) b2.classList.add('correct');
          else if(i2===oi) b2.classList.add('wrong');
        });
        if(oi===q.correct) score++;
        document.getElementById('explain-'+qi).classList.add('show');
        if(answered===sim.quiz.length) finishQuiz(sim, score);
      });
    });
  });
}
function finishQuiz(sim, score){
  VECDB.recordQuiz(sim.id, score, sim.quiz.length);
  const xpGain = score*10;
  const res = VECDB.addXP(xpGain);
  document.getElementById('quizResult').innerHTML = `
    <div class="quiz-score mt-16">
      <div class="big">${score}/${sim.quiz.length}</div>
      <p class="muted mt-8">+${xpGain} XP earned${res.leveledUp?` · 🎉 Level up to ${res.level}!`:''}</p>
      <button class="btn btn-primary mt-16" onclick="switchSimTab('summary')">Continue to Summary →</button>
    </div>`;
  document.querySelector('#quizResult button').addEventListener('click', ()=>switchSimTab('summary'));
  VECDB.setProgress(sim.id, 90);
  if(score===sim.quiz.length){
    if(VECDB.unlockAchievement('perfect-'+sim.id)) showToast('Perfect Score!', `Full marks on ${sim.title}`, '🌟');
  }
  updateTopbarStats();
}

/* ---- Summary tab ---- */
function renderSummaryTab(sim){
  const p = document.getElementById('panel-summary');
  const done = (VECDB.get().progress[sim.id]||0) >= 100;
  p.innerHTML = `
    <div class="sim-layout" style="grid-template-columns:1fr 320px;">
      <div class="glass-card">
        <h3>✅ Key Takeaways</h3>
        <ul class="summary-list mt-16">${sim.summary.map(s=>`<li>${s}</li>`).join('')}</ul>
      </div>
      <div class="flex" style="flex-direction:column;gap:16px;">
        <div class="glass-card center-text">
          <div class="label muted small">Simulation Progress</div>
          <div class="progress-bar mt-8"><i style="width:${VECDB.get().progress[sim.id]||0}%"></i></div>
          <button class="btn ${done?'btn-secondary':'btn-primary'} w-full mt-16" id="completeBtn" ${done?'disabled':''}>${done?'✓ Completed':'Mark Simulation Complete'}</button>
        </div>
        <div class="glass-card">
          <h4 style="font-size:13px;margin-bottom:8px;">🗒️ My Notes</h4>
          <textarea id="noteArea" rows="5" style="width:100%;background:var(--surface-strong);border:1px solid var(--surface-border);border-radius:10px;color:var(--text-primary);padding:10px;font-size:12.5px;font-family:inherit;" placeholder="Jot down what you observed…">${VECDB.get().notes[sim.id]||''}</textarea>
          <button class="btn btn-secondary btn-sm mt-8" id="saveNoteBtn">Save Note</button>
        </div>
      </div>
    </div>`;
  if(!done){
    document.getElementById('completeBtn').addEventListener('click', ()=>{
      VECDB.setProgress(sim.id, 100);
      const res = VECDB.addXP(50);
      const first = VECDB.unlockAchievement('complete-'+sim.id);
      const allDone = SIM_ORDER.every(id => (VECDB.get().progress[id]||0)>=100);
      if(allDone) VECDB.unlockAchievement('all-labs');
      showToast('Simulation Complete!', `+50 XP${res.leveledUp?' · Level up!':''}`, '🏆');
      renderSummaryTab(sim);
      updateTopbarStats();
    });
  }
  document.getElementById('saveNoteBtn').addEventListener('click', ()=>{
    VECDB.saveNote(sim.id, document.getElementById('noteArea').value);
    showToast('Note saved','Your observations are stored locally','🗒️');
  });
}

/* ------------------------------------------------------------------ */
/* DASHBOARD                                                            */
/* ------------------------------------------------------------------ */
function refreshDashboard(){
  const s = VECDB.get();
  const completed = SIM_ORDER.filter(id=>(s.progress[id]||0)>=100).length;
  const avgProg = Math.round(SIM_ORDER.reduce((a,id)=>a+(s.progress[id]||0),0)/SIM_ORDER.length);
  const quizAvg = (() => {
    const scores = Object.values(s.quizScores);
    if(!scores.length) return '—';
    const pct = scores.reduce((a,q)=>a+(q.score/q.total),0)/scores.length*100;
    return Math.round(pct)+'%';
  })();
  document.getElementById('dashStats2').innerHTML = `
    ${statCard('Labs Completed', `${completed}/10`, 'Great progress','up')}
    ${statCard('Overall Progress', `${avgProg}%`, 'Keep going','up')}
    ${statCard('Quiz Average', quizAvg, 'Across attempts','up')}
    ${statCard('Streak', `${s.streak} days`, 'Come back daily','up')}
  `;
  document.getElementById('progressList').innerHTML = SIM_ORDER.map((id,i)=>{
    const sim = window.VEC_SIMS[id];
    const pct = s.progress[id]||0;
    const qs = s.quizScores[id];
    return `<div class="flex items-center gap-12 mt-16" style="margin-bottom:14px;">
      <div class="sim-icon" style="width:38px;height:38px;font-size:18px;flex:0 0 auto;">${sim.icon}</div>
      <div style="flex:1;">
        <div class="flex items-center" style="justify-content:space-between;"><b style="font-size:13px;">${sim.title}</b><span class="small muted">${pct}%${qs?` · Quiz ${qs.score}/${qs.total}`:''}</span></div>
        <div class="progress-bar mt-8"><i style="width:${pct}%"></i></div>
      </div>
    </div>`;
  }).join('');
}

/* ------------------------------------------------------------------ */
/* QUIZ CENTRE                                                          */
/* ------------------------------------------------------------------ */
function buildQuizCentre(){
  document.getElementById('quizCentreGrid').innerHTML = SIM_ORDER.map((id,i)=>{
    const sim = window.VEC_SIMS[id];
    const qs = VECDB.get().quizScores[id];
    return `<article class="sim-card" data-quiz="${id}">
      <div class="sim-icon">${sim.icon}</div>
      <h3>${sim.title}</h3>
      <p>${sim.quiz.length} questions · graph reading, numerical reasoning &amp; case studies</p>
      <div class="sim-meta"><span>${qs?`Best: ${qs.score}/${qs.total}`:'Not attempted'}</span><span class="tag ${sim.tagClass}">${sim.tag}</span></div>
    </article>`;
  }).join('');
  document.querySelectorAll('[data-quiz]').forEach(el=>{
    el.addEventListener('click', ()=>{ navigate('sim', el.dataset.quiz); setTimeout(()=>switchSimTab('quiz'), 60); });
  });
}

/* ------------------------------------------------------------------ */
/* BOOKMARKS                                                            */
/* ------------------------------------------------------------------ */
function buildBookmarks(){
  const bm = VECDB.get().bookmarks;
  const grid = document.getElementById('bookmarksGrid');
  if(!bm.length){ grid.innerHTML = `<div class="glass-card center-text" style="grid-column:1/-1;padding:40px;"><p class="muted">No bookmarks yet. Tap the 🏷️ icon inside any simulation to save it here.</p></div>`; return; }
  grid.innerHTML = bm.map(id=>simCardHTML(id, SIM_ORDER.indexOf(id))).join('');
  wireSimCards(grid);
}

/* ------------------------------------------------------------------ */
/* ACHIEVEMENTS                                                         */
/* ------------------------------------------------------------------ */
function buildAchievements(){
  const s = VECDB.get();
  const grid = document.getElementById('achievementsGrid');
  const defs = SIM_ORDER.map(id=>({id:'complete-'+id, title: window.VEC_SIMS[id].title, icon:'🎓', desc:'Complete this simulation'}))
    .concat([{id:'all-labs', title:'Market Master', icon:'👑', desc:'Complete all 10 simulations'}])
    .concat(SIM_ORDER.map(id=>({id:'perfect-'+id, title:'Perfect: '+window.VEC_SIMS[id].title, icon:'🌟', desc:'Score full marks on this quiz'})));
  grid.innerHTML = defs.map(d=>{
    const unlocked = s.achievements.includes(d.id);
    return `<div class="stat-card ${unlocked?'':'muted'}" style="text-align:center;opacity:${unlocked?1:0.45};">
      <div style="font-size:30px;margin-bottom:8px;">${d.icon}</div>
      <div style="font-weight:700;font-size:12.5px;">${d.title}</div>
      <div class="small muted mt-8">${d.desc}</div>
    </div>`;
  }).join('');
  const completed = SIM_ORDER.filter(id=>(s.progress[id]||0)>=100).length;
  const ranks = ['Novice Trader','Market Apprentice','Budget Analyst','Trade Strategist','Economist','Market Master'];
  const rankIdx = Math.min(ranks.length-1, completed);
  document.getElementById('rankValue').textContent = ranks[rankIdx];
  document.getElementById('rankProgress').style.width = (completed/10*100)+'%';
}

/* ------------------------------------------------------------------ */
/* SETTINGS                                                             */
/* ------------------------------------------------------------------ */
function buildSettings(){
  const s = VECDB.get();
  document.getElementById('settingsBody').innerHTML = `
    <div class="control-group"><label>Theme <span class="v">${s.theme}</span></label>
      <div class="flex gap-8"><button class="btn btn-secondary btn-sm" id="setDark">🌙 Dark</button><button class="btn btn-secondary btn-sm" id="setLight">☀️ Light</button></div>
    </div>
    <div class="control-group mt-24"><label>Default Mode <span class="v">${s.settings.mode}</span></label>
      <div class="flex gap-8"><button class="btn btn-secondary btn-sm" id="setStudent">🎓 Student</button><button class="btn btn-secondary btn-sm" id="setTeacher">🧑‍🏫 Teacher</button></div>
    </div>
    <div class="control-group mt-24">
      <label>Data &amp; Progress</label>
      <div class="flex gap-8 mt-8">
        <button class="btn btn-secondary btn-sm" id="exportDataBtn">⬇ Export My Data</button>
        <button class="btn btn-tertiary btn-sm" id="resetDataBtn" style="color:var(--danger);border-color:var(--danger);">🗑 Reset All Progress</button>
      </div>
    </div>
    <div class="control-group mt-24">
      <label>About</label>
      <p class="muted small">Virtual Economics Laboratory v1.0 — 100% offline PWA. All data is stored only on this device.</p>
    </div>`;
  document.getElementById('setDark').addEventListener('click', ()=>{ VECDB.set({theme:'dark'}); applyTheme('dark'); buildSettings(); });
  document.getElementById('setLight').addEventListener('click', ()=>{ VECDB.set({theme:'light'}); applyTheme('light'); buildSettings(); });
  document.getElementById('setStudent').addEventListener('click', ()=>{ VECDB.set({settings:Object.assign({},s.settings,{mode:'student'})}); buildSettings(); });
  document.getElementById('setTeacher').addEventListener('click', ()=>{ VECDB.set({settings:Object.assign({},s.settings,{mode:'teacher'})}); buildSettings(); });
  document.getElementById('exportDataBtn').addEventListener('click', ()=>{
    const blob = new Blob([VECDB.exportJSON()], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='veclab-progress.json'; a.click();
  });
  document.getElementById('resetDataBtn').addEventListener('click', ()=>{
    if(confirm('This will erase all progress, XP and quiz scores on this device. Continue?')){
      VECDB.resetAll(); location.reload();
    }
  });
}

/* ------------------------------------------------------------------ */
/* HANDBOOK                                                             */
/* ------------------------------------------------------------------ */
function buildHandbook(){
  const nav = document.getElementById('handbookNav');
  nav.innerHTML = `<h4 style="font-size:13px;margin-bottom:10px;">Chapters</h4>` +
    window.VEC_HANDBOOK.map((ch,i)=>`<button class="nav-item ${i===0?'active':''}" data-ch="${i}" style="width:100%;"><span class="ic">${ch.icon}</span>${ch.title}</button>`).join('');
  nav.querySelectorAll('[data-ch]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      nav.querySelectorAll('[data-ch]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderHandbookChapter(+btn.dataset.ch);
    });
  });
  renderHandbookChapter(0);
}
function renderHandbookChapter(i){
  const ch = window.VEC_HANDBOOK[i];
  document.getElementById('handbookContent').innerHTML = `
    <div class="eyebrow">${ch.icon} ${ch.title}</div>
    <h2 style="margin-bottom:14px;">${ch.title}</h2>
    ${ch.sections.map(sec=>`
      <h4 style="margin:18px 0 8px;font-size:14.5px;">${sec.h}</h4>
      <p style="font-size:13.5px;line-height:1.75;color:var(--text-secondary);margin-bottom:8px;">${sec.body}</p>
      ${sec.example?`<div class="callout info mt-8"><span class="ic">✏️</span><div><b>Worked Example</b><p style="margin-top:6px;">${sec.example}</p></div></div>`:''}
    `).join('')}
  `;
}

/* ------------------------------------------------------------------ */
/* GLOSSARY                                                             */
/* ------------------------------------------------------------------ */
function buildGlossary(){
  const letters = [...new Set(window.VEC_GLOSSARY.map(g=>g.term[0].toUpperCase()))].sort();
  const az = document.getElementById('azNav');
  az.innerHTML = `<button class="active" data-letter="all">All</button>` + letters.map(l=>`<button data-letter="${l}">${l}</button>`).join('');
  az.querySelectorAll('button').forEach(b=>b.addEventListener('click', ()=>{
    az.querySelectorAll('button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    renderGlossaryList(b.dataset.letter, document.getElementById('glossarySearch').value);
  }));
  document.getElementById('glossarySearch').addEventListener('input', (e)=>{
    renderGlossaryList(az.querySelector('.active').dataset.letter, e.target.value);
  });
  renderGlossaryList('all','');
}
function renderGlossaryList(letter, query){
  query = (query||'').trim().toLowerCase();
  let items = window.VEC_GLOSSARY.slice().sort((a,b)=>a.term.localeCompare(b.term));
  if(letter!=='all') items = items.filter(g=>g.term[0].toUpperCase()===letter);
  if(query) items = items.filter(g=> g.term.toLowerCase().includes(query) || g.def.toLowerCase().includes(query));
  document.getElementById('glossaryList').innerHTML = items.map(g=>`
    <div class="gloss-item">
      <h4>${g.term} <span class="pron">${g.pron||''}</span></h4>
      <p>${g.def}</p>
      ${g.example?`<p class="muted small mt-8">🧩 Example: ${g.example}</p>`:''}
    </div>`).join('') || `<p class="muted center-text" style="padding:30px;">No terms found.</p>`;
}
