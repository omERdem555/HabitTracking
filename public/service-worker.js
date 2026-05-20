const CACHE_VERSION = 'v6';
const RUNTIME_CACHE = `habit-tracker-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon72.png',
  '/icon96.png',
  '/icon192.png',
  '/icon512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(RUNTIME_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('habit-tracker-runtime-') && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => caches.match('/'))
      );
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList[0];
        client.focus();
        try {
          client.postMessage({ type: 'notificationAction', action, data });
        } catch (e) {
          // ignore
        }
        return;
      }
      return self.clients.openWindow('/').then((win) => {
        if (!win) return;
        try {
          win.postMessage({ type: 'notificationAction', action, data });
        } catch (e) {
          // ignore
        }
      });
    }),
  );
});

self.addEventListener('notificationclose', (event) => {
  // could log analytics or cleanup if needed
});
