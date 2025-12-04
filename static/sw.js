self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('mynutriguide-v2').then((cache) => {
      return cache.addAll([
        '/',
        '/static/css/dashboard.css',
        '/static/css/scan.css',
        '/static/css/loader.css',
        '/static/js/camera.js',
        '/static/js/loader.js',
        '/static/js/pwa-install.js',
        '/static/logo.png',
        '/static/logo.svg'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
