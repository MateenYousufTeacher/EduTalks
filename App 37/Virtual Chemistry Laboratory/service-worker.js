/* ============================================================
   SERVICE WORKER — cache-first offline support
   Virtual Chemistry Laboratory PWA
   ============================================================ */

const CACHE_NAME = 'vcl-cache-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/data.js',
  './js/elements.js',
  './js/app.js',
  './js/boot.js',
  './js/tools.js',
  './js/simulations/atomic.js',
  './js/simulations/periodic.js',
  './js/simulations/bonding.js',
  './js/simulations/phlab.js',
  './js/simulations/reactions.js',
  './js/simulations/balancing.js',
  './js/simulations/metals.js',
  './js/simulations/separation.js',
  './js/simulations/electrolysis.js',
  './js/simulations/carbon.js',
  './assets/developer-photo.jpeg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
