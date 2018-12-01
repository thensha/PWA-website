const VERSION = 'v1';

//安装后立刻激活并执行serviceWorker
self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
})

self.addEventListener('activated', event => {
    event.waitUntil(self.clients.claim())
})

//安装前先缓存文件
self.addEventListener('install', event => {
    event.waitUntil(
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
self.addEventListener('activate', event => {
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


self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            if (response) {
                return response;
            }

            // 因为 event.request 流已经在 caches.match 中使用过一次，那么该流是无法再次使用的，重新复制一个
            var fetchRequest = event.request.clone();

            // fetch 方法获取一个请求作为参数，然后发送请求
            return fetch(fetchRequest).then(
                function (response) {
                    // 检查是否成功
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // 如果成功，该 response 一是要拿给浏览器渲染，二是要进行缓存
                    // 由于 caches.put 使用的是文件的响应流，一旦使用，那么返回的 response 就无法访问造成失败，所以，这里需要复制一份
                    var responseToCache = response.clone();

                    caches.open(VERSION)
                        .then(function (cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            ).catch(() => {
                if (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});