// Completely disable service worker in development
if (self.location.hostname === 'localhost' || 
    self.location.hostname === '127.0.0.1' ||
    self.location.port === '4321' ||
    self.location.port === '4322' ||
    self.location.port === '4323' ||
    self.location.port === '4324') {
  console.log('Service Worker: Disabled in development mode');
  // Stop all event listeners
  self.removeEventListener('install', null);
  self.removeEventListener('fetch', null);
  self.removeEventListener('activate', null);
  return;
}

const CACHE_NAME = 'fitness-tracker-v1';

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

  // Don't cache CSS files to allow theme changes
  if (event.request.url.includes('.css') || 
      event.request.url.includes('_astro') ||
      event.request.url.includes('index.css')) {
    // Always fetch CSS files fresh from network
    event.respondWith(fetch(event.request));
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
