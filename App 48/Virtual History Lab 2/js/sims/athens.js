(function () {
  "use strict";
  const { ui, esc, clamp } = VSL;
  const COLOR = "#0277BD", COLOR_DARK = "#014A75";

  const issues = [
    { title: "Naval Funding", context: "The fleet needs new ships, but funding them requires new revenue.",
      citizenshipNote: "Only adult male citizens could attend and vote in the Assembly. Women, enslaved people, and metics (resident foreigners) — likely the majority of the population — had no vote here, regardless of how the decision affected them.",
      proposals: [
        { name: "Fund 20 new ships via a wealth levy on the richest citizens",
          support: "Strengthens the fleet significantly and protects trade routes.",
          oppose: "Wealthy citizens may resent being singled out for extra cost.", weight: 3 },
        { name: "Fund 8 new ships from the general treasury",
          support: "A moderate approach that avoids singling out any group.",
          oppose: "May not be enough ships to meet growing naval needs.", weight: 4 },
        { name: "Delay shipbuilding this year",
          support: "Saves money for other civic needs.",
          oppose: "Leaves trade routes and the city more vulnerable.", weight: 2 }
      ], consequence: "The Assembly's choice will shape the city's naval strength and its treasury for years." },
    { title: "Festival Expenditure", context: "A major religious festival is approaching, and its scale is being debated.",
      proposals: [
        { name: "A grand festival with expanded public feasting",
          support: "Boosts civic pride and gives poorer citizens a rare feast.",
          oppose: "Very costly and may strain the treasury.", weight: 3 },
        { name: "A modest, traditional festival",
          support: "Keeps costs reasonable while honoring custom.",
          oppose: "Some feel it undersells the city's status to rivals.", weight: 4 },
        { name: "Redirect festival funds to infrastructure instead",
          support: "Prioritizes practical needs over ceremony.",
          oppose: "Risks appearing to neglect religious and civic tradition.", weight: 2 }
      ], consequence: "Civic identity and treasury priorities are both shaped by how the city marks its festivals." },
    { title: "Public Infrastructure", context: "Several public buildings need repair, but resources are limited.",
      citizenshipNote: "Debates in the Assembly could be lengthy — attendance required time citizens could otherwise spend farming or working, which itself limited who could realistically participate regularly.",
      proposals: [
        { name: "Major renovation of civic buildings",
          support: "Improves the city's function and appearance for generations.",
          oppose: "A large, immediate cost to the treasury.", weight: 3 },
        { name: "Only urgent repairs this year",
          support: "Addresses the most pressing needs at lower cost.",
          oppose: "Postpones larger, necessary improvements.", weight: 5 },
        { name: "No public spending — leave buildings as they are",
          support: "Preserves funds for other priorities.",
          oppose: "Deterioration may worsen and cost more to fix later.", weight: 1 }
      ], consequence: "Public infrastructure choices reflect trade-offs between immediate needs and long-term costs." },
    { title: "Alliance Decision", context: "A neighboring city-state proposes a defensive alliance.",
      proposals: [
        { name: "Accept the alliance fully",
          support: "Provides mutual protection against common threats.",
          oppose: "May drag the city into conflicts not its own.", weight: 3 },
        { name: "Accept a limited, trade-only agreement",
          support: "Gains economic benefits with less military obligation.",
          oppose: "Offers weaker protection if conflict arises.", weight: 4 },
        { name: "Decline the alliance entirely",
          support: "Preserves full independence of action.",
          oppose: "Leaves the city without external support if threatened.", weight: 2 }
      ], consequence: "Alliance decisions carry both opportunity and risk for the city's independence." },
    { title: "Taxation of Trade Goods", context: "Merchants bringing goods through the port could be taxed to fund public needs.",
      citizenshipNote: "Metics — free non-citizen residents who did much of the city's trade and craft work — were directly affected by decisions like this one, yet could not vote on it.",
      proposals: [
        { name: "A new tax on all incoming trade goods",
          support: "Generates steady revenue for public needs.",
          oppose: "May discourage merchants from trading with the city.", weight: 3 },
        { name: "A smaller tax only on luxury imports",
          support: "Targets non-essential goods, easing the burden on staples.",
          oppose: "Raises less revenue overall.", weight: 4 },
        { name: "No new tax on trade",
          support: "Keeps the port attractive and competitive to merchants.",
          oppose: "Public needs remain underfunded.", weight: 2 }
      ], consequence: "Trade taxation affects both city revenue and its relationships with merchants who aren't citizens." }
  ];

  function render(container, ctx) {
    let i = 0;
    let selectedProposal = null;
    let stage = "context"; // context -> vote -> result -> (citizenship) -> next
    let votesCast = 0, wins = 0;
    const resultsLog = [];

    function issue() { return issues[i]; }

    function draw() {
      ctx.headerExtra.innerHTML = ui.progressBar(i + 1, issues.length, `Issue ${i + 1} of ${issues.length}`);
      const iss = issue();
      let html = "";

      if (stage === "context") {
        html = `<div class="info-callout">Interactive Historical Scenario — a fictionalized civic issue inspired by ancient Athenian assembly life.</div>
          <div class="card"><h3>${esc(iss.title)}</h3><p>${esc(iss.context)}</p></div>
          <button class="btn btn-primary" id="next">Enter the Assembly →</button>`;
      } else if (stage === "vote") {
        html = `<div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:6px">${esc(iss.title)}</h3><p class="small" style="color:#77808F">Review each proposal's strongest argument for and against, then cast your vote.</p></div>`;
        html += iss.proposals.map((p, idx) => `
          <div class="arg-card ${selectedProposal === idx ? "selected" : ""}" data-prop="${idx}">
            <div style="font-weight:700;font-family:var(--font-heading);margin-bottom:6px">${esc(p.name)}</div>
            <div class="arg-side support">✓ Supporting argument</div>
            <div class="small" style="margin-bottom:6px">${esc(p.support)}</div>
            <div class="arg-side oppose">✕ Opposing argument</div>
            <div class="small">${esc(p.oppose)}</div>
          </div>`).join("");
        html += `<button class="btn btn-primary" id="castVote" ${selectedProposal == null ? "disabled" : ""} style="margin-top:6px">Cast Your Vote</button>`;
      } else if (stage === "result") {
        const r = resultsLog[resultsLog.length - 1];
        html = `<div class="card"><h3 style="margin-bottom:10px">Assembly Vote Result</h3>
          <div class="vote-bar-wrap">${iss.proposals.map((p, idx) => {
            const pct = r.pcts[idx];
            const color = idx === r.winnerIndex ? "#43A047" : "#90A4AE";
            return `<div class="vote-row"><div style="width:40%">${esc(p.name.split(" ").slice(0, 4).join(" "))}${p.name.split(" ").length > 4 ? "…" : ""}</div><div class="vote-track"><div class="vote-fill" style="width:${pct}%;background:${color}"></div></div><b style="width:34px;text-align:right">${pct}%</b></div>`;
          }).join("")}</div>
          <div class="info-callout ${r.winnerIndex === selectedProposal ? "" : "warn"}">
            ${r.winnerIndex === selectedProposal ? "The proposal you supported won the vote." : "A different proposal won — even direct democracy doesn't guarantee your preferred outcome."}
          </div>
          <p>${esc(iss.consequence)}</p>
        </div>`;
        html += `<button class="btn btn-primary" id="next">${iss.citizenshipNote ? "Continue →" : (i < issues.length - 1 ? "Next Issue →" : "Finish →")}</button>`;
      } else if (stage === "citizenship") {
        html = ui.infoCallout(`<b>Who Participated?</b> ${iss.citizenshipNote}`, "warn") +
          `<button class="btn btn-primary" id="next">${i < issues.length - 1 ? "Next Issue →" : "Finish →"}</button>`;
      }

      container.innerHTML = html;

      container.querySelectorAll("[data-prop]").forEach(b => b.addEventListener("click", () => { selectedProposal = parseInt(b.dataset.prop, 10); draw(); }));
      const cast = container.querySelector("#castVote");
      if (cast) cast.addEventListener("click", () => {
        // simulate assembly vote: base weight + some randomness, learner's pick gets a small nudge
        const raw = iss.proposals.map((p, idx) => Math.max(0.5, p.weight + (Math.random() * 2 - 1) + (idx === selectedProposal ? 0.6 : 0)));
        const total = raw.reduce((a, b) => a + b, 0);
        const pcts = raw.map(v => Math.round((v / total) * 100));
        // fix rounding to sum ~100
        const winnerIndex = pcts.indexOf(Math.max(...pcts));
        votesCast++;
        if (winnerIndex === selectedProposal) wins++;
        resultsLog.push({ pcts, winnerIndex });
        stage = "result";
        draw();
      });
      const next = container.querySelector("#next");
      if (next) next.addEventListener("click", () => {
        if (stage === "context") { stage = "vote"; }
        else if (stage === "result") { stage = iss.citizenshipNote ? "citizenship" : "advance"; }
        else if (stage === "citizenship") { stage = "advance"; }
        if (stage === "advance") {
          if (i < issues.length - 1) { i++; selectedProposal = null; stage = "context"; }
          else { showEnd(); return; }
        }
        draw();
      });
    }

    function showEnd() {
      ctx.headerExtra.innerHTML = "";
      const alignPct = Math.round((wins / votesCast) * 100);
      const html = ui.endReport({
        icon: "🏛️", iconBg: "#0277BD",
        title: "Assembly Session Complete",
        subtitle: "You participated in direct democratic decision-making, Athenian-style.",
        summaryLines: [
          `Your preferred proposal won <b>${wins} of ${votesCast}</b> votes (${alignPct}%) — a reminder that majority rule doesn't always match any one citizen's preference.`,
          `Only free adult male citizens could vote in this system — women, enslaved people, and metics could not, no matter how the decisions affected them.`
        ],
        reflectionQuestions: [
          "Who participated in these votes, and who was excluded?",
          "What are the strengths of direct democracy, based on what you experienced?",
          "What are its limitations — both for the excluded and for citizens themselves?",
          "How is this different from modern representative democracy?",
          "Did seeing both supporting and opposing arguments change how you voted on any issue?"
        ]
      }) + `<div class="btn-block-group" style="margin-top:18px">
          <button class="btn btn-secondary" id="restartBtn">Restart Assembly</button>
          <button class="btn btn-outline" id="homeBtn">Back to Simulations</button>
        </div>`;
      container.innerHTML = html;
      ctx.finish("Assembly Complete");
      container.querySelector("#restartBtn").addEventListener("click", () => ctx.restart());
      container.querySelector("#homeBtn").addEventListener("click", () => ctx.exitToIntro());
    }

    draw();
  }

  VSL.registerSim({
    id: "athens",
    title: "Athens: Build a Democracy",
    tagline: "Debate, vote, and experience direct democracy — and its limits.",
    icon: "🏺",
    color: COLOR, colorDark: COLOR_DARK,
    tags: ["Direct Democracy", "Civic Participation", "Debate"],
    description: "Participate in a fictionalized ancient Athenian-style Assembly. Weigh competing proposals, cast your vote, and see how majority rule — and its historical exclusions — actually worked.",
    instructions: [
      "Review each civic issue and the proposals being debated.",
      "Read supporting and opposing arguments for each proposal.",
      "Cast your vote — the Assembly's result may or may not match your choice.",
      "Learn who could — and couldn't — participate in this political system."
    ],
    render
  });
})();
