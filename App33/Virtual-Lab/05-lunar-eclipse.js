/* ==========================================================================
   SIM 05 — LUNAR ECLIPSE SIMULATOR
   The Moon sweeps back and forth through Earth's real umbra/penumbra cone.
   ========================================================================== */
(function(){
  function computeGeometry(engine){
    const {cssW:w, cssH:h, state} = engine;
    const cy = h*0.52;
    const sunX = -w*0.15, sunR = Math.min(w,h)*0.5;
    const earthX = w*0.4, earthR = Math.min(w,h)*0.14;
    const moonPlaneX = w*0.86;

    const SunTop={x:sunX,y:cy-sunR}, SunBot={x:sunX,y:cy+sunR};
    const EarthTop={x:earthX,y:cy-earthR}, EarthBot={x:earthX,y:cy+earthR};
    function yAt(P,Q,x){ return P.y + (Q.y-P.y)/(Q.x-P.x)*(x-Q.x); }
    const yA = yAt(SunTop, EarthBot, moonPlaneX);
    const yB = yAt(SunBot, EarthTop, moonPlaneX);
    const yC = yAt(SunTop, EarthTop, moonPlaneX);
    const yD = yAt(SunBot, EarthBot, moonPlaneX);
    const umbraTop = Math.min(yA,yB), umbraBot = Math.max(yA,yB);
    const penTop = Math.min(yC,yD), penBot = Math.max(yC,yD);

    const moonR = earthR*0.273;
    const amp = Math.min(w,h)*0.16;
    const speedFac = 0.35;
    const moonX = moonPlaneX + Math.sin(engine.t*speedFac)*amp;
    const moonY = cy + state.pathOffset*earthR*0.55;

    const topEdge = moonY-moonR, botEdge = moonY+moonR;
    let type = 'No eclipse';
    const inUmbra = topEdge < umbraBot && botEdge > umbraTop;
    const fullyUmbra = topEdge>=umbraTop && botEdge<=umbraBot;
    const inPen = topEdge < penBot && botEdge > penTop;
    if(fullyUmbra) type = 'Total lunar eclipse';
    else if(inUmbra) type = 'Partial lunar eclipse';
    else if(inPen) type = 'Penumbral lunar eclipse';

    // fraction of moon disc inside umbra (for illumination shading)
    const overlap = Math.max(0, Math.min(botEdge,umbraBot) - Math.max(topEdge,umbraTop));
    const umbraFrac = Math.min(1, overlap/(2*moonR));

    return {sunX,sunR,earthX,earthR,moonPlaneX,moonX,moonY,moonR,cy,umbraTop,umbraBot,penTop,penBot,type,umbraFrac,EarthTop,EarthBot,SunTop,SunBot};
  }

  SimModules['lunar-eclipse'] = {
    category:'Eclipses & Shadows',
    tagline:'Send the Moon through Earth\u2019s umbra and penumbra to explore lunar eclipse types.',
    formula:'Earth’s umbra angular radius at the Moon’s distance ≈ tan⁻¹(R_earth/d) — the Moon’s path through this cone sets penumbral / partial / total.',
    aspect:0.58,
    objectives:[
      'Explain why a lunar eclipse can only occur at Full Moon.',
      'Distinguish penumbral, partial, and total lunar eclipses by how deeply the Moon enters Earth\u2019s shadow.',
      'Understand that Earth\u2019s shadow is large enough for total lunar eclipses to last over an hour.',
      'Compare the geometry of lunar eclipses with solar eclipses.'
    ],
    background:'A lunar eclipse occurs when Earth passes directly between the Sun and the Moon, casting its shadow onto the Moon\u2019s surface. Because Earth is much larger than the Moon, its umbra at the Moon\u2019s distance is wide enough that total lunar eclipses can last well over an hour — far longer than the few minutes of totality possible during a solar eclipse. Unlike solar eclipses, a lunar eclipse is visible from the entire night-side of Earth simultaneously, since everyone sees the same shadowed Moon.',
    applications:[
      'Historical astronomers such as Aristotle used the curved shape of Earth\u2019s shadow on the Moon as early evidence that Earth is round.',
      'Lunar eclipses let scientists study Earth\u2019s atmosphere indirectly, since sunlight filtering through it colours the eclipsed Moon red ("Blood Moon").',
      'Eclipse timing calculations feed into the same orbital models used for spacecraft navigation.'
    ],
    facts:[
      'The reddish "Blood Moon" colour comes from sunlight bent through Earth\u2019s atmosphere — the same effect that colours sunsets red.',
      'Unlike solar eclipses, lunar eclipses are completely safe to view with the naked eye.',
      'A single calendar year can have up to three lunar eclipses, though not all are total.',
      'Because Earth\u2019s shadow is roughly 2.6 times wider than the Moon, purely penumbral eclipses (no umbral contact at all) are common and often barely noticeable.'
    ],
    misconceptions:[
      'The Moon does not disappear during a total lunar eclipse — it usually remains visible, glowing a dim coppery red rather than turning fully black.',
      'A lunar eclipse does not happen every month because the Moon\u2019s orbit is tilted about 5° relative to Earth\u2019s orbital plane around the Sun.',
      'A "Blood Moon" is not a sign of anything supernatural — it is a well-understood optical effect of Earth\u2019s atmosphere.'
    ],
    controls:[
      {key:'pathOffset', label:'Orbital path offset', min:-2.4, max:2.4, step:0.05, value:0, format:v=>v.toFixed(2)},
    ],
    quiz:[
      {q:'A lunar eclipse can only occur during which phase?', options:['New Moon','First Quarter','Full Moon','Last Quarter'], correct:2, explain:'Only at Full Moon is the Moon positioned opposite the Sun, allowing it to pass through Earth\u2019s shadow.'},
      {q:'Why does the eclipsed Moon often look reddish?', options:['Moon dust is red','Sunlight bent through Earth\u2019s atmosphere reaches it','It reflects Mars','The Sun turns red'], correct:1, explain:'Earth\u2019s atmosphere bends (refracts) red-orange sunlight into its shadow, giving the "Blood Moon" its colour — the same reason sunsets are red.'},
      {q:'Compared to solar eclipses, total lunar eclipses are typically…', options:['Shorter','About the same length','Much longer, often over an hour','Impossible to see'], correct:2, explain:'Earth\u2019s umbra is much wider than the Moon at that distance, so totality can last well over an hour, versus just minutes for a solar eclipse.'},
    ],
    dataColumns:['t (s)','Path offset','Eclipse type','Umbra overlap %'],
    logEvery:25,
    graphLabel:'Umbra overlap % vs time',

    setup(engine){},
    reset(engine){},
    update(engine, dt){},

    draw(engine){
      const {ctx, cssW:w, cssH:h, state} = engine;
      if(!state._stars) state._stars = Draw.makeStars(w,h,90);
      Draw.space(ctx,w,h,state._stars);
      const g = computeGeometry(engine);
      state._geo = g;

      // penumbra cone
      ctx.beginPath();
      ctx.moveTo(g.EarthTop.x, g.EarthTop.y);
      ctx.lineTo(g.moonPlaneX+40, g.penTop);
      ctx.lineTo(g.moonPlaneX+40, g.penBot);
      ctx.lineTo(g.EarthBot.x, g.EarthBot.y);
      ctx.closePath();
      ctx.fillStyle='rgba(148,163,184,.14)'; ctx.fill();

      // umbra cone
      ctx.beginPath();
      ctx.moveTo(g.EarthBot.x, g.EarthBot.y);
      ctx.lineTo(g.moonPlaneX+40, g.umbraTop);
      ctx.lineTo(g.moonPlaneX+40, g.umbraBot);
      ctx.lineTo(g.EarthTop.x, g.EarthTop.y);
      ctx.closePath();
      ctx.fillStyle='rgba(5,7,15,.8)'; ctx.fill();

      // Sun glow hint at edge
      const sg = ctx.createRadialGradient(0,g.cy,10,0,g.cy,g.sunR);
      sg.addColorStop(0,'rgba(251,191,36,.5)'); sg.addColorStop(1,'rgba(251,191,36,0)');
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(0,g.cy,g.sunR,0,Math.PI*2); ctx.fill();
      Draw.label(ctx,'☀ Sunlight direction →', 14, 22, '#fbbf24', 11, 'left');

      // Earth
      Draw.glowBody(ctx, g.earthX, g.cy, g.earthR, '#bfdbfe', '#2563eb', 1.2);
      Draw.label(ctx,'Earth', g.earthX, g.cy+g.earthR+18, '#93c5fd', 12);

      // Moon
      const litColor = g.umbraFrac>0.99 ? '#7c3a3a' : '#e2e8f0';
      Draw.glowBody(ctx, g.moonX, g.moonY, g.moonR, '#f8fafc', litColor, g.umbraFrac>0.3?0:1.1);
      if(g.umbraFrac>0){
        ctx.save(); ctx.globalAlpha = Math.min(0.85,g.umbraFrac);
        ctx.beginPath(); ctx.arc(g.moonX,g.moonY,g.moonR,0,Math.PI*2); ctx.fillStyle='#5b2323'; ctx.fill();
        ctx.restore();
      }
      Draw.label(ctx,'Moon', g.moonX, g.moonY-g.moonR-10, '#cbd5e1', 12);
      Draw.label(ctx, g.type, g.moonX, g.moonY+g.moonR+20, g.umbraFrac>0?'#f87171':'#94a3b8', 11.5);
    },

    stageLeft(engine){ return engine.state._geo ? engine.state._geo.type : ''; },
    stageRight(engine){ return engine.state._geo ? 'Umbra overlap '+Math.round(engine.state._geo.umbraFrac*100)+'%' : ''; },

    readouts(engine){
      const g = engine.state._geo || computeGeometry(engine);
      return {
        'Eclipse type': g.type,
        'Umbra overlap': Math.round(g.umbraFrac*100)+'%',
        'Path offset': engine.state.pathOffset.toFixed(2),
        'Earth shadow width (rel.)': (g.umbraBot-g.umbraTop>0 ? ((g.umbraBot-g.umbraTop)/(2*g.moonR)).toFixed(1)+'× Moon' : '—'),
      };
    },
    dataRow(engine){
      const g = engine.state._geo || computeGeometry(engine);
      return [engine.t.toFixed(1), engine.state.pathOffset.toFixed(2), g.type, Math.round(g.umbraFrac*100)];
    },
    graphValue(row){ return {x:Number(row[0]), y:Number(row[3])}; }
  };
})();
