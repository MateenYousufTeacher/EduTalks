(function () {
  window.SIMS = window.SIMS || [];

  function hhi(shares) { return Math.round(shares.reduce((a, s) => a + s * s, 0) * 10000); }
  function classifyHHI(h) {
    if (h < 1500) return { label: 'Unconcentrated / Competitive', cls: 'good' };
    if (h < 2500) return { label: 'Moderately Concentrated', cls: 'warn' };
    return { label: 'Highly Concentrated', cls: 'bad' };
  }

  function mount(container, ctx) {
    const { el, renderBars, renderQuiz, saveScore } = ctx;
    let structure = 'competitive';
    let myCapacity = 50; // used in duopoly/monopoly experiments
    let barrier = 30; // entry barrier level 0-100

    container.innerHTML = '';

    const structCard = el('div', { class: 'card' });
    structCard.appendChild(el('h4', {}, 'Choose Market Structure'));
    const chipRow = el('div', { class: 'chiplist' });
    const structs = [['competitive', 'Competitive (8 firms)'], ['monopoly', 'Monopoly (1 firm)'], ['duopoly', 'Duopoly (2 firms)'], ['oligopoly', 'Oligopoly (4 firms)']];
    structs.forEach(([key, label]) => {
      const chip = el('span', { class: 'pill' + (key === structure ? ' active' : '') }, label);
      chip.addEventListener('click', () => { structure = key; [...chipRow.children].forEach(c => c.classList.remove('active')); chip.classList.add('active'); refresh(); });
      chipRow.appendChild(chip);
    });
    structCard.appendChild(chipRow);
    container.appendChild(structCard);

    const ctrlCard = el('div', { class: 'card' });
    ctrlCard.appendChild(el('h4', {}, 'Your Firm\u2019s Capacity'));
    const capValSpan = el('span', { class: 'val' }, String(myCapacity));
    const capSlider = el('input', { type: 'range', min: 5, max: 95, value: myCapacity, oninput: e => { myCapacity = +e.target.value; capValSpan.textContent = myCapacity; refresh(); } });
    ctrlCard.appendChild(el('div', { class: 'field' }, [el('label', {}, ['Output Capacity (relative units)', capValSpan]), capSlider]));
    container.appendChild(ctrlCard);

    const barrierCard = el('div', { class: 'card' });
    barrierCard.appendChild(el('h4', {}, 'Entry Barrier Lab'));
    barrierCard.appendChild(el('p', { class: 'note', style: 'margin-top:0' }, 'Higher barriers (licensing, capital needs, technology) make it harder for new firms to enter and compete away market power.'));
    const barValSpan = el('span', { class: 'val' }, String(barrier));
    const barSlider = el('input', { type: 'range', min: 0, max: 100, value: barrier, oninput: e => { barrier = +e.target.value; barValSpan.textContent = barrier; refresh(); } });
    barrierCard.appendChild(el('div', { class: 'field' }, [el('label', {}, ['Barrier Strength', barValSpan]), barSlider]));
    const entrantsWrap = el('p', { class: 'note' });
    barrierCard.appendChild(entrantsWrap);
    container.appendChild(barrierCard);

    const resultCard = el('div', { class: 'card' });
    resultCard.appendChild(el('h4', {}, 'Market Shares'));
    const shareWrap = el('div', {});
    resultCard.appendChild(shareWrap);
    const metricGrid = el('div', { class: 'metricgrid', style: 'margin-top:10px' });
    resultCard.appendChild(metricGrid);
    container.appendChild(resultCard);

    const compareCard = el('div', { class: 'card' });
    compareCard.appendChild(el('h4', {}, 'Compare All Structures (HHI)'));
    const compareWrap = el('div', {});
    compareCard.appendChild(compareWrap);
    container.appendChild(compareCard);

    const quizCard = el('div', { class: 'card' });
    container.appendChild(quizCard);

    function firmsFor(structure, myCap) {
      if (structure === 'monopoly') return [myCap];
      if (structure === 'duopoly') return [myCap, 100 - myCap];
      if (structure === 'oligopoly') {
        const rest = 100 - myCap;
        return [myCap, rest * 0.4, rest * 0.35, rest * 0.25];
      }
      // competitive: 8 firms, roughly equal but learner's firm varies within limit
      const capped = Math.min(myCap, 40);
      const rest = 100 - capped;
      const others = Array(7).fill(rest / 7);
      return [capped, ...others];
    }

    function refresh() {
      const outputs = firmsFor(structure, myCapacity).map(v => Math.max(0.5, v));
      const total = outputs.reduce((a, b) => a + b, 0);
      const shares = outputs.map(o => o / total);
      const h = hhi(shares);
      const cls = classifyHHI(h);

      shareWrap.innerHTML = '';
      renderBars(shareWrap, shares.map((s, i) => ({ label: i === 0 ? 'You' : 'F' + i, value: Math.round(s * 100) })), { max: 100 });

      const cr1 = Math.round(Math.max(...shares) * 100);
      const sortedShares = [...shares].sort((a, b) => b - a);
      const cr4 = Math.round(sortedShares.slice(0, 4).reduce((a, b) => a + b, 0) * 100);
      metricGrid.innerHTML = '';
      [
        ['Your Market Share', cr1 + '%'],
        ['Top-4 Share (CR4)', Math.min(100, cr4) + '%'],
        ['HHI Index', h],
        ['Classification', cls.label]
      ].forEach(([k, v], i) => {
        metricGrid.appendChild(el('div', { class: 'metric' + (i === 3 ? ' ' + cls.cls : '') }, [el('div', { class: 'v' }, String(v)), el('div', { class: 'k' }, k)]));
      });

      const entrants = Math.max(0, Math.round((100 - barrier) / 15));
      entrantsWrap.textContent = `At barrier strength ${barrier}, roughly ${entrants} new firm(s) could realistically enter this market over time.`;

      compareWrap.innerHTML = '';
      const allStructs = ['competitive', 'monopoly', 'duopoly', 'oligopoly'];
      const compData = allStructs.map(s => {
        const o = firmsFor(s, myCapacity).map(v => Math.max(0.5, v));
        const t = o.reduce((a, b) => a + b, 0);
        const sh = o.map(x => x / t);
        return { label: s.slice(0, 4), value: hhi(sh) };
      });
      renderBars(compareWrap, compData, { max: 10000 });

      saveScore({ pct: Math.min(100, Math.round((cr1 + cr4) / 2)), meta: 'Market Structure Analysis' });
    }

    refresh();

    renderQuiz(quizCard, 'Market Structures Quiz', [
      {
        q: 'What does a high HHI (Herfindahl-Hirschman Index) indicate?',
        options: ['A highly concentrated market with few dominant firms', 'A perfectly competitive market', 'Low prices for consumers', 'Many small firms with equal shares'],
        correct: 0,
        explain: 'HHI rises as market share becomes concentrated in fewer firms \u2014 a monopoly has the maximum possible HHI of 10,000.'
      },
      {
        q: 'What is a barrier to entry?',
        options: ['Something that makes it hard for new firms to enter and compete in a market', 'A tax on exports', 'A firm\u2019s marketing budget', 'A government subsidy'],
        correct: 0,
        explain: 'Barriers to entry \u2014 like high capital needs, licensing, or technology requirements \u2014 protect incumbent firms\u2019 market power by limiting new competition.'
      },
      {
        q: 'In an oligopoly, why do firms often watch competitors\u2019 output decisions closely?',
        options: ['Because each firm\u2019s best strategy depends on rivals\u2019 choices, since only a few firms share the market', 'Because oligopolies have only one firm', 'Because prices are fixed by law', 'Because there are no competitors to watch'],
        correct: 0,
        explain: 'With only a few firms, each one\u2019s output or pricing decision meaningfully affects the others \u2014 creating strategic interdependence.'
      }
    ], (pct) => saveScore({ pct, meta: 'Market Structures Quiz' }));
  }

  window.SIMS.push({
    id: 'market-power-lab',
    title: 'Market Power Lab',
    category: 'Market Structures',
    tagline: 'What happens when competition changes?',
    color: '#212121',
    icon: '🏛️',
    mount
  });
})();
