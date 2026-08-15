/* Virtual Economics Laboratory — Service Worker
   Caches the entire app shell on install so it runs 100% offline forever after first load. */

const CACHE_NAME = 'veclab-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/db.js',
  './js/charts.js',
  './js/glossary-data.js',
  './js/handbook-data.js',
  './js/app.js',
  './js/simulations/demand-supply.js',
  './js/simulations/market-equilibrium.js',
  './js/simulations/inflation.js',
  './js/simulations/banking.js',
  './js/simulations/gdp.js',
  './js/simulations/budget.js',
  './js/simulations/taxation.js',
  './js/simulations/trade.js',
  './js/simulations/consumer.js',
  './js/simulations/entrepreneurship.js',
  './assets/developer.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first, falling back to network, falling back to cached index for navigations (offline SPA)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') return caches.match('./index.html');
        });
    })
  );
});
