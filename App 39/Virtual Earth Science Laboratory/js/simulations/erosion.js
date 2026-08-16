/* ==========================================================================
   Simulation 4 — Erosion & Deposition Studio
   ========================================================================== */
(function(){
  let agent='river';
  let riverVelocity=55, windSpeed=50, waveEnergy=50, slope=45, vegetation=35, time=0;
  let playing=false, raf=null, history=[];
  let root, EL, canvas, flowPhase=0;

  function rates(){
    let erosion, deposition;
    if(agent==='river'){
      erosion = EL.clamp(riverVelocity*0.7 + slope*0.3 - vegetation*0.15, 0,100);
      deposition = EL.clamp((100-riverVelocity)*0.6 + vegetation*0.2, 0,100);
    } else if(agent==='wind'){
      erosion = EL.clamp(windSpeed*0.8 - vegetation*0.4, 0,100);
      deposition = EL.clamp(windSpeed*0.3 + (100-windSpeed)*0.2 + vegetation*0.15, 0,100);
    } else {
      erosion = EL.clamp(waveEnergy*0.75 + slope*0.25 - vegetation*0.1, 0,100);
      deposition = EL.clamp((100-waveEnergy)*0.4 + vegetation*0.2, 0,100);
    }
    return {erosion, deposition};
  }

  function draw(){
    const ctx = EL.fitCanvas(canvas, 420);
    const w = canvas.clientWidth, h=420;
    ctx.clearRect(0,0,w,h);
    const {erosion, deposition} = rates();
    const dev = EL.clamp(time*((erosion+deposition)/2)/60, 0,100);
    flowPhase += 0.02;

    if(agent==='river') drawRiver(ctx,w,h,dev,erosion,deposition);
    else if(agent==='wind') drawWind(ctx,w,h,dev,erosion,deposition);
    else drawCoast(ctx,w,h,dev,erosion,deposition);

    ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif';
    ctx.fillText(`Landform development: ${dev.toFixed(0)}%`, 14, 24);
    ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText(`Erosion ${erosion.toFixed(0)}%  ·  Deposition ${deposition.toFixed(0)}%`, 14, 42);
    if(playing) requestAnimationFrame(draw);
  }

  function drawRiver(ctx,w,h,dev,erosion,deposition){
    ctx.fillStyle='#16261C'; ctx.fillRect(0,0,w,h);
    const amp = 14 + dev*0.5 + slope*0.15;
    const points=[];
    for(let x=0;x<=w;x+=6){
      const y = h*0.5 + Math.sin(x*0.02 + amp*0.02)*amp*Math.sin(x*0.004+1);
      points.push([x,y]);
    }
    // floodplain glow
    ctx.strokeStyle='rgba(38,198,218,0.15)'; ctx.lineWidth=60+dev*0.6;
    ctx.beginPath(); points.forEach(([x,y],i)=> i? ctx.lineTo(x,y): ctx.moveTo(x,y)); ctx.stroke();
    // river channel
    ctx.strokeStyle='#1976D2'; ctx.lineWidth=16;
    ctx.beginPath(); points.forEach(([x,y],i)=> i? ctx.lineTo(x,y): ctx.moveTo(x,y)); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=3;
    ctx.beginPath(); points.forEach(([x,y],i)=> i? ctx.lineTo(x,y+2): ctx.moveTo(x,y+2)); ctx.stroke();

    // flow particles
    for(let i=0;i<18;i++){
      const t = (i/18 + flowPhase*0.15)%1;
      const idx = Math.floor(t*(points.length-1));
      const [x,y] = points[idx];
      ctx.beginPath(); ctx.arc(x,y,2.4,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.fill();
    }
    // cut banks (erosion, outer meander bends) & point bars (deposition, inner bends)
    for(let i=10;i<points.length-10;i+=40){
      const [x,y]=points[i];
      const curve = points[i+5][1]-points[i-5][1];
      if(Math.abs(curve)>4){
        ctx.beginPath(); ctx.arc(x, y-Math.sign(curve)*14, 5+erosion*0.05,0,Math.PI*2);
        ctx.fillStyle='rgba(214,69,69,0.55)'; ctx.fill(); // cut bank erosion
        ctx.beginPath(); ctx.arc(x, y+Math.sign(curve)*14, 5+deposition*0.06,0,Math.PI*2);
        ctx.fillStyle='rgba(201,168,116,0.7)'; ctx.fill(); // point bar deposition
      }
    }
    // delta at mouth (right edge) sized by deposition
    const deltaR = 10 + deposition*0.4;
    ctx.beginPath(); ctx.arc(w-10, points[points.length-1][1], deltaR, Math.PI*0.5, Math.PI*1.5);
    ctx.fillStyle='rgba(201,168,116,0.55)'; ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='11px sans-serif';
    ctx.fillText('Delta', w-60, points[points.length-1][1]-deltaR-6);
    ctx.fillText('Cut bank (erosion)', 20, 40);
  }

  function drawWind(ctx,w,h,dev,erosion,deposition){
    const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#3A2A16'); g.addColorStop(1,'#1B140A');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    const duneCount = 3;
    const stab = vegetation>50;
    for(let d=0; d<duneCount; d++){
      const baseX = w*0.2 + d*w*0.28 + Math.sin(flowPhase*0.3+d)*windSpeed*0.15;
      const baseY = h*0.68;
      const height = 30 + dev*0.9;
      const steep = windSpeed/100;
      ctx.beginPath();
      ctx.moveTo(baseX-90, baseY);
      ctx.quadraticCurveTo(baseX-20, baseY-height, baseX+30+steep*30, baseY-height*0.5);
      ctx.quadraticCurveTo(baseX+70, baseY, baseX+120, baseY);
      ctx.closePath();
      ctx.fillStyle = stab? '#8A7440' : '#C9A874';
      ctx.fill();
      if(stab){
        ctx.fillStyle='#43A047';
        for(let i=0;i<12;i++){
          const x = baseX-70+Math.random()*160, y=baseY-2-Math.random()*6;
          ctx.fillRect(x,y,1.6,7);
        }
      }
    }
    // blowing sand particles
    for(let i=0;i<40;i++){
      const t=(i/40+flowPhase*0.4)%1;
      const x = t*w, y = h*0.55 + Math.sin(t*30+i)*10;
      ctx.fillStyle='rgba(230,210,170,'+(0.2+windSpeed/300)+')';
      ctx.fillRect(x,y,3+windSpeed*0.02,1.4);
    }
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='11px sans-serif';
    ctx.fillText(stab? 'Vegetation is stabilising the dunes' : 'Bare dunes are actively migrating downwind', 14, h-16);
  }

  function drawCoast(ctx,w,h,dev,erosion,deposition){
    const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#0F2A3A'); g.addColorStop(1,'#082133');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    const seaLevel = h*0.55;
    // cliff on left, eroded proportional to erosion & time
    const notch = Math.min(erosion*dev/220, 40);
    ctx.fillStyle='#6B4A32';
    ctx.beginPath();
    ctx.moveTo(0,0); ctx.lineTo(w*0.28,0);
    ctx.lineTo(w*0.28, seaLevel-30);
    ctx.quadraticCurveTo(w*0.28-notch, seaLevel-10, w*0.28-4, seaLevel);
    ctx.lineTo(0,seaLevel); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(w*0.28-notch*0.6, seaLevel-16, notch*0.6+4, 14,0,0,Math.PI*2); ctx.fill();

    // sea
    ctx.fillStyle='#1976D2'; ctx.fillRect(0,seaLevel,w,h-seaLevel);
    for(let i=0;i<6;i++){
      const yy = seaLevel + i*((h-seaLevel)/6);
      ctx.strokeStyle='rgba(255,255,255,'+(0.15+waveEnergy/400)+')'; ctx.lineWidth=2;
      ctx.beginPath();
      for(let x=0;x<w;x+=10){
        const y = yy + Math.sin(x*0.05+flowPhase*3+i)* (2+waveEnergy*0.03);
        x? ctx.lineTo(x,y): ctx.moveTo(x,y);
      }
      ctx.stroke();
    }
    // beach / spit deposition on right, sized by deposition
    const beachW = 30 + deposition*1.1;
    ctx.fillStyle='#E3C9A0';
    ctx.beginPath();
    ctx.moveTo(w, seaLevel-10);
    ctx.quadraticCurveTo(w-beachW*0.6, seaLevel, w-beachW, seaLevel+18);
    ctx.lineTo(w, seaLevel+30);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='11px sans-serif';
    ctx.fillText('Wave-cut notch (erosion)', 10, seaLevel-40);
    ctx.fillText('Beach deposit', w-beachW-10, seaLevel-6);
  }

  function stepTime(dt){
    time = EL.clamp(time+dt,0,100);
    document.getElementById('time').value=time;
    document.getElementById('timeVal').textContent = time.toFixed(0);
    draw();
  }
  function loop(){ playing=true; draw(); }
  function stopLoop(){ playing=false; }

  function record(){
    const {erosion,deposition} = rates();
    const dev = EL.clamp(time*((erosion+deposition)/2)/60,0,100);
    history.push({t:time, agent, erosion, deposition, dev});
    if(history.length>30) history.shift();
    EL.logObservation(root, [`t=${time.toFixed(0)}`, agent, dev.toFixed(0)+'% developed', `Erosion ${erosion.toFixed(0)} / Deposition ${deposition.toFixed(0)}`]);
    updateData(); EL.addXP(3);
  }
  function updateData(){
    const chart = document.getElementById('dataChart');
    if(chart && history.length){
      EL.drawLineChart(chart,[
        {data:history.map(r=>({y:r.erosion})), color:'#D64545'},
        {data:history.map(r=>({y:r.deposition})), color:'#26C6DA'},
        {data:history.map(r=>({y:r.dev})), color:'#FFB300', fill:true},
      ],{decimals:0, xLabels:history.map(r=>'t'+r.t.toFixed(0))});
    }
    const tableHost = document.getElementById('dataTableHost');
    if(tableHost){
      tableHost.innerHTML = EL.buildTable(
        ['Time','Agent','Erosion %','Deposition %','Landform %'],
        history.slice().reverse().map(r=>[r.t.toFixed(0), r.agent, r.erosion.toFixed(0), r.deposition.toFixed(0), r.dev.toFixed(0)])
      );
    }
  }

  function render(){
    const host = document.getElementById('controlsHost');
    host.innerHTML = `
      ${EL.segmented({id:'agentSel', label:'Erosional Agent', active:['river','wind','coast'].indexOf(agent), options:[
        {v:'river', label:'River'},{v:'wind', label:'Wind'},{v:'coast', label:'Waves'}
      ]})}
      ${EL.slider({id:'riverVelocity', label:'River Velocity', min:0,max:100,step:1,value:riverVelocity,unit:'%'})}
      ${EL.slider({id:'windSpeed', label:'Wind Speed', min:0,max:100,step:1,value:windSpeed,unit:'%'})}
      ${EL.slider({id:'waveEnergy', label:'Wave Energy', min:0,max:100,step:1,value:waveEnergy,unit:'%'})}
      ${EL.slider({id:'slope', label:'Slope / Gradient', min:0,max:100,step:1,value:slope,unit:'%'})}
      ${EL.slider({id:'vegetation', label:'Vegetation Cover', min:0,max:100,step:1,value:vegetation,unit:'%'})}
      ${EL.slider({id:'time', label:'Elapsed Time', min:0,max:100,step:1,value:time,unit:''})}
      <button class="btn primary" id="recordBtn" style="width:100%;">📌 Record Snapshot</button>
    `;
    EL.wireSegmented(host,'agentSel', v=>{ agent=v; draw(); });
    EL.wireSlider(host,'riverVelocity','%', v=>{riverVelocity=v; draw();});
    EL.wireSlider(host,'windSpeed','%', v=>{windSpeed=v; draw();});
    EL.wireSlider(host,'waveEnergy','%', v=>{waveEnergy=v; draw();});
    EL.wireSlider(host,'slope','%', v=>{slope=v; draw();});
    EL.wireSlider(host,'vegetation','%', v=>{vegetation=v; draw();});
    EL.wireSlider(host,'time','', v=>{time=v; draw();});
    host.querySelector('#recordBtn').addEventListener('click', record);
    EL.playbar(document.getElementById('playbarHost'), {
      onPlay:()=>loop(), onPause:()=>stopLoop(), onStep:()=>stepTime(5), onStepBack:()=>stepTime(-5)
    });
  }

  function reset(){ time=0; history=[]; playing=false; render(); draw(); updateData(); }
  function mount(rootEl, EarthLab){ root=rootEl; EL=EarthLab; canvas=root.querySelector('#simCanvas'); render(); draw(); updateData(); }

  window.SimModules = window.SimModules || {};
  window.SimModules.erosion = {
    mount, reset,
    learn:{
      background:`Erosion transports material that weathering has broken down; deposition drops that material somewhere else once the transporting agent (water, wind or waves) loses energy. Rivers erode outer meander bends and deposit on inner point bars; wind lifts and redeposits sand into dunes; waves erode cliffs into notches and deposit sand into beaches and spits.`,
      realWorld:`Understanding erosion and deposition helps engineers design river embankments and coastal defences, helps farmers prevent topsoil loss, and helps town planners avoid building on unstable dunes or actively eroding coastlines.`,
      misconceptions:[
        'A river does not erode evenly across its whole channel — erosion concentrates on the outside of bends while deposition builds up on the inside.',
        'Sand dunes are not static — unvegetated dunes actively migrate in the direction of the prevailing wind.',
        'Coastal erosion and deposition often happen right next to each other — material eroded from a cliff can be deposited just along the coast as a beach.'],
      facts:[
        'The Mississippi River delta has been built from sediment eroded from more than 40% of the continental United States.',
        'Sand dunes can migrate several metres per year if left unvegetated.',
        'A meandering river can shift its entire course sideways by kilometres over centuries.'],
      summary:`Erosion and deposition are two sides of the same process: energetic agents like fast rivers, strong winds and powerful waves erode material, then deposit it once they slow down or lose energy — continuously reshaping landscapes.`
    },
    quiz:[
      {q:'On a meandering river, where does erosion mainly occur?', options:['On the inside of a bend','On the outside of a bend','Only at the source','Only at the delta'], correct:1, explain:'Faster-flowing water on the outside of a bend erodes the bank, forming a cut bank.'},
      {q:'What mainly stabilises sand dunes and slows their migration?', options:['High wind speed','Vegetation cover','Low rainfall','Steep slope'], correct:1, explain:'Plant roots bind sand grains together, reducing how much the wind can move the dune.'},
      {q:'A wave-cut notch at the base of a sea cliff is evidence of:', options:['Deposition','Erosion','Weathering only, no transport','Wind erosion'], correct:1, explain:'A wave-cut notch forms where wave energy erodes the base of a cliff.'},
      {q:'A river delta forms mainly because:', options:['The river speeds up at its mouth','The river slows down and drops its sediment load','The river dries up','Vegetation blocks the river'], correct:1, explain:'As a river enters a lake or sea, it slows down and can no longer carry as much sediment, which is deposited as a delta.'},
      {q:'Which agent is most likely to build a beach or a spit?', options:['Wind alone','Waves and longshore currents','Freeze-thaw weathering','Root wedging'], correct:1, explain:'Waves and the currents they generate transport and deposit sand along coastlines, forming beaches and spits.'}
    ]
  };
})();
