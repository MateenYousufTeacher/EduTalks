/* ============================================================
   SIMULATION 1 — DEMOCRACY SIMULATOR
   ============================================================ */
(function(){
  const sim = VPSL_DATA.sims.find(s=>s.id==='democracy');

  const meta = {
    objectives:[
      'Identify the core ingredients that make a democracy function well.',
      'Predict how changes in participation, transparency and rule of law affect stability and trust.',
      'Compare democratic and non-democratic governance characteristics conceptually.',
      'Practise evidence-based reasoning by observing simulated outcomes.',
    ],
    background:'Democracy is more than holding elections — it depends on citizens taking part, institutions acting openly, a free press, an informed public, and everyone (including the government) being bound by law. When these ingredients are strong, societies tend to be more stable and trusted by their own citizens; when they are weak, governance can become fragile even if elections still occur on paper.',
    constitutionalPrinciples:['Popular sovereignty — power flows from the people','Rule of law and equality before the law','Freedom of the press and expression','Transparency and accountability of public institutions'],
    realLife:'Governance indexes used by international organisations track very similar factors — voice and accountability, rule of law, government effectiveness — to assess the health of democracies worldwide. Citizens experience these same factors directly: whether their vote counts, whether officials answer for decisions, and whether the media can report freely.',
    misconceptions:['"Holding elections" alone is not the same as being a healthy democracy — participation, transparency and rule of law matter just as much.','More citizen participation is not automatically destabilising; combined with rule of law it usually raises trust.','A free press criticising the government is a sign of a functioning democracy, not a weakness.'],
    facts:['The word "democracy" comes from the Greek "demos" (people) and "kratos" (rule).','India conducts the largest democratic exercise in human history, with an electorate exceeding 900 million.','No two democracies look identical — presidential, parliamentary, and mixed systems all embody the same core principle differently.'],
  };

  const quiz = [
    {type:'mcq', q:'Which of these is NOT one of the five levers in this simulator?', options:['Citizen Participation','Media Freedom','Military Budget','Rule of Law'], answer:'Military Budget', explain:'The simulator focuses on participation, transparency, media freedom, public awareness and rule of law — the civic ingredients of democratic health.'},
    {type:'tf', q:'A country can hold regular elections and still score low on democratic health if rule of law is weak.', answer:'True', explain:'Elections are necessary but not sufficient; weak rule of law can undermine genuine democratic functioning even when elections occur.'},
    {type:'mcq', q:'Which factor most directly measures whether citizens can hold their government answerable?', options:['Transparency','Stability','Development','Public Satisfaction'], answer:'Transparency', explain:'Transparency in decision-making is what allows citizens and institutions to hold government accountable.'},
    {type:'ar', q:'Assertion: Rule of law means even the government must obey the law. Reason: Without it, individual rights cannot be reliably protected. Choose the correct option.', options:['Both true, Reason explains Assertion','Both true, Reason does not explain Assertion','Assertion true, Reason false','Both false'], answer:'Both true, Reason explains Assertion', explain:'Rule of law binds the state itself; this is precisely what makes rights meaningful and enforceable.'},
    {type:'mcq', q:'In the simulator, which combination is most likely to raise both trust AND stability together?', options:['High transparency + high rule of law','High participation + low rule of law','Low media freedom + high awareness','High awareness alone'], answer:'High transparency + high rule of law', explain:'Transparency builds trust, while rule of law anchors stability — together they reinforce each other.'},
    {type:'mcq', q:'Universal adult franchise means:', options:['Only educated citizens can vote','Every adult citizen has the right to vote regardless of background','Only landowners can vote','Voting is compulsory'], answer:'Every adult citizen has the right to vote regardless of background', explain:'It is the principle of equal voting rights for all adult citizens.'},
  ];

  function simulate(panel, h){
    let turn = 0;
    const state = {participation:60, transparency:55, mediaFreedom:60, awareness:50, ruleOfLaw:65};
    const history = {stability:[], trust:[], development:[], satisfaction:[]};
    let playing = false, timer = null;

    function compute(){
      const {participation:P, transparency:T, mediaFreedom:M, awareness:A, ruleOfLaw:R} = state;
      const stability = clamp(0.32*R + 0.28*T + 0.22*P + 0.18*(100-Math.abs(M-65)));
      const trust = clamp(0.40*T + 0.32*M + 0.28*P);
      const development = clamp(0.36*R + 0.34*A + 0.30*stability);
      const satisfaction = clamp(0.30*trust + 0.30*stability + 0.25*development + 0.15*P);
      return {stability, trust, development, satisfaction};
    }
    function clamp(v){ return Math.max(0, Math.min(100, Math.round(v))); }

    function render(){
      const o = compute();
      panel.innerHTML = `
        <div class="panel-grid">
          <div>
            <div class="glass card">
              <h4>🎛️ Adjustable Variables</h4>
              ${slider('participation','Citizen Participation', state.participation)}
              ${slider('transparency','Government Transparency', state.transparency)}
              ${slider('mediaFreedom','Media Freedom', state.mediaFreedom)}
              ${slider('awareness','Public Awareness', state.awareness)}
              ${slider('ruleOfLaw','Rule of Law', state.ruleOfLaw)}
              <div class="btn-row">
                <button class="btn-sm primary" id="btn-step">⏭ Step Forward (Turn ${turn+1})</button>
                <button class="btn-sm" id="btn-play">${playing?'⏸ Pause':'▶ Play'}</button>
                <button class="btn-sm" id="btn-back" ${turn===0?'disabled':''}>⏮ Step Back</button>
                <button class="btn-sm danger" id="btn-reset">↺ Reset</button>
                <button class="btn-sm amber" id="btn-preset">🏴 Try Authoritarian Preset</button>
              </div>
            </div>
            <div class="glass card">
              <h4>📈 Trend Over ${turn} Turn${turn===1?'':'s'}</h4>
              <div class="chart-box"><canvas id="trend-chart"></canvas></div>
              <div class="legend">
                <span><i class="dot" style="background:#0D47A1"></i>Stability</span>
                <span><i class="dot" style="background:#43A047"></i>Trust</span>
                <span><i class="dot" style="background:#FFB300"></i>Development</span>
                <span><i class="dot" style="background:#26C6DA"></i>Satisfaction</span>
              </div>
            </div>
          </div>
          <div>
            <div class="glass card">
              <h4>📊 Outcome Analysis</h4>
              <div class="metric-list">
                ${metric('Stability', o.stability, '#0D47A1')}
                ${metric('Public Trust', o.trust, '#43A047')}
                ${metric('Development', o.development, '#FFB300')}
                ${metric('Public Satisfaction', o.satisfaction, '#26C6DA')}
              </div>
            </div>
            <div class="glass card">
              <h4>🔍 Observation</h4>
              <p>${insight(o, state)}</p>
            </div>
            <div class="notice fact">💡 Try raising participation while keeping rule of law low — notice stability barely improves. Democracy needs both freedom AND order.</div>
          </div>
        </div>
      `;
      wire();
      drawTrend();
    }

    function slider(key, label, val){
      return `<div class="control-row">
        <label>${label} <span class="val">${val}</span></label>
        <input type="range" min="0" max="100" value="${val}" data-key="${key}">
      </div>`;
    }
    function metric(label, val, color){
      return `<div class="metric"><div class="metric-top"><span>${label}</span><span>${val}/100</span></div>
        <div class="metric-bar"><div class="metric-fill" style="width:${val}%;background:${color}"></div></div></div>`;
    }
    function insight(o){
      if(o.satisfaction>=75) return 'Citizens report high satisfaction — the balance of freedom, transparency and order is working well together.';
      if(o.stability<40) return 'Stability is fragile. Low rule of law or transparency tends to undermine confidence even when other levers are high.';
      if(o.trust<40) return 'Public trust is low — this usually happens when transparency and media freedom lag behind participation.';
      return 'Outcomes are moderate. Try adjusting one lever at a time to see which has the strongest effect on each outcome.';
    }

    function wire(){
      panel.querySelectorAll('input[type=range]').forEach(inp=>{
        inp.addEventListener('input', ()=>{
          state[inp.dataset.key] = +inp.value;
          const label = inp.previousElementSibling;
          label.querySelector('.val').textContent = inp.value;
          const o = compute();
          panel.querySelectorAll('.metric').forEach((m,i)=>{
            const keys=['stability','trust','development','satisfaction'];
            m.querySelector('.metric-top span:last-child').textContent = o[keys[i]]+'/100';
            m.querySelector('.metric-fill').style.width = o[keys[i]]+'%';
          });
          h.setProgress(45);
        });
      });
      panel.querySelector('#btn-step').addEventListener('click', ()=>{ step(); });
      panel.querySelector('#btn-back').addEventListener('click', ()=>{
        if(turn>0){ turn--; ['stability','trust','development','satisfaction'].forEach(k=>history[k].pop()); render(); h.setProgress(55); }
      });
      panel.querySelector('#btn-play').addEventListener('click', ()=>{
        playing = !playing;
        if(playing){ timer = setInterval(step, 1200); } else { clearInterval(timer); }
        render();
      });
      panel.querySelector('#btn-reset').addEventListener('click', ()=>{
        Object.assign(state, {participation:60, transparency:55, mediaFreedom:60, awareness:50, ruleOfLaw:65});
        turn=0; history.stability=[];history.trust=[];history.development=[];history.satisfaction=[];
        playing=false; clearInterval(timer);
        render(); h.toast('Simulation reset','↺');
      });
      panel.querySelector('#btn-preset').addEventListener('click', ()=>{
        Object.assign(state, {participation:15, transparency:12, mediaFreedom:8, awareness:35, ruleOfLaw:30});
        render(); h.toast('Authoritarian-leaning preset applied — compare the outcomes','🏴');
        h.setProgress(60);
      });
    }

    function step(){
      turn++;
      const o = compute();
      history.stability.push(o.stability); history.trust.push(o.trust);
      history.development.push(o.development); history.satisfaction.push(o.satisfaction);
      // small drift representing real-world feedback effects
      state.awareness = Math.max(0, Math.min(100, state.awareness + (o.trust>60?1:-1)));
      if(history.stability.length>20){ Object.keys(history).forEach(k=>history[k].shift()); }
      render();
      h.setProgress(70);
    }

    function drawTrend(){
      const canvas = panel.querySelector('#trend-chart');
      if(!canvas) return;
      if(!history.stability.length){
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width=rect.width; canvas.height=rect.height;
        ctx.fillStyle = document.body.getAttribute('data-theme')==='dark' ? '#B7C3DC':'#5A6478';
        ctx.font='13px Nunito Sans'; ctx.textAlign='center';
        ctx.fillText('Press "Step Forward" to begin recording turns', rect.width/2, rect.height/2);
        return;
      }
      h.drawLine(canvas, [
        {data:history.stability, color:'#0D47A1'},
        {data:history.trust, color:'#43A047'},
        {data:history.development, color:'#FFB300'},
        {data:history.satisfaction, color:'#26C6DA'},
      ], {max:100, min:0});
    }

    render();
  }

  vpslRegister({
    sim, category:'Governance & Democracy', meta, quiz,
    summary:'You explored how citizen participation, transparency, media freedom, public awareness and rule of law interact to shape a society\'s stability, trust, development and satisfaction. Strong democracies rarely rely on a single ingredient — they balance freedom with accountability and order.',
    simulate,
  });
})();
