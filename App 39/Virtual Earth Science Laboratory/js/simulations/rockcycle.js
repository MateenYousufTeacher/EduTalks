/* ==========================================================================
   Simulation 1 — Rock Cycle Laboratory
   ========================================================================== */
(function(){
  const STAGES = ['magma','igneous','sediment','sedimentary','metamorphic'];
  const LABELS = { magma:'Magma', igneous:'Igneous Rock', sediment:'Loose Sediment', sedimentary:'Sedimentary Rock', metamorphic:'Metamorphic Rock' };
  const COLORS = { magma:'#D64545', igneous:'#8A5A2E', sediment:'#C9A874', sedimentary:'#B08D57', metamorphic:'#6A5B8C' };

  const PROCESSES = {
    melt:            {label:'🔥 Melting',                    from:['igneous','sedimentary','metamorphic'], to:'magma'},
    cool:            {label:'❄️ Cooling & Crystallisation',   from:['magma'], to:'igneous'},
    weather:         {label:'🌧️ Weathering & Erosion',        from:['igneous','sedimentary','metamorphic'], to:'sediment'},
    compact:         {label:'🧱 Compaction & Cementation',    from:['sediment'], to:'sedimentary'},
    metamorphose:    {label:'🌡️ Heat & Pressure',             from:['igneous','sedimentary'], to:'metamorphic'},
  };

  let stage = 'magma';
  let heat=70, pressure=40, coolingRate=30, weatheringRate=50, erosionRate=50;
  let history = [];
  let step = 0;
  let selectedProcess = 'cool';
  let animT = 0, animating = false, animFrom=null, animTo=null;
  let raf = null;
  let ctx, canvas, root, EL;

  function reset(){
    stage='magma'; history=[]; step=0; heat=70; pressure=40; coolingRate=30; weatheringRate=50; erosionRate=50;
    render();
    draw();
  }

  function applyProcess(){
    const proc = PROCESSES[selectedProcess];
    if(!proc.from.includes(stage)){
      EL.toast(`${proc.label} cannot be applied to ${LABELS[stage]} — check the rock cycle diagram.`);
      return;
    }
    animFrom = stage; animTo = proc.to; animT = 0; animating = true;
    step++;
    let variable = '', value='';
    if(selectedProcess==='cool'){ variable='Cooling rate'; value = coolingRate<33?'Slow (large crystals)':coolingRate<66?'Medium':'Fast (fine crystals)'; }
    else if(selectedProcess==='melt'){ variable='Heat'; value = heat+'%'; }
    else if(selectedProcess==='weather'){ variable='Weathering + Erosion'; value = `${weatheringRate}% / ${erosionRate}%`; }
    else if(selectedProcess==='compact'){ variable='Pressure'; value = pressure+'%'; }
    else if(selectedProcess==='metamorphose'){ variable='Heat + Pressure'; value = `${heat}% / ${pressure}%`; }

    history.unshift({step, process:proc.label, result:LABELS[proc.to], variable, value});
    if(history.length>25) history.pop();
    EL.logObservation(root, [`Step ${step}`, proc.label, value, `→ ${LABELS[proc.to]}`]);

    setTimeout(()=>{
      stage = proc.to;
      animating = false;
      EL.addXP(4);
      updateDataTab();
      render();
    }, 700);
  }

  function grainSizeFor(){
    // smaller coolingRate (slow) -> larger crystals
    return EL.clamp(Math.round(28 - coolingRate*0.22), 3, 26);
  }

  function draw(){
    if(!canvas) return;
    ctx = EL.fitCanvas(canvas, 420);
    const w = canvas.clientWidth, h = 420;
    ctx.clearRect(0,0,w,h);

    const cx = w*0.36, cy = h/2, R = Math.min(w*0.30, h*0.36);
    const angle0 = -Math.PI/2;
    const positions = {};
    STAGES.forEach((s,i)=>{
      const a = angle0 + i*(2*Math.PI/STAGES.length);
      positions[s] = {x: cx + R*Math.cos(a), y: cy + R*Math.sin(a)};
    });

    // wheel arrows (rock-cycle sequence for the ring)
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 2;
    const ring = ['magma','igneous','sediment','sedimentary','metamorphic'];
    for(let i=0;i<ring.length;i++){
      const a = positions[ring[i]], b = positions[ring[(i+1)%ring.length]];
      drawArrow(ctx, a.x,a.y,b.x,b.y, 'rgba(255,255,255,0.22)');
    }
    // shortcuts (melt from any, metamorphose from igneous/sedimentary)
    drawArrow(ctx, positions.sedimentary.x, positions.sedimentary.y, positions.metamorphic.x, positions.metamorphic.y, 'rgba(255,179,0,0.35)', true);
    drawArrow(ctx, positions.igneous.x, positions.igneous.y, positions.metamorphic.x, positions.metamorphic.y, 'rgba(255,179,0,0.25)', true);
    STAGES.filter(s=>s!=='magma').forEach(s=>{
      drawArrow(ctx, positions[s].x, positions[s].y, positions.magma.x, positions.magma.y, 'rgba(214,69,69,0.18)', true);
    });

    // nodes
    STAGES.forEach(s=>{
      const p = positions[s];
      const active = s===stage;
      ctx.beginPath();
      ctx.arc(p.x,p.y, active?30:24, 0, Math.PI*2);
      ctx.fillStyle = COLORS[s];
      ctx.globalAlpha = active?1:0.55;
      ctx.fill();
      if(active){ ctx.lineWidth=3; ctx.strokeStyle='#FFB300'; ctx.stroke(); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#F3F7F5';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(LABELS[s].split(' ')[0], p.x, p.y+40);
    });

    // moving marker during animation
    if(animating && animFrom && animTo){
      const a = positions[animFrom], b = positions[animTo];
      const t = animT;
      const mx = a.x + (b.x-a.x)*t, my = a.y + (b.y-a.y)*t;
      ctx.beginPath(); ctx.arc(mx,my,8,0,Math.PI*2); ctx.fillStyle='#FFB300'; ctx.fill();
      animT += 0.06;
      if(animT<1) requestAnimationFrame(draw);
    }

    // rock sample close-up panel (right side)
    const px = w*0.72, py = h*0.5, pr = Math.min(w*0.22,150);
    ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.stroke();
    ctx.save();
    ctx.beginPath(); ctx.arc(px,py,pr-6,0,Math.PI*2); ctx.clip();
    ctx.fillStyle = COLORS[stage]; ctx.fillRect(px-pr,py-pr,pr*2,pr*2);
    drawTexture(ctx, stage, px,py,pr);
    ctx.restore();
    ctx.fillStyle='#F3F7F5'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText(LABELS[stage], px, py+pr+26);
    ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.fillText('Current sample — Step '+step, px, py+pr+44);
  }

  function drawTexture(ctx, stage, px,py,pr){
    if(stage==='igneous'){
      const g = grainSizeFor();
      for(let i=0;i<40;i++){
        const a = Math.random()*Math.PI*2, r = Math.random()*pr;
        ctx.beginPath();
        ctx.arc(px+r*Math.cos(a), py+r*Math.sin(a), g*0.18+1, 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,0,0,${0.15+Math.random()*0.2})`;
        ctx.fill();
      }
    } else if(stage==='sediment'){
      for(let i=0;i<60;i++){
        const x = px-pr+Math.random()*pr*2, y = py-pr+Math.random()*pr*2;
        ctx.beginPath(); ctx.arc(x,y,3+Math.random()*3,0,Math.PI*2);
        ctx.fillStyle='rgba(80,55,25,0.5)'; ctx.fill();
      }
    } else if(stage==='sedimentary'){
      ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.lineWidth=3;
      for(let y=py-pr;y<py+pr;y+=10){
        ctx.beginPath(); ctx.moveTo(px-pr,y+Math.sin(y)*3); ctx.lineTo(px+pr,y-Math.sin(y)*3); ctx.stroke();
      }
    } else if(stage==='metamorphic'){
      ctx.strokeStyle='rgba(255,255,255,0.28)'; ctx.lineWidth=3;
      for(let i=-pr;i<pr;i+=9){
        ctx.beginPath();
        ctx.moveTo(px-pr, py+i);
        ctx.bezierCurveTo(px-pr/2, py+i+14, px+pr/2, py+i-14, px+pr, py+i);
        ctx.stroke();
      }
    } else if(stage==='magma'){
      for(let i=0;i<10;i++){
        const x = px-pr+Math.random()*pr*2, y=py-pr+Math.random()*pr*2;
        ctx.beginPath(); ctx.arc(x,y,10+Math.random()*14,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,${100+Math.random()*80},0,0.35)`; ctx.fill();
      }
    }
  }

  function drawArrow(ctx,x1,y1,x2,y2,color,curve){
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth=2;
    const mx=(x1+x2)/2, my=(y1+y2)/2;
    ctx.beginPath();
    if(curve){
      const dx=y1-y2, dy=x2-x1, len=Math.hypot(dx,dy)||1;
      const cx = mx + dx/len*24, cy = my + dy/len*24;
      ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cx,cy,x2,y2);
    } else {
      ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
    }
    ctx.stroke();
    const ang = Math.atan2(y2-my>0?y2-y1:y2-y1, x2-x1);
    ctx.save(); ctx.translate(x2,y2); ctx.rotate(Math.atan2(y2-y1,x2-x1));
    ctx.beginPath(); ctx.moveTo(-8,-5); ctx.lineTo(0,0); ctx.lineTo(-8,5); ctx.stroke();
    ctx.restore();
  }

  function updateDataTab(){
    const chart = document.getElementById('dataChart');
    if(chart){
      const data = history.slice().reverse().map((h,i)=>({y:i}));
      EL.drawLineChart(chart, [{data:history.slice().reverse().map((h,i)=>({y:i+1})), color:'#43A047', fill:true}], {decimals:0, xLabels:history.slice().reverse().map(h=>'S'+h.step)});
    }
    const tableHost = document.getElementById('dataTableHost');
    if(tableHost){
      tableHost.innerHTML = EL.buildTable(
        ['Step','Process Applied','Key Variable','Resulting Rock'],
        history.map(h=>[h.step,h.process,h.value,h.result])
      );
    }
  }

  function render(){
    const host = document.getElementById('controlsHost');
    host.innerHTML = `
      ${EL.segmented({id:'procSel', label:'Select a Process', active:1, options:[
        {v:'melt', label:'Melt'},{v:'cool', label:'Cool'},{v:'weather', label:'Weather'},{v:'compact', label:'Compact'},{v:'metamorphose', label:'Heat+Pressure'}
      ]})}
      ${EL.slider({id:'heat', label:'Heat', min:0,max:100,step:1,value:heat, unit:'%'})}
      ${EL.slider({id:'pressure', label:'Pressure', min:0,max:100,step:1,value:pressure, unit:'%'})}
      ${EL.slider({id:'coolingRate', label:'Cooling Rate', min:0,max:100,step:1,value:coolingRate, unit:'%'})}
      ${EL.slider({id:'weatheringRate', label:'Weathering Rate', min:0,max:100,step:1,value:weatheringRate, unit:'%'})}
      ${EL.slider({id:'erosionRate', label:'Erosion Rate', min:0,max:100,step:1,value:erosionRate, unit:'%'})}
      <button class="btn primary" id="applyBtn" style="width:100%; margin-top:6px;">Apply Process ▶</button>
      <p class="small muted" style="margin-top:10px;">Current sample: <b style="color:var(--amber)">${LABELS[stage]}</b></p>
    `;
    EL.wireSegmented(host, 'procSel', v=> selectedProcess=v);
    EL.wireSlider(host,'heat','%', v=>heat=v);
    EL.wireSlider(host,'pressure','%', v=>pressure=v);
    EL.wireSlider(host,'coolingRate','%', v=>coolingRate=v);
    EL.wireSlider(host,'weatheringRate','%', v=>weatheringRate=v);
    EL.wireSlider(host,'erosionRate','%', v=>erosionRate=v);
    host.querySelector('#applyBtn').addEventListener('click', applyProcess);
    updateDataTab();
  }

  function mount(rootEl, EarthLab){
    root = rootEl; EL = EarthLab;
    canvas = root.querySelector('#simCanvas');
    document.getElementById('playbarHost').innerHTML = '<p class="small muted">Pick a process on the left, then press Apply to transform the sample.</p>';
    render();
    draw();
  }

  window.SimModules = window.SimModules || {};
  window.SimModules.rockcycle = {
    mount, reset,
    learn:{
      background:`Rocks are continually recycled between three families. Igneous rocks crystallise as magma or lava cools; sedimentary rocks form from compacted, cemented sediment produced by weathering and erosion of existing rock; metamorphic rocks form when any rock is subjected to heat and pressure without melting. Given enough heat, any rock can melt back into magma, restarting the cycle.`,
      realWorld:`Understanding the rock cycle helps geologists locate resources — for example, metallic ores associated with igneous intrusions, or fossil fuels trapped in sedimentary basins — and helps engineers judge how suitable a rock is as a building material.`,
      misconceptions:[
        'The rock cycle is not a single fixed loop — a rock can jump directly between families depending on the process applied to it.',
        'Slow cooling does not happen only underground for every igneous rock — the key factor is the rate of heat loss, not literally the location.',
        'Metamorphism changes texture and mineral structure without melting the rock; if it melts, it becomes magma instead.'],
      facts:[
        'The oldest dated mineral grains on Earth (zircons from Western Australia) are over 4.4 billion years old.',
        'Obsidian is natural glass — it cools so fast that no crystals have time to form at all.',
        'Marble is simply limestone that has been metamorphosed — both are chemically calcium carbonate.'],
      summary:`The rock cycle describes how igneous, sedimentary and metamorphic rocks continuously transform into one another through melting, cooling, weathering, erosion, compaction, cementation, heat and pressure — driven ultimately by Earth's internal heat and surface climate.`
    },
    quiz:[
      {q:'A rock forms as magma cools very slowly deep underground, producing large crystals. What type of rock is this?', options:['Sedimentary rock','Igneous rock with coarse grains','Igneous rock with fine grains','Metamorphic rock'], correct:1, explain:'Slow cooling allows more time for large crystals to grow, producing a coarse-grained igneous rock such as granite.'},
      {q:'Which pair of processes converts loose sediment into solid sedimentary rock?', options:['Melting and cooling','Weathering and erosion','Compaction and cementation','Heat and pressure'], correct:2, explain:'Compaction squeezes sediment grains together and cementation binds them with natural mineral cement.'},
      {q:'What happens to a rock when it is subjected to heat and pressure but does NOT melt?', options:['It becomes sediment','It becomes a metamorphic rock','It becomes magma','Nothing changes'], correct:1, explain:'Heat and pressure without melting recrystallises the rock into a metamorphic rock, such as slate or marble.'},
      {q:'Which process can take ANY rock type back to the start of the rock cycle?', options:['Weathering','Melting','Compaction','Cementation'], correct:1, explain:'Melting turns any rock into magma, from which new igneous rock can eventually crystallise.'},
      {q:'Obsidian has almost no visible crystals. What does this tell you about how it cooled?', options:['It cooled extremely slowly','It cooled extremely quickly','It was never molten','It formed from sediment'], correct:1, explain:'Very fast cooling leaves no time for crystals to grow, producing natural volcanic glass.'}
    ]
  };
})();
