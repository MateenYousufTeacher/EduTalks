/* ===================== SIMULATION 4: RESPIRATORY SYSTEM LABORATORY ===================== */
(function(){

const QUIZ = [
  {q:'Gas exchange in the lungs occurs in tiny sacs called:', options:['Bronchi','Alveoli','Trachea','Larynx'], correct:1},
  {q:'During inhalation, the diaphragm:', options:['Relaxes and rises','Contracts and flattens','Stops moving','Expands sideways only'], correct:1},
  {q:'Exercise typically makes breathing rate:', options:['Decrease','Stay the same','Increase','Stop'], correct:2},
  {q:'At high altitude, oxygen availability is:', options:['Higher','Lower','Unchanged','Doubled'], correct:1},
  {q:'Poor air quality (pollution) tends to:', options:['Improve oxygen saturation','Reduce oxygen saturation','Have no effect','Increase lung capacity instantly'], correct:1},
  {q:'The gas expelled during exhalation in higher amount is:', options:['Oxygen','Carbon dioxide','Nitrogen','Hydrogen'], correct:1},
  {q:'Oxygen in the blood is mainly carried by:', options:['Plasma','White blood cells','Haemoglobin in red blood cells','Platelets'], correct:2},
  {q:'The trachea is protected from food by the:', options:['Diaphragm','Epiglottis','Alveoli','Bronchiole'], correct:1},
  {q:'A normal resting adult breathing rate is about:', options:['2–4 breaths/min','12–18 breaths/min','60–80 breaths/min','150 breaths/min'], correct:1},
  {q:'Increased carbon dioxide in blood mainly stimulates:', options:['Slower breathing','Faster, deeper breathing','No change','Stops breathing'], correct:1},
];

function lungSVG(phase, rate, spo2){
  const scale = phase==='in' ? 1.12 : 0.92;
  return `<svg viewBox="0 0 400 380" xmlns="http://www.w3.org/2000/svg">
    <rect x="170" y="10" width="16" height="60" fill="#90A4AE" rx="6"/>
    <g transform="translate(200,190) scale(${scale}) translate(-200,-190)">
      <path d="M200 70 C130 90 90 160 100 240 C105 300 150 330 190 300 C200 260 195 150 200 70 Z" fill="#EF9A9A" opacity="0.85"/>
      <path d="M200 70 C270 90 310 160 300 240 C295 300 250 330 210 300 C200 260 205 150 200 70 Z" fill="#EF9A9A" opacity="0.85"/>
      <circle cx="150" cy="180" r="5" fill="#C62828"/><circle cx="170" cy="220" r="5" fill="#C62828"/>
      <circle cx="250" cy="180" r="5" fill="#C62828"/><circle cx="230" cy="220" r="5" fill="#C62828"/>
    </g>
    <rect x="0" y="340" width="400" height="40" fill="none"/>
    <text x="130" y="360" font-size="13" fill="var(--text)">${phase==='in'?'Inhaling…':'Exhaling…'} (${rate} breaths/min)</text>
    <text x="20" y="30" font-size="13" fill="#0288D1">SpO₂: ${spo2}%</text>
  </svg>`;
}

SIM_MODULES.respiratory = { render(container, ctx){
  let exercise=20, altitude=0, airQuality=90, breathingRate=14, phase='in', timer=null;
  const history=[];

  container.innerHTML = `
  <div class="sim-layout">
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Live Visualization — Breathing & Gas Exchange</h3>
        <div class="stage" id="lungStage"></div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="playBtn">▶ Play</button>
          <button class="ctrl-btn" id="pauseBtn">⏸ Pause</button>
          <button class="ctrl-btn amber" id="resetBtn">↺ Reset</button>
        </div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Respiratory Rate & SpO₂ — Live Graph</h3><div class="stage" id="graphStage" style="min-height:180px"></div></div>
      <div class="panel"><h3><span class="tag"></span>Observation Log</h3><table class="obs-table"><thead><tr><th>#</th><th>Exercise</th><th>Altitude</th><th>Air Quality</th><th>Rate</th><th>SpO₂</th></tr></thead><tbody id="obsBody"></tbody></table>
      <div class="controls-row"><button class="ctrl-btn" id="recordBtn">📌 Record Observation</button></div></div>
    </div>
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Adjustable Variables</h3>
        <div class="field"><label>Exercise Intensity <span class="val" id="exVal">20%</span></label><input type="range" id="exR" min="0" max="100" value="20"></div>
        <div class="field"><label>Altitude (m) <span class="val" id="altVal">0m</span></label><input type="range" id="altR" min="0" max="5000" step="100" value="0"></div>
        <div class="field"><label>Air Quality <span class="val" id="airVal">90 (Good)</span></label><input type="range" id="airR" min="0" max="100" value="90"></div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Learning Objectives</h3><ul style="font-size:13px;color:var(--text-soft);line-height:1.7;padding-left:18px"><li>Relate breathing rate to exercise, altitude & air quality.</li><li>Understand gas exchange at the alveoli.</li><li>Interpret oxygen saturation (SpO₂).</li></ul></div>
      <div class="panel"><h3><span class="tag"></span>Scientific Background</h3><p style="font-size:13px;color:var(--text-soft);line-height:1.7">Oxygen diffuses from alveoli into blood capillaries while carbon dioxide diffuses the opposite way, driven by concentration gradients across a thin, moist membrane.</p></div>
      <div class="panel"><h3><span class="tag"></span>Real-life Applications</h3><div class="fact-box">Pulse oximeters measure SpO₂ in hospitals; understanding altitude effects helps mountaineers plan acclimatisation.</div></div>
      <div class="panel"><h3><span class="tag"></span>Common Misconceptions</h3><div class="warn-box">❌ "We breathe in only oxygen and breathe out only CO₂." Inhaled air is ~21% oxygen; exhaled air still contains ~16% oxygen alongside more CO₂.</div></div>
      <div class="panel"><h3><span class="tag"></span>Interesting Facts</h3><div class="fact-box">🏔 Above 5,000m, oxygen availability drops to nearly half of sea level, forcing the body to breathe faster and produce more red blood cells over time.</div></div>
      <div class="panel"><h3><span class="tag"></span>Mini Quiz</h3><div id="quizHolder"></div></div>
      <div class="panel"><h3><span class="tag"></span>Summary</h3><p style="font-size:13px;color:var(--text-soft)">Exercise and altitude raise breathing rate to meet oxygen demand; poor air quality and high altitude both reduce blood oxygen saturation.</p></div>
    </div>
  </div>`;

  function computeVitals(){
    const rate = Math.round(12 + exercise*0.18 + altitude/300);
    let spo2 = 98 - altitude/250 - (100-airQuality)*0.15 - Math.max(0,exercise-70)*0.05;
    spo2 = Math.max(60, Math.min(99, Math.round(spo2)));
    return {rate, spo2};
  }
  function drawGraph(){
    const w=460,h=170,pad=28;
    const pts = history.slice(-30);
    const pathRate = pts.map((v,i)=>`${pad+i*((w-pad*2)/29)},${h-pad-(v.rate/40)*(h-pad*2)}`).join(' ');
    const pathSpo2 = pts.map((v,i)=>`${pad+i*((w-pad*2)/29)},${h-pad-((v.spo2-60)/40)*(h-pad*2)}`).join(' ');
    document.getElementById('graphStage').innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%">
      <line x1="${pad}" y1="${h-pad}" x2="${w-10}" y2="${h-pad}" stroke="#90A4AE"/>
      <line x1="${pad}" y1="10" x2="${pad}" y2="${h-pad}" stroke="#90A4AE"/>
      <polyline points="${pathRate}" fill="none" stroke="#26C6DA" stroke-width="2.5"/>
      <polyline points="${pathSpo2}" fill="none" stroke="#E53935" stroke-width="2.5"/>
      <text x="${pad}" y="24" font-size="10" fill="#26C6DA">Breathing rate</text>
      <text x="${pad}" y="38" font-size="10" fill="#E53935">SpO₂</text>
    </svg>`;
  }

  function tick(){
    phase = phase==='in' ? 'out' : 'in';
    const {rate,spo2} = computeVitals();
    document.getElementById('lungStage').innerHTML = lungSVG(phase, rate, spo2);
    history.push({rate,spo2}); if(history.length>200) history.shift();
    drawGraph();
  }
  tick();

  document.getElementById('exR').oninput = e=>{ exercise=+e.target.value; document.getElementById('exVal').textContent=exercise+'%'; tick(); };
  document.getElementById('altR').oninput = e=>{ altitude=+e.target.value; document.getElementById('altVal').textContent=altitude+'m'; tick(); };
  document.getElementById('airR').oninput = e=>{ airQuality=+e.target.value; document.getElementById('airVal').textContent=airQuality+(airQuality>70?' (Good)':airQuality>40?' (Moderate)':' (Poor)'); tick(); };

  document.getElementById('playBtn').onclick = ()=>{ if(timer) return; const {rate} = computeVitals(); timer=registerInterval(tick, Math.max(280, 2000/(rate/14))); };
  document.getElementById('pauseBtn').onclick = ()=>{ clearInterval(timer); timer=null; };
  document.getElementById('resetBtn').onclick = ()=>{
    clearInterval(timer); timer=null; exercise=20;altitude=0;airQuality=90; history.length=0;
    document.getElementById('exR').value=20; document.getElementById('altR').value=0; document.getElementById('airR').value=90;
    document.getElementById('exVal').textContent='20%'; document.getElementById('altVal').textContent='0m'; document.getElementById('airVal').textContent='90 (Good)';
    document.getElementById('obsBody').innerHTML=''; tick();
  };
  let rec=0;
  document.getElementById('recordBtn').onclick = ()=>{
    const {rate,spo2}=computeVitals(); rec++;
    const row=document.createElement('tr');
    row.innerHTML=`<td>${rec}</td><td>${exercise}%</td><td>${altitude}m</td><td>${airQuality}</td><td>${rate}/min</td><td>${spo2}%</td>`;
    document.getElementById('obsBody').appendChild(row);
    ctx.addXP(4); ctx.markProgress(ctx.sim.id, Math.min(90,20+rec*10));
  };

  buildQuiz(document.getElementById('quizHolder'), 'respiratory', QUIZ, (score,total)=>{
    ctx.addXP(score*5); ctx.markProgress(ctx.sim.id,100);
    ctx.STATE.quizScores.respiratory=`${score}/${total}`; ctx.saveState();
  });
}};
})();
