(function(){
  let viscosity=5, gas=5, pressure=30;
  let erupting=false, rafId=null, particles=[], settled=[];
  let style=null;

  function explosivity(){ return (viscosity*0.55 + gas*0.45); }
  function willBeExplosive(){ return pressure>=45 && explosivity()>=5.5; }

  function draw(host){
    const c=host.canvas, ctx=host.ctx, w=c.width, h=c.height;
    ctx.clearRect(0,0,w,h);
    // sky
    ctx.fillStyle = erupting && style==="explosive" ? "#4A4A4A" : "#EAF3FB";
    ctx.fillRect(0,0,w,h*0.78);
    ctx.fillStyle="#DCEFE0"; ctx.fillRect(0,h*0.78,w,h*0.22);

    // volcano cone
    const cx=w*0.5, baseY=h*0.78, coneTopY=h*0.28, coneW=w*0.42;
    ctx.fillStyle="#6D4C41";
    ctx.beginPath();
    ctx.moveTo(cx-coneW/2, baseY);
    ctx.lineTo(cx-24, coneTopY);
    ctx.lineTo(cx+24, coneTopY);
    ctx.lineTo(cx+coneW/2, baseY);
    ctx.closePath(); ctx.fill();
    // vent
    ctx.fillStyle="#3E2723";
    ctx.beginPath(); ctx.moveTo(cx-24,coneTopY); ctx.lineTo(cx-10,coneTopY+16); ctx.lineTo(cx+10,coneTopY+16); ctx.lineTo(cx+24,coneTopY); ctx.closePath(); ctx.fill();

    // magma chamber + pressure fill
    const chX=cx-50, chY=h*0.86, chW=100, chH=40;
    ctx.strokeStyle="#212121"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(cx,chY,chW/2,chH/2,0,0,Math.PI*2); ctx.stroke();
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx,chY,chW/2-2,chH/2-2,0,0,Math.PI*2); ctx.clip();
    const fillH = (pressure/100)*chH;
    ctx.fillStyle="#FF7043";
    ctx.fillRect(chX,chY+chH/2-fillH,chW,fillH);
    ctx.restore();
    ctx.font="10px sans-serif"; ctx.fillStyle="#212121"; ctx.textAlign="center";
    ctx.fillText("Magma chamber — pressure "+pressure+"%", cx, chY+chH/2+18);

    // settled lava / ash on flanks
    settled.forEach(p=>{
      ctx.fillStyle = p.type==="lava" ? "#BF360C" : "#616161";
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });

    // active particles
    particles.forEach(p=>{
      ctx.fillStyle = p.type==="lava" ? "#FF8A50" : "#3B3B3B";
      ctx.globalAlpha = p.type==="ash" ? 0.85 : 1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
    });

    ctx.fillStyle="#212121"; ctx.font="bold 12px 'Nunito Sans'"; ctx.textAlign="center";
    ctx.fillText(erupting ? (style==="explosive"?"💥 Explosive eruption in progress":"🌋 Effusive lava flow in progress") : "Ready — increase pressure and press Erupt", cx, h*0.97);
  }

  function spawnEruptionParticles(w,h,ventX,ventY){
    const s = style;
    if(s==="explosive"){
      for(let i=0;i<3;i++){
        particles.push({ x:ventX+(Math.random()-0.5)*6, y:ventY, vx:(Math.random()-0.5)*3.4, vy:-4-Math.random()*3, r:3+Math.random()*3, type:"ash", life:0 });
      }
    } else {
      for(let i=0;i<2;i++){
        const dir = Math.random()<0.5?-1:1;
        particles.push({ x:ventX+dir*4, y:ventY+10, vx:dir*(0.6+Math.random()*0.6), vy:1.2+Math.random()*0.6, r:3+Math.random()*2.5, type:"lava", life:0 });
      }
    }
  }

  function stepParticles(w,h){
    particles.forEach(p=>{
      p.life++;
      p.vy += p.type==="ash" ? 0.12 : 0.18; // gravity
      p.x += p.vx; p.y += p.vy;
    });
    particles = particles.filter(p=>{
      const grounded = p.y > h*0.86;
      if(grounded){ settled.push({x:p.x,y:h*0.85,r:p.r*0.8,type:p.type}); }
      return !grounded && p.x>-20 && p.x<w+20 && p.y<h+20;
    });
    if(settled.length>140) settled.splice(0, settled.length-140);
  }

  function loop(host, ventX, ventY, durationFrames){
    let frame=0;
    function step(){
      frame++;
      if(frame < durationFrames*0.7) spawnEruptionParticles(host.canvas.width, host.canvas.height, ventX, ventY);
      stepParticles(host.canvas.width, host.canvas.height);
      draw(host);
      if(frame < durationFrames){
        rafId = requestAnimationFrame(step);
      } else {
        erupting=false; pressure=Math.max(0,pressure-40);
        draw(host); updateText(host); host.complete();
        host.toast(style==="explosive" ? "Explosive eruption complete!" : "Lava flow complete!");
      }
    }
    step();
  }

  function erupt(host){
    if(erupting) return;
    style = willBeExplosive() ? "explosive" : "effusive";
    erupting=true; particles=[];
    const w=host.canvas.width, h=host.canvas.height;
    loop(host, w*0.5, h*0.28+16, 110);
    updateText(host);
  }

  function updateText(host){
    const s = willBeExplosive() ? "explosive" : "effusive";
    host.setObs(`Viscosity ${viscosity}/10, gas content ${gas}/10, pressure ${pressure}% → this magma would erupt <b>${s}ly</b>.`);
    host.setExplain(s==="explosive"
      ? "High viscosity magma resists gas escape, so pressure builds until it ruptures violently, blasting ash and rock fragments (tephra) high into the air."
      : "Low viscosity, gas-poor magma flows easily, letting gas escape gently — the magma erupts as flowing lava rather than exploding.");
  }

  function renderControls(host){
    host.controls.innerHTML="";
    EarthLab.ui.slider(host.controls, { id:"vVisc", label:"Magma viscosity", min:1,max:10,step:1,value:viscosity, onInput:(v)=>{viscosity=v; updateText(host);} });
    EarthLab.ui.slider(host.controls, { id:"vGas", label:"Gas content", min:1,max:10,step:1,value:gas, onInput:(v)=>{gas=v; updateText(host);} });
    EarthLab.ui.slider(host.controls, { id:"vPress", label:"Chamber pressure", min:0,max:100,step:5,value:pressure, unit:"%", onInput:(v)=>{pressure=v; draw(host); updateText(host);} });
    EarthLab.ui.button(host.controls, { label:"🌋 Erupt!", onClick:()=>erupt(host) });
  }

  function reset(host){
    erupting=false; if(rafId) cancelAnimationFrame(rafId);
    viscosity=5; gas=5; pressure=30; particles=[]; settled=[]; style=null;
    renderControls(host); draw(host); updateText(host);
  }

  EarthLab.registerSim({
    id:"volcano",
    title:"Volcanic Eruption Lab",
    objective:"Investigate how magma viscosity, gas content and chamber pressure determine whether a volcano erupts effusively or explosively.",
    intro:"Adjust magma properties and pressure, then trigger an eruption.",
    explainDefault:"Set viscosity, gas content and pressure, then press Erupt to see the eruption style.",
    findings:[
      "Low-viscosity, low-gas magma tends to erupt effusively as flowing lava.",
      "High-viscosity, gas-rich magma traps pressure until it erupts explosively.",
      "Pressure must build in the magma chamber before an eruption can occur.",
      "Eruption style directly shapes the resulting landform — shield volcanoes vs. steep composite cones."
    ],
    glossaryTerms:["Magma","Lava"],
    mount(host){ reset(host); return ()=>{ erupting=false; if(rafId) cancelAnimationFrame(rafId); }; },
    reset(host){ reset(host); },
    randomize(host){
      viscosity=Math.floor(Math.random()*10)+1; gas=Math.floor(Math.random()*10)+1; pressure=Math.floor(Math.random()*100);
      renderControls(host); draw(host); updateText(host);
    },
    quiz:[
      { q:"Low-viscosity, gas-poor magma typically erupts:", options:["Explosively","Effusively, as flowing lava","Never","As earthquakes"], answer:1, explain:"Gas escapes easily from runny magma, so it flows out gently as lava." },
      { q:"What mainly causes an explosive eruption?", options:["Low pressure and free-flowing magma","Trapped gas in thick, high-viscosity magma","Cold weather","Ocean currents"], answer:1, explain:"Thick magma traps gas until pressure ruptures it violently." },
      { q:"Magma becomes lava when it:", options:["Cools underground","Reaches Earth's surface","Turns into sediment","Is compressed"], answer:1, explain:"By definition, magma is called lava once it erupts onto the surface." },
      { q:"What must build up in the magma chamber before eruption?", options:["Pressure","Sunlight","Wind speed","Ocean depth"], answer:0, explain:"Rising pressure eventually overcomes the strength of overlying rock, triggering eruption." },
    ]
  });
})();
