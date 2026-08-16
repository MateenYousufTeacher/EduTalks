/* ============================================================
   SIM 7 — RIVER FORMATION & LANDFORMS LABORATORY
   ============================================================ */
registerSim('river-landforms', {
  objectives:[
    "Explain the processes of erosion, transportation and deposition.",
    "Identify landforms produced by rivers: valleys, meanders, floodplains, deltas.",
    "Relate slope, discharge and rock type to a river's erosive power.",
    "Describe how oxbow lakes form from meander cut-offs."
  ],
  intro:"Rivers are Earth's great sculptors — cutting valleys in the mountains and building deltas at the sea. Adjust slope, rainfall and rock type, then run time forward to watch a river carve and build landforms.",
  background:"In their upper course, steep gradients give rivers high energy, cutting narrow V-shaped valleys and waterfalls through erosion. In the middle course, reduced slope encourages sideways erosion, creating winding meanders. In the lower course, rivers deposit sediment across floodplains and build deltas where they meet standing water. Oxbow lakes form when a meander's neck is cut off, leaving a curved lake isolated from the main channel.",
  humanImpact:"Fertile floodplains and deltas support some of the world's most densely populated agricultural regions, but they are also vulnerable to flooding, requiring levees, dams and careful land-use planning.",
  realWorld:"Engineers study river processes to design flood defences, while farmers rely on seasonal floodplain deposits (like the Nile's) to naturally replenish soil fertility.",
  facts:[
    "The Amazon River discharges more water than the next seven largest rivers combined.",
    "Oxbow lakes can persist for centuries after being cut off from the main river channel.",
    "The Ganges-Brahmaputra delta is the largest river delta in the world.",
    "Rivers transport not just water but huge volumes of sediment — the Yellow River earns its name from suspended yellow silt."
  ],
  misconceptions:[
    "Rivers do not flow in straight lines naturally — meandering is the norm, not the exception, in the middle and lower course.",
    "Erosion and deposition happen simultaneously in different parts of the same river, not just at different times.",
    "A river's mouth is not always a delta — some rivers end in a single narrow estuary instead."
  ],
  summary:"A river's landforms trace its journey from source to mouth: steep upper courses erode V-shaped valleys, middle courses develop meanders through lateral erosion, and lower courses deposit sediment to build floodplains, deltas, and oxbow lakes where meanders are cut off.",
  dataColumns:['Time step','Slope','Rainfall','Rock Type','Dominant Process'],
  graphSeries(rows){ return [{name:'Rainfall (discharge proxy)', color:'#0E6BA8', data:rows.map(r=>r[2])}]; },
  quiz:[
    {q:"In which part of a river's course is erosion typically strongest?", options:["Upper course (steep slope)", "Lower course only", "Only at the delta", "Erosion never varies along a river"], correct:0, explain:"Steep gradients in the upper course give the river high energy, cutting deeply through erosion."},
    {q:"How does an oxbow lake form?", options:["A dam bursts", "A meander's neck is cut off, isolating a curved section", "A river dries up completely", "Rainfall increases suddenly"], correct:1, explain:"As a meander loop narrows, the river may cut straight through the neck, leaving the old loop as an isolated oxbow lake."},
    {q:"Where does a river typically deposit the most sediment?", options:["Upper course", "Steep waterfalls", "Lower course / delta", "Nowhere — rivers never deposit sediment"], correct:2, explain:"As slope and energy decrease near the mouth, rivers deposit sediment, building floodplains and deltas."},
    {q:"Which factor most directly increases a river's erosive power in this simulation?", options:["Lower rainfall", "Softer rock and steeper slope with more rainfall", "Colder temperatures", "Fewer meanders"], correct:1, explain:"Steeper slope, higher rainfall (discharge) and softer, more erodible rock all increase a river's erosive power."},
    {q:"What shape is typical of an upper-course river valley?", options:["Wide and flat", "U-shaped", "Narrow V-shaped", "Perfectly circular"], correct:2, explain:"Fast-flowing upper-course rivers cut narrow, steep-sided V-shaped valleys through vertical erosion."},
  ],
  mount(stage, panel, api){
    stage.innerHTML = `<canvas id="rl-canvas"></canvas>`;
    const canvas = stage.querySelector('canvas'); const ctx = canvas.getContext('2d');
    let slope=60, rainfall=50, rockType='soft', running=false, t=0, step=0, meanderPhase=0, sedimentBuilt=0;

    function resize(){ const w=stage.clientWidth,h=stage.clientHeight; canvas.width=w*devicePixelRatio; canvas.height=h*devicePixelRatio; canvas.style.width=w+'px'; canvas.style.height=h+'px'; }
    resize(); window.addEventListener('resize', ()=>{ resize(); draw(); });

    function erosionRate(){
      const rockFactor = rockType==='soft'?1.4:rockType==='medium'?1:0.6;
      return (slope/100)*(rainfall/100)*rockFactor;
    }

    function riverPath(w,h,amp){
      let d = `M ${w*0.06} ${h*0.18}`;
      const points = 8;
      for(let i=1;i<=points;i++){
        const x = w*0.06 + (w*0.88)*(i/points);
        const y = h*0.18 + (h*0.68)*(i/points) + Math.sin(i*1.3+meanderPhase)*amp*(i/points);
        d += ` L ${x} ${y}`;
      }
      return d;
    }

    function draw(){
      const dpr=devicePixelRatio, w=canvas.width/dpr, h=canvas.height/dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      ctx.fillStyle='#DCEFDC'; ctx.fillRect(0,0,w,h);
      // elevation shading (higher slope = more mountain gradient at top)
      const mtnGrad = ctx.createLinearGradient(0,0,0,h*0.4);
      mtnGrad.addColorStop(0,'#8D6748'); mtnGrad.addColorStop(1,'#B8A27A');
      ctx.fillStyle=mtnGrad; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w,0); ctx.lineTo(w,h*0.12+ (100-slope)*0.6); ctx.lineTo(0,h*0.22+(100-slope)*0.4); ctx.closePath(); ctx.fill();

      const amp = 10 + (100-slope)*0.5 + sedimentBuilt*0.3;
      ctx.strokeStyle='#0E6BA8'; ctx.lineWidth = 8 + rainfall/12; ctx.lineJoin='round'; ctx.lineCap='round';
      ctx.beginPath();
      const d = riverPath(w,h,amp);
      const cmds = d.split(' L ');
      const start = cmds[0].replace('M ','').split(' ').map(Number);
      ctx.moveTo(start[0],start[1]);
      cmds.slice(1).forEach(c=>{ const [x,y]=c.split(' ').map(Number); ctx.lineTo(x,y); });
      ctx.stroke();

      // floodplain / delta at bottom
      ctx.fillStyle='rgba(201,168,118,0.5)';
      ctx.fillRect(0,h*0.82,w,h*0.18);
      ctx.beginPath(); ctx.ellipse(w*0.5,h*0.95,60+sedimentBuilt,18+sedimentBuilt*0.3,0,0,7); ctx.fillStyle='#C9A876'; ctx.fill();
      ctx.fillStyle='#3E2723'; ctx.font='10px sans-serif';
      ctx.fillText('Delta / Floodplain deposition', w*0.5-70, h*0.99);

      // oxbow lake chance
      if(sedimentBuilt>18){
        ctx.beginPath(); ctx.ellipse(w*0.65,h*0.55,18,10,0.4,0,7); ctx.fillStyle='#4FC3F7'; ctx.fill();
        ctx.fillStyle='#01579B'; ctx.font='9px sans-serif'; ctx.fillText('Oxbow Lake', w*0.65-14,h*0.55-14);
      }
      ctx.fillStyle='#212121'; ctx.font='10px sans-serif';
      ctx.fillText('Upper course (erosion)', 8, h*0.22);
      ctx.fillText('Lower course (deposition)', 8, h*0.9);
    }
    draw();

    function loop(){
      if(!running) return;
      t++;
      meanderPhase += 0.02*(rainfall/50);
      sedimentBuilt += erosionRate()*0.15;
      draw();
      if(t%25===0){
        step++;
        const dominant = erosionRate()>0.6? 'Erosion dominant' : erosionRate()>0.3? 'Transportation dominant' : 'Deposition dominant';
        api.pushRow([step, slope, rainfall, rockType, dominant]);
      }
      requestAnimationFrame(loop);
    }

    addSlider(panel,{key:'slope',label:'Slope Gradient',min:5,max:100,step:1,value:60,unit:'%', onInput:v=>{slope=v; draw(); api.onFirstInteract();}});
    addSlider(panel,{key:'rain',label:'Rainfall / Discharge',min:5,max:100,step:1,value:50,unit:'%', onInput:v=>{rainfall=v; draw(); api.onFirstInteract();}});
    addChipGroup(panel,{key:'rock',label:'Rock Type',value:rockType,
      options:[{value:'soft',label:'Soft (e.g. clay)'},{value:'medium',label:'Medium'},{value:'hard',label:'Hard (e.g. granite)'}],
      onChange:v=>{ rockType=v; api.onFirstInteract(); }
    });

    const stat = document.createElement('div'); stat.className='panel-block';
    stat.innerHTML = `<h3>📊 Erosion Rate</h3>`;
    const statInner = document.createElement('div'); stat.appendChild(statInner);
    panel.appendChild(stat);
    function updateStat(){ statGrid(statInner, [{v:erosionRate().toFixed(2), l:'Erosion index'}, {v:Math.round(sedimentBuilt), l:'Sediment built'}]); }
    updateStat();
    const interval = setInterval(updateStat, 500);

    api.setReadout('Press Play to run river processes over time');

    return {
      onPlay(){ running=true; loop(); },
      onPause(){ running=false; },
      onReset(){ running=false; t=0; step=0; meanderPhase=0; sedimentBuilt=0; slope=60;rainfall=50;rockType='soft'; draw(); },
      onRandomize(){ slope=5+Math.floor(Math.random()*95); rainfall=5+Math.floor(Math.random()*95); rockType=['soft','medium','hard'][Math.floor(Math.random()*3)]; draw(); },
      onStep(dir){ meanderPhase+=dir*0.3; sedimentBuilt=Math.max(0,sedimentBuilt+dir*2); draw(); }
    };
  }
});
