Lab.registerSim({
  id:'democracy', order:1, title:'Democracy',
  shortDesc:'Experience collective decision-making and majority rule.',
  keywords:['vote','majority','participation','citizen'],
  objective:'Guide a village council through a real decision and see how participation, majority rule, and minority rights work together.',
  stages:[
    {
      title:'A Village Faces a Choice',
      text:'Sonmarg village has one open plot of land and a limited budget. Some residents want a community health sub-centre; others want a new road link to the market. As facilitator, how should the village decide?',
      choices:[
        {label:'Hold an open Gram Sabha meeting where every adult resident can speak and vote.', outcome:'good',
          feedback:'The Gram Sabha lets every voice be heard before a decision is made. Turnout is high, and the process feels legitimate even to those who lose the vote.'},
        {label:'Let the village head decide alone, since it will be faster.', outcome:'poor',
          feedback:'The decision is quick, but many residents feel excluded. Without participation, trust in the outcome — and in local government — weakens.'},
        {label:'Only consult the wealthier landowners, since they pay more local tax.', outcome:'poor',
          feedback:'This excludes the majority of residents from a decision that affects everyone, undermining the basic democratic principle of political equality.'}
      ],
      concept:'Democracy is more than voting — it requires open participation, where those affected by a decision have a genuine chance to be heard before it is made.'
    },
    {
      title:'The Vote is Split',
      text:'At the Gram Sabha, 55% vote for the health sub-centre and 45% for the road. The road supporters argue their needs are being ignored entirely. What should the council do?',
      choices:[
        {label:'Approve the health sub-centre now, but commit publicly to raising road funding next year.', outcome:'good',
          feedback:'The majority decision is respected, but the minority is not abandoned — their concern is formally acknowledged and scheduled, protecting long-term trust.'},
        {label:'Approve the health sub-centre and dismiss the road group\'s concerns as irrelevant.', outcome:'mixed',
          feedback:'The majority decision stands, but ignoring the minority\'s concerns risks resentment and disengagement from future civic processes.'},
        {label:'Cancel the vote and start over until the road group can also "win".', outcome:'poor',
          feedback:'Repeating votes until one side gets its way defeats the purpose of a fair decision process and can be used to override legitimate majority outcomes.'}
      ],
      concept:'Majority rule decides outcomes, but healthy democracies also protect minority interests — the losing side today should not be permanently shut out of tomorrow\'s decisions.'
    },
    {
      title:'Six Months Later',
      text:'The health sub-centre is built, but there are complaints it opened later than promised and cost more than budgeted. What is the most democratic way to respond?',
      choices:[
        {label:'Hold a public review meeting, publish the accounts, and let residents question the council.', outcome:'good',
          feedback:'Transparency and accountability let residents evaluate their representatives directly, reinforcing trust and giving feedback for future decisions.'},
        {label:'Quietly fix the issues without telling anyone, to avoid criticism.', outcome:'mixed',
          feedback:'The problem may get fixed, but hiding it from residents denies them the information needed to hold their representatives accountable.'},
        {label:'Blame the contractor publicly and take no responsibility as a council.', outcome:'poor',
          feedback:'Avoiding responsibility undermines accountability — a core democratic principle that keeps power holders answerable to the people they serve.'}
      ],
      concept:'Accountability means representatives must explain and answer for decisions after they are made — democracy does not end on election or voting day.'
    }
  ],
  quiz:[
    {level:'easy', q:'In a democracy, who ultimately holds political power?', options:['The people','The army','A single ruling family','Foreign governments'], correct:0,
      explain:'Democracy means "rule by the people" — power ultimately rests with citizens, exercised directly or through elected representatives.'},
    {level:'medium', q:'What best describes "majority rule with minority rights"?', options:['The majority always ignores the minority','Decisions follow the majority, but minority interests are still respected','Minorities always get their way','Only unanimous decisions are valid'], correct:1,
      explain:'Healthy democracies let the majority decide outcomes while ensuring minority voices and interests are not permanently excluded.'},
    {level:'medium', q:'Why is a Gram Sabha (village assembly) considered democratic?', options:['It lets one official decide for everyone','It allows every eligible resident to participate and vote','It only meets once a decade','It excludes women and youth'], correct:1,
      explain:'Open participation by all eligible residents is a core feature of grassroots democracy.'},
    {level:'hard', q:'Which of these MOST undermines democratic accountability?', options:['Publishing government accounts publicly','Holding a public review meeting','Hiding budget overruns from citizens','Allowing citizens to question representatives'], correct:2,
      explain:'Concealing information from citizens prevents them from evaluating and holding their representatives accountable.'},
    {level:'medium', q:'What is the main risk of letting only wealthy residents make village decisions?', options:['Decisions would be made too quickly','It violates the principle of political equality','It would cost more money','It has no real risk'], correct:1,
      explain:'Democracy is built on political equality — every citizen\'s voice should count, regardless of wealth or status.'},
    {level:'hard', q:'A council keeps re-voting until its preferred side wins. This is a problem because it:', options:['Speeds up governance','Respects the will of the people','Undermines the legitimacy of the democratic process','Is required by law'], correct:2,
      explain:'Manipulating a decision process until a desired outcome occurs defeats the fairness that gives democratic decisions their legitimacy.'}
  ]
});
