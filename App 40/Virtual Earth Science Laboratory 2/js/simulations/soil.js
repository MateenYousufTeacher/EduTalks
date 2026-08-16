(function(){
  let sand=40, silt=35, clay=25, organic=8, water=30;

  function classify(){
    if(clay>=40) return "Clay";
    if(sand>=70) return "Sandy";
    if(silt>=80) return "Silty";
    if(sand>=45 && clay<20) return "Sandy Loam";
    if(clay>=20 && clay<40 && sand<45 && silt<45) return "Loam";
    return "Loam";
  }
  function drainage(){
    if(sand>=60) return "Fast — water passes quickly, low water retention";
    if(clay>=40) return "Slow — water pools, poor aeration, high water retention";
    return "Moderate — balanced drainage and water retention";
  }

  function normalize(changed){
    // keep sand+silt+clay = 100, adjusting the other two proportionally
    const total = sand+silt+clay;
    if(total===0) return;
    const scale = 100/total;
    sand = Math.round(sand*scale); silt = Math.round(silt*scale); clay = 100-sand-silt;
    if(clay<0){ clay=0; }
  }

  function draw(host){
    const c=host.canvas, ctx=host.ctx, w=c.width, h=c.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#EAF3FB"; ctx.fillRect(0,0,w,h);

    // --- Sedimentation jar (left) ---
    const jarX=70, jarY=40, jarW=140, jarH=300;
    ctx.strokeStyle="#90A4AE"; ctx.lineWidth=4;
    ctx.strokeRect(jarX,jarY,jarW,jarH);
    ctx.fillStyle="rgba(179,229,252,0.55)"; ctx.fillRect(jarX,jarY,jarW,jarH);

    const total = sand+silt+clay;
    const sandH = jarH*0.55*(sand/total);
    const siltH = jarH*0.55*(silt/total);
    const clayH = jarH*0.55*(clay/total);
    let y = jarY+jarH;
    ctx.fillStyle="#D8B97C"; ctx.fillRect(jarX, y-sandH, jarW, sandH); y-=sandH;
    ctx.fillStyle="#C7B98C"; ctx.fillRect(jarX, y-siltH, jarW, siltH); y-=siltH;
    ctx.fillStyle="#A98D6B"; ctx.fillRect(jarX, y-clayH, jarW, clayH); y-=clayH;
    // organic film floating at top
    const orgH = 6+organic*0.9;
    ctx.fillStyle="#4E342E"; ctx.fillRect(jarX, jarY+8, jarW, orgH);

    ctx.fillStyle="#212121"; ctx.font="bold 12px 'Nunito Sans'";
    ctx.textAlign="center";
    ctx.fillText("Sedimentation Jar Test", jarX+jarW/2, jarY-14);
    ctx.font="10px 'Nunito Sans'";
    ctx.fillText("Sand (bottom) · Silt · Clay · Organic film (top)", jarX+jarW/2, jarY+jarH+22);

    // --- Soil profile (right) ---
    const px=290, py=40, pw=220, ph=300;
    const oH = ph*0.10*(organic/15+0.4);
    const aH = ph*0.30;
    const bH = ph*0.32;
    const cH = ph-oH-aH-bH;
    let yy=py;
    ctx.fillStyle="#3E2723"; ctx.fillRect(px,yy,pw,oH); ctx.fillStyle="#fff"; ctx.font="bold 11px sans-serif"; ctx.textAlign="left"; ctx.fillText("O — organic litter", px+8, yy+oH/2+4); yy+=oH;
    const aColor = clay>=40? "#6D5A46" : sand>=60? "#B99B6B" : "#8C6E4E";
    ctx.fillStyle=aColor; ctx.fillRect(px,yy,pw,aH); ctx.fillStyle="#fff"; ctx.fillText("A — topsoil", px+8, yy+aH/2+4); yy+=aH;
    ctx.fillStyle="#A98358"; ctx.fillRect(px,yy,pw,bH); ctx.fillStyle="#fff"; ctx.fillText("B — subsoil", px+8, yy+bH/2+4); yy+=bH;
    ctx.fillStyle="#8D8D8D"; ctx.fillRect(px,yy,pw,cH); ctx.fillStyle="#fff"; ctx.fillText("C — parent material", px+8, yy+cH/2+4);

    // water droplets amount indicator
    ctx.fillStyle="#212121"; ctx.font="bold 12px 'Nunito Sans'"; ctx.textAlign="center";
    ctx.fillText("Soil Horizon Profile", px+pw/2, py-14);

    // water saturation bar at bottom
    ctx.textAlign="left";
    ctx.fillStyle="#212121"; ctx.font="11px 'Nunito Sans'";
    ctx.fillText("💧 Water saturation: "+water+"%", 70, 372);
  }

  function updateText(host){
    host.setObs(`Sand ${sand}% · Silt ${silt}% · Clay ${clay}% · Organic matter ${organic}% → classified as <b>${classify()}</b> soil.`);
    host.setExplain(`<b>Drainage:</b> ${drainage()}. Soils with more sand drain quickly but hold little water for plants; soils with more clay hold water and nutrients but drain poorly and can become waterlogged. Organic matter improves structure, water retention and fertility in any texture class.`);
  }

  function renderControls(host){
    host.controls.innerHTML="";
    EarthLab.ui.slider(host.controls, {id:"soilSand", label:"Sand %", min:0,max:100,step:1,value:sand, onInput:(v)=>{sand=v; normalize(); draw(host); updateText(host); maybeComplete(host);}});
    EarthLab.ui.slider(host.controls, {id:"soilSilt", label:"Silt %", min:0,max:100,step:1,value:silt, onInput:(v)=>{silt=v; normalize(); draw(host); updateText(host); maybeComplete(host);}});
    EarthLab.ui.slider(host.controls, {id:"soilClay", label:"Clay %", min:0,max:100,step:1,value:clay, onInput:(v)=>{clay=v; normalize(); draw(host); updateText(host); maybeComplete(host);}});
    EarthLab.ui.slider(host.controls, {id:"soilOrg", label:"Organic matter %", min:0,max:20,step:1,value:organic, unit:"%", onInput:(v)=>{organic=v; draw(host); updateText(host); maybeComplete(host);}});
    EarthLab.ui.slider(host.controls, {id:"soilWater", label:"Water saturation %", min:0,max:100,step:5,value:water, unit:"%", onInput:(v)=>{water=v; draw(host); updateText(host);}});
  }

  let triedCount=0;
  function maybeComplete(host){ triedCount++; if(triedCount>6) host.complete(); }

  function reset(host){
    sand=40; silt=35; clay=25; organic=8; water=30; triedCount=0;
    renderControls(host); draw(host); updateText(host);
  }

  EarthLab.registerSim({
    id:"soil",
    title:"Soil Composition Lab",
    objective:"Investigate how the proportions of sand, silt, clay and organic matter determine a soil's texture class, drainage and ability to support plant life.",
    intro:"Mix soil components and run a virtual sedimentation jar test.",
    explainDefault:"Adjust the sliders to change soil composition and watch the jar and profile update.",
    findings:[
      "Soil is a mix of mineral particles, organic matter, water and air — not just \"dirt\".",
      "Particle size (sand > silt > clay) controls how fast water drains through soil.",
      "In a settled jar test, the heaviest, largest particles (sand) settle first at the bottom.",
      "Organic matter improves almost any soil's structure and fertility."
    ],
    glossaryTerms:["Soil horizon"],
    mount(host){ reset(host); },
    reset(host){ reset(host); },
    randomize(host){
      sand=Math.round(Math.random()*100); silt=Math.round(Math.random()*(100-sand)); clay=100-sand-silt;
      organic=Math.round(Math.random()*20); water=Math.round(Math.random()*100);
      renderControls(host); draw(host); updateText(host); maybeComplete(host);
    },
    quiz:[
      { q:"In a sedimentation jar test, which particles settle at the very bottom first?", options:["Clay","Silt","Sand","Organic matter"], answer:2, explain:"Sand grains are the largest and heaviest, so they sink and settle first." },
      { q:"A soil with 70% clay will most likely have:", options:["Fast drainage","Slow drainage, high water retention","No water retention","Only sand particles"], answer:1, explain:"Clay particles are tiny and pack tightly, slowing drainage and holding water." },
      { q:"Which soil layer (horizon) contains the most organic litter?", options:["O horizon","B horizon","C horizon","Bedrock"], answer:0, explain:"The O horizon sits at the surface and is made largely of organic litter and humus." },
      { q:"What does organic matter mainly improve in soil?", options:["Only its colour","Structure, water retention and fertility","Its melting point","Its magnetism"], answer:1, explain:"Organic matter binds particles into aggregates, improving structure, water-holding and nutrient supply." },
      { q:"Which soil texture generally drains fastest?", options:["Clay","Silty","Sandy","Loam"], answer:2, explain:"Large sand particles leave big pore spaces, so water passes through quickly." },
    ]
  });
})();
