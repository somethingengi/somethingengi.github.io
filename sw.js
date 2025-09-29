// bump this when you deploy
const CACHE = 'grid-designer-v7';

// Explicitly list what you need offline
const ASSETS = [
  '/',                    // root
  '/index.html',
  '/manifest.webmanifest',
  '/sw.js',               // cache the SW file too
  '/icon-192.png',
  '/icon-512.png'
  // add more here if you split code into separate files later
];

// Install: precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // activate immediately
});

// Activate: clean old caches, take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//  - Network-first for HTML (so new index.html is picked up quickly)
//  - Cache-first fallback for everything else
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});

