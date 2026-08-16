/* ============================================================
   PAGES: MAP CENTRE • HANDBOOK • GLOSSARY • QUIZ CENTRE
   ============================================================ */

/* ---------------- MAP CENTRE ---------------- */
const MAP_LAYERS = {
  political: { label:'Political', render: mapPolitical },
  physical: { label:'Physical / Relief', render: mapPhysical },
  climate: { label:'Climate Zones', render: mapClimate },
  population: { label:'Population Density', render: mapPopulation },
  vegetation: { label:'Vegetation', render: mapVegetation },
};

function pageMap(){
  const page = document.getElementById('page');
  page.innerHTML = `
    <h1>Interactive Map Centre</h1>
    <p class="small" style="margin-bottom:16px;">Switch layers, zoom, pan and find coordinates on a stylised world map.</p>
    <div class="map-controls">
      <div class="chip-row" id="layer-chips">
        ${Object.entries(MAP_LAYERS).map(([k,v],i)=>`<button class="chip ${i===0?'active':''}" data-layer="${k}">${v.label}</button>`).join('')}
      </div>
    </div>
    <div class="sim-layout">
      <div class="sim-stage">
        <div class="sim-toolbar" style="margin-bottom:12px;">
          <button class="btn-icon" id="map-zoom-in" title="Zoom in">+</button>
          <button class="btn-icon" id="map-zoom-out" title="Zoom out">−</button>
          <button class="btn-icon" id="map-reset" title="Reset view">${ICONS.reset}</button>
          <div class="divider"></div>
          <span class="small" id="map-coord">Move mouse over map to read coordinates</span>
        </div>
        <div class="map-frame" style="aspect-ratio:16/9;">
          <svg id="map-svg" viewBox="0 0 800 400" style="width:100%;height:100%;cursor:crosshair;"></svg>
        </div>
      </div>
      <div class="sim-panel">
        <div class="panel-block">
          <h3>${ICONS.search} Find a place</h3>
          <div class="search-box"><input id="map-search" placeholder="e.g. Equator, Tropic of Cancer..."></div>
          <p class="small" style="margin-top:10px;">Try: Equator, Prime Meridian, Tropic of Cancer, Tropic of Capricorn, Arctic Circle, Antarctic Circle.</p>
        </div>
        <div class="panel-block">
          <h3>${ICONS.info} Legend</h3>
          <div id="map-legend"></div>
        </div>
        <div class="panel-block">
          <h3>Distance Tool</h3>
          <p class="small">Click two points on the map to estimate the great-circle distance (approx., stylised projection).</p>
          <div class="stat-tile"><div class="v" id="map-distance">—</div><div class="l">Estimated distance</div></div>
        </div>
      </div>
    </div>
  `;
  let scale=1, panX=0, panY=0, currentLayer='political', clicks=[];
  const svg = document.getElementById('map-svg');
  function draw(){
    svg.innerHTML = `<g transform="translate(${panX} ${panY}) scale(${scale})">${MAP_LAYERS[currentLayer].render()}</g>`;
    document.getElementById('map-legend').innerHTML = mapLegendHTML(currentLayer);
  }
  draw();
  document.getElementById('layer-chips').addEventListener('click', e=>{
    if(e.target.dataset.layer){
      document.querySelectorAll('#layer-chips .chip').forEach(c=>c.classList.remove('active'));
      e.target.classList.add('active'); currentLayer = e.target.dataset.layer; draw();
    }
  });
  document.getElementById('map-zoom-in').onclick=()=>{ scale=Math.min(scale*1.25,4); draw(); };
  document.getElementById('map-zoom-out').onclick=()=>{ scale=Math.max(scale/1.25,0.6); draw(); };
  document.getElementById('map-reset').onclick=()=>{ scale=1;panX=0;panY=0; clicks=[]; document.getElementById('map-distance').textContent='—'; draw(); };
  svg.addEventListener('mousemove', e=>{
    const r = svg.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width*800, y=(e.clientY-r.top)/r.height*400;
    const lon = ((x-400)/400*180).toFixed(1), lat = ((200-y)/200*90).toFixed(1);
    document.getElementById('map-coord').textContent = `Lat ${lat}°, Lon ${lon}°`;
  });
  svg.addEventListener('click', e=>{
    const r = svg.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width*800, y=(e.clientY-r.top)/r.height*400;
    clicks.push({x,y});
    if(clicks.length>2) clicks=[clicks[1],{x,y}];
    if(clicks.length===2){
      const dx=clicks[0].x-clicks[1].x, dy=clicks[0].y-clicks[1].y;
      const pxDist = Math.sqrt(dx*dx+dy*dy);
      const km = Math.round(pxDist * 50); // stylised scale: 1px ≈ 50km
      document.getElementById('map-distance').textContent = km.toLocaleString()+' km';
    }
  });
  document.getElementById('map-search').addEventListener('input', e=>{
    const q = e.target.value.toLowerCase();
    const known = {equator:'y=200', 'prime meridian':'x=400','tropic of cancer':'y≈133 (23.5°N)','tropic of capricorn':'y≈267 (23.5°S)','arctic circle':'y≈45 (66.5°N)','antarctic circle':'y≈355 (66.5°S)'};
    const hit = Object.keys(known).find(k=>k.includes(q)&&q.length>2);
    if(hit) toast(`${hit[0].toUpperCase()+hit.slice(1)} → ${known[hit]}`);
  });
}
function mapLegendHTML(layer){
  const legends = {
    political:['#8FCB8F Country A','#8FB8E8 Country B','#E8C68F Country C'],
    physical:['#2E7D32 Lowland','#C9A876 Plateau','#8D6748 Mountain','#0E6BA8 Ocean'],
    climate:['#2E7D32 Tropical','#FFB300 Arid','#64B5F6 Temperate','#B3E5FC Polar'],
    population:['#FFECB3 Sparse','#FFB300 Moderate','#E53935 Dense'],
    vegetation:['#1B5E20 Rainforest','#7CB342 Grassland','#C9A876 Desert scrub','#37474F Tundra'],
  };
  return (legends[layer]||[]).map(l=>{ const [c,...rest]=l.split(' '); return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="width:14px;height:14px;border-radius:4px;background:${c};display:inline-block;"></span><span class="small">${rest.join(' ')}</span></div>`; }).join('');
}
function landmassPath(){ return `<path d="M120 120 Q200 80 280 110 T420 130 Q480 150 460 200 Q440 260 360 270 Q280 290 240 240 Q180 260 150 200 Q110 170 120 120Z" />
<path d="M480 150 Q560 130 620 160 Q680 180 660 230 Q640 280 570 270 Q520 260 500 210 Q470 190 480 150Z"/>
<path d="M550 260 Q600 250 630 280 Q640 320 600 330 Q560 330 550 300Z"/>`; }
function mapPolitical(){ return `<rect width="800" height="400" fill="#BEE3F8"/><g fill="#8FCB8F" stroke="#fff" stroke-width="1.5">${landmassPath()}</g>
<line x1="0" y1="200" x2="800" y2="200" stroke="#E53935" stroke-dasharray="6 4" stroke-width="1.2"/><text x="6" y="196" font-size="10" fill="#B71C1C">Equator</text>
<line x1="400" y1="0" x2="400" y2="400" stroke="#1976D2" stroke-dasharray="6 4" stroke-width="1"/><text x="404" y="14" font-size="10" fill="#1976D2">Prime Meridian</text>`; }
function mapPhysical(){ return `<rect width="800" height="400" fill="#DCEFFA"/><g fill="#C9A876" stroke="#8D6748" stroke-width="1">${landmassPath()}</g>
<circle cx="230" cy="150" r="14" fill="#8D6748"/><circle cx="560" cy="190" r="10" fill="#8D6748"/>
<path d="M180 260 Q220 220 260 250 T340 240" stroke="#0E6BA8" stroke-width="3" fill="none"/>
<line x1="0" y1="200" x2="800" y2="200" stroke="#E53935" stroke-dasharray="6 4" stroke-width="1"/>`; }
function mapClimate(){ return `<rect width="800" height="130" fill="#B3E5FC"/><rect y="130" width="800" height="70" fill="#64B5F6"/><rect y="200" width="800" height="70" fill="#2E7D32"/><rect y="270" width="800" height="60" fill="#64B5F6"/><rect y="330" width="800" height="70" fill="#B3E5FC"/>
<g fill="#000" opacity="0.12">${landmassPath()}</g><line x1="0" y1="200" x2="800" y2="200" stroke="#fff" stroke-dasharray="6 4"/>`; }
function mapPopulation(){ return `<rect width="800" height="400" fill="#FFF7E0"/><g fill="#FFE082">${landmassPath()}</g>
<circle cx="230" cy="150" r="26" fill="#E53935" opacity="0.6"/><circle cx="560" cy="190" r="18" fill="#FFB300" opacity="0.7"/><circle cx="360" cy="230" r="12" fill="#FFB300" opacity="0.7"/>`; }
function mapVegetation(){ return `<rect width="800" height="400" fill="#E8F5E9"/><g fill="#7CB342">${landmassPath()}</g>
<path d="M150 130 Q250 100 350 140" stroke="#1B5E20" stroke-width="18" fill="none" opacity="0.5"/>
<rect x="480" y="150" width="180" height="90" fill="#C9A876" opacity="0.6"/>`; }

/* ---------------- HANDBOOK ---------------- */
const HANDBOOK_SECTIONS = [
  { t:'Landforms', c:'Mountains, plateaus, plains and valleys are the four major landform types. Mountains rise sharply above surrounding land; plateaus are elevated flatlands; plains are low, level land often formed by river deposition; valleys are long depressions carved by rivers or glaciers.' },
  { t:'Climate Zones', c:'Earth is divided into tropical, arid, temperate, continental and polar climate zones, primarily controlled by latitude, altitude, and distance from oceans. Each zone supports characteristic vegetation and human settlement patterns.' },
  { t:'Rock Types', c:'Igneous rocks form from cooled magma or lava (granite, basalt). Sedimentary rocks form from compressed layers of sediment (sandstone, limestone). Metamorphic rocks form when existing rocks are transformed by heat and pressure (marble, slate).' },
  { t:'Weather Instruments', c:'A thermometer measures temperature, a barometer measures atmospheric pressure, a rain gauge measures precipitation, an anemometer measures wind speed, and a wind vane shows wind direction.' },
  { t:'Map Symbols & Scale', c:'Maps use standardised symbols to represent features like roads, rivers, and settlements. Scale expresses the ratio between map distance and real-world distance, shown as a ratio (1:50,000), a statement, or a graphical bar scale.' },
  { t:'GIS Basics', c:'A Geographic Information System (GIS) stores, analyses and displays spatial data in layers — such as roads, elevation, and land use — that can be combined to reveal spatial patterns and relationships.' },
  { t:'Latitude & Longitude', c:'Latitude lines run east-west and measure distance north or south of the Equator (0°–90°). Longitude lines run north-south and measure distance east or west of the Prime Meridian (0°–180°). Together they form a coordinate grid for locating any point on Earth.' },
  { t:'Earth Facts', c:'Earth has a mean radius of about 6,371 km, orbits the Sun in about 365.25 days, and completes one rotation in 23 hours 56 minutes. About 71% of its surface is covered by water.' },
  { t:'Measurement Units', c:'Geographers commonly use metres and kilometres for distance, degrees for angles and coordinates, hectopascals for pressure, millimetres for rainfall, and the Richter/moment magnitude scale for earthquake size.' },
];
function pageHandbook(){
  const page = document.getElementById('page');
  page.innerHTML = `<h1>Geography Handbook</h1><p class="small" style="margin-bottom:20px;">Core reference concepts every geographer should know.</p>
  <div class="card"><div class="card-body">
    ${HANDBOOK_SECTIONS.map(s=>`<details class="accordion-item"><summary>${s.t}</summary><div class="content">${s.c}</div></details>`).join('')}
  </div></div>`;
}

/* ---------------- GLOSSARY ---------------- */
const GLOSSARY = [
  {term:'Aquifer', def:'An underground layer of rock or sediment that holds and transmits groundwater.'},
  {term:'Basin (Drainage)', def:'The area of land drained by a river and all its tributaries.'},
  {term:'Contour Line', def:'A line on a map connecting points of equal elevation.'},
  {term:'Delta', def:'A landform created where a river deposits sediment as it enters a sea or lake.'},
  {term:'Epicentre', def:'The point on Earth\'s surface directly above an earthquake\'s focus.'},
  {term:'Erosion', def:'The wearing away of rock or soil by wind, water, or ice.'},
  {term:'Fault', def:'A fracture in rock along which movement has occurred.'},
  {term:'GIS', def:'Geographic Information System — software for capturing and analysing spatial data.'},
  {term:'Humidity', def:'The amount of water vapour present in the air.'},
  {term:'Isotherm', def:'A line on a map connecting points of equal temperature.'},
  {term:'Meander', def:'A winding curve or bend in a river channel.'},
  {term:'Magma', def:'Molten rock beneath Earth\'s surface.'},
  {term:'Plate Boundary', def:'The edge where two tectonic plates meet and interact.'},
  {term:'Precipitation', def:'Water that falls from the atmosphere as rain, snow, sleet, or hail.'},
  {term:'Salinity', def:'The concentration of dissolved salts in seawater.'},
  {term:'Thermohaline Circulation', def:'Ocean circulation driven by differences in temperature and salinity.'},
  {term:'Urbanisation', def:'The increasing proportion of a population living in cities.'},
  {term:'Weathering', def:'The breakdown of rock in place, without movement, by physical or chemical processes.'},
];
function pageGlossary(){
  const page = document.getElementById('page');
  page.innerHTML = `<h1>Illustrated Glossary</h1>
  <div class="search-box" style="max-width:400px;margin:16px 0;">${ICONS.search}<input id="gloss-search" placeholder="Search terms..."></div>
  <div id="gloss-list"></div>`;
  function render(filter){
    const items = GLOSSARY.filter(g=>!filter || g.term.toLowerCase().includes(filter) || g.def.toLowerCase().includes(filter)).sort((a,b)=>a.term.localeCompare(b.term));
    let html=''; let lastLetter='';
    items.forEach(g=>{
      const L = g.term[0].toUpperCase();
      if(L!==lastLetter){ html+=`<div class="glossary-letter">${L}</div>`; lastLetter=L; }
      html+=`<div class="glossary-item"><div class="term">${g.term}</div><p class="small">${g.def}</p></div>`;
    });
    document.getElementById('gloss-list').innerHTML = html || '<p class="small">No terms found.</p>';
  }
  render('');
  document.getElementById('gloss-search').addEventListener('input', e=>render(e.target.value.toLowerCase()));
}

/* ---------------- QUIZ CENTRE ---------------- */
function pageQuizCentre(){
  const s = Store.state;
  const page = document.getElementById('page');
  page.innerHTML = `<h1>Quiz Centre</h1><p class="small" style="margin-bottom:20px;">Test your knowledge from every laboratory.</p>
  <div class="sim-grid">
    ${SIMULATIONS.map(sim=>{
      const q = s.quizScores[sim.id];
      return `<div class="card" style="cursor:pointer;" onclick="Router.go('/sim/${sim.id}')"><div class="card-body">
        <div class="thumb" style="background:${sim.color};height:70px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px;margin-bottom:10px;">${sim.icon}</div>
        <h3 style="font-size:15px;">${sim.title}</h3>
        <p class="small">${q? `Best: ${q.best}/10 · ${q.attempts} attempt(s)` : 'Not attempted yet'}</p>
      </div></div>`;
    }).join('')}
  </div>`;
}
