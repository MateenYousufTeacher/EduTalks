window.SIM_MODULES = window.SIM_MODULES || {};

window.SIM_MODULES.phlab = (function(){
  const SOLUTIONS = {
    'Battery acid': 0.5, 'Lemon juice': 2.2, 'Vinegar': 2.9, 'Orange juice': 3.5,
    'Black coffee': 5.0, 'Rainwater': 5.6, 'Pure water': 7.0, 'Blood': 7.4,
    'Sea water': 8.1, 'Baking soda solution': 9.0, 'Soap solution': 10.5,
    'Ammonia solution': 11.5, 'Bleach': 12.5, 'Drain cleaner (NaOH)': 13.5,
  };
  let solution='Lemon juice';
  let indicator='universal';
  let acidVol=0, baseVol=0;
  let history=[];

  function phColor(ph){
    // universal indicator rainbow: red(0) -> green(7) -> violet(14)
    const stops = [
      [0,'#E53935'],[2,'#F4511E'],[4,'#FB8C00'],[6,'#FDD835'],[7,'#43A047'],
      [9,'#26A69A'],[11,'#1E88E5'],[13,'#5E35B1'],[14,'#8E24AA']
    ];
    for(let i=0;i<stops.length-1;i++){
      if(ph>=stops[i][0] && ph<=stops[i+1][0]) return stops[i][1];
    }
    return stops[stops.length-1][1];
  }
  function litmusColor(ph){ return ph<7 ? '#E53935' : (ph>7 ? '#1E88E5' : '#8E24AA'); }

  function mixedPH(){
    if(acidVol===0 && baseVol===0) return SOLUTIONS[solution];
    // simplistic linear model: acid pH 2, base pH 12, weighted by volume, trending to 7
    const total = acidVol+baseVol || 1;
    const acidPH=2, basePH=12;
    let ph = (acidVol*acidPH + baseVol*basePH)/total;
    // push toward 7 as volumes balance
    const balance = 1 - Math.abs(acidVol-baseVol)/(total);
    ph = ph + (7-ph)*balance*0.5;
    return Math.max(0, Math.min(14, ph));
  }

  function beakerSVG(ph, label){
    const color = indicator==='litmus' ? litmusColor(ph) : phColor(ph);
    const fillH = 140;
    return `<svg viewBox="0 0 260 300" xmlns="http://www.w3.org/2000/svg">
      <path d="M70 40 L70 180 Q70 240 130 240 Q190 240 190 180 L190 40" fill="none" stroke="#90A4C4" stroke-width="4"/>
      <clipPath id="beakerClip"><path d="M72 ${240-fillH} L72 180 Q72 238 130 238 Q188 238 188 180 L188 ${240-fillH}"/></clipPath>
      <rect x="70" y="${240-fillH}" width="120" height="${fillH}" fill="${color}" opacity="0.8" clip-path="url(#beakerClip)">
        <animate attributeName="opacity" values="0.6;0.85;0.6" dur="2.4s" repeatCount="indefinite"/>
      </rect>
      <line x1="60" y1="40" x2="200" y2="40" stroke="#90A4C4" stroke-width="4"/>
      <text x="130" y="270" text-anchor="middle" font-size="15" font-weight="700" fill="var(--text)">${label}</text>
      <text x="130" y="150" text-anchor="middle" font-size="26" font-weight="800" fill="#fff">pH ${ph.toFixed(1)}</text>
    </svg>`;
  }

  function classify(ph){
    if(ph<3) return {label:'Strongly Acidic', cls:'badge-red'};
    if(ph<7) return {label:'Weakly Acidic', cls:'badge-amber'};
    if(ph===7) return {label:'Neutral', cls:'badge-green'};
    if(ph<11) return {label:'Weakly Basic', cls:'badge-blue'};
    return {label:'Strongly Basic', cls:'badge-blue'};
  }

  function graphSVG(){
    const w=460,h=140,pad=30;
    let pts = history.slice(-20);
    if(pts.length<2) return `<svg viewBox="0 0 ${w} ${h}"><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="var(--text-muted)" font-size="13">Mix solutions to plot pH vs total volume</text></svg>`;
    const maxX = Math.max(...pts.map(p=>p.v),1);
    const path = pts.map((p,i)=>{
      const x = pad + (p.v/maxX)*(w-2*pad);
      const y = h-pad - (p.ph/14)*(h-2*pad);
      return `${i===0?'M':'L'}${x},${y}`;
    }).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}">
      <line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="var(--border)" stroke-width="1.5"/>
      <line x1="${pad}" y1="${pad-10}" x2="${pad}" y2="${h-pad}" stroke="var(--border)" stroke-width="1.5"/>
      <path d="${path}" fill="none" stroke="var(--primary-blue)" stroke-width="2.5"/>
      <text x="${w/2}" y="${h-6}" text-anchor="middle" font-size="10" fill="var(--text-muted)">Total volume added (mL)</text>
      <text x="10" y="${h/2}" font-size="10" fill="var(--text-muted)" transform="rotate(-90 10 ${h/2})">pH</text>
    </svg>`;
  }

  function render({stage, controls, playbar, api}){
    api.setHeaders(['Solution','Indicator','pH','Classification']);

    function update(logIt){
      const ph = mixedPH();
      const cls = classify(ph);
      const label = (acidVol||baseVol) ? `Acid ${acidVol}mL + Base ${baseVol}mL` : solution;
      stage.innerHTML = `<div style="display:flex;gap:30px;align-items:center;justify-content:center;flex-wrap:wrap;height:100%">
        <div>${beakerSVG(ph,label)}</div>
        <div style="min-width:220px">
          <div class="badge ${cls.cls}" style="font-size:14px;padding:8px 16px;margin-bottom:14px">${cls.label}</div>
          <div class="card" style="padding:14px">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);font-weight:800;margin-bottom:8px">pH vs Volume</div>
            ${graphSVG()}
          </div>
        </div>
      </div>`;
      if(logIt){
        api.log([label, indicator==='litmus'?'Litmus':(indicator==='universal'?'Universal indicator':'pH meter'), ph.toFixed(2), cls.label]);
        api.progress(60);
      }
    }

    controls.innerHTML = `
      <div class="card control-group">
        <h4>Choose Solution</h4>
        <select id="solutionSel">${Object.keys(SOLUTIONS).map(s=>`<option ${s===solution?'selected':''}>${s}</option>`).join('')}</select>
      </div>
      <div class="card control-group">
        <h4>Indicator</h4>
        <div class="chip-row">
          <div class="chip active" data-ind="universal">Universal Indicator</div>
          <div class="chip" data-ind="litmus">Litmus Paper</div>
          <div class="chip" data-ind="meter">pH Meter</div>
        </div>
      </div>
      <div class="card control-group">
        <h4>Titration — Mix Acid & Base</h4>
        <div class="field"><label>Acid added <span class="val" id="acidValLbl">0 mL</span></label><input type="range" id="acidRange" min="0" max="50" value="0"/></div>
        <div class="field"><label>Base added <span class="val" id="baseValLbl">0 mL</span></label><input type="range" id="baseRange" min="0" max="50" value="0"/></div>
        <button class="btn btn-secondary btn-sm" id="resetTitration" style="width:100%">Reset Titration</button>
      </div>`;
    playbar.innerHTML = `<button class="btn btn-primary btn-sm" id="testBtn">🧪 Test Solution</button><span class="spacer"></span><span class="text-sm" style="color:var(--text-muted)">Neutral = pH 7</span>`;

    controls.querySelector('#solutionSel').addEventListener('change', e=>{ solution=e.target.value; acidVol=0; baseVol=0; history=[]; controls.querySelector('#acidRange').value=0; controls.querySelector('#baseRange').value=0; update(false); });
    controls.querySelectorAll('[data-ind]').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        controls.querySelectorAll('[data-ind]').forEach(c=>c.classList.remove('active'));
        chip.classList.add('active'); indicator=chip.dataset.ind; update(false);
      });
    });
    controls.querySelector('#acidRange').addEventListener('input', e=>{
      acidVol=+e.target.value; controls.querySelector('#acidValLbl').textContent=acidVol+' mL';
      history.push({v:acidVol+baseVol, ph:mixedPH()}); update(false);
    });
    controls.querySelector('#baseRange').addEventListener('input', e=>{
      baseVol=+e.target.value; controls.querySelector('#baseValLbl').textContent=baseVol+' mL';
      history.push({v:acidVol+baseVol, ph:mixedPH()}); update(false);
    });
    controls.querySelector('#resetTitration').addEventListener('click', ()=>{
      acidVol=0; baseVol=0; history=[];
      controls.querySelector('#acidRange').value=0; controls.querySelector('#baseRange').value=0;
      controls.querySelector('#acidValLbl').textContent='0 mL'; controls.querySelector('#baseValLbl').textContent='0 mL';
      update(false);
    });
    playbar.querySelector('#testBtn').addEventListener('click', ()=>update(true));

    update(false);
  }

  return { mount: render };
})();
