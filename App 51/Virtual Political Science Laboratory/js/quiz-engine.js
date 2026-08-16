/* ============================================================
   QUIZ ENGINE — reusable adaptive quiz renderer
   Question shape: {type:'mcq'|'tf'|'ar', q, options, answer, explain}
   ============================================================ */
const VPSL_QUIZ = (() => {
  function shuffle(arr){
    const a = [...arr];
    for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }

  function render(container, questions, simId){
    let score = 0;
    let answered = 0;
    const total = questions.length;

    container.innerHTML = `
      <div class="glass card" style="margin-bottom:16px;">
        <h4>🎯 Mini Quiz — ${total} Questions</h4>
        <p>Answer each question. You'll see instant feedback with an explanation. Retake anytime to beat your best score.</p>
      </div>
      <div id="quiz-progress" class="notice info" style="margin-bottom:14px;">Question <span id="qp-cur">0</span> of ${total} answered · Score: <span id="qp-score">0</span></div>
      <div id="quiz-questions"></div>
      <div id="quiz-result" style="display:none;"></div>
    `;

    const qWrap = container.querySelector('#quiz-questions');
    questions.forEach((q, idx)=>{
      const opts = q.type==='tf' ? ['True','False'] : q.options;
      const div = document.createElement('div');
      div.className = 'glass quiz-q';
      div.innerHTML = `
        <span class="badge blue" style="margin-bottom:8px;display:inline-block;">${q.type==='ar'?'Assertion–Reason':q.type==='tf'?'True / False':'Multiple Choice'}</span>
        <h5>${idx+1}. ${q.q}</h5>
        <div class="opts"></div>
        <div class="quiz-explain" style="display:none;"></div>
      `;
      const optsWrap = div.querySelector('.opts');
      opts.forEach(opt=>{
        const btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.textContent = opt;
        btn.addEventListener('click', ()=>{
          if(div.dataset.done) return;
          div.dataset.done = '1';
          const correct = opt === q.answer;
          if(correct) score++;
          answered++;
          [...optsWrap.children].forEach(b=>{
            b.disabled = true;
            if(b.textContent===q.answer) b.classList.add('correct');
            else if(b===btn) b.classList.add('wrong');
          });
          const ex = div.querySelector('.quiz-explain');
          ex.style.display='block';
          ex.innerHTML = (correct ? '✅ Correct. ' : '❌ Not quite. ') + q.explain;
          container.querySelector('#qp-cur').textContent = answered;
          container.querySelector('#qp-score').textContent = score;
          if(answered===total) finish();
        });
        optsWrap.appendChild(btn);
      });
      qWrap.appendChild(div);
    });

    function finish(){
      const pct = Math.round((score/total)*100);
      VPSL_STORE.recordQuiz(simId, pct);
      const resultDiv = container.querySelector('#quiz-result');
      resultDiv.style.display='block';
      const verdict = pct>=80 ? ['Excellent work!','🏆'] : pct>=60 ? ['Well done — you passed.','👍'] : ['Keep practising — review the explanations above.','📘'];
      resultDiv.innerHTML = `
        <div class="glass card" style="text-align:center;">
          <div style="font-size:36px;">${verdict[1]}</div>
          <h4 style="justify-content:center;">${pct}% — ${verdict[0]}</h4>
          <p>You answered ${score} of ${total} correctly. This score has been saved to your Quiz Centre profile.</p>
          <div class="btn-row" style="justify-content:center;">
            <button class="btn-sm primary" id="quiz-retake">Retake Quiz</button>
          </div>
        </div>`;
      resultDiv.querySelector('#quiz-retake').addEventListener('click', ()=> render(container, shuffle(questions), simId));
      VPSL_UI.toast(`Quiz saved: ${pct}%`, pct>=60 ? '🎉' : '📘');
    }
  }

  return { render, shuffle };
})();
