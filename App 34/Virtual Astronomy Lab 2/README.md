# Stellar Spectroscope — Virtual Astronomy Laboratory
**Simulation 01 · Decode Starlight and Discover What Stars Are Made Of**
Created by Dr. Mateen Yousuf — Teacher, School Education Department, Kashmir

A fully offline-capable Progressive Web App (PWA) that teaches stellar
spectroscopy: how astronomers determine a star's temperature and chemical
composition purely from its light.

## What's inside
- `index.html` — app shell (all screens)
- `style.css` — dark observatory design system
- `data.js` — real astrophysical data: 8 stars (real Teff values), 8
  elements with real NIST-catalogued absorption wavelengths, a Planck's-law
  continuum generator, and wavelength→colour conversion
- `storage.js` — offline persistence (progress, scores, notebook)
- `app.js` — navigation, canvas rendering, and all interactions
- `sw.js` — service worker (cache-first, offline-first)
- `manifest.json` — PWA install manifest
- `icons/` — app icons

## Features
- **Free Exploration** — pick any of 8 real stars, split its light, click
  absorption lines to identify wavelength / element / spectral region /
  scientific significance.
- **Guided Experiment** — a 6-step walkthrough of the Sun's spectrum.
- **Challenge Mode** — an unknown star's spectrum; identify its elements
  and get an instant, scored analysis.
- **Compare Spectra** — overlay two stars' intensity graphs and read an
  auto-generated comparison of shared/unique elements.
- **Observation Notebook** — auto-logged line identifications plus your
  own free-text notes, stored locally.
- **Progress** — stars explored, lines identified, challenge history,
  best/average score — all saved offline via `localStorage`.
- **Concept & Vocabulary** — core explanation, key terms, FAQ.

## Running it locally
Opening `index.html` directly with `file://` works for browsing, but
**service workers (and therefore full offline installability) require the
app to be served over `http://` or `https://`.** From this folder, run
any static server, for example:

```bash
python3 -m http.server 8080
# then open http://localhost:8080 in your browser
```

or deploy the folder as-is to any static host (GitHub Pages, Netlify,
Vercel, Firebase Hosting, or your school's own server). No build step,
no backend, and no external dependencies are required — everything
(fonts fall back to system fonts, no CDN calls) runs fully offline once
the service worker has installed on first visit.

## Installing as an app
Once served over http(s), most browsers will offer an "Install" /
"Add to Home Screen" option (address bar icon on desktop Chrome/Edge,
or the browser share/menu on mobile). After installing once, the app
opens and works with the device fully offline.

## Scientific notes
- Star surface temperatures (Teff) are real published values.
- Absorption line wavelengths for each element are drawn from real
  spectroscopic reference data.
- The intensity graph is generated from Planck's law for the star's
  actual temperature, with Gaussian absorption dips subtracted at each
  element's real line wavelengths — so hotter/cooler stars produce
  genuinely different, physically-grounded spectra rather than static
  illustrations.
- This is a teaching model, not a substitute for a research-grade
  spectral synthesis code: line strengths are simplified to reflect the
  *correct qualitative trend* (which lines strengthen or fade with
  temperature) rather than exact laboratory line depths.
