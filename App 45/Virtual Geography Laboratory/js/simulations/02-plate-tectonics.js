/* ============================================================
   SIM 2 — PLATE TECTONICS LABORATORY
   ============================================================ */
registerSim('plate-tectonics', {
  objectives:[
    "Differentiate divergent, convergent and transform plate boundaries.",
    "Predict landforms produced at each boundary type (mountains, trenches, rifts).",
    "Relate plate speed to the rate of geological change.",
    "Connect plate boundaries to the distribution of earthquakes and volcanoes."
  ],
  intro:"Earth's lithosphere is broken into rigid plates that drift slowly on the semi-fluid mantle below. Where plates meet, immense geological forces build mountains, tear open oceans, and trigger earthquakes. Choose a boundary type and drive the plates to see the results.",
  background:"At divergent boundaries plates move apart, allowing magma to rise and form new crust — creating mid-ocean ridges or continental rift valleys. At convergent boundaries plates collide: denser oceanic crust subducts beneath lighter continental crust forming trenches and volcanic arcs, or two continental plates crumple to build fold mountains like the Himalayas. At transform boundaries plates slide horizontally past each other, building up stress that releases as earthquakes, as along California's San Andreas Fault.",
  humanImpact:"Plate boundaries determine where earthquakes, volcanoes and tsunamis occur, directly shaping building codes, disaster preparedness and settlement patterns across billions of people living near the 'Ring of Fire' and other active margins.",
  realWorld:"GPS geodesy now measures plate motion in real time — India is still colliding with Asia at about the speed fingernails grow, continuing to push the Himalayas higher each year.",
  facts:[
    "The Himalayas are still rising by a few millimetres each year due to the India-Asia collision.",
    "The Atlantic Ocean is widening by about 2.5 cm per year — roughly the rate your fingernails grow.",
    "The Pacific 'Ring of Fire' contains about 75% of the world's active volcanoes.",
    "Iceland sits directly on the Mid-Atlantic Ridge, a divergent boundary — it is literally being pulled apart."
  ],
  misconceptions:[
    "Plates do not move because of earthquakes — earthquakes are a result of plate motion, not the cause.",
    "Not all volcanoes form at convergent boundaries — many form at divergent boundaries and hotspots too.",
    "Continents are not 'floating' on liquid magma; they ride atop rigid plates over slowly flowing solid mantle rock."
  ],
  summary:"Divergent boundaries create new crust and rift valleys or ocean ridges; convergent boundaries destroy crust, building trenches, volcanic arcs, or fold mountains; transform boundaries slide plates past each other, generating earthquakes without creating or destroying crust.",
  dataColumns:['Time (Ma sim)','Boundary Type','Plate Speed (cm/yr)','Feature Forming'],
  graphSeries(rows){ return [{name:'Plate Speed (cm/yr)', color:'#8D6748', data:rows.map(r=>r[2])}]; },
  quiz:[
    {q:"What landform typically forms when two continental plates converge?", options:["Ocean trench","Fold mountains","Rift valley","Transform fault"], correct:1, explain:"Two continental plates are too buoyant to subduct, so the crust crumples upward into fold mountains like the Himalayas."},
    {q:"What happens at a divergent boundary under the ocean?", options:["A trench forms","A mid-ocean ridge and new crust form","Plates slide past each other","Nothing happens"], correct:1, explain:"Magma rises to fill the gap as plates separate, creating new oceanic crust and a mid-ocean ridge."},
    {q:"Earthquakes without volcanoes are most typical of which boundary?", options:["Convergent","Divergent","Transform","Hotspot"], correct:2, explain:"Transform boundaries involve plates sliding horizontally, generating stress and earthquakes but rarely volcanism."},
    {q:"Why does oceanic crust subduct beneath continental crust at convergent boundaries?", options:["It is less dense","It is denser and sinks","It is older","It is thicker"], correct:1, explain:"Denser oceanic crust sinks beneath the lighter, more buoyant continental crust."},
    {q:"Which boundary type is the San Andreas Fault an example of?", options:["Convergent","Divergent","Transform","Passive margin"], correct:2, explain:"The San Andreas Fault is a classic transform boundary where the Pacific and North American plates slide past each other."},
  ],
  mount(stage, panel, api){
    stage.innerHTML = `<svg id="pt-svg" viewBox="0 0 600 375" style="width:100%;height:100%;"></svg>`;
    const svg = stage.querySelector('svg');
    let boundary='divergent', speed=3, offset=0, playing=false, simTime=0, tick=0;

    function render(){
      const gapPx = boundary==='divergent'? offset : boundary==='convergent'? -Math.min(offset,70) : 0;
      const shiftY = boundary==='transform'? offset%40 : 0;
      let leftFeature='', rightFeature='', midFeature='';
      if(boundary==='divergent'){
        midFeature = `<rect x="${290-Math.min(offset,40)/2}" y="0" width="${20+Math.min(offset,40)}" height="375" fill="#FF7043" opacity="0.55"/>
          <text x="300" y="30" text-anchor="middle" font-size="11" fill="#B71C1C" font-weight="700">Rising Magma / New Crust</text>`;
      } else if(boundary==='convergent'){
        midFeature = `<polygon points="270,375 300,${375-Math.min(offset*2.4,190)} 330,375" fill="#8D6748"/>
          <text x="300" y="${360-Math.min(offset*2.4,190)}" text-anchor="middle" font-size="11" fill="#3E2723" font-weight="700">Fold Mountains</text>
          ${offset>15?`<circle cx="330" cy="200" r="6" fill="#FF7043"><animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/></circle><text x="345" y="204" font-size="10" fill="#B71C1C">Volcanic activity</text>`:''}`;
      } else {
        midFeature = `<line x1="300" y1="0" x2="300" y2="375" stroke="#B71C1C" stroke-width="3" stroke-dasharray="10 6"/>
          <text x="308" y="30" font-size="11" fill="#B71C1C" font-weight="700">Transform Fault</text>`;
      }
      svg.innerHTML = `
        <rect width="600" height="375" fill="#DCEFFA"/>
        <g>
          <rect x="${0-gapPx}" y="${140+shiftY}" width="300" height="235" fill="#7CB37C"/>
          <rect x="${0-gapPx}" y="${140+shiftY}" width="300" height="14" fill="#5B9C5B"/>
          <text x="${40-gapPx}" y="${170+shiftY}" font-size="12" font-weight="700" fill="#2E5B2E">Plate A</text>
        </g>
        <g>
          <rect x="${300+gapPx}" y="${140-shiftY}" width="300" height="235" fill="#8FB07A"/>
          <rect x="${300+gapPx}" y="${140-shiftY}" width="300" height="14" fill="#6E9160"/>
          <text x="${480+gapPx}" y="${170-shiftY}" font-size="12" font-weight="700" fill="#2E5B2E">Plate B</text>
        </g>
        ${midFeature}
        <g font-size="10" fill="#5C6672">
          <text x="12" y="365">◀ Mantle flow (simplified)</text>
        </g>
      `;
    }
    render();

    function step(){
      if(!playing) return;
      offset += speed*0.4; simTime += speed*2; tick++;
      render();
      if(tick%20===0){
        api.pushRow([Math.round(simTime), boundary, speed, boundary==='divergent'?'Rift / Ridge':boundary==='convergent'?'Mountains / Trench':'Fault stress']);
      }
      requestAnimationFrame(step);
    }

    addChipGroup(panel, {key:'boundary', label:'Boundary Type', value:boundary,
      options:[{value:'divergent',label:'Divergent'},{value:'convergent',label:'Convergent'},{value:'transform',label:'Transform'}],
      onChange:v=>{ boundary=v; offset=0; simTime=0; render(); api.onFirstInteract(); }
    });
    addSlider(panel, {key:'speed', label:'Plate Speed', min:1,max:10,step:1,value:3,unit:' cm/yr', onInput:v=>{ speed=v; api.onFirstInteract(); }});

    const infoBlock = document.createElement('div'); infoBlock.className='panel-block';
    infoBlock.innerHTML = `<h3>📚 What you're seeing</h3><p class="small" id="pt-explain">Plates move apart, creating new crust as magma rises between them (mid-ocean ridge / rift valley).</p>`;
    panel.appendChild(infoBlock);
    function updateExplain(){
      const map = {
        divergent:"Plates move apart, creating new crust as magma rises between them (mid-ocean ridge / rift valley).",
        convergent:"Plates collide — continental crust crumples into fold mountains while oceanic crust may subduct, triggering volcanoes.",
        transform:"Plates slide horizontally past each other. Friction builds stress that releases suddenly as earthquakes."
      };
      document.getElementById('pt-explain').textContent = map[boundary];
    }
    const origAddChip = panel.querySelector('#chips-boundary');
    origAddChip.addEventListener('click', updateExplain);

    api.setReadout('Press Play to drive the plates');

    return {
      onPlay(){ playing=true; api.setReadout('Simulation running...'); step(); },
      onPause(){ playing=false; },
      onReset(){ offset=0; simTime=0; tick=0; render(); api.setReadout('Press Play to drive the plates'); },
      onRandomize(){ boundary=['divergent','convergent','transform'][Math.floor(Math.random()*3)]; speed=1+Math.floor(Math.random()*10); offset=0; render(); },
      onStep(dir){ offset = Math.max(0, offset+dir*8); simTime+=dir*16; render(); }
    };
  }
});
