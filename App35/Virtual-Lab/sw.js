const CACHE = 'vbl-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/simulations/cell.js',
  './js/simulations/photosynthesis.js',
  './js/simulations/digestive.js',
  './js/simulations/respiratory.js',
  './js/simulations/circulatory.js',
  './js/simulations/nervous.js',
  './js/simulations/planttransport.js',
  './js/simulations/genetics.js',
  './js/simulations/ecosystem.js',
  './js/simulations/reproduction.js',
  './js/extras.js',
  './assets/developer.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
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
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => cached);
    })
  );
});
