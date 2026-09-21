// ======================================================
// Nova Smart - Service Worker
// PWA + Web Push Notifications
// ======================================================

const CACHE_NAME = "nova-smart-v2";

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

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );

});


// ======================================================
// ACTIVATE
// ======================================================

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});


// ======================================================
// FETCH / OFFLINE CACHE
// ======================================================

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

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


// ======================================================
// WEB PUSH
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

      body:
        event.data
          ? event.data.text()
          : "لديك تنبيه جديد"

    };

  }


  // ----------------------------------------------------
  // Notification data
  // ----------------------------------------------------

  const title =
    data.title ||
    "Nova Smart";


  const options = {

    body:
      data.body ||
      "لديك تنبيه جديد",

    icon:
      data.icon ||
      "/logo.png",

    badge:
      data.badge ||
      "/logo.png",

    vibrate: [
      200,
      100,
      200
    ],

    tag:
      data.tag ||
      "nova-smart-water",

    renotify: true,

    dir: "rtl",

    lang: "ar",

    data: {

      url:
        data.url ||
        "/index.html"

    }

  };


  // ----------------------------------------------------
  // Show notification
  // ----------------------------------------------------

  event.waitUntil(

    self.registration.showNotification(
      title,
      options
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

      clients.matchAll({

        type: "window",

        includeUncontrolled: true

      })

      .then(clientList => {


        // ----------------------------------------------
        // إذا Nova Smart مفتوح
        // ----------------------------------------------

        for (const client of clientList) {

          if (
            client.url.startsWith(
              self.location.origin
            ) &&
            "focus" in client
          ) {

            return client
              .navigate(targetUrl)
              .then(() => client.focus());

          }

        }


        // ----------------------------------------------
        // إذا Nova Smart مغلق
        // ----------------------------------------------

        if (clients.openWindow) {

          return clients.openWindow(
            targetUrl
          );

        }

      })

    );

  }
);
