// ═══════════════════════════════════════════════════════
//  Synonym Snap – Service Worker
//  Offline-first PWA caching strategy
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'synonym-snap-v1.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './author.jpg'
];

// ── INSTALL: Cache all assets ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS.filter(a => a !== './author.jpg')).then(() => {
        // Try to cache author.jpg but don't fail if missing
        return cache.add('./author.jpg').catch(() => {});
      });
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: Clean old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── FETCH: Offline-first strategy ──
self.addEventListener('fetch', (event) => {
  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache; update in background
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);
        return cachedResponse;
      }

      // Not in cache: fetch from network and cache it
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Offline fallback – serve index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ── BACKGROUND SYNC (optional) ──
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
  }
});

// ── PUSH NOTIFICATIONS (optional placeholder) ──
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time to practice synonyms! 📚',
    icon: './favicon.ico',
    badge: './favicon.ico',
    tag: 'synonym-snap-notification',
    renotify: false
  };
  event.waitUntil(
    self.registration.showNotification('Synonym Snap', options)
  );
});
