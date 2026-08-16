/* ThermoQuest — Energy in Chemistry (Thermochemistry & Calorimetry) */
(function(){
  const MATERIALS = [
    { id:'copper', name:'Copper block', c:0.385, hot:95 },
    { id:'aluminum', name:'Aluminum block', c:0.897, hot:95 },
    { id:'iron', name:'Iron block', c:0.449, hot:95 },
    { id:'ice_sample', name:'Cold steel block', c:0.466, hot:5 },
  ];
  const C_WATER = 4.184; // J/g°C

  let raf = null;
  let api = null;
  let els = {};
  let sim = { running:false, t:0, waterTemp:25, finalTemp:25, history:[], phase:'idle' };
  let challenge = null;

  function calc(massSample, cSample, tSampleInit, massWater, tWaterInit) {
    const cWater = C_WATER;
    const tFinal = (massSample*cSample*tSampleInit + massWater*cWater*tWaterInit) / (massSample*cSample + massWater*cWater);
    return tFinal;
  }

  function mount(container, apiRef) {
    api = apiRef;
    container.innerHTML = `
      <div class="sim-tabs" id="tqTabs">
        <button class="sim-tab active" data-tab="lab">Calorimeter</button>
        <button class="sim-tab" data-tab="learn">Learn</button>
      </div>
      <div id="tqLabPane">
        <div class="viz-stage" id="tqStage" style="min-height:220px;">
          <canvas id="tqCanvas" width="320" height="220" style="width:100%;max-width:320px;height:220px;"></canvas>
        </div>
        <div class="control-panel">
          <h3 style="margin-bottom:10px;">1 · Set up the experiment</h3>
          <div class="control-row">
            <label>Sample material</label>
            <select id="tqMaterial">${MATERIALS.map(m=>`<option value="${m.id}">${m.name} (c = ${m.c} J/g°C)</option>`).join('')}</select>
          </div>
          <div class="control-row">
            <label>Sample mass <span class="val" id="tqMassVal">50 g</span></label>
            <input type="range" id="tqMass" min="10" max="200" value="50" step="5">
          </div>
          <div class="control-row">
            <label>Water mass <span class="val" id="tqWaterMassVal">150 g</span></label>
            <input type="range" id="tqWaterMass" min="50" max="300" value="150" step="10">
          </div>
          <div class="control-row">
            <label>Initial water temperature <span class="val" id="tqWaterTempVal">25 °C</span></label>
            <input type="range" id="tqWaterTemp" min="10" max="40" value="25" step="1">
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" id="tqStart">▶ Start Experiment</button>
            <button class="btn btn-secondary" id="tqReset">Reset</button>
          </div>
        </div>

        <div class="readout-grid">
          <div class="readout"><div class="rv" id="tqReadInit">25.0°C</div><div class="rl">Initial water T</div></div>
          <div class="readout"><div class="rv" id="tqReadFinal">—</div><div class="rl">Final water T</div></div>
          <div class="readout"><div class="rv" id="tqReadTime">0.0 s</div><div class="rl">Elapsed time</div></div>
        </div>

        <div class="chart-box">
          <div class="chart-title">Temperature vs. Time</div>
          <canvas id="tqChart" style="width:100%;height:160px;"></canvas>
        </div>

        <div class="control-panel" id="tqCalcPanel" style="display:none;">
          <h3>2 · Record &amp; calculate</h3>
          <p class="muted" style="font-size:.82rem;">Use your readings to calculate the heat transferred to the water. q = m × c × ΔT (c<sub>water</sub> = 4.184 J/g°C)</p>
          <div class="control-row">
            <label>ΔT of water (°C)</label>
            <input type="number" id="tqDeltaTInput" step="0.1" placeholder="Final − Initial">
          </div>
          <div class="control-row">
            <label>Heat transferred, q (Joules)</label>
            <input type="number" id="tqQInput" step="1" placeholder="q = m × c × ΔT">
          </div>
          <button class="btn btn-primary btn-block" id="tqCheck">Check My Calculation</button>
          <div id="tqFeedback"></div>
        </div>

        <div class="control-panel">
          <h3>Challenge</h3>
          <p id="tqChallengeText" style="font-size:.85rem;">Run an experiment above, then a challenge question will appear here.</p>
        </div>
      </div>
      <div id="tqLearnPane" style="display:none;">
        <div class="card"><h3>Heat & Temperature</h3><p style="font-size:.88rem;">Temperature measures the average kinetic energy of particles. Heat (q) is energy that flows between objects because of a temperature difference — measured in joules (J).</p></div>
        <div class="card"><h3>Specific Heat Capacity</h3><p style="font-size:.88rem;">Specific heat capacity (c) is the energy needed to raise 1 g of a substance by 1°C. Water has an unusually high c (4.184 J/g°C), which is why it resists temperature change.</p></div>
        <div class="card"><h3>Calorimetry</h3><p style="font-size:.88rem;">A calorimeter is an insulated container used to measure heat flow. By measuring a temperature change in a known mass of water, we can calculate q = m·c·ΔT.</p></div>
        <div class="card"><h3>Exothermic vs Endothermic</h3><p style="font-size:.88rem;">If a sample is hotter than the water, heat flows from the sample into the water (the water's temperature rises). If the sample is colder, heat flows out of the water into the sample (the water cools). Energy is always conserved — heat lost by one object equals heat gained by the other.</p></div>
      </div>
    `;
    els = {
      material: container.querySelector('#tqMaterial'),
      mass: container.querySelector('#tqMass'),
      massVal: container.querySelector('#tqMassVal'),
      waterMass: container.querySelector('#tqWaterMass'),
      waterMassVal: container.querySelector('#tqWaterMassVal'),
      waterTemp: container.querySelector('#tqWaterTemp'),
      waterTempVal: container.querySelector('#tqWaterTempVal'),
      start: container.querySelector('#tqStart'),
      reset: container.querySelector('#tqReset'),
      readInit: container.querySelector('#tqReadInit'),
      readFinal: container.querySelector('#tqReadFinal'),
      readTime: container.querySelector('#tqReadTime'),
      chart: container.querySelector('#tqChart'),
      canvas: container.querySelector('#tqCanvas'),
      calcPanel: container.querySelector('#tqCalcPanel'),
      deltaTInput: container.querySelector('#tqDeltaTInput'),
      qInput: container.querySelector('#tqQInput'),
      check: container.querySelector('#tqCheck'),
      feedback: container.querySelector('#tqFeedback'),
      challengeText: container.querySelector('#tqChallengeText'),
    };

    container.querySelector('#tqTabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.sim-tab'); if (!btn) return;
      container.querySelectorAll('.sim-tab').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      const learn = btn.dataset.tab === 'learn';
      container.querySelector('#tqLearnPane').style.display = learn ? 'block':'none';
      container.querySelector('#tqLabPane').style.display = learn ? 'none':'block';
    });

    els.mass.oninput = () => els.massVal.textContent = els.mass.value+' g';
    els.waterMass.oninput = () => els.waterMassVal.textContent = els.waterMass.value+' g';
    els.waterTemp.oninput = () => { els.waterTempVal.textContent = els.waterTemp.value+' °C'; els.readInit.textContent = parseFloat(els.waterTemp.value).toFixed(1)+'°C'; };
    els.start.onclick = startExperiment;
    els.reset.onclick = resetExperiment;
    els.check.onclick = checkCalc;

    drawStage(25, 25, false);
    ChartHelperDraw();
    generateChallenge();
  }

  function generateChallenge() {
    const m = MATERIALS[Math.floor(Math.random()*MATERIALS.length)];
    const mass = 40 + Math.round(Math.random()*120/5)*5;
    const wMass = 100 + Math.round(Math.random()*150/10)*10;
    els.material.value = m.id;
    els.mass.value = mass; els.massVal.textContent = mass+' g';
    els.waterMass.value = wMass; els.waterMassVal.textContent = wMass+' g';
    const tasks = [
      `Determine the heat absorbed by the water when the ${m.name.toLowerCase()} (${mass} g) is dropped in.`,
      `Calculate the temperature change of the water for this trial.`,
      `Predict whether heat enters or leaves the water in this setup, then verify by running the experiment.`,
    ];
    challenge = { material: m, mass, waterMass: wMass, task: tasks[Math.floor(Math.random()*tasks.length)] };
    els.challengeText.textContent = challenge.task;
  }

  function drawStage(waterTemp, sampleTemp, dropped) {
    const c = els.canvas; if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    ctx.clearRect(0,0,w,h);
    // beaker
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(90,40); ctx.lineTo(90,180); ctx.quadraticCurveTo(90,200,110,200); ctx.lineTo(210,200); ctx.quadraticCurveTo(230,200,230,180); ctx.lineTo(230,40); ctx.stroke();
    // water fill colored by temp
    const t = Math.max(0,Math.min(1,(waterTemp-5)/95));
    const r = Math.round(38 + t*217), g = Math.round(166 - t*90), b = Math.round(218 - t*160);
    ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
    ctx.beginPath(); ctx.moveTo(92,90); ctx.lineTo(92,180); ctx.quadraticCurveTo(92,198,110,198); ctx.lineTo(210,198); ctx.quadraticCurveTo(228,198,228,180); ctx.lineTo(228,90); ctx.closePath(); ctx.fill();
    // sample block
    if (dropped) {
      ctx.fillStyle = '#B0BEC5';
      ctx.fillRect(140,140,40,30);
      ctx.strokeStyle = '#78909C'; ctx.strokeRect(140,140,40,30);
    }
    // thermometer
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign='center';
    ctx.fillText(waterTemp.toFixed(1)+'°C', 160, 30);
    ctx.textAlign='left';
  }

  function ChartHelperDraw() {
    api.Chart.line(els.chart, [{ label:'Water T', color:'#26C6DA', points: sim.history, fill:true }], { yLabel:'°C', xLabel:'s' });
  }

  function startExperiment() {
    if (sim.running) return;
    const matId = els.material.value;
    const mat = MATERIALS.find(m=>m.id===matId);
    const mass = parseFloat(els.mass.value);
    const waterMass = parseFloat(els.waterMass.value);
    const waterTempInit = parseFloat(els.waterTemp.value);
    const tFinal = calc(mass, mat.c, mat.hot, waterMass, waterTempInit);

    sim = { running:true, t:0, waterTemp:waterTempInit, finalTemp:tFinal, history:[{x:0,y:waterTempInit}], phase:'running', mass, mat, waterMass, waterTempInit };
    els.readInit.textContent = waterTempInit.toFixed(1)+'°C';
    els.readFinal.textContent = '—';
    els.calcPanel.style.display = 'none';
    els.feedback.innerHTML = '';
    drawStage(waterTempInit, mat.hot, true);
    animate();
  }

  function animate() {
    if (raf) cancelAnimationFrame(raf);
    const duration = 3200; // ms
    const startTime = performance.now();
    const { waterTempInit, finalTemp } = sim;
    function step(now) {
      const elapsed = now - startTime;
      const frac = Math.min(1, elapsed/duration);
      // ease toward final temp (exponential approach)
      const eased = 1 - Math.pow(1-frac, 2);
      const currentTemp = waterTempInit + (finalTemp - waterTempInit)*eased;
      sim.waterTemp = currentTemp;
      sim.t = elapsed/1000;
      sim.history.push({x: sim.t, y: currentTemp});
      els.readTime.textContent = sim.t.toFixed(1)+' s';
      drawStage(currentTemp, sim.mat.hot, true);
      ChartHelperDraw();
      if (frac < 1) {
        raf = requestAnimationFrame(step);
      } else {
        sim.running = false;
        els.readFinal.textContent = finalTemp.toFixed(1)+'°C';
        els.calcPanel.style.display = 'block';
      }
    }
    raf = requestAnimationFrame(step);
  }

  function resetExperiment() {
    if (raf) cancelAnimationFrame(raf);
    sim = { running:false, t:0, waterTemp:25, finalTemp:25, history:[], phase:'idle' };
    els.readInit.textContent = parseFloat(els.waterTemp.value).toFixed(1)+'°C';
    els.readFinal.textContent = '—';
    els.readTime.textContent = '0.0 s';
    els.calcPanel.style.display = 'none';
    els.feedback.innerHTML = '';
    drawStage(parseFloat(els.waterTemp.value), 25, false);
    ChartHelperDraw();
    generateChallenge();
  }

  function checkCalc() {
    if (sim.phase !== 'running' && sim.waterTempInit === undefined) return;
    const actualDeltaT = sim.finalTemp - sim.waterTempInit;
    const actualQ = sim.waterMass * 4.184 * actualDeltaT;
    const userDT = parseFloat(els.deltaTInput.value);
    const userQ = parseFloat(els.qInput.value);
    const dtOk = !isNaN(userDT) && Math.abs(userDT - actualDeltaT) <= 0.5;
    const qOk = !isNaN(userQ) && Math.abs(userQ - actualQ) <= Math.abs(actualQ)*0.08 + 5;
    let acc = (dtOk?50:0) + (qOk?50:0);
    if (dtOk && qOk) {
      els.feedback.innerHTML = `<div class="feedback-box correct"><h4>✓ Correct!</h4>
        The water's temperature changed by ${actualDeltaT.toFixed(1)}°C. Using q = m × c × ΔT = ${sim.waterMass} g × 4.184 J/g°C × ${actualDeltaT.toFixed(1)}°C ≈ <b>${actualQ.toFixed(0)} J</b>.
        ${actualDeltaT>0 ? 'Since the water warmed up, heat flowed from the sample into the water — an exothermic transfer for the sample.' : 'Since the water cooled down, heat flowed from the water into the sample — an endothermic transfer for the sample.'}</div>`;
      api.addXP(40, 'ThermoQuest experiment');
      api.recordCompletion('thermo', acc);
    } else {
      let msg = '<div class="feedback-box incorrect"><h4>Not quite</h4>';
      if (!dtOk) msg += `Your ΔT should be Final − Initial = ${sim.finalTemp.toFixed(1)} − ${sim.waterTempInit.toFixed(1)} = <b>${actualDeltaT.toFixed(1)}°C</b>. `;
      if (!qOk) msg += `Recheck your formula: q = m(water) × c(water) × ΔT = ${sim.waterMass} × 4.184 × ΔT. Expected q ≈ <b>${actualQ.toFixed(0)} J</b>.`;
      msg += '</div>';
      els.feedback.innerHTML = msg;
      api.addXP(10, 'attempt recorded');
    }
  }

  function unmount() { if (raf) cancelAnimationFrame(raf); raf = null; }

  window.SIMULATIONS = window.SIMULATIONS || {};
  window.SIMULATIONS.thermo = { mount, unmount };
})();
