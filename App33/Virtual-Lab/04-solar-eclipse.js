/* ==========================================================================
   SIM 04 — SOLAR ECLIPSE SIMULATOR
   Real tangent-line umbra/penumbra/antumbra geometry (2D cross-section).
   Distances are compressed for display; the size-ratio math is physical.
   ========================================================================== */
(function(){
  const SUN_ANGULAR = 0.2666;   // Sun's average apparent angular radius (deg) - fixed reference
  const MOON_RADIUS_KM = 1737.4;

  function computeGeometry(engine){
    const {cssW:w, cssH:h, state} = engine;
    const cy = h*0.52;
    const sunX = w*0.1, sunR = Math.min(w,h)*0.16;
    const earthX = w*0.9, earthR = Math.min(w,h)*0.085;
    const moonX = w*0.52;
    const moonDistKm = state.moonDistance;
    const moonAngular = (MOON_RADIUS_KM/moonDistKm) / (696000/149600000) * SUN_ANGULAR; // deg, ratio-scaled
    const sizeRatio = moonAngular/SUN_ANGULAR;
    const moonR = sunR*sizeRatio*0.62; // *0.62 purely a display compression so both fit the compressed stage
    const moonY = cy + state.moonOffset*(earthR*0.9);

    const SunTop = {x:sunX, y:cy-sunR}, SunBot = {x:sunX, y:cy+sunR};
    const MoonTop = {x:moonX, y:moonY-moonR}, MoonBot = {x:moonX, y:moonY+moonR};

    function yAt(P, Q, x){ return P.y + (Q.y-P.y)/(Q.x-P.x)*(x-Q.x); }
    const yA = yAt(SunTop, MoonBot, earthX); // umbra edge 1 (crossing)
    const yB = yAt(SunBot, MoonTop, earthX); // umbra edge 2 (crossing)
    const yC = yAt(SunTop, MoonTop, earthX); // penumbra outer upper
    const yD = yAt(SunBot, MoonBot, earthX); // penumbra outer lower

    const umbraCrossed = yA > yB; // apex already passed -> antumbra/annular region
    const umbraTop = Math.min(yA,yB), umbraBot = Math.max(yA,yB);

    const obsRad = state.observerLat*Math.PI/180;
    const obsX = earthX - earthR*Math.cos(obsRad);
    const obsY = cy + earthR*Math.sin(obsRad);

    let eclipseType = 'No eclipse';
    if(obsY>=umbraTop && obsY<=umbraBot) eclipseType = umbraCrossed ? 'Annular eclipse' : 'Total eclipse';
    else if(obsY>=yC && obsY<=yD) eclipseType = 'Partial eclipse';

    return {sunX,sunR,earthX,earthR,moonX,moonY,moonR,cy,SunTop,SunBot,MoonTop,MoonBot,yA,yB,yC,yD,umbraCrossed,umbraTop,umbraBot,obsX,obsY,eclipseType,sizeRatio,moonAngular};
  }

  SimModules['solar-eclipse'] = {
    category:'Eclipses & Shadows',
    tagline:'Align Sun, Moon and Earth and discover why some eclipses are total and others annular.',
    formula:'Eclipse type depends on the Moon’s apparent angular size vs the Sun’s (≈ 0.5° each) at the moment of alignment — Moon nearer → total, Moon farther → annular.',
    aspect:0.58,
    objectives:[
      'Explain why a solar eclipse can only occur at New Moon.',
      'Distinguish the umbra, penumbra, and antumbra regions of the Moon\u2019s shadow.',
      'Understand why the Moon\u2019s varying distance determines total vs. annular eclipses.',
      'Recognise that only observers within the narrow shadow path see a total/annular eclipse.'
    ],
    background:'A solar eclipse happens when the Moon passes directly between the Sun and Earth, casting its shadow onto Earth\u2019s surface. Because the Moon\u2019s orbit is tilted about 5° to Earth\u2019s orbital plane, this alignment only happens a few times a year, not every month. The shadow has three parts: the dark umbra (total eclipse), the lighter penumbra (partial eclipse), and — when the Moon is far enough away that its shadow cone converges before reaching Earth — the antumbra, which produces a striking "ring of fire" annular eclipse.',
    applications:[
      'Eclipse predictions rely on precisely modelled orbital mechanics, planned decades in advance.',
      'Total eclipses briefly reveal the Sun\u2019s corona, letting scientists study it without a coronagraph.',
      'The 1919 solar eclipse provided one of the first experimental confirmations of Einstein\u2019s general relativity.'
    ],
    facts:[
      'The Moon\u2019s and Sun\u2019s apparent sizes in our sky are almost identical purely by coincidence — no other planet\u2019s moon produces such a precise fit.',
      'A total solar eclipse\u2019s path of totality is rarely wider than about 260 km.',
      'The Moon is slowly moving away from Earth (~3.8 cm/year); in the far future, total solar eclipses will no longer be possible.',
      'Ancient astronomers in many cultures could already predict eclipses using long-term cycles such as the 18-year Saros cycle.'
    ],
    misconceptions:[
      'It is never safe to look directly at any solar eclipse phase without certified eclipse glasses — "partial" does not mean "safe."',
      'A solar eclipse is not visible from the whole Earth at once — only a narrow track experiences totality or annularity.',
      'The Moon does not turn dark during a solar eclipse — it simply blocks the Sun as seen from certain locations on Earth.'
    ],
    controls:[
      {key:'moonOffset', label:'Alignment offset', min:-3, max:3, step:0.05, value:0, format:v=>v.toFixed(2)},
      {key:'moonDistance', label:'Moon distance from Earth', min:356500, max:406700, step:500, value:384400, unit:' km'},
      {key:'observerLat', label:'Observer position on Earth', min:-90, max:90, step:1, value:0, unit:'°'},
    ],
    quiz:[
      {q:'A solar eclipse can only happen during which Moon phase?', options:['Full Moon','First Quarter','New Moon','Last Quarter'], correct:2, explain:'Only at New Moon does the Moon pass between the Sun and Earth, making an eclipse geometrically possible.'},
      {q:'An annular ("ring of fire") eclipse happens when…', options:['The Moon is unusually close to Earth','The Moon is far enough that its shadow tip doesn\u2019t reach Earth','Earth is closest to the Sun','The Moon is full'], correct:1, explain:'When the Moon is near apogee (farthest point), its shadow cone converges to a point before reaching Earth, so observers see a ring of sunlight around the Moon.'},
      {q:'Which region of shadow produces a total eclipse?', options:['Penumbra','Antumbra','Umbra','Corona'], correct:2, explain:'The umbra is the fully dark inner shadow — only observers inside it see a total eclipse.'},
    ],
    dataColumns:['t (s)','Offset','Moon distance (km)','Observer eclipse type'],
    logEvery:30,

    setup(engine){},
    reset(engine){},
    update(engine, dt){},

    draw(engine){
      const {ctx, cssW:w, cssH:h, state} = engine;
      if(!state._stars) state._stars = Draw.makeStars(w,h,90);
      Draw.space(ctx,w,h,state._stars);
      const g = computeGeometry(engine);
      state._geo = g;

      // penumbra cone (behind)
      ctx.beginPath();
      ctx.moveTo(g.MoonTop.x, g.MoonTop.y);
      ctx.lineTo(g.earthX, g.yC);
      ctx.lineTo(g.earthX, g.yD);
      ctx.lineTo(g.MoonBot.x, g.MoonBot.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(148,163,184,.16)';
      ctx.fill();

      // umbra / antumbra cone (front, darker)
      ctx.beginPath();
      ctx.moveTo(g.MoonBot.x, g.MoonBot.y);
      ctx.lineTo(g.earthX, g.yA);
      ctx.lineTo(g.earthX, g.yB);
      ctx.lineTo(g.MoonTop.x, g.MoonTop.y);
      ctx.closePath();
      ctx.fillStyle = g.umbraCrossed ? 'rgba(251,191,36,.14)' : 'rgba(5,7,15,.75)';
      ctx.fill();

      // Sun
      Draw.glowBody(ctx, g.sunX, g.cy, g.sunR, '#fff7d6', '#fbbf24', 1.6);
      Draw.label(ctx,'Sun', g.sunX, g.cy+g.sunR+18, '#fbbf24', 12);

      // Earth
      Draw.glowBody(ctx, g.earthX, g.cy, g.earthR, '#bfdbfe', '#2563eb', 1.15);
      Draw.label(ctx,'Earth', g.earthX, g.cy+g.earthR+18, '#93c5fd', 12);

      // Moon (dark disc, since we see its shadowed side)
      ctx.beginPath(); ctx.arc(g.moonX, g.moonY, g.moonR, 0, Math.PI*2);
      ctx.fillStyle = '#0f1424'; ctx.fill();
      ctx.strokeStyle='rgba(203,213,225,.5)'; ctx.lineWidth=1; ctx.stroke();
      Draw.label(ctx,'Moon', g.moonX, g.moonY-g.moonR-10, '#cbd5e1', 12);

      // observer marker
      ctx.beginPath(); ctx.arc(g.obsX, g.obsY, 4, 0, Math.PI*2);
      ctx.fillStyle = g.eclipseType==='No eclipse' ? '#94a3b8' : '#22d3ee';
      ctx.fill();
      Draw.label(ctx, 'Observer', g.obsX, g.obsY-10, '#e2e8f0', 10, 'center');
      Draw.label(ctx, g.eclipseType, g.obsX, g.obsY+22, g.eclipseType==='No eclipse'?'#94a3b8':'#22d3ee', 11.5);
    },

    stageLeft(engine){ return engine.state._geo ? engine.state._geo.eclipseType : ''; },
    stageRight(engine){ return 'Size ratio '+ (engine.state._geo?engine.state._geo.sizeRatio.toFixed(3):''); },

    readouts(engine){
      const g = engine.state._geo || computeGeometry(engine);
      return {
        'Eclipse at observer': g.eclipseType,
        'Moon distance': Math.round(engine.state.moonDistance).toLocaleString()+' km',
        'Moon / Sun apparent size': g.sizeRatio.toFixed(3)+'×',
        'Alignment offset': engine.state.moonOffset.toFixed(2),
        'Observer latitude-analogue': engine.state.observerLat+'°',
        'Shadow geometry': g.umbraCrossed ? 'Antumbra (diverging)' : 'Umbra (converging)',
      };
    },
    dataRow(engine){
      const g = engine.state._geo || computeGeometry(engine);
      return [engine.t.toFixed(1), engine.state.moonOffset.toFixed(2), Math.round(engine.state.moonDistance), g.eclipseType];
    }
  };
})();
