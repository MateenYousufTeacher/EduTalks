/* Atmosphere Lab — Chemistry of Our Planet (Atmospheric Layers & Composition) */
(function(){
  const LAYERS = [
    { name:'Troposphere', min:0, max:12, note:'Where weather happens. Temperature drops steadily with altitude.' },
    { name:'Stratosphere', min:12, max:50, note:'Contains the ozone layer, which absorbs UV radiation and warms this layer.' },
    { name:'Mesosphere', min:50, max:85, note:'Coldest layer overall. Most meteors burn up here.' },
    { name:'Thermosphere', min:85, max:100, note:'Very low density air is heated to high temperatures by solar radiation, though it would feel cold due to so few particles.' },
  ];
  const SCENARIOS = {
    clean:   { name:'Clean-air reference', N2:78.08, O2:20.95, Ar:0.93, CO2:0.04, other:0.00 },
    urban:   { name:'Urban atmosphere', N2:77.6, O2:20.6, Ar:0.92, CO2:0.05, other:0.83 },
    rural:   { name:'Rural atmosphere', N2:78.05, O2:20.92, Ar:0.93, CO2:0.04, other:0.06 },
    highalt: { name:'High-altitude (4000m)', N2:78.08, O2:20.95, Ar:0.93, CO2:0.04, other:0.00 },
    industrial:{ name:'Industrial atmosphere', N2:77.2, O2:20.3, Ar:0.91, CO2:0.06, other:1.53 },
  };
  let api = null, els = {};
  let altitude = 5, scenario = 'clean', chartMode = 'temp';
  let correctChallenges = 0;

  function tempAt(h) {
    if (h<=12) return 15 - 6.5*h;
    if (h<=50) return -56 + (h-12)/(50-12)*46;
    if (h<=85) return -2 + (h-50)/(85-50)*(-84);
    return -86 + (h-85)/(15)*586;
  }
  function pressureAt(h) { return 1013.25*Math.exp(-h/7.5); }
  function layerAt(h) { return LAYERS.find(l=>h>=l.min && h<=l.max) || LAYERS[LAYERS.length-1]; }

  function mount(container, apiRef) {
    api = apiRef;
    container.innerHTML = `
      <div class="viz-stage" id="atStage" style="min-height:230px;">
        <canvas id="atLayerCanvas" width="140" height="230" style="height:230px;"></canvas>
        <div style="flex:1;padding-left:14px;color:#fff;">
          <div style="font-size:.72rem;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.4px;">Current layer</div>
          <div style="font:700 1.2rem var(--font-heading);color:var(--amber);" id="atLayerName">Troposphere</div>
          <div style="font-size:.78rem;color:rgba(255,255,255,.75);margin-top:4px;" id="atLayerNote"></div>
          <div class="readout-grid" style="margin-top:14px;">
            <div class="readout" style="background:rgba(255,255,255,.1);"><div class="rv" style="color:#fff;" id="atTemp">—</div><div class="rl" style="color:rgba(255,255,255,.6);">Temp (°C)</div></div>
            <div class="readout" style="background:rgba(255,255,255,.1);"><div class="rv" style="color:#fff;" id="atPressure">—</div><div class="rl" style="color:rgba(255,255,255,.6);">Pressure (hPa)</div></div>
          </div>
        </div>
      </div>
      <div class="control-panel">
        <h3>Altitude</h3>
        <div class="control-row"><label>Altitude <span class="val" id="atAltVal">5 km</span></label>
          <input type="range" id="atAlt" min="0" max="100" value="5" step="1"></div>
      </div>
      <div class="control-panel">
        <h3>Scenario</h3>
        <select id="atScenario">${Object.entries(SCENARIOS).map(([id,s])=>`<option value="${id}">${s.name}</option>`).join('')}</select>
        <div class="chart-box" style="margin-top:10px;">
          <div class="chart-title">Atmospheric composition (% by volume)</div>
          <canvas id="atCompChart" style="width:100%;height:150px;"></canvas>
        </div>
      </div>
      <div class="control-panel">
        <h3>Profile graph</h3>
        <div class="pill-select" id="atChartMode">
          <button data-v="temp" class="active">Altitude vs Temp</button>
          <button data-v="pressure">Altitude vs Pressure</button>
        </div>
        <div class="chart-box" style="margin-top:10px;">
          <canvas id="atProfileChart" style="width:100%;height:180px;"></canvas>
        </div>
      </div>
      <div class="control-panel">
        <h3>Challenge</h3>
        <p id="atChallengeText" style="font-size:.85rem;"></p>
        <div id="atChallengeUI"></div>
        <div id="atFeedback"></div>
      </div>
    `;
    els = {
      layerCanvas: container.querySelector('#atLayerCanvas'),
      layerName: container.querySelector('#atLayerName'), layerNote: container.querySelector('#atLayerNote'),
      temp: container.querySelector('#atTemp'), pressure: container.querySelector('#atPressure'),
      alt: container.querySelector('#atAlt'), altVal: container.querySelector('#atAltVal'),
      scenario: container.querySelector('#atScenario'),
      compChart: container.querySelector('#atCompChart'),
      chartModePicker: container.querySelector('#atChartMode'),
      profileChart: container.querySelector('#atProfileChart'),
      challengeText: container.querySelector('#atChallengeText'),
      challengeUI: container.querySelector('#atChallengeUI'),
      feedback: container.querySelector('#atFeedback'),
    };
    els.alt.oninput = () => { altitude = parseFloat(els.alt.value); els.altVal.textContent = altitude+' km'; update(); };
    els.scenario.onchange = () => { scenario = els.scenario.value; drawComposition(); };
    els.chartModePicker.addEventListener('click',(e)=>{
      const b = e.target.closest('button'); if(!b) return;
      els.chartModePicker.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); chartMode = b.dataset.v; drawProfile();
    });
    newChallenge();
    update();
    drawComposition();
    drawProfile();
  }

  function update() {
    const T = tempAt(altitude), P = pressureAt(altitude), layer = layerAt(altitude);
    els.temp.textContent = T.toFixed(1);
    els.pressure.textContent = P<1 ? P.toFixed(3) : P.toFixed(1);
    els.layerName.textContent = layer.name;
    els.layerNote.textContent = layer.note;
    drawLayerDiagram();
  }

  function drawLayerDiagram() {
    const c = els.layerCanvas; const ctx = c.getContext('2d');
    const w=c.width,h=c.height; ctx.clearRect(0,0,w,h);
    const colors = ['#1976D2','#26C6DA','#43A047','#8E24AA'];
    LAYERS.forEach((l,i) => {
      const y0 = h - (l.min/100)*h, y1 = h - (l.max/100)*h;
      ctx.fillStyle = colors[i]+'55';
      ctx.fillRect(10,y1,w-20,y0-y1);
    });
    const markerY = h - (altitude/100)*h;
    ctx.beginPath(); ctx.fillStyle='#FFB300'; ctx.arc(w/2,markerY,6,0,7); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(10,markerY); ctx.lineTo(w-10,markerY); ctx.stroke();
  }

  function drawComposition() {
    const s = SCENARIOS[scenario];
    api.Chart.bar(els.compChart, [
      { label:'N2', value:s.N2, color:'#1976D2' },
      { label:'O2', value:s.O2, color:'#26C6DA' },
      { label:'Ar', value:s.Ar, color:'#8E24AA' },
      { label:'CO2', value:s.CO2, color:'#E53935' },
      { label:'Other', value:s.other, color:'#FFB300' },
    ]);
  }

  function drawProfile() {
    const pts = [];
    for (let h=0; h<=100; h+=2) pts.push({ x: chartMode==='temp'?tempAt(h):pressureAt(h), y:h });
    api.Chart.line(els.profileChart, [{ label:chartMode, color: chartMode==='temp'?'#E53935':'#1976D2', points: pts }], { yLabel:'km' });
  }

  function newChallenge() {
    const variants = [
      { text:'Move the altitude slider to find the Stratosphere. What altitude range defines it?', check:() => altitude>=12 && altitude<=50, explain:'The Stratosphere spans about 12–50 km, and contains the ozone layer.' },
      { text:'Find the altitude range where temperature is decreasing as you go up (not the Mesosphere).', check:() => altitude>=0 && altitude<=12, explain:'In the Troposphere (0–12 km), temperature drops roughly 6.5°C for every km of altitude gained.' },
      { text:'Find the coldest layer overall by exploring the temperature readout across all altitudes, then park the slider inside it.', check:() => altitude>=50 && altitude<=85, explain:'The Mesosphere (50–85 km) is the coldest layer, reaching around -90°C near its top.' },
      { text:'Identify which gas dominates the atmosphere\'s composition in every scenario — select it below.', type:'gas-pick', options:['Nitrogen (N2)','Oxygen (O2)','Carbon dioxide (CO2)','Argon (Ar)'], correct:'Nitrogen (N2)' },
    ];
    const c = variants[Math.floor(Math.random()*variants.length)];
    window.__atChallenge = c;
    els.challengeText.textContent = c.text;
    els.feedback.innerHTML = '';
    if (c.type === 'gas-pick') {
      els.challengeUI.innerHTML = `<div class="pill-select" id="atGasPick">${c.options.map(o=>`<button data-o="${o}">${o}</button>`).join('')}</div><button class="btn btn-primary btn-sm mt-8" id="atGasCheck">Submit</button>`;
      els.challengeUI.querySelector('#atGasPick').addEventListener('click',(e)=>{
        const b=e.target.closest('button'); if(!b) return;
        els.challengeUI.querySelectorAll('#atGasPick button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active'); window.__atGasPick = b.dataset.o;
      });
      els.challengeUI.querySelector('#atGasCheck').onclick = () => {
        const ok = window.__atGasPick === c.correct;
        finishChallenge(ok, c.correct ? `Nitrogen makes up about 78% of the atmosphere by volume — the most abundant gas, though it's relatively unreactive.` : '');
      };
    } else {
      els.challengeUI.innerHTML = `<button class="btn btn-primary btn-sm" id="atCheckAlt">Check my altitude</button>`;
      els.challengeUI.querySelector('#atCheckAlt').onclick = () => finishChallenge(c.check(), c.explain);
    }
  }

  function finishChallenge(ok, explain) {
    if (ok) {
      correctChallenges++;
      els.feedback.innerHTML = `<div class="feedback-box correct"><h4>✓ Correct!</h4>${explain}</div>`;
      api.addXP(30, 'Atmosphere challenge'); api.recordCompletion('atmosphere', 100);
      setTimeout(newChallenge, 2600);
    } else {
      els.feedback.innerHTML = `<div class="feedback-box incorrect">Not quite — keep exploring the altitude slider and composition chart, then try again.</div>`;
      api.addXP(5, 'attempt recorded');
    }
  }

  function unmount() {}
  window.SIMULATIONS = window.SIMULATIONS || {};
  window.SIMULATIONS.atmosphere = { mount, unmount };
})();
