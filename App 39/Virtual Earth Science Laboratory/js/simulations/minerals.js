/* ==========================================================================
   Simulation 9 — Mineral Formation Laboratory
   ========================================================================== */
(function(){
  let temperature=60, pressure=40, coolingRate=30, waterChem=50;
  let growth=0, growing=false;
  let history=[];
  let root, EL, canvas;

  const MINERALS = [
    {n:'Quartz', hardness:7, cleavage:'None (fractures)', lustre:'Glassy', color:'Colourless/White', density:2.65, streak:'White', acid:'No reaction'},
    {n:'Calcite', hardness:3, cleavage:'Perfect, 3 directions', lustre:'Glassy', color:'White/Clear', density:2.71, streak:'White', acid:'Fizzes strongly'},
    {n:'Feldspar', hardness:6, cleavage:'Good, 2 directions', lustre:'Glassy to pearly', color:'Pink/White', density:2.56, streak:'White', acid:'No reaction'},
    {n:'Mica (Biotite)', hardness:2.5, cleavage:'Perfect, 1 direction (sheets)', lustre:'Shiny/Vitreous', color:'Black/Brown', density:3.0, streak:'White', acid:'No reaction'},
    {n:'Halite', hardness:2.5, cleavage:'Perfect, cubic', lustre:'Glassy', color:'Colourless/White', density:2.17, streak:'White', acid:'No reaction'},
    {n:'Gypsum', hardness:2, cleavage:'Perfect, 1 direction', lustre:'Pearly/Silky', color:'White/Grey', density:2.32, streak:'White', acid:'No reaction'},
    {n:'Magnetite', hardness:6, cleavage:'None (fractures)', lustre:'Metallic', color:'Black', density:5.15, streak:'Black', acid:'No reaction'},
    {n:'Pyrite', hardness:6.5, cleavage:'None (fractures)', lustre:'Metallic', color:'Brassy Gold', density:5.0, streak:'Greenish-black', acid:'No reaction'},
  ];
  let target = MINERALS[0];
  let revealed = {};

  function newSample(){
    target = MINERALS[Math.floor(Math.random()*MINERALS.length)];
    revealed = {};
    EL.toast('New unknown mineral sample loaded');
    renderChallenge();
  }

  function testProp(prop){
    revealed[prop] = true;
    EL.logObservation(root, ['Test', prop, String(target[prop]), `Observed via ${prop} test`]);
    renderChallenge();
  }

  function submitGuess(name){
    const correct = name === target.n;
    EL.logObservation(root, ['Identification', target.n, correct?'Correct':'Incorrect', correct?'Well identified!':`It was actually ${target.n}`]);
    EL.toast(correct ? `✅ Correct — it's ${target.n}!` : `❌ Not quite — it was ${target.n}.`);
    EL.addXP(correct?10:2);
    history.push({trial:history.length+1, target:target.n, guess:name, correct});
    if(history.length>30) history.shift();
    updateData();
    revealed = {hardness:true, cleavage:true, lustre:true, color:true, density:true, streak:true, acid:true};
    renderChallenge();
  }

  function renderChallenge(){
    let host = document.getElementById('mineralChallenge');
    if(!host) return;
    const props = ['hardness','cleavage','lustre','color','density','streak','acid'];
    const labels = {hardness:'Hardness Test',cleavage:'Cleavage Test',lustre:'Lustre Check',color:'Colour Check',density:'Density Test',streak:'Streak Test',acid:'Acid Reaction Test'};
    host.innerHTML = `
      <h4 style="margin-bottom:10px;">🔎 Mineral Identification Challenge</h4>
      <div class="badge-row" style="margin-bottom:10px;">
        ${props.map(p=>`<button class="chip" data-test="${p}" style="cursor:pointer; border:none;">${labels[p]}${revealed[p]?` ✓ ${target[p]}`:''}</button>`).join('')}
      </div>
      <select id="mineralGuess" style="margin-bottom:8px;">
        <option value="">Select your identification…</option>
        ${MINERALS.map(m=>`<option value="${m.n}">${m.n}</option>`).join('')}
      </select>
      <div class="flex gap-8">
        <button class="btn primary" id="submitGuessBtn">Submit Identification</button>
        <button class="btn ghost" id="newSampleBtn">🔄 New Sample</button>
      </div>
    `;
    host.querySelectorAll('[data-test]').forEach(b=> b.addEventListener('click', ()=> testProp(b.dataset.test)));
    host.querySelector('#submitGuessBtn').addEventListener('click', ()=>{
      const v = host.querySelector('#mineralGuess').value;
      if(!v){ EL.toast('Choose a mineral first'); return; }
      submitGuess(v);
    });
    host.querySelector('#newSampleBtn').addEventListener('click', newSample);
  }

  function draw(){
    const ctx = EL.fitCanvas(canvas, 420);
    const w = canvas.clientWidth, h=420;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#16261C'; ctx.fillRect(0,0,w,h);

    const crystalSize = EL.clamp(30 - coolingRate*0.25, 4, 28);
    const crystalCount = Math.round(4 + coolingRate/9);
    const seedPositions = [];
    for(let i=0;i<crystalCount;i++){
      seedPositions.push({
        x: w*0.15 + (i%5)*(w*0.7/4.2) + (Math.floor(i/5)*18),
        y: h*0.3 + Math.floor(i/5)*(h*0.35)
      });
    }
    const g = EL.clamp(growth,0,1);
    seedPositions.forEach((p,i)=>{
      const size = crystalSize*g*(0.8+0.2*Math.sin(i));
      drawCrystal(ctx, p.x, p.y, Math.max(size,1), waterChem, temperature);
    });

    ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif';
    ctx.fillText(`Cooling rate: ${coolingRate<33?'Slow → fewer, larger crystals':coolingRate<66?'Medium':'Fast → many small crystals'}`, 14, 22);
    ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText(`Temperature ${temperature}%  ·  Pressure ${pressure}%  ·  Water mineral content ${waterChem}%`, 14, 40);
  }

  function drawCrystal(ctx,cx,cy,r,waterChem,temp){
    const sides = 6;
    const hue = 190 + temp*0.6;
    ctx.save(); ctx.translate(cx,cy);
    ctx.beginPath();
    for(let i=0;i<=sides;i++){
      const a = i/sides*Math.PI*2;
      const rr = r*(1+0.06*Math.sin(i*3));
      const x = rr*Math.cos(a), y=rr*Math.sin(a);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle = `hsla(${hue}, 65%, ${55+waterChem*0.15}%, 0.55)`;
    ctx.fill();
    ctx.strokeStyle = `hsla(${hue}, 70%, 80%, 0.9)`; ctx.lineWidth=1.4; ctx.stroke();
    // internal facet lines
    ctx.strokeStyle='rgba(255,255,255,0.35)';
    for(let i=0;i<sides;i+=2){
      const a = i/sides*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(r*Math.cos(a), r*Math.sin(a)); ctx.stroke();
    }
    ctx.restore();
  }

  function grow(){
    growing=true; growth=0;
    const step = ()=>{
      growth += 0.04 + (coolingRate/100)*0.03;
      draw();
      if(growth<1) requestAnimationFrame(step);
      else { growing=false; recordGrowth(); }
    };
    step();
  }

  function recordGrowth(){
    const size = EL.clamp(30-coolingRate*0.25,4,28);
    EL.logObservation(root, ['Growth complete', `Cooling ${coolingRate}%`, size.toFixed(1)+'mm crystals', `Temp ${temperature}% / Pressure ${pressure}%`]);
    history.push({trial:history.length+1, coolingRate, size, temperature, pressure});
    updateData(); EL.addXP(3);
  }

  function updateData(){
    const chart = document.getElementById('dataChart');
    const growthRows = history.filter(h=>h.size!==undefined);
    if(chart && growthRows.length){
      EL.drawLineChart(chart, [{data:growthRows.map(r=>({y:r.size})), color:'#6A3FA0', fill:true}], {decimals:1, xLabels:growthRows.map(r=>'#'+r.trial)});
    }
    const tableHost = document.getElementById('dataTableHost');
    if(tableHost){
      const idRows = history.filter(h=>h.target);
      tableHost.innerHTML = EL.buildTable(
        ['Trial','Type','Details','Result'],
        history.slice().reverse().map(r=> r.target
          ? [r.trial, 'Identification', `Guessed ${r.guess} for ${r.target}`, r.correct?'✅ Correct':'❌ Incorrect']
          : [r.trial, 'Crystal Growth', `Cooling ${r.coolingRate}%`, `${r.size.toFixed(1)} mm crystal size`])
      );
    }
  }

  function render(){
    const host = document.getElementById('controlsHost');
    host.innerHTML = `
      ${EL.slider({id:'temperature', label:'Temperature', min:0,max:100,step:1,value:temperature,unit:'%'})}
      ${EL.slider({id:'pressure', label:'Pressure', min:0,max:100,step:1,value:pressure,unit:'%'})}
      ${EL.slider({id:'coolingRate', label:'Cooling Rate', min:0,max:100,step:1,value:coolingRate,unit:'%'})}
      ${EL.slider({id:'waterChem', label:'Water Mineral Content', min:0,max:100,step:1,value:waterChem,unit:'%'})}
      <button class="btn primary" id="growBtn" style="width:100%; margin-top:6px;">💎 Grow Crystal</button>
      <p class="small muted" style="margin-top:10px;">Slow cooling → fewer, larger, well-formed crystals. Fast cooling → many small crystals.</p>
    `;
    EL.wireSlider(host,'temperature','%', v=>{temperature=v; draw();});
    EL.wireSlider(host,'pressure','%', v=>{pressure=v; draw();});
    EL.wireSlider(host,'coolingRate','%', v=>{coolingRate=v; draw();});
    EL.wireSlider(host,'waterChem','%', v=>{waterChem=v; draw();});
    host.querySelector('#growBtn').addEventListener('click', grow);
    document.getElementById('playbarHost').innerHTML='';
  }

  function reset(){ growth=0; history=[]; render(); draw(); updateData(); newSample(); }

  function mount(rootEl, EarthLab){
    root=rootEl; EL=EarthLab; canvas=root.querySelector('#simCanvas');
    render(); draw(); updateData();
    const stage = document.getElementById('simStage');
    stage.insertAdjacentHTML('beforeend', `<div class="obs-panel glass" id="mineralChallenge" style="max-height:none;"></div>`);
    newSample();
  }

  window.SimModules = window.SimModules || {};
  window.SimModules.minerals = {
    mount, reset,
    learn:{
      background:`Minerals are naturally occurring, inorganic solids with a defined chemical composition and an ordered internal crystal structure. Crystal size and shape depend heavily on how slowly a mineral crystallises: slow cooling deep underground allows large, well-formed crystals to grow, while rapid cooling at the surface produces many tiny crystals or even glass. Minerals are identified using physical properties: hardness, cleavage, lustre, colour, streak and density.`,
      realWorld:`Geologists use mineral identification to locate valuable ore deposits, gemologists use the same properties to grade gemstones, and material scientists apply crystal-growth principles to manufacture synthetic crystals for electronics.`,
      misconceptions:[
        'Colour alone is a poor way to identify most minerals — many minerals occur in a wide range of colours due to trace impurities.',
        'Hardness refers to resistance to scratching, not to how easily a mineral breaks — a mineral can be hard yet brittle.',
        'Cleavage and fracture are opposites — cleavage breaks along smooth, flat planes; fracture breaks unevenly.'],
      facts:[
        "The Mohs hardness scale, still used today, was devised in 1812 and ranks minerals from talc (1) to diamond (10).",
        'Streak (the colour of a mineral\'s powder) is often more reliable for identification than the mineral\'s outward colour.',
        'Pyrite is nicknamed "fool\'s gold" because its brassy colour and metallic lustre can be mistaken for real gold.'],
      summary:`Temperature, pressure, cooling rate and water chemistry control how minerals crystallise, while a consistent set of physical properties — hardness, cleavage, lustre, colour, streak and density — lets scientists reliably identify them.`
    },
    quiz:[
      {q:'Which condition produces LARGE, well-formed mineral crystals?', options:['Very fast cooling','Very slow cooling','No water present','High oxygen only'], correct:1, explain:'Slow cooling gives atoms more time to arrange into large, well-ordered crystals.'},
      {q:'What does a mineral\'s "streak" refer to?', options:['Its outward colour','The colour of its powder on a streak plate','Its hardness','Its density'], correct:1, explain:'Streak is the colour of the powdered mineral, which is often more diagnostic than its surface colour.'},
      {q:'A mineral that breaks along smooth, flat, repeating planes shows:', options:['Fracture','Cleavage','Streak','Lustre'], correct:1, explain:'Cleavage describes breakage along consistent planes of weakness in the crystal structure.'},
      {q:'On the Mohs hardness scale, a higher number means:', options:['Softer mineral','Harder mineral (more scratch-resistant)','Denser mineral','Shinier mineral'], correct:1, explain:'The Mohs scale ranks minerals by scratch resistance, with higher numbers meaning harder minerals.'},
      {q:'Why is colour alone considered unreliable for identifying most minerals?', options:['Minerals never have colour','Trace impurities can cause the same mineral to appear in many colours','Colour never changes','Only rare minerals have colour'], correct:1, explain:'Small chemical impurities can dramatically change a mineral\'s colour without changing what mineral it is.'}
    ]
  };
})();
