'use strict';
SIMS.climateChange = {
  id: 'climateChange', title: 'Climate Change Simulator', icon: '🌡️',
  tagline: 'Project long-term global impacts of emissions, land use and clean energy adoption',
  objectives: [
    'Explain the greenhouse effect and its link to global temperature',
    'Predict long-term effects of emissions on sea level and ice cover',
    'Analyze the relationship between deforestation, population and warming',
    'Evaluate how renewable adoption can moderate future warming'
  ],
  controls: [
    { id: 'ghg', label: 'Greenhouse Gas Emissions', min: 0, max: 100, step: 1, value: 65, unit: '%' },
    { id: 'deforest', label: 'Deforestation Rate', min: 0, max: 100, step: 1, value: 35, unit: '%' },
    { id: 'renewable', label: 'Renewable Adoption', min: 0, max: 100, step: 1, value: 25, unit: '%' },
    { id: 'population', label: 'Population Growth', min: 0, max: 100, step: 1, value: 50, unit: '%' }
  ],
  state: { temp: 1.1, seaLevel: 0, iceCover: 100, biodiversity: 100, years: 0, storms: [] },
  step(s, dt, c) {
    const warmingForce = (c.ghg * 0.9 + c.deforest * 0.3 + c.population * 0.2 - c.renewable * 0.7) / 100;
    s.temp = clamp(s.temp + warmingForce * dt * 0.15, 0.5, 6);
    s.seaLevel = clamp(s.seaLevel + s.temp * dt * 0.4, 0, 200);
    s.iceCover = clamp(s.iceCover - s.temp * dt * 1.6, 5, 100);
    s.biodiversity = clamp(s.biodiversity - s.temp * dt * 1.2, 5, 100);
    s.years += dt * 2;
    if (Math.random() < s.temp / 40) s.storms.push({ x: rand(0, 500), y: rand(20, 60), age: 0 });
    s.storms.forEach(st => st.age += dt);
    s.storms = s.storms.filter(st => st.age < 3);
  },
  draw(ctx, s, W, H, c) {
    ctx.clearRect(0, 0, W, H);
    const warmth = clamp(s.temp / 5, 0, 1);
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    sky.addColorStop(0, `rgb(${140 + warmth * 100},${190 - warmth * 90},${230 - warmth * 120})`);
    sky.addColorStop(1, '#F5F7FA');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.62);
    // ocean level
    ctx.fillStyle = '#1976D2';
    const seaY = H * 0.62 - (s.seaLevel / 200) * H * 0.15;
    ctx.fillRect(0, seaY, W, H - seaY);
    // ice caps shrinking
    ctx.fillStyle = 'white';
    const iceW = (s.iceCover / 100) * W * 0.22;
    ctx.beginPath(); ctx.moveTo(0, seaY); ctx.lineTo(iceW, seaY); ctx.lineTo(iceW * 0.6, seaY - 26); ctx.lineTo(0, seaY - 20); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W, seaY); ctx.lineTo(W - iceW, seaY); ctx.lineTo(W - iceW * 0.6, seaY - 26); ctx.lineTo(W, seaY - 20); ctx.closePath(); ctx.fill();
    // storms
    s.storms.forEach(st => {
      ctx.fillStyle = 'rgba(90,90,110,0.6)';
      ctx.beginPath(); ctx.arc((st.x / 500) * W, (st.y / 100) * H * 0.5, 16, 0, 7); ctx.fill();
    });
    // thermometer
    const tx = W - 26, tTop = 20, tBot = H * 0.5;
    ctx.strokeStyle = '#212121'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(tx, tTop); ctx.lineTo(tx, tBot); ctx.stroke();
    ctx.fillStyle = '#E53935';
    ctx.beginPath(); ctx.arc(tx, tBot + 8, 8, 0, 7); ctx.fill();
    const fillH = clamp((s.temp / 6) * (tBot - tTop), 4, tBot - tTop);
    ctx.fillRect(tx - 3, tBot - fillH, 6, fillH);
    ctx.fillStyle = '#212121'; ctx.font = 'bold 12px Poppins,sans-serif';
    ctx.fillText(`+${fmt(s.temp)}°C`, tx - 34, tTop - 4);
    ctx.fillText(`Year +${fmt(s.years, 0)}`, 10, 18);
  },
  indicators(s) {
    return [
      { label: 'Global Temp Rise', value: '+' + fmt(s.temp) + '°C', warn: s.temp > 2.5 },
      { label: 'Sea Level Rise', value: fmt(s.seaLevel, 0) + ' cm', warn: s.seaLevel > 100 },
      { label: 'Polar Ice Cover', value: fmt(s.iceCover, 0) + '%', warn: s.iceCover < 40 },
      { label: 'Biodiversity Index', value: fmt(s.biodiversity, 0) + '%', warn: s.biodiversity < 40 }
    ];
  },
  channels: [
    { key: 'temp', label: 'Temp Rise °C', color: '#E53935', decimals: 2 },
    { key: 'seaLevel', label: 'Sea Level cm', color: '#1976D2', decimals: 0 },
    { key: 'iceCover', label: 'Ice Cover %', color: '#26C6DA' },
    { key: 'biodiversity', label: 'Biodiversity %', color: '#43A047' }
  ],
  background: `<p>The <b>greenhouse effect</b> is a natural process where gases like CO₂ and methane trap heat in the atmosphere, keeping Earth habitable. Human emissions have intensified this effect, raising global average temperatures. Warming causes polar ice and glaciers to melt, contributing to <b>sea level rise</b>, and shifts weather patterns toward more frequent extreme events such as heatwaves, storms and droughts.</p>`,
  impact: `<p>Rising temperatures threaten food and water security, coastal cities face flooding from sea level rise, and many species face habitat loss faster than they can adapt or migrate, straining biodiversity. Vulnerable communities with the fewest resources are often hit hardest despite contributing least to emissions.</p>`,
  solutions: `<p>Transitioning to renewable energy, protecting and restoring forests, improving energy efficiency, sustainable agriculture, and international cooperation on emission reduction targets (e.g., Paris Agreement) are central strategies to limit future warming.</p>`,
  facts: [
    'Global average temperature has already risen by more than 1°C since the pre-industrial era.',
    'The Arctic is warming roughly four times faster than the global average.',
    'Limiting warming to 1.5°C above pre-industrial levels was set as a key goal of the Paris Agreement.'
  ],
  misconceptions: [
    '"A single cold winter disproves climate change" — climate change refers to long-term shifts in average conditions, not any single weather event.',
    '"The greenhouse effect itself is bad" — the natural greenhouse effect is essential for life; the problem is its human-caused intensification.'
  ],
  quiz: [
    { q: 'The greenhouse effect naturally does what?', options: ['Cools the Earth completely', 'Traps heat to keep Earth habitable', 'Blocks all sunlight', 'Creates polar ice'], correct: 1, explain: 'Greenhouse gases naturally trap some heat, keeping average temperatures suitable for life.' },
    { q: 'Rising global temperatures are most directly linked to:', options: ['Reduced ice cover and rising seas', 'Increased polar ice', 'Falling sea levels', 'Stable biodiversity'], correct: 0, explain: 'Warming melts ice and causes thermal expansion of oceans, contributing to sea level rise.' },
    { q: 'Which action would most reduce future warming in this model?', options: ['Increasing deforestation', 'Increasing renewable adoption', 'Increasing greenhouse gas emissions', 'Ignoring population growth'], correct: 1, explain: 'Higher renewable adoption reduces the warming forcing in the simulation by displacing fossil fuel emissions.' },
    { q: 'A single unusually cold winter is best explained as:', options: ['Proof climate change is false', 'Normal weather variability within a warming climate', 'A sign of global cooling', 'Unrelated to weather patterns'], correct: 1, explain: 'Weather varies naturally year to year even as long-term climate trends toward warming.' },
    { q: 'Biodiversity loss under climate change mainly results from:', options: ['Habitats changing faster than species can adapt', 'Increased polar ice', 'Lower greenhouse gases', 'Stable rainfall everywhere'], correct: 0, explain: 'Rapid changes in temperature and habitat often outpace species\' ability to adapt or migrate.' }
  ],
  summary: `<p>The Climate Change Simulator projects how greenhouse gas emissions, deforestation and population growth combine to raise global temperature, melt ice, raise sea levels and stress biodiversity — and shows how renewable energy adoption can moderate these long-term trends.</p>`
};
