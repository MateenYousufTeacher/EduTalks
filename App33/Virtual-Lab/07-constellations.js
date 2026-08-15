/* ==========================================================================
   SIM 07 — STARS & CONSTELLATIONS EXPLORER
   Planisphere-style projection centred on the celestial pole.
   Coordinates are approximate (educational, not survey-precision).
   ========================================================================== */
(function(){
  function ra(h,m=0){ return (h+m/60)*15; } // hours -> degrees

  const CONSTELLATIONS = [
    {name:'Ursa Major', hemi:'N', stars:[
      {n:'Dubhe',ra:ra(11,3),dec:61.75,mag:1.8},{n:'Merak',ra:ra(11,1),dec:56.38,mag:2.4},
      {n:'Phecda',ra:ra(11,53),dec:53.7,mag:2.4},{n:'Megrez',ra:ra(12,15),dec:57.03,mag:3.3},
      {n:'Alioth',ra:ra(12,54),dec:55.96,mag:1.8},{n:'Mizar',ra:ra(13,23),dec:54.93,mag:2.2},
      {n:'Alkaid',ra:ra(13,47),dec:49.31,mag:1.9}],
     lines:[[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]]},
    {name:'Orion', hemi:'EQ', stars:[
      {n:'Betelgeuse',ra:ra(5,55),dec:7.4,mag:0.5},{n:'Bellatrix',ra:ra(5,25),dec:6.35,mag:1.6},
      {n:'Mintaka',ra:ra(5,32),dec:-0.3,mag:2.2},{n:'Alnilam',ra:ra(5,36),dec:-1.2,mag:1.7},
      {n:'Alnitak',ra:ra(5,40),dec:-1.94,mag:1.8},{n:'Saiph',ra:ra(5,47),dec:-9.67,mag:2.1},
      {n:'Rigel',ra:ra(5,14),dec:-8.2,mag:0.1}],
     lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,2],[0,4]]},
    {name:'Cassiopeia', hemi:'N', stars:[
      {n:'Caph',ra:ra(0,9),dec:59.15,mag:2.3},{n:'Shedar',ra:ra(0,40),dec:56.54,mag:2.2},
      {n:'Gamma Cas',ra:ra(0,56),dec:60.72,mag:2.5},{n:'Ruchbah',ra:ra(1,25),dec:60.24,mag:2.7},
      {n:'Segin',ra:ra(1,54),dec:63.67,mag:3.4}],
     lines:[[0,1],[1,2],[2,3],[3,4]]},
    {name:'Leo', hemi:'N', stars:[
      {n:'Regulus',ra:ra(10,8),dec:11.97,mag:1.4},{n:'Algieba',ra:ra(10,20),dec:19.84,mag:2.0},
      {n:'Zosma',ra:ra(11,14),dec:20.52,mag:2.6},{n:'Denebola',ra:ra(11,49),dec:14.57,mag:2.1}],
     lines:[[0,1],[1,2],[2,3],[3,0]]},
    {name:'Scorpius', hemi:'S', stars:[
      {n:'Dschubba',ra:ra(16,0),dec:-22.62,mag:2.3},{n:'Antares',ra:ra(16,29),dec:-26.43,mag:1.1},
      {n:'Shaula',ra:ra(17,34),dec:-37.1,mag:1.6},{n:'Sargas',ra:ra(17,37),dec:-43.0,mag:1.9}],
     lines:[[0,1],[1,2],[2,3]]},
    {name:'Taurus', hemi:'N', stars:[
      {n:'Aldebaran',ra:ra(4,36),dec:16.51,mag:0.9},{n:'Elnath',ra:ra(5,26),dec:28.6,mag:1.7}],
     lines:[[0,1]]},
    {name:'Gemini', hemi:'N', stars:[
      {n:'Castor',ra:ra(7,35),dec:31.89,mag:1.6},{n:'Pollux',ra:ra(7,45),dec:28.03,mag:1.1}],
     lines:[[0,1]]},
    {name:'Crux (Southern Cross)', hemi:'S', stars:[
      {n:'Gacrux',ra:ra(12,31),dec:-57.1,mag:1.6},{n:'Acrux',ra:ra(12,27),dec:-63.1,mag:0.8},
      {n:'Imai',ra:ra(12,15),dec:-58.75,mag:1.9},{n:'Mimosa',ra:ra(12,48),dec:-59.7,mag:1.3}],
     lines:[[0,1],[2,3]]},
  ];

  SimModules['constellations'] = {
    category:'Observational Astronomy',
    tagline:'Rotate the night sky like a planisphere and learn the star patterns above you.',
    formula:'Sky rotation ≈ 15° per hour (360°/24h) — Earth’s rotation carries the celestial sphere overhead at a near-constant angular rate.',
    aspect:0.85,
    objectives:[
      'Locate and name several major constellations visible from a given latitude.',
      'Understand that the night sky appears to rotate due to Earth\u2019s own rotation.',
      'Explain why different constellations are visible in different seasons.',
      'Compare star brightness using apparent magnitude, where lower numbers mean brighter stars.'
    ],
    background:'As Earth rotates on its axis, the entire sky appears to wheel around a fixed point — the celestial pole — once every 23 hours 56 minutes (a sidereal day). Over the course of a year, Earth\u2019s orbit around the Sun also shifts which constellations are visible at night, since we look toward a different part of the sky each season. This simulator projects the sky the way a planisphere does: the celestial pole at the centre, with declination as distance from centre and right ascension as angle around it.',
    applications:[
      'Sailors and desert travellers have used star patterns for navigation for thousands of years.',
      'Astronomers use right ascension and declination — the same coordinates used here — to catalogue and locate every object in the sky.',
      'Constellations still help astronomers describe the general direction of a celestial event, such as a supernova or comet.'
    ],
    facts:[
      'Only 88 constellations are officially recognised by the International Astronomical Union today.',
      'The stars in a constellation are usually unrelated and lie at wildly different distances — they only appear grouped from Earth\u2019s vantage point.',
      'Polaris, the North Star, appears almost motionless because it sits very close to Earth\u2019s rotational axis extended into space.',
      'The Southern Cross (Crux) is so far south it is never visible from most of the Northern Hemisphere.'
    ],
    misconceptions:[
      'Constellations are not physical groupings of stars in space — they are patterns as seen from Earth only.',
      'The sky does not "move" — it is Earth\u2019s own rotation that makes stars appear to wheel overhead.',
      'A star\u2019s twinkle is caused by Earth\u2019s turbulent atmosphere, not by anything happening at the star itself.'
    ],
    controls:[
      {key:'rotation', label:'Sky rotation (sidereal time)', min:0, max:24, step:0.1, value:0, unit:' h', format:v=>v.toFixed(1)},
      {key:'latitude', label:'Observer latitude', min:-70, max:80, step:1, value:30, unit:'°'},
      {key:'showLines', label:'Constellation lines', type:'toggle-group', value:'on', options:[{label:'On',value:'on'},{label:'Off',value:'off'}]},
      {key:'showNames', label:'Labels', type:'toggle-group', value:'on', options:[{label:'On',value:'on'},{label:'Off',value:'off'}]},
    ],
    quiz:[
      {q:'Why does the night sky appear to rotate over the course of a night?', options:['The stars are physically moving fast','Earth is rotating on its axis','The Moon pulls the stars','Clouds move across them'], correct:1, explain:'Earth\u2019s own rotation makes the sky appear to wheel around the celestial pole once per sidereal day.'},
      {q:'A star with magnitude 1 compared to a star with magnitude 5 is…', options:['Fainter','The same brightness','Brighter','Farther away'], correct:2, explain:'In the magnitude scale, lower (or more negative) numbers indicate brighter objects.'},
      {q:'Why can the Southern Cross not be seen from most northern latitudes?', options:['It doesn\u2019t exist','It is below the horizon there','It only appears in summer','It is too faint'], correct:1, explain:'Crux lies far enough south in declination that it never rises above the horizon for most Northern Hemisphere observers.'},
    ],
    dataColumns:['Sidereal time (h)','Latitude','Visible constellations'],
    logEvery:20,

    setup(engine){ engine.state.selected = null; engine.state._proj = []; 
      engine.canvas.addEventListener('click', (e)=>{
        const rect = engine.canvas.getBoundingClientRect();
        const mx=e.clientX-rect.left, my=e.clientY-rect.top;
        let best=null, bd=999;
        engine.state._proj.forEach(p=>{ const d=Math.hypot(p.x-mx,p.y-my); if(d<10 && d<bd){bd=d;best=p;} });
        engine.state.selected = best;
      });
    },
    reset(engine){ engine.state.selected=null; },
    update(engine,dt){},

    draw(engine){
      const {ctx, cssW:w, cssH:h, state} = engine;
      ctx.fillStyle = '#03040a'; ctx.fillRect(0,0,w,h);
      const cx=w/2, cy=h/2, R=Math.min(w,h)/2-16;
      const lat = state.latitude;
      const horizonDec = -(90-Math.abs(lat)); // most southerly visible declination (north observer)
      const flip = lat<0 ? -1 : 1;
      const scale = R/(90-horizonDec);
      const rotOffsetDeg = (state.rotation||0)*15;

      // horizon circle
      ctx.strokeStyle='rgba(148,163,184,.25)'; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();
      // declination rings
      for(let d=30; d>horizonDec; d-=30){
        const rr = (90-d)*scale;
        ctx.strokeStyle='rgba(148,163,184,.12)'; ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2); ctx.stroke();
      }
      // background field stars
      if(!state._field) state._field = Array.from({length:220},()=>({ra:Math.random()*360, dec: horizonDec+Math.random()*(90-horizonDec), r:Math.random()*1+0.3, a:Math.random()*0.5+0.2}));
      ctx.save();
      state._field.forEach(s=>{
        const rr=(90-s.dec)*scale; if(rr>R) return;
        const ang=((s.ra+rotOffsetDeg)*flip)*Math.PI/180;
        const x=cx+Math.cos(ang)*rr, y=cy+Math.sin(ang)*rr;
        ctx.globalAlpha=s.a; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x,y,s.r,0,Math.PI*2); ctx.fill();
      });
      ctx.restore();

      const proj = [];
      const visibleNames = [];
      CONSTELLATIONS.forEach(c=>{
        const pts = c.stars.map(s=>{
          const rr=(90-s.dec)*scale;
          const ang=((s.ra+rotOffsetDeg)*flip)*Math.PI/180;
          return {x:cx+Math.cos(ang)*rr, y:cy+Math.sin(ang)*rr, visible: s.dec>=horizonDec, s};
        });
        const anyVisible = pts.some(p=>p.visible);
        if(!anyVisible) return;
        visibleNames.push(c.name);
        if(state.showLines!=='off'){
          ctx.strokeStyle='rgba(34,211,238,.35)'; ctx.lineWidth=1;
          c.lines.forEach(([i,j])=>{
            if(pts[i].visible && pts[j].visible){
              ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
            }
          });
        }
        pts.forEach(p=>{
          if(!p.visible) return;
          const r = Math.max(1.2, 4.2-p.s.mag*0.9);
          ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
          ctx.fillStyle = state.selected && state.selected.s===p.s ? '#22d3ee' : '#f8fafc';
          ctx.fill();
          proj.push({x:p.x,y:p.y,s:p.s,c:c.name});
        });
        if(state.showNames!=='off'){
          const cxp = pts.filter(p=>p.visible).reduce((a,p)=>a+p.x,0)/pts.filter(p=>p.visible).length;
          const cyp = pts.filter(p=>p.visible).reduce((a,p)=>a+p.y,0)/pts.filter(p=>p.visible).length;
          Draw.label(ctx, c.name, cxp, cyp-14, 'rgba(226,232,240,.85)', 11);
        }
      });
      state._proj = proj;
      state._visibleNames = visibleNames;

      // center pole marker
      Draw.label(ctx, lat>=0?'North Celestial Pole':'South Celestial Pole', cx, cy-6, '#fbbf24', 9.5);

      if(state.selected){
        const s = state.selected.s;
        ctx.fillStyle='rgba(11,17,48,.85)'; ctx.fillRect(10,10,190,50);
        Draw.label(ctx, s.n+' (mag '+s.mag+')', 105, 32, '#22d3ee', 12);
        Draw.label(ctx, 'RA '+(s.ra/15).toFixed(1)+'h  Dec '+s.dec.toFixed(1)+'°', 105, 50, '#94a3b8', 10.5);
      }
    },

    stageLeft(engine){ return 'Sidereal time '+ (engine.state.rotation||0).toFixed(1)+'h'; },
    stageRight(engine){ return (engine.state._visibleNames||[]).length+' constellations visible'; },

    readouts(engine){
      return {
        'Latitude': engine.state.latitude+'°',
        'Sidereal time': (engine.state.rotation||0).toFixed(1)+' h',
        'Constellations visible': (engine.state._visibleNames||[]).length,
        'Selected star': engine.state.selected ? engine.state.selected.s.n : '—',
      };
    },
    dataRow(engine){
      return [(engine.state.rotation||0).toFixed(1), engine.state.latitude, (engine.state._visibleNames||[]).join('; ')];
    }
  };
})();
