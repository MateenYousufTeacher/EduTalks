Lab.registerSim({
  id:'local', order:8, title:'Local Government',
  shortDesc:'Solve everyday community problems as a local body.',
  keywords:['panchayat','municipality','gram sabha','local self-government'],
  objective:'Serve as an elected Panchayat member responding to a real community infrastructure problem.',
  stages:[
    {
      title:'A Water Supply Problem',
      text:'Residents of your Panchayat report the community hand pump has been broken for two weeks, forcing long walks for water — especially hard on women and children. What is your first step?',
      choices:[
        {label:'Call an emergency Gram Sabha meeting to confirm the problem\'s scale and prioritise it with residents.', outcome:'good',
          feedback:'Involving the community directly ensures the response reflects real needs and builds shared ownership of the solution.'},
        {label:'Fix it personally without informing the Panchayat or using proper local funds.', outcome:'mixed',
          feedback:'Quick personal action may help short-term, but bypassing formal Panchayat processes reduces transparency and accountability for public resources.'},
        {label:'Wait for the State government to notice and fix it, since it is "not really a local matter".', outcome:'poor',
          feedback:'Local infrastructure like village water supply is a core Panchayat responsibility — deferring entirely to the State ignores local government\'s constitutional role.'}
      ],
      concept:'The 73rd Constitutional Amendment gives Panchayats responsibility over local matters like water supply, precisely so problems can be addressed close to where people live.'
    },
    {
      title:'Allocating Limited Funds',
      text:'The Panchayat has a small annual budget. Repairing the hand pump competes with a request to repave a muddy access road. Both matter to different groups of residents. How do you decide?',
      choices:[
        {label:'Bring both proposals to the Gram Sabha, discuss trade-offs openly, and let residents help prioritise based on urgency and impact.', outcome:'good',
          feedback:'Transparent prioritisation, with community input on urgent needs like water access, reflects participatory local governance in action.'},
        {label:'Fund whichever project benefits your own neighbourhood first.', outcome:'poor',
          feedback:'Using public office to favour a narrow group over community-wide need is a misuse of local government authority.'},
        {label:'Delay both decisions indefinitely to avoid upsetting anyone.', outcome:'mixed',
          feedback:'Avoiding a decision leaves urgent problems like the water supply unresolved, failing the community that elected you.'}
      ],
      concept:'Local government works best when budget decisions are made transparently and with community participation, especially when resources are limited and needs compete.'
    },
    {
      title:'Reporting Back',
      text:'The hand pump is repaired using Panchayat funds. What should happen next to maintain good local governance?',
      choices:[
        {label:'Report the expenditure and outcome publicly at the next Gram Sabha meeting.', outcome:'good',
          feedback:'Public reporting of how funds were used keeps the Panchayat accountable to the residents who elected it — a cornerstone of local self-government.'},
        {label:'Keep the spending details private to avoid questions.', outcome:'poor',
          feedback:'Hiding public spending details undermines the transparency essential to community trust in local government.'},
        {label:'Announce it only to close allies rather than the whole community.', outcome:'poor',
          feedback:'Selectively sharing information excludes most residents from oversight of decisions made in their name.'}
      ],
      concept:'Local self-government is only meaningful with regular, public accountability — reporting back to the Gram Sabha closes the loop between decisions and the community they affect.'
    }
  ],
  quiz:[
    {level:'easy', q:'What is a Panchayat?', options:['A national parliament','A rural local self-government body','A type of court','A political party'], correct:1,
      explain:'A Panchayat is a body of rural local self-government, part of the three-tier Panchayati Raj system.'},
    {level:'medium', q:'Which constitutional amendment strengthened rural local self-government (Panchayati Raj)?', options:['42nd Amendment','44th Amendment','73rd Amendment','101st Amendment'], correct:2,
      explain:'The 73rd Constitutional Amendment (1992) gave constitutional status and strengthened powers to the Panchayati Raj system.'},
    {level:'medium', q:'Why is local government valuable for issues like community water supply?', options:['It has no particular advantage','It brings decision-making close to the people directly affected','Local bodies have unlimited power','It removes all need for State involvement'], correct:1,
      explain:'Local self-government allows problems to be identified and addressed by those closest to and most affected by them.'},
    {level:'hard', q:'Why is public reporting of Panchayat spending important?', options:['It is not really necessary','It keeps the Panchayat accountable to the community it serves','It only matters for very large budgets','It is optional under the law'], correct:1,
      explain:'Transparent reporting lets residents verify how public funds were used, reinforcing accountability in local self-government.'},
    {level:'medium', q:'What strengthened urban local self-government (Municipalities)?', options:['73rd Amendment','74th Amendment','42nd Amendment','1st Amendment'], correct:1,
      explain:'The 74th Constitutional Amendment (1992) strengthened Municipalities as urban local self-government bodies.'},
    {level:'hard', q:'Why is funding a project mainly because it benefits your own neighbourhood a problem?', options:['It is efficient governance','It misuses public office to favour a narrow group over community-wide need','It is legally required','It has no real downside'], correct:1,
      explain:'Local representatives hold public trust to serve the whole community fairly, not to favour personal or narrow interests.'}
  ]
});
