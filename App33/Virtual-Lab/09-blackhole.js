/* ==========================================================================
   SIM 09 — BLACK HOLE & GRAVITY EXPLORER
   Simplified (Newtonian, pixel-unit) gravity-well + orbiting test particle.
   Explicitly conceptual — not a physically exact GR simulation.
   ========================================================================== */
(function(){
  const OBJECTS = {
    star:{label:'Star', radiusPx:26, color:'#fde68a'},
    neutron:{label:'Neutron Star', radiusPx:9, color:'#c7d2fe'},
    blackhole:{label:'Black Hole', radiusPx:0, color:'#000'},
  };

  SimModules['blackhole'] = {
    category:'Gravity & Relativity (Conceptual)',
    tagline:'Probe a gravity well, launch orbits, and find the escape-velocity threshold.',
    formula:'v_escape = √(2GM/r); Schwarzschild radius r_s = 2GM/c² defines the event horizon.',
    aspect:0.62,
    objectives:[
      'Visualise gravity as a "well" that curves the space around a massive object.',
      'Discover the relationship between launch speed and orbit shape: fall-in, orbit, or escape.',
      'Understand the concept of escape velocity and the event horizon.',
      'Compare gravity at the surface of a star, neutron star, and black hole of similar mass.'
    ],
    background:'Gravity can be visualised as a curvature in space, often illustrated as a "rubber sheet" dimpled by a heavy ball — the grid warp shown here is that same idea in two dimensions. A test particle\u2019s fate around a massive object depends entirely on its speed relative to the local circular orbital speed: too slow and it spirals inward, just right and it settles into a stable orbit, and fast enough (\u2265\u221a2 × the circular speed) and it escapes entirely. For an object dense enough — a black hole — there exists a boundary called the event horizon inside which even light cannot reach the escape speed, so nothing, not even light, can return.',
    applications:[
      'Escape velocity calculations are essential for spacecraft launches and interplanetary trajectory planning.',
      'Gravitational lensing, a real prediction confirmed in 1919, is used today to detect exoplanets and dark matter.',
      'Understanding stellar remnants — white dwarfs, neutron stars, black holes — reveals the life cycles of stars of different masses.'
    ],
    facts:[
      'The Schwarzschild radius (event horizon size) of Earth\u2019s entire mass would be less than 1 centimetre.',
      'The first-ever image of a black hole\u2019s shadow (M87*) was released in 2019 by the Event Horizon Telescope.',
      'Neutron stars pack roughly a Sun\u2019s worth of mass into a sphere about 20 km across.',
      'Nothing can escape from inside a black hole\u2019s event horizon — not even light — hence the name.'
    ],
    misconceptions:[
      'Black holes do not "suck in" everything nearby like a vacuum cleaner — from a safe distance, their gravity behaves just like any other object of the same mass.',
      'This simulation uses simplified Newtonian mechanics for teaching purposes; real black holes require Einstein\u2019s general relativity for accurate description.',
      'A black hole is not a hole in space — it is an extremely compact concentration of mass.'
    ],
    controls:[
      {key:'objectType', label:'Central object', type:'toggle-group', value:'blackhole', options:[{label:'Star',value:'star'},{label:'Neutron Star',value:'neutron'},{label:'Black Hole',value:'blackhole'}], onChange:(e)=>relaunch(e)},
      {key:'mass', label:'Mass', min:0.5, max:5, step:0.1, value:2, unit:' M☉', format:v=>v.toFixed(1), onChange:(e)=>relaunch(e)},
      {key:'startDistance', label:'Launch distance', min:50, max:230, step:5, value:150, unit:' px', onChange:(e)=>relaunch(e)},
      {key:'speedFactor', label:'Launch speed (× circular orbit speed)', min:0.2, max:2.0, step:0.02, value:1.0, format:v=>v.toFixed(2), onChange:(e)=>relaunch(e)},
    ],
    quiz:[
      {q:'A test particle launched at exactly the circular orbital speed will…', options:['Immediately escape','Spiral into the centre','Follow a stable circular orbit','Stop moving'], correct:2, explain:'At exactly the local circular speed, gravity provides precisely the centripetal force needed for a stable circular orbit.'},
      {q:'Escape velocity is reached at approximately what multiple of the circular orbital speed?', options:['0.5×','1.0×','√2 ≈ 1.41×','3×'], correct:2, explain:'Escape velocity equals the circular orbital speed multiplied by √2, a classic result of orbital mechanics.'},
      {q:'What makes a black hole different from a star of the same mass?', options:['It has more mass','It is far more compact, so its escape velocity at the surface exceeds the speed of light','It has no gravity','It is always spinning'], correct:1, explain:'A black hole packs the same mass into a much smaller radius, making its escape velocity at the horizon exceed light speed itself.'},
    ],
    dataColumns:['t (s)','Distance from centre (px)','Speed','Status'],
    logEvery:20,
    graphLabel:'Distance from centre vs time',

    setup(engine){ relaunch(engine); },
    reset(engine){ relaunch(engine); },

    update(engine, dt){
      const st = engine.state;
      if(!st.p || st.p.status!=='active') { st._respawnT = (st._respawnT||0)+dt; if(st._respawnT>1.2) relaunch(engine); return; }
      const mu = engine.state.mass*1800; // gravitational parameter in px-units
      const sub = 6;
      for(let i=0;i<sub;i++){
        const h = dt/sub;
        const dx=st.p.x, dy=st.p.y; const r = Math.hypot(dx,dy)||1;
        const a = mu/(r*r);
        const ax=-a*dx/r, ay=-a*dy/r;
        st.p.vx += ax*h; st.p.vy += ay*h;
        st.p.x += st.p.vx*h; st.p.y += st.p.vy*h;
      }
      const r = Math.hypot(st.p.x, st.p.y);
      const obj = OBJECTS[engine.state.objectType];
      const horizonR = engine.state.objectType==='blackhole' ? Math.max(6, engine.state.mass*7) : obj.radiusPx;
      if(r < horizonR){ st.p.status='captured'; st._respawnT=0; }
      else if(r > 340){ st.p.status='escaped'; st._respawnT=0; }
      st.trail.push({x:st.p.x, y:st.p.y}); if(st.trail.length>220) st.trail.shift();
    },

    draw(engine){
      const {ctx, cssW:w, cssH:h, state} = engine;
      if(!state._stars) state._stars = Draw.makeStars(w,h,110);
      Draw.space(ctx,w,h,state._stars);
      const cx=w/2, cy=h/2;
      const mu = state.mass*1800;
      const obj = OBJECTS[state.objectType];
      const horizonR = state.objectType==='blackhole' ? Math.max(6, state.mass*7) : obj.radiusPx;

      // warped grid (rubber-sheet dimple analogy)
      ctx.strokeStyle='rgba(124,58,237,.35)'; ctx.lineWidth=1;
      const N=16, spacing=Math.max(w,h)/N;
      function warp(px,py){
        const dx=px-cx, dy=py-cy; const dist=Math.hypot(dx,dy)||1;
        const pull = Math.min(dist*0.85, mu*2.6/dist);
        const nd = Math.max(horizonR*0.6, dist-pull);
        return [cx+dx/dist*nd, cy+dy/dist*nd];
      }
      for(let gx=-N; gx<=N; gx++){
        ctx.beginPath();
        for(let gy=-N; gy<=N; gy++){
          const [x,y] = warp(cx+gx*spacing, cy+gy*spacing);
          if(x<-20||x>w+20||y<-20||y>h+20) continue;
          gy===-N ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      for(let gy=-N; gy<=N; gy++){
        ctx.beginPath();
        for(let gx=-N; gx<=N; gx++){
          const [x,y] = warp(cx+gx*spacing, cy+gy*spacing);
          if(x<-20||x>w+20||y<-20||y>h+20) continue;
          gx===-N ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.stroke();
      }

      // trail
      if(state.trail && state.trail.length>1){
        ctx.strokeStyle='rgba(34,211,238,.55)'; ctx.lineWidth=1.6;
        ctx.beginPath();
        state.trail.forEach((p,i)=>{ const x=cx+p.x,y=cy+p.y; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
        ctx.stroke();
      }

      // central object
      if(state.objectType==='blackhole'){
        ctx.beginPath(); ctx.arc(cx,cy,horizonR,0,Math.PI*2); ctx.fillStyle='#000'; ctx.fill();
        ctx.strokeStyle='#fbbf24'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cx,cy,horizonR,0,Math.PI*2); ctx.stroke();
        Draw.label(ctx,'Event horizon', cx, cy+horizonR+16, '#fbbf24', 10.5);
      } else {
        Draw.glowBody(ctx, cx, cy, horizonR, '#fff', obj.color, 1.6);
        Draw.label(ctx, obj.label+' surface', cx, cy+horizonR+16, '#cbd5e1', 10.5);
      }

      // particle
      if(state.p && state.p.status==='active'){
        const x=cx+state.p.x, y=cy+state.p.y;
        ctx.beginPath(); ctx.arc(x,y,4.5,0,Math.PI*2); ctx.fillStyle='#f8fafc'; ctx.fill();
        ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1; ctx.stroke();
      } else if(state.p){
        Draw.label(ctx, state.p.status==='captured'?'Captured!':'Escaped!', cx, cy-horizonR-40, state.p.status==='captured'?'#f87171':'#34d399', 14);
      }
    },

    stageLeft(engine){ return OBJECTS[engine.state.objectType].label; },
    stageRight(engine){ return engine.state.p ? (engine.state.p.status==='active'?'Orbiting':engine.state.p.status) : ''; },

    readouts(engine){
      const mu = engine.state.mass*1800;
      const vCirc = Math.sqrt(mu/engine.state.startDistance);
      const vEsc = vCirc*Math.SQRT2;
      const r = engine.state.p ? Math.hypot(engine.state.p.x, engine.state.p.y) : 0;
      const v = engine.state.p ? Math.hypot(engine.state.p.vx, engine.state.p.vy) : 0;
      return {
        'Status': engine.state.p ? engine.state.p.status : '—',
        'Circular orbit speed': vCirc.toFixed(1)+' px/s',
        'Escape velocity (√2×)': vEsc.toFixed(1)+' px/s',
        'Launch speed set': (engine.state.speedFactor*vCirc).toFixed(1)+' px/s',
        'Current distance': r.toFixed(0)+' px',
        'Current speed': v.toFixed(1)+' px/s',
      };
    },
    dataRow(engine){
      const r = engine.state.p ? Math.hypot(engine.state.p.x, engine.state.p.y) : 0;
      const v = engine.state.p ? Math.hypot(engine.state.p.vx, engine.state.p.vy) : 0;
      return [engine.t.toFixed(1), r.toFixed(0), v.toFixed(1), engine.state.p?engine.state.p.status:''];
    },
    graphValue(row){ return {x:Number(row[0]), y:Number(row[1])}; }
  };

  function relaunch(engine){
    const st = engine.state;
    const mu = st.mass*1800;
    const r0 = st.startDistance;
    const vCirc = Math.sqrt(mu/r0);
    const v0 = vCirc*st.speedFactor;
    st.p = {x:r0, y:0, vx:0, vy:v0, status:'active'};
    st.trail = [];
    st._respawnT = 0;
  }
})();
