// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

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

// معالجة واستقبال الإشعار في الخلفية
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || 'Nova Smart 🚨';
  const body = payload.notification?.body || payload.data?.body || 'تنبيه جديد من النظام';
  const targetUrl = payload.data?.url || 'https://nvs5.github.io/NVS/index.html';

  const notificationOptions = {
    body: body,
    icon: '/NVS/logo.png',
    badge: '/NVS/logo.png',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    data: {
      url: targetUrl
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// التعامل مع النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || 'https://nvs5.github.io/NVS/index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
