(function(){
  const SIM='projection';
  const D2R = Math.PI/180;

  /* ---- simplified recognizable continent outlines (lon,lat) ---- */
  const CONTINENTS = {
    'Africa': [[-17,15],[-16,10],[-13,7],[-10,5],[-5,5],[3,6],[9,4],[9,-1],[13,-6],
      [12,-16],[15,-22],[18,-28],[20,-34],[26,-33],[32,-27],[35,-23],[40,-15],[43,-3],
      [51,-2],[49,10],[43,12],[38,15],[32,22],[25,31],[22,32],[10,37],[0,35],[-6,35],[-9,30],[-11,24],[-17,21],[-17,15]],
    'Eurasia': [[-9,36],[-3,37],[3,41],[10,43],[13,45],[13,54],[8,58],[10,63],[24,66],
      [30,70],[40,68],[45,66],[60,68],[75,72],[95,73],[110,72],[130,72],[143,60],
      [140,48],[130,46],[122,40],[121,31],[110,20],[100,10],[92,15],[80,8],[77,10],
      [72,20],[68,24],[61,25],[50,29],[48,38],[35,42],[29,41],[27,36],[23,36],[18,40],[9,38],[-9,36]],
    'North America': [[-155,60],[-140,60],[-130,55],[-125,48],[-124,40],[-117,33],[-110,24],
      [-97,20],[-90,16],[-88,21],[-81,25],[-80,32],[-75,35],[-70,42],[-66,44],[-60,47],
      [-65,55],[-75,58],[-85,65],[-95,68],[-110,70],[-125,70],[-140,68],[-155,60]],
    'South America': [[-81,9],[-77,3],[-79,-4],[-81,-10],[-71,-18],[-70,-25],[-71,-33],
      [-73,-42],[-70,-52],[-67,-55],[-65,-50],[-58,-42],[-57,-35],[-48,-28],[-40,-16],
      [-38,-13],[-35,-8],[-42,0],[-50,0],[-60,5],[-67,8],[-77,8],[-81,9]],
    'Australia': [[113,-22],[122,-18],[130,-12],[137,-12],[142,-11],[145,-16],[153,-27],
      [150,-34],[147,-38],[140,-38],[136,-35],[132,-32],[122,-34],[115,-34],[113,-26],[113,-22]],
    'Antarctica': [[-180,-66],[-120,-66],[-60,-66],[0,-66],[60,-66],[120,-66],[180,-66],
      [180,-90],[-180,-90],[-180,-66]]
  };

  function graticule(step=30){
    const lines=[];
    for(let lon=-180; lon<=180; lon+=step){
      const l=[]; for(let lat=-84;lat<=84;lat+=4) l.push([lon,lat]); lines.push(l);
    }
    for(let lat=-60; lat<=60; lat+=step){
      const l=[]; for(let lon=-180;lon<=180;lon+=4) l.push([lon,lat]); lines.push(l);
    }
    return lines;
  }
  const GRAT = graticule(30);

  /* ---------- projection definitions: each returns {x,y} for lon,lat in degrees ---------- */
  const PROJ = {
    equirect: {
      label:'Equirectangular', family:'Cylindrical',
      fn(lon,lat){ return [lon, lat]; }
    },
    mercator: {
      label:'Mercator', family:'Cylindrical (conformal)',
      fn(lon,lat){
        const latC = Math.max(-85, Math.min(85, lat));
        const y = Math.log(Math.tan(Math.PI/4 + (latC*D2R)/2)) * (180/Math.PI);
        return [lon, y];
      }
    },
    sinusoidal: {
      label:'Sinusoidal', family:'Pseudo-cylindrical (equal-area)',
      fn(lon,lat){ return [lon*Math.cos(lat*D2R), lat]; }
    },
    orthographic: {
      label:'Orthographic', family:'Azimuthal',
      fn(lon,lat){
        const lat0=0, lon0=0;
        const phi=lat*D2R, lam=lon*D2R, phi0=lat0*D2R, lam0=lon0*D2R;
        const cosc = Math.sin(phi0)*Math.sin(phi)+Math.cos(phi0)*Math.cos(phi)*Math.cos(lam-lam0);
        if(cosc < -0.02) return null; // behind the globe
        const x = 90*Math.cos(phi)*Math.sin(lam-lam0);
        const y = 90*(Math.cos(phi0)*Math.sin(phi)-Math.sin(phi0)*Math.cos(phi)*Math.cos(lam-lam0));
        return [x,y];
      }
    },
    equidistantConic: {
      label:'Equidistant Conic', family:'Conic',
      fn(lon,lat){
        const phi1=20*D2R, phi2=60*D2R, phi0=0, lon0=0;
        const n=(Math.cos(phi1)-Math.cos(phi2))/(phi2-phi1);
        const G=Math.cos(phi1)/n+phi1;
        const rho=(G-lat*D2R)*(180/Math.PI)*1.0;
        const rho0=(G-phi0)*(180/Math.PI);
        const theta=n*(lon-lon0)*D2R;
        const x=rho*Math.sin(theta);
        const y=rho0-rho*Math.cos(theta);
        return [x,y-30];
      }
    },
    azEquidistant: {
      label:'Azimuthal Equidistant', family:'Azimuthal (distance-true)',
      fn(lon,lat){
        const phi0=90*D2R, lam0=0;
        const phi=lat*D2R, lam=lon*D2R;
        const c=Math.acos(Math.sin(phi0)*Math.sin(phi)+Math.cos(phi0)*Math.cos(phi)*Math.cos(lam-lam0));
        if(c<1e-6) return [0,0];
        const k=c/Math.sin(c);
        const x=k*Math.cos(phi)*Math.sin(lam-lam0)*(180/Math.PI);
        const y=-k*(Math.cos(phi0)*Math.sin(phi)-Math.sin(phi0)*Math.cos(phi)*Math.cos(lam-lam0))*(180/Math.PI);
        return [x,y];
      }
    }
  };
  const PROJ_ORDER = ['equirect','mercator','sinusoidal','orthographic','equidistantConic','azEquidistant'];

  /* numeric Jacobian -> distortion metrics at (lon,lat) for a projection key */
  function distortionAt(key, lon, lat){
    const f = PROJ[key].fn;
    const h = 0.5;
    const p0 = f(lon,lat);
    const pE = f(lon+h,lat), pW = f(lon-h,lat);
    const pN = f(lon,Math.min(89.5,lat+h)), pS = f(lon,Math.max(-89.5,lat-h));
    if(!p0||!pE||!pW||!pN||!pS) return null;
    // partials in x,y per degree, scaled by real-earth degree distances
    const dLon = (2*h)*D2R*Math.cos(lat*D2R); // real angular east-west unit
    const dLat = (2*h)*D2R;
    const dXdLon = (pE[0]-pW[0])/(2*h), dYdLon=(pE[1]-pW[1])/(2*h);
    const dXdLat = (pN[0]-pS[0])/(2*h), dYdLat=(pN[1]-pS[1])/(2*h);
    // Jacobian scaled to true-earth units (radius=1): columns are d(x,y)/d(true east dist), d(x,y)/d(true north dist)
    const a = dXdLon/Math.max(0.0001,Math.cos(lat*D2R)), b = dXdLat;
    const c = dYdLon/Math.max(0.0001,Math.cos(lat*D2R)), d = dYdLat;
    const areaScale = Math.abs(a*d-b*c);
    // singular values for shape distortion
    const trace = a*a+b*b+c*c+d*d;
    const det = (a*d-b*c);
    const disc = Math.sqrt(Math.max(0,trace*trace-4*det*det));
    const s1 = Math.sqrt(Math.max(0,(trace+disc)/2));
    const s2 = Math.sqrt(Math.max(0,(trace-disc)/2));
    const shapeRatio = s2>0.0001 ? s1/s2 : 99;
    return {areaScale, shapeRatio};
  }

  /* ---------- rendering helpers ---------- */
  function pathFromLL(pts, key, scale, tx, ty){
    const f = PROJ[key].fn;
    let d=''; let started=false;
    pts.forEach(([lon,lat])=>{
      const p = f(lon,lat);
      if(!p){ started=false; return; }
      const x = tx + p[0]*scale, y = ty - p[1]*scale;
      d += (started?'L':'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      started = true;
    });
    return d;
  }

  function distortionColor(areaScale){
    // 1 = no distortion (green) -> higher/lower = more red
    const dev = Math.abs(Math.log(Math.max(0.05,areaScale)));
    const t = Math.min(1, dev/1.6);
    const r = Math.round(67 + t*(229-67));
    const g = Math.round(160 - t*(160-57));
    const b = Math.round(71 - t*(71-53));
    return `rgb(${r},${g},${b})`;
  }

  function buildMapSVG(key, opts={}){
    const w=320,h=200, scale = key==='mercator' ? 0.75 : (key==='orthographic'?1.5:0.86);
    const tx=w/2, ty = key==='equidistantConic' ? h*0.62 : h/2;
    let svg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;background:#EAF2FB;border-radius:10px;">`;
    // graticule
    svg += `<g stroke="#B9CFE8" stroke-width=".6" fill="none">`;
    GRAT.forEach(line=>{ svg += `<path d="${pathFromLL(line,key,scale,tx,ty)}"/>`; });
    svg += `</g>`;
    // distortion heatmap dots
    if(opts.distortion){
      for(let lon=-150;lon<=150;lon+=30){
        for(let lat=-60;lat<=60;lat+=30){
          const f = PROJ[key].fn; const p=f(lon,lat);
          if(!p) continue;
          const m = distortionAt(key,lon,lat);
          if(!m) continue;
          let val = opts.mode==='shape' ? m.shapeRatio-1 : Math.abs(Math.log(Math.max(0.05,m.areaScale)));
          const col = distortionColor(opts.mode==='shape' ? Math.exp(val) : m.areaScale);
          const r = 4 + Math.min(9, (opts.mode==='shape'? val*3 : Math.abs(Math.log(m.areaScale))*4));
          svg += `<circle cx="${(tx+p[0]*scale).toFixed(1)}" cy="${(ty-p[1]*scale).toFixed(1)}" r="${r.toFixed(1)}" fill="${col}" opacity="0.55"/>`;
        }
      }
    }
    // continents
    svg += `<g fill="#1976D2" fill-opacity="0.55" stroke="#0D47A1" stroke-width="0.8">`;
    Object.values(CONTINENTS).forEach(poly=>{ svg += `<path d="${pathFromLL(poly,key,scale,tx,ty)}Z"/>`; });
    svg += `</g>`;
    svg += `</svg>`;
    return svg;
  }

  const CHALLENGES = [
    {id:'c1', title:'Preserve the Area', desc:'Choose the projection that best preserves relative area.'},
    {id:'c2', title:'Navigate the Seas', desc:'Choose the projection most suitable for straight-line navigation.'},
    {id:'c3', title:'Find Maximum Distortion', desc:'Identify where distortion becomes greatest on the current projection.'},
    {id:'c4', title:'Three-Way Comparison', desc:'Compare the same continent under three different projections.'},
    {id:'c5', title:'Explain the Limit', desc:'State why no flat map preserves every geographic property.'}
  ];

  function mount(root, ctx){
    let state = { key:'equirect', mode:'area', distortion:true, view:'single', done: GeoLab.ui.loadProgress(SIM).missions };

    function render(){
      root.innerHTML = `
        <div class="panel">
          <h3>Projection Workspace <span class="sub">Select a projection family and project the globe</span></h3>
          <div class="chip-row" style="padding:0 0 10px;">
            ${PROJ_ORDER.map(k=>`<div class="chip ${state.key===k?'active':''}" data-proj="${k}">${PROJ[k].label}</div>`).join('')}
          </div>
          <div id="mapWrap">${buildMapSVG(state.key,{distortion:state.distortion, mode:state.mode})}</div>
          <p style="margin-top:8px;color:#78839a;font-size:.78rem;">${PROJ[state.key].family} projection.</p>
          <div class="btn-row" style="margin-top:10px;">
            <button class="btn btn-primary btn-sm" id="btnProject">🌐 Project the Globe</button>
            <button class="btn ${state.view==='compare'?'btn-primary':'btn-secondary'} btn-sm" id="btnCompare">⇄ Comparison Mode</button>
          </div>
        </div>

        ${state.view==='compare' ? `
        <div class="panel">
          <h3>Side-by-Side Comparison</h3>
          <div style="display:grid;grid-template-columns:1fr;gap:10px;">
            ${['equirect','mercator','orthographic'].map(k=>`
              <div>
                <div style="font-size:.75rem;font-weight:700;color:var(--deep-blue);margin-bottom:3px;">${PROJ[k].label}</div>
                ${buildMapSVG(k,{distortion:state.distortion, mode:state.mode})}
              </div>`).join('')}
          </div>
        </div>` : ``}

        <div class="panel">
          <h3>Distortion Analysis</h3>
          ${GeoLab.ui.toggleRow({id:'toggleDist', label:'Show distortion heatmap', checked:state.distortion})}
          <div class="tabbar" id="modeTab">
            ${['area','shape'].map(m=>`<button data-tab="${m}" class="${state.mode===m?'active':''}">${m==='area'?'Area distortion':'Shape distortion'}</button>`).join('')}
          </div>
          <p style="font-size:.78rem;color:#78839a;">🟢 low distortion &nbsp;→&nbsp; 🔴 high distortion. Dots are computed live from the projection's mathematical derivative (Tissot-style analysis) — not decoration.</p>
        </div>

        <div class="panel">
          <h3>Measurement Panel <span class="sub">Sampled at the equator vs 60° latitude, current projection</span></h3>
          <div id="measureBox"></div>
        </div>

        <div class="panel">
          <h3>Experiment Challenges</h3>
          <div id="missionBox">${GeoLab.ui.missions(CHALLENGES, state.done)}</div>
        </div>

        <div class="btn-row" style="padding:0 2px 8px;">${GeoLab.ui.favBar(ctx)}</div>
      `;
      GeoLab.ui.bindFav(root, ctx);
      renderMeasure();
      bind();
    }

    function renderMeasure(){
      const eq = distortionAt(state.key, 0, 0);
      const hi = distortionAt(state.key, 0, 60);
      const box = root.querySelector('#measureBox');
      if(!box) return;
      box.innerHTML = GeoLab.ui.metricGrid([
        ['Area scale @ Equator', eq? eq.areaScale.toFixed(2)+'×' : '—'],
        ['Area scale @ 60°N', hi? hi.areaScale.toFixed(2)+'×' : '—'],
        ['Shape ratio @ Equator', eq? eq.shapeRatio.toFixed(2) : '—'],
        ['Shape ratio @ 60°N', hi? hi.shapeRatio.toFixed(2) : '—']
      ]);
    }

    function complete(id){
      if(GeoLab.ui.markMission(SIM,id,ctx)){
        state.done = GeoLab.ui.loadProgress(SIM).missions;
        root.querySelector('#missionBox').innerHTML = GeoLab.ui.missions(CHALLENGES, state.done);
      }
    }

    function bind(){
      root.querySelectorAll('[data-proj]').forEach(el=>{
        el.addEventListener('click', ()=>{ state.key = el.dataset.proj; render(); });
      });
      root.querySelector('#btnProject')?.addEventListener('click', ()=>{
        const wrap = root.querySelector('#mapWrap');
        wrap.style.transition='opacity .25s ease, transform .3s ease';
        wrap.style.opacity=0; wrap.style.transform='scale(.92) rotateX(8deg)';
        ctx.toast('Projecting the globe onto '+PROJ[state.key].label+'...');
        setTimeout(()=>{
          wrap.innerHTML = buildMapSVG(state.key,{distortion:state.distortion, mode:state.mode});
          wrap.style.opacity=1; wrap.style.transform='scale(1)';
        },260);
        if(state.key==='sinusoidal'||state.key==='equirect') complete('c1');
        if(state.key==='mercator') complete('c2');
      });
      root.querySelector('#btnCompare')?.addEventListener('click', ()=>{
        state.view = state.view==='compare' ? 'single':'compare';
        render();
        if(state.view==='compare') complete('c4');
      });
      root.querySelector('#toggleDist')?.addEventListener('change', (e)=>{
        state.distortion = e.target.checked; render();
      });
      GeoLab.ui.bindTabbar(root.querySelector('#modeTab').parentElement, (t)=>{ state.mode=t; render(); complete('c3'); });
      root.querySelectorAll('[data-mission]').forEach(card=>{
        card.addEventListener('click', ()=>{
          if(card.dataset.mission==='c5'){
            ctx.toast('Because a sphere cannot be flattened without stretching or tearing — every projection trades one property for another.');
            complete('c5');
          }
        });
      });
    }

    render();
  }

  GeoLab.sims[SIM].mount = mount;
})();
