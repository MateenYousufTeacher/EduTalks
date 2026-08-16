/* ============================================================
   BOOT — splash sequence, PWA install, global bindings
   ============================================================ */

(function(){
  // ---- floating molecule/atom particles behind splash ----
  function buildSplashParticles(){
    const svg = document.getElementById('splash-particles');
    svg.setAttribute('viewBox','0 0 1000 1000');
    svg.setAttribute('preserveAspectRatio','xMidYMid slice');
    let html = '';
    for(let i=0;i<14;i++){
      const cx = Math.random()*1000, cy = Math.random()*1000, r = 6+Math.random()*10;
      const dur = 6+Math.random()*8;
      html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#4FC3F7" stroke-width="1.4" opacity="0.35">
        <animate attributeName="cy" values="${cy};${cy-40};${cy}" dur="${dur}s" repeatCount="indefinite"/>
      </circle>`;
      html += `<circle cx="${cx}" cy="${cy}" r="2.4" fill="#FFB300" opacity="0.7">
        <animate attributeName="cy" values="${cy};${cy-40};${cy}" dur="${dur}s" repeatCount="indefinite"/>
      </circle>`;
    }
    svg.innerHTML = html;
  }

  function runSplashProgress(cb){
    const bar = document.getElementById('splashProgressBar');
    const hint = document.getElementById('splashHint');
    const steps = ['Loading laboratory assets…','Calibrating instruments…','Preparing 10 simulations…','Warming up the Bunsen burner…','Ready!'];
    let p = 0, i = 0;
    const t = setInterval(()=>{
      p += 100/steps.length;
      bar.style.width = Math.min(p,100)+'%';
      hint.textContent = steps[Math.min(i, steps.length-1)];
      i++;
      if(p>=100){ clearInterval(t); }
    }, 380);
  }

  function enterApp(){
    const splash = document.getElementById('splash');
    splash.style.transition = 'opacity .5s ease, visibility .5s';
    splash.style.opacity = '0';
    setTimeout(()=>{
      splash.classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      App.load();
      document.documentElement.setAttribute('data-theme', App.state.theme);
      App.renderHome();
      App.showView('home');
      App.checkAchievements();
    }, 480);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    buildSplashParticles();
    runSplashProgress();
    document.getElementById('enterAppBtn').addEventListener('click', enterApp);

    // top nav bindings (deferred until app visible, but safe to bind now)
    document.getElementById('brandHome').addEventListener('click', ()=>App.goHome());
    document.getElementById('themeToggle').addEventListener('click', ()=>App.toggleTheme());

    document.getElementById('globalSearch').addEventListener('input', (e)=>{
      const q = e.target.value.trim().toLowerCase();
      if(App.currentView!=='home') App.goHome();
      const cards = document.querySelectorAll('#simsGrid .sim-card');
      cards.forEach(c=>{
        const text = c.textContent.toLowerCase();
        c.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    });

    document.getElementById('favToggleFilter').addEventListener('click', function(){
      App._favFilter = !App._favFilter;
      this.style.color = App._favFilter ? 'var(--amber)' : 'var(--primary-blue)';
      App.renderHome();
    });

    document.querySelectorAll('.bn-item').forEach(item=>{
      item.addEventListener('click', ()=>{
        document.querySelectorAll('.bn-item').forEach(x=>x.classList.remove('active'));
        item.classList.add('active');
        const nav = item.dataset.nav;
        if(nav==='home') App.goHome();
        else if(nav==='periodic') App.openTool('periodic-table');
        else if(nav==='favorites') App.openTool('favorites');
        else if(nav==='about') App.openTool('about');
      });
    });

    // ---- PWA install prompt ----
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e)=>{
      e.preventDefault();
      deferredPrompt = e;
    });
    document.getElementById('installBtn').addEventListener('click', async ()=>{
      if(deferredPrompt){
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      } else {
        App.toast('Use your browser menu → "Install App" or "Add to Home Screen"');
      }
    });

    // ---- Service worker for offline support ----
    if('serviceWorker' in navigator){
      window.addEventListener('load', ()=>{
        navigator.serviceWorker.register('service-worker.js').catch(()=>{});
      });
    }
  });
})();
