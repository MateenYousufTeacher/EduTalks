/* =========================================================
   VIRTUAL PHYSICS LABORATORY — CORE APP FRAMEWORK
   Vanilla JS. No frameworks, no external libraries.
   ========================================================= */

window.SIM_REGISTRY = []; // each sim file pushes {id,num,title,short,category,icon,mount}

const VPL = (() => {

  /* ---------------- STORAGE ---------------- */
  const KEY = 'vpl_state_v1';
  function loadState(){
    try{
      const raw = localStorage.getItem(KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    return {
      theme:'light', sound:true, reducedMotion:false,
      favorites:{}, progress:{}, xp:0, notes:{}, recents:[],
      quizBest:{}
    };
  }
  let state = loadState();
  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

  /* ---------------- SOUND ---------------- */
  let actx;
  function beep(freq=520, dur=.08, type='sine', vol=.05){
    if(!state.sound) return;
    try{
      actx = actx || new (window.AudioContext||window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g); g.connect(actx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime+dur);
      o.stop(actx.currentTime+dur+.02);
    }catch(e){}
  }

  /* ---------------- TOAST ---------------- */
  function toast(msg){
    let t = document.getElementById('vpl-toast');
    if(!t){
      t = document.createElement('div');
      t.id = 'vpl-toast'; t.className='toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(()=>t.classList.remove('show'), 2200);
  }

  /* ---------------- THEME ---------------- */
  function applyTheme(){
    document.documentElement.setAttribute('data-theme', state.theme);
    document.body.classList.toggle('reduced-motion', !!state.reducedMotion);
  }

  /* ---------------- PROGRESS / XP ---------------- */
  function markProgress(simId, pct){
    state.progress[simId] = Math.max(state.progress[simId]||0, pct);
    save();
  }
  function addXP(n){
    state.xp += n; save();
    toast(`+${n} XP earned!`);
    beep(700,.1,'triangle',.06);
  }
  function toggleFav(simId){
    state.favorites[simId] = !state.favorites[simId];
    save();
    return state.favorites[simId];
  }
  function pushRecent(simId){
    state.recents = state.recents.filter(x=>x!==simId);
    state.recents.unshift(simId);
    state.recents = state.recents.slice(0,6);
    save();
  }

  /* ---------------- ROUTER ---------------- */
  const routes = {};
  function route(path, fn){ routes[path]=fn; }
  function go(hash){ window.location.hash = hash; }
  function renderRoute(){
    const hash = window.location.hash.replace('#','') || 'home';
    const [name, arg] = hash.split('/');
    const view = document.getElementById('view');
    view.scrollTop = 0;
    window.scrollTo(0,0);
    setActiveNav(name);
    if(routes[name]) routes[name](view, arg);
    else routes['home'](view);
  }
  function setActiveNav(name){
    document.querySelectorAll('.navrail button, .bottomnav button').forEach(b=>{
      b.classList.toggle('active', b.dataset.route === name);
    });
  }

  /* ---------------- ICONS (inline SVG, outline style) ---------------- */
  const ICONS = {
    flask:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6.2L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9.2V3"/><path d="M7.5 15h9"/></svg>`,
    home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`,
    grid:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    star:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.8 5.9 21l1.5-6.8-5.2-4.7 6.9-.7z"/></svg>`,
    book:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 19H6.5A2.5 2.5 0 0 0 4 21.5"/></svg>`,
    sigma:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 4H6l7 8-7 8h12"/></svg>`,
    ruler:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="10" rx="1.5" transform="rotate(0)"/><path d="M7 7v3M11 7v4M15 7v3M19 7v4"/></svg>`,
    quiz:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1.5 1-1.5 2.2"/><path d="M12 17h.01"/></svg>`,
    trophy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5H4v2a4 4 0 0 0 4 4"/><path d="M16 5h4v2a4 4 0 0 1-4 4"/><path d="M12 13v3m-3 4h6m-3-4v4"/></svg>`,
    settings:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8h-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3h-.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H2a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.6V2a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.6 1H22a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z"/></svg>`,
    info:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>`,
    search:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
    sun:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
    moon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>`,
    back:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
    play:`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    pause:`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>`,
    reset:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 2.6 6.4"/><path d="M3 20v-6h6"/></svg>`,
    step:`<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5v14l9-7z"/><rect x="16" y="5" width="3" height="14"/></svg>`,
    dice:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>`,
    fullscreen:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m0 8v3a2 2 0 0 0 2 2h3m8-18h3a2 2 0 0 1 2 2v3m0 8v3a2 2 0 0 1-2 2h-3"/></svg>`,
    camera:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>`,
    download:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16"/></svg>`,
    grad:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9 12 4l10 5-10 5z"/><path d="M6 11v5c0 1.6 2.7 3 6 3s6-1.4 6-3v-5"/></svg>`
  };

  /* ---------------- SHARED: TABS BUILDER ---------------- */
  function buildTabs(container, tabs, defaultId){
    const bar = document.createElement('div'); bar.className='tabbar';
    const panels = document.createElement('div'); panels.className='tabpanels-wrap';
    tabs.forEach(t=>{
      const b = document.createElement('button');
      b.textContent = t.label;
      b.dataset.tab = t.id;
      if(t.id===defaultId) b.classList.add('active');
      b.onclick = ()=>{
        bar.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        panels.querySelectorAll('.tabpanel').forEach(p=>p.classList.add('hidden-tab'));
        panels.querySelector(`[data-panel="${t.id}"]`).classList.remove('hidden-tab');
        beep(420,.05);
      };
      bar.appendChild(b);
    });
    container.appendChild(bar);
    container.appendChild(panels);
    // Panels must be attached to the live DOM tree *before* render() runs,
    // so canvases inside them can correctly read clientWidth/clientHeight.
    tabs.forEach(t=>{
      const p = document.createElement('div');
      p.className='tabpanel' + (t.id===defaultId ? '' : ' hidden-tab');
      p.dataset.panel = t.id;
      panels.appendChild(p);
      t.render(p);
    });
  }

  /* ---------------- SHARED: GRAPH (canvas line plot) ---------------- */
  class Graph{
    constructor(canvas, opts={}){
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.series = opts.series || [{name:'v', color:'#1976D2', data:[]}];
      this.xlabel = opts.xlabel || 'Time (s)';
      this.ylabel = opts.ylabel || 'Value';
      this.maxPoints = opts.maxPoints || 200;
      this.fitDPR();
    }
    fitDPR(){
      const c = this.canvas;
      const rect = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio||1;
      const w = rect.width || 400, h = rect.height || 220;
      c.width = w*dpr; c.height = h*dpr;
      this.ctx.setTransform(dpr,0,0,dpr,0,0);
      this.w = w; this.h = h;
    }
    push(vals){ // vals: array matching series order
      this.series.forEach((s,i)=>{
        s.data.push(vals[i]);
        if(s.data.length>this.maxPoints) s.data.shift();
      });
    }
    reset(){ this.series.forEach(s=>s.data=[]); }
    draw(){
      this.fitDPR();
      const {ctx,w,h} = this;
      ctx.clearRect(0,0,w,h);
      const pad = {l:42,r:14,t:14,b:28};
      const plotW = w-pad.l-pad.r, plotH = h-pad.t-pad.b;
      const isDark = document.documentElement.getAttribute('data-theme')==='dark';
      ctx.strokeStyle = isDark? 'rgba(255,255,255,.12)':'rgba(13,71,161,.15)';
      ctx.fillStyle = isDark? '#9AACC4':'#5B6472';
      ctx.font='10px sans-serif';
      // gather range
      let allVals = [];
      this.series.forEach(s=>allVals=allVals.concat(s.data));
      let minV = Math.min(0,...allVals), maxV = Math.max(1,...allVals);
      if(minV===maxV){minV-=1;maxV+=1;}
      const pad10 = (maxV-minV)*0.1; minV-=pad10; maxV+=pad10;
      const n = Math.max(this.series[0]?.data.length||0, 2);
      // grid
      ctx.beginPath();
      for(let i=0;i<=4;i++){
        const y = pad.t + plotH*i/4;
        ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y);
        const val = maxV - (maxV-minV)*i/4;
        ctx.fillText(val.toFixed(1), 4, y+3);
      }
      ctx.stroke();
      // axes labels
      ctx.save();
      ctx.translate(10, pad.t+plotH/2);
      ctx.rotate(-Math.PI/2);
      ctx.textAlign='center';
      ctx.fillText(this.ylabel,0,0);
      ctx.restore();
      ctx.textAlign='center';
      ctx.fillText(this.xlabel, pad.l+plotW/2, h-6);
      // series
      this.series.forEach(s=>{
        if(s.data.length<2) return;
        ctx.beginPath();
        ctx.strokeStyle = s.color; ctx.lineWidth=2;
        s.data.forEach((v,i)=>{
          const x = pad.l + plotW * (i/(this.maxPoints-1));
          const y = pad.t + plotH * (1-(v-minV)/(maxV-minV));
          i===0? ctx.moveTo(x,y): ctx.lineTo(x,y);
        });
        ctx.stroke();
      });
      // legend
      let lx = pad.l+6;
      this.series.forEach(s=>{
        ctx.fillStyle=s.color; ctx.fillRect(lx,pad.t-2,8,8);
        ctx.fillStyle = isDark? '#EAF0FA':'#212121';
        ctx.fillText(s.name, lx+12, pad.t+6);
        lx += ctx.measureText(s.name).width+34;
      });
    }
  }

  /* ---------------- SHARED: OBSERVATION TABLE ---------------- */
  class ObsTable{
    constructor(container, columns){
      this.columns = columns;
      this.rows = [];
      this.wrap = document.createElement('div'); this.wrap.className='table-wrap';
      container.appendChild(this.wrap);
      this.render();
    }
    addRow(row){ this.rows.push(row); this.render(); }
    clear(){ this.rows=[]; this.render(); }
    render(){
      let html = `<table class="obs"><thead><tr>${this.columns.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>`;
      if(this.rows.length===0){
        html += `<tr><td colspan="${this.columns.length}" style="color:var(--text-soft);padding:16px;">No observations logged yet — run the experiment.</td></tr>`;
      }else{
        this.rows.forEach(r=>{ html += `<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`; });
      }
      html += `</tbody></table>`;
      this.wrap.innerHTML = html;
    }
    toCSV(){
      const lines = [this.columns.join(',')].concat(this.rows.map(r=>r.join(',')));
      return lines.join('\n');
    }
  }
  function exportCSV(filename, csv){
    const blob = new Blob([csv], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    a.click();
    toast('Observations exported ✓');
  }
  function screenshotCanvas(canvas, filename){
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = filename;
    a.click();
    toast('Screenshot saved ✓');
  }

  /* ---------------- SHARED: QUIZ ---------------- */
  function buildQuiz(container, simId, questions){
    let idx=0, score=0, answered=false;
    const wrap = document.createElement('div');
    container.appendChild(wrap);
    function renderQ(){
      answered=false;
      wrap.innerHTML='';
      if(idx>=questions.length){
        const pct = Math.round(score/questions.length*100);
        state.quizBest[simId] = Math.max(state.quizBest[simId]||0, pct);
        save();
        markProgress(simId, Math.max(state.progress[simId]||0, pct));
        wrap.innerHTML = `
          <div class="quiz-score">${score}/${questions.length}</div>
          <p style="text-align:center;">${pct>=70? '🎉 Excellent work! Certificate unlocked.':'Keep practicing — review the theory tab and try again.'}</p>
          <div style="text-align:center;"><button class="stage-toolbar" style="display:inline-flex" id="retryBtn">↺ Retry Quiz</button></div>`;
        if(pct>=70) addXP(50); else addXP(10);
        wrap.querySelector('#retryBtn').onclick=()=>{idx=0;score=0;renderQ();};
        return;
      }
      const q = questions[idx];
      const box = document.createElement('div'); box.className='quiz-q';
      box.innerHTML = `<p class="qtext">Q${idx+1}. ${q.q}</p>`;
      q.options.forEach((opt,i)=>{
        const b = document.createElement('button');
        b.className='quiz-opt'; b.textContent = opt;
        b.onclick=()=>{
          if(answered) return; answered=true;
          const correct = i===q.answer;
          if(correct){score++; beep(760,.12,'triangle',.07);} else beep(180,.15,'sawtooth',.06);
          [...box.querySelectorAll('.quiz-opt')].forEach((el,j)=>{
            if(j===q.answer) el.classList.add('correct');
            else if(j===i) el.classList.add('wrong');
          });
          const exp = document.createElement('p');
          exp.style.cssText='margin-top:8px;font-size:.82rem;color:var(--text-soft);';
          exp.textContent = q.explain||'';
          box.appendChild(exp);
          const nextBtn = document.createElement('button');
          nextBtn.className='stage-toolbar primary';
          nextBtn.style.marginTop='10px';
          nextBtn.textContent = idx===questions.length-1? 'See Results':'Next Question →';
          nextBtn.onclick=()=>{idx++; renderQ();};
          box.appendChild(nextBtn);
        };
        box.appendChild(b);
      });
      wrap.appendChild(box);
    }
    renderQ();
  }

  return {
    state, save, beep, toast, applyTheme, markProgress, addXP, toggleFav, pushRecent,
    route, go, renderRoute, ICONS, buildTabs, Graph, ObsTable, exportCSV, screenshotCanvas, buildQuiz
  };
})();

/* =========================================================
   VIEWS
   ========================================================= */

function simIcon(id){
  const map = {
    motion: VPL.ICONS.grid, newton:VPL.ICONS.sigma, friction:VPL.ICONS.settings,
    gravity: VPL.ICONS.flask, energy: VPL.ICONS.trophy, pressure: VPL.ICONS.flask,
    heat: VPL.ICONS.sun, optics: VPL.ICONS.info, circuit: VPL.ICONS.grid, magnetism: VPL.ICONS.star
  };
  return map[id]||VPL.ICONS.flask;
}

function simCardHTML(sim){
  const pct = VPL.state.progress[sim.id]||0;
  const isFav = !!VPL.state.favorites[sim.id];
  return `
  <div class="sim-card" data-open="${sim.id}">
    <div class="thumb" style="background:${sim.gradient||''}">
      <span class="num">${String(sim.num).padStart(2,'0')}</span>
      <button class="fav ${isFav?'active':''}" data-fav="${sim.id}" aria-label="Toggle favorite">★</button>
      ${sim.iconSVG||''}
    </div>
    <div class="body">
      <h3>${sim.title}</h3>
      <p>${sim.short}</p>
      <div class="progress-bar"><div style="width:${pct}%"></div></div>
      <div class="meta"><span>${pct}% complete</span><span class="chip">${sim.category}</span></div>
    </div>
  </div>`;
}

function wireSimCards(root){
  root.querySelectorAll('[data-open]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      if(e.target.closest('[data-fav]')) return;
      VPL.go('sim/'+el.dataset.open);
    });
  });
  root.querySelectorAll('[data-fav]').forEach(el=>{
    el.addEventListener('click', (e)=>{
      e.stopPropagation();
      const active = VPL.toggleFav(el.dataset.fav);
      el.classList.toggle('active', active);
      VPL.beep(active?680:300,.08);
    });
  });
}

VPL.route('home', (view)=>{
  const totalDone = Object.values(VPL.state.progress).filter(p=>p>=100).length;
  const avgPct = Math.round(Object.values(VPL.state.progress).reduce((a,b)=>a+b,0) / (SIM_REGISTRY.length*100) *100) || 0;
  view.innerHTML = `
    <div class="home-hero">
      <h1>Virtual Physics Laboratory</h1>
      <p>Explore Physics through Interactive Experiments — move sliders, change variables, and watch real physics unfold instantly.</p>
      <div class="stat-row">
        <div class="stat"><b>${SIM_REGISTRY.length}</b><span>Simulations</span></div>
        <div class="stat"><b>${totalDone}</b><span>Completed</span></div>
        <div class="stat"><b>${VPL.state.xp}</b><span>XP Points</span></div>
        <div class="stat"><b>${avgPct}%</b><span>Overall Progress</span></div>
      </div>
    </div>

    <div class="section-title"><h2>Continue Exploring</h2></div>
    <div class="grid-cards" id="recentGrid"></div>

    <div class="section-title"><h2>All Simulations</h2><a href="#sims">View all →</a></div>
    <div class="grid-cards" id="allGrid"></div>
  `;
  const recents = VPL.state.recents.length ? VPL.state.recents : SIM_REGISTRY.slice(0,3).map(s=>s.id);
  const recentGrid = view.querySelector('#recentGrid');
  recentGrid.innerHTML = recents.map(id=>simCardHTML(SIM_REGISTRY.find(s=>s.id===id))).join('') ||
    `<div class="empty-state">Start your first experiment!</div>`;
  view.querySelector('#allGrid').innerHTML = SIM_REGISTRY.map(simCardHTML).join('');
  wireSimCards(view);
});

VPL.route('sims', (view)=>{
  view.innerHTML = `
    <div class="section-title"><h2>All Simulations</h2></div>
    <div class="grid-cards" id="simsGrid"></div>`;
  view.querySelector('#simsGrid').innerHTML = SIM_REGISTRY.map(simCardHTML).join('');
  wireSimCards(view);
});

VPL.route('favorites', (view)=>{
  const favs = SIM_REGISTRY.filter(s=>VPL.state.favorites[s.id]);
  view.innerHTML = `
    <div class="section-title"><h2>Your Favorites</h2></div>
    <div class="grid-cards" id="favGrid">${favs.length? favs.map(simCardHTML).join('') :
      `<div class="empty-state">${VPL.ICONS.star}<p>No favorites yet. Tap the ★ on any simulation to save it here.</p></div>`}</div>`;
  wireSimCards(view);
});

VPL.route('achievements', (view)=>{
  const level = Math.floor(VPL.state.xp/100)+1;
  const badges = [
    {name:'First Experiment', got: Object.keys(VPL.state.progress).length>0},
    {name:'Curious Mind (3 sims tried)', got: Object.keys(VPL.state.progress).length>=3},
    {name:'Physics Explorer (all 10 tried)', got: Object.keys(VPL.state.progress).length>=10},
    {name:'Quiz Ace (80%+ on any quiz)', got: Object.values(VPL.state.quizBest).some(v=>v>=80)},
    {name:'Physics Master (100 XP)', got: VPL.state.xp>=100},
    {name:'Grand Scholar (500 XP)', got: VPL.state.xp>=500},
  ];
  view.innerHTML = `
    <div class="panel" style="text-align:center;">
      <div style="font-size:.8rem;color:var(--text-soft);text-transform:uppercase;letter-spacing:.1em;font-weight:700;">Current Rank</div>
      <div style="font-family:var(--font-display);font-size:2.2rem;font-weight:800;background:var(--grad-accent);-webkit-background-clip:text;background-clip:text;color:transparent;">Level ${level} Physicist</div>
      <div class="progress-bar" style="max-width:360px;margin:10px auto;"><div style="width:${VPL.state.xp%100}%"></div></div>
      <p>${VPL.state.xp} XP total · ${100-(VPL.state.xp%100)} XP to next level</p>
    </div>
    <div class="section-title"><h2>Badges</h2></div>
    <div class="grid-cards">
      ${badges.map(b=>`
        <div class="panel" style="text-align:center;opacity:${b.got?1:.4}">
          <div style="width:56px;height:56px;border-radius:50%;background:${b.got?'var(--grad-amber)':'var(--light-blue)'};display:flex;align-items:center;justify-content:center;margin:0 auto 10px;color:${b.got?'#3a2400':'var(--text-soft)'};">${VPL.ICONS.trophy}</div>
          <h3 style="font-size:.9rem;margin:0;">${b.name}</h3>
          <p style="font-size:.75rem;">${b.got?'Unlocked':'Locked'}</p>
        </div>`).join('')}
    </div>`;
});

/* ---- GLOSSARY ---- */
const GLOSSARY = [
  ['Acceleration','The rate of change of velocity with time. SI unit: m/s².'],
  ['Velocity','The rate of change of displacement with time; a vector quantity with magnitude and direction.'],
  ['Inertia','The tendency of an object to resist a change in its state of motion.'],
  ['Force','A push or pull that can change an object\u2019s motion. SI unit: newton (N).'],
  ['Friction','A resistive force that opposes relative motion between two surfaces in contact.'],
  ['Normal Force','The perpendicular contact force exerted by a surface on an object resting on it.'],
  ['Free Fall','Motion of a body under gravity alone, with no other forces (like air resistance) acting on it.'],
  ['Terminal Velocity','The constant maximum velocity reached by a falling object when air resistance balances gravity.'],
  ['Work','Energy transferred when a force moves an object through a distance. W = F·d·cosθ.'],
  ['Power','The rate of doing work. SI unit: watt (W).'],
  ['Kinetic Energy','Energy possessed by a body due to its motion: KE = ½mv².'],
  ['Potential Energy','Energy stored due to position or configuration: PE = mgh (gravitational).'],
  ['Pressure','Force applied per unit area. SI unit: pascal (Pa).'],
  ['Buoyancy','The upward force exerted by a fluid on a submerged or floating object.'],
  ['Archimedes\u2019 Principle','A body submerged in a fluid experiences an upthrust equal to the weight of fluid displaced.'],
  ['Density','Mass per unit volume of a substance. SI unit: kg/m³.'],
  ['Conduction','Transfer of heat through direct molecular contact, without bulk movement of matter.'],
  ['Convection','Transfer of heat through the bulk movement of a fluid (liquid or gas).'],
  ['Radiation','Transfer of heat via electromagnetic waves, requiring no medium.'],
  ['Reflection','The bouncing back of light when it strikes a polished surface like a mirror.'],
  ['Refraction','The bending of light as it passes from one transparent medium to another.'],
  ['Focal Length','The distance between the pole of a mirror/lens and its principal focus.'],
  ['Magnification','The ratio of image size (or height) to object size (or height).'],
  ['Current','The rate of flow of electric charge. SI unit: ampere (A).'],
  ['Resistance','Opposition offered by a conductor to the flow of current. SI unit: ohm (Ω).'],
  ['Ohm\u2019s Law','V = IR — potential difference equals current multiplied by resistance, at constant temperature.'],
  ['Magnetic Field','A region of space around a magnet or current-carrying conductor where magnetic force can be felt.'],
  ['Electromagnetic Induction','The generation of an electric current in a conductor due to a changing magnetic field.'],
];
VPL.route('glossary', (view)=>{
  view.innerHTML = `
    <div class="section-title"><h2>Physics Glossary</h2></div>
    <div class="panel"><input id="glossSearch" placeholder="Search a term..." style="width:100%;padding:10px 14px;border-radius:12px;border:1px solid var(--border);background:var(--surface);color:var(--text);"></div>
    <div class="panel" id="glossList"></div>`;
  function renderList(filter=''){
    const items = GLOSSARY.filter(([t,d])=>t.toLowerCase().includes(filter.toLowerCase()));
    view.querySelector('#glossList').innerHTML = items.map(([t,d])=>`
      <div class="glossary-item"><h4>${t}</h4><p>${d}</p></div>`).join('') || `<p>No terms found.</p>`;
  }
  renderList();
  view.querySelector('#glossSearch').addEventListener('input', e=>renderList(e.target.value));
});

/* ---- FORMULA SHEET ---- */
const FORMULAS = [
  ['Motion','v = u + at','u = initial velocity, a = acceleration, t = time','m/s'],
  ['Motion','s = ut + ½at²','s = displacement','m'],
  ['Motion','v² = u² + 2as','—','m²/s²'],
  ['Newton\u2019s Laws','F = ma','F = net force, m = mass, a = acceleration','N'],
  ['Friction','f = μN','μ = coefficient of friction, N = normal force','N'],
  ['Gravity','h = ½gt²','g = acceleration due to gravity','m'],
  ['Work & Energy','W = Fd cosθ','θ = angle between force & displacement','J'],
  ['Work & Energy','KE = ½mv²','—','J'],
  ['Work & Energy','PE = mgh','—','J'],
  ['Work & Energy','P = W/t','—','W'],
  ['Pressure','P = F/A','—','Pa'],
  ['Buoyancy','F_b = ρ_fluid × V × g','ρ = density, V = displaced volume','N'],
  ['Heat','Q = mcΔT','c = specific heat capacity','J'],
  ['Heat','Q/t = kAΔT/d','k = thermal conductivity','W'],
  ['Optics','1/f = 1/v + 1/u','Mirror/lens formula','1/m'],
  ['Optics','m = -v/u = h\u2032/h','Magnification','—'],
  ['Electricity','V = IR','Ohm\u2019s Law','V'],
  ['Electricity','P = VI','Electrical power','W'],
  ['Magnetism','B = μ₀μᵣnI','Solenoid field','T'],
];
VPL.route('formulas', (view)=>{
  const chapters = [...new Set(FORMULAS.map(f=>f[0]))];
  view.innerHTML = `<div class="section-title"><h2>Formula Handbook</h2></div>` +
    chapters.map(ch=>`
      <div class="panel"><h3>${ch}</h3>
        ${FORMULAS.filter(f=>f[0]===ch).map(f=>`
          <div class="formula-card">
            <div class="eq">${f[1]}</div>
            <p style="margin:4px 0 0;font-size:.8rem;">${f[2]} ${f[3]!=='—'?`· SI unit: ${f[3]}`:''}</p>
          </div>`).join('')}
      </div>`).join('');
});

/* ---- UNIT CONVERTER ---- */
const UNIT_GROUPS = {
  Length:{m:1, km:1000, cm:0.01, mm:0.001, mile:1609.34, foot:0.3048, inch:0.0254},
  Mass:{kg:1, g:0.001, tonne:1000, pound:0.453592, ounce:0.0283495},
  Time:{s:1, min:60, hour:3600, day:86400},
  Force:{N:1, kN:1000, dyne:0.00001, 'lbf':4.44822},
  Pressure:{Pa:1, kPa:1000, atm:101325, bar:100000, mmHg:133.322},
  Energy:{J:1, kJ:1000, cal:4.184, kcal:4184, kWh:3600000},
  Power:{W:1, kW:1000, hp:745.7},
  Area:{'m²':1, 'cm²':0.0001, 'km²':1000000, 'hectare':10000},
  Volume:{'m³':1, litre:0.001, 'cm³':0.000001, gallon:0.00378541},
  Temperature:null // special
};
VPL.route('units', (view)=>{
  view.innerHTML = `
    <div class="section-title"><h2>SI Unit Converter</h2></div>
    <div class="panel">
      <label>Category</label>
      <select id="ucCat">${Object.keys(UNIT_GROUPS).map(g=>`<option>${g}</option>`).join('')}</select>
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:end;margin-top:16px;">
        <div><label>From</label><input id="ucFromVal" type="number" value="1" style="width:100%;padding:9px;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);"><select id="ucFromUnit" style="width:100%;margin-top:6px;"></select></div>
        <div style="text-align:center;font-size:1.4rem;color:var(--primary-blue);">→</div>
        <div><label>To</label><input id="ucToVal" readonly style="width:100%;padding:9px;border-radius:10px;border:1px solid var(--border);background:var(--light-blue);color:var(--text);font-weight:700;"><select id="ucToUnit" style="width:100%;margin-top:6px;"></select></div>
      </div>
    </div>`;
  const cat = view.querySelector('#ucCat'), fu = view.querySelector('#ucFromUnit'), tu = view.querySelector('#ucToUnit');
  const fv = view.querySelector('#ucFromVal'), tv = view.querySelector('#ucToVal');
  function populate(){
    const g = UNIT_GROUPS[cat.value];
    if(g){
      const units = Object.keys(g);
      fu.innerHTML = units.map(u=>`<option>${u}</option>`).join('');
      tu.innerHTML = units.map((u,i)=>`<option ${i===1?'selected':''}>${u}</option>`).join('');
    }else{
      fu.innerHTML = `<option>°C</option><option>°F</option><option>K</option>`;
      tu.innerHTML = `<option>°C</option><option>°F</option><option selected>K</option>`;
    }
    convert();
  }
  function toKelvin(v,u){ return u==='°C'? v+273.15 : u==='°F'? (v-32)*5/9+273.15 : v; }
  function fromKelvin(v,u){ return u==='°C'? v-273.15 : u==='°F'? (v-273.15)*9/5+32 : v; }
  function convert(){
    const g = UNIT_GROUPS[cat.value];
    const val = parseFloat(fv.value)||0;
    if(g){
      const base = val * g[fu.value];
      tv.value = (base / g[tu.value]).toPrecision(6);
    }else{
      tv.value = fromKelvin(toKelvin(val, fu.value), tu.value).toPrecision(6);
    }
  }
  [cat].forEach(el=>el.addEventListener('change', populate));
  [fu,tu,fv].forEach(el=>el.addEventListener('input', convert));
  [fu,tu].forEach(el=>el.addEventListener('change', convert));
  populate();
});

/* ---- QUIZ HUB ---- */
VPL.route('quizhub', (view)=>{
  view.innerHTML = `<div class="section-title"><h2>Quiz Center</h2></div>
    <div class="grid-cards">
      ${SIM_REGISTRY.map(s=>`
        <div class="panel">
          <h3 style="margin:0 0 6px;">${s.title}</h3>
          <p style="font-size:.82rem;">Best score: <b>${VPL.state.quizBest[s.id]||0}%</b></p>
          <button class="stage-toolbar primary" data-go="${s.id}" style="display:inline-flex;">Take Quiz →</button>
        </div>`).join('')}
    </div>`;
  view.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>VPL.go('sim/'+b.dataset.go+'?tab=quiz'));
});

/* ---- SETTINGS ---- */
VPL.route('settings', (view)=>{
  view.innerHTML = `
    <div class="section-title"><h2>Settings</h2></div>
    <div class="panel">
      <div class="settings-row"><div><b>Dark Mode</b><p style="margin:2px 0 0;">Switch between light and dark themes.</p></div><button class="switch ${VPL.state.theme==='dark'?'on':''}" id="stTheme"></button></div>
      <div class="settings-row"><div><b>Sound Effects</b><p style="margin:2px 0 0;">Soft UI sounds for interactions.</p></div><button class="switch ${VPL.state.sound?'on':''}" id="stSound"></button></div>
      <div class="settings-row"><div><b>Reduced Motion</b><p style="margin:2px 0 0;">Minimize animations for comfort & accessibility.</p></div><button class="switch ${VPL.state.reducedMotion?'on':''}" id="stMotion"></button></div>
      <div class="settings-row"><div><b>High Contrast Mode</b><p style="margin:2px 0 0;">Increase contrast for better readability.</p></div><button class="switch ${VPL.state.highContrast?'on':''}" id="stContrast"></button></div>
    </div>
    <div class="panel">
      <h3>Data</h3>
      <div class="settings-row"><div><b>Reset All Progress</b><p style="margin:2px 0 0;">Clears XP, badges, favorites and quiz scores.</p></div><button class="stage-toolbar" id="stReset">Reset</button></div>
    </div>`;
  view.querySelector('#stTheme').onclick=(e)=>{
    VPL.state.theme = VPL.state.theme==='dark'?'light':'dark'; VPL.save(); VPL.applyTheme();
    e.target.classList.toggle('on');
  };
  view.querySelector('#stSound').onclick=(e)=>{ VPL.state.sound=!VPL.state.sound; VPL.save(); e.target.classList.toggle('on'); VPL.beep(600,.08);};
  view.querySelector('#stMotion').onclick=(e)=>{ VPL.state.reducedMotion=!VPL.state.reducedMotion; VPL.save(); VPL.applyTheme(); e.target.classList.toggle('on');};
  view.querySelector('#stContrast').onclick=(e)=>{
    VPL.state.highContrast=!VPL.state.highContrast; VPL.save();
    document.body.classList.toggle('high-contrast', VPL.state.highContrast);
    e.target.classList.toggle('on');
  };
  view.querySelector('#stReset').onclick=()=>{
    if(confirm('Reset all progress, XP and favorites? This cannot be undone.')){
      localStorage.removeItem('vpl_state_v1');
      location.reload();
    }
  };
});

/* ---- ABOUT / DEVELOPER ---- */
VPL.route('about', (view)=>{
  view.innerHTML = `
    <div class="panel about-hero">
      <img src="images/developer.jpg" alt="Dr. Mateen Yousuf">
      <div>
        <h2>Dr. Mateen Yousuf</h2>
        <div class="role">Teacher · School Education Department, Kashmir</div>
        <p style="margin-top:8px;max-width:520px;">Creator of the Virtual Physics Laboratory — a free, offline-first simulation platform built to bring inquiry-based, experiential science learning to every classroom, regardless of internet access.</p>
      </div>
    </div>
    <div class="panel">
      <h3>Vision Behind the Project</h3>
      <p>Physics is best understood by doing, not memorizing. Many classrooms lack access to expensive lab equipment or reliable internet. This app was built so that any student, in any school, on any low-end device, can explore genuine cause-and-effect physics experiments — offline, for free, forever.</p>
    </div>
    <div class="panel">
      <h3>Pedagogical Foundations</h3>
      <div class="pillar"><div class="dot">${VPL.ICONS.grad}</div><div><b>NEP 2020 Alignment</b><p>Supports experiential, competency-based learning over rote memorization, as envisioned in the National Education Policy 2020.</p></div></div>
      <div class="pillar"><div class="dot">${VPL.ICONS.sigma}</div><div><b>Competency-Based Learning</b><p>Every simulation targets measurable learning outcomes — prediction, observation, and scientific reasoning.</p></div></div>
      <div class="pillar"><div class="dot">${VPL.ICONS.flask}</div><div><b>Inquiry-Based Learning</b><p>Students form hypotheses, test them by changing variables, and draw their own conclusions from real data.</p></div></div>
      <div class="pillar"><div class="dot">${VPL.ICONS.book}</div><div><b>Constructivist Pedagogy</b><p>Knowledge is built actively through exploration, not delivered passively — learners construct understanding through direct experience.</p></div></div>
      <div class="pillar"><div class="dot">${VPL.ICONS.star}</div><div><b>Scientific Temper</b><p>Cultivates curiosity, evidence-based reasoning and a lifelong habit of questioning and experimenting.</p></div></div>
    </div>
    <div class="panel" style="text-align:center;">
      <p style="margin:0;">Virtual Physics Laboratory — Master Template for the Virtual Simulations Series</p>
      <p style="margin:2px 0 0;font-size:.78rem;">Version 1.0 · 100% Offline · Built with HTML5, CSS3 & Vanilla JavaScript</p>
    </div>`;
});

/* =========================================================
   SIMULATION PAGE SHELL
   ========================================================= */
VPL.route('sim', (view, arg)=>{
  const [id, query] = (arg||'').split('?');
  const sim = SIM_REGISTRY.find(s=>s.id===id);
  if(!sim){ view.innerHTML = `<div class="empty-state">Simulation not found.</div>`; return; }
  VPL.pushRecent(id);
  const isFav = !!VPL.state.favorites[id];
  view.innerHTML = `
    <div class="sim-header">
      <button class="back-btn" id="backBtn">${VPL.ICONS.back} Back</button>
      <h1>${String(sim.num).padStart(2,'0')} · ${sim.title}</h1>
      <button class="icon-btn" id="favBtn" title="Toggle favorite" style="color:${isFav?'var(--amber)':'inherit'}">★</button>
      <button class="icon-btn" id="fsBtn" title="Fullscreen">${VPL.ICONS.fullscreen}</button>
    </div>
    <div id="simRoot"></div>
  `;
  view.querySelector('#backBtn').onclick = ()=>VPL.go('sims');
  view.querySelector('#favBtn').onclick = (e)=>{
    const active = VPL.toggleFav(id);
    e.target.style.color = active? 'var(--amber)':'inherit';
    VPL.beep(active?680:300,.08);
  };
  view.querySelector('#fsBtn').onclick = ()=>{
    const el = view.querySelector('#simRoot');
    if(!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  sim.mount(view.querySelector('#simRoot'));
  if(query==='tab=quiz'){
    setTimeout(()=>{ view.querySelector('.tabbar button[data-tab="quiz"]')?.click(); },50);
  }
});

/* =========================================================
   SPLASH SCREEN CANVAS (particles / light rays)
   ========================================================= */
function initSplash(){
  const canvas = document.getElementById('splashCanvas');
  const ctx = canvas.getContext('2d');
  let w,h,particles=[];
  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize(); window.addEventListener('resize', resize);
  const symbols = ['⚛','∑','⚡','∞','ƒ','Δ','π'];
  for(let i=0;i<46;i++){
    particles.push({
      x:Math.random()*w, y:Math.random()*h,
      r:Math.random()*2+0.6,
      vy:Math.random()*0.3+0.08,
      vx:(Math.random()-0.5)*0.15,
      sym: Math.random()>0.85? symbols[Math.floor(Math.random()*symbols.length)] : null,
      alpha:Math.random()*0.5+0.15,
      size: Math.random()*18+12
    });
  }
  let raf;
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.y -= p.vy; p.x += p.vx;
      if(p.y<-20){p.y=h+20; p.x=Math.random()*w;}
      ctx.globalAlpha = p.alpha;
      if(p.sym){
        ctx.fillStyle='#8FE3F5'; ctx.font=`${p.size}px sans-serif`;
        ctx.fillText(p.sym, p.x, p.y);
      }else{
        ctx.fillStyle='#ffffff';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      }
    });
    ctx.globalAlpha=1;
    raf = requestAnimationFrame(draw);
  }
  draw();
  return ()=>{cancelAnimationFrame(raf); window.removeEventListener('resize', resize);};
}

/* =========================================================
   BOOTSTRAP
   ========================================================= */
document.addEventListener('DOMContentLoaded', ()=>{
  VPL.applyTheme();
  initSplash();
  document.querySelector('.brand .flask').innerHTML = VPL.ICONS.flask;

  const enterBtn = document.getElementById('enterLab');
  enterBtn.addEventListener('click', ()=>{
    VPL.beep(660,.12,'triangle',.08);
    document.getElementById('splash').classList.add('hide');
    document.getElementById('app').classList.add('show');
    VPL.renderRoute();
  });

  // Build nav rail + bottom nav
  const navItems = [
    ['home','Home',VPL.ICONS.home],
    ['sims','Simulations',VPL.ICONS.grid],
    ['favorites','Favorites',VPL.ICONS.star],
    ['glossary','Glossary',VPL.ICONS.book],
    ['formulas','Formulas',VPL.ICONS.sigma],
    ['units','Units',VPL.ICONS.ruler],
    ['quizhub','Quiz',VPL.ICONS.quiz],
    ['achievements','Achievements',VPL.ICONS.trophy],
    ['settings','Settings',VPL.ICONS.settings],
    ['about','About',VPL.ICONS.info],
  ];
  const navrail = document.getElementById('navrail');
  navrail.innerHTML = navItems.map(([r,l,i])=>`<button data-route="${r}">${i}${l}</button>`).join('');
  navrail.querySelectorAll('button').forEach(b=>b.onclick=()=>VPL.go(b.dataset.route));

  const bottomItems = navItems.slice(0,5);
  const bn = document.getElementById('bottomnavRow');
  bn.innerHTML = bottomItems.map(([r,l,i])=>`<button data-route="${r}">${i}<span>${l}</span></button>`).join('');
  bn.querySelectorAll('button').forEach(b=>b.onclick=()=>VPL.go(b.dataset.route));

  document.getElementById('searchInput').addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){
      const q = e.target.value.toLowerCase();
      const hit = SIM_REGISTRY.find(s=>s.title.toLowerCase().includes(q));
      if(hit) VPL.go('sim/'+hit.id); else VPL.go('sims');
    }
  });
  document.getElementById('themeToggleBtn').addEventListener('click', ()=>{
    VPL.state.theme = VPL.state.theme==='dark'?'light':'dark'; VPL.save(); VPL.applyTheme();
    document.getElementById('themeToggleBtn').innerHTML = VPL.state.theme==='dark'?VPL.ICONS.sun:VPL.ICONS.moon;
  });
  document.getElementById('themeToggleBtn').innerHTML = VPL.state.theme==='dark'?VPL.ICONS.sun:VPL.ICONS.moon;

  window.addEventListener('hashchange', VPL.renderRoute);

  // Register service worker for offline use
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
});
