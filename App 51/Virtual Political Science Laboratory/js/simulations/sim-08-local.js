/* ============================================================
   SIMULATION 8 — LOCAL GOVERNMENT SIMULATOR
   ============================================================ */
(function(){
  const sim = VPSL_DATA.sims.find(s=>s.id==='local');

  const meta = {
    objectives:[
      'Operate a virtual Gram Panchayat, Municipal Council, or Municipal Corporation.',
      'Balance a local budget across essential public services.',
      'Understand how public participation affects local revenue and satisfaction.',
      'Track service quality, finances and citizen satisfaction over several terms.',
    ],
    background:'Local self-government brings decision-making closest to citizens — village and town bodies manage day-to-day services like roads, water, waste and primary health centres. Because these bodies often depend on both local revenue (like property tax) and transfers from higher tiers, engaged citizens who participate (and pay local dues) directly strengthen a local body\'s ability to deliver services.',
    constitutionalPrinciples:['Panchayati Raj — a three-tier system of rural local self-government','Urban local bodies (Municipalities, Corporations) for towns and cities','Devolution of functions, funds and functionaries to local bodies','Reservation of seats to widen participation, including for women'],
    realLife:'Whether your street gets repaired, your water supply is reliable, or the local school has enough classrooms often depends directly on decisions made at this local level of government — closer to daily life than national policy.',
    misconceptions:['Local government is not "less important" than national government — it delivers the services citizens interact with most often.','Higher local taxes are not automatically bad — they can fund better services if spent well and transparently.','Public participation is not just about voting — attending gram sabha or council meetings is a form of governance too.'],
    facts:['A Gram Sabha is a meeting of all registered voters in a village — a direct form of local democracy.','Municipal Corporations typically govern larger cities, while Municipal Councils serve smaller towns.','Reserved seats for women and marginalised groups in local bodies have measurably increased their representation in local governance.'],
  };

  const quiz = [
    {type:'mcq', q:'Which of these is the smallest unit typically found in the rural Panchayati Raj system?', options:['Zila Parishad','Panchayat Samiti','Gram Panchayat','Municipal Corporation'], answer:'Gram Panchayat', explain:'The Gram Panchayat is the village-level unit, the first tier of the three-tier rural system.'},
    {type:'tf', q:'Local governments are generally responsible for services like water supply, waste management and local roads.', answer:'True', explain:'These day-to-day services are classic responsibilities of local self-government bodies.'},
    {type:'mcq', q:'A Gram Sabha is best described as:', options:['A court of law','A meeting of all registered voters in a village','A state-level assembly','A national election'], answer:'A meeting of all registered voters in a village', explain:'The Gram Sabha is a direct-democracy forum at the village level.'},
    {type:'mcq', q:'Which local body typically governs a large city?', options:['Gram Panchayat','Panchayat Samiti','Municipal Corporation','Zila Parishad'], answer:'Municipal Corporation', explain:'Municipal Corporations are the urban local bodies responsible for larger cities.'},
    {type:'ar', q:'Assertion: Reserved seats for women in local bodies have increased their participation in governance. Reason: Reservation guarantees a minimum share of representation that might not occur otherwise.', options:['Both true, Reason explains Assertion','Both true, unrelated','Assertion false, Reason true','Both false'], answer:'Both true, Reason explains Assertion', explain:'Reservation directly guarantees representation, which is why it has measurably increased participation.'},
    {type:'mcq', q:'Devolution of "funds, functions and functionaries" to local bodies mainly means:', options:['Only devolving money, nothing else','Transferring finances, responsibilities, and staff to local governments','Removing all local government staff','Centralising all decisions again'], answer:'Transferring finances, responsibilities, and staff to local governments', explain:'Effective devolution requires all three — money, responsibilities, and the staff to carry them out.'},
  ];

  const BODY_TYPES = [
    {id:'gp', name:'Gram Panchayat', budget:60},
    {id:'mc', name:'Municipal Council', budget:100},
    {id:'corp', name:'Municipal Corporation', budget:180},
  ];
  const SECTORS = [
    {id:'roads', name:'Roads', icon:'🛣️'},
    {id:'water', name:'Water Supply', icon:'💧'},
    {id:'waste', name:'Waste Management', icon:'🗑️'},
    {id:'schools', name:'Local Schools', icon:'🏫'},
    {id:'health', name:'Health Centres', icon:'🏥'},
  ];

  function simulate(panel, h){
    const st = { bodyType:null, alloc:{}, participation:55, term:0, revenue:100, history:{quality:[],satisfaction:[],revenue:[]} };

    function initAlloc(){ SECTORS.forEach(s=> st.alloc[s.id] = 20); }

    function totalBudget(){ return BODY_TYPES.find(b=>b.id===st.bodyType).budget; }
    function spent(){ return Object.values(st.alloc).reduce((a,b)=>a+b,0); }

    function compute(){
      const quality = clamp(Object.values(st.alloc).reduce((a,b)=>a+b,0) / (totalBudget()) * 55 + st.participation*0.15);
      const satisfaction = clamp(quality*0.7 + st.participation*0.3);
      return {quality, satisfaction, revenue: clamp(st.revenue)};
    }
    function clamp(v){ return Math.max(0, Math.min(100, Math.round(v))); }

    function renderPicker(){
      panel.innerHTML = `
        <div class="glass card">
          <h4>🏘️ Choose Your Local Body</h4>
          <p>Different local bodies manage different scales of population and budget.</p>
          <div class="btn-row" style="flex-direction:column;align-items:stretch;">
            ${BODY_TYPES.map(b=>`<button class="btn-sm" data-body="${b.id}" style="text-align:left;padding:14px;">
              <b>${b.name}</b> <span style="float:right;color:var(--text-secondary);font-weight:400;">Budget: ${b.budget} units</span></button>`).join('')}
          </div>
        </div>
      `;
      panel.querySelectorAll('[data-body]').forEach(btn=> btn.addEventListener('click', ()=>{
        st.bodyType = btn.dataset.body;
        initAlloc();
        h.setProgress(35);
        renderMain();
      }));
    }

    function renderMain(){
      const o = compute();
      const budget = totalBudget();
      const remaining = budget - spent();
      panel.innerHTML = `
        <div class="notice info">🏛️ Operating as: <b>${BODY_TYPES.find(b=>b.id===st.bodyType).name}</b> · Term ${st.term+1} · <button class="btn-sm" id="switch-body" style="margin-left:8px;">Switch body type</button></div>
        <div class="panel-grid">
          <div>
            <div class="glass card">
              <h4>💰 Service Budget <span class="badge ${remaining===0?'green':remaining<0?'red':'amber'}" style="margin-left:8px;">${remaining} unallocated</span></h4>
              ${SECTORS.map(s=>`
                <div class="control-row">
                  <label>${s.icon} ${s.name} <span class="val">${st.alloc[s.id]}</span></label>
                  <input type="range" min="0" max="${Math.round(budget*0.5)}" value="${st.alloc[s.id]}" data-sec="${s.id}">
                </div>`).join('')}
              <div class="control-row">
                <label>🗣️ Public Participation Drive <span class="val">${st.participation}</span></label>
                <input type="range" min="0" max="100" value="${st.participation}" id="participation-slider">
                <p style="font-size:11.5px;color:var(--text-secondary);margin-top:4px;">Higher participation (Gram Sabha attendance, local tax compliance) raises both revenue and satisfaction.</p>
              </div>
              <div class="btn-row">
                <button class="btn-sm primary" id="advance-term">⏭ Advance to Next Term</button>
                <button class="btn-sm danger" id="reset-lg">↺ Reset</button>
              </div>
            </div>
            <div class="glass card">
              <h4>📈 Trend Over Terms</h4>
              <div class="chart-box"><canvas id="lg-trend"></canvas></div>
              <div class="legend">
                <span><i class="dot" style="background:#1976D2"></i>Service Quality</span>
                <span><i class="dot" style="background:#43A047"></i>Satisfaction</span>
                <span><i class="dot" style="background:#FFB300"></i>Revenue</span>
              </div>
            </div>
          </div>
          <div>
            <div class="glass card">
              <h4>📊 Local Indicators</h4>
              <div class="metric-list">
                <div class="metric"><div class="metric-top"><span>Service Quality</span><span>${o.quality}/100</span></div><div class="metric-bar"><div class="metric-fill" style="width:${o.quality}%;background:#1976D2"></div></div></div>
                <div class="metric"><div class="metric-top"><span>Citizen Satisfaction</span><span>${o.satisfaction}/100</span></div><div class="metric-bar"><div class="metric-fill" style="width:${o.satisfaction}%;background:#43A047"></div></div></div>
                <div class="metric"><div class="metric-top"><span>Local Revenue</span><span>${o.revenue}/100</span></div><div class="metric-bar"><div class="metric-fill" style="width:${o.revenue}%;background:#FFB300"></div></div></div>
              </div>
            </div>
            <div class="notice fact">💡 A Gram Sabha or town-hall meeting is a real way citizens directly shape local budget priorities.</div>
          </div>
        </div>
      `;
      wire();
      drawTrend();
    }

    function wire(){
      panel.querySelector('#switch-body').addEventListener('click', renderPicker);
      panel.querySelectorAll('[data-sec]').forEach(inp=> inp.addEventListener('input', ()=>{
        st.alloc[inp.dataset.sec] = +inp.value;
        renderMain();
        h.setProgress(55);
      }));
      panel.querySelector('#participation-slider').addEventListener('input', e=>{
        st.participation = +e.target.value;
        renderMain();
        h.setProgress(55);
      });
      panel.querySelector('#advance-term').addEventListener('click', ()=>{
        st.term++;
        const o = compute();
        st.revenue = clamp(st.revenue*0.7 + st.participation*0.3 + (o.quality>60?5:-5));
        st.history.quality.push(o.quality); st.history.satisfaction.push(o.satisfaction); st.history.revenue.push(st.revenue);
        if(st.history.quality.length>20) Object.keys(st.history).forEach(k=>st.history[k].shift());
        renderMain();
        h.setProgress(80);
        h.toast('Advanced to next term','⏭');
      });
      panel.querySelector('#reset-lg').addEventListener('click', ()=>{
        initAlloc(); st.participation=55; st.term=0; st.revenue=100;
        st.history={quality:[],satisfaction:[],revenue:[]};
        renderMain(); h.toast('Simulator reset','↺');
      });
    }

    function drawTrend(){
      const c = panel.querySelector('#lg-trend');
      if(!c) return;
      if(!st.history.quality.length){
        const ctx=c.getContext('2d'); const r=c.getBoundingClientRect(); c.width=r.width; c.height=r.height;
        ctx.fillStyle = document.body.getAttribute('data-theme')==='dark'?'#B7C3DC':'#5A6478';
        ctx.font='13px Nunito Sans'; ctx.textAlign='center';
        ctx.fillText('Advance a term to start tracking indicators', r.width/2, r.height/2);
        return;
      }
      h.drawLine(c, [
        {data:st.history.quality, color:'#1976D2'},
        {data:st.history.satisfaction, color:'#43A047'},
        {data:st.history.revenue, color:'#FFB300'},
      ], {max:100, min:0});
    }

    renderPicker();
    h.setProgress(25);
  }

  vpslRegister({
    sim, category:'Local Self-Government', meta, quiz,
    summary:'You ran a Gram Panchayat, Municipal Council or Municipal Corporation — balancing service budgets, encouraging public participation, and tracking service quality, satisfaction and revenue across terms.',
    simulate,
  });
})();
