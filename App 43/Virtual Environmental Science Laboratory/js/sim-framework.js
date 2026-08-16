/* ===================== sim-framework.js =====================
   Generic engine that every one of the 10 simulations plugs into.
   A simDef provides: id, title, icon, objectives[], intro, background,
   controls[], state (initial), step(state, dt, controls), draw(ctx,state,w,h,mode),
   channels[] (for graph/table), impact, solutions, facts[], misconceptions[],
   quiz[], summary
=============================================================== */
'use strict';

function renderSimulation(container, simDef) {
  container.innerHTML = '';
  const state = JSON.parse(JSON.stringify(simDef.state));
  const controlValues = {};
  simDef.controls.forEach(c => controlValues[c.id] = c.value);

  let playing = false, lastTs = null, rafId = null, mode = 'student', tickAccum = 0;
  const rows = [];

  /* ---------- Header ---------- */
  const header = el('div', { class: 'sim-header' }, [
    el('button', { class: 'btn-ghost back-btn', onclick: () => { stop(); App.navigate('home'); } }, '← Back'),
    el('div', { class: 'sim-title-block' }, [
      el('span', { class: 'sim-emoji' }, simDef.icon),
      el('div', {}, [
        el('h2', {}, simDef.title),
        el('p', { class: 'sim-sub' }, simDef.tagline || '')
      ])
    ]),
    el('button', { class: 'btn-ghost', onclick: () => document.getElementById('objPanel').classList.toggle('open') }, '🎯 Objectives')
  ]);

  const objPanel = el('div', { id: 'objPanel', class: 'obj-panel' }, [
    el('h4', {}, 'Learning Objectives'),
    el('ul', {}, simDef.objectives.map(o => el('li', {}, o)))
  ]);

  /* ---------- Toolbar ---------- */
  const toolbar = el('div', { class: 'sim-toolbar' });
  const playBtn = el('button', { class: 'tbtn primary', title: 'Play' }, '▶ Play');
  const stepBtn = el('button', { class: 'tbtn', title: 'Step forward' }, '⏭ Step');
  const resetBtn = el('button', { class: 'tbtn', title: 'Reset' }, '⟲ Reset');
  const randBtn = el('button', { class: 'tbtn', title: 'Randomize' }, '🎲 Randomize');
  const modeBtn = el('button', { class: 'tbtn', title: 'Toggle mode' }, '👩‍🎓 Student Mode');
  const fsBtn = el('button', { class: 'tbtn', title: 'Fullscreen' }, '⛶ Fullscreen');
  const shotBtn = el('button', { class: 'tbtn', title: 'Screenshot' }, '📷 Screenshot');
  const exportBtn = el('button', { class: 'tbtn', title: 'Export observations' }, '⬇ Export CSV');
  [playBtn, stepBtn, resetBtn, randBtn, modeBtn, fsBtn, shotBtn, exportBtn].forEach(b => toolbar.appendChild(b));

  /* ---------- Layout: controls | canvas | side info ---------- */
  const controlsPanel = el('div', { class: 'controls-panel' }, [
    el('h4', {}, 'Adjustable Variables')
  ]);
  simDef.controls.forEach(c => {
    const valSpan = el('span', { class: 'ctrl-val' }, `${c.value}${c.unit || ''}`);
    const input = el('input', {
      type: 'range', min: c.min, max: c.max, step: c.step || 1, value: c.value,
      oninput: (e) => {
        controlValues[c.id] = parseFloat(e.target.value);
        valSpan.textContent = `${e.target.value}${c.unit || ''}`;
        if (!playing) drawFrame();
      }
    });
    controlsPanel.appendChild(el('div', { class: 'ctrl-row' }, [
      el('label', {}, [c.label, valSpan]),
      input
    ]));
    c._input = input; c._valSpan = valSpan;
  });

  const canvasWrap = el('div', { class: 'canvas-wrap' });
  const canvas = el('canvas', { class: 'sim-canvas' });
  canvasWrap.appendChild(canvas);
  const indicators = el('div', { class: 'indicators' });
  canvasWrap.appendChild(indicators);

  const centerCol = el('div', { class: 'sim-center' }, [canvasWrap]);

  /* ---------- Tabs: Observations / Graph / Science / Impact / Facts / Quiz / Summary ---------- */
  const tabs = ['Observations', 'Live Graph', 'Scientific Background', 'Human Impact', 'Facts & Myths', 'Mini Quiz', 'Summary'];
  const tabBar = el('div', { class: 'tab-bar' });
  const tabBody = el('div', { class: 'tab-body' });
  let activeTab = 0;

  function renderTab(i) {
    activeTab = i;
    [...tabBar.children].forEach((b, idx) => b.classList.toggle('active', idx === i));
    tabBody.innerHTML = '';
    if (i === 0) tabBody.appendChild(buildObservations());
    if (i === 1) tabBody.appendChild(buildGraph());
    if (i === 2) tabBody.appendChild(buildRichText(simDef.background, 'Scientific Background'));
    if (i === 3) tabBody.appendChild(buildImpact());
    if (i === 4) tabBody.appendChild(buildFacts());
    if (i === 5) tabBody.appendChild(buildQuiz());
    if (i === 6) tabBody.appendChild(buildRichText(simDef.summary, 'Summary'));
  }
  tabs.forEach((t, i) => tabBar.appendChild(el('button', { class: 'tab-btn' + (i === 0 ? ' active' : ''), onclick: () => renderTab(i) }, t)));

  function buildRichText(text, title) {
    return el('div', { class: 'richtext' }, [el('h4', {}, title), el('div', { html: text }, [])]);
  }

  function buildObservations() {
    const wrap = el('div', { class: 'obs-wrap' });
    const table = el('table', { class: 'data-table' });
    const thead = el('tr', {}, simDef.channels.map(c => el('th', {}, c.label)));
    table.appendChild(el('thead', {}, thead));
    const tbody = el('tbody', {}, rows.slice(-25).reverse().map(r => el('tr', {}, simDef.channels.map(c => el('td', {}, fmt(r[c.key], c.decimals ?? 1))))));
    table.appendChild(tbody);
    wrap.appendChild(el('p', { class: 'hint' }, 'Readings are logged automatically while the simulation plays. Repeat the experiment with different variables and compare.'));
    wrap.appendChild(table);
    return wrap;
  }

  function buildGraph() {
    const wrap = el('div', { class: 'graph-wrap' });
    const gcanvas = el('canvas', { class: 'graph-canvas' });
    wrap.appendChild(gcanvas);
    setTimeout(() => {
      const chart = new LiveChart(gcanvas, {
        series: simDef.channels.map(c => ({ key: c.key, label: c.label, color: c.color })),
        maxPoints: 60
      });
      rows.forEach(r => chart.push(r));
      wrap._chart = chart;
      currentChart = chart;
    }, 0);
    return wrap;
  }

  function buildImpact() {
    return el('div', { class: 'richtext' }, [
      el('h4', {}, 'Human Impact Analysis'),
      el('div', { html: simDef.impact }, []),
      el('h4', {}, 'Sustainable Solutions'),
      el('div', { html: simDef.solutions }, [])
    ]);
  }

  function buildFacts() {
    return el('div', { class: 'facts-wrap' }, [
      el('h4', {}, '🌟 Interesting Facts'),
      el('ul', { class: 'fact-list' }, simDef.facts.map(f => el('li', {}, f))),
      el('h4', {}, '⚠️ Common Misconceptions'),
      el('ul', { class: 'myth-list' }, simDef.misconceptions.map(m => el('li', {}, m)))
    ]);
  }

  function buildQuiz() {
    const wrap = el('div', { class: 'quiz-wrap' });
    let score = 0, answered = 0;
    const scoreLine = el('div', { class: 'quiz-score' }, `Score: 0 / ${simDef.quiz.length}`);
    wrap.appendChild(scoreLine);
    simDef.quiz.forEach((q, qi) => {
      const qBlock = el('div', { class: 'quiz-q' });
      qBlock.appendChild(el('p', { class: 'quiz-question' }, `${qi + 1}. ${q.q}`));
      const optWrap = el('div', { class: 'quiz-opts' });
      q.options.forEach((opt, oi) => {
        const btn = el('button', { class: 'quiz-opt' }, opt);
        btn.addEventListener('click', () => {
          if (btn.dataset.locked) return;
          [...optWrap.children].forEach(b => b.dataset.locked = '1');
          answered++;
          if (oi === q.correct) {
            btn.classList.add('correct'); score++;
            Profile.addXP(10, 'Quiz correct');
          } else {
            btn.classList.add('wrong');
            optWrap.children[q.correct].classList.add('correct');
          }
          qBlock.appendChild(el('p', { class: 'quiz-explain' }, '💡 ' + q.explain));
          scoreLine.textContent = `Score: ${score} / ${simDef.quiz.length}`;
          if (answered === simDef.quiz.length) {
            const p = Profile.data();
            p.quizScores[simDef.id] = score;
            Profile.save(p);
            if (score === simDef.quiz.length) Profile.unlock('quiz_perfect_' + simDef.id, `Perfect quiz: ${simDef.title}`);
          }
        });
        optWrap.appendChild(btn);
      });
      qBlock.appendChild(optWrap);
      wrap.appendChild(qBlock);
    });
    return wrap;
  }

  /* ---------- Simulation loop ---------- */
  let currentChart = null;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasWrap.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = (rect.height) * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFrame() {
    simDef.draw(ctx, state, canvas.clientWidth, canvas.clientHeight, controlValues, mode);
    renderIndicators();
  }

  function renderIndicators() {
    indicators.innerHTML = '';
    (simDef.indicators ? simDef.indicators(state, controlValues) : []).forEach(ind => {
      indicators.appendChild(el('div', { class: 'indicator-chip' }, [
        el('span', { class: 'ind-label' }, ind.label),
        el('span', { class: 'ind-val', style: ind.warn ? 'color:var(--danger)' : '' }, ind.value)
      ]));
    });
  }

  function logRow() {
    const row = { t: rows.length };
    simDef.channels.forEach(c => row[c.key] = state[c.key]);
    rows.push(row);
    if (rows.length > 500) rows.shift();
    if (currentChart) currentChart.push(row);
    if (activeTab === 0) renderTab(0);
  }

  function loop(ts) {
    if (!playing) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.12, (ts - lastTs) / 1000);
    lastTs = ts;
    simDef.step(state, dt, controlValues);
    tickAccum += dt;
    if (tickAccum >= 0.8) { tickAccum = 0; logRow(); }
    drawFrame();
    rafId = requestAnimationFrame(loop);
  }

  function play() {
    if (playing) return;
    playing = true; lastTs = null;
    playBtn.textContent = '⏸ Pause';
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    playing = false;
    playBtn.textContent = '▶ Play';
    if (rafId) cancelAnimationFrame(rafId);
  }
  playBtn.addEventListener('click', () => playing ? stop() : play());
  stepBtn.addEventListener('click', () => { simDef.step(state, 0.5, controlValues); logRow(); drawFrame(); });
  resetBtn.addEventListener('click', () => {
    stop();
    Object.assign(state, JSON.parse(JSON.stringify(simDef.state)));
    rows.length = 0;
    if (currentChart) currentChart.reset();
    if (activeTab === 0) renderTab(0);
    drawFrame();
    Toast.show('Experiment reset', 'info');
  });
  randBtn.addEventListener('click', () => {
    simDef.controls.forEach(c => {
      const v = Math.round((rand(c.min, c.max)) / (c.step || 1)) * (c.step || 1);
      controlValues[c.id] = v;
      c._input.value = v;
      c._valSpan.textContent = `${v}${c.unit || ''}`;
    });
    drawFrame();
    Toast.show('Variables randomized', 'info');
  });
  modeBtn.addEventListener('click', () => {
    mode = mode === 'student' ? 'teacher' : 'student';
    modeBtn.textContent = mode === 'student' ? '👩‍🎓 Student Mode' : '👨‍🏫 Teacher Mode';
    drawFrame();
  });
  fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) canvasWrap.requestFullscreen?.();
    else document.exitFullscreen?.();
  });
  shotBtn.addEventListener('click', () => screenshotCanvas(canvas, simDef.id + '-snapshot.png'));
  exportBtn.addEventListener('click', () => {
    if (!rows.length) { Toast.show('No observations yet — press Play first', 'info'); return; }
    exportCSV(simDef.id + '-observations.csv', simDef.channels.map(c => c.key), rows);
    Profile.addXP(5, 'Exported data');
  });

  const layout = el('div', { class: 'sim-layout' }, [
    controlsPanel,
    centerCol,
    el('div', { class: 'sim-side' }, [tabBar, tabBody])
  ]);

  const completeBar = el('div', { class: 'complete-bar' }, [
    el('span', {}, 'Finished exploring this lab?'),
    el('button', { class: 'btn-primary', onclick: () => { Profile.markComplete(simDef.id); Profile.addXP(25, 'Simulation completed'); } }, 'Mark Complete ✓')
  ]);

  container.append(header, objPanel, toolbar, layout, completeBar);
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  drawFrame();
  renderTab(0);

  return { destroy: () => { stop(); window.removeEventListener('resize', resizeCanvas); } };
}
