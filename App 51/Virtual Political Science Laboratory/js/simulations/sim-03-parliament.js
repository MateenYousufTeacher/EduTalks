/* ============================================================
   SIMULATION 3 — PARLIAMENT SIMULATOR
   ============================================================ */
(function(){
  const sim = VPSL_DATA.sims.find(s=>s.id==='parliament');

  const meta = {
    objectives:[
      'Trace a bill\'s journey from drafting to becoming law.',
      'Practise the roles of committee review, debate and amendment.',
      'Understand how evidence, consultation and negotiation change a bill\'s chances of passing.',
      'Interpret a simulated division (vote) in a legislature.',
    ],
    background:'Legislatures turn ideas into binding law through a structured process: a bill is introduced, examined in detail by a committee, debated on the floor, refined through amendments, and finally voted on. This sequence exists to catch errors, gather expertise, and build the broad support a law needs to be workable and legitimate.',
    constitutionalPrinciples:['Legislative supremacy in law-making, subject to the constitution','Deliberative process — no law passes without debate and scrutiny','Majority rule with protection for structured dissent (opposition, amendments)','Representative accountability — MPs vote on behalf of constituents'],
    realLife:'Every law citizens live under — from consumer protection to school curricula — passed through stages similar to these. Committee hearings often bring in outside experts and public feedback, which is why real bills can change significantly between their first draft and the final act.',
    misconceptions:['A bill is not law until it is passed by the legislature and receives assent — introducing a bill is only the first step.','Amendments are a normal, healthy part of law-making, not a sign that a bill was "badly written".','Opposition parties voting against a bill is a normal check, not obstruction, in a healthy legislature.'],
    facts:['Many legislatures require a bill to pass through multiple "readings" before becoming law.','Committees can call expert witnesses and hold public hearings before reporting back to the full house.','A "division" is the formal term for the process of members voting and being counted.'],
  };

  const quiz = [
    {type:'mcq', q:'What is the correct general order of the legislative process modelled here?', options:['Voting → Debate → Drafting → Committee','Draft → Introduction → Committee → Debate → Amendment → Vote','Committee → Voting → Draft → Debate','Debate → Draft → Vote → Committee'], answer:'Draft → Introduction → Committee → Debate → Amendment → Vote', explain:'This is the standard sequence: a bill is drafted, introduced, scrutinised in committee, debated, amended, then voted on.'},
    {type:'tf', q:'A bill automatically becomes law the moment it is introduced in the legislature.', answer:'False', explain:'A bill only becomes law after passing through committee, debate, voting, and (typically) formal assent.'},
    {type:'mcq', q:'What is the main purpose of committee review?', options:['To delay the bill indefinitely','To provide detailed, expert scrutiny before floor debate','To let the media report on the bill','To replace the need for a vote'], answer:'To provide detailed, expert scrutiny before floor debate', explain:'Committees examine bills in detail, often with expert input, before they return to the full house.'},
    {type:'mcq', q:'An amendment is best described as:', options:['A complete rejection of the bill','A formal change proposed to part of a bill','A vote count','A new, unrelated bill'], answer:'A formal change proposed to part of a bill', explain:'Amendments modify specific provisions of a bill during the legislative process.'},
    {type:'ar', q:'Assertion: Consulting experts during committee review tends to improve a bill\'s chances of passing. Reason: Expert input can improve the bill\'s quality and address concerns before the floor vote.', options:['Both true, Reason explains Assertion','Both true, unrelated','Assertion false, Reason true','Both false'], answer:'Both true, Reason explains Assertion', explain:'Stronger evidence and addressed concerns typically make a bill more persuasive to legislators.'},
    {type:'mcq', q:'In a legislative "division", members:', options:['Are formally counted as they vote','Split into different countries','Divide the bill into sections','Elect a new speaker'], answer:'Are formally counted as they vote', explain:'A division is the formal counting of votes for and against a motion or bill.'},
  ];

  const TOPICS = [
    {id:'plastic', name:'Single-Use Plastic Reduction Bill', desc:'Phases out single-use plastic in public institutions and sets recycling targets.'},
    {id:'digital', name:'Digital Literacy in Schools Bill', desc:'Mandates basic digital literacy curriculum from Class VI onward.'},
    {id:'water', name:'Clean Water Access Bill', desc:'Establishes minimum clean water access standards for all municipalities.'},
    {id:'transparency', name:'Public Spending Transparency Bill', desc:'Requires local governments to publish budgets and spending online.'},
  ];

  function simulate(panel, h){
    const steps = ['Draft','Introduction','Committee','Debate','Amendments','Vote'];
    let stepIdx = 0;
    const st = {
      topic: null, objective:'',
      quality: 50, support: 50,
      amendments: [
        {id:'a1', text:'Add a phased 3-year implementation timeline', accepted:null, effect:{quality:8, support:5}},
        {id:'a2', text:'Exempt small businesses from immediate compliance', accepted:null, effect:{quality:3, support:10}},
        {id:'a3', text:'Add independent oversight committee', accepted:null, effect:{quality:10, support:-4}},
        {id:'a4', text:'Remove funding clause to cut costs', accepted:null, effect:{quality:-12, support:6}},
      ],
      voteResult:null,
    };

    function render(){
      panel.innerHTML = `
        <div class="stepper">
          ${steps.map((s,i)=>`<div class="step-dot ${i<stepIdx?'done':''} ${i===stepIdx?'current':''}"><span class="num">${i<stepIdx?'✓':i+1}</span>${s}</div>`).join('')}
        </div>
        <div id="step-body"></div>
      `;
      const body = panel.querySelector('#step-body');
      [renderDraft, renderIntro, renderCommittee, renderDebate, renderAmend, renderVote][stepIdx](body);
    }

    function nav(body, {onNext, nextLabel='Next →', backTo}={}){
      const row = document.createElement('div'); row.className='btn-row'; row.style.marginTop='16px';
      if(stepIdx>0){ const b=document.createElement('button'); b.className='btn-sm'; b.textContent='← Back';
        b.onclick=()=>{ stepIdx = backTo ?? stepIdx-1; render(); }; row.appendChild(b); }
      if(onNext){ const n=document.createElement('button'); n.className='btn-sm primary'; n.textContent=nextLabel; n.onclick=onNext; row.appendChild(n); }
      body.appendChild(row);
    }

    function renderDraft(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>✍️ Step 1 · Draft the Bill</h4>
          <p>Choose a topic for your bill and state its objective.</p>
          <div class="control-row"><label>Bill Topic</label>
            <select class="select-box" id="topic-select">
              <option value="">Select a topic…</option>
              ${TOPICS.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}
            </select>
          </div>
          <div id="topic-desc" class="notice info" style="display:none;"></div>
          <div class="control-row" style="margin-top:12px;">
            <label>Statement of Objective</label>
            <textarea id="objective-text" placeholder="Why is this bill needed? What problem does it solve?"></textarea>
          </div>
        </div>
      `;
      body.querySelector('#topic-select').addEventListener('change', e=>{
        st.topic = TOPICS.find(t=>t.id===e.target.value) || null;
        const d = body.querySelector('#topic-desc');
        if(st.topic){ d.style.display='block'; d.textContent = '📌 '+st.topic.desc; }
        else d.style.display='none';
      });
      body.querySelector('#objective-text').addEventListener('input', e=> st.objective = e.target.value);
      nav(body, {onNext:()=>{
        if(!st.topic){ h.toast('Choose a bill topic first','⚠️'); return; }
        stepIdx=1; render(); h.setProgress(30);
      }});
    }

    function renderIntro(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>📥 Step 2 · Introduction (First Reading)</h4>
          <p>"<b>${st.topic.name}</b>" is formally introduced in the House. The Speaker reads the title; no debate occurs at this stage — the bill is simply referred onward.</p>
          <div class="notice fact">💡 First readings are typically procedural: the point is to place the bill on record and send it to committee.</div>
        </div>
      `;
      nav(body, {onNext:()=>{ stepIdx=2; render(); h.setProgress(40);} });
    }

    function renderCommittee(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🔎 Step 3 · Committee Review</h4>
          <p>Choose how the committee handles this bill. Each action affects the bill's <b>Quality</b> (evidence & drafting soundness) and <b>Support</b> (political backing).</p>
          <div class="btn-row" style="flex-direction:column;align-items:stretch;">
            <button class="btn-sm" data-act="expert">🎓 Consult subject-matter experts (+Quality)</button>
            <button class="btn-sm" data-act="public">🗣️ Hold a public hearing (+Support)</button>
            <button class="btn-sm" data-act="rush">⏱️ Rush the review to save time (−Quality)</button>
          </div>
          <div class="notice info" style="margin-top:12px;">Current Quality: <b>${st.quality}</b> · Support: <b>${st.support}</b></div>
        </div>
      `;
      body.querySelectorAll('[data-act]').forEach(btn=> btn.addEventListener('click', ()=>{
        if(btn.dataset.act==='expert'){ st.quality=Math.min(100,st.quality+12); h.toast('Expert consultation improved bill quality','🎓'); }
        if(btn.dataset.act==='public'){ st.support=Math.min(100,st.support+12); h.toast('Public hearing raised political support','🗣️'); }
        if(btn.dataset.act==='rush'){ st.quality=Math.max(0,st.quality-10); h.toast('Rushed review — quality dropped','⏱️'); }
        body.querySelector('.notice.info').innerHTML = `Current Quality: <b>${st.quality}</b> · Support: <b>${st.support}</b>`;
      }));
      nav(body, {onNext:()=>{ stepIdx=3; render(); h.setProgress(55);} });
    }

    function renderDebate(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🎤 Step 4 · Floor Debate</h4>
          <p>Allocate your speaking strategy. Building coalition support tends to help more than attacking the opposition, but tone matters differently depending on the House's mood.</p>
          <div class="btn-row" style="flex-direction:column;align-items:stretch;">
            <button class="btn-sm" data-act="coalition">🤝 Build cross-party coalition support (+Support)</button>
            <button class="btn-sm" data-act="evidence">📊 Present data and case studies (+Quality)</button>
            <button class="btn-sm" data-act="attack">⚔️ Attack the opposition's record (risky)</button>
          </div>
          <div class="notice info" style="margin-top:12px;">Current Quality: <b>${st.quality}</b> · Support: <b>${st.support}</b></div>
        </div>
      `;
      body.querySelectorAll('[data-act]').forEach(btn=> btn.addEventListener('click', ()=>{
        if(btn.dataset.act==='coalition'){ st.support=Math.min(100,st.support+14); h.toast('Coalition building paid off','🤝'); }
        if(btn.dataset.act==='evidence'){ st.quality=Math.min(100,st.quality+8); h.toast('Strong evidence presented','📊'); }
        if(btn.dataset.act==='attack'){
          const swing = Math.random()>0.5 ? 10 : -14;
          st.support = Math.max(0, Math.min(100, st.support+swing));
          h.toast(swing>0?'Sharp critique landed well':'The attack backfired with moderates','⚔️');
        }
        body.querySelector('.notice.info').innerHTML = `Current Quality: <b>${st.quality}</b> · Support: <b>${st.support}</b>`;
      }));
      nav(body, {onNext:()=>{ stepIdx=4; render(); h.setProgress(65);} });
    }

    function renderAmend(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>📝 Step 5 · Amendments</h4>
          <p>Accept or reject each proposed amendment. Weigh the trade-off between bill quality and political support.</p>
          <div id="amend-list"></div>
          <div class="notice info" style="margin-top:12px;">Current Quality: <b id="qval">${st.quality}</b> · Support: <b id="sval">${st.support}</b></div>
        </div>
      `;
      const list = body.querySelector('#amend-list');
      st.amendments.forEach(a=>{
        const row = document.createElement('div');
        row.className='card glass'; row.style.padding='12px 16px'; row.style.marginBottom='10px';
        row.innerHTML = `<p style="margin-bottom:8px;"><b>${a.text}</b><br><span style="font-size:11.5px;color:var(--text-secondary)">Effect: Quality ${a.effect.quality>=0?'+':''}${a.effect.quality}, Support ${a.effect.support>=0?'+':''}${a.effect.support}</span></p>
          <div class="btn-row">
            <button class="btn-sm green" data-accept="${a.id}" ${a.accepted!==null?'disabled':''}>${a.accepted===true?'Accepted ✓':'Accept'}</button>
            <button class="btn-sm danger" data-reject="${a.id}" ${a.accepted!==null?'disabled':''}>${a.accepted===false?'Rejected ✓':'Reject'}</button>
          </div>`;
        list.appendChild(row);
      });
      list.addEventListener('click', e=>{
        const acc = e.target.dataset.accept, rej = e.target.dataset.reject;
        const id = acc||rej;
        if(!id) return;
        const a = st.amendments.find(x=>x.id===id);
        if(a.accepted!==null) return;
        a.accepted = !!acc;
        if(a.accepted){ st.quality=Math.max(0,Math.min(100,st.quality+a.effect.quality)); st.support=Math.max(0,Math.min(100,st.support+a.effect.support)); }
        body.querySelector('#qval').textContent = st.quality;
        body.querySelector('#sval').textContent = st.support;
        renderAmend(body);
      });
      nav(body, {onNext:()=>{ stepIdx=5; render(); h.setProgress(80);} });
    }

    function renderVote(body){
      if(!st.voteResult){
        const totalMPs = 25;
        const yesProb = Math.max(0.05, Math.min(0.95, (st.quality*0.5 + st.support*0.5)/100));
        let yes=0, no=0, abstain=0;
        for(let i=0;i<totalMPs;i++){
          const r = Math.random();
          if(r < yesProb*0.85) yes++;
          else if(r < yesProb*0.85 + (1-yesProb)*0.75) no++;
          else abstain++;
        }
        st.voteResult = {yes, no, abstain, total:totalMPs, passed: yes > totalMPs/2};
      }
      const v = st.voteResult;
      body.innerHTML = `
        <div class="glass card">
          <h4>🗳️ Step 6 · Division (Vote)</h4>
          <p>Final Quality score: <b>${st.quality}</b> · Final Support score: <b>${st.support}</b></p>
          <div class="chart-box"><canvas id="vote-chart"></canvas></div>
          <div class="notice ${v.passed?'fact':'warn'}" style="margin-top:12px;">
            ${v.passed ? `✅ The <b>${st.topic.name}</b> PASSES ${v.yes}–${v.no} (${v.abstain} abstaining) and proceeds for assent to become law.`
                       : `❌ The <b>${st.topic.name}</b> FAILS ${v.yes}–${v.no} (${v.abstain} abstaining) and does not pass into law this session.`}
          </div>
        </div>
        <div class="btn-row"><button class="btn-sm" id="new-bill">↺ Draft a New Bill</button></div>
      `;
      h.drawBar(body.querySelector('#vote-chart'), [
        {label:'Yes', value:v.yes, color:'#43A047'},
        {label:'No', value:v.no, color:'#E53935'},
        {label:'Abstain', value:v.abstain, color:'#FFB300'},
      ], {max:v.total});
      body.querySelector('#new-bill').addEventListener('click', ()=>{
        Object.assign(st, {topic:null, objective:'', quality:50, support:50, voteResult:null});
        st.amendments.forEach(a=>a.accepted=null);
        stepIdx=0; render();
      });
      h.setProgress(100);
    }

    render();
  }

  vpslRegister({
    sim, category:'Legislature & Law-Making', meta, quiz,
    summary:'You carried a bill through drafting, introduction, committee review, floor debate, amendment and a final division vote — seeing how evidence, consultation and coalition-building shift a bill\'s odds of becoming law.',
    simulate,
  });
})();
