(function () {
  window.SIMS = window.SIMS || [];

  // Deterministic Cobb-Douglas style production function
  // Output = A * L^0.65 * K^0.35 * techMultiplier * (hours/8)
  function output(L, K, tech, hours) {
    const A = 10;
    const techMult = [1, 1.15, 1.35, 1.6, 1.9][tech - 1] || 1;
    return A * Math.pow(L, 0.65) * Math.pow(K, 0.35) * techMult * (hours / 8);
  }

  function mount(container, ctx) {
    const { el, renderBars, renderQuiz, saveScore } = ctx;
    let L = 5, K = 3, hours = 8, tech = 1;

    container.innerHTML = '';

    const introCard = el('div', { class: 'card' });
    introCard.appendChild(el('h4', {}, 'Your Factory'));
    introCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Adjust inputs and watch how output, marginal product and average product respond.'));
    container.appendChild(introCard);

    const ctrlCard = el('div', { class: 'card' });
    ctrlCard.appendChild(el('h4', {}, 'Inputs'));
    ctrlCard.appendChild(sliderField('Workers', 1, 20, L, v => { L = +v; refresh(); }));
    ctrlCard.appendChild(sliderField('Machines (fixed capital)', 1, 10, K, v => { K = +v; refresh(); }));
    ctrlCard.appendChild(sliderField('Working Hours / Day', 1, 12, hours, v => { hours = +v; refresh(); }));
    const techSel = el('select', {});
    [1, 2, 3, 4, 5].forEach(t => techSel.appendChild(el('option', { value: t }, `Level ${t}`)));
    techSel.value = tech;
    techSel.addEventListener('change', e => { tech = +e.target.value; refresh(); });
    ctrlCard.appendChild(el('div', { class: 'field' }, [el('label', {}, 'Technology Level'), techSel]));
    container.appendChild(ctrlCard);

    function sliderField(label, min, max, val, onChange) {
      const valSpan = el('span', { class: 'val' }, String(val));
      const input = el('input', { type: 'range', min, max, value: val, oninput: e => { valSpan.textContent = e.target.value; onChange(e.target.value); } });
      return el('div', { class: 'field' }, [el('label', {}, [label, valSpan]), input]);
    }

    const dashCard = el('div', { class: 'card' });
    dashCard.appendChild(el('h4', {}, 'Factory Dashboard'));
    const dashGrid = el('div', { class: 'metricgrid' });
    dashCard.appendChild(dashGrid);
    container.appendChild(dashCard);

    const drCard = el('div', { class: 'card' });
    drCard.appendChild(el('h4', {}, 'Diminishing Returns \u2014 Marginal Product as Workers Increase'));
    drCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'With machines and hours held fixed at current levels, each extra worker adds less output than the last.'));
    const drChart = el('div', {});
    drCard.appendChild(drChart);
    container.appendChild(drCard);

    const rtsCard = el('div', { class: 'card' });
    rtsCard.appendChild(el('h4', {}, 'Returns to Scale Experiment'));
    rtsCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Multiplying workers and machines together by the same factor:'));
    const rtsWrap = el('div', {});
    rtsCard.appendChild(rtsWrap);
    const rtsVerdict = el('p', { class: 'note' });
    rtsCard.appendChild(rtsVerdict);
    container.appendChild(rtsCard);

    const bottleneckCard = el('div', { class: 'card' });
    bottleneckCard.appendChild(el('h4', {}, 'Bottleneck Check'));
    const bottleneckWrap = el('p', { class: 'note', style: 'margin-top:0' });
    bottleneckCard.appendChild(bottleneckWrap);
    container.appendChild(bottleneckCard);

    const quizCard = el('div', { class: 'card' });
    container.appendChild(quizCard);

    function refresh() {
      const out = output(L, K, tech, hours);
      const outPrev = output(Math.max(1, L - 1), K, tech, hours);
      const mp = L > 1 ? out - outPrev : out;
      const ap = out / L;

      dashGrid.innerHTML = '';
      [
        ['Total Output', out.toFixed(1)],
        ['Marginal Product', mp.toFixed(1)],
        ['Average Product', ap.toFixed(1)],
        ['Machine Utilisation', Math.min(100, Math.round((L / (K * 3)) * 100)) + '%']
      ].forEach(([k, v]) => dashGrid.appendChild(el('div', { class: 'metric' }, [el('div', { class: 'v' }, String(v)), el('div', { class: 'k' }, k)])));

      const mpData = [];
      for (let w = 1; w <= 12; w++) {
        const o = output(w, K, tech, hours);
        const oPrev = output(Math.max(1, w - 1), K, tech, hours);
        mpData.push({ label: String(w), value: Math.round(w > 1 ? o - oPrev : o) });
      }
      renderBars(drChart, mpData);

      rtsWrap.innerHTML = '';
      const scales = [1, 2, 3, 4];
      const base = output(L, K, tech, hours);
      const rtsData = scales.map(s => ({ label: s + '\u00d7', value: Math.round(output(L * s, K * s, tech, hours)) }));
      renderBars(rtsWrap, rtsData);
      const out2x = output(L * 2, K * 2, tech, hours);
      const ratio = out2x / base;
      let verdict = 'Constant returns to scale \u2014 output roughly doubles when inputs double.';
      if (ratio > 2.05) verdict = 'Increasing returns to scale \u2014 output more than doubles when inputs double.';
      else if (ratio < 1.95) verdict = 'Decreasing returns to scale \u2014 output less than doubles when inputs double.';
      rtsVerdict.textContent = verdict;

      const workerCapacity = K * 3;
      if (L > workerCapacity + 1) {
        bottleneckWrap.textContent = `Machines are the bottleneck: with ${K} machines, about ${workerCapacity} workers can be fully utilised. Extra workers add little output. Consider adding machines.`;
      } else if (K > 1 && L < workerCapacity - 3) {
        bottleneckWrap.textContent = `Workers are the bottleneck: your ${K} machines have spare capacity. Adding workers would raise output efficiently.`;
      } else {
        bottleneckWrap.textContent = `Workers and machines are reasonably balanced for this output level.`;
      }

      if (mp > 0 && L >= 8) saveScore({ pct: Math.min(100, Math.round((out / 40) * 100)), meta: 'Production Efficiency' });
    }

    refresh();

    renderQuiz(quizCard, 'Production Theory Quiz', [
      {
        q: 'What does the "law of diminishing returns" describe?',
        options: ['Each extra unit of a variable input adds less output than the previous one, holding other inputs fixed', 'Output always falls as inputs rise', 'Machines always outperform workers', 'Technology has no effect on output'],
        correct: 0,
        explain: 'With at least one input fixed (like machines), each additional unit of the variable input (like workers) eventually contributes a smaller marginal product.'
      },
      {
        q: 'If doubling all inputs more than doubles output, this is called:',
        options: ['Decreasing returns to scale', 'Constant returns to scale', 'Increasing returns to scale', 'Zero returns to scale'],
        correct: 2,
        explain: 'Increasing returns to scale occur when output grows proportionally faster than the inputs used to produce it.'
      },
      {
        q: 'Average Product of Labour is calculated as:',
        options: ['Total Output \u00f7 Labour Input', 'Total Output \u00d7 Labour Input', 'Marginal Product \u2212 Total Output', 'Labour Input \u00f7 Total Output'],
        correct: 0,
        explain: 'Average product measures output per unit of labour: Total Output divided by the number of workers.'
      }
    ], (pct) => saveScore({ pct, meta: 'Production Theory Quiz' }));
  }

  window.SIMS.push({
    id: 'production-factory',
    title: 'Production Factory',
    category: 'Production Theory',
    tagline: 'Turn resources into output.',
    color: '#FFB300',
    icon: '🏭',
    mount
  });
})();
