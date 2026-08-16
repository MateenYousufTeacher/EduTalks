(function(){
  const TOTAL = 4600; // million years ago, Earth's formation
  const ERAS = [
    { name:"Hadean",       start:4600, end:4000, color:"#5D4037" },
    { name:"Archean",      start:4000, end:2500, color:"#795548" },
    { name:"Proterozoic",  start:2500, end:541,  color:"#8D6E63" },
    { name:"Paleozoic",    start:541,  end:252,  color:"#43A047" },
    { name:"Mesozoic",     start:252,  end:66,   color:"#26C6DA" },
    { name:"Cenozoic",     start:66,   end:0,    color:"#1976D2" },
  ];
  const EVENTS = [
    { mya:4540, label:"Earth forms", icon:"🌍" },
    { mya:3800, label:"First life (single-celled)", icon:"🦠" },
    { mya:2400, label:"Great Oxidation Event", icon:"💨" },
    { mya:1200, label:"First multicellular life", icon:"🧫" },
    { mya:541,  label:"Cambrian Explosion", icon:"🐛" },
    { mya:470,  label:"First land plants", icon:"🌿" },
    { mya:375,  label:"First four-limbed animals", icon:"🐸" },
    { mya:252,  label:"Permian mass extinction", icon:"☠️" },
    { mya:230,  label:"Dinosaurs appear", icon:"🦕" },
    { mya:150,  label:"First birds", icon:"🐦" },
    { mya:66,   label:"Asteroid impact — dinosaurs extinct", icon:"☄️" },
    { mya:6,    label:"Early human ancestors", icon:"🦴" },
    { mya:0.3,  label:"Modern humans (Homo sapiens)", icon:"🧑" },
  ];

  let mya = 2000;

  function eraAt(v){ return ERAS.find(e=> v<=e.start && v>=e.end) || ERAS[ERAS.length-1]; }
  function xFor(v, w){ return w * (1 - v/TOTAL); }

  function draw(host){
    const c=host.canvas, ctx=host.ctx, w=c.width, h=c.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#EAF3FB"; ctx.fillRect(0,0,w,h);

    const barY=h*0.42, barH=h*0.22;
    ERAS.forEach(e=>{
      const x1=xFor(e.start,w), x2=xFor(e.end,w);
      ctx.fillStyle=e.color;
      ctx.fillRect(x1,barY,x2-x1,barH);
      if(x2-x1>34){
        ctx.fillStyle="#fff"; ctx.font="bold 10px sans-serif"; ctx.textAlign="center";
        ctx.fillText(e.name,(x1+x2)/2, barY+barH/2+4);
      }
    });
    ctx.strokeStyle="#212121"; ctx.lineWidth=1.4;
    ctx.strokeRect(0,barY,w,barH);

    // event ticks
    EVENTS.forEach(ev=>{
      const x = xFor(ev.mya,w);
      ctx.strokeStyle="rgba(33,33,33,0.5)";
      ctx.beginPath(); ctx.moveTo(x,barY-6); ctx.lineTo(x,barY); ctx.stroke();
      ctx.font="13px sans-serif"; ctx.textAlign="center";
      ctx.fillText(ev.icon, x, barY-12);
    });

    // marker for current position
    const mx = xFor(mya,w);
    ctx.strokeStyle="#FFB300"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(mx,barY-30); ctx.lineTo(mx,barY+barH+30); ctx.stroke();
    ctx.beginPath(); ctx.arc(mx,barY-30,6,0,Math.PI*2); ctx.fillStyle="#FFB300"; ctx.fill();

    ctx.fillStyle="#212121"; ctx.font="bold 13px 'Nunito Sans'"; ctx.textAlign="center";
    ctx.fillText("You are here: "+fmt(mya)+" ("+eraAt(mya).name+" Era)", w/2, barY+barH+56);
    ctx.font="10px 'Nunito Sans'";
    ctx.fillText("Bar is proportional to real time — notice how thin the Phanerozoic (visible-life) eon is compared to Precambrian time.", w/2, barY+barH+74);
  }
  function fmt(v){ return v>=1 ? Math.round(v)+" million years ago" : Math.round(v*1000)+" thousand years ago"; }

  function nearestEvents(){
    return EVENTS.slice().sort((a,b)=> Math.abs(a.mya-mya)-Math.abs(b.mya-mya)).slice(0,3);
  }

  function updateText(host){
    const era = eraAt(mya);
    host.setObs(`At ${fmt(mya)}, Earth was in the <b>${era.name}</b> Era. Nearest events: ${nearestEvents().map(e=>e.icon+" "+e.label+" ("+fmt(e.mya)+")").join(" · ")}`);
    host.setExplain(eraExplain(era.name));
  }
  function eraExplain(name){
    const map = {
      Hadean:"Earth had just formed and was extremely hot, with no solid crust yet and constant asteroid bombardment.",
      Archean:"Earth cooled enough to form crust and oceans; the first single-celled life appeared in the seas.",
      Proterozoic:"Oxygen accumulated in the atmosphere (Great Oxidation Event) and complex, multicellular life eventually evolved.",
      Paleozoic:"Life diversified explosively in the oceans and colonised land — plants, insects, fish, amphibians and reptiles all appeared.",
      Mesozoic:"The \"Age of Reptiles\" — dinosaurs dominated the land until an asteroid impact ended the era 66 million years ago.",
      Cenozoic:"The \"Age of Mammals\" — following the dinosaur extinction, mammals diversified, eventually including humans.",
    };
    return map[name]||"";
  }

  function renderControlsFixed(host){
    host.controls.innerHTML="";
    const wrap = document.createElement("div");
    wrap.className="control-row";
    wrap.innerHTML = `<label>Travel through time <span class="val" id="tlVal">${fmt(mya)}</span></label>
      <input type="range" id="tlSlider" min="0" max="${TOTAL}" step="1" value="${TOTAL-mya}">`;
    host.controls.appendChild(wrap);
    const input = wrap.querySelector("#tlSlider");
    input.addEventListener("input", ()=>{
      mya = TOTAL - parseInt(input.value,10);
      wrap.querySelector("#tlVal").textContent = fmt(mya);
      draw(host); updateText(host);
      if(Math.abs(mya-0.3)<50 || visitedEnough()) host.complete();
    });

    const jump = document.createElement("div");
    jump.className="control-row";
    jump.innerHTML = `<label>Jump to event</label><div class="chip-row" id="tlEvents"></div>`;
    host.controls.appendChild(jump);
    const row = jump.querySelector("#tlEvents");
    EVENTS.forEach(ev=>{
      const b = document.createElement("button");
      b.className="chip"; b.textContent = ev.icon+" "+ev.label;
      b.addEventListener("click", ()=>{ mya=ev.mya; input.value = TOTAL-mya; wrap.querySelector("#tlVal").textContent=fmt(mya); draw(host); updateText(host); host.complete(); });
      row.appendChild(b);
    });
  }
  let visitCount=0;
  function visitedEnough(){ visitCount++; return visitCount>5; }

  function reset(host){
    mya=2000; visitCount=0;
    renderControlsFixed(host); draw(host); updateText(host);
  }

  EarthLab.registerSim({
    id:"timeline",
    title:"Geological Timeline Explorer",
    objective:"Understand the vast scale of geological (deep) time by exploring Earth's 4.6-billion-year history on a proportional timeline.",
    intro:"Travel through Earth's history and see how eras and major events compare in scale.",
    explainDefault:"Drag the slider or jump to an event to explore Earth's geological history.",
    findings:[
      "Earth is about 4.6 billion years old — an almost incomprehensibly long span called deep time.",
      "Visible complex life (the Phanerozoic eon) covers only the last ~541 million years — a thin sliver of Earth's history.",
      "Modern humans have existed for only the last few hundred thousand years — a tiny fraction of deep time.",
      "Relative dating (superposition) and radiometric dating together let scientists place events on this timescale."
    ],
    glossaryTerms:["Deep time","Radiometric dating","Superposition"],
    mount(host){ reset(host); },
    reset(host){ reset(host); },
    randomize(host){ mya = Math.random()*TOTAL; renderControlsFixed(host); draw(host); updateText(host); },
    quiz:[
      { q:"Approximately how old is the Earth?", options:["4.6 million years", "4.6 billion years", "100,000 years", "1 billion years"], answer:1, explain:"Earth formed about 4.6 billion years ago." },
      { q:"The Phanerozoic eon (visible complex life) covers roughly what share of Earth's history?", options:["About 90%", "About 50%", "Only about 12% (the most recent ~541 My)", "Exactly half"], answer:2, explain:"Complex visible life is a relatively recent, thin slice of Earth's full 4.6-billion-year history." },
      { q:"The principle that, in undisturbed rock layers, the oldest layer sits at the bottom is called:", options:["Radiometric dating","Superposition","Subduction","Cleavage"], answer:1, explain:"The principle of superposition orders undisturbed sedimentary layers by relative age." },
      { q:"Which event marks the end of the Mesozoic Era?", options:["The Cambrian Explosion","The Great Oxidation Event","An asteroid impact that ended the dinosaurs","The formation of Earth"], answer:2, explain:"An asteroid impact roughly 66 million years ago ended the Mesozoic and the non-avian dinosaurs." },
    ]
  });
})();
