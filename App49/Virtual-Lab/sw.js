const CACHE = 'vpl-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/sims/motion.js',
  './js/sims/newton.js',
  './js/sims/friction.js',
  './js/sims/gravity.js',
  './js/sims/energy.js',
  './js/sims/pressure.js',
  './js/sims/heat.js',
  './js/sims/optics.js',
  './js/sims/circuit.js',
  './js/sims/magnetism.js',
  './images/developer.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (e)=>{
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(res=>{
        const clone = res.clone();
        caches.open(CACHE).then(cache=>cache.put(e.request, clone));
        return res;
      }).catch(()=>cached);
    })
  );
});
