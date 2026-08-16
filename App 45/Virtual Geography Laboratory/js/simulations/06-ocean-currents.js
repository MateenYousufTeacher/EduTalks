/* ============================================================
   SIM 6 — OCEAN CURRENTS EXPLORER
   ============================================================ */
registerSim('ocean-currents', {
  objectives:[
    "Explain how wind drives surface ocean currents.",
    "Describe thermohaline circulation and its role as a 'global conveyor belt'.",
    "Relate salinity and temperature differences to deep-water current formation.",
    "Assess how ocean currents influence coastal climate."
  ],
  intro:"Ocean currents move enormous volumes of water and heat around the planet, shaping climate far beyond the coastline. Adjust wind, temperature and salinity to see how surface and deep currents respond.",
  background:"Surface currents are driven mainly by wind dragging across the ocean surface, deflected by Earth's rotation (the Coriolis effect) into large circular gyres. Deep ocean currents are driven by density differences: cold, salty water is denser and sinks, especially near the poles, driving a slow global 'conveyor belt' called thermohaline circulation ('thermo' = temperature, 'haline' = salinity) that redistributes heat between the equator and poles over centuries.",
  humanImpact:"Ocean currents like the Gulf Stream keep Western Europe far milder than other regions at similar latitudes, while upwelling currents bring nutrient-rich water that supports major fisheries feeding millions of people.",
  realWorld:"Scientists monitor thermohaline circulation closely because melting polar ice could dilute salty water and potentially slow this 'conveyor belt', with major implications for regional climates.",
  facts:[
    "The Gulf Stream carries more water than all the world's rivers combined.",
    "It takes roughly 1,000 years for a parcel of water to complete the full thermohaline 'conveyor belt' circuit.",
    "Without the Gulf Stream, parts of Western Europe could be significantly colder than they are today.",
    "Rubber ducks lost from a cargo ship in 1992 have been used by scientists to track surface currents for decades."
  ],
  misconceptions:[
    "Ocean currents are not caused only by tides — wind and density differences are the primary drivers.",
    "Warm currents do not heat the entire ocean uniformly — their effect is strongest near the surface and along their path.",
    "The 'conveyor belt' is not a fast-moving current — it moves extremely slowly, over centuries."
  ],
  summary:"Wind drives fast-moving surface currents that are deflected into rotating gyres by Earth's rotation, while temperature and salinity differences drive slow, deep thermohaline circulation that connects ocean basins worldwide and moderates regional climates.",
  dataColumns:['Time step','Wind (km/h)','Salinity (psu)','Temp (°C)','Dominant Current Type'],
  graphSeries(rows){ return [{name:'Salinity (psu)', color:'#26C6DA', data:rows.map(r=>r[2])},{name:'Temp (°C)', color:'#E53935', data:rows.map(r=>r[3])}]; },
  quiz:[
    {q:"What is the main driver of surface ocean currents?", options:["Moonlight","Wind dragging across the surface","Fish migration","Volcanic activity"], correct:1, explain:"Surface currents are primarily driven by prevailing winds, deflected by Earth's rotation into large gyres."},
    {q:"What two properties drive thermohaline circulation?", options:["Wind and pressure","Temperature and salinity","Tides and gravity","Waves and sunlight"], correct:1, explain:"'Thermo' (temperature) and 'haline' (salinity) differences change water density, driving deep circulation."},
    {q:"Why does the Gulf Stream make Western Europe milder?", options:["It blocks cold air from Canada","It carries warm water northward, releasing heat to the atmosphere","It increases rainfall only","It has no effect on climate"], correct:1, explain:"The warm Gulf Stream transports heat from the tropics, warming the air above it and nearby coastal regions."},
    {q:"Where does cold, salty water typically sink to begin deep circulation?", options:["Equatorial regions","Near the poles","Mid-latitude deserts","Coral reefs"], correct:1, explain:"Near the poles, cold and increasingly salty water (as ice forms) becomes dense enough to sink, driving the conveyor belt."},
    {q:"Roughly how long does a full thermohaline circulation cycle take?", options:["A few hours","A few days","About a year","Around 1,000 years"], correct:3, explain:"The global conveyor belt is extremely slow, taking roughly a millennium to complete one full circuit."},
  ],
  mount(stage, panel, api){
    stage.innerHTML = `<canvas id="oc-canvas"></canvas>`;
    const canvas = stage.querySelector('canvas'); const ctx = canvas.getContext('2d');
    let wind=25, salinity=35, temp=15, running=false, t=0, particles=[], step=0;

    function resize(){ const w=stage.clientWidth,h=stage.clientHeight; canvas.width=w*devicePixelRatio; canvas.height=h*devicePixelRatio; canvas.style.width=w+'px'; canvas.style.height=h+'px'; initParticles(); }
    function initParticles(){
      particles = [];
      const w=stage.clientWidth,h=stage.clientHeight;
      for(let i=0;i<40;i++) particles.push({x:Math.random()*w, y:h*0.15+Math.random()*h*0.6, phase:Math.random()*Math.PI*2, deep:Math.random()<0.4});
    }
    resize(); window.addEventListener('resize', ()=>{ resize(); draw(); });

    function draw(){
      const dpr=devicePixelRatio, w=canvas.width/dpr, h=canvas.height/dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      const grad = ctx.createLinearGradient(0,0,0,h); grad.addColorStop(0,'#4FC3F7'); grad.addColorStop(1,'#073B6B');
      ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
      ctx.fillStyle='#7CB37C'; ctx.fillRect(0,0,80,h); ctx.fillRect(w-80,0,80,h);
      ctx.fillStyle='rgba(255,255,255,.7)'; ctx.font='10px sans-serif';
      ctx.fillText('Pole (cold, salty → sinks)', 4, 14);
      ctx.fillText('Equator (warm)', w-140, 14);

      particles.forEach(p=>{
        const speed = (p.deep? 0.3 : 1) * (wind/25) * (p.deep? (salinity/35)*(20/Math.max(temp,2)) : 1);
        p.phase += 0.02*speed;
        const dir = p.deep? -1: 1;
        p.x += dir*speed*1.4;
        if(dir>0 && p.x>w-80) p.x=80;
        if(dir<0 && p.x<80) p.x=w-80;
        const yWiggle = Math.sin(p.phase)*6;
        ctx.beginPath();
        ctx.fillStyle = p.deep? 'rgba(38,198,218,.55)' : 'rgba(255,255,255,.85)';
        ctx.arc(p.x, p.y+yWiggle, p.deep?2.2:3, 0, 7);
        ctx.fill();
      });
      ctx.fillStyle='rgba(255,255,255,.9)'; ctx.font='11px sans-serif';
      ctx.fillText('● Surface current (wind-driven)', 10, h-24);
      ctx.fillStyle='rgba(38,198,218,.9)';
      ctx.fillText('● Deep current (thermohaline)', 10, h-10);
    }
    draw();

    function loop(){
      if(!running) return;
      t++; draw();
      if(t%25===0){
        step++;
        const dominant = salinity>36 || temp<8 ? 'Deep thermohaline dominant' : 'Surface wind-driven dominant';
        api.pushRow([step, wind, salinity, temp, dominant]);
      }
      requestAnimationFrame(loop);
    }

    addSlider(panel,{key:'wind',label:'Wind Strength',min:0,max:60,step:1,value:25,unit:' km/h', onInput:v=>{wind=v; api.onFirstInteract();}});
    addSlider(panel,{key:'sal',label:'Salinity',min:30,max:40,step:0.5,value:35,unit:' psu', onInput:v=>{salinity=v; api.onFirstInteract();}});
    addSlider(panel,{key:'temp2',label:'Water Temperature',min:-2,max:30,step:1,value:15,unit:'°C', onInput:v=>{temp=v; api.onFirstInteract();}});

    const eff = document.createElement('div'); eff.className='panel-block';
    eff.innerHTML = `<h3>🌡️ Climate Effect</h3><p class="small" id="oc-effect"></p>`;
    panel.appendChild(eff);
    function updateEffect(){
      let msg = 'Balanced surface and deep circulation.';
      if(salinity>37 && temp<10) msg='Strong deep-water formation — thermohaline circulation dominates, redistributing heat toward polar regions over centuries.';
      else if(wind>40) msg='Strong wind-driven surface currents dominate, rapidly moving warm and cool water masses and moderating nearby coastal temperatures.';
      document.getElementById('oc-effect').textContent = msg;
    }
    updateEffect();

    api.setReadout('Press Play to set the currents in motion');

    return {
      onPlay(){ running=true; loop(); },
      onPause(){ running=false; },
      onReset(){ running=false; t=0; step=0; wind=25;salinity=35;temp=15; initParticles(); draw(); },
      onRandomize(){ wind=Math.round(Math.random()*60); salinity=+(30+Math.random()*10).toFixed(1); temp=Math.round(-2+Math.random()*32); draw(); updateEffect(); },
      onStep(dir){ t+=dir*10; draw(); }
    };
  }
});
