Lab.registerSim({
  id:'judiciary', order:5, title:'Judiciary',
  shortDesc:'Weigh evidence and constitutional principle as a judge.',
  keywords:['court','judge','justice','rights','judicial review'],
  objective:'Sit as a judge hearing a constitutional case, applying legal reasoning and precedent rather than personal opinion.',
  stages:[
    {
      title:'A Case is Filed',
      text:'A state government passes a law banning a peaceful protest march on a public road, citing traffic concerns. Protesters challenge it, citing their fundamental right to peaceful assembly. As judge, how do you begin?',
      choices:[
        {label:'Examine both the fundamental right claimed and the state\'s stated reason, checking if the restriction is reasonable and proportionate.', outcome:'good',
          feedback:'Judicial reasoning weighs the right against the state\'s justification, testing whether any restriction is reasonable, proportionate, and lawfully imposed — not simply choosing a side.'},
        {label:'Rule immediately for the protesters because rights should never be restricted.', outcome:'mixed',
          feedback:'Most rights are not absolute — courts must still examine whether a specific, reasonable restriction is constitutionally valid, not assume rights always override everything.'},
        {label:'Rule immediately for the state because it cited "traffic concerns".', outcome:'poor',
          feedback:'Accepting a government justification without scrutiny ignores the judiciary\'s duty to independently test whether a rights restriction is actually justified.'}
      ],
      concept:'Judicial review means courts test whether laws and government actions are constitutional — including whether restrictions on rights are reasonable, not automatic in either direction.'
    },
    {
      title:'Weighing the Evidence',
      text:'The state shows evidence the specific route would block emergency vehicle access. The protesters offer an alternative route with similar visibility. What is the most judicially sound path?',
      choices:[
        {label:'Suggest resolving the case by permitting the march on the alternative route, satisfying both public safety and the right to assemble.', outcome:'good',
          feedback:'Where possible, judicial reasoning favours solutions that give effect to rights while addressing legitimate public concerns, rather than an all-or-nothing outcome.'},
        {label:'Ban all protest marches in the state going forward, based on this one case.', outcome:'poor',
          feedback:'Judgments should be based on the specific facts before the court — issuing a sweeping ban far beyond the case\'s facts oversteps judicial role and harms the right in general.'},
        {label:'Ignore the alternative route proposal and decide based on which side seems more sympathetic.', outcome:'poor',
          feedback:'Deciding based on sympathy rather than reasoned application of facts and law undermines the impartiality courts must maintain.'}
      ],
      concept:'Good judicial reasoning is fact-specific and seeks to reconcile competing legitimate interests where possible, rather than issuing broader rulings than the case requires.'
    },
    {
      title:'Writing the Judgment',
      text:'You have reached a decision. What should your written judgment include to be considered sound and legitimate?',
      choices:[
        {label:'A clear explanation of the facts, the legal principles applied, and the reasoning connecting them to the outcome.', outcome:'good',
          feedback:'A reasoned, transparent judgment lets the public, lawyers, and higher courts understand and evaluate the decision — this is central to judicial legitimacy.'},
        {label:'Just the final order, with no explanation of the reasoning.', outcome:'poor',
          feedback:'A judgment without reasoning cannot be properly reviewed or understood, weakening public confidence in judicial legitimacy.'},
        {label:'The judge\'s personal opinion about the protesters\' politics.', outcome:'poor',
          feedback:'Judgments must be grounded in law and facts, not personal political opinions — this is essential to judicial independence and impartiality.'}
      ],
      concept:'A reasoned, written judgment is what makes judicial decisions accountable and reviewable — it shows the public and higher courts exactly why a decision was reached.'
    }
  ],
  quiz:[
    {level:'easy', q:'What is the main role of the judiciary?', options:['To make laws','To interpret laws and resolve disputes','To implement government policy','To conduct elections'], correct:1,
      explain:'The judiciary\'s core role is interpreting laws and the Constitution, and resolving disputes, including disputes about rights.'},
    {level:'medium', q:'What is "judicial review"?', options:['A court reviewing its own past cases only','The power of courts to examine whether laws or actions are constitutional','A vote among judges on policy matters','A review conducted only by the executive'], correct:1,
      explain:'Judicial review is the power of courts to strike down laws or government actions that violate the Constitution.'},
    {level:'medium', q:'Why is it important for judges to explain their reasoning in writing?', options:['It is not actually necessary','It allows the decision to be understood, reviewed, and held accountable','It only matters for criminal cases','It slows down justice for no reason'], correct:1,
      explain:'Reasoned judgments allow parties, the public, and higher courts to understand and, if necessary, challenge a decision — a core feature of judicial accountability.'},
    {level:'hard', q:'Why shouldn\'t a court automatically rule for whichever side claims a "right" is involved?', options:['Rights are never real','Most rights are not absolute and must be weighed against reasonable, lawful restrictions','Courts should always favor the government','Rights only apply to some citizens'], correct:1,
      explain:'Courts must examine whether a specific restriction on a right is reasonable and proportionate, not assume rights automatically override every other concern.'},
    {level:'medium', q:'What does "judicial independence" mean?', options:['Judges can decide however they personally wish','Courts are free from control or pressure by the executive or legislature','Judges never have to explain decisions','Courts are part of the executive branch'], correct:1,
      explain:'Judicial independence protects courts from political pressure so they can decide cases impartially, based on law and facts.'},
    {level:'hard', q:'In the protest march case, why does suggesting an alternative route reflect sound judicial reasoning?', options:['It avoids the case entirely','It reconciles the right to assemble with a legitimate public safety concern','It favors the state without examining the facts','It ignores the protesters\' rights completely'], correct:1,
      explain:'Where possible, courts look for solutions that give real effect to constitutional rights while addressing legitimate, evidence-based concerns.'}
  ]
});
