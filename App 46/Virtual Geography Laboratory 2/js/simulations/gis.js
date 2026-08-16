(function(){
  const SIM='gis';
  const W=100,H=64; // local grid units; 1 unit = 100 metres -> map is 10km x 6.4km

  const DATA = {
    water:   {type:'polygon', color:'#8EC9E8', name:'Water Bodies',
      features:[{name:'Blue Lake', pts:[[6,6],[14,4],[18,10],[13,15],[6,13]]}]},
    admin:   {type:'polygon', color:'transparent', stroke:'#0D47A1', name:'Administrative Boundary',
      features:[{name:'District Boundary', pts:[[2,2],[98,2],[98,62],[2,62]]}]},
    elevation:{type:'polygon', color:'#C9E6C6', name:'Elevation Zones',
      features:[
        {name:'Lowland (0-50m)', pts:[[2,40],[40,40],[40,62],[2,62]]},
        {name:'Upland (50-150m)', pts:[[40,40],[98,40],[98,62],[40,62]]},
        {name:'Highland (150m+)', pts:[[60,2],[98,2],[98,40],[60,40]]}
      ]},
    landuse: {type:'polygon', color:'#FFE1A8', name:'Land-Use Zones',
      features:[
        {name:'Residential Zone', cat:'residential', pts:[[20,20],[42,20],[42,38],[20,38]]},
        {name:'Commercial Zone', cat:'commercial', pts:[[44,20],[60,20],[60,32],[44,32]]},
        {name:'Industrial Zone', cat:'industrial', pts:[[70,44],[92,44],[92,58],[70,58]]}
      ]},
    parks:   {type:'polygon', color:'#A9DFA0', name:'Parks',
      features:[
        {name:'Central Park', pts:[[46,34],[58,34],[58,44],[46,44]]},
        {name:'Riverside Green', pts:[[10,20],[20,20],[20,28],[10,28]]}
      ]},
    roads:   {type:'line', color:'#5B6472', name:'Roads',
      features:[
        {name:'Main Highway', pts:[[2,32],[98,32]]},
        {name:'North Avenue', pts:[[30,2],[30,62]]},
        {name:'East Connector', pts:[[65,2],[65,62]]},
        {name:'Ring Road', pts:[[2,50],[50,50],[50,58],[92,58]]}
      ]},
    railways:{type:'line', color:'#B34700', name:'Railways', dash:'4 3',
      features:[{name:'Coastal Line', pts:[[4,10],[40,44],[95,52]]}]},
    schools: {type:'point', color:'#1976D2', name:'Schools', icon:'🏫',
      features:[
        {name:'Hillview School', pts:[24,24]},
        {name:'Lakeside School', pts:[12,18]},
        {name:'North Academy', pts:[34,10]},
        {name:'East Public School', pts:[78,20]}
      ]},
    hospitals:{type:'point', color:'#E53935', name:'Hospitals', icon:'🏥',
      features:[
        {name:'District Hospital', pts:[46,26]},
        {name:'Riverside Clinic', pts:[16,24]},
        {name:'Northgate Medical', pts:[80,40]}
      ]}
  };
  const LAYER_ORDER0 = ['elevation','landuse','water','parks','admin','roads','railways','schools','hospitals'];

  function dist(a,b){ return Math.hypot(a[0]-b[0], a[1]-b[1]); }
  function centroid(pts){ const n=pts.length; let x=0,y=0; pts.forEach(p=>{x+=p[0];y+=p[1];}); return [x/n,y/n]; }
  function pointInRect(p, r){ return p[0]>=r.x1 && p[0]<=r.x2 && p[1]>=r.y1 && p[1]<=r.y2; }
  function featureAnchor(layerKey, f){
    const l = DATA[layerKey];
    if(l.type==='point') return f.pts;
    if(l.type==='line') return f.pts[Math.floor(f.pts.length/2)];
    return centroid(f.pts);
  }

  const MISSIONS=[
    {id:'m1', title:'Site a New School', desc:'Run a spatial query to find residential coverage.'},
    {id:'m2', title:'Underserved Areas', desc:'Buffer 500m around hospitals to spot gaps.'},
    {id:'m3', title:'Parks Near Roads', desc:'Query which parks sit within reach of a road.'},
    {id:'m4', title:'Multi-Condition Overlay', desc:'Run an overlay analysis with 2+ conditions.'},
    {id:'m5', title:'Build Your Own Map', desc:'Toggle at least 5 layers on at once.'}
  ];

  function mount(root, ctx){
    let layers = {};
    LAYER_ORDER0.forEach(k=> layers[k] = {visible:true, opacity: DATA[k].type==='polygon'?0.75:1});
    let order = LAYER_ORDER0.slice();
    let mode = 'view'; // view | query | buffer
    let queryLayer = 'schools';
    let queryRect = null; let dragStart=null;
    let bufferSource='hospitals'; let bufferFeature=0; let bufferDist=5; // grid units (=500m)
    let lastResult = null;
    let done = GeoLab.ui.loadProgress(SIM).missions;

    function svgMap(){
      let svg = `<svg id="gisSvg" viewBox="0 0 ${W} ${H}" style="width:100%;border-radius:10px;background:#F4F8FC;touch-action:none;">`;
      order.forEach(key=>{
        const l = layers[key]; if(!l.visible) return;
        const d = DATA[key];
        svg += `<g opacity="${l.opacity}">`;
        d.features.forEach(f=>{
          if(d.type==='polygon'){
            svg += `<polygon points="${f.pts.map(p=>p.join(',')).join(' ')}" fill="${d.color}" stroke="${d.stroke||'#00000030'}" stroke-width="0.4"/>`;
          } else if(d.type==='line'){
            svg += `<polyline points="${f.pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${d.color}" stroke-width="1" ${d.dash?`stroke-dasharray="${d.dash}"`:''}/>`;
          } else {
            svg += `<circle cx="${f.pts[0]}" cy="${f.pts[1]}" r="1.6" fill="${d.color}" stroke="#fff" stroke-width="0.4"/>`;
          }
        });
        svg += `</g>`;
      });
      // query rectangle (always present, updated live via attribute writes while dragging)
      {
        const r = queryRect || {x1:0,y1:0,x2:0,y2:0};
        svg += `<rect id="queryRectEl" x="${Math.min(r.x1,r.x2)}" y="${Math.min(r.y1,r.y2)}" width="${Math.abs(r.x2-r.x1)}" height="${Math.abs(r.y2-r.y1)}" fill="#1976D230" stroke="#1976D2" stroke-width="0.6" stroke-dasharray="2 1" style="display:${queryRect?'block':'none'}"/>`;
      }
      // buffer circle
      if(mode==='buffer' && DATA[bufferSource].features[bufferFeature]){
        const anchor = featureAnchor(bufferSource, DATA[bufferSource].features[bufferFeature]);
        svg += `<circle cx="${anchor[0]}" cy="${anchor[1]}" r="${bufferDist}" fill="#FFB30030" stroke="#FFB300" stroke-width="0.7"/>`;
        svg += `<circle cx="${anchor[0]}" cy="${anchor[1]}" r="1" fill="#FFB300"/>`;
      }
      // highlighted results
      if(lastResult){
        lastResult.forEach(pt=>{
          svg += `<circle cx="${pt[0]}" cy="${pt[1]}" r="2.6" fill="none" stroke="#43A047" stroke-width="0.8"/>`;
        });
      }
      svg += `</svg>`;
      return svg;
    }

    function legend(){
      return order.filter(k=>layers[k].visible).map(k=>{
        const d=DATA[k];
        const swatchStyle = d.type==='point' ? `background:${d.color};border-radius:50%;` : d.type==='line' ? `background:${d.color};height:3px;align-self:center;` : `background:${d.color};border:1px solid ${d.stroke||'#0002'}`;
        return `<div class="legend-item"><span class="legend-swatch" style="${swatchStyle}"></span>${d.name}</div>`;
      }).join('');
    }

    function layerPanel(){
      return order.map((k,i)=>{
        const d=DATA[k], l=layers[k];
        return `<div class="control-row" style="flex-direction:column;align-items:stretch;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:8px;">
              <label class="toggle"><input type="checkbox" data-lv="${k}" ${l.visible?'checked':''}><span class="track"></span></label>
              <b style="font-size:.82rem;">${d.name}</b>
            </div>
            <div style="display:flex;gap:4px;">
              <button class="btn btn-tertiary btn-sm" data-up="${k}" ${i===0?'disabled':''}>↑</button>
              <button class="btn btn-tertiary btn-sm" data-down="${k}" ${i===order.length-1?'disabled':''}>↓</button>
            </div>
          </div>
          <input type="range" min="0" max="1" step="0.05" value="${l.opacity}" data-op="${k}" style="margin-top:4px;">
        </div>`;
      }).join('');
    }

    function render(){
      root.innerHTML = `
        <div class="panel">
          <h3>Layer Map <span class="sub">Fictional District — 10km × 6.4km</span></h3>
          ${svgMap()}
          <div style="margin-top:8px;">${legend()}</div>
        </div>

        <div class="panel">
          <h3>GIS Layer Panel</h3>
          ${layerPanel()}
        </div>

        <div class="panel">
          <h3>Tools</h3>
          <div class="tabbar" id="modeTab">
            <button data-tab="view" class="${mode==='view'?'active':''}">View</button>
            <button data-tab="query" class="${mode==='query'?'active':''}">Spatial Query</button>
            <button data-tab="buffer" class="${mode==='buffer'?'active':''}">Buffer</button>
          </div>
          ${mode==='query' ? `
            <label style="font-size:.8rem;font-weight:600;">Query layer</label>
            <select id="queryLayerSel">${LAYER_ORDER0.map(k=>`<option value="${k}" ${queryLayer===k?'selected':''}>${DATA[k].name}</option>`).join('')}</select>
            <p style="font-size:.76rem;color:#78839a;margin-top:8px;">Drag a rectangle on the map above to select an area, then run the query.</p>
            <button class="btn btn-primary btn-sm btn-block" id="runQuery" style="margin-top:8px;" ${!queryRect?'disabled':''}>Run Query</button>
          ` : ``}
          ${mode==='buffer' ? `
            <label style="font-size:.8rem;font-weight:600;">Feature type</label>
            <select id="bufSrcSel">${['schools','hospitals','parks'].map(k=>`<option value="${k}" ${bufferSource===k?'selected':''}>${DATA[k].name}</option>`).join('')}</select>
            <label style="font-size:.8rem;font-weight:600;margin-top:8px;display:block;">Feature</label>
            <select id="bufFeatSel">${DATA[bufferSource].features.map((f,i)=>`<option value="${i}" ${bufferFeature===i?'selected':''}>${f.name}</option>`).join('')}</select>
            ${GeoLab.ui.slider({id:'bufDist', label:'Buffer distance', min:2,max:20,step:1,value:bufferDist, unit:'00m'})}
            <button class="btn btn-primary btn-sm btn-block" id="runBuffer" style="margin-top:6px;">Show Buffer Results</button>
          ` : ``}
        </div>

        <div class="panel" id="resultsPanel" style="${lastResult===null && !window.__gisLastText ? 'display:none;':''}">
          <h3>Result</h3>
          <div id="resultText" style="font-size:.85rem;color:#334;line-height:1.5;">${window.__gisLastText||''}</div>
        </div>

        <div class="panel">
          <h3>Practical Missions</h3>
          ${GeoLab.ui.missions(MISSIONS, done)}
        </div>

        <div class="btn-row" style="padding:0 2px 8px;">${GeoLab.ui.favBar(ctx)}</div>
      `;
      GeoLab.ui.bindFav(root, ctx);
      bind();
    }

    function complete(id){
      if(GeoLab.ui.markMission(SIM,id,ctx)){ done = GeoLab.ui.loadProgress(SIM).missions; }
    }

    function bind(){
      root.querySelectorAll('[data-lv]').forEach(cb=>cb.addEventListener('change', e=>{
        layers[e.target.dataset.lv].visible = e.target.checked;
        const visCount = Object.values(layers).filter(l=>l.visible).length;
        if(visCount>=5) complete('m5');
        render();
      }));
      root.querySelectorAll('[data-op]').forEach(sl=>sl.addEventListener('input', e=>{
        layers[e.target.dataset.op].opacity = parseFloat(e.target.value);
        root.querySelector('#gisSvg').outerHTML = svgMap();
      }));
      root.querySelectorAll('[data-up]').forEach(b=>b.addEventListener('click', e=>{
        const k=e.target.dataset.up, i=order.indexOf(k);
        if(i>0){ [order[i-1],order[i]]=[order[i],order[i-1]]; render(); }
      }));
      root.querySelectorAll('[data-down]').forEach(b=>b.addEventListener('click', e=>{
        const k=e.target.dataset.down, i=order.indexOf(k);
        if(i<order.length-1){ [order[i+1],order[i]]=[order[i],order[i+1]]; render(); }
      }));
      GeoLab.ui.bindTabbar(root.querySelector('#modeTab').parentElement, t=>{ mode=t; queryRect=null; lastResult=null; window.__gisLastText=''; render(); });

      // map drag-to-select rectangle (updates live via direct attribute writes, full render only on release)
      const svgEl = root.querySelector('#gisSvg');
      function toLocal(evt){
        const rect = svgEl.getBoundingClientRect();
        const cx = (evt.touches? evt.touches[0].clientX : evt.clientX) - rect.left;
        const cy = (evt.touches? evt.touches[0].clientY : evt.clientY) - rect.top;
        return [Math.max(0,Math.min(W,cx/rect.width*W)), Math.max(0,Math.min(H,cy/rect.height*H))];
      }
      function paintRectLive(){
        const r = queryRect; const el = root.querySelector('#queryRectEl');
        if(!el || !r) return;
        el.setAttribute('x', Math.min(r.x1,r.x2)); el.setAttribute('y', Math.min(r.y1,r.y2));
        el.setAttribute('width', Math.abs(r.x2-r.x1)); el.setAttribute('height', Math.abs(r.y2-r.y1));
        el.style.display='block';
      }
      if(mode==='query'){
        svgEl.style.cursor='crosshair';
        const onDown = e=>{ const [x,y]=toLocal(e); dragStart=[x,y]; queryRect={x1:x,y1:y,x2:x,y2:y}; paintRectLive(); e.preventDefault(); };
        const onMove = e=>{ if(!dragStart) return; const [x,y]=toLocal(e); queryRect={x1:dragStart[0],y1:dragStart[1],x2:x,y2:y}; paintRectLive(); };
        const onUp = ()=>{ if(dragStart){ dragStart=null; render(); } };
        svgEl.addEventListener('pointerdown', onDown);
        svgEl.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp, {once:true});
      }

      root.querySelector('#queryLayerSel')?.addEventListener('change', e=>{ queryLayer=e.target.value; render(); });
      root.querySelector('#runQuery')?.addEventListener('click', ()=>{
        if(!queryRect) return;
        const r = {x1:Math.min(queryRect.x1,queryRect.x2), x2:Math.max(queryRect.x1,queryRect.x2), y1:Math.min(queryRect.y1,queryRect.y2), y2:Math.max(queryRect.y1,queryRect.y2)};
        const feats = DATA[queryLayer].features.filter(f=>pointInRect(featureAnchor(queryLayer,f), r));
        lastResult = feats.map(f=>featureAnchor(queryLayer,f));
        window.__gisLastText = feats.length
          ? `Found <b>${feats.length}</b> ${DATA[queryLayer].name.toLowerCase()} in the selected area: ${feats.map(f=>f.name).join(', ')}.`
          : `No ${DATA[queryLayer].name.toLowerCase()} found in the selected area.`;
        ctx.toast(`Query complete: ${feats.length} result(s)`);
        if(queryLayer==='schools') complete('m1');
        if(queryLayer==='parks') complete('m3');
        render();
      });

      root.querySelector('#bufSrcSel')?.addEventListener('change', e=>{ bufferSource=e.target.value; bufferFeature=0; render(); });
      root.querySelector('#bufFeatSel')?.addEventListener('change', e=>{ bufferFeature=parseInt(e.target.value); render(); });
      GeoLab.ui.bindSlider('bufDist','00m', v=>{ bufferDist=v; root.querySelector('#gisSvg').outerHTML=svgMap(); });
      root.querySelector('#runBuffer')?.addEventListener('click', ()=>{
        const anchor = featureAnchor(bufferSource, DATA[bufferSource].features[bufferFeature]);
        const within = {};
        ['schools','hospitals','parks'].forEach(k=>{
          if(k===bufferSource) return;
          const inside = DATA[k].features.filter(f=> dist(featureAnchor(k,f), anchor) <= bufferDist);
          if(inside.length) within[k]=inside;
        });
        lastResult = Object.values(within).flat().map(f=>{
          for(const k of ['schools','hospitals','parks']) if(DATA[k].features.includes(f)) return featureAnchor(k,f);
          return [0,0];
        });
        const parts = Object.entries(within).map(([k,arr])=>`${arr.length} ${DATA[k].name.toLowerCase()}`);
        window.__gisLastText = `Within ${bufferDist*100}m of <b>${DATA[bufferSource].features[bufferFeature].name}</b>: ${parts.length?parts.join(', '):'nothing nearby — a coverage gap.'}`;
        ctx.toast('Buffer analysis complete');
        complete('m2');
        if(Object.keys(within).length>=1) complete('m4');
        render();
      });
    }

    render();
  }

  GeoLab.sims[SIM].mount = mount;
})();
