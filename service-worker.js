// Coeurnoh Pro — Service Worker (désactivé)
// Pendant cette phase de développement actif, on préfère garantir que
// chaque visite charge toujours la dernière version en ligne plutôt que
// de risquer de servir une version mise en cache et périmée. Ce fichier
// supprime donc tous les caches existants et se désinstalle lui-même.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});

self.addEventListener('fetch', () => {
  // Aucune interception : tout passe directement par le réseau normal.
});
