// Acest service worker va gestiona cache-ul și va asigura că utilizatorii primesc întotdeauna cea mai recentă versiune a aplicației

/// <reference lib="webworker" />

// Declarăm tipul pentru self în contextul Service Worker
declare const self: ServiceWorkerGlobalScope;

// Versiunea cache-ului - schimbă această valoare pentru a forța actualizarea cache-ului
const CACHE_VERSION = "v1.0.1";
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;

// Resurse care vor fi cache-uite
const CACHED_RESOURCES = ["/", "/index.html", "/manifest.json", "/favicon.ico"];

// Instalarea service worker-ului
self.addEventListener("install", (event: any) => {
  // Forțăm activarea imediată a service worker-ului
  self.skipWaiting();

  // Cache-uim resursele statice
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache files
      return cache.addAll(CACHED_RESOURCES);
    })
  );
});

// Activarea service worker-ului
self.addEventListener("activate", (event: any) => {
  // Preluăm controlul imediat asupra tuturor paginilor
  self.clients.claim();

  // Ștergem cache-urile vechi
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            // Delete old cache
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});

// Interceptăm requesturile
self.addEventListener("fetch", (event: any) => {
  // Ignorăm requesturile către API
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("supabase.co")
  ) {
    return;
  }

  // Pentru requesturile de navigare (HTML), returnăm întotdeauna cea mai recentă versiune de pe server
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/index.html");
      })
    );
    return;
  }

  // Pentru celelalte resurse, folosim strategia "stale-while-revalidate"
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Returnăm versiunea din cache dacă există
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Actualizăm cache-ul cu noua versiune
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((_error) => {
          // Error handling for fetch failure
          // Returnăm versiunea din cache dacă există
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Mesaj pentru a forța actualizarea tuturor clienților
self.addEventListener("message", (event: any) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

export {};
