/* Solution Studio — Concentration Master (Molarity, Preparation, Dilution) */
(function(){
  const SOLUTES = [
    { id:'nacl', name:'Sodium chloride (NaCl)', molar:58.44 },
    { id:'glucose', name:'Glucose (C6H12O6)', molar:180.16 },
    { id:'naoh', name:'Sodium hydroxide (NaOH)', molar:40.00 },
    { id:'kno3', name:'Potassium nitrate (KNO3)', molar:101.10 },
  ];
  let api = null, els = {};
  let mode = 'prepare';
  let task = null;
  let measuredMass = 0;

  function mount(container, apiRef) {
    api = apiRef;
    container.innerHTML = `
      <div class="sim-tabs" id="ssTabs">
        <button class="sim-tab active" data-tab="prepare">Prepare Solution</button>
        <button class="sim-tab" data-tab="dilute">Dilution Station</button>
      </div>
      <div id="ssPreparePane"></div>
      <div id="ssDilutePane" style="display:none;"></div>
    `;
    renderPrepare(container.querySelector('#ssPreparePane'));
    renderDilute(container.querySelector('#ssDilutePane'));
    container.querySelector('#ssTabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.sim-tab'); if (!btn) return;
      container.querySelectorAll('.sim-tab').forEach(t=>t.classList.remove('active'));
      btn.classList.add('active');
      const dilute = btn.dataset.tab === 'dilute';
      container.querySelector('#ssDilutePane').style.display = dilute ? 'block':'none';
      container.querySelector('#ssPreparePane').style.display = dilute ? 'none':'block';
    });
  }

  function newPrepareTask() {
    const solute = SOLUTES[Math.floor(Math.random()*SOLUTES.length)];
    const targetConc = [0.1,0.25,0.5,1.0,1.5][Math.floor(Math.random()*5)];
    const targetVolMl = [100,250,500][Math.floor(Math.random()*3)];
    const requiredMass = targetConc * (targetVolMl/1000) * solute.molar;
    task = { solute, targetConc, targetVolMl, requiredMass };
    return task;
  }

  function renderPrepare(pane) {
    newPrepareTask();
    pane.innerHTML = `
      <div class="viz-stage light" style="min-height:180px;">
        <svg id="ssFlaskSvg" viewBox="0 0 120 160" style="width:140px;height:180px;">
          <rect x="52" y="10" width="16" height="35" fill="#cfe4fb" stroke="#90a4bf"/>
          <path d="M40 45 L80 45 L100 130 Q102 150 80 150 L40 150 Q18 150 20 130 Z" fill="#eaf3ff" stroke="#90a4bf" stroke-width="2"/>
          <path id="ssLiquid" d="M40 130 L80 130 L100 130 Q102 150 80 150 L40 150 Q18 150 20 130 Z" fill="#26C6DA" opacity="0.75"/>
        </svg>
      </div>
      <div class="control-panel">
        <h3>Target</h3>
        <p style="font-size:.88rem;">Prepare <b id="ssTargetVol">${task.targetVolMl} mL</b> of <b id="ssTargetConc">${task.targetConc} M</b> <span id="ssSoluteName">${task.solute.name}</span> (molar mass ${task.solute.molar} g/mol).</p>
      </div>
      <div class="control-panel">
        <h3>1 · Calculate required mass</h3>
        <div class="control-row"><label>Required solute mass (g)</label>
          <input type="number" id="ssCalcMass" step="0.01" placeholder="mass = M × V(L) × molar mass"></div>
        <button class="btn btn-secondary btn-block" id="ssCheckCalc">Check calculation</button>
        <div id="ssCalcFeedback"></div>
      </div>
      <div class="control-panel" id="ssMeasurePanel" style="display:none;">
        <h3>2 · Measure on the digital balance</h3>
        <div class="control-row"><label>Mass measured <span class="val" id="ssMassVal">0.00 g</span></label>
          <input type="range" id="ssMassSlider" min="0" max="1" step="0.01" value="0"></div>
        <button class="btn btn-primary btn-block" id="ssTransfer">Transfer to flask &amp; add solvent to volume</button>
      </div>
      <div class="control-panel" id="ssResultPanel" style="display:none;">
        <h3>3 · Result</h3>
        <div class="readout-grid">
          <div class="readout"><div class="rv" id="ssResultConc">—</div><div class="rl">Actual concentration</div></div>
          <div class="readout"><div class="rv" id="ssResultTarget">—</div><div class="rl">Target</div></div>
        </div>
        <div id="ssResultFeedback"></div>
        <button class="btn btn-secondary btn-sm" id="ssNewTask" style="margin-top:10px;">Try another preparation</button>
      </div>
    `;
    const calcMass = pane.querySelector('#ssCalcMass');
    const checkCalc = pane.querySelector('#ssCheckCalc');
    const calcFeedback = pane.querySelector('#ssCalcFeedback');
    const measurePanel = pane.querySelector('#ssMeasurePanel');
    const massSlider = pane.querySelector('#ssMassSlider');
    const massVal = pane.querySelector('#ssMassVal');
    const transfer = pane.querySelector('#ssTransfer');
    const resultPanel = pane.querySelector('#ssResultPanel');
    const resultConc = pane.querySelector('#ssResultConc');
    const resultTarget = pane.querySelector('#ssResultTarget');
    const resultFeedback = pane.querySelector('#ssResultFeedback');
    const newTaskBtn = pane.querySelector('#ssNewTask');
    const liquid = pane.querySelector('#ssLiquid');

    checkCalc.onclick = () => {
      const val = parseFloat(calcMass.value);
      const ok = !isNaN(val) && Math.abs(val-task.requiredMass) <= task.requiredMass*0.05+0.02;
      if (ok) {
        calcFeedback.innerHTML = `<div class="feedback-box correct">Correct — you need ${task.requiredMass.toFixed(2)} g. mass = M × V(L) × molar mass = ${task.targetConc} × ${(task.targetVolMl/1000)} × ${task.solute.molar}.</div>`;
        massSlider.max = (task.requiredMass*1.6).toFixed(2);
        measurePanel.style.display = 'block';
        api.addXP(15, 'Correct mass calculation');
      } else {
        calcFeedback.innerHTML = `<div class="feedback-box incorrect">Not quite. Formula: mass (g) = Molarity (mol/L) × Volume (L) × Molar mass (g/mol). Expected ≈ ${task.requiredMass.toFixed(2)} g.</div>`;
      }
    };
    massSlider.oninput = () => { measuredMass = parseFloat(massSlider.value); massVal.textContent = measuredMass.toFixed(2)+' g'; };
    transfer.onclick = () => {
      const actualConc = measuredMass / task.solute.molar / (task.targetVolMl/1000);
      resultConc.textContent = actualConc.toFixed(3)+' M';
      resultTarget.textContent = task.targetConc+' M';
      resultPanel.style.display = 'block';
      const err = (actualConc-task.targetConc)/task.targetConc;
      let verdict, cls;
      if (Math.abs(err) <= 0.03) { verdict='Correct preparation — excellent accuracy!'; cls='correct'; }
      else if (err > 0.03) { verdict='Too concentrated — you measured more solute than needed.'; cls='incorrect'; }
      else { verdict='Too dilute — you measured less solute than needed.'; cls='incorrect'; }
      resultFeedback.innerHTML = `<div class="feedback-box ${cls}"><h4>${verdict}</h4>Actual: ${actualConc.toFixed(3)} M vs target ${task.targetConc} M (${(err*100).toFixed(1)}% error).</div>`;
      liquid.style.opacity = 0.55 + Math.min(0.4, actualConc/task.targetConc*0.3);
      const acc = Math.max(0, 100-Math.abs(err*100)*3);
      if (Math.abs(err) <= 0.03) { api.addXP(30,'Accurate solution prepared'); api.recordCompletion('solution', Math.round(acc)); }
      else api.addXP(8,'attempt recorded');
    };
    newTaskBtn.onclick = () => renderPrepare(pane);
  }

  function renderDilute(pane) {
    pane.innerHTML = `
      <div class="control-panel">
        <h3>Dilution: C₁V₁ = C₂V₂</h3>
        <div class="control-row"><label>Initial (stock) concentration <span class="val" id="ssC1Val">2.0 M</span></label>
          <input type="range" id="ssC1" min="0.5" max="5" step="0.1" value="2"></div>
        <div class="control-row"><label>Final concentration you want <span class="val" id="ssC2Val">0.5 M</span></label>
          <input type="range" id="ssC2" min="0.1" max="2" step="0.05" value="0.5"></div>
        <div class="control-row"><label>Final volume <span class="val" id="ssV2Val">250 mL</span></label>
          <input type="range" id="ssV2" min="50" max="1000" step="10" value="250"></div>
        <div class="control-row">
          <label>Your answer: stock volume needed (mL)</label>
          <input type="number" id="ssV1Input" step="0.1">
        </div>
        <button class="btn btn-primary btn-block" id="ssV1Check">Check</button>
        <div id="ssDiluteFeedback"></div>
      </div>
    `;
    const c1 = pane.querySelector('#ssC1'), c2 = pane.querySelector('#ssC2'), v2 = pane.querySelector('#ssV2');
    const c1v = pane.querySelector('#ssC1Val'), c2v = pane.querySelector('#ssC2Val'), v2v = pane.querySelector('#ssV2Val');
    const v1input = pane.querySelector('#ssV1Input'), check = pane.querySelector('#ssV1Check'), fb = pane.querySelector('#ssDiluteFeedback');
    c1.oninput = () => c1v.textContent = parseFloat(c1.value).toFixed(1)+' M';
    c2.oninput = () => c2v.textContent = parseFloat(c2.value).toFixed(2)+' M';
    v2.oninput = () => v2v.textContent = v2.value+' mL';
    check.onclick = () => {
      const C1=parseFloat(c1.value), C2=parseFloat(c2.value), V2=parseFloat(v2.value);
      if (C2 >= C1) { fb.innerHTML = `<div class="feedback-box incorrect">Final concentration must be lower than the stock concentration for a dilution — adjust the sliders.</div>`; return; }
      const V1expected = (C2*V2)/C1;
      const userV1 = parseFloat(v1input.value);
      const ok = !isNaN(userV1) && Math.abs(userV1-V1expected) <= V1expected*0.05+0.5;
      if (ok) {
        fb.innerHTML = `<div class="feedback-box correct"><h4>✓ Correct</h4>V₁ = C₂V₂ / C₁ = (${C2} × ${V2}) / ${C1} = ${V1expected.toFixed(1)} mL of stock. Add solvent to bring the total to ${V2} mL.</div>`;
        api.addXP(25,'Dilution calculated correctly'); api.recordCompletion('solution', 100);
      } else {
        fb.innerHTML = `<div class="feedback-box incorrect">Use C₁V₁ = C₂V₂ → V₁ = C₂V₂ / C₁ = ${V1expected.toFixed(1)} mL.</div>`;
        api.addXP(6,'attempt recorded');
      }
    };
  }

  function unmount() {}
  window.SIMULATIONS = window.SIMULATIONS || {};
  window.SIMULATIONS.solution = { mount, unmount };
})();
