/* ===================== VIRTUAL BIOLOGY LABORATORY — APP SHELL ===================== */

const SIMULATIONS = [
  { id:'cell', title:'Cell Structure Explorer', icon:'🔬', color:'#1976D2', desc:'Assemble & explore animal and plant cells, organelle by organelle.' },
  { id:'photosynthesis', title:'Photosynthesis Laboratory', icon:'🌿', color:'#43A047', desc:'Control light, CO₂, water & temperature to drive glucose production.' },
  { id:'digestive', title:'Human Digestive System', icon:'🍽️', color:'#FF7043', desc:'Follow food from mouth to rectum and watch nutrients get absorbed.' },
  { id:'respiratory', title:'Respiratory System Lab', icon:'🫁', color:'#26C6DA', desc:'Breathe, exercise, and change altitude to see gas exchange respond.' },
  { id:'circulatory', title:'Human Circulatory System', icon:'❤️', color:'#E53935', desc:'Drive the heart, control vessels and watch double circulation flow.' },
  { id:'nervous', title:'Nervous System Explorer', icon:'🧠', color:'#8E24AA', desc:'Trigger a reflex arc and trace the nerve impulse in real time.' },
  { id:'planttransport', title:'Plant Transport System', icon:'🌱', color:'#2E7D32', desc:'Watch water and food move through xylem & phloem under changing conditions.' },
  { id:'genetics', title:'Genetics & Heredity Lab', icon:'🧬', color:'#FFB300', desc:'Cross parents, build Punnett squares, and predict offspring traits.' },
  { id:'ecosystem', title:'Ecosystem & Food Chain Simulator', icon:'🌍', color:'#00897B', desc:'Build a food web and see how climate & pollution shift the balance.' },
  { id:'reproduction', title:'Human Reproduction & Development', icon:'👶', color:'#5C6BC0', desc:'Explore fertilisation and the stages of foetal growth respectfully.' },
];

const STORAGE_KEY = 'vbl_state_v1';
function loadState(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState(); }
  catch(e){ return defaultState(); }
}
function defaultState(){
  return { xp:0, theme:'light', progress:{}, bookmarks:[], quizScores:{}, streak:0, lastVisit:null, notes:{} };
}
let STATE = loadState();
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); }

function addXP(n){
  STATE.xp += n; saveState(); refreshDashboard(); toast(`+${n} XP earned!`);
}
function markProgress(simId, pct){
  STATE.progress[simId] = Math.max(STATE.progress[simId]||0, pct);
  saveState();
}
function toggleBookmark(simId){
  const i = STATE.bookmarks.indexOf(simId);
  if(i>-1) STATE.bookmarks.splice(i,1); else STATE.bookmarks.push(simId);
  saveState(); toast(i>-1 ? 'Removed bookmark' : 'Bookmarked!');
  renderHome();
}

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- Theme ---------- */
function applyTheme(){
  document.documentElement.setAttribute('data-theme', STATE.theme);
}
function toggleTheme(){
  STATE.theme = STATE.theme === 'light' ? 'dark' : 'light';
  saveState(); applyTheme();
}

/* ---------- Screen Navigation ---------- */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.bottomnav button').forEach(b=>b.classList.toggle('active', b.dataset.target===id));
  window.scrollTo({top:0, behavior:'instant'});
}

function enterApp(){
  showScreen('home');
  STATE.streak = (STATE.streak||0)+1; saveState();
}

/* ---------- Dashboard rendering ---------- */
function renderHome(){
  const grid = document.getElementById('simGrid');
  grid.innerHTML = SIMULATIONS.map(sim => cardHTML(sim)).join('');
  grid.querySelectorAll('.sim-card').forEach(el=>{
    el.addEventListener('click', ()=> openSimulation(el.dataset.id));
  });
  document.getElementById('bookmarkGrid').innerHTML = STATE.bookmarks.length
    ? STATE.bookmarks.map(id => cardHTML(SIMULATIONS.find(s=>s.id===id))).join('')
    : `<div class="empty-state">No bookmarks yet — tap the ★ on any card.</div>`;
  document.querySelectorAll('#bookmarkGrid .sim-card').forEach(el=>{
    el.addEventListener('click', ()=> openSimulation(el.dataset.id));
  });
  refreshDashboard();
}

function cardHTML(sim){
  const pct = STATE.progress[sim.id]||0;
  const marked = STATE.bookmarks.includes(sim.id);
  return `<div class="card sim-card" data-id="${sim.id}">
    <div class="icon" style="background:${sim.color}">${sim.icon}</div>
    <h3>${sim.title}</h3>
    <p>${sim.desc}</p>
    <div class="meta">
      <span class="chip">${pct}% complete</span>
      <span style="cursor:pointer" onclick="event.stopPropagation(); toggleBookmark('${sim.id}')">${marked?'★':'☆'}</span>
    </div>
    <div class="progress-bar"><div style="width:${pct}%"></div></div>
  </div>`;
}

function refreshDashboard(){
  const total = SIMULATIONS.length;
  const done = Object.values(STATE.progress).filter(p=>p>=100).length;
  document.getElementById('statXP').textContent = STATE.xp;
  document.getElementById('statDone').textContent = `${done}/${total}`;
  document.getElementById('statStreak').textContent = STATE.streak||1;
  const rank = STATE.xp > 800 ? 'Master Biologist' : STATE.xp > 400 ? 'Field Researcher' : STATE.xp > 150 ? 'Lab Explorer' : 'Curious Beginner';
  document.getElementById('statRank').textContent = rank;
}

/* ---------- Simulation container ---------- */
const SIM_MODULES = {}; // populated by each simulation file: SIM_MODULES.cell = { render(container) }

/* Global timer registry so intervals from one simulation don't keep running
   after the user navigates away to another simulation or back to Home. */
window.ACTIVE_TIMERS = [];
function registerInterval(fn, ms){
  const id = setInterval(fn, ms);
  window.ACTIVE_TIMERS.push(id);
  return id;
}
function clearAllTimers(){
  window.ACTIVE_TIMERS.forEach(id => clearInterval(id));
  window.ACTIVE_TIMERS = [];
}

function openSimulation(id){
  clearAllTimers();
  const sim = SIMULATIONS.find(s=>s.id===id);
  if(!sim) return;
  showScreen('simscreen');
  document.getElementById('simTitle').textContent = sim.title;
  const container = document.getElementById('simBody');
  container.innerHTML = '';
  const mod = SIM_MODULES[id];
  if(mod && mod.render){
    mod.render(container, { sim, addXP, markProgress, toast, STATE, saveState });
  } else {
    container.innerHTML = `<div class="empty-state">This simulation is being prepared.</div>`;
  }
  markProgress(id, Math.max(10, STATE.progress[id]||0));
  renderHome();
}

function backToHome(){ clearAllTimers(); showScreen('home'); renderHome(); }

/* ---------- Quiz engine helper (shared by all simulations) ---------- */
function buildQuiz(container, quizId, questions, onDone){
  const wrap = document.createElement('div');
  let score = 0, answered = 0;
  questions.forEach((q, qi)=>{
    const qDiv = document.createElement('div');
    qDiv.className = 'quiz-q';
    qDiv.innerHTML = `<p>${qi+1}. ${q.q}</p><div class="quiz-opts"></div>`;
    const optsDiv = qDiv.querySelector('.quiz-opts');
    q.options.forEach((opt, oi)=>{
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.onclick = ()=>{
        if(qDiv.dataset.done) return;
        qDiv.dataset.done = '1';
        [...optsDiv.children].forEach((c,ci)=>{
          if(ci===q.correct) c.classList.add('correct');
          else if(ci===oi) c.classList.add('wrong');
        });
        if(oi===q.correct) score++;
        answered++;
        if(answered===questions.length){
          const scoreEl = document.createElement('p');
          scoreEl.className='quiz-score';
          scoreEl.style.marginTop='10px';
          scoreEl.textContent = `Score: ${score}/${questions.length}`;
          wrap.appendChild(scoreEl);
          if(onDone) onDone(score, questions.length);
        }
      };
      optsDiv.appendChild(b);
    });
    wrap.appendChild(qDiv);
  });
  container.appendChild(wrap);
}

/* ---------- Splash background animation (particles + DNA helix) ---------- */
function initSplashCanvas(){
  const canvas = document.getElementById('splashCanvas');
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);

  const particles = Array.from({length:60}, ()=>({
    x: Math.random(), y: Math.random(),
    r: 1+Math.random()*2.4,
    vx:(Math.random()-.5)*0.0006, vy:(Math.random()-.5)*0.0006,
    hue: Math.random()>0.5 ? '38,198,218' : '67,160,71'
  }));

  let t = 0;
  function frame(){
    t += 0.012;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // floating particles
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>1) p.vx*=-1;
      if(p.y<0||p.y>1) p.vy*=-1;
      const px = p.x*canvas.width, py = p.y*canvas.height;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${p.hue},0.55)`;
      ctx.fill();
    });

    // DNA helix
    const cx = canvas.width*0.5;
    const amp = Math.min(canvas.width*0.16, 130);
    const steps = 26;
    for(let i=0;i<steps;i++){
      const y = (i/steps)*canvas.height;
      const phase = i*0.5 + t;
      const x1 = cx + Math.sin(phase)*amp;
      const x2 = cx + Math.sin(phase+Math.PI)*amp;
      const alpha = 0.15 + 0.15*Math.sin(phase);
      ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y);
      ctx.strokeStyle = `rgba(38,198,218,${Math.max(0.05,alpha)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath(); ctx.arc(x1,y,3,0,Math.PI*2); ctx.fillStyle='rgba(38,198,218,0.8)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x2,y,3,0,Math.PI*2); ctx.fillStyle='rgba(67,160,71,0.85)'; ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
}

/* ---------- PWA install & service worker ---------- */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault(); deferredPrompt = e;
  const btn = document.getElementById('installBtn');
  if(btn) btn.style.display='inline-flex';
});
function installApp(){
  if(!deferredPrompt) { toast('App already installed or unsupported here'); return; }
  deferredPrompt.prompt();
  deferredPrompt = null;
}
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  applyTheme();
  initSplashCanvas();
  renderHome();
  document.querySelectorAll('.bottomnav button').forEach(b=>{
    b.addEventListener('click', ()=> showScreen(b.dataset.target));
  });
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  document.getElementById('searchInput').addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#simGrid .sim-card').forEach(c=>{
      const match = c.textContent.toLowerCase().includes(q);
      c.style.display = match ? '' : 'none';
    });
  });
});
