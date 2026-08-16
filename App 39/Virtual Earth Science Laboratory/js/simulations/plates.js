/* ==========================================================================
   Simulation 8 — Plate Movement Explorer
   ========================================================================== */
(function(){
  let boundary='divergent';
  let convSub='oceanic-continental';
  let speed=6, time=0, playing=false, raf=null;
  let history=[];
  let root, EL, canvas;

  function landformSize(){ return EL.clamp(time*speed/10, 0, 100); }

  function draw(){
    const ctx = EL.fitCanvas(canvas, 420);
    const w = canvas.clientWidth, h=420;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#0F2A3A'; ctx.fillRect(0,0,w,h);
    const dev = landformSize();
    const shift = (time*speed*0.9) % (w*0.3);

    if(boundary==='divergent') drawDivergent(ctx,w,h,dev,shift);
    else if(boundary==='convergent') drawConvergent(ctx,w,h,dev,shift);
    else drawTransform(ctx,w,h,dev,shift);

    ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif';
    ctx.fillText(`${boundaryLabel()} — Feature development: ${dev.toFixed(0)}%`, 14, 24);
    ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText(`Plate speed ${speed} cm/yr · Simulated time ${(time*2).toFixed(0)} million years`, 14, 42);
  }

  function boundaryLabel(){
    if(boundary==='divergent') return 'Divergent Boundary (Sea-floor Spreading)';
    if(boundary==='transform') return 'Transform Boundary';
    return 'Convergent Boundary — ' + ({'oceanic-continental':'Oceanic–Continental (Subduction)','oceanic-oceanic':'Oceanic–Oceanic (Island Arc)','continental-continental':'Continental–Continental (Mountain Building)'}[convSub]);
  }

  function plateBlock(ctx,x,y,w,h,color){
    ctx.fillStyle=color; ctx.fillRect(x,y,w,h);
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.strokeRect(x,y,w,h);
  }

  function drawDivergent(ctx,w,h,dev,shift){
    const midY = h*0.6, gap = 20+dev*1.4;
    plateBlock(ctx, 0, midY-60, w/2-gap/2, 90, '#4B4F52');
    plateBlock(ctx, w/2+gap/2, midY-60, w/2-gap/2, 90, '#4B4F52');
    // rift filled with new crust / magma
    ctx.fillStyle = '#D64545';
    ctx.beginPath(); ctx.moveTo(w/2-gap/2, midY-60); ctx.lineTo(w/2+gap/2, midY-60); ctx.lineTo(w/2+gap/2+6, midY+30); ctx.lineTo(w/2-gap/2-6, midY+30); ctx.closePath(); ctx.fill();
    // arrows
    drawArrowLine(ctx, w/2-gap/2-40, midY-20, w/2-gap/2-100, midY-20);
    drawArrowLine(ctx, w/2+gap/2+40, midY-20, w/2+gap/2+100, midY-20);
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='11px sans-serif';
    ctx.fillText('Mid-ocean ridge / new crust', w/2-70, midY-70);
    // ocean above
    ctx.fillStyle='rgba(25,118,210,0.5)'; ctx.fillRect(0,midY-90,w,30);
  }

  function drawConvergent(ctx,w,h,dev,shift){
    const midY = h*0.62;
    if(convSub==='continental-continental'){
      // mountain building — both plates thicken/fold at centre
      plateBlock(ctx,0,midY-40,w/2+10,70,'#6B4A32');
      plateBlock(ctx,w/2-10,midY-40,w/2+10,70,'#6B4A32');
      const peakH = 30+dev*1.6;
      ctx.beginPath();
      ctx.moveTo(w/2-140, midY-40);
      ctx.lineTo(w/2-40, midY-40-peakH);
      ctx.lineTo(w/2, midY-40-peakH*0.7);
      ctx.lineTo(w/2+40, midY-40-peakH*1.1);
      ctx.lineTo(w/2+140, midY-40);
      ctx.closePath();
      ctx.fillStyle='#8A5A2E'; ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.beginPath();
      ctx.moveTo(w/2-40, midY-40-peakH); ctx.lineTo(w/2-30,midY-40-peakH+14); ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font='11px sans-serif'; ctx.fillText('Fold mountains rising', w/2-60, midY-40-peakH-10);
    } else if(convSub==='oceanic-oceanic'){
      plateBlock(ctx,0,midY,w/2,60,'#3A5A6A');
      plateBlock(ctx,w/2,midY,w/2,60,'#3A5A6A');
      // subduction curve
      ctx.strokeStyle='#4B4F52'; ctx.lineWidth=14;
      ctx.beginPath(); ctx.moveTo(w/2,midY); ctx.quadraticCurveTo(w/2+40,midY+60,w/2+30,midY+140+dev); ctx.stroke();
      // island arc volcano
      const vh=20+dev*0.7;
      ctx.beginPath(); ctx.moveTo(w/2-40,midY); ctx.lineTo(w/2-10,midY-vh); ctx.lineTo(w/2+20,midY); ctx.closePath();
      ctx.fillStyle='#D64545'; ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='11px sans-serif'; ctx.fillText('Volcanic island arc', w/2-70, midY-vh-10);
    } else {
      // oceanic-continental: subduction with trench + volcanic arc
      plateBlock(ctx,0,midY,w*0.45,60,'#8A5A2E'); // continental
      plateBlock(ctx,w*0.5,midY+10,w*0.5,50,'#3A5A6A'); // oceanic
      ctx.strokeStyle='#4B4F52'; ctx.lineWidth=16;
      ctx.beginPath(); ctx.moveTo(w*0.5,midY+10); ctx.quadraticCurveTo(w*0.47,midY+70,w*0.4,midY+140+dev*0.8); ctx.stroke();
      // trench
      ctx.fillStyle='#0A1620';
      ctx.beginPath(); ctx.ellipse(w*0.48,midY+14,14,8,0,0,Math.PI*2); ctx.fill();
      // volcanic arc on continental side
      const vh=18+dev*0.7;
      ctx.beginPath(); ctx.moveTo(w*0.32,midY); ctx.lineTo(w*0.37,midY-vh); ctx.lineTo(w*0.42,midY); ctx.closePath();
      ctx.fillStyle='#D64545'; ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='11px sans-serif';
      ctx.fillText('Trench', w*0.44,midY+40); ctx.fillText('Volcanic arc', w*0.28,midY-vh-8);
    }
    drawArrowLine(ctx, w*0.12, midY-70, w*0.12+30, midY-70);
    drawArrowLine(ctx, w*0.88, midY-70, w*0.88-30, midY-70);
  }

  function drawTransform(ctx,w,h,dev,shift){
    const midY=h*0.55;
    plateBlock(ctx,0,midY-70,w,66,'#4B4F52');
    plateBlock(ctx,0,midY,w,66,'#3A5A6A');
    // offset fault line jogging with shift
    ctx.strokeStyle='#D64545'; ctx.lineWidth=3; ctx.setLineDash([10,6]);
    ctx.beginPath(); ctx.moveTo(0,midY); ctx.lineTo(w,midY); ctx.stroke(); ctx.setLineDash([]);
    // stress cracks near center growing with dev
    ctx.strokeStyle='rgba(255,179,0,0.7)';
    for(let i=0;i<Math.round(dev/12);i++){
      const x = w/2 + (Math.random()-0.5)*140;
      ctx.beginPath(); ctx.moveTo(x,midY-10); ctx.lineTo(x+ (Math.random()-0.5)*16, midY+10); ctx.stroke();
    }
    drawArrowLine(ctx, w*0.2, midY-40, w*0.2+40, midY-40);
    drawArrowLine(ctx, w*0.8, midY+40, w*0.8-40, midY+40);
    ctx.fillStyle='#fff'; ctx.font='11px sans-serif';
    ctx.fillText('Plates slide past each other — stress builds until release as an earthquake', 16, midY+90);
  }

  function drawArrowLine(ctx,x1,y1,x2,y2){
    ctx.strokeStyle='#FFB300'; ctx.fillStyle='#FFB300'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    ctx.save(); ctx.translate(x2,y2); ctx.rotate(Math.atan2(y2-y1,x2-x1));
    ctx.beginPath(); ctx.moveTo(-8,-5); ctx.lineTo(0,0); ctx.lineTo(-8,5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function stepTime(dt){ time=EL.clamp(time+dt,0,100); document.getElementById('time').value=time; document.getElementById('timeVal').textContent=time.toFixed(0); draw(); }
  function loop(){ if(!playing) return; stepTime(0.6); if(time>=100){playing=false; EL.toast('Reached 200 million simulated years'); return;} raf=requestAnimationFrame(loop); }

  function record(){
    const dev = landformSize();
    history.push({t:time, boundary:boundaryLabel(), speed, dev});
    if(history.length>30) history.shift();
    EL.logObservation(root, [`t=${(time*2).toFixed(0)}My`, boundaryLabel(), speed+' cm/yr', dev.toFixed(0)+'% developed']);
    updateData(); EL.addXP(3);
  }
  function updateData(){
    const chart = document.getElementById('dataChart');
    if(chart && history.length){
      EL.drawLineChart(chart,[{data:history.map(r=>({y:r.dev})), color:'#1976D2', fill:true}], {decimals:0, xLabels:history.map(r=>'t'+r.t.toFixed(0))});
    }
    const tableHost = document.getElementById('dataTableHost');
    if(tableHost){
      tableHost.innerHTML = EL.buildTable(
        ['Time (My)','Boundary Type','Speed (cm/yr)','Feature Development %'],
        history.slice().reverse().map(r=>[(r.t*2).toFixed(0), r.boundary, r.speed, r.dev.toFixed(0)])
      );
    }
  }

  function render(){
    const host = document.getElementById('controlsHost');
    host.innerHTML = `
      ${EL.segmented({id:'boundarySel', label:'Boundary Type', active:['divergent','convergent','transform'].indexOf(boundary), options:[
        {v:'divergent', label:'Divergent'},{v:'convergent', label:'Convergent'},{v:'transform', label:'Transform'}
      ]})}
      <div id="convSubHost" class="${boundary==='convergent'?'':'hidden'}">
        ${EL.segmented({id:'convSubSel', label:'Convergent Subtype', active:['oceanic-continental','oceanic-oceanic','continental-continental'].indexOf(convSub), options:[
          {v:'oceanic-continental', label:'Oc–Cont'},{v:'oceanic-oceanic', label:'Oc–Oc'},{v:'continental-continental', label:'Cont–Cont'}
        ]})}
      </div>
      ${EL.slider({id:'speed', label:'Plate Speed', min:1,max:20,step:0.5,value:speed,unit:' cm/yr'})}
      ${EL.slider({id:'time', label:'Elapsed Time', min:0,max:100,step:1,value:time,unit:''})}
      <button class="btn primary" id="recordBtn" style="width:100%;">📌 Record Snapshot</button>
    `;
    EL.wireSegmented(host,'boundarySel', v=>{ boundary=v; document.getElementById('convSubHost').classList.toggle('hidden', v!=='convergent'); draw(); });
    EL.wireSegmented(host,'convSubSel', v=>{ convSub=v; draw(); });
    EL.wireSlider(host,'speed',' cm/yr', v=>{speed=v; draw();});
    EL.wireSlider(host,'time','', v=>{time=v; draw();});
    host.querySelector('#recordBtn').addEventListener('click', record);
    EL.playbar(document.getElementById('playbarHost'), {
      onPlay:()=>{playing=true; loop();}, onPause:()=>{playing=false; cancelAnimationFrame(raf);},
      onStep:()=>stepTime(5), onStepBack:()=>stepTime(-5)
    });
  }

  function reset(){ time=0; history=[]; playing=false; cancelAnimationFrame(raf); render(); draw(); updateData(); }
  function mount(rootEl, EarthLab){ root=rootEl; EL=EarthLab; canvas=root.querySelector('#simCanvas'); render(); draw(); updateData(); }

  window.SimModules = window.SimModules || {};
  window.SimModules.plates = {
    mount, reset,
    learn:{
      background:`Earth's lithosphere is broken into rigid plates that move slowly over the ductile asthenosphere below, driven by mantle convection. At divergent boundaries plates move apart and new crust forms; at convergent boundaries plates collide, causing subduction or mountain building; at transform boundaries plates slide past each other horizontally.`,
      realWorld:`Plate tectonics explains the global distribution of earthquakes, volcanoes and mountain ranges, and underpins hazard planning, mineral and petroleum exploration, and our understanding of continental drift over geological time.`,
      misconceptions:[
        'Plates do not move at dramatically different speeds day to day — typical rates are just a few centimetres per year, similar to fingernail growth.',
        'Not all convergent boundaries produce the same landform — the outcome depends on whether oceanic or continental crust is involved on each side.',
        'Transform boundaries do not create or destroy crust — they simply allow plates to slide past one another, building up stress that is released as earthquakes.'],
      facts:[
        'The Himalayas are still rising by a few millimetres each year as the Indian and Eurasian plates continue to converge.',
        "The San Andreas Fault in California is a classic example of a transform boundary.",
        'The mid-Atlantic ridge, a divergent boundary, is slowly widening the Atlantic Ocean by a few centimetres every year.'],
      summary:`Divergent, convergent and transform plate boundaries each produce distinctive landforms and hazards, driven by the direction and type of plate motion — the same underlying process of mantle convection ultimately builds mountains, ocean basins and fuels earthquakes and volcanoes.`
    },
    quiz:[
      {q:'At a divergent plate boundary, what typically happens?', options:['Plates collide and fold into mountains','Plates move apart and new crust forms','Plates slide past each other','Nothing — divergent boundaries are inactive'], correct:1, explain:'Divergent boundaries pull plates apart, allowing magma to rise and form new crust, as at a mid-ocean ridge.'},
      {q:'Two continental plates colliding is most likely to produce:', options:['A deep ocean trench','A transform fault','Large fold mountain ranges','A mid-ocean ridge'], correct:2, explain:'Because continental crust is too buoyant to subduct, collision instead crumples and thickens the crust into high mountains, as with the Himalayas.'},
      {q:'The San Andreas Fault is the classic example of which boundary type?', options:['Divergent','Convergent','Transform','None of these'], correct:2, explain:'The San Andreas Fault is a transform boundary where the Pacific and North American plates slide past each other.'},
      {q:'What ultimately drives the movement of tectonic plates?', options:['Ocean currents','Convection currents in the mantle','Wind erosion','Earth\'s rotation alone'], correct:1, explain:'Heat-driven convection currents in the mantle are the main force believed to drive plate motion.'},
      {q:'At an oceanic–continental convergent boundary, which plate typically subducts?', options:['The continental plate, because it is denser','The oceanic plate, because it is denser','Neither plate moves','Both plates subduct equally'], correct:1, explain:'Oceanic crust is denser than continental crust, so it is typically the plate that subducts beneath the continent.'}
    ]
  };
})();
