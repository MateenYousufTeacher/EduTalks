(function(){
function mount(stage, controlsHost){
  let running=false, raf=null, lastTs=null, t=0, v=0, x=80;
  let mass=4, force=8;
  const W=560,H=280, floorY=190;

  stage.innerHTML = `
    <canvas id="nCanvas" width="${W}" height="${H}"></canvas>
    <div class="stage-toolbar">
      <div class="grp">
        <button class="btn btn-primary btn-sm" id="nPlay">▶ Apply Force</button>
        <button class="btn btn-secondary btn-sm" id="nReset">⟲ Reset</button>
      </div>
      <span class="badge badge-amber">a = <span id="nBadge">2.0</span> m/s²</span>
    </div>
    <div style="padding:0 14px 14px">
      <div class="readout-grid">
        <div class="readout"><b id="nAcc">2.0 m/s²</b><small>Acceleration</small></div>
        <div class="readout"><b id="nVel">0.0 m/s</b><small>Velocity</small></div>
        <div class="readout"><b id="nForce">8.0 N</b><small>Net Force</small></div>
      </div>
    </div>`;

  controlsHost.innerHTML = `
    <div class="ctrl-block">
      <div class="ctrl-label">Applied force (F) <span class="val" id="fVal">${force.toFixed(1)} N</span></div>
      <input type="range" id="fSlide" min="0" max="20" step="0.5" value="${force}">
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Mass (m) <span class="val" id="mVal">${mass.toFixed(1)} kg</span></div>
      <input type="range" id="mSlide" min="1" max="10" step="0.5" value="${mass}">
    </div>
    <div class="info-card" style="margin-top:14px">
      <h4>Try this</h4>
      <p style="font-size:13px;color:var(--text-muted)">Keep force fixed and increase mass — notice acceleration drops. That's Newton's Second Law: a = F ÷ m.</p>
    </div>`;

  const canvas = stage.querySelector('#nCanvas');
  const ctx = canvas.getContext('2d');
  const accEl = stage.querySelector('#nAcc');
  const velEl = stage.querySelector('#nVel');
  const forceEl = stage.querySelector('#nForce');
  const badge = stage.querySelector('#nBadge');
  const playBtn = stage.querySelector('#nPlay');

  function getCss(v){ return getComputedStyle(document.body).getPropertyValue(v).trim() || '#333'; }
  function boxSize(){ return 34 + mass*3; }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle = getCss('--border'); ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(20,floorY); ctx.lineTo(W-20,floorY); ctx.stroke();

    const s = boxSize();
    const bx = Math.min(x, W-60);
    ctx.fillStyle = getCss('--deep-blue');
    ctx.fillRect(bx, floorY-s, s, s);
    ctx.fillStyle='#fff'; ctx.font='700 12px sans-serif'; ctx.textAlign='center';
    ctx.fillText(mass.toFixed(1)+'kg', bx+s/2, floorY-s/2+4);

    // force arrow
    const a = force/mass;
    const arrowLen = Math.min(90, 20+force*4);
    ctx.strokeStyle = getCss('--amber'); ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(bx+s+6, floorY-s/2); ctx.lineTo(bx+s+6+arrowLen, floorY-s/2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx+s+6+arrowLen, floorY-s/2);
    ctx.lineTo(bx+s+6+arrowLen-10, floorY-s/2-6);
    ctx.lineTo(bx+s+6+arrowLen-10, floorY-s/2+6);
    ctx.closePath(); ctx.fillStyle=getCss('--amber'); ctx.fill();
    ctx.fillStyle = getCss('--text-muted'); ctx.font='11px sans-serif'; ctx.textAlign='left';
    ctx.fillText('F = '+force.toFixed(1)+' N', bx+s+6, floorY-s/2-14);
  }

  function step(ts){
    if(!running) return;
    if(lastTs===null) lastTs=ts;
    const dt = Math.min((ts-lastTs)/1000,0.05); lastTs=ts;
    t+=dt;
    const a = force/mass;
    v += a*dt;
    x += v*dt*10;
    accEl.textContent = a.toFixed(2)+' m/s²';
    velEl.textContent = v.toFixed(2)+' m/s';
    badge.textContent = a.toFixed(2);
    draw();
    if (x > W-60){ running=false; playBtn.textContent='▶ Apply Force'; showToastSafe('Box reached the wall — press Reset to try again'); return; }
    raf=requestAnimationFrame(step);
  }
  function showToastSafe(msg){ try{ window.dispatchEvent(new CustomEvent('vpl-toast',{detail:msg})); }catch(e){} }

  playBtn.addEventListener('click', ()=>{
    running=!running; playBtn.textContent = running?'⏸ Pause':'▶ Apply Force'; lastTs=null;
    if(running) raf=requestAnimationFrame(step);
  });
  stage.querySelector('#nReset').addEventListener('click', ()=>{
    running=false; t=0; v=0; x=80; lastTs=null;
    playBtn.textContent='▶ Apply Force';
    velEl.textContent='0.0 m/s';
    accEl.textContent=(force/mass).toFixed(2)+' m/s²';
    badge.textContent=(force/mass).toFixed(2);
    draw();
  });
  controlsHost.querySelector('#fSlide').addEventListener('input', (e)=>{
    force=parseFloat(e.target.value);
    controlsHost.querySelector('#fVal').textContent=force.toFixed(1)+' N';
    forceEl.textContent = force.toFixed(1)+' N';
    if(!running){ accEl.textContent=(force/mass).toFixed(2)+' m/s²'; badge.textContent=(force/mass).toFixed(2); draw(); }
  });
  controlsHost.querySelector('#mSlide').addEventListener('input', (e)=>{
    mass=parseFloat(e.target.value);
    controlsHost.querySelector('#mVal').textContent=mass.toFixed(1)+' kg';
    if(!running){ accEl.textContent=(force/mass).toFixed(2)+' m/s²'; badge.textContent=(force/mass).toFixed(2); draw(); }
  });

  draw();
  return { unmount(){ running=false; if(raf) cancelAnimationFrame(raf); } };
}

window.Sims = window.Sims || {};
window.Sims.newton = {
  id:'newton', name:"Newton's Laws", category:'Force & Motion', icon:'📦', color:'#0D47A1',
  desc:'Push a box and see F = m·a come alive.',
  mount,
  theoryHTML:`
    <div class="info-card"><h4>Newton's three laws</h4>
      <ul>
        <li><b>1st Law:</b> An object stays at rest or in uniform motion unless acted on by a net force.</li>
        <li><b>2nd Law:</b> Force equals mass times acceleration.</li>
        <li><b>3rd Law:</b> Every action has an equal and opposite reaction.</li>
      </ul>
      <div class="formula">F = m × a</div>
    </div>`,
  instructionsHTML:`
    <div class="steps">
      <div class="step-item"><div class="step-num"></div><p>Choose a force and a mass with the sliders in Controls.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Press <b>Apply Force</b> to push the box and watch it accelerate.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Compare the readouts for acceleration and velocity as they change.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Increase the mass and repeat — the same force now produces less acceleration.</p></div>
    </div>`
};
})();
