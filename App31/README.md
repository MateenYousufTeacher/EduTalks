# 📚 Foundational Numeracy Mastery Lab
## Complete Setup & APK Conversion Guide
**Developer:** Mateen Yousuf | Teacher, School Education Department Kashmir

---

## 📁 FILE STRUCTURE

```
foundational-numeracy-mastery-lab/
├── index.html          ← Main app (entire app in one file)
├── manifest.json       ← PWA manifest
├── service-worker.js   ← Offline caching service worker
├── author.jpg          ← Author photo (your image)
├── icons/
│   ├── icon-192.png    ← App icon (192×192)
│   └── icon-512.png    ← App icon (512×512)
└── README.md           ← This file
```

---

## 🚀 HOW TO RUN LOCALLY

### Option 1: VS Code Live Server (Recommended)
1. Open VS Code
2. Install the **Live Server** extension (by Ritwick Dey)
3. Right-click `index.html` → **Open with Live Server**
4. App opens at `http://localhost:5500`

### Option 2: Python Local Server
```bash
cd foundational-numeracy-mastery-lab
python -m http.server 8080
# Open: http://localhost:8080
```

### Option 3: Node.js Server
```bash
npx serve .
# Open the URL shown in terminal
```

> ⚠️ **Important:** Always run via a server (not by opening index.html directly as a file://). Service workers require HTTP/HTTPS.

---

## 🌐 HOW TO HOST FOR FREE

### Option 1: GitHub Pages (Easiest)
1. Create a free account at github.com
2. Create new repository: `numeracy-lab`
3. Upload all files to the repository
4. Go to **Settings → Pages**
5. Set source to **main branch**, folder **/(root)**
6. Your app will be live at: `https://yourusername.github.io/numeracy-lab`

### Option 2: Netlify
1. Go to netlify.com → Sign up free
2. Drag & drop your entire project folder into Netlify
3. Get a live URL instantly: `https://random-name.netlify.app`
4. You can set a custom subdomain: `numeracy-lab.netlify.app`

### Option 3: Cloudflare Pages
1. Go to pages.cloudflare.com
2. Connect your GitHub repo OR upload directly
3. Free hosting with custom domain support

---

## 📱 HOW TO INSTALL AS PWA (Add to Home Screen)

### On Android (Chrome)
1. Open the hosted URL in Chrome
2. Chrome shows "Add to Home Screen" banner at bottom
3. Tap **Add** — app installs like a native app
4. Works completely offline after installation

### On iPhone/iPad (Safari)
1. Open URL in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down → tap **Add to Home Screen**
4. Tap **Add** in top right corner

### On Desktop (Chrome/Edge)
1. Open URL in Chrome or Edge
2. Click the **install icon** in the address bar (circle with down arrow)
3. Click **Install**

---

## 📦 APK CONVERSION GUIDE (Android App)

### Method 1: Android Studio WebView (Professional)

#### Prerequisites
- Android Studio installed (free from developer.android.com)
- Java Development Kit (JDK) installed
- Your app hosted on a URL OR using localhost

#### Step 1: Create New Android Project
```
File → New Project → Empty Activity
Name: FoundationalNumeracyLab
Package: com.mateenyousuf.numeracylab
Min SDK: API 21 (Android 5.0 — covers 99% of devices)
Language: Java
```

#### Step 2: Add Internet Permission
In `AndroidManifest.xml`, add:
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
```

#### Step 3: Configure WebView in MainActivity.java
```java
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);  // Enables localStorage
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);

        webView.setWebViewClient(new WebViewClient());

        // Load from assets (copy your files to assets/ folder)
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
```

#### Step 4: Activity Layout (activity_main.xml)
```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>
</RelativeLayout>
```

#### Step 5: Copy App Files to Assets
1. In Android Studio, create folder: `app/src/main/assets/`
2. Copy these files into assets/:
   - `index.html`
   - `author.jpg`
   - `manifest.json`

#### Step 6: App Icons
Place your icon images in:
- `res/mipmap-mdpi/ic_launcher.png` (48×48)
- `res/mipmap-hdpi/ic_launcher.png` (72×72)
- `res/mipmap-xhdpi/ic_launcher.png` (96×96)
- `res/mipmap-xxhdpi/ic_launcher.png` (144×144)
- `res/mipmap-xxxhdpi/ic_launcher.png` (192×192)

#### Step 7: Splash Screen
In `res/drawable/splash.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/navy"/>
    <item>
        <bitmap android:gravity="center" android:src="@mipmap/ic_launcher"/>
    </item>
</layer-list>
```

#### Step 8: Build Debug APK
```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```
APK location: `app/build/outputs/apk/debug/app-debug.apk`

#### Step 9: Sign Release APK
```
Build → Generate Signed Bundle / APK
→ APK → Next
→ Create new keystore (keep the file safe!)
→ Fill in details → Next → Release → Finish
```

---

### Method 2: Bubblewrap CLI (PWA to APK — Easiest)

#### Prerequisites
```bash
npm install -g @bubblewrap/cli
```

#### Steps
```bash
# Navigate to your project
cd foundational-numeracy-mastery-lab

# Initialize (uses manifest.json)
bubblewrap init --manifest https://your-github-pages-url/manifest.json

# Build APK
bubblewrap build

# Output: app-release-signed.apk
```

> This method creates a Trusted Web Activity (TWA) — the recommended way to convert PWAs to APK.

---

### Method 3: PWABuilder (No Code — Easiest)
1. Host app on GitHub Pages / Netlify
2. Go to **pwabuilder.com**
3. Enter your app URL
4. Click **Start** → **Build My PWA**
5. Select **Android** → Download APK package
6. Follow included signing instructions

---

## 🎨 CREATING APP ICONS

Use any of these free tools:
- **Canva.com** → Logo Maker → Export as PNG 512×512
- **Figma.com** → Free design tool
- **Android Asset Studio** → romannurik.github.io/AndroidAssetStudio

Icon design suggestion:
- Background: Deep navy (#1a3a5c)
- Symbol: White number "123" or abacus
- Style: Clean, minimal, recognizable at small size

---

## 🔧 TECHNICAL NOTES

### LocalStorage Keys Used
```javascript
'fnml_scores'  // Student performance data (JSON)
```

### Data Stored Per Session
- Correct/wrong counts per module
- Progress percentages
- (All stored locally, never sent anywhere)

### Browser Compatibility
- Chrome 80+ ✅
- Firefox 75+ ✅
- Safari 13+ ✅
- Samsung Internet 12+ ✅
- UC Browser ✅

### Performance
- Single HTML file: ~50KB
- No external dependencies
- Loads in under 1 second even on 2G
- Works on Android 5.0+, iOS 12+

---

## 📞 SUPPORT

**Developed by:** Mateen Yousuf  
**Designation:** Teacher, School Education Department  
**Location:** Kashmir, Jammu & Kashmir, India  
**Purpose:** NEP 2020 & FLN Mission Implementation  

---

*This app is dedicated to every child in Kashmir and across India who deserves quality foundational numeracy education — offline, accessible, and free.*
