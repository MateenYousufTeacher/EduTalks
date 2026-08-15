/* ============================================================
   VIRTUAL GEOGRAPHY LABORATORY — SERVICE WORKER
   Cache-first offline strategy
   ============================================================ */
const CACHE_NAME = 'geolab-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/design-system.css',
  './css/components.css',
  './css/app.css',
  './js/app.js',
  './js/pages.js',
  './js/sim-shell.js',
  './js/simulations/01-earth-interior.js',
  './js/simulations/02-plate-tectonics.js',
  './js/simulations/03-volcano.js',
  './js/simulations/04-earthquake.js',
  './js/simulations/05-weather-climate.js',
  './js/simulations/06-ocean-currents.js',
  './js/simulations/07-river-landforms.js',
  './js/simulations/08-lat-long.js',
  './js/simulations/09-population.js',
  './js/simulations/10-resources.js',
  './assets/developer-photo.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
  './icons/icon-32.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if(cached) return cached;
      return fetch(event.request).then(response => {
        if(response && response.status===200 && response.type==='basic'){
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(()=> caches.match('./index.html'));
    })
  );
});
