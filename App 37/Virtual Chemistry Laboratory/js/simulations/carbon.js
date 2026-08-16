window.SIM_MODULES = window.SIM_MODULES || {};

window.SIM_MODULES.carbon = (function(){
  const SKELETONS = {
    methane:{name:'Methane', c:1, bond:1, formula:'CH₄', bp:-161},
    ethane:{name:'Ethane', c:2, bond:1, formula:'C₂H₆', bp:-89},
    propane:{name:'Propane', c:3, bond:1, formula:'C₃H₈', bp:-42},
    ethene:{name:'Ethene', c:2, bond:2, formula:'C₂H₄', bp:-104},
    ethyne:{name:'Ethyne', c:2, bond:3, formula:'C₂H₂', bp:-84},
  };
  const GROUPS = {
    none:{name:'None (hydrocarbon)', suffix:'', bpShift:0, classLabel:'Hydrocarbon'},
    oh:{name:'−OH (Hydroxyl)', suffix:'-ol', bpShift:120, classLabel:'Alcohol'},
    cooh:{name:'−COOH (Carboxyl)', suffix:'oic acid', bpShift:160, classLabel:'Carboxylic Acid'},
  };
  let skeleton='ethane', group='none';

  function computeFormula(){
    const s = SKELETONS[skeleton];
    if(group==='none') return s.formula;
    if(group==='oh') return s.formula.replace(/H(\d*)$/, (m,n)=>{ const num=(n?+n:1)-1; return (num>1?'H'+num:'H') + 'OH'; });
    if(group==='cooh') return s.formula + 'OOH (as substituent)';
    return s.formula;
  }

  function structureSVG(){
    const s = SKELETONS[skeleton];
    let svg = `<svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg">`;
    const cx0 = 100, spacing=90, cy=140;
    for(let i=0;i<s.c;i++){
      const cx = cx0 + i*spacing;
      if(i>0){
        const strokes = s.bond===1?1:(s.bond===2?2:3);
        for(let k=0;k<strokes;k++){
          const off=(k-(strokes-1)/2)*6;
          svg += `<line x1="${cx-spacing+18}" y1="${cy+off}" x2="${cx-18}" y2="${cy+off}" stroke="#455A64" stroke-width="3"/>`;
        }
      }
      svg += `<circle cx="${cx}" cy="${cy}" r="20" fill="#455A64"/><text x="${cx}" y="${cy+6}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">C</text>`;
      // hydrogens
      const hCount = s.bond===1?2:(s.bond===2?1:0);
      for(let h=0;h<hCount;h++){
        const angle = h===0? -Math.PI/2.4 : Math.PI/2.4;
        const hx = cx + 34*Math.cos(angle), hy = cy + 34*Math.sin(angle);
        svg += `<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="#90A4C4" stroke-width="2"/>`;
        svg += `<circle cx="${hx}" cy="${hy}" r="11" fill="#90CAF9"/><text x="${hx}" y="${hy+4}" text-anchor="middle" font-size="10" font-weight="700" fill="#01579B">H</text>`;
      }
      if(i===s.c-1 && group!=='none'){
        const gx = cx+40, gy=cy-40;
        const label = group==='oh' ? 'OH' : 'COOH';
        svg += `<line x1="${cx}" y1="${cy}" x2="${gx}" y2="${gy}" stroke="#E53935" stroke-width="2.5"/>`;
        svg += `<circle cx="${gx}" cy="${gy}" r="16" fill="#FFCDD2"/><text x="${gx}" y="${gy+4}" text-anchor="middle" font-size="10" font-weight="800" fill="#B71C1C">${label}</text>`;
      }
    }
    svg += `</svg>`;
    return svg;
  }

  function boilingPoint(){
    return SKELETONS[skeleton].bp + GROUPS[group].bpShift + (SKELETONS[skeleton].c-1)*15;
  }

  function render({stage, controls, playbar, api}){
    api.setHeaders(['Base skeleton','Functional group','Formula','Class','Est. boiling point (°C)']);

    function update(logIt){
      const s = SKELETONS[skeleton], g = GROUPS[group];
      const bp = boilingPoint();
      stage.innerHTML = structureSVG() + `
        <div class="card" style="position:absolute;top:10px;left:10px;padding:10px 14px">
          <div style="font-family:var(--font-display);font-weight:800;font-size:17px;color:var(--primary-blue)">${s.name}${group!=='none'?' '+g.suffix:''}</div>
          <div class="text-sm">Class: ${g.classLabel} · Est. boiling point: ${bp}°C</div>
        </div>`;
      stage.style.position='relative';
      if(logIt){
        api.log([s.name, g.name, computeFormula(), g.classLabel, bp]);
        api.progress(60);
      }
    }

    controls.innerHTML = `
      <div class="card control-group">
        <h4>Base Skeleton</h4>
        <div class="chip-row">${Object.keys(SKELETONS).map(k=>`<div class="chip ${k===skeleton?'active':''}" data-sk="${k}">${SKELETONS[k].name}</div>`).join('')}</div>
      </div>
      <div class="card control-group">
        <h4>Functional Group</h4>
        <div class="chip-row">${Object.keys(GROUPS).map(k=>`<div class="chip ${k===group?'active':''}" data-gr="${k}">${GROUPS[k].name}</div>`).join('')}</div>
      </div>
      <div class="card control-group">
        <h4>Bond Type</h4>
        <p style="font-size:13.5px;color:var(--text-muted)">${['','Single (saturated)','Double (unsaturated)','Triple (unsaturated)'][SKELETONS[skeleton].bond]} carbon-carbon bonding.</p>
      </div>`;
    playbar.innerHTML = `<button class="btn btn-primary btn-sm" id="buildBtn">🧬 Build Molecule</button><span class="spacer"></span><span class="text-sm" style="color:var(--text-muted)">Formula updates live</span>`;

    controls.querySelectorAll('[data-sk]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        controls.querySelectorAll('[data-sk]').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active'); skeleton=chip.dataset.sk; update(false);
      });
    });
    controls.querySelectorAll('[data-gr]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        controls.querySelectorAll('[data-gr]').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active'); group=chip.dataset.gr; update(false);
      });
    });
    playbar.querySelector('#buildBtn').addEventListener('click', ()=>update(true));

    update(false);
  }

  return { mount: render };
})();
