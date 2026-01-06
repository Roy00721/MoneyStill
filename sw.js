// Service Worker for MoneyStill PWA

const CACHE_NAME = 'money-still-v3.0';  // 更新版本號！

const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/src/app/app.js',
    '/src/app/firebase-config.js',
    '/res/icon.svg'
];

// Install event - 強制跳過等待階段
self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    self.skipWaiting();  // 立即啟用新版本

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - 清理舊快取並接管所有客戶端
self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    event.waitUntil(
        Promise.all([
            // 清理舊快取
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // 接管所有客戶端（立即控制所有頁面）
            self.clients.claim()
        ])
    );
});

// Fetch event - 網路優先策略
self.addEventListener('fetch', event => {
    // 只處理 GET 請求（Cache API 不支援 POST 等請求）
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // 網路請求成功且狀態為 200，更新快取
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // 網路請求失敗，回退到快取
                return caches.match(event.request);
            })
    );
});
