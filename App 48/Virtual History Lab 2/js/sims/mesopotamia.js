(function () {
  "use strict";
  const COLOR = "#B8860B", COLOR_DARK = "#8A6200";

  const statMeta = {
    population: { min: 0, max: 400, label: "Population", color: "#1976D2" },
    food: { min: 0, max: 100, label: "Food Stores", color: "#43A047" },
    water: { min: 0, max: 100, label: "Water Mgmt", color: "#26C6DA" },
    treasury: { min: 0, max: 100, label: "Resources", color: "#FFB300" },
    order: { min: 0, max: 100, label: "Public Order", color: "#7B5EA7" },
    admin: { min: 0, max: 100, label: "Administration", color: "#0D47A1" }
  };

  const decisions = [
    { id: "irrigation", title: "Expand Irrigation Channels", desc: "Your farmers need a reliable water supply to grow more grain.",
      options: [
        { label: "Build major canal network", desc: "High labour cost, big long-term food gain", effects: { water: 20, food: 10, admin: 5, treasury: -12 },
          feedback: { immediate: "Water reaches more fields; food production begins to climb.", longterm: "The canal network requires ongoing maintenance and coordinated labour scheduling.", insight: "Large-scale irrigation in Mesopotamia increased yields but forced communities to organize collective labour — an early driver of administration." } },
        { label: "Small local ditches only", desc: "Cheap, limited benefit", effects: { water: 6, food: 3, treasury: -3 },
          feedback: { immediate: "A modest improvement in water reach with little cost.", longterm: "Fields farther from the river remain unreliable.", insight: "Small-scale water control was common before central authorities coordinated larger systems." } },
        { label: "Do nothing this season", desc: "Save resources", effects: { treasury: 3 },
          feedback: { immediate: "You save resources, but yields stay flat.", longterm: "Dependence on rainfall alone leaves the city vulnerable to drought.", insight: "Many early settlements remained small because they lacked organized water management." } }
      ] },
    { id: "storage", title: "Food Storage Policy", desc: "Surplus grain must be stored for lean seasons.",
      options: [
        { label: "Build communal granaries", desc: "Costly but protects the city", effects: { food: 15, admin: 8, treasury: -10 },
          feedback: { immediate: "Grain is safely stored and can be redistributed if needed.", longterm: "Someone must now track what enters and leaves the granary.", insight: "Centralized storage created the need for record-keeping — one root of early writing systems." } },
        { label: "Let households store their own grain", desc: "No cost, less resilience", effects: { food: -2, order: -3 },
          feedback: { immediate: "Households keep control of their own surplus.", longterm: "Unequal storage between households breeds resentment during shortages.", insight: "Household-level storage was common in smaller, less stratified communities." } }
      ] },
    { id: "labour", title: "Organize Labour for Public Works", desc: "The settlement needs walls, temples, and canal maintenance.",
      options: [
        { label: "Mandatory labour rotations", desc: "Effective, unpopular", effects: { admin: 12, order: -8, water: 5 },
          feedback: { immediate: "Public works progress quickly with organized crews.", longterm: "Grumbling grows among farmers pulled from their fields.", insight: "Mesopotamian states relied on corvée-style labour obligations to build large infrastructure." } },
        { label: "Pay workers in grain rations", desc: "Costs food, keeps order", effects: { food: -10, order: 8, admin: 6 },
          feedback: { immediate: "Workers are motivated by guaranteed rations.", longterm: "Grain reserves shrink faster than expected.", insight: "Ration-based labour payment appears in early administrative tablets recording grain disbursed to workers." } }
      ] },
    { id: "market", title: "Establish a Marketplace", desc: "Surplus goods could be exchanged for tools, timber or livestock.",
      options: [
        { label: "Open a central marketplace", desc: "Boosts trade and treasury", effects: { treasury: 14, admin: 4, order: 3 },
          feedback: { immediate: "Traders begin exchanging surplus grain for goods the city lacks.", longterm: "The city becomes a hub, but must manage disputes over fair exchange.", insight: "Marketplaces linked river-valley cities to distant sources of timber, stone, and metal they lacked locally." } },
        { label: "Keep trade informal", desc: "No investment, slower growth", effects: { treasury: 3 },
          feedback: { immediate: "Trade continues quietly between neighbours.", longterm: "The city misses opportunities for larger exchange networks.", insight: "Informal exchange preceded organized markets in most early societies." } }
      ] },
    { id: "records", title: "Develop Record Keeping", desc: "Grain, livestock, labour and taxes are becoming too complex to track from memory.",
      options: [
        { label: "Train scribes in early record tokens/marks", desc: "Investment now, huge long-term gain", effects: { admin: 18, treasury: -8 },
          feedback: { immediate: "Officials begin marking clay tokens to track stores and debts.", longterm: "Administration becomes far more accurate and disputes decrease.", insight: "Complex societies needed systems for recording information — this administrative pressure is one of the strongest theories for the origin of writing." } },
        { label: "Continue relying on memory and oral tallies", desc: "No cost, growing errors", effects: { admin: -6, order: -4 },
          feedback: { immediate: "Officials continue as before.", longterm: "Disputes over who owes what become more frequent as the city grows.", insight: "Purely oral administration works only while a society stays small." } }
      ] },
    { id: "taxes", title: "Set a Taxation Policy", desc: "The temple and administration need resources to function.",
      options: [
        { label: "Moderate grain tax on harvests", desc: "Balanced approach", effects: { treasury: 10, order: -2, food: -5 },
          feedback: { immediate: "The administration gains steady resources.", longterm: "Farmers accept the tax as long as it stays predictable.", insight: "Temple and palace institutions in Mesopotamia were funded largely through agricultural taxation." } },
        { label: "Heavy tax to fund rapid growth", desc: "Risky", effects: { treasury: 18, order: -12, food: -8 },
          feedback: { immediate: "The treasury swells quickly.", longterm: "Discontent rises among farmers who feel overburdened.", insight: "Overtaxation without adequate justification frequently destabilized early administrations." } },
        { label: "Minimal taxation", desc: "Popular, underfunded", effects: { treasury: 2, order: 5 },
          feedback: { immediate: "Farmers are pleased with light taxation.", longterm: "The administration struggles to fund public works.", insight: "Too little central revenue limited the scale of infrastructure a city could build." } }
      ] },
    { id: "specialists", title: "Encourage Craft Specialization", desc: "Surplus food allows some residents to stop farming full-time.",
      options: [
        { label: "Support potters, weavers and toolmakers", desc: "Long-term growth", effects: { treasury: 8, admin: 5, population: 15 },
          feedback: { immediate: "Specialized goods improve quality of tools and trade items.", longterm: "The city's population grows as new roles attract migrants.", insight: "Agricultural surplus allowing non-farming specialists is a defining feature of early urban societies." } },
        { label: "Keep everyone farming", desc: "Safe, slow growth", effects: { food: 5, population: 3 },
          feedback: { immediate: "Food security remains high.", longterm: "The city develops fewer specialized crafts and trade goods.", insight: "Some early settlements remained agricultural villages rather than developing into cities." } }
      ] }
  ];

  const events = [
    { title: "River Flood", text: "Seasonal floodwaters damage some low-lying fields but also deposit fertile silt.",
      effects: { food: -8, water: 6 } },
    { title: "Drought Warning", text: "The river runs unusually low this season, straining irrigation systems.",
      effects: { water: -10, food: -6 } },
    { title: "Bountiful Harvest", text: "Favourable weather produces an unusually large grain surplus.",
      effects: { food: 12, treasury: 4 } },
    { title: "Labour Shortage", text: "Several workers fall ill during the building season, slowing public works.",
      effects: { admin: -6 } },
    { title: "Trade Opportunity", text: "A caravan from a neighbouring region offers to exchange timber and stone for grain.",
      effects: { treasury: 8, food: -4 } }
  ];

  function evaluateEnd(stats) {
    const avg = (stats.food + stats.water + stats.treasury + stats.order + stats.admin) / 5;
    let status, title, icon, iconBg, subtitle;
    if (stats.food < 15 || stats.order < 10) {
      status = "collapse"; title = "The City Falls Into Crisis"; icon = "⚠️"; iconBg = "#E53935";
      subtitle = "Famine and unrest overwhelmed your administration.";
    } else if (avg >= 60 && stats.admin >= 50) {
      status = "thriving"; title = "A Thriving Early City"; icon = "🏛️"; iconBg = "#43A047";
      subtitle = "Your settlement grew into a stable, well-administered city.";
    } else if (avg >= 40) {
      status = "stable"; title = "A Stable but Modest Settlement"; icon = "🏘️"; iconBg = "#1976D2";
      subtitle = "Your city survived, though growth was uneven.";
    } else {
      status = "struggling"; title = "A Struggling Settlement"; icon = "🌾"; iconBg = "#FFB300";
      subtitle = "Your city persisted, but resources stayed dangerously thin.";
    }
    return {
      icon, iconBg, title, subtitle,
      summaryLines: [
        `Final population reached <b>${Math.round(stats.population)}</b>, with administrative capacity at <b>${Math.round(stats.admin)}/100</b>.`,
        `Sustainability — not maximum expansion — determined your outcome: food, water, order and administration all had to stay balanced.`
      ],
      stats: [
        { label: "Population", value: Math.round(stats.population) },
        { label: "Food Stores", value: Math.round(stats.food) + "/100" },
        { label: "Water Management", value: Math.round(stats.water) + "/100" },
        { label: "Administration", value: Math.round(stats.admin) + "/100" },
        { label: "Public Order", value: Math.round(stats.order) + "/100" },
        { label: "Treasury", value: Math.round(stats.treasury) + "/100" }
      ],
      reflectionQuestions: [
        "Which decision had the biggest long-term effect on your city, and why?",
        "How did water management influence almost every other system in your city?",
        "Why might record-keeping emerge naturally once a settlement grows large?",
        "What trade-offs did you face between short-term relief and long-term stability?",
        "How does 'success' in this simulation differ from simply having the largest population?"
      ]
    };
  }

  VSL.registerSim({
    id: "mesopotamia",
    title: "Mesopotamia: Build the First City",
    tagline: "Manage an early river-valley city from settlement to civilization.",
    icon: "🏺",
    color: COLOR,
    colorDark: COLOR_DARK,
    tags: ["Urban Development", "Administration", "Early Writing"],
    description: "You administer an early Mesopotamian settlement. Balance water, food, labour, trade and record-keeping to grow it into a functioning city — without collapsing under your own success.",
    instructions: [
      "Review your city's dashboard each turn: population, food, water, treasury, order and administration.",
      "Make one governing decision per turn and see its immediate and long-term effects.",
      "Respond to random events like floods, droughts and trade opportunities.",
      "Reach a stable, sustainable city by the final turn — growth alone won't guarantee success."
    ],
    render(container, ctx) {
      VSL.runTurnEngine(container, ctx, {
        totalTurns: 10,
        decisionTag: "Administrative Decision",
        eventTag: "Historical Event",
        initialStats: { population: 60, food: 40, water: 35, treasury: 30, order: 55, admin: 20 },
        statMeta, decisions, events,
        failConditions: [ { test: s => s.food <= 0 }, { test: s => s.order <= 0 } ],
        dashboardStats(s) {
          return Object.keys(statMeta).map(k => ({
            label: statMeta[k].label,
            value: Math.round(s[k]),
            display: Math.round(s[k]) + (k === "population" ? "" : ""),
            color: statMeta[k].color,
            pct: k === "population" ? Math.min(100, (s[k] / 300) * 100) : s[k]
          }));
        },
        evaluateEnd
      });
    }
  });
})();
