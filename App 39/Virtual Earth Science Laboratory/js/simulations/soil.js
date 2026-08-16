/* ==========================================================================
   Simulation 2 — Soil Formation Simulator
   ========================================================================== */
(function(){
  let hardness=55, temperature=60, rainfall=55, vegetation=50, organisms=50, time=0;
  let playing=false, raf=null;
  let history = [];
  let root, EL, canvas;

  const PRESETS = {
    tropical:  {hardness:35, temperature:85, rainfall:88, vegetation:90, organisms:85, name:'Tropical Rainforest'},
    grassland: {hardness:55, temperature:60, rainfall:55, vegetation:60, organisms:55, name:'Temperate Grassland'},
    desert:    {hardness:75, temperature:80, rainfall:10, vegetation:10, organisms:15, name:'Desert'},
    tundra:    {hardness:65, temperature:12, rainfall:35, vegetation:20, organisms:15, name:'Tundra'},
    wetland:   {hardness:30, temperature:55, rainfall:95, vegetation:75, organisms:70, name:'Wetland'},
  };

  function weatheringFactor(){
    return EL.clamp(((100-hardness)*0.5 + temperature*0.3 + rainfall*0.2)/100, 0.05, 1);
  }

  function horizons(){
    const D = 6 + time * weatheringFactor() * 0.9; // total developed depth (cm)
    const O = EL.clamp(1 + vegetation*0.07, 0, 9);
    const leach = rainfall>55 && vegetation>45;
    const E = leach ? D*0.09 : 0;
    const A = D * (0.16 + organisms*0.0022 + vegetation*0.0012);
    const B = D * (0.34 + rainfall*0.0018);
    const usedSoFar = A+E+B;
    const C = Math.max(D - usedSoFar, 3);
    return {O,A,E,B,C, total:O+A+E+B+C};
  }

  function draw(){
    const ctx = EL.fitCanvas(canvas, 420);
    const w = canvas.clientWidth, h=420;
    ctx.clearRect(0,0,w,h);

    // sky
    const skyH = 70;
    const grad = ctx.createLinearGradient(0,0,0,skyH);
    grad.addColorStop(0,'#1B3A2B'); grad.addColorStop(1,'#2F6B4F');
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,skyH);

    // vegetation on surface
    const vCount = Math.round(vegetation/8);
    for(let i=0;i<vCount;i++){
      const x = 20 + i*(w-40)/Math.max(vCount-1,1);
      ctx.fillStyle = '#43A047';
      ctx.beginPath(); ctx.moveTo(x,skyH); ctx.lineTo(x-7,skyH+16); ctx.lineTo(x+7,skyH+16); ctx.closePath(); ctx.fill();
    }

    const hz = horizons();
    const maxDepthPx = h - skyH - 10;
    const scale = maxDepthPx / Math.max(hz.total, 40);
    let y = skyH;
    const layers = [
      {key:'O', color:'#5B3A1A', label:'O — Organic litter'},
      {key:'E', color:'#D8C9A0', label:'E — Leached (eluviation)'},
      {key:'A', color:'#3E2A1A', label:'A — Topsoil'},
      {key:'B', color:'#8A5A2E', label:'B — Subsoil (illuviation)'},
      {key:'C', color:'#B08D57', label:'C — Weathered parent material'},
    ];
    ctx.font='12px sans-serif';
    layers.forEach(L=>{
      const val = hz[L.key];
      if(val<=0.2) return;
      const ph = val*scale;
      ctx.fillStyle = L.color;
      ctx.fillRect(0,y,w,ph);
      // texture dots
      ctx.fillStyle='rgba(0,0,0,0.12)';
      for(let i=0;i<ph/6;i++){
        ctx.beginPath(); ctx.arc(Math.random()*w, y+Math.random()*ph, 1.4,0,Math.PI*2); ctx.fill();
      }
      if(ph>14){
        ctx.fillStyle='rgba(255,255,255,0.85)';
        ctx.fillText(`${L.label}  (${val.toFixed(1)} cm)`, 12, y+ph/2+4);
      }
      y += ph;
    });
    // bedrock R
    ctx.fillStyle = '#4B4F52';
    ctx.fillRect(0,y,w,h-y);
    for(let i=0;i<40;i++){
      ctx.fillStyle='rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.arc(Math.random()*w, y+Math.random()*(h-y), 6+Math.random()*10,0,Math.PI*2); ctx.fill();
    }
    ctx.fillStyle='#fff'; ctx.fillText('R — Bedrock', 12, y+18);

    // depth ruler
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='10px sans-serif';
    ctx.beginPath(); ctx.moveTo(w-30,skyH); ctx.lineTo(w-30,h-6); ctx.stroke();
    for(let d=0; d<=hz.total; d+=Math.max(10,Math.round(hz.total/6))){
      const yy = skyH + d*scale;
      ctx.beginPath(); ctx.moveTo(w-34,yy); ctx.lineTo(w-26,yy); ctx.stroke();
      ctx.fillText(d.toFixed(0)+'cm', w-24, yy+3);
    }
  }

  function stepTime(dt){
    time = EL.clamp(time+dt, 0, 100);
    document.getElementById('timeVal').textContent = time.toFixed(0)+' yrs×100';
    document.getElementById('time').value = time;
    draw();
  }

  function loop(){
    if(!playing) return;
    stepTime(0.6);
    if(time>=100){ playing=false; EL.toast('Simulation reached 10,000 simulated years'); return; }
    raf = requestAnimationFrame(loop);
  }

  function record(){
    const hz = horizons();
    const row = {t:time, ...hz};
    history.push(row);
    if(history.length>30) history.shift();
    EL.logObservation(root, [`t=${time.toFixed(0)}`,'Soil depth', hz.total.toFixed(1)+' cm', `A:${hz.A.toFixed(1)} B:${hz.B.toFixed(1)} C:${hz.C.toFixed(1)}`]);
    updateData();
    EL.addXP(3);
  }

  function updateData(){
    const chart = document.getElementById('dataChart');
    if(chart && history.length){
      EL.drawLineChart(chart, [
        {data:history.map(r=>({y:r.total})), color:'#43A047', fill:true},
        {data:history.map(r=>({y:r.A})), color:'#FFB300'}
      ], {decimals:1, xLabels:history.map(r=>'t'+r.t.toFixed(0))});
    }
    const tableHost = document.getElementById('dataTableHost');
    if(tableHost){
      tableHost.innerHTML = EL.buildTable(
        ['Time','O (cm)','E (cm)','A (cm)','B (cm)','C (cm)','Total Depth'],
        history.slice().reverse().map(r=>[r.t.toFixed(0), r.O.toFixed(1), r.E.toFixed(1), r.A.toFixed(1), r.B.toFixed(1), r.C.toFixed(1), r.total.toFixed(1)])
      );
    }
  }

  function applyPreset(key){
    const p = PRESETS[key];
    hardness=p.hardness; temperature=p.temperature; rainfall=p.rainfall; vegetation=p.vegetation; organisms=p.organisms;
    render(); draw();
    EL.toast(`Preset applied: ${p.name}`);
  }

  function render(){
    const host = document.getElementById('controlsHost');
    host.innerHTML = `
      <div class="control">
        <div class="row"><span>Environment Presets</span></div>
        <select id="presetSel">
          <option value="">— Custom —</option>
          ${Object.entries(PRESETS).map(([k,p])=>`<option value="${k}">${p.name}</option>`).join('')}
        </select>
      </div>
      ${EL.slider({id:'hardness', label:'Parent Rock Hardness', min:0,max:100,step:1,value:hardness,unit:'%'})}
      ${EL.slider({id:'temperature', label:'Climate Temperature', min:0,max:100,step:1,value:temperature,unit:'%'})}
      ${EL.slider({id:'rainfall', label:'Rainfall', min:0,max:100,step:1,value:rainfall,unit:'%'})}
      ${EL.slider({id:'vegetation', label:'Vegetation Cover', min:0,max:100,step:1,value:vegetation,unit:'%'})}
      ${EL.slider({id:'organisms', label:'Organism Activity', min:0,max:100,step:1,value:organisms,unit:'%'})}
      ${EL.slider({id:'time', label:'Elapsed Time', min:0,max:100,step:1,value:time,unit:' (×100 yrs)'})}
      <button class="btn primary" id="recordBtn" style="width:100%; margin-top:4px;">📌 Record Snapshot</button>
    `;
    host.querySelector('#presetSel').addEventListener('change', e=>{ if(e.target.value) applyPreset(e.target.value); });
    EL.wireSlider(host,'hardness','%', v=>{hardness=v; draw();});
    EL.wireSlider(host,'temperature','%', v=>{temperature=v; draw();});
    EL.wireSlider(host,'rainfall','%', v=>{rainfall=v; draw();});
    EL.wireSlider(host,'vegetation','%', v=>{vegetation=v; draw();});
    EL.wireSlider(host,'organisms','%', v=>{organisms=v; draw();});
    EL.wireSlider(host,'time',' (×100 yrs)', v=>{time=v; draw();});
    host.querySelector('#recordBtn').addEventListener('click', record);

    EL.playbar(document.getElementById('playbarHost'), {
      onPlay:()=>{ playing=true; loop(); },
      onPause:()=>{ playing=false; cancelAnimationFrame(raf); },
      onStep:()=> stepTime(5),
      onStepBack:()=> stepTime(-5)
    });
  }

  function reset(){ time=0; history=[]; playing=false; cancelAnimationFrame(raf); render(); draw(); updateData(); }

  function mount(rootEl, EarthLab){
    root=rootEl; EL=EarthLab; canvas = root.querySelector('#simCanvas');
    render(); draw(); updateData();
  }

  window.SimModules = window.SimModules || {};
  window.SimModules.soil = {
    mount, reset,
    learn:{
      background:`Soil forms as bedrock weathers and mixes with organic matter over long timescales. Five main factors control the result: parent material, climate, organisms, relief (topography) and time — often remembered by the acronym CLORPT. As soil matures it organises into distinct horizons.`,
      realWorld:`Understanding soil formation guides agriculture (choosing crops suited to soil depth and fertility), construction (foundation stability), and environmental management (predicting erosion risk on bare or degraded land).`,
      misconceptions:[
        'Soil is not just "dirt" — it is a structured, layered system that can take centuries to millennia to develop.',
        'More rainfall does not always mean better soil — heavy rainfall can leach away nutrients (the E horizon) even as it deepens the profile.',
        'Deserts do form soil, just very slowly and typically without a thick organic A horizon.'],
      facts:[
        'It can take over 500 years to form just 2–3 cm of fertile topsoil under natural conditions.',
        'The letter naming system (O, A, E, B, C, R) is used by soil scientists worldwide.',
        'Tropical rainforest soils are often surprisingly nutrient-poor because heavy rain leaches minerals away quickly.'],
      summary:`Soil horizons develop from bedrock through weathering, organic accumulation and leaching. Climate, vegetation, organisms, parent rock and time interact to determine how deep and how fertile a soil profile becomes — which is why identical bedrock can produce very different soils in different environments.`
    },
    quiz:[
      {q:'Which soil horizon is made up mostly of organic litter such as leaves and decomposing plant matter?', options:['O horizon','B horizon','C horizon','R horizon'], correct:0, explain:'The O horizon sits at the very top and is dominated by organic material.'},
      {q:'A region has very high rainfall and dense vegetation. What is likely to happen to the E horizon?', options:['It disappears completely','It becomes more prominent due to leaching','It turns into bedrock','It becomes the topsoil'], correct:1, explain:'High rainfall increases leaching (eluviation), which is exactly what forms a pronounced E horizon.'},
      {q:'Which factor is NOT one of the five classic controls on soil formation (CLORPT)?', options:['Climate','Organisms','Population','Time'], correct:2, explain:'CLORPT stands for Climate, Organisms, Relief, Parent material and Time — population is not a factor.'},
      {q:'Why do desert environments typically develop very thin soil?', options:['Too much vegetation','Too little rainfall and organic input', 'Too much organism activity','Bedrock is too soft'], correct:1, explain:'Low rainfall and sparse vegetation slow both weathering and organic matter accumulation.'},
      {q:'The C horizon mainly represents:', options:['Solid, unweathered bedrock','Pure organic matter','Weathered parent material, partially broken down','Leached, nutrient-poor soil'], correct:2, explain:'The C horizon sits just above bedrock and consists of parent rock that has started to weather.'}
    ]
  };
})();
