/* Solubility Explorer — Saturation Station */
(function(){
  const SOLUTES = {
    kno3: { name:'Potassium nitrate (KNO3)', color:'#8E24AA', curve:[[0,13],[10,21],[20,32],[30,46],[40,64],[50,85],[60,110],[70,138],[80,169],[90,202],[100,246]] },
    nacl: { name:'Sodium chloride (NaCl)', color:'#1976D2', curve:[[0,35.7],[20,36.0],[40,36.6],[60,37.3],[80,38.4],[100,39.2]] },
    sucrose: { name:'Sucrose (table sugar)', color:'#43A047', curve:[[0,179],[20,203],[40,238],[60,287],[80,362],[100,487]] },
  };
  let api = null, els = {};
  let soluteId = 'kno3', tempC = 25, waterMass = 100, added = 40;
  let trials = [];
  let recorded = [];

  function solubilityAt(id, T) {
    const curve = SOLUTES[id].curve;
    for (let i=0;i<curve.length-1;i++) {
      const [t0,s0] = curve[i], [t1,s1] = curve[i+1];
      if (T >= t0 && T <= t1) { const f=(T-t0)/(t1-t0); return s0 + f*(s1-s0); }
    }
    return T < curve[0][0] ? curve[0][1] : curve[curve.length-1][1];
  }

  function mount(container, apiRef) {
    api = apiRef; recorded = [];
    container.innerHTML = `
      <div class="viz-stage light" style="min-height:200px;">
        <svg id="solBeaker" viewBox="0 0 140 160" style="width:150px;height:170px;">
          <rect x="25" y="15" width="90" height="130" rx="6" fill="#eaf3ff" stroke="#90a4bf" stroke-width="2.5"/>
          <rect id="solWater" x="28" y="80" width="84" height="62" fill="#4fc3f7" opacity="0.5"/>
          <g id="solCrystals"></g>
        </svg>
      </div>
      <div class="readout-grid">
        <div class="readout"><div class="rv" id="solState">Unsaturated</div><div class="rl">State</div></div>
        <div class="readout"><div class="rv" id="solMax">—</div><div class="rl">Max soluble (g)</div></div>
        <div class="readout"><div class="rv" id="solUndiss">0 g</div><div class="rl">Undissolved</div></div>
      </div>
      <div class="control-panel">
        <h3>Setup</h3>
        <div class="control-row"><label>Solute</label>
          <select id="solSolute">${Object.entries(SOLUTES).map(([id,s])=>`<option value="${id}">${s.name}</option>`).join('')}</select>
        </div>
        <div class="control-row"><label>Solute added <span class="val" id="solAddedVal">40 g</span></label>
          <input type="range" id="solAdded" min="0" max="260" value="40" step="1"></div>
        <div class="control-row"><label>Water <span class="val" id="solWaterVal">100 g</span></label>
          <input type="range" id="solWater" min="50" max="200" value="100" step="10"></div>
        <div class="control-row"><label>Temperature <span class="val" id="solTempVal">25 °C</span></label>
          <input type="range" id="solTemp" min="0" max="100" value="25" step="1"></div>
        <button class="btn btn-secondary btn-block" id="solRecord">📍 Record this trial</button>
      </div>
      <div class="chart-box">
        <div class="chart-title">Solubility curve (g / 100 g water) vs Temperature</div>
        <canvas id="solChart" style="width:100%;height:180px;"></canvas>
      </div>
      <div class="control-panel">
        <h3>Trial data</h3>
        <div id="solTable" style="font-size:.78rem;">No trials recorded yet.</div>
      </div>
      <div class="control-panel">
        <h3>Challenge</h3>
        <p id="solChallengeText" style="font-size:.85rem;"></p>
        <button class="btn btn-primary btn-sm" id="solCheckChallenge">Check</button>
        <div id="solFeedback"></div>
      </div>
    `;
    els = {
      solute: container.querySelector('#solSolute'),
      added: container.querySelector('#solAdded'), addedVal: container.querySelector('#solAddedVal'),
      water: container.querySelector('#solWater'), waterVal: container.querySelector('#solWaterVal'),
      temp: container.querySelector('#solTemp'), tempVal: container.querySelector('#solTempVal'),
      state: container.querySelector('#solState'), max: container.querySelector('#solMax'), undiss: container.querySelector('#solUndiss'),
      water_svg: container.querySelector('#solWater'), crystals: container.querySelector('#solCrystals'),
      record: container.querySelector('#solRecord'),
      chart: container.querySelector('#solChart'),
      table: container.querySelector('#solTable'),
      challengeText: container.querySelector('#solChallengeText'),
      checkChallenge: container.querySelector('#solCheckChallenge'),
      feedback: container.querySelector('#solFeedback'),
    };
    els.solute.onchange = () => { soluteId = els.solute.value; update(); };
    els.added.oninput = () => { added=parseFloat(els.added.value); els.addedVal.textContent=added+' g'; update(); };
    els.water.oninput = () => { waterMass=parseFloat(els.water.value); els.waterVal.textContent=waterMass+' g'; update(); };
    els.temp.oninput = () => { tempC=parseFloat(els.temp.value); els.tempVal.textContent=tempC+' °C'; update(); };
    els.record.onclick = recordTrial;
    els.checkChallenge.onclick = checkChallenge;
    newChallenge();
    update();
  }

  function update() {
    const maxSoluble = solubilityAt(soluteId, tempC) * (waterMass/100);
    const undissolved = Math.max(0, added - maxSoluble);
    let state;
    if (added < maxSoluble*0.98) state='Unsaturated';
    else if (undissolved > 0.5) state='Saturated (excess solid)';
    else state='Saturated';
    els.state.textContent = state;
    els.max.textContent = maxSoluble.toFixed(1);
    els.undiss.textContent = undissolved.toFixed(1)+' g';
    els.state.style.color = state==='Unsaturated' ? '#1976D2' : (undissolved>0.5 ? '#E53935' : '#43A047');
    // draw crystals
    els.crystals.innerHTML = '';
    const nCrystals = Math.min(18, Math.round(undissolved/4));
    for (let i=0;i<nCrystals;i++) {
      const x = 32 + (i%9)*9;
      const y = 132 - Math.floor(i/9)*7;
      const r = document.createElementNS('http://www.w3.org/2000/svg','rect');
      r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', 6); r.setAttribute('height', 6);
      r.setAttribute('fill', SOLUTES[soluteId].color); r.setAttribute('opacity','0.85');
      els.crystals.appendChild(r);
    }
    els.water_svg.setAttribute('fill', SOLUTES[soluteId].color);
    els.water_svg.setAttribute('opacity', Math.min(0.65, 0.25 + added/maxSoluble*0.3));
    redrawChart();
  }

  function redrawChart() {
    const s = SOLUTES[soluteId];
    const curvePts = s.curve.map(([t,v])=>({x:t,y:v}));
    const series = [{ label:'Solubility curve', color:s.color, points: curvePts }];
    const myPoints = recorded.filter(r=>r.soluteId===soluteId).map(r=>({x:r.tempC, y:r.maxSoluble}));
    if (myPoints.length) series.push({ label:'My trials', color:'#212121', points: myPoints, dots:true });
    api.Chart.line(els.chart, series, { yLabel:'g/100g', xLabel:'°C' });
  }

  function recordTrial() {
    const maxSoluble = solubilityAt(soluteId, tempC) * 100/waterMass * (waterMass/100); // g per 100g water at T
    const per100 = solubilityAt(soluteId, tempC);
    recorded.push({ soluteId, tempC, waterMass, added, maxSoluble: per100 });
    trials.push({ soluteId, tempC, added, waterMass });
    els.table.innerHTML = recorded.slice().reverse().map(r => `
      <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #EEF1F6;">
        <span>${SOLUTES[r.soluteId].name.split(' (')[0]} @ ${r.tempC}°C</span><b>${r.maxSoluble.toFixed(0)} g/100g</b>
      </div>`).join('');
    api.addXP(10, 'Trial recorded');
    redrawChart();
  }

  function newChallenge() {
    const variants = [
      { text:'Prepare an unsaturated solution of any solute — add less solute than the maximum that can dissolve.', check: () => added < solubilityAt(soluteId,tempC)*(waterMass/100)*0.95 },
      { text:'Reach exact saturation — add solute so that it just barely all dissolves (within 5%).', check: () => { const m=solubilityAt(soluteId,tempC)*(waterMass/100); return Math.abs(added-m)<=m*0.05; } },
      { text:'Create a saturated solution with visible undissolved solid at the bottom.', check: () => added > solubilityAt(soluteId,tempC)*(waterMass/100)*1.05 },
      { text:'Using KNO3, compare solubility at 20°C and 80°C. Record a trial at each temperature, then click Check.', check: () => { const k = recorded.filter(r=>r.soluteId==='kno3'); return k.some(r=>r.tempC<=25) && k.some(r=>r.tempC>=70); } },
    ];
    const c = variants[Math.floor(Math.random()*variants.length)];
    window.__solChallenge = c;
    els.challengeText.textContent = c.text;
    els.feedback.innerHTML = '';
  }

  function checkChallenge() {
    const c = window.__solChallenge;
    if (c.check()) {
      els.feedback.innerHTML = `<div class="feedback-box correct"><h4>✓ Well done!</h4>Solubility generally increases with temperature for solids like these because more thermal energy helps break apart the solid's structure and separate particles into solution.</div>`;
      api.addXP(30, 'Solubility challenge'); api.recordCompletion('solubility', 100);
      setTimeout(newChallenge, 2500);
    } else {
      els.feedback.innerHTML = `<div class="feedback-box incorrect">Not yet — adjust the sliders to match the task, then check again.</div>`;
      api.addXP(5, 'attempt recorded');
    }
  }

  function unmount() {}
  window.SIMULATIONS = window.SIMULATIONS || {};
  window.SIMULATIONS.solubility = { mount, unmount };
})();
