window.SIM_MODULES = window.SIM_MODULES || {};

window.SIM_MODULES.reactions = (function(){
  const REACTIONS = {
    combination: [
      {label:'2Mg + O₂ → 2MgO', desc:'Magnesium burns brightly in oxygen forming white magnesium oxide.', evidence:'Brilliant white light, heat released, white ash forms.', color:'#fff'},
      {label:'H₂ + Cl₂ → 2HCl', desc:'Hydrogen and chlorine combine to form hydrogen chloride gas.', evidence:'Colourless gas, pungent smell, forms acidic fumes with moisture.', color:'#EEEEEE'},
    ],
    decomposition:[
      {label:'CaCO₃ →(heat) CaO + CO₂', desc:'Limestone decomposes on strong heating into quicklime and carbon dioxide.', evidence:'Gas bubbles (CO₂), solid mass decreases, white solid remains.', color:'#F5F5F5'},
      {label:'2H₂O₂ →(catalyst) 2H₂O + O₂', desc:'Hydrogen peroxide decomposes into water and oxygen with a catalyst.', evidence:'Vigorous fizzing/gas bubbles (O₂), mild warmth.', color:'#E3F2FD'},
    ],
    displacement:[
      {label:'Fe + CuSO₄ → FeSO₄ + Cu', desc:'Iron displaces copper from copper sulfate solution.', evidence:'Blue solution fades, reddish-brown copper coats the iron.', color:'#B87333'},
      {label:'Zn + 2HCl → ZnCl₂ + H₂', desc:'Zinc displaces hydrogen from dilute hydrochloric acid.', evidence:'Rapid gas bubbles (H₂), metal dissolves, flask warms.', color:'#E0E0E0'},
    ],
    'double displacement':[
      {label:'AgNO₃ + NaCl → AgCl↓ + NaNO₃', desc:'Silver nitrate and sodium chloride swap partners, producing insoluble silver chloride.', evidence:'White precipitate forms immediately, solution turns cloudy.', color:'#FAFAFA'},
      {label:'Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃', desc:'Lead nitrate and potassium iodide produce a bright yellow precipitate.', evidence:'Vivid yellow precipitate ("golden rain") settles.', color:'#FDD835'},
    ],
    combustion:[
      {label:'CH₄ + 2O₂ → CO₂ + 2H₂O', desc:'Methane burns completely in oxygen, releasing heat and light.', evidence:'Blue flame, heat released, water vapour condenses on cold surface.', color:'#90CAF9'},
      {label:'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O', desc:'Propane combustion — a common fuel reaction.', evidence:'Bright flame, significant heat release, CO₂ and water produced.', color:'#FFB74D'},
    ],
  };
  let type='combination', idx=0;

  function stageSVG(rxn, type){
    const anim = {
      combination:'flash', decomposition:'bubbles', displacement:'colorfade',
      'double displacement':'precipitate', combustion:'flame'
    }[type];
    let svg = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<path d="M140 60 L140 160 Q140 230 200 230 Q260 230 260 160 L260 60" fill="none" stroke="#90A4C4" stroke-width="4"/>`;
    svg += `<rect x="142" y="150" width="116" height="78" fill="${rxn.color}" opacity="0.75" clip-path="inset(0 round 0 0 40px 40px)"/>`;
    if(anim==='flash'){
      svg += `<circle cx="200" cy="120" r="28" fill="#FFF59D"><animate attributeName="r" values="10;34;10" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/></circle>`;
    } else if(anim==='bubbles'){
      for(let i=0;i<6;i++) svg += `<circle cx="${170+i*10}" cy="220" r="5" fill="#B3E5FC"><animate attributeName="cy" values="220;90" dur="${1.4+i*0.2}s" repeatCount="indefinite" begin="${i*0.25}s"/><animate attributeName="opacity" values="0.9;0" dur="${1.4+i*0.2}s" repeatCount="indefinite" begin="${i*0.25}s"/></circle>`;
    } else if(anim==='colorfade'){
      svg += `<rect x="142" y="150" width="116" height="78" fill="#B87333"><animate attributeName="opacity" values="0;1" dur="2s" fill="freeze"/></rect>`;
    } else if(anim==='precipitate'){
      for(let i=0;i<14;i++) svg += `<circle cx="${160+Math.random()*80}" cy="${160+Math.random()*20}" r="3" fill="#fff"><animate attributeName="cy" values="160;220" dur="${1.6+Math.random()}s" repeatCount="indefinite"/></circle>`;
    } else if(anim==='flame'){
      svg += `<path d="M190 60 Q200 20 210 60 Q220 40 215 65 Q225 55 200 90 Q175 55 185 65 Q180 40 190 60Z" fill="#42A5F5"><animate attributeName="opacity" values="0.7;1;0.7" dur="0.6s" repeatCount="indefinite"/></path>`;
    }
    svg += `<line x1="130" y1="60" x2="270" y2="60" stroke="#90A4C4" stroke-width="4"/>`;
    svg += `</svg>`;
    return svg;
  }

  function render({stage, controls, playbar, api}){
    api.setHeaders(['Reaction Type','Equation','Evidence Observed']);

    function update(logIt){
      const rxn = REACTIONS[type][idx];
      stage.innerHTML = stageSVG(rxn, type) + `
        <div style="position:absolute;bottom:12px;left:12px;right:12px" class="card" style="padding:12px">
          <div style="font-family:var(--font-display);font-weight:800;font-size:16px;color:var(--primary-blue)">${rxn.label}</div>
          <div class="text-sm" style="margin-top:4px">${rxn.desc}</div>
        </div>`;
      stage.style.position='relative';
      const evEl = controls.querySelector('#evidenceText');
      if(evEl) evEl.textContent = rxn.evidence;
      if(logIt){
        api.log([type, rxn.label, rxn.evidence]);
        api.progress(60);
      }
    }

    controls.innerHTML = `
      <div class="card control-group">
        <h4>Reaction Type</h4>
        <div class="chip-row">
          ${Object.keys(REACTIONS).map(t=>`<div class="chip ${t===type?'active':''}" data-type="${t}">${t}</div>`).join('')}
        </div>
      </div>
      <div class="card control-group">
        <h4>Choose Reactants</h4>
        <div id="rxnOptions" class="chip-row"></div>
      </div>
      <div class="card control-group">
        <h4>Evidence of Reaction</h4>
        <p id="evidenceText" style="font-size:13.5px;color:var(--text-muted);margin:0"></p>
      </div>`;
    playbar.innerHTML = `<button class="btn btn-primary btn-sm" id="runRxn">⚗ Run Reaction</button><span class="spacer"></span><span class="text-sm" style="color:var(--text-muted)">Balanced equations update live</span>`;

    function refreshOptions(){
      controls.querySelector('#rxnOptions').innerHTML = REACTIONS[type].map((r,i)=>`<div class="chip ${i===idx?'active':''}" data-idx="${i}">${r.label}</div>`).join('');
      controls.querySelectorAll('[data-idx]').forEach(chip=>{
        chip.addEventListener('click', ()=>{
          idx = +chip.dataset.idx;
          controls.querySelectorAll('[data-idx]').forEach(c=>c.classList.remove('active'));
          chip.classList.add('active');
          update(true);
        });
      });
    }

    controls.querySelectorAll('[data-type]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        type = chip.dataset.type; idx=0;
        controls.querySelectorAll('[data-type]').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active');
        refreshOptions();
        update(true);
      });
    });
    playbar.querySelector('#runRxn').addEventListener('click', ()=>update(true));

    refreshOptions();
    update(false);
  }

  return { mount: render };
})();
