// Coeurnoh Pro — Service Worker
// Mise en cache de la coquille de l'application pour un fonctionnement hors-ligne.
// Les appels vers les API de taux de change restent toujours en ligne (réseau direct,
// jamais interceptés ici) pour ne jamais servir un taux périmé silencieusement.

const CACHE_NAME = 'coeurnoh-pro-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {/* installation partielle tolérée */})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ne jamais intercepter les requêtes vers des domaines externes
  // (taux de change, polices Google) — toujours réseau direct.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Pour la coquille de l'app : cache d'abord, réseau en repli, et on
  // rafraîchit le cache en arrière-plan si une nouvelle version est dispo.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
