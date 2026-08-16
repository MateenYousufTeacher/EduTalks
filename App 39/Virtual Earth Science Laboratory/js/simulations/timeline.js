/* ==========================================================================
   Simulation 10 — Earth's Geological Timeline Studio
   ========================================================================== */
(function(){
  const EVENTS = [
    {ma:4600, t:'Formation of Earth', d:'Earth accretes from the solar nebula and differentiates into core, mantle and crust.', era:'Hadean'},
    {ma:4400, t:'First Oceans', d:'Evidence from ancient zircon crystals suggests liquid water — and therefore oceans — existed remarkably early.', era:'Hadean'},
    {ma:3800, t:'Oldest Known Rocks', d:'Some of the oldest preserved rocks on Earth, from Greenland and Canada, date to around this time.', era:'Archean'},
    {ma:3500, t:'Origin of Life', d:'The earliest strong fossil evidence of life — stromatolites built by microbial mats — dates to roughly this period.', era:'Archean'},
    {ma:2400, t:'Great Oxidation Event', d:'Photosynthetic microbes release enough oxygen to permanently change Earth\'s atmosphere and oceans.', era:'Proterozoic'},
    {ma:541, t:'Cambrian Explosion', d:'A rapid diversification of complex animal life appears in the fossil record over a geologically short interval.', era:'Paleozoic'},
    {ma:443, t:'End-Ordovician Extinction', d:'One of the "big five" mass extinctions, linked to rapid climate change and glaciation.', era:'Paleozoic'},
    {ma:252, t:'Permian–Triassic Extinction', d:'The most severe mass extinction in Earth\'s history, eliminating an estimated 90%+ of marine species.', era:'Paleozoic/Mesozoic'},
    {ma:201, t:'Triassic–Jurassic Extinction', d:'A mass extinction that cleared ecological space, enabling dinosaurs to become dominant in the Jurassic.', era:'Mesozoic'},
    {ma:66, t:'Dinosaur Extinction (K–Pg)', d:'An asteroid impact (plus large-scale volcanism) ends the age of non-avian dinosaurs.', era:'Mesozoic/Cenozoic'},
    {ma:55, t:'Rapid Mammal Diversification', d:'With dinosaurs gone, mammals diversify rapidly to fill vacated ecological niches.', era:'Cenozoic'},
    {ma:7, t:'Human–Chimpanzee Lineage Split', d:'Genetic and fossil evidence places the last common ancestor of humans and chimpanzees around this time.', era:'Cenozoic'},
    {ma:0.3, t:'Homo sapiens Emerges', d:'Fossil evidence places the earliest anatomically modern humans at roughly 300,000 years ago.', era:'Cenozoic'},
    {ma:0.012, t:'Agriculture Begins', d:'Human societies begin cultivating crops and domesticating animals around 12,000 years ago.', era:'Cenozoic'},
  ];

  const ZOOMS = {
    full:        {label:'Full History', min:0, max:4600},
    phanerozoic: {label:'Phanerozoic (541 Ma – now)', min:0, max:541},
    cenozoic:    {label:'Cenozoic (66 Ma – now)', min:0, max:66},
    human:       {label:'Human Era (0.3 Ma – now)', min:0, max:0.3},
  };
  let zoom='full', scaleMode='log';
  let selectedEvent = null;
  let root, EL, canvas;

  function visibleEvents(){
    const z = ZOOMS[zoom];
    return EVENTS.filter(e=> e.ma<=z.max);
  }

  function xFor(ma, w, z){
    const pad=40;
    let t;
    if(scaleMode==='log' && zoom==='full'){
      const logMax = Math.log10(z.max+1);
      const logV = Math.log10(ma+1);
      t = 1 - logV/logMax;
    } else {
      t = 1 - ma/z.max;
    }
    return pad + t*(w-2*pad);
  }

  function draw(){
    const ctx = EL.fitCanvas(canvas, 420);
    const w = canvas.clientWidth, h=420;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#12211A'; ctx.fillRect(0,0,w,h);

    const z = ZOOMS[zoom];
    const axisY = h*0.55;
    ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(30,axisY); ctx.lineTo(w-20,axisY); ctx.stroke();
    // arrow at "now"
    ctx.beginPath(); ctx.moveTo(w-20,axisY); ctx.lineTo(w-30,axisY-6); ctx.lineTo(w-30,axisY+6); ctx.closePath();
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='10px sans-serif';
    ctx.fillText('Today', w-46, axisY+22);
    ctx.fillText(z.max>=1000 ? (z.max/1000).toFixed(1)+' Bya' : z.max+' Mya', 30, axisY+22);

    const events = visibleEvents();
    events.forEach(e=>{
      const x = xFor(e.ma, w, z);
      const sel = selectedEvent===e;
      ctx.beginPath(); ctx.arc(x,axisY,sel?8:6,0,Math.PI*2);
      ctx.fillStyle = sel ? '#FFB300' : '#43A047';
      ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.4; ctx.stroke();
      e._x = x; e._y = axisY;
    });

    // labels for a manageable subset (avoid overlap): stagger above/below
    events.forEach((e,i)=>{
      const x = e._x;
      const up = i%2===0;
      ctx.save();
      ctx.translate(x, axisY + (up?-16:26));
      ctx.rotate(up?-0.5:0.5);
      ctx.fillStyle = selectedEvent===e ? '#FFB300' : 'rgba(255,255,255,0.75)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = up? 'left':'left';
      ctx.fillText(e.t, 0,0);
      ctx.restore();
      ctx.strokeStyle='rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.moveTo(x,axisY); ctx.lineTo(x, axisY+(up?-14:14)); ctx.stroke();
    });

    ctx.fillStyle='#fff'; ctx.font='bold 13px sans-serif';
    ctx.fillText(`${ZOOMS[zoom].label}${zoom==='full'?` (${scaleMode} scale)`:''}`, 14, 24);
    ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText('Click a marker to see event details', 14, 42);
  }

  function handleClick(evt){
    const rect = canvas.getBoundingClientRect();
    const x = (evt.clientX-rect.left) * (canvas.clientWidth/rect.width);
    const y = (evt.clientY-rect.top) * (canvas.clientHeight/rect.height);
    const events = visibleEvents();
    let closest=null, bestD=99999;
    events.forEach(e=>{
      const d = Math.hypot((e._x||0)-x, (e._y||0)-y);
      if(d<bestD){ bestD=d; closest=e; }
    });
    if(closest && bestD<28){
      selectedEvent = closest;
      showDetail(closest);
      draw();
    }
  }

  function showDetail(e){
    const host = document.getElementById('timelineDetail');
    if(!host) return;
    host.innerHTML = `
      <h4 style="margin-bottom:6px;">${e.t}</h4>
      <p class="small" style="margin-bottom:6px;"><span class="chip">${e.era}</span> <span class="chip">${e.ma>=1000?(e.ma/1000).toFixed(2)+' billion years ago':e.ma+' million years ago'}</span></p>
      <p class="small">${e.d}</p>
    `;
    EL.logObservation(root, [e.ma+' Mya', e.era, e.t, 'Viewed']);
  }

  function render(){
    const host = document.getElementById('controlsHost');
    host.innerHTML = `
      ${EL.segmented({id:'zoomSel', label:'Zoom Level', active:Object.keys(ZOOMS).indexOf(zoom), options:
        Object.entries(ZOOMS).map(([k,v])=>({v:k, label:v.label.split(' ')[0]}))
      })}
      <div class="control" id="scaleModeCtrl">
        <div class="row"><span>Axis Scale (Full History only)</span></div>
        <div class="seg" id="scaleSel">
          <button data-v="log" class="${scaleMode==='log'?'active':''}">Logarithmic</button>
          <button data-v="linear" class="${scaleMode==='linear'?'active':''}">Linear</button>
        </div>
      </div>
      <p class="small muted">Logarithmic scale spreads out recent events that would otherwise be invisible on a 4.6-billion-year linear axis.</p>
      <div class="info-card glass" id="timelineDetail" style="margin-top:10px;">
        <p class="small muted">Click any marker on the timeline to view details about that event.</p>
      </div>
    `;
    EL.wireSegmented(host, 'zoomSel', v=>{ zoom=v; selectedEvent=null; draw(); });
    host.querySelector('#scaleSel').querySelectorAll('button').forEach(b=>{
      b.addEventListener('click', ()=>{
        host.querySelector('#scaleSel').querySelectorAll('button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active'); scaleMode=b.dataset.v; draw();
      });
    });
    document.getElementById('playbarHost').innerHTML='';
  }

  function updateData(){
    const chart = document.getElementById('dataChart');
    if(chart){
      const events = visibleEvents();
      EL.drawLineChart(chart, [{data:events.map((e,i)=>({y:e.ma})), color:'#26C6DA', fill:true}], {decimals:1, xLabels:events.map(e=>e.t.slice(0,8))});
    }
    const tableHost = document.getElementById('dataTableHost');
    if(tableHost){
      tableHost.innerHTML = EL.buildTable(
        ['Event','Era','Time Ago'],
        EVENTS.map(e=>[e.t, e.era, e.ma>=1000?(e.ma/1000).toFixed(2)+' billion years':e.ma+' million years'])
      );
    }
  }

  function reset(){ selectedEvent=null; zoom='full'; scaleMode='log'; render(); draw(); updateData(); }
  function mount(rootEl, EarthLab){
    root=rootEl; EL=EarthLab; canvas=root.querySelector('#simCanvas');
    canvas.addEventListener('click', handleClick);
    render(); draw(); updateData();
  }

  window.SimModules = window.SimModules || {};
  window.SimModules.timeline = {
    mount, reset,
    learn:{
      background:`Earth's 4.6-billion-year history is organised into eons, eras, periods and epochs based on major changes recorded in rock layers and fossils. Because the timescale is so vast, recent, well-documented time — including all of human history — occupies a tiny fraction of it, which is why timelines are often shown on a compressed or logarithmic scale.`,
      realWorld:`Geological time scales let scientists correlate rock layers across continents, date the age of fossils and rocks, and understand the pace of processes like mountain building, mass extinctions and climate change.`,
      misconceptions:[
        'Human history is not a large slice of Earth\'s history — on a 4.6-billion-year linear scale, all of recorded human history would be thinner than a single line.',
        'Mass extinctions are not single, instantaneous events — they typically unfold over thousands to hundreds of thousands of years.',
        'Dinosaurs did not go extinct at the same time as early humans — over 60 million years separate the two.'],
      facts:[
        'If Earth\'s history were compressed into a single 24-hour day, modern humans would appear in only the last few seconds before midnight.',
        'The Great Oxidation Event was so disruptive to early anaerobic life that it is sometimes called the "Oxygen Catastrophe."',
        'More than 99% of all species that have ever lived on Earth are now extinct.'],
      summary:`Geological time spans 4.6 billion years, organised by major boundaries such as the origin of life, the rise of atmospheric oxygen, the Cambrian explosion, repeated mass extinctions, and the very recent emergence of modern humans — best appreciated on a compressed or logarithmic timeline.`
    },
    quiz:[
      {q:'Why is a logarithmic (or compressed) scale often used to display Earth\'s geological timeline?', options:['It looks more colourful','Recent events would be invisible on a true linear 4.6-billion-year scale','It is required by law','Geologists prefer round numbers'], correct:1, explain:'On a strict linear scale, all of human history would be compressed into an invisible sliver, so timelines are often compressed or shown logarithmically.'},
      {q:'Which event is considered the most severe mass extinction in Earth\'s history?', options:['End-Ordovician extinction','Permian–Triassic extinction','Triassic–Jurassic extinction','Cretaceous–Paleogene extinction'], correct:1, explain:'The Permian–Triassic extinction, roughly 252 million years ago, eliminated an estimated 90%+ of marine species.'},
      {q:'Approximately how long ago did anatomically modern humans (Homo sapiens) emerge?', options:['3,000 years ago','300,000 years ago','3 million years ago','3 billion years ago'], correct:1, explain:'Fossil evidence places the emergence of Homo sapiens at roughly 300,000 years ago.'},
      {q:'What ended the age of non-avian dinosaurs around 66 million years ago?', options:['A supervolcano alone','An asteroid impact (plus large-scale volcanism)','A sudden ice age only','Overhunting by early mammals'], correct:1, explain:'An asteroid impact, likely combined with intense volcanic activity, triggered the Cretaceous–Paleogene mass extinction.'},
      {q:'Roughly how much of Earth\'s history has humans (genus Homo) existed for?', options:['About half','About 10%','Less than 0.1%','Almost all of it'], correct:2, explain:'Even generously dated, the genus Homo has existed for only a few million years — a tiny fraction of Earth\'s 4,600-million-year history.'}
    ]
  };
})();
