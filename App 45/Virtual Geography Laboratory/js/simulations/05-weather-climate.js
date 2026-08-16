/* ============================================================
   SIM 5 — WEATHER & CLIMATE STUDIO
   ============================================================ */
registerSim('weather-climate', {
  objectives:[
    "Control temperature, humidity and pressure to generate different weather.",
    "Explain how humidity and temperature combine to produce clouds and rain.",
    "Distinguish short-term weather from long-term climate.",
    "Identify major climate zones and their typical conditions."
  ],
  intro:"Weather is the atmosphere's day-to-day mood; climate is its long-term personality. In this studio you control temperature, humidity, pressure and wind to generate real-time weather, and see how repeated patterns define a climate zone.",
  background:"Warm air holds more moisture than cold air. When humid air cools — for example as it rises — it may reach its dew point and condense into clouds; if droplets grow heavy enough, precipitation falls. Low air pressure is associated with rising air, clouds and storms, while high pressure is associated with sinking air and clear skies. Climate is the average of weather conditions over 30+ years, shaped by latitude, altitude, ocean currents and prevailing winds.",
  humanImpact:"Weather forecasting protects lives and property from storms, while understanding climate zones guides agriculture, urban planning, and clothing and building design suited to local conditions.",
  realWorld:"Meteorologists combine satellite imagery, weather balloons and computer models to forecast weather days in advance, while climatologists analyse decades of data to identify long-term climate trends and shifts.",
  facts:[
    "A single cumulonimbus thunderstorm cloud can weigh over a million tonnes.",
    "The wettest inhabited place on Earth, Mawsynram in India, receives over 11,000 mm of rain a year.",
    "Air pressure decreases by about half every 5,500 metres of altitude gained.",
    "The coldest recorded natural temperature on Earth was −89.2°C in Antarctica."
  ],
  misconceptions:[
    "Weather and climate are not the same — a single cold day does not disprove long-term climate patterns.",
    "Clouds are not made of steam or smoke — they are tiny water droplets or ice crystals suspended in air.",
    "Lightning can strike the same place more than once — tall structures are struck repeatedly."
  ],
  summary:"Weather results from the moment-to-moment interaction of temperature, humidity, pressure and wind, while climate is the long-term statistical average of these conditions in a region. Rising, cooling, moist air tends to produce clouds and precipitation, while sinking air brings clear, dry conditions.",
  dataColumns:['Time (min)','Temp (°C)','Humidity (%)','Pressure (hPa)','Condition'],
  graphSeries(rows){ return [
    {name:'Temp (°C)', color:'#E53935', data:rows.map(r=>r[1])},
    {name:'Humidity (%)', color:'#1976D2', data:rows.map(r=>r[2])},
  ]; },
  quiz:[
    {q:"What generally happens when warm, humid air rises and cools?", options:["It becomes drier","Clouds may form as water vapour condenses","Pressure increases sharply","Nothing changes"], correct:1, explain:"Cooling humid air can reach its dew point, causing water vapour to condense into cloud droplets."},
    {q:"Low atmospheric pressure is usually associated with:", options:["Clear skies and sinking air","Clouds, rain and rising air","No wind at all","Only cold temperatures"], correct:1, explain:"Low pressure systems are linked to rising air, which cools and condenses into clouds and precipitation."},
    {q:"What is the key difference between weather and climate?", options:["Weather is long-term; climate is short-term","They mean exactly the same thing","Weather is day-to-day; climate is the long-term average pattern","Climate only applies to deserts"], correct:2, explain:"Weather describes current atmospheric conditions, while climate describes typical patterns averaged over decades."},
    {q:"Which factor does NOT directly influence a region's climate?", options:["Latitude","Altitude","Ocean currents","The day of the week"], correct:3, explain:"Climate is shaped by latitude, altitude, and ocean currents among other physical factors — not arbitrary calendar timing."},
    {q:"Why does warm air hold more moisture than cold air?", options:["Warm air molecules move faster, allowing more water vapour capacity","Cold air repels water","Warm air is denser","There is no relationship"], correct:0, explain:"Warmer air has greater capacity to hold water vapour before reaching saturation (its dew point)."},
  ],
  mount(stage, panel, api){
    stage.innerHTML = `<canvas id="wc-canvas"></canvas>`;
    const canvas = stage.querySelector('canvas'); const ctx = canvas.getContext('2d');
    let temp=25, humidity=50, pressure=1013, wind=10, running=false, t=0, minute=0, drops=[];

    function resize(){ const w=stage.clientWidth,h=stage.clientHeight; canvas.width=w*devicePixelRatio; canvas.height=h*devicePixelRatio; canvas.style.width=w+'px'; canvas.style.height=h+'px'; }
    resize(); window.addEventListener('resize', ()=>{ resize(); draw(); });

    function condition(){
      if(pressure<1000 && humidity>70) return temp>28? 'Thunderstorm':'Heavy Rain';
      if(humidity>65 && pressure<1010) return 'Rain';
      if(humidity>55) return 'Cloudy';
      if(temp<2 && humidity>50) return 'Snow';
      return 'Clear';
    }
    function skyColor(){
      const cond = condition();
      if(cond==='Clear') return ['#64B5F6','#BBDEFB'];
      if(cond==='Cloudy') return ['#90A4AE','#CFD8DC'];
      return ['#546E7A','#78909C'];
    }

    function draw(){
      const dpr=devicePixelRatio, w=canvas.width/dpr, h=canvas.height/dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      const [c1,c2]=skyColor();
      const grad = ctx.createLinearGradient(0,0,0,h); grad.addColorStop(0,c1); grad.addColorStop(1,c2);
      ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
      // sun
      if(condition()==='Clear'){ ctx.beginPath(); ctx.arc(w*0.82,h*0.2,26,0,7); ctx.fillStyle='#FFD54F'; ctx.fill(); }
      // clouds
      const cloudCount = Math.round(humidity/12);
      for(let i=0;i<cloudCount;i++){
        const cx = ((t*wind*0.3)+i*90)%(w+120)-60, cy = 40+ (i%3)*30;
        ctx.beginPath(); ctx.fillStyle='rgba(255,255,255,0.85)';
        ctx.arc(cx,cy,20,0,7); ctx.arc(cx+22,cy+6,16,0,7); ctx.arc(cx-20,cy+8,15,0,7); ctx.fill();
      }
      // ground
      ctx.fillStyle='#7CB37C'; ctx.fillRect(0,h*0.78,w,h*0.22);
      // precipitation
      const cond = condition();
      if(cond.includes('Rain') || cond==='Thunderstorm'){
        if(running){ for(let i=0;i<6;i++) drops.push({x:Math.random()*w, y:0, v:4+Math.random()*4}); }
        drops.forEach(d=>{ ctx.strokeStyle='rgba(120,170,220,.8)'; ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(d.x-2,d.y+8); ctx.stroke(); });
        drops = drops.filter(d=>d.y<h*0.78).map(d=>({...d,y:d.y+d.v,x:d.x-1}));
      } else if(cond==='Snow'){
        if(running){ for(let i=0;i<3;i++) drops.push({x:Math.random()*w, y:0, v:1+Math.random()*1.5}); }
        drops.forEach(d=>{ ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(d.x,d.y,2,0,7); ctx.fill(); });
        drops = drops.filter(d=>d.y<h*0.78).map(d=>({...d,y:d.y+d.v,x:d.x+Math.sin(d.y/10)}));
      } else { drops=[]; }
      if(cond==='Thunderstorm' && Math.random()<0.03){
        ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(0,0,w,h);
      }
      ctx.fillStyle='#212121'; ctx.font='bold 12px sans-serif'; ctx.fillText(cond, 10, 18);
    }
    draw();

    function loop(){
      if(!running) return;
      t++;
      if(t%20===0){ minute++; api.pushRow([minute, temp, humidity, pressure, condition()]); }
      draw();
      requestAnimationFrame(loop);
    }

    function updateZone(){
      let zone='Temperate';
      if(temp>26 && humidity>65) zone='Tropical (rainforest/monsoon)';
      else if(temp>26 && humidity<35) zone='Arid (desert)';
      else if(temp<5) zone='Polar / Cold';
      else if(temp>=5 && temp<=26 && humidity>=35) zone='Temperate';
      const badge = document.getElementById('climate-zone-badge');
      if(badge) badge.textContent = zone;
    }
    addSlider(panel,{key:'temp',label:'Temperature',min:-10,max:45,step:1,value:25,unit:'°C', onInput:v=>{temp=v; draw(); updateZone(); api.onFirstInteract();}});
    addSlider(panel,{key:'humid',label:'Humidity',min:0,max:100,step:1,value:50,unit:'%', onInput:v=>{humidity=v; draw(); updateZone(); api.onFirstInteract();}});
    addSlider(panel,{key:'pres',label:'Air Pressure',min:970,max:1040,step:1,value:1013,unit:' hPa', onInput:v=>{pressure=v; draw(); api.onFirstInteract();}});
    addSlider(panel,{key:'wind',label:'Wind Speed',min:0,max:60,step:1,value:10,unit:' km/h', onInput:v=>{wind=v; draw(); api.onFirstInteract();}});

    const zoneBlock = document.createElement('div'); zoneBlock.className='panel-block';
    zoneBlock.innerHTML = `<h3>🌐 Climate Zone Preview</h3><p class="small">If these conditions persisted for 30 years, this would resemble:</p><div class="badge badge-blue" id="climate-zone-badge">—</div>`;
    panel.appendChild(zoneBlock);
    updateZone();

    api.setReadout('Adjust the atmosphere, then press Play to run weather in real time');

    return {
      onPlay(){ running=true; loop(); },
      onPause(){ running=false; },
      onReset(){ running=false; t=0; minute=0; drops=[]; temp=25;humidity=50;pressure=1013;wind=10; draw(); },
      onRandomize(){ temp=Math.round(-10+Math.random()*55); humidity=Math.round(Math.random()*100); pressure=Math.round(970+Math.random()*70); draw(); updateZone(); },
      onStep(dir){ minute+=dir; draw(); }
    };
  }
});
