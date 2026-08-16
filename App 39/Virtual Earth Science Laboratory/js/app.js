/* ==========================================================================
   app.js — router + shell + home dashboard + reference sections
   ========================================================================== */
window.SIM_META = [
  { id:'rockcycle',  n:1, title:'Rock Cycle Laboratory', short:'Igneous ⇄ Sedimentary ⇄ Metamorphic', g:'g1', icon:'🪨',
    tag:['Rocks','Core'], objectives:[
      'Explain how heat, pressure, cooling rate, weathering and erosion transform one rock type into another.',
      'Trace a rock sample through at least two complete cycles.',
      'Predict the rock family produced by a given combination of processes.'] },
  { id:'soil',       n:2, title:'Soil Formation Simulator', short:'Grow a soil profile from bedrock', g:'g2', icon:'🟤',
    tag:['Soil','Time'], objectives:[
      'Identify the O, A, E, B, C and R soil horizons and what forms each one.',
      'Explain how climate, parent rock, vegetation and time control soil depth and texture.',
      'Compare soil profiles produced under different environmental conditions.'] },
  { id:'weathering', n:3, title:'Weathering Laboratory', short:'Physical, chemical & biological breakdown', g:'g3', icon:'⛰️',
    tag:['Weathering'], objectives:[
      'Distinguish physical, chemical and biological weathering by their visible signatures.',
      'Explain how temperature swings, rainfall, freeze–thaw cycles, roots and wind accelerate rock breakdown.',
      'Predict which weathering process dominates in a given climate.'] },
  { id:'erosion',    n:4, title:'Erosion & Deposition Studio', short:'Rivers, wind & waves reshape the land', g:'g4', icon:'🌊',
    tag:['Landforms'], objectives:[
      'Relate river velocity and slope to erosion, transport and deposition.',
      'Explain the formation of meanders, floodplains, deltas, dunes and coastal landforms.',
      'Compare erosional and depositional landscapes.'] },
  { id:'fossil',     n:5, title:'Fossil Formation Explorer', short:'From burial to preserved evidence', g:'g5', icon:'🦴',
    tag:['Fossils','Time'], objectives:[
      'Explain the conditions required for fossilisation to occur.',
      'Differentiate molds, casts, petrified fossils, trace fossils and amber fossils.',
      'Use fossil evidence to infer past environments.'] },
  { id:'earthquake', n:6, title:'Earthquake Waves Laboratory', short:'P, S & surface wave behaviour', g:'g6', icon:'📈',
    tag:['Hazards','Core'], objectives:[
      'Compare the speed, motion and damage potential of P-waves, S-waves and surface waves.',
      'Explain how magnitude, focal depth and ground material affect shaking intensity.',
      'Read a simple seismograph trace to estimate arrival-time differences.'] },
  { id:'volcano',    n:7, title:'Volcano Formation Laboratory', short:'Build shield, composite & cinder cones', g:'g7', icon:'🌋',
    tag:['Hazards','Core'], objectives:[
      'Relate magma silica content and viscosity to eruption style and volcano shape.',
      'Compare shield volcanoes, composite volcanoes and cinder cones.',
      'Explain the volcanic hazards associated with each type.'] },
  { id:'plates',     n:8, title:'Plate Movement Explorer', short:'Divergent, convergent & transform', g:'g8', icon:'🌍',
    tag:['Tectonics','Core'], objectives:[
      'Compare divergent, convergent and transform plate boundaries.',
      'Explain how each boundary type produces distinct landforms over geological time.',
      'Relate plate motion to earthquakes, volcanoes and mountain building.'] },
  { id:'minerals',   n:9, title:'Mineral Formation Laboratory', short:'Grow & identify crystals', g:'g9', icon:'💎',
    tag:['Minerals'], objectives:[
      'Explain how temperature, pressure, cooling rate and water chemistry control crystal growth.',
      'Use hardness, cleavage, lustre, colour and density to identify minerals.',
      'Relate cooling rate to crystal size.'] },
  { id:'timeline',   n:10, title:"Earth's Geological Timeline Studio", short:'4.6 billion years, zoomable', g:'g10', icon:'🕰️',
    tag:['Deep Time','Core'], objectives:[
      'Place major events — Earth\'s formation, first oceans, origin of life, mass extinctions, the dinosaur era, human evolution — on a single timeline.',
      'Explain why geological time is usually shown on a non-linear or zoomed scale.',
      'Connect fossil evidence to specific intervals of geological time.'] },
];

window.EarthLabApp = (() => {
  let currentSim = null;

  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return [...root.querySelectorAll(sel)]; }

  function init(){
    wireSplash();
    wireShell();
    renderSideNav();
    renderHome();
    renderSimGrid('#simGridAll', SIM_META);
    renderHandbook();
    renderGallery();
    renderGlossary();
    renderQuizCentre();
    renderAbout();
    refreshProgress();
    go('home');

    // restore theme
    if(EarthLab.state.theme === 'light'){ document.documentElement.setAttribute('data-theme','light'); }
  }

  function wireSplash(){
    $('#enterAppBtn').addEventListener('click', ()=>{
      $('#splash').style.opacity = '0';
      $('#splash').style.transition = 'opacity .5s ease';
      setTimeout(()=>{ $('#splash').style.display='none'; $('#app').classList.add('active'); }, 480);
    });
    drawSplashStrata();
  }

  function drawSplashStrata(){
    const c = $('#strataBg');
    if(!c) return;
    const ctx = c.getContext('2d');
    function resize(){
      c.width = c.clientWidth; c.height = c.clientHeight;
      draw();
    }
    function draw(){
      const w=c.width, h=c.height;
      ctx.clearRect(0,0,w,h);
      const colors = ['#1B3A2B','#2F6B4F','#4A3324','#6B4A32','#1976D2'];
      const bands = 5;
      for(let i=0;i<bands;i++){
        ctx.fillStyle = colors[i];
        ctx.globalAlpha = 0.5;
        const y0 = h - (i+1)*(h/bands) - 20;
        ctx.beginPath();
        ctx.moveTo(0, y0 + h);
        for(let x=0;x<=w;x+=40){
          const wobble = Math.sin(x*0.01 + i)*14;
          ctx.lineTo(x, y0 + wobble + h*0.15);
        }
        ctx.lineTo(w, h); ctx.lineTo(0,h); ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    window.addEventListener('resize', resize);
    resize();
  }

  function wireShell(){
    $all('.brand').forEach(b=> b.addEventListener('click', ()=> go('home')));
    $('#hamburger').addEventListener('click', ()=> $('#sidenav').classList.toggle('open'));
    $('#themeToggle').addEventListener('click', ()=>{
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
      EarthLab.state.theme = isLight ? 'dark' : 'light'; EarthLab.save();
    });
    $('#searchInput').addEventListener('input', (e)=>{
      const q = e.target.value.toLowerCase();
      const filtered = SIM_META.filter(s => s.title.toLowerCase().includes(q) || s.short.toLowerCase().includes(q) || s.tag.join(' ').toLowerCase().includes(q));
      renderSimGrid('#simGridAll', q ? filtered : SIM_META);
    });
    $all('[data-nav]').forEach(el=>{
      el.addEventListener('click', ()=> go(el.dataset.nav));
    });
  }

  function renderSideNav(){
    const nav = $('#simNavList');
    nav.innerHTML = SIM_META.map(s=>`
      <div class="nav-item" data-open-sim="${s.id}"><span class="ic">${s.icon}</span> ${s.title}</div>
    `).join('');
    $all('[data-open-sim]', nav).forEach(el=>{
      el.addEventListener('click', ()=> openSim(el.dataset.openSim));
    });
  }

  function go(screen){
    $all('.screen').forEach(s=>s.classList.remove('active'));
    const el = document.getElementById('screen-'+screen);
    if(el) el.classList.add('active');
    $all('.nav-item[data-nav]').forEach(n=> n.classList.toggle('active', n.dataset.nav===screen));
    $all('.bottomnav button').forEach(n=> n.classList.toggle('active', n.dataset.nav===screen));
    $('#sidenav').classList.remove('open');
    window.scrollTo({top:0, behavior:'instant' in window ? 'instant':'auto'});
  }

  function renderSimGrid(sel, list){
    const el = $(sel);
    if(!el) return;
    el.innerHTML = list.map(cardHTML).join('') || `<p class="muted">No simulations match your search.</p>`;
    $all('.sim-card', el).forEach(c=> c.addEventListener('click', ()=> openSim(c.dataset.id)));
  }

  function cardHTML(s){
    const done = EarthLab.isComplete(s.id);
    return `
    <div class="sim-card glass" data-id="${s.id}">
      <div class="thumb ${s.g}"><span class="num">MODULE ${String(s.n).padStart(2,'0')}</span><span class="emoji">${s.icon}</span></div>
      <div class="body">
        <h3>${s.title}</h3>
        <p>${s.short}</p>
        <div class="meta">
          ${s.tag.map(t=>`<span class="chip">${t}</span>`).join('')}
          ${done ? '<span class="chip done">✓ Completed</span>' : ''}
        </div>
      </div>
    </div>`;
  }

  function renderHome(){
    $('#continueRow').innerHTML = SIM_META.slice(0,4).map(cardHTML).join('');
    $all('#continueRow .sim-card').forEach(c=> c.addEventListener('click', ()=> openSim(c.dataset.id)));
  }

  function refreshProgress(){
    const total = SIM_META.length;
    const done = SIM_META.filter(s=>EarthLab.isComplete(s.id)).length;
    const pct = Math.round((done/total)*100);
    $all('.progress-fill').forEach(el=> el.style.width = pct+'%');
    $all('.progress-label').forEach(el=> el.textContent = `${done}/${total} modules`);
    $all('.xp-label').forEach(el=> el.textContent = `${EarthLab.state.xp} XP`);
    $all('.level-label').forEach(el=> el.textContent = `Lv.${EarthLab.level()} · ${EarthLab.levelTitle()}`);
  }

  /* ---------------- Simulation screen ---------------- */
  function openSim(id){
    const meta = SIM_META.find(s=>s.id===id);
    const mod = window.SimModules && window.SimModules[id];
    if(!meta || !mod){ EarthLab.toast('Module not found'); return; }
    currentSim = id;
    const root = $('#screen-simulation');
    root.innerHTML = simFrame(meta);
    go('simulation');
    EarthLab.wireTabs(root);

    // toolbar wiring
    $('#bookmarkBtn').addEventListener('click', ()=>{
      const on = EarthLab.toggleBookmark(id);
      $('#bookmarkBtn').innerHTML = on ? '★' : '☆';
      EarthLab.toast(on ? 'Bookmarked' : 'Bookmark removed');
    });
    $('#bookmarkBtn').innerHTML = EarthLab.isBookmarked(id) ? '★' : '☆';

    $('#fullscreenBtn').addEventListener('click', ()=>{
      const stage = $('#simStage');
      if(document.fullscreenElement){ document.exitFullscreen(); }
      else stage.requestFullscreen?.();
    });
    $('#screenshotBtn').addEventListener('click', ()=>{
      const canvas = $('#simCanvas');
      if(!canvas) return;
      const a = document.createElement('a');
      a.download = `${id}-observation.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      EarthLab.toast('Screenshot saved');
    });
    $('#exportBtn').addEventListener('click', ()=>{
      const rows = root.__obsLog || [];
      const csv = 'Time,Variable,Value,Observation\n' + rows.map(r=>r.join(',')).join('\n');
      const blob = new Blob([csv], {type:'text/csv'});
      const a = document.createElement('a');
      a.download = `${id}-data.csv`; a.href = URL.createObjectURL(blob); a.click();
      EarthLab.toast('Observations exported');
    });
    let modeStudent = true;
    $('#modeToggle').addEventListener('click', ()=>{
      modeStudent = !modeStudent;
      $('#modeToggle').innerHTML = modeStudent ? '🎓 Student' : '🧑‍🏫 Teacher';
      root.classList.toggle('teacher-mode', !modeStudent);
      EarthLab.toast(modeStudent ? 'Student Mode' : 'Teacher Mode — answers & guidance shown');
    });

    // fill learn tab
    $('#objectivesList').innerHTML = meta.objectives.map(o=>`<li>${o}</li>`).join('');
    if(mod.learn){
      $('#backgroundText').innerHTML = mod.learn.background;
      $('#realWorldText').innerHTML = mod.learn.realWorld;
      $('#misconceptionsList').innerHTML = mod.learn.misconceptions.map(m=>`<li>${m}</li>`).join('');
      $('#factsList').innerHTML = mod.learn.facts.map(f=>`<li>${f}</li>`).join('');
      $('#summaryText').innerHTML = mod.learn.summary;
    }
    // quiz
    if(mod.quiz){
      EarthLab.renderQuiz($('#quizContainer'), id, mod.quiz);
    }
    // mount interactive sim
    root.__obsLog = [];
    mod.mount(root, EarthLab);

    $('#resetSimBtn').addEventListener('click', ()=>{ mod.reset && mod.reset(); EarthLab.toast('Simulation reset'); });
  }

  function simFrame(meta){
    return `
    <div class="back" data-nav="home">← Back to Home Dashboard</div>
    <div class="sim-header">
      <div>
        <h1>${meta.icon} ${meta.title}</h1>
        <p class="tagline">${meta.short}</p>
      </div>
      <div class="sim-toolbar">
        <button class="btn ghost" id="bookmarkBtn" title="Bookmark">☆</button>
        <button class="btn ghost" id="modeToggle">🎓 Student</button>
        <button class="btn ghost" id="fullscreenBtn">⛶ Full Screen</button>
        <button class="btn ghost" id="screenshotBtn">📷 Screenshot</button>
        <button class="btn ghost" id="exportBtn">⬇ Export CSV</button>
        <button class="btn amber" id="resetSimBtn">↺ Reset</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" data-tab="tab-sim">Simulation</button>
      <button class="tab-btn" data-tab="tab-data">Data &amp; Graphs</button>
      <button class="tab-btn" data-tab="tab-learn">Learn</button>
      <button class="tab-btn" data-tab="tab-quiz">Quiz</button>
    </div>

    <div id="tab-sim" class="tab-panel active">
      <div class="sim-layout">
        <div class="sim-stage glass" id="simStage">
          <canvas id="simCanvas" height="420"></canvas>
          <div class="obs-panel glass" id="obsPanel">
            <strong class="small muted">OBSERVATION LOG</strong>
            <div id="obsRows"></div>
          </div>
        </div>
        <div class="sim-controls glass" id="simControls">
          <h4>Adjustable Variables</h4>
          <div id="controlsHost"></div>
          <div class="playbar" id="playbarHost"></div>
        </div>
      </div>
    </div>

    <div id="tab-data" class="tab-panel">
      <div class="info-grid">
        <div class="chart-wrap glass" style="grid-column:1/-1">
          <h4>Live Graph</h4>
          <canvas id="dataChart" style="height:240px;"></canvas>
        </div>
      </div>
      <div class="section-head"><h2>Observation Table</h2></div>
      <div class="glass" style="padding:10px; border-radius:16px; overflow-x:auto;" id="dataTableHost"></div>
    </div>

    <div id="tab-learn" class="tab-panel">
      <div class="info-grid">
        <div class="info-card glass">
          <h4>🎯 Learning Objectives</h4>
          <ul class="fact-list" id="objectivesList"></ul>
        </div>
        <div class="info-card glass">
          <h4>📖 Scientific Background</h4>
          <p id="backgroundText" class="small"></p>
        </div>
        <div class="info-card glass">
          <h4>🌏 Real-World Applications</h4>
          <p id="realWorldText" class="small"></p>
        </div>
        <div class="info-card glass">
          <h4>⚠️ Common Misconceptions</h4>
          <ul class="fact-list" id="misconceptionsList"></ul>
        </div>
        <div class="info-card glass">
          <h4>✨ Interesting Facts</h4>
          <ul class="fact-list" id="factsList"></ul>
        </div>
        <div class="info-card glass">
          <h4>📝 Summary</h4>
          <p id="summaryText" class="small"></p>
        </div>
      </div>
    </div>

    <div id="tab-quiz" class="tab-panel">
      <div class="section-head"><h2>🧪 Mini Quiz — Test Your Understanding</h2></div>
      <div id="quizContainer"></div>
    </div>
    `;
  }

  /* ---------------- Handbook ---------------- */
  const HANDBOOK_SECTIONS = [
    {t:"Earth's Structure", body:"Earth is built of concentric layers distinguished by composition and behaviour: a thin, brittle crust (oceanic and continental); a hot, slowly-flowing solid mantle that drives plate motion by convection; a liquid outer core generating Earth's magnetic field; and a solid inner core under immense pressure."},
    {t:"Rocks", body:"Rocks fall into three families defined by how they form: igneous rocks crystallise from cooling magma or lava; sedimentary rocks form from compacted and cemented sediment; metamorphic rocks form when existing rock is transformed by heat and pressure without melting."},
    {t:"Minerals", body:"A mineral is a naturally occurring, inorganic solid with a definite chemical composition and an ordered crystal structure. Minerals are identified using physical properties such as hardness, cleavage, lustre, colour, streak and density."},
    {t:"Soil", body:"Soil develops from weathered rock and organic matter over long timescales, organised into horizons (O, A, E, B, C, R) that reflect the balance of parent material, climate, organisms, relief and time."},
    {t:"Plate Tectonics", body:"Earth's lithosphere is broken into plates that move atop the asthenosphere. Boundaries are divergent (plates separate), convergent (plates collide) or transform (plates slide past each other), each producing characteristic landforms and hazards."},
    {t:"Earthquakes", body:"Earthquakes release stored elastic energy along faults. Seismic waves — P, S and surface waves — travel outward at different speeds and cause different types of shaking, recorded by seismographs."},
    {t:"Volcanoes", body:"Volcanoes form where magma reaches the surface. Magma composition and gas content control viscosity, which in turn controls whether an eruption is effusive (gentle) or explosive, and what shape of volcano builds up."},
    {t:"Fossils", body:"Fossils are preserved evidence of past life. Rapid burial, low oxygen and mineral-rich groundwater favour preservation, producing molds, casts, petrifications, trace fossils or amber inclusions."},
    {t:"Geological Time", body:"Earth's 4.6-billion-year history is organised into eons, eras, periods and epochs. Because the timescale is so vast, it is usually shown compressed or on a logarithmic scale so recent, well-documented time doesn't disappear."},
    {t:"Weathering & Erosion", body:"Weathering breaks rock down in place (physically, chemically or biologically); erosion then transports the broken material by water, wind, ice or gravity, and deposition drops it elsewhere — together these processes continually reshape landscapes."},
  ];
  function renderHandbook(){
    $('#handbookHost').innerHTML = HANDBOOK_SECTIONS.map((s,i)=>`
      <div class="info-card glass">
        <h4>${String(i+1).padStart(2,'0')} · ${s.t}</h4>
        <p class="small">${s.body}</p>
      </div>`).join('');
  }

  /* ---------------- Rock & Mineral Gallery ---------------- */
  const GALLERY = [
    {n:'Granite', f:'Igneous', props:'Coarse-grained · Hard · Light-coloured', d:'Forms from slow-cooling magma deep underground, giving it large, visible mineral crystals.'},
    {n:'Basalt', f:'Igneous', props:'Fine-grained · Dark · Dense', d:'Forms from fast-cooling lava at the surface, so its crystals are too small to see.'},
    {n:'Sandstone', f:'Sedimentary', props:'Gritty texture · Layered · Porous', d:'Formed from compacted and cemented sand grains, often showing visible layering.'},
    {n:'Limestone', f:'Sedimentary', props:'Fizzes with acid · Soft · Light-coloured', d:'Often formed from compressed shell and coral fragments in shallow seas.'},
    {n:'Marble', f:'Metamorphic', props:'Crystalline · Smooth · Reacts with acid', d:'Forms when limestone is subjected to heat and pressure, recrystallising its calcite grains.'},
    {n:'Slate', f:'Metamorphic', props:'Splits into flat sheets · Fine-grained', d:'Forms when shale is compressed, aligning its clay minerals into flat layers.'},
    {n:'Quartz', f:'Mineral', props:'Hardness 7 · Glassy lustre · No cleavage', d:'One of the most common minerals on Earth, found in many rock types.'},
    {n:'Feldspar', f:'Mineral', props:'Hardness 6 · Two cleavage planes', d:'The most abundant mineral group in Earth\'s crust, key ingredient of granite.'},
    {n:'Mica', f:'Mineral', props:'Hardness 2–3 · Perfect cleavage · Sheets', d:'Splits into thin, flexible, shiny sheets — easy to identify by touch.'},
    {n:'Calcite', f:'Mineral', props:'Hardness 3 · Fizzes with acid', d:'The main mineral in limestone and marble; reacts visibly with dilute acid.'},
  ];
  function renderGallery(){
    $('#galleryHost').innerHTML = GALLERY.map(g=>`
      <div class="info-card glass">
        <h4>${g.n} <span class="chip" style="margin-left:6px;">${g.f}</span></h4>
        <p class="small" style="margin-bottom:6px; color:var(--text-2);">${g.props}</p>
        <p class="small">${g.d}</p>
      </div>`).join('');
  }

  /* ---------------- Glossary ---------------- */
  const GLOSSARY = [
    ['Asthenosphere','A weak, ductile layer of the upper mantle over which rigid lithospheric plates move.'],
    ['Convection','Circular movement of material caused by heat, driving plate motion in the mantle.'],
    ['Crystallisation','The process by which minerals form as atoms arrange into an ordered crystal structure.'],
    ['Deposition','The laying down of sediment carried by water, wind, ice or gravity.'],
    ['Epicentre','The point on Earth\'s surface directly above an earthquake\'s focus.'],
    ['Erosion','The transport of weathered rock and soil material by water, wind, ice or gravity.'],
    ['Fault','A fracture in rock along which noticeable movement has occurred.'],
    ['Focus (Hypocentre)','The point underground where an earthquake originates.'],
    ['Fossil','Preserved remains or traces of a once-living organism.'],
    ['Horizon (Soil)','A distinct layer within a soil profile, roughly parallel to the surface.'],
    ['Igneous Rock','Rock formed from the cooling and solidification of magma or lava.'],
    ['Lithosphere','The rigid outer layer of Earth comprising the crust and uppermost mantle, broken into plates.'],
    ['Magma','Molten rock beneath Earth\'s surface.'],
    ['Metamorphic Rock','Rock transformed from an existing rock by heat and/or pressure without melting.'],
    ['Mineral','A naturally occurring, inorganic solid with a defined chemical composition and crystal structure.'],
    ['Sediment','Solid fragments of rock, minerals or organic material deposited by natural processes.'],
    ['Sedimentary Rock','Rock formed from compacted and cemented sediment.'],
    ['Seismic Wave','A wave of energy released by an earthquake that travels through or along Earth.'],
    ['Subduction','The process where one tectonic plate is forced beneath another.'],
    ['Viscosity','A fluid\'s resistance to flow; controls how explosively magma erupts.'],
    ['Weathering','The in-place breakdown of rock through physical, chemical or biological processes.'],
  ];
  function renderGlossary(){
    const host = $('#glossaryHost');
    function draw(list){
      host.innerHTML = list.map(([t,d])=>`
        <div class="info-card glass">
          <h4>${t}</h4><p class="small">${d}</p>
        </div>`).join('') || '<p class="muted">No matches.</p>';
    }
    draw(GLOSSARY);
    $('#glossarySearch').addEventListener('input', e=>{
      const q = e.target.value.toLowerCase();
      draw(GLOSSARY.filter(([t,d])=> t.toLowerCase().includes(q) || d.toLowerCase().includes(q)));
    });
  }

  /* ---------------- Quiz Centre ---------------- */
  function renderQuizCentre(){
    $('#quizCentreHost').innerHTML = SIM_META.map(s=>{
      const rec = EarthLab.state.quizScores[s.id];
      return `<div class="sim-card glass" data-id="${s.id}">
        <div class="thumb ${s.g}"><span class="num">QUIZ</span><span class="emoji">${s.icon}</span></div>
        <div class="body">
          <h3>${s.title}</h3>
          <p>${rec ? `Best score: ${rec.score}/${rec.total}` : 'Not attempted yet'}</p>
        </div>
      </div>`;
    }).join('');
    $all('#quizCentreHost .sim-card').forEach(c=>{
      c.addEventListener('click', ()=>{ openSim(c.dataset.id); setTimeout(()=>{
        $all('.tab-btn').find?.(()=>{});
        const btn = document.querySelector('.tab-btn[data-tab="tab-quiz"]');
        btn && btn.click();
      }, 30); });
    });
  }

  /* ---------------- About Developer ---------------- */
  function renderAbout(){
    $('#aboutHost').innerHTML = `
      <div class="glass" style="padding:28px; border-radius:24px; display:grid; grid-template-columns:180px 1fr; gap:26px; align-items:center;">
        <img src="images/developer.jpg" alt="Dr. Mateen Yousuf" style="width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:20px; border:2px solid var(--amber);">
        <div>
          <h2 style="margin-bottom:2px;">Dr. Mateen Yousuf</h2>
          <p class="muted small" style="margin-bottom:14px;">Teacher · School Education Department, Kashmir</p>
          <p>Virtual Earth Science Laboratory was created to give students hands-on, inquiry-based access to Earth science phenomena that are normally impossible to observe directly — from the growth of a single mineral crystal to the movement of tectonic plates over millions of years.</p>
          <p>The app is built around experiential learning, evidence-based reasoning, environmental awareness and disaster-preparedness education, in line with the <strong>NEP 2020</strong> and <strong>NCF</strong> emphasis on competency-based, activity-driven learning — and works entirely offline so it can reach classrooms without reliable internet access.</p>
        </div>
      </div>
      <div class="info-grid" style="margin-top:20px;">
        <div class="info-card glass"><h4>🎯 Vision</h4><p class="small">Make Earth science tangible through experimentation rather than memorisation.</p></div>
        <div class="info-card glass"><h4>📚 Curriculum Alignment</h4><p class="small">Structured around NEP 2020 and NCF competencies for Classes VI–XII.</p></div>
        <div class="info-card glass"><h4>🌱 Scientific Temper</h4><p class="small">Encourages evidence-based reasoning, disaster preparedness and planetary stewardship.</p></div>
      </div>`;
  }

  return { init, openSim, refreshProgress, go };
})();

document.addEventListener('DOMContentLoaded', window.EarthLabApp.init);
