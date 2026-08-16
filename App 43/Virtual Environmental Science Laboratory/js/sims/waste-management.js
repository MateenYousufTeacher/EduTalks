'use strict';
SIMS.wasteManagement = {
  id: 'wasteManagement', title: 'Waste Management & Recycling Studio', icon: '♻️',
  tagline: 'Sort waste streams into composting, recycling, incineration and landfill',
  objectives: [
    'Classify waste types (organic, plastic, glass, paper, metal, e-waste)',
    'Compare composting, recycling, incineration and landfilling',
    'Analyze environmental trade-offs of each disposal method',
    'Evaluate strategies to maximize resource recovery'
  ],
  controls: [
    { id: 'generated', label: 'Waste Generated', min: 10, max: 100, step: 1, value: 60, unit: ' t/day' },
    { id: 'recycle', label: 'Recycling Rate', min: 0, max: 100, step: 1, value: 30, unit: '%' },
    { id: 'compost', label: 'Composting Rate', min: 0, max: 100, step: 1, value: 20, unit: '%' },
    { id: 'landfill', label: 'Landfilling Rate', min: 0, max: 100, step: 1, value: 35, unit: '%' }
  ],
  state: { landfillVol: 200, resourceRecovered: 0, emissions: 0, compostProduced: 0, trucks: [] },
  step(s, dt, c) {
    const recycle = clamp(c.recycle, 0, 100);
    const compost = clamp(c.compost, 0, 100);
    const landfill = clamp(c.landfill, 0, 100);
    const incinerate = clamp(100 - recycle - compost - landfill, 0, 100);
    const total = c.generated;
    s.landfillVol += (total * landfill / 100) * dt * 0.6;
    s.resourceRecovered += (total * recycle / 100) * dt * 0.6;
    s.compostProduced += (total * compost / 100) * dt * 0.6;
    s.emissions += (total * incinerate / 100) * dt * 0.9;
    s._split = { recycle, compost, landfill, incinerate };
  },
  draw(ctx, s, W, H, c) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#F5F7FA'; ctx.fillRect(0, 0, W, H);
    const split = s._split || { recycle: 30, compost: 20, landfill: 35, incinerate: 15 };
    const streams = [
      { label: 'Recycling', val: split.recycle, color: '#1976D2', x: 0.15 },
      { label: 'Composting', val: split.compost, color: '#43A047', x: 0.38 },
      { label: 'Landfill', val: split.landfill, color: '#8D6E63', x: 0.61 },
      { label: 'Incineration', val: split.incinerate, color: '#E53935', x: 0.84 }
    ];
    // bin/source at top
    ctx.fillStyle = '#455A64';
    ctx.fillRect(W * 0.42, 8, W * 0.16, 24);
    ctx.fillStyle = 'white'; ctx.font = 'bold 10px Poppins,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Waste Bin', W * 0.5, 24);
    streams.forEach(st => {
      const x = st.x * W;
      ctx.strokeStyle = st.color; ctx.globalAlpha = 0.5; ctx.lineWidth = 2 + st.val / 15;
      ctx.beginPath(); ctx.moveTo(W * 0.5, 34); ctx.lineTo(x, H * 0.45); ctx.stroke();
      ctx.globalAlpha = 1;
      // facility box
      const barH = H * 0.35 * (st.val / 100);
      ctx.fillStyle = st.color;
      ctx.fillRect(x - 24, H * 0.8 - barH, 48, barH);
      ctx.strokeStyle = '#212121'; ctx.strokeRect(x - 24, H * 0.45, 48, H * 0.35);
      ctx.fillStyle = '#212121'; ctx.font = '10px Poppins,sans-serif';
      ctx.fillText(st.label, x, H * 0.45 - 6);
      ctx.fillText(fmt(st.val, 0) + '%', x, H * 0.82 - barH - 4);
    });
    ctx.textAlign = 'left';
    // landfill mound growing
    ctx.fillStyle = '#6D4C41';
    const moundH = clamp(s.landfillVol / 8, 4, H * 0.3);
    ctx.beginPath();
    ctx.moveTo(W * 0.61 - 30, H * 0.95);
    ctx.lineTo(W * 0.61, H * 0.95 - moundH);
    ctx.lineTo(W * 0.61 + 30, H * 0.95);
    ctx.closePath(); ctx.fill();
  },
  indicators(s) {
    return [
      { label: 'Landfill Volume', value: fmt(s.landfillVol, 0) + ' t', warn: s.landfillVol > 800 },
      { label: 'Resources Recovered', value: fmt(s.resourceRecovered, 0) + ' t' },
      { label: 'Compost Produced', value: fmt(s.compostProduced, 0) + ' t' },
      { label: 'Incineration Emissions', value: fmt(s.emissions, 0) + ' t CO₂e', warn: s.emissions > 300 }
    ];
  },
  channels: [
    { key: 'landfillVol', label: 'Landfill (t)', color: '#8D6E63', decimals: 0 },
    { key: 'resourceRecovered', label: 'Recovered (t)', color: '#1976D2', decimals: 0 },
    { key: 'emissions', label: 'Emissions (t)', color: '#E53935', decimals: 0 }
  ],
  background: `<p>Waste management involves collecting, sorting and processing discarded materials. <b>Composting</b> breaks down organic waste into nutrient-rich soil. <b>Recycling</b> reprocesses materials like plastic, glass, paper and metal into new products, saving raw resources and energy. <b>Incineration</b> burns waste to reduce volume and sometimes generate energy, but releases emissions. <b>Landfilling</b> buries waste, which is simple but consumes land and can leach pollutants and release methane over time.</p>`,
  impact: `<p>Poor waste segregation sends recyclable and compostable materials to landfills, wasting resources and increasing methane emissions from decomposing organic waste. Uncontrolled incineration releases air pollutants. Illegally dumped e-waste and biomedical waste pose serious toxic and health hazards.</p>`,
  solutions: `<p>Source segregation (wet/dry/hazardous), extended producer responsibility for e-waste, community composting, waste-to-energy with emission controls, and circular-economy design that reduces waste at the source all improve outcomes.</p>`,
  facts: [
    'Recycling one tonne of paper can save around 17 trees and thousands of litres of water.',
    'E-waste is one of the fastest-growing waste streams globally and contains valuable recoverable metals.',
    'Organic waste in landfills decomposes anaerobically, producing methane — a greenhouse gas over 25 times more potent than CO₂.'
  ],
  misconceptions: [
    '"All plastic is recyclable" — many plastic types are not economically or technically recyclable in most facilities.',
    '"Incineration eliminates waste completely" — it reduces volume but produces ash and air emissions that still need management.'
  ],
  quiz: [
    { q: 'Composting is best suited for which waste type?', options: ['E-waste', 'Organic/food waste', 'Glass', 'Metal'], correct: 1, explain: 'Composting decomposes organic matter into useful, nutrient-rich soil.' },
    { q: 'A major environmental drawback of landfilling organic waste is:', options: ['It produces compost automatically', 'Methane generation from anaerobic decomposition', 'It recycles metals', 'It has zero land use'], correct: 1, explain: 'Organic waste decomposing without oxygen in landfills releases methane, a potent greenhouse gas.' },
    { q: 'Recycling materials like paper and metal primarily helps by:', options: ['Increasing raw resource extraction', 'Conserving raw materials and energy', 'Increasing landfill volume', 'Producing more e-waste'], correct: 1, explain: 'Recycling reduces the need to extract and process new raw materials, saving energy.' },
    { q: 'E-waste requires special handling mainly because it:', options: ['Is always biodegradable', 'Contains toxic and valuable materials', 'Cannot be reused at all', 'Is lightweight'], correct: 1, explain: 'E-waste contains hazardous substances alongside valuable recoverable metals, requiring careful processing.' },
    { q: 'Which combination best reduces total landfill burden?', options: ['High landfill, low recycling', 'High recycling and composting, low landfill', 'Zero waste segregation', 'Burning all waste without controls'], correct: 1, explain: 'Diverting waste to recycling and composting streams reduces what ultimately reaches landfill.' }
  ],
  summary: `<p>The Waste Management & Recycling Studio shows how the split between composting, recycling, incineration and landfilling determines resource recovery, landfill growth and emissions — reinforcing the waste hierarchy of reduce, reuse and recycle.</p>`
};
