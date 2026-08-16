/* ===================== Virtual Environmental Science Laboratory ===================== */
/* utils.js — storage, gamification, charts, helpers                                    */
'use strict';

const Store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('evlab_' + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('evlab_' + key, JSON.stringify(value)); } catch (e) {}
  }
};

const Profile = {
  data() {
    return Store.get('profile', {
      xp: 0, ecoPoints: 0, streak: 0, lastVisit: null,
      completed: {}, achievements: [], bookmarks: [], quizScores: {}
    });
  },
  save(p) { Store.set('profile', p); },
  addXP(amount, reason) {
    const p = this.data();
    p.xp += amount;
    p.ecoPoints += Math.round(amount / 2);
    this.save(p);
    Toast.show(`+${amount} XP${reason ? ' · ' + reason : ''}`, 'xp');
    App.refreshHeaderStats && App.refreshHeaderStats();
  },
  markComplete(simId) {
    const p = this.data();
    p.completed[simId] = true;
    this.save(p);
    this.unlock('complete_' + simId, `Completed ${SIM_META[simId] ? SIM_META[simId].title : simId}`);
  },
  unlock(id, label) {
    const p = this.data();
    if (p.achievements.includes(id)) return;
    p.achievements.push(id);
    this.save(p);
    Toast.show(`🏆 Achievement unlocked: ${label}`, 'achv');
  },
  rank() {
    const xp = this.data().xp;
    if (xp >= 2000) return 'Planet Guardian';
    if (xp >= 1200) return 'Eco Champion';
    if (xp >= 600) return 'Sustainability Scholar';
    if (xp >= 200) return 'Green Explorer';
    return 'Sapling';
  },
  touchStreak() {
    const p = this.data();
    const today = new Date().toDateString();
    if (p.lastVisit !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      p.streak = (p.lastVisit === yesterday) ? p.streak + 1 : 1;
      p.lastVisit = today;
      this.save(p);
    }
    return p.streak;
  }
};

const Toast = {
  show(msg, type = 'info') {
    let host = document.getElementById('toastHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toastHost';
      document.body.appendChild(host);
    }
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    host.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
  }
};

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function rand(min, max) { return Math.random() * (max - min) + min; }
function fmt(n, d = 1) { return Number(n).toFixed(d); }
function uid() { return Math.random().toString(36).slice(2, 9); }

/* ---------- Lightweight multi-series canvas line chart (no external libs) ---------- */
class LiveChart {
  constructor(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.series = opts.series;        // [{key,label,color}]
    this.maxPoints = opts.maxPoints || 60;
    this.yLabel = opts.yLabel || '';
    this.data = [];                   // [{t, key: val, ...}]
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    const c = this.canvas;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = Math.max(1, rect.width * dpr);
    c.height = Math.max(1, rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = rect.width; this.h = rect.height;
    this.draw();
  }
  push(point) {
    this.data.push(point);
    if (this.data.length > this.maxPoints) this.data.shift();
    this.draw();
  }
  reset() { this.data = []; this.draw(); }
  draw() {
    const ctx = this.ctx, w = this.w, h = this.h;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    const pad = { l: 40, r: 12, t: 10, b: 22 };
    const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
    const css = getComputedStyle(document.documentElement);
    const gridColor = css.getPropertyValue('--chart-grid').trim() || '#e0e0e0';
    const textColor = css.getPropertyValue('--text-dim').trim() || '#888';
    ctx.strokeStyle = gridColor; ctx.fillStyle = textColor;
    ctx.font = '10px Poppins, sans-serif';
    ctx.lineWidth = 1;

    let allVals = [0];
    this.data.forEach(d => this.series.forEach(s => { if (typeof d[s.key] === 'number') allVals.push(d[s.key]); }));
    let vMax = Math.max(...allVals, 1) * 1.15;
    let vMin = Math.min(0, Math.min(...allVals));

    for (let i = 0; i <= 4; i++) {
      const y = pad.t + plotH - (plotH * i / 4);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      const val = vMin + (vMax - vMin) * i / 4;
      ctx.fillText(fmt(val, val < 10 ? 1 : 0), 2, y + 3);
    }

    if (this.data.length > 1) {
      this.series.forEach(s => {
        ctx.beginPath();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        this.data.forEach((d, i) => {
          const x = pad.l + (plotW * i / (this.maxPoints - 1));
          const val = (typeof d[s.key] === 'number') ? d[s.key] : 0;
          const y = pad.t + plotH - ((val - vMin) / (vMax - vMin || 1)) * plotH;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
    }
    // legend
    let lx = pad.l;
    this.series.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.fillRect(lx, h - 12, 8, 8);
      ctx.fillStyle = textColor;
      ctx.fillText(s.label, lx + 11, h - 4);
      lx += ctx.measureText(s.label).width + 28;
    });
  }
}

function exportCSV(filename, columns, rows) {
  const header = columns.join(',');
  const body = rows.map(r => columns.map(c => r[c] ?? '').join(',')).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function screenshotCanvas(canvas, filename) {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = filename;
  a.click();
}

function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'html') e.innerHTML = attrs[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c == null) return;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return e;
}
