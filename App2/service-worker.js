// Capital Catch – Service Worker v1.0
// Handles offline caching so the app works without internet

const CACHE_NAME = 'capital-catch-v1';

// Files to cache for offline use
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './author.jpg'
];

// ── INSTALL: Cache all core files ──
self.addEventListener('install', event => {
  console.log('[SW] Installing Capital Catch Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app files...');
        // Cache files one by one to avoid failure if author.jpg is missing
        return Promise.allSettled(
          CACHE_FILES.map(file =>
            cache.add(file).catch(err => console.warn('[SW] Could not cache:', file, err))
          )
        );
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
  );
});

// ── ACTIVATE: Clean old caches ──
self.addEventListener('activate', event => {
  console.log('[SW] Activating Capital Catch Service Worker...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ── FETCH: Serve from cache, fall back to network ──
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (e.g. Google Fonts)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network and cache it
        return fetch(event.request)
          .then(networkResponse => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
              return networkResponse;
            }

            // Cache the new resource
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));

            return networkResponse;
          })
          .catch(() => {
            // Offline fallback — return cached index.html for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// ── MESSAGE: Handle manual cache updates ──
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
