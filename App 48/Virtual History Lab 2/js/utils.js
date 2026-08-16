/* ==========================================================================
   Virtual Simulations — utils.js
   Shared storage layer + reusable UI component builders + generic TurnEngine
   Used by harness.js and every simulation module in js/sims/*.js
   ========================================================================== */
(function (global) {
  "use strict";

  /* ---------------- Storage ---------------- */
  const STORE_KEY = "vsl_state_v1";
  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveStore(obj) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) {}
  }
  const storage = {
    get(key, fallback) {
      const s = loadStore();
      return key in s ? s[key] : fallback;
    },
    set(key, val) {
      const s = loadStore();
      s[key] = val;
      saveStore(s);
    },
    toggleInList(listKey, id) {
      const s = loadStore();
      const list = s[listKey] || [];
      const i = list.indexOf(id);
      if (i >= 0) list.splice(i, 1); else list.push(id);
      s[listKey] = list;
      saveStore(s);
      return list;
    },
    pushHistory(entry) {
      const s = loadStore();
      const h = s.history || [];
      h.unshift(Object.assign({ ts: Date.now() }, entry));
      s.history = h.slice(0, 50);
      saveStore(s);
    }
  };

  /* ---------------- Small helpers ---------------- */
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = el(`<div class="toast"></div>`); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 1800);
  }

  /* ---------------- UI builders ---------------- */
  const ui = {
    dashGrid(stats) {
      // stats: [{label, value, display, color, pct, delta}]
      const cells = stats.map(s => {
        const color = s.color || "#1976D2";
        const pct = s.pct != null ? clamp(s.pct, 0, 100) : null;
        const delta = s.delta ? `<span class="ds-delta ${s.delta > 0 ? "up" : "down"}">${s.delta > 0 ? "▲" : "▼"}${Math.abs(s.delta)}</span>` : "";
        return `<div class="dash-stat">
          <div class="ds-top"><span class="ds-label">${esc(s.label)}</span></div>
          <div class="ds-val" style="color:${color}">${esc(s.display != null ? s.display : s.value)}${delta}</div>
          ${pct != null ? `<div class="dash-meter"><div class="dash-meter-fill" style="width:${pct}%;background:${color}"></div></div>` : ""}
        </div>`;
      }).join("");
      return `<div class="dash-grid">${cells}</div>`;
    },

    progressBar(current, total, label) {
      const pct = clamp((current / total) * 100, 0, 100);
      return `<div class="sim-progress-wrap">
        <div class="sim-progress-bar"><div class="sim-progress-fill" style="width:${pct}%"></div></div>
        <div class="sim-progress-label">${esc(label || `Turn ${current} of ${total}`)}</div>
      </div>`;
    },

    eventCard(title, text, tag) {
      return `<div class="event-card">
        <div class="ev-tag">⚡ ${esc(tag || "Historical Event")}</div>
        <div class="ev-title">${esc(title)}</div>
        <div>${text}</div>
      </div>`;
    },

    infoCallout(text, kind) {
      return `<div class="info-callout ${kind || ""}">${text}</div>`;
    },

    decisionCard(tag, title, desc, options, chosenIndex) {
      // options: [{label, desc}]
      const ops = options.map((o, i) => `
        <button class="option-btn ${chosenIndex === i ? "chosen" : ""}" data-opt="${i}" ${chosenIndex != null ? "disabled" : ""}>
          <div class="op-label">${esc(o.label)}</div>
          ${o.desc ? `<div class="op-desc">${esc(o.desc)}</div>` : ""}
        </button>`).join("");
      return `<div class="decision-card">
        <div class="dc-tag">${esc(tag || "Decision")}</div>
        <div class="dc-title">${esc(title)}</div>
        ${desc ? `<div class="dc-desc">${desc}</div>` : ""}
        <div class="option-list">${ops}</div>
      </div>`;
    },

    feedbackPanel(rows) {
      // rows: [{label, text}]
      return `<div class="feedback-panel">
        ${rows.map(r => `<div class="fb-row"><div class="fb-label">${esc(r.label)}</div><div class="fb-text">${r.text}</div></div>`).join("")}
      </div>`;
    },

    insightPanel(label, text) {
      return `<div class="feedback-panel insight"><div class="fb-row"><div class="fb-label">${esc(label || "Historical Insight")}</div><div class="fb-text">${text}</div></div></div>`;
    },

    endReport({ icon, iconBg, title, subtitle, stats, summaryLines, reflectionQuestions }) {
      const rows = (stats || []).map(r => `<div class="rs-row"><span>${esc(r.label)}</span><b>${esc(r.value)}</b></div>`).join("");
      const lines = (summaryLines || []).map(l => `<p>${l}</p>`).join("");
      const rq = (reflectionQuestions || []).map((q, i) => `<div class="reflection-q"><b>${i + 1}.</b> ${q}</div>`).join("");
      return `<div class="end-report">
        <div class="badge" style="background:${iconBg || "#1976D2"}">${icon || "🏁"}</div>
        <h2>${esc(title)}</h2>
        ${subtitle ? `<p style="color:#8892A0">${esc(subtitle)}</p>` : ""}
        <div class="card" style="text-align:left;margin-top:18px">
          <div class="section-title" style="margin-top:0">Summary</div>
          ${lines}
          ${rows ? `<div class="report-stat-list" style="margin-top:10px">${rows}</div>` : ""}
        </div>
        ${rq ? `<div style="text-align:left"><div class="section-title">Reflect &amp; Discuss</div>${rq}</div>` : ""}
      </div>`;
    }
  };

  /* ---------------- Generic Turn Engine ----------------
     A reusable, data-driven simulation runner used by several modules
     (Mesopotamia, Ancient China, Renaissance, Cold War, Scientific
     Revolution, etc). It implements the required loop:
       manage -> decide -> observe consequences -> learn
     Sim authors supply: theme, initial stats, a pool/sequence of decisions,
     random events, an end-condition evaluator, and reflection questions.
  --------------------------------------------------------------------- */
  class TurnEngine {
    constructor(config) {
      this.cfg = config; // see sim files for shape
      this.turn = 1;
      this.totalTurns = config.totalTurns || 10;
      this.stats = Object.assign({}, config.initialStats);
      this.log = [];
      this.phase = "intro"; // intro | decision | feedback | event | end
      this.currentDecision = null;
      this.currentOptionIndex = null;
      this.currentFeedback = null;
      this.usedDecisionIds = [];
    }

    start() { this.phase = "decision"; this.nextDecision(); }

    nextDecision() {
      const pool = this.cfg.decisions.filter(d => !this.usedDecisionIds.includes(d.id));
      if (!pool.length || this.turn > this.totalTurns) { this.endGame(); return; }
      // small chance of a random event before a decision (not on first turn)
      if (this.turn > 1 && this.cfg.events && this.cfg.events.length && Math.random() < 0.35) {
        this.phase = "event";
        this.currentEvent = pick(this.cfg.events);
        this.applyEffects(this.currentEvent.effects);
        return;
      }
      this.currentDecision = pick(pool);
      this.usedDecisionIds.push(this.currentDecision.id);
      this.phase = "decision";
    }

    acknowledgeEvent() {
      this.phase = "decision";
      this.currentDecision = pick(this.cfg.decisions.filter(d => !this.usedDecisionIds.includes(d.id)));
      if (this.currentDecision) this.usedDecisionIds.push(this.currentDecision.id);
      else this.endGame();
    }

    applyEffects(effects) {
      Object.keys(effects || {}).forEach(k => {
        const meta = this.cfg.statMeta[k];
        let v = this.stats[k] + effects[k];
        if (meta && meta.min != null) v = Math.max(meta.min, v);
        if (meta && meta.max != null) v = Math.min(meta.max, v);
        this.stats[k] = v;
      });
    }

    choose(optionIndex) {
      const opt = this.currentDecision.options[optionIndex];
      this.currentOptionIndex = optionIndex;
      this.applyEffects(opt.effects);
      this.currentFeedback = opt.feedback;
      this.log.push({ turn: this.turn, decision: this.currentDecision.title, choice: opt.label });
      this.phase = "feedback";
    }

    proceed() {
      this.turn += 1;
      this.currentDecision = null;
      this.currentOptionIndex = null;
      this.currentFeedback = null;
      this.currentEvent = null;
      if (this.checkFailure()) { this.endGame(true); return; }
      this.nextDecision();
    }

    checkFailure() {
      if (!this.cfg.failConditions) return false;
      return this.cfg.failConditions.some(f => f.test(this.stats));
    }

    endGame(failedEarly) {
      this.phase = "end";
      this.result = this.cfg.evaluateEnd(this.stats, this.log, failedEarly);
    }
  }

  /* ---------------- Generic renderer for TurnEngine-based sims ----------------
     config additionally needs: theme:{color,colorDark,icon}, statMeta (with
     label/color/format), dashboardStats(stats)->[{label,value,display,color,pct}]
  --------------------------------------------------------------------------- */
  function runTurnEngine(container, ctx, config) {
    const engine = new TurnEngine(config);
    engine.start();

    function draw() {
      const dash = ui.dashGrid(config.dashboardStats(engine.stats));
      let body = "";

      if (engine.phase === "decision" && engine.currentDecision) {
        const d = engine.currentDecision;
        body = ui.decisionCard(config.decisionTag || "Decision", d.title, d.desc, d.options, null);
      } else if (engine.phase === "feedback") {
        const d = engine.log[engine.log.length - 1];
        const fb = engine.currentFeedback;
        body = ui.decisionCard(config.decisionTag || "Decision", d.decision, null, engine.currentDecision.options,
          engine.currentDecision.options.findIndex(o => o.label === d.choice));
        body += ui.feedbackPanel([
          { label: "Immediate Effect", text: fb.immediate },
          { label: "Long-Term Effect", text: fb.longterm }
        ]);
        body += ui.insightPanel("Historical Insight", fb.insight);
        body += `<button class="btn btn-primary" id="continueBtn">Continue →</button>`;
      } else if (engine.phase === "event" && engine.currentEvent) {
        body = ui.eventCard(engine.currentEvent.title, engine.currentEvent.text, config.eventTag);
        body += `<button class="btn btn-primary" id="continueBtn">Continue →</button>`;
      } else if (engine.phase === "end") {
        const r = engine.result;
        body = ui.endReport(r);
        body += `<div class="btn-block-group" style="margin-top:18px">
          <button class="btn btn-secondary" id="restartBtn">Restart Simulation</button>
          <button class="btn btn-outline" id="homeBtn">Back to Simulations</button>
        </div>`;
        ctx.finish(r.title);
      }

      container.innerHTML = `${dash}${body}`;
      ctx.headerExtra.innerHTML = engine.phase === "end" ? "" : ui.progressBar(engine.turn, engine.totalTurns);

      if (engine.phase === "decision") {
        container.querySelectorAll("[data-opt]").forEach(b => {
          b.addEventListener("click", () => { engine.choose(parseInt(b.dataset.opt, 10)); draw(); });
        });
      }
      const cont = container.querySelector("#continueBtn");
      if (cont) cont.addEventListener("click", () => {
        if (engine.phase === "event") engine.acknowledgeEvent();
        else { engine.proceed(); }
        draw();
      });
      const restart = container.querySelector("#restartBtn");
      if (restart) restart.addEventListener("click", () => ctx.restart());
      const home = container.querySelector("#homeBtn");
      if (home) home.addEventListener("click", () => ctx.exitToIntro());
    }

    draw();
    return engine;
  }

  global.VSL = { storage, ui, el, esc, clamp, pick, toast, TurnEngine, runTurnEngine };
})(window);
