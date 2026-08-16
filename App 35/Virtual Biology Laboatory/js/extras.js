/* ===================== EXTRAS: ANATOMY, GLOSSARY, QUIZ CENTRE, ACHIEVEMENTS ===================== */

const ANATOMY_SYSTEMS = [
  {id:'skeletal', name:'Skeletal System', icon:'🦴', color:'#90A4AE', fn:'Provides structural support, protects organs, and works with muscles to enable movement.', organs:['Skull','Ribs','Spine','Femur','Pelvis']},
  {id:'muscular', name:'Muscular System', icon:'💪', color:'#E57373', fn:'Muscles contract to move the skeleton, pump the heart, and move food through the gut.', organs:['Biceps','Cardiac muscle','Diaphragm','Quadriceps']},
  {id:'digestive', name:'Digestive System', icon:'🍽️', color:'#FF8A65', fn:'Breaks down food and absorbs nutrients for the body to use.', organs:['Mouth','Stomach','Small intestine','Large intestine','Liver']},
  {id:'respiratory', name:'Respiratory System', icon:'🫁', color:'#4FC3F7', fn:'Brings oxygen into the body and removes carbon dioxide.', organs:['Nose','Trachea','Lungs','Diaphragm']},
  {id:'circulatory', name:'Circulatory System', icon:'❤️', color:'#EF5350', fn:'Transports blood, oxygen and nutrients throughout the body.', organs:['Heart','Arteries','Veins','Capillaries']},
  {id:'nervous', name:'Nervous System', icon:'🧠', color:'#BA68C8', fn:'Controls and coordinates body activities using electrical signals.', organs:['Brain','Spinal cord','Nerves']},
  {id:'excretory', name:'Excretory System', icon:'💧', color:'#4DD0E1', fn:'Removes metabolic waste products from the body.', organs:['Kidneys','Ureters','Bladder','Skin']},
  {id:'endocrine', name:'Endocrine System', icon:'⚗️', color:'#FFB74D', fn:'Produces hormones that regulate growth, metabolism and mood.', organs:['Pituitary gland','Thyroid','Pancreas','Adrenal glands']},
];

function renderAnatomy(){
  const body = document.getElementById('anatomyBody');
  if(!body || body.dataset.built) return;
  body.dataset.built = '1';
  body.innerHTML = `
    <div class="searchbar" style="max-width:400px;margin-bottom:18px">
      <span>🔍</span><input id="anatomySearch" type="text" placeholder="Search organ systems…">
    </div>
    <div class="grid" id="anatomyGrid"></div>
    <div class="panel" id="anatomyDetail" style="margin-top:20px; display:none;"></div>
  `;
  const grid = document.getElementById('anatomyGrid');
  grid.innerHTML = ANATOMY_SYSTEMS.map(s=>`
    <div class="card sim-card" data-id="${s.id}">
      <div class="icon" style="background:${s.color}">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.fn}</p>
    </div>`).join('');
  grid.querySelectorAll('.sim-card').forEach(el=>{
    el.onclick = ()=>{
      const s = ANATOMY_SYSTEMS.find(x=>x.id===el.dataset.id);
      const detail = document.getElementById('anatomyDetail');
      detail.style.display='block';
      detail.innerHTML = `<h3><span class="tag"></span>${s.icon} ${s.name}</h3>
        <p style="font-size:13.5px;color:var(--text-soft);line-height:1.6;margin-bottom:10px">${s.fn}</p>
        <div class="legend">${s.organs.map(o=>`<div class="item"><span class="sw" style="background:${s.color}"></span>${o}</div>`).join('')}</div>`;
      detail.scrollIntoView({behavior:'smooth', block:'nearest'});
    };
  });
  document.getElementById('anatomySearch').oninput = e=>{
    const q = e.target.value.toLowerCase();
    grid.querySelectorAll('.sim-card').forEach(c=> c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none');
  };
}

const GLOSSARY_TERMS = [
  {term:'Allele', pron:'uh-LEEL', def:'One of two or more versions of a gene.', example:'The tall (T) and short (t) alleles in pea plants.'},
  {term:'Chlorophyll', pron:'KLOR-uh-fil', def:'The green pigment in plants that absorbs light for photosynthesis.', example:'Found inside chloroplasts.'},
  {term:'Chromosome', pron:'KROH-muh-sohm', def:'A thread-like structure of DNA that carries genetic information.', example:'Humans have 23 pairs of chromosomes.'},
  {term:'Diffusion', pron:'dih-FYOO-zhun', def:'Movement of particles from high to low concentration.', example:'Oxygen diffuses from alveoli into blood.'},
  {term:'Ecosystem', pron:'EE-koh-sis-tuhm', def:'A community of organisms interacting with their environment.', example:'A pond ecosystem with fish, algae and insects.'},
  {term:'Enzyme', pron:'EN-zime', def:'A protein that speeds up biochemical reactions.', example:'Amylase breaks down starch in saliva.'},
  {term:'Fertilisation', pron:'fur-tuh-ly-ZAY-shun', def:'Fusion of a sperm and egg cell to form a zygote.', example:'Occurs in the fallopian tube in humans.'},
  {term:'Genotype', pron:'JEE-noh-type', def:'The genetic makeup of an organism.', example:'Tt is the genotype for a heterozygous tall pea plant.'},
  {term:'Homeostasis', pron:'hoh-mee-oh-STAY-sis', def:'Maintenance of a stable internal environment.', example:'Regulating body temperature around 37°C.'},
  {term:'Mitochondria', pron:'my-toh-KON-dree-uh', def:'Organelles that release energy via cellular respiration.', example:'Called the "powerhouse of the cell."'},
  {term:'Osmosis', pron:'oz-MOH-sis', def:'Movement of water across a membrane from a dilute to a concentrated solution.', example:'Water entering plant root hair cells.'},
  {term:'Phenotype', pron:'FEE-noh-type', def:'The observable physical characteristics of an organism.', example:'Purple flower colour is a phenotype.'},
  {term:'Photosynthesis', pron:'foh-toh-SIN-thuh-sis', def:'The process by which plants make glucose using light energy.', example:'Occurs in chloroplasts of leaf cells.'},
  {term:'Reflex', pron:'REE-fleks', def:'A rapid, automatic response to a stimulus.', example:'Pulling your hand away from something hot.'},
  {term:'Transpiration', pron:'tran-spuh-RAY-shun', def:'Loss of water vapour from plant leaves.', example:'Higher on hot, dry, windy days.'},
];

function renderGlossary(){
  const body = document.getElementById('glossaryBody');
  if(!body || body.dataset.built) return;
  body.dataset.built = '1';
  body.innerHTML = `
    <div class="searchbar" style="max-width:400px;margin-bottom:18px">
      <span>🔍</span><input id="glossarySearch" type="text" placeholder="Search terms…">
    </div>
    <div class="grid" id="glossaryGrid"></div>
  `;
  const grid = document.getElementById('glossaryGrid');
  function draw(list){
    grid.innerHTML = list.map(t=>`
      <div class="panel">
        <h3 style="font-size:16px">${t.term} <span style="font-size:11px;color:var(--text-soft);font-weight:400">/${t.pron}/</span></h3>
        <p style="font-size:13px;color:var(--text-soft);line-height:1.6;margin-top:6px">${t.def}</p>
        <p style="font-size:12px;color:var(--primary-blue);margin-top:8px"><i>e.g. ${t.example}</i></p>
      </div>`).join('');
  }
  draw(GLOSSARY_TERMS);
  document.getElementById('glossarySearch').oninput = e=>{
    const q = e.target.value.toLowerCase();
    draw(GLOSSARY_TERMS.filter(t=> t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)));
  };
}

function renderQuizCentre(){
  const grid = document.getElementById('quizGrid');
  if(!grid) return;
  grid.innerHTML = SIMULATIONS.map(sim=>{
    const score = STATE.quizScores[sim.id];
    return `<div class="card sim-card" data-id="${sim.id}">
      <div class="icon" style="background:${sim.color}">${sim.icon}</div>
      <h3>${sim.title}</h3>
      <p>10-question adaptive mini quiz.</p>
      <div class="meta"><span class="chip">${score ? 'Score: '+score : 'Not attempted'}</span></div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.sim-card').forEach(el=> el.onclick = ()=> openSimulation(el.dataset.id));
}

const BADGES = [
  {id:'first_lab', name:'First Steps', desc:'Open your first simulation', icon:'🔬', check:()=> Object.keys(STATE.progress).length>=1},
  {id:'quiz_master', name:'Quiz Taker', desc:'Complete 1 mini quiz', icon:'📝', check:()=> Object.keys(STATE.quizScores).length>=1},
  {id:'five_labs', name:'Lab Regular', desc:'Explore 5 different simulations', icon:'🧪', check:()=> Object.keys(STATE.progress).length>=5},
  {id:'all_labs', name:'Master Biologist', desc:'Complete all 10 simulations', icon:'🏆', check:()=> Object.values(STATE.progress).filter(p=>p>=100).length>=10},
  {id:'xp_150', name:'Rising Explorer', desc:'Earn 150 XP', icon:'⭐', check:()=> STATE.xp>=150},
  {id:'xp_500', name:'Field Researcher', desc:'Earn 500 XP', icon:'🌟', check:()=> STATE.xp>=500},
  {id:'bookmarker', name:'Curator', desc:'Bookmark a simulation', icon:'★', check:()=> STATE.bookmarks.length>=1},
];

function renderAchievements(){
  document.getElementById('ach_xp').textContent = STATE.xp;
  const rank = STATE.xp > 800 ? 'Master Biologist' : STATE.xp > 400 ? 'Field Researcher' : STATE.xp > 150 ? 'Lab Explorer' : 'Curious Beginner';
  document.getElementById('ach_rank').textContent = rank;
  const grid = document.getElementById('badgeGrid');
  grid.innerHTML = BADGES.map(b=>{
    const earned = b.check();
    return `<div class="card" style="text-align:center; opacity:${earned?1:0.45}">
      <div class="icon" style="background:${earned?'#43A047':'#B0BEC5'}; margin:0 auto 10px;">${b.icon}</div>
      <h3>${b.name}</h3>
      <p>${b.desc}</p>
      <div class="chip" style="margin-top:8px">${earned ? '✅ Earned' : '🔒 Locked'}</div>
    </div>`;
  }).join('');
}

/* Hook into navigation: render lazily when the relevant screens open */
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.bottomnav button, [onclick*="showScreen"]').forEach(()=>{});
  const origShowScreen = window.showScreen;
  window.showScreen = function(id){
    origShowScreen(id);
    if(id==='anatomy') renderAnatomy();
    if(id==='glossary') renderGlossary();
    if(id==='quizcentre') renderQuizCentre();
    if(id==='achievements') renderAchievements();
  };
});
