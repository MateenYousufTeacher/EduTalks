/**
 * Foundational Numeracy Mastery Lab — Service Worker
 * Developed by Mateen Yousuf, School Education Department Kashmir
 * Strategy: Cache-first for static assets, network-first for others
 */

const CACHE_NAME = 'fnml-v1.0.0';
const OFFLINE_URL = 'index.html';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './author.jpg',
];

// ===== INSTALL — pre-cache all critical assets =====
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Foundational Numeracy Mastery Lab v1.0.0');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE — clean old caches =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ===== FETCH — cache-first strategy =====
self.addEventListener('fetch', (event) => {
  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version, also fetch updated version in background
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {});
        return cachedResponse;
      }

      // Not in cache — fetch from network and cache for next time
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        // If network fails and no cache, return offline page
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});

// ===== BACKGROUND SYNC placeholder =====
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
});

// ===== PUSH NOTIFICATIONS placeholder =====
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
});
