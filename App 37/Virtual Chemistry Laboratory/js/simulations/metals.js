window.SIM_MODULES = window.SIM_MODULES || {};

window.SIM_MODULES.metals = (function(){
  const SAMPLES = {
    Sodium:{type:'metal', reactivity:9.5, conduct:8, malleable:6, lustre:9, flame:'Bright yellow', water:'Reacts violently, fizzes, may ignite', acid:'Extremely vigorous reaction'},
    Magnesium:{type:'metal', reactivity:7, conduct:7, malleable:6, lustre:8, flame:'Brilliant white', water:'Slow reaction with cold water, faster with steam', acid:'Vigorous fizzing, hydrogen gas released'},
    Iron:{type:'metal', reactivity:5, conduct:6, malleable:7, lustre:7, flame:'Gold sparks', water:'Rusts slowly with water + oxygen', acid:'Steady fizzing, hydrogen gas released'},
    Copper:{type:'metal', reactivity:2, conduct:9, malleable:8, lustre:9, flame:'Blue-green', water:'No visible reaction', acid:'No reaction with dilute acid'},
    Gold:{type:'metal', reactivity:0.5, conduct:9, malleable:10, lustre:10, flame:'No distinct colour', water:'No reaction', acid:'No reaction, even with most acids'},
    Zinc:{type:'metal', reactivity:6, conduct:6, malleable:5, lustre:6, flame:'Blue-green with white smoke', water:'Very slow with cold water', acid:'Brisk fizzing, hydrogen gas released'},
    Sulfur:{type:'nonmetal', reactivity:4, conduct:0.5, malleable:0, lustre:1, flame:'Blue flame, choking smell', water:'No reaction, insoluble', acid:'No reaction'},
    Carbon_graphite:{type:'nonmetal', label:'Carbon (graphite)', reactivity:1, conduct:6, malleable:0, lustre:3, flame:'Glows red, slow burn', water:'No reaction, insoluble', acid:'No reaction'},
    Iodine:{type:'nonmetal', reactivity:3, conduct:0.2, malleable:0, lustre:4, flame:'Violet vapour', water:'Poorly soluble', acid:'No reaction'},
  };

  let sample='Sodium';

  function testResult(test){
    const s = SAMPLES[sample];
    if(s.type==='nonmetal' && (test==='hammer'||test==='wire')) return {result:'Shatters / crumbles', good:false};
    if(test==='hammer') return {result:`Flattens into a sheet (malleability ${s.malleable}/10)`, good:true};
    if(test==='wire') return {result: s.type==='metal' ? `Draws into a thin wire (ductility ~${s.malleable}/10)` : 'Cannot be drawn into wire — brittle', good:s.type==='metal'};
    if(test==='conduct') return {result:`Bulb brightness: ${s.conduct}/10 conductivity`, good:s.conduct>4};
    if(test==='heat') return {result: s.type==='metal' ? 'Glows red-hot, does not burn easily' : 'May burn or char depending on sample', good:true};
    if(test==='water') return {result:s.water, good:true};
    if(test==='acid') return {result:s.acid, good:true};
    if(test==='flame') return {result:`Flame colour: ${s.flame}`, good:true};
    return {result:'—', good:true};
  }

  function labelFor(k){ return SAMPLES[k].label || k.replace('_',' '); }

  function stageSVG(test, res){
    let svg = `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">`;
    const s=SAMPLES[sample];
    const color = s.type==='metal' ? '#B0BEC5' : '#8D6E63';
    if(test==='flame'){
      const flameColorMap = {Sodium:'#FDD835',Magnesium:'#FFFFFF',Iron:'#FFD54F',Copper:'#26A69A',Gold:'#BDBDBD',Zinc:'#4FC3F7',Sulfur:'#42A5F5',Carbon_graphite:'#EF5350',Iodine:'#AB47BC'};
      svg += `<rect x="180" y="180" width="40" height="60" fill="#78909C"/>`;
      svg += `<path d="M190 180 Q200 100 210 180 Q220 140 205 190 Q230 170 200 220 Q170 170 195 190 Q180 140 190 180Z" fill="${flameColorMap[sample]||'#FFB300'}"><animate attributeName="opacity" values="0.7;1;0.7" dur="0.6s" repeatCount="indefinite"/></path>`;
    } else if(test==='water' || test==='acid'){
      svg += `<path d="M140 60 L140 160 Q140 220 200 220 Q260 220 260 160 L260 60" fill="none" stroke="#90A4C4" stroke-width="4"/>`;
      svg += `<rect x="142" y="150" width="116" height="68" fill="${test==='acid'?'#E1F5FE':'#E3F2FD'}" opacity="0.7"/>`;
      svg += `<rect x="190" y="140" width="20" height="30" fill="${color}"/>`;
      if(res.result.toLowerCase().includes('fizz') || res.result.toLowerCase().includes('vigorous') || res.result.toLowerCase().includes('violent')){
        for(let i=0;i<8;i++) svg += `<circle cx="${170+i*8}" cy="200" r="4" fill="#B3E5FC"><animate attributeName="cy" values="200;70" dur="${1+i*0.15}s" repeatCount="indefinite" begin="${i*0.2}s"/><animate attributeName="opacity" values="0.9;0" dur="${1+i*0.15}s" repeatCount="indefinite" begin="${i*0.2}s"/></circle>`;
      }
      svg += `<line x1="130" y1="60" x2="270" y2="60" stroke="#90A4C4" stroke-width="4"/>`;
    } else if(test==='hammer'){
      svg += `<rect x="150" y="150" width="${res.good?100:40}" height="${res.good?18:40}" fill="${color}" rx="4"/>`;
      svg += `<text x="200" y="120" text-anchor="middle" font-size="30">🔨</text>`;
    } else if(test==='wire'){
      if(res.good) svg += `<path d="M100 180 Q200 100 300 180" stroke="${color}" stroke-width="4" fill="none"/>`;
      else svg += `<g>${[0,1,2,3].map(i=>`<rect x="${170+i*15}" y="170" width="10" height="10" fill="${color}"/>`).join('')}</g>`;
    } else if(test==='conduct'){
      const bright = s.conduct/10;
      svg += `<circle cx="200" cy="120" r="30" fill="#FFF59D" opacity="${bright}"/><circle cx="200" cy="120" r="30" fill="none" stroke="#FBC02D" stroke-width="2"/>`;
      svg += `<rect x="180" y="170" width="40" height="20" fill="${color}"/>`;
      svg += `<line x1="150" y1="180" x2="180" y2="180" stroke="#333" stroke-width="3"/><line x1="220" y1="180" x2="250" y2="180" stroke="#333" stroke-width="3"/>`;
    } else if(test==='heat'){
      svg += `<rect x="180" y="140" width="40" height="60" fill="${color}"><animate attributeName="fill" values="${color};#FF7043;${color}" dur="1.6s" repeatCount="indefinite"/></rect>`;
      svg += `<path d="M190 200 L190 230 M210 200 L210 230" stroke="#FF7043" stroke-width="3"/>`;
    } else {
      svg += `<rect x="180" y="140" width="40" height="60" fill="${color}" rx="6"/>`;
    }
    svg += `</svg>`;
    return svg;
  }

  function render({stage, controls, playbar, api}){
    api.setHeaders(['Sample','Test','Result']);
    let lastTest='hammer';

    function update(test, logIt){
      lastTest = test || lastTest;
      const res = testResult(lastTest);
      stage.innerHTML = stageSVG(lastTest, res) + `
        <div class="card" style="position:absolute;bottom:12px;left:12px;right:12px;padding:12px">
          <b>${labelFor(sample)}</b> — ${lastTest} test<br/>
          <span style="color:${res.good?'var(--green)':'var(--danger)'};font-weight:700">${res.result}</span>
        </div>`;
      stage.style.position='relative';
      if(logIt){ api.log([labelFor(sample), lastTest, res.result]); api.progress(60); }
    }

    controls.innerHTML = `
      <div class="card control-group">
        <h4>Choose Sample</h4>
        <select id="sampleSel">${Object.keys(SAMPLES).map(k=>`<option value="${k}" ${k===sample?'selected':''}>${labelFor(k)} (${SAMPLES[k].type})</option>`).join('')}</select>
      </div>
      <div class="card control-group">
        <h4>Run a Test</h4>
        <div class="chip-row">
          <div class="chip active" data-test="hammer">🔨 Hammer</div>
          <div class="chip" data-test="wire">➰ Wire Draw</div>
          <div class="chip" data-test="conduct">💡 Conductivity</div>
          <div class="chip" data-test="heat">🔥 Heat</div>
          <div class="chip" data-test="water">💧 + Water</div>
          <div class="chip" data-test="acid">🧪 + Dilute Acid</div>
          <div class="chip" data-test="flame">🎆 Flame Test</div>
        </div>
      </div>
      <div class="card control-group">
        <h4>Property Profile (out of 10)</h4>
        <div id="propBars"></div>
      </div>`;
    playbar.innerHTML = `<span class="text-sm" style="color:var(--text-muted)">Select a sample, then click a test chip to run it</span>`;

    function drawBars(){
      const s = SAMPLES[sample];
      const rows = [['Reactivity',s.reactivity],['Conductivity',s.conduct],['Malleability',s.malleable],['Lustre',s.lustre]];
      controls.querySelector('#propBars').innerHTML = rows.map(([k,v])=>`
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px"><span>${k}</span><span>${v}/10</span></div>
          <div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden"><div style="height:100%;width:${v*10}%;background:var(--primary-blue)"></div></div>
        </div>`).join('');
    }

    controls.querySelector('#sampleSel').addEventListener('change', e=>{ sample=e.target.value; drawBars(); update(lastTest, false); });
    controls.querySelectorAll('[data-test]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        controls.querySelectorAll('[data-test]').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active');
        update(chip.dataset.test, true);
      });
    });

    drawBars();
    update('hammer', false);
  }

  return { mount: render };
})();
