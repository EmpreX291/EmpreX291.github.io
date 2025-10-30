const CACHE = 'dk-horyshky-v1';
const ASSETS = ['.', './index.html'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isCSV = url.hostname.endsWith('docs.google.com') && url.search.includes('output=csv');
  if (isCSV) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const network = await fetch(event.request);
          cache.put(event.request, network.clone());
          return network;
        } catch (e) {
          const cached = await cache.match(event.request);
          return cached || new Response('', { status: 503, statusText: 'Service Unavailable' });
        }
      })()
    );
  }
});
