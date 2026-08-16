(function(){
const ID='optics';

function mount(root){
  let element='concaveMirror', uInput=30, fInput=15, obs;

  VPL.buildTabs(root, [
    {id:'learn', label:'Learn', render: renderLearn},
    {id:'simulate', label:'Simulate', render: renderSim},
    {id:'data', label:'Data', render: renderData},
    {id:'quiz', label:'Quiz', render: renderQuiz},
  ], 'simulate');

  function renderLearn(p){
    p.innerHTML = `
    <div class="panel"><h3>${VPL.ICONS.book} Introduction</h3><p>Move an object in front of mirrors and lenses to see how the image position, size, and nature change.</p></div>
    <div class="panel"><h3>${VPL.ICONS.grad} Learning Objectives</h3><ul><li>Apply the mirror and lens formulas.</li><li>Predict whether an image is real/virtual and upright/inverted.</li><li>Calculate magnification.</li></ul></div>
    <div class="panel"><h3>${VPL.ICONS.sigma} Theory</h3><div class="formula-box">Mirror formula: 1/v + 1/u = 1/f<br>Lens formula: 1/v − 1/u = 1/f<br>Magnification: m = −v/u (mirror) or m = v/u (lens)</div></div>
    <div class="panel"><h3>Real-life Applications</h3><ul><li>Concave mirrors in torches and headlights.</li><li>Convex mirrors as vehicle side-view mirrors (wider field of view).</li><li>Convex lenses in cameras and eyeglasses for far-sightedness.</li></ul></div>
    <div class="panel"><h3>Common Mistakes</h3><ul><li>Mixing up sign conventions between mirrors and lenses.</li><li>Assuming all images are inverted — virtual images from concave mirrors (object within focal length) and convex mirrors are upright.</li></ul></div>
    <div class="panel"><h3>Interesting Fact</h3><p>Convex mirrors always form virtual, upright, and smaller images — which is exactly why they're used for wide-view safety mirrors.</p></div>`;
  }

  function calc(){
    const u = -uInput;
    let v, m, f, real, type = element;
    if(type==='planeMirror'){
      v = uInput; m=1; real=false;
    }else if(type==='concaveMirror'){
      f=-fInput; v=1/(1/f-1/u); m=-v/u; real=v<0;
    }else if(type==='convexMirror'){
      f=fInput; v=1/(1/f-1/u); m=-v/u; real=v<0;
    }else if(type==='convexLens'){
      f=fInput; v=1/(1/f+1/u); m=v/u; real=v>0;
    }else if(type==='concaveLens'){
      f=-fInput; v=1/(1/f+1/u); m=v/u; real=v>0;
    }
    return {v,m,real,inverted:m<0};
  }

  function renderSim(p){
    p.innerHTML = `
    <div class="sim-layout">
      <div class="stage">
        <div class="toggle-row" id="elRow">
          <button data-e="planeMirror">Plane Mirror</button>
          <button data-e="concaveMirror" class="active">Concave Mirror</button>
          <button data-e="convexMirror">Convex Mirror</button>
          <button data-e="convexLens">Convex Lens</button>
          <button data-e="concaveLens">Concave Lens</button>
        </div>
        <canvas id="opCanvas" height="260" style="margin-top:10px;"></canvas>
        <div class="stage-toolbar">
          <button id="opRand">${VPL.ICONS.dice} Randomize</button>
          <button id="opShot">${VPL.ICONS.camera} Screenshot</button>
          <button id="opLog">${VPL.ICONS.step} Log Observation</button>
        </div>
      </div>
      <div class="controls panel">
        <h3>Variable Controls</h3>
        <label>Object Distance (u) <span class="val" id="uVal">${uInput} cm</span></label>
        <input type="range" id="uSlide" min="5" max="60" value="${uInput}">
        <label id="fLabel">Focal Length (f) <span class="val" id="fVal">${fInput} cm</span></label>
        <input type="range" id="fSlide" min="5" max="40" value="${fInput}">
        <div class="readout-grid" id="readouts"></div>
        <div class="formula-box" id="formulaBox"></div>
      </div>
    </div>`;
    const canvas=p.querySelector('#opCanvas'), ctx=canvas.getContext('2d');
    p.querySelector('#elRow').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      p.querySelector('#elRow').querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); element=b.dataset.e;
      p.querySelector('#fLabel').style.display = element==='planeMirror'?'none':'';
      p.querySelector('#fSlide').style.display = element==='planeMirror'?'none':'';
      update();
    });
    p.querySelector('#uSlide').oninput=e=>{uInput=+e.target.value; p.querySelector('#uVal').textContent=uInput+' cm'; update();};
    p.querySelector('#fSlide').oninput=e=>{fInput=+e.target.value; p.querySelector('#fVal').textContent=fInput+' cm'; update();};
    p.querySelector('#opRand').onclick=()=>{
      const els=['planeMirror','concaveMirror','convexMirror','convexLens','concaveLens'];
      element=els[Math.floor(Math.random()*els.length)];
      uInput=Math.round(Math.random()*55+5); fInput=Math.round(Math.random()*35+5);
      p.querySelector('#elRow').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.e===element));
      p.querySelector('#uSlide').value=uInput; p.querySelector('#uVal').textContent=uInput+' cm';
      p.querySelector('#fSlide').value=fInput; p.querySelector('#fVal').textContent=fInput+' cm';
      p.querySelector('#fLabel').style.display = element==='planeMirror'?'none':'';
      p.querySelector('#fSlide').style.display = element==='planeMirror'?'none':'';
      update();
    };
    p.querySelector('#opShot').onclick=()=>VPL.screenshotCanvas(canvas,'optics-studio.png');
    p.querySelector('#opLog').onclick=()=>{
      const c=calc();
      if(obs) obs.addRow([labelFor(element), uInput, element==='planeMirror'?'—':fInput, c.v.toFixed(1), c.m.toFixed(2), c.real?'Real':'Virtual', c.inverted?'Inverted':'Upright']);
      VPL.markProgress(ID,60); VPL.toast('Observation logged ✓');
    };
    function labelFor(e){return {planeMirror:'Plane Mirror',concaveMirror:'Concave Mirror',convexMirror:'Convex Mirror',convexLens:'Convex Lens',concaveLens:'Concave Lens'}[e];}

    function update(){
      const c = calc();
      p.querySelector('#readouts').innerHTML = `
        <div class="readout"><div class="lbl">Image Distance (v)</div><div class="valn">${c.v.toFixed(1)} cm</div></div>
        <div class="readout"><div class="lbl">Magnification (m)</div><div class="valn">${c.m.toFixed(2)}</div></div>
        <div class="readout"><div class="lbl">Nature</div><div class="valn">${c.real?'Real':'Virtual'}</div></div>
        <div class="readout"><div class="lbl">Orientation</div><div class="valn">${c.inverted?'Inverted':'Upright'}</div></div>`;
      const isMirror = element.includes('Mirror');
      p.querySelector('#formulaBox').innerHTML = element==='planeMirror'
        ? `Plane mirror: v = u = <span class="ans">${uInput} cm</span> (virtual, upright, same size)`
        : isMirror
          ? `1/v = 1/f − 1/u → v = <span class="ans">${c.v.toFixed(1)} cm</span><br>m = −v/u = <span class="ans">${c.m.toFixed(2)}</span>`
          : `1/v = 1/f + 1/u → v = <span class="ans">${c.v.toFixed(1)} cm</span><br>m = v/u = <span class="ans">${c.m.toFixed(2)}</span>`;
      draw(c);
    }

    function draw(c){
      const dpr=window.devicePixelRatio||1, W=canvas.clientWidth, H=260;
      canvas.width=W*dpr; canvas.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,W,H);
      const cx=W/2, axisY=H/2;
      const scale = Math.min(4, (W*0.35)/60);
      ctx.strokeStyle='#B9D4F0'; ctx.beginPath(); ctx.moveTo(20,axisY); ctx.lineTo(W-20,axisY); ctx.stroke();
      // element
      ctx.strokeStyle='#0D47A1'; ctx.lineWidth=3;
      if(element.includes('Mirror')){
        const curve = element==='concaveMirror'? -1 : element==='convexMirror'? 1 : 0;
        ctx.beginPath();
        if(curve===0){ ctx.moveTo(cx,axisY-70); ctx.lineTo(cx,axisY+70); }
        else{ ctx.arc(cx+curve*90, axisY, 90, Math.PI*0.78, Math.PI*1.22, curve>0); }
        ctx.stroke();
      }else{
        const convex = element==='convexLens';
        ctx.beginPath();
        ctx.ellipse(cx, axisY, convex?10:4, 70, 0, 0, Math.PI*2);
        ctx.stroke();
      }
      // object arrow (left side)
      const objX = cx - uInput*scale;
      drawArrowV(ctx, objX, axisY, axisY-40, '#FFB300');
      ctx.fillStyle='#FFB300'; ctx.font='10px sans-serif'; ctx.textAlign='center'; ctx.fillText('Object', objX, axisY-48);
      // image arrow
      const imgX = cx + (element.includes('Mirror')? -c.v : c.v)*scale;
      const imgHeight = -40*c.m;
      ctx.setLineDash(c.real?[]:[4,4]);
      drawArrowV(ctx, imgX, axisY, axisY-imgHeight, c.real?'#43A047':'#1976D2');
      ctx.setLineDash([]);
      ctx.fillStyle = c.real?'#43A047':'#1976D2';
      ctx.fillText('Image', imgX, axisY-Math.abs(imgHeight)-8*(imgHeight<0?-1:1));
    }
    function drawArrowV(ctx,x,y1,y2,color){
      ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(x,y1); ctx.lineTo(x,y2); ctx.stroke();
      const dir = y2<y1? -1:1;
      ctx.beginPath(); ctx.moveTo(x,y2);
      ctx.lineTo(x-6,y2-6*dir*-1); ctx.lineTo(x+6,y2-6*dir*-1);
      ctx.closePath(); ctx.fill();
    }
    update();
  }

  function renderData(p){
    p.innerHTML = `<div class="panel"><h3>Observation Table <button class="stage-toolbar" id="expCsv" style="float:right;">${VPL.ICONS.download} Export</button></h3><div id="obsWrap"></div></div>`;
    obs = new VPL.ObsTable(p.querySelector('#obsWrap'), ['Element','u (cm)','f (cm)','v (cm)','m','Nature','Orientation']);
    p.querySelector('#expCsv').onclick=()=>VPL.exportCSV('optics-studio.csv', obs.toCSV());
  }

  function renderQuiz(p){
    VPL.buildQuiz(p, ID, [
      {q:'A plane mirror always forms an image that is:', options:['Real and inverted','Virtual and upright','Real and upright','Virtual and inverted'], answer:1, explain:'Plane mirrors always produce virtual, upright, same-size images.'},
      {q:'Convex mirrors are used as vehicle side mirrors because they form:', options:['Magnified real images','A wider field of view with smaller images','Inverted images only','No images at all'], answer:1, explain:'Convex mirrors form smaller, upright virtual images over a wider field of view.'},
      {q:'A concave mirror forms a real, inverted image when the object is:', options:['Between pole and focus','At the focus exactly','Beyond the focal length','Never'], answer:2, explain:'Beyond the focal length, a concave mirror produces a real, inverted image.'},
      {q:'The lens formula is written as:', options:['1/v + 1/u = 1/f','1/v − 1/u = 1/f','v/u = f','v + u = f'], answer:1, explain:'The thin lens formula is 1/v − 1/u = 1/f.'},
      {q:'A concave lens always produces images that are:', options:['Real and magnified','Virtual, upright, and diminished','Real and inverted','Virtual and magnified'], answer:1, explain:'Concave (diverging) lenses always form virtual, upright, smaller images.'},
    ]);
  }
}

SIM_REGISTRY.push({
  id: ID, num:8, title:'Reflection & Refraction Studio', category:'Optics',
  short:'Position objects in front of mirrors and lenses and study image formation.',
  gradient:'linear-gradient(135deg,#1976D2,#0D47A1)',
  iconSVG:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3.5"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>`,
  mount
});
})();
