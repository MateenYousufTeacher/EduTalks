(function () {
  window.SIMS = window.SIMS || [];

  const COST_ITEMS = [
    { name: 'Rent', fixed: true }, { name: 'Equipment Lease', fixed: true }, { name: 'Insurance', fixed: true },
    { name: 'Raw Material', fixed: false }, { name: 'Machine Lease (hourly)', fixed: false }, { name: 'Electricity', fixed: false }, { name: 'Packaging', fixed: false }
  ];

  function mount(container, ctx) {
    const { el, renderBars, renderQuiz, saveScore } = ctx;
    let rent = 4000, equip = 2000, insurance = 1000;
    let matCost = 12, elecCost = 3, packCost = 2; // variable cost per unit components
    let qty = 300;
    let price = 30;

    container.innerHTML = '';

    const fcCard = el('div', { class: 'card' });
    fcCard.appendChild(el('h4', {}, 'Fixed Costs (per month)'));
    fcCard.appendChild(numField('Rent (\u20b9)', rent, v => { rent = v; refresh(); }));
    fcCard.appendChild(numField('Equipment Lease (\u20b9)', equip, v => { equip = v; refresh(); }));
    fcCard.appendChild(numField('Insurance (\u20b9)', insurance, v => { insurance = v; refresh(); }));
    container.appendChild(fcCard);

    const vcCard = el('div', { class: 'card' });
    vcCard.appendChild(el('h4', {}, 'Variable Costs (per unit)'));
    vcCard.appendChild(numField('Raw Material (\u20b9/unit)', matCost, v => { matCost = v; refresh(); }));
    vcCard.appendChild(numField('Electricity (\u20b9/unit)', elecCost, v => { elecCost = v; refresh(); }));
    vcCard.appendChild(numField('Packaging (\u20b9/unit)', packCost, v => { packCost = v; refresh(); }));
    container.appendChild(vcCard);

    function numField(label, val, onChange) {
      const input = el('input', { type: 'number', value: val, min: 0, oninput: e => onChange(+e.target.value || 0) });
      return el('div', { class: 'field' }, [el('label', {}, label), input]);
    }

    const qtyCard = el('div', { class: 'card' });
    qtyCard.appendChild(el('h4', {}, 'Production Quantity'));
    const qtyValSpan = el('span', { class: 'val' }, String(qty));
    const qtySlider = el('input', { type: 'range', min: 0, max: 1000, value: qty, oninput: e => { qty = +e.target.value; qtyValSpan.textContent = qty; refresh(); } });
    qtyCard.appendChild(el('div', { class: 'field' }, [el('label', {}, ['Units Produced', qtyValSpan]), qtySlider]));
    container.appendChild(qtyCard);

    const resultCard = el('div', { class: 'card' });
    resultCard.appendChild(el('h4', {}, 'Cost Breakdown'));
    const resultGrid = el('div', { class: 'metricgrid' });
    resultCard.appendChild(resultGrid);
    container.appendChild(resultCard);

    const curveCard = el('div', { class: 'card' });
    curveCard.appendChild(el('h4', {}, 'Average Total Cost as Output Rises'));
    curveCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Fixed costs spread over more units \u2014 average cost falls, then variable-cost pressure takes over.'));
    const curveWrap = el('div', {});
    curveCard.appendChild(curveWrap);
    container.appendChild(curveCard);

    const beCard = el('div', { class: 'card' });
    beCard.appendChild(el('h4', {}, 'Break-Even Lab'));
    const priceValSpan = el('span', { class: 'val' }, String(price));
    const priceSlider = el('input', { type: 'range', min: 5, max: 80, value: price, oninput: e => { price = +e.target.value; priceValSpan.textContent = price; refresh(); } });
    beCard.appendChild(el('div', { class: 'field' }, [el('label', {}, ['Unit Selling Price (\u20b9)', priceValSpan]), priceSlider]));
    const beGrid = el('div', { class: 'metricgrid' });
    beCard.appendChild(beGrid);
    container.appendChild(beCard);

    const classCard = el('div', { class: 'card' });
    classCard.appendChild(el('h4', {}, 'Cost Classification Game'));
    classCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Tap each cost, then choose Fixed or Variable.'));
    const classWrap = el('div', {});
    classCard.appendChild(classWrap);
    const classFeedback = el('p', { class: 'note' });
    classCard.appendChild(classFeedback);
    container.appendChild(classCard);
    buildClassificationGame();

    const quizCard = el('div', { class: 'card' });
    container.appendChild(quizCard);

    function costsAt(q) {
      const TFC = rent + equip + insurance;
      const unitVar = matCost + elecCost + packCost;
      const TVC = unitVar * q;
      const TC = TFC + TVC;
      const AFC = q ? TFC / q : 0;
      const AVC = unitVar;
      const ATC = q ? TC / q : 0;
      return { TFC, TVC, TC, AFC, AVC, ATC, unitVar };
    }

    function refresh() {
      const c = costsAt(qty);
      resultGrid.innerHTML = '';
      [
        ['Total Fixed Cost', '\u20b9' + c.TFC.toFixed(0)],
        ['Total Variable Cost', '\u20b9' + c.TVC.toFixed(0)],
        ['Total Cost', '\u20b9' + c.TC.toFixed(0)],
        ['Avg Fixed Cost', '\u20b9' + c.AFC.toFixed(2)],
        ['Avg Variable Cost', '\u20b9' + c.AVC.toFixed(2)],
        ['Avg Total Cost', '\u20b9' + c.ATC.toFixed(2)]
      ].forEach(([k, v]) => resultGrid.appendChild(el('div', { class: 'metric' }, [el('div', { class: 'v' }, v), el('div', { class: 'k' }, k)])));

      curveWrap.innerHTML = '';
      const steps = [50, 150, 300, 500, 700, 900];
      renderBars(curveWrap, steps.map(q => ({ label: String(q), value: Math.round(costsAt(q).ATC) })));

      const breakEvenQty = price > c.unitVar ? Math.ceil(c.TFC / (price - c.unitVar)) : Infinity;
      const revenue = price * qty;
      const net = revenue - c.TC;
      beGrid.innerHTML = '';
      [
        ['Total Revenue', '\u20b9' + revenue.toFixed(0)],
        ['Total Cost', '\u20b9' + c.TC.toFixed(0)],
        ['Net Result', (net >= 0 ? '+\u20b9' : '-\u20b9') + Math.abs(net).toFixed(0)],
        ['Break-Even Quantity', isFinite(breakEvenQty) ? breakEvenQty : 'Never (price \u2264 unit cost)']
      ].forEach(([k, v], i) => {
        const cls = i === 2 ? (net >= 0 ? 'good' : 'bad') : '';
        beGrid.appendChild(el('div', { class: 'metric' + (cls ? ' ' + cls : '') }, [el('div', { class: 'v' }, String(v)), el('div', { class: 'k' }, k)]));
      });

      if (net >= 0 && isFinite(breakEvenQty)) saveScore({ pct: 100, meta: 'Break-Even Mastery' });
    }

    function buildClassificationGame() {
      classWrap.innerHTML = '';
      let score = 0, done = 0;
      COST_ITEMS.forEach(item => {
        const row = el('div', { style: 'display:flex;align-items:center;gap:10px;margin-bottom:8px' });
        row.appendChild(el('div', { style: 'flex:1;font-size:12.5px;font-weight:600' }, item.name));
        const fixedBtn = el('button', { class: 'btn btn-secondary btn-sm' }, 'Fixed');
        const varBtn = el('button', { class: 'btn btn-secondary btn-sm' }, 'Variable');
        function answer(isFixedGuess, btn) {
          if (row.dataset.done) return;
          row.dataset.done = '1'; done++;
          const correct = isFixedGuess === item.fixed;
          if (correct) { score++; btn.classList.add('btn-green'); } else { btn.classList.add('btn-amber'); }
          classFeedback.textContent = correct
            ? `Correct \u2014 ${item.name} is a ${item.fixed ? 'fixed' : 'variable'} cost (${item.fixed ? 'does not change with output' : 'changes directly with output'}).`
            : `Not quite \u2014 ${item.name} is actually a ${item.fixed ? 'fixed' : 'variable'} cost.`;
          if (done === COST_ITEMS.length) saveScore({ pct: Math.round((score / COST_ITEMS.length) * 100), meta: 'Cost Classification' });
        }
        fixedBtn.addEventListener('click', () => answer(true, fixedBtn));
        varBtn.addEventListener('click', () => answer(false, varBtn));
        row.appendChild(fixedBtn); row.appendChild(varBtn);
        classWrap.appendChild(row);
      });
    }

    refresh();

    renderQuiz(quizCard, 'Cost Analysis Quiz', [
      {
        q: 'What happens to Average Fixed Cost as output increases?',
        options: ['It falls, because fixed costs are spread over more units', 'It rises', 'It stays constant', 'It becomes negative'],
        correct: 0,
        explain: 'Since total fixed cost does not change with output, dividing it by a larger quantity produces a smaller average fixed cost.'
      },
      {
        q: 'The break-even quantity is the output level where:',
        options: ['Total Revenue equals Total Cost', 'Total Revenue is zero', 'Fixed Cost is zero', 'Variable Cost exceeds Revenue'],
        correct: 0,
        explain: 'At break-even, revenue exactly covers total cost, so profit is zero \u2014 beyond this point additional units generate profit.'
      },
      {
        q: 'Which of these is typically a variable cost?',
        options: ['Factory rent', 'Raw materials used in production', 'Insurance premium', 'Equipment lease'],
        correct: 1,
        explain: 'Raw material cost rises directly with the quantity produced, unlike rent, insurance, or lease payments which stay fixed in the short run.'
      }
    ], (pct) => saveScore({ pct, meta: 'Cost Analysis Quiz' }));
  }

  window.SIMS.push({
    id: 'cost-control-lab',
    title: 'Cost Control Lab',
    category: 'Cost Accounting',
    tagline: 'Understand every cost.',
    color: '#0D47A1',
    icon: '🧾',
    mount
  });
})();
