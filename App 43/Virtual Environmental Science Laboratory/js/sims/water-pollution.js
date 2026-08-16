'use strict';
SIMS.waterPollution = {
  id: 'waterPollution', title: 'Water Pollution Laboratory', icon: '🛢️',
  tagline: 'Contaminate and purify a river system while watching aquatic life respond',
  objectives: [
    'Identify major sources of water pollution',
    'Explain the relationship between dissolved oxygen and aquatic life',
    'Describe how toxins and turbidity affect water quality',
    'Evaluate purification and conservation techniques'
  ],
  controls: [
    { id: 'sewage', label: 'Sewage Discharge', min: 0, max: 100, step: 1, value: 30, unit: '%' },
    { id: 'plastic', label: 'Plastic Waste', min: 0, max: 100, step: 1, value: 25, unit: '%' },
    { id: 'industrial', label: 'Industrial Discharge', min: 0, max: 100, step: 1, value: 20, unit: '%' },
    { id: 'agriculture', label: 'Agricultural Runoff', min: 0, max: 100, step: 1, value: 25, unit: '%' },
    { id: 'purify', label: 'Purification Effort', min: 0, max: 100, step: 1, value: 20, unit: '%' }
  ],
  state: { dox: 8, toxicity: 15, clarity: 80, fish: 12, debris: [] },
  step(s, dt, c) {
    const pollutionLoad = (c.sewage * 1.1 + c.industrial * 1.3 + c.agriculture * 0.9 + c.plastic * 0.4) / 4;
    const purification = (c.purify / 100) * 0.9;
    s.dox = clamp(s.dox + (-pollutionLoad / 25 + purification * 3 + 0.15) * dt, 0.5, 12);
    s.toxicity = clamp(s.toxicity + (pollutionLoad * 0.5 - purification * 20) * dt * 0.4, 0, 100);
    s.clarity = clamp(s.clarity + ((c.plastic + c.sewage) * -0.3 + purification * 15) * dt * 0.4, 5, 100);
    const targetFish = clamp((s.dox / 9) * (1 - s.toxicity / 100) * 20, 0, 20);
    s.fish = lerp(s.fish, targetFish, dt * 0.5);
    if (Math.random() < (c.plastic + c.sewage) / 160) s.debris.push({ x: rand(0, 500), y: rand(120, 220), r: rand(2, 6), vx: rand(5, 20) });
    s.debris.forEach(d => d.x += d.vx * dt);
    s.debris = s.debris.filter(d => d.x < 520).slice(-60);
  },
  draw(ctx, s, W, H, c) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#C8E6C9'; ctx.fillRect(0, 0, W, H * 0.25);
    const clarity = s.clarity / 100;
    const waterColor = `rgb(${Math.round(120 - clarity * 60)},${Math.round(140 - s.toxicity)},${Math.round(90 + clarity * 100)})`;
    ctx.fillStyle = waterColor;
    ctx.fillRect(0, H * 0.25, W, H * 0.75);
    const scaleX = W / 500, scaleY = H / 220;
    // fish
    const fishCount = Math.round(s.fish / 2);
    for (let i = 0; i < fishCount; i++) {
      const fx = ((Date.now() / 30 + i * 60) % 480) * scaleX;
      const fy = (140 + (i % 4) * 15) * scaleY;
      ctx.fillStyle = '#FFB300';
      ctx.beginPath();
      ctx.ellipse(fx, fy, 8, 4, 0, 0, 7);
      ctx.fill();
    }
    // debris (plastic/oil)
    s.debris.forEach(d => {
      ctx.fillStyle = 'rgba(60,40,20,0.6)';
      ctx.beginPath(); ctx.arc(d.x * scaleX, d.y * scaleY, d.r, 0, 7); ctx.fill();
    });
    // toxicity haze
    ctx.fillStyle = '#4E342E';
    ctx.globalAlpha = clamp(s.toxicity / 200, 0, 0.5);
    ctx.fillRect(0, H * 0.25, W, H * 0.75);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#212121'; ctx.font = 'bold 12px Poppins,sans-serif';
    ctx.fillText(`Dissolved Oxygen: ${fmt(s.dox)} mg/L`, 10, 18);
  },
  indicators(s) {
    return [
      { label: 'Dissolved Oxygen', value: fmt(s.dox) + ' mg/L', warn: s.dox < 4 },
      { label: 'Toxicity', value: fmt(s.toxicity, 0) + '%', warn: s.toxicity > 60 },
      { label: 'Water Clarity', value: fmt(s.clarity, 0) + '%' },
      { label: 'Aquatic Life Index', value: fmt(s.fish, 0) + '/20', warn: s.fish < 6 }
    ];
  },
  channels: [
    { key: 'dox', label: 'DO mg/L', color: '#1976D2', decimals: 2 },
    { key: 'toxicity', label: 'Toxicity %', color: '#E53935' },
    { key: 'fish', label: 'Aquatic Life', color: '#43A047' }
  ],
  background: `<p>Water pollution occurs when contaminants — organic waste, plastics, industrial chemicals, or agricultural runoff carrying fertilizers and pesticides — enter water bodies. <b>Dissolved oxygen (DO)</b> is essential for fish and other aquatic organisms; DO drops when microbes decompose organic pollution, a process that consumes oxygen (biochemical oxygen demand). High <b>turbidity</b> reduces light penetration and disrupts photosynthesis by aquatic plants.</p>`,
  impact: `<p>Low dissolved oxygen causes fish kills and disrupts food webs. Toxic industrial discharge can bioaccumulate in organisms and enter the human food chain. Plastic debris entangles and is ingested by wildlife, persisting for centuries. Excess nutrients from agricultural runoff trigger algal blooms and eutrophication.</p>`,
  solutions: `<p>Wastewater treatment plants, industrial effluent standards, buffer strips along farms, plastic waste reduction, and constructed wetlands can restore water quality and dissolved oxygen levels.</p>`,
  facts: [
    'A healthy river typically has dissolved oxygen levels above 6-8 mg/L; below 2 mg/L most fish cannot survive.',
    'A single plastic bottle can take over 400 years to fully degrade in water.',
    'One litre of used engine oil can contaminate up to a million litres of fresh water.'
  ],
  misconceptions: [
    '"Clear water is always clean water" — many dissolved toxins and pathogens are invisible to the eye.',
    '"Dilution solves pollution" — persistent toxins can bioaccumulate up the food chain regardless of dilution.'
  ],
  quiz: [
    { q: 'Low dissolved oxygen in water primarily threatens:', options: ['Water clarity only', 'Aquatic organisms that need oxygen to survive', 'Rainfall patterns', 'Air quality'], correct: 1, explain: 'Fish and other aquatic organisms depend on adequate dissolved oxygen to survive.' },
    { q: 'Organic sewage lowers dissolved oxygen mainly because:', options: ['It blocks sunlight completely', 'Decomposer microbes consume oxygen breaking it down', 'It freezes the water', 'It increases water flow'], correct: 1, explain: 'Microbial decomposition of organic waste consumes dissolved oxygen (biochemical oxygen demand).' },
    { q: 'Eutrophication is triggered mainly by:', options: ['Excess nutrients like nitrates and phosphates', 'Low temperature', 'High dissolved oxygen', 'Low turbidity'], correct: 0, explain: 'Excess nutrients cause explosive algae growth, which later depletes oxygen as it decomposes.' },
    { q: 'Which pollutant is most associated with long-term persistence in oceans?', options: ['Plastic waste', 'Rainwater', 'Dissolved oxygen', 'Silt'], correct: 0, explain: 'Plastics can persist in water bodies for centuries without fully degrading.' },
    { q: 'A key purification step for sewage before release is:', options: ['Wastewater treatment', 'Adding more plastic filters', 'Increasing agricultural runoff', 'Ignoring turbidity'], correct: 0, explain: 'Treatment plants remove organic load and pathogens before water is released back to rivers.' }
  ],
  summary: `<p>The Water Pollution Laboratory shows how sewage, industrial discharge, agricultural runoff and plastic waste degrade dissolved oxygen, clarity, and aquatic life — and how purification efforts can reverse this damage and restore a healthy aquatic ecosystem.</p>`
};
