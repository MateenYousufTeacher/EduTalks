(function () {
  window.SIMS = window.SIMS || [];

  function genDistribution(mode) {
    const n = 100;
    const arr = [];
    for (let i = 1; i <= n; i++) {
      let v;
      if (mode === 'equal') v = 40 + i * 0.3;
      else if (mode === 'moderate') v = 10 + Math.pow(i, 1.35) * 0.45;
      else if (mode === 'high') v = 5 + Math.pow(i, 1.85) * 0.09;
      else v = 2 + Math.pow(i, 2.6) * 0.0016; // extreme
      arr.push(Math.round(v * 10) / 10);
    }
    return arr; // already ascending
  }

  function gini(sortedAsc) {
    const n = sortedAsc.length;
    const sum = sortedAsc.reduce((a, b) => a + b, 0);
    let weighted = 0;
    sortedAsc.forEach((x, idx) => { weighted += (idx + 1) * x; });
    const g = (2 * weighted) / (n * sum) - (n + 1) / n;
    return Math.max(0, Math.min(1, g));
  }

  function shareOf(sortedAsc, fromPct, toPct) {
    const n = sortedAsc.length;
    const from = Math.floor((fromPct / 100) * n);
    const to = Math.ceil((toPct / 100) * n);
    const total = sortedAsc.reduce((a, b) => a + b, 0);
    const slice = sortedAsc.slice(from, to).reduce((a, b) => a + b, 0);
    return Math.round((slice / total) * 100);
  }

  function lorenzSVG(sortedAsc) {
    const n = sortedAsc.length;
    const total = sortedAsc.reduce((a, b) => a + b, 0);
    let cum = 0;
    const pts = [[0, 0]];
    sortedAsc.forEach((x, i) => {
      cum += x;
      pts.push([((i + 1) / n) * 100, (cum / total) * 100]);
    });
    const W = 280, H = 220, pad = 24;
    const toX = p => pad + (p / 100) * (W - pad * 2);
    const toY = p => (H - pad) - (p / 100) * (H - pad * 2);
    const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#fbfcfe;border-radius:10px">
      <line x1="${toX(0)}" y1="${toY(0)}" x2="${toX(100)}" y2="${toY(100)}" stroke="#c7d2e3" stroke-width="1.5" stroke-dasharray="4 4"/>
      <path d="${path}" fill="none" stroke="#1976D2" stroke-width="2.5"/>
      <path d="${path} L ${toX(100)} ${toY(0)} Z" fill="#26C6DA" opacity="0.12"/>
      <text x="${pad}" y="${H - 6}" font-size="9" fill="#6b7280">0%</text>
      <text x="${W - 40}" y="${H - 6}" font-size="9" fill="#6b7280">100% of people</text>
      <text x="4" y="${pad}" font-size="9" fill="#6b7280">100%</text>
    </svg>`;
  }

  function mount(container, ctx) {
    const { el, renderBars, renderQuiz, saveScore } = ctx;
    let mode = 'moderate';
    let sortDir = 'asc';

    container.innerHTML = '';

    const introCard = el('div', { class: 'card' });
    introCard.appendChild(el('h4', {}, 'Choose a Distribution'));
    const chipRow = el('div', { class: 'chiplist' });
    [['equal', 'Equal'], ['moderate', 'Moderate Inequality'], ['high', 'High Inequality'], ['extreme', 'Extreme Inequality']].forEach(([key, label]) => {
      const chip = el('span', { class: 'pill' + (key === mode ? ' active' : '') }, label);
      chip.addEventListener('click', () => { mode = key; [...chipRow.children].forEach(c => c.classList.remove('active')); chip.classList.add('active'); refresh(); });
      chipRow.appendChild(chip);
    });
    introCard.appendChild(chipRow);
    container.appendChild(introCard);

    const distCard = el('div', { class: 'card' });
    distCard.appendChild(el('h4', {}, '100 Households \u2014 Income Bars (sorted low to high)'));
    const distWrap = el('div', {});
    distCard.appendChild(distWrap);
    container.appendChild(distCard);

    const shareCard = el('div', { class: 'card' });
    shareCard.appendChild(el('h4', {}, 'Income Shares'));
    const shareGrid = el('div', { class: 'metricgrid' });
    shareCard.appendChild(shareGrid);
    container.appendChild(shareCard);

    const lorenzCard = el('div', { class: 'card' });
    lorenzCard.appendChild(el('h4', {}, 'Lorenz Curve & Gini Coefficient'));
    const lorenzWrap = el('div', {});
    lorenzCard.appendChild(lorenzWrap);
    const giniWrap = el('div', { class: 'metricgrid', style: 'margin-top:10px' });
    lorenzCard.appendChild(giniWrap);
    container.appendChild(lorenzCard);

    const compareCard = el('div', { class: 'card' });
    compareCard.appendChild(el('h4', {}, 'Which Society Has Greater Inequality?'));
    compareCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Compare Gini coefficients across all four distributions \u2014 higher Gini means greater inequality.'));
    const compareWrap = el('div', {});
    compareCard.appendChild(compareWrap);
    container.appendChild(compareCard);

    const quizCard = el('div', { class: 'card' });
    container.appendChild(quizCard);

    function refresh() {
      const data = genDistribution(mode);

      distWrap.innerHTML = '';
      const bucketed = [];
      for (let i = 0; i < 100; i += 5) bucketed.push({ label: '', value: Math.round(data[i]) });
      renderBars(distWrap, bucketed, { showVal: false });

      const g = gini(data);
      shareGrid.innerHTML = '';
      [
        ['Bottom 10%', shareOf(data, 0, 10) + '%'],
        ['Bottom 20%', shareOf(data, 0, 20) + '%'],
        ['Middle 60%', shareOf(data, 20, 80) + '%'],
        ['Top 20%', shareOf(data, 80, 100) + '%'],
        ['Top 10%', shareOf(data, 90, 100) + '%']
      ].forEach(([k, v]) => shareGrid.appendChild(el('div', { class: 'metric' }, [el('div', { class: 'v' }, v), el('div', { class: 'k' }, k)])));

      lorenzWrap.innerHTML = lorenzSVG(data);
      giniWrap.innerHTML = '';
      const giniCls = g < 0.3 ? 'good' : g < 0.45 ? 'warn' : 'bad';
      giniWrap.appendChild(el('div', { class: 'metric ' + giniCls }, [el('div', { class: 'v' }, g.toFixed(2)), el('div', { class: 'k' }, 'Gini Coefficient (0=equal, 1=max unequal)')]));
      giniWrap.appendChild(el('div', { class: 'metric' }, [el('div', { class: 'v' }, g < 0.3 ? 'Low' : g < 0.45 ? 'Moderate' : 'High'), el('div', { class: 'k' }, 'Inequality Level')]));

      compareWrap.innerHTML = '';
      const allModes = ['equal', 'moderate', 'high', 'extreme'];
      renderBars(compareWrap, allModes.map(m => ({ label: m.slice(0, 4), value: Math.round(gini(genDistribution(m)) * 100) })), { max: 100 });

      saveScore({ pct: Math.round((1 - Math.abs(g - 0.3)) * 100), meta: 'Inequality Analysis Explored' });
    }

    refresh();

    renderQuiz(quizCard, 'Inequality Quiz', [
      {
        q: 'What does the Lorenz curve show?',
        options: ['The cumulative share of income earned by cumulative shares of the population', 'The total population size', 'The inflation rate over time', 'Government tax revenue'],
        correct: 0,
        explain: 'The Lorenz curve plots cumulative population percentage against cumulative income percentage \u2014 the further it bows below the equality line, the greater the inequality.'
      },
      {
        q: 'A Gini coefficient of 0 represents:',
        options: ['Perfect equality \u2014 everyone has the same income', 'Perfect inequality \u2014 one person has all income', 'Average inequality', 'Undefined income'],
        correct: 0,
        explain: 'A Gini of 0 means income is distributed identically across the population; a Gini of 1 means one person holds all the income.'
      },
      {
        q: 'If the top 10% of households earn 60% of total income, this indicates:',
        options: ['High income concentration at the top', 'Perfect equality', 'The bottom 10% earn the most', 'The measure is invalid'],
        correct: 0,
        explain: 'A large income share held by a small top group is a direct sign of high inequality in the distribution.'
      }
    ], (pct) => saveScore({ pct, meta: 'Inequality Quiz' }));
  }

  window.SIMS.push({
    id: 'equality-lens',
    title: 'Equality Lens',
    category: 'Income Distribution',
    tagline: 'See how income is distributed.',
    color: '#43A047',
    icon: '⚖️',
    mount
  });
})();
