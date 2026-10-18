const CACHE = 'battlepoints-v5';
const ROOT = new URL('./', self.location.href);
const ASSETS = ['./','./index.html','./styles.css','./app.js','./journey.js','./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(file=>new URL(file,ROOT).href))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('battlepoints-')&&key!==CACHE).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch',event => {
  if(event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if(response.ok) {const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}
    return response;
  }).catch(()=>caches.match(event.request).then(match=>match||((event.request.mode==='navigate')?caches.match(new URL('./index.html',ROOT).href):Response.error()))));
});