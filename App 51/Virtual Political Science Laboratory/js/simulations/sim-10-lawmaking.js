/* ============================================================
   SIMULATION 10 — LAW-MAKING PROCESS SIMULATOR
   ============================================================ */
(function(){
  const sim = VPSL_DATA.sims.find(s=>s.id==='lawmaking');

  const meta = {
    objectives:[
      'Identify a real-world problem worth addressing through law.',
      'Define clear objectives and draft workable provisions.',
      'Incorporate committee feedback and revise a draft.',
      'Present a finished proposal for debate and a floor vote.',
    ],
    background:'Turning a problem into a good law is a craft: it starts with clearly naming the problem, setting specific objectives, and drafting provisions that are realistic to enforce. Feedback from a review committee — and willingness to revise — usually produces a stronger, more workable law than a first draft rushed straight to a vote.',
    constitutionalPrinciples:['Rule of law — laws must be clear, public, and enforceable','Deliberative law-making with structured feedback','Stakeholder consultation improving legislative quality','Legislative accountability through open debate and voting'],
    realLife:'Almost every regulation citizens encounter — building codes, environmental rules, consumer protections — went through a similar sequence: someone identified a problem, drafted a solution, received feedback, revised it, and it was debated and voted on before becoming binding.',
    misconceptions:['A "first draft" of a law is expected to change — revision based on feedback is a sign of a healthy process, not failure.','Vague objectives make enforcement harder later — specificity in drafting matters as much as good intentions.','A bill failing a vote is not necessarily wasted effort; it often improves future proposals on the same issue.'],
    facts:['Many legislatures publish draft bills for public comment before a formal vote.','A clearly defined "objective clause" at the start of a law helps courts interpret it later.','Sunset clauses — provisions that expire after a set time unless renewed — are sometimes used to force periodic review of a law.'],
  };

  const quiz = [
    {type:'mcq', q:'What typically comes first in the law-making process modelled here?', options:['Voting','Identifying the problem and defining objectives','Committee feedback','Public debate'], answer:'Identifying the problem and defining objectives', explain:'A clear problem statement and objective usually anchor the entire drafting process.'},
    {type:'tf', q:'Revising a draft bill after committee feedback is a sign the original draft was worthless.', answer:'False', explain:'Revision is a normal, expected part of turning a draft into a workable, enforceable law.'},
    {type:'mcq', q:'Why does specific, enforceable drafting matter?', options:['It has no real effect','Vague provisions are harder to apply and enforce consistently','Only judges care about wording','Specific wording slows down all laws unnecessarily'], answer:'Vague provisions are harder to apply and enforce consistently', explain:'Precision in drafting helps ensure the law can actually be applied consistently and fairly.'},
    {type:'mcq', q:'Stakeholder consultation during law-making mainly helps by:', options:['Guaranteeing the bill will pass','Surfacing practical concerns and improving the bill before a final vote','Replacing the need for a vote','Making the process faster but worse'], answer:'Surfacing practical concerns and improving the bill before a final vote', explain:'Consultation reveals real-world issues a drafter might miss, improving the bill\'s quality.'},
    {type:'ar', q:'Assertion: A bill with a clear objective clause is easier for courts to interpret later. Reason: Courts often refer back to a law\'s stated purpose to resolve ambiguity in its provisions.', options:['Both true, Reason explains Assertion','Both true, unrelated','Assertion false, Reason true','Both false'], answer:'Both true, Reason explains Assertion', explain:'Stated purpose is a standard interpretive tool courts use, which is exactly why it helps.'},
    {type:'mcq', q:'A "sunset clause" in a law is best described as:', options:['A clause that has no legal effect','A provision that expires after a set time unless renewed','A rule that only applies at sunset hours','A synonym for an amendment'], answer:'A provision that expires after a set time unless renewed', explain:'Sunset clauses force periodic review by making a law expire unless it is actively renewed.'},
  ];

  const PROBLEMS = [
    {id:'litter', name:'Public Littering in Parks', icon:'🗑️'},
    {id:'noise', name:'Late-Night Noise in Residential Areas', icon:'🔊'},
    {id:'cycling', name:'Unsafe Cycling Lanes', icon:'🚲'},
    {id:'data', name:'Weak Protection of Students\' Personal Data', icon:'💻'},
  ];
  const OBJECTIVES = [
    {id:'reduce', text:'Reduce the frequency of the problem measurably within 2 years'},
    {id:'clarify', text:'Clarify responsibilities of authorities and citizens'},
    {id:'enforce', text:'Create a fair, enforceable penalty structure'},
    {id:'protect', text:'Protect vulnerable groups most affected by the issue'},
  ];
  const PROVISIONS = [
    {id:'p1', text:'Define the prohibited conduct clearly and specifically', quality:14},
    {id:'p2', text:'Set a graduated penalty (warning, then fine, then further action)', quality:12},
    {id:'p3', text:'Assign a specific authority responsible for enforcement', quality:13},
    {id:'p4', text:'Include a public awareness/education requirement', quality:8},
    {id:'p5', text:'Add a sunset clause requiring review after 3 years', quality:9},
    {id:'p6', text:'Leave enforcement details vague to "decide later"', quality:-15},
  ];

  function simulate(panel, h){
    const steps = ['Problem','Objectives','Draft','Committee','Revise','Debate & Vote'];
    let stepIdx = 0;
    const st = { problem:null, objectives:[], provisions:[], quality:40, support:40, feedback:[], voteResult:null };

    function render(){
      panel.innerHTML = `
        <div class="stepper">
          ${steps.map((s,i)=>`<div class="step-dot ${i<stepIdx?'done':''} ${i===stepIdx?'current':''}"><span class="num">${i<stepIdx?'✓':i+1}</span>${s}</div>`).join('')}
        </div>
        <div id="step-body"></div>
      `;
      const body = panel.querySelector('#step-body');
      [renderProblem, renderObjectives, renderDraft, renderCommittee, renderRevise, renderVote][stepIdx](body);
    }
    function nav(body, {onNext, label='Next →'}={}){
      const row = document.createElement('div'); row.className='btn-row'; row.style.marginTop='16px';
      if(stepIdx>0 && stepIdx<5){ const b=document.createElement('button'); b.className='btn-sm'; b.textContent='← Back';
        b.onclick=()=>{ stepIdx--; render(); }; row.appendChild(b); }
      if(onNext){ const n=document.createElement('button'); n.className='btn-sm primary'; n.textContent=label; n.onclick=onNext; row.appendChild(n); }
      body.appendChild(row);
    }

    function renderProblem(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🧭 Step 1 · Identify the Problem</h4>
          <div style="display:grid;gap:8px;">
            ${PROBLEMS.map(p=>`<button class="btn-sm" data-p="${p.id}" style="text-align:left;padding:12px;">${p.icon} ${p.name}</button>`).join('')}
          </div>
        </div>`;
      body.querySelectorAll('[data-p]').forEach(b=> b.addEventListener('click', ()=>{
        st.problem = PROBLEMS.find(p=>p.id===b.dataset.p);
        stepIdx=1; render(); h.setProgress(25);
      }));
    }

    function renderObjectives(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🎯 Step 2 · Define Objectives</h4>
          <p>Select the objectives your law on "<b>${st.problem.name}</b>" should achieve. Choose thoughtfully — every objective should be reflected later in your provisions.</p>
          <div style="display:grid;gap:8px;">
            ${OBJECTIVES.map(o=>`<label style="display:flex;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--surface-border);border-radius:10px;background:var(--surface);">
              <input type="checkbox" data-obj="${o.id}" ${st.objectives.includes(o.id)?'checked':''}><span>${o.text}</span></label>`).join('')}
          </div>
        </div>`;
      body.querySelectorAll('[data-obj]').forEach(cb=> cb.addEventListener('change', ()=>{
        if(cb.checked) st.objectives.push(cb.dataset.obj);
        else st.objectives = st.objectives.filter(id=>id!==cb.dataset.obj);
      }));
      nav(body, {onNext:()=>{
        if(!st.objectives.length){ h.toast('Select at least one objective','⚠️'); return; }
        stepIdx=2; render(); h.setProgress(38);
      }});
    }

    function renderDraft(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>✍️ Step 3 · Draft Provisions</h4>
          <p>Choose which provisions to include in your draft bill.</p>
          <div style="display:grid;gap:8px;">
            ${PROVISIONS.map(p=>`<label style="display:flex;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--surface-border);border-radius:10px;background:var(--surface);">
              <input type="checkbox" data-prov="${p.id}" ${st.provisions.includes(p.id)?'checked':''}><span>${p.text}</span></label>`).join('')}
          </div>
        </div>`;
      body.querySelectorAll('[data-prov]').forEach(cb=> cb.addEventListener('change', ()=>{
        if(cb.checked) st.provisions.push(cb.dataset.prov);
        else st.provisions = st.provisions.filter(id=>id!==cb.dataset.prov);
      }));
      nav(body, {onNext:()=>{
        if(!st.provisions.length){ h.toast('Select at least one provision','⚠️'); return; }
        st.quality = 30 + st.provisions.reduce((sum,id)=> sum + PROVISIONS.find(p=>p.id===id).quality, 0);
        st.quality = Math.max(0, Math.min(100, st.quality));
        stepIdx=3; render(); h.setProgress(52);
      }});
    }

    function renderCommittee(body){
      if(!st.feedback.length){
        st.feedback = [];
        if(!st.provisions.includes('p1')) st.feedback.push('⚠️ The prohibited conduct is not clearly defined — this will be hard to enforce fairly.');
        if(!st.provisions.includes('p3')) st.feedback.push('⚠️ No specific authority is assigned for enforcement — accountability will be unclear.');
        if(st.provisions.includes('p6')) st.feedback.push('❌ Leaving enforcement vague "for later" was flagged as a serious drafting weakness.');
        if(st.provisions.includes('p2')) st.feedback.push('✅ A graduated penalty structure was praised as fair and proportionate.');
        if(st.provisions.includes('p5')) st.feedback.push('✅ The sunset clause was welcomed — it ensures the law is reviewed periodically.');
        if(!st.feedback.length) st.feedback.push('✅ The committee found this draft generally sound with no major concerns.');
      }
      body.innerHTML = `
        <div class="glass card">
          <h4>🔎 Step 4 · Committee Feedback</h4>
          <p>Committee Quality Assessment: <b>${st.quality}/100</b></p>
          <ul>${st.feedback.map(f=>`<li>${f}</li>`).join('')}</ul>
        </div>`;
      nav(body, {onNext:()=>{ stepIdx=4; render(); h.setProgress(65);}, label:'Continue to Revision →'});
    }

    function renderRevise(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🔁 Step 5 · Revise Your Draft</h4>
          <p>Adjust provisions in light of committee feedback before presenting the bill for debate.</p>
          <div style="display:grid;gap:8px;">
            ${PROVISIONS.map(p=>`<label style="display:flex;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--surface-border);border-radius:10px;background:var(--surface);">
              <input type="checkbox" data-prov2="${p.id}" ${st.provisions.includes(p.id)?'checked':''}><span>${p.text}</span></label>`).join('')}
          </div>
          <div class="notice info" style="margin-top:12px;">Updated Quality: <b id="rev-quality">${st.quality}</b>/100</div>
        </div>`;
      body.querySelectorAll('[data-prov2]').forEach(cb=> cb.addEventListener('change', ()=>{
        if(cb.checked) { if(!st.provisions.includes(cb.dataset.prov2)) st.provisions.push(cb.dataset.prov2); }
        else st.provisions = st.provisions.filter(id=>id!==cb.dataset.prov2);
        st.quality = Math.max(0, Math.min(100, 30 + st.provisions.reduce((sum,id)=> sum + PROVISIONS.find(p=>p.id===id).quality, 0)));
        body.querySelector('#rev-quality').textContent = st.quality;
      }));
      nav(body, {onNext:()=>{ st.support = 35 + st.objectives.length*8; stepIdx=5; render(); h.setProgress(80);}, label:'Present for Debate →'});
    }

    function renderVote(body){
      if(!st.voteResult){
        const winProb = Math.max(0.08, Math.min(0.92, (st.quality*0.6 + st.support*0.4)/100));
        const totalMPs = 20;
        let yes=0, no=0, abstain=0;
        for(let i=0;i<totalMPs;i++){
          const r = Math.random();
          if(r < winProb*0.85) yes++;
          else if(r < winProb*0.85 + (1-winProb)*0.7) no++;
          else abstain++;
        }
        st.voteResult = {yes, no, abstain, total:totalMPs, passed: yes>totalMPs/2};
      }
      const v = st.voteResult;
      body.innerHTML = `
        <div class="glass card">
          <h4>🗳️ Step 6 · Debate & Final Vote</h4>
          <p>Final Quality: <b>${st.quality}</b>/100 · Political Support: <b>${st.support}</b>/100</p>
          <div class="chart-box"><canvas id="lm-vote-chart"></canvas></div>
          <div class="notice ${v.passed?'fact':'warn'}" style="margin-top:12px;">
            ${v.passed ? `✅ Your law on <b>${st.problem.name}</b> PASSES ${v.yes}–${v.no} (${v.abstain} abstaining) and moves toward enactment.`
                       : `❌ Your law on <b>${st.problem.name}</b> FAILS ${v.yes}–${v.no} (${v.abstain} abstaining). It can be redrafted and reintroduced.`}
          </div>
        </div>
        <div class="btn-row"><button class="btn-sm" id="new-law">↺ Draft a New Law</button></div>
      `;
      h.drawBar(body.querySelector('#lm-vote-chart'), [
        {label:'Yes', value:v.yes, color:'#43A047'},
        {label:'No', value:v.no, color:'#E53935'},
        {label:'Abstain', value:v.abstain, color:'#FFB300'},
      ], {max:v.total});
      body.querySelector('#new-law').addEventListener('click', ()=>{
        Object.assign(st, {problem:null, objectives:[], provisions:[], quality:40, support:40, feedback:[], voteResult:null});
        stepIdx=0; render();
      });
      h.setProgress(100);
    }

    render();
  }

  vpslRegister({
    sim, category:'Legislature & Law-Making', meta, quiz,
    summary:'You carried a law from an identified community problem through objectives, drafting, committee feedback, revision, and a final debate and vote — seeing directly how consultation and revision improve legislative quality.',
    simulate,
  });
})();
