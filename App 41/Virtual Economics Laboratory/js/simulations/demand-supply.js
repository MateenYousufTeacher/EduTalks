/* ==========================================================================
   SIM 01 — DEMAND & SUPPLY LABORATORY
   ========================================================================== */
window.VEC_SIMS = window.VEC_SIMS || {};
window.VEC_SIMS['demand-supply'] = {
  id:'demand-supply', icon:'📈', tag:'Microeconomics', tagClass:'micro', duration:'20–25 min',
  title:'Demand & Supply Laboratory',
  shortDesc:'Move income, advertising, population and cost — watch the demand and supply curves shift and the market find a new equilibrium.',
  objectives:[
    'Distinguish between a movement along a curve and a shift of a curve.',
    'Predict how income, advertising, population and production cost change market equilibrium.',
    'Identify and quantify shortages and surpluses when price is set away from equilibrium.',
    'Interpret consumer surplus and producer surplus on a demand-supply diagram.'
  ],
  concept:[
    'The <b>law of demand</b> states that, other things being equal, the quantity of a good consumers are willing to buy falls as its price rises — this is why the demand curve slopes downward. The <b>law of supply</b> states that producers are willing to offer more of a good at higher prices, giving the supply curve its upward slope.',
    'Where the two curves cross is the <b>market equilibrium</b> — the price and quantity at which the amount buyers want to purchase exactly equals the amount sellers want to sell. Any change in income, tastes, population, advertising or production cost does not move the curve along itself; it <b>shifts the entire curve</b> left or right, creating a new equilibrium.',
    'When the actual market price sits above equilibrium, quantity supplied exceeds quantity demanded and a <b>surplus</b> builds up, pushing price back down. When price sits below equilibrium, quantity demanded exceeds quantity supplied and a <b>shortage</b> appears, pushing price back up. This self-correcting tendency is the invisible hand at work.'
  ],
  misconceptions:[
    'A change in the <em>price</em> of the good itself moves you <b>along</b> the demand curve — it does not shift it.',
    '"Demand" is not the same as "quantity demanded". Demand refers to the whole curve/schedule; quantity demanded is a single point on it.',
    'A rightward shift in demand does not automatically mean a shortage — the market will simply settle at a new, higher equilibrium price and quantity.'
  ],
  facts:[
    'Advertising is designed to shift the demand curve right at every price level, not just to change price.',
    'During festive seasons in India, seasonal demand shifts for items like sweets and lights are a textbook rightward shift of the demand curve.',
    'A bumper harvest shifts the supply curve right, which is why farm-gate prices often fall sharply just after harvest.'
  ],
  realWorld:[
    'Onion and tomato price swings in Indian markets after erratic rainfall (supply shocks).',
    'Airline ticket prices rising sharply around Diwali and exam-result travel season (demand shocks).',
    'Government MSP (Minimum Support Price) acting like a price floor in agricultural markets.'
  ],
  teacherNote:'Ask students to predict the direction of the shift before moving each slider, then verify against the chart. For CWSN learners, describe the shift verbally as "the whole line moves right/left" rather than relying only on the visual.',
  variables:[
    { key:'income', label:'Consumer Income', min:0, max:100, step:5, default:50, unit:'idx', format:v=>v },
    { key:'advertising', label:'Advertising Spend', min:0, max:100, step:5, default:30, format:v=>v },
    { key:'population', label:'Population', min:0, max:100, step:5, default:50, format:v=>v },
    { key:'preference', label:'Consumer Preference', min:0, max:100, step:5, default:50, format:v=>v },
    { key:'prodCost', label:'Production Cost', min:0, max:100, step:5, default:50, format:v=>v },
    { key:'marketPrice', label:'Actual Market Price Set', min:0, max:100, step:2, default:50, format:v=>'₹'+v },
  ],
  presets:[
    { name:'Festive Season Boom (Demand ↑)', values:{income:70, advertising:70, population:55, preference:75, prodCost:45, marketPrice:60} },
    { name:'Bumper Harvest (Supply ↑)', values:{income:50, advertising:30, population:50, preference:50, prodCost:20, marketPrice:35} },
    { name:'Input Cost Shock (Supply ↓)', values:{income:50, advertising:30, population:50, preference:50, prodCost:85, marketPrice:55} },
    { name:'Recession (Demand ↓)', values:{income:15, advertising:20, population:50, preference:30, prodCost:50, marketPrice:40} },
  ],
  compute(v){
    const dIntercept = 40 + v.income*0.7 + v.advertising*0.5 + v.population*0.5 + v.preference*0.4;
    const dSlope = 1.4;
    const sIntercept = Math.max(2, 20 - v.prodCost*0.25);
    const sSlope = 1.1 + v.prodCost*0.01;
    const { demand, supply, eqP, eqQ, maxQ } = VEcon.linearDS({dIntercept, dSlope, sIntercept, sSlope, priceMax:100});
    const { cs, ps, total } = VEcon.surplus({dIntercept,dSlope,sIntercept,sSlope,eqP,eqQ});

    const Qd_at = Math.max(0, dIntercept - dSlope*v.marketPrice);
    const Qs_at = Math.max(0, sIntercept + sSlope*v.marketPrice);
    const gap = Qd_at - Qs_at;
    const status = Math.abs(gap) < 1.5 ? 'Balanced' : (gap>0 ? 'Shortage' : 'Surplus');

    return {
      metrics:[
        { label:'Equilibrium Price', value:'₹'+eqP.toFixed(1) },
        { label:'Equilibrium Quantity', value:eqQ.toFixed(1)+' units' },
        { label:'Market Status @ ₹'+v.marketPrice, value:status, deltaDir: status==='Shortage'?'up':(status==='Surplus'?'down':'up'), delta: status==='Balanced'?'Qd = Qs':`${Math.abs(gap).toFixed(1)} unit gap` },
        { label:'Total Surplus (Welfare)', value:total.toFixed(0)+' units·₹' },
      ],
      charts:[
        { type:'curve', title:'Demand & Supply Curves', sub:'Quantity (X) vs Price (Y) — gold dot marks equilibrium',
          legend:[{label:'Demand',color:'#2f8fef'},{label:'Supply',color:'#2ecc8f'},{label:'Market Price',color:'#ffcc4d'}],
          spec:{
            xr:{min:0,max:maxQ}, yr:{min:0,max:100}, xLabel:'Quantity', yLabel:'Price (₹)',
            marker:[eqQ,eqP], shadeArea:'rgba(46,204,143,0.06)',
            curves:[
              { points:demand, color:'#2f8fef', label:'D' },
              { points:supply, color:'#2ecc8f', label:'S' },
              { points:[[0,v.marketPrice],[maxQ,v.marketPrice]], color:'#ffcc4d', dash:[5,4], label:'Market Price' },
            ]
          }
        }
      ],
      table:{
        headers:['Price (₹)','Qty Demanded','Qty Supplied','Gap'],
        rows:[10,25,40,eqP,60,75,90].sort((a,b)=>a-b).map(P=>{
          const P2 = Math.round(P);
          const qd = Math.max(0, dIntercept - dSlope*P2).toFixed(1);
          const qs = Math.max(0, sIntercept + sSlope*P2).toFixed(1);
          return [P2===Math.round(eqP)?P2+' (eq)':P2, qd, qs, (qd-qs).toFixed(1)];
        })
      },
      interpretation: `At the actual market price of ₹${v.marketPrice}, quantity demanded is ${Qd_at.toFixed(1)} units and quantity supplied is ${Qs_at.toFixed(1)} units — a ${status.toLowerCase()} of ${Math.abs(gap).toFixed(1)} units. The free-market equilibrium sits at ₹${eqP.toFixed(1)} with ${eqQ.toFixed(1)} units traded. ${status==='Shortage' ? 'Because the set price is below equilibrium, buyers want more than sellers are offering — expect queues, black-marketing pressure, or price rising back toward equilibrium.' : status==='Surplus' ? 'Because the set price is above equilibrium, sellers are offering more than buyers want — expect unsold stock and downward pressure on price.' : 'The market is currently clearing exactly at equilibrium.'}`
    };
  },
  quiz:[
    { q:'A rise in consumer income shifts the demand curve for a normal good:', options:['Left (decrease)','Right (increase)','No change','It moves supply, not demand'], correct:1, explain:'Higher income lets consumers buy more of a normal good at every price, shifting demand rightward.' },
    { q:'If the government fixes price below equilibrium, the result is:', options:['A surplus','A shortage','No effect','Supply increases'], correct:1, explain:'Below equilibrium, quantity demanded > quantity supplied, creating a shortage.' },
    { q:'A fall in production cost shifts the supply curve:', options:['Right (increase)','Left (decrease)','Does not shift supply','Shifts demand instead'], correct:0, explain:'Lower costs make production more profitable at every price, increasing supply (rightward shift).' },
    { q:'Movement along the demand curve is caused by:', options:['A change in advertising','A change in the price of the good itself','A change in income','A change in population'], correct:1, explain:'Only a change in the good\'s own price causes movement along the curve; other factors shift it.' },
    { q:'At market equilibrium:', options:['Quantity demanded > quantity supplied','Quantity demanded < quantity supplied','Quantity demanded = quantity supplied','Price is always zero'], correct:2, explain:'Equilibrium is defined by quantity demanded exactly equalling quantity supplied.' },
  ],
  summary:[
    'Demand curves slope downward due to the law of demand; supply curves slope upward due to the law of supply.',
    'Non-price factors (income, advertising, population, preferences, cost) shift entire curves rather than moving points along them.',
    'Equilibrium price and quantity are found where the demand and supply curves intersect.',
    'Prices set away from equilibrium create shortages (price too low) or surpluses (price too high) that push the market back toward balance.'
  ]
};
