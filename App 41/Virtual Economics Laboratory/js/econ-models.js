/* ==========================================================================
   VEC.ECON — shared economic calculation helpers
   ========================================================================== */
const VEcon = (() => {

  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  function fmtINR(v){
    v = Math.round(v);
    return '₹' + v.toLocaleString('en-IN');
  }
  function fmtNum(v, d=0){ return (+v).toLocaleString('en-IN', {maximumFractionDigits:d, minimumFractionDigits:d}); }
  function fmtPct(v, d=1){ return (v>=0?'+':'') + v.toFixed(d) + '%'; }

  /** Linear demand & supply curve generator.
   * Qd(P) = dIntercept - dSlope*P   (downward sloping)
   * Qs(P) = sIntercept + sSlope*P   (upward sloping)
   * Returns points as [Q,P] pairs (so chart draws with Quantity on X, Price on Y — standard convention)
   */
  function linearDS({dIntercept, dSlope, sIntercept, sSlope, priceMax=100, steps=60}){
    const demand=[], supply=[];
    let eqP=null, eqQ=null, prevDiff=null;
    for(let i=0;i<=steps;i++){
      const P = (priceMax/steps)*i;
      const Qd = Math.max(0, dIntercept - dSlope*P);
      const Qs = Math.max(0, sIntercept + sSlope*P);
      demand.push([Qd, P]);
      supply.push([Qs, P]);
      const diff = Qd - Qs;
      if(prevDiff!==null && ((prevDiff>=0 && diff<=0) || (prevDiff<=0 && diff>=0)) && eqP===null){
        const prevP = (priceMax/steps)*(i-1);
        const t = prevDiff===diff ? 0 : prevDiff/(prevDiff-diff);
        eqP = prevP + t*(P-prevP);
        eqQ = Math.max(0, dIntercept - dSlope*eqP);
      }
      prevDiff = diff;
    }
    if(eqP===null){ eqP=0; eqQ=Math.max(0,dIntercept); }
    const maxQ = Math.max(...demand.map(p=>p[0]), ...supply.map(p=>p[0]), 10);
    return { demand, supply, eqP, eqQ, maxQ };
  }

  /** Consumer & producer surplus (approx, trapezoidal) for linear curves up to equilibrium */
  function surplus({dIntercept,dSlope,sIntercept,sSlope,eqP,eqQ}){
    const chokePrice = dIntercept/dSlope; // price where Qd=0
    const floorPrice = sIntercept>0 ? -sIntercept/sSlope : 0; // price where Qs=0
    const cs = 0.5 * eqQ * Math.max(0, chokePrice - eqP);
    const ps = 0.5 * eqQ * Math.max(0, eqP - Math.max(0,floorPrice));
    return { cs, ps, total: cs+ps };
  }

  /** Compound growth series: base value grown by rate% each period for n periods */
  function compoundSeries(base, ratePct, periods){
    const out = [base];
    for(let i=1;i<=periods;i++) out.push(out[i-1]*(1+ratePct/100));
    return out;
  }

  /** Simple/compound interest for banking sim */
  function compoundInterest(principal, ratePct, years, timesPerYear=1){
    return principal * Math.pow(1 + (ratePct/100)/timesPerYear, timesPerYear*years);
  }

  /** Simplified money multiplier (fractional reserve banking) */
  function moneyMultiplier(reserveRatioPct){
    const r = Math.max(1, reserveRatioPct)/100;
    return 1/r;
  }

  /** Quantity Theory of Money style inflation estimate: %ΔP ≈ %ΔM + %ΔV - %ΔY */
  function inflationEstimate(moneyGrowthPct, velocityGrowthPct, outputGrowthPct){
    return moneyGrowthPct + velocityGrowthPct - outputGrowthPct;
  }

  /** Progressive tax calculation across simple slabs */
  function progressiveTax(income, slabs){
    // slabs: [{upto, rate}] ascending, upto=Infinity for last
    let tax=0, prev=0;
    for(const s of slabs){
      const upto = s.upto===Infinity ? income : Math.min(income, s.upto);
      if(income>prev){
        tax += Math.max(0, upto-prev) * (s.rate/100);
      }
      prev = s.upto;
      if(income<=s.upto) break;
    }
    return tax;
  }

  return { clamp, fmtINR, fmtNum, fmtPct, linearDS, surplus, compoundSeries, compoundInterest, moneyMultiplier, inflationEstimate, progressiveTax };
})();
