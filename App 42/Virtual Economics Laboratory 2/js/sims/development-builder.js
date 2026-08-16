(function () {
  window.SIMS = window.SIMS || [];

  const DIMENSIONS = ['education', 'health', 'skills', 'infrastructure', 'digital', 'productivity', 'institutions'];
  const DIM_LABELS = { education: 'Education', health: 'Health', skills: 'Skills', infrastructure: 'Infrastructure', digital: 'Digital Access', productivity: 'Productivity Capability', institutions: 'Institutional Quality' };

  const ACTIONS = {
    education: { label: 'Invest in Education', effect: { education: 6, skills: 2 } },
    health: { label: 'Invest in Health', effect: { health: 6, productivity: 2 } },
    skills: { label: 'Vocational Training', effect: { skills: 6, productivity: 2 } },
    infrastructure: { label: 'Build Infrastructure', effect: { infrastructure: 6, digital: 2 } },
    digital: { label: 'Expand Digital Access', effect: { digital: 6, productivity: 1 } },
    institutions: { label: 'Strengthen Institutions', effect: { institutions: 6, productivity: 1 } }
  };

  const SHOCKS = {
    5: { name: 'Disease Outbreak', effect: { health: -8, productivity: -4 } },
    9: { name: 'Technology Opportunity', effect: { digital: 6, productivity: 4 } },
    14: { name: 'Infrastructure Failure', effect: { infrastructure: -7 } },
    17: { name: 'Skill Shortage', effect: { skills: -5, productivity: -3 } }
  };

  function startState() {
    const s = {};
    DIMENSIONS.forEach(d => s[d] = 35);
    return s;
  }
  function devIndex(s) { return Math.round(DIMENSIONS.reduce((a, d) => a + s[d], 0) / DIMENSIONS.length); }
  function clampState(s) { DIMENSIONS.forEach(d => s[d] = Math.max(0, Math.min(100, s[d]))); return s; }

  function mount(container, ctx) {
    const { el, renderBars, renderQuiz, saveScore } = ctx;
    let year = 0;
    let state = startState();
    let history = [{ year: 0, index: devIndex(state) }];
    let shocksOn = true;
    let chosenThisYear = [];
    let decisions = [];

    container.innerHTML = '';

    const introCard = el('div', { class: 'card' });
    introCard.appendChild(el('h4', {}, `Year ${year} of 20`));
    const yearLabel = introCard.children[0];
    introCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Choose up to 2 development investments this year, then advance. Effects build up over time \u2014 education and institutions take longer to pay off.'));
    const shockToggle = el('label', { style: 'display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600' }, [
      el('input', { type: 'checkbox', checked: 'checked', onchange: e => shocksOn = e.target.checked }),
      'Enable random development shocks'
    ]);
    introCard.appendChild(shockToggle);
    container.appendChild(introCard);

    const actionCard = el('div', { class: 'card' });
    actionCard.appendChild(el('h4', {}, 'This Year\u2019s Investments (choose up to 2)'));
    const actionGrid = el('div', { class: 'chiplist' });
    Object.keys(ACTIONS).forEach(key => {
      const chip = el('span', { class: 'pill' }, ACTIONS[key].label);
      chip.addEventListener('click', () => {
        if (chosenThisYear.includes(key)) { chosenThisYear = chosenThisYear.filter(k => k !== key); chip.classList.remove('active'); }
        else if (chosenThisYear.length < 2) { chosenThisYear.push(key); chip.classList.add('active'); }
        else ctx.toast('You can choose up to 2 investments per year');
      });
      actionGrid.appendChild(chip);
    });
    actionCard.appendChild(actionGrid);
    const advanceBtn = el('button', { class: 'btn btn-primary block', style: 'margin-top:12px', onclick: advanceYear }, 'Advance to Next Year');
    actionCard.appendChild(advanceBtn);
    container.appendChild(actionCard);

    const dashCard = el('div', { class: 'card' });
    dashCard.appendChild(el('h4', {}, 'Development Dashboard'));
    const dashGrid = el('div', { class: 'metricgrid' });
    dashCard.appendChild(dashGrid);
    container.appendChild(dashCard);

    const trajCard = el('div', { class: 'card' });
    trajCard.appendChild(el('h4', {}, '20-Year Development Index Trajectory'));
    const trajWrap = el('div', {});
    trajCard.appendChild(trajWrap);
    container.appendChild(trajCard);

    const eventCard = el('div', { class: 'card' });
    eventCard.appendChild(el('h4', {}, 'Year Log'));
    const eventWrap = el('div', { class: 'log' });
    eventCard.appendChild(eventWrap);
    container.appendChild(eventCard);

    const compareCard = el('div', { class: 'card' });
    compareCard.appendChild(el('h4', {}, 'Compare Development Paths (auto-simulated)'));
    compareCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Estimated 20-year Development Index for four strategies, run independently of your own game.'));
    const compareWrap = el('div', {});
    compareCard.appendChild(compareWrap);
    container.appendChild(compareCard);

    const resetBtn = el('button', { class: 'btn btn-tertiary btn-sm', onclick: resetGame }, 'Restart 20-Year Simulation');
    container.appendChild(el('div', { class: 'card' }, [resetBtn]));

    const reportCard = el('div', { style: 'display:none' });
    container.appendChild(reportCard);

    const quizCard = el('div', { class: 'card' });
    container.appendChild(quizCard);

    function advanceYear() {
      if (year >= 20) { ctx.toast('20 years complete \u2014 restart to try a new strategy'); return; }
      year++;
      let logLine = `Year ${year}: `;
      if (chosenThisYear.length) {
        chosenThisYear.forEach(key => {
          const eff = ACTIONS[key].effect;
          Object.keys(eff).forEach(d => state[d] += eff[d] * 0.6); // partial immediate effect
          decisions.push({ year, key });
        });
        logLine += chosenThisYear.map(k => ACTIONS[k].label).join(' + ');
      } else {
        logLine += 'No investment made';
      }
      // lagged effect: past decisions from 4 years ago mature
      const matured = decisions.filter(d => d.year === year - 4);
      matured.forEach(d => {
        const eff = ACTIONS[d.key].effect;
        Object.keys(eff).forEach(dim => state[dim] += eff[dim] * 0.4);
      });
      if (matured.length) logLine += ` \u2014 earlier investments matured (+skill/capability gains)`;

      if (shocksOn && SHOCKS[year]) {
        const sh = SHOCKS[year];
        Object.keys(sh.effect).forEach(d => state[d] += sh.effect[d]);
        logLine += ` \u26a0\ufe0f Event: ${sh.name}`;
      }
      clampState(state);
      history.push({ year, index: devIndex(state) });
      eventLog.unshift(logLine);
      chosenThisYear = [];
      [...actionGrid.children].forEach(c => c.classList.remove('active'));
      refresh();
      if (year === 20) {
        showReport();
        saveScore({ pct: devIndex(state), meta: '20-Year Development Index' });
      }
    }

    let eventLog = [];

    function refresh() {
      yearLabel.textContent = `Year ${year} of 20`;
      dashGrid.innerHTML = '';
      DIMENSIONS.forEach(d => dashGrid.appendChild(el('div', { class: 'metric' }, [el('div', { class: 'v' }, Math.round(state[d])), el('div', { class: 'k' }, DIM_LABELS[d])])));
      dashGrid.appendChild(el('div', { class: 'metric good' }, [el('div', { class: 'v' }, devIndex(state)), el('div', { class: 'k' }, 'Development Index')]));

      trajWrap.innerHTML = '';
      renderBars(trajWrap, history.map(h => ({ label: 'Y' + h.year, value: h.index })), { max: 100 });

      eventWrap.innerHTML = '';
      eventLog.slice(0, 10).forEach(line => eventWrap.appendChild(el('div', { class: 'row' }, [el('span', {}, line)])));

      if (year >= 20) { advanceBtn.disabled = true; advanceBtn.textContent = 'Simulation Complete'; }
    }

    function simulatePath(strategy) {
      let s = startState(); let decs = [];
      for (let y = 1; y <= 20; y++) {
        let picks = [];
        if (strategy === 'education') picks = ['education', 'skills'];
        else if (strategy === 'health') picks = ['health', y % 2 === 0 ? 'infrastructure' : 'health'];
        else if (strategy === 'infrastructure') picks = ['infrastructure', 'digital'];
        else picks = Object.keys(ACTIONS).slice(y % 6, y % 6 + 2);
        if (!picks.length) picks = ['education'];
        picks.forEach(key => { const eff = ACTIONS[key].effect; Object.keys(eff).forEach(d => s[d] += eff[d] * 0.6); decs.push({ year: y, key }); });
        const matured = decs.filter(d => d.year === y - 4);
        matured.forEach(d => { const eff = ACTIONS[d.key].effect; Object.keys(eff).forEach(dim => s[dim] += eff[dim] * 0.4); });
        if (SHOCKS[y]) { const sh = SHOCKS[y]; Object.keys(sh.effect).forEach(d => s[d] += sh.effect[d]); }
        clampState(s);
      }
      return devIndex(s);
    }

    function refreshCompare() {
      compareWrap.innerHTML = '';
      const paths = [['Education First', 'education'], ['Health First', 'health'], ['Infrastructure First', 'infrastructure'], ['Balanced', 'balanced']];
      renderBars(compareWrap, paths.map(([label, key]) => ({ label: label.split(' ')[0], value: simulatePath(key) })), { max: 100 });
    }

    function showReport() {
      reportCard.style.display = 'block';
      reportCard.innerHTML = '';
      const start = 35, final = devIndex(state);
      const changes = DIMENSIONS.map(d => ({ d, delta: Math.round(state[d] - start) }));
      changes.sort((a, b) => b.delta - a.delta);
      const strongest = changes[0], weakest = changes[changes.length - 1];
      const rep = el('div', { class: 'report' }, [
        el('h4', {}, '20-Year Development Report'),
        el('div', { class: 'row' }, [el('span', {}, 'Starting Development Index'), el('b', {}, '35')]),
        el('div', { class: 'row' }, [el('span', {}, 'Final Development Index'), el('b', {}, String(final))]),
        el('div', { class: 'row' }, [el('span', {}, 'Strongest Improvement'), el('b', {}, `${DIM_LABELS[strongest.d]} (+${strongest.delta})`)]),
        el('div', { class: 'row' }, [el('span', {}, 'Weakest Improvement'), el('b', {}, `${DIM_LABELS[weakest.d]} (+${weakest.delta})`)]),
        el('div', { class: 'row' }, [el('span', {}, 'Recommended Next Priority'), el('b', {}, DIM_LABELS[weakest.d])])
      ]);
      reportCard.appendChild(rep);
    }

    function resetGame() {
      year = 0; state = startState(); history = [{ year: 0, index: devIndex(state) }]; decisions = []; eventLog = []; chosenThisYear = [];
      advanceBtn.disabled = false; advanceBtn.textContent = 'Advance to Next Year';
      reportCard.style.display = 'none';
      [...actionGrid.children].forEach(c => c.classList.remove('active'));
      refresh();
    }

    refresh();
    refreshCompare();

    renderQuiz(quizCard, 'Economic Development Quiz', [
      {
        q: 'Why do education investments often show a lagged effect on development?',
        options: ['Because it takes years for schooling to translate into workforce skills and productivity', 'Because education has no economic effect', 'Because schools close every year', 'Because education is always instantaneous'],
        correct: 0,
        explain: 'Human capital investments like education typically mature over years, as students graduate and enter the workforce with new skills.'
      },
      {
        q: 'Why does the simulation use a Development Index instead of GDP alone?',
        options: ['Because development is multidimensional \u2014 covering education, health, infrastructure and institutions, not just output', 'Because GDP is illegal to measure', 'Because GDP always equals development', 'Because indexes are easier to calculate than GDP'],
        correct: 0,
        explain: 'Development includes human capability, health, infrastructure and institutional quality \u2014 dimensions that a single output measure like GDP does not fully capture.'
      },
      {
        q: 'What is a risk of prioritizing only one development dimension (e.g., infrastructure) for 20 years?',
        options: ['Other dimensions like health or education may fall behind, limiting overall progress', 'Nothing \u2014 one dimension is always sufficient', 'It guarantees the fastest development', 'It eliminates the need for institutions'],
        correct: 0,
        explain: 'Because the Development Index is composite, neglecting other dimensions can leave the overall trajectory weaker than a more balanced strategy.'
      }
    ], (pct) => saveScore({ pct, meta: 'Development Understanding' }));
  }

  window.SIMS.push({
    id: 'development-builder',
    title: 'Development Builder',
    category: 'Economic Development',
    tagline: 'Build people. Build capability. Build the future.',
    color: '#FFB300',
    icon: '🌱',
    mount
  });
})();
