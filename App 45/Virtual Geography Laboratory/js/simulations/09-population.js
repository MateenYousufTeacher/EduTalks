/* ============================================================
   SIM 9 — POPULATION DISTRIBUTION SIMULATOR
   ============================================================ */
registerSim('population', {
  objectives:[
    "Explain how birth rate, death rate and migration affect population change.",
    "Relate employment and resource availability to settlement growth.",
    "Interpret population density heat maps.",
    "Discuss the relationship between urbanisation and infrastructure pressure."
  ],
  intro:"Populations grow, shrink, and redistribute in response to birth rates, death rates, migration and economic opportunity. Adjust these drivers and watch a virtual region's settlement pattern evolve over simulated years.",
  background:"Natural population change equals births minus deaths; net migration adds or removes people moving in or out. Regions with strong employment, resources and infrastructure tend to attract migrants and grow denser, a process called urbanisation. Rapid, unplanned growth can strain housing, water, transport and sanitation systems faster than they can expand.",
  humanImpact:"Understanding population dynamics helps governments plan schools, hospitals, housing and transport ahead of demand, and anticipate challenges like ageing populations or rapid urban sprawl.",
  realWorld:"Countries use census data and demographic models identical in principle to this simulator to forecast future population size, plan pension systems, and target infrastructure investment.",
  facts:[
    "The world's population passed 8 billion in November 2022.",
    "More than half of the world's population now lives in urban areas, a first in human history.",
    "Some countries, like Japan, have shrinking populations due to low birth rates.",
    "Megacities can grow by over a million people in under a year through migration alone."
  ],
  misconceptions:[
    "High birth rate does not automatically mean high overall population growth — death rate and migration matter too.",
    "Urbanisation does not always mean better living conditions — rapid unplanned growth can create slums and strain services.",
    "Population density is not the same as overcrowding — a densely populated area can still be well planned and liveable."
  ],
  summary:"Population change results from the balance of births, deaths, and migration, with employment and resources driving where people settle. Rapid urban growth increases density and can strain infrastructure unless matched by planning investment.",
  dataColumns:['Year','Population','Birth Rate','Death Rate','Net Migration'],
  graphSeries(rows){ return [{name:'Population', color:'#6A1B9A', data:rows.map(r=>r[1])}]; },
  quiz:[
    {q:"What is 'natural population change'?", options:["Births minus deaths", "Total births only", "Migration only", "Births plus migration"], correct:0, explain:"Natural change is calculated as the number of births minus the number of deaths in a period."},
    {q:"What typically attracts migrants to a region?", options:["Poor employment and few resources", "Strong employment opportunities and resources", "Lower population density only", "Random chance"], correct:1, explain:"People tend to migrate toward areas offering better jobs, resources, and living conditions."},
    {q:"What can happen when urban growth outpaces infrastructure development?", options:["Automatic improvement in living standards", "Strain on housing, water and transport systems", "Population automatically decreases", "No effect on the city"], correct:1, explain:"Rapid, unplanned growth can overwhelm housing, sanitation, water and transport systems faster than they can be expanded."},
    {q:"Which of these is NOT a driver of population change in this model?", options:["Birth rate", "Death rate", "Net migration", "Time zone"], correct:3, explain:"Time zone has no bearing on population growth — birth rate, death rate and migration are the core drivers."},
    {q:"What does a population density heat map typically show?", options:["Temperature across a region", "Concentration of people per unit area", "Only birth rates", "Rainfall patterns"], correct:1, explain:"A population density heat map visualises how many people live per unit area across a region, highlighting crowded and sparse zones."},
  ],
  mount(stage, panel, api){
    stage.innerHTML = `<canvas id="pop-canvas"></canvas>`;
    const canvas = stage.querySelector('canvas'); const ctx = canvas.getContext('2d');
    let birthRate=25, deathRate=10, migration=5, employment=50, running=false, t=0, year=0, population=1000;
    let cells = [];
    const GRID=12;

    function resize(){ const w=stage.clientWidth,h=stage.clientHeight; canvas.width=w*devicePixelRatio; canvas.height=h*devicePixelRatio; canvas.style.width=w+'px'; canvas.style.height=h+'px'; initCells(); }
    function initCells(){
      cells = [];
      for(let i=0;i<GRID;i++){ const row=[]; for(let j=0;j<GRID;j++){ const distFromCenter = Math.hypot(i-GRID/2,j-GRID/2); row.push(Math.max(2, 20-distFromCenter*2+Math.random()*4)); } cells.push(row); }
    }
    resize(); window.addEventListener('resize', ()=>{ resize(); draw(); });

    function heatColor(v){
      const t = Math.min(v/100,1);
      const r = Math.round(255*Math.min(1,t*2));
      const g = Math.round(255*Math.min(1,(1-t)*2));
      return `rgb(${r},${g},80)`;
    }

    function draw(){
      const dpr=devicePixelRatio, w=canvas.width/dpr, h=canvas.height/dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      ctx.fillStyle='#F5F7FA'; ctx.fillRect(0,0,w,h);
      const cw = w/GRID, ch=h/GRID;
      for(let i=0;i<GRID;i++) for(let j=0;j<GRID;j++){
        ctx.fillStyle = heatColor(cells[i][j]);
        ctx.fillRect(j*cw,i*ch,cw-1,ch-1);
      }
      ctx.fillStyle='#212121'; ctx.font='bold 12px sans-serif';
      ctx.fillText(`Population: ${Math.round(population).toLocaleString()}`, 8, 18);
    }
    draw();

    function loop(){
      if(!running) return;
      t++;
      if(t%15===0){
        year++;
        const growthRate = (birthRate-deathRate+migration)/1000;
        population = Math.max(0, population*(1+growthRate));
        // redistribute density toward center more if employment high
        for(let i=0;i<GRID;i++) for(let j=0;j<GRID;j++){
          const distFromCenter = Math.hypot(i-GRID/2,j-GRID/2);
          const pull = employment/50;
          cells[i][j] = Math.max(1, cells[i][j] + (pull-1)*(GRID/2-distFromCenter)*0.3 + (growthRate*20));
        }
        api.pushRow([year, Math.round(population), birthRate, deathRate, migration]);
      }
      draw();
      requestAnimationFrame(loop);
    }

    addSlider(panel,{key:'birth',label:'Birth Rate',min:5,max:50,step:1,value:25,unit:'/1000', onInput:v=>{birthRate=v; api.onFirstInteract();}});
    addSlider(panel,{key:'death',label:'Death Rate',min:2,max:30,step:1,value:10,unit:'/1000', onInput:v=>{deathRate=v; api.onFirstInteract();}});
    addSlider(panel,{key:'mig',label:'Net Migration',min:-20,max:20,step:1,value:5,unit:'/1000', onInput:v=>{migration=v; api.onFirstInteract();}});
    addSlider(panel,{key:'emp',label:'Employment Level',min:0,max:100,step:1,value:50,unit:'%', onInput:v=>{employment=v; api.onFirstInteract();}});

    const legend = document.createElement('div'); legend.className='panel-block';
    legend.innerHTML = `<h3>🗺️ Density Legend</h3>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="width:14px;height:14px;background:rgb(60,255,80);display:inline-block;border-radius:3px;"></span><span class="small">Sparse</span></div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="width:14px;height:14px;background:rgb(220,220,80);display:inline-block;border-radius:3px;"></span><span class="small">Moderate</span></div>
      <div style="display:flex;align-items:center;gap:8px;"><span style="width:14px;height:14px;background:rgb(255,60,80);display:inline-block;border-radius:3px;"></span><span class="small">Dense</span></div>`;
    panel.appendChild(legend);

    api.setReadout('Press Play to simulate population growth over time');

    return {
      onPlay(){ running=true; loop(); },
      onPause(){ running=false; },
      onReset(){ running=false; t=0; year=0; population=1000; birthRate=25;deathRate=10;migration=5;employment=50; initCells(); draw(); },
      onRandomize(){ birthRate=5+Math.floor(Math.random()*45); deathRate=2+Math.floor(Math.random()*28); migration=Math.floor(-20+Math.random()*40); employment=Math.floor(Math.random()*100); draw(); },
      onStep(dir){ year+=dir; draw(); }
    };
  }
});
