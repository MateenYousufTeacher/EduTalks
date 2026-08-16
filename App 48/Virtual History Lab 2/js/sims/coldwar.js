(function () {
  "use strict";
  const COLOR = "#37474F", COLOR_DARK = "#1B2529";
  const statMeta = {
    tension: { min: 0, max: 100, label: "Diplomatic Tension", color: "#E53935" },
    confidence: { min: 0, max: 100, label: "Public Confidence", color: "#1976D2" },
    readiness: { min: 0, max: 100, label: "Military Readiness", color: "#607D8B" },
    intel: { min: 0, max: 100, label: "Intel Confidence", color: "#26C6DA" },
    alliance: { min: 0, max: 100, label: "Alliance Support", color: "#43A047" }
  };

  const decisions = [
    { id: "border", title: "Simulated Historical Scenario: Disputed Border Incident", desc: "A patrol reports an unexpected movement near a contested border. Reports are unconfirmed.",
      options: [
        { label: "Request independent verification before acting", desc: "Cautious, slower", effects: { intel: 12, tension: 2 },
          feedback: { immediate: "Verification is requested through diplomatic and intelligence channels.", longterm: "Clearer information reduces the risk of overreaction.", insight: "Distinguishing confirmed evidence from assumption was a critical, often difficult, task during real crises." } },
        { label: "Raise military readiness immediately", desc: "Fast, escalatory", effects: { readiness: 14, tension: 12, confidence: 4 },
          feedback: { immediate: "Forces are placed on alert as a precaution.", longterm: "The opposing side notices the readiness increase and responds in kind.", insight: "Rapid unilateral escalation could trigger a matching response, even from an unconfirmed report." } },
        { label: "Publicly downplay the incident", desc: "Reduces alarm, risks looking uninformed", effects: { confidence: -6, tension: -3 },
          feedback: { immediate: "Officials describe the incident as minor and routine.", longterm: "If more information emerges later, public trust could be at risk.", insight: "Public messaging during uncertain moments carried real political risk in either direction." } }
      ] },
    { id: "intelreport", title: "Low-Confidence Intelligence Report", desc: "An intelligence report suggests unusual activity, but the source has a mixed reliability record.",
      options: [
        { label: "Treat the report as low-confidence and gather more data", desc: "Careful, patient", effects: { intel: 10 },
          feedback: { immediate: "Analysts are tasked with corroborating the report.", longterm: "Decisions later in the crisis rest on firmer evidence.", insight: "Historically, acting on unverified single-source intelligence was a major contributor to unnecessary escalation." } },
        { label: "Act as if the report is confirmed", desc: "Fast but risky", effects: { readiness: 10, tension: 10 },
          feedback: { immediate: "Forces respond as though the threat is confirmed.", longterm: "If the report proves inaccurate, trust in future assessments suffers.", insight: "Overreacting to uncertain intelligence has historically escalated situations that might otherwise have been resolved diplomatically." } }
      ] },
    { id: "communication", title: "Communication Breakdown", desc: "A direct communication channel with the opposing government goes silent for several hours.",
      options: [
        { label: "Use a back-channel or third-party mediator", desc: "Preserves dialogue", effects: { tension: -6, alliance: 4 },
          feedback: { immediate: "An indirect channel confirms the silence was a technical failure, not a signal.", longterm: "Trust in maintaining open communication improves.", insight: "Back-channel diplomacy played an important role in de-escalating real Cold War crises." } },
        { label: "Assume the silence is a deliberate signal", desc: "Escalatory assumption", effects: { tension: 10, readiness: 6 },
          feedback: { immediate: "Officials interpret the silence as a hostile signal.", longterm: "Readiness increases in response to an assumption rather than confirmed intent.", insight: "Misreading routine communication failures as deliberate signals was a recurring escalation risk." } }
      ] },
    { id: "negotiate", title: "Opportunity to Open Negotiations", desc: "Diplomats signal willingness to discuss mutual verification measures.",
      options: [
        { label: "Propose mutual verification and monitoring", desc: "De-escalatory", effects: { tension: -14, alliance: 6, confidence: 6 },
          feedback: { immediate: "Both sides agree to preliminary verification talks.", longterm: "Tension begins to ease as trust slowly rebuilds.", insight: "Verification and monitoring agreements were central tools for de-escalating Cold War-era standoffs." } },
        { label: "Decline — insist on unilateral concessions first", desc: "Stalls talks", effects: { tension: 6, alliance: -4 },
          feedback: { immediate: "Negotiations stall over preconditions.", longterm: "Both sides remain locked in a standoff.", insight: "Demanding unilateral concessions before talks often prevented diplomacy from making progress." } }
      ] },
    { id: "alliance", title: "An Ally Requests a Show of Support", desc: "A key ally asks for a public statement of solidarity during the crisis.",
      options: [
        { label: "Issue measured public support", desc: "Strengthens alliance, some tension", effects: { alliance: 10, tension: 4 },
          feedback: { immediate: "Allies are reassured of continued support.", longterm: "The opposing side notes the alliance is unified.", insight: "Alliance cohesion was often a key factor in deterrence calculations during crises." } },
        { label: "Stay quiet to avoid provoking the other side", desc: "Reduces tension, strains alliance", effects: { tension: -4, alliance: -8 },
          feedback: { immediate: "Public silence avoids inflaming the situation.", longterm: "The ally privately questions the strength of the commitment.", insight: "Balancing alliance commitments against de-escalation was a persistent diplomatic tension." } }
      ] },
    { id: "pressure", title: "Consider Diplomatic Pressure", desc: "Advisors debate whether economic or diplomatic pressure could shift the other side's position.",
      options: [
        { label: "Apply calibrated diplomatic pressure", desc: "Moderate escalation, potential leverage", effects: { tension: 6, confidence: 4 },
          feedback: { immediate: "Pressure is applied through diplomatic and economic channels.", longterm: "The other side may respond with concessions or countermeasures.", insight: "Calibrated pressure was a common tool, but its effects were difficult to predict precisely." } },
        { label: "Hold off and continue dialogue only", desc: "Slower, less risk", effects: { tension: -3 },
          feedback: { immediate: "Dialogue continues without added pressure.", longterm: "Progress is slower but the risk of unwanted escalation is lower.", insight: "Patience in diplomacy sometimes prevented crises from escalating unnecessarily, though it could also be seen as weakness." } }
      ] }
  ];

  const events = [
    { title: "Media Speculation Rises", text: "News outlets speculate about the crisis, increasing public anxiety.", effects: { confidence: -6, tension: 3 } },
    { title: "Ally Offers Mediation", text: "A neutral third party offers to help facilitate communication.", effects: { tension: -5 } },
    { title: "Minor Miscommunication Resolved", text: "A tense moment is defused after officials clarify a misunderstood message.", effects: { tension: -4, intel: 4 } }
  ];

  function evaluateEnd(stats) {
    let title, subtitle, icon, iconBg;
    if (stats.tension >= 80) { title = "Severe Escalation"; icon = "🚨"; iconBg = "#E53935"; subtitle = "Rising tension outpaced diplomatic efforts to de-escalate."; }
    else if (stats.tension <= 25 && stats.confidence >= 50) { title = "Peaceful Resolution"; icon = "🕊️"; iconBg = "#43A047"; subtitle = "Careful diplomacy and verification defused the crisis."; }
    else if (stats.tension <= 45) { title = "Negotiated Compromise"; icon = "🤝"; iconBg = "#1976D2"; subtitle = "The crisis was managed through a mix of pressure and dialogue."; }
    else { title = "Prolonged Tension"; icon = "⏳"; iconBg = "#FFB300"; subtitle = "The crisis did not fully resolve, leaving lasting uncertainty."; }
    return {
      icon, iconBg, title, subtitle,
      summaryLines: [
        `Final tension level: <b>${Math.round(stats.tension)}/100</b>. Every decision — verify, escalate, or negotiate — shaped this outcome.`,
        `This was a fictionalized scenario inspired by real Cold War dynamics, not an account of an actual historical event.`
      ],
      stats: [
        { label: "Diplomatic Tension", value: Math.round(stats.tension) + "/100" },
        { label: "Public Confidence", value: Math.round(stats.confidence) + "/100" },
        { label: "Military Readiness", value: Math.round(stats.readiness) + "/100" },
        { label: "Intel Confidence", value: Math.round(stats.intel) + "/100" },
        { label: "Alliance Support", value: Math.round(stats.alliance) + "/100" }
      ],
      reflectionQuestions: [
        "Which decisions reduced tension, and which increased it? Was that always predictable in advance?",
        "Why does distinguishing confirmed evidence from assumption matter so much during a crisis?",
        "How did alliance commitments complicate your decisions?",
        "What role did communication — or its breakdown — play in this scenario?",
        "Why might negotiation be strategically valuable even during high tension?"
      ]
    };
  }

  VSL.registerSim({
    id: "coldwar",
    title: "Cold War Crisis Room",
    tagline: "Make diplomatic decisions under escalating tension.",
    icon: "☎️",
    color: COLOR, colorDark: COLOR_DARK,
    tags: ["Diplomacy", "Escalation", "Negotiation"],
    description: "Step into a fictionalized Cold War-style crisis as a diplomatic decision-maker. Every choice — verify, escalate, or negotiate — shapes whether tension rises or the crisis is resolved.",
    instructions: [
      "Respond to an unfolding, fictionalized diplomatic crisis one decision at a time.",
      "Weigh uncertain intelligence, communication breakdowns, and alliance pressures.",
      "Watch how tension, confidence, and alliance support shift with each choice.",
      "Aim to resolve the crisis — the goal is not to reach maximum readiness, but stability."
    ],
    render(container, ctx) {
      VSL.runTurnEngine(container, ctx, {
        totalTurns: 8,
        decisionTag: "Diplomatic Decision",
        eventTag: "Situation Update",
        initialStats: { tension: 40, confidence: 55, readiness: 30, intel: 40, alliance: 50 },
        statMeta, decisions, events,
        failConditions: [ { test: s => s.tension >= 100 } ],
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
