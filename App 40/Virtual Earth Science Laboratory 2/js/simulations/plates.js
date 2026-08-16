(function(){
  let boundary="divergent"; // divergent | convergent | transform
  let convergentType="oceanic-continental";
  let animating=false, rafId=null, t=0;

  const EXPLAIN = {
    divergent:"At a divergent boundary, plates move apart. Magma rises to fill the gap, cooling into new oceanic crust and building a mid-ocean ridge — often with shallow earthquakes and rift valleys.",
    "convergent-oceanic-continental":"Denser oceanic crust subducts beneath lighter continental crust, forming a deep ocean trench, a volcanic mountain arc, and powerful earthquakes along the subduction zone.",
    "convergent-oceanic-oceanic":"When two oceanic plates converge, the denser (usually older, colder) plate subducts beneath the other, forming a deep trench and a curved volcanic island arc.",
    "convergent-continental-continental":"Neither continental plate is dense enough to subduct, so the crust crumples and thickens, thrusting up huge mountain ranges (like the Himalayas) without significant volcanism.",
    transform:"At a transform boundary, plates slide horizontally past each other. Friction locks the fault until stress releases suddenly, producing strong earthquakes but little volcanism or mountain building."
  };

  function label(){
    if(boundary==="convergent") return "convergent-"+convergentType;
    return boundary;
  }

  function draw(host){
    const c=host.canvas, ctx=host.ctx, w=c.width, h=c.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#EAF3FB"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#B3E5FC"; ctx.fillRect(0,h*0.35,w,h*0.15); // ocean band baseline

    const midX=w*0.5;
    const shift = animating ? Math.sin(Math.min(t/40,1)*Math.PI/2)*70 : (t>=40?70:0);

    if(boundary==="divergent"){
      drawPlate(ctx, midX-shift-160, h*0.42, 160, h*0.4, "#8D6E63", "Plate A");
      drawPlate(ctx, midX+shift, h*0.42, 160, h*0.4, "#795548", "Plate B");
      // new crust / ridge in gap
      const gapW = Math.max(0, (midX+shift)-(midX-shift));
      ctx.fillStyle="#E53935";
      ctx.fillRect(midX-gapW/2, h*0.42, gapW, h*0.08);
      if(gapW>4){ ctx.fillStyle="#212121"; ctx.font="10px sans-serif"; ctx.textAlign="center"; ctx.fillText("new crust", midX, h*0.4); }
      arrow(ctx, midX-shift-20, h*0.6, -1); arrow(ctx, midX+shift+20, h*0.6, 1);
    } else if(boundary==="transform"){
      drawPlate(ctx, midX-170, h*0.42+(animating? Math.sin(t/8)*0 : 0), 160, h*0.4, "#8D6E63", "Plate A");
      drawPlate(ctx, midX+10, h*0.42, 160, h*0.4, "#795548", "Plate B");
      ctx.strokeStyle="#212121"; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.moveTo(midX,h*0.3); ctx.lineTo(midX,h*0.85); ctx.stroke(); ctx.setLineDash([]);
      arrow(ctx, midX-90, h*0.36, 0, -1); arrow(ctx, midX+90, h*0.86, 0, 1);
      if(animating && Math.floor(t/6)%2===0){ ctx.fillStyle="#E53935"; ctx.beginPath(); ctx.arc(midX, h*0.6, 5,0,Math.PI*2); ctx.fill(); }
    } else {
      // convergent
      const leftDense = convergentType!=="continental-continental";
      drawPlate(ctx, midX-160-((animating||t>=40)? -shift:0), h*0.42, 160, h*0.4, "#8D6E63", "Plate A");
      drawPlate(ctx, midX+((animating||t>=40)? -shift:0), h*0.42, 160, h*0.4, "#795548", "Plate B");
      arrow(ctx, midX-90, h*0.6, 1); arrow(ctx, midX+90, h*0.6, -1);
      if(t>=38){
        if(convergentType==="continental-continental"){
          // mountains
          ctx.fillStyle="#A98358";
          ctx.beginPath();
          ctx.moveTo(midX-60,h*0.42); ctx.lineTo(midX-10,h*0.18); ctx.lineTo(midX+20,h*0.42);
          ctx.lineTo(midX+50,h*0.2); ctx.lineTo(midX+80,h*0.42);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle="#212121"; ctx.font="10px sans-serif"; ctx.textAlign="center"; ctx.fillText("Fold mountains", midX, h*0.14);
        } else {
          // trench + volcanic arc
          ctx.fillStyle="#0D47A1";
          ctx.beginPath(); ctx.moveTo(midX-30,h*0.42); ctx.lineTo(midX+10,h*0.62); ctx.lineTo(midX+50,h*0.42); ctx.closePath(); ctx.fill();
          ctx.font="22px sans-serif"; ctx.fillText("🌋", midX+90, h*0.34);
          ctx.fillStyle="#212121"; ctx.font="10px sans-serif"; ctx.fillText("Trench", midX+10, h*0.68);
          ctx.fillText("Volcanic arc", midX+90, h*0.22);
        }
      }
    }

    ctx.fillStyle="#212121"; ctx.font="bold 12px 'Nunito Sans'"; ctx.textAlign="center";
    ctx.fillText(boundaryTitle(), w/2, h*0.96);
  }
  function boundaryTitle(){
    if(boundary==="convergent") return "Convergent — "+convergentType.replace("-"," / ");
    return boundary.charAt(0).toUpperCase()+boundary.slice(1)+" boundary";
  }
  function drawPlate(ctx,x,y,w,h,color,label){
    ctx.fillStyle=color; ctx.fillRect(x,y,w,h);
    ctx.fillStyle="#fff"; ctx.font="bold 11px sans-serif"; ctx.textAlign="center"; ctx.fillText(label, x+w/2, y+h/2);
  }
  function arrow(ctx,x,y,dx,dy){
    dy = dy||0;
    const len=26;
    ctx.strokeStyle="#212121"; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+dx*len,y+dy*len); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x+dx*len,y+dy*len);
    ctx.lineTo(x+dx*len-dy*6-dx*6, y+dy*len+dx*6-dy*6);
    ctx.lineTo(x+dx*len+dy*6-dx*6, y+dy*len-dx*6-dy*6);
    ctx.closePath(); ctx.fillStyle="#212121"; ctx.fill();
  }

  function loop(host){
    t++;
    draw(host);
    if(t<50){ rafId=requestAnimationFrame(()=>loop(host)); }
    else { animating=false; host.complete(); updateText(host); }
  }

  function updateText(host){
    const key = label();
    host.setObs(`Simulating a <b>${boundaryTitle()}</b>. ${t>=40?"The resulting geological feature has formed.":"Press Animate Motion to run the boundary forward in time."}`);
    host.setExplain(EXPLAIN[key] || EXPLAIN[boundary]);
  }

  function renderControls(host){
    host.controls.innerHTML="";
    EarthLab.ui.chips(host.controls, {
      id:"plateBoundary", label:"Plate boundary type", value:boundary,
      options:[{value:"divergent",label:"↔️ Divergent"},{value:"convergent",label:"⬅➡ Convergent"},{value:"transform",label:"↕️ Transform"}],
      onChange:(v)=>{ boundary=v; t=0; draw(host); updateText(host); renderControls(host); }
    });
    if(boundary==="convergent"){
      EarthLab.ui.chips(host.controls, {
        id:"convergentType", label:"Plate combination", value:convergentType,
        options:[
          {value:"oceanic-continental",label:"Oceanic–Continental"},
          {value:"oceanic-oceanic",label:"Oceanic–Oceanic"},
          {value:"continental-continental",label:"Continental–Continental"}],
        onChange:(v)=>{ convergentType=v; t=0; draw(host); updateText(host); }
      });
    }
    EarthLab.ui.button(host.controls, { label:"▶ Animate Motion", onClick:()=>{ t=0; animating=true; loop(host); } });
  }

  function reset(host){
    animating=false; if(rafId) cancelAnimationFrame(rafId);
    boundary="divergent"; convergentType="oceanic-continental"; t=0;
    renderControls(host); draw(host); updateText(host);
  }

  EarthLab.registerSim({
    id:"plates",
    title:"Plate Tectonics Lab",
    objective:"Investigate how divergent, convergent and transform plate boundaries produce different geological features such as ridges, trenches, mountains and faults.",
    intro:"Select a boundary type and animate plate motion to see the resulting landform.",
    explainDefault:"Choose a plate boundary type, then press Animate Motion.",
    findings:[
      "Divergent boundaries create new crust and mid-ocean ridges as plates pull apart.",
      "Convergent boundaries destroy crust through subduction, or build mountains through collision.",
      "Transform boundaries produce strong earthquakes with little volcanism, as plates slide past each other.",
      "The type of crust involved (oceanic vs continental) determines which plate subducts, if any."
    ],
    glossaryTerms:["Tectonic plate","Subduction","Divergent boundary","Convergent boundary","Transform boundary"],
    mount(host){ reset(host); return ()=>{ animating=false; if(rafId) cancelAnimationFrame(rafId); }; },
    reset(host){ reset(host); },
    randomize(host){
      const bKeys=["divergent","convergent","transform"]; boundary=bKeys[Math.floor(Math.random()*bKeys.length)];
      const cKeys=["oceanic-continental","oceanic-oceanic","continental-continental"]; convergentType=cKeys[Math.floor(Math.random()*cKeys.length)];
      t=45; renderControls(host); draw(host); updateText(host);
    },
    quiz:[
      { q:"At a divergent boundary, plates:", options:["Move apart, forming new crust","Collide head-on","Slide past each other","Stop moving entirely"], answer:0, explain:"Divergent boundaries pull apart, letting magma rise and form new crust." },
      { q:"At an oceanic–continental convergent boundary, which plate subducts?", options:["The continental plate","The denser oceanic plate","Neither plate moves","Both plates rise equally"], answer:1, explain:"Denser oceanic crust sinks beneath lighter continental crust." },
      { q:"Continental–continental collisions typically produce:", options:["Deep ocean trenches","Towering fold mountains, with little volcanism","Mid-ocean ridges","No geological change"], answer:1, explain:"Neither plate is dense enough to subduct, so crust crumples upward into mountains." },
      { q:"Transform boundaries are best known for producing:", options:["New ocean crust","Explosive volcanoes","Strong earthquakes from plates sliding past each other","Fold mountains"], answer:2, explain:"Friction along the fault builds stress that releases as earthquakes, with little volcanism." },
    ]
  });
})();
