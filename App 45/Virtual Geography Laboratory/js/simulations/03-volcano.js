/* ============================================================
   SIM 3 — VOLCANO SIMULATOR
   ============================================================ */
registerSim('volcano', {
  objectives:[
    "Compare shield, composite (stratovolcano) and cinder cone volcano shapes.",
    "Explain how magma viscosity controls eruption style and volcano shape.",
    "Describe hazards: lava flows, ash clouds and pyroclastic activity.",
    "Relate gas pressure to explosive vs effusive eruptions."
  ],
  intro:"Not all volcanoes look or behave alike. Their shape and eruption style depend mainly on magma viscosity and gas content. Build a volcano, adjust its magma, and trigger an eruption to see the results.",
  background:"Shield volcanoes form from low-viscosity, runny basaltic lava that flows far before cooling, building wide gently-sloping cones (e.g. Mauna Loa). Composite volcanoes (stratovolcanoes) alternate layers of viscous andesitic lava and ash, building steep, explosive cones (e.g. Mount Fuji). Cinder cone volcanoes are small, steep-sided cones built from ejected fragments of frothy lava (cinders) around a single vent, usually from short-lived eruptions.",
  humanImpact:"Volcanic eruptions can destroy settlements and disrupt aviation and climate through ash clouds, but they also create fertile soils that support dense agricultural populations near volcanoes like Merapi and Vesuvius.",
  realWorld:"Volcanologists monitor gas emissions, ground deformation and seismicity to forecast eruptions and issue hazard-zone warnings, saving thousands of lives during events like the 1991 Pinatubo eruption.",
  facts:[
    "Hawaii's Mauna Loa is the largest active shield volcano on Earth, rising over 4 km above sea level.",
    "The 1815 eruption of Mount Tambora was so massive it caused 'the year without a summer' in 1816.",
    "Cinder cones can form and finish erupting in as little as a few months to a few years.",
    "Pyroclastic flows can travel faster than 700 km/h and reach temperatures over 700°C."
  ],
  misconceptions:[
    "Lava is not always bright red and fast-flowing — viscous lava can be dark, slow, and dome-like.",
    "Volcanoes are not always cone-shaped mountains — many are fissures, calderas, or nearly flat shields.",
    "Dormant volcanoes are not the same as extinct ones — dormant volcanoes can still reawaken."
  ],
  summary:"Magma viscosity and gas content determine both the shape and the danger of a volcano: low-viscosity basaltic magma builds wide shield volcanoes with gentle effusive eruptions, while high-viscosity, gas-rich magma builds steep composite cones with violent explosive eruptions.",
  dataColumns:['Eruption #','Volcano Type','Viscosity','Gas Pressure','Eruption Style'],
  graphSeries(rows){ return [{name:'Gas Pressure', color:'#E53935', data:rows.map(r=>r[3])}]; },
  quiz:[
    {q:"Which volcano type is built from low-viscosity, runny lava?", options:["Cinder cone","Composite","Shield","Caldera"], correct:2, explain:"Shield volcanoes form from fluid basaltic lava that spreads widely before solidifying, creating a broad gentle slope."},
    {q:"What mainly controls whether an eruption is explosive or effusive?", options:["Volcano height","Magma viscosity and gas content","Time of year","Distance from the ocean"], correct:1, explain:"High viscosity traps gas, building pressure that leads to explosive eruptions; low viscosity lets gas escape easily, producing effusive flows."},
    {q:"What is a pyroclastic flow?", options:["A slow river of cooled lava","A fast-moving current of hot gas and volcanic debris","A type of volcanic gas only","An underwater lava tube"], correct:1, explain:"Pyroclastic flows are extremely fast, hot mixtures of gas, ash and rock fragments that race down a volcano's slopes."},
    {q:"Which volcano shape is typically the steepest and most explosive?", options:["Shield","Composite (stratovolcano)","Fissure","Plateau"], correct:1, explain:"Composite volcanoes are built from viscous, gas-rich magma, producing steep slopes and violent eruptions."},
    {q:"Why do fertile farmlands often surround active volcanoes?", options:["Volcanic ash makes rich mineral soil","Lava is used for irrigation","Volcanoes lower rainfall","Volcanoes attract fewer farmers"], correct:0, explain:"Weathered volcanic ash and rock release minerals that make soils highly fertile, attracting dense farming populations despite the risk."},
  ],
  mount(stage, panel, api){
    stage.innerHTML = `<svg id="vc-svg" viewBox="0 0 500 320" style="width:100%;height:100%;"></svg>`;
    const svg = stage.querySelector('svg');
    let type='shield', viscosity=20, gas=30, erupting=false, t=0, eruptCount=0;

    const shapes = {
      shield:{ path:'M40,300 Q250,150 460,300 Z', color:'#8D6748', label:'Shield Volcano (e.g. Mauna Loa)' },
      composite:{ path:'M120,300 L250,60 L380,300 Z', color:'#6D4C41', label:'Composite / Stratovolcano (e.g. Fuji)' },
      cinder:{ path:'M170,300 L250,170 L330,300 Z', color:'#4E342E', label:'Cinder Cone' },
    };

    function styleFor(){
      const s = shapes[type];
      return s;
    }

    function render(){
      const s = styleFor();
      const eruptOpacity = erupting? 1: 0;
      const plumeHeight = 40 + gas*1.4;
      const flowSpread = viscosity<35? 90 : viscosity<65? 40 : 15;
      svg.innerHTML = `
        <rect width="500" height="320" fill="#EAF3FC"/>
        <rect y="290" width="500" height="30" fill="#7CB37C"/>
        <path d="${s.path}" fill="${s.color}"/>
        ${erupting? `
          <circle cx="250" cy="${type==='shield'?150:type==='composite'?60:170}" r="${12+gas/4}" fill="#FF5722">
            <animate attributeName="r" values="${10+gas/4};${16+gas/3};${10+gas/4}" dur="0.6s" repeatCount="indefinite"/>
          </circle>
          <g opacity="0.85">
            ${[...Array(6)].map((_,i)=>`<circle cx="${250+(i-2.5)*16}" cy="${(type==='shield'?150:type==='composite'?60:170)-plumeHeight*Math.min(t/40,1)-i*4}" r="${14+i*2}" fill="#616161" opacity="${0.55-i*0.06}"/>`).join('')}
          </g>
          <path d="M250,${type==='shield'?150:type==='composite'?60:170} Q${250-flowSpread},260 ${250-flowSpread*1.6},300" stroke="#FF5722" stroke-width="6" fill="none" opacity="0.85"/>
          <path d="M250,${type==='shield'?150:type==='composite'?60:170} Q${250+flowSpread},260 ${250+flowSpread*1.6},300" stroke="#FF7043" stroke-width="6" fill="none" opacity="0.85"/>
        `:''}
        <text x="250" y="315" text-anchor="middle" font-size="11" fill="#3E2723" font-weight="700">${s.label}</text>
      `;
    }
    render();

    function loop(){
      if(!erupting) return;
      t++;
      render();
      if(t%15===0){
        eruptCount++;
        const style = gas>60? 'Explosive (Plinian-style)' : gas>30? 'Moderate explosive' : 'Effusive lava flow';
        api.pushRow([eruptCount, type, viscosity, gas, style]);
      }
      if(t<80) requestAnimationFrame(loop); else { erupting=false; render(); api.setReadout('Eruption complete — press Play to erupt again'); }
    }

    addChipGroup(panel, {key:'vtype', label:'Volcano Type', value:type,
      options:[{value:'shield',label:'Shield'},{value:'composite',label:'Composite'},{value:'cinder',label:'Cinder Cone'}],
      onChange:v=>{ type=v; render(); api.onFirstInteract(); }
    });
    addSlider(panel, {key:'visc', label:'Magma Viscosity', min:5,max:95,step:1,value:20, unit:'%', onInput:v=>{ viscosity=v; api.onFirstInteract(); }});
    addSlider(panel, {key:'gas', label:'Gas Pressure', min:5,max:95,step:1,value:30, unit:'%', onInput:v=>{ gas=v; api.onFirstInteract(); }});

    const hz = document.createElement('div'); hz.className='panel-block';
    hz.innerHTML = `<h3>⚠️ Hazard Zones</h3><p class="small">High gas pressure + high viscosity = explosive eruption risk. Low viscosity magma travels farther as lava flows, endangering a wider area on gentle slopes.</p>`;
    panel.appendChild(hz);

    api.setReadout('Adjust magma properties, then press Play to erupt');

    return {
      onPlay(){ erupting=true; t=0; api.setReadout('Erupting...'); loop(); },
      onPause(){ erupting=false; },
      onReset(){ erupting=false; t=0; eruptCount=0; render(); api.setReadout('Adjust magma properties, then press Play to erupt'); },
      onRandomize(){ viscosity=5+Math.floor(Math.random()*90); gas=5+Math.floor(Math.random()*90); type=['shield','composite','cinder'][Math.floor(Math.random()*3)]; render(); },
      onStep(dir){ t=Math.max(0,t+dir*10); render(); }
    };
  }
});
