'use strict';
SIMS.sustainableTown = {
  id: 'sustainableTown', title: 'Sustainable Development Challenge', icon: '🏙️',
  tagline: 'Manage a growing town and balance the economy against the environment',
  objectives: [
    'Balance industrial growth, agriculture and forest cover',
    'Understand trade-offs between energy choices and air quality',
    'Track multiple sustainability indicators simultaneously',
    'Apply the concept of Sustainable Development Goals (SDGs) to decision-making'
  ],
  controls: [
    { id: 'industry', label: 'Industry Level', min: 0, max: 100, step: 1, value: 55, unit: '%' },
    { id: 'forestCover', label: 'Forest Cover Protected', min: 0, max: 100, step: 1, value: 40, unit: '%' },
    { id: 'renewable', label: 'Renewable Energy Share', min: 0, max: 100, step: 1, value: 30, unit: '%' },
    { id: 'publicTransport', label: 'Public Transport Share', min: 0, max: 100, step: 1, value: 35, unit: '%' },
    { id: 'recycling', label: 'Waste Recycling Share', min: 0, max: 100, step: 1, value: 30, unit: '%' },
    { id: 'waterConservation', label: 'Water Conservation Effort', min: 0, max: 100, step: 1, value: 30, unit: '%' }
  ],
  state: {
    carbonEmissions: 60, airQuality: 65, employment: 55, waterAvailability: 60,
    biodiversity: 60, publicHealth: 65, economicGrowth: 50, sustainability: 55
  },
  step(s, dt, c) {
    const dirtyEnergy = 100 - c.renewable;
    const traffic = 100 - c.publicTransport;
    s.carbonEmissions = clamp(s.carbonEmissions + (c.industry * 0.4 + dirtyEnergy * 0.3 + traffic * 0.2 - c.forestCover * 0.3) * dt * 0.3, 5, 100);
    s.airQuality = clamp(100 - s.carbonEmissions * 0.6 - traffic * 0.15 + c.recycling * 0.1, 5, 100);
    s.employment = clamp(40 + c.industry * 0.4 + c.renewable * 0.15, 5, 100);
    s.waterAvailability = clamp(70 - c.industry * 0.2 + c.waterConservation * 0.35, 5, 100);
    s.biodiversity = clamp(70 + c.forestCover * 0.3 - c.industry * 0.25 - s.carbonEmissions * 0.1, 5, 100);
    s.publicHealth = clamp((s.airQuality + s.waterAvailability) / 2 - s.carbonEmissions * 0.05, 5, 100);
    s.economicGrowth = clamp(30 + c.industry * 0.5 + s.employment * 0.2 - c.forestCover * 0.05, 5, 100);
    s.sustainability = clamp((s.airQuality + s.waterAvailability + s.biodiversity + s.publicHealth + s.economicGrowth + (100 - s.carbonEmissions)) / 6, 0, 100);
  },
  draw(ctx, s, W, H, c) {
    ctx.clearRect(0, 0, W, H);
    const health = s.sustainability / 100;
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, `rgb(${170 - health * 40},${205 - health * 20},${235 - health * 10})`);
    sky.addColorStop(1, '#ECEFF1');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.58);
    ctx.fillStyle = '#8D9E7C'; ctx.fillRect(0, H * 0.58, W, H * 0.42);
    // forest band
    const forestW = (c.forestCover / 100) * W * 0.3;
    for (let i = 0; i < forestW / 14; i++) {
      const tx = 10 + i * 14, ty = H * 0.58;
      ctx.fillStyle = '#5D4037'; ctx.fillRect(tx - 1, ty - 10, 2, 10);
      ctx.fillStyle = '#2E7D32'; ctx.beginPath(); ctx.arc(tx, ty - 14, 8, 0, 7); ctx.fill();
    }
    // buildings scale with industry
    const bCount = Math.round(c.industry / 10);
    for (let i = 0; i < bCount; i++) {
      const bx = W * 0.4 + i * 18, bh = 20 + (i % 5) * 10;
      ctx.fillStyle = '#607D8B'; ctx.fillRect(bx, H * 0.58 - bh, 14, bh);
      // smoke if low renewable
      if (c.renewable < 60 && i % 2 === 0) {
        ctx.fillStyle = 'rgba(90,90,90,0.35)';
        ctx.beginPath(); ctx.arc(bx + 7, H * 0.58 - bh - 10 - (Date.now() / 150 % 15), 5, 0, 7); ctx.fill();
      }
    }
    // wind turbines / solar for renewable share
    const renewCount = Math.round(c.renewable / 25);
    for (let i = 0; i < renewCount; i++) {
      const wx = W * 0.75 + i * 20;
      ctx.strokeStyle = '#78909C'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(wx, H * 0.58); ctx.lineTo(wx, H * 0.4); ctx.stroke();
      ctx.save(); ctx.translate(wx, H * 0.4); ctx.rotate(Date.now() / 300 + i);
      ctx.fillStyle = 'white';
      for (let k = 0; k < 3; k++) { ctx.save(); ctx.rotate(k * 2.1); ctx.fillRect(-2, -14, 4, 14); ctx.restore(); }
      ctx.restore();
    }
    // road with cars/buses
    ctx.fillStyle = '#424242'; ctx.fillRect(0, H * 0.9, W, 8);
    const carCount = 6;
    for (let i = 0; i < carCount; i++) {
      const isBus = i < Math.round((c.publicTransport / 100) * carCount);
      const cx = ((Date.now() / (isBus ? 40 : 25) + i * 90) % (W + 40)) - 20;
      ctx.fillStyle = isBus ? '#1976D2' : '#E53935';
      ctx.fillRect(cx, H * 0.885, isBus ? 26 : 14, 8);
    }
    ctx.fillStyle = '#212121'; ctx.font = 'bold 12px Poppins,sans-serif';
    ctx.fillText(`Sustainability Score: ${fmt(s.sustainability, 0)}/100`, 10, 18);
  },
  indicators(s) {
    return [
      { label: 'Sustainability Score', value: fmt(s.sustainability, 0), warn: s.sustainability < 40 },
      { label: 'Carbon Emissions', value: fmt(s.carbonEmissions, 0) + '%', warn: s.carbonEmissions > 70 },
      { label: 'Air Quality', value: fmt(s.airQuality, 0) + '%' },
      { label: 'Employment', value: fmt(s.employment, 0) + '%' },
      { label: 'Water Availability', value: fmt(s.waterAvailability, 0) + '%' },
      { label: 'Biodiversity', value: fmt(s.biodiversity, 0) + '%' },
      { label: 'Public Health', value: fmt(s.publicHealth, 0) + '%' },
      { label: 'Economic Growth', value: fmt(s.economicGrowth, 0) + '%' }
    ];
  },
  channels: [
    { key: 'sustainability', label: 'Sustainability', color: '#43A047' },
    { key: 'carbonEmissions', label: 'Emissions', color: '#E53935' },
    { key: 'economicGrowth', label: 'Economy', color: '#FFB300' },
    { key: 'biodiversity', label: 'Biodiversity', color: '#1976D2' }
  ],
  background: `<p>Sustainable development means meeting present needs — economic growth, employment, energy and food — without compromising the ability of future generations to meet their own needs. It requires balancing environmental, social and economic goals simultaneously, as reflected in the United Nations <b>Sustainable Development Goals (SDGs)</b>.</p>`,
  impact: `<p>Unchecked industrial growth without clean energy or forest protection raises emissions, degrades air and water quality, and erodes biodiversity — which eventually undermines the same economic growth and public health it was meant to support. True sustainability requires simultaneous attention to all these indicators, not optimizing one at the expense of others.</p>`,
  solutions: `<p>Investing in renewable energy, protecting forest cover, expanding public transport, improving recycling infrastructure, and conserving water are complementary strategies that can grow the economy while protecting environmental and public health indicators.</p>`,
  facts: [
    'The UN has defined 17 Sustainable Development Goals covering poverty, health, climate, and ecosystems, to be achieved by 2030.',
    'Cities occupy about 3% of Earth\'s land but consume over two-thirds of global energy and produce most greenhouse gas emissions.',
    'Investment in public transport can simultaneously reduce emissions, congestion and household transport costs.'
  ],
  misconceptions: [
    '"Economic growth and environmental protection always conflict" — well-designed policy (clean energy, efficiency) can grow the economy while reducing environmental harm.',
    '"Sustainability is only an environmental issue" — it equally involves social equity and economic viability alongside ecological health.'
  ],
  quiz: [
    { q: 'Sustainable development is best defined as:', options: ['Maximizing industry regardless of impact', 'Meeting present needs without compromising future generations', 'Stopping all economic growth', 'Focusing only on forest cover'], correct: 1, explain: 'This is the classic definition from the Brundtland Report, balancing present and future needs.' },
    { q: 'Increasing renewable energy share in a town primarily helps:', options: ['Raise carbon emissions', 'Lower carbon emissions and improve air quality', 'Reduce employment to zero', 'Eliminate need for water conservation'], correct: 1, explain: 'Renewable energy displaces fossil fuel combustion, reducing emissions and improving air quality.' },
    { q: 'Which combination best raises the overall sustainability score in this model?', options: ['High industry, low forest cover, low renewables', 'Balanced industry with high renewables, forest cover and public transport', 'Zero industry and zero energy use', 'High traffic, low recycling'], correct: 1, explain: 'A balanced approach across all indicators, not maximizing one variable alone, raises overall sustainability.' },
    { q: 'Public transport investment mainly helps sustainability by:', options: ['Increasing per-capita emissions', 'Reducing traffic-related emissions and congestion', 'Reducing employment', 'Increasing water use only'], correct: 1, explain: 'Shifting trips from private vehicles to public transport reduces per-capita emissions and congestion.' },
    { q: 'The SDGs (Sustainable Development Goals) address:', options: ['Only climate change', 'Only economic growth', 'A combination of social, economic and environmental goals', 'Only biodiversity'], correct: 2, explain: 'The 17 SDGs span poverty, health, education, climate, and ecosystems together.' }
  ],
  summary: `<p>The Sustainable Development Challenge shows that a town's economy, environment and public health are deeply interconnected — balanced investment in clean energy, forests, transport and recycling raises the overall sustainability score more effectively than maximizing industry alone.</p>`
};
