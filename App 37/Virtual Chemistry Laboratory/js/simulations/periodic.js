window.SIM_MODULES = window.SIM_MODULES || {};

window.SIM_MODULES.periodic = (function(){
  let selected = null;
  let compareA = null, compareB = null;
  let compareMode = false;
  let activeFilter = 'all';
  let search = '';

  function gridPos(e){
    if(e.group===0){
      const idx = e.category==='lanthanide' ? e.z-57 : e.z-89;
      return { row: e.category==='lanthanide'?9:10, col: idx+3 };
    }
    return { row: e.period, col: e.group };
  }

  function matches(e){
    if(activeFilter!=='all' && e.category!==activeFilter) return false;
    if(search && !(e.name.toLowerCase().includes(search) || e.symbol.toLowerCase()===search)) return false;
    return true;
  }

  function drawGrid(host, api){
    let html = `<div class="pt-grid">`;
    ELEMENTS.forEach(e=>{
      const {row,col} = gridPos(e);
      const dim = !matches(e);
      const isSel = (compareMode ? (e===compareA||e===compareB) : selected===e);
      html += `<div class="pt-cell ${dim?'dim':''}" data-z="${e.z}"
        style="grid-row:${row};grid-column:${col};background:${CATEGORY_COLORS[e.category]};${isSel?'outline:3px solid var(--amber);z-index:3;':''}">
        <span class="z">${e.z}</span><span class="sym">${e.symbol}</span>
      </div>`;
    });
    html += `</div>`;
    host.innerHTML = html;
    host.querySelectorAll('.pt-cell').forEach(cell=>{
      cell.addEventListener('click', ()=>{
        const e = ELEMENTS_BY_Z[+cell.dataset.z];
        if(compareMode){
          if(!compareA || (compareA && compareB)){ compareA=e; compareB=null; }
          else if(e!==compareA){ compareB=e; }
          renderDetail(api);
        } else {
          selected = e;
          renderDetail(api);
        }
        drawGrid(host, api);
      });
    });
  }

  function elementCard(e){
    if(!e) return `<div class="empty-state">${ICONS.grid}<p>Select an element</p></div>`;
    return `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">
        <div style="width:56px;height:56px;border-radius:14px;background:${CATEGORY_COLORS[e.category]};color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:20px">${e.symbol}</div>
        <div><div style="font-family:var(--font-display);font-weight:800;font-size:19px">${e.name}</div>
        <div class="text-sm" style="color:var(--text-muted)">${CATEGORY_LABELS[e.category]}</div></div>
      </div>
      <table class="obs-table" style="margin-top:6px">
        <tbody>
          <tr><th>Atomic number</th><td>${e.z}</td></tr>
          <tr><th>Atomic mass</th><td>${e.mass}</td></tr>
          <tr><th>Period</th><td>${e.period}</td></tr>
          <tr><th>Group</th><td>${e.group||'—'}</td></tr>
          <tr><th>Electron shells</th><td>${e.shells.join(', ')}</td></tr>
        </tbody>
      </table>`;
  }

  function renderDetail(api){
    const panel = document.getElementById('ptDetail');
    if(!panel) return;
    if(compareMode){
      panel.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>${elementCard(compareA)}</div><div>${elementCard(compareB)}</div>
      </div>
      ${compareA && compareB ? `<div class="fact-card" style="margin-top:12px">
        ${compareA.name} has ${compareA.mass<compareB.mass?'a smaller':'a larger'} atomic mass than ${compareB.name}, and ${compareA.shells.length<compareB.shells.length?'fewer':(compareA.shells.length>compareB.shells.length?'more':'the same number of')} electron shells.
      </div>`:''}`;
    } else {
      panel.innerHTML = elementCard(selected);
      if(selected) api.log([selected.symbol, selected.name, selected.z, selected.mass, CATEGORY_LABELS[selected.category]]);
    }
  }

  function render({stage, controls, playbar, api}){
    api.setHeaders(['Symbol','Name','Z','Mass','Category']);
    stage.innerHTML = `<div id="ptStageGrid"></div>`;
    stage.style.overflow='auto';
    drawGrid(document.getElementById('ptStageGrid'), api);

    const cats = Object.keys(CATEGORY_LABELS);
    controls.innerHTML = `
      <div class="card control-group">
        <h4>Search & Filter</h4>
        <input type="text" id="ptSearch" placeholder="Search by name or symbol…" style="margin-bottom:12px"/>
        <div class="chip-row">
          <div class="chip active" data-cat="all">All</div>
          ${cats.map(c=>`<div class="chip" data-cat="${c}" style="border-color:${CATEGORY_COLORS[c]}">${CATEGORY_LABELS[c]}</div>`).join('')}
        </div>
      </div>
      <div class="card control-group">
        <h4>Mode</h4>
        <label style="display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px">
          <input type="checkbox" id="ptCompare" style="width:16px;height:16px"/> Comparison mode (select 2 elements)
        </label>
      </div>
      <div class="card control-group" id="ptDetail">${elementCard(null)}</div>
    `;
    playbar.innerHTML = `<span class="text-sm" style="color:var(--text-muted)">Click any tile to view full details · legend below</span>`;

    controls.querySelector('#ptSearch').addEventListener('input', e=>{
      search = e.target.value.trim().toLowerCase();
      drawGrid(document.getElementById('ptStageGrid'), api);
    });
    controls.querySelectorAll('[data-cat]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        controls.querySelectorAll('[data-cat]').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.cat;
        drawGrid(document.getElementById('ptStageGrid'), api);
      });
    });
    controls.querySelector('#ptCompare').addEventListener('change', e=>{
      compareMode = e.target.checked; compareA=null; compareB=null;
      renderDetail(api);
      drawGrid(document.getElementById('ptStageGrid'), api);
      api.progress(60);
    });

    // legend under stage
    const legend = document.createElement('div');
    legend.className='pt-legend';
    legend.innerHTML = Object.keys(CATEGORY_LABELS).map(c=>`<span><i style="background:${CATEGORY_COLORS[c]}"></i>${CATEGORY_LABELS[c]}</span>`).join('');
    stage.appendChild(legend);
  }

  return { mount: render };
})();
