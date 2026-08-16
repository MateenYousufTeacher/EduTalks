/* Nuclear Lab — Inside the Nucleus (Radioactive Decay & Half-Life)
   Educational model using generic simulated isotopes (not real handling instructions). */
(function(){
  const ISOTOPES = [
    { id:'q', name:'Isotope Q (educational model)', halfLife: 8 },
    { id:'r', name:'Isotope R (educational model)', halfLife: 14 },
    { id:'s', name:'Isotope S (educational model)', halfLife: 22 },
  ];
  let api = null, els = {}, raf = null;
  let isotope = ISOTOPES[0];
  let N0 = 200, N = 200, t = 0, running = false, speed = 1;
  let history = [];
  let nuclei = [];
  let challenge = null;

  function mount(container, apiRef) {
    api = apiRef;
    container.innerHTML = `
      <div class="safety-box">Educational simulation only — models generic decay statistics. Not a guide to handling real radioactive material.</div>
      <div class="viz-stage" id="nlStage" style="min-height:200px;">
        <canvas id="nlCanvas" width="300" height="200" style="width:100%;max-width:300px;"></canvas>
      </div>
      <div class="readout-grid">
        <div class="readout"><div class="rv" id="nlN">200</div><div class="rl">Nuclei remaining</div></div>
        <div class="readout"><div class="rv" id="nlT">0.0 s</div><div class="rl">Elapsed time</div></div>
        <div class="readout"><div class="rv" id="nlHalfLife">8 s</div><div class="rl">True half-life</div></div>
      </div>
      <div class="control-panel">
        <h3>Setup</h3>
        <div class="control-row"><label>Isotope</label>
          <select id="nlIsotope">${ISOTOPES.map(i=>`<option value="${i.id}">${i.name}</option>`).join('')}</select>
        </div>
        <div class="control-row"><label>Speed</label>
          <div class="pill-select" id="nlSpeed">
            <button data-v="1" class="active">1×</button><button data-v="2">2×</button><button data-v="5">5×</button><button data-v="10">10×</button><button data-v="100">100×</button>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="nlStart">▶ Start decay</button>
          <button class="btn btn-secondary" id="nlReset">Reset</button>
        </div>
      </div>
      <div class="chart-box">
        <div class="chart-title">Nuclei remaining vs. Time (half-life marked)</div>
        <canvas id="nlChart" style="width:100%;height:170px;"></canvas>
      </div>
      <div class="control-panel">
        <h3>Challenge</h3>
        <p id="nlChallengeText" style="font-size:.85rem;"></p>
        <input type="number" id="nlChallengeInput" placeholder="Your answer" style="margin-bottom:8px;">
        <button class="btn btn-primary btn-sm" id="nlChallengeCheck">Check</button>
        <div id="nlFeedback"></div>
      </div>
    `;
    els = {
      canvas: container.querySelector('#nlCanvas'),
      N: container.querySelector('#nlN'), T: container.querySelector('#nlT'), HL: container.querySelector('#nlHalfLife'),
      isotope: container.querySelector('#nlIsotope'),
      speedPicker: container.querySelector('#nlSpeed'),
      start: container.querySelector('#nlStart'), reset: container.querySelector('#nlReset'),
      chart: container.querySelector('#nlChart'),
      challengeText: container.querySelector('#nlChallengeText'),
      challengeInput: container.querySelector('#nlChallengeInput'),
      challengeCheck: container.querySelector('#nlChallengeCheck'),
      feedback: container.querySelector('#nlFeedback'),
    };
    els.isotope.onchange = () => { isotope = ISOTOPES.find(i=>i.id===els.isotope.value); resetSim(); };
    els.speedPicker.addEventListener('click',(e)=>{
      const b=e.target.closest('button'); if(!b) return;
      els.speedPicker.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); speed = parseFloat(b.dataset.v);
    });
    els.start.onclick = () => { running = !running; els.start.textContent = running ? '⏸ Pause' : '▶ Start decay'; if (running) loop(); };
    els.reset.onclick = resetSim;
    els.challengeCheck.onclick = checkChallenge;
    resetSim();
  }

  function resetSim() {
    N0 = 200; N = 200; t = 0; running = false; history = [{x:0,y:N}];
    nuclei = Array.from({length:N0}, (_,i)=>({ alive:true, x:Math.random(), y:Math.random() }));
    els.N.textContent = N; els.T.textContent = '0.0 s'; els.HL.textContent = isotope.halfLife+' s';
    els.start.textContent = '▶ Start decay';
    els.feedback.innerHTML = '';
    draw(); redrawChart();
    newChallenge();
  }

  function loop() {
    if (!running) return;
    const dt = 0.05*speed;
    const p = 1 - Math.exp(-Math.LN2/isotope.halfLife*dt);
    let decayedNow = 0;
    nuclei.forEach(nu => { if (nu.alive && Math.random() < p) { nu.alive = false; decayedNow++; } });
    N -= decayedNow;
    t += dt;
    history.push({x:t, y:N});
    if (history.length > 800) history.shift();
    els.N.textContent = N;
    els.T.textContent = t.toFixed(1)+' s';
    draw(); redrawChart();
    if (N <= 0 || t > isotope.halfLife*8) { running = false; els.start.textContent = '▶ Start decay'; return; }
    raf = requestAnimationFrame(loop);
  }

  function draw() {
    const c = els.canvas; const ctx = c.getContext('2d');
    const w=c.width,h=c.height; ctx.clearRect(0,0,w,h);
    nuclei.forEach(nu => {
      const x = 10 + nu.x*(w-20), y = 10 + nu.y*(h-20);
      ctx.beginPath();
      ctx.fillStyle = nu.alive ? '#43A047' : 'rgba(120,120,120,0.25)';
      ctx.arc(x,y, nu.alive?4:2.5, 0, 7);
      ctx.fill();
    });
    ctx.fillStyle='#fff'; ctx.font='bold 12px sans-serif';
    ctx.fillText(`${N} / ${N0} remaining`, 10, 18);
  }

  function redrawChart() {
    const hl = isotope.halfLife;
    api.Chart.line(els.chart, [
      { label:'N(t)', color:'#43A047', points: history, fill:true },
    ], { yMin:0, yMax:N0 });
  }

  function newChallenge() {
    const variants = [
      { text:`Run the decay, then estimate: how many nuclei (out of ${N0}) remain after exactly one half-life (${isotope.halfLife}s)?`, check:(ans)=>{ const expected=N0/2; return Math.abs(ans-expected)<=expected*0.15; }, hint:()=>`Expected ≈ ${(N0/2).toFixed(0)} (half of ${N0}).` },
      { text:`Run the decay, then estimate: how many nuclei remain after two half-lives (${(isotope.halfLife*2).toFixed(0)}s)?`, check:(ans)=>{ const expected=N0/4; return Math.abs(ans-expected)<=expected*0.15; }, hint:()=>`Expected ≈ ${(N0/4).toFixed(0)} (a quarter of ${N0}).` },
      { text:`Estimate this isotope's half-life (in seconds) just from watching the curve reach 50% remaining.`, check:(ans)=>{ return Math.abs(ans-isotope.halfLife)<=isotope.halfLife*0.15; }, hint:()=>`True half-life is ${isotope.halfLife}s.`, isHalfLife:true },
    ];
    challenge = variants[Math.floor(Math.random()*variants.length)];
    els.challengeText.textContent = challenge.text;
  }

  function checkChallenge() {
    const ans = parseFloat(els.challengeInput.value);
    if (isNaN(ans)) { els.feedback.innerHTML = `<div class="feedback-box incorrect">Enter a number first.</div>`; return; }
    const ok = challenge.check(ans);
    if (ok) {
      els.feedback.innerHTML = `<div class="feedback-box correct"><h4>✓ Correct!</h4>${challenge.hint()} Radioactive decay is statistical: each nucleus has the same probability of decaying in a given time — so on average, half the population decays every half-life, regardless of how much you started with.</div>`;
      api.addXP(30, 'Nuclear decay challenge'); api.recordCompletion('nuclear', 100);
      if (challenge.isHalfLife) api.unlockAchievement('decay_detective');
      setTimeout(newChallenge, 3000);
    } else {
      els.feedback.innerHTML = `<div class="feedback-box incorrect">Not quite. ${challenge.hint()} Try running the simulation again and reading the graph carefully.</div>`;
      api.addXP(6, 'attempt recorded');
    }
  }

  function unmount() { running=false; if (raf) cancelAnimationFrame(raf); raf=null; }
  window.SIMULATIONS = window.SIMULATIONS || {};
  window.SIMULATIONS.nuclear = { mount, unmount };
})();
