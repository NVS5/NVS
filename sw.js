// ======================================================
// Nova Smart - PWA Service Worker
// Version: v3
// ======================================================

const CACHE_NAME = "nova-smart-v3";

const APP_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo.png"
];

// ======================================================
// INSTALL
// ======================================================

self.addEventListener("install", event => {
  console.log("[Nova Smart] Service Worker installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_FILES);
      })
      .then(() => {
        console.log("[Nova Smart] Files cached");
        return self.skipWaiting();
      })
  );
});

// ======================================================
// ACTIVATE
// ======================================================

self.addEventListener("activate", event => {
  console.log("[Nova Smart] Service Worker activated");

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log(
                "[Nova Smart] Removing old cache:",
                cacheName
              );

              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ======================================================
// FETCH
// ======================================================

self.addEventListener("fetch", event => {

  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {

        // Return cached file if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from internet
        return fetch(event.request)
          .then(response => {

            // Don't cache bad responses
            if (
              !response ||
              response.status !== 200 ||
              response.type === "opaque"
            ) {
              return response;
            }

            // Save a copy in cache
            const responseClone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });

            return response;
          });
      })
      .catch(() => {

        // Offline fallback
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }

      })
  );
});

// ======================================================
// PUSH NOTIFICATION
// ======================================================

self.addEventListener("push", event => {

  let data = {};

  try {

    if (event.data) {
      data = event.data.json();
    }

  } catch (error) {

    console.log(
      "[Nova Smart] Push data is not JSON"
    );

    data = {
      title: "Nova Smart",
      body: event.data
        ? event.data.text()
        : "لديك تنبيه جديد"
    };
  }

  const title =
    data.title || "Nova Smart";

  const body =
    data.body || "لديك تنبيه جديد";

  // ====================================================
  // IMPORTANT:
  // This is the actual PWA logo
  // ====================================================

  const icon =
    data.icon || "/logo.png";

  const badge =
    data.badge || "/logo.png";

  const notificationOptions = {

    body: body,

    // Main notification icon
    icon: icon,

    // Small status/badge icon
    badge: badge,

    // Vibration
    vibrate: [200, 100, 200],

    // Notification grouping
    tag:
      data.tag ||
      "nova-smart-water",

    // Allow a new notification even with same tag
    renotify: true,

    // Arabic / RTL
    dir: "rtl",

    lang: "ar",

    // Data used when notification is clicked
    data: {
      url:
        data.url ||
        "/index.html"
    }
  };

  event.waitUntil(

    self.registration.showNotification(
      title,
      notificationOptions
    )

  );

});

// ======================================================
// NOTIFICATION CLICK
// ======================================================

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const targetUrl =
      event.notification.data?.url ||
      "/index.html";

    event.waitUntil(

      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true
        })

        .then(clientList => {

          // Try to use an already-open PWA
          for (const client of clientList) {

            if (
              client.url.startsWith(
                self.location.origin
              )
            ) {

              if ("focus" in client) {

                return client
                  .navigate(targetUrl)
                  .then(() => client.focus());

              }
            }
          }

          // Otherwise open a new window
          if (clients.openWindow) {
            return clients.openWindow(
              targetUrl
            );
          }

        })

    );

  }
);

// ======================================================
// NOTIFICATION CLOSE
// ======================================================

self.addEventListener(
  "notificationclose",
  event => {

    console.log(
      "[Nova Smart] Notification closed"
    );

  }
);

// ======================================================
// MESSAGE
// ======================================================

self.addEventListener(
  "message",
  event => {

    if (
      event.data &&
      event.data.type === "SKIP_WAITING"
    ) {

      self.skipWaiting();

    }

  }
);
