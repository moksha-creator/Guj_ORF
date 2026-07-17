const CACHE_NAME = 'miko-reading-check-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/data.js',
    '/storage.js',
    '/assets/miko.png',
    '/assets/story_1.png',
    '/assets/story_2.png',
    '/assets/story_3.png',
    '/assets/story_4.png',
    '/assets/sfx-success.mp3',
    '/assets/sfx-pop.mp3',
    '/assets/sfx-chime.mp3'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker.
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); // Delete old caches
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Network first, fallback to cache
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
