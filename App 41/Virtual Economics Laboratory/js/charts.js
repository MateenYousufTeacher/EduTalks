/* ==========================================================================
   VECLAB.CHARTS — lightweight canvas chart toolkit (vanilla, offline)
   ========================================================================== */
const VCharts = (() => {

  function themeColors(){
    const cs = getComputedStyle(document.documentElement);
    return {
      grid: cs.getPropertyValue('--surface-border').trim() || 'rgba(255,255,255,.1)',
      text: cs.getPropertyValue('--text-secondary').trim() || '#9fb0c9',
      emerald: cs.getPropertyValue('--emerald-400').trim() || '#2ecc8f',
      blue: cs.getPropertyValue('--blue-400').trim() || '#2f8fef',
      gold: cs.getPropertyValue('--gold-400').trim() || '#ffcc4d',
      danger: cs.getPropertyValue('--danger').trim() || '#ef5b5b',
    };
  }

  function setupCanvas(canvas){
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(rect.width, 280);
    const h = Math.max(rect.height, 200);
    canvas.width = w*dpr; canvas.height = h*dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return { ctx, w, h };
  }

  function niceBounds(min, max){
    if(min===max){ min-=1; max+=1; }
    const pad = (max-min)*0.08;
    return { min: min-pad, max: max+pad };
  }

  function drawAxes(ctx, w, h, pad, xLabel, yLabel){
    const c = themeColors();
    ctx.strokeStyle = c.grid; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h-pad.b); ctx.lineTo(w-pad.r, h-pad.b);
    ctx.stroke();
    ctx.fillStyle = c.text; ctx.font = '11px Nunito Sans, sans-serif';
    if(xLabel){ ctx.textAlign='center'; ctx.fillText(xLabel, (pad.l+w-pad.r)/2, h-6); }
    if(yLabel){
      ctx.save(); ctx.translate(12, (pad.t+h-pad.b)/2); ctx.rotate(-Math.PI/2);
      ctx.textAlign='center'; ctx.fillText(yLabel, 0, 0); ctx.restore();
    }
  }

  function gridLines(ctx, w, h, pad, xTicks, yTicks, xFmt, yFmt){
    const c = themeColors();
    ctx.strokeStyle = c.grid; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
    ctx.fillStyle = c.text; ctx.font = '10px JetBrains Mono, monospace';
    for(let i=0;i<=yTicks.n;i++){
      const y = pad.t + (h-pad.t-pad.b) * (i/yTicks.n);
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y); ctx.stroke();
      const val = yTicks.max - (yTicks.max-yTicks.min)*(i/yTicks.n);
      ctx.textAlign='right'; ctx.fillText(yFmt?yFmt(val):val.toFixed(0), pad.l-8, y+3);
    }
    ctx.setLineDash([]);
    for(let i=0;i<=xTicks.n;i++){
      const x = pad.l + (w-pad.l-pad.r) * (i/xTicks.n);
      const val = xTicks.min + (xTicks.max-xTicks.min)*(i/xTicks.n);
      ctx.textAlign='center'; ctx.fillText(xFmt?xFmt(val):val.toFixed(0), x, h-pad.b+16);
    }
  }

  function scaleFns(pad, w, h, xr, yr){
    const sx = v => pad.l + (v-xr.min)/(xr.max-xr.min) * (w-pad.l-pad.r);
    const sy = v => (h-pad.b) - (v-yr.min)/(yr.max-yr.min) * (h-pad.t-pad.b);
    return { sx, sy };
  }

  function drawLine(ctx, points, sx, sy, color, opts={}){
    ctx.beginPath();
    points.forEach((p,i)=>{
      const x=sx(p[0]), y=sy(p[1]);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.strokeStyle = color; ctx.lineWidth = opts.width||2.5;
    if(opts.dash) ctx.setLineDash(opts.dash); else ctx.setLineDash([]);
    ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.stroke();
    ctx.setLineDash([]);
    if(opts.fill){
      const last = points[points.length-1], first = points[0];
      ctx.lineTo(sx(last[0]), sy(opts.fillBase!==undefined?opts.fillBase:0));
      ctx.lineTo(sx(first[0]), sy(opts.fillBase!==undefined?opts.fillBase:0));
      ctx.closePath();
      ctx.fillStyle = opts.fill;
      ctx.fill();
    }
  }

  function findIntersection(lineA, lineB){
    // both arrays of [x,y] with same x sampling; find crossing
    for(let i=0;i<lineA.length-1;i++){
      const a1=lineA[i][1]-lineB[i][1], a2=lineA[i+1][1]-lineB[i+1][1];
      if((a1>=0 && a2<=0) || (a1<=0 && a2>=0)){
        const t = a1===a2 ? 0 : a1/(a1-a2);
        const x = lineA[i][0] + t*(lineA[i+1][0]-lineA[i][0]);
        const y = lineA[i][1] + t*(lineA[i+1][1]-lineA[i][1]);
        return [x,y];
      }
    }
    return null;
  }

  /** Supply & Demand style two-curve chart with equilibrium marker */
  function curveChart(canvas, {curves, xr, yr, xLabel, yLabel, marker, shadeArea}) {
    const {ctx,w,h} = setupCanvas(canvas);
    const c = themeColors();
    ctx.clearRect(0,0,w,h);
    const pad = {l:52,r:20,t:18,b:36};
    const xb = niceBounds(xr.min, xr.max), yb = niceBounds(yr.min, yr.max);
    gridLines(ctx,w,h,pad, {n:5,min:xb.min,max:xb.max}, {n:5,min:yb.min,max:yb.max});
    drawAxes(ctx,w,h,pad, xLabel, yLabel);
    const {sx,sy} = scaleFns(pad,w,h,xb,yb);

    if(shadeArea && curves.length>=2){
      ctx.save();
      ctx.beginPath();
      curves[0].points.forEach((p,i)=>{ const x=sx(p[0]),y=sy(p[1]); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      for(let i=curves[1].points.length-1;i>=0;i--){ const p=curves[1].points[i]; ctx.lineTo(sx(p[0]),sy(p[1])); }
      ctx.closePath();
      ctx.fillStyle = shadeArea;
      ctx.fill();
      ctx.restore();
    }

    curves.forEach(cv=> drawLine(ctx, cv.points, sx, sy, cv.color, {dash:cv.dash}));

    if(marker){
      ctx.beginPath();
      ctx.arc(sx(marker[0]), sy(marker[1]), 5.5, 0, Math.PI*2);
      ctx.fillStyle = c.gold; ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.setLineDash([3,3]); ctx.strokeStyle = c.gold; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(sx(marker[0]), sy(marker[1])); ctx.lineTo(sx(marker[0]), h-pad.b); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad.l, sy(marker[1])); ctx.lineTo(sx(marker[0]), sy(marker[1])); ctx.stroke();
      ctx.setLineDash([]);
    }
    // curve end labels
    curves.forEach(cv=>{
      if(!cv.label) return;
      const last = cv.points[cv.points.length-1];
      ctx.fillStyle = cv.color; ctx.font='700 11px Poppins, sans-serif'; ctx.textAlign='left';
      ctx.fillText(cv.label, Math.min(sx(last[0])+6, w-pad.r-2), sy(last[1])+3);
    });
    return {sx, sy, pad, xb, yb};
  }

  /** Simple multi-series time/line chart */
  function lineChart(canvas, {series, xr, yr, xLabel, yLabel, xFmt, yFmt}){
    const {ctx,w,h} = setupCanvas(canvas);
    ctx.clearRect(0,0,w,h);
    const pad = {l:54,r:20,t:18,b:34};
    const xb = niceBounds(xr.min,xr.max), yb = niceBounds(yr.min,yr.max);
    gridLines(ctx,w,h,pad, {n:5,min:xb.min,max:xb.max}, {n:5,min:yb.min,max:yb.max}, xFmt, yFmt);
    drawAxes(ctx,w,h,pad, xLabel, yLabel);
    const {sx,sy} = scaleFns(pad,w,h,xb,yb);
    series.forEach(s=> drawLine(ctx, s.points, sx, sy, s.color, {fill:s.fill, width:s.width}));
    // dot at last point
    series.forEach(s=>{
      const last = s.points[s.points.length-1];
      ctx.beginPath(); ctx.arc(sx(last[0]),sy(last[1]),4,0,Math.PI*2);
      ctx.fillStyle=s.color; ctx.fill();
    });
    return {sx,sy,pad,xb,yb};
  }

  /** Vertical bar chart */
  function barChart(canvas, {bars, yr, yLabel, yFmt}){
    const {ctx,w,h} = setupCanvas(canvas);
    ctx.clearRect(0,0,w,h);
    const pad = {l:54,r:16,t:18,b:34};
    const yb = niceBounds(Math.min(0,yr.min), yr.max);
    const c = themeColors();
    ctx.strokeStyle=c.grid; ctx.fillStyle=c.text; ctx.font='10px JetBrains Mono, monospace';
    for(let i=0;i<=4;i++){
      const y = pad.t + (h-pad.t-pad.b)*(i/4);
      ctx.setLineDash([3,4]); ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y); ctx.stroke(); ctx.setLineDash([]);
      const val = yb.max - (yb.max-yb.min)*(i/4);
      ctx.textAlign='right'; ctx.fillText(yFmt?yFmt(val):val.toFixed(0), pad.l-8, y+3);
    }
    const zeroY = pad.t + (h-pad.t-pad.b) * (1 - (0-yb.min)/(yb.max-yb.min));
    const bw = (w-pad.l-pad.r) / bars.length;
    bars.forEach((b,i)=>{
      const x0 = pad.l + i*bw + bw*0.18;
      const bwid = bw*0.64;
      const y1 = pad.t + (h-pad.t-pad.b) * (1 - (b.value-yb.min)/(yb.max-yb.min));
      const top = Math.min(y1, zeroY), hgt = Math.abs(y1-zeroY);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      const r = Math.min(6, bwid/2);
      ctx.roundRect ? ctx.roundRect(x0, top, bwid, Math.max(hgt,2), [r,r,0,0]) : ctx.rect(x0,top,bwid,Math.max(hgt,2));
      ctx.fill();
      ctx.fillStyle = c.text; ctx.font='10.5px Nunito Sans, sans-serif'; ctx.textAlign='center';
      ctx.fillText(b.label, x0+bwid/2, h-pad.b+16);
    });
    ctx.strokeStyle=c.grid; ctx.beginPath(); ctx.moveTo(pad.l,zeroY); ctx.lineTo(w-pad.r,zeroY); ctx.stroke();
  }

  /** Donut / pie chart for sector composition */
  function donutChart(canvas, {slices, centerLabel}){
    const {ctx,w,h} = setupCanvas(canvas);
    ctx.clearRect(0,0,w,h);
    const cx=w/2, cy=h/2, r=Math.min(w,h)/2 - 10, ir = r*0.6;
    const total = slices.reduce((a,s)=>a+s.value,0) || 1;
    let ang = -Math.PI/2;
    slices.forEach(s=>{
      const sweep = (s.value/total) * Math.PI*2;
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,r,ang,ang+sweep);
      ctx.closePath();
      ctx.fillStyle = s.color; ctx.fill();
      ang += sweep;
    });
    ctx.globalCompositeOperation='destination-out';
    ctx.beginPath(); ctx.arc(cx,cy,ir,0,Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation='source-over';
    if(centerLabel){
      const c = themeColors();
      ctx.fillStyle=c.text; ctx.font='700 13px Poppins, sans-serif'; ctx.textAlign='center';
      ctx.fillText(centerLabel, cx, cy+5);
    }
  }

  return { setupCanvas, curveChart, lineChart, barChart, donutChart, findIntersection, themeColors };
})();
