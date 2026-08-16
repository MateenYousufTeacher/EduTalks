/* Mughal Empire Administration Simulator */
SimModules.mughal = {
  artifactIds:['miniature'],
  mapSvg:`<svg viewBox="0 0 220 260"><rect width="220" height="260" fill="#1c1018"/>
    <circle cx="90" cy="60" r="7" fill="#C49A4E"/><text x="100" y="64" fill="#C9B79A" font-size="9">Agra</text>
    <circle cx="70" cy="120" r="7" fill="#E8C77A"/><text x="80" y="124" fill="#C9B79A" font-size="9">Delhi</text>
    <circle cx="120" cy="190" r="7" fill="#7A2434"/><text x="130" y="194" fill="#C9B79A" font-size="9">Deccan frontier</text></svg>`,
  mount(stageEl, sideStatsEl, controlsEl, api){
    const S = SimUtils;
    let st, revenueMode='zabt';
    function fresh(){ return { year:1, maxYear:8, treasury:50, stability:55, prosperity:45, legacy:10, done:false }; }
    st = fresh();

    stageEl.innerHTML = `
      <div class="stage-canvas-wrap"><canvas id="mgCanvas"></canvas></div>
      <p class="muted" id="mgLog">Year 1 of your reign. Choose a revenue system and allocate the treasury, then advance the year.</p>
      <div class="field"><label>Revenue Collection Method</label><div id="revHost"></div></div>
      <div id="allocHost"></div>
    `;
    const canvas = stageEl.querySelector('#mgCanvas');
    const ctx = S.fitCanvas(canvas, 900, 320);

    S.buildPalette(stageEl.querySelector('#revHost'), [
      {value:'zabt', label:'Zabt (measured land assessment)'},
      {value:'nasaq', label:'Nasaq (estimated assessment)'},
      {value:'kankut', label:'Kankut (crop inspection)'},
    ], v=> revenueMode=v);

    const alloc = S.buildAllocators(stageEl.querySelector('#allocHost'), [
      {key:'agri', label:'🌾 Agriculture Investment', default:35},
      {key:'trade', label:'⛵ Trade Infrastructure', default:25},
      {key:'works', label:'🏗️ Public Works', default:20},
      {key:'culture', label:'🎨 Cultural Patronage', default:20},
    ], ()=>{});

    function draw(){
      const w=canvas.width,h=canvas.height;
      ctx.clearRect(0,0,w,h);
      const sky=ctx.createLinearGradient(0,0,0,h*0.7); sky.addColorStop(0,'#2a1420'); sky.addColorStop(1,'#5a2c34');
      ctx.fillStyle=sky; ctx.fillRect(0,0,w,h*0.7);
      ctx.fillStyle='#241018'; ctx.fillRect(0,h*0.68,w,h*0.32);
      // palace: complexity grows with legacy
      const cx=w*0.5, baseY=h*0.68;
      ctx.fillStyle='#E7D9B8';
      ctx.fillRect(cx-140,baseY-90,280,90);
      ctx.beginPath(); ctx.arc(cx,baseY-90,70,Math.PI,0); ctx.fill();
      const domes = Math.round(st.legacy/20);
      for(let i=0;i<domes;i++){
        const dx = cx-100 + i*66;
        ctx.beginPath(); ctx.arc(dx, baseY-95, 16,Math.PI,0); ctx.fillStyle='#C49A4E'; ctx.fill();
      }
      // gardens (prosperity)
      const trees = Math.round(st.prosperity/12);
      for(let i=0;i<trees;i++){
        ctx.fillStyle='#3E5C3A'; ctx.beginPath(); ctx.arc(60+i*40, baseY+20, 12,0,7); ctx.fill();
      }
      ctx.fillStyle='#F3E9D2'; ctx.font='13px monospace'; ctx.fillText(`Year ${st.year} / ${st.maxYear}`,16,24);
    }

    function refresh(){
      draw();
      api.renderStats([
        {label:'Treasury', value:st.treasury, kind:'gold'},
        {label:'Stability', value:st.stability, kind: st.stability<30?'bad':st.stability<55?'warn':'good'},
        {label:'Prosperity', value:st.prosperity, kind:'good'},
        {label:'Cultural Legacy', value:st.legacy, kind:'info'},
        {label:'Year', value:(st.year/st.maxYear)*100, display:`${st.year}/${st.maxYear}`, kind:'gold'},
      ]);
    }

    function advance(){
      if(st.done){ api.toast('This reign has ended. Reset to begin a new administration.'); return; }
      const a = alloc.get();
      const revFairness = revenueMode==='zabt' ? 1 : revenueMode==='kankut' ? 0.85 : 0.7;
      st.treasury = S.clamp(st.treasury + a.trade*0.4 + (revFairness*8) - 14, 0, 100);
      st.prosperity = S.clamp(st.prosperity + a.agri*0.4 + a.trade*0.2 - 6, 0, 100);
      st.legacy = S.clamp(st.legacy + a.culture*0.35 + a.works*0.1, 0, 100);
      let stabilityDelta = (revFairness-0.8)*20 + (a.works*0.08) - (st.treasury<20?10:0);
      st.stability = S.clamp(st.stability + stabilityDelta, 0, 100);
      st.year++;
      stageEl.querySelector('#mgLog').textContent = `Year ${st.year-1} closes. Revenue via ${revenueMode.toUpperCase()} ${revFairness>=0.9?'was seen as fair by farmers':'strained relations with cultivators'}.`;
      if(st.year>st.maxYear){
        st.done=true;
        const verdict = st.stability>=60 && st.prosperity>=55 ? 'a golden age remembered for centuries' : st.stability<35 ? 'a troubled reign marked by unrest' : 'a stable, workmanlike reign';
        stageEl.querySelector('#mgLog').textContent += ` Your administration is remembered as ${verdict}.`;
      }
      refresh();
    }

    api.renderControls([{ label:'Advance Year', icon:api.icons.step, onClick: advance }]);
    api.onReset(()=>{ st = fresh(); refresh(); });
    refresh();
  },
  quiz:[
    {q:'What was the Mansabdari system primarily used for?', options:['Only religious ceremonies', 'Ranking nobles with combined military and administrative duties', 'Farming techniques', 'Trade tariffs only'], correct:1, explain:'Mansabdars held ranked positions combining military rank with administrative and revenue duties.'},
    {q:'What did Akbar\u2019s Zabt revenue system assess tax on?', options:['Random guesswork', 'Measured land and average yields', 'Number of household members', 'Distance from the capital'], correct:1, explain:'Zabt calculated tax based on carefully measured land and recorded average yields.'},
    {q:'What best describes Mughal court patronage?', options:['It excluded all non-Muslim artists', 'It supported painters, poets and architects from many faiths and regions', 'It banned all visual art', 'It only funded military technology'], correct:1, explain:'The Mughal court patronised diverse artists across faiths and regions.'},
    {q:'What do Mughal charbagh gardens symbolise?', options:['Military strength', 'Paradise, through geometric water channels', 'Trade wealth only', 'Nothing symbolic'], correct:1, explain:'The precise geometric layout of charbagh gardens was meant to evoke paradise.'},
    {q:'In this simulation, why might an unfair revenue method reduce stability?', options:['It has no effect on farmers', 'It strains relations with cultivators, risking unrest', 'It always increases prosperity', 'It only affects the treasury visually'], correct:1, explain:'Historically, revenue fairness strongly affected relations between rulers and cultivators.'},
  ]
};
