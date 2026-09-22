// استيراد مكتبات Firebase الخاصة بالـ Service Worker (Compat SDK v11.3.0)
importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.3.0/firebase-messaging-compat.js');

// تهيئة إعدادات Firebase الخاصة بمشروعك
firebase.initializeApp({
  apiKey: "AIzaSyDy18HXJDYsLqlgCcbnuBBa1a_av9-FyoE",
  authDomain: "smarthome-ad84f.firebaseapp.com",
  databaseURL: "https://smarthome-ad84f-default-rtdb.firebaseio.com",
  projectId: "smarthome-ad84f",
  storageBucket: "smarthome-ad84f.appspot.com",
  messagingSenderId: "849228056680",
  appId: "1:849228056680:web:09fa91eaca63dc148953dd"
});

// إنشاء كائن الـ Messaging
const messaging = firebase.messaging();

// التعامل مع الإشعارات الواردة أثناء وجود التطبيق/الموقع في الخلفية (Background)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification ? payload.notification.title : 'Nova Smart';
  const notificationOptions = {
    body: payload.notification ? payload.notification.body : 'تنبيه جديد من النظام',
    icon: '/logo.png', // تأكد من وجود ملف اللوجو في مجلد موقعك أو استبدله برابط صورة
    badge: '/logo.png',
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
