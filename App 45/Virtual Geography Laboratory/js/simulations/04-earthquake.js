/* ============================================================
   SIM 4 — EARTHQUAKE LABORATORY
   ============================================================ */
registerSim('earthquake', {
  objectives:[
    "Distinguish focus (hypocentre) and epicentre of an earthquake.",
    "Compare P-waves, S-waves and surface waves by speed and effect.",
    "Relate stress accumulation and fault type to earthquake magnitude.",
    "Apply basic earthquake safety and preparedness principles."
  ],
  intro:"Earthquakes release energy stored in rocks as they suddenly slip along a fault. This lab lets you build up stress on a fault, trigger a rupture, and watch seismic waves radiate outward while a simple building responds to the shaking.",
  background:"Stress builds slowly as tectonic plates push against a locked fault. When the stress exceeds the rock's strength, the fault suddenly slips, releasing energy as seismic waves from the focus (the point of rupture underground). The epicentre is the point on the surface directly above the focus. P-waves (primary) arrive first and compress rock like a slinky; S-waves (secondary) arrive next and shake rock side to side; surface waves arrive last but cause the most damage as they roll and shake the ground surface.",
  humanImpact:"Earthquake engineering — flexible foundations, base isolators, and building codes — has dramatically reduced casualties in quake-prone cities. Early-warning systems can give seconds to tens of seconds of warning by detecting fast P-waves before damaging S- and surface waves arrive.",
  realWorld:"Japan's earthquake early-warning system automatically slows bullet trains and pauses factory lines the moment P-waves are detected, using the few precious seconds before stronger shaking arrives.",
  facts:[
    "The largest recorded earthquake, the 1960 Great Chilean Earthquake, measured moment magnitude 9.5.",
    "The Richter scale is logarithmic — each whole number increase means about 32 times more energy release.",
    "Most earthquakes occur along plate boundaries, but some occur within plates due to ancient fault zones.",
    "Millions of small earthquakes occur every year; most are too weak to be felt."
  ],
  misconceptions:[
    "'Earthquake weather' is not real — earthquakes are not linked to weather or temperature.",
    "The ground does not literally 'open up and swallow' people in most earthquakes — that is a myth from movies.",
    "Small earthquakes do not reliably prevent 'the big one' by releasing pressure gradually."
  ],
  summary:"Earthquakes originate at a focus below the surface and radiate P-waves, S-waves, and surface waves outward, with the epicentre marking the surface point directly above. Magnitude depends on how much stress accumulates before a fault ruptures, and preparedness measures like early warning and resilient construction significantly reduce harm.",
  dataColumns:['Event #','Fault Type','Stress Level','Magnitude (est.)','Shaking Intensity'],
  graphSeries(rows){ return [{name:'Magnitude', color:'#4A4A4E', data:rows.map(r=>r[3])}]; },
  quiz:[
    {q:"What is the difference between focus and epicentre?", options:["They are the same thing","Focus is underground; epicentre is the surface point above it","Epicentre is underground; focus is on the surface","Focus is for P-waves only"], correct:1, explain:"The focus (hypocentre) is where rupture begins underground; the epicentre is the point directly above it on the surface."},
    {q:"Which seismic wave arrives first at a recording station?", options:["Surface wave","S-wave","P-wave","None, they arrive together"], correct:2, explain:"P-waves (primary/compressional waves) travel fastest through rock and arrive first."},
    {q:"Which wave type usually causes the most surface damage?", options:["P-wave","S-wave","Surface waves","Sound waves"], correct:2, explain:"Surface waves arrive last but roll and shake the ground with the largest amplitude, causing most structural damage."},
    {q:"On the Richter-type magnitude scale, an increase of 1 whole number means roughly how much more energy release?", options:["2 times","10 times","32 times","100 times"], correct:2, explain:"The scale is logarithmic in amplitude but energy increases roughly 32-fold per whole magnitude step."},
    {q:"What primarily determines earthquake magnitude in this simulation?", options:["Time of day","Amount of stress accumulated before rupture","Distance from the ocean","Cloud cover"], correct:1, explain:"Greater accumulated stress released in a rupture generally corresponds to a larger magnitude earthquake."},
  ],
  mount(stage, panel, api){
    stage.innerHTML = `<canvas id="eq-canvas"></canvas>`;
    const canvas = stage.querySelector('canvas'); const ctx = canvas.getContext('2d');
    let stress=30, faultType='normal', rupturing=false, waveR=0, eventCount=0, buildingShake=0;

    function resize(){ const w=stage.clientWidth,h=stage.clientHeight; canvas.width=w*devicePixelRatio; canvas.height=h*devicePixelRatio; canvas.style.width=w+'px'; canvas.style.height=h+'px'; }
    resize(); window.addEventListener('resize', ()=>{ resize(); draw(); });

    function magnitudeEstimate(){ return Math.min(9.5, (2 + stress/100*6).toFixed(1)); }

    function draw(){
      const dpr=devicePixelRatio, w=canvas.width/dpr, h=canvas.height/dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      ctx.fillStyle='#EAF3FC'; ctx.fillRect(0,0,w,h);
      const groundY = h*0.62;
      // fault line (offset depending on type)
      ctx.fillStyle='#C9A876'; ctx.fillRect(0,groundY,w,h-groundY);
      const midX = w/2;
      const faultOffset = faultType==='normal'? 14 : faultType==='reverse'? -14 : 0;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(midX-2,groundY); ctx.lineTo(midX+2,h); ctx.lineTo(midX+2+ (faultType==='transform'?20:0), h); ctx.lineTo(midX-2+(faultType==='transform'?20:0),groundY); ctx.closePath();
      ctx.fillStyle='#8D6748'; ctx.fill();
      ctx.restore();
      ctx.strokeStyle='#3E2723'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(midX,groundY); ctx.lineTo(midX,h); ctx.stroke();

      // focus
      const focusX = midX, focusY = groundY + (h-groundY)*0.55;
      ctx.beginPath(); ctx.arc(focusX,focusY,5,0,7); ctx.fillStyle='#E53935'; ctx.fill();
      ctx.font='10px sans-serif'; ctx.fillStyle='#3E2723'; ctx.fillText('Focus', focusX+8, focusY+3);

      // epicentre marker
      ctx.beginPath(); ctx.moveTo(midX,groundY-14); ctx.lineTo(midX-7,groundY-2); ctx.lineTo(midX+7,groundY-2); ctx.closePath();
      ctx.fillStyle='#1976D2'; ctx.fill();
      ctx.fillText('Epicentre', midX+9, groundY-4);

      // building
      const bx = w*0.72, by=groundY;
      const shakeOffset = rupturing? Math.sin(waveR*0.6)*buildingShake : 0;
      ctx.save(); ctx.translate(shakeOffset,0);
      ctx.fillStyle='#607D8B'; ctx.fillRect(bx,by-70,50,70);
      for(let i=0;i<3;i++){ ctx.fillStyle='#B3E5FC'; ctx.fillRect(bx+8,by-60+i*22,12,10); ctx.fillRect(bx+30,by-60+i*22,12,10); }
      ctx.restore();

      // waves
      if(rupturing){
        ['P','S','Surface'].forEach((type,i)=>{
          const speed = type==='P'?1:type==='S'?0.65:0.5;
          const r = waveR*speed;
          if(r>0 && r<w){
            ctx.beginPath(); ctx.arc(focusX,focusY,r,Math.PI,2*Math.PI);
            ctx.strokeStyle = type==='P'?'rgba(25,118,210,.8)':type==='S'?'rgba(229,57,53,.8)':'rgba(255,179,0,.9)';
            ctx.lineWidth = type==='Surface'?3:1.6;
            ctx.stroke();
          }
        });
      }
      ctx.fillStyle='#5C6672'; ctx.font='10px sans-serif';
      ctx.fillText(`Stress: ${stress}%  ·  Est. Magnitude: ${rupturing? magnitudeEstimate(): '—'}`, 8, 16);
    }
    draw();

    function loop(){
      if(!rupturing) return;
      waveR += 6;
      buildingShake = Math.max(0, 14 - waveR/12);
      draw();
      if(waveR < 260) requestAnimationFrame(loop);
      else { rupturing=false; stress=Math.max(0,stress-stress); draw(); api.setReadout('Rupture complete — stress released. Rebuild stress and trigger again.'); }
    }

    addChipGroup(panel, {key:'fault', label:'Fault Type', value:faultType,
      options:[{value:'normal',label:'Normal'},{value:'reverse',label:'Reverse'},{value:'transform',label:'Transform'}],
      onChange:v=>{ faultType=v; draw(); api.onFirstInteract(); }
    });
    addSlider(panel, {key:'stress', label:'Accumulated Stress', min:5,max:100,step:1,value:30,unit:'%', onInput:v=>{ stress=v; api.onFirstInteract(); }});

    const tips = document.createElement('div'); tips.className='panel-block';
    tips.innerHTML = `<h3>🛡️ Safety & Preparedness</h3><ul style="margin:0;padding-left:16px;" class="small">
      <li>Drop, Cover, and Hold On during shaking.</li>
      <li>Keep an emergency kit with water, torch, and first aid.</li>
      <li>Identify safe spots away from windows and heavy furniture.</li>
      <li>Practise evacuation routes and family meeting points.</li>
    </ul>`;
    panel.appendChild(tips);

    api.setReadout('Increase stress, then press Play to trigger rupture');

    return {
      onPlay(){ if(rupturing) return; rupturing=true; waveR=0; buildingShake=14; eventCount++;
        const intensity = stress>75?'Severe':stress>45?'Moderate':'Light';
        api.pushRow([eventCount, faultType, stress, magnitudeEstimate(), intensity]);
        api.setReadout('Rupture in progress...'); loop();
      },
      onPause(){ rupturing=false; },
      onReset(){ rupturing=false; waveR=0; stress=30; eventCount=0; draw(); api.setReadout('Increase stress, then press Play to trigger rupture'); },
      onRandomize(){ stress=5+Math.floor(Math.random()*95); faultType=['normal','reverse','transform'][Math.floor(Math.random()*3)]; draw(); },
      onStep(dir){ stress=Math.max(0,Math.min(100,stress+dir*10)); draw(); }
    };
  }
});
