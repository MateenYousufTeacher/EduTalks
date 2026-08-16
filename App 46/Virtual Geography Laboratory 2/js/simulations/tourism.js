(function(){
  const SIM='tourism';

  const SITES = [
    {id:'s1', name:'Old Fort', type:'Historical', x:20,y:30, cost:8, dur:1.5, open:[9,17]},
    {id:'s2', name:'Art Museum', type:'Museum', x:35,y:20, cost:12, dur:2, open:[10,18]},
    {id:'s3', name:'Skyline Point', type:'Viewpoint', x:55,y:15, cost:0, dur:1, open:[6,20]},
    {id:'s4', name:'Heritage Quarter', type:'Cultural', x:40,y:45, cost:5, dur:2, open:[8,20]},
    {id:'s5', name:'Canyon Trail', type:'Adventure', x:70,y:40, cost:20, dur:3, open:[7,16]},
    {id:'s6', name:'Lakeside Rest', type:'Rest Area', x:60,y:60, cost:0, dur:1, open:[0,24]},
    {id:'s7', name:'Grand Hotel', type:'Hotel', x:45,y:35, cost:0, dur:0, open:[0,24]},
    {id:'s8', name:'Central Station', type:'Transport', x:38,y:38, cost:0, dur:0, open:[0,24]},
    {id:'s9', name:'Botanical Garden', type:'Natural', x:25,y:55, cost:6, dur:1.5, open:[8,18]},
    {id:'s10', name:'Night Bazaar', type:'Cultural', x:50,y:70, cost:3, dur:2, open:[17,23]}
  ];
  function distKm(a,b){ return Math.hypot(a.x-b.x, a.y-b.y)*0.6; } // scale
  function travelHrs(a,b){ return distKm(a,b)/25; } // avg 25km/h incl. transfers

  const MISSIONS=[
    {id:'m1', title:'Five in a Day', desc:'Fit five attractions in a single day itinerary.'},
    {id:'m2', title:'Cheapest Itinerary', desc:'Build a 3-stop day for under 15 budget.'},
    {id:'m3', title:'Shortest Itinerary', desc:'Build a feasible day with under 2 hours total travel.'},
    {id:'m4', title:'Most Diverse', desc:'Visit 4+ different attraction types in one trip.'},
    {id:'m5', title:'Three-Day Tour', desc:'Fill all three days of the itinerary.'}
  ];

  function mount(root, ctx){
    let days = [[],[],[]]; // arrays of site ids
    let activeDay = 0;
    let done = GeoLab.ui.loadProgress(SIM).missions;

    function evaluateDay(ids){
      const sites = ids.map(id=>SITES.find(s=>s.id===id));
      let travel=0, cost=0, dur=0, issues=[];
      for(let i=0;i<sites.length;i++){
        cost += sites[i].cost; dur += sites[i].dur;
        if(i>0){ travel += travelHrs(sites[i-1], sites[i]); }
      }
      const total = travel+dur;
      if(total>10) issues.push('Exceeds a reasonable 10-hour day');
      const types = new Set(sites.map(s=>s.type));
      return {travel:+travel.toFixed(1), cost, dur:+dur.toFixed(1), total:+total.toFixed(1), issues, typeCount:types.size, count:sites.length};
    }

    function mapSVG(dayIds){
      let svg = `<svg id="tourSvg" viewBox="0 0 100 80" style="width:100%;border-radius:10px;background:#F4F8FC;">`;
      // path lines between selected in order
      for(let i=0;i<dayIds.length-1;i++){
        const a=SITES.find(s=>s.id===dayIds[i]), b=SITES.find(s=>s.id===dayIds[i+1]);
        svg += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#43A047" stroke-width="1" stroke-dasharray="1.5 1"/>`;
      }
      SITES.forEach((s,idx)=>{
        const selected = dayIds.includes(s.id);
        const order = dayIds.indexOf(s.id);
        svg += `<g data-site="${s.id}" style="cursor:pointer;">
          <circle cx="${s.x}" cy="${s.y}" r="4" fill="${selected?'#1976D2':'#fff'}" stroke="#0D47A1" stroke-width="1"/>
          ${selected? `<text x="${s.x}" y="${s.y+1.2}" font-size="3.4" text-anchor="middle" fill="#fff" font-weight="700">${order+1}</text>` : ''}
          <text x="${s.x}" y="${s.y+7.5}" font-size="2.8" text-anchor="middle" fill="#334">${s.name}</text>
        </g>`;
      });
      svg += `</svg>`;
      return svg;
    }

    function render(){
      const ev = evaluateDay(days[activeDay]);
      root.innerHTML = `
        <div class="panel">
          <h3>Destination Map <span class="sub">Tap sites to add/remove from Day ${activeDay+1}</span></h3>
          ${mapSVG(days[activeDay])}
        </div>

        <div class="panel">
          <h3>Trip Days</h3>
          <div class="tabbar" id="dayTab">
            ${[0,1,2].map(i=>`<button data-tab="${i}" class="${activeDay===i?'active':''}">Day ${i+1} (${days[i].length})</button>`).join('')}
          </div>
          <div>
            ${days[activeDay].length ? days[activeDay].map((id,i)=>{
              const s=SITES.find(x=>x.id===id);
              return `<div class="control-row"><label>${i+1}. ${s.name} <small style="color:#8a93a3;">(${s.type})</small></label><button class="btn btn-tertiary btn-sm" data-remove="${id}">Remove</button></div>`;
            }).join('') : `<p style="font-size:.8rem;color:#78839a;">No stops yet — tap sites on the map to build today's plan.</p>`}
          </div>
        </div>

        <div class="panel">
          <h3>Itinerary Check</h3>
          <div class="metric-grid">
            ${GeoLab.ui.metric('Stops', ev.count)}
            ${GeoLab.ui.metric('Total cost', ev.cost)}
            ${GeoLab.ui.metric('Visit hours', ev.dur)}
            ${GeoLab.ui.metric('Travel hours', ev.travel)}
          </div>
          ${ev.issues.length ? ev.issues.map(w=>`<p style="font-size:.78rem;color:#B45F06;margin-top:8px;">⚠️ ${w}</p>`).join('') : `<p style="font-size:.8rem;color:var(--green);margin-top:8px;">✅ Feasible day plan.</p>`}
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
      const evs = days.map(evaluateDay);
      if(evs.some(e=>e.count>=5)) GeoLab.ui.markMission(SIM,'m1',ctx);
      if(evs.some(e=>e.count>=3 && e.cost<15)) GeoLab.ui.markMission(SIM,'m2',ctx);
      if(evs.some(e=>e.count>=2 && e.travel<2)) GeoLab.ui.markMission(SIM,'m3',ctx);
      if(evs.some(e=>e.typeCount>=4)) GeoLab.ui.markMission(SIM,'m4',ctx);
      if(days.every(d=>d.length>0)) GeoLab.ui.markMission(SIM,'m5',ctx);
      done = GeoLab.ui.loadProgress(SIM).missions;
    }

    function bind(){
      checkMissions();
      GeoLab.ui.bindTabbar(root.querySelector('#dayTab').parentElement, t=>{ activeDay=+t; render(); });
      root.querySelectorAll('[data-site]').forEach(el=>el.addEventListener('click', ()=>{
        const id = el.dataset.site;
        const list = days[activeDay];
        const i = list.indexOf(id);
        if(i>=0) list.splice(i,1); else list.push(id);
        render();
      }));
      root.querySelectorAll('[data-remove]').forEach(el=>el.addEventListener('click', ()=>{
        const id = el.dataset.remove;
        days[activeDay] = days[activeDay].filter(x=>x!==id);
        render();
      }));
    }

    render();
  }

  GeoLab.sims[SIM].mount = mount;
})();
