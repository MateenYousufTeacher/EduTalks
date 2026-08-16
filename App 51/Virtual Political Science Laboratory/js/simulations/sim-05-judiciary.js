/* ============================================================
   SIMULATION 5 — JUDICIARY EXPLORER
   (All cases and parties are fictional, for educational use only)
   ============================================================ */
(function(){
  const sim = VPSL_DATA.sims.find(s=>s.id==='judiciary');

  const meta = {
    objectives:[
      'Walk a fictional civil case through filing, evidence, hearing, and judgment.',
      'Understand the roles of evidence and due process in reaching a fair verdict.',
      'Explore the appeals process and the idea of judicial review.',
      'Appreciate the principle of equality before the law through a simulated case.',
    ],
    background:'Courts resolve disputes by applying the law to facts established through evidence, argument and fair procedure. A judgment is not just about who "seems right" — it depends on which side\'s evidence and legal arguments hold up to scrutiny under a fair, consistent process. This simulation uses entirely fictional cases and characters to model that process safely.',
    constitutionalPrinciples:['Equality before the law — every party gets a fair hearing','Due process — fair, consistent procedure before any judgment','Independence of the judiciary from political pressure','Right to appeal to a higher court'],
    realLife:'Whether it\'s a consumer dispute, a workplace complaint, or a property disagreement, real courts go through comparable stages: a claim is filed, both sides present evidence, a hearing is held, and a reasoned judgment is delivered — which either side may appeal.',
    misconceptions:['A court case is not decided by which party is more sympathetic — it is decided on evidence and law.','Losing a case at first instance does not mean the process was unfair; it can still be appealed.','Judicial review is about checking legality, not about a judge\'s personal opinion on policy.'],
    facts:['Many legal systems have multiple tiers of courts, allowing a case to be appealed to a higher authority.','"Due process" protections exist precisely so that even an unpopular party still receives a fair hearing.','Judgments are usually written and reasoned, so the logic behind a decision can be reviewed later.'],
  };

  const quiz = [
    {type:'mcq', q:'A court judgment is primarily based on:', options:['Public opinion polls','Evidence and legal argument presented through due process','Which party is wealthier','Media coverage'], answer:'Evidence and legal argument presented through due process', explain:'Courts decide based on evidence and law tested through a fair procedure, not popularity or wealth.'},
    {type:'tf', q:'If a party loses a case, they generally have no further legal options.', answer:'False', explain:'Most legal systems allow an appeal to a higher court, which can review the decision.'},
    {type:'mcq', q:'"Equality before the law" means:', options:['Only citizens with legal training can go to court','All parties are subject to the same laws and fair procedure regardless of status','Judges decide based on a party\'s social status','Rich and poor face different legal standards'], answer:'All parties are subject to the same laws and fair procedure regardless of status', explain:'This principle requires that the law and procedure apply equally, without special treatment based on status.'},
    {type:'mcq', q:'Judicial review refers to:', options:['A court reviewing whether a law or action is constitutional/legal','A judge reviewing their own past cases for errors','The public voting on judgments','A retrial with a jury only'], answer:'A court reviewing whether a law or action is constitutional/legal', explain:'Judicial review is the power of courts to assess whether laws or executive actions comply with the constitution.'},
    {type:'ar', q:'Assertion: Due process protections apply even to parties who are likely guilty or in the wrong. Reason: Fair procedure is what makes any judgment legitimate, regardless of outcome.', options:['Both true, Reason explains Assertion','Both true, unrelated','Assertion false, Reason true','Both false'], answer:'Both true, Reason explains Assertion', explain:'Due process exists to ensure legitimacy of the outcome itself, so it must apply to everyone equally.'},
    {type:'mcq', q:'An appeal is best described as:', options:['A request to a higher court to review a lower court\'s decision','A second unrelated case','A public protest against a verdict','A request to change the law itself'], answer:'A request to a higher court to review a lower court\'s decision', explain:'An appeal asks a higher court to review whether the lower court\'s decision was correct.'},
  ];

  const CASES = [
    {id:'boundary', name:'Case A: Property Boundary Dispute', desc:'Two neighbours disagree over where a shared boundary wall should lie.',
     evidence:[
       {id:'survey', text:'Certified land survey report', strength:22},
       {id:'photos', text:'Old photographs of the boundary', strength:8},
       {id:'witness', text:'Neighbour\'s testimony', strength:10},
       {id:'deed', text:'Original property deed', strength:20},
     ]},
    {id:'workplace', name:'Case B: Workplace Fairness Claim', desc:'An employee alleges they were treated unfairly compared to colleagues in a similar role.',
     evidence:[
       {id:'emails', text:'Internal emails showing decision process', strength:20},
       {id:'payroll', text:'Payroll records for comparison', strength:18},
       {id:'testimony', text:'Colleague testimony', strength:12},
       {id:'policy', text:'Company HR policy document', strength:14},
     ]},
    {id:'nuisance', name:'Case C: Public Nuisance (Noise) Case', desc:'Residents complain that a local workshop\'s noise levels exceed permitted limits.',
     evidence:[
       {id:'readings', text:'Certified decibel readings', strength:24},
       {id:'complaints', text:'Log of resident complaints', strength:10},
       {id:'permit', text:'Workshop\'s operating permit terms', strength:16},
       {id:'expert', text:'Independent acoustics expert report', strength:18},
     ]},
  ];

  function simulate(panel, h){
    const steps = ['Filing','Evidence','Hearing','Judgment','Appeal'];
    let stepIdx = 0;
    const st = { caseSel:null, chosenEvidence:[], hearingStrategy:null, caseStrength:0, dueProcess:70, verdict:null, appealResult:null };

    function render(){
      panel.innerHTML = `
        <div class="stepper">
          ${steps.map((s,i)=>`<div class="step-dot ${i<stepIdx?'done':''} ${i===stepIdx?'current':''}"><span class="num">${i<stepIdx?'✓':i+1}</span>${s}</div>`).join('')}
        </div>
        <div class="notice info">🎭 All cases, names and events in this simulation are entirely fictional and created for educational purposes.</div>
        <div id="step-body"></div>
      `;
      const body = panel.querySelector('#step-body');
      [renderFiling, renderEvidence, renderHearing, renderJudgment, renderAppeal][stepIdx](body);
    }
    function nav(body, {onNext, label='Next →'}={}){
      const row = document.createElement('div'); row.className='btn-row'; row.style.marginTop='16px';
      if(stepIdx>0 && stepIdx<4){ const b=document.createElement('button'); b.className='btn-sm'; b.textContent='← Back';
        b.onclick=()=>{ stepIdx--; render(); }; row.appendChild(b); }
      if(onNext){ const n=document.createElement('button'); n.className='btn-sm primary'; n.textContent=label; n.onclick=onNext; row.appendChild(n); }
      body.appendChild(row);
    }

    function renderFiling(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>📁 Step 1 · Filing the Case</h4>
          <p>Choose a fictional case to explore.</p>
          <div style="display:grid;gap:10px;">
            ${CASES.map(c=>`<button class="btn-sm" data-case="${c.id}" style="text-align:left;padding:14px;">
              <b>${c.name}</b><br><span style="font-weight:400;font-size:12px;color:var(--text-secondary)">${c.desc}</span></button>`).join('')}
          </div>
        </div>
      `;
      body.querySelectorAll('[data-case]').forEach(b=> b.addEventListener('click', ()=>{
        st.caseSel = CASES.find(c=>c.id===b.dataset.case);
        stepIdx=1; render(); h.setProgress(30);
      }));
    }

    function renderEvidence(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>📎 Step 2 · Evidence Presentation</h4>
          <p>Select the evidence you wish to present for <b>${st.caseSel.name}</b>. Stronger, more relevant evidence increases case strength — but courts also weigh how well each piece survives cross-examination.</p>
          <div style="display:grid;gap:8px;">
            ${st.caseSel.evidence.map(e=>`
              <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--surface-border);border-radius:10px;background:var(--surface);">
                <input type="checkbox" data-ev="${e.id}" ${st.chosenEvidence.includes(e.id)?'checked':''}>
                <span>${e.text}</span>
              </label>`).join('')}
          </div>
        </div>
      `;
      body.querySelectorAll('[data-ev]').forEach(cb=> cb.addEventListener('change', ()=>{
        if(cb.checked) st.chosenEvidence.push(cb.dataset.ev);
        else st.chosenEvidence = st.chosenEvidence.filter(id=>id!==cb.dataset.ev);
      }));
      nav(body, {onNext:()=>{
        if(!st.chosenEvidence.length){ h.toast('Select at least one piece of evidence','⚠️'); return; }
        stepIdx=2; render(); h.setProgress(50);
      }});
    }

    function renderHearing(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🎙️ Step 3 · Hearing</h4>
          <p>Choose your approach to the hearing.</p>
          <div style="display:grid;gap:10px;">
            <button class="btn-sm" data-strat="thorough" style="text-align:left;padding:14px;"><b>Thorough cross-examination</b><br><span style="font-weight:400;font-size:12px;color:var(--text-secondary)">Slower, but strengthens credible evidence and weakens weak claims.</span></button>
            <button class="btn-sm" data-strat="concise" style="text-align:left;padding:14px;"><b>Concise, focused argument</b><br><span style="font-weight:400;font-size:12px;color:var(--text-secondary)">Efficient and clear, moderate strength boost.</span></button>
            <button class="btn-sm" data-strat="aggressive" style="text-align:left;padding:14px;"><b>Aggressive challenge to the other side</b><br><span style="font-weight:400;font-size:12px;color:var(--text-secondary)">Can backfire if due process is not respected.</span></button>
          </div>
        </div>
      `;
      body.querySelectorAll('[data-strat]').forEach(b=> b.addEventListener('click', ()=>{
        st.hearingStrategy = b.dataset.strat;
        if(st.hearingStrategy==='thorough') st.dueProcess += 10;
        if(st.hearingStrategy==='aggressive') st.dueProcess -= 12;
        stepIdx=3; render(); h.setProgress(70);
      }));
    }

    function renderJudgment(body){
      if(!st.verdict){
        const evidenceStrength = st.chosenEvidence.reduce((sum,id)=> sum + st.caseSel.evidence.find(e=>e.id===id).strength, 0);
        const stratBonus = {thorough:14, concise:8, aggressive: Math.random()>0.5?12:-10}[st.hearingStrategy] || 0;
        st.caseStrength = Math.max(5, Math.min(100, evidenceStrength + stratBonus));
        const winProb = Math.max(0.08, Math.min(0.92, st.caseStrength/100 * 0.7 + (st.dueProcess/100)*0.3));
        st.verdict = { favour: Math.random() < winProb, strength: st.caseStrength, dueProcess: Math.max(0,Math.min(100,st.dueProcess)) };
      }
      const v = st.verdict;
      body.innerHTML = `
        <div class="glass card">
          <h4>⚖️ Step 4 · Judgment</h4>
          <div class="metric-list">
            <div class="metric"><div class="metric-top"><span>Case Strength</span><span>${v.strength}/100</span></div><div class="metric-bar"><div class="metric-fill" style="width:${v.strength}%;background:#0D47A1"></div></div></div>
            <div class="metric"><div class="metric-top"><span>Due Process Compliance</span><span>${v.dueProcess}/100</span></div><div class="metric-bar"><div class="metric-fill" style="width:${v.dueProcess}%;background:#43A047"></div></div></div>
          </div>
          <div class="notice ${v.favour?'fact':'warn'}" style="margin-top:14px;">
            ${v.favour ? '✅ <b>Judgment delivered in favour of your side.</b> The court found the presented evidence and argument more persuasive on the balance of the case.'
                       : '❌ <b>Judgment delivered against your side.</b> The court found the opposing evidence and argument more persuasive on the balance of the case.'}
          </div>
          <p style="margin-top:10px;font-size:12.5px;color:var(--text-secondary);">A reasoned, written judgment like this can be examined and challenged in a higher court through an appeal.</p>
        </div>
      `;
      nav(body, {onNext:()=>{ stepIdx=4; render(); h.setProgress(90); }, label:'Continue to Appeal →'});
    }

    function renderAppeal(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🏛️ Step 5 · Appeal</h4>
          <p>${st.verdict.favour ? 'Your side won at first instance. The losing side may still choose to appeal.' : 'Your side may choose to appeal this judgment to a higher court.'}</p>
          <div class="btn-row">
            <button class="btn-sm primary" id="do-appeal">📤 File an Appeal</button>
            <button class="btn-sm" id="accept-judgment">Accept the Judgment</button>
          </div>
          <div id="appeal-out" style="margin-top:14px;"></div>
        </div>
      `;
      body.querySelector('#do-appeal').addEventListener('click', ()=>{
        const higherStandard = st.verdict.strength - 15; // higher court applies stricter scrutiny
        const upheld = higherStandard + (st.verdict.dueProcess-70)*0.3 > 45;
        const out = body.querySelector('#appeal-out');
        out.innerHTML = `<div class="notice ${upheld?'info':'warn'}">${upheld ? '🏛️ The higher court <b>upholds</b> the original judgment after review.' : '🏛️ The higher court <b>overturns</b> the original judgment, citing weaknesses in the evidence or process.'}</div>
          <div class="btn-row" style="margin-top:12px;"><button class="btn-sm" id="new-case">↺ Explore a New Case</button></div>`;
        out.querySelector('#new-case').addEventListener('click', ()=>{
          Object.assign(st, {caseSel:null, chosenEvidence:[], hearingStrategy:null, caseStrength:0, dueProcess:70, verdict:null});
          stepIdx=0; render();
        });
        h.setProgress(100);
      });
      body.querySelector('#accept-judgment').addEventListener('click', ()=>{
        h.toast('Judgment accepted as final','⚖️');
        h.setProgress(100);
      });
    }

    render();
  }

  vpslRegister({
    sim, category:'Judiciary & Rule of Law', meta, quiz,
    summary:'You filed a fictional case, presented evidence, chose a hearing strategy, received a reasoned judgment, and explored the appeals process — seeing how evidence quality and fair procedure shape judicial outcomes.',
    simulate,
  });
})();
