(function () {
  window.SIMS = window.SIMS || [];

  const RESIDENTS = [
    { name: 'Aarav', type: 'generous' },
    { name: 'Priya', type: 'freerider' },
    { name: 'Zoya', type: 'conditional' },
    { name: 'Rohan', type: 'selfish' },
    { name: 'Meher', type: 'fair' },
    { name: 'Ibrahim', type: 'reciprocal' },
    { name: 'Sana', type: 'generous' },
    { name: 'Kabir', type: 'freerider' }
  ];

  function aiContribution(type, lastRoundAvg) {
    switch (type) {
      case 'generous': return 8 + Math.round(Math.random() * 2);
      case 'freerider': return 0;
      case 'selfish': return Math.round(Math.random() * 2);
      case 'conditional': return lastRoundAvg >= 5 ? 7 : 2;
      case 'fair': return 5;
      case 'reciprocal': return Math.min(10, Math.round(lastRoundAvg));
      default: return 3;
    }
  }

  function facilityTier(total, maxPossible) {
    const pct = total / maxPossible;
    if (pct >= 0.75) return { label: 'Excellent', cls: 'good' };
    if (pct >= 0.5) return { label: 'Good', cls: 'good' };
    if (pct >= 0.25) return { label: 'Basic', cls: 'warn' };
    return { label: 'Poor / Neglected', cls: 'bad' };
  }

  function mount(container, ctx) {
    const { el, renderBars, renderQuiz, saveScore } = ctx;
    const N = RESIDENTS.length;
    let round = 0;
    let trust = 60;
    let history = []; // {round, total, myContribution, benefitPerHead}
    let learnerContribution = 5;

    container.innerHTML = '';

    const introCard = el('div', { class: 'card' });
    introCard.appendChild(el('h4', {}, 'Your Neighbourhood'));
    introCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, `You are one of ${N} residents deciding how much to contribute toward a shared community park. Everyone benefits from the park, whether they contribute or not \u2014 this is the free-rider problem in action.`));
    container.appendChild(introCard);

    const ctrlCard = el('div', { class: 'card' });
    ctrlCard.appendChild(el('h4', {}, `Round ${1} of 10 \u2014 Your Contribution`));
    const roundLabel = ctrlCard.children[0];
    const valSpan = el('span', { class: 'val' }, String(learnerContribution));
    const slider = el('input', { type: 'range', min: 0, max: 10, value: learnerContribution, oninput: e => { learnerContribution = +e.target.value; valSpan.textContent = learnerContribution; } });
    ctrlCard.appendChild(el('div', { class: 'field' }, [el('label', {}, ['Contribute (0\u201310 tokens)', valSpan]), slider]));
    const playBtn = el('button', { class: 'btn btn-primary block', onclick: playRound }, 'Contribute & Advance Round');
    ctrlCard.appendChild(playBtn);
    container.appendChild(ctrlCard);

    const dashCard = el('div', { class: 'card' });
    dashCard.appendChild(el('h4', {}, 'Community Dashboard'));
    const dashGrid = el('div', { class: 'metricgrid' });
    dashCard.appendChild(dashGrid);
    const facilityRow = el('div', { style: 'margin-top:10px' });
    dashCard.appendChild(facilityRow);
    container.appendChild(dashCard);

    const chartCard = el('div', { class: 'card' });
    chartCard.appendChild(el('h4', {}, 'Contributions This Round'));
    const chartWrap = el('div', {});
    chartCard.appendChild(chartWrap);
    container.appendChild(chartCard);

    const trendCard = el('div', { class: 'card' });
    trendCard.appendChild(el('h4', {}, 'Community Contribution Over Rounds'));
    const trendWrap = el('div', {});
    trendCard.appendChild(trendWrap);
    container.appendChild(trendCard);

    const resetBtn = el('button', { class: 'btn btn-tertiary btn-sm', onclick: resetGame }, 'Reset Simulation');
    container.appendChild(el('div', { class: 'card' }, [resetBtn]));

    const quizCard = el('div', { class: 'card' });
    container.appendChild(quizCard);

    let lastResidentContribs = RESIDENTS.map(() => 3);

    function playRound() {
      if (round >= 10) { ctx.toast('All 10 rounds complete \u2014 reset to play again'); return; }
      round++;
      const lastAvg = history.length ? history[history.length - 1].avgOthers : 3;
      const contribs = RESIDENTS.map(r => aiContribution(r.type, lastAvg));
      lastResidentContribs = contribs;
      const total = contribs.reduce((a, b) => a + b, 0) + learnerContribution;
      const maxPossible = (N + 1) * 10;
      const tier = facilityTier(total, maxPossible);
      const benefitPerHead = Math.round((total / maxPossible) * 15); // benefit scales with quality
      const freeRiders = contribs.filter(c => c === 0).length;
      trust = Math.max(0, Math.min(100, trust + (total / maxPossible > 0.5 ? 3 : -5)));

      history.push({ round, total, myContribution: learnerContribution, avgOthers: contribs.reduce((a, b) => a + b, 0) / N, benefitPerHead, freeRiders, tier });

      roundLabel.textContent = round < 10 ? `Round ${round + 1} of 10 \u2014 Your Contribution` : 'Final Round Complete';
      if (round >= 10) { playBtn.disabled = true; playBtn.textContent = 'Match Complete'; }
      refreshDash(contribs, total, maxPossible, tier, benefitPerHead, freeRiders);

      if (round === 10) {
        const avgTrust = trust;
        saveScore({ pct: Math.round(avgTrust), meta: 'Community Trust Score' });
      }
    }

    function refreshDash(contribs, total, maxPossible, tier, benefitPerHead, freeRiders) {
      dashGrid.innerHTML = '';
      [
        ['Your Contribution', learnerContribution],
        ['Community Total', total + '/' + maxPossible],
        ['Public Benefit / Head', benefitPerHead],
        ['Free Riders', freeRiders],
        ['Community Trust', Math.round(trust) + '%'],
        ['Facility Quality', tier.label]
      ].forEach(([k, v], i) => {
        const cls = i === 5 ? tier.cls : (i === 3 && freeRiders > 3 ? 'bad' : '');
        dashGrid.appendChild(el('div', { class: 'metric' + (cls ? ' ' + cls : '') }, [el('div', { class: 'v' }, String(v)), el('div', { class: 'k' }, k)]));
      });

      facilityRow.innerHTML = '';
      const pct = Math.round((total / maxPossible) * 100);
      facilityRow.appendChild(el('div', { class: 'progress' }, [el('i', { style: `width:${pct}%` })]));

      chartWrap.innerHTML = '';
      const data = RESIDENTS.map((r, i) => ({ label: r.name.slice(0, 3), value: contribs[i] }));
      data.push({ label: 'You', value: learnerContribution });
      renderBars(chartWrap, data, { max: 10 });

      trendWrap.innerHTML = '';
      renderBars(trendWrap, history.map(h => ({ label: 'R' + h.round, value: h.total })), { max: (N + 1) * 10 });
    }

    function resetGame() {
      round = 0; trust = 60; history = []; learnerContribution = 5;
      slider.value = 5; valSpan.textContent = '5';
      playBtn.disabled = false; playBtn.textContent = 'Contribute & Advance Round';
      roundLabel.textContent = 'Round 1 of 10 \u2014 Your Contribution';
      dashGrid.innerHTML = ''; facilityRow.innerHTML = ''; chartWrap.innerHTML = ''; trendWrap.innerHTML = '';
    }

    renderQuiz(quizCard, 'Public Goods Quiz', [
      {
        q: 'What is the free-rider problem?',
        options: ['When someone enjoys a public benefit without contributing to its cost', 'When a firm dumps waste illegally', 'When prices rise too fast', 'When a bank fails'],
        correct: 0,
        explain: 'Because public goods benefit everyone regardless of contribution, individuals may be tempted to enjoy the benefit while contributing nothing.'
      },
      {
        q: 'What tends to happen to a shared facility if too many residents free-ride?',
        options: ['It improves automatically', 'It deteriorates from under-funding', 'Nothing changes', 'Only the free-riders lose access'],
        correct: 1,
        explain: 'With too little total contribution, the shared resource cannot be maintained and quality falls for everyone, including contributors.'
      },
      {
        q: 'Why can public recognition or contribution matching increase cooperation?',
        options: ['They increase the private incentive or social reward for contributing', 'They ban free-riding by law', 'They reduce the number of residents', 'They eliminate the need for the public good'],
        correct: 0,
        explain: 'Mechanisms like matching or recognition raise the personal payoff or social reward from contributing, nudging more people to participate.'
      }
    ], (pct) => saveScore({ pct, meta: 'Public Goods Quiz' }));
  }

  window.SIMS.push({
    id: 'commons-challenge',
    title: 'Commons Challenge',
    category: 'Public Goods',
    tagline: 'Build together. Benefit together.',
    color: '#43A047',
    icon: '🏞️',
    mount
  });
})();
