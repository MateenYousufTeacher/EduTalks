(function(){
const ID='gravity';
const PLANETS = {Mercury:3.7, Venus:8.87, Earth:9.8, Moon:1.62, Mars:3.71, Jupiter:24.79};

function mount(root){
  let planet='Earth', height=100, airRes=false, vacuum=false, t=0, running=false, v=0, s=0;
  let gVT, gST, obs;

  VPL.buildTabs(root, [
    {id:'learn', label:'Learn', render: renderLearn},
    {id:'simulate', label:'Simulate', render: renderSim},
    {id:'data', label:'Data', render: renderData},
    {id:'quiz', label:'Quiz', render: renderQuiz},
  ], 'simulate');

  function renderLearn(p){
    p.innerHTML = `
    <div class="panel"><h3>${VPL.ICONS.book} Introduction</h3><p>Drop an object from any height on six different worlds, with or without air resistance, and measure how gravity shapes its fall.</p></div>
    <div class="panel"><h3>${VPL.ICONS.grad} Learning Objectives</h3><ul><li>Understand free fall and acceleration due to gravity (g).</li><li>Compare gravitational acceleration across planets.</li><li>Explain terminal velocity with air resistance.</li></ul></div>
    <div class="panel"><h3>${VPL.ICONS.sigma} Theory</h3><div class="formula-box">h = ½gt²  →  t = √(2h/g)<br>v = gt<br>Terminal velocity reached when air drag = weight</div></div>
    <div class="panel"><h3>Planet Comparison (g in m/s²)</h3>
      <div class="table-wrap"><table class="obs"><thead><tr><th>Planet</th><th>g (m/s²)</th><th>Time to fall 100 m</th></tr></thead><tbody>
      ${Object.entries(PLANETS).map(([n,g])=>`<tr><td>${n}</td><td>${g}</td><td>${Math.sqrt(200/g).toFixed(2)} s</td></tr>`).join('')}
      </tbody></table></div></div>
    <div class="panel"><h3>Real-life Applications</h3><ul><li>Parachute and skydiving design.</li><li>Spacecraft landing calculations.</li><li>Understanding why a feather and hammer fall together in vacuum (Apollo 15 demo).</li></ul></div>
    <div class="panel"><h3>Common Mistakes</h3><ul><li>Assuming all objects fall at the same rate regardless of air resistance (only true in vacuum).</li><li>Forgetting g differs from planet to planet.</li></ul></div>
    <div class="panel"><h3>Interesting Fact</h3><p>On the Moon, astronaut David Scott dropped a hammer and a feather together — with no air, they landed at the exact same time!</p></div>`;
  }

  function renderSim(p){
    const opts = Object.keys(PLANETS).map(k=>`<option ${k===planet?'selected':''}>${k}</option>`).join('');
    p.innerHTML = `
    <div class="sim-layout">
      <div class="stage">
        <canvas id="grCanvas" height="300"></canvas>
        <div class="stage-toolbar">
          <button class="primary" id="grPlay">${VPL.ICONS.play} Play</button>
          <button id="grReset">${VPL.ICONS.reset} Reset</button>
          <button id="grRand">${VPL.ICONS.dice} Randomize</button>
          <button id="grShot">${VPL.ICONS.camera} Screenshot</button>
        </div>
      </div>
      <div class="controls panel">
        <h3>Variable Controls</h3>
        <label>Planet</label><select id="planetSel">${opts}</select>
        <label>Drop Height <span class="val" id="hVal">${height} m</span></label>
        <input type="range" id="hSlide" min="1" max="500" value="${height}">
        <div class="toggle-row">
          <button id="vacBtn">🌌 Vacuum Mode</button>
          <button id="airBtn">💨 Air Resistance</button>
        </div>
        <div class="readout-grid" id="readouts"></div>
        <div class="formula-box" id="formulaBox"></div>
      </div>
    </div>`;
    const canvas=p.querySelector('#grCanvas'), ctx=canvas.getContext('2d');
    p.querySelector('#planetSel').onchange=e=>{planet=e.target.value; updateReadouts(); draw();};
    p.querySelector('#hSlide').oninput=e=>{height=+e.target.value; p.querySelector('#hVal').textContent=height+' m'; updateReadouts(); draw();};
    const vacBtn=p.querySelector('#vacBtn'), airBtn=p.querySelector('#airBtn');
    function syncToggles(){vacBtn.classList.toggle('active',vacuum); airBtn.classList.toggle('active',airRes && !vacuum);}
    vacBtn.onclick=()=>{vacuum=!vacuum; if(vacuum) airRes=false; syncToggles(); updateReadouts();};
    airBtn.onclick=()=>{if(vacuum) return; airRes=!airRes; syncToggles(); updateReadouts();};
    syncToggles();
    p.querySelector('#grPlay').onclick=(e)=>{running=!running; e.target.innerHTML=running?VPL.ICONS.pause+' Pause':VPL.ICONS.play+' Play'; if(running) loop();};
    p.querySelector('#grReset').onclick=()=>resetSim();
    p.querySelector('#grRand').onclick=()=>{
      const keys=Object.keys(PLANETS); planet=keys[Math.floor(Math.random()*keys.length)];
      height=Math.round(Math.random()*499+1);
      p.querySelector('#planetSel').value=planet;
      p.querySelector('#hSlide').value=height; p.querySelector('#hVal').textContent=height+' m';
      resetSim();
    };
    p.querySelector('#grShot').onclick=()=>VPL.screenshotCanvas(canvas,'gravity-freefall.png');

    function resetSim(){running=false;t=0;v=0;s=0;p.querySelector('#grPlay').innerHTML=VPL.ICONS.play+' Play';if(gVT)gVT.reset();if(gST)gST.reset();if(obs)obs.clear();updateReadouts();draw();}
    function loop(){if(!running)return;step(0.02);draw();
      if(s>=height){running=false; p.querySelector('#grPlay').innerHTML=VPL.ICONS.play+' Play'; VPL.markProgress(ID,60); return;}
      requestAnimationFrame(loop);}
    function step(dt){
      t+=dt;
      const g = PLANETS[planet];
      let a = g;
      if(airRes && !vacuum){
        const k=0.02; // effective drag constant per kg for demo
        a = g - k*v*v;
      }
      v += a*dt; if(v<0) v=0;
      s += v*dt; if(s>height) s=height;
      if(gVT){gVT.push([t.toFixed(1), v]); gVT.draw();}
      if(gST){gST.push([t.toFixed(1), s]); gST.draw();}
      if(obs && Math.round(t*50)%10===0) obs.addRow([t.toFixed(2), s.toFixed(2), v.toFixed(2)]);
      updateReadouts();
    }
    function updateReadouts(){
      const g=PLANETS[planet];
      const idealT = Math.sqrt(2*height/g);
      const idealV = g*idealT;
      const terminalV = airRes && !vacuum ? Math.sqrt(g/0.02) : null;
      p.querySelector('#readouts').innerHTML = `
        <div class="readout"><div class="lbl">Gravity (g)</div><div class="valn">${g} m/s²</div></div>
        <div class="readout"><div class="lbl">Time Elapsed</div><div class="valn">${t.toFixed(2)} s</div></div>
        <div class="readout"><div class="lbl">Distance Fallen</div><div class="valn">${s.toFixed(1)} m</div></div>
        <div class="readout"><div class="lbl">Velocity</div><div class="valn">${v.toFixed(1)} m/s</div></div>`;
      p.querySelector('#formulaBox').innerHTML = airRes && !vacuum
        ? `Terminal velocity ≈ √(g/k) = <span class="ans">${terminalV.toFixed(1)} m/s</span> (approx., with drag)`
        : `Ideal fall time: t = √(2h/g) = √(2×${height}/${g}) = <span class="ans">${idealT.toFixed(2)} s</span><br>Impact velocity: v = gt = <span class="ans">${idealV.toFixed(1)} m/s</span>`;
    }
    function draw(){
      const dpr=window.devicePixelRatio||1, W=canvas.clientWidth, H=300;
      canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      const topY=20, groundY=H-20;
      const pxPerM=(groundY-topY)/height;
      ctx.strokeStyle='#B9D4F0'; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(30,topY); ctx.lineTo(W-30,topY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='#43A047'; ctx.fillRect(20,groundY,W-40,8);
      const objY = topY + s*pxPerM;
      ctx.fillStyle='#1976D2'; ctx.beginPath(); ctx.arc(W/2,objY,14,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#5B6472'; ctx.font='11px sans-serif'; ctx.textAlign='left';
      ctx.fillText(`${planet}${vacuum?' · vacuum':''}${airRes&&!vacuum?' · air resistance':''}`, 30, 16);
    }
    updateReadouts(); draw();
  }

  function renderData(p){
    p.innerHTML = `
    <div class="panel"><h3>Velocity–Time Graph</h3><canvas id="gvt3" style="height:200px;width:100%;"></canvas></div>
    <div class="panel"><h3>Distance–Time Graph</h3><canvas id="gst3" style="height:200px;width:100%;"></canvas></div>
    <div class="panel"><h3>Observation Table <button class="stage-toolbar" id="expCsv" style="float:right;">${VPL.ICONS.download} Export</button></h3><div id="obsWrap"></div></div>`;
    gVT = new VPL.Graph(p.querySelector('#gvt3'), {series:[{name:'velocity (m/s)',color:'#1976D2',data:[]}],xlabel:'time (s)',ylabel:'m/s'});
    gST = new VPL.Graph(p.querySelector('#gst3'), {series:[{name:'distance (m)',color:'#43A047',data:[]}],xlabel:'time (s)',ylabel:'m'});
    obs = new VPL.ObsTable(p.querySelector('#obsWrap'), ['Time (s)','Distance Fallen (m)','Velocity (m/s)']);
    gVT.draw(); gST.draw();
    p.querySelector('#expCsv').onclick=()=>VPL.exportCSV('gravity-freefall.csv', obs.toCSV());
  }

  function renderQuiz(p){
    VPL.buildQuiz(p, ID, [
      {q:'On which planet listed would a dropped object fall fastest?', options:['Moon','Mars','Jupiter','Mercury'], answer:2, explain:'Jupiter has the highest gravitational acceleration among those listed (24.79 m/s²).'},
      {q:'In a vacuum, a feather and a hammer dropped together will:', options:['Hammer lands first','Feather lands first','Land at the same time','Neither will fall'], answer:2, explain:'Without air resistance, all objects accelerate at the same rate regardless of mass.'},
      {q:'Terminal velocity occurs when:', options:['Acceleration is maximum','Air resistance equals weight','Object stops falling','Gravity becomes zero'], answer:1, explain:'At terminal velocity, net force is zero because drag force balances gravity.'},
      {q:'The formula for time to fall height h from rest is:', options:['t = 2h/g','t = √(2h/g)','t = gh','t = √(g/2h)'], answer:1, explain:'From h = ½gt², solving for t gives t = √(2h/g).'},
      {q:"Earth's gravitational acceleration is approximately:", options:['1.62 m/s²','3.7 m/s²','9.8 m/s²','24.79 m/s²'], answer:2, explain:"Earth's g ≈ 9.8 m/s²."},
    ]);
  }
}

SIM_REGISTRY.push({
  id: ID, num:4, title:'Gravity & Free Fall', category:'Mechanics',
  short:'Drop objects on six worlds and explore vacuum vs air-resistance fall.',
  gradient:'linear-gradient(135deg,#0D47A1,#26C6DA)',
  iconSVG:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7" r="4"/><path d="M12 11v9m-4-4 4 4 4-4"/></svg>`,
  mount
});
})();
