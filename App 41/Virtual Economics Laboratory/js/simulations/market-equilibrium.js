/* ==========================================================================
   SIM 02 — MARKET EQUILIBRIUM SIMULATOR
   ========================================================================== */
window.VEC_SIMS = window.VEC_SIMS || {};
window.VEC_SIMS['market-equilibrium'] = {
  id:'market-equilibrium', icon:'⚖️', tag:'Microeconomics', tagClass:'micro', duration:'20–25 min',
  title:'Market Equilibrium Simulator',
  shortDesc:'Impose taxes, subsidies, price ceilings and floors — compare efficient free markets against distorted, regulated ones.',
  objectives:[
    'Explain how a per-unit tax and a per-unit subsidy each change market equilibrium.',
    'Distinguish between a price ceiling (maximum price) and a price floor (minimum price).',
    'Identify deadweight loss created by taxes and by binding price controls.',
    'Compare efficient (free) markets with distorted (regulated) markets using data.'
  ],
  concept:[
    'A <b>per-unit tax</b> on sellers acts like an increase in production cost, shifting the effective supply curve upward/leftward. Part of the tax burden falls on consumers (higher price paid) and part on producers (lower price received) — the split depends on the relative steepness of demand and supply.',
    'A <b>subsidy</b> works in reverse: it lowers the effective cost of supply, shifting supply down/rightward, expanding quantity traded and lowering the price consumers pay.',
    'A <b>price ceiling</b> is a legal maximum price. If set below equilibrium it is "binding" and creates a shortage. A <b>price floor</b> is a legal minimum price (like a Minimum Support Price); if set above equilibrium it creates a surplus. Both usually create <b>deadweight loss</b> — trades that would have benefited both buyer and seller but no longer happen.'
  ],
  misconceptions:[
    'A tax on sellers is not "paid only by sellers" — the economic burden (incidence) is shared with buyers through a higher price.',
    'A price ceiling set above the free-market equilibrium price has no effect at all — it must be below equilibrium to bind.',
    'Subsidies do not just help producers — part of the benefit passes to consumers as lower prices.'
  ],
  facts:[
    'India\'s Minimum Support Price (MSP) for crops like wheat and paddy functions as a price floor.',
    'Rent control in some Indian cities is a classic real-world price ceiling that can lead to housing shortages.',
    'Fertiliser subsidies in India are designed to shift effective supply and keep farm input prices low.'
  ],
  realWorld:[
    'GST (Goods and Services Tax) changing effective prices across supply chains.',
    'LPG cylinder subsidies for households (a consumer-side subsidy).',
    'MSP procurement of foodgrains creating a guaranteed price floor for farmers.'
  ],
  teacherNote:'Have students first predict whether tax incidence falls more on buyers or sellers when supply is steep versus flat, then verify by adjusting the "Competition (Supply Elasticity)" slider.',
  variables:[
    { key:'tax', label:'Per-Unit Tax', min:0, max:30, step:1, default:0, format:v=>'₹'+v },
    { key:'subsidy', label:'Per-Unit Subsidy', min:0, max:30, step:1, default:0, format:v=>'₹'+v },
    { key:'competition', label:'Competition (Supply Elasticity)', min:10, max:100, step:5, default:50, format:v=>v+'%' },
    { key:'shock', label:'External Shock (– cuts supply / + boosts supply)', min:-40, max:40, step:5, default:0, format:v=>(v>0?'+':'')+v },
    { key:'control', label:'Price Control', type:'select', default:'none', options:[
      {value:'none', label:'None (Free Market)'},
      {value:'ceiling', label:'Price Ceiling (Maximum)'},
      {value:'floor', label:'Price Floor (Minimum, e.g. MSP)'},
    ]},
    { key:'controlLevel', label:'Control Price Level', min:5, max:95, step:1, default:35, format:v=>'₹'+v, showIf:vals=>vals.control!=='none' },
  ],
  presets:[
    { name:'Free Market (Baseline)', values:{tax:0,subsidy:0,competition:50,shock:0,control:'none',controlLevel:35} },
    { name:'GST-style Tax Applied', values:{tax:18,subsidy:0,competition:50,shock:0,control:'none',controlLevel:35} },
    { name:'MSP Price Floor', values:{tax:0,subsidy:0,competition:50,shock:0,control:'floor',controlLevel:65} },
    { name:'Rent-Control Style Ceiling', values:{tax:0,subsidy:0,competition:50,shock:0,control:'ceiling',controlLevel:25} },
  ],
  compute(v){
    const dIntercept = 90, dSlope = 1.3;
    const sSlopeBase = 0.6 + (v.competition/100)*1.2;
    const sIntercept = 10 + v.shock*0.4;
    // net effective supply intercept adjusts for tax (shifts supply up => intercept down) and subsidy (shifts down => intercept up)
    const effSIntercept = Math.max(1, sIntercept - v.tax*0.7 + v.subsidy*0.7);

    const base = VEcon.linearDS({dIntercept, dSlope, sIntercept, sSlope:sSlopeBase, priceMax:100});
    const eff = VEcon.linearDS({dIntercept, dSlope, sIntercept:effSIntercept, sSlope:sSlopeBase, priceMax:100});

    let clearingP = eff.eqP, clearingQ = eff.eqQ, controlNote = 'No control — market clears freely.';
    let dwl = 0;
    if(v.control==='ceiling' && v.controlLevel < eff.eqP){
      clearingP = v.controlLevel;
      const qd = Math.max(0, dIntercept - dSlope*clearingP);
      const qs = Math.max(0, effSIntercept + sSlopeBase*clearingP);
      clearingQ = Math.min(qd,qs);
      controlNote = `Ceiling binds below equilibrium → shortage of ${(qd-qs).toFixed(1)} units.`;
      dwl = 0.5*Math.abs(qd-clearingQ)*Math.abs(eff.eqP-clearingP);
    } else if(v.control==='floor' && v.controlLevel > eff.eqP){
      clearingP = v.controlLevel;
      const qd = Math.max(0, dIntercept - dSlope*clearingP);
      const qs = Math.max(0, effSIntercept + sSlopeBase*clearingP);
      clearingQ = Math.min(qd,qs);
      controlNote = `Floor binds above equilibrium → surplus of ${(qs-qd).toFixed(1)} units.`;
      dwl = 0.5*Math.abs(qs-clearingQ)*Math.abs(clearingP-eff.eqP);
    } else if(v.control!=='none'){
      controlNote = 'Control set does not bind (it is on the wrong side of equilibrium) — market clears at free equilibrium.';
    }

    const buyerPrice = clearingP;
    const sellerPrice = Math.max(0, clearingP - v.tax + v.subsidy);

    return {
      metrics:[
        { label:'Free-Market Equilibrium', value:'₹'+eff.eqP.toFixed(1) },
        { label:'Actual Clearing Price', value:'₹'+clearingP.toFixed(1) },
        { label:'Quantity Traded', value:clearingQ.toFixed(1)+' units' },
        { label:'Deadweight Loss', value:dwl.toFixed(0)+' units·₹', deltaDir: dwl>0?'down':'up', delta: dwl>0?'Efficiency lost':'Fully efficient' },
      ],
      charts:[
        { type:'curve', title:'Market With Tax / Subsidy / Control', sub:'Solid = current market · Dashed grey = original free market',
          legend:[{label:'Demand',color:'#2f8fef'},{label:'Effective Supply',color:'#2ecc8f'},{label:'Original Supply',color:'#9fb0c9'},{label:'Control / Clearing',color:'#ffcc4d'}],
          spec:{
            xr:{min:0,max:Math.max(base.maxQ,eff.maxQ)}, yr:{min:0,max:100}, xLabel:'Quantity', yLabel:'Price (₹)',
            marker:[clearingQ, clearingP],
            curves:[
              { points:base.supply, color:'#9fb0c9', dash:[3,5] },
              { points:eff.demand, color:'#2f8fef', label:'D' },
              { points:eff.supply, color:'#2ecc8f', label:'S′' },
              { points:[[0,clearingP],[Math.max(base.maxQ,eff.maxQ),clearingP]], color:'#ffcc4d', dash:[5,4] },
            ]
          }
        }
      ],
      table:{
        headers:['Scenario','Price Buyers Pay','Price Sellers Receive','Quantity','Note'],
        rows:[
          ['Free Market', '₹'+eff.eqP.toFixed(1), '₹'+eff.eqP.toFixed(1), eff.eqQ.toFixed(1), 'No distortion'],
          ['Current Setting', '₹'+buyerPrice.toFixed(1), '₹'+sellerPrice.toFixed(1), clearingQ.toFixed(1), controlNote],
        ]
      },
      interpretation: `${controlNote} Buyers currently pay ₹${buyerPrice.toFixed(1)} while sellers effectively receive ₹${sellerPrice.toFixed(1)} per unit (the ₹${v.tax} tax and ₹${v.subsidy} subsidy create a wedge between the two). ${dwl>0 ? `This distortion destroys about ${dwl.toFixed(0)} units·₹ of potential gains from trade — the deadweight loss.` : 'There is no deadweight loss in this configuration — the market is operating efficiently.'}`
    };
  },
  quiz:[
    { q:'A per-unit tax on sellers shifts the supply curve:', options:['Right','Left','Does not shift','Shifts demand instead'], correct:1, explain:'A tax raises effective production cost, shifting supply left/up.' },
    { q:'A binding price ceiling is set:', options:['Above equilibrium price','Below equilibrium price','Exactly at equilibrium','Anywhere, it always binds'], correct:1, explain:'Only a ceiling below equilibrium restricts price and creates a shortage.' },
    { q:'India\'s MSP for crops is an example of a:', options:['Price ceiling','Price floor','Per-unit tax','Import tariff'], correct:1, explain:'MSP guarantees a minimum price to farmers — a classic price floor.' },
    { q:'Deadweight loss refers to:', options:['Government tax revenue','Lost gains from trades that no longer happen','Total consumer spending','Profit earned by monopolies'], correct:1, explain:'Deadweight loss is the value of mutually beneficial trades that a distortion prevents.' },
    { q:'A subsidy to producers generally causes:', options:['Higher price, lower quantity','Lower price, higher quantity','No change in price or quantity','Only sellers benefit, price to buyers is unchanged'], correct:1, explain:'Subsidies shift supply right, lowering price and raising quantity traded.' },
  ],
  summary:[
    'Taxes shift effective supply left, splitting the burden between buyers (higher price) and sellers (lower net receipt).',
    'Subsidies shift effective supply right, lowering the price buyers pay and raising the price sellers receive.',
    'A price ceiling below equilibrium causes a shortage; a price floor above equilibrium causes a surplus.',
    'Both taxes and binding price controls typically create deadweight loss — a pure loss of economic efficiency.'
  ]
};
