const CACHE_NAME = 'envlab-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/utils.js',
  './js/data.js',
  './js/app.js',
  './js/sim-framework.js',
  './js/sims/water-cycle.js',
  './js/sims/carbon-cycle.js',
  './js/sims/nitrogen-cycle.js',
  './js/sims/air-pollution.js',
  './js/sims/water-pollution.js',
  './js/sims/waste-management.js',
  './js/sims/renewable-energy.js',
  './js/sims/climate-change.js',
  './js/sims/biodiversity.js',
  './js/sims/sustainable-town.js',
  './assets/developer.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
