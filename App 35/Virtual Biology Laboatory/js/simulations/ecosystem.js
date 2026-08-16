/* ===================== SIMULATION 9: ECOSYSTEM & FOOD CHAIN SIMULATOR ===================== */
(function(){

const QUIZ = [
  {q:'The ultimate source of energy for almost all ecosystems is:', options:['Soil','The Sun','Water','Decomposers'], correct:1},
  {q:'Organisms that make their own food are called:', options:['Herbivores','Producers','Decomposers','Carnivores'], correct:1},
  {q:'Decomposers mainly help ecosystems by:', options:['Producing oxygen only','Breaking down dead matter & recycling nutrients','Eating other decomposers','Absorbing sunlight'], correct:1},
  {q:'A food web is best described as:', options:['A single straight chain','Multiple interconnected food chains','Only producers','Only decomposers'], correct:1},
  {q:'Removing a top predator from an ecosystem often causes:', options:['No change at all','Herbivore population to rise sharply','Immediate extinction of producers','Increase in sunlight'], correct:1},
  {q:'Energy flow through a food chain is generally:', options:['Cyclic and reused','One-directional, decreasing at each level','Increasing at each level','Constant at every level'], correct:1},
  {q:'Pollution in an ecosystem most directly tends to:', options:['Increase biodiversity','Stress or reduce sensitive populations','Have no ecological effect','Only affect producers'], correct:1},
  {q:'An omnivore is an organism that:', options:['Eats only plants','Eats only meat','Eats both plants and animals','Eats only decomposed matter'], correct:2},
  {q:'A sudden drop in rainfall in a grassland ecosystem would most likely:', options:['Increase plant growth sharply','Reduce producer biomass, stressing herbivores','Have no effect on any organism','Only affect decomposers'], correct:1},
  {q:'Ecological balance refers to:', options:['One species dominating completely','A relatively stable relationship among populations & environment','Total absence of predators','Zero energy flow'], correct:1},
];

const SPECIES = {
  plant:{icon:'🌾', role:'producer', label:'Plant'},
  herbivore:{icon:'🐇', role:'herbivore', label:'Herbivore'},
  carnivore:{icon:'🦊', role:'carnivore', label:'Carnivore'},
  omnivore:{icon:'🐗', role:'omnivore', label:'Omnivore'},
  decomposer:{icon:'🍄', role:'decomposer', label:'Decomposer'},
};

SIM_MODULES.ecosystem = { render(container, ctx){
  let pop = {plant:60, herbivore:25, carnivore:8, omnivore:10, decomposer:15};
  let rainfall=60, temperature=25, pollution=10;
  const history=[];

  container.innerHTML = `
  <div class="sim-layout">
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Build Your Ecosystem</h3>
        <div class="stage" id="ecoStage" style="min-height:300px"></div>
        <div class="controls-row">
          ${Object.keys(SPECIES).map(k=>`<button class="ctrl-btn" data-add="${k}">${SPECIES[k].icon} +${SPECIES[k].label}</button>`).join('')}
        </div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="simulateBtn">▶ Simulate 1 Season</button>
          <button class="ctrl-btn amber" id="resetBtn">↺ Reset</button>
        </div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Population Over Time — Live Graph</h3><div class="stage" id="graphStage" style="min-height:190px"></div></div>
      <div class="panel"><h3><span class="tag"></span>Observation Log</h3><table class="obs-table"><thead><tr><th>Season</th><th>Plants</th><th>Herbivores</th><th>Carnivores</th><th>Omnivores</th><th>Decomposers</th></tr></thead><tbody id="obsBody"></tbody></table></div>
    </div>
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Environmental Variables</h3>
        <div class="field"><label>Rainfall <span class="val" id="rainVal">60%</span></label><input type="range" id="rainR" min="0" max="100" value="60"></div>
        <div class="field"><label>Temperature <span class="val" id="tempVal">25°C</span></label><input type="range" id="tempR" min="0" max="50" value="25"></div>
        <div class="field"><label>Pollution <span class="val" id="pollVal">10%</span></label><input type="range" id="pollR" min="0" max="100" value="10"></div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Learning Objectives</h3><ul style="font-size:13px;color:var(--text-soft);line-height:1.7;padding-left:18px"><li>Build a food web from producers to decomposers.</li><li>Predict effects of climate & pollution on populations.</li><li>Explain energy flow and ecological balance.</li></ul></div>
      <div class="panel"><h3><span class="tag"></span>Scientific Background</h3><p style="font-size:13px;color:var(--text-soft);line-height:1.7">Energy flows from producers to herbivores to carnivores, decreasing at each trophic level (~10% rule). Decomposers recycle nutrients back into the soil, sustaining producers.</p></div>
      <div class="panel"><h3><span class="tag"></span>Real-life Applications</h3><div class="fact-box">Conservationists model food webs to predict effects of habitat loss, invasive species, or climate change on entire ecosystems.</div></div>
      <div class="panel"><h3><span class="tag"></span>Common Misconceptions</h3><div class="warn-box">❌ "Removing one predator only affects its direct prey." Effects often cascade through multiple trophic levels (trophic cascade).<br>❌ "More rainfall is always better." Excess rainfall can also stress some ecosystems through flooding or nutrient runoff.</div></div>
      <div class="panel"><h3><span class="tag"></span>Interesting Facts</h3><div class="fact-box">🐺 Reintroducing wolves to Yellowstone National Park famously changed river courses — by controlling herbivores that had been overgrazing vegetation!</div></div>
      <div class="panel"><h3><span class="tag"></span>Mini Quiz</h3><div id="quizHolder"></div></div>
      <div class="panel"><h3><span class="tag"></span>Summary</h3><p style="font-size:13px;color:var(--text-soft)">Populations of producers, consumers and decomposers stay balanced through feeding relationships — disturbed by climate extremes or pollution.</p></div>
    </div>
  </div>`;

  function ecoStageHTML(){
    let html = `<div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:flex-end;width:100%;padding:10px">`;
    Object.keys(pop).forEach(k=>{
      const count = Math.max(0, Math.round(pop[k]));
      html += `<div style="text-align:center">
        <div style="font-size:${18+Math.min(30,count/3)}px">${SPECIES[k].icon.repeat(Math.min(6, Math.max(1,Math.round(count/12))))}</div>
        <div style="font-size:11px;font-weight:700;margin-top:4px">${SPECIES[k].label}</div>
        <div style="font-size:11px;color:var(--text-soft)">${count}</div>
      </div>`;
    });
    html += `</div>`;
    return html;
  }
  function render(){ document.getElementById('ecoStage').innerHTML = ecoStageHTML(); drawGraph(); }
  function drawGraph(){
    const w=460,h=180,pad=28;
    const colors = {plant:'#43A047', herbivore:'#8D6E63', carnivore:'#E53935', omnivore:'#FB8C00', decomposer:'#6D4C41'};
    let svg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%">
      <line x1="${pad}" y1="${h-pad}" x2="${w-10}" y2="${h-pad}" stroke="#90A4AE"/>
      <line x1="${pad}" y1="10" x2="${pad}" y2="${h-pad}" stroke="#90A4AE"/>`;
    Object.keys(pop).forEach(k=>{
      const pts = history.slice(-20).map(h_=>h_[k]);
      const path = pts.map((v,i)=>`${pad+i*((w-pad*2)/19)},${h-pad-(Math.min(100,v)/100)*(h-pad*2)}`).join(' ');
      svg += `<polyline points="${path}" fill="none" stroke="${colors[k]}" stroke-width="2"/>`;
    });
    svg += `</svg>`;
    document.getElementById('graphStage').innerHTML = svg;
  }
  history.push({...pop});
  render();

  document.querySelectorAll('[data-add]').forEach(btn=>{
    btn.onclick = ()=>{ pop[btn.dataset.add] += 8; render(); ctx.addXP(1); };
  });

  let season=0;
  document.getElementById('simulateBtn').onclick = ()=>{
    season++;
    const rainF = (rainfall-50)/50;      // -1..1
    const tempF = (temperature-25)/25;   // -1..1
    const pollF = pollution/100;         // 0..1

    // producers grow with rain, shrink with pollution & extreme temp
    pop.plant *= 1 + 0.12*rainF - 0.15*pollF - 0.05*Math.abs(tempF);
    pop.plant = Math.max(2, pop.plant);

    // herbivores follow plant availability
    pop.herbivore *= 1 + 0.08*(pop.plant/60-1) - 0.10*pollF;
    pop.herbivore = Math.max(1, pop.herbivore);

    // carnivores follow herbivore availability
    pop.carnivore *= 1 + 0.10*(pop.herbivore/25-1) - 0.12*pollF;
    pop.carnivore = Math.max(0.5, pop.carnivore);

    // omnivores use both plants and herbivores
    pop.omnivore *= 1 + 0.05*(pop.plant/60-1) + 0.05*(pop.herbivore/25-1) - 0.10*pollF;
    pop.omnivore = Math.max(0.5, pop.omnivore);

    // decomposers benefit from more biomass, hurt badly by pollution
    pop.decomposer *= 1 + 0.04*((pop.plant+pop.herbivore)/85-1) - 0.18*pollF;
    pop.decomposer = Math.max(1, pop.decomposer);

    Object.keys(pop).forEach(k=> pop[k]=Math.min(150,pop[k]));
    history.push({...pop});
    render();

    const row=document.createElement('tr');
    row.innerHTML = `<td>${season}</td><td>${Math.round(pop.plant)}</td><td>${Math.round(pop.herbivore)}</td><td>${Math.round(pop.carnivore)}</td><td>${Math.round(pop.omnivore)}</td><td>${Math.round(pop.decomposer)}</td>`;
    document.getElementById('obsBody').appendChild(row);
    ctx.addXP(5); ctx.markProgress(ctx.sim.id, Math.min(95,20+season*10));

    if(pop.plant<5 || pop.herbivore<2) ctx.toast('⚠️ Ecosystem is becoming unstable!');
  };

  document.getElementById('rainR').oninput = e=>{ rainfall=+e.target.value; document.getElementById('rainVal').textContent=rainfall+'%'; };
  document.getElementById('tempR').oninput = e=>{ temperature=+e.target.value; document.getElementById('tempVal').textContent=temperature+'°C'; };
  document.getElementById('pollR').oninput = e=>{ pollution=+e.target.value; document.getElementById('pollVal').textContent=pollution+'%'; };

  document.getElementById('resetBtn').onclick = ()=>{
    pop = {plant:60, herbivore:25, carnivore:8, omnivore:10, decomposer:15};
    rainfall=60; temperature=25; pollution=10; season=0; history.length=0;
    document.getElementById('rainR').value=60; document.getElementById('tempR').value=25; document.getElementById('pollR').value=10;
    document.getElementById('rainVal').textContent='60%'; document.getElementById('tempVal').textContent='25°C'; document.getElementById('pollVal').textContent='10%';
    document.getElementById('obsBody').innerHTML='';
    history.push({...pop}); render();
  };

  buildQuiz(document.getElementById('quizHolder'), 'ecosystem', QUIZ, (score,total)=>{
    ctx.addXP(score*5); ctx.markProgress(ctx.sim.id,100);
    ctx.STATE.quizScores.ecosystem=`${score}/${total}`; ctx.saveState();
  });
}};
})();
