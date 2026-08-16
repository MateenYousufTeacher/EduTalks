(function(){
function mount(stage, controlsHost){
  let voltage=9, r1=10, r2=10, mode='series', switchOn=true;
  let raf=null, phase=0;
  const W=560,H=280;

  stage.innerHTML = `
    <canvas id="cCanvas" width="${W}" height="${H}"></canvas>
    <div class="stage-toolbar">
      <div class="grp">
        <button class="btn btn-sm" id="cSwitch"></button>
      </div>
      <span class="badge badge-amber" id="cBadge">I = 0.00 A</span>
    </div>
    <div style="padding:0 14px 14px">
      <div class="readout-grid">
        <div class="readout"><b id="cV">9.0 V</b><small>Voltage</small></div>
        <div class="readout"><b id="cR">20.0 Ω</b><small>Total Resistance</small></div>
        <div class="readout"><b id="cI">0.00 A</b><small>Current</small></div>
      </div>
    </div>`;

  controlsHost.innerHTML = `
    <div class="ctrl-block">
      <div class="ctrl-label">Battery voltage <span class="val" id="vVal">${voltage.toFixed(1)} V</span></div>
      <input type="range" id="vSlide" min="1" max="20" step="0.5" value="${voltage}">
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Resistor R1 <span class="val" id="r1Val">${r1} Ω</span></div>
      <input type="range" id="r1Slide" min="1" max="40" step="1" value="${r1}">
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Resistor R2 <span class="val" id="r2Val">${r2} Ω</span></div>
      <input type="range" id="r2Slide" min="1" max="40" step="1" value="${r2}">
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label" style="margin-bottom:10px">Arrangement</div>
      <div class="seg" id="modeSeg">
        <button data-m="series" class="active">Series</button>
        <button data-m="parallel">Parallel</button>
      </div>
    </div>`;

  const canvas=stage.querySelector('#cCanvas'), ctx=canvas.getContext('2d');
  const badge=stage.querySelector('#cBadge');
  const cV=stage.querySelector('#cV'), cR=stage.querySelector('#cR'), cI=stage.querySelector('#cI');
  const switchBtn=stage.querySelector('#cSwitch');
  function getCss(v){ return getComputedStyle(document.body).getPropertyValue(v).trim() || '#333'; }
  function updateSwitchBtn(){ switchBtn.textContent = switchOn ? '🔓 Open Switch' : '🔒 Close Switch'; switchBtn.className='btn btn-sm ' + (switchOn?'btn-secondary':'btn-primary'); }

  function totalR(){ return mode==='series' ? (r1+r2) : (r1*r2)/(r1+r2); }
  function current(){ return switchOn ? voltage/totalR() : 0; }

  function draw(){
    ctx.clearRect(0,0,W,H);
    const I = current();
    ctx.lineWidth=4; ctx.lineCap='round'; ctx.strokeStyle=getCss('--dark-gray');

    // wire path (rectangle loop)
    const x0=60,x1=W-60,yTop=60,yBot=220;
    ctx.beginPath();
    ctx.moveTo(x0,yBot); ctx.lineTo(x0,yTop); ctx.lineTo(x1,yTop); ctx.lineTo(x1,yBot); ctx.lineTo(x0,yBot);
    ctx.stroke();

    // battery symbol on left wire
    const midY=(yTop+yBot)/2;
    ctx.fillStyle=getCss('--surface'); ctx.fillRect(x0-14,midY-18,28,36);
    ctx.strokeStyle=getCss('--deep-blue'); ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(x0,midY-16); ctx.lineTo(x0,midY-4); ctx.stroke();
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x0-8,midY+4); ctx.lineTo(x0+8,midY+4); ctx.stroke();
    ctx.lineWidth=6;
    ctx.beginPath(); ctx.moveTo(x0-6,midY+14); ctx.lineTo(x0+6,midY+14); ctx.stroke();
    ctx.fillStyle=getCss('--text-muted'); ctx.font='10px sans-serif'; ctx.textAlign='center';
    ctx.fillText(voltage.toFixed(1)+'V', x0, midY-24);

    // switch on top wire
    const swX=(x0+x1)/2-40;
    ctx.strokeStyle = switchOn ? getCss('--green') : '#C0392B'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(swX-14,yTop);
    if(switchOn){ ctx.lineTo(swX+14,yTop); } else { ctx.lineTo(swX+10,yTop-14); }
    ctx.stroke();
    ctx.beginPath(); ctx.arc(swX-14,yTop,3,0,7); ctx.arc(swX+14,yTop,3,0,7); ctx.fillStyle=getCss('--dark-gray'); ctx.fill();

    // resistors / bulbs
    if (mode==='series'){
      drawResistor(x1-130, yTop, 'R1='+r1+'Ω', true, I);
      drawBulb(x1, midY, I, x1, yTop, yBot);
    } else {
      drawParallelBranches(x0,x1,yTop,yBot,I);
    }

    // current flow dots
    if (I>0.001){
      ctx.fillStyle=getCss('--amber');
      const path = [[x0,yBot],[x0,yTop],[x1,yTop],[x1,yBot],[x0,yBot]];
      const totalLen = perim(path);
      const speed = Math.min(200, 40+I*30);
      for(let k=0;k<6;k++){
        const off = (phase*speed + k*totalLen/6) % totalLen;
        const pt = pointAtLength(path, off);
        ctx.beginPath(); ctx.arc(pt.x,pt.y,3.5,0,Math.PI*2); ctx.fill();
      }
    }

    function drawResistor(cx,cy,label,horiz,current){
      ctx.save();
      ctx.strokeStyle=getCss('--dark-gray'); ctx.lineWidth=3;
      ctx.beginPath();
      const zigW=48, zigH=10;
      ctx.moveTo(cx-zigW/2,cy);
      for(let i=0;i<6;i++){
        ctx.lineTo(cx-zigW/2+ (i+0.5)*zigW/6, cy + (i%2===0? -zigH: zigH));
      }
      ctx.lineTo(cx+zigW/2,cy);
      ctx.stroke();
      ctx.fillStyle=getCss('--text-muted'); ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText(label, cx, cy-18);
      ctx.restore();
    }
    function drawBulb(cx,cy,I,x1,yTop,yBot){
      const bx=x1, by=(yTop+yBot)/2;
      const brightness = Math.min(1, I/2);
      ctx.beginPath(); ctx.arc(bx,by,18,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,179,0,${0.15+brightness*0.85})`;
      ctx.fill();
      ctx.strokeStyle=getCss('--dark-gray'); ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx-8,by-8); ctx.lineTo(bx+8,by+8); ctx.moveTo(bx+8,by-8); ctx.lineTo(bx-8,by+8);
      ctx.strokeStyle=getCss('--dark-gray'); ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle=getCss('--text-muted'); ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText('Bulb', bx, by+34);
    }
    function drawParallelBranches(x0,x1,yTop,yBot,I){
      const midX=(x0+x1)/2;
      const branchY1=yTop+40, branchY2=yTop+95;
      [branchY1,branchY2].forEach((by,idx)=>{
        ctx.strokeStyle=getCss('--dark-gray'); ctx.lineWidth=3;
        ctx.beginPath(); ctx.moveTo(x0,by); ctx.lineTo(x1,by); ctx.stroke();
        // connectors
        ctx.beginPath(); ctx.moveTo(x0,yTop); ctx.lineTo(x0,by); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x1,yTop); ctx.lineTo(x1,by); ctx.stroke();
        drawResistor(midX, by, (idx===0?'R1='+r1:'R2='+r2)+'Ω', true, I);
      });
    }
    function perim(path){ let s=0; for(let i=1;i<path.length;i++) s+=dist(path[i-1],path[i]); return s; }
    function dist(a,b){ return Math.hypot(b[0]-a[0],b[1]-a[1]); }
    function pointAtLength(path,len){
      let remaining=len;
      for(let i=1;i<path.length;i++){
        const segLen = dist(path[i-1],path[i]);
        if (remaining<=segLen){
          const t=remaining/segLen;
          return { x: path[i-1][0]+(path[i][0]-path[i-1][0])*t, y: path[i-1][1]+(path[i][1]-path[i-1][1])*t };
        }
        remaining -= segLen;
      }
      return { x:path[0][0], y:path[0][1] };
    }
  }

  function updateReadouts(){
    const I=current(), R=totalR();
    cV.textContent=voltage.toFixed(1)+' V';
    cR.textContent=R.toFixed(1)+' Ω';
    cI.textContent=I.toFixed(2)+' A';
    badge.textContent='I = '+I.toFixed(2)+' A';
  }

  function loop(){
    phase += 0.02;
    draw();
    raf=requestAnimationFrame(loop);
  }

  switchBtn.addEventListener('click', ()=>{ switchOn=!switchOn; updateSwitchBtn(); updateReadouts(); });
  controlsHost.querySelector('#vSlide').addEventListener('input',(e)=>{
    voltage=parseFloat(e.target.value); controlsHost.querySelector('#vVal').textContent=voltage.toFixed(1)+' V'; updateReadouts();
  });
  controlsHost.querySelector('#r1Slide').addEventListener('input',(e)=>{
    r1=parseFloat(e.target.value); controlsHost.querySelector('#r1Val').textContent=r1+' Ω'; updateReadouts();
  });
  controlsHost.querySelector('#r2Slide').addEventListener('input',(e)=>{
    r2=parseFloat(e.target.value); controlsHost.querySelector('#r2Val').textContent=r2+' Ω'; updateReadouts();
  });
  controlsHost.querySelectorAll('#modeSeg button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      controlsHost.querySelectorAll('#modeSeg button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); mode=btn.dataset.m; updateReadouts();
    });
  });

  updateSwitchBtn(); updateReadouts();
  raf=requestAnimationFrame(loop);
  return { unmount(){ if(raf) cancelAnimationFrame(raf); } };
}

window.Sims = window.Sims || {};
window.Sims.circuit = {
  id:'circuit', name:'Electric Circuit', category:'Electricity', icon:'💡', color:'#43A047',
  desc:'Build series and parallel circuits and watch current flow.',
  mount,
  theoryHTML:`
    <div class="info-card"><h4>Ohm's Law</h4>
      <div class="formula">V = I × R</div>
      <p>Current is how much charge flows per second. More voltage pushes more current; more resistance holds it back.</p>
    </div>
    <div class="info-card"><h4>Series vs. parallel</h4>
      <ul>
        <li><b>Series:</b> resistances add up — same current everywhere.</li>
        <li><b>Parallel:</b> total resistance drops — each branch gets its own current.</li>
      </ul>
    </div>`,
  instructionsHTML:`
    <div class="steps">
      <div class="step-item"><div class="step-num"></div><p>Set the battery voltage and both resistor values in Controls.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Press the switch button to open or close the circuit.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Watch the amber dots — their speed shows how much current is flowing.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Switch between Series and Parallel and compare total resistance and current for the same components.</p></div>
    </div>`
};
})();
