/* ==========================================================================
   Simulation 6 — Earthquake Waves Laboratory
   ========================================================================== */
(function(){
  let magnitude=6.0, depth=40, faultType='normal', rockType='hard';
  let running=false, elapsed=0, raf=null;
  let history=[];
  let root, EL, canvas;
  const STATIONS = [ {name:'Station A', dist:60}, {name:'Station B', dist:150}, {name:'Station C', dist:260} ];
  let arrivals = {}; // station -> {P,S,Surf}
  let waveTrace = { A:[], B:[], C:[] };

  function speeds(){
    const base = rockType==='hard' ? 7.2 : 5.0;
    const P = base * (1 - depth/1400);
    const S = P*0.58;
    const Surf = P*0.48;
    return {P,S,Surf};
  }

  function amplitudeAt(dist){
    const energy = Math.pow(10, magnitude*0.9);
    const depthAtten = 1/(1+depth/60);
    return EL.clamp((energy/(dist+20)) * depthAtten * 0.4, 0, 100);
  }

  function trigger(){
    elapsed=0; running=true; arrivals={}; waveTrace={A:[],B:[],C:[]};
    STATIONS.forEach(s=> arrivals[s.name] = {});
    EL.addXP(5);
    loop();
  }

  function loop(){
    if(!running) return;
    elapsed += 0.12; // simulated seconds (compressed)
    const timeScale = 6; // km/s -> px math handled in draw via simulated km
    const sp = speeds();
    STATIONS.forEach(s=>{
      const rec = arrivals[s.name];
      const simDist = s.dist;
      if(!rec.P && elapsed*timeScale >= simDist/sp.P) rec.P = elapsed;
      if(!rec.S && elapsed*timeScale >= simDist/sp.S) rec.S = elapsed;
      if(!rec.Surf && elapsed*timeScale >= simDist/sp.Surf){ rec.Surf = elapsed; }
    });
    // build waveform samples for chart (station A only for live trace, all stored)
    ['A','B','C'].forEach((key,i)=>{
      const s = STATIONS[i]; const rec = arrivals[s.name];
      let amp = 0;
      if(rec.Surf) amp = amplitudeAt(s.dist) * (1-Math.min((elapsed-rec.Surf)*0.15,0.9)) * (Math.random()*0.6+0.7);
      else if(rec.S) amp = amplitudeAt(s.dist)*0.45*(Math.random()*0.6+0.7);
      else if(rec.P) amp = amplitudeAt(s.dist)*0.18*(Math.random()*0.6+0.7);
      waveTrace[key].push(amp*(Math.random()<0.5?-1:1));
      if(waveTrace[key].length>160) waveTrace[key].shift();
    });
    draw();
    if(elapsed*timeScale > 350) { running=false; finalizeRun(); return; }
    raf = requestAnimationFrame(loop);
  }

  function finalizeRun(){
    STATIONS.forEach(s=>{
      const rec = arrivals[s.name];
      if(rec.P && rec.S){
        const spInterval = (rec.S-rec.P).toFixed(2);
        history.push({station:s.name, dist:s.dist, mag:magnitude, sp:spInterval});
        EL.logObservation(root, [s.name, `M${magnitude.toFixed(1)}`, `S–P = ${spInterval}s`, `at ${s.dist} km`]);
      }
    });
    if(history.length>30) history = history.slice(-30);
    updateData();
    EL.toast('Earthquake sequence complete — check the Data tab for S–P intervals');
  }

  function draw(){
    const ctx = EL.fitCanvas(canvas, 420);
    const w = canvas.clientWidth, h=420;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#12211A'; ctx.fillRect(0,0,w,h);

    const cx=w/2, cy=h/2;
    const kmToPx = Math.min(w,h)*0.42/300; // 300km fits to edge
    const timeScale=6;
    const sp = speeds();

    // grid rings reference
    ctx.strokeStyle='rgba(255,255,255,0.06)';
    [100,200,300].forEach(km=>{
      ctx.beginPath(); ctx.arc(cx,cy,km*kmToPx,0,Math.PI*2); ctx.stroke();
    });

    // wave fronts
    function ring(speed, color, width, dash){
      const r = elapsed*timeScale*speed*kmToPx;
      if(r<=0) return;
      ctx.setLineDash(dash||[]);
      ctx.strokeStyle=color; ctx.lineWidth=width;
      ctx.globalAlpha = EL.clamp(1-r/(320*kmToPx),0.05,0.9);
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha=1; ctx.setLineDash([]);
    }
    if(running || elapsed>0){
      ring(sp.P, '#D64545', 2, [6,4]);
      ring(sp.S, '#FFB300', 2.4, []);
      ring(sp.Surf, '#26C6DA', 4, []);
    }

    // epicenter
    ctx.beginPath(); ctx.moveTo(cx,cy-10); ctx.lineTo(cx+10,cy+8); ctx.lineTo(cx-10,cy+8); ctx.closePath();
    ctx.fillStyle='#D64545'; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('Epicentre', cx, cy+24);

    // stations
    STATIONS.forEach(s=>{
      const ang = s.dist===60?-0.9: s.dist===150? 0.5 : 2.4;
      const x = cx+s.dist*kmToPx*Math.cos(ang), y=cy+s.dist*kmToPx*Math.sin(ang);
      const rec = arrivals[s.name]||{};
      const hit = rec.Surf ? '#26C6DA' : rec.S ? '#FFB300' : rec.P ? '#D64545' : 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fillStyle=hit; ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font='10px sans-serif';
      ctx.fillText(`${s.name} (${s.dist}km)`, x, y-14);
      if(rec.P) ctx.fillText(`P:${rec.P.toFixed(1)}s${rec.S?` S:${rec.S.toFixed(1)}s`:''}`, x, y+22);
    });

    ctx.textAlign='left';
    ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif';
    ctx.fillText(`Magnitude ${magnitude.toFixed(1)} · Depth ${depth} km · ${faultType} fault`, 14, 22);
    ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText('Red dashed = P-wave · Amber = S-wave · Cyan thick = Surface wave', 14, 40);
  }

  function updateData(){
    const chart = document.getElementById('dataChart');
    if(chart){
      const series = ['A','B','C'].map((k,i)=>({
        data: waveTrace[k].map(y=>({y})), color: i===0?'#43A047': i===1?'#FFB300':'#26C6DA'
      })).filter(s=>s.data.length);
      if(series.length) EL.drawLineChart(chart, series, {decimals:0, minY:-100,maxY:100});
    }
    const tableHost = document.getElementById('dataTableHost');
    if(tableHost){
      tableHost.innerHTML = EL.buildTable(
        ['Station','Distance (km)','Magnitude','S–P Interval (s)'],
        history.slice().reverse().map(r=>[r.station, r.dist, r.mag.toFixed(1), r.sp])
      );
    }
  }

  function render(){
    const host = document.getElementById('controlsHost');
    host.innerHTML = `
      ${EL.slider({id:'magnitude', label:'Magnitude', min:1,max:9,step:0.1,value:magnitude,unit:' Mw'})}
      ${EL.slider({id:'depth', label:'Focal Depth', min:5,max:700,step:5,value:depth,unit:' km'})}
      ${EL.segmented({id:'faultSel', label:'Fault Type', active:['normal','reverse','strike-slip'].indexOf(faultType), options:[
        {v:'normal', label:'Normal'},{v:'reverse', label:'Reverse'},{v:'strike-slip', label:'Strike-slip'}
      ]})}
      ${EL.segmented({id:'rockSel', label:'Ground Material', active:['hard','soft'].indexOf(rockType), options:[
        {v:'hard', label:'Hard Rock'},{v:'soft', label:'Soft Sediment'}
      ]})}
      <button class="btn primary" id="triggerBtn" style="width:100%; margin-top:6px;">⚡ Trigger Earthquake</button>
      <p class="small muted" style="margin-top:10px;">Watch how P, S and Surface waves arrive at each station at different times — the gap between P and S arrival (the S–P interval) is how real seismologists estimate distance to an earthquake.</p>
    `;
    EL.wireSlider(host,'magnitude',' Mw', v=>magnitude=v);
    EL.wireSlider(host,'depth',' km', v=>depth=v);
    EL.wireSegmented(host,'faultSel', v=>faultType=v);
    EL.wireSegmented(host,'rockSel', v=>rockType=v);
    host.querySelector('#triggerBtn').addEventListener('click', trigger);
    document.getElementById('playbarHost').innerHTML='';
  }

  function reset(){ running=false; elapsed=0; arrivals={}; waveTrace={A:[],B:[],C:[]}; cancelAnimationFrame(raf); render(); draw(); }
  function mount(rootEl, EarthLab){ root=rootEl; EL=EarthLab; canvas=root.querySelector('#simCanvas'); render(); draw(); updateData(); }

  window.SimModules = window.SimModules || {};
  window.SimModules.earthquake = {
    mount, reset,
    learn:{
      background:`Earthquakes release stored elastic energy along faults, generating three main types of seismic wave. P-waves (primary) are fastest and compress-and-stretch the ground like sound. S-waves (secondary) are slower and shake the ground sideways. Surface waves travel slowest but cause the most damage because their amplitude is largest at the surface.`,
      realWorld:`Seismologists use the arrival-time difference between P and S waves at multiple stations to triangulate an earthquake's location, and use magnitude and depth to estimate likely shaking intensity for early-warning systems.`,
      misconceptions:[
        'Magnitude and "intensity of shaking felt" are not the same thing — the same magnitude earthquake can feel very different depending on depth, distance and ground material.',
        'S-waves cannot travel through liquids (like the outer core or ground water), which is actually how scientists proved part of Earth\'s core is liquid.',
        'Deeper earthquakes are not automatically weaker at the source — but their energy is spread out more by the time it reaches the surface.'],
      facts:[
        'The Richter and moment magnitude scales are logarithmic — each whole number increase represents roughly 32 times more energy released.',
        'Soft sediment can amplify shaking compared to solid bedrock, which is why building codes vary by ground type.',
        'The 1960 Valdivia earthquake in Chile, at magnitude 9.5, remains the largest ever instrumentally recorded.'],
      summary:`P-waves arrive first, S-waves second, and surface waves last but strongest. Comparing their arrival times at several seismic stations lets scientists locate an earthquake's epicentre and estimate its likely impact.`
    },
    quiz:[
      {q:'Which seismic wave arrives FIRST at a seismic station?', options:['Surface wave','S-wave','P-wave','They all arrive together'], correct:2, explain:'P-waves (primary waves) travel fastest through Earth\'s interior and always arrive first.'},
      {q:'Why do S-waves prove that part of Earth\'s core is liquid?', options:['S-waves speed up in liquid','S-waves cannot travel through liquid, creating a "shadow zone"','S-waves only travel through liquid','S-waves are not affected by material'], correct:1, explain:'S-waves cannot pass through liquid, so their absence beyond a certain distance reveals the liquid outer core.'},
      {q:'Which wave type usually causes the most surface damage?', options:['P-wave','S-wave','Surface wave','None cause damage'], correct:2, explain:'Surface waves have the largest amplitude at the surface, making them the most destructive.'},
      {q:'An increase of 1 whole number on the moment magnitude scale represents roughly:', options:['Twice the energy','10 times the energy','32 times the energy','No real difference'], correct:2, explain:'The scale is logarithmic — each whole step represents about 32 times more released energy.'},
      {q:'The S–P interval (time gap between S and P wave arrival) is mainly used to determine:', options:['The earthquake\'s magnitude','The distance from the station to the epicentre','The fault type','The rock colour'], correct:1, explain:'Because P and S waves travel at different, known speeds, the gap between their arrivals reveals distance to the source.'}
    ]
  };
})();
