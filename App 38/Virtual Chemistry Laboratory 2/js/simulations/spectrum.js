/* Spectrum Lab — Read the Light (Emission Spectroscopy) */
(function(){
  // Approximate real visible emission line wavelengths (nm)
  const ELEMENTS = {
    hydrogen: { name:'Hydrogen (H)', lines:[410.2,434.0,486.1,656.3] },
    helium:   { name:'Helium (He)', lines:[447.1,471.3,492.2,501.6,587.6,667.8,706.5] },
    neon:     { name:'Neon (Ne)', lines:[585.2,588.2,594.5,614.3,633.4,640.2,703.2] },
    sodium:   { name:'Sodium (Na)', lines:[589.0,589.6] },
    mercury:  { name:'Mercury (Hg)', lines:[404.7,435.8,546.1,577.0,579.1] },
  };
  const WAVE_MIN = 380, WAVE_MAX = 720;

  let api = null, els = {};
  let unknown = null;
  let correctIDs = 0;
  let selectedGuess = null;

  function wavelengthToColor(nm) {
    let r,g,b;
    if (nm>=380 && nm<440) { r=-(nm-440)/(440-380); g=0; b=1; }
    else if (nm<490) { r=0; g=(nm-440)/(490-440); b=1; }
    else if (nm<510) { r=0; g=1; b=-(nm-510)/(510-490); }
    else if (nm<580) { r=(nm-510)/(580-510); g=1; b=0; }
    else if (nm<645) { r=1; g=-(nm-645)/(645-580); b=0; }
    else { r=1; g=0; b=0; }
    let factor = 1;
    if (nm<420) factor = 0.3+0.7*(nm-380)/(420-380);
    else if (nm>645) factor = 0.3+0.7*(720-nm)/(720-645);
    const to255 = (c)=>Math.round(255*Math.pow(Math.max(0,Math.min(1,c))*factor,0.8));
    return `rgb(${to255(r)},${to255(g)},${to255(b)})`;
  }

  function mount(container, apiRef) {
    api = apiRef;
    container.innerHTML = `
      <div class="viz-stage" id="spStage" style="min-height:160px;flex-direction:column;">
        <div style="font-size:.78rem;color:rgba(255,255,255,.7);align-self:flex-start;margin-bottom:6px;">Unknown sample spectrum</div>
        <canvas id="spUnknownCanvas" style="width:100%;height:110px;"></canvas>
      </div>
      <p class="muted" style="font-size:.78rem;">Tap a bright line to measure its wavelength.</p>
      <div class="readout-grid">
        <div class="readout"><div class="rv" id="spPeakWL">—</div><div class="rl">Selected peak (nm)</div></div>
        <div class="readout"><div class="rv" id="spPeakCount">—</div><div class="rl">Total peaks</div></div>
      </div>
      <div class="control-panel">
        <h3>Reference library — compare spectra</h3>
        <div id="spReferenceList"></div>
      </div>
      <div class="control-panel">
        <h3>Identify the unknown sample</h3>
        <div class="pill-select" id="spGuessOptions"></div>
        <button class="btn btn-primary btn-block mt-8" id="spSubmitGuess">Submit identification</button>
        <div id="spFeedback"></div>
      </div>
      <div class="control-panel">
        <button class="btn btn-secondary btn-block" id="spNewSample">🔄 New unknown sample</button>
      </div>
    `;
    els = {
      unknownCanvas: container.querySelector('#spUnknownCanvas'),
      peakWL: container.querySelector('#spPeakWL'),
      peakCount: container.querySelector('#spPeakCount'),
      refList: container.querySelector('#spReferenceList'),
      guessOptions: container.querySelector('#spGuessOptions'),
      submitGuess: container.querySelector('#spSubmitGuess'),
      feedback: container.querySelector('#spFeedback'),
      newSample: container.querySelector('#spNewSample'),
    };
    buildReferenceList();
    els.guessOptions.innerHTML = Object.entries(ELEMENTS).map(([id,e])=>`<button data-id="${id}">${e.name}</button>`).join('');
    els.guessOptions.addEventListener('click',(e)=>{
      const b=e.target.closest('button'); if(!b) return;
      els.guessOptions.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); selectedGuess = b.dataset.id;
    });
    els.submitGuess.onclick = submitGuess;
    els.newSample.onclick = newSample;
    els.unknownCanvas.addEventListener('click', onCanvasClick);
    newSample();
  }

  function drawSpectrum(canvas, lines, label) {
    const dpr = window.devicePixelRatio||1;
    const cssW = canvas.clientWidth||280, cssH = canvas.clientHeight||70;
    canvas.width = cssW*dpr; canvas.height = cssH*dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle = '#05040a';
    ctx.fillRect(0,0,cssW,cssH);
    lines.forEach(nm => {
      const x = ((nm-WAVE_MIN)/(WAVE_MAX-WAVE_MIN))*cssW;
      const grad = ctx.createLinearGradient(x-3,0,x+3,0);
      const col = wavelengthToColor(nm);
      grad.addColorStop(0,'rgba(0,0,0,0)'); grad.addColorStop(0.5,col); grad.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x-3,0,6,cssH);
    });
  }

  function buildReferenceList() {
    els.refList.innerHTML = Object.entries(ELEMENTS).map(([id,e])=>`
      <div style="margin-bottom:10px;">
        <div style="font-size:.78rem;font-weight:700;color:#556;margin-bottom:3px;">${e.name}</div>
        <canvas class="ref-canvas" data-id="${id}" style="width:100%;height:34px;border-radius:6px;"></canvas>
      </div>`).join('');
    els.refList.querySelectorAll('.ref-canvas').forEach(c => {
      drawSpectrum(c, ELEMENTS[c.dataset.id].lines);
    });
  }

  function newSample() {
    const ids = Object.keys(ELEMENTS);
    const id = ids[Math.floor(Math.random()*ids.length)];
    unknown = { id, lines: ELEMENTS[id].lines };
    drawSpectrum(els.unknownCanvas, unknown.lines);
    els.peakWL.textContent = '—';
    els.peakCount.textContent = unknown.lines.length;
    els.feedback.innerHTML = '';
    selectedGuess = null;
    els.guessOptions.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
  }

  function onCanvasClick(e) {
    const rect = els.unknownCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const nm = WAVE_MIN + (x/rect.width)*(WAVE_MAX-WAVE_MIN);
    let closest = unknown.lines.reduce((a,b)=>Math.abs(b-nm)<Math.abs(a-nm)?b:a, unknown.lines[0]);
    els.peakWL.textContent = closest.toFixed(1)+' nm';
  }

  function submitGuess() {
    if (!selectedGuess) { els.feedback.innerHTML = `<div class="feedback-box incorrect">Pick an element from the list first.</div>`; return; }
    const correct = selectedGuess === unknown.id;
    if (correct) {
      correctIDs++;
      els.feedback.innerHTML = `<div class="feedback-box correct"><h4>✓ Correct — it's ${ELEMENTS[unknown.id].name}!</h4>Each element produces a unique pattern of spectral lines because electrons in its atoms can only occupy specific energy levels. Light is emitted at wavelengths matching the exact energy gaps between those levels — this pattern is like an atomic fingerprint.</div>`;
      api.addXP(30, 'Spectrum identified correctly');
      api.recordCompletion('spectrum', 100);
      if (correctIDs >= 5) api.unlockAchievement('spectroscopy_expert');
      setTimeout(newSample, 3000);
    } else {
      els.feedback.innerHTML = `<div class="feedback-box incorrect">Not quite — compare the peak positions in the unknown spectrum with each reference spectrum above more closely, then try again.</div>`;
      api.addXP(6, 'attempt recorded');
    }
  }

  function unmount() {}
  window.SIMULATIONS = window.SIMULATIONS || {};
  window.SIMULATIONS.spectrum = { mount, unmount };
})();
