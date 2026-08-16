// ============================================================
// APP ENGINE — Virtual Biology Laboratory
// ============================================================
(function () {
  'use strict';

  const STORE_KEY = 'vsimBioState_v1';
  const RANKS = [
    { min: 0, name: 'Trainee Learner' },
    { min: 150, name: 'Junior Scientist' },
    { min: 400, name: 'Lab Researcher' },
    { min: 800, name: 'Senior Investigator' },
    { min: 1500, name: 'Master Biologist' }
  ];

  let state = loadState();
  let currentSimId = null;
  let currentTab = 'lab';
  let selectedPrediction = null;
  let lastResult = null;
  let particleHandle = null;
  let quizIndex = 0;
  let quizAnswered = false;
  let historyBackRoute = 'home';

  // ---------------- State ----------------
  function defaultState() {
    return {
      xp: 0,
      favorites: [],
      history: [],
      settings: { sound: true, reducedMotion: false },
      sims: {}
    };
  }
  function simState(id) {
    if (!state.sims[id]) {
      state.sims[id] = { trials: [], quizScore: 0, quizDone: false, quizAnswers: [], badges: [], predictions: [] };
    }
    return state.sims[id];
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed, { sims: parsed.sims || {} });
    } catch (e) { return defaultState(); }
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }
  function addXP(amount) {
    state.xp += amount;
    saveState();
    toast('+' + amount + ' XP');
  }
  function currentRank() {
    let r = RANKS[0];
    RANKS.forEach(rk => { if (state.xp >= rk.min) r = rk; });
    return r.name;
  }
  function nextRankProgress() {
    for (let i = 0; i < RANKS.length - 1; i++) {
      if (state.xp < RANKS[i + 1].min) {
        const span = RANKS[i + 1].min - RANKS[i].min;
        const done = state.xp - RANKS[i].min;
        return Math.round((done / span) * 100);
      }
    }
    return 100;
  }

  // ---------------- Utilities ----------------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._h);
    toast._h = setTimeout(() => t.classList.remove('show'), 1800);
  }
  function getSim(id) { return SIMULATIONS.find(s => s.id === id); }

  // ---------------- Routing ----------------
  function showShell() {
    $('#splash-screen').classList.remove('active');
    $('#main-shell').classList.add('active');
  }
  function setTopbar(title, showBack) {
    $('#topbar-title').textContent = title;
    $('#btn-back').style.display = showBack ? 'flex' : 'none';
  }
  function setActiveNav(route) {
    $all('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.route === route));
  }
  function navigate(route) {
    stopParticles();
    currentSimId = null;
    historyBackRoute = 'home';
    setActiveNav(route);
    if (route === 'home') { setTopbar('Virtual Simulations', false); renderHome(); }
    else if (route === 'simulations') { setTopbar('All Simulations', false); renderSimList(); }
    else if (route === 'favorites') { setTopbar('Favorites', false); renderFavorites(); }
    else if (route === 'profile') { setTopbar('Profile & Settings', false); renderProfile(); }
    $('#view-root').scrollTop = 0;
  }

  // ---------------- Home ----------------
  function renderHome() {
    const completed = Object.values(state.sims).filter(s => s.trials.length > 0).length;
    const root = $('#view-root');
    root.innerHTML = `
      <div class="hello-card">
        <h2>Welcome back \u{1F44B}</h2>
        <p>Explore ${SIMULATIONS.length} brand-new biology laboratories — enzymes, immunity, evolution and more.</p>
        <div class="stat-row">
          <div class="stat-pill"><b>${state.xp}</b>XP</div>
          <div class="stat-pill"><b>${completed}/${SIMULATIONS.length}</b>Explored</div>
          <div class="stat-pill"><b>${currentRank()}</b></div>
        </div>
      </div>

      <div class="section-title">Quick Access</div>
      <div class="grid-4">
        <div class="dash-tile" data-route="simulations"><span class="ic">🧪</span><span class="lbl">Simulations</span></div>
        <div class="dash-tile" data-route="favorites"><span class="ic">⭐</span><span class="lbl">Favorites</span></div>
        <div class="dash-tile" data-nav="history"><span class="ic">🕓</span><span class="lbl">History</span></div>
        <div class="dash-tile" data-nav="about"><span class="ic">ℹ️</span><span class="lbl">About</span></div>
      </div>

      <div class="section-title">Continue Exploring <a href="#" data-route="simulations">See all</a></div>
      <div id="home-sim-list"></div>
    `;
    root.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); navigate(el.dataset.route); }));
    $('[data-nav="history"]', root).addEventListener('click', renderHistory);
    $('[data-nav="about"]', root).addEventListener('click', renderAbout);

    const list = $('#home-sim-list');
    SIMULATIONS.slice(0, 4).forEach(sim => list.appendChild(buildSimCard(sim)));
  }

  function buildSimCard(sim) {
    const done = simState(sim.id).trials.length > 0;
    const div = document.createElement('div');
    div.className = 'sim-card';
    div.innerHTML = `
      <div class="ic-wrap" style="background:${sim.color}">${sim.icon}</div>
      <div class="meta">
        <h3>${esc(sim.name)}${done ? '<span class="badge-done">Explored</span>' : ''}</h3>
        <p>${esc(sim.domain)} · ${esc(sim.tagline)}</p>
      </div>
      <div class="chev">›</div>
    `;
    div.addEventListener('click', () => openSimulation(sim.id));
    return div;
  }

  function renderSimList() {
    const root = $('#view-root');
    root.innerHTML = `
      <div class="search-bar">
        <span>🔎</span>
        <input type="text" id="sim-search" placeholder="Search simulations, domains…" aria-label="Search simulations">
      </div>
      <div id="sim-list-body"></div>
    `;
    const body = $('#sim-list-body');
    function draw(filter) {
      body.innerHTML = '';
      const f = (filter || '').toLowerCase();
      const filtered = SIMULATIONS.filter(s => !f || s.name.toLowerCase().includes(f) || s.domain.toLowerCase().includes(f));
      if (!filtered.length) {
        body.innerHTML = `<div class="empty-state"><span class="ic">🧬</span>No simulations match "${esc(filter)}".</div>`;
        return;
      }
      filtered.forEach(sim => body.appendChild(buildSimCard(sim)));
    }
    draw('');
    $('#sim-search').addEventListener('input', (e) => draw(e.target.value));
  }

  function renderFavorites() {
    const root = $('#view-root');
    const favs = SIMULATIONS.filter(s => state.favorites.includes(s.id));
    root.innerHTML = `<div id="fav-body"></div>`;
    const body = $('#fav-body');
    if (!favs.length) {
      body.innerHTML = `<div class="empty-state"><span class="ic">⭐</span>No favorites yet.<br>Open a simulation and tap the star to save it here.</div>`;
      return;
    }
    favs.forEach(sim => body.appendChild(buildSimCard(sim)));
  }

  function renderHistory() {
    setTopbar('Recent Activity', true);
    historyBackRoute = 'home';
    const root = $('#view-root');
    if (!state.history.length) {
      root.innerHTML = `<div class="empty-state"><span class="ic">🕓</span>No activity yet. Run an experiment to see it here.</div>`;
      return;
    }
    const rows = state.history.slice().reverse().slice(0, 40).map(h => {
      const sim = getSim(h.simId);
      const d = new Date(h.ts);
      return `<li><b>${esc(sim ? sim.name : h.simId)}</b> — ${esc(h.action)}<br><span style="color:#8a94a6;font-size:11px;">${d.toLocaleString()}</span></li>`;
    }).join('');
    root.innerHTML = `<ul class="info-list">${rows}</ul>`;
  }

  function renderAbout() {
    setTopbar('About This Lab', true);
    historyBackRoute = 'home';
    const root = $('#view-root');
    root.innerHTML = `
      <div class="hello-card">
        <h2>Virtual Biology Laboratory</h2>
        <p>A completely new set of 10 offline simulations spanning enzymology, immunology, evolution, microbiology, endocrinology, excretion, muscle physiology, skeletal biology, plant hormones and biotechnology.</p>
      </div>
      <div class="section-title">Developer</div>
      <div class="sim-card" style="cursor:default;">
        <div class="ic-wrap" style="background:var(--deep-blue);padding:0;overflow:hidden;">
          <img src="assets/dr-mateen.jpg" style="width:100%;height:100%;object-fit:cover;" alt="Dr. Mateen Yousuf">
        </div>
        <div class="meta">
          <h3>Dr. Mateen Yousuf</h3>
          <p>Teacher · School Education Department, Kashmir</p>
        </div>
      </div>
      <div class="section-title">Works 100% Offline</div>
      <ul class="info-list">
        <li>Installable as an app on desktop, tablet and mobile.</li>
        <li>No internet needed after first install — all assets are cached locally.</li>
        <li>Progress is saved on this device automatically.</li>
        <li>Designed for Classes VI–XII, teachers, DIET faculty and science clubs.</li>
      </ul>
    `;
  }

  function renderProfile() {
    const root = $('#view-root');
    const completed = Object.values(state.sims).filter(s => s.trials.length > 0).length;
    const quizzesDone = Object.values(state.sims).filter(s => s.quizDone).length;
    const totalBadges = Object.values(state.sims).reduce((n, s) => n + s.badges.length, 0);
    root.innerHTML = `
      <div class="hello-card">
        <h2>${esc(currentRank())}</h2>
        <p>${state.xp} XP earned across the laboratory</p>
        <div class="xp-bar-wrap" style="margin-top:12px;"><div class="xp-bar-fill" style="width:${nextRankProgress()}%"></div></div>
      </div>
      <div class="section-title">Your Stats</div>
      <div class="grid-4">
        <div class="dash-tile"><span class="ic">🧪</span><span class="lbl">${completed} Explored</span></div>
        <div class="dash-tile"><span class="ic">📝</span><span class="lbl">${quizzesDone} Quizzes Done</span></div>
        <div class="dash-tile"><span class="ic">🏅</span><span class="lbl">${totalBadges} Badges</span></div>
        <div class="dash-tile"><span class="ic">⭐</span><span class="lbl">${state.favorites.length} Favorites</span></div>
      </div>
      <div class="section-title">Settings</div>
      <div class="control-block">
        <div class="settings-row">
          <span>🔊 Sound feedback</span>
          <label class="switch"><input type="checkbox" id="chk-sound" ${state.settings.sound ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="settings-row">
          <span>🌗 Reduce motion</span>
          <label class="switch"><input type="checkbox" id="chk-motion" ${state.settings.reducedMotion ? 'checked' : ''}><span class="slider"></span></label>
        </div>
        <div class="settings-row" style="border-bottom:none;">
          <span>🗑️ Reset all progress</span>
          <button class="btn btn-outline" id="btn-reset-all" style="padding:6px 12px;font-size:12px;">Reset</button>
        </div>
      </div>
    `;
    $('#chk-sound').addEventListener('change', (e) => { state.settings.sound = e.target.checked; saveState(); });
    $('#chk-motion').addEventListener('change', (e) => { state.settings.reducedMotion = e.target.checked; saveState(); });
    $('#btn-reset-all').addEventListener('click', () => {
      if (confirm('This will erase all XP, badges and experiment data on this device. Continue?')) {
        state = defaultState(); saveState(); toast('Progress reset'); renderProfile();
      }
    });
  }

  // ---------------- Simulation Screen ----------------
  function openSimulation(id) {
    currentSimId = id;
    currentTab = 'lab';
    selectedPrediction = null;
    lastResult = null;
    historyBackRoute = 'simulations';
    const sim = getSim(id);
    setTopbar(sim.name, true);
    state.history.push({ simId: id, action: 'Opened simulation', ts: Date.now() });
    saveState();
    renderSimScreen();
  }

  function renderSimScreen() {
    const sim = getSim(currentSimId);
    const isFav = state.favorites.includes(sim.id);
    const root = $('#view-root');
    root.innerHTML = `
      <div class="sim-header" style="margin:-16px -18px 0; border-radius:0;">
        <span class="domain-tag">${esc(sim.domain)}</span>
        <h2 style="margin-top:8px;">${sim.icon} ${esc(sim.name)}</h2>
        <p class="objective">${esc(sim.objective)}</p>
        <div class="btn-row" style="margin-top:10px;">
          <button class="btn btn-outline" id="btn-fav" style="background:rgba(255,255,255,0.15);border-color:transparent;color:#fff;">${isFav ? '★ Favorited' : '☆ Add to Favorites'}</button>
        </div>
      </div>
      <div class="tabs" id="sim-tabs">
        ${tabBtn('lab', '🧪 Lab')}
        ${tabBtn('data', '📋 Data')}
        ${tabBtn('graph', '📈 Graph')}
        ${tabBtn('challenges', '🎯 Challenges')}
        ${tabBtn('quiz', '📝 Quiz')}
        ${tabBtn('finish', '🏁 Results')}
      </div>
      <div class="pane active" id="pane-content"></div>
    `;
    $('#btn-fav').addEventListener('click', () => {
      const i = state.favorites.indexOf(sim.id);
      if (i === -1) { state.favorites.push(sim.id); toast('Added to favorites'); }
      else { state.favorites.splice(i, 1); toast('Removed from favorites'); }
      saveState(); renderSimScreen();
    });
    $all('.tab-btn', root).forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
    renderTabContent();
  }
  function tabBtn(key, label) {
    return `<button class="tab-btn ${currentTab === key ? 'active' : ''}" data-tab="${key}">${label}</button>`;
  }
  function switchTab(tab) {
    currentTab = tab;
    stopParticles();
    $all('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    renderTabContent();
  }
  function renderTabContent() {
    const sim = getSim(currentSimId);
    const pane = $('#pane-content');
    if (currentTab === 'lab') renderLabTab(sim, pane);
    else if (currentTab === 'data') renderDataTab(sim, pane);
    else if (currentTab === 'graph') renderGraphTab(sim, pane);
    else if (currentTab === 'challenges') renderChallengesTab(sim, pane);
    else if (currentTab === 'quiz') renderQuizTab(sim, pane);
    else if (currentTab === 'finish') renderFinishTab(sim, pane);
  }

  // ---------------- LAB TAB ----------------
  let currentVars = {};
  function renderLabTab(sim, pane) {
    if (!currentVars.__sim || currentVars.__sim !== sim.id) {
      currentVars = { __sim: sim.id };
      sim.variables.forEach(v => currentVars[v.key] = v.default);
    }
    pane.innerHTML = `
      <div class="predict-card">
        <h4>🔮 Prediction: ${esc(sim.predictPrompt)}</h4>
        <div class="choice-row" id="predict-choices">
          <button class="choice-btn" data-p="increase">Increase</button>
          <button class="choice-btn" data-p="decrease">Decrease</button>
          <button class="choice-btn" data-p="nochange">No real change</button>
        </div>
      </div>

      <div class="lab-workspace">
        <canvas id="lab-canvas"></canvas>
        <div class="lab-readout" id="lab-readout"></div>
      </div>

      <div class="control-block">
        <h4>⚙️ Experiment Variables</h4>
        ${sim.variables.map(v => `
          <div class="var-row">
            <label for="v-${v.key}">${esc(v.label)} <span class="val" id="val-${v.key}">${currentVars[v.key]}${v.unit ? ' ' + esc(v.unit).split(' ')[0] : ''}</span></label>
            <input type="range" id="v-${v.key}" min="${v.min}" max="${v.max}" step="${v.step}" value="${currentVars[v.key]}">
          </div>
        `).join('')}
        <div class="btn-row">
          <button class="btn btn-primary" id="btn-run">▶ Run Experiment</button>
          <button class="btn btn-green" id="btn-record" disabled>✔ Record Observation</button>
          <button class="btn btn-outline" id="btn-reset">⟲ Reset</button>
        </div>
        <div class="result-banner" id="result-banner"></div>
      </div>
    `;

    sim.variables.forEach(v => {
      const input = $('#v-' + v.key);
      input.addEventListener('input', () => {
        currentVars[v.key] = parseFloat(input.value);
        $('#val-' + v.key).textContent = currentVars[v.key] + (v.unit ? ' ' + v.unit.split(' ')[0] : '');
      });
    });
    $all('#predict-choices .choice-btn').forEach(b => b.addEventListener('click', () => {
      selectedPrediction = b.dataset.p;
      $all('#predict-choices .choice-btn').forEach(x => x.classList.toggle('selected', x === b));
    }));
    $('#btn-run').addEventListener('click', () => runExperiment(sim));
    $('#btn-record').addEventListener('click', () => recordObservation(sim));
    $('#btn-reset').addEventListener('click', () => { currentVars.__sim = null; lastResult = null; renderLabTab(sim, pane); });

    initCanvas(sim, 8);
  }

  function runExperiment(sim) {
    const result = sim.compute(currentVars);
    lastResult = result;
    const metricVal = result[sim.metric.key];
    const secVal = sim.secondary ? result[sim.secondary.key] : null;

    const chipHtml = [
      `<div class="readout-chip">${esc(sim.metric.label)}: <b>${metricVal}${sim.metric.unit ? ' ' + sim.metric.unit : ''}</b></div>`,
      sim.secondary ? `<div class="readout-chip">${esc(sim.secondary.label)}: <b>${secVal}${sim.secondary.unit ? ' ' + sim.secondary.unit : ''}</b></div>` : ''
    ].join('');
    $('#lab-readout').innerHTML = chipHtml;

    const numericMetric = typeof metricVal === 'number' ? metricVal : 50;
    initCanvas(sim, numericMetric);

    const banner = $('#result-banner');
    banner.className = 'result-banner show';
    let predictionNote = '';
    if (selectedPrediction) {
      predictionNote = '<br><br><b>Your prediction:</b> ' + labelForPrediction(selectedPrediction);
    }
    banner.innerHTML = `<b>Observation:</b> ${esc(result.note)}${predictionNote}`;
    $('#btn-record').disabled = false;
    if (state.settings.sound) beep();
  }
  function labelForPrediction(p) {
    return p === 'increase' ? 'Increase' : p === 'decrease' ? 'Decrease' : 'No real change';
  }

  function recordObservation(sim) {
    if (!lastResult) return;
    const ss = simState(sim.id);
    const metricVal = lastResult[sim.metric.key];
    const secVal = sim.secondary ? lastResult[sim.secondary.key] : null;
    ss.trials.push({
      vars: Object.assign({}, currentVars),
      metric: metricVal,
      secondary: secVal,
      note: lastResult.note,
      prediction: selectedPrediction,
      ts: Date.now()
    });
    state.history.push({ simId: sim.id, action: 'Recorded an observation', ts: Date.now() });
    saveState();
    toast('Observation recorded');
    addXP(5);
    checkBadges(sim);
    $('#btn-record').disabled = true;
    selectedPrediction = null;
    const choiceRow = $('#predict-choices');
    if (choiceRow) $all('.choice-btn', choiceRow).forEach(x => x.classList.remove('selected'));
  }

  // ---------------- Canvas visualization ----------------
  function initCanvas(sim, metricLevel) {
    stopParticles();
    const canvas = $('#lab-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(280, rect.width || 280);
    canvas.width = cssW * dpr;
    canvas.height = 220 * dpr;
    ctx.scale(dpr, dpr);
    const w = cssW, h = 220;

    const count = clamp(Math.round((metricLevel || 5) / 4), 4, 28);
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * (0.4 + metricLevel / 60),
        vy: (Math.random() - 0.5) * (0.4 + metricLevel / 60),
        r: 4 + Math.random() * 5
      });
    }
    const reduced = state.settings.reducedMotion;

    function frame() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i < w; i += 24) ctx.fillRect(i, 0, 1, h);
      particles.forEach(p => {
        if (!reduced) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = sim.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '11px sans-serif';
      ctx.fillText(sim.name + ' — live view', 10, 16);
      particleHandle = requestAnimationFrame(frame);
    }
    frame();
  }
  function stopParticles() {
    if (particleHandle) { cancelAnimationFrame(particleHandle); particleHandle = null; }
  }
  function beep() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 660; g.gain.value = 0.05;
      o.start(); o.stop(ctx.currentTime + 0.08);
    } catch (e) { /* audio unavailable */ }
  }

  // ---------------- DATA TAB ----------------
  function renderDataTab(sim, pane) {
    const ss = simState(sim.id);
    if (!ss.trials.length) {
      pane.innerHTML = `<div class="empty-state"><span class="ic">📋</span>No data yet. Run and record an experiment in the Lab tab.</div>`;
      return;
    }
    const varKeys = sim.variables.map(v => v.key);
    const rows = ss.trials.map((t, i) => `
      <tr>
        <td>${i + 1}</td>
        ${varKeys.map(k => `<td>${t.vars[k]}</td>`).join('')}
        <td><b>${t.metric}</b></td>
        ${sim.secondary ? `<td>${t.secondary}</td>` : ''}
      </tr>
    `).join('');
    pane.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>Trial</th>
            ${sim.variables.map(v => `<th>${esc(v.label)}</th>`).join('')}
            <th>${esc(sim.metric.label)}</th>
            ${sim.secondary ? `<th>${esc(sim.secondary.label)}</th>` : ''}
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="btn-row" style="margin-top:12px;">
        <button class="btn btn-outline" id="btn-clear-data">🗑 Clear Data</button>
      </div>
    `;
    $('#btn-clear-data').addEventListener('click', () => {
      if (confirm('Clear all recorded trials for this simulation?')) {
        ss.trials = []; saveState(); renderDataTab(sim, pane);
      }
    });
  }

  // ---------------- GRAPH TAB ----------------
  function renderGraphTab(sim, pane) {
    const ss = simState(sim.id);
    if (!ss.trials.length) {
      pane.innerHTML = `<div class="empty-state"><span class="ic">📈</span>No data to graph yet. Record some observations first.</div>`;
      return;
    }
    pane.innerHTML = `
      <div class="graph-wrap"><canvas id="graph-canvas"></canvas></div>
      <p style="font-size:12px;color:#667;margin-top:8px;">${esc(sim.metric.label)} across recorded trials (trial number on the x-axis).</p>
    `;
    const canvas = $('#graph-canvas');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(260, rect.width || 260);
    canvas.width = cssW * dpr;
    canvas.height = 180 * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const w = cssW, h = 180;
    const pad = 32;
    const values = ss.trials.map(t => t.metric);
    const maxV = Math.max(...values, 10) * 1.1;
    const minV = Math.min(0, Math.min(...values));

    ctx.strokeStyle = '#c7d0dc'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, 8); ctx.lineTo(pad, h - pad); ctx.lineTo(w - 8, h - pad); ctx.stroke();
    ctx.fillStyle = '#556'; ctx.font = '10px sans-serif';
    ctx.fillText(String(Math.round(maxV)), 4, 14);
    ctx.fillText(String(Math.round(minV)), 4, h - pad + 3);

    const stepX = (w - pad - 16) / Math.max(1, values.length - 1);
    ctx.strokeStyle = sim.color; ctx.lineWidth = 2; ctx.beginPath();
    values.forEach((v, i) => {
      const x = pad + i * stepX;
      const y = (h - pad) - ((v - minV) / (maxV - minV || 1)) * (h - pad - 8);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = sim.color;
    values.forEach((v, i) => {
      const x = pad + i * stepX;
      const y = (h - pad) - ((v - minV) / (maxV - minV || 1)) * (h - pad - 8);
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
    });
  }

  // ---------------- CHALLENGES TAB ----------------
  function renderChallengesTab(sim, pane) {
    const ss = simState(sim.id);
    pane.innerHTML = sim.challenges.map((c, i) => {
      const done = c.check(ss.trials);
      return `
        <div class="challenge-card">
          <h5>Challenge ${i + 1}</h5>
          <p>${esc(c.text)}</p>
          <span class="challenge-status ${done ? 'done' : 'pending'}">${done ? '✔ Completed' : 'In progress'}</span>
        </div>
      `;
    }).join('');
    checkBadges(sim);
  }

  // ---------------- QUIZ TAB ----------------
  function renderQuizTab(sim, pane) {
    const ss = simState(sim.id);
    if (pane.dataset.simLoaded !== sim.id) {
      quizIndex = 0; quizAnswered = false;
      pane.dataset.simLoaded = sim.id;
    }
    if (ss.quizDone) {
      pane.innerHTML = `
        <div class="empty-state">
          <span class="ic">📝</span>
          Quiz completed — score ${ss.quizScore}/${sim.quiz.length}.
        </div>
        <div class="btn-row"><button class="btn btn-outline" id="btn-retake">↻ Retake Quiz</button></div>
      `;
      $('#btn-retake').addEventListener('click', () => { ss.quizDone = false; ss.quizAnswers = []; quizIndex = 0; saveState(); renderQuizTab(sim, pane); });
      return;
    }
    const q = sim.quiz[quizIndex];
    pane.innerHTML = `
      <div class="progress-row"><span>Question ${quizIndex + 1} / ${sim.quiz.length}</span>
        <div class="progress-track"><div class="progress-fill" style="width:${(quizIndex / sim.quiz.length) * 100}%"></div></div>
      </div>
      <div class="quiz-q">
        <h5>${esc(q.q)}</h5>
        <div id="quiz-opts">
          ${q.options.map((o, i) => `<button class="quiz-opt" data-i="${i}">${esc(o)}</button>`).join('')}
        </div>
        <div class="quiz-explain" id="quiz-explain">${esc(q.explain)}</div>
      </div>
      <div class="btn-row"><button class="btn btn-primary" id="btn-next-q" style="display:none;">Next →</button></div>
    `;
    quizAnswered = false;
    $all('#quiz-opts .quiz-opt').forEach(btn => btn.addEventListener('click', () => {
      if (quizAnswered) return;
      quizAnswered = true;
      const idx = parseInt(btn.dataset.i, 10);
      $all('#quiz-opts .quiz-opt').forEach((b, i) => {
        if (i === q.a) b.classList.add('correct');
        else if (i === idx) b.classList.add('wrong');
      });
      $('#quiz-explain').classList.add('show');
      $('#btn-next-q').style.display = 'inline-block';
      const correct = idx === q.a;
      ss.quizAnswers[quizIndex] = correct;
      if (correct) addXP(8); else saveState();
    }));
    $('#btn-next-q').addEventListener('click', () => {
      quizIndex++;
      if (quizIndex >= sim.quiz.length) {
        ss.quizScore = ss.quizAnswers.filter(Boolean).length;
        ss.quizDone = true;
        saveState();
        checkBadges(sim);
        toast('Quiz complete!');
      }
      renderQuizTab(sim, pane);
    });
  }

  // ---------------- BADGES ----------------
  function checkBadges(sim) {
    const ss = simState(sim.id);
    let changed = false;
    const earn = (id) => { if (!ss.badges.includes(id)) { ss.badges.push(id); toast('🏅 Badge earned!'); state.xp += 20; changed = true; } };
    if (ss.trials.length >= 1) earn('first');
    if (ss.trials.length >= 5) earn('variable');
    if (ss.trials.length >= 8 || sim.challenges.every(c => c.check(ss.trials))) earn('data');
    if (ss.quizDone && ss.quizScore / sim.quiz.length >= 0.7 && sim.challenges.every(c => c.check(ss.trials))) earn('expert');
    if (changed) saveState();
  }

  // ---------------- FINISH / RESULTS TAB ----------------
  function renderFinishTab(sim, pane) {
    const ss = simState(sim.id);
    const challengesDone = sim.challenges.filter(c => c.check(ss.trials)).length;
    pane.innerHTML = `
      <div class="finish-card">
        <div class="trophy">🏆</div>
        <h2 style="font-family:var(--font-heading);margin:6px 0;">${esc(sim.name)} — Lab Report</h2>
        <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${clamp((ss.trials.length / 8) * 100, 0, 100)}%"></div></div>
        <p style="font-size:12.5px;color:#667;">${ss.trials.length} experiments recorded</p>
      </div>
      <div class="control-block">
        <h4>📄 Conclusion</h4>
        <p style="font-size:13px;">${ss.trials.length ? esc(ss.trials[ss.trials.length - 1].note) : 'Run at least one experiment to generate a scientific conclusion.'}</p>
        <div class="progress-row"><span>Challenges</span><div class="progress-track"><div class="progress-fill" style="width:${(challengesDone / sim.challenges.length) * 100}%"></div></div><span>${challengesDone}/${sim.challenges.length}</span></div>
        <div class="progress-row"><span>Quiz</span><div class="progress-track"><div class="progress-fill" style="width:${ss.quizDone ? (ss.quizScore / sim.quiz.length) * 100 : 0}%"></div></div><span>${ss.quizDone ? ss.quizScore + '/' + sim.quiz.length : 'Not taken'}</span></div>
      </div>
      <div class="section-title">Badges</div>
      <div class="badge-grid">
        ${sim.badges.map(b => `
          <div class="badge-item ${ss.badges.includes(b.id) ? 'earned' : ''}">
            <span class="em">${b.icon}</span>${esc(b.name)}
          </div>`).join('')}
      </div>
      <div class="btn-row" style="margin-top:16px;">
        <button class="btn btn-primary" id="btn-back-home">🏠 Back to Home</button>
      </div>
    `;
    $('#btn-back-home').addEventListener('click', () => navigate('home'));
  }

  // ---------------- Wiring ----------------
  function init() {
    $('#btn-enter').addEventListener('click', () => { showShell(); navigate('home'); });
    setTimeout(() => { const p = $('#splash-progress'); if (p) p.textContent = 'Ready — tap Enter Laboratory'; }, 700);

    $all('.nav-btn').forEach(b => b.addEventListener('click', () => navigate(b.dataset.route)));
    $('#btn-back').addEventListener('click', () => {
      if (currentSimId) { currentSimId = null; navigate('simulations'); return; }
      navigate(historyBackRoute || 'home');
    });
    $('#btn-info').addEventListener('click', () => { renderAbout(); });

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => { /* offline install may fail on first run without https */ });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
