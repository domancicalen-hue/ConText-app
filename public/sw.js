const CACHE = 'context-v18-user-logo-menu-20260615';
const STATIC = [
  '/',
  '/index.html',
  '/manifest.json',
  '/crediti.html',
  '/privacy.html',
  '/termini.html',
  '/contatti.html',
  '/attiva.html',
  '/pagamento.html',
  '/blog/',
  '/blog/index.html',
  '/blog/rispondere-messaggio-difficile-senza-sembrare-aggressivo.html',
  '/blog/scrivere-risposta-professionale-cliente-arrabbiato.html',
  '/icons/favicon-64.png',
  '/icons/context-logo-user-transparent.png',
  '/icons/context-app-icon-20260611-clean.png',
  '/icons/context-ui-icon-192-20260611-clean.png',
  '/icons/context-ui-icon-512-20260611-clean.png',
  '/social/logo-square-512.png',
  '/social/logo-tiktok-profile-1080.png',
  '/social/tiktok-cover-1920x1080.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  if (url.hostname === 'api.anthropic.com') return;
  if (url.pathname.startsWith('/api/')) return;
  if (e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached && !url.pathname.startsWith('/icons/') && !url.pathname.startsWith('/social/')) return cached;
      return fetch(e.request).then(response => {
        if (url.origin === self.location.origin && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
        }
        return response;
      });
    })
  );
});
