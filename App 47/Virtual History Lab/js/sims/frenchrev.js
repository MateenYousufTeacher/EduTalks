/* French Revolution Decision Simulator */
SimModules.frenchrev = {
  artifactIds:['cockade'],
  mount(stageEl, sideStatsEl, controlsEl, api){
    const S = SimUtils;

    const PHASES = {
      start: {
        title:'1789 — The Estates-General',
        text:'France faces bankruptcy and famine. The Estates-General has convened for the first time in over a century. The Third Estate demands fairer representation.',
        choices:[
          { label:'Support equal voting by head, not by Estate', effects:{support:12,stability:-6,radicalism:4}, next:'assembly' },
          { label:'Preserve the traditional three-Estate voting system', effects:{support:-10,stability:6,radicalism:-2}, next:'assembly' },
        ]
      },
      assembly: {
        title:'1789–91 — The National Assembly',
        text:'The Third Estate has declared itself the National Assembly and taken the Tennis Court Oath. The Declaration of the Rights of Man is drafted.',
        choices:[
          { label:'Adopt a constitutional monarchy with limited royal power', effects:{support:8,stability:8,radicalism:-4}, next:'radical' },
          { label:'Push for a full republic, ending the monarchy immediately', effects:{support:6,stability:-14,radicalism:16}, next:'radical' },
        ]
      },
      radical: {
        title:'1792–94 — Radical Phase',
        text:'War with European monarchies and internal suspicion fuel radical politics. Calls grow for revolutionary tribunals against perceived enemies of the Revolution.',
        choices:[
          { label:'Restrain revolutionary tribunals to protect due process', effects:{support:-4,stability:10,radicalism:-14}, next:'directory' },
          { label:'Expand tribunals aggressively to root out counter-revolutionaries', effects:{support:-8,stability:-16,radicalism:20}, next:'directory' },
        ]
      },
      directory: {
        title:'1795 — Toward the Directory',
        text:'Exhausted by upheaval, France seeks a new, more stable government structure.',
        choices:[
          { label:'Establish a moderate multi-member Directory', effects:{support:10,stability:14,radicalism:-8}, next:'end' },
          { label:'Concentrate power in a single strong leader', effects:{support:4,stability:6,radicalism:6}, next:'end' },
        ]
      },
    };

    let st;
    function fresh(){ return { support:50, stability:50, radicalism:20, intl:40, phase:'start', history:[] }; }
    st = fresh();

    stageEl.innerHTML = `
      <div class="stage-canvas-wrap"><canvas id="frCanvas"></canvas></div>
      <div class="panel" style="padding:16px;margin-top:10px" id="frPhase"></div>
    `;
    const canvas = stageEl.querySelector('#frCanvas');
    const ctx = S.fitCanvas(canvas, 900, 200);

    function draw(){
      const w=canvas.width,h=canvas.height;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle='#2C4A7C'; ctx.fillRect(0,0,w/3,h);
      ctx.fillStyle='#F3E9D2'; ctx.fillRect(w/3,0,w/3,h);
      ctx.fillStyle='#7A2434'; ctx.fillRect(2*w/3,0,w/3,h);
      const fh = h*0.6*(st.radicalism/100);
      ctx.fillStyle='rgba(217,142,43,.85)';
      ctx.beginPath(); ctx.moveTo(w/2-24,h); ctx.quadraticCurveTo(w/2,h-fh,w/2+24,h); ctx.fill();
      ctx.fillStyle='#241111'; ctx.font='12px monospace';
      ctx.fillText('Radicalism intensity', w/2-70, h-8);
    }

    function renderPhase(){
      const p = PHASES[st.phase];
      const box = stageEl.querySelector('#frPhase');
      if(st.phase==='end'){
        const outcome = st.stability>=60 && st.radicalism<40 ? 'a durable constitutional path emerges, balancing reform with order.' :
          st.radicalism>=55 ? 'the Revolution tips toward prolonged radical upheaval before order is eventually restored.' :
          'a fragile settlement emerges — reform achieved, but stability remains precarious.';
        box.innerHTML = `<h4 style="color:var(--accent)">Outcome</h4><p>Your decisions across each phase shaped a distinct path: ${outcome}</p>
          <div class="mt8"><button class="btn btn-secondary btn-sm" id="frRestart">Replay Decisions</button></div>`;
        box.querySelector('#frRestart').addEventListener('click', ()=>{ st = fresh(); refresh(); });
        return;
      }
      box.innerHTML = `<h4 style="color:var(--accent)">${p.title}</h4><p>${p.text}</p>
        <div class="flex col gap8 mt8">${p.choices.map((c,i)=>`<button class="btn btn-secondary" data-i="${i}" style="text-align:left">${c.label}</button>`).join('')}</div>`;
      box.querySelectorAll('button[data-i]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const c = p.choices[+btn.dataset.i];
          Object.entries(c.effects).forEach(([k,v])=>{
            if(k==='support') st.support = S.clamp(st.support+v,0,100);
            if(k==='stability') st.stability = S.clamp(st.stability+v,0,100);
            if(k==='radicalism') st.radicalism = S.clamp(st.radicalism+v,0,100);
          });
          st.history.push(c.label);
          st.phase = c.next;
          refresh();
        });
      });
    }

    function refresh(){
      draw();
      renderPhase();
      api.renderStats([
        {label:'Public Support', value:st.support, kind:'good'},
        {label:'Institutional Stability', value:st.stability, kind: st.stability<30?'bad':st.stability<55?'warn':'good'},
        {label:'Radicalism', value:st.radicalism, kind: st.radicalism>60?'bad':'warn'},
        {label:'Phase', value:100, display: PHASES[st.phase]?PHASES[st.phase].title.split('—')[0].trim():'Concluded', kind:'gold'},
      ]);
    }

    api.renderControls([]);
    api.onReset(()=>{ st = fresh(); refresh(); });
    refresh();
  },
  quiz:[
    {q:'What immediate crisis pushed France toward revolution in 1789?', options:['A currency surplus', 'Fiscal crisis and social inequality between the Estates', 'Peace with all neighbours', 'Overproduction of goods'], correct:1, explain:'France faced bankruptcy and stark inequality between the three Estates.'},
    {q:'What did the Declaration of the Rights of Man (1789) proclaim?', options:['Absolute monarchy', 'Liberty and equality before the law', 'Return to feudalism', 'Abolition of all government'], correct:1, explain:'The Declaration proclaimed liberty and legal equality as core revolutionary principles.'},
    {q:'Was the French Revolution a single unified event?', options:['Yes, one continuous phase', 'No, it moved through several distinct, often contradictory phases', 'It lasted only one day', 'It had no distinguishable phases'], correct:1, explain:'The Revolution unfolded through several different, sometimes conflicting, political phases.'},
    {q:'What best describes the Reign of Terror in the Revolution\u2019s broader story?', options:['The Revolution\u2019s only phase', 'One turbulent phase among several', 'An event that happened before the Revolution began', 'A period with no historical significance'], correct:1, explain:'The Terror was one intense phase, followed by significant further institutional change.'},
    {q:'How did the French Revolution influence later history?', options:['It had no lasting influence', 'Its ideals influenced later constitutional movements worldwide', 'It ended the concept of citizenship', 'It discouraged all future reform'], correct:1, explain:'Revolutionary ideals of liberty, equality and fraternity shaped later constitutional movements globally.'},
  ]
};
