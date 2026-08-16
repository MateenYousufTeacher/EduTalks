/* ===================== SIMULATION 3: HUMAN DIGESTIVE SYSTEM ===================== */
(function(){

const STAGES = [
  {id:'mouth', name:'Mouth', desc:'Teeth chew food into small pieces; saliva (amylase) begins starch digestion.', pos:{cx:190,cy:40}},
  {id:'oesophagus', name:'Oesophagus', desc:'Muscular tube pushes food to the stomach via peristalsis (wave-like squeezing).', pos:{cx:200,cy:110}},
  {id:'stomach', name:'Stomach', desc:'Churns food; acid & pepsin begin protein digestion, forming a semi-liquid chyme.', pos:{cx:230,cy:180}},
  {id:'small', name:'Small Intestine', desc:'Enzymes complete digestion; nutrients are absorbed into the blood through villi.', pos:{cx:230,cy:260}},
  {id:'large', name:'Large Intestine', desc:'Absorbs water and remaining salts; forms and stores faeces.', pos:{cx:160,cy:300}},
  {id:'rectum', name:'Rectum', desc:'Stores faeces until it is eliminated from the body.', pos:{cx:190,cy:350}},
];

const QUIZ = [
  {q:'Where does digestion begin?', options:['Stomach','Mouth','Small intestine','Oesophagus'], correct:1},
  {q:'The wave-like muscle movement pushing food along is called:', options:['Osmosis','Peristalsis','Diffusion','Filtration'], correct:1},
  {q:'Most nutrient absorption happens in the:', options:['Stomach','Large intestine','Small intestine','Oesophagus'], correct:2},
  {q:'The stomach uses acid mainly to:', options:['Absorb water','Digest protein & kill germs','Store faeces','Produce bile'], correct:1},
  {q:'The large intestine mainly absorbs:', options:['Protein','Water & salts','Fat','Vitamins only'], correct:1},
  {q:'Saliva contains an enzyme that starts digesting:', options:['Fat','Starch','Protein','Vitamins'], correct:1},
  {q:'Villi are tiny finger-like projections found in the:', options:['Stomach','Small intestine','Oesophagus','Rectum'], correct:1},
  {q:'Undigested waste is finally stored & eliminated via the:', options:['Small intestine','Rectum','Mouth','Stomach'], correct:1},
  {q:'A diet low in fibre is most likely to cause:', options:['Faster digestion','Constipation','More nutrient absorption','Better peristalsis'], correct:1},
  {q:'Chyme is the term for:', options:['Chewed food in mouth','Semi-liquid food from the stomach','Saliva','Faeces'], correct:1},
];

function bodySVG(activeId, speed){
  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <path d="M190 20 h40 v70 h-30 v40 c40 10 60 60 40 100 c-10 30 10 40 -10 60 c30 20 -60 40 -60 80 h20 c10 -40 40 -30 40 -60 c-30 -10 0 -50 -20 -70 c-30 -20 -20 -70 -20 -100 v-40 h-30 v-70 z"
      fill="none" stroke="var(--border)" stroke-width="2" opacity="0.4"/>
    ${STAGES.map(s=>`
      <circle data-id="${s.id}" cx="${s.pos.cx}" cy="${s.pos.cy}" r="${activeId===s.id?22:16}" fill="${activeId===s.id?'#FF7043':'#FFCCBC'}" stroke="#D84315" stroke-width="2" style="cursor:pointer">
        ${activeId===s.id?`<animate attributeName="r" values="16;22;16" dur="${1.2/speed}s" repeatCount="indefinite"/>`:''}
      </circle>
      <text x="${s.pos.cx+28}" y="${s.pos.cy+4}" font-size="11" fill="var(--text)">${s.name}</text>
    `).join('')}
    <path d="M${STAGES.map(s=>s.pos.cx+' '+s.pos.cy).join(' L ')}" fill="none" stroke="#FF7043" stroke-width="3" stroke-dasharray="6,4" opacity="0.5"/>
  </svg>`;
}

SIM_MODULES.digestive = { render(container, ctx){
  let idx = 0, food='balanced', fibre=50, fat=30, waterIntake=60, timer=null, speed=1;

  container.innerHTML = `
  <div class="sim-layout">
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Live Visualization — Food's Journey</h3>
        <div class="stage" id="bodyStage"></div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="playBtn">▶ Play Journey</button>
          <button class="ctrl-btn" id="stepFwd">⏭ Step Forward</button>
          <button class="ctrl-btn" id="stepBack">⏮ Step Back</button>
          <button class="ctrl-btn amber" id="resetBtn">↺ Reset</button>
        </div>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Current Stage</h3>
        <p id="stageDesc" style="font-size:13.5px; color:var(--text-soft); line-height:1.6">Press Play or Step Forward to begin the journey.</p>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Observation Log</h3>
        <table class="obs-table"><thead><tr><th>Step</th><th>Organ</th><th>Process</th></tr></thead><tbody id="obsBody"></tbody></table>
      </div>
    </div>
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Adjustable Variables</h3>
        <div class="field"><label>Food Type</label>
          <select id="foodType"><option value="balanced">Balanced meal</option><option value="fatty">High-fat meal</option><option value="fibrous">High-fibre meal</option><option value="lowwater">Low water intake</option></select>
        </div>
        <div class="field"><label>Fibre Content <span class="val" id="fibreVal">50%</span></label><input type="range" id="fibreR" min="0" max="100" value="50"></div>
        <div class="field"><label>Fat Content <span class="val" id="fatVal">30%</span></label><input type="range" id="fatR" min="0" max="100" value="30"></div>
        <div class="field"><label>Water Intake <span class="val" id="waterVal">60%</span></label><input type="range" id="waterR" min="0" max="100" value="60"></div>
        <div class="fact-box" id="predictionBox">Prediction: balanced digestion expected.</div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Learning Objectives</h3><ul style="font-size:13px;color:var(--text-soft);line-height:1.7;padding-left:18px"><li>Trace the pathway of food through the digestive tract.</li><li>Link each organ to its digestive process.</li><li>Predict effects of diet on digestion.</li></ul></div>
      <div class="panel"><h3><span class="tag"></span>Scientific Background</h3><p style="font-size:13px;color:var(--text-soft);line-height:1.7">Digestion breaks large food molecules into small absorbable units using mechanical action (chewing, churning) and chemical action (enzymes).</p></div>
      <div class="panel"><h3><span class="tag"></span>Real-life Applications</h3><div class="fact-box">Understanding digestion guides nutrition advice — e.g. high-fibre diets support healthy bowel movement and prevent constipation.</div></div>
      <div class="panel"><h3><span class="tag"></span>Common Misconceptions</h3><div class="warn-box">❌ "Digestion happens only in the stomach." It starts in the mouth and continues through the small intestine.<br>❌ "The large intestine absorbs most nutrients." It mainly absorbs water — nutrients are absorbed in the small intestine.</div></div>
      <div class="panel"><h3><span class="tag"></span>Interesting Facts</h3><div class="fact-box">🧵 The small intestine is about 6–7 metres long in adults — but folds and villi pack in enormous absorptive surface area!</div></div>
      <div class="panel"><h3><span class="tag"></span>Mini Quiz</h3><div id="quizHolder"></div></div>
      <div class="panel"><h3><span class="tag"></span>Summary</h3><p style="font-size:13px;color:var(--text-soft)">Food travels mouth → oesophagus → stomach → small intestine → large intestine → rectum, being progressively broken down and absorbed.</p></div>
    </div>
  </div>`;

  function updatePrediction(){
    let msg = 'Balanced digestion expected — normal transit time.';
    if(food==='fatty' || fat>60) msg = '⚠️ High fat slows stomach emptying — digestion takes longer.';
    else if(food==='fibrous' || fibre>70) msg = '✅ High fibre speeds up movement through the large intestine, easing elimination.';
    else if(food==='lowwater' || waterIntake<25) msg = '⚠️ Low water intake → harder stools → risk of constipation in large intestine.';
    document.getElementById('predictionBox').textContent = 'Prediction: ' + msg;
  }

  function render(){
    const stage = STAGES[idx];
    document.getElementById('bodyStage').innerHTML = bodySVG(stage.id, speed);
    document.getElementById('stageDesc').innerHTML = `<b style="color:var(--text)">${stage.name}:</b> ${stage.desc}`;
    document.querySelectorAll('#bodyStage [data-id]').forEach(el=>{
      el.addEventListener('click', ()=>{
        idx = STAGES.findIndex(s=>s.id===el.dataset.id);
        render(); logStep();
      });
    });
  }
  const logged = new Set();
  function logStep(){
    const stage = STAGES[idx];
    if(logged.has(stage.id)) return;
    logged.add(stage.id);
    const row = document.createElement('tr');
    row.innerHTML = `<td>${logged.size}</td><td>${stage.name}</td><td>${stage.desc}</td>`;
    document.getElementById('obsBody').appendChild(row);
    ctx.addXP(4);
    ctx.markProgress(ctx.sim.id, Math.min(95, 15+logged.size*13));
  }
  render();

  document.getElementById('playBtn').onclick = ()=>{
    if(timer) return;
    timer = registerInterval(()=>{
      idx = (idx+1) % STAGES.length;
      render(); logStep();
    }, 1400/speed);
    ctx.toast('Following the food\'s journey…');
  };
  document.getElementById('stepFwd').onclick = ()=>{ clearInterval(timer); timer=null; idx=(idx+1)%STAGES.length; render(); logStep(); };
  document.getElementById('stepBack').onclick = ()=>{ clearInterval(timer); timer=null; idx=(idx-1+STAGES.length)%STAGES.length; render(); };
  document.getElementById('resetBtn').onclick = ()=>{ clearInterval(timer); timer=null; idx=0; logged.clear(); document.getElementById('obsBody').innerHTML=''; render(); };

  document.getElementById('foodType').onchange = e=>{ food=e.target.value; updatePrediction(); };
  document.getElementById('fibreR').oninput = e=>{ fibre=+e.target.value; document.getElementById('fibreVal').textContent=fibre+'%'; updatePrediction(); };
  document.getElementById('fatR').oninput = e=>{ fat=+e.target.value; document.getElementById('fatVal').textContent=fat+'%'; updatePrediction(); };
  document.getElementById('waterR').oninput = e=>{ waterIntake=+e.target.value; document.getElementById('waterVal').textContent=waterIntake+'%'; updatePrediction(); };

  buildQuiz(document.getElementById('quizHolder'), 'digestive', QUIZ, (score,total)=>{
    ctx.addXP(score*5); ctx.markProgress(ctx.sim.id,100);
    ctx.STATE.quizScores.digestive=`${score}/${total}`; ctx.saveState();
  });
}};
})();
