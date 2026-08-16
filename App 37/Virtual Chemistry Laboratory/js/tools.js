/* ============================================================
   TOOL VIEWS — Periodic Table / Handbook / Glossary / About / Settings
   ============================================================ */

window.Tools = {};

function toolHeader(title, icon){
  return `<div class="sim-header">
    <div class="back-btn" id="toolBack">← Back</div>
    <h1>${title}</h1>
  </div>`;
}
function bindBack(container){
  container.querySelector('#toolBack').addEventListener('click', ()=>App.goHome());
}

/* ---------------- PERIODIC TABLE (reference) ---------------- */
window.Tools['periodic-table'] = function(container){
  container.innerHTML = toolHeader('Periodic Table Reference') + `
    <div class="card" style="padding:18px;margin-bottom:16px">
      <input type="text" id="refSearch" placeholder="Search element name or symbol…" style="margin-bottom:14px"/>
      <div class="pt-grid" id="refGrid" style="overflow-x:auto"></div>
      <div class="pt-legend">${Object.keys(CATEGORY_LABELS).map(c=>`<span><i style="background:${CATEGORY_COLORS[c]}"></i>${CATEGORY_LABELS[c]}</span>`).join('')}</div>
    </div>
    <div class="card" style="padding:18px" id="refDetail"><div class="empty-state">${ICONS.grid}<p>Click any element for full details</p></div></div>
  `;
  bindBack(container);

  function gridPos(e){
    if(e.group===0){ const idx = e.category==='lanthanide' ? e.z-57 : e.z-89; return {row:e.category==='lanthanide'?9:10, col:idx+3}; }
    return {row:e.period, col:e.group};
  }
  function draw(filterText){
    const grid = container.querySelector('#refGrid');
    grid.innerHTML = ELEMENTS.map(e=>{
      const {row,col} = gridPos(e);
      const dim = filterText && !(e.name.toLowerCase().includes(filterText)||e.symbol.toLowerCase()===filterText);
      return `<div class="pt-cell ${dim?'dim':''}" data-z="${e.z}" style="grid-row:${row};grid-column:${col};background:${CATEGORY_COLORS[e.category]}">
        <span class="z">${e.z}</span><span class="sym">${e.symbol}</span></div>`;
    }).join('');
    grid.querySelectorAll('.pt-cell').forEach(cell=>{
      cell.addEventListener('click', ()=>{
        const e = ELEMENTS_BY_Z[+cell.dataset.z];
        container.querySelector('#refDetail').innerHTML = `
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">
            <div style="width:64px;height:64px;border-radius:16px;background:${CATEGORY_COLORS[e.category]};color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:24px">${e.symbol}</div>
            <div><div style="font-family:var(--font-display);font-weight:800;font-size:22px">${e.name}</div>
            <div class="text-sm" style="color:var(--text-muted)">${CATEGORY_LABELS[e.category]} · Period ${e.period}${e.group?' · Group '+e.group:''}</div></div>
          </div>
          <table class="obs-table"><tbody>
            <tr><th>Atomic number</th><td>${e.z}</td></tr>
            <tr><th>Atomic mass</th><td>${e.mass} u</td></tr>
            <tr><th>Electron shells</th><td>${e.shells.join(', ')}</td></tr>
          </tbody></table>`;
      });
    });
  }
  draw('');
  container.querySelector('#refSearch').addEventListener('input', e=>draw(e.target.value.trim().toLowerCase()));
};

/* ---------------- HANDBOOK ---------------- */
window.Tools.handbook = function(container){
  const sections = [
    {title:'Important Formulas', icon:ICONS.book, items:[
      'Moles = Mass (g) / Molar Mass (g/mol)', 'Concentration (mol/L) = Moles of solute / Volume of solution (L)',
      'Density = Mass / Volume', '% Composition = (Mass of element / Molar mass of compound) × 100',
    ]},
    {title:'Common Chemical Equations', icon:ICONS.reaction, items:[
      'CaCO₃ → CaO + CO₂ (thermal decomposition of limestone)', 'Zn + 2HCl → ZnCl₂ + H₂ (metal-acid reaction)',
      'CH₄ + 2O₂ → CO₂ + 2H₂O (combustion of methane)', 'NaOH + HCl → NaCl + H₂O (neutralisation)',
    ]},
    {title:'SI Units', icon:ICONS.scale, items:[
      'Mass — kilogram (kg)', 'Volume — cubic metre (m³), commonly litre (L) in the lab',
      'Temperature — kelvin (K), commonly °C in the lab', 'Amount of substance — mole (mol)',
    ]},
    {title:'Laboratory Apparatus Guide', icon:ICONS.flask, items:[
      'Beaker — general mixing and heating, approximate volume only', 'Burette — precise, variable volume delivery (titration)',
      'Pipette — precise, fixed volume transfer', 'Conical flask — swirling/mixing during titration', 'Condenser — cools vapour back to liquid in distillation',
    ]},
    {title:'Common Indicators', icon:ICONS.flask, items:[
      'Litmus — red in acid, blue in base', 'Phenolphthalein — colourless in acid, pink in base',
      'Methyl orange — red in acid, yellow in base', 'Universal indicator — full colour spectrum matching pH 0–14',
    ]},
    {title:'Gas Tests', icon:ICONS.bolt, items:[
      'Hydrogen — burns with a "pop" sound near a lit splint', 'Oxygen — relights a glowing splint',
      'Carbon dioxide — turns limewater milky/cloudy', 'Ammonia — turns damp red litmus paper blue; pungent smell',
      'Chlorine — bleaches damp litmus paper; pungent smell',
    ]},
    {title:'Solubility Rules (general)', icon:ICONS.filter, items:[
      'All nitrates are soluble.', 'Most chlorides are soluble, except AgCl, PbCl₂.',
      'Most sulfates are soluble, except BaSO₄, PbSO₄.', 'Most carbonates are insoluble, except Group 1 carbonates and ammonium carbonate.',
    ]},
    {title:'Reactivity Series (most → least reactive)', icon:ICONS.metal, items:[
      'Potassium, Sodium, Calcium, Magnesium, Aluminium, Zinc, Iron, Tin, Lead, (Hydrogen), Copper, Silver, Gold',
    ]},
    {title:'Safety Symbols', icon:ICONS.warn, items:[
      '☠ Toxic — can cause serious harm or death if swallowed/inhaled', '🔥 Flammable — catches fire easily',
      '⚠ Irritant/Harmful — causes irritation to skin, eyes or lungs', '☣ Corrosive — attacks and destroys living tissue',
      '💥 Explosive — may explode with shock, friction, fire or heat', '🌍 Environmental hazard — dangerous to aquatic life or ecosystems',
    ]},
  ];
  container.innerHTML = toolHeader('Chemistry Formula Handbook') +
    sections.map((s,i)=>`
      <div class="card" style="padding:0;margin-bottom:12px;overflow:hidden">
        <div class="handbook-head" data-i="${i}" style="display:flex;align-items:center;gap:10px;padding:16px 18px;cursor:pointer">
          <span style="color:var(--primary-blue)">${s.icon}</span><h3 style="margin:0;flex:1">${s.title}</h3><span style="color:var(--text-muted)">▾</span>
        </div>
        <div class="handbook-body hidden" data-body="${i}" style="padding:0 18px 16px 18px">
          <ul class="styled">${s.items.map(it=>`<li>${it}</li>`).join('')}</ul>
        </div>
      </div>`).join('');
  bindBack(container);
  container.querySelectorAll('.handbook-head').forEach(h=>{
    h.addEventListener('click', ()=>{
      container.querySelector(`[data-body="${h.dataset.i}"]`).classList.toggle('hidden');
    });
  });
};

/* ---------------- GLOSSARY ---------------- */
window.Tools.glossary = function(container){
  const TERMS = [
    ['Atom','The smallest unit of an element that retains its chemical properties.'],
    ['Ion','An atom or group of atoms with a net electric charge, from losing or gaining electrons.'],
    ['Isotope','Atoms of the same element with the same number of protons but different numbers of neutrons.'],
    ['Molecule','Two or more atoms chemically bonded together.'],
    ['Bond','The force of attraction holding atoms together in a compound.'],
    ['Acid','A substance that releases H⁺ ions in solution and has a pH below 7.'],
    ['Base','A substance that releases OH⁻ ions in solution and has a pH above 7.'],
    ['pH','A logarithmic scale (0–14) measuring the acidity or basicity of a solution.'],
    ['Precipitate','An insoluble solid that forms and separates from a solution during a reaction.'],
    ['Catalyst','A substance that speeds up a reaction without being consumed by it.'],
    ['Electrolysis','The use of electric current to drive a non-spontaneous chemical reaction.'],
    ['Combustion','A rapid reaction with oxygen that releases heat and light.'],
    ['Valence electron','An electron in the outermost shell of an atom, involved in bonding.'],
    ['Reactivity series','A ranking of metals by how readily they react and lose electrons.'],
    ['Homologous series','A family of organic compounds with the same general formula, differing by CH₂.'],
    ['Functional group','A specific group of atoms within a molecule responsible for its characteristic chemistry.'],
    ['Distillation','Separating liquids by differences in boiling point.'],
    ['Chromatography','Separating dissolved substances by differing movement through a medium.'],
    ['Neutralisation','The reaction of an acid with a base to form a salt and water.'],
    ['Mole','The SI unit for amount of substance, containing 6.022×10²³ particles.'],
  ];
  container.innerHTML = toolHeader('Chemistry Glossary') + `
    <input type="text" id="glosSearch" placeholder="Search terms…" style="margin-bottom:16px"/>
    <div id="glosList" class="card" style="padding:8px 18px"></div>`;
  bindBack(container);
  function draw(filter){
    const list = TERMS.filter(([t,d])=>!filter || t.toLowerCase().includes(filter) || d.toLowerCase().includes(filter))
      .sort((a,b)=>a[0].localeCompare(b[0]));
    container.querySelector('#glosList').innerHTML = list.length ? list.map(([t,d])=>`
      <div style="padding:14px 0;border-bottom:1px solid var(--border)">
        <b style="color:var(--primary-blue);font-family:var(--font-display)">${t}</b>
        <p style="margin:4px 0 0">${d}</p>
      </div>`).join('') : `<div class="empty-state">${ICONS.glossary}<p>No terms match your search.</p></div>`;
  }
  draw('');
  container.querySelector('#glosSearch').addEventListener('input', e=>draw(e.target.value.trim().toLowerCase()));
};

/* ---------------- ABOUT DEVELOPER ---------------- */
window.Tools.about = function(container){
  container.innerHTML = toolHeader('About the Developer') + `
    <div class="card glass" style="padding:32px;text-align:center;background:linear-gradient(160deg,var(--deep-blue),var(--primary-blue));color:#fff;margin-bottom:20px">
      <img src="assets/developer-photo.jpeg" alt="Dr. Mateen Yousuf" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:4px solid var(--cyan);box-shadow:0 0 0 8px rgba(38,198,218,.18);margin-bottom:16px"/>
      <h1 style="color:#fff;margin-bottom:2px">Dr. Mateen Yousuf</h1>
      <p style="color:#BFD6F5;margin:0">Teacher, School Education Department, Kashmir</p>
      <p style="color:#BFD6F5;margin-top:4px;font-size:13px">Creator · Virtual Chemistry Laboratory</p>
    </div>
    <div class="card" style="padding:22px;margin-bottom:14px">
      <h3>${ICONS.lightbulb} Vision</h3>
      <p>To make quality, hands-on science education accessible to every student — regardless of whether their school has a fully equipped laboratory — by pairing rigorous scientific accuracy with genuinely interactive, discovery-based digital experiments.</p>
    </div>
    <div class="card" style="padding:22px;margin-bottom:14px">
      <h3>${ICONS.target} Educational Alignment</h3>
      <ul class="styled">
        <li><b>NEP 2020</b> — supports experiential, competency-based learning over rote memorisation.</li>
        <li><b>Competency-Based Learning</b> — every simulation is built around clear, assessable learning objectives.</li>
        <li><b>Inquiry-Based Learning</b> — students form hypotheses, manipulate variables, and draw their own conclusions.</li>
        <li><b>Constructivist Pedagogy</b> — knowledge is built actively through repeated, safe experimentation.</li>
        <li><b>Laboratory Safety</b> — virtual experimentation lets students explore reactions too hazardous for a real classroom.</li>
      </ul>
    </div>
    <div class="card" style="padding:22px">
      <h3>${ICONS.check} Scientific Temper</h3>
      <p>This laboratory is designed to cultivate curiosity, careful observation, and evidence-based reasoning — the foundations of scientific temper — in every learner who opens it, entirely offline and free of cost.</p>
    </div>`;
  bindBack(container);
};

/* ---------------- SETTINGS ---------------- */
window.Tools.settings = function(container, app){
  container.innerHTML = toolHeader('Settings') + `
    <div class="card" style="padding:22px;margin-bottom:14px">
      <h3>Appearance</h3>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <p style="margin:0">Dark theme</p>
        <label class="switch">
          <input type="checkbox" id="darkToggle" ${app.state.theme==='dark'?'checked':''}/>
        </label>
        <button class="btn btn-secondary btn-sm" id="darkBtn">${app.state.theme==='dark'?'Switch to Light':'Switch to Dark'}</button>
      </div>
    </div>
    <div class="card" style="padding:22px;margin-bottom:14px">
      <h3>Your Progress</h3>
      <p>XP: <b>${app.state.xp||0}</b> · Streak: <b>${app.state.streak||0} days</b> · Completed: <b>${Object.values(app.state.completed).filter(Boolean).length}/10</b></p>
      <button class="btn btn-secondary btn-sm" id="resetProgress">Reset All Progress</button>
    </div>
    <div class="card" style="padding:22px">
      <h3>About this App</h3>
      <p>Virtual Chemistry Laboratory is a fully offline Progressive Web App. All your progress, favourites and achievements are stored only on this device — no data is sent anywhere.</p>
    </div>`;
  bindBack(container);
  container.querySelector('#darkBtn').addEventListener('click', ()=>{ app.toggleTheme(); window.Tools.settings(container, app); });
  container.querySelector('#resetProgress').addEventListener('click', ()=>{
    if(confirm('Reset all XP, progress, favourites and achievements? This cannot be undone.')){
      app.state = app.defaultState();
      app.save();
      app.toast('Progress reset');
      window.Tools.settings(container, app);
      app.renderHome();
    }
  });
};

/* ---------------- FAVORITES (bottom nav) ---------------- */
window.Tools.favorites = function(container, app){
  const favs = SIM_LIST.filter(s=>app.state.favorites[s.id]);
  container.innerHTML = toolHeader('Your Favourites') +
    (favs.length ? `<div class="grid grid-sims">${favs.map(s=>app.simCardHTML(s)).join('')}</div>`
      : `<div class="empty-state">${ICONS.world}<p>No favourites yet. Tap the star on any simulation card to add it here.</p></div>`);
  bindBack(container);
  container.querySelectorAll('[data-sim]').forEach(el=>{
    el.addEventListener('click', (e)=>{ if(e.target.closest('[data-fav]')) return; app.openSim(el.dataset.sim); });
  });
  container.querySelectorAll('[data-fav]').forEach(el=>{
    el.addEventListener('click', (e)=>{ e.stopPropagation(); app.toggleFavorite(el.dataset.fav); window.Tools.favorites(container, app); });
  });
};
