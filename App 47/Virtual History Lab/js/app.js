/* Virtual History Laboratory — application shell & router */
(function(){
  const appRoot = document.getElementById('app');

  function applyTheme(){
    document.documentElement.setAttribute('data-theme', Store.state.settings.theme);
  }
  applyTheme();

  function shellHTML(){
    return `
      <div class="topbar" id="topbar">
        <div class="brand" id="brandHome">
          <span class="torch" style="color:var(--gold)">${Icons.torch}</span>
          <span class="brand-name"><b>Virtual</b> History Lab</span>
        </div>
        <div class="searchbar">
          ${Icons.search}
          <input type="text" id="globalSearch" placeholder="Search exhibits, glossary, artifacts...">
        </div>
        <div class="spacer"></div>
        <button class="icon-btn" id="themeToggle" title="Toggle theme"></button>
        <button class="icon-btn" id="settingsBtn" title="Settings">${Icons.settings}</button>
        <div class="avatar-sm" id="aboutBtn" title="About the developer" style="cursor:pointer">
          <img src="assets/developer.jpg" alt="Dr. Mateen Yousuf">
        </div>
      </div>
      <main id="mainArea"></main>
      <footer class="app-footer">Virtual History Laboratory · Created by Dr. Mateen Yousuf, Teacher, School Education Department, Kashmir · 100% Offline PWA</footer>
      <div class="bottomnav" id="bottomnav">
        <button data-r="#/home">${Icons.home}<span>Home</span></button>
        <button data-r="#/timeline">${Icons.timeline}<span>Timeline</span></button>
        <button data-r="#/museum">${Icons.museum}<span>Museum</span></button>
        <button data-r="#/quiz-centre">${Icons.quiz}<span>Quiz</span></button>
        <button data-r="#/dashboard">${Icons.user}<span>Profile</span></button>
      </div>
      <div class="modal-backdrop" id="modalBackdrop"><div class="modal" id="modalBody"></div></div>
    `;
  }

  function openModal(html){
    document.getElementById('modalBody').innerHTML = `<span class="btn-ghost-icon modal-close" id="modalCloseBtn">&times;</span>` + html;
    const bd = document.getElementById('modalBackdrop');
    bd.classList.add('open');
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    bd.addEventListener('click', (e)=>{ if(e.target===bd) closeModal(); });
  }
  function closeModal(){ document.getElementById('modalBackdrop').classList.remove('open'); }

  function wireShell(){
    document.getElementById('brandHome').addEventListener('click', ()=> location.hash='#/home');
    const themeBtn = document.getElementById('themeToggle');
    function paintThemeBtn(){ themeBtn.innerHTML = Store.state.settings.theme==='dark' ? Icons.sun : Icons.moon; }
    paintThemeBtn();
    themeBtn.addEventListener('click', ()=>{
      Store.setSetting('theme', Store.state.settings.theme==='dark' ? 'light' : 'dark');
      applyTheme(); paintThemeBtn();
    });
    document.getElementById('settingsBtn').addEventListener('click', ()=> location.hash='#/settings');
    document.getElementById('aboutBtn').addEventListener('click', ()=> location.hash='#/about');
    document.querySelectorAll('#bottomnav button').forEach(b=>{
      b.addEventListener('click', ()=> location.hash = b.dataset.r);
    });
    document.getElementById('globalSearch').addEventListener('input', (e)=>{
      const q = e.target.value.trim().toLowerCase();
      if(location.hash!=='#/home' && q) location.hash='#/home';
      window._pendingSearch = q;
      if(location.hash==='#/home') filterHome(q);
    });
  }

  function markActiveNav(){
    const h = location.hash.split('/')[1] ? '#/'+location.hash.split('/')[1] : '#/home';
    document.querySelectorAll('#bottomnav button').forEach(b=> b.classList.toggle('active', b.dataset.r===h));
  }

  /* ---------------------- ROUTES ---------------------- */

  function renderSplash(){
    appRoot.innerHTML = `
      <div class="splash">
        <div class="torchlight l"></div><div class="torchlight r"></div>
        <div class="dust-layer" id="dustLayer"></div>
        <div class="scroll-wrap">
          <div class="badge" style="margin-bottom:18px">Offline Progressive Web App</div>
          <h1 class="scroll-title">Virtual<span class="accent">History Laboratory</span></h1>
          <div class="scroll-sub">Experience History Through Interactive Virtual Simulations</div>
          <div class="medallion">
            <div class="ring"></div>
            <div class="portrait"><img src="assets/developer.jpg" alt="Dr. Mateen Yousuf"></div>
          </div>
          <div class="developer-credit">
            <div class="by">Created by</div>
            <div class="name">Dr. Mateen Yousuf</div>
            <div class="role">Teacher, School Education Department, Kashmir</div>
          </div>
          <div><button class="btn btn-primary enter-btn" id="enterBtn">Enter the Laboratory ${Icons.arrow}</button></div>
        </div>
      </div>
    `;
    const dustLayer = document.getElementById('dustLayer');
    for(let i=0;i<26;i++){
      const d = document.createElement('div');
      d.className='dust';
      d.style.left = Math.random()*100+'%';
      d.style.animationDuration = (8+Math.random()*10)+'s';
      d.style.animationDelay = (Math.random()*10)+'s';
      dustLayer.appendChild(d);
    }
    document.getElementById('enterBtn').addEventListener('click', ()=>{
      sessionStorage.setItem('vhl_seen_splash','1');
      location.hash = '#/home';
    });
  }

  function heritageCards(){
    return SIMULATIONS.map(s=>{
      const prog = Store.state.progress[s.id];
      const pct = prog ? (prog.completed ? 100 : 40) : 0;
      return `<div class="exhibit-card" data-search="${escapeHtml((s.title+' '+s.era+' '+s.tagline).toLowerCase())}" data-go="#/sim/${s.id}">
        <div class="art">${ExhibitArt[s.id]}<span class="num">EXHIBIT ${s.num}</span></div>
        <div class="body">
          <h3>${escapeHtml(s.title)}</h3>
          <p>${escapeHtml(s.tagline)}</p>
          <div class="meta"><span class="tag">${escapeHtml(s.era)}</span>${prog&&prog.completed?'<span class="tag" style="color:var(--gold)">✓ Complete</span>':''}</div>
          <div class="progress-mini"><i style="width:${pct}%"></i></div>
        </div>
      </div>`;
    }).join('');
  }

  function renderHome(){
    const main = document.getElementById('mainArea');
    const level = Store.levelFromXP(Store.state.xp);
    const completedCount = Object.values(Store.state.progress).filter(p=>p.completed).length;
    const continueId = Object.entries(Store.state.progress).sort((a,b)=>(b[1].updatedAt||0)-(a[1].updatedAt||0))[0]?.[0];
    const continueMeta = continueId && SIMULATIONS.find(s=>s.id===continueId);

    main.innerHTML = `
      <div class="hero">
        <div class="hero-map">${ExhibitArt.egypt}</div>
        <span class="badge">${level.title} · ${Store.state.xp} XP</span>
        <h1>Explore History Through Interactive Investigation</h1>
        <p>Reconstruct civilizations, examine evidence, and make the decisions that shaped history — across ten immersive virtual simulations.</p>
        <div class="row">
          ${continueMeta ? `<button class="btn btn-primary" id="continueBtn">${Icons.play} Continue: ${escapeHtml(continueMeta.title)}</button>` : `<button class="btn btn-primary" id="startBtn">${Icons.play} Start Exploring</button>`}
          <button class="btn btn-secondary" id="heroTimelineBtn">${Icons.timeline} View Timeline</button>
        </div>
      </div>

      <div class="section-title"><span class="eyebrow">Progress</span><h2>Your Investigation Dashboard</h2><div class="rule"></div></div>
      <div class="card-grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">
        <div class="panel" style="padding:16px"><div class="muted">Exhibits Completed</div><div style="font-size:1.8rem;font-family:var(--font-display)">${completedCount} / 10</div></div>
        <div class="panel" style="padding:16px"><div class="muted">Historian Level</div><div style="font-size:1.1rem;font-family:var(--font-display);color:var(--gold-light)">${level.title}</div></div>
        <div class="panel" style="padding:16px"><div class="muted">Learning Streak</div><div style="font-size:1.8rem;font-family:var(--font-display)">${Store.state.streak.count} 🔥</div></div>
        <div class="panel" style="padding:16px"><div class="muted">Achievements</div><div style="font-size:1.8rem;font-family:var(--font-display)">${Store.state.achievements.length} / ${Store.ACHV.length}</div></div>
      </div>

      <div class="section-title"><span class="eyebrow">Catalog</span><h2>10 Premium Historical Simulations</h2><div class="rule"></div></div>
      <div class="card-grid" id="simGrid">${heritageCards()}</div>
      <div class="empty-state" id="noResults" style="display:none">No exhibits match your search.</div>

      <div class="section-title"><span class="eyebrow">Explore Further</span><h2>Laboratory Resources</h2><div class="rule"></div></div>
      <div class="card-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">
        ${resourceCard('#/timeline', Icons.timeline, 'Interactive Timeline', 'Zoom and filter across all eras')}
        ${resourceCard('#/museum', Icons.museum, 'Digital Museum', 'Rotate and examine real artifacts')}
        ${resourceCard('#/handbook', Icons.book, 'History Handbook', 'Civilizations, dynasties & terms')}
        ${resourceCard('#/glossary', Icons.glossary, 'Illustrated Glossary', 'Search historical terminology')}
        ${resourceCard('#/quiz-centre', Icons.quiz, 'Quiz Centre', 'Test yourself across all exhibits')}
        ${resourceCard('#/bookmarks', Icons.bookmark, 'Bookmarks', 'Your saved discoveries')}
        ${resourceCard('#/achievements', Icons.trophy, 'Achievements', 'Badges & certificates earned')}
        ${resourceCard('#/settings', Icons.settings, 'Settings', 'Theme, mode & data')}
      </div>
    `;
    main.querySelectorAll('[data-go]').forEach(c=> c.addEventListener('click', ()=> location.hash=c.dataset.go));
    document.getElementById('continueBtn')?.addEventListener('click', ()=> location.hash=`#/sim/${continueId}`);
    document.getElementById('startBtn')?.addEventListener('click', ()=> location.hash=`#/sim/${SIMULATIONS[0].id}`);
    document.getElementById('heroTimelineBtn').addEventListener('click', ()=> location.hash='#/timeline');
    main.querySelectorAll('.resource-card').forEach(c=> c.addEventListener('click', ()=> location.hash=c.dataset.go));

    if(window._pendingSearch){ filterHome(window._pendingSearch); document.getElementById('globalSearch').value = window._pendingSearch; }
  }
  function resourceCard(go, icon, title, desc){
    return `<div class="exhibit-card resource-card" data-go="${go}">
      <div class="body" style="padding-top:18px">
        <div style="width:34px;height:34px;color:var(--gold)">${icon}</div>
        <h3>${title}</h3><p>${desc}</p>
      </div></div>`;
  }
  function filterHome(q){
    const grid = document.getElementById('simGrid');
    if(!grid) return;
    let any=false;
    grid.querySelectorAll('.exhibit-card').forEach(c=>{
      const match = !q || c.dataset.search.includes(q);
      c.style.display = match ? '' : 'none';
      if(match) any=true;
    });
    document.getElementById('noResults').style.display = any || !q ? 'none' : 'block';
  }

  function renderSim(id){
    const main = document.getElementById('mainArea');
    renderSimulationPage(main, id);
  }

  function renderTimeline(){
    const main = document.getElementById('mainArea');
    main.innerHTML = `
      <div class="section-title"><span class="eyebrow">Chronology</span><h2>Interactive Timeline</h2><div class="rule"></div></div>
      <p class="muted">Scroll horizontally to explore. Click any event to see it in context.</p>
      <div class="timeline-wrap"><div class="timeline">
        <div class="spine"></div>
        <div class="eras">${TIMELINE_DATA.map(era=>`
          <div class="era-track">
            <div class="era-label">${era.era} <br><span style="opacity:.6">${era.range}</span></div>
            ${era.events.map(e=>`<div class="tl-node"><b>${e.y}</b>${e.t}</div>`).join('')}
          </div>`).join('')}
        </div>
      </div></div>
    `;
  }

  function renderMuseum(){
    const main = document.getElementById('mainArea');
    main.innerHTML = `
      <div class="section-title"><span class="eyebrow">Digital Museum</span><h2>Artifact Gallery</h2><div class="rule"></div></div>
      <p class="muted">Click an artifact to examine it closely.</p>
      <div class="card-grid" id="museumGrid">
        ${MUSEUM_DATA.map(a=>`
        <div class="exhibit-card" data-id="${a.id}">
          <div class="art" style="background:radial-gradient(circle, ${a.color}33, transparent)">
            <div style="font-size:2.6rem">🏺</div>
          </div>
          <div class="body"><h3>${escapeHtml(a.name)}</h3><p>${escapeHtml(a.era)}</p></div>
        </div>`).join('')}
      </div>
    `;
    main.querySelectorAll('#museumGrid .exhibit-card').forEach(c=>{
      c.addEventListener('click', ()=>{
        const a = MUSEUM_DATA.find(m=>m.id===c.dataset.id);
        const bk = Store.isBookmarked('artifact', a.id);
        openModal(`
          <div class="center">
            <div id="rotWrap" style="width:160px;height:160px;margin:0 auto 16px;border-radius:50%;background:radial-gradient(circle, ${a.color}44, transparent);display:flex;align-items:center;justify-content:center;font-size:4rem;transition:transform .1s linear;cursor:grab">🏺</div>
            <h3>${escapeHtml(a.name)}</h3>
            <p class="muted">${escapeHtml(a.era)} · ${escapeHtml(a.material)}</p>
            <p>${escapeHtml(a.desc)}</p>
            <button class="btn btn-secondary btn-sm" id="bkArtifact">${bk?'★ Bookmarked':'☆ Bookmark'}</button>
          </div>
        `);
        const rot = document.getElementById('rotWrap');
        let angle=0, dragging=false, lastX=0;
        rot.addEventListener('mousedown', e=>{dragging=true; lastX=e.clientX; rot.style.cursor='grabbing';});
        window.addEventListener('mouseup', ()=>{dragging=false; rot.style.cursor='grab';});
        window.addEventListener('mousemove', e=>{ if(!dragging) return; angle += (e.clientX-lastX)*0.6; lastX=e.clientX; rot.style.transform=`rotateY(${angle}deg)`; });
        document.getElementById('bkArtifact').addEventListener('click', (e)=>{
          const now = Store.toggleBookmark('artifact', a.id);
          e.target.textContent = now ? '★ Bookmarked' : '☆ Bookmark';
        });
      });
    });
  }

  function renderGlossary(){
    const main = document.getElementById('mainArea');
    main.innerHTML = `
      <div class="section-title"><span class="eyebrow">Reference</span><h2>Illustrated Glossary</h2><div class="rule"></div></div>
      <div class="searchbar" style="max-width:360px;margin-bottom:18px">${Icons.search}<input type="text" id="glosSearch" placeholder="Search terms..."></div>
      <div class="card-grid" id="glosGrid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))"></div>
    `;
    function paint(q){
      const list = GLOSSARY_DATA.filter(g=> !q || g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q))
        .sort((a,b)=>a.term.localeCompare(b.term));
      document.getElementById('glosGrid').innerHTML = list.map(g=>`
        <div class="panel" style="padding:16px">
          <b style="color:var(--gold-light)">${escapeHtml(g.term)}</b>
          <div class="muted" style="font-family:var(--font-mono);font-size:.72rem">/${escapeHtml(g.pron)}/</div>
          <p class="mt8">${escapeHtml(g.def)}</p>
        </div>`).join('') || `<div class="empty-state">No terms found.</div>`;
    }
    paint('');
    document.getElementById('glosSearch').addEventListener('input', e=> paint(e.target.value.toLowerCase()));
  }

  function renderHandbook(){
    const main = document.getElementById('mainArea');
    main.innerHTML = `
      <div class="section-title"><span class="eyebrow">Reference</span><h2>Interactive History Handbook</h2><div class="rule"></div></div>
      <div class="card-grid" style="grid-template-columns:1fr">
        ${SIMULATIONS.map(s=>`
          <div class="panel" style="padding:18px">
            <div class="flex" style="justify-content:space-between;align-items:baseline">
              <h3 style="margin:0">${escapeHtml(s.title)}</h3><span class="tag">${escapeHtml(s.era)}</span>
            </div>
            <p class="mt8">${escapeHtml(s.context)}</p>
            <button class="btn btn-tertiary btn-sm" data-go="#/sim/${s.id}">Open Exhibit ${Icons.arrow}</button>
          </div>`).join('')}
      </div>
    `;
    main.querySelectorAll('[data-go]').forEach(b=> b.addEventListener('click', ()=> location.hash=b.dataset.go));
  }

  function renderBookmarks(){
    const main = document.getElementById('mainArea');
    const bms = Store.state.bookmarks;
    main.innerHTML = `
      <div class="section-title"><span class="eyebrow">Saved</span><h2>Bookmarks</h2><div class="rule"></div></div>
      <div class="card-grid" id="bkGrid"></div>
    `;
    const grid = document.getElementById('bkGrid');
    if(!bms.length){ grid.innerHTML = `<div class="empty-state">No bookmarks yet. Star exhibits or artifacts to save them here.</div>`; return; }
    grid.innerHTML = bms.map(b=>{
      if(b.type==='sim'){ const s = SIMULATIONS.find(x=>x.id===b.id); if(!s) return '';
        return `<div class="exhibit-card" data-go="#/sim/${s.id}"><div class="art">${ExhibitArt[s.id]}</div><div class="body"><h3>${escapeHtml(s.title)}</h3><p>Simulation</p></div></div>`; }
      if(b.type==='artifact'){ const a = MUSEUM_DATA.find(x=>x.id===b.id); if(!a) return '';
        return `<div class="exhibit-card" data-go="#/museum"><div class="art" style="font-size:2.2rem">🏺</div><div class="body"><h3>${escapeHtml(a.name)}</h3><p>Museum Artifact</p></div></div>`; }
      return '';
    }).join('');
    grid.querySelectorAll('[data-go]').forEach(c=> c.addEventListener('click', ()=> location.hash=c.dataset.go));
  }

  function renderAchievements(){
    const main = document.getElementById('mainArea');
    main.innerHTML = `
      <div class="section-title"><span class="eyebrow">Recognition</span><h2>Achievements &amp; Certificates</h2><div class="rule"></div></div>
      <div class="card-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
        ${Store.ACHV.map(a=>{
          const unlocked = Store.state.achievements.includes(a.id);
          return `<div class="panel" style="padding:16px;opacity:${unlocked?1:.5}">
            <div style="width:28px;color:var(--gold)">${Icons.trophy}</div>
            <b>${escapeHtml(a.name)}</b><p class="muted">${escapeHtml(a.desc)}</p>
            <span class="tag" style="color:${unlocked?'var(--gold)':''}">${unlocked?'Unlocked':'Locked'}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="section-title"><span class="eyebrow">Recognition</span><h2>Completion Certificate</h2><div class="rule"></div></div>
      <div class="panel center" style="padding:30px">
        ${Object.values(Store.state.progress).filter(p=>p.completed).length>=10
          ? `<h3>🏅 Certificate of Completion</h3><p>Awarded to a dedicated historian for completing all 10 exhibits in the Virtual History Laboratory.</p>`
          : `<p class="muted">Complete all 10 exhibits to unlock your Certificate of Completion.</p>`}
      </div>
    `;
  }

  function renderDashboard(){
    const main = document.getElementById('mainArea');
    const level = Store.levelFromXP(Store.state.xp);
    main.innerHTML = `
      <div class="section-title"><span class="eyebrow">Profile</span><h2>Progress Dashboard</h2><div class="rule"></div></div>
      <div class="panel" style="padding:20px;margin-bottom:20px">
        <div class="flex gap12" style="align-items:center">
          <div class="avatar-sm" style="width:56px;height:56px"><img src="assets/developer.jpg" style="width:100%;height:100%;object-fit:cover"></div>
          <div><b style="font-size:1.1rem">${level.title}</b><div class="muted">${Store.state.xp} XP · Level progress to ${level.next} XP</div></div>
        </div>
        <div class="stat-bar mt16 stat-gold"><div class="track"><i style="width:${Math.min(100,((Store.state.xp-level.prev)/(level.next-level.prev))*100)}%"></i></div></div>
      </div>
      <div class="card-grid" style="grid-template-columns:1fr">
        ${SIMULATIONS.map(s=>{
          const p = Store.state.progress[s.id];
          const pct = p ? (p.completed?100:45) : 0;
          return `<div class="panel" style="padding:14px 18px">
            <div class="flex" style="justify-content:space-between"><b>${escapeHtml(s.title)}</b><span class="muted">${p?(p.completed?'Completed':'Visited'):'Not started'}</span></div>
            <div class="progress-mini mt8"><i style="width:${pct}%"></i></div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  function renderQuizCentre(){
    const main = document.getElementById('mainArea');
    main.innerHTML = `
      <div class="section-title"><span class="eyebrow">Assessment</span><h2>Quiz Centre</h2><div class="rule"></div></div>
      <p class="muted">Each exhibit includes a 5-question adaptive mini quiz with instant feedback and explanations.</p>
      <div class="card-grid">
        ${SIMULATIONS.map(s=>{
          const q = Store.state.quizHistory[s.id];
          return `<div class="exhibit-card" data-go="#/sim/${s.id}">
            <div class="art">${ExhibitArt[s.id]}</div>
            <div class="body"><h3>${escapeHtml(s.title)}</h3>
            <p>${q?`Best score: ${q.score}/${q.total}`:'Not attempted yet'}</p></div>
          </div>`;
        }).join('')}
      </div>
    `;
    main.querySelectorAll('[data-go]').forEach(c=> c.addEventListener('click', ()=> location.hash=c.dataset.go));
  }

  function renderSettings(){
    const main = document.getElementById('mainArea');
    const s = Store.state.settings;
    main.innerHTML = `
      <div class="section-title"><span class="eyebrow">Preferences</span><h2>Settings</h2><div class="rule"></div></div>
      <div class="panel" style="padding:20px;max-width:520px">
        <div class="field"><label>Theme</label>
          <div class="toggle-row">
            <div class="chip ${s.theme==='dark'?'active':''}" data-set="theme:dark">🌙 Dark (Museum Night)</div>
            <div class="chip ${s.theme==='light'?'active':''}" data-set="theme:light">☀️ Light (Parchment)</div>
          </div>
        </div>
        <div class="field"><label>Mode</label>
          <div class="toggle-row">
            <div class="chip ${s.mode==='student'?'active':''}" data-set="mode:student">🎓 Student Mode</div>
            <div class="chip ${s.mode==='teacher'?'active':''}" data-set="mode:teacher">🧑‍🏫 Teacher Mode</div>
          </div>
        </div>
        <div class="field"><label>Text Size</label>
          <div class="toggle-row">
            <div class="chip ${s.textSize==='sm'?'active':''}" data-set="textSize:sm">A Small</div>
            <div class="chip ${s.textSize==='md'?'active':''}" data-set="textSize:md">A Medium</div>
            <div class="chip ${s.textSize==='lg'?'active':''}" data-set="textSize:lg">A Large</div>
          </div>
        </div>
        <hr class="hairline">
        <button class="btn btn-secondary" id="resetProgressBtn">Reset All Progress</button>
      </div>
    `;
    document.querySelectorAll('[data-set]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const [k,v] = chip.dataset.set.split(':');
        Store.setSetting(k,v);
        if(k==='theme') applyTheme();
        if(k==='textSize') document.body.style.fontSize = v==='sm'?'14px':v==='lg'?'18px':'16px';
        renderSettings();
      });
    });
    document.getElementById('resetProgressBtn').addEventListener('click', ()=>{
      openModal(`<h3>Reset all progress?</h3><p>This clears XP, achievements, notes and quiz history on this device. This cannot be undone.</p>
        <div class="flex gap8 mt16"><button class="btn btn-primary" id="confirmReset">Yes, reset</button><button class="btn btn-secondary" id="cancelReset">Cancel</button></div>`);
      document.getElementById('confirmReset').addEventListener('click', ()=>{ Store.reset(); closeModal(); location.hash='#/home'; location.reload(); });
      document.getElementById('cancelReset').addEventListener('click', closeModal);
    });
  }

  function renderAbout(){
    const main = document.getElementById('mainArea');
    main.innerHTML = `
      <div class="panel" style="padding:36px;max-width:760px;margin:0 auto;text-align:center">
        <div style="width:150px;height:150px;margin:0 auto 20px;border-radius:50%;overflow:hidden;border:3px solid var(--gold)">
          <img src="assets/developer.jpg" style="width:100%;height:100%;object-fit:cover">
        </div>
        <h1 style="margin-bottom:4px">Virtual History Laboratory</h1>
        <p class="muted">Created by</p>
        <h2 style="color:var(--gold-light);margin-bottom:2px">Dr. Mateen Yousuf</h2>
        <p class="muted">Teacher, School Education Department, Kashmir</p>
        <hr class="hairline">
        <div style="text-align:left">
          <h4 style="color:var(--accent)">Vision</h4>
          <p>To move history education beyond memorisation — toward exploration, evidence-based reasoning and genuine historical inquiry, so students learn to think like historians rather than simply recall dates.</p>
          <h4 style="color:var(--accent)">Aligned With</h4>
          <ul>
            <li>NEP 2020 principles of experiential, competency-based learning</li>
            <li>Inquiry-based and evidence-driven historical thinking</li>
            <li>Heritage appreciation and cultural preservation</li>
            <li>Civic understanding through constitutional and historical literacy</li>
          </ul>
          <h4 style="color:var(--accent)">About This App</h4>
          <p>Virtual History Laboratory is a fully offline Progressive Web App built with HTML5, CSS3 and vanilla JavaScript — installable on any device, requiring no internet connection, backend or cloud service.</p>
        </div>
      </div>
    `;
  }

  /* ---------------------- ROUTER ---------------------- */
  const routes = {
    'home': renderHome, 'timeline': renderTimeline, 'museum': renderMuseum, 'glossary': renderGlossary,
    'handbook': renderHandbook, 'bookmarks': renderBookmarks, 'achievements': renderAchievements,
    'dashboard': renderDashboard, 'quiz-centre': renderQuizCentre, 'settings': renderSettings, 'about': renderAbout,
  };

  function route(){
    const hash = location.hash || '';
    const bd = document.getElementById('modalBackdrop');
    if(bd) bd.classList.remove('open');
    if(!hash || hash==='#/' ){
      if(sessionStorage.getItem('vhl_seen_splash')){ location.hash='#/home'; return; }
      appRoot.innerHTML=''; renderSplash(); return;
    }
    if(!document.getElementById('mainArea')){
      appRoot.innerHTML = shellHTML();
      wireShell();
    }
    const parts = hash.replace('#/','').split('/');
    window.scrollTo(0,0);
    if(parts[0]==='sim' && parts[1]){ renderSim(parts[1]); }
    else if(routes[parts[0]]){ routes[parts[0]](); }
    else { renderHome(); }
    markActiveNav();
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', ()=>{
    const sz = Store.state.settings.textSize;
    if(sz && sz!=='md') document.body.style.fontSize = sz==='sm'?'14px':'18px';
    route();
  });
})();
