(function(){
const ID='newton';

function mount(root){
  let F=20, mass=5, mu=0.2, law='second', t=0, running=false, v=0, s=0;
  let gFT, gVT, obs, raf;

  VPL.buildTabs(root, [
    {id:'learn', label:'Learn', render: renderLearn},
    {id:'simulate', label:'Simulate', render: renderSim},
    {id:'data', label:'Data', render: renderData},
    {id:'quiz', label:'Quiz', render: renderQuiz},
  ], 'simulate');

  function renderLearn(p){
    p.innerHTML = `
    <div class="panel"><h3>${VPL.ICONS.book} Introduction</h3><p>Newton's three laws of motion explain how and why objects move the way they do. Push the crate, add friction, and watch each law come alive.</p></div>
    <div class="panel"><h3>${VPL.ICONS.grad} Learning Objectives</h3>
      <ul><li>State and apply Newton's First, Second, and Third Laws.</li>
      <li>Calculate net force and resulting acceleration.</li>
      <li>Draw and interpret free-body diagrams.</li></ul></div>
    <div class="panel"><h3>${VPL.ICONS.sigma} Theory</h3>
      <div class="formula-box">First Law: An object stays at rest or in uniform motion unless acted upon by a net external force.<br>Second Law: F_net = ma<br>Third Law: For every action, there is an equal and opposite reaction.</div></div>
    <div class="panel"><h3>Real-life Applications</h3><ul><li>Seatbelts (First Law — inertia).</li><li>Rocket propulsion (Third Law).</li><li>Towing vehicles (Second Law).</li></ul></div>
    <div class="panel"><h3>Common Mistakes</h3><ul><li>Thinking a stationary object has "no forces" — it may have balanced forces.</li><li>Confusing action-reaction pairs as acting on the same object (they act on different objects).</li></ul></div>
    <div class="panel"><h3>Interesting Fact</h3><p>Action-reaction pairs are always equal in magnitude — that's why walking works: you push the ground back, and it pushes you forward!</p></div>`;
  }

  function renderSim(p){
    p.innerHTML = `
    <div class="sim-layout">
      <div class="stage">
        <div class="toggle-row" id="lawRow">
          <button data-l="first">First Law</button>
          <button data-l="second" class="active">Second Law</button>
          <button data-l="third">Third Law</button>
        </div>
        <canvas id="nCanvas" height="260" style="margin-top:10px;"></canvas>
        <div class="stage-toolbar">
          <button class="primary" id="nPlay">${VPL.ICONS.play} Play</button>
          <button id="nReset">${VPL.ICONS.reset} Reset</button>
          <button id="nRand">${VPL.ICONS.dice} Randomize</button>
          <button id="nShot">${VPL.ICONS.camera} Screenshot</button>
        </div>
      </div>
      <div class="controls panel">
        <h3>Variable Controls</h3>
        <label>Applied Force (F) <span class="val" id="fVal">${F} N</span></label>
        <input type="range" id="fSlide" min="0" max="100" step="1" value="${F}">
        <label>Mass <span class="val" id="massVal">${mass} kg</span></label>
        <input type="range" id="massSlide" min="1" max="50" step="1" value="${mass}">
        <label>Friction Coefficient (μ) <span class="val" id="muVal">${mu}</span></label>
        <input type="range" id="muSlide" min="0" max="1" step="0.05" value="${mu}">
        <div class="readout-grid" id="readouts"></div>
        <div class="formula-box" id="formulaBox"></div>
      </div>
    </div>`;
    const canvas = p.querySelector('#nCanvas'), ctx = canvas.getContext('2d');
    p.querySelector('#lawRow').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      p.querySelector('#lawRow').querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); law=b.dataset.l; resetSim(); draw(ctx,canvas);
    });
    p.querySelector('#fSlide').oninput=e=>{F=+e.target.value; p.querySelector('#fVal').textContent=F+' N'; updateReadouts(); draw(ctx,canvas);};
    p.querySelector('#massSlide').oninput=e=>{mass=+e.target.value; p.querySelector('#massVal').textContent=mass+' kg'; updateReadouts(); draw(ctx,canvas);};
    p.querySelector('#muSlide').oninput=e=>{mu=+e.target.value; p.querySelector('#muVal').textContent=mu; updateReadouts(); draw(ctx,canvas);};
    p.querySelector('#nPlay').onclick=(e)=>{
      running=!running; e.target.innerHTML=running?VPL.ICONS.pause+' Pause':VPL.ICONS.play+' Play';
      if(running) loop(ctx,canvas);
    };
    p.querySelector('#nReset').onclick=()=>resetSim();
    p.querySelector('#nRand').onclick=()=>{
      F=Math.round(Math.random()*100); mass=Math.round(Math.random()*49+1); mu=Math.round(Math.random()*20)/20;
      p.querySelector('#fSlide').value=F; p.querySelector('#fVal').textContent=F+' N';
      p.querySelector('#massSlide').value=mass; p.querySelector('#massVal').textContent=mass+' kg';
      p.querySelector('#muSlide').value=mu; p.querySelector('#muVal').textContent=mu;
      resetSim();
    };
    p.querySelector('#nShot').onclick=()=>VPL.screenshotCanvas(canvas,'newtons-laws.png');
    updateReadouts(); draw(ctx,canvas);

    function resetSim(){ running=false; t=0; v=0; s=0; p.querySelector('#nPlay').innerHTML=VPL.ICONS.play+' Play'; if(gFT)gFT.reset(); if(gVT)gVT.reset(); if(obs)obs.clear(); updateReadouts(); draw(ctx,canvas);}
    function loop(){ if(!running) return; step(0.05); draw(ctx,canvas); raf=requestAnimationFrame(()=>loop()); }
    function step(dt){
      t+=dt;
      const g=9.8, weight=mass*g, friction=mu*weight;
      const appliedF = law==='first'? 0 : F;
      let net = appliedF - friction;
      if(law==='first') net = 0;
      if(Math.abs(v)<0.01 && Math.abs(net) < friction && law!=='first') net=0;
      const acc = net/mass;
      v += acc*dt; if(v<0) v=0;
      s += v*dt;
      if(gFT){gFT.push([t.toFixed(1), net]); gFT.draw();}
      if(gVT){gVT.push([t.toFixed(1), v]); gVT.draw();}
      if(obs && Math.round(t*10)%5===0) obs.addRow([t.toFixed(1), net.toFixed(1), acc.toFixed(2), v.toFixed(2)]);
      updateReadouts();
    }
    function updateReadouts(){
      const g=9.8, weight=mass*g, friction=mu*weight;
      const appliedF = law==='first'? 0 : F;
      const net = law==='first'? 0 : appliedF-friction;
      const acc = net/mass;
      const ro = p.querySelector('#readouts');
      ro.innerHTML = `
        <div class="readout"><div class="lbl">Weight</div><div class="valn">${weight.toFixed(1)} N</div></div>
        <div class="readout"><div class="lbl">Friction</div><div class="valn">${friction.toFixed(1)} N</div></div>
        <div class="readout"><div class="lbl">Net Force</div><div class="valn">${net.toFixed(1)} N</div></div>
        <div class="readout"><div class="lbl">Acceleration</div><div class="valn">${acc.toFixed(2)} m/s²</div></div>`;
      p.querySelector('#formulaBox').innerHTML =
        law==='third'
        ? `Action = ${F} N (block A → B)<br>Reaction = <span class="ans">${F} N</span> (block B → A, opposite direction)`
        : `F_net = F_applied − F_friction = ${appliedF} − ${friction.toFixed(1)} = ${net.toFixed(1)} N<br>a = F_net / m = ${net.toFixed(1)} / ${mass} = <span class="ans">${acc.toFixed(2)} m/s²</span>`;
    }
    function draw(ctx,canvas){
      const dpr=window.devicePixelRatio||1;
      const W=canvas.clientWidth,H=260;
      canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      const groundY=H*0.72;
      ctx.strokeStyle='#B9D4F0'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(20,groundY); ctx.lineTo(W-20,groundY); ctx.stroke();
      if(law==='third'){
        const cx=W/2;
        drawBox(ctx,cx-70,groundY-40,60,40,'#1976D2','A');
        drawBox(ctx,cx+10,groundY-40,60,40,'#26C6DA','B');
        drawArrowN(ctx,cx-10,groundY-20,cx+10,groundY-20,'#FFB300');
        drawArrowN(ctx,cx+10,groundY-8,cx-10,groundY-8,'#D32F2F');
        ctx.fillStyle='#5B6472'; ctx.font='11px sans-serif'; ctx.textAlign='center';
        ctx.fillText('Action', cx, groundY-30);
        ctx.fillText('Reaction', cx, groundY+2);
        return;
      }
      const boxX = 60+Math.min(s*8, W-160);
      drawBox(ctx, boxX, groundY-40, 60, 40, '#1976D2', mass.toFixed(0)+'kg');
      // weight down
      drawArrowN(ctx, boxX+30, groundY-40, boxX+30, groundY-8, '#5B6472');
      ctx.fillStyle='#5B6472'; ctx.font='10px sans-serif'; ctx.fillText('W', boxX+38, groundY-15);
      // normal up
      drawArrowN(ctx, boxX+30, groundY, boxX+30, groundY-36, '#43A047');
      ctx.fillStyle='#43A047'; ctx.fillText('N', boxX+38, groundY-40);
      if(law!=='first'){
        // applied force
        drawArrowN(ctx, boxX-30, groundY-20, boxX-2, groundY-20, '#FFB300');
        ctx.fillStyle='#FFB300'; ctx.fillText('F', boxX-38, groundY-14);
        // friction opposing
        drawArrowN(ctx, boxX+62, groundY-20, boxX+92, groundY-20, '#D32F2F');
        ctx.fillStyle='#D32F2F'; ctx.fillText('f', boxX+96, groundY-14);
      }
    }
    function drawBox(ctx,x,y,w,h,color,label){
      ctx.fillStyle=color; ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x,y,w,h,6) : ctx.rect(x,y,w,h);
      ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='11px sans-serif'; ctx.textAlign='center';
      ctx.fillText(label, x+w/2, y+h/2+4);
    }
    function drawArrowN(ctx,x1,y1,x2,y2,color){
      if(Math.hypot(x2-x1,y2-y1)<4) return;
      ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      const angle=Math.atan2(y2-y1,x2-x1);
      ctx.beginPath(); ctx.moveTo(x2,y2);
      ctx.lineTo(x2-8*Math.cos(angle-0.4), y2-8*Math.sin(angle-0.4));
      ctx.lineTo(x2-8*Math.cos(angle+0.4), y2-8*Math.sin(angle+0.4));
      ctx.closePath(); ctx.fill();
    }
  }

  function renderData(p){
    p.innerHTML = `
    <div class="panel"><h3>Net Force–Time Graph</h3><canvas id="gft" style="height:200px;width:100%;"></canvas></div>
    <div class="panel"><h3>Velocity–Time Graph</h3><canvas id="gvt2" style="height:200px;width:100%;"></canvas></div>
    <div class="panel"><h3>Observation Table <button class="stage-toolbar" id="expCsv" style="float:right;">${VPL.ICONS.download} Export</button></h3><div id="obsWrap"></div></div>`;
    gFT = new VPL.Graph(p.querySelector('#gft'), {series:[{name:'F_net (N)',color:'#FFB300',data:[]}],xlabel:'time (s)',ylabel:'N'});
    gVT = new VPL.Graph(p.querySelector('#gvt2'), {series:[{name:'velocity (m/s)',color:'#1976D2',data:[]}],xlabel:'time (s)',ylabel:'m/s'});
    obs = new VPL.ObsTable(p.querySelector('#obsWrap'), ['Time (s)','Net Force (N)','Acceleration (m/s²)','Velocity (m/s)']);
    gFT.draw(); gVT.draw();
    p.querySelector('#expCsv').onclick=()=>VPL.exportCSV('newtons-laws.csv', obs.toCSV());
  }

  function renderQuiz(p){
    VPL.buildQuiz(p, ID, [
      {q:"Newton's First Law is also known as the law of:", options:['Gravitation','Inertia','Momentum','Action-Reaction'], answer:1, explain:'Objects resist changes to their state of motion — this property is called inertia.'},
      {q:'A 10 kg box experiences a net force of 20 N. What is its acceleration?', options:['0.5 m/s²','2 m/s²','20 m/s²','200 m/s²'], answer:1, explain:'a = F/m = 20/10 = 2 m/s².'},
      {q:'Action-reaction force pairs act on:', options:['The same object','Different objects','No object','Only massless objects'], answer:1, explain:"Newton's Third Law pairs always act on two different objects."},
      {q:'If applied force exactly equals friction force, the object:', options:['Accelerates forward','Accelerates backward','Moves at constant velocity','Instantly stops'], answer:2, explain:'Zero net force means zero acceleration — constant velocity (or rest).'},
      {q:'Which is the correct unit for force?', options:['kg','m/s','Newton (N)','Joule (J)'], answer:2, explain:'Force is measured in newtons, where 1 N = 1 kg·m/s².'},
    ]);
  }
}

SIM_REGISTRY.push({
  id: ID, num:2, title:"Newton's Laws Laboratory", category:'Dynamics',
  short:'Push, pull, and load a crate to see all three of Newton\u2019s laws in action.',
  gradient:'linear-gradient(135deg,#0D47A1,#1976D2)',
  iconSVG:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="10" width="8" height="8" rx="1"/><path d="M14 14h6m-3-3 3 3-3 3"/></svg>`,
  mount
});
})();
