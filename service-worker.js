const CACHE = 'dk-horyshky-v5';
const ASSETS = [
  './',
  './index.v5.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isCSV = url.hostname.endsWith('docs.google.com') && (url.search.includes('output=csv') || url.search.includes('tqx=out:csv'));
  if(isCSV){
    e.respondWith((async()=>{
      const c = await caches.open(CACHE);
      try{
        const net = await fetch(e.request);
        c.put(e.request, net.clone());
        return net;
      }catch{
        const cached = await c.match(e.request);
        return cached || new Response('', {status:503});
      }
    })());
    return;
  }
  if(ASSETS.some(a => url.pathname.endsWith(a.replace('./','/')))){
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});