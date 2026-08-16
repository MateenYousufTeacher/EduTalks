(function(){
const ID='circuit';

function mount(root){
  let config='series', voltage=12, r1=10, r2=20, r3=30, switchOn=true, shortCircuit=false, obs;
  let animOffset=0, raf;

  VPL.buildTabs(root, [
    {id:'learn', label:'Learn', render: renderLearn},
    {id:'simulate', label:'Simulate', render: renderSim},
    {id:'data', label:'Data', render: renderData},
    {id:'quiz', label:'Quiz', render: renderQuiz},
  ], 'simulate');

  function renderLearn(p){
    p.innerHTML = `
    <div class="panel"><h3>${VPL.ICONS.book} Introduction</h3><p>Build series and parallel resistor circuits, flip the switch, and watch current flow live while Ohm's Law is calculated instantly.</p></div>
    <div class="panel"><h3>${VPL.ICONS.grad} Learning Objectives</h3><ul><li>Apply Ohm's Law: V = IR.</li><li>Calculate equivalent resistance for series and parallel circuits.</li><li>Understand the effects of open and short circuits.</li></ul></div>
    <div class="panel"><h3>${VPL.ICONS.sigma} Theory</h3><div class="formula-box">Series: R_total = R1 + R2 + R3, same current through all<br>Parallel: 1/R_total = 1/R1 + 1/R2 + 1/R3, same voltage across all<br>Ohm's Law: V = IR</div></div>
    <div class="panel"><h3>Real-life Applications</h3><ul><li>Household wiring uses parallel circuits so each appliance gets full voltage.</li><li>Old string lights used series circuits (one bulb fails, all go out).</li><li>Fuses protect circuits from short-circuit currents.</li></ul></div>
    <div class="panel"><h3>Common Mistakes</h3><ul><li>Adding parallel resistances directly instead of using the reciprocal formula.</li><li>Forgetting that current is the same everywhere in series, not voltage.</li></ul></div>
    <div class="panel"><h3>Interesting Fact</h3><p>A short circuit provides almost zero resistance, causing dangerously high current — the exact reason fuses and circuit breakers exist!</p></div>`;
  }

  function calc(){
    if(!switchOn) return {Rtotal:Infinity, Itotal:0, Vdrops:[0,0,0], Idrops:[0,0,0]};
    if(shortCircuit) return {Rtotal:0.01, Itotal:voltage/0.01, Vdrops:[0,0,0], Idrops:[voltage/0.01,0,0], isShort:true};
    if(config==='series'){
      const Rtotal = r1+r2+r3;
      const I = voltage/Rtotal;
      return {Rtotal, Itotal:I, Vdrops:[I*r1,I*r2,I*r3], Idrops:[I,I,I]};
    }else{
      const Rtotal = 1/(1/r1+1/r2+1/r3);
      const I1=voltage/r1, I2=voltage/r2, I3=voltage/r3;
      return {Rtotal, Itotal:I1+I2+I3, Vdrops:[voltage,voltage,voltage], Idrops:[I1,I2,I3]};
    }
  }

  function renderSim(p){
    p.innerHTML = `
    <div class="sim-layout">
      <div class="stage">
        <div class="toggle-row" id="cfgRow">
          <button data-c="series" class="active">Series</button>
          <button data-c="parallel">Parallel</button>
        </div>
        <canvas id="cirCanvas" height="260" style="margin-top:10px;"></canvas>
        <div class="stage-toolbar">
          <button id="swBtn" class="primary">${VPL.ICONS.play} Switch: ON</button>
          <button id="shortBtn">⚡ Simulate Short Circuit</button>
          <button id="cirShot">${VPL.ICONS.camera} Screenshot</button>
          <button id="cirLog">${VPL.ICONS.step} Log Observation</button>
        </div>
      </div>
      <div class="controls panel">
        <h3>Variable Controls</h3>
        <label>Battery Voltage <span class="val" id="vVal">${voltage} V</span></label><input type="range" id="vSlide" min="1" max="24" value="${voltage}">
        <label>R1 <span class="val" id="r1Val">${r1} Ω</span></label><input type="range" id="r1Slide" min="1" max="100" value="${r1}">
        <label>R2 <span class="val" id="r2Val">${r2} Ω</span></label><input type="range" id="r2Slide" min="1" max="100" value="${r2}">
        <label>R3 <span class="val" id="r3Val">${r3} Ω</span></label><input type="range" id="r3Slide" min="1" max="100" value="${r3}">
        <div class="readout-grid" id="readouts"></div>
        <div class="formula-box" id="formulaBox"></div>
      </div>
    </div>`;
    const canvas=p.querySelector('#cirCanvas'), ctx=canvas.getContext('2d');
    p.querySelector('#cfgRow').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      p.querySelector('#cfgRow').querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); config=b.dataset.c; update();
    });
    p.querySelector('#vSlide').oninput=e=>{voltage=+e.target.value; p.querySelector('#vVal').textContent=voltage+' V'; update();};
    p.querySelector('#r1Slide').oninput=e=>{r1=+e.target.value; p.querySelector('#r1Val').textContent=r1+' Ω'; update();};
    p.querySelector('#r2Slide').oninput=e=>{r2=+e.target.value; p.querySelector('#r2Val').textContent=r2+' Ω'; update();};
    p.querySelector('#r3Slide').oninput=e=>{r3=+e.target.value; p.querySelector('#r3Val').textContent=r3+' Ω'; update();};
    p.querySelector('#swBtn').onclick=(e)=>{switchOn=!switchOn; e.target.innerHTML=(switchOn?VPL.ICONS.play:VPL.ICONS.pause)+' Switch: '+(switchOn?'ON':'OFF'); update();};
    p.querySelector('#shortBtn').onclick=(e)=>{shortCircuit=!shortCircuit; e.target.classList.toggle('amber',shortCircuit); update(); if(shortCircuit) VPL.toast('⚠ Short circuit! Current spikes dangerously.');};
    p.querySelector('#cirShot').onclick=()=>VPL.screenshotCanvas(canvas,'circuit-builder.png');
    p.querySelector('#cirLog').onclick=()=>{
      const c=calc();
      if(obs) obs.addRow([config, voltage, r1, r2, r3, c.Rtotal===Infinity?'∞':c.Rtotal.toFixed(1), c.Itotal.toFixed(2)]);
      VPL.markProgress(ID,60); VPL.toast('Observation logged ✓');
    };

    function update(){
      const c = calc();
      p.querySelector('#readouts').innerHTML = `
        <div class="readout"><div class="lbl">Total Resistance</div><div class="valn">${c.Rtotal===Infinity?'∞ (open)':c.Rtotal.toFixed(2)+' Ω'}</div></div>
        <div class="readout"><div class="lbl">Total Current</div><div class="valn">${c.Itotal.toFixed(2)} A</div></div>
        <div class="readout"><div class="lbl">R1 Current</div><div class="valn">${c.Idrops[0].toFixed(2)} A</div></div>
        <div class="readout"><div class="lbl">R1 Voltage</div><div class="valn">${c.Vdrops[0].toFixed(2)} V</div></div>`;
      p.querySelector('#formulaBox').innerHTML = !switchOn
        ? `Switch is OPEN → circuit broken → <span class="ans">I = 0 A</span>`
        : shortCircuit
          ? `Short circuit → R ≈ 0 Ω → I = V/R = <span class="ans">${c.Itotal.toFixed(1)} A (dangerously high!)</span>`
          : config==='series'
            ? `R_total = R1+R2+R3 = ${r1}+${r2}+${r3} = ${c.Rtotal} Ω<br>I = V/R = ${voltage}/${c.Rtotal} = <span class="ans">${c.Itotal.toFixed(2)} A</span>`
            : `1/R_total = 1/${r1}+1/${r2}+1/${r3} → R_total = <span class="ans">${c.Rtotal.toFixed(2)} Ω</span><br>I_total = ${c.Idrops.map(i=>i.toFixed(2)).join(' + ')} = <span class="ans">${c.Itotal.toFixed(2)} A</span>`;
    }

    function animLoop(){
      animOffset += 1;
      draw(calc());
      raf = requestAnimationFrame(animLoop);
    }
    function draw(c){
      const dpr=window.devicePixelRatio||1, W=canvas.clientWidth, H=260;
      canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      ctx.strokeStyle='#0D47A1'; ctx.lineWidth=3; ctx.lineCap='round';
      const topY=60, botY=200, leftX=50, rightX=W-50;
      // battery on left
      ctx.beginPath(); ctx.moveTo(leftX,botY); ctx.lineTo(leftX,topY); ctx.stroke();
      ctx.fillStyle='#5B6472'; ctx.font='11px sans-serif'; ctx.textAlign='center';
      ctx.fillText(voltage+'V', leftX-20, (topY+botY)/2);
      // switch
      ctx.beginPath(); ctx.moveTo(leftX,topY); ctx.lineTo(leftX+60,topY); ctx.stroke();
      ctx.strokeStyle = switchOn? '#43A047':'#D32F2F';
      ctx.beginPath(); ctx.moveTo(leftX+60,topY); ctx.lineTo(leftX+100, switchOn? topY : topY-18); ctx.stroke();
      ctx.strokeStyle='#0D47A1';
      if(config==='series'){
        const n=3, segW=(rightX-leftX-100)/n;
        let x = leftX+100;
        ctx.beginPath(); ctx.moveTo(leftX+100,topY); ctx.lineTo(rightX,topY); ctx.lineTo(rightX,botY); ctx.lineTo(leftX,botY); ctx.stroke();
        [r1,r2,r3].forEach((r,i)=>{
          const rx = x+segW*i+segW/2;
          drawResistor(ctx, rx-20, topY, 40, r);
        });
      }else{
        ctx.beginPath(); ctx.moveTo(leftX+100,topY); ctx.lineTo(rightX,topY); ctx.lineTo(rightX,botY); ctx.lineTo(leftX,botY); ctx.stroke();
        const n=3, spacing=(rightX-leftX-140)/(n-1);
        [r1,r2,r3].forEach((r,i)=>{
          const bx = leftX+120+spacing*i;
          ctx.beginPath(); ctx.moveTo(bx,topY); ctx.lineTo(bx,botY); ctx.stroke();
          drawResistorV(ctx, bx-15, (topY+botY)/2-20, 40, r);
        });
      }
      // current animation dashes
      if(switchOn && c.Itotal>0){
        const speed = Math.min(8, Math.max(1,c.Itotal));
        ctx.fillStyle = shortCircuit? '#D32F2F':'#FFB300';
        const perim = 2*(rightX-leftX)+2*(botY-topY);
        for(let i=0;i<10;i++){
          const d = ((animOffset*speed*0.6)+i*(perim/10))%perim;
          const pt = pointOnRect(d, leftX, topY, rightX, botY);
          ctx.beginPath(); ctx.arc(pt.x,pt.y,3,0,Math.PI*2); ctx.fill();
        }
      }
    }
    function pointOnRect(d,l,t,r,b){
      const w=r-l, h=b-t;
      if(d<w) return {x:l+d,y:t};
      d-=w; if(d<h) return {x:r,y:t+d};
      d-=h; if(d<w) return {x:r-d,y:b};
      d-=w; return {x:l,y:b-d};
    }
    function drawResistor(ctx,x,y,w,val){
      ctx.save(); ctx.strokeStyle='#FFB300'; ctx.lineWidth=3;
      ctx.beginPath();
      const zig=6; const step=w/zig;
      ctx.moveTo(x,y);
      for(let i=0;i<zig;i++) ctx.lineTo(x+step*(i+1), y+(i%2===0?-10:10));
      ctx.stroke(); ctx.restore();
      ctx.fillStyle='#5B6472'; ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText(val+'Ω', x+w/2, y-16);
    }
    function drawResistorV(ctx,x,y,h,val){
      ctx.save(); ctx.strokeStyle='#FFB300'; ctx.lineWidth=3;
      ctx.beginPath();
      const zig=6; const step=h/zig;
      ctx.moveTo(x,y);
      for(let i=0;i<zig;i++) ctx.lineTo(x+(i%2===0?-10:10), y+step*(i+1));
      ctx.stroke(); ctx.restore();
      ctx.fillStyle='#5B6472'; ctx.font='10px sans-serif'; ctx.textAlign='left';
      ctx.fillText(val+'Ω', x+16, y+h/2);
    }
    update();
    animLoop();
  }

  function renderData(p){
    p.innerHTML = `<div class="panel"><h3>Observation Table <button class="stage-toolbar" id="expCsv" style="float:right;">${VPL.ICONS.download} Export</button></h3><div id="obsWrap"></div></div>`;
    obs = new VPL.ObsTable(p.querySelector('#obsWrap'), ['Config','V (V)','R1 (Ω)','R2 (Ω)','R3 (Ω)','R_total (Ω)','I_total (A)']);
    p.querySelector('#expCsv').onclick=()=>VPL.exportCSV('circuit-builder.csv', obs.toCSV());
  }

  function renderQuiz(p){
    VPL.buildQuiz(p, ID, [
      {q:'In a series circuit, the current at every point is:', options:['Different at each resistor','The same throughout','Zero','Infinite'], answer:1, explain:'Series circuits have only one path, so current is identical everywhere.'},
      {q:'In a parallel circuit, the voltage across each branch is:', options:['Different for each branch','The same as the source voltage','Always zero','Only across R1'], answer:1, explain:'Each parallel branch is connected directly across the battery, so voltage is equal to source voltage.'},
      {q:'Ohm\u2019s Law is expressed as:', options:['P = VI','V = IR','F = ma','Q = mcΔT'], answer:1, explain:'Ohm\u2019s Law: V = IR.'},
      {q:'A short circuit is dangerous because it causes:', options:['Zero current','Extremely high current','Extremely high resistance','No effect at all'], answer:1, explain:'Near-zero resistance in a short circuit leads to a very large current, which can cause fires.'},
      {q:'If one bulb fails in an old-style series string of lights, what happens?', options:['Only that bulb goes out','All the bulbs go out','Bulbs get brighter','Nothing changes'], answer:1, explain:'In series, a broken bulb creates an open circuit, stopping current everywhere — all bulbs go out.'},
    ]);
  }
}

SIM_REGISTRY.push({
  id: ID, num:9, title:'Electric Circuit Builder', category:'Electricity',
  short:'Build series and parallel circuits and watch live current flow.',
  gradient:'linear-gradient(135deg,#FFB300,#43A047)',
  iconSVG:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><path d="M4 12h4l2-6 4 12 2-6h4"/></svg>`,
  mount
});
})();
