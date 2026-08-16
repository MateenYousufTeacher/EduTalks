'use strict';
SIMS.biodiversity = {
  id: 'biodiversity', title: 'Biodiversity & Conservation Explorer', icon: '🦋',
  tagline: 'Balance a food web against habitat loss, pollution and invasive species',
  objectives: [
    'Explain trophic relationships between producers, consumers and decomposers',
    'Analyze how habitat loss and pollution affect population stability',
    'Describe the impact of invasive species on native ecosystems',
    'Evaluate conservation strategies that restore ecosystem stability'
  ],
  controls: [
    { id: 'habitatLoss', label: 'Habitat Loss', min: 0, max: 100, step: 1, value: 25, unit: '%' },
    { id: 'pollution', label: 'Pollution Level', min: 0, max: 100, step: 1, value: 20, unit: '%' },
    { id: 'climateStress', label: 'Climate Stress', min: 0, max: 100, step: 1, value: 20, unit: '%' },
    { id: 'invasive', label: 'Invasive Species Pressure', min: 0, max: 100, step: 1, value: 15, unit: '%' }
  ],
  state: { plants: 80, herbivores: 50, carnivores: 25, pollinators: 60, decomposers: 55, stability: 100 },
  step(s, dt, c) {
    const stress = (c.habitatLoss + c.pollution + c.climateStress + c.invasive) / 400;
    s.plants = clamp(s.plants + (2 - stress * 4 - s.herbivores * 0.01) * dt * 2, 5, 100);
    s.pollinators = clamp(s.pollinators + (s.plants * 0.02 - stress * 3) * dt * 2, 2, 100);
    s.herbivores = clamp(s.herbivores + (s.plants * 0.015 - s.carnivores * 0.02 - stress * 3) * dt * 2, 2, 100);
    s.carnivores = clamp(s.carnivores + (s.herbivores * 0.015 - stress * 2.5) * dt * 2, 1, 100);
    s.decomposers = clamp(s.decomposers + (1 - stress * 2.5) * dt * 2, 2, 100);
    s.stability = clamp((s.plants + s.herbivores + s.carnivores + s.pollinators + s.decomposers) / 5, 0, 100);
  },
  draw(ctx, s, W, H, c) {
    ctx.clearRect(0, 0, W, H);
    const health = s.stability / 100;
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    sky.addColorStop(0, `rgb(${180-health*40},${210-health*10},${240-health*20})`); sky.addColorStop(1, '#F1F8E9');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.62);
    ctx.fillStyle = `rgb(${120-health*40},${160+health*40},${90})`;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);
    // trees (plants)
    const treeCount = Math.round(s.plants / 12);
    for (let i = 0; i < treeCount; i++) {
      const tx = 20 + i * (W - 40) / 8, ty = H * 0.62;
      ctx.fillStyle = '#6D4C41'; ctx.fillRect(tx - 2, ty - 14, 4, 14);
      ctx.fillStyle = '#2E7D32'; ctx.beginPath(); ctx.arc(tx, ty - 18, 12, 0, 7); ctx.fill();
    }
    // pollinators (bees) small dots
    for (let i = 0; i < Math.round(s.pollinators / 15); i++) {
      const bx = ((Date.now() / 20 + i * 70) % (W - 20)) + 10;
      const by = H * 0.3 + Math.sin(Date.now() / 300 + i) * 10;
      ctx.fillStyle = '#FFB300'; ctx.beginPath(); ctx.arc(bx, by, 3, 0, 7); ctx.fill();
    }
    // herbivores (deer icons as ellipses)
    for (let i = 0; i < Math.round(s.herbivores / 12); i++) {
      const dx = 30 + i * 55, dy = H * 0.85;
      ctx.fillStyle = '#A1887F';
      ctx.beginPath(); ctx.ellipse(dx, dy, 12, 7, 0, 0, 7); ctx.fill();
    }
    // carnivores (wolves) fewer, darker
    for (let i = 0; i < Math.round(s.carnivores / 10); i++) {
      const dx = 60 + i * 90, dy = H * 0.92;
      ctx.fillStyle = '#424242';
      ctx.beginPath(); ctx.ellipse(dx, dy, 14, 7, 0, 0, 7); ctx.fill();
    }
    ctx.fillStyle = '#212121'; ctx.font = 'bold 12px Poppins,sans-serif';
    ctx.fillText(`Ecosystem Stability: ${fmt(s.stability, 0)}%`, 10, 18);
  },
  indicators(s) {
    return [
      { label: 'Stability Index', value: fmt(s.stability, 0) + '%', warn: s.stability < 40 },
      { label: 'Plants', value: fmt(s.plants, 0) },
      { label: 'Herbivores', value: fmt(s.herbivores, 0) },
      { label: 'Carnivores', value: fmt(s.carnivores, 0) },
      { label: 'Pollinators', value: fmt(s.pollinators, 0) }
    ];
  },
  channels: [
    { key: 'stability', label: 'Stability %', color: '#43A047' },
    { key: 'herbivores', label: 'Herbivores', color: '#A1887F' },
    { key: 'carnivores', label: 'Carnivores', color: '#424242' },
    { key: 'pollinators', label: 'Pollinators', color: '#FFB300' }
  ],
  background: `<p>Biodiversity refers to the variety of life at genetic, species and ecosystem levels. Ecosystems rely on <b>producers</b> (plants), <b>consumers</b> (herbivores and carnivores), <b>pollinators</b>, and <b>decomposers</b> that recycle nutrients. Energy flows through these trophic levels in a food web; removing or overloading any level can destabilize the whole system.</p>`,
  impact: `<p>Habitat loss from land conversion, pollution, climate stress, and invasive species that outcompete natives are the leading drivers of biodiversity decline worldwide. Loss of pollinators threatens food production; loss of predators can cause herbivore overpopulation and vegetation collapse.</p>`,
  solutions: `<p>Protected areas, wildlife corridors connecting fragmented habitats, invasive species control, pollution reduction, and community-based conservation programs help restore and maintain ecosystem stability.</p>`,
  facts: [
    'Pollinators like bees are responsible for roughly a third of global food crop production.',
    'Invasive species are considered one of the top five direct drivers of biodiversity loss globally.',
    'Wildlife corridors can help species migrate between fragmented habitats as climate zones shift.'
  ],
  misconceptions: [
    '"Removing predators only helps prey species" — without predators, herbivore populations can explode and overgraze vegetation, harming the whole ecosystem.',
    '"One invasive species has minimal impact" — even a single aggressive invasive species can outcompete multiple natives and reshape an entire food web.'
  ],
  quiz: [
    { q: 'Which group in an ecosystem recycles dead organic matter?', options: ['Producers', 'Herbivores', 'Decomposers', 'Pollinators'], correct: 2, explain: 'Decomposers like fungi and bacteria break down dead material, recycling nutrients back into the ecosystem.' },
    { q: 'Loss of pollinators most directly threatens:', options: ['Rock formations', 'Reproduction of many flowering plants and crops', 'Decomposer populations only', 'Carnivore digestion'], correct: 1, explain: 'Many plants and food crops depend on pollinators for reproduction and fruit/seed production.' },
    { q: 'Removing top predators from an ecosystem often leads to:', options: ['Herbivore population booms and vegetation loss', 'Immediate increase in plant biomass', 'No ecological effect', 'Increase in decomposer diversity'], correct: 0, explain: 'Without predation pressure, herbivore populations can grow unchecked and overconsume vegetation.' },
    { q: 'Invasive species typically harm native ecosystems by:', options: ['Providing more food for natives', 'Outcompeting native species for resources', 'Increasing biodiversity permanently', 'Improving pollination only'], correct: 1, explain: 'Invasive species often outcompete natives for food, space or resources, reducing native populations.' },
    { q: 'Wildlife corridors help conservation mainly by:', options: ['Isolating populations completely', 'Connecting fragmented habitats for species movement', 'Increasing pollution', 'Removing decomposers'], correct: 1, explain: 'Corridors allow species to move between habitat patches, supporting genetic diversity and migration.' }
  ],
  summary: `<p>The Biodiversity & Conservation Explorer shows how habitat loss, pollution, climate stress and invasive species pressure ripple through a food web — and how conservation measures can restore stability across plants, herbivores, carnivores, pollinators and decomposers.</p>`
};
