/* ==========================================================================
   SIM 03 — MOON PHASES SIMULATOR
   Top-down Sun–Earth–Moon diagram + an "as seen from Earth" inset showing
   the true phase shape via the standard terminator-ellipse construction.
   ========================================================================== */
(function(){
  const SYNODIC_MONTH = 29.53; // days

  function phaseName(theta){
    const t = ((theta%360)+360)%360;
    if(t<11.25 || t>=348.75) return 'New Moon';
    if(t<78.75) return 'Waxing Crescent';
    if(t<101.25) return 'First Quarter';
    if(t<168.75) return 'Waxing Gibbous';
    if(t<191.25) return 'Full Moon';
    if(t<258.75) return 'Waning Gibbous';
    if(t<281.25) return 'Last Quarter';
    return 'Waning Crescent';
  }

  function drawPhaseDisc(ctx, cx, cy, R, k, waxing){
    // dark base
    ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fillStyle='#1c2340'; ctx.fill();
    ctx.strokeStyle='rgba(148,163,184,.4)'; ctx.lineWidth=1; ctx.stroke();
    const side = waxing ? 1 : -1;
    let termRx, termSide;
    if(k<=0.5){ termRx = R*(1-2*k); termSide = side; }
    else { termRx = R*(2*k-1); termSide = -side; }
    const N = 44, pts=[];
    for(let i=0;i<=N;i++){ const y=-R+2*R*i/N; const xo=side*Math.sqrt(Math.max(0,R*R-y*y)); pts.push([cx+xo,cy+y]); }
    for(let i=N;i>=0;i--){ const y=-R+2*R*i/N; const xt=termSide*(termRx)*Math.sqrt(Math.max(0,1-(y*y)/(R*R))); pts.push([cx+xt,cy+y]); }
    ctx.beginPath();
    pts.forEach((p,i)=> i===0?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1]));
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx,cy,R*0.1,cx,cy,R);
    grad.addColorStop(0,'#f8fafc'); grad.addColorStop(1,'#cbd5e1');
    ctx.fillStyle = grad; ctx.fill();
  }

  SimModules['moon-phases'] = {
    category:'Earth–Moon System',
    tagline:'Move the Moon around Earth and watch its phase change, exactly as seen from the ground.',
    formula:'Illumination % ≈ (1 − cosθ)/2 × 100, where θ is the Sun–Moon–Earth phase angle.',
    aspect:0.62,
    objectives:[
      'Relate the Moon\u2019s position relative to the Sun and Earth to its observed phase.',
      'Distinguish waxing from waning phases and name all eight principal phases.',
      'Understand that the Moon is always half-lit by the Sun — only our viewing angle changes.',
      'Connect the ~29.5 day synodic month to the lunar calendar.'
    ],
    background:'The Moon does not produce its own light — it reflects sunlight. At any moment, exactly half of the Moon is illuminated by the Sun, just like Earth. As the Moon orbits Earth roughly every 27.3 days (and the Sun-Earth-Moon angle cycles every 29.5 days, the "synodic month"), we see different fractions of its lit hemisphere from Earth, producing the familiar cycle of phases from New Moon to Full Moon and back.',
    applications:[
      'Lunar calendars, used in many cultures and religious observances, are based directly on the Moon\u2019s phase cycle.',
      'Tides are strongest (spring tides) at New and Full Moon, when the Sun and Moon align.',
      'Astronomers schedule faint deep-sky observations around the New Moon, when the sky is darkest.'
    ],
    facts:[
      'The Moon always shows the same face to Earth because its rotation and orbit are tidally locked.',
      'A "Blue Moon" refers to a second Full Moon within a single calendar month, not an actual colour change.',
      'The lunar day-night cycle (sunrise to sunrise on the Moon) lasts about 29.5 Earth days.',
      'Earthshine — faint light on the Moon\u2019s dark limb — is sunlight reflected off Earth onto the Moon.'
    ],
    misconceptions:[
      'Moon phases are not caused by Earth\u2019s shadow falling on the Moon — that only happens briefly during a lunar eclipse.',
      'The "dark side of the Moon" is a misnomer — every part of the Moon receives sunlight over its rotation; only the far side is unseen from Earth.',
      'Clouds do not cause Moon phases — the shape you see is genuinely how much of the lit half faces Earth.'
    ],
    controls:[
      {key:'auto', label:'Motion', type:'toggle-group', value:'auto', options:[{label:'Auto-orbit',value:'auto'},{label:'Manual drag',value:'manual'}]},
      {key:'moonAngle', label:'Moon position (from New Moon)', min:0, max:360, step:1, value:45, unit:'°'},
      {key:'daysPerSec', label:'Orbit speed', min:0.2, max:8, step:0.1, value:1.5, unit:' d/s'},
    ],
    quiz:[
      {q:'What actually causes the Moon\u2019s phases?', options:['Earth\u2019s shadow covering it','Clouds on the Moon','Our changing viewing angle of its sunlit half','The Moon turning its light on and off'], correct:2, explain:'The Moon is always half-lit by the Sun; phases arise purely from how much of that lit half faces Earth.'},
      {q:'How long is one full cycle of lunar phases (New Moon to New Moon)?', options:['1 day','7 days','About 29.5 days','365 days'], correct:2, explain:'This is called the synodic month, about 29.5 days — slightly longer than the Moon\u2019s 27.3-day orbital period because Earth is also moving around the Sun.'},
      {q:'During a Waxing Crescent, the illuminated portion is…', options:['Shrinking','Growing','Completely dark','Completely lit'], correct:1, explain:'"Waxing" means growing — the lit portion increases each night on the way to Full Moon.'},
    ],
    dataColumns:['Day','Phase angle (°)','Phase name','Illumination %'],
    logEvery:14,
    graphLabel:'Illumination % vs time',

    setup(engine){ engine.state.phi = engine.state.moonAngle = 45; },
    reset(engine){ engine.state.phi = 45; },

    _theta(engine){
      if(engine.state.auto==='manual') return engine.state.moonAngle;
      const days = engine.t*(engine.state.daysPerSec||1.5);
      return ( (days/SYNODIC_MONTH)*360 + 45 ) % 360;
    },

    update(engine, dt){ /* angle derived live in draw/readouts via _theta */ },

    draw(engine){
      const {ctx, cssW:w, cssH:h, state} = engine;
      if(!state._stars) state._stars = Draw.makeStars(w,h,80);
      Draw.space(ctx,w,h,state._stars);
      const theta = this._theta(engine);
      const rad = theta*Math.PI/180;
      const cx = w*0.36, cy = h*0.55, orbR = Math.min(w,h)*0.3;

      // Sun indicator (off to the right, parallel light convention)
      const sunX = w*0.94, sunY = cy;
      Draw.glowBody(ctx, sunX, sunY, 16, '#fff7d6', '#fbbf24', 2.2);
      Draw.label(ctx,'Sunlight →', sunX-70, sunY-24, '#fbbf24', 11);
      for(let i=-1;i<=1;i++){
        ctx.strokeStyle='rgba(251,191,36,.25)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(sunX-20, sunY+i*40); ctx.lineTo(20, sunY+i*40); ctx.stroke();
      }

      // orbit path
      ctx.strokeStyle='rgba(148,163,184,.28)'; ctx.setLineDash([4,5]);
      ctx.beginPath(); ctx.arc(cx,cy,orbR,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);

      // Earth
      Draw.glowBody(ctx, cx, cy, 22, '#bfdbfe', '#2563eb', 1.4);
      Draw.label(ctx,'Earth', cx, cy+38, '#93c5fd', 11);

      // Moon position: theta measured from the Sun direction (theta=0 => between Earth & Sun => New Moon)
      const moonX = cx + orbR*Math.cos(rad);
      const moonY = cy + orbR*Math.sin(rad)*0.34; // slight inclination for visual clarity, avoids literal eclipse look
      // top-view moon: always lit on the side facing the sun (physically correct), independent of theta
      const litSide = Math.cos(rad) >= 0 ? 1 : (moonX>sunX?1:-1);
      ctx.save();
      ctx.beginPath(); ctx.arc(moonX,moonY,9,0,Math.PI*2); ctx.clip();
      ctx.fillStyle='#1c2340'; ctx.fillRect(moonX-10,moonY-10,20,20);
      // shade the hemisphere facing the sun bright, regardless of theta (vector from moon to sun)
      const toSunX = sunX-moonX, toSunY = sunY-moonY; const ang = Math.atan2(toSunY,toSunX);
      ctx.translate(moonX,moonY); ctx.rotate(ang);
      const g = ctx.createLinearGradient(-9,0,9,0);
      g.addColorStop(0,'#1c2340'); g.addColorStop(0.48,'#1c2340'); g.addColorStop(0.52,'#e2e8f0'); g.addColorStop(1,'#f8fafc');
      ctx.fillStyle=g; ctx.fillRect(-9,-9,18,18);
      ctx.restore();
      ctx.strokeStyle='rgba(226,232,240,.6)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(moonX,moonY,9,0,Math.PI*2); ctx.stroke();
      Draw.label(ctx,'Moon (top view)', moonX, moonY+22, '#cbd5e1', 10);

      // Earth-view inset panel
      const k = (1-Math.cos(rad))/2;
      const waxing = ((theta%360)+360)%360 < 180;
      const insetX = w*0.82, insetY = h*0.2, insetR = Math.min(w,h)*0.115;
      ctx.fillStyle='rgba(11,17,48,.75)'; ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(insetX-insetR-14, insetY-insetR-26, (insetR+14)*2, (insetR+26)*2, 12) : ctx.rect(insetX-insetR-14, insetY-insetR-26, (insetR+14)*2, (insetR+26)*2);
      ctx.fill();
      Draw.label(ctx,'As seen from Earth', insetX, insetY-insetR-10, '#94a3b8', 10.5);
      drawPhaseDisc(ctx, insetX, insetY, insetR, k, waxing);
      Draw.label(ctx, phaseName(theta), insetX, insetY+insetR+18, '#f8fafc', 12);
    },

    stageLeft(engine){ return phaseName(this._theta(engine)); },
    stageRight(engine){ const k=(1-Math.cos(this._theta(engine)*Math.PI/180))/2; return Math.round(k*100)+'% lit'; },

    readouts(engine){
      const theta = this._theta(engine);
      const k = (1-Math.cos(theta*Math.PI/180))/2;
      const days = engine.t*(engine.state.daysPerSec||1.5);
      return {
        'Phase': phaseName(theta),
        'Illumination': Math.round(k*100)+'%',
        'Phase angle': Math.round(theta)+'°',
        'Trend': (((theta%360)+360)%360<180) ? 'Waxing (growing)' : 'Waning (shrinking)',
        'Days into cycle': (days % SYNODIC_MONTH).toFixed(1),
        'Synodic month': SYNODIC_MONTH+' days',
      };
    },
    dataRow(engine){
      const theta = this._theta(engine);
      const k = (1-Math.cos(theta*Math.PI/180))/2;
      const days = engine.t*(engine.state.daysPerSec||1.5);
      return [days.toFixed(1), Math.round(theta), phaseName(theta), Math.round(k*100)];
    },
    graphValue(row){ return {x:Number(row[0]), y:Number(row[3])}; }
  };
})();
