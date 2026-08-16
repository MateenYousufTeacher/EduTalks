(function(){
  const SIM='glacier';

  const MISSIONS=[
    {id:'m1', title:'Thicken the Ice', desc:'Increase ice thickness and observe faster advance.'},
    {id:'m2', title:'Change the Slope', desc:'Increase slope and compare glacier velocity.'},
    {id:'m3', title:'Slow vs Fast', desc:'Run the model at both a slow and a fast setting.'},
    {id:'m4', title:'Identify Landforms', desc:'Advance the glacier far enough to reveal a U-shaped valley and moraine.'},
    {id:'m5', title:'Advance and Retreat', desc:'Run a full advance-to-retreat cycle.'}
  ];

  function mount(root, ctx){
    let thickness=120, slope=8, friction=5, temp=-4; // temp in °C, controls melt/retreat
    let time=0; // simulated years
    let extent=0; // glacier terminus position, 0-100
    let maxExtent=0;
    let phase='advance'; // advance | retreat
    let ranSlow=false, ranFast=false;
    let done = GeoLab.ui.loadProgress(SIM).missions;
    let sediment = []; // moraine deposit positions

    // simplified educational glaciological flow law: velocity ∝ thickness^2 * slope / friction (Glen's-flow inspired)
    function velocity(){
      const base = (Math.pow(thickness/100,2) * (slope/10)) / (friction/5);
      const meltFactor = temp>0 ? Math.max(0.1, 1 - temp*0.3) : 1 + Math.abs(temp)*0.05;
      return Math.max(0, base*meltFactor);
    }

    function step(years){
      const v = velocity();
      if(phase==='advance'){
        extent = Math.min(100, extent + v*years*0.8);
        if(extent>maxExtent){
          maxExtent = extent;
          if(Math.random()<0.4) sediment.push(extent);
        }
      } else {
        extent = Math.max(0, extent - v*years*0.5);
      }
      time += years;
    }

    function bedrockProfile(){
      // cross-section: valley from left (mountain) to right (lowland), V-shape base
      let pts=[];
      for(let x=0;x<=100;x+=2){
        const y = 70 - x*0.3 + Math.sin(x/12)*3;
        pts.push([x,y]);
      }
      return pts;
    }

    function crossSectionSVG(){
      const bed = bedrockProfile();
      const bedPath = 'M ' + bed.map(p=>p.join(',')).join(' L ') + ' L 100,100 L 0,100 Z';
      // ice surface: from x=0 to x=extent, height above bedrock scaled by thickness, tapering to terminus
      let icePath = '';
      if(extent>0.5){
        const iceTop = bed.filter(p=>p[0]<=extent).map(([x,y])=>{
          const taper = Math.max(0,1-(x/Math.max(extent,1)));
          const h = (thickness/6) * (0.4+0.6*taper);
          return [x, Math.max(2, y-h)];
        });
        icePath = 'M 0,'+ (bed[0][1]) +' ' + iceTop.map(p=>`L ${p[0]},${p[1]}`).join(' ') +
          ` L ${extent},${bed.find(p=>p[0]>=extent-2)?.[1]||60} ` +
          bed.filter(p=>p[0]<=extent).reverse().map(([x,y])=>`L ${x},${y}`).join(' ') + ' Z';
      }
      // U-shaped valley indicator once glacier has retreated past max extent significantly
      const showUValley = maxExtent>40 && extent < maxExtent*0.6;
      const showMoraine = sediment.length>0 && phase==='retreat';

      let svg = `<svg viewBox="0 0 100 75" style="width:100%;border-radius:10px;background:linear-gradient(#BEE3F8,#E8F4FC);">`;
      svg += `<path d="${bedPath}" fill="#8D7B68"/>`;
      if(showUValley){
        // draw a rounded valley notch to represent glacially-carved U-shape
        svg += `<path d="M 10,68 Q 30,50 50,68" fill="none" stroke="#5B4A3A" stroke-width="1.6" stroke-dasharray="2 2"/>`;
        svg += `<text x="30" y="46" font-size="3.6" fill="#5B4A3A" text-anchor="middle">U-shaped valley</text>`;
      }
      if(icePath) svg += `<path d="${icePath}" fill="#DCEEFB" stroke="#8EC9E8" stroke-width="0.6" opacity="0.92"/>`;
      if(showMoraine){
        sediment.forEach(pos=>{
          svg += `<ellipse cx="${pos}" cy="${(bedrockProfile().find(p=>p[0]>=Math.round(pos/2)*2)||[0,60])[1]-1}" rx="2.4" ry="1.4" fill="#6B5B4B"/>`;
        });
        svg += `<text x="${sediment[0]}" y="${(bedrockProfile().find(p=>p[0]>=Math.round(sediment[0]/2)*2)||[0,60])[1]+6}" font-size="3" fill="#6B5B4B" text-anchor="middle">moraine</text>`;
      }
      svg += `<text x="97" y="10" font-size="3.6" text-anchor="end" fill="#334">t = ${Math.round(time)} yrs</text>`;
      svg += `</svg>`;
      return svg;
    }

    function render(){
      const v = velocity();
      root.innerHTML = `
        <div class="panel">
          <h3>Glacial Landscape <span class="sub">Cross-section view — ice flows left to right</span></h3>
          <div id="glacierStage">${crossSectionSVG()}</div>
          <div class="metric-grid" style="margin-top:10px;">
            ${GeoLab.ui.metric('Flow velocity', v.toFixed(2)+' u/yr')}
            ${GeoLab.ui.metric('Terminus position', Math.round(extent))}
            ${GeoLab.ui.metric('Max extent reached', Math.round(maxExtent))}
            ${GeoLab.ui.metric('Phase', phase==='advance'?'Advancing':'Retreating')}
          </div>
        </div>

        <div class="panel">
          <h3>Glacier Variables</h3>
          ${GeoLab.ui.slider({id:'thick', label:'Ice thickness', min:40,max:220,step:5,value:thickness,unit:'m'})}
          ${GeoLab.ui.slider({id:'slope', label:'Surface slope', min:1,max:20,value:slope,unit:'°'})}
          ${GeoLab.ui.slider({id:'fric', label:'Bed friction', min:1,max:10,value:friction})}
          ${GeoLab.ui.slider({id:'temp', label:'Temperature', min:-10,max:6,value:temp,unit:'°C'})}
        </div>

        <div class="panel">
          <h3>Time Control</h3>
          <div class="btn-row">
            <button class="btn btn-primary btn-sm" id="stepSlow">▶ Advance 10 yrs (slow)</button>
            <button class="btn btn-primary btn-sm" id="stepFast">▶▶ Advance 50 yrs (fast)</button>
          </div>
          <div class="btn-row" style="margin-top:8px;">
            <button class="btn ${phase==='retreat'?'btn-amber':'btn-secondary'} btn-sm" id="togglePhase">${phase==='advance'?'🌡️ Trigger Retreat (warming)':'❄️ Resume Advance'}</button>
            <button class="btn btn-tertiary btn-sm" id="resetGlacier">Reset</button>
          </div>
        </div>

        <div class="panel">
          <h3>Experiments</h3>
          ${GeoLab.ui.missions(MISSIONS, done)}
        </div>

        <div class="btn-row" style="padding:0 2px 8px;">${GeoLab.ui.favBar(ctx)}</div>
      `;
      GeoLab.ui.bindFav(root, ctx);
      bind();
    }

    function complete(id){ if(GeoLab.ui.markMission(SIM,id,ctx)) done = GeoLab.ui.loadProgress(SIM).missions; }

    function bind(){
      GeoLab.ui.bindSlider('thick','m', v=>{ const old=thickness; thickness=v; if(v>old) complete('m1'); root.querySelector('#glacierStage').innerHTML = crossSectionSVG(); refreshMetrics(); });
      GeoLab.ui.bindSlider('slope','°', v=>{ const old=slope; slope=v; if(v!==old) complete('m2'); refreshMetrics(); });
      GeoLab.ui.bindSlider('fric','', v=>{ friction=v; refreshMetrics(); });
      GeoLab.ui.bindSlider('temp','°C', v=>{ temp=v; refreshMetrics(); });

      root.querySelector('#stepSlow')?.addEventListener('click', ()=>{ step(10); ranSlow=true; checkSpeedMission(); render(); });
      root.querySelector('#stepFast')?.addEventListener('click', ()=>{ step(50); ranFast=true; checkSpeedMission(); render(); });
      root.querySelector('#togglePhase')?.addEventListener('click', ()=>{
        phase = phase==='advance' ? 'retreat' : 'advance';
        if(phase==='retreat') ctx.toast('Warming triggered — glacier begins retreating');
        if(maxExtent>10 && phase==='retreat') complete('m5');
        render();
      });
      root.querySelector('#resetGlacier')?.addEventListener('click', ()=>{
        extent=0; maxExtent=0; time=0; phase='advance'; sediment=[]; render();
      });
    }
    function checkSpeedMission(){
      if(ranSlow && ranFast) complete('m3');
      if(maxExtent>40) complete('m4');
    }
    function refreshMetrics(){
      const stage = root.querySelector('#glacierStage');
      if(stage) stage.innerHTML = crossSectionSVG();
    }

    render();
  }

  GeoLab.sims[SIM].mount = mount;
})();
