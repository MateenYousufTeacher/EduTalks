(function(){
  const NODES = {
    magma:       { x:0.5, y:0.14, label:"Magma",             icon:"🔥", color:"#E64A19" },
    igneous:     { x:0.84,y:0.42, label:"Igneous Rock",      icon:"🪨", color:"#8D6E63" },
    metamorphic: { x:0.68,y:0.82, label:"Metamorphic Rock",  icon:"💠", color:"#7E57C2" },
    sedimentary: { x:0.32,y:0.82, label:"Sedimentary Rock",  icon:"🟫", color:"#C99A56" },
    sediment:    { x:0.16,y:0.42, label:"Sediment",          icon:"🏖️", color:"#D9C08A" },
  };
  const EDGES = [
    { from:"magma",       to:"igneous",      label:"Cooling & Crystallization" },
    { from:"igneous",     to:"magma",        label:"Melting" },
    { from:"igneous",     to:"sediment",     label:"Weathering & Erosion" },
    { from:"igneous",     to:"metamorphic",  label:"Heat & Pressure" },
    { from:"sediment",    to:"sedimentary",  label:"Compaction & Cementation" },
    { from:"sedimentary", to:"sediment",     label:"Weathering & Erosion" },
    { from:"sedimentary", to:"metamorphic",  label:"Heat & Pressure" },
    { from:"sedimentary", to:"magma",        label:"Melting" },
    { from:"metamorphic", to:"sediment",     label:"Weathering & Erosion" },
    { from:"metamorphic", to:"magma",        label:"Melting" },
  ];
  const EXPLAIN = {
    "Cooling & Crystallization":"As magma cools, minerals crystallize and interlock, forming solid igneous rock. Slow cooling underground makes large crystals; fast cooling at the surface makes tiny ones.",
    "Melting":"Enough heat breaks the bonds holding a rock's minerals together, turning it back into molten magma — resetting the cycle.",
    "Weathering & Erosion":"Physical and chemical weathering break rock into loose fragments, which are then eroded — transported away by water, wind or ice — becoming sediment.",
    "Heat & Pressure":"Burial deep underground exposes rock to intense heat and pressure. Its minerals recrystallize in the solid state, forming banded or dense metamorphic rock.",
    "Compaction & Cementation":"Layers of sediment pile up, squeezing out water (compaction) while dissolved minerals glue the grains together (cementation), forming solid sedimentary rock.",
  };

  let current = "magma";
  let path = [];
  let animT = null, animFrom=null, animTo=null, animProgress=0;

  function possibleEdges(){ return EDGES.filter(e=>e.from===current); }

  function draw(host){
    const c = host.canvas, ctx = host.ctx;
    const w = c.width, h = c.height;
    ctx.clearRect(0,0,w,h);
    // background
    ctx.fillStyle = "#EAF3FB"; ctx.fillRect(0,0,w,h);

    // edges
    EDGES.forEach(e=>{
      const a = NODES[e.from], b = NODES[e.to];
      ctx.strokeStyle = "rgba(13,71,161,0.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.x*w, a.y*h);
      ctx.lineTo(b.x*w, b.y*h);
      ctx.stroke();
    });

    // animated particle
    if(animFrom && animTo){
      const a = NODES[animFrom], b = NODES[animTo];
      const px = a.x*w + (b.x*w-a.x*w)*animProgress;
      const py = a.y*h + (b.y*h-a.y*h)*animProgress;
      ctx.beginPath();
      ctx.arc(px,py,9,0,Math.PI*2);
      ctx.fillStyle = "#FFB300";
      ctx.shadowColor="#FFB300"; ctx.shadowBlur=14;
      ctx.fill();
      ctx.shadowBlur=0;
    }

    // nodes
    Object.entries(NODES).forEach(([key,n])=>{
      const x=n.x*w, y=n.y*h;
      const active = key===current;
      ctx.beginPath();
      ctx.arc(x,y, active?38:30, 0, Math.PI*2);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = active?1:0.55;
      ctx.fill();
      if(active){ ctx.lineWidth=4; ctx.strokeStyle="#FFB300"; ctx.stroke(); }
      ctx.globalAlpha=1;
      ctx.font = (active?"26px":"20px")+" sans-serif";
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText(n.icon, x, y);
      ctx.fillStyle="#212121"; ctx.font="bold 11px 'Nunito Sans',sans-serif";
      ctx.fillText(n.label, x, y+(active?52:44));
    });
  }

  function applyTransition(host, edge){
    animFrom = edge.from; animTo = edge.to; animProgress = 0;
    const step = ()=>{
      animProgress += 0.045;
      draw(host);
      if(animProgress < 1){ animT = requestAnimationFrame(step); }
      else {
        current = edge.to;
        path.push(edge.label);
        animFrom = animTo = null;
        draw(host);
        renderControls(host);
        host.setObs(`You applied <b>${edge.label}</b>. The material is now <b>${NODES[edge.to].label}</b>.`);
        host.setExplain(EXPLAIN[edge.label]);
        if(new Set(path).size >= 4) host.complete();
      }
    };
    animT = requestAnimationFrame(step);
  }

  function renderControls(host){
    host.controls.innerHTML = "";
    const startWrap = document.createElement("div");
    startWrap.className = "control-row";
    startWrap.innerHTML = `<label>Current material: <span class="val">${NODES[current].icon} ${NODES[current].label}</span></label>`;
    host.controls.appendChild(startWrap);

    const label = document.createElement("div");
    label.className = "control-row";
    label.innerHTML = `<label>Choose a geological process to apply</label>`;
    host.controls.appendChild(label);

    const chipRow = document.createElement("div");
    chipRow.className = "chip-row";
    possibleEdges().forEach(edge=>{
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = edge.label+" → "+NODES[edge.to].label;
      b.addEventListener("click", ()=> applyTransition(host, edge));
      chipRow.appendChild(b);
    });
    host.controls.appendChild(chipRow);

    const pathBox = document.createElement("div");
    pathBox.className = "control-row";
    pathBox.innerHTML = `<label>Your transformation path (${path.length})</label><div style="font-size:.8rem;opacity:.8;">${path.length? path.map((p,i)=>(i+1)+". "+p).join("<br>") : "No processes applied yet."}</div>`;
    host.controls.appendChild(pathBox);
  }

  function reset(host){
    current = "magma"; path = []; animFrom=animTo=null;
    if(animT) cancelAnimationFrame(animT);
    draw(host);
    renderControls(host);
    host.setObs("Start by choosing a process to apply to the magma.");
    host.setExplain("Every arrow in the diagram is a real geological process. Follow different paths to see how rocks can enter the cycle at any stage.");
  }

  EarthLab.registerSim({
    id:"rockcycle",
    title:"Rock Cycle Explorer",
    objective:"Investigate how igneous, sedimentary and metamorphic rocks transform into one another through geological processes, and discover that the rock cycle has no fixed starting or ending point.",
    intro:"Drive rock material around the cycle by choosing real geological processes.",
    explainDefault:"Every arrow in the diagram is a real geological process. Follow different paths to see how rocks can enter the cycle at any stage.",
    findings:[
      "The rock cycle is not one-directional — any rock type can eventually become any other.",
      "Melting always produces magma, regardless of the starting rock type.",
      "Heat and pressure transform rock without melting it completely.",
      "Weathering + erosion + compaction + cementation together turn rock into sedimentary rock."
    ],
    glossaryTerms:["Igneous rock","Sedimentary rock","Metamorphic rock"],
    mount(host){
      reset(host);
      return ()=>{ if(animT) cancelAnimationFrame(animT); };
    },
    reset(host){ reset(host); },
    randomize(host){
      const edges = possibleEdges();
      if(edges.length) applyTransition(host, edges[Math.floor(Math.random()*edges.length)]);
    },
    quiz:[
      { q:"What process turns magma into igneous rock?", options:["Melting","Cooling & Crystallization","Weathering","Compaction"], answer:1, explain:"As magma cools, minerals crystallize and lock together to form solid igneous rock." },
      { q:"Sediment becomes sedimentary rock through which processes?", options:["Melting and cooling","Heat and pressure","Compaction and cementation","Weathering only"], answer:2, explain:"Compaction squeezes out water while cementation glues sediment grains together." },
      { q:"Which process can turn ANY rock type back into magma?", options:["Erosion","Melting","Cooling","Cementation"], answer:1, explain:"Sufficient heat melts any rock — igneous, sedimentary or metamorphic — back into magma." },
      { q:"Metamorphic rock forms when existing rock is exposed to:", options:["Wind and rain","Heat and pressure without melting","Direct sunlight","Ocean waves only"], answer:1, explain:"Heat and pressure recrystallize minerals in the solid state, without full melting." },
      { q:"True or false: the rock cycle always moves in one fixed direction.", options:["True","False"], answer:1, explain:"False — rock can enter or leave the cycle at any stage, in many different sequences." },
    ]
  });
})();
