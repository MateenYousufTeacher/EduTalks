/* ============================================================
   STELLAR SPECTROSCOPE — Application Logic
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- Navigation ---------------- */
  const screenStack = ['home'];
  let currentScreenId = 'home';

  function showScreen(id, push) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) el.classList.add('active');
    if (push !== false) {
      if (currentScreenId !== id) screenStack.push(id);
    }
    currentScreenId = id;
    updateBottomNavActive();
    window.scrollTo(0, 0);
    // re-render canvases that belong to the newly shown screen
    requestAnimationFrame(() => renderForScreen(id));
  }

  function goBack() {
    if (screenStack.length > 1) {
      screenStack.pop();
      const prev = screenStack[screenStack.length - 1];
      showScreen(prev, false);
    } else {
      showScreen('home', false);
    }
  }

  function renderForScreen(id) {
    if (id === 'lab') { renderLab(); }
    if (id === 'compare') { renderCompare(); }
    if (id === 'challenge') { /* challenge canvases persist via renderChallengeCanvases */ renderChallengeCanvases(); }
    if (id === 'home') { renderHomeStats(); }
    if (id === 'progress') { renderProgress(); }
    if (id === 'notebook') { renderNotebook(); }
  }

  /* ---------------- Bottom Nav ---------------- */
  const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>' },
    { id: 'lab', label: 'Lab', icon: '<path d="M9 3h6M10 3v6l-6 10a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3l-6-10V3"/>' },
    { id: 'notebook', label: 'Notebook', icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>' },
    { id: 'progress', label: 'Progress', icon: '<path d="M3 3v18h18"/><path d="M7 15l4-6 3 3 5-8"/>' }
  ];
  function navHtml() {
    return NAV_ITEMS.map(n => `
      <button class="nav-btn" data-nav="${n.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${n.icon}</svg>
        <span>${n.label}</span>
      </button>`).join('');
  }
  function updateBottomNavActive() {
    document.querySelectorAll('.bottom-nav .nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.nav === currentScreenId);
    });
  }
  function initBottomNavs() {
    ['bottom-nav', 'bottom-nav-lab', 'bottom-nav-notebook', 'bottom-nav-progress'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = navHtml();
    });
    document.querySelectorAll('.bottom-nav').forEach(nav => {
      nav.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-btn');
        if (!btn) return;
        showScreen(btn.dataset.nav);
      });
    });
  }

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------------- Canvas helpers ---------------- */
  function prepCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(rect.width, 280);
    const cssH = canvas.height && canvas.width ? (canvas.height / canvas.width) * cssW : rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: cssW, h: cssH };
  }

  function wlToX(wl, w) { return ((wl - 380) / (750 - 380)) * w; }

  function interpProfile(profile, wl, minWl, maxWl) {
    const t = (wl - minWl) / (maxWl - minWl);
    const idx = Math.max(0, Math.min(profile.length - 1, t * (profile.length - 1)));
    const i0 = Math.floor(idx), i1 = Math.min(profile.length - 1, i0 + 1);
    const f = idx - i0;
    return profile[i0] * (1 - f) + profile[i1] * f;
  }

  /* Draw the horizontal glowing spectrum bar. Returns array of clickable
     line hit-regions (used for click detection).                        */
  function drawSpectrumBar(canvas, star, opts) {
    opts = opts || {};
    const { ctx, w, h } = prepCanvas(canvas);
    const { profile, minWl, maxWl } = buildSpectrumProfile(star, 320);
    ctx.clearRect(0, 0, w, h);

    for (let x = 0; x < w; x++) {
      const wl = minWl + (x / w) * (maxWl - minWl);
      const bright = Math.max(0.12, interpProfile(profile, wl, minWl, maxWl));
      const rgb = wavelengthToRGB(wl).match(/\d+/g).map(Number);
      const c = rgb.map(v => Math.round(v * bright));
      ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      ctx.fillRect(x, 0, 1, h);
    }

    // faint vignette top/bottom for depth
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0,0,0,0.25)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const clickables = [];
    const activeLines = getActiveLines(star);
    activeLines.forEach(line => {
      const x = wlToX(line.wl, w);
      clickables.push({ x, wl: line.wl, element: line.element, label: line.label, strength: line.strength, isBand: line.isBand });
    });

    // preview markers (toggled elements not necessarily in star)
    if (opts.previewElements && opts.previewElements.size) {
      opts.previewElements.forEach(elKey => {
        const el = ELEMENTS[elKey];
        if (!el) return;
        el.lines.forEach(line => {
          const x = wlToX(line.wl, w);
          ctx.fillStyle = el.color;
          ctx.beginPath();
          ctx.moveTo(x, 2);
          ctx.lineTo(x - 4, 10);
          ctx.lineTo(x + 4, 10);
          ctx.closePath();
          ctx.fill();
          clickables.push({ x, wl: line.wl, element: elKey, label: line.label, strength: 0.3, preview: true });
        });
      });
    }

    // highlighted / selected line marker
    if (opts.highlightWl != null) {
      const x = wlToX(opts.highlightWl, w);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(x - 5, 0); ctx.lineTo(x + 5, 0); ctx.lineTo(x, 7); ctx.closePath(); ctx.fill();
    }

    return clickables;
  }

  /* Draw the intensity-vs-wavelength line graph */
  function drawIntensityGraph(canvas, star, opts) {
    opts = opts || {};
    const { ctx, w, h } = prepCanvas(canvas);
    const pad = { l: 34, r: 12, t: 14, b: 22 };
    const gw = w - pad.l - pad.r, gh = h - pad.t - pad.b;
    ctx.clearRect(0, 0, w, h);

    const { profile, minWl, maxWl, steps } = buildSpectrumProfile(star, 320);

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (gh * i) / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + gw, y); ctx.stroke();
    }
    ctx.fillStyle = '#6c7aa3';
    ctx.font = '9px sans-serif';
    ['1.0', '0.75', '0.5', '0.25', '0'].forEach((lbl, i) => {
      ctx.fillText(lbl, 4, pad.t + (gh * i) / 4 + 3);
    });
    [400, 450, 500, 550, 600, 650, 700].forEach(wl => {
      const x = pad.l + ((wl - minWl) / (maxWl - minWl)) * gw;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + gh); ctx.stroke();
      ctx.fillStyle = '#6c7aa3';
      ctx.fillText(wl, x - 8, h - 6);
    });

    // area fill under curve
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t + gh);
    for (let i = 0; i <= steps; i++) {
      const wl = minWl + (i / steps) * (maxWl - minWl);
      const x = pad.l + ((wl - minWl) / (maxWl - minWl)) * gw;
      const y = pad.t + gh - profile[i] * gh;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(pad.l + gw, pad.t + gh);
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(0, pad.t, 0, pad.t + gh);
    areaGrad.addColorStop(0, 'rgba(38,198,218,0.28)');
    areaGrad.addColorStop(1, 'rgba(38,198,218,0.02)');
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // line
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const wl = minWl + (i / steps) * (maxWl - minWl);
      const x = pad.l + ((wl - minWl) / (maxWl - minWl)) * gw;
      const y = pad.t + gh - profile[i] * gh;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#26C6DA';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(38,198,218,0.6)';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const clickables = [];
    const activeLines = getActiveLines(star);
    activeLines.forEach(line => {
      const x = pad.l + ((line.wl - minWl) / (maxWl - minWl)) * gw;
      const yVal = interpProfile(profile, line.wl, minWl, maxWl);
      const y = pad.t + gh - yVal * gh;
      ctx.fillStyle = opts.highlightWl === line.wl ? '#ffffff' : '#FFB300';
      ctx.beginPath(); ctx.arc(x, y, opts.highlightWl === line.wl ? 4.5 : 3, 0, Math.PI * 2); ctx.fill();
      clickables.push({ x, wl: line.wl, element: line.element, label: line.label, strength: line.strength });
    });

    return clickables;
  }

  function nearestClickable(clickables, xPix, tolerance) {
    tolerance = tolerance || 10;
    let best = null, bestDist = Infinity;
    clickables.forEach(c => {
      const d = Math.abs(c.x - xPix);
      if (d < bestDist) { bestDist = d; best = c; }
    });
    if (best && bestDist <= tolerance) return best;
    return null;
  }

  /* ---------------- LAB (Free Exploration / Guided) ---------------- */
  const GUIDED_STEPS = [
    { starId: 'sun', text: 'Welcome! Let\u2019s examine the spectrum of the Sun, step by step.', sub: 'The Sun is our closest star \u2014 the reference every other spectral type is measured against.', highlight: null },
    { starId: 'sun', text: 'This glowing band is a continuous spectrum: the Sun\u2019s light spread out by wavelength, violet to red.', sub: 'Look closely \u2014 it isn\u2019t perfectly smooth. Thin dark gaps interrupt it.', highlight: null },
    { starId: 'sun', text: 'Find the pair of dark lines near the violet edge, around 393\u2013397 nm.', sub: 'These are the Calcium II H & K lines, the strongest features in Sun-like stars.', highlight: 396.8 },
    { starId: 'sun', text: 'Now look in the yellow band, right around 589 nm.', sub: 'That is the Sodium "D" doublet \u2014 two lines so close they can look like one.', highlight: 589.0 },
    { starId: 'sun', text: 'Finally, find the fainter dip in the red, near 656 nm.', sub: 'That\u2019s hydrogen\u2019s H-alpha line. It appears in almost every star, but is only moderate here.', highlight: 656.3 },
    { starId: 'sun', text: 'You just read the Sun\u2019s chemical fingerprint directly from its light.', sub: 'Try Free Exploration on other stars, or test yourself in Challenge Mode.', highlight: null, isLast: true }
  ];

  const lab = {
    starId: 'sun',
    mode: 'free', // 'free' | 'guided'
    guidedIndex: 0,
    previewElements: new Set(),
    selectedLine: null,
    spectrumClickables: [],
    graphClickables: []
  };

  function starById(id) { return STARS.find(s => s.id === id); }

  function buildStarChips(container, opts) {
    container.innerHTML = STARS.map(s => `
      <div class="star-chip ${opts.selectedId === s.id ? 'selected' : ''}" data-star="${s.id}">
        <div class="swatch" style="background:${starTempColor(s.tempK)}"></div>
        <div class="name">${s.name}</div>
      </div>`).join('');
    container.querySelectorAll('.star-chip').forEach(chip => {
      chip.addEventListener('click', () => opts.onSelect(chip.dataset.star));
    });
  }

  function starTempColor(tempK) {
    // simple visual temp->color mapping for UI swatches
    if (tempK >= 20000) return '#9bb8ff';
    if (tempK >= 10000) return '#cfe0ff';
    if (tempK >= 7500) return '#f4f6ff';
    if (tempK >= 6000) return '#fff3d6';
    if (tempK >= 5200) return '#ffd98a';
    if (tempK >= 3700) return '#ffab66';
    return '#ff7a5c';
  }

  function setLabMode(mode) {
    lab.mode = mode;
    lab.guidedIndex = 0;
    lab.selectedLine = null;
    document.getElementById('guide-panel').style.display = mode === 'guided' ? 'block' : 'none';
    document.getElementById('lab-title').textContent = mode === 'guided' ? 'Guided Experiment' : 'Free Exploration';
    if (mode === 'guided') {
      lab.starId = GUIDED_STEPS[0].starId;
      applyGuidedStep();
    } else {
      document.getElementById('lab-subtitle').textContent = 'Select a star to begin';
    }
    renderLab();
  }

  function applyGuidedStep() {
    const step = GUIDED_STEPS[lab.guidedIndex];
    lab.starId = step.starId;
    lab.selectedLine = step.highlight ? findLineByWl(lab.starId, step.highlight) : null;
    document.getElementById('guide-text').textContent = step.text;
    document.getElementById('guide-sub').textContent = step.sub;
    document.getElementById('guide-back').disabled = lab.guidedIndex === 0;
    document.getElementById('guide-next').textContent = step.isLast ? 'Finish' : 'Next';
    const track = document.getElementById('guide-track');
    track.innerHTML = GUIDED_STEPS.map((s, i) => `<div class="seg ${i <= lab.guidedIndex ? 'done' : ''}"></div>`).join('');
    document.getElementById('lab-subtitle').textContent = `Step ${lab.guidedIndex + 1} of ${GUIDED_STEPS.length}`;
  }

  function findLineByWl(starId, wl) {
    const star = starById(starId);
    const lines = getActiveLines(star);
    let best = null, bestDist = Infinity;
    lines.forEach(l => { const d = Math.abs(l.wl - wl); if (d < bestDist) { bestDist = d; best = l; } });
    return best;
  }

  function renderLab() {
    const star = starById(lab.starId) || STARS[5];
    lab.starId = star.id;

    buildStarChips(document.getElementById('star-select-row'), {
      selectedId: star.id,
      onSelect: (id) => {
        if (lab.mode === 'guided') return; // locked during guided mode
        lab.starId = id;
        lab.selectedLine = null;
        DB.markStarExplored(id);
        renderLab();
      }
    });
    document.getElementById('star-select-panel').style.opacity = lab.mode === 'guided' ? '0.55' : '1';
    document.getElementById('star-select-panel').style.pointerEvents = lab.mode === 'guided' ? 'none' : 'auto';

    const cls = spectralClass(star.tempK);
    document.getElementById('star-info-line').innerHTML = `
      <span class="badge hot">Type ${star.type}</span>
      <span class="badge temp">${star.tempK.toLocaleString()} K \u00B7 Class ${cls}</span>
      <span class="badge">${star.fact}</span>`;

    if (lab.mode === 'free') document.getElementById('lab-subtitle').textContent = star.name + ' \u2014 ' + star.type;

    lab.spectrumClickables = drawSpectrumBar(document.getElementById('spectrum-canvas'), star, {
      previewElements: lab.previewElements,
      highlightWl: lab.selectedLine ? lab.selectedLine.wl : null
    });
    lab.graphClickables = drawIntensityGraph(document.getElementById('intensity-canvas'), star, {
      highlightWl: lab.selectedLine ? lab.selectedLine.wl : null
    });

    renderElementToggleGrid(star);
    renderLineInfo();
    renderExplainPanel(star);
  }

  function renderElementToggleGrid(star) {
    const grid = document.getElementById('element-toggle-grid');
    grid.innerHTML = ELEMENT_ORDER.map(key => {
      const el = ELEMENTS[key];
      const active = lab.previewElements.has(key);
      return `<button class="element-toggle ${active ? 'active' : ''}" data-el="${key}">
        <span class="sw" style="background:${el.color}"></span>${el.symbol} \u00B7 ${el.name}
      </button>`;
    }).join('');
    grid.querySelectorAll('.element-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.el;
        if (lab.previewElements.has(key)) lab.previewElements.delete(key); else lab.previewElements.add(key);
        renderLab();
      });
    });
  }

  function renderLineInfo() {
    const empty = document.getElementById('line-info-empty');
    const box = document.getElementById('line-info');
    const sig = document.getElementById('significance-text');
    if (!lab.selectedLine) {
      empty.style.display = 'block'; box.style.display = 'none'; sig.textContent = '';
      return;
    }
    const line = lab.selectedLine;
    const region = spectralRegion(line.wl);
    const el = ELEMENTS[line.element];
    empty.style.display = 'none'; box.style.display = 'flex';
    box.innerHTML = `
      <div class="li-item"><div class="li-label">Wavelength</div><div class="li-value">${line.wl.toFixed(1)} nm</div></div>
      <div class="li-item"><div class="li-label">Element</div><div class="li-value" style="color:${el ? el.color : '#fff'}">${el ? el.name : '\u2014'}</div></div>
      <div class="li-item"><div class="li-label">Spectral Region</div><div class="li-value" style="color:${region.color}">${region.name}</div></div>
      <div class="li-item"><div class="li-label">Line ID</div><div class="li-value">${line.label || '\u2014'}</div></div>`;
    sig.textContent = el ? el.significance : '';
  }

  function renderExplainPanel(star) {
    const cls = spectralClass(star.tempK);
    const activeLines = getActiveLines(star);
    const elNames = [...new Set(activeLines.map(l => ELEMENTS[l.element].name))];
    document.getElementById('explain-text').innerHTML =
      `<b>${star.name}</b> is a ${cls}-class star with a surface temperature of about ${star.tempK.toLocaleString()} K.
       Its spectrum shows measurable absorption from: <b>${elNames.join(', ') || 'no strong lines at this resolution'}</b>.
       ${cls === 'O' || cls === 'B' ? 'Hot, blue stars like this ionize light elements like helium, producing hot-star signatures.' :
        cls === 'A' || cls === 'F' ? 'At this temperature, hydrogen\u2019s Balmer lines are near their strongest possible absorption.' :
        cls === 'G' ? 'Sun-like temperatures favor strong ionized calcium and a rich forest of metal lines.' :
        'Cooler atmospheres like this allow neutral metals, and in the coolest stars, whole molecules like TiO, to survive and absorb light.'}`;
  }

  function wireCanvasClicks() {
    document.getElementById('spectrum-canvas').addEventListener('click', (e) => {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const hit = nearestClickable(lab.spectrumClickables, x, 12);
      handleLineClick(hit);
    });
    document.getElementById('intensity-canvas').addEventListener('click', (e) => {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const hit = nearestClickable(lab.graphClickables, x, 12);
      handleLineClick(hit);
    });
  }

  function handleLineClick(hit) {
    if (!hit || hit.preview) { if (hit && hit.preview) toast(`${ELEMENTS[hit.element].name} would appear near ${hit.wl.toFixed(1)} nm here \u2014 but that line isn't detected in this star.`); return; }
    lab.selectedLine = hit;
    DB.logLine();
    DB.markStarExplored(lab.starId);
    DB.addNotebookEntry(`Identified ${ELEMENTS[hit.element].name} (${hit.label}) at ${hit.wl.toFixed(1)} nm in ${starById(lab.starId).name}.`, true);
    renderLab();
    if (lab.mode === 'guided') {
      const step = GUIDED_STEPS[lab.guidedIndex];
      if (step.highlight && Math.abs(hit.wl - step.highlight) < 3) toast('Correct \u2014 well spotted!');
    }
  }

  /* ---------------- COMPARE ---------------- */
  const compareState = { a: 'sun', b: 'sirius' };
  function renderCompare() {
    buildStarChips(document.getElementById('compare-select-a'), {
      selectedId: compareState.a,
      onSelect: (id) => { compareState.a = id; renderCompare(); }
    });
    buildStarChips(document.getElementById('compare-select-b'), {
      selectedId: compareState.b,
      onSelect: (id) => { compareState.b = id; renderCompare(); }
    });
    const a = starById(compareState.a), b = starById(compareState.b);
    document.getElementById('legend-a').textContent = a.name;
    document.getElementById('legend-b').textContent = b.name;
    drawCompareGraph(a, b);

    const aEls = new Set(getStarComposition(a));
    const bEls = new Set(getStarComposition(b));
    const onlyA = [...aEls].filter(x => !bEls.has(x));
    const onlyB = [...bEls].filter(x => !aEls.has(x));
    const shared = [...aEls].filter(x => bEls.has(x));
    document.getElementById('compare-diff-text').innerHTML = `
      <b>${a.name}</b> (${a.tempK.toLocaleString()} K, class ${spectralClass(a.tempK)}) vs
      <b>${b.name}</b> (${b.tempK.toLocaleString()} K, class ${spectralClass(b.tempK)}).<br><br>
      \u2022 Shared elements: <b>${shared.map(k => ELEMENTS[k].name).join(', ') || 'none'}</b><br>
      \u2022 Only in ${a.name}: <b>${onlyA.map(k => ELEMENTS[k].name).join(', ') || 'none'}</b><br>
      \u2022 Only in ${b.name}: <b>${onlyB.map(k => ELEMENTS[k].name).join(', ') || 'none'}</b><br><br>
      ${a.tempK > b.tempK ? a.name : b.name} is hotter, so its spectrum leans bluer and shows ${a.tempK > b.tempK ? (aEls.has('He') ? 'helium' : 'stronger hydrogen') : (bEls.has('He') ? 'helium' : 'stronger hydrogen')} absorption,
      while ${a.tempK > b.tempK ? b.name : a.name} is cooler and shows richer metal (and possibly molecular) absorption.`;
  }

  function drawCompareGraph(a, b) {
    const canvas = document.getElementById('compare-canvas');
    const { ctx, w, h } = prepCanvas(canvas);
    const pad = { l: 34, r: 12, t: 14, b: 22 };
    const gw = w - pad.l - pad.r, gh = h - pad.t - pad.b;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (gh * i) / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + gw, y); ctx.stroke();
    }
    ctx.fillStyle = '#6c7aa3'; ctx.font = '9px sans-serif';
    [400, 450, 500, 550, 600, 650, 700].forEach(wl => {
      const x = pad.l + ((wl - 380) / (750 - 380)) * gw;
      ctx.fillText(wl, x - 8, h - 6);
    });

    function plot(star, color) {
      const { profile, minWl, maxWl, steps } = buildSpectrumProfile(star, 320);
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const wl = minWl + (i / steps) * (maxWl - minWl);
        const x = pad.l + ((wl - minWl) / (maxWl - minWl)) * gw;
        const y = pad.t + gh - profile[i] * gh;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.shadowColor = color; ctx.shadowBlur = 5;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    plot(b, '#FFB300');
    plot(a, '#26C6DA');
  }

  /* ---------------- CHALLENGE ---------------- */
  const challenge = {
    starId: null,
    guessed: new Set(),
    submitted: false,
    revealed: false
  };

  function newChallenge() {
    const pool = STARS.map(s => s.id);
    let pick;
    do { pick = pool[Math.floor(Math.random() * pool.length)]; } while (pick === challenge.starId && pool.length > 1);
    challenge.starId = pick;
    challenge.guessed = new Set();
    challenge.submitted = false;
    challenge.revealed = false;
    document.getElementById('challenge-feedback').innerHTML = '';
    renderChallenge();
  }

  function renderChallenge() {
    if (!challenge.starId) newChallenge();
    const star = starById(challenge.starId);
    document.getElementById('challenge-temp-badge').textContent = challenge.revealed
      ? `${star.name} \u00B7 ${star.tempK.toLocaleString()} K`
      : 'Unknown Star';
    renderChallengeCanvases();
    renderChallengeGrid();
  }

  function renderChallengeCanvases() {
    if (!challenge.starId) return;
    const star = starById(challenge.starId);
    drawSpectrumBar(document.getElementById('challenge-spectrum-canvas'), star, {});
    drawIntensityGraph(document.getElementById('challenge-intensity-canvas'), star, {});
  }

  function renderChallengeGrid() {
    const grid = document.getElementById('challenge-element-grid');
    const star = starById(challenge.starId);
    const actual = new Set(getStarComposition(star));
    grid.innerHTML = ELEMENT_ORDER.map(key => {
      const el = ELEMENTS[key];
      let cls = challenge.guessed.has(key) ? 'active' : '';
      if (challenge.submitted) {
        if (challenge.guessed.has(key) && actual.has(key)) cls = 'correct';
        else if (challenge.guessed.has(key) && !actual.has(key)) cls = 'incorrect';
        else if (!challenge.guessed.has(key) && actual.has(key)) cls = 'missed';
      }
      return `<button class="element-toggle ${cls}" data-el="${key}" ${challenge.submitted ? 'disabled' : ''}>
        <span class="sw" style="background:${el.color}"></span>${el.symbol} \u00B7 ${el.name}
      </button>`;
    }).join('');
    if (!challenge.submitted) {
      grid.querySelectorAll('.element-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.el;
          if (challenge.guessed.has(key)) challenge.guessed.delete(key); else challenge.guessed.add(key);
          renderChallengeGrid();
        });
      });
    }
    document.getElementById('btn-submit-challenge').disabled = challenge.submitted;
  }

  function submitChallenge() {
    if (challenge.submitted) return;
    const star = starById(challenge.starId);
    const actual = new Set(getStarComposition(star));
    const guessed = challenge.guessed;
    let correct = 0, incorrect = 0, missed = 0;
    ELEMENT_ORDER.forEach(k => {
      const inActual = actual.has(k), inGuess = guessed.has(k);
      if (inActual && inGuess) correct++;
      else if (!inActual && inGuess) incorrect++;
      else if (inActual && !inGuess) missed++;
    });
    const total = actual.size || 1;
    let score = Math.round(((correct - incorrect * 0.5) / total) * 100);
    score = Math.max(0, Math.min(100, score));
    const pass = score >= 70;

    challenge.submitted = true;
    challenge.revealed = true;
    renderChallenge();

    const fb = document.getElementById('challenge-feedback');
    fb.innerHTML = `<div class="feedback-box ${pass ? 'pass' : 'fail'}">
      <b>${pass ? '\u2705 Well analysed!' : '\uD83D\uDD0D Not quite.'}</b> This was <b>${star.name}</b> (${star.type}, ${star.tempK.toLocaleString()} K).<br>
      Score: <b>${score}%</b> \u2014 ${correct} correct, ${incorrect} incorrect selection${incorrect === 1 ? '' : 's'}, ${missed} missed.<br>
      Actual elements present: <b>${[...actual].map(k => ELEMENTS[k].name).join(', ')}</b>.
    </div>`;

    DB.addChallengeResult({ ts: Date.now(), starId: star.id, score, pass, guessed: [...guessed], actual: [...actual] });
    DB.markStarExplored(star.id);
    toast(pass ? 'Nice work \u2014 saved to your progress.' : 'Recorded \u2014 try another star to improve.');
  }

  function revealChallenge() {
    challenge.revealed = true;
    document.getElementById('challenge-temp-badge').textContent = `${starById(challenge.starId).name} \u00B7 ${starById(challenge.starId).tempK.toLocaleString()} K`;
  }

  /* ---------------- NOTEBOOK ---------------- */
  function renderNotebook() {
    const s = DB.get();
    const list = document.getElementById('notebook-entries');
    if (!s.notebook.length) {
      list.innerHTML = `<div class="empty-state">No entries yet. Log spectral lines in the Lab, or write a note above.</div>`;
      return;
    }
    list.innerHTML = `<div class="entry-list">${s.notebook.map(e => `
      <div class="entry">
        <div>
          <div class="e-text">${e.auto ? '\uD83D\uDD2C ' : '\uD83D\uDCDD '}${escapeHtml(e.text)}</div>
          <div class="e-meta">${new Date(e.ts).toLocaleString()}</div>
        </div>
        <button class="e-del" data-ts="${e.ts}" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>`).join('')}</div>`;
    list.querySelectorAll('.e-del').forEach(btn => {
      btn.addEventListener('click', () => { DB.removeNotebookEntry(Number(btn.dataset.ts)); renderNotebook(); });
    });
  }
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  /* ---------------- PROGRESS ---------------- */
  function renderProgress() {
    const s = DB.get();
    const totalChallenges = s.challenges.length;
    const avgScore = totalChallenges ? Math.round(s.challenges.reduce((a, c) => a + c.score, 0) / totalChallenges) : 0;
    const bestScore = totalChallenges ? Math.max(...s.challenges.map(c => c.score)) : 0;

    document.getElementById('progress-grid').innerHTML = `
      <div class="progress-card"><div class="p-val">${s.starsExplored.length}/${STARS.length}</div><div class="p-label">Stars Explored</div></div>
      <div class="progress-card"><div class="p-val">${s.linesLogged}</div><div class="p-label">Lines Identified</div></div>
      <div class="progress-card"><div class="p-val">${totalChallenges}</div><div class="p-label">Challenges Done</div></div>
      <div class="progress-card"><div class="p-val">${bestScore}%</div><div class="p-label">Best Score</div></div>`;

    const pct = Math.round((s.starsExplored.length / STARS.length) * 100);
    document.getElementById('stars-explored-fill').style.width = pct + '%';
    document.getElementById('stars-explored-text').textContent =
      s.starsExplored.length === 0 ? 'Visit the Lab to start exploring stars.' :
      `${s.starsExplored.map(id => starById(id) ? starById(id).name : id).join(', ')}`;

    const histEl = document.getElementById('challenge-history');
    if (!s.challenges.length) {
      histEl.innerHTML = `<div class="empty-state">No challenges completed yet.</div>`;
    } else {
      histEl.innerHTML = s.challenges.slice(0, 12).map(c => {
        const star = starById(c.starId);
        return `<div class="history-row">
          <span>${star ? star.name : 'Unknown'}</span>
          <span class="h-score ${c.pass ? 'pass' : 'fail'}">${c.score}%</span>
        </div>`;
      }).join('');
    }
  }

  function renderHomeStats() {
    const s = DB.get();
    const avg = s.challenges.length ? Math.round(s.challenges.reduce((a, c) => a + c.score, 0) / s.challenges.length) : null;
    document.getElementById('home-stats').innerHTML = `
      <div class="stat-chip"><div class="v">${s.starsExplored.length}/${STARS.length}</div><div class="l">Stars Explored</div></div>
      <div class="stat-chip"><div class="v">${s.challenges.length}</div><div class="l">Challenges</div></div>
      <div class="stat-chip"><div class="v">${avg == null ? '\u2014' : avg + '%'}</div><div class="l">Avg. Score</div></div>`;
  }

  /* ---------------- ABOUT ---------------- */
  const VOCAB = [
    ['Spectroscope', 'An instrument that splits light into its component wavelengths so they can be studied individually.'],
    ['Continuous Spectrum', 'An unbroken rainbow of colour produced by a hot, dense source like a star\u2019s surface.'],
    ['Absorption Line', 'A thin dark gap in a spectrum where atoms in a cooler outer layer absorbed light of a specific wavelength.'],
    ['Emission Line', 'A bright, narrow spike of light at a specific wavelength, produced when excited atoms release energy.'],
    ['Wavelength', 'The distance between successive peaks of a light wave, measured in nanometres (nm) for visible light.'],
    ['Effective Temperature', 'The surface temperature of a star inferred from the overall shape and colour of its spectrum.'],
    ['Spectral Class', 'A category (O, B, A, F, G, K, M) that groups stars by surface temperature and the resulting spectral features.'],
    ['Balmer Series', 'A family of hydrogen absorption/emission lines in the visible range, produced by electrons moving to or from the n=2 energy level.']
  ];
  const FAQ = [
    ['How can we know what a star is made of if we can\u2019t touch it?', 'Every element absorbs and emits light only at very specific wavelengths, determined by the allowed energy levels of its electrons. Those wavelengths are as unique as a fingerprint, so matching the dark lines in starlight to laboratory-measured wavelengths tells us exactly which elements are present.'],
    ['Why do hot stars and cool stars show different lines?', 'An element can only absorb a given line if enough of its atoms are in the right energy state \u2014 and that depends on temperature. Very hot stars ionize away electrons needed for some lines, while cool stars can\u2019t excite atoms enough for others. Each temperature has its own signature set of visible lines.'],
    ['What is the difference between an absorption and an emission line?', 'Absorption lines form when cooler gas in front of a hot source removes specific wavelengths from the light passing through it, leaving dark gaps. Emission lines form when excited atoms in glowing gas release light at specific wavelengths, adding bright spikes instead.']
  ];
  function renderAbout() {
    document.getElementById('vocab-list').innerHTML = VOCAB.map(([t, d]) => `
      <div class="vocab-item"><div class="vocab-term">${t}</div><div class="vocab-def">${d}</div></div>`).join('');
    document.getElementById('faq-list').innerHTML = FAQ.map(([q, a], i) => `
      <div class="accordion" data-idx="${i}">
        <div class="accordion-head">${q}
          <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="accordion-body">${a}</div>
      </div>`).join('');
    document.querySelectorAll('.accordion-head').forEach(h => {
      h.addEventListener('click', () => h.parentElement.classList.toggle('open'));
    });
  }

  /* ---------------- Wiring ---------------- */
  function init() {
    initBottomNavs();

    document.getElementById('btn-enter-lab').addEventListener('click', () => showScreen('home', false));

    document.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.goto;
        if (target === 'lab') setLabMode(btn.dataset.mode || 'free');
        showScreen(target);
      });
    });

    document.querySelectorAll('[data-back]').forEach(btn => btn.addEventListener('click', goBack));

    wireCanvasClicks();

    document.getElementById('btn-reset-lab').addEventListener('click', () => {
      lab.previewElements.clear();
      lab.selectedLine = null;
      renderLab();
      toast('Lab view reset.');
    });

    document.getElementById('guide-next').addEventListener('click', () => {
      const step = GUIDED_STEPS[lab.guidedIndex];
      if (step.isLast) {
        DB.setGuidedCompleted();
        toast('Guided experiment complete!');
        showScreen('home');
        return;
      }
      lab.guidedIndex = Math.min(GUIDED_STEPS.length - 1, lab.guidedIndex + 1);
      applyGuidedStep();
      renderLab();
    });
    document.getElementById('guide-back').addEventListener('click', () => {
      lab.guidedIndex = Math.max(0, lab.guidedIndex - 1);
      applyGuidedStep();
      renderLab();
    });

    document.getElementById('btn-new-challenge').addEventListener('click', newChallenge);
    document.getElementById('btn-submit-challenge').addEventListener('click', submitChallenge);
    document.getElementById('btn-reveal-challenge').addEventListener('click', () => { revealChallenge(); });

    document.getElementById('btn-save-note').addEventListener('click', () => {
      const ta = document.getElementById('notebook-input');
      const text = ta.value.trim();
      if (!text) { toast('Write something first.'); return; }
      DB.addNotebookEntry(text, false);
      ta.value = '';
      renderNotebook();
      toast('Note saved.');
    });

    document.getElementById('btn-reset-progress').addEventListener('click', () => {
      if (confirm('Reset all progress, scores, and notebook entries? This cannot be undone.')) {
        DB.reset();
        renderProgress();
        renderNotebook();
        toast('Progress reset.');
      }
    });

    renderAbout();
    renderHomeStats();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderForScreen(currentScreenId), 150);
    });

    // service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
