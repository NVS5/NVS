// ======================================================
// Nova Smart Service Worker
// PWA + Web Push
// ======================================================


// ======================================================
// INSTALL
// ======================================================

self.addEventListener("install", event => {
    console.log("[sw.js] Service Worker installed");

    self.skipWaiting();
});


// ======================================================
// ACTIVATE
// ======================================================

self.addEventListener("activate", event => {

    console.log("[sw.js] Service Worker activated");

    event.waitUntil(
        self.clients.claim()
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
            "[sw.js] Push data is not JSON"
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
            "nova-water-alert",

        renotify: true,

        data: {
            url:
                data.url ||
                "/"
        }
    };


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


        const url =
            event.notification.data?.url ||
            "/";


        event.waitUntil(

            self.clients
                .matchAll({
                    type: "window",
                    includeUncontrolled: true
                })

                .then(clientList => {

                    for (
                        const client
                        of clientList
                    ) {

                        if (
                            "focus"
                            in client
                        ) {

                            return client
                                .focus();
                        }
                    }


                    if (
                        self.clients.openWindow
                    ) {

                        return self.clients
                            .openWindow(url);
                    }

                })

        );

    }
);
