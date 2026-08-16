/* ============================================================
   SimEngine — mounts a simulation definition onto the shared
   Simulation Screen template (tabs: Simulate / Graph / Data /
   Learn / Quiz) and drives run/animate/log/graph/quiz logic.
   ============================================================ */

const SimEngine = (() => {
  let sim = null;
  let values = {};
  let lastResult = null;
  let animHandle = null;
  let activeGraph = 0;
  let quizAnswers = {};

  const canvas = () => document.getElementById('sim-canvas');
  const ctx = () => canvas().getContext('2d');

  function mount(simDef) {
    sim = simDef;
    if (!sim._log) sim._log = [];
    values = Object.assign({}, sim.defaultValues);
    lastResult = null;
    activeGraph = 0;
    quizAnswers = {};

    // reset tabs to first
    document.querySelectorAll('.sim-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
    document.querySelectorAll('.sim-panel').forEach((p, i) => p.classList.toggle('active', i === 0));
    document.querySelectorAll('.sim-tab').forEach(t => {
      t.onclick = () => {
        document.querySelectorAll('.sim-tab').forEach(x => x.classList.remove('active'));
        document.querySelectorAll('.sim-panel').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        document.getElementById('panel-' + t.dataset.tab).classList.add('active');
        if (t.dataset.tab === 'graph') renderGraph();
        if (t.dataset.tab === 'data') renderTable();
      };
    });

    App.renderControls(document.getElementById('sim-controls'), sim.controls, values, () => {
      renderIndicators(lastResult);
      drawFrame(0, false);
    });

    renderChallenge();
    renderIndicators(null);
    drawFrame(0, false);
    renderLearn();
    renderQuiz();
    renderGraphSelect();
    renderTable();

    document.getElementById('btn-run').onclick = runTrial;
    document.getElementById('btn-reset-trial').onclick = () => {
      values = Object.assign({}, sim.defaultValues);
      App.renderControls(document.getElementById('sim-controls'), sim.controls, values, () => {
        renderIndicators(lastResult); drawFrame(0, false);
      });
      lastResult = null;
      renderIndicators(null);
      drawFrame(0, false);
    };
    document.getElementById('btn-export-csv').onclick = () => {
      App.exportCSV(sim.id + '_data.csv', sim.trialColumns, sim._log);
    };
    document.getElementById('btn-clear-data').onclick = () => {
      sim._log = [];
      renderTable();
      App.toast('Log cleared.');
    };
  }

  function renderIndicators(result) {
    const list = sim.indicators(values, result);
    document.getElementById('sim-indicators').innerHTML = list.map(i => `
      <div class="indicator">
        <div class="indicator-label">${i.label}</div>
        <div class="indicator-value ${i.cls || ''}">${i.value}</div>
      </div>`).join('');
  }

  function drawFrame(progress, animating) {
    sim.draw(ctx(), canvas(), values, lastResult, progress, animating);
  }

  function runTrial() {
    cancelAnimationFrame(animHandle);
    const out = sim.run(values);
    lastResult = out.result;
    const duration = sim.animationDuration || 1200;
    const start = performance.now();
    document.getElementById('btn-run').disabled = true;
    document.getElementById('btn-run').textContent = '⏳ Running…';

    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      drawFrame(p, true);
      renderIndicators(interpResult(out.result, p));
      if (p < 1) {
        animHandle = requestAnimationFrame(step);
      } else {
        renderIndicators(out.result);
        drawFrame(1, false);
        finishTrial(out);
      }
    }
    animHandle = requestAnimationFrame(step);
  }

  function interpResult(result, p) {
    // linear-interpolate numeric fields for a live "counting up" feel
    if (!sim.interpolateKeys) return result;
    const r = Object.assign({}, result);
    sim.interpolateKeys.forEach(k => {
      if (typeof result[k] === 'number') r[k] = result[k] * p;
    });
    return r;
  }

  function finishTrial(out) {
    document.getElementById('btn-run').disabled = false;
    document.getElementById('btn-run').textContent = '▶ Run Trial';
    sim._log.push(out.logRow);
    if (sim._log.length > 200) sim._log.shift();
    renderTable();
    renderGraph();
    if (sim.challenge) renderChallenge(out.result);
    App.toast('Trial complete — logged to Data tab.');
  }

  function renderChallenge(result) {
    const box = document.getElementById('challenge-box');
    if (!sim.challenge) { box.hidden = true; return; }
    box.hidden = false;
    let status = '';
    if (result) {
      const pass = sim.challenge.evaluate(result, values);
      status = `<div style="margin-top:6px;font-weight:700;color:${pass ? '#1c6b30' : '#a53125'}">${pass ? '✓ Target met!' : '✗ Not yet — adjust and try again.'}</div>`;
    }
    box.innerHTML = `<b>🎯 Challenge</b>${sim.challenge.text}${status}`;
  }

  function renderGraphSelect() {
    const wrap = document.getElementById('graph-select');
    wrap.innerHTML = sim.graphs.map((g, i) => `<button class="chip-opt ${i === activeGraph ? 'active' : ''}" data-g="${i}">${g.label}</button>`).join('');
    wrap.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
      activeGraph = parseInt(b.dataset.g);
      wrap.querySelectorAll('.chip-opt').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      renderGraph();
    });
  }

  function renderGraph() {
    const g = sim.graphs[activeGraph];
    const series = g.build(sim._log, lastResult);
    const empty = document.getElementById('graph-empty');
    const gcanvas = document.getElementById('sim-graph');
    if (!series.length || series.every(s => s.points.length === 0)) {
      empty.hidden = false; gcanvas.style.display = 'none';
      return;
    }
    empty.hidden = true; gcanvas.style.display = 'block';
    App.drawLineChart(gcanvas, series, { xLabel: g.xLabel || '' });
  }

  function renderTable() {
    const table = document.getElementById('data-table');
    const empty = document.getElementById('data-empty');
    if (!sim._log.length) {
      table.innerHTML = ''; empty.hidden = false; return;
    }
    empty.hidden = true;
    const cols = sim.trialColumns;
    table.innerHTML = `<thead><tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>${sim._log.map(row => `<tr>${cols.map(c => `<td>${row[c.key]}</td>`).join('')}</tr>`).join('')}</tbody>`;
  }

  function renderLearn() {
    let html = sim.learnHTML;
    if (sim.misconceptions && sim.misconceptions.length) {
      html += `<h4>Common misconceptions</h4>` + sim.misconceptions.map(m =>
        `<div class="misconception"><b>Myth:</b> ${m.myth}<br><b>Reality:</b> ${m.reality}</div>`).join('');
    }
    document.getElementById('learn-content').innerHTML = html;
  }

  function renderQuiz() {
    const wrap = document.getElementById('quiz-content');
    wrap.innerHTML = sim.quiz.map((q, qi) => `
      <div class="quiz-q" data-qi="${qi}">
        <p>${qi + 1}. ${q.q}</p>
        ${q.options.map((o, oi) => `<button class="quiz-opt" data-oi="${oi}">${o}</button>`).join('')}
      </div>`).join('') + `<div class="quiz-score" id="quiz-score"></div>`;

    wrap.querySelectorAll('.quiz-q').forEach(qEl => {
      const qi = parseInt(qEl.dataset.qi);
      qEl.querySelectorAll('.quiz-opt').forEach(oBtn => {
        oBtn.onclick = () => {
          if (quizAnswers[qi] !== undefined) return;
          const oi = parseInt(oBtn.dataset.oi);
          quizAnswers[qi] = oi;
          const correct = sim.quiz[qi].correct;
          qEl.querySelectorAll('.quiz-opt').forEach((b, bi) => {
            if (bi === correct) b.classList.add('correct');
            else if (bi === oi) b.classList.add('wrong');
          });
          if (sim.quiz[qi].explain) {
            const p = document.createElement('p');
            p.style.cssText = 'font-size:.78rem;color:#667;margin-top:8px;';
            p.textContent = sim.quiz[qi].explain;
            qEl.appendChild(p);
          }
          updateScore();
        };
      });
    });
  }

  function updateScore() {
    const answered = Object.keys(quizAnswers).length;
    if (answered < sim.quiz.length) return;
    let correct = 0;
    sim.quiz.forEach((q, i) => { if (quizAnswers[i] === q.correct) correct++; });
    document.getElementById('quiz-score').textContent = `You scored ${correct} / ${sim.quiz.length}`;
  }

  return { mount };
})();
