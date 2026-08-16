Lab.registerSim({
  id:'constitution', order:6, title:'Constitution',
  shortDesc:'Balance rights, powers, and amendments as a constitutional body.',
  keywords:['fundamental rights','amendment','basic structure','directive principles'],
  objective:'Sit on a constitutional review body examining a proposed amendment against fundamental rights and the Constitution\'s basic structure.',
  stages:[
    {
      title:'A Proposed Amendment',
      text:'Parliament proposes a constitutional amendment allowing the government to suspend judicial review of certain economic laws "in the national interest." How should this be evaluated?',
      choices:[
        {label:'Examine whether the amendment threatens the Constitution\'s basic structure, since judicial review protects constitutional supremacy.', outcome:'good',
          feedback:'Judicial review is widely recognised as part of the Constitution\'s basic structure — courts have held that even a constitutional amendment cannot remove core features like this.'},
        {label:'Approve it automatically, since Parliament has the power to amend the Constitution.', outcome:'poor',
          feedback:'Parliament\'s amending power is real but not unlimited — it cannot destroy the Constitution\'s basic structure, including judicial review, even through a formal amendment.'},
        {label:'Reject it automatically, since all amendments are dangerous.', outcome:'mixed',
          feedback:'Not all amendments threaten the Constitution — each must be evaluated on its own merits rather than rejected purely on principle.'}
      ],
      concept:'The basic structure doctrine holds that certain foundational features of the Constitution — like judicial review, democracy, and federalism — cannot be abolished even by constitutional amendment.'
    },
    {
      title:'Rights vs. Directive Principles',
      text:'A state law promoting Directive Principles (equitable land distribution) appears to limit an individual\'s Fundamental Right to property in a specific case. How should this tension be approached?',
      choices:[
        {label:'Examine whether the law\'s limitation on the right is reasonable and proportionate to the stated public welfare goal.', outcome:'good',
          feedback:'Constitutional interpretation often requires balancing individual rights against legitimate social welfare goals — not treating either as automatically absolute.'},
        {label:'Always let Directive Principles override Fundamental Rights without examination.', outcome:'poor',
          feedback:'While Directive Principles matter greatly, they aren\'t automatically superior to Fundamental Rights — the balance must be reasoned, not assumed.'},
        {label:'Always let Fundamental Rights override Directive Principles without examination.', outcome:'mixed',
          feedback:'Fundamental Rights are enforceable and important, but ignoring the social welfare purpose behind Directive Principles misses part of the constitutional design.'}
      ],
      concept:'Fundamental Rights and Directive Principles are meant to work together — courts aim to harmonise individual liberty with the state\'s duty to pursue social and economic welfare.'
    },
    {
      title:'Explaining the Decision',
      text:'Your body has reached a decision on the amendment. How should it be communicated to the public?',
      choices:[
        {label:'Publish a clear, reasoned explanation of which constitutional principles were applied and why.', outcome:'good',
          feedback:'Transparent constitutional reasoning helps citizens understand how the Constitution constrains and enables government power — supporting constitutional literacy.'},
        {label:'Announce only the outcome, with no explanation.', outcome:'poor',
          feedback:'Without reasoning, citizens cannot understand or evaluate how constitutional principles were applied, weakening constitutional accountability.'},
        {label:'Let the decision be explained only informally through media leaks.', outcome:'mixed',
          feedback:'Informal, unofficial explanations lack the clarity and authority of a formal, published reasoned decision.'}
      ],
      concept:'Constitutional literacy depends on transparent reasoning — citizens can only understand and engage with constitutional government when decisions are clearly explained.'
    }
  ],
  quiz:[
    {level:'easy', q:'What is a Constitution?', options:['An ordinary law like any other','The supreme law establishing government structure and rights','A document with no legal authority','A set of unwritten customs only'], correct:1,
      explain:'A Constitution is the supreme law of the land, structuring government and guaranteeing rights, with all other laws subordinate to it.'},
    {level:'medium', q:'What does the "basic structure doctrine" protect?', options:['The government\'s power to do anything','Core constitutional features from being destroyed even by amendment','Only economic laws','Nothing of legal significance'], correct:1,
      explain:'The basic structure doctrine holds that foundational features like democracy and judicial review cannot be abolished even through constitutional amendment.'},
    {level:'medium', q:'What is the key difference between Fundamental Rights and Directive Principles?', options:['They are identical in every way','Fundamental Rights are enforceable in court; Directive Principles are guiding but not directly enforceable','Directive Principles are enforceable and Rights are not','Neither is mentioned in the Constitution'], correct:1,
      explain:'Fundamental Rights can be enforced directly in court, while Directive Principles guide policy but are not directly enforceable.'},
    {level:'hard', q:'Why can\'t Parliament use its amending power to remove judicial review entirely?', options:['Parliament has unlimited power','Judicial review is considered part of the Constitution\'s basic structure','It is not actually protected in any way','Only the President can decide this'], correct:1,
      explain:'Courts have held that judicial review is part of the basic structure, meaning even a constitutional amendment cannot eliminate it.'},
    {level:'medium', q:'Why does constitutional interpretation often involve "balancing" rights against social welfare goals?', options:['Because rights and welfare goals are always identical','Because both are legitimate constitutional values that can be in tension','Because Directive Principles do not matter','Because courts prefer to avoid deciding cases'], correct:1,
      explain:'The Constitution values both individual rights and collective welfare — interpretation often requires reasoned balancing rather than treating one as automatically supreme.'},
    {level:'hard', q:'Why is publishing reasoned constitutional decisions important for "constitutional literacy"?', options:['It has no real value','It lets citizens understand how constitutional principles constrain and shape government','It is only useful for lawyers','It slows down governance for no reason'], correct:1,
      explain:'Transparent, reasoned decisions help ordinary citizens understand how the Constitution actually operates and limits government power.'}
  ]
});
