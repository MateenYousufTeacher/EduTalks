/* ============================================================
   DATA MODULE — content for the Virtual Political Science Lab
   ============================================================ */
const VPSL_DATA = {};

VPSL_DATA.sims = [
  {id:'democracy', num:1, icon:'🏛️', color:'#0D47A1', title:'Democracy Simulator',
   tagline:'Govern a virtual society and watch democratic values shape its fate.'},
  {id:'election', num:2, icon:'🗳️', color:'#1976D2', title:'Election Process Laboratory',
   tagline:'Run a complete election — registration to results, on a live map.'},
  {id:'parliament', num:3, icon:'📜', color:'#26C6DA', title:'Parliament Simulator',
   tagline:'Steer a bill through committee, debate, amendment and vote.'},
  {id:'executive', num:4, icon:'🏢', color:'#43A047', title:'Executive Decision Studio',
   tagline:'Run the ministries — health, education, infrastructure, disaster relief.'},
  {id:'judiciary', num:5, icon:'⚖️', color:'#0D47A1', title:'Judiciary Explorer',
   tagline:'Walk a case from filing to final judgment through the courts.'},
  {id:'constitution', num:6, icon:'📖', color:'#FFB300', title:'Constitution Interactive Studio',
   tagline:'Explore the Preamble, rights, duties and federal design hands-on.'},
  {id:'federalism', num:7, icon:'🗺️', color:'#1976D2', title:'Federalism Laboratory',
   tagline:'Split power and money between Union, State and Local governments.'},
  {id:'local', num:8, icon:'🏘️', color:'#26C6DA', title:'Local Government Simulator',
   tagline:'Run a Gram Panchayat or Municipal Council on a real budget.'},
  {id:'policy', num:9, icon:'📊', color:'#43A047', title:'Public Policy & Citizen Participation Lab',
   tagline:'Turn a community problem into a funded, monitored policy.'},
  {id:'lawmaking', num:10, icon:'✍️', color:'#0D47A1', title:'Law-Making Process Simulator',
   tagline:'Draft a law from a real problem to a floor vote, step by step.'},
];

/* ---------------- GLOSSARY ---------------- */
VPSL_DATA.glossary = [
  {term:'Constitution', pron:'kon-stih-TOO-shun', def:'The supreme, foundational law of a country that establishes its institutions, powers, procedures, and the rights of citizens.', tags:['Constitution']},
  {term:'Democracy', pron:'dih-MOK-ruh-see', def:'A system of government where power ultimately rests with the people, exercised directly or through elected representatives.', tags:['Democracy']},
  {term:'Preamble', pron:'PREE-am-bul', def:'The introductory statement of a constitution that expresses its guiding philosophy and objectives.', tags:['Constitution']},
  {term:'Fundamental Rights', pron:'fun-duh-MEN-tul RYTS', def:'Basic rights guaranteed to citizens by the constitution and enforceable by courts, such as equality and freedom of speech.', tags:['Rights']},
  {term:'Fundamental Duties', pron:'fun-duh-MEN-tul DOO-teez', def:'Moral obligations listed in the constitution that citizens are expected to perform, such as respecting the law and protecting public property.', tags:['Duties']},
  {term:'Directive Principles', pron:'dy-REK-tiv PRIN-sih-pulz', def:'Guidelines for the state to frame laws and policies aimed at social and economic welfare; not enforceable in court but fundamental to governance.', tags:['Constitution']},
  {term:'Federalism', pron:'FED-er-uh-liz-um', def:'A system of government in which power is divided between a central authority and constituent regional units.', tags:['Federalism']},
  {term:'Universal Adult Franchise', pron:'yoo-nih-VER-sul uh-DULT FRAN-chyz', def:'The principle that every adult citizen, regardless of caste, gender, income or education, has the right to vote.', tags:['Elections']},
  {term:'Secret Ballot', pron:'SEE-kret BAL-ut', def:'A voting method where a voter\'s choice is kept confidential, protecting them from pressure or retaliation.', tags:['Elections']},
  {term:'Constituency', pron:'kun-STIT-yoo-en-see', def:'A geographic area whose voters elect a representative to a legislature.', tags:['Elections']},
  {term:'Bicameral Legislature', pron:'by-KAM-er-ul LEJ-is-lay-cher', def:'A law-making body made up of two chambers or houses, such as an upper and lower house.', tags:['Parliament']},
  {term:'Bill', pron:'BIL', def:'A draft of a proposed law presented for discussion and approval before a legislature.', tags:['Parliament','Law-Making']},
  {term:'Act', pron:'AKT', def:'A bill that has been passed by the legislature and given assent, becoming binding law.', tags:['Parliament','Law-Making']},
  {term:'Amendment', pron:'uh-MEND-ment', def:'A formal change or addition made to a bill, act, or the constitution itself.', tags:['Parliament','Constitution']},
  {term:'Judicial Review', pron:'joo-DISH-ul rih-VYOO', def:'The power of courts to examine and, if necessary, strike down laws or executive actions that violate the constitution.', tags:['Judiciary']},
  {term:'Rule of Law', pron:'ROOL uv LAW', def:'The principle that everyone, including the government, is subject to and accountable under the law.', tags:['Judiciary','Democracy']},
  {term:'Due Process', pron:'DOO PRAH-ses', def:'The legal requirement that the state must respect all rights owed to a person and follow fair procedures before depriving them of life, liberty or property.', tags:['Judiciary']},
  {term:'Separation of Powers', pron:'sep-uh-RAY-shun uv POW-erz', def:'The division of government into legislative, executive and judicial branches so that no single branch holds unchecked authority.', tags:['Governance']},
  {term:'Checks and Balances', pron:'CHEKS and BAL-un-siz', def:'Mechanisms that allow each branch of government to limit the powers of the others, preventing abuse of authority.', tags:['Governance']},
  {term:'Devolution', pron:'dev-uh-LOO-shun', def:'The transfer of powers and responsibilities from a central government to state or local bodies.', tags:['Federalism','Local Government']},
  {term:'Panchayati Raj', pron:'PUN-chah-yuh-tee RAHJ', def:'A three-tier system of local self-government in rural India, from the village to the district level.', tags:['Local Government']},
  {term:'Civic Participation', pron:'SIV-ik par-tis-uh-PAY-shun', def:'The active involvement of citizens in public decision-making, from voting to attending public consultations.', tags:['Citizenship']},
  {term:'Public Policy', pron:'PUB-lik POL-uh-see', def:'A course of action adopted by a government to address a public problem or achieve a social goal.', tags:['Policy']},
  {term:'Manifesto', pron:'man-uh-FES-toh', def:'A public declaration of a political party\'s policies and aims, usually issued before an election.', tags:['Elections']},
  {term:'Coalition Government', pron:'koh-uh-LISH-un GUV-ern-ment', def:'A government formed by two or more political parties working together, usually because no single party won a majority.', tags:['Governance']},
  {term:'Cabinet', pron:'KAB-ih-net', def:'The group of senior ministers, headed by the chief executive, who decide major government policy.', tags:['Executive']},
  {term:'Budget', pron:'BUJ-it', def:'A government\'s statement of expected income and planned spending over a fixed period, usually a year.', tags:['Executive','Local Government']},
  {term:'Governance', pron:'GUV-ern-ens', def:'The processes and institutions through which authority is exercised in managing a country\'s affairs.', tags:['Governance']},
  {term:'Transparency', pron:'trans-PAIR-en-see', def:'Openness in government action and decision-making that allows citizens to see how and why decisions are made.', tags:['Democracy','Governance']},
  {term:'Accountability', pron:'uh-koun-tuh-BIL-ih-tee', def:'The obligation of public officials to answer for their actions and decisions to the people they serve.', tags:['Governance']},
  {term:'Election Commission', pron:'ih-LEK-shun kuh-MISH-un', def:'An independent constitutional body responsible for administering free and fair elections.', tags:['Elections']},
  {term:'Voter Turnout', pron:'VOH-ter TURN-owt', def:'The percentage of eligible voters who actually cast their vote in an election.', tags:['Elections']},
  {term:'Ordinance', pron:'OR-dih-nuns', def:'A law promulgated by the executive when the legislature is not in session, subject to later legislative approval.', tags:['Executive','Law-Making']},
  {term:'Writ', pron:'RIT', def:'A formal written order issued by a court, used to enforce fundamental rights or command official action.', tags:['Judiciary']},
  {term:'Appeal', pron:'uh-PEEL', def:'A request to a higher court to review and change the decision of a lower court.', tags:['Judiciary']},
  {term:'Stakeholder Consultation', pron:'STAYK-hohl-der kon-sul-TAY-shun', def:'The process of gathering input from people affected by a policy before it is finalized.', tags:['Policy','Law-Making']},
  {term:'Devolved Taxation', pron:'dih-VOLVD tak-SAY-shun', def:'Tax powers assigned to state or local governments rather than the central government.', tags:['Federalism']},
  {term:'Ministry', pron:'MIN-is-tree', def:'A government department headed by a minister and responsible for a specific area of public policy, such as health or education.', tags:['Executive']},
  {term:'Ward', pron:'WORD', def:'A small electoral or administrative division within a city or town used for local government representation.', tags:['Local Government']},
  {term:'Citizen Charter', pron:'SIT-ih-zen CHAR-ter', def:'A public document that states the standard of service a citizen can expect from a government office.', tags:['Governance','Local Government']},
];

/* ---------------- CONSTITUTION HANDBOOK ---------------- */
VPSL_DATA.constitution = [
  {id:'preamble', title:'The Preamble', body:
    `The Preamble is the introduction to the Constitution — a short statement of the ideals the nation sets for itself. It describes India as a Sovereign, Socialist, Secular, Democratic Republic and pledges to secure for all citizens Justice (social, economic and political), Liberty (of thought, expression, belief, faith and worship), Equality (of status and opportunity), and to promote Fraternity, ensuring the dignity of the individual and the unity and integrity of the Nation. Educators use the Preamble as the interpretive key to the rest of the document — when a provision is ambiguous, courts often look back to these founding ideals.`},
  {id:'rights', title:'Fundamental Rights', body:
    `Fundamental Rights are basic freedoms guaranteed to every citizen and enforceable directly by the courts. They broadly cover: the Right to Equality (no discrimination on grounds of religion, race, caste, sex or place of birth), the Right to Freedom (speech, assembly, movement, and protection of life and personal liberty), the Right against Exploitation (prohibiting forced labour and child labour), the Right to Freedom of Religion, Cultural and Educational Rights (protecting the interests of minorities), and the Right to Constitutional Remedies, which allows a citizen to approach a court directly if any of these rights is violated.`},
  {id:'duties', title:'Fundamental Duties', body:
    `Fundamental Duties are moral responsibilities every citizen is expected to uphold — respecting the Constitution and national symbols, cherishing the ideals of the freedom struggle, upholding sovereignty and integrity, defending the country, promoting harmony, preserving the environment and public property, developing scientific temper, and striving for excellence. Unlike Fundamental Rights, duties are not enforceable in court, but they express the idea that citizenship is a two-way relationship of rights and responsibilities.`},
  {id:'dpsp', title:'Directive Principles of State Policy', body:
    `The Directive Principles are guidelines for the government when making laws and policy — aimed at building a just society through an adequate livelihood, equal pay for equal work, protection of children, promotion of education, and improvement of public health, among others. They are not enforceable by courts, but the Constitution itself calls them "fundamental in the governance of the country," meaning the state is expected to apply them even though citizens cannot sue to enforce them directly.`},
  {id:'federal', title:'Federal Structure', body:
    `Governance is distributed across three lists of subjects: the Union List (defence, foreign affairs, currency — handled by the central government), the State List (police, public health, agriculture — handled by state governments), and the Concurrent List (education, forests, marriage — where both can legislate, with central law generally prevailing in conflict). This division balances national unity with regional self-government, a hallmark of cooperative federalism.`},
  {id:'local-self-gov', title:'Local Self-Government', body:
    `Constitutional amendments established a three-tier system of rural local government (Panchayati Raj — Gram Panchayat, Panchayat Samiti, Zila Parishad) and urban local bodies (Municipalities and Municipal Corporations). These institutions bring governance closest to citizens, handling everything from water supply to primary schools, and reserve seats for women and marginalised communities to widen participation.`},
  {id:'ec', title:'Election Commission', body:
    `An independent constitutional body conducts, supervises and controls elections to Parliament, state legislatures, and the offices of President and Vice-President. Its independence — commissioners cannot be easily removed once appointed — is designed to keep elections free from the influence of the party in power.`},
  {id:'parliamentary', title:'Parliamentary System', body:
    `The system features a ceremonial head of state and a real executive head of government drawn from, and accountable to, the elected legislature. The executive stays in office only as long as it retains the confidence (majority support) of the lower house, which keeps day-to-day power answerable to elected representatives rather than fixed for a set term regardless of performance.`},
  {id:'judiciary-over', title:'Judiciary Overview', body:
    `An independent judiciary — from subordinate courts, through High Courts, up to the apex court — interprets the Constitution, resolves disputes, and can strike down laws or executive actions that conflict with it (judicial review). Independence from the executive and legislature is protected through secure tenure and set procedures for appointment and removal of judges, so that the courts can check the other branches without fear of retaliation.`},
  {id:'amend', title:'Constitutional Amendments', body:
    `The Constitution can be changed through a formal amendment process requiring passage by special majorities in Parliament, and for some provisions, ratification by a set number of state legislatures. This makes the Constitution flexible enough to adapt over time, yet rigid enough that its core structure cannot be altered by a simple majority alone — a balance often summarised as the "basic structure" doctrine.`},
];

/* ---------------- ACHIEVEMENTS ---------------- */
VPSL_DATA.achievements = [
  {id:'first-step', ic:'🌱', name:'First Step', desc:'Open your first simulation', check:s=>s.simsOpened.length>=1},
  {id:'explorer', ic:'🧭', name:'Civic Explorer', desc:'Open 5 different simulations', check:s=>s.simsOpened.length>=5},
  {id:'completionist', ic:'🏆', name:'Constitution Champion', desc:'Complete all 10 simulations', check:s=>s.simsCompleted.length>=10},
  {id:'quiz-1', ic:'🎯', name:'Sharp Shooter', desc:'Score 100% on any quiz', check:s=>s.perfectQuizzes>=1},
  {id:'quiz-5', ic:'🧠', name:'Civic Scholar', desc:'Pass 5 quizzes', check:s=>s.quizzesPassed>=5},
  {id:'streak-3', ic:'🔥', name:'3-Day Streak', desc:'Use the lab 3 days in a row', check:s=>s.streak>=3},
  {id:'notes', ic:'📝', name:'Note Taker', desc:'Save 3 observation notes', check:s=>s.notes.length>=3},
  {id:'gloss', ic:'📚', name:'Word Wise', desc:'Browse the glossary', check:s=>s.glossaryVisited},
  {id:'const', ic:'📖', name:'Constitution Reader', desc:'Open the Constitution Handbook', check:s=>s.constitutionVisited},
  {id:'leader', ic:'👑', name:'Civic Leader', desc:'Reach Level 5', check:s=>s.level>=5},
];

/* ---------------- LEVEL TITLES ---------------- */
VPSL_DATA.levelTitles = ['Citizen-in-Training','Informed Citizen','Active Citizen','Civic Advocate','Civic Leader','Constitution Champion'];
