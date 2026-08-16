/* Constitution of India Interactive Studio */
SimModules.constitution = {
  artifactIds:['constitution-pen'],
  mount(stageEl, sideStatsEl, controlsEl, api){
    const S = SimUtils;
    const COMMITTEES = [
      {name:'Drafting Committee', chair:'Dr. B. R. Ambedkar', role:'Responsible for preparing the detailed text of the Constitution.'},
      {name:'Union Powers Committee', chair:'Jawaharlal Nehru', role:'Defined the powers of the central government.'},
      {name:'Provincial Constitution Committee', chair:'Sardar Vallabhbhai Patel', role:'Shaped the structure of state (provincial) governments.'},
      {name:'Fundamental Rights Sub-Committee', chair:'J. B. Kripalani', role:'Drafted the fundamental rights guaranteed to citizens.'},
    ];
    const CHOICES = {
      rights: { label:'Fundamental Rights Scope', options:[
        {label:'Broad individual rights with strong judicial enforcement', v:{liberty:22,equality:10,unity:2,welfare:4}},
        {label:'Balanced rights, subject to reasonable state restrictions', v:{liberty:12,equality:12,unity:8,welfare:8}},
        {label:'Narrow rights, prioritising state authority', v:{liberty:2,equality:4,unity:16,welfare:6}},
      ]},
      directive: { label:'Directive Principles Emphasis', options:[
        {label:'Strong welfare-state directives (economic & social)', v:{liberty:2,equality:14,unity:6,welfare:22}},
        {label:'Moderate guidance, non-binding on courts', v:{liberty:8,equality:8,unity:8,welfare:12}},
        {label:'Minimal directive principles', v:{liberty:10,equality:2,unity:6,welfare:2}},
      ]},
      federal: { label:'Federal Structure Strength', options:[
        {label:'Strong central government with unified authority', v:{liberty:4,equality:8,unity:22,welfare:8}},
        {label:'Balanced federal-state power sharing', v:{liberty:10,equality:10,unity:12,welfare:10}},
        {label:'Strong state autonomy, limited centre', v:{liberty:14,equality:4,unity:4,welfare:6}},
      ]},
    };
    let picks = { rights:0, directive:1, federal:1 };
    let adopted = false;

    stageEl.innerHTML = `
      <p class="muted">Explore the Constituent Assembly\u2019s committees, then choose provisions to shape India\u2019s governance profile.</p>
      <div class="flex col gap8" id="committeeList"></div>
      <hr class="hairline">
      <div id="choiceHost"></div>
      <div class="mt16"><button class="btn btn-primary" id="adoptBtn">Adopt Constitution</button></div>
      <p class="muted mt8" id="adoptResult"></p>
    `;

    stageEl.querySelector('#committeeList').innerHTML = COMMITTEES.map(c=>`
      <div class="tl-node" style="cursor:default"><b>${c.name}</b>Chaired by ${c.chair} — ${c.role}</div>`).join('');

    const choiceHost = stageEl.querySelector('#choiceHost');
    Object.entries(CHOICES).forEach(([key,c])=>{
      const block = S.el('div','field');
      block.innerHTML = `<label>${c.label}</label>`;
      const row = S.el('div','flex col gap8');
      c.options.forEach((opt,i)=>{
        const b = S.el('button','chip'+(picks[key]===i?' active':''), opt.label);
        b.style.textAlign='left';
        b.addEventListener('click', ()=>{
          picks[key]=i;
          row.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          evaluate();
        });
        row.appendChild(b);
      });
      block.appendChild(row);
      choiceHost.appendChild(block);
    });

    function evaluate(){
      const totals = {liberty:0,equality:0,unity:0,welfare:0};
      Object.entries(CHOICES).forEach(([key,c])=>{
        const v = c.options[picks[key]].v;
        Object.keys(totals).forEach(k=> totals[k]+=v[k]);
      });
      Object.keys(totals).forEach(k=> totals[k] = S.clamp(totals[k]*1.6,0,100));
      api.renderStats([
        {label:'Liberty', value:totals.liberty, kind:'good'},
        {label:'Equality', value:totals.equality, kind:'info'},
        {label:'National Unity', value:totals.unity, kind:'gold'},
        {label:'Social Welfare', value:totals.welfare, kind: totals.welfare<25?'warn':'good'},
      ]);
      return totals;
    }

    stageEl.querySelector('#adoptBtn').addEventListener('click', ()=>{
      const t = evaluate();
      adopted = true;
      const strongest = Object.entries(t).sort((a,b)=>b[1]-a[1])[0][0];
      const labels = {liberty:'individual liberty', equality:'social equality', unity:'national unity', welfare:'social welfare'};
      stageEl.querySelector('#adoptResult').innerHTML = `Your Constitution has been adopted. Its governance profile most strongly emphasises <b style="color:var(--accent)">${labels[strongest]}</b> — reflecting the real Constituent Assembly\u2019s task of balancing multiple, sometimes competing, priorities for a vast and diverse nation.`;
      api.toast('Constitution adopted');
    });

    api.renderControls([]);
    api.onReset(()=>{ picks = { rights:0, directive:1, federal:1 };
      choiceHost.querySelectorAll('.field').forEach((block,idx)=>{
        const key = Object.keys(CHOICES)[idx];
        block.querySelectorAll('.chip').forEach((c,i)=>c.classList.toggle('active', i===picks[key]));
      });
      stageEl.querySelector('#adoptResult').textContent='';
      evaluate();
    });
    evaluate();
  },
  quiz:[
    {q:'Who chaired the Drafting Committee of the Indian Constitution?', options:['Jawaharlal Nehru', 'Dr. B. R. Ambedkar', 'Sardar Vallabhbhai Patel', 'Mahatma Gandhi'], correct:1, explain:'Dr. B. R. Ambedkar chaired the Drafting Committee.'},
    {q:'When did the Constitution of India come into effect?', options:['15 August 1947', '26 January 1950', '26 November 1949', '1 January 1950'], correct:1, explain:'The Constitution came into effect on 26 January 1950, now celebrated as Republic Day.'},
    {q:'Did all Constituent Assembly members agree on every provision without debate?', options:['Yes, unanimously and instantly', 'No, contentious issues were extensively debated', 'The Assembly never met', 'Only one person wrote the Constitution alone'], correct:1, explain:'The Assembly debated contentious issues extensively over nearly three years before reaching consensus.'},
    {q:'What are Directive Principles of State Policy generally intended to do?', options:['Bind courts as enforceable rights', 'Guide the state toward social and economic welfare goals', 'Replace Fundamental Rights entirely', 'Regulate only foreign policy'], correct:1, explain:'Directive Principles guide state policy toward welfare goals, distinct from enforceable Fundamental Rights.'},
    {q:'In this simulation, what does choosing a stronger federal centre tend to increase?', options:['Liberty only', 'National unity', 'Nothing measurable', 'Only social welfare'], correct:1, explain:'A stronger central structure is modelled here as boosting national unity, often at some cost to state autonomy.'},
  ]
};
