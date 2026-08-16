/* Reaction Race — Chemistry in Motion (Chemical Kinetics) */
(function(){
  let api = null, raf = null, els = {};
  let trials = [];
  let trialCounter = 0;
  let running = false;
  let challenge = null;

  const R = 8.314; // J/mol.K
  const Ea = 45000; // J/mol, fixed activation energy for this virtual reaction
  const A_FACTOR = 4.2e6; // pre-exponential factor (virtual units -> gives convenient k)

  function computeK(tempC, conc, surface, catalystOn) {
    const T = tempC + 273.15;
    let k = A_FACTOR * Math.exp(-Ea/(R*T)); // Arrhenius, base
    k *= conc; // pseudo-order dependence on concentration
    k *= surface; // surface-area multiplier (1 lump, 1.6 granules, 2.4 powder)
    if (catalystOn) k *= 3.0; // catalyst lowers effective barrier -> multiplies k
    return k; // units: 1/s (virtual)
  }

  function mount(container, apiRef) {
    api = apiRef;
    trials = []; trialCounter = 0;
    container.innerHTML = `
      <div class="viz-stage" id="krStage" style="min-height:200px;">
        <canvas id="krCanvas" width="300" height="180" style="width:100%;max-width:300px;"></canvas>
      </div>
      <div class="control-panel">
        <h3>Reaction conditions</h3>
        <div class="control-row"><label>Temperature <span class="val" id="krTempVal">25 °C</span></label>
          <input type="range" id="krTemp" min="0" max="90" value="25" step="1"></div>
        <div class="control-row"><label>Concentration <span class="val" id="krConcVal">1.0 M</span></label>
          <input type="range" id="krConc" min="0.2" max="2.0" value="1.0" step="0.1"></div>
        <div class="control-row"><label>Surface area (particle size)</label>
          <div class="pill-select" id="krSurface">
            <button data-v="1" class="active">Lump</button>
            <button data-v="1.6">Granules</button>
            <button data-v="2.4">Powder</button>
          </div>
        </div>
        <div class="control-row toggle-row"><label style="margin:0;">Catalyst</label>
          <label class="switch"><input type="checkbox" id="krCatalyst"><span class="slider-toggle"></span></label>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="krRun">▶ Run Trial</button>
          <button class="btn btn-secondary" id="krClear">Clear Trials</button>
        </div>
      </div>
      <div class="readout-grid">
        <div class="readout"><div class="rv" id="krReadRate">—</div><div class="rl">Rate constant k</div></div>
        <div class="readout"><div class="rv" id="krReadT90">—</div><div class="rl">Time to 90%</div></div>
        <div class="readout"><div class="rv" id="krReadTrials">0</div><div class="rl">Trials run</div></div>
      </div>
      <div class="chart-box">
        <div class="chart-title">Progress vs. Time (all trials)</div>
        <canvas id="krChart" style="width:100%;height:170px;"></canvas>
      </div>
      <div class="control-panel">
        <h3>Trial log</h3>
        <div id="krTrialLog" style="font-size:.82rem;">No trials yet — change a variable and run one.</div>
      </div>
      <div class="control-panel">
        <h3>Challenge</h3>
        <p id="krChallengeText" style="font-size:.85rem;"></p>
        <div id="krChallengeUI"></div>
        <div id="krFeedback"></div>
      </div>
    `;
    els = {
      temp: container.querySelector('#krTemp'), tempVal: container.querySelector('#krTempVal'),
      conc: container.querySelector('#krConc'), concVal: container.querySelector('#krConcVal'),
      surface: container.querySelector('#krSurface'),
      catalyst: container.querySelector('#krCatalyst'),
      run: container.querySelector('#krRun'), clear: container.querySelector('#krClear'),
      readRate: container.querySelector('#krReadRate'), readT90: container.querySelector('#krReadT90'),
      readTrials: container.querySelector('#krReadTrials'),
      chart: container.querySelector('#krChart'), canvas: container.querySelector('#krCanvas'),
      log: container.querySelector('#krTrialLog'),
      challengeText: container.querySelector('#krChallengeText'),
      challengeUI: container.querySelector('#krChallengeUI'),
      feedback: container.querySelector('#krFeedback'),
    };
    els.temp.oninput = () => els.tempVal.textContent = els.temp.value+' °C';
    els.conc.oninput = () => els.concVal.textContent = parseFloat(els.conc.value).toFixed(1)+' M';
    els.surface.addEventListener('click', (e)=>{
      const b = e.target.closest('button'); if(!b) return;
      els.surface.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
    });
    els.run.onclick = runTrial;
    els.clear.onclick = clearTrials;
    drawParticles(25, 1, false, 0);
    generateChallenge();
  }

  function currentSurface() { return parseFloat(els.surface.querySelector('.active').dataset.v); }

  function runTrial() {
    if (running) return;
    const tempC = parseFloat(els.temp.value);
    const conc = parseFloat(els.conc.value);
    const surface = currentSurface();
    const catalyst = els.catalyst.checked;
    const k = computeK(tempC, conc, surface, catalyst);
    const t90 = Math.log(10)/k;
    trialCounter++;
    const trial = { id: trialCounter, tempC, conc, surface, catalyst, k, t90, points: [] };
    trials.push(trial);
    running = true;
    els.readRate.textContent = k.toExponential(2)+' /s';
    els.readT90.textContent = t90.toFixed(1)+' s';
    els.readTrials.textContent = trials.length;
    animateTrial(trial);
  }

  function animateTrial(trial) {
    const duration = Math.min(4500, Math.max(1400, trial.t90*250));
    const start = performance.now();
    const simDuration = trial.t90 * 1.3; // sim seconds mapped onto duration ms
    function step(now) {
      const frac = Math.min(1, (now-start)/duration);
      const simT = frac*simDuration;
      const progress = 1 - Math.exp(-trial.k*simT);
      trial.points.push({x: simT, y: progress*100});
      drawParticles(trial.tempC, trial.surface, trial.catalyst, progress);
      redrawChart();
      if (frac < 1) { raf = requestAnimationFrame(step); }
      else {
        running = false;
        updateLog();
        maybeAchievement();
        api.addXP(15, 'Kinetics trial');
      }
    }
    raf = requestAnimationFrame(step);
  }

  function drawParticles(tempC, surface, catalyst, progress) {
    const c = els.canvas; if(!c) return; const ctx = c.getContext('2d');
    const w=c.width,h=c.height; ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(0,0,w,h);
    const n = Math.round(10 + surface*6);
    const speed = 0.4 + tempC/40;
    const seedBase = Math.floor(progress*1000);
    for (let i=0;i<n;i++) {
      const seed = i*97 + Math.floor(performance.now()/ (60/speed)) + (catalyst?500:0);
      const x = (Math.sin(seed*0.6+i)*0.5+0.5)*(w-30)+15;
      const y = (Math.cos(seed*0.8+i*1.3)*0.5+0.5)*(h-30)+15;
      const reacted = (i/n) < progress;
      ctx.beginPath();
      ctx.fillStyle = reacted ? '#43A047' : '#FFB300';
      ctx.arc(x,y, reacted?5:6, 0, 7);
      ctx.fill();
    }
    ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif';
    ctx.fillText(`${Math.round(progress*100)}% converted`, 10, 18);
  }

  function redrawChart() {
    const series = trials.map((t,i) => ({
      label: 'Trial '+t.id, color: ['#1976D2','#E53935','#43A047','#8E24AA','#FB8C00','#00897B'][i%6],
      points: t.points, dots:false,
    }));
    api.Chart.line(els.chart, series, { xLabel:'s', yLabel:'%', yMin:0, yMax:100 });
  }

  function updateLog() {
    els.log.innerHTML = trials.slice().reverse().map(t => `
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #EEF1F6;">
        <span>Trial ${t.id}: ${t.tempC}°C, ${t.conc.toFixed(1)} M, ${t.surface===1?'Lump':t.surface===1.6?'Granules':'Powder'}${t.catalyst?', +catalyst':''}</span>
        <b>t₉₀ = ${t.t90.toFixed(1)}s</b>
      </div>`).join('');
  }

  function clearTrials() {
    trials = []; trialCounter = 0;
    els.readRate.textContent='—'; els.readT90.textContent='—'; els.readTrials.textContent='0';
    els.log.innerHTML = 'No trials yet — change a variable and run one.';
    redrawChart();
  }

  function generateChallenge() {
    const variants = [
      { text:'Run two trials at different temperatures (keep everything else the same). Which condition reaches 90% fastest?', type:'compare-fastest' },
      { text:'Run a trial with the catalyst OFF, then an identical trial with it ON. How many times faster is the catalyzed reaction?', type:'catalyst-factor' },
      { text:'Investigate the effect of surface area: run trials with Lump, Granules and Powder at the same temperature and concentration. Rank them from slowest to fastest.', type:'surface-rank' },
    ];
    challenge = variants[Math.floor(Math.random()*variants.length)];
    els.challengeText.textContent = challenge.text;
    if (challenge.type === 'compare-fastest') {
      els.challengeUI.innerHTML = `<button class="btn btn-secondary btn-sm" id="krAnswerFastest">I've found the fastest trial — check it</button>`;
      els.challengeUI.querySelector('#krAnswerFastest').onclick = () => {
        if (trials.length < 2) { els.feedback.innerHTML = `<div class="feedback-box incorrect">Run at least two trials first.</div>`; return; }
        const fastest = trials.reduce((a,b)=> a.t90<b.t90?a:b);
        els.feedback.innerHTML = `<div class="feedback-box correct"><h4>Result</h4>Trial ${fastest.id} (${fastest.tempC}°C) reached 90% conversion fastest, in ${fastest.t90.toFixed(1)}s. Higher temperature gives particles more kinetic energy, so collisions happen more often and with enough energy to react — increasing the rate.</div>`;
        api.addXP(30, 'Kinetics challenge'); api.recordCompletion('kinetics', 100);
        api.unlockAchievement('fastest_investigator');
      };
    } else if (challenge.type === 'catalyst-factor') {
      els.challengeUI.innerHTML = `<button class="btn btn-secondary btn-sm" id="krAnswerCatalyst">Compare my catalyst trials</button>`;
      els.challengeUI.querySelector('#krAnswerCatalyst').onclick = () => {
        const withCat = trials.filter(t=>t.catalyst); const withoutCat = trials.filter(t=>!t.catalyst);
        if (withCat.length===0 || withoutCat.length===0) { els.feedback.innerHTML = `<div class="feedback-box incorrect">Run one trial with the catalyst ON and one with it OFF.</div>`; return; }
        const ratio = withoutCat[withoutCat.length-1].t90 / withCat[withCat.length-1].t90;
        els.feedback.innerHTML = `<div class="feedback-box correct"><h4>Result</h4>The catalyzed reaction was about <b>${ratio.toFixed(1)}×</b> faster. A catalyst provides an alternative pathway with a lower activation energy, so more collisions succeed without changing the temperature.</div>`;
        api.addXP(30, 'Kinetics challenge'); api.recordCompletion('kinetics', 100);
      };
    } else {
      els.challengeUI.innerHTML = `<button class="btn btn-secondary btn-sm" id="krAnswerSurface">Check my ranking</button>`;
      els.challengeUI.querySelector('#krAnswerSurface').onclick = () => {
        const bySurf = {1:null,1.6:null,2.4:null};
        trials.forEach(t=>{ bySurf[t.surface]=t; });
        if (!bySurf[1]||!bySurf[1.6]||!bySurf[2.4]) { els.feedback.innerHTML = `<div class="feedback-box incorrect">Run one trial for each surface-area setting first (same temperature/concentration).</div>`; return; }
        els.feedback.innerHTML = `<div class="feedback-box correct"><h4>Result</h4>Powder reacted fastest (t₉₀=${bySurf[2.4].t90.toFixed(1)}s), then Granules (${bySurf[1.6].t90.toFixed(1)}s), then the Lump was slowest (${bySurf[1].t90.toFixed(1)}s). Smaller particles expose more surface area, giving more opportunities for collisions between reacting particles.</div>`;
        api.addXP(30, 'Kinetics challenge'); api.recordCompletion('kinetics', 100);
      };
    }
  }

  function maybeAchievement() {
    if (trials.length >= 3) { /* enough data for comparisons */ }
  }

  function unmount() { if (raf) cancelAnimationFrame(raf); raf=null; }
  window.SIMULATIONS = window.SIMULATIONS || {};
  window.SIMULATIONS.kinetics = { mount, unmount };
})();
