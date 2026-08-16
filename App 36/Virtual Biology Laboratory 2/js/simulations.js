// ============================================================
// SIMULATIONS DATA — Virtual Biology Laboratory
// Dr. Mateen Yousuf · School Education Department, Kashmir
// ============================================================

function gaussian(x, mu, sigma) {
  return Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function round1(v) { return Math.round(v * 10) / 10; }

const SIMULATIONS = [
  // ---------------------------------------------------------
  {
    id: 'enzyme',
    name: 'Enzyme Forge',
    domain: 'Enzymology',
    icon: '🧫',
    color: '#1976D2',
    tagline: 'Investigate how conditions change enzyme activity.',
    question: 'How do environmental conditions affect enzyme activity?',
    objective: 'Manipulate temperature, pH and substrate concentration to discover the conditions that maximise enzyme reaction rate.',
    variables: [
      { key: 'temp', label: 'Temperature', unit: '°C', min: 0, max: 80, step: 1, default: 37 },
      { key: 'ph', label: 'pH', unit: '', min: 1, max: 14, step: 0.5, default: 7 },
      { key: 'substrate', label: 'Substrate Concentration', unit: 'mM', min: 0, max: 100, step: 5, default: 50 }
    ],
    metric: { key: 'rate', label: 'Reaction Rate', unit: '% of Vmax' },
    secondary: { key: 'state', label: 'Enzyme State' },
    compute(v) {
      const tempFactor = gaussian(v.temp, 37, 13);
      const phFactor = gaussian(v.ph, 7, 2);
      const satFactor = v.substrate / (v.substrate + 20);
      const rate = clamp(tempFactor * phFactor * satFactor * 100, 0, 100);
      let state = 'Active';
      if (v.temp > 60 || v.ph < 3 || v.ph > 11) state = 'Denatured';
      else if (rate < 25) state = 'Low Activity';
      return { rate: round1(rate), state, note: state === 'Denatured' ? 'The enzyme has lost its shape — the active site no longer fits the substrate.' : 'Enzyme actively converting substrate to product.' };
    },
    predictPrompt: 'What do you predict will happen to the reaction rate with this change?',
    challenges: [
      { text: 'Find the temperature that gives the highest reaction rate at pH 7.', check: (trials) => trials.some(t => t.metric >= 90) },
      { text: 'Find a pH range that keeps the enzyme active (rate above 60%).', check: (trials) => trials.some(t => t.metric >= 60) },
      { text: 'Produce a high reaction rate using low substrate concentration (<30 mM).', check: (trials) => trials.some(t => t.vars.substrate < 30 && t.metric >= 40) },
      { text: 'Deliberately denature the enzyme, then explain why activity drops.', check: (trials) => trials.some(t => t.secondary === 'Denatured') }
    ],
    quiz: [
      { q: 'What is an enzyme?', options: ['A biological catalyst', 'A type of sugar', 'A structural protein only', 'A hormone'], a: 0, explain: 'Enzymes are biological catalysts — they speed up reactions without being used up.' },
      { q: 'What happens to most enzymes at very high temperatures?', options: ['They speed up forever', 'They denature and lose activity', 'They turn into substrate', 'Nothing changes'], a: 1, explain: 'High heat disrupts the bonds holding the enzyme\'s shape, so the active site no longer fits the substrate.' },
      { q: 'The region of an enzyme where the substrate binds is called the:', options: ['Active site', 'Nucleus', 'Cell wall', 'Vacuole'], a: 0, explain: 'The active site is the specific region shaped to bind the substrate.' },
      { q: 'As substrate concentration keeps increasing at a fixed enzyme amount, reaction rate:', options: ['Rises forever', 'Eventually levels off (saturates)', 'Always falls', 'Stays at zero'], a: 1, explain: 'Once all active sites are occupied, adding more substrate cannot increase the rate further — this is saturation.' },
      { q: 'Why does an extremely low or high pH usually reduce enzyme activity?', options: ['It changes the substrate colour', 'It can alter the enzyme\'s shape and charge distribution', 'It removes the substrate', 'Enzymes are unaffected by pH'], a: 1, explain: 'Extreme pH disrupts ionic and hydrogen bonds that maintain enzyme structure.' },
      { q: 'In this simulation, what does a falling reaction-rate graph near very high temperature indicate?', options: ['Faster catalysis', 'Denaturation reducing activity', 'More substrate being added', 'A recording error'], a: 1, explain: 'The drop reflects denaturation — the enzyme structure breaks down and activity falls.' }
    ],
    badges: [
      { id: 'first', name: 'First Reaction', icon: '🧪' },
      { id: 'variable', name: 'Variable Master', icon: '🎚️' },
      { id: 'data', name: 'Data Scientist', icon: '📊' },
      { id: 'expert', name: 'Enzyme Expert', icon: '🏆' }
    ]
  },
  // ---------------------------------------------------------
  {
    id: 'immunity',
    name: 'Immunity Defender',
    domain: 'Immunology',
    icon: '🛡️',
    color: '#43A047',
    tagline: 'Defend the body and explore immune memory.',
    question: 'How does prior exposure change the speed and strength of an immune response?',
    objective: 'Compare a first exposure to a pathogen against a later, second exposure and observe the role of immune memory.',
    variables: [
      { key: 'pathogenLoad', label: 'Pathogen Load', unit: 'units', min: 10, max: 100, step: 5, default: 50 },
      { key: 'antibodyReserve', label: 'Antibody Reserve', unit: '%', min: 0, max: 100, step: 5, default: 20 },
      { key: 'priorExposure', label: 'Prior Exposure', unit: '(0 = First, 1 = Previous)', min: 0, max: 1, step: 1, default: 0 }
    ],
    metric: { key: 'clearance', label: 'Clearance Efficiency', unit: '%' },
    secondary: { key: 'responseTime', label: 'Response Time', unit: 'hrs' },
    compute(v) {
      const responseTime = clamp(80 - v.priorExposure * 55 - v.antibodyReserve * 0.3, 4, 80);
      const clearance = clamp(40 + v.priorExposure * 35 + v.antibodyReserve * 0.4 - v.pathogenLoad * 0.2, 0, 100);
      return { clearance: round1(clearance), responseTime: round1(responseTime), note: v.priorExposure ? 'Memory cells recognise the pathogen quickly, triggering a fast antibody response.' : 'Without memory cells, the immune system needs time to recognise and respond to a new threat.' };
    },
    predictPrompt: 'Will clearance efficiency be higher on first or later exposure?',
    challenges: [
      { text: 'Clear the pathogen using the fewest antibody resources possible (reserve below 30%).', check: (trials) => trials.some(t => t.vars.antibodyReserve < 30 && t.metric >= 50) },
      { text: 'Compare a first exposure and a later exposure at the same pathogen load.', check: (trials) => trials.some(t => t.vars.priorExposure === 0) && trials.some(t => t.vars.priorExposure === 1) },
      { text: 'Achieve clearance efficiency above 85%.', check: (trials) => trials.some(t => t.metric >= 85) },
      { text: 'Explain why previous exposure produces a faster response.', check: (trials) => trials.some(t => t.vars.priorExposure === 1) }
    ],
    quiz: [
      { q: 'What are antibodies?', options: ['Proteins that recognise and bind specific pathogens', 'A type of pathogen', 'Sugar molecules', 'Muscle fibres'], a: 0, explain: 'Antibodies are proteins produced by the immune system that specifically bind to antigens on pathogens.' },
      { q: 'What is "immune memory"?', options: ['Forgetting past infections', 'The ability to respond faster to a pathogen met before', 'A type of vaccine only', 'Loss of antibodies over time'], a: 1, explain: 'Memory cells persist after an infection, allowing a faster, stronger response next time.' },
      { q: 'Why is the first exposure to a pathogen typically slower to clear?', options: ['The body has no memory cells specific to it yet', 'The pathogen is always weaker', 'Antibodies are unnecessary', 'Body temperature drops'], a: 0, explain: 'Without existing memory cells, the immune system must first recognise the new pathogen before mounting a full response.' },
      { q: 'What best describes "specificity" in immune response?', options: ['Any antibody fights any pathogen', 'Antibodies are shaped to match particular antigens', 'Only one antibody exists in the body', 'Specificity is not a real phenomenon'], a: 1, explain: 'Each antibody is specific to a particular antigen shape, like a lock and key.' },
      { q: 'Vaccines work mainly by:', options: ['Removing all pathogens from a region', 'Producing memory cells for a pathogen without causing disease', 'Increasing pathogen load', 'Cooling the body'], a: 1, explain: 'Vaccines expose the immune system to a harmless form of a pathogen, so memory cells are ready if the real pathogen appears.' },
      { q: 'In the simulation, increasing antibody reserve tends to:', options: ['Decrease clearance efficiency', 'Increase clearance efficiency', 'Have no effect at all', 'Always cause denaturation'], a: 1, explain: 'More available antibodies allow the body to neutralise more pathogen particles, raising clearance efficiency.' }
    ],
    badges: [
      { id: 'first', name: 'First Defender', icon: '🛡️' },
      { id: 'variable', name: 'Threat Detector', icon: '🔍' },
      { id: 'data', name: 'Immune Strategist', icon: '📊' },
      { id: 'expert', name: 'Immunology Expert', icon: '🏆' }
    ]
  },
  // ---------------------------------------------------------
  {
    id: 'evolution',
    name: 'Evolution Arena',
    domain: 'Evolutionary Biology',
    icon: '🦎',
    color: '#FFB300',
    tagline: 'Watch natural selection change a population.',
    question: 'How does environmental selection pressure change trait frequency across generations?',
    objective: 'Set a starting population and selection pressure, then observe how an advantageous trait spreads over generations.',
    variables: [
      { key: 'startFreq', label: 'Starting Trait Frequency', unit: '%', min: 5, max: 95, step: 5, default: 30 },
      { key: 'pressure', label: 'Selection Pressure', unit: '(survival advantage)', min: 0, max: 100, step: 5, default: 50 },
      { key: 'generations', label: 'Generations', unit: 'gen', min: 1, max: 50, step: 1, default: 10 }
    ],
    metric: { key: 'finalFreq', label: 'Final Trait Frequency', unit: '%' },
    secondary: { key: 'change', label: 'Change from Start', unit: 'pts' },
    compute(v) {
      const k = (v.pressure / 100) * 0.4;
      const p0 = v.startFreq / 100;
      const final = p0 / (p0 + (1 - p0) * Math.exp(-k * v.generations));
      const finalFreq = clamp(final * 100, 0, 100);
      return { finalFreq: round1(finalFreq), change: round1(finalFreq - v.startFreq), note: v.pressure > 50 ? 'Strong selection pressure drives rapid change in trait frequency across generations.' : 'Weak selection pressure allows the trait frequency to change only slowly.' };
    },
    predictPrompt: 'Which will happen to the advantageous trait after many generations?',
    challenges: [
      { text: 'Create conditions where the advantageous trait exceeds 90% of the population.', check: (trials) => trials.some(t => t.metric >= 90) },
      { text: 'Compare a weak selection pressure with a strong selection pressure.', check: (trials) => trials.some(t => t.vars.pressure <= 20) && trials.some(t => t.vars.pressure >= 80) },
      { text: 'Run a simulation for at least 25 generations.', check: (trials) => trials.some(t => t.vars.generations >= 25) },
      { text: 'Identify evidence in your data that supports natural selection.', check: (trials) => trials.length >= 3 }
    ],
    quiz: [
      { q: 'Natural selection acts on:', options: ['Individual organisms deciding to change', 'Heritable variation already present in a population', 'Only artificial breeding programs', 'Organisms that want to adapt'], a: 1, explain: 'Selection acts on existing heritable variation — individuals do not choose to change; the environment favours certain traits.' },
      { q: 'What is required for natural selection to occur?', options: ['Variation, heredity, and differential survival/reproduction', 'A laboratory setting only', 'Identical individuals', 'No environmental pressure'], a: 0, explain: 'Natural selection requires variation among individuals, heritability of that variation, and differences in survival or reproduction.' },
      { q: 'A "selection pressure" is:', options: ['A type of genetic mutation', 'An environmental factor that affects survival or reproduction', 'A laboratory tool', 'A vaccine'], a: 1, explain: 'Selection pressures are environmental factors (predators, climate, resources) that make some traits more advantageous than others.' },
      { q: 'If a trait offers no survival advantage, its frequency across generations will likely:', options: ['Increase rapidly every time', 'Change only slowly or randomly (drift)', 'Instantly reach 100%', 'Instantly reach 0%'], a: 1, explain: 'Without strong selection pressure, trait frequency changes are slow and can be dominated by chance (genetic drift).' },
      { q: 'Which best describes "differential reproductive success"?', options: ['All individuals reproduce equally', 'Individuals with favourable traits leave more offspring', 'Reproduction is random each generation', 'Only the largest organisms reproduce'], a: 1, explain: 'Individuals better suited to their environment tend to survive and reproduce more, passing on their traits.' },
      { q: 'Over many generations under strong, consistent selection pressure, an advantageous trait typically:', options: ['Disappears completely', 'Becomes more common in the population', 'Has no pattern at all', 'Only appears in one individual'], a: 1, explain: 'Consistent selection pressure increases the frequency of the advantageous trait over successive generations.' }
    ],
    badges: [
      { id: 'first', name: 'First Generation', icon: '🦎' },
      { id: 'variable', name: 'Selection Observer', icon: '🔬' },
      { id: 'data', name: 'Evolution Analyst', icon: '📊' },
      { id: 'expert', name: 'Natural Selection Expert', icon: '🏆' }
    ]
  },
  // ---------------------------------------------------------
  {
    id: 'microbe',
    name: 'Microbe Investigator',
    domain: 'Microbiology',
    icon: '🔬',
    color: '#26C6DA',
    tagline: 'Observe evidence and identify unknown microbes.',
    question: 'Can careful observation identify an unknown microorganism\'s group?',
    objective: 'Use the virtual microscope at increasing magnification to gather evidence, then identify each sample\'s microbial group.',
    variables: [
      { key: 'sampleType', label: 'Sample Number', unit: '(1 Bacteria · 2 Fungi · 3 Protozoan · 4 Algae)', min: 1, max: 4, step: 1, default: 1 },
      { key: 'magnification', label: 'Magnification', unit: '×', min: 10, max: 100, step: 30, default: 10 },
      { key: 'observations', label: 'Observations Recorded', unit: 'notes', min: 0, max: 10, step: 1, default: 3 }
    ],
    metric: { key: 'confidence', label: 'Identification Confidence', unit: '%' },
    secondary: { key: 'group', label: 'Likely Group' },
    compute(v) {
      const groups = ['Bacteria', 'Fungi', 'Protozoan-like', 'Microalgae'];
      const group = groups[clamp(Math.round(v.sampleType) - 1, 0, 3)];
      const confidence = clamp(v.observations * 7 + (v.magnification / 100) * 25, 0, 100);
      return { confidence: round1(confidence), group, note: confidence < 40 ? 'Too little evidence recorded — increase magnification and log more observations before identifying.' : 'Sufficient evidence has been gathered to support a confident identification.' };
    },
    predictPrompt: 'Will more recorded observations increase identification confidence?',
    challenges: [
      { text: 'Identify Sample 1 using at least three recorded observations.', check: (trials) => trials.some(t => t.vars.sampleType === 1 && t.vars.observations >= 3) },
      { text: 'Reach identification confidence above 80% on any sample.', check: (trials) => trials.some(t => t.metric >= 80) },
      { text: 'Investigate all four sample types at least once.', check: (trials) => new Set(trials.map(t => t.vars.sampleType)).size >= 4 },
      { text: 'Use the highest magnification (100×) on an unknown sample.', check: (trials) => trials.some(t => t.vars.magnification >= 100) }
    ],
    quiz: [
      { q: 'What does a microscope\'s magnification control?', options: ['Sample temperature', 'How much larger the sample appears', 'The colour of the sample', 'The sample\'s movement'], a: 1, explain: 'Magnification determines how much larger the specimen appears, revealing finer detail.' },
      { q: 'Which of these is generally single-celled and lacks a nucleus?', options: ['Bacteria', 'Fungi', 'Algae', 'Protozoa'], a: 0, explain: 'Bacteria are prokaryotic — their cells lack a membrane-bound nucleus.' },
      { q: 'Why is evidence-based identification important in microbiology?', options: ['Guessing is always correct', 'Conclusions should be supported by careful, recorded observation', 'Microscopes are unnecessary', 'Identification does not require observation'], a: 1, explain: 'Reliable identification depends on systematic, recorded observations rather than guesswork.' },
      { q: 'Which feature might help distinguish a motile microorganism from a non-motile one?', options: ['Colour of the container', 'Observed movement under the microscope', 'Room temperature', 'Time of day'], a: 1, explain: 'Movement patterns observed under magnification are useful evidence for identification.' },
      { q: 'Fungi differ from bacteria mainly because fungi are typically:', options: ['Prokaryotic and lack organelles', 'Eukaryotic, often with cell walls containing chitin', 'Not made of cells', 'Always photosynthetic'], a: 1, explain: 'Fungi are eukaryotic organisms whose cell walls often contain chitin, unlike bacterial cell walls.' },
      { q: 'What is the benefit of recording multiple observations before identifying a sample?', options: ['It wastes time with no benefit', 'It strengthens the evidence supporting the identification', 'It changes the sample\'s biology', 'It is required only for algae'], a: 1, explain: 'More recorded evidence increases confidence and reliability in reaching a correct identification.' }
    ],
    badges: [
      { id: 'first', name: 'Junior Microscopist', icon: '🔬' },
      { id: 'variable', name: 'Sample Detective', icon: '🕵️' },
      { id: 'data', name: 'Microbe Investigator', icon: '📊' },
      { id: 'expert', name: 'Microbiology Expert', icon: '🏆' }
    ]
  },
  // ---------------------------------------------------------
  {
    id: 'hormone',
    name: 'Hormone Command',
    domain: 'Endocrinology',
    icon: '🎛️',
    color: '#8E24AA',
    tagline: 'Control feedback loops that maintain balance.',
    question: 'How does hormonal feedback restore the body toward a stable set point?',
    objective: 'Adjust hormone level and target-tissue sensitivity to correct a deviation from the normal set point.',
    variables: [
      { key: 'initialDeviation', label: 'Initial Deviation from Normal', unit: '%', min: 5, max: 50, step: 5, default: 30 },
      { key: 'hormoneLevel', label: 'Hormone Level', unit: '%', min: 0, max: 100, step: 5, default: 50 },
      { key: 'sensitivity', label: 'Target Tissue Sensitivity', unit: '%', min: 0, max: 100, step: 5, default: 50 }
    ],
    metric: { key: 'remaining', label: 'Remaining Deviation', unit: '%' },
    secondary: { key: 'status', label: 'Homeostasis Status' },
    compute(v) {
      const correctionStrength = (v.hormoneLevel * v.sensitivity) / 10000;
      const remaining = clamp(v.initialDeviation * Math.exp(-correctionStrength * 4), 0, 100);
      const status = remaining < 8 ? 'Restored' : remaining < 20 ? 'Partially Restored' : 'Uncorrected';
      return { remaining: round1(remaining), status, note: status === 'Restored' ? 'The feedback loop has brought the variable back near its normal set point.' : 'Correction is incomplete — the variable remains away from its normal set point.' };
    },
    predictPrompt: 'Will increasing hormone level and sensitivity reduce the remaining deviation?',
    challenges: [
      { text: 'Restore the variable to within 8% of its normal set point.', check: (trials) => trials.some(t => t.metric <= 8) },
      { text: 'Compare a weak feedback response with a strong feedback response.', check: (trials) => trials.some(t => t.vars.hormoneLevel <= 20) && trials.some(t => t.vars.hormoneLevel >= 80) },
      { text: 'Fully correct a large initial deviation (starting above 40%).', check: (trials) => trials.some(t => t.vars.initialDeviation >= 40 && t.metric <= 10) },
      { text: 'Predict and confirm the effect of raising target-tissue sensitivity.', check: (trials) => trials.length >= 2 }
    ],
    quiz: [
      { q: 'What is homeostasis?', options: ['Constant, unregulated change', 'The maintenance of a stable internal environment', 'A type of hormone', 'Growth without limits'], a: 1, explain: 'Homeostasis is the body\'s regulation of internal conditions to stay within a stable, normal range.' },
      { q: 'In a negative feedback loop, the response to a deviation:', options: ['Pushes the variable further away from normal', 'Brings the variable back toward normal', 'Has no effect', 'Only occurs once in a lifetime'], a: 1, explain: 'Negative feedback counteracts a change, moving the variable back toward its set point.' },
      { q: 'A "target tissue" in endocrinology is:', options: ['The tissue that produces every hormone', 'A tissue that responds to a specific hormone', 'A tissue with no hormone receptors', 'Only found in plants'], a: 1, explain: 'Target tissues carry receptors that respond specifically to a particular hormone.' },
      { q: 'What best describes a hormone?', options: ['A chemical messenger, often carried in the blood, that affects target tissues', 'A type of muscle fibre', 'A structural bone component', 'A microorganism'], a: 0, explain: 'Hormones are chemical signals, often transported in blood, that regulate target-tissue activity.' },
      { q: 'If sensitivity of the target tissue increases while hormone level stays the same, correction of a deviation is generally:', options: ['Slower', 'Faster / stronger', 'Completely unaffected', 'Reversed'], a: 1, explain: 'Higher receptor sensitivity means the same hormone level produces a stronger corrective response.' },
      { q: 'A large "remaining deviation" after treatment suggests:', options: ['Homeostasis has been fully restored', 'The feedback correction was insufficient', 'The hormone was not needed', 'The set point has moved permanently'], a: 1, explain: 'A large remaining deviation shows the corrective feedback did not fully return the variable to its normal set point.' }
    ],
    badges: [
      { id: 'first', name: 'Signal Starter', icon: '📡' },
      { id: 'variable', name: 'Feedback Finder', icon: '🔁' },
      { id: 'data', name: 'Hormone Controller', icon: '📊' },
      { id: 'expert', name: 'Endocrinology Expert', icon: '🏆' }
    ]
  },
  // ---------------------------------------------------------
  {
    id: 'kidney',
    name: 'Kidney Filter Lab',
    domain: 'Excretion & Osmoregulation',
    icon: '💧',
    color: '#1976D2',
    tagline: 'Filter fluid and balance water and solutes.',
    question: 'How do water intake and filtration rate affect the composition of urine?',
    objective: 'Adjust water intake, salt intake and filtration rate to investigate reabsorption and final urine concentration.',
    variables: [
      { key: 'waterIntake', label: 'Water Intake', unit: '%', min: 0, max: 100, step: 5, default: 50 },
      { key: 'saltIntake', label: 'Salt Intake', unit: '%', min: 0, max: 100, step: 5, default: 50 },
      { key: 'filtrationRate', label: 'Filtration Rate', unit: '%', min: 20, max: 100, step: 5, default: 70 }
    ],
    metric: { key: 'concentration', label: 'Urine Concentration', unit: '%' },
    secondary: { key: 'waterOutput', label: 'Water Output', unit: '%' },
    compute(v) {
      const reabsorption = clamp(100 - v.waterIntake * 0.6, 0, 100);
      const concentration = clamp((v.saltIntake - reabsorption * 0.3) + (100 - v.waterIntake) * 0.4, 0, 100);
      const waterOutput = clamp(v.waterIntake - reabsorption * 0.5 + (v.filtrationRate - 70) * 0.2, 0, 100);
      return { concentration: round1(concentration), waterOutput: round1(waterOutput), note: v.waterIntake < 30 ? 'Low water intake leads to greater reabsorption and more concentrated urine.' : 'Higher water intake reduces reabsorption, producing more dilute urine.' };
    },
    predictPrompt: 'Will low water intake produce more or less concentrated urine?',
    challenges: [
      { text: 'Produce highly concentrated urine (above 70%).', check: (trials) => trials.some(t => t.metric >= 70) },
      { text: 'Compare high water intake with low water intake at the same salt level.', check: (trials) => trials.some(t => t.vars.waterIntake >= 80) && trials.some(t => t.vars.waterIntake <= 20) },
      { text: 'Determine which substance most affects final concentration: water or salt intake.', check: (trials) => trials.length >= 3 },
      { text: 'Interpret how filtration rate changes water output.', check: (trials) => trials.some(t => t.vars.filtrationRate >= 90) }
    ],
    quiz: [
      { q: 'What is the main function of the kidneys explored here?', options: ['Digesting food', 'Filtering blood and regulating water/solute balance', 'Producing hormones only', 'Pumping blood'], a: 1, explain: 'Kidneys filter blood and regulate the balance of water and dissolved solutes, forming urine.' },
      { q: 'What happens to reabsorption when water intake is low?', options: ['Reabsorption decreases', 'Reabsorption increases to conserve water', 'Reabsorption stops completely', 'No change occurs'], a: 1, explain: 'With low water intake, the body reabsorbs more water to conserve it, concentrating the urine.' },
      { q: 'A substance that is largely reabsorbed will appear in urine:', options: ['In high concentration', 'In low concentration', 'Only in sweat', 'Only during exercise'], a: 1, explain: 'Substances that are reabsorbed back into the blood appear in lower concentration in the final urine.' },
      { q: 'Osmoregulation refers to:', options: ['Regulation of body temperature', 'Regulation of water and solute balance', 'Regulation of muscle contraction', 'Regulation of blood cell production'], a: 1, explain: 'Osmoregulation is the control of water and solute concentrations within the body.' },
      { q: 'If someone drinks very little water, their urine is typically:', options: ['More dilute', 'More concentrated', 'Unaffected', 'Turns into blood'], a: 1, explain: 'Reduced water intake leads to greater water reabsorption, producing more concentrated urine.' },
      { q: 'Which of the following best explains variation in urine concentration in this lab?', options: ['Random chance only', 'The balance between filtration, reabsorption, and intake levels', 'The colour of the container', 'Time of day only'], a: 1, explain: 'Urine concentration reflects the interaction between filtration rate, reabsorption, and intake of water and solutes.' }
    ],
    badges: [
      { id: 'first', name: 'First Filter', icon: '💧' },
      { id: 'variable', name: 'Balance Keeper', icon: '⚖️' },
      { id: 'data', name: 'Filtration Analyst', icon: '📊' },
      { id: 'expert', name: 'Excretion Expert', icon: '🏆' }
    ]
  },
  // ---------------------------------------------------------
  {
    id: 'muscle',
    name: 'Muscle Mechanics',
    domain: 'Muscle Physiology',
    icon: '💪',
    color: '#E53935',
    tagline: 'Study force, fatigue and recovery.',
    question: 'How do load and stimulation frequency affect muscle force and fatigue?',
    objective: 'Adjust load, stimulation frequency and rest interval to investigate peak force and the onset of fatigue.',
    variables: [
      { key: 'load', label: 'Load', unit: '% of max', min: 0, max: 100, step: 5, default: 40 },
      { key: 'frequency', label: 'Stimulation Frequency', unit: 'Hz', min: 1, max: 50, step: 1, default: 20 },
      { key: 'restInterval', label: 'Rest Interval', unit: 'sec', min: 0, max: 60, step: 5, default: 10 }
    ],
    metric: { key: 'force', label: 'Peak Force', unit: '% of max' },
    secondary: { key: 'fatigue', label: 'Fatigue Level', unit: '%' },
    compute(v) {
      const force = clamp(35 + v.frequency * 1.1 - v.load * 0.15, 0, 100);
      const fatigue = clamp(v.load * 0.35 + v.frequency * 0.55 - v.restInterval * 0.9, 0, 100);
      return { force: round1(force), fatigue: round1(fatigue), note: fatigue > 60 ? 'High stimulation with little rest is producing significant muscle fatigue.' : 'The muscle is recovering well between contractions.' };
    },
    predictPrompt: 'Will a short rest interval increase or decrease fatigue?',
    challenges: [
      { text: 'Produce a peak force above 85% of maximum.', check: (trials) => trials.some(t => t.metric >= 85) },
      { text: 'Identify a condition producing very high fatigue (above 70%).', check: (trials) => trials.some(t => t.secondary >= 70) },
      { text: 'Compare a rested muscle (long rest) with a fatigued muscle (short rest).', check: (trials) => trials.some(t => t.vars.restInterval >= 45) && trials.some(t => t.vars.restInterval <= 5) },
      { text: 'Find a combination that gives high force with low fatigue.', check: (trials) => trials.some(t => t.metric >= 70 && t.secondary <= 30) }
    ],
    quiz: [
      { q: 'What generally happens to muscle force as stimulation frequency increases (within a normal range)?', options: ['Force decreases', 'Force generally increases', 'No relationship exists', 'Force becomes negative'], a: 1, explain: 'Higher stimulation frequency generally increases the force a muscle can generate, up to a limit.' },
      { q: 'Muscle fatigue refers to:', options: ['Permanent muscle damage', 'A temporary decline in the ability to generate force', 'An increase in muscle size', 'A type of muscle disease'], a: 1, explain: 'Fatigue is a temporary reduction in force-generating capacity, often reversed by rest.' },
      { q: 'What role does rest play in muscle performance?', options: ['It has no effect', 'It allows recovery and reduces fatigue', 'It always increases fatigue', 'It shortens the muscle permanently'], a: 1, explain: 'Rest intervals allow metabolic recovery, reducing the build-up of fatigue.' },
      { q: 'A higher load on a muscle generally requires:', options: ['Less force to move it', 'More force to move it', 'No force at all', 'Only fast movement'], a: 1, explain: 'Heavier loads require the muscle to generate more force to produce the same movement.' },
      { q: 'Repeated contractions with very short rest intervals typically lead to:', options: ['Reduced fatigue', 'Increased fatigue over time', 'No change in performance', 'Immediate maximum force'], a: 1, explain: 'Without adequate recovery time, fatigue accumulates across repeated contractions.' },
      { q: 'A force-time curve in this lab is useful because it shows:', options: ['Only the colour of the muscle', 'How force changes over the course of contractions', 'The muscle\'s exact weight', 'Nothing relevant to physiology'], a: 1, explain: 'The force-time curve reveals patterns of force generation and fatigue across a series of contractions.' }
    ],
    badges: [
      { id: 'first', name: 'First Contraction', icon: '💪' },
      { id: 'variable', name: 'Force Finder', icon: '📈' },
      { id: 'data', name: 'Muscle Analyst', icon: '📊' },
      { id: 'expert', name: 'Physiology Expert', icon: '🏆' }
    ]
  },
  // ---------------------------------------------------------
  {
    id: 'bone',
    name: 'Bone Builder',
    domain: 'Skeletal Biology',
    icon: '🦴',
    color: '#F5F7FA',
    color2: '#607D8B',
    tagline: 'Test how structure affects mechanical strength.',
    question: 'How do bone density and mineralization affect strength under load?',
    objective: 'Adjust density, mineralization and applied load to investigate structural strength and deformation.',
    variables: [
      { key: 'density', label: 'Bone Density', unit: '%', min: 10, max: 100, step: 5, default: 60 },
      { key: 'mineralization', label: 'Mineralization', unit: '%', min: 10, max: 100, step: 5, default: 60 },
      { key: 'loadApplied', label: 'Load Applied', unit: 'N', min: 0, max: 500, step: 20, default: 150 }
    ],
    metric: { key: 'strength', label: 'Structural Strength', unit: '%' },
    secondary: { key: 'deformation', label: 'Deformation', unit: '%' },
    compute(v) {
      const strength = clamp(v.density * 0.55 + v.mineralization * 0.45, 0, 100);
      const deformation = clamp((v.loadApplied / (strength + 10)) * 8, 0, 100);
      return { strength: round1(strength), deformation: round1(deformation), note: deformation > 70 ? 'Deformation is high — the applied load is approaching the structural limit of this bone.' : 'The bone is comfortably supporting this load with minimal deformation.' };
    },
    predictPrompt: 'Will higher density and mineralization increase structural strength?',
    challenges: [
      { text: 'Build the strongest virtual bone possible (strength above 90%).', check: (trials) => trials.some(t => t.metric >= 90) },
      { text: 'Determine how density alone affects strength (compare high vs low density).', check: (trials) => trials.some(t => t.vars.density >= 90) && trials.some(t => t.vars.density <= 20) },
      { text: 'Apply a heavy load (400+ N) and observe deformation.', check: (trials) => trials.some(t => t.vars.loadApplied >= 400) },
      { text: 'Find a structural design that keeps deformation under 20% at high load (300+ N).', check: (trials) => trials.some(t => t.vars.loadApplied >= 300 && t.secondary <= 20) }
    ],
    quiz: [
      { q: 'What does bone mineralization mainly involve?', options: ['Deposition of minerals like calcium that add rigidity', 'Removal of all minerals', 'Softening of bone tissue', 'Water loss only'], a: 0, explain: 'Mineralization is the deposition of minerals (like calcium and phosphate) that give bone its rigidity and strength.' },
      { q: 'Higher bone density is generally associated with:', options: ['Lower structural strength', 'Higher structural strength', 'No relationship to strength', 'Only affects bone colour'], a: 1, explain: 'Denser bone tissue generally provides greater structural strength.' },
      { q: 'What does "deformation" indicate in a mechanical test?', options: ['The bone\'s exact age', 'How much the structure bends or changes shape under load', 'The bone\'s colour change', 'The bone\'s water content'], a: 1, explain: 'Deformation measures how much a structure changes shape in response to an applied load.' },
      { q: 'If load greatly exceeds a bone\'s structural strength, the likely result is:', options: ['No change at all', 'Increased risk of structural failure (fracture)', 'The bone becomes stronger', 'The bone shrinks safely'], a: 1, explain: 'Loads that exceed structural strength increase the risk of fracture or failure.' },
      { q: 'Why might an engineer and a biologist both be interested in bone structure?', options: ['Bone structure has no mechanical relevance', 'Bone combines biological growth with mechanical, load-bearing function', 'Bones are purely decorative', 'Only engineers study bone'], a: 1, explain: 'Bone is a living tissue that also serves a critical mechanical, load-bearing role — of interest to both fields.' },
      { q: 'A low-density, poorly mineralised bone under a large load would likely show:', options: ['Minimal deformation', 'Greater deformation and higher failure risk', 'Increased strength', 'No measurable change'], a: 1, explain: 'Weaker structural properties lead to greater deformation and higher risk under the same load.' }
    ],
    badges: [
      { id: 'first', name: 'Bone Explorer', icon: '🦴' },
      { id: 'variable', name: 'Structure Analyst', icon: '🧱' },
      { id: 'data', name: 'Biomechanics Builder', icon: '📊' },
      { id: 'expert', name: 'Skeletal Science Expert', icon: '🏆' }
    ]
  },
  // ---------------------------------------------------------
  {
    id: 'plant',
    name: 'Plant Hormone Studio',
    domain: 'Plant Physiology',
    icon: '🌱',
    color: '#43A047',
    tagline: 'See how hormones shape plant growth.',
    question: 'How do plant hormones and their concentration influence growth?',
    objective: 'Choose a hormone, concentration and exposure duration to observe the resulting growth response.',
    variables: [
      { key: 'hormoneType', label: 'Hormone (1 Auxin · 2 Gibberellin · 3 Cytokinin · 4 ABA · 5 Ethylene)', unit: '', min: 1, max: 5, step: 1, default: 1 },
      { key: 'concentration', label: 'Concentration', unit: '%', min: 0, max: 100, step: 5, default: 50 },
      { key: 'duration', label: 'Exposure Duration', unit: 'days', min: 1, max: 30, step: 1, default: 10 }
    ],
    metric: { key: 'growth', label: 'Growth Response', unit: '% vs untreated' },
    secondary: { key: 'hormoneName', label: 'Hormone' },
    compute(v) {
      const names = ['Auxin', 'Gibberellin', 'Cytokinin', 'Abscisic Acid (ABA)', 'Ethylene'];
      const factors = [1.0, 1.3, 0.9, -0.9, 0.35];
      const idx = clamp(Math.round(v.hormoneType) - 1, 0, 4);
      const growth = clamp(factors[idx] * v.concentration * 0.5 * (v.duration / 10), -100, 150);
      return { growth: round1(growth), hormoneName: names[idx], note: growth < 0 ? 'This hormone is inhibiting growth relative to the untreated plant.' : 'This hormone is promoting growth relative to the untreated plant.' };
    },
    predictPrompt: 'Do you predict this hormone will promote or inhibit growth?',
    challenges: [
      { text: 'Select a treatment that produces strong growth promotion (above 60%).', check: (trials) => trials.some(t => t.metric >= 60) },
      { text: 'Select a treatment that inhibits growth (negative response).', check: (trials) => trials.some(t => t.metric < 0) },
      { text: 'Compare two different hormones at the same concentration and duration.', check: (trials) => new Set(trials.map(t => t.vars.hormoneType)).size >= 2 },
      { text: 'Observe how growth response changes over a longer exposure duration (20+ days).', check: (trials) => trials.some(t => t.vars.duration >= 20) }
    ],
    quiz: [
      { q: 'Auxin is best known for promoting:', options: ['Leaf yellowing only', 'Cell elongation and growth toward light', 'Seed dormancy only', 'Fruit ripening only'], a: 1, explain: 'Auxin promotes cell elongation and is central to phototropic (light-directed) growth.' },
      { q: 'Which hormone is associated with promoting seed and bud dormancy?', options: ['Gibberellin', 'Cytokinin', 'Abscisic acid (ABA)', 'Auxin'], a: 2, explain: 'ABA generally inhibits growth and promotes dormancy, especially under stress.' },
      { q: 'Ethylene is a plant hormone that is unusual because it is:', options: ['A gas', 'A solid mineral', 'Always inhibitory', 'Found only in animals'], a: 0, explain: 'Ethylene is a gaseous hormone, notably involved in fruit ripening and stress responses.' },
      { q: 'Cytokinins are most associated with promoting:', options: ['Root elongation only', 'Cell division and shoot/branching growth', 'Leaf drop only', 'Seed dormancy'], a: 1, explain: 'Cytokinins promote cell division and are linked to shoot development and branching.' },
      { q: 'Gibberellins are well known for promoting:', options: ['Stem elongation and growth', 'Permanent dormancy', 'Root shrinkage', 'Loss of chlorophyll'], a: 0, explain: 'Gibberellins are strongly associated with stem elongation and overall growth promotion.' },
      { q: 'If a treatment produces a negative growth response in this simulation, this means the treated plant:', options: ['Grew more than the untreated plant', 'Grew less than the untreated plant', 'Grew exactly the same', 'Died instantly'], a: 1, explain: 'A negative growth response indicates less growth compared to the untreated control.' }
    ],
    badges: [
      { id: 'first', name: 'Plant Observer', icon: '🌱' },
      { id: 'variable', name: 'Hormone Explorer', icon: '🧴' },
      { id: 'data', name: 'Growth Analyst', icon: '📊' },
      { id: 'expert', name: 'Plant Physiology Expert', icon: '🏆' }
    ]
  },
  // ---------------------------------------------------------
  {
    id: 'biotech',
    name: 'Biotechnology Factory',
    domain: 'Biotechnology',
    icon: '⚙️',
    color: '#FFB300',
    tagline: 'Design and optimise a bioprocess pipeline.',
    question: 'How do processing conditions affect yield, efficiency and waste in a bioprocess?',
    objective: 'Adjust temperature, pH, nutrient level and processing duration to optimise a simplified biological production pipeline.',
    variables: [
      { key: 'temp', label: 'Temperature', unit: '°C', min: 0, max: 60, step: 2, default: 30 },
      { key: 'ph', label: 'pH', unit: '', min: 1, max: 14, step: 0.5, default: 7 },
      { key: 'nutrient', label: 'Nutrient Level', unit: '%', min: 0, max: 100, step: 5, default: 60 },
      { key: 'duration', label: 'Processing Duration', unit: 'hrs', min: 1, max: 72, step: 1, default: 24 }
    ],
    metric: { key: 'yieldPct', label: 'Yield', unit: '%' },
    secondary: { key: 'efficiency', label: 'Efficiency', unit: '%' },
    compute(v) {
      const tempFactor = gaussian(v.temp, 32, 10);
      const phFactor = gaussian(v.ph, 6.5, 1.8);
      const nutrientFactor = v.nutrient / (v.nutrient + 25);
      const timeFactor = 1 - Math.exp(-v.duration / 20);
      const yieldPct = clamp(tempFactor * phFactor * nutrientFactor * timeFactor * 100, 0, 100);
      const efficiency = clamp(yieldPct - (v.duration > 48 ? 10 : 0) - (v.nutrient < 30 ? 10 : 0), 0, 100);
      return { yieldPct: round1(yieldPct), efficiency: round1(efficiency), waste: round1(100 - efficiency), note: efficiency > 70 ? 'This condition is producing a high-yield, efficient batch with low waste.' : 'This condition is producing a lower yield — consider adjusting temperature, pH or nutrients.' };
    },
    predictPrompt: 'Will increasing nutrient level improve final yield?',
    challenges: [
      { text: 'Achieve maximum yield within 24 hours or less.', check: (trials) => trials.some(t => t.metric >= 75 && t.vars.duration <= 24) },
      { text: 'Find the most efficient production condition (efficiency above 80%).', check: (trials) => trials.some(t => t.secondary >= 80) },
      { text: 'Reduce waste while maintaining a yield above 60%.', check: (trials) => trials.some(t => t.metric >= 60 && (100 - t.secondary) <= 30) },
      { text: 'Compare two different production strategies and note the trade-offs.', check: (trials) => trials.length >= 3 }
    ],
    quiz: [
      { q: 'What is biotechnology, in simple terms?', options: ['Using living organisms or their processes to create useful products', 'Only computer programming', 'A branch of physics', 'A type of weather forecasting'], a: 0, explain: 'Biotechnology uses biological organisms, systems, or processes to develop useful products.' },
      { q: 'In a bioprocess, "yield" refers to:', options: ['The amount of raw material wasted', 'The amount of product successfully obtained', 'The colour of the product', 'The size of the factory'], a: 1, explain: 'Yield is the quantity of the desired product obtained from the process.' },
      { q: 'Why might increasing processing time not always increase efficiency?', options: ['Time never matters', 'Longer processing can increase costs or allow quality to decline', 'Time always improves every outcome', 'It has no relationship to efficiency'], a: 1, explain: 'Excessively long processing can raise costs or allow conditions to drift from optimal, reducing overall efficiency.' },
      { q: 'What does "optimisation" mean in a production process?', options: ['Choosing conditions at random', 'Finding conditions that best balance yield, efficiency and waste', 'Always maximising temperature', 'Ignoring nutrient levels'], a: 1, explain: 'Optimisation means finding the best combination of conditions to balance competing goals such as yield, efficiency, and waste.' },
      { q: 'A trade-off in bioprocessing might look like:', options: ['Higher yield always with zero waste and zero cost', 'Increasing one parameter improves yield but reduces efficiency', 'No two variables ever interact', 'Nutrients have no effect on yield'], a: 1, explain: 'Real bioprocesses often show trade-offs: improving one variable can come at the cost of another.' },
      { q: 'Why is temperature control important in fermentation-based bioprocesses?', options: ['Organisms/enzymes involved usually have an optimal temperature range', 'Temperature has no biological effect', 'Colder is always better with no limit', 'Only pH matters, not temperature'], a: 0, explain: 'Biological processes typically depend on enzymes and organisms with optimal temperature ranges, similar to enzyme activity.' }
    ],
    badges: [
      { id: 'first', name: 'First Batch', icon: '⚙️' },
      { id: 'variable', name: 'Process Designer', icon: '🛠️' },
      { id: 'data', name: 'Bioengineer', icon: '📊' },
      { id: 'expert', name: 'Biotechnology Expert', icon: '🏆' }
    ]
  }
];
