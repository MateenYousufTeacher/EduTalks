'use strict';
SIMS.renewableEnergy = {
  id: 'renewableEnergy', title: 'Renewable Energy Laboratory', icon: '⚡',
  tagline: 'Build a clean energy mix from sun, wind, water and biomass',
  objectives: [
    'Compare output characteristics of solar, wind, hydro and biomass energy',
    'Explain how weather and resource availability affect renewable output',
    'Calculate carbon savings compared to fossil fuel generation',
    'Design a balanced, reliable renewable energy mix'
  ],
  controls: [
    { id: 'sun', label: 'Sunlight Intensity', min: 0, max: 100, step: 1, value: 70, unit: '%' },
    { id: 'wind', label: 'Wind Speed', min: 0, max: 100, step: 1, value: 50, unit: '%' },
    { id: 'water', label: 'Water Flow', min: 0, max: 100, step: 1, value: 60, unit: '%' },
    { id: 'biomass', label: 'Biomass Availability', min: 0, max: 100, step: 1, value: 40, unit: '%' }
  ],
  state: { solarOut: 0, windOut: 0, hydroOut: 0, bioOut: 0, blade: 0, carbonSaved: 0 },
  step(s, dt, c) {
    s.solarOut = lerp(s.solarOut, (c.sun / 100) * 50, dt);
    s.windOut = lerp(s.windOut, Math.pow(c.wind / 100, 1.5) * 45, dt);
    s.hydroOut = lerp(s.hydroOut, (c.water / 100) * 60, dt);
    s.bioOut = lerp(s.bioOut, (c.biomass / 100) * 30, dt);
    s.blade += (c.wind / 100) * dt * 6;
    const total = s.solarOut + s.windOut + s.hydroOut + s.bioOut;
    s.carbonSaved += total * dt * 0.25;
    s._total = total;
  },
  draw(ctx, s, W, H, c) {
    ctx.clearRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, '#B3E5FC'); sky.addColorStop(1, '#E3F2FD');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.68);
    ctx.fillStyle = '#43A047'; ctx.fillRect(0, H * 0.68, W, H * 0.32);
    // sun
    ctx.save(); ctx.globalAlpha = 0.4 + (c.sun / 100) * 0.6;
    ctx.fillStyle = '#FFB300'; ctx.beginPath(); ctx.arc(W * 0.85, H * 0.15, 24, 0, 7); ctx.fill();
    ctx.restore();
    // solar panels
    ctx.fillStyle = '#1565C0';
    ctx.save();
    ctx.translate(W * 0.15, H * 0.6);
    ctx.rotate(-0.3);
    ctx.fillRect(-40, -10, 80, 30);
    ctx.restore();
    ctx.globalAlpha = clamp(c.sun / 100, 0.1, 1);
    ctx.strokeStyle = '#FFEB3B';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(W * 0.15 - 30 + i * 20, H * 0.5); ctx.lineTo(W * 0.85, H * 0.18); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // wind turbine
    const tx = W * 0.4, ty = H * 0.55;
    ctx.strokeStyle = '#607D8B'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + 60); ctx.stroke();
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(s.blade);
    ctx.fillStyle = 'white';
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.rotate((i * 2 * Math.PI) / 3);
      ctx.beginPath(); ctx.ellipse(0, -20, 6, 20, 0, 0, 7); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    // hydro dam
    ctx.fillStyle = '#78909C'; ctx.fillRect(W * 0.6, H * 0.5, 14, H * 0.2);
    ctx.fillStyle = '#1976D2';
    ctx.globalAlpha = clamp(c.water / 100, 0.2, 1);
    for (let i = 0; i < 4; i++) {
      const yy = H * 0.5 + i * 8 + (Date.now() / 100 % 8);
      ctx.fillRect(W * 0.6 + 14, yy, 6, 4);
    }
    ctx.globalAlpha = 1;
    // biomass plant
    ctx.fillStyle = '#8D6E63'; ctx.fillRect(W * 0.78, H * 0.55, 30, 30);
    ctx.globalAlpha = clamp(c.biomass / 100, 0.1, 0.7);
    ctx.fillStyle = '#9E9E9E';
    ctx.beginPath(); ctx.arc(W * 0.78 + 15, H * 0.5 - (Date.now() / 200 % 20), 8, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#212121'; ctx.font = 'bold 12px Poppins,sans-serif';
    ctx.fillText(`Total Output: ${fmt(s._total || 0, 0)} kW`, 10, H - 8);
  },
  indicators(s) {
    return [
      { label: 'Solar', value: fmt(s.solarOut, 0) + ' kW' },
      { label: 'Wind', value: fmt(s.windOut, 0) + ' kW' },
      { label: 'Hydro', value: fmt(s.hydroOut, 0) + ' kW' },
      { label: 'Biomass', value: fmt(s.bioOut, 0) + ' kW' },
      { label: 'Carbon Saved', value: fmt(s.carbonSaved, 0) + ' kg CO₂' }
    ];
  },
  channels: [
    { key: 'solarOut', label: 'Solar kW', color: '#FFB300' },
    { key: 'windOut', label: 'Wind kW', color: '#26C6DA' },
    { key: 'hydroOut', label: 'Hydro kW', color: '#1976D2' },
    { key: 'bioOut', label: 'Biomass kW', color: '#8D6E63' }
  ],
  background: `<p>Renewable energy is generated from naturally replenishing sources. <b>Solar</b> panels convert sunlight into electricity via the photovoltaic effect. <b>Wind turbines</b> convert kinetic energy of moving air into electricity. <b>Hydropower</b> uses flowing or falling water to spin turbines. <b>Biomass</b> energy comes from burning or converting organic material. Each source is intermittent in different ways, so combining several improves overall reliability.</p>`,
  impact: `<p>Renewable energy displaces fossil fuel combustion, cutting greenhouse gas emissions and local air pollution. However, large-scale hydropower can disrupt river ecosystems and displace communities, wind farms can affect bird migration, and manufacturing solar panels and turbines has its own environmental footprint.</p>`,
  solutions: `<p>Diversifying the energy mix, pairing renewables with battery storage, careful siting studies to minimize ecological disruption, and recycling programs for solar panels and turbine blades improve the sustainability of renewable systems.</p>`,
  facts: [
    'Solar and wind are now among the cheapest sources of new electricity generation in many parts of the world.',
    'A single large wind turbine can power over a thousand homes at full output.',
    'Hydropower currently supplies more renewable electricity worldwide than solar and wind combined.'
  ],
  misconceptions: [
    '"Renewable energy is always available" — solar and wind output depend on weather and time of day, requiring storage or backup.',
    '"Renewable energy has zero environmental impact" — manufacturing, land use and disposal still carry environmental costs, though far lower than fossil fuels.'
  ],
  quiz: [
    { q: 'Which factor most directly affects solar panel output?', options: ['Wind speed', 'Sunlight intensity', 'Water flow', 'Biomass supply'], correct: 1, explain: 'Solar photovoltaic output scales with the intensity of sunlight reaching the panels.' },
    { q: 'A key challenge with wind and solar power is:', options: ['They produce more emissions than coal', 'Their output is intermittent and weather-dependent', 'They cannot generate electricity at all', 'They only work at night'], correct: 1, explain: 'Wind and solar output varies with weather conditions, requiring storage or backup power.' },
    { q: 'Hydropower generates electricity by:', options: ['Burning organic material', 'Using flowing/falling water to spin turbines', 'Converting sunlight directly', 'Capturing wind kinetic energy'], correct: 1, explain: 'Hydropower plants use the movement of water to turn turbines connected to generators.' },
    { q: 'Combining multiple renewable sources mainly improves:', options: ['Fossil fuel use', 'Overall reliability of supply', 'Carbon emissions from renewables', 'Cost of solar panels only'], correct: 1, explain: 'Different renewables peak at different times/conditions, so a diverse mix improves overall grid reliability.' },
    { q: 'A potential ecological concern with large hydropower dams is:', options: ['Zero water flow change', 'Disruption of river ecosystems and fish migration', 'Increased air pollution', 'Reduced water availability everywhere'], correct: 1, explain: 'Dams can block fish migration routes and alter downstream river ecosystems significantly.' }
  ],
  summary: `<p>The Renewable Energy Laboratory demonstrates how solar, wind, hydro and biomass respond differently to resource availability, and how combining them in a balanced mix increases total clean output and carbon savings while improving reliability.</p>`
};
