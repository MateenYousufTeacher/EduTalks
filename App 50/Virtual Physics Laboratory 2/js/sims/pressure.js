(function(){
function mount(stage, controlsHost){
  let mode='solid';
  let force=40, area=20; // solid: N, cm^2
  let depth=4; // m, liquid
  const W=560,H=280;
  const rho=1000, g=9.8;

  stage.innerHTML = `
    <canvas id="pCanvas" width="${W}" height="${H}"></canvas>
    <div class="stage-toolbar">
      <div class="grp">
        <span class="badge badge-amber" id="pBadge">P = 0 Pa</span>
      </div>
    </div>
    <div style="padding:0 14px 14px">
      <div class="readout-grid">
        <div class="readout"><b id="pF">40 N</b><small id="pFLabel">Force</small></div>
        <div class="readout"><b id="pA">20 cm²</b><small id="pALabel">Area</small></div>
        <div class="readout"><b id="pP">200 kPa</b><small>Pressure</small></div>
      </div>
    </div>`;

  controlsHost.innerHTML = `
    <div class="ctrl-block">
      <div class="ctrl-label" style="margin-bottom:10px">Scenario</div>
      <div class="seg" id="modeSeg">
        <button data-m="solid" class="active">Solid on surface</button>
        <button data-m="liquid">Liquid at depth</button>
      </div>
    </div>
    <div id="solidCtrls">
      <div class="ctrl-block">
        <div class="ctrl-label">Force <span class="val" id="fVal">40 N</span></div>
        <input type="range" id="fSlide" min="5" max="100" step="1" value="40">
      </div>
      <div class="ctrl-block">
        <div class="ctrl-label">Contact area <span class="val" id="aVal">20 cm²</span></div>
        <input type="range" id="aSlide" min="2" max="60" step="1" value="20">
      </div>
    </div>
    <div id="liquidCtrls" class="hidden">
      <div class="ctrl-block">
        <div class="ctrl-label">Depth <span class="val" id="dVal">4.0 m</span></div>
        <input type="range" id="dSlide" min="0.5" max="10" step="0.5" value="4">
      </div>
    </div>`;

  const canvas=stage.querySelector('#pCanvas'), ctx=canvas.getContext('2d');
  const badge=stage.querySelector('#pBadge');
  const pF=stage.querySelector('#pF'), pFLabel=stage.querySelector('#pFLabel'), pA=stage.querySelector('#pA'), pALabel=stage.querySelector('#pALabel'), pP=stage.querySelector('#pP');
  function getCss(v){ return getComputedStyle(document.body).getPropertyValue(v).trim() || '#333'; }

  function drawSolid(){
    ctx.clearRect(0,0,W,H);
    const groundY=220;
    ctx.strokeStyle=getCss('--border'); ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(40,groundY); ctx.lineTo(W-40,groundY); ctx.stroke();

    const wPx = 40 + area*2.2;
    const blockH = 44;
    const bx = W/2 - wPx/2;
    ctx.fillStyle = getCss('--deep-blue');
    ctx.fillRect(bx, groundY-blockH, wPx, blockH);
    ctx.fillStyle='#fff'; ctx.font='700 12px sans-serif'; ctx.textAlign='center';
    ctx.fillText(area.toFixed(0)+' cm² base', W/2, groundY-blockH/2+4);

    // force arrow downward
    ctx.strokeStyle=getCss('--amber'); ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(W/2, groundY-blockH-60); ctx.lineTo(W/2, groundY-blockH-8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2, groundY-blockH-8); ctx.lineTo(W/2-8,groundY-blockH-20); ctx.lineTo(W/2+8,groundY-blockH-20); ctx.closePath();
    ctx.fillStyle=getCss('--amber'); ctx.fill();
    ctx.fillStyle=getCss('--text-muted'); ctx.font='11px sans-serif';
    ctx.fillText('F = '+force+' N', W/2, groundY-blockH-66);

    // indentation depth visual proportional to pressure
    const pressure = force/(area/10000);
    const dent = Math.min(14, pressure/40000);
    ctx.fillStyle='rgba(0,0,0,.12)';
    ctx.beginPath(); ctx.ellipse(W/2, groundY+3, wPx/2, dent, 0,0,Math.PI*2); ctx.fill();
  }

  function drawLiquid(){
    ctx.clearRect(0,0,W,H);
    const tankX=140, tankW=280, tankTop=40, tankBottom=250;
    ctx.fillStyle='rgba(38,198,218,.28)';
    ctx.fillRect(tankX, tankTop, tankW, tankBottom-tankTop);
    ctx.strokeStyle=getCss('--border'); ctx.lineWidth=3;
    ctx.strokeRect(tankX, tankTop, tankW, tankBottom-tankTop);

    // depth markers
    for(let d=0; d<=10; d+=2){
      const yy = tankTop + (d/10)*(tankBottom-tankTop);
      ctx.strokeStyle='rgba(120,120,120,.35)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(tankX,yy); ctx.lineTo(tankX+tankW,yy); ctx.stroke();
      ctx.fillStyle=getCss('--text-muted'); ctx.font='9px sans-serif'; ctx.textAlign='right';
      ctx.fillText(d+'m', tankX-6, yy+3);
    }

    const markerY = tankTop + (depth/10)*(tankBottom-tankTop);
    ctx.beginPath(); ctx.arc(tankX+tankW/2, markerY, 8, 0, Math.PI*2);
    ctx.fillStyle=getCss('--deep-blue'); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();

    // pressure arrows around the point, longer = more pressure
    const P = rho*g*depth;
    const len = Math.min(60, P/700);
    ctx.strokeStyle=getCss('--amber'); ctx.lineWidth=3;
    [[-1,0],[1,0],[0,1]].forEach(([dx,dy])=>{
      const sx=tankX+tankW/2+dx*10, sy=markerY+dy*10;
      const ex=sx+dx*len, ey=sy+dy*len;
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke();
    });
  }

  function updateReadouts(){
    if (mode==='solid'){
      const pressure = force/(area/10000); // Pa
      pF.textContent=force+' N'; pFLabel.textContent='Force';
      pA.textContent=area+' cm²'; pALabel.textContent='Area';
      pP.textContent = (pressure/1000).toFixed(1)+' kPa';
      badge.textContent='P = '+(pressure/1000).toFixed(1)+' kPa';
      drawSolid();
    } else {
      const P = rho*g*depth;
      pF.textContent=depth.toFixed(1)+' m'; pFLabel.textContent='Depth';
      pA.textContent=(rho)+' kg/m³'; pALabel.textContent='Liquid density';
      pP.textContent = (P/1000).toFixed(1)+' kPa';
      badge.textContent='P = '+(P/1000).toFixed(1)+' kPa';
      drawLiquid();
    }
  }

  controlsHost.querySelectorAll('#modeSeg button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      controlsHost.querySelectorAll('#modeSeg button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); mode=btn.dataset.m;
      controlsHost.querySelector('#solidCtrls').classList.toggle('hidden', mode!=='solid');
      controlsHost.querySelector('#liquidCtrls').classList.toggle('hidden', mode!=='liquid');
      updateReadouts();
    });
  });
  controlsHost.querySelector('#fSlide').addEventListener('input',(e)=>{
    force=parseFloat(e.target.value); controlsHost.querySelector('#fVal').textContent=force+' N'; updateReadouts();
  });
  controlsHost.querySelector('#aSlide').addEventListener('input',(e)=>{
    area=parseFloat(e.target.value); controlsHost.querySelector('#aVal').textContent=area+' cm²'; updateReadouts();
  });
  controlsHost.querySelector('#dSlide').addEventListener('input',(e)=>{
    depth=parseFloat(e.target.value); controlsHost.querySelector('#dVal').textContent=depth.toFixed(1)+' m'; updateReadouts();
  });

  updateReadouts();
  return { unmount(){} };
}

window.Sims = window.Sims || {};
window.Sims.pressure = {
  id:'pressure', name:'Pressure', category:'Fluids', icon:'⬇️', color:'#26C6DA',
  desc:'Force over area — on solids and deep underwater.',
  mount,
  theoryHTML:`
    <div class="info-card"><h4>Key idea</h4>
      <p>Pressure spreads a force over an area. The same force feels far more intense on a small area (like a drawing pin) than a large one.</p>
      <div class="formula">Pressure = Force ÷ Area</div>
    </div>
    <div class="info-card"><h4>Liquid pressure</h4>
      <p>Inside a liquid, pressure increases with depth because more liquid weighs down from above.</p>
      <div class="formula">P = ρ × g × depth</div>
    </div>`,
  instructionsHTML:`
    <div class="steps">
      <div class="step-item"><div class="step-num"></div><p>Choose "Solid on surface" or "Liquid at depth" in Controls.</p></div>
      <div class="step-item"><div class="step-num"></div><p>For solids: shrink the contact area while keeping force fixed — watch pressure rise sharply.</p></div>
      <div class="step-item"><div class="step-num"></div><p>For liquids: increase depth and watch the pressure arrows grow longer.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Compare the kPa readout across both scenarios.</p></div>
    </div>`
};
})();
