'use strict';
const SIMS = {};

const App = {
  root: null,
  navStack: [],

  init() {
    this.root = document.getElementById('appRoot');
    this.applyTheme(Store.get('theme', 'light'));
    Profile.touchStreak();
    this.renderSplash();
  },

  navigate(view, param) {
    window.scrollTo(0, 0);
    if (this._destroyCurrent) { this._destroyCurrent(); this._destroyCurrent = null; }
    document.getElementById('mainNav').style.display = (view === 'splash') ? 'none' : 'flex';
    if (view === 'splash') return this.renderSplash();
    if (view === 'home') return this.renderHome();
    if (view === 'glossary') return this.renderGlossary();
    if (view === 'handbook') return this.renderHandbook();
    if (view === 'resources') return this.renderResources();
    if (view === 'quizcentre') return this.renderQuizCentre();
    if (view === 'achievements') return this.renderAchievements();
    if (view === 'bookmarks') return this.renderBookmarks();
    if (view === 'settings') return this.renderSettings();
    if (view === 'developer') return this.renderDeveloper();
    if (view === 'sim') return this.renderSim(param);
  },

  applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    Store.set('theme', t);
  },

  refreshHeaderStats() {
    const bar = document.getElementById('headerStats');
    if (!bar) return;
    const p = Profile.data();
    bar.innerHTML = '';
    bar.append(
      el('span', { class: 'stat-chip' }, `⭐ ${p.xp} XP`),
      el('span', { class: 'stat-chip' }, `🌱 ${p.ecoPoints} Eco Pts`),
      el('span', { class: 'stat-chip' }, `🔥 ${p.streak}d streak`),
      el('span', { class: 'stat-chip rank' }, Profile.rank())
    );
  },

  /* ===================== SPLASH / TITLE SCREEN ===================== */
  renderSplash() {
    this.root.innerHTML = '';
    const wrap = el('div', { class: 'splash' });
    wrap.appendChild(el('div', { class: 'splash-bg' }));
    const card = el('div', { class: 'splash-card' }, [
      el('div', { class: 'splash-eyebrow' }, 'OFFLINE PROGRESSIVE WEB APP · CLASSES VI–XII'),
      el('h1', { class: 'splash-title' }, ['Virtual Environmental', el('br'), 'Science Laboratory']),
      el('p', { class: 'splash-subtitle' }, 'Explore Nature Through Interactive Virtual Simulations'),
      el('div', { class: 'splash-dev' }, [
        el('img', { src: 'assets/developer.jpg', class: 'splash-dev-photo', alt: 'Dr. Mateen Yousuf' }),
        el('div', {}, [
          el('p', { class: 'splash-dev-label' }, 'Created & Developed by'),
          el('h3', { class: 'splash-dev-name' }, 'Dr. Mateen Yousuf'),
          el('p', { class: 'splash-dev-role' }, ['Teacher, School Education Department', el('br'), 'Kashmir'])
        ])
      ]),
      el('button', { class: 'btn-primary btn-enter', onclick: () => this.navigate('home') }, 'Enter the Laboratory →')
    ]);
    wrap.appendChild(card);
    this.root.appendChild(wrap);
  },

  /* ===================== HOME DASHBOARD ===================== */
  renderHome() {
    this.root.innerHTML = '';
    this.refreshHeaderStats();
    const p = Profile.data();
    const completedCount = Object.keys(p.completed).length;

    const hero = el('section', { class: 'hero-banner' }, [
      el('div', {}, [
        el('h1', {}, 'Virtual Environmental Science Laboratory'),
        el('p', {}, 'Investigate Earth\'s natural systems through 10 fully interactive simulations — adjust real variables, log data, and see the consequences unfold.')
      ]),
      el('div', { class: 'hero-progress' }, [
        el('div', { class: 'ring-wrap' }, [this.progressRing(completedCount, SIM_ORDER.length)]),
        el('span', {}, `${completedCount}/${SIM_ORDER.length} Labs Completed`)
      ])
    ]);

    const search = el('input', {
      class: 'search-input', placeholder: '🔍 Search simulations, e.g. "carbon", "waste", "energy"...',
      oninput: (e) => this.filterSims(e.target.value)
    });

    const quickRow = el('div', { class: 'quick-row' }, [
      this.quickCard('📖 Glossary', () => this.navigate('glossary')),
      this.quickCard('📘 Handbook', () => this.navigate('handbook')),
      this.quickCard('🌍 Resource Library', () => this.navigate('resources')),
      this.quickCard('📝 Quiz Centre', () => this.navigate('quizcentre')),
      this.quickCard('🏆 Achievements', () => this.navigate('achievements')),
      this.quickCard('⭐ Bookmarks', () => this.navigate('bookmarks')),
      this.quickCard('⚙️ Settings', () => this.navigate('settings')),
      this.quickCard('👤 About Developer', () => this.navigate('developer'))
    ]);

    const grid = el('div', { class: 'sim-grid', id: 'simGrid' });
    SIM_ORDER.forEach(id => grid.appendChild(this.simCard(id)));

    const sustMeter = this.sustainabilityMeter();

    this.root.append(hero, sustMeter, search, quickRow, el('h2', { class: 'section-title' }, '10 Premium Environmental Simulations'), grid);
  },

  progressRing(done, total) {
    const pct = total ? done / total : 0;
    const r = 26, c = 2 * Math.PI * r;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 64 64'); svg.setAttribute('width', 64); svg.setAttribute('height', 64);
    const bg = document.createElementNS(svgNS, 'circle');
    bg.setAttribute('cx', 32); bg.setAttribute('cy', 32); bg.setAttribute('r', r);
    bg.setAttribute('stroke', 'rgba(255,255,255,0.3)'); bg.setAttribute('stroke-width', 6); bg.setAttribute('fill', 'none');
    const fg = document.createElementNS(svgNS, 'circle');
    fg.setAttribute('cx', 32); fg.setAttribute('cy', 32); fg.setAttribute('r', r);
    fg.setAttribute('stroke', '#FFB300'); fg.setAttribute('stroke-width', 6); fg.setAttribute('fill', 'none');
    fg.setAttribute('stroke-dasharray', c); fg.setAttribute('stroke-dashoffset', c * (1 - pct));
    fg.setAttribute('stroke-linecap', 'round'); fg.setAttribute('transform', 'rotate(-90 32 32)');
    svg.append(bg, fg);
    return svg;
  },

  sustainabilityMeter() {
    const p = Profile.data();
    let totalScore = 0, count = 0;
    Object.keys(p.completed).forEach(() => { totalScore += 70; count++; });
    const meterVal = clamp(20 + p.xp / 15, 0, 100);
    return el('div', { class: 'sustainability-meter' }, [
      el('div', { class: 'sm-label' }, [el('span', {}, '🌎 Sustainability Meter'), el('span', {}, fmt(meterVal, 0) + '%')]),
      el('div', { class: 'sm-track' }, [el('div', { class: 'sm-fill', style: `width:${meterVal}%` })]),
      el('p', { class: 'sm-hint' }, 'Rises as you explore simulations, complete quizzes and finish eco challenges.')
    ]);
  },

  quickCard(label, onclick) {
    return el('button', { class: 'quick-card', onclick }, label);
  },

  simCard(id) {
    const meta = SIM_META[id];
    const p = Profile.data();
    const done = !!p.completed[id];
    const bookmarked = p.bookmarks.includes(id);
    const card = el('div', { class: 'sim-card', style: `--accent:${meta.color}` }, [
      el('div', { class: 'sim-card-top' }, [
        el('span', { class: 'sim-card-icon' }, meta.icon),
        el('button', { class: 'bookmark-btn' + (bookmarked ? ' active' : ''), onclick: (e) => { e.stopPropagation(); this.toggleBookmark(id); } }, bookmarked ? '★' : '☆')
      ]),
      el('h3', {}, meta.title),
      el('span', { class: 'sim-card-tag' }, meta.tag),
      done ? el('span', { class: 'sim-card-done' }, '✓ Completed') : null
    ]);
    card.addEventListener('click', () => this.navigate('sim', id));
    return card;
  },

  toggleBookmark(id) {
    const p = Profile.data();
    const i = p.bookmarks.indexOf(id);
    if (i >= 0) p.bookmarks.splice(i, 1); else p.bookmarks.push(id);
    Profile.save(p);
    this.renderHome();
  },

  filterSims(q) {
    q = q.toLowerCase();
    document.querySelectorAll('.sim-card').forEach((card, i) => {
      const id = SIM_ORDER[i];
      const meta = SIM_META[id];
      const match = meta.title.toLowerCase().includes(q) || meta.tag.toLowerCase().includes(q);
      card.style.display = match ? '' : 'none';
    });
  },

  renderSim(id) {
    this.root.innerHTML = '';
    const container = el('div', { class: 'sim-page' });
    this.root.appendChild(container);
    const instance = renderSimulation(container, SIMS[id]);
    this._destroyCurrent = instance.destroy;
  },

  /* ===================== GLOSSARY ===================== */
  renderGlossary() {
    this.root.innerHTML = '';
    const wrap = el('div', { class: 'page' });
    wrap.appendChild(this.pageHeader('📖 Illustrated Glossary', 'Search, browse, and cross-link key environmental science terms.'));
    const search = el('input', { class: 'search-input', placeholder: '🔍 Search glossary...' });
    const alphaBar = el('div', { class: 'alpha-bar' });
    const list = el('div', { class: 'glossary-list' });

    function renderList(filter) {
      list.innerHTML = '';
      GLOSSARY.filter(g => !filter || g.term.toLowerCase().includes(filter.toLowerCase()) || g.def.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => a.term.localeCompare(b.term))
        .forEach(g => {
          list.appendChild(el('div', { class: 'glossary-item', id: 'g-' + g.term[0].toLowerCase() }, [
            el('h3', {}, g.term),
            el('p', {}, g.def),
            el('p', { class: 'glossary-example' }, '💬 ' + g.example)
          ]));
        });
    }
    search.addEventListener('input', (e) => renderList(e.target.value));
    'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch => {
      alphaBar.appendChild(el('a', { href: '#g-' + ch, class: 'alpha-link' }, ch.toUpperCase()));
    });
    renderList('');
    wrap.append(search, alphaBar, list);
    this.root.appendChild(wrap);
  },

  /* ===================== HANDBOOK ===================== */
  renderHandbook() {
    this.root.innerHTML = '';
    const wrap = el('div', { class: 'page' });
    wrap.appendChild(this.pageHeader('📘 Environmental Handbook', 'Core reference material aligned with the curriculum.'));
    HANDBOOK.forEach(sec => {
      wrap.appendChild(el('details', { class: 'handbook-item' }, [
        el('summary', {}, sec.title),
        el('p', {}, sec.body)
      ]));
    });
    this.root.appendChild(wrap);
  },

  /* ===================== RESOURCE LIBRARY ===================== */
  renderResources() {
    this.root.innerHTML = '';
    const wrap = el('div', { class: 'page' });
    wrap.appendChild(this.pageHeader('🌍 Interactive Resource Library', 'National parks, biosphere reserves, species, technologies and global agreements.'));
    const search = el('input', { class: 'search-input', placeholder: '🔍 Search resources...' });
    const list = el('div', { class: 'resource-list' });
    function renderList(filter) {
      list.innerHTML = '';
      const cats = {};
      RESOURCES.filter(r => !filter || r.name.toLowerCase().includes(filter.toLowerCase()) || r.category.toLowerCase().includes(filter.toLowerCase()))
        .forEach(r => { (cats[r.category] = cats[r.category] || []).push(r); });
      Object.entries(cats).forEach(([cat, items]) => {
        list.appendChild(el('h3', { class: 'resource-cat' }, cat));
        items.forEach(r => list.appendChild(el('div', { class: 'resource-item' }, [
          el('strong', {}, r.name), el('p', {}, r.info)
        ])));
      });
    }
    search.addEventListener('input', e => renderList(e.target.value));
    renderList('');
    wrap.append(search, list);
    this.root.appendChild(wrap);
  },

  /* ===================== QUIZ CENTRE ===================== */
  renderQuizCentre() {
    this.root.innerHTML = '';
    const wrap = el('div', { class: 'page' });
    wrap.appendChild(this.pageHeader('📝 Quiz Centre', 'Review your quiz performance across all simulations.'));
    const p = Profile.data();
    const grid = el('div', { class: 'quizcentre-grid' });
    SIM_ORDER.forEach(id => {
      const meta = SIM_META[id];
      const score = p.quizScores[id];
      const total = SIMS[id].quiz.length;
      grid.appendChild(el('div', { class: 'quizcentre-card', onclick: () => this.navigate('sim', id) }, [
        el('span', { class: 'sim-card-icon' }, meta.icon),
        el('h4', {}, meta.title),
        el('p', {}, score != null ? `Score: ${score} / ${total}` : 'Not attempted yet')
      ]));
    });
    wrap.appendChild(grid);
    this.root.appendChild(wrap);
  },

  /* ===================== ACHIEVEMENTS ===================== */
  renderAchievements() {
    this.root.innerHTML = '';
    const wrap = el('div', { class: 'page' });
    wrap.appendChild(this.pageHeader('🏆 Achievements & Progress', `Rank: ${Profile.rank()}`));
    const p = Profile.data();
    wrap.appendChild(el('div', { class: 'stat-grid' }, [
      el('div', { class: 'stat-box' }, [el('h3', {}, p.xp), el('p', {}, 'Total XP')]),
      el('div', { class: 'stat-box' }, [el('h3', {}, p.ecoPoints), el('p', {}, 'Eco Points')]),
      el('div', { class: 'stat-box' }, [el('h3', {}, p.streak), el('p', {}, 'Day Streak')]),
      el('div', { class: 'stat-box' }, [el('h3', {}, Object.keys(p.completed).length + '/10'), el('p', {}, 'Labs Completed')])
    ]));
    const badgeGrid = el('div', { class: 'badge-grid' });
    const allBadges = [
      ...SIM_ORDER.map(id => ({ id: 'complete_' + id, label: 'Completed ' + SIM_META[id].title, icon: SIM_META[id].icon })),
      ...SIM_ORDER.map(id => ({ id: 'quiz_perfect_' + id, label: 'Perfect Quiz: ' + SIM_META[id].title, icon: '💯' }))
    ];
    allBadges.forEach(b => {
      const unlocked = p.achievements.includes(b.id);
      badgeGrid.appendChild(el('div', { class: 'badge' + (unlocked ? ' unlocked' : '') }, [
        el('span', { class: 'badge-icon' }, unlocked ? b.icon : '🔒'),
        el('span', {}, b.label)
      ]));
    });
    wrap.appendChild(el('h2', { class: 'section-title' }, 'Badges'));
    wrap.appendChild(badgeGrid);
    this.root.appendChild(wrap);
  },

  /* ===================== BOOKMARKS ===================== */
  renderBookmarks() {
    this.root.innerHTML = '';
    const wrap = el('div', { class: 'page' });
    wrap.appendChild(this.pageHeader('⭐ Bookmarks', 'Your saved simulations for quick access.'));
    const p = Profile.data();
    if (!p.bookmarks.length) {
      wrap.appendChild(el('p', { class: 'hint' }, 'You haven\'t bookmarked any simulations yet. Tap the star on a simulation card to save it here.'));
    } else {
      const grid = el('div', { class: 'sim-grid' });
      p.bookmarks.forEach(id => grid.appendChild(this.simCard(id)));
      wrap.appendChild(grid);
    }
    this.root.appendChild(wrap);
  },

  /* ===================== SETTINGS ===================== */
  renderSettings() {
    this.root.innerHTML = '';
    const wrap = el('div', { class: 'page' });
    wrap.appendChild(this.pageHeader('⚙️ Settings', 'Customize your lab experience.'));
    const theme = Store.get('theme', 'light');
    wrap.appendChild(el('div', { class: 'settings-row' }, [
      el('span', {}, '🌗 Theme'),
      el('div', { class: 'toggle-group' }, [
        el('button', { class: 'toggle-btn' + (theme === 'light' ? ' active' : ''), onclick: () => { this.applyTheme('light'); this.renderSettings(); } }, 'Light'),
        el('button', { class: 'toggle-btn' + (theme === 'dark' ? ' active' : ''), onclick: () => { this.applyTheme('dark'); this.renderSettings(); } }, 'Dark')
      ])
    ]));
    wrap.appendChild(el('div', { class: 'settings-row' }, [
      el('span', {}, '🗑️ Reset all progress'),
      el('button', { class: 'btn-danger', onclick: () => {
        if (confirm('This will erase all XP, achievements, bookmarks and quiz scores. Continue?')) {
          Store.set('profile', undefined);
          localStorage.removeItem('evlab_profile');
          Toast.show('Progress reset', 'info');
          this.navigate('home');
        }
      } }, 'Reset Progress')
    ]));
    wrap.appendChild(el('div', { class: 'settings-row' }, [
      el('span', {}, '📱 Install this app'),
      el('button', { class: 'btn-primary', onclick: () => { if (window.deferredInstallPrompt) { window.deferredInstallPrompt.prompt(); } else { Toast.show('Use your browser menu → "Install app" / "Add to Home Screen"', 'info'); } } }, 'Install PWA')
    ]));
    this.root.appendChild(wrap);
  },

  /* ===================== DEVELOPER PAGE ===================== */
  renderDeveloper() {
    this.root.innerHTML = '';
    const wrap = el('div', { class: 'page developer-page' });
    wrap.appendChild(el('div', { class: 'dev-hero' }, [
      el('img', { src: 'assets/developer.jpg', class: 'dev-photo', alt: 'Dr. Mateen Yousuf' }),
      el('div', {}, [
        el('h1', {}, 'Virtual Environmental Science Laboratory'),
        el('p', { class: 'dev-created' }, 'Created by'),
        el('h2', {}, 'Dr. Mateen Yousuf'),
        el('p', {}, ['Teacher, School Education Department', el('br'), 'Kashmir'])
      ])
    ]));
    wrap.appendChild(el('div', { class: 'richtext' }, [
      el('h3', {}, 'Vision for Environmental Education'),
      el('p', {}, 'This laboratory was built to make environmental science tangible for students — turning abstract cycles and global challenges into hands-on, inquiry-driven experiments that build genuine scientific thinking and environmental responsibility.'),
      el('h3', {}, 'Guiding Principles'),
      el('ul', {}, [
        el('li', {}, 'Experiential and inquiry-based learning over passive reading'),
        el('li', {}, 'Competency-Based Learning aligned with NEP 2020'),
        el('li', {}, 'Climate literacy and sustainability education'),
        el('li', {}, 'Scientific temper and evidence-based reasoning'),
        el('li', {}, 'Responsible citizenship and environmental stewardship')
      ])
    ]));
    this.root.appendChild(wrap);
  },

  pageHeader(title, sub) {
    return el('div', { class: 'page-header' }, [
      el('button', { class: 'btn-ghost back-btn', onclick: () => this.navigate('home') }, '← Home'),
      el('h1', {}, title),
      el('p', {}, sub)
    ]);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredInstallPrompt = e;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
