(function(){
const ID='heat';
const MATERIALS = {Copper:385, Aluminum:205, Iron:80, Glass:1, Wood:0.15, Water:0.6};

function mount(root){
  let mode='conduction', material='Copper', hotT=100, coldT=20, thickness=0.02, area=0.05;
  let convTemp=60, radTemp=500, emissivity=0.8;
  let particles=[], raf;

  VPL.buildTabs(root, [
    {id:'learn', label:'Learn', render: renderLearn},
    {id:'simulate', label:'Simulate', render: renderSim},
    {id:'data', label:'Data', render: renderData},
    {id:'quiz', label:'Quiz', render: renderQuiz},
  ], 'simulate');

  function renderLearn(p){
    p.innerHTML = `
    <div class="panel"><h3>${VPL.ICONS.book} Introduction</h3><p>Heat travels by conduction, convection, and radiation. Explore all three modes and see which materials conduct heat best.</p></div>
    <div class="panel"><h3>${VPL.ICONS.grad} Learning Objectives</h3><ul><li>Compare thermal conductivity of common materials.</li><li>Visualize convection currents in fluids.</li><li>Understand radiative heat loss.</li></ul></div>
    <div class="panel"><h3>${VPL.ICONS.sigma} Theory</h3><div class="formula-box">Conduction: Q/t = kAΔT/d<br>Convection: bulk fluid movement carries heat (no simple closed formula here)<br>Radiation: P = eσAT⁴ (Stefan–Boltzmann Law)</div></div>
    <div class="panel"><h3>Real-life Applications</h3><ul><li>Cooking pans use conductive metal bases.</li><li>Room heaters rely on convection currents.</li><li>The Sun warms Earth purely through radiation.</li></ul></div>
    <div class="panel"><h3>Common Mistakes</h3><ul><li>Thinking all metals conduct heat equally well.</li><li>Believing radiation needs a medium to travel — it doesn't, unlike conduction and convection.</li></ul></div>
    <div class="panel"><h3>Interesting Fact</h3><p>Vacuum flasks (thermos) block all three heat transfer modes: a vacuum layer stops conduction/convection, and a silvered surface reflects radiation.</p></div>`;
  }

  function renderSim(p){
    const matOpts = Object.keys(MATERIALS).map(k=>`<option ${k===material?'selected':''}>${k}</option>`).join('');
    p.innerHTML = `
    <div class="sim-layout">
      <div class="stage">
        <div class="toggle-row" id="modeRow">
          <button data-m="conduction" class="active">Conduction</button>
          <button data-m="convection">Convection</button>
          <button data-m="radiation">Radiation</button>
        </div>
        <canvas id="hCanvas" height="260" style="margin-top:10px;"></canvas>
      </div>
      <div class="controls panel" id="controlsBox"></div>
    </div>`;
    const canvas=p.querySelector('#hCanvas'), ctx=canvas.getContext('2d');
    const cbox = p.querySelector('#controlsBox');

    function buildControls(){
      if(mode==='conduction'){
        cbox.innerHTML = `<h3>Variable Controls</h3>
          <label>Material</label><select id="matSel">${matOpts}</select>
          <label>Hot Side Temp <span class="val" id="hotVal">${hotT} °C</span></label><input type="range" id="hotSlide" min="30" max="300" value="${hotT}">
          <label>Cold Side Temp <span class="val" id="coldVal">${coldT} °C</span></label><input type="range" id="coldSlide" min="0" max="29" value="${coldT}">
          <label>Thickness <span class="val" id="thickVal">${thickness} m</span></label><input type="range" id="thickSlide" min="0.005" max="0.1" step="0.005" value="${thickness}">
          <label>Area <span class="val" id="areaVal">${area} m²</span></label><input type="range" id="areaSlide" min="0.01" max="0.5" step="0.01" value="${area}">
          <div class="readout-grid" id="readouts"></div><div class="formula-box" id="formulaBox"></div>`;
        cbox.querySelector('#matSel').onchange=e=>{material=e.target.value; updateReadouts();};
        cbox.querySelector('#hotSlide').oninput=e=>{hotT=+e.target.value; cbox.querySelector('#hotVal').textContent=hotT+' °C'; updateReadouts();};
        cbox.querySelector('#coldSlide').oninput=e=>{coldT=+e.target.value; cbox.querySelector('#coldVal').textContent=coldT+' °C'; updateReadouts();};
        cbox.querySelector('#thickSlide').oninput=e=>{thickness=+e.target.value; cbox.querySelector('#thickVal').textContent=thickness+' m'; updateReadouts();};
        cbox.querySelector('#areaSlide').oninput=e=>{area=+e.target.value; cbox.querySelector('#areaVal').textContent=area+' m²'; updateReadouts();};
      }else if(mode==='convection'){
        cbox.innerHTML = `<h3>Variable Controls</h3>
          <label>Heater Temperature <span class="val" id="cvVal">${convTemp} °C</span></label><input type="range" id="cvSlide" min="20" max="100" value="${convTemp}">
          <div class="readout-grid" id="readouts"></div><div class="formula-box" id="formulaBox"></div>`;
        cbox.querySelector('#cvSlide').oninput=e=>{convTemp=+e.target.value; cbox.querySelector('#cvVal').textContent=convTemp+' °C'; updateReadouts();};
      }else{
        cbox.innerHTML = `<h3>Variable Controls</h3>
          <label>Object Temperature <span class="val" id="rtVal">${radTemp} K</span></label><input type="range" id="rtSlide" min="200" max="2000" value="${radTemp}">
          <label>Emissivity <span class="val" id="emVal">${emissivity}</span></label><input type="range" id="emSlide" min="0.1" max="1" step="0.05" value="${emissivity}">
          <div class="readout-grid" id="readouts"></div><div class="formula-box" id="formulaBox"></div>`;
        cbox.querySelector('#rtSlide').oninput=e=>{radTemp=+e.target.value; cbox.querySelector('#rtVal').textContent=radTemp+' K'; updateReadouts();};
        cbox.querySelector('#emSlide').oninput=e=>{emissivity=+e.target.value; cbox.querySelector('#emVal').textContent=emissivity; updateReadouts();};
      }
      updateReadouts();
    }

    p.querySelector('#modeRow').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      p.querySelector('#modeRow').querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); mode=b.dataset.m; buildControls();
      VPL.markProgress(ID,60);
    });

    function updateReadouts(){
      const ro=cbox.querySelector('#readouts'), fb=cbox.querySelector('#formulaBox');
      if(mode==='conduction'){
        const k=MATERIALS[material];
        const dT = hotT-coldT;
        const Qrate = k*area*dT/thickness;
        ro.innerHTML = `
          <div class="readout"><div class="lbl">Conductivity (k)</div><div class="valn">${k} W/m·K</div></div>
          <div class="readout"><div class="lbl">ΔT</div><div class="valn">${dT} °C</div></div>
          <div class="readout"><div class="lbl">Heat Flow Rate</div><div class="valn">${Qrate.toFixed(1)} W</div></div>
          <div class="readout"><div class="lbl">Material</div><div class="valn">${material}</div></div>`;
        fb.innerHTML = `Q/t = kAΔT/d = ${k}×${area}×${dT}/${thickness} = <span class="ans">${Qrate.toFixed(1)} W</span>`;
      }else if(mode==='convection'){
        ro.innerHTML = `
          <div class="readout"><div class="lbl">Heater Temp</div><div class="valn">${convTemp} °C</div></div>
          <div class="readout"><div class="lbl">Current Speed</div><div class="valn">${(convTemp/20).toFixed(1)}×</div></div>`;
        fb.innerHTML = `Warmer fluid becomes less dense and rises; cooler fluid sinks — creating a continuous convection current. Higher heater temperature → faster current.`;
      }else{
        const sigma=5.670374e-8;
        const P = emissivity*sigma*area*Math.pow(radTemp,4);
        ro.innerHTML = `
          <div class="readout"><div class="lbl">Temperature</div><div class="valn">${radTemp} K</div></div>
          <div class="readout"><div class="lbl">Emissivity</div><div class="valn">${emissivity}</div></div>
          <div class="readout"><div class="lbl">Radiated Power</div><div class="valn">${P.toFixed(1)} W</div></div>`;
        fb.innerHTML = `P = eσAT⁴ = ${emissivity}×5.67×10⁻⁸×${area}×${radTemp}⁴ = <span class="ans">${P.toFixed(1)} W</span>`;
      }
    }

    function animLoop(){
      draw();
      raf = requestAnimationFrame(animLoop);
    }
    function draw(){
      const dpr=window.devicePixelRatio||1, W=canvas.clientWidth, H=260;
      canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      const time = performance.now()/1000;
      if(mode==='conduction'){
        const barY=H/2-30, barH=60;
        const grad = ctx.createLinearGradient(30,0,W-30,0);
        grad.addColorStop(0,'#D32F2F'); grad.addColorStop(1,'#1976D2');
        ctx.fillStyle=grad; ctx.fillRect(30,barY,W-60,barH);
        ctx.fillStyle='#5B6472'; ctx.font='11px sans-serif'; ctx.textAlign='left';
        ctx.fillText(hotT+'°C', 30, barY-8);
        ctx.textAlign='right'; ctx.fillText(coldT+'°C', W-30, barY-8);
        ctx.textAlign='center'; ctx.fillText(material, W/2, barY+barH+18);
        // moving heat dots
        const k=MATERIALS[material]; const speed = Math.max(0.3,Math.min(3,k/100));
        for(let i=0;i<6;i++){
          const prog = ((time*speed*0.15)+i/6)%1;
          const x = 30+prog*(W-60);
          ctx.fillStyle='rgba(255,255,255,.9)';
          ctx.beginPath(); ctx.arc(x,barY+barH/2,4,0,Math.PI*2); ctx.fill();
        }
      }else if(mode==='convection'){
        ctx.strokeStyle='#5B6472'; ctx.strokeRect(30,20,W-60,H-70);
        // heater at bottom
        ctx.fillStyle='#D32F2F'; ctx.fillRect(30,H-50,W-60,10);
        const speed = convTemp/20;
        if(particles.length===0){
          for(let i=0;i<24;i++) particles.push({x:40+Math.random()*(W-80), y:H-60-Math.random()*(H-100), phase:Math.random()*10});
        }
        ctx.fillStyle='#1976D2';
        particles.forEach(pt=>{
          pt.y -= speed*0.6;
          pt.x += Math.sin(time+pt.phase)*0.4;
          if(pt.y<30){ pt.y=H-55; pt.x=40+Math.random()*(W-80); }
          ctx.beginPath(); ctx.arc(pt.x,pt.y,4,0,Math.PI*2); ctx.fill();
        });
      }else{
        const cx=W/2, cy=H/2;
        const hue = Math.min(60, radTemp/2000*60);
        const glow = Math.min(1, radTemp/2000);
        ctx.fillStyle = `hsl(${20-hue*0.3},90%,${40+glow*30}%)`;
        ctx.beginPath(); ctx.arc(cx,cy,30,0,Math.PI*2); ctx.fill();
        for(let i=0;i<8;i++){
          const ang = (i/8)*Math.PI*2 + time*0.5;
          const len = 20+glow*30+Math.sin(time*3+i)*5;
          ctx.strokeStyle = `rgba(255,150,50,${0.3+glow*0.5})`;
          ctx.lineWidth=2;
          ctx.beginPath();
          ctx.moveTo(cx+Math.cos(ang)*32, cy+Math.sin(ang)*32);
          ctx.lineTo(cx+Math.cos(ang)*(32+len), cy+Math.sin(ang)*(32+len));
          ctx.stroke();
        }
        ctx.fillStyle='#5B6472'; ctx.font='11px sans-serif'; ctx.textAlign='center';
        ctx.fillText(radTemp+' K', cx, cy+50);
      }
    }
    buildControls();
    animLoop();
  }

  function renderData(p){
    p.innerHTML = `<div class="panel"><h3>Thermal Conductivity Reference</h3>
      <div class="table-wrap"><table class="obs"><thead><tr><th>Material</th><th>k (W/m·K)</th></tr></thead><tbody>
      ${Object.entries(MATERIALS).map(([n,k])=>`<tr><td>${n}</td><td>${k}</td></tr>`).join('')}
      </tbody></table></div></div>
      <div class="panel"><p>Tip: switch between Conduction, Convection and Radiation in the Simulate tab to compare all three heat transfer modes side by side.</p></div>`;
  }

  function renderQuiz(p){
    VPL.buildQuiz(p, ID, [
      {q:'Which heat transfer mode requires NO medium at all?', options:['Conduction','Convection','Radiation','All require a medium'], answer:2, explain:'Radiation travels via electromagnetic waves and can pass through a vacuum.'},
      {q:'Which of these materials is the BEST thermal conductor?', options:['Wood','Glass','Water','Copper'], answer:3, explain:'Copper has a very high thermal conductivity (385 W/m·K), far above wood, glass, or water.'},
      {q:'Convection currents occur because:', options:['Hot fluid becomes denser and sinks','Hot fluid becomes less dense and rises','Heat always moves downward','Fluids cannot carry heat'], answer:1, explain:'Heating reduces fluid density, causing it to rise while cooler, denser fluid sinks.'},
      {q:'The Stefan-Boltzmann law relates radiated power to which power of temperature?', options:['T¹','T²','T³','T⁴'], answer:3, explain:'P = eσAT⁴ — power scales with the fourth power of absolute temperature.'},
      {q:'A thermos flask minimizes heat transfer mainly using:', options:['A thick plastic layer only','A vacuum gap and reflective coating','Cold water circulation','Direct sunlight blocking'], answer:1, explain:'The vacuum stops conduction/convection, and the silvered surface reflects radiation.'},
    ]);
  }
}

SIM_REGISTRY.push({
  id: ID, num:7, title:'Heat Transfer Laboratory', category:'Thermodynamics',
  short:'Compare conduction, convection and radiation with live animated visuals.',
  gradient:'linear-gradient(135deg,#D32F2F,#FFB300)',
  iconSVG:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v6m0 0c-3 3-5 6-5 9a5 5 0 0 0 10 0c0-3-2-6-5-9z"/></svg>`,
  mount
});
})();
