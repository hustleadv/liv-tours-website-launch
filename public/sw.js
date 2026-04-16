// Service Worker for LIV Transfers - Push Notifications & Offline Support

const CACHE_NAME = 'liv-transfers-v4';
const OFFLINE_URL = '/trip';

// Assets to cache for offline access (keep minimal to avoid stale bundles)
const STATIC_ASSETS = [
  '/',
  '/trip',
  '/index.html',
  '/favicon.ico',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (url.origin !== location.origin) return;

  // Skip API and Supabase requests
  if (url.pathname.includes('/functions/') || 
      url.pathname.includes('/rest/') ||
      url.pathname.includes('/auth/')) return;

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version or offline page
          return caches.match(request).then((cached) => {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // For static assets (JS, CSS, images)
  // IMPORTANT: Use network-first for JS/CSS to avoid serving stale React bundles (can cause "Invalid hook call")
  const isScriptOrStyle = request.destination === 'script' || request.destination === 'style';
  const isViteChunk = url.pathname.includes('/assets/') || url.pathname.includes('/node_modules/') || url.searchParams.has('v');

  if (isScriptOrStyle || isViteChunk) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Default: cache-first (OK for images, etc.)
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let data = {
    title: 'LIV Transfers',
    body: 'Your pickup is coming up soon!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'pickup-reminder'
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'pickup-reminder',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Trip' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open or focus the Trip Hub
  const urlToOpen = event.notification.data?.url || '/trip';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes('/trip') && 'focus' in client) {
            return client.focus();
          }
        }
        // Open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for scheduled notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-pickup-reminders') {
    event.waitUntil(checkAndScheduleReminders());
  }
});

async function checkAndScheduleReminders() {
  // This would typically fetch from IndexedDB or the server
  // For now, it's handled client-side
  console.log('Checking for pickup reminders...');
}
