(function(){
  let magnitude=6.0, depth=20, distance=100;
  let running=false, rafId=null, waveR=0, shaking=false, shakeT=0;
  let seismTrace=[];

  function intensity(){
    const focalDist = Math.sqrt(depth*depth + distance*distance);
    let val = magnitude*15 - focalDist*0.28;
    return Math.max(0, Math.min(100, Math.round(val)));
  }
  function category(v){
    if(v<15) return "Not felt";
    if(v<35) return "Weak — felt by some indoors";
    if(v<55) return "Moderate — felt by most, objects rattle";
    if(v<75) return "Strong — furniture moves, minor damage";
    return "Severe — major shaking, potential structural damage";
  }

  function draw(host){
    const c=host.canvas, ctx=host.ctx, w=c.width, h=c.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#EAF3FB"; ctx.fillRect(0,0,w,h*0.55);
    ctx.fillStyle="#D9C9A8"; ctx.fillRect(0,h*0.55,w,h*0.45); // underground

    const surfaceY = h*0.55;
    const focusX = w*0.28, focusY = surfaceY + (depth/60)*h*0.42;
    const epiX = focusX;
    const cityX = Math.min(w-40, epiX + (distance/500)*(w*0.62));

    // fault line
    ctx.strokeStyle="#8D6E63"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(focusX-40, surfaceY); ctx.lineTo(focusX+30, h); ctx.stroke();

    // expanding wave circles
    if(running || waveR>0){
      ctx.strokeStyle="rgba(229,57,53,0.55)"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(focusX,focusY,waveR,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle="rgba(255,179,0,0.5)";
      ctx.beginPath(); ctx.arc(focusX,focusY,waveR*0.6,0,Math.PI*2); ctx.stroke();
    }

    // epicenter marker
    ctx.fillStyle="#E53935";
    ctx.beginPath(); ctx.moveTo(epiX,surfaceY-14); ctx.lineTo(epiX-8,surfaceY); ctx.lineTo(epiX+8,surfaceY); ctx.closePath(); ctx.fill();
    ctx.font="10px sans-serif"; ctx.fillStyle="#212121"; ctx.textAlign="center"; ctx.fillText("Epicentre", epiX, surfaceY-18);

    // focus marker
    ctx.fillStyle="#212121";
    ctx.beginPath(); ctx.arc(focusX,focusY,6,0,Math.PI*2); ctx.fill();
    ctx.fillText("Focus", focusX, focusY+18);

    // city / seismograph station
    const shakeOffset = shaking ? (Math.random()-0.5)*intensity()*0.25 : 0;
    ctx.font="26px sans-serif";
    ctx.fillText("🏢", cityX+shakeOffset, surfaceY-16);
    ctx.font="10px sans-serif"; ctx.fillStyle="#212121"; ctx.fillText("City / Seismograph", cityX, surfaceY+16);

    // seismograph trace at bottom
    ctx.strokeStyle="#0D47A1"; ctx.lineWidth=1.6;
    ctx.beginPath();
    const baseY = h-24, traceW = w-40;
    seismTrace.forEach((v,i)=>{
      const x = 20 + (i/200)*traceW;
      const y = baseY - v;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
    ctx.strokeStyle="rgba(13,71,161,0.15)"; ctx.beginPath(); ctx.moveTo(20,baseY); ctx.lineTo(20+traceW,baseY); ctx.stroke();
  }

  function loop(host){
    const w=host.canvas.width;
    waveR += 3.5;
    const focusDistPx = ( (distance/500)*(w*0.62) );
    if(waveR >= focusDistPx*0.55 && !shaking){ shaking=true; shakeT=0; }
    if(shaking){
      shakeT++;
      const amp = intensity()*0.4;
      seismTrace.push(30 + (Math.random()-0.5)*amp);
      if(seismTrace.length>200) seismTrace.shift();
      if(shakeT > 90){ shaking=false; running=false; host.complete(); host.toast("Earthquake simulation complete."); }
    } else {
      seismTrace.push(30);
      if(seismTrace.length>200) seismTrace.shift();
    }
    draw(host);
    if(running) rafId = requestAnimationFrame(()=>loop(host));
    else draw(host);
  }

  function updateText(host){
    const v = intensity();
    host.setObs(`Magnitude ${magnitude.toFixed(1)}, focal depth ${depth} km, city ${distance} km away → estimated shaking intensity <b>${v}/100</b>: ${category(v)}.`);
    host.setExplain("Shaking intensity fades with distance from the epicentre and increases with depth proximity — a shallow, nearby, high-magnitude quake causes the strongest ground motion. Magnitude measures total energy released; intensity describes what is actually felt at a location.");
  }

  function renderControls(host){
    host.controls.innerHTML="";
    EarthLab.ui.slider(host.controls, { id:"eqMag", label:"Magnitude", min:3,max:9,step:0.1,value:magnitude, onInput:(v)=>{magnitude=v; updateText(host);} });
    EarthLab.ui.slider(host.controls, { id:"eqDepth", label:"Focal depth", min:2,max:60,step:1,value:depth, unit:" km", onInput:(v)=>{depth=v; updateText(host);} });
    EarthLab.ui.slider(host.controls, { id:"eqDist", label:"Distance to city", min:5,max:500,step:5,value:distance, unit:" km", onInput:(v)=>{distance=v; updateText(host);} });
    EarthLab.ui.button(host.controls, { label:"⚡ Trigger Earthquake", onClick:()=>{
      waveR=0; shaking=false; shakeT=0; seismTrace=[]; running=true; loop(host);
    }});
  }

  function reset(host){
    running=false; if(rafId) cancelAnimationFrame(rafId);
    magnitude=6.0; depth=20; distance=100; waveR=0; shaking=false; seismTrace=[];
    renderControls(host); draw(host); updateText(host);
  }

  EarthLab.registerSim({
    id:"earthquake",
    title:"Earthquake Simulator",
    objective:"Investigate how magnitude, focal depth and distance from the epicentre affect the intensity of ground shaking felt at a location.",
    intro:"Trigger an earthquake and watch seismic waves radiate outward on a live seismograph.",
    explainDefault:"Set magnitude, depth and distance, then trigger an earthquake to see the resulting shaking.",
    findings:[
      "Magnitude measures the total energy released at the source, on a logarithmic scale.",
      "Intensity — what people actually feel — decreases with distance from the epicentre.",
      "Shallow-focus earthquakes generally cause stronger surface shaking than deep ones of the same magnitude.",
      "Seismographs record ground motion as a wiggly trace that grows during an earthquake."
    ],
    glossaryTerms:["Fault","Seismic wave","Magnitude","Epicentre"],
    mount(host){ reset(host); return ()=>{ running=false; if(rafId) cancelAnimationFrame(rafId); }; },
    reset(host){ reset(host); },
    randomize(host){
      magnitude = (3+Math.random()*6); depth=Math.round(2+Math.random()*58); distance=Math.round(5+Math.random()*495);
      renderControls(host); draw(host); updateText(host);
    },
    quiz:[
      { q:"What does earthquake magnitude measure?", options:["Felt shaking at one location","Total energy released at the source","Distance to the epicentre only","Time of day"], answer:1, explain:"Magnitude is a source measurement of total energy released, independent of location." },
      { q:"As you move farther from the epicentre, shaking intensity generally:", options:["Increases","Stays exactly the same","Decreases","Becomes negative"], answer:2, explain:"Seismic energy spreads out and weakens with distance, so intensity decreases." },
      { q:"For the same magnitude, which earthquake usually causes stronger surface shaking?", options:["A deep-focus earthquake","A shallow-focus earthquake","Depth makes no difference","Only distance matters"], answer:1, explain:"Shallow earthquakes release their energy closer to the surface, so shaking is typically stronger." },
      { q:"The epicentre is:", options:["The point underground where rupture starts","The point on the surface directly above the focus","A type of seismograph","A rock type"], answer:1, explain:"The focus is underground; the epicentre is the surface point directly above it." },
    ]
  });
})();
