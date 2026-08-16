/* ============================================================
   SIMULATION 6 — CONSTITUTION INTERACTIVE STUDIO
   ============================================================ */
(function(){
  const sim = VPSL_DATA.sims.find(s=>s.id==='constitution');

  const meta = {
    objectives:[
      'Match everyday situations to the Fundamental Right they involve.',
      'Explore the Preamble, Rights, Duties and Directive Principles interactively.',
      'Practise constitutional decision-making through short dilemmas.',
      'Place key milestones of constitutional development on a timeline.',
    ],
    background:'A constitution is easiest to understand through its application, not just its text. Fundamental Rights protect citizens from state overreach and guarantee basic freedoms; Fundamental Duties describe what citizens owe in return; Directive Principles guide policy even where rights are silent. Recognising which provision applies to a real situation is a core civic skill.',
    constitutionalPrinciples:['Fundamental Rights are enforceable in court','Fundamental Duties are moral, not directly enforceable','Directive Principles guide law-making though not directly enforceable','The Preamble expresses the document\'s guiding philosophy'],
    realLife:'News stories about free speech, discrimination, education access, or environmental protection are almost always, at heart, stories about one of these constitutional provisions in action.',
    misconceptions:['Fundamental Rights are not absolute — reasonable restrictions can apply, for example in the interest of public order.','Fundamental Duties existing alongside rights does not mean rights are conditional on performing duties.','The Directive Principles not being "enforceable" does not mean they are unimportant — they still guide legislation.'],
    facts:['The Preamble has been amended only once in India\'s constitutional history, adding words like "Socialist" and "Secular".','India\'s Constitution is one of the longest written constitutions in the world.','Fundamental Duties were added to the Constitution after it originally came into force.'],
  };

  const quiz = [
    {type:'mcq', q:'Which part of the Constitution is directly enforceable in court if violated?', options:['Directive Principles','Fundamental Duties','Fundamental Rights','The Preamble alone'], answer:'Fundamental Rights', explain:'Fundamental Rights can be enforced through the courts, including via the Right to Constitutional Remedies.'},
    {type:'tf', q:'Directive Principles of State Policy can be enforced directly in a court of law.', answer:'False', explain:'They guide government policy but are not directly enforceable, unlike Fundamental Rights.'},
    {type:'mcq', q:'A law that discriminates against citizens based on religion would most directly violate:', options:['Right to Freedom of Religion / Equality','Fundamental Duties','Directive Principles only','No provision at all'], answer:'Right to Freedom of Religion / Equality', explain:'Discrimination on the basis of religion directly implicates the Right to Equality and Freedom of Religion.'},
    {type:'mcq', q:'Fundamental Duties are best described as:', options:['Enforceable court orders','Moral obligations of citizens, not directly enforceable','Rules only for government officials','Optional suggestions with no constitutional basis'], answer:'Moral obligations of citizens, not directly enforceable', explain:'They express civic responsibility but are not enforceable the way Fundamental Rights are.'},
    {type:'ar', q:'Assertion: The Preamble is used by courts to interpret ambiguous constitutional provisions. Reason: It expresses the foundational values the rest of the Constitution is meant to serve.', options:['Both true, Reason explains Assertion','Both true, unrelated','Assertion false, Reason true','Both false'], answer:'Both true, Reason explains Assertion', explain:'Because the Preamble states the document\'s core values, it naturally guides interpretation of unclear provisions.'},
    {type:'mcq', q:'"Justice, Liberty, Equality, Fraternity" appear in which part of the Constitution?', options:['Preamble','Ninth Schedule','Article 370 alone','Table of Contents only'], answer:'Preamble', explain:'These four ideals are explicitly stated in the Preamble.'},
  ];

  const SITUATIONS = [
    {id:'s1', text:'A newspaper is stopped from publishing an article criticising a government policy.', right:'Right to Freedom'},
    {id:'s2', text:'A qualified candidate is denied a government job only because of their caste.', right:'Right to Equality'},
    {id:'s3', text:'A factory forces children under 14 to work in hazardous conditions.', right:'Right against Exploitation'},
    {id:'s4', text:'A minority community is prevented from running its own school.', right:'Cultural & Educational Rights'},
    {id:'s5', text:'A citizen is denied the right to worship according to their own faith.', right:'Right to Freedom of Religion'},
    {id:'s6', text:'A person\'s fundamental right is violated and they need a legal remedy.', right:'Right to Constitutional Remedies'},
  ];
  const RIGHT_OPTIONS = ['Right to Equality','Right to Freedom','Right against Exploitation','Right to Freedom of Religion','Cultural & Educational Rights','Right to Constitutional Remedies'];

  const SCENARIOS = [
    {q:'A town wants to build a road through a small privately-owned plot for public benefit. What constitutional principle guides fair handling of this?', options:['Ignore the owner\'s claim entirely','Follow due process and fair compensation under law','Let the loudest group in town decide','Delay indefinitely without any decision'], answer:'Follow due process and fair compensation under law', explain:'Even for public benefit, the state must act through fair, lawful procedure rather than simply overriding individual claims.'},
    {q:'A state government wants to promote free primary education. Which part of the Constitution most directly supports this policy priority?', options:['Directive Principles of State Policy','Fundamental Duties only','No constitutional basis exists','Only international treaties'], answer:'Directive Principles of State Policy', explain:'Improving education is one of the aims the Directive Principles ask the state to work toward.'},
    {q:'A citizen wants to challenge a new law they believe violates their Fundamental Rights. What can they do?', options:['Nothing — laws cannot be challenged','Approach the courts using the Right to Constitutional Remedies','Only vote the government out at the next election','Write only to the newspaper'], answer:'Approach the courts using the Right to Constitutional Remedies', explain:'This right specifically allows citizens to seek judicial relief when their Fundamental Rights are violated.'},
  ];

  const TIMELINE = [
    {year:'1946', event:'A Constituent Assembly is convened to draft the Constitution.'},
    {year:'26 Nov 1949', event:'The Constitution is adopted by the Constituent Assembly.'},
    {year:'26 Jan 1950', event:'The Constitution comes into force — celebrated annually as Republic Day.'},
    {year:'1976', event:'An amendment adds Fundamental Duties and words like "Socialist" and "Secular" to the Preamble.'},
    {year:'1992', event:'Amendments establish a stronger three-tier local self-government system.'},
    {year:'Present', event:'The Constitution continues to be interpreted and, occasionally, amended through the process it defines.'},
  ];

  function simulate(panel, h){
    const st = { matched:{}, matchScore:0, matchDone:false, scenarioAnswers:{} };

    function render(){
      panel.innerHTML = `
        <div class="glass card">
          <h4>🧩 Activity 1 · Match the Right to the Situation</h4>
          <p>Click a situation, then click the Fundamental Right you think applies.</p>
          <div id="match-situations" style="display:grid;gap:8px;margin-bottom:14px;"></div>
          <div id="match-rights" class="chip-row" style="margin:0;flex-wrap:wrap;"></div>
          <div class="notice info" style="margin-top:12px;">Matched: <b id="match-count">0</b> / ${SITUATIONS.length}</div>
        </div>

        <div class="glass card">
          <h4>🤔 Activity 2 · Constitutional Decision-Making</h4>
          <div id="scenario-list"></div>
        </div>

        <div class="glass card">
          <h4>📖 Activity 3 · Article Explorer (by theme)</h4>
          <div id="article-explorer"></div>
        </div>

        <div class="glass card">
          <h4>🕰️ Activity 4 · Timeline of Constitutional Development</h4>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${TIMELINE.map(t=>`<div style="display:flex;gap:12px;align-items:flex-start;">
              <div class="badge blue" style="flex-shrink:0;min-width:78px;text-align:center;">${t.year}</div>
              <p style="font-size:13.5px;color:var(--text-secondary);">${t.event}</p>
            </div>`).join('')}
          </div>
        </div>
      `;
      renderMatching();
      renderScenarios();
      renderExplorer();
    }

    function renderMatching(){
      const sitWrap = panel.querySelector('#match-situations');
      let selectedSituation = null;
      sitWrap.innerHTML = SITUATIONS.map(s=>`<button class="btn-sm" data-sit="${s.id}" style="text-align:left;padding:12px;${st.matched[s.id]?'opacity:.5;pointer-events:none;':''}">
        ${st.matched[s.id]?'✅ ':''}${s.text}${st.matched[s.id]?` → <b>${st.matched[s.id]}</b>`:''}</button>`).join('');
      const rightWrap = panel.querySelector('#match-rights');
      rightWrap.innerHTML = RIGHT_OPTIONS.map(r=>`<button class="chip" data-right="${r}">${r}</button>`).join('');

      sitWrap.querySelectorAll('[data-sit]').forEach(b=> b.addEventListener('click', ()=>{
        sitWrap.querySelectorAll('[data-sit]').forEach(x=>x.style.outline='');
        selectedSituation = b.dataset.sit;
        b.style.outline = '2px solid var(--primary-blue)';
      }));
      rightWrap.querySelectorAll('[data-right]').forEach(b=> b.addEventListener('click', ()=>{
        if(!selectedSituation){ h.toast('Select a situation first','👆'); return; }
        const s = SITUATIONS.find(x=>x.id===selectedSituation);
        if(st.matched[s.id]) return;
        const correct = s.right === b.dataset.right;
        st.matched[s.id] = b.dataset.right;
        if(correct){ st.matchScore++; h.toast('Correct match!','✅'); }
        else h.toast(`Not quite — that situation involves the ${s.right}`,'❌');
        selectedSituation = null;
        panel.querySelector('#match-count').textContent = Object.keys(st.matched).length;
        renderMatching();
        if(Object.keys(st.matched).length===SITUATIONS.length){
          h.setProgress(60);
          h.toast(`Matching complete: ${st.matchScore}/${SITUATIONS.length} correct`,'🎉');
        }
      }));
    }

    function renderScenarios(){
      const wrap = panel.querySelector('#scenario-list');
      wrap.innerHTML = SCENARIOS.map((sc,i)=>`
        <div class="card glass" style="padding:14px;margin-bottom:10px;">
          <p style="margin-bottom:10px;font-weight:700;font-size:13.5px;">${i+1}. ${sc.q}</p>
          <div style="display:grid;gap:8px;">
            ${sc.options.map(o=>`<button class="quiz-opt" data-scenario="${i}" data-opt="${o}">${o}</button>`).join('')}
          </div>
          <div class="quiz-explain" id="sc-explain-${i}" style="display:none;"></div>
        </div>
      `).join('');
      wrap.querySelectorAll('[data-scenario]').forEach(btn=> btn.addEventListener('click', ()=>{
        const i = btn.dataset.scenario;
        if(st.scenarioAnswers[i]) return;
        st.scenarioAnswers[i] = btn.dataset.opt;
        const sc = SCENARIOS[i];
        const correct = btn.dataset.opt === sc.answer;
        const group = btn.parentElement;
        [...group.children].forEach(b=>{
          b.disabled = true;
          if(b.dataset.opt===sc.answer) b.classList.add('correct');
          else if(b===btn) b.classList.add('wrong');
        });
        const ex = document.getElementById('sc-explain-'+i);
        ex.style.display='block';
        ex.innerHTML = (correct?'✅ ':'❌ ') + sc.explain;
        h.setProgress(75);
      }));
    }

    function renderExplorer(){
      const wrap = panel.querySelector('#article-explorer');
      wrap.innerHTML = VPSL_DATA.constitution.slice(0,6).map((c,i)=>`
        <div class="accordion-item" data-idx="${i}" style="border:1px solid var(--surface-border);border-radius:12px;margin-bottom:8px;">
          <div class="accordion-head">${c.title}<span class="chev">▾</span></div>
          <div class="accordion-body"><p>${c.body}</p></div>
        </div>`).join('');
      wrap.querySelectorAll('.accordion-item').forEach(item=>{
        item.querySelector('.accordion-head').addEventListener('click', ()=> item.classList.toggle('open'));
      });
    }

    render();
    h.setProgress(40);
  }

  vpslRegister({
    sim, category:'Constitutional Studies', meta, quiz,
    summary:'You matched real-world situations to the Fundamental Rights they involve, worked through constitutional decision-making dilemmas, explored key articles by theme, and reviewed a timeline of constitutional development.',
    simulate,
  });
})();
