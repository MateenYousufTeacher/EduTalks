(function(){
  let type="physical"; // physical | chemical
  let cycles=0;
  let cracks=[]; // {x1,y1,x2,y2}
  let pits=[]; // {x,y,r}
  let seedRand = Math.random;

  const EXPLAIN = {
    physical:"Physical (mechanical) weathering breaks rock apart without changing its minerals. Water seeps into cracks, freezes, expands about 9%, and wedges the rock apart — repeated freeze-thaw cycles widen fractures until pieces break free.",
    chemical:"Chemical weathering changes a rock's minerals. Slightly acidic rainwater reacts with minerals (e.g. dissolving calcite, oxidising iron), weakening and pitting the rock's surface over time — turning solid rock into softer, altered material."
  };

  function rockRect(c){ return { x:c.width*0.22, y:c.height*0.14, w:c.width*0.56, h:c.height*0.66 }; }

  function addCrack(host){
    const r = rockRect(host.canvas);
    const x1 = r.x + Math.random()*r.w, y1 = r.y + Math.random()*r.h*0.3;
    const midx = x1 + (Math.random()-0.5)*40, midy = y1 + r.h*(0.3+Math.random()*0.5);
    const x2 = midx + (Math.random()-0.5)*40, y2 = r.y+r.h*(0.75+Math.random()*0.25);
    cracks.push({pts:[[x1,y1],[midx,midy],[x2,y2]]});
  }
  function addPit(host){
    const r = rockRect(host.canvas);
    pits.push({ x:r.x+Math.random()*r.w, y:r.y+Math.random()*r.h, r: 4+Math.random()*10 });
  }

  function draw(host){
    const c=host.canvas, ctx=host.ctx, w=c.width, h=c.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#EAF3FB"; ctx.fillRect(0,0,w,h);

    // ground
    ctx.fillStyle="#DCEFE0"; ctx.fillRect(0,h*0.86,w,h*0.14);

    const r = rockRect(c);
    const shrink = Math.min(cycles*3, 28);
    const alteredColor = type==="chemical"
      ? shadeColor("#8D6E63", -cycles*8)
      : "#8D6E63";

    ctx.save();
    ctx.fillStyle = alteredColor;
    roundRect(ctx, r.x+shrink*0.3, r.y+shrink*0.3, r.w-shrink*0.6, r.h-shrink*0.6, 14);
    ctx.fill();

    // physical cracks
    if(type==="physical"){
      ctx.strokeStyle="#3E2723"; ctx.lineWidth=2.4;
      cracks.forEach(cr=>{
        ctx.beginPath();
        ctx.moveTo(cr.pts[0][0],cr.pts[0][1]);
        ctx.lineTo(cr.pts[1][0],cr.pts[1][1]);
        ctx.lineTo(cr.pts[2][0],cr.pts[2][1]);
        ctx.stroke();
      });
      // fragments flying off at high level
      if(cycles>=5){
        for(let i=0;i<6;i++){
          ctx.beginPath();
          const fx=r.x+r.w*Math.random(), fy=r.y+r.h+10+Math.random()*20;
          ctx.fillStyle="#6D4C41";
          ctx.arc(fx,fy,4+Math.random()*4,0,Math.PI*2);
          ctx.fill();
        }
      }
    } else {
      // chemical pits
      ctx.fillStyle="rgba(62,39,35,0.55)";
      pits.forEach(p=>{
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      });
      // acidic rain drops
      ctx.strokeStyle="#26C6DA"; ctx.lineWidth=2;
      for(let i=0;i<Math.min(cycles,6);i++){
        const rx = r.x + (i+1)*(r.w/7);
        ctx.beginPath(); ctx.moveTo(rx, 6); ctx.lineTo(rx-4, 26); ctx.stroke();
      }
    }
    ctx.restore();

    ctx.fillStyle="#212121"; ctx.font="bold 12px 'Nunito Sans'"; ctx.textAlign="center";
    ctx.fillText((type==="physical"?"Physical":"Chemical")+" weathering — cycle "+cycles+"/6", w/2, h*0.95);
  }
  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }
  function shadeColor(hex, percent){
    const num = parseInt(hex.slice(1),16);
    let r=(num>>16)+percent, g=((num>>8)&0xff)+percent, b=(num&0xff)+percent;
    r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b));
    return "rgb("+r+","+g+","+b+")";
  }

  function applyCycle(host){
    if(cycles>=6){ host.toast("Rock is fully weathered — press Reset to try again."); return; }
    cycles++;
    if(type==="physical") addCrack(host); else addPit(host);
    draw(host);
    updateText(host);
    if(cycles>=6) host.complete();
  }

  function updateText(host){
    if(cycles===0){ host.setObs("The rock is intact. Apply a weathering cycle to begin."); }
    else if(cycles<3){ host.setObs(`After ${cycles} cycle(s), the rock is showing early ${type==="physical"?"cracks":"surface pitting"}.`); }
    else if(cycles<6){ host.setObs(`After ${cycles} cycles, ${type==="physical"?"cracks have widened and begun to network through the rock":"the surface is visibly etched and weakened"}.`); }
    else { host.setObs(`After ${cycles} cycles, the rock has broken down into loose fragments — ready to be picked up by erosion.`); }
    host.setExplain(EXPLAIN[type]);
  }

  function renderControls(host){
    host.controls.innerHTML="";
    EarthLab.ui.chips(host.controls, {
      id:"weatherType", label:"Weathering type", value:type,
      options:[{value:"physical",label:"🧊 Physical (Frost)"},{value:"chemical",label:"🧪 Chemical (Acid rain)"}],
      onChange:(v)=>{ type=v; cycles=0; cracks=[]; pits=[]; draw(host); updateText(host); }
    });
    const info = document.createElement("div");
    info.className="control-row";
    info.innerHTML = `<label>Apply a weathering cycle</label>`;
    host.controls.appendChild(info);
    EarthLab.ui.button(host.controls, { label:"⏭️ Apply One Cycle", onClick:()=>applyCycle(host) });
  }

  function reset(host){
    cycles=0; cracks=[]; pits=[]; type="physical";
    renderControls(host); draw(host); updateText(host);
  }

  EarthLab.registerSim({
    id:"weathering",
    title:"Weathering Investigation",
    objective:"Distinguish physical and chemical weathering, and observe how repeated weathering cycles progressively break rock down in place.",
    intro:"Apply repeated weathering cycles and watch a rock block break down.",
    explainDefault:"Choose physical or chemical weathering, then apply cycles to see how the rock responds.",
    findings:[
      "Physical weathering breaks rock apart without changing its mineral composition.",
      "Chemical weathering alters the minerals themselves, often through reactions with water or acids.",
      "Weathering happens in place — the broken material hasn't moved yet (that's erosion).",
      "Repeated cycles compound: small cracks or pits grow into larger networks over time."
    ],
    glossaryTerms:["Weathering","Erosion"],
    mount(host){ reset(host); },
    reset(host){ reset(host); },
    randomize(host){
      type = Math.random()<0.5?"physical":"chemical";
      cycles = Math.floor(Math.random()*6)+1;
      cracks=[]; pits=[];
      for(let i=0;i<cycles;i++){ if(type==="physical") addCrack(host); else addPit(host); }
      renderControls(host); draw(host); updateText(host);
      if(cycles>=6) host.complete();
    },
    quiz:[
      { q:"Physical weathering breaks down rock by:", options:["Changing its mineral composition","Mechanical force, without changing minerals","Melting it","Cementing particles together"], answer:1, explain:"Physical weathering fractures rock mechanically (e.g. frost wedging) without altering its chemistry." },
      { q:"Chemical weathering is caused mainly by:", options:["Wind pressure","Reactions between minerals and water/acids","Gravity alone","Magnetism"], answer:1, explain:"Chemical weathering involves reactions such as dissolution and oxidation that alter minerals." },
      { q:"Freeze-thaw (frost) weathering works because water:", options:["Evaporates instantly","Expands about 9% when it freezes, wedging cracks apart","Shrinks when frozen","Dissolves all rock instantly"], answer:1, explain:"Water expands on freezing, exerting pressure that widens cracks over repeated cycles." },
      { q:"Weathering differs from erosion because weathering:", options:["Transports material away","Breaks rock down in place, without transporting it","Only happens underwater","Only happens to metamorphic rock"], answer:1, explain:"Weathering breaks rock down where it sits; erosion is the transport that comes after." },
    ]
  });
})();
