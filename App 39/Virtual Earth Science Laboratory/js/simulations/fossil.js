/* ==========================================================================
   Simulation 5 — Fossil Formation Explorer
   ========================================================================== */
(function(){
  let fossilType='mold';
  let burialDepth=50, sedimentation=50, oxygen=40, pressure=50, time=50;
  let history=[];
  let root, EL, canvas;

  const IDEAL = {
    mold:      {depth:45, sedimentation:55, oxygen:35, pressure:45, time:50, name:'Mold & Cast'},
    petrified: {depth:70, sedimentation:60, oxygen:15, pressure:80, time:90, name:'Petrified Fossil'},
    trace:     {depth:20, sedimentation:85, oxygen:50, pressure:25, time:20, name:'Trace Fossil'},
    amber:     {depth:15, sedimentation:20, oxygen:10, pressure:20, time:60, name:'Amber Fossil'},
  };

  function quality(){
    const ideal = IDEAL[fossilType];
    const vals = {depth:burialDepth, sedimentation, oxygen, pressure, time};
    let totalDiff = 0, n=0;
    Object.keys(ideal).forEach(k=>{
      if(k==='name') return;
      totalDiff += Math.abs(vals[k]-ideal[k]); n++;
    });
    const avgDiff = totalDiff/n;
    return EL.clamp(100 - avgDiff*1.3, 0, 100);
  }

  function draw(){
    const ctx = EL.fitCanvas(canvas, 420);
    const w = canvas.clientWidth, h=420;
    ctx.clearRect(0,0,w,h);
    const skyH=50;
    ctx.fillStyle='#1B3A2B'; ctx.fillRect(0,0,w,skyH);

    const q = quality();
    // sediment layers, count grows with sedimentation & time
    const layerCount = Math.round(4 + (sedimentation/100)*(time/100)*10);
    const layerH = (h-skyH)/Math.max(layerCount,6);
    const organismLayer = Math.round((burialDepth/100)*layerCount*0.8)+1;

    for(let i=0;i<layerCount;i++){
      const y = skyH + i*layerH;
      const shade = 40 + i*3;
      ctx.fillStyle = `rgb(${90-i},${64-Math.min(i,40)},${40})`;
      ctx.fillStyle = i%2===0 ? '#6B4A32' : '#5B3D28';
      ctx.globalAlpha = 0.9;
      ctx.fillRect(0,y,w,layerH+1);
      ctx.globalAlpha=1;
    }

    // organism / fossil at its layer
    const oy = skyH + organismLayer*layerH;
    const ox = w*0.5;
    drawFossil(ctx, ox, oy, q);

    // groundwater mineral flecks if petrified & pressure high
    if(fossilType==='petrified'){
      ctx.fillStyle='rgba(38,198,218,0.25)';
      for(let i=0;i<30;i++){
        ctx.beginPath(); ctx.arc(Math.random()*w, skyH+Math.random()*(h-skyH), 1.6,0,Math.PI*2); ctx.fill();
      }
    }

    // labels
    ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif';
    ctx.fillText(`${IDEAL[fossilType].name} — Preservation quality: ${q.toFixed(0)}%`, 14, 24);
    ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText(q>70?'Excellent preservation conditions': q>40?'Fair preservation — some detail lost':'Poor conditions — little to no fossil forms', 14, 40);
  }

  function drawFossil(ctx, x, y, q){
    ctx.save(); ctx.translate(x,y);
    const detail = q/100;
    if(fossilType==='mold' || fossilType==='petrified'){
      // simple shell/skeleton silhouette
      ctx.strokeStyle = fossilType==='petrified' ? `rgba(180,${180*detail+40},200,${0.5+0.5*detail})` : `rgba(230,230,230,${0.3+0.5*detail})`;
      ctx.lineWidth=2.4;
      ctx.beginPath();
      for(let a=0;a<Math.PI*2;a+=0.3){
        const r = 22*detail + 4;
        ctx.lineTo(r*Math.cos(a)*0.8, r*Math.sin(a)*0.5);
      }
      ctx.closePath(); ctx.stroke();
      // spine/ribs
      ctx.beginPath(); ctx.moveTo(-24*detail,0); ctx.lineTo(24*detail,0); ctx.stroke();
      for(let i=-3;i<=3;i++){
        ctx.beginPath(); ctx.moveTo(i*7*detail,0); ctx.lineTo(i*7*detail, 10*detail*Math.sign(i||1)); ctx.stroke();
      }
    } else if(fossilType==='trace'){
      // footprints
      ctx.fillStyle = `rgba(255,255,255,${0.25+0.55*detail})`;
      for(let i=0;i<4;i++){
        ctx.beginPath();
        ctx.ellipse(i*22-33, (i%2)*10-5, 8*detail+2, 5*detail+2, 0.3,0,Math.PI*2);
        ctx.fill();
      }
    } else if(fossilType==='amber'){
      const r = 26;
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,179,0,${0.35+0.4*detail})`;
      ctx.fill();
      ctx.strokeStyle='rgba(255,200,80,0.7)'; ctx.stroke();
      ctx.fillStyle = `rgba(40,20,0,${0.4+0.5*detail})`;
      ctx.beginPath(); ctx.ellipse(0,0,8*detail+2,4*detail+1,0,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function record(){
    const q = quality();
    history.push({t:time, type:IDEAL[fossilType].name, depth:burialDepth, sedimentation, oxygen, pressure, q});
    if(history.length>30) history.shift();
    EL.logObservation(root, [`Trial ${history.length}`, IDEAL[fossilType].name, q.toFixed(0)+'% quality', `Depth ${burialDepth} O2 ${oxygen} P ${pressure}`]);
    updateData(); EL.addXP(q>70?6:3);
  }

  function updateData(){
    const chart = document.getElementById('dataChart');
    if(chart && history.length){
      EL.drawLineChart(chart, [{data:history.map(r=>({y:r.q})), color:'#43A047', fill:true}], {decimals:0, xLabels:history.map((r,i)=>'#'+(i+1)), minY:0, maxY:100});
    }
    const tableHost = document.getElementById('dataTableHost');
    if(tableHost){
      tableHost.innerHTML = EL.buildTable(
        ['Trial','Target Type','Depth','Sedimentation','Oxygen','Pressure','Quality %'],
        history.slice().reverse().map((r,i)=>[history.length-i, r.type, r.depth, r.sedimentation, r.oxygen, r.pressure, r.q.toFixed(0)])
      );
    }
  }

  function render(){
    const host = document.getElementById('controlsHost');
    host.innerHTML = `
      ${EL.segmented({id:'typeSel', label:'Target Fossil Type', active:['mold','petrified','trace','amber'].indexOf(fossilType), options:[
        {v:'mold', label:'Mold/Cast'},{v:'petrified', label:'Petrified'},{v:'trace', label:'Trace'},{v:'amber', label:'Amber'}
      ]})}
      ${EL.slider({id:'burialDepth', label:'Burial Depth', min:0,max:100,step:1,value:burialDepth,unit:'%'})}
      ${EL.slider({id:'sedimentation', label:'Sedimentation Rate', min:0,max:100,step:1,value:sedimentation,unit:'%'})}
      ${EL.slider({id:'oxygen', label:'Oxygen Availability', min:0,max:100,step:1,value:oxygen,unit:'%'})}
      ${EL.slider({id:'pressure', label:'Pressure', min:0,max:100,step:1,value:pressure,unit:'%'})}
      ${EL.slider({id:'time', label:'Geological Time', min:0,max:100,step:1,value:time,unit:'%'})}
      <button class="btn primary" id="recordBtn" style="width:100%;">📌 Record Trial</button>
      <p class="small muted" style="margin-top:10px;">Match the sliders to the target type's ideal conditions to maximise preservation quality.</p>
    `;
    EL.wireSegmented(host,'typeSel', v=>{ fossilType=v; draw(); });
    EL.wireSlider(host,'burialDepth','%', v=>{burialDepth=v; draw();});
    EL.wireSlider(host,'sedimentation','%', v=>{sedimentation=v; draw();});
    EL.wireSlider(host,'oxygen','%', v=>{oxygen=v; draw();});
    EL.wireSlider(host,'pressure','%', v=>{pressure=v; draw();});
    EL.wireSlider(host,'time','%', v=>{time=v; draw();});
    host.querySelector('#recordBtn').addEventListener('click', record);
    document.getElementById('playbarHost').innerHTML = '<p class="small muted">Adjust variables, then record a trial to log preservation quality.</p>';
  }

  function reset(){ history=[]; render(); draw(); updateData(); }
  function mount(rootEl, EarthLab){ root=rootEl; EL=EarthLab; canvas=root.querySelector('#simCanvas'); render(); draw(); updateData(); }

  window.SimModules = window.SimModules || {};
  window.SimModules.fossil = {
    mount, reset,
    learn:{
      background:`Fossilisation is rare — it requires an organism (or its traces) to be protected from decay and destruction long enough for preservation to occur. Rapid burial, low oxygen (which slows decomposition), and mineral-rich groundwater (which can replace original tissue) are the key ingredients. Different combinations of conditions produce different fossil types.`,
      realWorld:`Palaeontologists use fossil type and preservation quality to reconstruct ancient environments, and petroleum geologists use certain microfossils to date and correlate rock layers when searching for oil and gas.`,
      misconceptions:[
        'Fossilisation is not the default outcome of death — the vast majority of organisms decay completely and leave no fossil at all.',
        'Petrified wood is not wood that turned to stone by drying out — it is wood whose original structure was replaced, atom by atom, by dissolved minerals.',
        'Trace fossils (footprints, burrows) are still fossils even though no body part is preserved.'],
      facts:[
        'Amber can preserve insects in such fine detail that DNA fragments have (controversially) been reported from some specimens.',
        'The vast majority of dinosaur species are known from only a single, partial skeleton.',
        'Some trace fossils, like ancient burrows, can be older evidence of an environment than any bone found nearby.'],
      summary:`Fossilisation depends on a delicate balance of burial speed, oxygen levels, pressure and time. Matching these conditions to a specific pathway — mold and cast formation, petrification, trace fossil preservation, or amber entombment — determines what kind of fossil, if any, ultimately forms.`
    },
    quiz:[
      {q:'Why does low oxygen availability help preserve a dead organism?', options:['It slows down decomposition','It speeds up decomposition','It has no effect','It turns tissue into resin'], correct:0, explain:'Decomposer organisms generally need oxygen; low-oxygen environments slow decay, giving more time for fossilisation.'},
      {q:'Petrified wood forms when:', options:['Wood simply dries out and hardens','Original tissue is gradually replaced by dissolved minerals','Wood burns and turns to ash','Wood is compressed into coal'], correct:1, explain:'Mineral-rich groundwater slowly replaces the wood\'s original structure with minerals such as silica.'},
      {q:'A dinosaur footprint preserved in hardened mud is an example of a:', options:['Mold fossil','Cast fossil','Trace fossil','Amber fossil'], correct:2, explain:'Trace fossils record evidence of activity (footprints, burrows, trails) rather than body parts.'},
      {q:'Which condition is essential for amber fossils to form?', options:['Deep ocean burial','Tree resin trapping and hardening an organism','Extremely high pressure','Volcanic ash burial'], correct:1, explain:'Amber fossils form when an organism is trapped in sticky tree resin that later hardens into amber.'},
      {q:'Why are most organisms that die NOT eventually fossilised?', options:['Fossilisation always happens given enough time','Most remains are destroyed or decayed before burial can occur','Only large animals can fossilise','Oxygen always preserves remains perfectly'], correct:1, explain:'Fossilisation requires a rare combination of rapid burial and protection from decay — most remains never get this chance.'}
    ]
  };
})();
