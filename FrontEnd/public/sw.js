self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Mantém todas as requisições na rede. Dados empresariais e sessões não são
// armazenados no dispositivo pelo service worker.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
