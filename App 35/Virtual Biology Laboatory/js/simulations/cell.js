/* ===================== SIMULATION 1: CELL STRUCTURE EXPLORER ===================== */
(function(){

const ORGANELLES = {
  animal:[
    {id:'membrane', name:'Cell Membrane', cx:250, cy:200, r:170, shape:'ellipse', fill:'rgba(25,118,210,0.10)', stroke:'#1976D2', fn:'A thin, selectively permeable boundary that controls what enters and leaves the cell.'},
    {id:'nucleus', name:'Nucleus', cx:250, cy:190, r:55, fill:'#7E57C2', fn:'Control centre of the cell; houses DNA and directs all cell activities.'},
    {id:'nucleolus', name:'Nucleolus', cx:250, cy:190, r:16, fill:'#4A148C', fn:'Site inside the nucleus where ribosomes are assembled.'},
    {id:'mito1', name:'Mitochondrion', cx:150, cy:260, r:24, fill:'#E53935', fn:'The "powerhouse" — releases energy (ATP) by respiration.'},
    {id:'mito2', name:'Mitochondrion', cx:340, cy:120, r:22, fill:'#E53935', fn:'The "powerhouse" — releases energy (ATP) by respiration.'},
    {id:'golgi', name:'Golgi Body', cx:340, cy:250, r:28, fill:'#FB8C00', fn:'Packages, modifies and ships proteins to their destination.'},
    {id:'er', name:'Endoplasmic Reticulum', cx:170, cy:130, r:30, fill:'#26A69A', fn:'A network of membranes that transports proteins and lipids through the cell.'},
    {id:'ribo', name:'Ribosomes', cx:220, cy:280, r:8, fill:'#5D4037', fn:'Tiny structures that synthesise (build) proteins.'},
    {id:'lyso', name:'Lysosome', cx:300, cy:300, r:14, fill:'#AD1457', fn:'Contains digestive enzymes that break down waste and worn-out parts.'},
  ],
  plant:[
    {id:'wall', name:'Cell Wall', cx:250, cy:200, r:185, shape:'rect', fill:'rgba(67,160,71,0.10)', stroke:'#2E7D32', fn:'A rigid outer layer of cellulose that gives the cell shape and support.'},
    {id:'membrane', name:'Cell Membrane', cx:250, cy:200, r:170, shape:'rect', fill:'rgba(25,118,210,0.08)', stroke:'#1976D2', fn:'Selectively permeable layer just inside the cell wall, controlling movement of substances.'},
    {id:'vacuole', name:'Vacuole (large, central)', cx:250, cy:210, r:95, fill:'rgba(38,198,218,0.35)', stroke:'#26C6DA', fn:'Large fluid-filled sac that maintains turgor pressure, keeping the plant firm.'},
    {id:'nucleus', name:'Nucleus', cx:150, cy:130, r:38, fill:'#7E57C2', fn:'Control centre; houses DNA and directs cell activities.'},
    {id:'chloro1', name:'Chloroplast', cx:350, cy:150, r:26, fill:'#43A047', fn:'Site of photosynthesis — converts light energy into glucose.'},
    {id:'chloro2', name:'Chloroplast', cx:130, cy:280, r:24, fill:'#43A047', fn:'Site of photosynthesis — converts light energy into glucose.'},
    {id:'mito1', name:'Mitochondrion', cx:340, cy:280, r:20, fill:'#E53935', fn:'Releases energy (ATP) by respiration.'},
    {id:'golgi', name:'Golgi Body', cx:170, cy:320, r:20, fill:'#FB8C00', fn:'Packages and ships proteins and materials for the cell wall.'},
    {id:'er', name:'Endoplasmic Reticulum', cx:360, cy:90, r:22, fill:'#26A69A', fn:'Transports proteins and lipids through the cell.'},
  ]
};

function svgFor(type, highlightId){
  const parts = ORGANELLES[type];
  let svg = `<svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">`;
  parts.forEach(p=>{
    const active = highlightId===p.id;
    const strokeW = active ? 4 : (p.stroke?2:0);
    if(p.shape==='rect'){
      svg += `<rect data-id="${p.id}" x="${p.cx-p.r}" y="${p.cy-p.r*0.8}" width="${p.r*2}" height="${p.r*1.6}" rx="60" fill="${p.fill}" stroke="${active?'#FFB300':p.stroke||'none'}" stroke-width="${strokeW}" style="cursor:pointer"/>`;
    } else {
      svg += `<circle data-id="${p.id}" cx="${p.cx}" cy="${p.cy}" r="${p.r}" fill="${p.fill}" stroke="${active?'#FFB300':p.stroke||'none'}" stroke-width="${strokeW}" style="cursor:pointer"/>`;
    }
  });
  svg += `</svg>`;
  return svg;
}

function legendFor(type){
  return ORGANELLES[type].map(p=>`<div class="item"><span class="sw" style="background:${p.fill.startsWith('rgba')?p.stroke:p.fill}"></span>${p.name}</div>`).join('');
}

const QUIZ = [
  {q:'Which organelle is called the "powerhouse of the cell"?', options:['Nucleus','Mitochondrion','Golgi body','Ribosome'], correct:1},
  {q:'Which structure is found ONLY in plant cells among these?', options:['Cell membrane','Nucleus','Chloroplast','Mitochondrion'], correct:2},
  {q:'What controls all activities of the cell?', options:['Cytoplasm','Nucleus','Vacuole','Cell wall'], correct:1},
  {q:'Which organelle packages and ships proteins?', options:['Golgi body','Lysosome','Ribosome','Nucleolus'], correct:0},
  {q:'The large central vacuole in a plant cell mainly maintains:', options:['DNA storage','Turgor pressure','Photosynthesis','Cell division'], correct:1},
  {q:'Ribosomes are the site of:', options:['Respiration','Photosynthesis','Protein synthesis','Waste digestion'], correct:2},
  {q:'Which gives a plant cell its rigid, fixed shape?', options:['Cell membrane','Cell wall','Nucleus','Vacuole'], correct:1},
  {q:'Lysosomes are best described as containing:', options:['Digestive enzymes','Chlorophyll','Genetic material','Starch grains'], correct:0},
  {q:'The nucleolus is found inside the:', options:['Mitochondrion','Golgi body','Nucleus','Vacuole'], correct:2},
  {q:'Which organelle converts light energy into glucose?', options:['Mitochondrion','Chloroplast','Ribosome','Golgi body'], correct:1},
];

SIM_MODULES.cell = { render(container, ctx){
  let type = 'animal', selected = null;

  container.innerHTML = `
  <div class="sim-layout">
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Live Cell Visualization</h3>
        <div class="stage" id="cellStage">${svgFor(type)}</div>
        <div class="legend" id="cellLegend">${legendFor(type)}</div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="toggleType">🔄 Switch to Plant Cell</button>
          <button class="ctrl-btn" id="compareBtn">⚖️ Compare Plant vs Animal</button>
          <button class="ctrl-btn" id="resetBtn">↺ Reset</button>
          <button class="ctrl-btn amber" id="screenshotBtn">📸 Screenshot</button>
        </div>
      </div>
      <div class="panel" id="infoBox">
        <h3><span class="tag"></span>Organelle Information</h3>
        <p id="infoText" style="font-size:13.5px; line-height:1.6; color:var(--text-soft)">Tap any organelle in the diagram above to learn its structure and function.</p>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Observation Log</h3>
        <table class="obs-table"><thead><tr><th>#</th><th>Organelle Explored</th><th>Function Noted</th></tr></thead><tbody id="obsBody"></tbody></table>
      </div>
    </div>
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Learning Objectives</h3>
        <ul style="font-size:13px; line-height:1.7; padding-left:18px; color:var(--text-soft)">
          <li>Identify major organelles in animal & plant cells.</li>
          <li>Explain the function of each organelle.</li>
          <li>Compare and contrast plant vs animal cell structure.</li>
        </ul>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Scientific Background</h3>
        <p style="font-size:13px; line-height:1.7; color:var(--text-soft)">The cell is the basic structural and functional unit of life. Eukaryotic cells contain a membrane-bound nucleus and specialised organelles, each performing a distinct role that together sustains the cell.</p>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Real-life Applications</h3>
        <div class="fact-box">Understanding organelles underpins medicine (e.g. mitochondrial disease), agriculture (chloroplast efficiency & crop yield), and biotechnology (using Golgi/ER pathways to produce insulin in engineered cells).</div>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Common Misconceptions</h3>
        <div class="warn-box">❌ "All cells have chloroplasts." Only plant & some protist cells do.<br>❌ "The nucleus is the biggest organelle." The central vacuole in mature plant cells is often larger.</div>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Interesting Facts</h3>
        <div class="fact-box">🔎 A single leaf cell can contain 40–200 chloroplasts. Human liver cells may contain over 1,000 mitochondria to meet high energy demand!</div>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Mini Quiz (10 Questions)</h3>
        <div id="quizHolder"></div>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Summary</h3>
        <p style="font-size:13px; color:var(--text-soft); line-height:1.6">Both animal and plant cells share membrane, nucleus, mitochondria and ribosomes — but plant cells add a cell wall, chloroplasts and a large vacuole, reflecting their role in photosynthesis and structural support.</p>
      </div>
    </div>
  </div>`;

  const logged = new Set();
  function log(p){
    if(logged.has(p.id)) return;
    logged.add(p.id);
    const row = document.createElement('tr');
    row.innerHTML = `<td>${logged.size}</td><td>${p.name}</td><td>${p.fn}</td>`;
    document.getElementById('obsBody').appendChild(row);
    ctx.addXP(3);
    ctx.markProgress(ctx.sim.id, Math.min(100, 20 + logged.size*8));
  }

  function redraw(){
    document.getElementById('cellStage').innerHTML = svgFor(type, selected);
    document.getElementById('cellLegend').innerHTML = legendFor(type);
    attachClicks();
  }
  function attachClicks(){
    document.querySelectorAll('#cellStage [data-id]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const p = ORGANELLES[type].find(o=>o.id===el.dataset.id);
        selected = p.id;
        document.getElementById('infoText').innerHTML = `<b style="color:var(--text)">${p.name}:</b> ${p.fn}`;
        log(p);
        redraw();
      });
    });
  }
  attachClicks();

  document.getElementById('toggleType').onclick = ()=>{
    type = type==='animal' ? 'plant' : 'animal';
    selected=null;
    document.getElementById('toggleType').textContent = type==='animal' ? '🔄 Switch to Plant Cell' : '🔄 Switch to Animal Cell';
    redraw();
    ctx.toast(`Now viewing: ${type==='animal'?'Animal':'Plant'} Cell`);
  };
  document.getElementById('resetBtn').onclick = ()=>{ selected=null; logged.clear(); document.getElementById('obsBody').innerHTML=''; document.getElementById('infoText').textContent='Tap any organelle in the diagram above to learn its structure and function.'; redraw(); };
  document.getElementById('screenshotBtn').onclick = ()=> ctx.toast('Diagram captured to Observations (demo)');
  document.getElementById('compareBtn').onclick = ()=>{
    document.getElementById('cellStage').innerHTML = `<div style="display:flex; gap:10px; width:100%;"><div style="flex:1">${svgFor('animal')}<p style="text-align:center;font-size:12px;font-weight:700">Animal Cell</p></div><div style="flex:1">${svgFor('plant')}<p style="text-align:center;font-size:12px;font-weight:700">Plant Cell</p></div></div>`;
  };

  buildQuiz(document.getElementById('quizHolder'), 'cell', QUIZ, (score,total)=>{
    ctx.addXP(score*5);
    ctx.markProgress(ctx.sim.id, 100);
    ctx.STATE.quizScores.cell = `${score}/${total}`;
    ctx.saveState();
  });
}};
})();
