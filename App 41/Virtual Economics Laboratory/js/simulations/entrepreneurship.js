/* ==========================================================================
   SIM 10 — ENTREPRENEURSHIP & BUSINESS SIMULATOR
   ========================================================================== */
window.VEC_SIMS = window.VEC_SIMS || {};
window.VEC_SIMS['entrepreneurship'] = {
  id:'entrepreneurship', icon:'🚀', tag:'Entrepreneurship', tagClass:'finance', duration:'25–30 min',
  title:'Entrepreneurship & Business Simulator',
  shortDesc:'Launch a virtual business — set price, marketing, production and staffing, and watch revenue, cost and profit unfold.',
  objectives:[
    'Differentiate between fixed costs and variable costs in a business.',
    'Calculate revenue, total cost and profit for a simple business model.',
    'Understand how price, quality, marketing and service level jointly drive demand.',
    'Evaluate strategic trade-offs entrepreneurs face between growth and profitability.'
  ],
  concept:[
    'A business earns <b>revenue</b> by selling units at a chosen price. Its <b>total cost</b> is made up of <b>fixed costs</b> (like employee salaries, which do not change with output in the short run) and <b>variable costs</b> (like raw materials, which rise with each extra unit produced). <b>Profit = Revenue − Total Cost.</b>',
    'Demand for a product depends on more than just price — <b>marketing</b> raises awareness, <b>quality</b> and <b>customer service</b> build loyalty and word-of-mouth, and all of these interact with price to determine how many units customers actually buy.',
    'Entrepreneurs constantly balance trade-offs: spending more on marketing or quality can boost sales but raises costs; pricing too high can protect margins per unit but shrink total volume sold; producing more than the market demands creates costly <b>unsold inventory</b>.'
  ],
  misconceptions:[
    'Higher price does not always mean higher profit — if demand falls sharply, total revenue and profit can actually fall.',
    'Cutting costs everywhere is not always the best strategy — under-investing in quality or marketing can shrink demand more than it saves in cost.',
    'Revenue is not the same as profit — a business can have high sales revenue and still make a loss if costs are too high.'
  ],
  facts:[
    'India has one of the largest startup ecosystems in the world, with thousands of new ventures registered every year.',
    'Customer satisfaction and repeat purchases are often cheaper to earn than acquiring brand-new customers through advertising.',
    'Many successful small businesses fail not from a bad product but from poor cost and cash-flow management.'
  ],
  realWorld:[
    'Local kirana stores and D2C startups both facing the same price-quality-marketing trade-offs at different scales.',
    'Government schemes like Startup India and MUDRA loans supporting new entrepreneurs.',
    'E-commerce sellers using festive discounts (price cuts) paired with ad spend to boost demand.'
  ],
  teacherNote:'Challenge student teams to hit a profit target using different strategies (premium pricing + high quality vs low price + high volume) and compare which works best under these settings.',
  variables:[
    { key:'price', label:'Selling Price per Unit', min:50, max:500, step:10, default:220, format:v=>'₹'+v },
    { key:'marketing', label:'Marketing Spend', min:0, max:100, step:5, default:30, format:v=>'₹'+v+'k' },
    { key:'production', label:'Production Volume (Capacity)', min:50, max:500, step:10, default:220, format:v=>v+' units' },
    { key:'employees', label:'Number of Employees', min:1, max:30, step:1, default:8, format:v=>v },
    { key:'quality', label:'Product Quality Investment', min:0, max:100, step:5, default:55, format:v=>v },
    { key:'service', label:'Customer Service Level', min:0, max:100, step:5, default:55, format:v=>v },
  ],
  presets:[
    { name:'Lean Startup', values:{price:180,marketing:15,production:120,employees:4,quality:40,service:45} },
    { name:'Premium Quality Brand', values:{price:380,marketing:50,production:150,employees:10,quality:90,service:85} },
    { name:'Mass-Market Volume Play', values:{price:120,marketing:70,production:450,employees:18,quality:45,service:50} },
    { name:'Overproduction Mistake', values:{price:300,marketing:10,production:480,employees:14,quality:50,service:40} },
  ],
  compute(v){
    const demandUnits = VEcon.clamp(300 - v.price*0.62 + v.marketing*1.9 + v.quality*1.15 + v.service*0.75, 0, 100000);
    const unitsSold = Math.min(demandUnits, v.production);
    const revenue = unitsSold * v.price;
    const variableCostPerUnit = 35 + v.quality*0.95;
    const productionCost = v.production * variableCostPerUnit;
    const salaryCost = v.employees * 18000;
    const marketingCost = v.marketing * 1000;
    const totalCost = productionCost + salaryCost + marketingCost;
    const profit = revenue - totalCost;
    const unsold = Math.max(0, v.production - unitsSold);
    const satisfaction = VEcon.clamp(38 + v.quality*0.38 + v.service*0.36 - Math.max(0,v.price-280)*0.06, 5, 99);
    const margin = revenue>0 ? (profit/revenue)*100 : -100;

    // 6-quarter growth trajectory: reinvest a share of profit margin into growth
    const growthRate = VEcon.clamp(margin*0.4, -15, 20);
    const trajectory = VEcon.compoundSeries(Math.max(revenue,1), growthRate, 5);

    return {
      metrics:[
        { label:'Units Sold', value: unitsSold.toFixed(0)+' / '+v.production, deltaDir: unsold<v.production*0.1?'up':'down' },
        { label:'Revenue', value: VEcon.fmtINR(revenue) },
        { label:'Profit', value: VEcon.fmtINR(profit), deltaDir: profit>=0?'up':'down' },
        { label:'Customer Satisfaction', value: satisfaction.toFixed(0)+'/100', deltaDir: satisfaction>=60?'up':'down' },
      ],
      charts:[
        { type:'bar', title:'Revenue, Cost & Profit', sub:'Current period business performance',
          spec:{ yr:{min:Math.min(0,profit)-5000, max: revenue+5000}, yFmt:v=>'₹'+(v/1000).toFixed(0)+'k',
            bars:[
              { label:'Revenue', value:revenue, color:'#2ecc8f' },
              { label:'Production Cost', value:-productionCost, color:'#ef5b5b' },
              { label:'Salaries', value:-salaryCost, color:'#ffb020' },
              { label:'Marketing', value:-marketingCost, color:'#2f8fef' },
              { label:'Profit', value:profit, color: profit>=0? '#2ecc8f':'#ef5b5b' },
            ] }
        },
        { type:'line', title:'Projected Revenue Growth', sub:`Assuming ${growthRate.toFixed(1)}% reinvestment growth per quarter`,
          legend:[{label:'Projected revenue',color:'#ffcc4d'}],
          spec:{ xr:{min:0,max:5}, yr:{min:0, max: Math.max(...trajectory)*1.15}, xLabel:'Quarter', yLabel:'₹ Revenue',
            series:[{ points: trajectory.map((r,i)=>[i,r]), color:'#ffcc4d', fill:'rgba(255,204,77,0.12)' }] }
        }
      ],
      table:{
        headers:['Line Item','Amount'],
        rows:[
          ['Units Sold', unitsSold.toFixed(0)],
          ['Unsold Inventory', unsold.toFixed(0)],
          ['Revenue', VEcon.fmtINR(revenue)],
          ['Production Cost', VEcon.fmtINR(productionCost)],
          ['Salary Cost', VEcon.fmtINR(salaryCost)],
          ['Marketing Cost', VEcon.fmtINR(marketingCost)],
          ['Total Cost', VEcon.fmtINR(totalCost)],
          ['Profit / Loss', VEcon.fmtINR(profit)],
          ['Profit Margin', margin.toFixed(1)+'%'],
        ]
      },
      interpretation:`At a price of ₹${v.price}, this business sells ${unitsSold.toFixed(0)} of the ${v.production} units it produces, earning ${VEcon.fmtINR(revenue)} in revenue against ${VEcon.fmtINR(totalCost)} in total costs — a ${profit>=0?'profit':'loss'} of ${VEcon.fmtINR(Math.abs(profit))} (${margin.toFixed(1)}% margin). ${unsold>v.production*0.15 ? `⚠️ ${unsold.toFixed(0)} units are going unsold — production capacity exceeds real demand at this price/marketing mix.` : 'Production is well-matched to demand.'} Customer satisfaction stands at ${satisfaction.toFixed(0)}/100, which will affect repeat purchases and word-of-mouth growth going forward.`
    };
  },
  quiz:[
    { q:'Fixed costs are best described as costs that:', options:['Change directly with output produced','Stay the same regardless of output in the short run','Only occur once, ever','Are always higher than variable costs'], correct:1, explain:'Fixed costs (like salaries or rent) do not change with the level of output in the short run.' },
    { q:'Profit is calculated as:', options:['Revenue + Cost','Revenue − Cost','Cost − Revenue','Revenue × Cost'], correct:1, explain:'Profit equals total revenue minus total cost.' },
    { q:'Producing far more units than customers demand mainly results in:', options:['Automatically higher profit','Costly unsold inventory','Lower production costs','Higher customer satisfaction'], correct:1, explain:'Overproduction relative to demand leads to unsold stock, wasting the money spent producing it.' },
    { q:'Raising price without changing anything else usually:', options:['Always raises total revenue','Can reduce quantity demanded and may lower total revenue','Has no effect on demand','Always increases customer satisfaction'], correct:1, explain:'Higher prices generally reduce quantity demanded, and total revenue may rise or fall depending on the size of that drop.' },
    { q:'Investing in quality and customer service mainly helps a business by:', options:['Guaranteeing lower costs','Increasing demand and customer satisfaction, supporting repeat purchases','Eliminating the need for marketing','Reducing the price customers are willing to pay'], correct:1, explain:'Higher quality and service tend to increase demand and build loyal, repeat customers.' },
  ],
  summary:[
    'Profit equals total revenue minus total cost, which includes both fixed and variable components.',
    'Demand depends on price along with marketing, quality and customer service — not price alone.',
    'Producing beyond real market demand creates costly unsold inventory.',
    'Entrepreneurs must continuously balance price, cost, quality and growth strategy to stay profitable.'
  ]
};
