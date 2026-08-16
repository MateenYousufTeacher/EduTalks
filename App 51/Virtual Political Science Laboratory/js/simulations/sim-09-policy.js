/* ============================================================
   SIMULATION 9 — PUBLIC POLICY & CITIZEN PARTICIPATION LAB
   ============================================================ */
(function(){
  const sim = VPSL_DATA.sims.find(s=>s.id==='policy');

  const meta = {
    objectives:[
      'Identify a community issue and gather stakeholder feedback.',
      'Evaluate and compare alternative policy options.',
      'Allocate a budget and implement a chosen policy.',
      'Monitor outcomes and adjust the policy over time.',
    ],
    background:'Public policy is how governments turn a community problem into a planned course of action. Good policy usually starts by listening to those affected, compares realistic alternatives with their trade-offs, and keeps monitoring results after implementation — because even a well-designed policy can need adjustment once it meets reality.',
    constitutionalPrinciples:['Citizen participation in public decision-making','Government accountability for outcomes, not just intentions','Equitable consideration of different stakeholder groups','Evidence-based, monitored implementation'],
    realLife:'Decisions about a new park, a traffic redesign, or a school improvement programme in any town follow this same cycle: identify the problem, consult the community, compare options, fund and implement a choice, then track whether it actually worked.',
    misconceptions:['The "cheapest" policy option is not always the best value if it fails to solve the underlying problem.','Consulting stakeholders is not the same as doing whatever the loudest group wants — a good policy weighs multiple perspectives.','Monitoring after implementation matters — policies are not "done" the moment they launch.'],
    facts:['Public consultations, surveys, and town-hall meetings are all common tools for gathering stakeholder feedback.','Policies are often piloted in a small area first before a full roll-out.','A "cost-benefit analysis" is a common method used to compare policy options systematically.'],
  };

  const quiz = [
    {type:'mcq', q:'What is usually the first step in a sound public policy process?', options:['Announce a solution immediately','Identify the problem and gather stakeholder feedback','Skip straight to implementation','Only ask the budget office'], answer:'Identify the problem and gather stakeholder feedback', explain:'Understanding the problem and hearing from those affected typically comes before designing solutions.'},
    {type:'tf', q:'Once a policy is implemented, monitoring its outcomes is no longer necessary.', answer:'False', explain:'Monitoring after implementation is essential to know whether a policy is actually working and needs adjustment.'},
    {type:'mcq', q:'Stakeholder consultation is best defined as:', options:['Only consulting government officials','Gathering input from people affected by a policy before finalising it','A synonym for voting in an election','A court hearing'], answer:'Gathering input from people affected by a policy before finalising it', explain:'It specifically means engaging those who will be affected before the policy is locked in.'},
    {type:'mcq', q:'Why might the cheapest policy option not be the "best value"?', options:['Cheap options are always best','It might fail to actually solve the problem, costing more in the long run','Cost never matters in policy','Only the government\'s budget matters'], answer:'It might fail to actually solve the problem, costing more in the long run', explain:'Value depends on effectiveness relative to cost, not price alone.'},
    {type:'ar', q:'Assertion: Piloting a policy in a small area before full roll-out reduces risk. Reason: A pilot reveals real-world problems while the cost of fixing them is still low.', options:['Both true, Reason explains Assertion','Both true, unrelated','Assertion false, Reason true','Both false'], answer:'Both true, Reason explains Assertion', explain:'Piloting surfaces issues early, when adjustments are cheaper and less disruptive.'},
    {type:'mcq', q:'A cost-benefit analysis is used to:', options:['Systematically compare the costs and expected benefits of policy options','Decide court cases','Set election dates','Replace stakeholder consultation entirely'], answer:'Systematically compare the costs and expected benefits of policy options', explain:'It is a structured method to weigh trade-offs between different policy choices.'},
  ];

  const ISSUES = [
    {id:'water', name:'Unsafe Drinking Water in a Neighbourhood', icon:'💧'},
    {id:'traffic', name:'Traffic Congestion Near a School', icon:'🚦'},
    {id:'school', name:'Overcrowded Classrooms', icon:'🏫'},
    {id:'park', name:'Lack of Public Green Space', icon:'🌳'},
    {id:'energy', name:'High Household Energy Costs', icon:'💡'},
  ];
  const STAKEHOLDERS = ['Residents','Local Businesses','School/Health Staff','Local Officials'];
  const OPTIONS_BY_ISSUE = {
    water:[
      {id:'a', name:'Install a new filtration plant', cost:70, effect:85, note:'High upfront cost, strong long-term fix.'},
      {id:'b', name:'Distribute household filters', cost:30, effect:45, note:'Cheap and fast, partial fix.'},
      {id:'c', name:'Public awareness campaign only', cost:10, effect:15, note:'Very cheap, low impact alone.'},
    ],
    traffic:[
      {id:'a', name:'Build a pedestrian overpass', cost:65, effect:80, note:'Costly but very effective near schools.'},
      {id:'b', name:'Add crossing guards & signage', cost:20, effect:40, note:'Low cost, moderate effect.'},
      {id:'c', name:'Adjust school start/end times', cost:5, effect:25, note:'Almost free, modest impact.'},
    ],
    school:[
      {id:'a', name:'Build additional classrooms', cost:75, effect:85, note:'Expensive but solves overcrowding directly.'},
      {id:'b', name:'Hire more teachers, split sections', cost:40, effect:55, note:'Moderate cost, decent relief.'},
      {id:'c', name:'Introduce shift timings', cost:10, effect:30, note:'Cheap, but strains schedules.'},
    ],
    park:[
      {id:'a', name:'Develop a new public park', cost:60, effect:75, note:'Solid long-term community asset.'},
      {id:'b', name:'Convert a vacant lot to a pocket park', cost:25, effect:45, note:'Cheaper, smaller-scale benefit.'},
      {id:'c', name:'Plant street trees only', cost:8, effect:18, note:'Very cheap, limited benefit.'},
    ],
    energy:[
      {id:'a', name:'Subsidise solar panel installation', cost:70, effect:80, note:'High cost, strong long-term savings.'},
      {id:'b', name:'Distribute energy-efficient appliances', cost:35, effect:50, note:'Moderate cost and effect.'},
      {id:'c', name:'Energy-saving awareness campaign', cost:10, effect:20, note:'Cheap, limited impact.'},
    ],
  };

  function simulate(panel, h){
    const steps = ['Identify Issue','Gather Feedback','Compare Options','Budget & Implement','Monitor'];
    let stepIdx = 0;
    const st = { issue:null, feedback:{}, chosenOption:null, budgetSpent:0, months:0, history:{impact:[],satisfaction:[]} };

    function render(){
      panel.innerHTML = `
        <div class="stepper">
          ${steps.map((s,i)=>`<div class="step-dot ${i<stepIdx?'done':''} ${i===stepIdx?'current':''}"><span class="num">${i<stepIdx?'✓':i+1}</span>${s}</div>`).join('')}
        </div>
        <div id="step-body"></div>
      `;
      const body = panel.querySelector('#step-body');
      [renderIssue, renderFeedback, renderCompare, renderImplement, renderMonitor][stepIdx](body);
    }
    function nav(body, {onNext, label='Next →'}={}){
      const row = document.createElement('div'); row.className='btn-row'; row.style.marginTop='16px';
      if(stepIdx>0 && stepIdx<4){ const b=document.createElement('button'); b.className='btn-sm'; b.textContent='← Back';
        b.onclick=()=>{ stepIdx--; render(); }; row.appendChild(b); }
      if(onNext){ const n=document.createElement('button'); n.className='btn-sm primary'; n.textContent=label; n.onclick=onNext; row.appendChild(n); }
      body.appendChild(row);
    }

    function renderIssue(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🔎 Step 1 · Identify a Community Issue</h4>
          <div style="display:grid;gap:8px;">
            ${ISSUES.map(i=>`<button class="btn-sm" data-issue="${i.id}" style="text-align:left;padding:12px;">${i.icon} ${i.name}</button>`).join('')}
          </div>
        </div>`;
      body.querySelectorAll('[data-issue]').forEach(b=> b.addEventListener('click', ()=>{
        st.issue = ISSUES.find(i=>i.id===b.dataset.issue);
        stepIdx=1; render(); h.setProgress(30);
      }));
    }

    function renderFeedback(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🗣️ Step 2 · Gather Stakeholder Feedback</h4>
          <p>Set how strongly each stakeholder group feels this issue needs urgent action (based on a simulated public consultation).</p>
          ${STAKEHOLDERS.map(s=>`
            <div class="control-row">
              <label>${s} <span class="val">${st.feedback[s]||50}</span></label>
              <input type="range" min="0" max="100" value="${st.feedback[s]||50}" data-stake="${s}">
            </div>`).join('')}
        </div>`;
      body.querySelectorAll('[data-stake]').forEach(inp=> inp.addEventListener('input', ()=>{
        st.feedback[inp.dataset.stake] = +inp.value;
        inp.previousElementSibling.querySelector('.val').textContent = inp.value;
      }));
      nav(body, {onNext:()=>{ stepIdx=2; render(); h.setProgress(45);} });
    }

    function renderCompare(body){
      const opts = OPTIONS_BY_ISSUE[st.issue.id];
      body.innerHTML = `
        <div class="glass card">
          <h4>⚖️ Step 3 · Compare Policy Options for "${st.issue.name}"</h4>
          <table>
            <thead><tr><th>Option</th><th>Cost</th><th>Expected Impact</th><th>Note</th><th></th></tr></thead>
            <tbody>
              ${opts.map(o=>`<tr><td><b>${o.name}</b></td><td>${o.cost} units</td><td>${o.effect}%</td><td style="font-size:12px;color:var(--text-secondary);">${o.note}</td>
                <td><button class="btn-sm ${st.chosenOption===o.id?'primary':''}" data-opt="${o.id}">${st.chosenOption===o.id?'Selected ✓':'Select'}</button></td></tr>`).join('')}
            </tbody>
          </table>
          <div class="notice fact" style="margin-top:12px;">💡 A cost-benefit view helps: divide expected impact by cost to compare "value for money" across options.</div>
        </div>`;
      body.querySelectorAll('[data-opt]').forEach(b=> b.addEventListener('click', ()=>{ st.chosenOption=b.dataset.opt; renderCompare(body); }));
      nav(body, {onNext:()=>{
        if(!st.chosenOption){ h.toast('Select a policy option first','⚠️'); return; }
        stepIdx=3; render(); h.setProgress(60);
      }});
    }

    function renderImplement(body){
      const opt = OPTIONS_BY_ISSUE[st.issue.id].find(o=>o.id===st.chosenOption);
      body.innerHTML = `
        <div class="glass card">
          <h4>🏗️ Step 4 · Budget & Implementation</h4>
          <p>You are about to implement: <b>${opt.name}</b> (Cost: ${opt.cost} units, Expected impact: ${opt.effect}%).</p>
          <div class="notice info">Average stakeholder support: <b>${Math.round(Object.values(st.feedback).reduce((a,b)=>a+b,0)/(Object.values(st.feedback).length||1))||50}%</b></div>
          <div class="btn-row"><button class="btn-sm primary" id="do-implement">🚀 Implement Policy</button></div>
        </div>`;
      body.querySelector('#do-implement').addEventListener('click', ()=>{
        st.budgetSpent = opt.cost;
        stepIdx=4; render(); h.setProgress(80);
        h.toast('Policy implemented — now monitor outcomes','🚀');
      });
    }

    function renderMonitor(body){
      const opt = OPTIONS_BY_ISSUE[st.issue.id].find(o=>o.id===st.chosenOption);
      const supportAvg = Math.round(Object.values(st.feedback).reduce((a,b)=>a+b,0)/(Object.values(st.feedback).length||1))||50;
      body.innerHTML = `
        <div class="glass card">
          <h4>📡 Step 5 · Monitor Outcomes</h4>
          <p>Track how the policy performs over time. Real impact often builds gradually and can be nudged by continued public engagement.</p>
          <div class="btn-row"><button class="btn-sm primary" id="advance-month">⏭ Advance One Month (Month ${st.months+1})</button></div>
          <div class="chart-box" style="margin-top:14px;"><canvas id="policy-trend"></canvas></div>
          <div class="legend">
            <span><i class="dot" style="background:#43A047"></i>Problem Reduction / Impact</span>
            <span><i class="dot" style="background:#1976D2"></i>Public Satisfaction</span>
          </div>
        </div>`;
      body.querySelector('#advance-month').addEventListener('click', ()=>{
        st.months++;
        const impact = Math.min(opt.effect, Math.round((st.history.impact.at(-1)||0) + opt.effect/4 + (Math.random()*6-3)));
        const satisfaction = Math.round(impact*0.6 + supportAvg*0.4);
        st.history.impact.push(Math.max(0,impact));
        st.history.satisfaction.push(Math.max(0,Math.min(100,satisfaction)));
        drawChart();
        body.querySelector('#advance-month').textContent = `⏭ Advance One Month (Month ${st.months+1})`;
        h.setProgress(Math.min(100, 80+st.months*5));
      });
      function drawChart(){
        const c = body.querySelector('#policy-trend');
        if(!st.history.impact.length){
          const ctx=c.getContext('2d'); const r=c.getBoundingClientRect(); c.width=r.width; c.height=r.height;
          ctx.fillStyle = document.body.getAttribute('data-theme')==='dark'?'#B7C3DC':'#5A6478';
          ctx.font='13px Nunito Sans'; ctx.textAlign='center';
          ctx.fillText('Advance a month to begin tracking', r.width/2, r.height/2);
          return;
        }
        h.drawLine(c, [
          {data:st.history.impact, color:'#43A047'},
          {data:st.history.satisfaction, color:'#1976D2'},
        ], {max:100, min:0});
      }
      drawChart();
    }

    render();
    h.setProgress(20);
  }

  vpslRegister({
    sim, category:'Public Policy', meta, quiz,
    summary:'You identified a community issue, gathered stakeholder feedback, compared policy options on cost and impact, implemented a chosen policy, and monitored its outcomes over time.',
    simulate,
  });
})();
