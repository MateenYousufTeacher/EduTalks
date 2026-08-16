window.SIM_MODULES = window.SIM_MODULES || {};

window.SIM_MODULES.atomic = (function(){
  let protons=1, neutrons=0, electrons=1;

  function elementForZ(z){ return ELEMENTS_BY_Z[z] || {symbol:'?', name:'Unknown (Z='+z+')'}; }

  function shellsFor(e){
    const caps=[2,8,18,32];
    let remaining=e, shells=[];
    for(let cap of caps){ if(remaining<=0) break; const take=Math.min(cap,remaining); shells.push(take); remaining-=take; }
    return shells.length?shells:[0];
  }

  function drawAtom(){
    const shells = shellsFor(electrons);
    const cx=250, cy=210;
    let svg = `<svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg">`;
    // shells
    shells.forEach((count,i)=>{
      const r = 42 + i*38;
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--primary-blue,#1976D2)" stroke-width="1.4" stroke-dasharray="3 4" opacity="0.55"/>`;
      for(let k=0;k<count;k++){
        const angle = (2*Math.PI*k/count) + i*0.4;
        const ex = cx + r*Math.cos(angle);
        const ey = cy + r*Math.sin(angle);
        svg += `<circle cx="${ex}" cy="${ey}" r="6" fill="#26C6DA" stroke="#00707d" stroke-width="1">
          <animate attributeName="opacity" values="1;0.6;1" dur="${1.4+i*0.3}s" repeatCount="indefinite"/>
        </circle>`;
      }
    });
    // nucleus
    const nucleusR = 26 + Math.min(protons+neutrons,40)*0.35;
    svg += `<circle cx="${cx}" cy="${cy}" r="${nucleusR}" fill="url(#nucGrad)" stroke="#0D47A1" stroke-width="2"/>`;
    svg += `<defs><radialGradient id="nucGrad" cx="35%" cy="35%"><stop offset="0%" stop-color="#FFB300"/><stop offset="100%" stop-color="#E53935"/></radialGradient></defs>`;
    svg += `<text x="${cx}" y="${cy+6}" text-anchor="middle" font-size="20" font-weight="800" fill="#fff">${elementForZ(protons).symbol}</text>`;
    svg += `</svg>`;
    return svg;
  }

  function stabilityInfo(){
    const charge = protons - electrons;
    const el = elementForZ(protons);
    const outer = shellsFor(electrons).slice(-1)[0];
    const outerCap = shellsFor(electrons).length===1?2:8;
    let stability = 'Stable-ish';
    if(charge===0 && (outer===2 || outer===8)) stability = 'Very stable (full outer shell)';
    else if(charge===0) stability = 'Reactive neutral atom';
    else stability = charge>0 ? `Cation (+${charge}) — lost ${charge} electron(s)` : `Anion (${charge}) — gained ${-charge} electron(s)`;
    const massNumber = protons+neutrons;
    const isotopeNote = (ELEMENTS_BY_Z[protons] && Math.round(ELEMENTS_BY_Z[protons].mass) !== massNumber)
      ? `This is an isotope of ${el.name} (typical mass ≈ ${Math.round(ELEMENTS_BY_Z[protons].mass)}).`
      : `This matches the most common isotope of ${el.name}.`;
    return {charge, stability, massNumber, isotopeNote, el};
  }

  function render({stage, controls, playbar, api}){
    function update(logIt){
      protons = Math.max(1, Math.min(118, protons));
      neutrons = Math.max(0, neutrons);
      electrons = Math.max(0, Math.min(electrons, 60));
      const info = stabilityInfo();
      stage.innerHTML = drawAtom() + `
        <div style="position:absolute;top:14px;left:14px;font-family:var(--font-display)">
          <div style="font-size:26px;font-weight:800;color:var(--primary-blue)">${info.el.name || 'Element '+protons}</div>
          <div style="font-size:13px;color:var(--text-muted)">Symbol: <b>${info.el.symbol||'?'}</b> · Z=${protons} · A=${info.massNumber}</div>
        </div>
        <div class="badge ${info.charge===0?'badge-green':(info.charge>0?'badge-blue':'badge-red')}" style="position:absolute;top:16px;right:16px;font-size:13px;padding:6px 14px">${info.stability}</div>
      `;
      stage.style.position='relative';
      controls.querySelector('#pVal').textContent = protons;
      controls.querySelector('#nVal').textContent = neutrons;
      controls.querySelector('#eVal').textContent = electrons;
      controls.querySelector('#isotopeNote').textContent = info.isotopeNote;
      if(logIt){
        api.log([info.el.symbol||'?', protons, neutrons, electrons, info.massNumber, info.charge>0?`+${info.charge}`:info.charge, info.stability]);
        api.progress(60);
      }
    }

    api.setHeaders(['Symbol','Protons','Neutrons','Electrons','Mass #','Charge','Stability']);

    controls.innerHTML = `
      <div class="card control-group">
        <h4>Build Your Atom</h4>
        <div class="field">
          <label>Protons (Z) <span class="val" id="pVal">1</span></label>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" id="pMinus">−</button>
            <input type="range" min="1" max="118" value="1" id="pRange"/>
            <button class="btn btn-secondary btn-sm" id="pPlus">+</button>
          </div>
        </div>
        <div class="field">
          <label>Neutrons <span class="val" id="nVal">0</span></label>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" id="nMinus">−</button>
            <input type="range" min="0" max="146" value="0" id="nRange"/>
            <button class="btn btn-secondary btn-sm" id="nPlus">+</button>
          </div>
        </div>
        <div class="field">
          <label>Electrons <span class="val" id="eVal">1</span></label>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" id="eMinus">−</button>
            <input type="range" min="0" max="60" value="1" id="eRange"/>
            <button class="btn btn-secondary btn-sm" id="ePlus">+</button>
          </div>
        </div>
      </div>
      <div class="card control-group">
        <h4>Quick Presets</h4>
        <div class="chip-row">
          <div class="chip" data-preset="6,6,6">Carbon-12</div>
          <div class="chip" data-preset="6,8,6">Carbon-14</div>
          <div class="chip" data-preset="11,12,10">Na⁺ ion</div>
          <div class="chip" data-preset="17,18,18">Cl⁻ ion</div>
          <div class="chip" data-preset="2,2,2">Helium</div>
          <div class="chip" data-preset="8,8,8">Oxygen</div>
        </div>
      </div>
      <div class="card control-group">
        <h4>Isotope Note</h4>
        <p id="isotopeNote" style="font-size:13.5px;color:var(--text-muted);margin:0"></p>
      </div>
    `;
    playbar.innerHTML = `
      <button class="btn-icon" id="resetAtom" title="Reset">${ICONS.check.replace('polyline points="20 6 9 17 4 12"','path d="M3 12a9 9 0 1 0 3-6.7M3 3v6h6"')}</button>
      <span class="spacer"></span>
      <button class="btn btn-primary btn-sm" id="logAtom">Record Observation</button>
    `;

    const pRange=controls.querySelector('#pRange'), nRange=controls.querySelector('#nRange'), eRange=controls.querySelector('#eRange');
    pRange.addEventListener('input', e=>{ protons=+e.target.value; update(false); });
    nRange.addEventListener('input', e=>{ neutrons=+e.target.value; update(false); });
    eRange.addEventListener('input', e=>{ electrons=+e.target.value; update(false); });
    controls.querySelector('#pMinus').addEventListener('click', ()=>{ protons=Math.max(1,protons-1); pRange.value=protons; update(false); });
    controls.querySelector('#pPlus').addEventListener('click', ()=>{ protons=Math.min(118,protons+1); pRange.value=protons; update(false); });
    controls.querySelector('#nMinus').addEventListener('click', ()=>{ neutrons=Math.max(0,neutrons-1); nRange.value=neutrons; update(false); });
    controls.querySelector('#nPlus').addEventListener('click', ()=>{ neutrons++; nRange.value=neutrons; update(false); });
    controls.querySelector('#eMinus').addEventListener('click', ()=>{ electrons=Math.max(0,electrons-1); eRange.value=electrons; update(false); });
    controls.querySelector('#ePlus').addEventListener('click', ()=>{ electrons++; eRange.value=electrons; update(false); });
    controls.querySelectorAll('[data-preset]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const [p,n,e] = chip.dataset.preset.split(',').map(Number);
        protons=p; neutrons=n; electrons=e;
        pRange.value=p; nRange.value=n; eRange.value=e;
        update(true);
        api.toast('Preset loaded: '+chip.textContent);
      });
    });
    playbar.querySelector('#resetAtom').addEventListener('click', ()=>{
      protons=1; neutrons=0; electrons=1; pRange.value=1; nRange.value=0; eRange.value=1; update(false);
    });
    playbar.querySelector('#logAtom').addEventListener('click', ()=>update(true));

    update(false);
  }

  return { mount: render };
})();
