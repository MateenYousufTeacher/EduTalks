/* ============================================================
   SIMS — Simulation catalog.
   Each "ready" simulation is a self-contained, real quantitative
   model (not a scripted animation): changing a control changes
   the underlying calculation.
   ============================================================ */

const SIMS = {};

/* small helpers */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round = (v, d = 1) => { const m = Math.pow(10, d); return Math.round(v * m) / m; };
function drawVeg(c, x, y, s, color) {
  c.strokeStyle = color; c.lineWidth = 2; c.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + i * s * 0.5, y - s); c.stroke();
  }
}

/* ============================================================
   1. SOIL EROSION LABORATORY
   Model: simplified USLE  A = R x K x LS x C x P
   ============================================================ */
(function () {
  const K_SOIL = { sand: 0.15, loam: 0.30, clay: 0.22, silt: 0.38 };
  const COVER = {
    bare:        { C: 1.00, P: 1.00, veg: 0,  runoff: 0.55, label: 'Bare Soil',       color: '#8d6e4a' },
    grass:       { C: 0.05, P: 1.00, veg: 85, runoff: 0.35, label: 'Grass-covered',   color: '#66bb6a' },
    forest:      { C: 0.005,P: 1.00, veg: 95, runoff: 0.15, label: 'Forest-covered',  color: '#2e7d32' },
    agricultural:{ C: 0.40, P: 1.00, veg: 20, runoff: 0.45, label: 'Agricultural',    color: '#a1887f' },
    contour:     { C: 0.40, P: 0.50, veg: 30, runoff: 0.35, label: 'Contour Farming', color: '#8d9e4a' },
    terraced:    { C: 0.40, P: 0.10, veg: 40, runoff: 0.25, label: 'Terraced Land',   color: '#7cb342' },
    mulched:     { C: 0.10, P: 1.00, veg: 60, runoff: 0.30, label: 'Mulched Soil',    color: '#6d4c41' }
  };

  function compute(v) {
    const K = K_SOIL[v.soilType];
    const cov = COVER[v.landCover];
    const S = Math.tan(v.slope * Math.PI / 180) * 100; // % slope
    const LS = Math.pow(v.plotSize / 22.13, 0.4) * (0.065 + 0.045 * S + 0.0065 * S * S);
    const R = 0.5 * v.rainfallIntensity * v.rainfallDuration;
    const A_t_ha = R * K * LS * cov.C * cov.P; // tonnes/ha per event
    const areaM2 = v.plotSize * 10;
    const areaHa = areaM2 / 10000;
    const soilLossKg = A_t_ha * areaHa * 1000;
    const runoffL = v.rainfallIntensity * v.rainfallDuration * areaM2 * cov.runoff;
    const erosionRate = soilLossKg / v.rainfallDuration;
    const topsoilMassKg = areaM2 * 0.15 * 1300;
    const remainingPct = clamp(100 * (1 - soilLossKg / topsoilMassKg), 0, 100);
    return { soilLossKg: round(soilLossKg, 2), runoffL: round(runoffL, 1), erosionRate: round(erosionRate, 2), remainingPct: round(remainingPct, 2), vegPct: cov.veg, LS: round(LS, 2), R: round(R, 1) };
  }

  SIMS['soil-erosion'] = {
    id: 'soil-erosion', title: 'Soil Erosion Laboratory', icon: '⛰️', color: 'linear-gradient(135deg,#8d6e4a,#c8a165)',
    category: 'Land', status: 'ready',
    shortDesc: 'How rainfall, slope and land cover drive soil loss',
    defaultValues: { landCover: 'bare', soilType: 'loam', rainfallIntensity: 50, rainfallDuration: 1, slope: 10, plotSize: 20 },
    controls: [
      { id: 'landCover', label: 'Land cover / practice', type: 'select', options: Object.keys(COVER).map(k => ({ value: k, label: COVER[k].label })) },
      { id: 'soilType', label: 'Soil type', type: 'select', options: [{ value: 'sand', label: 'Sandy' }, { value: 'loam', label: 'Loamy' }, { value: 'clay', label: 'Clayey' }, { value: 'silt', label: 'Silty' }] },
      { id: 'rainfallIntensity', label: 'Rainfall intensity', type: 'range', min: 10, max: 150, step: 5, unit: ' mm/hr' },
      { id: 'rainfallDuration', label: 'Rainfall duration', type: 'range', min: 0.5, max: 4, step: 0.5, unit: ' hr' },
      { id: 'slope', label: 'Slope angle', type: 'range', min: 1, max: 45, step: 1, unit: '°' },
      { id: 'plotSize', label: 'Slope length (plot size)', type: 'range', min: 5, max: 100, step: 5, unit: ' m' }
    ],
    interpolateKeys: ['soilLossKg', 'runoffL', 'erosionRate'],
    compute,
    indicators(values, result) {
      const r = result || compute(values);
      const cov = COVER[values.landCover];
      return [
        { label: 'Vegetation cover', value: cov.veg + '%' },
        { label: 'Slope', value: values.slope + '°' },
        { label: 'Runoff volume', value: r.runoffL + ' L' },
        { label: 'Soil lost', value: r.soilLossKg + ' kg', cls: r.soilLossKg > 20 ? 'warn' : 'good' },
        { label: 'Erosion rate', value: r.erosionRate + ' kg/hr' },
        { label: 'Topsoil remaining', value: r.remainingPct + '%', cls: r.remainingPct < 80 ? 'warn' : 'good' }
      ];
    },
    run(values) {
      const result = compute(values);
      const cov = COVER[values.landCover];
      const n = (SIMS['soil-erosion']._log.length || 0) + 1;
      return {
        result,
        logRow: { trial: n, soilType: values.soilType, landCover: cov.label, slope: values.slope, rain: values.rainfallIntensity, duration: values.rainfallDuration, veg: cov.veg, runoff: result.runoffL, soilLoss: result.soilLossKg, erosionRate: result.erosionRate }
      };
    },
    draw(c, canvas, values, result, progress) {
      const W = canvas.width, H = canvas.height;
      c.clearRect(0, 0, W, H);
      const cov = COVER[values.landCover];
      // sky
      const sky = c.createLinearGradient(0, 0, 0, H * 0.55);
      sky.addColorStop(0, '#bcd8f5'); sky.addColorStop(1, '#e8f3fd');
      c.fillStyle = sky; c.fillRect(0, 0, W, H * 0.55);
      // ground slope
      const slopeFrac = clamp(values.slope / 45, 0.05, 1);
      const topY = H * 0.30, leftY = H * 0.30 + slopeFrac * H * 0.28, rightY = H * 0.86;
      c.fillStyle = cov.color;
      c.beginPath(); c.moveTo(0, leftY); c.lineTo(W * 0.68, topY + 4); c.lineTo(W * 0.68, rightY); c.lineTo(0, rightY); c.closePath(); c.fill();
      // soil layers cross-section hint
      c.fillStyle = 'rgba(0,0,0,0.08)';
      c.fillRect(0, rightY - 14, W * 0.68, 14);

      // vegetation tufts
      const vegCount = Math.round(cov.veg / 8);
      for (let i = 0; i < vegCount; i++) {
        const fx = (i * 37) % 100 / 100;
        const gx = fx * W * 0.62 + 10;
        const gy = leftY + (topY - leftY) * fx - 4;
        drawVeg(c, gx, gy, 9, cov.veg > 60 ? '#1b5e20' : '#43a047');
      }

      // collection bin
      const binX = W * 0.76, binY = H * 0.55, binW = W * 0.18, binH = H * 0.30;
      c.strokeStyle = '#5d4037'; c.lineWidth = 3;
      c.strokeRect(binX, binY, binW, binH);
      const fillFrac = clamp((result ? result.soilLossKg : compute(values).soilLossKg) / 60, 0, 1) * progress;
      c.fillStyle = '#8d6e4a';
      c.fillRect(binX + 2, binY + binH - binH * fillFrac + 2, binW - 4, binH * fillFrac - 4 > 0 ? binH * fillFrac - 4 : 0);
      c.fillStyle = '#556'; c.font = '10px Nunito Sans, sans-serif'; c.textAlign = 'center';
      c.fillText('Sediment', binX + binW / 2, binY + binH + 14);
      c.fillText('collected', binX + binW / 2, binY + binH + 25);

      // rain + runoff (only while progress animating between 0 and 1)
      if (progress > 0 && progress < 1) {
        const dropCount = Math.round(values.rainfallIntensity / 12);
        c.strokeStyle = '#1976D2'; c.lineWidth = 1.6; c.globalAlpha = 0.7;
        for (let i = 0; i < dropCount; i++) {
          const seed = (i * 928.3 + progress * 900) % 100;
          const dx = (i * 53 % 100) / 100 * W * 0.62;
          const dy = ((seed) / 100) * H * 0.5 + 4;
          c.beginPath(); c.moveTo(dx, dy); c.lineTo(dx - 3, dy + 10); c.stroke();
        }
        c.globalAlpha = 1;
        // runoff arrow flowing to bin
        c.strokeStyle = '#6d4c41'; c.lineWidth = 4; c.lineCap = 'round';
        c.beginPath();
        c.moveTo(W * 0.35, topY + (rightY - topY) * 0.5);
        c.quadraticCurveTo(W * 0.6, rightY - 10, binX, binY + binH * 0.6);
        c.stroke();
      }
      c.textAlign = 'left';
    },
    graphs: [
      { label: 'Soil loss by trial', build: (log) => [{ label: 'Soil loss (kg)', color: '#1976D2', points: log.map((r, i) => ({ x: i + 1, y: r.soilLoss })) }], xLabel: 'Trial #' },
      { label: 'vs Vegetation cover', build: (log) => [{ label: 'Soil loss (kg)', color: '#43A047', points: [...log].sort((a, b) => a.veg - b.veg).map(r => ({ x: r.veg, y: r.soilLoss })) }], xLabel: 'Vegetation %' },
      { label: 'vs Slope', build: (log) => [{ label: 'Soil loss (kg)', color: '#E53935', points: [...log].sort((a, b) => a.slope - b.slope).map(r => ({ x: r.slope, y: r.soilLoss })) }], xLabel: 'Slope °' }
    ],
    trialColumns: [
      { key: 'trial', label: 'Trial' }, { key: 'soilType', label: 'Soil' }, { key: 'landCover', label: 'Land cover' },
      { key: 'slope', label: 'Slope°' }, { key: 'rain', label: 'Rain mm/hr' }, { key: 'duration', label: 'Duration hr' },
      { key: 'veg', label: 'Veg %' }, { key: 'runoff', label: 'Runoff L' }, { key: 'soilLoss', label: 'Soil loss kg' }, { key: 'erosionRate', label: 'Rate kg/hr' }
    ],
    challenge: {
      text: 'Keep soil loss under <b>5 kg</b> per trial while using land as <b>agricultural, contour, terraced or mulched</b> (not bare or forest).',
      evaluate: (result, values) => result.soilLossKg < 5 && ['agricultural', 'contour', 'terraced', 'mulched'].includes(values.landCover)
    },
    learnHTML: `
      <div class="card"><h4 style="margin-top:0">What is soil erosion?</h4>
      <p>Soil erosion is the detachment and transport of topsoil by rainfall and surface runoff. It happens in three visible stages: <b>sheet erosion</b> (a thin, even layer removed across a slope), <b>rill erosion</b> (small channels form as runoff concentrates), and <b>gully erosion</b> (channels deepen into permanent cuts).</p>
      <p>This lab estimates soil loss using a simplified version of the Universal Soil Loss Equation: <b>Soil loss = Rainfall erosivity × Soil erodibility × Slope factor × Cover factor × Practice factor</b>. Each control you adjust changes one of these factors.</p></div>
      <div class="card"><h4 style="margin-top:0">Why vegetation and slope matter</h4>
      <p>Plant roots bind soil particles and canopy intercepts raindrop energy, which is why forest cover reduces loss more than a hundredfold compared to bare soil in this model. Steeper slopes increase both the speed and volume of runoff, so soil loss rises sharply — not just proportionally — as slope angle increases.</p></div>
      <div class="card"><h4 style="margin-top:0">Conservation practices</h4>
      <p><b>Contour farming</b> (plowing across the slope, not up-and-down) slows runoff. <b>Terracing</b> breaks a long slope into flat steps. <b>Mulching</b> covers the soil surface directly, protecting it from raindrop impact even before crops mature.</p></div>`,
    misconceptions: [
      { myth: 'All soil erosion is harmful at every scale.', reality: 'Slow, natural erosion is part of landscape formation; the concern is accelerated erosion caused by removing vegetation or poor land management, which outpaces soil formation.' },
      { myth: 'Vegetation has no real effect on erosion.', reality: 'In this model, forest cover cuts soil loss by roughly 100–200× compared with bare soil under identical rainfall and slope, because roots and canopy directly reduce both detachment and runoff.' },
      { myth: 'Flat land never erodes.', reality: 'Even a low slope produces measurable runoff and loss under intense rainfall — the rate is lower, not zero.' },
      { myth: 'Doubling rainfall exactly doubles soil loss.', reality: 'Soil loss depends on rainfall erosivity, runoff volume and interacting factors, so the relationship is not perfectly linear — try it and compare two trials.' }
    ],
    quiz: [
      { q: 'In your trials, which land cover produced the lowest soil loss for the same rainfall and slope?', options: ['Bare soil', 'Forest cover', 'Agricultural field with no practice', 'Contour farming'], correct: 1, explain: 'Forest cover has the lowest Cover factor (C) in the model, reflecting canopy interception and root binding.' },
      { q: 'What does the "P factor" in the soil loss equation represent?', options: ['Rainfall power', 'Soil particle size', 'Support practice (e.g. terracing, contouring)', 'Plant photosynthesis'], correct: 2 },
      { q: 'Why does soil loss increase sharply, not just proportionally, as slope angle rises?', options: ['Rain falls faster on steep slopes', 'Runoff speed and volume both increase with slope', 'Soil becomes lighter on slopes', 'It doesn\'t — this is a myth'], correct: 1 },
      { q: 'Gully erosion is best described as:', options: ['A thin, even sheet of soil removed', 'Small emerging channels from concentrated runoff', 'Deep, permanent channels cut into the land', 'Soil blown away by wind'], correct: 2 },
      { q: 'Which intervention protects soil directly at the surface before crops even establish?', options: ['Terracing', 'Mulching', 'Crop rotation', 'Deep tillage'], correct: 1 }
    ]
  };
})();

/* ============================================================
   2. POPULATION DYNAMICS LABORATORY
   Model: exponential N(t)=N0 e^{rt};  logistic N(t)=K/(1+((K-N0)/N0)e^{-rt})
   ============================================================ */
(function () {
  function series(v) {
    const r = v.birthRate - v.deathRate;
    const pts = [];
    for (let t = 0; t <= v.years; t++) {
      let N;
      if (v.model === 'exponential') {
        N = v.initialPop * Math.exp(r * t);
      } else {
        const K = v.carryingCapacity;
        N = K / (1 + ((K - v.initialPop) / v.initialPop) * Math.exp(-r * t));
      }
      pts.push({ x: t, y: Math.max(0, N) });
    }
    return pts;
  }
  function compute(v) {
    const pts = series(v);
    const r = v.birthRate - v.deathRate;
    const final = pts[pts.length - 1].y;
    const doubling = r > 0 ? Math.log(2) / r : Infinity;
    let status = 'Stable';
    if (v.model === 'logistic') {
      status = final >= v.carryingCapacity * 0.97 ? 'At carrying capacity' : (r > 0 ? 'Growing' : 'Declining');
    } else {
      status = r > 0.001 ? 'Growing (unbounded)' : (r < -0.001 ? 'Declining' : 'Stable');
    }
    return { finalPop: round(final, 0), r: round(r * 100, 1), doubling: isFinite(doubling) ? round(doubling, 1) : null, status, series: pts };
  }

  SIMS['population'] = {
    id: 'population', title: 'Population Dynamics Laboratory', icon: '📈', color: 'linear-gradient(135deg,#1976D2,#26C6DA)',
    category: 'Ecology', status: 'ready',
    shortDesc: 'Exponential vs logistic growth and carrying capacity',
    defaultValues: { model: 'logistic', initialPop: 100, birthRate: 0.30, deathRate: 0.10, carryingCapacity: 1000, years: 50 },
    controls: [
      { id: 'model', label: 'Growth model', type: 'select', options: [{ value: 'exponential', label: 'Exponential' }, { value: 'logistic', label: 'Logistic' }] },
      { id: 'initialPop', label: 'Initial population', type: 'range', min: 10, max: 1000, step: 10 },
      { id: 'birthRate', label: 'Birth rate (per capita/yr)', type: 'range', min: 0, max: 1, step: 0.01 },
      { id: 'deathRate', label: 'Death rate (per capita/yr)', type: 'range', min: 0, max: 1, step: 0.01 },
      { id: 'carryingCapacity', label: 'Carrying capacity (logistic only)', type: 'range', min: 100, max: 5000, step: 50 },
      { id: 'years', label: 'Years to simulate', type: 'range', min: 5, max: 100, step: 5, unit: ' yr' }
    ],
    interpolateKeys: [],
    compute,
    indicators(values, result) {
      const r = result || compute(values);
      return [
        { label: 'Final population', value: r.finalPop },
        { label: 'Net growth rate (r)', value: r.r + '%/yr', cls: r.r >= 0 ? 'good' : 'warn' },
        { label: 'Doubling time', value: r.doubling ? r.doubling + ' yr' : '—' },
        { label: 'Carrying capacity', value: values.model === 'logistic' ? values.carryingCapacity : 'n/a (exponential)' },
        { label: 'Status', value: r.status },
        { label: 'Change from start', value: (r.finalPop - values.initialPop >= 0 ? '+' : '') + (r.finalPop - values.initialPop) }
      ];
    },
    run(values) {
      const result = compute(values);
      const n = (SIMS['population']._log.length || 0) + 1;
      return {
        result,
        logRow: { trial: n, model: values.model, N0: values.initialPop, birth: values.birthRate, death: values.deathRate, K: values.model === 'logistic' ? values.carryingCapacity : '—', years: values.years, finalPop: result.finalPop, growthRate: result.r }
      };
    },
    draw(c, canvas, values, result, progress, animating) {
      const W = canvas.width, H = canvas.height;
      c.clearRect(0, 0, W, H);
      c.fillStyle = '#eef4fb'; c.fillRect(0, 0, W, H);
      const pts = (result && result.series) ? result.series : series(values);
      const pad = { l: 46, r: 16, t: 16, b: 28 };
      const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
      const maxY = Math.max(...pts.map(p => p.y), values.model === 'logistic' ? values.carryingCapacity : 0) * 1.1 || 1;
      const maxX = pts[pts.length - 1].x || 1;
      const X = x => pad.l + (x / maxX) * plotW;
      const Y = y => pad.t + plotH - (y / maxY) * plotH;

      // grid
      c.strokeStyle = '#dbe6f3'; c.lineWidth = 1;
      for (let i = 0; i <= 4; i++) { const gy = pad.t + plotH / 4 * i; c.beginPath(); c.moveTo(pad.l, gy); c.lineTo(W - pad.r, gy); c.stroke(); }
      c.fillStyle = '#7d8aa0'; c.font = '10px Nunito Sans, sans-serif';
      for (let i = 0; i <= 4; i++) { const gy = pad.t + plotH / 4 * i; c.fillText(formatK(maxY - maxY / 4 * i), 2, gy + 3); }

      // carrying capacity line
      if (values.model === 'logistic') {
        c.strokeStyle = '#FFB300'; c.setLineDash([5, 4]); c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(pad.l, Y(values.carryingCapacity)); c.lineTo(W - pad.r, Y(values.carryingCapacity)); c.stroke();
        c.setLineDash([]);
        c.fillStyle = '#a67c00'; c.fillText('Carrying capacity', pad.l + 6, Y(values.carryingCapacity) - 5);
      }

      // curve (progressive draw while animating)
      const visibleCount = animating ? Math.max(1, Math.round(pts.length * progress)) : pts.length;
      c.strokeStyle = '#1976D2'; c.lineWidth = 2.6; c.beginPath();
      for (let i = 0; i < visibleCount; i++) { const x = X(pts[i].x), y = Y(pts[i].y); i === 0 ? c.moveTo(x, y) : c.lineTo(x, y); }
      c.stroke();

      // leading population marker
      const lead = pts[visibleCount - 1] || pts[0];
      const lx = X(lead.x), ly = Y(lead.y);
      c.fillStyle = '#0D47A1';
      c.beginPath(); c.arc(lx, ly, 5, 0, 7); c.fill();
      c.fillStyle = '#212121'; c.font = '11px Poppins, sans-serif';
      c.fillText(Math.round(lead.y) + ' individuals', Math.min(lx + 8, W - 110), Math.max(ly - 8, 16));

      c.fillStyle = '#7d8aa0'; c.font = '10px Nunito Sans, sans-serif';
      c.fillText('Year ' + Math.round(lead.x), W - pad.r - 46, H - 8);
    },
    graphs: [
      { label: 'Population vs time', build: (log, last) => last && last.series ? [{ label: 'Population', color: '#1976D2', points: last.series.filter((_, i) => i % Math.ceil(last.series.length / 60 || 1) === 0) }] : [], xLabel: 'Year' },
      { label: 'Final pop. by trial', build: (log) => [{ label: 'Final population', color: '#43A047', points: log.map((r, i) => ({ x: i + 1, y: r.finalPop })) }], xLabel: 'Trial #' }
    ],
    trialColumns: [
      { key: 'trial', label: 'Trial' }, { key: 'model', label: 'Model' }, { key: 'N0', label: 'N₀' }, { key: 'birth', label: 'Birth rate' },
      { key: 'death', label: 'Death rate' }, { key: 'K', label: 'Carry. cap.' }, { key: 'years', label: 'Years' }, { key: 'finalPop', label: 'Final pop.' }, { key: 'growthRate', label: 'r (%/yr)' }
    ],
    challenge: {
      text: 'Using the <b>logistic model</b>, keep the population between <b>400 and 600</b> after the full run.',
      evaluate: (result, values) => values.model === 'logistic' && result.finalPop >= 400 && result.finalPop <= 600
    },
    learnHTML: `
      <div class="card"><h4 style="margin-top:0">Exponential vs logistic growth</h4>
      <p><b>Exponential growth</b> (N(t) = N₀e^rt) assumes unlimited resources — population keeps accelerating. <b>Logistic growth</b> (N(t) = K / (1 + ((K−N₀)/N₀)e^−rt)) adds a <b>carrying capacity (K)</b>, the maximum population an environment can sustain, so growth slows as the population approaches K.</p></div>
      <div class="card"><h4 style="margin-top:0">Limiting factors</h4>
      <p>Food, space, disease and predation are limiting factors — as a population nears carrying capacity, these factors increase death rate and reduce birth rate, flattening the growth curve into an S-shape.</p></div>
      <div class="card"><h4 style="margin-top:0">Doubling time</h4>
      <p>For positive growth, doubling time ≈ ln(2)/r. A small change in the growth rate r produces a large change in how quickly a population doubles — this is why even modest differences in birth/death rates matter over decades.</p></div>`,
    misconceptions: [
      { myth: 'Populations can grow exponentially forever.', reality: 'No real population has truly unlimited resources — exponential growth is only realistic over short timeframes before limiting factors intervene.' },
      { myth: 'Carrying capacity is a hard ceiling a population can never cross.', reality: 'Populations can temporarily overshoot K and then decline sharply as resources become scarce, rather than stopping precisely at K.' },
      { myth: 'A higher birth rate always means faster long-term growth.', reality: 'What matters is the net rate r = birth rate − death rate; a high birth rate paired with a high death rate can still produce a shrinking population.' }
    ],
    quiz: [
      { q: 'What does the logistic model add that the exponential model lacks?', options: ['A birth rate', 'A carrying capacity limit', 'A death rate', 'Time'], correct: 1 },
      { q: 'If birth rate = death rate, what happens to the population (r = 0)?', options: ['It grows exponentially', 'It stays roughly constant', 'It always crashes', 'It doubles every year'], correct: 1 },
      { q: 'As a logistic population approaches carrying capacity, its growth rate:', options: ['Increases', 'Stays constant', 'Approaches zero', 'Becomes negative immediately'], correct: 2 },
      { q: 'A shorter doubling time means:', options: ['Slower population growth', 'Faster population growth', 'The population is shrinking', 'Carrying capacity was reached'], correct: 1 },
      { q: 'Which of these is a "limiting factor" in population growth?', options: ['Food availability', 'The calendar date', 'The color of the organism', 'The name of the species'], correct: 0 }
    ]
  };
  function formatK(n) { return Math.abs(n) >= 1000 ? (n / 1000).toFixed(1) + 'k' : Math.round(n); }
})();

/* ============================================================
   3. NOISE POLLUTION LABORATORY
   Model: inverse-square distance attenuation + logarithmic
   combination of sources + barrier insertion loss.
   Reference levels (dB at 1 m) are illustrative teaching values.
   ============================================================ */
(function () {
  const SOURCES = { car: 70, bus: 85, motorcycle: 95, horn: 110, construction: 100, generator: 95, loudspeaker: 105 };
  const SOURCE_LABEL = { car: 'Car', bus: 'Bus', motorcycle: 'Motorcycle', horn: 'Horn', construction: 'Construction machine', generator: 'Generator', loudspeaker: 'Loudspeaker' };
  const BARRIER = { none: 0, vegetation: 5, wall: 15, building: 20 };
  const BARRIER_LABEL = { none: 'None', vegetation: 'Vegetation buffer', wall: 'Solid wall', building: 'Building' };

  function levelAtDistance(L0, d) { return L0 - 20 * Math.log10(Math.max(d, 1)); }
  function combine(levels) { return 10 * Math.log10(levels.reduce((s, L) => s + Math.pow(10, L / 10), 0)); }

  function safeExposureHours(dB) {
    // simplified occupational-noise style guideline (3 dB exchange rate)
    if (dB < 85) return Infinity;
    return 8 / Math.pow(2, (dB - 85) / 3);
  }
  function category(dB) {
    if (dB < 55) return 'Quiet';
    if (dB < 70) return 'Moderate';
    if (dB < 85) return 'Loud / annoying';
    if (dB < 100) return 'Harmful (limit exposure)';
    return 'Dangerous';
  }

  function compute(v) {
    const L0 = SOURCES[v.source];
    const perSource = levelAtDistance(L0, v.distance);
    const levels = Array(v.numSources).fill(perSource);
    const combined = combine(levels);
    const afterBarrier = Math.max(0, combined - BARRIER[v.barrier]);
    const safeHrs = safeExposureHours(afterBarrier);
    return {
      perSource: round(perSource, 1), combined: round(combined, 1), level: round(afterBarrier, 1),
      barrierReduction: BARRIER[v.barrier], category: category(afterBarrier),
      safeHours: isFinite(safeHrs) ? round(safeHrs, 1) : null
    };
  }

  SIMS['noise'] = {
    id: 'noise', title: 'Noise Pollution Laboratory', icon: '🔊', color: 'linear-gradient(135deg,#FFB300,#FF7043)',
    category: 'Hazards', status: 'ready',
    shortDesc: 'Sound intensity, distance, barriers and exposure',
    defaultValues: { source: 'car', numSources: 1, distance: 10, barrier: 'none', duration: 2 },
    controls: [
      { id: 'source', label: 'Sound source', type: 'select', options: Object.keys(SOURCES).map(k => ({ value: k, label: SOURCE_LABEL[k] })) },
      { id: 'numSources', label: 'Number of active sources', type: 'range', min: 1, max: 10, step: 1 },
      { id: 'distance', label: 'Distance from source', type: 'range', min: 1, max: 100, step: 1, unit: ' m' },
      { id: 'barrier', label: 'Barrier', type: 'select', options: Object.keys(BARRIER).map(k => ({ value: k, label: BARRIER_LABEL[k] })) },
      { id: 'duration', label: 'Exposure duration', type: 'range', min: 1, max: 8, step: 0.5, unit: ' hr' }
    ],
    interpolateKeys: ['level', 'combined'],
    compute,
    indicators(values, result) {
      const r = result || compute(values);
      return [
        { label: 'Sound level (at meter)', value: r.level + ' dB', cls: r.level >= 85 ? 'warn' : 'good' },
        { label: 'Distance', value: values.distance + ' m' },
        { label: 'Active sources', value: values.numSources },
        { label: 'Barrier reduction', value: '−' + r.barrierReduction + ' dB' },
        { label: 'Exposure category', value: r.category, cls: r.level >= 85 ? 'warn' : 'good' },
        { label: 'Safe exposure limit', value: r.safeHours === null ? 'Unlimited' : r.safeHours + ' hr' }
      ];
    },
    run(values) {
      const result = compute(values);
      const n = (SIMS['noise']._log.length || 0) + 1;
      SIMS['noise']._lastValues = Object.assign({}, values);
      return {
        result,
        logRow: { trial: n, source: SOURCE_LABEL[values.source], sources: values.numSources, distance: values.distance, barrier: BARRIER_LABEL[values.barrier], level: result.level, category: result.category }
      };
    },
    draw(c, canvas, values, result, progress, animating) {
      const W = canvas.width, H = canvas.height;
      c.clearRect(0, 0, W, H);
      c.fillStyle = '#eef4fb'; c.fillRect(0, 0, W, H);
      // ground
      c.fillStyle = '#dbe6f3'; c.fillRect(0, H * 0.78, W, H * 0.22);
      const srcX = W * 0.16, srcY = H * 0.6;
      const maxDist = 100;
      const meterX = srcX + clamp(values.distance / maxDist, 0.05, 0.85) * (W * 0.72);
      const meterY = H * 0.6;

      // source icon
      c.fillStyle = '#455A64';
      c.beginPath(); c.arc(srcX, srcY, 16, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.font = '14px sans-serif'; c.textAlign = 'center';
      c.fillText('🔊', srcX, srcY + 5);

      // expanding rings while animating
      if (animating) {
        for (let i = 0; i < 3; i++) {
          const rp = (progress + i * 0.33) % 1;
          const r = rp * (meterX - srcX);
          c.strokeStyle = `rgba(25,118,210,${1 - rp})`;
          c.lineWidth = 2; c.beginPath(); c.arc(srcX, srcY, Math.max(2, r), 0, 7); c.stroke();
        }
      }

      // barrier
      if (values.barrier !== 'none') {
        const bx = (srcX + meterX) / 2;
        const bh = values.barrier === 'wall' ? 46 : values.barrier === 'building' ? 60 : 30;
        c.fillStyle = values.barrier === 'vegetation' ? '#43A047' : '#78909C';
        c.fillRect(bx - 5, srcY + 14 - bh, 10, bh);
      }

      // meter
      c.fillStyle = '#fff'; c.strokeStyle = '#0D47A1'; c.lineWidth = 2;
      c.beginPath(); c.arc(meterX, meterY, 20, 0, 7); c.fill(); c.stroke();
      const lvl = result ? result.level : compute(values).level;
      c.fillStyle = lvl >= 85 ? '#E53935' : '#0D47A1';
      c.font = 'bold 11px Poppins, sans-serif';
      c.fillText(Math.round(lvl), meterX, meterY + 4);
      c.font = '10px Nunito Sans, sans-serif'; c.fillStyle = '#556';
      c.fillText('dB', meterX, meterY + 30);
      c.fillText(values.distance + ' m', meterX, srcY + 30);
      c.textAlign = 'left';
    },
    graphs: [
      { label: 'Level vs distance', build: (log) => {
          const v = SIMS['noise']._lastValues || SIMS['noise'].defaultValues;
          const L0 = SOURCES[v.source];
          const pts = [];
          for (let d = 1; d <= 100; d += 4) {
            const per = levelAtDistance(L0, d);
            const combined = combine(Array(v.numSources).fill(per));
            pts.push({ x: d, y: round(Math.max(0, combined - BARRIER[v.barrier]), 1) });
          }
          return [{ label: 'Level (dB) — current settings', color: '#26C6DA', points: pts }];
        }, xLabel: 'Distance (m)' },
      { label: 'Trial comparison', build: (log) => [{ label: 'Level at meter (dB)', color: '#FFB300', points: log.map((r, i) => ({ x: i + 1, y: r.level })) }], xLabel: 'Trial #' }
    ],
    trialColumns: [
      { key: 'trial', label: 'Trial' }, { key: 'source', label: 'Source' }, { key: 'sources', label: '#Sources' },
      { key: 'distance', label: 'Distance m' }, { key: 'barrier', label: 'Barrier' }, { key: 'level', label: 'Level dB' }, { key: 'category', label: 'Category' }
    ],
    challenge: {
      text: 'At <b>30 m</b> from the source, bring the sound level <b>below 55 dB</b> (a quiet classroom target) using barriers and source choices.',
      evaluate: (result, values) => values.distance === 30 && result.level < 55
    },
    learnHTML: `
      <div class="card"><h4 style="margin-top:0">The decibel scale is logarithmic</h4>
      <p>Sound level in decibels (dB) is measured on a logarithmic scale. A 10 dB increase represents roughly a <b>10× increase</b> in sound intensity, and combining two equal sources adds only about <b>3 dB</b> — not double the number.</p></div>
      <div class="card"><h4 style="margin-top:0">Distance and the inverse square law</h4>
      <p>Sound spreading from a point source follows the inverse square law: level drops about <b>6 dB every time distance doubles</b>. That's why moving twice as far from traffic noise makes a noticeable difference even though the source hasn't changed.</p></div>
      <div class="card"><h4 style="margin-top:0">Barriers and exposure</h4>
      <p>Solid barriers (walls, buildings) block the direct sound path and can reduce level substantially; vegetation buffers help less acoustically but still offer some reduction. Exposure guidelines also account for <b>duration</b> — louder sounds are considered safe for much shorter periods.</p></div>`,
    misconceptions: [
      { myth: 'Two sources at the same level double the decibel number.', reality: 'Because dB is logarithmic, two identical sources combine to add about 3 dB, not double the value.' },
      { myth: 'A higher decibel reading always feels twice as loud.', reality: 'Perceived loudness and measured sound level in dB are related but not identical — a 10 dB rise is usually perceived as roughly twice as loud, not the raw number doubling.' },
      { myth: 'If you can\'t hear discomfort, exposure is automatically safe.', reality: 'Hearing damage from prolonged exposure can accumulate gradually and painlessly, which is why exposure-duration guidelines exist even for sounds that don\'t feel immediately uncomfortable.' }
    ],
    quiz: [
      { q: 'Combining two identical 70 dB sources produces approximately:', options: ['73 dB', '140 dB', '70 dB', '100 dB'], correct: 0 },
      { q: 'According to the inverse square law, doubling distance from a source reduces sound level by about:', options: ['3 dB', '6 dB', '10 dB', '20 dB'], correct: 1 },
      { q: 'Which barrier type gave the largest reduction in your trials?', options: ['None', 'Vegetation buffer', 'Solid wall or building', 'They were all identical'], correct: 2 },
      { q: 'Why do exposure guidelines shorten the "safe" time as dB level rises?', options: ['Louder sounds carry more energy, increasing hearing-damage risk faster', 'Louder sounds always mean more sources', 'It is an arbitrary legal rule with no basis', 'Because louder sounds travel further'], correct: 0 },
      { q: 'A sound level of 40 dB falls into which category in this lab?', options: ['Dangerous', 'Harmful', 'Loud / annoying', 'Quiet'], correct: 3 }
    ]
  };
})();

/* ============================================================
   4. ECOSYSTEM FOOD WEB SIMULATOR
   Model: 3-level chain (Producer -> Herbivore -> Predator) using
   discrete-time logistic + Lotka-Volterra-style coupling.
   ============================================================ */
(function () {
  // Rosenzweig-MacArthur style coupling, sub-stepped for numerical stability
  const RP = 0.09, KP = 3000, GRAZE = 0.00035, HERB_DEATH = 0.04, PRED_EFF = 0.30, PRED_DEATH = 0.07;
  const SUBSTEPS = 5;

  function simulate(v) {
    const e_h = v.herbivoreBirthEff;        // herbivore feeding-to-birth efficiency (control)
    const b = v.predationRate * 0.08;       // predator attack rate, scaled from the control's UI range
    let P = v.initialProducer, H = v.initialHerbivore, Pr = v.initialPredator;
    if (v.scenario === 'removePredator') Pr = 0;
    if (v.scenario === 'preyExplosion') H *= 3;
    if (v.scenario === 'foodShortage') P *= 0.3;
    if (v.scenario === 'addPredator') Pr *= 2.5;

    const series = [];
    let minP = P, minH = H, minPr = Pr;
    series.push({ x: 0, P, H, Pr });
    const dt = 1 / SUBSTEPS;
    for (let t = 1; t <= v.days; t++) {
      for (let s = 0; s < SUBSTEPS; s++) {
        const dP = RP * P * (1 - P / KP) - GRAZE * P * H;
        const dH = e_h * GRAZE * P * H - b * H * Pr - HERB_DEATH * H;
        const dPr = PRED_EFF * b * H * Pr - PRED_DEATH * Pr;
        P = Math.max(0, P + dP * dt);
        H = Math.max(0, H + dH * dt);
        Pr = Math.max(0, Pr + dPr * dt);
      }
      minP = Math.min(minP, P); minH = Math.min(minH, H); minPr = Math.min(minPr, Pr);
      series.push({ x: t, P, H, Pr });
    }
    return { series, minP, minH, minPr };
  }

  function compute(v) {
    const { series, minP, minH, minPr } = simulate(v);
    const last = series[series.length - 1];
    let status = 'Stable';
    if (last.P < 5 || last.H < 1 || last.Pr < 0.5) status = 'Collapsing';
    else if (last.H > v.initialHerbivore * 2) status = 'Herbivore boom';
    else if (last.Pr > v.initialPredator * 2) status = 'Predator boom';
    return {
      finalP: Math.round(last.P), finalH: Math.round(last.H), finalPr: Math.round(last.Pr * 10) / 10,
      minP: Math.round(minP), minH: Math.round(minH), minPr: Math.round(minPr * 10) / 10, status, series
    };
  }

  const SCENARIO_LABEL = { balanced: 'Balanced start', removePredator: 'Predator removal', preyExplosion: 'Prey explosion', foodShortage: 'Food shortage', addPredator: 'Predator introduction' };

  SIMS['foodweb'] = {
    id: 'foodweb', title: 'Ecosystem Food Web Simulator', icon: '🕸️', color: 'linear-gradient(135deg,#43A047,#26C6DA)',
    category: 'Ecology', status: 'ready',
    shortDesc: 'Producers, herbivores and predators in balance',
    defaultValues: { initialProducer: 1000, initialHerbivore: 80, initialPredator: 15, herbivoreBirthEff: 0.10, predationRate: 0.08, days: 150, scenario: 'balanced' },
    controls: [
      { id: 'scenario', label: 'Scenario', type: 'select', options: Object.keys(SCENARIO_LABEL).map(k => ({ value: k, label: SCENARIO_LABEL[k] })) },
      { id: 'initialProducer', label: 'Initial producers (grass)', type: 'range', min: 200, max: 2000, step: 50 },
      { id: 'initialHerbivore', label: 'Initial herbivores (rabbits)', type: 'range', min: 10, max: 300, step: 10 },
      { id: 'initialPredator', label: 'Initial predators (foxes)', type: 'range', min: 2, max: 60, step: 2 },
      { id: 'herbivoreBirthEff', label: 'Herbivore feeding efficiency', type: 'range', min: 0.01, max: 0.5, step: 0.01 },
      { id: 'predationRate', label: 'Predation rate', type: 'range', min: 0.01, max: 0.5, step: 0.01 },
      { id: 'days', label: 'Days to simulate', type: 'range', min: 30, max: 300, step: 10, unit: ' d' }
    ],
    interpolateKeys: [],
    compute,
    indicators(values, result) {
      const r = result || compute(values);
      return [
        { label: 'Producers (final)', value: r.finalP },
        { label: 'Herbivores (final)', value: r.finalH },
        { label: 'Predators (final)', value: r.finalPr },
        { label: 'Ecosystem status', value: r.status, cls: r.status === 'Collapsing' ? 'warn' : 'good' },
        { label: 'Lowest herbivore count', value: r.minH },
        { label: 'Lowest predator count', value: r.minPr }
      ];
    },
    run(values) {
      const result = compute(values);
      const n = (SIMS['foodweb']._log.length || 0) + 1;
      return {
        result,
        logRow: { trial: n, scenario: SCENARIO_LABEL[values.scenario], P0: values.initialProducer, H0: values.initialHerbivore, Pr0: values.initialPredator, days: values.days, finalP: result.finalP, finalH: result.finalH, finalPr: result.finalPr, status: result.status }
      };
    },
    draw(c, canvas, values, result, progress, animating) {
      const W = canvas.width, H = canvas.height;
      c.clearRect(0, 0, W, H);
      c.fillStyle = '#eef8f0'; c.fillRect(0, 0, W, H);
      const r = result || compute(values);
      const series = r.series;
      const idx = animating ? Math.max(0, Math.round((series.length - 1) * progress)) : series.length - 1;
      const cur = series[idx];

      const cols = [
        { key: 'P', label: 'Producers', color: '#43A047', x: W * 0.22, max: 3000 },
        { key: 'H', label: 'Herbivores', color: '#8D6E63', x: W * 0.5, max: 400 },
        { key: 'Pr', label: 'Predators', color: '#E53935', x: W * 0.78, max: 80 }
      ];
      const baseY = H * 0.62;
      cols.forEach((col, i) => {
        const val = cur[col.key];
        const radius = 10 + 46 * Math.sqrt(clamp(val / col.max, 0, 1));
        c.fillStyle = col.color; c.globalAlpha = 0.85;
        c.beginPath(); c.arc(col.x, baseY, radius, 0, 7); c.fill();
        c.globalAlpha = 1;
        c.fillStyle = '#223'; c.font = 'bold 12px Poppins, sans-serif'; c.textAlign = 'center';
        c.fillText(Math.round(val * 10) / 10, col.x, baseY + 4);
        c.font = '11px Nunito Sans, sans-serif'; c.fillStyle = '#556';
        c.fillText(col.label, col.x, baseY + 66);
        if (i < cols.length - 1) {
          c.strokeStyle = '#9aa4b2'; c.lineWidth = 2;
          c.beginPath(); c.moveTo(col.x + 55, baseY); c.lineTo(cols[i + 1].x - 55, baseY); c.stroke();
          c.beginPath(); c.moveTo(cols[i + 1].x - 60, baseY - 5); c.lineTo(cols[i + 1].x - 50, baseY); c.lineTo(cols[i + 1].x - 60, baseY + 5); c.stroke();
        }
      });
      c.fillStyle = '#8892a0'; c.font = '10px Nunito Sans, sans-serif'; c.textAlign = 'center';
      c.fillText('Day ' + cur.x + ' of ' + values.days, W / 2, H * 0.92);
      c.textAlign = 'left';
    },
    graphs: [
      { label: 'Populations vs time', build: (log, last) => {
          if (!last || !last.series) return [];
          const step = Math.ceil(last.series.length / 60) || 1;
          const s = last.series.filter((_, i) => i % step === 0);
          return [
            { label: 'Producers', color: '#43A047', points: s.map(p => ({ x: p.x, y: p.P })) },
            { label: 'Herbivores', color: '#8D6E63', points: s.map(p => ({ x: p.x, y: p.H })) },
            { label: 'Predators', color: '#E53935', points: s.map(p => ({ x: p.x, y: p.Pr })) }
          ];
        }, xLabel: 'Day' },
      { label: 'Final counts by trial', build: (log) => [
          { label: 'Herbivores', color: '#8D6E63', points: log.map((r, i) => ({ x: i + 1, y: r.finalH })) },
          { label: 'Predators', color: '#E53935', points: log.map((r, i) => ({ x: i + 1, y: r.finalPr })) }
        ], xLabel: 'Trial #' }
    ],
    trialColumns: [
      { key: 'trial', label: 'Trial' }, { key: 'scenario', label: 'Scenario' }, { key: 'P0', label: 'P₀' }, { key: 'H0', label: 'H₀' },
      { key: 'Pr0', label: 'Pr₀' }, { key: 'days', label: 'Days' }, { key: 'finalP', label: 'Final P' }, { key: 'finalH', label: 'Final H' }, { key: 'finalPr', label: 'Final Pr' }, { key: 'status', label: 'Status' }
    ],
    challenge: {
      text: 'Run a <b>150-day</b> simulation where <b>none of the three populations collapse</b> (all stay above a viable minimum throughout).',
      evaluate: (result, values) => values.days >= 150 && result.minP > 50 && result.minH > 5 && result.minPr > 1
    },
    learnHTML: `
      <div class="card"><h4 style="margin-top:0">Trophic levels and energy transfer</h4>
      <p><b>Producers</b> (grass) capture energy from sunlight. <b>Herbivores</b> (primary consumers) eat producers. <b>Predators</b> (secondary consumers) eat herbivores. At each transfer, only a fraction of energy passes upward — most is lost as heat or used for the organism's own life processes.</p></div>
      <div class="card"><h4 style="margin-top:0">Predator-prey coupling</h4>
      <p>This model links all three levels: producers grow logistically toward a carrying capacity but are grazed down by herbivores; herbivores grow by feeding on producers but are reduced by predation; predators grow by feeding on herbivores but face natural mortality. Removing or boosting any one population ripples through the other two — a <b>trophic cascade</b>.</p></div>
      <div class="card"><h4 style="margin-top:0">Try the scenarios</h4>
      <p>Compare "Predator removal" against "Balanced start" using the same starting numbers — watch what happens to herbivores, and then to producers, once the predator is gone.</p></div>`,
    misconceptions: [
      { myth: 'Removing a predator only affects its direct prey.', reality: 'In this model, removing predators lets herbivores grow unchecked, which then depletes producers — the effect cascades through the whole web, not just one level.' },
      { myth: 'More prey is always good for an ecosystem.', reality: 'A sudden prey explosion can overgraze producers, eventually causing the herbivore population itself to crash from food shortage.' },
      { myth: 'Ecosystems always return to their original balance no matter what changes.', reality: 'Depending on the scenario, populations in this model can settle into a new balance, oscillate, or collapse — recovery isn\'t guaranteed.' }
    ],
    quiz: [
      { q: 'In a food chain Grass → Rabbit → Fox, the fox is a:', options: ['Producer', 'Primary consumer', 'Secondary consumer', 'Decomposer'], correct: 2 },
      { q: 'In the "Predator removal" scenario, what typically happens first?', options: ['Producers increase immediately', 'Herbivores increase, then producers decline', 'Predators increase', 'Nothing changes'], correct: 1 },
      { q: 'Why is only a fraction of energy transferred between trophic levels?', options: ['Energy is stored forever', 'Most energy is lost as heat or used for life processes at each level', 'Predators refuse extra energy', 'Producers hoard all the energy'], correct: 1 },
      { q: 'A "trophic cascade" refers to:', options: ['A waterfall in the ecosystem', 'A change at one trophic level rippling through others', 'A type of producer', 'A stable, unchanging ecosystem'], correct: 1 },
      { q: 'Which scenario is most likely to cause overgrazing of producers?', options: ['Food shortage', 'Predator introduction', 'Prey explosion', 'Balanced start'], correct: 2 }
    ]
  };
})();

/* ============================================================
   COMING SOON — catalog entries (planned, not yet built)
   ============================================================ */
const SOON = [
  { id: 'succession', title: 'Ecological Succession Explorer', icon: '🌱', color: 'linear-gradient(135deg,#66BB6A,#43A047)', category: 'Ecology', shortDesc: 'How ecosystems change after a disturbance' },
  { id: 'groundwater', title: 'Groundwater Detective', icon: '💧', color: 'linear-gradient(135deg,#26C6DA,#1976D2)', category: 'Water', shortDesc: 'Aquifers, wells and sustainable pumping' },
  { id: 'ocean-acid', title: 'Ocean Acidification Laboratory', icon: '🌊', color: 'linear-gradient(135deg,#1976D2,#0D47A1)', category: 'Chemistry', shortDesc: 'Seawater chemistry, pH and carbonate' },
  { id: 'disaster', title: 'Environmental Disaster Response', icon: '🚨', color: 'linear-gradient(135deg,#E53935,#FF7043)', category: 'Hazards', shortDesc: 'Flood, drought and landslide preparedness' },
  { id: 'agriculture', title: 'Sustainable Agriculture Laboratory', icon: '🌾', color: 'linear-gradient(135deg,#FFB300,#8D6E63)', category: 'Agriculture', shortDesc: 'Soil, irrigation and crop decisions' },
  { id: 'eia', title: 'Environmental Impact Assessment', icon: '📋', color: 'linear-gradient(135deg,#5C6BC0,#0D47A1)', category: 'Decision-making', shortDesc: 'Evaluate a project before it\'s approved' }
];
SOON.forEach(s => { SIMS[s.id] = Object.assign({ status: 'soon' }, s); });
