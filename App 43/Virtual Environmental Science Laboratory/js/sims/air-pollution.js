'use strict';
SIMS.airPollution = {
  id: 'airPollution', title: 'Air Pollution Laboratory', icon: '🏭',
  tagline: 'Combine pollution sources and control measures to manage air quality',
  objectives: [
    'Identify major sources of air pollution and their relative contributions',
    'Interpret the Air Quality Index (AQI) and its health categories',
    'Explain smog formation and its effect on visibility',
    'Evaluate pollution control measures and their impact on AQI'
  ],
  controls: [
    { id: 'vehicles', label: 'Vehicle Traffic', min: 0, max: 100, step: 1, value: 55, unit: '%' },
    { id: 'industry', label: 'Industrial Activity', min: 0, max: 100, step: 1, value: 45, unit: '%' },
    { id: 'fires', label: 'Forest Fires / Burning', min: 0, max: 100, step: 1, value: 10, unit: '%' },
    { id: 'controls', label: 'Pollution Control Measures', min: 0, max: 100, step: 1, value: 30, unit: '%' }
  ],
  state: { pm25: 40, aqi: 90, visibility: 70, acidRainRisk: 20, particles: [] },
  step(s, dt, c) {
    const emissions = (c.vehicles * 0.9 + c.industry * 1.2 + c.fires * 0.7);
    const mitigation = 1 - (c.controls / 100) * 0.75;
    const target = clamp(emissions * mitigation / 2.6, 5, 500);
    s.pm25 = lerp(s.pm25, target, dt * 0.8);
    s.aqi = clamp(s.pm25 * 2.1, 5, 500);
    s.visibility = clamp(100 - s.aqi / 4, 5, 100);
    s.acidRainRisk = clamp((c.industry * 0.6 + c.vehicles * 0.3) * mitigation / 1.2, 0, 100);
    if (Math.random() < 0.4 + emissions / 400) {
      s.particles.push({ x: rand(0, 500), y: rand(0, 200), r: rand(1, 3), vx: rand(-5, 15) });
    }
    s.particles.forEach(p => p.x += p.vx * dt);
    s.particles = s.particles.filter(p => p.x < 520).slice(-260);
  },
  draw(ctx, s, W, H, c) {
    ctx.clearRect(0, 0, W, H);
    const aqiColor = s.aqi < 50 ? '#43A047' : s.aqi < 100 ? '#FFB300' : s.aqi < 200 ? '#FB8C00' : '#E53935';
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    sky.addColorStop(0, '#B3E5FC'); sky.addColorStop(1, '#ECEFF1');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.65);
    // buildings
    ctx.fillStyle = '#607D8B';
    const bW = W / 12;
    for (let i = 0; i < 10; i++) {
      const bh = (i % 3 === 0 ? 0.45 : 0.3 + (i % 4) * 0.05) * H;
      ctx.fillRect(20 + i * bW, H * 0.65 - bh, bW * 0.7, bh);
    }
    // industry stacks with smoke proportional to industry
    const scaleX = W / 500, scaleY = H / 200;
    for (let i = 0; i < 3; i++) {
      const sx = (60 + i * 150) * scaleX;
      ctx.fillStyle = '#455A64';
      ctx.fillRect(sx, H * 0.55, 14, H * 0.15);
    }
    // smog overlay
    ctx.fillStyle = aqiColor;
    ctx.globalAlpha = clamp(s.aqi / 400, 0.05, 0.65);
    ctx.fillRect(0, 0, W, H * 0.65);
    ctx.globalAlpha = 1;
    // particles
    s.particles.forEach(p => {
      ctx.fillStyle = 'rgba(80,80,80,0.5)';
      ctx.beginPath(); ctx.arc(p.x * scaleX, p.y * scaleY, p.r, 0, 7); ctx.fill();
    });
    ctx.fillStyle = '#212121'; ctx.font = 'bold 13px Poppins,sans-serif';
    ctx.fillText(`AQI: ${fmt(s.aqi, 0)}`, 10, 20);
  },
  indicators(s) {
    const cat = s.aqi < 50 ? 'Good' : s.aqi < 100 ? 'Moderate' : s.aqi < 200 ? 'Unhealthy' : 'Hazardous';
    return [
      { label: 'AQI', value: fmt(s.aqi, 0) + ' (' + cat + ')', warn: s.aqi > 150 },
      { label: 'PM2.5', value: fmt(s.pm25, 0) + ' µg/m³', warn: s.pm25 > 100 },
      { label: 'Visibility', value: fmt(s.visibility, 0) + '%' },
      { label: 'Acid Rain Risk', value: fmt(s.acidRainRisk, 0) + '%', warn: s.acidRainRisk > 60 }
    ];
  },
  channels: [
    { key: 'aqi', label: 'AQI', color: '#E53935' },
    { key: 'pm25', label: 'PM2.5', color: '#8D6E63' },
    { key: 'visibility', label: 'Visibility %', color: '#26C6DA' }
  ],
  background: `<p>Air pollution results from particulate matter (PM2.5, PM10), gases (SO₂, NOₓ, CO, ozone) and aerosols released by vehicles, industry, and burning. The <b>Air Quality Index (AQI)</b> combines pollutant concentrations into a single number with health categories from Good to Hazardous. Fine particles reduce visibility by scattering light, producing <b>smog</b>, and can penetrate deep into lungs.</p>`,
  impact: `<p>Poor air quality causes respiratory and cardiovascular disease, reduces agricultural yields, damages materials, and contributes to acid rain when sulphur and nitrogen oxides react with atmospheric moisture, harming forests, soils, and aquatic ecosystems.</p>`,
  solutions: `<p>Emission controls (catalytic converters, scrubbers), a shift to electric and public transport, stricter industrial standards, and banning open burning of waste and crop residue all lower AQI and protect public health.</p>`,
  facts: [
    'PM2.5 particles are about 30 times smaller than the width of a human hair.',
    'The WHO estimates outdoor air pollution contributes to millions of premature deaths worldwide each year.',
    'Winter temperature inversions can trap pollutants near the ground, worsening smog episodes in many cities.'
  ],
  misconceptions: [
    '"Air pollution is only a problem in industrial areas" — pollutants travel long distances through wind and affect rural areas too.',
    '"Fog and smog are the same thing" — smog is a mixture of smoke and pollutants with fog/haze, not naturally occurring fog alone.'
  ],
  quiz: [
    { q: 'PM2.5 refers to:', options: ['Particles smaller than 2.5 micrometers', 'A pollution index score', 'A type of greenhouse gas', 'A vehicle emission standard'], correct: 0, explain: 'PM2.5 describes fine particulate matter with a diameter smaller than 2.5 micrometers.' },
    { q: 'Which single change would most directly reduce vehicle-related AQI?', options: ['Increasing traffic', 'Shifting to public/electric transport', 'Removing pollution controls', 'Reducing forest cover'], correct: 1, explain: 'Fewer combustion vehicles directly lowers emissions contributing to AQI.' },
    { q: 'Acid rain is primarily caused by:', options: ['CO₂ only', 'Sulphur and nitrogen oxide emissions', 'Water vapor', 'Ozone depletion'], correct: 1, explain: 'SO₂ and NOₓ react with atmospheric moisture to form sulphuric and nitric acid.' },
    { q: 'A high AQI value generally means:', options: ['Cleaner air', 'More hazardous air quality', 'Higher visibility', 'Lower particulate matter'], correct: 1, explain: 'Higher AQI values indicate worse air quality and greater health risk.' },
    { q: 'Smog reduces visibility mainly because:', options: ['It absorbs all sunlight', 'Particles scatter and block light', 'It increases oxygen levels', 'It cools the air instantly'], correct: 1, explain: 'Suspended particles and droplets scatter light, reducing how far one can see.' }
  ],
  summary: `<p>The Air Pollution Laboratory shows how vehicle, industrial, and burning emissions combine to raise AQI and PM2.5 while lowering visibility, and how control measures such as filters, cleaner fuels and transport shifts can bring air quality back to safe levels.</p>`
};
