/* ==========================================================================
   SIM 07 — TAXATION LABORATORY
   ========================================================================== */
window.VEC_SIMS = window.VEC_SIMS || {};
window.VEC_SIMS['taxation'] = {
  id:'taxation', icon:'🧾', tag:'Public Finance', tagClass:'finance', duration:'20–25 min',
  title:'Taxation Laboratory',
  shortDesc:'Adjust direct tax rates, GST and compliance — compare how progressive and indirect taxes fall differently on rich and poor.',
  objectives:[
    'Distinguish between direct taxes (like income tax) and indirect taxes (like GST).',
    'Explain what makes a tax progressive, proportional, or regressive.',
    'Calculate effective tax rates for taxpayers at different income levels.',
    'Understand how compliance and evasion affect government revenue.'
  ],
  concept:[
    '<b>Direct taxes</b> (like income tax) are paid straight to the government by the person who bears the burden — richer taxpayers usually pay a higher percentage, making them typically <b>progressive</b>. <b>Indirect taxes</b> (like GST) are levied on goods and services and collected via sellers; because poorer households spend a larger share of their income on consumption, indirect taxes tend to be <b>regressive</b> in effect, even though the rate is technically the same for everyone.',
    'A tax system\'s fairness is often judged using these categories: <b>progressive</b> (effective rate rises with income), <b>proportional</b> (same rate regardless of income), and <b>regressive</b> (effective rate falls as income rises).',
    '<b>Tax compliance</b> — the share of tax legally owed that is actually collected — matters enormously for government revenue. Low compliance (due to evasion or a large informal economy) can force higher tax rates on compliant taxpayers just to meet the same revenue target.'
  ],
  misconceptions:[
    'GST at "the same rate for everyone" is not automatically fair — because poorer households spend a larger share of income on taxed goods, its real-world burden is regressive.',
    'Raising the tax rate does not always raise total revenue — beyond a point, high rates can reduce compliance and business activity (related to the idea behind the Laffer Curve).',
    'Direct and indirect taxes are not interchangeable — they have very different effects on different income groups.'
  ],
  facts:[
    'India\'s GST replaced multiple indirect taxes (VAT, excise, service tax) with a unified structure with slabs like 5%, 12%, 18% and 28%.',
    'India\'s income tax system uses progressive slab rates, with 0% tax on the lowest income band.',
    'A large informal/cash economy is one reason India historically has had a relatively low direct tax-to-GDP ratio compared to some developed nations.'
  ],
  realWorld:[
    'GST rates on essential vs luxury goods (lower rates on food staples, higher on luxury cars).',
    'Income Tax Department compliance drives and PAN-Aadhaar linkage to widen the tax base.',
    'Tax rebates (like Section 87A) designed to reduce the burden on lower incomes.'
  ],
  teacherNote:'Use the Low vs High income effective-rate bars to spark discussion on whether India should rely more on direct or indirect taxes to fund public services fairly.',
  variables:[
    { key:'income', label:'Representative Annual Income', min:300000, max:2500000, step:50000, default:900000, format:v=>'₹'+(v/100000).toFixed(1)+'L' },
    { key:'directMultiplier', label:'Direct Tax Rate Adjustment', min:50, max:150, step:5, default:100, format:v=>v+'%' },
    { key:'indirectRate', label:'Indirect Tax (GST) Rate', min:0, max:28, step:1, default:18, format:v=>v+'%' },
    { key:'compliance', label:'Tax Compliance Rate', min:30, max:100, step:5, default:75, format:v=>v+'%' },
    { key:'spendEfficiency', label:'Public Spending Efficiency', min:20, max:100, step:5, default:60, format:v=>v+'%' },
  ],
  presets:[
    { name:'Current Policy (Baseline)', values:{income:900000,directMultiplier:100,indirectRate:18,compliance:75,spendEfficiency:60} },
    { name:'High Direct Tax, Low GST', values:{income:900000,directMultiplier:140,indirectRate:8,compliance:80,spendEfficiency:65} },
    { name:'Low Direct Tax, High GST', values:{income:900000,directMultiplier:60,indirectRate:26,compliance:70,spendEfficiency:55} },
    { name:'Weak Compliance / Informal Economy', values:{income:900000,directMultiplier:100,indirectRate:18,compliance:35,spendEfficiency:45} },
  ],
  compute(v){
    const baseSlabs = [
      {upto:300000, rate:0}, {upto:600000, rate:5}, {upto:900000, rate:10},
      {upto:1200000, rate:15}, {upto:1500000, rate:20}, {upto:Infinity, rate:30}
    ];
    const slabs = baseSlabs.map(s=>({ upto:s.upto, rate: s.rate * (v.directMultiplier/100) }));

    function segmentTax(income){
      return VEcon.progressiveTax(income, slabs);
    }
    const lowIncome = Math.max(150000, v.income/6);
    const midIncome = v.income;
    const highIncome = v.income*2.4;

    const consumptionShare = { low:0.85, mid:0.62, high:0.38 };
    function indirectPaid(income, share){ return income*share*(v.indirectRate/100); }

    const rows = [
      { label:'Low Income', income:lowIncome, direct: segmentTax(lowIncome), indirect: indirectPaid(lowIncome, consumptionShare.low) },
      { label:'Middle Income', income:midIncome, direct: segmentTax(midIncome), indirect: indirectPaid(midIncome, consumptionShare.mid) },
      { label:'High Income', income:highIncome, direct: segmentTax(highIncome), indirect: indirectPaid(highIncome, consumptionShare.high) },
    ].map(r=>({ ...r, effectiveRate: ((r.direct+r.indirect)/r.income)*100 }));

    const directOwed = segmentTax(midIncome);
    const directCollected = directOwed * (v.compliance/100);
    const revenueLost = directOwed - directCollected;
    const servicesDelivered = (directCollected + indirectPaid(midIncome, consumptionShare.mid)) * (v.spendEfficiency/100);

    const progressivity = rows[2].effectiveRate - rows[0].effectiveRate;

    return {
      metrics:[
        { label:'Direct Tax Owed (Middle Income)', value:VEcon.fmtINR(directOwed) },
        { label:'Direct Tax Collected', value:VEcon.fmtINR(directCollected), deltaDir: v.compliance>70?'up':'down' },
        { label:'Revenue Lost to Non-Compliance', value:VEcon.fmtINR(revenueLost), deltaDir: revenueLost<directOwed*0.15?'up':'down' },
        { label:'System Progressivity', value: progressivity.toFixed(1)+' pts', deltaDir: progressivity>0?'up':'down', delta: progressivity>0?'Progressive':'Regressive overall' },
      ],
      charts:[
        { type:'bar', title:'Effective Tax Rate by Income Group', sub:'(Direct + Indirect Tax) ÷ Income × 100',
          spec:{ yr:{min:0,max:Math.max(...rows.map(r=>r.effectiveRate))+8}, yFmt:v=>v.toFixed(0)+'%',
            bars: rows.map((r,i)=>({label:r.label, value:r.effectiveRate, color:['#ef5b5b','#ffb300','#2ecc8f'][i]})) }
        },
        { type:'bar', title:'Tax Burden Composition (Middle Income)', sub:'Direct vs indirect tax paid',
          spec:{ yr:{min:0,max: rows[1].direct+rows[1].indirect+2000}, yFmt:v=>'₹'+v.toFixed(0),
            bars:[
              { label:'Direct Tax', value:rows[1].direct, color:'#2f8fef' },
              { label:'Indirect Tax (GST)', value:rows[1].indirect, color:'#ffb300' },
              { label:'Collected (after compliance)', value:directCollected+indirectPaid(midIncome,consumptionShare.mid), color:'#2ecc8f' },
            ] }
        }
      ],
      table:{
        headers:['Income Group','Annual Income','Direct Tax','Indirect Tax (GST)','Effective Rate'],
        rows: rows.map(r=>[r.label, VEcon.fmtINR(r.income), VEcon.fmtINR(r.direct), VEcon.fmtINR(r.indirect), r.effectiveRate.toFixed(1)+'%'])
      },
      interpretation:`At current settings, the effective tax rate rises from ${rows[0].effectiveRate.toFixed(1)}% for low-income earners to ${rows[2].effectiveRate.toFixed(1)}% for high-income earners — a ${progressivity>0?'progressive':'regressive'} system overall (gap of ${Math.abs(progressivity).toFixed(1)} percentage points). Because poorer households spend a much larger share of income on GST-taxed consumption, raising the indirect tax rate makes the system relatively more regressive, while raising the direct tax multiplier makes it more progressive. Only ${v.compliance}% compliance means ${VEcon.fmtINR(revenueLost)} of owed direct tax from a middle-income earner goes uncollected.`
    };
  },
  quiz:[
    { q:'A progressive tax is one where:', options:['Everyone pays the same rate','The effective rate rises as income rises','The effective rate falls as income rises','Only the poor pay tax'], correct:1, explain:'Progressive taxes take a larger percentage of income from higher earners.' },
    { q:'GST is generally considered:', options:['Strictly progressive','Regressive in effect','Illegal in India','A direct tax'], correct:1, explain:'Because poorer households spend more of their income on consumption, GST tends to be regressive in effect.' },
    { q:'Income tax is an example of a:', options:['Indirect tax','Direct tax','Tariff','Subsidy'], correct:1, explain:'Income tax is paid directly by the taxpayer to the government based on income — a direct tax.' },
    { q:'Low tax compliance mainly results in:', options:['Higher government revenue','Lower government revenue than owed','No effect on revenue','Automatic tax cuts'], correct:1, explain:'When compliance is low, the government collects less than the amount legally owed.' },
    { q:'Which best reduces the regressive impact of indirect taxes on the poor?', options:['Raising GST on all goods equally','Exempting or taxing essential goods at lower rates','Removing all direct taxes','Abolishing income tax slabs'], correct:1, explain:'Lower or zero GST rates on essentials reduce the burden on lower-income households who spend more on them.' },
  ],
  summary:[
    'Direct taxes are paid straight by the taxpayer and are typically progressive; indirect taxes are collected via sellers and tend to be regressive.',
    'Effective tax rate = total tax paid ÷ income, and comparing this across income groups reveals whether a system is progressive or regressive.',
    'Higher tax rates do not automatically raise revenue if they reduce compliance or economic activity.',
    'Governments balance revenue needs against fairness and efficiency when designing tax policy.'
  ]
};
