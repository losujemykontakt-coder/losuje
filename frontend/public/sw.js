const CACHE_NAME = 'losuje-generator-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Cache tylko podstawowe pliki, resztę pobierz z sieci
        return cache.addAll(urlsToCache).catch(error => {
          console.log('Cache addAll failed:', error);
          // Kontynuuj nawet jeśli cache się nie udał
          return Promise.resolve();
        });
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Sprawdź czy to żądanie HTML
  if (event.request.headers.get('accept').includes('text/html')) {
    // Dla HTML zawsze pobierz z sieci, nie używaj cache
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Sprawdź czy odpowiedź jest OK
          if (response.status === 200) {
            return response;
          }
          // Jeśli nie, spróbuj z cache
          return caches.match(event.request);
        })
        .catch(error => {
          console.log('Fetch failed, trying cache:', error);
          return caches.match(event.request);
        })
    );
  } else {
    // Dla innych zasobów używaj cache first
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached version or fetch from network
          return response || fetch(event.request).catch(error => {
            console.log('Fetch failed:', error);
            // Jeśli fetch się nie udał, zwróć pustą odpowiedź
            return new Response('Network error', { status: 503 });
          });
        })
    );
  }
});

// Activate event
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
});
