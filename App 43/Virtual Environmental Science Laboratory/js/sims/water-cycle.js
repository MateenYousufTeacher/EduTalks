'use strict';
SIMS.waterCycle = {
  id: 'waterCycle', title: 'Water Cycle Simulator', icon: '💧',
  tagline: 'Drive evaporation, condensation and rainfall by controlling the atmosphere',
  objectives: [
    'Explain how temperature and solar radiation drive evaporation',
    'Relate humidity and wind to cloud formation and condensation',
    'Predict when rainfall or snowfall will occur',
    'Describe groundwater recharge and surface runoff pathways'
  ],
  controls: [
    { id: 'temp', label: 'Temperature', min: -5, max: 45, step: 1, value: 25, unit: '°C' },
    { id: 'humidity', label: 'Humidity', min: 10, max: 100, step: 1, value: 45, unit: '%' },
    { id: 'wind', label: 'Wind Speed', min: 0, max: 40, step: 1, value: 10, unit: ' km/h' },
    { id: 'solar', label: 'Solar Radiation', min: 0, max: 100, step: 1, value: 70, unit: '%' }
  ],
  state: { vapor: 20, cloud: 10, rainAccum: 0, groundwater: 30, runoff: 0, drops: [], clouds: [{x:120,y:60,s:1},{x:260,y:40,s:0.8},{x:380,y:75,s:1.2}] },
  step(s, dt, c) {
    const evapRate = clamp((c.temp + 10) / 60, 0, 1) * clamp(c.solar / 100, 0.1, 1) * 6;
    s.vapor = clamp(s.vapor + evapRate * dt * 5 - 0.4 * dt, 0, 100);
    const condenseRate = (s.vapor / 100) * (c.humidity / 100) * 8;
    s.cloud = clamp(s.cloud + condenseRate * dt * 3 - 0.5 * dt, 0, 100);
    s.clouds.forEach(cl => { cl.x += (c.wind / 40) * dt * 30; if (cl.x > 480) cl.x = -40; });
    const raining = s.cloud > 60;
    if (raining) {
      s.vapor = clamp(s.vapor - 4 * dt, 0, 100);
      s.cloud = clamp(s.cloud - 6 * dt, 0, 100);
      s.rainAccum += dt * (s.cloud / 60);
      if (Math.random() < 0.6) s.drops.push({ x: rand(20, 460), y: 60, v: rand(120, 200) });
      const infiltration = c.temp < 5 ? 0.2 : 0.6;
      s.groundwater = clamp(s.groundwater + s.rainAccum * infiltration * dt * 2, 0, 100);
      s.runoff = clamp(s.runoff + s.rainAccum * (1 - infiltration) * dt * 2, 0, 100);
    } else {
      s.runoff = clamp(s.runoff - dt * 2, 0, 100);
    }
    s.drops.forEach(d => d.y += d.v * dt);
    s.drops = s.drops.filter(d => d.y < 260);
    s.groundwater = clamp(s.groundwater - dt * 0.15, 0, 100);
    s._raining = raining; s._snow = raining && c.temp <= 0;
  },
  draw(ctx, s, W, H, c) {
    ctx.clearRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0, '#87CEEB'); sky.addColorStop(1, '#E3F2FD');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.68);
    // sun
    ctx.save();
    ctx.globalAlpha = 0.3 + (c.solar / 100) * 0.7;
    ctx.fillStyle = '#FFB300';
    ctx.beginPath(); ctx.arc(W - 60, 50, 26, 0, 7); ctx.fill();
    ctx.restore();
    // ground + river
    ctx.fillStyle = '#43A047'; ctx.fillRect(0, H * 0.68, W, H * 0.32);
    ctx.fillStyle = '#1976D2';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.85);
    ctx.quadraticCurveTo(W * 0.5, H * 0.78, W, H * 0.88);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    // evaporation arrows
    const scaleX = W / 500, scaleY = H / 260;
    for (let i = 0; i < 5; i++) {
      const x = (60 + i * 90) * scaleX;
      const alpha = clamp((s.vapor) / 100, 0, 1);
      ctx.strokeStyle = `rgba(255,255,255,${0.3 + alpha * 0.5})`;
      ctx.lineWidth = 2;
      const off = (Date.now() / 400 + i) % 3;
      ctx.beginPath();
      ctx.moveTo(x, H * 0.85 - off * 10);
      ctx.lineTo(x, H * 0.85 - off * 10 - 18);
      ctx.stroke();
    }
    // clouds
    s.clouds.forEach(cl => {
      const cx = cl.x * scaleX, cy = cl.y * scaleY;
      const density = clamp(s.cloud / 100, 0.15, 1);
      ctx.fillStyle = `rgba(${240 - density * 100},${240 - density * 90},${245 - density * 60},${0.5 + density * 0.5})`;
      [0, 1, 2].forEach(k => {
        ctx.beginPath();
        ctx.arc(cx + k * 22 * cl.s, cy, (16 + density * 10) * cl.s, 0, 7);
        ctx.fill();
      });
    });
    // rain / snow
    s.drops.forEach(d => {
      const x = d.x * scaleX, y = d.y * scaleY;
      if (s._snow) {
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(120,170,255,0.8)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 10); ctx.stroke();
      }
    });
    ctx.fillStyle = '#212121'; ctx.font = '12px Poppins, sans-serif';
    ctx.fillText(s._raining ? (s._snow ? '❄ Snowfall in progress' : '🌧 Rainfall in progress') : '☀ Evaporation phase', 10, H - 10);
  },
  indicators(s) {
    return [
      { label: 'Water Vapor', value: fmt(s.vapor) + '%' },
      { label: 'Cloud Density', value: fmt(s.cloud) + '%' },
      { label: 'Groundwater', value: fmt(s.groundwater) + '%' },
      { label: 'Runoff', value: fmt(s.runoff) + '%', warn: s.runoff > 70 }
    ];
  },
  channels: [
    { key: 'vapor', label: 'Vapor %', color: '#26C6DA' },
    { key: 'cloud', label: 'Cloud %', color: '#607D8B' },
    { key: 'groundwater', label: 'Groundwater %', color: '#1976D2' },
    { key: 'runoff', label: 'Runoff %', color: '#FFB300' }
  ],
  background: `<p>The water cycle (hydrological cycle) describes the continuous movement of water within the Earth and atmosphere. Solar radiation heats surface water, driving <b>evaporation</b> — liquid water turning to vapor. Plants add moisture through <b>transpiration</b>. As moist air rises and cools, water vapor condenses around tiny particles to form clouds. When droplets grow heavy enough, they fall as <b>precipitation</b> — rain, snow, sleet or hail depending on temperature.</p>
  <p>Once precipitation reaches the ground, it either infiltrates the soil to recharge <b>groundwater</b>, or — if the soil is saturated or the rainfall intense — flows over the surface as <b>runoff</b> into rivers, lakes and oceans, completing the cycle.</p>`,
  impact: `<p>Urbanisation replaces absorbent soil with concrete, sharply increasing surface runoff and reducing groundwater recharge, which raises flood risk. Deforestation reduces transpiration and rainfall generation in some regions. Climate change is intensifying the cycle, causing more extreme droughts and heavier downpours in different regions.</p>`,
  solutions: `<p>Rainwater harvesting, permeable pavements, wetland restoration, and afforestation help restore natural infiltration. Efficient irrigation and groundwater monitoring protect long-term water security.</p>`,
  facts: [
    'A single water molecule spends about 9 days in the atmosphere on average before falling as precipitation.',
    'About 97% of Earth\'s water is saline ocean water; only ~2.5% is fresh water.',
    'The Amazon rainforest generates roughly half of its own rainfall through transpiration.'
  ],
  misconceptions: [
    '"Rain always comes from the ocean" — much rainfall is recycled from land-based evaporation and transpiration.',
    '"Groundwater is a separate, unlimited source" — it is directly connected to and replenished by the surface water cycle.'
  ],
  quiz: [
    { q: 'What process directly causes clouds to form?', options: ['Evaporation', 'Condensation', 'Infiltration', 'Runoff'], correct: 1, explain: 'Water vapor condenses around particles in cooling air to form cloud droplets.' },
    { q: 'Higher solar radiation mainly increases which process?', options: ['Evaporation', 'Groundwater depletion only', 'Snow formation', 'Wind speed'], correct: 0, explain: 'More solar energy heats water bodies, speeding up evaporation.' },
    { q: 'A paved city surface mostly increases:', options: ['Infiltration', 'Surface runoff', 'Transpiration', 'Snowfall'], correct: 1, explain: 'Impermeable surfaces prevent infiltration, forcing water to run off and increasing flood risk.' },
    { q: 'Snow instead of rain typically requires:', options: ['High humidity only', 'Temperatures at or below 0°C', 'Strong wind', 'Low cloud density'], correct: 1, explain: 'Precipitation falls as snow when air temperature near the surface is at or below freezing.' },
    { q: 'Which best describes transpiration?', options: ['Water flowing underground', 'Water vapor released by plants', 'Ice melting', 'Ocean currents mixing'], correct: 1, explain: 'Transpiration is the release of water vapor from plant leaves into the atmosphere.' }
  ],
  summary: `<p>The Water Cycle Simulator shows how temperature, humidity, wind and solar radiation together control evaporation, cloud formation and rainfall, and how rainfall is partitioned between groundwater recharge and surface runoff — a balance that human land-use decisions can disrupt.</p>`
};
