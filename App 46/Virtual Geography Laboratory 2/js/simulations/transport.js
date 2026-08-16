(function(){
  const SIM='transport';

  const NODES = [
    {id:'A', name:'Riverton', x:15, y:20, type:'town'},
    {id:'B', name:'Northgate', x:50, y:8, type:'town'},
    {id:'C', name:'Eastpoint', x:85, y:22, type:'town'},
    {id:'D', name:'Millvale', x:20, y:55, type:'industrial'},
    {id:'E', name:'Central Hub', x:50, y:45, type:'town'},
    {id:'F', name:'Southport', x:78, y:60, type:'town'},
    {id:'G', name:'Airport', x:88, y:45, type:'airport'},
    {id:'H', name:'Harborview', x:12, y:85, type:'port'},
    {id:'I', name:'Station Junction', x:50, y:80, type:'rail'},
    {id:'J', name:'Mountpass', x:65, y:75, type:'obstacle'}
  ];
  const EDGE_DEFS = [
    ['A','B',38,1.0],['B','C',40,1.0],['A','D',36,1.4],['A','E',42,1.0],
    ['B','E',40,1.0],['E','C',42,1.0],['C','G',26,1.0],['E','F',36,1.1],
    ['F','G',18,1.0],['D','H',34,1.3],['E','I',38,1.2],['I','H',44,1.4],
    ['F','I',30,1.6],['I','J',20,2.0],['F','J',16,1.9]
  ];

  function buildEdges(list){
    return list.map(([a,b,dist,costMult])=>({a,b,dist, cost:Math.round(dist*costMult), time:Math.round(dist/1.6)}));
  }

  const MISSIONS=[
    {id:'m1', title:'Lowest-Cost Connection', desc:'Route by lowest cost between two distant towns.'},
    {id:'m2', title:'Fastest Route', desc:'Find the fastest route to the Airport.'},
    {id:'m3', title:'Budget Network', desc:'Keep total built network cost under 250.'},
    {id:'m4', title:'Repair a Broken Network', desc:'Remove a link, then reconnect all nodes another way.'},
    {id:'m5', title:'Full Connectivity', desc:'Connect all 10 nodes with your network.'}
  ];

  function dijkstra(edges, nodes, start, end, weightKey){
    const adj = {}; nodes.forEach(n=>adj[n.id]=[]);
    edges.forEach(e=>{
      adj[e.a].push({to:e.b, w:e[weightKey], edge:e});
      adj[e.b].push({to:e.a, w:e[weightKey], edge:e});
    });
    const dist={}, prev={}, visited=new Set();
    nodes.forEach(n=>dist[n.id]=Infinity);
    dist[start]=0;
    const pq = new Set(nodes.map(n=>n.id));
    while(pq.size){
      let u=null, best=Infinity;
      pq.forEach(id=>{ if(dist[id]<best){best=dist[id]; u=id;} });
      if(u===null) break;
      pq.delete(u); visited.add(u);
      if(u===end) break;
      (adj[u]||[]).forEach(({to,w,edge})=>{
        if(dist[u]+w < dist[to]){ dist[to]=dist[u]+w; prev[to]={from:u,edge}; }
      });
    }
    if(dist[end]===Infinity) return null;
    const path=[end]; let cur=end;
    while(prev[cur]){ path.unshift(prev[cur].from); cur=prev[cur].from; }
    return {path, total:dist[end]};
  }

  function connectedComponents(edges, nodes){
    const parent={}; nodes.forEach(n=>parent[n.id]=n.id);
    function find(x){ return parent[x]===x?x:(parent[x]=find(parent[x])); }
    function union(a,b){ parent[find(a)]=find(b); }
    edges.forEach(e=>union(e.a,e.b));
    const groups={};
    nodes.forEach(n=>{ const r=find(n.id); groups[r]=groups[r]||[]; groups[r].push(n.id); });
    return Object.values(groups);
  }

  function mount(root, ctx){
    let built = new Set(); // edge keys "A-B" that are 'constructed'
    let allEdges = buildEdges(EDGE_DEFS);
    let mode='build';
    let routeStart='A', routeEnd='G', routeCriterion='dist';
    let removedEdge = null;
    let done = GeoLab.ui.loadProgress(SIM).missions;
    let lastRoute = null;

    function edgeKey(e){ return e.a+'-'+e.b; }
    function activeEdges(){ return allEdges.filter(e=>built.has(edgeKey(e)) && edgeKey(e)!==removedEdge); }

    function netSVG(highlightPath){
      let svg = `<svg id="netSvg" viewBox="0 0 100 100" style="width:100%;border-radius:10px;background:#F4F8FC;">`;
      allEdges.forEach(e=>{
        const a=NODES.find(n=>n.id===e.a), b=NODES.find(n=>n.id===e.b);
        const isBuilt = built.has(edgeKey(e)) && edgeKey(e)!==removedEdge;
        const inPath = highlightPath && highlightPath.some((id,i)=> i<highlightPath.length-1 && ((highlightPath[i]===e.a&&highlightPath[i+1]===e.b)||(highlightPath[i]===e.b&&highlightPath[i+1]===e.a)));
        svg += `<line data-edge="${edgeKey(e)}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
          stroke="${inPath?'#43A047':(isBuilt?'#1976D2':'#C6CEDA')}" stroke-width="${inPath?2.4:(isBuilt?1.6:1)}"
          stroke-dasharray="${isBuilt?'':'2 2'}" style="cursor:pointer;"/>`;
      });
      NODES.forEach(n=>{
        const icon = n.type==='airport'?'✈️':n.type==='port'?'⚓':n.type==='rail'?'🚉':n.type==='industrial'?'🏭':n.type==='obstacle'?'⛰️':'🏘️';
        svg += `<g data-node="${n.id}" style="cursor:pointer;">
          <circle cx="${n.x}" cy="${n.y}" r="4.4" fill="#fff" stroke="#0D47A1" stroke-width="1"/>
          <text x="${n.x}" y="${n.y+1.3}" font-size="4" text-anchor="middle">${icon}</text>
          <text x="${n.x}" y="${n.y+8}" font-size="3" text-anchor="middle" fill="#334" font-weight="700">${n.name}</text>
        </g>`;
      });
      svg += `</svg>`;
      return svg;
    }

    function analysis(){
      const active = activeEdges();
      const totalLen = active.reduce((s,e)=>s+e.dist,0);
      const totalCost = active.reduce((s,e)=>s+e.cost,0);
      const avgTime = active.length ? Math.round(active.reduce((s,e)=>s+e.time,0)/active.length) : 0;
      const comps = connectedComponents(active, NODES);
      const unconnected = comps.filter(c=>c.length===1).flat();
      return {totalLen, totalCost, avgTime, comps, unconnected, edgeCount:active.length};
    }

    function render(){
      const a = analysis();
      const highlightPath = lastRoute ? lastRoute.path : null;
      root.innerHTML = `
        <div class="panel">
          <h3>Regional Network Map <span class="sub">Tap a dashed link to build it, tap again to remove</span></h3>
          ${netSVG(highlightPath)}
        </div>

        <div class="panel">
          <h3>Network Analysis</h3>
          <div class="metric-grid">
            ${GeoLab.ui.metric('Total length', a.totalLen)}
            ${GeoLab.ui.metric('Total cost', a.totalCost)}
            ${GeoLab.ui.metric('Avg travel time', a.avgTime)}
            ${GeoLab.ui.metric('Links built', a.edgeCount)}
          </div>
          ${a.unconnected.length ? `<p style="margin-top:8px;font-size:.78rem;color:#B45F06;">⚠️ Unconnected: ${a.unconnected.map(id=>NODES.find(n=>n.id===id).name).join(', ')}</p>`
            : `<p style="margin-top:8px;font-size:.8rem;color:var(--green);">✅ Network is fully connected.</p>`}
        </div>

        <div class="panel">
          <h3>Route Finder</h3>
          <div style="display:flex;gap:8px;">
            <select id="routeStart" style="flex:1;">${NODES.map(n=>`<option value="${n.id}" ${routeStart===n.id?'selected':''}>${n.name}</option>`).join('')}</select>
            <select id="routeEnd" style="flex:1;">${NODES.map(n=>`<option value="${n.id}" ${routeEnd===n.id?'selected':''}>${n.name}</option>`).join('')}</select>
          </div>
          <div class="tabbar" id="critTab" style="margin-top:10px;">
            <button data-tab="dist" class="${routeCriterion==='dist'?'active':''}">Shortest</button>
            <button data-tab="cost" class="${routeCriterion==='cost'?'active':''}">Cheapest</button>
            <button data-tab="time" class="${routeCriterion==='time'?'active':''}">Fastest</button>
          </div>
          <button class="btn btn-primary btn-sm btn-block" id="findRoute" style="margin-top:8px;">Find Route</button>
          <div id="routeResult" style="margin-top:10px;font-size:.85rem;"></div>
        </div>

        <div class="panel">
          <h3>Network Failure Test</h3>
          <select id="failSel"><option value="">— select a built link to remove —</option>
            ${activeEdges().map(e=>`<option value="${edgeKey(e)}" ${removedEdge===edgeKey(e)?'selected':''}>${NODES.find(n=>n.id===e.a).name} ↔ ${NODES.find(n=>n.id===e.b).name}</option>`).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" id="testFail" style="margin-top:8px;">Simulate Failure</button>
          <button class="btn btn-tertiary btn-sm" id="restoreFail" style="margin-top:8px;">Restore</button>
          <div id="failResult" style="margin-top:8px;font-size:.82rem;"></div>
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
      if(lastRoute && lastRoute.criterion==='cost') GeoLab.ui.markMission(SIM,'m1',ctx);
      if(lastRoute && lastRoute.criterion==='time' && (lastRoute.end==='G')) GeoLab.ui.markMission(SIM,'m2',ctx);
      if(a.edgeCount>0 && a.totalCost<250 && a.unconnected.length===0) GeoLab.ui.markMission(SIM,'m3',ctx);
      if(removedEdge===null && GeoLab.ui._transportHadFailure) GeoLab.ui.markMission(SIM,'m4',ctx);
      if(a.comps.length===1 && activeEdges().length>=9) GeoLab.ui.markMission(SIM,'m5',ctx);
      done = GeoLab.ui.loadProgress(SIM).missions;
    }

    function bind(a){
      checkMissions(a);
      root.querySelectorAll('[data-edge]').forEach(el=>el.addEventListener('click', ()=>{
        const key = el.dataset.edge;
        if(built.has(key)) built.delete(key); else built.add(key);
        render();
      }));
      root.querySelector('#routeStart')?.addEventListener('change', e=>routeStart=e.target.value);
      root.querySelector('#routeEnd')?.addEventListener('change', e=>routeEnd=e.target.value);
      GeoLab.ui.bindTabbar(root.querySelector('#critTab').parentElement, t=>{ routeCriterion=t; render(); });
      root.querySelector('#findRoute')?.addEventListener('click', ()=>{
        const active = activeEdges();
        const key = routeCriterion==='dist'?'dist':routeCriterion==='cost'?'cost':'time';
        const result = dijkstra(active, NODES, routeStart, routeEnd, key);
        const box = root.querySelector('#routeResult');
        if(!result){
          box.innerHTML = `⚠️ No built route connects these two nodes yet. Build more links.`;
          lastRoute=null;
        } else {
          lastRoute = {...result, criterion:routeCriterion, end:routeEnd};
          box.innerHTML = `Route: <b>${result.path.map(id=>NODES.find(n=>n.id===id).name).join(' → ')}</b><br>Total ${routeCriterion}: <b>${result.total}</b>`;
          ctx.toast('Route calculated');
        }
        render();
      });
      root.querySelector('#failSel')?.addEventListener('change', e=>{ removedEdge = e.target.value || null; });
      root.querySelector('#testFail')?.addEventListener('click', ()=>{
        if(!removedEdge){ ctx.toast('Select a link first'); return; }
        GeoLab.ui._transportHadFailure = true;
        const before = connectedComponents(activeEdges(), NODES);
        const afterEdges = allEdges.filter(e=>built.has(edgeKey(e)) && edgeKey(e)!==removedEdge);
        const after = connectedComponents(afterEdges, NODES);
        const box = root.querySelector('#failResult');
        box.innerHTML = after.length > before.length
          ? `🚨 Removing this link disconnects the network into <b>${after.length}</b> separate groups.`
          : `✅ The network stays fully connected — an alternative route exists.`;
        render();
      });
      root.querySelector('#restoreFail')?.addEventListener('click', ()=>{ removedEdge=null; render(); });
    }

    render();
  }

  GeoLab.sims[SIM].mount = mount;
})();
