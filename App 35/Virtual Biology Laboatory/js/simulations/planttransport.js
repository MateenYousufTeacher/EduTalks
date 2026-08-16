/* ===================== SIMULATION 7: PLANT TRANSPORT SYSTEM ===================== */
(function(){

const QUIZ = [
  {q:'Xylem transports mainly:', options:['Sugars from leaves','Water & minerals from roots','Oxygen','Waste products'], correct:1},
  {q:'Phloem transports mainly:', options:['Water only','Food (mainly sugars) made in leaves','Carbon dioxide','Pollen'], correct:1},
  {q:'The loss of water vapour from leaves is called:', options:['Translocation','Transpiration','Respiration','Germination'], correct:1},
  {q:'Higher temperature and lower humidity generally:', options:['Decrease transpiration','Increase transpiration','Stop water uptake','Have no effect'], correct:1},
  {q:'Movement of food substances through phloem is called:', options:['Transpiration','Translocation','Osmosis only','Diffusion only'], correct:1},
  {q:'Xylem vessels are made of:', options:['Living cells only','Dead, hollow cells forming tubes','Chlorophyll-rich cells','Muscle cells'], correct:1},
  {q:'Stomata are tiny pores mainly found on the:', options:['Roots','Underside of leaves','Flower petals','Stem bark'], correct:1},
  {q:'Wilting on a hot day usually indicates:', options:['Too much water uptake','Water loss exceeding water uptake','Excess phloem transport','Excess photosynthesis'], correct:1},
  {q:'Root hairs increase:', options:['Surface area for water & mineral absorption','Photosynthesis rate directly','Flower production','Seed dispersal'], correct:0},
  {q:'In low light, transpiration through open stomata tends to be:', options:['Higher than in bright light','Lower, as many stomata close','Completely stopped always','Unrelated to light'], correct:1},
];

function plantSVG(waterFlow, foodFlow, wilt){
  const leafOpacity = wilt ? 0.5 : 1;
  return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="330" width="400" height="70" fill="#795548" opacity="0.4"/>
    <path d="M200 330 L200 100" stroke="#6D4C41" stroke-width="10"/>
    <path d="M200 340 C 160 350 120 340 100 360 M200 340 C 240 350 280 340 300 360" stroke="#5D4037" stroke-width="4" fill="none"/>
    <!-- leaves -->
    <path d="M200 160 C 140 140 100 160 110 200 C 150 220 200 200 200 160 Z" fill="#66BB6A" opacity="${leafOpacity}"/>
    <path d="M200 120 C 260 100 300 130 285 165 C 245 180 200 160 200 120 Z" fill="#66BB6A" opacity="${leafOpacity}"/>
    <path d="M200 200 C 250 190 280 220 260 250 C 220 260 200 230 200 200 Z" fill="#81C784" opacity="${leafOpacity}"/>
    <!-- xylem path (blue, upward) -->
    ${Array.from({length:5}).map((_,i)=>`<circle r="3.5" fill="#1E88E5"><animateMotion dur="${(3/(waterFlow/50||0.1)).toFixed(2)}s" repeatCount="indefinite" begin="${i*0.5}s" path="M195 330 L195 110"/></circle>`).join('')}
    <!-- phloem path (green, downward from leaves to roots) -->
    ${Array.from({length:5}).map((_,i)=>`<circle r="3.5" fill="#2E7D32"><animateMotion dur="${(3/(foodFlow/50||0.1)).toFixed(2)}s" repeatCount="indefinite" begin="${i*0.5}s" path="M205 120 L205 330"/></circle>`).join('')}
    <!-- roots -->
    <path d="M200 330 C 170 350 150 370 130 390 M200 330 C 230 350 250 370 270 390 M200 330 C 200 360 200 380 200 400" stroke="#8D6E63" stroke-width="4" fill="none"/>
    <text x="20" y="30" font-size="12" fill="#1E88E5">💧 Xylem flow: ${waterFlow.toFixed(0)}%</text>
    <text x="20" y="50" font-size="12" fill="#2E7D32">🍬 Phloem flow: ${foodFlow.toFixed(0)}%</text>
    ${wilt?'<text x="150" y="70" font-size="13" fill="#D84315">⚠ Wilting!</text>':''}
  </svg>`;
}

SIM_MODULES.planttransport = { render(container, ctx){
  let temp=25, humidity=50, light=60, waterAvail=70;
  const history=[];

  container.innerHTML = `
  <div class="sim-layout">
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Live Visualization — Xylem & Phloem Transport</h3>
        <div class="stage" id="plantStage"></div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="randomBtn">🎲 Randomize Conditions</button>
          <button class="ctrl-btn amber" id="resetBtn">↺ Reset</button>
        </div>
        <div class="legend"><div class="item"><span class="sw" style="background:#1E88E5"></span>Xylem (water & minerals, upward)</div><div class="item"><span class="sw" style="background:#2E7D32"></span>Phloem (food, both directions)</div></div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Transpiration Rate — Live Graph</h3><div class="stage" id="graphStage" style="min-height:180px"></div></div>
      <div class="panel"><h3><span class="tag"></span>Observation Log</h3><table class="obs-table"><thead><tr><th>#</th><th>Temp</th><th>Humidity</th><th>Light</th><th>Transpiration</th></tr></thead><tbody id="obsBody"></tbody></table>
      <div class="controls-row"><button class="ctrl-btn" id="recordBtn">📌 Record Observation</button></div></div>
    </div>
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Adjustable Variables</h3>
        <div class="field"><label>Temperature <span class="val" id="tempVal">25°C</span></label><input type="range" id="tempR" min="0" max="50" value="25"></div>
        <div class="field"><label>Humidity <span class="val" id="humVal">50%</span></label><input type="range" id="humR" min="0" max="100" value="50"></div>
        <div class="field"><label>Light <span class="val" id="lightVal">60%</span></label><input type="range" id="lightR" min="0" max="100" value="60"></div>
        <div class="field"><label>Water Availability <span class="val" id="waterVal">70%</span></label><input type="range" id="waterR" min="0" max="100" value="70"></div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Learning Objectives</h3><ul style="font-size:13px;color:var(--text-soft);line-height:1.7;padding-left:18px"><li>Distinguish xylem and phloem function.</li><li>Explain factors affecting transpiration rate.</li><li>Predict when a plant will wilt.</li></ul></div>
      <div class="panel"><h3><span class="tag"></span>Scientific Background</h3><p style="font-size:13px;color:var(--text-soft);line-height:1.7">Xylem carries water and minerals upward from roots to leaves via transpiration pull. Phloem carries food (sugars) made in leaves to all parts of the plant — a process called translocation.</p></div>
      <div class="panel"><h3><span class="tag"></span>Real-life Applications</h3><div class="fact-box">Farmers time irrigation using knowledge of transpiration — watering more during hot, dry, low-humidity conditions to prevent wilting.</div></div>
      <div class="panel"><h3><span class="tag"></span>Common Misconceptions</h3><div class="warn-box">❌ "Phloem only moves food downward." Phloem moves food both up and down, depending on where it's needed (source-to-sink).<br>❌ "Xylem cells are alive and active pumps." Mature xylem vessels are actually dead, hollow tubes.</div></div>
      <div class="panel"><h3><span class="tag"></span>Interesting Facts</h3><div class="fact-box">🌳 Giant sequoia trees pull water over 100 metres up through xylem using transpiration pull alone — no pump required!</div></div>
      <div class="panel"><h3><span class="tag"></span>Mini Quiz</h3><div id="quizHolder"></div></div>
      <div class="panel"><h3><span class="tag"></span>Summary</h3><p style="font-size:13px;color:var(--text-soft)">Heat and low humidity speed up transpiration and water uptake through xylem; when water loss outpaces uptake, the plant wilts.</p></div>
    </div>
  </div>`;

  function computeTranspiration(){
    const tempF = temp/50;
    const humF = 1 - humidity/100;
    const lightF = light/100;
    const rate = Math.max(0, Math.min(100, (tempF*40 + humF*35 + lightF*25)));
    return rate;
  }
  function render(){
    const transp = computeTranspiration();
    const wilt = transp > waterAvail + 15;
    document.getElementById('plantStage').innerHTML = plantSVG(Math.min(100,waterAvail), Math.min(100, 40+light*0.4), wilt);
    history.push(transp); if(history.length>200) history.shift();
    drawGraph();
    return transp;
  }
  function drawGraph(){
    const w=460,h=170,pad=28;
    const pts = history.slice(-30);
    const path = pts.map((v,i)=>`${pad+i*((w-pad*2)/29)},${h-pad-(v/100)*(h-pad*2)}`).join(' ');
    document.getElementById('graphStage').innerHTML = `<svg viewBox="0 0 ${w} ${h}" style="width:100%">
      <line x1="${pad}" y1="${h-pad}" x2="${w-10}" y2="${h-pad}" stroke="#90A4AE"/>
      <line x1="${pad}" y1="10" x2="${pad}" y2="${h-pad}" stroke="#90A4AE"/>
      <polyline points="${path}" fill="none" stroke="#1E88E5" stroke-width="2.5"/>
      <text x="${pad}" y="24" font-size="10" fill="#1E88E5">Transpiration rate</text>
    </svg>`;
  }
  render();

  ['tempR','humR','lightR','waterR'].forEach(id=>{
    document.getElementById(id).oninput = e=>{
      if(id==='tempR'){ temp=+e.target.value; document.getElementById('tempVal').textContent=temp+'°C'; }
      if(id==='humR'){ humidity=+e.target.value; document.getElementById('humVal').textContent=humidity+'%'; }
      if(id==='lightR'){ light=+e.target.value; document.getElementById('lightVal').textContent=light+'%'; }
      if(id==='waterR'){ waterAvail=+e.target.value; document.getElementById('waterVal').textContent=waterAvail+'%'; }
      render();
    };
  });
  document.getElementById('randomBtn').onclick = ()=>{
    temp=Math.round(Math.random()*50); humidity=Math.round(Math.random()*100); light=Math.round(Math.random()*100); waterAvail=Math.round(Math.random()*100);
    document.getElementById('tempR').value=temp; document.getElementById('humR').value=humidity; document.getElementById('lightR').value=light; document.getElementById('waterR').value=waterAvail;
    document.getElementById('tempVal').textContent=temp+'°C'; document.getElementById('humVal').textContent=humidity+'%'; document.getElementById('lightVal').textContent=light+'%'; document.getElementById('waterVal').textContent=waterAvail+'%';
    render();
  };
  document.getElementById('resetBtn').onclick = ()=>{
    temp=25;humidity=50;light=60;waterAvail=70; history.length=0;
    document.getElementById('tempR').value=25; document.getElementById('humR').value=50; document.getElementById('lightR').value=60; document.getElementById('waterR').value=70;
    document.getElementById('tempVal').textContent='25°C'; document.getElementById('humVal').textContent='50%'; document.getElementById('lightVal').textContent='60%'; document.getElementById('waterVal').textContent='70%';
    document.getElementById('obsBody').innerHTML=''; render();
  };
  let rec=0;
  document.getElementById('recordBtn').onclick = ()=>{
    const transp = computeTranspiration(); rec++;
    const row=document.createElement('tr'); row.innerHTML=`<td>${rec}</td><td>${temp}°C</td><td>${humidity}%</td><td>${light}%</td><td>${transp.toFixed(0)}</td>`;
    document.getElementById('obsBody').appendChild(row);
    ctx.addXP(4); ctx.markProgress(ctx.sim.id, Math.min(90,20+rec*10));
  };

  buildQuiz(document.getElementById('quizHolder'), 'planttransport', QUIZ, (score,total)=>{
    ctx.addXP(score*5); ctx.markProgress(ctx.sim.id,100);
    ctx.STATE.quizScores.planttransport=`${score}/${total}`; ctx.saveState();
  });
}};
})();
