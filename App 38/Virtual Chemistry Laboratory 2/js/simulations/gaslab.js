/* GasLab — The Invisible World (Ideal Gas Law: PV = nRT) */
(function(){
  const R = 0.082057; // L·atm/(mol·K)
  let api = null, els = {}, raf = null;
  let V = 10, tempC = 25, n = 1.0;
  let dataPoints = [];
  let graphMode = 'PV';
  let target = null;
  let particlePhase = 0;

  function pressure() { const T = tempC+273.15; return (n*R*T)/V; }

  function mount(container, apiRef) {
    api = apiRef;
    V=10; tempC=25; n=1.0; dataPoints=[]; graphMode='PV';
    container.innerHTML = `
      <div class="viz-stage" id="glStage" style="min-height:220px;">
        <canvas id="glCanvas" width="300" height="210" style="width:100%;max-width:300px;"></canvas>
      </div>
      <div class="readout-grid">
        <div class="readout"><div class="rv" id="glP">—</div><div class="rl">Pressure (atm)</div></div>
        <div class="readout"><div class="rv" id="glV">10.0</div><div class="rl">Volume (L)</div></div>
        <div class="readout"><div class="rv" id="glT">298 K</div><div class="rl">Temperature</div></div>
        <div class="readout"><div class="rv" id="glN">1.00</div><div class="rl">Moles (n)</div></div>
      </div>
      <div class="control-panel">
        <h3>Controls</h3>
        <div class="control-row"><label>Volume <span class="val" id="glVVal">10.0 L</span></label>
          <input type="range" id="glVolume" min="2" max="30" value="10" step="0.5"></div>
        <div class="control-row"><label>Temperature <span class="val" id="glTVal">25 °C</span></label>
          <input type="range" id="glTemp" min="-20" max="200" value="25" step="1"></div>
        <div class="control-row"><label>Amount of gas <span class="val" id="glNVal">1.00 mol</span></label>
          <input type="range" id="glMoles" min="0.2" max="3" value="1" step="0.1"></div>
        <button class="btn btn-secondary btn-block" id="glRecord">📍 Record data point</button>
      </div>
      <div class="control-panel">
        <h3>Investigation graph</h3>
        <div class="pill-select" id="glGraphMode">
          <button data-v="PV" class="active">P vs V</button>
          <button data-v="VT">V vs T</button>
          <button data-v="PT">P vs T</button>
        </div>
        <div class="chart-box" style="margin-top:10px;">
          <canvas id="glChart" style="width:100%;height:170px;"></canvas>
        </div>
        <button class="btn btn-tertiary btn-sm" id="glClearData">Clear recorded points</button>
      </div>
      <div class="control-panel">
        <h3>Challenge</h3>
        <p id="glChallengeText" style="font-size:.85rem;"></p>
        <button class="btn btn-primary btn-sm" id="glCheckTarget">Check if I've reached the target</button>
        <div id="glFeedback"></div>
      </div>
    `;
    els = {
      canvas: container.querySelector('#glCanvas'),
      P: container.querySelector('#glP'), V_: container.querySelector('#glV'), T_: container.querySelector('#glT'), N_: container.querySelector('#glN'),
      volume: container.querySelector('#glVolume'), vVal: container.querySelector('#glVVal'),
      temp: container.querySelector('#glTemp'), tVal: container.querySelector('#glTVal'),
      moles: container.querySelector('#glMoles'), nVal: container.querySelector('#glNVal'),
      record: container.querySelector('#glRecord'),
      graphMode: container.querySelector('#glGraphMode'),
      chart: container.querySelector('#glChart'),
      clearData: container.querySelector('#glClearData'),
      challengeText: container.querySelector('#glChallengeText'),
      checkTarget: container.querySelector('#glCheckTarget'),
      feedback: container.querySelector('#glFeedback'),
    };
    els.volume.oninput = () => { V=parseFloat(els.volume.value); update(); };
    els.temp.oninput = () => { tempC=parseFloat(els.temp.value); update(); };
    els.moles.oninput = () => { n=parseFloat(els.moles.value); update(); };
    els.record.onclick = recordPoint;
    els.graphMode.addEventListener('click',(e)=>{
      const b=e.target.closest('button'); if(!b) return;
      els.graphMode.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); graphMode=b.dataset.v; redrawChart();
    });
    els.clearData.onclick = () => { dataPoints=[]; redrawChart(); };
    els.checkTarget.onclick = checkTarget;

    newChallenge();
    update();
    animateParticles();
  }

  function update() {
    const P = pressure();
    els.P.textContent = P.toFixed(2);
    els.V_.textContent = V.toFixed(1);
    els.T_.textContent = (tempC+273.15).toFixed(0)+' K';
    els.N_.textContent = n.toFixed(2);
    els.vVal.textContent = V.toFixed(1)+' L';
    els.tVal.textContent = tempC+' °C';
    els.nVal.textContent = n.toFixed(2)+' mol';
    drawChamber(P);
  }

  function drawChamber(P) {
    const c = els.canvas; const ctx = c.getContext('2d');
    const w=c.width,h=c.height; ctx.clearRect(0,0,w,h);
    // cylinder
    const cx0=60, cx1=240, cy0=30, cy1=170;
    ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.lineWidth=3;
    ctx.strokeRect(cx0,cy0,cx1-cx0,cy1-cy0);
    // piston position based on V (2-30L mapped to chamber)
    const vFrac = (V-2)/(30-2);
    const pistonX = cx0 + 14 + vFrac*(cx1-cx0-28);
    // gas region (from pistonX to right wall)... let's have piston on left, gas fills right portion inversely
    const gasX0 = cx0+6, gasX1 = cx0+14+vFrac*(cx1-cx0-28);
    ctx.fillStyle = 'rgba(38,198,218,0.18)';
    ctx.fillRect(gasX0,cy0+4,gasX1-gasX0,cy1-cy0-8);
    // piston bar
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(gasX1,cy0-6,8,cy1-cy0+12);
    // particles
    const nParticles = Math.round(8+n*10);
    const speed = 0.4+Math.max(0,(tempC+30))/60;
    particlePhase += 0.01*speed;
    for (let i=0;i<nParticles;i++) {
      const seed=i*53.7;
      const x = gasX0+6 + ((Math.sin(particlePhase*3+seed)*0.5+0.5))*(gasX1-gasX0-12);
      const y = cy0+10 + ((Math.cos(particlePhase*2.6+seed*1.7)*0.5+0.5))*(cy1-cy0-20);
      ctx.beginPath(); ctx.fillStyle='#FFB300'; ctx.arc(x,y,3.4,0,7); ctx.fill();
    }
    // gauge
    ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif';
    ctx.fillText(P.toFixed(2)+' atm', 90, 195);
  }

  function animateParticles() {
    update();
    raf = requestAnimationFrame(animateParticles);
  }

  function recordPoint() {
    const P = pressure();
    dataPoints.push({ P, V, T:tempC+273.15, n });
    if (dataPoints.length>60) dataPoints.shift();
    redrawChart();
    api.addXP(8, 'Data point recorded');
  }

  function redrawChart() {
    let pts;
    if (graphMode==='PV') pts = dataPoints.map(d=>({x:d.V,y:d.P}));
    else if (graphMode==='VT') pts = dataPoints.map(d=>({x:d.T,y:d.V}));
    else pts = dataPoints.map(d=>({x:d.T,y:d.P}));
    api.Chart.line(els.chart, [{ label:graphMode, color:'#1976D2', points:pts, dots:true }], {});
  }

  function newChallenge() {
    const targetP = +(1.0 + Math.random()*3).toFixed(2);
    target = targetP;
    els.challengeText.textContent = `Adjust volume and/or temperature (moles fixed) to reach a pressure of approximately ${targetP} atm (±0.1).`;
  }

  function checkTarget() {
    const P = pressure();
    const ok = Math.abs(P-target) <= 0.1;
    if (ok) {
      els.feedback.innerHTML = `<div class="feedback-box correct"><h4>✓ Target reached!</h4>Current pressure is ${P.toFixed(2)} atm. From PV = nRT: reducing volume or raising temperature both increase pressure, because particles hit the walls harder and/or more often.</div>`;
      api.addXP(35, 'GasLab challenge'); api.recordCompletion('gaslab', 100);
      setTimeout(newChallenge, 2500);
    } else {
      els.feedback.innerHTML = `<div class="feedback-box incorrect"><h4>Not there yet</h4>Current pressure is ${P.toFixed(2)} atm, target is ${target} atm. Try adjusting volume (P ∝ 1/V) or temperature (P ∝ T).</div>`;
      api.addXP(5, 'attempt recorded');
    }
  }

  function unmount() { if (raf) cancelAnimationFrame(raf); raf=null; }
  window.SIMULATIONS = window.SIMULATIONS || {};
  window.SIMULATIONS.gaslab = { mount, unmount };
})();
