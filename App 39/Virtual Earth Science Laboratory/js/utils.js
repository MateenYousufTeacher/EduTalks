/* ==========================================================================
   utils.js — shared helpers used by app.js and every simulation module.
   ========================================================================== */
window.EarthLab = (() => {

  /* ---------------- Local storage / progress ---------------- */
  const STORE_KEY = 'vesl_progress_v1';

  function loadState(){
    try{
      return JSON.parse(localStorage.getItem(STORE_KEY)) || defaultState();
    }catch(e){ return defaultState(); }
  }
  function defaultState(){
    return { xp:0, completed:{}, bookmarks:{}, quizScores:{}, theme:'dark', notes:{} };
  }
  let state = loadState();
  function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

  function addXP(amount){
    state.xp += amount;
    save();
    return state.xp;
  }
  function markComplete(simId){
    state.completed[simId] = true; save();
  }
  function isComplete(simId){ return !!state.completed[simId]; }
  function toggleBookmark(simId){
    state.bookmarks[simId] = !state.bookmarks[simId]; save();
    return state.bookmarks[simId];
  }
  function isBookmarked(simId){ return !!state.bookmarks[simId]; }
  function setQuizScore(simId, score, total){
    state.quizScores[simId] = {score, total}; save();
  }
  function level(){
    return Math.floor(state.xp / 150) + 1;
  }
  function levelTitle(){
    const l = level();
    const titles = ['Field Trainee','Junior Geologist','Field Geologist','Senior Geologist','Chief Earth Scientist','Planetary Expert'];
    return titles[Math.min(l-1, titles.length-1)];
  }

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function toast(msg){
    let el = document.getElementById('toast');
    if(!el){
      el = document.createElement('div');
      el.id = 'toast'; el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> el.classList.remove('show'), 2200);
  }

  /* ---------------- Tabs ---------------- */
  function wireTabs(container){
    const btns = container.querySelectorAll('.tab-btn');
    btns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        btns.forEach(b=>b.classList.remove('active'));
        container.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
        btn.classList.add('active');
        container.querySelector('#'+btn.dataset.tab).classList.add('active');
      });
    });
  }

  /* ---------------- Data table builder ---------------- */
  function buildTable(columns, rows){
    let html = '<table class="data-table"><thead><tr>';
    columns.forEach(c=> html += `<th>${c}</th>`);
    html += '</tr></thead><tbody>';
    rows.forEach(r=>{
      html += '<tr>' + r.map(v=>`<td>${v}</td>`).join('') + '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  /* ---------------- Lightweight canvas line chart ---------------- */
  function drawLineChart(canvas, series, opts={}){
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight || 220;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,w,h);

    const pad = {l:44,r:16,t:16,b:28};
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;

    let allY = [];
    series.forEach(s=> s.data.forEach(p=> allY.push(p.y)));
    let minY = opts.minY ?? Math.min(...allY, 0);
    let maxY = opts.maxY ?? Math.max(...allY, 1);
    if(minY===maxY){ maxY = minY+1; }
    const maxX = Math.max(...series.map(s=>s.data.length-1), 1);

    const xPix = i => pad.l + (i/maxX)*plotW;
    const yPix = v => pad.t + plotH - ((v-minY)/(maxY-minY))*plotH;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '11px sans-serif';
    ctx.lineWidth = 1;
    const gridLines = 4;
    for(let i=0;i<=gridLines;i++){
      const v = minY + (maxY-minY)*(i/gridLines);
      const y = yPix(v);
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y); ctx.stroke();
      ctx.fillText(v.toFixed(opts.decimals ?? 0), 4, y+4);
    }

    // series
    series.forEach(s=>{
      ctx.beginPath();
      s.data.forEach((p,i)=>{
        const x = xPix(i), y = yPix(p.y);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.strokeStyle = s.color || '#43A047';
      ctx.lineWidth = 2.4;
      ctx.stroke();
      // fill
      if(s.fill){
        ctx.lineTo(xPix(s.data.length-1), pad.t+plotH);
        ctx.lineTo(xPix(0), pad.t+plotH);
        ctx.closePath();
        ctx.fillStyle = s.fillColor || (s.color+'22');
        ctx.fill();
      }
    });

    // x labels
    if(opts.xLabels){
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      opts.xLabels.forEach((lbl,i)=>{
        if(i % (opts.xLabelStep||1) !== 0) return;
        ctx.fillText(lbl, xPix(i)-10, h-6);
      });
    }
  }

  /* ---------------- Quiz engine ---------------- */
  function renderQuiz(container, simId, questions){
    let answered = 0, score = 0;
    container.innerHTML = questions.map((q,qi)=>`
      <div class="quiz-q glass" data-qi="${qi}">
        <div class="qtext">${qi+1}. ${q.q}</div>
        ${q.options.map((opt,oi)=>`<button class="quiz-opt" data-oi="${oi}">${opt}</button>`).join('')}
        <div class="quiz-exp">${q.explain}</div>
      </div>
    `).join('') + `<div class="quiz-score-holder"></div>`;

    container.querySelectorAll('.quiz-q').forEach(qEl=>{
      const qi = +qEl.dataset.qi;
      const q = questions[qi];
      qEl.querySelectorAll('.quiz-opt').forEach(optBtn=>{
        optBtn.addEventListener('click', ()=>{
          if(qEl.dataset.done) return;
          qEl.dataset.done = '1';
          const oi = +optBtn.dataset.oi;
          const correct = oi === q.correct;
          if(correct) score++;
          answered++;
          qEl.querySelectorAll('.quiz-opt').forEach((b,i)=>{
            if(i===q.correct) b.classList.add('correct');
            else if(i===oi && !correct) b.classList.add('wrong');
            b.style.pointerEvents='none';
          });
          qEl.querySelector('.quiz-exp').classList.add('show');
          if(answered === questions.length){
            const holder = container.querySelector('.quiz-score-holder');
            holder.innerHTML = `
              <div class="quiz-score glass">
                <div class="big">${score}/${questions.length}</div>
                <p>Quiz complete — ${score===questions.length?'Perfect score! ':''}You earned ${score*10} XP.</p>
                <button class="btn primary" id="retakeQuiz">Retake Quiz</button>
              </div>`;
            addXP(score*10);
            setQuizScore(simId, score, questions.length);
            markComplete(simId);
            toast(`+${score*10} XP earned`);
            holder.querySelector('#retakeQuiz').addEventListener('click', ()=> renderQuiz(container, simId, questions));
            if(window.EarthLabApp) window.EarthLabApp.refreshProgress();
          }
        });
      });
    });
  }

  /* ---------------- Control builders ---------------- */
  function slider({id,label,min,max,step,value,unit=''}){
    return `
    <div class="control">
      <div class="row"><span>${label}</span><b id="${id}Val">${value}${unit}</b></div>
      <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
    </div>`;
  }
  function wireSlider(root, id, unit, onInput){
    const el = root.querySelector('#'+id);
    const val = root.querySelector('#'+id+'Val');
    el.addEventListener('input', ()=>{
      val.textContent = el.value + unit;
      onInput(parseFloat(el.value));
    });
    return el;
  }
  function segmented({id,label,options,active=0}){
    return `
    <div class="control">
      <div class="row"><span>${label}</span></div>
      <div class="seg" id="${id}">
        ${options.map((o,i)=>`<button data-v="${o.v}" class="${i===active?'active':''}">${o.label}</button>`).join('')}
      </div>
    </div>`;
  }
  function wireSegmented(root, id, onSelect){
    const wrap = root.querySelector('#'+id);
    wrap.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        wrap.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        onSelect(btn.dataset.v);
      });
    });
  }
  function playbar(hostEl, {onPlay,onPause,onStep,onStepBack}){
    hostEl.innerHTML = `
      <button class="icon-btn" id="pbBack" title="Step back">⏮</button>
      <button class="icon-btn" id="pbPlay" title="Play">▶</button>
      <button class="icon-btn" id="pbPause" title="Pause">⏸</button>
      <button class="icon-btn" id="pbFwd" title="Step forward">⏭</button>
    `;
    hostEl.querySelector('#pbPlay').addEventListener('click', onPlay);
    hostEl.querySelector('#pbPause').addEventListener('click', onPause);
    hostEl.querySelector('#pbFwd').addEventListener('click', onStep);
    hostEl.querySelector('#pbBack').addEventListener('click', onStepBack);
  }
  function logObservation(root, cols){
    // cols = [time, variable, value, observation]
    root.__obsLog = root.__obsLog || [];
    root.__obsLog.unshift(cols);
    if(root.__obsLog.length > 40) root.__obsLog.pop();
    const host = root.querySelector('#obsRows');
    if(host){
      host.innerHTML = root.__obsLog.slice(0,8).map(r=>
        `<div class="row"><span>${r[0]} · ${r[1]}</span><span>${r[3]}</span></div>`
      ).join('');
    }
  }

  /* ---------------- Misc ---------------- */
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function lerp(a,b,t){ return a + (b-a)*t; }
  function lerpColor(c1, c2, t){
    const p1 = hexToRgb(c1), p2 = hexToRgb(c2);
    const r = Math.round(lerp(p1[0],p2[0],t));
    const g = Math.round(lerp(p1[1],p2[1],t));
    const b = Math.round(lerp(p1[2],p2[2],t));
    return `rgb(${r},${g},${b})`;
  }
  function hexToRgb(hex){
    const h = hex.replace('#','');
    return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)];
  }
  function fitCanvas(canvas, cssHeight){
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = cssHeight || canvas.clientHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return ctx;
  }

  return {
    state, save, addXP, markComplete, isComplete, toggleBookmark, isBookmarked,
    setQuizScore, level, levelTitle, toast, wireTabs, buildTable, drawLineChart,
    renderQuiz, clamp, lerp, lerpColor, hexToRgb, fitCanvas,
    slider, wireSlider, segmented, wireSegmented, playbar, logObservation
  };
})();
