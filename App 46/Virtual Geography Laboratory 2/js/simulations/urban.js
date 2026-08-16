(function(){
  const SIM='urban';
  const GRID=8; // 8x8 blocks

  const FACILITIES = {
    empty:      {icon:'', label:'Empty', color:'#EDF1F6'},
    residential:{icon:'🏠', label:'Residential', color:'#FFE9C4', incompatible:['industrial']},
    school:     {icon:'🏫', label:'School', color:'#BBDEFB', needsRoad:true},
    hospital:   {icon:'🏥', label:'Hospital', color:'#FFCDD2', needsRoad:true},
    park:       {icon:'🌳', label:'Park', color:'#C8E6C9'},
    commercial: {icon:'🏬', label:'Commercial', color:'#D1C4E9', needsRoad:true},
    industrial: {icon:'🏭', label:'Industrial', color:'#CFD8DC', incompatible:['residential','school','hospital']},
    transit:    {icon:'🚉', label:'Transit Station', color:'#B2EBF2', needsRoad:true},
    road:       {icon:'', label:'Road', color:'#616161', isRoad:true},
    emergency:  {icon:'🚒', label:'Emergency Svc', color:'#FFAB91', needsRoad:true},
    waste:      {icon:'♻️', label:'Waste Facility', color:'#D7CCC8', incompatible:['residential','school','hospital','park']}
  };
  const PALETTE = ['residential','school','hospital','park','commercial','industrial','transit','road','emergency','waste'];

  const MISSIONS=[
    {id:'m1', title:'School-Friendly Block', desc:'Place a school with direct road access and no industrial neighbor.'},
    {id:'m2', title:'Emergency Access', desc:'Give every hospital & emergency service road access.'},
    {id:'m3', title:'Separate Land Uses', desc:'Have zero residential/industrial adjacency conflicts.'},
    {id:'m4', title:'Connected Network', desc:'Build a road network with no dead-end facility.'},
    {id:'m5', title:'80+ City Score', desc:'Reach an overall planning score of 80 or higher.'}
  ];

  function mount(root, ctx){
    let grid = Array.from({length:GRID},()=>Array(GRID).fill('empty'));
    let brush = 'residential';
    let done = GeoLab.ui.loadProgress(SIM).missions;

    function neighbors(x,y){
      const n=[]; [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
        const nx=x+dx, ny=y+dy;
        if(nx>=0&&nx<GRID&&ny>=0&&ny<GRID) n.push([nx,ny]);
      });
      return n;
    }
    function hasRoadAdjacent(x,y){
      return neighbors(x,y).some(([nx,ny])=>grid[nx][ny]==='road');
    }

    function analyze(){
      let conflicts=0, roadNeeded=0, roadOk=0, greenCount=0, totalFacilities=0, roadCount=0;
      let warnings=[];
      for(let x=0;x<GRID;x++) for(let y=0;y<GRID;y++){
        const t = grid[x][y];
        if(t==='empty') continue;
        if(t==='road'){ roadCount++; continue; }
        totalFacilities++;
        if(t==='park') greenCount++;
        const def = FACILITIES[t];
        if(def.incompatible){
          neighbors(x,y).forEach(([nx,ny])=>{
            if(def.incompatible.includes(grid[nx][ny])){
              conflicts++;
              warnings.push(`${def.label} conflicts with ${FACILITIES[grid[nx][ny]].label} at (${x+1},${y+1})`);
            }
          });
        }
        if(def.needsRoad){
          roadNeeded++;
          if(hasRoadAdjacent(x,y)) roadOk++;
          else warnings.push(`${def.label} at (${x+1},${y+1}) has no road access`);
        }
      }
      const accessibility = roadNeeded ? Math.round(100*roadOk/roadNeeded) : 100;
      const compatibility = totalFacilities ? Math.round(100*Math.max(0,1-conflicts/Math.max(1,totalFacilities))) : 100;
      const connectivity = roadCount>0 ? Math.min(100, Math.round(100*roadCount/Math.max(6,totalFacilities))) : (totalFacilities?0:100);
      const greenSpace = totalFacilities ? Math.min(100, Math.round(100*greenCount/Math.max(1,totalFacilities/4))) : 0;
      const overall = Math.round((accessibility+compatibility+connectivity+greenSpace)/4);
      return {conflicts, roadNeeded, roadOk, accessibility, compatibility, connectivity, greenSpace, overall, totalFacilities, warnings: warnings.slice(0,5)};
    }

    function gridSVG(){
      const cell=100/GRID;
      let svg = `<svg id="cityGrid" viewBox="0 0 100 100" style="width:100%;border-radius:10px;background:#fff;touch-action:none;">`;
      for(let x=0;x<GRID;x++) for(let y=0;y<GRID;y++){
        const t=grid[x][y], def=FACILITIES[t];
        svg += `<rect data-cell="${x},${y}" x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}" fill="${def.color}" stroke="#fff" stroke-width="0.6"/>`;
        if(def.icon) svg += `<text x="${x*cell+cell/2}" y="${y*cell+cell/2+1.2}" font-size="${cell*0.5}" text-anchor="middle">${def.icon}</text>`;
      }
      svg += `</svg>`;
      return svg;
    }

    function render(){
      const a = analyze();
      root.innerHTML = `
        <div class="panel">
          <h3>City Grid <span class="sub">Tap a block to place the selected facility</span></h3>
          ${gridSVG()}
        </div>

        <div class="panel">
          <h3>Facility Palette</h3>
          <div class="chip-row" style="padding:0;">
            ${PALETTE.map(k=>`<div class="chip ${brush===k?'active':''}" data-brush="${k}">${FACILITIES[k].icon} ${FACILITIES[k].label}</div>`).join('')}
          </div>
          <div class="btn-row" style="margin-top:10px;">
            <button class="btn btn-tertiary btn-sm" id="clearCity">Clear City</button>
          </div>
        </div>

        <div class="panel">
          <h3>Planning Score</h3>
          <div class="metric-grid">
            ${GeoLab.ui.metric('Overall', a.overall)}
            ${GeoLab.ui.metric('Accessibility', a.accessibility+'%')}
            ${GeoLab.ui.metric('Compatibility', a.compatibility+'%')}
            ${GeoLab.ui.metric('Connectivity', a.connectivity+'%')}
          </div>
          ${a.warnings.length ? `<div style="margin-top:10px;">
            ${a.warnings.map(w=>`<div style="font-size:.78rem;color:#B45F06;margin-bottom:4px;">⚠️ ${w}</div>`).join('')}
          </div>` : `<p style="margin-top:10px;font-size:.8rem;color:var(--green);">✅ No planning conflicts detected.</p>`}
        </div>

        <div class="panel">
          <h3>Missions</h3>
          ${GeoLab.ui.missions(MISSIONS, done)}
        </div>

        <div class="btn-row" style="padding:0 2px 8px;">${GeoLab.ui.favBar(ctx)}</div>
      `;
      GeoLab.ui.bindFav(root, ctx);
      bind(a);
    }

    function checkMissions(a){
      // m1: at least one school with road access and no industrial neighbor
      let m1=false;
      for(let x=0;x<GRID;x++)for(let y=0;y<GRID;y++){
        if(grid[x][y]==='school' && hasRoadAdjacent(x,y) && !neighbors(x,y).some(([nx,ny])=>grid[nx][ny]==='industrial')) m1=true;
      }
      if(m1) GeoLab.ui.markMission(SIM,'m1',ctx);
      if(a.totalFacilities>0 && a.roadNeeded>0 && a.roadOk===a.roadNeeded) GeoLab.ui.markMission(SIM,'m2',ctx);
      if(a.totalFacilities>3 && a.conflicts===0) GeoLab.ui.markMission(SIM,'m3',ctx);
      if(a.roadNeeded>0 && a.roadOk===a.roadNeeded && a.connectivity>=60) GeoLab.ui.markMission(SIM,'m4',ctx);
      if(a.overall>=80) GeoLab.ui.markMission(SIM,'m5',ctx);
      done = GeoLab.ui.loadProgress(SIM).missions;
    }

    function bind(a){
      checkMissions(a);
      root.querySelectorAll('[data-brush]').forEach(el=>el.addEventListener('click', ()=>{ brush=el.dataset.brush; render(); }));
      root.querySelector('#clearCity')?.addEventListener('click', ()=>{ grid = Array.from({length:GRID},()=>Array(GRID).fill('empty')); render(); ctx.toast('City cleared'); });
      const svg = root.querySelector('#cityGrid');
      let painting=false;
      function paint(el){
        if(!el || !el.dataset.cell) return;
        const [x,y] = el.dataset.cell.split(',').map(Number);
        grid[x][y] = brush;
        el.setAttribute('fill', FACILITIES[brush].color);
      }
      svg.addEventListener('pointerdown', e=>{ painting=true; paint(e.target); });
      svg.addEventListener('pointermove', e=>{ if(painting) paint(e.target); });
      window.addEventListener('pointerup', ()=>{ if(painting){ painting=false; render(); } }, {once:true});
    }

    render();
  }

  GeoLab.sims[SIM].mount = mount;
})();
