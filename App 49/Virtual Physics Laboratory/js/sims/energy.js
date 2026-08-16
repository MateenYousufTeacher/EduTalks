(function(){
const ID='energy';

function mount(root){
  let mode='lift', mass=10, height=5, effortF=120, liftTime=4, dropHeight=20;
  let t=0, running=false, s=0, v=0;
  let gE, obs;

  VPL.buildTabs(root, [
    {id:'learn', label:'Learn', render: renderLearn},
    {id:'simulate', label:'Simulate', render: renderSim},
    {id:'data', label:'Data', render: renderData},
    {id:'quiz', label:'Quiz', render: renderQuiz},
  ], 'simulate');

  function renderLearn(p){
    p.innerHTML = `
    <div class="panel"><h3>${VPL.ICONS.book} Introduction</h3><p>Lift crates and drop objects to see how work, power and energy connect — and how mechanical energy is conserved during free fall.</p></div>
    <div class="panel"><h3>${VPL.ICONS.grad} Learning Objectives</h3><ul><li>Calculate work, power, and mechanical efficiency.</li><li>Track kinetic and potential energy conversion.</li><li>Verify conservation of mechanical energy.</li></ul></div>
    <div class="panel"><h3>${VPL.ICONS.sigma} Theory</h3><div class="formula-box">W = F·d<br>P = W/t<br>KE = ½mv²<br>PE = mgh<br>Efficiency = (useful output / total input) × 100%</div></div>
    <div class="panel"><h3>Real-life Applications</h3><ul><li>Crane and elevator motor sizing.</li><li>Hydroelectric dams (PE → KE → electrical energy).</li><li>Roller coasters (continuous PE ↔ KE conversion).</li></ul></div>
    <div class="panel"><h3>Common Mistakes</h3><ul><li>Confusing work (Joules) with power (Watts).</li><li>Forgetting energy losses (heat/sound) reduce efficiency below 100%.</li></ul></div>
    <div class="panel"><h3>Interesting Fact</h3><p>No real machine is 100% efficient — some energy always converts to heat or sound due to friction and air resistance.</p></div>`;
  }

  function renderSim(p){
    p.innerHTML = `
    <div class="sim-layout">
      <div class="stage">
        <div class="toggle-row" id="modeRow">
          <button data-m="lift" class="active">Lift a Crate</button>
          <button data-m="fall">Energy Conversion (Fall)</button>
        </div>
        <canvas id="eCanvas" height="280" style="margin-top:10px;"></canvas>
        <div class="stage-toolbar">
          <button class="primary" id="ePlay">${VPL.ICONS.play} Play</button>
          <button id="eReset">${VPL.ICONS.reset} Reset</button>
          <button id="eRand">${VPL.ICONS.dice} Randomize</button>
          <button id="eShot">${VPL.ICONS.camera} Screenshot</button>
        </div>
      </div>
      <div class="controls panel" id="controlsBox"></div>
    </div>`;
    const canvas=p.querySelector('#eCanvas'), ctx=canvas.getContext('2d');
    const cbox=p.querySelector('#controlsBox');

    function buildControls(){
      if(mode==='lift'){
        cbox.innerHTML = `<h3>Variable Controls</h3>
        <label>Mass <span class="val" id="mVal">${mass} kg</span></label><input type="range" id="mSlide" min="1" max="100" value="${mass}">
        <label>Lift Height <span class="val" id="hVal">${height} m</span></label><input type="range" id="hSlide" min="1" max="20" value="${height}">
        <label>Effort Force <span class="val" id="fVal">${effortF} N</span></label><input type="range" id="fSlide" min="10" max="500" value="${effortF}">
        <label>Time Taken <span class="val" id="tVal">${liftTime} s</span></label><input type="range" id="tSlide" min="1" max="20" value="${liftTime}">
        <div class="readout-grid" id="readouts"></div><div class="formula-box" id="formulaBox"></div>`;
        cbox.querySelector('#mSlide').oninput=e=>{mass=+e.target.value; cbox.querySelector('#mVal').textContent=mass+' kg'; updateReadouts();};
        cbox.querySelector('#hSlide').oninput=e=>{height=+e.target.value; cbox.querySelector('#hVal').textContent=height+' m'; updateReadouts();};
        cbox.querySelector('#fSlide').oninput=e=>{effortF=+e.target.value; cbox.querySelector('#fVal').textContent=effortF+' N'; updateReadouts();};
        cbox.querySelector('#tSlide').oninput=e=>{liftTime=+e.target.value; cbox.querySelector('#tVal').textContent=liftTime+' s'; updateReadouts();};
      }else{
        cbox.innerHTML = `<h3>Variable Controls</h3>
        <label>Mass <span class="val" id="mVal2">${mass} kg</span></label><input type="range" id="mSlide2" min="1" max="100" value="${mass}">
        <label>Drop Height <span class="val" id="dhVal">${dropHeight} m</span></label><input type="range" id="dhSlide" min="2" max="60" value="${dropHeight}">
        <div class="readout-grid" id="readouts"></div><div class="formula-box" id="formulaBox"></div>`;
        cbox.querySelector('#mSlide2').oninput=e=>{mass=+e.target.value; cbox.querySelector('#mVal2').textContent=mass+' kg'; updateReadouts();};
        cbox.querySelector('#dhSlide').oninput=e=>{dropHeight=+e.target.value; cbox.querySelector('#dhVal').textContent=dropHeight+' m'; updateReadouts();};
      }
      updateReadouts();
    }
    buildControls();

    p.querySelector('#modeRow').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      p.querySelector('#modeRow').querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); mode=b.dataset.m; resetSim(); buildControls();
    });
    p.querySelector('#ePlay').onclick=(e)=>{running=!running; e.target.innerHTML=running?VPL.ICONS.pause+' Pause':VPL.ICONS.play+' Play'; if(running) loop();};
    p.querySelector('#eReset').onclick=()=>resetSim();
    p.querySelector('#eRand').onclick=()=>{
      mass=Math.round(Math.random()*99+1);
      if(mode==='lift'){height=Math.round(Math.random()*19+1); effortF=Math.round(Math.random()*490+10); liftTime=Math.round(Math.random()*19+1);}
      else{dropHeight=Math.round(Math.random()*58+2);}
      resetSim(); buildControls();
    };
    p.querySelector('#eShot').onclick=()=>VPL.screenshotCanvas(canvas,'energy-lab.png');

    function resetSim(){running=false;t=0;s=0;v=0;p.querySelector('#ePlay').innerHTML=VPL.ICONS.play+' Play';if(gE)gE.reset();if(obs)obs.clear();updateReadouts();draw();}
    function loop(){
      if(!running)return;
      if(mode==='lift'){
        t+=0.05;
        s = Math.min(height, (t/liftTime)*height);
        if(t>=liftTime){running=false;p.querySelector('#ePlay').innerHTML=VPL.ICONS.play+' Play'; VPL.markProgress(ID,60);}
      }else{
        const g=9.8; t+=0.03; v=g*t; s=Math.min(dropHeight,0.5*g*t*t);
        if(s>=dropHeight){running=false;p.querySelector('#ePlay').innerHTML=VPL.ICONS.play+' Play'; VPL.markProgress(ID,60);}
      }
      logPoint(); updateReadouts(); draw();
      if(running) requestAnimationFrame(loop);
    }
    function logPoint(){
      if(mode==='lift'){
        const pe = mass*9.8*s;
        if(gE){gE.push([t.toFixed(1), pe, 0]); gE.draw();}
        if(obs && Math.round(t*20)%6===0) obs.addRow([t.toFixed(1), s.toFixed(2), pe.toFixed(1)]);
      }else{
        const remaining = dropHeight-s;
        const pe = mass*9.8*remaining, ke=0.5*mass*v*v;
        if(gE){gE.push([t.toFixed(1), pe, ke]); gE.draw();}
        if(obs && Math.round(t*30)%8===0) obs.addRow([t.toFixed(2), s.toFixed(2), v.toFixed(2), pe.toFixed(1), ke.toFixed(1), (pe+ke).toFixed(1)]);
      }
    }
    function updateReadouts(){
      const ro = cbox.querySelector('#readouts'), fb = cbox.querySelector('#formulaBox');
      if(mode==='lift'){
        const W = effortF*height;
        const usefulW = mass*9.8*height;
        const P = W/liftTime;
        const eff = Math.min(100, (usefulW/W)*100);
        ro.innerHTML = `
          <div class="readout"><div class="lbl">Work Done</div><div class="valn">${W.toFixed(1)} J</div></div>
          <div class="readout"><div class="lbl">Useful Work (PE)</div><div class="valn">${usefulW.toFixed(1)} J</div></div>
          <div class="readout"><div class="lbl">Power</div><div class="valn">${P.toFixed(1)} W</div></div>
          <div class="readout"><div class="lbl">Efficiency</div><div class="valn">${eff.toFixed(0)}%</div></div>`;
        fb.innerHTML = `W = F·d = ${effortF} × ${height} = ${W.toFixed(1)} J<br>P = W/t = ${W.toFixed(1)}/${liftTime} = <span class="ans">${P.toFixed(1)} W</span><br>Efficiency = (mgh / W) × 100 = <span class="ans">${eff.toFixed(0)}%</span>`;
      }else{
        const remaining = dropHeight-s;
        const pe = mass*9.8*remaining, ke=0.5*mass*v*v, total=pe+ke;
        ro.innerHTML = `
          <div class="readout"><div class="lbl">Height Remaining</div><div class="valn">${remaining.toFixed(1)} m</div></div>
          <div class="readout"><div class="lbl">Potential Energy</div><div class="valn">${pe.toFixed(1)} J</div></div>
          <div class="readout"><div class="lbl">Kinetic Energy</div><div class="valn">${ke.toFixed(1)} J</div></div>
          <div class="readout"><div class="lbl">Total Mechanical E.</div><div class="valn">${total.toFixed(1)} J</div></div>`;
        fb.innerHTML = `PE = mgh = ${mass}×9.8×${remaining.toFixed(1)} = ${pe.toFixed(1)} J<br>KE = ½mv² = ½×${mass}×${v.toFixed(1)}² = ${ke.toFixed(1)} J<br>Total = <span class="ans">${total.toFixed(1)} J (conserved!)</span>`;
      }
    }
    function draw(){
      const dpr=window.devicePixelRatio||1, W=canvas.clientWidth, H=280;
      canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      if(mode==='lift'){
        const groundY=H-20, topY=30;
        const pxPerM=(groundY-topY)/height;
        const objY = groundY - s*pxPerM;
        ctx.fillStyle='#43A047'; ctx.fillRect(20,groundY,W-40,8);
        ctx.strokeStyle='#B9D4F0'; ctx.beginPath(); ctx.moveTo(W/2,topY); ctx.lineTo(W/2,groundY); ctx.stroke();
        ctx.fillStyle='#1976D2'; ctx.fillRect(W/2-20,objY-30,40,30);
        ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.textAlign='center'; ctx.fillText(mass+'kg', W/2, objY-14);
      }else{
        const groundY=H-20, topY=30;
        const pxPerM=(groundY-topY)/dropHeight;
        const objY = topY + s*pxPerM;
        ctx.fillStyle='#43A047'; ctx.fillRect(20,groundY,W-40,8);
        ctx.fillStyle='#1976D2'; ctx.beginPath(); ctx.arc(W/2,objY,14,0,Math.PI*2); ctx.fill();
        // energy bars
        const remaining=dropHeight-s, pe=mass*9.8*remaining, ke=0.5*mass*v*v, total=Math.max(1,pe+ke);
        const barX=W-60;
        ctx.fillStyle='rgba(255,179,0,.25)'; ctx.fillRect(barX,topY,26,groundY-topY);
        const peH=(pe/total)*(groundY-topY);
        ctx.fillStyle='#FFB300'; ctx.fillRect(barX,groundY-peH,26,peH);
        ctx.fillStyle='rgba(25,118,210,.25)'; ctx.fillRect(barX+30,topY,26,groundY-topY);
        const keH=(ke/total)*(groundY-topY);
        ctx.fillStyle='#1976D2'; ctx.fillRect(barX+30,groundY-keH,26,keH);
        ctx.fillStyle='#5B6472'; ctx.font='10px sans-serif'; ctx.textAlign='center';
        ctx.fillText('PE', barX+13, groundY+14); ctx.fillText('KE', barX+43, groundY+14);
      }
    }
    draw();
  }

  function renderData(p){
    p.innerHTML = `
    <div class="panel"><h3>Energy vs Time Graph</h3><canvas id="ge" style="height:220px;width:100%;"></canvas></div>
    <div class="panel"><h3>Observation Table <button class="stage-toolbar" id="expCsv" style="float:right;">${VPL.ICONS.download} Export</button></h3><div id="obsWrap"></div></div>`;
    gE = new VPL.Graph(p.querySelector('#ge'), {series:[{name:'PE (J)',color:'#FFB300',data:[]},{name:'KE (J)',color:'#1976D2',data:[]}],xlabel:'time (s)',ylabel:'Joules'});
    obs = new VPL.ObsTable(p.querySelector('#obsWrap'), mode==='lift'? ['Time (s)','Height (m)','PE (J)'] : ['Time (s)','Fallen (m)','Velocity (m/s)','PE (J)','KE (J)','Total (J)']);
    gE.draw();
    p.querySelector('#expCsv').onclick=()=>VPL.exportCSV('energy-lab.csv', obs.toCSV());
  }

  function renderQuiz(p){
    VPL.buildQuiz(p, ID, [
      {q:'The SI unit of power is:', options:['Joule','Newton','Watt','Pascal'], answer:2, explain:'Power is measured in watts (1 W = 1 J/s).'},
      {q:'As an object falls freely, its potential energy:', options:['Increases','Stays constant','Converts into kinetic energy','Disappears'], answer:2, explain:'PE converts into KE as height decreases and speed increases, keeping total mechanical energy constant.'},
      {q:'Work done is zero when:', options:['Force and displacement are parallel','Force is perpendicular to displacement','Force is very large','Time is short'], answer:1, explain:'W = Fd cosθ; when θ=90°, cos90°=0, so no work is done.'},
      {q:'A machine that is 80% efficient converts what fraction of input energy to useful output?', options:['20%','50%','80%','100%'], answer:2, explain:'Efficiency directly gives the useful output fraction — 80% here.'},
      {q:'Kinetic energy formula is:', options:['KE = mgh','KE = ½mv²','KE = Fd','KE = P/t'], answer:1, explain:'KE = ½mv², where v is the speed of the object.'},
    ]);
  }
}

SIM_REGISTRY.push({
  id: ID, num:5, title:'Work, Power & Energy', category:'Energy',
  short:'Lift crates or drop objects to explore work, power, and energy conservation.',
  gradient:'linear-gradient(135deg,#FFB300,#FF8F00)',
  iconSVG:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>`,
  mount
});
})();
