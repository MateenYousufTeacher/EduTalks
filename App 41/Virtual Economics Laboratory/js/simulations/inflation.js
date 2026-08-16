/* ==========================================================================
   SIM 03 — INFLATION EXPLORER
   ========================================================================== */
window.VEC_SIMS = window.VEC_SIMS || {};
window.VEC_SIMS['inflation'] = {
  id:'inflation', icon:'🎈', tag:'Macroeconomics', tagClass:'macro', duration:'20 min',
  title:'Inflation Explorer',
  shortDesc:'Manage money supply, output, government spending and interest rates — watch inflation, purchasing power and employment respond.',
  objectives:[
    'Explain the relationship between money supply growth and inflation.',
    'Distinguish demand-pull inflation from cost/output-driven price changes.',
    'Calculate how inflation erodes purchasing power and real savings over time.',
    'Understand how interest rates are used as a tool to control inflation.'
  ],
  concept:[
    '<b>Inflation</b> is a sustained rise in the general price level, which reduces the purchasing power of money — the same ₹100 buys less over time. A simplified version of the <b>Quantity Theory of Money</b> says inflation ≈ growth in money supply + growth in the speed money changes hands (velocity) − growth in real output.',
    '<b>Demand-pull inflation</b> happens when total spending in the economy (consumer demand, government spending) grows faster than the economy\'s ability to produce goods — "too much money chasing too few goods". If production (real output) grows at the same pace as demand, prices can stay stable.',
    'Central banks often raise <b>interest rates</b> to fight inflation: higher rates make borrowing costlier and saving more attractive, cooling down demand. The <b>real interest rate</b> (nominal rate − inflation) tells savers whether their money is actually gaining or losing purchasing power.'
  ],
  misconceptions:[
    'Inflation does not mean prices of every single good rise by the same amount — it is a rise in the general/average price level.',
    'Printing more money does not instantly create proportional inflation if output is also growing at the same pace.',
    'Mild, stable inflation (2–6%) is often considered healthy for an economy — the goal is not zero inflation, but controlled inflation.'
  ],
  facts:[
    'India\'s RBI targets consumer price inflation within a band, currently around 4% (+/‑2%), using the repo rate as its main tool.',
    'Hyperinflation episodes (Germany 1923, Zimbabwe 2008) occurred when governments printed money far faster than output could grow.',
    'Inflation and unemployment can trade off in the short run — economists call this relationship the Phillips Curve.'
  ],
  realWorld:[
    'RBI Monetary Policy Committee changing the repo rate to manage inflation.',
    'Fuel and food price shocks pushing up India\'s CPI basket.',
    'Fixed-deposit savers losing real value when inflation exceeds their interest rate.'
  ],
  teacherNote:'Use the "Real Interest Rate" metric to show students why a 6% FD is a bad deal when inflation is 8% — their savings actually lose purchasing power.',
  variables:[
    { key:'moneyGrowth', label:'Money Supply Growth', min:0, max:25, step:1, default:8, format:v=>v+'%' },
    { key:'outputGrowth', label:'Production / Real Output Growth', min:0, max:15, step:1, default:6, format:v=>v+'%' },
    { key:'govSpending', label:'Government Spending', min:0, max:100, step:5, default:50, format:v=>v },
    { key:'demand', label:'Consumer Demand', min:0, max:100, step:5, default:50, format:v=>v },
    { key:'interestRate', label:'Central Bank Interest Rate', min:0, max:15, step:0.5, default:6, format:v=>v+'%' },
  ],
  presets:[
    { name:'Stable Growth', values:{moneyGrowth:7,outputGrowth:7,govSpending:50,demand:50,interestRate:6} },
    { name:'Demand-Pull Boom', values:{moneyGrowth:16,outputGrowth:5,govSpending:80,demand:85,interestRate:5} },
    { name:'RBI Rate Hike Response', values:{moneyGrowth:10,outputGrowth:6,govSpending:55,demand:55,interestRate:12} },
    { name:'Recession / Deflationary Risk', values:{moneyGrowth:2,outputGrowth:2,govSpending:30,demand:25,interestRate:3} },
  ],
  compute(v){
    const velocityGrowth = (v.govSpending-50)*0.06 + (v.demand-50)*0.08 - (v.interestRate-6)*0.4;
    let inflation = VEcon.inflationEstimate(v.moneyGrowth, velocityGrowth, v.outputGrowth) + 1.5;
    inflation = VEcon.clamp(inflation, -4, 45);
    const realRate = v.interestRate - inflation;
    const purchasingSeries = VEcon.compoundSeries(100, -inflation, 10);
    const employment = VEcon.clamp(52 + v.demand*0.25 + v.govSpending*0.15 - v.interestRate*1.8 - Math.max(0,inflation-10)*0.6, 30, 96);

    return {
      metrics:[
        { label:'Estimated Inflation Rate', value:inflation.toFixed(1)+'%', deltaDir: inflation>6?'down':'up', delta: inflation>10?'High — cost of living rising fast':(inflation<0?'Deflation risk':'Manageable') },
        { label:'Real Interest Rate', value:realRate.toFixed(1)+'%', deltaDir: realRate>0?'up':'down', delta: realRate>0?'Savings gain value':'Savings lose value' },
        { label:'Purchasing Power (Year 10)', value:purchasingSeries[10].toFixed(0)+' of ₹100', deltaDir: purchasingSeries[10]>70?'up':'down' },
        { label:'Employment Index', value:employment.toFixed(0)+'/100', deltaDir: employment>60?'up':'down' },
      ],
      charts:[
        { type:'line', title:'Purchasing Power of ₹100 Over Time', sub:'At the current inflation rate, held for 10 years',
          legend:[{label:'Real value of ₹100',color:'#ffcc4d'}],
          spec:{ xr:{min:0,max:10}, yr:{min:0,max:110}, xLabel:'Years', yLabel:'Value (₹)',
            series:[{ points:purchasingSeries.map((p,i)=>[i,p]), color:'#ffcc4d', fill:'rgba(255,204,77,0.12)', width:2.5 }] }
        },
        { type:'bar', title:'Drivers of Inflation', sub:'Contribution of each factor (illustrative)',
          spec:{ yr:{min:-10,max:25}, yFmt:v=>v.toFixed(0)+'%',
            bars:[
              { label:'Money Supply', value:v.moneyGrowth, color:'#2f8fef' },
              { label:'Demand', value:(v.demand-50)*0.16, color:'#ffcc4d' },
              { label:'Govt. Spending', value:(v.govSpending-50)*0.12, color:'#ef5b5b' },
              { label:'Output Growth (–)', value:-v.outputGrowth, color:'#2ecc8f' },
              { label:'Interest Rate (–)', value:-(v.interestRate-6)*0.4, color:'#9fb0c9' },
            ] }
        }
      ],
      table:{
        headers:['Year','Purchasing Power of Original ₹100'],
        rows: purchasingSeries.map((p,i)=>[i, '₹'+p.toFixed(1)])
      },
      interpretation:`With money supply growing at ${v.moneyGrowth}% and real output at only ${v.outputGrowth}%, the model estimates inflation of about ${inflation.toFixed(1)}%. At a central bank interest rate of ${v.interestRate}%, the real interest rate is ${realRate.toFixed(1)}% — savers are ${realRate>=0?'gaining':'losing'} purchasing power. After 10 years at this rate, ₹100 today would be worth only about ₹${purchasingSeries[10].toFixed(0)} in real terms.`
    };
  },
  quiz:[
    { q:'Inflation is best defined as:', options:['A rise in one product\'s price','A sustained rise in the general price level','A fall in unemployment','An increase in exports'], correct:1, explain:'Inflation refers to a broad, sustained increase in the overall price level, not one good.' },
    { q:'"Too much money chasing too few goods" describes:', options:['Cost-push inflation','Demand-pull inflation','Deflation','Stagflation'], correct:1, explain:'Demand-pull inflation arises when aggregate demand outpaces the economy\'s output capacity.' },
    { q:'If inflation is 8% and your FD interest rate is 6%, your real return is:', options:['+14%','+2%','-2%','0%'], correct:2, explain:'Real interest rate = nominal rate − inflation = 6% − 8% = −2%.' },
    { q:'Central banks typically fight high inflation by:', options:['Cutting interest rates','Raising interest rates','Printing more money','Lowering taxes only'], correct:1, explain:'Higher interest rates discourage borrowing and spending, cooling demand-pull inflation.' },
    { q:'If output grows exactly as fast as money supply, inflation (all else equal) tends to be:', options:['Very high','Roughly stable','Always negative','Impossible to predict'], correct:1, explain:'When output keeps pace with money supply growth, the extra money is matched by extra goods, keeping prices roughly stable.' },
  ],
  summary:[
    'Inflation is a sustained rise in the general price level that erodes the purchasing power of money.',
    'Money supply growing faster than real output tends to push prices up (demand-pull inflation).',
    'The real interest rate (nominal rate minus inflation) determines whether savers actually gain or lose.',
    'Central banks use interest rates as a key tool to cool down or stimulate an overheating or sluggish economy.'
  ]
};
