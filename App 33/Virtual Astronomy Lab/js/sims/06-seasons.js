/* ==========================================================================
   SIM 06 — SEASONS ON EARTH LABORATORY
   ========================================================================== */
(function(){
  function declination(tiltDeg, dayOfYear){
    // day 0 = vernal equinox (~Mar 21). Standard sinusoidal approximation.
    return tiltDeg * Math.sin(2*Math.PI*(dayOfYear)/365.25);
  }
  function dayLengthHours(latDeg, decDeg){
    const lat = latDeg*Math.PI/180, dec = decDeg*Math.PI/180;
    const cosH0 = -Math.tan(lat)*Math.tan(dec);
    if(cosH0 <= -1) return 24;
    if(cosH0 >= 1) return 0;
    return (24/Math.PI)*Math.acos(cosH0);
  }
  function solarNoonElevation(latDeg, decDeg){
    return Math.max(0, 90 - Math.abs(latDeg-decDeg));
  }
  function seasonName(dayOfYear, isNorth){
    let d = ((dayOfYear%365.25)+365.25)%365.25;
    if(!isNorth) d = (d+182.625)%365.25;
    if(d<91.3) return 'Spring';
    if(d<182.6) return 'Summer';
    if(d<273.9) return 'Autumn';
    return 'Winter';
  }

  SimModules['seasons'] = {
    category:'Earth Science',
    tagline:'Tilt Earth\u2019s axis and watch how day length and sunlight angle drive the seasons.',
    formula:'Solar elevation at noon ≈ 90° − |latitude − declination|, where declination varies with axial tilt × sin(orbital angle).',
    aspect:0.62,
    objectives:[
      'Explain that seasons are caused by Earth\u2019s axial tilt, not by changing distance from the Sun.',
      'Predict day length and season for any latitude and time of year.',
      'Identify the solstices and equinoxes on Earth\u2019s orbit.',
      'Compare seasonal experience between the Northern and Southern Hemispheres.'
    ],
    background:'Earth\u2019s rotation axis is tilted about 23.4° relative to its orbital plane, and this tilt keeps pointing in the same direction in space as Earth orbits the Sun. As a result, each hemisphere leans toward the Sun for part of the year (summer: longer days, higher sun angle, more concentrated sunlight) and away from it for the other part (winter: shorter days, lower sun angle, more spread-out sunlight). Earth is actually slightly closer to the Sun in January than in July — proving that distance is not what drives the seasons.',
    applications:[
      'Agricultural calendars and crop planning are built around predictable seasonal day-length and sunlight-angle changes.',
      'Solar panel installers angle panels based on latitude and season to maximise year-round energy capture.',
      'Understanding axial tilt helps astronomers predict seasons on other planets, such as Mars\u2019 25° tilt.'
    ],
    facts:[
      'Earth is closest to the Sun (perihelion) in early January — during Northern Hemisphere winter.',
      'At the poles, "day" and "night" each last about six continuous months.',
      'Uranus has an extreme 98° axial tilt, essentially rolling on its side as it orbits the Sun.',
      'The word "solstice" comes from Latin for "Sun stands still," describing the Sun\u2019s pause in its northward or southward drift on that day.'
    ],
    misconceptions:[
      'Summer is not caused by Earth being closer to the Sun — axial tilt, not orbital distance, drives the seasons.',
      'Both hemispheres do not experience the same season at the same time — when it\u2019s summer in the north, it\u2019s winter in the south.',
      'Day length changes gradually, not suddenly — the solstices mark turning points, not the season\u2019s only extreme day.'
    ],
    controls:[
      {key:'tilt', label:'Axial tilt', min:0, max:40, step:0.5, value:23.4, unit:'°'},
      {key:'latitude', label:'Observer latitude (+N / \u2212S)', min:-90, max:90, step:1, value:34, unit:'°'},
      {key:'daysPerSec', label:'Time warp', min:0.5, max:10, step:0.5, value:3, unit:' d/s'},
    ],
    quiz:[
      {q:'What actually causes Earth\u2019s seasons?', options:['Changing distance from the Sun','Earth\u2019s axial tilt','The Moon\u2019s gravity','Solar flares'], correct:1, explain:'Earth\u2019s consistent axial tilt causes each hemisphere to receive more or less direct sunlight at different points in the orbit.'},
      {q:'When it is summer in the Northern Hemisphere, the Southern Hemisphere experiences…', options:['Summer too','Winter','No season change','Only sunrise'], correct:1, explain:'The hemispheres are tilted in opposite senses relative to the Sun at any given time, so their seasons are reversed.'},
      {q:'At the equator (latitude 0°), day length across the year is…', options:['Always exactly 12 hours','24 hours in summer','0 hours in winter','Highly variable'], correct:0, explain:'At the equator, the Sun\u2019s path keeps day and night close to 12 hours year-round, since it is equidistant from both poles.'},
    ],
    dataColumns:['Day of year','Declination (°)','Day length (h)','Season'],
    logEvery:12,
    graphLabel:'Day length (hours) vs day of year',

    setup(engine){},
    reset(engine){},
    update(engine, dt){},

    draw(engine){
      const {ctx, cssW:w, cssH:h, state} = engine;
      if(!state._stars) state._stars = Draw.makeStars(w,h,90);
      Draw.space(ctx,w,h,state._stars);
      const cx=w*0.42, cy=h*0.52, orbR=Math.min(w,h)*0.32;
      const dayOfYear = (engine.t*(state.daysPerSec||3)) % 365.25;
      const angle = 2*Math.PI*dayOfYear/365.25 - Math.PI/2; // start at top = day0 (equinox)

      Draw.orbitPath(ctx, cx, cy, orbR, orbR*0.94, 0, 'rgba(148,163,184,.3)');
      Draw.glowBody(ctx, cx, cy, 16, '#fff7d6', '#fbbf24', 2.2);

      // mark equinox/solstice ticks
      const marks = [{d:0,l:'Vernal Equinox'},{d:91.3,l:'Summer Solstice'},{d:182.6,l:'Autumnal Equinox'},{d:273.9,l:'Winter Solstice'}];
      marks.forEach(m=>{
        const a = 2*Math.PI*m.d/365.25 - Math.PI/2;
        const mx = cx+Math.cos(a)*orbR, my = cy+Math.sin(a)*orbR*0.94;
        ctx.beginPath(); ctx.arc(mx,my,3,0,Math.PI*2); ctx.fillStyle='rgba(148,163,184,.6)'; ctx.fill();
        Draw.label(ctx, m.l, mx, my + (Math.sin(a)>=0?18:-10), '#94a3b8', 9.5);
      });

      const ex = cx+Math.cos(angle)*orbR, ey = cy+Math.sin(angle)*orbR*0.94;
      // Earth body with tilted axis (fixed absolute direction in space)
      Draw.glowBody(ctx, ex, ey, 15, '#bfdbfe', '#2563eb', 1.3);
      const axisAngle = -100*Math.PI/180; // fixed absolute direction (points toward upper-left)
      const tiltLen = 24;
      const dx = Math.cos(axisAngle)*tiltLen*(state.tilt/23.4), dy = Math.sin(axisAngle)*tiltLen*(state.tilt/23.4);
      ctx.strokeStyle='#f87171'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(ex-dx,ey-dy); ctx.lineTo(ex+dx,ey+dy); ctx.stroke();
      Draw.label(ctx,'Earth', ex, ey+34, '#93c5fd', 11);

      // sunlight ray to Earth
      ctx.strokeStyle='rgba(251,191,36,.25)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex,ey); ctx.stroke();

      // mini bar: day length gauge
      const dec = declination(state.tilt, dayOfYear);
      const dl = dayLengthHours(state.latitude, dec);
      const gx = w*0.82, gyBase = h*0.85, gh = h*0.55;
      ctx.fillStyle='rgba(148,163,184,.15)'; ctx.fillRect(gx-16, gyBase-gh, 32, gh);
      const litH = gh*(dl/24);
      ctx.fillStyle = '#fbbf24'; ctx.fillRect(gx-16, gyBase-litH, 32, litH);
      Draw.label(ctx, dl.toFixed(1)+' h', gx, gyBase-gh-10, '#fbbf24', 12);
      Draw.label(ctx, 'daylight at lat '+state.latitude+'°', gx, gyBase+16, '#94a3b8', 9.5);
    },

    stageLeft(engine){
      const day = (engine.t*(engine.state.daysPerSec||3))%365.25;
      return 'Day '+Math.floor(day)+' of 365';
    },
    stageRight(engine){
      const day = (engine.t*(engine.state.daysPerSec||3))%365.25;
      return seasonName(day, engine.state.latitude>=0);
    },

    readouts(engine){
      const day = (engine.t*(engine.state.daysPerSec||3))%365.25;
      const dec = declination(engine.state.tilt, day);
      const dl = dayLengthHours(engine.state.latitude, dec);
      const elev = solarNoonElevation(engine.state.latitude, dec);
      return {
        'Day of year': Math.floor(day),
        'Solar declination': dec.toFixed(1)+'°',
        'Day length': dl.toFixed(1)+' h',
        'Solar noon elevation': elev.toFixed(0)+'°',
        'Season': seasonName(day, engine.state.latitude>=0),
        'Hemisphere': engine.state.latitude>=0 ? 'Northern' : 'Southern',
      };
    },
    dataRow(engine){
      const day = (engine.t*(engine.state.daysPerSec||3))%365.25;
      const dec = declination(engine.state.tilt, day);
      const dl = dayLengthHours(engine.state.latitude, dec);
      return [Math.floor(day), dec.toFixed(1), dl.toFixed(1), seasonName(day, engine.state.latitude>=0)];
    },
    graphValue(row){ return {x:Number(row[0]), y:Number(row[2])}; }
  };
})();
