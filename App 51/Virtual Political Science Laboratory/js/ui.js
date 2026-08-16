/* ============================================================
   UI MODULE — navigation, home dashboard, common screens
   ============================================================ */
const VPSL_UI = (() => {
  const S = VPSL_STORE;
  let currentSimId = null;

  /* ---------- generic helpers ---------- */
  function $(sel, root=document){ return root.querySelector(sel); }
  function $$(sel, root=document){ return [...root.querySelectorAll(sel)]; }

  function toast(msg, icon='✅'){
    const t = $('#toast');
    t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(()=>t.classList.remove('show'), 2400);
  }

  function showScreen(id){
    $$('.screen').forEach(s=>s.classList.remove('active'));
    const el = document.getElementById(id);
    if(el) el.classList.add('active');
    $$('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.screen===id));
    window.scrollTo({top:0, behavior:'instant' in window ? 'instant':'auto'});
  }

  function go(id, opts={}){
    showScreen(id);
    if(id==='screen-home') renderHome();
    if(id==='screen-constitution') { renderConstitution(); S.markConstitutionVisited(); }
    if(id==='screen-glossary') { renderGlossary(); S.markGlossaryVisited(); }
    if(id==='screen-quizcentre') renderQuizCentre();
    if(id==='screen-achievements') renderAchievements();
    if(id==='screen-settings') renderSettings();
    if(id==='screen-about') {}
  }

  /* ---------- THEME ---------- */
  function applyTheme(){
    document.documentElement.setAttribute('data-theme', S.state.theme);
    document.body.setAttribute('data-theme', S.state.theme);
  }

  /* ---------- SPLASH ---------- */
  function initSplash(){
    $('#btn-enter').addEventListener('click', ()=>{
      go('screen-home');
      toast('Welcome back, Civic Explorer!','👋');
    });
    $('#btn-splash-about').addEventListener('click', ()=> go('screen-about'));
  }

  /* ---------- HOME ---------- */
  function progressPct(){
    const total = VPSL_DATA.sims.length;
    const done = S.state.simsCompleted.length;
    return Math.round((done/total)*100);
  }

  function simCardHTML(sim){
    const pct = S.state.simProgress[sim.id] || 0;
    const done = S.state.simsCompleted.includes(sim.id);
    return `
    <div class="glass sim-card" data-open="${sim.id}">
      <div class="sim-num" style="color:${sim.color}">${String(sim.num).padStart(2,'0')}</div>
      <div class="sim-icon" style="background:${sim.color}">${sim.icon}</div>
      <h4>${sim.title}</h4>
      <p>${sim.tagline}</p>
      <div class="sim-progress-track"><div class="sim-progress-fill" style="width:${pct}%"></div></div>
      <div class="sim-meta"><span>${pct}% complete</span><span>${done ? '🏅 Done' : '▶ Start'}</span></div>
    </div>`;
  }

  function renderHome(){
    const level = S.state.level;
    const title = VPSL_DATA.levelTitles[level-1] || VPSL_DATA.levelTitles.at(-1);
    $('#home-hero-stats').innerHTML = `
      <div class="hero-stat"><b>${S.state.xp} XP</b><span>Level ${level} · ${title}</span></div>
      <div class="hero-stat"><b>${progressPct()}%</b><span>Lab progress</span></div>
      <div class="hero-stat"><b>${S.state.streak}🔥</b><span>Day streak</span></div>
      <div class="hero-stat"><b>${S.state.earnedAchievements.length}/${VPSL_DATA.achievements.length}</b><span>Badges earned</span></div>
    `;

    const cont = $('#recent-row');
    const recentTitle = $('#recent-title');
    if(S.state.history.length){
      cont.style.display='';
      if(recentTitle) recentTitle.style.display='';
      cont.innerHTML = S.state.history.map(id=>{
        const sim = VPSL_DATA.sims.find(s=>s.id===id);
        if(!sim) return '';
        return simCardHTML(sim);
      }).join('');
    } else {
      cont.style.display='none';
      if(recentTitle) recentTitle.style.display='none';
    }

    renderSimGrid();
  }

  function renderSimGrid(filter=''){
    const q = filter.trim().toLowerCase();
    const activeChip = $('.chip.active');
    const cat = activeChip ? activeChip.dataset.filter : 'all';
    let list = VPSL_DATA.sims;
    if(q) list = list.filter(s=> s.title.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q));
    if(cat==='progress') list = list.filter(s=> (S.state.simProgress[s.id]||0) > 0 && !S.state.simsCompleted.includes(s.id));
    if(cat==='done') list = list.filter(s=> S.state.simsCompleted.includes(s.id));
    if(cat==='new') list = list.filter(s=> !(S.state.simProgress[s.id]||0));
    $('#sim-grid').innerHTML = list.length ? list.map(simCardHTML).join('') :
      `<div class="empty-state" style="grid-column:1/-1"><div class="em-ic">🔍</div><p>No simulations match. Try clearing the search or filter.</p></div>`;
  }

  function initHome(){
    $('#search-input').addEventListener('input', e=> renderSimGrid(e.target.value));
    $$('.chip').forEach(c=>c.addEventListener('click', ()=>{
      $$('.chip').forEach(x=>x.classList.remove('active'));
      c.classList.add('active');
      renderSimGrid($('#search-input').value);
    }));
    document.body.addEventListener('click', e=>{
      const card = e.target.closest('[data-open]');
      if(card) openSimulation(card.dataset.open);
    });
  }

  /* ---------- SIMULATION WORKSPACE ---------- */
  function openSimulation(id){
    currentSimId = id;
    S.openSim(id);
    const sim = VPSL_DATA.sims.find(s=>s.id===id);
    showScreen('screen-sim');
    $('#sim-title-bar').textContent = sim.title;
    const container = $('#sim-container');
    container.innerHTML = '<div class="empty-state"><div class="em-ic">⏳</div><p>Loading simulation…</p></div>';
    const mod = VPSL_SIMULATIONS[id];
    if(mod && mod.render){
      requestAnimationFrame(()=> mod.render(container, {store:S, ui:VPSL_UI, sim}));
    } else {
      container.innerHTML = '<div class="empty-state"><p>Simulation module not found.</p></div>';
    }
  }

  function backFromSim(){ go('screen-home'); }

  function updateSimProgress(id, pct){
    S.setProgress(id, pct);
    $$('.sim-card[data-open="'+id+'"] .sim-progress-fill').forEach(el=> el.style.width = pct+'%');
  }

  /* ---------- CONSTITUTION HANDBOOK ---------- */
  function renderConstitution(){
    const wrap = $('#constitution-list');
    wrap.innerHTML = VPSL_DATA.constitution.map((c,i)=>`
      <div class="glass accordion-item" data-idx="${i}">
        <div class="accordion-head">📖 ${c.title}<span class="chev">▾</span></div>
        <div class="accordion-body"><p>${c.body}</p></div>
      </div>`).join('');
    $$('#constitution-list .accordion-item').forEach(item=>{
      $('.accordion-head', item).addEventListener('click', ()=> item.classList.toggle('open'));
    });
  }

  /* ---------- GLOSSARY ---------- */
  function renderGlossary(letter='ALL', q=''){
    const alphaWrap = $('#alpha-nav');
    const letters = ['ALL', ...new Set(VPSL_DATA.glossary.map(g=>g.term[0].toUpperCase()))].sort();
    alphaWrap.innerHTML = letters.map(l=>`<button class="alpha-btn ${l===letter?'active':''}" data-letter="${l}">${l}</button>`).join('');
    $$('.alpha-btn', alphaWrap).forEach(b=> b.addEventListener('click', ()=> renderGlossary(b.dataset.letter, $('#glossary-search').value)));

    let list = VPSL_DATA.glossary;
    if(letter!=='ALL') list = list.filter(g=>g.term[0].toUpperCase()===letter);
    if(q.trim()) list = list.filter(g=> g.term.toLowerCase().includes(q.toLowerCase()) || g.def.toLowerCase().includes(q.toLowerCase()));
    list = [...list].sort((a,b)=>a.term.localeCompare(b.term));

    $('#glossary-list').innerHTML = list.length ? list.map(g=>`
      <div class="glass gloss-item">
        <h5>${g.term}</h5>
        <div class="pron">/${g.pron}/</div>
        <p>${g.def}</p>
        <div class="tags">${g.tags.map(t=>`<span class="badge blue">${t}</span>`).join('')}</div>
      </div>`).join('') : `<div class="empty-state"><div class="em-ic">📚</div><p>No terms found.</p></div>`;
  }

  function initGlossarySearch(){
    $('#glossary-search').addEventListener('input', e=> renderGlossary('ALL', e.target.value));
  }

  /* ---------- QUIZ CENTRE ---------- */
  function renderQuizCentre(){
    const wrap = $('#quizcentre-grid');
    wrap.innerHTML = VPSL_DATA.sims.map(sim=>{
      const rec = S.state.quizScores[sim.id];
      const best = rec ? rec.best : null;
      return `
      <div class="glass tile" style="cursor:pointer" data-quiz-open="${sim.id}">
        <span class="tile-icon">${sim.icon}</span>
        <h5>${sim.title}</h5>
        <span>${best!==null ? 'Best score: '+best+'%' : 'Not attempted'}</span>
      </div>`;
    }).join('');
    $$('[data-quiz-open]', wrap).forEach(el=> el.addEventListener('click', ()=>{
      openSimulation(el.dataset.quizOpen);
      setTimeout(()=>{
        const quizTab = document.querySelector('.tab-btn[data-tab="quiz"]');
        if(quizTab) quizTab.click();
      }, 60);
    }));
  }

  /* ---------- ACHIEVEMENTS ---------- */
  function renderAchievements(){
    $('#ach-summary').textContent = `${S.state.earnedAchievements.length} of ${VPSL_DATA.achievements.length} badges earned · Level ${S.state.level} (${S.state.xp} XP)`;
    $('#badge-grid').innerHTML = VPSL_DATA.achievements.map(a=>{
      const earned = S.state.earnedAchievements.includes(a.id);
      return `<div class="glass ach-card ${earned?'earned':''}">
        <div class="ach-ic">${a.ic}</div>
        <h5>${a.name}</h5>
        <span>${a.desc}</span>
      </div>`;
    }).join('');
  }

  /* ---------- SETTINGS ---------- */
  function renderSettings(){
    const wrap = $('#settings-list');
    wrap.innerHTML = `
      <div class="setting-row">
        <div><h5>Dark theme</h5><span>Switch between light and dark appearance</span></div>
        <button class="switch ${S.state.theme==='dark'?'on':''}" id="tg-theme"></button>
      </div>
      <div class="setting-row">
        <div><h5>Teacher mode</h5><span>Reveal facilitator notes & answer keys in simulations</span></div>
        <button class="switch ${S.state.teacherMode?'on':''}" id="tg-teacher"></button>
      </div>
      <div class="setting-row">
        <div><h5>Sound effects</h5><span>Play light sounds for correct/incorrect answers</span></div>
        <button class="switch ${S.state.sound?'on':''}" id="tg-sound"></button>
      </div>
      <div class="setting-row">
        <div><h5>Reduce motion</h5><span>Minimise animation across the app</span></div>
        <button class="switch ${S.state.reduceMotion?'on':''}" id="tg-motion"></button>
      </div>
      <div class="setting-row">
        <div><h5>Export notes</h5><span>Download all saved observation notes as a text file</span></div>
        <button class="btn-sm primary" id="btn-export">Export</button>
      </div>
      <div class="setting-row">
        <div><h5>Reset all progress</h5><span>Clears XP, badges, notes and simulation progress</span></div>
        <button class="btn-sm danger" id="btn-reset">Reset</button>
      </div>
    `;
    $('#tg-theme').addEventListener('click', ()=>{
      S.setSetting('theme', S.state.theme==='dark'?'light':'dark');
      applyTheme(); renderSettings();
    });
    $('#tg-teacher').addEventListener('click', ()=>{ S.setSetting('teacherMode', !S.state.teacherMode); renderSettings(); toast(S.state.teacherMode?'Teacher mode on':'Teacher mode off','👩‍🏫'); });
    $('#tg-sound').addEventListener('click', ()=>{ S.setSetting('sound', !S.state.sound); renderSettings(); });
    $('#tg-motion').addEventListener('click', ()=>{ S.setSetting('reduceMotion', !S.state.reduceMotion); document.body.classList.toggle('force-reduce-motion', S.state.reduceMotion); renderSettings(); });
    $('#btn-export').addEventListener('click', exportNotes);
    $('#btn-reset').addEventListener('click', ()=>{
      if(confirm('This will erase all saved progress on this device. Continue?')){
        S.resetAll(); applyTheme(); go('screen-home'); toast('Progress reset','🔄');
      }
    });
  }

  function exportNotes(){
    const notes = S.state.notes;
    if(!notes.length){ toast('No notes saved yet','ℹ️'); return; }
    const text = notes.map(n=>{
      const sim = VPSL_DATA.sims.find(s=>s.id===n.simId);
      return `[${new Date(n.ts).toLocaleString()}] ${sim?sim.title:n.simId}\n${n.text}\n`;
    }).join('\n---\n\n');
    const blob = new Blob([text], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vpsl-observation-notes.txt';
    a.click();
    toast('Notes exported','📤');
  }

  /* ---------- SIMPLE CANVAS CHART UTIL (for simulations) ---------- */
  function drawBarChart(canvas, data, opts={}){
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width*dpr; canvas.height = rect.height*dpr;
    ctx.scale(dpr,dpr);
    const W = rect.width, H = rect.height;
    ctx.clearRect(0,0,W,H);
    const max = opts.max || Math.max(...data.map(d=>d.value), 1);
    const padL = 10, padB = 24, padT = 14;
    const barW = (W - padL*2) / data.length * 0.6;
    const gap = (W - padL*2) / data.length;
    const isDark = document.body.getAttribute('data-theme')==='dark';
    ctx.font = '11px Nunito Sans, sans-serif';
    data.forEach((d,i)=>{
      const x = padL + gap*i + (gap-barW)/2;
      const h = (H-padB-padT) * (d.value/max);
      const y = H - padB - h;
      ctx.fillStyle = d.color || '#1976D2';
      roundRect(ctx, x, y, barW, h, 6);
      ctx.fill();
      ctx.fillStyle = isDark ? '#B7C3DC' : '#5A6478';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x+barW/2, H-8);
      ctx.fillStyle = isDark ? '#F5F7FA' : '#212121';
      ctx.fillText(Math.round(d.value), x+barW/2, y-6);
    });
  }
  function roundRect(ctx,x,y,w,h,r){
    if(h<=0) h=0.0001;
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function drawLineTrend(canvas, series, opts={}){
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width*dpr; canvas.height = rect.height*dpr;
    ctx.scale(dpr,dpr);
    const W = rect.width, H = rect.height;
    ctx.clearRect(0,0,W,H);
    const allVals = series.flatMap(s=>s.data);
    const max = opts.max || Math.max(...allVals, 1);
    const min = opts.min !== undefined ? opts.min : Math.min(...allVals, 0);
    const padL=8,padR=8,padT=10,padB=10;
    const n = series[0].data.length;
    const stepX = (W-padL-padR)/(n-1||1);
    series.forEach(s=>{
      ctx.beginPath();
      s.data.forEach((v,i)=>{
        const x = padL + stepX*i;
        const y = padT + (H-padT-padB) * (1-((v-min)/((max-min)||1)));
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      });
      ctx.strokeStyle = s.color; ctx.lineWidth = 2.5; ctx.lineJoin='round'; ctx.stroke();
    });
  }

  return {
    $, $$, toast, go, showScreen, applyTheme, initSplash, initHome, renderHome,
    openSimulation, backFromSim, updateSimProgress,
    renderConstitution, renderGlossary, initGlossarySearch,
    renderQuizCentre, renderAchievements, renderSettings,
    drawBarChart, drawLineTrend,
    get currentSimId(){ return currentSimId; },
  };
})();
