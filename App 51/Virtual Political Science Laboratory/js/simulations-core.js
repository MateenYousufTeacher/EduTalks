/* ============================================================
   SIMULATIONS FRAMEWORK
   Generic shell: every simulation gets Overview / Simulate /
   Data & Notes / Quiz / Summary tabs. Only "Simulate" is custom
   per simulation; the rest are generated from a config object.
   ============================================================ */
const VPSL_SIMULATIONS = {};

function vpslBuildShell(container, def){
  const tabs = [
    {id:'overview', label:'📘 Overview'},
    {id:'simulate', label:'🧪 Simulate'},
    {id:'notes', label:'📝 Data & Notes'},
    {id:'quiz', label:'🎯 Quiz'},
    {id:'summary', label:'✅ Summary'},
  ];
  container.innerHTML = `
    <div class="sim-header">
      <div class="eyebrow">Simulation ${String(def.sim.num).padStart(2,'0')} · ${def.category||'Political Science'}</div>
      <h2>${def.sim.icon} ${def.sim.title}</h2>
      <p>${def.sim.tagline}</p>
    </div>
    <div class="tabs">
      ${tabs.map((t,i)=>`<button class="tab-btn ${i===0?'active':''}" data-tab="${t.id}">${t.label}</button>`).join('')}
    </div>
    <div class="tab-panel active" data-panel="overview"></div>
    <div class="tab-panel" data-panel="simulate"></div>
    <div class="tab-panel" data-panel="notes"></div>
    <div class="tab-panel" data-panel="quiz"></div>
    <div class="tab-panel" data-panel="summary"></div>
  `;
  container.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      container.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      container.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add('active');
    });
  });
  return {
    panel(name){ return container.querySelector(`.tab-panel[data-panel="${name}"]`); },
  };
}

function vpslRenderOverview(panel, meta){
  panel.innerHTML = `
    <div class="panel-grid">
      <div>
        <div class="glass card">
          <h4>🎯 Learning Objectives</h4>
          <ul>${meta.objectives.map(o=>`<li>${o}</li>`).join('')}</ul>
        </div>
        <div class="glass card">
          <h4>📚 Background Concepts</h4>
          <p>${meta.background}</p>
        </div>
        <div class="glass card">
          <h4>⚖️ Constitutional Principles at Play</h4>
          <ul>${meta.constitutionalPrinciples.map(o=>`<li>${o}</li>`).join('')}</ul>
        </div>
      </div>
      <div>
        <div class="glass card">
          <h4>🌍 Real-Life Relevance</h4>
          <p>${meta.realLife}</p>
        </div>
        <div class="glass card">
          <h4>⚠️ Common Misconceptions</h4>
          <ul>${meta.misconceptions.map(o=>`<li>${o}</li>`).join('')}</ul>
        </div>
        <div class="glass card">
          <h4>💡 Interesting Facts</h4>
          <ul>${meta.facts.map(o=>`<li>${o}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  `;
}

function vpslRenderNotes(panel, simId){
  function draw(){
    const notes = VPSL_STORE.state.notes.filter(n=>n.simId===simId);
    panel.innerHTML = `
      <div class="glass card">
        <h4>🖊️ Record an Observation</h4>
        <p>Write down what you noticed while running this simulation — a pattern, a surprising outcome, or a question.</p>
        <textarea id="note-input" placeholder="e.g. When I raised transparency but kept media freedom low, trust rose slower than expected..."></textarea>
        <div class="btn-row"><button class="btn-sm primary" id="note-save">Save Note</button></div>
      </div>
      <div class="glass card">
        <h4>📋 Saved Observations (${notes.length})</h4>
        ${notes.length ? `<table><thead><tr><th>Date</th><th>Note</th></tr></thead><tbody>
          ${notes.slice().reverse().map(n=>`<tr><td style="white-space:nowrap;">${new Date(n.ts).toLocaleDateString()}</td><td>${n.text}</td></tr>`).join('')}
        </tbody></table>` : `<p style="color:var(--text-secondary);font-size:13px;">No notes yet for this simulation.</p>`}
      </div>
    `;
    panel.querySelector('#note-save').addEventListener('click', ()=>{
      const val = panel.querySelector('#note-input').value.trim();
      if(!val){ VPSL_UI.toast('Write something first','✍️'); return; }
      VPSL_STORE.addNote(simId, val);
      VPSL_UI.toast('Note saved','📝');
      draw();
    });
  }
  draw();
}

function vpslRenderQuiz(panel, questions, simId){
  VPSL_QUIZ.render(panel, VPSL_QUIZ.shuffle(questions), simId);
}

function vpslRenderSummary(panel, def){
  const done = VPSL_STORE.state.simsCompleted.includes(def.sim.id);
  panel.innerHTML = `
    <div class="glass card">
      <h4>✅ Summary</h4>
      <p>${def.summary}</p>
    </div>
    <div class="glass card" style="text-align:center;">
      <div style="font-size:32px;">${done?'🏅':'🎓'}</div>
      <h4 style="justify-content:center;">${done?'Simulation Completed':'Mark this simulation complete'}</h4>
      <p>Completing a simulation confirms you've explored its scenario, taken a quiz, and recorded at least one observation.</p>
      <div class="btn-row" style="justify-content:center;">
        <button class="btn-sm green" id="mark-complete" ${done?'disabled':''}>${done?'Completed ✓':'Mark as Complete (+40 XP)'}</button>
        <button class="btn-sm" id="reset-sim">Reset Simulation</button>
      </div>
    </div>
  `;
  panel.querySelector('#mark-complete').addEventListener('click', ()=>{
    VPSL_UI.updateSimProgress(def.sim.id, 100);
    VPSL_UI.toast('Simulation marked complete! +40 XP','🏅');
    vpslRenderSummary(panel, def);
  });
  panel.querySelector('#reset-sim').addEventListener('click', ()=>{
    if(confirm('Reset this simulation\'s interactive state? Notes and quiz scores are kept.')){
      VPSL_UI.openSimulation(def.sim.id);
    }
  });
}

/* Register a simulation defined with {sim, category, meta, quiz, summary, simulate(panel, helpers)} */
function vpslRegister(def){
  VPSL_SIMULATIONS[def.sim.id] = {
    render(container){
      const shell = vpslBuildShell(container, def);
      vpslRenderOverview(shell.panel('overview'), def.meta);
      vpslRenderNotes(shell.panel('notes'), def.sim.id);
      vpslRenderQuiz(shell.panel('quiz'), def.quiz, def.sim.id);
      vpslRenderSummary(shell.panel('summary'), def);
      const simPanel = shell.panel('simulate');
      const helpers = {
        setProgress:(pct)=> VPSL_UI.updateSimProgress(def.sim.id, Math.max(pct, VPSL_STORE.state.simProgress[def.sim.id]||0)),
        toast: VPSL_UI.toast,
        drawBar: VPSL_UI.drawBarChart,
        drawLine: VPSL_UI.drawLineTrend,
        teacherMode: VPSL_STORE.state.teacherMode,
      };
      def.simulate(simPanel, helpers);
      helpers.setProgress(20); // opening + viewing simulate tab counts as started
    }
  };
}
