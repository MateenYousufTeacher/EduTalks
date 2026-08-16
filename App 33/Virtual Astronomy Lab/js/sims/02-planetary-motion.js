/* ==========================================================================
   SIM 02 — PLANETARY MOTION LABORATORY
   Real two-body Kepler orbit: user sets semi-major axis, eccentricity and
   central (star) mass; the engine solves Kepler's equation each frame.
   ========================================================================== */
(function(){
  function solveKepler(M, e){
    let E = M;
    for(let i=0;i<8;i++){ E = E - (E - e*Math.sin(E) - M)/(1 - e*Math.cos(E)); }
    return E;
  }

  SimModules['planetary-motion'] = {
    category:'Celestial Mechanics',
    tagline:'Sculpt an orbit\u2019s shape and speed, and watch Kepler\u2019s three laws emerge.',
    formula:'v = √[GM(2/r − 1/a)] (vis-viva equation) — instantaneous orbital speed depends on current distance r and semi-major axis a.',
    aspect:0.62,
    objectives:[
      'Manipulate orbital radius (semi-major axis) and eccentricity to shape an orbit.',
      'Observe that a planet moves fastest at perihelion and slowest at aphelion (Kepler\u2019s Second Law).',
      'Verify that equal areas are swept in equal times, regardless of orbital position.',
      'Discover the relationship between orbital period and distance (Kepler\u2019s Third Law: T\u00b2 \u221d a\u00b3).'
    ],
    background:'In the early 1600s, Johannes Kepler analysed decades of observational data to discover that planets do not move in perfect circles, as long believed, but in ellipses with the Sun at one focus. He found that a planet sweeps out equal areas in equal times — moving fastest when nearest the Sun (perihelion) and slowest when farthest (aphelion) — and that the square of a planet\u2019s orbital period is proportional to the cube of its average distance from the Sun. These three laws, derived purely from data, later provided the observational foundation for Newton\u2019s law of universal gravitation.',
    applications:[
      'Kepler\u2019s laws are used to calculate spacecraft transfer orbits, such as the Hohmann transfer used for interplanetary missions.',
      'Astronomers use the same equations to determine the mass of stars hosting exoplanets from orbital period and distance.',
      'Satellite orbit designers rely on these principles to choose orbital altitude for a desired period.'
    ],
    facts:[
      'Earth moves about 3 km/s faster in January (near perihelion) than in July (near aphelion).',
      'Kepler discovered his laws using Tycho Brahe\u2019s naked-eye observations — decades before the telescope\u2019s use in astronomy.',
      'Halley\u2019s Comet has an eccentricity of about 0.967, making its orbit extremely elongated.',
      'Kepler\u2019s Third Law, when combined with Newton\u2019s gravity, lets astronomers "weigh" distant stars.'
    ],
    misconceptions:[
      'An elliptical orbit does not mean the planet speeds up and slows down randomly — its speed changes in a precise, predictable way governed by the equal-area law.',
      'Most planetary orbits are only slightly elliptical; comets and asteroids show much more elongated orbits.',
      'The Sun sits at one focus of the ellipse, not at its centre.'
    ],
    controls:[
      {key:'a', label:'Semi-major axis (a)', min:0.4, max:5, step:0.1, value:1.5, unit:' AU', format:v=>v.toFixed(1)},
      {key:'e', label:'Eccentricity (e)', min:0, max:0.85, step:0.01, value:0.35, format:v=>v.toFixed(2)},
      {key:'mass', label:'Central star mass', min:0.3, max:3, step:0.1, value:1, unit:' M☉', format:v=>v.toFixed(1)},
      {key:'showCircle', label:'Reference circle', type:'toggle-group', value:'off', options:[{label:'Show',value:'on'},{label:'Hide',value:'off'}]},
    ],
    quiz:[
      {q:'At which point does a planet move fastest?', options:['Aphelion','Perihelion','It moves at constant speed','Midway between the two'], correct:1, explain:'Perihelion — the closest point to the Sun — is where orbital speed is greatest, as required by the equal-area law.'},
      {q:'If eccentricity is 0, the orbit is a…', options:['Parabola','Straight line','Perfect circle','Hyperbola'], correct:2, explain:'An eccentricity of exactly 0 describes a perfect circle; real planetary orbits have small but non-zero eccentricities.'},
      {q:'Kepler\u2019s Third Law relates orbital period to…', options:['Planet colour','Semi-major axis (distance)','Number of moons','Axial tilt'], correct:1, explain:'T\u00b2 is proportional to a\u00b3 — farther planets take disproportionately longer to complete an orbit.'},
    ],
    dataColumns:['Time (yr)','True anomaly (°)','Distance r (AU)','Speed (AU/yr)'],
    logEvery:12,
    graphLabel:'Orbital speed vs time (AU/yr)',

    setup(engine){ engine.state.trail = []; engine.state.M0 = 0; },
    reset(engine){ engine.state.trail = []; },

    _period(engine){
      const a = engine.state.a, M = engine.state.mass;
      return Math.sqrt((a*a*a)/M); // years, GM_sun units where T(yr)^2 = a(AU)^3 / M(Msun)
    },
    _current(engine){
      const T = this._period(engine);
      const a = engine.state.a, e = engine.state.e, M = engine.state.mass;
      const Mano = ((engine.t*0.35) / T) * 2*Math.PI; // 0.35 = year-scale factor for pleasant speed
      const E = solveKepler(Mano % (2*Math.PI), e);
      const x = a*(Math.cos(E)-e);
      const y = a*Math.sqrt(1-e*e)*Math.sin(E);
      const r = a*(1-e*Math.cos(E));
      const v = Math.sqrt(4*Math.PI*Math.PI*M*(2/r - 1/a)); // AU/yr
      const trueAnomaly = Math.atan2(Math.sqrt(1-e*e)*Math.sin(E), Math.cos(E)-e);
      return {x,y,r,v,T,E,trueAnomaly, tYears: engine.t*0.35};
    },

    update(engine, dt){
      const c = this._current(engine);
      engine.state.trail.push({x:c.x,y:c.y,t:c.tYears});
      const windowYears = c.T/50;
      engine.state.trail = engine.state.trail.filter(p=>c.tYears-p.t < windowYears);
    },

    draw(engine){
      const {ctx, cssW:w, cssH:h, state} = engine;
      if(!state._stars) state._stars = Draw.makeStars(w,h,90);
      Draw.space(ctx,w,h,state._stars);
      const cx=w/2, cy=h/2;
      const scale = (Math.min(w,h)/2 - 30) / 5; // 5 AU max fits stage
      const a = state.a, e = state.e;
      const c = this._current(engine);

      // ellipse orbit path (focus at origin => center offset by -a*e)
      ctx.save();
      ctx.translate(cx,cy);
      ctx.strokeStyle='rgba(148,163,184,.35)'; ctx.lineWidth=1.4;
      ctx.beginPath();
      ctx.ellipse(-a*e*scale, 0, a*scale, a*Math.sqrt(1-e*e)*scale, 0, 0, Math.PI*2);
      ctx.stroke();
      if(state.showCircle==='on'){
        ctx.strokeStyle='rgba(52,211,153,.4)'; ctx.setLineDash([4,5]);
        ctx.beginPath(); ctx.arc(0,0,a*scale,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.restore();

      // Sun at focus (origin)
      Draw.glowBody(ctx, cx, cy, 12, '#fff7d6', '#fbbf24', 2.4);

      // swept-area triangle (Kepler's 2nd law visual)
      if(state.trail.length>1){
        ctx.beginPath(); ctx.moveTo(cx,cy);
        state.trail.forEach(p=>ctx.lineTo(cx+p.x*scale, cy+p.y*scale));
        ctx.closePath();
        ctx.fillStyle='rgba(124,58,237,.28)'; ctx.fill();
        ctx.strokeStyle='rgba(168,85,247,.5)'; ctx.lineWidth=1; ctx.stroke();
      }

      // planet
      const px = cx + c.x*scale, py = cy + c.y*scale;
      Draw.glowBody(ctx, px, py, 8, '#dbeafe', '#3b82f6', 1.6);
      Draw.label(ctx, 'Planet', px, py-14, '#cbd5e1', 11);

      // perihelion / aphelion markers
      const periX = cx + (a*(1-e)-a*e)*scale, periY = cy;
      const apheX = cx - (a*(1+e)+a*e)*scale, apheY = cy;
      Draw.label(ctx,'Perihelion', cx + (a*(1-e))*scale - a*e*scale, cy+16, '#34d399', 10);
      Draw.label(ctx,'Aphelion', cx - (a*(1+e))*scale - a*e*scale, cy+16, '#f87171', 10);
    },

    stageLeft(engine){ const c=this._current(engine); return 't = '+c.tYears.toFixed(2)+' yr'; },
    stageRight(engine){ const c=this._current(engine); return 'r = '+c.r.toFixed(2)+' AU'; },

    readouts(engine){
      const c = this._current(engine);
      return {
        'Orbital period (T)': c.T.toFixed(2)+' yr',
        'Current distance (r)': c.r.toFixed(2)+' AU',
        'Current speed': c.v.toFixed(2)+' AU/yr',
        'True anomaly': (c.trueAnomaly*180/Math.PI).toFixed(0)+'°',
        'T² (check)': (c.T*c.T).toFixed(2),
        'a³/M (check)': ((engine.state.a**3)/engine.state.mass).toFixed(2),
      };
    },
    dataRow(engine){
      const c = this._current(engine);
      return [c.tYears.toFixed(2), (c.trueAnomaly*180/Math.PI).toFixed(0), c.r.toFixed(2), c.v.toFixed(2)];
    },
    graphValue(row){ return {x:Number(row[0]), y:Number(row[3])}; }
  };
})();
