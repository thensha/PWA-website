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


self.addEventListener('fetch', function (event) {

    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            if (response) {
                return response;
            }
            var fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(
                function (response) {
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    var responseToCache = response.clone();
                    caches.open(cacheName)
                        .then(function (cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            ).catch(error => {
                if (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );

});