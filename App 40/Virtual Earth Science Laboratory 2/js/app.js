/* =====================================================================
   VIRTUAL EARTH SCIENCE LABORATORY — Core Application
   Handles: state, routing, dashboard, handbook, gallery, quiz centre,
   glossary, about, search, theme, gamification, PWA install/offline.
===================================================================== */

const EarthLab = (function () {

  /* ---------------- Simulation catalogue metadata ---------------- */
  const SIM_META = [
    { id:"rockcycle",  title:"Rock Cycle",         icon:"🌋", thumb:"rockcycle",  short:"Transform rock between igneous, sedimentary & metamorphic states." },
    { id:"soil",       title:"Soil",                icon:"🌱", thumb:"soil",       short:"Investigate soil composition, layers and drainage." },
    { id:"weathering", title:"Weathering",          icon:"🪨", thumb:"weathering", short:"Break down rock with physical & chemical weathering." },
    { id:"erosion",    title:"Erosion",             icon:"💧", thumb:"erosion",    short:"Move sediment with water, wind, ice and gravity." },
    { id:"fossil",     title:"Fossil",              icon:"🦴", thumb:"fossil",     short:"Bury, compress and preserve ancient organisms." },
    { id:"earthquake", title:"Earthquake",          icon:"📈", thumb:"earthquake", short:"Trigger fault rupture and observe seismic waves." },
    { id:"volcano",    title:"Volcano",             icon:"🌋", thumb:"volcano",    short:"Build magma pressure and control eruption style." },
    { id:"plates",     title:"Plate Tectonics",     icon:"🗺️", thumb:"plates",     short:"Move tectonic plates across convergent & divergent bounds." },
    { id:"minerals",   title:"Minerals",            icon:"💎", thumb:"minerals",   short:"Test streak, hardness & lustre to identify a mystery mineral." },
    { id:"timeline",   title:"Geological Timeline", icon:"⏳", thumb:"timeline",   short:"Travel through 4.6 billion years of Earth's deep time." }
  ];

  /* ---------------- Persistent state ---------------- */
  const STORE_KEY = "earthlab_state_v1";
  function loadState(){
    try{
      const raw = localStorage.getItem(STORE_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    return { xp:0, level:1, completed:{}, quizBest:{}, theme:"light", visited:{} };
  }
  let state = loadState();
  function saveState(){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){}
  }
  function xpForNextLevel(level){ return 100 + (level-1)*60; }
  function awardXP(amount, reason){
    state.xp += amount;
    let needed = xpForNextLevel(state.level);
    let leveled = false;
    while(state.xp >= needed){
      state.xp -= needed;
      state.level += 1;
      needed = xpForNextLevel(state.level);
      leveled = true;
    }
    saveState();
    renderProgressCard();
    toast((reason?reason+" — ":"")+"+"+amount+" XP"+(leveled?" 🎉 Level up!":""));
  }
  function markCompleted(simId){
    if(!state.completed[simId]){
      state.completed[simId] = true;
      saveState();
      awardXP(40, "Simulation completed");
    }
    renderProgressCard();
  }
  function recordQuizScore(simId, score, total){
    const pct = Math.round((score/total)*100);
    const prevBest = state.quizBest[simId] || 0;
    if(pct > prevBest){
      state.quizBest[simId] = pct;
      saveState();
    }
    awardXP(10*score, "Quiz answered");
    if(pct >= 60) markCompleted(simId);
  }

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function toast(msg){
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>el.classList.remove("show"), 2400);
  }

  /* ---------------- Simulation registry (filled by sim scripts) ---------------- */
  const simRegistry = {};
  function registerSim(def){ simRegistry[def.id] = def; }

  /* ---------------- Router ---------------- */
  let currentCleanup = null;
  function go(route){
    if(typeof currentCleanup === "function"){ try{currentCleanup();}catch(e){} currentCleanup=null; }
    window.location.hash = route;
    renderRoute(route);
    document.getElementById("sidebar").classList.remove("open");
    window.scrollTo({top:0,behavior:"instant"in window?"instant":"auto"});
  }
  function renderRoute(route){
    const view = document.getElementById("view");
    view.innerHTML = "";
    highlightNav(route);
    const [kind, id] = route.split(":");
    if(kind === "sim" && simRegistry[id]){
      renderSimulationPage(id);
    } else {
      switch(kind){
        case "handbook": renderHandbook(); break;
        case "gallery": renderGallery(); break;
        case "quizcentre": renderQuizCentre(); break;
        case "glossary": renderGlossary(); break;
        case "about": renderAbout(); break;
        default: renderDashboard();
      }
    }
  }
  function highlightNav(route){
    const key = route.split(":")[0] === "sim" ? "sim:"+route.split(":")[1] : route;
    document.querySelectorAll(".nav-item, .bottom-nav button").forEach(btn=>{
      const r = btn.dataset.route;
      const match = r === key || (r === "dashboard" && key === "dashboard");
      btn.classList.toggle("active", r === key);
    });
  }

  /* ---------------- Sidebar sim list ---------------- */
  function buildSidebarSimList(){
    const host = document.getElementById("sidebarSimList");
    host.innerHTML = SIM_META.map(s=>`
      <button class="nav-item" data-route="sim:${s.id}">
        <span class="ic">${s.icon}</span>${s.title}
        ${state.completed[s.id] ? '<span style="margin-left:auto;font-size:.7rem;">✅</span>' : ''}
      </button>`).join("");
  }

  function renderProgressCard(){
    document.getElementById("pcLevel").textContent = "Lv."+state.level;
    document.getElementById("pcXP").textContent = state.xp+" XP";
    const needed = xpForNextLevel(state.level);
    document.getElementById("pcBar").style.width = Math.min(100,(state.xp/needed)*100)+"%";
    const completedCount = Object.keys(state.completed).length;
    document.getElementById("pcModules").textContent = completedCount+"/10 modules complete";
    buildSidebarSimList();
  }

  /* ==================================================================
     DASHBOARD
  ================================================================== */
  function renderDashboard(){
    const completedCount = Object.keys(state.completed).length;
    const recentIds = Object.keys(state.visited).sort((a,b)=>state.visited[b]-state.visited[a]).slice(0,4);
    const continueList = recentIds.length ? recentIds : SIM_META.slice(0,4).map(s=>s.id);

    const view = document.getElementById("view");
    view.innerHTML = `
      <section class="hero">
        <span class="eyebrow" style="background:rgba(255,255,255,.18);color:#fff;">Virtual Earth Science Laboratory</span>
        <h1>Investigate Earth's rocks, hazards &amp; deep time — one variable at a time.</h1>
        <p>Ten fully interactive laboratories let you adjust real scientific variables and watch cause and effect unfold, exactly as a field geologist would investigate it.</p>
        <div class="hero-cta">
          <button class="btn btn-primary" id="heroStart">▶ Start a Simulation</button>
          <button class="btn btn-outline" data-route="handbook">📘 Open Handbook</button>
        </div>
      </section>

      <div class="stat-grid">
        <div class="stat-card"><div class="num">10</div><div class="lbl">Interactive Simulations</div></div>
        <div class="stat-card"><div class="num">100%</div><div class="lbl">Works Offline</div></div>
        <div class="stat-card"><div class="num">VI–XII</div><div class="lbl">Curriculum Aligned</div></div>
        <div class="stat-card"><div class="num">NEP 2020</div><div class="lbl">&amp; NCF Ready</div></div>
      </div>

      <div class="section-head"><h2>Continue Exploring</h2></div>
      <div class="card-grid" id="continueGrid"></div>

      <div class="section-head"><h2>All Simulations</h2><span style="font-size:.8rem;opacity:.65;">${completedCount}/10 complete</span></div>
      <div class="card-grid" id="allGrid"></div>
    `;
    document.getElementById("heroStart").onclick = ()=> go("sim:"+SIM_META[0].id);
    view.querySelectorAll("[data-route]").forEach(b=> b.addEventListener("click",()=>go(b.dataset.route)));

    document.getElementById("continueGrid").innerHTML = continueList.map(id=>simCardHTML(id)).join("");
    document.getElementById("allGrid").innerHTML = SIM_META.map(s=>simCardHTML(s.id)).join("");
    view.querySelectorAll(".sim-card, .sim-card button.launch").forEach(el=>{
      el.addEventListener("click",(e)=>{
        const card = e.currentTarget.closest(".sim-card");
        go("sim:"+card.dataset.id);
      });
    });
  }
  function simCardHTML(id){
    const s = SIM_META.find(x=>x.id===id);
    const done = !!state.completed[id];
    return `
      <div class="sim-card" data-id="${s.id}" style="cursor:pointer;">
        <div class="thumb ${s.thumb}">${s.icon}</div>
        <div class="body">
          <h3>${s.title}</h3>
          <p>${s.short}</p>
          <div class="meta">
            <span class="badge ${done?'done':'todo'}">${done?'✔ Completed':'Not started'}</span>
            ${state.quizBest[id] ? `<span style="opacity:.6;">Best ${state.quizBest[id]}%</span>` : ""}
          </div>
        </div>
        <button class="launch">Launch Lab →</button>
      </div>`;
  }

  /* ==================================================================
     SIMULATION PAGE SHELL
  ================================================================== */
  function renderSimulationPage(id){
    const meta = SIM_META.find(s=>s.id===id);
    const def = simRegistry[id];
    state.visited[id] = Date.now();
    saveState();

    const view = document.getElementById("view");
    view.innerHTML = `
      <button class="btn btn-ghost btn-sm" id="backBtn">← Back to Dashboard</button>
      <div class="sim-header" style="margin-top:12px;">
        <div class="info">
          <span class="eyebrow">${meta.icon} ${meta.title} Laboratory</span>
          <h2>${def.title || meta.title}</h2>
          <div style="font-size:.85rem;opacity:.7;">${def.intro || meta.short}</div>
        </div>
        <div>
          ${state.completed[id] ? '<span class="badge done">✔ Completed</span>' : '<span class="badge todo">In progress</span>'}
        </div>
      </div>
      <div class="objective-box"><b>🎯 Learning objective:</b> ${def.objective}</div>

      <div class="sim-grid">
        <div class="panel">
          <h3>🔬 Experiment Area</h3>
          <div class="canvas-wrap"><canvas id="simCanvas" width="640" height="380"></canvas></div>
          <div class="sim-actions">
            <button class="btn btn-primary btn-sm" id="simResetBtn">↺ Reset</button>
            <button class="btn btn-ghost btn-sm" id="simRandomBtn">🎲 Randomize</button>
          </div>
          <div class="obs-box" id="simObs"><b>Observe:</b> Adjust the controls to begin your investigation.</div>
          <div class="explain-box" id="simExplain">${def.explainDefault || "Change a variable on the right to see the scientific explanation update here."}</div>
        </div>

        <div class="panel">
          <h3>🎛️ Controls &amp; Variables</h3>
          <div class="controls" id="simControls"></div>
          <div class="findings" style="margin-top:14px;">
            <h3 style="font-size:.85rem;">🔎 Key Findings</h3>
            <ul>${(def.findings||[]).map(f=>`<li>${f}</li>`).join("")}</ul>
          </div>
          <div class="glossary-links">${(def.glossaryTerms||[]).map(t=>`<a href="#" data-term="${t}">${t}</a>`).join("")}</div>
        </div>
      </div>

      <div class="panel quiz-box" id="quizHost"></div>
    `;

    document.getElementById("backBtn").onclick = ()=> go("dashboard");
    view.querySelectorAll(".glossary-links a").forEach(a=>{
      a.addEventListener("click",(e)=>{ e.preventDefault(); go("glossary"); setTimeout(()=>openGlossaryTerm(a.dataset.term),80); });
    });

    const canvas = document.getElementById("simCanvas");
    const ctx2d = canvas.getContext("2d");
    const controlsEl = document.getElementById("simControls");
    const obsEl = document.getElementById("simObs");
    const explainEl = document.getElementById("simExplain");

    function setObs(html){ obsEl.innerHTML = "<b>Observe:</b> "+html; }
    function setExplain(html){ explainEl.innerHTML = html; }

    const host = {
      canvas, ctx: ctx2d, controls: controlsEl,
      setObs, setExplain,
      complete: ()=> markCompleted(id),
      toast
    };

    let cleanupFn = null;
    if(typeof def.mount === "function"){
      cleanupFn = def.mount(host) || null;
    }
    currentCleanup = cleanupFn;

    document.getElementById("simResetBtn").onclick = ()=>{
      if(typeof def.reset === "function") def.reset(host);
    };
    document.getElementById("simRandomBtn").onclick = ()=>{
      if(typeof def.randomize === "function") def.randomize(host);
    };

    renderQuiz(id, def.quiz||[], document.getElementById("quizHost"));
  }

  /* ==================================================================
     QUIZ ENGINE (used inside sim page + quiz centre)
  ================================================================== */
  function renderQuiz(simId, questions, hostEl, opts){
    opts = opts || {};
    if(!questions.length){ hostEl.innerHTML = ""; return; }
    let idx = 0, score = 0, answered = false;
    const meta = SIM_META.find(s=>s.id===simId);

    function draw(){
      const q = questions[idx];
      hostEl.innerHTML = `
        <h3>📝 ${meta?meta.title:""} Knowledge Check</h3>
        <div class="quiz-progress">Question ${idx+1} of ${questions.length} &nbsp;·&nbsp; Score: ${score}</div>
        <div class="quiz-q">${q.q}</div>
        <div class="quiz-options">${q.options.map((op,i)=>`<button class="quiz-opt" data-i="${i}">${op}</button>`).join("")}</div>
        <div class="quiz-feedback" id="qFeedback"></div>
        <div class="sim-actions" id="qActions"></div>
      `;
      answered = false;
      hostEl.querySelectorAll(".quiz-opt").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          if(answered) return;
          answered = true;
          const i = parseInt(btn.dataset.i,10);
          const correct = i === q.answer;
          if(correct) score++;
          hostEl.querySelectorAll(".quiz-opt").forEach((b2,i2)=>{
            if(i2===q.answer) b2.classList.add("correct");
            else if(i2===i) b2.classList.add("wrong");
          });
          document.getElementById("qFeedback").innerHTML = (correct?"✅ Correct! ":"❌ Not quite. ")+ (q.explain||"");
          const actions = document.getElementById("qActions");
          if(idx < questions.length-1){
            actions.innerHTML = `<button class="btn btn-primary btn-sm" id="qNext">Next Question →</button>`;
            document.getElementById("qNext").onclick = ()=>{ idx++; draw(); };
          } else {
            actions.innerHTML = `<button class="btn btn-primary btn-sm" id="qFinish">Finish Quiz</button>`;
            document.getElementById("qFinish").onclick = ()=> finish();
          }
        });
      });
    }
    function finish(){
      recordQuizScore(simId, score, questions.length);
      const pct = Math.round((score/questions.length)*100);
      hostEl.innerHTML = `
        <h3>📝 Quiz Complete</h3>
        <p>You scored <span class="score-pill">${score}/${questions.length} (${pct}%)</span></p>
        <p style="font-size:.85rem;opacity:.75;">Best score for this lab: ${state.quizBest[simId]||pct}%</p>
        <div class="sim-actions">
          <button class="btn btn-ghost btn-sm" id="qRetry">↺ Retry Quiz</button>
          ${opts.onFinishExtra || ""}
        </div>
      `;
      document.getElementById("qRetry").onclick = ()=>{ idx=0; score=0; draw(); };
      if(opts.afterFinish) opts.afterFinish(pct);
    }
    draw();
  }

  /* ==================================================================
     HANDBOOK
  ================================================================== */
  const HANDBOOK = [
    { id:"rocks", title:"Rocks", body:"Rocks are naturally occurring solid aggregates of one or more minerals. Earth scientists group them into three families based on how they form: igneous (from cooled magma or lava), sedimentary (from compacted and cemented sediment), and metamorphic (from existing rock altered by heat and pressure)." , sim:"rockcycle"},
    { id:"soil", title:"Soil", body:"Soil is a dynamic mixture of weathered mineral particles, organic matter, water and air that forms the loose surface layer of the Earth. Its texture, structure and drainage depend on the proportion of sand, silt and clay it contains.", sim:"soil" },
    { id:"weathering", title:"Weathering", body:"Weathering is the in-place breakdown of rock at or near Earth's surface. Physical weathering fractures rock without changing its chemistry (frost wedging, thermal expansion), while chemical weathering alters mineral composition (oxidation, hydrolysis, dissolution).", sim:"weathering" },
    { id:"erosion", title:"Erosion", body:"Erosion is the transport of weathered sediment by an agent such as running water, wind, ice or gravity, followed by deposition when the agent loses energy. Weathering breaks rock down; erosion carries it away.", sim:"erosion" },
    { id:"fossils", title:"Fossils", body:"A fossil is preserved evidence of ancient life. Rapid burial in fine sediment, low oxygen, and mineral-rich groundwater all increase the chance that hard parts (or occasionally soft tissue) survive across geological time.", sim:"fossil" },
    { id:"earthquakes", title:"Earthquakes", body:"Earthquakes occur when stress built up along a fault is suddenly released, radiating seismic energy as waves. Magnitude describes the energy released; intensity describes the felt shaking, which weakens with distance and depth.", sim:"earthquake" },
    { id:"volcanoes", title:"Volcanoes", body:"Volcanoes form where magma reaches the surface. Gas content and magma viscosity determine eruption style — low-viscosity, low-gas magma erupts effusively as lava flows, while high-viscosity, gas-rich magma erupts explosively.", sim:"volcano" },
    { id:"plates", title:"Plate Tectonics", body:"Earth's lithosphere is broken into rigid plates that move over the underlying mantle. At divergent boundaries plates pull apart, at convergent boundaries they collide or subduct, and at transform boundaries they slide past one another.", sim:"plates" },
    { id:"minerals", title:"Minerals", body:"A mineral is a naturally occurring, inorganic solid with a definite chemical composition and crystal structure. Minerals are identified using diagnostic physical properties: colour, streak, lustre, hardness, cleavage and fracture.", sim:"minerals" },
    { id:"time", title:"Geological Time", body:"Geological (deep) time spans roughly 4.6 billion years, organised into eons, eras, periods and epochs. Relative dating (superposition, fossil succession) and radiometric dating together let scientists place events on this enormous timescale.", sim:"timeline" },
  ];
  function renderHandbook(){
    const view = document.getElementById("view");
    view.innerHTML = `
      <span class="eyebrow">Reference</span>
      <h2>📘 Earth Science Handbook</h2>
      <p style="opacity:.75;max-width:640px;">A quick-reference guide to the core concepts behind every simulation.</p>
      <div id="handbookList"></div>
    `;
    const list = document.getElementById("handbookList");
    list.innerHTML = HANDBOOK.map((h,i)=>`
      <div class="accordion-item" id="hb-${h.id}">
        <button class="accordion-head">${h.title} <span class="chev">▾</span></button>
        <div class="accordion-body">
          <p>${h.body}</p>
          <button class="btn btn-ghost btn-sm" data-go="sim:${h.sim}">Open ${SIM_META.find(s=>s.id===h.sim).title} Lab →</button>
        </div>
      </div>`).join("");
    list.querySelectorAll(".accordion-head").forEach(btn=>{
      btn.addEventListener("click",()=> btn.parentElement.classList.toggle("open"));
    });
    list.querySelectorAll("[data-go]").forEach(btn=>{
      btn.addEventListener("click",(e)=>{ e.stopPropagation(); go(btn.dataset.go); });
    });
  }

  /* ==================================================================
     ROCK & MINERAL GALLERY
  ================================================================== */
  const GALLERY = [
    { name:"Granite", type:"Igneous (Intrusive)", color:"#B0A99F", icon:"🪨", props:{Texture:"Coarse-grained", Colour:"Light grey/pink", Hardness:"6–7", Formation:"Slow cooling of magma underground"}, sim:"rockcycle" },
    { name:"Basalt", type:"Igneous (Extrusive)", color:"#4B4B4B", icon:"⚫", props:{Texture:"Fine-grained", Colour:"Dark grey/black", Hardness:"6", Formation:"Rapid cooling of lava at surface"}, sim:"volcano" },
    { name:"Sandstone", type:"Sedimentary (Clastic)", color:"#D8B97C", icon:"🟫", props:{Texture:"Gritty, layered", Colour:"Tan/red/yellow", Hardness:"6–7 (grains)", Formation:"Compacted & cemented sand grains"}, sim:"erosion" },
    { name:"Limestone", type:"Sedimentary (Chemical/Biological)", color:"#E7E1D3", icon:"🐚", props:{Texture:"Fine to fossiliferous", Colour:"Pale grey/white", Hardness:"3", Formation:"Accumulated shells & calcite mud"}, sim:"fossil" },
    { name:"Marble", type:"Metamorphic", color:"#EDEDED", icon:"⬜", props:{Texture:"Crystalline, sugary", Colour:"White/banded", Hardness:"3–4", Formation:"Limestone altered by heat & pressure"}, sim:"rockcycle" },
    { name:"Slate", type:"Metamorphic", color:"#4A5A66", icon:"🪧", props:{Texture:"Fine, foliated", Colour:"Dark grey", Hardness:"2–4", Formation:"Shale altered by low-grade metamorphism"}, sim:"rockcycle" },
    { name:"Quartz", type:"Mineral (Silicate)", color:"#DDEFF5", icon:"🔷", props:{Streak:"White", Lustre:"Glassy", Hardness:"7", Cleavage:"None (conchoidal fracture)"}, sim:"minerals" },
    { name:"Calcite", type:"Mineral (Carbonate)", color:"#F2F2E8", icon:"🔺", props:{Streak:"White", Lustre:"Glassy", Hardness:"3", Cleavage:"Perfect rhombohedral"}, sim:"minerals" },
    { name:"Feldspar", type:"Mineral (Silicate)", color:"#E7C9C0", icon:"◈", props:{Streak:"White", Lustre:"Pearly/glassy", Hardness:"6", Cleavage:"Two directions at ~90°"}, sim:"minerals" },
    { name:"Mica (Biotite)", type:"Mineral (Silicate)", color:"#2E2A26", icon:"⬛", props:{Streak:"White/grey", Lustre:"Vitreous/pearly", Hardness:"2.5–3", Cleavage:"Perfect, one direction (sheets)"}, sim:"minerals" },
    { name:"Pyrite", type:"Mineral (Sulfide)", color:"#D9B84A", icon:"✨", props:{Streak:"Greenish black", Lustre:"Metallic", Hardness:"6–6.5", Cleavage:"None (fools' gold)"}, sim:"minerals" },
    { name:"Obsidian", type:"Igneous (Volcanic Glass)", color:"#1B1B1B", icon:"🖤", props:{Texture:"Glassy, no crystals", Colour:"Black", Hardness:"5–6", Formation:"Lava cooled too fast to crystallise"}, sim:"volcano" },
  ];
  function renderGallery(){
    const view = document.getElementById("view");
    view.innerHTML = `
      <span class="eyebrow">Reference</span>
      <h2>💎 Rock &amp; Mineral Gallery</h2>
      <p style="opacity:.75;max-width:640px;">Common rocks and minerals with the properties used to identify them.</p>
      <input type="text" id="galSearch" placeholder="Filter by name or type…" style="width:100%;max-width:360px;padding:9px 14px;border-radius:20px;border:1px solid rgba(13,71,161,.2);background:var(--white);margin-bottom:16px;">
      <div class="gallery-grid" id="galGrid"></div>
    `;
    function draw(filter){
      const f = (filter||"").toLowerCase();
      const items = GALLERY.filter(g=> !f || g.name.toLowerCase().includes(f) || g.type.toLowerCase().includes(f));
      document.getElementById("galGrid").innerHTML = items.map(g=>`
        <div class="gallery-card">
          <div class="swatch" style="background:${g.color};">${g.icon}</div>
          <div class="body">
            <div class="tag">${g.type}</div>
            <h3>${g.name}</h3>
            <ul class="prop-list">${Object.entries(g.props).map(([k,v])=>`<li><span>${k}</span><span>${v}</span></li>`).join("")}</ul>
            <button class="btn btn-ghost btn-sm" style="margin-top:10px;" data-go="sim:${g.sim}">Related Lab →</button>
          </div>
        </div>`).join("") || `<p style="opacity:.6;">No matches found.</p>`;
      document.querySelectorAll("[data-go]").forEach(btn=> btn.addEventListener("click",()=>go(btn.dataset.go)));
    }
    draw("");
    document.getElementById("galSearch").addEventListener("input",(e)=>draw(e.target.value));
  }

  /* ==================================================================
     QUIZ CENTRE
  ================================================================== */
  function renderQuizCentre(){
    const view = document.getElementById("view");
    view.innerHTML = `
      <span class="eyebrow">Assess</span>
      <h2>📝 Quiz Centre</h2>
      <p style="opacity:.75;max-width:640px;">Jump into any module's quiz, track your best score, and retry as often as you like.</p>
      <div class="qc-grid" id="qcGrid"></div>
    `;
    document.getElementById("qcGrid").innerHTML = SIM_META.map(s=>`
      <div class="qc-card">
        <div class="thumb ${s.thumb}" style="width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:8px;">${s.icon}</div>
        <h3>${s.title}</h3>
        <div class="best">Best score: ${state.quizBest[s.id] ? state.quizBest[s.id]+"%" : "Not attempted"}</div>
        <button class="btn btn-primary btn-sm" data-go="sim:${s.id}">Start Quiz →</button>
      </div>`).join("");
    document.querySelectorAll("[data-go]").forEach(btn=> btn.addEventListener("click",()=>go(btn.dataset.go)));
  }

  /* ==================================================================
     GLOSSARY
  ================================================================== */
  const GLOSSARY = [
    { term:"Igneous rock", def:"Rock formed from the cooling and crystallisation of magma or lava.", rel:"Rock Cycle", sim:"rockcycle" },
    { term:"Sedimentary rock", def:"Rock formed from compacted and cemented sediment layers.", rel:"Rock Cycle", sim:"rockcycle" },
    { term:"Metamorphic rock", def:"Rock changed from an existing rock by heat and/or pressure without melting.", rel:"Rock Cycle", sim:"rockcycle" },
    { term:"Magma", def:"Molten rock beneath Earth's surface.", rel:"Volcano", sim:"volcano" },
    { term:"Lava", def:"Molten rock that has reached Earth's surface.", rel:"Volcano", sim:"volcano" },
    { term:"Weathering", def:"The in-place breakdown of rock at or near Earth's surface.", rel:"Weathering", sim:"weathering" },
    { term:"Erosion", def:"The transport of weathered sediment by water, wind, ice or gravity.", rel:"Erosion", sim:"erosion" },
    { term:"Deposition", def:"The laying down of sediment once the transporting agent loses energy.", rel:"Erosion", sim:"erosion" },
    { term:"Sediment", def:"Loose particles of rock or organic material deposited by wind, water or ice.", rel:"Erosion", sim:"erosion" },
    { term:"Soil horizon", def:"A distinct layer within a soil profile, differing in composition and texture.", rel:"Soil", sim:"soil" },
    { term:"Fossil", def:"Preserved remains or traces of an ancient organism.", rel:"Fossil", sim:"fossil" },
    { term:"Permineralisation", def:"A fossilisation process where minerals fill the pores of buried organic tissue.", rel:"Fossil", sim:"fossil" },
    { term:"Fault", def:"A fracture in rock along which movement has occurred.", rel:"Earthquake", sim:"earthquake" },
    { term:"Seismic wave", def:"Energy that radiates from an earthquake's focus through the Earth.", rel:"Earthquake", sim:"earthquake" },
    { term:"Magnitude", def:"A measure of the energy released by an earthquake.", rel:"Earthquake", sim:"earthquake" },
    { term:"Epicentre", def:"The point on Earth's surface directly above an earthquake's focus.", rel:"Earthquake", sim:"earthquake" },
    { term:"Tectonic plate", def:"A large rigid slab of lithosphere that moves over the mantle.", rel:"Plate Tectonics", sim:"plates" },
    { term:"Subduction", def:"The process where one tectonic plate sinks beneath another at a convergent boundary.", rel:"Plate Tectonics", sim:"plates" },
    { term:"Divergent boundary", def:"A plate boundary where two plates move apart, often forming new crust.", rel:"Plate Tectonics", sim:"plates" },
    { term:"Convergent boundary", def:"A plate boundary where two plates move toward each other.", rel:"Plate Tectonics", sim:"plates" },
    { term:"Transform boundary", def:"A plate boundary where two plates slide horizontally past one another.", rel:"Plate Tectonics", sim:"plates" },
    { term:"Mineral", def:"A naturally occurring, inorganic solid with a definite chemical composition and crystal structure.", rel:"Minerals", sim:"minerals" },
    { term:"Streak", def:"The colour of a mineral's powder, seen when scratched on an unglazed porcelain plate.", rel:"Minerals", sim:"minerals" },
    { term:"Lustre", def:"The way a mineral's surface reflects light (e.g. metallic, glassy, dull).", rel:"Minerals", sim:"minerals" },
    { term:"Hardness", def:"A mineral's resistance to scratching, measured on the Mohs scale.", rel:"Minerals", sim:"minerals" },
    { term:"Cleavage", def:"The tendency of a mineral to break along flat planes of weakness.", rel:"Minerals", sim:"minerals" },
    { term:"Deep time", def:"The vast, roughly 4.6-billion-year span of Earth's geological history.", rel:"Geological Timeline", sim:"timeline" },
    { term:"Radiometric dating", def:"A method of finding the age of rock using the decay of radioactive isotopes.", rel:"Geological Timeline", sim:"timeline" },
    { term:"Superposition", def:"The principle that in undisturbed rock layers, the oldest layer is at the bottom.", rel:"Geological Timeline", sim:"timeline" },
  ];
  function renderGlossary(){
    const view = document.getElementById("view");
    view.innerHTML = `
      <span class="eyebrow">Reference</span>
      <h2>🔤 Glossary</h2>
      <input type="text" id="glosSearch" placeholder="Search terms…" style="width:100%;max-width:360px;padding:9px 14px;border-radius:20px;border:1px solid rgba(13,71,161,.2);background:var(--white);margin-bottom:16px;">
      <div class="glossary-list" id="glosList"></div>
    `;
    function draw(filter){
      const f = (filter||"").toLowerCase();
      const items = GLOSSARY.filter(g=> !f || g.term.toLowerCase().includes(f) || g.def.toLowerCase().includes(f));
      document.getElementById("glosList").innerHTML = items.map(g=>`
        <div class="gloss-item" id="gloss-${slug(g.term)}">
          <div class="term">${g.term}</div>
          <div>${g.def}</div>
          <div class="rel">Related: <a href="#" data-go="sim:${g.sim}">${g.rel} Lab →</a></div>
        </div>`).join("") || `<p style="opacity:.6;">No matches found.</p>`;
      document.querySelectorAll("[data-go]").forEach(a=> a.addEventListener("click",(e)=>{e.preventDefault();go(a.dataset.go);}));
    }
    draw("");
    document.getElementById("glosSearch").addEventListener("input",(e)=>draw(e.target.value));
  }
  function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"-"); }
  function openGlossaryTerm(term){
    const el = document.getElementById("gloss-"+slug(term));
    if(el){ el.scrollIntoView({behavior:"smooth",block:"center"}); el.style.boxShadow="0 0 0 3px var(--amber)"; setTimeout(()=>el.style.boxShadow="",1600); }
  }

  /* ==================================================================
     ABOUT DEVELOPER
  ================================================================== */
  function renderAbout(){
    const view = document.getElementById("view");
    view.innerHTML = `
      <span class="eyebrow">Credits</span>
      <h2>👤 About the Developer</h2>
      <div class="about-card">
        <img src="assets/developer.jpg" alt="Portrait of Dr. Mateen Yousuf">
        <div class="txt">
          <h2>Dr. Mateen Yousuf</h2>
          <div class="role">Teacher · School Education Department, Kashmir</div>
          <p style="max-width:520px;">Virtual Earth Science Laboratory was designed and developed to bring hands-on, inquiry-based Earth Science investigation to every classroom — fully offline, curriculum-aligned to Classes VI–XII, and built around the principles of NEP 2020 and the National Curriculum Framework.</p>
          <p style="max-width:520px;opacity:.75;font-size:.85rem;">Ten interactive laboratories invite learners to adjust real scientific variables and observe cause and effect for themselves, the same way a field geologist investigates the natural world.</p>
        </div>
      </div>
    `;
  }

  /* ==================================================================
     SEARCH
  ================================================================== */
  function initSearch(){
    const input = document.getElementById("searchInput");
    const results = document.getElementById("searchResults");
    function draw(q){
      q = q.trim().toLowerCase();
      if(!q){ results.classList.add("hidden"); results.innerHTML=""; return; }
      const matches = SIM_META.filter(s=> s.title.toLowerCase().includes(q) || s.short.toLowerCase().includes(q));
      const glosMatches = GLOSSARY.filter(g=> g.term.toLowerCase().includes(q)).slice(0,4);
      if(!matches.length && !glosMatches.length){
        results.innerHTML = `<div class="sr-item" style="opacity:.6;">No results for "${q}"</div>`;
      } else {
        results.innerHTML =
          matches.map(m=>`<div class="sr-item" data-go="sim:${m.id}"><span>${m.icon} ${m.title}</span><span style="opacity:.5;">Simulation</span></div>`).join("") +
          glosMatches.map(g=>`<div class="sr-item" data-go="glossary" data-term="${g.term}"><span>${g.term}</span><span style="opacity:.5;">Glossary</span></div>`).join("");
      }
      results.classList.remove("hidden");
      results.querySelectorAll("[data-go]").forEach(el=>{
        el.addEventListener("click",()=>{
          go(el.dataset.go);
          if(el.dataset.term) setTimeout(()=>openGlossaryTerm(el.dataset.term),80);
          input.value=""; results.classList.add("hidden");
        });
      });
    }
    input.addEventListener("input", ()=>draw(input.value));
    input.addEventListener("focus", ()=>draw(input.value));
    document.addEventListener("click",(e)=>{ if(!e.target.closest(".search-wrap")) results.classList.add("hidden"); });
  }

  /* ==================================================================
     THEME + NAV WIRES + INIT
  ================================================================== */
  function initTheme(){
    if(state.theme === "dark") document.documentElement.setAttribute("data-theme","dark");
    document.getElementById("themeToggle").addEventListener("click", ()=>{
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if(isDark){ document.documentElement.removeAttribute("data-theme"); state.theme="light"; }
      else { document.documentElement.setAttribute("data-theme","dark"); state.theme="dark"; }
      saveState();
    });
  }
  function initNav(){
    document.querySelectorAll(".nav-item, .bottom-nav button").forEach(btn=>{
      btn.addEventListener("click", ()=> go(btn.dataset.route));
    });
    document.getElementById("hamburgerBtn").addEventListener("click", ()=>{
      document.getElementById("sidebar").classList.toggle("open");
    });
  }
  function initServiceWorker(){
    if("serviceWorker" in navigator){
      window.addEventListener("load", ()=>{
        navigator.serviceWorker.register("sw.js").catch(()=>{});
      });
    }
  }

  function init(){
    buildSidebarSimList();
    renderProgressCard();
    initTheme();
    initNav();
    initSearch();
    initServiceWorker();
    setTimeout(()=>{ const sp=document.getElementById("splash"); if(sp) sp.remove(); }, 3300);
    const startRoute = (window.location.hash||"").replace("#","") || "dashboard";
    renderRoute(startRoute);
  }

  document.addEventListener("DOMContentLoaded", init);

  /* ==================================================================
     UI HELPERS — used by simulation modules to build controls
  ================================================================== */
  const ui = {
    slider(container, opts){
      // opts: {id,label,min,max,step,value,unit,onInput}
      const wrap = document.createElement("div");
      wrap.className = "control-row";
      wrap.innerHTML = `
        <label for="${opts.id}">${opts.label} <span class="val" id="${opts.id}_val">${opts.value}${opts.unit||""}</span></label>
        <input type="range" id="${opts.id}" min="${opts.min}" max="${opts.max}" step="${opts.step||1}" value="${opts.value}">
      `;
      container.appendChild(wrap);
      const input = wrap.querySelector("input");
      const valEl = wrap.querySelector(".val");
      input.addEventListener("input", ()=>{
        valEl.textContent = input.value + (opts.unit||"");
        if(opts.onInput) opts.onInput(parseFloat(input.value));
      });
      return input;
    },
    chips(container, opts){
      // opts: {id,label,options:[{value,label}],value,onChange}
      const wrap = document.createElement("div");
      wrap.className = "control-row";
      wrap.innerHTML = `<label>${opts.label}</label><div class="chip-row" id="${opts.id}"></div>`;
      container.appendChild(wrap);
      const row = wrap.querySelector(".chip-row");
      function draw(active){
        row.innerHTML = opts.options.map(o=>`<button type="button" class="chip ${o.value===active?'active':''}" data-v="${o.value}">${o.label}</button>`).join("");
        row.querySelectorAll(".chip").forEach(btn=>{
          btn.addEventListener("click", ()=>{
            draw(btn.dataset.v);
            if(opts.onChange) opts.onChange(btn.dataset.v);
          });
        });
      }
      draw(opts.value);
      return row;
    },
    select(container, opts){
      const wrap = document.createElement("div");
      wrap.className = "control-row";
      wrap.innerHTML = `<label>${opts.label}</label>
        <select id="${opts.id}">${opts.options.map(o=>`<option value="${o.value}" ${o.value===opts.value?"selected":""}>${o.label}</option>`).join("")}</select>`;
      container.appendChild(wrap);
      const sel = wrap.querySelector("select");
      sel.addEventListener("change", ()=>{ if(opts.onChange) opts.onChange(sel.value); });
      return sel;
    },
    button(container, opts){
      const btn = document.createElement("button");
      btn.className = "btn btn-ghost btn-sm";
      btn.style.alignSelf = "flex-start";
      btn.textContent = opts.label;
      btn.addEventListener("click", opts.onClick);
      container.appendChild(btn);
      return btn;
    }
  };

  return { registerSim, go, awardXP, markCompleted, toast, state, ui };
})();
