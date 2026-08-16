/* ==========================================================================
   SIM 06 — BUDGET & PUBLIC FINANCE SIMULATOR
   ========================================================================== */
window.VEC_SIMS = window.VEC_SIMS || {};
window.VEC_SIMS['budget'] = {
  id:'budget', icon:'🏛️', tag:'Public Finance', tagClass:'finance', duration:'25–30 min',
  title:'Budget & Public Finance Simulator',
  shortDesc:'Play finance minister — balance revenue, borrowing and spending across education, health, infrastructure and more.',
  objectives:[
    'Distinguish between revenue receipts, capital receipts (borrowing) and total expenditure.',
    'Calculate the fiscal deficit and understand what it means for an economy.',
    'Evaluate trade-offs between different heads of government spending.',
    'Connect budget allocation choices to long-run development outcomes.'
  ],
  concept:[
    'A government <b>budget</b> is a statement of expected revenue and proposed expenditure for a financial year. <b>Revenue</b> mainly comes from taxes (direct and indirect) and non-tax sources (fees, dividends, disinvestment). When planned expenditure exceeds revenue, the government must cover the gap through <b>borrowing</b> — this gap is the <b>fiscal deficit</b>.',
    'A moderate, well-targeted fiscal deficit used to fund productive investment (infrastructure, education, health) can boost long-run growth. But a persistently high deficit raises the government\'s <b>debt burden</b>, increases future interest payments, and can crowd out private investment or fuel inflation.',
    'Every rupee allocated to one head (say Defence) is a rupee not available for another (say Healthcare) — this is the <b>opportunity cost</b> of budget-making. Economists and planners try to allocate spending where it generates the greatest social and economic return.'
  ],
  misconceptions:[
    'A fiscal deficit is not automatically "bad" — it depends on what the borrowed money is spent on (productive investment vs unproductive consumption).',
    'Government "borrowing" is not the same as printing money — it usually means selling bonds that must be repaid with interest.',
    'Cutting all social spending does not guarantee faster growth — under-investment in health and education can hurt long-run productivity.'
  ],
  facts:[
    'India\'s Union Budget is presented every year on 1 February and covers estimated revenue and expenditure for the coming fiscal year (April–March).',
    'The Fiscal Responsibility and Budget Management (FRBM) Act sets targets to keep India\'s fiscal deficit within sustainable limits.',
    'Capital expenditure (like roads, railways) tends to have a much larger growth multiplier than routine revenue expenditure.'
  ],
  realWorld:[
    'Union and State Budgets allocating funds to schemes like PM-KISAN, Ayushman Bharat and PM Gati Shakti.',
    'The Finance Commission deciding how tax revenue is shared between the Centre and States.',
    'Credit rating agencies watching a country\'s fiscal deficit before rating its government bonds.'
  ],
  teacherNote:'Run this as a role-play: split the class into "ministries" that must each lobby for a bigger share, then debate trade-offs before finalising sliders together.',
  variables:[
    { key:'taxRevenue', label:'Tax Revenue', min:200, max:1000, step:20, default:560, format:v=>'₹'+v+'k cr' },
    { key:'nonTaxRevenue', label:'Non-Tax Revenue', min:20, max:300, step:10, default:120, format:v=>'₹'+v+'k cr' },
    { key:'borrowing', label:'Borrowing (Deficit Financing)', min:0, max:400, step:10, default:150, format:v=>'₹'+v+'k cr' },
    { key:'education', label:'Education Allocation', min:0, max:100, step:5, default:60, format:v=>v },
    { key:'healthcare', label:'Healthcare Allocation', min:0, max:100, step:5, default:55, format:v=>v },
    { key:'infrastructure', label:'Infrastructure Allocation', min:0, max:100, step:5, default:65, format:v=>v },
    { key:'agriculture', label:'Agriculture Allocation', min:0, max:100, step:5, default:45, format:v=>v },
    { key:'defence', label:'Defence Allocation', min:0, max:100, step:5, default:50, format:v=>v },
    { key:'environment', label:'Environment Allocation', min:0, max:100, step:5, default:30, format:v=>v },
    { key:'socialWelfare', label:'Social Welfare Allocation', min:0, max:100, step:5, default:45, format:v=>v },
  ],
  presets:[
    { name:'Balanced Budget', values:{taxRevenue:560,nonTaxRevenue:120,borrowing:0,education:55,healthcare:55,infrastructure:55,agriculture:45,defence:45,environment:35,socialWelfare:45} },
    { name:'Human Development Push', values:{taxRevenue:560,nonTaxRevenue:120,borrowing:150,education:90,healthcare:90,infrastructure:40,agriculture:35,defence:30,environment:40,socialWelfare:70} },
    { name:'Infrastructure-Led Growth', values:{taxRevenue:560,nonTaxRevenue:120,borrowing:220,education:40,healthcare:40,infrastructure:95,agriculture:40,defence:40,environment:25,socialWelfare:35} },
    { name:'Fiscal Austerity', values:{taxRevenue:560,nonTaxRevenue:120,borrowing:20,education:35,healthcare:35,infrastructure:35,agriculture:30,defence:35,environment:20,socialWelfare:30} },
  ],
  compute(v){
    const totalRevenue = v.taxRevenue + v.nonTaxRevenue;
    const totalExpenditure = totalRevenue + v.borrowing;
    const deficitPct = (v.borrowing/totalRevenue)*100;

    const sectors = [
      { key:'education', label:'Education', color:'#2f8fef', impact:1.15 },
      { key:'healthcare', label:'Healthcare', color:'#ef5b5b', impact:1.05 },
      { key:'infrastructure', label:'Infrastructure', color:'#0d47a1', impact:1.1 },
      { key:'agriculture', label:'Agriculture', color:'#43a047', impact:0.85 },
      { key:'defence', label:'Defence', color:'#5b6b85', impact:0.4 },
      { key:'environment', label:'Environment', color:'#2ecc8f', impact:0.7 },
      { key:'socialWelfare', label:'Social Welfare', color:'#ffb300', impact:0.75 },
    ];
    const totalWeight = sectors.reduce((a,s)=>a+v[s.key],0) || 1;
    let devScore = 0;
    const rows = sectors.map(s=>{
      const amount = totalExpenditure * (v[s.key]/totalWeight);
      const contribution = amount * s.impact;
      devScore += contribution;
      return { ...s, amount, pct: (v[s.key]/totalWeight)*100, contribution };
    });
    const developmentIndex = VEcon.clamp((devScore / totalExpenditure) * 55, 10, 99);
    const debtSustainability = VEcon.clamp(100 - deficitPct*1.4, 5, 99);

    return {
      metrics:[
        { label:'Total Revenue', value:'₹'+totalRevenue.toFixed(0)+'k cr' },
        { label:'Total Expenditure', value:'₹'+totalExpenditure.toFixed(0)+'k cr' },
        { label:'Fiscal Deficit', value: deficitPct.toFixed(1)+'% of revenue', deltaDir: deficitPct>40?'down':'up' },
        { label:'Development Index', value: developmentIndex.toFixed(0)+'/100', deltaDir: developmentIndex>55?'up':'down' },
      ],
      charts:[
        { type:'donut', title:'Expenditure Allocation by Sector', sub:'Share of total budget outlay',
          legend: rows.map(r=>({label:r.label,color:r.color})),
          spec:{ centerLabel:'₹'+totalExpenditure.toFixed(0)+'k cr', slices: rows.map(r=>({value:r.amount, color:r.color})) }
        },
        { type:'bar', title:'Revenue vs Expenditure vs Deficit', sub:'All figures in ₹ thousand crore',
          spec:{ yr:{min:0, max: totalExpenditure+100}, yFmt:v=>'₹'+v.toFixed(0),
            bars:[
              { label:'Tax Revenue', value:v.taxRevenue, color:'#2ecc8f' },
              { label:'Non-Tax Rev.', value:v.nonTaxRevenue, color:'#6fe0b8' },
              { label:'Borrowing', value:v.borrowing, color:'#ef5b5b' },
              { label:'Total Expenditure', value:totalExpenditure, color:'#2f8fef' },
            ] }
        }
      ],
      table:{
        headers:['Sector','Allocation Weight','Amount (₹k cr)','% of Budget'],
        rows: rows.map(r=>[r.label, v[r.key], r.amount.toFixed(0), r.pct.toFixed(1)+'%'])
      },
      interpretation:`Total revenue of ₹${totalRevenue.toFixed(0)}k crore plus ₹${v.borrowing}k crore of borrowing funds a total expenditure of ₹${totalExpenditure.toFixed(0)}k crore — a fiscal deficit of ${deficitPct.toFixed(1)}% of revenue. ${deficitPct>50?'This is a fairly aggressive deficit — sustainable only if borrowed funds go into high-return investment like infrastructure and education.':'This deficit level looks broadly manageable.'} The current allocation mix produces a Development Index of ${developmentIndex.toFixed(0)}/100, reflecting spending weighted toward ${rows.slice().sort((a,b)=>b.pct-a.pct)[0].label}.`
    };
  },
  quiz:[
    { q:'A fiscal deficit occurs when:', options:['Revenue exceeds expenditure','Expenditure exceeds revenue','Exports exceed imports','Taxes are abolished'], correct:1, explain:'A fiscal deficit is the gap when total expenditure exceeds total revenue, financed by borrowing.' },
    { q:'Which of these is a non-tax revenue source?', options:['Income tax','GST','Dividends from public sector companies','Corporate tax'], correct:2, explain:'Dividends, fees and disinvestment proceeds are non-tax revenue; the others are taxes.' },
    { q:'Borrowed money spent on productive infrastructure is generally considered:', options:['Always wasteful','Potentially growth-enhancing if well-targeted','Illegal','The same as printing money'], correct:1, explain:'Productive capital spending can boost future growth, helping justify some borrowing.' },
    { q:'Opportunity cost in budgeting means:', options:['The interest paid on loans','What is given up by allocating funds elsewhere','The total tax collected','The inflation rate'], correct:1, explain:'Every rupee spent on one head is a rupee not spent on an alternative — its opportunity cost.' },
    { q:'A persistently very high fiscal deficit mainly risks:', options:['Lower future debt burden','Higher government debt and interest burden','Guaranteed faster growth','No consequences'], correct:1, explain:'Sustained high deficits raise debt levels and future interest obligations.' },
  ],
  summary:[
    'A budget balances revenue (tax + non-tax) against planned expenditure, with any gap covered by borrowing.',
    'The fiscal deficit measures how much a government spends beyond its revenue.',
    'Every allocation decision carries an opportunity cost — funding one sector means less for another.',
    'Well-targeted spending on human capital and infrastructure can raise a Development Index even under a deficit.'
  ]
};
