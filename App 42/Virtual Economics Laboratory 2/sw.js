const CACHE = 'virtual-sims-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/sims/strategy-arena.js',
  './js/sims/ripple-effect.js',
  './js/sims/commons-challenge.js',
  './js/sims/workforce-lab.js',
  './js/sims/production-factory.js',
  './js/sims/cost-control-lab.js',
  './js/sims/market-power-lab.js',
  './js/sims/equality-lens.js',
  './js/sims/jobquest.js',
  './js/sims/development-builder.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/creator.jpeg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200 && e.request.url.startsWith(self.location.origin)) {
          const clone = networkRes.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        }
        return networkRes;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
