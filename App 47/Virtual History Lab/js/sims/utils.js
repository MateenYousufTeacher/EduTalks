/* Virtual History Laboratory — shared simulation utilities */
const SimUtils = (() => {
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  function el(tag, cls, html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; }

  // Palette of selectable chips (e.g. building types, kingdoms). Returns {get, root}
  function buildPalette(container, items, onSelect){
    const row = el('div','toggle-row');
    let current = items[0].value;
    items.forEach((it,i)=>{
      const chip = el('div', 'chip'+(i===0?' active':''), `${it.icon||''} ${it.label}`);
      chip.addEventListener('click', ()=>{
        row.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active');
        current = it.value;
        onSelect && onSelect(current);
      });
      row.appendChild(chip);
    });
    container.appendChild(row);
    return { get: ()=>current, root: row };
  }

  // Grid builder: rows x cols of clickable cells. cellRender(state) returns inner html/text.
  function buildGrid(container, rows, cols, initial, onCellClick, cellLabel){
    const grid = el('div','grid-board');
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.maxWidth = Math.min(560, cols*54)+'px';
    const state = initial.slice();
    function paint(){
      grid.innerHTML='';
      state.forEach((v,i)=>{
        const c = el('div','grid-cell', cellLabel(v));
        c.addEventListener('click', ()=>{
          onCellClick(i, state);
          paint();
        });
        grid.appendChild(c);
      });
    }
    paint();
    container.appendChild(grid);
    return { state, repaint: paint, grid };
  }

  // Allocation sliders that auto-normalize into percentages summing to 100 (soft trade-off)
  function buildAllocators(container, keys, onChange){
    const raw = {}; keys.forEach(k=> raw[k.key]=k.default!==undefined?k.default:50);
    const wrap = el('div','flex col gap12');
    keys.forEach(k=>{
      const field = el('div','field');
      field.innerHTML = `<label>${k.label} <span style="float:right" id="lbl-${k.key}"></span></label>
        <input type="range" min="1" max="100" value="${raw[k.key]}" id="rng-${k.key}">`;
      wrap.appendChild(field);
    });
    container.appendChild(wrap);
    function normalized(){
      const sum = keys.reduce((s,k)=>s+raw[k.key],0) || 1;
      const out = {};
      keys.forEach(k=> out[k.key] = Math.round(raw[k.key]/sum*100));
      return out;
    }
    function updateLabels(){
      const norm = normalized();
      keys.forEach(k=>{ wrap.querySelector(`#lbl-${k.key}`).textContent = norm[k.key]+'%'; });
    }
    keys.forEach(k=>{
      wrap.querySelector(`#rng-${k.key}`).addEventListener('input', (e)=>{
        raw[k.key] = +e.target.value;
        updateLabels();
        onChange && onChange(normalized());
      });
    });
    updateLabels();
    onChange && onChange(normalized());
    return { get: normalized };
  }

  function fitCanvas(canvas, w, h){
    canvas.width = w; canvas.height = h;
    return canvas.getContext('2d');
  }

  function rand(min,max){ return Math.random()*(max-min)+min; }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  return { clamp, el, buildPalette, buildGrid, buildAllocators, fitCanvas, rand, pick };
})();
