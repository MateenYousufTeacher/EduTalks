(function(){
  const SIM='culture';

  // Two entirely fictional cultural regions to avoid stereotyping real communities.
  const REGIONS = {
    valemara: {
      name:'Valemara Highlands', icon:'⛰️',
      architecture:'Steep timber-roofed houses clustered along terraced slopes.',
      language:'A tonal highland dialect written in a vertical script.',
      food:'Root-vegetable stews and fermented mountain grains.',
      festival:'The Lantern Ascent, marking the winter solstice.',
      settlement:'Compact terraced villages built to conserve farmland.',
      craft:'Hand-loomed wool textiles dyed with mineral pigments.'
    },
    tarsanth: {
      name:'Tarsanthi Delta', icon:'🌊',
      architecture:'Stilt houses raised above seasonal floodwaters.',
      language:'A trade-influenced coastal language with many loanwords.',
      food:'Rice, river fish and citrus-forward sauces.',
      festival:'The Tide Lantern Festival, celebrating the flood retreat.',
      settlement:'Linear villages strung along canals and waterways.',
      craft:'Woven reed mats and boats built from river bamboo.'
    }
  };
  const LAYERS = ['architecture','language','food','festival','settlement','craft'];
  const LAYER_LABEL = {architecture:'🏘️ Architecture', language:'🗣️ Language', food:'🍲 Food Tradition', festival:'🎉 Festival', settlement:'🏡 Settlement Style', craft:'🧵 Craft Tradition'};

  const PERIODS = ['Early Settlement','Trade Expansion','Present Day'];
  const TIMELINE = {
    valemara: [
      'Scattered single-family huts on open slopes; footpaths only.',
      'Villages consolidate on terraces as trade routes connect the highlands; timber roofs replace thatch.',
      'Terraced villages persist, now linked by a mountain road; the Lantern Ascent draws regional visitors.'
    ],
    tarsanth: [
      'Small fishing camps on natural levees; canoe travel only.',
      'Stilt houses spread as delta trade grows; canals are dug to connect settlements.',
      'Dense canal-side towns with markets; the Tide Lantern Festival becomes a delta-wide celebration.'
    ]
  };

  const MISSIONS=[
    {id:'m1', title:'Identify a Landscape', desc:'Correctly identify which region an unlabeled clue belongs to.'},
    {id:'m2', title:'Match the Features', desc:'Match at least 3 features to their correct region.'},
    {id:'m3', title:'Compare Two Landscapes', desc:'Open the side-by-side comparison.'},
    {id:'m4', title:'Trace the Change', desc:'Step through all three historical periods.'}
  ];

  function mount(root, ctx){
    let activeLayers = new Set(LAYERS);
    let mode='explore';
    let quiz = null;
    let periodIdx=0;
    let periodRegion='valemara';
    let done = GeoLab.ui.loadProgress(SIM).missions;
    let matchedCount = 0;

    function newQuiz(){
      const regionKey = Math.random()<0.5?'valemara':'tarsanth';
      const layer = LAYERS[Math.floor(Math.random()*LAYERS.length)];
      quiz = { regionKey, layer, clue: REGIONS[regionKey][layer], answered:false };
    }
    newQuiz();

    function regionCard(key){
      const r = REGIONS[key];
      return `<div class="panel" style="margin-bottom:10px;">
        <h3>${r.icon} ${r.name}</h3>
        ${LAYERS.filter(l=>activeLayers.has(l)).map(l=>`<div class="control-row"><label>${LAYER_LABEL[l]}</label></div><p style="font-size:.8rem;color:#556;margin:-4px 0 4px;">${r[l]}</p>`).join('')}
      </div>`;
    }

    function render(){
      root.innerHTML = `
        <div class="panel">
          <h3>Cultural Layers <span class="sub">Toggle layers to reveal features</span></h3>
          ${LAYERS.map(l=>GeoLab.ui.toggleRow({id:'lyr_'+l, label:LAYER_LABEL[l], checked:activeLayers.has(l)})).join('')}
        </div>

        <div class="tabbar" id="modeTab" style="margin:0 2px;">
          <button data-tab="explore" class="${mode==='explore'?'active':''}">Explore</button>
          <button data-tab="quiz" class="${mode==='quiz'?'active':''}">Pattern ID</button>
          <button data-tab="compare" class="${mode==='compare'?'active':''}">Compare</button>
          <button data-tab="time" class="${mode==='time'?'active':''}">Change over Time</button>
        </div>

        ${mode==='explore' ? Object.keys(REGIONS).map(regionCard).join('') : ''}

        ${mode==='quiz' ? `
        <div class="panel">
          <h3>Identify the Culture</h3>
          <p style="font-size:.85rem;background:var(--light-gray);padding:10px;border-radius:8px;">"${quiz.clue}"</p>
          <div class="btn-row" style="margin-top:10px;">
            ${Object.keys(REGIONS).map(k=>`<button class="btn ${quiz.answered ? (k===quiz.regionKey?'btn-green':'btn-secondary') : 'btn-secondary'} btn-sm" data-guess="${k}" ${quiz.answered?'disabled':''}>${REGIONS[k].icon} ${REGIONS[k].name}</button>`).join('')}
          </div>
          <div id="quizResult" style="margin-top:10px;font-size:.85rem;"></div>
          ${quiz.answered ? `<button class="btn btn-primary btn-sm" id="nextQuiz" style="margin-top:10px;">Next Clue</button>` : ''}
        </div>` : ''}

        ${mode==='compare' ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${Object.keys(REGIONS).map(k=>`<div class="panel"><h3 style="font-size:.9rem;">${REGIONS[k].icon} ${REGIONS[k].name}</h3>
            ${LAYERS.map(l=>`<p style="font-size:.72rem;color:#556;margin:4px 0;"><b>${LAYER_LABEL[l]}:</b> ${REGIONS[k][l]}</p>`).join('')}
          </div>`).join('')}
        </div>` : ''}

        ${mode==='time' ? `
        <div class="panel">
          <h3>Change Over Time</h3>
          <select id="periodRegionSel">${Object.keys(REGIONS).map(k=>`<option value="${k}" ${periodRegion===k?'selected':''}>${REGIONS[k].name}</option>`).join('')}</select>
          <div class="tabbar" id="periodTab" style="margin-top:10px;">
            ${PERIODS.map((p,i)=>`<button data-tab="${i}" class="${periodIdx===i?'active':''}">${p}</button>`).join('')}
          </div>
          <p style="font-size:.85rem;">${TIMELINE[periodRegion][periodIdx]}</p>
        </div>` : ''}

        <div class="panel">
          <h3>Missions</h3>
          ${GeoLab.ui.missions(MISSIONS, done)}
        </div>

        <div class="btn-row" style="padding:0 2px 8px;">${GeoLab.ui.favBar(ctx)}</div>
      `;
      GeoLab.ui.bindFav(root, ctx);
      bind();
    }

    function bind(){
      LAYERS.forEach(l=>{
        root.querySelector('#lyr_'+l)?.addEventListener('change', e=>{
          if(e.target.checked) activeLayers.add(l); else activeLayers.delete(l);
          matchedCount++;
          if(matchedCount>=3) GeoLab.ui.markMission(SIM,'m2',ctx);
          render();
        });
      });
      GeoLab.ui.bindTabbar(root.querySelector('#modeTab'), t=>{
        mode=t;
        if(t==='compare') GeoLab.ui.markMission(SIM,'m3',ctx);
        render();
      });
      root.querySelectorAll('[data-guess]').forEach(b=>b.addEventListener('click', ()=>{
        const guess = b.dataset.guess;
        quiz.answered = true;
        const box = root.querySelector('#quizResult');
        if(guess===quiz.regionKey){
          box.innerHTML = `✅ Correct! That clue reflects ${REGIONS[quiz.regionKey].name}.`;
          GeoLab.ui.markMission(SIM,'m1',ctx);
        } else {
          box.innerHTML = `❌ Not quite — that clue actually describes ${REGIONS[quiz.regionKey].name}.`;
        }
        done = GeoLab.ui.loadProgress(SIM).missions;
        render();
      }));
      root.querySelector('#nextQuiz')?.addEventListener('click', ()=>{ newQuiz(); render(); });
      root.querySelector('#periodRegionSel')?.addEventListener('change', e=>{ periodRegion=e.target.value; render(); });
      GeoLab.ui.bindTabbar(root.querySelector('#periodTab')?.parentElement || document.createElement('div'), t=>{
        periodIdx=+t;
        if(periodIdx===2) GeoLab.ui.markMission(SIM,'m4',ctx);
        render();
      });
    }

    render();
  }

  GeoLab.sims[SIM].mount = mount;
})();
