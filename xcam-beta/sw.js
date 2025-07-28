// sw.js

const CACHE_NAME = 'xcam-cache-v1';
// Lista de arquivos que serão salvos em cache para funcionamento offline.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  // Adicione aqui outros arquivos importantes que você queira que funcionem offline
  // Ex: '/styles/main.css', '/scripts/main.js'
  // No seu caso, o CSS e JS estão no index.html, então não precisa adicionar.
  // A logo do seu header e footer também vêm de um link externo (github),
  // então o cache delas é mais complexo e pode ser feito depois.
];

// Evento de Instalação: Salva os arquivos em cache.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de Fetch: Intercepta as requisições.
// Se o recurso estiver no cache, ele o entrega a partir do cache.
// Se não, ele busca na rede.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna a resposta do cache
        if (response) {
          return response;
        }
        // Senão, faz a requisição à rede
        return fetch(event.request);
      })
  );
});
