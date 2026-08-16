Lab.registerSim({
  id:'lawmaking', order:10, title:'Lawmaking',
  shortDesc:'Move a bill through debate, amendment, and enactment.',
  keywords:['bill','act','amendment','assent','legislative process'],
  objective:'Guide a proposed law from initial drafting through debate, amendment, and final enactment.',
  stages:[
    {
      title:'Drafting the Bill',
      text:'A member wants to introduce a bill mandating helmets for all two-wheeler riders. Before introducing it in the House, what should happen first?',
      choices:[
        {label:'Draft the bill carefully with legal experts, defining clear terms, penalties, and exceptions.', outcome:'good',
          feedback:'A well-drafted bill with clear, precise language avoids confusion and legal loopholes once it becomes law.'},
        {label:'Introduce a vague, one-line bill and "sort out the details later."', outcome:'poor',
          feedback:'Vague drafting creates enforcement problems and legal ambiguity once the bill becomes an Act — details matter enormously in lawmaking.'},
        {label:'Skip drafting and just announce the idea informally to the media.', outcome:'poor',
          feedback:'A law must go through the Constitution\'s formal legislative process — public announcements alone have no legal effect.'}
      ],
      concept:'Careful, precise drafting is the essential first step in lawmaking — the exact wording of a bill will determine how the eventual law is enforced and interpreted.'
    },
    {
      title:'Debate and Amendment',
      text:'During debate, some members argue the helmet mandate should exempt short local trips, while others insist on no exceptions for maximum safety. What is the appropriate legislative process?',
      choices:[
        {label:'Debate the proposed amendment fully, then let the House vote on whether to accept it before the final bill vote.', outcome:'good',
          feedback:'Amendments are a normal, healthy part of lawmaking — they let the legislature refine a bill based on debate and diverse viewpoints before final passage.'},
        {label:'Let the bill\'s original sponsor unilaterally decide whether to accept the amendment, skipping a House vote.', outcome:'poor',
          feedback:'Amendments must be decided by the House as a whole, not by one member alone — this preserves the collective, representative nature of lawmaking.'},
        {label:'Refuse to discuss any amendments and force the original text to a vote unchanged.', outcome:'mixed',
          feedback:'Refusing all debate on amendments limits the legislature\'s ability to improve a bill based on members\' informed concerns.'}
      ],
      concept:'The amendment process allows a bill to be refined through debate — this is a core strength of legislative lawmaking compared to a single decree.'
    },
    {
      title:'From Bill to Act',
      text:'The amended bill passes in the first house. What are the remaining constitutional steps before it becomes law?',
      choices:[
        {label:'Pass it through the second house of Parliament (for most bills), then send it for the President\'s assent.', outcome:'good',
          feedback:'Most bills must pass both houses of a bicameral legislature and then receive the head of state\'s formal assent before becoming an enforceable Act.'},
        {label:'Treat it as law immediately once the first house passes it, skipping remaining steps.', outcome:'poor',
          feedback:'Skipping the constitutionally required steps means the bill has not yet legally become an Act — the process must be completed in full.'},
        {label:'Ask the courts to formally approve the bill before it can proceed further.', outcome:'mixed',
          feedback:'Courts do not pre-approve bills before enactment — their role is to review laws after enactment if they are constitutionally challenged.'}
      ],
      concept:'A bill becomes an enforceable Act only after completing every required constitutional step — passage through the legislature\'s houses and formal assent by the head of state.'
    }
  ],
  quiz:[
    {level:'easy', q:'What is a "Bill"?', options:['A law that is already in force','A draft proposal for a new law','A court judgment','A government press release'], correct:1,
      explain:'A Bill is a draft proposal for a law; it becomes an Act only after passing the required legislative process.'},
    {level:'medium', q:'Why is careful drafting important when writing a bill?', options:['It is not really important','Precise wording determines how the eventual law will be enforced and interpreted','Only the title of a bill matters','Drafting has no legal significance'], correct:1,
      explain:'The exact wording of a bill shapes how the resulting law will be applied and interpreted by courts and administrators.'},
    {level:'medium', q:'What is the purpose of debating amendments to a bill?', options:['To waste legislative time','To let the House refine and improve the bill through debate before passage','It is not a normal part of lawmaking','Only the bill\'s sponsor may propose changes'], correct:1,
      explain:'Amendments allow the collective legislature to refine a bill in light of debate and differing perspectives before it becomes law.'},
    {level:'hard', q:'For most bills in a bicameral legislature, what must happen before a bill becomes an Act?', options:['It only needs to pass one house','It must pass both houses and receive the head of state\'s assent','It only needs media coverage','Courts must approve it before enactment'], correct:1,
      explain:'Most bills must pass both houses of a bicameral legislature and then receive the President\'s (or equivalent head of state\'s) formal assent.'},
    {level:'medium', q:'What is the general legislative sequence for a bill?', options:['Introduction → Debate → Amendment → Voting → Assent → Act','Assent → Introduction → Act → Debate','Act → Bill → Debate','Voting → Introduction → Debate'], correct:0,
      explain:'A bill typically moves through introduction, debate, possible amendment, voting, and finally assent to become an Act.'},
    {level:'hard', q:'Why don\'t courts pre-approve bills before they are enacted?', options:['Courts have no role in lawmaking at all','Judicial review typically applies to laws after enactment, not draft bills beforehand','Courts always approve bills automatically','It is legally required for courts to pre-approve bills'], correct:1,
      explain:'Courts generally review the constitutionality of laws after they are enacted and challenged, rather than pre-approving draft bills.'}
  ]
});
