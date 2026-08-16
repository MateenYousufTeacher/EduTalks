window.SIM_MODULES = window.SIM_MODULES || {};

window.SIM_MODULES.balancing = (function(){
  // Each problem: reactants/products as [{formula, atoms:{el:count}}], correct coefficients
  const PROBLEMS = {
    easy:[
      { reactants:[{f:'H₂',a:{H:2}},{f:'O₂',a:{O:2}}], products:[{f:'H₂O',a:{H:2,O:1}}], correct:[2,1,2] },
      { reactants:[{f:'N₂',a:{N:2}},{f:'H₂',a:{H:2}}], products:[{f:'NH₃',a:{N:1,H:3}}], correct:[1,3,2] },
      { reactants:[{f:'Mg',a:{Mg:1}},{f:'O₂',a:{O:2}}], products:[{f:'MgO',a:{Mg:1,O:1}}], correct:[2,1,2] },
    ],
    medium:[
      { reactants:[{f:'Fe',a:{Fe:1}},{f:'O₂',a:{O:2}}], products:[{f:'Fe₂O₃',a:{Fe:2,O:3}}], correct:[4,3,2] },
      { reactants:[{f:'Al',a:{Al:1}},{f:'HCl',a:{H:1,Cl:1}}], products:[{f:'AlCl₃',a:{Al:1,Cl:3}},{f:'H₂',a:{H:2}}], correct:[2,6,2,3] },
      { reactants:[{f:'C₃H₈',a:{C:3,H:8}},{f:'O₂',a:{O:2}}], products:[{f:'CO₂',a:{C:1,O:2}},{f:'H₂O',a:{H:2,O:1}}], correct:[1,5,3,4] },
    ],
    hard:[
      { reactants:[{f:'C₆H₁₂O₆',a:{C:6,H:12,O:6}},{f:'O₂',a:{O:2}}], products:[{f:'CO₂',a:{C:1,O:2}},{f:'H₂O',a:{H:2,O:1}}], correct:[1,6,6,6] },
      { reactants:[{f:'KMnO₄',a:{K:1,Mn:1,O:4}},{f:'HCl',a:{H:1,Cl:1}}], products:[{f:'KCl',a:{K:1,Cl:1}},{f:'MnCl₂',a:{Mn:1,Cl:2}},{f:'H₂O',a:{H:2,O:1}},{f:'Cl₂',a:{Cl:2}}], correct:[2,16,2,2,8,5] },
    ]
  };
  let difficulty='easy', probIdx=0, coeffs=[];

  function currentProblem(){ return PROBLEMS[difficulty][probIdx]; }

  function allSpecies(p){ return [...p.reactants, ...p.products]; }

  function atomTotals(p, coeffs){
    const totals = {side:{}, };
    const reactTot={}, prodTot={};
    p.reactants.forEach((sp,i)=>{
      const c = coeffs[i]||0;
      Object.entries(sp.a).forEach(([el,n])=>{ reactTot[el]=(reactTot[el]||0)+n*c; });
    });
    p.products.forEach((sp,i)=>{
      const c = coeffs[p.reactants.length+i]||0;
      Object.entries(sp.a).forEach(([el,n])=>{ prodTot[el]=(prodTot[el]||0)+n*c; });
    });
    return {reactTot, prodTot};
  }

  function isBalanced(p, coeffs){
    const {reactTot, prodTot} = atomTotals(p, coeffs);
    const els = new Set([...Object.keys(reactTot), ...Object.keys(prodTot)]);
    if(coeffs.some(c=>!c || c<1)) return false;
    for(const el of els){ if((reactTot[el]||0) !== (prodTot[el]||0)) return false; }
    return true;
  }

  function equationHTML(p, coeffs){
    const r = p.reactants.map((sp,i)=>`<span class="coef" data-i="${i}">${coeffs[i]||1}</span>${sp.f}`).join(' + ');
    const pr = p.products.map((sp,i)=>`<span class="coef" data-i="${p.reactants.length+i}">${coeffs[p.reactants.length+i]||1}</span>${sp.f}`).join(' + ');
    return `${r} → ${pr}`;
  }

  function atomTableHTML(p, coeffs){
    const {reactTot, prodTot} = atomTotals(p, coeffs);
    const els = [...new Set([...Object.keys(reactTot), ...Object.keys(prodTot)])];
    return `<table class="obs-table"><thead><tr><th>Element</th><th>Reactant side</th><th>Product side</th><th>Balanced?</th></tr></thead><tbody>
      ${els.map(el=>{
        const rc=reactTot[el]||0, pc=prodTot[el]||0;
        return `<tr><td>${el}</td><td>${rc}</td><td>${pc}</td><td>${rc===pc?'<span class=\"badge badge-green\">✓</span>':'<span class=\"badge badge-red\">✗</span>'}</td></tr>`;
      }).join('')}
    </tbody></table>`;
  }

  function render({stage, controls, playbar, api}){
    api.setHeaders(['Difficulty','Equation','Result']);

    function newProblem(sameDiff){
      probIdx = Math.floor(Math.random()*PROBLEMS[difficulty].length);
      const p = currentProblem();
      coeffs = allSpecies(p).map(()=>1);
      draw();
    }

    function draw(){
      const p = currentProblem();
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;height:100%;justify-content:center;gap:22px;padding:10px">
          <div style="text-align:center;font-size:22px;font-weight:800;font-family:var(--font-display);letter-spacing:.5px" id="eqDisplay"></div>
          <div id="atomTableWrap"></div>
          <div id="balanceStatus" style="text-align:center;font-weight:700"></div>
        </div>`;
      renderCoeffButtons();
      refresh();
    }

    function renderCoeffButtons(){
      const p = currentProblem();
      const wrap = document.createElement('div');
      const species = allSpecies(p);
      controls.querySelector('#coeffControls').innerHTML = species.map((sp,i)=>`
        <div class="field">
          <label>${sp.f} coefficient <span class="val" id="cVal${i}">${coeffs[i]}</span></label>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" data-cminus="${i}">−</button>
            <input type="range" min="1" max="10" value="${coeffs[i]}" data-crange="${i}"/>
            <button class="btn btn-secondary btn-sm" data-cplus="${i}">+</button>
          </div>
        </div>`).join('');
      controls.querySelectorAll('[data-crange]').forEach(inp=>{
        inp.addEventListener('input', e=>{ coeffs[+inp.dataset.crange]=+e.target.value; refresh(); });
      });
      controls.querySelectorAll('[data-cminus]').forEach(btn=>{
        btn.addEventListener('click', ()=>{ const i=+btn.dataset.cminus; coeffs[i]=Math.max(1,coeffs[i]-1); refresh(); });
      });
      controls.querySelectorAll('[data-cplus]').forEach(btn=>{
        btn.addEventListener('click', ()=>{ const i=+btn.dataset.cplus; coeffs[i]=Math.min(10,coeffs[i]+1); refresh(); });
      });
    }

    function refresh(logIt){
      const p = currentProblem();
      document.getElementById('eqDisplay').innerHTML = equationHTML(p, coeffs);
      document.getElementById('atomTableWrap').innerHTML = atomTableHTML(p, coeffs);
      const balanced = isBalanced(p, coeffs);
      document.getElementById('balanceStatus').innerHTML = balanced
        ? `<span style="color:var(--green)">✓ Balanced! Conservation of mass satisfied.</span>`
        : `<span style="color:var(--danger)">Not yet balanced — adjust coefficients.</span>`;
      allSpecies(p).forEach((sp,i)=>{ const el=controls.querySelector('#cVal'+i); if(el) el.textContent=coeffs[i]; const r=controls.querySelector(`[data-crange="${i}"]`); if(r) r.value=coeffs[i]; });
      if(balanced){
        api.progress(70);
        if(logIt!==false) api.log([difficulty, equationHTML(p,coeffs).replace(/<[^>]+>/g,''), 'Balanced ✓']);
      }
    }

    controls.innerHTML = `
      <div class="card control-group">
        <h4>Difficulty</h4>
        <div class="chip-row">
          <div class="chip active" data-diff="easy">Easy</div>
          <div class="chip" data-diff="medium">Medium</div>
          <div class="chip" data-diff="hard">Hard</div>
        </div>
      </div>
      <div class="card control-group">
        <h4>Adjust Coefficients</h4>
        <div id="coeffControls"></div>
      </div>
      <div class="card control-group">
        <h4>Hint</h4>
        <p style="font-size:13.5px;color:var(--text-muted)" id="hintText">Balance elements appearing in only one compound per side first; leave free diatomic elements (O₂, H₂, N₂, Cl₂) for last.</p>
      </div>`;
    playbar.innerHTML = `<button class="btn btn-secondary btn-sm" id="newProb">🔄 New Problem</button><span class="spacer"></span><button class="btn btn-primary btn-sm" id="checkBtn">✓ Check Balance</button>`;

    controls.querySelectorAll('[data-diff]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        difficulty = chip.dataset.diff;
        controls.querySelectorAll('[data-diff]').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active');
        newProblem();
      });
    });
    playbar.querySelector('#newProb').addEventListener('click', ()=>newProblem());
    playbar.querySelector('#checkBtn').addEventListener('click', ()=>{
      const balanced = isBalanced(currentProblem(), coeffs);
      api.toast(balanced ? '🎉 Correctly balanced!' : 'Not balanced yet — check the atom table.');
      refresh(true);
    });

    newProblem();
  }

  return { mount: render };
})();
