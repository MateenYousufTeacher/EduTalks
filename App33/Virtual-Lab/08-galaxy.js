/* ==========================================================================
   SIM 08 — GALAXY EXPLORER
   Procedurally generated spiral / elliptical / irregular galaxy structures.
   ========================================================================== */
(function(){
  const TYPE_INFO = {
    spiral: {label:'Spiral', diameter:'~100,000 light-years (like the Milky Way)', stars:'100–400 billion stars', example:'Milky Way, Andromeda (M31)'},
    elliptical: {label:'Elliptical', diameter:'From 3,000 to over 1,000,000 light-years', stars:'A few million to over a trillion stars', example:'M87, M32'},
    irregular: {label:'Irregular', diameter:'Typically 1,000–20,000 light-years', stars:'A few hundred million to a few billion stars', example:'Large & Small Magellanic Clouds'},
  };

  function genSpiral(n, arms){
    const pts=[];
    for(let i=0;i<n;i++){
      const arm = Math.floor(Math.random()*arms);
      const t = Math.random();
      const r = Math.pow(t,0.55)*1.0;
      const baseAngle = (arm/arms)*Math.PI*2;
      const winding = r*4.2;
      const noise = (Math.random()-0.5)*0.5*(1-r*0.6);
      const angle = baseAngle + winding + noise;
      pts.push({r, angle, core: r<0.12});
    }
    return pts;
  }
  function genElliptical(n){
    const pts=[];
    for(let i=0;i<n;i++){
      let u=Math.random(),v=Math.random();
      let r = Math.sqrt(-2*Math.log(u+1e-6))*0.28;
      const angle = v*Math.PI*2;
      pts.push({r:Math.min(r,1), angle, core:r<0.15});
    }
    return pts;
  }
  function genIrregular(n){
    const clusters = Array.from({length:5+Math.floor(Math.random()*3)}, ()=>({
      ang: Math.random()*Math.PI*2, r: Math.random()*0.7, spread: 0.12+Math.random()*0.18
    }));
    const pts=[];
    for(let i=0;i<n;i++){
      const c = clusters[Math.floor(Math.random()*clusters.length)];
      const rr = Math.max(0, c.r + (Math.random()-0.5)*c.spread*2);
      const aa = c.ang + (Math.random()-0.5)*1.4;
      pts.push({r:Math.min(rr,1), angle:aa, core:false});
    }
    return pts;
  }

  SimModules['galaxy'] = {
    category:'Galaxies & Large-Scale Structure',
    tagline:'Generate and compare spiral, elliptical and irregular galaxies.',
    formula:'Differential rotation: spiral arms trail because inner stars complete an orbit faster than outer stars for a given rotation curve v(r).',
    aspect:0.65,
    objectives:[
      'Identify the three main galaxy classifications: spiral, elliptical, and irregular.',
      'Compare relative sizes and star populations across galaxy types.',
      'Recognise the Milky Way as a barred spiral galaxy from its structural features.',
      'Understand that galaxies are themselves grouped into clusters across the universe.'
    ],
    background:'Galaxies are enormous, gravitationally bound systems containing stars, gas, dust, and — by mass — mostly dark matter. Edwin Hubble\u2019s 1926 classification scheme still broadly organises galaxies today: spirals have flattened, rotating discs with star-forming arms; ellipticals are smooth, rounded systems of mostly older stars with little ongoing star formation; and irregulars have no defined symmetric shape, often the result of gravitational interactions or mergers with neighbouring galaxies.',
    applications:[
      'Studying galaxy shapes helps astronomers trace cosmic history, since collisions and mergers reshape galaxies over billions of years.',
      'Measuring galaxy rotation curves provided some of the strongest early evidence for dark matter.',
      'Classifying distant galaxies helps map the large-scale structure of the universe.'
    ],
    facts:[
      'The Milky Way and the Andromeda Galaxy are on a collision course, expected to merge in about 4.5 billion years.',
      'Elliptical galaxies range from some of the smallest to the very largest galaxies known.',
      'Our Milky Way is a barred spiral galaxy — its arms extend from a central elongated bar of stars.',
      'The observable universe contains an estimated two trillion galaxies.'
    ],
    misconceptions:[
      'Not all galaxies are spiral-shaped like the Milky Way — ellipticals and irregulars are common too.',
      'Galaxies are mostly empty space; individual stars within them almost never collide, even during galaxy mergers.',
      'Spiral arms are not fixed structures of stars moving together — they are density waves that stars move through over time.'
    ],
    controls:[
      {key:'type', label:'Galaxy type', type:'toggle-group', value:'spiral', options:[{label:'Spiral',value:'spiral'},{label:'Elliptical',value:'elliptical'},{label:'Irregular',value:'irregular'}], onChange:(engine)=>{ engine.state._regen = true; }},
      {key:'arms', label:'Spiral arms', min:2, max:5, step:1, value:3, onChange:(engine)=>{ engine.state._regen = true; }},
      {key:'density', label:'Star density', min:800, max:5000, step:100, value:2400, onChange:(engine)=>{ engine.state._regen = true; }},
      {key:'zoom', label:'Zoom', min:0.6, max:2.2, step:0.05, value:1, format:v=>v.toFixed(2), unit:'×'},
      {key:'rotSpeed', label:'Rotation speed', min:0, max:3, step:0.1, value:0.6, unit:'×'},
    ],
    quiz:[
      {q:'Which galaxy type is the Milky Way?', options:['Elliptical','Irregular','Barred spiral','Ring galaxy'], correct:2, explain:'The Milky Way is a barred spiral galaxy, with a central bar of stars and spiral arms extending from it.'},
      {q:'Elliptical galaxies are generally characterised by…', options:['Active new star formation and blue arms','Smooth shape, older stars, little new star formation','Always being the smallest galaxies','A single spiral arm'], correct:1, explain:'Ellipticals are smooth, rounded systems typically composed of older stars with little ongoing star formation.'},
      {q:'Irregular galaxies often result from…', options:['Perfectly stable isolated evolution','Gravitational interactions or mergers','Being extremely young universes','Black hole formation only'], correct:1, explain:'Irregular galaxies frequently owe their chaotic shape to gravitational interactions, tidal disruption, or mergers with other galaxies.'},
    ],
    dataColumns:['t (s)','Galaxy type','Star count','Rotation angle (°)'],
    logEvery:30,

    setup(engine){ engine.state._regen = true; engine.state.rotAngle = 0; },
    reset(engine){ engine.state.rotAngle = 0; },
    update(engine, dt){ engine.state.rotAngle += dt*(engine.state.rotSpeed||0.6)*8; },

    draw(engine){
      const {ctx, cssW:w, cssH:h, state} = engine;
      ctx.fillStyle='#03040a'; ctx.fillRect(0,0,w,h);
      if(state._regen || !state._pts){
        const n = state.density||2400;
        state._pts = state.type==='spiral' ? genSpiral(n, state.arms||3)
                    : state.type==='elliptical' ? genElliptical(n)
                    : genIrregular(n);
        state._regen = false;
      }
      const cx=w/2, cy=h/2;
      const R = Math.min(w,h)*0.42*(state.zoom||1);
      const rot = state.rotAngle*Math.PI/180;
      const info = TYPE_INFO[state.type];

      // background haze
      const haze = ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.1);
      haze.addColorStop(0,'rgba(124,58,237,.10)'); haze.addColorStop(1,'rgba(124,58,237,0)');
      ctx.fillStyle=haze; ctx.beginPath(); ctx.arc(cx,cy,R*1.1,0,Math.PI*2); ctx.fill();

      state._pts.forEach(p=>{
        const ang = p.angle + (state.type!=='elliptical'?rot:rot*0.15);
        const rr = p.r*R;
        const x = cx + Math.cos(ang)*rr*(state.type==='elliptical'? (1-0.35) : 1);
        const y = cy + Math.sin(ang)*rr*(state.type==='elliptical'? 0.65 : (state.type==='spiral'?0.42:0.8));
        const dist = p.r;
        const size = p.core ? (Math.random()*1.6+1.4) : (Math.random()*1.1+0.3);
        const hue = p.core ? '255,244,214' : (dist<0.4 ? '224,231,255' : '186,225,255');
        ctx.globalAlpha = p.core ? 0.9 : Math.max(0.12, 0.75-dist*0.5);
        ctx.fillStyle = `rgb(${hue})`;
        ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // core glow
      Draw.glowBody(ctx, cx, cy, R*0.06, '#fff9e6', '#fbbf24', 3.2);

      // scale bar
      ctx.strokeStyle='rgba(226,232,240,.6)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(20,h-20); ctx.lineTo(20+R*0.4,h-20); ctx.stroke();
      Draw.label(ctx, info.diameter.split(' ')[0]+' (illustrative)', 20+R*0.2, h-28, '#94a3b8', 10, 'center');

      Draw.label(ctx, info.label+' Galaxy', cx, 24, '#e2e8f0', 14);
    },

    stageLeft(engine){ return TYPE_INFO[engine.state.type].label+' galaxy'; },
    stageRight(engine){ return (engine.state.density||2400)+' particles'; },

    readouts(engine){
      const info = TYPE_INFO[engine.state.type];
      return {
        'Type': info.label,
        'Typical diameter': info.diameter,
        'Typical star count': info.stars,
        'Real-world example': info.example,
        'Rendered particles': engine.state.density,
      };
    },
    dataRow(engine){
      return [engine.t.toFixed(1), engine.state.type, engine.state.density, Math.round(engine.state.rotAngle%360)];
    }
  };
})();
