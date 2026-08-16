/* ==========================================================================
   SIM 09 — CONSUMER BEHAVIOUR LABORATORY
   ========================================================================== */
window.VEC_SIMS = window.VEC_SIMS || {};
window.VEC_SIMS['consumer'] = {
  id:'consumer', icon:'🛒', tag:'Microeconomics', tagClass:'micro', duration:'20 min',
  title:'Consumer Behaviour Laboratory',
  shortDesc:'Build a household budget across income levels and family sizes — see spending patterns, savings and opportunity costs unfold.',
  objectives:[
    'Explain Engel\'s Law and how spending patterns change as income rises.',
    'Apply the concept of opportunity cost to household budgeting decisions.',
    'Compare a household\'s budget against the 50/30/20 needs-wants-savings guideline.',
    'Understand how family size and cost of living affect real purchasing power.'
  ],
  concept:[
    '<b>Engel\'s Law</b> observes that as household income rises, the <b>percentage</b> spent on food falls, even though the actual rupee amount spent on food may rise. This happens because basic needs get satisfied first, freeing up a larger share of extra income for other goods and savings.',
    'Every spending choice carries an <b>opportunity cost</b> — money spent on discretionary items (eating out, entertainment) is money not available for savings or other needs. Rational households weigh marginal utility per rupee across categories to decide how to allocate a limited budget.',
    'A common financial-literacy guideline is the <b>50/30/20 rule</b>: roughly 50% of income to needs (food, housing, essential bills), 30% to wants (discretionary spending), and 20% to savings/debt repayment — though real households vary a lot based on income, family size, and local cost of living.'
  ],
  misconceptions:[
    'Engel\'s Law is about the <em>share</em> of income spent on food falling — not necessarily the actual amount spent, which can still rise.',
    'A larger income does not automatically mean higher savings — spending habits and family size matter just as much.',
    'Opportunity cost is not just about money — it also includes time and alternatives given up.'
  ],
  facts:[
    'Engel\'s Law is named after 19th-century statistician Ernst Engel, who studied Belgian household budgets.',
    'Rising cost-of-living indices can shrink real purchasing power even if nominal income stays the same.',
    'Financial literacy programmes increasingly teach the 50/30/20 rule as a simple budgeting starting point.'
  ],
  realWorld:[
    'Indian household consumption expenditure surveys tracking food vs non-food spending shares over decades.',
    'Urban families adjusting budgets as school fees and rent rise with family size and city cost of living.',
    'Financial advisors recommending emergency funds and SIPs as part of the "savings" bucket.'
  ],
  teacherNote:'Ask students to compute their own family\'s rough needs/wants/savings split and compare it to the 50/30/20 benchmark shown in the bar chart.',
  variables:[
    { key:'income', label:'Monthly Household Income', min:15000, max:150000, step:5000, default:40000, format:v=>'₹'+v.toLocaleString('en-IN') },
    { key:'familySize', label:'Family Size', min:2, max:8, step:1, default:4, format:v=>v+' members' },
    { key:'priceLevel', label:'Local Cost of Living Index', min:80, max:140, step:5, default:100, format:v=>v },
    { key:'savingsGoal', label:'Savings Priority', min:0, max:100, step:5, default:40, format:v=>v },
    { key:'luxuryPreference', label:'Preference for Discretionary / Luxury Spend', min:0, max:100, step:5, default:30, format:v=>v },
  ],
  presets:[
    { name:'Lower-Income Household', values:{income:20000,familySize:5,priceLevel:100,savingsGoal:20,luxuryPreference:15} },
    { name:'Middle-Income Household', values:{income:55000,familySize:4,priceLevel:105,savingsGoal:40,luxuryPreference:30} },
    { name:'Higher-Income Household', values:{income:130000,familySize:3,priceLevel:115,savingsGoal:55,luxuryPreference:45} },
    { name:'High Cost-of-Living City', values:{income:60000,familySize:4,priceLevel:135,savingsGoal:30,luxuryPreference:25} },
  ],
  compute(v){
    const realIncome = v.income * (100/v.priceLevel);
    const foodPct = VEcon.clamp(46 - (v.income/3200) + v.familySize*1.4, 12, 62);
    const housingPct = VEcon.clamp(18 + (v.familySize-4)*1.6 + (v.priceLevel-100)*0.15, 12, 34);
    const educationPct = VEcon.clamp(7 + v.familySize*1.1, 4, 20);
    const savingsPct = VEcon.clamp(v.savingsGoal*0.32, 2, 34);
    let remaining = 100 - foodPct - housingPct - educationPct - savingsPct;
    remaining = Math.max(0, remaining);
    const discretionaryPct = remaining;

    const foodAmt = v.income*foodPct/100, housingAmt = v.income*housingPct/100, eduAmt = v.income*educationPct/100;
    const savingsAmt = v.income*savingsPct/100, discAmt = v.income*discretionaryPct/100;

    const needsPct = foodPct+housingPct+educationPct;
    const wantsPct = discretionaryPct;

    return {
      metrics:[
        { label:'Real Purchasing Power', value:VEcon.fmtINR(realIncome)+'/mo', deltaDir: realIncome>=v.income?'up':'down' },
        { label:'Food Expenditure Share', value:foodPct.toFixed(1)+'%', delta:'Engel\'s Law indicator' },
        { label:'Monthly Savings', value:VEcon.fmtINR(savingsAmt), deltaDir: savingsPct>=20?'up':'down' },
        { label:'Discretionary / Luxury Spend', value:VEcon.fmtINR(discAmt) },
      ],
      charts:[
        { type:'donut', title:'Household Budget Allocation', sub:'Where this month\'s income goes',
          legend:[{label:'Food',color:'#ef5b5b'},{label:'Housing',color:'#0d47a1'},{label:'Education',color:'#2f8fef'},{label:'Savings',color:'#2ecc8f'},{label:'Discretionary',color:'#ffb300'}],
          spec:{ centerLabel:'₹'+v.income.toLocaleString('en-IN'), slices:[
            {value:foodAmt,color:'#ef5b5b'},{value:housingAmt,color:'#0d47a1'},{value:eduAmt,color:'#2f8fef'},{value:savingsAmt,color:'#2ecc8f'},{value:discAmt,color:'#ffb300'}
          ] }
        },
        { type:'bar', title:'Needs vs Wants vs Savings', sub:'Compared to the 50/30/20 financial-literacy guideline',
          spec:{ yr:{min:0,max:70}, yFmt:v=>v.toFixed(0)+'%',
            bars:[
              { label:'Needs (This HH)', value:needsPct, color:'#2f8fef' },
              { label:'Needs (Guideline 50%)', value:50, color:'#9fb0c9' },
              { label:'Wants (This HH)', value:wantsPct, color:'#ffb300' },
              { label:'Savings (This HH)', value:savingsPct, color:'#2ecc8f' },
              { label:'Savings (Guideline 20%)', value:20, color:'#9fb0c9' },
            ] }
        }
      ],
      table:{
        headers:['Category','Monthly Amount','% of Income'],
        rows:[
          ['Food', VEcon.fmtINR(foodAmt), foodPct.toFixed(1)+'%'],
          ['Housing', VEcon.fmtINR(housingAmt), housingPct.toFixed(1)+'%'],
          ['Education', VEcon.fmtINR(eduAmt), educationPct.toFixed(1)+'%'],
          ['Savings', VEcon.fmtINR(savingsAmt), savingsPct.toFixed(1)+'%'],
          ['Discretionary', VEcon.fmtINR(discAmt), discretionaryPct.toFixed(1)+'%'],
        ]
      },
      interpretation:`This household spends ${foodPct.toFixed(1)}% of income on food — ${foodPct>35?'a relatively high share typical of lower-income households under Engel\'s Law':'a relatively modest share typical of higher-income households under Engel\'s Law'}. Needs (food + housing + education) take up ${needsPct.toFixed(0)}% of income against the common 50% guideline, while savings sit at ${savingsPct.toFixed(0)}% against the 20% guideline. Real purchasing power, after adjusting for the local cost-of-living index of ${v.priceLevel}, is ${VEcon.fmtINR(realIncome)} per month.`
    };
  },
  quiz:[
    { q:'Engel\'s Law states that as income rises:', options:['Food spending share rises','Food spending share falls','Food spending stays exactly fixed','Savings always fall'], correct:1, explain:'Engel\'s Law: the percentage of income spent on food tends to fall as income rises, even if the actual amount spent may rise.' },
    { q:'Opportunity cost of spending ₹1,000 on entertainment is:', options:['Always ₹1,000 in cash','The next best alternative given up, like savings','Zero, since it was already earned','The GST paid on the purchase'], correct:1, explain:'Opportunity cost is the value of the next best alternative forgone, not just the rupee amount spent.' },
    { q:'The 50/30/20 rule roughly recommends:', options:['50% wants, 30% needs, 20% savings','50% needs, 30% wants, 20% savings','50% savings, 30% needs, 20% wants','100% needs, no savings'], correct:1, explain:'The common guideline allocates about 50% to needs, 30% to wants, and 20% to savings.' },
    { q:'A rise in the local cost-of-living index (with income unchanged) causes:', options:['Real purchasing power to rise','Real purchasing power to fall','No change to real income','Savings to automatically rise'], correct:1, explain:'Higher prices with the same nominal income reduce what that income can actually buy — lower real purchasing power.' },
    { q:'A larger family size, all else equal, tends to:', options:['Reduce housing and education spending needs','Increase housing and education spending needs','Have no budget effect','Automatically increase savings'], correct:1, explain:'More family members generally raise essential spending needs like housing space and education costs.' },
  ],
  summary:[
    'Engel\'s Law shows the share of income spent on food falls as income rises, even if the rupee amount grows.',
    'Every spending decision has an opportunity cost — the next best alternative given up.',
    'The 50/30/20 rule is a simple benchmark for splitting income between needs, wants and savings.',
    'Real purchasing power depends not just on income but also on the local cost of living.'
  ]
};
