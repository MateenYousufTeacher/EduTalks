/* ==========================================================================
   SIM 01 — SOLAR SYSTEM EXPLORER
   ========================================================================== */
(function(){
  const PLANETS = [
    {name:'Mercury', au:0.39, periodDays:88,    relR:0.383, color:'#b1a6a1'},
    {name:'Venus',   au:0.72, periodDays:225,   relR:0.949, color:'#e0c27a'},
    {name:'Earth',   au:1.00, periodDays:365.25,relR:1.000, color:'#3b82f6'},
    {name:'Mars',    au:1.52, periodDays:687,   relR:0.532, color:'#c1440e'},
    {name:'Jupiter', au:5.20, periodDays:4331,  relR:11.2,  color:'#d9a066'},
    {name:'Saturn',  au:9.58, periodDays:10747, relR:9.45,  color:'#e8d3a0'},
    {name:'Uranus',  au:19.2, periodDays:30589, relR:4.01,  color:'#9be7e7'},
    {name:'Neptune', au:30.05,periodDays:59800, relR:3.88,  color:'#4169e1'},
  ];
  const DWARF = {name:'Pluto', au:39.5, periodDays:90560, relR:0.186, color:'#c9b8a8'};

  SimModules['solar-system'] = {
    category:'Orbital Mechanics',
    tagline:'A scaled, animated model of the Sun\u2019s eight planets — rotate, zoom, and measure.',
    formula:'T² ∝ a³ (Kepler’s Third Law) — orbital period squared is proportional to semi-major axis cubed, in AU and years.',
    aspect:0.72,
    objectives:[
      'Identify the eight planets in correct order of distance from the Sun.',
      'Observe that planets closer to the Sun orbit faster and complete their year sooner.',
      'Use the tilt and zoom controls to view the Solar System from different angles.',
      'Compare relative orbital distances using the AU (Astronomical Unit).'
    ],
    background:'The Solar System formed roughly 4.6 billion years ago from a rotating cloud of gas and dust. Today it contains the Sun, eight planets, five recognised dwarf planets including Pluto, over 200 moons, and countless asteroids and comets — all held in orbit by the Sun\u2019s gravity. Distances here are compressed (using a square-root scale) so that both Mercury and Neptune fit on screen; sizes are shown on a separate scale so small planets remain visible.',
    applications:[
      'Space agencies use precise orbital models to plan planetary flybys and landings.',
      'Understanding planetary order and distance underpins navigation of interplanetary probes.',
      'Orbital period calculations are the basis of Kepler\u2019s laws, still used to find exoplanets today.'
    ],
    facts:[
      'Jupiter is so massive that the Sun and Jupiter technically orbit a shared point just outside the Sun\u2019s surface.',
      'A year on Neptune lasts about 165 Earth years — it has not completed one full orbit since its discovery in 1846.',
      'The asteroid belt between Mars and Jupiter contains millions of objects, but its total mass is less than the Moon\u2019s.',
      'Pluto was reclassified as a "dwarf planet" in 2006 because it does not clear its orbital neighbourhood.'
    ],
    misconceptions:[
      'The Solar System is not to scale in any single classroom diagram — real distances are far too vast to show planet sizes and orbits accurately together.',
      'Planets do not orbit in perfect circles; all orbits are ellipses, though most planets\u2019 orbits are nearly circular.',
      'The asteroid belt is not densely packed with rocks — spacecraft can and do fly through it safely.'
    ],
    controls:[
      {key:'daysPerSec', label:'Time warp (Earth days / second)', min:1, max:400, step:1, value:40, unit:' d/s'},
      {key:'zoom', label:'Zoom', min:0.4, max:2.5, step:0.05, value:1, format:v=>v.toFixed(2), unit:'×'},
      {key:'tilt', label:'View tilt', min:10, max:90, step:1, value:55, unit:'°'},
      {key:'showOrbits', label:'Show orbit paths', type:'toggle-group', value:'on', options:[{label:'On',value:'on'},{label:'Off',value:'off'}]},
    ],
    quiz:[
      {q:'Which planet has the longest orbital period (year)?', options:['Earth','Mars','Neptune','Venus'], correct:2, explain:'Neptune, being farthest from the Sun, takes about 165 Earth years to complete one orbit.'},
      {q:'Why do inner planets orbit faster than outer planets?', options:['They are smaller','They feel a stronger gravitational pull from the Sun at closer distance','They have more moons','They spin faster on their axis'], correct:1, explain:'Gravity is stronger at shorter distances, requiring a faster orbital speed to maintain a stable orbit — this is captured by Kepler\u2019s third law.'},
      {q:'What lies between Mars and Jupiter?', options:['The Kuiper Belt','The asteroid belt','The Oort Cloud','A ring of moons'], correct:1, explain:'The asteroid belt, a region of rocky debris left over from planet formation, orbits between Mars and Jupiter.'},
    ],
    dataColumns:['Day','Selected Body','Distance (AU)','Speed (relative)'],
    logEvery:15,
    graphLabel:'Distance from Sun vs time (AU)',

    setup(engine){
      engine.state.selected = 'Earth';
      engine.state.angleOffset = 0;
      engine.state.dragging = false;
      const canvas = engine.canvas;
      canvas.style.cursor = 'grab';
      canvas.addEventListener('pointerdown', e=>{
        engine.state.dragging = true; engine.state._lastX = e.clientX; canvas.style.cursor='grabbing';
      });
      window.addEventListener('pointerup', ()=>{ engine.state.dragging=false; canvas.style.cursor='grab'; });
      window.addEventListener('pointermove', e=>{
        if(!engine.state.dragging) return;
        const dx = e.clientX - engine.state._lastX; engine.state._lastX = e.clientX;
        engine.state.angleOffset += dx*0.005;
      });
      canvas.addEventListener('click', (e)=>{
        if(engine.state._didDrag) { engine.state._didDrag=false; return; }
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX-rect.left, my = e.clientY-rect.top;
        const hit = engine.state._bodies?.find(b=>Math.hypot(b.px-mx, b.py-my) < Math.max(8,b.r+4));
        if(hit) engine.state.selected = hit.name;
      });
    },
    reset(engine){ engine.state.angleOffset = 0; },

    update(engine, dt){
      // t already advanced by engine; nothing extra needed (positions computed in draw from engine.t)
    },

    draw(engine){
      const {ctx, cssW:w, cssH:h, state} = engine;
      if(!state._stars) state._stars = Draw.makeStars(w,h,140);
      Draw.space(ctx, w, h, state._stars);
      const cx = w/2, cy = h/2;
      const tiltRad = (state.tilt||55) * Math.PI/180;
      const ryFactor = Math.sin(tiltRad);
      const zoom = state.zoom || 1;
      const baseUnit = (Math.min(w,h)/2 - 20) / Math.sqrt(DWARF.au) * zoom;
      const daysPerSec = state.daysPerSec || 40;
      const dayCount = engine.t * daysPerSec;

      // Sun
      Draw.glowBody(ctx, cx, cy, 14, '#fff7d6', '#fbbf24', 2.6);

      const bodies = [];
      const all = [...PLANETS, DWARF];
      all.forEach(p=>{
        const distPx = Math.sqrt(p.au) * baseUnit;
        const angle = (dayCount / p.periodDays) * Math.PI*2 + state.angleOffset;
        const px = cx + Math.cos(angle)*distPx;
        const py = cy + Math.sin(angle)*distPx*ryFactor;
        if(state.showOrbits!=='off'){
          Draw.orbitPath(ctx, cx, cy, distPx, distPx*ryFactor, 0, p===DWARF?'rgba(148,163,184,.18)':'rgba(148,163,184,.28)');
        }
        const r = p===DWARF ? 2.2 : Math.min(13, 2.6 + Math.sqrt(p.relR)*2.6);
        bodies.push({name:p.name, px, py, r, au:p.au, periodDays:p.periodDays, color:p.color});
      });
      // sort by py for pseudo depth
      bodies.sort((a,b)=>a.py-b.py);
      bodies.forEach(b=>{
        Draw.glowBody(ctx, b.px, b.py, b.r, '#fff', b.color, b.name==='Saturn'?0:1.4);
        if(b.name==='Saturn'){
          ctx.save(); ctx.strokeStyle='rgba(232,211,160,.8)'; ctx.lineWidth=2;
          ctx.beginPath(); ctx.ellipse(b.px,b.py,b.r*2.1,b.r*0.7,0.3,0,Math.PI*2); ctx.stroke(); ctx.restore();
        }
        if(b.name===state.selected){
          ctx.strokeStyle='#22d3ee'; ctx.lineWidth=1.4;
          ctx.beginPath(); ctx.arc(b.px,b.py,b.r+6,0,Math.PI*2); ctx.stroke();
        }
        Draw.label(ctx, b.name, b.px, b.py+b.r+13, '#cbd5e1', 10.5);
      });
      state._bodies = bodies;
    },

    stageLeft(engine){ return 'Day '+Math.floor(engine.t*(engine.state.daysPerSec||40)); },
    stageRight(engine){ return engine.state.selected; },

    readouts(engine){
      const p = [...PLANETS, DWARF].find(x=>x.name===engine.state.selected) || PLANETS[2];
      const dayCount = engine.t*(engine.state.daysPerSec||40);
      const speed = (2*Math.PI*p.au)/p.periodDays;
      return {
        'Selected body': p.name,
        'Distance from Sun': p.au+' AU',
        'Orbital period': Math.round(p.periodDays)+' days',
        'Relative orbital speed': speed.toFixed(4)+' AU/day',
        'Days elapsed (sim)': Math.floor(dayCount),
        'Years elapsed (sim)': (dayCount/365.25).toFixed(2),
      };
    },
    dataRow(engine){
      const p = [...PLANETS, DWARF].find(x=>x.name===engine.state.selected) || PLANETS[2];
      const dayCount = Math.floor(engine.t*(engine.state.daysPerSec||40));
      const speed = ((2*Math.PI*p.au)/p.periodDays).toFixed(4);
      return [dayCount, p.name, p.au, speed];
    },
    graphValue(row){ return {x:Number(row[0]), y:Number(row[2])}; }
  };
})();
