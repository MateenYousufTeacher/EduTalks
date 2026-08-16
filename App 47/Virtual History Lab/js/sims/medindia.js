/* Medieval India Interactive World */
SimModules.medindia = {
  artifactIds:['coin-chola'],
  mapSvg:`<svg viewBox="0 0 220 300"><rect width="220" height="300" fill="#1a1116"/>
    <circle cx="70" cy="70" r="7" fill="#7A2434"/><text x="80" y="74" fill="#C9B79A" font-size="9">Delhi Sultanate</text>
    <circle cx="60" cy="140" r="7" fill="#C49A4E"/><text x="70" y="144" fill="#C9B79A" font-size="9">Rajput kingdoms</text>
    <circle cx="120" cy="230" r="7" fill="#3E5C3A"/><text x="130" y="234" fill="#C9B79A" font-size="9">Vijayanagara</text>
    <circle cx="140" cy="270" r="7" fill="#2C4A7C"/><text x="150" y="274" fill="#C9B79A" font-size="9">Chola territory</text></svg>`,
  mount(stageEl, sideStatsEl, controlsEl, api){
    const S = SimUtils;
    const KINGDOMS = {
      chola:{ label:'Chola', bonus:{commerce:15,culture:10}, blurb:'Maritime trade power of South India, known for temple architecture and naval reach.' },
      rajput:{ label:'Rajput', bonus:{defense:18,culture:5}, blurb:'Hill-fort kingdoms of northwestern India, celebrated for chivalric tradition and fortification.' },
      sultanate:{ label:'Delhi Sultanate', bonus:{connectivity:15,defense:8}, blurb:'A centralised power controlling key trans-continental trade and military routes.' },
      vijayanagara:{ label:'Vijayanagara', bonus:{commerce:10,connectivity:10}, blurb:'A prosperous empire renowned for markets, irrigation engineering and courtly patronage.' },
    };
    const TYPES = { empty:{icon:'▫️',label:'Clear'}, fort:{icon:'🏯',label:'Fort'}, market:{icon:'🏪',label:'Market'},
      temple:{icon:'🛕',label:'Temple/Craft'}, route:{icon:'🐫',label:'Trade Route'} };
    const ROWS=6, COLS=8;
    let cells = new Array(ROWS*COLS).fill('empty');
    let kingdom = 'chola';

    stageEl.innerHTML = `
      <p class="muted">Choose a kingdom, then design your capital. Different kingdoms bring different regional strengths.</p>
      <div id="kingdomHost"></div>
      <p class="muted mt8" id="kingdomBlurb"></p>
      <hr class="hairline">
      <div id="palette"></div>
      <div id="gridHost" class="mt8"></div>
    `;
    const kh = S.buildPalette(stageEl.querySelector('#kingdomHost'),
      Object.entries(KINGDOMS).map(([value,k])=>({value,label:k.label})),
      (v)=>{ kingdom = v; stageEl.querySelector('#kingdomBlurb').textContent = KINGDOMS[v].blurb; evaluate(); });
    stageEl.querySelector('#kingdomBlurb').textContent = KINGDOMS.chola.blurb;

    const palette = S.buildPalette(stageEl.querySelector('#palette'),
      Object.entries(TYPES).map(([value,t])=>({value,label:t.label,icon:t.icon})), ()=>{});

    const gridApi = S.buildGrid(stageEl.querySelector('#gridHost'), ROWS, COLS, cells,
      (i,state)=>{ state[i]=palette.get(); evaluate(); }, (v)=>TYPES[v].icon);

    function evaluate(){
      const counts={}; Object.keys(TYPES).forEach(k=>counts[k]=0);
      gridApi.state.forEach(v=>counts[v]++);
      const b = KINGDOMS[kingdom].bonus;
      const defense = Math.min(100, counts.fort*20 + (b.defense||0));
      const commerce = Math.min(100, counts.market*14 + counts.route*10 + (b.commerce||0));
      const culture = Math.min(100, counts.temple*16 + (b.culture||0));
      const connectivity = Math.min(100, counts.route*18 + (b.connectivity||0));
      api.renderStats([
        {label:'Defense', value:defense, kind: defense<25?'warn':'good'},
        {label:'Commerce', value:commerce, kind:'gold'},
        {label:'Culture', value:culture, kind:'info'},
        {label:'Connectivity', value:connectivity, kind:'good'},
        {label:'Kingdom', value:100, display:KINGDOMS[kingdom].label, kind:'gold'},
      ]);
    }

    api.renderControls([
      { label:'Clear City', icon:api.icons.reset, onClick(){ gridApi.state.fill('empty'); gridApi.repaint(); evaluate(); } }
    ]);
    api.onReset(()=>{ gridApi.state.fill('empty'); gridApi.repaint(); evaluate(); });
    evaluate();
  },
  quiz:[
    {q:'Which medieval Indian empire was especially known for maritime trade and naval reach?', options:['The Rajput kingdoms', 'The Chola dynasty', 'The Mauryan Empire', 'The Kushan Empire'], correct:1, explain:'The Cholas built a strong maritime trade network across South and Southeast Asia.'},
    {q:'What is a shreni in medieval Indian economic history?', options:['A royal palace', 'A craft or trade guild', 'A type of fort', 'A tax on farmers'], correct:1, explain:'Shreni were guilds that regulated craft quality and trade prices.'},
    {q:'What is true about medieval India\u2019s connections to the wider world?', options:['It was completely isolated', 'It had extensive maritime and overland trade links', 'Trade only began after 1900', 'No goods ever left the subcontinent'], correct:1, explain:'Extensive trade connected medieval India to Central Asia, the Middle East and Southeast Asia.'},
    {q:'What made Vijayanagara\u2019s capital, Hampi, notable in engineering terms?', options:['Advanced water-management canals', 'The first printing press', 'Steam-powered mills', 'Underground railways'], correct:0, explain:'Hampi\u2019s canal systems for water management remain traceable today.'},
    {q:'Why did fortified hill capitals like Chittorgarh combine defence with water-harvesting?', options:['Water had no defensive value', 'To withstand sieges by ensuring self-sufficient water supply', 'Purely decorative reasons', 'Because rainfall never occurred there'], correct:1, explain:'Water-harvesting let fortified capitals endure prolonged sieges.'},
  ]
};
