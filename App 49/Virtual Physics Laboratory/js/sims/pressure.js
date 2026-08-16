(function(){
const ID='pressure';
const FLUIDS = {Water:1000, Oil:800, Mercury:13600, Air:1.2};
const MATERIALS = {Wood:600, Ice:920, Cork:240, Aluminum:2700, Iron:7870, Styrofoam:50, Gold:19300};

function mount(root){
  let fluid='Water', material='Wood', volume=0.02, t=0, running=false, obs, gPressure;

  VPL.buildTabs(root, [
    {id:'learn', label:'Learn', render: renderLearn},
    {id:'simulate', label:'Simulate', render: renderSim},
    {id:'data', label:'Data', render: renderData},
    {id:'quiz', label:'Quiz', render: renderQuiz},
  ], 'simulate');

  function renderLearn(p){
    p.innerHTML = `
    <div class="panel"><h3>${VPL.ICONS.book} Introduction</h3><p>Drop different materials into water, oil, mercury or air and discover why some objects float while others sink.</p></div>
    <div class="panel"><h3>${VPL.ICONS.grad} Learning Objectives</h3><ul><li>Apply Archimedes' Principle to predict floating/sinking.</li><li>Calculate buoyant force and submerged fraction.</li><li>Relate pressure to depth and fluid density.</li></ul></div>
    <div class="panel"><h3>${VPL.ICONS.sigma} Theory</h3><div class="formula-box">Buoyant Force F_b = ρ_fluid × V_displaced × g<br>Object floats if ρ_object &lt; ρ_fluid<br>Submerged fraction = ρ_object / ρ_fluid<br>Pressure P = ρ_fluid × g × h</div></div>
    <div class="panel"><h3>Real-life Applications</h3><ul><li>Ship and submarine design.</li><li>Hot air balloons (buoyancy in air).</li><li>Hydrometers measuring liquid density.</li></ul></div>
    <div class="panel"><h3>Common Mistakes</h3><ul><li>Thinking heavier objects always sink — it's density, not weight alone, that matters.</li><li>Forgetting buoyant force depends on displaced fluid volume, not the object's total volume if it's floating.</li></ul></div>
    <div class="panel"><h3>Interesting Fact</h3><p>A massive steel ship floats because its overall shape displaces enough water to equal its weight — even though steel itself is denser than water!</p></div>`;
  }

  function renderSim(p){
    const fOpts = Object.keys(FLUIDS).map(k=>`<option ${k===fluid?'selected':''}>${k}</option>`).join('');
    const mOpts = Object.keys(MATERIALS).map(k=>`<option ${k===material?'selected':''}>${k}</option>`).join('');
    p.innerHTML = `
    <div class="sim-layout">
      <div class="stage">
        <canvas id="prCanvas" height="300"></canvas>
        <div class="stage-toolbar">
          <button class="primary" id="prDrop">${VPL.ICONS.play} Drop Object</button>
          <button id="prReset">${VPL.ICONS.reset} Reset</button>
          <button id="prRand">${VPL.ICONS.dice} Randomize</button>
          <button id="prShot">${VPL.ICONS.camera} Screenshot</button>
        </div>
      </div>
      <div class="controls panel">
        <h3>Variable Controls</h3>
        <label>Fluid</label><select id="fluidSel">${fOpts}</select>
        <label>Material</label><select id="matSel">${mOpts}</select>
        <label>Volume <span class="val" id="vVal">${(volume*1000).toFixed(0)} L</span></label>
        <input type="range" id="vSlide" min="1" max="100" value="${volume*1000}">
        <div class="readout-grid" id="readouts"></div>
        <div class="formula-box" id="formulaBox"></div>
      </div>
    </div>`;
    const canvas=p.querySelector('#prCanvas'), ctx=canvas.getContext('2d');
    let animPos=0, dropped=false;
    p.querySelector('#fluidSel').onchange=e=>{fluid=e.target.value; updateReadouts(); draw();};
    p.querySelector('#matSel').onchange=e=>{material=e.target.value; updateReadouts(); draw();};
    p.querySelector('#vSlide').oninput=e=>{volume=+e.target.value/1000; p.querySelector('#vVal').textContent=e.target.value+' L'; updateReadouts(); draw();};
    p.querySelector('#prDrop').onclick=()=>{dropped=true; animate();};
    p.querySelector('#prReset').onclick=()=>{dropped=false; animPos=0; draw();};
    p.querySelector('#prRand').onclick=()=>{
      const fk=Object.keys(FLUIDS), mk=Object.keys(MATERIALS);
      fluid=fk[Math.floor(Math.random()*fk.length)]; material=mk[Math.floor(Math.random()*mk.length)];
      volume=(Math.round(Math.random()*99+1))/1000;
      p.querySelector('#fluidSel').value=fluid; p.querySelector('#matSel').value=material;
      p.querySelector('#vSlide').value=volume*1000; p.querySelector('#vVal').textContent=(volume*1000).toFixed(0)+' L';
      dropped=false; animPos=0; updateReadouts(); draw();
    };
    p.querySelector('#prShot').onclick=()=>VPL.screenshotCanvas(canvas,'buoyancy-lab.png');

    function calc(){
      const g=9.8, rhoF=FLUIDS[fluid], rhoO=MATERIALS[material];
      const weight = rhoO*volume*g;
      const floats = rhoO < rhoF;
      const submergedFrac = Math.min(1, rhoO/rhoF);
      const buoyantForce = floats ? weight : rhoF*volume*g;
      const pressureAtBottom = rhoF*g*0.3; // demo depth
      return {rhoF,rhoO,weight,floats,submergedFrac,buoyantForce,pressureAtBottom};
    }
    function updateReadouts(){
      const c = calc();
      p.querySelector('#readouts').innerHTML = `
        <div class="readout"><div class="lbl">Object Weight</div><div class="valn">${c.weight.toFixed(2)} N</div></div>
        <div class="readout"><div class="lbl">Buoyant Force</div><div class="valn">${c.buoyantForce.toFixed(2)} N</div></div>
        <div class="readout"><div class="lbl">Result</div><div class="valn">${c.floats?'Floats':'Sinks'}</div></div>
        <div class="readout"><div class="lbl">Submerged</div><div class="valn">${c.floats?(c.submergedFrac*100).toFixed(0)+'%':'100%'}</div></div>`;
      p.querySelector('#formulaBox').innerHTML =
        `ρ_object = ${c.rhoO} kg/m³, ρ_fluid = ${c.rhoF} kg/m³<br>F_b = ρ_fluid × V × g = ${c.rhoF} × ${volume.toFixed(3)} × 9.8 = <span class="ans">${c.buoyantForce.toFixed(2)} N</span><br>${c.floats? `Submerged fraction = ρ_obj/ρ_fluid = <span class="ans">${(c.submergedFrac*100).toFixed(0)}%</span>` : 'Object weight exceeds buoyant force → sinks'}`;
    }
    function draw(){
      const dpr=window.devicePixelRatio||1, W=canvas.clientWidth, H=300;
      canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      const fluidTop=60;
      const fluidColors={Water:'#8ECBEF',Oil:'#E8C168',Mercury:'#B9BDC4',Air:'#EAF6FF'};
      ctx.fillStyle=fluidColors[fluid]; ctx.globalAlpha=.75; ctx.fillRect(20,fluidTop,W-40,H-fluidTop-20); ctx.globalAlpha=1;
      ctx.strokeStyle='#5B6472'; ctx.strokeRect(20,fluidTop,W-40,H-fluidTop-20);
      const c = calc();
      const objSize = 20+Math.min(60, volume*400);
      let objY;
      if(!dropped){ objY = fluidTop-objSize/2-10; }
      else{
        if(c.floats){ objY = fluidTop + objSize*(1-c.submergedFrac) - objSize/2 + objSize/2; }
        else{ objY = H-20-objSize/2; }
      }
      ctx.fillStyle='#1976D2';
      ctx.fillRect(W/2-objSize/2, objY-objSize/2, objSize, objSize);
      ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText(material, W/2, objY+4);
      ctx.fillStyle='#5B6472'; ctx.font='11px sans-serif'; ctx.textAlign='left';
      ctx.fillText(fluid, 26, fluidTop-8);
    }
    function animate(){
      let frame=0;
      const c=calc();
      const targetFrac = c.floats? (1-c.submergedFrac) : 1;
      function step(){
        frame++;
        animPos = Math.min(1, frame/30);
        draw();
        if(obs && frame===30){
          obs.addRow([fluid, material, (volume*1000).toFixed(0), c.weight.toFixed(2), c.buoyantForce.toFixed(2), c.floats?'Floats':'Sinks']);
        }
        if(frame<30) requestAnimationFrame(step);
      }
      step();
      VPL.markProgress(ID,60);
    }
    updateReadouts(); draw();
  }

  function renderData(p){
    p.innerHTML = `<div class="panel"><h3>Observation Table <button class="stage-toolbar" id="expCsv" style="float:right;">${VPL.ICONS.download} Export</button></h3><div id="obsWrap"></div></div>
    <div class="panel"><h3>Density Reference (kg/m³)</h3>
      <div class="table-wrap"><table class="obs"><thead><tr><th>Material</th><th>Density</th></tr></thead><tbody>
      ${Object.entries(MATERIALS).map(([n,d])=>`<tr><td>${n}</td><td>${d}</td></tr>`).join('')}
      </tbody></table></div></div>`;
    obs = new VPL.ObsTable(p.querySelector('#obsWrap'), ['Fluid','Material','Volume (L)','Weight (N)','Buoyant Force (N)','Result']);
    p.querySelector('#expCsv').onclick=()=>VPL.exportCSV('buoyancy-lab.csv', obs.toCSV());
  }

  function renderQuiz(p){
    VPL.buildQuiz(p, ID, [
      {q:"Archimedes' Principle states that buoyant force equals:", options:['Weight of the object','Weight of fluid displaced','Volume of the object','Density of the fluid'], answer:1, explain:'Buoyant force equals the weight of the fluid displaced by the object.'},
      {q:'An object floats if its density is:', options:['Greater than the fluid','Equal to the fluid only','Less than the fluid','Always zero'], answer:2, explain:'Objects float when their density is less than the fluid\u2019s density.'},
      {q:'Which material would sink in water (density 1000 kg/m³)?', options:['Cork (240)','Ice (920)','Iron (7870)','Styrofoam (50)'], answer:2, explain:'Iron\u2019s density (7870 kg/m³) is much greater than water\u2019s, so it sinks.'},
      {q:'Pressure in a fluid increases with:', options:['Decreasing depth','Increasing depth','Decreasing density','Nothing, it stays constant'], answer:1, explain:'P = ρgh — pressure increases with depth h.'},
      {q:'A ship made of steel floats mainly because:', options:['Steel is less dense than water','Its shape displaces enough water to equal its weight','It has no weight','Air resistance holds it up'], answer:1, explain:"The ship's hull shape displaces a large volume of water, generating enough buoyant force despite steel being denser than water."},
    ]);
  }
}

SIM_REGISTRY.push({
  id: ID, num:6, title:'Pressure & Buoyancy Lab', category:'Fluids',
  short:'Drop wood, iron, cork and more into water, oil or mercury to test buoyancy.',
  gradient:'linear-gradient(135deg,#26C6DA,#1976D2)',
  iconSVG:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z"/></svg>`,
  mount
});
})();
