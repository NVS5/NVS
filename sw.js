const CACHE_NAME = "nova-smart-v5";

self.addEventListener("install", event => {
  console.log("[Nova Smart] SW installing");
  event.waitUntil(
    self.skipWaiting()
  );
});

self.addEventListener("activate", event => {
  console.log("[Nova Smart] SW activated");
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener("push", event => {
  console.log("[Nova Smart] Push received");

  let data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error(
      "[Nova Smart] Push JSON error:",
      error
    );

    data = {
      title: "Nova Smart",
      body: event.data
        ? event.data.text()
        : "لديك تنبيه جديد"
    };
  }

  const title = data.title || "Nova Smart";

  // استخدام المسار الصحيح للمشروع على GitHub Pages (/NVS/)
  const baseUrl = self.location.origin + "/NVS";

  const options = {
    body: data.body || "لديك تنبيه جديد",

    // المسار الصحيح للوجو الملون داخل مجلد NVS
    icon: data.icon || `${baseUrl}/logo.png`,

    // أيقونة شريط الحالة العلوي في أندرويد (يفضل أن تكون صورة PNG شفافة)
    badge: data.badge || `${baseUrl}/logo.png`,

    tag: data.tag || "nova-smart-water",

    renotify: true,

    vibrate: [200, 100, 200],

    dir: "rtl",

    lang: "ar",

    data: {
      url: data.url || `${baseUrl}/index.html`
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const baseUrl = self.location.origin + "/NVS";
  const targetUrl = event.notification.data?.url || `${baseUrl}/index.html`;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    })
    .then(clientList => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin)) {
          return client
            .navigate(targetUrl)
            .then(() => client.focus());
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
