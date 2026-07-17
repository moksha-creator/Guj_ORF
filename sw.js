const CACHE_NAME = 'miko-reading-check-v1';
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
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
