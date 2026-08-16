/* ============================================================
   SIMULATION 4 — EXECUTIVE DECISION STUDIO
   ============================================================ */
(function(){
  const sim = VPSL_DATA.sims.find(s=>s.id==='executive');

  const meta = {
    objectives:[
      'Allocate a fixed public budget across competing priorities.',
      'Observe how executive decisions affect welfare, finances, and service delivery indicators.',
      'Respond to an unplanned crisis by reallocating resources under pressure.',
      'Appreciate the trade-offs inherent in public administration.',
    ],
    background:'The executive branch implements laws and manages day-to-day governance — running ministries, delivering public services, and responding to emergencies. Because budgets are always limited, spending more on one priority usually means spending less on another. Good administration is about making these trade-offs transparently and adjusting as circumstances change.',
    constitutionalPrinciples:['Executive accountability to the legislature and to citizens','Efficient and equitable use of public funds','Responsiveness to public welfare and emergencies','Separation of policy-making (legislature) from implementation (executive)'],
    realLife:'Every year, real governments publish budgets allocating funds across health, education, infrastructure and more — and those choices directly shape hospital wait times, school quality, and road conditions citizens experience.',
    misconceptions:['A bigger budget for a sector doesn\'t automatically mean better outcomes — how funds are spent matters as much as how much.','Disaster response spending is not "wasted" money — underinvestment here can cause far larger losses later.','Cutting a sector\'s budget has effects that show up over time, not always immediately.'],
    facts:['Public budgets are usually split between "capital" spending (infrastructure, assets) and "revenue" spending (salaries, ongoing services).','Contingency or emergency funds exist precisely because unexpected crises are a normal part of governance.','Citizen satisfaction surveys are one real-world way governments measure whether budget choices are working.'],
  };

  const quiz = [
    {type:'mcq', q:'Why do executive budget decisions always involve trade-offs?', options:['Because laws forbid large budgets','Because the total budget is limited, so more for one sector means less for another','Because citizens are never consulted','Because ministries operate independently of any budget'], answer:'Because the total budget is limited, so more for one sector means less for another', explain:'A fixed total budget means every allocation choice has an opportunity cost elsewhere.'},
    {type:'tf', q:'Underfunding disaster preparedness has no real consequences as long as no disaster occurs that year.', answer:'False', explain:'Preparedness reduces the scale of damage when a disaster does occur; skipping it is a gamble, not a safe saving.'},
    {type:'mcq', q:'The executive branch is primarily responsible for:', options:['Writing the constitution','Implementing laws and running public administration','Sole authority to declare laws unconstitutional','Conducting elections'], answer:'Implementing laws and running public administration', explain:'The executive carries out and administers laws passed by the legislature.'},
    {type:'mcq', q:'A sudden budget cut to a well-functioning sector will most likely:', options:['Improve outcomes immediately','Have no effect at all','Gradually reduce service quality if sustained','Instantly double efficiency'], answer:'Gradually reduce service quality if sustained', explain:'Public services generally decline gradually under sustained underfunding rather than instantly.'},
    {type:'ar', q:'Assertion: Emergency funds should be maintained even in years without disasters. Reason: Disaster risk is unpredictable and preparedness reduces future losses.', options:['Both true, Reason explains Assertion','Both true, unrelated','Assertion false, Reason true','Both false'], answer:'Both true, Reason explains Assertion', explain:'Because disasters are unpredictable, maintaining reserves is a rational response to reduce future harm.'},
    {type:'mcq', q:'Which best describes "public administration"?', options:['The private management of a business','The implementation and management of government policy and services','A court proceeding','A political party\'s internal structure'], answer:'The implementation and management of government policy and services', explain:'Public administration is the machinery through which government policy is delivered to citizens.'},
  ];

  const SECTORS = [
    {id:'health', name:'Public Health', icon:'🏥', color:'#E53935'},
    {id:'education', name:'Education', icon:'🎓', color:'#1976D2'},
    {id:'infra', name:'Infrastructure', icon:'🛣️', color:'#FFB300'},
    {id:'disaster', name:'Disaster Response', icon:'🚨', color:'#26C6DA'},
  ];

  function simulate(panel, h){
    const TOTAL_BUDGET = 100; // in "budget units"
    let alloc = {health:28, education:28, infra:28, disaster:16};
    let turn = 0;
    let finances = 100;
    let crisisActive = null;
    const history = {welfare:[], finances:[], delivery:[]};

    function remaining(){ return TOTAL_BUDGET - Object.values(alloc).reduce((a,b)=>a+b,0); }

    function computeOutcomes(){
      const welfare = clamp(alloc.health*1.1 + alloc.education*0.9 + alloc.disaster*0.5 - (crisisActive && alloc.disaster<15 ? 20 : 0));
      const delivery = clamp(alloc.infra*1.2 + alloc.health*0.5 + alloc.education*0.5);
      const finScore = clamp(finances);
      return {welfare: clamp(welfare/1.5*1.0), delivery: clamp(delivery/1.5), finances: finScore};
    }
    function clamp(v){ return Math.max(0, Math.min(100, Math.round(v))); }

    function render(){
      const o = computeOutcomes();
      const rem = remaining();
      panel.innerHTML = `
        <div class="panel-grid">
          <div>
            <div class="glass card">
              <h4>💰 Budget Allocation <span class="badge ${rem===0?'green':rem<0?'red':'amber'}" style="margin-left:8px;">${rem} units unallocated</span></h4>
              ${SECTORS.map(s=>`
                <div class="control-row">
                  <label>${s.icon} ${s.name} <span class="val">${alloc[s.id]}</span></label>
                  <input type="range" min="0" max="60" value="${alloc[s.id]}" data-sector="${s.id}">
                </div>`).join('')}
              <p style="font-size:12px;color:var(--text-secondary);">Total budget: ${TOTAL_BUDGET} units. Allocate wisely — overspending draws down your financial reserve.</p>
              <div class="btn-row">
                <button class="btn-sm primary" id="btn-advance">⏭ Advance to Next Quarter (Turn ${turn+1})</button>
                <button class="btn-sm danger" id="btn-reset">↺ Reset</button>
              </div>
              ${crisisActive ? `<div class="notice warn" style="margin-top:12px;">🚨 <b>Active Crisis:</b> ${crisisActive.text} Increase Disaster Response funding to respond effectively.</div>` : ''}
            </div>
            <div class="glass card">
              <h4>📈 Indicators Over Time</h4>
              <div class="chart-box"><canvas id="exec-trend"></canvas></div>
              <div class="legend">
                <span><i class="dot" style="background:#43A047"></i>Welfare</span>
                <span><i class="dot" style="background:#1976D2"></i>Service Delivery</span>
                <span><i class="dot" style="background:#FFB300"></i>Finances</span>
              </div>
            </div>
          </div>
          <div>
            <div class="glass card">
              <h4>📊 Governance Indicators</h4>
              <div class="metric-list">
                <div class="metric"><div class="metric-top"><span>Citizen Welfare</span><span>${o.welfare}/100</span></div><div class="metric-bar"><div class="metric-fill" style="width:${o.welfare}%;background:#43A047"></div></div></div>
                <div class="metric"><div class="metric-top"><span>Service Delivery</span><span>${o.delivery}/100</span></div><div class="metric-bar"><div class="metric-fill" style="width:${o.delivery}%;background:#1976D2"></div></div></div>
                <div class="metric"><div class="metric-top"><span>Financial Health</span><span>${o.finances}/100</span></div><div class="metric-bar"><div class="metric-fill" style="width:${o.finances}%;background:#FFB300"></div></div></div>
              </div>
            </div>
            <div class="notice info">💡 Try under-funding disaster response, then trigger a few quarters — a crisis without reserves hits welfare hard.</div>
          </div>
        </div>
      `;
      wire();
      drawTrend();
    }

    function wire(){
      panel.querySelectorAll('input[type=range]').forEach(inp=>{
        inp.addEventListener('input', ()=>{
          alloc[inp.dataset.sector] = +inp.value;
          render();
          h.setProgress(45);
        });
      });
      panel.querySelector('#btn-advance').addEventListener('click', advance);
      panel.querySelector('#btn-reset').addEventListener('click', ()=>{
        alloc = {health:28, education:28, infra:28, disaster:16};
        turn=0; finances=100; crisisActive=null;
        history.welfare=[];history.finances=[];history.delivery=[];
        render(); h.toast('Studio reset','↺');
      });
    }

    function advance(){
      const rem = remaining();
      finances = clamp(finances - Math.max(0, -rem)*3 + (rem>0? rem*0.5 : 0));
      turn++;
      if(!crisisActive && Math.random() < 0.28){
        const crises = ['A flash flood has struck low-lying districts.','A disease outbreak requires an emergency health response.','A bridge collapse has disrupted regional transport.'];
        crisisActive = {text: crises[Math.floor(Math.random()*crises.length)], turnsLeft:2};
        h.toast('Crisis event triggered!','🚨');
      } else if(crisisActive){
        const handledWell = alloc.disaster >= 15;
        finances = clamp(finances - (handledWell?5:18));
        crisisActive.turnsLeft--;
        if(crisisActive.turnsLeft<=0){
          h.toast(handledWell? 'Crisis managed effectively' : 'Crisis response was inadequate — welfare suffered', handledWell?'✅':'⚠️');
          crisisActive=null;
        }
      }
      const o = computeOutcomes();
      history.welfare.push(o.welfare); history.finances.push(o.finances); history.delivery.push(o.delivery);
      if(history.welfare.length>20) Object.keys(history).forEach(k=>history[k].shift());
      render();
      h.setProgress(75);
    }

    function drawTrend(){
      const c = panel.querySelector('#exec-trend');
      if(!c) return;
      if(!history.welfare.length){
        const ctx=c.getContext('2d'); const r=c.getBoundingClientRect(); c.width=r.width; c.height=r.height;
        ctx.fillStyle = document.body.getAttribute('data-theme')==='dark'?'#B7C3DC':'#5A6478';
        ctx.font='13px Nunito Sans'; ctx.textAlign='center';
        ctx.fillText('Advance a quarter to start tracking indicators', r.width/2, r.height/2);
        return;
      }
      h.drawLine(c, [
        {data:history.welfare, color:'#43A047'},
        {data:history.delivery, color:'#1976D2'},
        {data:history.finances, color:'#FFB300'},
      ], {max:100, min:0});
    }

    render();
  }

  vpslRegister({
    sim, category:'Public Administration', meta, quiz,
    summary:'You managed a public budget across health, education, infrastructure and disaster response — balancing citizen welfare, service delivery and financial health while responding to an unplanned crisis.',
    simulate,
  });
})();
