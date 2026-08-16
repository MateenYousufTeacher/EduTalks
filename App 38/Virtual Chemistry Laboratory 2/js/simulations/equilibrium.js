/* Equilibrium Shift — Find the Balance (Dynamic Chemical Equilibrium)
   Reaction modeled: 2 A(g) <=> B(g)   (forward consumes 2 mol A to form 1 mol B)
   rate_f = kf * [A]^2 ,  rate_r = kr * [B]
   This mole imbalance lets pressure/volume disturbances shift equilibrium realistically. */
(function(){
  let api = null, raf = null, els = {};
  let A=4.0, B=0.5, kf0=0.045, kr0=0.06, tempC=25, running=false, t=0;
  let history = { fwd:[], rev:[], A:[], B:[] };
  let predictionMode = null; // {question, correct, resolved}
  let lastAction = null;
  let correctPredictions = 0;

  function rates() {
    const T = tempC+273.15;
    const kf = kf0*Math.exp((T-298)/25);
    const kr = kr0*Math.exp(-(T-298)/60);
    const rf = kf*A*A;
    const rr = kr*B;
    return {kf,kr,rf,rr};
  }

  function step(dt) {
    const {rf,rr} = rates();
    let dA = (-2*rf + 2*rr)*dt;
    let dB = (rf - rr)*dt;
    A = Math.max(0, A+dA);
    B = Math.max(0, B+dB);
    t += dt;
  }

  function mount(container, apiRef) {
    api = apiRef;
    A=4.0; B=0.5; tempC=25; t=0; running=false;
    history = { fwd:[], rev:[], A:[], B:[] };
    container.innerHTML = `
      <div class="viz-stage" id="eqStage" style="min-height:200px;">
        <canvas id="eqCanvas" width="300" height="190" style="width:100%;max-width:300px;"></canvas>
      </div>
      <div class="readout-grid">
        <div class="readout"><div class="rv" id="eqReadA">4.00</div><div class="rl">[A]</div></div>
        <div class="readout"><div class="rv" id="eqReadB">0.50</div><div class="rl">[B]</div></div>
        <div class="readout"><div class="rv" id="eqReadFwd">—</div><div class="rl">Forward rate</div></div>
        <div class="readout"><div class="rv" id="eqReadRev">—</div><div class="rl">Reverse rate</div></div>
      </div>
      <div class="control-panel">
        <h3>Run the system</h3>
        <div class="btn-row">
          <button class="btn btn-primary" id="eqRun">▶ Run</button>
          <button class="btn btn-secondary" id="eqPause">⏸ Pause</button>
          <button class="btn btn-tertiary" id="eqReset">Reset system</button>
        </div>
        <div class="control-row"><label>Temperature <span class="val" id="eqTempVal">25 °C</span></label>
          <input type="range" id="eqTemp" min="0" max="90" value="25" step="1"></div>
      </div>
      <div class="control-panel">
        <h3>Disturb the equilibrium (Le Chatelier)</h3>
        <div class="btn-row">
          <button class="btn btn-secondary btn-sm" id="eqAddA">+ Add A</button>
          <button class="btn btn-secondary btn-sm" id="eqAddB">+ Add B</button>
          <button class="btn btn-secondary btn-sm" id="eqRemoveB">− Remove B</button>
          <button class="btn btn-secondary btn-sm" id="eqCompress">⇩ Compress (½ volume)</button>
        </div>
      </div>
      <div class="chart-box">
        <div class="chart-title">Concentration vs. Time</div>
        <canvas id="eqChart" style="width:100%;height:160px;"></canvas>
      </div>
      <div class="control-panel">
        <h3>Predict, then verify</h3>
        <p id="eqPredictText" style="font-size:.85rem;"></p>
        <div class="pill-select" id="eqPredictOptions"></div>
        <div id="eqFeedback"></div>
      </div>
      <div class="info-box">Equilibrium means the <b>forward and reverse rates are equal</b> — not that the amounts of A and B are equal. The animation keeps moving even at equilibrium because the reaction never stops; it's dynamic.</div>
    `;
    els = {
      canvas: container.querySelector('#eqCanvas'),
      readA: container.querySelector('#eqReadA'), readB: container.querySelector('#eqReadB'),
      readFwd: container.querySelector('#eqReadFwd'), readRev: container.querySelector('#eqReadRev'),
      run: container.querySelector('#eqRun'), pause: container.querySelector('#eqPause'), reset: container.querySelector('#eqReset'),
      temp: container.querySelector('#eqTemp'), tempVal: container.querySelector('#eqTempVal'),
      addA: container.querySelector('#eqAddA'), addB: container.querySelector('#eqAddB'),
      removeB: container.querySelector('#eqRemoveB'), compress: container.querySelector('#eqCompress'),
      chart: container.querySelector('#eqChart'),
      predictText: container.querySelector('#eqPredictText'),
      predictOptions: container.querySelector('#eqPredictOptions'),
      feedback: container.querySelector('#eqFeedback'),
    };
    els.run.onclick = () => { running = true; loop(); };
    els.pause.onclick = () => { running = false; if(raf) cancelAnimationFrame(raf); };
    els.reset.onclick = resetSystem;
    els.temp.oninput = () => { tempC = parseFloat(els.temp.value); els.tempVal.textContent = tempC+' °C'; };
    els.addA.onclick = () => disturb('addA');
    els.addB.onclick = () => disturb('addB');
    els.removeB.onclick = () => disturb('removeB');
    els.compress.onclick = () => disturb('compress');

    newPrediction();
    draw();
    redrawChart();
    running = true; loop();
  }

  function disturb(action) {
    lastAction = action;
    if (action==='addA') A += 2;
    if (action==='addB') B += 1.5;
    if (action==='removeB') B = Math.max(0.05, B-0.6);
    if (action==='compress') { A *= 2; B *= 2; }
    if (!running) { running = true; loop(); }
    checkPrediction(action);
  }

  function loop() {
    if (!running) return;
    for (let i=0;i<6;i++) step(0.12);
    const {rf,rr} = rates();
    history.A.push({x:t,y:A}); history.B.push({x:t,y:B});
    history.fwd.push({x:t,y:rf}); history.rev.push({x:t,y:rr});
    if (history.A.length>400) { history.A.shift(); history.B.shift(); history.fwd.shift(); history.rev.shift(); }
    els.readA.textContent = A.toFixed(2);
    els.readB.textContent = B.toFixed(2);
    els.readFwd.textContent = rf.toFixed(3);
    els.readRev.textContent = rr.toFixed(3);
    draw();
    redrawChart();
    raf = requestAnimationFrame(loop);
  }

  function draw() {
    const c = els.canvas; if(!c) return; const ctx = c.getContext('2d');
    const w=c.width,h=c.height; ctx.clearRect(0,0,w,h);
    ctx.fillStyle='rgba(255,255,255,.04)'; ctx.fillRect(0,0,w,h);
    const nA = Math.min(28, Math.round(A*4));
    const nB = Math.min(28, Math.round(B*4));
    const time = performance.now()/900;
    for (let i=0;i<nA;i++) {
      const ang = i*2.4+time; const rad = 30+((i*37)%70);
      const x = w*0.32 + Math.cos(ang+i)*rad*0.5;
      const y = h*0.5 + Math.sin(ang*1.3+i)*rad*0.4;
      ctx.beginPath(); ctx.fillStyle='#FFB300'; ctx.arc(x,y,5,0,7); ctx.fill();
    }
    for (let i=0;i<nB;i++) {
      const ang = i*2.1+time*1.2; const rad = 30+((i*41)%70);
      const x = w*0.72 + Math.cos(ang+i)*rad*0.5;
      const y = h*0.5 + Math.sin(ang*1.1+i)*rad*0.4;
      ctx.beginPath(); ctx.fillStyle='#26C6DA'; ctx.arc(x,y,6,0,7); ctx.fill();
    }
    ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.moveTo(w/2,10); ctx.lineTo(w/2,h-10); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold 12px sans-serif';
    ctx.fillText('2 A', 14, 20); ctx.fillText('⇌', w/2-8, 20); ctx.fillText('B', w-30, 20);
  }

  function redrawChart() {
    api.Chart.line(els.chart, [
      { label:'[A]', color:'#FFB300', points: history.A },
      { label:'[B]', color:'#26C6DA', points: history.B },
    ], { yMin:0 });
  }

  function resetSystem() {
    A=4.0; B=0.5; t=0; tempC=25; els.temp.value=25; els.tempVal.textContent='25 °C';
    history = { fwd:[], rev:[], A:[], B:[] };
    draw(); redrawChart(); newPrediction();
  }

  function newPrediction() {
    const scenarios = [
      { action:'addA', q:'If you add more A, what happens to [B] once the system re-settles?', options:['[B] increases','[B] decreases','[B] stays the same'], correct:'[B] increases' },
      { action:'addB', q:'If you add more B, what happens to [A] once the system re-settles?', options:['[A] increases','[A] decreases','[A] stays the same'], correct:'[A] increases' },
      { action:'removeB', q:'If you remove some B, what happens to [A] once the system re-settles?', options:['[A] increases','[A] decreases','[A] stays the same'], correct:'[A] decreases' },
      { action:'compress', q:'If you compress the system to half the volume (2 A ⇌ B), which side does the equilibrium favor?', options:['The B side (fewer moles)','The A side (more moles)','No shift occurs'], correct:'The B side (fewer moles)' },
    ];
    predictionMode = scenarios[Math.floor(Math.random()*scenarios.length)];
    predictionMode.resolved = false;
    els.predictText.textContent = predictionMode.q + ' (Pick your answer, then use the matching button above to test it.)';
    els.predictOptions.innerHTML = predictionMode.options.map(o=>`<button data-o="${o}">${o}</button>`).join('');
    els.feedback.innerHTML = '';
    els.predictOptions.querySelectorAll('button').forEach(b=>{
      b.onclick = () => {
        els.predictOptions.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        predictionMode.userPick = b.dataset.o;
      };
    });
  }

  function checkPrediction(action) {
    if (!predictionMode || predictionMode.resolved || predictionMode.action !== action || !predictionMode.userPick) return;
    predictionMode.resolved = true;
    const correct = predictionMode.userPick === predictionMode.correct;
    setTimeout(() => {
      if (correct) {
        correctPredictions++;
        els.feedback.innerHTML = `<div class="feedback-box correct"><h4>✓ Correct prediction!</h4>Watch the graph — the system is re-establishing equilibrium as you predicted. This is Le Chatelier's principle: a system at equilibrium responds to a disturbance in the direction that partially counteracts it.</div>`;
        api.addXP(35, 'Correct equilibrium prediction');
        api.recordCompletion('equilibrium', 100);
        if (correctPredictions >= 5) api.unlockAchievement('equilibrium_master');
      } else {
        els.feedback.innerHTML = `<div class="feedback-box incorrect"><h4>Not quite</h4>The correct answer was "${predictionMode.correct}". Watch the concentration graph now to see why — the system shifts to relieve the disturbance.</div>`;
        api.addXP(10, 'attempt recorded');
      }
      setTimeout(newPrediction, 3800);
    }, 1400);
  }

  function unmount() { running=false; if (raf) cancelAnimationFrame(raf); raf=null; }
  window.SIMULATIONS = window.SIMULATIONS || {};
  window.SIMULATIONS.equilibrium = { mount, unmount };
})();
