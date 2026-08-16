Lab.registerSim({
  id:'executive', order:4, title:'Executive',
  shortDesc:'Implement decisions as head of government administration.',
  keywords:['government','administration','minister','implementation','bureaucracy'],
  objective:'Act as a Chief Minister\'s office implementing a newly passed law, balancing speed, resources, and accountability.',
  stages:[
    {
      title:'A Law Needs Implementation',
      text:'The legislature has passed a law requiring free mid-day meals in all government schools within six months. As the executive, your department must make it happen. What is your first move?',
      choices:[
        {label:'Direct the administration to draft a detailed implementation plan with budget, timelines, and district-level responsibilities.', outcome:'good',
          feedback:'Turning a law into action requires careful administrative planning — the executive\'s core job is translating legislative intent into workable reality.'},
        {label:'Announce the scheme is "already working" in a press release before any real planning.', outcome:'poor',
          feedback:'Announcing success prematurely, without real implementation, misleads the public and can cause administrative confusion later.'},
        {label:'Wait for schools to figure out implementation on their own without central guidance.', outcome:'poor',
          feedback:'Without coordinated executive planning and resources, uneven and unreliable implementation across schools is likely.'}
      ],
      concept:'The executive\'s role is implementation — turning laws passed by the legislature into concrete administrative action through planning, budgeting, and coordination.'
    },
    {
      title:'A Budget Shortfall',
      text:'Midway through rollout, it becomes clear the allocated budget is insufficient to cover all districts. What should the executive do?',
      choices:[
        {label:'Reallocate funds transparently from lower-priority programs and report the change to the legislature.', outcome:'good',
          feedback:'Adjusting resources while keeping the legislature informed maintains both effective administration and democratic accountability.'},
        {label:'Quietly cut the meal quality in poorer districts without telling anyone.', outcome:'poor',
          feedback:'Hidden cuts that disproportionately affect disadvantaged areas undermine both the law\'s purpose and public trust in the executive.'},
        {label:'Halt the program entirely without explanation.', outcome:'mixed',
          feedback:'Stopping implementation avoids overspending, but abandoning a legally mandated program without explanation fails both the law and the public.'}
      ],
      concept:'Effective administration means adapting to real constraints while remaining accountable — the executive answers to the legislature and the public for how public funds are used.'
    },
    {
      title:'A Corruption Complaint',
      text:'Reports surface that a district officer is diverting meal supplies for personal profit. What is the appropriate executive response?',
      choices:[
        {label:'Order an independent inquiry and suspend the officer pending its outcome.', outcome:'good',
          feedback:'A fair, independent inquiry protects both accountability and due process — corruption must be addressed without pre-judging guilt unfairly.'},
        {label:'Ignore the complaint since the officer is otherwise "efficient".', outcome:'poor',
          feedback:'Ignoring corruption undermines the rule of law and erodes public trust in government administration.'},
        {label:'Publicly fire the officer immediately without any investigation.', outcome:'mixed',
          feedback:'Swift action may seem decisive, but skipping due process risks unfair outcomes and can be challenged legally.'}
      ],
      concept:'Executive accountability includes overseeing its own officials — administration must be both efficient and lawful, with fair processes for addressing wrongdoing.'
    }
  ],
  quiz:[
    {level:'easy', q:'What is the primary role of the executive branch of government?', options:['To make laws','To implement and administer laws and policies','To interpret the Constitution in court','To conduct elections'], correct:1,
      explain:'The executive — the Council of Ministers and administration — is responsible for implementing laws passed by the legislature.'},
    {level:'medium', q:'Why does implementing a new law usually require detailed planning?', options:['It is optional and rarely needed','Laws automatically implement themselves','Turning legal text into action requires budgets, timelines and coordination','Only courts handle implementation'], correct:2,
      explain:'Effective implementation requires administrative planning — budgets, timelines, and coordination across departments and regions.'},
    {level:'medium', q:'If the executive must reallocate a program\'s budget, what maintains democratic accountability?', options:['Doing it secretly','Informing the legislature transparently about the change','Cancelling all other programs','Ignoring the legislature entirely'], correct:1,
      explain:'Transparency with the legislature over budget decisions keeps the executive answerable for how public money is spent.'},
    {level:'hard', q:'Why is due process important even when addressing a clear case of official misconduct?', options:['It protects fairness and the rule of law','It has no real importance','It only slows things down for no benefit','It should be skipped for efficiency'], correct:0,
      explain:'Following fair investigative procedures — even in likely misconduct cases — upholds the rule of law and protects against unjust outcomes.'},
    {level:'medium', q:'What distinguishes the executive from the legislature?', options:['The executive makes laws; the legislature implements them','The executive implements laws; the legislature makes them','They have identical functions','The executive only exists in some countries'], correct:1,
      explain:'The legislature\'s role is to make laws; the executive\'s role is to implement and administer them.'},
    {level:'hard', q:'Why is announcing a scheme as "already working" before real implementation problematic?', options:['It is good communication practice','It misleads the public about actual government performance','It has no downside','It is required by law'], correct:1,
      explain:'Premature claims of success mislead citizens and undermine their ability to hold government accountable for real outcomes.'}
  ]
});
