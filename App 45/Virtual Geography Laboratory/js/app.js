/* ============================================================
   VIRTUAL GEOGRAPHY LABORATORY — CORE APP ENGINE
   Vanilla JS • Offline-first • No frameworks
   ============================================================ */

/* ---------------- SIMULATION REGISTRY ---------------- */
const SIMULATIONS = [
  { id:'earth-interior', num:1, title:"Earth's Internal Structure Explorer", short:"Cross-section the crust, mantle & core", icon:"🌍", color:"linear-gradient(135deg,#0D47A1,#26C6DA)", category:"Physical Geography", est:"15 min" },
  { id:'plate-tectonics', num:2, title:"Plate Tectonics Laboratory", short:"Drive plates & trigger mountains, quakes, rifts", icon:"🧭", color:"linear-gradient(135deg,#8D6748,#D97B3F)", category:"Geology", est:"20 min" },
  { id:'volcano', num:3, title:"Volcano Simulator", short:"Build & erupt shield, composite & cinder volcanoes", icon:"🌋", color:"linear-gradient(135deg,#B71C1C,#FF8F00)", category:"Geology", est:"18 min" },
  { id:'earthquake', num:4, title:"Earthquake Laboratory", short:"Generate faults & study seismic waves", icon:"📈", color:"linear-gradient(135deg,#4A4A4E,#78909C)", category:"Geology", est:"15 min" },
  { id:'weather-climate', num:5, title:"Weather & Climate Studio", short:"Control the atmosphere & watch storms form", icon:"⛈️", color:"linear-gradient(135deg,#1976D2,#64B5F6)", category:"Meteorology", est:"20 min" },
  { id:'ocean-currents', num:6, title:"Ocean Currents Explorer", short:"Simulate surface & thermohaline circulation", icon:"🌊", color:"linear-gradient(135deg,#073B6B,#26C6DA)", category:"Oceanography", est:"16 min" },
  { id:'river-landforms', num:7, title:"River Formation & Landforms Lab", short:"Sculpt valleys, meanders, deltas & floodplains", icon:"🏞️", color:"linear-gradient(135deg,#2E7D32,#8D6748)", category:"Physical Geography", est:"18 min" },
  { id:'lat-long', num:8, title:"Latitude & Longitude Explorer", short:"Locate coordinates, time zones & hemispheres", icon:"🧮", color:"linear-gradient(135deg,#0D47A1,#43A047)", category:"Cartography", est:"14 min" },
  { id:'population', num:9, title:"Population Distribution Simulator", short:"Grow settlements & study demographic change", icon:"👥", color:"linear-gradient(135deg,#6A1B9A,#FFB300)", category:"Human Geography", est:"17 min" },
  { id:'resources', num:10, title:"Natural Resources & Land Use Manager", short:"Balance forests, farms, mining & sustainability", icon:"🌱", color:"linear-gradient(135deg,#2E7D32,#FFB300)", category:"Human Geography", est:"20 min" },
];

/* ---------------- STORE (localStorage wrapper) ---------------- */
const Store = {
  KEY:'vgl_state_v1',
  state:null,
  load(){
    try{
      const raw = localStorage.getItem(this.KEY);
      this.state = raw ? JSON.parse(raw) : this.defaults();
      // merge new defaults if version changes
      this.state = Object.assign(this.defaults(), this.state);
    }catch(e){ this.state = this.defaults(); }
    return this.state;
  },
  defaults(){
    return {
      theme:'light',
      xp:0,
      level:1,
      streak:0,
      lastVisit:null,
      favorites:[],
      progress:{},       // {simId: {percent, lastStep, completed:bool}}
      quizScores:{},     // {simId: {best, attempts}}
      achievements:[],
      notes:{},          // {simId: [{text, ts}]}
      bookmarks:[],
      settings:{ mode:'student', sound:true },
    };
  },
  save(){ localStorage.setItem(this.KEY, JSON.stringify(this.state)); },
  addXP(n){
    this.state.xp += n;
    const newLevel = Math.floor(this.state.xp/150) + 1;
    if(newLevel > this.state.level){
      this.state.level = newLevel;
      toast(`🎉 Level up! You're now an Explorer Level ${newLevel}`);
    }
    this.save();
  },
  setProgress(simId, percent){
    const p = this.state.progress[simId] || {percent:0, completed:false};
    p.percent = Math.max(p.percent, percent);
    if(p.percent >= 100 && !p.completed){
      p.completed = true;
      this.addAchievement(`Completed: ${SIMULATIONS.find(s=>s.id===simId)?.title || simId}`);
      this.addXP(50);
    }
    this.state.progress[simId] = p;
    this.save();
  },
  addAchievement(text){
    if(!this.state.achievements.find(a=>a.text===text)){
      this.state.achievements.push({text, ts:Date.now()});
      this.save();
      toast('🏅 Achievement unlocked: '+text);
    }
  },
  toggleFavorite(simId){
    const i = this.state.favorites.indexOf(simId);
    if(i>-1) this.state.favorites.splice(i,1); else this.state.favorites.push(simId);
    this.save();
  },
  recordQuiz(simId, score, total){
    const q = this.state.quizScores[simId] || {best:0, attempts:0};
    q.attempts++; q.best = Math.max(q.best, score);
    this.state.quizScores[simId] = q;
    this.addXP(score*5);
    this.save();
  },
  bumpStreak(){
    const today = new Date().toDateString();
    if(this.state.lastVisit !== today){
      const y = new Date(Date.now()-86400000).toDateString();
      this.state.streak = (this.state.lastVisit === y) ? this.state.streak+1 : 1;
      this.state.lastVisit = today;
      this.save();
    }
  }
};

/* ---------------- TOAST ---------------- */
let toastTimer;
function toast(msg){
  let el = document.getElementById('toast');
  if(!el){
    el = document.createElement('div');
    el.id='toast'; el.className='toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('show'), 3200);
}

/* ---------------- ICONS (inline SVG, no external assets) ---------------- */
const ICONS = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  flask:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6.5L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10.5V2"/><path d="M8.5 15h7"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>',
};
Object.assign(ICONS, {
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 5H3v2a4 4 0 0 0 4 4M17 5h4v2a4 4 0 0 1-4 4"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  bookmark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4V3Z"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5Z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  reset:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 21v-6h6"/></svg>',
  stepfwd:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5v14l9-7-9-7ZM17 5h2v14h-2z"/></svg>',
  stepback:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 5v14L9 12l9-7ZM5 5h2v14H5z"/></svg>',
  shuffle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h3.5c2 0 3 1 4 2.5L15 18h3.5M2 18h3.5c2 0 3-1 4-2.5M15 6h3.5"/><path d="m18 3 3 3-3 3M18 15l3 3-3 3"/></svg>',
  fullscreen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>',
  camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4V8Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13m0 0-4-4m4 4 4-4"/><path d="M4 20h16"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
  chevRight:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
});

/* ---------------- ROUTER ---------------- */
const Router = {
  routes:{},
  on(path, handler){ this.routes[path]=handler; },
  start(){
    window.addEventListener('hashchange', ()=>this.resolve());
    this.resolve();
  },
  resolve(){
    let hash = location.hash.slice(1) || '/home';
    const parts = hash.split('/').filter(Boolean);
    document.getElementById('app-root').scrollTop = 0;
    window.scrollTo(0,0);
    if(parts[0]==='sim' && parts[1]){
      this.routes['sim'] && this.routes['sim'](parts[1]);
    } else {
      const key = '/'+ (parts[0]||'home');
      (this.routes[key] || this.routes['/home'])();
    }
    updateNavActive(hash);
  },
  go(path){ location.hash = path; }
};

function updateNavActive(hash){
  document.querySelectorAll('.side-nav a, .bottom-nav a').forEach(a=>{
    a.classList.toggle('active', a.dataset.route && hash.startsWith(a.dataset.route));
  });
}

/* ---------------- SHELL RENDER ---------------- */
function navLinks(){
  return [
    {route:'/home', icon:ICONS.home, label:'Home'},
    {route:'/simulations', icon:ICONS.flask, label:'Simulations'},
    {route:'/map', icon:ICONS.map, label:'Map Centre'},
    {route:'/handbook', icon:ICONS.book, label:'Handbook'},
    {route:'/quiz-centre', icon:ICONS.star, label:'Quiz Centre'},
    {route:'/glossary', icon:ICONS.search, label:'Glossary'},
    {route:'/achievements', icon:ICONS.trophy, label:'Achievements'},
    {route:'/settings', icon:ICONS.gear, label:'Settings'},
    {route:'/about', icon:ICONS.user, label:'Developer'},
  ];
}
function bottomNavLinks(){
  return [
    {route:'/home', icon:ICONS.home, label:'Home'},
    {route:'/simulations', icon:ICONS.flask, label:'Labs'},
    {route:'/map', icon:ICONS.map, label:'Map'},
    {route:'/achievements', icon:ICONS.trophy, label:'Awards'},
    {route:'/settings', icon:ICONS.user, label:'You'},
  ];
}

function renderShell(){
  const root = document.getElementById('app-root');
  root.innerHTML = `
  <div class="app-shell">
    <nav class="side-nav">
      <div class="brand">
        <svg class="logo-globe" viewBox="0 0 24 24" fill="none" stroke="#1976D2" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg>
        <strong>Virtual Geography<br>Laboratory</strong>
      </div>
      ${navLinks().map(l=>`<a href="#${l.route}" data-route="${l.route}">${l.icon}<span>${l.label}</span></a>`).join('')}
    </nav>
    <div class="main-content">
      <header class="app-bar">
        <div class="app-title"><span class="logo-dot"></span> Virtual Geography Laboratory</div>
        <button class="btn-icon" id="theme-toggle" title="Toggle theme">${ICONS.moon}</button>
      </header>
      <main id="page" class="container" style="padding-top:24px;padding-bottom:48px;"></main>
    </div>
  </div>
  <nav class="bottom-nav">
    ${bottomNavLinks().map(l=>`<a href="#${l.route}" data-route="${l.route}">${l.icon}<span>${l.label}</span></a>`).join('')}
  </nav>
  `;
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

function toggleTheme(){
  const s = Store.state;
  s.theme = s.theme==='dark' ? 'light':'dark';
  document.documentElement.setAttribute('data-theme', s.theme);
  Store.save();
}

/* ---------------- PAGE: HOME ---------------- */
function pageHome(){
  Store.bumpStreak();
  const s = Store.state;
  const continued = Object.entries(s.progress).filter(([id,p])=>p.percent>0 && p.percent<100);
  const page = document.getElementById('page');
  page.innerHTML = `
    <section class="hero-banner">
      <svg class="hero-bg" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
        <circle cx="650" cy="80" r="70" fill="#ffffff" opacity="0.08"/>
        <circle cx="650" cy="80" r="70" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1"><animateTransform attributeName="transform" type="rotate" from="0 650 80" to="360 650 80" dur="40s" repeatCount="indefinite"/></circle>
        <path d="M0 250 Q 200 200 400 250 T 800 250 V300 H0 Z" fill="#ffffff" opacity="0.06"/>
        <g opacity="0.5"><animateTransform attributeName="transform" type="translate" values="0 0; 20 0; 0 0" dur="8s" repeatCount="indefinite"/>
          <ellipse cx="120" cy="60" rx="40" ry="14" fill="#fff" opacity="0.15"/>
          <ellipse cx="180" cy="50" rx="30" ry="12" fill="#fff" opacity="0.12"/>
        </g>
      </svg>
      <span class="badge badge-amber" style="background:rgba(255,255,255,.15);color:#fff;margin-bottom:14px;">🔥 ${s.streak}-day learning streak</span>
      <h1>Explore Earth Through Interactive<br>Virtual Simulations</h1>
      <p>Ten premium geography laboratories — manipulate real Earth systems, run experiments, and think like a geographer. 100% offline.</p>
      <div class="hero-actions">
        <a href="#/simulations" class="btn btn-primary">${ICONS.flask} Start Exploring</a>
        <a href="#/map" class="btn btn-secondary" style="border-color:#fff;color:#fff;">${ICONS.map} Open Map Centre</a>
      </div>
    </section>

    <div class="search-box" style="max-width:480px;margin-bottom:8px;">
      ${ICONS.search}<input id="home-search" placeholder="Search simulations, topics, glossary terms...">
    </div>

    <div class="widget-row">
      <div class="widget"><div class="icon-wrap" style="background:var(--grad-card);">${ICONS.star}</div><div class="num">${s.xp}</div><div class="lab">Total XP</div></div>
      <div class="widget"><div class="icon-wrap" style="background:var(--grad-amber);">${ICONS.trophy}</div><div class="num">Lvl ${s.level}</div><div class="lab">Explorer Level</div></div>
      <div class="widget"><div class="icon-wrap" style="background:var(--grad-earth);">${ICONS.flask}</div><div class="num">${Object.values(s.progress).filter(p=>p.completed).length}/10</div><div class="lab">Labs Completed</div></div>
      <div class="widget"><div class="icon-wrap" style="background:linear-gradient(135deg,#6A1B9A,#26C6DA);">${ICONS.trophy}</div><div class="num">${s.achievements.length}</div><div class="lab">Achievements</div></div>
    </div>

    ${continued.length? `
    <div class="section-head"><h2>Continue Learning</h2></div>
    <div class="continue-strip">
      ${continued.map(([id,p])=>{ const sim = SIMULATIONS.find(x=>x.id===id); if(!sim) return ''; return `
        <div class="continue-card" onclick="Router.go('/sim/${id}')">
          <div class="thumb-sm" style="background:${sim.color}">${sim.icon}</div>
          <strong style="font-size:13px;">${sim.title}</strong>
          <div class="progress-bar" style="margin-top:10px;"><i style="width:${p.percent}%"></i></div>
          <small>${p.percent}% complete</small>
        </div>`; }).join('')}
    </div>` : ''}

    <div class="section-head"><h2>10 Premium Simulations</h2><a href="#/simulations">See all ${ICONS.chevRight}</a></div>
    <div class="sim-grid">
      ${SIMULATIONS.slice(0,6).map(simCardHTML).join('')}
    </div>

    <div class="section-head"><h2>Quick Access</h2></div>
    <div class="grid-3">
      ${quickAccessCard('/map', ICONS.map, 'Map Explorer', 'Political, physical & climate maps')}
      ${quickAccessCard('/handbook', ICONS.book, 'Geography Handbook', 'Landforms, instruments & concepts')}
      ${quickAccessCard('/glossary', ICONS.search, 'Glossary', 'Illustrated geographic terms')}
    </div>
  `;
  document.getElementById('home-search').addEventListener('input', e=>{
    const q = e.target.value.toLowerCase();
    if(q.length>1){ Router.go('/simulations'); setTimeout(()=>{ const el=document.getElementById('sim-search'); if(el){ el.value=q; el.dispatchEvent(new Event('input')); } },50); }
  });
}
function quickAccessCard(route, icon, title, desc){
  return `<div class="card" style="cursor:pointer;" onclick="Router.go('${route}')"><div class="card-body">
    <div class="icon-wrap" style="background:var(--light-blue);color:var(--primary-blue);width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;">${icon}</div>
    <h3>${title}</h3><p class="small">${desc}</p>
  </div></div>`;
}

function simCardHTML(sim){
  const s = Store.state;
  const p = s.progress[sim.id]?.percent || 0;
  const fav = s.favorites.includes(sim.id);
  return `
  <div class="sim-card" onclick="Router.go('/sim/${sim.id}')">
    <div class="thumb" style="background:${sim.color}">
      <span class="num">${String(sim.num).padStart(2,'0')}</span>
      <span style="font-size:44px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.25));">${sim.icon}</span>
      <button class="btn-icon" style="position:absolute;top:8px;right:8px;width:32px;height:32px;background:rgba(255,255,255,.85);" onclick="event.stopPropagation();Store.toggleFavorite('${sim.id}');this.innerHTML=Store.state.favorites.includes('${sim.id}')?'★':'☆';toast(Store.state.favorites.includes('${sim.id}')?'Added to favorites':'Removed from favorites')">${fav?'★':'☆'}</button>
    </div>
    <div class="body">
      <span class="tag">${sim.category}</span>
      <h3>${sim.title}</h3>
      <p class="small" style="margin:2px 0 0;">${sim.short}</p>
      <div class="progress-mini"><i style="width:${p}%"></i></div>
    </div>
  </div>`;
}

/* ---------------- PAGE: SIMULATIONS LIST ---------------- */
function pageSimulations(){
  const page = document.getElementById('page');
  page.innerHTML = `
    <h1 style="margin-bottom:6px;">All Simulations</h1>
    <p class="small" style="margin-bottom:18px;">10 premium interactive geography laboratories</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:20px;">
      <div class="search-box" style="max-width:320px;">${ICONS.search}<input id="sim-search" placeholder="Search simulations..."></div>
      <div class="chip-row" id="cat-filter">
        <button class="chip active" data-cat="all">All</button>
        ${[...new Set(SIMULATIONS.map(s=>s.category))].map(c=>`<button class="chip" data-cat="${c}">${c}</button>`).join('')}
      </div>
    </div>
    <div class="sim-grid" id="sim-grid-full">${SIMULATIONS.map(simCardHTML).join('')}</div>
  `;
  const grid = document.getElementById('sim-grid-full');
  function applyFilter(){
    const q = document.getElementById('sim-search').value.toLowerCase();
    const activeCat = document.querySelector('#cat-filter .chip.active').dataset.cat;
    const filtered = SIMULATIONS.filter(s=> (activeCat==='all'||s.category===activeCat) && (s.title.toLowerCase().includes(q)||s.short.toLowerCase().includes(q)) );
    grid.innerHTML = filtered.length? filtered.map(simCardHTML).join('') : `<p class="small">No simulations match your search.</p>`;
  }
  document.getElementById('sim-search').addEventListener('input', applyFilter);
  document.getElementById('cat-filter').addEventListener('click', e=>{
    if(e.target.classList.contains('chip')){
      document.querySelectorAll('#cat-filter .chip').forEach(c=>c.classList.remove('active'));
      e.target.classList.add('active'); applyFilter();
    }
  });
}

/* ---------------- PAGE: ACHIEVEMENTS ---------------- */
function pageAchievements(){
  const s = Store.state;
  const page = document.getElementById('page');
  const badges = [
    {t:'First Steps', d:'Open your first simulation', done:Object.keys(s.progress).length>0},
    {t:'Curious Explorer', d:'Complete 3 simulations', done:Object.values(s.progress).filter(p=>p.completed).length>=3},
    {t:'Geography Master', d:'Complete all 10 simulations', done:Object.values(s.progress).filter(p=>p.completed).length>=10},
    {t:'Quiz Whiz', d:'Score full marks in any quiz', done:Object.values(s.quizScores).some(q=>q.best>=8)},
    {t:'Dedicated Learner', d:'Maintain a 3-day streak', done:s.streak>=3},
    {t:'Collector', d:'Favorite 3 simulations', done:s.favorites.length>=3},
  ];
  page.innerHTML = `
    <h1>Achievements</h1><p class="small" style="margin-bottom:20px;">Level ${s.level} Explorer • ${s.xp} XP • ${s.streak}-day streak</p>
    <div class="progress-bar" style="max-width:400px;margin-bottom:24px;"><i style="width:${(s.xp%150)/150*100}%"></i></div>
    <div class="grid-3">
      ${badges.map(b=>`<div class="card"><div class="card-body">
        <div class="icon-wrap" style="width:44px;height:44px;border-radius:12px;background:${b.done?'var(--grad-amber)':'var(--light-gray)'};color:${b.done?'#fff':'var(--text-muted)'};display:flex;align-items:center;justify-content:center;margin-bottom:10px;">${ICONS.trophy}</div>
        <h3>${b.t}</h3><p class="small">${b.d}</p>
        <span class="badge ${b.done?'badge-green':'badge-gray'}">${b.done?'Unlocked':'Locked'}</span>
      </div></div>`).join('')}
    </div>
    <div class="section-head"><h2>Recent Discoveries</h2></div>
    <div class="card"><div class="card-body">
      ${s.achievements.slice().reverse().slice(0,10).map(a=>`<div style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;"><span>🏅 ${a.text}</span><small>${new Date(a.ts).toLocaleDateString()}</small></div>`).join('') || '<p class="small">No achievements yet — start a simulation!</p>'}
    </div></div>
  `;
}

/* ---------------- PAGE: SETTINGS ---------------- */
function pageSettings(){
  const s = Store.state;
  const page = document.getElementById('page');
  page.innerHTML = `
    <h1>Settings</h1>
    <div class="card" style="margin-top:18px;max-width:560px;"><div class="card-body">
      <div class="field" style="display:flex;justify-content:space-between;align-items:center;">
        <div><strong>Dark Theme</strong><p class="small">Easier on the eyes in low light</p></div>
        <label class="toggle"><input type="checkbox" id="set-theme" ${s.theme==='dark'?'checked':''}><span class="slider"></span></label>
      </div>
      <div class="field" style="display:flex;justify-content:space-between;align-items:center;">
        <div><strong>Sound Effects</strong><p class="small">Play sounds on interactions</p></div>
        <label class="toggle"><input type="checkbox" id="set-sound" ${s.settings.sound?'checked':''}><span class="slider"></span></label>
      </div>
      <div class="field">
        <div class="field-label"><span>Default Mode</span></div>
        <div class="tabs" id="mode-tabs">
          <button class="${s.settings.mode==='student'?'active':''}" data-m="student">Student Mode</button>
          <button class="${s.settings.mode==='teacher'?'active':''}" data-m="teacher">Teacher Mode</button>
        </div>
      </div>
      <div class="field">
        <button class="btn btn-secondary btn-block" id="export-data">${ICONS.download} Export My Progress (JSON)</button>
      </div>
      <div class="field">
        <button class="btn btn-danger btn-block" id="reset-data">Reset All Progress</button>
      </div>
    </div></div>
  `;
  document.getElementById('set-theme').addEventListener('change', toggleTheme);
  document.getElementById('set-sound').addEventListener('change', e=>{ s.settings.sound=e.target.checked; Store.save(); });
  document.getElementById('mode-tabs').addEventListener('click', e=>{
    if(e.target.dataset.m){ s.settings.mode=e.target.dataset.m; Store.save();
      document.querySelectorAll('#mode-tabs button').forEach(b=>b.classList.toggle('active', b.dataset.m===s.settings.mode));
      toast('Mode set to '+s.settings.mode);
    }
  });
  document.getElementById('export-data').addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(s,null,2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='geolab-progress.json'; a.click();
  });
  document.getElementById('reset-data').addEventListener('click', ()=>{
    if(confirm('Reset all progress, XP and achievements? This cannot be undone.')){
      localStorage.removeItem(Store.KEY); Store.load(); toast('Progress reset'); Router.go('/home');
    }
  });
}

/* ---------------- PAGE: ABOUT / DEVELOPER ---------------- */
function pageAbout(){
  const page = document.getElementById('page');
  page.innerHTML = `
    <div class="dev-page-hero">
      <img src="assets/developer-photo.jpg" alt="Dr. Mateen Yousuf">
      <div>
        <span class="badge" style="background:rgba(255,255,255,.15);color:#fff;">Creator & Developer</span>
        <h2>Dr. Mateen Yousuf</h2>
        <p class="role">Teacher, School Education Department, Kashmir</p>
      </div>
    </div>
    <div class="section-head"><h2>Vision for Virtual Geography Laboratory</h2></div>
    <p>Virtual Geography Laboratory was built to turn geography from a subject that is memorised into a subject that is <em>experienced</em>. Every simulation invites students to manipulate real Earth systems, observe the consequences, and build understanding through inquiry rather than recitation.</p>
    <div class="vision-grid">
      ${['Experiential Geography Education','Inquiry-Based Learning','Competency-Based Learning','NEP 2020 Alignment','Geospatial Thinking','Environmental Literacy','Sustainable Development Education','Real-world Problem Solving'].map(v=>`
      <div class="vision-item"><div class="ic">${ICONS.globe}</div><strong style="font-size:14px;">${v}</strong></div>`).join('')}
    </div>
    <div class="section-head"><h2>About the App</h2></div>
    <p>Virtual Geography Laboratory is a 100% offline installable Progressive Web App containing ten scientifically grounded, fully interactive simulations spanning geology, meteorology, oceanography, cartography and human geography — designed for classes VI–XII, teachers, DIET faculty, GIS clubs and science exhibitions.</p>
  `;
}

/* ---------------- INIT ---------------- */
window.Store = Store; window.Router = Router; window.toast = toast; window.ICONS = ICONS; window.SIMULATIONS = SIMULATIONS;

function initApp(){
  Store.load();
  document.documentElement.setAttribute('data-theme', Store.state.theme);
  renderShell();
  Router.on('/home', pageHome);
  Router.on('/simulations', pageSimulations);
  Router.on('/achievements', pageAchievements);
  Router.on('/settings', pageSettings);
  Router.on('/about', pageAbout);
  Router.on('/map', typeof pageMap==='function'?pageMap:()=>{document.getElementById('page').innerHTML='<h1>Map Centre</h1>';});
  Router.on('/handbook', typeof pageHandbook==='function'?pageHandbook:()=>{document.getElementById('page').innerHTML='<h1>Handbook</h1>';});
  Router.on('/glossary', typeof pageGlossary==='function'?pageGlossary:()=>{document.getElementById('page').innerHTML='<h1>Glossary</h1>';});
  Router.on('/quiz-centre', typeof pageQuizCentre==='function'?pageQuizCentre:()=>{document.getElementById('page').innerHTML='<h1>Quiz Centre</h1>';});
  Router.on('sim', typeof renderSimPage==='function'?renderSimPage:()=>{});
  Router.start();
}
