// استيراد مكتبات Firebase Messaging لـ Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// تهيئة Firebase داخل الـ Service Worker
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

// الأكواد الأساسية الخاصة بك للتثبيت والتمرير اللحظي
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});

// استقبال الإشعار في الخلفية عند إغلاق الموقع وإظهاره بالصيغة المطلوبة
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'NVS';
  const options = {
    body: payload.notification?.body || '⚠️ Low water level 💧',
    icon: 'logo.png',
    badge: 'logo.png',
    vibrate: [200, 100, 200],
    tag: 'water-alert',
    renotify: true
  };

  self.registration.showNotification(title, options);
});

// فتح الموقع عند نقر العميل على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
