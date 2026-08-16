/* ============================================================
   SIM 8 — LATITUDE & LONGITUDE EXPLORER
   ============================================================ */
registerSim('lat-long', {
  objectives:[
    "Locate any point on Earth using latitude and longitude coordinates.",
    "Explain how longitude determines time zones.",
    "Identify the Equator, Tropics, Polar Circles and Prime Meridian.",
    "Compare the Northern and Southern Hemispheres."
  ],
  intro:"Latitude and longitude form the grid we use to pinpoint any location on Earth. Drag the crosshair on the globe grid to read coordinates, explore time zones, and identify key reference lines.",
  background:"Latitude lines (parallels) run east-west and measure angular distance north or south of the Equator (0° to 90°). Longitude lines (meridians) run pole-to-pole and measure angular distance east or west of the Prime Meridian (0° to 180°). Because Earth rotates 360° in 24 hours, each 15° of longitude corresponds to a one-hour time difference — the basis of the world's time zones.",
  humanImpact:"GPS navigation, shipping, aviation and international law all depend on this coordinate system to precisely define locations, boundaries, and time zones across the globe.",
  realWorld:"Before satellite GPS, sailors used sextants to measure a star's angle above the horizon to determine latitude, and highly accurate chronometers to determine longitude by comparing local time to a reference time — a problem that took centuries to solve reliably.",
  facts:[
    "The Prime Meridian (0° longitude) passes through Greenwich, London, by international agreement in 1884.",
    "A single degree of latitude is always about 111 km, but a degree of longitude shrinks toward the poles.",
    "The International Date Line roughly follows the 180° meridian, with zig-zags to avoid splitting countries.",
    "At the Equator, day and night are close to 12 hours each, all year round."
  ],
  misconceptions:[
    "Latitude and longitude are not interchangeable — latitude measures north-south position, longitude measures east-west position.",
    "The Equator is not always the hottest place on Earth — altitude and other factors matter too.",
    "Time zones do not perfectly follow straight meridian lines — political borders adjust many boundaries."
  ],
  summary:"Latitude and longitude together create a global coordinate grid: latitude measures position north or south of the Equator, longitude measures position east or west of the Prime Meridian, and longitude also underlies the world's 24 time zones.",
  dataColumns:['Point #','Latitude','Longitude','Hemisphere','Approx. Local Time Offset'],
  graphSeries(){ return []; },
  quiz:[
    {q:"What does latitude measure?", options:["Distance east-west from the Prime Meridian", "Distance north-south from the Equator", "Altitude above sea level", "Distance from the nearest city"], correct:1, explain:"Latitude measures angular distance north or south of the Equator, from 0° to 90°."},
    {q:"How many degrees of longitude correspond to one hour of time difference?", options:["1°", "5°", "15°", "30°"], correct:2, explain:"Earth rotates 360° in 24 hours, so 360/24 = 15° of longitude equals one hour."},
    {q:"Where is 0° longitude (the Prime Meridian) located?", options:["New York", "Greenwich, London", "Tokyo", "The Equator"], correct:1, explain:"By international agreement in 1884, the Prime Meridian passes through Greenwich, London."},
    {q:"What is true about the length of one degree of longitude?", options:["It is always exactly 111 km", "It shrinks to zero at the poles", "It grows larger toward the poles", "It has no relationship to latitude"], correct:1, explain:"Meridians converge at the poles, so the physical distance covered by one degree of longitude shrinks toward zero there."},
    {q:"A point with 30°S latitude is located in which hemisphere?", options:["Northern Hemisphere", "Southern Hemisphere", "Eastern Hemisphere only", "It has no hemisphere"], correct:1, explain:"'S' denotes south of the Equator, placing the point in the Southern Hemisphere."},
  ],
  mount(stage, panel, api){
    stage.innerHTML = `<svg id="ll-svg" viewBox="0 0 600 400" style="width:100%;height:100%;cursor:crosshair;"></svg>`;
    const svg = stage.querySelector('svg');
    let lat=20, lon=40, pointCount=0, autoRotate=false, rotOffset=0;

    function render(){
      const w=600,h=400, cx=w/2, cy=h/2;
      let lines='';
      for(let la=-60; la<=60; la+=30){ const y=cy-(la/90)*(h/2-20); lines += `<line x1="30" y1="${y}" x2="${w-30}" y2="${y}" stroke="#B0BEC5" stroke-width="1"/><text x="4" y="${y+3}" font-size="9" fill="#5C6672">${la}°</text>`; }
      for(let lo=-150; lo<=150; lo+=30){ const x=cx+(lo/180)*(w/2-30)+rotOffset%(w); const xx = ((x-30)%(w-60)+(w-60))%(w-60)+30; lines += `<line x1="${xx}" y1="20" x2="${xx}" y2="${h-20}" stroke="#CFD8DC" stroke-width="1"/>`; }
      lines += `<line x1="30" y1="${cy}" x2="${w-30}" y2="${cy}" stroke="#E53935" stroke-width="2"/><text x="${w-70}" y="${cy-6}" font-size="10" fill="#B71C1C" font-weight="700">EQUATOR</text>`;
      const tropCancerY = cy-(23.5/90)*(h/2-20), tropCapY = cy+(23.5/90)*(h/2-20);
      const arcCircleY = cy-(66.5/90)*(h/2-20), antCircleY = cy+(66.5/90)*(h/2-20);
      lines += `<line x1="30" y1="${tropCancerY}" x2="${w-30}" y2="${tropCancerY}" stroke="#FFB300" stroke-dasharray="4 3"/><text x="${w-160}" y="${tropCancerY-4}" font-size="9" fill="#B87400">Tropic of Cancer</text>`;
      lines += `<line x1="30" y1="${tropCapY}" x2="${w-30}" y2="${tropCapY}" stroke="#FFB300" stroke-dasharray="4 3"/><text x="${w-170}" y="${tropCapY+12}" font-size="9" fill="#B87400">Tropic of Capricorn</text>`;
      lines += `<line x1="30" y1="${arcCircleY}" x2="${w-30}" y2="${arcCircleY}" stroke="#26C6DA" stroke-dasharray="4 3"/><text x="${w-150}" y="${arcCircleY-4}" font-size="9" fill="#00838F">Arctic Circle</text>`;
      lines += `<line x1="30" y1="${antCircleY}" x2="${w-30}" y2="${antCircleY}" stroke="#26C6DA" stroke-dasharray="4 3"/><text x="${w-160}" y="${antCircleY+12}" font-size="9" fill="#00838F">Antarctic Circle</text>`;
      lines += `<line x1="${cx}" y1="20" x2="${cx}" y2="${h-20}" stroke="#1976D2" stroke-width="2"/><text x="${cx+4}" y="30" font-size="10" fill="#1976D2" font-weight="700">PRIME MERIDIAN</text>`;

      const px = cx + (lon/180)*(w/2-30), py = cy - (lat/90)*(h/2-20);
      lines += `<circle cx="${px}" cy="${py}" r="6" fill="#E53935" stroke="#fff" stroke-width="2"/>`;
      lines += `<line x1="${px-14}" y1="${py}" x2="${px+14}" y2="${py}" stroke="#E53935"/><line x1="${px}" y1="${py-14}" x2="${px}" y2="${py+14}" stroke="#E53935"/>`;

      svg.innerHTML = `<rect width="${w}" height="${h}" fill="#F5F7FA"/>${lines}`;
    }
    render();

    function updateReadout(){
      const hemi = `${lat>=0?'Northern':'Southern'} & ${lon>=0?'Eastern':'Western'} Hemisphere`;
      const offset = Math.round(lon/15);
      api.setReadout(`Lat ${Math.abs(lat).toFixed(1)}°${lat>=0?'N':'S'}, Lon ${Math.abs(lon).toFixed(1)}°${lon>=0?'E':'W'}<br>${hemi}<br>UTC ${offset>=0?'+':''}${offset}:00 (approx.)`);
    }
    updateReadout();

    svg.addEventListener('click', e=>{
      const r = svg.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width*600, y=(e.clientY-r.top)/r.height*400;
      lon = ((x-300)/270*180); lat = ((200-y)/180*90);
      lon = Math.max(-180,Math.min(180,lon)); lat = Math.max(-90,Math.min(90,lat));
      render(); updateReadout();
      pointCount++;
      const offset = Math.round(lon/15);
      api.pushRow([pointCount, `${Math.abs(lat).toFixed(1)}°${lat>=0?'N':'S'}`, `${Math.abs(lon).toFixed(1)}°${lon>=0?'E':'W'}`, `${lat>=0?'N':'S'}/${lon>=0?'E':'W'}`, `UTC ${offset>=0?'+':''}${offset}`]);
      api.onFirstInteract();
    });

    addSlider(panel,{key:'lat',label:'Latitude',min:-90,max:90,step:1,value:20,unit:'°', onInput:v=>{lat=v; render(); updateReadout(); api.onFirstInteract();}});
    addSlider(panel,{key:'lon',label:'Longitude',min:-180,max:180,step:1,value:40,unit:'°', onInput:v=>{lon=v; render(); updateReadout(); api.onFirstInteract();}});

    const help = document.createElement('div'); help.className='panel-block';
    help.innerHTML = `<h3>🧭 Try it</h3><p class="small">Click anywhere on the grid to drop a pin, or use the sliders. Notice how longitude alone shifts the approximate time zone by 1 hour per 15°.</p>`;
    panel.appendChild(help);

    return {
      onPlay(){ /* no continuous animation needed */ },
      onPause(){},
      onReset(){ lat=20; lon=40; pointCount=0; render(); updateReadout(); },
      onRandomize(){ lat=Math.round(-90+Math.random()*180); lon=Math.round(-180+Math.random()*360); render(); updateReadout(); },
      onStep(dir){ lon = Math.max(-180,Math.min(180, lon+dir*15)); render(); updateReadout(); }
    };
  }
});
