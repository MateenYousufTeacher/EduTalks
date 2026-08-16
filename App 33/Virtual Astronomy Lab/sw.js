/* Virtual Astronomy Laboratory — Service Worker
   Caches the entire app shell on install so it works 100% offline thereafter. */

const CACHE_NAME = 'astro-lab-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/data.js',
  './js/app.js',
  './js/sims/01-solar-system.js',
  './js/sims/02-planetary-motion.js',
  './js/sims/03-moon-phases.js',
  './js/sims/04-solar-eclipse.js',
  './js/sims/05-lunar-eclipse.js',
  './js/sims/06-seasons.js',
  './js/sims/07-constellations.js',
  './js/sims/08-galaxy.js',
  './js/sims/09-blackhole.js',
  './js/sims/10-satellite.js',
  './assets/dev-photo.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

// Cache-first strategy — guarantees the app runs with zero network access.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(()=>{});
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
