(function () {
  "use strict";
  const COLOR = "#6A1B9A", COLOR_DARK = "#4A148C";
  const statMeta = {
    money: { min: 0, max: 100, label: "Money", color: "#FFB300" },
    reputation: { min: 0, max: 100, label: "Reputation", color: "#1976D2" },
    materials: { min: 0, max: 100, label: "Materials", color: "#43A047" },
    apprenticeSkill: { min: 0, max: 100, label: "Apprentice Skill", color: "#26C6DA" },
    quality: { min: 0, max: 100, label: "Artistic Quality", color: "#6A1B9A" }
  };

  const decisions = [
    { id: "commission1", title: "A Religious Commission Arrives", desc: "A local chapel offers a fair sum for an altar panel, with a modest deadline.",
      options: [
        { label: "Accept — use fine pigments and gold leaf", desc: "Costly, boosts quality & reputation", effects: { materials: -14, money: 12, reputation: 10, quality: 8 },
          feedback: { immediate: "The finished panel impresses the clergy.", longterm: "Word spreads of your workshop's fine materials.", insight: "Patrons often judged workshops partly by the cost and quality of materials used, especially gold leaf." } },
        { label: "Accept — use economical materials", desc: "Cheaper, lower quality", effects: { materials: -6, money: 14, reputation: 2 },
          feedback: { immediate: "The commission is completed on budget.", longterm: "The result is serviceable but unremarkable.", insight: "Many workshops balanced cost against quality depending on the patron's budget." } },
        { label: "Decline — workshop is overcommitted", desc: "No risk, no gain", effects: {},
          feedback: { immediate: "You avoid overextending the workshop.", longterm: "The chapel commissions a rival workshop instead.", insight: "Declining commissions preserved quality but could cost future patronage relationships." } }
      ] },
    { id: "apprentice", title: "Apprentice Training", desc: "Your apprentices could use more structured training in technique.",
      options: [
        { label: "Dedicate time to formal training", desc: "Costs time/money, builds long-term capacity", effects: { money: -8, apprenticeSkill: 18 },
          feedback: { immediate: "Apprentices practice proportion and composition studies.", longterm: "They can now handle more complex work independently.", insight: "Renaissance workshops functioned partly as training institutions, passing techniques to the next generation." } },
        { label: "Keep them on menial preparation tasks", desc: "No cost, slow growth", effects: { apprenticeSkill: 4, money: 3 },
          feedback: { immediate: "Apprentices continue grinding pigments and preparing panels.", longterm: "Their skill develops slowly through repetition.", insight: "Much apprentice learning happened informally through years of workshop labour." } }
      ] },
    { id: "technique", title: "Study Linear Perspective", desc: "A visiting scholar offers to teach your workshop mathematical perspective techniques.",
      options: [
        { label: "Invest time studying perspective", desc: "Improves future commissions", effects: { money: -6, quality: 14, reputation: 4 },
          feedback: { immediate: "Your workshop begins applying vanishing points to compositions.", longterm: "Patrons notice the newfound depth and realism in your work.", insight: "The mathematical study of linear perspective was one of the defining technical innovations of the Renaissance." } },
        { label: "Skip it — focus on current commissions", desc: "No disruption, no improvement", effects: { money: 4 },
          feedback: { immediate: "Work continues without interruption.", longterm: "Your workshop's style stays traditional while others innovate.", insight: "Not every workshop adopted new techniques immediately; some retained older styles by choice or necessity." } }
      ] },
    { id: "commission2", title: "A Wealthy Merchant Requests a Portrait", desc: "A merchant family wants a portrait completed quickly, with a tight deadline.",
      options: [
        { label: "Accept and prioritize the deadline", desc: "Fast turnaround, rushed quality", effects: { money: 16, reputation: 3, quality: -6 },
          feedback: { immediate: "The portrait is delivered on time.", longterm: "The merchant is satisfied, though connoisseurs note the haste.", insight: "Patron deadlines often forced workshops to balance speed against artistic refinement." } },
        { label: "Negotiate a longer deadline", desc: "Slower, better quality", effects: { money: 10, quality: 10, reputation: 6 },
          feedback: { immediate: "The merchant agrees to extra time for a finer result.", longterm: "The portrait becomes a showcase piece for future patrons.", insight: "Successful workshops often relied on reputation to negotiate favorable terms with patrons." } }
      ] },
    { id: "materials", title: "Materials Are Running Low", desc: "Pigments and quality panels need restocking.",
      options: [
        { label: "Buy premium materials from a trusted supplier", desc: "Expensive, high quality", effects: { money: -16, materials: 24, quality: 4 },
          feedback: { immediate: "Your storeroom is well stocked with fine pigments.", longterm: "Future commissions can use higher-quality materials.", insight: "Pigments like ultramarine were extremely costly, often specified explicitly in patron contracts." } },
        { label: "Buy budget materials", desc: "Cheaper, lower quality ceiling", effects: { money: -6, materials: 12 },
          feedback: { immediate: "You restock at a lower cost.", longterm: "Some future commissions will be limited in achievable quality.", insight: "Workshops serving less wealthy patrons often used more affordable pigments and supports." } }
      ] },
    { id: "civic", title: "A Civic Commission for the Town Hall", desc: "The city council wants a large decorative work for civic pride.",
      options: [
        { label: "Accept — a major public showcase", desc: "High cost, huge reputation gain", effects: { materials: -18, money: -4, reputation: 18, quality: 6 },
          feedback: { immediate: "The workshop commits significant resources to the ambitious project.", longterm: "Completion of the civic work draws attention from patrons across the region.", insight: "Civic commissions were prestigious because they were seen by the whole community, unlike private works." } },
        { label: "Decline — too resource-intensive right now", desc: "Safe, modest", effects: { money: 4 },
          feedback: { immediate: "You focus resources on smaller private commissions instead.", longterm: "The workshop's reputation grows more slowly.", insight: "Not every workshop had the resources to take on large civic projects." } }
      ] }
  ];

  const events = [
    { title: "A Rival Workshop Opens Nearby", text: "Competition for patrons increases in the city.", effects: { reputation: -4 } },
    { title: "A Generous Patron Praises Your Work", text: "Word spreads quickly through wealthy circles.", effects: { reputation: 8 } },
    { title: "Pigment Prices Rise", text: "A shortage of imported ultramarine raises costs across the city.", effects: { money: -6 } },
    { title: "An Apprentice Shows Unusual Talent", text: "One apprentice's studies impress visiting patrons.", effects: { apprenticeSkill: 8 } }
  ];

  function evaluateEnd(stats) {
    const avg = (stats.money + stats.reputation + stats.materials + stats.apprenticeSkill + stats.quality) / 5;
    let title, subtitle, icon, iconBg;
    if (avg >= 62) { title = "A Celebrated Workshop"; icon = "🎨"; iconBg = "#43A047"; subtitle = "Your workshop became known for both skill and reliability."; }
    else if (avg >= 42) { title = "A Respected Local Workshop"; icon = "🖌️"; iconBg = "#1976D2"; subtitle = "Solid, steady work built a dependable reputation."; }
    else { title = "A Struggling Workshop"; icon = "🖼️"; iconBg = "#FFB300"; subtitle = "Financial and material pressures limited your workshop's growth."; }
    return {
      icon, iconBg, title, subtitle,
      summaryLines: [
        `Final reputation reached <b>${Math.round(stats.reputation)}/100</b>, with artistic quality at <b>${Math.round(stats.quality)}/100</b>.`,
        `Workshops balanced patronage, materials, and apprentice training — no single factor guaranteed success.`
      ],
      stats: [
        { label: "Money", value: Math.round(stats.money) + "/100" },
        { label: "Reputation", value: Math.round(stats.reputation) + "/100" },
        { label: "Materials", value: Math.round(stats.materials) + "/100" },
        { label: "Apprentice Skill", value: Math.round(stats.apprenticeSkill) + "/100" },
        { label: "Artistic Quality", value: Math.round(stats.quality) + "/100" }
      ],
      reflectionQuestions: [
        "How did patronage shape what artists could create in this period?",
        "Why did workshops function as training institutions as well as businesses?",
        "What trade-offs did you face between speed, cost, and quality?",
        "How might a workshop's reputation affect the kinds of commissions it could attract?",
        "Why was the adoption of new techniques like linear perspective significant historically?"
      ]
    };
  }

  VSL.registerSim({
    id: "renaissance",
    title: "Renaissance Workshop",
    tagline: "Run an artist's workshop and manage commissions, patrons, and apprentices.",
    icon: "🖌️",
    color: COLOR, colorDark: COLOR_DARK,
    tags: ["Art & Patronage", "Workshop Economy", "Technique"],
    description: "Manage a Renaissance-style artist's workshop. Balance patron commissions, materials, apprentice training and emerging techniques like linear perspective — all simulated scenarios inspired by historical workshop life.",
    instructions: [
      "Accept or decline commissions from patrons with different needs and budgets.",
      "Manage materials, money, and your apprentices' growing skill.",
      "Decide whether to invest in new techniques like linear perspective.",
      "Build your workshop's reputation over a series of commissions."
    ],
    render(container, ctx) {
      VSL.runTurnEngine(container, ctx, {
        totalTurns: 9,
        decisionTag: "Workshop Decision",
        eventTag: "Workshop News",
        initialStats: { money: 35, reputation: 30, materials: 45, apprenticeSkill: 25, quality: 30 },
        statMeta, decisions, events,
        failConditions: [ { test: s => s.money <= -5 } ],
        dashboardStats(s) {
          return Object.keys(statMeta).map(k => ({
            label: statMeta[k].label, value: Math.round(s[k]), color: statMeta[k].color, pct: s[k]
          }));
        },
        evaluateEnd
      });
    }
  });
})();
