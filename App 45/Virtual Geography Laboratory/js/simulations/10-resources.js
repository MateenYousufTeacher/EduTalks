/* ============================================================
   SIM 10 — NATURAL RESOURCES & LAND USE MANAGER
   ============================================================ */
registerSim('resources', {
  objectives:[
    "Balance competing land uses: forest, agriculture, mining, urban and energy.",
    "Track how land-use decisions affect biodiversity and pollution.",
    "Compute a simple sustainability index from multiple indicators.",
    "Evaluate trade-offs between economic growth and environmental health."
  ],
  intro:"Every region must balance forests, farms, mines, cities and energy production against limited land and resources. Allocate land use in this simulator and observe the consequences for biodiversity, pollution, and economic growth.",
  background:"Land-use decisions create trade-offs: expanding agriculture and mining can boost short-term economic output but often reduces forest cover, harming biodiversity and increasing pollution. Sustainable development seeks a balance where resource use meets present needs without compromising the resource base for future generations — commonly measured through composite indicators combining environmental, social and economic health.",
  humanImpact:"Land-use planning directly affects clean water availability, air quality, food security, and long-term resilience to climate change, making it one of the most consequential decisions any region or nation can make.",
  realWorld:"Many countries now use Sustainable Development Goal (SDG) indicators, similar in spirit to this simulator's sustainability index, to track and report progress on balancing growth with environmental protection.",
  facts:[
    "Nearly a third of the world's land area is used for agriculture.",
    "Deforestation contributes roughly 10% of global greenhouse gas emissions.",
    "Sustainable mining practices can reduce land disturbance by rehabilitating sites after extraction.",
    "Urban green spaces can reduce local air pollution and city temperatures significantly."
  ],
  misconceptions:[
    "Economic growth and environmental protection are not always opposites — sustainable practices can support both over the long term.",
    "Mining is not inherently 'all bad' — regulated, rehabilitated mining can minimise long-term damage.",
    "Protecting all forests does not mean zero economic activity — sustainable forestry and eco-tourism can generate income."
  ],
  summary:"Balancing forest, agriculture, mining, urban and energy land uses requires trade-offs between economic growth, biodiversity, and pollution. A high sustainability index reflects land-use choices that support long-term ecological and economic health together.",
  dataColumns:['Turn #','Forest %','Agriculture %','Mining %','Urban %','Sustainability Index'],
  graphSeries(rows){ return [{name:'Sustainability Index', color:'#2E7D32', data:rows.map(r=>r[5])}]; },
  quiz:[
    {q:"What typically happens to biodiversity when forest land is converted to mining or urban use?", options:["It usually increases", "It generally decreases due to habitat loss", "It stays exactly the same", "There is no relationship"], correct:1, explain:"Converting forest to mining or urban land destroys habitats, typically reducing biodiversity."},
    {q:"What does a 'sustainability index' attempt to measure?", options:["Only economic growth", "A combined score of environmental, social and economic health", "Only pollution levels", "Only population size"], correct:1, explain:"Sustainability indices combine multiple indicators — environmental, social and economic — into one composite measure."},
    {q:"Which of the following is a way to reduce mining's environmental impact?", options:["Ignoring the mine after extraction", "Site rehabilitation after extraction", "Removing all regulations", "Expanding without any planning"], correct:1, explain:"Rehabilitating mined land after extraction helps restore ecosystems and reduce long-term damage."},
    {q:"Why is unchecked deforestation for agriculture a concern globally?", options:["It has no climate impact", "It contributes significantly to greenhouse gas emissions and biodiversity loss", "It always increases forest cover elsewhere automatically", "It only affects the mining sector"], correct:1, explain:"Deforestation releases stored carbon and destroys habitat, contributing to climate change and biodiversity loss."},
    {q:"What is the core idea of sustainable development?", options:["Maximising short-term profit only", "Meeting present needs without compromising future generations' ability to meet theirs", "Avoiding all land development permanently", "Focusing only on urban growth"], correct:1, explain:"Sustainable development balances current needs against preserving resources and ecosystems for the future."},
  ],
  mount(stage, panel, api){
    stage.innerHTML = `<canvas id="rs-canvas"></canvas>`;
    const canvas = stage.querySelector('canvas'); const ctx = canvas.getContext('2d');
    let forest=40, agriculture=25, mining=10, urban=15, energy=10, turn=0, biodiversity=80, pollution=15, economy=50;

    function resize(){ const w=stage.clientWidth,h=stage.clientHeight; canvas.width=w*devicePixelRatio; canvas.height=h*devicePixelRatio; canvas.style.width=w+'px'; canvas.style.height=h+'px'; }
    resize(); window.addEventListener('resize', ()=>{ resize(); draw(); });

    function normalize(){
      const total = forest+agriculture+mining+urban+energy;
      if(total<=0) return;
      forest=forest/total*100; agriculture=agriculture/total*100; mining=mining/total*100; urban=urban/total*100; energy=energy/total*100;
    }

    function computeIndices(){
      biodiversity = Math.max(0, Math.min(100, forest*1.1 - mining*0.8 - urban*0.4 - agriculture*0.2 + 20));
      pollution = Math.max(0, Math.min(100, mining*1.3 + urban*0.9 + agriculture*0.3 - forest*0.3));
      economy = Math.max(0, Math.min(100, agriculture*0.6 + mining*1.0 + urban*0.8 + energy*0.9));
      const sustainability = Math.round(Math.max(0, Math.min(100, biodiversity*0.4 + (100-pollution)*0.35 + economy*0.25)));
      return sustainability;
    }

    function draw(){
      const dpr=devicePixelRatio, w=canvas.width/dpr, h=canvas.height/dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      ctx.fillStyle='#EAF3FC'; ctx.fillRect(0,0,w,h);
      const uses = [ {n:'Forest',v:forest,c:'#2E7D32'}, {n:'Agriculture',v:agriculture,c:'#8BC34A'}, {n:'Mining',v:mining,c:'#795548'}, {n:'Urban',v:urban,c:'#607D8B'}, {n:'Energy',v:energy,c:'#FFB300'} ];
      let x=0;
      uses.forEach(u=>{
        const bw = (u.v/100)*w;
        ctx.fillStyle=u.c; ctx.fillRect(x,h*0.15,bw,h*0.55);
        if(bw>28){ ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.fillText(u.n, x+4, h*0.15+14); ctx.fillText(Math.round(u.v)+'%', x+4, h*0.15+28); }
        x+=bw;
      });
      // indicator bars
      const sustain = computeIndices();
      const rows = [ {l:'Biodiversity', v:biodiversity, c:'#2E7D32'}, {l:'Pollution', v:pollution, c:'#E53935'}, {l:'Economy', v:economy, c:'#1976D2'}, {l:'Sustainability', v:sustain, c:'#FFB300'} ];
      rows.forEach((r,i)=>{
        const y = h*0.78 + i*16;
        ctx.fillStyle='#5C6672'; ctx.font='10px sans-serif'; ctx.fillText(r.l, 4, y+8);
        ctx.fillStyle='#E1E6EC'; ctx.fillRect(90,y,w-100,8);
        ctx.fillStyle=r.c; ctx.fillRect(90,y,(r.v/100)*(w-100),8);
      });
    }
    draw();

    function pushTurn(){
      turn++;
      const sustain = computeIndices();
      api.pushRow([turn, Math.round(forest), Math.round(agriculture), Math.round(mining), Math.round(urban), sustain]);
      if(sustain>=75) api.markProgress(100);
    }

    function makeLandSlider(key,label,init){
      return addSlider(panel,{key,label,min:0,max:80,step:1,value:init,unit:'%', onInput:v=>{
        if(key==='forest') forest=v; if(key==='agriculture') agriculture=v; if(key==='mining') mining=v; if(key==='urban') urban=v; if(key==='energy') energy=v;
        normalize(); draw(); api.onFirstInteract();
      }});
    }
    makeLandSlider('forest','Forest',40);
    makeLandSlider('agriculture','Agriculture',25);
    makeLandSlider('mining','Mining',10);
    makeLandSlider('urban','Urban Development',15);
    makeLandSlider('energy','Energy Production',10);

    const btnRow = document.createElement('div'); btnRow.className='panel-block';
    btnRow.innerHTML = `<h3>📊 Apply Land Use Plan</h3><p class="small">Sliders auto-normalize to 100% total land. Click below to commit this year's plan and record results.</p><button class="btn btn-primary btn-block" id="commit-plan">Commit This Year's Plan</button>`;
    panel.appendChild(btnRow);
    btnRow.querySelector('#commit-plan').addEventListener('click', ()=>{ pushTurn(); toast('Plan committed for year '+turn); draw(); });

    api.setReadout('Adjust land allocation, then commit your plan each turn');

    return {
      onPlay(){ pushTurn(); },
      onPause(){},
      onReset(){ forest=40;agriculture=25;mining=10;urban=15;energy=10; turn=0; draw(); },
      onRandomize(){ forest=Math.random()*80; agriculture=Math.random()*80; mining=Math.random()*80; urban=Math.random()*80; energy=Math.random()*80; normalize(); draw(); },
      onStep(dir){ pushTurn(); }
    };
  }
});
