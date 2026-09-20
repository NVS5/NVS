self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // تمرير الطلبات مباشرة لضمان تحديثات الفايربيز اللحظية
  e.respondWith(fetch(e.request));
});
