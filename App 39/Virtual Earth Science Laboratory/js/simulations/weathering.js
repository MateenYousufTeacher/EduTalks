/* ==========================================================================
   Simulation 3 — Weathering Laboratory
   ========================================================================== */
(function(){
  let temperature=60, rainfall=50, freezeThaw=40, roots=30, wind=35, time=0;
  let playing=false, raf=null, history=[];
  let root, EL, canvas;
  let cracks=[], pits=[], debris=[];

  function rates(){
    const physical = EL.clamp(freezeThaw*0.65 + wind*0.25 + Math.abs(temperature-50)*0.2, 0,100);
    const chemical = EL.clamp(rainfall*0.6 + temperature*0.45, 0,100);
    const biological = EL.clamp(roots*1.0, 0,100);
    return {physical, chemical, biological, total:(physical+chemical+biological)/3};
  }

  function dominant(){
    const r = rates();
    const arr = [['Physical',r.physical],['Chemical',r.chemical],['Biological',r.biological]];
    arr.sort((a,b)=>b[1]-a[1]);
    return arr[0][0];
  }

  function seedFeatures(){
    // deterministic-ish pseudo random seeded by nothing special, regenerate each reset
    cracks=[]; pits=[]; debris=[];
    for(let i=0;i<24;i++) cracks.push({a:Math.random()*Math.PI*2, len:0, branch:Math.random()<0.4});
    for(let i=0;i<16;i++) pits.push({x:Math.random(), y:Math.random(), r:0});
    for(let i=0;i<30;i++) debris.push({x:Math.random(), y:Math.random(), fall:0, speed:0.3+Math.random()*0.6});
  }
  seedFeatures();

  function draw(){
    const ctx = EL.fitCanvas(canvas, 420);
    const w = canvas.clientWidth, h=420;
    ctx.clearRect(0,0,w,h);
    // sky/backdrop gradient reflecting climate
    const g = ctx.createLinearGradient(0,0,0,h);
    const cold = temperature<35, hot=temperature>70;
    g.addColorStop(0, cold? '#1B2A38' : hot? '#3A2A16':'#16261C');
    g.addColorStop(1, '#0E1712');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);

    const r = rates();
    const damage = EL.clamp(time*r.total/60, 0, 100);

    const cx=w*0.5, cy=h*0.56, R=Math.min(w,h)*0.28;
    // boulder shape (irregular polygon), eroded rounder with higher wind
    ctx.beginPath();
    const pts=28;
    for(let i=0;i<=pts;i++){
      const a = i/pts*Math.PI*2;
      const wobble = (Math.sin(a*5)+Math.sin(a*3))* (6 - wind*0.03) * (1-damage/220);
      const rr = R + wobble;
      const x = cx+rr*Math.cos(a), y=cy+rr*Math.sin(a)*0.85;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle = '#6B4A32';
    ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=2; ctx.stroke();

    ctx.save();
    ctx.clip();
    // base shading
    const rg = ctx.createRadialGradient(cx-R*0.3,cy-R*0.3,10,cx,cy,R*1.2);
    rg.addColorStop(0,'rgba(255,255,255,0.12)'); rg.addColorStop(1,'rgba(0,0,0,0.25)');
    ctx.fillStyle=rg; ctx.fillRect(cx-R,cy-R,R*2,R*2);

    // cracks — physical + biological (roots) driven
    const crackGrowth = EL.clamp((r.physical*0.7+r.biological*0.3) * time/100, 0, 100);
    cracks.forEach(c=>{
      c.len = R*0.85*EL.clamp(crackGrowth/100,0,1)*(0.6+Math.random()*0.1);
      const x1=cx, y1=cy;
      const x2 = cx + c.len*Math.cos(c.a), y2 = cy + c.len*Math.sin(c.a)*0.85;
      ctx.strokeStyle='rgba(20,14,8,0.8)'; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      if(c.branch && crackGrowth>40){
        const bx = x1+(x2-x1)*0.6 + 10*Math.cos(c.a+1.2);
        const by = y1+(y2-y1)*0.6 + 10*Math.sin(c.a+1.2);
        ctx.beginPath(); ctx.moveTo(x1+(x2-x1)*0.6, y1+(y2-y1)*0.6); ctx.lineTo(bx,by); ctx.stroke();
      }
    });
    // root wedges visualised as small green forks along biggest cracks
    if(roots>35){
      ctx.strokeStyle='rgba(67,160,71,0.7)';
      cracks.slice(0,Math.round(roots/15)).forEach(c=>{
        const x2 = cx + c.len*Math.cos(c.a), y2 = cy + c.len*Math.sin(c.a)*0.85;
        ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2+6,y2-6); ctx.moveTo(x2,y2); ctx.lineTo(x2-6,y2+4); ctx.stroke();
      });
    }
    // pits — chemical weathering
    const pitGrowth = EL.clamp(r.chemical*time/100, 0,100);
    pits.forEach(p=>{
      p.r = 2 + (pitGrowth/100)*10;
      const x = cx + (p.x-0.5)*R*1.4, y = cy + (p.y-0.5)*R*1.1;
      ctx.beginPath(); ctx.arc(x,y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fill();
    });
    ctx.restore();

    // debris particles falling — total erosion
    const erosionActive = damage>15;
    if(erosionActive){
      debris.forEach(d=>{
        d.fall = (d.fall + d.speed*(damage/60)) % (h-cy-R*0.6);
        const x = cx + (d.x-0.5)*R*1.6, y = cy+R*0.75 + d.fall;
        ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fillStyle='rgba(107,74,50,0.8)'; ctx.fill();
      });
    }

    // ground with scree pile scaled to damage
    ctx.fillStyle='#2A1E12';
    ctx.fillRect(0, cy+R*0.9, w, h-(cy+R*0.9));
    ctx.fillStyle='rgba(107,74,50,0.7)';
    const pileW = R*1.6*(damage/100);
    ctx.beginPath();
    ctx.moveTo(cx-pileW/2, cy+R*0.9);
    ctx.quadraticCurveTo(cx, cy+R*0.9-pileW*0.22, cx+pileW/2, cy+R*0.9);
    ctx.closePath(); ctx.fill();

    // labels
    ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif';
    ctx.fillText(`Damage: ${damage.toFixed(0)}%  ·  Dominant process: ${dominant()} weathering`, 14, 26);
    ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText(`Physical ${r.physical.toFixed(0)}%  ·  Chemical ${r.chemical.toFixed(0)}%  ·  Biological ${r.biological.toFixed(0)}%`, 14, 44);
  }

  function stepTime(dt){
    time = EL.clamp(time+dt,0,100);
    document.getElementById('time').value = time;
    document.getElementById('timeVal').textContent = time.toFixed(0);
    draw();
  }
  function loop(){
    if(!playing) return;
    stepTime(0.7);
    if(time>=100){ playing=false; EL.toast('Simulated exposure complete'); return; }
    raf=requestAnimationFrame(loop);
  }

  function record(){
    const r = rates();
    const damage = EL.clamp(time*r.total/60,0,100);
    history.push({t:time, ...r, damage, dom:dominant()});
    if(history.length>30) history.shift();
    EL.logObservation(root, [`t=${time.toFixed(0)}`, dominant()+' weathering', damage.toFixed(0)+'%', `P${r.physical.toFixed(0)} C${r.chemical.toFixed(0)} B${r.biological.toFixed(0)}`]);
    updateData(); EL.addXP(3);
  }

  function updateData(){
    const chart = document.getElementById('dataChart');
    if(chart && history.length){
      EL.drawLineChart(chart, [
        {data:history.map(r=>({y:r.damage})), color:'#D64545', fill:true},
        {data:history.map(r=>({y:r.chemical})), color:'#26C6DA'},
        {data:history.map(r=>({y:r.physical})), color:'#FFB300'}
      ], {decimals:0, xLabels:history.map(r=>'t'+r.t.toFixed(0))});
    }
    const tableHost = document.getElementById('dataTableHost');
    if(tableHost){
      tableHost.innerHTML = EL.buildTable(
        ['Time','Dominant','Damage %','Physical','Chemical','Biological'],
        history.slice().reverse().map(r=>[r.t.toFixed(0), r.dom, r.damage.toFixed(0), r.physical.toFixed(0), r.chemical.toFixed(0), r.biological.toFixed(0)])
      );
    }
  }

  function render(){
    const host = document.getElementById('controlsHost');
    host.innerHTML = `
      ${EL.slider({id:'temperature', label:'Temperature', min:0,max:100,step:1,value:temperature,unit:'%'})}
      ${EL.slider({id:'rainfall', label:'Rainfall', min:0,max:100,step:1,value:rainfall,unit:'%'})}
      ${EL.slider({id:'freezeThaw', label:'Freeze–Thaw Cycles', min:0,max:100,step:1,value:freezeThaw,unit:'%'})}
      ${EL.slider({id:'roots', label:'Plant Root Activity', min:0,max:100,step:1,value:roots,unit:'%'})}
      ${EL.slider({id:'wind', label:'Wind Exposure', min:0,max:100,step:1,value:wind,unit:'%'})}
      ${EL.slider({id:'time', label:'Elapsed Exposure Time', min:0,max:100,step:1,value:time,unit:''})}
      <button class="btn primary" id="recordBtn" style="width:100%;">📌 Record Snapshot</button>
    `;
    EL.wireSlider(host,'temperature','%', v=>{temperature=v;draw();});
    EL.wireSlider(host,'rainfall','%', v=>{rainfall=v;draw();});
    EL.wireSlider(host,'freezeThaw','%', v=>{freezeThaw=v;draw();});
    EL.wireSlider(host,'roots','%', v=>{roots=v;draw();});
    EL.wireSlider(host,'wind','%', v=>{wind=v;draw();});
    EL.wireSlider(host,'time','', v=>{time=v;draw();});
    host.querySelector('#recordBtn').addEventListener('click', record);
    EL.playbar(document.getElementById('playbarHost'), {
      onPlay:()=>{playing=true; loop();}, onPause:()=>{playing=false; cancelAnimationFrame(raf);},
      onStep:()=>stepTime(5), onStepBack:()=>stepTime(-5)
    });
  }

  function reset(){ time=0; history=[]; playing=false; cancelAnimationFrame(raf); seedFeatures(); render(); draw(); updateData(); }
  function mount(rootEl, EarthLab){ root=rootEl; EL=EarthLab; canvas=root.querySelector('#simCanvas'); render(); draw(); updateData(); }

  window.SimModules = window.SimModules || {};
  window.SimModules.weathering = {
    mount, reset,
    learn:{
      background:`Weathering breaks rock down in place, without moving it. Physical weathering fractures rock (e.g. freeze–thaw wedging, wind abrasion) without changing its chemistry. Chemical weathering alters minerals through reactions with water, oxygen and acids (e.g. dissolution of limestone by rainwater). Biological weathering results from living organisms — most visibly plant roots wedging into cracks.`,
      realWorld:`Engineers assess weathering risk before building on rock slopes or using stone in construction; conservationists monitor the chemical weathering of historic monuments caused by acid rain and pollution.`,
      misconceptions:[
        'Weathering and erosion are not the same thing — weathering breaks rock apart where it sits; erosion then transports the fragments away.',
        'Chemical weathering happens faster, not slower, in warm and wet climates — cold, dry climates favour physical weathering instead.',
        'Biological weathering is not limited to large plants — lichens, mosses and even burrowing animals contribute too.'],
      facts:[
        'Freeze–thaw weathering happens because water expands about 9% in volume when it freezes, exerting enormous pressure inside cracks.',
        'Acid rain accelerates the chemical weathering of limestone and marble monuments worldwide.',
        'Onion-skin weathering (exfoliation) peels rock in curved sheets as pressure is released near the surface.'],
      summary:`Physical, chemical and biological weathering work together — often reinforcing each other — to break rock down in place. Climate largely determines which process dominates: cold regions favour physical (freeze–thaw) weathering, while warm, wet regions favour chemical weathering.`
    },
    quiz:[
      {q:'Freeze–thaw weathering is an example of which type of weathering?', options:['Chemical','Physical','Biological','None of these'], correct:1, explain:'Freeze–thaw wedging is physical weathering — it breaks rock apart mechanically without changing its chemistry.'},
      {q:'Which climate condition most accelerates CHEMICAL weathering?', options:['Cold and dry','Warm and wet','Cold and wet','Warm and dry'], correct:1, explain:'Chemical reactions generally speed up with heat and require water, so warm, wet climates maximise chemical weathering.'},
      {q:'Plant roots growing into a crack and widening it over years is an example of:', options:['Chemical weathering','Physical/biological weathering','Erosion','Deposition'], correct:1, explain:'Root wedging is classified as biological weathering (sometimes also described as biological-physical).'},
      {q:'What is the key difference between weathering and erosion?', options:['They are the same process','Weathering transports material, erosion breaks it down','Weathering breaks rock down in place; erosion transports the fragments','Erosion only happens underwater'], correct:2, explain:'Weathering happens in place; erosion is the transport of the resulting fragments elsewhere.'},
      {q:'Why does acid rain damage limestone monuments so effectively?', options:['Limestone is physically very weak','Limestone reacts chemically with acids','Limestone attracts more wind','Limestone dissolves in pure water alone'], correct:1, explain:'Limestone (calcium carbonate) reacts chemically with acids, including the weak acids in polluted rainwater.'}
    ]
  };
})();
