/* ==========================================================================
   Virtual Simulations — sw.js
   Offline-first service worker. Precaches the entire app shell + all
   simulation modules + fonts + icons so the app works with zero internet
   after the first successful load. Cache-first for app assets, with a
   background revalidation update.
   ========================================================================== */
const CACHE_NAME = "vsl-cache-v1";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/utils.js",
  "./js/harness.js",
  "./js/sims/mesopotamia.js",
  "./js/sims/ancientchina.js",
  "./js/sims/athens.js",
  "./js/sims/romeengineering.js",
  "./js/sims/renaissance.js",
  "./js/sims/silkroad.js",
  "./js/sims/scientificrevolution.js",
  "./js/sims/exploration.js",
  "./js/sims/coldwar.js",
  "./js/sims/historydetective.js",
  "./assets/founder.jpg",
  "./assets/fonts/poppins-latin-400-normal.woff2",
  "./assets/fonts/poppins-latin-500-normal.woff2",
  "./assets/fonts/poppins-latin-600-normal.woff2",
  "./assets/fonts/poppins-latin-700-normal.woff2",
  "./assets/fonts/nunito-sans-latin-400-normal.woff2",
  "./assets/fonts/nunito-sans-latin-600-normal.woff2",
  "./assets/fonts/nunito-sans-latin-700-normal.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cached || caches.match("./index.html"));
      return cached || fetchPromise;
    })
  );
});
