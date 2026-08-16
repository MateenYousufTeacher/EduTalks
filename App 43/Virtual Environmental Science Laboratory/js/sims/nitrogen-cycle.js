'use strict';
SIMS.nitrogenCycle = {
  id: 'nitrogenCycle', title: 'Nitrogen Cycle Laboratory', icon: '🧪',
  tagline: 'Follow nitrogen through fixation, nitrification, uptake and denitrification',
  objectives: [
    'Describe nitrogen fixation, nitrification, ammonification and denitrification',
    'Explain how fertilizer use alters the natural nitrogen cycle',
    'Relate soil microbe activity to nitrogen availability for crops',
    'Assess the effect of excess nitrogen on ecosystems (eutrophication)'
  ],
  controls: [
    { id: 'fertilizer', label: 'Fertilizer Use', min: 0, max: 100, step: 1, value: 40, unit: '%' },
    { id: 'rainfall', label: 'Rainfall', min: 0, max: 100, step: 1, value: 50, unit: '%' },
    { id: 'microbes', label: 'Soil Microbe Activity', min: 0, max: 100, step: 1, value: 60, unit: '%' },
    { id: 'crop', label: 'Crop Growth Demand', min: 0, max: 100, step: 1, value: 50, unit: '%' }
  ],
  state: { n2: 100, soilNitrate: 30, plantN: 20, leached: 0, denitrified: 0, flow: 0 },
  step(s, dt, c) {
    const fixation = (c.microbes / 100) * 1.2;
    const fertilizerInput = (c.fertilizer / 100) * 2.5;
    const nitrification = (c.microbes / 100) * (s.soilNitrate > 0 ? 1 : 0) * 1.5;
    const uptake = (c.crop / 100) * clamp(s.soilNitrate / 40, 0, 1) * 2.0;
    const leaching = (c.rainfall / 100) * clamp(s.soilNitrate / 50, 0, 1) * 1.8;
    const denitrification = (1 - c.microbes / 100) * 0.4 + (c.rainfall / 100) * 0.3;

    s.soilNitrate = clamp(s.soilNitrate + (fixation + fertilizerInput + nitrification - uptake - leaching - denitrification) * dt * 3, 0, 100);
    s.plantN = clamp(s.plantN + (uptake - uptake * 0.3) * dt * 3, 0, 100);
    s.leached = clamp(s.leached + leaching * dt * 3, 0, 100);
    s.denitrified = clamp(s.denitrified + denitrification * dt * 3, 0, 100);
    s.flow += dt;
  },
  draw(ctx, s, W, H, c) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#E3F2FD'; ctx.fillRect(0, 0, W, H * 0.35);
    ctx.fillStyle = '#D7CCC8'; ctx.fillRect(0, H * 0.35, W, H * 0.65);
    ctx.fillStyle = '#212121'; ctx.font = 'bold 12px Poppins,sans-serif';
    ctx.fillText('Atmosphere (N₂ 78%)', 10, 20);
    ctx.fillText('Soil', 10, H * 0.35 + 20);

    const nodes = {
      n2: { x: 0.5, y: 0.15 }, fixation: { x: 0.25, y: 0.42 }, nitrate: { x: 0.5, y: 0.62 },
      plant: { x: 0.78, y: 0.42 }, leach: { x: 0.85, y: 0.85 }, denitrify: { x: 0.15, y: 0.85 }
    };
    const P = k => ({ x: nodes[k].x * W, y: nodes[k].y * H });
    const arrows = [
      ['n2', 'fixation', '#1976D2'], ['fixation', 'nitrate', '#43A047'],
      ['nitrate', 'plant', '#2E7D32'], ['nitrate', 'leach', '#FFB300'],
      ['nitrate', 'denitrify', '#8D6E63'], ['denitrify', 'n2', '#607D8B']
    ];
    arrows.forEach(([a, b, color]) => {
      const pa = P(a), pb = P(b);
      ctx.strokeStyle = color; ctx.globalAlpha = 0.5; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      ctx.globalAlpha = 1;
      const t = (s.flow * 0.4 + (a.length)) % 1;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(pa.x + (pb.x - pa.x) * t, pa.y + (pb.y - pa.y) * t, 3.5, 0, 7); ctx.fill();
    });
    const labels = { n2: 'N₂ Gas', fixation: 'Fixation', nitrate: `Soil Nitrate\n${fmt(s.soilNitrate,0)}%`, plant: `Plant Uptake\n${fmt(s.plantN,0)}%`, leach: 'Leaching', denitrify: 'Denitrification' };
    Object.entries(nodes).forEach(([k, n]) => {
      const p = { x: n.x * W, y: n.y * H };
      ctx.fillStyle = k === 'nitrate' ? '#FFB300' : '#43A047';
      ctx.beginPath(); ctx.arc(p.x, p.y, k === 'nitrate' ? 28 : 22, 0, 7); ctx.fill();
      ctx.fillStyle = 'white'; ctx.font = 'bold 9px Poppins,sans-serif'; ctx.textAlign = 'center';
      labels[k].split('\n').forEach((line, i) => ctx.fillText(line, p.x, p.y + i * 10 + 3));
      ctx.textAlign = 'left';
    });
  },
  indicators(s) {
    return [
      { label: 'Soil Nitrate', value: fmt(s.soilNitrate) + '%' },
      { label: 'Plant Nitrogen', value: fmt(s.plantN) + '%' },
      { label: 'Leached (runoff risk)', value: fmt(s.leached) + '%', warn: s.leached > 60 },
      { label: 'Denitrified to air', value: fmt(s.denitrified) + '%' }
    ];
  },
  channels: [
    { key: 'soilNitrate', label: 'Soil Nitrate', color: '#FFB300' },
    { key: 'plantN', label: 'Plant N', color: '#43A047' },
    { key: 'leached', label: 'Leached', color: '#E53935' }
  ],
  background: `<p>Nitrogen makes up 78% of the atmosphere but must be "fixed" into usable forms before organisms can use it. <b>Nitrogen fixation</b> (by bacteria, lightning, or industrial processes) converts N₂ into ammonia. <b>Nitrification</b> converts ammonia into nitrites and nitrates that plants absorb. When organisms die, <b>ammonification</b> returns nitrogen to the soil, and <b>denitrification</b> by bacteria converts nitrates back into atmospheric N₂, completing the cycle.</p>`,
  impact: `<p>Excess fertilizer use overwhelms the natural cycle: surplus nitrate leaches into rivers and lakes causing <b>eutrophication</b> — explosive algae growth that depletes dissolved oxygen and kills aquatic life. Nitrous oxide released from over-fertilized soils is also a potent greenhouse gas.</p>`,
  solutions: `<p>Precision fertilizer application, crop rotation with nitrogen-fixing legumes, buffer strips along waterways, and organic composting reduce nitrogen losses while maintaining soil fertility.</p>`,
  facts: [
    'Legumes like beans and peas host bacteria in root nodules that fix atmospheric nitrogen naturally.',
    'Industrial nitrogen fixation (the Haber-Bosch process) now fixes more nitrogen than all natural processes combined.',
    'Excess nitrogen runoff is a leading cause of "dead zones" in coastal waters worldwide.'
  ],
  misconceptions: [
    '"More fertilizer always means more crop growth" — beyond a point, excess nitrogen is wasted, leached, or harms the crop.',
    '"Nitrogen gas in the air is directly usable by plants" — plants can only absorb fixed forms like nitrate or ammonium, not N₂ gas.'
  ],
  quiz: [
    { q: 'What is nitrogen fixation?', options: ['Plants absorbing nitrate', 'Converting N₂ gas into usable compounds', 'Bacteria releasing N₂ to air', 'Nitrogen leaching into rivers'], correct: 1, explain: 'Fixation converts inert atmospheric N₂ into forms like ammonia that organisms can use.' },
    { q: 'Excess nitrate runoff into water bodies commonly causes:', options: ['Increased dissolved oxygen', 'Eutrophication and oxygen depletion', 'Cooler water temperatures', 'Reduced algae growth'], correct: 1, explain: 'Excess nutrients trigger algal blooms that later decompose and consume dissolved oxygen.' },
    { q: 'Which process returns nitrogen from soil back to the atmosphere as N₂?', options: ['Nitrification', 'Ammonification', 'Denitrification', 'Assimilation'], correct: 2, explain: 'Denitrifying bacteria convert soil nitrates back into atmospheric nitrogen gas.' },
    { q: 'Legume crops help soil fertility because they:', options: ['Absorb all soil nitrogen', 'Host nitrogen-fixing bacteria', 'Repel soil microbes', 'Increase leaching'], correct: 1, explain: 'Root nodule bacteria in legumes convert atmospheric nitrogen into usable forms, enriching soil.' },
    { q: 'Heavy rainfall mainly increases which process in this simulation?', options: ['Fixation', 'Leaching', 'Plant uptake efficiency', 'Atmospheric N₂'], correct: 1, explain: 'Rainfall washes soluble soil nitrate out of the soil profile, a process called leaching.' }
  ],
  summary: `<p>The Nitrogen Cycle Laboratory demonstrates how fixation, nitrification, plant uptake, leaching and denitrification interact — and how excessive fertilizer application can overload the natural cycle, driving nitrogen losses that harm downstream ecosystems.</p>`
};
