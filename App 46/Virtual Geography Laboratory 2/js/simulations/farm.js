(function(){
  const SIM='farm';
  const COLS=6, ROWS=5;

  // deterministic pseudo-random parcel attributes (seeded so it's stable per session but varied)
  function seededRand(seed){ let s = seed; return ()=>{ s = (s*9301+49297) % 233280; return s/233280; }; }
  const rnd = seededRand(42);
  const SOILS=['Loam','Clay','Sandy','Silt'];
  const parcels = [];
  for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++){
    parcels.push({
      id:`${x}-${y}`, x, y,
      soil: SOILS[Math.floor(rnd()*SOILS.length)],
      slope: Math.round(rnd()*30), // 0-30 degrees
      drainage: rnd()>0.6 ? 'Good' : (rnd()>0.3?'Moderate':'Poor'),
      elevation: Math.round(200+rnd()*1200) // metres
    });
  }

  const CROPS = {
    rice:   {label:'Rice 🌾', soil:['Silt','Clay'], slopeMax:5, drainage:['Poor','Moderate'], elevMax:600},
    wheat:  {label:'Wheat 🌿', soil:['Loam','Silt'], slopeMax:12, drainage:['Good','Moderate'], elevMax:1500},
    maize:  {label:'Maize 🌽', soil:['Loam','Sandy'], slopeMax:10, drainage:['Good','Moderate'], elevMax:1800},
    tea:    {label:'Tea 🍵', soil:['Loam','Clay'], slopeMax:30, drainage:['Good'], elevMin:800, elevMax:2200},
    cotton: {label:'Cotton 🌱', soil:['Sandy','Loam'], slopeMax:8, drainage:['Good'], elevMax:1000},
    orchard:{label:'Orchard 🍎', soil:['Loam','Silt'], slopeMax:20, drainage:['Good','Moderate'], elevMin:300, elevMax:2000}
  };

  function score(parcel, cropKey){
    const c = CROPS[cropKey];
    let pts=0, max=4, reasons=[];
    if(c.soil.includes(parcel.soil)){ pts++; reasons.push('soil matches'); } else reasons.push('soil mismatch ('+parcel.soil+')');
    if(parcel.slope<=c.slopeMax){ pts++; reasons.push('slope acceptable'); } else reasons.push('slope too steep ('+parcel.slope+'°)');
    if(c.drainage.includes(parcel.drainage)){ pts++; reasons.push('drainage suitable'); } else reasons.push('drainage unsuitable ('+parcel.drainage+')');
    const elevOk = (!c.elevMin || parcel.elevation>=c.elevMin) && (!c.elevMax || parcel.elevation<=c.elevMax);
    if(elevOk){ pts++; reasons.push('elevation within range'); } else reasons.push('elevation out of range ('+parcel.elevation+'m)');
    const pct = pts/max;
    const level = pct>=0.75 ? 'high' : pct>=0.5 ? 'moderate' : 'low';
    return {pts, max, pct, level, reasons};
  }
  const LEVEL_COLOR = {high:'#43A047', moderate:'#FFB300', low:'#E57373'};
  const LEVEL_LABEL = {high:'Highly suitable', moderate:'Moderately suitable', low:'Unsuitable'};

  const MISSIONS=[
    {id:'m1', title:'Best Crop for a Parcel', desc:'Find a parcel scoring "Highly suitable" for a crop.'},
    {id:'m2', title:'Spot Unsuitable Land', desc:'Identify a parcel that is unsuitable for the selected crop.'},
    {id:'m3', title:'Plan a Multi-Crop Farm', desc:'Assign three different crops across the map.'},
    {id:'m4', title:'Maximize Suitability', desc:'Reach an average suitability of 70% or higher.'},
    {id:'m5', title:'Complete a Seasonal Plan', desc:'Assign a crop to every parcel on the map.'}
  ];

  function mount(root, ctx){
    let cropKey = 'wheat';
    let assignments = {}; // parcelId -> cropKey
    let done = GeoLab.ui.loadProgress(SIM).missions;
    let selectedParcel = null;

    function mapSVG(){
      const cw=100/COLS, ch=100/ROWS;
      let svg = `<svg viewBox="0 0 100 ${100*ROWS/COLS}" style="width:100%;border-radius:10px;">`;
      parcels.forEach(p=>{
        const assigned = assignments[p.id];
        const s = score(p, assigned || cropKey);
        const fill = LEVEL_COLOR[s.level];
        svg += `<g data-parcel="${p.id}" style="cursor:pointer;">
          <rect x="${p.x*cw}" y="${p.y*ch}" width="${cw-0.6}" height="${ch-0.6}" rx="1.5" fill="${fill}" opacity="${assigned?1:0.55}" stroke="${selectedParcel===p.id?'#0D47A1':'#fff'}" stroke-width="${selectedParcel===p.id?1.4:0.5}"/>
          <text x="${p.x*cw+cw/2}" y="${p.y*ch+ch/2+1}" font-size="3.4" text-anchor="middle" fill="#fff" font-weight="700">${assigned?CROPS[assigned].label.split(' ')[1]:''}</text>
        </g>`;
      });
      svg += `</svg>`;
      return svg;
    }

    function avgSuitability(){
      const ids = Object.keys(assignments);
      if(!ids.length) return 0;
      const total = ids.reduce((s,id)=> s + score(parcels.find(p=>p.id===id), assignments[id]).pct, 0);
      return Math.round(100*total/ids.length);
    }

    function render(){
      const sel = selectedParcel ? parcels.find(p=>p.id===selectedParcel) : null;
      const s = sel ? score(sel, cropKey) : null;
      root.innerHTML = `
        <div class="panel">
          <h3>Farm Map <span class="sub">Tap a parcel to inspect or assign the selected crop</span></h3>
          ${mapSVG()}
          <div class="legend-item"><span class="legend-swatch" style="background:${LEVEL_COLOR.high}"></span>Highly suitable</div>
          <div class="legend-item"><span class="legend-swatch" style="background:${LEVEL_COLOR.moderate}"></span>Moderately suitable</div>
          <div class="legend-item"><span class="legend-swatch" style="background:${LEVEL_COLOR.low}"></span>Unsuitable</div>
        </div>

        <div class="panel">
          <h3>Crop Selector</h3>
          <div class="chip-row" style="padding:0;">
            ${Object.keys(CROPS).map(k=>`<div class="chip ${cropKey===k?'active':''}" data-crop="${k}">${CROPS[k].label}</div>`).join('')}
          </div>
          ${sel ? `
          <div style="margin-top:12px;padding:12px;background:var(--light-gray);border-radius:10px;">
            <b style="font-size:.85rem;">Parcel (${sel.x+1},${sel.y+1})</b> — Soil: ${sel.soil} · Slope: ${sel.slope}° · Drainage: ${sel.drainage} · Elev: ${sel.elevation}m
            <div style="margin-top:6px;"><span class="badge" style="background:${LEVEL_COLOR[s.level]}22;color:${LEVEL_COLOR[s.level]}">${LEVEL_LABEL[s.level]} for ${CROPS[cropKey].label} (${s.pts}/${s.max})</span></div>
            <ul style="margin:8px 0 0;padding-left:18px;font-size:.76rem;color:#556;">${s.reasons.map(r=>`<li>${r}</li>`).join('')}</ul>
            <button class="btn btn-primary btn-sm" id="assignBtn" style="margin-top:8px;">Assign ${CROPS[cropKey].label} here</button>
          </div>` : `<p style="margin-top:10px;font-size:.8rem;color:#78839a;">Select a parcel on the map to see its suitability breakdown.</p>`}
        </div>

        <div class="panel">
          <h3>Farm Optimization</h3>
          <div class="metric-grid">
            ${GeoLab.ui.metric('Parcels assigned', Object.keys(assignments).length+'/'+parcels.length)}
            ${GeoLab.ui.metric('Average suitability', avgSuitability()+'%')}
          </div>
          <button class="btn btn-tertiary btn-sm" id="clearAssign" style="margin-top:10px;">Clear all assignments</button>
        </div>

        <div class="panel">
          <h3>Missions</h3>
          ${GeoLab.ui.missions(MISSIONS, done)}
        </div>

        <div class="btn-row" style="padding:0 2px 8px;">${GeoLab.ui.favBar(ctx)}</div>
      `;
      GeoLab.ui.bindFav(root, ctx);
      bind();
    }

    function checkMissions(){
      const ids = Object.keys(assignments);
      const uniqueCrops = new Set(ids.map(id=>assignments[id]));
      if(ids.some(id=>score(parcels.find(p=>p.id===id), assignments[id]).level==='high')) GeoLab.ui.markMission(SIM,'m1',ctx);
      if(parcels.some(p=> score(p, cropKey).level==='low')) GeoLab.ui.markMission(SIM,'m2',ctx);
      if(uniqueCrops.size>=3) GeoLab.ui.markMission(SIM,'m3',ctx);
      if(ids.length && avgSuitability()>=70) GeoLab.ui.markMission(SIM,'m4',ctx);
      if(ids.length===parcels.length) GeoLab.ui.markMission(SIM,'m5',ctx);
      done = GeoLab.ui.loadProgress(SIM).missions;
    }

    function bind(){
      checkMissions();
      root.querySelectorAll('[data-crop]').forEach(el=>el.addEventListener('click', ()=>{ cropKey=el.dataset.crop; render(); }));
      root.querySelectorAll('[data-parcel]').forEach(el=>el.addEventListener('click', ()=>{ selectedParcel = el.dataset.parcel; render(); }));
      root.querySelector('#assignBtn')?.addEventListener('click', ()=>{
        assignments[selectedParcel] = cropKey;
        ctx.toast('Assigned '+CROPS[cropKey].label+' to parcel');
        render();
      });
      root.querySelector('#clearAssign')?.addEventListener('click', ()=>{ assignments={}; render(); });
    }

    render();
  }

  GeoLab.sims[SIM].mount = mount;
})();
