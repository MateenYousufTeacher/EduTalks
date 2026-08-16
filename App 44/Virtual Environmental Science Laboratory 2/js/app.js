/* ============================================================
   Virtual Simulations — App Shell
   Handles navigation, dashboard, favorites, generic control
   rendering, simple canvas line-charts, CSV export, PWA install.
   ============================================================ */

const App = (() => {
  let currentSimId = null;
  let deferredInstallPrompt = null;

  const state = {
    favorites: loadJSON('vsim_favorites', []),
  };

  function loadJSON(key, fallback) {
    try {
      const v = localStorageSafe.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorageSafe.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  // Guard localStorage for privacy-mode / restricted contexts
  const localStorageSafe = (() => {
    try {
      const k = '__vsim_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return window.localStorage;
    } catch (e) {
      const mem = {};
      return {
        getItem: (k) => (k in mem ? mem[k] : null),
        setItem: (k, v) => { mem[k] = v; },
        removeItem: (k) => { delete mem[k]; }
      };
    }
  })();

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------------- NAVIGATION ---------------- */
  function showScreen(name) {
    document.querySelectorAll('.screen.page').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
    const map = {
      home: 'screen-home', simulations: 'screen-simulations',
      favorites: 'screen-favorites', about: 'screen-about', sim: 'screen-sim'
    };
    const el = document.getElementById(map[name]);
    if (el) el.classList.add('active');

    const titleMap = {
      home: 'Virtual Simulations', simulations: 'All Simulations',
      favorites: 'Favorites', about: 'About', sim: currentSimId ? SIMS[currentSimId].title : ''
    };
    document.getElementById('topbar-title').textContent = titleMap[name] || 'Virtual Simulations';
    document.getElementById('btn-back').hidden = name !== 'sim';
    document.getElementById('btn-menu').hidden = name === 'sim';
    window.scrollTo(0, 0);

    if (name === 'favorites') renderFavorites();
    if (name === 'simulations') renderAllSims();
    if (name === 'home') renderHome();
  }

  function openSim(id) {
    currentSimId = id;
    const sim = SIMS[id];
    if (!sim) return;
    if (sim.status !== 'ready') {
      toast(`${sim.title} is coming in a future update.`);
      return;
    }
    SimEngine.mount(sim);
    showScreen('sim');
  }

  /* ---------------- DASHBOARD RENDERING ---------------- */
  function simCardHTML(sim) {
    const fav = state.favorites.includes(sim.id);
    const tag = sim.status === 'ready'
      ? `<span class="sim-card-tag tag-ready">● Ready</span>`
      : `<span class="sim-card-tag tag-soon">Coming soon</span>`;
    return `
    <div class="sim-card" data-open="${sim.id}">
      <button class="star-btn ${fav ? 'active' : ''}" data-fav="${sim.id}" aria-label="Favorite">★</button>
      <div class="sim-card-media" style="background:${sim.color}">${sim.icon}</div>
      <div class="sim-card-body">
        <div class="sim-card-title">${sim.title}</div>
        <div class="sim-card-desc">${sim.shortDesc}</div>
        ${tag}
      </div>
    </div>`;
  }

  function simRowHTML(sim) {
    return `
    <div class="sim-row" data-open="${sim.id}">
      <div class="sim-row-icon" style="background:${sim.color}">${sim.icon}</div>
      <div class="sim-row-body">
        <div class="sim-row-title">${sim.title}</div>
        <div class="sim-row-desc">${sim.shortDesc}</div>
      </div>
      <span class="chev">›</span>
    </div>`;
  }

  function renderHome() {
    const all = Object.values(SIMS);
    const ready = all.filter(s => s.status === 'ready');
    document.getElementById('stat-ready').textContent = ready.length;
    document.getElementById('stat-total').textContent = all.length;
    document.getElementById('grid-featured').innerHTML = ready.slice(0, 4).map(simCardHTML).join('');
    document.getElementById('list-preview').innerHTML = all.slice(4, 8).map(simRowHTML).join('');
    bindCardEvents();
  }

  let activeFilter = 'all';
  function renderAllSims() {
    const q = (document.getElementById('sim-search').value || '').toLowerCase();
    const all = Object.values(SIMS).filter(s => {
      const matchQ = s.title.toLowerCase().includes(q) || s.shortDesc.toLowerCase().includes(q);
      const matchF = activeFilter === 'all' || (activeFilter === 'ready' && s.status === 'ready') || (activeFilter === 'soon' && s.status !== 'ready');
      return matchQ && matchF;
    });
    document.getElementById('grid-all').innerHTML = all.map(simCardHTML).join('') || `<p class="empty-note">No simulations match your search.</p>`;
    bindCardEvents();
  }

  function renderFilterRow() {
    const filters = [['all', 'All'], ['ready', 'Ready'], ['soon', 'Coming soon']];
    document.getElementById('filter-row').innerHTML = filters.map(([k, l]) =>
      `<button class="filter-chip ${activeFilter === k ? 'active' : ''}" data-filter="${k}">${l}</button>`).join('');
    document.querySelectorAll('.filter-chip').forEach(b => b.onclick = () => {
      activeFilter = b.dataset.filter; renderFilterRow(); renderAllSims();
    });
  }

  function renderFavorites() {
    const favs = Object.values(SIMS).filter(s => state.favorites.includes(s.id));
    document.getElementById('grid-favorites').innerHTML = favs.map(simCardHTML).join('');
    document.getElementById('fav-empty').hidden = favs.length > 0;
    bindCardEvents();
  }

  function bindCardEvents() {
    document.querySelectorAll('[data-open]').forEach(el => {
      el.onclick = (e) => {
        if (e.target.closest('[data-fav]')) return;
        openSim(el.dataset.open);
      };
    });
    document.querySelectorAll('[data-fav]').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        const id = el.dataset.fav;
        const i = state.favorites.indexOf(id);
        if (i >= 0) state.favorites.splice(i, 1); else state.favorites.push(id);
        saveJSON('vsim_favorites', state.favorites);
        el.classList.toggle('active');
        if (document.getElementById('screen-favorites').classList.contains('active')) renderFavorites();
      };
    });
  }

  /* ---------------- GENERIC CONTROL RENDERER ---------------- */
  function renderControls(container, controlDefs, values, onChange) {
    container.innerHTML = controlDefs.map(c => {
      if (c.type === 'range') {
        return `
        <div class="control-group">
          <div class="control-label"><span>${c.label}</span><span class="val" id="val-${c.id}">${values[c.id]}${c.unit || ''}</span></div>
          <input type="range" id="ctl-${c.id}" min="${c.min}" max="${c.max}" step="${c.step}" value="${values[c.id]}">
        </div>`;
      }
      if (c.type === 'select') {
        return `
        <div class="control-group">
          <div class="control-label"><span>${c.label}</span></div>
          <div class="chip-select" id="ctl-${c.id}">
            ${c.options.map(o => `<button type="button" class="chip-opt ${values[c.id] === o.value ? 'active' : ''}" data-val="${o.value}">${o.label}</button>`).join('')}
          </div>
        </div>`;
      }
      return '';
    }).join('');

    controlDefs.forEach(c => {
      if (c.type === 'range') {
        const input = document.getElementById(`ctl-${c.id}`);
        input.oninput = () => {
          values[c.id] = parseFloat(input.value);
          document.getElementById(`val-${c.id}`).textContent = values[c.id] + (c.unit || '');
          onChange(c.id);
        };
      } else if (c.type === 'select') {
        const wrap = document.getElementById(`ctl-${c.id}`);
        wrap.querySelectorAll('.chip-opt').forEach(btn => {
          btn.onclick = () => {
            values[c.id] = btn.dataset.val;
            wrap.querySelectorAll('.chip-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            onChange(c.id);
          };
        });
      }
    });
  }

  /* ---------------- LIGHTWEIGHT CANVAS LINE CHART ---------------- */
  function drawLineChart(canvas, series, opts = {}) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const pad = { l: 46, r: 16, t: 18, b: 30 };
    const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;

    let allX = [], allY = [];
    series.forEach(s => s.points.forEach(p => { allX.push(p.x); allY.push(p.y); }));
    if (!allX.length) return;
    let minX = Math.min(...allX), maxX = Math.max(...allX);
    let minY = Math.min(0, ...allY), maxY = Math.max(...allY);
    if (maxX === minX) maxX = minX + 1;
    if (maxY === minY) maxY = minY + 1;
    maxY *= 1.12;

    const X = x => pad.l + ((x - minX) / (maxX - minX)) * plotW;
    const Y = y => pad.t + plotH - ((y - minY) / (maxY - minY)) * plotH;

    // grid
    ctx.strokeStyle = '#eef1f5';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8892a0';
    ctx.font = '10px Nunito Sans, sans-serif';
    for (let i = 0; i <= 4; i++) {
      const gy = pad.t + (plotH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(W - pad.r, gy); ctx.stroke();
      const val = maxY - (maxY - minY) / 4 * i;
      ctx.fillText(formatNum(val), 4, gy + 3);
    }
    for (let i = 0; i <= 4; i++) {
      const gx = pad.l + (plotW / 4) * i;
      const val = minX + (maxX - minX) / 4 * i;
      ctx.fillText(formatNum(val), gx - 8, H - 10);
    }

    // axis labels
    if (opts.xLabel) { ctx.fillStyle = '#556'; ctx.font = '10px Nunito Sans, sans-serif'; ctx.fillText(opts.xLabel, W - pad.r - opts.xLabel.length * 5, H - 2); }

    // series
    series.forEach(s => {
      ctx.strokeStyle = s.color; ctx.lineWidth = 2.4; ctx.beginPath();
      s.points.forEach((p, i) => { const x = X(p.x), y = Y(p.y); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
      ctx.stroke();
      ctx.fillStyle = s.color;
      s.points.forEach(p => { if (s.points.length < 60) { ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 2.6, 0, 7); ctx.fill(); } });
    });

    // legend
    let lx = pad.l;
    ctx.font = '11px Nunito Sans, sans-serif';
    series.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.fillRect(lx, 4, 9, 9);
      ctx.fillStyle = '#334';
      ctx.fillText(s.label, lx + 13, 12);
      lx += 13 + ctx.measureText(s.label).width + 16;
    });
  }
  function formatNum(n) {
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'k';
    if (Math.abs(n) < 10 && n % 1 !== 0) return n.toFixed(1);
    return Math.round(n).toString();
  }

  function exportCSV(filename, columns, rows) {
    if (!rows.length) { toast('No data to export yet.'); return; }
    const header = columns.map(c => c.label).join(',');
    const body = rows.map(r => columns.map(c => JSON.stringify(r[c.key] ?? '')).join(',')).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast('CSV downloaded.');
  }

  /* ---------------- INIT ---------------- */
  function init() {
    // splash
    setTimeout(() => {
      document.getElementById('screen-splash').classList.add('hide');
    }, 1600);

    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showScreen(el.dataset.nav);
      });
    });
    document.getElementById('btn-back').onclick = () => showScreen('home');
    document.getElementById('btn-menu').onclick = () => showScreen('simulations');
    document.getElementById('btn-info').onclick = () => showScreen('about');
    document.getElementById('sim-search').addEventListener('input', renderAllSims);

    renderFilterRow();
    renderHome();

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const btn = document.getElementById('btn-install');
      btn.hidden = false;
      btn.onclick = async () => {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        btn.hidden = true;
      };
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  return { init, showScreen, openSim, toast, renderControls, drawLineChart, exportCSV, localStorageSafe, saveJSON, loadJSON, get currentSimId() { return currentSimId; } };
})();

document.addEventListener('DOMContentLoaded', App.init);
