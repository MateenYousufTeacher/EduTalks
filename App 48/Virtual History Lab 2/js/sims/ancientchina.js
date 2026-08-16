(function () {
  "use strict";
  const COLOR = "#B71C1C", COLOR_DARK = "#7F0000";
  const statMeta = {
    treasury: { min: 0, max: 100, label: "Treasury", color: "#FFB300" },
    food: { min: 0, max: 100, label: "Food Supply", color: "#43A047" },
    satisfaction: { min: 0, max: 100, label: "Public Satisfaction", color: "#1976D2" },
    bureaucracy: { min: 0, max: 100, label: "Bureaucratic Efficiency", color: "#26C6DA" },
    corruption: { min: 0, max: 100, label: "Corruption", color: "#8D6E63" },
    legitimacy: { min: 0, max: 100, label: "Mandate / Legitimacy", color: "#B71C1C" }
  };

  const decisions = [
    { id: "taxpolicy", title: "Set the Tax Rate", desc: "The dynasty needs revenue, but taxation shapes public mood.",
      options: [
        { label: "Lower taxes", desc: "Wins favor, less revenue", effects: { treasury: -10, satisfaction: 12, legitimacy: 6 },
          feedback: { immediate: "Farmers welcome the relief.", longterm: "The treasury will need other sources of income.", insight: "Rulers often reduced taxes after unrest or disaster to restore public confidence." } },
        { label: "Raise taxes moderately", desc: "Balanced revenue", effects: { treasury: 12, satisfaction: -6 },
          feedback: { immediate: "Revenue increases steadily.", longterm: "Grumbling grows if taxes stay high for long.", insight: "Sustainable taxation required balancing state needs against peasant tolerance." } },
        { label: "Raise taxes sharply", desc: "High revenue, high risk", effects: { treasury: 20, satisfaction: -16, legitimacy: -8 },
          feedback: { immediate: "The treasury swells rapidly.", longterm: "Resentment builds quickly among the peasantry.", insight: "Excessive taxation is repeatedly cited by dynastic chroniclers as a cause of rebellion." } }
      ] },
    { id: "infra", title: "Infrastructure Investment", desc: "Roads, canals and granaries need repair after years of neglect.",
      options: [
        { label: "Fund major public works", desc: "Costly, builds legitimacy", effects: { treasury: -18, satisfaction: 10, bureaucracy: 6, legitimacy: 8 },
          feedback: { immediate: "Canals and roads improve grain transport across the realm.", longterm: "The treasury needs replenishing, but the population sees the dynasty as capable.", insight: "Large infrastructure projects were often presented as evidence a ruler had earned Heaven's favor." } },
        { label: "Delay repairs, save funds", desc: "Cheap now, risky later", effects: { treasury: 10, satisfaction: -5, disasterRiskFlag: 1 },
          feedback: { immediate: "The treasury benefits in the short term.", longterm: "Neglected infrastructure increases vulnerability to floods and poor harvests.", insight: "Deferred maintenance on flood-control systems repeatedly preceded major disasters in dynastic history." } }
      ] },
    { id: "bureaucracy", title: "Bureaucratic Reform", desc: "Officials vary widely in competence and honesty.",
      options: [
        { label: "Reform the examination and appointment system", desc: "Slow but powerful", effects: { bureaucracy: 16, corruption: -10, treasury: -8 },
          feedback: { immediate: "More capable officials begin to be appointed.", longterm: "Tax collection and disaster response steadily improve.", insight: "Merit-based bureaucratic systems were historically associated with more effective, more legitimate governance." } },
        { label: "Leave the current officials in place", desc: "No disruption, no improvement", effects: { corruption: 6 },
          feedback: { immediate: "Governance continues without disruption.", longterm: "Inefficiency and corruption slowly compound.", insight: "Unreformed bureaucracies tended to become less responsive to both the ruler and the people over time." } }
      ] },
    { id: "corruptionCheck", title: "A Regional Official Is Accused of Corruption", desc: "Reports suggest a governor is skimming tax revenue.",
      options: [
        { label: "Investigate and remove the official", desc: "Costly but restores trust", effects: { corruption: -14, treasury: -6, legitimacy: 8, satisfaction: 6 },
          feedback: { immediate: "The investigation confirms wrongdoing; the official is replaced.", longterm: "Other officials become more cautious about corruption.", insight: "Visible action against corrupt officials was one way rulers publicly reinforced their legitimacy." } },
        { label: "Ignore it to avoid political disruption", desc: "Short-term stability, long-term rot", effects: { corruption: 12, legitimacy: -6 },
          feedback: { immediate: "The matter is quietly dropped.", longterm: "Corruption spreads as officials note there are no consequences.", insight: "Tolerated corruption often eroded both revenue and popular trust over time." } }
      ] },
    { id: "military", title: "Military Expenditure", desc: "Border regions request additional garrisons.",
      options: [
        { label: "Increase military spending", desc: "Greater security, less for other needs", effects: { treasury: -14, satisfaction: -4, legitimacy: 4 },
          feedback: { immediate: "Border defenses strengthen.", longterm: "Funds available for public works and relief shrink.", insight: "Balancing military and civil spending was a constant tension for agrarian dynasties." } },
        { label: "Maintain minimal garrisons", desc: "Saves money, risk remains", effects: { treasury: 6, legitimacy: -3 },
          feedback: { immediate: "Resources are preserved for domestic needs.", longterm: "Border regions remain vulnerable to raids or unrest.", insight: "Underinvestment in border security sometimes emboldened incursions." } }
      ] },
    { id: "agriculture", title: "Invest in Agriculture", desc: "New irrigation and seed storage techniques are available.",
      options: [
        { label: "Fund agricultural improvements", desc: "Long-term food security", effects: { treasury: -10, food: 16, satisfaction: 6 },
          feedback: { immediate: "Grain yields begin to improve.", longterm: "The realm becomes more resilient to poor harvests.", insight: "Agricultural investment was consistently linked to dynastic prosperity in historical records." } },
        { label: "Skip investment this year", desc: "Save funds", effects: { treasury: 5 },
          feedback: { immediate: "The treasury is preserved.", longterm: "Food supply remains vulnerable to a bad season.", insight: "Short-term savings on agriculture often proved costly during droughts or floods." } }
      ] }
  ];

  const events = [
    { title: "Flood Damages Farmland", text: "Heavy rains overwhelm river defenses, damaging crops in several provinces.",
      effects: { food: -14, satisfaction: -6 } },
    { title: "Bountiful Harvest", text: "Excellent weather brings an unusually strong harvest across the realm.",
      effects: { food: 12, satisfaction: 6 } },
    { title: "Rumors of Heaven's Displeasure", text: "A strange comet is interpreted by some officials as an omen.",
      effects: { legitimacy: -5 } },
    { title: "Successful Grain Reserve Release", text: "Officials distribute reserve grain during a difficult season, easing hardship.",
      effects: { satisfaction: 8, food: -6 } },
    { title: "Local Uprising Contained", text: "A small regional protest over taxation is peacefully resolved.",
      effects: { satisfaction: 3, treasury: -3 } }
  ];

  function evaluateEnd(stats) {
    const avg = (stats.treasury + stats.food + stats.satisfaction + stats.bureaucracy + (100 - stats.corruption) + stats.legitimacy) / 6;
    let title, subtitle, icon, iconBg;
    if (stats.legitimacy < 20 || stats.satisfaction < 15) {
      title = "The Dynasty Loses the Mandate"; icon = "🌩️"; iconBg = "#E53935";
      subtitle = "Widespread discontent and weak legitimacy brought the dynasty to collapse.";
    } else if (avg >= 65) {
      title = "A Prosperous, Legitimate Dynasty"; icon = "👑"; iconBg = "#43A047";
      subtitle = "Effective governance kept the realm stable and the Mandate secure.";
    } else if (avg >= 45) {
      title = "A Reforming Dynasty"; icon = "📜"; iconBg = "#1976D2";
      subtitle = "The dynasty survived through a mix of successes and setbacks.";
    } else {
      title = "A Financially Weakened Dynasty"; icon = "⚖️"; iconBg = "#FFB300";
      subtitle = "The dynasty endured, but resources and public trust wore thin.";
    }
    return {
      icon, iconBg, title, subtitle,
      summaryLines: [
        `Legitimacy ended at <b>${Math.round(stats.legitimacy)}/100</b> — governance quality mattered more than any single decision.`,
        `Corruption level: <b>${Math.round(stats.corruption)}/100</b>. Left unchecked, it steadily eroded both revenue and trust.`
      ],
      stats: [
        { label: "Treasury", value: Math.round(stats.treasury) + "/100" },
        { label: "Food Supply", value: Math.round(stats.food) + "/100" },
        { label: "Public Satisfaction", value: Math.round(stats.satisfaction) + "/100" },
        { label: "Bureaucratic Efficiency", value: Math.round(stats.bureaucracy) + "/100" },
        { label: "Corruption", value: Math.round(stats.corruption) + "/100" },
        { label: "Legitimacy", value: Math.round(stats.legitimacy) + "/100" }
      ],
      reflectionQuestions: [
        "How did the concept of the Mandate of Heaven connect a ruler's conduct to natural disasters in people's eyes?",
        "Which mattered more for legitimacy in your playthrough: treasury or public satisfaction?",
        "Why might rulers tolerate some corruption in the short term despite its long-term costs?",
        "How did taxation decisions create trade-offs between revenue and legitimacy?",
        "What does this simulation suggest about why large agrarian states invested heavily in disaster relief?"
      ]
    };
  }

  VSL.registerSim({
    id: "ancientchina",
    title: "Ancient China: The Mandate of Heaven",
    tagline: "Govern a dynasty and maintain political legitimacy.",
    icon: "🐉",
    color: COLOR, colorDark: COLOR_DARK,
    tags: ["Governance", "Legitimacy", "Political Systems"],
    description: "As ruler of an ancient Chinese dynasty, your goal isn't conquest — it's maintaining the Mandate of Heaven through sound governance, fair taxation, and disaster response.",
    instructions: [
      "Track treasury, food, public satisfaction, bureaucracy, corruption and legitimacy.",
      "Make governing decisions each turn — every choice involves genuine trade-offs.",
      "Respond to natural disasters and unrest as they arise.",
      "Maintain the Mandate of Heaven by keeping legitimacy and satisfaction from collapsing."
    ],
    render(container, ctx) {
      VSL.runTurnEngine(container, ctx, {
        totalTurns: 10,
        decisionTag: "Governing Decision",
        eventTag: "Court Report",
        initialStats: { treasury: 45, food: 50, satisfaction: 55, bureaucracy: 40, corruption: 25, legitimacy: 60 },
        statMeta, decisions, events,
        failConditions: [ { test: s => s.legitimacy <= 5 }, { test: s => s.food <= 0 } ],
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
