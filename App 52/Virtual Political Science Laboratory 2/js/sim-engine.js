/* ============================================================
   SIMULATION ENGINE
   Renders any simulation definition: scenario -> choice ->
   outcome -> concept -> next stage -> adaptive quiz -> completion.
   ============================================================ */

const SimEngine = (() => {
  let currentDef = null;
  let currentStageIndex = 0;
  let choiceMade = false;

  function render(def, progress){
    currentDef = def;
    currentStageIndex = Math.min(progress.stageIndex || 0, def.stages.length - 1);
    choiceMade = false;
    if((progress.stageIndex||0) >= def.stages.length){
      renderQuiz();
      return;
    }
    renderHeaderAndStage();
  }

  function container(){ return document.getElementById('sim-container'); }

  function renderHeaderAndStage(){
    const def = currentDef;
    const totalUnits = def.stages.length + 1; // stages + quiz
    const pct = Math.round((currentStageIndex/totalUnits)*100);

    container().innerHTML = `
      <div class="sim-header">
        <div class="sim-badge">${Lab.ICONS[def.id]||'📘'}</div>
        <h2>${def.title}</h2>
        <div class="objective">${def.objective}</div>
      </div>
      <div class="progress-label"><span>Simulation progress</span><span>${pct}%</span></div>
      <div class="progress-track"><div style="width:${pct}%"></div></div>
      <div class="stage-wrap" id="stage-wrap"></div>
    `;
    renderStage();
  }

  function renderStage(){
    const def = currentDef;
    const stage = def.stages[currentStageIndex];
    choiceMade = false;
    const wrap = document.getElementById('stage-wrap');
    wrap.innerHTML = `
      <div class="stage-kicker">Scenario ${currentStageIndex+1} of ${def.stages.length}</div>
      <div class="stage-title">${stage.title}</div>
      <div class="stage-text">${stage.text}</div>
      <div class="choice-list" id="choice-list">
        ${stage.choices.map((c,i)=>`
          <button class="choice-btn" data-i="${i}" onclick="SimEngine.selectChoice(${i})">
            <span class="letter">${String.fromCharCode(65+i)}</span>
            <span>${c.label}</span>
          </button>`).join('')}
      </div>
      <div id="stage-result"></div>
    `;
  }

  function selectChoice(i){
    if(choiceMade) return;
    choiceMade = true;
    const def = currentDef;
    const stage = def.stages[currentStageIndex];
    const choice = stage.choices[i];

    document.querySelectorAll('#choice-list .choice-btn').forEach((b,idx)=>{
      b.disabled = true;
      if(idx === i) b.classList.add('selected');
      b.style.opacity = idx===i ? '1' : '0.55';
    });

    const outcomeClass = choice.outcome === 'good' ? 'good' : choice.outcome === 'mixed' ? 'mixed' : 'poor';
    const tag = choice.outcome === 'good' ? 'Strong civic outcome' : choice.outcome === 'mixed' ? 'Mixed / trade-off outcome' : 'Weak outcome — reconsider';

    const resultEl = document.getElementById('stage-result');
    resultEl.innerHTML = `
      <div class="outcome-box ${outcomeClass}">
        <div class="ob-tag">${tag}</div>
        <p>${choice.feedback}</p>
      </div>
      <div class="concept-box">
        <div class="cb-tag">Concept</div>
        <p>${stage.concept}</p>
      </div>
      <div class="stage-actions">
        <button class="btn btn-primary btn-block" onclick="SimEngine.nextStage()">
          ${currentStageIndex+1 < def.stages.length ? 'Continue' : 'Go to Mini Quiz'} →
        </button>
      </div>
    `;
  }

  function nextStage(){
    const def = currentDef;
    currentStageIndex++;
    Lab.setProgress(def.id, {stageIndex: currentStageIndex});
    if(currentStageIndex >= def.stages.length){
      renderQuiz();
    } else {
      renderHeaderAndStage();
    }
  }

  function renderQuiz(){
    QuizEngine.renderInline(currentDef, {
      onComplete: (score, total) => {
        Lab.setProgress(currentDef.id, {
          status:'completed',
          stageIndex: currentDef.stages.length,
          quizScore: score,
          quizTotal: total,
          attempts: (Lab.getProgress(currentDef.id).attempts||0) + 1
        });
        if(score === total) Lab.unlockBadge('perfect_'+currentDef.id);
        Lab.unlockBadge('complete_'+currentDef.id);
        Achievements.checkAllComplete();
        renderCompletion(score, total);
      },
      container: container()
    });
  }

  function renderCompletion(score, total){
    const def = currentDef;
    const pct = Math.round(score/total*100);
    container().innerHTML = `
      <div class="sim-header">
        <div class="sim-badge">🏆</div>
        <h2>Simulation Complete</h2>
        <div class="objective">${def.title} — you scored ${score}/${total} (${pct}%) on the mini quiz.</div>
      </div>
      <div class="glass-card" style="text-align:center;">
        <p class="small-muted">Progress saved. Revisit anytime from Home or Continue Learning.</p>
        <div class="stage-actions" style="margin-top:14px;">
          <button class="btn btn-secondary btn-block" onclick="SimEngine.render(Lab.getSim('${def.id}'), {stageIndex:0})">Replay Simulation</button>
          <button class="btn btn-primary btn-block" onclick="Lab.goHome()">Back to Home</button>
        </div>
      </div>
    `;
  }

  return { render, selectChoice, nextStage };
})();
