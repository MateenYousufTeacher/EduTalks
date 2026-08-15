# Virtual Simulations — 10 New Economics Labs

Created by **Dr. Mateen Yousuf**, Teacher, School Education Department Kashmir.

A 100% offline-capable Progressive Web App containing 10 interactive economics
simulations, built to the provided design system (colors, typography, layout,
and PWA structure).

## The 10 Simulations

1. **Strategy Arena** — Game Theory & Strategic Interaction
2. **Ripple Effect** — Externalities & Social Cost
3. **Commons Challenge** — Public Goods & the Free-Rider Problem
4. **Workforce Lab** — Labour Economics & Wage Formation
5. **Production Factory** — Production Functions & Returns to Scale
6. **Cost Control Lab** — Cost Structures & Break-Even Analysis
7. **Market Power Lab** — Monopoly, Oligopoly & Market Structures
8. **Equality Lens** — Income Distribution & Inequality (Lorenz curve, Gini)
9. **JobQuest** — Unemployment & Job Search
10. **Development Builder** — Economic Development & Human Capital (20-year sim)

Each lab is self-contained: interactive controls, live calculations, visual
feedback, and a short adaptive quiz at the end. Scores, favorites and visit
history are saved on-device with `localStorage` — nothing is ever uploaded.

## Try It Instantly (no install needed)

From this folder, run a local server and open it in a browser:

```bash
python3 -m http.server 8080
# then open http://localhost:8080 in your browser
```

Opening `index.html` directly by double-clicking will also work for browsing,
but the offline service worker only activates when served over `http://` or
`https://` (this is a browser security rule, not a bug).

## Installing as a Real App (PWA)

To get the "Add to Home Screen" / installable app experience with full
offline support, host these files on any static web host over HTTPS, e.g.:

- **GitHub Pages** — push this folder to a repo and enable Pages
- **Netlify / Vercel** — drag-and-drop the folder in their dashboard
- **Any web host** — upload the folder as-is; no build step required

Once loaded once online, the service worker (`sw.js`) caches every file, so
the app keeps working with no internet connection afterward — exactly as
specified (offline-first, 100% client-side, no backend).

## Project Structure

```
index.html              App shell + navigation
manifest.json            PWA manifest (installability)
sw.js                     Offline service worker (cache-first)
css/style.css             Design system: colors, type, components
js/app.js                 Routing, dashboard, favorites, quiz/chart helpers
js/sims/*.js              One file per simulation (10 total)
icons/                    App icons + creator photo
```

## Adding an 11th Simulation Later

Each simulation file follows the same pattern — copy any file in `js/sims/`
as a template, then:

1. Write a `mount(container, ctx)` function using `ctx.el`, `ctx.renderBars`,
   `ctx.renderQuiz`, `ctx.toast`, and `ctx.saveScore`.
2. Register it: `window.SIMS.push({ id, title, category, tagline, color, icon, mount })`.
3. Add a `<script src="js/sims/your-file.js"></script>` line in `index.html`
   and list the file in `sw.js`'s `ASSETS` array for offline caching.

No build tools, bundlers, or frameworks are required — everything is plain
HTML/CSS/JS so it stays easy to read, edit, and extend.
