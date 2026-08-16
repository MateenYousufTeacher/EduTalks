/* ============================================================
   SIMULATION SHELL — shared chrome + engine for all 10 labs
   Each simulation module registers itself in SIM_MODULES[id]
   ============================================================ */
const SIM_MODULES = {};

function registerSim(id, def){ SIM_MODULES[id] = def; }

/* ---------------- Tiny canvas line-chart (no external libs) ---------------- */
function drawLineChart(canvas, series, opts={}){
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w*dpr; canvas.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  const pad = {l:36,r:10,t:10,b:20};
  const plotW = w-pad.l-pad.r, plotH = h-pad.t-pad.b;
  let allVals = series.flatMap(s=>s.data);
  if(!allVals.length){ ctx.fillStyle='#9FB0C9'; ctx.font='12px sans-serif'; ctx.fillText('Run the simulation to collect data...', pad.l, h/2); return; }
  let min = opts.min ?? Math.min(...allVals), max = opts.max ?? Math.max(...allVals);
  if(min===max){ min-=1; max+=1; }
  const n = Math.max(...series.map(s=>s.data.length));
  ctx.strokeStyle = '#E1E6EC';
  ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,h-pad.b); ctx.lineTo(w-pad.r,h-pad.b); ctx.stroke();
  ctx.fillStyle = '#9FB0C9'; ctx.font = '10px sans-serif'; ctx.textAlign='right';
  ctx.fillText(max.toFixed(1), pad.l-4, pad.t+8);
  ctx.fillText(min.toFixed(1), pad.l-4, h-pad.b);
  series.forEach(s=>{
    ctx.beginPath(); ctx.strokeStyle = s.color || '#1976D2'; ctx.lineWidth=2;
    s.data.forEach((v,i)=>{
      const x = pad.l + (i/(Math.max(n-1,1)))*plotW;
      const y = pad.t + (1-(v-min)/(max-min))*plotH;
      i===0? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.stroke();
  });
  if(opts.legend){
    ctx.textAlign='left'; let lx = pad.l+6;
    series.forEach(s=>{ ctx.fillStyle=s.color; ctx.fillRect(lx,pad.t-2,8,8); ctx.fillStyle='#5C6672'; ctx.font='10px sans-serif'; ctx.fillText(s.name, lx+11, pad.t+6); lx += ctx.measureText(s.name).width+34; });
  }
}

/* ---------------- Quiz engine ---------------- */
function mountQuiz(container, simId, questions){
  let idx=0, score=0, answered=false;
  function render(){
    const q = questions[idx];
    container.innerHTML = `
      <div class="quiz-progress">${questions.map((_,i)=>`<i class="${i<idx?'done':i===idx?'current':''}"></i>`).join('')}</div>
      <div class="quiz-q">Q${idx+1}. ${q.q}</div>
      <div id="quiz-opts">${q.options.map((o,i)=>`<button class="quiz-opt" data-i="${i}">${o}</button>`).join('')}</div>
      <div id="quiz-explain" class="small" style="margin-top:10px;"></div>
      <div style="margin-top:14px;display:flex;justify-content:space-between;">
        <span class="small">Score: ${score}/${questions.length}</span>
        <button class="btn btn-primary btn-sm" id="quiz-next" style="display:none;">${idx<questions.length-1?'Next Question':'Finish Quiz'}</button>
      </div>`;
    answered=false;
    container.querySelectorAll('.quiz-opt').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if(answered) return; answered=true;
        const i = +btn.dataset.i;
        if(i===q.correct){ btn.classList.add('correct'); score++; }
        else { btn.classList.add('wrong'); container.querySelectorAll('.quiz-opt')[q.correct].classList.add('correct'); }
        document.getElementById('quiz-explain').textContent = q.explain || '';
        document.getElementById('quiz-next').style.display='inline-flex';
      });
    });
    const nextBtn = document.getElementById('quiz-next');
    if(nextBtn) nextBtn.addEventListener('click', ()=>{
      if(idx < questions.length-1){ idx++; render(); }
      else{
        Store.recordQuiz(simId, score, questions.length);
        container.innerHTML = `
          <div style="text-align:center;padding:20px 0;">
            <div style="font-size:42px;">${score>=questions.length*0.8?'🏆':score>=questions.length*0.5?'👍':'📘'}</div>
            <h3>You scored ${score} / ${questions.length}</h3>
            <p class="small">${score>=questions.length*0.8?'Excellent! You have mastered this topic.':score>=questions.length*0.5?'Good work — review the summary and try again to improve.':'Keep exploring the simulation, then retake the quiz.'}</p>
            <button class="btn btn-primary" id="quiz-retry">Retake Quiz</button>
          </div>`;
        document.getElementById('quiz-retry').addEventListener('click', ()=>{ idx=0;score=0; render(); });
        markSimProgress(simId, 100);
      }
    });
  }
  render();
}

/* ---------------- Progress helper ---------------- */
function markSimProgress(simId, pct){ Store.setProgress(simId, pct); refreshProgressBadges(simId); }
function refreshProgressBadges(simId){
  const el = document.getElementById('sim-progress-bar');
  if(el){ const p = Store.state.progress[simId]?.percent||0; el.style.width = p+'%'; }
}

/* ---------------- Slider control factory ---------------- */
function addSlider(panel, opts){
  const {key,label,min,max,step=1,value,unit='',onInput} = opts;
  const wrap = document.createElement('div');
  wrap.className='field';
  wrap.innerHTML = `<div class="field-label"><span>${label}</span><span class="val" id="val-${key}">${value}${unit}</span></div>
    <input type="range" id="rng-${key}" min="${min}" max="${max}" step="${step}" value="${value}">`;
  panel.appendChild(wrap);
  const input = wrap.querySelector('input');
  const setPct = ()=>{ const pct = (input.value-min)/(max-min)*100; input.style.setProperty('--pct', pct+'%'); };
  setPct();
  input.addEventListener('input', ()=>{
    document.getElementById('val-'+key).textContent = (+input.value).toString()+unit;
    setPct();
    onInput(+input.value);
  });
  return { get:()=>+input.value, set:(v)=>{ input.value=v; document.getElementById('val-'+key).textContent=v+unit; setPct(); } };
}
function addSelect(panel, opts){
  const {key,label,options,value,onChange} = opts;
  const wrap = document.createElement('div'); wrap.className='field';
  wrap.innerHTML = `<div class="field-label"><span>${label}</span></div>
    <select id="sel-${key}">${options.map(o=>`<option value="${o.value}" ${o.value===value?'selected':''}>${o.label}</option>`).join('')}</select>`;
  panel.appendChild(wrap);
  const sel = wrap.querySelector('select');
  sel.addEventListener('change', ()=>onChange(sel.value));
  return { get:()=>sel.value, set:(v)=>{ sel.value=v; } };
}
function addChipGroup(panel, opts){
  const {key,label,options,value,onChange} = opts;
  const wrap = document.createElement('div'); wrap.className='field';
  wrap.innerHTML = `<div class="field-label"><span>${label}</span></div>
    <div class="chip-row" id="chips-${key}">${options.map(o=>`<button class="chip ${o.value===value?'active':''}" data-v="${o.value}">${o.label}</button>`).join('')}</div>`;
  panel.appendChild(wrap);
  const row = wrap.querySelector('.chip-row');
  row.addEventListener('click', e=>{
    if(e.target.dataset.v===undefined) return;
    row.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
    e.target.classList.add('active');
    onChange(e.target.dataset.v);
  });
  return { set:(v)=>{ row.querySelectorAll('.chip').forEach(c=>c.classList.toggle('active', c.dataset.v===v)); } };
}
function statGrid(container, stats){
  container.innerHTML = `<div class="stat-grid">${stats.map(s=>`<div class="stat-tile"><div class="v">${s.v}</div><div class="l">${s.l}</div></div>`).join('')}</div>`;
}

/* ---------------- CSV export ---------------- */
function exportCSV(filename, headers, rows){
  const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

/* ---------------- MAIN SIM PAGE RENDERER ---------------- */
function renderSimPage(id){
  const sim = SIMULATIONS.find(s=>s.id===id);
  const mod = SIM_MODULES[id];
  const page = document.getElementById('page');
  if(!sim){ page.innerHTML = '<h1>Simulation not found</h1>'; return; }
  markSimProgress(id, Math.max(Store.state.progress[id]?.percent||0, 15));

  const fav = Store.state.favorites.includes(id);
  page.innerHTML = `
    <div class="sim-header">
      <div class="icon-badge" style="background:${sim.color};">${sim.icon}</div>
      <div class="titles">
        <div class="kicker">${sim.category} · ${sim.est}</div>
        <h2>${sim.title}</h2>
      </div>
      <button class="btn-icon" id="fav-btn" title="Toggle favorite">${fav?'★':'☆'}</button>
      <a href="#/simulations" class="btn btn-secondary btn-sm">← All Labs</a>
    </div>
    <div class="progress-bar" style="margin-bottom:18px;"><i id="sim-progress-bar" style="width:${Store.state.progress[id]?.percent||0}%"></i></div>

    <div class="tabs" id="sim-tabs">
      <button class="active" data-tab="simulate">Simulate</button>
      <button data-tab="data">Data & Graphs</button>
      <button data-tab="learn">Learn</button>
      <button data-tab="quiz">Mini Quiz</button>
    </div>

    <div id="tab-simulate" class="tabbed-content"></div>
    <div id="tab-data" class="tabbed-content hidden"></div>
    <div id="tab-learn" class="tabbed-content hidden"></div>
    <div id="tab-quiz" class="tabbed-content hidden"></div>
  `;

  document.getElementById('fav-btn').addEventListener('click', ()=>{ Store.toggleFavorite(id); document.getElementById('fav-btn').innerHTML = Store.state.favorites.includes(id)?'★':'☆'; });

  document.getElementById('sim-tabs').addEventListener('click', e=>{
    if(!e.target.dataset.tab) return;
    document.querySelectorAll('#sim-tabs button').forEach(b=>b.classList.remove('active'));
    e.target.classList.add('active');
    ['simulate','data','learn','quiz'].forEach(t=>document.getElementById('tab-'+t).classList.toggle('hidden', t!==e.target.dataset.tab));
    if(e.target.dataset.tab==='data') markSimProgress(id, 55);
    if(e.target.dataset.tab==='learn') markSimProgress(id, 75);
  });

  if(!mod){
    document.getElementById('tab-simulate').innerHTML = `<div class="card"><div class="card-body"><p>This simulation module is being finalised. Please check back soon.</p></div></div>`;
    return;
  }

  /* ---- Simulate tab ---- */
  const simulateEl = document.getElementById('tab-simulate');
  simulateEl.innerHTML = `
    <div class="sim-layout">
      <div class="sim-stage">
        <div class="sim-toolbar" id="sim-toolbar">
          <button class="btn-icon" id="btn-play" title="Play">${ICONS.play}</button>
          <button class="btn-icon hidden" id="btn-pause" title="Pause">${ICONS.pause}</button>
          <button class="btn-icon" id="btn-reset" title="Reset">${ICONS.reset}</button>
          <button class="btn-icon" id="btn-stepback" title="Step Back">${ICONS.stepback}</button>
          <button class="btn-icon" id="btn-stepfwd" title="Step Forward">${ICONS.stepfwd}</button>
          <button class="btn-icon" id="btn-random" title="Randomize">${ICONS.shuffle}</button>
          <div class="divider"></div>
          <button class="btn-icon" id="btn-fullscreen" title="Full Screen">${ICONS.fullscreen}</button>
          <button class="btn-icon" id="btn-shot" title="Screenshot">${ICONS.camera}</button>
          <div class="divider"></div>
          <span class="badge badge-blue" id="mode-badge">${Store.state.settings.mode==='teacher'?'Teacher Mode':'Student Mode'}</span>
        </div>
        <div class="sim-canvas-wrap" id="sim-stage-el" style="margin-top:12px;">
          <div class="sim-readout" id="sim-readout"></div>
        </div>
      </div>
      <div class="sim-panel" id="sim-controls-el"></div>
    </div>
  `;
  const stageEl = document.getElementById('sim-stage-el');
  const controlsEl = document.getElementById('sim-controls-el');
  const readoutEl = document.getElementById('sim-readout');

  let running=false, dataRows=[];
  const helpers = {
    setReadout(html){ readoutEl.innerHTML = html; },
    pushRow(row){ dataRows.push(row); if(dataRows.length>200) dataRows.shift(); renderDataTab(); },
    getRows(){ return dataRows; },
    isRunning(){ return running; },
    markProgress(p){ markSimProgress(id, p); },
    toast, Store,
    onFirstInteract(){ markSimProgress(id, Math.max(Store.state.progress[id]?.percent||0, 40)); }
  };

  const ctrl = mod.mount(stageEl, controlsEl, helpers) || {};

  document.getElementById('btn-play').addEventListener('click', function(){
    running=true; this.classList.add('hidden'); document.getElementById('btn-pause').classList.remove('hidden');
    ctrl.onPlay && ctrl.onPlay();
  });
  document.getElementById('btn-pause').addEventListener('click', function(){
    running=false; this.classList.add('hidden'); document.getElementById('btn-play').classList.remove('hidden');
    ctrl.onPause && ctrl.onPause();
  });
  document.getElementById('btn-reset').addEventListener('click', ()=>{ dataRows=[]; ctrl.onReset && ctrl.onReset(); renderDataTab(); toast('Experiment reset'); });
  document.getElementById('btn-stepback').addEventListener('click', ()=>{ ctrl.onStep && ctrl.onStep(-1); });
  document.getElementById('btn-stepfwd').addEventListener('click', ()=>{ ctrl.onStep && ctrl.onStep(1); });
  document.getElementById('btn-random').addEventListener('click', ()=>{ ctrl.onRandomize && ctrl.onRandomize(); toast('Randomized variables'); });
  document.getElementById('btn-fullscreen').addEventListener('click', ()=>{
    if(!document.fullscreenElement) stageEl.requestFullscreen?.(); else document.exitFullscreen?.();
  });
  document.getElementById('btn-shot').addEventListener('click', ()=>{
    const canvas = stageEl.querySelector('canvas');
    if(canvas){ const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download=id+'-screenshot.png'; a.click(); }
    else toast('Screenshot works on canvas-based views');
  });

  /* ---- Data tab ---- */
  function renderDataTab(){
    const dataEl = document.getElementById('tab-data');
    dataEl.innerHTML = `
      <div class="grid-2">
        <div class="panel-block">
          <h3>Observation Table</h3>
          <div class="table-wrap"><table class="data-table">
            <thead><tr>${(mod.dataColumns||['Time','Value']).map(c=>`<th>${c}</th>`).join('')}</tr></thead>
            <tbody>${dataRows.slice(-40).map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${(mod.dataColumns||[]).length||2}" class="small">Run the simulation to record data.</td></tr>`}</tbody>
          </table></div>
          <button class="btn btn-secondary btn-sm" style="margin-top:10px;" id="btn-export">${ICONS.download} Export Observations (CSV)</button>
        </div>
        <div class="panel-block">
          <h3>Live Graph</h3>
          <div class="graph-wrap"><canvas id="sim-graph"></canvas></div>
        </div>
      </div>`;
    document.getElementById('btn-export').addEventListener('click', ()=>exportCSV(id+'-observations.csv', mod.dataColumns||['Time','Value'], dataRows));
    if(mod.graphSeries){
      const canvas = document.getElementById('sim-graph');
      drawLineChart(canvas, mod.graphSeries(dataRows), {legend:true});
    }
  }
  renderDataTab();

  /* ---- Learn tab ---- */
  const learnEl = document.getElementById('tab-learn');
  learnEl.innerHTML = `
    <div class="grid-2">
      <div>
        <div class="panel-block">
          <h3>🎯 Learning Objectives</h3>
          <ul style="margin:0;padding-left:18px;">${(mod.objectives||[]).map(o=>`<li class="small" style="margin-bottom:6px;">${o}</li>`).join('')}</ul>
        </div>
        <div class="panel-block" style="margin-top:16px;">
          <h3>📖 Introduction</h3><p class="small">${mod.intro||''}</p>
          <h3 style="margin-top:14px;">🔬 Scientific Background</h3><p class="small">${mod.background||''}</p>
        </div>
        <div class="panel-block" style="margin-top:16px;">
          <h3>🌍 Human Impact & Real-World Applications</h3>
          <p class="small">${mod.humanImpact||''}</p>
          <p class="small">${mod.realWorld||''}</p>
        </div>
      </div>
      <div>
        <div class="panel-block">
          <h3>💡 Interesting Facts</h3>
          ${(mod.facts||[]).map(f=>`<div class="fact-card"><span class="ic">💡</span><span class="small">${f}</span></div>`).join('')}
        </div>
        <div class="panel-block" style="margin-top:16px;">
          <h3>⚠️ Common Misconceptions</h3>
          ${(mod.misconceptions||[]).map(f=>`<div class="fact-card mis-card"><span class="ic">⚠️</span><span class="small">${f}</span></div>`).join('')}
        </div>
        <div class="panel-block" style="margin-top:16px;">
          <h3>📝 Summary</h3><p class="small">${mod.summary||''}</p>
        </div>
      </div>
    </div>`;

  /* ---- Quiz tab ---- */
  const quizEl = document.getElementById('tab-quiz');
  quizEl.innerHTML = `<div class="panel-block" style="max-width:640px;" id="quiz-mount"></div>`;
  mountQuiz(document.getElementById('quiz-mount'), id, mod.quiz||[]);
}
