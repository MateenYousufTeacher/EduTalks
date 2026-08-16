Lab.registerSim({
  id:'federalism', order:7, title:'Federalism',
  shortDesc:'Resolve who governs what across Union and State levels.',
  keywords:['union list','state list','concurrent list','jurisdiction','centre-state'],
  objective:'Navigate disputes over which level of government — Union, State, or both — has authority to act on a given issue.',
  stages:[
    {
      title:'Who Regulates This?',
      text:'A new industry, e-scooter ride-sharing, needs regulation covering road safety (a State matter) and telecom data use (a Union matter). Which approach best reflects India\'s federal design?',
      choices:[
        {label:'Coordinate: the State regulates road safety rules, while the Union handles telecom/data aspects, within their respective constitutional domains.', outcome:'good',
          feedback:'This respects the constitutional distribution of subjects — different levels of government legitimately govern different aspects of the same activity.'},
        {label:'Let the Union government regulate everything, ignoring the State list entirely.', outcome:'poor',
          feedback:'Centralising authority over matters constitutionally assigned to States undermines the federal balance the Constitution establishes.'},
        {label:'Let States regulate telecom data independently, ignoring Union authority.', outcome:'poor',
          feedback:'Telecom and data regulation typically falls under Union jurisdiction — States acting outside their constitutional domain creates legal conflict.'}
      ],
      concept:'Federalism divides law-making authority by subject matter — the Seventh Schedule\'s Union, State, and Concurrent Lists determine which level of government legislates on what.'
    },
    {
      title:'A Concurrent List Conflict',
      text:'Both the Union and a State pass differing laws on school education standards (a Concurrent List subject), and they conflict on a key rule. How is this resolved?',
      choices:[
        {label:'Apply the constitutional rule that, in case of conflict on Concurrent List subjects, Union law generally prevails.', outcome:'good',
          feedback:'The Constitution provides a clear resolution mechanism for such conflicts, maintaining national coherence while still allowing State legislation where it doesn\'t conflict.'},
        {label:'Let each district choose whichever law it personally prefers.', outcome:'poor',
          feedback:'Ad hoc, inconsistent application creates legal uncertainty and undermines the rule of law.'},
        {label:'Assume the State law always wins because it is more locally specific.', outcome:'poor',
          feedback:'This is not how Concurrent List conflicts are constitutionally resolved — Union law generally prevails unless the State law has received specific Presidential assent.'}
      ],
      concept:'On Concurrent List subjects, both Union and State governments can legislate, but the Constitution resolves conflicts predictably — usually favouring Union law — to maintain a workable, coherent legal system.'
    },
    {
      title:'A Disaster Response',
      text:'A severe flood strikes a State. Local infrastructure (a State subject) is overwhelmed, and national resources like the armed forces (a Union subject) are needed. What is the appropriate federal response?',
      choices:[
        {label:'The State requests Union assistance, and both levels coordinate resources under established disaster-response frameworks.', outcome:'good',
          feedback:'Cooperative federalism — where different levels of government coordinate rather than compete — is essential during crises that cross jurisdictional lines.'},
        {label:'The Union deploys forces without any coordination with the State government.', outcome:'mixed',
          feedback:'Speed matters in emergencies, but bypassing coordination with the State can create confusion and duplicated or conflicting efforts on the ground.'},
        {label:'The State refuses all Union assistance to "protect its autonomy".', outcome:'poor',
          feedback:'Refusing needed help during a crisis, purely to assert autonomy, harms citizens who need effective, coordinated relief.'}
      ],
      concept:'Federalism is not just about dividing power — it also requires cooperation between levels of government, especially during emergencies that no single level can handle alone.'
    }
  ],
  quiz:[
    {level:'easy', q:'What does federalism mean?', options:['All power is held by one central government','Power is constitutionally divided between central and regional governments','Regional governments have no power at all','There is no government structure'], correct:1,
      explain:'Federalism divides governmental power between a central (Union) authority and regional (State) authorities, as set out in the Constitution.'},
    {level:'medium', q:'What is the Union List?', options:['Subjects only States can legislate on','Subjects only the Union/national government can legislate on','A list of state capitals','A list of judges'], correct:1,
      explain:'The Union List contains subjects, like defence and foreign affairs, on which only the Union government can make laws.'},
    {level:'medium', q:'On Concurrent List subjects, if Union and State laws conflict, which generally prevails?', options:['The State law always','The Union law, generally','Neither — the subject becomes unregulated','Whichever law was passed most recently, regardless of level'], correct:1,
      explain:'The Constitution generally gives Union law precedence over conflicting State law on Concurrent List subjects, ensuring predictable conflict resolution.'},
    {level:'hard', q:'Why is "cooperative federalism" important during a natural disaster affecting a State?', options:['It slows down relief efforts unnecessarily','It ensures coordinated use of both State and Union resources for effective response','It is legally irrelevant','It only applies to non-emergency situations'], correct:1,
      explain:'Emergencies often require both local knowledge (State) and national resources (Union) — cooperation ensures an effective, non-duplicated response.'},
    {level:'medium', q:'Which of these is typically a State List subject?', options:['Foreign affairs','Currency','Police','National defence'], correct:2,
      explain:'Police is a classic State List subject, reflecting that local law enforcement is generally handled at the State level.'},
    {level:'hard', q:'Why shouldn\'t the Union government regulate a State List matter unilaterally?', options:['It has no reason not to','It would override the constitutional distribution of powers between Union and States','States have no constitutional powers at all','The Constitution does not address this'], correct:1,
      explain:'Acting outside its constitutionally assigned domain undermines the federal balance the Constitution deliberately establishes.'}
  ]
});
