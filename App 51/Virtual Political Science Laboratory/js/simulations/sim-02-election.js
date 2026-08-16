/* ============================================================
   SIMULATION 2 — ELECTION PROCESS LABORATORY
   ============================================================ */
(function(){
  const sim = VPSL_DATA.sims.find(s=>s.id==='election');

  const meta = {
    objectives:[
      'Run a complete election cycle from voter registration to result declaration.',
      'Understand universal adult franchise, secret ballot, and free & fair elections.',
      'Analyse how campaign strategy and turnout influence outcomes under First-Past-The-Post.',
      'Read and interpret an interactive election results map and seat tally.',
    ],
    background:'An election translates the will of voters into representation through a defined sequence: eligible citizens register, the territory is divided into constituencies, candidates campaign, citizens vote by secret ballot, votes are counted transparently, and results are declared by an independent authority. Each stage has safeguards designed to keep the process free, fair and credible.',
    constitutionalPrinciples:['Universal adult franchise — one citizen, one vote','Secret ballot to protect voter choice','Free and fair elections conducted by an independent Election Commission','Periodic elections as the basis of representative government'],
    realLife:'Election management bodies worldwide follow broadly similar stages to the ones in this lab. Turnout, delimitation of constituencies, and campaign spending limits are all live policy debates in real democracies, because each one shapes how fairly votes translate into seats.',
    misconceptions:['Winning the most votes nationally does not guarantee winning the most seats under First-Past-The-Post — seat count depends on constituency-by-constituency results.','A secret ballot protects the voter, but the vote count itself is done transparently, with representatives of candidates present.','Low turnout does not mean an election is invalid — but it can affect how representative the result feels.'],
    facts:['First-Past-The-Post means the candidate with the most votes in a constituency wins it — even without a majority.','Some countries use proportional representation instead, allocating seats to match vote share rather than a single winner per constituency.','Postal ballots and accessible polling booths are examples of measures designed to widen participation.'],
  };

  const quiz = [
    {type:'mcq', q:'Under First-Past-The-Post, a constituency is won by:', options:['The candidate with over 50% of votes','The candidate with the most votes, even without a majority','The party with the most money spent','A random draw among top two'], answer:'The candidate with the most votes, even without a majority', explain:'FPTP awards the seat to whoever gets the most votes in that constituency, regardless of whether it is an absolute majority.'},
    {type:'tf', q:'A secret ballot means no one — including election officials — ever counts the votes.', answer:'False', explain:'The ballot is secret to protect the individual voter\'s choice, but the overall count is done openly and can be witnessed by candidate representatives.'},
    {type:'mcq', q:'Which principle ensures every adult citizen can vote regardless of income or education?', options:['Secret ballot','Universal adult franchise','Delimitation','Campaign finance law'], answer:'Universal adult franchise', explain:'Universal adult franchise guarantees the right to vote to all eligible adult citizens equally.'},
    {type:'mcq', q:'A party can win the most total votes nationwide yet win fewer seats than a rival. This is best explained by:', options:['Voter fraud','How votes are distributed across constituencies under FPTP','Illegal campaigning','The Election Commission\'s bias'], answer:'How votes are distributed across constituencies under FPTP', explain:'Concentrated wins in some seats and narrow losses in many others can produce this outcome under FPTP — it is a structural feature, not fraud.'},
    {type:'ar', q:'Assertion: An independent Election Commission strengthens free and fair elections. Reason: Independence reduces the ruling party\'s ability to influence the process. Choose the correct option.', options:['Both true, Reason explains Assertion','Both true, unrelated','Assertion true, Reason false','Both false'], answer:'Both true, Reason explains Assertion', explain:'Independence from the government of the day is precisely what allows an Election Commission to referee fairly.'},
    {type:'mcq', q:'Voter turnout refers to:', options:['The number of candidates contesting','The percentage of eligible voters who actually vote','The number of polling booths','The margin of victory'], answer:'The percentage of eligible voters who actually vote', explain:'Turnout is a participation measure — eligible voters who actually cast a ballot, expressed as a percentage.'},
  ];

  const PARTIES = [
    {id:'unity', name:'Unity Party', color:'#0D47A1', base:34},
    {id:'progress', name:'Progress Front', color:'#43A047', base:33},
    {id:'peoples', name:'People\'s Alliance', color:'#FFB300', base:33},
  ];

  function simulate(panel, h){
    const steps = ['Registration','Constituencies','Campaign','Polling','Counting','Results'];
    let stepIdx = 0;
    const st = {
      eligiblePool: 10000,
      registrationRate: 82,
      constituencies: 7,
      campaign: {unity:55, progress:50, peoples:45},
      turnout: null,
      results: null, // per-constituency winner + tallies
    };

    function render(){
      panel.innerHTML = `
        <div class="stepper">
          ${steps.map((s,i)=>`<div class="step-dot ${i<stepIdx?'done':''} ${i===stepIdx?'current':''}"><span class="num">${i<stepIdx?'✓':i+1}</span>${s}</div>`).join('')}
        </div>
        <div id="step-body"></div>
      `;
      const body = panel.querySelector('#step-body');
      [renderRegistration, renderConstituencies, renderCampaign, renderPolling, renderCounting, renderResults][stepIdx](body);
    }

    function navButtons(body, {back=true, nextLabel='Next →', onNext}={}){
      const row = document.createElement('div');
      row.className='btn-row';
      row.style.marginTop='16px';
      if(back && stepIdx>0){
        const b = document.createElement('button'); b.className='btn-sm'; b.textContent='← Back';
        b.onclick=()=>{ stepIdx--; render(); };
        row.appendChild(b);
      }
      if(onNext){
        const n = document.createElement('button'); n.className='btn-sm primary'; n.textContent=nextLabel;
        n.onclick=onNext;
        row.appendChild(n);
      }
      body.appendChild(row);
    }

    function renderRegistration(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🧾 Step 1 · Voter Registration</h4>
          <p>Your virtual constituency has <b>${st.eligiblePool.toLocaleString()}</b> eligible citizens. Set what share successfully registers — outreach, ID access and awareness campaigns affect this rate.</p>
          <div class="control-row">
            <label>Registration Rate <span class="val">${st.registrationRate}%</span></label>
            <input type="range" min="40" max="100" value="${st.registrationRate}" id="reg-slider">
          </div>
          <div class="notice info">📋 Registered voters: <b id="reg-count">${Math.round(st.eligiblePool*st.registrationRate/100).toLocaleString()}</b></div>
        </div>
      `;
      body.querySelector('#reg-slider').addEventListener('input', e=>{
        st.registrationRate = +e.target.value;
        body.querySelector('label .val').textContent = st.registrationRate+'%';
        body.querySelector('#reg-count').textContent = Math.round(st.eligiblePool*st.registrationRate/100).toLocaleString();
      });
      navButtons(body, {back:false, onNext:()=>{ stepIdx=1; render(); h.setProgress(30);} });
    }

    function renderConstituencies(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>🗺️ Step 2 · Constituency Delimitation</h4>
          <p>Divide the territory into constituencies. Each elects one representative under First-Past-The-Post.</p>
          <div class="control-row">
            <label>Number of Constituencies <span class="val">${st.constituencies}</span></label>
            <input type="range" min="5" max="15" value="${st.constituencies}" id="const-slider">
          </div>
          <div class="notice fact">💡 More constituencies means smaller, more localised contests — this can help smaller parties win seats where their support is concentrated.</div>
        </div>
      `;
      body.querySelector('#const-slider').addEventListener('input', e=>{
        st.constituencies = +e.target.value;
        body.querySelector('label .val').textContent = st.constituencies;
      });
      navButtons(body, {onNext:()=>{ stepIdx=2; render(); h.setProgress(40);} });
    }

    function renderCampaign(body){
      body.innerHTML = `
        <div class="glass card">
          <h4>📣 Step 3 · Campaign Strategy</h4>
          <p>Allocate campaign strength (advertising, rallies, door-to-door outreach) to each party. Stronger campaigns raise a party's vote share, but voter response has natural randomness too.</p>
          ${PARTIES.map(p=>`
            <div class="control-row">
              <label><span style="color:${p.color}">●</span> ${p.name} <span class="val">${st.campaign[p.id]}</span></label>
              <input type="range" min="0" max="100" value="${st.campaign[p.id]}" data-party="${p.id}">
            </div>`).join('')}
        </div>
      `;
      body.querySelectorAll('input[type=range]').forEach(inp=>{
        inp.addEventListener('input', ()=>{
          st.campaign[inp.dataset.party] = +inp.value;
          inp.previousElementSibling.querySelector('.val').textContent = inp.value;
        });
      });
      navButtons(body, {onNext:()=>{ stepIdx=3; render(); h.setProgress(50);} });
    }

    function renderPolling(body){
      body.innerHTML = `
        <div class="glass card" style="text-align:center;">
          <h4 style="justify-content:center;">🗳️ Step 4 · Polling Day</h4>
          <p>Polling booths are open. Citizens cast their vote by secret ballot. Press below to close polling and move to counting.</p>
          <div style="font-size:48px;margin:14px 0;">🗳️</div>
          <div class="btn-row" style="justify-content:center;">
            <button class="btn-sm primary" id="close-poll">Close Polling Booths</button>
          </div>
        </div>
      `;
      body.querySelector('#close-poll').addEventListener('click', ()=>{
        st.turnout = Math.round(58 + Math.random()*22); // 58-80%
        stepIdx=4; render(); h.setProgress(65);
      });
    }

    function renderCounting(body){
      body.innerHTML = `
        <div class="glass card" style="text-align:center;">
          <h4 style="justify-content:center;">🧮 Step 5 · Vote Counting</h4>
          <p>Counting is underway under observation of candidate representatives, as required for a transparent process.</p>
          <div class="metric-bar" style="margin:18px 0;"><div class="metric-fill" id="count-bar" style="width:0%;background:var(--primary-blue)"></div></div>
          <p id="count-status">Starting count…</p>
        </div>
      `;
      let pct = 0;
      const bar = body.querySelector('#count-bar');
      const status = body.querySelector('#count-status');
      const iv = setInterval(()=>{
        pct += 8 + Math.random()*10;
        if(pct>=100){
          pct=100; clearInterval(iv);
          computeResults();
          status.textContent = 'Count complete. Declaring results…';
          setTimeout(()=>{ stepIdx=5; render(); h.setProgress(85); }, 700);
        } else {
          status.textContent = `Counting… ${Math.round(pct)}%`;
        }
        bar.style.width = pct+'%';
      }, 260);
    }

    function computeResults(){
      const constituencyResults = [];
      const seatTally = {unity:0, progress:0, peoples:0};
      for(let i=0;i<st.constituencies;i++){
        const shares = {};
        let total=0;
        PARTIES.forEach(p=>{
          const noise = (Math.random()-0.5)*30;
          let v = p.base*0.5 + st.campaign[p.id]*0.5 + noise;
          v = Math.max(2, v);
          shares[p.id]=v; total+=v;
        });
        PARTIES.forEach(p=> shares[p.id] = Math.round((shares[p.id]/total)*1000)/10);
        const winner = PARTIES.reduce((a,b)=> shares[a.id]>shares[b.id]?a:b);
        seatTally[winner.id]++;
        constituencyResults.push({idx:i+1, shares, winner:winner.id});
      }
      st.results = {constituencyResults, seatTally};
    }

    function renderResults(body){
      const {constituencyResults, seatTally} = st.results;
      const totalSeats = st.constituencies;
      const winnerParty = PARTIES.reduce((a,b)=> seatTally[a.id]>seatTally[b.id]?a:b);
      const majority = seatTally[winnerParty.id] > totalSeats/2;
      body.innerHTML = `
        <div class="glass card">
          <h4>🏁 Step 6 · Result Declaration</h4>
          <div class="notice info">👥 Voter turnout: <b>${st.turnout}%</b> of ${Math.round(st.eligiblePool*st.registrationRate/100).toLocaleString()} registered voters</div>
          <div class="chart-box" style="margin-top:14px;"><canvas id="seat-chart"></canvas></div>
          <div class="legend">${PARTIES.map(p=>`<span><i class="dot" style="background:${p.color}"></i>${p.name}: ${seatTally[p.id]} seat${seatTally[p.id]===1?'':'s'}</span>`).join('')}</div>
          <div class="notice ${majority?'fact':'warn'}" style="margin-top:14px;">
            ${majority ? `🏆 <b>${winnerParty.name}</b> wins a majority with ${seatTally[winnerParty.id]} of ${totalSeats} seats and forms the government.`
              : `⚖️ No single party has a majority. <b>${winnerParty.name}</b> leads with ${seatTally[winnerParty.id]} of ${totalSeats} seats — a coalition government may need to be formed.`}
          </div>
        </div>
        <div class="glass card">
          <h4>🗺️ Constituency Map</h4>
          <p style="margin-bottom:10px;">Each tile is a constituency, coloured by the winning party. Hover/tap a tile to see the vote share.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px;">
            ${constituencyResults.map(c=>{
              const p = PARTIES.find(p=>p.id===c.winner);
              return `<div title="C${c.idx}: ${PARTIES.map(pp=>pp.name+' '+c.shares[pp.id]+'%').join(' · ')}"
                style="background:${p.color};color:#fff;border-radius:10px;padding:12px 4px;text-align:center;font-size:11px;font-weight:700;">C${c.idx}</div>`;
            }).join('')}
          </div>
        </div>
        <div class="btn-row">
          <button class="btn-sm" id="run-again">↺ Run New Election</button>
        </div>
      `;
      h.drawBar(body.querySelector('#seat-chart'), PARTIES.map(p=>({label:p.name.split(' ')[0], value:seatTally[p.id], color:p.color})), {max:Math.max(totalSeats,1)});
      body.querySelector('#run-again').addEventListener('click', ()=>{ stepIdx=0; st.results=null; render(); });
      h.setProgress(100);
    }

    render();
  }

  vpslRegister({
    sim, category:'Elections & Representation', meta, quiz,
    summary:'You ran a full election: setting registration, delimiting constituencies, allocating campaign strength, holding polling, counting votes, and declaring results on an interactive map. You saw how First-Past-The-Post can turn close, spread-out vote shares into decisive seat outcomes.',
    simulate,
  });
})();
