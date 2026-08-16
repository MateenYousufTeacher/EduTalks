(function(){
function mount(stage, controlsHost){
  let running=false, t=0, u=2, a=0.6, lastTs=null, raf=null, trail=[];
  const W=560,H=280;

  stage.innerHTML = `
    <canvas id="mCanvas" width="${W}" height="${H}"></canvas>
    <div class="stage-toolbar">
      <div class="grp">
        <button class="btn btn-primary btn-sm" id="mPlay">▶ Start</button>
        <button class="btn btn-secondary btn-sm" id="mReset">⟲ Reset</button>
      </div>
      <span class="badge badge-amber">t = <span id="mBadge">0.0</span>s</span>
    </div>
    <div style="padding:0 14px 14px">
      <div class="readout-grid">
        <div class="readout"><b id="mDist">0.0 m</b><small>Distance</small></div>
        <div class="readout"><b id="mVel">${u.toFixed(1)} m/s</b><small>Velocity</small></div>
        <div class="readout"><b id="mTime">0.0 s</b><small>Time</small></div>
      </div>
    </div>`;

  controlsHost.innerHTML = `
    <div class="ctrl-block">
      <div class="ctrl-label">Initial velocity <span class="val" id="uVal">${u.toFixed(1)} m/s</span></div>
      <input type="range" id="uSlide" min="0" max="8" step="0.1" value="${u}">
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Acceleration <span class="val" id="aVal">${a.toFixed(1)} m/s²</span></div>
      <input type="range" id="aSlide" min="-2" max="2" step="0.1" value="${a}">
    </div>
    <div class="ctrl-block">
      <div class="toggle-row"><span>Show position–time graph</span>
        <label class="switch"><input type="checkbox" id="gToggle" checked><span class="slider-toggle"></span></label>
      </div>
    </div>
    <div class="info-card" style="margin-top:14px">
      <h4>What you're testing</h4>
      <p style="font-size:13px;color:var(--text-muted)">Drag the sliders, then press Start. Watch how initial velocity and acceleration change how fast distance builds up.</p>
    </div>`;

  const canvas = stage.querySelector('#mCanvas');
  const ctx = canvas.getContext('2d');
  const dist = stage.querySelector('#mDist');
  const vel = stage.querySelector('#mVel');
  const timeEl = stage.querySelector('#mTime');
  const badge = stage.querySelector('#mBadge');
  const playBtn = stage.querySelector('#mPlay');
  let showGraph = true;

  const track = { x0:40, x1:W-40, y:70 };
  const maxDist = 40;

  function xForPos(p){ return track.x0 + Math.min(p,maxDist)/maxDist * (track.x1-track.x0); }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // track
    ctx.strokeStyle = getCss('--border'); ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(track.x0,track.y); ctx.lineTo(track.x1,track.y); ctx.stroke();
    for(let i=0;i<=8;i++){
      const x = track.x0 + i/8*(track.x1-track.x0);
      ctx.fillStyle = getCss('--text-muted'); ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText((i*5)+'m', x, track.y+22);
      ctx.beginPath(); ctx.arc(x,track.y,2,0,7); ctx.fill();
    }
    const pos = u*t + 0.5*a*t*t;
    const cx = xForPos(Math.max(0,pos));
    // cart
    ctx.fillStyle = getCss('--deep-blue');
    roundRect(ctx, cx-16, track.y-24, 32, 20, 5); ctx.fill();
    ctx.beginPath(); ctx.arc(cx-9, track.y-2, 5, 0, 7); ctx.arc(cx+9, track.y-2, 5, 0, 7);
    ctx.fillStyle = getCss('--dark-gray'); ctx.fill();

    if (showGraph){
      const gx0=40, gx1=W-40, gy0=H-30, gy1=110, gT=12;
      ctx.strokeStyle = getCss('--border'); ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(gx0,gy1); ctx.lineTo(gx0,gy0); ctx.lineTo(gx1,gy0); ctx.stroke();
      ctx.fillStyle = getCss('--text-muted'); ctx.font='10px sans-serif'; ctx.textAlign='left';
      ctx.fillText('position (m)', gx0, gy1-6);
      ctx.textAlign='right'; ctx.fillText('time →', gx1, gy0+16);

      ctx.strokeStyle = getCss('--cyan'); ctx.lineWidth=2.5; ctx.beginPath();
      trail.forEach((pt,i)=>{
        const px = gx0 + (pt.t/gT)*(gx1-gx0);
        const py = gy0 - Math.min(pt.p, maxDist)/maxDist*(gy0-gy1);
        i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
      });
      ctx.stroke();
    }
  }
  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath(); ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }
  function getCss(v){ return getComputedStyle(document.body).getPropertyValue(v).trim() || '#333'; }

  function step(ts){
    if(!running) return;
    if(lastTs===null) lastTs=ts;
    const dt = Math.min((ts-lastTs)/1000, 0.05);
    lastTs = ts;
    t += dt;
    const pos = Math.max(0, u*t + 0.5*a*t*t);
    const currentV = u + a*t;
    trail.push({t, p:pos});
    if (trail.length>800) trail.shift();
    dist.textContent = pos.toFixed(1)+' m';
    vel.textContent = currentV.toFixed(1)+' m/s';
    timeEl.textContent = t.toFixed(1)+' s';
    badge.textContent = t.toFixed(1);
    draw();
    if (pos>=maxDist || t>12){ running=false; playBtn.textContent='▶ Start'; return; }
    raf = requestAnimationFrame(step);
  }

  playBtn.addEventListener('click', ()=>{
    running = !running;
    playBtn.textContent = running ? '⏸ Pause' : '▶ Start';
    lastTs=null;
    if (running) raf=requestAnimationFrame(step);
  });
  stage.querySelector('#mReset').addEventListener('click', ()=>{
    running=false; t=0; trail=[]; lastTs=null;
    playBtn.textContent='▶ Start';
    dist.textContent='0.0 m'; vel.textContent=u.toFixed(1)+' m/s'; timeEl.textContent='0.0 s'; badge.textContent='0.0';
    draw();
  });
  controlsHost.querySelector('#uSlide').addEventListener('input', (e)=>{
    u=parseFloat(e.target.value); controlsHost.querySelector('#uVal').textContent=u.toFixed(1)+' m/s';
    if(!running){ vel.textContent = u.toFixed(1)+' m/s'; draw(); }
  });
  controlsHost.querySelector('#aSlide').addEventListener('input', (e)=>{
    a=parseFloat(e.target.value); controlsHost.querySelector('#aVal').textContent=a.toFixed(1)+' m/s²';
  });
  controlsHost.querySelector('#gToggle').addEventListener('change',(e)=>{ showGraph=e.target.checked; draw(); });

  draw();
  return { unmount(){ running=false; if(raf) cancelAnimationFrame(raf); } };
}

window.Sims = window.Sims || {};
window.Sims.motion = {
  id:'motion', name:"Motion", category:'Mechanics', icon:'🏃', color:'#1976D2',
  desc:'Distance, speed, time and acceleration on a track.',
  mount,
  theoryHTML:`
    <div class="info-card"><h4>Key idea</h4>
      <p>Motion describes how an object's position changes over time. Speed tells us how fast that change happens; velocity adds direction.</p>
      <div class="formula">distance = u·t + ½·a·t²</div>
    </div>
    <div class="info-card"><h4>Terms</h4>
      <ul>
        <li><b>u</b> — initial velocity (m/s)</li>
        <li><b>a</b> — acceleration (m/s²), can be positive (speeding up) or negative (slowing down)</li>
        <li><b>t</b> — time elapsed (s)</li>
      </ul>
    </div>`,
  instructionsHTML:`
    <div class="steps">
      <div class="step-item"><div class="step-num"></div><p>Set the initial velocity and acceleration using the Controls tab.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Press <b>Start</b> and watch the cart move along the track.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Read the live distance, velocity and time in the readouts.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Toggle the position–time graph to see the motion's shape (straight = constant speed, curved = acceleration).</p></div>
      <div class="step-item"><div class="step-num"></div><p>Press <b>Reset</b> and try a negative acceleration to see the cart slow down.</p></div>
    </div>`
};
})();
