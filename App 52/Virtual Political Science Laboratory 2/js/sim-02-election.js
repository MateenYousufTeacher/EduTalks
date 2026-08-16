Lab.registerSim({
  id:'election', order:2, title:'Election',
  shortDesc:'Run and experience a fair electoral process.',
  keywords:['vote','candidate','campaign','ballot','constituency'],
  objective:'Manage a constituency election from candidate nomination to counting, and see how votes translate into representation.',
  stages:[
    {
      title:'Nomination Day',
      text:'Three candidates wish to contest the local assembly seat. One candidate\'s papers show they do not meet the minimum age and residency requirements. As the returning officer, what do you do?',
      choices:[
        {label:'Reject the ineligible candidate\'s nomination, citing the specific rule violated, and allow an appeal.', outcome:'good',
          feedback:'Applying eligibility rules consistently, with reasons and a right to appeal, keeps the process fair and transparent.'},
        {label:'Allow the candidate to contest anyway since they are locally popular.', outcome:'poor',
          feedback:'Ignoring eligibility rules for popularity undermines the neutrality of the election process and the rule of law.'},
        {label:'Accept a bribe to overlook the issue.', outcome:'poor',
          feedback:'This is electoral corruption — it destroys public trust and violates the basic fairness elections depend on.'}
      ],
      concept:'A free and fair election starts with a neutral, rule-bound nomination process — every candidate must meet the same legal requirements.'
    },
    {
      title:'The Campaign',
      text:'During campaigning, one candidate\'s supporters begin spreading false rumours about a rival and distributing cash to voters. What is the appropriate response?',
      choices:[
        {label:'Report the violations to the Election Commission for investigation and enforcement of the model code of conduct.', outcome:'good',
          feedback:'Independent oversight bodies exist precisely to detect and act on bribery and disinformation, protecting the integrity of the vote.'},
        {label:'Ignore it — campaigns are naturally competitive and "anything goes".', outcome:'poor',
          feedback:'Bribery and disinformation are not normal competition — they corrupt voters\' ability to make a free, informed choice.'},
        {label:'Publicly counter-campaign against the rule-breaking candidate yourself, using official resources.', outcome:'mixed',
          feedback:'Well-intentioned, but an election official using their position to campaign against a candidate compromises neutrality — reporting to the Commission is the proper channel.'}
      ],
      concept:'Free and fair elections require both freedom of choice and protection from manipulation — bribery and disinformation undermine genuine voter consent.'
    },
    {
      title:'Counting Day',
      text:'The count is very close. A losing candidate requests a recount, alleging some ballots were miscounted. What should happen?',
      choices:[
        {label:'Conduct a transparent recount observed by all candidates\' agents, following official procedure.', outcome:'good',
          feedback:'A transparent, rule-based recount resolves disputes credibly and preserves trust in the result, whoever wins.'},
        {label:'Declare the original result final immediately and refuse any review.', outcome:'mixed',
          feedback:'Refusing any review of a close, disputed count can leave legitimate doubts unresolved, even if the original count was accurate.'},
        {label:'Let only the winning candidate\'s agents supervise the recount.', outcome:'poor',
          feedback:'A recount supervised by only one side is not credible — all parties must be able to observe the process for it to be trusted.'}
      ],
      concept:'Elections must be verifiable, not just held — transparent counting and dispute procedures are what make citizens trust the declared result.'
    }
  ],
  quiz:[
    {level:'easy', q:'What is the main purpose of an election?', options:['To entertain the public','To let citizens choose their representatives','To raise government revenue','To select judges'], correct:1,
      explain:'Elections are the mechanism through which citizens select the representatives who will govern on their behalf.'},
    {level:'medium', q:'Who is responsible for ensuring elections are conducted fairly and independently?', options:['The winning political party','The Election Commission','The candidates themselves','Private companies'], correct:1,
      explain:'An independent Election Commission oversees the electoral process to keep it free, fair, and impartial.'},
    {level:'medium', q:'Why is bribing voters considered a serious problem?', options:['It is expensive for candidates','It corrupts free and informed voter choice','It is only illegal in some countries','It has no real effect on results'], correct:1,
      explain:'Bribery replaces genuine, informed voter consent with a transaction, undermining the legitimacy of the result.'},
    {level:'hard', q:'Why should recounts be observed by agents of all contesting candidates?', options:['To slow down the process','To ensure transparency and build trust in the result','It is not actually necessary','To let one side control the outcome'], correct:1,
      explain:'Multi-party observation of counting ensures no single side can manipulate the outcome, making the process verifiable and trustworthy.'},
    {level:'medium', q:'What should a returning officer do if a candidate does not meet eligibility rules?', options:['Accept them if they are popular','Reject the nomination with clear reasons, allowing appeal', 'Accept a payment to ignore it','Delay the decision indefinitely'], correct:1,
      explain:'Eligibility rules must be applied neutrally and transparently, with an avenue for appeal — not decided by popularity or payment.'},
    {level:'hard', q:'An election official personally campaigns against a rule-breaking candidate using official resources. Why is this problematic, even with good intentions?', options:['It is efficient','It compromises the neutrality officials must maintain','It is required by law','It has no downside'], correct:1,
      explain:'Election officials must remain neutral; using their position to campaign — even against wrongdoing — undermines public trust in impartial administration.'}
  ]
});
