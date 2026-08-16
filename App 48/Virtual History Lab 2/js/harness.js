/* ==========================================================================
   Virtual Simulations — harness.js
   App shell: routing, navigation, sim registry, and shared screens.
   Each simulation module (js/sims/*.js) calls VSL.registerSim(def) to plug
   itself into this harness. def = { id, title, tagline, icon, color, tags,
   category, instructions:[...], render(container, go) }
   ========================================================================== */
(function () {
  "use strict";
  const { storage, toast } = VSL;
  VSL.SIMS = [];
  VSL.registerSim = function (def) { VSL.SIMS.push(def); };

  const appEl = document.getElementById("app");
  let currentTab = "home";
  let activeSimId = null;
  let activeSimInstance = null; // holds {destroy?} if a sim needs cleanup

  const CATEGORY_META = {
    all: { label: "All", icon: "🗂️" },
  };

  function findSim(id) { return VSL.SIMS.find(s => s.id === id); }

  /* ---------------- Rendering root ---------------- */
  function render(html) {
    appEl.innerHTML = html;
  }

  function bottomNavHTML() {
    const tabs = [
      { id: "home", icon: "🏠", label: "Home" },
      { id: "sims", icon: "🧪", label: "Simulations" },
      { id: "favorites", icon: "⭐", label: "Favorites" },
      { id: "history", icon: "🕘", label: "History" },
      { id: "about", icon: "👤", label: "About" },
    ];
    return `<nav class="bottom-nav">
      ${tabs.map(t => `<button data-tab="${t.id}" class="${currentTab === t.id ? "active" : ""}">
        <span class="nav-icon">${t.icon}</span><span>${t.label}</span>
      </button>`).join("")}
    </nav>`;
  }

  function bindBottomNav() {
    appEl.querySelectorAll(".bottom-nav [data-tab]").forEach(btn => {
      btn.addEventListener("click", () => goTab(btn.dataset.tab));
    });
  }

  /* ---------------- Screens ---------------- */
  function screenSplash() {
    render(`
      <div class="splash">
        <svg class="flask-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="42" y="10" width="16" height="30" fill="#fff"/>
          <polygon points="34,40 66,40 82,86 18,86" fill="#fff"/>
          <polygon points="39,62 61,62 71,86 29,86" fill="#FFB300"/>
        </svg>
        <h1>Virtual<br><span class="accent">Simulations</span></h1>
        <div class="credit">
          Created by<br><span class="name">Dr. Mateen Yousuf</span><br>
          <small>Teacher, School Education Department Kashmir</small>
        </div>
        <img class="photo" src="assets/founder.jpg" alt="Dr. Mateen Yousuf" />
        <div class="loader"><div class="loader-fill"></div></div>
      </div>
    `);
  }

  function screenHome() {
    const favCount = (storage.get("favorites", []) || []).length;
    const histCount = (storage.get("history", []) || []).length;
    const completedIds = new Set((storage.get("history", []) || []).map(h => h.simId));
    const recentSims = VSL.SIMS.slice(0, 4);
    render(`
      <div class="screen">
        <header class="app-bar">
          <h1>Virtual Simulations</h1>
        </header>
        <div class="scroll-area">
          <div class="hero">
            <div class="hero-title">History Laboratory 🧪</div>
            <div class="hero-sub">Learn by deciding — manage, govern, trade, negotiate and investigate the past.</div>
            <div class="stat-strip">
              <div class="stat-pill"><div class="num">${VSL.SIMS.length}</div><div class="lbl">Simulations</div></div>
              <div class="stat-pill"><div class="num">${completedIds.size}</div><div class="lbl">Completed</div></div>
              <div class="stat-pill"><div class="num">${favCount}</div><div class="lbl">Favorites</div></div>
            </div>
          </div>

          <div class="section-title">Quick Access</div>
          <div class="grid-2">
            <div class="quick-card" data-go="sims"><div class="qc-icon">🧪</div><div class="qc-title">All Simulations</div><div class="qc-sub">${VSL.SIMS.length} modules</div></div>
            <div class="quick-card" data-go="favorites"><div class="qc-icon">⭐</div><div class="qc-title">Favorites</div><div class="qc-sub">${favCount} saved</div></div>
            <div class="quick-card" data-go="history"><div class="qc-icon">🕘</div><div class="qc-title">History</div><div class="qc-sub">${histCount} sessions</div></div>
            <div class="quick-card" data-go="about"><div class="qc-icon">ℹ️</div><div class="qc-title">About &amp; Guide</div><div class="qc-sub">How it works</div></div>
          </div>

          <div class="section-title">Explore Simulations</div>
          ${recentSims.map(simTileHTML).join("")}
          <button class="btn btn-outline" data-go="sims" style="margin-top:4px">See all ${VSL.SIMS.length} simulations</button>
        </div>
        ${bottomNavHTML()}
      </div>
    `);
    appEl.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => goTab(b.dataset.go)));
    appEl.querySelectorAll("[data-open-sim]").forEach(b => b.addEventListener("click", () => openSim(b.dataset.openSim)));
    bindBottomNav();
  }

  function simTileHTML(s) {
    const favs = storage.get("favorites", []) || [];
    const isFav = favs.includes(s.id);
    return `<div class="sim-tile" data-open-sim="${s.id}">
      <div class="icon-box" style="background:${s.color}">${s.icon}</div>
      <div class="info">
        <div class="t">${s.title}</div>
        <div class="d">${s.tagline}</div>
        <div class="tags">${(s.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}</div>
      </div>
      <button class="fav-btn ${isFav ? "active" : ""}" data-fav="${s.id}">${isFav ? "★" : "☆"}</button>
    </div>`;
  }

  function bindSimTiles() {
    appEl.querySelectorAll("[data-open-sim]").forEach(b => {
      b.addEventListener("click", (e) => {
        if (e.target.closest("[data-fav]")) return;
        openSim(b.dataset.openSim);
      });
    });
    appEl.querySelectorAll("[data-fav]").forEach(b => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        storage.toggleInList("favorites", b.dataset.fav);
        if (currentTab === "sims") screenSims();
        else if (currentTab === "favorites") screenFavorites();
        else if (currentTab === "home") screenHome();
      });
    });
  }

  function screenSims() {
    render(`
      <div class="screen">
        <header class="app-bar">
          <h1>Simulations</h1>
        </header>
        <div class="scroll-area">
          <div class="search-bar"><span>🔎</span><input id="simSearch" placeholder="Search simulations..." /></div>
          <div id="simListWrap"></div>
        </div>
        ${bottomNavHTML()}
      </div>
    `);
    const wrap = appEl.querySelector("#simListWrap");
    function draw(filter) {
      const f = (filter || "").toLowerCase();
      const list = VSL.SIMS.filter(s => !f || s.title.toLowerCase().includes(f) || (s.tags || []).some(t => t.toLowerCase().includes(f)));
      wrap.innerHTML = list.length ? list.map(simTileHTML).join("") : `<div class="empty-state"><div class="em-icon">🔍</div>No simulations match "${filter}"</div>`;
      bindSimTiles();
    }
    draw("");
    appEl.querySelector("#simSearch").addEventListener("input", (e) => draw(e.target.value));
    bindBottomNav();
  }

  function screenFavorites() {
    const favs = storage.get("favorites", []) || [];
    const list = VSL.SIMS.filter(s => favs.includes(s.id));
    render(`
      <div class="screen">
        <header class="app-bar"><h1>Favorites</h1></header>
        <div class="scroll-area">
          ${list.length ? list.map(simTileHTML).join("") : `<div class="empty-state"><div class="em-icon">⭐</div>Tap the star on any simulation to save it here.</div>`}
        </div>
        ${bottomNavHTML()}
      </div>
    `);
    bindSimTiles();
    bindBottomNav();
  }

  function screenHistory() {
    const hist = storage.get("history", []) || [];
    render(`
      <div class="screen">
        <header class="app-bar"><h1>History</h1></header>
        <div class="scroll-area">
          ${hist.length ? hist.map(h => {
            const sim = findSim(h.simId);
            const d = new Date(h.ts);
            return `<div class="card tight card-row" data-open-sim="${h.simId}" style="cursor:pointer">
              <div class="icon-box" style="background:${sim ? sim.color : "#1976D2"};width:42px;height:42px;font-size:18px">${sim ? sim.icon : "🧪"}</div>
              <div style="flex:1">
                <div style="font-weight:600;font-family:var(--font-heading);font-size:14.5px">${sim ? sim.title : h.simId}</div>
                <div class="small" style="color:#8892A0">${esc(h.outcomeLabel || "Completed")} · ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>`;
          }).join("") : `<div class="empty-state"><div class="em-icon">🕘</div>Your completed sessions will appear here.</div>`}
        </div>
        ${bottomNavHTML()}
      </div>
    `);
    function esc(s) { return VSL.esc(s); }
    appEl.querySelectorAll("[data-open-sim]").forEach(b => b.addEventListener("click", () => openSim(b.dataset.openSim)));
    bindBottomNav();
  }

  function screenAbout() {
    render(`
      <div class="screen">
        <header class="app-bar"><h1>About</h1></header>
        <div class="scroll-area">
          <div class="card founder-card">
            <img src="assets/founder.jpg" alt="Dr. Mateen Yousuf" />
            <div>
              <div class="fn">Dr. Mateen Yousuf</div>
              <div class="fr">Teacher, School Education Department Kashmir</div>
            </div>
          </div>
          <div class="section-title">What is this app?</div>
          <div class="card">
            <p><b>Virtual Simulations</b> is an offline history laboratory. Instead of reading facts or answering quizzes, you take on a real historical role — city administrator, ruler, citizen, engineer, artist, trader, scientist, navigator, diplomat, or investigator — and make decisions that change outcomes.</p>
          </div>
          <div class="section-title">How to use it</div>
          <div class="card">
            <div class="step-item"><div class="num-badge">1</div><div>Open a simulation from the <b>Simulations</b> tab.</div></div>
            <div class="step-item"><div class="num-badge">2</div><div>Read the scenario and dashboard, then make a decision.</div></div>
            <div class="step-item"><div class="num-badge">3</div><div>See the immediate and long-term effects, plus a historical insight.</div></div>
            <div class="step-item"><div class="num-badge">4</div><div>Continue until you reach an ending, then reflect using the discussion questions.</div></div>
          </div>
          <div class="section-title">Design</div>
          <div class="card">
            <p class="small">Built as a 100% offline-first Progressive Web App. Works fully without internet after the first load, is installable on Android, iOS and desktop, and is designed to be accessible for all learners.</p>
          </div>
          <button class="btn btn-outline" id="resetBtn" style="margin-top:6px">Reset all progress</button>
        </div>
        ${bottomNavHTML()}
      </div>
    `);
    appEl.querySelector("#resetBtn").addEventListener("click", () => {
      if (confirm("This clears favorites and history on this device. Continue?")) {
        localStorage.removeItem("vsl_state_v1");
        toast("Progress reset");
        screenAbout();
      }
    });
    bindBottomNav();
  }

  /* ---------------- Simulation detail / instructions ---------------- */
  function screenSimIntro(simId) {
    const sim = findSim(simId);
    if (!sim) { goTab("sims"); return; }
    const favs = storage.get("favorites", []) || [];
    const isFav = favs.includes(sim.id);
    render(`
      <div class="screen">
        <header class="app-bar">
          <button class="bar-btn" id="backBtn">←</button>
          <h2>${sim.title}</h2>
          <button class="bar-btn" id="favToggle">${isFav ? "★" : "☆"}</button>
        </header>
        <div class="scroll-area">
          <div class="hero" style="background:linear-gradient(135deg,${sim.color},${sim.colorDark || sim.color})">
            <div style="font-size:38px">${sim.icon}</div>
            <div class="hero-title" style="margin-top:8px">${sim.title}</div>
            <div class="hero-sub">${sim.tagline}</div>
          </div>
          ${VSL.ui.infoCallout(sim.description)}
          <div class="section-title">What you'll do</div>
          <div class="card">
            ${(sim.instructions || []).map((s, i) => `<div class="step-item"><div class="num-badge">${i + 1}</div><div>${s}</div></div>`).join("")}
          </div>
          <div class="section-title">You will learn</div>
          <div class="card"><div class="tags">${(sim.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}</div></div>
          <button class="btn btn-primary" id="startBtn" style="margin-top:8px">Begin Simulation</button>
        </div>
      </div>
    `);
    appEl.querySelector("#backBtn").addEventListener("click", () => goTab("sims"));
    appEl.querySelector("#favToggle").addEventListener("click", (e) => {
      storage.toggleInList("favorites", sim.id);
      screenSimIntro(simId);
    });
    appEl.querySelector("#startBtn").addEventListener("click", () => runSim(simId));
  }

  function openSim(simId) { activeSimId = simId; screenSimIntro(simId); }

  function runSim(simId) {
    const sim = findSim(simId);
    render(`
      <div class="screen">
        <header class="sim-header" style="background:linear-gradient(135deg,${sim.color},${sim.colorDark || sim.color})">
          <div class="card-row">
            <button class="bar-btn" id="simBack" style="background:rgba(255,255,255,0.2)">←</button>
            <h2 style="color:#fff">${sim.title}</h2>
          </div>
          <div id="simHeaderExtra"></div>
        </header>
        <div class="scroll-area" id="simBody"></div>
      </div>
    `);
    appEl.querySelector("#simBack").addEventListener("click", () => {
      if (confirm("Leave this simulation? Your progress in this session will be lost.")) openSim(simId);
    });
    const container = appEl.querySelector("#simBody");
    const headerExtra = appEl.querySelector("#simHeaderExtra");
    const context = {
      headerExtra,
      finish(outcomeLabel) {
        storage.pushHistory({ simId, outcomeLabel });
      },
      restart() { runSim(simId); },
      exitToIntro() { openSim(simId); },
      goHome() { goTab("home"); }
    };
    sim.render(container, context);
  }

  /* ---------------- Tab / route controller ---------------- */
  function goTab(tab) {
    currentTab = tab;
    if (tab === "home") screenHome();
    else if (tab === "sims") screenSims();
    else if (tab === "favorites") screenFavorites();
    else if (tab === "history") screenHistory();
    else if (tab === "about") screenAbout();
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    screenSplash();
    setTimeout(() => { goTab("home"); }, 1600);
  }

  window.addEventListener("DOMContentLoaded", boot);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
