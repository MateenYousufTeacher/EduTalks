/* Indus Valley Civilization Explorer */
SimModules.indus = {
  artifactIds:['seal'],
  mapSvg:`<svg viewBox="0 0 400 160"><rect width="400" height="160" fill="#1a1512"/>
    <path d="M40 30 L120 60 L200 50 L280 90 L360 70" stroke="#2C4A7C" stroke-width="3" fill="none"/>
    <circle cx="40" cy="30" r="6" fill="#C49A4E"/><text x="20" y="20" fill="#C9B79A" font-size="10">Harappa</text>
    <circle cx="200" cy="50" r="6" fill="#C49A4E"/><text x="175" y="40" fill="#C9B79A" font-size="10">Mohenjo-daro</text>
    <circle cx="280" cy="90" r="6" fill="#C49A4E"/><text x="255" y="110" fill="#C9B79A" font-size="10">Lothal (port)</text>
    <circle cx="360" cy="70" r="6" fill="#8B8378"/><text x="320" y="60" fill="#C9B79A" font-size="10">Mesopotamia trade →</text></svg>`,
  mount(stageEl, sideStatsEl, controlsEl, api){
    const S = SimUtils;
    const TYPES = {
      empty:{icon:'▫️', label:'Clear'},
      road:{icon:'▬', label:'Road'},
      house:{icon:'🏠', label:'House'},
      drain:{icon:'💧', label:'Drainage'},
      granary:{icon:'🌾', label:'Granary'},
      bath:{icon:'🛁', label:'Great Bath'},
      well:{icon:'⛲', label:'Well'},
      workshop:{icon:'⚒️', label:'Workshop'},
    };
    const ROWS=6, COLS=9;
    let cells = new Array(ROWS*COLS).fill('empty');

    stageEl.innerHTML = `
      <p class="muted">Select a structure below, then click grid cells to build your Harappan city. Real Indus cities used strict grid layouts, covered drains and standardised bricks.</p>
      <div id="palette"></div>
      <div id="gridHost" class="mt8"></div>
    `;
    const palette = S.buildPalette(stageEl.querySelector('#palette'),
      Object.entries(TYPES).map(([value,t])=>({value,label:t.label,icon:t.icon})),
      ()=>{});

    const gridApi = S.buildGrid(stageEl.querySelector('#gridHost'), ROWS, COLS, cells,
      (i, state)=>{ state[i] = palette.get(); evaluate(); },
      (v)=> TYPES[v].icon);

    function neighbors(i){
      const r = Math.floor(i/COLS), c = i%COLS;
      const out=[];
      if(r>0) out.push(i-COLS); if(r<ROWS-1) out.push(i+COLS);
      if(c>0) out.push(i-1); if(c<COLS-1) out.push(i+1);
      return out;
    }

    function evaluate(){
      const counts = {}; Object.keys(TYPES).forEach(k=>counts[k]=0);
      gridApi.state.forEach(v=>counts[v]++);
      const totalBuilt = ROWS*COLS - counts.empty;
      // population: houses adjacent to a road score higher
      let servedHouses=0;
      gridApi.state.forEach((v,i)=>{
        if(v==='house' && neighbors(i).some(n=>gridApi.state[n]==='road')) servedHouses++;
      });
      const population = Math.min(100, counts.house*6 + servedHouses*4);
      const sanitation = Math.min(100, counts.drain*14 + (counts.bath?15:0));
      const trade = Math.min(100, counts.workshop*12 + counts.well*8 + (counts.granary?10:0));
      const planning = Math.min(100, (counts.road*8) + (totalBuilt? (servedHouses/Math.max(1,counts.house))*40 : 0));
      const foodSecurity = Math.min(100, (counts.granary*22) + (counts.well*6));

      api.renderStats([
        {label:'Population Density', value:population, kind:'good'},
        {label:'Sanitation', value:sanitation, kind: sanitation<30?'bad':'info'},
        {label:'Trade Activity', value:trade, kind:'gold'},
        {label:'Urban Planning', value:planning, kind: planning<30?'warn':'good'},
        {label:'Food Security', value:foodSecurity, kind: foodSecurity<30?'bad':'good'},
      ]);
      stageEl.querySelector('#evalNote') && (stageEl.querySelector('#evalNote').textContent =
        sanitation<20 ? 'Low sanitation — real Harappan cities prioritised covered drains alongside every street.' :
        planning<25 ? 'Try connecting houses to roads in a grid pattern, as seen at Mohenjo-daro.' :
        'A well-planned settlement — much like the real Indus cities archaeologists have excavated.');
    }

    const note = document.createElement('p'); note.className='muted mt8'; note.id='evalNote';
    stageEl.appendChild(note);

    api.renderControls([
      { label:'Auto-Plan Example', icon:'🏛️', onClick(){
          cells = cells.map((_,i)=>{
            const r=Math.floor(i/COLS), c=i%COLS;
            if(r===2) return 'road';
            if(c%3===0 && r!==2) return 'drain';
            if(r===0 && c===1) return 'bath';
            if(r===5 && c===7) return 'granary';
            if(r===0 && c===7) return 'well';
            if((r+c)%4===0) return 'workshop';
            return 'house';
          });
          gridApi.state.splice(0,cells.length,...cells);
          gridApi.repaint(); evaluate();
        } },
      { label:'Clear City', icon:api.icons.reset, onClick(){
          gridApi.state.fill('empty'); gridApi.repaint(); evaluate();
        } },
    ]);

    api.onReset(()=>{ gridApi.state.fill('empty'); gridApi.repaint(); evaluate(); });
    evaluate();
  },
  quiz:[
    {q:'What Indus Valley structure is believed to have been used for ritual public bathing?', options:['The Granary','The Great Bath','The Citadel wall','The Workshop'], correct:1, explain:'The Great Bath at Mohenjo-daro is one of the earliest known public water structures, likely used for ritual purposes.'},
    {q:'What evidence shows Indus cities used standardisation?', options:['Identical paintings','A uniform 4:2:1 brick ratio across cities','Only one type of pottery existed','No evidence of standardisation exists'], correct:1, explain:'Bricks across Harappan sites follow a near-identical size ratio, indicating centralised standards.'},
    {q:'Has the Indus script been fully deciphered by historians?', options:['Yes, completely','No, it remains undeciphered', 'Only the numbers are known','It was proven to be decorative only'], correct:1, explain:'The Indus script remains undeciphered; interpretations of seals are actively debated.'},
    {q:'What do covered drains running beside Indus streets suggest?', options:['Advanced sanitation planning','Random unplanned construction','Religious decoration only','Defensive fortification'], correct:0, explain:'Covered drainage alongside standardised streets reflects deliberate civic sanitation planning.'},
    {q:'Which of these is a leading (though debated) explanation for the Indus decline?', options:['A single sudden invasion with no other cause','Combination of climate shift, river change and trade disruption','Complete absence of any cause','Indus cities never declined'], correct:1, explain:'Historians point to a combination of factors rather than one single cause.'},
  ]
};
