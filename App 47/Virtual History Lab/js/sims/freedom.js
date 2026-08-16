/* Indian Freedom Movement Interactive Timeline */
SimModules.freedom = {
  artifactIds:['charkha'],
  mapSvg:`<svg viewBox="0 0 220 260"><rect width="220" height="260" fill="#1c1410"/>
    <circle cx="90" cy="70" r="7" fill="#D98E2B"/><text x="100" y="74" fill="#C9B79A" font-size="9">Bengal (Swadeshi)</text>
    <circle cx="70" cy="130" r="7" fill="#F3E9D2"/><text x="80" y="134" fill="#C9B79A" font-size="9">Gujarat (Salt March)</text>
    <circle cx="110" cy="190" r="7" fill="#3E5C3A"/><text x="120" y="194" fill="#C9B79A" font-size="9">Bombay (Quit India)</text></svg>`,
  mount(stageEl, sideStatsEl, controlsEl, api){
    const S = SimUtils;
    const MOVEMENTS = {
      swadeshi:{ label:'Swadeshi Movement (1905)', summary:'A boycott of British goods and promotion of Indian-made products, sparked by the partition of Bengal.',
        events:[
          {y:'1905', t:'Partition of Bengal announced', d:'The British partition of Bengal along religious lines provokes widespread protest.'},
          {y:'1905–08', t:'Boycott of British goods', d:'Indian-made (swadeshi) goods are promoted over imported British products.'},
          {y:'1911', t:'Partition reversed', d:'Sustained pressure contributes to the annulment of the Bengal partition.'},
        ],
        decision:{ q:'As an organiser, how do you sustain the boycott\u2019s momentum?', options:[
          {label:'Focus on economic self-reliance (local industry)', effect:'Builds long-term economic institutions, but slower visible impact.'},
          {label:'Focus on mass public demonstrations', effect:'Generates rapid visibility, but risks confrontation with authorities.'}
        ]}
      },
      noncoop:{ label:'Non-Cooperation Movement (1920–22)', summary:'A campaign of withdrawing cooperation from British institutions — schools, courts, titles and goods.',
        events:[
          {y:'1920', t:'Movement launched', d:'Calls to boycott British institutions, titles, and goods spread nationwide.'},
          {y:'1922', t:'Chauri Chaura incident', d:'Violence at Chauri Chaura leads to the movement being called off to preserve its non-violent principle.'},
        ],
        decision:{ q:'After Chauri Chaura, what should organisers prioritise?', options:[
          {label:'Suspend the movement to preserve non-violent discipline', effect:'Preserves the moral authority of non-violence, at the cost of momentum.'},
          {label:'Continue the movement despite the violence', effect:'Maintains momentum, but risks undermining the movement\u2019s non-violent identity.'}
        ]}
      },
      civildis:{ label:'Civil Disobedience Movement (1930–34)', summary:'Highlighted by the Salt March, a campaign of deliberate, non-violent law-breaking against unjust laws.',
        events:[
          {y:'1930', t:'Salt March begins', d:'A 240-mile march to the sea challenges the British salt tax through symbolic law-breaking.'},
          {y:'1930–31', t:'Nationwide civil disobedience', d:'Widespread non-violent defiance of British laws spreads across India.'},
          {y:'1931', t:'Gandhi–Irwin Pact', d:'Negotiations lead to a truce and the release of political prisoners.'},
        ],
        decision:{ q:'What made the Salt March an effective symbol?', options:[
          {label:'It targeted a tax affecting all Indians, rich and poor alike', effect:'Broadens participation across social classes.'},
          {label:'It targeted only the wealthiest merchants', effect:'Would have limited participation to a narrow group.'}
        ]}
      },
      quitindia:{ label:'Quit India Movement (1942)', summary:'A mass movement demanding immediate British withdrawal amid World War II.',
        events:[
          {y:'1942', t:'"Quit India" resolution passed', d:'Congress leaders call for immediate British withdrawal from India.'},
          {y:'1942', t:'Mass arrests and underground resistance', d:'Leaders are arrested; an underground movement of resistance continues.'},
          {y:'1945–47', t:'Path to independence', d:'Post-war negotiations accelerate toward eventual independence in 1947.'},
        ],
        decision:{ q:'With leaders arrested, how should the movement respond?', options:[
          {label:'Organise decentralised, underground local resistance', effect:'Sustains momentum despite leadership arrests, though harder to coordinate.'},
          {label:'Pause all activity until leaders are released', effect:'Preserves organisation, but risks losing momentum entirely.'}
        ]}
      },
    };
    let current = 'swadeshi';

    stageEl.innerHTML = `
      <p class="muted">Choose a movement to explore its timeline, then consider the strategic decision it posed.</p>
      <div id="moveHost"></div>
      <div class="panel mt16" style="padding:16px" id="moveBody"></div>
    `;
    S.buildPalette(stageEl.querySelector('#moveHost'),
      Object.entries(MOVEMENTS).map(([value,m])=>({value,label:m.label})),
      (v)=>{ current=v; render(); });

    function render(){
      const m = MOVEMENTS[current];
      const body = stageEl.querySelector('#moveBody');
      body.innerHTML = `<h4 style="color:var(--accent)">${m.label}</h4><p>${m.summary}</p>
        <div class="flex col gap8 mt8">
          ${m.events.map(e=>`<div class="tl-node" style="cursor:default"><b>${e.y}</b>${e.t}<div class="muted mt8" style="display:none" data-more>${e.d}</div></div>`).join('')}
        </div>
        <hr class="hairline">
        <h4 style="color:var(--accent)">Strategic Decision</h4>
        <p>${m.decision.q}</p>
        <div class="flex col gap8" id="decisionChoices">
          ${m.decision.options.map((o,i)=>`<button class="btn btn-secondary" data-i="${i}" style="text-align:left">${o.label}</button>`).join('')}
        </div>
        <p class="muted mt8" id="decisionResult"></p>`;
      body.querySelectorAll('.tl-node').forEach(n=>{
        n.addEventListener('click', ()=>{
          const more = n.querySelector('[data-more]');
          more.style.display = more.style.display==='none' ? 'block' : 'none';
        });
      });
      body.querySelectorAll('#decisionChoices button').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const o = m.decision.options[+btn.dataset.i];
          body.querySelector('#decisionResult').textContent = o.effect;
          api.toast('Decision recorded');
          bump();
        });
      });
      updateStats();
    }

    let explored = new Set();
    function bump(){ explored.add(current); updateStats(); }
    function updateStats(){
      api.renderStats([
        {label:'Movements Explored', value:(explored.size/4)*100, display:`${explored.size}/4`, kind:'gold'},
        {label:'Current Movement', value:100, display: MOVEMENTS[current].label.split('(')[0].trim(), kind:'info'},
      ]);
    }

    api.renderControls([]);
    api.onReset(()=>{ explored = new Set(); current='swadeshi'; render(); });
    render();
  },
  quiz:[
    {q:'What triggered the Swadeshi Movement of 1905?', options:['The Salt Tax', 'The partition of Bengal', 'World War II', 'The Quit India resolution'], correct:1, explain:'The 1905 partition of Bengal provoked the boycott and self-reliance campaigns of the Swadeshi Movement.'},
    {q:'Why was the Non-Cooperation Movement called off in 1922?', options:['It succeeded completely', 'The Chauri Chaura violence conflicted with its non-violent principle', 'The British granted independence', 'Leaders lost interest'], correct:1, explain:'Violence at Chauri Chaura led organisers to halt the movement to preserve its non-violent discipline.'},
    {q:'What law did the 1930 Salt March challenge?', options:['The Salt Tax', 'Income tax', 'Land revenue law', 'Voting rights law'], correct:0, explain:'The Salt March was a symbolic act of civil disobedience against the British salt tax.'},
    {q:'What did the Quit India Movement of 1942 demand?', options:['Higher wages', 'Immediate British withdrawal from India', 'A new constitution only', 'Continued British rule'], correct:1, explain:'Quit India called for immediate British withdrawal amid World War II.'},
    {q:'What does India\u2019s freedom movement demonstrate about achieving political change?', options:['A single strategy caused independence', 'It combined constitutional negotiation, mass movements and diverse regional efforts', 'Only violence was ever used', 'No coordination existed among movements'], correct:1, explain:'Independence resulted from a combination of strategies across decades, not one single approach.'},
  ]
};
