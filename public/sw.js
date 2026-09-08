// sw.js — minimaler Service Worker: cached nur die statische App-Shell
// (Icons, Manifest). Seiteninhalte kommen bewusst immer live vom Server,
// da die App auf Server Actions + echte DB-Daten pro Request angewiesen ist.

const CACHE_NAME = "jgd-shell-v1";
const SHELL_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Nur GET-Requests auf die Shell-Assets aus dem Cache bedienen.
// Alles andere (Seiten, Server Actions, API) geht normal ans Netzwerk —
// wichtig, damit Anwesenheit/Voting/Anliegen nie stale Daten zeigen.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
