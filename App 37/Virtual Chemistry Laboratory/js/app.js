/* ============================================================
   APP ENGINE — state, navigation, rendering
   ============================================================ */

const STORAGE_KEY = 'vcl_state_v1';

const ACHIEVEMENTS = [
  {id:'first_step', name:'First Reaction', desc:'Open your first simulation', icon:ICONS.flask, check:s=>Object.keys(s.progress||{}).length>=1},
  {id:'quiz_master', name:'Quiz Whiz', desc:'Score 100% on any quiz', icon:ICONS.trophy, check:s=>Object.values(s.quizScores||{}).some(q=>q.total>0 && q.correct===q.total)},
  {id:'halfway', name:'Halfway There', desc:'Complete 5 simulations', icon:ICONS.check, check:s=>Object.values(s.completed||{}).filter(Boolean).length>=5},
  {id:'lab_master', name:'Lab Master', desc:'Complete all 10 simulations', icon:ICONS.target, check:s=>Object.values(s.completed||{}).filter(Boolean).length>=10},
  {id:'curious_mind', name:'Curious Mind', desc:'Favourite 3 simulations', icon:ICONS.world, check:s=>Object.values(s.favorites||{}).filter(Boolean).length>=3},
  {id:'streak_3', name:'On a Streak', desc:'Visit the lab 3 days running', icon:ICONS.lightbulb, check:s=>(s.streak||0)>=3},
];

const App = {
  state:null,
  currentView:'home',
  currentSim:null,

  defaultState(){
    return { theme:'light', xp:0, streak:0, lastVisit:null, favorites:{}, progress:{}, completed:{}, quizScores:{}, notes:{} };
  },

  load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      this.state = raw ? Object.assign(this.defaultState(), JSON.parse(raw)) : this.defaultState();
    }catch(e){ this.state = this.defaultState(); }
    this.updateStreak();
  },

  save(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); }catch(e){}
  },

  updateStreak(){
    const today = new Date().toDateString();
    if(this.state.lastVisit !== today){
      const y = new Date(); y.setDate(y.getDate()-1);
      this.state.streak = (this.state.lastVisit === y.toDateString()) ? (this.state.streak||0)+1 : 1;
      this.state.lastVisit = today;
      this.save();
    }
  },

  addXP(n, reason){
    this.state.xp = (this.state.xp||0) + n;
    this.save();
    this.toast(`+${n} XP${reason ? ' · '+reason : ''}`);
    this.checkAchievements();
    this.refreshHomeStats();
  },

  toggleFavorite(id){
    this.state.favorites[id] = !this.state.favorites[id];
    this.save();
    this.renderHome();
    this.checkAchievements();
  },

  markProgress(id, pct){
    const prev = this.state.progress[id]||0;
    this.state.progress[id] = Math.max(prev, pct);
    if(pct>=100 && !this.state.completed[id]){
      this.state.completed[id] = true;
      this.addXP(50, 'Simulation completed');
    }
    this.save();
    this.checkAchievements();
  },

  recordQuiz(id, correct, total){
    this.state.quizScores[id] = {correct, total};
    this.save();
    this.checkAchievements();
  },

  checkAchievements(){
    let newly = [];
    this.state._unlocked = this.state._unlocked || {};
    ACHIEVEMENTS.forEach(a=>{
      if(!this.state._unlocked[a.id] && a.check(this.state)){
        this.state._unlocked[a.id] = true;
        newly.push(a);
      }
    });
    if(newly.length){ this.save(); newly.forEach(a=>this.toast(`🏆 Achievement unlocked: ${a.name}`)); }
    if(document.getElementById('achGrid')) this.renderAchievements();
  },

  toast(msg){
    const el = document.getElementById('toastEl');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(()=>el.classList.remove('show'), 2400);
  },

  toggleTheme(){
    this.state.theme = this.state.theme==='dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.state.theme);
    this.save();
  },

  /* ---------------- NAVIGATION ---------------- */
  showView(view){
    document.getElementById('homeView').classList.toggle('hidden', view!=='home');
    document.getElementById('simView').classList.toggle('hidden', view!=='sim');
    document.getElementById('toolView').classList.toggle('hidden', view!=='tool');
    this.currentView = view;
    window.scrollTo({top:0, behavior:'smooth'});
    document.querySelectorAll('.bn-item').forEach(el=>el.classList.remove('active'));
    if(view==='home') document.querySelector('.bn-item[data-nav="home"]').classList.add('active');
  },

  goHome(){ this.currentSim=null; this.renderHome(); this.showView('home'); },

  openSim(id){
    this.currentSim = id;
    this.renderSimView(id);
    this.showView('sim');
    this.markProgress(id, Math.max(this.state.progress[id]||0, 10));
  },

  openTool(id){ this.renderToolView(id); this.showView('tool'); },

  /* ---------------- HOME RENDER ---------------- */
  refreshHomeStats(){
    const completed = Object.values(this.state.completed).filter(Boolean).length;
    document.getElementById('statXP').textContent = this.state.xp||0;
    document.getElementById('statCompleted').textContent = `${completed}/10`;
    document.getElementById('statStreak').textContent = this.state.streak||0;
  },

  simCardHTML(sim){
    const prog = this.state.progress[sim.id]||0;
    const fav = !!this.state.favorites[sim.id];
    const completed = !!this.state.completed[sim.id];
    return `<div class="card sim-card" data-sim="${sim.id}">
      <div class="sim-card-media" style="background:${sim.color}">
        <span class="sim-card-num">EXP ${String(sim.num).padStart(2,'0')}</span>
        <div class="sim-card-fav ${fav?'active':''}" data-fav="${sim.id}">${ICONS.world.replace('<svg','<svg width="16" height="16"')}</div>
        ${sim.icon}
      </div>
      <div class="sim-card-body">
        <h3>${sim.title}</h3>
        <p>${sim.subtitle}</p>
        <span class="tag-pill ${completed?'badge-green':'badge-blue'}" style="background:${completed?'#E6F6EA':'var(--light-blue)'};color:${completed?'#2e7d32':'var(--primary-blue)'}">${completed?'Completed':'Explore'}</span>
        <div class="sim-card-progress"><div class="sim-card-progress-bar" style="width:${prog}%"></div></div>
      </div>
    </div>`;
  },

  renderHome(){
    this.refreshHomeStats();
    const favOnly = this._favFilter;
    const list = favOnly ? SIM_LIST.filter(s=>this.state.favorites[s.id]) : SIM_LIST;
    document.getElementById('simsGrid').innerHTML = list.length ? list.map(s=>this.simCardHTML(s)).join('') :
      `<div class="empty-state" style="grid-column:1/-1">${ICONS.flask}<p>No favourites yet — tap the star on any simulation card.</p></div>`;

    const continueList = SIM_LIST.filter(s=>{
      const p = this.state.progress[s.id]||0; return p>0 && p<100;
    }).slice(0,4);
    document.getElementById('continueSection').style.display = continueList.length? '' : 'none';
    document.getElementById('continueGrid').innerHTML = continueList.map(s=>this.simCardHTML(s)).join('');

    const tools = [
      {id:'periodic-table', name:'Periodic Table', icon:ICONS.grid, color:'linear-gradient(135deg,#26C6DA,#1976D2)'},
      {id:'handbook', name:'Formula Handbook', icon:ICONS.book, color:'linear-gradient(135deg,#43A047,#1976D2)'},
      {id:'glossary', name:'Glossary', icon:ICONS.glossary, color:'linear-gradient(135deg,#FFB300,#E53935)'},
      {id:'about', name:'About Developer', icon:ICONS.info, color:'linear-gradient(135deg,#1976D2,#0D47A1)'},
      {id:'settings', name:'Settings', icon:ICONS.target, color:'linear-gradient(135deg,#5B6579,#212121)'},
    ];
    document.getElementById('toolsGrid').innerHTML = tools.map(t=>`
      <div class="card tool-card" data-tool="${t.id}">
        <div class="icon-wrap" style="background:${t.color}">${t.icon}</div>
        <h3>${t.name}</h3>
      </div>`).join('');

    this.renderAchievements();

    // bind
    document.querySelectorAll('#simsGrid [data-sim], #continueGrid [data-sim]').forEach(el=>{
      el.addEventListener('click', (e)=>{
        if(e.target.closest('[data-fav]')) return;
        this.openSim(el.dataset.sim);
      });
    });
    document.querySelectorAll('[data-fav]').forEach(el=>{
      el.addEventListener('click', (e)=>{ e.stopPropagation(); this.toggleFavorite(el.dataset.fav); });
    });
    document.querySelectorAll('#toolsGrid [data-tool]').forEach(el=>{
      el.addEventListener('click', ()=>this.openTool(el.dataset.tool));
    });
  },

  renderAchievements(){
    const grid = document.getElementById('achGrid');
    if(!grid) return;
    grid.innerHTML = ACHIEVEMENTS.map(a=>{
      const unlocked = !!(this.state._unlocked && this.state._unlocked[a.id]);
      return `<div class="card tool-card" style="opacity:${unlocked?1:.45}">
        <div class="icon-wrap" style="background:${unlocked?'linear-gradient(135deg,var(--amber),#FF7043)':'var(--border)'}">${a.icon}</div>
        <h3>${a.name}</h3><p class="text-sm" style="margin-top:4px">${a.desc}</p>
      </div>`;
    }).join('');
  },

  /* ---------------- SIM VIEW ---------------- */
  renderSimView(id){
    const meta = SIM_LIST.find(s=>s.id===id);
    const content = SIM_CONTENT[id];
    const container = document.getElementById('simView');
    const fav = !!this.state.favorites[id];

    container.innerHTML = `
      <div class="sim-header">
        <div class="back-btn" id="simBack">${ICONS.check.replace('polyline points="20 6 9 17 4 12"','path d="M15 18l-6-6 6-6"')} Back</div>
        <h1>${meta.title}</h1>
        <div class="btn-icon ${fav?'active':''}" id="simFav" title="Favourite">${ICONS.world.replace('<svg','<svg width="16" height="16"')}</div>
        <div class="mode-toggle" id="modeToggle">
          <button class="active" data-mode="student">Student</button>
          <button data-mode="teacher">Teacher</button>
        </div>
        <div class="btn-icon" id="fullscreenBtn" title="Full screen"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg></div>
      </div>

      <div class="tabs" id="simTabs">
        <button class="active" data-tab="objectives">Objectives</button>
        <button data-tab="theory">Theory</button>
        <button data-tab="experiment">Experiment</button>
        <button data-tab="applications">Applications</button>
        <button data-tab="safety">Safety & Facts</button>
        <button data-tab="quiz">Quiz</button>
        <button data-tab="summary">Summary</button>
      </div>

      <div class="tab-panel active" data-panel="objectives">
        <div class="info-block">
          <h3>${ICONS.target} Learning Objectives</h3>
          <ul class="styled">${content.objectives.map(o=>`<li>${o}</li>`).join('')}</ul>
        </div>
        <div class="info-block">
          <h3>${ICONS.lightbulb} Introduction</h3>
          <p style="font-size:15.5px">${content.introduction}</p>
        </div>
      </div>

      <div class="tab-panel" data-panel="theory">
        <div class="card" style="padding:22px">${content.theory}</div>
      </div>

      <div class="tab-panel" data-panel="experiment">
        <div class="lab-layout">
          <div>
            <div class="stage" id="simStage"></div>
            <div class="card playbar" style="margin-top:12px" id="simPlaybar"></div>
          </div>
          <div class="controls-panel" id="simControls"></div>
        </div>
        <div class="card obs-panel" style="margin-top:18px">
          <h4 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);font-weight:800;margin:0 0 10px">Observation Table</h4>
          <div style="overflow-x:auto"><table class="obs-table" id="obsTable"><thead></thead><tbody></tbody></table></div>
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
            <button class="btn btn-secondary btn-sm" id="exportObsBtn">⬇ Export Observations</button>
            <button class="btn btn-tertiary btn-sm" id="clearObsBtn">Clear Table</button>
          </div>
        </div>
      </div>

      <div class="tab-panel" data-panel="applications">
        <div class="info-block">
          <h3>${ICONS.world} Real-life Applications</h3>
          <ul class="styled">${content.applications.map(o=>`<li>${o}</li>`).join('')}</ul>
        </div>
      </div>

      <div class="tab-panel" data-panel="safety">
        <div class="info-block">
          <h3>${ICONS.warn} Safety Guidelines</h3>
          ${content.safety.map(s=>`<div class="safety-card">${s}</div>`).join('')}
        </div>
        <div class="info-block">
          <h3>${ICONS.info} Common Mistakes</h3>
          <ul class="styled">${content.mistakes.map(o=>`<li>${o}</li>`).join('')}</ul>
        </div>
        <div class="info-block">
          <h3>${ICONS.lightbulb} Interesting Facts</h3>
          ${content.facts.map(f=>`<div class="fact-card">💡 ${f}</div>`).join('')}
        </div>
      </div>

      <div class="tab-panel" data-panel="quiz">
        <div class="card" style="padding:22px" id="quizContainer"></div>
      </div>

      <div class="tab-panel" data-panel="summary">
        <div class="card" style="padding:22px">
          <h3>${ICONS.check} Summary</h3>
          <p style="font-size:15.5px">${content.summary}</p>
          <button class="btn btn-primary" id="markDoneBtn" style="margin-top:10px">Mark Simulation Complete ✓</button>
        </div>
      </div>
    `;

    // tab switching
    container.querySelectorAll('#simTabs button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        container.querySelectorAll('#simTabs button').forEach(b=>b.classList.remove('active'));
        container.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
        btn.classList.add('active');
        container.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add('active');
        const order=['objectives','theory','experiment','applications','safety','quiz','summary'];
        const pct = Math.round(((order.indexOf(btn.dataset.tab)+1)/order.length)*90);
        this.markProgress(id, Math.max(this.state.progress[id]||0, pct));
        if(btn.dataset.tab==='experiment' && !this._simMounted){ this.mountSimulation(id); this._simMounted=true; }
      });
    });

    document.getElementById('simBack').addEventListener('click', ()=>this.goHome());
    document.getElementById('simFav').addEventListener('click', ()=>{ this.toggleFavorite(id); this.renderSimView(id); });
    document.getElementById('fullscreenBtn').addEventListener('click', ()=>{
      const stage = document.getElementById('simStage');
      if(stage.requestFullscreen) stage.requestFullscreen();
    });
    document.getElementById('modeToggle').addEventListener('click', (e)=>{
      const b = e.target.closest('button'); if(!b) return;
      container.querySelectorAll('#modeToggle button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      this.teacherMode = b.dataset.mode==='teacher';
      this.toast(this.teacherMode? 'Teacher Mode: extra data & hints enabled' : 'Student Mode');
    });
    document.getElementById('markDoneBtn').addEventListener('click', ()=>{
      this.markProgress(id, 100);
      this.toast('🎉 Great work! Simulation marked complete.');
    });
    document.getElementById('exportObsBtn').addEventListener('click', ()=>this.exportObservations(id));
    document.getElementById('clearObsBtn').addEventListener('click', ()=>{
      document.querySelector('#obsTable tbody').innerHTML='';
      this.toast('Observation table cleared');
    });

    this._simMounted = false;
    this.renderQuiz(id);
    // Pre-mount so the experiment tab is ready instantly too
    this.mountSimulation(id);
    this._simMounted = true;
  },

  mountSimulation(id){
    const mod = window.SIM_MODULES && window.SIM_MODULES[id];
    const stage = document.getElementById('simStage');
    const controls = document.getElementById('simControls');
    const playbar = document.getElementById('simPlaybar');
    if(!mod){ stage.innerHTML = `<div class="empty-state">${ICONS.flask}<p>Simulation module loading…</p></div>`; return; }
    try{
      mod.mount({stage, controls, playbar, api:this.simAPI(id)});
    }catch(err){
      console.error(err);
      stage.innerHTML = `<div class="empty-state">${ICONS.warn}<p>Could not load this simulation.</p></div>`;
    }
  },

  simAPI(id){
    return {
      log: (row)=>this.logObservation(row),
      setHeaders: (heads)=>this.setObsHeaders(heads),
      toast: (m)=>this.toast(m),
      addXP: (n,r)=>this.addXP(n,r),
      teacherMode: ()=>!!this.teacherMode,
      progress: (pct)=>this.markProgress(id, pct),
    };
  },

  setObsHeaders(headers){
    const thead = document.querySelector('#obsTable thead');
    thead.innerHTML = `<tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr>`;
  },
  logObservation(cells){
    const tbody = document.querySelector('#obsTable tbody');
    if(!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = cells.map(c=>`<td>${c}</td>`).join('');
    tbody.prepend(tr);
    while(tbody.children.length>25) tbody.removeChild(tbody.lastChild);
  },
  exportObservations(id){
    const rows = [...document.querySelectorAll('#obsTable tr')].map(tr=>
      [...tr.children].map(td=>td.textContent).join(',')
    ).join('\n');
    if(!rows){ this.toast('No observations to export yet'); return; }
    const blob = new Blob([rows], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${id}-observations.csv`;
    a.click();
    this.toast('Observations exported as CSV');
  },

  renderQuiz(id){
    const content = SIM_CONTENT[id];
    const box = document.getElementById('quizContainer');
    let answered = {};
    box.innerHTML = `<h3>${ICONS.trophy} Mini Quiz — ${content.quiz.length} Questions</h3>` +
      content.quiz.map((q,i)=>`
        <div class="quiz-q" data-qi="${i}">
          <p style="font-weight:700;color:var(--text)">${i+1}. ${q.q}</p>
          ${q.options.map((op,oi)=>`<div class="quiz-opt" data-oi="${oi}">${op}</div>`).join('')}
          <p class="text-sm quiz-explain hidden" style="color:var(--text-muted);margin-top:4px"></p>
        </div>`).join('') +
      `<button class="btn btn-primary" id="quizSubmit" style="margin-top:14px">Submit Quiz</button>
       <p id="quizResult" style="margin-top:10px;font-weight:700"></p>`;

    box.querySelectorAll('.quiz-q').forEach(qEl=>{
      qEl.querySelectorAll('.quiz-opt').forEach(opt=>{
        opt.addEventListener('click', ()=>{
          qEl.querySelectorAll('.quiz-opt').forEach(o=>o.style.outline='none');
          qEl.querySelectorAll('.quiz-opt').forEach(o=>o.classList.remove('selected'));
          opt.style.outline = '2.5px solid var(--primary-blue)';
          answered[qEl.dataset.qi] = parseInt(opt.dataset.oi);
        });
      });
    });

    box.querySelector('#quizSubmit').addEventListener('click', ()=>{
      let correct=0;
      content.quiz.forEach((q,i)=>{
        const qEl = box.querySelector(`.quiz-q[data-qi="${i}"]`);
        const opts = qEl.querySelectorAll('.quiz-opt');
        opts.forEach((o,oi)=>{
          o.classList.remove('correct','wrong');
          if(oi===q.correct) o.classList.add('correct');
          else if(answered[i]===oi) o.classList.add('wrong');
        });
        qEl.querySelector('.quiz-explain').textContent = 'ℹ ' + q.explain;
        qEl.querySelector('.quiz-explain').classList.remove('hidden');
        if(answered[i]===q.correct) correct++;
      });
      const total = content.quiz.length;
      box.querySelector('#quizResult').textContent = `You scored ${correct} / ${total} — ${correct===total?'Perfect! 🎉':'keep practising!'}`;
      this.recordQuiz(id, correct, total);
      this.addXP(correct*10, 'Quiz score');
      this.markProgress(id, Math.max(this.state.progress[id]||0, 95));
    });
  },

  /* ---------------- TOOL VIEW dispatch (see js/tools.js) ---------------- */
  renderToolView(id){
    if(window.Tools && window.Tools[id]) window.Tools[id](document.getElementById('toolView'), this);
  },
};

window.App = App;
