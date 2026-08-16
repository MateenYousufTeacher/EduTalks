(function () {
  window.SIMS = window.SIMS || [];

  const OCCUPATIONS = ['Software Technician', 'Nurse', 'Electrician', 'Designer', 'Driver', 'Teacher'];

  function makeVacancies() {
    const list = [];
    OCCUPATIONS.forEach(occ => {
      for (let i = 0; i < 3; i++) {
        list.push({ occ, requiredSkill: 3 + Math.floor(Math.random() * 6), wage: 14 + Math.floor(Math.random() * 14) });
      }
    });
    return list;
  }

  function matchScore(seeker, job) {
    const occMatch = seeker.preferred === job.occ ? 25 : 0;
    const skillGap = Math.abs(seeker.skill - job.requiredSkill);
    const skillScore = Math.max(0, 60 - skillGap * 12);
    const wageOk = job.wage >= seeker.minWage ? 15 : 0;
    return Math.min(100, occMatch + skillScore + wageOk);
  }

  function mount(container, ctx) {
    const { el, renderBars, renderQuiz, saveScore } = ctx;
    let seeker = { skill: 5, preferred: OCCUPATIONS[0], minWage: 18, experience: 2 };
    let vacancies = makeVacancies();
    let days = 0, applications = 0, interviews = 0, hired = false, hireDay = null;
    let log = [];

    container.innerHTML = '';

    const setupCard = el('div', { class: 'card' });
    setupCard.appendChild(el('h4', {}, 'Your Job Seeker'));
    const occSel = el('select', {});
    OCCUPATIONS.forEach(o => occSel.appendChild(el('option', { value: o }, o)));
    occSel.addEventListener('change', e => { seeker.preferred = e.target.value; });
    setupCard.appendChild(el('div', { class: 'field' }, [el('label', {}, 'Preferred Occupation'), occSel]));
    setupCard.appendChild(sliderField('Skill Level', 1, 10, seeker.skill, v => seeker.skill = +v));
    setupCard.appendChild(sliderField('Minimum Acceptable Wage (\u20b9/hr)', 10, 35, seeker.minWage, v => seeker.minWage = +v));
    container.appendChild(setupCard);

    function sliderField(label, min, max, val, onChange) {
      const valSpan = el('span', { class: 'val' }, String(val));
      const input = el('input', { type: 'range', min, max, value: val, oninput: e => { valSpan.textContent = e.target.value; onChange(e.target.value); } });
      return el('div', { class: 'field' }, [el('label', {}, [label, valSpan]), input]);
    }

    const actionCard = el('div', { class: 'card' });
    actionCard.appendChild(el('h4', {}, 'Daily Actions'));
    const actionRow = el('div', { class: 'btnrow' });
    ['Apply to 1 Job', 'Apply to 3 Jobs', 'Improve CV (+skill)', 'Wait'].forEach((label, i) => {
      const b = el('button', { class: 'btn btn-secondary btn-sm', onclick: () => doAction(i) }, label);
      actionRow.appendChild(b);
    });
    actionCard.appendChild(actionRow);
    const feedback = el('p', { class: 'note' });
    actionCard.appendChild(feedback);
    container.appendChild(actionCard);

    const dashCard = el('div', { class: 'card' });
    dashCard.appendChild(el('h4', {}, 'Search Progress'));
    const dashGrid = el('div', { class: 'metricgrid' });
    dashCard.appendChild(dashGrid);
    container.appendChild(dashCard);

    const logCard = el('div', { class: 'card' });
    logCard.appendChild(el('h4', {}, 'Application Log'));
    const logWrap = el('div', { class: 'log' });
    logCard.appendChild(logWrap);
    container.appendChild(logCard);

    const resetBtn = el('button', { class: 'btn btn-tertiary btn-sm', onclick: resetGame }, 'Start New Search');
    container.appendChild(el('div', { class: 'card' }, [resetBtn]));

    const stratCard = el('div', { class: 'card' });
    stratCard.appendChild(el('h4', {}, 'Strategy Comparison (simulated)'));
    stratCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Estimated average days to employment for different search strategies, given your current skill level.'));
    const stratWrap = el('div', {});
    stratCard.appendChild(stratWrap);
    container.appendChild(stratCard);

    const quizCard = el('div', { class: 'card' });
    container.appendChild(quizCard);

    function bestVacancy() {
      let best = null, bestScore = -1;
      vacancies.forEach(v => { const s = matchScore(seeker, v); if (s > bestScore) { bestScore = s; best = v; } });
      return { best, bestScore };
    }

    function applyOnce() {
      applications++;
      const { best, bestScore } = bestVacancy();
      const passInterview = Math.random() * 100 < bestScore * 0.9;
      if (passInterview) {
        interviews++;
        const hireChance = bestScore;
        if (Math.random() * 100 < hireChance && !hired) {
          hired = true; hireDay = days;
          log.unshift(`Day ${days}: Hired as ${best.occ}! Match score ${Math.round(bestScore)}%.`);
          return;
        }
        log.unshift(`Day ${days}: Interviewed for ${best.occ} (match ${Math.round(bestScore)}%) \u2014 not selected this time.`);
      } else {
        log.unshift(`Day ${days}: Applied to ${best.occ} \u2014 not shortlisted (match ${Math.round(bestScore)}%).`);
      }
    }

    function doAction(i) {
      if (hired) { ctx.toast('Already hired! Start a new search to try again.'); return; }
      days++;
      if (i === 0) applyOnce();
      else if (i === 1) { applyOnce(); applyOnce(); applyOnce(); }
      else if (i === 2) { seeker.skill = Math.min(10, seeker.skill + 1); log.unshift(`Day ${days}: Improved CV \u2014 skill now ${seeker.skill}.`); }
      else log.unshift(`Day ${days}: Waited and researched the market.`);
      refresh();
      if (hired) {
        const pct = Math.max(20, 100 - hireDay * 3);
        saveScore({ pct, meta: 'Job Search Efficiency' });
        feedback.textContent = `Hired on day ${hireDay} after ${applications} applications and ${interviews} interviews!`;
      }
    }

    function refresh() {
      dashGrid.innerHTML = '';
      [
        ['Days Searching', days],
        ['Applications', applications],
        ['Interviews', interviews],
        ['Status', hired ? 'Hired!' : 'Unemployed']
      ].forEach(([k, v], i) => dashGrid.appendChild(el('div', { class: 'metric' + (i === 3 ? (hired ? ' good' : ' warn') : '') }, [el('div', { class: 'v' }, String(v)), el('div', { class: 'k' }, k)])));
      logWrap.innerHTML = '';
      log.slice(0, 12).forEach(line => logWrap.appendChild(el('div', { class: 'row' }, [el('span', {}, line)])));
    }

    function resetGame() {
      vacancies = makeVacancies(); days = 0; applications = 0; interviews = 0; hired = false; hireDay = null; log = [];
      feedback.textContent = '';
      refresh();
    }

    function simulateStrategy(strategyFn, trials) {
      let totalDays = 0;
      for (let t = 0; t < trials; t++) {
        let s = { ...seeker }; let vs = makeVacancies(); let d = 0; let h = false;
        while (!h && d < 60) {
          d++;
          const apps = strategyFn === 'broad' ? 3 : 1;
          for (let a = 0; a < apps; a++) {
            let best = null, bs = -1;
            vs.forEach(v => { const sc = matchScore(s, v); if (sc > bs) { bs = sc; best = v; } });
            if (Math.random() * 100 < bs * 0.9 && Math.random() * 100 < bs) { h = true; break; }
          }
          if (strategyFn === 'train' && d % 5 === 0) s.skill = Math.min(10, s.skill + 1);
        }
        totalDays += d;
      }
      return Math.round(totalDays / trials);
    }

    function refreshStrategyComparison() {
      stratWrap.innerHTML = '';
      const results = [
        { label: 'Narrow', value: simulateStrategy('narrow', 25) },
        { label: 'Broad', value: simulateStrategy('broad', 25) },
        { label: 'Train+Search', value: simulateStrategy('train', 25) }
      ];
      renderBars(stratWrap, results);
    }

    resetGame();
    refreshStrategyComparison();

    renderQuiz(quizCard, 'Unemployment & Job Search Quiz', [
      {
        q: 'Why might someone stay unemployed even when vacancies exist?',
        options: ['Because of skill or location mismatch, or an incomplete job search process', 'Because unemployment is always voluntary', 'Because there are no jobs anywhere', 'Because wages are always too high'],
        correct: 0,
        explain: 'Mismatches between a worker\u2019s skills/location and available vacancies \u2014 plus search time itself \u2014 can prolong unemployment even when jobs exist elsewhere.'
      },
      {
        q: 'Frictional unemployment refers to:',
        options: ['Short spells of unemployment while workers search and match with suitable jobs', 'Unemployment caused by permanent decline of an industry', 'Unemployment that only happens in one season', 'Unemployment caused by inflation'],
        correct: 0,
        explain: 'Frictional unemployment is a normal, usually short-term feature of a dynamic labour market as people search for the right match.'
      },
      {
        q: 'Applying broadly to many jobs versus narrowly to a few typically trades off:',
        options: ['More applications and interview chances against lower selectivity and match quality', 'Nothing \u2014 both strategies are identical', 'Broad search always guarantees higher wages', 'Narrow search always finds a job faster'],
        correct: 0,
        explain: 'Broad search raises the chance of an offer sooner, but may lead to weaker matches; narrow search targets quality but takes longer to succeed.'
      }
    ], (pct) => saveScore({ pct, meta: 'Job Search Quiz' }));
  }

  window.SIMS.push({
    id: 'jobquest',
    title: 'JobQuest',
    category: 'Unemployment',
    tagline: 'Search. Match. Get hired.',
    color: '#26C6DA',
    icon: '🧭',
    mount
  });
})();
