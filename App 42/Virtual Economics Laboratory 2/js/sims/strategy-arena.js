(function () {
  window.SIMS = window.SIMS || [];

  const SCENARIOS = {
    pd: {
      name: "Prisoner's Dilemma",
      rowLabel: 'Cooperate', row2: 'Defect',
      payoff: { CC: [3, 3], CD: [0, 5], DC: [5, 0], DD: [1, 1] },
      nash: 'DD'
    },
    ad: {
      name: 'Advertising Rivalry',
      rowLabel: 'Low Ad Spend', row2: 'High Ad Spend',
      payoff: { CC: [6, 6], CD: [2, 8], DC: [8, 2], DD: [3, 3] },
      nash: 'DD'
    },
    coord: {
      name: 'Coordination Game',
      rowLabel: 'Standard A', row2: 'Standard B',
      payoff: { CC: [5, 5], CD: [0, 0], DC: [0, 0], DD: [4, 4] },
      nash: 'CC'
    }
  };

  function aiChoice(personality, history) {
    if (personality === 'random') return Math.random() < 0.5 ? 'C' : 'D';
    if (personality === 'aggressive') return Math.random() < 0.75 ? 'D' : 'C';
    if (personality === 'cooperative') return Math.random() < 0.8 ? 'C' : 'D';
    if (personality === 'titfortat') {
      if (!history.length) return 'C';
      return history[history.length - 1].a; // mirror learner's last move
    }
    if (personality === 'rational') {
      // best responds to learner's average tendency
      const cRate = history.length ? history.filter(h => h.a === 'C').length / history.length : 0.5;
      return cRate > 0.55 ? 'D' : 'C';
    }
    return 'C';
  }

  function mount(container, ctx) {
    const { el, renderBars, renderQuiz, saveScore } = ctx;
    let scenarioKey = 'pd';
    let personality = 'titfortat';
    let history = [];
    let cumA = 0, cumB = 0;

    container.innerHTML = '';

    // Setup card
    const setupCard = el('div', { class: 'card' });
    setupCard.appendChild(el('h4', {}, 'Choose Your Scenario'));
    const scenField = el('div', { class: 'field' }, [
      el('label', {}, 'Scenario'),
      (() => {
        const s = el('select', {});
        Object.keys(SCENARIOS).forEach(k => s.appendChild(el('option', { value: k }, SCENARIOS[k].name)));
        s.addEventListener('change', e => { scenarioKey = e.target.value; resetGame(); });
        return s;
      })()
    ]);
    setupCard.appendChild(scenField);
    const persField = el('div', { class: 'field' }, [
      el('label', {}, 'Opponent Personality'),
      (() => {
        const s = el('select', {});
        [['random', 'Random'], ['aggressive', 'Aggressive'], ['cooperative', 'Cooperative'], ['titfortat', 'Tit-for-Tat'], ['rational', 'Rational']].forEach(([v, l]) => s.appendChild(el('option', { value: v }, l)));
        s.value = personality;
        s.addEventListener('change', e => { personality = e.target.value; resetGame(); });
        return s;
      })()
    ]);
    setupCard.appendChild(persField);
    container.appendChild(setupCard);

    // Matrix + play card
    const playCard = el('div', { class: 'card' });
    playCard.appendChild(el('h4', {}, 'Payoff Matrix — Pick Your Strategy (You are Player A)'));
    const matrixWrap = el('div', {});
    playCard.appendChild(matrixWrap);
    const resultWrap = el('div', {});
    playCard.appendChild(resultWrap);
    container.appendChild(playCard);

    // Round tracker card
    const trackCard = el('div', { class: 'card' });
    trackCard.appendChild(el('h4', {}, '10-Round Match — Cumulative Score'));
    const metricWrap = el('div', { class: 'metricgrid' });
    trackCard.appendChild(metricWrap);
    const chartWrap = el('div', { style: 'margin-top:10px' });
    trackCard.appendChild(chartWrap);
    const logWrap = el('div', { class: 'log' });
    trackCard.appendChild(logWrap);
    const resetBtn = el('button', { class: 'btn btn-tertiary btn-sm', style: 'margin-top:10px', onclick: resetGame }, 'Reset Match');
    trackCard.appendChild(resetBtn);
    container.appendChild(trackCard);

    // Nash equilibrium challenge
    const nashCard = el('div', { class: 'card' });
    nashCard.appendChild(el('h4', {}, 'Nash Equilibrium Challenge'));
    nashCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Tap the cell where neither player can improve their payoff by changing strategy alone.'));
    const nashMatrixWrap = el('div', {});
    nashCard.appendChild(nashMatrixWrap);
    const nashResult = el('div', {});
    nashCard.appendChild(nashResult);
    container.appendChild(nashCard);

    // Quiz
    const quizCard = el('div', { class: 'card' });
    container.appendChild(quizCard);

    function buildMatrix(wrap, s, onPick, pickedCell, highlightNash) {
      wrap.innerHTML = '';
      const t = el('table', { class: 'matrix' });
      const head = el('tr', {}, [el('th', {}, ''), el('th', {}, 'B: ' + s.rowLabel), el('th', {}, 'B: ' + s.row2)]);
      t.appendChild(head);
      [['A: ' + s.rowLabel, 'C'], ['A: ' + s.row2, 'D']].forEach(([label, rowKey]) => {
        const tr = el('tr', {}, [el('th', {}, label)]);
        ['C', 'D'].forEach(colKey => {
          const key = rowKey + colKey;
          const [pa, pb] = s.payoff[key];
          const td = el('td', {}, `${pa}, ${pb}`);
          if (pickedCell === key) td.classList.add('picked');
          if (highlightNash && s.nash === key) td.classList.add('nash');
          if (onPick) td.addEventListener('click', () => onPick(key));
          tr.appendChild(td);
        });
        t.appendChild(tr);
      });
      wrap.appendChild(t);
    }

    function resetGame() {
      history = []; cumA = 0; cumB = 0;
      buildMatrix(matrixWrap, SCENARIOS[scenarioKey], playRound, null, false);
      resultWrap.innerHTML = '';
      updateTracker();
    }

    function playRound(myKeyFirst) {
      if (history.length >= 10) { ctx.toast('Match complete — reset to play again'); return; }
      const myMove = myKeyFirst[0]; // 'C' or 'D'
      const oppMove = aiChoice(personality, history);
      const key = myMove + oppMove;
      const s = SCENARIOS[scenarioKey];
      const [pa, pb] = s.payoff[key];
      cumA += pa; cumB += pb;
      history.push({ a: myMove, b: oppMove, pa, pb });
      buildMatrix(matrixWrap, s, playRound, key, false);
      resultWrap.innerHTML = '';
      resultWrap.appendChild(el('p', { class: 'note' }, `Round ${history.length}: You chose ${myMove === 'C' ? s.rowLabel : s.row2}, opponent chose ${oppMove === 'C' ? s.rowLabel : s.row2}. You earned ${pa}, opponent earned ${pb}.`));
      updateTracker();
      if (history.length === 10) {
        const pct = Math.min(100, Math.round((cumA / (cumA + cumB || 1)) * 100));
        saveScore({ pct, meta: 'Strategic Thinking Score' });
        ctx.toast('Match complete! Scroll down for the Nash challenge.');
      }
    }

    function updateTracker() {
      metricWrap.innerHTML = '';
      const coopRate = history.length ? Math.round((history.filter(h => h.a === 'C').length / history.length) * 100) : 0;
      const oppCoopRate = history.length ? Math.round((history.filter(h => h.b === 'C').length / history.length) * 100) : 0;
      [
        ['Round', `${history.length}/10`],
        ['Your Total', cumA],
        ['Opponent Total', cumB],
        ['Your Cooperation', coopRate + '%']
      ].forEach(([k, v]) => metricWrap.appendChild(el('div', { class: 'metric' }, [el('div', { class: 'v' }, String(v)), el('div', { class: 'k' }, k)])));
      renderBars(chartWrap, history.map((h, i) => ({ label: 'R' + (i + 1), value: h.pa })), { max: 5 });
      logWrap.innerHTML = '';
      [...history].reverse().forEach((h, idx) => {
        const n = history.length - idx;
        logWrap.appendChild(el('div', { class: 'row' }, [
          el('span', {}, `Round ${n}: You ${h.a === 'C' ? 'cooperated' : 'defected'}, opponent ${h.b === 'C' ? 'cooperated' : 'defected'}`),
          el('b', {}, `+${h.pa}`)
        ]));
      });
    }

    let nashPicked = null;
    function nashPick(key) {
      nashPicked = key;
      const s = SCENARIOS[scenarioKey];
      buildMatrix(nashMatrixWrap, s, nashPick, key, true);
      nashResult.innerHTML = '';
      const isCorrect = key === s.nash;
      nashResult.appendChild(el('p', { class: 'note' },
        isCorrect
          ? `Correct — this is the Nash equilibrium. Neither player can gain by switching strategy alone, given the other player's choice.`
          : `Not quite. The Nash equilibrium is highlighted in amber. Check whether either player could earn more by switching, assuming the other player's choice stays fixed.`
      ));
    }
    buildMatrix(nashMatrixWrap, SCENARIOS[scenarioKey], nashPick, null, false);

    resetGame();

    renderQuiz(quizCard, 'Strategic Thinking Quiz', [
      {
        q: 'In the Prisoner\u2019s Dilemma, why do both players often end up defecting even though mutual cooperation pays more?',
        options: ['Defecting is each player\u2019s best response regardless of what the other does', 'Players are forced to defect by the rules', 'Cooperation is illegal in the game', 'Payoffs are random'],
        correct: 0,
        explain: 'Defect is a dominant strategy here: it gives a higher payoff no matter what the opponent chooses, even though mutual cooperation would be better for both.'
      },
      {
        q: 'What best defines a Nash equilibrium?',
        options: ['The outcome with the highest combined payoff', 'An outcome where neither player can improve their payoff by changing strategy alone', 'The first outcome tried', 'An outcome chosen by a referee'],
        correct: 1,
        explain: 'A Nash equilibrium is stable because no single player benefits from deviating unilaterally, even if a better joint outcome exists elsewhere.'
      },
      {
        q: 'In a repeated game, why can a Tit-for-Tat opponent encourage more cooperation than a one-shot game?',
        options: ['It punishes defection and rewards cooperation in future rounds, building trust', 'It always defects', 'It ignores the learner\u2019s choices', 'It changes the payoff matrix'],
        correct: 0,
        explain: 'Because future rounds are affected by current choices, players have an incentive to cooperate to sustain higher long-run payoffs.'
      }
    ], (pct) => saveScore({ pct, meta: 'Strategic Thinking Score' }));
  }

  window.SIMS.push({
    id: 'strategy-arena',
    title: 'Strategy Arena',
    category: 'Game Theory',
    tagline: 'Think ahead. Predict others. Choose wisely.',
    color: '#0D47A1',
    icon: '♟️',
    mount
  });
})();
