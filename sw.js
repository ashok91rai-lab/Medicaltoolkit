/* ============================================
   MedicalToolKit — Service Worker v2.0
   PWA: Offline Support + Smart Caching
   ============================================ */

const APP_VERSION  = 'v2.0';
const CACHE_STATIC = `mtk-static-${APP_VERSION}`;
const CACHE_PAGES  = `mtk-pages-${APP_VERSION}`;
const CACHE_IMAGES = `mtk-images-${APP_VERSION}`;

// Critical files to cache on install (app shell)
const PRECACHE_FILES = [
  '/',
  '/index.html',
  '/dist/css/style.min.css',
  '/dist/css/responsive.min.css',
  '/dist/css/calculator.min.css',
  '/dist/css/animations.min.css',
  '/dist/css/blog.min.css',
  '/dist/js/main.min.js',
  '/dist/js/animations.min.js',
  '/dist/js/blog.min.js',
  '/dist/js/analytics.min.js',
  '/images/favicon.svg',
  '/images/logo.svg',
  '/offline.html',
];

// ─────────────────────────────────────────
// INSTALL — Cache app shell
// ─────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      return cache.addAll(PRECACHE_FILES).catch(err => {
        console.warn('[SW] Some precache files failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─────────────────────────────────────────
// ACTIVATE — Clean old caches
// ─────────────────────────────────────────
self.addEventListener('activate', (e) => {
  const VALID = [CACHE_STATIC, CACHE_PAGES, CACHE_IMAGES];
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !VALID.includes(k)).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────
// FETCH — Smart caching strategy
// ─────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin, analytics, ads
  if (request.method !== 'GET') return;
  if (!url.origin.includes('medicaltoolkit')) return;
  if (url.pathname.includes('analytics') || url.pathname.includes('gtag')) return;

  // Strategy 1: Static assets (CSS, JS, fonts) — Cache First
  if (
    url.pathname.startsWith('/dist/') ||
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/js/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.svg')
  ) {
    e.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Strategy 2: Images — Cache First with long TTL
  if (url.pathname.startsWith('/images/') ||
      url.pathname.match(/\.(png|jpg|jpeg|webp|gif)$/)) {
    e.respondWith(cacheFirst(request, CACHE_IMAGES));
    return;
  }

  // Strategy 3: HTML pages — Network First, fallback to cache
  if (request.headers.get('accept')?.includes('text/html') ||
      url.pathname.endsWith('.html') || url.pathname === '/') {
    e.respondWith(networkFirst(request, CACHE_PAGES));
    return;
  }
});

// ─────────────────────────────────────────
// CACHE STRATEGIES
// ─────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Show offline page for HTML requests
    const offline = await caches.match('/offline.html');
    return offline || new Response('<h1>Offline</h1>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// ─────────────────────────────────────────
// PUSH NOTIFICATIONS (Monetag compatible)
// ─────────────────────────────────────────
self.addEventListener('push', (e) => {
  if (!e.data) return;
  try {
    const data = e.data.json();
    e.waitUntil(
      self.registration.showNotification(data.title || 'MedicalToolKit', {
        body:  data.body  || 'Check out our free health calculators',
        icon:  data.icon  || '/images/favicon.svg',
        badge: data.badge || '/images/favicon.svg',
        data:  { url: data.url || '/' },
      })
    );
  } catch {}
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(clients.openWindow(url));
});
