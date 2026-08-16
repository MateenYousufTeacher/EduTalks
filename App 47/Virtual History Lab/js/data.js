/* Virtual History Laboratory — content data (all offline, no network calls) */

const Icons = {
  torch:`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c1.2 1.6 2.2 2.9 2.2 4.4A2.2 2.2 0 0 1 12 8.6a2.2 2.2 0 0 1-2.2-2.2C9.8 4.9 10.8 3.6 12 2Z" fill="currentColor"/><path d="M9 10h6l-1 10a2 2 0 0 1-4 0L9 10Z" fill="currentColor" opacity=".8"/></svg>`,
  home:`<svg viewBox="0 0 24 24" fill="none"><path d="M3 11l9-7 9 7" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>`,
  sims:`<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="4" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="13" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="13" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.6"/></svg>`,
  timeline:`<svg viewBox="0 0 24 24" fill="none"><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="12" r="2.2" fill="currentColor"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="18" cy="12" r="2.2" fill="currentColor"/></svg>`,
  museum:`<svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-5 9 5" stroke="currentColor" stroke-width="1.6" fill="none"/><rect x="4" y="9" width="16" height="10" stroke="currentColor" stroke-width="1.6" fill="none"/><line x1="2" y1="20" x2="22" y2="20" stroke="currentColor" stroke-width="1.6"/></svg>`,
  book:`<svg viewBox="0 0 24 24" fill="none"><path d="M4 5c3-1.4 6-1.4 8 0v14c-2-1.4-5-1.4-8 0V5Z" stroke="currentColor" stroke-width="1.6"/><path d="M20 5c-3-1.4-6-1.4-8 0v14c2-1.4 5-1.4 8 0V5Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
  quiz:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.9.5-1.1 1-1.1 1.8" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="12" cy="17" r=".9" fill="currentColor"/></svg>`,
  glossary:`<svg viewBox="0 0 24 24" fill="none"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" stroke="currentColor" stroke-width="1.6"/><line x1="8" y1="9" x2="15" y2="9" stroke="currentColor" stroke-width="1.4"/><line x1="8" y1="13" x2="13" y2="13" stroke="currentColor" stroke-width="1.4"/></svg>`,
  bookmark:`<svg viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-6-4-6 4V3Z" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>`,
  bookmarkFilled:`<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4V3Z" fill="currentColor"/></svg>`,
  trophy:`<svg viewBox="0 0 24 24" fill="none"><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" stroke="currentColor" stroke-width="1.6"/><path d="M7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="13" x2="12" y2="18" stroke="currentColor" stroke-width="1.6"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="1.6"/></svg>`,
  settings:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="1.6"/></svg>`,
  user:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 20c1.6-3.6 5-5.4 7.5-5.4S18.9 16.4 20.5 20" stroke="currentColor" stroke-width="1.6"/></svg>`,
  search:`<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7"/><line x1="21" y1="21" x2="16.2" y2="16.2" stroke="currentColor" stroke-width="1.7"/></svg>`,
  moon:`<svg viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.6" fill="currentColor" fill-opacity=".15"/></svg>`,
  sun:`<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.6"/><g stroke="currentColor" stroke-width="1.6"><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="22" y2="12"/><line x1="4.6" y1="4.6" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.4" y2="19.4"/><line x1="4.6" y1="19.4" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.4" y2="4.6"/></g></svg>`,
  play:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5Z"/></svg>`,
  pause:`<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>`,
  step:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5v14l9-7L6 5Z"/><rect x="16" y="5" width="2.4" height="14"/></svg>`,
  back:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 5v14L9 12l9-7Z"/><rect x="5.6" y="5" width="2.4" height="14"/></svg>`,
  reset:`<svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 1 2.6 5.9" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M4 17v-5h5" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>`,
  fullscreen:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"/></svg>`,
  camera:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 8h3l2-2h6l2 2h3v11H4V8Z"/><circle cx="12" cy="13.5" r="3.4"/></svg>`,
  download:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>`,
  arrow:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>`,
};

/* ---------------- Exhibit thumbnail SVGs (unique per simulation) ---------------- */
const ExhibitArt = {
  stoneage:`<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice"><rect width="260" height="130" fill="#20120e"/><polygon points="0,130 40,60 80,130" fill="#3a2418"/><polygon points="60,130 110,40 160,130" fill="#4a2f1f"/><circle cx="200" cy="35" r="18" fill="#D98E2B" opacity=".8"/><path d="M120 130 Q130 90 145 130" fill="#D98E2B" opacity=".7"/></svg>`,
  indus:`<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice"><rect width="260" height="130" fill="#241512"/><g fill="#C49A4E" opacity=".85"><rect x="20" y="70" width="34" height="45"/><rect x="60" y="55" width="34" height="60"/><rect x="100" y="75" width="34" height="40"/></g><line x1="0" y1="118" x2="260" y2="118" stroke="#8B8378" stroke-width="4"/><circle cx="200" cy="45" r="14" fill="#E8C77A"/></svg>`,
  egypt:`<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice"><rect width="260" height="130" fill="#241009"/><circle cx="210" cy="35" r="22" fill="#D98E2B"/><polygon points="60,120 110,40 160,120" fill="#C49A4E"/><polygon points="90,120 110,70 130,120" fill="#8B6A34" opacity=".7"/><rect x="0" y="118" width="260" height="12" fill="#2C4A7C" opacity=".6"/></svg>`,
  medindia:`<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice"><rect width="260" height="130" fill="#221016"/><rect x="40" y="60" width="20" height="55" fill="#C49A4E"/><polygon points="40,60 50,40 60,60" fill="#E8C77A"/><rect x="90" y="45" width="24" height="70" fill="#8B8378"/><path d="M90 45 a12 12 0 0 1 24 0" fill="#8B8378"/><rect x="150" y="65" width="60" height="50" fill="#4A463F"/><polygon points="150,65 180,35 210,65" fill="#7A2434"/></svg>`,
  mughal:`<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice"><rect width="260" height="130" fill="#231018"/><rect x="80" y="60" width="100" height="55" fill="#E7D9B8" opacity=".9"/><path d="M80 60 q50 -55 100 0" fill="#E7D9B8" opacity=".9"/><circle cx="130" cy="30" r="6" fill="#C49A4E"/><rect x="60" y="80" width="18" height="35" fill="#E7D9B8" opacity=".7"/><rect x="182" y="80" width="18" height="35" fill="#E7D9B8" opacity=".7"/></svg>`,
  industrial:`<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice"><rect width="260" height="130" fill="#181012"/><rect x="30" y="70" width="22" height="50" fill="#4A463F"/><rect x="60" y="50" width="22" height="70" fill="#5A1F2B"/><rect x="95" y="30" width="16" height="90" fill="#3a2020"/><circle cx="103" cy="24" r="8" fill="#8B8378" opacity=".6"/><rect x="130" y="60" width="90" height="60" fill="#2C2020"/><line x1="0" y1="120" x2="260" y2="120" stroke="#C49A4E" stroke-width="2"/></svg>`,
  frenchrev:`<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice"><rect width="260" height="130" fill="#1c1013"/><rect x="0" y="0" width="86" height="130" fill="#2C4A7C" opacity=".5"/><rect x="86" y="0" width="88" height="130" fill="#F3E9D2" opacity=".18"/><rect x="174" y="0" width="86" height="130" fill="#7A2434" opacity=".55"/><rect x="115" y="40" width="30" height="80" fill="#C49A4E" opacity=".8"/></svg>`,
  freedom:`<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice"><rect width="260" height="130" fill="#1c1410"/><rect x="0" y="0" width="260" height="43" fill="#D98E2B" opacity=".7"/><rect x="0" y="43" width="260" height="44" fill="#F3E9D2" opacity=".85"/><rect x="0" y="87" width="260" height="43" fill="#3E5C3A" opacity=".7"/><circle cx="130" cy="65" r="16" fill="#2C4A7C" opacity=".8"/></svg>`,
  ww2:`<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice"><rect width="260" height="130" fill="#141418"/><circle cx="130" cy="65" r="46" fill="none" stroke="#8B8378" stroke-width="1.5" opacity=".6"/><path d="M40 65 L220 65" stroke="#C49A4E" stroke-width="1.5" opacity=".7"/><circle cx="70" cy="40" r="5" fill="#2C4A7C"/><circle cx="190" cy="90" r="5" fill="#7A2434"/><circle cx="150" cy="35" r="4" fill="#D98E2B"/></svg>`,
  constitution:`<svg viewBox="0 0 260 130" preserveAspectRatio="xMidYMid slice"><rect width="260" height="130" fill="#1a1113"/><rect x="90" y="15" width="80" height="100" fill="#F3E9D2" opacity=".9"/><line x1="102" y1="35" x2="158" y2="35" stroke="#3D141C" stroke-width="2"/><line x1="102" y1="50" x2="158" y2="50" stroke="#3D141C" stroke-width="2"/><line x1="102" y1="65" x2="150" y2="65" stroke="#3D141C" stroke-width="2"/><circle cx="130" cy="95" r="10" fill="#C49A4E"/></svg>`
};

/* ---------------- Simulation catalog metadata ---------------- */
const SIMULATIONS = [
  { id:'stoneage', num:'01', era:'Prehistoric', title:'Stone Age Life Simulator',
    tagline:'Build a prehistoric settlement and discover how innovation changed daily survival.',
    objectives:[
      'Explain how early humans met basic needs for food, warmth and safety.',
      'Sequence the key technological breakthroughs of the Stone Age.',
      'Evaluate how the shift to agriculture transformed human society.'
    ],
    context:`Between roughly 2.5 million and 5,000 years ago, early humans survived through hunting, gathering, tool-making and, eventually, farming. Archaeological finds — chipped flint tools, hearths, painted cave walls and the first domesticated grains — let historians reconstruct daily life long before writing existed. Every action your band takes below is grounded in evidence recovered from real prehistoric sites.`,
    legacy:`Stone Age innovations — controlled fire, tool-making and agriculture — remain the foundation of every technology that followed, from metallurgy to modern engineering.`,
    misconceptions:[
      'Myth: Stone Age people were unintelligent. Reality: they engineered precise tools, tracked seasons, and produced sophisticated symbolic art.',
      'Myth: Fire was easy to obtain. Reality: fire-starting was a difficult, learned skill using friction or percussion methods.',
      'Myth: Farming appeared overnight. Reality: the shift from foraging to agriculture took many generations in most regions.'
    ],
    facts:[
      'The oldest known cave paintings are over 40,000 years old.',
      'Stone Age toolkits could include over 20 distinct specialised tool types.',
      'Early farming independently arose in several world regions, including the Fertile Crescent, China and Mesoamerica.'
    ]
  },
  { id:'indus', num:'02', era:'Ancient · India', title:'Indus Valley Civilization Explorer',
    tagline:'Reconstruct a Harappan city and investigate one of the world\u2019s first great urban cultures.',
    objectives:[
      'Identify the defining features of Harappan urban planning.',
      'Analyse evidence for trade, administration and daily life at Indus sites.',
      'Assess leading theories on the civilization\u2019s decline.'
    ],
    context:`The Indus Valley (Harappan) Civilization flourished c. 3300–1300 BCE across present-day Pakistan and north-western India. Cities such as Mohenjo-daro and Harappa reveal grid-planned streets, covered drains, standardised bricks and weights — evidence of remarkable civic organisation, centuries before comparable planning appears elsewhere.`,
    legacy:`Indus urban planning, standardised measurement and sanitation engineering anticipated municipal systems used across the world today.`,
    misconceptions:[
      'Myth: The Indus script has been fully deciphered. Reality: it remains undeciphered; interpretations of seals are still debated.',
      'Myth: The civilization had no rulers. Reality: absence of monumental palaces does not confirm the absence of authority — this is actively debated.',
      'Myth: The decline had one single cause. Reality: historians point to a combination of climate shift, river changes and trade disruption.'
    ],
    facts:[
      'Bricks across Harappan cities follow a near-identical 4:2:1 ratio, suggesting centralised standards.',
      'The Great Bath at Mohenjo-daro is one of the earliest known public water structures.',
      'Indus weights follow a binary system (1,2,4,8...) suggesting standardised trade.'
    ]
  },
  { id:'egypt', num:'03', era:'Ancient · Egypt', title:'Ancient Egypt Civilization Simulator',
    tagline:'Govern a Nile kingdom by balancing floods, farming, monuments and trade.',
    objectives:[
      'Explain how the Nile\u2019s flood cycle shaped Egyptian civilization.',
      'Evaluate trade-offs between monument-building, agriculture and trade.',
      'Describe the roles of religion, kingship and the afterlife in Egyptian society.'
    ],
    context:`Ancient Egyptian civilization thrived for three millennia along the Nile, whose annual flood deposited fertile silt that fed dense populations. Pharaohs directed vast labour forces toward monuments, irrigation and temples, while trade networks reached Nubia, the Levant and beyond.`,
    legacy:`Egyptian achievements in engineering, writing, medicine and administration influenced the ancient Mediterranean world and remain a touchstone of world heritage.`,
    misconceptions:[
      'Myth: Pyramids were built by slaves. Reality: evidence from workers\u2019 villages shows paid, organised labour crews, likely including farmers during the flood season.',
      'Myth: Mummification was purely about preservation. Reality: it was a religious act intended to prepare the soul (ka) for the afterlife.',
      'Myth: Egypt was culturally static. Reality: its art, religion and administration evolved considerably across three thousand years.'
    ],
    facts:[
      'Ancient Egyptians developed one of the earliest writing systems, hieroglyphics, around 3200 BCE.',
      'The Nile flood was so central that Egyptians divided their calendar into three flood-linked seasons.',
      'Egyptian physicians performed surgery and set bones using techniques documented on papyrus.'
    ]
  },
  { id:'medindia', num:'04', era:'Medieval · India', title:'Medieval India Interactive World',
    tagline:'Build and compare medieval Indian cities across regional kingdoms.',
    objectives:[
      'Compare architectural and administrative styles of major medieval Indian kingdoms.',
      'Explain the role of trade routes and craft guilds in medieval urban life.',
      'Analyse how geography shaped regional kingdoms\u2019 fortunes.'
    ],
    context:`Between the 8th and 16th centuries CE, the Indian subcontinent hosted a mosaic of powerful regional kingdoms — the Cholas, Rajputs, the Delhi Sultanate and the Vijayanagara Empire among them — each developing distinctive forts, temples, markets and administrative systems, connected by extensive trade routes.`,
    legacy:`Medieval Indian architecture, temple economies and craft traditions continue to shape South Asian art, urban form and cultural identity.`,
    misconceptions:[
      'Myth: Medieval India was culturally isolated. Reality: extensive maritime and overland trade connected it to Central Asia, the Middle East and Southeast Asia.',
      'Myth: All medieval Indian kingdoms shared one uniform culture. Reality: architecture, language and administration varied enormously by region.',
    ],
    facts:[
      'Vijayanagara\u2019s capital Hampi featured advanced water-management canals still traceable today.',
      'Medieval trade guilds (shreni) regulated craft quality and prices in many regional economies.',
      'Fortified hill capitals such as Chittorgarh combined defence with elaborate water-harvesting systems.'
    ]
  },
  { id:'mughal', num:'05', era:'Early Modern · India', title:'Mughal Empire Administration Simulator',
    tagline:'Govern the Mughal Empire — balance revenue, agriculture, trade and culture.',
    objectives:[
      'Explain how the Mansabdari system organised Mughal administration.',
      'Evaluate how revenue and agricultural policy affected imperial stability.',
      'Describe Mughal contributions to architecture, art and literature.'
    ],
    context:`The Mughal Empire (1526–1857) built one of the most sophisticated pre-modern administrative systems in the world, integrating revenue assessment, a ranked nobility (mansabdars), extensive infrastructure and prolific patronage of art and architecture.`,
    legacy:`Mughal revenue systems influenced later colonial and Indian administrative structures, while Mughal architecture — from the Taj Mahal to Fatehpur Sikri — remains globally celebrated.`,
    misconceptions:[
      'Myth: Mughal rule was administratively uniform throughout. Reality: policy and stability varied significantly across different emperors\u2019 reigns.',
      'Myth: The Mansabdari system was purely military. Reality: it combined military rank with civil administrative responsibility and revenue assignment.'
    ],
    facts:[
      'Akbar\u2019s land revenue system (Zabt) assessed tax based on measured land and average yields.',
      'The Mughal court supported painters, poets and architects from many regions and faiths.',
      'Mughal gardens (charbagh) used precise geometric water channels symbolising paradise.'
    ]
  },
  { id:'industrial', num:'06', era:'Modern · World', title:'Industrial Revolution Simulation',
    tagline:'Transform a small town into an industrial city and weigh the costs of progress.',
    objectives:[
      'Explain the key technological drivers of industrialisation.',
      'Evaluate the social and environmental consequences of rapid industrial growth.',
      'Compare living and working conditions before and after industrialisation.'
    ],
    context:`Beginning in Britain around the 1760s, the Industrial Revolution introduced mechanised production, steam power and rail transport, reshaping economies worldwide. Factories drew rural populations into rapidly growing cities, delivering immense productivity gains alongside serious social and environmental costs.`,
    legacy:`Industrialisation created the modern urban, economic and technological world — and also raised the questions of labour rights and environmental stewardship still debated today.`,
    misconceptions:[
      'Myth: Industrialisation instantly improved everyone\u2019s living standards. Reality: early factory workers, including children, often faced long hours and dangerous conditions.',
      'Myth: The Industrial Revolution happened everywhere at once. Reality: it spread unevenly across regions over more than a century.'
    ],
    facts:[
      'The steam engine, improved by James Watt, became the power source that defined the era.',
      'Manchester\u2019s population grew roughly tenfold during the height of industrialisation.',
      'Early labour movements and factory-reform laws emerged directly in response to industrial working conditions.'
    ]
  },
  { id:'frenchrev', num:'07', era:'Modern · World', title:'French Revolution Decision Simulator',
    tagline:'Navigate the political phases of the French Revolution through reasoned decisions.',
    objectives:[
      'Explain the causes of the French Revolution.',
      'Trace how decisions on taxation and representation shaped revolutionary outcomes.',
      'Evaluate the consequences of revolutionary change on French institutions.'
    ],
    context:`France in 1789 faced a fiscal crisis, social inequality between the Estates, and Enlightenment ideas questioning absolute monarchy. The Revolution unfolded through distinct phases — from the Estates-General to the National Assembly, the Terror, and eventually the Directory — each shaped by the decisions of its participants.`,
    legacy:`The Revolution\u2019s ideals of liberty, equality and fraternity, along with its Declaration of the Rights of Man, influenced constitutional movements across the modern world.`,
    misconceptions:[
      'Myth: The Revolution was a single unified event. Reality: it moved through several distinct, often contradictory phases.',
      'Myth: The Terror represented the Revolution\u2019s only outcome. Reality: it was one turbulent phase among several, followed by significant institutional change.'
    ],
    facts:[
      'The Declaration of the Rights of Man and of the Citizen (1789) proclaimed liberty and equality before law.',
      'France\u2019s pre-revolutionary population was divided into three Estates with unequal tax burdens.',
      'Revolutionary France briefly adopted a new calendar and system of weights and measures.'
    ]
  },
  { id:'freedom', num:'08', era:'Modern · India', title:'Indian Freedom Movement Interactive Timeline',
    tagline:'Explore branching scenarios across India\u2019s major freedom movements.',
    objectives:[
      'Sequence the major phases of the Indian independence movement.',
      'Analyse the strategies and outcomes of key movements and their leaders.',
      'Evaluate the role of mass participation in political change.'
    ],
    context:`Between 1905 and 1947, a series of movements — Swadeshi, Non-Cooperation, Civil Disobedience and Quit India — mobilised millions of Indians using a range of strategies, from boycott and non-violent resistance to underground organisation, ultimately leading to independence in 1947.`,
    legacy:`India\u2019s freedom movement, particularly its use of non-violent mass mobilisation, influenced civil-rights and independence movements worldwide.`,
    misconceptions:[
      'Myth: Independence resulted from a single strategy. Reality: it combined constitutional negotiation, mass movements and diverse regional efforts.',
      'Myth: All participants agreed on tactics and goals. Reality: leaders and groups often disagreed sharply on strategy and timing.'
    ],
    facts:[
      'The Swadeshi Movement (1905) promoted Indian-made goods in response to the partition of Bengal.',
      'The Non-Cooperation Movement (1920–22) saw millions boycott British institutions.',
      'The Quit India Movement (1942) demanded immediate British withdrawal amid World War II.'
    ]
  },
  { id:'ww2', num:'09', era:'Modern · World', title:'World War II Global Strategy Explorer',
    tagline:'Understand global alliances, logistics and the human cost of the Second World War.',
    objectives:[
      'Explain the global alliance structure of World War II.',
      'Evaluate the role of production, logistics and diplomacy in the war\u2019s outcome.',
      'Assess the human and humanitarian consequences of the conflict.'
    ],
    context:`World War II (1939–1945) involved a global coalition of Allied nations against the Axis powers, fought across multiple theatres and sustained by unprecedented industrial production and logistics. This module emphasises strategic decision-making, cooperation and consequence over combat detail.`,
    legacy:`The war reshaped the global political order, led to the founding of the United Nations, and left enduring lessons about the human cost of large-scale conflict.`,
    misconceptions:[
      'Myth: The war was decided by battles alone. Reality: industrial production, logistics and diplomacy were equally decisive.',
      'Myth: All nations experienced the war the same way. Reality: civilian and humanitarian impacts varied enormously by region.'
    ],
    facts:[
      'Industrial output, not only battlefield tactics, was a decisive factor in the war\u2019s outcome.',
      'The war involved more than 30 countries and affected civilian populations on an unprecedented scale.',
      'The United Nations was founded in 1945 partly in response to the war\u2019s devastation.'
    ]
  },
  { id:'constitution', num:'10', era:'Modern · India', title:'Constitution of India Interactive Studio',
    tagline:'Guide the drafting of India\u2019s Constitution and explore how choices shape governance.',
    objectives:[
      'Explain the process and purpose of the Constituent Assembly.',
      'Compare alternative provisions for rights, principles and federal structure.',
      'Evaluate how constitutional choices influence a nation\u2019s governance.'
    ],
    context:`Between 1946 and 1949, the Constituent Assembly of India debated and drafted the Constitution of India, balancing fundamental rights, directive principles of state policy, and a federal structure to govern a vast and diverse new nation.`,
    legacy:`The Constitution of India remains one of the longest and most detailed in the world, and continues to guide the nation\u2019s democratic institutions.`,
    misconceptions:[
      'Myth: The Constitution was written quickly. Reality: drafting involved nearly three years of detailed deliberation.',
      'Myth: All members agreed on every provision. Reality: the Assembly debated contentious issues extensively before reaching consensus.'
    ],
    facts:[
      'The Constituent Assembly included representatives from a wide range of regions, communities and political views.',
      'Dr. B. R. Ambedkar chaired the Drafting Committee of the Constitution.',
      'The Constitution of India came into effect on 26 January 1950, now celebrated as Republic Day.'
    ]
  },
];

/* ---------------- Timeline data (spans eras) ---------------- */
const TIMELINE_DATA = [
  { era:'Prehistoric', range:'2,500,000 – 3300 BCE', events:[
    {y:'~2.5 mya', t:'First stone tools (Oldowan)'},
    {y:'~400,000 BCE', t:'Controlled use of fire becomes widespread'},
    {y:'~40,000 BCE', t:'Earliest known cave art'},
    {y:'~10,000 BCE', t:'Agriculture begins in the Fertile Crescent'},
  ]},
  { era:'Ancient', range:'3300 BCE – 500 CE', events:[
    {y:'3300 BCE', t:'Indus Valley Civilization emerges'},
    {y:'3100 BCE', t:'Unification of Upper & Lower Egypt'},
    {y:'2560 BCE', t:'Great Pyramid of Giza completed (approx.)'},
    {y:'~1900 BCE', t:'Decline of major Indus cities begins'},
    {y:'321 BCE', t:'Maurya Empire founded in India'},
  ]},
  { era:'Medieval', range:'500 – 1500 CE', events:[
    {y:'850 CE', t:'Chola dynasty rises to prominence in South India'},
    {y:'1206 CE', t:'Delhi Sultanate established'},
    {y:'1336 CE', t:'Vijayanagara Empire founded'},
    {y:'1453 CE', t:'Fall of Constantinople'},
  ]},
  { era:'Early Modern', range:'1500 – 1800 CE', events:[
    {y:'1526 CE', t:'Mughal Empire founded by Babur'},
    {y:'1600 CE', t:'English East India Company chartered'},
    {y:'1653 CE', t:'Taj Mahal completed'},
    {y:'1789 CE', t:'French Revolution begins'},
  ]},
  { era:'Modern', range:'1800 – 1950 CE', events:[
    {y:'1760s CE', t:'Industrial Revolution begins in Britain'},
    {y:'1905 CE', t:'Swadeshi Movement begins in Bengal'},
    {y:'1920 CE', t:'Non-Cooperation Movement launched'},
    {y:'1939 CE', t:'World War II begins'},
    {y:'1942 CE', t:'Quit India Movement launched'},
    {y:'1947 CE', t:'India gains independence'},
    {y:'1950 CE', t:'Constitution of India comes into effect'},
  ]},
];

/* ---------------- Glossary ---------------- */
const GLOSSARY_DATA = [
  {term:'Archaeology', pron:'ar-kee-OL-oh-jee', def:'The scientific study of past human life through excavation and analysis of physical remains such as tools, buildings and artifacts.'},
  {term:'Artifact', pron:'AR-tih-fakt', def:'An object made or used by humans in the past, recovered and studied as historical evidence.'},
  {term:'Barter', pron:'BAR-ter', def:'Exchanging goods or services directly without using money.'},
  {term:'Citadel', pron:'SIT-uh-del', def:'A fortified elevated area within a city, often housing important buildings, seen in Indus Valley cities.'},
  {term:'Constituent Assembly', pron:'kon-STIT-yoo-ent uh-SEM-blee', def:'The body elected to draft the Constitution of India between 1946 and 1949.'},
  {term:'Directive Principles', pron:'dy-REK-tiv PRIN-sih-pulz', def:'Guidelines in the Indian Constitution directing the state toward social and economic welfare goals.'},
  {term:'Feudalism', pron:'FYOO-duh-liz-um', def:'A medieval social system organising land and loyalty through relationships between lords and vassals.'},
  {term:'Hieroglyphics', pron:'hy-ro-GLIF-iks', def:'A writing system of pictorial symbols used in Ancient Egypt.'},
  {term:'Industrialisation', pron:'in-dus-tree-uh-lai-ZAY-shun', def:'The large-scale shift from manual and agrarian production to machine-based manufacturing.'},
  {term:'Mansabdar', pron:'MAN-sub-dar', def:'A Mughal official holding a ranked administrative and military position under the Mansabdari system.'},
  {term:'Mummification', pron:'muh-mih-fih-KAY-shun', def:'The Ancient Egyptian process of preserving a body for the afterlife.'},
  {term:'Non-Cooperation', pron:'non-koh-op-uh-RAY-shun', def:'A strategy of withdrawing support from British institutions during the Indian independence movement.'},
  {term:'Silt', pron:'SILT', def:'Fine fertile soil deposited by flooding rivers such as the Nile, vital to ancient agriculture.'},
  {term:'Standardisation', pron:'stan-dar-dy-ZAY-shun', def:'Establishing uniform measures, such as Indus Valley weights and bricks, to enable trade and construction.'},
  {term:'Suffrage', pron:'SUF-rij', def:'The right to vote in political elections.'},
  {term:'Tribunal', pron:'try-BYOO-nal', def:'A body established to settle disputes, relevant to governance and constitutional systems.'},
];

/* ---------------- Digital museum artifacts ---------------- */
const MUSEUM_DATA = [
  {id:'seal', name:'Pashupati Seal', era:'Indus Valley, c. 2500 BCE', material:'Steatite',
    desc:'A carved seal depicting a seated figure surrounded by animals, widely studied for clues about Indus religious life.', color:'#C49A4E'},
  {id:'ankh', name:'Ankh Amulet', era:'Ancient Egypt, c. 1500 BCE', material:'Faience',
    desc:'A symbol representing life, commonly worn as an amulet and depicted in the hands of Egyptian deities.', color:'#D98E2B'},
  {id:'coin-chola', name:'Chola Gold Coin', era:'Medieval India, c. 1000 CE', material:'Gold',
    desc:'Coinage from the Chola dynasty, evidence of a sophisticated maritime trade economy in South India.', color:'#E8C77A'},
  {id:'miniature', name:'Mughal Miniature Painting', era:'Mughal Empire, c. 1600 CE', material:'Pigment on paper',
    desc:'A detailed court painting illustrating Mughal patronage of the arts and elaborate visual storytelling.', color:'#7A2434'},
  {id:'spindle', name:'Spinning Jenny Model', era:'Industrial Revolution, 1764 CE', material:'Wood & iron',
    desc:'A model of the multi-spindle spinning frame that mechanised textile production in Britain.', color:'#8B8378'},
  {id:'cockade', name:'Revolutionary Cockade', era:'French Revolution, 1789 CE', material:'Fabric ribbon',
    desc:'A tri-colour rosette worn as a symbol of allegiance to the Revolution.', color:'#2C4A7C'},
  {id:'charkha', name:'Charkha (Spinning Wheel)', era:'Indian Freedom Movement, 1920s', material:'Wood',
    desc:'A hand-spinning wheel that became a powerful symbol of self-reliance during the freedom movement.', color:'#3E5C3A'},
  {id:'constitution-pen', name:'Constituent Assembly Pen', era:'Republic of India, 1950 CE', material:'Metal & ink',
    desc:'Representative of the instruments used to sign the founding document of the Republic of India.', color:'#C49A4E'},
];
