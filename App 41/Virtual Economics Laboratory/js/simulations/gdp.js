/* ==========================================================================
   SIM 05 — GDP & NATIONAL INCOME STUDIO
   ========================================================================== */
window.VEC_SIMS = window.VEC_SIMS || {};
window.VEC_SIMS['gdp'] = {
  id:'gdp', icon:'🏗️', tag:'Macroeconomics', tagClass:'macro', duration:'25 min',
  title:'GDP & National Income Studio',
  shortDesc:'Build an economy by managing agriculture, industry, services, investment and trade — watch GDP and per-capita income respond.',
  objectives:[
    'Calculate GDP using both the production (sectoral) and expenditure approaches.',
    'Explain the difference between GDP and per capita income.',
    'Understand how investment, government spending and net exports contribute to national income.',
    'Interpret sectoral composition of an economy and how it changes with development.'
  ],
  concept:[
    '<b>GDP (Gross Domestic Product)</b> measures the total value of final goods and services produced within a country in a year. It can be measured by adding up value added across sectors (<b>agriculture, industry, services</b>) — the <b>production approach</b> — or by adding up spending: <b>GDP = C + I + G + (X − M)</b>, where C is consumption, I is investment, G is government expenditure, and (X−M) is net exports — the <b>expenditure approach</b>. Both should arrive at (roughly) the same total.',
    '<b>Per capita income</b> divides national income by population, giving a rough sense of average income — but it says nothing about how income is actually distributed between rich and poor.',
    'As economies develop, the share of <b>agriculture</b> in GDP typically shrinks while <b>industry</b> and especially <b>services</b> grow — a pattern called <b>structural transformation</b>, clearly visible in India\'s own growth story since 1991.'
  ],
  misconceptions:[
    'GDP growth does not automatically mean every citizen is better off — it says nothing about income distribution or inequality.',
    'A trade deficit (imports > exports) does not automatically mean an economy is "losing" — it can reflect strong domestic investment demand.',
    'GDP measures market production, not overall wellbeing — it excludes unpaid work, leisure, and environmental costs.'
  ],
  facts:[
    'The services sector now contributes over half of India\'s GDP, more than agriculture and industry combined.',
    'India became the world\'s fifth-largest economy by nominal GDP in the 2020s, though its per-capita income remains far lower than developed nations.',
    'GDP figures are typically revised as more complete data becomes available — first estimates are never final.'
  ],
  realWorld:[
    'Quarterly GDP growth figures released by India\'s National Statistical Office (NSO).',
    'Union Budget allocations to infrastructure counted as government investment (I and G).',
    'India\'s IT and services exports contributing positively to net exports (X−M).'
  ],
  teacherNote:'Ask students to compute GDP by hand from the sector sliders, then compare with the expenditure-side bar chart — reinforcing that both approaches should broadly agree.',
  variables:[
    { key:'agriculture', label:'Agriculture Output', min:0, max:100, step:5, default:45, format:v=>v },
    { key:'industry', label:'Industry Output', min:0, max:100, step:5, default:55, format:v=>v },
    { key:'services', label:'Services Output', min:0, max:100, step:5, default:65, format:v=>v },
    { key:'investment', label:'Investment', min:0, max:100, step:5, default:50, format:v=>v },
    { key:'govExpenditure', label:'Government Expenditure', min:0, max:100, step:5, default:50, format:v=>v },
    { key:'exports', label:'Exports', min:0, max:100, step:5, default:45, format:v=>v },
    { key:'imports', label:'Imports', min:0, max:100, step:5, default:50, format:v=>v },
    { key:'population', label:'Population (millions, relative)', min:20, max:200, step:10, default:140, format:v=>v },
  ],
  presets:[
    { name:'Balanced Baseline', values:{agriculture:45,industry:55,services:65,investment:50,govExpenditure:50,exports:45,imports:50,population:140} },
    { name:'Services-Led Growth', values:{agriculture:30,industry:50,services:95,investment:65,govExpenditure:45,exports:70,imports:55,population:140} },
    { name:'Industrial Push', values:{agriculture:35,industry:95,services:55,investment:80,govExpenditure:60,exports:60,imports:50,population:140} },
    { name:'Agrarian Economy', values:{agriculture:90,industry:30,services:35,investment:30,govExpenditure:35,exports:35,imports:30,population:140} },
  ],
  compute(v){
    const agriVA = v.agriculture*9, indVA = v.industry*11, servVA = v.services*13;
    const gdpProduction = agriVA + indVA + servVA; // ₹ thousand crore (illustrative units)

    const C = gdpProduction*0.56;
    const I = v.investment*9;
    const G = v.govExpenditure*7;
    const NX = (v.exports - v.imports)*6;
    const gdpExpenditure = C + I + G + NX;

    const perCapita = (gdpProduction*10000000) / (v.population*10); // illustrative ₹ per person
    const baseline = 45*9+55*11+65*13;
    const growth = ((gdpProduction-baseline)/baseline)*100;
    const employment = VEcon.clamp(50 + v.industry*0.2 + v.services*0.25 + v.agriculture*0.1 - 10, 20, 98);

    return {
      metrics:[
        { label:'GDP (Production Approach)', value:'₹'+gdpProduction.toFixed(0)+'k cr' },
        { label:'GDP (Expenditure Approach)', value:'₹'+gdpExpenditure.toFixed(0)+'k cr' },
        { label:'Per Capita Income', value:VEcon.fmtINR(perCapita) },
        { label:'Growth vs Baseline', value:VEcon.fmtPct(growth), deltaDir: growth>=0?'up':'down' },
      ],
      charts:[
        { type:'donut', title:'Sectoral Composition of GDP', sub:'Share of value added by sector',
          legend:[{label:'Agriculture',color:'#43a047'},{label:'Industry',color:'#0d47a1'},{label:'Services',color:'#ffb300'}],
          spec:{ centerLabel:'₹'+gdpProduction.toFixed(0)+'k cr', slices:[
            { value:agriVA, color:'#43a047' }, { value:indVA, color:'#0d47a1' }, { value:servVA, color:'#ffb300' }
          ] }
        },
        { type:'bar', title:'GDP by Expenditure Component', sub:'C + I + G + (X − M)',
          spec:{ yr:{min:Math.min(0,NX), max: Math.max(C,I,G)+50}, yFmt:v=>'₹'+v.toFixed(0),
            bars:[
              { label:'Consumption', value:C, color:'#2f8fef' },
              { label:'Investment', value:I, color:'#2ecc8f' },
              { label:'Govt. Spend', value:G, color:'#ffb300' },
              { label:'Net Exports', value:NX, color: NX>=0?'#2ecc8f':'#ef5b5b' },
            ] }
        }
      ],
      table:{
        headers:['Sector','Output Level','Value Added (₹k cr)','% of GDP'],
        rows:[
          ['Agriculture', v.agriculture, agriVA.toFixed(0), ((agriVA/gdpProduction)*100).toFixed(1)+'%'],
          ['Industry', v.industry, indVA.toFixed(0), ((indVA/gdpProduction)*100).toFixed(1)+'%'],
          ['Services', v.services, servVA.toFixed(0), ((servVA/gdpProduction)*100).toFixed(1)+'%'],
        ]
      },
      interpretation:`This economy produces an estimated ₹${gdpProduction.toFixed(0)}k crore of GDP, with services contributing the largest share (${((servVA/gdpProduction)*100).toFixed(0)}%). Per-capita income works out to roughly ${VEcon.fmtINR(perCapita)}. Net exports are ${NX>=0?'positive':'negative'} (₹${NX.toFixed(0)}k cr), meaning the economy is a ${NX>=0?'net exporter':'net importer'} at these settings. Growth versus the balanced baseline economy is ${VEcon.fmtPct(growth)}.`
    };
  },
  quiz:[
    { q:'GDP by the expenditure approach is calculated as:', options:['C + I + G + (X−M)','Agriculture + Industry only','Exports − Imports only','Population × Income'], correct:0, explain:'The expenditure approach sums consumption, investment, government spending and net exports.' },
    { q:'Per capita income is calculated by:', options:['GDP × Population','GDP ÷ Population','Population ÷ GDP','GDP − Population'], correct:1, explain:'Dividing total national income by population gives the average income per person.' },
    { q:'As economies develop, which sector\'s GDP share usually grows the most?', options:['Agriculture','Industry','Services','None change'], correct:2, explain:'Structural transformation typically sees services become the dominant sector as economies develop.' },
    { q:'A negative net exports (X−M) figure means the economy:', options:['Exports more than it imports','Imports more than it exports','Has no trade','Has zero GDP'], correct:1, explain:'Negative net exports mean imports exceed exports — a trade deficit.' },
    { q:'GDP growth alone tells us:', options:['Exactly how equally income is distributed','Only the size/change of total output, not distribution','Nothing about the economy','The exact unemployment rate'], correct:1, explain:'GDP measures the scale of output/income, not how it is shared among people.' },
  ],
  summary:[
    'GDP can be measured via the production (sectoral) approach or the expenditure approach (C+I+G+NX).',
    'Per capita income divides GDP by population but does not reveal income distribution.',
    'Economic development is typically accompanied by a shift from agriculture toward industry and services.',
    'Net exports (X−M) can add to or subtract from GDP depending on the trade balance.'
  ]
};
