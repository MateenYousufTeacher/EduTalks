/* ==========================================================================
   VIRTUAL ASTRONOMY LABORATORY — CORE ENGINE
   Handles: storage, routing, gamification, starfield bg, generic sim runtime
   ========================================================================== */

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

/* ---------------------------------------------------------------------- */
/* STORAGE                                                                 */
/* ---------------------------------------------------------------------- */
const Store = {
  key: 'val-astro-v1',
  data: null,
  load(){
    try{ this.data = JSON.parse(localStorage.getItem(this.key)) || this.defaults(); }
    catch(e){ this.data = this.defaults(); }
    // merge missing defaults (forward compatible)
    const d = this.defaults();
    for(const k in d){ if(!(k in this.data)) this.data[k] = d[k]; }
    return this.data;
  },
  save(){ try{ localStorage.setItem(this.key, JSON.stringify(this.data)); }catch(e){} },
  defaults(){
    return {
      theme:'dark', reducedMotion:false, mode:'student',
      xp:0, level:1, streak:0, lastVisit:null,
      progress:{}, quizScores:{}, bookmarks:[], achievements:[],
      notes:{}
    };
  },
  get(k){ return this.data[k]; },
  set(k,v){ this.data[k]=v; this.save(); }
};
Store.load();

/* ---------------------------------------------------------------------- */
/* GAMIFICATION                                                            */
/* ---------------------------------------------------------------------- */
const RANKS = [
  {min:0, name:'Stargazer Cadet'}, {min:100, name:'Orbit Trainee'},
  {min:250, name:'Lunar Observer'}, {min:500, name:'Planetary Analyst'},
  {min:900, name:'Eclipse Specialist'}, {min:1400, name:'Galactic Surveyor'},
  {min:2200, name:'Astrophysics Fellow'}, {min:3200, name:'Cosmic Explorer'}
];
const ACHIEVEMENTS = [
  {id:'first-launch', name:'First Contact', desc:'Open the Astronomy Lab for the first time.', icon:'rocket'},
  {id:'first-sim', name:'Mission Start', desc:'Complete your first simulation quiz.', icon:'orbit'},
  {id:'five-sims', name:'Field Researcher', desc:'Explore 5 different simulations.', icon:'compass'},
  {id:'all-sims', name:'Galaxy Explorer', desc:'Explore all 10 simulations.', icon:'galaxy'},
  {id:'quiz-ace', name:'Quiz Ace', desc:'Score a perfect result on any quiz.', icon:'star'},
  {id:'bookworm', name:'Sky Scholar', desc:'Read 10 glossary terms.', icon:'book'},
  {id:'streak-3', name:'Steady Orbit', desc:'Visit the lab 3 days in a row.', icon:'flame'},
];
function rankFor(xp){ let r = RANKS[0]; for(const x of RANKS){ if(xp>=x.min) r=x; } return r; }
function xpToNext(xp){
  const idx = RANKS.findIndex(r=>r.min>xp);
  return idx===-1 ? null : RANKS[idx].min;
}
function awardXP(amount, reason){
  Store.data.xp += amount;
  Store.save();
  toast(`+${amount} XP — ${reason}`);
  refreshHeaderStats();
  checkAchievements();
}
function unlockAchievement(id){
  if(Store.data.achievements.includes(id)) return;
  Store.data.achievements.push(id);
  Store.save();
  const a = ACHIEVEMENTS.find(x=>x.id===id);
  if(a) toast(`🏅 Achievement unlocked: ${a.name}`);
}
function checkAchievements(){
  const p = Store.data.progress;
  const visited = Object.keys(p).length;
  if(visited>=1) unlockAchievement('first-launch');
  if(visited>=5) unlockAchievement('five-sims');
  if(visited>=10) unlockAchievement('all-sims');
  const scores = Object.values(Store.data.quizScores);
  if(scores.some(s=>s.correct===s.total && s.total>0)) unlockAchievement('quiz-ace');
  if(scores.length>=1) unlockAchievement('first-sim');
}
function markVisited(simId){
  Store.data.progress[simId] = Store.data.progress[simId] || {visits:0, lastVisit:Date.now()};
  Store.data.progress[simId].visits++;
  Store.data.progress[simId].lastVisit = Date.now();
  Store.save();
  checkAchievements();
  refreshHeaderStats();
}
function recordQuizScore(simId, correct, total){
  Store.data.quizScores[simId] = {correct, total, at:Date.now()};
  Store.save();
  awardXP(correct*10, 'quiz completed');
}
function handleStreak(){
  const today = new Date().toDateString();
  const last = Store.data.lastVisit;
  if(last !== today){
    const yesterday = new Date(Date.now()-86400000).toDateString();
    Store.data.streak = (last===yesterday) ? (Store.data.streak+1) : 1;
    Store.data.lastVisit = today;
    Store.save();
    if(Store.data.streak>=3) unlockAchievement('streak-3');
  }
}

function toast(msg){
  let t = $('#xp-toast');
  if(!t){
    t = document.createElement('div');
    t.id = 'xp-toast'; t.className='xp-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 2600);
}

/* ---------------------------------------------------------------------- */
/* AMBIENT STARFIELD (canvas, used behind splash + app shell)              */
/* ---------------------------------------------------------------------- */
function initStarfield(canvasId, opts={}){
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [], w=0, h=0, dpr=Math.min(window.devicePixelRatio||1, 2);
  const density = opts.density || 0.00022;
  const shooting = [];

  function resize(){
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.floor(w*h*density);
    stars = Array.from({length:count}, ()=>({
      x:Math.random()*w, y:Math.random()*h,
      r:Math.random()*1.4+0.2,
      tw:Math.random()*Math.PI*2,
      speed:Math.random()*0.4+0.1,
      hue: Math.random()<0.12 ? '#22d3ee' : (Math.random()<0.08 ? '#fbbf24' : '#ffffff')
    }));
  }
  window.addEventListener('resize', resize);
  resize();

  let last = performance.now();
  function frame(now){
    const dt = Math.min(now-last, 50); last = now;
    ctx.clearRect(0,0,w,h);
    for(const s of stars){
      s.tw += dt*0.002*s.speed;
      const alpha = 0.4 + Math.sin(s.tw)*0.35 + 0.35;
      ctx.globalAlpha = Math.max(0.15, Math.min(1, alpha));
      ctx.fillStyle = s.hue;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // occasional shooting star
    if(Math.random()<0.006 && shooting.length<2){
      shooting.push({x:Math.random()*w*0.6+w*0.2, y:Math.random()*h*0.3, len:Math.random()*80+60, vx:-6-Math.random()*4, vy:3+Math.random()*2, life:1});
    }
    for(let i=shooting.length-1;i>=0;i--){
      const s = shooting[i];
      const grad = ctx.createLinearGradient(s.x,s.y,s.x-s.vx*s.len/6,s.y-s.vy*s.len/6);
      grad.addColorStop(0,`rgba(255,255,255,${s.life})`);
      grad.addColorStop(1,'rgba(255,255,255,0)');
      ctx.strokeStyle = grad; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x-s.vx*s.len/6, s.y-s.vy*s.len/6); ctx.stroke();
      s.x+=s.vx; s.y+=s.vy; s.life-=0.02;
      if(s.life<=0) shooting.splice(i,1);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------------------- */
/* ICONS (inline SVG helper — small curated set, no external deps)         */
/* ---------------------------------------------------------------------- */
const ICONS = {
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  sims:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/>',
  book:'<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M18 4v16"/>',
  award:'<circle cx="12" cy="8" r="5"/><path d="M8 13l-2 8 6-3 6 3-2-8"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4V3z"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.067-.4.1-.79.1-1.2z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  play:'<path d="M6 4l14 8-14 8z"/>', pause:'<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',
  reset:'<path d="M4 12a8 8 0 1 1 2.5 5.8"/><path d="M4 21v-6h6"/>',
  step:'<path d="M5 4l10 8-10 8V4z"/><path d="M18 4v16"/>',
  fullscreen:'<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  download:'<path d="M12 3v13"/><path d="M7 11l5 5 5-5"/><path d="M4 21h16"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  back:'<path d="M15 5l-7 7 7 7"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.2 4.2l2 2M17.8 17.8l2 2M2 12h3M19 12h3M4.2 19.8l2-2M17.8 6.2l2-2"/>',
  moon:'<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
  chart:'<path d="M4 20V10M11 20V4M18 20v-7"/><path d="M2 20h20"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6"/>',
  flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>',
  galaxy:'<circle cx="12" cy="12" r="1.2"/><path d="M12 12c3-4 8-4 9 0s-3 6-8 4-4-8 0-9-6-1-8 2 1 7 5 7"/>',
  orbit:'<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="4.2" transform="rotate(-20 12 12)"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-6 2 2-6 6-2z"/>',
  flame:'<path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-1-1-2-1-3 2 1 3 3 3 5a5 5 0 0 1-10 0c0-5 4-6 5-11z"/>',
  rocket:'<path d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 2-3-2c-1-1-2-3-2-5 0-4 2-8 5-10z"/><path d="M9 15l-3 5M15 15l3 5M10 9h4"/>',
  planet:'<circle cx="10" cy="12" r="5"/><ellipse cx="10" cy="12" rx="9" ry="2.4" transform="rotate(-14 10 12)"/>',
  eclipse:'<circle cx="10" cy="12" r="6"/><circle cx="14" cy="10" r="6" fill="var(--bg-1)" stroke="none"/>',
  star:'<path d="M12 2l2.9 6.6L22 9.2l-5 4.9 1.2 7-6.2-3.6L5.8 21l1.2-7-5-4.9 7.1-.6z"/>',
  blackhole:'<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="3.4"/><ellipse cx="12" cy="12" rx="5.5" ry="6.2" transform="rotate(60 12 12)"/>',
  satellite:'<path d="M7 7l4 4-3 3-4-4z"/><path d="M13 13l4 4-3 3-4-4z"/><path d="M11 9l4-4"/><path d="M15 15l3-3"/><path d="M4 4l3 3M17 17l3 3"/>',
  tilt:'<path d="M12 3v18" transform="rotate(20 12 12)"/><circle cx="12" cy="12" r="7"/>',
  handbook:'<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M8 8h6M8 12h6"/>',
};
function icon(name, cls=''){
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</svg>`;
}

/* ---------------------------------------------------------------------- */
/* SHARED CANVAS DRAWING HELPERS (used by js/sims/*.js)                    */
/* ---------------------------------------------------------------------- */
const Draw = {
  space(ctx, w, h, stars){
    ctx.fillStyle = '#03040a'; ctx.fillRect(0,0,w,h);
    if(!stars) return;
    ctx.save();
    for(const s of stars){
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  },
  makeStars(w,h,n){
    return Array.from({length:n}, ()=>({x:Math.random()*w, y:Math.random()*h, r:Math.random()*1.2+0.2, a:Math.random()*0.6+0.2}));
  },
  glowBody(ctx, x, y, r, colorInner, colorOuter, glow){
    if(glow){
      const g = ctx.createRadialGradient(x,y,r*0.2,x,y,r*glow);
      g.addColorStop(0, colorOuter+'aa'); g.addColorStop(1, colorOuter+'00');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r*glow,0,Math.PI*2); ctx.fill();
    }
    const grad = ctx.createRadialGradient(x-r*0.3,y-r*0.3,r*0.1,x,y,r);
    grad.addColorStop(0, colorInner); grad.addColorStop(1, colorOuter);
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  },
  orbitPath(ctx, cx, cy, rx, ry, rot=0, color='rgba(148,163,184,.3)'){
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    ctx.translate(cx,cy); ctx.rotate(rot);
    ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  },
  label(ctx, text, x, y, color='#94a3b8', size=11, align='center'){
    ctx.fillStyle = color; ctx.font = `${size}px 'Manrope', sans-serif`; ctx.textAlign = align;
    ctx.fillText(text, x, y);
  }
};

/* ---------------------------------------------------------------------- */
/* SIM REGISTRY (metadata; heavy logic lives in js/sims/*.js)              */
/* ---------------------------------------------------------------------- */
const SIMS = [
  {id:'solar-system', n:1, title:'Solar System Explorer', short:'Tour the Sun\u2019s eight planets in motion.', icon:'orbit', tags:['Orbits','Scale']},
  {id:'planetary-motion', n:2, title:'Planetary Motion Laboratory', short:'Sculpt an orbit and test Kepler\u2019s laws.', icon:'planet', tags:['Kepler','Physics']},
  {id:'moon-phases', n:3, title:'Moon Phases Simulator', short:'Drag the Moon and watch phases unfold.', icon:'moon', tags:['Moon','Cycles']},
  {id:'solar-eclipse', n:4, title:'Solar Eclipse Simulator', short:'Align three worlds to blot out the Sun.', icon:'eclipse', tags:['Eclipse','Shadows']},
  {id:'lunar-eclipse', n:5, title:'Lunar Eclipse Simulator', short:'Send the Moon through Earth\u2019s shadow.', icon:'eclipse', tags:['Eclipse','Shadows']},
  {id:'seasons', n:6, title:'Seasons on Earth Laboratory', short:'Tilt the axis, change the seasons.', icon:'tilt', tags:['Seasons','Tilt']},
  {id:'constellations', n:7, title:'Stars & Constellations Explorer', short:'Rotate the night sky and learn the patterns.', icon:'star', tags:['Sky','Stars']},
  {id:'galaxy', n:8, title:'Galaxy Explorer', short:'Compare spiral, elliptical & irregular galaxies.', icon:'galaxy', tags:['Galaxies','Scale']},
  {id:'blackhole', n:9, title:'Black Hole & Gravity Explorer', short:'Probe gravity wells and escape velocity.', icon:'blackhole', tags:['Gravity','Conceptual']},
  {id:'satellite', n:10, title:'Space Missions & Satellite Simulator', short:'Launch a satellite into the right orbit.', icon:'satellite', tags:['Missions','Orbits']},
];

/* ---------------------------------------------------------------------- */
/* GENERIC SIMULATION RUNTIME                                              */
/* Each sim module (js/sims/*.js) registers via SimModules[id] = {...}     */
/* ---------------------------------------------------------------------- */
const SimModules = {};

class SimEngine{
  constructor(root, meta, mod){
    this.root = root; this.meta = meta; this.mod = mod;
    this.playing = true; this.speed = 1; this.timeWarp = 1;
    this.t = 0; this.rafId = null; this.last = null;
    this.dataLog = []; this.logAccum = 0;
    this.state = {};
    this.mode = Store.get('mode') || 'student';
    this.build();
  }

  build(){
    const m = this.meta, mod = this.mod;
    this.root.innerHTML = `
      <div class="sim-header">
        <div class="eyebrow">Simulation ${String(m.n).padStart(2,'0')} · ${mod.category||'Astronomy'}</div>
        <h1>${m.title}</h1>
        <p>${mod.tagline||m.short}</p>
      </div>

      <div class="sim-layout">
        <div>
          <div class="stage">
            <canvas id="sim-canvas"></canvas>
            <div class="stage-overlay">
              <span id="stage-left">t = 0</span>
              <span id="stage-right"></span>
            </div>
          </div>
          <div class="transport glass-card" style="border-radius:0 0 var(--radius-lg) var(--radius-lg); border-top:none;">
            <button class="icon-btn" id="btn-reset" title="Reset">${icon('reset')}</button>
            <button class="icon-btn" id="btn-play" title="Play/Pause">${icon('pause')}</button>
            <button class="icon-btn" id="btn-step" title="Step forward">${icon('step')}</button>
            <div class="grow">
              <label>Speed <span id="speed-val">1.0×</span></label>
              <input type="range" id="speed-slider" min="0" max="4" step="0.1" value="1">
            </div>
            <button class="icon-btn" id="btn-shot" title="Screenshot">${icon('camera')}</button>
            <button class="icon-btn" id="btn-full" title="Full screen">${icon('fullscreen')}</button>
            <button class="icon-btn" id="btn-bookmark" title="Bookmark">${icon('bookmark')}</button>
          </div>

          <div class="tab-strip" id="sim-tabs">
            <button data-tab="overview" class="active">Overview</button>
            <button data-tab="data">Data & Graph</button>
            <button data-tab="facts">Facts & Myths</button>
            <button data-tab="quiz">Mini Quiz</button>
          </div>
          <div id="tab-overview" class="tab-pane"></div>
          <div id="tab-data" class="tab-pane" style="display:none"></div>
          <div id="tab-facts" class="tab-pane" style="display:none"></div>
          <div id="tab-quiz" class="tab-pane" style="display:none"></div>
        </div>

        <div>
          <div class="panel glass-card">
            <h3>${icon('settings')} Adjustable Variables</h3>
            <div id="controls-host"></div>
          </div>
          <div class="panel glass-card">
            <h3>${icon('chart')} Live Measurements</h3>
            <div class="readout-grid" id="readout-host"></div>
          </div>
          <div class="panel glass-card">
            <h3>${icon('user')} Mode</h3>
            <div class="toggle-group">
              <button data-mode="student" class="${this.mode==='student'?'active':''}">Student</button>
              <button data-mode="teacher" class="${this.mode==='teacher'?'active':''}">Teacher</button>
            </div>
            <p style="margin-top:10px;font-size:11.5px;">Teacher mode reveals underlying formulas & extra precision.</p>
          </div>
        </div>
      </div>
    `;

    this.canvas = $('#sim-canvas', this.root);
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', ()=>this.resizeCanvas());

    this.buildControls();
    this.buildOverview();
    this.buildFacts();
    this.buildQuiz();
    this.wireTransport();
    this.wireTabs();

    if(mod.setup) mod.setup(this);
    this.updateReadouts();
    this.updateBookmarkBtn();
    this.start();
  }

  resizeCanvas(){
    const rectW = this.canvas.parentElement.clientWidth;
    const ratio = this.mod.aspect || 0.62;
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    this.cssW = rectW; this.cssH = Math.round(rectW*ratio);
    this.canvas.style.width = this.cssW+'px';
    this.canvas.style.height = this.cssH+'px';
    this.canvas.width = this.cssW*dpr; this.canvas.height = this.cssH*dpr;
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    if(this.mod.onResize) this.mod.onResize(this);
  }

  buildControls(){
    const host = $('#controls-host', this.root);
    host.innerHTML = '';
    (this.mod.controls||[]).forEach(c=>{
      const row = document.createElement('div');
      row.className = 'control-row control-block';
      if(c.type==='toggle-group'){
        row.innerHTML = `<div class="lbl-row"><span>${c.label}</span></div>
          <div class="toggle-group">${c.options.map(o=>`<button data-key="${c.key}" data-val="${o.value}" class="${o.value===c.value?'active':''}">${o.label}</button>`).join('')}</div>`;
        host.appendChild(row);
        $$('button', row).forEach(btn=>{
          btn.addEventListener('click', ()=>{
            $$('button', row).forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            this.state[c.key] = isNaN(btn.dataset.val) ? btn.dataset.val : Number(btn.dataset.val);
            if(c.onChange) c.onChange(this, this.state[c.key]);
          });
        });
        this.state[c.key] = c.value;
      } else {
        row.innerHTML = `<div class="lbl-row"><span>${c.label}</span><span class="v" id="cv-${c.key}">${c.format?c.format(c.value):c.value}${c.unit||''}</span></div>
          <input type="range" id="ci-${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}">`;
        host.appendChild(row);
        this.state[c.key] = c.value;
        const inp = $(`#ci-${c.key}`, row);
        inp.addEventListener('input', ()=>{
          const v = Number(inp.value);
          this.state[c.key] = v;
          $(`#cv-${c.key}`, row).textContent = (c.format?c.format(v):v) + (c.unit||'');
          if(c.onChange) c.onChange(this, v);
        });
      }
    });
  }

  buildOverview(){
    const mod = this.mod;
    $('#tab-overview', this.root).innerHTML = `
      <div class="info-block glass-card">
        <h3>${icon('target')} Learning Objectives</h3>
        <ul class="fact-list">${(mod.objectives||[]).map(o=>`<li>${o}</li>`).join('')}</ul>
      </div>
      <div class="info-block glass-card">
        <h3>${icon('book')} Scientific Background</h3>
        <p>${mod.background||''}</p>
      </div>
      <div class="info-block glass-card">
        <h3>${icon('flask')} Real-World Applications</h3>
        <ul class="fact-list">${(mod.applications||[]).map(o=>`<li>${o}</li>`).join('')}</ul>
      </div>
    `;
  }

  buildFacts(){
    const mod = this.mod;
    $('#tab-facts', this.root).innerHTML = `
      <div class="info-block glass-card">
        <h3>${icon('star')} Interesting Facts</h3>
        <ul class="fact-list">${(mod.facts||[]).map(o=>`<li>${o}</li>`).join('')}</ul>
      </div>
      <div class="info-block glass-card">
        <h3>${icon('info')} Common Misconceptions</h3>
        <ul class="fact-list">${(mod.misconceptions||[]).map(o=>`<li>${o}</li>`).join('')}</ul>
      </div>
    `;
  }

  buildQuiz(){
    const mod = this.mod, self = this;
    const host = $('#tab-quiz', this.root);
    const wrap = document.createElement('div');
    wrap.className = 'info-block glass-card';
    wrap.innerHTML = `<h3>${icon('award')} Test Your Understanding</h3>`;
    let correct = 0, answered = 0;
    (mod.quiz||[]).forEach((q,qi)=>{
      const qEl = document.createElement('div');
      qEl.className = 'quiz-q';
      qEl.innerHTML = `<p>${qi+1}. ${q.q}</p><div class="quiz-opts"></div><div class="quiz-feedback"></div>`;
      const optsEl = $('.quiz-opts', qEl);
      q.options.forEach((opt,oi)=>{
        const b = document.createElement('button');
        b.className = 'quiz-opt'; b.textContent = opt;
        b.addEventListener('click', ()=>{
          if(qEl.dataset.done) return;
          qEl.dataset.done = '1'; answered++;
          $$('.quiz-opt', qEl).forEach((el,i)=>{
            if(i===q.correct) el.classList.add('correct');
            else if(i===oi) el.classList.add('wrong');
          });
          if(oi===q.correct) correct++;
          $('.quiz-feedback', qEl).textContent = q.explain||'';
          if(answered===mod.quiz.length){
            recordQuizScore(self.meta.id, correct, mod.quiz.length);
            const badge = document.createElement('div');
            badge.className='badge'; badge.style.marginTop='10px';
            badge.innerHTML = `${icon('award')} Score: ${correct}/${mod.quiz.length}`;
            wrap.appendChild(badge);
          }
        });
        optsEl.appendChild(b);
      });
      wrap.appendChild(qEl);
    });
    if(!mod.quiz || !mod.quiz.length){
      wrap.innerHTML += `<p>Quiz coming soon for this module.</p>`;
    }
    host.innerHTML = ''; host.appendChild(wrap);
  }

  wireTabs(){
    $$('#sim-tabs button', this.root).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        $$('#sim-tabs button', this.root).forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        $$('.tab-pane', this.root).forEach(p=>p.style.display='none');
        $(`#tab-${btn.dataset.tab}`, this.root).style.display='block';
      });
    });
  }

  wireTransport(){
    const playBtn = $('#btn-play', this.root);
    playBtn.addEventListener('click', ()=>{
      this.playing = !this.playing;
      playBtn.innerHTML = this.playing ? icon('pause') : icon('play');
      if(this.playing) this.start();
    });
    $('#btn-reset', this.root).addEventListener('click', ()=>{
      this.t = 0; this.dataLog = []; this.logAccum=0;
      if(this.mod.reset) this.mod.reset(this);
      this.updateReadouts();
    });
    $('#btn-step', this.root).addEventListener('click', ()=>{
      if(this.mod.update) this.mod.update(this, 1/6);
      this.draw();
      this.updateReadouts();
    });
    const speedSlider = $('#speed-slider', this.root);
    speedSlider.addEventListener('input', ()=>{
      this.speed = Number(speedSlider.value);
      $('#speed-val', this.root).textContent = this.speed.toFixed(1)+'×';
    });
    $('#btn-shot', this.root).addEventListener('click', ()=>{
      const a = document.createElement('a');
      a.download = this.meta.id+'-screenshot.png';
      a.href = this.canvas.toDataURL('image/png');
      a.click();
      toast('Screenshot saved');
    });
    $('#btn-full', this.root).addEventListener('click', ()=>{
      const stage = this.canvas.closest('.stage');
      if(document.fullscreenElement) document.exitFullscreen();
      else stage.requestFullscreen?.();
    });
    $('#btn-bookmark', this.root).addEventListener('click', ()=>{
      const list = Store.data.bookmarks;
      const idx = list.indexOf(this.meta.id);
      if(idx===-1){ list.push(this.meta.id); toast('Bookmarked for later'); }
      else { list.splice(idx,1); toast('Removed bookmark'); }
      Store.save();
      this.updateBookmarkBtn();
    });
    $$('[data-mode]', this.root).forEach(b=>{
      b.addEventListener('click', ()=>{
        $$('[data-mode]', this.root).forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        this.mode = b.dataset.mode;
        Store.set('mode', this.mode);
        this.updateReadouts();
      });
    });
  }

  updateBookmarkBtn(){
    const btn = $('#btn-bookmark', this.root);
    const active = Store.data.bookmarks.includes(this.meta.id);
    btn.style.color = active ? 'var(--solar-gold)' : '';
    btn.style.borderColor = active ? 'var(--solar-gold)' : '';
  }

  updateReadouts(){
    const host = $('#readout-host', this.root);
    if(!host || !this.mod.readouts) return;
    const rs = this.mod.readouts(this) || {};
    host.innerHTML = Object.entries(rs).map(([lbl,val])=>
      `<div class="readout"><div class="lbl">${lbl}</div><div class="val">${val}</div></div>`
    ).join('');
    if(this.mode==='teacher' && this.mod.formula){
      const f = document.createElement('div');
      f.className = 'readout'; f.style.gridColumn = '1 / -1';
      f.innerHTML = `<div class="lbl">Governing relation</div><div class="val" style="font-size:12.5px;">${this.mod.formula}</div>`;
      host.appendChild(f);
    }
    const left = $('#stage-left', this.root), right = $('#stage-right', this.root);
    if(left && this.mod.stageLeft) left.textContent = this.mod.stageLeft(this);
    if(right && this.mod.stageRight) right.textContent = this.mod.stageRight(this);
  }

  logData(){
    if(!this.mod.dataRow) return;
    this.logAccum += 1;
    if(this.logAccum >= (this.mod.logEvery||20)){
      this.logAccum = 0;
      const row = this.mod.dataRow(this);
      if(row){
        this.dataLog.push(row);
        if(this.dataLog.length>200) this.dataLog.shift();
        this.renderDataTab();
      }
    }
  }

  renderDataTab(){
    const host = $('#tab-data', this.root);
    if(!host) return;
    const cols = this.mod.dataColumns || ['t','value'];
    let html = `<div class="info-block glass-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="margin:0">${icon('chart')} Observation Log</h3>
        <button class="btn btn-ghost btn-sm" id="btn-export">${icon('download')} Export CSV</button>
      </div>
      <div style="max-height:260px;overflow:auto;">
      <table class="data-table"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>
      ${this.dataLog.slice(-25).reverse().map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div>
      ${this.dataLog.length===0?'<p style="margin-top:10px;">Data will populate as the simulation runs. Press play.</p>':''}
    </div>
    <div class="info-block glass-card">
      <h3>${icon('chart')} Graph</h3>
      <canvas id="mini-graph" width="600" height="220" style="width:100%;height:auto;"></canvas>
    </div>`;
    host.innerHTML = html;
    const exportBtn = $('#btn-export', host);
    if(exportBtn) exportBtn.addEventListener('click', ()=>this.exportCSV(cols));
    this.drawGraph();
  }

  drawGraph(){
    const canvas = $('#mini-graph', this.root);
    if(!canvas || !this.mod.graphValue) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(148,163,184,.25)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(40,10); ctx.lineTo(40,h-30); ctx.lineTo(w-10,h-30); ctx.stroke();
    const pts = this.dataLog.map(r=>this.mod.graphValue(r)).filter(Boolean);
    if(pts.length<2) return;
    const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
    const xmin=Math.min(...xs), xmax=Math.max(...xs,xmin+0.001);
    const ymin=Math.min(0,...ys), ymax=Math.max(...ys,ymin+0.001);
    ctx.strokeStyle = '#22d3ee'; ctx.lineWidth=2; ctx.beginPath();
    pts.forEach((p,i)=>{
      const px = 40 + (p.x-xmin)/(xmax-xmin)*(w-60);
      const py = (h-30) - (p.y-ymin)/(ymax-ymin)*(h-50);
      i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
    });
    ctx.stroke();
    ctx.fillStyle = '#94a3b8'; ctx.font='11px sans-serif';
    ctx.fillText(this.mod.graphLabel||'', 44, 22);
  }

  exportCSV(cols){
    const rows = [cols.join(','), ...this.dataLog.map(r=>r.join(','))];
    const blob = new Blob([rows.join('\n')], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = this.meta.id+'-observations.csv';
    a.click();
    toast('Observations exported');
  }

  start(){
    if(this.rafId) return;
    this.last = performance.now();
    const loop = (now)=>{
      const dt = Math.min((now-this.last)/1000, 0.05);
      this.last = now;
      if(this.playing){
        this.t += dt*this.speed;
        if(this.mod.update) this.mod.update(this, dt*this.speed);
        this.logData();
        this.updateReadouts();
      }
      this.draw();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  draw(){ if(this.mod.draw) this.mod.draw(this); }
  destroy(){ if(this.rafId) cancelAnimationFrame(this.rafId); this.rafId=null; }
}

/* ---------------------------------------------------------------------- */
/* ROUTER + VIEW RENDERING                                                 */
/* ---------------------------------------------------------------------- */
let currentEngine = null;

function refreshHeaderStats(){
  const rank = rankFor(Store.data.xp);
  $$('.stat-xp').forEach(el=>el.textContent = Store.data.xp);
  $$('.stat-rank').forEach(el=>el.textContent = rank.name);
  $$('.stat-streak').forEach(el=>el.textContent = Store.data.streak);
}

function go(route){
  window.location.hash = route;
}

function renderHome(){
  const rank = rankFor(Store.data.xp);
  const visited = Object.keys(Store.data.progress).length;
  const continueSim = Object.entries(Store.data.progress).sort((a,b)=>b[1].lastVisit-a[1].lastVisit)[0];
  const continueMeta = continueSim ? SIMS.find(s=>s.id===continueSim[0]) : null;

  const html = `
    <div class="hero glass-card">
      <div class="hero-inner">
        <div class="eyebrow">Virtual Astronomy Laboratory</div>
        <h1>Explore the universe, one experiment at a time.</h1>
        <p>Ten fully interactive simulations covering orbits, eclipses, seasons, stars, galaxies and gravity — built for hands-on scientific inquiry, 100% offline.</p>
        <div class="hero-cta">
          <button class="btn btn-primary" id="cta-explore">${icon('orbit')} Start Exploring</button>
          ${continueMeta?`<button class="btn btn-ghost" id="cta-continue">${icon('play')} Continue: ${continueMeta.title}</button>`:''}
        </div>
      </div>
    </div>

    <div class="grid grid-4" style="margin-top:18px;">
      <div class="glass-card stat-card"><div class="val stat-xp">${Store.data.xp}</div><div class="lbl">Total XP</div></div>
      <div class="glass-card stat-card"><div class="val" style="font-size:16px;">${rank.name}</div><div class="lbl">Astronomer Rank</div></div>
      <div class="glass-card stat-card"><div class="val stat-streak">${Store.data.streak}</div><div class="lbl">Day Streak</div></div>
      <div class="glass-card stat-card"><div class="val">${visited}/10</div><div class="lbl">Simulations Explored</div></div>
    </div>

    <div class="section-title"><h2>All Simulations</h2><span class="link" id="link-see-all">See all →</span></div>
    <div class="grid grid-3" id="home-sim-grid"></div>

    <div class="section-title"><h2>Quick Access</h2></div>
    <div class="grid grid-4">
      <div class="glass-card sim-card" data-nav="#handbook" style="min-height:110px;"><span class="glyph">${icon('handbook')}</span><h3>Handbook</h3><p class="desc">Reference reading</p></div>
      <div class="glass-card sim-card" data-nav="#glossary" style="min-height:110px;"><span class="glyph">${icon('book')}</span><h3>Glossary</h3><p class="desc">Key terms</p></div>
      <div class="glass-card sim-card" data-nav="#quiz" style="min-height:110px;"><span class="glyph">${icon('award')}</span><h3>Quiz Centre</h3><p class="desc">Test yourself</p></div>
      <div class="glass-card sim-card" data-nav="#achievements" style="min-height:110px;"><span class="glyph">${icon('star')}</span><h3>Achievements</h3><p class="desc">Your badges</p></div>
    </div>
  `;
  $('#view-home').innerHTML = html;
  const grid = $('#home-sim-grid');
  grid.innerHTML = SIMS.map(simCardHTML).join('');
  wireSimCards(grid);
  $('#cta-explore').addEventListener('click', ()=>go('#simulations'));
  const cont = $('#cta-continue');
  if(cont) cont.addEventListener('click', ()=>go('#sim/'+continueSim[0]));
  $('#link-see-all').addEventListener('click', ()=>go('#simulations'));
  $$('[data-nav]', $('#view-home')).forEach(el=>el.addEventListener('click', ()=>go(el.dataset.nav)));
}

function simCardHTML(s){
  const done = Store.data.progress[s.id];
  const score = Store.data.quizScores[s.id];
  return `<div class="glass-card sim-card" data-sim="${s.id}">
    <span class="num">${String(s.n).padStart(2,'0')}</span>
    <span class="glyph">${icon(s.icon)}</span>
    <h3>${s.title}</h3>
    <p class="desc">${s.short}</p>
    <div class="tags">${s.tags.map(t=>`<span class="tag">${t}</span>`).join('')}${score?`<span class="tag" style="color:var(--aurora-green)">Quiz ${score.correct}/${score.total}</span>`:''}</div>
    ${done?`<div class="progress-mini" style="width:100%"></div>`:''}
  </div>`;
}
function wireSimCards(container){
  $$('[data-sim]', container).forEach(el=>{
    el.addEventListener('click', ()=>go('#sim/'+el.dataset.sim));
  });
}

function renderSimList(){
  $('#view-simulations').innerHTML = `
    <div class="sim-header">
      <div class="eyebrow">Laboratory</div>
      <h1>All Simulations</h1>
      <p>Ten premium interactive modules. Pick one to begin your investigation.</p>
    </div>
    <div class="grid grid-3" id="all-sim-grid"></div>
  `;
  const grid = $('#all-sim-grid');
  grid.innerHTML = SIMS.map(simCardHTML).join('');
  wireSimCards(grid);
}

function renderSim(id){
  const meta = SIMS.find(s=>s.id===id);
  const view = $('#view-sim-detail');
  if(!meta){ view.innerHTML = `<div class="empty-state">Simulation not found.</div>`; return; }
  const mod = SimModules[id];
  if(!mod){ view.innerHTML = `<div class="empty-state">Loading simulation…</div>`; return; }
  if(currentEngine) currentEngine.destroy();
  markVisited(id);
  currentEngine = new SimEngine(view, meta, mod);
}

function renderHandbook(){
  const sections = HANDBOOK_DATA;
  $('#view-handbook').innerHTML = `
    <div class="sim-header"><div class="eyebrow">Reference</div><h1>Astronomy Handbook</h1><p>Core concepts every young astronomer should know, organised for quick reading.</p></div>
    <div class="tab-strip" id="hb-tabs">${sections.map((s,i)=>`<button data-i="${i}" class="${i===0?'active':''}">${s.title}</button>`).join('')}</div>
    <div id="hb-content"></div>
  `;
  const content = $('#hb-content');
  function show(i){
    const s = sections[i];
    content.innerHTML = `<div class="info-block glass-card"><h3>${icon(s.icon)} ${s.title}</h3><p>${s.body}</p>
      ${s.points?`<ul class="fact-list">${s.points.map(p=>`<li>${p}</li>`).join('')}</ul>`:''}</div>`;
  }
  $$('#hb-tabs button').forEach(b=>b.addEventListener('click', ()=>{
    $$('#hb-tabs button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    show(Number(b.dataset.i));
  }));
  show(0);
}

function renderQuizCentre(){
  $('#view-quiz').innerHTML = `
    <div class="sim-header"><div class="eyebrow">Assessment</div><h1>Quiz Centre</h1><p>Your results across every simulation quiz.</p></div>
    <div class="grid grid-2" id="quiz-grid"></div>
  `;
  const grid = $('#quiz-grid');
  grid.innerHTML = SIMS.map(s=>{
    const score = Store.data.quizScores[s.id];
    return `<div class="glass-card panel">
      <h3 style="text-transform:none;letter-spacing:0;color:var(--text-hi);font-size:14px;">${icon(s.icon)} ${s.title}</h3>
      <p style="font-size:12.5px;">${score?`Score: <b style="color:var(--aurora-green)">${score.correct}/${score.total}</b>`:'Not attempted yet.'}</p>
      <button class="btn btn-sm btn-ghost" data-sim="${s.id}">${score?'Retry':'Start'} Quiz</button>
    </div>`;
  }).join('');
  $$('[data-sim]', grid).forEach(b=>b.addEventListener('click', ()=>go('#sim/'+b.dataset.sim)));
}

function renderGlossary(){
  const terms = GLOSSARY_DATA;
  const letters = Array.from(new Set(terms.map(t=>t.term[0].toUpperCase()))).sort();
  $('#view-glossary').innerHTML = `
    <div class="sim-header"><div class="eyebrow">Reference</div><h1>Illustrated Glossary</h1><p>Search or browse key astronomy terms.</p></div>
    <div class="searchbar glass-card" style="max-width:420px;margin-bottom:14px;"><span>${icon('search')}</span><input id="gloss-search" placeholder="Search terms…"></div>
    <div class="az-strip" id="az-strip"><button data-l="all" class="active">All</button>${letters.map(l=>`<button data-l="${l}">${l}</button>`).join('')}</div>
    <div id="gloss-list"></div>
  `;
  let readCount = 0;
  function render(filterL, q){
    const list = terms.filter(t=>{
      const matchL = filterL==='all' || t.term[0].toUpperCase()===filterL;
      const matchQ = !q || t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q);
      return matchL && matchQ;
    });
    $('#gloss-list').innerHTML = list.map(t=>`<div class="glass-card gloss-item"><span class="term">${t.term}</span><span class="pron">${t.pron||''}</span><p style="margin:6px 0 0;font-size:12.5px;">${t.def}</p></div>`).join('') || `<div class="empty-state">No terms match your search.</div>`;
  }
  $$('#az-strip button').forEach(b=>b.addEventListener('click', ()=>{
    $$('#az-strip button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    render(b.dataset.l, $('#gloss-search').value.toLowerCase());
    readCount++; if(readCount>=10) unlockAchievement('bookworm');
  }));
  $('#gloss-search').addEventListener('input', (e)=>{
    const active = $('#az-strip .active').dataset.l;
    render(active, e.target.value.toLowerCase());
  });
  render('all','');
}

function renderBookmarks(){
  const ids = Store.data.bookmarks;
  $('#view-bookmarks').innerHTML = `
    <div class="sim-header"><div class="eyebrow">Saved</div><h1>Bookmarks</h1><p>Simulations you've marked to revisit.</p></div>
    <div class="grid grid-3" id="bm-grid">${ids.length? SIMS.filter(s=>ids.includes(s.id)).map(simCardHTML).join('') : `<div class="empty-state">No bookmarks yet. Open a simulation and tap the bookmark icon.</div>`}</div>
  `;
  wireSimCards($('#bm-grid'));
}

function renderAchievements(){
  const rank = rankFor(Store.data.xp);
  const next = xpToNext(Store.data.xp);
  $('#view-achievements').innerHTML = `
    <div class="sim-header"><div class="eyebrow">Progress</div><h1>Achievements</h1><p>Rank: <b style="color:var(--nebula-cyan)">${rank.name}</b> ${next?`· ${next-Store.data.xp} XP to next rank`:'· Maximum rank reached'}</p></div>
    <div class="grid grid-3" id="ach-grid"></div>
  `;
  $('#ach-grid').innerHTML = ACHIEVEMENTS.map(a=>{
    const unlocked = Store.data.achievements.includes(a.id);
    return `<div class="glass-card ach-card ${unlocked?'':'locked'}"><div class="ic">${icon(a.icon)}</div><div><h4>${a.name}</h4><p>${a.desc}</p></div></div>`;
  }).join('');
}

function renderAbout(){
  $('#view-about').innerHTML = `
    <div class="sim-header"><div class="eyebrow">About</div><h1>Developer</h1></div>
    <div class="glass-card dev-card">
      <img src="assets/dev-photo.jpg" alt="Dr. Mateen Yousuf">
      <div>
        <h2>Dr. Mateen Yousuf</h2>
        <div class="role">Teacher</div>
        <div class="org">School Education Department, Kashmir</div>
      </div>
    </div>
    <div class="info-block glass-card" style="margin-top:16px;">
      <h3>${icon('target')} Vision</h3>
      <p>The Virtual Astronomy Laboratory was built to bring hands-on, inquiry-driven science to every classroom — no telescope, internet connection, or laboratory required. Every simulation invites students to change a variable, observe the result, and build their own understanding of how the cosmos works.</p>
    </div>
    <div class="vision-grid">
      <div class="glass-card vision-item"><div class="ic">${icon('flask')}</div><h4>Experiential Learning</h4><p>Learning by manipulating real variables, not watching passive animations.</p></div>
      <div class="glass-card vision-item"><div class="ic">${icon('compass')}</div><h4>Scientific Inquiry</h4><p>Every module encourages observation, prediction, and evidence-based reasoning.</p></div>
      <div class="glass-card vision-item"><div class="ic">${icon('book')}</div><h4>NEP 2020 Aligned</h4><p>Built around competency-based learning outcomes for Classes VI–XII.</p></div>
      <div class="glass-card vision-item"><div class="ic">${icon('star')}</div><h4>Curiosity First</h4><p>Designed to spark questions, not just deliver answers.</p></div>
      <div class="glass-card vision-item"><div class="ic">${icon('galaxy')}</div><h4>Space Literacy</h4><p>Helping students grasp the true scale and dynamics of the universe.</p></div>
      <div class="glass-card vision-item"><div class="ic">${icon('rocket')}</div><h4>Future Explorers</h4><p>Inspiring the next generation of scientists, engineers and astronomers.</p></div>
    </div>
  `;
}

function renderSettings(){
  $('#view-settings').innerHTML = `
    <div class="sim-header"><div class="eyebrow">Preferences</div><h1>Settings</h1></div>
    <div class="glass-card panel">
      <div class="setting-row"><div><div class="t">Dark theme</div><div class="s">Deep-space visuals (recommended)</div></div><button class="switch ${Store.get('theme')==='dark'?'on':''}" id="sw-theme"></button></div>
      <div class="setting-row"><div><div class="t">Reduced motion</div><div class="s">Minimise animation for comfort & performance</div></div><button class="switch ${Store.get('reducedMotion')?'on':''}" id="sw-motion"></button></div>
      <div class="setting-row"><div><div class="t">Default mode</div><div class="s">Student (simplified) or Teacher (full formulas)</div></div>
        <div class="toggle-group" style="width:160px;"><button data-m="student" class="${Store.get('mode')==='student'?'active':''}">Student</button><button data-m="teacher" class="${Store.get('mode')==='teacher'?'active':''}">Teacher</button></div></div>
    </div>
    <div class="glass-card panel" style="margin-top:14px;">
      <div class="setting-row"><div><div class="t">Reset all progress</div><div class="s">Clears XP, bookmarks, quiz scores & achievements</div></div><button class="btn btn-ghost btn-sm" id="btn-reset-all">Reset</button></div>
      <div class="setting-row"><div><div class="t">Install as app</div><div class="s">Add to home screen for offline use</div></div><button class="btn btn-primary btn-sm" id="btn-install-settings">Install</button></div>
    </div>
  `;
  $('#sw-theme').addEventListener('click', (e)=>{
    const on = !e.target.classList.contains('on');
    e.target.classList.toggle('on', on);
    Store.set('theme', on?'dark':'light');
    document.documentElement.setAttribute('data-theme', on?'dark':'light');
  });
  $('#sw-motion').addEventListener('click', (e)=>{
    const on = !e.target.classList.contains('on');
    e.target.classList.toggle('on', on);
    Store.set('reducedMotion', on);
    document.body.classList.toggle('reduced-motion', on);
  });
  $$('[data-m]').forEach(b=>b.addEventListener('click', ()=>{
    $$('[data-m]').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    Store.set('mode', b.dataset.m);
  }));
  $('#btn-reset-all').addEventListener('click', ()=>{
    if(confirm('This will erase all saved progress. Continue?')){
      localStorage.removeItem(Store.key); Store.load(); refreshHeaderStats(); toast('Progress reset');
      go('#home');
    }
  });
  $('#btn-install-settings').addEventListener('click', triggerInstall);
}

const VIEWS = {
  home: renderHome, simulations: renderSimList, handbook: renderHandbook,
  quiz: renderQuizCentre, glossary: renderGlossary, bookmarks: renderBookmarks,
  achievements: renderAchievements, about: renderAbout, settings: renderSettings
};

function router(){
  const hash = (window.location.hash || '#home').replace('#','');
  const [route, param] = hash.split('/');
  $$('.view').forEach(v=>v.classList.remove('active'));
  $$('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.route===route));

  if(route==='sim' && param){
    $('#view-sim-detail').classList.add('active');
    renderSim(param);
  } else {
    if(currentEngine){ currentEngine.destroy(); currentEngine=null; }
    const fn = VIEWS[route] || VIEWS.home;
    const viewEl = $('#view-'+(route in VIEWS?route:'home'));
    if(viewEl) viewEl.classList.add('active');
    fn();
  }
  $('main').scrollTo?.(0,0);
  window.scrollTo(0,0);
}

/* ---------------------------------------------------------------------- */
/* PWA INSTALL PROMPT                                                      */
/* ---------------------------------------------------------------------- */
let deferredPrompt = null;
function triggerInstall(){
  if(deferredPrompt){ deferredPrompt.prompt(); deferredPrompt=null; }
  else toast('Use your browser menu → "Install app" / "Add to Home Screen"');
}
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault(); deferredPrompt = e;
  $('#install-banner').classList.add('show');
});
window.addEventListener('appinstalled', ()=>{ $('#install-banner').classList.remove('show'); });

/* ---------------------------------------------------------------------- */
/* BOOTSTRAP                                                               */
/* ---------------------------------------------------------------------- */
function bootstrap(){
  document.documentElement.setAttribute('data-theme', Store.get('theme'));
  if(Store.get('reducedMotion')) document.body.classList.add('reduced-motion');
  handleStreak();
  refreshHeaderStats();
  router();
  window.addEventListener('hashchange', router);

  $('#nav-search-input')?.addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase();
    if(!q) return;
    if(window.location.hash!=='#simulations') go('#simulations');
    setTimeout(()=>{
      $$('#all-sim-grid [data-sim]').forEach(card=>{
        const s = SIMS.find(x=>x.id===card.dataset.sim);
        card.style.display = s.title.toLowerCase().includes(q)||s.short.toLowerCase().includes(q) ? '' : 'none';
      });
    }, 60);
  });

  $('#install-banner-btn')?.addEventListener('click', triggerInstall);
  $('#install-banner-close')?.addEventListener('click', ()=>$('#install-banner').classList.remove('show'));

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  initStarfield('bg-stars', {density:0.00016});
  const splashCanvas = document.getElementById('splash-canvas');
  if(splashCanvas) initStarfield('splash-canvas', {density:0.0003});

  let progress = 0;
  const fill = $('.splash-progress .fill'), label = $('.splash-progress .label');
  const timer = setInterval(()=>{
    progress += Math.random()*18;
    if(progress>=100){
      progress=100; clearInterval(timer);
      if(label) label.textContent = 'Ready';
      const enterBtn = $('.splash-enter');
      if(enterBtn) enterBtn.style.display='inline-flex';
    }
    if(fill) fill.style.width = progress+'%';
    if(label && progress<100) label.textContent = 'Loading simulations… '+Math.floor(progress)+'%';
  }, 220);

  function enterApp(){
    $('#splash').classList.add('hide');
    $('#app').classList.add('ready');
    bootstrap();
  }
  $('.splash-enter')?.addEventListener('click', enterApp);
  // auto-enter shortly after ready, but allow manual click too
  setTimeout(()=>{ if(!$('#app').classList.contains('ready')) enterApp(); }, 3200);
});
