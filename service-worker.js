const CACHE_NAME = 'taskbox-v2';
const CACHE_FILES = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/home.js',
  './js/box-detail.js',
  './js/lucky-wheel.js',
  './js/ai-extract.js',
  './js/settings.js',
  './js/small-world.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CACHE_FILES)));
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);
  const isSound = /\/assets\/sounds\/.+\.(mp3|wav|ogg)$/i.test(url.pathname);

  if (isSound) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          return res;
        });
      })
    );
    return;
  }

  e.respondWith(caches.match(request).then((r) => r || fetch(request)));
});
