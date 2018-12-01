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


//离线思路：
//监听fetch事件，通过 caches 全局对象match请求，如果有缓存就返回缓存文件，没有就复制一个浏览器请求，然后向服务器fetch
//拿到response后复制一个，一个用来更新缓存，一个用来返回给浏览器
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
                            //cache.put方法将一个键值对添加至缓存对象中，此处用于缓存新文件
                            cache.put(event.request, responseToCache);
                        });
                    // 将正常的response返回给浏览器进行页面渲染
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


// 服务工作线程的更新原则：
// 1.浏览器会自动对比新旧sw文件，如果有区别就算一次更新
// 2.新服务工作线程将会启动，并触发 install 事件。
// 3.此时，旧服务工作线程仍控制着当前页面， 因此新服务工作线程将进入 waiting 状态。
// 4.当网站上当前打开的页面关闭时， 旧服务工作线程将会被终止， 新服务工作线程将会取得控制权。
// 5.新服务工作线程取得控制权后， 将会触发其 activate 事件。


//当 serviceWorker 线程更新时，删除不再需要的缓存文件
//方式：遍历服务工作线程中的所有缓存，并删除未在当前缓存列表中的文件
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