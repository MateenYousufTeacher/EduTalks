(function(){
function mount(stage, controlsHost){
  let height=8, mass=3, friction=false;
  let running=false, raf=null, lastTs=null;
  const W=560,H=300;
  const g=9.8;
  // ramp: parabolic bowl from x0 to x1, bottom at midpoint
  const x0=60, x1=W-60, bottomY=240, topY=70;
  let pos=-1; // -1..1 across the bowl, start at left top
  let speed=0; // along-track speed (m/s, scaled)

  stage.innerHTML = `
    <canvas id="eCanvas" width="${W}" height="${H}"></canvas>
    <div class="stage-toolbar">
      <div class="grp">
        <button class="btn btn-primary btn-sm" id="ePlay">▶ Release</button>
        <button class="btn btn-secondary btn-sm" id="eReset">⟲ Reset</button>
      </div>
      <span class="badge badge-green">Total ≈ <span id="eBadge">100</span>%</span>
    </div>
    <div style="padding:0 14px 6px">
      <div class="readout-grid">
        <div class="readout"><b id="ePE">0 J</b><small>Potential Energy</small></div>
        <div class="readout"><b id="eKE">0 J</b><small>Kinetic Energy</small></div>
        <div class="readout"><b id="eTotal">0 J</b><small>Total Energy</small></div>
      </div>
    </div>
    <div style="padding:6px 14px 14px">
      <div style="height:14px;border-radius:99px;overflow:hidden;display:flex;background:var(--border)">
        <div id="ePEBar" style="background:var(--amber);height:100%;width:100%"></div>
        <div id="eKEBar" style="background:var(--cyan);height:100%;width:0%"></div>
      </div>
      <div class="legend"><span><i class="dot" style="background:var(--amber)"></i>Potential</span><span><i class="dot" style="background:var(--cyan)"></i>Kinetic</span></div>
    </div>`;

  controlsHost.innerHTML = `
    <div class="ctrl-block">
      <div class="ctrl-label">Release height <span class="val" id="hVal">${height.toFixed(1)} m</span></div>
      <input type="range" id="hSlide" min="2" max="10" step="0.5" value="${height}">
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Ball mass <span class="val" id="mVal">${mass.toFixed(1)} kg</span></div>
      <input type="range" id="mSlide" min="1" max="8" step="0.5" value="${mass}">
    </div>
    <div class="toggle-row"><span>Include friction (energy loss)</span>
      <label class="switch"><input type="checkbox" id="fricToggle"><span class="slider-toggle"></span></label>
    </div>`;

  const canvas=stage.querySelector('#eCanvas'), ctx=canvas.getContext('2d');
  const peEl=stage.querySelector('#ePE'), keEl=stage.querySelector('#eKE'), totalEl=stage.querySelector('#eTotal');
  const peBar=stage.querySelector('#ePEBar'), keBar=stage.querySelector('#eKEBar'), badge=stage.querySelector('#eBadge');
  const playBtn=stage.querySelector('#ePlay');
  function getCss(v){ return getComputedStyle(document.body).getPropertyValue(v).trim() || '#333'; }

  function fracHeight(p){ return p*p; } // 0 at center, 1 at edges

  function ballXY(p){
    const x = (x0+x1)/2 + p*((x1-x0)/2);
    const yy = topY + (bottomY-topY)*(1-fracHeight(p));
    return {x, y:yy};
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // bowl curve
    ctx.beginPath();
    for(let i=0;i<=100;i++){
      const p = -1 + 2*i/100;
      const pt = ballXY(p);
      i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y);
    }
    ctx.strokeStyle=getCss('--border'); ctx.lineWidth=5; ctx.lineCap='round'; ctx.stroke();

    // height gridlines
    ctx.fillStyle=getCss('--text-muted'); ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('h', x0-14, topY+10);

    const pt = ballXY(pos);
    const r = 10+mass*1.6;
    ctx.beginPath(); ctx.arc(pt.x, pt.y-r, r, 0, Math.PI*2);
    ctx.fillStyle=getCss('--deep-blue'); ctx.fill();
  }

  function computeEnergies(){
    const h = height*fracHeight(pos);
    const PE = mass*g*h;
    const KE = 0.5*mass*(speed*speed);
    return {PE,KE};
  }

  function updateReadouts(){
    const {PE,KE} = computeEnergies();
    const total0 = mass*g*height;
    const total = PE+KE;
    peEl.textContent = PE.toFixed(0)+' J';
    keEl.textContent = KE.toFixed(0)+' J';
    totalEl.textContent = total.toFixed(0)+' J';
    const pePct = total0>0 ? Math.max(0,Math.min(100, PE/total0*100)) : 0;
    const kePct = total0>0 ? Math.max(0,Math.min(100, KE/total0*100)) : 0;
    peBar.style.width = pePct+'%';
    keBar.style.width = kePct+'%';
    badge.textContent = total0>0 ? Math.round(total/total0*100) : 100;
  }

  function step(ts){
    if(!running) return;
    if(lastTs===null) lastTs=ts;
    const dt=Math.min((ts-lastTs)/1000,0.033); lastTs=ts;
    // simple energy-conserving pendulum-like motion in bowl: accel toward center proportional to slope
    const slope = 2*pos; // d(fracHeight)/dp
    const accel = -slope*g*0.35*height/8;
    speed += accel*dt*3;
    if (friction) speed *= (1-0.15*dt);
    pos += speed*dt*0.4;
    if (pos>1){ pos=1; speed*=-0.85; }
    if (pos<-1){ pos=-1; speed*=-0.85; }
    draw(); updateReadouts();
    raf=requestAnimationFrame(step);
  }

  playBtn.addEventListener('click', ()=>{
    running=!running; playBtn.textContent=running?'⏸ Pause':'▶ Release'; lastTs=null;
    if(running) raf=requestAnimationFrame(step);
  });
  stage.querySelector('#eReset').addEventListener('click', ()=>{
    running=false; pos=-1; speed=0; lastTs=null; playBtn.textContent='▶ Release';
    draw(); updateReadouts();
  });
  controlsHost.querySelector('#hSlide').addEventListener('input',(e)=>{
    height=parseFloat(e.target.value);
    controlsHost.querySelector('#hVal').textContent=height.toFixed(1)+' m';
    if(!running){ draw(); updateReadouts(); }
  });
  controlsHost.querySelector('#mSlide').addEventListener('input',(e)=>{
    mass=parseFloat(e.target.value);
    controlsHost.querySelector('#mVal').textContent=mass.toFixed(1)+' kg';
    draw(); updateReadouts();
  });
  controlsHost.querySelector('#fricToggle').addEventListener('change',(e)=>{ friction=e.target.checked; });

  draw(); updateReadouts();
  return { unmount(){ running=false; if(raf) cancelAnimationFrame(raf); } };
}

window.Sims = window.Sims || {};
window.Sims.energy = {
  id:'energy', name:'Energy', category:'Energy', icon:'⚡', color:'#FFB300',
  desc:'Watch potential energy turn into kinetic energy.',
  mount,
  theoryHTML:`
    <div class="info-card"><h4>Key idea</h4>
      <p>Energy can't be created or destroyed — only transformed. A ball high in the bowl has potential energy; as it falls, that becomes kinetic energy (motion).</p>
      <div class="formula">PE = m·g·h  &nbsp;|&nbsp;  KE = ½·m·v²</div>
    </div>
    <div class="info-card"><h4>Conservation of energy</h4>
      <p style="font-size:13px;color:var(--text-muted)">Without friction, PE + KE stays constant — the ball keeps swinging to the same height forever. Turn friction on to see energy gradually "leak" out as heat.</p>
    </div>`,
  instructionsHTML:`
    <div class="steps">
      <div class="step-item"><div class="step-num"></div><p>Set a release height and ball mass in Controls.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Press <b>Release</b> and watch the bars shift between amber (potential) and cyan (kinetic).</p></div>
      <div class="step-item"><div class="step-num"></div><p>Notice the ball always returns to the same height when friction is off.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Switch friction on and watch the total energy badge slowly drop below 100%.</p></div>
    </div>`
};
})();
