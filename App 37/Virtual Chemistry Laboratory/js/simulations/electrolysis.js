window.SIM_MODULES = window.SIM_MODULES || {};

window.SIM_MODULES.electrolysis = (function(){
  let electrolyte='water', voltage=6, conc=1, running=false, timer=null, elapsed=0;

  const INFO = {
    water:{name:'Water (acidified)', cathode:'Hydrogen gas (H₂) bubbles', anode:'Oxygen gas (O₂) bubbles', ratio:'2:1 H₂:O₂ by volume'},
    coppersulfate:{name:'Copper sulfate solution (Cu electrodes)', cathode:'Copper metal deposits (pink-red)', anode:'Copper dissolves into solution', ratio:'Cathode gains mass equal to anode loss'},
    moltensalt:{name:'Molten sodium chloride', cathode:'Molten sodium metal forms', anode:'Chlorine gas (Cl₂) released', ratio:'2Na⁺ + 2e⁻ → 2Na ; 2Cl⁻ → Cl₂ + 2e⁻'},
  };

  function sceneSVG(){
    const info = INFO[electrolyte];
    const rate = (voltage/12) * (conc/2);
    let svg = `<svg viewBox="0 0 420 280" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect x="60" y="60" width="300" height="160" fill="${electrolyte==='moltensalt'?'#FFAB91':'#B3E5FC'}" opacity="0.35" stroke="#90A4C4" stroke-width="3" rx="8"/>`;
    // electrodes
    svg += `<rect x="120" y="40" width="14" height="180" fill="#455A64"/>`;
    svg += `<rect x="286" y="40" width="14" height="180" fill="#455A64"/>`;
    svg += `<text x="127" y="30" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Cathode (−)</text>`;
    svg += `<text x="293" y="30" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Anode (+)</text>`;
    // wires + battery
    svg += `<line x1="127" y1="40" x2="127" y2="15" stroke="#333" stroke-width="2"/><line x1="293" y1="40" x2="293" y2="15" stroke="#333" stroke-width="2"/>`;
    svg += `<line x1="127" y1="15" x2="293" y2="15" stroke="#333" stroke-width="2"/>`;
    svg += `<rect x="190" y="4" width="40" height="20" fill="#FFB300" rx="3"/><text x="210" y="18" text-anchor="middle" font-size="10" font-weight="700">${voltage}V</text>`;
    // ions moving
    if(running){
      for(let i=0;i<Math.round(6*rate+2);i++){
        const y = 80+Math.random()*120;
        svg += `<circle cx="200" cy="${y}" r="4" fill="${i%2===0?'#E53935':'#1E88E5'}" opacity="0.85">
          <animate attributeName="cx" values="200;${i%2===0?128:292}" dur="${1.2/Math.max(rate,0.3)}s" repeatCount="indefinite" begin="${i*0.15}s"/>
        </circle>`;
      }
      // bubbles / deposit at electrodes
      if(electrolyte!=='coppersulfate'){
        for(let i=0;i<4;i++){
          svg += `<circle cx="127" cy="200" r="4" fill="#B3E5FC"><animate attributeName="cy" values="200;60" dur="${1+i*0.2}s" repeatCount="indefinite" begin="${i*0.2}s"/></circle>`;
          svg += `<circle cx="293" cy="200" r="4" fill="#C8E6C9"><animate attributeName="cy" values="200;60" dur="${1+i*0.25}s" repeatCount="indefinite" begin="${i*0.25}s"/></circle>`;
        }
      } else {
        svg += `<rect x="118" y="${180-elapsed}" width="18" height="${Math.min(elapsed,38)}" fill="#B87333"/>`;
      }
    }
    svg += `</svg>`;
    return svg;
  }

  function render({stage, controls, playbar, api}){
    api.setHeaders(['Electrolyte','Voltage (V)','Concentration','Cathode Product','Anode Product']);

    function draw(){
      const info = INFO[electrolyte];
      stage.innerHTML = sceneSVG() + `
        <div class="card" style="position:absolute;bottom:10px;left:10px;right:10px;padding:10px 14px">
          <b>${info.name}</b><br/>
          <span class="text-sm">Cathode: ${info.cathode} · Anode: ${info.anode}</span>
        </div>`;
      stage.style.position='relative';
    }

    function tick(){
      elapsed += 1;
      draw();
    }

    controls.innerHTML = `
      <div class="card control-group">
        <h4>Electrolyte</h4>
        <div class="chip-row">
          <div class="chip active" data-e="water">Water</div>
          <div class="chip" data-e="coppersulfate">Copper Sulfate</div>
          <div class="chip" data-e="moltensalt">Molten NaCl</div>
        </div>
      </div>
      <div class="card control-group">
        <h4>Conditions</h4>
        <div class="field"><label>Voltage <span class="val" id="vVal">6 V</span></label><input type="range" id="vRange" min="2" max="12" value="6"/></div>
        <div class="field"><label>Electrolyte concentration <span class="val" id="cVal">1.0 M</span></label><input type="range" id="cRange" min="0.2" max="3" step="0.2" value="1"/></div>
      </div>
      <div class="card control-group">
        <h4>Ion Movement</h4>
        <p style="font-size:13.5px;color:var(--text-muted)" id="ratioNote"></p>
      </div>`;
    playbar.innerHTML = `
      <button class="btn btn-primary btn-sm" id="startBtn">▶ Start Electrolysis</button>
      <button class="btn btn-secondary btn-sm" id="stopBtn">⏸ Pause</button>
      <span class="spacer"></span>
      <button class="btn btn-tertiary btn-sm" id="logBtn">Record Observation</button>`;

    controls.querySelectorAll('[data-e]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        controls.querySelectorAll('[data-e]').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active'); electrolyte=chip.dataset.e; elapsed=0;
        controls.querySelector('#ratioNote').textContent = INFO[electrolyte].ratio;
        draw();
      });
    });
    controls.querySelector('#vRange').addEventListener('input', e=>{ voltage=+e.target.value; controls.querySelector('#vVal').textContent=voltage+' V'; draw(); });
    controls.querySelector('#cRange').addEventListener('input', e=>{ conc=+e.target.value; controls.querySelector('#cVal').textContent=conc.toFixed(1)+' M'; draw(); });

    playbar.querySelector('#startBtn').addEventListener('click', ()=>{
      running=true; clearInterval(timer); timer=setInterval(tick, 500);
      api.progress(60);
    });
    playbar.querySelector('#stopBtn').addEventListener('click', ()=>{ running=false; clearInterval(timer); draw(); });
    playbar.querySelector('#logBtn').addEventListener('click', ()=>{
      const info = INFO[electrolyte];
      api.log([info.name, voltage, conc.toFixed(1)+'M', info.cathode, info.anode]);
      api.toast('Observation recorded');
    });

    controls.querySelector('#ratioNote').textContent = INFO[electrolyte].ratio;
    draw();
  }

  return { mount: render };
})();
