// ============================================================
// SERVICE WORKER — Literacy Booster PWA
// Author: Mateen Yousuf | Teacher – SED J&K
// NEP 2020 & NCF Aligned Offline App
// ============================================================

const CACHE_NAME = 'literacy-booster-v1';
const CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './author.jpg'
];

// ---- INSTALL: Cache all critical assets ----
self.addEventListener('install', event => {
  console.log('[SW] Installing Literacy Booster cache...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_ASSETS).catch(err => {
        // Cache what we can — don't fail install if author.jpg missing
        console.log('[SW] Cache error (non-fatal):', err);
        return cache.addAll(['./index.html', './manifest.json']);
      });
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// ---- ACTIVATE: Clean old caches ----
self.addEventListener('activate', event => {
  console.log('[SW] Activating new service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all open clients
  return self.clients.claim();
});

// ---- FETCH: Cache-first strategy for offline use ----
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached version if available (works fully offline)
      if (cachedResponse) {
        return cachedResponse;
      }

      // Try network if not cached
      return fetch(event.request).then(networkResponse => {
        // Cache new resources dynamically
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Full offline fallback — return cached index.html
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
        // Return empty response for other failed requests
        return new Response('Offline – content not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});

// ---- SYNC: Background sync for notes (future) ----
self.addEventListener('sync', event => {
  if (event.tag === 'sync-notes') {
    console.log('[SW] Background sync triggered');
    // Future: sync notes to server
  }
});

// ---- PUSH: Push notifications (future) ----
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Literacy Booster', body: 'Time to practice reading!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './author.jpg',
      badge: './author.jpg',
      vibrate: [200, 100, 200]
    })
  );
});
