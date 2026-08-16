(function(){
  let agent="water"; // water | wind | ice | gravity
  let energy=5;
  let running=false;
  let particles=[];
  let deposited=0;
  let rafId=null;

  const AGENT_INFO = {
    water:{ label:"Running Water", icon:"💧", color:"#26C6DA",
      explain:"Rivers pick up and carry sediment downstream. Faster, higher-energy flow carries larger, heavier particles; as the current slows near the mouth, sediment drops out and builds a delta." },
    wind:{ label:"Wind", icon:"🌬️", color:"#B0BEC5",
      explain:"Wind erosion mainly moves fine sand and dust by saltation (bouncing) and suspension. Where wind slows — behind an obstacle, for example — sand settles and can build dunes." },
    ice:{ label:"Glacial Ice", icon:"🧊", color:"#81D4FA",
      explain:"Moving glacial ice scours and plucks rock from the land surface, carrying debris of all sizes (till) within and beneath the ice, dumping unsorted sediment where it eventually melts." },
    gravity:{ label:"Gravity (Mass Wasting)", icon:"⛰️", color:"#8D6E63",
      explain:"On steep slopes, gravity alone pulls loose rock and soil downhill — as rockfalls, slides or slow creep — piling debris at the base of the slope (a talus)." },
  };

  function spawnParticle(w,h){
    const sx = w*0.12, sy = h*0.18;
    let p = { x:sx, y:sy, vx:0, vy:0, r: 2+Math.random()*2.4, life:0 };
    particles.push(p);
  }

  function stepParticles(w,h){
    const speed = 0.6 + energy*0.35;
    particles.forEach(p=>{
      p.life++;
      if(agent==="water"){
        // follow a channel curve toward lower right
        const targetX = w*0.12 + (p.life*speed*1.6);
        const t = Math.min(1, targetX/(w*0.78));
        p.x = w*0.12 + t*(w*0.78);
        p.y = h*0.18 + t*(h*0.55) + Math.sin(t*8)*4;
      } else if(agent==="wind"){
        p.x += speed*2.2 + Math.random()*1.5;
        p.y = h*0.55 + Math.sin(p.x*0.05)*6*Math.random();
      } else if(agent==="ice"){
        p.x += speed*0.9;
        p.y = h*0.3 + (p.x-w*0.12)*0.28 + (Math.random()-0.5)*6;
      } else { // gravity
        p.x += speed*0.5;
        p.y += speed*2.4;
      }
    });
    // deposit particles that reach the deposition zone
    const zoneX = w*0.78;
    const before = particles.length;
    particles = particles.filter(p=>{
      const reached = agent==="gravity" ? p.y > h*0.8 : p.x > zoneX;
      if(reached) deposited++;
      return !reached && p.x < w+20 && p.y < h+20;
    });
  }

  function draw(host){
    const c=host.canvas, ctx=host.ctx, w=c.width, h=c.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#EAF3FB"; ctx.fillRect(0,0,w,h);

    // terrain: slope from upper-left to lower-right
    ctx.fillStyle="#C9AE81";
    ctx.beginPath();
    ctx.moveTo(0,h*0.14);
    ctx.lineTo(w*0.12,h*0.18);
    if(agent==="gravity"){
      ctx.lineTo(w*0.35,h*0.85);
      ctx.lineTo(0,h*0.85);
    } else {
      ctx.lineTo(w*0.9,h*0.72);
      ctx.lineTo(0,h);
    }
    ctx.closePath(); ctx.fill();

    // deposition pile
    const pileH = Math.min(80, deposited*1.4);
    ctx.fillStyle = AGENT_INFO[agent].color;
    if(agent==="gravity"){
      ctx.beginPath();
      ctx.moveTo(w*0.35,h*0.85);
      ctx.lineTo(w*0.35+pileH*0.9,h*0.85);
      ctx.lineTo(w*0.35,h*0.85-pileH*0.7);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(w*0.78,h*0.72+ (agent==="water"?h*0.05:0));
      ctx.lineTo(w*0.78+pileH*1.4, h*0.72+(agent==="water"?h*0.05:0));
      ctx.lineTo(w*0.78+pileH*0.7, h*0.72-pileH*0.55+(agent==="water"?h*0.05:0));
      ctx.closePath(); ctx.fill();
    }

    // particles
    ctx.fillStyle="#5D4037";
    particles.forEach(p=>{
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });

    ctx.fillStyle="#212121"; ctx.font="bold 12px 'Nunito Sans'"; ctx.textAlign="center";
    ctx.fillText(AGENT_INFO[agent].icon+" "+AGENT_INFO[agent].label+" — deposited: "+deposited, w/2, h*0.95);
  }

  function loop(host){
    const w=host.canvas.width, h=host.canvas.height;
    if(Math.random() < 0.15+energy*0.05) spawnParticle(w,h);
    stepParticles(w,h);
    draw(host);
    updateText(host);
    if(deposited>=40 && running){ running=false; host.complete(); toggleBtnLabel(); host.toast("Enough sediment deposited — landform built!"); }
    if(running) rafId = requestAnimationFrame(()=>loop(host));
  }

  let runBtn=null;
  function toggleBtnLabel(){ if(runBtn) runBtn.textContent = running? "⏸ Pause" : "▶ Run Erosion"; }

  function updateText(host){
    host.setObs(`${AGENT_INFO[agent].label} is transporting sediment. Deposited so far: <b>${deposited}</b> particle(s) at energy level ${energy}.`);
    host.setExplain(AGENT_INFO[agent].explain);
  }

  function renderControls(host){
    host.controls.innerHTML="";
    EarthLab.ui.chips(host.controls, {
      id:"erosionAgent", label:"Erosion agent", value:agent,
      options:Object.entries(AGENT_INFO).map(([k,v])=>({value:k,label:v.icon+" "+v.label})),
      onChange:(v)=>{ agent=v; particles=[]; deposited=0; draw(host); updateText(host); }
    });
    EarthLab.ui.slider(host.controls, { id:"erosionEnergy", label:"Energy / speed", min:1,max:10,step:1,value:energy, onInput:(v)=>{energy=v;} });
    runBtn = EarthLab.ui.button(host.controls, { label:"▶ Run Erosion", onClick:()=>{
      running = !running;
      toggleBtnLabel();
      if(running) loop(host);
    }});
  }

  function reset(host){
    running=false; if(rafId) cancelAnimationFrame(rafId);
    particles=[]; deposited=0; agent="water"; energy=5;
    renderControls(host); draw(host); updateText(host);
  }

  EarthLab.registerSim({
    id:"erosion",
    title:"Erosion & Deposition Lab",
    objective:"Investigate how water, wind, ice and gravity transport sediment, and observe how deposition builds new landforms where the transporting agent loses energy.",
    intro:"Choose an erosion agent and watch sediment travel from source to deposition zone.",
    explainDefault:"Press Run to start moving sediment with the selected agent.",
    findings:[
      "Erosion transports material that weathering has already broken down.",
      "Each agent — water, wind, ice, gravity — moves sediment in a distinctive pattern.",
      "Deposition happens wherever the transporting agent slows down or loses energy.",
      "Higher energy (faster flow, stronger wind) can move larger sediment."
    ],
    glossaryTerms:["Erosion","Deposition","Sediment"],
    mount(host){ reset(host); return ()=>{ running=false; if(rafId) cancelAnimationFrame(rafId); }; },
    reset(host){ reset(host); },
    randomize(host){
      const keys=Object.keys(AGENT_INFO); agent=keys[Math.floor(Math.random()*keys.length)];
      energy = Math.floor(Math.random()*10)+1;
      particles=[]; deposited=Math.floor(Math.random()*30);
      renderControls(host); draw(host); updateText(host);
    },
    quiz:[
      { q:"Which of these is NOT a natural agent of erosion?", options:["Water","Wind","Gravity","Magnetism"], answer:3, explain:"Water, wind, ice and gravity move sediment; magnetism does not." },
      { q:"Deposition occurs when the transporting agent:", options:["Speeds up","Loses energy / slows down","Freezes solid","Disappears instantly"], answer:1, explain:"As an agent like water or wind loses energy, it can no longer carry sediment, which settles out." },
      { q:"A river builds a delta where it:", options:["Speeds up entering the sea","Slows down entering a lake or sea","Freezes","Turns to gravity flow"], answer:1, explain:"As the river's current slows at its mouth, it drops the sediment it was carrying, building a delta." },
      { q:"Moving glacial ice transports sediment as:", options:["Perfectly sorted, single-sized grains","Unsorted debris of many sizes (till)","Only dissolved minerals","Only volcanic ash"], answer:1, explain:"Glaciers carry and dump unsorted mixtures of debris called till." },
    ]
  });
})();
