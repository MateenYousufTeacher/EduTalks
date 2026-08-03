// ============================================================
// SERVICE WORKER – Foundational Math Trainer PWA
// Author: Mateen Yousuf – Teacher – SED, J&K
// Aligned with NEP 2020 | NCF Foundational Stage 2022
// ============================================================

const CACHE_NAME = 'math-trainer-v1.0';

// Files to cache for offline use
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json'
];

// ── INSTALL: Cache all core files ──────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing Math Trainer Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell');
      return cache.addAll(CACHE_FILES);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: Clean up old caches ─────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating Math Trainer Service Worker...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Serve from cache, fallback to network ───────────
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network and cache result
      return fetch(event.request).then(networkResponse => {
        // Only cache successful responses
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback – return cached index.html
        return caches.match('./index.html');
      });
    })
  );
});

// ── BACKGROUND SYNC: Sync progress data when online ───────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-progress') {
    console.log('[SW] Background sync triggered for progress data');
  }
});

console.log('[SW] Math Trainer Service Worker loaded ✓');
