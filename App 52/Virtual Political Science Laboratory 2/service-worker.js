/* ============================================================
   SERVICE WORKER — Virtual Political Science Laboratory
   Cache-first strategy: enables 100% offline use after first load.
   ============================================================ */

const CACHE_NAME = 'vpsl-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/sim-engine.js',
  './js/quiz-engine.js',
  './js/achievements.js',
  './js/reference-data.js',
  './js/sim-01-democracy.js',
  './js/sim-02-election.js',
  './js/sim-03-parliament.js',
  './js/sim-04-executive.js',
  './js/sim-05-judiciary.js',
  './js/sim-06-constitution.js',
  './js/sim-07-federalism.js',
  './js/sim-08-local.js',
  './js/sim-09-policy.js',
  './js/sim-10-lawmaking.js',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/developer.jpg'
];

// ---- install: pre-cache all core assets ----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ---- activate: clean up old caches ----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ---- fetch: cache-first, network fallback, offline fallback to index.html ----
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
