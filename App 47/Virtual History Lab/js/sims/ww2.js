/* World War II Global Strategy Explorer — emphasises logistics, diplomacy & humanitarian consequence, not combat */
SimModules.ww2 = {
  artifactIds:[],
  mapSvg:`<svg viewBox="0 0 400 200"><rect width="400" height="200" fill="#141418"/>
    <circle cx="120" cy="70" r="8" fill="#2C4A7C"/><text x="90" y="55" fill="#C9B79A" font-size="10">European theatre</text>
    <circle cx="260" cy="120" r="8" fill="#7A2434"/><text x="230" y="145" fill="#C9B79A" font-size="10">Pacific theatre</text>
    <circle cx="180" cy="150" r="8" fill="#D98E2B"/><text x="150" y="172" fill="#C9B79A" font-size="10">North African theatre</text></svg>`,
  mount(stageEl, sideStatsEl, controlsEl, api){
    const S = SimUtils;
    const PHASES = [
      {y:'1939', t:'War begins in Europe'},
      {y:'1940–41', t:'Conflict expands across theatres'},
      {y:'1941–42', t:'Global alliances solidify'},
      {y:'1942–43', t:'Industrial production becomes decisive'},
      {y:'1944–45', t:'Coordinated Allied advances'},
      {y:'1945', t:'War ends; United Nations founded'},
    ];
    let st;
    function fresh(){ return { turn:0, maxTurn:PHASES.length-1, alliance:40, production:35, humanitarian:45, stability:40, done:false }; }
    st = fresh();

    stageEl.innerHTML = `
      <div class="stage-canvas-wrap"><canvas id="wwCanvas"></canvas></div>
      <p class="muted" id="wwLog">${PHASES[0].y} — ${PHASES[0].t}. Allocate global effort below, then advance the phase.</p>
      <div id="allocHost"></div>
      <div class="flex col gap8 mt8" id="wwTimeline"></div>
    `;
    const canvas = stageEl.querySelector('#wwCanvas');
    const ctx = S.fitCanvas(canvas, 900, 220);

    const alloc = S.buildAllocators(stageEl.querySelector('#allocHost'), [
      {key:'logistics', label:'🚚 Military Logistics', default:30},
      {key:'production', label:'🏭 Industrial Production', default:30},
      {key:'diplomacy', label:'🤝 Diplomacy & Alliances', default:20},
      {key:'humanitarian', label:'🏥 Humanitarian Aid', default:20},
    ], ()=>{});

    function draw(){
      const w=canvas.width,h=canvas.height;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle='#141418'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='rgba(139,131,120,.5)'; ctx.beginPath(); ctx.arc(w/2,h/2,Math.min(w,h)*0.35,0,7); ctx.stroke();
      const dots = [
        {x:w*0.28, y:h*0.35, c:'#2C4A7C', label:'Europe'},
        {x:w*0.62, y:h*0.62, c:'#7A2434', label:'Pacific'},
        {x:w*0.45, y:h*0.75, c:'#D98E2B', label:'North Africa'},
      ];
      dots.forEach(d=>{
        const r = 6 + (st.production/100)*10;
        ctx.beginPath(); ctx.arc(d.x,d.y,r,0,7); ctx.fillStyle=d.c; ctx.fill();
        ctx.fillStyle='#C9B79A'; ctx.font='11px sans-serif'; ctx.fillText(d.label, d.x-18, d.y+r+14);
      });
      ctx.strokeStyle=`rgba(196,154,78,${st.alliance/150})`; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(dots[0].x,dots[0].y); ctx.lineTo(dots[1].x,dots[1].y); ctx.lineTo(dots[2].x,dots[2].y); ctx.closePath(); ctx.stroke();
    }

    function renderTimeline(){
      stageEl.querySelector('#wwTimeline').innerHTML = PHASES.map((p,i)=>
        `<div class="tl-node" style="opacity:${i<=st.turn?1:0.35};cursor:default"><b>${p.y}</b>${p.t}</div>`).join('');
    }

    function refresh(){
      draw(); renderTimeline();
      api.renderStats([
        {label:'Alliance Strength', value:st.alliance, kind:'info'},
        {label:'Production Capacity', value:st.production, kind:'gold'},
        {label:'Humanitarian Impact', value:st.humanitarian, kind: st.humanitarian<30?'bad':'good'},
        {label:'Global Stability', value:st.stability, kind: st.stability<30?'bad':st.stability<55?'warn':'good'},
        {label:'Phase', value:(st.turn/st.maxTurn)*100, display:`${st.turn+1}/${st.maxTurn+1}`, kind:'gold'},
      ]);
    }

    function advance(){
      if(st.done){ api.toast('This global overview has concluded. Reset to explore a different strategy.'); return; }
      const a = alloc.get();
      st.alliance = S.clamp(st.alliance + a.diplomacy*0.4, 0, 100);
      st.production = S.clamp(st.production + a.production*0.4 + a.logistics*0.15, 0, 100);
      st.humanitarian = S.clamp(st.humanitarian + a.humanitarian*0.45 - a.logistics*0.08, 0, 100);
      st.stability = S.clamp((st.alliance+st.production+st.humanitarian)/3, 0, 100);
      st.turn++;
      stageEl.querySelector('#wwLog').textContent = `${PHASES[st.turn].y} — ${PHASES[st.turn].t}.`;
      if(st.turn>=st.maxTurn){
        st.done = true;
        const verdict = st.humanitarian>=55 ? 'with meaningful attention to humanitarian consequences' : 'though humanitarian costs remained severe';
        stageEl.querySelector('#wwLog').textContent += ` The war concludes in 1945 and the United Nations is founded, ${verdict}.`;
      }
      refresh();
    }

    api.renderControls([{ label:'Advance Phase', icon:api.icons.step, onClick: advance }]);
    api.onReset(()=>{ st = fresh(); refresh(); });
    refresh();
  },
  quiz:[
    {q:'Besides battlefield tactics, what was equally decisive in World War II\u2019s outcome?', options:['Industrial production and logistics', 'Weather alone', 'Sporting events', 'Nothing else mattered'], correct:0, explain:'Industrial output and logistics were as decisive as battlefield tactics.'},
    {q:'Roughly how many countries were involved in World War II?', options:['Fewer than 5', 'More than 30', 'Exactly 2', 'None, it was a single-country event'], correct:1, explain:'The war involved more than 30 countries and affected civilians on an unprecedented global scale.'},
    {q:'What international organisation was founded in 1945, partly in response to the war?', options:['The United Nations', 'The European Union', 'NATO', 'The World Trade Organization'], correct:0, explain:'The United Nations was founded in 1945 in response to the devastation of the war.'},
    {q:'Did all nations experience World War II\u2019s civilian impact equally?', options:['Yes, identically everywhere', 'No, humanitarian impact varied greatly by region', 'Only soldiers were affected', 'Civilians were never affected'], correct:1, explain:'Civilian and humanitarian impacts varied enormously across different regions.'},
    {q:'Why does this simulation include a Humanitarian Aid allocation alongside military logistics?', options:['To glorify combat', 'To emphasise the human cost and consequences of large-scale conflict', 'Because it has no historical basis', 'Because aid did not exist during the war'], correct:1, explain:'The module emphasises historical understanding and consequence, including humanitarian impact, over combat detail.'},
  ]
};
