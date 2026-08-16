(function(){
  let organism="shell";   // shell | bone | softbody
  let sediment="mud";     // mud | sand
  let speed=6;            // 1-10, higher = faster burial
  let analyzed=false;

  const ORG_INFO = {
    shell:{ label:"Shelled Organism", icon:"🐚", base:70 },
    bone:{ label:"Boned Vertebrate", icon:"🦴", base:60 },
    softbody:{ label:"Soft-bodied Organism", icon:"🪱", base:20 },
  };
  const SED_INFO = {
    mud:{ label:"Fine Mud/Silt", icon:"🟤", bonus:20 },
    sand:{ label:"Coarse Sand", icon:"🟨", bonus:5 },
  };

  function score(){
    let s = ORG_INFO[organism].base + SED_INFO[sediment].bonus;
    s += Math.round((speed-5)*4); // fast burial helps preservation, slow burial hurts (more decay/scavenging time)
    return Math.max(0, Math.min(100, s));
  }

  function draw(host){
    const c=host.canvas, ctx=host.ctx, w=c.width, h=c.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#EAF3FB"; ctx.fillRect(0,0,w,h);

    // water column
    ctx.fillStyle="rgba(38,198,218,0.18)"; ctx.fillRect(0,0,w,h*0.28);

    // sediment layers
    const layerCount = 5;
    const layerH = (h*0.62)/layerCount;
    for(let i=0;i<layerCount;i++){
      const y = h*0.28 + i*layerH;
      ctx.fillStyle = i%2===0 ? shade(SED_INFO[sediment].colorA||( sediment==="mud"?"#8D7256":"#D8B97C"),0) : shade(sediment==="mud"?"#7A6249":"#C9A76A",0);
      ctx.fillRect(0,y,w,layerH+1);
    }

    // organism buried at a depth depending on how "old"/analyzed
    const orgY = analyzed ? h*0.42 : h*0.30;
    ctx.font="30px sans-serif"; ctx.textAlign="center";
    ctx.fillText(ORG_INFO[organism].icon, w*0.5, orgY);

    if(analyzed){
      const s = score();
      ctx.strokeStyle = s>=55 ? "#43A047" : "#E53935";
      ctx.lineWidth=3;
      ctx.strokeRect(w*0.5-30, orgY-26, 60, 46);
      ctx.font="bold 12px 'Nunito Sans'"; ctx.fillStyle="#212121"; ctx.textAlign="center";
      ctx.fillText(s>=55 ? "✅ Fossil preserved" : "❌ Poorly preserved / decayed", w*0.5, h*0.92);
    } else {
      ctx.fillStyle="#212121"; ctx.font="12px 'Nunito Sans'"; ctx.textAlign="center";
      ctx.fillText("Press \"Bury & Analyze\" to run geological time forward", w*0.5, h*0.92);
    }
  }
  function shade(hex,p){ return hex; }

  function updateText(host){
    if(!analyzed){
      host.setObs(`Ready to bury a <b>${ORG_INFO[organism].label}</b> in <b>${SED_INFO[sediment].label}</b> at burial speed ${speed}/10.`);
      host.setExplain("Choose an organism type and sediment, then click Bury & Analyze to simulate burial and preservation over geological time.");
      return;
    }
    const s = score();
    host.setObs(`Preservation score: <b>${s}/100</b>. ${s>=55 ? "Conditions were favourable enough to form a fossil." : "Conditions were not favourable — the remains likely decayed or were destroyed."}`);
    let why = `Organism type contributes a base preservation chance (hard parts like shell and bone survive far better than soft tissue). `;
    why += SED_INFO[sediment].label==="Fine Mud/Silt" ? "Fine sediment seals remains quickly with little damage. " : "Coarse sand is more abrasive and porous, allowing more decay and damage. ";
    why += speed>=6 ? "Fast burial protected the remains from scavengers and oxygen before they could fully decay." : "Slow burial left the remains exposed longer, increasing decay and scavenging.";
    host.setExplain(why);
  }

  function renderControls(host){
    host.controls.innerHTML="";
    EarthLab.ui.chips(host.controls, {
      id:"fossilOrg", label:"Organism type", value:organism,
      options:Object.entries(ORG_INFO).map(([k,v])=>({value:k,label:v.icon+" "+v.label})),
      onChange:(v)=>{ organism=v; analyzed=false; draw(host); updateText(host); }
    });
    EarthLab.ui.chips(host.controls, {
      id:"fossilSed", label:"Burial sediment", value:sediment,
      options:Object.entries(SED_INFO).map(([k,v])=>({value:k,label:v.icon+" "+v.label})),
      onChange:(v)=>{ sediment=v; analyzed=false; draw(host); updateText(host); }
    });
    EarthLab.ui.slider(host.controls, { id:"fossilSpeed", label:"Burial speed", min:1,max:10,step:1,value:speed, onInput:(v)=>{speed=v; analyzed=false; draw(host); updateText(host);} });
    EarthLab.ui.button(host.controls, { label:"⏳ Bury & Analyze", onClick:()=>{ analyzed=true; draw(host); updateText(host); host.complete(); } });
  }

  function reset(host){
    organism="shell"; sediment="mud"; speed=6; analyzed=false;
    renderControls(host); draw(host); updateText(host);
  }

  EarthLab.registerSim({
    id:"fossil",
    title:"Fossilisation Lab",
    objective:"Investigate how organism type, sediment type and burial speed affect the likelihood that an organism becomes preserved as a fossil.",
    intro:"Bury an organism under sediment and analyze its preservation odds.",
    explainDefault:"Choose an organism and sediment type, then bury it to see whether it fossilises.",
    findings:[
      "Hard parts (shells, bones) preserve far more easily than soft tissue.",
      "Fine sediment (mud/silt) preserves detail better than coarse, abrasive sediment.",
      "Rapid burial protects remains from decay, oxygen and scavengers.",
      "Fossils are relatively rare — most organisms leave no trace at all."
    ],
    glossaryTerms:["Fossil","Permineralisation"],
    mount(host){ reset(host); },
    reset(host){ reset(host); },
    randomize(host){
      const oKeys=Object.keys(ORG_INFO); organism=oKeys[Math.floor(Math.random()*oKeys.length)];
      const sKeys=Object.keys(SED_INFO); sediment=sKeys[Math.floor(Math.random()*sKeys.length)];
      speed=Math.floor(Math.random()*10)+1; analyzed=true;
      renderControls(host); draw(host); updateText(host);
    },
    quiz:[
      { q:"Which is most likely to fossilise well?", options:["A soft-bodied jellyfish","A hard shell or bone","A cloud","A gas bubble"], answer:1, explain:"Hard parts like shells and bones resist decay far better than soft tissue." },
      { q:"Why does rapid burial help preservation?", options:["It speeds up decay","It protects remains from scavengers and oxygen exposure","It melts the organism","It has no effect"], answer:1, explain:"Quick burial isolates remains from air and scavengers, slowing decay before fossilisation begins." },
      { q:"Fine-grained sediment (mud) generally preserves detail:", options:["Worse than coarse sand","Better than coarse sand","Exactly the same as sand","Only in deserts"], answer:1, explain:"Fine sediment settles gently around remains, capturing fine detail with less abrasion." },
      { q:"What does a fossil provide evidence of?", options:["Future climate","Ancient life and past environments","Only volcanic activity","Only earthquakes"], answer:1, explain:"Fossils are direct evidence of organisms and conditions from Earth's past." },
    ]
  });
})();
