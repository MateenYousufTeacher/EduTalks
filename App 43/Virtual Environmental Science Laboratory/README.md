# Virtual Environmental Science Laboratory
### Created by Dr. Mateen Yousuf — Teacher, School Education Department, Kashmir

An offline-first Progressive Web App with 10 fully interactive environmental
science simulations for Classes VI–XII.

## How to run it

**Option A — Quick preview (any computer):**
1. Unzip the folder.
2. Open a terminal inside the folder and run a tiny local server (needed because
   the app is split into multiple files):
   - Python: `python3 -m http.server 8080`
   - Node: `npx serve .`
3. Open `http://localhost:8080` in Chrome/Edge/Firefox.

**Option B — Install as an app (PWA):**
1. Host the folder on any static web host (GitHub Pages, Netlify, a school
   server, or the local server above works too).
2. Open the site in Chrome on desktop or Android.
3. Use the browser menu → "Install app" / "Add to Home Screen", or tap
   **Install PWA** inside Settings in the app itself.
4. Once installed, it works completely offline — no internet, login, or
   backend required. All progress (XP, achievements, quiz scores, bookmarks)
   is stored locally on the device.

> Note: opening `index.html` directly by double-clicking (file:// with no
> server) will NOT work in most browsers because of module/security
> restrictions — always serve it, even locally, as shown above.

## What's inside

- `index.html` — app shell and navigation
- `css/style.css` — the full design system (colors, typography, layout)
- `js/utils.js` — storage, XP/achievements, toast notifications, canvas chart engine
- `js/data.js` — glossary, handbook, resource library, simulation metadata
- `js/sim-framework.js` — the shared engine every simulation plugs into
  (controls, canvas rendering loop, tabs, quizzes, data logging, CSV export)
- `js/sims/*.js` — the 10 individual simulations
- `manifest.json` + `sw.js` — PWA install + offline caching
- `assets/developer.jpg` — your photo, shown on the title screen and About page

## The 10 simulations

1. Water Cycle Simulator
2. Carbon Cycle Explorer
3. Nitrogen Cycle Laboratory
4. Air Pollution Laboratory
5. Water Pollution Laboratory
6. Waste Management & Recycling Studio
7. Renewable Energy Laboratory
8. Climate Change Simulator
9. Biodiversity & Conservation Explorer
10. Sustainable Development Challenge (capstone)

Every simulation includes: adjustable variables, a live animated canvas,
indicator readouts, an auto-logging observation table with CSV export,
a live multi-series graph, scientific background, human impact & solutions,
facts & misconceptions, a 5-question mini quiz with instant feedback, and a
summary — plus Play/Pause/Step/Reset/Randomize/Teacher-Student mode/
Fullscreen/Screenshot controls.

## Customizing

- Edit `js/data.js` to add glossary terms, handbook sections or resource
  library entries.
- Edit any file in `js/sims/` to tune the science model, visuals, or quiz
  questions for that simulation — each file is self-contained.
- Colors and fonts live at the top of `css/style.css` as CSS variables.
