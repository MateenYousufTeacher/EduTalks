/* Stone Age Life Simulator */
SimModules.stoneage = {
  artifactIds:['seal'],
  mapSvg:`<svg viewBox="0 0 400 160"><rect width="400" height="160" fill="#1a100c"/>
    <circle cx="80" cy="80" r="8" fill="#C49A4E"/><text x="60" y="105" fill="#C9B79A" font-size="10">Olduvai Gorge</text>
    <circle cx="200" cy="50" r="8" fill="#D98E2B"/><text x="170" y="75" fill="#C9B79A" font-size="10">Bhimbetka</text>
    <circle cx="320" cy="100" r="8" fill="#E8C77A"/><text x="290" y="125" fill="#C9B79A" font-size="10">Lascaux</text></svg>`,
  mount(stageEl, sideStatsEl, controlsEl, api){
    const S = SimUtils;
    let st;
    function fresh(){ return { day:1, food:55, warmth:55, safety:45, knowledge:5, farmingUnlocked:false, actions:0, maxActions:3, log:[], playing:false }; }
    st = fresh();

    stageEl.innerHTML = `
      <div class="stage-canvas-wrap"><canvas id="saCanvas"></canvas></div>
      <p class="muted" id="saLog">Choose an action to begin your day at the settlement.</p>
      <div class="toggle-row" id="saActions"></div>
    `;
    const canvas = stageEl.querySelector('#saCanvas');
    const ctx = S.fitCanvas(canvas, 900, 380);

    const actionDefs = [
      { key:'hunt', label:'🏹 Hunt', apply:s=>{ s.food+=S.rand(12,22); s.knowledge+=1; return 'The band tracks game across the plain.'; } },
      { key:'gather', label:'🌾 Gather', apply:s=>{ s.food+=S.rand(6,12); s.knowledge+=1; return 'Berries, roots and seeds are collected.'; } },
      { key:'fire', label:'🔥 Make Fire', apply:s=>{ s.warmth+=S.rand(14,22); s.safety+=4; s.knowledge+=2; return 'A fire is carefully struck and fed.'; } },
      { key:'tools', label:'🔨 Craft Tools', apply:s=>{ s.knowledge+=8; s.safety+=3; return 'Flint is knapped into sharper tools.'; } },
      { key:'shelter', label:'🏕️ Build Shelter', apply:s=>{ s.safety+=14; s.warmth+=4; return 'Branches and hides form a wind-break.'; } },
      { key:'art', label:'🎨 Cave Art', apply:s=>{ s.knowledge+=10; return 'Ochre pigment records the hunt on stone.'; } },
      { key:'farm', label:'🌱 Try Farming', locked:s=>!s.farmingUnlocked, apply:s=>{ s.food+=S.rand(20,30); s.knowledge+=3; return 'Wild grains are deliberately sown near camp.'; } },
    ];

    function renderActions(){
      const row = stageEl.querySelector('#saActions');
      row.innerHTML='';
      actionDefs.forEach(a=>{
        const locked = a.locked && a.locked(st);
        const chip = S.el('div', 'chip'+(locked?'':''), a.label + (locked?' 🔒':''));
        if(locked){ chip.style.opacity=.4; chip.style.cursor='not-allowed'; }
        else chip.addEventListener('click', ()=> doAction(a));
        row.appendChild(chip);
      });
    }

    function doAction(a){
      if(st.actions>=st.maxActions){ api.toast('No actions left today — advance to the next day.'); return; }
      const msg = a.apply(st);
      st.food = S.clamp(st.food,0,100); st.warmth = S.clamp(st.warmth,0,100);
      st.safety = S.clamp(st.safety,0,100); st.knowledge = S.clamp(st.knowledge,0,100);
      st.actions++;
      if(st.knowledge>=45) st.farmingUnlocked = true;
      stageEl.querySelector('#saLog').textContent = msg + ` (${st.actions}/${st.maxActions} actions used today)`;
      refresh();
    }

    function nextDay(){
      st.day++;
      st.food = S.clamp(st.food-14,0,100);
      st.warmth = S.clamp(st.warmth-10,0,100);
      st.safety = S.clamp(st.safety-5,0,100);
      st.actions = 0;
      if(st.food<15 || st.warmth<15) api.toast('⚠️ The band is struggling — food or warmth is critically low.');
      refresh();
    }

    function draw(){
      const w=canvas.width, h=canvas.height;
      const nightFactor = 0.15; // subtle day tone shift by knowledge (symbolic progress, not literal clock)
      ctx.clearRect(0,0,w,h);
      const sky = ctx.createLinearGradient(0,0,0,h*0.6);
      sky.addColorStop(0, `hsl(${20+st.knowledge}, 55%, ${18+st.warmth*0.15}%)`);
      sky.addColorStop(1, '#2a1810');
      ctx.fillStyle = sky; ctx.fillRect(0,0,w,h*0.62);
      ctx.fillStyle = '#1c130d'; ctx.fillRect(0,h*0.6,w,h*0.4);
      // sun/knowledge disc
      ctx.beginPath(); ctx.arc(w-100,70,26+st.knowledge*0.2,0,7); ctx.fillStyle='#D98E2B'; ctx.fill();
      // cave (safety)
      ctx.fillStyle = '#241511'; ctx.beginPath(); ctx.moveTo(40,h*0.62); ctx.quadraticCurveTo(90,h*0.35,160,h*0.62); ctx.fill();
      if(st.knowledge>25){ ctx.fillStyle='#C49A4E'; ctx.font='11px sans-serif';
        for(let i=0;i<Math.min(6,Math.floor(st.knowledge/12));i++) ctx.fillText('〜', 60+i*16, h*0.55); }
      // shelters (safety)
      const huts = Math.floor(st.safety/25);
      for(let i=0;i<huts;i++){
        const hx = 220+i*80, hy=h*0.62;
        ctx.fillStyle='#4A2F1F'; ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx+30,hy-45); ctx.lineTo(hx+60,hy); ctx.fill();
      }
      // fire (warmth)
      const fx=560, fy=h*0.66;
      ctx.beginPath(); ctx.arc(fx,fy,26,0,7); ctx.fillStyle='#3a2418'; ctx.fill();
      const flameH = 14+st.warmth*0.5;
      const grad = ctx.createLinearGradient(fx,fy-flameH,fx,fy);
      grad.addColorStop(0,'#F0B84E'); grad.addColorStop(1,'#D98E2B');
      ctx.fillStyle=grad;
      ctx.beginPath(); ctx.moveTo(fx-10,fy); ctx.quadraticCurveTo(fx, fy-flameH, fx+10, fy); ctx.fill();
      // people (food -> population energy) simple stick figures
      const pop = 3 + Math.floor(st.food/30);
      for(let i=0;i<pop;i++){
        const px = 640+ (i%5)*34, py = h*0.72 + Math.floor(i/5)*30;
        ctx.strokeStyle='#E7D9B8'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px,py+16); ctx.moveTo(px-6,py+24); ctx.lineTo(px,py+16); ctx.lineTo(px+6,py+24);
        ctx.moveTo(px-6,py+6); ctx.lineTo(px+6,py+6); ctx.stroke();
        ctx.beginPath(); ctx.arc(px,py-4,4,0,7); ctx.fillStyle='#E7D9B8'; ctx.fill();
      }
      ctx.fillStyle='#C9B79A'; ctx.font='13px monospace';
      ctx.fillText(`Day ${st.day}`, 16, 26);
      if(st.farmingUnlocked){ ctx.fillStyle='#6E9B60'; ctx.fillText('Agriculture unlocked', 16, 46); }
    }

    function refresh(){
      draw();
      renderActions();
      api.renderStats([
        {label:'Food', value:st.food, kind: st.food<25?'bad':st.food<55?'warn':'good'},
        {label:'Warmth', value:st.warmth, kind: st.warmth<25?'bad':st.warmth<55?'warn':'good'},
        {label:'Safety', value:st.safety, kind: st.safety<25?'bad':st.safety<55?'warn':'good'},
        {label:'Knowledge', value:st.knowledge, kind:'gold'},
        {label:'Day', value:Math.min(st.day,10)*10, display:st.day, kind:'info'},
      ]);
    }

    api.renderControls([
      { label:'Next Day', icon:api.icons.step, onClick: nextDay },
      { label: st.playing? 'Pause':'Auto-Play', icon:api.icons.play, onClick(e){
          st.playing = !st.playing;
          e.target.closest('button').innerHTML = (st.playing?api.icons.pause:api.icons.play) + ' ' + (st.playing?'Pause':'Auto-Play');
          if(st.playing) autoPlay();
        } },
    ]);
    let timer=null;
    function autoPlay(){
      clearTimeout(timer);
      if(!st.playing) return;
      const avail = actionDefs.filter(a=> !(a.locked&&a.locked(st)));
      if(st.actions<st.maxActions) doAction(S.pick(avail)); else nextDay();
      timer = setTimeout(autoPlay, 1100);
    }

    api.onReset(()=>{ st = fresh(); clearTimeout(timer); refresh(); });
    refresh();
  },
  quiz:[
    {q:'What was the first major technological breakthrough that let early humans stay warm and cook food?', options:['Pottery','Controlled fire','The wheel','Metal tools'], correct:1, explain:'Controlled use of fire, roughly 400,000 years ago, transformed diet, warmth and safety.'},
    {q:'What does the archaeological presence of cave art suggest about Stone Age people?', options:['They had no language','They were incapable of planning','They had symbolic and abstract thinking','They lived only underground'], correct:2, explain:'Cave art shows sophisticated symbolic thought, not primitive incapacity.'},
    {q:'Roughly how long ago did agriculture begin in the Fertile Crescent?', options:['About 500 years ago','About 10,000 years ago','About 1 million years ago','About 100 years ago'], correct:1, explain:'Early farming began around 10,000 BCE in the Fertile Crescent.'},
    {q:'Why is the shift from foraging to farming considered gradual rather than sudden?', options:['Because no evidence survives','Because grain took centuries to be domesticated and adopted widely','Because farming was banned at first','Because tools did not exist yet'], correct:1, explain:'Domestication and adoption of farming took many generations in most regions.'},
    {q:'What kind of evidence do archaeologists use to study Stone Age diet?', options:['Written diaries','Tax records','Tool wear, animal bones and plant remains at sites','Photographs'], correct:2, explain:'Without writing, historians rely on physical evidence like bones, seeds and tool residue.'},
  ]
};
