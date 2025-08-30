const CACHE_NAME = 'fitness-tracker-v1';

// Don't run service worker in development
if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
  console.log('Service Worker: Skipping in development mode');
  return;
}

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        // Only cache static assets, not dev server files
        return cache.addAll([
          '/',
          '/manifest.json',
          '/favicon.svg'
        ]);
      })
      .catch((error) => {
        console.log('Service Worker: Cache error:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip Vite dev server files
  if (event.request.url.includes('@vite') || 
      event.request.url.includes('@id') ||
      event.request.url.includes('?astro')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, just fetch from network
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
