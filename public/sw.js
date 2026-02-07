const CACHE_NAME = 'one-percent-better-v4';
const OFFLINE_URL = '/offline';

const STATIC_ASSETS = [
    '/landing',
    '/demo',
    '/privacy',
    '/terms',
    '/offline',
    '/quests',
    '/login',
    '/manifest.webmanifest',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/apple-touch-icon.png',
];

const SWR_PATTERNS = [
    /\/_next\/static\//,
    /\/fonts\//,
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const networkPromise = fetch(request).then((response) => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => null);

    return cachedResponse || networkPromise;
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
        }
        return new Response('Offline', { status: 503 });
    }
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;

    if (url.origin !== location.origin) return;

    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth')) {
        return;
    }

    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/) ||
        url.pathname.startsWith('/icons/') ||
        url.pathname.startsWith('/_next/static/') ||
        SWR_PATTERNS.some(pattern => pattern.test(url.pathname))
    ) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    if (
        url.pathname === '/landing' ||
        url.pathname === '/demo' ||
        url.pathname === '/quests' ||
        url.pathname === '/profile' ||
        url.pathname === '/tracker' ||
        url.pathname === '/battle'
    ) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    event.respondWith(networkFirst(request));
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-checkins') {
    }
});
