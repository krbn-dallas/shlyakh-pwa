/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: (string | { url: string; revision: string | null })[];
};

const YEAR = 365 * 24 * 60 * 60;
const MONTH = 30 * 24 * 60 * 60;
const WEEK = 7 * 24 * 60 * 60;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// App-shell fallback for navigations — but never for data, media or the API,
// or a failed request would answer HTML and break the caller.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), {
  denylist: [/^\/data\//, /^\/fonts\//, /^\/media\//, /^\/api\//, /^\/\.netlify\//, /^\/assets\//],
}));

const cacheFirst = (cacheName: string, maxEntries: number, maxAgeSeconds: number) =>
  new CacheFirst({
    cacheName,
    plugins: [
      new ExpirationPlugin({ maxEntries, maxAgeSeconds, purgeOnQuotaError: true }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  });

const networkFirst = (
  cacheName: string, networkTimeoutSeconds: number, maxEntries: number, maxAgeSeconds: number,
) =>
  new NetworkFirst({
    cacheName,
    networkTimeoutSeconds,
    plugins: [
      new ExpirationPlugin({ maxEntries, maxAgeSeconds }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  });

registerRoute(/\/fonts\/.*\.woff2$/i, cacheFirst('app-fonts', 40, YEAR));
registerRoute(/\/media\/.*\.(mp4|webm)$/i, cacheFirst('app-media', 6, YEAR));
registerRoute(/^https:\/\/(?:[a-c]\.)?tile\.openstreetmap\.org\/.*/i, cacheFirst('osm-tiles', 900, MONTH));
// Diary photos, so pages you have already opened still show their pictures offline.
registerRoute(/^https:\/\/res\.cloudinary\.com\/.*/i, cacheFirst('diary-media', 300, YEAR));
registerRoute(/^https:\/\/flagcdn\.com\/.*/i, cacheFirst('flags', 40, YEAR));

registerRoute(/^https:\/\/routing\.openstreetmap\.de\/.*/i, networkFirst('osrm-routes', 6, 80, WEEK));
registerRoute(/^https:\/\/nominatim\.openstreetmap\.org\/.*/i, networkFirst('geocode', 8, 60, MONTH));
registerRoute(/^https:\/\/api\.open-meteo\.com\/.*/i, networkFirst('weather', 5, 20, 60 * 60));
registerRoute(/^https:\/\/open\.er-api\.com\/.*/i, networkFirst('rates', 5, 4, 24 * 60 * 60));
registerRoute(/^https:\/\/overpass-api\.de\/.*/i, networkFirst('overpass', 12, 40, WEEK));

registerRoute(/\/data\/.*\.json$/i, new StaleWhileRevalidate({
  cacheName: 'app-data',
  plugins: [new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: MONTH })],
}));

// ---- push ------------------------------------------------------------------

interface PushPayload { title: string; body: string; url?: string; tag?: string }

self.addEventListener('push', (event) => {
  let data: PushPayload = { title: 'ШЛЯХ', body: '' };
  try {
    if (event.data) data = { ...data, ...(event.data.json() as PushPayload) };
  } catch {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag ?? 'shlyakh',
    data: { url: data.url ?? '/diary' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data as { url?: string } | undefined)?.url ?? '/diary';

  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Reuse an open window rather than stacking new ones.
    for (const c of clients) {
      await c.focus();
      if ('navigate' in c) await c.navigate(target);
      return;
    }
    await self.clients.openWindow(target);
  })());
});

self.addEventListener('message', (event) => {
  if ((event.data as { type?: string } | undefined)?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});
