(function(){
const ID='magnetism';

function mount(root){
  let mode='electromagnet', current=3, turns=100, core='air', facing='opposite', obs, raf, animT=0;

  VPL.buildTabs(root, [
    {id:'learn', label:'Learn', render: renderLearn},
    {id:'simulate', label:'Simulate', render: renderSim},
    {id:'data', label:'Data', render: renderData},
    {id:'quiz', label:'Quiz', render: renderQuiz},
  ], 'simulate');

  function renderLearn(p){
    p.innerHTML = `
    <div class="panel"><h3>${VPL.ICONS.book} Introduction</h3><p>Build an electromagnet by adjusting current, coil turns, and core material — then explore how bar magnets attract and repel.</p></div>
    <div class="panel"><h3>${VPL.ICONS.grad} Learning Objectives</h3><ul><li>Relate magnetic field strength to current and turns.</li><li>Understand the effect of a ferromagnetic core.</li><li>Explain attraction and repulsion between poles.</li></ul></div>
    <div class="panel"><h3>${VPL.ICONS.sigma} Theory</h3><div class="formula-box">Solenoid field: B = μ₀μᵣnI / L<br>Like poles repel, unlike poles attract<br>Electromagnetic induction: a changing magnetic field induces current in a nearby conductor</div></div>
    <div class="panel"><h3>Real-life Applications</h3><ul><li>Electric bells and relays use electromagnets.</li><li>MRI machines use extremely powerful electromagnets.</li><li>Electric generators rely on electromagnetic induction.</li></ul></div>
    <div class="panel"><h3>Common Mistakes</h3><ul><li>Thinking any core boosts field strength equally — only ferromagnetic materials like iron work well.</li><li>Confusing magnetic poles with electric charges (poles always exist in N-S pairs).</li></ul></div>
    <div class="panel"><h3>Interesting Fact</h3><p>You cannot isolate a single magnetic pole — cutting a bar magnet in half just creates two smaller magnets, each with its own N and S pole!</p></div>`;
  }

  function calcB(){
    const mu0=4*Math.PI*1e-7, muR = core==='iron'? 200:1, L=0.1;
    return mu0*muR*turns*current/L;
  }

  function renderSim(p){
    p.innerHTML = `
    <div class="sim-layout">
      <div class="stage">
        <div class="toggle-row" id="modeRow">
          <button data-m="electromagnet" class="active">Electromagnet</button>
          <button data-m="barmagnets">Bar Magnets</button>
        </div>
        <canvas id="magCanvas" height="280" style="margin-top:10px;"></canvas>
      </div>
      <div class="controls panel" id="controlsBox"></div>
    </div>`;
    const canvas=p.querySelector('#magCanvas'), ctx=canvas.getContext('2d');
    const cbox = p.querySelector('#controlsBox');

    function buildControls(){
      if(mode==='electromagnet'){
        cbox.innerHTML = `<h3>Variable Controls</h3>
          <label>Current (I) <span class="val" id="iVal">${current} A</span></label><input type="range" id="iSlide" min="0" max="10" step="0.5" value="${current}">
          <label>Turns of Coil (n) <span class="val" id="nVal">${turns}</span></label><input type="range" id="nSlide" min="10" max="500" step="10" value="${turns}">
          <div class="toggle-row"><button id="airBtn" class="active">Air Core</button><button id="ironBtn">Iron Core</button></div>
          <div class="readout-grid" id="readouts"></div><div class="formula-box" id="formulaBox"></div>`;
        cbox.querySelector('#iSlide').oninput=e=>{current=+e.target.value; cbox.querySelector('#iVal').textContent=current+' A'; update();};
        cbox.querySelector('#nSlide').oninput=e=>{turns=+e.target.value; cbox.querySelector('#nVal').textContent=turns; update();};
        cbox.querySelector('#airBtn').onclick=()=>{core='air'; cbox.querySelector('#airBtn').classList.add('active'); cbox.querySelector('#ironBtn').classList.remove('active'); update();};
        cbox.querySelector('#ironBtn').onclick=()=>{core='iron'; cbox.querySelector('#ironBtn').classList.add('active'); cbox.querySelector('#airBtn').classList.remove('active'); update();};
      }else{
        cbox.innerHTML = `<h3>Variable Controls</h3>
          <div class="toggle-row"><button id="oppBtn" class="active">Opposite Poles Facing</button><button id="sameBtn">Same Poles Facing</button></div>
          <div class="readout-grid" id="readouts"></div><div class="formula-box" id="formulaBox"></div>`;
        cbox.querySelector('#oppBtn').onclick=()=>{facing='opposite'; cbox.querySelector('#oppBtn').classList.add('active'); cbox.querySelector('#sameBtn').classList.remove('active'); update();};
        cbox.querySelector('#sameBtn').onclick=()=>{facing='same'; cbox.querySelector('#sameBtn').classList.add('active'); cbox.querySelector('#oppBtn').classList.remove('active'); update();};
      }
      update();
    }

    p.querySelector('#modeRow').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      p.querySelector('#modeRow').querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); mode=b.dataset.m; buildControls();
      VPL.markProgress(ID,60);
    });

    function update(){
      const ro=cbox.querySelector('#readouts'), fb=cbox.querySelector('#formulaBox');
      if(mode==='electromagnet'){
        const B = calcB();
        ro.innerHTML = `
          <div class="readout"><div class="lbl">Core</div><div class="valn">${core==='iron'?'Iron (μᵣ≈200)':'Air (μᵣ=1)'}</div></div>
          <div class="readout"><div class="lbl">Current</div><div class="valn">${current} A</div></div>
          <div class="readout"><div class="lbl">Turns</div><div class="valn">${turns}</div></div>
          <div class="readout"><div class="lbl">Field Strength (B)</div><div class="valn">${(B*1000).toFixed(2)} mT</div></div>`;
        fb.innerHTML = `B = μ₀μᵣnI/L = <span class="ans">${(B*1000).toFixed(2)} mT</span> (L = 0.1 m assumed)`;
      }else{
        ro.innerHTML = `
          <div class="readout"><div class="lbl">Configuration</div><div class="valn">${facing==='opposite'?'N ↔ S':'N ↔ N'}</div></div>
          <div class="readout"><div class="lbl">Result</div><div class="valn">${facing==='opposite'?'Attraction':'Repulsion'}</div></div>`;
        fb.innerHTML = facing==='opposite'
          ? `Unlike poles (N and S) face each other → <span class="ans">Attractive force</span>`
          : `Like poles (N and N) face each other → <span class="ans">Repulsive force</span>`;
      }
      draw();
    }

    function animLoop(){ animT+=1; draw(); raf=requestAnimationFrame(animLoop); }

    function draw(){
      const dpr=window.devicePixelRatio||1, W=canvas.clientWidth, H=280;
      canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      if(mode==='electromagnet'){
        const cx=W/2, cy=H/2-10;
        const B = calcB();
        // coil (series of ellipses)
        const coilTurnsShown = 8;
        ctx.strokeStyle= core==='iron'? '#5B6472':'#1976D2'; ctx.lineWidth=3;
        for(let i=0;i<coilTurnsShown;i++){
          ctx.beginPath();
          ctx.ellipse(cx-70+i*20, cy, 10, 40, 0, 0, Math.PI*2);
          ctx.stroke();
        }
        if(core==='iron'){
          ctx.fillStyle='#8D8D8D'; ctx.fillRect(cx-80,cy-6,180,12);
        }
        // field lines strength = more lines & brighter with higher B
        const nLines = Math.min(8, Math.max(1, Math.round(B*3000)));
        ctx.strokeStyle='rgba(255,179,0,.7)';
        for(let i=0;i<nLines;i++){
          const off = (i - nLines/2)*14;
          ctx.beginPath();
          ctx.moveTo(cx-100, cy+off);
          ctx.bezierCurveTo(cx-40,cy+off-30, cx+40,cy+off-30, cx+100,cy+off);
          ctx.stroke();
        }
        // compass
        const compassX = cx+150, compassY=cy;
        if(compassX < W-20){
          ctx.strokeStyle='#5B6472'; ctx.beginPath(); ctx.arc(compassX,compassY,22,0,Math.PI*2); ctx.stroke();
          const angle = Math.min(1.4, B*4000) * (current>=0?1:-1);
          ctx.save(); ctx.translate(compassX,compassY); ctx.rotate(-angle);
          ctx.fillStyle='#D32F2F'; ctx.beginPath(); ctx.moveTo(0,-18); ctx.lineTo(4,0); ctx.lineTo(-4,0); ctx.closePath(); ctx.fill();
          ctx.fillStyle='#5B6472'; ctx.beginPath(); ctx.moveTo(0,18); ctx.lineTo(4,0); ctx.lineTo(-4,0); ctx.closePath(); ctx.fill();
          ctx.restore();
          ctx.fillStyle='#5B6472'; ctx.font='10px sans-serif'; ctx.textAlign='center';
          ctx.fillText('Compass', compassX, compassY+34);
        }
        ctx.fillStyle='#5B6472'; ctx.font='11px sans-serif'; ctx.textAlign='center';
        ctx.fillText('Coil ('+turns+' turns, '+current+'A)', cx, cy+70);
      }else{
        const cx=W/2, cy=H/2;
        const wobble = Math.sin(animT*0.05)*3;
        const gap = facing==='opposite'? 40+wobble : 90-Math.abs(wobble);
        drawMagnet(ctx, cx-gap-40, cy, facing==='opposite'?'N':'N', facing==='opposite'?'S':'N');
        drawMagnet(ctx, cx+gap, cy, facing==='opposite'?'N':'N', facing==='opposite'?'S':'N', true);
        // force arrows
        ctx.strokeStyle = facing==='opposite'? '#43A047':'#D32F2F';
        ctx.fillStyle = ctx.strokeStyle;
        if(facing==='opposite'){
          arrow(ctx, cx-gap+10, cy, cx-10, cy);
          arrow(ctx, cx+gap-10, cy, cx+10, cy);
        }else{
          arrow(ctx, cx-gap-10, cy, cx-gap-40, cy);
          arrow(ctx, cx+gap+10, cy, cx+gap+40, cy);
        }
        ctx.fillStyle='#5B6472'; ctx.font='11px sans-serif'; ctx.textAlign='center';
        ctx.fillText(facing==='opposite'?'Attracting':'Repelling', cx, cy+70);
      }
    }
    function drawMagnet(ctx,x,y,poleL,poleR,flip){
      ctx.fillStyle='#D32F2F'; ctx.fillRect(x,y-25,40,50);
      ctx.fillStyle='#1976D2'; ctx.fillRect(x+40,y-25,40,50);
      ctx.fillStyle='#fff'; ctx.font='14px sans-serif'; ctx.textAlign='center';
      ctx.fillText(poleL, x+20, y+5);
      ctx.fillText(poleR, x+60, y+5);
    }
    function arrow(ctx,x1,y1,x2,y2){
      ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      const angle=Math.atan2(y2-y1,x2-x1);
      ctx.beginPath(); ctx.moveTo(x2,y2);
      ctx.lineTo(x2-8*Math.cos(angle-0.4),y2-8*Math.sin(angle-0.4));
      ctx.lineTo(x2-8*Math.cos(angle+0.4),y2-8*Math.sin(angle+0.4));
      ctx.closePath(); ctx.fill();
    }
    buildControls();
    animLoop();
  }

  function renderData(p){
    p.innerHTML = `<div class="panel"><h3>Log Field Strength Readings <button class="stage-toolbar" id="logBtn">${VPL.ICONS.step} Log Current Setup</button></h3><div id="obsWrap"></div></div>`;
    obs = new VPL.ObsTable(p.querySelector('#obsWrap'), ['Core','Current (A)','Turns','B (mT)']);
    p.querySelector('#logBtn').onclick=()=>{
      obs.addRow([core, current, turns, (calcB()*1000).toFixed(2)]);
    };
  }

  function renderQuiz(p){
    VPL.buildQuiz(p, ID, [
      {q:'Adding an iron core to a solenoid does what to the magnetic field?', options:['Weakens it', 'Has no effect', 'Greatly strengthens it', 'Reverses its direction'], answer:2, explain:'Iron is ferromagnetic and greatly amplifies magnetic field strength inside a coil.'},
      {q:'Two magnets with N poles facing each other will:', options:['Attract', 'Repel', 'Do nothing', 'Stick together permanently'], answer:1, explain:'Like poles (N-N or S-S) always repel.'},
      {q:'Increasing the number of turns in a solenoid, keeping current constant, will:', options:['Decrease field strength', 'Increase field strength', 'Have no effect', 'Reverse the field'], answer:1, explain:'B ∝ n, so more turns means a stronger field.'},
      {q:'Electromagnetic induction refers to:', options:['A magnet losing its field', 'Generating current from a changing magnetic field', 'Current always flowing without a source', 'Magnetism caused by heat'], answer:1, explain:'A changing magnetic field through a conductor induces an electric current — the basis of generators.'},
      {q:'Cutting a bar magnet in half results in:', options:['Two separate N and S poles', 'Two smaller complete magnets, each with N and S poles', 'One pole disappearing', 'No magnetism at all'], answer:1, explain:'Magnetic poles cannot be isolated — each piece becomes its own complete magnet.'},
    ]);
  }
}

SIM_REGISTRY.push({
  id: ID, num:10, title:'Magnetism & Electromagnetism', category:'Electricity',
  short:'Build electromagnets and explore attraction/repulsion between bar magnets.',
  gradient:'linear-gradient(135deg,#0D47A1,#43A047)',
  iconSVG:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><path d="M6 4v8a6 6 0 0 0 12 0V4M6 4h4M14 4h4M6 12h4M14 12h4"/></svg>`,
  mount
});
})();
