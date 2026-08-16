(function(){
function mount(stage, controlsHost){
  let planet='earth', mass=2, running=false, raf=null, lastTs=null, t=0, y=30, vy=0;
  const W=560,H=300, groundY=260, topY=30;
  const G = { moon:1.6, earth:9.8, mars:3.7, jupiter:24.8 };
  const colors = { moon:'#B9C4CE', earth:'#1976D2', mars:'#C1440E', jupiter:'#D8A15C' };

  stage.innerHTML = `
    <canvas id="gCanvas" width="${W}" height="${H}"></canvas>
    <div class="stage-toolbar">
      <div class="grp">
        <button class="btn btn-primary btn-sm" id="gPlay">▶ Drop</button>
        <button class="btn btn-secondary btn-sm" id="gReset">⟲ Reset</button>
      </div>
      <span class="badge badge-amber">g = <span id="gBadge">9.8</span> m/s²</span>
    </div>
    <div style="padding:0 14px 14px">
      <div class="readout-grid">
        <div class="readout"><b id="gTime">0.00 s</b><small>Fall Time</small></div>
        <div class="readout"><b id="gVel">0.0 m/s</b><small>Velocity</small></div>
        <div class="readout"><b id="gWeight">19.6 N</b><small>Weight (m·g)</small></div>
      </div>
    </div>`;

  controlsHost.innerHTML = `
    <div class="ctrl-block">
      <div class="ctrl-label" style="margin-bottom:10px">World</div>
      <div class="seg" id="planetSeg">
        <button data-p="moon">Moon</button>
        <button data-p="earth" class="active">Earth</button>
        <button data-p="mars">Mars</button>
        <button data-p="jupiter">Jupiter</button>
      </div>
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Object mass <span class="val" id="mVal">${mass.toFixed(1)} kg</span></div>
      <input type="range" id="mSlide" min="0.5" max="10" step="0.5" value="${mass}">
    </div>
    <div class="info-card" style="margin-top:14px">
      <h4>Mass vs. weight</h4>
      <p style="font-size:13px;color:var(--text-muted)">Mass never changes. Weight = mass × gravity, so the same object weighs less on the Moon and more on Jupiter — but falls at the same rate regardless of mass on any single world.</p>
    </div>`;

  const canvas=stage.querySelector('#gCanvas'), ctx=canvas.getContext('2d');
  const timeEl=stage.querySelector('#gTime'), velEl=stage.querySelector('#gVel'), weightEl=stage.querySelector('#gWeight'), badge=stage.querySelector('#gBadge');
  const playBtn=stage.querySelector('#gPlay');
  function getCss(v){ return getComputedStyle(document.body).getPropertyValue(v).trim() || '#333'; }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle=getCss('--border'); ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(20,groundY); ctx.lineTo(W-20,groundY); ctx.stroke();
    for(let i=0;i<10;i++){
      ctx.strokeStyle='rgba(150,150,150,.25)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(60+i*50, groundY); ctx.lineTo(40+i*50, groundY+10); ctx.stroke();
    }
    const r = 12+mass*1.6;
    ctx.beginPath(); ctx.arc(W/2, Math.min(y,groundY-r), r, 0, Math.PI*2);
    ctx.fillStyle = colors[planet]; ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.stroke();
  }

  function updateStatic(){
    const g = G[planet];
    badge.textContent = g.toFixed(1);
    weightEl.textContent = (mass*g).toFixed(1)+' N';
  }

  function step(ts){
    if(!running) return;
    if(lastTs===null) lastTs=ts;
    const dt=Math.min((ts-lastTs)/1000,0.033); lastTs=ts;
    const g=G[planet];
    t+=dt; vy += g*dt*6; y += vy*dt;
    const r=12+mass*1.6;
    timeEl.textContent=t.toFixed(2)+' s';
    velEl.textContent=(vy/6).toFixed(1)+' m/s';
    draw();
    if (y >= groundY-r){ running=false; playBtn.textContent='▶ Drop'; return; }
    raf=requestAnimationFrame(step);
  }

  playBtn.addEventListener('click', ()=>{
    running=!running; playBtn.textContent=running?'⏸ Pause':'▶ Drop'; lastTs=null;
    if(running) raf=requestAnimationFrame(step);
  });
  stage.querySelector('#gReset').addEventListener('click', ()=>{
    running=false; t=0; y=30; vy=0; lastTs=null; playBtn.textContent='▶ Drop';
    timeEl.textContent='0.00 s'; velEl.textContent='0.0 m/s'; draw();
  });
  controlsHost.querySelectorAll('#planetSeg button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      controlsHost.querySelectorAll('#planetSeg button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); planet=btn.dataset.p; updateStatic();
    });
  });
  controlsHost.querySelector('#mSlide').addEventListener('input',(e)=>{
    mass=parseFloat(e.target.value);
    controlsHost.querySelector('#mVal').textContent=mass.toFixed(1)+' kg';
    updateStatic(); draw();
  });

  draw(); updateStatic();
  return { unmount(){ running=false; if(raf) cancelAnimationFrame(raf); } };
}

window.Sims = window.Sims || {};
window.Sims.gravity = {
  id:'gravity', name:'Gravity', category:'Gravitation', icon:'🌍', color:'#26C6DA',
  desc:'Drop objects on four worlds and compare g.',
  mount,
  theoryHTML:`
    <div class="info-card"><h4>Key idea</h4>
      <p>Every world pulls objects toward its centre with a gravitational acceleration, g. A heavier world (or denser one) has a larger g, so things fall faster.</p>
      <div class="formula">Weight = mass × g</div>
    </div>
    <div class="info-card"><h4>g on each world</h4>
      <ul>
        <li>Moon: 1.6 m/s²</li>
        <li>Earth: 9.8 m/s²</li>
        <li>Mars: 3.7 m/s²</li>
        <li>Jupiter: 24.8 m/s²</li>
      </ul>
    </div>`,
  instructionsHTML:`
    <div class="steps">
      <div class="step-item"><div class="step-num"></div><p>Choose a world from the Controls tab.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Press <b>Drop</b> and time how long the ball takes to land.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Change only the mass and drop again on the same world — the fall time stays the same.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Switch worlds and compare the weight readout for the same object.</p></div>
    </div>`
};
})();
