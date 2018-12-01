const VERSION = 'v2';

//安装后立刻激活并执行serviceWorker
self.addEventListener('install', ev => {
    ev.waitUntil(self.skipWaiting());
})

self.addEventListener('activated', ev => {
    ev.waitUntil(self.clients.claim())
})

//安装前先缓存文件
self.addEventListener('install', ev => {
    ev.waitUntil(
        caches.open(VERSION)
        .then(cache => cache.addAll([
            './js/background.js',
            './js/main.js',
            './index.html',
            './img/img.jpg'
        ]))
    );
});


// 缓存更新
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    // 如果当前版本和缓存版本不一致
                    if (cacheName !== VERSION) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


// 捕获请求并返回缓存数据
self.addEventListener('fetch', function (event) {

    event.respondWith(
        caches.match(event.request)
        .catch(function () {
            return fetch(event.request);
        })
        .then(function (response) {
            var responseToCache = response.clone();
            caches.open(VERSION)
                .then(function (cache) {
                    cache.put(event.request, responseToCache);
                });
            return response.clone();
        })
        .catch(function () {
            return caches.match('./index.html');
        }));
});