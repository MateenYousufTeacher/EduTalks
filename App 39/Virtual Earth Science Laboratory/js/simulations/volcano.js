/* ==========================================================================
   Simulation 7 — Volcano Formation Laboratory
   ========================================================================== */
(function(){
  let silica=25, gas=25, boundary='hotspot';
  let eruptions=0, history=[];
  let erupting=false, eruptFrame=0;
  let root, EL, canvas;

  function viscosity(){ return EL.clamp(silica*0.7+gas*0.3, 0,100); }
  function vei(){ return EL.clamp(Math.round((silica*0.5+gas*0.5)/12.5), 0, 8); }

  function volcanoType(){
    const v = viscosity();
    if(v<35) return {name:'Shield Volcano', desc:'Broad, gently-sloping — built from fluid, low-viscosity lava flows.'};
    if(v<65) return {name:'Composite (Strato) Volcano', desc:'Steep-sided cone built from alternating layers of lava and ash.'};
    return {name:'Cinder Cone', desc:'Small, steep cone built almost entirely from explosively ejected fragments (tephra).'};
  }

  function draw(){
    const ctx = EL.fitCanvas(canvas, 420);
    const w = canvas.clientWidth, h=420;
    ctx.clearRect(0,0,w,h);
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#1B3A2B'); g.addColorStop(1,'#0E1712');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);

    const type = volcanoType();
    const baseY = h*0.86, cx=w/2;
    const heightPx = 60 + Math.min(eruptions,20)*10;
    const v = viscosity();
    const slopeFactor = v/100; // steeper with higher viscosity
    const baseHalfWidth = (1-slopeFactor)*220 + 70;

    // volcano body layers (built from eruption history)
    const layerN = Math.max(eruptions,1);
    for(let i=0;i<layerN;i++){
      const frac = (i+1)/layerN;
      const y = baseY - heightPx*frac;
      const hw = baseHalfWidth*(1-frac*0.92);
      ctx.beginPath();
      ctx.moveTo(cx-baseHalfWidth, baseY);
      ctx.lineTo(cx-hw, y);
      ctx.lineTo(cx+hw, y);
      ctx.lineTo(cx+baseHalfWidth, baseY);
      ctx.closePath();
      ctx.fillStyle = i%2===0 ? '#4B4F52' : '#3A2E22';
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha=1;
    }
    // ground
    ctx.fillStyle='#16261C'; ctx.fillRect(0,baseY,w,h-baseY);

    // summit / crater
    const topY = baseY-heightPx, topHW = baseHalfWidth*0.08+6;
    ctx.beginPath();
    ctx.moveTo(cx-topHW*2, topY+10); ctx.lineTo(cx-topHW,topY); ctx.lineTo(cx+topHW,topY); ctx.lineTo(cx+topHW*2, topY+10);
    ctx.strokeStyle='#D64545'; ctx.lineWidth=2; ctx.stroke();

    if(erupting){
      eruptFrame += 1;
      if(type.name==='Shield Volcano'){
        // lava flows down sides
        ctx.strokeStyle='rgba(255,90,0,0.85)'; ctx.lineWidth=4;
        for(let s=-1;s<=1;s+=2){
          ctx.beginPath();
          ctx.moveTo(cx+s*topHW, topY+4);
          const reach = Math.min(eruptFrame*3, baseHalfWidth*0.9);
          ctx.lineTo(cx+s*(topHW+reach*0.8), baseY-6);
          ctx.stroke();
        }
      } else if(type.name.startsWith('Composite')){
        // ash cloud + some lava
        ctx.fillStyle='rgba(90,90,90,0.5)';
        const cloudR = Math.min(eruptFrame*2, 90);
        ctx.beginPath(); ctx.ellipse(cx, topY-cloudR*0.5, cloudR, cloudR*0.6,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(255,90,0,0.6)'; ctx.lineWidth=3;
        ctx.beginPath(); ctx.moveTo(cx-topHW,topY+4); ctx.lineTo(cx-topHW*3, baseY-10); ctx.stroke();
      } else {
        // cinder cone: ejected particles
        ctx.fillStyle='rgba(214,69,69,0.85)';
        for(let i=0;i<14;i++){
          const t = (eruptFrame*0.05+i/14)%1;
          const ang = -Math.PI/2 + (i-7)*0.12;
          const dist = t*90;
          ctx.beginPath(); ctx.arc(cx+dist*Math.cos(ang), topY-dist*Math.sin(ang)*1.2, 3,0,Math.PI*2); ctx.fill();
        }
      }
      if(eruptFrame>60){ erupting=false; eruptFrame=0; }
      else requestAnimationFrame(draw);
    }

    ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif';
    ctx.fillText(`${type.name} — Eruptions: ${eruptions}  ·  Est. VEI ${vei()}`, 14, 22);
    ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText(`Viscosity ${v.toFixed(0)}%  ·  Silica ${silica}%  ·  Gas ${gas}%  ·  Boundary: ${boundary}`, 14, 40);
  }

  function erupt(){
    eruptions++;
    erupting=true; eruptFrame=0;
    const type = volcanoType();
    history.push({n:eruptions, type:type.name, vei:vei(), silica, gas});
    if(history.length>30) history.shift();
    EL.logObservation(root, [`Eruption ${eruptions}`, type.name, `VEI ${vei()}`, `Silica ${silica}% / Gas ${gas}%`]);
    updateData(); EL.addXP(4);
    draw();
  }

  function updateData(){
    const chart = document.getElementById('dataChart');
    if(chart && history.length){
      EL.drawLineChart(chart, [{data:history.map(r=>({y:r.vei})), color:'#D64545', fill:true}], {decimals:0, minY:0, maxY:8, xLabels:history.map(r=>'E'+r.n)});
    }
    const tableHost = document.getElementById('dataTableHost');
    if(tableHost){
      tableHost.innerHTML = EL.buildTable(
        ['Eruption #','Volcano Type','Est. VEI','Silica %','Gas %'],
        history.slice().reverse().map(r=>[r.n, r.type, r.vei, r.silica, r.gas])
      );
    }
  }

  function render(){
    const host = document.getElementById('controlsHost');
    host.innerHTML = `
      ${EL.slider({id:'silica', label:'Magma Silica Content', min:0,max:100,step:1,value:silica,unit:'%'})}
      ${EL.slider({id:'gas', label:'Dissolved Gas Content', min:0,max:100,step:1,value:gas,unit:'%'})}
      ${EL.segmented({id:'boundarySel', label:'Plate Boundary Setting', active:['hotspot','divergent','convergent'].indexOf(boundary), options:[
        {v:'hotspot', label:'Hotspot'},{v:'divergent', label:'Divergent'},{v:'convergent', label:'Convergent'}
      ]})}
      <button class="btn amber" id="eruptBtn" style="width:100%; margin-top:6px;">🌋 Erupt</button>
      <p class="small muted" style="margin-top:10px;">Higher silica and gas content increase magma viscosity, making eruptions more explosive and volcanoes steeper.</p>
    `;
    EL.wireSlider(host,'silica','%', v=>{silica=v; draw();});
    EL.wireSlider(host,'gas','%', v=>{gas=v; draw();});
    EL.wireSegmented(host,'boundarySel', v=>{boundary=v; draw();});
    host.querySelector('#eruptBtn').addEventListener('click', erupt);
    document.getElementById('playbarHost').innerHTML='';
  }

  function reset(){ eruptions=0; history=[]; erupting=false; render(); draw(); updateData(); }
  function mount(rootEl, EarthLab){ root=rootEl; EL=EarthLab; canvas=root.querySelector('#simCanvas'); render(); draw(); updateData(); }

  window.SimModules = window.SimModules || {};
  window.SimModules.volcano = {
    mount, reset,
    learn:{
      background:`A volcano's shape and eruption style depend mainly on magma viscosity, which is controlled by silica content and dissolved gas. Low-silica (mafic) magma is runny and erupts effusively, building broad shield volcanoes. High-silica (felsic) magma is thick and gas-rich, trapping pressure until it erupts explosively, building steep composite volcanoes. Small, short-lived eruptions of ejected fragments build cinder cones.`,
      realWorld:`Volcanologists monitor gas emissions and ground deformation to forecast eruption style and warn nearby communities; understanding volcano type also guides land-use planning around active volcanoes.`,
      misconceptions:[
        'Not all volcanoes are steep, explosive cones — shield volcanoes like those in Hawaii are broad and gently sloping.',
        'Gas content, not just silica, plays a major role in how explosive an eruption is — gas provides the driving pressure.',
        'A volcano can be dormant for centuries and still be capable of erupting again.'],
      facts:[
        "Mauna Loa in Hawaii is one of the largest shield volcanoes on Earth, built almost entirely from fluid basaltic lava.",
        'The 1991 eruption of Mount Pinatubo (a composite volcano) injected enough sulphur aerosols into the atmosphere to cool global temperatures for over a year.',
        'Cinder cones can form and reach much of their final size within just a few weeks of eruption.'],
      summary:`Magma composition and gas content control viscosity, and viscosity controls whether a volcano erupts gently or explosively — and whether it builds into a broad shield, a steep composite cone, or a small cinder cone.`
    },
    quiz:[
      {q:'Which type of volcano is built from low-viscosity, fast-flowing lava?', options:['Cinder cone','Composite volcano','Shield volcano','None of these'], correct:2, explain:'Shield volcanoes form from fluid, low-silica lava that spreads out into broad, gentle slopes.'},
      {q:'High silica content in magma generally leads to:', options:['Lower viscosity and gentle eruptions','Higher viscosity and more explosive eruptions','No change in eruption style','Only affects colour of lava'], correct:1, explain:'High silica magma is thick and sticky (high viscosity), trapping gas until pressure builds and erupts explosively.'},
      {q:'What mainly provides the explosive "driving force" in a volcanic eruption?', options:['Dissolved gas expanding','Cold temperatures','Low pressure at the surface only','Magnetism'], correct:0, explain:'Dissolved gases expand rapidly as magma rises and pressure drops, driving explosive eruptions.'},
      {q:'A cinder cone is mainly built from:', options:['Fluid lava flows only','Ejected fragments (tephra) from a single eruptive episode','Layers deposited over millions of years','Metamorphic rock'], correct:1, explain:'Cinder cones build up quickly from cinders and other pyroclastic fragments ejected during eruption.'},
      {q:'Composite (strato) volcanoes are typically found at which plate setting?', options:['Mid-ocean ridges only','Convergent (subduction) boundaries','The centre of stable continents only','Nowhere near plate boundaries'], correct:1, explain:'Composite volcanoes commonly form above subduction zones at convergent plate boundaries.'}
    ]
  };
})();
