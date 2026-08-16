'use strict';
SIMS.carbonCycle = {
  id: 'carbonCycle', title: 'Carbon Cycle Explorer', icon: '🌫️',
  tagline: 'Track carbon flowing between atmosphere, plants, soil, oceans and fossil fuels',
  objectives: [
    'Trace carbon movement between the five major reservoirs',
    'Compare emission sources (fossil fuels, deforestation) with sinks (afforestation, oceans)',
    'Explain how atmospheric CO₂ concentration links to climate change',
    'Evaluate mitigation strategies that reduce net emissions'
  ],
  controls: [
    { id: 'deforest', label: 'Deforestation Rate', min: 0, max: 100, step: 1, value: 30, unit: '%' },
    { id: 'fossil', label: 'Fossil Fuel Use', min: 0, max: 100, step: 1, value: 55, unit: '%' },
    { id: 'afforest', label: 'Afforestation Rate', min: 0, max: 100, step: 1, value: 25, unit: '%' },
    { id: 'ocean', label: 'Ocean Absorption', min: 0, max: 100, step: 1, value: 40, unit: '%' }
  ],
  state: { atm: 415, plant: 550, soil: 1500, oceanC: 900, flow: 0 },
  nodes: {
    atm: { x: 0.5, y: 0.15, label: 'Atmosphere' },
    plant: { x: 0.18, y: 0.45, label: 'Plants' },
    soil: { x: 0.18, y: 0.8, label: 'Soil' },
    oceanC: { x: 0.82, y: 0.55, label: 'Ocean' },
    fossil: { x: 0.82, y: 0.85, label: 'Fossil Fuels' }
  },
  step(s, dt, c) {
    const emitFossil = (c.fossil / 100) * 3.2;
    const emitDeforest = (c.deforest / 100) * 1.6;
    const uptakeAfforest = (c.afforest / 100) * 1.8;
    const uptakeOcean = (c.ocean / 100) * 1.4;
    const photosynthesis = 2.0;
    const respiration = 1.8;
    s.atm = clamp(s.atm + (emitFossil + emitDeforest - uptakeAfforest - uptakeOcean + respiration - photosynthesis) * dt * 3, 350, 900);
    s.plant = clamp(s.plant + (photosynthesis - respiration + uptakeAfforest - emitDeforest * 0.5) * dt * 3, 100, 1200);
    s.oceanC = clamp(s.oceanC + uptakeOcean * dt * 3, 500, 2000);
    s.soil = clamp(s.soil + (emitDeforest * 0.3) * dt * 3, 800, 2500);
    s.flow += dt;
  },
  draw(ctx, s, W, H, c) {
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#E3F2FD'); bg.addColorStop(1, '#F5F7FA');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const P = (n) => ({ x: this.nodes[n].x * W, y: this.nodes[n].y * H });
    const paths = [
      ['fossil', 'atm', c.fossil, '#E53935'],
      ['plant', 'atm', 45, '#43A047'],
      ['atm', 'plant', 55, '#26C6DA'],
      ['plant', 'soil', 30, '#8D6E63'],
      ['soil', 'atm', c.deforest * 0.6, '#FFB300'],
      ['atm', 'oceanC', c.ocean, '#1976D2'],
      ['atm', 'plant', c.afforest * 0.5, '#2E7D32']
    ];
    paths.forEach(([a, b, strength, color]) => {
      const pa = P(a), pb = P(b);
      ctx.strokeStyle = color; ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1 + strength / 25;
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      ctx.globalAlpha = 1;
      // flowing dot
      const t = (s.flow * (0.2 + strength / 200)) % 1;
      const dx = pa.x + (pb.x - pa.x) * t, dy = pa.y + (pb.y - pa.y) * t;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(dx, dy, 3.5, 0, 7); ctx.fill();
    });
    Object.entries(this.nodes).forEach(([key, n]) => {
      const p = { x: n.x * W, y: n.y * H };
      let r = 26, fill = '#43A047';
      if (key === 'atm') { r = 30 + (s.atm - 415) / 10; fill = `rgb(${120 + (s.atm-350)/2},${180 - (s.atm-350)/4},${180 - (s.atm-350)/4})`; }
      if (key === 'oceanC') fill = '#1976D2';
      if (key === 'soil') fill = '#8D6E63';
      if (key === 'fossil') fill = '#424242';
      ctx.fillStyle = fill; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'white'; ctx.font = 'bold 10px Poppins, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(n.label, p.x, p.y + 3);
      ctx.textAlign = 'left';
    });
    ctx.fillStyle = '#212121'; ctx.font = '12px Poppins, sans-serif';
    ctx.fillText(`Atmospheric CO₂: ${fmt(s.atm, 0)} ppm`, 10, H - 10);
  },
  indicators(s) {
    return [
      { label: 'Atmosphere CO₂', value: fmt(s.atm, 0) + ' ppm', warn: s.atm > 550 },
      { label: 'Plant Carbon', value: fmt(s.plant, 0) },
      { label: 'Ocean Carbon', value: fmt(s.oceanC, 0) },
      { label: 'Soil Carbon', value: fmt(s.soil, 0) }
    ];
  },
  channels: [
    { key: 'atm', label: 'Atmosphere CO₂', color: '#E53935', decimals: 0 },
    { key: 'plant', label: 'Plant C', color: '#43A047', decimals: 0 },
    { key: 'oceanC', label: 'Ocean C', color: '#1976D2', decimals: 0 }
  ],
  background: `<p>Carbon cycles continuously between the atmosphere, living organisms, soils, oceans and fossil fuel reservoirs. Plants remove CO₂ through <b>photosynthesis</b>; all organisms return it through <b>respiration</b>. Oceans absorb large amounts of atmospheric CO₂. When organic matter is buried over geological time it can form <b>fossil fuels</b>, locking carbon away for millions of years — until it is burned.</p>`,
  impact: `<p>Burning fossil fuels and large-scale deforestation release carbon that was stored for millennia, faster than natural sinks can absorb it. This raises atmospheric CO₂ concentration, strengthening the greenhouse effect and driving global warming and ocean acidification.</p>`,
  solutions: `<p>Afforestation and reforestation increase carbon uptake. Reducing fossil fuel dependence, protecting existing forests, restoring wetlands, and improving soil carbon storage through sustainable agriculture all help rebalance the cycle.</p>`,
  facts: [
    'Oceans have absorbed about a quarter of human CO₂ emissions since the industrial era, making seawater more acidic.',
    'Soils store roughly three times more carbon than the atmosphere.',
    'Atmospheric CO₂ has risen from about 280 ppm pre-industrial to over 420 ppm today.'
  ],
  misconceptions: [
    '"Trees store carbon forever" — carbon returns to the atmosphere when trees die and decompose or burn, unless it is transferred to long-term stores.',
    '"The ocean can absorb unlimited CO₂" — absorption capacity is finite and comes with the cost of ocean acidification.'
  ],
  quiz: [
    { q: 'Which process removes CO₂ from the atmosphere into plants?', options: ['Respiration', 'Photosynthesis', 'Combustion', 'Decomposition'], correct: 1, explain: 'Photosynthesis converts atmospheric CO₂ into plant biomass using sunlight.' },
    { q: 'Burning fossil fuels primarily releases carbon that was stored:', options: ['In the ocean surface', 'Over millions of years underground', 'In the atmosphere already', 'In glaciers'], correct: 1, explain: 'Fossil fuels formed from organic matter buried and transformed over geological time.' },
    { q: 'Increasing afforestation is expected to:', options: ['Increase atmospheric CO₂', 'Decrease atmospheric CO₂', 'Have no effect', 'Only affect the ocean'], correct: 1, explain: 'More trees increase carbon uptake through photosynthesis, lowering atmospheric CO₂ over time.' },
    { q: 'A side effect of high ocean carbon absorption is:', options: ['Ocean acidification', 'Ocean freezing', 'Reduced salinity', 'Increased oxygen only'], correct: 0, explain: 'Dissolved CO₂ forms carbonic acid, lowering ocean pH.' },
    { q: 'Which reservoir generally holds the most carbon?', options: ['Atmosphere', 'Living plants', 'Soils and sediments', 'Fresh water'], correct: 2, explain: 'Soils and geological sediments store far more carbon than the atmosphere or living biomass.' }
  ],
  summary: `<p>The Carbon Cycle Explorer visualises how fossil fuel combustion and deforestation push carbon into the atmosphere, while afforestation and ocean absorption pull it back out — and how the balance between these flows determines atmospheric CO₂ levels and climate stability.</p>`
};
