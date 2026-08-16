(function(){
  'use strict';
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  const screenEl = $('#screen');
  const appbarTitle = $('#appbarTitle');
  const btnBack = $('#btnBack');
  const bottomnav = $('#bottomnav');
  const toastEl = $('#toast');

  /* ---------------- storage helpers ---------------- */
  const store = {
    get(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch(e){ return fallback; } },
    set(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  };
  const Favorites = {
    list(){ return store.get('geolab_favs', []); },
    has(id){ return Favorites.list().includes(id); },
    toggle(id){
      let l = Favorites.list();
      if(l.includes(id)) l = l.filter(x=>x!==id); else l.push(id);
      store.set('geolab_favs', l);
      return l.includes(id);
    }
  };
  const History = {
    list(){ return store.get('geolab_hist', []); },
    push(id){
      let l = History.list().filter(x=>x.id!==id);
      l.unshift({id, ts:Date.now()});
      l = l.slice(0,20);
      store.set('geolab_hist', l);
    },
    clear(){ store.set('geolab_hist', []); }
  };
  GeoLab.toast = function(msg, ms=2200){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(GeoLab._toastT);
    GeoLab._toastT = setTimeout(()=>toastEl.classList.remove('show'), ms);
  };
  GeoLab.store = store;

  /* ---------------- splash ---------------- */
  function initSplash(){
    const starsWrap = $('#stars');
    let html='';
    for(let i=0;i<40;i++){
      const top = Math.random()*100, left = Math.random()*100, delay=(Math.random()*3).toFixed(2);
      html += `<span style="top:${top}%;left:${left}%;animation-delay:${delay}s"></span>`;
    }
    starsWrap.innerHTML = html;
    setTimeout(()=>{ $('#splash').classList.add('hide'); }, 2000);
  }

  /* ---------------- card builders ---------------- */
  function gradientStyle(sim){ return `background:linear-gradient(135deg, ${sim.color[0]}, ${sim.color[1]});`; }

  function simCardHTML(sim, listMode){
    const fav = Favorites.has(sim.id) ? '★' : '';
    return `
    <div class="sim-card" data-open="${sim.id}">
      <div class="thumb" style="${gradientStyle(sim)}">
        <span class="num">#${sim.num}</span>
        ${sim.icon}
      </div>
      <div class="body">
        <h4>${sim.title} ${fav?'<span style="color:#FFB300">'+fav+'</span>':''}</h4>
        <p>${sim.blurb}</p>
        <span class="tag">${sim.skill}</span>
      </div>
    </div>`;
  }

  /* ---------------- screens ---------------- */
  function renderHome(){
    setAppbar('Virtual Simulations','Home Dashboard', false);
    const recentIds = History.list().slice(0,5).map(h=>h.id);
    const featured = GeoLab.order.slice(0,6).map(id=>GeoLab.sims[id]);

    screenEl.innerHTML = `
      <div class="home-hero">
        <div class="avatar-ring">🧑‍🏫</div>
        <div>
          <h2>Welcome, Explorer!</h2>
          <p>10 hands-on geography simulations. 100% offline.</p>
        </div>
      </div>

      <div class="section-label">Quick Access</div>
      <div class="quick-grid">
        <div class="quick-item" data-nav="sims"><div class="qi-ico">🧭</div><span>All Sims</span></div>
        <div class="quick-item" data-nav="favorites"><div class="qi-ico">⭐</div><span>Favorites</span></div>
        <div class="quick-item" data-nav="history"><div class="qi-ico">🕘</div><span>History</span></div>
        <div class="quick-item" data-nav="about"><div class="qi-ico">ℹ️</div><span>About</span></div>
      </div>

      ${recentIds.length ? `
      <div class="section-label">Continue Exploring <a data-nav="history">See all</a></div>
      <div class="sim-scroll">
        ${recentIds.map(id=>simCardHTML(GeoLab.sims[id])).join('')}
      </div>` : ``}

      <div class="section-label">Featured Simulations <a data-nav="sims">See all</a></div>
      <div class="sim-scroll">
        ${featured.map(s=>simCardHTML(s)).join('')}
      </div>

      <div class="section-label">All 10 Simulations</div>
      <div class="sim-list">
        ${GeoLab.order.map(id=>simCardHTML(GeoLab.sims[id])).join('')}
      </div>
    `;
    bindCardOpens();
    bindNavShortcuts();
  }

  function renderSimList(filterCategory){
    setAppbar('Simulations', GeoLab.order.length+' interactive labs', false);
    const categories = ['All', ...new Set(GeoLab.order.map(id=>GeoLab.sims[id].category))];
    const active = filterCategory || 'All';
    screenEl.innerHTML = `
      <div class="searchbar"><span class="ico">🔎</span><input id="simSearch" placeholder="Search simulations..."></div>
      <div class="chip-row" id="chipRow">
        ${categories.map(c=>`<div class="chip ${c===active?'active':''}" data-cat="${c}">${c}</div>`).join('')}
      </div>
      <div class="sim-list" id="simListBody"></div>
    `;
    function draw(){
      const q = ($('#simSearch').value||'').toLowerCase();
      const cat = $('.chip.active')?.dataset.cat || 'All';
      const ids = GeoLab.order.filter(id=>{
        const s = GeoLab.sims[id];
        const matchCat = cat==='All' || s.category===cat;
        const matchQ = !q || s.title.toLowerCase().includes(q) || s.skill.toLowerCase().includes(q);
        return matchCat && matchQ;
      });
      $('#simListBody').innerHTML = ids.length ? ids.map(id=>simCardHTML(GeoLab.sims[id])).join('') :
        `<div class="empty-state"><div class="ico">🔍</div><p>No simulations match your search.</p></div>`;
      bindCardOpens();
    }
    $('#simSearch').addEventListener('input', draw);
    $$('.chip', screenEl).forEach(c=>c.addEventListener('click', ()=>{
      $$('.chip', screenEl).forEach(x=>x.classList.remove('active'));
      c.classList.add('active'); draw();
    }));
    draw();
  }

  function renderFavorites(){
    setAppbar('Favorites','Your saved simulations', false);
    const ids = Favorites.list();
    screenEl.innerHTML = `<div class="sim-list">${
      ids.length ? ids.map(id=>simCardHTML(GeoLab.sims[id])).join('')
      : `<div class="empty-state"><div class="ico">⭐</div><p>No favorites yet.<br>Tap the star on any simulation to save it here.</p></div>`
    }</div>`;
    bindCardOpens();
  }

  function renderHistory(){
    setAppbar('History','Recently opened', false);
    const items = History.list();
    screenEl.innerHTML = `
      ${items.length ? `<div style="padding:10px 18px 0;text-align:right;"><span class="btn btn-tertiary btn-sm" id="clearHist">Clear history</span></div>`:''}
      <div class="sim-list">${
        items.length ? items.map(h=>simCardHTML(GeoLab.sims[h.id])).join('')
        : `<div class="empty-state"><div class="ico">🕘</div><p>Nothing opened yet.<br>Your recent simulations will appear here.</p></div>`
      }</div>`;
    bindCardOpens();
    $('#clearHist')?.addEventListener('click', ()=>{ History.clear(); renderHistory(); GeoLab.toast('History cleared'); });
  }

  function renderAbout(){
    setAppbar('About','Virtual Simulations', false);
    screenEl.innerHTML = `
      <div style="padding:18px;">
        <div class="panel" style="text-align:center;">
          <div class="avatar-ring" style="margin:0 auto 12px;width:70px;height:70px;font-size:34px;background:var(--light-blue);border-radius:50%;display:flex;align-items:center;justify-content:center;">🧑‍🏫</div>
          <h3>Dr. Mateen Yousuf</h3>
          <p style="color:#78839a;margin-top:4px;">Teacher, School Education Department, Kashmir</p>
        </div>
        <div class="panel">
          <h3>About this Lab</h3>
          <p>The <b>Virtual Geography Laboratory</b> is a 100% offline Progressive Web App containing ten interactive simulations spanning cartography, GIS, time geography, urban planning, agriculture, transport, tourism, cultural geography, glaciology and land-use planning.</p>
        </div>
        <div class="panel">
          <h3>Design Principles</h3>
          <div class="legend-item">✅ Consistency across all apps</div>
          <div class="legend-item">✅ Simplicity — clean layout, easy navigation</div>
          <div class="legend-item">✅ Engagement — hands-on experiments, not slideshows</div>
          <div class="legend-item">✅ Accessibility — inclusive for all learners</div>
          <div class="legend-item">✅ 100% Offline — works with no internet connection</div>
        </div>
        <div class="panel">
          <h3>Technical</h3>
          <div class="legend-item">📦 Platform: Progressive Web App (installable)</div>
          <div class="legend-item">🔌 Offline-first with Service Worker caching</div>
          <div class="legend-item">💾 Progress saved locally on this device</div>
          <div class="legend-item">📱 Responsive — phone, tablet & desktop</div>
        </div>
      </div>
    `;
  }

  function setAppbar(title, sub, showBack){
    appbarTitle.innerHTML = `${title}${sub?`<small>${sub}</small>`:''}`;
    btnBack.style.display = showBack ? 'flex':'none';
  }

  function bindCardOpens(){
    $$('[data-open]', screenEl).forEach(card=>{
      card.addEventListener('click', ()=>openSim(card.dataset.open));
    });
  }
  function bindNavShortcuts(){
    $$('[data-nav]', screenEl).forEach(el=>{
      el.addEventListener('click', ()=>navigate(el.dataset.nav));
    });
  }

  /* ---------------- simulation mounting ---------------- */
  let currentSimId = null;
  function openSim(id){
    const sim = GeoLab.sims[id];
    if(!sim || !sim.mount){ GeoLab.toast('This simulation is loading...'); return; }
    History.push(id);
    currentSimId = id;
    setAppbar(sim.title, '#'+sim.num+' · '+sim.skill, true);
    $('.appbar').classList.add('sim-appbar');
    screenEl.innerHTML = `<div class="sim-stage" id="simRoot"></div>`;
    setActiveNav(null);
    try{
      sim.mount($('#simRoot'), { toast: GeoLab.toast, store, favToggle:()=>Favorites.toggle(id), isFav:()=>Favorites.has(id) });
    }catch(e){
      console.error(e);
      $('#simRoot').innerHTML = `<div class="empty-state"><div class="ico">⚠️</div><p>This simulation hit a snag loading.<br>Please go back and try again.</p></div>`;
    }
  }

  btnBack.addEventListener('click', ()=>{
    $('.appbar').classList.remove('sim-appbar');
    if(currentSimId){ currentSimId=null; }
    navigate('sims');
  });
  $('#btnInfo').addEventListener('click', ()=>{
    if(currentSimId){
      GeoLab.toast('Use the controls & missions panels to explore this lab.');
    } else {
      navigate('about');
    }
  });

  /* ---------------- navigation ---------------- */
  function setActiveNav(key){
    $$('#bottomnav button').forEach(b=>b.classList.toggle('active', b.dataset.nav===key));
  }
  function navigate(key){
    $('.appbar').classList.remove('sim-appbar');
    setActiveNav(key);
    if(key==='home') renderHome();
    else if(key==='sims') renderSimList();
    else if(key==='favorites') renderFavorites();
    else if(key==='history') renderHistory();
    else if(key==='about') renderAbout();
    screenEl.scrollTop = 0;
  }
  $$('#bottomnav button').forEach(b=>b.addEventListener('click', ()=>navigate(b.dataset.nav)));

  /* ---------------- boot ---------------- */
  initSplash();
  navigate('home');

  if('serviceWorker' in navigator && navigator.serviceWorker){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('service-worker.js').catch(()=>{});
    });
  }
})();
