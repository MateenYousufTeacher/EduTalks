/* Shared helpers used by every simulation module */
window.GeoLab = window.GeoLab || {};
GeoLab.ui = {
  uid(){ return 'id'+Math.random().toString(36).slice(2,9); },

  panel(innerHTML, extraClass=''){ return `<div class="panel ${extraClass}">${innerHTML}</div>`; },

  slider({id, label, min, max, step=1, value, unit=''}){
    return `
    <div class="control-row" style="flex-direction:column;align-items:stretch;gap:4px;">
      <div style="display:flex;justify-content:space-between;">
        <label>${label}</label><span class="val" id="${id}_val">${value}${unit}</span>
      </div>
      <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
    </div>`;
  },
  bindSlider(id, unit='', cb){
    const el = document.getElementById(id);
    const out = document.getElementById(id+'_val');
    if(!el) return;
    el.addEventListener('input', ()=>{
      if(out) out.textContent = el.value+unit;
      cb && cb(parseFloat(el.value));
    });
  },

  toggleRow({id, label, checked}){
    return `<div class="control-row"><label for="${id}">${label}</label>
      <label class="toggle"><input type="checkbox" id="${id}" ${checked?'checked':''}><span class="track"></span></label>
    </div>`;
  },

  metric(label, val){ return `<div class="metric"><div class="m-label">${label}</div><div class="m-val">${val}</div></div>`; },
  metricGrid(items){ return `<div class="metric-grid">${items.map(i=>GeoLab.ui.metric(i[0],i[1])).join('')}</div>`; },

  badge(text, kind='info'){ return `<span class="badge badge-${kind}">${text}</span>`; },

  missions(list, doneIds){
    doneIds = doneIds || [];
    return list.map((m,i)=>{
      const done = doneIds.includes(m.id);
      return `<div class="mission-card ${done?'done':''}" data-mission="${m.id}">
        <div class="m-ico">${done?'✓':(i+1)}</div>
        <div><h4>${m.title}</h4><p>${m.desc}</p></div>
      </div>`;
    }).join('');
  },

  tabbar(tabs, active){
    return `<div class="tabbar">${tabs.map(t=>`<button data-tab="${t.id}" class="${t.id===active?'active':''}">${t.label}</button>`).join('')}</div>`;
  },
  bindTabbar(root, cb){
    root.querySelectorAll('.tabbar button').forEach(b=>{
      b.addEventListener('click', ()=>{
        root.querySelectorAll('.tabbar button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        cb(b.dataset.tab);
      });
    });
  },

  favBar(ctx){
    return `<button class="btn ${ctx.isFav()?'btn-amber':'btn-tertiary'} btn-sm" id="favBtn">${ctx.isFav()?'★ Saved':'☆ Save to Favorites'}</button>`;
  },
  bindFav(root, ctx){
    root.querySelector('#favBtn')?.addEventListener('click', (e)=>{
      const on = ctx.favToggle();
      e.target.textContent = on ? '★ Saved' : '☆ Save to Favorites';
      e.target.classList.toggle('btn-amber', on);
      e.target.classList.toggle('btn-tertiary', !on);
      ctx.toast(on ? 'Added to favorites' : 'Removed from favorites');
    });
  },

  progressKey(simId){ return 'geolab_progress_'+simId; },
  loadProgress(simId){ return GeoLab.store.get(GeoLab.ui.progressKey(simId), {missions:[]}); },
  saveProgress(simId, data){ GeoLab.store.set(GeoLab.ui.progressKey(simId), data); },
  markMission(simId, missionId, ctx){
    const p = GeoLab.ui.loadProgress(simId);
    if(!p.missions.includes(missionId)){
      p.missions.push(missionId);
      GeoLab.ui.saveProgress(simId, p);
      ctx.toast('✅ Mission complete: '+missionId);
      return true;
    }
    return false;
  }
};
