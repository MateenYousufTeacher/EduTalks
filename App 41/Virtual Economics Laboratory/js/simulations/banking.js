/* ==========================================================================
   SIM 04 — BANKING SYSTEM LABORATORY
   ========================================================================== */
window.VEC_SIMS = window.VEC_SIMS || {};
window.VEC_SIMS['banking'] = {
  id:'banking', icon:'🏦', tag:'Banking', tagClass:'finance', duration:'25 min',
  title:'Banking System Laboratory',
  shortDesc:'Run a virtual bank — set the reserve ratio, loan and deposit rates, and watch credit creation, profit and stability respond.',
  objectives:[
    'Explain the process of credit (money) creation through fractional reserve banking.',
    'Calculate the simple money multiplier from the cash reserve ratio.',
    'Understand the trade-off banks manage between profitability, liquidity and risk.',
    'Analyse how loan demand and default risk affect a bank\'s net profit and stability.'
  ],
  concept:[
    'Banks do not keep 100% of deposits in their vaults. Under <b>fractional reserve banking</b>, a bank keeps only a fraction (the <b>Cash Reserve Ratio</b>) and lends out the rest. When that loan is spent and redeposited elsewhere in the banking system, it becomes the basis for further lending — this chain is called <b>credit creation</b>.',
    'The theoretical <b>money multiplier</b> is 1 ÷ reserve ratio. A lower reserve ratio means banks can create more money from the same initial deposit, but it also means less of a cushion if many depositors want their cash back at once — a <b>liquidity</b> risk.',
    'A bank\'s profit mainly comes from the spread between the <b>interest it charges borrowers</b> and the <b>interest it pays depositors</b>, minus losses from loans that are not repaid (<b>defaults / NPAs — Non-Performing Assets</b>). Banks constantly balance profitability, liquidity, and risk management.'
  ],
  misconceptions:[
    'Banks do not lend out physical cash sitting in a vault for every loan — most lending happens as new bank-ledger entries (deposit creation), governed by reserve requirements.',
    'A lower reserve ratio is not automatically "better" for the economy — it raises money creation but also raises systemic risk.',
    'Higher loan interest rates do not always mean higher bank profit — very high rates can raise defaults and dry up loan demand.'
  ],
  facts:[
    'The Reserve Bank of India (RBI) sets the Cash Reserve Ratio (CRR) as one of its key monetary policy tools.',
    'The 2008 global financial crisis was partly driven by excessive lending against risky loans (high default risk) in the banking system.',
    'Digital and cooperative banks in India must still meet RBI reserve and capital adequacy norms.'
  ],
  realWorld:[
    'RBI adjusting CRR and repo rate to control how much banks can lend.',
    'Fixed deposit and savings account interest rates offered by Indian banks.',
    'Non-Performing Assets (NPA) crises affecting public sector bank profitability.'
  ],
  teacherNote:'Walk through the credit-creation table round by round on the board — many students find the "money is created, not just moved" idea counter-intuitive at first.',
  variables:[
    { key:'deposit', label:'Initial Deposit', min:5000, max:100000, step:5000, default:20000, format:v=>'₹'+v.toLocaleString('en-IN') },
    { key:'reserveRatio', label:'Cash Reserve Ratio', min:5, max:50, step:1, default:20, format:v=>v+'%' },
    { key:'loanRate', label:'Interest Rate Charged on Loans', min:4, max:22, step:0.5, default:11, format:v=>v+'%' },
    { key:'depositRate', label:'Interest Rate Paid on Deposits', min:1, max:12, step:0.5, default:5, format:v=>v+'%' },
    { key:'loanDemand', label:'Loan Demand in the Economy', min:10, max:100, step:5, default:65, format:v=>v+'%' },
    { key:'riskLevel', label:'Borrower Risk Level (Default Risk)', min:0, max:100, step:5, default:25, format:v=>v+'%' },
  ],
  presets:[
    { name:'Conservative Bank', values:{deposit:20000,reserveRatio:35,loanRate:10,depositRate:6,loanDemand:50,riskLevel:15} },
    { name:'Aggressive Growth Bank', values:{deposit:20000,reserveRatio:10,loanRate:16,depositRate:4,loanDemand:90,riskLevel:55} },
    { name:'RBI Tightens CRR', values:{deposit:20000,reserveRatio:45,loanRate:11,depositRate:5,loanDemand:60,riskLevel:25} },
    { name:'NPA Crisis Scenario', values:{deposit:20000,reserveRatio:20,loanRate:13,depositRate:5,loanDemand:70,riskLevel:80} },
  ],
  compute(v){
    const multiplier = VEcon.moneyMultiplier(v.reserveRatio);
    const loanableFunds = v.deposit * (1 - v.reserveRatio/100);
    const actualLoans = loanableFunds * (v.loanDemand/100);
    const theoreticalMoneyCreated = v.deposit * multiplier;
    const actualMoneyCreated = theoreticalMoneyCreated * (v.loanDemand/100);

    const defaultLossRate = (v.riskLevel/100) * 0.16;
    const interestIncome = actualLoans * v.loanRate/100;
    const interestExpense = v.deposit * v.depositRate/100;
    const defaultLoss = actualLoans * defaultLossRate;
    const netProfit = interestIncome - interestExpense - defaultLoss;

    const stability = VEcon.clamp(70 + v.reserveRatio*0.6 - v.riskLevel*0.55 - Math.max(0,v.loanDemand-80)*0.4, 5, 99);
    const satisfaction = VEcon.clamp(55 + (v.depositRate-5)*4 - (v.loanRate-11)*2.5 - v.riskLevel*0.08, 5, 99);

    // Credit creation rounds
    let rounds = []; let dep = v.deposit; let totalMoney = 0;
    for(let i=1;i<=8;i++){
      const reserve = dep * v.reserveRatio/100;
      const loan = dep - reserve;
      totalMoney += dep;
      rounds.push([i, '₹'+dep.toFixed(0), '₹'+reserve.toFixed(0), '₹'+loan.toFixed(0), '₹'+totalMoney.toFixed(0)]);
      dep = loan;
    }

    return {
      metrics:[
        { label:'Money Multiplier', value:multiplier.toFixed(2)+'×' },
        { label:'Total Money Creation Potential', value:VEcon.fmtINR(theoreticalMoneyCreated) },
        { label:'Net Bank Profit', value:VEcon.fmtINR(netProfit), deltaDir: netProfit>=0?'up':'down' },
        { label:'Bank Stability Index', value:stability.toFixed(0)+'/100', deltaDir: stability>60?'up':'down' },
      ],
      charts:[
        { type:'bar', title:'Bank Profit Breakdown', sub:'Interest income vs expense vs default losses',
          spec:{ yr:{min:Math.min(0,netProfit)-500, max:Math.max(interestIncome,1000)+500}, yFmt:v=>'₹'+v.toFixed(0),
            bars:[
              { label:'Interest Income', value:interestIncome, color:'#2ecc8f' },
              { label:'Interest Expense', value:-interestExpense, color:'#ef5b5b' },
              { label:'Default Losses', value:-defaultLoss, color:'#ffb020' },
              { label:'Net Profit', value:netProfit, color:'#2f8fef' },
            ] }
        },
        { type:'line', title:'Credit Creation Over Lending Rounds', sub:'Cumulative money supply generated from the initial deposit',
          legend:[{label:'Cumulative money created',color:'#2ecc8f'}],
          spec:{ xr:{min:1,max:8}, yr:{min:0,max: totalMoney*1.1}, xLabel:'Lending Round', yLabel:'₹ Cumulative',
            series:[{ points: rounds.map((r,i)=>[i+1, +r[4].replace('₹','')]), color:'#2ecc8f', fill:'rgba(46,204,143,0.12)' }] }
        }
      ],
      table:{
        headers:['Round','New Deposit','Reserve Held','New Loan Made','Cumulative Money Supply'],
        rows: rounds
      },
      interpretation:`With a Cash Reserve Ratio of ${v.reserveRatio}%, the theoretical money multiplier is ${multiplier.toFixed(2)}×, meaning the initial ₹${v.deposit.toLocaleString('en-IN')} deposit could support up to ${VEcon.fmtINR(theoreticalMoneyCreated)} of total money supply through repeated lending. At current loan demand and risk levels, the bank earns ${VEcon.fmtINR(netProfit)} net profit and has a stability score of ${stability.toFixed(0)}/100. ${stability<40?'⚠️ Stability is low — high risk lending combined with a thin reserve cushion could threaten solvency if depositors withdraw suddenly.':'The bank currently holds a reasonably safe balance between lending and reserves.'}`
    };
  },
  quiz:[
    { q:'The simple money multiplier is calculated as:', options:['Reserve Ratio × 100','1 ÷ Reserve Ratio','Loan Rate − Deposit Rate','Deposit × Loan Rate'], correct:1, explain:'Money multiplier = 1 divided by the reserve ratio (as a fraction).' },
    { q:'A lower Cash Reserve Ratio (CRR) generally leads to:', options:['Less money creation','More money creation, more risk','No effect on lending','Lower loan interest rates only'], correct:1, explain:'A lower CRR frees up more funds to lend, increasing money creation but reducing the safety cushion.' },
    { q:'A bank\'s main source of profit is typically:', options:['Government grants','The spread between loan and deposit interest rates','Printing new currency','Selling reserves'], correct:1, explain:'Banks profit mainly from charging more on loans than they pay on deposits.' },
    { q:'Non-Performing Assets (NPAs) refer to:', options:['Deposits that earn no interest','Loans that are not being repaid','Reserves held at the central bank','Government bonds'], correct:1, explain:'NPAs are loans where borrowers have stopped repaying, creating losses for the bank.' },
    { q:'Which combination is most likely to threaten a bank\'s stability?', options:['High reserve ratio, low risk lending','Low reserve ratio, high risk lending','High reserve ratio, high deposit rate','Low loan demand, high reserve ratio'], correct:1, explain:'Lending aggressively with few reserves and high default risk is the classic recipe for bank instability.' },
  ],
  summary:[
    'Fractional reserve banking allows banks to create money by lending out a portion of deposits.',
    'The money multiplier (1 ÷ reserve ratio) shows the maximum money supply a deposit can support.',
    'Bank profit comes from the spread between loan and deposit interest rates, minus default losses.',
    'Banks must balance profitability against liquidity and risk to remain stable.'
  ]
};
