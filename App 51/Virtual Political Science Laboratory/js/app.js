/* ============================================================
   APP BOOTSTRAP
   ============================================================ */
(function(){
  function generateChakraSpokes(){
    const g = document.getElementById('chakra-spokes');
    if(!g) return;
    const cx=640, cy=180, r1=8, r2=68;
    let out='';
    for(let i=0;i<24;i++){
      const a = (i*15)*Math.PI/180;
      const x1 = cx + Math.cos(a)*r1, y1 = cy + Math.sin(a)*r1;
      const x2 = cx + Math.cos(a)*r2, y2 = cy + Math.sin(a)*r2;
      out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFB300" stroke-width="1.5"/>`;
    }
    g.innerHTML = out;
  }

  function wireGlobalNav(){
    document.querySelectorAll('.nav-item').forEach(btn=>{
      btn.addEventListener('click', ()=> VPSL_UI.go(btn.dataset.screen));
    });
    document.querySelectorAll('[data-goto]').forEach(el=>{
      el.addEventListener('click', ()=> VPSL_UI.go(el.dataset.goto));
    });
    document.getElementById('btn-sim-back').addEventListener('click', VPSL_UI.backFromSim);
    document.getElementById('btn-theme-toggle').addEventListener('click', ()=>{
      const cur = VPSL_STORE.state.theme;
      VPSL_STORE.setSetting('theme', cur==='dark'?'light':'dark');
      VPSL_UI.applyTheme();
    });
    document.getElementById('btn-fullscreen').addEventListener('click', ()=>{
      if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    });
  }

  function registerServiceWorker(){
    if('serviceWorker' in navigator){
      window.addEventListener('load', ()=>{
        navigator.serviceWorker.register('service-worker.js').catch(()=>{/* offline registration best-effort */});
      });
    }
  }

  function init(){
    VPSL_UI.applyTheme();
    document.body.classList.toggle('force-reduce-motion', VPSL_STORE.state.reduceMotion);
    VPSL_STORE.updateStreak();
    generateChakraSpokes();
    VPSL_UI.initSplash();
    VPSL_UI.initHome();
    VPSL_UI.initGlossarySearch();
    wireGlobalNav();
    registerServiceWorker();
    VPSL_UI.renderHome();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
