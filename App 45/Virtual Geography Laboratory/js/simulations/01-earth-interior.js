/* ============================================================
   SIM 1 — EARTH'S INTERNAL STRUCTURE EXPLORER
   ============================================================ */
registerSim('earth-interior', {
  objectives:[
    "Identify Earth's four major internal layers: crust, mantle, outer core, inner core.",
    "Relate depth to changes in temperature, pressure and state of matter.",
    "Explain how seismic waves (P and S) travel through Earth's layers.",
    "Interpret a labelled cross-sectional diagram of Earth."
  ],
  intro:"Earth is not a solid uniform ball — it is built of concentric layers with dramatically different composition, temperature and physical state. This lab lets you slice Earth open, probe any depth, and watch seismic waves travel through its interior.",
  background:"The crust (5–70 km) is Earth's thin, rigid outer shell made of solid rock. Below it, the mantle (down to ~2,890 km) is hot solid rock that flows slowly over geological time. The outer core (2,890–5,150 km) is liquid iron-nickel, and its convection generates Earth's magnetic field. The solid inner core (5,150–6,371 km), despite being hotter than the outer core, stays solid because of immense pressure.",
  humanImpact:"Understanding Earth's interior helps predict earthquakes and volcanic activity, locate mineral and geothermal resources, and explains the magnetic field that shields life from solar radiation.",
  realWorld:"Seismologists use earthquake waves recorded at stations worldwide to 'X-ray' Earth's interior, the same way doctors use ultrasound — this is how we know the core is layered without ever drilling there.",
  facts:[
    "The deepest hole ever drilled (Kola Superdeep Borehole) reached only 12.3 km — barely scratching the crust.",
    "The inner core is estimated to be about as hot as the surface of the Sun, roughly 5,200°C.",
    "The inner core grows slowly as the liquid outer core freezes onto it, about 1mm per year.",
    "S-waves cannot travel through liquids — this is how scientists discovered the outer core is molten."
  ],
  misconceptions:[
    "The core is not a hollow or empty space — it is dense solid and liquid metal.",
    "The mantle is not liquid magma; it is solid rock that flows extremely slowly (like thick toffee) over millions of years.",
    "Temperature alone does not determine solid/liquid state here — pressure keeps the hotter inner core solid."
  ],
  summary:"Earth's interior is layered by composition and physical state: a thin solid crust, a thick slowly-flowing solid mantle, a liquid metallic outer core, and a solid metallic inner core. Pressure — not just temperature — controls whether each layer is solid or liquid.",
  dataColumns:['Probe #','Depth (km)','Layer','Approx. Temp (°C)','Approx. Pressure (GPa)'],
  graphSeries(rows){
    return [
      { name:'Temperature (°C)', color:'#E53935', data:rows.map(r=>r[3]) },
    ];
  },
  quiz:[
    {q:"Which layer of Earth is liquid metal and generates the magnetic field?", options:["Crust","Mantle","Outer Core","Inner Core"], correct:2, explain:"The liquid, convecting outer core generates Earth's magnetic field through the geodynamo effect."},
    {q:"Why does the inner core remain solid despite being extremely hot?", options:["It is made of rock, not metal","Immense pressure keeps it solid","It is far from the heat source","It is actually cooler than the outer core"], correct:1, explain:"Pressure at the inner core is so great that it raises the melting point of iron above the actual temperature there."},
    {q:"What is the approximate thickness of Earth's crust compared to its total radius?", options:["Roughly half","About a third","A very thin fraction (under 2%)","Exactly equal to the mantle"], correct:2, explain:"The crust is only 5–70 km thick compared to Earth's ~6,371 km radius — thinner proportionally than an apple's skin."},
    {q:"How did scientists learn the outer core is liquid?", options:["By drilling to the core","S-waves do not pass through it","Volcanic samples from the core","Satellite gravity maps only"], correct:1, explain:"Secondary (S) seismic waves cannot travel through liquids, and they disappear at the outer core, revealing its liquid state."},
    {q:"What is the mantle mostly composed of?", options:["Liquid iron and nickel","Solid rock that flows slowly","Molten lava","Gaseous elements"], correct:1, explain:"The mantle is solid silicate rock that deforms and flows very slowly (convection) over millions of years."},
  ],
  mount(stage, panel, api){
    stage.innerHTML = `<canvas id="ei-canvas"></canvas>`;
    const canvas = stage.querySelector('canvas');
    const ctx0 = canvas.getContext('2d');
    let angle = -20, waveT = null, waveOrigin = null, probeCount=0;

    const LAYERS = [
      { name:'Crust', rOuter:1.00, rInner:0.965, color:'#8D6748', temp:[0,900], pres:[0,1] },
      { name:'Mantle', rOuter:0.965, rInner:0.545, color:'#E07A3F', temp:[900,3700], pres:[1,136] },
      { name:'Outer Core', rOuter:0.545, rInner:0.192, color:'#FFB300', temp:[3700,5200], pres:[136,330] },
      { name:'Inner Core', rOuter:0.192, rInner:0, color:'#FFF176', temp:[5200,6000], pres:[330,364] },
    ];

    function resize(){
      const w = stage.clientWidth, h = stage.clientHeight;
      canvas.width = w*devicePixelRatio; canvas.height = h*devicePixelRatio;
      canvas.style.width=w+'px'; canvas.style.height=h+'px';
    }
    function layerAt(fracDepth){ // fracDepth 0=surface,1=centre -> normalized radius = 1-fracDepth
      const nr = 1-fracDepth;
      return LAYERS.find(l=> nr<=l.rOuter+0.0001 && nr>=l.rInner-0.0001) || LAYERS[LAYERS.length-1];
    }
    function valueAt(layer, nr){
      const t = (layer.rOuter-nr)/(layer.rOuter-layer.rInner||1);
      const temp = layer.temp[0] + t*(layer.temp[1]-layer.temp[0]);
      const pres = layer.pres[0] + t*(layer.pres[1]-layer.pres[0]);
      return {temp:Math.round(temp), pres:Math.round(pres)};
    }

    function draw(){
      const ctx = ctx0, dpr=devicePixelRatio, w=canvas.width/dpr, h=canvas.height/dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,w,h);
      const cx=w/2, cy=h/2, R=Math.min(w,h)*0.42;
      // full sphere shading (right half) + cut wedge (left) exposing layers
      ctx.save();
      ctx.translate(cx,cy); ctx.rotate(angle*Math.PI/180);
      // draw layer wedges (pac-man style, 300deg arc so a wedge is missing)
      const start = 20*Math.PI/180, end = (360-20)*Math.PI/180;
      LAYERS.forEach(l=>{
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.arc(0,0,R*l.rOuter, start, end, false);
        ctx.closePath();
        ctx.fillStyle=l.color;
        ctx.fill();
      });
      // cut inner circle shape to remove overlap (draw inner layers again to reset order) -- already ok since loop draws outer to inner and overwrites center? Actually will overwrite: need reverse order draw outer first then inner overwrites correctly. Already outer->inner order so inner drawn last on top. Good.
      // grid lines depth rings
      ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.lineWidth=1;
      [0.965,0.545,0.192].forEach(r=>{ ctx.beginPath(); ctx.arc(0,0,R*r,start,end); ctx.stroke(); });
      ctx.restore();

      // solid sphere (uncut portion) for 3D feel
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(angle*Math.PI/180);
      ctx.beginPath(); ctx.arc(0,0,R,end,start+2*Math.PI,false); ctx.closePath();
      const grad = ctx.createRadialGradient(-R*0.3,-R*0.3,R*0.1,0,0,R);
      grad.addColorStop(0,'#8D6748'); grad.addColorStop(1,'#3E2C1C');
      ctx.fillStyle=grad; ctx.fill();
      ctx.restore();

      // labels
      ctx.fillStyle='#212121'; ctx.font='bold 11px sans-serif'; ctx.textAlign='left';
      const labelPos = [ [0.98,'Crust'], [0.75,'Mantle'], [0.37,'Outer Core'], [0.09,'Inner Core'] ];
      // seismic wave animation
      if(waveT!==null){
        waveT += 0.018;
        ['P','S'].forEach((type,i)=>{
          const speed = type==='P'? 1:0.6;
          const rr = waveT*R*1.6*speed;
          if(rr < R*1.1){
            ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
            ctx.strokeStyle = type==='P'? 'rgba(25,118,210,.7)':'rgba(229,57,53,.7)';
            ctx.lineWidth=2; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
          }
        });
        ctx.fillStyle='#1976D2'; ctx.font='11px sans-serif'; ctx.textAlign='left';
        ctx.fillText('— P-wave (fast, through solid & liquid)', 8, h-24);
        ctx.fillStyle='#E53935'; ctx.fillText('— S-wave (slower, blocked by liquid outer core)', 8, h-10);
        if(waveT>2.4) waveT=null;
      }
    }

    function animate(){ if(playing){ draw(); requestAnimationFrame(animate); } }
    let playing=false;
    function loop(){ draw(); if(waveT!==null || playing) requestAnimationFrame(loop); }
    loop();

    resize(); window.addEventListener('resize', ()=>{ resize(); draw(); });

    canvas.addEventListener('click', e=>{
      const r = canvas.getBoundingClientRect();
      const cx=r.width/2, cy=r.height/2, R=Math.min(r.width,r.height)*0.42;
      const x = e.clientX-r.left-cx, y=e.clientY-r.top-cy;
      const dist = Math.sqrt(x*x+y*y);
      const nr = Math.min(dist/R,1);
      const depthFrac = 1-nr;
      const layer = layerAt(depthFrac);
      const {temp,pres} = valueAt(layer, nr);
      const depthKm = Math.round(depthFrac*6371);
      api.setReadout(`<strong>${layer.name}</strong><br>Depth: ${depthKm} km<br>Temp: ~${temp}°C · Pressure: ~${pres} GPa`);
      probeCount++;
      api.pushRow([probeCount, depthKm, layer.name, temp, pres]);
      api.onFirstInteract();
    });

    addSlider(panel, {key:'rotate', label:'Rotate View', min:-90,max:90,step:1,value:-20,unit:'°', onInput:v=>{ angle=v; draw(); api.onFirstInteract(); }});
    const info = document.createElement('div'); info.className='panel-block';
    info.innerHTML = `<h3>🔎 How to use</h3><p class="small">Click anywhere inside the exposed cross-section to probe depth, temperature and pressure. Use Randomize to trigger a seismic wave from the surface and watch how P and S waves behave differently.</p>`;
    panel.appendChild(info);
    const legend = document.createElement('div'); legend.className='panel-block';
    legend.innerHTML = `<h3>🗺️ Layers</h3>` + LAYERS.map(l=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="width:14px;height:14px;border-radius:4px;background:${l.color};display:inline-block;"></span><span class="small">${l.name}</span></div>`).join('');
    panel.appendChild(legend);

    api.setReadout('Click the cross-section to probe a depth');

    return {
      onPlay(){ playing=true; loop(); },
      onPause(){ playing=false; },
      onReset(){ angle=-20; waveT=null; probeCount=0; api.setReadout('Click the cross-section to probe a depth'); draw(); },
      onRandomize(){ waveT=0; loop(); },
      onStep(dir){ angle = Math.max(-90,Math.min(90, angle+dir*10)); draw(); }
    };
  }
});
