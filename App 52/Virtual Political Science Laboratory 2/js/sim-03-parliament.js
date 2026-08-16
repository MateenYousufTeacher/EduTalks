Lab.registerSim({
  id:'parliament', order:3, title:'Parliament',
  shortDesc:'Debate, deliberate, and vote inside a legislature.',
  keywords:['legislature','debate','opposition','majority','lok sabha','rajya sabha'],
  objective:'Sit as a Member of Parliament through debate, committee scrutiny, and voting on a proposed law.',
  stages:[
    {
      title:'A Bill is Introduced',
      text:'The government introduces a bill to regulate online food delivery platforms. The opposition wants more time to study its impact on small vendors before debating it. As Speaker, how do you proceed?',
      choices:[
        {label:'Allow the scheduled debate to begin, but refer the bill to a select committee for detailed examination first.', outcome:'good',
          feedback:'Committee scrutiny lets experts and affected groups examine details before floor debate, improving the quality of legislation without blocking progress.'},
        {label:'Force an immediate vote to save time, without full debate.', outcome:'poor',
          feedback:'Skipping debate and scrutiny risks passing a poorly examined law and undermines Parliament\'s core deliberative function.'},
        {label:'Postpone the bill indefinitely with no timeline.', outcome:'mixed',
          feedback:'Caution is reasonable, but an open-ended delay avoids the legislature\'s responsibility to actually decide the matter.'}
      ],
      concept:'Parliament\'s core role is deliberation — examining proposals carefully, often through committees, before enacting them into law.'
    },
    {
      title:'The Debate Floor',
      text:'During debate, opposition members raise strong objections about the bill\'s impact on small vendors, while government members defend its consumer-protection benefits. Tempers rise. What should happen?',
      choices:[
        {label:'Let both sides present full arguments and evidence, keeping order in the House.', outcome:'good',
          feedback:'Robust, orderly debate lets differing viewpoints be tested, improving the final decision even amid disagreement.'},
        {label:'Shut down opposition speeches to move faster.', outcome:'poor',
          feedback:'Suppressing opposition voices undermines the legislature\'s role of scrutinising government proposals on behalf of all citizens.'},
        {label:'Suspend the sitting rather than manage the disorder.', outcome:'mixed',
          feedback:'Sometimes necessary for order, but frequent suspensions prevent the House from doing its deliberative work.'}
      ],
      concept:'An effective opposition is not an obstacle to democracy — scrutiny and challenge from opposing benches help expose weaknesses in proposed laws.'
    },
    {
      title:'The Vote',
      text:'After debate and committee changes, the amended bill comes up for a final vote. The government holds a majority, but several of its own members have concerns. What is the democratic path forward?',
      choices:[
        {label:'Hold a free vote where all members, including from the ruling party, vote according to their judgment on the record.', outcome:'good',
          feedback:'Recorded voting lets every member be held accountable to their constituents for how they voted on the final law.'},
        {label:'Pressure dissenting government members to vote along party lines regardless of their concerns.', outcome:'mixed',
          feedback:'Party discipline is common in parliamentary systems, but excessive pressure can suppress legitimate concerns raised during scrutiny.'},
        {label:'Skip the vote and let the Prime Minister decide the bill\'s fate alone.', outcome:'poor',
          feedback:'This bypasses the legislature entirely — laws must be enacted by the elected body representing the people, not by executive decree.'}
      ],
      concept:'Parliament is a representative institution — final decisions on laws must go through recorded votes by elected members, not executive fiat.'
    }
  ],
  quiz:[
    {level:'easy', q:'What is the main function of Parliament?', options:['To implement laws','To make and debate laws','To decide court cases','To manage foreign embassies'], correct:1,
      explain:'Parliament is the legislative branch, responsible for debating and enacting laws.'},
    {level:'medium', q:'Why does a bill often go to a select committee before final debate?', options:['To delay it forever','For detailed, expert scrutiny before the full House decides','Because it is a legal requirement for every single bill','To avoid public awareness'], correct:1,
      explain:'Committees allow focused, detailed examination of proposals — including expert and stakeholder input — before the full House debates and votes.'},
    {level:'medium', q:'What role does the opposition play in Parliament?', options:['It has no formal role','It scrutinises and challenges government proposals','It automatically blocks all bills','It only exists to slow proceedings'], correct:1,
      explain:'A functioning opposition holds the government to account and tests its proposals through debate and criticism.'},
    {level:'hard', q:'Why is a recorded vote on a bill important for accountability?', options:['It has no real purpose','It lets citizens see how their representative voted','It is required only for opposition parties','It slows down the legislature unnecessarily'], correct:1,
      explain:'A recorded vote creates a public record connecting each representative to their decision, which voters can consider at the next election.'},
    {level:'medium', q:'Most legislatures like India\'s Parliament are described as "bicameral" because they have:', options:['One house','Two houses','Three houses','No fixed structure'], correct:1,
      explain:'A bicameral legislature has two houses — for example, the Lok Sabha and Rajya Sabha — that each play a role in passing most laws.'},
    {level:'hard', q:'Why is it problematic for a Prime Minister to decide a bill\'s fate alone, bypassing a vote?', options:['It is faster and therefore better','It bypasses the elected legislature\'s constitutional role','There is no problem with this','It is how all democracies function'], correct:1,
      explain:'Laws must be enacted through the elected legislature\'s formal process — bypassing it undermines representative government and accountability.'}
  ]
});
