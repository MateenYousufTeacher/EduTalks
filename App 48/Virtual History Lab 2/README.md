# Virtual Simulations — History Laboratory (PWA)

Created by **Dr. Mateen Yousuf**, Teacher, School Education Department Kashmir

## What's inside
A 100% offline-first Progressive Web App containing **10 fully interactive history simulations**:

1. Mesopotamia — Build the First City (city administration)
2. Ancient China — The Mandate of Heaven (dynasty governance/legitimacy)
3. Athens — Build a Democracy (debate & voting)
4. Rome — Engineer an Empire (aqueduct/road/bridge engineering)
5. Renaissance Workshop (art, patronage, apprentices)
6. Silk Road Trader (trade network economics)
7. Scientific Revolution Lab (hypothesis → test → evidence reasoning)
8. Age of Exploration — Navigate the Unknown (instruments & uncertainty)
9. Cold War Crisis Room (diplomacy & de-escalation)
10. History Detective — Reconstruct the Past (evidence reliability & inference)

Every simulation follows **manage → decide → observe consequences → learn**: real dashboards, genuine trade-off decisions, immediate/long-term feedback, historical insight panels, and a final reflection report with discussion questions — not multiple-choice quizzes.

## How to try it right now
Because it's a PWA loaded via `file://`, some browsers restrict service workers and fonts on that protocol. For the full experience (installable, offline, fonts working), serve it over local HTTP:

```bash
cd vsl-pwa
python3 -m http.server 8080
# then open http://localhost:8080 in your browser
```

Or use any static host (see below). Opening `index.html` directly by double-clicking will still mostly work, just without the installable/offline service-worker layer.

## Deploying for real use (recommended)
Upload the entire `vsl-pwa` folder to any static web host, for example:
- **GitHub Pages** — push this folder to a repo and enable Pages.
- **Netlify / Vercel** — drag-and-drop the `vsl-pwa` folder.
- Your school's own web server — copy the folder as-is; no build step, no server-side code needed.

Once hosted over HTTPS, visitors can tap **"Add to Home Screen"** (Android/desktop Chrome) or use Safari's **Share → Add to Home Screen** (iOS) to install it like a native app. After the first visit, it works completely offline.

## Design system
Colors, typography (Poppins/Nunito Sans, bundled locally as `.woff2` — no internet needed), icon style, and the six-screen app layout (Splash → Home Dashboard → Simulation List → Simulation Screen → Controls → Info) all follow the brand sheet you provided.

## Architecture (for future expansion)
- `js/utils.js` — shared storage layer, reusable UI component builders, and a generic `TurnEngine` used by several simulations.
- `js/harness.js` — app shell: routing, navigation, the simulation registry (`VSL.registerSim`).
- `js/sims/*.js` — one file per simulation; each self-registers with the harness.
- `sw.js` — service worker precaching every asset for offline use.

To add an 11th simulation later, drop a new file in `js/sims/`, call `VSL.registerSim({...})`, add a `<script>` tag in `index.html`, and add its path to `PRECACHE_URLS` in `sw.js`.

## Testing performed
All 10 simulations were run end-to-end through their full decision trees using an automated headless test (no runtime errors, every path reaches a valid ending), and the full app shell (splash → home → simulation list → simulation → completion) was verified via a local server. One real bug was caught and fixed during this process (a missing "Continue" button in the Scientific Revolution Lab's hypothesis step).

## Known limitations / honest notes
- This is a strong working prototype, not a "pixel-perfect to the brand sheet in every detail" build — some visual polish (photography-style icons, custom illustration) was simplified to CSS/SVG for a fully offline, dependency-free result.
- The founder photo you uploaded (`assets/founder.jpg`) is used on the splash and About screens per your design brief — swap that file to update it.
- Silk Road cities/prices, Cold War/Athens scenarios, and History Detective cases are clearly labeled as fictionalized/simulated in-app, per good practice for historical simulations.
