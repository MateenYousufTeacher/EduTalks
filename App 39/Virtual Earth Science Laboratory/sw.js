const CACHE = 'earth-lab-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/utils.js',
  './js/app.js',
  './js/simulations/rockcycle.js',
  './js/simulations/soil.js',
  './js/simulations/weathering.js',
  './js/simulations/erosion.js',
  './js/simulations/fossil.js',
  './js/simulations/earthquake.js',
  './js/simulations/volcano.js',
  './js/simulations/plates.js',
  './js/simulations/minerals.js',
  './js/simulations/timeline.js',
  './images/developer.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (e)=>{
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(resp=>{
        const clone = resp.clone();
        caches.open(CACHE).then(cache=> cache.put(e.request, clone)).catch(()=>{});
        return resp;
      }).catch(()=> cached);
    })
  );
});
