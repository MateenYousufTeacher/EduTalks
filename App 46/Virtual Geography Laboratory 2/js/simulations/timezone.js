(function(){
  const SIM='timezone';

  // offsets in hours from UTC (fractional allowed)
  const CITIES = [
    {name:'London', off:0}, {name:'Paris', off:1}, {name:'Cairo', off:2},
    {name:'Moscow', off:3}, {name:'Dubai', off:4}, {name:'New Delhi', off:5.5},
    {name:'Dhaka', off:6}, {name:'Bangkok', off:7}, {name:'Beijing', off:8},
    {name:'Tokyo', off:9}, {name:'Sydney', off:10}, {name:'Auckland', off:12},
    {name:'Honolulu', off:-10}, {name:'Anchorage', off:-9}, {name:'Los Angeles', off:-8},
    {name:'Denver', off:-7}, {name:'Chicago', off:-6}, {name:'New York', off:-5},
    {name:'Sao Paulo', off:-3}, {name:'Reykjavik', off:0}, {name:'Lagos', off:1}
  ];

  function pad(n){ return String(n).padStart(2,'0'); }
  // ref = {y,m,d,h,mi} treated as UTC baseline
  function localFor(refUTCms, offsetH){
    const t = new Date(refUTCms + offsetH*3600*1000);
    return t;
  }
  function fmt(date){
    return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  }
  function fmtDate(date){
    const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return `${days[date.getUTCDay()]} ${date.getUTCFullYear()}-${pad(date.getUTCMonth()+1)}-${pad(date.getUTCDate())}`;
  }

  const MISSIONS=[
    {id:'m1', title:'Find a Local Time', desc:'Pick any city and read off its current local time.'},
    {id:'m2', title:'Spot the Date Shift', desc:'Find two cities that are on different calendar dates right now.'},
    {id:'m3', title:'Schedule a Global Meeting', desc:'Find an overlapping working-hour slot for 3 cities.'},
    {id:'m4', title:'Calculate Arrival Time', desc:'Run the flight-time calculator.'},
    {id:'m5', title:'Cross the Date Line', desc:'Solve a date-line challenge.'}
  ];

  function mount(root, ctx){
    let refUTC = Date.now(); // ms since epoch, treated as the simulated reference UTC instant
    let selectedCity = 'New Delhi';
    let done = GeoLab.ui.loadProgress(SIM).missions;
    let planCities = ['London','New York','Tokyo'];
    let workStart=9, workEnd=17;
    let flight = {from:'London', to:'New York', durH:8, depH:14, depM:0};
    let dlChallenge = pickDLChallenge();

    function pickDLChallenge(){
      const a = CITIES[Math.floor(Math.random()*CITIES.length)];
      let b = CITIES[Math.floor(Math.random()*CITIES.length)];
      while(b.name===a.name) b = CITIES[Math.floor(Math.random()*CITIES.length)];
      return {a,b, testHour: Math.floor(Math.random()*24)};
    }

    function clockCard(city){
      const d = localFor(refUTC, city.off);
      const hour = d.getUTCHours();
      const isDay = hour>=6 && hour<18;
      return `<div class="metric" style="background:${isDay?'#EAF4FF':'#1B2A4A'};color:${isDay?'#0D47A1':'#fff'};">
        <div class="m-label" style="color:${isDay?'#4a5a78':'#9db3e0'};">${city.name} ${isDay?'☀️':'🌙'}</div>
        <div class="m-val" style="color:${isDay?'#0D47A1':'#fff'};">${fmt(d)}</div>
        <div style="font-size:.68rem;opacity:.8;margin-top:2px;">${fmtDate(d)} · UTC${city.off>=0?'+':''}${city.off}</div>
      </div>`;
    }

    function render(){
      const sel = CITIES.find(c=>c.name===selectedCity);
      root.innerHTML = `
        <div class="panel" style="background:linear-gradient(135deg,#0D2A5C,#1B3B7A);color:#fff;">
          <h3 style="color:#fff;">Reference Clock <span class="sub" style="color:#c9d7f5;">Drag to change the simulated moment</span></h3>
          <div style="text-align:center;margin:10px 0;">
            <div style="font-family:var(--font-display);font-size:2.2rem;font-weight:800;">${fmt(new Date(refUTC))} UTC</div>
            <div style="font-size:.8rem;color:#c9d7f5;">${fmtDate(new Date(refUTC))}</div>
          </div>
          ${GeoLab.ui.slider({id:'refHour', label:'Hour (UTC)', min:0,max:23,value:new Date(refUTC).getUTCHours()})}
          ${GeoLab.ui.slider({id:'refDay', label:'Day offset', min:-3,max:3,value:0})}
        </div>

        <div class="panel">
          <h3>City Time <span class="sub">Select a city to view its local time</span></h3>
          <select id="citySel">${CITIES.map(c=>`<option ${c.name===selectedCity?'selected':''}>${c.name}</option>`).join('')}</select>
          <div style="margin-top:10px;">${clockCard(sel)}</div>
        </div>

        <div class="panel">
          <h3>Day/Night & Date Comparison</h3>
          <div class="metric-grid">
            ${['London','New Delhi','Tokyo','Los Angeles'].map(n=>clockCard(CITIES.find(c=>c.name===n))).join('')}
          </div>
        </div>

        <div class="panel">
          <h3>Global Meeting Planner <span class="sub">Find overlap in working hours (9am–5pm local unless changed)</span></h3>
          <div style="display:flex;gap:8px;">
            ${[0,1,2].map(i=>`<select data-plancity="${i}" style="flex:1;">${CITIES.map(c=>`<option ${planCities[i]===c.name?'selected':''}>${c.name}</option>`).join('')}</select>`).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <div style="flex:1;"><label style="font-size:.78rem;">Work start (local)</label><input type="number" id="wStart" min="0" max="23" value="${workStart}"></div>
            <div style="flex:1;"><label style="font-size:.78rem;">Work end (local)</label><input type="number" id="wEnd" min="1" max="24" value="${workEnd}"></div>
          </div>
          <button class="btn btn-primary btn-sm btn-block" id="findOverlap" style="margin-top:10px;">Find Overlapping Slot</button>
          <div id="overlapResult" style="margin-top:10px;font-size:.85rem;"></div>
        </div>

        <div class="panel">
          <h3>Flight Time Lab</h3>
          <div style="display:flex;gap:8px;">
            <select id="flyFrom" style="flex:1;">${CITIES.map(c=>`<option ${flight.from===c.name?'selected':''}>${c.name}</option>`).join('')}</select>
            <select id="flyTo" style="flex:1;">${CITIES.map(c=>`<option ${flight.to===c.name?'selected':''}>${c.name}</option>`).join('')}</select>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <div style="flex:1;"><label style="font-size:.78rem;">Departure hour (local)</label><input type="number" id="depH" min="0" max="23" value="${flight.depH}"></div>
            <div style="flex:1;"><label style="font-size:.78rem;">Flight duration (hrs)</label><input type="number" id="durH" min="1" max="20" value="${flight.durH}"></div>
          </div>
          <button class="btn btn-primary btn-sm btn-block" id="calcFlight" style="margin-top:10px;">Calculate Arrival</button>
          <div id="flightResult" style="margin-top:10px;font-size:.85rem;"></div>
        </div>

        <div class="panel">
          <h3>Date-Line Challenge</h3>
          <p style="font-size:.85rem;">It is <b>${dlChallenge.testHour}:00</b> local time in <b>${dlChallenge.a.name}</b> (UTC${dlChallenge.a.off>=0?'+':''}${dlChallenge.a.off}). What is the local <b>date and time</b> in <b>${dlChallenge.b.name}</b> (UTC${dlChallenge.b.off>=0?'+':''}${dlChallenge.b.off}), and does the calendar day move forward or backward?</p>
          <button class="btn btn-secondary btn-sm" id="revealDL" style="margin-top:8px;">Reveal Answer</button>
          <div id="dlResult" style="margin-top:8px;font-size:.85rem;"></div>
          <button class="btn btn-tertiary btn-sm" id="newDL" style="margin-top:8px;">New Challenge</button>
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

    function complete(id){ if(GeoLab.ui.markMission(SIM,id,ctx)) done = GeoLab.ui.loadProgress(SIM).missions; }

    function bind(){
      GeoLab.ui.bindSlider('refHour','', v=>{
        const d = new Date(refUTC); d.setUTCHours(v); refUTC = d.getTime(); render();
      });
      GeoLab.ui.bindSlider('refDay','', v=>{
        const base = new Date(); base.setUTCDate(base.getUTCDate()+v); refUTC = base.getTime(); render();
      });
      root.querySelector('#citySel')?.addEventListener('change', e=>{ selectedCity=e.target.value; complete('m1'); render(); });

      root.querySelectorAll('[data-plancity]').forEach(sel=>sel.addEventListener('change', e=>{
        planCities[+e.target.dataset.plancity] = e.target.value; render();
      }));
      root.querySelector('#wStart')?.addEventListener('change', e=>{ workStart=+e.target.value; });
      root.querySelector('#wEnd')?.addEventListener('change', e=>{ workEnd=+e.target.value; });
      root.querySelector('#findOverlap')?.addEventListener('click', ()=>{
        const cities = planCities.map(n=>CITIES.find(c=>c.name===n));
        let slots=[];
        for(let utcH=0; utcH<24; utcH++){
          const ok = cities.every(c=>{
            let lh = ((utcH + c.off) % 24 + 24) % 24;
            return lh>=workStart && lh<workEnd;
          });
          if(ok) slots.push(utcH);
        }
        const box = root.querySelector('#overlapResult');
        if(slots.length){
          box.innerHTML = `✅ Overlap found at <b>${slots.map(h=>pad(h)+':00 UTC').join(', ')}</b>.<br>` +
            cities.map(c=>{
              const lh = ((slots[0]+c.off)%24+24)%24;
              return `${c.name}: ${pad(Math.floor(lh))}:00 local`;
            }).join(' · ');
          complete('m3');
        } else {
          box.innerHTML = `⚠️ No common working-hour overlap across all three cities with these hours. Try adjusting the working-hour range.`;
        }
      });

      root.querySelector('#flyFrom')?.addEventListener('change', e=>flight.from=e.target.value);
      root.querySelector('#flyTo')?.addEventListener('change', e=>flight.to=e.target.value);
      root.querySelector('#depH')?.addEventListener('change', e=>flight.depH=+e.target.value);
      root.querySelector('#durH')?.addEventListener('change', e=>flight.durH=+e.target.value);
      root.querySelector('#calcFlight')?.addEventListener('click', ()=>{
        const from = CITIES.find(c=>c.name===flight.from), to = CITIES.find(c=>c.name===flight.to);
        const depUTC_h = flight.depH - from.off;      // departure instant, in UTC hours-from-midnight
        const arrUTC_h = depUTC_h + flight.durH;       // arrival instant, in UTC hours-from-midnight
        const arrLocal_raw = arrUTC_h + to.off;        // arrival instant, in destination local hours-from-midnight
        const arrLocal_h = ((arrLocal_raw % 24) + 24) % 24;
        const box = root.querySelector('#flightResult');
        const arrDay = Math.floor(arrLocal_raw/24) - Math.floor(flight.depH/24);
        box.innerHTML = `Departs ${flight.from} at <b>${pad(flight.depH)}:00</b> local.<br>
          Flight duration: <b>${flight.durH}h</b>.<br>
          Arrives ${flight.to} at local time <b>${pad(Math.floor(arrLocal_h))}:00</b>${arrDay!==0 ? `, <b>${Math.abs(arrDay)} day(s) ${arrDay>0?'later':'earlier'}</b>` : ' the same day'}.`;
        complete('m4');
      });

      root.querySelector('#revealDL')?.addEventListener('click', ()=>{
        const {a,b,testHour} = dlChallenge;
        const utcH = testHour - a.off;      // UTC hour-offset for the reference instant
        const bLocalRaw = utcH + b.off;     // City B's local hour-offset from the same instant
        const bLocalH = ((bLocalRaw % 24)+24)%24;
        const netShift = Math.floor(bLocalRaw/24) - Math.floor(utcH/24); // whole-day difference
        root.querySelector('#dlResult').innerHTML = `In <b>${b.name}</b> it is <b>${pad(Math.floor(bLocalH))}:00</b>, ${netShift>0?'one or more calendar days <b>ahead</b>':netShift<0?'one or more calendar days <b>behind</b>':'the <b>same calendar day</b>'} relative to ${a.name}.<br><small>Because the difference in UTC offset spans ${(b.off-a.off).toFixed(1)}h.</small>`;
        complete('m5');
      });
      root.querySelector('#newDL')?.addEventListener('click', ()=>{ dlChallenge = pickDLChallenge(); render(); });
    }

    render();
  }

  GeoLab.sims[SIM].mount = mount;
})();
