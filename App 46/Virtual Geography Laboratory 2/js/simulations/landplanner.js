(function(){
  const SIM='landplanner';
  const COLS=7, ROWS=6;

  function seeded(seed){ let s=seed; return ()=>{ s=(s*9301+49297)%233280; return s/233280; }; }
  const rnd = seeded(7);
  const parcels = [];
  for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++){
    parcels.push({
      id:`${x}-${y}`, x, y,
      slope: Math.round(rnd()*25),
      accessibility: rnd()>0.5 ? 'Good' : 'Poor',
      ecoSensitive: rnd()>0.78,
      suitability: rnd()>0.5 ? 'High' : 'Moderate',
      existing: rnd()>0.85 ? 'Conservation' : 'Undeveloped'
    });
  }

  const USES = {
    empty:      {label:'Unassigned', color:'#EEF1F6', icon:''},
    housing:    {label:'Housing', color:'#FFE0B2', icon:'🏠', needsAccess:true, envPenaltyIfEco:true},
    agriculture:{label:'Agriculture', color:'#DCEDC8', icon:'🌾', slopeMax:15},
    conservation:{label:'Conservation', color:'#A5D6A7', icon:'🌳'},
    recreation: {label:'Recreation', color:'#B3E5FC', icon:'🏞️', needsAccess:true},
    commerce:   {label:'Commerce', color:'#D1C4E9', icon:'🏬', needsAccess:true, envPenaltyIfEco:true},
    transport:  {label:'Transport Infra', color:'#CFD8DC', icon:'🛣️', envPenaltyIfEco:true},
    public:     {label:'Public Facility', color:'#FFCDD2', icon:'🏛️', needsAccess:true}
  };
  const PALETTE = Object.keys(USES).filter(k=>k!=='empty');

  const MISSIONS=[
    {id:'m1', title:'Plan a New District', desc:'Assign housing, commerce and a public facility together.'},
    {id:'m2', title:'Protect Sensitive Land', desc:'Keep all ecologically sensitive parcels as conservation.'},
    {id:'m3', title:'Recreation Corridor', desc:'Place 3+ connected recreation parcels.'},
    {id:'m4', title:'Balanced Infrastructure', desc:'Add transport without creating an environmental conflict.'},
    {id:'m5', title:'Highest Balanced Plan', desc:'Reach an overall balanced score of 75+.'}
  ];

  function mount(root, ctx){
    let assign = {};
    let brush = 'housing';
    let done = GeoLab.ui.loadProgress(SIM).missions;
    let log = [];

    function neighbors(p){
      return parcels.filter(q=> Math.abs(q.x-p.x)+Math.abs(q.y-p.y)===1);
    }

    function evaluate(){
      let env=100, econ=60, access=60, social=60, conflicts=[];
      let assigned = Object.entries(assign);
      let convertedConservation=0, ecoViolations=0, accessOk=0, accessNeeded=0, housingCount=0, commerceCount=0, publicCount=0, recreationCount=0, transportEcoConflict=0;

      assigned.forEach(([id,use])=>{
        const p = parcels.find(x=>x.id===id);
        const def = USES[use];
        if(def.needsAccess){ accessNeeded++; if(p.accessibility==='Good') accessOk++; }
        if(def.envPenaltyIfEco && p.ecoSensitive){ ecoViolations++; conflicts.push({type:'Development vs conservation', text:`${def.label} placed on ecologically sensitive land at (${p.x+1},${p.y+1})`}); }
        if(p.existing==='Conservation' && use!=='conservation'){ convertedConservation++; conflicts.push({type:'Conservation loss', text:`Protected land converted to ${def.label} at (${p.x+1},${p.y+1})`}); }
        if(use==='agriculture' && p.slope>USES.agriculture.slopeMax){ conflicts.push({type:'Agriculture vs slope', text:`Agriculture on a steep parcel (${p.slope}°) at (${p.x+1},${p.y+1})`}); }
        if(use==='housing') housingCount++;
        if(use==='commerce') commerceCount++;
        if(use==='public') publicCount++;
        if(use==='recreation') recreationCount++;
        if(use==='transport' && p.ecoSensitive) transportEcoConflict++;
      });

      env = Math.max(0, 100 - ecoViolations*15 - convertedConservation*20);
      econ = Math.min(100, 40 + housingCount*4 + commerceCount*6);
      access = accessNeeded ? Math.round(100*accessOk/accessNeeded) : 100;
      social = Math.min(100, 40 + publicCount*10 + recreationCount*6);
      const overall = Math.round((env+econ+access+social)/4);

      return {env, econ, access, social, overall, conflicts: conflicts.slice(0,5), housingCount, commerceCount, publicCount, recreationCount, transportEcoConflict, assignedCount:assigned.length};
    }

    function mapSVG(){
      const cw=100/COLS, ch=100/ROWS;
      let svg = `<svg id="lpGrid" viewBox="0 0 100 ${100*ROWS/COLS}" style="width:100%;border-radius:10px;">`;
      parcels.forEach(p=>{
        const use = assign[p.id]||'empty';
        const def = USES[use];
        svg += `<g data-parcel="${p.id}" style="cursor:pointer;">
          <rect x="${p.x*cw}" y="${p.y*ch}" width="${cw-0.6}" height="${ch-0.6}" rx="1.2" fill="${def.color}" stroke="${p.ecoSensitive?'#43A047':'#fff'}" stroke-width="${p.ecoSensitive?1.4:0.5}"/>
          <text x="${p.x*cw+cw/2}" y="${p.y*ch+ch/2+1.2}" font-size="4" text-anchor="middle">${def.icon}</text>
          ${p.ecoSensitive && use==='empty' ? `<text x="${p.x*cw+cw/2}" y="${p.y*ch+ch-1.5}" font-size="2.4" text-anchor="middle" fill="#2E7D32">eco</text>`:''}
        </g>`;
      });
      svg += `</svg>`;
      return svg;
    }

    function render(){
      const ev = evaluate();
      root.innerHTML = `
        <div class="panel">
          <h3>Master Map <span class="sub">Green outline = ecologically sensitive parcel</span></h3>
          ${mapSVG()}
        </div>

        <div class="panel">
          <h3>Land-Use Palette</h3>
          <div class="chip-row" style="padding:0;">
            ${PALETTE.map(k=>`<div class="chip ${brush===k?'active':''}" data-brush="${k}">${USES[k].icon} ${USES[k].label}</div>`).join('')}
          </div>
        </div>

        <div class="panel">
          <h3>Multi-Objective Score</h3>
          <div class="metric-grid">
            ${GeoLab.ui.metric('Environmental', ev.env)}
            ${GeoLab.ui.metric('Economic', ev.econ)}
            ${GeoLab.ui.metric('Accessibility', ev.access)}
            ${GeoLab.ui.metric('Social', ev.social)}
          </div>
          <div class="metric" style="margin-top:10px;background:var(--light-blue);">
            <div class="m-label">Overall Balanced Score</div>
            <div class="m-val" style="font-size:1.6rem;">${ev.overall}</div>
          </div>
        </div>

        <div class="panel">
          <h3>Planning Conflicts</h3>
          ${ev.conflicts.length ? ev.conflicts.map(c=>`<p style="font-size:.78rem;color:#B45F06;margin-bottom:6px;">⚠️ <b>${c.type}:</b> ${c.text}</p>`).join('') : `<p style="font-size:.8rem;color:var(--green);">✅ No conflicts detected — decisions are well balanced.</p>`}
        </div>

        <div class="panel">
          <h3>Scenarios</h3>
          ${GeoLab.ui.missions(MISSIONS, done)}
        </div>

        <div class="btn-row" style="padding:0 2px 8px;">
          <button class="btn btn-tertiary btn-sm" id="clearPlan">Clear Plan</button>
          ${GeoLab.ui.favBar(ctx)}
        </div>
      `;
      GeoLab.ui.bindFav(root, ctx);
      bind(ev);
    }

    function checkMissions(ev){
      if(ev.housingCount>0 && ev.commerceCount>0 && ev.publicCount>0) GeoLab.ui.markMission(SIM,'m1',ctx);
      const ecoParcels = parcels.filter(p=>p.ecoSensitive);
      if(ecoParcels.length && ecoParcels.every(p=>(assign[p.id]||'')==='conservation')) GeoLab.ui.markMission(SIM,'m2',ctx);
      const recIds = parcels.filter(p=>assign[p.id]==='recreation');
      if(recIds.length>=3 && recIds.some(p=>neighbors(p).some(n=>assign[n.id]==='recreation'))) GeoLab.ui.markMission(SIM,'m3',ctx);
      if(Object.values(assign).includes('transport') && ev.transportEcoConflict===0) GeoLab.ui.markMission(SIM,'m4',ctx);
      if(ev.overall>=75) GeoLab.ui.markMission(SIM,'m5',ctx);
      done = GeoLab.ui.loadProgress(SIM).missions;
    }

    function bind(ev){
      checkMissions(ev);
      root.querySelectorAll('[data-brush]').forEach(el=>el.addEventListener('click', ()=>{ brush=el.dataset.brush; render(); }));
      root.querySelectorAll('[data-parcel]').forEach(el=>el.addEventListener('click', ()=>{
        assign[el.dataset.parcel] = brush; render();
      }));
      root.querySelector('#clearPlan')?.addEventListener('click', ()=>{ assign={}; render(); });
    }

    render();
  }

  GeoLab.sims[SIM].mount = mount;
})();
