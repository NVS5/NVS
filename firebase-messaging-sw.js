// ==========================================
// 1. استدعاء مكتبات Firebase الخاصة بالـ Service Worker
// ==========================================
importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-messaging-compat.js');

// ==========================================
// 2. تهيئة Firebase داخل الـ Service Worker
// ==========================================
firebase.initializeApp({
  apiKey: "AIzaSyDy18HXJDYsLqlgCcbnuBBa1a_av9-FyoE",
  authDomain: "smarthome-ad84f.firebaseapp.com",
  databaseURL: "https://smarthome-ad84f-default-rtdb.firebaseio.com",
  projectId: "smarthome-ad84f",
  storageBucket: "smarthome-ad84f.appspot.com",
  messagingSenderId: "849228056680",
  appId: "1:849228056680:web:09fa91eaca63dc148953dd"
});

const messaging = firebase.messaging();

// ==========================================
// 3. استقبال الإشعارات عندما يكون التطبيق/المتصفح مغلقاً
// ==========================================
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  const title = payload.notification?.title || "تنبيه Nova Smart";
  const options = {
    body: payload.notification?.body || "يوجد تحديث جديد في النظام",
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(title, options);
});

// ==========================================
// 4. ميزات الـ PWA (Caching & Offline Support)
// ==========================================
const CACHE_NAME = 'nova-smart-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cairo:wght@600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// تثبيت الـ Service Worker وحفظ الملفات في الـ Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA] Caching app shell assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// تنظيف ملفات الكاش القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[PWA] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// الاستجابة للطلبات أثناء غياب التغطية (Offline)
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات Firebase WebSocket/REST لتفادي التداخل
  if (event.request.url.includes('firebaseio.com') || event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
