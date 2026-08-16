(function(){
  const MINERALS = [
    { name:"Quartz", color:"#DDEFF5", streak:"White (colourless)", lustre:"Glassy (vitreous)", hardness:7, cleavage:"None — breaks with curved (conchoidal) fracture" },
    { name:"Calcite", color:"#F2F2E8", streak:"White", lustre:"Glassy (vitreous)", hardness:3, cleavage:"Perfect — splits into rhombohedral blocks" },
    { name:"Feldspar", color:"#E7C9C0", streak:"White", lustre:"Pearly to glassy", hardness:6, cleavage:"Good — two directions at ~90°" },
    { name:"Pyrite", color:"#D9B84A", streak:"Greenish black", lustre:"Metallic", hardness:6.5, cleavage:"None — breaks unevenly" },
    { name:"Mica (Biotite)", color:"#2E2A26", streak:"White/grey", lustre:"Pearly (sheet-like sheen)", hardness:2.5, cleavage:"Perfect — one direction, peels into thin sheets" },
    { name:"Gypsum", color:"#EDE7DA", streak:"White", lustre:"Glassy to pearly", hardness:2, cleavage:"Perfect — splits into flexible sheets" },
  ];
  const TOOLS = [ {id:"nail",label:"Fingernail",h:2.5}, {id:"penny",label:"Copper Coin",h:3.5}, {id:"glass",label:"Glass Plate",h:5.5}, {id:"steel",label:"Steel File",h:6.5} ];

  let specimen = MINERALS[0];
  let streakDone=false, hardnessDone=false, cleavageDone=false, chosenTool=null, guessResult=null;

  function newSpecimen(){
    specimen = MINERALS[Math.floor(Math.random()*MINERALS.length)];
    streakDone=false; hardnessDone=false; cleavageDone=false; chosenTool=null; guessResult=null;
  }

  function draw(host){
    const c=host.canvas, ctx=host.ctx, w=c.width, h=c.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#EAF3FB"; ctx.fillRect(0,0,w,h);

    // specimen crystal shape
    const cx=w*0.5, cy=h*0.42;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.beginPath();
    ctx.moveTo(0,-70); ctx.lineTo(45,-20); ctx.lineTo(30,60); ctx.lineTo(-30,60); ctx.lineTo(-45,-20);
    ctx.closePath();
    ctx.fillStyle = specimen.color;
    ctx.fill();
    if(specimen.lustre.includes("Metallic")){
      const grad = ctx.createLinearGradient(-45,-70,45,60);
      grad.addColorStop(0,"rgba(255,255,255,0.65)"); grad.addColorStop(0.5,"rgba(255,255,255,0.05)"); grad.addColorStop(1,"rgba(255,255,255,0.4)");
      ctx.fillStyle=grad; ctx.fill();
    } else if(specimen.lustre.includes("Glassy")){
      ctx.fillStyle="rgba(255,255,255,0.35)";
      ctx.beginPath(); ctx.moveTo(-10,-50); ctx.lineTo(10,-50); ctx.lineTo(0,10); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle="rgba(33,33,33,0.35)"; ctx.lineWidth=1.4; ctx.stroke();
    ctx.restore();

    ctx.fillStyle="#212121"; ctx.font="bold 13px 'Nunito Sans'"; ctx.textAlign="center";
    ctx.fillText("Mystery Specimen #"+(MINERALS.indexOf(specimen)+1), cx, h*0.08);
    ctx.font="11px 'Nunito Sans'";
    ctx.fillText("Lustre (observed directly): "+specimen.lustre, cx, h*0.82);

    if(streakDone){ ctx.fillStyle="#5D4037"; ctx.fillRect(cx-60,h*0.86,120,14); ctx.fillStyle="#fff"; ctx.font="10px sans-serif"; ctx.fillText("Streak: "+specimen.streak, cx, h*0.86+11); }
  }

  function updateText(host){
    let obs = `Lustre observed: <b>${specimen.lustre}</b>.`;
    if(streakDone) obs += ` Streak: <b>${specimen.streak}</b>.`;
    if(hardnessDone) obs += ` Hardness test vs ${chosenTool.label}: <b>${specimen.hardness > chosenTool.h ? "scratched the tool (harder)" : "was scratched by the tool (softer)"}</b>.`;
    if(cleavageDone) obs += ` Cleavage: <b>${specimen.cleavage}</b>.`;
    host.setObs(obs);
    if(guessResult!==null){
      host.setExplain(guessResult ? `✅ Correct! This specimen is <b>${specimen.name}</b>, identified by its lustre, streak, hardness and cleavage.` : `❌ Not quite — this specimen is actually <b>${specimen.name}</b>. Compare its properties to your test results above.`);
    } else {
      host.setExplain("Run the streak, hardness and cleavage tests, then identify the mineral using its combination of diagnostic physical properties.");
    }
  }

  function renderControls(host){
    host.controls.innerHTML="";
    EarthLab.ui.button(host.controls, { label:"🧪 Run Streak Test", onClick:()=>{ streakDone=true; draw(host); updateText(host); } });

    const toolWrap = document.createElement("div");
    toolWrap.className="control-row";
    toolWrap.innerHTML = `<label>Hardness test tool</label>`;
    host.controls.appendChild(toolWrap);
    EarthLab.ui.chips(host.controls, { id:"toolChip", label:"", value:chosenTool?chosenTool.id:"", options:TOOLS.map(t=>({value:t.id,label:t.label+" ("+t.h+")"})), onChange:(v)=>{ chosenTool=TOOLS.find(t=>t.id===v); hardnessDone=true; draw(host); updateText(host); } });

    EarthLab.ui.button(host.controls, { label:"🔨 Test Cleavage / Fracture", onClick:()=>{ cleavageDone=true; draw(host); updateText(host); } });

    const idWrap = document.createElement("div");
    idWrap.className="control-row";
    idWrap.innerHTML = `<label>Identify the mineral</label>`;
    host.controls.appendChild(idWrap);
    const sel = EarthLab.ui.select(host.controls, { id:"mineralGuess", label:"", options:[{value:"",label:"Choose…"}].concat(MINERALS.map(m=>({value:m.name,label:m.name}))), value:"", onChange:(v)=>{
      if(!v) return;
      guessResult = (v === specimen.name);
      draw(host); updateText(host);
      host.toast(guessResult ? "Correct identification!" : "Not quite — check the explanation panel.");
      host.complete();
    }});

    EarthLab.ui.button(host.controls, { label:"🔄 New Mystery Specimen", onClick:()=>{ newSpecimen(); renderControls(host); draw(host); updateText(host); } });
  }

  function reset(host){
    newSpecimen();
    renderControls(host); draw(host); updateText(host);
  }

  EarthLab.registerSim({
    id:"minerals",
    title:"Mineral Identification Lab",
    objective:"Use diagnostic physical properties — streak, hardness, lustre and cleavage — to identify an unknown mineral specimen.",
    intro:"Run tests on a mystery mineral, then identify it from its properties.",
    explainDefault:"Run the streak, hardness and cleavage tests, then identify the mineral using its combination of diagnostic physical properties.",
    findings:[
      "Mineral identification relies on a combination of properties, not appearance alone.",
      "Streak — the colour of a mineral's powder — is often more reliable than the mineral's surface colour.",
      "Hardness is tested by seeing which materials scratch which, ranked on the Mohs scale.",
      "Cleavage reflects how a mineral's atomic structure breaks along planes of weakness."
    ],
    glossaryTerms:["Mineral","Streak","Lustre","Hardness","Cleavage"],
    mount(host){ reset(host); },
    reset(host){ reset(host); },
    randomize(host){ newSpecimen(); streakDone=true; hardnessDone=true; cleavageDone=true; chosenTool=TOOLS[1]; renderControls(host); draw(host); updateText(host); },
    quiz:[
      { q:"What is \"streak\" in mineral identification?", options:["The mineral's surface colour","The colour of its powder on an unglazed plate","Its crystal shape","Its weight"], answer:1, explain:"Streak is the colour of the mineral's powder, often more diagnostic than surface colour." },
      { q:"On the Mohs hardness scale, a higher number means:", options:["Softer mineral","Harder, more scratch-resistant mineral","Heavier mineral","Shinier mineral"], answer:1, explain:"The Mohs scale ranks minerals by scratch resistance — higher numbers are harder." },
      { q:"Cleavage describes:", options:["A mineral's smell","How a mineral breaks along flat planes of weakness","Its magnetic pull","Its taste"], answer:1, explain:"Cleavage reflects planes of weakness in a mineral's atomic structure." },
      { q:"Pyrite (\"fool's gold\") has which lustre?", options:["Glassy","Metallic","Pearly","Dull"], answer:1, explain:"Pyrite has a bright metallic lustre, which is part of why it resembles gold." },
    ]
  });
})();
