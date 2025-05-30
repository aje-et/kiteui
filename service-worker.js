// Service Worker for Tink Algo Trading - Version 1.0.0
const CACHE_NAME = 'tink-app-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/calculation.html',
  '/manifest.json',
  '/trade.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip caching for external API requests
  if (!url.origin.includes(self.location.origin)) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Skip caching for JavaScript files and images
  const isImage = url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
  const isJavaScript = url.pathname.match(/\.(js)$/i);
  
  if (isImage || isJavaScript) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For HTML files, use a network-first strategy
  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If we got a valid response, clone it and put it in the cache
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network request fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For other assets, use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make network request and cache the response
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Open cache and store the new response
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});
