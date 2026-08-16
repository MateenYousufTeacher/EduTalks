(function () {
  "use strict";
  const { ui, esc } = VSL;
  const COLOR = "#00838F", COLOR_DARK = "#005662";

  // Each investigation follows: Question -> Observation -> Hypothesis -> Test -> Data -> Interpretation -> Conclusion
  const investigations = [
    {
      title: "What Moves the Wandering Stars?",
      question: "Astronomers notice that certain bright points of light ('wandering stars') move differently against the fixed stars than expected. What explains their motion?",
      observation: "Over many nights, you record the position of a wandering star. Its path loops backward briefly before continuing forward — an effect called retrograde motion.",
      hypothesisChoices: [
        { label: "The star truly reverses direction in the sky", desc: "Takes the observation at face value", score: 1 },
        { label: "The looping path results from Earth and the planet both orbiting the Sun at different speeds", desc: "Looks for an underlying explanation of the pattern", score: 3 },
        { label: "It's an illusion caused by atmospheric distortion", desc: "Assumes an unrelated cause without evidence", score: 0 }
      ],
      test: "You plot the relative positions of Earth and the planet over several months, assuming both orbit the Sun at different distances and speeds.",
      data: "The plotted model reproduces the looping retrograde path closely, without needing the planet to actually reverse direction.",
      interpretationChoices: [
        { label: "The model's match to observation supports a Sun-centered explanation", desc: "Evidence-based interpretation", score: 3 },
        { label: "The match is coincidental and doesn't tell us much", desc: "Dismisses strong supporting evidence", score: 0 },
        { label: "The model proves the theory beyond any future doubt", desc: "Overstates certainty from one result", score: 1 }
      ],
      insight: "Historically, explaining retrograde motion was a major piece of evidence used to argue for Sun-centered models of the solar system, challenging older Earth-centered explanations. The key skill was distinguishing what was directly observed (a looping path) from what was inferred (its cause)."
    },
    {
      title: "Do Heavier Objects Fall Faster?",
      question: "A long-held assumption claims heavier objects fall faster than lighter ones. Is this actually true?",
      observation: "You release two balls of different weights from the same height under controlled conditions and time their fall.",
      hypothesisChoices: [
        { label: "Both will hit the ground at the same time, regardless of weight", desc: "Predicts against common assumption", score: 3 },
        { label: "The heavier ball will land first, as commonly assumed", desc: "Follows the traditional assumption", score: 1 },
        { label: "Weight has an unpredictable, random effect", desc: "No testable prediction", score: 0 }
      ],
      test: "You use a controlled ramp (to slow the fall for easier measurement) and vary only the weight of the rolling object, keeping shape and surface constant.",
      data: "Across repeated trials, the two objects of different weight reach the bottom of the ramp at nearly the same time.",
      interpretationChoices: [
        { label: "Weight alone does not determine falling speed under these conditions", desc: "Matches the controlled data", score: 3 },
        { label: "The heavier object must have been measured incorrectly", desc: "Rejects data without justification", score: 0 },
        { label: "This only applies to ramps, not real falling objects", desc: "Partially reasonable caution, but avoids the core finding", score: 2 }
      ],
      insight: "Using controlled, repeatable experiments — like a ramp to slow motion for measurement — was a key innovation in testing long-held assumptions about motion, replacing untested authority with observation and measurement."
    },
    {
      title: "Separating Observation from Assumption",
      question: "A report describes a strange light in the night sky, along with the writer's confident explanation for its cause.",
      observation: "The report states: 'A bright light appeared for several minutes, moved slowly, and faded. It was clearly a divine sign.'",
      hypothesisChoices: [
        { label: "Identify 'a divine sign' as an assumption, not an observation", desc: "Distinguishes evidence from interpretation", score: 3 },
        { label: "Accept the entire report, including the explanation, as fact", desc: "Fails to separate observation from interpretation", score: 0 },
        { label: "Dismiss the entire report as unreliable", desc: "Overcorrects and discards useful observational data", score: 1 }
      ],
      test: "You compare this report with two independent accounts from other locations describing similar timing and appearance, but different interpretations of its cause.",
      data: "The described appearance (a slow-moving light fading after several minutes) matches across all three accounts. The proposed causes differ widely between reports.",
      interpretationChoices: [
        { label: "The consistent physical description is more reliable than the varying explanations", desc: "Corroboration-based reasoning", score: 3 },
        { label: "Since the explanations differ, none of the reports can be trusted at all", desc: "Discards useful corroborated data", score: 0 },
        { label: "The most confident-sounding explanation is probably correct", desc: "Mistakes confidence for evidence", score: 0 }
      ],
      insight: "A central skill in the development of modern scientific reasoning was learning to separate what was actually observed from the interpretation layered on top of it — and to weigh corroborating evidence across independent sources."
    }
  ];

  function render(container, ctx) {
    let invIndex = 0;
    let stage = "question"; // question -> observation -> hypothesis -> test -> data -> interpretation -> conclusion
    let score = 0;
    let maxScore = 0;
    let chosenHyp = null, chosenInterp = null;

    function currentInv() { return investigations[invIndex]; }

    function draw() {
      ctx.headerExtra.innerHTML = ui.progressBar(invIndex + 1, investigations.length, `Investigation ${invIndex + 1} of ${investigations.length}`);
      const inv = currentInv();
      let html = "";

      if (stage === "question") {
        html = `<div class="card"><div class="section-title" style="margin-top:0">Question</div><h3>${inv.title}</h3><p>${inv.question}</p></div>
          <button class="btn btn-primary" id="next">Begin Observation →</button>`;
      } else if (stage === "observation") {
        html = ui.infoCallout(`<b>Observation.</b> ${inv.observation}`) +
          `<button class="btn btn-primary" id="next">Form a Hypothesis →</button>`;
      } else if (stage === "hypothesis") {
        html = ui.decisionCard("Hypothesis", "What best explains this observation?", "Choose the explanation you find most defensible before seeing the test.",
          inv.hypothesisChoices, chosenHyp);
        if (chosenHyp != null) html += `<button class="btn btn-primary" id="next">See the Test →</button>`;
      } else if (stage === "test") {
        html = ui.infoCallout(`<b>Test.</b> ${inv.test}`) +
          `<button class="btn btn-primary" id="next">See the Data →</button>`;
      } else if (stage === "data") {
        html = `<div class="card"><div class="section-title" style="margin-top:0">Data</div><p>${inv.data}</p></div>` +
          `<button class="btn btn-primary" id="next">Interpret the Evidence →</button>`;
      } else if (stage === "interpretation") {
        html = ui.decisionCard("Interpretation", "What conclusion does the evidence best support?", null, inv.interpretationChoices, chosenInterp);
        if (chosenInterp != null) html += `<button class="btn btn-primary" id="next">See Conclusion →</button>`;
      } else if (stage === "conclusion") {
        const hyp = inv.hypothesisChoices[chosenHyp];
        const interp = inv.interpretationChoices[chosenInterp];
        html = `<div class="card">
            <div class="section-title" style="margin-top:0">Your Reasoning</div>
            <p><b>Hypothesis chosen:</b> ${esc(hyp.label)}</p>
            <p><b>Interpretation chosen:</b> ${esc(interp.label)}</p>
          </div>` +
          ui.insightPanel("Historical Insight", inv.insight) +
          `<button class="btn btn-primary" id="next">${invIndex < investigations.length - 1 ? "Next Investigation →" : "Finish Lab →"}</button>`;
      }

      container.innerHTML = html;

      container.querySelectorAll("[data-opt]").forEach(b => {
        b.addEventListener("click", () => {
          const i = parseInt(b.dataset.opt, 10);
          if (stage === "hypothesis") { chosenHyp = i; maxScore += 3; score += inv.hypothesisChoices[i].score; }
          if (stage === "interpretation") { chosenInterp = i; maxScore += 3; score += inv.interpretationChoices[i].score; }
          draw();
        });
      });

      const next = container.querySelector("#next");
      if (next) next.addEventListener("click", () => {
        const order = ["question", "observation", "hypothesis", "test", "data", "interpretation", "conclusion"];
        if (stage === "conclusion") {
          if (invIndex < investigations.length - 1) { invIndex++; stage = "question"; chosenHyp = null; chosenInterp = null; }
          else { showEnd(); return; }
        } else {
          const idx = order.indexOf(stage);
          stage = order[idx + 1];
        }
        draw();
      });
    }

    function showEnd() {
      ctx.headerExtra.innerHTML = "";
      const pct = Math.round((score / maxScore) * 100);
      let title, subtitle, icon, iconBg;
      if (pct >= 75) { title = "Rigorous Investigator"; icon = "🔬"; iconBg = "#43A047"; subtitle = "You consistently distinguished evidence from assumption."; }
      else if (pct >= 45) { title = "Developing Investigator"; icon = "🧪"; iconBg = "#1976D2"; subtitle = "You showed sound reasoning with some room to sharpen it."; }
      else { title = "Early-Stage Investigator"; icon = "📓"; iconBg = "#FFB300"; subtitle = "Revisit how you separated observation from assumption."; }

      const html = ui.endReport({
        icon, iconBg, title, subtitle,
        summaryLines: [
          `Evidence reasoning score: <b>${pct}%</b> across three investigations.`,
          `The Scientific Revolution was defined less by any single discovery than by a changing standard for what counted as good evidence.`
        ],
        reflectionQuestions: [
          "In which investigation was it hardest to separate observation from assumption? Why?",
          "How did controlled testing (like the ramp) improve on simply trusting authority or tradition?",
          "Why is corroboration across independent sources valuable in evaluating evidence?",
          "Can you think of a modern example where confident explanation is mistaken for solid evidence?",
          "How did the scientific method described here differ from simply guessing an answer?"
        ]
      }) + `<div class="btn-block-group" style="margin-top:18px">
          <button class="btn btn-secondary" id="restartBtn">Restart Lab</button>
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
    id: "scientificrevolution",
    title: "Scientific Revolution Lab",
    tagline: "Test competing explanations using observation, evidence and reasoning.",
    icon: "🔭",
    color: COLOR, colorDark: COLOR_DARK,
    tags: ["Scientific Reasoning", "Evidence", "Experimentation"],
    description: "Investigate three historically inspired scientific puzzles. Form a hypothesis before seeing the test, then interpret real evidence — learning to separate observation from assumption along the way.",
    instructions: [
      "Read each question, then form a hypothesis before the test is revealed.",
      "Review the test and resulting data.",
      "Interpret what the evidence actually supports — not what you'd like it to say.",
      "See a historical insight after each investigation, then move to the next."
    ],
    render
  });
})();
