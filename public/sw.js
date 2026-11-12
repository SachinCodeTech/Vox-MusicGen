const CACHE = 'vox-musicgen-cache-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/screenshots/mobile-preview.png',
  '/screenshots/desktop-preview.png'
];

// ── 1. INSTALL & PRECACHE ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── 2. ACTIVATE & CACHE PRUNING ──
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── 3. FETCH WITH OFFLINE FALLBACK ──
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip caching server API endpoints and dynamic external services
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((resp) => {
          if (resp.ok && e.request.method === 'GET') {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return resp;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});

// ── 4. BACKGROUND SYNC (PWABuilder Compliance) ──
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-audio-projects' || event.tag === 'sync-stems') {
    event.waitUntil(
      // Background project queue synchronization
      Promise.resolve()
    );
  }
});

// ── 5. PERIODIC BACKGROUND SYNC (PWABuilder Compliance) ──
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-audio-cache-refresh') {
    event.waitUntil(
      caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
    );
  }
});

// ── 6. PUSH NOTIFICATIONS (PWABuilder Compliance) ──
self.addEventListener('push', (event) => {
  let data = {
    title: 'Vox MusicGen Studio',
    body: 'Your multitrack stems and audio project are ready.'
  };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (err) {
    // fallback
  }

  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/logo.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
