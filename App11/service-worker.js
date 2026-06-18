// Time Traveler PWA – Service Worker
// Handles offline caching for full offline play

const CACHE_NAME = 'time-traveler-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './author.jpg'
];

// ── INSTALL: cache all assets ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE.filter(url => !url.endsWith('.jpg') || url !== './author.jpg'));
    }).then(() => {
      // Cache author.jpg separately (may not exist)
      return caches.open(CACHE_NAME).then(cache =>
        cache.add('./author.jpg').catch(() => console.log('[SW] author.jpg not found, skipping'))
      );
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: clean old caches ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: cache-first strategy ────────────────────────────────────────────
self.addEventListener('fetch', event => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        console.log('[SW] Serving from cache:', event.request.url);
        return cached;
      }
      // Not in cache — try network, then cache it
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Fallback: return index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ── BACKGROUND SYNC (future-proof) ────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-scores') {
    console.log('[SW] Background sync: scores');
  }
});

console.log('[SW] Time Traveler Service Worker loaded v1');
