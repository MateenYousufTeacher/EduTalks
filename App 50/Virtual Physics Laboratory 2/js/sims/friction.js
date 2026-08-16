(function(){
function mount(stage, controlsHost){
  let appliedF=0, surface='wood', mass=5;
  let running=false, raf=null, lastTs=null, v=0, x=60;
  const W=560,H=280, floorY=190;
  const MU = { wood:0.5, ice:0.05, rubber:0.9, carpet:0.7 };
  const g=9.8;

  stage.innerHTML = `
    <canvas id="frCanvas" width="${W}" height="${H}"></canvas>
    <div class="stage-toolbar">
      <div class="grp">
        <button class="btn btn-primary btn-sm" id="frPlay">▶ Push</button>
        <button class="btn btn-secondary btn-sm" id="frReset">⟲ Reset</button>
      </div>
      <span class="badge" id="frState" style="background:#E4F5E7;color:#1F6B2E">Static</span>
    </div>
    <div style="padding:0 14px 14px">
      <div class="readout-grid">
        <div class="readout"><b id="frApplied">0.0 N</b><small>Applied Force</small></div>
        <div class="readout"><b id="frFriction">0.0 N</b><small>Friction Force</small></div>
        <div class="readout"><b id="frLimit">0.0 N</b><small>Max Static Friction</small></div>
      </div>
    </div>`;

  controlsHost.innerHTML = `
    <div class="ctrl-block">
      <div class="ctrl-label">Applied force <span class="val" id="fVal">${appliedF.toFixed(1)} N</span></div>
      <input type="range" id="fSlide" min="0" max="60" step="0.5" value="${appliedF}">
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Object mass <span class="val" id="mVal">${mass.toFixed(1)} kg</span></div>
      <input type="range" id="mSlide" min="1" max="15" step="0.5" value="${mass}">
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label" style="margin-bottom:10px">Surface type</div>
      <div class="seg" id="surfSeg">
        <button data-s="ice" class="">Ice</button>
        <button data-s="wood" class="active">Wood</button>
        <button data-s="carpet" class="">Carpet</button>
        <button data-s="rubber" class="">Rubber</button>
      </div>
    </div>`;

  const canvas=stage.querySelector('#frCanvas'), ctx=canvas.getContext('2d');
  const appliedEl=stage.querySelector('#frApplied'), frictionEl=stage.querySelector('#frFriction'), limitEl=stage.querySelector('#frLimit');
  const stateBadge=stage.querySelector('#frState'), playBtn=stage.querySelector('#frPlay');
  function getCss(v){ return getComputedStyle(document.body).getPropertyValue(v).trim() || '#333'; }

  function limitForce(){ return MU[surface]*mass*g; }

  function draw(){
    ctx.clearRect(0,0,W,H);
    const surfColors = { ice:'#BEE7F5', wood:'#D8B27C', carpet:'#C99BD6', rubber:'#7A7A7A' };
    ctx.fillStyle = surfColors[surface];
    ctx.fillRect(20, floorY, W-40, 14);
    ctx.strokeStyle=getCss('--border'); ctx.strokeRect(20,floorY,W-40,14);

    const s=48;
    const bx = Math.min(x, W-90);
    ctx.fillStyle=getCss('--deep-blue');
    ctx.fillRect(bx, floorY-s, s, s);
    ctx.fillStyle='#fff'; ctx.font='700 11px sans-serif'; ctx.textAlign='center';
    ctx.fillText(mass.toFixed(1)+'kg', bx+s/2, floorY-s/2+4);

    // applied force arrow (right, amber)
    const fLen = Math.min(90, appliedF*1.4);
    ctx.strokeStyle=getCss('--amber'); ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(bx+s+6, floorY-s/2); ctx.lineTo(bx+s+6+fLen, floorY-s/2); ctx.stroke();
    arrowHead(bx+s+6+fLen, floorY-s/2, 1, getCss('--amber'));

    // friction arrow (left, cyan) opposing, capped at limit
    const fric = Math.min(appliedF, limitForce());
    const frLen = Math.min(90, fric*1.4);
    if (frLen>2){
      ctx.strokeStyle=getCss('--cyan'); ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(bx-6, floorY-s/2); ctx.lineTo(bx-6-frLen, floorY-s/2); ctx.stroke();
      arrowHead(bx-6-frLen, floorY-s/2, -1, getCss('--cyan'));
    }
  }
  function arrowHead(px,py,dir,color){
    ctx.beginPath();
    ctx.moveTo(px,py);
    ctx.lineTo(px-10*dir,py-6); ctx.lineTo(px-10*dir,py+6);
    ctx.closePath(); ctx.fillStyle=color; ctx.fill();
  }

  function updateReadouts(){
    const lim = limitForce();
    appliedEl.textContent = appliedF.toFixed(1)+' N';
    limitEl.textContent = lim.toFixed(1)+' N';
    if (appliedF < lim){
      frictionEl.textContent = appliedF.toFixed(1)+' N';
      stateBadge.textContent='Static — not moving';
      stateBadge.style.background='#E4F5E7'; stateBadge.style.color='#1F6B2E';
    } else {
      frictionEl.textContent = lim.toFixed(1)+' N (kinetic)';
      stateBadge.textContent='Sliding!';
      stateBadge.style.background='#FFE1DC'; stateBadge.style.color='#B23A22';
    }
  }

  function step(ts){
    if(!running) return;
    if(lastTs===null) lastTs=ts;
    const dt=Math.min((ts-lastTs)/1000,0.05); lastTs=ts;
    const lim=limitForce();
    if (appliedF>lim){
      const netF = appliedF-lim;
      const a = netF/mass;
      v += a*dt; x += v*dt*8;
    } else { v=0; }
    draw();
    if (x>W-90 || (appliedF<=lim)){ running=false; playBtn.textContent='▶ Push'; return; }
    raf=requestAnimationFrame(step);
  }

  playBtn.addEventListener('click', ()=>{
    running=!running; playBtn.textContent=running?'⏸ Pause':'▶ Push'; lastTs=null;
    if(running) raf=requestAnimationFrame(step);
  });
  stage.querySelector('#frReset').addEventListener('click', ()=>{
    running=false; v=0; x=60; lastTs=null; playBtn.textContent='▶ Push'; draw(); updateReadouts();
  });
  controlsHost.querySelector('#fSlide').addEventListener('input',(e)=>{
    appliedF=parseFloat(e.target.value);
    controlsHost.querySelector('#fVal').textContent=appliedF.toFixed(1)+' N';
    updateReadouts(); draw();
  });
  controlsHost.querySelector('#mSlide').addEventListener('input',(e)=>{
    mass=parseFloat(e.target.value);
    controlsHost.querySelector('#mVal').textContent=mass.toFixed(1)+' kg';
    updateReadouts(); draw();
  });
  controlsHost.querySelectorAll('#surfSeg button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      controlsHost.querySelectorAll('#surfSeg button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); surface=btn.dataset.s;
      updateReadouts(); draw();
    });
  });

  draw(); updateReadouts();
  return { unmount(){ running=false; if(raf) cancelAnimationFrame(raf); } };
}

window.Sims = window.Sims || {};
window.Sims.friction = {
  id:'friction', name:'Friction', category:'Mechanics', icon:'🧱', color:'#26C6DA',
  desc:'Push against surfaces and find the sliding point.',
  mount,
  theoryHTML:`
    <div class="info-card"><h4>Key idea</h4>
      <p>Friction resists relative motion between two surfaces. It grows to match the applied force — up to a limit — after which the object starts to slide.</p>
      <div class="formula">Friction (max) = μ × Normal Force</div>
    </div>
    <div class="info-card"><h4>Surfaces compared</h4>
      <p style="font-size:13px;color:var(--text-muted)">Ice has a very low friction coefficient (μ≈0.05); rubber has a high one (μ≈0.9). Try the same push on each surface.</p>
    </div>`,
  instructionsHTML:`
    <div class="steps">
      <div class="step-item"><div class="step-num"></div><p>Pick a surface type and a mass in the Controls tab.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Slowly increase the applied force and watch the friction arrow grow to match it.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Once applied force exceeds the maximum static friction, press <b>Push</b> — the block slides.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Compare the "Max Static Friction" readout across different surfaces.</p></div>
    </div>`
};
})();
