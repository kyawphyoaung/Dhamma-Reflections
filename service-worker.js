const CACHE_NAME = 'dhamma-reflections-cache-v1'; // Cache version ကို မြှင့်ထားပါ
const urlsToCache = [
    './', // Cache the root (index.html)
    './index.html',
    './buddha-bg.mp4', // သင်၏ video file
    './buddha.mp3',   // သင်၏ audio file
    './lotus.svg',    // သင်၏ lotus icon
    './play.svg',     // သင်၏ play icon (အကယ်၍ music control အတွက် သုံးပါက)
    './icon-128x128.png', // App Icons များ
    './icon-512x512.png', // App Icons များ
    'https://cdn.tailwindcss.com', // Tailwind CSS CDN
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap', // Google Fonts CSS
    // Google Fonts ၏ font file များ (အသုံးပြုသည့် font weight ပေါ်မူတည်၍ ထပ်ထည့်ရန်လိုနိုင်သည်)
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMwM.woff2'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Install event triggered. Caching assets...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache)
                    .then(() => console.log('All assets cached successfully.'))
                    .catch((error) => console.error('Failed to cache all assets:', error));
            })
            .catch((error) => console.error('Failed to open cache during install:', error))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                // No cache hit - fetch from network
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and can only be consumed once. We must clone it so that
                        // we can consume one in the cache and one in the browser.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
            .catch((error) => {
                console.error('Service Worker: Fetch failed for:', event.request.url, error);
                // You can return a fallback page here for offline
                // For example: return caches.match('/offline.html');
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate event triggered. Cleaning old caches...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Delete old caches
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
