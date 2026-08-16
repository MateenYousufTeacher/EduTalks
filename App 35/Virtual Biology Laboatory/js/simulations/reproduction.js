/* ===================== SIMULATION 10: HUMAN REPRODUCTION & DEVELOPMENT ===================== */
/* Presented schematically and respectfully, in line with school biology curricula (NCERT-aligned).
   No graphic or explicit imagery — simple labelled diagrams and a developmental timeline only. */
(function(){

const STAGES = [
  {week:'Fertilisation', desc:'A sperm cell fuses with an egg cell to form a single-celled zygote, combining genetic material from both parents.'},
  {week:'Week 2–4', desc:'The zygote divides repeatedly and implants in the uterus lining, forming a tiny ball of cells called a blastocyst, then an embryo.'},
  {week:'Week 5–8', desc:'Major organs begin to form (heart starts beating); the embryo is now called a foetus from about week 9.'},
  {week:'Month 3 (Trimester 1 ends)', desc:'Basic body structures — limbs, face, and organs — are formed. The foetus is a few centimetres long.'},
  {week:'Month 4–6 (Trimester 2)', desc:'The foetus grows rapidly, movements can be felt, and organs continue maturing.'},
  {week:'Month 7–9 (Trimester 3)', desc:'The foetus gains weight, organs mature further (especially lungs), preparing for birth.'},
  {week:'Birth', desc:'After approximately 40 weeks, the baby is born and begins life outside the womb.'},
];

const QUIZ = [
  {q:'Fertilisation is the fusion of:', options:['Two body cells','A sperm cell and an egg cell','Two sperm cells','Two egg cells'], correct:1},
  {q:'The developing baby is called an embryo mainly during:', options:['The first few weeks after fertilisation','The last month of pregnancy','Only after birth','Before fertilisation'], correct:0},
  {q:'From roughly which week is the developing baby usually called a foetus?', options:['Week 1','Week 9 onward','After birth','Week 40'], correct:1},
  {q:'The organ where a fertilised egg usually implants and develops is the:', options:['Stomach','Uterus','Lungs','Kidney'], correct:1},
  {q:'A full-term human pregnancy lasts approximately:', options:['4 weeks','15 weeks','40 weeks','80 weeks'], correct:2},
  {q:'Which organ begins beating very early in embryonic development?', options:['Heart','Lungs','Kidney','Liver'], correct:0},
  {q:'Pregnancy is commonly divided into how many trimesters?', options:['Two','Three','Four','Five'], correct:1},
  {q:'During the third trimester, foetal organs mainly:', options:['Begin forming for the first time','Continue maturing, especially the lungs','Stop developing','Disappear'], correct:1},
  {q:'The male reproductive system produces:', options:['Eggs','Sperm','Milk','Amniotic fluid'], correct:1},
  {q:'The female reproductive system releases eggs from the:', options:['Testis','Ovary','Kidney','Liver'], correct:1},
];

function timelineSVG(activeIdx){
  const n = STAGES.length;
  const w=500, h=140, pad=40;
  const step = (w-pad*2)/(n-1);
  let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${pad}" y1="${h/2}" x2="${w-pad}" y2="${h/2}" stroke="#B3E5FC" stroke-width="4"/>`;
  STAGES.forEach((s,i)=>{
    const x = pad+i*step;
    const active = i===activeIdx;
    svg += `<circle data-i="${i}" cx="${x}" cy="${h/2}" r="${active?14:10}" fill="${active?'#5C6BC0':'#9FA8DA'}" style="cursor:pointer"/>`;
    svg += `<text x="${x}" y="${h/2+35}" font-size="9.5" text-anchor="middle" fill="var(--text)">${s.week}</text>`;
  });
  svg += `</svg>`;
  return svg;
}

function anatomyDiagram(sex){
  // Simple, schematic, non-graphic educational diagram (labelled shapes only)
  if(sex==='female'){
    return `<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="150" cy="120" rx="55" ry="45" fill="#F8BBD0" stroke="#AD1457" stroke-width="2"/>
      <circle cx="90" cy="100" r="16" fill="#F48FB1" stroke="#AD1457" stroke-width="2"/>
      <circle cx="210" cy="100" r="16" fill="#F48FB1" stroke="#AD1457" stroke-width="2"/>
      <path d="M150 165 L150 210" stroke="#AD1457" stroke-width="4"/>
      <text x="150" y="75" font-size="11" text-anchor="middle" fill="var(--text)">Uterus</text>
      <text x="90" y="70" font-size="10" text-anchor="middle" fill="var(--text)">Ovary</text>
      <text x="210" y="70" font-size="10" text-anchor="middle" fill="var(--text)">Ovary</text>
      <text x="150" y="230" font-size="10" text-anchor="middle" fill="var(--text)">Vagina</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg">
    <rect x="120" y="60" width="60" height="90" rx="14" fill="#BBDEFB" stroke="#1565C0" stroke-width="2"/>
    <circle cx="130" cy="180" r="20" fill="#90CAF9" stroke="#1565C0" stroke-width="2"/>
    <circle cx="170" cy="180" r="20" fill="#90CAF9" stroke="#1565C0" stroke-width="2"/>
    <text x="150" y="50" font-size="11" text-anchor="middle" fill="var(--text)">Reproductive glands</text>
    <text x="150" y="225" font-size="10" text-anchor="middle" fill="var(--text)">Testes (produce sperm)</text>
  </svg>`;
}

SIM_MODULES.reproduction = { render(container, ctx){
  let idx = 0;

  container.innerHTML = `
  <div class="sim-layout">
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Educational Note</h3>
        <div class="fact-box">This module presents human reproduction and prenatal development scientifically and respectfully, using simple labelled diagrams — appropriate for classroom biology curricula (aligned with NCERT / CBE standards). No graphic imagery is used.</div>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Development Timeline</h3>
        <div class="stage" id="timelineStage"></div>
        <div class="controls-row">
          <button class="ctrl-btn" id="stepBack">⏮ Previous Stage</button>
          <button class="ctrl-btn primary" id="stepFwd">⏭ Next Stage</button>
          <button class="ctrl-btn amber" id="resetBtn">↺ Reset</button>
        </div>
        <p id="stageDesc" style="font-size:13.5px; color:var(--text-soft); margin-top:12px; line-height:1.6"></p>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Reproductive System Overview</h3>
        <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center;">
          <div style="text-align:center; flex:1; min-width:200px"><div class="stage" style="min-height:220px">${anatomyDiagram('female')}</div><p style="font-size:12px; font-weight:700; margin-top:6px">Female Reproductive System</p></div>
          <div style="text-align:center; flex:1; min-width:200px"><div class="stage" style="min-height:220px">${anatomyDiagram('male')}</div><p style="font-size:12px; font-weight:700; margin-top:6px">Male Reproductive System</p></div>
        </div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Observation Log</h3><table class="obs-table"><thead><tr><th>#</th><th>Stage Explored</th></tr></thead><tbody id="obsBody"></tbody></table></div>
    </div>
    <div>
      <div class="panel"><h3><span class="tag"></span>Learning Objectives</h3><ul style="font-size:13px;color:var(--text-soft);line-height:1.7;padding-left:18px"><li>Identify the basic structures of the male & female reproductive systems.</li><li>Sequence the major stages of prenatal development.</li><li>Describe fertilisation in simple scientific terms.</li></ul></div>
      <div class="panel"><h3><span class="tag"></span>Scientific Background</h3><p style="font-size:13px;color:var(--text-soft);line-height:1.7">Human reproduction begins with fertilisation, when a sperm and egg cell fuse. The resulting zygote develops through embryonic and foetal stages inside the uterus over approximately 40 weeks before birth.</p></div>
      <div class="panel"><h3><span class="tag"></span>Real-life Applications</h3><div class="fact-box">Understanding prenatal development supports maternal health education, antenatal care timing, and awareness of healthy growth milestones.</div></div>
      <div class="panel"><h3><span class="tag"></span>Common Misconceptions</h3><div class="warn-box">❌ "The terms embryo and foetus mean the same thing." Embryo refers to the earliest weeks; foetus refers to later stages once major structures have formed.</div></div>
      <div class="panel"><h3><span class="tag"></span>Interesting Facts</h3><div class="fact-box">👶 The human heart begins beating around week 5–6 of development — long before most other organs have formed.</div></div>
      <div class="panel"><h3><span class="tag"></span>Mini Quiz</h3><div id="quizHolder"></div></div>
      <div class="panel"><h3><span class="tag"></span>Summary</h3><p style="font-size:13px;color:var(--text-soft)">Human development proceeds through fertilisation, embryonic organ formation, and foetal growth across three trimesters, culminating in birth after about 40 weeks.</p></div>
    </div>
  </div>`;

  const logged = new Set();
  function render(){
    document.getElementById('timelineStage').innerHTML = timelineSVG(idx);
    document.getElementById('stageDesc').innerHTML = `<b style="color:var(--text)">${STAGES[idx].week}:</b> ${STAGES[idx].desc}`;
    document.querySelectorAll('#timelineStage [data-i]').forEach(el=>{
      el.addEventListener('click', ()=>{ idx = +el.dataset.i; render(); logStep(); });
    });
    logStep();
  }
  function logStep(){
    if(logged.has(idx)) return;
    logged.add(idx);
    const row = document.createElement('tr');
    row.innerHTML = `<td>${logged.size}</td><td>${STAGES[idx].week}</td>`;
    document.getElementById('obsBody').appendChild(row);
    ctx.addXP(4);
    ctx.markProgress(ctx.sim.id, Math.min(95, 15+logged.size*12));
  }
  render();

  document.getElementById('stepFwd').onclick = ()=>{ idx=Math.min(STAGES.length-1, idx+1); render(); };
  document.getElementById('stepBack').onclick = ()=>{ idx=Math.max(0, idx-1); render(); };
  document.getElementById('resetBtn').onclick = ()=>{ idx=0; logged.clear(); document.getElementById('obsBody').innerHTML=''; render(); };

  buildQuiz(document.getElementById('quizHolder'), 'reproduction', QUIZ, (score,total)=>{
    ctx.addXP(score*5); ctx.markProgress(ctx.sim.id,100);
    ctx.STATE.quizScores.reproduction=`${score}/${total}`; ctx.saveState();
  });
}};
})();
