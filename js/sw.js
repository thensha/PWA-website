const cacheName = 'offline-cache';
const offlineUrl = 'offline-page.html';

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
        caches.open(cacheName)
        .then(cache => cache.addAll([
            './background.js',
            './main.js',
            '../index.html',
            '../offline-page.html',
            '../img/img.jpg',
            offlineUrl
        ]))
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
                    return caches.match(offlineUrl);
                }
            });
        })
    );

});