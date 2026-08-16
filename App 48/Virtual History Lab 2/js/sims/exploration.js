(function () {
  "use strict";
  const { ui, esc, clamp, pick } = VSL;
  const COLOR = "#00695C", COLOR_DARK = "#003D33";

  const INSTRUMENTS = {
    compass: { name: "Compass", accuracy: 12, note: "Reliable for direction, but doesn't measure position." },
    astrolabe: { name: "Astrolabe (celestial angle)", accuracy: 22, note: "Improves latitude estimates using star or sun angle, but requires clear skies." },
    quadrant: { name: "Quadrant", accuracy: 18, note: "A simpler angle-measuring tool, moderately reliable at sea." },
    log: { name: "Log & Time Estimation", accuracy: 15, note: "Estimates speed and distance traveled, but drifts with currents." }
  };

  const voyages = [
    { title: "Coastal Voyage", desc: "A relatively short voyage along a mapped coastline to a known port.", baseError: 10, distance: 120 },
    { title: "Open-Water Crossing", desc: "A longer crossing beyond sight of land, relying on instruments and estimation.", baseError: 25, distance: 340 },
    { title: "Uncharted Approach", desc: "A voyage toward a coastline unfamiliar to your navigators — though, of course, not unfamiliar to the people who already live there.", baseError: 35, distance: 260 }
  ];

  function render(container, ctx) {
    let vIdx = 0;
    let stage = "brief"; // brief -> instruments -> conditions -> voyage -> result
    let chosenInstruments = [];
    let windChoice = null;
    let totalAccuracy = 0, totalError = 0;
    const results = [];

    function v() { return voyages[vIdx]; }

    function draw() {
      ctx.headerExtra.innerHTML = ui.progressBar(vIdx + 1, voyages.length, `Voyage ${vIdx + 1} of ${voyages.length}`);
      let html = "";

      if (stage === "brief") {
        html = `<div class="info-callout">This map is an original fictionalized navigation scenario — not a real historical route.</div>
          <div class="card"><h3>${esc(v().title)}</h3><p>${esc(v().desc)}</p><p class="small" style="color:#77808F">Estimated distance: ${v().distance} nautical units</p></div>
          <button class="btn btn-primary" id="next">Prepare for Departure →</button>`;
      } else if (stage === "instruments") {
        html = `<div class="card"><h3>Choose Your Instruments</h3><p class="small" style="color:#77808F">Select the instruments your navigator will use. Each improves accuracy differently.</p>
          <div class="pill-select" style="margin-top:10px">
          ${Object.keys(INSTRUMENTS).map(k => `<button data-inst="${k}" class="${chosenInstruments.includes(k) ? "active" : ""}">${INSTRUMENTS[k].name}</button>`).join("")}
          </div></div>
          ${chosenInstruments.map(k => `<div class="info-callout">${esc(INSTRUMENTS[k].name)}: ${esc(INSTRUMENTS[k].note)}</div>`).join("")}
          <button class="btn btn-primary" id="next" ${chosenInstruments.length === 0 ? "disabled" : ""}>Assess Wind &amp; Current →</button>`;
      } else if (stage === "conditions") {
        const winds = [
          { id: "favorable", label: "Favorable trade winds", effect: -8, desc: "Currents assist the voyage, reducing drift." },
          { id: "mixed", label: "Mixed, shifting winds", effect: 4, desc: "Unpredictable conditions increase navigational uncertainty." },
          { id: "adverse", label: "Adverse currents", effect: 12, desc: "Currents push the ship off its intended course." }
        ];
        html = `<div class="card"><h3>Wind &amp; Current Conditions</h3><p class="small" style="color:#77808F">Choose the condition report your navigator believes applies (based on the season).</p>`;
        html += winds.map(w => `<div class="option-btn" data-wind="${w.id}" style="margin-bottom:9px;cursor:pointer">
          <div class="op-label">${w.label}</div><div class="op-desc">${w.desc}</div>
        </div>`).join("");
        html += `</div>`;
        container._winds = winds;
      } else if (stage === "voyage") {
        const r = results[results.length - 1];
        html = `<div class="card"><h3>Voyage Underway</h3>
          <p>Your navigator estimates the ship's position using: <b>${chosenInstruments.map(k => INSTRUMENTS[k].name).join(", ")}</b>.</p>
          <div class="info-callout">Estimated position error margin: <b>±${r.errorMargin} units</b></div>
          <p class="small" style="color:#77808F">${r.narrative}</p>
        </div>`;
        html += `<button class="btn btn-primary" id="next">See Landfall Result →</button>`;
      } else if (stage === "result") {
        const r = results[results.length - 1];
        html = `<div class="card"><h3>Landfall</h3>
          <div class="dash-grid">
            <div class="dash-stat"><div class="ds-label">Estimated Position</div><div class="ds-val" style="color:#1976D2">${r.estimated} units</div></div>
            <div class="dash-stat"><div class="ds-label">Actual Position</div><div class="ds-val" style="color:#43A047">${r.actual} units</div></div>
          </div>
          <p>${r.outcomeText}</p>
        </div>`;
        html += ui.insightPanel("Navigation Insight", r.insight);
        html += `<button class="btn btn-primary" id="next">${vIdx < voyages.length - 1 ? "Next Voyage →" : "Finish Voyages →"}</button>`;
      }

      container.innerHTML = html;

      container.querySelectorAll("[data-inst]").forEach(b => b.addEventListener("click", () => {
        const k = b.dataset.inst;
        const i = chosenInstruments.indexOf(k);
        if (i >= 0) chosenInstruments.splice(i, 1); else chosenInstruments.push(k);
        draw();
      }));
      container.querySelectorAll("[data-wind]").forEach(b => b.addEventListener("click", () => {
        windChoice = container._winds.find(w => w.id === b.dataset.wind);
        runVoyage();
      }));
      const next = container.querySelector("#next");
      if (next) next.addEventListener("click", () => {
        if (stage === "brief") stage = "instruments";
        else if (stage === "instruments") stage = "conditions";
        else if (stage === "voyage") stage = "result";
        else if (stage === "result") {
          if (vIdx < voyages.length - 1) { vIdx++; stage = "brief"; chosenInstruments = []; windChoice = null; }
          else { showEnd(); return; }
        }
        draw();
      });
    }

    function runVoyage() {
      const instAcc = chosenInstruments.reduce((a, k) => a + INSTRUMENTS[k].accuracy, 0);
      let errorMargin = Math.max(4, v().baseError - Math.round(instAcc * 0.5) + windChoice.effect);
      errorMargin = clamp(errorMargin, 4, 60);
      const actual = v().distance;
      const drift = Math.round((Math.random() * 2 - 1) * errorMargin);
      const estimated = actual + drift;
      totalAccuracy += Math.max(0, 100 - errorMargin);
      totalError += errorMargin;

      let outcomeText, insight;
      if (Math.abs(drift) <= errorMargin * 0.3) {
        outcomeText = "Your navigator's estimate closely matches the ship's true position — a strong landfall near the intended target.";
        insight = "Combining multiple instruments and accounting for wind/current conditions substantially reduced navigational uncertainty, just as it did historically.";
      } else if (Math.abs(drift) <= errorMargin) {
        outcomeText = "The ship arrives within the expected margin of error, though not exactly where predicted.";
        insight = "Even well-equipped historical voyages routinely landed some distance from their intended target — this was considered a successful outcome, not a failure.";
      } else {
        outcomeText = "The ship arrives significantly off course, illustrating how much uncertainty early navigation carried.";
        insight = "Limited instruments and unpredictable currents meant that significant navigational error was common, even for experienced crews.";
      }

      results.push({
        errorMargin, estimated, actual,
        narrative: `With ${windChoice.label.toLowerCase()}, your instruments suggest a position estimate — but the true position won't be confirmed until landfall.`,
        outcomeText, insight
      });
      stage = "voyage";
      draw();
    }

    function showEnd() {
      ctx.headerExtra.innerHTML = "";
      const avgAccuracy = Math.round(totalAccuracy / voyages.length);
      let title, subtitle, icon, iconBg;
      if (avgAccuracy >= 75) { title = "A Master Navigator"; icon = "🧭"; iconBg = "#43A047"; subtitle = "Careful instrument use and route planning paid off across all three voyages."; }
      else if (avgAccuracy >= 50) { title = "A Capable Navigator"; icon = "⛵"; iconBg = "#1976D2"; subtitle = "You managed real uncertainty reasonably well."; }
      else { title = "A Navigator Facing Real Uncertainty"; icon = "🌊"; iconBg = "#FFB300"; subtitle = "Your voyages reflect how genuinely difficult early navigation was."; }

      const html = ui.endReport({
        icon, iconBg, title, subtitle,
        summaryLines: [
          `Average navigational accuracy across three voyages: <b>${avgAccuracy}%</b>.`,
          `Instruments reduced — but never eliminated — uncertainty. Maps of this era were necessarily imperfect representations of a world only partly known to European navigators, even though it was well known to the people already living there.`
        ],
        reflectionQuestions: [
          "How did combining multiple instruments change your estimated error margin?",
          "Why might 'landing near' a destination have counted as a successful voyage historically?",
          "How did wind and current conditions complicate navigation, even with good instruments?",
          "Why is 'unknown to the navigator' a more accurate phrase than 'undiscovered'?",
          "What real risks would inaccurate navigation have posed to historical sailors?"
        ]
      }) + `<div class="btn-block-group" style="margin-top:18px">
          <button class="btn btn-secondary" id="restartBtn">Restart Voyages</button>
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
    id: "exploration",
    title: "Age of Exploration: Navigate the Unknown",
    tagline: "Plan voyages using historical navigation instruments under real uncertainty.",
    icon: "🧭",
    color: COLOR, colorDark: COLOR_DARK,
    tags: ["Navigation", "Cartography", "Uncertainty"],
    description: "Plan three voyages using simplified historical instruments. Manage wind, currents, and navigational uncertainty — understanding why maps and positions were rarely exact.",
    instructions: [
      "Select instruments for your navigator to use on each voyage.",
      "Assess wind and current conditions before departure.",
      "See your estimated vs. actual position on arrival, with a realistic error margin.",
      "Complete three increasingly difficult voyages to see your navigational record."
    ],
    render
  });
})();
