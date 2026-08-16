(function(){
const ID='motion';

function mount(root){
  let u=5, a=1, mass=2, t=0, running=false, mode='student', challengeTarget=null, raf;
  const trail=[];
  const TRACK_M = 25; // half-length in meters shown each side => total 50m view... we'll use +-25
  let stage, canvas, ctx, gVT, gST, obs, readouts, modeRow;

  VPL.buildTabs(root, [
    {id:'learn', label:'Learn', render: renderLearn},
    {id:'simulate', label:'Simulate', render: renderSim},
    {id:'data', label:'Data', render: renderData},
    {id:'quiz', label:'Quiz', render: renderQuiz},
  ], 'simulate');
  function renderLearn(p){
    p.innerHTML = `
    <div class="panel"><h3>${VPL.ICONS.book} Introduction</h3>
      <p>The Motion Simulator lets you launch an object along a straight track with a chosen initial velocity and acceleration, and watch exactly how its position and velocity evolve with time.</p></div>
    <div class="panel"><h3>${VPL.ICONS.grad} Learning Objectives</h3>
      <ul><li>Distinguish between distance, displacement, velocity and acceleration.</li>
      <li>Predict motion outcomes using the equations of motion.</li>
      <li>Interpret velocity-time and distance-time graphs.</li></ul></div>
    <div class="panel"><h3>${VPL.ICONS.sigma} Theory</h3>
      <p>For constant acceleration, three key equations govern motion:</p>
      <div class="formula-box">v = u + at<br>s = ut + <span class="sub">½</span>at²<br>v² = u² + 2as</div>
      <p>Here <b>u</b> is initial velocity, <b>v</b> is final velocity, <b>a</b> is acceleration, <b>t</b> is time elapsed, and <b>s</b> is displacement.</p></div>
    <div class="panel"><h3>Real-life Applications</h3>
      <ul><li>Calculating stopping distances for vehicles.</li><li>Designing elevators and roller coasters.</li><li>Predicting projectile landing points (in 1D components).</li></ul></div>
    <div class="panel"><h3>Common Mistakes</h3>
      <ul><li>Confusing speed (scalar) with velocity (vector).</li><li>Forgetting the ½ in the s = ut + ½at² equation.</li><li>Mixing up sign conventions when acceleration opposes velocity.</li></ul></div>
    <div class="panel"><h3>Interesting Fact</h3><p>A cheetah can accelerate from 0 to 100 km/h in about 3 seconds — faster than most sports cars!</p></div>`;
  }

  function renderSim(p){
    p.innerHTML = `
    <div class="sim-layout">
      <div class="stage" id="stageBox">
        <canvas id="mCanvas" height="260"></canvas>
        <div class="stage-toolbar">
          <button class="primary" id="mPlay">${VPL.ICONS.play} Play</button>
          <button id="mStep">${VPL.ICONS.step} Step</button>
          <button id="mReset">${VPL.ICONS.reset} Reset</button>
          <button id="mRand">${VPL.ICONS.dice} Randomize</button>
          <button id="mShot">${VPL.ICONS.camera} Screenshot</button>
        </div>
        <div class="toggle-row" id="modeRow">
          <button data-m="student" class="active">Student</button>
          <button data-m="teacher">Teacher</button>
          <button data-m="challenge">Challenge</button>
        </div>
        <div id="challengeBox"></div>
      </div>
      <div class="controls panel">
        <h3>Variable Controls</h3>
        <label>Initial Velocity (u) <span class="val" id="uVal">${u} m/s</span></label>
        <input type="range" id="uSlide" min="-15" max="15" step="0.5" value="${u}">
        <label>Acceleration (a) <span class="val" id="aVal">${a} m/s²</span></label>
        <input type="range" id="aSlide" min="-5" max="5" step="0.2" value="${a}">
        <label>Mass <span class="val" id="massVal">${mass} kg</span></label>
        <input type="range" id="massSlide" min="0.5" max="20" step="0.5" value="${mass}">
        <div class="readout-grid" id="readouts"></div>
        <div class="formula-box" id="formulaBox"></div>
      </div>
    </div>`;
    canvas = p.querySelector('#mCanvas'); ctx = canvas.getContext('2d');
    readouts = p.querySelector('#readouts');
    modeRow = p.querySelector('#modeRow');

    p.querySelector('#uSlide').oninput = e=>{u=+e.target.value; p.querySelector('#uVal').textContent=u+' m/s'; drawFrame();};
    p.querySelector('#aSlide').oninput = e=>{a=+e.target.value; p.querySelector('#aVal').textContent=a+' m/s²'; drawFrame();};
    p.querySelector('#massSlide').oninput = e=>{mass=+e.target.value; p.querySelector('#massVal').textContent=mass+' kg'; updateReadouts();};

    p.querySelector('#mPlay').onclick = (e)=>{
      running = !running;
      e.target.innerHTML = running? VPL.ICONS.pause+' Pause': VPL.ICONS.play+' Play';
      VPL.beep(running?600:400,.08);
      if(running) loop();
    };
    p.querySelector('#mStep').onclick = ()=>{ stepTime(0.2); drawFrame(); };
    p.querySelector('#mReset').onclick = ()=>resetSim();
    p.querySelector('#mRand').onclick = ()=>{
      u = Math.round((Math.random()*30-15)*2)/2;
      a = Math.round((Math.random()*10-5)*2)/2;
      p.querySelector('#uSlide').value=u; p.querySelector('#uVal').textContent=u+' m/s';
      p.querySelector('#aSlide').value=a; p.querySelector('#aVal').textContent=a+' m/s²';
      resetSim();
      VPL.beep(500,.1,'square',.05);
    };
    p.querySelector('#mShot').onclick = ()=>VPL.screenshotCanvas(canvas,'motion-simulator.png');
    modeRow.querySelectorAll('button').forEach(b=>b.onclick=()=>{
      modeRow.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); mode=b.dataset.m;
      renderChallengeBox(p);
    });
    renderChallengeBox(p);
    updateReadouts();
    drawFrame();
  }

  function renderChallengeBox(p){
    const box = p.querySelector('#challengeBox');
    if(mode!=='challenge'){ box.innerHTML=''; return; }
    if(challengeTarget===null) challengeTarget = Math.round((Math.random()*20-5)*10)/10;
    box.innerHTML = `<div class="panel" style="margin-top:12px;background:var(--light-blue);">
      <b>🎯 Challenge:</b> Adjust u and a so the object's displacement at t = 5s equals <b>${challengeTarget} m</b>. Then press Play and check!
      <div id="challengeResult" style="margin-top:6px;font-weight:700;"></div></div>`;
  }

  function kinematics(time){
    const s = u*time + 0.5*a*time*time;
    const v = u + a*time;
    return {s,v};
  }

  function resetSim(){
    running=false; t=0; trail.length=0;
    challengeTarget=null;
    root.querySelector('#mPlay') && (root.querySelector('#mPlay').innerHTML = VPL.ICONS.play+' Play');
    if(gVT) gVT.reset(); if(gST) gST.reset(); if(obs) obs.clear();
    updateReadouts(); drawFrame();
  }

  function stepTime(dt){
    t += dt;
    const {s,v} = kinematics(t);
    trail.push(s);
    if(trail.length>400) trail.shift();
    if(gVT){ gVT.push([t.toFixed(1), v]); gVT.draw(); }
    if(gST){ gST.push([t.toFixed(1), s]); gST.draw(); }
    if(obs && Math.round(t*10)%5===0){
      obs.addRow([t.toFixed(1), s.toFixed(2), v.toFixed(2)]);
    }
    updateReadouts();
    if(Math.abs(s) > TRACK_M+2){ running=false; root.querySelector('#mPlay').innerHTML=VPL.ICONS.play+' Play'; VPL.markProgress(ID,60);}
  }

  function loop(){
    if(!running) return;
    stepTime(0.05);
    drawFrame();
    raf = requestAnimationFrame(loop);
  }

  function updateReadouts(){
    if(!readouts) return;
    const {s,v} = kinematics(t);
    const F = mass*a;
    readouts.innerHTML = `
      <div class="readout"><div class="lbl">Time</div><div class="valn">${t.toFixed(1)} s</div></div>
      <div class="readout"><div class="lbl">Displacement</div><div class="valn">${s.toFixed(2)} m</div></div>
      <div class="readout"><div class="lbl">Velocity</div><div class="valn">${v.toFixed(2)} m/s</div></div>
      <div class="readout"><div class="lbl">Force (F=ma)</div><div class="valn">${F.toFixed(1)} N</div></div>`;
    const fb = root.querySelector('#formulaBox');
    if(fb){
      fb.innerHTML = mode==='student'
        ? `v = u + at = ${u} + (${a})(${t.toFixed(1)}) = <span class="ans">${v.toFixed(2)} m/s</span>`
        : `s = ut + ½at² = (${u})(${t.toFixed(1)}) + ½(${a})(${t.toFixed(1)})² = <span class="ans">${s.toFixed(2)} m</span><br>F = ma = (${mass})(${a}) = <span class="ans">${F.toFixed(1)} N</span>`;
    }
    if(mode==='challenge' && !running && t>4.9 && t<5.3){
      const cr = root.querySelector('#challengeResult');
      if(cr){
        const diff = Math.abs(s-challengeTarget);
        cr.textContent = diff<0.5 ? `✅ Great! s = ${s.toFixed(2)} m — within target range!` : `Target ${challengeTarget} m, you got ${s.toFixed(2)} m. Try adjusting u/a.`;
        if(diff<0.5) VPL.addXP(20);
      }
    }
  }

  function drawFrame(){
    if(!ctx) return;
    const w = canvas.width = canvas.clientWidth * (window.devicePixelRatio||1);
    const h = canvas.height = 260 * (window.devicePixelRatio||1);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(window.devicePixelRatio||1,1);
    const W = canvas.clientWidth, H=260;
    ctx.clearRect(0,0,W,H);
    const groundY = H*0.62;
    const pxPerM = (W-60)/(2*TRACK_M);
    const originX = W/2;
    // track
    ctx.strokeStyle='#B9D4F0'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(30,groundY); ctx.lineTo(W-30,groundY); ctx.stroke();
    // ticks
    ctx.fillStyle='#5B6472'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    for(let m=-Math.floor(TRACK_M);m<=TRACK_M;m+=5){
      const x = originX+m*pxPerM;
      ctx.beginPath(); ctx.moveTo(x,groundY-4); ctx.lineTo(x,groundY+4); ctx.strokeStyle='#B9D4F0'; ctx.stroke();
      ctx.fillText(m+'m', x, groundY+18);
    }
    const {s,v} = kinematics(t);
    const objX = originX + Math.max(-TRACK_M-2,Math.min(TRACK_M+2,s))*pxPerM;
    // trail
    ctx.strokeStyle='rgba(25,118,210,.35)'; ctx.lineWidth=2; ctx.beginPath();
    trail.forEach((sv,i)=>{
      const x = originX+Math.max(-TRACK_M-2,Math.min(TRACK_M+2,sv))*pxPerM;
      i===0? ctx.moveTo(x,groundY-16): ctx.lineTo(x,groundY-16);
    });
    ctx.stroke();
    // ball
    const grad = ctx.createRadialGradient(objX-6,groundY-22,2,objX,groundY-16,16);
    grad.addColorStop(0,'#5FD3EA'); grad.addColorStop(1,'#0D47A1');
    ctx.fillStyle=grad;
    ctx.beginPath(); ctx.arc(objX,groundY-16,14,0,Math.PI*2); ctx.fill();
    // velocity vector (blue arrow)
    drawArrow(ctx, objX, groundY-16, objX+Math.max(-60,Math.min(60,v*4)), groundY-16, '#1976D2');
    // acceleration vector (amber arrow), offset above
    drawArrow(ctx, objX, groundY-40, objX+Math.max(-60,Math.min(60,a*10)), groundY-40, '#FFB300');
    ctx.fillStyle='#1976D2'; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('v', objX+Math.max(-60,Math.min(60,v*4))+4, groundY-16);
    ctx.fillStyle='#FFB300';
    ctx.fillText('a', objX+Math.max(-60,Math.min(60,a*10))+4, groundY-40);
  }
  function drawArrow(ctx,x1,y1,x2,y2,color){
    if(Math.abs(x2-x1)<2) return;
    ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    const angle = Math.atan2(y2-y1,x2-x1);
    ctx.beginPath();
    ctx.moveTo(x2,y2);
    ctx.lineTo(x2-8*Math.cos(angle-0.4), y2-8*Math.sin(angle-0.4));
    ctx.lineTo(x2-8*Math.cos(angle+0.4), y2-8*Math.sin(angle+0.4));
    ctx.closePath(); ctx.fill();
  }

  function renderData(p){
    p.innerHTML = `
    <div class="panel"><h3>Velocity–Time Graph</h3><canvas id="gvt" style="height:200px;width:100%;"></canvas></div>
    <div class="panel"><h3>Distance–Time Graph</h3><canvas id="gst" style="height:200px;width:100%;"></canvas></div>
    <div class="panel"><h3>Observation Table <button class="stage-toolbar" id="expCsv" style="float:right;">${VPL.ICONS.download} Export CSV</button></h3>
      <div id="obsWrap"></div></div>`;
    gVT = new VPL.Graph(p.querySelector('#gvt'), {series:[{name:'velocity (m/s)',color:'#1976D2',data:[]}], xlabel:'time (s)', ylabel:'v (m/s)'});
    gST = new VPL.Graph(p.querySelector('#gst'), {series:[{name:'displacement (m)',color:'#43A047',data:[]}], xlabel:'time (s)', ylabel:'s (m)'});
    obs = new VPL.ObsTable(p.querySelector('#obsWrap'), ['Time (s)','Displacement (m)','Velocity (m/s)']);
    gVT.draw(); gST.draw();
    p.querySelector('#expCsv').onclick = ()=>VPL.exportCSV('motion-observations.csv', obs.toCSV());
  }

  function renderQuiz(p){
    VPL.buildQuiz(p, ID, [
      {q:'Which equation correctly relates final velocity, initial velocity, and acceleration?', options:['v = u + at','s = ut + ½at²','v² = u² + 2as','F = ma'], answer:0, explain:'v = u + at is the first equation of motion for constant acceleration.'},
      {q:'If a car starts from rest (u=0) and accelerates at 2 m/s² for 4s, what is its final velocity?', options:['2 m/s','4 m/s','8 m/s','16 m/s'], answer:2, explain:'v = 0 + 2×4 = 8 m/s.'},
      {q:'Displacement is a ______ quantity, while distance is a ______ quantity.', options:['scalar, scalar','vector, scalar','scalar, vector','vector, vector'], answer:1, explain:'Displacement has direction (vector); distance is just magnitude (scalar).'},
      {q:'On a velocity-time graph, the slope of the line represents:', options:['Displacement','Speed','Acceleration','Force'], answer:2, explain:'Slope = change in velocity / change in time = acceleration.'},
      {q:'If acceleration is negative while velocity is positive, the object is:', options:['Speeding up','Slowing down','Moving backward only','Stationary'], answer:1, explain:'Opposite signs of velocity and acceleration mean deceleration.'},
    ]);
  }

}

SIM_REGISTRY.push({
  id: ID, num:1, title:'Motion Simulator', category:'Kinematics',
  short:'Launch objects and explore velocity, acceleration, and motion graphs in real time.',
  gradient:'linear-gradient(135deg,#1976D2,#26C6DA)',
  iconSVG:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="18" r="2.4"/><path d="M8.4 16.4 18 6M13 6h5v5"/></svg>`,
  mount
});
})();
