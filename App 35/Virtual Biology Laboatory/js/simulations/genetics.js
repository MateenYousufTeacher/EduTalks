/* ===================== SIMULATION 8: GENETICS & HEREDITY LABORATORY ===================== */
(function(){

const TRAITS = {
  height: {name:'Plant Height', dom:'Tall (T)', rec:'Short (t)', domColor:'#43A047', recColor:'#A5D6A7'},
  color: {name:'Flower Colour', dom:'Purple (P)', rec:'White (p)', domColor:'#8E24AA', recColor:'#E1BEE7'},
  seed: {name:'Seed Shape', dom:'Round (R)', rec:'Wrinkled (r)', domColor:'#FB8C00', recColor:'#FFE0B2'},
};

const QUIZ = [
  {q:'An allele that masks the other in a heterozygote is called:', options:['Recessive','Dominant','Mutant','Neutral'], correct:1},
  {q:'The genetic makeup of an organism is its:', options:['Phenotype','Genotype','Karyotype','Ecotype'], correct:1},
  {q:'A cross between Tt × Tt is expected to give what phenotype ratio?', options:['1:1','3:1','1:2:1','9:3:3:1'], correct:1},
  {q:'An organism with two identical alleles (e.g. TT) is called:', options:['Heterozygous','Homozygous','Hybrid','Mutant'], correct:1},
  {q:'A Punnett square is used to predict:', options:['Protein structure','Possible offspring genotypes','Cell organelles','Photosynthesis rate'], correct:1},
  {q:'The observable characteristic of an organism is its:', options:['Genotype','Phenotype','Allele','Chromosome'], correct:1},
  {q:'A cross Tt × tt would give what genotype ratio?', options:['1 Tt : 1 tt','All TT','All tt','3 Tt : 1 tt'], correct:0},
  {q:'A sudden, heritable change in DNA is called a:', options:['Mutation','Translation','Transpiration','Reflex'], correct:0},
  {q:'If both parents are homozygous recessive (tt × tt), offspring will be:', options:['All Tt','All TT','All tt','Half Tt, half tt'], correct:2},
  {q:'Genetics is the branch of biology that studies:', options:['Digestion','Heredity and variation','Ecosystems','Nerve impulses'], correct:1},
];

function punnett(p1, p2){
  // p1, p2 are 2-char strings like 'Tt'
  const a = p1.split(''), b = p2.split('');
  const grid = [];
  a.forEach(x=>{ const row=[]; b.forEach(y=>{ row.push([x,y].sort((m,n)=> m===m.toUpperCase()?-1:1).join('')); }); grid.push(row); });
  return grid;
}

SIM_MODULES.genetics = { render(container, ctx){
  let traitKey = 'height';
  let parent1 = 'Tt', parent2 = 'Tt';

  container.innerHTML = `
  <div class="sim-layout">
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Punnett Square — Virtual Cross</h3>
        <div class="stage" id="punnettStage" style="min-height:340px"></div>
        <div class="controls-row">
          <button class="ctrl-btn primary" id="crossBtn">🧬 Perform Cross</button>
          <button class="ctrl-btn amber" id="resetBtn">↺ Reset</button>
          <button class="ctrl-btn" id="randomBtn">🎲 Randomize Parents</button>
        </div>
      </div>
      <div class="panel">
        <h3><span class="tag"></span>Offspring Prediction</h3>
        <div id="ratioBox" class="fact-box">Select parents and perform a cross to see the predicted ratio.</div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Observation Log — Crosses Performed</h3><table class="obs-table"><thead><tr><th>#</th><th>Trait</th><th>Cross</th><th>Genotype Ratio</th></tr></thead><tbody id="obsBody"></tbody></table></div>
    </div>
    <div>
      <div class="panel">
        <h3><span class="tag"></span>Choose Trait & Parents</h3>
        <div class="field"><label>Trait to study</label>
          <select id="traitSel"><option value="height">Plant Height (T/t)</option><option value="color">Flower Colour (P/p)</option><option value="seed">Seed Shape (R/r)</option></select>
        </div>
        <div class="field"><label>Parent 1 Genotype</label>
          <select id="p1Sel"><option value="TT">Homozygous Dominant (TT)</option><option value="Tt" selected>Heterozygous (Tt)</option><option value="tt">Homozygous Recessive (tt)</option></select>
        </div>
        <div class="field"><label>Parent 2 Genotype</label>
          <select id="p2Sel"><option value="TT">Homozygous Dominant (TT)</option><option value="Tt" selected>Heterozygous (Tt)</option><option value="tt">Homozygous Recessive (tt)</option></select>
        </div>
      </div>
      <div class="panel"><h3><span class="tag"></span>Learning Objectives</h3><ul style="font-size:13px;color:var(--text-soft);line-height:1.7;padding-left:18px"><li>Construct and interpret a Punnett square.</li><li>Differentiate genotype from phenotype.</li><li>Predict inheritance probability across a cross.</li></ul></div>
      <div class="panel"><h3><span class="tag"></span>Scientific Background</h3><p style="font-size:13px;color:var(--text-soft);line-height:1.7">Each parent contributes one allele per gene to offspring. Dominant alleles are expressed over recessive ones in heterozygotes, following Mendel's Law of Segregation.</p></div>
      <div class="panel"><h3><span class="tag"></span>Real-life Applications</h3><div class="fact-box">Plant & animal breeders use Punnett-square logic to predict desirable traits; genetic counsellors use it to estimate inheritance risk for certain conditions.</div></div>
      <div class="panel"><h3><span class="tag"></span>Common Misconceptions</h3><div class="warn-box">❌ "A 3:1 ratio means exactly 3 out of every 4 offspring." It's a probability — real litters/broods can vary due to chance.<br>❌ "Dominant traits are always more common in nature." Dominance describes expression in heterozygotes, not frequency in a population.</div></div>
      <div class="panel"><h3><span class="tag"></span>Interesting Facts</h3><div class="fact-box">🌱 Gregor Mendel discovered the basic laws of heredity using pea plants — tracking traits like seed shape and flower colour, just like this lab!</div></div>
      <div class="panel"><h3><span class="tag"></span>Mini Quiz</h3><div id="quizHolder"></div></div>
      <div class="panel"><h3><span class="tag"></span>Summary</h3><p style="font-size:13px;color:var(--text-soft)">Punnett squares combine parental alleles to predict offspring genotype & phenotype ratios — a foundation of classical genetics.</p></div>
    </div>
  </div>`;

  function drawPunnett(){
    const trait = TRAITS[traitKey];
    const grid = punnett(parent1, parent2);
    const domLetter = parent1[0].toUpperCase()===parent1[0] ? parent1[0] : parent1[1];
    let counts = {};
    grid.flat().forEach(g=>{ counts[g]=(counts[g]||0)+1; });
    let html = `<div style="width:100%">
      <p style="text-align:center;font-weight:700;margin-bottom:10px">${trait.name}: ${parent1} × ${parent2}</p>
      <table style="margin:0 auto;border-collapse:collapse">
        <tr><td></td>${parent2.split('').map(g=>`<td style="padding:10px;font-weight:700;text-align:center">${g}</td>`).join('')}</tr>
        ${grid.map((row,i)=>`<tr><td style="padding:10px;font-weight:700">${parent1[i]}</td>${row.map(g=>{
          const isDom = g[0]===g[0].toUpperCase() ? true : false;
          const hasDom = g.toLowerCase().split('').some(c=>c===c) && g[0]===g[0].toUpperCase();
          const dominant = g.split('').some(c=> c===c.toUpperCase() && c.toLowerCase()===domLetter.toLowerCase());
          return `<td style="padding:14px;border:2px solid var(--border);border-radius:10px;text-align:center;font-weight:700;background:${dominant?trait.domColor:trait.recColor};color:#fff">${g}</td>`;
        }).join('')}</tr>`).join('')}
      </table>
    </div>`;
    document.getElementById('punnettStage').innerHTML = html;

    let phenoCounts = {};
    Object.keys(counts).forEach(g=>{
      const dominant = g.split('').some(c=> c===c.toUpperCase());
      const label = dominant ? trait.dom : trait.rec;
      phenoCounts[label] = (phenoCounts[label]||0) + counts[g];
    });
    const total = grid.flat().length;
    const genoStr = Object.entries(counts).map(([g,c])=>`${g} (${c}/${total})`).join(', ');
    const phenoStr = Object.entries(phenoCounts).map(([p,c])=>`${p}: ${c}/${total}`).join(' — ');
    document.getElementById('ratioBox').innerHTML = `<b>Genotype ratio:</b> ${genoStr}<br><b>Phenotype ratio:</b> ${phenoStr}`;
    return {genoStr, phenoStr};
  }
  drawPunnett();

  document.getElementById('traitSel').onchange = e=>{ traitKey = e.target.value; drawPunnett(); };
  document.getElementById('p1Sel').onchange = e=>{ parent1 = e.target.value; drawPunnett(); };
  document.getElementById('p2Sel').onchange = e=>{ parent2 = e.target.value; drawPunnett(); };

  let rec=0;
  document.getElementById('crossBtn').onclick = ()=>{
    const {genoStr} = drawPunnett(); rec++;
    const row=document.createElement('tr'); row.innerHTML=`<td>${rec}</td><td>${TRAITS[traitKey].name}</td><td>${parent1} × ${parent2}</td><td>${genoStr}</td>`;
    document.getElementById('obsBody').appendChild(row);
    ctx.addXP(6); ctx.markProgress(ctx.sim.id, Math.min(90,20+rec*12));
  };
  document.getElementById('randomBtn').onclick = ()=>{
    const opts=['TT','Tt','tt'];
    parent1 = opts[Math.floor(Math.random()*3)]; parent2 = opts[Math.floor(Math.random()*3)];
    document.getElementById('p1Sel').value=parent1; document.getElementById('p2Sel').value=parent2;
    drawPunnett();
  };
  document.getElementById('resetBtn').onclick = ()=>{ parent1='Tt'; parent2='Tt'; document.getElementById('p1Sel').value='Tt'; document.getElementById('p2Sel').value='Tt'; document.getElementById('obsBody').innerHTML=''; drawPunnett(); };

  buildQuiz(document.getElementById('quizHolder'), 'genetics', QUIZ, (score,total)=>{
    ctx.addXP(score*5); ctx.markProgress(ctx.sim.id,100);
    ctx.STATE.quizScores.genetics=`${score}/${total}`; ctx.saveState();
  });
}};
})();
