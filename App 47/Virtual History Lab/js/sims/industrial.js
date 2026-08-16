/* Industrial Revolution Simulation */
SimModules.industrial = {
  artifactIds:['spindle'],
  mount(stageEl, sideStatsEl, controlsEl, api){
    const S = SimUtils;
    let st;
    function fresh(){ return { turn:1, maxTurn:8, economy:30, environment:80, conditions:60, population:20, done:false }; }
    st = fresh();

    stageEl.innerHTML = `
      <div class="stage-canvas-wrap"><canvas id="inCanvas"></canvas></div>
      <p class="muted" id="inLog">Year 1: A quiet market town. Invest below, then advance to see how the town transforms.</p>
      <div id="allocHost"></div>
    `;
    const canvas = stageEl.querySelector('#inCanvas');
    const ctx = S.fitCanvas(canvas, 900, 340);

    const alloc = S.buildAllocators(stageEl.querySelector('#allocHost'), [
      {key:'factories', label:'🏭 Factories', default:30},
      {key:'transport', label:'🚂 Steam Transport', default:25},
      {key:'planning', label:'🏙️ Urban Planning', default:25},
      {key:'welfare', label:'⚖️ Worker Welfare', default:20},
    ], ()=>{});

    function draw(){
      const w=canvas.width,h=canvas.height;
      ctx.clearRect(0,0,w,h);
      const smoky = 1 - st.environment/100;
      const sky = ctx.createLinearGradient(0,0,0,h*0.6);
      sky.addColorStop(0, `rgba(${60+smoky*60},${55+smoky*20},${60},1)`);
      sky.addColorStop(1, '#241a1a');
      ctx.fillStyle=sky; ctx.fillRect(0,0,w,h*0.62);
      ctx.fillStyle='#181212'; ctx.fillRect(0,h*0.6,w,h*0.4);
      const factories = Math.round(st.economy/12);
      for(let i=0;i<factories;i++){
        const fx = 60+i*70, fy=h*0.6;
        ctx.fillStyle='#3a2a2a'; ctx.fillRect(fx,fy-70,40,70);
        ctx.fillStyle='#2a1c1c'; ctx.fillRect(fx+8,fy-90,10,22);
        // smoke
        for(let s=0;s<4;s++){
          ctx.beginPath();
          ctx.arc(fx+13, fy-95-s*16, 8+smoky*6, 0, 7);
          ctx.fillStyle = `rgba(120,110,110,${0.35*smoky+0.05})`;
          ctx.fill();
        }
      }
      // rail line (transport)
      if(alloc.get().transport>15){
        ctx.strokeStyle='#8B8378'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(0,h*0.88); ctx.lineTo(w,h*0.88); ctx.stroke();
      }
      // population dwellings
      const homes = Math.round(st.population/8);
      for(let i=0;i<homes;i++){
        const hx = 620+((i%6)*36), hy = h*0.6+Math.floor(i/6)*30;
        ctx.fillStyle='#C49A4E'; ctx.fillRect(hx,hy,22,22);
        ctx.fillStyle='#7A2434'; ctx.beginPath(); ctx.moveTo(hx-3,hy); ctx.lineTo(hx+11,hy-12); ctx.lineTo(hx+25,hy); ctx.fill();
      }
      ctx.fillStyle='#F3E9D2'; ctx.font='13px monospace'; ctx.fillText(`Year ${st.turn} / ${st.maxTurn}`,16,24);
    }

    function refresh(){
      draw();
      api.renderStats([
        {label:'Economic Output', value:st.economy, kind:'gold'},
        {label:'Environmental Health', value:st.environment, kind: st.environment<30?'bad':st.environment<55?'warn':'good'},
        {label:'Working Conditions', value:st.conditions, kind: st.conditions<30?'bad':st.conditions<55?'warn':'good'},
        {label:'Population', value:st.population, kind:'info'},
        {label:'Year', value:(st.turn/st.maxTurn)*100, display:`${st.turn}/${st.maxTurn}`, kind:'gold'},
      ]);
    }

    function advance(){
      if(st.done){ api.toast('This story has concluded — reset to try a different strategy.'); return; }
      const a = alloc.get();
      st.economy = S.clamp(st.economy + a.factories*0.45 + a.transport*0.15, 0, 100);
      st.population = S.clamp(st.population + a.factories*0.25 + a.transport*0.1, 0, 100);
      st.environment = S.clamp(st.environment - a.factories*0.28 + a.planning*0.12, 0, 100);
      st.conditions = S.clamp(st.conditions - a.factories*0.15 + a.welfare*0.45 + a.planning*0.05, 0, 100);
      st.turn++;
      stageEl.querySelector('#inLog').textContent = `Year ${st.turn-1}: the town grows${st.environment<35?', though smoke now hangs over its streets':''}${st.conditions<35?' and factory conditions draw growing criticism':''}.`;
      if(st.turn>st.maxTurn){
        st.done=true;
        const verdict = st.conditions>=55 && st.environment>=45 ? 'a reasonably humane industrial transformation' :
          st.economy>=70 ? 'rapid industrial growth at a steep human and environmental cost' : 'a slow, uneven transformation';
        stageEl.querySelector('#inLog').textContent += ` Over ${st.maxTurn} years, the town has undergone ${verdict}.`;
      }
      refresh();
    }

    api.renderControls([{ label:'Advance Year', icon:api.icons.step, onClick: advance }]);
    api.onReset(()=>{ st = fresh(); refresh(); });
    refresh();
  },
  quiz:[
    {q:'What power source is most associated with driving the Industrial Revolution?', options:['Solar panels', 'The steam engine', 'Nuclear power', 'Wind turbines'], correct:1, explain:'The steam engine, refined by James Watt, became the defining power source of the era.'},
    {q:'What was a common reality for early factory workers, including children?', options:['Short, well-paid shifts', 'Long hours and often dangerous conditions', 'Guaranteed paid holidays', 'No work was available'], correct:1, explain:'Early industrial labour, including child labour, often involved long and hazardous hours.'},
    {q:'Did industrialisation spread to all regions of the world at the same time?', options:['Yes, instantly everywhere', 'No, it spread unevenly over more than a century', 'It never spread beyond Britain', 'It happened before agriculture'], correct:1, explain:'Industrialisation diffused unevenly across regions and decades.'},
    {q:'What prompted the emergence of early labour movements and factory-reform laws?', options:['A surplus of holidays', 'Responses to poor industrial working conditions', 'Declining factory numbers', 'Religious festivals'], correct:1, explain:'Labour movements and reform laws arose directly from concerns over factory conditions.'},
    {q:'In this simulation, what tends to happen if you invest heavily in factories while ignoring welfare?', options:['Working conditions automatically improve', 'Working conditions and environment tend to decline', 'Population always shrinks', 'Nothing changes at all'], correct:1, explain:'Unchecked industrial growth without welfare or planning investment tends to strain conditions and the environment.'},
  ]
};
