window.SIM_MODULES = window.SIM_MODULES || {};

window.SIM_MODULES.separation = (function(){
  const MIXTURES = {
    'Sand + Water': {best:'filtration', note:'Sand is insoluble — filter paper traps the solid, water passes through.'},
    'Salt + Water': {best:'evaporation', note:'Salt is dissolved — evaporating the water leaves salt crystals behind.'},
    'Ink (dyes)': {best:'chromatography', note:'Different dyes travel at different speeds up chromatography paper.'},
    'Iron filings + Sulfur': {best:'magnetic', note:'Iron is magnetic; sulfur is not — a magnet lifts out the iron.'},
    'Ethanol + Water': {best:'distillation', note:'Both are liquids with different boiling points — distillation separates them.'},
    'Mixed pebbles (sizes)': {best:'sieving', note:'Different particle sizes are separated by sieve mesh size.'},
    'Muddy water (settling)': {best:'sedimentation', note:'Denser mud particles settle to the bottom over time, then the clear water is decanted.'},
  };
  const TECHNIQUES = ['filtration','evaporation','chromatography','magnetic','distillation','sieving','sedimentation'];
  const TECH_LABEL = {filtration:'Filtration', evaporation:'Evaporation', chromatography:'Chromatography', magnetic:'Magnetic Separation', distillation:'Distillation', sieving:'Sieving', sedimentation:'Sedimentation & Decantation'};

  let mixture='Sand + Water', chosen='filtration';

  function apparatusSVG(tech, success){
    let svg = `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">`;
    if(tech==='filtration'){
      svg += `<path d="M150 40 L250 40 L220 130 L180 130 Z" fill="#E3F2FD" stroke="#90A4C4" stroke-width="2"/>`;
      svg += `<path d="M170 60 L230 60 L212 120 L188 120 Z" fill="#fff" stroke="#B0BEC5" stroke-width="1.4"/>`;
      svg += `<rect x="175" y="150" width="50" height="70" fill="none" stroke="#90A4C4" stroke-width="3"/>`;
      if(success) svg += `<circle cx="200" cy="200" r="6" fill="#B3E5FC"><animate attributeName="cy" values="120;200" dur="1.4s" repeatCount="indefinite"/></circle>`;
    } else if(tech==='evaporation'){
      svg += `<circle cx="200" cy="150" r="50" fill="#E3F2FD" stroke="#90A4C4" stroke-width="3"/>`;
      svg += `<rect x="170" y="200" width="60" height="14" fill="#78909C"/>`;
      for(let i=0;i<5;i++) svg += `<circle cx="${180+i*10}" cy="150" r="3" fill="#B3E5FC" opacity="0.7"><animate attributeName="cy" values="150;80" dur="${1.2+i*0.1}s" repeatCount="indefinite" begin="${i*0.15}s"/><animate attributeName="opacity" values="0.8;0" dur="${1.2+i*0.1}s" repeatCount="indefinite" begin="${i*0.15}s"/></circle>`;
      if(success) svg += `<circle cx="200" cy="155" r="18" fill="#fff" stroke="#CFD8DC"/>`;
    } else if(tech==='chromatography'){
      svg += `<rect x="150" y="30" width="10" height="180" fill="#FFF8E1" stroke="#D7CCC8"/>`;
      if(success){
        svg += `<circle cx="155" cy="190" r="4" fill="#E53935"><animate attributeName="cy" values="190;60" dur="2s" repeatCount="indefinite"/></circle>`;
        svg += `<circle cx="155" cy="195" r="4" fill="#1E88E5"><animate attributeName="cy" values="195;100" dur="2s" repeatCount="indefinite"/></circle>`;
        svg += `<circle cx="155" cy="200" r="4" fill="#43A047"><animate attributeName="cy" values="200;140" dur="2s" repeatCount="indefinite"/></circle>`;
      }
      svg += `<rect x="120" y="200" width="70" height="30" fill="#E3F2FD" opacity="0.6"/>`;
    } else if(tech==='magnetic'){
      svg += `<rect x="150" y="150" width="100" height="30" fill="#8D6E63"/>`;
      svg += `<rect x="170" y="60" width="60" height="20" fill="#E53935" rx="4"/><rect x="170" y="80" width="60" height="10" fill="#455A64"/>`;
      if(success) svg += `<circle cx="200" cy="150" r="5" fill="#455A64"><animate attributeName="cy" values="150;90" dur="1.2s" repeatCount="indefinite"/></circle>`;
    } else if(tech==='distillation'){
      svg += `<circle cx="150" cy="170" r="35" fill="#E3F2FD" stroke="#90A4C4" stroke-width="2"/>`;
      svg += `<path d="M170 150 L260 90" stroke="#90A4C4" stroke-width="3" fill="none"/>`;
      svg += `<rect x="250" y="70" width="60" height="30" fill="#E1F5FE" stroke="#90A4C4"/>`;
      svg += `<circle cx="300" cy="150" r="22" fill="#E3F2FD" stroke="#90A4C4" stroke-width="2"/>`;
      if(success) svg += `<circle cx="200" cy="110" r="4" fill="#B3E5FC"><animate attributeName="cx" values="180;260" dur="1.6s" repeatCount="indefinite"/></circle>`;
    } else if(tech==='sieving'){
      svg += `<rect x="140" y="120" width="120" height="10" fill="#90A4C4"/>`;
      for(let i=0;i<8;i++) svg += `<line x1="${145+i*15}" y1="120" x2="${145+i*15}" y2="130" stroke="#455A64" stroke-width="1"/>`;
      svg += `<rect x="150" y="150" width="100" height="40" fill="none" stroke="#90A4C4" stroke-width="2"/>`;
      if(success) for(let i=0;i<5;i++) svg += `<circle cx="${170+i*15}" cy="100" r="4" fill="#8D6E63"><animate attributeName="cy" values="100;170" dur="1.4s" repeatCount="indefinite" begin="${i*0.15}s"/></circle>`;
    } else if(tech==='sedimentation'){
      svg += `<rect x="160" y="60" width="80" height="150" fill="none" stroke="#90A4C4" stroke-width="3"/>`;
      svg += `<rect x="163" y="150" width="74" height="57" fill="#8D6E63" opacity="0.7"/>`;
      svg += `<rect x="163" y="100" width="74" height="50" fill="#B3E5FC" opacity="0.5"/>`;
    }
    svg += `</svg>`;
    return svg;
  }

  function render({stage, controls, playbar, api}){
    api.setHeaders(['Mixture','Technique Chosen','Correct Technique','Result']);

    function update(logIt){
      const m = MIXTURES[mixture];
      const success = chosen===m.best;
      stage.innerHTML = apparatusSVG(chosen, success) + `
        <div class="card" style="position:absolute;bottom:12px;left:12px;right:12px;padding:12px">
          <b>${mixture}</b> · Technique: ${TECH_LABEL[chosen]}<br/>
          <span style="color:${success?'var(--green)':'var(--danger)'};font-weight:700">${success? '✓ Correct choice — clean separation achieved!' : '✗ Not the best technique for this mixture.'}</span>
          <div class="text-sm" style="margin-top:6px;color:var(--text-muted)">${m.note}</div>
        </div>`;
      stage.style.position='relative';
      if(logIt){ api.log([mixture, TECH_LABEL[chosen], TECH_LABEL[m.best], success?'Success':'Try again']); api.progress(60); }
    }

    controls.innerHTML = `
      <div class="card control-group">
        <h4>Choose a Mixture</h4>
        <select id="mixSel">${Object.keys(MIXTURES).map(m=>`<option ${m===mixture?'selected':''}>${m}</option>`).join('')}</select>
      </div>
      <div class="card control-group">
        <h4>Choose a Separation Technique</h4>
        <div class="chip-row">${TECHNIQUES.map(t=>`<div class="chip ${t===chosen?'active':''}" data-tech="${t}">${TECH_LABEL[t]}</div>`).join('')}</div>
      </div>`;
    playbar.innerHTML = `<button class="btn btn-primary btn-sm" id="runSep">▶ Run Separation</button><span class="spacer"></span><span class="text-sm" style="color:var(--text-muted)">Choose wisely — not every method works!</span>`;

    controls.querySelector('#mixSel').addEventListener('change', e=>{ mixture=e.target.value; update(false); });
    controls.querySelectorAll('[data-tech]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        controls.querySelectorAll('[data-tech]').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active'); chosen=chip.dataset.tech; update(false);
      });
    });
    playbar.querySelector('#runSep').addEventListener('click', ()=>update(true));

    update(false);
  }

  return { mount: render };
})();
