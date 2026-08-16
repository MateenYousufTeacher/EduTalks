(function(){
function mount(stage, controlsHost){
  let strength=6, compassX=420, compassY=90, mode='field', gap=140;
  let raf=null, dragging=false;
  const W=560,H=280;
  const magX=200, magY=150, magW=140, magH=34;

  stage.innerHTML = `
    <canvas id="magCanvas" width="${W}" height="${H}"></canvas>
    <div class="stage-toolbar">
      <span class="badge badge-amber" id="magBadge">Drag the compass</span>
    </div>
    <div style="padding:0 14px 14px">
      <div class="readout-grid">
        <div class="readout"><b id="magField">—</b><small>Field Direction at Compass</small></div>
        <div class="readout"><b id="magPole">N ↔ S</b><small>Poles</small></div>
        <div class="readout"><b id="magForce">—</b><small>Interaction</small></div>
      </div>
    </div>`;

  controlsHost.innerHTML = `
    <div class="ctrl-block">
      <div class="ctrl-label" style="margin-bottom:10px">Mode</div>
      <div class="seg" id="magSeg">
        <button data-m="field" class="active">Field &amp; Compass</button>
        <button data-m="poles">Two Magnets</button>
      </div>
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Magnet strength <span class="val" id="sVal">${strength}</span></div>
      <input type="range" id="sSlide" min="2" max="10" step="1" value="${strength}">
    </div>
    <div class="ctrl-block hidden" id="gapCtrl">
      <div class="ctrl-label">Distance between magnets <span class="val" id="gVal">${gap}px</span></div>
      <input type="range" id="gSlide" min="60" max="260" step="5" value="${gap}">
    </div>
    <div class="ctrl-block" id="poleFlipCtrl">
      <button class="btn btn-secondary btn-block btn-sm" id="flipBtn">🔄 Flip Second Magnet</button>
    </div>`;

  const canvas=stage.querySelector('#magCanvas'), ctx=canvas.getContext('2d');
  const badge=stage.querySelector('#magBadge');
  const fieldEl=stage.querySelector('#magField'), forceEl=stage.querySelector('#magForce');
  let secondFlipped=false;
  function getCss(v){ return getComputedStyle(document.body).getPropertyValue(v).trim() || '#333'; }

  function fieldVectorAt(x,y){
    // dipole-ish approximation: field points from S to N outside, computed via two "poles" as point sources
    const NxA = magX+magW/2, NyA = magY, SxA = magX-magW/2, SyA = magY;
    const toN = {x:x-NxA,y:y-NyA}, toS = {x:x-SxA,y:y-SyA};
    const rN = Math.max(14,Math.hypot(toN.x,toN.y)), rS = Math.max(14,Math.hypot(toS.x,toS.y));
    const kN = strength*4000/(rN*rN), kS = strength*4000/(rS*rS);
    const vx = (toN.x/rN)*kN - (toS.x/rS)*kS;
    const vy = (toN.y/rN)*kN - (toS.y/rS)*kS;
    return {x:vx,y:vy};
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    if (mode==='field'){
      drawMagnet(magX,magY,magW,magH,'N','S');
      // field lines: draw sample streamlines
      ctx.strokeStyle='rgba(38,198,218,.55)'; ctx.lineWidth=1.3;
      for(let i=0;i<10;i++){
        const angle = (i/10)*Math.PI*2;
        let x=magX+magW/2+Math.cos(angle)*20, y=magY+Math.sin(angle)*20;
        ctx.beginPath(); ctx.moveTo(x,y);
        for(let s=0;s<60;s++){
          const v=fieldVectorAt(x,y);
          const len=Math.hypot(v.x,v.y)||1;
          x += (v.x/len)*4; y += (v.y/len)*4;
          if (x<10||x>W-10||y<10||y>H-10) break;
          ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      // compass
      drawCompass(compassX,compassY);
      const v = fieldVectorAt(compassX,compassY);
      const angleDeg = (Math.atan2(v.y,v.x)*180/Math.PI+360)%360;
      fieldEl.textContent = angleDeg.toFixed(0)+'°';
      forceEl.textContent = 'Points toward N';
      badge.textContent = 'Drag the compass around the magnet';
    } else {
      const m1x=W/2-gap/2, m2x=W/2+gap/2;
      drawMagnet(m1x-magW/2,magY,magW,magH,'N','S');
      const p2NLeft = secondFlipped;
      drawMagnet(m2x-magW/2,magY,magW,magH, p2NLeft?'N':'S', p2NLeft?'S':'N');

      const facingPoles = secondFlipped ? 'N ↔ N' : 'N ↔ S';
      const attract = !secondFlipped;
      forceEl.textContent = attract ? 'Attracting →' : 'Repelling ↔';
      fieldEl.textContent = facingPoles;
      badge.textContent = attract ? 'Opposite poles attract' : 'Like poles repel';

      // force arrows
      const midY=magY;
      ctx.strokeStyle = attract ? getCss('--green') : '#C0392B';
      ctx.lineWidth=4;
      const arrowLen=Math.min(40, strength*4);
      if (attract){
        drawArrowLine(m1x+magW/2+6, midY, m1x+magW/2+6+arrowLen, midY);
        drawArrowLine(m2x-magW/2-6, midY, m2x-magW/2-6-arrowLen, midY);
      } else {
        drawArrowLine(m1x+magW/2+6+arrowLen, midY, m1x+magW/2+6, midY);
        drawArrowLine(m2x-magW/2-6-arrowLen, midY, m2x-magW/2-6, midY);
      }
    }

    function drawArrowLine(x0,y0,x1,y1){
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
      const angle=Math.atan2(y1-y0,x1-x0);
      ctx.beginPath(); ctx.moveTo(x1,y1);
      ctx.lineTo(x1-9*Math.cos(angle-0.4),y1-9*Math.sin(angle-0.4));
      ctx.lineTo(x1-9*Math.cos(angle+0.4),y1-9*Math.sin(angle+0.4));
      ctx.closePath(); ctx.fillStyle=ctx.strokeStyle; ctx.fill();
    }
    function drawMagnet(x,y,w,h,nLabel,sLabel){
      ctx.fillStyle = '#C0392B';
      ctx.fillRect(x, y-h/2, w/2, h);
      ctx.fillStyle = getCss('--deep-blue');
      ctx.fillRect(x+w/2, y-h/2, w/2, h);
      ctx.strokeStyle=getCss('--border'); ctx.lineWidth=1.5; ctx.strokeRect(x,y-h/2,w,h);
      ctx.fillStyle='#fff'; ctx.font='700 14px sans-serif'; ctx.textAlign='center';
      ctx.fillText(nLabel, x+w/4, y+5);
      ctx.fillText(sLabel, x+3*w/4, y+5);
    }
    function drawCompass(x,y){
      const v=fieldVectorAt(x,y);
      const angle=Math.atan2(v.y,v.x);
      ctx.beginPath(); ctx.arc(x,y,20,0,Math.PI*2);
      ctx.fillStyle=getCss('--surface'); ctx.fill(); ctx.strokeStyle=getCss('--border'); ctx.lineWidth=2; ctx.stroke();
      ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
      ctx.beginPath(); ctx.moveTo(-16,0); ctx.lineTo(0,-4); ctx.lineTo(0,4); ctx.closePath(); ctx.fillStyle='#C0392B'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(0,-4); ctx.lineTo(0,4); ctx.closePath(); ctx.fillStyle=getCss('--deep-blue'); ctx.fill();
      ctx.restore();
    }
  }

  function loop(){ draw(); raf=requestAnimationFrame(loop); }

  function onDown(e){
    if (mode!=='field') return;
    const r=canvas.getBoundingClientRect();
    const x=(e.clientX-r.left)*(W/r.width), y=(e.clientY-r.top)*(H/r.height);
    if (Math.hypot(x-compassX,y-compassY)<30) dragging=true;
  }
  function onMove(e){
    if(!dragging) return;
    const r=canvas.getBoundingClientRect();
    compassX=Math.max(20,Math.min(W-20,(e.clientX-r.left)*(W/r.width)));
    compassY=Math.max(20,Math.min(H-20,(e.clientY-r.top)*(H/r.height)));
  }
  function onUp(){ dragging=false; }
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  controlsHost.querySelectorAll('#magSeg button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      controlsHost.querySelectorAll('#magSeg button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); mode=btn.dataset.m;
      controlsHost.querySelector('#gapCtrl').classList.toggle('hidden', mode!=='poles');
      controlsHost.querySelector('#poleFlipCtrl').classList.toggle('hidden', mode!=='poles');
    });
  });
  controlsHost.querySelector('#sSlide').addEventListener('input',(e)=>{
    strength=parseFloat(e.target.value); controlsHost.querySelector('#sVal').textContent=strength;
  });
  controlsHost.querySelector('#gSlide').addEventListener('input',(e)=>{
    gap=parseFloat(e.target.value); controlsHost.querySelector('#gVal').textContent=gap+'px';
  });
  controlsHost.querySelector('#flipBtn').addEventListener('click', ()=>{ secondFlipped=!secondFlipped; });

  raf=requestAnimationFrame(loop);
  return { unmount(){
    if(raf) cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  } };
}

window.Sims = window.Sims || {};
window.Sims.magnetism = {
  id:'magnetism', name:'Magnetism', category:'Magnetism', icon:'🧲', color:'#0D47A1',
  desc:'Explore field lines, compasses, and pole interactions.',
  mount,
  theoryHTML:`
    <div class="info-card"><h4>Key idea</h4>
      <p>Every magnet has a North and South pole. Field lines leave the North pole and curve around into the South pole, showing the direction a compass needle would point.</p>
    </div>
    <div class="info-card"><h4>Rule of poles</h4>
      <p>Like poles repel, opposite poles attract — the closer the magnets, the stronger the push or pull.</p>
    </div>`,
  instructionsHTML:`
    <div class="steps">
      <div class="step-item"><div class="step-num"></div><p>In "Field & Compass" mode, drag the compass around the bar magnet.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Notice the needle always aligns with the field line at that point.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Switch to "Two Magnets" mode and adjust the distance between them.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Press "Flip Second Magnet" to switch from attraction to repulsion.</p></div>
    </div>`
};
})();
