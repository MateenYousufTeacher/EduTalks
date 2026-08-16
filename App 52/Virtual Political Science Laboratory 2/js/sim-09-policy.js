Lab.registerSim({
  id:'policy', order:9, title:'Public Policy',
  shortDesc:'Weigh trade-offs and stakeholders to solve a public problem.',
  keywords:['policy','stakeholders','trade-off','implementation','evaluation'],
  objective:'Design a public policy response to a real problem, weighing stakeholder interests, trade-offs, and unintended consequences.',
  stages:[
    {
      title:'Identifying the Problem',
      text:'Your city faces a growing plastic waste crisis clogging drains and harming wildlife. Local shopkeepers rely on cheap plastic bags for their businesses. What is the right first step in policymaking?',
      choices:[
        {label:'Study the scale of the problem and consult shopkeepers, waste workers, and environmental groups before drafting options.', outcome:'good',
          feedback:'Good policymaking starts by understanding the problem\'s scope and listening to those it affects — this produces more workable, informed solutions.'},
        {label:'Ban all plastic bags immediately with no consultation or transition period.', outcome:'mixed',
          feedback:'A ban may address the environmental problem, but without consultation or transition time, it can seriously hurt small shopkeepers who depend on affordable packaging.'},
        {label:'Ignore the problem since it is not urgent enough to address now.', outcome:'poor',
          feedback:'Delaying action on a worsening public problem lets it grow larger and harder to solve, and fails the public interest the government exists to serve.'}
      ],
      concept:'Public policy begins with clearly defining the problem and understanding who is affected — the foundation for any effective, fair response.'
    },
    {
      title:'Choosing Between Options',
      text:'Three options emerge: (A) an outright ban, (B) a small tax on plastic bags to discourage use, (C) do nothing. Which reflects sound policy trade-off analysis?',
      choices:[
        {label:'Choose the tax (B), paired with support for shopkeepers to shift to affordable alternatives, and monitor its effect.', outcome:'good',
          feedback:'A tax changes behaviour gradually while easing the transition for affected businesses — a balanced response to competing interests.'},
        {label:'Choose the outright ban (A) with no support for affected shopkeepers.', outcome:'mixed',
          feedback:'This addresses the environmental problem directly, but ignoring the economic impact on shopkeepers creates a new hardship the policy should have anticipated.'},
        {label:'Choose to do nothing (C) because any policy will upset someone.', outcome:'poor',
          feedback:'Avoiding a decision because it involves trade-offs abandons the responsibility to address a real, worsening public problem.'}
      ],
      concept:'Public policy almost always involves trade-offs — a good policy weighs costs and benefits across different stakeholders rather than treating any single group\'s interest as absolute.'
    },
    {
      title:'Evaluating the Outcome',
      text:'Six months after the plastic tax was introduced, plastic use has dropped 30%, but reports show a new problem: cheap unregulated bags are being smuggled in from outside the city. What should policymakers do?',
      choices:[
        {label:'Investigate the smuggling issue, strengthen enforcement, and adjust the policy based on this evidence.', outcome:'good',
          feedback:'Evaluating real-world outcomes and adapting to unintended consequences is a hallmark of responsible, evidence-based policymaking.'},
        {label:'Declare the policy a complete success and ignore the new smuggling problem.', outcome:'mixed',
          feedback:'The 30% reduction is real progress, but ignoring a clear unintended consequence risks undermining the policy\'s long-term effectiveness.'},
        {label:'Scrap the entire policy immediately without addressing the smuggling issue directly.', outcome:'poor',
          feedback:'Abandoning a partly working policy, rather than fixing its specific new problem, throws away real progress unnecessarily.'}
      ],
      concept:'Policies can produce both intended and unintended consequences — ongoing evaluation lets government adapt rather than treating any policy as fixed and final.'
    }
  ],
  quiz:[
    {level:'easy', q:'What is public policy?', options:['A private business plan','A course of action government adopts to address a public problem','A court judgment','A political party manifesto only'], correct:1,
      explain:'Public policy is the course of action a government adopts, through laws, rules, or programs, to address a public problem.'},
    {level:'medium', q:'Why should policymakers consult stakeholders before choosing a course of action?', options:['It is not really useful','It helps identify real effects and produces more informed, workable solutions','It is only symbolic','It has no impact on policy quality'], correct:1,
      explain:'Consulting those affected by a policy — like shopkeepers and environmental groups — helps identify real-world effects and improves the policy\'s design.'},
    {level:'medium', q:'What does it mean to say public policy involves "trade-offs"?', options:['Every policy benefits everyone equally with no cost','Policies often benefit some groups while imposing costs on others','Trade-offs never occur in real policymaking','Governments should avoid all trade-offs'], correct:1,
      explain:'Most policy choices help some groups while creating costs or challenges for others — recognising this is central to sound policymaking.'},
    {level:'hard', q:'In the case study, what is an example of an "unintended consequence"?', options:['The 30% drop in plastic use','The smuggling of unregulated bags from outside the city','The initial policy consultation','The choice between three policy options'], correct:1,
      explain:'The smuggling problem was not the policy\'s goal but emerged as a side effect — a classic unintended consequence requiring evaluation and adaptation.'},
    {level:'medium', q:'Why is "doing nothing" often a poor policy response to a worsening public problem?', options:['It always saves the most money','It avoids the government\'s responsibility to address the public interest','It has no trade-offs at all','It is usually the best option'], correct:1,
      explain:'Ignoring a real, worsening problem abandons the government\'s responsibility to serve the public interest, and the problem typically grows worse.'},
    {level:'hard', q:'Why is ongoing evaluation important after a policy is implemented?', options:['It is not important once a policy is passed','It lets government identify unintended effects and adapt the policy','Policies never need to be reviewed','Evaluation only matters for failed policies'], correct:1,
      explain:'Evaluation reveals both successes and unintended consequences, allowing policymakers to adjust and improve a policy over time.'}
  ]
});
