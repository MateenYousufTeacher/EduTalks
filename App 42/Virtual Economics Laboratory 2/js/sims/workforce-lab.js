(function () {
  window.SIMS = window.SIMS || [];

  const OCCUPATIONS = ['Teacher', 'Nurse', 'Electrician', 'Software Technician', 'Farmer', 'Construction Worker', 'Driver', 'Designer'];

  function makeWorkers() {
    const names = ['Asha', 'Vikram', 'Noor', 'Devika', 'Farhan', 'Ira', 'Yusuf', 'Kiran', 'Tara', 'Aman'];
    return names.map((name, i) => ({
      id: i, name,
      skill: 3 + Math.floor(Math.random() * 6), // 3-8
      preferred: OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)],
      reservationWage: 12 + Math.floor(Math.random() * 10),
      assigned: null
    }));
  }
  function makeJobs() {
    return OCCUPATIONS.map((occ, i) => ({
      id: i, occ,
      requiredSkill: 4 + Math.floor(Math.random() * 5),
      vacancies: 1 + Math.floor(Math.random() * 2),
      wage: 15 + Math.floor(Math.random() * 12)
    }));
  }

  function mount(container, ctx) {
    const { el, renderBars, renderQuiz, saveScore } = ctx;
    let workers = makeWorkers();
    let jobs = makeJobs();

    container.innerHTML = '';

    const introCard = el('div', { class: 'card' });
    introCard.appendChild(el('h4', {}, 'Match Workers to Jobs'));
    introCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Assign each worker to a suitable occupation. Match quality depends on their skill versus the job\u2019s required skill. You can also send a worker for training to raise their skill before assigning them.'));
    container.appendChild(introCard);

    const dashCard = el('div', { class: 'card' });
    dashCard.appendChild(el('h4', {}, 'Workforce Dashboard'));
    const dashGrid = el('div', { class: 'metricgrid' });
    dashCard.appendChild(dashGrid);
    container.appendChild(dashCard);

    const workersCard = el('div', { class: 'card' });
    workersCard.appendChild(el('h4', {}, 'Workers'));
    const workersWrap = el('div', {});
    workersCard.appendChild(workersWrap);
    container.appendChild(workersCard);

    const jobsCard = el('div', { class: 'card' });
    jobsCard.appendChild(el('h4', {}, 'Vacancies'));
    const jobsWrap = el('div', {});
    jobsCard.appendChild(jobsWrap);
    container.appendChild(jobsCard);

    const wageCard = el('div', { class: 'card' });
    wageCard.appendChild(el('h4', {}, 'Wage Experiment'));
    wageCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Raise the offered wage for Software Technician and see how it affects applications and vacancy duration.'));
    const wageValSpan = el('span', { class: 'val' }, '20');
    const wageSlider = el('input', { type: 'range', min: 10, max: 40, value: 20, oninput: e => { wageValSpan.textContent = e.target.value; updateWageExperiment(+e.target.value); } });
    wageCard.appendChild(el('div', { class: 'field' }, [el('label', {}, ['Offered Wage (\u20b9/hr)', wageValSpan]), wageSlider]));
    const wageResult = el('div', { class: 'metricgrid' });
    wageCard.appendChild(wageResult);
    container.appendChild(wageCard);

    const resetBtn = el('button', { class: 'btn btn-tertiary btn-sm', onclick: resetAll }, 'Reset Workforce');
    container.appendChild(el('div', { class: 'card' }, [resetBtn]));

    const quizCard = el('div', { class: 'card' });
    container.appendChild(quizCard);

    function matchQuality(worker, job) {
      const diff = worker.skill - job.requiredSkill;
      if (diff >= 2) return { label: 'Overqualified', score: 70, cls: 'warn' };
      if (diff >= 0) return { label: 'Strong Match', score: 95, cls: 'good' };
      if (diff >= -2) return { label: 'Partial Match', score: 55, cls: 'warn' };
      return { label: 'Mismatch', score: 20, cls: 'bad' };
    }

    function renderWorkers() {
      workersWrap.innerHTML = '';
      workers.forEach(w => {
        const row = el('div', { class: 'person' });
        row.appendChild(el('div', { class: 'av' }, w.name.slice(0, 2)));
        const jobOptions = [el('option', { value: '' }, 'Unassigned')].concat(
          jobs.map(j => el('option', { value: j.id, selected: w.assigned === j.id ? 'selected' : null }, j.occ))
        );
        const select = el('select', { style: 'flex:1;margin-right:8px' }, jobOptions);
        select.value = w.assigned === null ? '' : String(w.assigned);
        select.addEventListener('change', e => { w.assigned = e.target.value === '' ? null : +e.target.value; refreshDash(); });
        const trainBtn = el('button', { class: 'btn btn-secondary btn-sm', onclick: () => { w.skill = Math.min(10, w.skill + 1); ctx.toast(`${w.name} trained \u2014 skill now ${w.skill}`); renderWorkers(); refreshDash(); } }, 'Train +1');
        row.appendChild(el('div', { class: 'name', style: 'flex:0 0 auto;margin-right:8px' }, [w.name, el('div', { class: 'role' }, `Skill ${w.skill} \u00b7 wants ${w.preferred}`)]));
        row.appendChild(select);
        row.appendChild(trainBtn);
        workersWrap.appendChild(row);
      });
    }

    function renderJobs() {
      jobsWrap.innerHTML = '';
      jobs.forEach(j => {
        const filled = workers.filter(w => w.assigned === j.id).length;
        row_push(j, filled);
      });
      function row_push(j, filled) {
        const row = el('div', { class: 'person' });
        row.appendChild(el('div', { class: 'av' }, j.occ.slice(0, 2)));
        row.appendChild(el('div', { class: 'name' }, [j.occ, el('div', { class: 'role' }, `Needs skill ${j.requiredSkill} \u00b7 \u20b9${j.wage}/hr`)]));
        row.appendChild(el('div', { class: 'amt' }, `${filled}/${j.vacancies} filled`));
        jobsWrap.appendChild(row);
      }
    }

    function refreshDash() {
      renderWorkers(); renderJobs();
      const assignedWorkers = workers.filter(w => w.assigned !== null);
      const employmentRate = Math.round((assignedWorkers.length / workers.length) * 100);
      let matchTotal = 0, mismatches = 0;
      assignedWorkers.forEach(w => {
        const job = jobs.find(j => j.id === w.assigned);
        const mq = matchQuality(w, job);
        matchTotal += mq.score;
        if (mq.score < 55) mismatches++;
      });
      const avgMatch = assignedWorkers.length ? Math.round(matchTotal / assignedWorkers.length) : 0;
      const totalVacancies = jobs.reduce((a, j) => a + j.vacancies, 0);
      const filled = jobs.reduce((a, j) => a + workers.filter(w => w.assigned === j.id).length, 0);
      const unfilled = totalVacancies - filled;

      dashGrid.innerHTML = '';
      [
        ['Employment Rate', employmentRate + '%'],
        ['Avg Match Quality', avgMatch + '%'],
        ['Skill Mismatches', mismatches],
        ['Unfilled Vacancies', Math.max(0, unfilled)]
      ].forEach(([k, v], i) => {
        const cls = i === 2 && mismatches > 2 ? 'bad' : (i === 1 && avgMatch >= 80 ? 'good' : '');
        dashGrid.appendChild(el('div', { class: 'metric' + (cls ? ' ' + cls : '') }, [el('div', { class: 'v' }, String(v)), el('div', { class: 'k' }, k)]));
      });

      if (employmentRate === 100 && avgMatch >= 75) {
        saveScore({ pct: avgMatch, meta: 'Workforce Match Quality' });
      }
    }

    function updateWageExperiment(wage) {
      // deterministic model: higher wage -> more applications, shorter vacancy duration, up to saturation
      const applications = Math.round(2 + (wage - 10) * 1.3);
      const acceptRate = Math.min(95, Math.round(40 + (wage - 10) * 2.2));
      const vacancyDays = Math.max(2, Math.round(30 - (wage - 10) * 0.9));
      wageResult.innerHTML = '';
      [['Applications Received', applications], ['Acceptance Rate', acceptRate + '%'], ['Avg Days to Fill', vacancyDays]].forEach(([k, v]) => {
        wageResult.appendChild(el('div', { class: 'metric' }, [el('div', { class: 'v' }, String(v)), el('div', { class: 'k' }, k)]));
      });
    }

    function resetAll() {
      workers = makeWorkers(); jobs = makeJobs();
      refreshDash();
    }

    refreshDash();
    updateWageExperiment(20);

    renderQuiz(quizCard, 'Labour Economics Quiz', [
      {
        q: 'What is a skill mismatch?',
        options: ['When a worker\u2019s skills do not fit a job\u2019s requirements', 'When wages are too low', 'When there are too many jobs', 'When a firm has no vacancies'],
        correct: 0,
        explain: 'Skill mismatch happens when a worker\u2019s qualifications are poorly suited to available vacancies, even if jobs and workers both exist.'
      },
      {
        q: 'What usually happens to applications when a firm raises its offered wage (holding other things equal)?',
        options: ['Applications fall', 'Applications tend to rise', 'Applications are unaffected', 'Vacancies disappear'],
        correct: 1,
        explain: 'A higher wage makes a job more attractive, typically drawing more applicants \u2014 though it also raises the firm\u2019s labour cost.'
      },
      {
        q: 'How does training a worker typically affect the labour market?',
        options: ['It raises their skill and productivity, widening their job options', 'It reduces their skill', 'It has no effect on employability', 'It removes them from the workforce'],
        correct: 0,
        explain: 'Training raises human capital, often improving productivity and expanding the range of jobs a worker can perform well.'
      }
    ], (pct) => saveScore({ pct, meta: 'Labour Economics Quiz' }));
  }

  window.SIMS.push({
    id: 'workforce-lab',
    title: 'Workforce Lab',
    category: 'Labour Economics',
    tagline: 'Build skills. Match talent. Understand work.',
    color: '#1976D2',
    icon: '👷',
    mount
  });
})();
