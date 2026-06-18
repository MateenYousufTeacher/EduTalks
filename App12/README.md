# 🔍 Word Detective PWA — Setup Instructions
## By Mateen Yousuf | Author & Educator

---

## 📁 FILE STRUCTURE

Create a folder named `word-detective-app` and place these files inside:

```
word-detective-app/
├── index.html          ← Main app (everything inside)
├── manifest.json       ← PWA installation config
├── service-worker.js   ← Offline caching engine
└── author.jpg          ← Your photo (rename your image to author.jpg)
```

> **Important:** Rename your author photo file to exactly `author.jpg` and place it in the folder.

---

## ▶️ HOW TO RUN LOCALLY

### Option 1 — VS Code Live Server (Recommended)
1. Install VS Code → install "Live Server" extension
2. Open the `word-detective-app` folder in VS Code
3. Right-click `index.html` → "Open with Live Server"
4. App opens at `http://127.0.0.1:5500`

### Option 2 — Python Local Server
```bash
cd word-detective-app
python -m http.server 8080
```
Then open: `http://localhost:8080`

### Option 3 — Node.js (npx)
```bash
cd word-detective-app
npx serve .
```

> ⚠️ Do NOT open `index.html` directly as a file (file://). PWA features require a server.

---

## 📱 INSTALL AS MOBILE APP

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the menu (⋮) → "Add to Home Screen"
3. Tap "Install" — app icon appears on your home screen!

### iPhone (Safari)
1. Open in Safari
2. Tap the Share button (□↑)
3. Tap "Add to Home Screen"
4. Tap "Add"

---

## 🌐 HOST FOR FREE (Share with Students)

### GitHub Pages (Free)
1. Create a GitHub account at github.com
2. Create a new repository named `word-detective`
3. Upload all 4 files to the repository
4. Go to Settings → Pages → Source: main branch
5. Your app is live at: `https://yourusername.github.io/word-detective`

### Netlify (Free, Easiest)
1. Go to netlify.com → Sign up free
2. Drag and drop the `word-detective-app` folder onto Netlify
3. Get instant URL like: `https://word-detective.netlify.app`

### Cloudflare Pages (Free)
1. Go to pages.cloudflare.com
2. Connect GitHub repo or drag-drop files
3. Deploy in seconds

---

## 🎮 GAME FEATURES

| Feature | Details |
|---------|---------|
| Levels | 5 levels (Easy → Expert + Bonus) |
| Cases | 45 total paragraphs |
| Words | 150+ nouns, 100+ verbs, 150+ adjectives |
| Scoring | +1 noun, +2 verb/adj, +5 bonus |
| Timer | 60s → 25s per case |
| PWA | Installable, works 100% offline |
| Storage | LocalStorage (scores persist) |

---

## 🔧 CUSTOMIZATION

To add your own sentences, edit the `PARAGRAPHS` array in `index.html`:
```javascript
{ s:"Your sentence here.", nouns:["noun1","noun2"], verbs:["verb1"], adjs:["adj1"] },
```

---

*Word Detective PWA — Developed for educational use*
*Author: Mateen Yousuf | School Education Department*
