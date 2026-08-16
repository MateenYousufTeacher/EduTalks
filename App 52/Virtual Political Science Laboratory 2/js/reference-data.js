/* ============================================================
   REFERENCE DATA — Constitution Handbook & Glossary
   ============================================================ */

const GLOSSARY = [
  {term:'Constitution', def:'The supreme, foundational law of a country. It establishes the structure of government, distributes powers among institutions, and guarantees rights to citizens.'},
  {term:'Democracy', def:'A system of government in which power ultimately rests with the people, exercised directly or through freely elected representatives.'},
  {term:'Sovereignty', def:'The independent authority of a state to govern itself without external control.'},
  {term:'Republic', def:'A state in which the head of state is an elected (or otherwise chosen) representative, not a hereditary monarch.'},
  {term:'Fundamental Rights', def:'Basic rights guaranteed to citizens by the Constitution, enforceable in courts, such as equality, freedom, and protection from exploitation.'},
  {term:'Directive Principles', def:'Guidelines for the state to frame policies for social and economic welfare. They are not enforceable in court but are fundamental to governance.'},
  {term:'Federalism', def:'A system in which governmental power is constitutionally divided between a central (Union) authority and regional (State) authorities.'},
  {term:'Union List', def:'The list of subjects (such as defence and foreign affairs) on which only the national/Union government can make laws.'},
  {term:'State List', def:'The list of subjects (such as police and public health) on which only State governments can normally make laws.'},
  {term:'Concurrent List', def:'The list of subjects (such as education) on which both Union and State governments can make laws; Union law prevails in case of conflict.'},
  {term:'Bicameral Legislature', def:'A law-making body composed of two houses — for example, the Lok Sabha (lower house) and Rajya Sabha (upper house).'},
  {term:'Bill', def:'A draft proposal for a new law, which becomes an Act once passed by the legislature and assented to by the head of state.'},
  {term:'Executive', def:'The branch of government responsible for implementing and administering laws — headed by the Council of Ministers led by the Prime Minister or Chief Minister.'},
  {term:'Judiciary', def:'The branch of government responsible for interpreting laws, resolving disputes, and protecting constitutional rights through courts.'},
  {term:'Judicial Review', def:'The power of courts to examine and strike down laws or executive actions that violate the Constitution.'},
  {term:'Judicial Independence', def:'The principle that courts must be free from control or pressure by the executive or legislature so they can decide cases impartially.'},
  {term:'Separation of Powers', def:'The principle of dividing government functions among the legislature, executive, and judiciary to prevent concentration of power.'},
  {term:'Basic Structure Doctrine', def:'A judicial principle holding that certain fundamental features of the Constitution (such as democracy and judicial review) cannot be amended away by Parliament.'},
  {term:'Panchayati Raj', def:'The three-tier system of rural local self-government (village, block, and district level) strengthened by the 73rd Constitutional Amendment.'},
  {term:'Municipality', def:'An urban local self-government body responsible for civic administration in towns and cities, strengthened by the 74th Constitutional Amendment.'},
  {term:'Universal Adult Franchise', def:'The principle that all adult citizens have the right to vote, regardless of caste, religion, gender, or economic status.'},
  {term:'Election Commission', def:'The independent constitutional body responsible for conducting free and fair elections.'},
  {term:'Coalition Government', def:'A government formed by two or more political parties or groups working together, usually because no single party has a majority.'},
  {term:'Public Policy', def:'A course of action adopted by a government to address a public problem, involving choices, trade-offs, and implementation.'},
  {term:'Stakeholder', def:'Any individual or group affected by, or having an interest in, a decision or policy.'},
  {term:'Amendment', def:'A formal change made to the text of the Constitution through a defined legislative procedure.'},
  {term:'Secularism', def:'The principle that the state treats all religions equally and does not favour or discriminate against any religion.'},
  {term:'Accountability', def:'The obligation of those in power to answer for their decisions and actions to the people or their representatives.'},
  {term:'Rule of Law', def:'The principle that everyone, including the government, is subject to and accountable under the law.'},
  {term:'Citizenship', def:'The legal status of being a recognised member of a state, carrying both rights and responsibilities.'}
];

const HANDBOOK = [
  {
    title:'What is a Constitution?',
    body:'A constitution is the supreme law of a country. It lays down how the government is organised, how power is distributed among its institutions, how leaders are chosen, and what rights citizens are guaranteed. Every ordinary law and government action must conform to the Constitution — if it does not, courts can declare it invalid through judicial review.'
  },
  {
    title:'Fundamental Rights & Directive Principles',
    body:'Fundamental Rights protect individual freedom — such as equality before law, freedom of speech, and protection from exploitation — and are directly enforceable in court. Directive Principles of State Policy guide the government toward social and economic goals, such as reducing inequality; they are not enforceable in court, but courts and legislatures treat them as fundamental to governance. Together, the two aim to balance individual liberty with collective welfare.'
  },
  {
    title:'The Three Organs of Government',
    body:'Government power is separated into three organs: the Legislature (Parliament/State Assemblies) makes laws; the Executive (Council of Ministers and administration) implements and enforces them; and the Judiciary (courts) interprets laws and resolves disputes, including disputes over whether a law or action is constitutional. This separation of powers, along with checks and balances between the organs, helps prevent any one part of government from becoming too powerful.'
  },
  {
    title:'Federalism: Union, State & Concurrent Powers',
    body:'India\'s Constitution divides law-making power between the Union (national) government and State governments. The Seventh Schedule lists subjects under three heads: the Union List (e.g. defence, foreign affairs), the State List (e.g. police, public health), and the Concurrent List (e.g. education, forests) on which both can legislate, with Union law prevailing in case of conflict. This division allows national uniformity where needed while respecting regional diversity and local governance capacity.'
  },
  {
    title:'Local Self-Government',
    body:'Below the Union and State governments sits a third tier: local self-government. The 73rd Constitutional Amendment (1992) established a three-tier Panchayati Raj system for rural areas, and the 74th Amendment established Municipalities for urban areas. These bodies bring governance closer to citizens, handling matters like local infrastructure, sanitation, and community welfare, with regular elections and reserved seats to encourage inclusive representation.'
  },
  {
    title:'Elections & Representation',
    body:'Free and fair elections, conducted by an independent Election Commission, are the mechanism through which citizens choose their representatives. Universal adult franchise means every adult citizen has one vote, regardless of background. Elected representatives then form governments and legislatures, making democracy a system of accountability: if citizens are dissatisfied, they can vote for different representatives at the next election.'
  },
  {
    title:'Lawmaking: From Bill to Act',
    body:'A proposed law begins as a Bill, introduced in either house of Parliament. It typically passes through introduction, debate, committee scrutiny, and voting in both the Lok Sabha and Rajya Sabha (for most Bills), before receiving the President\'s assent to become an Act. This multi-stage process allows scrutiny, debate, and amendment before a proposal becomes binding law.'
  },
  {
    title:'The Basic Structure Doctrine',
    body:'While Parliament can amend the Constitution, the Supreme Court has held (notably in the 1973 Kesavananda Bharati case) that certain core features — such as democracy, federalism, secularism, separation of powers, and judicial review — form the Constitution\'s "basic structure" and cannot be abolished by amendment. This doctrine protects the Constitution\'s foundational character even as it evolves over time.'
  },
  {
    title:'Public Policy & Governance',
    body:'Beyond passing laws, governments must translate them into public policies that address real problems — from public health to environmental protection. Good policymaking involves identifying a problem, weighing options and their trade-offs, consulting stakeholders, implementing the chosen course of action, and evaluating its outcomes, since policies can have both intended and unintended consequences.'
  }
];

const Reference = (() => {
  function renderHandbook(){
    const wrap = document.getElementById('handbook-list');
    wrap.innerHTML = HANDBOOK.map((h,i) => `
      <div class="accordion-item" id="hb-${i}">
        <button class="accordion-head" onclick="Reference.toggleAccordion('hb-${i}')">
          <span>${h.title}</span><span class="chev">▾</span>
        </button>
        <div class="accordion-body"><div class="accordion-body-inner">${h.body}</div></div>
      </div>
    `).join('');
  }

  function toggleAccordion(id){
    const item = document.getElementById(id);
    const body = item.querySelector('.accordion-body');
    const isOpen = item.classList.contains('open');
    // close siblings within same list for a tidy accordion feel
    item.parentElement.querySelectorAll('.accordion-item.open').forEach(o => {
      if(o !== item){ o.classList.remove('open'); o.querySelector('.accordion-body').style.maxHeight = null; }
    });
    if(isOpen){
      item.classList.remove('open');
      body.style.maxHeight = null;
    } else {
      item.classList.add('open');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  }

  let glossarySearch = '';
  function renderGlossary(){
    const az = document.getElementById('glossary-az');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const present = new Set(GLOSSARY.map(g => g.term[0].toUpperCase()));
    az.innerHTML = letters.map(l => `<button class="az-chip ${present.has(l)?'has':''}" onclick="Reference.jumpTo('${l}')">${l}</button>`).join('');
    renderGlossaryList();
  }

  function renderGlossaryList(){
    const wrap = document.getElementById('glossary-list');
    let items = GLOSSARY.slice().sort((a,b)=>a.term.localeCompare(b.term));
    if(glossarySearch.trim()){
      const t = glossarySearch.trim().toLowerCase();
      items = items.filter(g => g.term.toLowerCase().includes(t) || g.def.toLowerCase().includes(t));
    }
    if(!items.length){
      wrap.innerHTML = `<div class="empty-state"><div class="em-icon">🔍</div>No terms match your search.</div>`;
      return;
    }
    wrap.innerHTML = items.map(g => `
      <div class="glossary-item" id="term-${g.term[0].toUpperCase()}">
        <div class="g-term">${g.term}</div>
        <div class="g-def">${g.def}</div>
      </div>
    `).join('');
  }

  function onGlossarySearch(v){ glossarySearch = v; renderGlossaryList(); }

  function jumpTo(letter){
    const el = document.getElementById('term-'+letter);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }

  return { renderHandbook, toggleAccordion, renderGlossary, onGlossarySearch, jumpTo };
})();
