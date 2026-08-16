/* ===================== SIMULATION 6: NERVOUS SYSTEM EXPLORER ===================== */
(function(){

const QUIZ = [
  {q:'A reflex action is best described as:', options:['A slow, thought-out response','A rapid, automatic response to a stimulus','Always voluntary','Controlled entirely by muscles'], correct:1},
  {q:'The gap between two neurons is called a:', options:['Axon','Synapse','Dendrite','Nucleus'], correct:1},
  {q:'Which part of the neuron receives signals?', options:['Axon terminal','Dendrite','Cell body only','Myelin sheath'], correct:1},
  {q:'A nerve impulse travels as a/an:', options:['Sound wave','Electrical signal','Chemical liquid only','Light pulse'], correct:1},
  {q:'The spinal cord allows reflexes to occur quickly because it:', options:['Bypasses the need for a stimulus','Processes some responses without waiting for the brain','Is part of the muscular system','Has no neurons'], correct:1},
  {q:'A higher stimulus intensity generally leads to:', options:['Slower response only','Faster/stronger nerve signalling','No signal at all','Signal moving backward'], correct:1},
  {q:'The myelin sheath mainly functions to:', options:['Slow down impulses','Speed up impulse transmission','Store memories','Produce hormones'], correct:1},
  {q:'Touching a hot object and pulling away quickly is an example of a:', options:['Voluntary action','Reflex action','Involuntary heartbeat','Digestive process'], correct:1},
  {q:'Reaction time is the time between:', options:['Two meals','Stimulus and response','Sleep cycles','Two heartbeats'], correct:1},
  {q:'The brain and spinal cord together make up the:', options:['Peripheral nervous system','Central nervous system','Digestive system','Circulatory system'], correct:1},
];

function neuronSVG(active, progress){
  return `<svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="130" r="30" fill="#8E24AA"/>
    <text x="30" y="180" font-size="11" fill="var(--text)">Cell body</text>
    <line x1="90" y1="130" x2="380" y2="130" stroke="#5E35B1" stroke-width="8" stroke-linecap="round"/>
    <text x="200" y="115" font-size="11" fill="var(--text)">Axon (myelinated)</text>
    ${Array.from({length:6}).map((_,i)=>`<rect x="${100+i*45}" y="123" width="30" height="14" rx="7" fill="#B39DDB"/>`).join('')}
    <path d="M380 130 L 420 100 M380 130 L 420 130 M380 130 L 420 160" stroke="#5E35B1" stroke-width="5" stroke-linecap="round" fill="none"/>
    <text x="400" y="190" font-size="11" fill="var(--text)">Axon terminal</text>
    ${active ? `<circle cx="${90+progress*2.9}" cy="130" r="8" fill="#FFB300"><animate attributeName="opacity" values="1;0.6;1" dur="0.3s" repeatCount="indefinite"/></circle>` : ''}
    ${active && progress>95 ? `<circle cx="440" cy="130" r="14" fill="#FFB300" opacity="0.5"><animate attributeName="r" values="8;20;8" dur="0.4s" repeatCount="indefinite"/></circle>` : ''}
  </svg>`;
}

function reflexArcSVG(stage){
  const stages = ['stimulus','receptor','sensory','spinal','motor','effector'];
  const activeIdx = stages.indexOf(stage);
  const labels = [
    {n:'Stimulus (hot object)', x:40, y:40}, {n:'Receptor (skin)', x:130, y:80},
    {n:'Sensory neuron', x:220, y:120}, {n:'Spinal cord', x:280, y:180},
    {n:'Motor neuron', x:220, y:220}, {n:'Effector (muscle)', x:100, y:240},
  ];
  return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 50 C 120 90 200 130 270 180 C 220 230 130 250 60 240" fill="none" stroke="#B39DDB" stroke-width="4" stroke-dasharray="8,5"/>
    ${labels.map((l,i)=>`<circle cx="${l.x}" cy="${l.y}" r="${activeIdx===i?16:11}" fill="${activeIdx===i?'#FFB300':activeIdx>i?'#43A047':'#CE93D8'}"/>
      <text x="${l.x+18}" y="${l.y+4}" font-size="10.5" fill="var(--text)">${l.n}</text>`).join('')}
  </svg>`;
}

SIM_MODULES.nervous = { render(container, ctx){
  let intensity=50, reactionTimes=[];
  let neuronActive=false, neuronProgress=0, neuronTimer=null;

  container.innerHTML = `
  <div class="sim-layout">
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Neuron & Nerve Impulse</h3>
        <div class="stage" id="neuronStage">${neuronSVG(false,0)}</div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="fireBtn">⚡ Fire Impulse</button>
          <button class="ctrl-btn amber" id="resetNeuronBtn">↺ Reset</button>
        </div>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Reflex Arc Simulation</h3>
        <div class="stage" id="reflexStage">${reflexArcSVG('idle')}</div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="triggerReflex">🔥 Touch Hot Object</button>
        </div>
        <p id="reflexDesc" style="font-size:13px; color:var(--text-soft); margin-top:10px">Tap the button to trigger a reflex arc, step by step.</p>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Reaction Time Test</h3>
        <p style="font-size:13px; color:var(--text-soft)">Click "Start Test", then click "React!" the instant it turns green.</p>
        <div class="controls-row"><button class="ctrl-btn primary" id="reactStart">Start Test</button></div>
        <div id="reactZone" style="margin-top:12px; height:80px; border-radius:14px; background:var(--light-blue); display:flex; align-items:center; justify-content:center; font-weight:700;">Press Start</div>
        <table class="obs-table" style="margin-top:10px"><thead><tr><th>#</th><th>Reaction Time (ms)</th></tr></thead><tbody id="reactBody"></tbody></table>
      </div>
    </div>
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Adjustable Variables</h3>
        <div class="field"><label>Stimulus Intensity <span class="val" id="intVal">50%</span></label><input type="range" id="intR" min="0" max="100" value="50"></div>
        <div class="fact-box">Higher stimulus intensity → faster & stronger impulse propagation along the axon.</div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Learning Objectives</h3><ul style="font-size:13px;color:var(--text-soft);line-height:1.7;padding-left:18px"><li>Describe neuron structure and impulse transmission.</li><li>Sequence the steps of a reflex arc.</li><li>Measure and interpret reaction time.</li></ul></div>
      <div class="panel"><h3><span class="tag"></span>Scientific Background</h3><p style="font-size:13px;color:var(--text-soft);line-height:1.7">Neurons transmit electrical impulses along axons and chemical signals across synapses. A reflex arc bypasses conscious brain processing via the spinal cord for a rapid protective response.</p></div>
      <div class="panel"><h3><span class="tag"></span>Real-life Applications</h3><div class="fact-box">Reflex testing is used in medical exams (knee-jerk reflex) to check nervous system health; reaction-time studies inform road safety and sports training.</div></div>
      <div class="panel"><h3><span class="tag"></span>Common Misconceptions</h3><div class="warn-box">❌ "Reflexes are processed by the brain first." Most reflexes are processed at the spinal cord for speed, though the brain is informed afterward.</div></div>
      <div class="panel"><h3><span class="tag"></span>Interesting Facts</h3><div class="fact-box">⚡ Some nerve impulses travel over 100 metres per second — faster than a Formula 1 car!</div></div>
      <div class="panel"><h3><span class="tag"></span>Mini Quiz</h3><div id="quizHolder"></div></div>
      <div class="panel"><h3><span class="tag"></span>Summary</h3><p style="font-size:13px;color:var(--text-soft)">The nervous system carries information as electrical impulses through neurons, with reflex arcs providing very fast, automatic protective responses.</p></div>
    </div>
  </div>`;

  document.getElementById('intR').oninput = e=>{ intensity=+e.target.value; document.getElementById('intVal').textContent=intensity+'%'; };

  document.getElementById('fireBtn').onclick = ()=>{
    if(neuronActive) return;
    neuronActive=true; neuronProgress=0;
    neuronTimer = registerInterval(()=>{
      neuronProgress += 4 + intensity/12;
      if(neuronProgress>=100){ neuronProgress=100; clearInterval(neuronTimer); setTimeout(()=>{neuronActive=false; document.getElementById('neuronStage').innerHTML=neuronSVG(false,0);},500); }
      document.getElementById('neuronStage').innerHTML = neuronSVG(true, neuronProgress);
    }, 60);
    ctx.addXP(2);
  };
  document.getElementById('resetNeuronBtn').onclick = ()=>{ clearInterval(neuronTimer); neuronActive=false; neuronProgress=0; document.getElementById('neuronStage').innerHTML=neuronSVG(false,0); };

  const stages = ['stimulus','receptor','sensory','spinal','motor','effector'];
  document.getElementById('triggerReflex').onclick = ()=>{
    let i=0;
    document.getElementById('triggerReflex').disabled = true;
    const step = registerInterval(()=>{
      document.getElementById('reflexStage').innerHTML = reflexArcSVG(stages[i]);
      const descs = ['Hot object stimulates skin.','Receptor detects heat & generates a signal.','Sensory neuron carries the impulse to the spinal cord.','Spinal cord processes and redirects the signal instantly.','Motor neuron carries the "move away!" command.','Muscle (effector) contracts — hand pulls away!'];
      document.getElementById('reflexDesc').textContent = descs[i];
      i++;
      if(i>=stages.length){ clearInterval(step); document.getElementById('triggerReflex').disabled=false; ctx.addXP(6); ctx.markProgress(ctx.sim.id, Math.min(90,(ctx.STATE.progress[ctx.sim.id]||20)+15)); }
    }, 500);
  };

  let reactStartTime=null, waitTimer=null;
  document.getElementById('reactStart').onclick = ()=>{
    const zone = document.getElementById('reactZone');
    zone.style.background = 'var(--light-blue)'; zone.textContent='Wait for green…'; zone.style.cursor='default';
    clearTimeout(waitTimer);
    waitTimer = setTimeout(()=>{
      zone.style.background = '#66BB6A'; zone.textContent='React!'; zone.style.cursor='pointer';
      reactStartTime = performance.now();
    }, 1000+Math.random()*2500);
  };
  let reactCount=0;
  document.getElementById('reactZone').onclick = ()=>{
    if(!reactStartTime) return;
    const t = Math.round(performance.now()-reactStartTime);
    reactStartTime=null; reactCount++;
    const row=document.createElement('tr'); row.innerHTML=`<td>${reactCount}</td><td>${t} ms</td>`;
    document.getElementById('reactBody').appendChild(row);
    document.getElementById('reactZone').textContent='Press Start again'; document.getElementById('reactZone').style.background='var(--light-blue)';
    ctx.addXP(3);
  };

  buildQuiz(document.getElementById('quizHolder'), 'nervous', QUIZ, (score,total)=>{
    ctx.addXP(score*5); ctx.markProgress(ctx.sim.id,100);
    ctx.STATE.quizScores.nervous=`${score}/${total}`; ctx.saveState();
  });
}};
})();
