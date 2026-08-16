/* ===================== SIMULATION 2: PHOTOSYNTHESIS LABORATORY ===================== */
(function(){

const QUIZ = [
  {q:'Photosynthesis mainly occurs in which organelle?', options:['Mitochondrion','Chloroplast','Nucleus','Ribosome'], correct:1},
  {q:'What gas is released as a by-product of photosynthesis?', options:['Carbon dioxide','Nitrogen','Oxygen','Methane'], correct:2},
  {q:'Which pigment absorbs light energy for photosynthesis?', options:['Haemoglobin','Chlorophyll','Melanin','Keratin'], correct:1},
  {q:'The raw materials for photosynthesis are:', options:['Glucose & Oxygen','Water & Carbon dioxide','Nitrogen & Water','Oxygen & Nitrogen'], correct:1},
  {q:'The overall product of photosynthesis (sugar) is:', options:['Starch','Glucose','Cellulose','Protein'], correct:1},
  {q:'At very low light intensity, photosynthesis rate is:', options:['Very high','Zero','Low, limited by light','Constant'], correct:2},
  {q:'Beyond a certain CO₂ concentration, photosynthesis rate:', options:['Keeps rising forever','Plateaus (levels off)','Drops to zero','Becomes negative'], correct:1},
  {q:'The light reaction takes place in the:', options:['Stroma','Thylakoid membrane','Mitochondrial matrix','Nucleus'], correct:1},
  {q:'Very high temperature reduces photosynthesis mainly because:', options:['Enzymes denature','Chlorophyll turns blue','CO2 increases','Water freezes'], correct:0},
  {q:'Photosynthesis is important to nearly all life because it:', options:['Produces waste','Is the base of most food chains','Uses up oxygen','Destroys carbon dioxide only'], correct:1},
];

function bubblesSVG(rate){
  const n = Math.round(rate/8);
  let bubbles='';
  for(let i=0;i<n;i++){
    const x = 60+Math.random()*380, delay=(Math.random()*3).toFixed(2);
    bubbles += `<circle cx="${x}" cy="360" r="${3+Math.random()*3}" fill="#B3E5FC" opacity="0.85">
      <animate attributeName="cy" from="360" to="${20+Math.random()*40}" dur="${2+Math.random()*2}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.9" to="0" dur="${2+Math.random()*2}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
  }
  return bubbles;
}

function leafSVG(light, co2, water, temp, rate){
  const glow = Math.min(1, light/100);
  return `<svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
    <!-- sun -->
    <circle cx="440" cy="60" r="${20+glow*18}" fill="#FFB300" opacity="${0.35+glow*0.5}"/>
    <circle cx="440" cy="60" r="18" fill="#FFC107"/>
    <!-- stem -->
    <rect x="240" y="200" width="16" height="160" rx="8" fill="#66BB6A"/>
    <!-- leaf -->
    <path d="M250 210 C 120 190, 60 260, 100 330 C 160 380, 260 350, 250 210 Z" fill="${water>30?'#43A047':'#9CCC65'}" opacity="0.95"/>
    <path d="M250 210 C 220 260 220 310 250 340" stroke="#2E7D32" stroke-width="3" fill="none"/>
    <!-- chloroplast dots -->
    ${Array.from({length:14}).map((_,i)=>`<circle cx="${130+ (i%5)*30 + (i*7)%20}" cy="${250+ Math.floor(i/5)*35}" r="5" fill="#1B5E20" opacity="0.55"/>`).join('')}
    <!-- CO2 arrows in -->
    <text x="60" y="150" font-size="13" fill="#455A64">CO₂ ${Math.round(co2)}%</text>
    <path d="M70 160 L70 200" stroke="#607D8B" stroke-width="2" marker-end="url(#arrow)"/>
    <!-- Water from soil -->
    <rect x="0" y="365" width="500" height="35" fill="#795548" opacity="0.5"/>
    <text x="170" y="390" font-size="12" fill="#fff">Soil water: ${Math.round(water)}%</text>
    <!-- O2 bubbles -->
    ${bubblesSVG(rate)}
    <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#607D8B"/></marker></defs>
    <text x="330" y="150" font-size="13" fill="#0288D1">O₂ bubbles ↑</text>
    <text x="10" y="20" font-size="13" fill="#E65100">🌡 ${Math.round(temp)}°C</text>
  </svg>`;
}

function computeRate(light, co2, water, temp){
  // simplified limiting-factor model
  const lightFactor = Math.min(1, light/70);
  const co2Factor = Math.min(1, co2/1.2);
  const waterFactor = water < 20 ? water/20 : 1;
  let tempFactor;
  if(temp < 10) tempFactor = temp/10*0.5;
  else if(temp <= 35) tempFactor = 0.5 + (temp-10)/25*0.5;
  else tempFactor = Math.max(0, 1 - (temp-35)/20);
  const rate = 100 * lightFactor * co2Factor * waterFactor * tempFactor;
  return Math.max(0, Math.min(100, rate));
}

SIM_MODULES.photosynthesis = { render(container, ctx){
  let light=50, co2=0.6, water=60, temp=25;
  const history = [];

  container.innerHTML = `
  <div class="sim-layout">
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Live Visualization — Chloroplast in Action</h3>
        <div class="stage" id="leafStage"></div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="playBtn">▶ Play</button>
          <button class="ctrl-btn" id="pauseBtn">⏸ Pause</button>
          <button class="ctrl-btn" id="randomBtn">🎲 Randomize</button>
          <button class="ctrl-btn amber" id="resetBtn">↺ Reset</button>
        </div>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Photosynthesis Rate — Live Graph</h3>
        <div class="stage" id="graphStage" style="min-height:200px"></div>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Observation Table</h3>
        <table class="obs-table"><thead><tr><th>Reading</th><th>Light %</th><th>CO₂ %</th><th>Water %</th><th>Temp °C</th><th>Rate</th></tr></thead><tbody id="obsBody"></tbody></table>
        <div class="controls-row"><button class="ctrl-btn" id="recordBtn">📌 Record Observation</button><button class="ctrl-btn" id="exportBtn">⬇ Export CSV</button></div>
      </div>
    </div>
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Adjustable Variables</h3>
        <div class="field"><label>Light Intensity <span class="val" id="lightVal">50%</span></label><input type="range" id="lightR" min="0" max="100" value="50"></div>
        <div class="field"><label>CO₂ Concentration <span class="val" id="co2Val">0.6%</span></label><input type="range" id="co2R" min="0" max="2" step="0.05" value="0.6"></div>
        <div class="field"><label>Water Availability <span class="val" id="waterVal">60%</span></label><input type="range" id="waterR" min="0" max="100" value="60"></div>
        <div class="field"><label>Temperature <span class="val" id="tempVal">25°C</span></label><input type="range" id="tempR" min="0" max="50" value="25"></div>
        <div class="fact-box" id="rateBox">Current rate: <b>—</b></div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Learning Objectives</h3><ul style="font-size:13px;line-height:1.7;color:var(--text-soft);padding-left:18px"><li>Identify factors limiting photosynthesis rate.</li><li>Predict outcomes of changing light, CO₂, water & temperature.</li><li>Interpret a rate-vs-factor graph.</li></ul></div>
      <div class="panel"><h3><span class="tag"></span>Scientific Background</h3><p style="font-size:13px;color:var(--text-soft);line-height:1.7">6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. The rate is controlled by whichever factor is most limiting at a given moment (Law of Limiting Factors).</p></div>
      <div class="panel"><h3><span class="tag"></span>Real-life Applications</h3><div class="fact-box">Greenhouse farmers boost CO₂ and light to raise crop yield; understanding limiting factors helps optimise indoor/vertical farming.</div></div>
      <div class="panel"><h3><span class="tag"></span>Common Misconceptions</h3><div class="warn-box">❌ "More light always means more photosynthesis." Beyond saturation, other factors (CO₂, water) become limiting.<br>❌ "Plants only photosynthesise, never respire." Plants respire continuously, and photosynthesise only in light.</div></div>
      <div class="panel"><h3><span class="tag"></span>Interesting Facts</h3><div class="fact-box">🌍 Photosynthesis produces roughly half of the world's oxygen from ocean phytoplankton, not just land plants!</div></div>
      <div class="panel"><h3><span class="tag"></span>Mini Quiz</h3><div id="quizHolder"></div></div>
      <div class="panel"><h3><span class="tag"></span>Summary</h3><p style="font-size:13px;color:var(--text-soft)">Photosynthesis rate rises with light, CO₂ and adequate water/temperature — until one factor becomes limiting and the rate plateaus.</p></div>
    </div>
  </div>`;

  function render(){
    const rate = computeRate(light, co2, water, temp);
    document.getElementById('leafStage').innerHTML = leafSVG(light, co2, water, temp, rate);
    document.getElementById('rateBox').innerHTML = `Current rate: <b>${rate.toFixed(0)} units</b> ${rate>75?'🌟 Optimal!':rate<20?'⚠️ Very low':''}`;
    drawGraph();
    return rate;
  }
  function drawGraph(){
    const w=460,h=190,pad=30;
    let pts = history.slice(-30);
    let path = pts.map((v,i)=>`${pad+i*((w-pad*2)/29)},${h-pad-(v/100)*(h-pad*2)}`).join(' ');
    document.getElementById('graphStage').innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%">
      <line x1="${pad}" y1="${h-pad}" x2="${w-10}" y2="${h-pad}" stroke="#90A4AE"/>
      <line x1="${pad}" y1="10" x2="${pad}" y2="${h-pad}" stroke="#90A4AE"/>
      <polyline points="${path}" fill="none" stroke="#43A047" stroke-width="2.5"/>
      <text x="${pad}" y="10" font-size="10" fill="#607D8B">Rate</text>
      <text x="${w-40}" y="${h-10}" font-size="10" fill="#607D8B">Time →</text>
    </svg>`;
  }

  let playing=null;
  function tick(){
    const rate = render();
    history.push(rate);
    if(history.length>200) history.shift();
  }
  tick();

  document.getElementById('lightR').oninput = e=>{ light=+e.target.value; document.getElementById('lightVal').textContent=light+'%'; tick(); };
  document.getElementById('co2R').oninput = e=>{ co2=+e.target.value; document.getElementById('co2Val').textContent=co2+'%'; tick(); };
  document.getElementById('waterR').oninput = e=>{ water=+e.target.value; document.getElementById('waterVal').textContent=water+'%'; tick(); };
  document.getElementById('tempR').oninput = e=>{ temp=+e.target.value; document.getElementById('tempVal').textContent=temp+'°C'; tick(); };

  document.getElementById('playBtn').onclick=()=>{ if(playing) return; playing=registerInterval(tick,700); ctx.toast('Simulation running…'); };
  document.getElementById('pauseBtn').onclick=()=>{ clearInterval(playing); playing=null; };
  document.getElementById('randomBtn').onclick=()=>{
    light=Math.round(Math.random()*100); co2=+(Math.random()*2).toFixed(2); water=Math.round(Math.random()*100); temp=Math.round(Math.random()*50);
    document.getElementById('lightR').value=light; document.getElementById('co2R').value=co2; document.getElementById('waterR').value=water; document.getElementById('tempR').value=temp;
    document.getElementById('lightVal').textContent=light+'%'; document.getElementById('co2Val').textContent=co2+'%'; document.getElementById('waterVal').textContent=water+'%'; document.getElementById('tempVal').textContent=temp+'°C';
    tick();
  };
  document.getElementById('resetBtn').onclick=()=>{
    clearInterval(playing); playing=null; light=50;co2=0.6;water=60;temp=25; history.length=0;
    document.getElementById('lightR').value=50; document.getElementById('co2R').value=0.6; document.getElementById('waterR').value=60; document.getElementById('tempR').value=25;
    document.getElementById('lightVal').textContent='50%'; document.getElementById('co2Val').textContent='0.6%'; document.getElementById('waterVal').textContent='60%'; document.getElementById('tempVal').textContent='25°C';
    document.getElementById('obsBody').innerHTML=''; tick();
  };
  let recCount=0;
  document.getElementById('recordBtn').onclick=()=>{
    const rate = computeRate(light,co2,water,temp);
    recCount++;
    const row=document.createElement('tr');
    row.innerHTML=`<td>${recCount}</td><td>${light}</td><td>${co2}</td><td>${water}</td><td>${temp}</td><td>${rate.toFixed(0)}</td>`;
    document.getElementById('obsBody').appendChild(row);
    ctx.addXP(4);
    ctx.markProgress(ctx.sim.id, Math.min(90, 20+recCount*10));
  };
  document.getElementById('exportBtn').onclick=()=> ctx.toast('Observations exported (demo)');

  buildQuiz(document.getElementById('quizHolder'), 'photosynthesis', QUIZ, (score,total)=>{
    ctx.addXP(score*5); ctx.markProgress(ctx.sim.id,100);
    ctx.STATE.quizScores.photosynthesis=`${score}/${total}`; ctx.saveState();
  });
}};
})();
