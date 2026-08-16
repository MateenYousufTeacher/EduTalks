/* Virtual History Laboratory — shared simulation harness
   Every simulation module registers itself on window.SimModules[id] = {
     mount(stageEl, sideStatsEl, controlsEl, api) -> called when "Laboratory" tab opens (once)
     quiz: [ {q, options:[...], correct:idx, hint, explain}, ... ]
     mapSvg?: optional small inline map svg string shown in Evidence tab
     artifactIds?: array of MUSEUM_DATA ids relevant to this sim
   }
*/
const SimModules = {};

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function renderSimulationPage(root, simId){
  const meta = SIMULATIONS.find(s=>s.id===simId);
  const mod = SimModules[simId];
  if(!meta){ root.innerHTML = `<div class="empty-state">Simulation not found.</div>`; return; }
  Store.markVisited(simId);

  const progress = Store.state.progress[simId] || {};
  const bookmarked = Store.isBookmarked('sim', simId);

  root.innerHTML = `
    <div class="sim-crumb">Exhibit ${meta.num} · ${escapeHtml(meta.era)}</div>
    <div class="sim-header">
      <h1>${escapeHtml(meta.title)}</h1>
      <span class="badge">${progress.completed ? '✓ Completed' : 'In progress'}</span>
      <span class="spacer" style="flex:1"></span>
      <button class="btn-ghost-icon" id="bkBtn" title="Bookmark">${bookmarked ? Icons.bookmarkFilled : Icons.bookmark}</button>
    </div>
    <p class="muted" style="max-width:680px">${escapeHtml(meta.tagline)}</p>

    <div class="sim-tabs" id="simTabs">
      <div class="sim-tab active" data-pane="overview">Overview</div>
      <div class="sim-tab" data-pane="lab">Laboratory</div>
      <div class="sim-tab" data-pane="evidence">Evidence &amp; Notes</div>
      <div class="sim-tab" data-pane="quiz">Mini Quiz</div>
      <div class="sim-tab" data-pane="summary">Summary</div>
    </div>

    <div class="sim-pane active" data-pane="overview">
      <div class="panel" style="padding:20px">
        <div class="info-block">
          <h4>Learning Objectives</h4>
          <ul>${meta.objectives.map(o=>`<li>${escapeHtml(o)}</li>`).join('')}</ul>
        </div>
        <hr class="hairline">
        <div class="info-block">
          <h4>Historical Context</h4>
          <p>${escapeHtml(meta.context)}</p>
        </div>
        <hr class="hairline">
        <div class="info-block">
          <h4>Interesting Facts</h4>
          <ul>${meta.facts.map(f=>`<li>${escapeHtml(f)}</li>`).join('')}</ul>
        </div>
        <hr class="hairline">
        <div class="info-block">
          <h4>Common Misconceptions</h4>
          <ul>${meta.misconceptions.map(f=>`<li>${escapeHtml(f)}</li>`).join('')}</ul>
        </div>
        <hr class="hairline">
        <div class="info-block">
          <h4>Real-World Legacy</h4>
          <p>${escapeHtml(meta.legacy)}</p>
        </div>
        <div class="mt16"><button class="btn btn-primary" id="goLabBtn">Enter Laboratory ${Icons.arrow}</button></div>
      </div>
    </div>

    <div class="sim-pane" data-pane="lab">
      <div class="sim-layout">
        <div class="panel stage" id="stageEl"></div>
        <div class="panel side-panel">
          <div>
            <h4 style="color:var(--accent);margin-bottom:10px;font-size:.85rem;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:1px">Evidence Panel</h4>
            <div id="sideStatsEl" class="flex col gap12"></div>
          </div>
          <hr class="hairline">
          <div class="controls-bar" id="controlsEl"></div>
          <hr class="hairline">
          <div class="flex gap8 wrap">
            <button class="btn btn-secondary btn-sm" id="fsBtn">${Icons.fullscreen} Full Screen</button>
            <button class="btn btn-secondary btn-sm" id="shotBtn">${Icons.camera} Screenshot</button>
            <button class="btn btn-secondary btn-sm" id="resetSimBtn">${Icons.reset} Reset</button>
          </div>
        </div>
      </div>
    </div>

    <div class="sim-pane" data-pane="evidence">
      <div class="sim-layout">
        <div class="panel" style="padding:18px">
          <h4 style="color:var(--accent)">Observation Notes</h4>
          <p class="muted">Record what you observe during the simulation. Notes are saved automatically on this device.</p>
          <textarea class="field" id="notesArea" style="width:100%;min-height:180px;background:rgba(0,0,0,.18);border:1px solid var(--panel-border);border-radius:10px;color:var(--text);padding:12px;font-family:var(--font-body)" placeholder="Write your observations, comparisons, and questions here...">${escapeHtml(Store.getNotes(simId))}</textarea>
          <div class="flex gap8 mt8">
            <button class="btn btn-secondary btn-sm" id="saveNotesBtn">Save Notes</button>
            <button class="btn btn-tertiary btn-sm" id="exportNotesBtn">${Icons.download} Export Notes (.txt)</button>
          </div>
          ${mod && mod.mapSvg ? `<hr class="hairline"><h4 style="color:var(--accent)">Interactive Map</h4><div class="stage-canvas-wrap" style="padding:10px">${mod.mapSvg}</div>` : ''}
        </div>
        <div class="panel" style="padding:18px">
          <h4 style="color:var(--accent)">Related Museum Artifacts</h4>
          <div id="relatedArtifacts" class="flex col gap12 mt8"></div>
          <hr class="hairline">
          <h4 style="color:var(--accent)">Timeline Placement</h4>
          <p class="muted">This exhibit belongs to the <b style="color:var(--text)">${escapeHtml(meta.era)}</b> era. Visit the full Interactive Timeline from the Home screen to see it in context.</p>
        </div>
      </div>
    </div>

    <div class="sim-pane" data-pane="quiz">
      <div class="panel" style="padding:20px;max-width:720px" id="quizWrap"></div>
    </div>

    <div class="sim-pane" data-pane="summary">
      <div class="panel" style="padding:22px;max-width:720px">
        <h4 style="color:var(--accent)">Cause &amp; Effect Recap</h4>
        <p>${escapeHtml(meta.context)}</p>
        <h4 style="color:var(--accent)" class="mt16">Legacy</h4>
        <p>${escapeHtml(meta.legacy)}</p>
        <div class="mt16" id="summaryStatus"></div>
        <div class="flex gap8 mt16">
          <button class="btn btn-primary" id="markDoneBtn">Mark Exhibit Complete</button>
          <button class="btn btn-secondary" id="backHomeBtn">Back to Home</button>
        </div>
      </div>
    </div>
  `;

  // Tab switching
  root.querySelectorAll('.sim-tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      root.querySelectorAll('.sim-tab').forEach(t=>t.classList.remove('active'));
      root.querySelectorAll('.sim-pane').forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      root.querySelector(`.sim-pane[data-pane="${tab.dataset.pane}"]`).classList.add('active');
      if(tab.dataset.pane==='lab') ensureMounted();
    });
  });
  root.querySelector('#goLabBtn').addEventListener('click', ()=>{
    root.querySelector('.sim-tab[data-pane="lab"]').click();
  });
  root.querySelector('#backHomeBtn').addEventListener('click', ()=> location.hash = '#/home');

  root.querySelector('#bkBtn').addEventListener('click', (e)=>{
    const now = Store.toggleBookmark('sim', simId);
    e.currentTarget.innerHTML = now ? Icons.bookmarkFilled : Icons.bookmark;
    showToast(now ? 'Bookmarked' : 'Bookmark removed');
  });

  // Notes
  root.querySelector('#saveNotesBtn').addEventListener('click', ()=>{
    Store.saveNotes(simId, root.querySelector('#notesArea').value);
    Store.checkAchievements();
    showToast('Notes saved');
  });
  root.querySelector('#exportNotesBtn').addEventListener('click', ()=>{
    const text = `${meta.title} — Investigation Notes\n${'='.repeat(40)}\n\n${root.querySelector('#notesArea').value}`;
    const blob = new Blob([text], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${simId}-notes.txt`;
    a.click();
  });

  // Related artifacts
  const relatedIds = (mod && mod.artifactIds) || [];
  const relWrap = root.querySelector('#relatedArtifacts');
  const related = MUSEUM_DATA.filter(a=>relatedIds.includes(a.id));
  relWrap.innerHTML = related.length ? related.map(a=>`
    <div class="flex gap12" style="align-items:center">
      <div style="width:44px;height:44px;border-radius:10px;background:${a.color}33;border:1px solid ${a.color};display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">🏺</div>
      <div><b style="font-size:.85rem">${escapeHtml(a.name)}</b><div class="muted">${escapeHtml(a.era)}</div></div>
    </div>`).join('') : `<p class="muted">No linked artifacts.</p>`;

  // Quiz
  renderQuiz(root.querySelector('#quizWrap'), simId, (mod && mod.quiz) || []);

  // Summary status + mark complete
  function refreshSummary(){
    const p = Store.state.progress[simId] || {};
    root.querySelector('#summaryStatus').innerHTML = p.completed
      ? `<span class="badge">✓ Completed · Best quiz score ${p.bestScore||0}</span>`
      : `<span class="muted">Not yet marked complete. Try the Mini Quiz, then mark this exhibit complete.</span>`;
  }
  refreshSummary();
  root.querySelector('#markDoneBtn').addEventListener('click', ()=>{
    const q = Store.state.quizHistory[simId];
    Store.markCompleted(simId, q ? q.score : 0, q ? q.total : ((mod&&mod.quiz)||[]).length);
    refreshSummary();
    showToast('Exhibit marked complete — XP awarded');
    const unlocked = Store.checkAchievements();
    unlocked.forEach(a=> setTimeout(()=>showToast(`🏆 Achievement unlocked: ${a.name}`), 500));
  });

  // Lab mount (lazy)
  let mounted = false;
  function ensureMounted(){
    if(mounted || !mod) return;
    mounted = true;
    const stageEl = root.querySelector('#stageEl');
    const sideStatsEl = root.querySelector('#sideStatsEl');
    const controlsEl = root.querySelector('#controlsEl');
    const api = makeSimApi(simId, stageEl);
    try{
      mod.mount(stageEl, sideStatsEl, controlsEl, api);
    }catch(err){
      console.error(err);
      stageEl.innerHTML = `<div class="empty-state">This simulation could not load. Please reset and try again.</div>`;
    }
    root.querySelector('#fsBtn').addEventListener('click', ()=>{
      const wrap = stageEl;
      if(!document.fullscreenElement){ wrap.requestFullscreen?.(); } else { document.exitFullscreen?.(); }
    });
    root.querySelector('#shotBtn').addEventListener('click', ()=>{
      const canvas = stageEl.querySelector('canvas');
      if(!canvas){ showToast('No visual to capture yet'); return; }
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${simId}-screenshot.png`;
      a.click();
    });
    root.querySelector('#resetSimBtn').addEventListener('click', ()=>{
      if(api._reset) api._reset();
      showToast('Simulation reset');
    });
  }
}

function makeSimApi(simId, stageEl){
  const api = {
    onReset(fn){ api._reset = fn; },
    setStatsTarget(el){ api._statsEl = el; },
    renderStats(list){
      // list: [{label, value, max, kind:'good'|'warn'|'bad'|'info'|'gold', display}]
      const el = document.querySelector(`.sim-pane[data-pane="lab"] #sideStatsEl`);
      if(!el) return;
      el.innerHTML = list.map(s=>{
        const pct = Math.max(0, Math.min(100, (s.value/(s.max||100))*100));
        return `<div class="stat-bar stat-${s.kind||'gold'}">
          <div class="row"><span>${escapeHtml(s.label)}</span><span>${s.display!==undefined?escapeHtml(String(s.display)):Math.round(s.value)}</span></div>
          <div class="track"><i style="width:${pct}%"></i></div>
        </div>`;
      }).join('');
    },
    renderControls(buttons){
      const el = document.querySelector(`.sim-pane[data-pane="lab"] #controlsEl`);
      if(!el) return;
      el.innerHTML = '';
      buttons.forEach(b=>{
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary btn-sm';
        btn.innerHTML = (b.icon||'') + ' ' + escapeHtml(b.label);
        btn.disabled = !!b.disabled;
        btn.addEventListener('click', b.onClick);
        el.appendChild(btn);
      });
    },
    toast: showToast,
    icons: Icons,
  };
  return api;
}

function renderQuiz(wrap, simId, questions){
  if(!questions.length){ wrap.innerHTML = `<div class="empty-state">Quiz coming soon for this exhibit.</div>`; return; }
  let score = 0, answered = 0;
  wrap.innerHTML = `<div class="flex gap8" style="justify-content:space-between;align-items:center">
      <h4 style="color:var(--accent);margin:0">Test Your Understanding</h4>
      <span class="muted" id="quizProgress">0 / ${questions.length}</span>
    </div><hr class="hairline">` +
    questions.map((q,i)=>`
      <div class="quiz-q" data-qi="${i}">
        <p class="qtext">${i+1}. ${escapeHtml(q.q)}</p>
        ${q.options.map((opt,oi)=>`<div class="quiz-opt" data-oi="${oi}">${escapeHtml(opt)}</div>`).join('')}
        <div class="quiz-feedback" style="display:none"></div>
        ${q.hint ? `<div class="muted" style="margin-top:4px">💡 ${escapeHtml(q.hint)}</div>` : ''}
      </div>`).join('') +
    `<div class="mt16" id="quizResult"></div>`;

  wrap.querySelectorAll('.quiz-q').forEach(qEl=>{
    const qi = +qEl.dataset.qi;
    const q = questions[qi];
    qEl.querySelectorAll('.quiz-opt').forEach(optEl=>{
      optEl.addEventListener('click', ()=>{
        if(qEl.classList.contains('done')) return;
        qEl.classList.add('done');
        const oi = +optEl.dataset.oi;
        const fb = qEl.querySelector('.quiz-feedback');
        qEl.querySelectorAll('.quiz-opt').forEach(o=>o.classList.add('locked'));
        if(oi===q.correct){
          optEl.classList.add('correct'); score++;
        }else{
          optEl.classList.add('wrong');
          qEl.querySelectorAll('.quiz-opt')[q.correct].classList.add('correct');
        }
        fb.style.display='block';
        fb.textContent = q.explain || '';
        answered++;
        wrap.querySelector('#quizProgress').textContent = `${answered} / ${questions.length}`;
        if(answered===questions.length){
          Store.markCompleted(simId, score, questions.length);
          wrap.querySelector('#quizResult').innerHTML = `<div class="panel" style="padding:14px;text-align:center">
            <b style="font-size:1.1rem">You scored ${score} / ${questions.length}</b>
            <p class="muted mt8">${score===questions.length ? 'Perfect score — excellent historical reasoning!' : 'Review the explanations above, then revisit the Laboratory tab to explore further.'}</p>
          </div>`;
          const unlocked = Store.checkAchievements();
          unlocked.forEach(a=> setTimeout(()=>showToast(`🏆 Achievement unlocked: ${a.name}`), 400));
        }
      });
    });
  });
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> t.classList.remove('show'), 2600);
}
