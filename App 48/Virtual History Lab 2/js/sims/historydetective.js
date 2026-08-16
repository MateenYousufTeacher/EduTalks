(function () {
  "use strict";
  const { ui, esc } = VSL;
  const COLOR = "#4E342E", COLOR_DARK = "#2E1D19";
  const REL_LEVELS = ["Low", "Moderate", "High"];

  const cases = [
    { title: "The Vanished Marketplace", question: "What happened to the once-busy central marketplace of a fictional river town?",
      evidence: [
        { type: "Written Document", text: "A merchant's letter, dated shortly before the marketplace's decline, complains that 'the river has moved and boats no longer reach us easily.'", actualRel: 2, hint: "Written close to the event, but reflects one person's perspective." },
        { type: "Numerical Evidence", text: "Tax records show marketplace revenue dropped by two-thirds over five years.", actualRel: 2, hint: "Concrete data, though it doesn't explain the cause on its own." },
        { type: "Map", text: "Two maps drawn thirty years apart show the river channel shifted nearly a kilometer away from the old town center.", actualRel: 2, hint: "Physical/geographic evidence, generally reliable if the maps are accurately dated." },
        { type: "Witness Account", text: "A much later local legend claims the marketplace was 'cursed' and abandoned overnight.", actualRel: 0, hint: "Recorded long after the fact, framed as legend rather than direct observation." },
        { type: "Artifact", text: "Archaeologists find abandoned mooring posts far from the current riverbank.", actualRel: 2, hint: "Physical evidence consistent with the river having moved." }
      ],
      claims: [
        { label: "The marketplace declined because the river shifted away from the town, disrupting trade access.", correct: true },
        { label: "The marketplace was destroyed suddenly by a single dramatic event, as local legend claims.", correct: false },
        { label: "There is no reliable evidence explaining the marketplace's decline.", correct: false }
      ],
      insight: "Multiple independent, reasonably reliable sources (letter, tax records, maps, mooring posts) point toward the same physical explanation — a shifting river — while the least reliable source (a much later legend) suggested something dramatically different. Historians weigh corroboration and proximity to the event over dramatic storytelling." },
    { title: "Why Was the Settlement Abandoned?", question: "A hillside settlement was abandoned within a generation. What best explains why?",
      evidence: [
        { type: "Numerical Evidence", text: "Analysis of storage pits shows grain reserves shrank steadily over the settlement's final fifteen years.", actualRel: 2, hint: "Physical/quantitative evidence, generally reliable." },
        { type: "Written Document", text: "A neighboring settlement's record, written decades later, claims the hillside people were 'driven out by raiders.'", actualRel: 1, hint: "Secondhand, written after the fact, from an outside source." },
        { type: "Artifact", text: "Farming tools recovered show increasing wear and improvised repairs in later years, suggesting resource scarcity.", actualRel: 2, hint: "Direct physical evidence from the site itself." },
        { type: "Visual Source", text: "Faded wall paintings from the settlement's final years depict unusually thin livestock.", actualRel: 1, hint: "Suggestive but open to some interpretation." },
        { type: "Witness Account", text: "No contemporary written account from within the settlement survives.", actualRel: 0, hint: "This is an absence of evidence, not evidence itself — it can't be scored as support." }
      ],
      claims: [
        { label: "The settlement was abandoned primarily due to resource decline (dwindling food and worn tools), not a single violent event.", correct: true },
        { label: "The settlement was definitely destroyed by raiders, as the neighboring record states.", correct: false },
        { label: "The settlement thrived until suddenly disappearing for unknown reasons.", correct: false }
      ],
      insight: "Direct physical evidence from the site (grain pits, tool wear) consistently pointed to gradual resource decline, while the raider account was secondhand, later, and from an external source — still useful, but weaker than site-based evidence. Good historical reasoning weighs the quality and proximity of sources, not just their drama." },
    { title: "Reconstructing a Historical Journey", question: "A trader is said to have completed a long journey between two distant regions. What can be reliably reconstructed?",
      evidence: [
        { type: "Written Document", text: "The trader's own travel journal describes specific towns, dates, and goods carried.", actualRel: 2, hint: "A firsthand primary source, though self-reported." },
        { type: "Numerical Evidence", text: "Customs records at one destination city list goods matching the journal's description arriving around the claimed date.", actualRel: 2, hint: "Independent corroboration from a different type of source." },
        { type: "Map", text: "A near-contemporary map shows a trade route roughly matching the journal's described path.", actualRel: 2, hint: "Independent supporting evidence, though maps of this era had real limitations." },
        { type: "Witness Account", text: "A folk song composed generations later describes the journey with exaggerated, fantastical details.", actualRel: 0, hint: "Created long after, in a genre not meant to be literally factual." }
      ],
      claims: [
        { label: "The core journey likely happened largely as described, supported by independent corroborating records.", correct: true },
        { label: "The journey should be dismissed since it partly relies on the trader's own account.", correct: false },
        { label: "The fantastical folk song is the most trustworthy account since it's the most detailed and vivid.", correct: false }
      ],
      insight: "A firsthand account alone has real limits — but when independent, different types of sources (customs records, a map) corroborate its core details, historians can reconstruct the journey with reasonable confidence, while still treating later, embellished retellings (like the folk song) very differently." }
  ];

  function render(container, ctx) {
    let idx = 0;
    let stage = "intro"; // intro -> evidence -> hypothesis -> verdict
    let ratings = {};
    let chosenClaim = null;
    let scoreTotal = 0, scoreMax = 0;

    function c() { return cases[idx]; }

    function draw() {
      ctx.headerExtra.innerHTML = ui.progressBar(idx + 1, cases.length, `Case ${idx + 1} of ${cases.length}`);
      let html = "";

      if (stage === "intro") {
        html = `<div class="info-callout">Educational Simulation — a fictionalized historical investigation case.</div>
          <div class="card"><h3>${esc(c().title)}</h3><p><b>What happened here?</b> ${esc(c().question)}</p></div>
          <button class="btn btn-primary" id="next">Examine the Evidence →</button>`;
      } else if (stage === "evidence") {
        html = `<div class="card"><h3 style="margin-bottom:4px">Evidence Board</h3><p class="small" style="color:#77808F">For each source, rate how reliable you think it is before forming a conclusion.</p></div>`;
        html += c().evidence.map((e, i) => `<div class="evidence-card">
          <div class="ec-top"><span class="ec-type">${esc(e.type)}</span></div>
          <p style="margin:6px 0">${esc(e.text)}</p>
          <div class="reliability-select">
            ${REL_LEVELS.map((lvl, li) => `<button data-rel="${i}:${li}" class="${ratings[i] === li ? "active" : ""}">${lvl}</button>`).join("")}
          </div>
        </div>`).join("");
        const allRated = c().evidence.every((_, i) => ratings[i] != null);
        html += `<button class="btn btn-primary" id="next" ${allRated ? "" : "disabled"} style="margin-top:6px">Form a Hypothesis →</button>`;
      } else if (stage === "hypothesis") {
        html = `<div class="card"><h3>What Best Explains the Evidence?</h3><p class="small" style="color:#77808F">Choose the claim you think is best supported.</p></div>`;
        html += c().claims.map((cl, i) => `<div class="option-btn" data-claim="${i}" style="margin-bottom:9px;cursor:pointer"><div class="op-label">${esc(cl.label)}</div></div>`).join("");
      } else if (stage === "verdict") {
        const correctIdx = c().claims.findIndex(cl => cl.correct);
        const gotIt = chosenClaim === correctIdx;
        let relScore = 0;
        c().evidence.forEach((e, i) => { if (ratings[i] === e.actualRel) relScore++; });
        html = `<div class="card">
          <h3>Investigator's Verdict</h3>
          <p><b>Best-supported claim:</b> ${esc(c().claims[correctIdx].label)}</p>
          <p><b>Your evidence-reliability accuracy:</b> ${relScore} / ${c().evidence.length}</p>
          <div class="info-callout ${gotIt ? "" : "warn"}">${gotIt ? "Your chosen claim matches the best-supported conclusion." : "Your chosen claim differs from the best-supported conclusion — see the reasoning below."}</div>
        </div>`;
        html += ui.insightPanel("Historical Insight", c().insight);
        html += `<button class="btn btn-primary" id="next">${idx < cases.length - 1 ? "Next Case →" : "Close the Case Files →"}</button>`;
      }

      container.innerHTML = html;

      container.querySelectorAll("[data-rel]").forEach(b => b.addEventListener("click", () => {
        const [i, li] = b.dataset.rel.split(":").map(Number);
        ratings[i] = li;
        draw();
      }));
      container.querySelectorAll("[data-claim]").forEach(b => b.addEventListener("click", () => {
        chosenClaim = parseInt(b.dataset.claim, 10);
        const correctIdx = c().claims.findIndex(cl => cl.correct);
        scoreMax += c().evidence.length + 1;
        c().evidence.forEach((e, i) => { if (ratings[i] === e.actualRel) scoreTotal++; });
        if (chosenClaim === correctIdx) scoreTotal++;
        stage = "verdict";
        draw();
      }));
      const next = container.querySelector("#next");
      if (next) next.addEventListener("click", () => {
        if (stage === "intro") stage = "evidence";
        else if (stage === "evidence") stage = "hypothesis";
        else if (stage === "verdict") {
          if (idx < cases.length - 1) { idx++; stage = "intro"; ratings = {}; chosenClaim = null; }
          else { showEnd(); return; }
        }
        draw();
      });
    }

    function showEnd() {
      ctx.headerExtra.innerHTML = "";
      const pct = Math.round((scoreTotal / scoreMax) * 100);
      let title, subtitle, icon, iconBg, confidence;
      if (pct >= 75) { title = "Skilled Historical Investigator"; icon = "🕵️"; iconBg = "#43A047"; confidence = "High"; subtitle = "You consistently weighed evidence quality and corroboration well."; }
      else if (pct >= 45) { title = "Developing Investigator"; icon = "📋"; iconBg = "#1976D2"; confidence = "Moderate"; subtitle = "You showed solid reasoning with room to refine reliability judgments."; }
      else { title = "Early-Stage Investigator"; icon = "🔍"; iconBg = "#FFB300"; confidence = "Low"; subtitle = "Revisit how source type, timing, and corroboration affect reliability."; }

      const html = ui.endReport({
        icon, iconBg, title, subtitle,
        summaryLines: [
          `Overall investigator confidence: <b>${confidence}</b> (${pct}% evidence-reasoning accuracy across three cases).`,
          `Historical evidence rarely offers absolute certainty — historians reason toward the best-supported conclusion, not a guaranteed truth.`
        ],
        reflectionQuestions: [
          "What is the difference between evidence and interpretation?",
          "Why does corroboration across independent, different types of sources matter so much?",
          "How did the timing of a source (written at the event vs. much later) affect its reliability?",
          "Why might historians sometimes disagree even when looking at the same evidence?",
          "Which piece of evidence across all three cases most changed your thinking, and why?"
        ]
      }) + `<div class="btn-block-group" style="margin-top:18px">
          <button class="btn btn-secondary" id="restartBtn">Restart Investigation</button>
          <button class="btn btn-outline" id="homeBtn">Back to Simulations</button>
        </div>`;
      container.innerHTML = html;
      ctx.finish(title);
      container.querySelector("#restartBtn").addEventListener("click", () => ctx.restart());
      container.querySelector("#homeBtn").addEventListener("click", () => ctx.exitToIntro());
    }

    draw();
  }

  VSL.registerSim({
    id: "historydetective",
    title: "History Detective: Reconstruct the Past",
    tagline: "Investigate fictionalized cases using primary evidence, not memorized dates.",
    icon: "🕵️",
    color: COLOR, colorDark: COLOR_DARK,
    tags: ["Primary Sources", "Evidence Reliability", "Historical Reasoning"],
    description: "Investigate three fictionalized historical mysteries. Rate the reliability of different evidence types, then decide which explanation the evidence best supports.",
    instructions: [
      "Read each case's central question: what happened here?",
      "Rate the reliability of each piece of evidence — written, physical, visual, or oral.",
      "Choose the claim you believe is best supported by the evidence.",
      "See the investigator's verdict and reasoning, then move to the next case."
    ],
    render
  });
})();
