/* ============================================================
   SIMULATION 7 — FEDERALISM LABORATORY
   ============================================================ */
(function(){
  const sim = VPSL_DATA.sims.find(s=>s.id==='federalism');

  const meta = {
    objectives:[
      'Allocate resources and responsibilities among Union, State and Local governments.',
      'Assign specific public functions to the tier best suited to deliver them.',
      'Compare outcomes under cooperative versus competitive federalism.',
      'Understand why some subjects are shared between tiers.',
    ],
    background:'Federal systems divide power between a central government and regional/local units so that national coordination and local responsiveness can both be achieved. Some functions (like defence) work best when centralised; others (like waste collection) work best when handled locally, close to the people they affect. Many countries also share responsibility for some subjects across tiers.',
    constitutionalPrinciples:['Distribution of powers across Union, State and Concurrent lists','Devolution of functions to local self-government','Cooperative federalism — tiers coordinating on shared goals','Fiscal federalism — how revenue and resources are shared'],
    realLife:'Debates about which level of government should run schools, handle policing, or manage disaster response are live policy questions in federal systems around the world — because the "best" tier can depend on the specific function.',
    misconceptions:['Federalism is not simply "states versus the centre" — many subjects require cooperation, not competition.','Giving a function to the local tier does not mean the centre has no interest in it — coordination and standards often still apply.','More centralisation isn\'t automatically more efficient; local knowledge often improves service delivery.'],
    facts:['Concurrent subjects allow both central and state governments to legislate, with central law generally prevailing in conflict.','Fiscal transfers from central to state/local governments are a common tool to reduce regional inequality.','Disaster response often requires fast local action supported by central resources and coordination.'],
  };

  const quiz = [
    {type:'mcq', q:'Which best describes federalism?', options:['All power concentrated at the centre','Power divided between a central authority and regional/local units','No government structure at all','Power held only by courts'], answer:'Power divided between a central authority and regional/local units', explain:'Federalism is defined by this division of power across levels of government.'},
    {type:'tf', q:'Concurrent List subjects can be legislated on by both central and state governments.', answer:'True', explain:'Concurrent List subjects allow both levels to legislate, with central law typically prevailing in case of conflict.'},
    {type:'mcq', q:'Devolution refers to:', options:['Centralising all functions','Transferring powers/responsibilities to state or local bodies','Abolishing local government','Combining all government tiers into one'], answer:'Transferring powers/responsibilities to state or local bodies', explain:'Devolution is the process of pushing authority down to more local levels of government.'},
    {type:'mcq', q:'Which function is typically best suited to local government due to its need for local knowledge?', options:['National defence','Currency and coinage','Waste collection and local roads','Foreign treaties'], answer:'Waste collection and local roads', explain:'These services benefit from proximity to residents and knowledge of local conditions.'},
    {type:'ar', q:'Assertion: Cooperative federalism often produces better disaster response than pure central control. Reason: Local governments can act faster while the centre supplies resources and coordination.', options:['Both true, Reason explains Assertion','Both true, unrelated','Assertion false, Reason true','Both false'], answer:'Both true, Reason explains Assertion', explain:'Speed of local action combined with central resource support is exactly why cooperation tends to work well here.'},
    {type:'mcq', q:'Fiscal federalism mainly concerns:', options:['How revenue and financial resources are distributed across tiers','Only foreign policy','Only judicial appointments','Only election dates'], answer:'How revenue and financial resources are distributed across tiers', explain:'Fiscal federalism is specifically about the financial relationship between different levels of government.'},
  ];

  const FUNCTIONS = [
    {id:'education', name:'School Education', icon:'🎓', best:'state'},
    {id:'health', name:'Public Health', icon:'🏥', best:'shared'},
    {id:'disaster', name:'Disaster Management', icon:'🚨', best:'shared'},
    {id:'roads', name:'Local Roads & Waste', icon:'🛣️', best:'local'},
    {id:'defence', name:'National Defence', icon:'🛡️', best:'union'},
    {id:'taxation', name:'Major Taxation Policy', icon:'💰', best:'union'},
  ];
  const TIERS = [
    {id:'union', name:'Union', color:'#0D47A1'},
    {id:'state', name:'State', color:'#1976D2'},
    {id:'local', name:'Local', color:'#26C6DA'},
    {id:'shared', name:'Shared', color:'#FFB300'},
  ];

  function simulate(panel, h){
    const st = { assign:{}, mode:'cooperative' };
    FUNCTIONS.forEach(f=> st.assign[f.id] = 'union');

    function computeOutcomes(){
      let efficiency=0, responsiveness=0, equity=0, coordination = st.mode==='cooperative'?70:40;
      FUNCTIONS.forEach(f=>{
        const chosen = st.assign[f.id];
        const correct = chosen===f.best;
        efficiency += correct ? 18 : 6;
        responsiveness += chosen==='local' ? 16 : chosen==='shared' ? 12 : chosen==='state' ? 10 : 5;
        equity += chosen==='union' ? 14 : chosen==='shared' ? 12 : 7;
      });
      const n = FUNCTIONS.length;
      return {
        efficiency: clamp(efficiency/n*5.5),
        responsiveness: clamp(responsiveness/n*5.5),
        equity: clamp(equity/n*5.5),
        coordination: clamp(coordination + (st.mode==='cooperative'?10:-10)),
      };
    }
    function clamp(v){ return Math.max(0, Math.min(100, Math.round(v))); }

    function render(){
      const o = computeOutcomes();
      panel.innerHTML = `
        <div class="panel-grid">
          <div>
            <div class="glass card">
              <h4>🧩 Assign Each Function to a Tier</h4>
              ${FUNCTIONS.map(f=>`
                <div class="control-row">
                  <label>${f.icon} ${f.name}</label>
                  <select class="select-box" data-fn="${f.id}">
                    ${TIERS.map(t=>`<option value="${t.id}" ${st.assign[f.id]===t.id?'selected':''}>${t.name}</option>`).join('')}
                  </select>
                </div>`).join('')}
            </div>
            <div class="glass card">
              <h4>🤝 Federalism Style</h4>
              <div class="btn-row">
                <button class="btn-sm ${st.mode==='cooperative'?'primary':''}" data-mode="cooperative">Cooperative</button>
                <button class="btn-sm ${st.mode==='competitive'?'primary':''}" data-mode="competitive">Competitive</button>
              </div>
              <p style="margin-top:10px;font-size:12.5px;">Cooperative federalism means tiers actively coordinate; competitive federalism means each tier acts more independently.</p>
            </div>
          </div>
          <div>
            <div class="glass card">
              <h4>📊 Governance Outcomes</h4>
              <div class="metric-list">
                ${metric('Efficiency', o.efficiency, '#0D47A1')}
                ${metric('Local Responsiveness', o.responsiveness, '#26C6DA')}
                ${metric('Regional Equity', o.equity, '#FFB300')}
                ${metric('Inter-tier Coordination', o.coordination, '#43A047')}
              </div>
            </div>
            <div class="notice ${o.efficiency>75?'fact':'info'}">${o.efficiency>75 ? '💡 Great fit! Most functions are assigned to the tier best suited to deliver them.' : '💡 Try matching each function to the tier with the most relevant local knowledge or national reach.'}</div>
          </div>
        </div>
      `;
      panel.querySelectorAll('[data-fn]').forEach(sel=> sel.addEventListener('change', ()=>{
        st.assign[sel.dataset.fn] = sel.value;
        render();
        h.setProgress(55);
      }));
      panel.querySelectorAll('[data-mode]').forEach(btn=> btn.addEventListener('click', ()=>{
        st.mode = btn.dataset.mode;
        render();
        h.setProgress(65);
      }));
    }
    function metric(label, val, color){
      return `<div class="metric"><div class="metric-top"><span>${label}</span><span>${val}/100</span></div>
        <div class="metric-bar"><div class="metric-fill" style="width:${val}%;background:${color}"></div></div></div>`;
    }
    render();
    h.setProgress(40);
  }

  vpslRegister({
    sim, category:'Federalism & Multi-level Governance', meta, quiz,
    summary:'You assigned public functions across Union, State, Local and Shared responsibility, compared cooperative and competitive federalism, and observed how tier-function fit shapes efficiency, responsiveness, equity and coordination.',
    simulate,
  });
})();
