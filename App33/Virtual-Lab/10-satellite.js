/* ==========================================================================
   SIM 10 — SPACE MISSIONS & SATELLITE SIMULATOR
   Real two-body orbital mechanics (km / s, Earth GM) with numerical
   integration — launch angle, velocity and altitude genuinely determine
   the resulting orbit.
   ========================================================================== */
(function(){
  const GM = 398600; // km^3/s^2
  const R_EARTH = 6371; // km

  function relaunch(engine){
    const st = engine.state;
    const r0 = R_EARTH + st.altitude;
    const vCirc = Math.sqrt(GM/r0);
    const v0 = vCirc*st.velocityFactor;
    const gamma = st.flightPathAngle*Math.PI/180;
    st.p = {
      x:r0, y:0,
      vx: v0*Math.sin(gamma), vy: v0*Math.cos(gamma),
      status:'active'
    };
    st.trail = [];
    st._respawnT = 0;
  }
  function setControl(engine, key, val){
    const inp = document.getElementById('ci-'+key);
    if(inp){ inp.value = val; inp.dispatchEvent(new Event('input')); }
  }
  const PRESETS = {
    leo:{altitude:400, velocityFactor:1.0, flightPathAngle:0, label:'Low Earth Orbit'},
    polar:{altitude:700, velocityFactor:1.0, flightPathAngle:0, label:'Polar Orbit'},
    geo:{altitude:35786, velocityFactor:1.0, flightPathAngle:0, label:'Geostationary Orbit'},
    escape:{altitude:400, velocityFactor:1.5, flightPathAngle:0, label:'Escape Trajectory'},
  };

  SimModules['satellite'] = {
    category:'Spaceflight & Missions',
    tagline:'Choose an injection altitude, speed and angle, and fly the resulting real orbit.',
    formula:'Orbit type from vis-viva energy ε = v²/2 − GM/r: ε<0 → closed ellipse/circle, ε≥0 → escape trajectory.',
    aspect:0.62,
    objectives:[
      'Determine the orbital altitude and speed needed for a stable circular orbit.',
      'Distinguish low Earth, polar, and geostationary orbits by purpose and altitude.',
      'Discover the minimum speed at which a spacecraft escapes Earth\u2019s gravity entirely.',
      'Understand how flight path angle affects orbital eccentricity.'
    ],
    background:'Every satellite mission begins with choosing an orbit to match its purpose. Low Earth Orbit (a few hundred kilometres up) suits Earth observation and the International Space Station, offering short orbital periods (~90 minutes) and easy access. Polar orbits pass near both poles, letting a satellite scan the entire globe as Earth rotates beneath it — ideal for weather and mapping satellites. Geostationary orbit, at 35,786 km altitude directly above the equator, matches Earth\u2019s rotation exactly, so a satellite appears fixed in the sky — perfect for communications and weather monitoring. This simulator numerically integrates real two-body orbital mechanics, so the orbit you see is the orbit the mathematics actually produces.',
    applications:[
      'GPS satellites orbit at medium altitude (~20,200 km), balancing coverage and signal timing precision.',
      'Weather satellites use geostationary orbits for constant monitoring of one region, and polar orbits for global coverage.',
      'Interplanetary probes require injection velocities beyond Earth escape velocity, calculated using exactly this kind of orbital mechanics.'
    ],
    facts:[
      'The International Space Station orbits at roughly 400 km altitude, completing an orbit every ~93 minutes.',
      'Geostationary satellites all share a single ring 35,786 km above the equator — a limited, carefully managed resource.',
      'Earth\u2019s escape velocity at the surface is about 11.2 km/s — roughly 40,000 km/h.',
      'The first artificial satellite, Sputnik 1, launched in 1957, orbited Earth every 96 minutes.'
    ],
    misconceptions:[
      'Objects in orbit are not "beyond gravity" — astronauts on the ISS are still pulled by about 90% of surface gravity; they simply fall continuously around Earth.',
      'A higher orbit is not automatically "faster" — orbital speed actually decreases with altitude, though the orbital period (time per lap) increases.',
      'Escaping Earth\u2019s gravity does not require infinite speed — just over 11.2 km/s at the surface is sufficient.'
    ],
    controls:[
      {key:'preset', label:'Mission preset', type:'toggle-group', value:'leo', options:[
        {label:'LEO',value:'leo'},{label:'Polar',value:'polar'},{label:'GEO',value:'geo'},{label:'Escape',value:'escape'}],
        onChange:(engine,val)=>{ const p=PRESETS[val]; setControl(engine,'altitude',p.altitude); setControl(engine,'velocityFactor',p.velocityFactor); setControl(engine,'flightPathAngle',p.flightPathAngle); }},
      {key:'altitude', label:'Injection altitude', min:200, max:42000, step:100, value:400, unit:' km', onChange:relaunch},
      {key:'velocityFactor', label:'Injection speed (× circular speed)', min:0.5, max:1.8, step:0.02, value:1.0, format:v=>v.toFixed(2), onChange:relaunch},
      {key:'flightPathAngle', label:'Flight path angle', min:0, max:35, step:1, value:0, unit:'°', onChange:relaunch},
      {key:'timeWarp', label:'Time warp', min:40, max:2000, step:20, value:400, unit:'× '},
    ],
    quiz:[
      {q:'What altitude is geostationary orbit?', options:['400 km','2,000 km','35,786 km','1 million km'], correct:2, explain:'At 35,786 km above the equator, a satellite\u2019s orbital period exactly matches Earth\u2019s 24-hour rotation.'},
      {q:'A satellite injected at exactly circular speed will…', options:['Crash into Earth','Follow a near-circular stable orbit','Escape immediately','Stop moving'], correct:1, explain:'Circular injection speed provides exactly the centripetal force balance needed for a stable, near-circular orbit.'},
      {q:'Which orbit type is best for a satellite that must image the entire Earth over time?', options:['Geostationary','Polar orbit','Escape trajectory','No orbit needed'], correct:1, explain:'A polar orbit passes near both poles; as Earth rotates beneath it, the satellite eventually passes over every location.'},
    ],
    dataColumns:['t (s)','Altitude (km)','Speed (km/s)','Status'],
    logEvery:20,
    graphLabel:'Altitude vs time (km)',

    setup(engine){ relaunch(engine); },
    reset(engine){ relaunch(engine); },

    update(engine, dt){
      const st = engine.state;
      if(!st.p || st.p.status!=='active'){ st._respawnT=(st._respawnT||0)+dt; if(st._respawnT>1.5) relaunch(engine); return; }
      const dtSim = dt*(st.timeWarp||400);
      const subs = Math.min(80, Math.max(6, Math.round((st.timeWarp||400)/25)));
      const h = dtSim/subs;
      for(let i=0;i<subs;i++){
        const r = Math.hypot(st.p.x, st.p.y)||1;
        const a = GM/(r*r);
        const ax=-a*st.p.x/r, ay=-a*st.p.y/r;
        st.p.vx += ax*h; st.p.vy += ay*h;
        st.p.x += st.p.vx*h; st.p.y += st.p.vy*h;
      }
      const r = Math.hypot(st.p.x, st.p.y);
      if(r < R_EARTH){ st.p.status='reentry'; st._respawnT=0; }
      else if(r > R_EARTH*40){ st.p.status='escaped'; st._respawnT=0; }
      st.trail.push({x:st.p.x, y:st.p.y}); if(st.trail.length>260) st.trail.shift();
    },

    draw(engine){
      const {ctx, cssW:w, cssH:h, state} = engine;
      if(!state._stars) state._stars = Draw.makeStars(w,h,110);
      Draw.space(ctx,w,h,state._stars);
      const cx=w/2, cy=h/2;
      const scale = (Math.min(w,h)*0.42)/50000; // px per km, fits ~50,000km radius
      Draw.glowBody(ctx, cx, cy, R_EARTH*scale, '#bfdbfe', '#2563eb', 1.15);
      Draw.label(ctx,'Earth', cx, cy+R_EARTH*scale+16, '#93c5fd', 11);

      // reference orbit rings
      [2000,20200,35786].forEach(km=>{
        ctx.strokeStyle='rgba(148,163,184,.14)'; ctx.setLineDash([2,5]);
        ctx.beginPath(); ctx.arc(cx,cy,(R_EARTH+km)*scale,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      });

      if(state.trail && state.trail.length>1){
        ctx.strokeStyle='rgba(34,211,238,.6)'; ctx.lineWidth=1.6;
        ctx.beginPath();
        state.trail.forEach((p,i)=>{ const x=cx+p.x*scale, y=cy+p.y*scale; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
        ctx.stroke();
      }
      if(state.p && state.p.status==='active'){
        const x=cx+state.p.x*scale, y=cy+state.p.y*scale;
        ctx.save(); ctx.translate(x,y);
        ctx.fillStyle='#f8fafc'; ctx.beginPath(); ctx.arc(0,0,3.5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#fbbf24'; ctx.lineWidth=1.4;
        ctx.beginPath(); ctx.moveTo(-6,-6); ctx.lineTo(6,6); ctx.moveTo(6,-6); ctx.lineTo(-6,6); ctx.stroke();
        ctx.restore();
      } else if(state.p){
        const msg = state.p.status==='reentry' ? 'Re-entry / crashed' : 'Escaped Earth orbit!';
        Draw.label(ctx, msg, cx, cy-R_EARTH*scale-30, state.p.status==='reentry'?'#f87171':'#34d399', 14);
      }
    },

    stageLeft(engine){ return engine.state.p ? engine.state.p.status : ''; },
    stageRight(engine){
      const r = engine.state.p ? Math.hypot(engine.state.p.x, engine.state.p.y)-R_EARTH : 0;
      return 'Alt '+Math.round(r)+' km';
    },

    readouts(engine){
      const r0 = R_EARTH+engine.state.altitude;
      const vCirc = Math.sqrt(GM/r0), vEsc = vCirc*Math.SQRT2;
      const r = engine.state.p ? Math.hypot(engine.state.p.x, engine.state.p.y) : r0;
      const v = engine.state.p ? Math.hypot(engine.state.p.vx, engine.state.p.vy) : 0;
      const periodMin = 2*Math.PI*Math.sqrt(Math.pow(r0,3)/GM)/60;
      return {
        'Status': engine.state.p ? engine.state.p.status : '—',
        'Circular speed here': vCirc.toFixed(2)+' km/s',
        'Escape speed here': vEsc.toFixed(2)+' km/s',
        'Approx. orbital period': periodMin.toFixed(0)+' min',
        'Current altitude': Math.max(0,Math.round(r-R_EARTH))+' km',
        'Current speed': v.toFixed(2)+' km/s',
      };
    },
    dataRow(engine){
      const r = engine.state.p ? Math.hypot(engine.state.p.x, engine.state.p.y) : R_EARTH;
      const v = engine.state.p ? Math.hypot(engine.state.p.vx, engine.state.p.vy) : 0;
      return [engine.t.toFixed(1), Math.round(r-R_EARTH), v.toFixed(2), engine.state.p?engine.state.p.status:''];
    },
    graphValue(row){ return {x:Number(row[0]), y:Number(row[1])}; }
  };
})();
