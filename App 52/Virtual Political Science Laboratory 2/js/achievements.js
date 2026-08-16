/* ============================================================
   ACHIEVEMENTS — badges, civic levels, completion tracking
   ============================================================ */

const Achievements = (() => {

  const BADGES = [
    {id:'first_step', icon:'🌱', name:'First Step', desc:'Complete your first simulation', check: () => Lab.overallStats().completed >= 1},
    {id:'explorer', icon:'🧭', name:'Explorer', desc:'Complete 3 simulations', check: () => Lab.overallStats().completed >= 3},
    {id:'institution_builder', icon:'🏛️', name:'Institution Builder', desc:'Complete Parliament, Executive & Judiciary', check: () => ['parliament','executive','judiciary'].every(id => Lab.getProgress(id).status==='completed')},
    {id:'constitution_scholar', icon:'📜', name:'Constitution Scholar', desc:'Complete the Constitution simulation', check: () => Lab.getProgress('constitution').status==='completed'},
    {id:'grassroots', icon:'🏘️', name:'Grassroots Champion', desc:'Complete Local Government & Federalism', check: () => ['local','federalism'].every(id => Lab.getProgress(id).status==='completed')},
    {id:'lab_graduate', icon:'🎓', name:'Lab Graduate', desc:'Complete all 10 simulations', check: () => Lab.overallStats().completed >= 10}
  ];

  function levelFor(count){
    if(count>=10) return {name:'Constitutional Scholar', icon:'🎓'};
    if(count>=7) return {name:'Senior Civic Analyst', icon:'🏛️'};
    if(count>=4) return {name:'Active Citizen', icon:'🗳️'};
    if(count>=1) return {name:'Civic Learner', icon:'🌱'};
    return {name:'New Citizen', icon:'👋'};
  }

  function checkAllComplete(){
    BADGES.forEach(b => { if(b.check()) Lab.unlockBadge(b.id); });
  }

  function render(){
    checkAllComplete();
    const stats = Lab.overallStats();
    const lvl = levelFor(stats.completed);

    document.getElementById('level-card').innerHTML = `
      <div class="lv-icon">${lvl.icon}</div>
      <div>
        <h4>${lvl.name}</h4>
        <p>${stats.completed} of ${stats.total} simulations completed</p>
      </div>
    `;

    const grid = document.getElementById('badge-grid');
    grid.innerHTML = BADGES.map(b => {
      const unlocked = !!JSON.parse(localStorage.getItem('vpsl_progress_v1')||'{}').badges?.[b.id] || b.check();
      return `<div class="badge-tile ${unlocked?'unlocked':''}">
        <div class="b-icon">${unlocked ? b.icon : '🔒'}</div>
        <div class="b-name">${b.name}</div>
      </div>`;
    }).join('');
  }

  return { render, checkAllComplete, BADGES };
})();
