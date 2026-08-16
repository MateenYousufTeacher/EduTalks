/* ============================================================
   Virtual Simulations — App Shell
   Created by Dr. Mateen Yousuf, School Education Department Kashmir
   ============================================================ */

const App = (() => {

  const CATS = {}; // filled from SIMS
  const root = document.getElementById('app');
  let currentRoute = 'splash';

  /* ---------------- storage helpers ---------------- */
  const store = {
    get(key, def) {
      try {
        const v = localStorage.getItem('vsl:' + key);
        return v === null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set(key, val) {
      try { localStorage.setItem('vsl:' + key, JSON.stringify(val)); } catch (e) {}
    }
  };

  function favorites() { return store.get('favorites', []); }
  function toggleFavorite(id) {
    let f = favorites();
    f = f.includes(id) ? f.filter(x => x !== id) : [...f, id];
    store.set('favorites', f);
    return f.includes(id);
  }
  function history() { return store.get('history', []); }
  function logVisit(id) {
    let h = history().filter(x => x !== id);
    h.unshift(id);
    store.set('history', h.slice(0, 10));
  }
  function simScore(id) { return store.get('score:' + id, null); }
  function setSimScore(id, val) {
    const prev = simScore(id);
    if (!prev || val.pct >= prev.pct) store.set('score:' + id, val);
  }

  /* ---------------- toast ---------------- */
  let toastTimer;
  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast'; el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ---------------- small UI builders (used by sims) ---------------- */
  function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c === null || c === undefined || c === false) return;
      e.appendChild((c instanceof Node) ? c : document.createTextNode(String(c)));
    });
    return e;
  }

  function renderBars(container, data, opts = {}) {
    const max = opts.max || Math.max(1, ...data.map(d => d.value));
    container.innerHTML = '';
    const wrap = el('div', { class: 'bars' });
    data.forEach(d => {
      const h = Math.max(2, (d.value / max) * 120);
      const bar = el('div', { class: 'bar', style: `height:${h}px` }, [
        el('span', {}, opts.showVal === false ? '' : String(d.value))
      ]);
      wrap.appendChild(bar);
    });
    container.appendChild(wrap);
    const lbl = el('div', { class: 'lbl' });
    data.forEach(d => lbl.appendChild(el('span', {}, d.label)));
    container.appendChild(lbl);
  }

  function renderQuiz(container, title, questions, onDone) {
    container.innerHTML = '';
    container.appendChild(el('h4', {}, title || 'Check Your Understanding'));
    let correctCount = 0, answered = 0;
    questions.forEach((q, qi) => {
      const qwrap = el('div', { class: 'quiz-q' });
      qwrap.appendChild(el('p', {}, `${qi + 1}. ${q.q}`));
      q.options.forEach((opt, oi) => {
        const b = el('button', { class: 'quiz-opt' }, opt);
        b.addEventListener('click', () => {
          if (b.dataset.locked) return;
          [...qwrap.querySelectorAll('.quiz-opt')].forEach(x => x.dataset.locked = '1');
          answered++;
          if (oi === q.correct) { b.classList.add('correct'); correctCount++; }
          else {
            b.classList.add('wrong');
            qwrap.children[q.correct + 1]?.classList.add('correct');
          }
          if (q.explain) qwrap.appendChild(el('p', { class: 'note' }, q.explain));
          if (answered === questions.length) {
            const pct = Math.round((correctCount / questions.length) * 100);
            onDone && onDone(pct);
          }
        });
        qwrap.appendChild(b);
      });
      container.appendChild(qwrap);
    });
  }

  /* ---------------- routing ---------------- */
  function navigate(route, param) {
    currentRoute = route;
    document.body.classList.toggle('on-splash', route === 'splash');
    [...document.querySelectorAll('.nav-btn')].forEach(b => {
      b.classList.toggle('active', b.dataset.route === route);
    });
    window.scrollTo(0, 0);
    if (route === 'splash') return renderSplash();
    if (route === 'home') return renderHome();
    if (route === 'list') return renderList();
    if (route === 'favorites') return renderFavorites();
    if (route === 'about') return renderAbout();
    if (route === 'sim') return renderSim(param);
  }
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#/', '');
    const [route, param] = h.split('/');
    navigate(route || 'home', param);
  });

  function go(route, param) {
    location.hash = '#/' + route + (param ? '/' + param : '');
  }

  /* ---------------- screens ---------------- */
  function topbar(title, sub, opts = {}) {
    const bar = el('div', { class: 'topbar' });
    if (opts.back) {
      bar.appendChild(el('button', { class: 'icon-btn', onclick: () => history.length ? go('list') : go('list') }, '←'));
    } else {
      bar.appendChild(el('button', { class: 'icon-btn' }, '🧪'));
    }
    const t = el('div', {}, [el('h2', {}, title)]);
    if (sub) t.appendChild(el('div', { class: 'sub' }, sub));
    bar.appendChild(t);
    if (opts.right) bar.appendChild(opts.right);
    return bar;
  }

  function renderSplash() {
    root.innerHTML = '';
    root.appendChild(el('div', { class: 'splash' }, [
      el('div', { class: 'flask' }, '🧪'),
      el('h1', {}, ['Virtual ', el('span', { class: 'accent' }, 'Simulations')]),
      el('p', {}, '10 Interactive Economics Laboratories'),
      el('div', { class: 'loader' }, [el('i', {})]),
      el('div', { class: 'credit' }, ['Created by ', el('b', {}, 'Dr. Mateen Yousuf'), el('br'), 'Teacher, School Education Department Kashmir'])
    ]));
    setTimeout(() => go('home'), 1600);
  }

  function statCard(num, lbl) {
    return el('div', { class: 'stat-card' }, [el('div', { class: 'num' }, String(num)), el('div', { class: 'lbl' }, lbl)]);
  }

  function renderHome() {
    root.innerHTML = '';
    const completed = SIMS.filter(s => simScore(s.id)).length;
    const favCount = favorites().length;
    const avgArr = SIMS.map(s => simScore(s.id)?.pct).filter(x => x !== undefined && x !== null);
    const avg = avgArr.length ? Math.round(avgArr.reduce((a, b) => a + b, 0) / avgArr.length) : 0;

    const hero = el('div', { class: 'home-hero' }, [
      el('h1', {}, 'Virtual Simulations'),
      el('p', {}, 'Explore 10 hands-on economics laboratories — game theory, externalities, labour, production, market power, inequality and more.'),
      el('div', { class: 'creator' }, ['Created by ', el('b', {}, 'Dr. Mateen Yousuf'), ' · School Education Dept. Kashmir'])
    ]);
    root.appendChild(hero);

    const s1 = el('div', { class: 'section' });
    s1.appendChild(el('div', { class: 'grid2' }, [
      statCard(SIMS.length, 'Labs Available'),
      statCard(completed, 'Completed'),
      statCard(favCount, 'Favorites'),
      statCard(avg + '%', 'Avg. Score')
    ]));
    root.appendChild(s1);

    const s2 = el('div', { class: 'section' });
    s2.appendChild(el('h3', {}, 'Continue Exploring'));
    const hist = history().slice(0, 3).map(id => SIMS.find(s => s.id === id)).filter(Boolean);
    if (hist.length) {
      const list = el('div', { class: 'simlist' });
      hist.forEach(s => list.appendChild(simCardEl(s)));
      s2.appendChild(list);
    } else {
      s2.appendChild(el('div', { class: 'card' }, [el('p', { class: 'note', style: 'margin:0' }, 'Open a simulation to see it here for quick access.')]));
    }
    root.appendChild(s2);

    const s3 = el('div', { class: 'section' });
    s3.appendChild(el('h3', {}, 'Jump In'));
    const actions = el('div', { class: 'dash-actions' });
    const mk = (label, iconPath, route) => {
      const b = el('div', { class: 'dash-btn', onclick: () => go(route) }, [
        el('svg', { viewBox: '0 0 24 24', html: iconPath }),
        el('span', {}, label)
      ]);
      return b;
    };
    actions.appendChild(mk('All Simulations', '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', 'list'));
    actions.appendChild(mk('Favorites', '<path d="M12 20s-7-4.35-9.5-8.5C.7 8 2 4.5 5.5 4.5c2 0 3.5 1.2 4.5 2.8C11 5.7 12.5 4.5 14.5 4.5 18 4.5 19.3 8 19.5 11.5 17 15.65 12 20 12 20Z"/>', 'favorites'));
    actions.appendChild(mk('About Creator', '<circle cx="12" cy="8" r="3.6"/><path d="M4 20c0-3.9 3.6-6 8-6s8 2.1 8 6"/>', 'about'));
    actions.appendChild(mk('Random Lab', '<path d="M4 4h4l3 5 3-5h4M4 20h4l3-5 3 5h4M4 12h16"/>', ''));
    actions.children[3].onclick = () => go('sim', SIMS[Math.floor(Math.random() * SIMS.length)].id);
    s3.appendChild(actions);
    root.appendChild(s3);
  }

  function simCardEl(s) {
    const isFav = favorites().includes(s.id);
    const score = simScore(s.id);
    const card = el('div', { class: 'simcard', onclick: () => go('sim', s.id) }, [
      el('div', { class: 'ic', style: `background:${s.color}` }, s.icon),
      el('div', { class: 'body' }, [
        el('h4', {}, [s.title, score ? el('span', { class: 'badge' }, score.pct + '%') : null]),
        el('div', { class: 'cat' }, s.category),
        el('p', {}, s.tagline)
      ]),
      el('button', { class: 'fav' + (isFav ? ' active' : ''), onclick: (e) => { e.stopPropagation(); const nf = toggleFavorite(s.id); e.currentTarget.classList.toggle('active', nf); toast(nf ? 'Added to favorites' : 'Removed from favorites'); } },
        el('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, el('path', { d: 'M12 21s-7-4.35-9.5-8.5C.7 8 2 4.5 5.5 4.5c2 0 3.5 1.2 4.5 2.8C11 5.7 12.5 4.5 14.5 4.5 18 4.5 19.3 8 19.5 11.5 17 16.65 12 21 12 21Z' }))
      )
    ]);
    return card;
  }

  function renderList(filterCat) {
    root.innerHTML = '';
    root.appendChild(topbar('All Simulations', SIMS.length + ' economics labs'));
    const search = el('div', { class: 'searchbar' }, [
      el('span', {}, '🔍'),
      el('input', { type: 'text', placeholder: 'Search simulations…', oninput: (e) => renderListBody(e.target.value, activeCat) })
    ]);
    root.appendChild(search);

    let activeCat = filterCat || 'All';
    const cats = ['All', ...new Set(SIMS.map(s => s.category))];
    const chipRow = el('div', { class: 'chiprow' });
    cats.forEach(c => {
      const chip = el('button', { class: 'chip' + (c === activeCat ? ' active' : '') }, c);
      chip.addEventListener('click', () => {
        activeCat = c;
        [...chipRow.children].forEach(x => x.classList.remove('active'));
        chip.classList.add('active');
        renderListBody(search.querySelector('input').value, activeCat);
      });
      chipRow.appendChild(chip);
    });
    root.appendChild(chipRow);

    const listWrap = el('div', { class: 'simlist' });
    root.appendChild(listWrap);

    function renderListBody(query, cat) {
      listWrap.innerHTML = '';
      const q = (query || '').toLowerCase();
      const filtered = SIMS.filter(s =>
        (cat === 'All' || s.category === cat) &&
        (s.title.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q) || s.category.toLowerCase().includes(q))
      );
      if (!filtered.length) {
        listWrap.appendChild(el('div', { class: 'empty' }, 'No simulations match your search.'));
        return;
      }
      filtered.forEach(s => listWrap.appendChild(simCardEl(s)));
    }
    renderListBody('', activeCat);
  }

  function renderFavorites() {
    root.innerHTML = '';
    root.appendChild(topbar('Favorites', 'Your saved simulations'));
    const favs = favorites().map(id => SIMS.find(s => s.id === id)).filter(Boolean);
    const wrap = el('div', { class: 'simlist' });
    if (!favs.length) {
      wrap.appendChild(el('div', { class: 'empty' }, [
        el('div', {}, '⭐'),
        el('p', {}, 'No favorites yet. Tap the star on any simulation to save it here.')
      ]));
    } else {
      favs.forEach(s => wrap.appendChild(simCardEl(s)));
    }
    root.appendChild(wrap);
  }

  function renderAbout() {
    root.innerHTML = '';
    root.appendChild(topbar('About', 'Virtual Simulations Lab'));
    root.appendChild(el('div', { class: 'about-hero' }, [
      el('img', { src: 'icons/creator.jpeg', alt: 'Dr. Mateen Yousuf' }),
      el('h3', {}, 'Dr. Mateen Yousuf'),
      el('p', {}, 'Teacher, School Education Department Kashmir')
    ]));
    const sec = el('div', { class: 'section' });
    sec.appendChild(el('div', { class: 'card' }, [
      el('h4', {}, 'About This Lab'),
      el('p', { class: 'note' }, 'Virtual Simulations is a set of 10 interactive economics laboratories covering Game Theory, Externalities, Public Goods, Labour Economics, Production, Cost Accounting, Market Structures, Inequality, Unemployment and Economic Development. Every simulation runs fully offline and works on phones, tablets, and desktops.')
    ]));
    sec.appendChild(el('div', { class: 'card' }, [
      el('h4', {}, 'Data & Privacy'),
      el('p', { class: 'note' }, 'All progress, scores and favorites are stored only on this device using local storage. Nothing is uploaded anywhere.')
    ]));
    const resetBtn = el('button', { class: 'btn btn-tertiary block', onclick: () => {
      if (confirm('Reset all progress, scores and favorites?')) {
        Object.keys(localStorage).filter(k => k.startsWith('vsl:')).forEach(k => localStorage.removeItem(k));
        toast('Progress reset');
        go('home');
      }
    } }, 'Reset All Progress');
    sec.appendChild(resetBtn);
    root.appendChild(sec);
  }

  function renderSim(id) {
    const s = SIMS.find(x => x.id === id);
    root.innerHTML = '';
    if (!s) { root.appendChild(el('div', { class: 'empty' }, 'Simulation not found.')); return; }
    logVisit(id);
    const head = el('div', { class: 'simhead' }, [
      el('button', { class: 'icon-btn', style: 'margin-bottom:10px', onclick: () => go('list') }, '←'),
      el('div', { class: 'tag' }, s.category),
      el('h2', {}, s.title),
      el('p', {}, s.tagline)
    ]);
    root.appendChild(head);
    const body = el('div', { class: 'simbody' });
    root.appendChild(body);

    const ctx = {
      toast, el, renderBars, renderQuiz,
      saveScore: (val) => { setSimScore(id, val); toast('Progress saved'); },
      bestScore: () => simScore(id)
    };
    try {
      s.mount(body, ctx);
    } catch (err) {
      console.error(err);
      body.appendChild(el('div', { class: 'card' }, 'This simulation hit an error: ' + err.message));
    }
  }

  /* ---------------- init ---------------- */
  function init() {
    [...document.querySelectorAll('.nav-btn')].forEach(b => {
      b.addEventListener('click', () => go(b.dataset.route));
    });
    const h = location.hash.replace('#/', '');
    if (!h) { navigate('splash'); }
    else { const [route, param] = h.split('/'); navigate(route, param); }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { go, toast, store };
})();
