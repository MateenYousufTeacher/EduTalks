/* ============================================================
   SIMULATION METADATA — text content for every experiment
   (Interactive stage logic lives in js/simulations/*.js)
   ============================================================ */

const ICONS = {
  atom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="10" ry="4.2"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  bond: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/></svg>`,
  flask: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 2v6L4 20a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L15 8V2"/><line x1="9" y1="2" x2="15" y2="2"/><line x1="8" y1="14" x2="16" y2="14"/></svg>`,
  reaction: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h6M14 12h6M9 7l-3 5 3 5M15 7l3 5-3 5"/></svg>`,
  scale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M5 8l-3 6a4 4 0 0 0 6 0zM19 8l-3 6a4 4 0 0 0 6 0zM5 8h14M8 21h8"/></svg>`,
  metal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="9" width="18" height="6" rx="1"/><path d="M7 9V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 3H2l8 9.46V19l4 2v-8.54z"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  carbon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="6" r="2.4"/><circle cx="6" cy="16" r="2.4"/><circle cx="18" cy="16" r="2.4"/><line x1="12" y1="8.4" x2="7.4" y2="14.2"/><line x1="12" y1="8.4" x2="16.6" y2="14.2"/><line x1="8.4" y1="16" x2="15.6" y2="16"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/></svg>`,
  glossary: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><line x1="8" y1="7" x2="15" y2="7"/><line x1="8" y1="11" x2="13" y2="11"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`,
  lightbulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 2z"/></svg>`,
  warn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>`,
  world: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
};

const SIM_LIST = [
  {id:'atomic', num:1, title:'Atomic Structure Explorer', subtitle:'Build atoms · isotopes · ions', icon:ICONS.atom, color:'linear-gradient(135deg,#1976D2,#0D47A1)'},
  {id:'periodic', num:2, title:'Interactive Periodic Table', subtitle:'118 elements · trends · quiz', icon:ICONS.grid, color:'linear-gradient(135deg,#26C6DA,#1976D2)'},
  {id:'bonding', num:3, title:'Chemical Bonding Laboratory', subtitle:'Ionic · covalent · metallic', icon:ICONS.bond, color:'linear-gradient(135deg,#43A047,#1976D2)'},
  {id:'phlab', num:4, title:'Acids, Bases & pH Laboratory', subtitle:'Indicators · titration · pH', icon:ICONS.flask, color:'linear-gradient(135deg,#E53935,#FFB300)'},
  {id:'reactions', num:5, title:'Chemical Reactions Laboratory', subtitle:'5 reaction types · live equations', icon:ICONS.reaction, color:'linear-gradient(135deg,#FFB300,#E53935)'},
  {id:'balancing', num:6, title:'Balancing Equations Studio', subtitle:'Atom counting · practice problems', icon:ICONS.scale, color:'linear-gradient(135deg,#1976D2,#26C6DA)'},
  {id:'metals', num:7, title:'Metals & Non-Metals Laboratory', subtitle:'Reactivity · conductivity · tests', icon:ICONS.metal, color:'linear-gradient(135deg,#5B6579,#212121)'},
  {id:'separation', num:8, title:'Separation of Mixtures Laboratory', subtitle:'Filtration · distillation · chroma.', icon:ICONS.filter, color:'linear-gradient(135deg,#26C6DA,#43A047)'},
  {id:'electrolysis', num:9, title:'Electrolysis Laboratory', subtitle:'Ion movement · electrode reactions', icon:ICONS.bolt, color:'linear-gradient(135deg,#FFB300,#1976D2)'},
  {id:'carbon', num:10, title:'Carbon Compounds Explorer', subtitle:'Hydrocarbons · functional groups', icon:ICONS.carbon, color:'linear-gradient(135deg,#43A047,#26C6DA)'},
];

const SIM_CONTENT = {
  atomic:{
    objectives:[
      'Construct atoms by adding or removing protons, neutrons and electrons.',
      'Distinguish between atomic number (Z) and mass number (A).',
      'Explain how isotopes of the same element differ.',
      'Predict ion charge from electron gain or loss and relate it to stability.',
      'Read a simplified Bohr shell diagram and write electronic configuration (2, 8, 8…).'
    ],
    introduction:'Every substance you have ever touched is built from atoms — particles so small that a full stop on this page contains billions of them. In this lab you will build your own atoms, proton by proton, and watch how adding or removing sub-atomic particles changes what element you have, whether it is a stable isotope, and whether it becomes a charged ion.',
    theory:`<p><b>An atom</b> has a tiny, dense <b>nucleus</b> containing positively charged <b>protons</b> and neutral <b>neutrons</b>, surrounded by fast-moving, negatively charged <b>electrons</b> in shells.</p>
      <p><b>Atomic number (Z)</b> = number of protons. It defines the element. <b>Mass number (A)</b> = protons + neutrons.</p>
      <p>Electrons fill shells in the order 2, 8, 8, 18 (Bohr model, simplified). The outermost shell is the <b>valence shell</b> and controls chemical behaviour.</p>
      <p><b>Isotopes</b> have the same number of protons but different numbers of neutrons — same element, different mass. <b>Ions</b> form when atoms gain electrons (anions, negative) or lose electrons (cations, positive) to reach a stable, often full, outer shell.</p>`,
    applications:['Carbon-14 dating of fossils uses a radioactive isotope of carbon.','Medical imaging (PET scans) uses short-lived isotopes.','Ion formation explains table salt (Na⁺Cl⁻) and battery chemistry.','Isotope enrichment is used in nuclear power generation.'],
    safety:['This is a simulated atom — no real radioactive material is involved.','In a real lab, radioactive isotopes are handled only by trained personnel with shielding.','Always wash hands after handling any laboratory chemicals, even non-radioactive ones.'],
    mistakes:['Confusing atomic number with mass number.','Forgetting that the number of protons never changes for a given element — only neutrons and electrons can vary.','Assuming all ions are dangerous — most ions (Na⁺, Cl⁻, Ca²⁺) are essential to life.'],
    facts:['A helium atom is so stable that it almost never reacts — its outer shell is completely full with just 2 electrons.','Hydrogen is the only element that can have a "isotope with no neutrons" — protium.','If an atom\'s nucleus were the size of a marble, the whole atom would be the size of a football stadium.'],
    quiz:[
      {q:'What determines the identity of an element?',options:['Number of neutrons','Number of protons','Number of electrons only','Mass number'],correct:1,explain:'The number of protons (atomic number) uniquely identifies an element.'},
      {q:'Two atoms have the same number of protons but different numbers of neutrons. They are:',options:['Ions','Isotopes','Isomers','Allotropes'],correct:1,explain:'Isotopes share proton number but differ in neutron number, giving different mass numbers.'},
      {q:'An atom that loses one electron becomes:',options:['A neutral atom','An anion (−1)','A cation (+1)','A different element'],correct:2,explain:'Losing a negative electron leaves a net positive charge — a cation.'},
      {q:'Which shell filling order is used in the simplified Bohr model?',options:['2, 6, 8','2, 8, 8, 18','8, 8, 2','2, 4, 8'],correct:1,explain:'Shells fill as 2, 8, 8, 18 in the simplified school-level model.'},
      {q:'Mass number equals:',options:['Protons − neutrons','Protons + electrons','Protons + neutrons','Electrons only'],correct:2,explain:'Mass number (A) = number of protons + number of neutrons.'}
    ],
    summary:'Atoms are built from protons, neutrons and electrons. Protons fix identity; neutrons create isotopes; electrons determine charge and chemical behaviour. A full or stable outer shell is the driving force behind ion formation and bonding, which you will explore next in the Bonding Laboratory.'
  },

  periodic:{
    objectives:['Navigate the periodic table by group, period and category.','Identify metals, non-metals, metalloids and noble gases by position.','Read atomic number, symbol and category for any element.','Compare properties such as atomic radius and electronegativity across a period and down a group.'],
    introduction:'The periodic table is chemistry\'s most powerful map — every element\'s properties can be predicted just from its address. Search, filter and click through all 118 elements to explore trends that took scientists over a century to uncover.',
    theory:`<p>Elements are arranged in order of increasing <b>atomic number</b>. Rows are called <b>periods</b> (energy levels); columns are called <b>groups</b> (similar valence electrons, similar chemistry).</p>
      <p><b>Metals</b> (left/centre) are shiny, malleable and conduct electricity. <b>Non-metals</b> (upper right) are typically dull and poor conductors. <b>Metalloids</b> sit on the zig-zag border and show intermediate properties. <b>Noble gases</b> (Group 18) have full outer shells and are largely unreactive.</p>
      <p><b>Trends:</b> atomic radius decreases across a period (more nuclear pull) and increases down a group (more shells). Electronegativity and ionization energy generally increase across a period and decrease down a group.</p>`,
    applications:['Predicting reactivity before mixing chemicals.','Designing alloys by choosing metals with complementary properties.','Selecting semiconductors (metalloids like silicon) for electronics.','Understanding why noble gases are used in lighting and welding shielding.'],
    safety:['No physical chemicals are used — this is a reference tool.','In real labs, always check an element\'s hazard data sheet before use.'],
    mistakes:['Assuming group number always equals valence electrons for transition metals — it does not.','Confusing period (row) with group (column).','Thinking metalloids behave exactly like metals — they are intermediate.'],
    facts:['Francium is so rare that less than 30 grams likely exist on Earth at any moment.','Hydrogen is placed in Group 1 but behaves quite differently from other alkali metals.','Only two elements are liquid at room temperature: mercury and bromine.'],
    quiz:[
      {q:'Elements in the same column of the periodic table are called a:',options:['Period','Series','Group','Block'],correct:2,explain:'Columns are groups; elements in a group share similar valence electron counts and chemistry.'},
      {q:'Atomic radius generally _____ across a period (left to right).',options:['Increases','Decreases','Stays the same','Doubles'],correct:1,explain:'Increasing nuclear charge pulls electrons closer, shrinking radius across a period.'},
      {q:'Which category sits on the zig-zag line and shows properties of both metals and non-metals?',options:['Noble gases','Metalloids','Halogens','Lanthanides'],correct:1,explain:'Metalloids like silicon and germanium have intermediate metallic/non-metallic character.'},
      {q:'Group 18 elements are known for being:',options:['Highly reactive','Unreactive (inert)','Radioactive','Liquid at room temperature'],correct:1,explain:'Noble gases have full valence shells, making them chemically stable and largely unreactive.'},
      {q:'Which quantity increases down a group due to added electron shells?',options:['Electronegativity','Ionization energy','Atomic radius','Reactivity of non-metals'],correct:2,explain:'Extra shells added down a group increase atomic radius.'}
    ],
    summary:'The periodic table organises all known elements by atomic number into periods and groups, revealing predictable trends in radius, reactivity and electronegativity that underpin the rest of chemistry.'
  },

  bonding:{
    objectives:['Differentiate ionic, covalent and metallic bonding.','Predict bond type from the position of elements in the periodic table.','Draw simple Lewis dot structures for small molecules.','Explain why atoms bond in terms of achieving stable electron configurations.'],
    introduction:'Atoms rarely exist alone — they bond to become more stable. Drag atoms together in this lab and watch electrons transfer or share in real time, then read off the resulting bond type and simple Lewis structure.',
    theory:`<p><b>Ionic bonding</b>: a metal transfers electrons to a non-metal, forming oppositely charged ions held together by electrostatic attraction (e.g. Na⁺Cl⁻).</p>
      <p><b>Covalent bonding</b>: two non-metals share electron pairs, each filling its outer shell (e.g. H₂O, CO₂). Sharing can be single, double or triple.</p>
      <p><b>Metallic bonding</b>: metal atoms release valence electrons into a shared "sea of electrons" surrounding positive metal ions — explaining conductivity and malleability.</p>
      <p><b>Polarity</b> arises in covalent bonds when atoms share electrons unequally due to differing electronegativity, giving molecules like water a partial positive and negative end.</p>`,
    applications:['Table salt (ionic) dissolves in water and conducts electricity as ions.','Water (covalent, polar) is the universal solvent of life due to hydrogen bonding.','Copper wiring relies on metallic bonding for excellent conductivity.','Diamond\'s covalent network gives it extreme hardness.'],
    safety:['This experiment is entirely virtual — no reactive metals or gases are handled.','Real alkali metals (like sodium) react violently with water and require expert handling.'],
    mistakes:['Thinking all bonds between two different elements are ionic — metal + non-metal is the key rule.','Forgetting that covalent bonds can be double or triple, not just single.','Assuming metallic bonds involve fixed electron pairs like covalent bonds — electrons are delocalised instead.'],
    facts:['A single water molecule can form up to four hydrogen bonds with its neighbours.','Diamond and graphite are both pure carbon, but different bonding arrangements make one the hardest natural material and the other a lubricant.','Metallic bonding is why gold can be hammered into sheets thin enough to see through.'],
    quiz:[
      {q:'Ionic bonds typically form between:',options:['Two metals','Two non-metals','A metal and a non-metal','Two noble gases'],correct:2,explain:'Electron transfer from a metal to a non-metal creates oppositely charged ions.'},
      {q:'In a covalent bond, atoms:',options:['Transfer electrons completely','Share pairs of electrons','Lose all electrons','Form a sea of electrons'],correct:1,explain:'Covalent bonding involves sharing electron pairs between non-metal atoms.'},
      {q:'Which bonding type explains why metals conduct electricity so well?',options:['Ionic','Covalent','Metallic','Hydrogen bonding'],correct:2,explain:'Delocalised "sea" electrons in metallic bonding move freely, carrying current.'},
      {q:'A double covalent bond involves sharing how many electrons?',options:['2','4','6','8'],correct:1,explain:'A double bond is two shared pairs — 4 electrons total.'},
      {q:'Water is a polar molecule because:',options:['It is ionic','Oxygen and hydrogen share electrons unequally','It has a metallic core','It has no bonds'],correct:1,explain:'Oxygen is more electronegative than hydrogen, pulling shared electrons closer and creating partial charges.'}
    ],
    summary:'Bonding is driven by atoms seeking stable outer shells. Metals and non-metals form ionic bonds through electron transfer; non-metals pair up through covalent sharing; metals bond to each other through a shared electron sea — each giving rise to distinct physical properties.'
  },

  phlab:{
    objectives:['Use indicators (litmus, universal indicator, pH meter) to classify solutions.','Explain the pH scale from 0 (strongly acidic) to 14 (strongly basic).','Observe and explain a neutralisation reaction.','Relate concentration to the strength of colour change and pH value.'],
    introduction:'Is lemon juice really that acidic? Is soap really basic? Drop virtual indicators into a range of household and laboratory solutions, mix acids with bases, and watch the pH meter and colour respond instantly.',
    theory:`<p>The <b>pH scale</b> (0–14) measures how acidic or basic a solution is, based on the concentration of H⁺ ions. pH 7 is neutral (pure water); below 7 is acidic; above 7 is basic (alkaline).</p>
      <p><b>Litmus paper</b> turns red in acid, blue in base. <b>Universal indicator</b> gives a full rainbow of colours corresponding to specific pH values. A <b>pH meter</b> gives a precise numerical reading using an electrode.</p>
      <p><b>Neutralisation</b>: Acid + Base → Salt + Water. As an acid and base are mixed, H⁺ and OH⁻ ions combine to form neutral water, moving the pH toward 7.</p>`,
    applications:['Antacid tablets neutralise excess stomach acid (HCl).','Farmers test and adjust soil pH for healthy crops.','Swimming pool pH is monitored to keep water safe and effective.','Industrial waste water is neutralised before release to protect rivers.'],
    safety:['Never taste or smell laboratory acids or bases in real life.','Always add acid to water, never water to concentrated acid, to avoid dangerous spattering.','Wear gloves and goggles when handling real acids/bases; wash any spill immediately with plenty of water.'],
    mistakes:['Assuming all acids are dangerous — citric acid in lemons is a weak acid, safe to eat.','Confusing "strong" acid (fully ionises) with "concentrated" acid (large amount dissolved) — they are different ideas.','Forgetting that pH 7 is neutral, not the midpoint of "safe vs unsafe".'],
    facts:['Stomach acid has a pH of about 1.5–3.5 — strong enough to dissolve metal over time!','Pure water has a pH of 7 only at 25 °C — it shifts slightly with temperature.','Universal indicator is actually a mixture of several different dyes.'],
    quiz:[
      {q:'A solution with pH 3 is:',options:['Strongly basic','Neutral','Acidic','Impossible'],correct:2,explain:'Any pH below 7 indicates an acidic solution.'},
      {q:'Litmus paper turns which colour in a base?',options:['Red','Blue','Green','Colourless'],correct:1,explain:'Blue litmus stays blue and red litmus turns blue in basic solutions.'},
      {q:'The products of an acid-base neutralisation are:',options:['Acid + water','Salt + water','Base + gas','Only heat'],correct:1,explain:'Acid + Base → Salt + Water is the general neutralisation equation.'},
      {q:'Pure water has a pH of approximately:',options:['0','7','10','14'],correct:1,explain:'Pure water is neutral with pH ≈ 7 at 25°C.'},
      {q:'Which tool gives the most precise pH reading?',options:['Litmus paper','Universal indicator paper','pH meter','Smell test'],correct:2,explain:'A calibrated pH meter provides a precise numerical value, unlike colour-based indicators.'}
    ],
    summary:'The pH scale quantifies acidity and basicity through H⁺ concentration. Indicators reveal this through colour, while neutralisation reactions between acids and bases produce salt and water, driving pH toward neutral.'
  },

  reactions:{
    objectives:['Classify a reaction as combination, decomposition, displacement, double displacement or combustion.','Predict products from given reactants for common reaction types.','Observe physical evidence of a chemical reaction (colour change, gas, precipitate, heat).','Read and interpret a balanced chemical equation.'],
    introduction:'Choose two reactants and watch the laboratory come alive — bubbles rise, colours shift, precipitates form and heat is released or absorbed. Behind every visual change lies a balanced equation you can read live.',
    theory:`<p><b>Combination</b>: A + B → AB (two substances join into one).</p>
      <p><b>Decomposition</b>: AB → A + B (one substance breaks into two or more, often needing heat).</p>
      <p><b>Displacement</b>: A + BC → AC + B (a more reactive element displaces a less reactive one).</p>
      <p><b>Double displacement</b>: AB + CD → AD + CB (ions swap partners, often producing a precipitate).</p>
      <p><b>Combustion</b>: fuel + O₂ → CO₂ + H₂O + energy (rapid oxidation releasing heat and light).</p>
      <p>Evidence of a chemical change includes colour change, gas bubbles, precipitate formation, temperature change, and light or sound.</p>`,
    applications:['Combustion reactions power car engines and cook our food.','Displacement reactions are used to extract metals like iron from ore.','Double displacement reactions produce insoluble pigments used in paint.','Decomposition of limestone (CaCO₃) produces lime used in construction.'],
    safety:['Never mix unknown household chemicals — some combinations release toxic gases.','Combustion and highly reactive metal reactions must only be performed by trained teachers with proper shielding.','Always work in a ventilated space and keep a fire extinguisher nearby during real combustion demonstrations.'],
    mistakes:['Assuming heat is always released — some reactions absorb heat (endothermic).','Forgetting that combustion always requires oxygen as a reactant.','Believing a colour change always means a new substance formed — sometimes it is just dissolving.'],
    facts:['The thermite reaction (iron oxide + aluminium) burns above 2500°C and is used to weld railway tracks.','Photosynthesis is essentially the reverse of combustion — it stores energy instead of releasing it.','Some decomposition reactions are triggered by light, not just heat — this is how photographic film develops.'],
    quiz:[
      {q:'A + B → AB is the general form of a:',options:['Decomposition reaction','Combination reaction','Displacement reaction','Combustion reaction'],correct:1,explain:'Combination reactions join two or more substances into a single product.'},
      {q:'Which reaction type produces a precipitate when two solutions are mixed?',options:['Combustion','Decomposition','Double displacement','Combination'],correct:2,explain:'Double displacement reactions swap ion partners, frequently forming an insoluble precipitate.'},
      {q:'Combustion reactions always require which reactant?',options:['Water','Oxygen','An acid','A catalyst'],correct:1,explain:'Combustion is rapid oxidation — it requires oxygen gas.'},
      {q:'A more reactive metal replacing a less reactive metal in a compound is called:',options:['Decomposition','Displacement','Neutralisation','Sublimation'],correct:1,explain:'This is a (single) displacement reaction, driven by relative reactivity.'},
      {q:'Which of these is physical evidence a chemical reaction has occurred?',options:['The substance got heavier only','Gas bubbles forming','The container changed shape','Nothing changed'],correct:1,explain:'Gas evolution is one of the classic signs of a chemical reaction.'}
    ],
    summary:'Chemical reactions fall into recognisable patterns — combination, decomposition, displacement, double displacement and combustion — each with characteristic evidence and a balanced equation describing exactly how atoms rearrange.'
  },

  balancing:{
    objectives:['Apply the Law of Conservation of Mass to chemical equations.','Balance simple to moderately complex equations using coefficients.','Count atoms of each element on both sides of an equation.','Practice with auto-generated problems of increasing difficulty.'],
    introduction:'A chemical equation is a promise: atoms in must equal atoms out. Adjust coefficients until every element balances perfectly, guided by live atom counters and instant validation.',
    theory:`<p>The <b>Law of Conservation of Mass</b> states that matter cannot be created or destroyed in a chemical reaction — the same number of atoms of each element must appear on both sides of the equation.</p>
      <p>To balance an equation, you may only change the <b>coefficients</b> (the numbers in front of formulas) — never the subscripts inside a formula, since that would change the substance itself.</p>
      <p>A good strategy: balance elements that appear in only one compound on each side first, save free elements (like O₂, H₂) for last, and use the smallest whole-number ratio.</p>`,
    applications:['Balanced equations let engineers calculate exact reactant quantities for industrial processes.','Pharmacists rely on balanced equations to synthesise precise drug compounds.','Balancing rocket fuel combustion equations ensures efficient, safe propulsion.','Balanced photosynthesis and respiration equations underpin ecosystem carbon cycling models.'],
    safety:['This is a paper/virtual exercise — no chemicals are involved in balancing practice.','Understanding balanced equations helps predict hazardous by-products before real experiments.'],
    mistakes:['Changing a subscript instead of a coefficient — this creates an entirely different (often wrong) substance.','Forgetting to balance polyatomic ions as a single unit when they appear unchanged on both sides.','Stopping before reaching the smallest whole-number ratio of coefficients.'],
    facts:['Antoine Lavoisier, the "father of modern chemistry," established the Law of Conservation of Mass in the 1780s.','Some equations, like those for combustion of large hydrocarbons, can require coefficients greater than 10.','Balancing by inspection (trial and error) is the same method professional chemists use for simple equations.'],
    quiz:[
      {q:'The Law of Conservation of Mass states that:',options:['Mass can be created but not destroyed','Atoms are created and destroyed freely','Atoms are neither created nor destroyed in a reaction','Only gases conserve mass'],correct:2,explain:'Total atoms of each element must be equal before and after the reaction.'},
      {q:'When balancing, you are only allowed to change:',options:['Subscripts','Coefficients','Element symbols','Reaction arrows'],correct:1,explain:'Changing subscripts would alter the chemical identity of a substance; only coefficients may change.'},
      {q:'In 2H₂ + O₂ → 2H₂O, how many hydrogen atoms are on the reactant side?',options:['2','4','6','8'],correct:1,explain:'2H₂ contains 2 × 2 = 4 hydrogen atoms.'},
      {q:'A correctly balanced equation should use:',options:['The largest possible coefficients','Fractional coefficients only','The smallest whole-number coefficient ratio','No coefficients at all'],correct:2,explain:'Standard convention uses the smallest whole-number ratio of coefficients.'},
      {q:'Which should generally be balanced last in a combustion equation?',options:['Carbon','Hydrogen','Free oxygen (O₂)','Nitrogen'],correct:2,explain:'Balancing free diatomic elements like O₂ last, after other elements are fixed, is an efficient strategy.'}
    ],
    summary:'Balancing equations is the practical application of the Law of Conservation of Mass — a systematic skill of counting atoms and adjusting coefficients until both sides match exactly.'
  },

  metals:{
    objectives:['Compare physical properties of metals and non-metals: lustre, conductivity, malleability, ductility, density.','Predict reactivity of a metal with water and dilute acid.','Interpret a simple reactivity series.','Identify a metal using a simulated flame test colour.'],
    introduction:'Not all elements are created equal. Run a series of quick virtual tests — hammer, wire-draw, heat, and react with water or acid — to build a property profile that separates metals from non-metals, and rank metals by reactivity.',
    theory:`<p><b>Metals</b> are typically lustrous, malleable (hammer into sheets), ductile (drawn into wires), good conductors of heat and electricity, and mostly solid at room temperature (except mercury).</p>
      <p><b>Non-metals</b> are usually dull, brittle when solid, poor conductors (except graphite), and exist in all three states at room temperature.</p>
      <p>The <b>reactivity series</b> ranks metals by how readily they lose electrons: potassium and sodium react violently with cold water; magnesium and zinc react with steam or acids; copper, silver and gold are far less reactive ("noble" metals).</p>
      <p><b>Flame tests</b> use characteristic colours emitted when metal ions are heated — a simple identification tool.</p>`,
    applications:['Reactivity series guides the extraction method used for different metals (electrolysis vs. reduction with carbon).','Copper\'s excellent conductivity makes it the standard for electrical wiring.','Gold\'s low reactivity is why ancient gold artefacts still shine today.','Flame tests are used by fire investigators and fireworks manufacturers to identify or select metal salts.'],
    safety:['Real reactions of alkali metals (K, Na) with water are violent and must only be performed by a qualified teacher behind a safety screen.','Flame tests require eye protection — never look directly into a bright flame for extended periods.','Dilute acids used in real metal-reactivity tests should be handled with gloves and goggles.'],
    mistakes:['Assuming all metals react with water — gold and copper do not react under normal conditions.','Confusing malleability (sheets) with ductility (wires) — they describe different deformations.','Believing shiny always means metal — some non-metallic minerals can also appear lustrous.'],
    facts:['Sodium is so reactive it is stored under oil to prevent contact with air and moisture.','Gold is so unreactive that pure gold jewellery thousands of years old is still found untarnished.','Graphite, a non-metal, is one of the few non-metals that conducts electricity, due to delocalised electrons between its layers.'],
    quiz:[
      {q:'Which property describes a metal being hammered into thin sheets?',options:['Ductility','Malleability','Conductivity','Lustre'],correct:1,explain:'Malleability is the ability to be beaten into sheets without breaking.'},
      {q:'Which metal is commonly stored under oil due to extreme reactivity?',options:['Gold','Copper','Sodium','Silver'],correct:2,explain:'Sodium reacts vigorously with moisture and oxygen in air, so it is stored under oil.'},
      {q:'A non-metal that conducts electricity is:',options:['Sulfur','Graphite (carbon)','Oxygen','Chlorine'],correct:1,explain:'Graphite\'s layered structure allows delocalised electrons to conduct electricity, unusual for a non-metal.'},
      {q:'In the reactivity series, gold is positioned:',options:['At the very top (most reactive)','In the middle','Near the bottom (least reactive)','It is not a metal'],correct:2,explain:'Gold is one of the least reactive ("noble") metals, resistant to corrosion.'},
      {q:'Flame tests identify metal ions based on:',options:['Their smell','Characteristic emitted light colour','Their weight','Their magnetism'],correct:1,explain:'Excited electrons emit characteristic wavelengths (colours) of light as they return to lower energy levels.'}
    ],
    summary:'Metals and non-metals differ sharply in physical behaviour and reactivity. The reactivity series predicts how vigorously a metal reacts with water or acid, guiding both laboratory safety and industrial extraction methods.'
  },

  separation:{
    objectives:['Match a separation technique to the properties of a given mixture.','Explain the working principle of filtration, distillation, chromatography and magnetic separation.','Set up virtual apparatus correctly for each technique.','Predict which component of a mixture will be recovered first.'],
    introduction:'Mixtures are everywhere — muddy water, salt water, ink, sand and iron filings. Drag the right apparatus onto the bench, choose your mixture, and run the separation to recover pure components.',
    theory:`<p><b>Filtration</b> separates an insoluble solid from a liquid using filter paper (particle size difference).</p>
      <p><b>Sedimentation & decantation</b> let denser insoluble particles settle before the liquid is poured off.</p>
      <p><b>Evaporation</b> recovers a dissolved solid by boiling away the solvent, leaving crystals behind.</p>
      <p><b>Distillation</b> separates miscible liquids with different boiling points — the lower-boiling liquid vaporises first and is condensed separately.</p>
      <p><b>Chromatography</b> separates dissolved substances (like ink dyes) based on differing solubility and adsorption as they travel up absorbent paper.</p>
      <p><b>Magnetic separation</b> removes magnetic materials (like iron) from a mixture using a magnet. <b>Sieving</b> separates solids of different particle sizes.</p>`,
    applications:['Water treatment plants use filtration and sedimentation to purify drinking water.','Distillation produces petrol, diesel and kerosene from crude oil.','Forensic scientists use chromatography to analyse ink and identify drugs.','Recycling plants use magnetic separation to recover scrap iron from mixed waste.'],
    safety:['Distillation involves heating — always use a stand and never leave a heat source unattended.','Ensure a distillation setup is never fully sealed, to avoid pressure build-up.','Handle glass apparatus (funnels, flasks, condensers) carefully to avoid breakage.'],
    mistakes:['Choosing evaporation for a mixture of two liquids instead of distillation.','Using filtration for a mixture where the solid is actually dissolved (it would pass straight through).','Forgetting that chromatography needs a solvent that does not react with the substances being separated.'],
    facts:['Large-scale fractional distillation towers at oil refineries can be over 50 metres tall.','Paper chromatography was first properly developed in the early 20th century and is still used to check the purity of dyes today.','A single grain of sand can be separated from salt water using nothing more than filter paper and evaporation.'],
    quiz:[
      {q:'Which technique separates an insoluble solid from a liquid using filter paper?',options:['Distillation','Filtration','Chromatography','Magnetic separation'],correct:1,explain:'Filtration relies on filter paper pores being too small for solid particles to pass through.'},
      {q:'Distillation separates liquids based on differences in:',options:['Colour','Density only','Boiling point','Magnetism'],correct:2,explain:'The liquid with the lower boiling point vaporises first and is collected separately.'},
      {q:'Chromatography is especially useful for separating:',options:['Iron filings from sand','Dissolved dyes/pigments in a mixture','Oil from water','Salt from sand'],correct:1,explain:'Chromatography separates dissolved coloured substances based on differing solubility/adsorption.'},
      {q:'To recover salt dissolved in water, the best technique is:',options:['Filtration','Magnetic separation','Evaporation','Sieving'],correct:2,explain:'Evaporating the water leaves the dissolved salt behind as crystals.'},
      {q:'Sieving separates mixtures based on:',options:['Boiling point','Particle size','Colour','Magnetism'],correct:1,explain:'A sieve has holes of a set size, letting smaller particles pass while retaining larger ones.'}
    ],
    summary:'Choosing the right separation technique depends entirely on the physical properties of the mixture — particle size, solubility, density, boiling point, or magnetism — a decision-making skill with huge real-world importance in purification and recycling.'
  },

  electrolysis:{
    objectives:['Explain how an electric current drives a non-spontaneous chemical reaction.','Predict products at the anode and cathode for water and copper sulfate electrolysis.','Describe the role of voltage, current and electrolyte concentration in electrolysis rate.','Relate ion movement to electrode charge.'],
    introduction:'Electricity can split apart even the most stable compounds. Set the voltage, choose your electrolyte and electrodes, then watch ions race toward oppositely charged electrodes as gases bubble and metal plates out.',
    theory:`<p><b>Electrolysis</b> uses direct electric current to drive a non-spontaneous chemical reaction, splitting an ionic compound (electrolyte) into its elements.</p>
      <p>The <b>cathode</b> (negative electrode) attracts positive ions (cations), where <b>reduction</b> (gain of electrons) occurs. The <b>anode</b> (positive electrode) attracts negative ions (anions), where <b>oxidation</b> (loss of electrons) occurs.</p>
      <p>In <b>water electrolysis</b>: hydrogen gas forms at the cathode, oxygen gas at the anode, in a 2:1 volume ratio.</p>
      <p>In <b>copper sulfate electrolysis</b> with copper electrodes: copper is deposited at the cathode and dissolved from the anode — used in electroplating and purification.</p>
      <p>Increasing <b>voltage</b> or <b>electrolyte concentration</b> generally increases the rate of ion movement and product formation.</p>`,
    applications:['Electroplating uses electrolysis to coat cheaper metals with a thin layer of gold, silver or chromium.','Aluminium is extracted from molten bauxite ore using large-scale electrolysis.','Electrolysis of brine (salt water) industrially produces chlorine gas and sodium hydroxide.','Hydrogen fuel production increasingly uses water electrolysis powered by renewable electricity.'],
    safety:['Hydrogen and oxygen gas mixtures can be explosive — real electrolysis demonstrations must be done in small, ventilated, controlled setups.','Never touch electrodes while current is flowing.','Copper sulfate solution is toxic if ingested — always wash hands after handling.'],
    mistakes:['Confusing anode and cathode — remembering "cathode = cations, reduction" helps (both start differently but pair correctly: reduction happens at cathode).','Assuming electrolysis always produces gases — in copper sulfate electrolysis with copper electrodes, metal is deposited, not gas.','Forgetting that pure water conducts poorly — a small amount of acid or salt (electrolyte) is needed to carry current.'],
    facts:['Humphry Davy used electrolysis in the early 1800s to discover several elements, including sodium and potassium.','Aluminium was once more valuable than gold until electrolysis made its extraction cheap and practical.','The hydrogen-to-oxygen volume ratio in water electrolysis (2:1) directly reflects water\'s formula, H₂O.'],
    quiz:[
      {q:'At which electrode does reduction (gain of electrons) occur?',options:['Anode','Cathode','Both equally','Neither'],correct:1,explain:'Cations are attracted to the cathode, where they gain electrons — reduction.'},
      {q:'In the electrolysis of water, which gas forms at the cathode?',options:['Oxygen','Hydrogen','Chlorine','Carbon dioxide'],correct:1,explain:'Hydrogen gas forms at the cathode; oxygen forms at the anode, in a 2:1 ratio.'},
      {q:'Electroplating is an industrial application of:',options:['Distillation','Electrolysis','Filtration','Combustion'],correct:1,explain:'Electroplating deposits a thin metal layer using electrolysis.'},
      {q:'Increasing the voltage in electrolysis generally:',options:['Stops the reaction','Has no effect','Increases the rate of ion movement/product formation','Reverses the reaction'],correct:2,explain:'Higher voltage drives ions faster toward electrodes, generally increasing reaction rate.'},
      {q:'Pure water conducts electricity poorly because:',options:['It has too few ions','It is too hot','It is a metal','It has too many electrons'],correct:0,explain:'Pure water only weakly ionises, so a dissolved electrolyte (acid/salt) is usually added to carry current.'}
    ],
    summary:'Electrolysis uses electrical energy to force apart stable ionic compounds — cations reduced at the cathode, anions oxidised at the anode — a principle behind metal extraction, purification, electroplating and hydrogen production.'
  },

  carbon:{
    objectives:['Distinguish saturated and unsaturated hydrocarbons.','Identify common functional groups (–OH, –COOH, –COO–) and the compound class they create.','Build simple structural formulas for small organic molecules.','Predict basic physical property trends (boiling point) across a homologous series.'],
    introduction:'Carbon\'s unique ability to bond with itself and other atoms builds millions of compounds — from candle wax to DNA. Build simple molecules atom by atom and see how a single functional group can transform a compound\'s properties entirely.',
    theory:`<p><b>Hydrocarbons</b> contain only carbon and hydrogen. <b>Saturated</b> hydrocarbons (alkanes, e.g. CH₄, C₂H₆) contain only single C–C bonds. <b>Unsaturated</b> hydrocarbons (alkenes with C=C, alkynes with C≡C) contain at least one multiple bond and are more reactive.</p>
      <p><b>Functional groups</b> are specific atom groups that give organic molecules their characteristic chemistry:</p>
      <ul class="styled"><li><b>–OH</b> (hydroxyl) → alcohols, e.g. ethanol C₂H₅OH</li><li><b>–COOH</b> (carboxyl) → carboxylic acids, e.g. acetic acid CH₃COOH</li><li><b>–COO–</b> (ester linkage) → esters, formed from an acid + alcohol, often fragrant</li></ul>
      <p>Within a <b>homologous series</b> (like alkanes), each member differs by a CH₂ unit, and boiling point rises steadily with increasing carbon chain length due to stronger intermolecular forces.</p>`,
    applications:['Alkanes from petroleum are burned as fuels (LPG, petrol, diesel).','Ethanol (an alcohol) is used as a biofuel and in sanitisers.','Acetic acid (a carboxylic acid) is the active ingredient in vinegar.','Esters give fruits and flowers many of their natural fragrances and are used in perfumes.'],
    safety:['Many hydrocarbons are flammable — real combustion demonstrations require fire safety precautions.','Ethanol and other organic solvents should be used only in ventilated spaces, away from open flames.','Concentrated carboxylic acids can be corrosive and should be handled with gloves and goggles.'],
    mistakes:['Assuming "organic" always means "safe" or "natural" — many organic compounds are hazardous.','Confusing saturated (single bonds only) with "safe to eat" — the terms are unrelated in this context.','Forgetting that unsaturated compounds are generally more reactive due to the multiple bond.'],
    facts:['Carbon can bond with up to four other atoms, allowing chains, branches and rings — this versatility is why organic chemistry is its own vast field.','Methane, the simplest alkane, is also a potent greenhouse gas.','The pleasant smell of bananas and pineapples comes from specific natural esters.'],
    quiz:[
      {q:'A hydrocarbon containing only single C–C bonds is called:',options:['Unsaturated','Saturated','Aromatic','Ionic'],correct:1,explain:'Saturated hydrocarbons (alkanes) contain only single bonds between carbons.'},
      {q:'The –OH functional group defines which class of compound?',options:['Carboxylic acid','Ester','Alcohol','Alkene'],correct:2,explain:'The hydroxyl group (–OH) is characteristic of alcohols like ethanol.'},
      {q:'Acetic acid, found in vinegar, belongs to which functional group family?',options:['Alcohols','Carboxylic acids','Esters','Alkanes'],correct:1,explain:'Acetic acid (CH₃COOH) contains the carboxyl group (–COOH).'},
      {q:'Esters are typically formed from the reaction of:',options:['An acid and an alcohol','Two alkanes','An alkene and water','A metal and an acid'],correct:0,explain:'Esters form via a condensation reaction between a carboxylic acid and an alcohol.'},
      {q:'Within a homologous series such as alkanes, boiling point generally:',options:['Decreases with chain length','Stays constant','Increases with chain length','Becomes negative'],correct:2,explain:'Longer carbon chains have stronger intermolecular (van der Waals) forces, raising boiling point.'}
    ],
    summary:'Carbon\'s ability to form long chains, branches and rings — combined with characteristic functional groups like –OH, –COOH and ester linkages — gives rise to the enormous diversity of organic compounds that make up fuels, plastics, foods and living things.'
  }
};
