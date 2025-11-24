const CACHE_NAME = "ssculpt-cache-v4";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install: cache everything we need for offline use
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch: network first for JS/CSS (so event listeners always bind)
// fallback to cache offline
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only GET requests
  if (req.method !== "GET") return;

  // Always try network first for JS or CSS
  if (req.url.endsWith(".js") || req.url.endsWith(".css")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Save latest version in cache
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req)) // offline fallback
    );
    return;
  }

  // For all other requests: cache first, fallback to network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).catch(() => {
        // Offline navigation fallback → load index.html
        if (req.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
