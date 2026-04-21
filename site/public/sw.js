/**
 * WebOS Service Worker for Next.js
 * 简化版本，用于基本的离线支持
 */

const CACHE_NAME = 'webos-cache-v1';
const VERSION = '0.0.1-alpha';

// 需要缓存的静态资源模式
const CACHE_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.svg$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.webp$/,
  /\.ico$/,
  /\/locales\/.*\.json$/,
];

// 安装事件
self.addEventListener('install', () => {
  console.log('[SW] Installing service worker version:', VERSION);
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', VERSION);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('webos-cache') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 请求拦截 - 网络优先策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源 GET 请求
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  // 检查是否需要缓存
  const shouldCache = CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname));

  if (!shouldCache) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// 消息处理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(cacheNames.map((name) => caches.delete(name)));
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
    );
  }
});

console.log('[SW] Service Worker loaded, version:', VERSION);
