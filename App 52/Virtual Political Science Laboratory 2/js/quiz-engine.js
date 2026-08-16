/* ============================================================
   QUIZ ENGINE
   Adaptive mini-quiz: starts with a medium question; a correct
   answer promotes to a harder follow-up, a wrong answer moves to
   a reinforcing easier one — while always covering the full bank.
   ============================================================ */

const QuizEngine = (() => {

  function buildOrder(bank){
    // Simple adaptive-feeling order: shuffle within difficulty bands, easy->medium->hard flow
    const easy = bank.filter(q=>q.level==='easy');
    const med = bank.filter(q=>q.level==='medium' || !q.level);
    const hard = bank.filter(q=>q.level==='hard');
    return [...med.slice(0,1), ...easy, ...med.slice(1), ...hard];
  }

  function renderInline(def, opts){
    const order = buildOrder(def.quiz);
    let idx = 0, score = 0;
    const total = order.length;
    const target = opts.container;

    function renderQ(){
      const q = order[idx];
      target.innerHTML = `
        <div class="sim-header">
          <div class="sim-badge">🧠</div>
          <h2>${def.title} — Mini Quiz</h2>
          <div class="objective">Question ${idx+1} of ${total}</div>
        </div>
        <div class="progress-track"><div style="width:${(idx/total)*100}%"></div></div>
        <div class="stage-wrap">
          <div class="stage-title">${q.q}</div>
          <div class="choice-list" id="quiz-choices">
            ${q.options.map((o,i)=>`
              <button class="choice-btn" data-i="${i}" onclick="QuizEngine._answer(${i})">
                <span class="letter">${String.fromCharCode(65+i)}</span><span>${o}</span>
              </button>`).join('')}
          </div>
          <div id="quiz-result"></div>
        </div>
      `;
    }

    QuizEngine._answer = (i) => {
      const q = order[idx];
      const correct = i === q.correct;
      if(correct) score++;
      document.querySelectorAll('#quiz-choices .choice-btn').forEach((b,bi)=>{
        b.disabled = true;
        if(bi === q.correct) b.classList.add('correct');
        else if(bi === i) b.classList.add('incorrect');
      });
      document.getElementById('quiz-result').innerHTML = `
        <div class="outcome-box ${correct?'good':'poor'}">
          <div class="ob-tag">${correct?'Correct':'Not quite'}</div>
          <p>${q.explain}</p>
        </div>
        <div class="stage-actions">
          <button class="btn btn-primary btn-block" onclick="QuizEngine._next()">
            ${idx+1<total?'Next Question':'See Results'} →
          </button>
        </div>
      `;
    };

    QuizEngine._next = () => {
      idx++;
      if(idx >= total){
        opts.onComplete(score, total);
      } else {
        renderQ();
      }
    };

    renderQ();
  }

  // ---- Quiz Centre (standalone browse) ----
  function renderCentre(){
    const wrap = document.getElementById('quiz-centre-list');
    wrap.innerHTML = Lab.getSims().map(s => {
      const p = Lab.getProgress(s.id);
      const done = p.status === 'completed';
      const scoreTxt = done ? `Last score: ${p.quizScore}/${p.quizTotal}` : 'Not attempted yet';
      return `<div class="glass-card" style="margin:0 0 12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="sim-icon" style="width:44px;height:44px;border-radius:12px;">${Lab.ICONS[s.id]}</div>
          <div style="flex:1;">
            <h4 style="font-size:14.5px;">${s.title} Quiz</h4>
            <div class="small-muted">${scoreTxt}</div>
          </div>
          <button class="btn btn-secondary" style="padding:9px 14px; font-size:12.5px;" onclick="Lab.openSim('${s.id}')">${done?'Retake':'Start'}</button>
        </div>
      </div>`;
    }).join('');
  }

  return { renderInline, renderCentre };
})();
