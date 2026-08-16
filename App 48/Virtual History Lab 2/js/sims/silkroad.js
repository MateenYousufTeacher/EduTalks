(function () {
  "use strict";
  const { ui, esc, clamp, pick } = VSL;
  const COLOR = "#EF6C00", COLOR_DARK = "#A34D00";

  const GOODS = ["Silk", "Spices", "Ceramics"];
  const CITIES = {
    changan: { name: "Chang'an", region: "Chinese trading center",
      prices: { Silk: { buy: 4, sell: 11 }, Spices: { buy: 10, sell: 6 }, Ceramics: { buy: 5, sell: 9 } },
      culture: "Chang'an's markets introduce you to fine porcelain techniques and paper-making innovations." },
    samarkand: { name: "Samarkand", region: "Central Asian trading center",
      prices: { Silk: { buy: 9, sell: 8 }, Spices: { buy: 6, sell: 12 }, Ceramics: { buy: 8, sell: 7 } },
      culture: "Samarkand sits at a crossroads of languages and faiths, where merchants exchange more than goods." },
    baghdad: { name: "Baghdad", region: "West Asian trading center",
      prices: { Silk: { buy: 8, sell: 10 }, Spices: { buy: 5, sell: 8 }, Ceramics: { buy: 9, sell: 13 } },
      culture: "Baghdad's House of Wisdom draws scholars translating and expanding knowledge from many civilizations." }
  };
  const ROUTES = [
    { from: "changan", to: "samarkand", distance: "Long", cost: 6, risk: 0.28 },
    { from: "samarkand", to: "baghdad", distance: "Medium", cost: 4, risk: 0.22 },
    { from: "baghdad", to: "changan", distance: "Very Long", cost: 9, risk: 0.32 },
    { from: "samarkand", to: "changan", distance: "Long", cost: 6, risk: 0.28 },
    { from: "baghdad", to: "samarkand", distance: "Medium", cost: 4, risk: 0.22 },
    { from: "changan", to: "baghdad", distance: "Very Long", cost: 9, risk: 0.32 }
  ];
  const RISK_EVENTS = [
    { title: "Bandit Toll", text: "Bandits demand payment to let the caravan pass safely.", effect: c => ({ capital: -Math.min(c.capital, 8) }) },
    { title: "Storm Delay", text: "A sandstorm forces the caravan to shelter, delaying arrival but causing no losses.", effect: () => ({}) },
    { title: "Spoiled Cargo", text: "Part of the cargo is damaged crossing rough terrain.", effect: () => ({ spoil: true }) }
  ];

  function render(container, ctx) {
    let current = "changan";
    let capital = 60;
    let journey = 0;
    const totalJourneys = 4;
    let cargo = { Silk: 0, Spices: 0, Ceramics: 0 };
    let stage = "market"; // market -> route -> travel -> sell -> culture
    let destKey = null;
    let lastEvent = null;
    let journeyLog = [];
    let cultureCards = [];

    function city() { return CITIES[current]; }

    function cargoValueAtBuy() {
      let sum = 0;
      GOODS.forEach(g => sum += cargo[g] * city().prices[g].buy);
      return sum;
    }

    function draw() {
      ctx.headerExtra.innerHTML = ui.progressBar(journey + 1, totalJourneys, `Journey ${journey + 1} of ${totalJourneys}`);
      const dash = ui.dashGrid([
        { label: "Capital (silver)", value: capital, color: "#FFB300", pct: clamp(capital, 0, 100) },
        { label: "Current City", value: city().name, color: "#1976D2" }
      ]);
      let html = dash;

      if (stage === "market") {
        html += `<div class="card"><h3>${esc(city().name)}</h3><p class="small" style="color:#77808F">${esc(city().region)}</p>
          <div class="section-title" style="margin-top:12px">Buy Goods</div>
          ${GOODS.map(g => `<div class="market-row">
            <div><div class="g-name">${g}</div><div class="g-price">Buy: ${city().prices[g].buy} silver each</div></div>
            <div class="stepper">
              <button data-dec="${g}">−</button><span class="val" id="val-${g}">${cargo[g]}</span><button data-inc="${g}">+</button>
            </div>
          </div>`).join("")}
          </div>
          <div class="info-callout">Cargo cost so far: <b>${cargoValueAtBuy()} silver</b> · Remaining capital: <b>${capital - cargoValueAtBuy()}</b></div>
          <button class="btn btn-primary" id="next">Choose a Route →</button>`;
      } else if (stage === "route") {
        const options = ROUTES.filter(r => r.from === current);
        html += `<div class="card"><h3>Plan Your Route</h3><p class="small" style="color:#77808F">Choose your next destination. Longer routes cost more and carry more risk.</p>
          ${options.map((r, i) => `<div class="option-btn" data-route="${i}" style="margin-bottom:9px;cursor:pointer">
            <div class="op-label">${CITIES[r.to].name}</div>
            <div class="op-desc">Distance: ${r.distance} · Transport cost: ${r.cost} silver · Risk: ${Math.round(r.risk * 100)}%</div>
          </div>`).join("")}
          </div>`;
        container._routeOptions = options;
      } else if (stage === "travel") {
        html += ui.eventCard(lastEvent.title, lastEvent.text, "Journey Event");
        html += `<button class="btn btn-primary" id="next">Arrive at ${esc(CITIES[destKey].name)} →</button>`;
      } else if (stage === "sell") {
        const dest = CITIES[destKey];
        let revenue = 0;
        const rows = GOODS.filter(g => cargo[g] > 0).map(g => {
          const r = cargo[g] * dest.prices[g].sell;
          revenue += r;
          return `<div class="market-row"><div class="g-name">${g} × ${cargo[g]}</div><div class="g-price">Sell: ${dest.prices[g].sell}/each → ${r} silver</div></div>`;
        }).join("") || `<p class="small" style="color:#77808F">You arrived with no cargo to sell.</p>`;
        html += `<div class="card"><h3>Sell at ${esc(dest.name)}</h3>${rows}
          <div class="info-callout" style="margin-top:10px">Total revenue: <b>${revenue} silver</b></div></div>`;
        container._pendingRevenue = revenue;
        html += `<button class="btn btn-primary" id="next">Collect Payment →</button>`;
      } else if (stage === "culture") {
        html += ui.infoCallout(`<b>Cultural Exchange.</b> ${CITIES[destKey].culture}`) +
          `<button class="btn btn-primary" id="next">${journey < totalJourneys - 1 ? "Continue Trading →" : "Finish Trading Career →"}</button>`;
      }

      container.innerHTML = html;

      container.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => {
        const g = b.dataset.inc;
        const cost = city().prices[g].buy;
        if (capital - (cargoValueAtBuy() + cost) >= 0) { cargo[g]++; draw(); }
      }));
      container.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => {
        const g = b.dataset.dec;
        if (cargo[g] > 0) { cargo[g]--; draw(); }
      }));
      container.querySelectorAll("[data-route]").forEach(b => b.addEventListener("click", () => {
        const r = container._routeOptions[parseInt(b.dataset.route, 10)];
        destKey = r.to;
        resolveTravel(r);
      }));
      const next = container.querySelector("#next");
      if (next) next.addEventListener("click", () => {
        if (stage === "market") { stage = "route"; }
        else if (stage === "travel") { stage = "sell"; }
        else if (stage === "sell") {
          capital += container._pendingRevenue;
          journeyLog.push({ city: CITIES[destKey].name, revenue: container._pendingRevenue });
          current = destKey;
          cargo = { Silk: 0, Spices: 0, Ceramics: 0 };
          stage = "culture";
        } else if (stage === "culture") {
          if (journey < totalJourneys - 1) { journey++; stage = "market"; }
          else { showEnd(); return; }
        }
        draw();
      });
    }

    function resolveTravel(route) {
      // Deduct cargo purchase cost + transport cost exactly once here.
      const purchaseCost = cargoValueAtBuy();
      capital -= (purchaseCost + route.cost);
      if (Math.random() < route.risk) {
        lastEvent = pick(RISK_EVENTS);
        const eff = lastEvent.effect({ capital });
        if (eff.capital) capital += eff.capital;
        if (eff.spoil) {
          const g = pick(GOODS.filter(g => cargo[g] > 0));
          if (g) cargo[g] = Math.max(0, cargo[g] - 1);
        }
      } else {
        lastEvent = { title: "Smooth Passage", text: "The caravan crosses without incident, arriving safely and on schedule." };
      }
      stage = "travel";
      draw();
    }

    function showEnd() {
      ctx.headerExtra.innerHTML = "";
      const totalRevenue = journeyLog.reduce((a, j) => a + j.revenue, 0);
      let title, subtitle, icon, iconBg;
      if (capital >= 100) { title = "A Wealthy Master Trader"; icon = "🐪"; iconBg = "#43A047"; subtitle = "Your trading judgment turned modest capital into real wealth."; }
      else if (capital >= 60) { title = "A Steady, Successful Trader"; icon = "🧵"; iconBg = "#1976D2"; subtitle = "You navigated risk and reward with reasonable success."; }
      else { title = "A Struggling Trader"; icon = "🏜️"; iconBg = "#FFB300"; subtitle = "Risk, cost, and market timing proved difficult to balance."; }

      const html = ui.endReport({
        icon, iconBg, title, subtitle,
        summaryLines: [
          `Final capital: <b>${Math.max(0, capital)} silver</b>, after ${totalJourneys} journeys across interconnected trading centers.`,
          `The "Silk Road" was never a single road — it was a network of routes and cities like ${Object.values(CITIES).map(c => c.name).join(", ")}, each with its own prices and risks.`
        ],
        reflectionQuestions: [
          "Which route or good gave you the best return, and why do you think that was?",
          "How did risk (bandits, storms, spoilage) affect your trading decisions over time?",
          "Why is it inaccurate to describe the Silk Road as a single continuous road?",
          "What non-material things (ideas, techniques, faiths) moved along these routes, based on the cultural exchange notes?",
          "How might price differences between cities have driven trade in real historical networks?"
        ]
      }) + `<div class="btn-block-group" style="margin-top:18px">
          <button class="btn btn-secondary" id="restartBtn">Restart Trading Career</button>
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
    id: "silkroad",
    title: "Silk Road Trader",
    tagline: "Manage long-distance trade across an interconnected historical network.",
    icon: "🐪",
    color: COLOR, colorDark: COLOR_DARK,
    tags: ["Trade Networks", "Economics", "Cultural Exchange"],
    description: "Buy and sell silk, spices and ceramics across three connected historical trading centers. Manage capital, transport cost and route risk across a series of journeys.",
    instructions: [
      "Buy goods at your current city, watching your available capital.",
      "Choose a route to your next destination — longer routes cost and risk more.",
      "Respond to journey events, then sell your cargo at destination prices.",
      "Complete four journeys and see how your trading career turned out."
    ],
    render
  });
})();
