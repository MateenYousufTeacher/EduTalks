/* Crystal Architect — Build the Solid (Unit Cells & Lattice Geometry)
   Rendered with hand-rolled 3D projection on canvas (rotatable by drag). */
(function(){
  let api = null, els = {};
  let yaw = 0.6, pitch = -0.4;
  let dragging = false, lastX=0, lastY=0;
  let showCorners = true, showFaces = false, showBody = false;
  let target = 'sc';

  const CORNERS = [-1,1].flatMap(x=>[-1,1].flatMap(y=>[-1,1].map(z=>[x,y,z])));
  const FACES = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  const BODY = [[0,0,0]];
  const EDGES = [];
  CORNERS.forEach((c1,i) => CORNERS.forEach((c2,j) => {
    if (i>=j) return;
    const diff = c1.reduce((a,v,k)=>a+(v!==c2[k]?1:0),0);
    if (diff===1) EDGES.push([c1,c2]);
  }));

  const TARGETS = {
    sc: { name:'Simple Cubic (SC)', corners:true, faces:false, body:false, count:1 },
    bcc:{ name:'Body-Centered Cubic (BCC)', corners:true, faces:false, body:true, count:2 },
    fcc:{ name:'Face-Centered Cubic (FCC)', corners:true, faces:true, body:false, count:4 },
  };

  function project(p, w, h) {
    let [x,y,z] = p;
    // yaw around Y axis
    let x1 = x*Math.cos(yaw) + z*Math.sin(yaw);
    let z1 = -x*Math.sin(yaw) + z*Math.cos(yaw);
    // pitch around X axis
    let y2 = y*Math.cos(pitch) - z1*Math.sin(pitch);
    let z2 = y*Math.sin(pitch) + z1*Math.cos(pitch);
    const f = 4.2; // perspective distance
    const scale = f/(f+z2);
    const scr_x = w/2 + x1*70*scale;
    const scr_y = h/2 - y2*70*scale;
    return { x:scr_x, y:scr_y, depth:z2, scale };
  }

  function mount(container, apiRef) {
    api = apiRef;
    container.innerHTML = `
      <div class="viz-stage" id="cryStage" style="min-height:280px;">
        <canvas id="cryCanvas" width="320" height="280" style="width:100%;max-width:320px;height:280px;touch-action:none;cursor:grab;"></canvas>
      </div>
      <p class="muted text-center" style="font-size:.76rem;margin-top:-6px;">Drag to rotate the unit cell</p>
      <div class="control-panel">
        <h3>Place particles</h3>
        <div class="control-row toggle-row"><label style="margin:0;">Corner atoms (8)</label>
          <label class="switch"><input type="checkbox" id="cryCorners" checked><span class="slider-toggle"></span></label></div>
        <div class="control-row toggle-row"><label style="margin:0;">Face-center atoms (6)</label>
          <label class="switch"><input type="checkbox" id="cryFaces"><span class="slider-toggle"></span></label></div>
        <div class="control-row toggle-row"><label style="margin:0;">Body-center atom (1)</label>
          <label class="switch"><input type="checkbox" id="cryBody"><span class="slider-toggle"></span></label></div>
      </div>
      <div class="readout-grid">
        <div class="readout"><div class="rv" id="cryContribCorner">1.00</div><div class="rl">From corners (×1/8)</div></div>
        <div class="readout"><div class="rv" id="cryContribFace">0.00</div><div class="rl">From faces (×1/2)</div></div>
        <div class="readout"><div class="rv" id="cryContribBody">0.00</div><div class="rl">From body (×1)</div></div>
        <div class="readout"><div class="rv" id="cryTotal">1.00</div><div class="rl">Atoms / unit cell</div></div>
      </div>
      <div class="control-panel">
        <h3>Challenge — build this structure</h3>
        <div class="pill-select" id="cryTargetPicker">
          ${Object.entries(TARGETS).map(([id,t])=>`<button data-id="${id}">${t.name}</button>`).join('')}
        </div>
        <p id="cryChallengeText" style="font-size:.85rem;margin-top:10px;"></p>
        <button class="btn btn-primary btn-block" id="cryCheck">Check my structure</button>
        <div id="cryFeedback"></div>
      </div>
    `;
    els = {
      canvas: container.querySelector('#cryCanvas'),
      corners: container.querySelector('#cryCorners'), faces: container.querySelector('#cryFaces'), body: container.querySelector('#cryBody'),
      contribCorner: container.querySelector('#cryContribCorner'), contribFace: container.querySelector('#cryContribFace'), contribBody: container.querySelector('#cryContribBody'), total: container.querySelector('#cryTotal'),
      targetPicker: container.querySelector('#cryTargetPicker'),
      challengeText: container.querySelector('#cryChallengeText'),
      check: container.querySelector('#cryCheck'),
      feedback: container.querySelector('#cryFeedback'),
    };
    els.corners.onchange = () => { showCorners = els.corners.checked; updateReadouts(); draw(); };
    els.faces.onchange = () => { showFaces = els.faces.checked; updateReadouts(); draw(); };
    els.body.onchange = () => { showBody = els.body.checked; updateReadouts(); draw(); };
    setupDrag();
    els.targetPicker.addEventListener('click',(e)=>{
      const b = e.target.closest('button'); if(!b) return;
      els.targetPicker.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); target = b.dataset.id;
      els.challengeText.textContent = `Toggle the switches above so the unit cell matches ${TARGETS[target].name}, then check.`;
    });
    els.targetPicker.querySelector('button').classList.add('active');
    els.challengeText.textContent = `Toggle the switches above so the unit cell matches ${TARGETS[target].name}, then check.`;
    els.check.onclick = checkStructure;
    updateReadouts();
    draw();
  }

  function setupDrag() {
    const c = els.canvas;
    const start = (x,y) => { dragging=true; lastX=x; lastY=y; c.style.cursor='grabbing'; };
    const move = (x,y) => { if(!dragging) return; yaw += (x-lastX)*0.01; pitch += (y-lastY)*0.01; pitch=Math.max(-1.4,Math.min(1.4,pitch)); lastX=x; lastY=y; draw(); };
    const end = () => { dragging=false; c.style.cursor='grab'; };
    c.addEventListener('pointerdown', e => { c.setPointerCapture(e.pointerId); start(e.clientX,e.clientY); });
    c.addEventListener('pointermove', e => move(e.clientX,e.clientY));
    c.addEventListener('pointerup', end);
    c.addEventListener('pointerleave', end);
  }

  function updateReadouts() {
    const cc = showCorners ? 8*(1/8) : 0;
    const cf = showFaces ? 6*(1/2) : 0;
    const cb = showBody ? 1*1 : 0;
    els.contribCorner.textContent = cc.toFixed(2);
    els.contribFace.textContent = cf.toFixed(2);
    els.contribBody.textContent = cb.toFixed(2);
    els.total.textContent = (cc+cf+cb).toFixed(2);
  }

  function draw() {
    const c = els.canvas; const ctx = c.getContext('2d');
    const w=c.width,h=c.height; ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.4;
    EDGES.forEach(([a,b]) => {
      const pa = project(a,w,h), pb = project(b,w,h);
      ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
    });
    let atoms = [];
    if (showCorners) CORNERS.forEach(p=>atoms.push({p,color:'#FFB300',r:8}));
    if (showFaces) FACES.forEach(p=>atoms.push({p,color:'#26C6DA',r:9}));
    if (showBody) BODY.forEach(p=>atoms.push({p,color:'#E53935',r:10}));
    atoms = atoms.map(a=>({...a, proj: project(a.p,w,h)})).sort((a,b)=>a.proj.depth-b.proj.depth);
    atoms.forEach(a => {
      const {x,y,scale} = a.proj;
      ctx.beginPath();
      ctx.fillStyle = a.color;
      ctx.arc(x,y,a.r*scale,0,7);
      ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.stroke();
    });
  }

  function checkStructure() {
    const t = TARGETS[target];
    const ok = (showCorners===t.corners) && (showFaces===t.faces) && (showBody===t.body);
    if (ok) {
      els.feedback.innerHTML = `<div class="feedback-box correct"><h4>✓ Correct — that's ${t.name}!</h4>This unit cell contains ${t.count} atom${t.count>1?'s':''} per unit cell. Corner atoms are shared between 8 cells (contributing 1/8 each), face atoms are shared between 2 cells (1/2 each), and a body atom belongs entirely to one cell.</div>`;
      api.addXP(35, 'Crystal structure built'); api.recordCompletion('crystal', 100);
    } else {
      els.feedback.innerHTML = `<div class="feedback-box incorrect"><h4>Not quite ${t.name}</h4>${t.name} needs: corners ${t.corners?'ON':'OFF'}, faces ${t.faces?'ON':'OFF'}, body ${t.body?'ON':'OFF'}.</div>`;
      api.addXP(6, 'attempt recorded');
    }
  }

  function unmount() {}
  window.SIMULATIONS = window.SIMULATIONS || {};
  window.SIMULATIONS.crystal = { mount, unmount };
})();
