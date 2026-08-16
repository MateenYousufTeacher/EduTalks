# Virtual Economics Laboratory
### Offline Progressive Web App · 10 Interactive Economics Simulations
**Created by Dr. Mateen Yousuf · Teacher, School Education Department, Kashmir**

---

## What this is

A fully offline, installable Progressive Web App containing **10 complete interactive
economics simulations** (Demand & Supply, Market Equilibrium, Inflation, Banking,
GDP & National Income, Budget & Public Finance, Taxation, International Trade,
Consumer Behaviour, and Entrepreneurship), plus a gamified home dashboard, an
Economics Handbook, a Quiz Centre, an illustrated Glossary, Bookmarks, Achievements
and Settings — all built with plain HTML5, CSS3 and vanilla JavaScript. No backend,
no login, no internet connection required after the first load.

## How to run it

Browsers block Service Workers (needed for full offline support) on plain
`file://` pages, so run it through a tiny local web server the first time:

**Option A — Python (already on most computers)**
```bash
cd veclab
python3 -m http.server 8080
```
Then open **http://localhost:8080** in Chrome/Edge/Firefox.

**Option B — VS Code**
Install the "Live Server" extension, right-click `index.html` → *Open with Live Server*.

**Option C — Any static host**
Upload the entire `veclab` folder as-is to any static web host (GitHub Pages,
Netlify, a school intranet server, etc.) — no build step is required.

Once it has loaded **once**, the Service Worker caches the entire app, and it will
keep working completely offline afterwards (airplane mode, no Wi-Fi, etc.) — even
if you close and reopen the browser.

## Installing as an app

On desktop Chrome/Edge, click the "install" icon in the address bar. On Android
Chrome, use "Add to Home Screen" from the browser menu. The app will then open in
its own window/icon just like a native app.

## Folder structure

```
veclab/
├── index.html              # App shell: splash screen, sidebar, all view containers
├── manifest.json            # PWA manifest (name, icons, theme colors)
├── service-worker.js        # Full offline caching
├── css/style.css            # Master design system (colors, typography, components)
├── js/
│   ├── db.js                 # localStorage-backed progress/XP/settings persistence
│   ├── charts.js              # Canvas chart toolkit (line/bar/donut/curve charts)
│   ├── econ-models.js         # Shared economic math (demand-supply, tax, interest…)
│   ├── app.js                  # Routing + generic simulation runtime engine
│   ├── glossary-data.js        # Illustrated glossary term bank
│   ├── handbook-data.js        # Economics Handbook chapters
│   └── simulations/            # One file per simulation (10 files)
├── assets/developer.jpg      # Developer photo (title page & About page)
└── icons/                     # PWA app icons (192px & 512px)
```

## Customising or extending

Each file in `js/simulations/` is self-contained and follows the same shape
(`objectives`, `concept`, `variables`, `compute()`, `quiz`, `summary`) — so you can
add an 11th simulation by copying one of these files, changing the `id`, and adding
it to `SIM_ORDER` in `js/app.js` plus a `<script>` tag in `index.html`.

---
*Virtual Economics Laboratory v1.0 — Part of the Virtual Simulations series for
Science & Social Science, sharing one consistent design language across subjects.*
