// Service Worker for Exam Prep Platform
const CACHE_NAME = 'exam-prep-v5';
const urlsToCache = [
  '/favicon.ico',
  '/logo-dark.png',
  '/logo-light.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  clients.claim();
});

self.addEventListener('fetch', event => {
  // For the homepage, always fetch fresh data to ensure correct session state
  if (event.request.url.endsWith('/') || event.request.url.includes('localhost:5173/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fails, fall back to cache
          return caches.match(event.request);
        })
    );
  } else {
    // For other resources (images, CSS, etc.), use Cache First strategy for performance
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
}); 