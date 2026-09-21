const CACHE_NAME = "nova-smart-v4";

const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo.png"
];

// ================================
// INSTALL
// ================================
self.addEventListener("install", event => {
  console.log("[Nova Smart] Service Worker installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error("[Nova Smart] Cache error:", error);
      })
  );
});

// ================================
// ACTIVATE
// ================================
self.addEventListener("activate", event => {
  console.log("[Nova Smart] Service Worker activated");

  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ================================
// FETCH
// ================================
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request);
      })
  );
});

// ================================
// PUSH NOTIFICATION
// ================================
self.addEventListener("push", event => {

  let data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error(
      "[Nova Smart] Push data JSON error:",
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

  const iconUrl = new URL(
    data.icon || "/logo.png",
    self.location.origin
  ).href;

  const badgeUrl = new URL(
    data.badge || "/logo.png",
    self.location.origin
  ).href;

  const options = {

    body: data.body || "لديك تنبيه جديد",

    icon: iconUrl,

    badge: badgeUrl,

    tag: data.tag || "nova-smart-water",

    renotify: true,

    vibrate: [200, 100, 200],

    dir: "rtl",

    lang: "ar",

    data: {
      url: data.url || "/index.html"
    }
  };

  event.waitUntil(
    self.registration
      .showNotification(title, options)
  );
});

// ================================
// NOTIFICATION CLICK
// ================================
self.addEventListener("notificationclick", event => {

  event.notification.close();

  const targetUrl =
    event.notification.data?.url ||
    "/index.html";

  event.waitUntil(

    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    })

    .then(clientList => {

      for (const client of clientList) {

        if (
          client.url.startsWith(self.location.origin) &&
          "focus" in client
        ) {

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
