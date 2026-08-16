(function () {
  "use strict";
  const { ui, esc } = VSL;
  const COLOR = "#8D6E63", COLOR_DARK = "#5D4037";

  const challenges = [
    { id: "aqueduct", title: "Aqueduct: Supply Water to the Settlement", desc: "Water must flow by gravity alone from a distant spring to the settlement. The gradient must be gentle enough to avoid overflow damage, but steep enough that water actually flows.",
      gaugeNote: "Workable gradient zone",
      options: [
        { label: "Direct steep route over the hills", desc: "Short distance, very steep drop", gaugePos: 90, cost: 20, effects: { budget: -20, durability: -15, efficiency: 5 },
          feedback: { immediate: "Water rushes too quickly, eroding the channel and risking collapse.", longterm: "Frequent repairs will be needed, undermining the aqueduct's reliability.", insight: "An overly steep gradient caused erosion and structural damage — Roman engineers carefully controlled slope for this reason." } },
        { label: "Contour route following gentle terrain", desc: "Longer, moderate and workable gradient", gaugePos: 45, cost: 34, effects: { budget: -34, durability: 18, efficiency: 14 },
          feedback: { immediate: "Water flows steadily at a controlled rate.", longterm: "The channel requires only routine maintenance.", insight: "Roman aqueducts often used long, gently sloping routes — sometimes many kilometers longer than a direct line — to maintain a safe, steady gradient." } },
        { label: "Very long, extremely gentle route with arched sections", desc: "Costly but highly reliable", gaugePos: 25, cost: 48, effects: { budget: -48, durability: 26, efficiency: 10 },
          feedback: { immediate: "Construction is expensive and slow, using elevated arches to maintain gradient across valleys.", longterm: "The aqueduct proves extremely durable and reliable for generations.", insight: "Monumental arched aqueducts allowed Romans to maintain a workable gradient even across uneven terrain, at significant cost." } }
      ] },
    { id: "road", title: "Road: Connect the Settlement to a Trade Town", desc: "The terrain between the settlement and a nearby trade town includes hills and a river valley.",
      gaugeNote: null,
      options: [
        { label: "Direct route straight over the hills", desc: "Shortest distance, steep grades", gaugePos: 80, cost: 22, effects: { budget: -22, durability: -8, efficiency: 16 },
          feedback: { immediate: "Travel time is minimized.", longterm: "Steep sections erode quickly and need frequent repair, especially after rain.", insight: "Roman road builders sometimes chose direct routes for military speed, accepting higher maintenance costs." } },
        { label: "Route around via the valley floor", desc: "Longer, gentler gradients", gaugePos: 35, cost: 26, effects: { budget: -26, durability: 14, efficiency: 8 },
          feedback: { immediate: "The route takes longer to travel but is easier to build and maintain.", longterm: "Lower long-term maintenance costs make this a durable choice.", insight: "Gentler terrain reduced both construction difficulty and long-term erosion damage." } },
        { label: "Engineered route with cut embankments through hills", desc: "Balanced distance and durability, high upfront cost", gaugePos: 55, cost: 38, effects: { budget: -38, durability: 20, efficiency: 18 },
          feedback: { immediate: "Cutting through terrain requires significant labour and material.", longterm: "The resulting road is both relatively direct and durable.", insight: "Roman engineers were known for reshaping terrain itself — cutting and embanking — to achieve efficient, lasting roads." } }
      ] },
    { id: "bridge", title: "Bridge: Cross the River", desc: "The road must cross a river en route to the settlement.",
      gaugeNote: null,
      options: [
        { label: "Basic ford crossing", desc: "Free, but unreliable in high water", cost: 0, effects: { budget: 0, durability: -10, efficiency: -8 },
          feedback: { immediate: "No construction cost is needed.", longterm: "The crossing becomes impassable during floods, disrupting trade and travel.", insight: "Simple fords were common for minor routes but were unreliable for regular or heavy trade traffic." } },
        { label: "Wooden bridge", desc: "Moderate cost, moderate durability", cost: 16, effects: { budget: -16, durability: 8, efficiency: 6 },
          feedback: { immediate: "The bridge allows reliable crossing at moderate cost.", longterm: "Wood requires periodic replacement due to weathering.", insight: "Wooden bridges balanced cost and function but needed regular upkeep compared to stone." } },
        { label: "Stone arch bridge", desc: "Expensive, highly durable, high capacity", cost: 30, effects: { budget: -30, durability: 22, efficiency: 12 },
          feedback: { immediate: "Construction is costly and labour-intensive.", longterm: "The bridge remains functional with minimal maintenance for a very long time.", insight: "Roman stone arch bridges were engineered to last centuries — some remained in use long after the empire itself." } }
      ] }
  ];

  function gaugeHTML(pos, note) {
    return `<div class="route-gauge"><div class="marker" style="left:${pos}%"></div></div>
      <div style="display:flex;justify-content:space-between" class="small"><span>Too Steep / Unreliable</span><span>Ideal</span><span>Very Gentle / Costly</span></div>
      ${note ? `<p class="small" style="margin-top:6px;color:#77808F">${note}</p>` : ""}`;
  }

  function render(container, ctx) {
    let idx = 0;
    let stage = "brief"; // brief -> choose -> feedback
    let chosenIndex = null;
    const stats = { budget: 100, durability: 0, efficiency: 0 };
    const chosen = [];

    function ch() { return challenges[idx]; }

    function draw() {
      ctx.headerExtra.innerHTML = ui.progressBar(idx + 1, challenges.length, `Project ${idx + 1} of ${challenges.length}`);
      const c = ch();
      const dash = ui.dashGrid([
        { label: "Budget", value: Math.max(0, stats.budget), color: "#FFB300", pct: Math.max(0, stats.budget) },
        { label: "Durability", value: stats.durability, color: "#43A047", pct: Math.min(100, Math.max(0, stats.durability * 2)) },
        { label: "Efficiency", value: stats.efficiency, color: "#1976D2", pct: Math.min(100, Math.max(0, stats.efficiency * 2)) }
      ]);
      let html = dash;

      if (stage === "brief") {
        html += `<div class="card"><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p></div>
          <button class="btn btn-primary" id="next">Survey Route Options →</button>`;
      } else if (stage === "choose") {
        html += `<div class="card"><h3 style="margin-bottom:8px">${esc(c.title)}</h3>`;
        html += c.options.map((o, i) => `
          <div class="option-btn" data-opt="${i}" style="margin-bottom:10px;cursor:pointer">
            <div class="op-label">${esc(o.label)}</div>
            <div class="op-desc">${esc(o.desc)} — Cost: ${o.cost} resources</div>
            ${o.gaugePos != null ? gaugeHTML(o.gaugePos, null) : ""}
          </div>`).join("");
        html += `</div>`;
      } else if (stage === "feedback") {
        const o = c.options[chosenIndex];
        html += `<div class="card"><h3 style="margin-bottom:8px">${esc(c.title)}</h3>
          <div class="op-label">${esc(o.label)}</div>
          ${o.gaugePos != null ? gaugeHTML(o.gaugePos, null) : ""}
          </div>`;
        html += ui.feedbackPanel([
          { label: "Immediate Effect", text: o.feedback.immediate },
          { label: "Long-Term Effect", text: o.feedback.longterm }
        ]);
        html += ui.insightPanel("Engineering Insight", o.feedback.insight);
        html += `<button class="btn btn-primary" id="next">${idx < challenges.length - 1 ? "Next Project →" : "Final Integrated Review →"}</button>`;
      }

      container.innerHTML = html;
      container.querySelectorAll("[data-opt]").forEach(b => b.addEventListener("click", () => {
        const i = parseInt(b.dataset.opt, 10);
        chosenIndex = i;
        const o = c.options[i];
        stats.budget += o.effects.budget;
        stats.durability += o.effects.durability;
        stats.efficiency += o.effects.efficiency;
        chosen.push({ title: c.title, choice: o.label });
        stage = "feedback";
        draw();
      }));
      const next = container.querySelector("#next");
      if (next) next.addEventListener("click", () => {
        if (stage === "brief") { stage = "choose"; }
        else if (stage === "feedback") {
          if (idx < challenges.length - 1) { idx++; stage = "brief"; chosenIndex = null; }
          else { showEnd(); return; }
        }
        draw();
      });
    }

    function showEnd() {
      ctx.headerExtra.innerHTML = "";
      const overBudget = stats.budget < 0;
      let title, subtitle, icon, iconBg;
      if (overBudget) { title = "Over Budget — Project Strained"; icon = "⚠️"; iconBg = "#E53935"; subtitle = "Your infrastructure works, but exceeded the available budget."; }
      else if (stats.durability >= 40 && stats.efficiency >= 25) { title = "A Well-Engineered Network"; icon = "🏛️"; iconBg = "#43A047"; subtitle = "Water, roads and river crossing form a durable, efficient system."; }
      else if (stats.durability >= 15) { title = "A Functional but Imperfect Network"; icon = "🛠️"; iconBg = "#1976D2"; subtitle = "Your infrastructure works, with some trade-offs in durability or efficiency."; }
      else { title = "A Fragile Network"; icon = "🌉"; iconBg = "#FFB300"; subtitle = "Your infrastructure is functional but will require frequent repair."; }

      const html = ui.endReport({
        icon, iconBg, title, subtitle,
        summaryLines: [
          `You connected a <b>water source → settlement → road → river crossing</b> using a fixed resource budget.`,
          `Remaining budget: <b>${stats.budget}</b>. Durability score: <b>${stats.durability}</b>. Efficiency score: <b>${stats.efficiency}</b>.`
        ],
        stats: chosen.map(c => ({ label: c.title, value: c.choice })),
        reflectionQuestions: [
          "Why did Roman engineers often choose longer routes with gentler gradients over direct paths?",
          "What trade-offs did you make between cost, durability and efficiency?",
          "Why does infrastructure require ongoing maintenance rather than being 'built once'?",
          "How did terrain shape the engineering choices available to you?",
          "Which of your three decisions would you change if budget were unlimited — and why?"
        ]
      }) + `<div class="btn-block-group" style="margin-top:18px">
          <button class="btn btn-secondary" id="restartBtn">Restart Simulation</button>
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
    id: "romeengineering",
    title: "Rome: Engineer an Empire",
    tagline: "Solve real infrastructure problems: water, roads, and river crossings.",
    icon: "🏗️",
    color: COLOR, colorDark: COLOR_DARK,
    tags: ["Engineering", "Infrastructure", "Problem Solving"],
    description: "Act as a Roman infrastructure planner. Choose routes for an aqueduct, a road, and a bridge — each with real trade-offs between cost, gradient, durability and efficiency.",
    instructions: [
      "Review each engineering challenge: aqueduct, road, and bridge.",
      "Choose a route or construction method — watch the gradient gauge for aqueducts and roads.",
      "See the immediate and long-term engineering consequences of your choice.",
      "Complete all three to see your integrated infrastructure network reviewed."
    ],
    render
  });
})();
