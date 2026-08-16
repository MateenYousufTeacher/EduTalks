/* ===================== SIMULATION 5: HUMAN CIRCULATORY SYSTEM ===================== */
(function(){

const QUIZ = [
  {q:'The heart chamber that pumps oxygenated blood to the body is the:', options:['Right atrium','Left ventricle','Right ventricle','Left atrium'], correct:1},
  {q:'Blood low in oxygen returns to the:', options:['Left atrium','Right atrium','Left ventricle','Aorta'], correct:1},
  {q:'Human circulation is called "double circulation" because blood passes through the heart:', options:['Once per cycle','Twice per cycle','Three times','Never'], correct:1},
  {q:'Valves in the heart & veins mainly prevent:', options:['Blood clotting','Backflow of blood','Oxygen loss','High blood pressure'], correct:1},
  {q:'During exercise, heart rate typically:', options:['Decreases','Stays exactly the same','Increases','Stops briefly'], correct:2},
  {q:'Arteries generally carry blood:', options:['Away from the heart','Toward the heart only','Only deoxygenated blood','Only to the lungs'], correct:0},
  {q:'Which vessel carries deoxygenated blood but is NOT a vein?', options:['Pulmonary artery','Aorta','Vena cava','Coronary vein'], correct:0},
  {q:'Blood pressure is typically recorded as:', options:['One single number','Systolic over diastolic','Heart rate only','Oxygen percentage'], correct:1},
  {q:'The pulse you feel at your wrist reflects:', options:['Nerve impulses','Ventricular contraction pushing blood through arteries','Muscle twitching','Digestion'], correct:1},
  {q:'Narrower vessel diameter tends to:', options:['Decrease blood pressure','Increase blood pressure','Have no effect','Stop blood flow instantly'], correct:1},
];

function heartSVG(bpm, vesselWidth, activity){
  const beatDur = (60/bpm).toFixed(2);
  return `<svg viewBox="0 0 400 380" xmlns="http://www.w3.org/2000/svg">
    <!-- body outline -->
    <ellipse cx="200" cy="190" rx="140" ry="170" fill="none" stroke="var(--border)" stroke-width="2" opacity="0.4"/>
    <!-- vessels -->
    <path d="M200 60 C 260 90 300 150 ${300-(10-vesselWidth/10)} 220" stroke="#E53935" stroke-width="${Math.max(4,vesselWidth/8)}" fill="none" opacity="0.8">
      <animate attributeName="stroke-width" values="${Math.max(4,vesselWidth/8)};${Math.max(6,vesselWidth/6)};${Math.max(4,vesselWidth/8)}" dur="${beatDur}s" repeatCount="indefinite"/>
    </path>
    <path d="M200 60 C 140 90 100 150 ${100+(10-vesselWidth/10)} 220" stroke="#1E88E5" stroke-width="${Math.max(3,vesselWidth/10)}" fill="none" opacity="0.8"/>
    <path d="M100 220 C 120 280 280 280 300 220" stroke="#1E88E5" stroke-width="${Math.max(3,vesselWidth/10)}" fill="none" opacity="0.7"/>
    <!-- heart -->
    <g transform="translate(200,150)">
      <path d="M0 25 C -50 -25 -90 20 -50 60 C -25 85 0 100 0 100 C 0 100 25 85 50 60 C 90 20 50 -25 0 25 Z" fill="#E53935">
        <animateTransform attributeName="transform" type="scale" values="1;1.18;1" dur="${beatDur}s" repeatCount="indefinite"/>
      </path>
    </g>
    <!-- blood flow particles -->
    ${Array.from({length:6}).map((_,i)=>`<circle r="3.5" fill="#E53935"><animateMotion dur="${(2/(bpm/70)).toFixed(2)}s" repeatCount="indefinite" begin="${i*0.3}s" path="M200 65 C 260 95 300 155 300 220"/></circle>`).join('')}
    <text x="140" y="330" font-size="14" font-weight="700" fill="var(--text)">${bpm} bpm ${activity==='resting'?'(resting)':activity==='exercise'?'(exercising)':'(recovering)'}</text>
  </svg>`;
}

SIM_MODULES.circulatory = { render(container, ctx){
  let bpm=72, activity='resting', vesselWidth=50, bp={sys:120,dia:80};
  const history=[];

  container.innerHTML = `
  <div class="sim-layout">
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Live Visualization — Double Circulation</h3>
        <div class="stage" id="heartStage"></div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="activityBtn">🏃 Start Exercise</button>
          <button class="ctrl-btn amber" id="resetBtn">↺ Reset to Resting</button>
        </div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Heart Rate & Blood Pressure — Live Graph</h3><div class="stage" id="graphStage" style="min-height:180px"></div></div>
      <div class="panel"><h3><span class="tag"></span>Observation Log</h3><table class="obs-table"><thead><tr><th>#</th><th>Activity</th><th>Heart Rate</th><th>BP (sys/dia)</th></tr></thead><tbody id="obsBody"></tbody></table>
      <div class="controls-row"><button class="ctrl-btn" id="recordBtn">📌 Record Observation</button></div></div>
    </div>
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Adjustable Variables</h3>
        <div class="field"><label>Vessel Diameter <span class="val" id="vesVal">50%</span></label><input type="range" id="vesR" min="10" max="100" value="50"></div>
        <div class="fact-box">Tap "Start Exercise" to see heart rate & pressure respond dynamically, then "Reset" to return to resting state.</div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Learning Objectives</h3><ul style="font-size:13px;color:var(--text-soft);line-height:1.7;padding-left:18px"><li>Trace the path of double circulation.</li><li>Relate activity level to heart rate and blood pressure.</li><li>Understand the role of heart valves.</li></ul></div>
      <div class="panel"><h3><span class="tag"></span>Scientific Background</h3><p style="font-size:13px;color:var(--text-soft);line-height:1.7">In double circulation, blood passes through the heart twice per cycle: once to the lungs (pulmonary circuit) and once to the body (systemic circuit), keeping oxygenated and deoxygenated blood separate.</p></div>
      <div class="panel"><h3><span class="tag"></span>Real-life Applications</h3><div class="fact-box">Doctors monitor heart rate and blood pressure to assess cardiovascular fitness and detect conditions like hypertension.</div></div>
      <div class="panel"><h3><span class="tag"></span>Common Misconceptions</h3><div class="warn-box">❌ "All arteries carry oxygen-rich blood." The pulmonary artery carries deoxygenated blood to the lungs.<br>❌ "The heart is on the left side of the chest." It sits centrally, tilted slightly left.</div></div>
      <div class="panel"><h3><span class="tag"></span>Interesting Facts</h3><div class="fact-box">❤️ An average heart beats about 100,000 times a day and pumps roughly 7,500 litres of blood!</div></div>
      <div class="panel"><h3><span class="tag"></span>Mini Quiz</h3><div id="quizHolder"></div></div>
      <div class="panel"><h3><span class="tag"></span>Summary</h3><p style="font-size:13px;color:var(--text-soft)">Exercise raises heart rate and blood pressure to deliver more oxygen; narrower vessels increase pressure for the same flow.</p></div>
    </div>
  </div>`;

  function drawGraph(){
    const w=460,h=170,pad=28;
    const pts = history.slice(-30);
    const pathHR = pts.map((v,i)=>`${pad+i*((w-pad*2)/29)},${h-pad-((v.bpm-40)/140)*(h-pad*2)}`).join(' ');
    document.getElementById('graphStage').innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%">
      <line x1="${pad}" y1="${h-pad}" x2="${w-10}" y2="${h-pad}" stroke="#90A4AE"/>
      <line x1="${pad}" y1="10" x2="${pad}" y2="${h-pad}" stroke="#90A4AE"/>
      <polyline points="${pathHR}" fill="none" stroke="#E53935" stroke-width="2.5"/>
      <text x="${pad}" y="24" font-size="10" fill="#E53935">Heart rate (bpm)</text>
    </svg>`;
  }
  function render(){
    document.getElementById('heartStage').innerHTML = heartSVG(bpm, vesselWidth, activity);
    history.push({bpm}); if(history.length>200) history.shift();
    drawGraph();
  }
  render();
  let animTimer = registerInterval(()=>{
    // slight organic drift + move toward target based on activity
    const target = activity==='exercise' ? 150 - vesselWidth*0.3 : 70 - (50-vesselWidth)*0.2;
    bpm += (target-bpm)*0.08;
    bpm = Math.max(45, Math.min(190, Math.round(bpm)));
    bp.sys = Math.round(110 + (bpm-70)*0.6 + (60-vesselWidth)*0.4);
    bp.dia = Math.round(75 + (bpm-70)*0.25 + (60-vesselWidth)*0.2);
    render();
  }, 900);

  document.getElementById('vesR').oninput = e=>{ vesselWidth=+e.target.value; document.getElementById('vesVal').textContent=vesselWidth+'%'; render(); };
  document.getElementById('activityBtn').onclick = ()=>{
    activity = activity==='resting' ? 'exercise' : 'resting';
    document.getElementById('activityBtn').textContent = activity==='exercise' ? '🧘 Stop & Rest' : '🏃 Start Exercise';
    ctx.toast(activity==='exercise' ? 'Exercising — watch heart rate rise!' : 'Resting — recovering…');
  };
  document.getElementById('resetBtn').onclick = ()=>{ activity='resting'; vesselWidth=50; document.getElementById('vesR').value=50; document.getElementById('vesVal').textContent='50%'; document.getElementById('activityBtn').textContent='🏃 Start Exercise'; document.getElementById('obsBody').innerHTML=''; history.length=0; };
  let rec=0;
  document.getElementById('recordBtn').onclick = ()=>{
    rec++;
    const row=document.createElement('tr');
    row.innerHTML=`<td>${rec}</td><td>${activity}</td><td>${bpm} bpm</td><td>${bp.sys}/${bp.dia}</td>`;
    document.getElementById('obsBody').appendChild(row);
    ctx.addXP(4); ctx.markProgress(ctx.sim.id, Math.min(90,20+rec*10));
  };

  buildQuiz(document.getElementById('quizHolder'), 'circulatory', QUIZ, (score,total)=>{
    ctx.addXP(score*5); ctx.markProgress(ctx.sim.id,100);
    ctx.STATE.quizScores.circulatory=`${score}/${total}`; ctx.saveState();
  });
}};
})();
