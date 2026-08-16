(function () {
  window.SIMS = window.SIMS || [];

  const CASES = [
    ['Factory Pollution', 'negative', 'A factory raises output but discharges waste into a river, harming nearby health.'],
    ['Traffic Congestion', 'negative', 'Extra commuters cut their own travel choice, but everyone\u2019s travel time rises.'],
    ['Noise Pollution', 'negative', 'A construction site benefits its owner while disturbing nearby residents\u2019 sleep and focus.'],
    ['Tree Planting', 'positive', 'A homeowner plants trees; neighbours enjoy cleaner air and shade for free.'],
    ['Education', 'positive', 'A more educated worker is more productive, and society gains from lower crime and stronger institutions.'],
    ['Vaccination', 'positive', 'A vaccinated person is protected, and also reduces disease spread to others.'],
    ['Public Cleanliness', 'positive', 'One household\u2019s tidy frontage lifts the appeal and value of the whole street.'],
    ['Industrial Waste', 'negative', 'Untreated waste lowers a firm\u2019s costs but degrades shared land and water.'],
    ['Urban Green Space', 'positive', 'A public park raises wellbeing and property values well beyond its users.'],
    ['Community Safety', 'positive', 'One resident\u2019s security investment can deter crime on the whole block.']
  ];

  function mount(container, ctx) {
    const { el, renderBars, renderQuiz, saveScore } = ctx;
    let mode = 'negative'; // negative | positive
    let intensity = 50, protection = 30, community = 30;

    container.innerHTML = '';

    const modeCard = el('div', { class: 'card' });
    modeCard.appendChild(el('h4', {}, 'Choose Externality Type'));
    const modeRow = el('div', { class: 'btnrow' });
    const negBtn = el('button', { class: 'btn btn-primary', onclick: () => { mode = 'negative'; refresh(); } }, 'Negative (Factory)');
    const posBtn = el('button', { class: 'btn btn-secondary', onclick: () => { mode = 'positive'; refresh(); } }, 'Positive (Tree Planting)');
    modeRow.appendChild(negBtn); modeRow.appendChild(posBtn);
    modeCard.appendChild(modeRow);
    container.appendChild(modeCard);

    const ctrlCard = el('div', { class: 'card' });
    ctrlCard.appendChild(el('h4', {}, 'Controls'));
    const intField = sliderField('Activity Intensity', 0, 100, intensity, v => { intensity = +v; refresh(); });
    const protField = sliderField('Protection / Mitigation Investment', 0, 100, protection, v => { protection = +v; refresh(); });
    const commField = sliderField('Community Benefit Investment', 0, 100, community, v => { community = +v; refresh(); });
    ctrlCard.appendChild(intField.wrap); ctrlCard.appendChild(protField.wrap); ctrlCard.appendChild(commField.wrap);
    container.appendChild(ctrlCard);

    function sliderField(label, min, max, val, onChange) {
      const valSpan = el('span', { class: 'val' }, String(val));
      const input = el('input', { type: 'range', min, max, value: val, oninput: (e) => { valSpan.textContent = e.target.value; onChange(e.target.value); } });
      const wrap = el('div', { class: 'field' }, [el('label', {}, [label, valSpan]), input]);
      return { wrap, input, valSpan };
    }

    const ripplePanel = el('div', { class: 'card' });
    container.appendChild(ripplePanel);

    const accCard = el('div', { class: 'card' });
    accCard.appendChild(el('h4', {}, 'Private, Community & Social View'));
    const accGrid = el('div', {});
    accCard.appendChild(accGrid);
    container.appendChild(accCard);

    const optCard = el('div', { class: 'card' });
    optCard.appendChild(el('h4', {}, 'Social Optimum Challenge'));
    optCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Adjust Activity Intensity above to try to maximise Social Net Benefit (Social Benefit \u2212 Social Cost). Compare your result with the true optimum below.'));
    const optWrap = el('div', {});
    optCard.appendChild(optWrap);
    container.appendChild(optCard);

    const caseCard = el('div', { class: 'card' });
    caseCard.appendChild(el('h4', {}, 'Case Studies'));
    const chipList = el('div', { class: 'chiplist' });
    caseCard.appendChild(chipList);
    const caseDetail = el('p', { class: 'note' }, 'Tap a case to read how it links private and social effects.');
    caseCard.appendChild(caseDetail);
    CASES.forEach(([name, type, desc]) => {
      const chip = el('span', { class: 'pill' }, name);
      chip.addEventListener('click', () => { caseDetail.textContent = `${name} (${type} externality): ${desc}`; });
      chipList.appendChild(chip);
    });
    container.appendChild(caseCard);

    const quizCard = el('div', { class: 'card' });
    container.appendChild(quizCard);

    function computeAt(x, prot, comm, m) {
      // deterministic model
      const privBenefit = x * 1.4;
      const privCost = x * 0.5 + prot * 0.3;
      const extMagnitude = m === 'negative'
        ? Math.max(0, x * 1.1 - prot * 0.9)
        : Math.max(0, x * 0.9 + comm * 0.6);
      const extBenefit = m === 'negative' ? 0 : extMagnitude;
      const extCost = m === 'negative' ? extMagnitude : 0;
      const socialBenefit = privBenefit + extBenefit;
      const socialCost = privCost + extCost;
      return { privBenefit, privCost, extBenefit, extCost, socialBenefit, socialCost, netSocial: socialBenefit - socialCost, netPrivate: privBenefit - privCost };
    }

    function findOptimum() {
      let best = { x: 0, netSocial: -Infinity };
      for (let x = 0; x <= 100; x += 1) {
        const r = computeAt(x, protection, community, mode);
        if (r.netSocial > best.netSocial) best = { x, netSocial: r.netSocial };
      }
      return best;
    }
    function findPrivateOptimum() {
      let best = { x: 0, netPrivate: -Infinity };
      for (let x = 0; x <= 100; x += 1) {
        const r = computeAt(x, protection, community, mode);
        if (r.netPrivate > best.netPrivate) best = { x, netPrivate: r.netPrivate };
      }
      return best;
    }

    function refresh() {
      negBtn.className = 'btn ' + (mode === 'negative' ? 'btn-primary' : 'btn-secondary');
      posBtn.className = 'btn ' + (mode === 'positive' ? 'btn-primary' : 'btn-secondary');

      const r = computeAt(intensity, protection, community, mode);

      ripplePanel.innerHTML = '';
      ripplePanel.appendChild(el('h4', {}, mode === 'negative' ? 'Ripple: Production \u2192 Pollution \u2192 Community Cost' : 'Ripple: Activity \u2192 Spillover Benefit \u2192 Community Gain'));
      const steps = mode === 'negative'
        ? [['Production Activity', intensity], ['Pollution / Spillover', Math.round(Math.max(0, intensity * 1.1 - protection * 0.9))], ['Community Cost', Math.round(r.extCost)]]
        : [['Activity Level', intensity], ['Spillover Reach', Math.round(Math.max(0, intensity * 0.9 + community * 0.6))], ['Community Benefit', Math.round(r.extBenefit)]];
      const barWrap = el('div', {});
      ripplePanel.appendChild(barWrap);
      renderBars(barWrap, steps.map(([label, value]) => ({ label, value })), { max: 150 });

      accGrid.innerHTML = '';
      const mk = (title, rows) => el('div', { style: 'margin-bottom:12px' }, [
        el('div', { style: 'font-size:12px;font-weight:700;color:var(--deep-blue);margin-bottom:6px' }, title),
        el('div', { class: 'metricgrid' }, rows.map(([k, v, cls]) => el('div', { class: 'metric' + (cls ? ' ' + cls : '') }, [el('div', { class: 'v' }, v.toFixed(0)), el('div', { class: 'k' }, k)])))
      ]);
      accGrid.appendChild(mk('Private View', [['Private Benefit', r.privBenefit], ['Private Cost', r.privCost, 'bad'], ['Private Net Benefit', r.netPrivate, r.netPrivate >= 0 ? 'good' : 'bad']]));
      accGrid.appendChild(mk('Community View (External Effects)', [[mode === 'negative' ? 'External Cost' : 'External Benefit', mode === 'negative' ? r.extCost : r.extBenefit, mode === 'negative' ? 'bad' : 'good']]));
      accGrid.appendChild(mk('Social View', [['Social Benefit', r.socialBenefit], ['Social Cost', r.socialCost, 'bad'], ['Social Net Benefit', r.netSocial, r.netSocial >= 0 ? 'good' : 'bad']]));

      const optimum = findOptimum();
      const privOpt = findPrivateOptimum();
      optWrap.innerHTML = '';
      optWrap.appendChild(el('div', { class: 'metricgrid' }, [
        el('div', { class: 'metric' }, [el('div', { class: 'v' }, intensity), el('div', { class: 'k' }, 'Your Intensity')]),
        el('div', { class: 'metric good' }, [el('div', { class: 'v' }, optimum.x), el('div', { class: 'k' }, 'Social Optimum')]),
        el('div', { class: 'metric warn' }, [el('div', { class: 'v' }, privOpt.x), el('div', { class: 'k' }, 'Private Optimum')]),
        el('div', { class: 'metric' }, [el('div', { class: 'v' }, Math.abs(intensity - optimum.x)), el('div', { class: 'k' }, 'Gap From Social Optimum')])
      ]));
      const gap = Math.abs(intensity - optimum.x);
      if (gap <= 3) {
        optWrap.appendChild(el('p', { class: 'note' }, 'You are at (or very close to) the social optimum \u2014 well balanced!'));
        saveScore({ pct: 100, meta: 'Social Optimum Precision' });
      } else {
        optWrap.appendChild(el('p', { class: 'note' }, `Try moving the Activity Intensity slider ${intensity < optimum.x ? 'up' : 'down'} toward ${optimum.x}.`));
      }
    }

    refresh();

    renderQuiz(quizCard, 'Externalities Quiz', [
      {
        q: 'What is an externality?',
        options: ['A cost or benefit affecting someone who did not choose to be part of the transaction', 'A government tax', 'A firm\u2019s profit', 'The market price of a good'],
        correct: 0,
        explain: 'Externalities are spillover effects felt by third parties who were not part of the original decision.'
      },
      {
        q: 'Why is the private optimum usually different from the social optimum for a negative externality?',
        options: ['Because the decision-maker ignores the external cost imposed on others', 'Because government sets a fixed price', 'Because private costs are always zero', 'Because externalities do not affect production'],
        correct: 0,
        explain: 'The decision-maker weighs only private benefit and cost, so activity tends to run higher than what is socially optimal when external costs are ignored.'
      },
      {
        q: 'Vaccination is usually described as generating what kind of externality?',
        options: ['Negative externality', 'Positive externality', 'No externality', 'Only a private cost'],
        correct: 1,
        explain: 'A vaccinated person also reduces disease transmission to others \u2014 a benefit that spills over beyond the individual.'
      }
    ], (pct) => saveScore({ pct, meta: 'Externalities Quiz' }));
  }

  window.SIMS.push({
    id: 'ripple-effect',
    title: 'Ripple Effect',
    category: 'Externalities',
    tagline: 'When one decision affects everyone.',
    color: '#26C6DA',
    icon: '🌊',
    mount
  });
})();
