importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

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

// هذه الدالة تعمل عندما يصل الإشعار والهاتف مغلق أو التطبيق بالخلفية
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Nova Smart Alert";
  const options = {
    body: payload.notification?.body || "تنبيه من نظام nova smart",
    icon: "/logo.png",
    badge: "/logo.png",
    vibrate: [200, 100, 200]
  };
  self.registration.showNotification(title, options);
});
