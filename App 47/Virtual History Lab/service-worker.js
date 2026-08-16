/* Virtual History Laboratory — offline service worker */
const CACHE = 'vhl-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/data.js',
  './js/store.js',
  './js/app.js',
  './js/sims/harness.js',
  './js/sims/utils.js',
  './js/sims/stoneage.js',
  './js/sims/indus.js',
  './js/sims/egypt.js',
  './js/sims/medindia.js',
  './js/sims/mughal.js',
  './js/sims/industrial.js',
  './js/sims/frenchrev.js',
  './js/sims/freedom.js',
  './js/sims/ww2.js',
  './js/sims/constitution.js',
  './assets/developer.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(()=> self.skipWaiting()));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', (e)=>{
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy)).catch(()=>{});
        return resp;
      }).catch(()=> cached);
    })
  );
});
