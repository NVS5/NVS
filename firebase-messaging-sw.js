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

// استقبال الإشعار في الخلفية
messaging.onBackgroundMessage((payload) => {
  // الاعتماد على payload.data لتجنب إظهار المتصفح للإشعار تلقائياً وبشكل مكرر
  const notificationTitle = payload.data?.title || 'Nova Smart 🚨';
  const targetUrl = payload.data?.url || 'https://nvs5.github.io/NVS/index.html';

  const notificationOptions = {
    body: payload.data?.body || 'تنبيه جديد من النظام',
    icon: '/NVS/icon.png',
    data: {
      url: targetUrl
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// فتح الرابط عند النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || 'https://nvs5.github.io/NVS/index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // التركيز على النافذة إذا كانت مفتوحة مسبقاً
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // فتح نافذة جديدة بالرابط إذا كانت الصفحة مغلقة
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
