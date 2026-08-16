/* Ancient Egypt Civilization Simulator */
SimModules.egypt = {
  artifactIds:['ankh'],
  mapSvg:`<svg viewBox="0 0 200 300"><rect width="200" height="300" fill="#1a1209"/>
    <path d="M100 0 C 80 80, 90 160, 70 300 L120 300 C110 160, 118 80, 100 0 Z" fill="#2C4A7C" opacity=".55"/>
    <circle cx="100" cy="40" r="5" fill="#C49A4E"/><text x="106" y="44" fill="#C9B79A" font-size="9">Memphis</text>
    <circle cx="85" cy="150" r="5" fill="#C49A4E"/><text x="91" y="154" fill="#C9B79A" font-size="9">Thebes</text>
    <circle cx="90" cy="260" r="5" fill="#C49A4E"/><text x="96" y="264" fill="#C9B79A" font-size="9">Nubia border</text></svg>`,
  mount(stageEl, sideStatsEl, controlsEl, api){
    const S = SimUtils;
    let st;
    function fresh(){ return { turn:1, maxTurn:10, granary:60, treasury:40, monument:0, stability:60, floodLog:'', done:false }; }
    st = fresh();

    stageEl.innerHTML = `
      <div class="stage-canvas-wrap"><canvas id="egCanvas"></canvas></div>
      <p class="muted" id="egLog">Season 1: The Nile awaits its flood. Allocate your kingdom's labour below, then advance the season.</p>
      <div id="allocHost"></div>
    `;
    const canvas = stageEl.querySelector('#egCanvas');
    const ctx = S.fitCanvas(canvas, 900, 340);

    alloc = S.buildAllocators(stageEl.querySelector('#allocHost'), [
      {key:'agri', label:'🌾 Agriculture Labour', default:45},
      {key:'mon', label:'🏗️ Monument Construction', default:30},
      {key:'trade', label:'⛵ Trade Expeditions', default:25},
    ], ()=>{});

    function draw(){
      const w=canvas.width,h=canvas.height;
      ctx.clearRect(0,0,w,h);
      const sky = ctx.createLinearGradient(0,0,0,h*0.65);
      sky.addColorStop(0,'#3a2410'); sky.addColorStop(1,'#c98a3a');
      ctx.fillStyle=sky; ctx.fillRect(0,0,w,h*0.65);
      ctx.fillStyle='#D98E2B'; ctx.beginPath(); ctx.arc(120,90,40,0,7); ctx.fill();
      ctx.fillStyle='#8a6a2e'; ctx.fillRect(0,h*0.62,w,h*0.38); // desert
      ctx.fillStyle='#2C4A7C'; ctx.fillRect(0,h*0.85,w,h*0.15); // nile
      // pyramid grows with monument progress
      const baseX=w*0.62, baseY=h*0.62, maxHt=210;
      const ht = maxHt*(st.monument/100);
      ctx.fillStyle='#C49A4E';
      ctx.beginPath(); ctx.moveTo(baseX-130,baseY); ctx.lineTo(baseX,baseY-ht); ctx.lineTo(baseX+130,baseY); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.moveTo(baseX,baseY-ht); ctx.lineTo(baseX,baseY); ctx.stroke();
      // granary stacks
      const stacks = Math.round(st.granary/20);
      for(let i=0;i<stacks;i++){
        ctx.fillStyle='#E8C77A';
        ctx.beginPath(); ctx.ellipse(80+i*36, h*0.58, 14, 18, 0, 0, 7); ctx.fill();
      }
      // trade boats
      const boats = Math.round(st.treasury/25);
      for(let i=0;i<boats;i++){
        ctx.fillStyle='#F3E9D2';
        ctx.beginPath(); ctx.moveTo(600+i*70, h*0.92); ctx.lineTo(650+i*70, h*0.92); ctx.lineTo(635+i*70, h*0.98); ctx.lineTo(615+i*70,h*0.98); ctx.closePath(); ctx.fill();
        ctx.fillRect(628+i*70, h*0.80, 2, 18);
      }
      ctx.fillStyle='#F3E9D2'; ctx.font='13px monospace'; ctx.fillText(`Season ${st.turn} / ${st.maxTurn}`, 16, 24);
    }

    function refresh(){
      draw();
      api.renderStats([
        {label:'Granary (Food)', value:st.granary, kind: st.granary<25?'bad':'good'},
        {label:'Treasury (Trade)', value:st.treasury, kind:'gold'},
        {label:'Monument Progress', value:st.monument, kind:'info'},
        {label:'Stability', value:st.stability, kind: st.stability<30?'bad':st.stability<55?'warn':'good'},
        {label:'Season', value:(st.turn/st.maxTurn)*100, display:`${st.turn}/${st.maxTurn}`, kind:'gold'},
      ]);
    }

    function advance(){
      if(st.done){ api.toast('The reign has ended — reset to begin a new kingdom.'); return; }
      const a = alloc.get();
      const flood = S.pick(['Low','Normal','Normal','High']);
      const floodMult = flood==='Low' ? 0.55 : flood==='High' ? 1.35 : 1;
      st.granary = S.clamp(st.granary + (a.agri*0.5*floodMult) - 22, 0, 100);
      st.treasury = S.clamp(st.treasury + a.trade*0.45 - 12, 0, 100);
      st.monument = S.clamp(st.monument + a.mon*0.32, 0, 100);
      let stabilityDelta = 0;
      if(st.granary<20) stabilityDelta -= 12;
      if(st.treasury<15) stabilityDelta -= 6;
      if(st.monument>=100 && st.stability>60) stabilityDelta += 10;
      stabilityDelta += (flood==='High'? 3 : flood==='Low'? -4 : 1);
      st.stability = S.clamp(st.stability + stabilityDelta, 0, 100);
      st.turn++;
      const floodTxt = flood==='Low' ? 'a weak flood — harvests will suffer' : flood==='High' ? 'a bountiful flood — fields flourish' : 'a normal, steady flood';
      stageEl.querySelector('#egLog').textContent = `Season ${st.turn-1}: The Nile brought ${floodTxt}. Granary ${st.granary<20?'is critically low':'holds steady'}, treasury ${st.treasury<15?'runs thin':'grows'}.`;
      if(st.turn>st.maxTurn){
        st.done = true;
        stageEl.querySelector('#egLog').textContent += ` — Your reign concludes. Final stability: ${Math.round(st.stability)}/100.`;
        api.toast(st.stability>=60 ? 'Your kingdom prospered!' : 'Your kingdom struggled through hardship.');
      }
      refresh();
    }

    api.renderControls([
      { label:'Advance Season', icon:api.icons.step, onClick: advance },
    ]);
    api.onReset(()=>{ st = fresh(); refresh(); });
    refresh();
  },
  quiz:[
    {q:'Why was the Nile flood so central to Ancient Egyptian civilization?', options:['It provided fertile silt for farming', 'It powered early machinery', 'It was used only for religious bathing', 'It had no real impact on farming'], correct:0, explain:'Annual floods deposited fertile silt that sustained dense agricultural populations.'},
    {q:'What does recent evidence about pyramid workers show?', options:['They were entirely enslaved captives', 'They were paid, organised labour crews', 'Pyramids were built by machines', 'No workers were needed'], correct:1, explain:'Workers\u2019 villages show evidence of paid, organised labour, not slave-built myths.'},
    {q:'What was the religious purpose of mummification?', options:['Purely medical study', 'To prepare the soul (ka) for the afterlife', 'A form of punishment', 'It had no religious meaning'], correct:1, explain:'Mummification was a religious act tied to Egyptian beliefs about the afterlife.'},
    {q:'What might happen in this simulation if you neglect agriculture for many seasons?', options:['Treasury instantly maxes out', 'Granary and stability both decline', 'Monuments build twice as fast', 'Nothing changes'], correct:1, explain:'Low food stock reduces stability, reflecting real risks of famine to political order.'},
    {q:'Roughly when was Egyptian hieroglyphic writing developed?', options:['Around 3200 BCE', 'Around 1900 CE', 'Around 500 BCE only', 'It was never used for writing'], correct:0, explain:'Hieroglyphics emerged as one of the earliest writing systems around 3200 BCE.'},
  ]
};
