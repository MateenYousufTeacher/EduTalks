window.SIM_MODULES = window.SIM_MODULES || {};

window.SIM_MODULES.bonding = (function(){
  const ATOMS = {
    Na:{name:'Sodium',type:'metal',valence:1,z:11}, K:{name:'Potassium',type:'metal',valence:1,z:19},
    Mg:{name:'Magnesium',type:'metal',valence:2,z:12}, Ca:{name:'Calcium',type:'metal',valence:2,z:20},
    Al:{name:'Aluminium',type:'metal',valence:3,z:13}, Cu:{name:'Copper',type:'metal',valence:2,z:29},
    Fe:{name:'Iron',type:'metal',valence:2,z:26},
    H:{name:'Hydrogen',type:'nonmetal',valence:1,z:1}, O:{name:'Oxygen',type:'nonmetal',valence:2,z:8},
    Cl:{name:'Chlorine',type:'nonmetal',valence:1,z:17}, N:{name:'Nitrogen',type:'nonmetal',valence:3,z:7},
    C:{name:'Carbon',type:'nonmetal',valence:4,z:6}, F:{name:'Fluorine',type:'nonmetal',valence:1,z:9},
  };
  let a='Na', b='Cl';

  function bondType(){
    const A=ATOMS[a], B=ATOMS[b];
    if(a===b && A.type==='metal') return 'metallic';
    if(A.type==='metal' && B.type==='metal') return 'metallic-alloy';
    if(A.type==='nonmetal' && B.type==='nonmetal') return 'covalent';
    return 'ionic';
  }

  function scene(){
    const A=ATOMS[a], B=ATOMS[b];
    const type = bondType();
    let svg = `<svg viewBox="0 0 520 340" xmlns="http://www.w3.org/2000/svg">`;
    const atomCircle=(cx,cy,label,color)=>`<circle cx="${cx}" cy="${cy}" r="44" fill="${color}" stroke="#fff" stroke-width="3"/><text x="${cx}" y="${cy+7}" text-anchor="middle" font-size="20" font-weight="800" fill="#fff">${label}</text>`;

    if(type==='ionic'){
      svg += atomCircle(150,170,a,'#1976D2');
      svg += atomCircle(370,170,b,'#E53935');
      // electron travelling
      for(let i=0;i<A.valence;i++){
        svg += `<circle cx="150" cy="${140+i*20}" r="6" fill="#FFB300"><animate attributeName="cx" values="150;370" dur="1.8s" repeatCount="indefinite" begin="${i*0.3}s"/></circle>`;
      }
      svg += `<text x="150" y="235" text-anchor="middle" font-size="13" fill="var(--text-muted)">${a}${A.valence>1?'²⁺'.replace('²',A.valence===2?'²':(A.valence===3?'³':'')):'⁺'}</text>`;
      svg += `<text x="370" y="235" text-anchor="middle" font-size="13" fill="var(--text-muted)">${b}${B.valence>1?'²⁻':'⁻'}</text>`;
      svg += `<text x="260" y="300" text-anchor="middle" font-size="14" font-weight="700" fill="var(--primary-blue)">Electron transfer → ionic bond</text>`;
    } else if(type==='covalent'){
      svg += atomCircle(190,170,a,'#43A047');
      svg += atomCircle(330,170,b,'#26C6DA');
      const bonds = Math.min(A.valence,B.valence,3);
      for(let i=0;i<bonds;i++){
        const off = (i-((bonds-1)/2))*10;
        svg += `<line x1="230" y1="${170+off}" x2="290" y2="${170+off}" stroke="#FFB300" stroke-width="4"/>`;
      }
      svg += `<circle cx="255" cy="150" r="5" fill="#0D47A1"><animate attributeName="cy" values="150;190;150" dur="1.6s" repeatCount="indefinite"/></circle>`;
      svg += `<circle cx="265" cy="190" r="5" fill="#0D47A1"><animate attributeName="cy" values="190;150;190" dur="1.6s" repeatCount="indefinite"/></circle>`;
      svg += `<text x="260" y="300" text-anchor="middle" font-size="14" font-weight="700" fill="var(--primary-blue)">${bonds} shared electron pair(s) → covalent bond</text>`;
    } else {
      // metallic / alloy
      for(let i=0;i<6;i++){
        const cx = 90+ (i%3)*140, cy = 120+Math.floor(i/3)*110;
        svg += atomCircle(cx,cy, i%2===0?a:b, i%2===0?'#5B6579':'#212121');
      }
      for(let i=0;i<18;i++){
        const cx = 60+Math.random()*400, cy=60+Math.random()*220;
        svg += `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#FFB300" opacity="0.85"><animate attributeName="cx" values="${cx};${cx+ (Math.random()>0.5?30:-30)};${cx}" dur="${1.5+Math.random()}s" repeatCount="indefinite"/></circle>`;
      }
      svg += `<text x="260" y="300" text-anchor="middle" font-size="14" font-weight="700" fill="var(--primary-blue)">Delocalised "electron sea" → metallic bond</text>`;
    }
    svg += `</svg>`;
    return {svg, type};
  }

  function typeLabel(t){
    return {ionic:'Ionic Bond', covalent:'Covalent Bond', metallic:'Metallic Bond', 'metallic-alloy':'Metallic Bond (Alloy)'}[t];
  }

  function render({stage, controls, playbar, api}){
    api.setHeaders(['Atom A','Atom B','Bond Type','Notes']);

    function update(logIt){
      const {svg, type} = scene();
      stage.innerHTML = svg + `<div class="badge badge-blue" style="position:absolute;top:16px;left:16px;font-size:13px;padding:6px 14px">${typeLabel(type)}</div>`;
      stage.style.position='relative';
      if(logIt){
        api.log([a, b, typeLabel(type), `${ATOMS[a].name} + ${ATOMS[b].name}`]);
        api.progress(60);
      }
    }

    const opts = Object.keys(ATOMS).map(k=>`<option value="${k}" ${k===a?'selected':''}>${k} — ${ATOMS[k].name}</option>`).join('');
    controls.innerHTML = `
      <div class="card control-group">
        <h4>Choose Two Atoms</h4>
        <div class="field"><label>Atom A</label><select id="atomA">${opts}</select></div>
        <div class="field"><label>Atom B</label><select id="atomB">${Object.keys(ATOMS).map(k=>`<option value="${k}" ${k===b?'selected':''}>${k} — ${ATOMS[k].name}</option>`).join('')}</select></div>
      </div>
      <div class="card control-group">
        <h4>Quick Pairs</h4>
        <div class="chip-row">
          <div class="chip" data-pair="Na,Cl">Na + Cl (ionic)</div>
          <div class="chip" data-pair="Mg,O">Mg + O (ionic)</div>
          <div class="chip" data-pair="H,O">H + O (covalent)</div>
          <div class="chip" data-pair="C,O">C + O (covalent)</div>
          <div class="chip" data-pair="Cu,Cu">Cu + Cu (metallic)</div>
          <div class="chip" data-pair="Fe,Cu">Fe + Cu (alloy)</div>
        </div>
      </div>`;
    playbar.innerHTML = `<button class="btn btn-primary btn-sm" id="formBond">⚛ Form Bond</button><span class="spacer"></span><span class="text-sm" style="color:var(--text-muted)">Watch electrons transfer or share</span>`;

    controls.querySelector('#atomA').addEventListener('change', e=>{ a=e.target.value; update(false); });
    controls.querySelector('#atomB').addEventListener('change', e=>{ b=e.target.value; update(false); });
    controls.querySelectorAll('[data-pair]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        [a,b] = chip.dataset.pair.split(',');
        controls.querySelector('#atomA').value=a; controls.querySelector('#atomB').value=b;
        update(true);
      });
    });
    playbar.querySelector('#formBond').addEventListener('click', ()=>update(true));

    update(false);
  }

  return { mount: render };
})();
