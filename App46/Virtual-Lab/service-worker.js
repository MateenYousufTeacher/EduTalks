const CACHE = 'geolab-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/registry.js',
  './js/shared.js',
  './js/simulations/projection.js',
  './js/simulations/gis.js',
  './js/simulations/timezone.js',
  './js/simulations/urban.js',
  './js/simulations/farm.js',
  './js/simulations/transport.js',
  './js/simulations/tourism.js',
  './js/simulations/culture.js',
  './js/simulations/glacier.js',
  './js/simulations/landplanner.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, copy)).catch(()=>{});
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
