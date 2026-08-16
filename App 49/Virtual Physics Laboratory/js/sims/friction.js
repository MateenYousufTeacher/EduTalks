(function(){
const ID='friction';
const SURFACES = {
  Wood:{s:0.5,k:0.4,color:'#C69C6D'},
  Ice:{s:0.10,k:0.05,color:'#CFEFFA'},
  Sand:{s:0.6,k:0.55,color:'#E9D8A6'},
  Concrete:{s:0.7,k:0.6,color:'#B7B7B7'},
  Rubber:{s:0.9,k:0.8,color:'#3A3A3A'}
};

function mount(root){
  let surface='Wood', mass=10, appliedF=40, mode='flat', angle=15, t=0, running=false, v=0, s=0, heat=0;
  let gF, gH, obs;

  VPL.buildTabs(root, [
    {id:'learn', label:'Learn', render: renderLearn},
    {id:'simulate', label:'Simulate', render: renderSim},
    {id:'data', label:'Data', render: renderData},
    {id:'quiz', label:'Quiz', render: renderQuiz},
  ], 'simulate');

  function renderLearn(p){
    p.innerHTML = `
    <div class="panel"><h3>${VPL.ICONS.book} Introduction</h3><p>Friction is the resistive force between two surfaces in contact. Try different surfaces, masses, and inclines to compare static and kinetic friction.</p></div>
    <div class="panel"><h3>${VPL.ICONS.grad} Learning Objectives</h3><ul><li>Differentiate static and kinetic friction.</li><li>Relate friction to the normal force and surface type.</li><li>Explore friction on an inclined plane.</li></ul></div>
    <div class="panel"><h3>${VPL.ICONS.sigma} Theory</h3><div class="formula-box">f = μN<br>N = mg (flat) or mg cosθ (incline)<br>Sliding begins when applied force &gt; μₛN</div></div>
    <div class="panel"><h3>Real-life Applications</h3><ul><li>Vehicle tyre grip and braking distances.</li><li>Ramp design in warehouses.</li><li>Ice skate blades minimizing friction.</li></ul></div>
    <div class="panel"><h3>Common Mistakes</h3><ul><li>Assuming friction always opposes applied force direction only, not motion direction.</li><li>Forgetting static friction can be less than its maximum value.</li></ul></div>
    <div class="panel"><h3>Interesting Fact</h3><p>Kinetic friction is usually slightly less than the maximum static friction — that's why it's often easier to keep something sliding than to start it moving.</p></div>`;
  }

  function renderSim(p){
    const opts = Object.keys(SURFACES).map(k=>`<option ${k===surface?'selected':''}>${k}</option>`).join('');
    p.innerHTML = `
    <div class="sim-layout">
      <div class="stage">
        <div class="toggle-row" id="modeRow">
          <button data-m="flat" class="active">Flat Surface</button>
          <button data-m="incline">Inclined Plane</button>
        </div>
        <canvas id="frCanvas" height="260" style="margin-top:10px;"></canvas>
        <div class="stage-toolbar">
          <button class="primary" id="frPlay">${VPL.ICONS.play} Play</button>
          <button id="frReset">${VPL.ICONS.reset} Reset</button>
          <button id="frRand">${VPL.ICONS.dice} Randomize</button>
          <button id="frShot">${VPL.ICONS.camera} Screenshot</button>
        </div>
      </div>
      <div class="controls panel">
        <h3>Variable Controls</h3>
        <label>Surface</label>
        <select id="surfSel">${opts}</select>
        <label>Mass <span class="val" id="mVal">${mass} kg</span></label>
        <input type="range" id="mSlide" min="1" max="50" value="${mass}">
        <label id="fLabel">Applied Force <span class="val" id="fVal">${appliedF} N</span></label>
        <input type="range" id="fSlide" min="0" max="300" value="${appliedF}">
        <label id="angleRow" style="display:none;">Incline Angle <span class="val" id="angVal">${angle}°</span></label>
        <input type="range" id="angSlide" style="display:none;" min="0" max="45" value="${angle}">
        <div class="readout-grid" id="readouts"></div>
        <div class="formula-box" id="formulaBox"></div>
      </div>
    </div>`;
    const canvas=p.querySelector('#frCanvas'), ctx=canvas.getContext('2d');
    p.querySelector('#surfSel').onchange=e=>{surface=e.target.value; updateReadouts(); draw();};
    p.querySelector('#mSlide').oninput=e=>{mass=+e.target.value; p.querySelector('#mVal').textContent=mass+' kg'; updateReadouts(); draw();};
    p.querySelector('#fSlide').oninput=e=>{appliedF=+e.target.value; p.querySelector('#fVal').textContent=appliedF+' N'; updateReadouts(); draw();};
    p.querySelector('#angSlide').oninput=e=>{angle=+e.target.value; p.querySelector('#angVal').textContent=angle+'°'; updateReadouts(); draw();};
    p.querySelector('#modeRow').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      p.querySelector('#modeRow').querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); mode=b.dataset.m;
      p.querySelector('#angleRow').style.display = mode==='incline'?'':'none';
      p.querySelector('#angSlide').style.display = mode==='incline'?'':'none';
      p.querySelector('#fLabel').style.display = mode==='incline'?'none':'';
      p.querySelector('#fSlide').style.display = mode==='incline'?'none':'';
      resetSim();
    });
    p.querySelector('#frPlay').onclick=(e)=>{running=!running; e.target.innerHTML=running?VPL.ICONS.pause+' Pause':VPL.ICONS.play+' Play'; if(running) loop();};
    p.querySelector('#frReset').onclick=()=>resetSim();
    p.querySelector('#frRand').onclick=()=>{
      const keys=Object.keys(SURFACES); surface=keys[Math.floor(Math.random()*keys.length)];
      mass=Math.round(Math.random()*49+1); appliedF=Math.round(Math.random()*300); angle=Math.round(Math.random()*45);
      p.querySelector('#surfSel').value=surface;
      p.querySelector('#mSlide').value=mass; p.querySelector('#mVal').textContent=mass+' kg';
      p.querySelector('#fSlide').value=appliedF; p.querySelector('#fVal').textContent=appliedF+' N';
      p.querySelector('#angSlide').value=angle; p.querySelector('#angVal').textContent=angle+'°';
      resetSim();
    };
    p.querySelector('#frShot').onclick=()=>VPL.screenshotCanvas(canvas,'friction-lab.png');

    function resetSim(){running=false;t=0;v=0;s=0;heat=0;p.querySelector('#frPlay').innerHTML=VPL.ICONS.play+' Play';if(gF)gF.reset();if(gH)gH.reset();if(obs)obs.clear();updateReadouts();draw();}
    function loop(){if(!running)return;step(0.05);draw();requestAnimationFrame(loop);}
    function calc(){
      const g=9.8, mu=SURFACES[surface];
      let N,net,moving,fFric;
      if(mode==='flat'){
        N = mass*g;
        const maxStatic = mu.s*N;
        moving = appliedF > maxStatic;
        fFric = moving? mu.k*N : Math.min(appliedF,maxStatic);
        net = moving? appliedF - fFric : 0;
      }else{
        const rad = angle*Math.PI/180;
        N = mass*g*Math.cos(rad);
        const gravityComp = mass*g*Math.sin(rad);
        const maxStatic = mu.s*N;
        moving = gravityComp > maxStatic;
        fFric = moving? mu.k*N : Math.min(gravityComp,maxStatic);
        net = moving? gravityComp - fFric : 0;
      }
      return {N,net,moving,fFric,mu};
    }
    function step(dt){
      t+=dt;
      const {net,fFric,moving}=calc();
      const acc=net/mass;
      if(moving){ v+=acc*dt; s+=v*dt; heat += fFric*Math.abs(v*dt); }
      if(gF){gF.push([t.toFixed(1), fFric]); gF.draw();}
      if(gH){gH.push([t.toFixed(1), heat]); gH.draw();}
      if(obs && Math.round(t*10)%5===0) obs.addRow([t.toFixed(1), fFric.toFixed(1), moving?'Yes':'No', v.toFixed(2), heat.toFixed(1)]);
      updateReadouts();
    }
    function updateReadouts(){
      const {N,net,moving,fFric,mu}=calc();
      p.querySelector('#readouts').innerHTML = `
        <div class="readout"><div class="lbl">Normal Force</div><div class="valn">${N.toFixed(1)} N</div></div>
        <div class="readout"><div class="lbl">Friction Force</div><div class="valn">${fFric.toFixed(1)} N</div></div>
        <div class="readout"><div class="lbl">Status</div><div class="valn">${moving?'Sliding':'Static'}</div></div>
        <div class="readout"><div class="lbl">Heat Generated</div><div class="valn">${heat.toFixed(1)} J</div></div>`;
      p.querySelector('#formulaBox').innerHTML = mode==='flat'
        ? `f = μN = ${moving?mu.k:mu.s} × ${N.toFixed(1)} = <span class="ans">${fFric.toFixed(1)} N</span> (${moving?'kinetic':'static'})`
        : `N = mg cosθ = ${N.toFixed(1)} N, mg sinθ = ${(mass*9.8*Math.sin(angle*Math.PI/180)).toFixed(1)} N<br>f = μN = <span class="ans">${fFric.toFixed(1)} N</span> (${moving?'sliding down':'holding static'})`;
    }
    function draw(){
      const dpr=window.devicePixelRatio||1, W=canvas.clientWidth, H=260;
      canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      const col = SURFACES[surface].color;
      if(mode==='flat'){
        const groundY=H*0.72;
        ctx.fillStyle=col; ctx.fillRect(20,groundY,W-40,10);
        const boxX = 50+Math.min(s*6,W-160);
        ctx.fillStyle='#1976D2'; ctx.fillRect(boxX,groundY-40,50,40);
        ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.textAlign='center'; ctx.fillText(mass+'kg', boxX+25, groundY-18);
      }else{
        const rad=angle*Math.PI/180;
        const baseX=40, baseY=H-30, length=W-100;
        ctx.strokeStyle=col; ctx.lineWidth=10; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(baseX,baseY); ctx.lineTo(baseX+length*Math.cos(rad), baseY-length*Math.sin(rad)); ctx.stroke();
        const travel = Math.min(s*4, length-30);
        const bx = baseX+travel*Math.cos(rad), by = baseY-travel*Math.sin(rad);
        ctx.save();
        ctx.translate(bx,by); ctx.rotate(-rad);
        ctx.fillStyle='#1976D2'; ctx.fillRect(0,-40,44,34);
        ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.textAlign='center'; ctx.fillText(mass+'kg',22,-20);
        ctx.restore();
      }
    }
    updateReadouts(); draw();
  }

  function renderData(p){
    p.innerHTML = `
    <div class="panel"><h3>Friction Force–Time Graph</h3><canvas id="gf" style="height:200px;width:100%;"></canvas></div>
    <div class="panel"><h3>Heat Generated–Time Graph</h3><canvas id="gh" style="height:200px;width:100%;"></canvas></div>
    <div class="panel"><h3>Observation Table <button class="stage-toolbar" id="expCsv" style="float:right;">${VPL.ICONS.download} Export</button></h3><div id="obsWrap"></div></div>`;
    gF = new VPL.Graph(p.querySelector('#gf'), {series:[{name:'friction (N)',color:'#D32F2F',data:[]}],xlabel:'time (s)',ylabel:'N'});
    gH = new VPL.Graph(p.querySelector('#gh'), {series:[{name:'heat (J)',color:'#FFB300',data:[]}],xlabel:'time (s)',ylabel:'J'});
    obs = new VPL.ObsTable(p.querySelector('#obsWrap'), ['Time (s)','Friction (N)','Moving?','Velocity (m/s)','Heat (J)']);
    gF.draw(); gH.draw();
    p.querySelector('#expCsv').onclick=()=>VPL.exportCSV('friction-lab.csv', obs.toCSV());
  }

  function renderQuiz(p){
    VPL.buildQuiz(p, ID, [
      {q:'Which surface pair typically has the LOWEST coefficient of friction?', options:['Rubber on concrete','Wood on wood','Ice on ice','Sandpaper on wood'], answer:2, explain:'Ice is extremely slippery, giving a very low coefficient of friction.'},
      {q:'Static friction is generally _____ kinetic friction for the same surfaces.', options:['less than','equal to','greater than or equal to','unrelated to'], answer:2, explain:'The maximum static friction is usually greater than or equal to kinetic friction.'},
      {q:'On an incline, the normal force equals:', options:['mg','mg sinθ','mg cosθ','mg tanθ'], answer:2, explain:'The component of weight perpendicular to the incline is mg cosθ.'},
      {q:'Friction force formula is:', options:['f = ma','f = μN','f = mg','f = Fnet'], answer:1, explain:'Friction is proportional to the normal force: f = μN.'},
      {q:'Increasing the mass of an object on a flat surface (with the same μ) will:', options:['Decrease friction','Not affect friction','Increase friction','Eliminate friction'], answer:2, explain:'Friction depends on normal force N=mg, so more mass means more friction.'},
    ]);
  }
}

SIM_REGISTRY.push({
  id: ID, num:3, title:'Friction Laboratory', category:'Dynamics',
  short:'Compare static & kinetic friction across five surfaces, flat or inclined.',
  gradient:'linear-gradient(135deg,#43A047,#26C6DA)',
  iconSVG:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><path d="M3 18h18M6 18l4-8h4l4 8"/></svg>`,
  mount
});
})();
