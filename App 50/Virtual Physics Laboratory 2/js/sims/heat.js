(function(){
function mount(stage, controlsHost){
  let heaterOn=false, power=5, material='water';
  let running=false, raf=null, lastTs=null, t=0, temp=25;
  const W=560,H=280;
  const CAPACITY = { water:4.2, iron:0.45, oil:2.0 };
  const AMBIENT=25;
  let trail=[{t:0,T:temp}];

  stage.innerHTML = `
    <canvas id="hCanvas" width="${W}" height="${H}"></canvas>
    <div class="stage-toolbar">
      <div class="grp">
        <button class="btn btn-primary btn-sm" id="hPlay">🔥 Turn Heater On</button>
        <button class="btn btn-secondary btn-sm" id="hReset">⟲ Reset</button>
      </div>
      <span class="badge badge-amber"><span id="hBadge">25.0</span>°C</span>
    </div>
    <div style="padding:0 14px 14px">
      <div class="readout-grid">
        <div class="readout"><b id="hTemp">25.0 °C</b><small>Temperature</small></div>
        <div class="readout"><b id="hTime">0.0 s</b><small>Time Heated</small></div>
        <div class="readout"><b id="hRate">${CAPACITY.water}</b><small>Specific Heat (J/g°C)</small></div>
      </div>
    </div>`;

  controlsHost.innerHTML = `
    <div class="ctrl-block">
      <div class="ctrl-label" style="margin-bottom:10px">Material</div>
      <div class="seg" id="matSeg">
        <button data-m="water" class="active">Water</button>
        <button data-m="oil">Oil</button>
        <button data-m="iron">Iron</button>
      </div>
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Heater power <span class="val" id="pVal">${power} units</span></div>
      <input type="range" id="pSlide" min="1" max="10" step="1" value="${power}">
    </div>`;

  const canvas=stage.querySelector('#hCanvas'), ctx=canvas.getContext('2d');
  const tempEl=stage.querySelector('#hTemp'), timeEl=stage.querySelector('#hTime'), rateEl=stage.querySelector('#hRate');
  const badge=stage.querySelector('#hBadge'), playBtn=stage.querySelector('#hPlay');
  function getCss(v){ return getComputedStyle(document.body).getPropertyValue(v).trim() || '#333'; }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // container
    const cx=90, cy=40, cw=140, chh=170;
    ctx.strokeStyle=getCss('--border'); ctx.lineWidth=3;
    ctx.strokeRect(cx,cy,cw,chh);
    const fillFrac = Math.min(1, Math.max(0,(temp-10)/110));
    const liquidColors = { water:'#5AB6E8', oil:'#D9A441', iron:'#9AA0A6' };
    ctx.fillStyle = liquidColors[material];
    const liqH = chh*0.75;
    ctx.fillRect(cx+3, cy+chh-liqH-3, cw-6, liqH);
    // heat glow
    if (heaterOn){
      ctx.fillStyle='rgba(255,100,50,'+(0.15+0.1*Math.sin(t*8))+')';
      ctx.fillRect(cx, cy+chh-30, cw, 30);
    }
    // thermometer
    const thx=300, thTop=40, thBot=210;
    ctx.strokeStyle=getCss('--border'); ctx.lineWidth=8; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(thx,thTop); ctx.lineTo(thx,thBot); ctx.stroke();
    const frac = Math.min(1,Math.max(0,(temp-0)/150));
    const fillY = thBot - frac*(thBot-thTop);
    ctx.strokeStyle = temp>60 ? '#E4574C' : (temp>35 ? getCss('--amber') : getCss('--cyan'));
    ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(thx,thBot); ctx.lineTo(thx,fillY); ctx.stroke();
    ctx.beginPath(); ctx.arc(thx,thBot+10,12,0,Math.PI*2); ctx.fillStyle=ctx.strokeStyle; ctx.fill();

    // graph
    const gx0=360, gx1=W-30, gy0=230, gy1=50;
    ctx.strokeStyle=getCss('--border'); ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(gx0,gy1); ctx.lineTo(gx0,gy0); ctx.lineTo(gx1,gy0); ctx.stroke();
    ctx.fillStyle=getCss('--text-muted'); ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('Temp (°C)', gx0, gy1-6);
    ctx.textAlign='right'; ctx.fillText('time →', gx1, gy0+14);
    ctx.strokeStyle=getCss('--amber'); ctx.lineWidth=2.5; ctx.beginPath();
    const maxT=30;
    trail.forEach((pt,i)=>{
      const px = gx0 + Math.min(pt.t/maxT,1)*(gx1-gx0);
      const py = gy0 - Math.min(Math.max((pt.T-10)/140,0),1)*(gy0-gy1);
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    });
    ctx.stroke();
  }

  function step(ts){
    if(!running) return;
    if(lastTs===null) lastTs=ts;
    const dt=Math.min((ts-lastTs)/1000,0.05); lastTs=ts;
    t+=dt;
    const c = CAPACITY[material];
    const heatIn = heaterOn ? power*1.2/c : 0;
    const cooling = 0.15*(temp-AMBIENT);
    temp += (heatIn - cooling)*dt*2;
    temp = Math.max(AMBIENT-2, temp);
    trail.push({t,T:temp}); if(trail.length>1000) trail.shift();
    tempEl.textContent=temp.toFixed(1)+' °C';
    timeEl.textContent=t.toFixed(1)+' s';
    badge.textContent=temp.toFixed(1);
    draw();
    raf=requestAnimationFrame(step);
  }

  playBtn.addEventListener('click', ()=>{
    heaterOn=!heaterOn; running=true; lastTs=null;
    playBtn.textContent = heaterOn ? '❄️ Turn Heater Off' : '🔥 Turn Heater On';
    if (heaterOn===false){ /* keep cooling simulation running */ }
    if(!raf) raf=requestAnimationFrame(step);
  });
  stage.querySelector('#hReset').addEventListener('click', ()=>{
    running=false; heaterOn=false; if(raf) cancelAnimationFrame(raf); raf=null;
    t=0; temp=25; trail=[{t:0,T:temp}]; lastTs=null;
    playBtn.textContent='🔥 Turn Heater On';
    tempEl.textContent='25.0 °C'; timeEl.textContent='0.0 s'; badge.textContent='25.0';
    draw();
  });
  controlsHost.querySelectorAll('#matSeg button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      controlsHost.querySelectorAll('#matSeg button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); material=btn.dataset.m;
      rateEl.textContent = CAPACITY[material];
      draw();
    });
  });
  controlsHost.querySelector('#pSlide').addEventListener('input',(e)=>{
    power=parseFloat(e.target.value);
    controlsHost.querySelector('#pVal').textContent=power+' units';
  });

  draw();
  return { unmount(){ running=false; if(raf) cancelAnimationFrame(raf); } };
}

window.Sims = window.Sims || {};
window.Sims.heat = {
  id:'heat', name:'Heat', category:'Thermal', icon:'🔥', color:'#E4574C',
  desc:'Heat different materials and track temperature.',
  mount,
  theoryHTML:`
    <div class="info-card"><h4>Key idea</h4>
      <p>Heat is energy transferred due to a temperature difference. How fast a material heats up depends on its specific heat capacity — how much energy it takes to raise 1 gram by 1°C.</p>
      <div class="formula">Q = m × c × ΔT</div>
    </div>
    <div class="info-card"><h4>Why materials differ</h4>
      <p style="font-size:13px;color:var(--text-muted)">Water has a high specific heat capacity, so it heats up slowly and stays warm longer than metal.</p>
    </div>`,
  instructionsHTML:`
    <div class="steps">
      <div class="step-item"><div class="step-num"></div><p>Choose a material and heater power in Controls.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Press the heater button to start warming — watch the thermometer and graph climb.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Turn the heater off and watch the temperature ease back toward room temperature.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Compare how fast water heats up versus iron at the same power.</p></div>
    </div>`
};
})();
