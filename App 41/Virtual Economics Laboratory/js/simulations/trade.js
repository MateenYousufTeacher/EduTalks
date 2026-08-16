/* ==========================================================================
   SIM 08 — INTERNATIONAL TRADE SIMULATOR
   ========================================================================== */
window.VEC_SIMS = window.VEC_SIMS || {};
window.VEC_SIMS['trade'] = {
  id:'trade', icon:'🚢', tag:'Macroeconomics', tagClass:'macro', duration:'20–25 min',
  title:'International Trade Simulator',
  shortDesc:'Set tariffs, exchange rates, transport costs and trade agreements — watch imports, exports and the trade balance respond.',
  objectives:[
    'Explain how tariffs affect import prices, quantity traded and government revenue.',
    'Understand how exchange rate changes affect export and import competitiveness.',
    'Evaluate the effect of trade agreements on trade volumes.',
    'Interpret a country\'s trade balance and its economic significance.'
  ],
  concept:[
    'A <b>tariff</b> is a tax on imported goods. It raises the domestic price of imports, protecting local producers from foreign competition but raising costs for domestic consumers and generating tariff revenue for the government.',
    'The <b>exchange rate</b> determines how competitive a country\'s exports are abroad and how expensive imports are at home. A weaker domestic currency makes exports cheaper for foreign buyers (boosting exports) and imports costlier at home (discouraging imports) — and vice-versa for a stronger currency.',
    '<b>Trade agreements</b> (like Free Trade Agreements or Customs Unions) reduce or remove tariffs between partner countries, generally increasing trade volumes and specialisation according to <b>comparative advantage</b> — each country focusing on what it can produce relatively most efficiently.'
  ],
  misconceptions:[
    'Tariffs do not only affect foreign producers — domestic consumers usually end up paying higher prices too.',
    'A trade deficit (imports > exports) is not automatically a sign of economic weakness — it can simply reflect strong domestic demand or investment.',
    'Free trade does not benefit every single individual equally — some domestic industries facing new competition can be hurt even as the economy overall gains.'
  ],
  facts:[
    'India has signed Free Trade Agreements (FTAs) with several countries and blocs like ASEAN, UAE, and Australia to reduce tariffs.',
    'A weaker rupee makes Indian IT and textile exports more price-competitive internationally.',
    'The World Trade Organization (WTO) sets global rules to reduce trade barriers between member countries.'
  ],
  realWorld:[
    'India-UAE CEPA reducing tariffs on goods like gems, jewellery and textiles.',
    'RBI and currency markets influencing the rupee-dollar exchange rate.',
    'Customs duties on imported electronics and their effect on domestic manufacturing (Make in India).'
  ],
  teacherNote:'Compare "No Agreement" vs "Free Trade Agreement" presets side by side to show students the direct effect of tariff removal on trade volumes.',
  variables:[
    { key:'tariff', label:'Import Tariff Rate', min:0, max:60, step:5, default:15, format:v=>v+'%' },
    { key:'exchangeRate', label:'Exchange Rate (higher = weaker ₹)', min:60, max:100, step:2, default:80, format:v=>'₹'+v },
    { key:'transportCost', label:'Transport / Logistics Cost', min:0, max:40, step:2, default:12, format:v=>v+'%' },
    { key:'foreignDemand', label:'Foreign Demand for Our Exports', min:0, max:100, step:5, default:55, format:v=>v },
    { key:'domesticDemand', label:'Domestic Demand for Imports', min:0, max:100, step:5, default:55, format:v=>v },
    { key:'agreement', label:'Trade Agreement', type:'select', default:'none', options:[
      {value:'none', label:'No Agreement (Standard Tariffs)'},
      {value:'fta', label:'Free Trade Agreement (−70% tariff)'},
      {value:'union', label:'Customs Union (Zero Tariff + Boost)'},
    ]},
  ],
  presets:[
    { name:'Protectionist Policy', values:{tariff:45,exchangeRate:78,transportCost:15,foreignDemand:50,domesticDemand:60,agreement:'none'} },
    { name:'Free Trade Agreement', values:{tariff:15,exchangeRate:80,transportCost:12,foreignDemand:60,domesticDemand:55,agreement:'fta'} },
    { name:'Weak Rupee (Export Boost)', values:{tariff:15,exchangeRate:96,transportCost:12,foreignDemand:65,domesticDemand:45,agreement:'none'} },
    { name:'Strong Rupee (Import Boost)', values:{tariff:15,exchangeRate:64,transportCost:12,foreignDemand:45,domesticDemand:65,agreement:'none'} },
  ],
  compute(v){
    const effTariff = v.agreement==='union' ? 0 : v.agreement==='fta' ? v.tariff*0.3 : v.tariff;
    const importPriceIndex = 100 * (1+effTariff/100) * (1+v.transportCost/100) * (v.exchangeRate/80);
    const imports = VEcon.clamp(v.domesticDemand*1.3 - importPriceIndex*0.35, 0, 180);
    const exportPriceIndex = 100 * (1+v.transportCost/100) * (80/v.exchangeRate);
    const unionBoost = v.agreement==='union' ? 22 : v.agreement==='fta' ? 8 : 0;
    const exports = VEcon.clamp(v.foreignDemand*1.35 - exportPriceIndex*0.3 + unionBoost, 0, 180);
    const tradeBalance = exports - imports;
    const tariffRevenue = imports * (effTariff/100) * 12;
    const consumerPriceEffect = effTariff * 0.42;

    const tariffScan = [0,15,30,45,60].map(t=>{
      const eff = v.agreement==='union'?0:v.agreement==='fta'?t*0.3:t;
      const ipi = 100*(1+eff/100)*(1+v.transportCost/100)*(v.exchangeRate/80);
      const imp = VEcon.clamp(v.domesticDemand*1.3 - ipi*0.35, 0, 180);
      return [t+'%', imp.toFixed(0), (imp*(eff/100)*12).toFixed(0)];
    });

    return {
      metrics:[
        { label:'Exports', value:exports.toFixed(0)+' units' },
        { label:'Imports', value:imports.toFixed(0)+' units' },
        { label:'Trade Balance', value:(tradeBalance>=0?'+':'')+tradeBalance.toFixed(0)+' units', deltaDir: tradeBalance>=0?'up':'down', delta: tradeBalance>=0?'Trade surplus':'Trade deficit' },
        { label:'Tariff Revenue', value:VEcon.fmtINR(tariffRevenue) },
      ],
      charts:[
        { type:'bar', title:'Exports vs Imports', sub:'Units of goods traded at current settings',
          spec:{ yr:{min:0,max:Math.max(exports,imports)+30}, yFmt:v=>v.toFixed(0),
            bars:[ { label:'Exports', value:exports, color:'#2ecc8f' }, { label:'Imports', value:imports, color:'#ef5b5b' }, { label:'Trade Balance', value:tradeBalance, color:'#ffb300' } ] }
        },
        { type:'bar', title:'Tariff Trade-off', sub:'Consumer price effect vs government tariff revenue',
          spec:{ yr:{min:0, max: Math.max(consumerPriceEffect, tariffRevenue/40)+10}, yFmt:v=>v.toFixed(0),
            bars:[ { label:'Consumer Price Effect (%)', value:consumerPriceEffect, color:'#ef5b5b' }, { label:'Tariff Revenue (₹00s)', value:tariffRevenue/40, color:'#2f8fef' } ] }
        }
      ],
      table:{
        headers:['Tariff Rate','Imports (units)','Tariff Revenue (₹)'],
        rows: tariffScan
      },
      interpretation:`At an effective tariff of ${effTariff.toFixed(1)}% (after any trade agreement), the country exports ${exports.toFixed(0)} units and imports ${imports.toFixed(0)} units, giving a trade ${tradeBalance>=0?'surplus':'deficit'} of ${Math.abs(tradeBalance).toFixed(0)} units. Tariffs raise ₹${tariffRevenue.toFixed(0)} of government revenue but push consumer prices up by roughly ${consumerPriceEffect.toFixed(1)}% — the classic protection-vs-consumer trade-off. ${v.agreement!=='none' ? 'The active trade agreement is significantly boosting trade volumes by cutting tariffs.' : 'No trade agreement is currently active — tariffs remain at their standard rate.'}`
    };
  },
  quiz:[
    { q:'A tariff is best described as:', options:['A subsidy to exporters','A tax on imported goods','A ban on all trade','A type of exchange rate'], correct:1, explain:'A tariff is a tax imposed on goods imported from abroad.' },
    { q:'A weaker domestic currency (higher exchange rate value) tends to:', options:['Make exports cheaper abroad, boosting them','Make exports more expensive abroad','Have no effect on trade','Only affect imports, not exports'], correct:0, explain:'A weaker currency makes domestic goods cheaper for foreign buyers, boosting exports.' },
    { q:'Free Trade Agreements typically:', options:['Raise tariffs between partner countries','Lower or remove tariffs between partner countries','Ban all imports','Fix exchange rates permanently'], correct:1, explain:'FTAs reduce or eliminate tariffs between the signing countries, increasing trade.' },
    { q:'A trade deficit means:', options:['Exports exceed imports','Imports exceed exports','No trade is happening','Tariffs are zero'], correct:1, explain:'A trade deficit occurs when the value of imports exceeds the value of exports.' },
    { q:'Higher tariffs on imports usually lead to:', options:['Lower consumer prices','Higher consumer prices but more tariff revenue','No change in government revenue','Automatic trade surplus'], correct:1, explain:'Tariffs raise the price of imported goods for consumers while generating revenue for government.' },
  ],
  summary:[
    'Tariffs raise import prices, protecting domestic producers but raising costs for consumers.',
    'Exchange rate movements change the relative competitiveness of exports and imports.',
    'Trade agreements reduce tariffs between partner countries, generally boosting trade volumes.',
    'A country\'s trade balance (exports minus imports) can be in surplus or deficit, each with different implications.'
  ]
};
