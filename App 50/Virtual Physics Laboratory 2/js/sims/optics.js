(function(){
function mount(stage, controlsHost){
  let doDist=18, f=10, lensType='convex';
  let raf=null, tGlow=0;
  const W=560,H=280;
  const axisY=140, lensX=320, scale=9; // px per cm-ish unit

  stage.innerHTML = `
    <canvas id="oCanvas" width="${W}" height="${H}"></canvas>
    <div class="stage-toolbar">
      <span class="badge badge-amber" id="oBadge">Real, inverted image</span>
    </div>
    <div style="padding:0 14px 14px">
      <div class="readout-grid">
        <div class="readout"><b id="oDi">—</b><small>Image Distance</small></div>
        <div class="readout"><b id="oMag">—</b><small>Magnification</small></div>
        <div class="readout"><b id="oType">Real</b><small>Image Type</small></div>
      </div>
    </div>`;

  controlsHost.innerHTML = `
    <div class="ctrl-block">
      <div class="ctrl-label" style="margin-bottom:10px">Lens type</div>
      <div class="seg" id="lensSeg">
        <button data-l="convex" class="active">Convex (converging)</button>
        <button data-l="concave">Concave (diverging)</button>
      </div>
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Object distance <span class="val" id="dVal">${doDist} cm</span></div>
      <input type="range" id="dSlide" min="4" max="30" step="1" value="${doDist}">
    </div>
    <div class="ctrl-block">
      <div class="ctrl-label">Focal length <span class="val" id="fVal">${f} cm</span></div>
      <input type="range" id="fSlide" min="4" max="18" step="1" value="${f}">
    </div>`;

  const canvas=stage.querySelector('#oCanvas'), ctx=canvas.getContext('2d');
  const badge=stage.querySelector('#oBadge');
  const diEl=stage.querySelector('#oDi'), magEl=stage.querySelector('#oMag'), typeEl=stage.querySelector('#oType');
  function getCss(v){ return getComputedStyle(document.body).getPropertyValue(v).trim() || '#333'; }

  function compute(){
    const fSigned = lensType==='convex' ? f : -f;
    const denom = (1/fSigned - 1/doDist);
    const di = denom !== 0 ? 1/denom : Infinity;
    const m = -di/doDist;
    return { di, m };
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // axis
    ctx.strokeStyle=getCss('--border'); ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(20,axisY); ctx.lineTo(W-20,axisY); ctx.stroke();

    // lens
    ctx.strokeStyle=getCss('--deep-blue'); ctx.lineWidth=4;
    ctx.beginPath();
    if (lensType==='convex'){
      ctx.moveTo(lensX,axisY-90); ctx.quadraticCurveTo(lensX+16,axisY,lensX,axisY+90);
      ctx.quadraticCurveTo(lensX-16,axisY,lensX,axisY-90);
    } else {
      ctx.moveTo(lensX-10,axisY-90); ctx.quadraticCurveTo(lensX,axisY,lensX-10,axisY+90);
      ctx.moveTo(lensX+10,axisY-90); ctx.quadraticCurveTo(lensX,axisY,lensX+10,axisY+90);
    }
    ctx.stroke();

    // focal points
    ctx.fillStyle=getCss('--text-muted'); ctx.font='10px sans-serif'; ctx.textAlign='center';
    const F1x = lensX - f*scale/3, F2x = lensX + f*scale/3;
    [F1x,F2x].forEach(fx=>{
      ctx.beginPath(); ctx.arc(fx,axisY,3,0,Math.PI*2); ctx.fillStyle=getCss('--amber'); ctx.fill();
    });
    ctx.fillStyle=getCss('--text-muted');
    ctx.fillText('F', F1x, axisY+16); ctx.fillText('F', F2x, axisY+16);

    // object
    const objX = lensX - doDist*scale/3;
    const objH = 50;
    drawArrow(objX, axisY, objX, axisY-objH, getCss('--green'));
    ctx.fillStyle=getCss('--text-muted'); ctx.font='10px sans-serif';
    ctx.fillText('Object', objX, axisY+16);

    const {di,m} = compute();
    const imgX = lensX + di*scale/3;
    const imgH = objH*m;

    // rays from object tip
    const tipX=objX, tipY=axisY-objH;
    ctx.setLineDash([]);
    ctx.strokeStyle=getCss('--cyan'); ctx.lineWidth=1.6;
    // ray 1: parallel to axis -> refracts through F2 (convex) or diverges as if from F1 (concave)
    ctx.beginPath(); ctx.moveTo(tipX,tipY); ctx.lineTo(lensX,tipY); ctx.stroke();
    if (lensType==='convex'){
      extendRay(lensX,tipY, F2x, axisY, 700);
    } else {
      extendRayFrom(lensX,tipY,F1x,axisY,700,true);
    }
    // ray 2: through center, undeviated
    ctx.beginPath(); ctx.moveTo(tipX,tipY);
    const dx2 = lensX-tipX, dy2 = axisY-tipY;
    ctx.lineTo(tipX+dx2*8, tipY+dy2*8);
    ctx.stroke();

    // image
    if (isFinite(imgH) && Math.abs(imgH) < 400){
      const color = m<0 ? getCss('--deep-blue') : 'rgba(20,120,200,0.55)';
      drawArrow(imgX, axisY, imgX, axisY-imgH, color, m<0?false:true);
      ctx.fillStyle=getCss('--text-muted'); ctx.font='10px sans-serif';
      ctx.fillText('Image', imgX, axisY + (m<0? 34 : -Math.abs(imgH)-10));
    }

    function drawArrow(x0,y0,x1,y1,color,dashed){
      ctx.save();
      if(dashed) ctx.setLineDash([5,4]);
      ctx.strokeStyle=color; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
      const angle = Math.atan2(y1-y0,x1-x0);
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x1-10*Math.cos(angle-0.4), y1-10*Math.sin(angle-0.4));
      ctx.lineTo(x1-10*Math.cos(angle+0.4), y1-10*Math.sin(angle+0.4));
      ctx.closePath(); ctx.fillStyle=color; ctx.fill();
      ctx.restore();
    }
    function extendRay(x0,y0,fx,fy,len){
      const angle = Math.atan2(fy-y0,fx-x0);
      ctx.beginPath(); ctx.moveTo(x0,y0);
      ctx.lineTo(x0+Math.cos(angle)*len, y0+Math.sin(angle)*len);
      ctx.stroke();
    }
    function extendRayFrom(x0,y0,fx,fy,len,reverse){
      // ray appears to diverge from F1 on same side (dashed backward extension)
      const angle = Math.atan2(y0-fy,x0-fx);
      ctx.beginPath(); ctx.moveTo(x0,y0);
      ctx.lineTo(x0+Math.cos(angle)*len, y0+Math.sin(angle)*len);
      ctx.stroke();
      ctx.save(); ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(38,198,218,0.5)';
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(fx,fy); ctx.stroke();
      ctx.restore();
    }
  }

  function updateReadouts(){
    const {di,m} = compute();
    diEl.textContent = isFinite(di) ? Math.abs(di).toFixed(1)+' cm' : '∞';
    magEl.textContent = isFinite(m) ? m.toFixed(2)+'×' : '—';
    const real = di>0;
    typeEl.textContent = real ? 'Real' : 'Virtual';
    badge.textContent = (real?'Real, ':'Virtual, ') + (m<0?'inverted':'upright') + (Math.abs(m)>1?', magnified': Math.abs(m)<1?', diminished':'');
  }

  controlsHost.querySelectorAll('#lensSeg button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      controlsHost.querySelectorAll('#lensSeg button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); lensType=btn.dataset.l;
      draw(); updateReadouts();
    });
  });
  controlsHost.querySelector('#dSlide').addEventListener('input',(e)=>{
    doDist=parseFloat(e.target.value); controlsHost.querySelector('#dVal').textContent=doDist+' cm';
    draw(); updateReadouts();
  });
  controlsHost.querySelector('#fSlide').addEventListener('input',(e)=>{
    f=parseFloat(e.target.value); controlsHost.querySelector('#fVal').textContent=f+' cm';
    draw(); updateReadouts();
  });

  draw(); updateReadouts();
  return { unmount(){ if(raf) cancelAnimationFrame(raf); } };
}

window.Sims = window.Sims || {};
window.Sims.optics = {
  id:'optics', name:'Optics', category:'Optics', icon:'🔍', color:'#8E5CE0',
  desc:'Trace light rays through convex and concave lenses.',
  mount,
  theoryHTML:`
    <div class="info-card"><h4>Key idea</h4>
      <p>A lens bends (refracts) light rays. A convex lens converges rays to form real or virtual images; a concave lens spreads rays apart, always forming virtual, upright images.</p>
      <div class="formula">1/f = 1/dₒ + 1/dᵢ</div>
    </div>
    <div class="info-card"><h4>Reading the diagram</h4>
      <ul>
        <li>Green arrow — the object</li>
        <li>Cyan lines — light rays</li>
        <li>Blue arrow — the resulting image (dashed if virtual)</li>
      </ul>
    </div>`,
  instructionsHTML:`
    <div class="steps">
      <div class="step-item"><div class="step-num"></div><p>Pick convex or concave lens in Controls.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Move the object distance slider and watch where the image forms.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Bring the object inside the focal length (convex lens) to see a magnified virtual image.</p></div>
      <div class="step-item"><div class="step-num"></div><p>Switch to a concave lens and notice the image is always virtual and upright.</p></div>
    </div>`
};
})();
